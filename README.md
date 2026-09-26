# Architect 2.0

A vibe-coding platform for building end-to-end agentic applications, designed for both non-technical builders and developers.

Built as a submission for the Technical Product Manager role at Lyzr AI (Architect).

| | |
|---|---|
| Live app | _coming soon_ |
| Walkthrough (2 min) | _coming soon_ |
| Start reading | [docs/00-assignment-brief.md](docs/00-assignment-brief.md) |

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
9. **[Architecture](docs/08-architecture.md):** my stack, how it maps to Lyzr's backend, and three interactive diagrams: [system architecture](public/architecture/architecture.html) with every node marked Real or Simulated and linked to its source, the [agent workflow](public/architecture/agent-workflow.html), and the [Jev call sequence](public/architecture/jev-call-sequence.html)
10. **[Roadmap and metrics](docs/09-roadmap-and-metrics.md)**
11. **[Design](docs/design/):** the [design system](docs/design/design-system.md), the [screen inventory](docs/design/screen-inventory.md), and the [seed content](docs/design/content-and-seed-data.md) behind the build
12. **[Build log](docs/journal/build-log.md):** what was done each day, and how long it took
13. **[Metrics](docs/portfolio/metrics.md):** the hard numbers, each with the command that produced it

## What is functional vs simulated

| Area | Status |
|---|---|
| Authentication | **Functional.** Google sign-in via Supabase, verified end to end on the production deployment: sign in, `/app` shows the signed-in email, sign out, and `/app` then redirects to `/login?next=/app` |
| Database | **Functional.** `projects` and `profiles` tables in Supabase, each with row level security and four policies scoping every row to its owner. Verified with two real users on both tables: each sees only their own row, and cross-user updates and deletes affect 0 rows. Projects round-trip end to end, and the onboarding depth preference visibly changes the workspace. Results in [D26](docs/07-decision-log.md) and [D35](docs/07-decision-log.md) |
| Jev decision model | **Functional.** The three decision agents (Intake, Grounding Checker, Escalation Router) make real calls to [Jev](https://vercel.com/ai-gateway/models/jev), TypeSafe AI's decision model, through Vercel AI Gateway. Verified on the production deployment on 2026-09-26: all three returned `outcome: live` with a valid signature and rendered "Live result", at 368 ms, 463 ms and 192 ms. Median 556 ms and about $0.0000179 per call, measured by `scripts/jev-latency.mjs` and reproducible. Confirmed against real responses rather than the docs: a boolean returns no confidence, and the low confidence path fires on ordinary input. The result carried in the URL is **HMAC signed**, so an edited address renders as "Unverified result" and never as live ([D44](docs/07-decision-log.md)). A grounding answer ships only at **60%** confidence, a bar set from 6 drafts labeled by hand before they were run, not from one example ([D46](docs/07-decision-log.md), which corrects [D43](docs/07-decision-log.md)). Rate limit, daily cap and the call log are proven separately, and the rate limit was observed firing on the deployment during this verification rather than only in a test. Detail in [early-adoption-jev.md](docs/portfolio/early-adoption-jev.md) and [metrics.md](docs/portfolio/metrics.md) |
| Everything else | **Simulated.** All 15 P0 screens are built, including the GitHub consent sheet, repo import with its compatibility report, and deploy with promote, rollback, domain, publish and access. Nothing behind them writes anywhere: no repository is created, no domain verified, no invite sent and nothing deployed. Every confirm says so next to itself, and a rendered check fails the build if any of those screens claims something happened before its confirm ([D52](docs/07-decision-log.md)) |

## Stack

Next.js, Supabase (auth + Postgres), Vercel. Rationale in [docs/08-architecture.md](docs/08-architecture.md).
