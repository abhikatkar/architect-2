import Link from "next/link";
import type { Metadata } from "next";
import { ThemeToggle } from "@/components/theme-toggle";
import { currentTheme } from "@/lib/theme";

export const metadata: Metadata = {
  title: "Architect 2.0",
  description:
    "The agentic app builder where every layer is visible, steerable and yours.",
};

const REPO = "https://github.com/abhikatkar/architect-2";

/**
 * Each principle carries one measured finding rather than an adjective. Every
 * figure here is traceable to docs/01-competitive-teardown.md, which is what
 * separates this page from marketing copy.
 */
const PRINCIPLES = [
  {
    name: "See it",
    line: "Know what is happening and what it will cost, before it runs.",
    evidence:
      "Tested: one build ran 42 min behind a label reading \"usually 4 to 6 min\", and cost $3.33 with no estimate shown beforehand.",
  },
  {
    name: "Steer it",
    line: "Open any layer and fix what it did, at whatever depth suits you.",
    evidence:
      "Tested: diagnosing one misbehaving agent took about 8 technical steps, and the fix had to be made in a different product.",
  },
  {
    name: "Own it",
    line: "Your code and your agents stay yours, and nothing moves without asking.",
    evidence:
      "Tested: a GitHub repo was created and set to sync automatically without ever pressing Push.",
  },
  {
    name: "Ship it safely",
    line: "Going live never surprises you, and everything is reversible.",
    evidence:
      "Tested: publishing to the marketplace defaults to on, and strangers using the app spend the owner's credits.",
  },
];

export default async function LandingPage() {
  const theme = await currentTheme();

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <main className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-1 flex-col gap-10 px-4 py-12 sm:px-6 sm:py-16">
        <header className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-mono text-caption text-graphite">Architect 2.0</p>
            <span className="ml-auto">
              <ThemeToggle current={theme} next="/" />
            </span>
          </div>
          <h1 className="mt-3 max-w-[20ch] text-display font-semibold">
            Build agentic apps you can actually see inside.
          </h1>
          <p className="mt-4 max-w-[72ch] text-lead text-graphite">
            Prompt-to-app builders win the first demo and lose your trust after
            it. Coding agents earn trust but leave you to wire up the stack.
            Architect 2.0 is the builder where every layer is visible, steerable
            and yours.
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/demo"
              className="inline-flex min-h-11 items-center rounded-input bg-blueprint px-5 text-lead text-paper"
            >
              Try the demo
            </Link>
            <Link
              href="/login"
              className="inline-flex min-h-11 items-center rounded-input border border-rule px-5 text-lead"
            >
              Sign in
            </Link>
            <span className="text-caption text-graphite">
              The demo needs no account.
            </span>
          </div>
        </header>

        <section className="min-w-0">
          <h2 className="text-title font-semibold">Four promises, and why each one exists</h2>
          <p className="mt-1 max-w-[72ch] text-small text-graphite">
            Seven tools were given the same brief and five got far enough to
            judge. Every line below answers something that actually went wrong.
          </p>

          <ul className="mt-4 grid gap-3 md:grid-cols-2">
            {PRINCIPLES.map((p) => (
              <li
                key={p.name}
                className="flex min-w-0 flex-col gap-1 rounded-panel border border-rule p-4"
              >
                <span className="text-lead font-semibold text-blueprint">{p.name}</span>
                <span className="text-body">{p.line}</span>
                <span className="text-small text-graphite">{p.evidence}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="min-w-0">
          <h2 className="text-title font-semibold">How this was built</h2>
          <p className="mt-1 max-w-[72ch] text-body text-graphite">
            Five tools tested hands-on and two blocked at signup, a first-hand
            build on today&rsquo;s Architect, and every decision written down with
            the evidence behind it. The research and the decision log are in the
            repo.
          </p>
          <a
            href={REPO}
            className="mt-3 inline-flex min-h-11 items-center rounded-input border border-rule px-4 text-body text-blueprint"
          >
            Read the process on GitHub
          </a>
        </section>
      </main>

      <footer className="border-t border-rule">
        <div className="mx-auto w-full max-w-[1100px] px-4 py-6 sm:px-6">
          <p className="max-w-[72ch] text-caption text-graphite">
            A product concept for Lyzr Architect by Abhishek Katkar. Sign-in and
            projects are real; build, agents, code and deploy flows are
            simulated.
          </p>
        </div>
      </footer>
    </div>
  );
}
