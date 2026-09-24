# Instructions for Claude Code

## Context
This repo is a hiring assignment for a Technical Product Manager role at Lyzr AI.
Task: design and ship "Architect 2.0", a vibe-coding platform for building agentic apps,
serving BOTH non-technical users (today's Architect audience) and developers (new audience).

Judging criteria, in order of importance:
1. Design, UI/UX and flows (most important). First-principles, do NOT copy current Architect or any competitor.
2. Feature coverage: auth, homepage, chat, app preview, agent section, UI being built, GitHub, deploy, plus more.
3. Working functionality (plus points): Supabase auth (Google) and database.

Dummy flows are acceptable for everything else, but they must look and feel real.

## Rules
- Never use em dashes or en dashes anywhere (code comments, copy, docs). Use commas, colons, or periods.
- The docs/ folder is part of the deliverable. Keep it accurate and in sync with the product.
- When a meaningful product or technical decision is made, append an entry to docs/07-decision-log.md
  using the existing format (date, decision, evidence, alternatives rejected).
- Never claim a simulated feature is functional. Update the "functional vs simulated" table in README.md.
- Commit small and often with clear messages, prefixed: research:, spec:, design:, feat:, fix:, docs:.
- Research docs contain synthesized insights in our own words. Never paste raw third-party text.
- At the end of every task, append an entry to docs/journal/build-log.md (date, work done, time spent,
  tools used, outcome). If any number in docs/portfolio/metrics.md changed, update it in the same commit.
  Metrics are measured facts with a source. Never estimate a number to fill a row, leave it pending.

## Stack
Next.js (App Router, TypeScript), Tailwind, Supabase (auth + Postgres), deployed on Vercel.
