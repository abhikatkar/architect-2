import Link from "next/link";
import type { DemoProject } from "@/lib/seed/types";
import { DOMAINS, MEMBERS, PUBLISH, ROLES, SYNC_LOG } from "@/lib/seed/deploy";
import { codeFiles, CHECKS } from "@/lib/seed/code";
import {
  type AppliedState,
  appliedPending,
  checksPassed,
  deployAction,
  newerThanProduction,
  pendingChanges,
  productionDeploys,
  pushableChanges,
  revertedBy,
  rollbackTargets,
  rowsTotal,
  versionForPending,
  whereIs,
} from "@/lib/seed/totals";
import type { ChangeRequest, Version } from "@/lib/seed/types";
import { Sheet, SheetTrigger, DemoNote } from "@/components/ui/sheet";
import { DemoButton, DemoSwitch } from "@/components/ui/demo-button";

const money = (n: number) => `$${n.toFixed(2)}`;

/**
 * Where a version is, in a word, never by colour alone (D20).
 *
 * "Not deployed" is about now. A version that was in production before says so,
 * because otherwise the one row offering a rollback reads exactly like the six
 * that offer nothing.
 */
function Where({
  version,
  previewVersion,
  liveLabel,
}: {
  version: Version;
  previewVersion: string;
  liveLabel: string;
}) {
  const state = whereIs(version, previewVersion);
  if (state === "production") return <span className="text-live">production, live</span>;
  if (state === "preview") return <span className="text-blueprint">preview</span>;
  if (version.wasLive) {
    return <span className="text-graphite">was live before {liveLabel}</span>;
  }
  return <span className="text-graphite">not deployed</span>;
}

/**
 * The one control a version row offers.
 *
 * Written once and rendered twice, by the phone list and the table. They used
 * to carry their own copies of this logic, which is how they came to offer a
 * rollback to eight versions that had never been in production.
 */
function RowAction({
  version,
  action,
  query,
  withId,
}: {
  version: Version;
  action: ReturnType<typeof deployAction>;
  query: (patch: Record<string, string>) => string;
  /** Only the table carries the id, so the document has no duplicate. */
  withId?: boolean;
}) {
  if (action === "live") {
    return <span className="text-caption text-graphite">already live</span>;
  }
  if (action === "none") {
    return (
      <span className="text-caption text-graphite">
        never live, older than production
      </span>
    );
  }
  const rollback = action === "rollback";
  const target = `${rollback ? "rollback" : "promote"}-${version.label}`;
  return (
    <Link
      id={withId ? target : undefined}
      data-return-to={target}
      href={query(
        rollback
          ? { sheet: "rollback", rollback: version.label }
          : { sheet: "promote", promote: version.label },
      )}
      className="text-caption text-blueprint underline"
    >
      {rollback ? "Roll back" : "Promote"}
    </Link>
  );
}

/**
 * Screen 16, Deploy, and the two sheets that open from it.
 *
 * Everything on this screen is derived. The live version, the preview version,
 * what a rollback would revert, and the month's spend all read from the version
 * list and the one applied state rather than being written down anywhere. That
 * is the rule D36 exists for, and this screen is where it was first broken.
 * Round 4 broke it again in a subtler way: this panel derived the preview
 * version from the accept list while the ledger bar derived it from the fix
 * flag, so the same page showed v15 here and v14 at the foot. Both now read the
 * state computed once by the page.
 *
 * Three defaults here are answers to what the teardown found, and each says so
 * on screen rather than in a doc: the repo is private, Marketplace is off, and
 * admin is an invite rather than a server environment variable.
 */
