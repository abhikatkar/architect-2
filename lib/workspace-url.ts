import {
  parseLayer,
  parsePane,
  type Layer,
  type Pane,
} from "@/components/workspace/types";
import { parseDevice } from "@/components/build/app-preview";
import { parseBuild } from "@/lib/build-state";

/** Parameters the workspace carries in the URL, so every view is linkable. */
const CARRIED = [
  "tab",
  "pane",
  "device",
  "build",
  "agent",
  "depth",
  "why",
  "fix",
  "jev",
  "jevResult",
  "jevSig",
] as const;

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
export function workspaceUrl(
  basePath: string,
  searchParams: Search,
  /** From the user's profile. The URL always beats it, so links stay linkable. */
  defaultDepth: "guided" | "details" = "guided",
  /** The demo opens on App so a reviewer sees the working app first. */
  defaultLayer: Layer = "plan",
  /**
   * Which pane a phone lands on. Above lg both panes render, so this only
   * decides what a narrow screen sees first. The demo lands on the canvas,
   * because a reviewer opening it on a phone should meet the running app, not
   * the chat rail beside it.
   */
  defaultPane: Pane = "chat",
) {
  const layer = parseLayer(searchParams.tab, defaultLayer);
  const pane = parsePane(searchParams.pane, defaultPane);
  const build = parseBuild(searchParams.build);
  const device = parseDevice(searchParams.device);
  const agent = first(searchParams.agent) ?? "";
  const explicitDepth = first(searchParams.depth);
  const depth =
    explicitDepth === "details"
      ? "details"
      : explicitDepth === "guided"
        ? ""
        : defaultDepth === "details"
          ? "details"
          : "";
  const why = first(searchParams.why) ?? "";
  const fixApplied = first(searchParams.fix) === "applied";
  const jev = first(searchParams.jev) ?? "";
  const jevResult = first(searchParams.jevResult) ?? "";
  const jevSig = first(searchParams.jevSig) ?? "";

  const current: Record<string, string> = {
    tab: layer,
    pane,
    device: device === "auto" ? "" : device,
    build: build === "none" ? "" : build,
    agent,
    depth,
    why,
    fix: fixApplied ? "applied" : "",
    jev,
    jevResult,
    jevSig,
  };

  const query = (patch: Record<string, string>) => {
    const p = new URLSearchParams();
    for (const key of CARRIED) {
      const value = key in patch ? patch[key] : current[key];
      if (value) p.set(key, value);
    }
    return `${basePath}?${p.toString()}`;
  };

  return {
    layer,
    pane,
    build,
    device,
    agent,
    depth,
    why,
    fixApplied,
    jev,
    jevResult,
    jevSig,
    query,
  };
}

export type WorkspaceUrl = ReturnType<typeof workspaceUrl>;
