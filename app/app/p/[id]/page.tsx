import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { WorkspaceCanvas } from "@/components/build/workspace-canvas";
import { parseLayer, parsePane } from "@/components/workspace/types";
import { parseDevice } from "@/components/build/app-preview";
import { parseBuild } from "@/lib/build-state";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { getProject } from "@/lib/projects";

export default async function ProjectPage(props: PageProps<"/app/p/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  // Row level security means a project belonging to someone else simply is not
  // found, rather than being found and then refused.
  const project = await getProject(id);
  if (!project) notFound();

  const layer = parseLayer(searchParams.tab);
  const pane = parsePane(searchParams.pane);
  const build = parseBuild(searchParams.build);
  const device = parseDevice(searchParams.device);

  const basePath = `/app/p/${project.id}`;
  const query = (patch: Record<string, string>) => {
    const p = new URLSearchParams({ tab: layer, pane, device });
    if (build !== "none") p.set("build", build);
    for (const [k, v] of Object.entries(patch)) p.set(k, v);
    return `${basePath}?${p.toString()}`;
  };

  return (
    <WorkspaceShell
      projectName={project.name}
      subtitle={`Status: ${project.status}`}
      layer={layer}
      pane={pane}
      ledger={DEMO_PROJECT.ledger}
      basePath={basePath}
      banner={
        project.status === "draft" && build === "none" ? (
          <div className="border-b border-rule bg-blueprint/10 px-4 py-2 sm:px-6">
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
              <span>This project has not been built yet.</span>
              <Link href={`${basePath}/plan`} className="text-blueprint underline">
                Read the plan and the cost
              </Link>
            </p>
          </div>
        ) : null
      }
      conversation={
        <Conversation
          project={DEMO_PROJECT}
          building={build === "running" || build === "failed"}
        />
      }
      canvas={
        <WorkspaceCanvas
          project={DEMO_PROJECT}
          layer={layer}
          build={build}
          device={device}
          basePath={basePath}
          query={query}
          finishAction={`${basePath}/built`}
        />
      }
    />
  );
}
