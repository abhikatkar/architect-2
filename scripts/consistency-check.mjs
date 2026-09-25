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
import {
  ledgerSpend,
  conversationTotal,
  failureSpend,
  buildTotal,
} from "../lib/seed/totals.ts";

const money = (n) => `$${n.toFixed(2)}`;
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
  ["failure.rollbackTo", p.failure.rollbackTo],
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

const failedCount = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(56)} ${r.detail}`);
}
console.log(
  `\n${results.length - failedCount} of ${results.length} invariants hold.`,
);
process.exit(failedCount ? 1 : 0);
