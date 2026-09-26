# Design system

## Starting point
**Subject:** a workbench where people build agentic apps. **Audience:** business builders and developers in the same product. **Primary job of the design:** make the machine legible. Every choice below serves one idea: nothing the system does should be invisible.

The name gives us the metaphor. Architects work from blueprints: a precise drawing anyone can read at a glance, with detail available when you lean in. Architect 2.0 renders the plan and the agent network as blueprints, and keeps everything else quiet so that drawing is the one memorable thing.

## What we deliberately avoid
Checked against today's Architect and the 5 tested tools, and against generic generated-UI defaults: no near-black canvas with a neon accent, no gradient washes, no identical rounded cards with the same soft shadow, no all-caps eyebrow labels, no monospace used as decoration, no tips carousel or game during a build.

## Color

| Token | Light | Dark | Meaning (and only this meaning) |
|---|---|---|---|
| `paper` | #F5F7F6 | #0E1A2B | Canvas. Dark mode is blueprint navy, not black |
| `ink` | #0B1F4D | #E8EEF6 | Primary text |
| `graphite` | #4F5F7C | #9FB0C8 | Secondary text |
| `rule` | #DCE2EC | #23354E | Hairline dividers and panel edges. Decorative |
| `rule-strong` | #7D89A1 | #5C6E8C | The outline of a control, at 3:1. Never a divider |
| `blueprint` | #2451E6 | #6E9BFF | Primary action, selection, the blueprint drawing |
| `cost` | #A16207 | #E3B35C | Money only: estimates, meters, charges |
| `live` | #15803D | #5CCB8A | What is live in production, passing checks |
| `fault` | #B42318 | #FF8A7A | Errors and stopped loops |

Rules: `cost` never appears on anything that is not money. `live` never means "success" in general, only "this is what users see". Status is never color alone; it always has an icon and a word.

`ink` is a deep navy rather than a near-black, and `blueprint` a more vivid blue, so the two carry the same family and the page reads as drawn in one ink at two strengths. Both are measured, not asserted: `scripts/contrast-check.mjs` composites every rendered text pair in both themes and fails the commit below AA.

Two border tokens, because a border does two different jobs. `rule` divides things you read and is decorative, so WCAG exempts it. `rule-strong` is the outline of something you can click, where the outline is what says "control", and it holds 3:1 against what is behind it (WCAG 1.4.11). One token could not be both without making every hairline in the workspace heavy.

## Type
- **Urbanist** (Google Fonts, SIL OFL) for display and headings, weights 600 and 700, from 20 px up.
- **Instrument Sans** (Google Fonts, SIL OFL) for all interface text, weights 400, 500, 600, and for headings below 20 px. Both faces were rendered side by side at 15, 18, 20 and 24 px before this rule was written: at 15 px Urbanist sets narrower, with a smaller x-height and counters in a, e and g that close up. At 20 px and above it is clearly the better display face.
- **JetBrains Mono** only where the text is literally what the machine sees: code, config files, logs, diffs, terminal. Mono means "raw". The guided layer never uses it; the details layer does. The font itself tells the user which depth they are in.
- Sentence case everywhere. Max line length 72 characters.

One scale, two tiers. A token belongs to one tier or the other, which is what stops a landing page from quietly picking up a 13 px caption.

| Tier | Where | Sizes (px) | Line height |
|---|---|---|---|
| Marketing | Landing, sign in, onboarding, privacy, terms, the diagrams index | `note` 16, `lead` 18, `subhead` 20, `heading` 32, `display` 48, `hero` 36 to 60 | 1.5 body, about 1.15 headings, 1.05 hero |
| Workspace | The demo and the signed-in workspace | `caption` 13, `small` 14, `body` 15, `lead` 18, `title` 24, `heading` 32 | 1.5 body, 1.15 headings |

The hero is `clamp(2.25rem, 1.2rem + 3.6vw, 3.75rem)`: 36 px on a phone, 56 px at 1024, 60 px from about 1130 up. The marketing floor of 16 px is asserted on the rendered page by `scripts/contrast-check.mjs`.

## Shape and depth
- Radius follows hierarchy: 8 px for inputs and chips, 12 px for panels, 16 px for cards, sheets and modals, and a pill for primary calls to action on marketing surfaces. Never one radius for everything. `card` and `overlay` are the same 16 px on purpose: a card and a sheet are the same object at two depths, so they read as the same shape.
- One elevation token, `shadow-soft`. Marketing cards and every overlay. Workspace panels stay flat on a hairline `rule` border, because a workspace with shadows on every panel reads as clutter at the density the workspace runs at.
- Spacing on a 4 px base: 4, 8, 12, 16, 24, 32, 48.
- The blueprint grid (a faint 24 px grid in `blueprint` at 6% opacity) appears only on the Plan and Agents canvases.

## Workspace layout

```
+-----------------------------------------------------------------------+
| Project name     Plan  Agents  App  Data  Code  Deploy     Share  (A)  |
+----------------------+------------------------------------------------+
| Conversation         |                                                |
| and build timeline   |   Canvas for the selected layer                 |
|                      |   (preview, blueprint, code, data, deploys)     |
| Stage list while     |                                                |
| building             |                                    [Details >] |
|                      |                                                |
| [ Prompt box       ] |                                                |
+----------------------+------------------------------------------------+
| Ledger bar: Preview v14 | Production v12 live | Built 3m ago | $0.84 of $5 cap |
+-----------------------------------------------------------------------+
```

