import Link from "next/link";
import { CreativityScale } from "./agent-inspector";
import type { Agent, FixPreview, RunTrace } from "@/lib/seed/types";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

/**
 * Marks the words the source does not support.
 *
 * Three signals, never color alone: the fault color, an underline, and a
 * "Not in source" label. The design system requires that everywhere, and this
 * is the one phrase the entire screen exists to point at.
 */
function MarkedDraft({ text, unsupported }: { text: string; unsupported: string }) {
  const at = text.indexOf(unsupported);
  if (at === -1) return <span>{text}</span>;

  return (
    <span>
      {text.slice(0, at)}
      <mark className="bg-transparent font-medium text-fault underline decoration-fault decoration-2 underline-offset-2">
        {unsupported}
      </mark>
      <span className="ml-1 rounded-input border border-fault px-1 py-0.5 text-caption text-fault">
        Not in source
      </span>
      {text.slice(at + unsupported.length)}
    </span>
  );
}

type Props = {
  trace: RunTrace;
  fix: FixPreview;
  answerAgent: Agent;
  applied: boolean;
  preferDetails?: boolean;
  query: (patch: Record<string, string>) => string;
};

/**
 * Screen 10. The guided reliability loop.
 *
 * This productizes the eight technical inferences it took to diagnose one
 * over-escalating agent by hand while building GroundTruth. Nothing here names
 * a parameter until Details is opened, and nothing is ever applied silently
 * (D33).
 */
export function RunTraceView({
  trace,
  fix,
  answerAgent,
  applied,
  preferDetails,
  query,
}: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0">
          <h2 className="text-title font-semibold">Why did it do that?</h2>
          <p className="mt-1 max-w-[72ch] text-body text-graphite">
            The customer asked{" "}
            <span className="text-ink">&ldquo;{trace.question}&rdquo;</span> and the
            app passed it to a person instead of answering.
          </p>
        </div>
        <Link
          href={query({ why: "", fix: "" })}
          className="ml-auto inline-flex min-h-11 items-center rounded-input border border-rule-strong px-3 text-caption"
        >
          Close
        </Link>
      </div>

      {/* 1. What happened, in order, in plain language. */}
      <ol className="flex min-w-0 flex-col gap-2">
        {trace.steps.map((s, i) => (
          <li key={s.actor} className="flex min-w-0 gap-3">
            <span
              aria-hidden="true"
              className="mt-0.5 font-mono text-caption text-graphite"
            >
              {i + 1}
            </span>
            <div className="min-w-0">
              <p className="text-body">
                <span className="font-medium">{s.actor}</span>
                <span className="text-graphite"> {s.summary}</span>
              </p>
            </div>
          </li>
        ))}
      </ol>

      {/* 2. The moment it went wrong, shown rather than described. */}
      <div className="flex min-w-0 flex-col gap-2 rounded-panel border border-rule p-4">
        <h3 className="text-lead font-semibold">Where it went wrong</h3>
        <div className="min-w-0">
          <p className="text-caption text-graphite">The help article says</p>
          <p className="text-body">{fix.source}</p>
        </div>
        <div className="min-w-0">
          <p className="text-caption text-graphite">The agent wrote</p>
          <p className="text-body">
            <MarkedDraft text={fix.before} unsupported={fix.unsupported} />
          </p>
        </div>
        <p className="max-w-[72ch] text-small text-graphite">
          Those words are not in the article, so the Grounding Checker refused
          the answer and passed the question to a person. That is the safe
          behavior, and it is why the customer waited.
        </p>
      </div>

      {/* 3. The fix, in plain language, with the change shown as a direction. */}
      <div className="flex min-w-0 flex-col gap-3 rounded-panel border border-rule p-4">
        <h3 className="text-lead font-semibold">Suggested fix</h3>
        <p className="text-body">{fix.summary}</p>

        <div className="max-w-[260px]">
          <CreativityScale
            value={answerAgent.creativity}
            to={answerAgent.creativityAfterFix}
            label={`${answerAgent.name} agent`}
          />
        </div>

        <div className="grid min-w-0 gap-3 md:grid-cols-2">
          <div className="min-w-0 rounded-input border border-rule p-3">
            <p className="text-caption text-graphite">Answer now</p>
            <p className="mt-1 text-small">
              <MarkedDraft text={fix.before} unsupported={fix.unsupported} />
            </p>
          </div>
          <div className="min-w-0 rounded-input border border-live p-3">
            <p className="text-caption text-graphite">Answer after the fix</p>
            <p className="mt-1 text-small">{fix.after}</p>
          </div>
        </div>

        {applied ? (
          <div className="flex min-w-0 flex-col gap-2 border-t border-rule pt-3">
            <p className="text-body text-live">
              ok Applied as {fix.newVersion} in preview. Re-ran the same question{" "}
              {trace.reRuns.total} times: {trace.reRuns.grounded} of{" "}
              {trace.reRuns.total} grounded.
            </p>
            <p className="text-caption text-graphite">
              Re-test cost <span className="font-mono text-cost">{money(fix.cost)}</span>.
            </p>
            <Link
              href={query({ fix: "" })}
              className="inline-flex min-h-11 items-center self-start rounded-input border border-rule-strong px-3 text-body"
            >
              Revert to {fix.previousVersion}
            </Link>
          </div>
        ) : (
          <div className="flex min-w-0 flex-wrap items-center gap-3 border-t border-rule pt-3">
            <Link
              href={query({ fix: "applied" })}
              className="inline-flex min-h-11 items-center rounded-input bg-blueprint px-4 text-body text-paper"
            >
              Watch the fix being applied
            </Link>
            <span className="text-caption text-graphite">
              Demo action. In the real product this button reads &quot;Apply fix
              and re-test&quot; and creates {fix.newVersion} in preview, costing{" "}
              <span className="font-mono text-cost">{money(fix.cost)}</span>. Nothing
              changes until you press this.
            </span>
          </div>
        )}
      </div>

      {/* 4. Details: the raw trace and the actual change. */}
      <details open={preferDetails} className="min-w-0 rounded-panel border border-rule">
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
          Details: raw trace and the change
        </summary>
        <div className="flex min-w-0 flex-col gap-3 border-t border-rule p-3">
          {trace.steps.map((s) => (
            <div key={s.actor} className="min-w-0">
              <p className="font-mono text-caption text-graphite">
                {s.actor}
                {s.score !== undefined ? ` (match ${s.score})` : ""}
              </p>
              {s.detail ? (
                <pre className="min-w-0 overflow-x-auto font-mono text-caption">
                  {s.detail}
                </pre>
              ) : null}
            </div>
          ))}
          <div className="min-w-0">
            <p className="font-mono text-caption text-graphite">The change</p>
            <pre className="min-w-0 overflow-x-auto font-mono text-caption">
              {trace.diff}
            </pre>
          </div>
        </div>
      </details>
    </section>
  );
}
