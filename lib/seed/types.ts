/**
 * Types for the demo fixtures.
 *
 * These describe content, not user data. Real user data lives in Supabase and
 * is scoped by row level security. Everything here is the same story for every
 * visitor, so it stays in code where it can be typed and reviewed.
 */

export type ConversationStatus = "open" | "resolved" | "escalated";
export type Environment = "preview" | "production";
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

export type Version = {
  id: string;
  label: string;
  change: string;
  cost: number;
  environment: Environment | null;
  live?: boolean;
  estimate?: { low: number; high: number };
};

export type Commit = {
  sha: string;
  message: string;
  files: number;
};

export type ImportExample = {
  repo: string;
  branch: string;
  subfolder?: string;
  detected: string;
  support: SupportLevel;
  note?: string;
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
  commits: Commit[];
  imports: ImportExample[];
  stages: BuildStage[];
  clarifiers: Clarifier[];
  plan: Plan;
  previewChat: ChatTurn[];
  failure: BuildFailure;
  ledger: Ledger;
  copy: Record<string, string>;
};
