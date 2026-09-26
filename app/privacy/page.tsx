import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/ui/marketing-header";
import { LEGAL_CONTACT, LEGAL_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Exactly what this concept stores, who processes it, and how to have it deleted.",
};


/**
 * The privacy page.
 *
 * Written from the schema and the code rather than from a template, because a
 * generic privacy page on a product whose whole argument is "show your
 * evidence" would be the one dishonest page in the repo. Every table and column
 * named here is in supabase/migrations, and every processor named here is one
 * the code actually calls.
 */
export default function PrivacyPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-3xl min-w-0 px-4 py-6 sm:px-8">
        <MarketingHeader />
      </div>

      <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-10 px-4 pt-8 pb-16 sm:px-8">
      <header className="flex min-w-0 flex-col gap-4">
        <h1 className="text-display font-bold">Privacy</h1>
        <p className="max-w-[72ch] text-note text-graphite">
          Last updated {LEGAL_UPDATED}.
        </p>
        <p className="max-w-[72ch] text-lead">
          This is a product concept built as a hiring assignment, not a
          commercial service. It is a working demonstration with a real sign-in
          and a real database, so it does store a small amount of data, and this
          page lists all of it.
        </p>
      </header>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">If you never sign in</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Nothing about you is stored in the database. The demo at{" "}
          <Link href="/demo" className="text-blueprint underline">
            /demo
          </Link>{" "}
          reads fixed sample data and writes nothing. The one exception is
          described under &quot;Running an agent&quot; below, and it stores no
          identifying information.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">If you sign in with Google</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Sign-in uses Supabase Auth with Google. No extra permissions are
          requested beyond the defaults, which are your name, email address and
          profile picture. Supabase stores those in its own managed{" "}
          <span className="font-mono text-small">auth.users</span> table.
        </p>
        <p className="mt-3 max-w-[72ch] text-note">
          Two tables in this project&apos;s own database then hold data about
          you. Both have row level security, and every policy scopes every row
          to the user who owns it, so one account cannot read another&apos;s.
        </p>
        <ul className="mt-2 flex flex-col gap-3">
          <li className="min-w-0 rounded-card border border-rule bg-paper p-5 shadow-soft">
            <p className="font-mono text-small">profiles</p>
            <p className="mt-2 max-w-[72ch] text-note text-graphite">
              Your user id, and one preference: whether you chose the guided or
              the detailed view during onboarding. Nothing else.
            </p>
          </li>
          <li className="min-w-0 rounded-card border border-rule bg-paper p-5 shadow-soft">
            <p className="font-mono text-small">projects</p>
            <p className="mt-2 max-w-[72ch] text-note text-graphite">
              Your user id, and for each project you create: the name, the
              prompt you typed, and a status. <strong>The prompt is text you
              wrote, and it is stored.</strong> Do not put anything sensitive in
              it. Nothing else about a project is real: the build, agents, code
              and deploy screens all read fixed sample data.
            </p>
          </li>
        </ul>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Running an agent</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Three agents in the demo make real calls to a decision model. Pressing
          &quot;Run this agent&quot; sends the text in that box to Vercel AI
          Gateway, which passes it to TypeSafe AI&apos;s Jev model. If you leave
          the box alone, a fixed sample sentence is sent instead.
        </p>
        <p className="mt-3 max-w-[72ch] text-note">
          Each call writes one row to a table called{" "}
          <span className="font-mono text-small">jev_calls</span>, containing
          exactly six things:
        </p>
        <ul className="mt-2 flex flex-col gap-1">
          {[
            ["created_at", "when the call happened"],
            ["agent_id", "which of the three agents ran"],
            ["outcome", "whether it was live, rate limited, capped, or failed"],
            ["latency_ms", "how long it took"],
            ["ip_hash", "a SHA-256 of your IP address plus a secret salt, kept only to enforce the rate limit"],
            ["id", "a random row identifier"],
          ].map(([col, what]) => (
            <li key={col} className="flex flex-wrap gap-x-2 text-note">
              <span className="font-mono text-graphite">{col}</span>
              <span className="min-w-0">{what}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 max-w-[72ch] text-note">
          <strong>The text you submit is not stored in that row, and neither is
          the answer.</strong> The IP hash is not reversible without the salt,
          which is a server-only secret, and no visitor can read that table: the
          anonymous role can add a row through a narrow function and cannot
          select from it.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Cookies</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Two kinds, both necessary, neither for advertising or analytics. There
          is no analytics or tracking on this site at all.
        </p>
        <ul className="mt-2 flex flex-col gap-2 text-note">
          <li>
            <span className="font-mono text-graphite">theme</span> remembers
            whether you chose light or dark. Choosing Auto deletes it.
          </li>
          <li>
            Supabase sets session cookies once you sign in, so you stay signed
            in. Signing out clears them.
          </li>
        </ul>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Who else handles this data</h2>
        <ul className="mt-2 flex flex-col gap-2">
          <li className="min-w-0 text-note">
            <span className="font-medium">Supabase</span>{" "}
            <span className="text-graphite">
              hosts the database and runs authentication. It holds everything
              described above, and your Google account details.
            </span>
          </li>
          <li className="min-w-0 text-note">
            <span className="font-medium">Vercel</span>{" "}
            <span className="text-graphite">
              hosts the site and operates the AI Gateway that agent calls pass
              through.
            </span>
          </li>
          <li className="min-w-0 text-note">
            <span className="font-medium">TypeSafe AI</span>{" "}
            <span className="text-graphite">
              provides the Jev decision model, and receives the text you submit
              when you press &quot;Run this agent&quot;.
            </span>
          </li>
          <li className="min-w-0 text-note">
            <span className="font-medium">Google</span>{" "}
            <span className="text-graphite">
              handles the sign-in itself, if you choose to sign in.
            </span>
          </li>
        </ul>
        <p className="mt-3 max-w-[72ch] text-note">
          Nothing is sold, and nothing is shared with anyone beyond the four
          above.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Deleting your data</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Email{" "}
          <a href={`mailto:${LEGAL_CONTACT}`} className="text-blueprint underline">
            {LEGAL_CONTACT}
          </a>{" "}
          and ask. Your account and every row belonging to it will be deleted,
          and the project rows go with the account automatically, because they
          are defined to cascade. Say which email address you signed in with, so
          the right account is removed.
        </p>
        <p className="mt-3 max-w-[72ch] text-note text-graphite">
          Because this is a hiring assignment rather than a service, the whole
          database may be deleted after the assignment is reviewed.
        </p>
      </section>

      <footer className="min-w-0 border-t border-rule pt-6">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-note">
          <Link href="/" className="text-blueprint underline">
            Home
          </Link>
          <Link href="/terms" className="text-blueprint underline">
            Terms
          </Link>
          <Link href="/demo" className="text-blueprint underline">
            Try the demo
          </Link>
        </p>
      </footer>
      </main>
    </div>
  );
}
