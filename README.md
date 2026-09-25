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
9. **[Architecture](docs/08-architecture.md):** my stack and how it maps to Lyzr's backend
10. **[Roadmap and metrics](docs/09-roadmap-and-metrics.md)**
11. **[Design](docs/design/):** the [design system](docs/design/design-system.md), the [screen inventory](docs/design/screen-inventory.md), and the [seed content](docs/design/content-and-seed-data.md) behind the build
12. **[Build log](docs/journal/build-log.md):** what was done each day, and how long it took
13. **[Metrics](docs/portfolio/metrics.md):** the hard numbers, each with the command that produced it

## What is functional vs simulated

| Area | Status |
|---|---|
| Authentication | **Functional.** Google sign-in via Supabase, verified end to end on the production deployment: sign in, `/app` shows the signed-in email, sign out, and `/app` then redirects to `/login?next=/app` |
| Database | **Functional.** `projects` and `profiles` tables in Supabase, each with row level security and four policies scoping every row to its owner. Verified with two real users on both tables: each sees only their own row, and cross-user updates and deletes affect 0 rows. Projects round-trip end to end, and the onboarding depth preference visibly changes the workspace. Results in [D26](docs/07-decision-log.md) and [D35](docs/07-decision-log.md) |
| Jev decision model | **Wired and guarded, but the model has never answered.** The three decision agents (Intake, Grounding Checker, Escalation Router) call [Jev](https://vercel.com/ai-gateway/models/jev) through Vercel AI Gateway. The key is live on the deployment and requests do reach the Gateway, which refuses them: "AI Gateway requires a valid credit card on file to service requests." So 0 decisions have been returned in 3 attempts, and this is **not** called functional. What *is* proven: the rate limit, the daily cap, the call log written as `anon` through a definer function, and a failure path that shows the real provider error instead of a fabricated result. Detail and the unproven items in [early-adoption-jev.md](docs/portfolio/early-adoption-jev.md) |
| Everything else | Simulated |

## Stack

Next.js, Supabase (auth + Postgres), Vercel. Rationale in [docs/08-architecture.md](docs/08-architecture.md).
