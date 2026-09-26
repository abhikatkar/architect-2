import type { Metadata } from "next";
import { ImportReport } from "@/components/import/import-report";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

export const metadata: Metadata = {
  title: "Import a repository | Architect 2.0 demo",
  description:
    "Pick a repository and read the compatibility report before anything runs.",
};

/**
 * Screen 15, for a signed-out visitor.
 *
 * The signed-in route lives at /app/import, which the proxy guard protects, so
 * the demo needs a twin outside that prefix. Same component, same fixtures, so
 * the two cannot drift (D29).
 */
export default async function DemoImportPage(props: PageProps<"/demo/import">) {
  const searchParams = await props.searchParams;
  const repo = Array.isArray(searchParams.repo)
    ? searchParams.repo[0]
    : (searchParams.repo ?? "");

  return (
    <ImportReport
      examples={DEMO_PROJECT.imports}
      selected={repo}
      basePath="/demo/import"
      demo
    />
  );
}
