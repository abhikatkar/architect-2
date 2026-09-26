import type { DemoProject } from "@/lib/seed/types";
import type { AppliedState } from "@/lib/seed/totals";

function money(n: number) {
  return `$${n.toFixed(2)}`;
}

/**
 * Always on screen. This is the "See it" principle as a permanent surface:
 * which version is live, what state the build is in, and spend against the cap.
 */
export function LedgerBar({
  project,
  applied,
}: {
  project: DemoProject;
  /** The one derivation. Never recompute any of this here. */
  applied: AppliedState;
}) {
  const { ledger } = project;
  // Derived once in workspace-canvas and passed in, so this bar cannot
  // disagree with the panel above it. See D57.
  const spend = applied.spend;
  const preview = applied.previewVersion;
  const pct = Math.min(100, Math.round((spend / ledger.cap) * 100));
  const buildCount = applied.deploys;

  return (
    <footer className="border-t border-rule bg-paper px-4 py-2 sm:px-6">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption">
        <span className="inline-flex items-center gap-1.5">
          <span className="text-graphite">Preview</span>
          <span className="rounded-input border border-rule px-1.5 py-0.5 font-mono">
            {preview}
          </span>
        </span>

        <span className="inline-flex items-center gap-1.5">
          <span className="text-graphite">Production</span>
          {ledger.productionVersion ? (
            <>
              <span className="rounded-input border border-live px-1.5 py-0.5 font-mono text-live">
                {ledger.productionVersion}
              </span>
              <span className="text-live">live</span>
            </>
          ) : (
            <span className="text-graphite">not deployed</span>
          )}
        </span>

        {/* Deploys, not builds: 14 builds were started this month and 9 of them
            deployed. Calling 9 "builds" was the wrong noun once the other 5
            were written down. */}
        <span className="text-graphite">
          {buildCount} {buildCount === 1 ? "deploy" : "deploys"} this month
        </span>

        {/* Spend is cost-colored because it is money. Nothing else may be. */}
        <span className="ml-auto inline-flex items-center gap-2">
          <span
            className="hidden h-1.5 w-24 overflow-hidden rounded-input bg-rule sm:block"
            aria-hidden="true"
          >
            <span className="block h-full bg-cost" style={{ width: `${pct}%` }} />
          </span>
          <span className="font-mono text-cost">
            {money(spend)} of {money(ledger.cap)} cap
          </span>
        </span>
      </div>
    </footer>
  );
}
