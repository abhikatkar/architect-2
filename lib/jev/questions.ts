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

/**
 * The bar a grounding check must clear before an answer is sent to a customer
 * without a person reading it first.
 *
 * This was 0.90, derived from an error budget: at a bar of p, roughly (1 - p)
 * of shipped answers carry an unsupported claim, and we wanted fewer than 1 in
 * 10. That derivation assumed the returned probability is calibrated. It is
 * not. Measured over six labeled drafts, a fully faithful one tops out at 0.83,
 * so a 0.90 bar escalates everything and the checker stops being a checker.
 *
 * 0.60 is the bar the rest of the product already uses for a decision it will
 * not act on alone, so this is one rule rather than two. The measured
 * separation is wide enough that the exact number is not load bearing:
 * unsupported drafts came back at 0.02 to 0.13, faithful ones at 0.78 to 0.83.
 * See D46 for the numbers and why the first derivation was wrong.
 */
export const ACT_ALONE_BAR = 0.6;
/*
  Named for what it governs rather than for one agent.

  It is the bar for any decision the product will act on alone: a grounding
  probability before an answer is sent unread, and a choice confidence before a
  message is routed without a person. It was called GROUNDING_PASS_THRESHOLD,
  and the confidence path had its own hardcoded 0.6 beside it, which is two
  copies of one rule and the reason the Intake inspector never named the bar it
  was applying.
*/

/** One line a cold reader can understand, shown next to "Decision model". */
export const JEV_PLAIN_EXPLAINER =
  "Jev is a model that chooses from a list instead of writing text. It returns one of the answers you define and how sure it is, so there is no sentence to parse and no way to invent an option.";

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
      "Does the source article state every detail the draft claims, including timing words such as 'at the start of', 'within', or 'immediately'?",
    criteria: {
      true: "Every detail in the draft is stated in the source. Wording may differ, but the draft adds no timing, amount, condition or qualifier that the source does not state.",
      false:
        "The draft states a timing, amount, condition or qualifier the source does not state, or contradicts the source. Being more precise than the source is not being supported by it.",
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
  /**
   * Which sampleState field the visitor's own text replaces. Every other field
   * is fixed and is shown beside the box, so a result can be checked against
   * what it was actually run on.
   */
  inputField: string;
  /** Human labels for the state fields, so the inspector can show them. */
  stateLabels: Record<string, string>;
  /**
   * What the fields the visitor cannot edit are for, in this agent's terms.
   *
   * The panel used the Grounding Checker's wording for all three, so the
   * Escalation Router said its reason field was "what the answer was checked
   * against". It is not a source, it is why the message was escalated.
   */
  fixedNote?: string;
  /**
   * Boolean answers only. At or above this the answer ships, below it the
   * answer goes to a person. Recorded in D43.
   */
  passThreshold?: number;
};

export const JEV_AGENTS: Record<JevAgentId, AgentSpec> = {
  intake: {
    label: "Intake",
    why: "It sorts a message into a fixed set of topics and rates how urgent it is. There is nothing to write.",
    questions: INTAKE_QUESTIONS,
    sampleState: { message: "When will my credit be applied?" },
    primary: "topic",
    inputField: "message",
    stateLabels: { message: "Customer message" },
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
    inputField: "draft",
    stateLabels: {
      draft: "Draft answer, checked",
      source: "Source article, fixed",
    },
    fixedNote:
      "Sent with every run and not editable here, so you can see what the answer was checked against.",
    passThreshold: ACT_ALONE_BAR,
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
    inputField: "message",
    stateLabels: {
      message: "Escalated message",
      reason: "Why it was escalated, fixed",
    },
    fixedNote:
      "Sent with every run and not editable here. The router sees why the answer was held back, which is what decides the queue.",
  },
};
