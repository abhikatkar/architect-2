import { notFound } from "next/navigation";
import { PlanReview } from "@/components/build/plan-review";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { spentBefore } from "@/lib/seed/totals";
import { getProject } from "@/lib/projects";
import { prefersDetails } from "@/lib/profiles";

export default async function ProjectPlanPage(
  props: PageProps<"/app/p/[id]/plan">,
) {
  const { id } = await props.params;
  const project = await getProject(id);
  if (!project) notFound();

  const preferDetails = await prefersDetails();

  return (
    <PlanReview
      projectName={project.name}
      // The plan text is a fixture. Only the project row is real.
      clarifiers={DEMO_PROJECT.clarifiers}
      plan={DEMO_PROJECT.plan}
      cap={DEMO_PROJECT.ledger.cap}
      /* This gate reviews the first build, so nothing has been spent yet.
         It used to be handed the month's whole spend, which counted this
         build's own $1.46 as already spent against the cap. */
      spent={spentBefore(DEMO_PROJECT, DEMO_PROJECT.versions[0].label)}
      action={`/app/p/${project.id}/build`}
      backHref={`/app/p/${project.id}`}
      preferDetails={preferDetails}
    />
  );
}
