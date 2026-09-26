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
| 13:08 | Added the design system doc. Built the token foundation: 8 colours in both themes, Instrument Sans and JetBrains Mono, the type scale, radius and spacing, plus a `/dev/tokens` review page | 1 h 32 min | Claude Code, Chrome over CDP | Verified at 375, 768, 1280 and 1920 px with overflow 0 at every width. Nearly "fixed" a responsive bug that did not exist: headless screenshots without device metrics crop a wide layout and look broken. Wrote [scripts/responsive-check.mjs](../../scripts/responsive-check.mjs) so the check is measured, not eyeballed |
| 14:02 | Added the user flows doc and the seed content doc. Planned the P0 build as 6 vertical slices | 54 min | Claude Code | The last two specification stubs are closed. Slice order set to 1, 3, 4, 2, 5, 6: thesis screens before the front door, since the guest demo already gives reviewers a way in. Corrected the P0 count in metrics from 13 to 15 |

| 15:40 | Slice 1: seed fixtures, the projects table with RLS, the workspace shell, the guest demo, and Home | 1 h 38 min | Claude Code, Supabase MCP, Chrome over CDP | /demo verified at all four widths with overflow 0. Caught an invented number before it shipped: the plan panel derived "25 help articles" from a multiplication, the real figure is 24. Signed-in verification is blocked on two dashboard test users |

| 16:24 | Finished slice 1 verification: signed-in Home at 4 widths in both themes, the create-project round trip, and the RLS proof with two real users | 44 min | Claude Code, Chrome over CDP, Supabase MCP | Database flipped to functional. Cross-user update and delete both affected 0 rows. Caught a test that could not fail: the first isolation check grepped for text every Home contains |

| 17:30 | Slice 3: plan review, build in progress with the failure path, and the app preview. Demo parity so none of it needs an account | 1 h 6 min | Claude Code, Chrome over CDP, Supabase MCP | 32 of 32 responsive checks pass. The no-JS build screen renders the finished build with zero occurrences of the spinner state. Two screenshots nearly misled me again: the failure capture landed at 2.5s, before the failure at 21s, so responsive-check gained a --wait option |

| 19:05 | Slice 4: the agent canvas on the blueprint grid, the inspector with depth on demand, and "Why did it do that?" | 1 h 35 min | Claude Code, Chrome over CDP | 40 of 40 responsive checks pass. Three crude checks produced misleading results in a row: Tailwind class names read as parameter values, Next's RSC payload read as a leak, and React's text-node comments broke every grep for interpolated copy. Rewrote the check to measure visible text |

**Day total:** 9 h 43 min across 27 commits.

---

## 2026-09-26

| Time | Work done | Elapsed | Tools | Outcome |
|---|---|---|---|---|
| 10:40 | Slice 2, the front door: landing, sign in restyled, onboarding with a profiles table, and error pages | 1 h 35 min | Claude Code, Chrome over CDP, Supabase MCP | 32 of 32 responsive checks pass. The depth preference is proven functional, not just stored. Caught the landing page claiming "seven tools tested hands-on" when only five completed the brief, the same inaccuracy corrected in the docs two days ago |

| 14:20 | Fix pass from the cold review: derived totals with a consistency check, build rail state bugs, demo navigation, phone tabs, a theme toggle and four rewritten lines | 3 h 40 min | Claude Code, Chrome over CDP | 15 invariants now gate every commit, written before the fixes and shown failing first. The check immediately caught a defect I had just introduced. Also caught myself verifying against a stale server that had failed to bind |

| 16:05 | Slice 4.5: Jev as the decision model for the three decision agents. Read the AI SDK and Vercel docs first, built the helper, the guardrails and the inspector split | 2 h 30 min | Claude Code, web research, Supabase MCP, Vercel MCP | Could not create the gateway key: the Vercel MCP connection is not authorised for the team scope, so live verification is pending. Everything else is built and the security posture is proven: anon can insert through a definer function but cannot read the table |

