/*
  Captures worked examples: real calls on inputs we choose, kept beside the
  sample so a reader can see the checker behave on more than one case.

  The round 3 review made the point this exists to answer. The grounding
  criteria name the exact phrase from the demo case ("at the start of"), so a
  sharp reader may ask whether the prompt was tuned to that one example. The
  answer has to be a second case, run live, published whatever it returns.

  Whatever comes back is written down. If a faithful draft does not clear the
  0.90 bar, that is a finding about the criteria and it gets published as one.

    node --experimental-strip-types scripts/capture-jev-examples.mjs

  Writes lib/jev/examples.ts. Do not edit that file by hand: the screen dates
  these and calls them real.
*/
import { readFileSync, writeFileSync } from "node:fs";
import { experimental_evaluate as evaluate } from "ai";
import { JEV_AGENTS, JEV_MODEL } from "../lib/jev/questions.ts";

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i === -1) continue;
  process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim();
}

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error("AI_GATEWAY_API_KEY is not set in .env.local. Nothing captured.");
  process.exit(1);
}

/**
 * The second case for the Grounding Checker: a draft that says exactly what the
 * source says, and no more. If the criteria are sound this should pass; if they
 * only know how to fail the demo's sentence, it will not.
 */
const EXAMPLES = [
  // Faithful: every detail in the draft is in the source. These should pass.
  {
    id: "faithful-same-timing",
    agentId: "grounding-checker",
    label: "Faithful: says exactly what the source says",
    note: "The sample adds 'at the start of'. This one does not.",
    expected: "pass",
    state: {
      draft: "Your credit will be applied at the next billing cycle.",
      source: "Account credits apply at the next billing cycle.",
    },
  },
  {
    id: "faithful-reworded",
    agentId: "grounding-checker",
    label: "Faithful: same claim, different words",
    note: "Wording differs from the source, the claim does not.",
    expected: "pass",
    state: {
      draft: "Credits are applied on your next billing cycle.",
      source: "Account credits apply at the next billing cycle.",
    },
  },
  {
    id: "faithful-less-specific",
    agentId: "grounding-checker",
    label: "Faithful: less specific than the source",
    note: "Drops a condition rather than adding one. Being vaguer is not being unsupported.",
    expected: "pass",
    state: {
      draft: "Refund requests are reviewed by our support team.",
      source:
        "Refund requests made within 14 days of purchase are reviewed by our support team.",
    },
  },
  // Unsupported: the draft states something the source does not. These should fail.
  {
    id: "unsupported-added-timing",
    agentId: "grounding-checker",
    label: "Unsupported: adds a timing word",
    note: "The demo's own case. The source never says 'at the start of'.",
    expected: "fail",
    state: {
      draft: "Your credit will be applied at the start of your next billing cycle.",
      source: "Account credits apply at the next billing cycle.",
    },
  },
  {
    id: "unsupported-contradicts",
    agentId: "grounding-checker",
    label: "Unsupported: contradicts the source",
    note: "Invents a deadline the source does not give.",
    expected: "fail",
    state: {
      draft: "Your credit will be applied within 24 hours.",
      source: "Account credits apply at the next billing cycle.",
    },
  },
  {
    id: "unsupported-wrong-number",
    agentId: "grounding-checker",
    label: "Unsupported: changes a number",
    note: "Seven days against a source that says fourteen.",
    expected: "fail",
    state: {
      draft: "Refunds are reviewed within 7 days.",
      source:
        "Refund requests made within 14 days of purchase are reviewed by our support team.",
    },
  },
];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function evaluateWithRetry(spec, state, id, attempts = 5) {
  for (let attempt = 1; attempt <= attempts; attempt++) {
    try {
      // Only the successful attempt is timed. A retry wait is not latency.
      const started = Date.now();
      const result = await evaluate({
        model: JEV_MODEL,
        state,
        questions: spec.questions,
      });
      return { result, latencyMs: Date.now() - started };
    } catch (cause) {
      const message = String(cause?.message ?? cause).split("\n")[0];
      if (attempt === attempts) throw cause;
      const wait = 15000 * attempt;
      console.log(`  ${id}: attempt ${attempt} failed (${message}), waiting ${wait / 1000}s`);
      await sleep(wait);
    }
  }
}

const today = new Date().toISOString().slice(0, 10);
const captured = [];
let first = true;

for (const example of EXAMPLES) {
  const spec = JEV_AGENTS[example.agentId];
  if (!first) await sleep(16000);
  first = false;

  const { result, latencyMs } = await evaluateWithRetry(spec, example.state, example.id);
  const confidence = result.providerMetadata?.typesafe?.confidence;

  console.log(`\n=== ${example.id} on ${example.agentId} (${latencyMs} ms) ===`);
  console.log("state:", JSON.stringify(example.state, null, 2));
  console.log("answers:", JSON.stringify(result.answers, null, 2));
  console.log("confidence:", JSON.stringify(confidence ?? null));

  const answers = Object.entries(result.answers).map(([key, a]) => {
    if (a.type === "boolean") {
      return {
        key,
        type: "boolean",
        display: a.probability >= 0.5 ? "Yes" : "No",
        confidence: null,
        probability: a.probability,
      };
    }
    if (a.type === "score") {
      return {
        key,
        type: "score",
        display: a.score.toFixed(2),
        confidence: confidence?.[key] ?? null,
        probability: null,
      };
    }
    return {
      key,
      type: "choice",
      display: a.choice,
      confidence: confidence?.[key] ?? null,
      probability: null,
    };
  });

  const threshold = spec.passThreshold;
  const primary = answers.find((a) => a.key === spec.primary);
  if (threshold !== undefined && primary?.probability !== null) {
    const passed = primary.probability >= threshold;
    console.log(
      `verdict: ${primary.probability} against a bar of ${threshold} -> ${passed ? "PASSES" : "DOES NOT PASS"}`,
    );
  }

  captured.push({
    id: example.id,
    agentId: example.agentId,
    label: example.label,
    note: example.note,
    expected: example.expected,
    state: example.state,
    capturedOn: today,
    latencyMs,
    answers,
  });
}

const file = `import type { JevAgentId, JevAnswer } from "./questions";

/**
 * Worked examples, captured from real calls by scripts/capture-jev-examples.mjs
 * on ${today}.
 *
 * These sit beside the sample in the inspector so the checker can be seen on
 * more than the one case its criteria mention by name. Do not edit by hand:
 * the screen dates these and calls them real.
 */

export type JevExample = {
  id: string;
  agentId: JevAgentId;
  label: string;
  note: string;
  /** What a correct checker should do with this input. */
  expected: "pass" | "fail";
  state: Record<string, string>;
  capturedOn: string;
  latencyMs: number;
  answers: JevAnswer[];
};

export const JEV_EXAMPLES: JevExample[] = ${JSON.stringify(captured, null, 2)};

export function examplesFor(id: JevAgentId) {
  return JEV_EXAMPLES.filter((e) => e.agentId === id);
}
`;

writeFileSync("lib/jev/examples.ts", file);
console.log(`\nWrote lib/jev/examples.ts with ${captured.length} worked example(s) from ${today}.`);
