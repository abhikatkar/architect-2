"use client";

import { useEffect, useRef, useState } from "react";
import type { BuildFailure, BuildStage } from "@/lib/seed/types";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

type Props = {
  stages: BuildStage[];
  failure: BuildFailure;
  /** "running" plays the whole build. "failed" plays it until the failing stage. */
  mode: "running" | "failed";
  /** Signed in: the route that records completion. Demo: null, nothing is written. */
  finishAction: string | null;
  doneHref: string;
  preferDetails?: boolean;
};

/**
 * Screen 7. The answer to a "usually 4 to 6 min" label that ran for 35 minutes
 * beside a tips carousel and a game.
 *
 * This is the only client component in the product, because progress is the one
 * thing that needs time to pass (D27).
 *
 * `elapsed` starts null, which renders the finished build. That null state is
 * what the server sends and what a visitor without JavaScript keeps, so they
 * see the result and a working Finish control rather than a spinner that can
 * never resolve. Once the interval ticks, everything below is derived from
 * elapsed time, so no state is ever set from inside an effect body.
 */
export function BuildProgress({
  stages,
  failure,
  mode,
  finishAction,
  doneHref,
  preferDetails,
}: Props) {
  const failIndex = stages.findIndex((s) => s.name === failure.stageName);
  const lastIndex = mode === "failed" ? failIndex : stages.length - 1;

  const [elapsed, setElapsed] = useState<number | null>(null);
  const [runId, setRunId] = useState(0);
  const finishForm = useRef<HTMLFormElement>(null);
  const submitted = useRef(false);

  useEffect(() => {
    const start = performance.now();
    // State changes only from the interval callback, never from the body.
    const iv = setInterval(() => setElapsed(performance.now() - start), 80);
    return () => clearInterval(iv);
  }, [runId]);

  // Cumulative animation timeline, so the current stage is derived, not stored.
  const marks: number[] = [];
  let acc = 0;
  for (const s of stages) {
    acc += s.demoMs;
    marks.push(acc);
  }
  const totalMs = marks[lastIndex];

  const started = elapsed !== null;
  const finished = !started || elapsed >= totalMs;
  const current = finished
    ? lastIndex + 1
    : marks.findIndex((m) => (elapsed as number) < m);

  const shown = Math.min(current, lastIndex + 1);
  const spent = stages.slice(0, shown).reduce((sum, s) => sum + s.cost, 0);
  const failedNow = mode === "failed" && finished;

  // Recording completion touches the DOM, not React state, so it belongs here.
  useEffect(() => {
    if (!started || !finished || mode !== "running" || !finishAction) return;
    if (submitted.current) return;
    submitted.current = true;
    finishForm.current?.submit();
  }, [started, finished, mode, finishAction]);

  function replay() {
    submitted.current = false;
    setElapsed(null);
    setRunId((r) => r + 1);
  }

  return (
    <section className="min-w-0 rounded-panel border border-rule p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="text-title font-semibold">
          {failedNow ? "Build stopped" : finished ? "Built" : "Building your app"}
        </h2>
        {/* The honesty label sits with the timing, not in small print. */}
        <span className="rounded-input border border-rule px-2 py-0.5 text-caption text-graphite">
          Demo build, time compressed
        </span>
      </div>

      <ol className="mt-4 flex flex-col gap-2">
        {stages.map((s, i) => {
          const isFail = mode === "failed" && i === failIndex && current > i;
          const done = current > i && !isFail;
          const running = started && current === i && !finished;
          const state = isFail
            ? "fault"
            : done
              ? "done"
              : running
                ? "running"
                : "waiting";

          return (
            <li key={s.name} className="flex flex-col gap-1">
              <div className="flex items-baseline gap-2 text-body">
                <span
                  aria-hidden="true"
                  className={
                    state === "done"
                      ? "text-live"
                      : state === "fault"
                        ? "text-fault"
                        : state === "running"
                          ? "text-blueprint"
                          : "text-graphite"
                  }
                >
                  {state === "done"
                    ? "ok"
                    : state === "fault"
                      ? "x"
                      : state === "running"
                        ? ">"
                        : "-"}
                </span>
                <span className="min-w-0 flex-1 truncate">{s.name}</span>
                <span className="font-mono text-caption text-graphite">
                  {state === "waiting" ? "" : duration(s.elapsedSeconds)}
                </span>
                <span className="font-mono text-caption text-cost">
                  {state === "waiting" ? "" : money(s.cost)}
                </span>
              </div>

              {/* The health check is a visible stage, not an implied one. */}
              {done && s.detail ? (
                <p className="pl-6 text-caption text-live">
                  {s.name}: {s.detail}
                </p>
              ) : null}

              {isFail ? (
                <div className="pl-6">
                  <p className="text-caption text-fault">{failure.cause}</p>
                  <p className="text-caption text-graphite">{failure.platformCharge}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 border-t border-rule pt-2 text-caption text-graphite">
        Spent so far <span className="font-mono text-cost">{money(spent)}</span>
        {finished && !failedNow ? ", inside the estimate of $1.20 to $2.00." : "."}
      </p>

      {failedNow ? (
        <div className="mt-3 flex flex-col gap-2 border-t border-rule pt-3">
          <p className="text-body text-fault">{failure.stopped}</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={replay}
              className="min-h-11 rounded-input bg-blueprint px-3 text-body text-paper"
            >
              Try a different approach, {money(failure.retryEstimate.low)} to{" "}
              {money(failure.retryEstimate.high)}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-input border border-rule px-3 text-body"
            >
              Roll back to {failure.rollbackTo}
            </button>
          </div>
          <details open={preferDetails} className="min-w-0 rounded-panel border border-rule">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
              Details: the error log
            </summary>
            <pre className="min-w-0 overflow-x-auto border-t border-rule p-3 font-mono text-caption">
              {failure.detail}
            </pre>
          </details>
        </div>
      ) : null}

      {finished && !failedNow ? (
        <div className="mt-3 flex flex-wrap gap-2 border-t border-rule pt-3">
          <a
            href={doneHref}
            className="inline-flex min-h-11 items-center rounded-input bg-blueprint px-3 text-body text-paper"
          >
            Open the preview
          </a>
          {started ? (
            <button
              type="button"
              onClick={replay}
              className="min-h-11 rounded-input border border-rule px-3 text-body"
            >
              Replay build
            </button>
          ) : null}
        </div>
      ) : null}

      {/*
        The no-JS finish control. Visible until the timer starts, which only
        happens when JavaScript runs. Both paths post to the same handler, so
        they cannot drift apart.
      */}
      {finishAction ? (
        <form
          ref={finishForm}
          action={finishAction}
          method="post"
          className={started ? "hidden" : "mt-3 border-t border-rule pt-3"}
        >
          <button
            type="submit"
            className="min-h-11 rounded-input border border-rule px-3 text-body"
          >
            Finish build
          </button>
        </form>
      ) : null}
    </section>
  );
}
