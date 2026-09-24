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

- [ ] Loom recorded
- [ ] Under the length the submission allows
- [ ] Link added to [README.md](../../../README.md) and to [metrics.md](../metrics.md)
- [ ] Link is public and checked in an incognito window

## Architecture diagram

- [ ] Request flow: proxy, session refresh, guard, protected page. Source in [08-architecture.md](../../08-architecture.md)
- [ ] How each screen would map onto Lyzr's agent backend. Blocked on the architecture research
- [ ] Exported as PNG or SVG, readable at the size it will actually be viewed
- [ ] Committed here and linked from [08-architecture.md](../../08-architecture.md)

## Before submitting

- [ ] Every screenshot is legible at full width, with no personal data, tokens, or email addresses visible
- [ ] Any number appearing in a screenshot matches [metrics.md](../metrics.md)
- [ ] Nothing here implies a simulated feature is functional. Cross-check the status table in [README.md](../../../README.md)
