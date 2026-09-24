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
| 19:02 | Wrote up the hands-on teardown. Matched 161 raw screenshots to the session log by Unix timestamp, reviewed the candidates, published 15, and rewrote [01](../01-competitive-teardown.md) from the log | 38 min | Claude Code, Chrome (teardown session run earlier by Abhishek), Python and Pillow for crop checks | Teardown numbers moved from pending to confirmed in [metrics](../portfolio/metrics.md). D11 logged: stop at 5 tools. 12 screenshots withheld for privacy, including both of Architect's best features |

| 19:41 | Recovered the two moat screenshots by redaction instead of exclusion, and corrected the tool count everywhere | 39 min | Claude Code, Python and Pillow | Import and per-commit revert now have published evidence. D12 logged: crop or blur only, never retouch the UI. "7 tools" is now "5 tested, 2 blocked at signup" |

**Day total:** 7 h 22 min wall clock across 9 commits, 12:19 to 19:41.

---

## 2026-09-25

| Time | Work done | Elapsed | Tools | Outcome |
|---|---|---|---|---|
| 10:14 | Added personas ([04](../04-personas-and-jtbd.md)) and strategy ([05](../05-product-strategy.md)) unchanged. Redacted and published 11 of 14 "before" captures, added three findings to [03](../03-architect-today.md), logged D13 to D15 | 52 min | Claude Code, Python and Pillow | Strategy is committed: "See it. Steer it. Own it. Ship it safely." Found and fixed a live privacy leak: the raw teardown log had been carrying two account usernames in plain text since it was pushed |

| 11:36 | Added the GroundTruth friction note and the screen inventory. Fixed the first-click auth bug, flipped auth to functional, logged D16 to D19 | 1 h 22 min | Claude Code, curl, Next dev server | Sign in is now a server-handled form post, verified working with no JavaScript executed. Doc 03's last pending section is closed. 23 screens tiered P0 to P2 |

**Day total so far:** 2 h 14 min across 5 commits.

**Note on the teardown:** the test itself ran 12:06 to 13:04 IST, before this repo's build sessions. The
38 minutes above covers only the write-up, not the hour of testing.

**Ended the day blocked on:** competitive teardown notes for [01](../01-competitive-teardown.md), GroundTruth
first-hand notes for [03](../03-architect-today.md), and Supabase credentials to verify a real sign-in.
Personas and strategy deliberately not started, because they depend on the teardown.
