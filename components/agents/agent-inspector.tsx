import Link from "next/link";
import type { Agent } from "@/lib/seed/types";
import { isJevAgent } from "@/lib/jev/questions";
import type { JevResult } from "@/lib/jev";
import { JevPanel, LanguageModelNote } from "./jev-panel";

/**
 * The precise-to-creative slider.
 *
 * This is the entire representation of the agent's setting in the guided layer.
 * No number, no parameter name. `to` draws where a proposed fix would move it,
 * so a change reads as a direction rather than a value.
 */
export function CreativityScale({
  value,
  to,
  label = "Where this agent sits",
}: {
  value: number;
  to?: number;
  label?: string;
}) {
  return (
    <div className="min-w-0">
      <p className="text-caption text-graphite">{label}</p>
      <div className="relative mt-2 h-1.5 w-full rounded-input bg-rule">
        {to !== undefined ? (
          <span
            className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-input border border-blueprint bg-paper"
            style={{ left: `${to}%` }}
            aria-hidden="true"
          />
        ) : null}
        <span
          className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-input bg-blueprint"
          style={{ left: `${value}%` }}
          aria-hidden="true"
        />
      </div>
      <div className="mt-1 flex justify-between text-caption text-graphite">
        <span>Precise</span>
        <span>Creative</span>
      </div>
      {to !== undefined ? (
        <p className="mt-1 text-caption text-blueprint">
          {to < value ? "Moving toward Precise" : "Moving toward Creative"}
        </p>
      ) : null}
    </div>
  );
}

type Props = {
  agent: Agent;
  details: boolean;
  applied: boolean;
  preferDetails?: boolean;
  /** The result of a live Jev run, when one was just made for this agent. */
  jevResult?: JevResult | null;
  /** Whether that result carried a valid signature. Unsigned is never "live". */
  jevVerified?: boolean;
  /** Where the test form returns to. */
  formNext?: string;
  query: (patch: Record<string, string>) => string;
};

export function AgentInspector({
  agent,
  details,
  applied,
  preferDetails,
  jevResult,
  jevVerified,
  formNext,
  query,
}: Props) {
  const decisionAgent = isJevAgent(agent.id);
  const creativity =
    applied && agent.creativityAfterFix !== undefined
      ? agent.creativityAfterFix
      : agent.creativity;

  return (
    <aside
      id="agent-inspector"
      aria-label={`${agent.name} inspector`}
      className="flex min-w-0 scroll-mt-24 flex-col gap-4 rounded-panel border border-rule p-4"
    >
      <div className="flex flex-wrap items-start gap-2">
        <div className="min-w-0">
          <h3 className="text-lead font-semibold">{agent.name}</h3>
          <p className="text-small text-graphite">{agent.role}</p>
        </div>
        <Link
          href={query({ agent: "", depth: "" })}
          className="ml-auto inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
        >
          Close
        </Link>
      </div>

      {/*
        One inspector, not two. This used to swap the whole panel for a config
        dump, so clicking "Details: configuration and versions" removed the
        model type, the source article and the Run control. Round 3 reported it
        as showing nothing, which is what a panel that loses its contents looks
        like. Now it expands in place, like every other "Details:" here, and
        the stored depth preference decides whether it starts open.
      */}
      <div className="flex min-w-0 flex-col gap-3">
        <div className="min-w-0">
          <p className="text-caption text-graphite">Knowledge</p>
          <p className="text-body">{agent.knowledge ?? "None. It reads the message only."}</p>
        </div>

        <div className="min-w-0">
          <p className="text-caption text-graphite">Tools</p>
          <ul className="mt-1 flex flex-wrap gap-1">
            {agent.tools.map((t) => (
              <li
                key={t}
                className="rounded-input border border-rule px-2 py-0.5 text-caption"
              >
                {t}
              </li>
            ))}
          </ul>
        </div>

        <CreativityScale value={creativity} />

        {decisionAgent ? (
          <JevPanel
            agentId={agent.id as Parameters<typeof JevPanel>[0]["agentId"]}
            result={jevResult ?? null}
            verified={jevVerified ?? false}
            formNext={formNext ?? "/demo?tab=agents"}
            preferDetails={preferDetails || details}
          />
        ) : (
          <>
            <LanguageModelNote />
            <details
              open={preferDetails || details}
              className="min-w-0 rounded-input border border-rule"
            >
              <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
                Test this agent
              </summary>
              <div className="border-t border-rule p-3">
                <p className="text-caption text-graphite">
                  Sample input, simulated for the demo
                </p>
                <p className="mt-1 text-small">{agent.sample.input}</p>
                <p className="mt-2 text-caption text-graphite">Result</p>
                <pre className="mt-1 min-w-0 whitespace-pre-wrap break-words font-mono text-caption">
                  {agent.sample.output}
                </pre>
              </div>
            </details>
          </>
        )}

        <details
          open={preferDetails || details}
          className="min-w-0 rounded-input border border-rule"
        >
          <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
            Details: configuration and versions
          </summary>
          <div className="flex min-w-0 flex-col gap-3 border-t border-rule p-3">
            <pre className="min-w-0 whitespace-pre-wrap break-words font-mono text-caption">
              {agent.configFile}
            </pre>
            <div className="min-w-0">
              <p className="text-caption text-graphite">Version history</p>
              <ul className="mt-1 flex flex-col gap-1">
                {agent.versions.map((v) => (
                  <li key={v.label} className="flex gap-2 text-small">
                    <span className="font-mono text-graphite">{v.label}</span>
                    <span className="min-w-0">{v.change}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </details>
      </div>
    </aside>
  );
}
