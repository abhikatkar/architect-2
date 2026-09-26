# 09. Roadmap and metrics

All targets below are **targets**, not results. The only measured numbers in this repo are in [portfolio/metrics.md](portfolio/metrics.md) (Jev latency, cost per call, the 6 labeled grounding drafts).

## North star metric
**Time to first trusted run:** from first prompt to a deployed app whose agents pass their checks, with no surprise charge along the way.

It combines the three things the teardown showed users lose trust over: waiting without progress, paying without warning, and an agent they cannot diagnose. A build that is fast but surprises the user on cost, or ships an agent nobody can explain, does not count.

## Input metrics, one per principle

| Principle | Metric | Why it matters | Target |
|---|---|---|---|
| See it | Share of builds whose actual cost lands inside the shown estimate | The estimate is only useful if it holds | 90% or more |
| See it | Platform-caused retries charged to the user | Paying for the platform's own failures was the sharpest cost complaint | $0.00 |
| Steer it | Share of "Why did it do that?" fixes whose re-test passes | Measures whether guided fixes actually fix | 80% or more |
| Steer it | Share of persona B sessions that open a Details layer or the Code tab | Tests whether depth on demand is found and used | Tracked, no target until baseline |
| Own it | Share of imports that ran after seeing a compatibility report, versus imports abandoned at the report | A report that stops a doomed import is a success, not a loss | Tracked, no target until baseline |
| Own it | Repos written without an explicit confirm | The auto-created repo finding | 0 |
| Ship it safely | Rollbacks completed in one step | Recovery should never need support | 95% or more |

## Guardrail metrics
- **Loop stops per 100 builds:** rising means the build engine is failing more, even if users are protected.
- **Grounding escalations later judged correct by a human:** the 0.60 bar is based on only 6 labeled drafts, so this is the metric that tells us whether it holds at scale.
- **Decision-agent latency, p50 and p95:** measured today at a 430 ms median on a small single-region sample; must stay well under the time a language model would take for the same decision.
- **Credits per successful build:** efficiency must not be bought by hiding cost.

## Roadmap

### Now: this concept (shipped)
All 15 P0 screens, with sign-in, per-user projects and the 3 Jev decision agents real, and everything else simulated and labeled. See the README status table.

### Next: make the core real
1. Connect the plan, build and stage list to the real Architect build pipeline, keeping the estimate and loop-stop behavior.
2. Grounding calibration: grow the 6 labeled drafts to a few hundred across topics, measure calibration, then revisit the 0.60 bar with evidence rather than convention.
3. Framework adapters beyond Lyzr and GitAgent (LangGraph, CrewAI, OpenAI Agents SDK), each stating what Architect can and cannot manage for it.
4. Real two-way GitHub sync with the consent sheet as the only way anything is written.

### Later: scale the developer surface
1. A real in-browser editor (the demo is read-only by decision D48), plus a CLI and API for teams who never leave their own editor.
2. Preview and production environments backed by real deployments, with rollback tied to versions.
3. Evaluation suites that run the labeled grounding set on every change, like CI.

### Deliberately not planned yet
Real-time multi-user editing, a Marketplace redesign beyond safe defaults, and a native mobile app. Each is reconsidered once the north star metric has a baseline.

## Open questions for the Architect team
1. How is build cost computed today, and can it be estimated before a build starts?
2. Which agent frameworks do enterprise customers ask for most?
3. What share of today's support tickets are about agents behaving unexpectedly, versus builds failing?
