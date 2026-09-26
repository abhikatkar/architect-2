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
  // Code tab. `accept` and `revert` are dot separated id lists, because
  // URLSearchParams leaves only * - . and _ unescaped and a comma would cost
  // three characters each. Ids are validated against the fixture, so a
  // hand-typed one is dropped rather than rendered.
  "file",
  "diff",
  "panel",
  "accept",
  "revert",
  // Deploy and GitHub. `sheet` names which consent or confirm sheet is open,
  // so a sheet is a shareable link and nothing client side decides it.
  "sheet",
  "rollback",
  // Screen 11: which framework the picker has selected.
  "framework",
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
  const file = first(searchParams.file) ?? "";
  const diff = first(searchParams.diff) ?? "";
  const rawPanel = first(searchParams.panel);
  const panel: "terminal" | "logs" | "checks" =
    rawPanel === "logs" || rawPanel === "checks" ? rawPanel : "terminal";
  const accept = first(searchParams.accept) ?? "";
  const revert = first(searchParams.revert) ?? "";
  const sheet = first(searchParams.sheet) ?? "";
  const rollback = first(searchParams.rollback) ?? "";
  const framework = first(searchParams.framework) ?? "";

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
    file,
    diff,
    // The default stays out of the URL, the same way depth and device do.
    panel: panel === "terminal" ? "" : panel,
    accept,
    revert,
    sheet,
    rollback,
    framework,
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
    file,
    diff,
    panel,
    accept,
    revert,
    sheet,
    rollback,
    framework,
    query,
  };
}

export type WorkspaceUrl = ReturnType<typeof workspaceUrl>;
