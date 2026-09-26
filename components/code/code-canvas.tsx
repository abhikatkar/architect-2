import Link from "next/link";
import type { ChangeRequest, CodeFile, DemoProject } from "@/lib/seed/types";
import { changeRequests, codeFiles } from "@/lib/seed/code";
import {
  addedLines,
  allDiffIds,
  changedFileCount,
  removedLines,
  requestVerdict,
} from "@/lib/seed/totals";
import { DiffView } from "./diff-view";
import { BottomPanel } from "./bottom-panel";

/**
 * The Code tab: file tree, a read-only file view, changes grouped by request,
 * and the bottom panel.
 *
 * Every selection and every verdict is a query parameter, so the whole screen
 * is a server component and every control is a plain link that works before
 * hydration (D25, D27). Accept and revert are demo actions, labeled as such
 * next to the controls, like the fix button in the trace.
 *
 * A request carries no verdict of its own. It reads back from its files, so a
 * request can never claim to be accepted while a file inside it is reverted.
 */

const ids = (value: string, valid: Set<string>) =>
  value.split(".").filter((id) => valid.has(id));

/** Fixture order, never click order, so the same set is always the same URL. */
const join = (set: Set<string>, all: string[]) =>
  all.filter((id) => set.has(id)).join(".");

function Tree({
  files,
  selected,
  query,
}: {
  files: CodeFile[];
  selected: string;
  query: (patch: Record<string, string>) => string;
}) {
  const folders = new Map<string, CodeFile[]>();
  for (const file of files) {
    const cut = file.path.lastIndexOf("/");
    const dir = cut === -1 ? "/" : file.path.slice(0, cut);
    if (!folders.has(dir)) folders.set(dir, []);
    folders.get(dir)!.push(file);
  }

  return (
    <nav aria-label="Files" className="min-w-0">
      <p className="max-w-[72ch] text-caption text-graphite">
        {files.length} files, read only.{" "}
        {files.filter((f) => f.body).length} of them open here. The rest are
        listed so the tree is the real one, not a sample.
      </p>
      <ul className="mt-2 flex flex-col gap-2">
        {[...folders.entries()].map(([dir, group]) => (
          <li key={dir} className="min-w-0">
            <p className="font-mono text-caption text-graphite">{dir}</p>
            <ul className="mt-0.5 flex flex-col">
              {group.map((file) => {
                const name = file.path.slice(file.path.lastIndexOf("/") + 1);
                const active = file.id === selected;
                if (!file.body) {
                  return (
                    <li
                      key={file.id}
                      className="flex min-h-11 min-w-0 items-center px-2 font-mono text-caption text-graphite"
                    >
                      <span className="truncate">{name}</span>
                    </li>
                  );
                }
                return (
                  <li key={file.id} className="min-w-0">
                    <Link
                      href={query({ file: file.id, diff: "" })}
                      aria-current={active ? "page" : undefined}
                      prefetch={false}
                      className={`flex min-h-11 min-w-0 items-center rounded-input px-2 font-mono text-caption ${
                        active ? "bg-blueprint text-paper" : "text-ink underline"
                      }`}
                    >
                      <span className="truncate">{name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}

function Verdict({ state }: { state: ReturnType<typeof requestVerdict> | "accepted" | "reverted" | "open" }) {
  if (state === "accepted") return <span className="text-live">ok accepted</span>;
  if (state === "reverted") return <span className="text-fault">x reverted</span>;
  if (state === "mixed") return <span className="text-cost">part accepted</span>;
  return <span className="text-graphite">not decided yet</span>;
}

export function CodeCanvas({
  project,
  fixApplied,
  file,
  diff,
  panel,
  accept,
  revert,
  query,
}: {
  project: DemoProject;
  fixApplied: boolean;
  file: string;
  diff: string;
  panel: "terminal" | "logs" | "checks";
  accept: string;
  revert: string;
  query: (patch: Record<string, string>) => string;
}) {
  const files = codeFiles(project);
  const changes = changeRequests(project, fixApplied);
  const all = allDiffIds(changes);
  const valid = new Set(all);

  const accepted = ids(accept, valid);
  const reverted = ids(revert, valid);
  // An id in both lists can only come from a hand-typed address. Revert wins,
  // so every id has exactly one state rather than an undefined one.
  const acceptedNet = accepted.filter((id) => !reverted.includes(id));

  const pathOf = (fileId: string) =>
    files.find((f) => f.id === fileId)?.path ?? fileId;

  const openFile = files.find((f) => f.id === file);
  const openDiff = changes
    .flatMap((c) => c.diffs.map((d) => ({ change: c, d })))
    .find((x) => x.d.id === diff);

  const verdictHref = (id: string, action: "accept" | "revert" | "clear") => {
    const a = new Set(acceptedNet);
    const r = new Set(reverted);
    a.delete(id);
    r.delete(id);
    if (action === "accept") a.add(id);
    if (action === "revert") r.add(id);
    return query({ accept: join(a, all), revert: join(r, all) });
  };

  const bulkHref = (change: ChangeRequest, action: "accept" | "revert") => {
    const a = new Set(acceptedNet);
    const r = new Set(reverted);
    for (const d of change.diffs) {
      a.delete(d.id);
      r.delete(d.id);
      if (action === "accept") a.add(d.id);
      else r.add(d.id);
    }
    return query({ accept: join(a, all), revert: join(r, all) });
  };

  const stateOf = (id: string) =>
    reverted.includes(id) ? "reverted" : acceptedNet.includes(id) ? "accepted" : "open";

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-title font-semibold">Code</h2>
          <span className="max-w-[72ch] text-small text-graphite">
            Every change the agents made, grouped by the request that caused it.
          </span>
        </div>
        <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
          {/* D48: read only at every width, and it says so rather than
              offering an editor that discards what you type. */}
          <span className="inline-flex min-h-11 cursor-default items-center rounded-input border border-rule px-3 text-body text-graphite">
            Edit
          </span>
          <span className="max-w-[72ch] text-caption text-graphite">
            In the full product this opens an editor. This demo is read-only.
          </span>
        </p>
      </div>

      <div className="flex min-w-0 flex-col gap-4 lg:flex-row">
        {/* On a phone the tree comes after the changes: 42 file rows before
            the thing you opened the tab to review is the same mistake as the
            inspector sitting 800px down. Order is CSS, so the laptop is
            unchanged and no JavaScript is involved. */}
        <div className="order-2 min-w-0 lg:order-1 lg:w-64 lg:flex-none">
          <Tree files={files} selected={file} query={query} />
        </div>

        <div className="order-1 flex min-w-0 flex-1 flex-col gap-4 lg:order-2">
          {openDiff ? (
            <section className="min-w-0 rounded-panel border border-rule p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="text-lead font-semibold">{openDiff.change.message}</h3>
                <Link
                  href={query({ diff: "" })}
                  prefetch={false}
                  className="ml-auto inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
                >
                  Close
                </Link>
              </div>
              <p className="mt-1 max-w-[72ch] text-small text-graphite">
                Asked for: {openDiff.change.request}
              </p>
              <div className="mt-3 min-w-0">
                <DiffView diff={openDiff.d} path={pathOf(openDiff.d.fileId)} />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-rule pt-3">
                <Link
                  href={verdictHref(openDiff.d.id, "accept")}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center rounded-input bg-blueprint px-3 text-body text-paper"
                >
                  Accept this file
                </Link>
                <Link
                  href={verdictHref(openDiff.d.id, "revert")}
                  prefetch={false}
                  className="inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-body"
                >
                  Revert this file
                </Link>
                <span className="text-caption">
                  <Verdict state={stateOf(openDiff.d.id)} />
                </span>
                <span className="max-w-[72ch] text-caption text-graphite">
                  Demo action. The verdict lives in this page address and is not
                  saved anywhere.
                </span>
              </div>
            </section>
          ) : openFile ? (
            <section className="min-w-0 rounded-panel border border-rule p-4">
              <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <h3 className="font-mono text-body">{openFile.path}</h3>
                <Link
                  href={query({ file: "" })}
                  prefetch={false}
                  className="ml-auto inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
                >
                  Close
                </Link>
              </div>
              {openFile.body ? (
                <div className="mt-3 min-w-0 overflow-x-auto rounded-input border border-rule p-3">
                  <pre className="font-mono text-caption">{openFile.body}</pre>
                </div>
              ) : (
                <p className="mt-3 max-w-[72ch] text-small text-graphite">
                  This path is in the repository, but the demo does not carry its
                  contents. The files the changes below touch all open.
                </p>
              )}
            </section>
          ) : null}

          <section className="min-w-0 rounded-panel border border-rule p-4">
            <h3 className="text-lead font-semibold">Changes</h3>
            <ul className="mt-3 flex flex-col gap-3">
              {changes.map((change) => {
                const verdict = requestVerdict(change, acceptedNet, reverted);
                return (
                  <li key={change.id} className="min-w-0 border-t border-rule pt-3 first:border-0 first:pt-0">
                    <p className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-caption text-graphite">
                        {change.version ? change.id : "pending"}
                      </span>
                      <span className="min-w-0 text-body font-medium">{change.message}</span>
                      <span className="text-caption text-graphite">
                        {changedFileCount(change)}{" "}
                        {changedFileCount(change) === 1 ? "file" : "files"}
                      </span>
                      <span className="text-caption text-graphite">{change.ago}</span>
                      <span className="text-caption">
                        <Verdict state={verdict} />
                      </span>
                    </p>
                    <p className="mt-0.5 max-w-[72ch] text-caption text-graphite">
                      Asked for: {change.request}
                    </p>

                    <ul className="mt-2 flex flex-col gap-1">
                      {change.diffs.map((d) => (
                        <li
                          key={d.id}
                          className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1"
                        >
                          <Link
                            href={query({ diff: d.id, file: "" })}
                            prefetch={false}
                            className="inline-flex min-h-11 min-w-0 items-center font-mono text-caption text-blueprint underline"
                          >
                            <span className="truncate">{pathOf(d.fileId)}</span>
                          </Link>
                          <span className="text-caption text-live">+{addedLines(d)}</span>
                          <span className="text-caption text-fault">-{removedLines(d)}</span>
                          <span className="text-caption">
                            <Verdict state={stateOf(d.id)} />
                          </span>
                          <Link
                            href={verdictHref(d.id, "accept")}
                            prefetch={false}
                            className="inline-flex min-h-11 items-center rounded-input border border-rule px-2 text-caption"
                          >
                            Accept
                          </Link>
                          <Link
                            href={verdictHref(d.id, "revert")}
                            prefetch={false}
                            className="inline-flex min-h-11 items-center rounded-input border border-rule px-2 text-caption"
                          >
                            Revert
                          </Link>
                        </li>
                      ))}
                    </ul>

                    <p className="mt-2 flex flex-wrap items-center gap-2">
                      <Link
                        href={bulkHref(change, "accept")}
                        prefetch={false}
                        className="inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
                      >
                        Accept all {changedFileCount(change)}
                      </Link>
                      <Link
                        href={bulkHref(change, "revert")}
                        prefetch={false}
                        className="inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
                      >
                        Revert all {changedFileCount(change)}
                      </Link>
                      <span className="max-w-[72ch] text-caption text-graphite">
                        Demo action. Nothing is written: the verdict travels in
                        the page address.
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </section>

          <BottomPanel panel={panel} query={query} />
        </div>
      </div>
    </div>
  );
}
