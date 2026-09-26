import Link from "next/link";
import type { Metadata } from "next";
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
    <main className="mx-auto flex min-h-dvh w-full max-w-3xl flex-col gap-6 p-4 sm:p-6">
      <header className="flex min-w-0 flex-col gap-2">
        <p className="text-caption text-graphite">Architect 2.0</p>
        <h1 className="text-title font-semibold">Terms</h1>
        <p className="max-w-[72ch] text-body text-graphite">
          Last updated {LEGAL_UPDATED}.
        </p>
      </header>

      <section className="min-w-0">
        <h2 className="text-lead font-semibold">What this is</h2>
        <p className="mt-1 max-w-[72ch] text-body">
          Architect 2.0 is a product concept built by Abhishek Katkar as a
          hiring assignment. It is a demonstration, not a commercial service,
          not a product you can buy, and not affiliated with or endorsed by any
          company whose name appears in it.
        </p>
        <p className="mt-2 max-w-[72ch] text-body">
          Most of what it shows is simulated and says so on screen. Sign-in,
          project storage and three decision-model agents are real. Building,
          previewing, deploying, connecting a repository and importing a
          repository are not: nothing is built, no repository is created and
          nothing is deployed anywhere.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-lead font-semibold">Provided as is</h2>
        <p className="mt-1 max-w-[72ch] text-body">
          There is no warranty of any kind, no guarantee that it works, and no
          undertaking that it stays available. It may change or be taken down
          without notice, and the database may be deleted once the assignment
          has been reviewed. Do not rely on it for anything, and do not store
          anything in it you would be unhappy to lose.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-lead font-semibold">Fair use</h2>
        <p className="mt-1 max-w-[72ch] text-body">
          The three decision agents make real calls that cost real money, so
          they are limited to{" "}
          <strong>
            {RATE_LIMIT_PER_IP_PER_HOUR} calls per address per hour
          </strong>{" "}
          and <strong>{DAILY_CALL_CAP} calls per day</strong> in total. Past
          either limit the screen shows a stored result from an earlier real
          call, clearly labelled with its date, rather than pretending to run.
        </p>
        <p className="mt-2 max-w-[72ch] text-body">
          Please do not try to get around those limits, scrape the site, or use
          it to process anything sensitive or unlawful.
        </p>
      </section>

      <section className="min-w-0">
        <h2 className="text-lead font-semibold">Your content</h2>
        <p className="mt-1 max-w-[72ch] text-body">
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
        <h2 className="text-lead font-semibold">The code</h2>
        <p className="mt-1 max-w-[72ch] text-body">
          The source is public and the process behind it is written up in the
          same repository. Those documents are the point of the project, and
          they are as much a part of it as the running site.
        </p>
      </section>

      <footer className="min-w-0 border-t border-rule pt-4">
        <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
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
  );
}
