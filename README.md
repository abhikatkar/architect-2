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
2. **[Competitive teardown](docs/01-competitive-teardown.md):** 7 tools tested hands-on with the same test app
3. **[Voice of customer](docs/02-voice-of-customer.md):** what users praise and why they churn
4. **[Architect today](docs/03-architect-today.md):** current flows, gaps, and my own friction as a user
5. **[Personas and JTBD](docs/04-personas-and-jtbd.md)**
6. **[Product strategy](docs/05-product-strategy.md):** thesis, positioning, and what I cut
7. **[User flows](docs/06-user-flows.md)**
8. **[Decision log](docs/07-decision-log.md):** every major decision, dated, with the evidence behind it
9. **[Architecture](docs/08-architecture.md):** my stack and how it maps to Lyzr's backend
10. **[Roadmap and metrics](docs/09-roadmap-and-metrics.md)**
11. **[Design](docs/design/):** the [design system](docs/design/design-system.md), the [screen inventory](docs/design/screen-inventory.md), and the [seed content](docs/design/content-and-seed-data.md) behind the build

## What is functional vs simulated

| Area | Status |
|---|---|
| Authentication | Google sign-in implemented via Supabase. The signed-out route guard is verified locally. A real sign-in has not been tested yet, because it needs a live Supabase project |
| Database | Planned (Supabase). Nothing built yet |
| Everything else | Simulated |

## Stack

Next.js, Supabase (auth + Postgres), Vercel. Rationale in [docs/08-architecture.md](docs/08-architecture.md).