- Left column 360 px, resizable. Canvas takes the rest. Content is left aligned throughout.
- The **ledger bar** is always visible: environment, live version, build state, spend against cap. It is the "See it" principle as a permanent surface.

## Responsive behavior
Every screen works from a 360 px phone to a 1920 px monitor. Designed mobile-aware from the start, not shrunk at the end.

| Breakpoint | Width | Workspace layout | Layer tabs | Ledger bar |
|---|---|---|---|---|
| Phone | under 640 px | One pane at a time: Chat or Canvas, switched by a bottom tab bar | Horizontal scroll strip under the header | One line: spend and live version; tap to expand |
| Tablet | 640 to 1023 px | Canvas full width; conversation opens as a slide-over panel | Visible in header | Full, wraps to two lines if needed |
| Laptop | 1024 to 1439 px | Two columns, conversation 320 px | Visible in header | Full |
| Desktop | 1440 px and up | Two columns, conversation 360 px, canvas max width with side margins for preview | Visible in header | Full |

Screen-specific rules:
- **Home and landing:** single column on phone, prompt box first, recent projects become a vertical list.
- **Modals** (GitHub consent, deploy, framework picker) become full-height bottom sheets on phone, with the confirm action pinned at the bottom.
- **Agents canvas:** the network is drawn as a blueprint, hand-rendered rather than in a graph library, so there is no pan and no pinch to zoom. Tapping an agent opens its inspector, as a bottom sheet on phone. Under 640 px the canvas is **replaced** by a list of agents, not shrunk, because a graph that size is unusable. See [D31](../07-decision-log.md).
- **App preview:** a device toggle (phone, tablet, desktop) on laptop and up. On phone, the preview simply fills the screen.
- **Code tab:** diff and terminal on tablet and up. On phone it is deliberately read-only: browse files, read diffs, accept or revert changes. Editing code on a phone is a poor experience, so we do not pretend otherwise. Logged as a decision. **Corrected 2026-09-26:** this said "full editor" on tablet and up. The submission's Code tab is read-only at every width and says so where the Edit control sits, because the generated code is simulated and an editor would be a client component the architecture does not have. See D48.
- **Tables** (data, usage, versions) scroll horizontally inside their own container on small screens; the page itself never scrolls sideways.

Touch and input:
- Touch targets at least 44 by 44 px on phone and tablet.
- Hover is never the only way to reveal something; every hover action has a tap or focus equivalent.
- Keyboard shortcuts are an addition for laptop and desktop, never the only path.

Verification: each P0 screen is checked at 375, 768, 1280, and 1920 px wide before it counts as done, in both themes.

## Depth on demand (implements the dual-mode rule)
- Every guided element has one consistent **Details** control. It reveals the layer underneath in place, never in a new tab.
- Guided layer: plain words, sans type, one next action. Details layer: technical names, mono for raw content, full controls.
- The default depth comes from onboarding and can be changed per panel. The choice is remembered per user.
- Keyboard: `D` toggles details for the focused panel.

## Core components

| Component | Principle | Behavior |
|---|---|---|
| Ledger bar | See it | Always on screen; clicking spend opens Usage |
| Cost estimate | See it | Shown on every Build and fix action before it runs, as a range, with the cap |
| Stage list | See it | Named stages with state, elapsed time, and cost so far; replaces any spinner longer than 3 s |
| Details disclosure | Steer it | One control, same position, same label everywhere |
| Run trace | Steer it | Timeline of one agent run: input, retrieval, each agent step, output, with where confidence dropped |
| Diff card | Steer it, Own it | Every change the agent makes, grouped per request, accept or revert |
| Consent sheet | Own it | Any action that writes outside Architect (GitHub, domains, marketplace) states exactly what will be written and waits for confirm |
| Version pill and environment badge | Ship safely | Shows which version is in preview and which is live |

## Motion
One orchestrated moment: during a build, stages resolve in sequence and the ledger meter advances. Everything else responds only to user action (open, expand, confirm) and shows what changed. `prefers-reduced-motion` removes all non-essential motion.

## Writing rules
- Sentence case, plain verbs, no dashes of the long kind.
- One verb per action through the whole flow: Build, Building, Built.
- Numbers always carry units: "about 4 min", "$0.40 to $0.70".
- Never "usually". Estimates come from this project's own history or say "first build, estimate may vary".
- Every error says what happened, whether you were charged, and one action to fix it.

## Accessibility floor
WCAG AA contrast in both themes, visible focus ring in `blueprint`, full keyboard navigation, status never conveyed by color alone.

Measured rather than asserted. `scripts/contrast-check.mjs` walks 16 surfaces in both themes, composites the real background behind every run of text, and applies the threshold that text's own size and weight earn: 3:1 for large text, 4.5:1 otherwise. It also holds control outlines at 3:1 and the focus ring at 3:1. It runs before every commit.

## Tailwind mapping
Tokens map one to one to CSS variables on `:root` and `[data-theme="dark"]`, exposed in `tailwind.config` as `colors.paper`, `colors.ink`, `colors.graphite`, `colors.rule`, `colors.ruleStrong`, `colors.blueprint`, `colors.cost`, `colors.live`, `colors.fault`, with `fontFamily.display` = Urbanist, `fontFamily.sans` = Instrument Sans and `fontFamily.mono` = JetBrains Mono.
