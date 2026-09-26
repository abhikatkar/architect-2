import Link from "next/link";
import { CHECKS, LOGS, TERMINAL } from "@/lib/seed/code";
import { checksPassed } from "@/lib/seed/totals";
import { REAL_CHANGE } from "@/lib/seed/real-change";
import { JEV_EXAMPLES } from "@/lib/jev/examples";
import { ACT_ALONE_BAR } from "@/lib/jev/questions";

const TABS = [
  { id: "terminal", label: "Terminal" },
  { id: "logs", label: "Logs" },
  { id: "checks", label: "Checks" },
] as const;

type Panel = (typeof TABS)[number]["id"];

/**
 * Terminal, Logs and Checks.
 *
 * On a phone this is not a bottom panel. At 375 by 667 the header, the layer
 * strip, the pane switch and the ledger bar already own most of the height, so
 * a pinned pane would get about 120px and would collide with the two bars
 * already fixed to the bottom. Below lg it is a normal section in document
 * flow, and the terminal is absent by D22 rather than shown and broken.
 */
export function BottomPanel({
  panel,
  query,
}: {
  panel: Panel;
  query: (patch: Record<string, string>) => string;
}) {
  const passed = checksPassed(CHECKS);
  // The grounding examples are this repo's live data, not Northwind's.
  const graded = JEV_EXAMPLES.filter((e) => e.agentId === "grounding-checker");
  const correct = graded.filter((e) => {
    const p = e.answers.find((a) => a.key === "grounded")?.probability ?? 0;
    return (p >= ACT_ALONE_BAR) === (e.expected === "pass");
  }).length;

  return (
    <section
      aria-label="Terminal, logs and checks"
      className="min-w-0 rounded-panel border border-rule"
    >
      <nav aria-label="Bottom panel" className="flex gap-1 border-b border-rule p-1">
        {TABS.map((t) => {
          const active = t.id === panel;
          // The terminal is not offered on a phone, and the reason is said out
          // loud rather than the tab quietly missing.
          const phoneHidden = t.id === "terminal" ? "hidden lg:inline-flex" : "inline-flex";
          return (
            <Link
              key={t.id}
              href={query({ panel: t.id === "terminal" ? "" : t.id })}
              aria-current={active ? "page" : undefined}
              prefetch={false}
              className={`${phoneHidden} min-h-11 items-center rounded-input px-3 text-caption ${
                active ? "bg-blueprint text-paper" : "text-graphite"
              }`}
            >
              {t.label}
            </Link>
          );
        })}
      </nav>

      <div className="min-w-0 p-3">
        {panel === "terminal" ? (
          <>
            <div className="min-w-0 overflow-x-auto">
              <pre className="font-mono text-caption">
                {TERMINAL.map((l) => (l.stream === "in" ? `$ ${l.text}` : l.text)).join("\n")}
              </pre>
            </div>
            <p className="mt-2 text-caption text-graphite lg:hidden">
              The terminal is not shown on a phone. Editing and running commands
              on a phone keyboard is a poor experience, so the demo does not
              pretend otherwise. See D22.
            </p>
          </>
        ) : null}

        {panel === "logs" ? (
          <div className="min-w-0 overflow-x-auto">
            <pre className="font-mono text-caption">
              {LOGS.map((l) => `${l.at}  ${l.level.padEnd(5)} ${l.source.padEnd(11)} ${l.text}`).join("\n")}
            </pre>
          </div>
        ) : null}

        {panel === "checks" ? (
          <div className="flex min-w-0 flex-col gap-3">
            <div className="min-w-0">
              <p className="text-caption text-graphite">
                Northwind Helpline, simulated. {passed} of {CHECKS.length} passed.
              </p>
              <ul className="mt-2 flex flex-col gap-1">
                {CHECKS.map((c) => (
                  <li key={c.name} className="flex flex-wrap items-baseline gap-x-2 text-small">
                    {/* Status carries a word and a mark, never colour alone (D20). */}
                    <span className={c.state === "pass" ? "text-live" : "text-fault"}>
                      {c.state === "pass" ? "ok" : "x"} {c.state}
                    </span>
                    <span className="font-medium">{c.name}</span>
                    <span className="min-w-0 text-caption text-graphite">{c.detail}</span>
                    <span className="ml-auto font-mono text-caption text-graphite">
                      {(c.ms / 1000).toFixed(2)} s
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="min-w-0 rounded-input border border-blueprint p-3">
              <p className="text-caption text-blueprint">
                Real change, from this repository
              </p>
              <p className="mt-1 max-w-[72ch] text-small">
                Everything above is simulated. This one is not: it is the commit
                that tightened the grounding criteria in the repo you are reading
                now, and its checks are live data.
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-x-2 text-small">
                <span className="font-mono text-graphite">{REAL_CHANGE.shortSha}</span>
                <span className="min-w-0">{REAL_CHANGE.subject}</span>
                <span className="text-caption text-graphite">{REAL_CHANGE.date}</span>
              </p>
              <p className="mt-1 text-caption">
                <span className="text-live">ok pass</span>{" "}
                <span className="text-graphite">
                  {correct} of {graded.length} labeled drafts land on the side we
                  expected, at a bar of {Math.round(ACT_ALONE_BAR * 100)}%
                </span>
              </p>
              <a
                href={REAL_CHANGE.url}
                className="mt-2 inline-flex min-h-11 items-center text-caption text-blueprint underline"
              >
                Open this commit on GitHub
              </a>
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}
