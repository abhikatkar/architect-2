import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/ui/marketing-header";
import { LEGAL_CONTACT, LEGAL_UPDATED } from "@/lib/legal";
import {
  DAILY_CALL_CAP,
  RATE_LIMIT_PER_IP_PER_HOUR,
} from "@/lib/jev/limits";

export const metadata: Metadata = {
  title: "Terms",
  description:
    "A product concept built for a hiring assignment, provided as is.",
};


/** Short on purpose. There is no service here to write long terms about. */
export default function TermsPage() {
  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-3xl min-w-0 px-4 py-6 sm:px-8">
        <MarketingHeader />
      </div>

      <main className="mx-auto flex w-full max-w-3xl min-w-0 flex-1 flex-col gap-10 px-4 pt-8 pb-16 sm:px-8">
      <header className="flex min-w-0 flex-col gap-4">
        <h1 className="text-display font-bold">Terms</h1>
        <p className="max-w-[72ch] text-note text-graphite">
          Last updated {LEGAL_UPDATED}.
        </p>
      </header>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">What this is</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Architect 2.0 is a product concept built by Abhishek Katkar as a
          hiring assignment. It is a demonstration, not a commercial service,
          not a product you can buy, and not affiliated with or endorsed by any
          company whose name appears in it.
        </p>
        <p className="mt-3 max-w-[72ch] text-note">
          Most of what it shows is simulated and says so on screen. Sign-in,
          project storage and three decision-model agents are real. Building,
          previewing, deploying, connecting a repository and importing a
          repository are not: nothing is built, no repository is created and
          nothing is deployed anywhere.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Provided as is</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          There is no warranty of any kind, no guarantee that it works, and no
          undertaking that it stays available. It may change or be taken down
          without notice, and the database may be deleted once the assignment
          has been reviewed. Do not rely on it for anything, and do not store
          anything in it you would be unhappy to lose.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Fair use</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          The three decision agents make real calls that cost real money, so
          they are limited to{" "}
          <strong>
            {RATE_LIMIT_PER_IP_PER_HOUR} calls per address per hour
          </strong>{" "}
          and <strong>{DAILY_CALL_CAP} calls per day</strong> in total. Past
          either limit the screen shows a stored result from an earlier real
          call, clearly labelled with its date, rather than pretending to run.
        </p>
        <p className="mt-3 max-w-[72ch] text-note">
          Please do not try to get around those limits, scrape the site, or use
          it to process anything sensitive or unlawful.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">Your content</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          Anything you type stays yours. Project names and prompts are stored
          against your account and nothing else you type is kept, which the{" "}
          <Link href="/privacy" className="text-blueprint underline">
            privacy page
          </Link>{" "}
          sets out in detail. Ask at{" "}
          <a href={`mailto:${LEGAL_CONTACT}`} className="text-blueprint underline">
            {LEGAL_CONTACT}
          </a>{" "}
          and it will be deleted.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-subhead font-semibold">The code</h2>
        <p className="mt-3 max-w-[72ch] text-note">
          The source is public and the process behind it is written up in the
          same repository. Those documents are the point of the project, and
          they are as much a part of it as the running site.
        </p>
      </section>

      <footer className="min-w-0 border-t border-rule pt-6">
        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-note">
          <Link href="/" className="text-blueprint underline">
            Home
          </Link>
          <Link href="/privacy" className="text-blueprint underline">
            Privacy
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
