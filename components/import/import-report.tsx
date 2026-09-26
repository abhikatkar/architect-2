import Link from "next/link";
import type { ImportExample, SupportLevel } from "@/lib/seed/types";
import { DemoNote } from "@/components/ui/sheet";

/**
 * Screen 15. Pick a repo, then read the compatibility report before anything
 * runs.
 *
 * This screen exists because of one finding. Importing a Flask repository
 * produced no compatibility error at any step before Send, on a branch that was
 * not the repository's default, and showed no cost. An unsupported repo did not
 * fail early, it failed after credits had been spent.
 *
 * So the order here is the whole design: repo, branch, subfolder, then the
 * report, then Import. Nothing is charged before the last step, and the screen
 * says so rather than leaving it to be discovered.
 */

const LEVELS: { id: SupportLevel; label: string; means: string }[] = [
  { id: "full", label: "Full", means: "Architect can build on this as it is" },
  {
    id: "partial",
    label: "Partial",
    means: "Some of it is left alone, and the report says which parts",
  },
  {
    id: "unsupported",
    label: "Not supported",
    means: "Architect will not import this, and will not charge you to find out",
  },
];

function SupportBadge({ level }: { level: SupportLevel }) {
  const tone =
    level === "full"
      ? "border-live text-live"
      : level === "partial"
        ? "border-cost text-cost"
        : "border-fault text-fault";
  const word = LEVELS.find((l) => l.id === level)?.label ?? level;
  // Status carries a word, never colour alone (D20).
  return (
    <span className={`rounded-input border px-2 py-0.5 text-caption ${tone}`}>
      {level === "full" ? "ok" : level === "partial" ? "part" : "x"} {word}
    </span>
  );
}

/** What Architect would add or change, per support level. */
function changesFor(example: ImportExample) {
  if (example.support === "full") {
    return [
      "Add an agents folder with the agents you design",
      "Add a route for the agent runtime",
      "Leave your existing pages and components untouched",
    ];
  }
  if (example.support === "partial") {
    return [
      "Add agents and a new interface alongside your app",
      "Add a small service the agents call",
      "Leave your Python routes exactly as they are",
    ];
  }
  return ["Nothing. The import stops before it starts."];
}

export function ImportReport({
  examples,
  selected,
  basePath,
  demo,
}: {
  examples: ImportExample[];
  selected: string;
  basePath: string;
  /** The demo twin says so, and no route handler exists behind it. */
  demo?: boolean;
}) {
  const current =
    examples.find((e) => e.repo === selected) ?? examples[0];

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-4xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex min-w-0 flex-col gap-2">
        <p className="text-caption text-graphite">Architect 2.0</p>
        <h1 className="text-title font-semibold">Import a repository</h1>
        <p className="max-w-[72ch] text-body text-graphite">
          Pick the repository, read what Architect would do to it, then import.
          Nothing is charged before you press Import.
        </p>
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
          <Link href={demo ? "/demo" : "/app"} className="text-blueprint underline">
            {demo ? "Back to the demo" : "Back to your projects"}
          </Link>
        </p>
      </header>

      <section className="min-w-0 rounded-panel border border-rule p-4">
        <h2 className="text-lead font-semibold">Repository</h2>
        <ul className="mt-3 flex flex-col gap-2">
          {examples.map((e) => {
            const active = e.repo === current.repo;
            return (
              <li key={e.repo} className="min-w-0">
                <Link
                  href={`${basePath}?repo=${encodeURIComponent(e.repo)}`}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-input border p-3 ${
                    active ? "border-blueprint" : "border-rule"
                  }`}
                >
                  <span className="font-mono text-small">{e.repo}</span>
                  <SupportBadge level={e.support} />
                  <span className="text-caption text-graphite">{e.detected}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="min-w-0 rounded-panel border border-rule p-4">
        <h2 className="text-lead font-semibold">Branch and folder</h2>
        <dl className="mt-3 flex min-w-0 flex-col gap-2">
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-caption text-graphite">Branch</dt>
            <dd className="font-mono text-small">{current.branch}</dd>
            {/* The teardown found a branch preselected that was not the
                repository's default. Saying which one this is, and why, is the
                fix. */}
            <dd className="text-caption text-live">ok the repository default</dd>
          </div>
          <div className="flex flex-wrap items-baseline gap-x-2">
            <dt className="text-caption text-graphite">Folder</dt>
            <dd className="font-mono text-small">
              {current.subfolder ?? "the whole repository"}
            </dd>
            <dd className="text-caption text-graphite">
              {current.subfolder
                ? "A monorepo, so only this folder is imported"
                : "No monorepo detected"}
            </dd>
          </div>
        </dl>
      </section>

      <section className="min-w-0 rounded-panel border border-rule p-4">
        <h2 className="text-lead font-semibold">Compatibility report</h2>
        <p className="mt-1 max-w-[72ch] text-small text-graphite">
          Produced before anything runs, so an unsupported repository fails here
          rather than after a build has been paid for.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="text-small">Detected</span>
          <span className="font-mono text-small">{current.detected}</span>
          <SupportBadge level={current.support} />
        </div>

        {current.note ? (
          <p className="mt-2 max-w-[72ch] text-small">{current.note}</p>
        ) : null}

        <h3 className="mt-4 text-body font-medium">What Architect would change</h3>
        <ul className="mt-1 flex flex-col gap-1">
          {changesFor(current).map((c) => (
            <li key={c} className="text-small">
              {c}
            </li>
          ))}
        </ul>

        <h3 className="mt-4 text-body font-medium">Estimate</h3>
        <p className="mt-1 text-small">
          {current.support === "unsupported" ? (
            <span className="text-graphite">
              No estimate. Nothing would run.
            </span>
          ) : (
            <>
              <span className="font-mono">about 3 to 6 min</span> and{" "}
              <span className="font-mono text-cost">$0.60 to $1.10</span>
              <span className="text-graphite">
                {" "}
                . First import of this repository, so the estimate may vary.
              </span>
            </>
          )}
        </p>

        <h3 className="mt-4 text-body font-medium">What the levels mean</h3>
        <ul className="mt-1 flex flex-col gap-1">
          {LEVELS.map((l) => (
            <li key={l.id} className="flex flex-wrap gap-x-2 text-caption">
              <span className="font-medium">{l.label}</span>
              <span className="min-w-0 text-graphite">{l.means}</span>
            </li>
          ))}
        </ul>
      </section>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <span className="inline-flex min-h-11 cursor-default items-center rounded-input bg-blueprint px-4 text-body text-paper">
          Import {current.repo}
        </span>
        <DemoNote>
          Demo action. Nothing is imported and nothing is charged. In the real
          product this is the first step that costs anything.
        </DemoNote>
      </div>
    </main>
  );
}
