# Metrics

Hard numbers for the portfolio write-up and the interview. Every row carries the command or document it
came from, so any of them can be re-derived.

**Rule for this file:** measured facts only. No estimates, no projections, no rounded guesses. A number
that cannot be sourced belongs in [Pending](#pending) until it can be.

_As of 2026-09-24, end of day._

Counts are read after the commit that last touched this file. A row must never name the commit that
carries it, because amending or rebasing changes that hash and silently makes the row a lie.

## Process

| Metric | Value | Source |
|---|---|---|
| Commits | 7 | `git rev-list --count HEAD` |
| First commit | 2026-09-24 12:19:20 | `git log --reverse` |
| Latest commit | 2026-09-24 18:24 | `git log -1` |
| Wall clock, first to last commit | 6 h 5 min | Difference of the two rows above. Wall clock, not effort |
| Calendar days elapsed | 1 | Same |
| Decision log entries | 10 | `grep -c '^### D' docs/07-decision-log.md` |
| Tracked files | 47 | `git ls-files \| wc -l` |
| Tracked files under docs/ | 18 | `git ls-files 'docs/*' \| wc -l` |
| Docs still stubs | 8 | `git ls-files 'docs/*.md' 'docs/*/*.md' \| xargs grep -l '^_Pending'` |

## Product

| Metric | Value | Source |
|---|---|---|
| Pages built | 3 | `/`, `/login`, `/app`. `git ls-files 'app/*' \| grep page.tsx` |
| Route handlers built | 2 | `/auth/callback`, `/auth/signout`. Same command, `route.ts` |
| Production dependencies | 5 | `package.json`. next, react, react-dom, @supabase/ssr, @supabase/supabase-js |
| Next.js version | 16.3.6 | `package.json` |
| Build status | Passing | `npm run build`, plus `tsc --noEmit` and ESLint clean |

## Verified behaviour

Route guard, signed out, no Supabase credentials configured. Measured against a local dev server on a
free port, 2026-09-24.

| Request | Status | Location |
|---|---|---|
| `GET /` | 200 | |
| `GET /login` | 200 | |
| `GET /app` | 307 | `/login?next=%2Fapp` |
| `GET /app/settings` | 307 | `/login?next=%2Fapp%2Fsettings` |
| `GET /app/deep/nested` | 307 | `/login?next=%2Fapp%2Fdeep%2Fnested` |
| `POST /auth/signout` | 303 | `/` |

This exercises the fail-closed branch only. The authenticated branch is untested, because it needs a live
Supabase project.

## Pending

Numbers that do not exist yet. Listed so they are not silently forgotten, and left empty rather than
guessed.

| Metric | Blocked on |
|---|---|
| Teardown: time from first prompt to live preview, per tool | Hands-on teardown notes into [01-competitive-teardown.md](../01-competitive-teardown.md) |
| Teardown: credit or dollar cost per test app, per tool | Same |
| Teardown: tools tested | Same |
| Architect: real time from first prompt to live preview | GroundTruth first-hand session, pending in [03-architect-today.md](../03-architect-today.md) |
| Architect: credit breakdown for one build | Same |
| Screens in the finished product | Design phase, [design/screen-inventory.md](../design/screen-inventory.md) |
| Days to ship | Not shipped yet. First deploy sets this |
| Real Google sign-in verified | A live Supabase project with the Google provider configured |
| Walkthrough length | Loom not recorded. See [assets/README.md](assets/README.md) |
