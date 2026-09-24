# Build log

One entry per working session, newest date first.

**On "time spent":** the elapsed column is wall clock between commits, read from `git log`. It is not an
effort estimate. Gaps between commits may include breaks, reading, or work outside this repo. Where the
real figure is unknown, the column says so rather than guessing.

---

## 2026-09-24

Backfilled from `git log` and [07-decision-log.md](../07-decision-log.md) at the end of the day.

| Time | Work done | Elapsed | Tools | Outcome |
|---|---|---|---|---|
| 12:19 | Repo skeleton, assignment brief, voice of customer synthesis. 14 files, the numbered docs structure, and D1 to D3 | Unknown, first commit of the project | Claude Code, Perplexity (voice of customer stream, per D3) | `8e079b4`. Doc structure exists, 7 of 10 numbered docs still stubs |
| 13:03 | Read every doc, identified what blocks design. Created `docs/design/` with three stubs, stripped the three unverified figures from the voice of customer doc, set the README status table | 44 min | Claude Code | `92e353a`. D4 and D5 logged. No unverified numbers left in the docs |
| 13:33 | Desk research on docs.architect.new, written up as the four layer pipeline (Plan, Agents, App, Deploy), the baseline 2.0 must keep, and nine gaps | 30 min | Claude Code, docs.architect.new | `f09e0d2`. D6 logged: "Architect 2.0" is the next product generation, not a version number. GroundTruth first-hand notes still pending |
| 17:55 | Next.js and Supabase auth scaffold. Next 16.3.6, App Router, Tailwind v4, React 19. Supabase browser and server clients, Google sign-in, callback, signout, and the route guard | 4 h 22 min | Claude Code, create-next-app, npm, git | `4a10327`. Build passes, `tsc --noEmit` clean, ESLint clean. Caught `next dev` appending an em dash block to `CLAUDE.md` and disabled it |
| 18:11 | Architecture stack section, decision log D7 to D10, README honesty pass. Ran the route guard check on a free port | 16 min | Claude Code, curl | `e9299e6`. Signed out, `/app` returns 307 to `/login?next=%2Fapp` at any depth. Auth reported as implemented but unverified against a live project |
| 18:18 | Built the portfolio capture system: this build log, the metrics table, and the assets checklist. Added the CLAUDE.md rule that keeps them current | 7 min | Claude Code, git | Backfilled the day from git. Caught the stub count grep matching the metrics row that documented it, and anchored the pattern |
| 18:24 | Removed the commit hashes that these two files used to quote for themselves | 6 min | Claude Code, git | An amend had already invalidated one. Entries now reference work, not hashes |

**Day total:** 6 h 5 min wall clock across 7 commits, 12:19 to 18:24.

**Ended the day blocked on:** competitive teardown notes for [01](../01-competitive-teardown.md), GroundTruth
first-hand notes for [03](../03-architect-today.md), and Supabase credentials to verify a real sign-in.
Personas and strategy deliberately not started, because they depend on the teardown.
