import { JEV_AGENTS, JEV_MODEL, type JevAgentId } from "@/lib/jev/questions";
import type { JevResult } from "@/lib/jev";

function pct(n: number) {
  return `${Math.round(n * 100)}%`;
}

/**
 * The model-type block in the agent inspector, and the live test control.
 *
 * Guided layer names no parameter (D33). The details layer shows the exact
 * typed question object that gets sent, so a developer reads the contract
 * rather than a description of it.
 */
export function JevPanel({
  agentId,
  result,
  formNext,
  preferDetails,
}: {
  agentId: JevAgentId;
  result: JevResult | null;
  formNext: string;
  preferDetails?: boolean;
}) {
  const spec = JEV_AGENTS[agentId];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="min-w-0 rounded-input border border-blueprint p-3">
        <p className="text-caption text-graphite">Model type</p>
        <p className="text-body font-medium text-blueprint">Decision model: Jev</p>
        <p className="mt-1 max-w-[72ch] text-small text-graphite">
          It picks from a fixed set of answers, so it cannot invent one.{" "}
          {spec.why}
        </p>
      </div>

      <form action="/jev/run" method="post" className="flex flex-col gap-2">
        <input type="hidden" name="agent" value={agentId} />
        <input type="hidden" name="next" value={formNext} />
        <label htmlFor={`jev-input-${agentId}`} className="text-caption text-graphite">
          Try it with your own text, or leave blank for the sample
        </label>
        <textarea
          id={`jev-input-${agentId}`}
          name="input"
          rows={2}
          maxLength={500}
          placeholder={Object.values(spec.sampleState)[0]}
          className="w-full resize-none rounded-input border border-rule bg-paper p-2 text-small placeholder:text-graphite"
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            className="min-h-11 rounded-input bg-blueprint px-3 text-body text-paper"
          >
            Run this agent
          </button>
          <span className="text-caption text-graphite">
            Real call to Jev. Up to 500 characters.
          </span>
        </div>
      </form>

      {result ? <JevResultView result={result} /> : null}

      <details
        open={preferDetails}
        className="min-w-0 rounded-input border border-rule"
      >
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
          Details: the typed question sent to {JEV_MODEL}
        </summary>
        <pre className="min-w-0 overflow-x-auto border-t border-rule p-3 font-mono text-caption">
          {JSON.stringify(spec.questions, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function JevResultView({ result }: { result: JevResult }) {
  const live = result.outcome === "live";

  return (
    <div
      className={`min-w-0 rounded-input border p-3 ${
        live ? "border-live" : "border-cost"
      }`}
    >
      <p className={`text-caption ${live ? "text-live" : "text-cost"}`}>
        {live
          ? "Live result"
          : result.recordedOn
            ? `Recorded result from ${result.recordedOn}`
            : "No live result"}
      </p>

      {result.note ? (
        <p className="mt-1 max-w-[72ch] text-small text-graphite">{result.note}</p>
      ) : null}

      {result.answers.length ? (
        <ul className="mt-2 flex flex-col gap-2">
          {result.answers.map((a) => (
            <li key={a.key} className="min-w-0">
              <p className="text-body">
                <span className="text-graphite">{a.key}: </span>
                <span className="font-medium">{a.display}</span>
              </p>

              {/*
                Confidence for choice and score only. For boolean the provider
                returns P(true), which the docs say is not a confidence, so it
                is labelled as what it is.
              */}
              {a.confidence !== null ? (
                <p className="text-caption text-graphite">
                  Confidence {pct(a.confidence)}
                  {a.confidence < 0.6 ? (
                    <span className="text-cost">
                      {" "}
                      . Jev was not clearly decided here, so this one would go to
                      a person rather than through automatically.
                    </span>
                  ) : null}
                </p>
              ) : null}

              {a.probability !== null ? (
                <p className="text-caption text-graphite">
                  Probability the statement is true: {pct(a.probability)}. Jev
                  does not return a confidence for yes-or-no questions.
                </p>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}

      {result.latencyMs !== null ? (
        <p className="mt-2 font-mono text-caption text-graphite">
          {result.latencyMs} ms, measured here around the call. Jev does not
          return a latency of its own.
        </p>
      ) : null}
    </div>
  );
}

/** The Answer agent is not a decision agent, and the contrast is the point. */
export function LanguageModelNote() {
  return (
    <div className="min-w-0 rounded-input border border-rule p-3">
      <p className="text-caption text-graphite">Model type</p>
      <p className="text-body font-medium">Language model</p>
      <p className="mt-1 max-w-[72ch] text-small text-graphite">
        It writes the reply in its own words, so it needs a model that can
        write. That is also why it is the one agent that can drift from its
        source.
      </p>
    </div>
  );
}
