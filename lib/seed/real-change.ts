/**
 * One real change from this repository, captured by
 * scripts/capture-real-change.mjs. Do not edit by hand: the Code tab labels
 * this as real and links the commit.
 */

export type RealChangeRow = { kind: "add" | "del" | "same"; text: string };

export const REAL_CHANGE = {
  sha: "b8ba98a700fc94f6f868c78b5d98b12c52b5f527",
  shortSha: "b8ba98a",
  subject: "fix: the Grounding Checker no longer contradicts the demo, and results are signed",
  date: "2026-09-26",
  path: "lib/jev/questions.ts",
  url: "https://github.com/abhikatkar/architect-2/commit/b8ba98a700fc94f6f868c78b5d98b12c52b5f527",
  /** The exact instructions line this commit introduced. Checked against the live source. */
  afterInstructions: "\"Does the source article state every detail the draft claims, including timing words such as 'at the start of', 'within', or 'immediately'?\",",
  rows: [
  {
    "kind": "same",
    "text": "    instructions:"
  },
  {
    "kind": "del",
    "text": "      \"Is every claim in the draft answer supported by the source article?\","
  },
  {
    "kind": "add",
    "text": "      \"Does the source article state every detail the draft claims, including timing words such as 'at the start of', 'within', or 'immediately'?\","
  },
  {
    "kind": "same",
    "text": "    criteria: {"
  },
  {
    "kind": "del",
    "text": "      true: \"Every statement in the draft appears in the source article, with no added specifics.\","
  },
  {
    "kind": "add",
    "text": "      true: \"Every detail in the draft is stated in the source. Wording may differ, but the draft adds no timing, amount, condition or qualifier that the source does not state.\","
  },
  {
    "kind": "same",
    "text": "      false:"
  },
  {
    "kind": "del",
    "text": "        \"The draft adds detail the source does not state, or contradicts it.\","
  },
  {
    "kind": "add",
    "text": "        \"The draft states a timing, amount, condition or qualifier the source does not state, or contradicts the source. Being more precise than the source is not being supported by it.\","
  },
  {
    "kind": "same",
    "text": "    },"
  }
] as RealChangeRow[],
};
