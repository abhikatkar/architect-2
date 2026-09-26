import type {
  ChangeRequest,
  DemoProject,
  DiffRow,
  FileDiff,
} from "./types";

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
  // Discarded builds are summed rather than skipped. They are $0.00 each, so
  // this adds nothing, and that is the point: the total accounts for all 14
  // numbers, not only the 9 that shipped.
  const discarded = p.discarded.reduce((sum, v) => sum + v.cost, 0);
  return round(fixApplied ? built + discarded + p.fix.cost : built + discarded);
}

/** Every version number taken this month, deployed or not. */
export function buildsAttempted(p: DemoProject): number {
  return p.versions.length + p.discarded.length;
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

/* Code tab. Nothing below is stored in the fixture: it is all counted. */

/** Files a request touched. The fixture never carries a file count. */
export function changedFileCount(change: ChangeRequest): number {
  return change.diffs.length;
}

export function addedLines(diff: FileDiff): number {
  return diff.rows.filter((r: DiffRow) => r.kind === "add" || r.kind === "mod").length;
}

export function removedLines(diff: FileDiff): number {
  return diff.rows.filter((r: DiffRow) => r.kind === "del" || r.kind === "mod").length;
}

/** Every diff id in the project, in fixture order, which is the URL order. */
export function allDiffIds(changes: ChangeRequest[]): string[] {
  return changes.flatMap((c) => c.diffs.map((d) => d.id));
}

/**
 * A request has no verdict of its own. It reads back from its files, so a
 * request can never say "accepted" while a file inside it says "reverted".
 */
export function requestVerdict(
  change: ChangeRequest,
  accepted: string[],
  reverted: string[],
): "accepted" | "reverted" | "mixed" | "open" {
  const ids = change.diffs.map((d) => d.id);
  const a = ids.filter((id) => accepted.includes(id)).length;
  const r = ids.filter((id) => reverted.includes(id)).length;
  if (a === ids.length) return "accepted";
  if (r === ids.length) return "reverted";
  if (a + r === 0) return "open";
  return "mixed";
}

/** Checks pass count, counted rather than written down. */
export function checksPassed(checks: { state: "pass" | "fail" }[]): number {
  return checks.filter((c) => c.state === "pass").length;
}

/* Applying changes. Version numbers must not depend on the order you click. */

/**
 * The highest version number taken this month, deployed or discarded.
 *
 * Numbering starts from here, so a new version never collides with one that
 * already exists and never fills a gap that a failed build consumed.
 */
export function highestVersionNumber(p: DemoProject): number {
  const labels = [
    ...p.versions.map((v) => v.label),
    ...p.discarded.map((v) => v.label),
  ];
  return Math.max(...labels.map((l) => Number(String(l).slice(1))));
}

/**
 * Changes that have not landed yet, in fixture order.
 *
 * Fixture order is the whole point. A version number is assigned by a change's
 * position in this list, never by the order someone accepted things, so the
 * same set of decisions always produces the same numbers and the same total.
 * Two people sharing a link see the same thing, and a shared link is the only
 * way this demo carries state at all.
 */
export function pendingChanges(changes: ChangeRequest[]): ChangeRequest[] {
  return changes.filter((c) => c.version === null);
}

/** The version a pending change becomes, decided by position, not by clicks. */
export function versionForPending(
  p: DemoProject,
  changes: ChangeRequest[],
  changeId: string,
): string {
  const index = pendingChanges(changes).findIndex((c) => c.id === changeId);
  if (index === -1) return "";
  return `v${highestVersionNumber(p) + index + 1}`;
}

/** A pending change lands when every file in it has been accepted. */
export function isApplied(change: ChangeRequest, accepted: string[]): boolean {
  return change.diffs.length > 0 && change.diffs.every((d) => accepted.includes(d.id));
}

/** Pending changes that have landed, in fixture order. */
export function appliedPending(
  changes: ChangeRequest[],
  accepted: string[],
): ChangeRequest[] {
  return pendingChanges(changes).filter((c) => isApplied(c, accepted));
}

/**
 * The preview version after any pending changes have been accepted.
 *
 * This is F6's last hop: accepting in the Code tab moves the version on Deploy,
 * and both read the same parameters rather than keeping two ideas of the truth.
 */
export function previewAfter(
  p: DemoProject,
  changes: ChangeRequest[],
  accepted: string[],
): string {
  const applied = appliedPending(changes, accepted);
  if (applied.length === 0) return p.ledger.previewVersion;
  const last = applied[applied.length - 1];
  return versionForPending(p, changes, last.id);
}

/** Spend once pending changes are counted, still derived from their parts. */
export function spendAfter(
  p: DemoProject,
  changes: ChangeRequest[],
  accepted: string[],
): number {
  const base = ledgerSpend(p);
  const added = appliedPending(changes, accepted).reduce(
    (sum, c) => sum + (c.cost ?? 0),
    0,
  );
  return round(base + added);
}

/** Versions a rollback can target: the ones that exist and are not already live. */
export function rollbackTargets(p: DemoProject) {
  return p.versions.filter((v) => !v.live);
}

/** What reverts if you roll back to a given version. */
export function revertedBy(p: DemoProject, target: string) {
  const targetNumber = Number(target.slice(1));
  return p.versions.filter((v) => Number(v.label.slice(1)) > targetNumber);
}
