import type { Metadata } from "next";
import { ImportReport } from "@/components/import/import-report";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

export const metadata: Metadata = {
  title: "Import a repository",
  description:
    "Pick a repository and read the compatibility report before anything runs.",
};

/**
 * Screen 15, signed in. Behind the proxy guard, like everything under /app.
 *
 * The repository list is a fixture (D16). Only the project row is ever real in
 * this product, and importing does not create one.
 */
export default async function ImportPage(props: PageProps<"/app/import">) {
  const searchParams = await props.searchParams;
  const repo = Array.isArray(searchParams.repo)
    ? searchParams.repo[0]
    : (searchParams.repo ?? "");

  return (
    <ImportReport
      examples={DEMO_PROJECT.imports}
      selected={repo}
      basePath="/app/import"
    />
  );
}
