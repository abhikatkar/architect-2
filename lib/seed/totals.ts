import type {
  ChangeRequest,
  DemoProject,
  DiffRow,
  FileDiff,
  Version,
} from "./types";
// The .ts extension is deliberate: the consistency check imports this module
// directly under plain Node, which does not resolve extensionless paths. The
// bundler resolves it either way.
import { changeRequests, FIX_CHANGE_ID } from "./code.ts";

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
 * Nothing pending is counted here. A change that has been accepted but not
 * deployed is added by spendAfter, which is the only place that knows what has
 * been accepted. This used to take a fixApplied flag of its own, and that flag
 * was one of the three competing derivations round 4 found.
 */
export function ledgerSpend(p: DemoProject): number {
  const built = p.versions.reduce((sum, v) => sum + v.cost, 0);
  // Discarded builds are summed rather than skipped. They are $0.00 each, so
  // this adds nothing, and that is the point: the total accounts for all 14
  // numbers, not only the 9 that shipped.
  const discarded = p.discarded.reduce((sum, v) => sum + v.cost, 0);
  return round(built + discarded);
}

/** Every version number taken this month, deployed or not. */
export function buildsAttempted(p: DemoProject): number {
  return p.versions.length + p.discarded.length;
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

/**
 * The preview conversation, after the fix has or has not been applied.
 *
 * The trace already claims the fix was re-run on the same question and came
 * back grounded 5 times out of 5. The preview went on showing the escalated
 * answer anyway, so the one screen a visitor looks at first contradicted the
 * screen that explained it. The grounded answer is not new copy: it is
 * p.fix.after, the same string the trace shows as the corrected reply.
 */
export function previewChat(p: DemoProject, fixApplied: boolean) {
  if (!fixApplied) return p.previewChat;
  return p.previewChat.map((turn) =>
    turn.escalated
      ? { from: turn.from, text: p.fix.after, groundedAfterFix: true }
      : turn,
  );
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
): "landed" | "accepted" | "reverted" | "mixed" | "open" {
  // A change with a version shipped, which is a verdict already. The Code tab
  // showed the changes behind the live and preview versions as "not decided
  // yet", as though two versions had been deployed without anyone agreeing to
  // them. Round 4.
  if (change.version) return "landed";
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

/* Where a version is, and what you can do with it. All derived. See D58, D59. */

const numberOf = (label: string) => Number(String(label).slice(1));

/**
 * Where a version is now.
 *
 * Production if it is live, preview if it is the newest thing built, nowhere
 * otherwise. This used to be a stored field, which is how v1 and v14 both came
 * to claim "preview" and how v14 kept claiming it after v15 existed.
 */
export function whereIs(
  v: Version,
  previewVersion: string,
): "production" | "preview" | "none" {
  if (v.live) return "production";
  if (v.label === previewVersion) return "preview";
  return "none";
}

/**
 * What the one control on a version's row offers.
 *
 * A rollback goes back to something that was live before. A promotion puts
 * something live that never has been. Offering "Roll back" on a version that
 * was never in production, which is what this screen did for eight of its nine
 * rows, describes an action the word does not mean.
 */
export function deployAction(
  v: Version,
  liveLabel: string,
): "live" | "rollback" | "promote" | "none" {
  if (v.live) return "live";
  if (v.wasLive) return "rollback";
  return numberOf(v.label) > numberOf(liveLabel) ? "promote" : "none";
}

/** Versions a rollback can target: the ones that were in production before. */
export function rollbackTargets(p: DemoProject) {
  return p.versions.filter((v) => !v.live && v.wasLive);
}

/**
 * What reverts if you roll back to a given version.
 *
 * Only versions that were in production count. Listing preview-only versions
 * here produced the contradiction the review found: v14 named under "What
 * reverts" directly above a line saying v14 stays in preview. Nothing about a
 * version that was never live changes when production moves.
 */
export function revertedBy(p: DemoProject, target: string) {
  return p.versions.filter(
    (v) => (v.live || v.wasLive) && numberOf(v.label) > numberOf(target),
  );
}

/** What a promotion would put in front of people: everything newer than live. */
export function newerThanProduction(rows: Version[], liveLabel: string) {
  return rows.filter((v) => numberOf(v.label) > numberOf(liveLabel));
}

/** Deploys to production this month, which is the only honest use of the word. */
export function productionDeploys(p: DemoProject): number {
  return p.versions.filter((v) => v.live || v.wasLive).length;
}

/**
 * Spend before a given version existed.
 *
 * The plan gate showed the month's whole spend as "already spent" while
 * reviewing the first build, which counted that build's own cost against it.
 * Before v1 nothing has been spent, and this says so by summing what came
 * earlier rather than by special casing the first one.
 */
export function spentBefore(p: DemoProject, label: string): number {
  const earlier = [...p.versions, ...p.discarded].filter(
    (v) => numberOf(v.label) < numberOf(label),
  );
  return round(earlier.reduce((sum, v) => sum + v.cost, 0));
}

/** Whether a build would cross the cap. Arithmetic, so the gate never guesses. */
export function crossesCap(spent: number, high: number, cap: number): boolean {
  return round(spent + high) > cap;
}

/*
  One derivation for "has the reliability fix landed, and what does that make
  true", used by every surface that shows a version, a deploy count or a spend.

  There are two ways to apply it. The trace's "Watch the fix being applied"
  sets fix=applied, and accepting its file in the Code tab sets accept=d6.
  They are the same change, so they have to mean the same thing. They did not:
  the Deploy panel read the accept list, the ledger bar read the fix flag, and
  the conversation rail read neither, so a page could show v15 in one place and
  v14 in another at the same time. Round 4 found it.

  Everything below is computed from the two parameters together. Nothing reads
  either one on its own any more.
*/

export type AppliedState = {
  /** The change list, built with the derived flag so its labels agree too. */
  changes: ChangeRequest[];
  /** Diff ids that count as accepted, including any implied by fix=applied. */
  accepted: string[];
  /** Diff ids explicitly reverted, which beat an accept of the same file. */
  reverted: string[];
  /** Whether the reliability fix has landed, by either route. */
  fixApplied: boolean;
  /** What is in preview once everything accepted is counted. */
  previewVersion: string;
  /**
   * Every version that exists, including one created by an accepted change.
   *
   * The Deploy table renders exactly this, so its rows sum to the spend below.
   * The table used to render p.versions, which could never contain v15, so the
   * screen stated a total its own rows contradicted.
   */
  rows: Version[];
  /** Builds this month: every version number taken, kept or discarded. */
  builds: number;
  /** Of those, how many produced a version that still exists. */
  versionsKept: number;
  /** Spend this month, summed from the versions plus anything accepted. */
  spend: number;
};

/**
 * The whole applied state from the three URL parameters that can change it.
 *
 * Call this once per request, pass the result down. Nothing downstream reads
 * fix, accept or revert again, which is what makes the surfaces agree.
 */
export function appliedState(
  p: DemoProject,
  fixParam: boolean,
  acceptParam: string,
  revertParam: string,
): AppliedState {
  // The flag changes one label, never a shape, so any list gives the same ids.
  const ids = new Set(allDiffIds(changeRequests(p)));
  const list = (param: string) => param.split(".").filter((id) => ids.has(id));

  const reverted = list(revertParam);
  const fromUrl = list(acceptParam);

  // fix=applied means every file of the fix change is accepted. Accepting them
  // in the Code tab means the fix is applied. One signal, read both ways.
  const fixDiffIds =
    changeRequests(p)
      .find((c) => c.id === FIX_CHANGE_ID)
      ?.diffs.map((d) => d.id) ?? [];
  const accepted = (fixParam ? [...new Set([...fromUrl, ...fixDiffIds])] : fromUrl)
    // Reverting a file beats accepting it, by either route, so pressing revert
    // in the Code tab takes the fix back out of preview as well.
    .filter((id) => !reverted.includes(id));

  const fixApplied = fixDiffIds.length > 0 && fixDiffIds.every((id) => accepted.includes(id));
  const changes = changeRequests(p, fixApplied);
  const landed = appliedPending(changes, accepted);

  /*
    An accepted change is a version, so it is a row like any other.

    Its number comes from its position in the pending list, its cost is the
    change's own, and its description is the request. Nothing about it is
    special once it is here, which is why the total can simply sum the rows.
  */
  const rows: Version[] = [
    ...p.versions,
    ...landed.map((c) => ({
      id: c.id,
      label: versionForPending(p, changes, c.id),
      change: c.message,
      cost: c.cost ?? 0,
    })),
  ];

  return {
    changes,
    accepted,
    reverted,
    fixApplied,
    previewVersion: previewAfter(p, changes, accepted),
    rows,
    builds: buildsAttempted(p) + landed.length,
    versionsKept: rows.length,
    spend: spendAfter(p, changes, accepted),
  };
}

/** The rows added up, which must equal the spend the same state reports. */
export function rowsTotal(rows: Version[], p: DemoProject): number {
  const built = rows.reduce((sum, v) => sum + v.cost, 0);
  const discarded = p.discarded.reduce((sum, v) => sum + v.cost, 0);
  return round(built + discarded);
}
