import { LayerCanvas } from "@/components/workspace/canvas";
import { BuildProgress } from "./build-progress";
import { AppPreview, type Device } from "./app-preview";
import { AgentCanvas } from "@/components/agents/agent-canvas";
import { AgentInspector } from "@/components/agents/agent-inspector";
import { RunTraceView } from "@/components/agents/run-trace";
import type { Layer } from "@/components/workspace/types";
import type { DemoProject } from "@/lib/seed/types";
import type { BuildState } from "@/lib/build-state";

type Props = {
  project: DemoProject;
  layer: Layer;
  build: BuildState;
  device: Device;
  agent: string;
  depth: string;
  why: string;
  fixApplied: boolean;
  query: (patch: Record<string, string>) => string;
  /** Signed in: the route that records completion. Demo: null. */
  finishAction: string | null;
};

/**
 * Decides what the canvas shows, so the signed-in workspace and the guest demo
 * run the same code rather than two implementations that drift (D29).
 */
export function WorkspaceCanvas({
  project,
  layer,
  build,
  device,
  agent,
  depth,
  why,
  fixApplied,
  query,
  finishAction,
}: Props) {
  if (build === "running" || build === "failed") {
    return (
      <BuildProgress
        stages={project.stages}
        failure={project.failure}
        mode={build === "failed" ? "failed" : "running"}
        finishAction={finishAction}
        doneHref={query({ build: "done", tab: "app" })}
      />
    );
  }

  // The trace is reachable from the app preview and from the runs list, so it
  // is checked before the layer, not inside one of them.
  if (why) {
    const answerAgent = project.agents.find((a) => a.id === "answer");
    if (answerAgent) {
      return (
        <RunTraceView
          trace={project.trace}
          fix={project.fix}
          answerAgent={answerAgent}
          applied={fixApplied}
          query={query}
        />
      );
    }
  }

  if (layer === "agents") {
    const selected = project.agents.find((a) => a.id === agent);
    return (
      <div className="flex min-w-0 flex-1 flex-col gap-4 lg:flex-row">
        <div className="min-w-0 flex-1">
          <AgentCanvas
            agents={project.agents}
            edges={project.edges}
            runs={project.runs}
            selected={agent}
            query={query}
          />
        </div>
        {selected ? (
          <div className="min-w-0 lg:w-80 lg:flex-none">
            <AgentInspector
              agent={selected}
              details={depth === "details"}
              applied={fixApplied}
              query={query}
            />
          </div>
        ) : null}
      </div>
    );
  }

  if (layer === "app") {
    return (
      <AppPreview
        device={device}
        deviceHref={(d) => query({ device: d })}
        chat={project.previewChat}
        conversations={project.conversations}
        counts={project.counts}
        previewVersion={
          fixApplied ? project.fix.newVersion : project.ledger.previewVersion
        }
        whyHref={query({ why: project.runs[0].id })}
      />
    );
  }

  return <LayerCanvas layer={layer} project={project} />;
}
