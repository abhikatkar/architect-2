# The four App preview options

Eight screenshots, one per option in each theme, so the frames can be judged rather than described. All
eight come from [scripts/device-shots.mjs](../../../../scripts/device-shots.mjs) driving the installed
Chrome over CDP against a production build on `127.0.0.1:3131`. Captured 27 September 2026 on the
`device-frames` branch.

- One viewport, **1280x900** at a device pixel ratio of 2, which is the laptop tier the design system
  names as most used and the width where Tablet and Desktop both have to scale down to fit an 888px
  canvas. Picking the width the frames fit at would have photographed the easy case.
- The capture is the **full page**, not the viewport, because the tablet frame is taller than 900px and a
  viewport crop would cut off the thing being photographed.
- `prefers-color-scheme` is emulated rather than forced through the theme cookie, so the media query
  itself is exercised. No cookie is set.

| File | Path captured | Scale it is painted at |
|---|---|---|
| `auto-*` | `/demo?tab=app&pane=canvas` | none, there is no frame |
| `phone-*` | `?device=phone` | 1.000, a 414px frame in an 888px canvas |
| `tablet-*` | `?device=tablet` | 1.000, an 868px frame, just fits |
| `desktop-*` | `?device=desktop` | 0.711, a 1282px frame painted into 888px |

## What to look at

| File | What it shows |
|---|---|
| `auto-light` | The option that did not change. No device, the panel and its address bar are the frame, and the app takes the width of the panel |
| `phone-light` | A 390px screen with a status strip above it, and the chat and the inbox stacked in one column with a rule between them. The viewer is on a 1280px monitor: the stacking is the container query, not the window |
| `phone-dark` | The same frame with the body in `rule-strong`, which reads as a chassis in both themes because it is the one token that holds 3:1 against the canvas |
| `tablet-light` | 820px, and the one layout neither of the others gets: a 3 to 2 split, so the chat keeps a readable measure and the inbox takes what it needs |
| `desktop-light` | A browser window with three neutral dots, the address bar, and two equal columns at 1280px, the whole thing painted at 0.711 and still sharp because a transform rasterises at device resolution |
| `desktop-dark` | The same window with the chrome bar tinted, so the browser furniture separates from the page inside it |

Two things these pictures cannot show, both measured instead by
[scripts/device-check.mjs](../../../../scripts/device-check.mjs): that the app inside each frame lays out
at 390, 820 or 1280px whatever the window is, and that no option scrolls the page sideways at 375, 768,
1280 or 1920px in either theme.

The dots on the desktop window are deliberately not red, amber and green. `fault`, `cost` and `live` mean
errors, money and production in this product and nothing else, and window furniture is none of the three.
See [D65](../../../07-decision-log.md#d65-2026-09-27-device-frames-that-the-app-actually-reflows-inside).
