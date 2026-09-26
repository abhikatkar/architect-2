# The `refresh` branch

Written for whoever decides what lands on `main`. It says what changed, which commits belong to which
half of the request, what was skipped and why, what the gates said, and the exact commands to merge one
half or all of it. **Nothing here has been merged.**

Branch: `refresh`, four commits, branched from `6eb1a77` on `main`. Date: 27 September 2026.

---

## Part A: polish. Nothing to merge, all six items were already on `main`

Part A asked for six polish items and said to skip any already done. All six were shipped on `main` in
commit `6eb1a77`, "fix: final pre-submission polish", before this branch existed. Each was verified in the
working tree rather than taken from the commit message:

| Item | Where it already is | How it was verified |
|---|---|---|
| A1. Pointer cursor on every clickable element, `not-allowed` on `aria-disabled` | [app/globals.css](../../app/globals.css), one rule | [scripts/cursor-check.mjs](../../scripts/cursor-check.mjs) samples every element with a clickable role on `/`, `/login`, `/demo`, three workspace tabs, an open sheet and `/app`, and asserts the computed cursor |
| A2. An original mark, readable at 16px, dark variant inside the SVG, no `favicon.ico` | [app/icon.svg](../../app/icon.svg), `app/apple-icon.png`; `app/favicon.ico` deleted in `6eb1a77` | A rendered check asserts the served SVG carries `prefers-color-scheme: dark` and the blueprint token |
| A3. `opengraph-image` at 1200x630 with the thesis line and the mark, title and description metadata | `app/opengraph-image.png`, [app/layout.tsx](../../app/layout.tsx) | A rendered check asserts the image is served as `image/png` and that the title and description are present |
| A4. GitHub sheet repo options linked to their demo notes by `aria-describedby` | [components/deploy/deploy-canvas.tsx](../../components/deploy/deploy-canvas.tsx), each option carries `aria-describedby={`${r.id}-note`}` | Read in the source and present in the served HTML |
| A5. `7be0d15` in the push list only when applied or accepted, derived from `appliedState` | [components/deploy/deploy-canvas.tsx](../../components/deploy/deploy-canvas.tsx), the change list is filtered by the applied state | `scripts/rendered-check.mjs` asserts the list contains `7be0d15` exactly when the count is 3 |
| A6. The admin inbox says its counts are this month's history | [components/build/app-preview.tsx](../../components/build/app-preview.tsx) | Present in the served HTML |

So Part A has **no commits on this branch** and nothing to merge. This is reported rather than re-done: the
six items were shipped, and rewriting them to produce commits would have been churn.

## Part B: the visual refresh. Four commits

Every commit passed the full gate set before it was made, and each one builds and runs on its own.

