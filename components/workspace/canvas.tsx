import type { DemoProject } from "@/lib/seed/types";
import type { Layer } from "./types";


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
      <h2 className="text-title font-bold">{title}</h2>
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

  /*
    Nothing should reach here.

    Plan and Data are handled above. Agents, App, Code and Deploy are each
    intercepted by workspace-canvas.tsx before this component runs, because they
    need the query builder that LayerCanvas is never given. This is the branch
    that catches a layer someone adds and forgets to route.
  */
  return (
    <Panel title="Not built yet" note={`The ${layer} layer has no canvas.`}>
      <p className="text-small text-graphite">
        This is a gap in the product, not an empty state someone designed.
      </p>
    </Panel>
  );
}
