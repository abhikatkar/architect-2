# Metrics

Hard numbers for the portfolio write-up and the interview. Every row carries the command or document it
came from, so any of them can be re-derived.

**Rule for this file:** measured facts only. No estimates, no projections, no rounded guesses. A number
that cannot be sourced belongs in [Pending](#pending) until it can be.

_As of 2026-09-25._

Counts are read after the commit that last touched this file. A row must never name the commit that
carries it, because amending or rebasing changes that hash and silently makes the row a lie.

## Process

| Metric | Value | Source |
|---|---|---|
| Commits | 27 | `git rev-list --count HEAD` |
| First commit | 2026-09-24 12:19:20 | `git log --reverse` |
| Latest commit | 2026-09-25 19:05 | `git log -1` |
| Wall clock, first to last commit | 7 h 22 min on day 1, plus 6 h 18 min on day 2 | Difference of the two rows above. Wall clock, not effort |
| Calendar days elapsed | 2 | Same |
| Decision log entries | 33 | `grep -c '^### D' docs/07-decision-log.md` |
| Tracked files | 81 | `git ls-files \| wc -l` |
| Tracked files under docs/ | 49 | `git ls-files 'docs/*' \| wc -l` |
| Docs still stubs | 1 | `git ls-files 'docs/*.md' 'docs/*/*.md' \| xargs grep -l '^_Pending'` |

## Product

| Metric | Value | Source |
|---|---|---|
| Pages built | 8 | `/`, `/login`, `/app`, `/app/p/[id]`, `/demo`, `/dev/tokens`. `git ls-files 'app/*' \| grep page.tsx` |
| Route handlers built | 6 | Auth x3, plus `/app/projects`, `/app/p/[id]/build`, `/app/p/[id]/built` |
| Production dependencies | 5 | `package.json`. next, react, react-dom, @supabase/ssr, @supabase/supabase-js |
| Next.js version | 16.3.6 | `package.json` |
| Build status | Passing | `npm run build`, plus `tsc --noEmit` and ESLint clean |
| Design tokens | 8 colours, 7 type sizes, 3 radii | [design/design-system.md](../design/design-system.md), implemented in `app/globals.css` |
| Flows specified | 11 | [06-user-flows.md](../06-user-flows.md). F1 to F11 |
| P0 screens built | 8 of 15 | Screens 4 home, 5 plan review, 6 workspace shell, 7 build in progress, 8 app preview, 9 agent canvas and inspector, 10 why did it do that, 22 guest demo |
| Screens specified | 23 | [design/screen-inventory.md](../design/screen-inventory.md). 15 at P0, 5 at P1, 3 at P2 |
| Auth | Functional | Google sign-in verified end to end on production. See [D18](../07-decision-log.md) |
| Database | Functional | projects table with RLS, proven with two real users. See [D26](../07-decision-log.md) |

## Teardown

Measured in one session on 2026-09-24, free tiers, one identical prompt. Source for every row:
[01-competitive-teardown.md](../01-competitive-teardown.md), backed by the timestamped log in
[research/teardown-log.md](../research/teardown-log.md). Single run, so these are observations, not averages.

| Metric | Value |
|---|---|
| Tools | 5 tested, 2 blocked at signup. Bolt and Rocket, see [D11](../07-decision-log.md) |
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
| Screenshots captured | 161 teardown raw, 17 published to [research/screenshots/](../research/screenshots/). 14 "before" captures, 11 published to [assets/before/](assets/before/). 12 of the 28 published are redacted per [D12](../07-decision-log.md) |

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

Sign-in, verified with no JavaScript executed, against the server-rendered HTML:

| Check | Result |
|---|---|
| `/login` markup | `<form action="/auth/signin" method="post">` with `next` as a hidden input, no `onClick` |
| `POST /auth/signin` | 303 to the Google authorize URL, `code_challenge_method=s256` present |
| `next=https://evil.example` | Rewritten to `/app`, so the open redirect guard holds on the real path |
| `next=/app/settings` | Preserved |

The signed-in branch of the guard is verified on production rather than locally, per [D18](../07-decision-log.md).

Signed-in Home, with session cookies minted through `@supabase/ssr` and `prefers-color-scheme` emulated:

| Viewport | Light overflow | Dark overflow | Background |
|---|---|---|---|
| 375 | 0 | 0 | `#F5F7F6` light, `#0E1A2B` dark |
| 768 | 0 | 0 | same |
| 1280 | 0 | 0 | same |
| 1920 | 0 | 0 | same |

Row level security, queried as each user with `request.jwt.claims` set:

| Check | Result |
|---|---|
| User A select | 1 row, their own |
| User B select | 1 row, their own |
| User B updates A's row | 0 rows updated |
| User B deletes A's row | 0 rows deleted |
| Other user's project over HTTP | 404 |

Slice 4, the agent workbench. 10 runs, 4 widths each, both themes, overflow 0 in all 40:

| Screen | Light | Dark |
|---|---|---|
| Agent canvas | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Inspector, guided | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Inspector, details | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Run trace | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Trace, fix applied | 0, 0, 0, 0 | 0, 0, 0, 0 |

The guided layer, measured on visible text with `<details>` and `<script>` stripped:

| Screen | Banned words | Bare parameter values |
|---|---|---|
| Agent canvas | none | none |
| Inspector, guided | none | none |
| Run trace | none | none |
| Trace, fix applied | none | none |
| App preview | none | none |

The details layer does contain them, which is the point. Nothing is applied silently: the unapplied trace
carries the Apply control and both answers and no applied state, and the applied state carries "Revert to
v14" and drops the Apply control.

Slice 3, responsive sweep across the demo path. 8 runs, 4 widths each, both themes, overflow 0 in all 32:

| Screen | Light | Dark |
|---|---|---|
| Plan review | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Build running | 0, 0, 0, 0 | 0, 0, 0, 0 |
| Build failed | 0, 0, 0, 0 | 0, 0, 0, 0 |
| App preview | 0, 0, 0, 0 | 0, 0, 0, 0 |

No-JavaScript fallback on the build screen, measured against the served HTML with nothing executed:

| Check | Result |
|---|---|
| Renders the finished build | "Built" present |
| Shows the compressed-time label | present |
| Checks stage detail visible | present |
| Cost stated inside the estimate | present |
| Occurrences of the spinner state | **0** |

Status round trip, signed in, against the real database:

| Step | Result |
|---|---|
| Create | row inserted, status `draft` |
| Build | redirect to `?build=running` |
| Finish | redirect to `?build=done` |
| Row read back | `status: built`, `updated_at > created_at` |
| Home chip | reads "built" |

Responsive check on `/dev/tokens`, measured with Chrome device metrics via
[scripts/responsive-check.mjs](../../scripts/responsive-check.mjs):

| Viewport | innerWidth | scrollWidth | Horizontal overflow |
|---|---|---|---|
| 375 | 375 | 375 | 0 |
| 768 | 768 | 768 | 0 |
| 1280 | 1280 | 1280 | 0 |
| 1920 | 1920 | 1920 | 0 |

The token table extends to 536 px at the 375 px viewport, inside its own scroll container. That is the
designed behaviour: tables scroll sideways, the page never does.

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
