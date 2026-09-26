import Link from "next/link";
import type { DemoProject } from "@/lib/seed/types";
import { DOMAINS, MEMBERS, PUBLISH, ROLES, SYNC_LOG } from "@/lib/seed/deploy";
import { changeRequests, codeFiles, CHECKS } from "@/lib/seed/code";
import {
  allDiffIds,
  appliedPending,
  checksPassed,
  ledgerSpend,
  pendingChanges,
  previewAfter,
  revertedBy,
  rollbackTargets,
  spendAfter,
  versionForPending,
} from "@/lib/seed/totals";
import { Sheet, SheetTrigger, DemoNote } from "@/components/ui/sheet";

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * Screen 16, Deploy, and the two sheets that open from it.
 *
 * Everything on this screen is derived. The live version, the preview version,
 * what a rollback would revert, and the month's spend all read from the version
 * list and the accept parameters rather than being written down anywhere. That
 * is the rule D36 exists for, and this screen is where it was first broken.
 *
 * Three defaults here are answers to what the teardown found, and each says so
 * on screen rather than in a doc: the repo is private, Marketplace is off, and
 * admin is an invite rather than a server environment variable.
 */
export function DeployCanvas({
  project,
  fixApplied,
  accept,
  sheet,
  rollback,
  query,
}: {
  project: DemoProject;
  fixApplied: boolean;
  accept: string;
  sheet: string;
  rollback: string;
  query: (patch: Record<string, string>) => string;
}) {
  const changes = changeRequests(project, fixApplied);
  const valid = new Set(allDiffIds(changes));
  const accepted = accept.split(".").filter((id) => valid.has(id));

  const applied = appliedPending(changes, accepted);
  const preview = previewAfter(project, changes, accepted);
  const spend = spendAfter(project, changes, accepted);
  const live = project.versions.find((v) => v.live);
  const targets = rollbackTargets(project);
  const rollbackTo = targets.find((v) => v.label === rollback);
  const reverts = rollbackTo ? revertedBy(project, rollbackTo.label) : [];
  const passed = checksPassed(CHECKS);
  const fileCount = codeFiles(project).length;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-title font-semibold">Deploy</h2>
          <span className="max-w-[72ch] text-small text-graphite">
            What is live, what is waiting in preview, and what it would take to
            change that.
          </span>
        </div>
      </div>

      {/* Two environments, read from the version list rather than stored. */}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <section className="min-w-0 rounded-panel border border-rule p-4">
          <p className="text-caption text-graphite">Preview</p>
          <p className="text-lead font-mono">{preview}</p>
          <p className="mt-1 max-w-[72ch] text-small text-graphite">
            {applied.length > 0
              ? `Includes ${applied.length} change ${applied.length === 1 ? "you accepted" : "you accepted"} in the Code tab.`
              : "The newest build. Nobody outside your team sees this."}
          </p>
        </section>
        <section className="min-w-0 rounded-panel border border-live p-4">
          <p className="text-caption text-graphite">Production</p>
          <p className="text-lead font-mono">
            {live?.label ?? "nothing live"}{" "}
            <span className="text-caption text-live">live</span>
          </p>
          <p className="mt-1 max-w-[72ch] text-small text-graphite">
            {live ? live.change : "Deploy a version to put it in front of people."}
          </p>
        </section>
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <SheetTrigger id="promote-trigger" href={query({ sheet: "promote" })}>
          Deploy {preview} to production
        </SheetTrigger>
        <SheetTrigger
          id="github-trigger"
          href={query({ sheet: "github" })}
          variant="quiet"
        >
          Connect GitHub
        </SheetTrigger>
        <DemoNote>
          Demo actions. Nothing is deployed and no repository is created.
        </DemoNote>
      </div>

      {/* F6's last hop: accepted changes show up here as commits. */}
      {pendingChanges(changes).length > 0 ? (
        <section className="min-w-0 rounded-panel border border-rule p-4">
          <h3 className="text-lead font-semibold">Waiting on your review</h3>
          <ul className="mt-2 flex flex-col gap-2">
            {pendingChanges(changes).map((c) => {
              const isApplied = applied.some((a) => a.id === c.id);
              const becomes = versionForPending(project, changes, c.id);
              return (
                <li key={c.id} className="flex flex-wrap items-baseline gap-x-2 text-small">
                  <span className="font-mono text-caption text-graphite">{c.id}</span>
                  <span className="min-w-0">{c.message}</span>
                  <span className="font-mono text-caption text-cost">
                    {money(c.cost ?? 0)}
                  </span>
                  <span className="text-caption">
                    {isApplied ? (
                      <span className="text-live">ok accepted, becomes {becomes}</span>
                    ) : (
                      <span className="text-graphite">
                        not accepted yet, would become {becomes}
                      </span>
                    )}
                  </span>
                  <Link
                    href={query({ tab: "code", pane: "canvas", diff: c.diffs[0]?.id ?? "" })}
                    className="text-caption text-blueprint underline"
                  >
                    Review in Code
                  </Link>
                </li>
              );
            })}
          </ul>
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            A version number is decided by where a change sits in the list, not
            by the order you accept things, so the same decisions always produce
            the same numbers.
          </p>
        </section>
      ) : null}

      <section className="min-w-0 rounded-panel border border-rule p-4">
        <h3 className="text-lead font-semibold">Versions</h3>
        <div className="mt-3 min-w-0 overflow-x-auto">
          <ul className="flex flex-col gap-2 sm:hidden">
            {project.versions.map((v) => (
              <li key={v.id} className="min-w-0 rounded-input border border-rule p-3">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-small">{v.label}</span>
                  <span className="font-mono text-caption text-cost">{money(v.cost)}</span>
                  <span className="text-caption">
                    {v.live ? (
                      <span className="text-live">production, live</span>
                    ) : (
                      <span className="text-graphite">{v.environment ?? "not deployed"}</span>
                    )}
                  </span>
                </p>
                <p className="mt-1 min-w-0 text-small">{v.change}</p>
                {!v.live ? (
                  <Link
                    href={query({ sheet: "rollback", rollback: v.label })}
                    className="mt-1 inline-flex min-h-11 items-center text-caption text-blueprint underline"
                  >
                    Roll back to {v.label}
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>

          <table className="hidden w-full border-collapse text-small sm:table">
            <thead>
              <tr className="text-left text-graphite">
                <th className="border-b border-rule py-2 pr-4 font-medium">Version</th>
                <th className="border-b border-rule py-2 pr-4 font-medium">Change</th>
                <th className="border-b border-rule py-2 pr-4 font-medium">Cost</th>
                <th className="border-b border-rule py-2 pr-4 font-medium">Where</th>
                <th className="border-b border-rule py-2 font-medium">Roll back</th>
              </tr>
            </thead>
            <tbody>
              {project.versions.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-rule py-2 pr-4 font-mono">{v.label}</td>
                  <td className="border-b border-rule py-2 pr-4">{v.change}</td>
                  <td className="border-b border-rule py-2 pr-4 font-mono text-cost">
                    {money(v.cost)}
                  </td>
                  <td className="border-b border-rule py-2 pr-4">
                    {v.live ? (
                      <span className="text-live">production, live</span>
                    ) : (
                      <span className="text-graphite">{v.environment ?? "not deployed"}</span>
                    )}
                  </td>
                  <td className="border-b border-rule py-2">
                    {v.live ? (
                      <span className="text-caption text-graphite">already live</span>
                    ) : (
                      <Link
                        href={query({ sheet: "rollback", rollback: v.label })}
                        className="text-caption text-blueprint underline"
                      >
                        Roll back
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-3 min-w-0 border-t border-rule pt-3">
          <p className="max-w-[72ch] text-caption text-graphite">
            A version number is taken when a build starts, so the list skips{" "}
            {project.discarded.map((d) => d.label).join(", ")}:{" "}
            {project.discarded.length} of the{" "}
            {project.versions.length + project.discarded.length} builds this
            month never reached deploy. Each is charged{" "}
            <span className="font-mono text-cost">{money(0)}</span>, because the
            platform did not deliver a working app. They are inside the{" "}
            <span className="font-mono text-cost">{money(ledgerSpend(project))}</span>{" "}
            total, adding nothing to it.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {project.discarded.map((d) => (
              <li key={d.label} className="flex flex-wrap gap-x-2 text-caption">
                <span className="font-mono text-graphite">{d.label}</span>
                <span className="font-mono text-cost">{money(d.cost)}</span>
                <span className="min-w-0 text-graphite">{d.reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {sheet === "promote" ? (
        <Sheet
          id="promote"
          title={`Deploy ${preview} to production`}
          note={`${live?.label ?? "Nothing"} is live now. This would put ${preview} in front of everyone who uses the app.`}
          closeHref={query({ sheet: "" })}
          returnTo="promote-trigger"
          footer={
            <>
              <span className="inline-flex min-h-11 cursor-default items-center rounded-input bg-blueprint px-4 text-body text-paper">
                Deploy to production
              </span>
              <DemoNote>
                Demo action. Nothing is deployed, and nothing here has been
                written yet.
              </DemoNote>
            </>
          }
        >
          <div className="flex min-w-0 flex-col gap-4">
            <section className="min-w-0">
              <h3 className="text-body font-medium">What changes</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {revertedBy(project, live?.label ?? "v0").map((v) => (
                  <li key={v.id} className="flex flex-wrap gap-x-2 text-small">
                    <span className="font-mono text-caption text-graphite">{v.label}</span>
                    <span className="min-w-0">{v.change}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="min-w-0">
              <h3 className="text-body font-medium">Checks</h3>
              <p className="mt-1 text-small">
                <span className="text-live">ok {passed} of {CHECKS.length} passed</span>{" "}
                <span className="text-graphite">
                  including the preview health check, which is what makes a build
                  finished rather than finished looking.
                </span>
              </p>
            </section>

            <section className="min-w-0">
              <h3 className="text-body font-medium">Domain</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {DOMAINS.map((d) => (
                  <li key={d.host} className="flex flex-wrap items-baseline gap-x-2 text-small">
                    <span className="font-mono">{d.host}</span>
                    <span className={`text-caption ${d.state === "live" ? "text-live" : "text-cost"}`}>
                      {d.state === "live" ? "ok live" : "needs dns"}
                    </span>
                    <span className="min-w-0 text-caption text-graphite">{d.detail}</span>
                  </li>
                ))}
              </ul>
            </section>

            <section className="min-w-0">
              <h3 className="text-body font-medium">Publish</h3>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small">
                <span className="rounded-input border border-rule px-2 py-0.5 text-caption">
                  {PUBLISH.marketplace ? "on" : "off"}
                </span>
                <span>List on Marketplace</span>
              </p>
              <p className="mt-1 max-w-[72ch] text-caption text-graphite">
                {project.copy.marketplaceNote}
              </p>
            </section>

            <section className="min-w-0">
              <h3 className="text-body font-medium">Access</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {MEMBERS.map((m) => (
                  <li key={m.email} className="flex flex-wrap items-baseline gap-x-2 text-small">
                    <span className="min-w-0">{m.name}</span>
                    <span className="font-mono text-caption text-graphite">{m.email}</span>
                    <span className="rounded-input border border-rule px-2 py-0.5 text-caption">
                      {m.role}
                    </span>
                    <span className={`text-caption ${m.state === "active" ? "text-graphite" : "text-cost"}`}>
                      {m.state}
                    </span>
                  </li>
                ))}
              </ul>
              <div className="mt-2 flex min-w-0 flex-wrap items-center gap-2">
                <span className="inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption text-graphite">
                  Invite by email
                </span>
                <span className="inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption text-graphite">
                  Role: admin
                </span>
                <span className="inline-flex min-h-11 cursor-default items-center rounded-input border border-rule px-3 text-caption">
                  Send invite
                </span>
              </div>
              <p className="mt-1 max-w-[72ch] text-caption text-graphite">
                Admin is an invite here. In today&apos;s Architect it is a server
                environment variable, which the person who owns the app cannot
                reach. Demo action: no invite is sent.
              </p>
              <ul className="mt-2 flex flex-col gap-0.5">
                {ROLES.map((r) => (
                  <li key={r.id} className="flex flex-wrap gap-x-2 text-caption text-graphite">
                    <span className="font-medium">{r.label}</span>
                    <span className="min-w-0">{r.can}</span>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </Sheet>
      ) : null}

      {sheet === "rollback" && rollbackTo ? (
        <Sheet
          id="rollback"
          title={`Roll back to ${rollbackTo.label}`}
          note={`${rollbackTo.change}. This would become what people see, in one step.`}
          closeHref={query({ sheet: "", rollback: "" })}
          footer={
            <>
              <span className="inline-flex min-h-11 cursor-default items-center rounded-input bg-blueprint px-4 text-body text-paper">
                Roll back to {rollbackTo.label}
              </span>
              <DemoNote>Demo action. Nothing is rolled back.</DemoNote>
            </>
          }
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="min-w-0">
              <h3 className="text-body font-medium">What reverts</h3>
              {reverts.length === 0 ? (
                <p className="mt-1 text-small text-graphite">
                  Nothing. {rollbackTo.label} is already the newest version.
                </p>
              ) : (
                <ul className="mt-1 flex flex-col gap-1">
                  {reverts.map((v) => (
                    <li key={v.id} className="flex flex-wrap gap-x-2 text-small">
                      <span className="font-mono text-caption text-graphite">{v.label}</span>
                      <span className="min-w-0">{v.change}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="max-w-[72ch] text-small text-graphite">
              After this, <span className="font-mono">{rollbackTo.label}</span>{" "}
              is live and <span className="font-mono">{preview}</span> stays in
              preview. Only versions that exist can be chosen, which is why this
              list is built from the version table rather than typed.
            </p>
          </div>
        </Sheet>
      ) : null}

      {sheet === "github" ? (
        <GithubSheet
          project={project}
          fileCount={fileCount}
          changeCount={changes.length}
          closeHref={query({ sheet: "" })}
        />
      ) : null}

      <p className="max-w-[72ch] text-caption text-graphite">
        Spend this month:{" "}
        <span className="font-mono text-cost">{money(spend)}</span> of{" "}
        <span className="font-mono text-cost">{money(project.ledger.cap)}</span>{" "}
        cap, summed from the versions above.
      </p>
    </div>
  );
}

/** Screen 14. The consent sheet, and the answer to the repo nobody asked for. */
function GithubSheet({
  project,
  fileCount,
  changeCount,
  closeHref,
}: {
  project: DemoProject;
  fileCount: number;
  changeCount: number;
  closeHref: string;
}) {
  return (
    <Sheet
      id="github"
      title="Connect GitHub"
      note="Nothing is written to your account until you press Connect and push."
      closeHref={closeHref}
      returnTo="github-trigger"
      footer={
        <>
          <span className="inline-flex min-h-11 cursor-default items-center rounded-input bg-blueprint px-4 text-body text-paper">
            Connect and push
          </span>
          <DemoNote>
            Demo action. No repository is created and nothing is pushed.
          </DemoNote>
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-4">
        <section className="min-w-0">
          <h3 className="text-body font-medium">Repository</h3>
          <ul className="mt-1 flex flex-col gap-1">
            <li className="flex flex-wrap items-baseline gap-x-2 text-small">
              <span className="rounded-input border border-blueprint px-2 py-0.5 text-caption text-blueprint">
                selected
              </span>
              <span className="font-mono">northwind-helpline</span>
              <span className="text-caption text-graphite">
                New repository under your account
              </span>
            </li>
            <li className="flex flex-wrap items-baseline gap-x-2 text-small text-graphite">
              <span className="rounded-input border border-rule px-2 py-0.5 text-caption">
                option
              </span>
              <span className="font-mono">northwind/helpline-app</span>
              <span className="text-caption">A repository you already own</span>
            </li>
          </ul>
        </section>

        <section className="min-w-0">
          <h3 className="text-body font-medium">Visibility and sync</h3>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small">
            <span className="rounded-input border border-live px-2 py-0.5 text-caption text-live">
              private
            </span>
            <span className="text-graphite">
              by default. The modal this replaces never said which it was.
            </span>
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 text-small">
            <span className="rounded-input border border-rule px-2 py-0.5 text-caption">
              two-way
            </span>
            <span className="text-graphite">
              by default. Your commits come in, Architect&apos;s go out.
            </span>
          </p>
        </section>

        {/* Derived, so the sentence cannot drift from what the Code tab shows. */}
        <section className="min-w-0 rounded-input border border-rule p-3">
          <h3 className="text-body font-medium">What will be written</h3>
          <ul className="mt-1 flex flex-col gap-0.5 text-small">
            <li>
              Create <span className="font-mono">private</span> repository{" "}
              <span className="font-mono">northwind-helpline</span>
            </li>
            <li>
              Push <span className="font-mono">{fileCount}</span> files
            </li>
            <li>
              Create <span className="font-mono">{changeCount}</span> commits
            </li>
          </ul>
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            Counted from the file tree and the change list on the Code tab, so
            this is what is actually there rather than a sentence someone typed.
            Nothing is written until you confirm.
          </p>
        </section>

        <section className="min-w-0">
          <h3 className="text-body font-medium">After connecting</h3>
          <p className="mt-1 max-w-[72ch] text-caption text-graphite">
            Both directions, which is the part that was one way before.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {SYNC_LOG.map((c) => (
              <li key={c.sha} className="flex flex-wrap items-baseline gap-x-2 text-small">
                <span className={`text-caption ${c.direction === "in" ? "text-blueprint" : "text-graphite"}`}>
                  {c.direction === "in" ? "into Architect" : "from Architect"}
                </span>
                <span className="font-mono text-caption text-graphite">{c.sha}</span>
                <span className="min-w-0">{c.message}</span>
                <span className="text-caption text-graphite">{c.ago}</span>
              </li>
            ))}
          </ul>
        </section>

        <p className="max-w-[72ch] text-caption text-graphite">
          {project.copy.githubConsent}
        </p>
      </div>
    </Sheet>
  );
}
