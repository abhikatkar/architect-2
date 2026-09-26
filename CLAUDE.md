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
- Dates in docs, decision log entries and page copy come from the system clock, never from memory or
  inference: run `TZ=Asia/Kolkata date +%F` and use that. Thirteen decision log entries and two legal pages
  were dated a day ahead because the date was guessed, and correcting them broke three anchors, because a
  decision log anchor contains the entry's date.
- Before every commit run both checks, and do not commit on a failure:
  scripts/consistency-check.mjs over the fixtures, and scripts/rendered-check.mjs against a running build.
  Both import the fixtures, so both run under `node --experimental-strip-types`.
  The rendered check exists because two review rounds reported the same bug as "still broken" after it was
  marked fixed: reading the source passed, the served page did not. Assert against the page, not the code.
  Run scripts/link-check.mjs too whenever a heading or a link changes: it validates every relative path and
  every anchor in docs/ and the README against the headings that actually exist.
  Run scripts/focus-check.mjs whenever a sheet or its trigger changes: focus and key handling are not in the
  HTML, so only a browser can answer where focus went, and a decision log entry claimed the wrong answer for
  a full slice.
- A number shown on more than one surface is computed once per request and passed down. Never let two
  components derive the same fact from the URL: that is what D57 exists to prevent, and a page contradicting
  its own footer is the bug it produced.

## Stack
Next.js (App Router, TypeScript), Tailwind, Supabase (auth + Postgres), deployed on Vercel.
