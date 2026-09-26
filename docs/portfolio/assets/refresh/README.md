# The visual refresh, before and after

Twenty screenshots each side, taken the same way, so the refresh can be judged rather than described.
Both sets come from [scripts/refresh-shots.mjs](../../../../scripts/refresh-shots.mjs) driving the
installed Chrome over CDP against a production build on `127.0.0.1:3131`. The only difference between
the two runs is the commit being served.

- **Before:** commit `6eb1a77`, the last commit on `main` before the refresh branch.
- **After:** the refresh branch, captured 27 September 2026.
- Laptop is 1280x900, phone is 375x812, both at a device pixel ratio of 2.
- `prefers-color-scheme` is emulated rather than forced through the theme cookie, so the media query
  itself is exercised. No cookie is set in either run.

| Surface | Path captured |
|---|---|
| `landing-*` | `/` |
| `app-tab-*` | `/demo?tab=app&pane=canvas` |
| `why-did-it-do-that-*` | `/demo?tab=agents&pane=canvas&why=r-104` |
| `deploy-*` | `/demo?tab=deploy&pane=canvas` |
| `sheet-github-*` | `/demo?tab=deploy&pane=canvas&sheet=github` |

Each file is `<surface>-<laptop|phone>-<light|dark>.png`.

## What to look at

| Pair | What changed |
|---|---|
| `landing-laptop-light` | The whole page. A 60px hero in Urbanist against a 34px one in Instrument Sans, pill calls to action, the signature screen shown as a real screenshot, and each promise leading with its teardown figure |
| `landing-phone-light` | The hero clamps to 36px and the cards stack. Nothing on the page is under 16px any more |
| `app-tab-laptop-dark` | The dense tier at one step up: 15px body, a 24px project name in the display face, tabs with room and a hover fill |
| `why-did-it-do-that-laptop-light` | The heading in Urbanist 700 at 24px, and the deeper navy ink against the more vivid blueprint |
| `deploy-laptop-light` | Control borders at 3:1 where they used to be 1.21:1, and the ledger bar at 14px |
| `sheet-github-laptop-dark` | 16px radius, one soft elevation token in place of Tailwind's shadow-lg, a 24px title and 20px padding |

The palette, the scale and the accessibility floor behind all of this are in
[design-system.md](../../../design/design-system.md), and the reasoning is
[D64](../../../07-decision-log.md#d64-2026-09-27-a-visual-refresh-that-borrows-principles-from-large-marketing-sites-and-no-identity).