| 19:10 | Live verification attempt with the key on the deployment. Proved both guardrails, recorded the launch dates, chased the two build warnings | 1 h 10 min | Claude Code, Supabase MCP, curl against production | **The model still has not answered.** A third real call returned the same Gateway refusal: a credit card is required. Proved the rate limit and the daily cap instead, by moving the counter rather than faking a trigger, then deleted all 310 synthetic rows. Found only one of the two build warnings reproducible: a faithful `npm ci` plus `next build` from the committed tree gives exactly one |

| 21:05 | Jev live at last: captured real results for all three agents, measured latency, tokens and cost, verified the UI end to end and flipped it to Functional | 1 h 05 min | Claude Code, curl against a local production server, Supabase MCP | 22 live calls, median 430 ms, $0.000017 per call. The 401 turned out to be both `.env.local` values pasted wrapped in angle brackets. Confirmed the boolean returns no confidence by observation rather than from the docs. Caught a real copy defect while reading the rendered HTML: "Confidence 42% . Jev was not decided", a space before the period |

| 22:20 | Three generated diagrams: system architecture with source links and trust boundaries, the agent workflow, and the Jev call sequence | 1 h 20 min | Claude Code, archify | 23 source links verified against the pinned commit. Caught two things only by opening the delivered images: the Real and Simulated markings were in a field that does not render, and the first workflow was too tall to contain at 1440x900 |

| 23:05 | Fixed the stale model names in the agent config files, published the measured Jev numbers, retested the deployment | 35 min | Claude Code, curl against production | The three decision agents no longer claim to run on a language model. The deployment still rejects its key after a second re-entry, and the retest nearly fooled me: with recorded.ts now populated, a failed call returns real answers, so the outcome field is the only thing that tells the truth |

| 02:10 | Fix pass 2 from the round 2 review: the Grounding Checker contradiction, signed results, nine demo fixes, and the diagrams | 4 h 15 min | Claude Code, Chrome over CDP, Supabase MCP, archify | The contradiction was our criteria, not the model: 0.71 to 0.14 on the same input once the question named timing words. Added a rendered-page check after finding the App preview default had been "fixed" twice while a dead function did nothing. Reproduced the diagram toolbar overlap at 1491x812 and recorded the trade rather than taking the labels back down |

| 05:20 | Verified the signed results on production once JEV_RESULT_SECRET was set | 20 min | Claude Code, curl against production, Supabase MCP | All 3 agents live and signed. Four tamper cases on production all read "Unverified result". The run tripped our own rate limit half way through, which is the guardrail working on a real visitor rather than on a test fixture |

| 06:40 | Polish pass 3: the grounding bar corrected against six labeled drafts, four demo bugs, an instant theme toggle, and the diagrams brought back in sync | 3 h 20 min | Claude Code, Chrome over CDP, archify | The second worked example did its job immediately: a faithful draft scored 0.82 and our own 0.90 bar rejected it, so the bar was wrong, not the model. Six labeled drafts now hold it in place. Theme switch measured at 12 ms against the 4 to 6 seconds the review saw |

| 09:15 | Slice 5, the Code tab: file tree, read-only file view, diffs grouped by request, accept and revert in the address, terminal, logs and checks | 3 h 50 min | Claude Code, Chrome over CDP | Found a bug in existing code first: tab links were hand built and dropped every carried parameter, so clicking any tab silently reverted an applied fix. Proved it, fixed it, asserted it. The phone layout put 42 file rows above the thing you came to review until CSS order moved them |

**Day total so far:** 23 h 40 min across 12 commits.

**Note on the teardown:** the test itself ran 12:06 to 13:04 IST, before this repo's build sessions. The
38 minutes above covers only the write-up, not the hour of testing.

**Ended the day blocked on:** competitive teardown notes for [01](../01-competitive-teardown.md), GroundTruth
first-hand notes for [03](../03-architect-today.md), and Supabase credentials to verify a real sign-in.
Personas and strategy deliberately not started, because they depend on the teardown.
