/*
  Consistency check for the demo fixtures.

  A cold review found numbers on screen contradicting each other: the deploy
  list summed to $2.43 beside a footer reading $3.43, a rollback offered to a
  version that did not exist, and a stage charged $0.00 still counted $0.62
  toward a total. In a submission whose thesis is "show your evidence", totals
  that disagree cost more than the screens they sit on.

  So the invariants are asserted here rather than trusted. Run before every
  commit:

    node scripts/consistency-check.mjs

  Exits non-zero on any violation, so it can gate a commit rather than be
  advice. Numbers that are sums must be derived at render time (D36); this
  catches the case where a stored figure drifts from its parts anyway.
*/
import { DEMO_PROJECT as p } from "../lib/seed/northwind.ts";
import { buildsAttempted } from "../lib/seed/totals.ts";
import {
  JEV_AGENT_IDS,
  JEV_MODEL,
  JEV_AGENTS,
  GROUNDING_PASS_THRESHOLD,
} from "../lib/jev/questions.ts";
import { JEV_EXAMPLES } from "../lib/jev/examples.ts";
import { changeRequests, codeFiles, CHECKS } from "../lib/seed/code.ts";
import { REAL_CHANGE } from "../lib/seed/real-change.ts";
import { GROUNDING_QUESTIONS } from "../lib/jev/questions.ts";
import { addedLines, allDiffIds, changedFileCount } from "../lib/seed/totals.ts";
import {
  ledgerSpend,
  conversationTotal,
  failureSpend,
  buildTotal,
} from "../lib/seed/totals.ts";

const money = (n) => `$${n.toFixed(2)}`;
const round = (n) => Math.round(n * 100) / 100;
const results = [];

function check(name, ok, detail) {
  results.push({ name, ok, detail });
}

const labels = new Set(p.versions.map((v) => v.label));

// 1. Every total equals the parts it totals.
check(
  "spend is derived, never stored beside the parts it sums",
  !("spend" in p.ledger),
  `${money(ledgerSpend(p))} from ${p.versions.length} versions`,
);

check(
  "every listed version has a positive cost and a unique label",
  p.versions.every((v) => v.cost > 0) && labels.size === p.versions.length,
  `${p.versions.length} versions`,
);

check(
  "the preview version is the newest one listed",
  Math.max(...p.versions.map((v) => Number(v.label.slice(1)))) ===
    Number(p.ledger.previewVersion.slice(1)),
  `newest listed is ${p.ledger.previewVersion}`,
);

check(
  "the help article count matches the number the plan quotes",
  p.plan.points.some((t) => t.includes(String(p.helpArticleCount))),
  `${p.helpArticleCount} articles`,
);

check(
  "the conversations sample is no larger than the total it samples",
  p.conversations.length <= conversationTotal(p),
  `${p.conversations.length} shown of ${conversationTotal(p)}`,
);

// 2. Every version referenced anywhere actually exists.
for (const [where, label] of [
  ["ledger.previewVersion", p.ledger.previewVersion],
  ["ledger.productionVersion", p.ledger.productionVersion],
  ["fix.previousVersion", p.fix.previousVersion],
]) {
  check(`${where} names a listed version`, labels.has(label), `${label}`);
}

// 3. The build's own arithmetic, and the estimate that was promised.
const v1 = p.versions.find((v) => v.label === "v1");
check(
  "build stage costs sum to the v1 cost",
  v1 !== undefined && buildTotal(p) === v1.cost,
  `${money(buildTotal(p))} against v1 at ${v1 ? money(v1.cost) : "missing"}`,
);

const est = p.plan.estimate;
check(
  "the actual build cost falls inside the estimate shown beforehand",
  buildTotal(p) >= est.low && buildTotal(p) <= est.high,
  `${money(buildTotal(p))} inside ${money(est.low)} to ${money(est.high)}`,
);

// 4. A stage charged nothing must cost nothing.
const failed = p.stages.find((s) => s.name === p.failure.stageName);
const expected = +p.stages
  .slice(0, p.stages.indexOf(failed))
  .reduce((sum, s) => sum + s.cost, 0)
  .toFixed(2);
check(
  "fix.newVersion is not yet listed, because applying it is what creates it",
  !labels.has(p.fix.newVersion),
  `${p.fix.newVersion} appears once applied`,
);

