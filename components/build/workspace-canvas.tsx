import { LayerCanvas } from "@/components/workspace/canvas";
import { BuildProgress } from "./build-progress";
import { AppPreview, type Device } from "./app-preview";
import type { Layer } from "@/components/workspace/types";
import type { DemoProject } from "@/lib/seed/types";
import type { BuildState } from "@/lib/build-state";

type Props = {
  project: DemoProject;
  layer: Layer;
  build: BuildState;
  device: Device;
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

  if (layer === "app") {
    return (
      <AppPreview
        device={device}
        deviceHref={(d) => query({ device: d })}
        chat={project.previewChat}
        conversations={project.conversations}
        counts={project.counts}
        previewVersion={project.ledger.previewVersion}
      />
    );
  }

  return <LayerCanvas layer={layer} project={project} />;
}
