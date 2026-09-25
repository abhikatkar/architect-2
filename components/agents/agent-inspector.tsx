import Link from "next/link";
import type { Agent } from "@/lib/seed/types";

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
  query: (patch: Record<string, string>) => string;
};

export function AgentInspector({ agent, details, applied, query }: Props) {
  const creativity =
    applied && agent.creativityAfterFix !== undefined
      ? agent.creativityAfterFix
      : agent.creativity;

  return (
    <aside
      aria-label={`${agent.name} inspector`}
      className="flex min-w-0 flex-col gap-4 rounded-panel border border-rule p-4"
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

      {details ? (
        /* Details layer. Every number in the product lives behind this door. */
        <div className="flex min-w-0 flex-col gap-3">
          <pre className="min-w-0 overflow-x-auto rounded-input border border-rule p-3 font-mono text-caption">
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
          <Link
            href={query({ depth: "" })}
            className="inline-flex min-h-11 items-center self-start rounded-input border border-rule px-3 text-body"
          >
            Back to the simple view
          </Link>
        </div>
      ) : (
        /* Guided layer. No parameter names, no numbers. */
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

          <details className="min-w-0 rounded-input border border-rule">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
              Test this agent
            </summary>
            <div className="border-t border-rule p-3">
              <p className="text-caption text-graphite">
                Sample input, simulated for the demo
              </p>
              <p className="mt-1 text-small">{agent.sample.input}</p>
              <p className="mt-2 text-caption text-graphite">Result</p>
              <pre className="mt-1 min-w-0 overflow-x-auto font-mono text-caption">
                {agent.sample.output}
              </pre>
            </div>
          </details>

          <Link
            href={query({ depth: "details" })}
            className="inline-flex min-h-11 items-center self-start rounded-input border border-rule px-3 text-body"
          >
            Details: configuration and versions
          </Link>
        </div>
      )}
    </aside>
  );
}
