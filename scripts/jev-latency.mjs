/*
  Measures what we publish about Jev: latency, tokens and cost per call.

  The AI SDK returns no timing, so latency is wall clock measured here around
  the evaluate call and includes network time to the Gateway. Token counts come
  from the provider's own usage field, and the price comes from the Gateway's
  models endpoint, so the cost below is arithmetic on two real numbers rather
  than an estimate.

  Run:

    node --experimental-strip-types scripts/jev-latency.mjs [callsPerAgent]

  Defaults to 5 calls per agent, so 15 calls in total. At the prices below that
  is a fraction of a cent. Only successful calls enter the median: a failed call
  times a round trip to an error, which is not a measurement of the model.
*/
import { readFileSync } from "node:fs";
import { experimental_evaluate as evaluate } from "ai";
import { JEV_AGENTS, JEV_AGENT_IDS, JEV_MODEL } from "../lib/jev/questions.ts";

/** From https://ai-gateway.vercel.sh/v1/models, read 2026-09-26. Output is free. */
const INPUT_PRICE_PER_TOKEN = 0.000000042;

for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  if (!line.trim() || line.trim().startsWith("#")) continue;
  const i = line.indexOf("=");
  if (i === -1) continue;
  process.env[line.slice(0, i).trim()] ??= line.slice(i + 1).trim();
}

if (!process.env.AI_GATEWAY_API_KEY) {
  console.error("AI_GATEWAY_API_KEY is not set in .env.local. Nothing measured.");
  process.exit(1);
}

const perAgent = Number(process.argv[2] ?? 5);
const rows = [];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

/*
  The Gateway advertises a small per-window request limit for this model
  (x-ratelimit-limit-requests: 5, reset about 15s) and its upstream provider
  returns 503 under load. Calls are spaced and retried so a measurement run is
  not lost to a transient upstream. Only the successful attempt is timed: a
  retry wait is not latency.
*/

for (const id of JEV_AGENT_IDS) {
  const spec = JEV_AGENTS[id];
  for (let n = 0; n < perAgent; n++) {
    let done = false;
    for (let attempt = 1; attempt <= 4 && !done; attempt++) {
      const started = Date.now();
      try {
        const result = await evaluate({
          model: JEV_MODEL,
          state: spec.sampleState,
          questions: spec.questions,
        });
        rows.push({
          agent: id,
          ok: true,
          latencyMs: Date.now() - started,
          inputTokens: result.usage?.inputTokens ?? null,
          outputTokens: result.usage?.outputTokens ?? null,
        });
        done = true;
      } catch (cause) {
        const message =
          cause instanceof Error ? cause.message.split("\n")[0] : "failed";
        if (attempt === 4) {
          rows.push({ agent: id, ok: false, latencyMs: null, error: message });
          done = true;
        } else {
          await sleep(16000 * attempt);
        }
      }
    }
    await sleep(4000);
  }
}

function median(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : Math.round((sorted[mid - 1] + sorted[mid]) / 2);
}

const ok = rows.filter((r) => r.ok);
const failed = rows.filter((r) => !r.ok);

console.log(`\n${rows.length} calls, ${ok.length} succeeded, ${failed.length} failed\n`);

for (const id of JEV_AGENT_IDS) {
  const mine = ok.filter((r) => r.agent === id);
  if (!mine.length) {
    console.log(`${id}: no successful calls`);
    continue;
  }
  const lat = mine.map((r) => r.latencyMs);
  const inTok = mine.map((r) => r.inputTokens);
  const cost = median(inTok) * INPUT_PRICE_PER_TOKEN;
  console.log(
    `${id.padEnd(18)} n=${mine.length}  median ${String(median(lat)).padStart(5)} ms  ` +
      `range ${Math.min(...lat)} to ${Math.max(...lat)} ms  ` +
      `input tokens ${Math.min(...inTok)} to ${Math.max(...inTok)}  ` +
      `cost $${cost.toFixed(8)} per call`,
  );
}

const allLat = ok.map((r) => r.latencyMs);
const allIn = ok.reduce((sum, r) => sum + r.inputTokens, 0);
const allOut = ok.reduce((sum, r) => sum + r.outputTokens, 0);

console.log(`\nAcross all successful calls:`);
console.log(`  median latency   ${median(allLat)} ms, range ${Math.min(...allLat)} to ${Math.max(...allLat)} ms`);
console.log(`  first call       ${ok[0].latencyMs} ms, which carries connection setup`);
console.log(`  median latency excluding the first call: ${median(allLat.slice(1))} ms`);
console.log(`  input tokens     ${allIn} total, ${Math.round(allIn / ok.length)} mean per call`);
console.log(`  output tokens    ${allOut} total, billed at $0`);
console.log(`  total spend      $${(allIn * INPUT_PRICE_PER_TOKEN).toFixed(8)} for ${ok.length} calls`);
console.log(`  cost per call    $${((allIn / ok.length) * INPUT_PRICE_PER_TOKEN).toFixed(8)} at the mean`);
console.log(`  calls per dollar ${Math.round(1 / ((allIn / ok.length) * INPUT_PRICE_PER_TOKEN)).toLocaleString("en-US")}`);

for (const f of failed) console.log(`  failed: ${f.agent}: ${f.error}`);
