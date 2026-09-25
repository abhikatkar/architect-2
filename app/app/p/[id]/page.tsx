import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { WorkspaceCanvas } from "@/components/build/workspace-canvas";
import { workspaceUrl } from "@/lib/workspace-url";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { getProject } from "@/lib/projects";

export default async function ProjectPage(props: PageProps<"/app/p/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  // Row level security means a project belonging to someone else simply is not
  // found, rather than being found and then refused.
  const project = await getProject(id);
  if (!project) notFound();

  const basePath = `/app/p/${project.id}`;
  const { layer, pane, build, device, agent, depth, why, fixApplied, query } =
    workspaceUrl(basePath, searchParams);

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
          agent={agent}
          depth={depth}
          why={why}
          fixApplied={fixApplied}
          query={query}
          finishAction={`${basePath}/built`}
        />
      }
    />
  );
}
