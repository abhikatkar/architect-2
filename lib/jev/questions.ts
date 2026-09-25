/**
 * The typed questions each decision agent asks Jev.
 *
 * Deliberately not server-only: the agent inspector renders this exact object
 * in its details layer, so a developer sees the contract that is actually sent
 * rather than a description of it. No key or call lives here.
 *
 * Source for the question shapes:
 * https://vercel.com/kb/guide/typesafe-jev-and-ai-sdk
 */

export const JEV_MODEL = "typesafe-ai/jev";

export type JevAnswer = {
  key: string;
  type: "choice" | "score" | "boolean";
  /** The chosen option, the score, or Yes/No for a boolean. */
  display: string;
  /**
   * Provider confidence, for choice and score only. Null for boolean, because
   * the docs state Jev does not return one for boolean answers.
   */
  confidence: number | null;
  /**
   * P(true), boolean only. The docs are explicit that this is the probability
   * the statement is true and "not a confidence in either outcome", so it is
   * kept separate from confidence rather than merged with it.
   */
  probability: number | null;
};

/** The three agents that make typed decisions. The Answer agent is not one. */
export const JEV_AGENT_IDS = [
  "intake",
  "grounding-checker",
  "escalation-router",
] as const;

export type JevAgentId = (typeof JEV_AGENT_IDS)[number];

export function isJevAgent(id: string): id is JevAgentId {
  return (JEV_AGENT_IDS as readonly string[]).includes(id);
}

export const INTAKE_QUESTIONS = {
  topic: {
    type: "choice",
    instructions: "Which topic is this customer message about?",
    criteria: {
      billing_credits: "Account credits, when they apply, and how they are used",
      billing_refunds: "Refunds, cancellations, and money back",
      billing_invoices: "Invoices, receipts, and payment methods",
      account_access: "Sign in, permissions, seats, and SSO",
      other: "Anything that does not fit the other topics",
    },
  },
  urgency: {
    type: "score",
    instructions: "How urgent is this for the customer?",
    criteria: [
      "A general question, nothing is blocked",
      "Mildly inconvenient, they can wait",
      "They are blocked on something they need today",
      "Money has left their account or service is down",
    ],
  },
} as const;

export const GROUNDING_QUESTIONS = {
  grounded: {
    type: "boolean",
    instructions:
      "Is every claim in the draft answer supported by the source article?",
    criteria: {
      true: "Every statement in the draft appears in the source article, with no added specifics.",
      false:
        "The draft adds detail the source does not state, or contradicts it.",
    },
  },
} as const;

export const ESCALATION_QUESTIONS = {
  queue: {
    type: "choice",
    instructions: "Which human queue should this escalation go to?",
    criteria: {
      billing: "Charges, credits, refunds, and invoices",
      technical: "Outages, integration failures, and bugs",
      account: "Sign in, permissions, seats, and SSO",
    },
  },
} as const;

type AgentSpec = {
  label: string;
  /** Shown in the guided layer. Plain words, no parameter names. */
  why: string;
  questions: Record<string, unknown>;
  /** JSON-compatible, which is what the evaluate API accepts as state. */
  sampleState: Record<string, string>;
  /** Which answer key carries the headline result. */
  primary: string;
};

export const JEV_AGENTS: Record<JevAgentId, AgentSpec> = {
  intake: {
    label: "Intake",
    why: "It sorts a message into a fixed set of topics and rates how urgent it is. There is nothing to write.",
    questions: INTAKE_QUESTIONS,
    sampleState: { message: "When will my credit be applied?" },
    primary: "topic",
  },
  "grounding-checker": {
    label: "Grounding Checker",
    why: "It answers one yes-or-no question about whether a draft is supported by its source.",
    questions: GROUNDING_QUESTIONS,
    sampleState: {
      draft: "Your credit will be applied at the start of your next billing cycle.",
      source: "Account credits apply at the next billing cycle.",
    },
    primary: "grounded",
  },
  "escalation-router": {
    label: "Escalation Router",
    why: "It picks one queue from a fixed list. A written answer would be the wrong output entirely.",
    questions: ESCALATION_QUESTIONS,
    sampleState: {
      message: "I was charged twice and need the extra charge back.",
      reason: "unsupported_detail",
    },
    primary: "queue",
  },
};
