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
| Commits | 8 | `git rev-list --count HEAD` |
| First commit | 2026-09-24 12:19:20 | `git log --reverse` |
| Latest commit | 2026-09-24 19:02 | `git log -1` |
| Wall clock, first to last commit | 6 h 43 min | Difference of the two rows above. Wall clock, not effort |
| Calendar days elapsed | 1 | Same |
| Decision log entries | 11 | `grep -c '^### D' docs/07-decision-log.md` |
| Tracked files | 63 | `git ls-files \| wc -l` |
| Tracked files under docs/ | 34 | `git ls-files 'docs/*' \| wc -l` |
| Docs still stubs | 7 | `git ls-files 'docs/*.md' 'docs/*/*.md' \| xargs grep -l '^_Pending'` |

## Product

| Metric | Value | Source |
|---|---|---|
| Pages built | 3 | `/`, `/login`, `/app`. `git ls-files 'app/*' \| grep page.tsx` |
| Route handlers built | 2 | `/auth/callback`, `/auth/signout`. Same command, `route.ts` |
| Production dependencies | 5 | `package.json`. next, react, react-dom, @supabase/ssr, @supabase/supabase-js |
| Next.js version | 16.3.6 | `package.json` |
| Build status | Passing | `npm run build`, plus `tsc --noEmit` and ESLint clean |

## Teardown

Measured in one session on 2026-09-24, free tiers, one identical prompt. Source for every row:
[01-competitive-teardown.md](../01-competitive-teardown.md), backed by the timestamped log in
[research/teardown-log.md](../research/teardown-log.md). Single run, so these are observations, not averages.

| Metric | Value |
|---|---|
| Tools tested end to end | 5 of 7. Bolt and Rocket blocked at signup, see [D11](../07-decision-log.md) |
| Architect: prompt to working preview | 42 min |
| Architect: build cost | $2.90, plus $0.43 auto-fix, $3.33 total |
| Architect: share of balance consumed by one build | about 45% of $7.33 |
| Architect: stated build estimate versus actual | "usually 4 to 6 min" against about 35 min of build |
| Architect: repo import | 5 clicks, about 45 s, private repos, branch and monorepo subfolder |
| Lovable: prompt to working preview | 12.5 min |
| Lovable: prompt to live public URL | about 18 min |
| Lovable: build cost | 16.2 of 45 credits, about 36% |
| Replit: prompt to output | 2 min to a browser-only HTML mock, then blocked by the free project limit |
| Emergent: build outcome | Stalled past 45 min, no preview, 1.88 credits spent |
| v0: prompt to first preview | 4 min 50 s |
| Tools that deployed a working agent | 1 of 5, Lovable only |
| Tools supporting repo import | 2 of 5 fully, Architect and v0 |
| Distinct errors or dead ends logged | Architect 9, Lovable 7, Replit 6, Emergent 6, v0 5 |
| Screenshots captured | 161 raw, 15 published to [research/screenshots/](../research/screenshots/) |

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
| Bolt and Rocket: any measured figure | Not tested, and not planned. See [D11](../07-decision-log.md) |
| Architect: whether a second run reproduces 42 min | A repeat run. The teardown is a single session |
| Screens in the finished product | Design phase, [design/screen-inventory.md](../design/screen-inventory.md) |
| Days to ship | Not shipped yet. First deploy sets this |
| Real Google sign-in verified | A live Supabase project with the Google provider configured |
| Walkthrough length | Loom not recorded. See [assets/README.md](assets/README.md) |
