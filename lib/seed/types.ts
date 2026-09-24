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
  /** Shown only in the details layer, in mono. */
  settings: { temperature: number; temperatureAfterFix?: number };
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
  elapsedSeconds: number;
  cost: number;
};

export type Ledger = {
  previewVersion: string;
  productionVersion: string | null;
  builtAgo: string;
  spend: number;
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
  helpArticles: HelpArticle[];
  missingTopics: string[];
  conversations: Conversation[];
  counts: Record<ConversationStatus, number>;
  trace: RunTrace;
  versions: Version[];
  commits: Commit[];
  imports: ImportExample[];
  stages: BuildStage[];
  ledger: Ledger;
  copy: Record<string, string>;
};
