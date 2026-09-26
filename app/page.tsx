import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { Mark } from "@/components/ui/mark";
import { currentTheme } from "@/lib/theme";

export const metadata: Metadata = {
  // The landing page is the product, so it takes the bare name rather than
  // the layout's template, which would make it "Architect 2.0 | Architect 2.0".
  title: { absolute: "Architect 2.0" },
  description:
    "The agentic app builder where every layer is visible, steerable and yours.",
};

const REPO = "https://github.com/abhikatkar/architect-2";

/**
 * Each principle carries one measured finding rather than an adjective. Every
 * figure here is traceable to docs/01-competitive-teardown.md, which is what
 * separates this page from marketing copy.
 *
 * The figure is set as the largest thing on the card, because a number
 * somebody can go and check is the only part of a claim like this worth
 * anything.
 */
const PRINCIPLES = [
  {
    name: "See it",
    line: "Know what is happening and what it will cost, before it runs.",
    figure: "42 min",
    unit: "behind a 4 to 6 min label",
    evidence:
      "One build ran 42 minutes behind a label reading \"usually 4 to 6 min\", and cost $3.33 with no estimate shown beforehand. None of the five tools tested showed a price before spending it.",
  },
  {
    name: "Steer it",
    line: "Open any layer and fix what it did, at whatever depth suits you.",
    figure: "8 steps",
    unit: "to diagnose one agent",
    evidence:
      "Diagnosing one misbehaving agent took about 8 technical steps, and the fix itself had to be made in a different product.",
  },
  {
    name: "Own it",
    line: "Your code and your agents stay yours, and nothing moves without asking.",
    figure: "0 presses",
    unit: "of Push before a repo existed",
    evidence:
      "A GitHub repository was created and set to sync automatically without Push ever being pressed. Repo import, the thing that makes the code yours in both directions, was missing entirely in two of the five.",
  },
  {
    name: "Ship it safely",
    line: "Going live never surprises you, and everything is reversible.",
    figure: "2 defaults",
    unit: "that spend or expose",
    evidence:
      "Publishing to a marketplace defaults to on, with the modal itself warning that strangers reaching the app spend the owner's credits. Elsewhere a deployed admin dashboard was readable by anyone holding the URL, with no login.",
  },
];

