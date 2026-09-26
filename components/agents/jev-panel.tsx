import {
  ACT_ALONE_BAR,
  JEV_AGENTS,
  JEV_MODEL,
  JEV_PLAIN_EXPLAINER,
  type JevAgentId,
} from "@/lib/jev/questions";
import type { JevResult } from "@/lib/jev";
import { examplesFor } from "@/lib/jev/examples";

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
  verified,
  formNext,
  preferDetails,
}: {
  agentId: JevAgentId;
  result: JevResult | null;
  /** A result whose signature did not check out is never shown as live. */
  verified: boolean;
  formNext: string;
  preferDetails?: boolean;
}) {
  const spec = JEV_AGENTS[agentId];
  // Everything except the field the visitor can edit is fixed, and is shown so
  // a result can be checked against what it actually ran on.
  const fixedFields = Object.entries(spec.sampleState).filter(
    ([key]) => key !== spec.inputField,
  );
  const examples = examplesFor(agentId);
  // The fixed field the examples carry their own copy of. For the checker that
  // is the source article; the other two agents have nothing like it.
  const sourceKey = fixedFields.find(([key]) => key === "source")?.[0];

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="min-w-0 rounded-input border border-blueprint p-3">
        <p className="text-caption text-graphite">Model type</p>
        <p className="text-body font-medium text-blueprint">Decision model: Jev</p>
        <p className="mt-1 max-w-[72ch] text-small text-graphite">
          {JEV_PLAIN_EXPLAINER}
        </p>
        <p className="mt-1 max-w-[72ch] text-small text-graphite">{spec.why}</p>
      </div>

      {fixedFields.length ? (
        <div className="min-w-0 rounded-input border border-rule p-3">
          {fixedFields.map(([key, value]) => (
            <div key={key} className="min-w-0">
              <p className="text-caption text-graphite">
                {spec.stateLabels[key] ?? key}
              </p>
              <p className="max-w-[72ch] text-small">{value}</p>
            </div>
          ))}
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            {spec.fixedNote ??
              "Sent with every run and not editable here, so a result can be checked against what it ran on."}
          </p>
        </div>
      ) : null}

      {/*
        The bar is stated on every agent, not only the checker.

        The Intake inspector said a result "would go to a person" without ever
        saying at what point, because this block only rendered for the agent
        with a passThreshold while the confidence path carried its own copy of
        the same 0.6. One constant, one sentence, framed per agent.
      */}
      <div className="min-w-0 rounded-input border border-rule p-3">
        <p className="text-caption text-graphite">
          {spec.passThreshold !== undefined
            ? "Before it is sent"
            : "Before it acts alone"}
        </p>
        <p className="max-w-[72ch] text-small">
          {spec.passThreshold !== undefined ? (
            <>
              An answer only reaches a customer unread if the checker is at
              least <span className="font-medium">{pct(ACT_ALONE_BAR)}</span>{" "}
              sure every detail is supported. Below that it goes to a person.
            </>
          ) : (
            <>
              This agent acts on its own choice only if Jev is at least{" "}
              <span className="font-medium">{pct(ACT_ALONE_BAR)}</span> sure of
              it. Below that the message goes to a person instead.
            </>
          )}
        </p>
        <p className="mt-1 max-w-[72ch] text-caption text-graphite">
          {spec.passThreshold !== undefined
            ? `The same bar the other agents use before acting alone. Checked against ${examples.length} drafts we labeled by hand: see below.`
            : "The same bar the Grounding Checker uses, so this is one rule in the product rather than two."}
        </p>
      </div>

      <form action="/jev/run" method="post" className="flex flex-col gap-2">
        <input type="hidden" name="agent" value={agentId} />
        <input type="hidden" name="next" value={formNext} />
        <label htmlFor={`jev-input-${agentId}`} className="text-caption text-graphite">
          {spec.stateLabels[spec.inputField] ?? "Your text"}. Edit it, or leave
          blank for the sample
        </label>
        <textarea
          id={`jev-input-${agentId}`}
          name="input"
          rows={2}
          maxLength={500}
          placeholder={spec.sampleState[spec.inputField]}
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

      {result ? (
        <JevResultView
          result={result}
          verified={verified}
          passThreshold={spec.passThreshold}
        />
      ) : null}

      {examples.length ? (
        <details open={preferDetails} className="min-w-0 rounded-input border border-rule">
          <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
            Worked examples: {examples.length} real calls, {examples[0].capturedOn}
          </summary>
          <div className="min-w-0 border-t border-rule p-3">
            <p className="mb-2 max-w-[72ch] text-caption text-graphite">
              Drafts we labeled before running them, so the checker can be seen
              passing supported answers and not only failing the demo&apos;s one.
              Every number here came back from a real call.
            </p>
            <ul className="flex flex-col gap-2">
              {examples.map((e) => {
                const primary = e.answers.find((a) => a.key === spec.primary);
                const p = primary?.probability ?? 0;
                const passes = spec.passThreshold !== undefined && p >= spec.passThreshold;
                return (
                  <li key={e.id} className="min-w-0 border-t border-rule pt-2 first:border-0 first:pt-0">
                    <p className="text-small font-medium">{e.label}</p>
                    <p className="max-w-[72ch] text-caption text-graphite">{e.note}</p>
                    <p className="mt-1 max-w-[72ch] font-mono text-caption">
                      {e.state[spec.inputField]}
                    </p>
                    {/*
                      Each example carries its own source, and three of these
                      are about refunds while the sample above is about credits.
                      Without this, "Refund requests are reviewed by our support
                      team" read as an unrelated claim passing at 78%, which
                      argues against the very thing the screen is showing.
                    */}
                    {sourceKey && e.state[sourceKey] ? (
                      <p className="max-w-[72ch] text-caption text-graphite">
                        <span>checked against:</span>{" "}
                        <span className="font-mono">{e.state[sourceKey]}</span>
                        {e.state[sourceKey] !== spec.sampleState[sourceKey] ? (
                          <span> (a different article from the sample above)</span>
                        ) : null}
                      </p>
                    ) : null}
                    <p className={`text-caption ${passes ? "text-live" : "text-cost"}`}>
                      {pct(p)}, {passes ? "sent as it is" : "goes to a person"}
                      <span className="text-graphite">
                        . We expected it to {e.expected === "pass" ? "be sent" : "go to a person"}.
                      </span>
                    </p>
                  </li>
                );
              })}
            </ul>
          </div>
        </details>
      ) : null}

      <details
        open={preferDetails}
        className="min-w-0 rounded-input border border-rule"
      >
        <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
          Details: the typed question sent to {JEV_MODEL}
        </summary>
        {/* Wrapped, not scrolled: a hidden horizontal scrollbar in a narrow
            sidebar reads as truncated, which is what round 3 reported. */}
        <pre className="min-w-0 whitespace-pre-wrap break-words border-t border-rule p-3 font-mono text-caption">
          {JSON.stringify(spec.questions, null, 2)}
        </pre>
      </details>
    </div>
  );
}