| Commit | What it does | Request items |
|---|---|---|
| `9e6a82b` | The design system layer: Urbanist and Instrument Sans through `next/font`, the deep navy ink against the vivid blueprint, the two type tiers, the radius and elevation tokens, `rule-strong` for control boundaries, and `scripts/contrast-check.mjs` added to the gates. Also the token review page, the mark and both brand rasters recoloured, the design system doc, and decision [D64](../07-decision-log.md#d64-2026-09-27-a-visual-refresh-that-borrows-principles-from-large-marketing-sites-and-no-identity) | B1, B2, B4, part of B7 |
| `7dd8118` | The landing page: hero, one sentence, pill calls to action, the four principle cards each leading with its teardown figure, the real "Why did it do that?" screenshot in both themes, the honest footer, and six new rendered assertions | B5 |
| `2c5499f` | `/login`, `/onboarding`, `/privacy`, `/terms` and `/architecture` on the marketing tier, one shared lockup component, and the type tier assertion added to the contrast gate | B3 and B6, marketing half |
| `a2cfd6b` | The workspace: headings at 20px and up in Urbanist 700, tabs, sheets at 16px with the soft elevation token, buttons, and the ledger bar | B3 and B6, workspace half |
| this commit | The build log, the measured numbers, the before and after screenshots and this report | B7, B8 |

### What changed, in one paragraph each

**Fonts (B1).** Urbanist 600 and 700 for display and headings, Instrument Sans 400, 500 and 600 for
interface text, JetBrains Mono untouched. All three are free, SIL Open Font License, and self-hosted by
`next/font`. Urbanist stops at 20px and Instrument Sans carries everything below it. That was not assumed:
both faces were rendered side by side at 15, 18, 20 and 24px first, and at 15px Urbanist 700 sets narrower
than Instrument Sans 600 at the same size, with a smaller x-height, counters in a, e and g that close up,
and punctuation that nearly disappears. At 20px and up it is the better face by a distance.

**Tokens (B2).** `ink` `#16202E` becomes `#0B1F4D`, `blueprint` `#1D4ED8` becomes `#2451E6` with `#6E9BFF`
in dark, and `graphite` and `rule` follow them into the same navy family. One token is new: `rule-strong`,
because a border does two jobs. `rule` divides things you read and is decorative, which WCAG exempts;
`rule-strong` outlines things you can click, where the outline is what says "control", and it holds 3:1
(WCAG 1.4.11). 35 control borders moved across, of which 31 carry it today: the four on the marketing
pages went one further, to a full-strength ink outline, because a pill call to action reads better with a
crisp edge than a grey one. Making one token do both jobs would either fail every control or put a
mid-grey line around every panel in the workspace.

**The contrast gate (B2).** `scripts/contrast-check.mjs` walks 16 surfaces in both themes, composites the
real background behind every run of text through whatever translucent layers sit between, and applies the
threshold that text's own size and weight earn. It earned itself on its first run: every control border in
the product measured 1.21:1 against a 3:1 requirement, which no amount of reading the CSS would have said.

**Type (B3).** Two tiers on one scale. Marketing: 16, 18, 20, 32, 48, and a hero clamped from 36px on a
phone to 60px from about 1130px up. Workspace: 13, 14, 15, 18, 24, 32. A token belongs to one tier, and the
rule is asserted on the rendered page: nothing under 16px on a marketing surface, or 14px for inline
monospace, which is a step down on purpose because mono set inside a sentence matches the sans around it
one size smaller.

**Shape and depth (B4).** 8px inputs and chips, 12px panels, 16px cards, sheets and modals, pill for
primary marketing calls to action. One elevation token, `shadow-soft`, on marketing cards and every
overlay. Workspace panels stay flat on hairline rules.

**The landing page (B5).** A thesis headline and one sentence whose four clauses are the four principles in
order. "Try the demo" as a pill primary, "Sign in" as a pill secondary. One real screenshot of "Why did it
do that?", generated from the running build by `scripts/landing-still.mjs`, in both themes, switched by the
same three selectors the tokens use so a visitor holding a forced theme never gets the wrong one. Four
principle cards, each leading with its teardown figure: 42 min, 8 steps, 0 presses, 2 defaults. The honest
footer stays. No gradients, no logo wall, no testimonials.

**Everything else (B6).** The five other marketing surfaces, and the workspace headings, tabs, buttons,
sheets and ledger bar.

## Judgement calls made without asking

The run was autonomous, so these were decided against CLAUDE.md and the design system and logged rather
than raised.

1. **`rule-strong` is a new token, not a change to `rule`.** Raising `rule` itself to 3:1 would have put a
   mid-grey line around every panel in the workspace, against B4's instruction that workspace panels stay
   flat on hairlines. Logged in D64.
2. **Urbanist starts at 20px.** B1 allowed this if Urbanist rendered poorly at small sizes. It does, and
   the comparison was rendered before the rule was written rather than after.
3. **`paper`, `cost`, `live` and `fault` are unchanged.** B2 named ink, blueprint, graphite and rule. The
   other four still meet AA against the new palette, which the gate proves, and changing them would have
   moved measured facts in metrics.md that are not about the refresh.
4. **The legal pages keep "Last updated 26 September 2026".** Only their presentation changed. Moving that
   date would claim the terms did.
5. **The theme toggle takes a `tier` prop.** It is the one control that appears on both a marketing page
   and inside the workspace, so it cannot pick one size. The type tier gate caught it at 13px under a 60px
   hero.
6. **The ledger bar is 14px from tablet up and 13px on a phone.** At 14px it wrapped to three lines at
   375px, and the design system says that bar costs one line of a phone screen.

## Skipped or not done

Nothing in Part B was skipped, and no gate failure repeated. Two things are worth naming:

- **Part A produced no commits,** because all six items were already on `main`. See the table above.
- **The landing page screenshot is unreadable at 375px,** because it is a 1280px-wide dense workspace
  scaled to fit a phone. The caption beside it links straight to that screen in the live demo, which is the
  same trade the diagrams index already makes for its stills. Recorded rather than solved.

## Gate results

Run against a production build served on `127.0.0.1:3131`, before each of the five commits. The numbers
below are from the final run.

| Gate | Result |
|---|---|
| `tsc --noEmit` | clean |
| `eslint` | clean |
| No em or en dashes | clean across app, components, lib, scripts, docs, README |
| `scripts/consistency-check.mjs` | 91 of 91 invariants |
| `scripts/rendered-check.mjs` | 156 of 156 assertions |
| `scripts/link-check.mjs` | 235 of 235 links across 25 files |
| `scripts/focus-check.mjs` | 8 of 8 sheets |
| `scripts/theme-check.mjs` | 5 of 5 clicks, worst 8 ms against a 400 ms bar |
| `scripts/cursor-check.mjs` | 14 of 14 checks over 140 interactive elements |
| `scripts/contrast-check.mjs` | 46 of 46 checks over 2272 measured pairs, tightest 3.27:1 against a 3:1 boundary requirement |
| `scripts/responsive-check.mjs` | 0 horizontal overflow at 375, 768, 1280 and 1920 in both themes, across 9 surfaces |
| `next build` | clean |

Two of these are new, and both failed on their first run against the real pages rather than passing
straight away, which is what makes the green run above worth having. The contrast gate failed 24 of its 32
page checks the first time it ran, every one of them a control border at 1.21:1. The type tier assertion
then failed 12 of 12 marketing checks before those pages moved tier, and after the landing page moved it
still failed 2, both of them the theme toggle at 13px.

The landing page assertions in `rendered-check.mjs` were written after the page and the screenshots
existed, so they have never been seen to fail. They are regression cover, not evidence.

## Before and after

Twenty screenshots each side in [docs/portfolio/assets/refresh/](../portfolio/assets/refresh/), five
surfaces at laptop and phone in light and dark, taken by the same script against the two builds. The
[README there](../portfolio/assets/refresh/README.md) says what to look at in each pair.

## How to merge

Part A is already on `main`, so there is nothing to merge for it. Confirm that first if you like:

```sh
git log --oneline main -1          # 6eb1a77, the commit that carries all six Part A items
git diff --stat main -- app/globals.css app/icon.svg   # no Part A changes waiting on this branch
```

**Everything (Part A is already in, so this is Part B):**

```sh
git checkout main
git merge --no-ff refresh
```

**Part B in pieces,** if you want the design system without the page work, or the pages one at a time. The
commits are ordered and each depends on the one before it, so take a prefix rather than picking out of the
middle:

```sh
git checkout main
git merge --no-ff 9e6a82b          # tokens, fonts, shape, the contrast gate
git merge --no-ff 7dd8118          # and the landing page
git merge --no-ff 2c5499f          # and the other marketing surfaces
git merge --no-ff refresh          # and the workspace, the docs and the screenshots
```

Stopping after `9e6a82b` leaves the marketing pages on the dense tier, which the contrast gate's type tier
assertion does not yet exist to complain about at that commit. Stopping after `7dd8118` is the same, minus
the landing page. Both build and both pass every gate that exists at that commit.

**To undo the whole thing** after merging:

```sh
git revert -m 1 <the merge commit>
```

The branch is pushed, so Vercel will have built a preview URL for it. That preview is the fastest way to
judge the refresh against production, which is still serving `main`.
