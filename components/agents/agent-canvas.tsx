import Link from "next/link";
import type { Agent, AgentEdge, AgentRun } from "@/lib/seed/types";

type Props = {
  agents: Agent[];
  edges: AgentEdge[];
  runs: AgentRun[];
  selected: string;
  query: (patch: Record<string, string>) => string;
};

/**
 * Screen 9. The agent network as a blueprint drawing.
 *
 * Hand-drawn SVG over the grid rather than a graph library (D31): every node is
 * a real link, the selection lives in the URL, and the whole thing renders on
 * the server. Under 640px it becomes a list, because a graph is not usable on a
 * phone and pretending otherwise helps nobody.
 */
export function AgentCanvas({ agents, edges, runs, selected, query }: Props) {
  const byId = new Map(agents.map((a) => [a.id, a]));
  const outgoing = (id: string) => edges.filter((e) => e.from === id);

  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-baseline gap-2">
        <h2 className="text-title font-semibold">Agents</h2>
        <span className="max-w-[72ch] text-small text-graphite">
          A message starts at Intake and moves left to right. The dashed
          branches leave that line: either agent can send a message to a person
          instead of passing it on.
        </span>
      </div>

      {/* Phone: the list. The graph is hidden, not shrunk. */}
      <ul className="flex flex-col gap-2 sm:hidden">
        {agents.map((a) => (
          <li key={a.id}>
            <Link
              href={`${query({ agent: a.id, why: "", pane: "canvas" })}#agent-inspector`}
              aria-current={a.id === selected ? "true" : undefined}
              className={`flex min-h-11 flex-col justify-center rounded-panel border p-3 ${
                a.id === selected ? "border-blueprint" : "border-rule"
              }`}
            >
              <span className="text-body font-medium">{a.name}</span>
              <span className="text-small text-graphite">{a.role}</span>
              {/* The phone list had no edges at all, so the branch to a person
                  existed only on the drawing. Round 3. */}
              {outgoing(a.id).map((e) => (
                <span key={`${e.from}-${e.to}`} className="mt-1 text-caption text-graphite">
                  {e.label ? `${e.label}: ` : "then: "}
                  {byId.get(e.to)?.name ?? e.to}
                </span>
              ))}
            </Link>
          </li>
        ))}
      </ul>

      {/* Tablet and up: the drawing. */}
      <div
        className="relative hidden min-h-[280px] w-full min-w-0 overflow-hidden rounded-panel border border-rule sm:block"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--blueprint) 1px, transparent 1px), linear-gradient(to bottom, var(--blueprint) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          // The grid is a whisper, not a texture.
          backgroundBlendMode: "normal",
        }}
      >
        <div className="absolute inset-0 bg-paper/94" aria-hidden="true" />

        <svg
          className="absolute inset-0 h-full w-full"
          aria-hidden="true"
          preserveAspectRatio="none"
        >
          {edges.map((e) => {
            const from = byId.get(e.from);
            const to = byId.get(e.to);
            if (!from || !to) return null;
            const x1 = `${from.at.x + 11}%`;
            const y1 = `${from.at.y}%`;
            const x2 = `${to.at.x}%`;
            const y2 = `${to.at.y}%`;
            return (
              <g key={`${e.from}-${e.to}`}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="var(--blueprint)"
                  strokeWidth={1.5}
                  strokeDasharray={e.label ? "4 3" : undefined}
                  opacity={0.55}
                />
                {e.label ? (
                  <text
                    x={`${(from.at.x + 11 + to.at.x) / 2}%`}
                    y={`${(from.at.y + to.at.y) / 2 - 2}%`}
                    fill="var(--graphite)"
                    fontSize="11"
                  >
                    {e.label}
                  </text>
                ) : null}
              </g>
            );
          })}
        </svg>

        {agents.map((a) => (
          <Link
            key={a.id}
            href={`${query({ agent: a.id, why: "", pane: "canvas" })}#agent-inspector`}
            aria-current={a.id === selected ? "true" : undefined}
            className={`absolute w-[22%] min-w-[150px] -translate-y-1/2 rounded-panel border bg-paper p-2 ${
              a.id === selected ? "border-blueprint" : "border-rule"
            }`}
            style={{ left: `${a.at.x}%`, top: `${a.at.y}%` }}
          >
            <span className="block truncate text-body font-medium">{a.name}</span>
            <span className="block truncate text-caption text-graphite">
              {a.knowledge ?? "No knowledge base"}
            </span>
          </Link>
        ))}
      </div>

      <div className="min-w-0">
        <h3 className="text-lead font-semibold">Latest runs</h3>
        <ul className="mt-2 flex flex-col gap-1">
          {runs.map((r) => (
            <li key={r.id}>
              <Link
                href={query({ why: r.id, agent: "", pane: "canvas" })}
                className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-input border border-rule px-3 py-2"
              >
                <span className="min-w-0 flex-1 truncate text-body">{r.question}</span>
                <span
                  className={`text-caption ${r.grounded ? "text-live" : "text-fault"}`}
                >
                  {r.grounded ? "ok grounded" : "x escalated"}
                </span>
                <span className="text-caption text-graphite">{r.ago}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