check(
  "applying the fix adds exactly its own cost",
  ledgerSpend(p, true) === +(ledgerSpend(p) + p.fix.cost).toFixed(2),
  `${money(ledgerSpend(p))} to ${money(ledgerSpend(p, true))}`,
);

check(
  "the failure total excludes the stage that was charged $0.00",
  failureSpend(p) === expected,
  `${money(failureSpend(p))}, excluding ${failed?.name} at ${money(failed?.cost ?? 0)}`,
);

// 5. The demo tells one version story.
check(
  "preview is ahead of production",
  Number(p.ledger.previewVersion.slice(1)) >
    Number(String(p.ledger.productionVersion).slice(1)),
  `preview ${p.ledger.previewVersion}, live ${p.ledger.productionVersion}`,
);

// 15b. The version numbers account for themselves.
//
// Round 3 asked why the deploy list skips v2, v4, v7, v10 and v13. A gap in a
// list of numbers is a question, and "some builds did not deploy" is only half
// an answer: the other half is what they cost. They are $0.00 each, by the same
// rule the failed stage follows, and the total is checked to include them.
const deployedLabels = p.versions.map((v) => v.label);
const discardedLabels = p.discarded.map((v) => v.label);
const allNumbers = [...deployedLabels, ...discardedLabels]
  .map((l) => Number(String(l).slice(1)))
  .sort((a, b) => a - b);

check(
  "every version number from 1 to the highest is accounted for",
  allNumbers.length === allNumbers[allNumbers.length - 1] &&
    allNumbers.every((n, i) => n === i + 1),
  `${allNumbers.length} numbers, 1 to ${allNumbers[allNumbers.length - 1]}, no gaps`,
);

check(
  "no version number is both deployed and discarded",
  discardedLabels.every((l) => !deployedLabels.includes(l)),
  `${deployedLabels.length} deployed, ${discardedLabels.length} discarded`,
);

check(
  "every discarded build is charged $0.00 and says why",
  p.discarded.every((v) => v.cost === 0 && typeof v.reason === "string" && v.reason.length > 10),
  "the platform did not deliver a working app",
);

check(
  "the month's spend accounts for the discarded builds, not just the deployed ones",
  ledgerSpend(p) ===
    round(
      p.versions.reduce((sum, v) => sum + v.cost, 0) +
        p.discarded.reduce((sum, v) => sum + v.cost, 0),
    ),
  `${money(ledgerSpend(p))} over ${buildsAttempted(p)} builds, ${p.versions.length} of them deployed`,
);

// 16. An agent's config file names the model it actually calls.
//
// This drifted unnoticed for a whole slice: the three decision agents called
// Jev while the config file shown beside them still read a language model, and
// only a cold reader opening the Code tab would have caught it.
const jevAgents = p.agents.filter((a) => JEV_AGENT_IDS.includes(a.id));
const languageAgents = p.agents.filter((a) => !JEV_AGENT_IDS.includes(a.id));

check(
  "every decision agent's config file names the decision model",
  jevAgents.length === JEV_AGENT_IDS.length &&
    jevAgents.every((a) => a.configFile.includes(`model: ${JEV_MODEL}`)),
  `${jevAgents.length} agents on ${JEV_MODEL}`,
);

check(
  "no language-model agent claims to run on the decision model",
  languageAgents.every((a) => !a.configFile.includes(JEV_MODEL)),
  `${languageAgents.map((a) => a.name).join(", ")} on a language model`,
);

check(
  "no decision agent's config file sets a temperature",
  jevAgents.every((a) => !a.configFile.includes("temperature")),
  "a decision model has no temperature to set",
);

// 16b. The grounding bar still separates the labeled examples.
//
// The bar was 0.90 until six real drafts showed a faithful one tops out at
// 0.83, so the bar escalated everything. It is 0.60 now. This asserts the
// number still does its job, so it cannot drift back to a value that passes a
// draft we labeled unsupported, or fails one we labeled faithful.
const graded = JEV_EXAMPLES.filter((e) => e.agentId === "grounding-checker");
const wrong = graded.filter((e) => {
  const primary = e.answers.find((a) => a.key === JEV_AGENTS[e.agentId].primary);
  const passes = (primary?.probability ?? 0) >= GROUNDING_PASS_THRESHOLD;
  return passes !== (e.expected === "pass");
});

