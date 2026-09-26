/**
 * Types for the demo fixtures.
 *
 * These describe content, not user data. Real user data lives in Supabase and
 * is scoped by row level security. Everything here is the same story for every
 * visitor, so it stays in code where it can be typed and reviewed.
 */

export type ConversationStatus = "open" | "resolved" | "escalated";
export type StageState = "waiting" | "running" | "done" | "fault";
export type SupportLevel = "full" | "partial" | "unsupported";

export type Agent = {
  id: string;
  name: string;
  role: string;
  knowledge: string | null;
  tools: string[];
  /**
   * Where the agent sits between precise and creative, 0 to 100. This is the
   * entire representation in the guided layer: no parameter, no number, no use
   * of the word "temperature". That word and the value behind it appear only in
   * the details layer.
   */
  creativity: number;
  creativityAfterFix?: number;
  /** Position on the canvas, as a percentage of the drawing area. */
  at: { x: number; y: number };
  /** Shown only in the details layer, in mono. */
  settings: { temperature: number; temperatureAfterFix?: number };
  configFile: string;
  versions: { label: string; change: string }[];
  sample: { input: string; output: string };
};

export type AgentEdge = {
  from: string;
  to: string;
  /** Set where the edge is conditional, which is the interesting one. */
  label?: string;
};

export type AgentRun = {
  id: string;
  question: string;
  outcome: string;
  grounded: boolean;
  ago: string;
};

export type FixPreview = {
  /** Plain language. Never names a parameter. */
  summary: string;
  before: string;
  after: string;
  cost: number;
  newVersion: string;
  previousVersion: string;
  /** The exact words the source does not support, marked in the draft. */
  unsupported: string;
  source: string;
};

export type HelpArticle = {
  title: string;
  /** The exact source wording. F4 turns on the gap between this and the draft. */
  body?: string;
};

export type Conversation = {
  id: string;
  customer: string;
  question: string;
  status: ConversationStatus;
  outcome: string;
  /** True where escalating was the correct call, because no source exists. */
  correctEscalation?: boolean;
};

export type TraceStep = {
  actor: string;
  /** Plain language for the guided layer. */
  summary: string;
  /** Raw detail for the details layer, rendered in mono. */
  detail?: string;
  score?: number;
};

export type RunTrace = {
  question: string;
  steps: TraceStep[];
  suggestedFix: string;
  diff: string;
  reRuns: { total: number; grounded: number; cost: number };
};

/*
  A version, and deliberately no field saying where it is now.

  It used to carry `environment: "preview" | "production" | null`, which is a
  fact about the present stored beside its parts: v1 and v14 both claimed
  "preview", v14 went on claiming it after v15 existed, and v15 could never
  claim it at all because it is not in this list until it is applied. Where a
  version is now is derived from what is live and what is in preview. See D58.

  What is stored is history, which cannot be derived: `live` for the version in
  production now, and `wasLive` for one that was in production before it. That
  is the difference between a rollback and a promotion.
*/
export type Version = {
  id: string;
  label: string;
  change: string;
  cost: number;
  /** In production now. Exactly one version has this. */
  live?: boolean;
  /** Was in production before the one that is live. Not derivable. */
  wasLive?: boolean;
  estimate?: { low: number; high: number };
};


export type ImportExample = {
  repo: string;
  branch: string;
  subfolder?: string;
  detected: string;
  support: SupportLevel;
  note?: string;
  /** Per repository, because a partial import is not the same job as a full one. */
  estimate?: { low: number; high: number; minutesLow: number; minutesHigh: number };
};

export type BuildStage = {
  name: string;
  state: StageState;
  /** What a real build of this stage would take. This is the number shown. */
  elapsedSeconds: number;
  /**
   * How long the demo animation spends here. The run is compressed to about
   * half a minute and says so on screen, so a reviewer is never misled about
   * which number is the real one.
   */
  demoMs: number;
  cost: number;
  /** Shown under the stage name once it passes, for Checks especially. */
  detail?: string;
};

export type Clarifier = {
  id: string;
  question: string;
  options: string[];
  /** Preselected, so the fast path through the single gate is one click. */
  defaultOption: string;
};

export type Plan = {
  headline: string;
  /** Plain language, for the guided layer. */
  points: string[];
  /** The raw PRD the Details control reveals, rendered in mono. */
  prd: string;
  estimate: { low: number; high: number; minutesLow: number; minutesHigh: number };
};

export type ChatTurn = {
  /** Set on the turn the reliability fix corrected, so it can say so. */
  groundedAfterFix?: boolean;
  from: "customer" | "agent";
  text: string;
  escalated?: boolean;
};

