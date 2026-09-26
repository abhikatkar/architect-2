import Link from "next/link";
import { LedgerBar } from "./ledger-bar";
import { ThemeToggle } from "@/components/theme-toggle";
import { LAYERS, LAYER_LABELS, type Layer, type Pane } from "./types";
import type { DemoProject } from "@/lib/seed/types";

type ShellProps = {
  projectName: string;
  subtitle?: string;
  layer: Layer;
  pane: Pane;
  project: DemoProject;
  fixApplied?: boolean;
  /** Base path for tab and pane links, e.g. "/demo" or "/app/p/abc". */
  basePath: string;
  readOnly?: boolean;
  theme: "light" | "dark" | "system";
  themeNext: string;
  banner?: React.ReactNode;
  conversation: React.ReactNode;
  canvas: React.ReactNode;
};

function href(basePath: string, layer: Layer, pane: Pane) {
  return `${basePath}?tab=${layer}&pane=${pane}`;
}

/**
 * The workspace shell: header with layer tabs, conversation column, canvas, and
 * the ledger bar.
 *
 * Tab and pane selection live in the URL rather than client state, so every
 * control is a plain link that works before hydration. That is D19 applied to
 * navigation, and it keeps the whole shell a server component.
 */
export function WorkspaceShell({
  projectName,
  subtitle,
  layer,
  pane,
  project,
  fixApplied,
  basePath,
  readOnly,
  theme,
  themeNext,
  banner,
  conversation,
  canvas,
}: ShellProps) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      {banner}

      <header className="border-b border-rule">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:px-6">
          <div className="min-w-0">
            <h1 className="truncate text-lead font-semibold">{projectName}</h1>
            {subtitle ? (
              <p className="truncate text-caption text-graphite">{subtitle}</p>
            ) : null}
          </div>

          <div className="ml-auto flex items-center gap-2">
            {readOnly ? (
              <span className="whitespace-nowrap rounded-input border border-rule px-2 py-1 text-caption text-graphite">
                Read only
              </span>
            ) : null}
            <ThemeToggle current={theme} next={themeNext} />
            <span className="rounded-input border border-rule px-2 py-1 text-caption">
              Share
            </span>
          </div>
        </div>

        {/* Horizontal scroll strip on phone, plain row from tablet up. */}
        <nav aria-label="Layers" className="overflow-x-auto">
          <ul className="flex min-w-max gap-0.5 px-4 pb-2 sm:gap-1 sm:px-6">
            {LAYERS.map((l) => {
              const active = l === layer;
              return (
                <li key={l}>
                  <Link
                    href={href(basePath, l, "canvas")}
                    aria-current={active ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-input px-2 text-body sm:px-3 ${
                      active
                        ? "bg-blueprint text-paper"
                        : "text-graphite hover:text-ink"
                    }`}
                  >
                    {LAYER_LABELS[l]}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </header>

      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <section
          aria-label="Conversation"
          className={`${
            pane === "chat" ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col border-rule p-4 sm:p-6 lg:flex lg:w-80 lg:flex-none lg:border-r desktop:w-90`}
        >
          {conversation}
        </section>

        <section
          aria-label="Canvas"
          className={`${
            pane === "canvas" ? "flex" : "hidden"
          } min-w-0 flex-1 flex-col p-4 sm:p-6 lg:flex`}
        >
          {canvas}
        </section>
      </div>

      {/* Phone only: one pane at a time, switched by a bottom tab bar. */}
      <nav
        aria-label="Panes"
        className="grid grid-cols-2 border-t border-rule lg:hidden"
      >
        {(["chat", "canvas"] as const).map((p) => (
          <Link
            key={p}
            href={href(basePath, layer, p)}
            aria-current={pane === p ? "page" : undefined}
            className={`flex min-h-11 items-center justify-center text-body ${
              pane === p ? "text-blueprint" : "text-graphite"
            }`}
          >
            {p === "chat" ? "Chat" : "Canvas"}
          </Link>
        ))}
      </nav>

      <LedgerBar project={project} fixApplied={fixApplied} />
    </div>
  );
}
