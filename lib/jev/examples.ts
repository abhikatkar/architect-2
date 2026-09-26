import type { JevAgentId, JevAnswer } from "./questions";

/**
 * Worked examples, captured from real calls by scripts/capture-jev-examples.mjs
 * on 2026-09-26.
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

export const JEV_EXAMPLES: JevExample[] = [
  {
    "id": "faithful-same-timing",
    "agentId": "grounding-checker",
    "label": "Faithful: says exactly what the source says",
    "note": "The sample adds 'at the start of'. This one does not.",
    "expected": "pass",
    "state": {
      "draft": "Your credit will be applied at the next billing cycle.",
      "source": "Account credits apply at the next billing cycle."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 610,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "Yes",
        "confidence": null,
        "probability": 0.83
      }
    ]
  },
  {
    "id": "faithful-reworded",
    "agentId": "grounding-checker",
    "label": "Faithful: same claim, different words",
    "note": "Wording differs from the source, the claim does not.",
    "expected": "pass",
    "state": {
      "draft": "Credits are applied on your next billing cycle.",
      "source": "Account credits apply at the next billing cycle."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 808,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "Yes",
        "confidence": null,
        "probability": 0.82
      }
    ]
  },
  {
    "id": "faithful-less-specific",
    "agentId": "grounding-checker",
    "label": "Faithful: less specific than the source",
    "note": "Drops a condition rather than adding one. Being vaguer is not being unsupported.",
    "expected": "pass",
    "state": {
      "draft": "Refund requests are reviewed by our support team.",
      "source": "Refund requests made within 14 days of purchase are reviewed by our support team."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 827,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "Yes",
        "confidence": null,
        "probability": 0.78
      }
    ]
  },
  {
    "id": "unsupported-added-timing",
    "agentId": "grounding-checker",
    "label": "Unsupported: adds a timing word",
    "note": "The demo's own case. The source never says 'at the start of'.",
    "expected": "fail",
    "state": {
      "draft": "Your credit will be applied at the start of your next billing cycle.",
      "source": "Account credits apply at the next billing cycle."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 708,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "No",
        "confidence": null,
        "probability": 0.13
      }
    ]
  },
  {
    "id": "unsupported-contradicts",
    "agentId": "grounding-checker",
    "label": "Unsupported: contradicts the source",
    "note": "Invents a deadline the source does not give.",
    "expected": "fail",
    "state": {
      "draft": "Your credit will be applied within 24 hours.",
      "source": "Account credits apply at the next billing cycle."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 602,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "No",
        "confidence": null,
        "probability": 0.02
      }
    ]
  },
  {
    "id": "unsupported-wrong-number",
    "agentId": "grounding-checker",
    "label": "Unsupported: changes a number",
    "note": "Seven days against a source that says fourteen.",
    "expected": "fail",
    "state": {
      "draft": "Refunds are reviewed within 7 days.",
      "source": "Refund requests made within 14 days of purchase are reviewed by our support team."
    },
    "capturedOn": "2026-09-26",
    "latencyMs": 992,
    "answers": [
      {
        "key": "grounded",
        "type": "boolean",
        "display": "No",
        "confidence": null,
        "probability": 0.04
      }
    ]
  }
];

export function examplesFor(id: JevAgentId) {
  return JEV_EXAMPLES.filter((e) => e.agentId === id);
}
