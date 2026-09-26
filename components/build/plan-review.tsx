import Link from "next/link";
import type { Clarifier, Plan } from "@/lib/seed/types";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

type Props = {
  projectName: string;
  clarifiers: Clarifier[];
  plan: Plan;
  cap: number;
  /** Already spent this month. Needed to tell whether this build crosses the cap. */
  spent: number;
  /**
   * Signed in: a route that writes status and redirects. Demo: null, and the
   * button becomes a link, because the demo never writes to the database.
   */
  action: string | null;
  demoHref?: string;
  backHref: string;
  preferDetails?: boolean;
};

/**
 * Screen 5. One gate where today's Architect has three.
 *
 * Every clarifier already has an answer selected, so the fast path is a single
 * click on Build. The plan is plain language, and Details reveals the PRD in
 * mono, because mono means raw.
 */
export function PlanReview({
  projectName,
  clarifiers,
  plan,
  cap,
  spent,
  action,
  demoHref,
  backHref,
  preferDetails,
}: Props) {
  const { low, high, minutesLow, minutesHigh } = plan.estimate;

  /*
    Would this build cross the cap?

    The gate has always shown "of your $5.00 cap" without ever checking, and in
    this project's own state it would: $3.37 spent, up to $2.00 more, against a
    $5.00 cap. The fixture used to carry a sentence about this with the overage
    written into it, computed against the other state, so the number was wrong
    half the time. It is arithmetic on three numbers, so it is arithmetic here.
  */
  const over = +(spent + high - cap).toFixed(2);
  const crossesCap = over > 0;

  const buildLabel = `Build, ${money(low)} to ${money(high)} of your ${money(cap)} cap`;

  return (
    <main className="mx-auto flex w-full max-w-[1200px] min-w-0 flex-col gap-6 px-4 py-6 sm:px-6">
      <header className="min-w-0">
        <Link href={backHref} className="text-caption text-graphite underline">
          Back to {projectName}
        </Link>
        <h1 className="mt-2 text-heading font-semibold">{plan.headline}</h1>
        <p className="mt-1 max-w-[72ch] text-body text-graphite">
          Answer three questions, read the plan, then build. Nothing runs and
          nothing is charged until you press Build.
        </p>
      </header>

      <div className="grid min-w-0 gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
        <section className="min-w-0">
          <h2 className="text-title font-semibold">A few choices</h2>
          <p className="mt-1 text-small text-graphite">
            Sensible answers are already selected.
          </p>

          <div className="mt-3 flex flex-col gap-4">
            {clarifiers.map((c) => (
              <fieldset key={c.id} className="min-w-0 rounded-panel border border-rule p-3">
                <legend className="px-1 text-small font-medium">{c.question}</legend>
                <div className="mt-1 flex flex-col gap-1">
                  {c.options.map((o) => (
                    <label
                      key={o}
                      className="flex min-h-11 items-center gap-2 text-body"
                    >
                      <input
                        type="radio"
                        name={c.id}
                        value={o}
                        defaultChecked={o === c.defaultOption}
                        className="accent-blueprint"
                      />
                      <span className="min-w-0">{o}</span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </div>
        </section>

        <section className="min-w-0">
          <h2 className="text-title font-semibold">What gets built</h2>
          <ul className="mt-3 flex flex-col gap-2">
            {plan.points.map((p) => (
              <li key={p} className="flex gap-2 text-body">
                <span aria-hidden="true" className="text-blueprint">
                  &bull;
                </span>
                <span className="min-w-0">{p}</span>
              </li>
            ))}
          </ul>

          {/* Details reveals the layer underneath, in place, never a new tab. */}
          <details open={preferDetails} className="mt-4 min-w-0 rounded-panel border border-rule">
            <summary className="flex min-h-11 cursor-pointer items-center px-3 text-body">
              Details: the full PRD
            </summary>
            <pre className="min-w-0 overflow-x-auto border-t border-rule p-3 font-mono text-caption">
              {plan.prd}
            </pre>
          </details>

          <div className="mt-4 flex flex-col gap-2 rounded-panel border border-rule p-4">
            <p className="text-body">
              Estimated{" "}
              <span className="font-mono">
                about {minutesLow} to {minutesHigh} min
              </span>{" "}
              and{" "}
              <span className="font-mono text-cost">
                {money(low)} to {money(high)}
              </span>
              .
            </p>
            <p className="text-caption text-graphite">
              First build for this kind of app, so the estimate may vary. You
              will see the cost climb as it runs.
            </p>

            {crossesCap ? (
              <p className="max-w-[72ch] text-caption text-cost">
                This build may cost up to{" "}
                <span className="font-mono">{money(high)}</span>, which with the{" "}
                <span className="font-mono">{money(spent)}</span> already spent
                would pass your <span className="font-mono">{money(cap)}</span>{" "}
                cap by <span className="font-mono">{money(over)}</span>. Raise
                the cap or build anyway.
              </p>
            ) : null}

            {action ? (
              <form action={action} method="post">
                <button
                  type="submit"
                  className="min-h-11 w-full rounded-input bg-blueprint px-4 text-body text-paper sm:w-auto"
                >
                  {buildLabel}
                </button>
              </form>
            ) : (
              <>
                {/* Read-only demo: this starts the simulation, and says so,
                    rather than appearing to spend real credits. */}
                <Link
                  href={demoHref ?? "#"}
                  className="inline-flex min-h-11 items-center justify-center rounded-input bg-blueprint px-4 text-body text-paper"
                >
                  Watch this build run
                </Link>
                <p className="text-caption text-graphite">
                  Demo project, so nothing is charged. In a real project this
                  button reads &ldquo;{buildLabel}&rdquo;.
                </p>
              </>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}
