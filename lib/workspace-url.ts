import { parseLayer, parsePane } from "@/components/workspace/types";
import { parseDevice } from "@/components/build/app-preview";
import { parseBuild } from "@/lib/build-state";

/** Parameters the workspace carries in the URL, so every view is linkable. */
const CARRIED = ["tab", "pane", "device", "build", "agent", "depth", "why", "fix"] as const;

type Search = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/**
 * Reads workspace state from the URL and returns a query builder.
 *
 * One helper for both the signed-in workspace and the guest demo, so the two
 * cannot drift (D29). A patch value of "" removes that parameter, which is how
 * the inspector and the trace are closed.
 */
export function workspaceUrl(basePath: string, searchParams: Search) {
  const layer = parseLayer(searchParams.tab);
  const pane = parsePane(searchParams.pane);
  const build = parseBuild(searchParams.build);
  const device = parseDevice(searchParams.device);
  const agent = first(searchParams.agent) ?? "";
  const depth = first(searchParams.depth) === "details" ? "details" : "";
  const why = first(searchParams.why) ?? "";
  const fixApplied = first(searchParams.fix) === "applied";

  const current: Record<string, string> = {
    tab: layer,
    pane,
    device,
    build: build === "none" ? "" : build,
    agent,
    depth,
    why,
    fix: fixApplied ? "applied" : "",
  };

  const query = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const key of CARRIED) {
      const value = key in patch ? patch[key] : current[key];
      if (value) p.set(key, value);
    }
    return `${basePath}?${p.toString()}`;
  };

  return { layer, pane, build, device, agent, depth, why, fixApplied, query };
}

export type WorkspaceUrl = ReturnType<typeof workspaceUrl>;
