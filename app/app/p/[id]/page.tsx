import { notFound } from "next/navigation";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { LayerCanvas } from "@/components/workspace/canvas";
import { parseLayer, parsePane } from "@/components/workspace/types";
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

  return (
    <WorkspaceShell
      projectName={project.name}
      subtitle={`Status: ${project.status}`}
      layer={layer}
      pane={pane}
      // The project row is real. Everything the layers show is still simulated,
      // and reads from the shared demo fixtures.
      ledger={DEMO_PROJECT.ledger}
      basePath={`/app/p/${project.id}`}
      conversation={<Conversation project={DEMO_PROJECT} />}
      canvas={<LayerCanvas layer={layer} project={DEMO_PROJECT} />}
    />
  );
}