check(
  "the grounding bar puts every worked example on its expected side",
  graded.length >= 6 && wrong.length === 0,
  `${graded.length} examples, ${wrong.length} on the wrong side of ${GROUNDING_PASS_THRESHOLD}`,
);

check(
  "the worked examples cover both outcomes, not just the failing one",
  graded.some((e) => e.expected === "pass") && graded.some((e) => e.expected === "fail"),
  `${graded.filter((e) => e.expected === "pass").length} faithful, ${graded.filter((e) => e.expected === "fail").length} unsupported`,
);

// 17. The build count in the footer is derived, not written down.
check(
  "the build count is not a stored string",
  !("builtAgo" in p.ledger),
  `${p.versions.length} versions, counted at render time`,
);

// 18. Nothing offers a rollback target that the first build cannot have.
check(
  "the failure state does not name a rollback version",
  !("rollbackTo" in p.failure),
  "the first build has nothing behind it",
);

// 19. The Code tab. Nothing here is stored that could be counted instead.
const files = codeFiles(p);
const changes = changeRequests(p);
const diffIds = allDiffIds(changes);
const filePaths = new Set(files.map((f) => f.path));
const fileIds = new Set(files.map((f) => f.id));

check(
  "every changed file exists in the file tree",
  changes.every((c) => c.diffs.every((d) => fileIds.has(d.fileId))),
  `${diffIds.length} diffs across ${changes.length} requests`,
);

check(
  "no change stores a file count beside the files it lists",
  changes.every((c) => !("files" in c) && changedFileCount(c) === c.diffs.length),
  changes.map((c) => `${c.message.slice(0, 18)}: ${changedFileCount(c)}`).join(", "),
);

check(
  "every diff id is unique and url safe",
  new Set(diffIds).size === diffIds.length && diffIds.every((id) => /^[a-z0-9-]+$/.test(id)),
  `${diffIds.length} ids, dot separated in the address`,
);

check(
  "the github consent line counts the files a reviewer can browse",
  Number((p.copy.githubConsent.match(/push (\d+) files/) ?? [])[1]) === files.length,
  `${files.length} files in the tree`,
);

// 20. The pending fix is the same change in all three places it appears.
const pending = changes.find((c) => c.id === "7be0d15");
const answer = p.agents.find((a) => a.id === "answer");
const tempRow = pending?.diffs[0].rows.find((r) => r.kind === "mod");

check(
  "the code tab's fix diff is derived from the agent's own settings",
  tempRow?.old.text === `temperature: ${answer.settings.temperature}` &&
    tempRow?.new.text === `temperature: ${answer.settings.temperatureAfterFix}`,
  `${tempRow?.old.text} to ${tempRow?.new.text}`,
);

check(
  "the code tab and the run trace describe the same change",
  p.trace.diff.includes(
    `temperature: ${answer.settings.temperature} -> ${answer.settings.temperatureAfterFix}`,
  ) && addedLines(pending.diffs[0]) === 2,
  "one parameter moved, one rule added",
);

check(
  "the fix change carries no version until it is applied",
  changeRequests(p, false)[0].version === null &&
    changeRequests(p, true)[0].version === p.fix.newVersion,
  `null, then ${p.fix.newVersion}`,
);

// 21. The one real artifact on the screen still matches the source it came from.
check(
  "the captured real change still matches the live grounding criteria",
  REAL_CHANGE.afterInstructions.includes(
    GROUNDING_QUESTIONS.grounded.instructions.slice(0, 60),
  ),
  `${REAL_CHANGE.shortSha}, regenerate with scripts/capture-real-change.mjs`,
);

check(
  "checks report a state and a word, and pass counts are derived",
  CHECKS.every((c) => c.state === "pass" || c.state === "fail") &&
    CHECKS.every((c) => c.ms > 0),
  `${CHECKS.filter((c) => c.state === "pass").length} of ${CHECKS.length} pass`,
);

const failedCount = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(56)} ${r.detail}`);
}
console.log(
  `\n${results.length - failedCount} of ${results.length} invariants hold.`,
);
process.exit(failedCount ? 1 : 0);
