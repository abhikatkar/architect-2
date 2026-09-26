import type { DemoProject } from "@/lib/seed/types";
import { ledgerSpend } from "@/lib/seed/totals";
import type { Layer } from "./types";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="min-w-0 rounded-panel border border-rule p-4">
      <h2 className="text-title font-semibold">{title}</h2>
      {note ? <p className="mt-1 max-w-[72ch] text-small text-graphite">{note}</p> : null}
      <div className="mt-3 min-w-0">{children}</div>
    </section>
  );
}

/** Tables scroll inside their own container. The page never scrolls sideways. */
function Scroller({ children }: { children: React.ReactNode }) {
  return <div className="min-w-0 overflow-x-auto">{children}</div>;
}

export function LayerCanvas({
  layer,
  project,
}: {
  layer: Layer;
  project: DemoProject;
}) {
  if (layer === "plan") {
    return (
      <Panel title="Plan" note={project.summary}>
        <ul className="flex flex-col gap-2 text-body">
          <li>Customers ask billing questions in a chat.</li>
          <li>Answers come only from the {project.helpArticleCount} help articles.</li>
          <li>Anything unsupported is escalated to a human with a reason.</li>
          <li>Admins see conversations by status, with transcripts.</li>
        </ul>
      </Panel>
    );
  }

  // The agents layer is handled by AgentCanvas in workspace-canvas.tsx, which
  // intercepts it before this runs. The branch that used to sit here was dead
  // code still claiming the canvas "arrives with the agent slice".

  if (layer === "app") {
    return (
      <Panel title="App preview" note="How the built app looks to its users.">
        <div className="rounded-panel border border-rule p-4">
          <p className="text-caption text-graphite">Northwind Helpline, admin inbox</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {(["open", "resolved", "escalated"] as const).map((k) => (
              <span
                key={k}
                className="rounded-input border border-rule px-3 py-2 text-body"
              >
                <span className="font-mono">{project.counts[k]}</span>{" "}
                <span className="text-graphite">{k}</span>
              </span>
            ))}
          </div>
          <ul className="mt-3 flex flex-col gap-2">
            {project.conversations.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline gap-2 text-small">
                <span className="font-medium">{c.customer}</span>
                <span className="min-w-0 flex-1 truncate text-graphite">{c.question}</span>
                <span
                  className={`rounded-input border px-1.5 py-0.5 text-caption ${
                    c.status === "escalated"
                      ? "border-fault text-fault"
                      : "border-live text-live"
                  }`}
                >
                  {c.status}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </Panel>
    );
  }

  if (layer === "data") {
    return (
      <Panel title="Data" note="Collections the app writes to. Read only in this demo, so the rows below cannot be opened.">
        <Scroller>
          <table className="w-full min-w-[420px] border-collapse text-small">
            <thead>
              <tr className="text-left text-graphite">
                <th className="border-b border-rule py-2 pr-4 font-medium">Collection</th>
                <th className="border-b border-rule py-2 font-medium">Rows</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["conversations", project.counts.open + project.counts.resolved + project.counts.escalated],
                ["messages", 214],
                ["help_articles", 24],
              ].map(([name, rows]) => (
                <tr key={String(name)}>
                  <td className="border-b border-rule py-2 pr-4 font-mono">{name}</td>
                  <td className="border-b border-rule py-2 font-mono">{rows}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Scroller>
      </Panel>
    );
  }

  if (layer === "code") {
    return (
      <Panel title="Code" note="Every change the agent made, grouped per request. Read only in this demo: the file tree and diffs arrive with the code slice.">
        <ul className="flex flex-col gap-2">
          {project.commits.map((c) => (
            <li key={c.sha} className="flex flex-wrap items-baseline gap-2 text-small">
              <span className="font-mono text-graphite">{c.sha}</span>
              <span className="min-w-0 flex-1">{c.message}</span>
              <span className="text-caption text-graphite">{c.files} files</span>
            </li>
          ))}
        </ul>
      </Panel>
    );
  }

  return (
    <Panel title="Deploy" note="What is live, and what is waiting in preview.">
      <Scroller>
        {/* Phone: one block per version. The table forced 480px inside a 324px
            card, so the Cost column was cut off. Round 3. */}
        <ul className="flex flex-col gap-2 sm:hidden">
          {project.versions.map((v) => (
            <li key={v.id} className="min-w-0 rounded-input border border-rule p-3">
              <p className="flex flex-wrap items-baseline gap-x-2">
                <span className="font-mono text-small">{v.label}</span>
                <span className="font-mono text-caption text-cost">{money(v.cost)}</span>
                <span className="text-caption">
                  {v.live ? (
                    <span className="text-live">production, live</span>
                  ) : (
                    <span className="text-graphite">{v.environment ?? "not deployed"}</span>
                  )}
                </span>
              </p>
              <p className="mt-1 min-w-0 text-small">{v.change}</p>
            </li>
          ))}
        </ul>

        <table className="hidden w-full border-collapse text-small sm:table">
          <thead>
            <tr className="text-left text-graphite">
              <th className="border-b border-rule py-2 pr-4 font-medium">Version</th>
              <th className="border-b border-rule py-2 pr-4 font-medium">Change</th>
              <th className="border-b border-rule py-2 pr-4 font-medium">Cost</th>
              <th className="border-b border-rule py-2 font-medium">Where</th>
            </tr>
          </thead>
          <tbody>
            {project.versions.map((v) => (
              <tr key={v.id}>
                <td className="border-b border-rule py-2 pr-4 font-mono">{v.label}</td>
                <td className="border-b border-rule py-2 pr-4">{v.change}</td>
                <td className="border-b border-rule py-2 pr-4 font-mono text-cost">
                  {money(v.cost)}
                </td>
                <td className="border-b border-rule py-2">
                  {v.live ? (
                    <span className="text-live">production, live</span>
                  ) : (
                    <span className="text-graphite">{v.environment ?? "not deployed"}</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* The gaps in the numbering are a question a reader will ask, so it is
            answered here rather than left to be noticed. */}
        <div className="mt-3 min-w-0 border-t border-rule pt-3">
          <p className="max-w-[72ch] text-caption text-graphite">
            A version number is taken when a build starts, so the list skips{" "}
            {project.discarded.map((d) => d.label).join(", ")}: {project.discarded.length} of
            the {project.versions.length + project.discarded.length} builds this month never
            reached deploy. Each is charged{" "}
            <span className="font-mono text-cost">{money(0)}</span>, because the platform did
            not deliver a working app. They are inside the{" "}
            <span className="font-mono text-cost">{money(ledgerSpend(project))}</span> total,
            adding nothing to it.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {project.discarded.map((d) => (
              <li key={d.label} className="flex flex-wrap gap-x-2 text-caption">
                <span className="font-mono text-graphite">{d.label}</span>
                <span className="font-mono text-cost">{money(d.cost)}</span>
                <span className="min-w-0 text-graphite">{d.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </Scroller>
    </Panel>
  );
}