function JevResultView({
  result,
  verified,
  passThreshold,
}: {
  result: JevResult;
  verified: boolean;
  passThreshold?: number;
}) {
  // "Live" requires both a live outcome AND a signature this server produced.
  // An edited or hand-written URL is shown as unverified, never as live.
  const live = result.outcome === "live" && verified;

  return (
    <div
      className={`min-w-0 rounded-input border p-3 ${
        live ? "border-live" : "border-cost"
      }`}
    >
      <p className={`text-caption ${live ? "text-live" : "text-cost"}`}>
        {live
          ? "Live result"
          : !verified
            ? "Unverified result"
            : result.recordedOn
              ? `Recorded result from ${result.recordedOn}`
              : "No live result"}
      </p>

      {!verified ? (
        <p className="mt-1 max-w-[72ch] text-small text-graphite">
          This result did not arrive with a valid signature from this server, so
          it is not shown as live. That happens if the address was edited or
          shared after the run.
        </p>
      ) : null}

      {result.note ? (
        <p className="mt-1 max-w-[72ch] text-small text-graphite">{result.note}</p>
      ) : null}

      {result.answers.length ? (
        <ul className="mt-2 flex flex-col gap-2">
          {result.answers.map((a) => (
            <li key={a.key} className="min-w-0">
              <p className="text-body">
                <span className="text-graphite">{a.key}: </span>
                <span className="font-medium">
                  {/*
                    A boolean with a bar reports the decision, not the raw
                    Yes/No at 0.5. Showing "Yes" beside "goes to a person" is
                    the contradiction this whole change exists to remove.
                  */}
                  {a.type === "boolean" && passThreshold !== undefined
                    ? (a.probability ?? 0) >= passThreshold
                      ? "Supported, sent as it is"
                      : "Not supported well enough to send"
                    : a.display}
                </span>
              </p>

              {/*
                Confidence for choice and score only. For boolean the provider
                returns P(true), which the docs say is not a confidence, so it
                is labeled as what it is.
              */}
              {a.confidence !== null ? (
                <p className="text-caption text-graphite">
                  Confidence {pct(a.confidence)}.
                  {a.confidence < ACT_ALONE_BAR ? (
                    <span className="text-cost">
                      {" "}
                      Below the {pct(ACT_ALONE_BAR)} bar, so this one would go to
                      a person rather than through automatically.
                    </span>
                  ) : null}
                </p>
              ) : null}

              {a.probability !== null ? (
                <>
                  <p className="text-caption text-graphite">
                    Probability every detail is supported: {pct(a.probability)}.
                    Jev does not return a confidence for yes-or-no questions.
                  </p>
                  {/*
                    The product decision, not the model's. Jev reads a boolean
                    at 0.5; an answer that reaches a customer unread has to
                    clear a much higher bar than a coin flip. See D43.
                  */}
                  {passThreshold !== undefined ? (
                    <p
                      className={`text-caption ${
                        a.probability >= passThreshold
                          ? "text-live"
                          : "text-cost"
                      }`}
                    >
                      {a.probability >= passThreshold
                        ? `At or above the ${pct(passThreshold)} bar, so this answer is sent as it is.`
                        : `Below the ${pct(passThreshold)} bar, so this answer goes to a person instead of to the customer.`}
                    </p>
                  ) : null}
                </>
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
