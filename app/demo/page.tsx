import Link from "next/link";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { LayerCanvas } from "@/components/workspace/canvas";
import { parseLayer, parsePane } from "@/components/workspace/types";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "A finished Architect 2.0 project, open to read without an account.",
};

export default async function DemoPage(props: PageProps<"/demo">) {
  const searchParams = await props.searchParams;
  const layer = parseLayer(searchParams.tab);
  const pane = parsePane(searchParams.pane);

  return (
    <WorkspaceShell
      projectName={DEMO_PROJECT.name}
      subtitle={`${DEMO_PROJECT.company}, demo project`}
      layer={layer}
      pane={pane}
      ledger={DEMO_PROJECT.ledger}
      basePath="/demo"
      readOnly
      banner={
        <div className="border-b border-rule bg-blueprint/10 px-4 py-2 sm:px-6">
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-caption">
            <span>You are reading a finished project. Nothing here changes.</span>
            <Link href="/login" className="text-blueprint underline">
              Sign in to build your own
            </Link>
          </p>
        </div>
      }
      conversation={<Conversation project={DEMO_PROJECT} readOnly />}
      canvas={<LayerCanvas layer={layer} project={DEMO_PROJECT} />}
    />
  );
}
