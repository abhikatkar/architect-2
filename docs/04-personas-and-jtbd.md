# 04. Personas and jobs to be done

These are evidence-built archetypes, not interviewed users. Every trait below traces to one of: the hands-on teardown ([01](01-competitive-teardown.md)), the voice-of-customer synthesis ([02](02-voice-of-customer.md)), the Architect docs study ([03](03-architect-today.md)), or my own GroundTruth build on Architect (a 6-agent support app, documented in a 5-part teardown).

## Persona A: the business builder (today's Architect user)

**Who:** an ops lead, consultant, or business executive. Architect's own homepage targets this person ("business executives and consultants"). Comfortable with SaaS tools, not with code, terminals, or model parameters.

**Job to be done:** "When a manual workflow is eating my team's week, help me turn it into a working AI app I can show my team, so I can prove the idea before asking engineering for anything."

**Where they drop out today (evidence):**

| Moment | What happened | Source |
|---|---|---|
| Waiting | Build labeled "usually 4 to 6 min" took 42 min to a working preview, with a tips carousel and a game instead of progress | Teardown |
| Paying | One build cost $3.33, about 45% of the balance, with no estimate before and a delayed balance update after | Teardown |
| Trusting | When an agent misbehaves, diagnosing it took me about 8 technical steps (reading verification reasoning, isolating retrieval, finding the model parameter panel, lowering temperature from 0.4 to 0.2). A non-technical builder cannot do this | GroundTruth Part 5 |
| Shipping | "Publish to Marketplace" is on by default and spends the builder's credits; admin access can only be set through an environment variable | Teardown |

**What they must be able to see to keep trusting the product:** what is happening right now, what it will cost, why the agent answered the way it did in plain language, and exactly what is live.

## Persona B: the developer (the new audience)

**Who:** a product engineer who already uses Cursor, Claude Code, or Codex. Owns code in production and is accountable for it.

**Job to be done:** "When I need an agentic app or feature, give me the full stack (agents, UI, auth, data, deploy) generated fast, but let me inspect and control every part, so I can own it after day one."

**Where they drop out today (evidence):**

| Moment | What happened | Source |
|---|---|---|
| Inspecting | No code view, diffs, logs, or terminal inside the builder | Architect docs, teardown |
| Editing agents | "Edit in Studio" opens a new tab, takes about 40 s, and lands on a folder, not the agent | Before screenshots |
| Importing | Import supports Next.js only, yet a Python (Flask) repo was accepted with no warning and the wrong default branch | Docs, before screenshots |
| Owning | GitHub is one-way push; a repo appeared in the user's account set to auto-sync without the user clicking Push | Before screenshots |
| Choosing | Agents are Lyzr agents or GitAgent (beta); no LangGraph, CrewAI, or other frameworks | Architect docs |

**What they must be able to see to adopt it:** every change as a diff, logs and test results, agent configuration as editable files, and git history they control.

## The shared failure

Both personas leave at the same moment: when the product becomes a black box. The business builder cannot see why; the developer cannot see how. The voice-of-customer research finds the same pattern across the category.

## The dual-mode rule (implemented by the design system)

**One product, depth on demand.** There is no "technical mode" switch that splits the product in two.

1. Every screen opens on the guided layer: plain language, progress, cost, and one clear next action.
2. Every guided element has an "Open details" affordance that reveals the layer underneath (plan becomes PRD, agent card becomes config files, preview becomes code and diff, deploy becomes logs and versions).
3. Onboarding asks "How do you like to build?" and only sets the default depth. Either persona can go deeper or shallower at any time.
4. Nothing the developer layer adds may clutter the guided layer.
