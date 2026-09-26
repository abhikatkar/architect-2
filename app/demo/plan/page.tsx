import type { Metadata } from "next";
import { PlanReview } from "@/components/build/plan-review";
import { DEMO_PROJECT } from "@/lib/seed/northwind";
import { ledgerSpend } from "@/lib/seed/totals";

export const metadata: Metadata = {
  title: "Plan review | Northwind Helpline demo",
  description: "Read the plan and the cost before anything runs.",
};

export default function DemoPlanPage() {
  return (
    <PlanReview
      projectName={DEMO_PROJECT.name}
      clarifiers={DEMO_PROJECT.clarifiers}
      plan={DEMO_PROJECT.plan}
      cap={DEMO_PROJECT.ledger.cap}
      spent={ledgerSpend(DEMO_PROJECT)}
      // The demo writes nothing, so Build is a link rather than a post (D29).
      action={null}
      demoHref="/demo?tab=app&build=running"
      backHref="/demo"
    />
  );
}
