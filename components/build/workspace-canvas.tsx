import { LayerCanvas } from "@/components/workspace/canvas";
import { CodeCanvas } from "@/components/code/code-canvas";
import { type AppliedState, previewChat } from "@/lib/seed/totals";
import { DeployCanvas } from "@/components/deploy/deploy-canvas";
import { FrameworkSheet } from "@/components/agents/framework-sheet";
import { verifyJevResult } from "@/lib/jev/sign";
import type { JevResult } from "@/lib/jev";
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
  /** The one derivation, computed by the page and shared with the shell. */
  applied: AppliedState;
  preferDetails: boolean;
  jev: string;
  jevResult: string;
  jevSig: string;
  file: string;
  diff: string;
  panel: "terminal" | "logs" | "checks";
  sheet: string;
  rollback: string;
  promote: string;
  framework: string;
  basePath: string;
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
  applied,
  preferDetails,
  jev,
  jevResult,
  jevSig,
  file,
  diff,
  panel,
  sheet,
  rollback,
  promote,
  framework,
  basePath,
  query,
  finishAction,
}: Props) {
  // The result travels in the URL, so a run is linkable like every other view.
  // It is also signed, because a query parameter is something anyone can type:
  // an unsigned or edited result is shown as unverified, never as live.
  let parsedJev: JevResult | null = null;
  let jevVerified = false;
  if (jevResult) {
    const json = decodeURIComponent(jevResult);
    try {
      parsedJev = JSON.parse(json) as JevResult;
    } catch {
      parsedJev = null;
    }
    if (parsedJev) jevVerified = verifyJevResult(jev, json, jevSig);
  }
  if (build === "running" || build === "failed") {
    return (
      <BuildProgress
        stages={project.stages}
        failure={project.failure}
        mode={build === "failed" ? "failed" : "running"}
        finishAction={finishAction}
        doneHref={query({ build: "done", tab: "app", pane: "canvas" })}
        failedBuildPolicy={project.copy.failedBuildPolicy}
        preferDetails={preferDetails}
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
          applied={applied.fixApplied}
          preferDetails={preferDetails}
          query={query}
        />
      );
    }
  }

  if (layer === "agents") {
    const selected = project.agents.find((a) => a.id === agent);
    // `sheet` carries which picker is open and `framework` which one is chosen,
    // so screen 11 is a link like everything else here.
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
        {sheet === "framework" ? (
          <FrameworkSheet
            selected={framework}
            closeHref={query({ sheet: "", framework: "" })}
            hrefFor={(id) => query({ sheet: "framework", framework: id })}
          />
        ) : null}
        {selected ? (
          <div className="min-w-0 lg:w-80 lg:flex-none">
            <AgentInspector
              agent={selected}
              details={depth === "details"}
              applied={applied.fixApplied}
              preferDetails={preferDetails}
              jevResult={jev === selected.id ? parsedJev : null}
              jevVerified={jevVerified}
              formNext={`${basePath}?tab=agents&pane=canvas&agent=${selected.id}`}
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
        chat={previewChat(project, applied.fixApplied)}
        conversations={project.conversations}
        counts={project.counts}
        previewVersion={applied.previewVersion}
        whyHref={query({ why: project.runs[0].id, pane: "canvas" })}
      />
    );
  }

  if (layer === "code") {
    return (
      <CodeCanvas
        project={project}
        applied={applied}
        file={file}
        diff={diff}
        panel={panel}
        query={query}
      />
    );
  }

  if (layer === "deploy") {
    return (
      <DeployCanvas
        project={project}
        applied={applied}
        sheet={sheet}
        rollback={rollback}
        promote={promote}
        query={query}
      />
    );
  }

  return <LayerCanvas layer={layer} project={project} />;
}
