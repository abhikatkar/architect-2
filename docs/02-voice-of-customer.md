# 02. Voice of customer

Source: a synthesis of public 2025 to 2026 discussion (Reddit, G2, Product Hunt, Hacker News), gathered with Perplexity
and rewritten here as insights. Individual posts are anecdotes, not prevalence estimates.
Figures marked (unverified) must be checked against the original source before being cited in the product or interview.

## The core finding
Feedback splits by audience, and the split predicts satisfaction better than model quality does.

- **Developers** adopt AI agents that work inside their own repo, tests, and deploy pipeline (Cursor, Claude Code).
  They reject tools that make them accountable for code they cannot inspect.
- **Non-technical users** love the speed to a first demo, then churn when credits become unpredictable,
  fixes stop converging, and they cannot diagnose their own app.

## Themes

| Theme | What breaks trust | Implication for Architect 2.0 |
|---|---|---|
| Pricing and credits | Users pay for the agent's own failed retries. Reported: a $350 Replit bill in one day; Emergent plans jumping from 100 credits at $20 to 750 at $200 (unverified) | Show estimated cost before execution, plus a hard stop limit |
| Debugging loops | Fixes that break other things, repeating until credits run out | Detect repeated failure signatures and stop, then explain in plain language |
| Code quality | 66% of developers call AI code "almost right" and 45.2% say debugging it is their top frustration (Stack Overflow survey via Snyk, unverified) | Developers need readable diffs and tests, not just a preview |
| GitHub and import | GitHub is the universal trust mechanism (rollback, escape hatch). Importing a real, messy repo is much harder than greenfield | Import must be a first-class flow, not an afterthought |
| Deployment | Stale versions served after publish; users fall back to their own hosting | Show exactly which version is live, with one-click rollback |
| Agent building | Unclear state, unreliable tool calls, no way to inspect a decision path | Agent traces and inspectable runs are the differentiator |

## Lyzr Architect specifically
Almost no public reviews exist yet. Absence of complaints is not evidence of reliability.
First-hand testing ([01-competitive-teardown.md](01-competitive-teardown.md), [03-architect-today.md](03-architect-today.md))
carries more weight than public sentiment here.

## What this suggests (hypothesis, to be validated by the teardown)
The opportunity is not a better model. It is a **trust and control layer** around agentic creation:
plan before build, cost before spend, reversible everything, and a gradual handoff from prompt to visual
blueprint to code, so a user can go as deep as they need without switching tools.
