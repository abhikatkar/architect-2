# Metrics

Hard numbers for the portfolio write-up and the interview. Every row carries the command or document it
came from, so any of them can be re-derived.

**Rule for this file:** measured facts only. No estimates, no projections, no rounded guesses. A number
that cannot be sourced belongs in [Pending](#pending) until it can be.

_As of 2026-09-27._

Counts are read immediately before the commit that carries them, so the Commits row is one short of what
the repository holds at that commit. A row must never name the commit that carries it, because amending or
rebasing changes that hash and silently makes the row a lie.

## Process

| Metric | Value | Source |
|---|---|---|
| Commits | 63 | `git rev-list --count HEAD` |
| First commit | 2026-09-24 12:19:20 | `git log --reverse` |
| Latest commit | 2026-09-27 13:00 | `git log -1` |
| Wall clock, first to last commit of each day | 11 h 33 min on the 24th, 19 h 40 min on the 25th, 21 h 11 min on the 26th, 12 h 39 min so far on the 27th | `git log --format='%ad'` grouped by day, first to last. Wall clock, not effort |
| Calendar days elapsed | 4 | Same |
| Decision log entries | 67 | `grep -c '^### D' docs/07-decision-log.md` |
| Tracked files | 243 | `git ls-files \| wc -l` |
| Tracked files under docs/ | 109 | `git ls-files 'docs/*' \| wc -l` |
| Walkthrough length | **4 min 16 s**, 256.171 s | `"duration": "PT256.171S"` in the [Loom](https://www.loom.com/share/8858e15ed60049929eb7888ae634f3ea) share page's own metadata, fetched with no session on 2026-09-27 |
| Docs still stubs | 0 | `git ls-files 'docs/*.md' 'docs/*/*.md' \| xargs grep -l '^_Pending'` |

## Product

| Metric | Value | Source |
|---|---|---|
| Pages built | 15 | `git ls-files 'app/*' \| grep -c page.tsx` |
| Route handlers built | 9 | `git ls-files 'app/*' \| grep -c route.ts`. Auth x3, `/app/projects`, `/app/p/[id]/build`, `/app/p/[id]/built`, `/onboarding/save`, `/theme`, `/jev/run` |
| Production dependencies | 7 | `package.json`. next, react, react-dom, @supabase/ssr, @supabase/supabase-js, ai, server-only |
| Next.js version | 16.3.6 | `package.json` |
| Build status | Passing | `npm run build`, plus `tsc --noEmit` and ESLint clean |
| Design tokens | 9 colours, 10 type sizes, 5 radii | [design/design-system.md](../design/design-system.md), implemented in `app/globals.css`. Counted in the `@theme` block |
| Flows specified | 11 | [06-user-flows.md](../06-user-flows.md). F1 to F11 |
| P0 screens built | 15 of 15 | [design/screen-inventory.md](../design/screen-inventory.md). Screen 11 is also built and is P1, so it does not count here. This row said 11 of 15 until 2026-09-27, contradicting the Screens built row below it in this same file |
| Screens specified | 23 | [design/screen-inventory.md](../design/screen-inventory.md). 15 at P0, 5 at P1, 3 at P2 |
| Auth | Functional | Google sign-in verified end to end on production. See [D18](../07-decision-log.md) |
| Database | Functional | projects and profiles, both with RLS, proven with two real users. See [D26](../07-decision-log.md) and [D35](../07-decision-log.md) |

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

## Diagrams

| Metric | Value | Source |
|---|---|---|
| Generated diagrams | 4, from JSON committed in [docs/architecture/](../architecture/) | `archify deliver` |
| Source links verified against the pinned commit | **22**, all in the architecture diagram, re-derived at the final commit | the delivery receipt, `evidence.references` |
| Smallest node text at a 1440px desktop | **7.84px** proposed architecture, 7.43px architecture, 7.25px workflow, 7.03px sequence | `archify visual-check`, `minimumProjectedNodeTextPx` |
| Proposed architecture diagram, checked | **9 of 9** artifact checks, composition showcase **0 errors and 0 warnings**, contained at 1440x900, 1600x1000, 1920x1080 and 2048x1320 | `archify deliver` and `archify visual-check`, sha256 `9091cb75a7f8` |
| Submission exports of that diagram | PNG **3840x2272**, PDF **2 pages** at 20 x 11.25 in, both captured from the delivered HTML rather than drawn | [scripts/diagram-exports.mjs](../../scripts/diagram-exports.mjs) |
| Theme switch | **12 ms** to flip, no navigation, cookie written in the background | Chrome over CDP, measured on the rendered page |
| Consistency invariants | **91** | `scripts/consistency-check.mjs` |
| Rendered-page assertions | **189** | `scripts/rendered-check.mjs` |
| Interactive elements checked for the right cursor | **148**, over 8 pages, 0 wrong | `scripts/cursor-check.mjs` |
| Surfaces required to agree on one page | **17 to 18 readings** per URL state, over 5 states and 3 tabs, plus the version rows added up from the HTML | `scripts/rendered-check.mjs`, section 28 |
| Theme switch, earliest possible click | **10 ms** on production and 16 ms locally, 5 of 5 each, against **1470 to 1522 ms** for the same click before this fix | `scripts/theme-check.mjs`, throttled to 400 ms latency |
| Sheet focus and keyboard checks | **8 of 8**, four sheets at 1280px and 390px, measured in a browser | `scripts/focus-check.mjs` |
| App preview device frame checks | **76 of 76**, four options at 375, 768, 1280 and 1920px in both themes. **0 horizontal overflow in all 32** width and theme combinations, and the app lays out at 390, 820 or 1280px inside its frame whatever the window is | `scripts/device-check.mjs` |
| Links checked in docs and README | **315**, all resolving, anchors included, 2 of them external URLs fetched for a 200 | `scripts/link-check.mjs` |
| Colour pairs measured for WCAG AA | **2662**, over 18 surfaces in both themes, 0 below their threshold. Tightest **3.27:1** against a 3:1 control boundary requirement | `scripts/contrast-check.mjs` |
| Screens built | **15 of 15 P0, plus 1 P1** (screen 11, the framework picker) | [screen-inventory.md](../design/screen-inventory.md) |
| Unused copy strings | **0.** Five were removed as duplicates and an invariant now fails the build if a key is unread | `scripts/consistency-check.mjs` |
| Files browsable in the Code tab | **42**, the same number the GitHub consent line counts | `lib/seed/code.ts`, asserted equal |
| Real changes shown beside the simulated ones | **1**, commit `b8ba98a`, generated from git | `scripts/capture-real-change.mjs` |
| Pinned revision | `6e03ff1`, the final code | [D42](../07-decision-log.md) |
| Nodes marked Real | 10 | the diagram |
| Nodes marked Simulated | 1, `lib/seed` | the diagram |
| Containment checked at | 1440x900, 1600x1000, 1920x1080 and 2048x1320, light and dark | `archify visual-check`, all pass |

## Jev decision model

Ours, measured by us. The AI SDK returns no latency, so every figure here is wall-clock measured in our own
code around the `evaluate` call and includes network time to the Gateway.

| Metric | Value | Source |
|---|---|---|
| **Median latency, every live call the app has made** | **453 ms**, range 189 ms to 733 ms, over **27 calls**, all on 2026-09-26 | the `latency_ms` column of the `jev_calls` table the app writes to |
| Median latency in the verification run | **556 ms**, range 464 ms to 778 ms, over 9 calls | wall clock measured around the `evaluate` call |
| Median excluding the first call | **529 ms.** A run's first call carries connection setup | same |
| Earlier run, for contrast | **430 ms** over 15 calls fired back to back, before the Gateway began returning 503s and advertising a 5 request window | same, kept rather than averaged away |

The first row is the one figure quoted anywhere a single number is needed, including the README. The rows
under it are individual runs, each with its own sample, kept because they are what was measured and because
the spread between them is the real finding. Round 4 found the README quoting three of them at once, as
"about 430 ms", "median 556 ms" and "368, 463 and 192 ms", which reads as three different claims.

| Input tokens per call | 482 intake, 422 grounding checker, 371 escalation router. Identical on every repeat of the same input | provider `usage.inputTokens` |
| **Cost per call** | **$0.0000179** at the mean of 425 input tokens, so about **56,000 calls per dollar** | 425 tokens times $0.000000042, the Gateway's own price |
| Cost change from tightening the grounding criteria | $0.000017 to $0.0000179, because the question grew from 363 to 422 tokens | same arithmetic |
| Rate limit, proven | 10 live calls per IP per hour | see the proof below |
| Daily cap, proven | 300 live calls per day | see the proof below |

**Sample: 9 calls from one machine in one region, and every latency figure here is an observation rather
than a benchmark.** That is an observation, not a benchmark, and it is not comparable to the vendor's evaluations. The
latency includes network time from a machine in India to the Gateway, so it is an upper bound on what a
colocated caller would see.

**Failures are not hidden in that count.** Before the account had a card, 3 calls failed with "AI Gateway
requires a valid credit card on file to service requests". After the card was added, calls from this machine
succeed, but the deployed demo began returning "Invalid API key or token": its copy of the key is bad, which
is a deployment setting and not the integration. One call through the deployment succeeded before that
redeploy, which is the 1 counted above. Every figure in this table comes from a call that returned a
decision.

Cost is the one figure here that is not a small sample. Input token counts were identical on every repeat of
the same input, because the question schema and the state are fixed, so the per call cost is arithmetic on
two exact numbers rather than an average over noise.

### The boolean question returns no confidence, confirmed against a real response

This was previously taken from the docs. It is now observed. In the same run, with the same code reading the
same field:

| Agent | Question type | `providerMetadata.typesafe.confidence` |
|---|---|---|
| intake | choice and score | `{"topic":1,"urgency":0.43}` |
| escalation-router | choice | `{"queue":1}` |
| grounding-checker | **boolean** | **`{}`**, empty |

The boolean answer carried `probability: 0.71` and no confidence at all. The interface therefore shows
"Probability the statement is true: 71%. Jev does not return a confidence for yes-or-no questions", which is
now a description of the response rather than of the documentation.

The low confidence path also fired on its own, without being contrived: on the sample message the urgency
score came back at 0.72 with a confidence of 42%, and the screen said "Jev was not clearly decided here, so
this one would go to a person rather than through automatically." The same agent returned 100% on the topic
in the same call, so one answer routed itself to a human while the other did not.

### The key does not reach the browser

Checked after a production build, with a positive control so the check can fail:

| Searched for | In `.next/static`, which is what the browser gets |
|---|---|
| The `AI_GATEWAY_API_KEY` value | absent |
| The `JEV_IP_SALT` value | absent |
| Either variable name | absent |
| The string `function`, the control | found, so the search works |

No client component imports `lib/jev`, which is `import "server-only"` at its first line. One honest detail:
the key value does appear in `.next/cache/turbopack` on the machine that ran the build. That directory is a
local build cache, it is covered by `.gitignore`, no file under `.next` is tracked, and only `.next/static`
is ever served.

### The grounding bar, set from labeled drafts

Six drafts, labeled before they were run, one real call each. The bar moved from 0.90 to 0.60 because a
fully faithful draft only reaches 0.83, so the old bar escalated correct answers. See
[D46](../07-decision-log.md).

| Draft | Expected | P(grounded) | At the 0.60 bar |
|---|---|---|---|
| Says exactly what the source says | pass | 0.83 | sent |
| Same claim, reworded | pass | 0.82 | sent |
| Less specific than the source | pass | 0.78 | sent |
| Adds a timing word, the demo's case | fail | 0.13 | to a person |
| Contradicts the source | fail | 0.02 | to a person |
| Changes a number | fail | 0.04 | to a person |

6 of 6 land on the expected side. A consistency invariant asserts this, so the bar cannot drift back.

### Signed results, checked on the deployment and not only locally

Every Jev result travels back in the URL, so it is signed with HMAC-SHA256 using a server-only secret
([D44](../07-decision-log.md)). Checked against production on 2026-09-26, after `JEV_RESULT_SECRET` was set:

| Agent | Outcome | Latency | Signature | Rendered label |
|---|---|---|---|---|
| Intake | `live` | 368 ms | 32 chars | **Live result** |
| Grounding Checker | `live` | 463 ms | 32 chars | **Live result** |
| Escalation Router | `live` | 192 ms | 32 chars | **Live result** |

Then the same live intake URL, tampered with four ways, all against production:

| What was changed | Rendered label |
|---|---|
| Nothing | **Live result** |
| `jevSig` removed | Unverified result |
| The answer rewritten from `billing_credits` to `billing_refunds`, signature kept | Unverified result |
| One character of the signature changed | Unverified result |

The tampered values are still displayed. They are simply never called live, which is the point: the page
reports what the URL says and tells you whether this server produced it.

Two things the verification itself demonstrated, neither of them arranged. The Grounding Checker returned
`grounded: No` at P = 0.14 on the deployment, matching the trace instead of contradicting it. And the run
tripped the demo's own rate limit part way through: after 10 live calls from one IP inside an hour, the next
two came back as `rate_limited` with a recorded result from 2026-09-26, which is the guardrail working on a
real visitor, who in this case was us.

### Guardrails, proven rather than assumed

Both limits are enforced before the Gateway is called, so they were provable even while the model was still
refusing. `jev_call_counts` counts only rows with `outcome = 'live'`, so a failed call does not spend
anyone's quota, which also meant the failures above could not be used to trip the limit. The counter state
was set directly in the table instead, then removed:

| Limit | Counter state set | Request made | Result |
|---|---|---|---|
| 10 per IP per hour | 10 rows with `outcome = 'live'` on this IP's hash | `POST /jev/run`, agent `intake` | `rate_limited`, "That is 10 live calls from here in the last hour, which is the limit." No Gateway call attempted |
| 300 per day | those 10 deleted, then 300 rows on an unrelated hash so the per-IP count read 0 and the day count read 300 | `POST /jev/run`, agent `grounding-checker` | `daily_cap`, "The demo has made 300 live calls today, which is the cap." No Gateway call attempted |

Those 310 rows were synthetic, inserted only to move a counter, and every one carried `latency_ms = null`
so that no published median could ever be drawn from them. All 310 were deleted afterwards, along with the
two log rows the two test requests themselves produced. The method and why it is recorded this way:
[D39](../07-decision-log.md).

Verified from the Gateway's own models endpoint, `https://ai-gateway.vercel.sh/v1/models`, which needs no
authentication, read 2026-09-26. A primary source rather than a published claim:

| Field | Value |
|---|---|
| id | `typesafe-ai/jev` |
| type | `evaluation` |
| input price | $0.000000042 per token, so $0.042 per million |
| output price | $0 |
| context window | 32,000 |

**Vendor claims, not reproduced by us.** TypeSafe AI's own workflow evaluations, quoted to the page that
states each figure. The two pages give the same benchmark at different precision, so neither is averaged:

| Claim | Source and date |
|---|---|
| "up to 193.6x faster ... than LLMs on its workflow evaluations" | [Vercel changelog, 16 Sep 2026](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) |
| "444.6x cheaper" | same changelog |
| "up to 194 times faster" | [Vercel blog, 18 Sep 2026](https://vercel.com/blog/ai-gateway-jev-model-launch) |
| "445 times cheaper than language models" | same blog |
| "By hour 24, nearly 13% of paid teams were using it" | same blog. Vercel Gateway usage data, not TypeSafe's |

Both pages attribute the speed and cost figures to TypeSafe's own evaluations ("TypeSafe reports", "In its
own workflow evaluations"). No independent evaluator is named on either. A figure of "about 100x" circulates
elsewhere and appears on none of the three Vercel pages read on 2026-09-26, so it is not cited.

Full write-up, including limitations: [early-adoption-jev.md](early-adoption-jev.md).

## Verified behavior

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

Fix pass after the cold review. `scripts/consistency-check.mjs` asserts 15 invariants over the fixtures and
gates every commit:

| Invariant | Result |
|---|---|
| Spend is derived, never stored beside its parts | $3.37 from 9 versions |
| Every referenced version exists in the list | rollbackTo v3, preview v14, live v12 |
| Build stage costs sum to the v1 cost | $1.46 |
| The actual cost falls inside the estimate shown first | $1.46 inside $1.20 to $2.00 |
| The failure total excludes the stage charged $0.00 | $0.71, excluding Interface |
| Applying the fix adds exactly its own cost | $3.37 to $3.43 |

Re-verified on the served demo: the deploy list and the footer agree, a running stage shows partial time and
cost (Agents at 23s and $0.10 mid-run, not its final 1m 36s and $0.41), "Spent so far" becomes "Spent" when
done, all six layer tabs fit at 390px with overflow 0, and the theme cookie forces either theme while no
cookie leaves it to `prefers-color-scheme`.

Slice 2, the front door. 8 runs, 4 widths each, both themes, overflow 0 in all 32: landing, sign in,
onboarding and a 404.

The depth preference, proven functional rather than merely stored, with one project per test user:

| Check | User A (`details`) | User B (`guided`) |
|---|---|---|
| Run trace disclosure | `<details open>` | closed |
| Plan PRD disclosure | `<details open>` | closed |
| Inspector default view | configuration | simple |
| Forced `?depth=guided` | simple view | n/a |
| Forced `?depth=details` | n/a | configuration |

Row level security on `profiles`, queried as each user:

| Check | Result |
|---|---|
| User A select | 1 row, `details` |
| User B select | 1 row, `guided` |
| User B updates A's row | 0 rows updated |
| User B deletes A's row | 0 rows deleted |

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
designed behavior: tables scroll sideways, the page never does.

## Pending

Numbers that do not exist yet. Listed so they are not silently forgotten, and left empty rather than
guessed.

| Metric | Blocked on |
|---|---|
| Bolt and Rocket: any measured figure | Not tested, and not planned. See [D11](../07-decision-log.md) |
| Architect: whether a second run reproduces 42 min | A repeat run. The teardown is a single session |
| Screens in the finished product | Design phase, [design/screen-inventory.md](../design/screen-inventory.md) |
| Days to ship | Not shipped yet. First deploy sets this |
