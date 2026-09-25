import { notFound } from "next/navigation";
import { PlanReview } from "@/components/build/plan-review";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { getProject } from "@/lib/projects";

export default async function ProjectPlanPage(
  props: PageProps<"/app/p/[id]/plan">,
) {
  const { id } = await props.params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <PlanReview
      projectName={project.name}
      // The plan text is a fixture. Only the project row is real.
      clarifiers={DEMO_PROJECT.clarifiers}
      plan={DEMO_PROJECT.plan}
      cap={DEMO_PROJECT.ledger.cap}
      action={`/app/p/${project.id}/build`}
      backHref={`/app/p/${project.id}`}
    />
  );
}
