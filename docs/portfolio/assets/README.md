# Portfolio assets

Visual evidence for the write-up and the interview. This file is the checklist. The files themselves live
alongside it.

**Naming:** `<flow>-<before|after>-<nn>.png`, for example `deploy-after-01.png`. Before means today's
Architect or the named competitor. After means Architect 2.0.

**Before shots are captured first.** Once the design work starts it is easy to forget what the original
looked like, and a before shot cannot be recreated later from memory.

## Before and after, per flow

One before and one after per row. The flows are the ones the brief names, plus the extras this product adds.

| Flow | Before | After | Notes |
|---|---|---|---|
| Authentication | [ ] | [ ] | Before: email and password only, per gap 9 in [03](../../03-architect-today.md) |
| Homepage and entry | [ ] | [ ] | Before: prompt box plus AI Consultant |
| Chat and prompting | [ ] | [ ] | |
| Plan and PRD | [ ] | [ ] | The approval step is the part worth showing |
| Agent section | [ ] | [ ] | Before: editing sends the user out to Lyzr Studio, per gap 1 |
| UI being built | [ ] | [ ] | Capture the in-progress state, not just the finished screen |
| App preview | [ ] | [ ] | |
| Code and diffs | [ ] | [ ] | No before exists. Gap 6: today's product has no developer surface |
| GitHub integration | [ ] | [ ] | |
| Deploy | [ ] | [ ] | Before: no environments, versions, or rollback, per gap 7 |
| Cost before spend | [ ] | [ ] | Before: cost visible only after the build, per gap 5. The top voice of customer complaint |

## Walkthrough

- [x] Loom recorded: [www.loom.com/share/8858e15ed60049929eb7888ae634f3ea](https://www.loom.com/share/8858e15ed60049929eb7888ae634f3ea)
- [x] Length recorded rather than checked against a limit: **4 min 16 s**, and the
  [brief](../../00-assignment-brief.md) states no limit to check it against
- [x] Link added to [README.md](../../../README.md) and to [metrics.md](../metrics.md)
- [x] Link reachable without an account: fetched with no cookies and no session, HTTP 200, on 2026-09-27.
  [link-check](../../../scripts/link-check.mjs) now fetches it on every run and fails any document that
  names the walkthrough without linking it

## Architecture diagram

- [x] Request flow: proxy, session refresh, guard, protected page. Written up in
  [08-architecture.md](../../08-architecture.md)
- [x] How it would map onto Lyzr's agent backend: answered as an architecture rather than a mapping table,
  in [ARCHITECTURE.md](../../ARCHITECTURE.md)
- [x] Exported, readable at the size it will actually be viewed: a 3840px wide
  [PNG](../../architecture/exports/proposed-architecture.png) and a
  [PDF](../../architecture/exports/proposed-architecture.pdf), both captured from the generated diagram
  rather than drawn. Smallest node text projects at 7.84px on a 1440px desktop
- [x] Committed in [docs/architecture/](../../architecture/) and linked from
  [08-architecture.md](../../08-architecture.md) and the [README](../../../README.md)

## Before submitting

- [ ] Every screenshot is legible at full width, with no personal data, tokens, or email addresses visible
- [ ] Any number appearing in a screenshot matches [metrics.md](../metrics.md)
- [ ] Nothing here implies a simulated feature is functional. Cross-check the status table in [README.md](../../../README.md)