export default async function LandingPage() {
  const theme = await currentTheme();

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <header className="mx-auto flex w-full max-w-[1120px] min-w-0 items-center gap-4 px-4 py-6 sm:px-8">
        <span className="flex min-w-0 items-center gap-2.5">
          <Mark className="h-8 w-8 shrink-0" />
          <span className="truncate text-subhead font-semibold">Architect 2.0</span>
        </span>
        <span className="ml-auto shrink-0">
          <ThemeToggle current={theme} next="/" />
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-[1120px] min-w-0 flex-1 flex-col px-4 sm:px-8">
        {/*
          The hero is one claim and one sentence. Four clauses in that sentence
          because there are four principles, in the order the product uses
          them, so the cards further down read as evidence for a promise
          already made rather than as four new ideas.
        */}
        <section className="min-w-0 pt-6 pb-16 sm:pt-12 sm:pb-24">
          <h1 className="max-w-[16ch] text-hero font-bold">
            Build agentic apps you can see inside.
          </h1>
          <p className="mt-6 max-w-[56ch] text-lead text-graphite">
            Every layer is visible while it runs, steerable when it goes wrong,
            yours when you leave, and reversible once it is live.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="inline-flex min-h-12 items-center rounded-pill bg-blueprint px-7 text-note font-medium text-paper"
            >
              Try the demo
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-12 items-center rounded-pill border border-ink px-7 text-note font-medium"
            >
              Sign in
            </Link>
            <span className="text-note text-graphite">
              The demo needs no account.
            </span>
          </div>
        </section>

        {/*
          One screen, the signature one, captured from this build by
          scripts/landing-still.mjs rather than drawn.

          Two files and a CSS switch rather than a <picture> media query: the
          theme here can be forced with the toggle, and a media query would
          hand a visitor on forced light a dark screenshot. Both are lazy, so
          the one the theme hides is never fetched.
        */}
        <section className="min-w-0 pb-16 sm:pb-24">
          <h2 className="max-w-[24ch] text-heading font-bold">
            When an agent answers badly, the product says why.
          </h2>
          <p className="mt-3 max-w-[64ch] text-lead text-graphite">
            The run trace in plain language: what was retrieved, what each agent
            did, the exact words the source did not support, and a fix you can
            preview before applying. This is a screenshot of that screen, not an
            illustration of it.
          </p>

          <figure className="mt-8 min-w-0">
            <div className="overflow-hidden rounded-card border border-rule shadow-soft">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-shot="light"
                src="/still/why-did-it-do-that-light.png"
                alt={'The "Why did it do that?" screen: a five step run trace, a panel showing the words the agent added that the help article did not contain, and a suggested fix.'}
                width={1280}
                height={820}
                loading="lazy"
                className="block w-full"
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                data-shot="dark"
                src="/still/why-did-it-do-that-dark.png"
                alt=""
                aria-hidden="true"
                width={1280}
                height={820}
                loading="lazy"
                className="block w-full"
              />
            </div>
            <figcaption className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-note text-graphite">
              <span>Northwind Helpline, the demo project.</span>
              <Link
                href="/demo?tab=agents&pane=canvas&why=r-104"
                className="text-blueprint underline"
              >
                Open this screen
              </Link>
            </figcaption>
          </figure>
        </section>

        <section className="min-w-0 pb-16 sm:pb-24">
          <h2 className="max-w-[24ch] text-heading font-bold">
            Four promises, and the finding behind each one
          </h2>
          <p className="mt-3 max-w-[64ch] text-lead text-graphite">
            Seven tools were given the same brief and five got far enough to
            judge. Every figure below is something that actually went wrong,
            written up with the screenshots in the repo.
          </p>

          <ul className="mt-8 grid gap-4 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <li
                key={p.name}
                className="flex min-w-0 flex-col rounded-card border border-rule bg-paper p-6 shadow-soft"
              >
                <h3 className="text-subhead font-semibold text-blueprint">
                  {p.name}
                </h3>
                <p className="mt-2 text-lead">{p.line}</p>

                <div className="mt-6 flex flex-wrap items-baseline gap-x-3 border-t border-rule pt-5">
                  <span className="font-display text-heading font-bold">
                    {p.figure}
                  </span>
                  <span className="text-note text-graphite">{p.unit}</span>
                </div>
                <p className="mt-2 max-w-[60ch] text-note text-graphite">
                  {p.evidence}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0 pb-16 sm:pb-24">
          <h2 className="max-w-[24ch] text-heading font-bold">
            How this was built
          </h2>
          <p className="mt-3 max-w-[64ch] text-lead text-graphite">
            Five tools tested hands-on and two blocked at signup, a first-hand
            build on today&rsquo;s Architect, and every decision written down with
            the evidence behind it. The research and the decision log are in the
            repo.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href={REPO}
              className="inline-flex min-h-12 items-center rounded-pill border border-ink px-7 text-note font-medium"
            >
              Read the process on GitHub
            </a>
            <Link
              href="/architecture"
              className="inline-flex min-h-12 items-center rounded-pill px-3 text-note font-medium text-blueprint underline"
            >
              See the architecture diagrams
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto w-full max-w-[1120px] px-4 py-10 sm:px-8">
          <p className="max-w-[72ch] text-note text-graphite">
            A product concept for Lyzr Architect by Abhishek Katkar. Sign-in and
            projects are real; build, agents, code and deploy flows are
            simulated.
          </p>
          <p className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-1 text-note">
            <Link href="/privacy" className="text-blueprint underline">
              Privacy
            </Link>
            <Link href="/terms" className="text-blueprint underline">
              Terms
            </Link>
            <Link href="/demo" className="text-blueprint underline">
              The demo
            </Link>
          </p>
        </div>
      </footer>
    </div>
  );
}
