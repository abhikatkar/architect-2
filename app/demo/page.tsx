import Link from "next/link";
import type { Metadata } from "next";
import { WorkspaceShell } from "@/components/workspace/shell";
import { Conversation } from "@/components/workspace/conversation";
import { WorkspaceCanvas } from "@/components/build/workspace-canvas";
import { workspaceUrl } from "@/lib/workspace-url";
import { currentTheme } from "@/lib/theme";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

export const metadata: Metadata = {
  title: "Northwind Helpline demo | Architect 2.0",
  description:
    "A finished Architect 2.0 project, open to read without an account.",
};

const BASE = "/demo";

export default async function DemoPage(props: PageProps<"/demo">) {
  const searchParams = await props.searchParams;
  const {
    layer, pane, build, device, agent, depth, why, fixApplied, jev, jevResult, jevSig, query,
  } =
    workspaceUrl(BASE, searchParams, "guided", "app");
  const theme = await currentTheme();

  return (
    <WorkspaceShell
      projectName={DEMO_PROJECT.name}
      subtitle={`${DEMO_PROJECT.company}, demo project`}
      layer={layer}
      pane={pane}
      project={DEMO_PROJECT}
      fixApplied={fixApplied}
      theme={theme}
      themeNext={query({})}
      basePath="/demo"
      readOnly
      banner={
        <div className="border-b border-rule bg-blueprint/10 px-4 py-2 sm:px-6">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
            <span>You are reading a finished project. Nothing here changes.</span>
            <Link
              href="/demo?tab=agents&why=r-104&pane=canvas"
              className="text-blueprint underline"
            >
              Why did it do that?
            </Link>
            <Link href="/demo/plan" className="text-blueprint underline">
              See the plan gate
            </Link>
            <Link href="/demo?tab=app&build=running&pane=canvas" className="text-blueprint underline">
              Watch a build
            </Link>
            <Link href="/demo?tab=app&build=failed&pane=canvas" className="text-blueprint underline">
              See one fail
            </Link>
            <Link href="/architecture" className="text-blueprint underline">
              See the architecture
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
          // No user on the demo path, so it always starts guided.
          preferDetails={false}
          jev={jev}
          jevResult={jevResult}
          jevSig={jevSig}
          basePath={BASE}
          query={query}
          // The demo never writes to the database (D29).
          finishAction={null}
        />
      }
    />
  );
}
