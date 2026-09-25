import Link from "next/link";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { WorkspaceCanvas } from "@/components/build/workspace-canvas";
import { workspaceUrl } from "@/lib/workspace-url";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

export const metadata: Metadata = {
  title: "Demo",
  description:
    "A finished Architect 2.0 project, open to read without an account.",
};

const BASE = "/demo";

export default async function DemoPage(props: PageProps<"/demo">) {
  const searchParams = await props.searchParams;
  const { layer, pane, build, device, agent, depth, why, fixApplied, query } =
    workspaceUrl(BASE, searchParams);

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
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
            <span>You are reading a finished project. Nothing here changes.</span>
            <Link href="/demo/plan" className="text-blueprint underline">
              See the plan gate
            </Link>
            <Link href="/demo?tab=app&build=running" className="text-blueprint underline">
              Watch a build
            </Link>
            <Link href="/demo?tab=app&build=failed" className="text-blueprint underline">
              See one fail
            </Link>
            <Link href="/login" className="text-blueprint underline">
              Sign in to build your own
            </Link>
          </p>
        </div>
      }
      conversation={
        <Conversation
          project={DEMO_PROJECT}
          readOnly
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
          // The demo never writes to the database (D29).
          finishAction={null}
        />
      }
    />
  );
}