export function DeployCanvas({
  project,
  applied,
  sheet,
  rollback,
  promote,
  query,
}: {
  project: DemoProject;
  applied: AppliedState;
  sheet: string;
  rollback: string;
  promote: string;
  query: (patch: Record<string, string>) => string;
}) {
  const { changes, accepted, rows } = applied;
  const landed = appliedPending(changes, accepted);
  const preview = applied.previewVersion;
  const spend = applied.spend;
  const live = project.versions.find((v) => v.live);
  const liveLabel = live?.label ?? "v0";
  const targets = rollbackTargets(project);
  const rollbackTo = targets.find((v) => v.label === rollback);
  const reverts = rollbackTo ? revertedBy(project, rollbackTo.label) : [];

  /*
    Promotion has a target, and it defaults to what is in preview.

    Every row newer than production can be promoted, so the row control and the
    header button open the same sheet with a different target, rather than the
    header owning the only promotion in the product.
  */
  const promotable = newerThanProduction(rows, liveLabel);
  const promoteTo =
    promotable.find((v) => v.label === promote) ??
    promotable.find((v) => v.label === preview) ??
    promotable[promotable.length - 1];
  // What that promotion would put in front of people: everything up to it.
  const promoteBrings = promoteTo
    ? promotable.filter(
        (v) => Number(v.label.slice(1)) <= Number(promoteTo.label.slice(1)),
      )
    : [];
  const passed = checksPassed(CHECKS);
  const fileCount = codeFiles(project).length;

  return (
    <div className="flex min-w-0 flex-1 flex-col gap-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <h2 className="text-title font-bold">Deploy</h2>
          <span className="max-w-[72ch] text-small text-graphite">
            What is live, what is waiting in preview, and what it would take to
            change that.
          </span>
        </div>
      </div>

      {/*
        The word "deploy" appears once on this screen and means what it says.

        The footer counts builds, because 5 of this month's were discarded and
        most of the rest were never deployed anywhere. Production deploys are a
        different, much smaller number, and conflating the two is what made the
        footer read "9 deploys" above a table where 7 rows said "not deployed".
      */}
      <p className="max-w-[72ch] text-caption text-graphite">
        <span className="font-mono">{productionDeploys(project)}</span> deploys
        to production this month, out of{" "}
        <span className="font-mono">{applied.builds}</span> builds.{" "}
        {rollbackTargets(project).length === 1
          ? `${rollbackTargets(project)[0].label} was live before ${liveLabel}, so it is the one version a rollback can go back to.`
          : `${rollbackTargets(project).length} of them were live before ${liveLabel}.`}
      </p>

      {/* Two environments, derived from what is live and what is in preview. */}
      <div className="grid min-w-0 gap-3 sm:grid-cols-2">
        <section className="min-w-0 rounded-panel border border-rule p-4">
          <p className="text-caption text-graphite">Preview</p>
          <p className="text-lead font-mono">{preview}</p>
          <p className="mt-1 max-w-[72ch] text-small text-graphite">
            {landed.length > 0
              ? `Includes ${landed.length} change${landed.length === 1 ? "" : "s"} you accepted, from the Code tab or the trace.`
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
        <SheetTrigger
          id="promote-trigger"
          href={query({ sheet: "promote", promote: "" })}
        >
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
              const isApplied = landed.some((a) => a.id === c.id);
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
            {rows.map((v) => (
              <li key={v.id} className="min-w-0 rounded-input border border-rule p-3">
                <p className="flex flex-wrap items-baseline gap-x-2">
                  <span className="font-mono text-small">{v.label}</span>
                  <span className="font-mono text-caption text-cost">{money(v.cost)}</span>
                  <span className="text-caption">
                    <Where version={v} previewVersion={preview} liveLabel={liveLabel} />
                  </span>
                </p>
                <p className="mt-1 min-w-0 text-small">{v.change}</p>
                <p className="mt-1 flex min-h-11 items-center">
                  <RowAction
                    version={v}
                    action={deployAction(v, liveLabel)}
                    query={query}
                  />
                </p>
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
                <th className="border-b border-rule py-2 font-medium">Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((v) => (
                <tr key={v.id}>
                  <td className="border-b border-rule py-2 pr-4 font-mono">{v.label}</td>
                  <td className="border-b border-rule py-2 pr-4">{v.change}</td>
                  <td className="border-b border-rule py-2 pr-4 font-mono text-cost">
                    {money(v.cost)}
                  </td>
                  <td className="border-b border-rule py-2 pr-4">
                    <Where version={v} previewVersion={preview} liveLabel={liveLabel} />
                  </td>
                  <td className="border-b border-rule py-2">
                    <RowAction
                      version={v}
                      action={deployAction(v, liveLabel)}
                      query={query}
                      withId
                    />
                  </td>
                </tr>
              ))}
              {/* The rows are the total. Round 4 found a stated total of $3.43
                  above rows that summed to $3.37, because v15 was not here. */}
              <tr>
                <td className="py-2 pr-4 text-caption text-graphite">
                  {rows.length} versions
                </td>
                <td className="py-2 pr-4 text-caption text-graphite">
                  plus {project.discarded.length} discarded at {money(0)}
                </td>
                <td className="py-2 pr-4 font-mono text-cost">
                  {money(rowsTotal(rows, project))}
                </td>
                <td className="py-2 pr-4" />
                <td className="py-2" />
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-3 min-w-0 border-t border-rule pt-3">
          <p className="max-w-[72ch] text-caption text-graphite">
            A version number is taken when a build starts, so the list skips{" "}
            {project.discarded.map((d) => d.label).join(", ")}:{" "}
            {project.discarded.length} of the {applied.builds} builds this month
            never produced a version. {project.copy.failedBuildPolicy} They are
            inside the{" "}
            <span className="font-mono text-cost">{money(spend)}</span> total,
            adding nothing to it.
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

      {sheet === "promote" && promoteTo ? (
        <Sheet
          id="promote"
          title={`Deploy ${promoteTo.label} to production`}
          note={`${live?.label ?? "Nothing"} is live now. This would put ${promoteTo.label} in front of everyone who uses the app.`}
          closeHref={query({ sheet: "", promote: "" })}
          /* The header button and every promotable row open this, so the
             return target is whichever one was used. */
          returnTo={promote === promoteTo.label ? `promote-${promoteTo.label}` : "promote-trigger"}
          footer={
            <>
              <DemoButton
                id="promote-confirm"
                note="Demo action. Nothing is deployed, and nothing here has been written yet."
              >
                Deploy to production
              </DemoButton>
            </>
          }
        >
          <div className="flex min-w-0 flex-col gap-4">
            <section className="min-w-0">
              <h3 className="text-body font-medium">What changes</h3>
              <ul className="mt-1 flex flex-col gap-1">
                {promoteBrings.map((v) => (
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
              <p className="mt-1 flex min-w-0 flex-wrap items-center gap-2 text-small">
                <DemoSwitch
                  id="marketplace"
                  label="List on Marketplace"
                  on={PUBLISH.marketplace}
                  note={project.copy.marketplaceNote}
                />
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
                <DemoButton
                  id="invite-confirm"
                  variant="quiet"
                  note="Demo action. No invite is sent."
                >
                  Send invite
                </DemoButton>
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
          /* Its trigger is a table link rather than a single control, so the
             target is named after the version it rolls back to. Both the phone
             list and the table carry it. */
          returnTo={`rollback-${rollbackTo.label}`}
          footer={
            <>
              <DemoButton
                id="rollback-confirm"
                note="Demo action. Nothing is rolled back."
              >
                Roll back to {rollbackTo.label}
              </DemoButton>
            </>
          }
        >
          <div className="flex min-w-0 flex-col gap-3">
            <div className="min-w-0">
              <h3 className="text-body font-medium">
                What reverts in production
              </h3>
              {reverts.length === 0 ? (
                <p className="mt-1 text-small text-graphite">
                  Nothing. {rollbackTo.label} is the newest version that has
                  been live.
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
            {/*
              This list used to name every later version, including ones that
              had only ever been in preview, directly above the line saying
              they stay in preview. A version that was never live does not
              change when production moves, so it is not in the list at all.
            */}
            <p className="max-w-[72ch] text-small text-graphite">
              After this, <span className="font-mono">{rollbackTo.label}</span>{" "}
              is live.{" "}
              {newerThanProduction(rows, liveLabel).length > 0 ? (
                <>
                  <span className="font-mono">
                    {newerThanProduction(rows, liveLabel)
                      .map((v) => v.label)
                      .join(" and ")}
                  </span>{" "}
                  {newerThanProduction(rows, liveLabel).length === 1
                    ? "stays in preview and is not affected, because it has never been live."
                    : "stay in preview and are not affected, because they have never been live."}
                </>
              ) : (
                "Nothing is waiting in preview."
              )}{" "}
              Only versions that have been in production can be rolled back to,
              which is why this list is built from the version table rather
              than typed.
            </p>
          </div>
        </Sheet>
      ) : null}

      {sheet === "github" ? (
        <GithubSheet
          project={project}
          fileCount={fileCount}
          changes={pushableChanges(applied)}
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
  changes,
  closeHref,
}: {
  project: DemoProject;
  fileCount: number;
  changes: ChangeRequest[];
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
          <DemoButton
            id="github-confirm"
            note="Demo action. No repository is created and nothing is pushed."
          >
            Connect and push
          </DemoButton>
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-4">
        <section className="min-w-0">
          <h3 className="text-body font-medium" id="repo-choice-label">
            Repository
          </h3>
          <ul
            role="radiogroup"
            aria-labelledby="repo-choice-label"
            className="mt-1 flex flex-col gap-1"
          >
            {[
              {
                id: "repo-new",
                name: "northwind-helpline",
                what: "New repository under your account",
                checked: true,
                note: "Demo action. This repository is not created, and the choice cannot be changed here.",
              },
              {
                id: "repo-existing",
                name: "northwind/helpline-app",
                what: "A repository you already own",
                checked: false,
                note: "Demo action. Nothing is pushed to a repository you already own.",
              },
            ].map((r) => (
              <li key={r.id} className="min-w-0">
                <button
                  type="button"
                  id={r.id}
                  role="radio"
                  aria-checked={r.checked}
                  aria-disabled="true"
                  /* Its own note, not the group's, so each option says what
                     would and would not happen to that repository. */
                  aria-describedby={`${r.id}-note`}
                  className={`flex min-h-11 w-full min-w-0 cursor-not-allowed flex-wrap items-baseline gap-x-2 rounded-input px-1 text-left text-small ${
                    r.checked ? "" : "text-graphite"
                  }`}
                >
                  <span
                    className={`rounded-input border px-2 py-0.5 text-caption ${
                      r.checked
                        ? "border-blueprint text-blueprint"
                        : "border-rule"
                    }`}
                  >
                    {r.checked ? "selected" : "option"}
                  </span>
                  <span className="font-mono">{r.name}</span>
                  <span className="text-caption">{r.what}</span>
                </button>
                <DemoNote id={`${r.id}-note`}>{r.note}</DemoNote>
              </li>
            ))}
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
              Create <span className="font-mono">{changes.length}</span>{" "}
              {changes.length === 1 ? "commit" : "commits"}
            </li>
          </ul>
          {/*
            Named, not just counted.

            The sheet said "3 commits" while the only hashes on the screen were
            two that arrive from the editor, so the three it meant appeared
            nowhere. These are the same hashes the Code tab lists, in the same
            order, and only the ones that have landed or that you have accepted:
            a change nobody has agreed to is not a commit.
          */}
          <ul className="mt-1 flex flex-col gap-0.5">
            {changes.map((c) => (
              <li key={c.id} className="flex flex-wrap items-baseline gap-x-2 text-caption">
                <span className="font-mono text-graphite">{c.id}</span>
                <span className="min-w-0">{c.message}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            Counted and named from the file tree and the change list on the Code
            tab, so this is what is actually there rather than a sentence
            someone typed. Nothing is written until you confirm.
          </p>
        </section>

        <section className="min-w-0">
          <h3 className="text-body font-medium">After connecting</h3>
          <p className="mt-1 max-w-[72ch] text-caption text-graphite">
            Both directions, which is the part that was one way before. The ones
            marked &quot;into Architect&quot; are commits you made in your own
            editor, so they are not in Architect&apos;s change list above: that
            is what two-way means.
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
