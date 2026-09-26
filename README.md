# Architect 2.0

A vibe-coding platform for building end-to-end agentic applications, designed for both non-technical builders and developers.

Built as a submission for the Technical Product Manager role at Lyzr AI (Architect).

| | |
|---|---|
| Live demo, no account needed | [architect-2-zeta.vercel.app/demo](https://architect-2-zeta.vercel.app/demo) |
| Diagrams | [/architecture](https://architect-2-zeta.vercel.app/architecture) |
| Start reading | [docs/00-assignment-brief.md](docs/00-assignment-brief.md) |

## How to review this in 5 minutes

If you only have a few minutes, these five in order:

1. **[Open the demo](https://architect-2-zeta.vercel.app/demo).** A finished project, open without an
   account. The banner across the top is a guided tour of the screens worth seeing.
2. **[Why did it do that?](https://architect-2-zeta.vercel.app/demo?tab=agents&why=r-104&pane=canvas)** The
   screen the whole thesis rests on: an agent misbehaved, here is the trace, here is the exact phrase that
   was not in the source, here is the fix and what it costs.
3. **Run a real agent.** On the Agents tab, open the Grounding Checker and press Run this agent. That is a
   live call to a decision model, not a simulation: **median 453 ms over 27 live calls on 2026-09-26**, range
   189 to 733 ms, and about $0.0000179 a call. The result is signed, so an edited address cannot pass a fake
   result off as live. That figure is every live call the app has made, read from the `jev_calls` table it
   writes to, not a best run.
4. **[The Code tab](https://architect-2-zeta.vercel.app/demo?tab=code&pane=canvas&diff=d6).** Diffs grouped
   by the request that caused them, accept or revert per file, and one real commit from this repository
   sitting beside the simulated ones.
5. **[The decision log](docs/07-decision-log.md).** Every decision with its evidence and what was rejected.
   If you read one document, read [D46](docs/07-decision-log.md): a bar I derived from a tidy argument was
   wrong, and six real calls proved it.

**What is real:** Google sign-in, per-user projects in Postgres with row level security, and three agents
making live calls to a decision model. Everything else is simulated and labeled, screen by screen, in the
table below.

**If you sign in:** Google's consent screen shows the Supabase project domain rather than "Architect 2.0",
because brand verification is optional for a concept like this one and was not requested. The app asks for
nothing beyond the default name, email and picture, and [what it stores is listed in full](app/privacy/page.tsx)
at [/privacy](https://architect-2-zeta.vercel.app/privacy).

**How honest it is, mechanically:** 58 invariants over the fixtures and 97 assertions against served HTML
gate every commit. They exist because four review rounds caught contradictions that reading the code had
missed. The newest of them reads every number on a page and fails unless all of its surfaces agree with each
other, which is the one check that was missing when the fourth round found a screen contradicting its own
footer.

## How to read this repo

This repo documents the full zero-to-one process, not just the code.

1. **[Assignment brief](docs/00-assignment-brief.md):** how I read the ask and the judging criteria
2. **[Competitive teardown](docs/01-competitive-teardown.md):** 5 tools tested hands-on with one identical prompt, 2 blocked at signup
3. **[Voice of customer](docs/02-voice-of-customer.md):** what users praise and why they churn
4. **[Architect today](docs/03-architect-today.md):** current flows, gaps, and my own friction as a user
5. **[Personas and JTBD](docs/04-personas-and-jtbd.md)**
6. **[Product strategy](docs/05-product-strategy.md):** thesis, positioning, and what I cut
7. **[User flows](docs/06-user-flows.md)**
8. **[Decision log](docs/07-decision-log.md):** every major decision, dated, with the evidence behind it
9. **[Architecture](docs/08-architecture.md):** my stack, how it maps to Lyzr's backend, and three interactive diagrams, each on a page that links back to the demo: [system architecture](https://architect-2-zeta.vercel.app/architecture/architecture) with every node marked Real or Simulated and linked to its source, the [agent workflow](https://architect-2-zeta.vercel.app/architecture/agent-workflow), and the [Jev call sequence](https://architect-2-zeta.vercel.app/architecture/jev-call-sequence). The generated files themselves are in [public/architecture/](public/architecture/)
10. **[Design](docs/design/):** the [design system](docs/design/design-system.md), the [screen inventory](docs/design/screen-inventory.md), and the [seed content](docs/design/content-and-seed-data.md) behind the build
11. **[Build log](docs/journal/build-log.md):** what was done each day, and how long it took
12. **[Roadmap and metrics](docs/09-roadmap-and-metrics.md):** the north star metric, one input metric per principle, and what comes next
13. **[Measured numbers](docs/portfolio/metrics.md):** every hard number, each with the command that produced it
14. **[Early adoption write-up](docs/portfolio/early-adoption-jev.md):** the decision model, what it cost, and the bar that was wrong

## What is functional vs simulated

| Area | Status |
|---|---|
| Authentication | **Functional.** Google sign-in via Supabase, verified end to end on the production deployment: sign in, `/app` shows the signed-in email, sign out, and `/app` then redirects to `/login?next=/app` |
| Database | **Functional.** `projects` and `profiles` tables in Supabase, each with row level security and four policies scoping every row to its owner. Verified with two real users on both tables: each sees only their own row, and cross-user updates and deletes affect 0 rows. Projects round-trip end to end, and the onboarding depth preference visibly changes the workspace. Results in [D26](docs/07-decision-log.md) and [D35](docs/07-decision-log.md) |
| Jev decision model | **Functional.** The three decision agents (Intake, Grounding Checker, Escalation Router) make real calls to [Jev](https://vercel.com/ai-gateway/models/jev), TypeSafe AI's decision model, through Vercel AI Gateway. Verified on the production deployment on 2026-09-26: all three returned `outcome: live` with a valid signature and rendered "Live result". **Median 453 ms over the 27 live calls in the `jev_calls` table, range 189 to 733 ms, all on 2026-09-26**, and about $0.0000179 per call. One figure from every call the app has logged, rather than a figure per run: three earlier numbers in this README disagreed with each other because each came from a different sample. Confirmed against real responses rather than the docs: a boolean returns no confidence, and the low confidence path fires on ordinary input. The result carried in the URL is **HMAC signed**, so an edited address renders as "Unverified result" and never as live ([D44](docs/07-decision-log.md)). A grounding answer ships only at **60%** confidence, a bar set from 6 drafts labeled by hand before they were run, not from one example ([D46](docs/07-decision-log.md), which corrects [D43](docs/07-decision-log.md)). Rate limit, daily cap and the call log are proven separately, and the rate limit was observed firing on the deployment during this verification rather than only in a test. Detail in [early-adoption-jev.md](docs/portfolio/early-adoption-jev.md) and [metrics.md](docs/portfolio/metrics.md) |
| Everything else | **Simulated.** All 15 P0 screens are built, including the GitHub consent sheet, repo import with its compatibility report, and deploy with promote, rollback, domain, publish and access. Nothing behind them writes anywhere: no repository is created, no domain verified, no invite sent and nothing deployed. Every confirm says so next to itself, and a rendered check fails the build if any of those screens claims something happened before its confirm ([D52](docs/07-decision-log.md)) |

## Stack

Next.js, Supabase (auth + Postgres), Vercel. Rationale in [docs/08-architecture.md](docs/08-architecture.md).
