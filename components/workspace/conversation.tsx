import type { BuildStage, DemoProject } from "@/lib/seed/types";
import { previewVersion } from "@/lib/seed/totals";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

function duration(seconds: number) {
  if (seconds < 60) return `${seconds}s`;
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

/**
 * Named stages with state, elapsed time and cost so far. This replaces any
 * spinner longer than 3 seconds, which is the whole complaint the teardown
 * recorded against a "usually 4 to 6 min" label.
 */
function StageList({ stages }: { stages: BuildStage[] }) {
  return (
    <ol className="flex flex-col gap-2">
      {stages.map((s) => (
        <li key={s.name} className="flex items-baseline gap-2 text-body">
          <span
            aria-hidden="true"
            className={
              s.state === "done"
                ? "text-live"
                : s.state === "fault"
                  ? "text-fault"
                  : "text-graphite"
            }
          >
            {s.state === "done" ? "ok" : s.state === "fault" ? "x" : "..."}
          </span>
          <span className="min-w-0 flex-1 truncate">{s.name}</span>
          <span className="font-mono text-caption text-graphite">
            {duration(s.elapsedSeconds)}
          </span>
          <span className="font-mono text-caption text-cost">{money(s.cost)}</span>
        </li>
      ))}
    </ol>
  );
}

export function Conversation({
  project,
  readOnly,
  building,
}: {
  project: DemoProject;
  readOnly?: boolean;
  /**
   * True on the build screens. The panel then points at the canvas instead of
   * showing a finished summary that would contradict it. The wording stays
   * state-neutral because the canvas is client-side and this panel is not, so
   * the two cannot be kept in lockstep.
   */
  building?: boolean;
}) {
  const total = project.stages.reduce((sum, s) => sum + s.cost, 0);
  const preview = previewVersion(project);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto">
        <p className="max-w-[72ch] text-body">
          Build a support agent that answers billing questions from our help
          center and escalates when it is not sure.
        </p>

        {building ? (
          <div className="rounded-panel border border-rule p-3">
            <p className="text-caption text-graphite">First build, v1</p>
            <p className="mt-1 text-body">
              Five stages, about six and a half minutes of real build time,
              estimated at $1.20 to $2.00 before it started.
            </p>
          </div>
        ) : (
        <div className="rounded-panel border border-rule p-3">
          {/* Named, so it cannot be mistaken for the version in preview. The
              rail is the history of the first build; the footer is current. */}
          <p className="mb-2 text-caption text-graphite">
            First build, v1. Preview is now on {preview}.
          </p>
          <StageList stages={project.stages} />
          <p className="mt-3 border-t border-rule pt-2 text-caption text-graphite">
            Built in {duration(project.stages.reduce((s, x) => s + x.elapsedSeconds, 0))} for{" "}
            <span className="font-mono text-cost">{money(total)}</span>, inside the{" "}
            <span className="font-mono text-cost">$1.20 to $2.00</span> estimate.
          </p>
        </div>
        )}

        {building ? null : (
          <p className="max-w-[72ch] text-body text-graphite">
            {project.name} is ready. {project.counts.escalated} conversations are
            waiting on a human, and {project.counts.open} are still open.
          </p>
        )}
      </div>

      <form className="flex flex-col gap-2">
        <label htmlFor="ws-prompt" className="sr-only">
          Ask Architect
        </label>
        <textarea
          id="ws-prompt"
          name="prompt"
          rows={2}
          disabled={readOnly}
          placeholder={readOnly ? "Sign in to make changes" : "Ask for a change..."}
          className="w-full resize-none rounded-panel border border-rule bg-paper p-3 text-body placeholder:text-graphite disabled:opacity-60"
        />
        <div className="flex items-center justify-between gap-2">
          <span className="text-caption text-graphite">
            Next change: about 1 min, <span className="font-mono text-cost">$0.10 to $0.30</span>
          </span>
          <button
            type="submit"
            disabled={readOnly}
            className="min-h-11 rounded-input bg-blueprint px-4 text-body text-paper disabled:opacity-50"
          >
            Send
          </button>
        </div>
      </form>
    </div>
  );
}
