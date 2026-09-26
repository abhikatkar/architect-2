import Link from "next/link";
import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { WorkspaceCanvas } from "@/components/build/workspace-canvas";
import { workspaceUrl } from "@/lib/workspace-url";
import { currentTheme } from "@/lib/theme";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { appliedState } from "@/lib/seed/totals";
import { getProject } from "@/lib/projects";
import { prefersDetails } from "@/lib/profiles";

export default async function ProjectPage(props: PageProps<"/app/p/[id]">) {
  const { id } = await props.params;
  const searchParams = await props.searchParams;

  // Row level security means a project belonging to someone else simply is not
  // found, rather than being found and then refused.
  const project = await getProject(id);
  if (!project) notFound();

  const preferDetails = await prefersDetails();
  const theme = await currentTheme();

  const basePath = `/app/p/${project.id}`;
  const {
    layer, pane, build, device, agent, depth, why, fixApplied, jev, jevResult, jevSig, file, diff, panel, accept, revert, sheet, rollback, framework, query,
  } =
    workspaceUrl(basePath, searchParams, preferDetails ? "details" : "guided");

  /*
    Computed once, here, and given to the shell, the conversation rail and the
    canvas. Applying the reliability fix from the trace and accepting its file
    in the Code tab are the same change, so they produce one state that every
    surface reads. Round 4 found three components deriving it three ways.
  */
  const applied = appliedState(DEMO_PROJECT, fixApplied, accept, revert);

  return (
    <WorkspaceShell
      projectName={project.name}
      subtitle={`Status: ${project.status}`}
      layer={layer}
      pane={pane}
      project={DEMO_PROJECT}
      applied={applied}
      theme={theme}
      themeNext={query({})}
      query={query}
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
          applied={applied}
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
          applied={applied}
          preferDetails={preferDetails}
          jev={jev}
          jevResult={jevResult}
          jevSig={jevSig}
          file={file}
          diff={diff}
          panel={panel}
          sheet={sheet}
          rollback={rollback}
          framework={framework}
          basePath={basePath}
          query={query}
          finishAction={`${basePath}/built`}
        />
      }
    />
  );
}
