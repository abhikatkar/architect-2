/**
 * The agent frameworks the picker offers, and what Architect can and cannot
 * manage for each.
 *
 * The brief asks for a platform where you can "build agents in any framework".
 * Today's Architect cannot: agents are Lyzr agents or GitAgent in beta, which
 * is gap 4 in docs/03. This screen is the answer, and the useful half of it is
 * the second column. A picker that says every framework is fully supported
 * teaches a developer nothing and will be wrong within a release.
 *
 * Simulated, like everything downstream of a project (D16). Choosing one here
 * creates nothing.
 */

/** One thing Architect either manages for a framework, or does not. */
export type Capability = {
  id: string;
  label: string;
  /** Said as a word beside the mark, never colour alone (D20). */
  note: string;
};

export type Framework = {
  id: string;
  name: string;
  summary: string;
  /** Where the agent's definition actually lives. */
  home: string;
  /** Capability ids Architect manages. Everything else it does not. */
  manages: string[];
  /** Said plainly, because this is the column that is worth reading. */
  limits: string[];
  /** Today's Architect, for contrast. */
  availableToday: boolean;
};

export const CAPABILITIES: Capability[] = [
  { id: "runs", label: "Runs and traces", note: "Every run shows its steps and what it cost" },
  { id: "visual", label: "Visual editing", note: "Edit the agent without opening a file" },
  { id: "versions", label: "Version history", note: "Each change becomes a version you can revert" },
  { id: "knowledge", label: "Knowledge bases", note: "Attach sources Architect indexes and serves" },
  { id: "hosted", label: "Hosted runtime", note: "Architect runs it, with no infrastructure from you" },
];

export const FRAMEWORKS: Framework[] = [
  {
    id: "lyzr",
    name: "Lyzr",
    summary: "The agents Architect builds today, with tools and knowledge bases.",
    home: "Managed by Architect",
    manages: ["runs", "visual", "versions", "knowledge", "hosted"],
    limits: ["Agents are tied to Lyzr, so moving one out means rewriting it"],
    availableToday: true,
  },
  {
    id: "gitagent",
    name: "GitAgent",
    summary: "Agents as files in your repository, in beta today.",
    home: "Files in your repo",
    manages: ["runs", "versions", "hosted"],
    limits: [
      "No visual editing. The file is the agent, so changes happen in the Code tab",
      "Knowledge bases are yours to wire up",
    ],
    availableToday: true,
  },
  {
    id: "langgraph",
    name: "LangGraph",
    summary: "Graphs of steps with explicit state, for branching work.",
    home: "Python or TypeScript in your repo",
    manages: ["runs", "versions"],
    limits: [
      "No visual editing. Architect reads the graph but does not draw it for you",
      "You bring the runtime. Architect calls it and records the run",
      "Knowledge bases are yours to wire up",
    ],
    availableToday: false,
  },
  {
    id: "crewai",
    name: "CrewAI",
    summary: "Role-based agents that hand work to each other.",
    home: "Python in your repo",
    manages: ["runs", "versions"],
    limits: [
      "No visual editing",
      "You bring the runtime",
      "Architect will not rewrite your crew definitions",
    ],
    availableToday: false,
  },
  {
    id: "openai-agents",
    name: "OpenAI Agents SDK",
    summary: "The SDK's own agent loop, with its tools and handoffs.",
    home: "TypeScript or Python in your repo",
    manages: ["runs", "versions", "hosted"],
    limits: [
      "No visual editing",
      "Knowledge bases are yours to wire up",
      "Model choice follows the SDK, not Architect",
    ],
    availableToday: false,
  },
];

/** What Architect does not manage for a framework, derived from what it does. */
export function notManaged(framework: Framework): Capability[] {
  return CAPABILITIES.filter((c) => !framework.manages.includes(c.id));
}
