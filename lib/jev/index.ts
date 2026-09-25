import "server-only";

import { experimental_evaluate as evaluate } from "ai";
import { createHash } from "node:crypto";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import {
  JEV_AGENTS,
  JEV_MODEL,
  type JevAgentId,
  type JevAnswer,
} from "./questions";
import { RECORDED, hasRecorded } from "./recorded";

/**
 * The one place Jev is called.
 *
 * server-only, so a careless import can never pull the key into a client
 * bundle. The key is read inside the function rather than at module scope,
 * matching lib/supabase/env.ts, so a build without it cannot fail at import
 * time.
 *
 * Two things the docs are explicit about, and this file respects:
 *
 * 1. Confidence exists only for choice and score answers, at
 *    providerMetadata.typesafe.confidence. Boolean returns `probability`,
 *    which is P(true) and NOT a confidence. They are kept separate all the way
 *    to the UI rather than being flattened into one word.
 * 2. No latency is returned. What we report is wall-clock measured here, and
 *    it is described as exactly that.
 */

/** The documented cost ceiling. See D38. */
export const RATE_LIMIT_PER_IP_PER_HOUR = 10;
export const DAILY_CALL_CAP = 300;

const MAX_CUSTOM_INPUT = 500;

export type JevOutcome = "live" | "rate_limited" | "daily_cap" | "error";

export type JevResult = {
  outcome: JevOutcome;
  answers: JevAnswer[];
  /** Wall-clock milliseconds measured around the call, not a provider figure. */
  latencyMs: number | null;
  /** Set when the result is recorded rather than live. */
  recordedOn: string | null;
  note: string | null;
};

function hasGatewayKey() {
  return Boolean(process.env.AI_GATEWAY_API_KEY);
}

/** Salted so the stored hash is not reversible from the table alone. */
export function hashIp(ip: string) {
  const salt = process.env.JEV_IP_SALT ?? "";
  return createHash("sha256").update(`${salt}:${ip}`).digest("hex").slice(0, 64);
}

function recordedResult(agentId: JevAgentId, outcome: JevOutcome, note: string): JevResult {
  const recorded = RECORDED[agentId];
  // No captured result yet means we say so. Inventing a plausible answer and
  // labelling it "recorded" would be a claim about a call that never ran.
  if (!hasRecorded(agentId)) {
    return {
      outcome,
      answers: [],
      latencyMs: null,
      recordedOn: null,
      note: `${note} No recorded result has been captured for this agent yet, so there is nothing to show.`,
    };
  }
  return {
    outcome,
    answers: recorded.answers,
    latencyMs: recorded.latencyMs,
    recordedOn: recorded.capturedOn,
    note,
  };
}

async function countsFor(ipHash: string) {
  if (!hasSupabaseEnv()) return { ip_hour_count: 0, day_count: 0 };
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("jev_call_counts", {
    p_ip_hash: ipHash,
  });
  if (error || !data?.[0]) return { ip_hour_count: 0, day_count: 0 };
  return data[0] as { ip_hour_count: number; day_count: number };
}

async function logCall(
  agentId: JevAgentId,
  outcome: JevOutcome,
  latencyMs: number | null,
  ipHash: string,
) {
  if (!hasSupabaseEnv()) return;
  const supabase = await createClient();
  // A definer function, so this works as anon without a service role key, and
  // anon still cannot read the table. See the migration and D38.
  await supabase.rpc("log_jev_call", {
    p_agent_id: agentId,
    p_outcome: outcome,
    p_latency_ms: latencyMs,
    p_ip_hash: ipHash,
  });
}

/** Turns one provider answer into something the UI can render honestly. */
function normalise(
  key: string,
  answer: Record<string, unknown>,
  confidence: Record<string, number> | undefined,
): JevAnswer {
  const type = answer.type as JevAnswer["type"];

  if (type === "boolean") {
    const probability = Number(answer.probability ?? 0);
    return {
      key,
      type,
      display: probability >= 0.5 ? "Yes" : "No",
      // The docs are explicit that this is not a confidence, so it is not
      // reported as one.
      confidence: null,
      probability,
    };
  }

  if (type === "score") {
    return {
      key,
      type,
      display: Number(answer.score ?? 0).toFixed(2),
      confidence: confidence?.[key] ?? null,
      probability: null,
    };
  }

  return {
    key,
    type: "choice",
    display: String(answer.choice ?? ""),
    confidence: confidence?.[key] ?? null,
    probability: null,
  };
}

export async function runJevAgent(
  agentId: JevAgentId,
  customInput: string | null,
  ip: string,
): Promise<JevResult> {
  const ipHash = hashIp(ip);
  const spec = JEV_AGENTS[agentId];

  if (!hasGatewayKey()) {
    return recordedResult(
      agentId,
      "error",
      "No gateway key is configured, so this is a stored result.",
    );
  }

  const counts = await countsFor(ipHash);
  if (counts.ip_hour_count >= RATE_LIMIT_PER_IP_PER_HOUR) {
    await logCall(agentId, "rate_limited", null, ipHash);
    return recordedResult(
      agentId,
      "rate_limited",
      `That is ${RATE_LIMIT_PER_IP_PER_HOUR} live calls from here in the last hour, which is the limit. This is a stored result.`,
    );
  }
  if (counts.day_count >= DAILY_CALL_CAP) {
    await logCall(agentId, "daily_cap", null, ipHash);
    return recordedResult(
      agentId,
      "daily_cap",
      `The demo has made ${DAILY_CALL_CAP} live calls today, which is the cap. This is a stored result.`,
    );
  }

  const trimmed = (customInput ?? "").trim().slice(0, MAX_CUSTOM_INPUT);
  // A custom input replaces the first field of the sample state, so the shape
  // the questions expect is preserved.
  const stateKey = Object.keys(spec.sampleState)[0];
  const state: Record<string, string> = trimmed
    ? { ...spec.sampleState, [stateKey]: trimmed }
    : spec.sampleState;

  const started = Date.now();
  try {
    const result = await evaluate({
      model: JEV_MODEL,
      state,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      questions: spec.questions as any,
    });
    const latencyMs = Date.now() - started;

    const confidence = (
      result as unknown as {
        providerMetadata?: { typesafe?: { confidence?: Record<string, number> } };
      }
    ).providerMetadata?.typesafe?.confidence;

    const answers = Object.entries(
      result.answers as unknown as Record<string, Record<string, unknown>>,
    ).map(([key, answer]) => normalise(key, answer, confidence));

    await logCall(agentId, "live", latencyMs, ipHash);

    return { outcome: "live", answers, latencyMs, recordedOn: null, note: null };
  } catch (cause) {
    await logCall(agentId, "error", Date.now() - started, ipHash);
    const message = cause instanceof Error ? cause.message : "The call failed.";
    return recordedResult(
      agentId,
      "error",
      `The live call did not complete (${message}). This is a stored result.`,
    );
  }
}

/** Aggregates for the published metrics. No IP hashes, no per-row data. */
export async function jevStats() {
  if (!hasSupabaseEnv()) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("jev_call_stats");
  if (error || !data?.[0]) return null;
  return data[0] as {
    total_calls: number;
    live_calls: number;
    median_latency_ms: number | null;
  };
}
