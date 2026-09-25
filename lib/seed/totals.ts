import type { DemoProject } from "./types";

/**
 * Every total in the product, derived from its parts.
 *
 * A cold review caught a deploy list summing to $2.43 beside a footer reading
 * $3.43. The cause was that both numbers were written by hand, in different
 * places, and nothing made them agree. Nothing here is stored: each function
 * computes from the fixture rows that make it up, so the two cannot drift
 * again. See D36.
 *
 * These take the project rather than importing it, so the consistency check can
 * run them under plain Node without a bundler resolving the import for it.
 */

const round = (n: number) => +n.toFixed(2);

/**
 * Spend this month, which is exactly the versions that were built.
 *
 * Applying the reliability fix creates one more version, so it adds its cost.
 * Before that it has not been spent and is shown as an estimate instead.
 */
export function ledgerSpend(p: DemoProject, fixApplied = false): number {
  const built = p.versions.reduce((sum, v) => sum + v.cost, 0);
  return round(fixApplied ? built + p.fix.cost : built);
}

/** The newest version in preview, which the applied fix advances. */
export function previewVersion(p: DemoProject, fixApplied = false): string {
  return fixApplied ? p.fix.newVersion : p.ledger.previewVersion;
}

/** The first build, which is the sum of its stages. */
export function buildTotal(p: DemoProject): number {
  return round(p.stages.reduce((sum, s) => sum + s.cost, 0));
}

/**
 * What a failed build actually cost.
 *
 * The stage that failed was charged $0.00, so it contributes nothing. Counting
 * it was the contradiction the review found: "Charged $0.00" sitting beside a
 * total that included the charge.
 */
export function failureSpend(p: DemoProject): number {
  const failedAt = p.stages.findIndex((s) => s.name === p.failure.stageName);
  if (failedAt === -1) return buildTotal(p);
  return round(p.stages.slice(0, failedAt).reduce((sum, s) => sum + s.cost, 0));
}

/** Spend up to and including a given stage index, for the running build rail. */
export function spendThrough(p: DemoProject, index: number): number {
  return round(p.stages.slice(0, index).reduce((sum, s) => sum + s.cost, 0));
}

/** Total conversations, which is the status counts added up. */
export function conversationTotal(p: DemoProject): number {
  return p.counts.open + p.counts.resolved + p.counts.escalated;
}
