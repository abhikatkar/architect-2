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
  /**
   * The one sentence stating what a failed build costs.
   *
   * Passed in rather than written here, because Deploy states the same policy
   * and the two used to disagree: this screen read "Spent $0.71" while Deploy
   * said a failed build is charged $0.00. One string, two screens. See D60.
   */
  failedBuildPolicy: string;
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
  failedBuildPolicy,
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
  const failedNow = mode === "failed" && finished;

  // Progress through the stage currently running, 0 to 1.
  const stageStart = current > 0 ? marks[current - 1] : 0;
  const inStage =
    started && !finished && current <= lastIndex
      ? Math.min(1, Math.max(0, ((elapsed as number) - stageStart) / stages[current].demoMs))
      : 0;

  /*
    Completed stages, plus the part of the running one that has actually
    elapsed. The stage that failed contributes nothing: it was charged $0.00,
    and counting it was the contradiction the review found, a total that
    included a charge the copy said was not made.
  */
  const spent =
    stages.slice(0, failedNow ? shown - 1 : shown).reduce((sum, s) => sum + s.cost, 0) +
    (current <= lastIndex && !finished ? stages[current].cost * inStage : 0);

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
        <h2 className="text-title font-bold">
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
                {/*
                  A running stage shows time and cost so far, scaled by how far
                  through it is. Showing its final values while it ran was the
                  bug the review caught: Database read "1m 4s $0.18" mid-run.
                */}
                <span className="font-mono text-caption text-graphite">
                  {state === "waiting"
                    ? ""
                    : state === "running"
                      ? duration(Math.round(s.elapsedSeconds * inStage))
                      : duration(s.elapsedSeconds)}
                </span>
                <span className="font-mono text-caption text-cost">
                  {state === "waiting"
                    ? ""
                    : state === "fault"
                      ? money(0)
                      : state === "running"
                        ? money(s.cost * inStage)
                        : money(s.cost)}
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

      {/*
        A failed build is not a charge. The number is still shown, because
        hiding what the stages consumed would be the other kind of dishonesty,
        but it is labelled "used" and the policy follows it in the same words
        Deploy uses.
      */}
      <p className="mt-3 border-t border-rule pt-2 text-caption text-graphite">
        {failedNow ? (
          <>
            <span className="font-mono text-cost">{money(spent)}</span> used, not
            charged because the build failed. {failedBuildPolicy}
          </>
        ) : (
          <>
            {finished ? "Spent" : "Spent so far"}{" "}
            <span className="font-mono text-cost">{money(spent)}</span>
            {finished ? ", inside the estimate of $1.20 to $2.00." : "."}
          </>
        )}
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
            {/* No rollback offer on a first build: there is nothing behind it
                to roll back to. The round 2 review caught "Roll back to v3"
                being offered on v1. */}
            <span className="inline-flex min-h-11 items-center text-caption text-graphite">
              Nothing to roll back to. This is the first build.
            </span>
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
              className="min-h-11 rounded-input border border-rule-strong px-3 text-body"
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
            className="min-h-11 rounded-input border border-rule-strong px-3 text-body"
          >
            Finish build
          </button>
        </form>
      ) : null}
    </section>
  );
}
