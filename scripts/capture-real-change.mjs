/*
  Captures one real commit from this repository into lib/seed/real-change.ts.

  The Code tab shows simulated changes for the demo app. Beside them it shows
  exactly one real one: the commit that tightened the grounding criteria after
  a live call disagreed with the demo. Anything claiming to be real has to come
  from the source rather than be typed out, or it drifts the first time the
  code moves and nobody notices.

    node scripts/capture-real-change.mjs

  The consistency check asserts the captured "after" line still equals the live
  GROUNDING_QUESTIONS text, so editing the criteria without re-running this
  fails the build rather than shipping a stale diff.
*/
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const SHA = "b8ba98a700fc94f6f868c78b5d98b12c52b5f527";
const FILE = "lib/jev/questions.ts";

const git = (args) => execFileSync("git", args, { encoding: "utf8" }).trim();

const subject = git(["show", "-s", "--format=%s", SHA]);
const isoDate = git(["show", "-s", "--format=%cI", SHA]).slice(0, 10);
const patch = git(["show", SHA, "--unified=1", "--", FILE]);

// Only the hunk that changed the criteria, not the whole commit.
const lines = patch.split("\n");
const start = lines.findIndex((l) => l.startsWith("@@") && l.includes("GROUNDING_QUESTIONS"));
if (start === -1) throw new Error("the grounding hunk was not found in that commit");

const rows = [];
for (const line of lines.slice(start + 1)) {
  if (line.startsWith("@@") || line.startsWith("diff ")) break;
  if (line.startsWith("+")) rows.push({ kind: "add", text: line.slice(1) });
  else if (line.startsWith("-")) rows.push({ kind: "del", text: line.slice(1) });
  else if (line.startsWith(" ")) rows.push({ kind: "same", text: line.slice(1) });
  if (rows.length >= 14) break;
}

const added = rows.filter((r) => r.kind === "add");
const afterInstructions = added.find((r) => r.text.includes("Does the source article state"));
if (!afterInstructions) throw new Error("could not find the new instructions line");

const file = `/**
 * One real change from this repository, captured by
 * scripts/capture-real-change.mjs. Do not edit by hand: the Code tab labels
 * this as real and links the commit.
 */

export type RealChangeRow = { kind: "add" | "del" | "same"; text: string };

export const REAL_CHANGE = {
  sha: ${JSON.stringify(SHA)},
  shortSha: ${JSON.stringify(SHA.slice(0, 7))},
  subject: ${JSON.stringify(subject)},
  date: ${JSON.stringify(isoDate)},
  path: ${JSON.stringify(FILE)},
  url: ${JSON.stringify(`https://github.com/abhikatkar/architect-2/commit/${SHA}`)},
  /** The exact instructions line this commit introduced. Checked against the live source. */
  afterInstructions: ${JSON.stringify(afterInstructions.text.trim())},
  rows: ${JSON.stringify(rows, null, 2)} as RealChangeRow[],
};
`;

writeFileSync("lib/seed/real-change.ts", file);
console.log(`Wrote lib/seed/real-change.ts from ${SHA.slice(0, 7)}: ${rows.length} rows, ${added.length} added.`);