export type BuildFailure = {
  stageName: string;
  cause: string;
  attempts: number;
  stopped: string;
  platformCharge: string;
  /** Raw log for the details layer. */
  detail: string;
  retryEstimate: { low: number; high: number };
};

export type Ledger = {
  previewVersion: string;
  productionVersion: string | null;
  /** How the finished demo describes its own age, not "3 min ago". */
  /**
   * The cap only. Spend is never stored: it is summed from `versions` by
   * lib/seed/totals.ts, because a hand-written total is exactly what drifted
   * from its parts and the review caught. See D36.
   */
  cap: number;
};

/** One file in the generated app. The tree is derived from the paths (D36). */
export type CodeFile = {
  /** Slug used as the URL token, so it stays short and stable. */
  id: string;
  path: string;
  language: "tsx" | "ts" | "sql" | "yaml" | "md";
  /**
   * The file as it stands. Absent means the path exists in the repo but the
   * demo does not carry its contents, which the file view says rather than
   * showing an empty editor.
   */
  body?: string;
};

/** One side of one printed diff row. */
export type DiffSide = { line: number; text: string };

/**
 * One printed row, already paired.
 *
 * Pairing lives in the data, not in either renderer, which is what lets the
 * unified and side by side views both be a plain map over the same array and
 * never disagree. A pure addition or deletion is the variant with one side null.
 */
export type DiffRow =
  | { kind: "same"; old: DiffSide; new: DiffSide }
  | { kind: "mod"; old: DiffSide; new: DiffSide }
  | { kind: "add"; old: null; new: DiffSide }
  | { kind: "del"; old: DiffSide; new: null };

/** One changed file inside a request. Added and removed counts are derived. */
export type FileDiff = {
  /** Slug. The accept and revert token in the URL. Unique across the project. */
  id: string;
  fileId: string;
  status: "added" | "modified";
  rows: DiffRow[];
};

/** Changes are grouped by the request that caused them, not by file. */
export type ChangeRequest = {
  /** The commit sha once it lands. */
  id: string;
  /** The words the person typed. This is what groups the files. */
  request: string;
  message: string;
  ago: string;
  /** Absent until the change is applied, like v15. */
  version: string | null;
  /** What applying it costs. Only pending changes carry one. */
  cost?: number;
  diffs: FileDiff[];
};

export type TerminalLine = { stream: "in" | "out"; text: string };
export type LogLine = {
  at: string;
  level: "info" | "warn" | "error";
  source: string;
  text: string;
};
/** Reads like CI. State always carries a word, never colour alone (D20). */
export type CheckResult = {
  name: string;
  state: "pass" | "fail";
  detail: string;
  ms: number;
};

/** Where the app answers, and whether the name is ours or the customer's. */
export type DomainRecord = {
  host: string;
  kind: "default" | "custom";
  state: "live" | "needs dns";
  detail: string;
};

/** Who can open the app. Replaces an admin list held in a server env var. */
export type MemberRole = "owner" | "admin" | "editor" | "viewer";
export type Member = {
  name: string;
  email: string;
  role: MemberRole;
  state: "active" | "invited";
};

export type PublishSettings = {
  /** Off by default, and the reason is shown next to it. */
  marketplace: boolean;
  visibility: "private" | "link" | "public";
  listing: string;
};

/** A repository Architect could connect to, for the consent sheet. */
export type RepoTarget = {
  id: string;
  name: string;
  kind: "new" | "existing";
  detail: string;
};

export type DemoProject = {
  slug: string;
  name: string;
  company: string;
  summary: string;
  owner: { name: string; role: string };
  collaborator: { name: string; role: string };
  agents: Agent[];
  edges: AgentEdge[];
  runs: AgentRun[];
  fix: FixPreview;
  /** Total in the knowledge base. helpArticles below is a named sample of it. */
  helpArticleCount: number;
  helpArticles: HelpArticle[];
  missingTopics: string[];
  conversations: Conversation[];
  counts: Record<ConversationStatus, number>;
  trace: RunTrace;
  /** Numbers taken by builds that never deployed. Each charged $0.00. */
  discarded: { label: string; reason: string; cost: number }[];
  versions: Version[];
  imports: ImportExample[];
  stages: BuildStage[];
  clarifiers: Clarifier[];
  plan: Plan;
  previewChat: ChatTurn[];
  failure: BuildFailure;
  ledger: Ledger;
  copy: Record<string, string>;
};
