# 03. Architect today

Summary of the current product, drawn from [research/architect-today-research.md](research/architect-today-research.md),
which reads docs.architect.new as of 2026-09-24 and holds the evidence for every claim below.

## Naming

Lyzr already shipped a release called v2.0.0 on 2026-06-18, and the live product is v2.2.0. "Architect 2.0"
in this assignment means the next product generation, not a version number. See [D6](07-decision-log.md).

## The four layer pipeline

Today's Architect is a guided pipeline, and it is good at it. A non-technical user moves forward through
four layers and is never asked to look sideways.

| Layer | What it does today |
|---|---|
| **Plan** | Architect interviews the user, then writes a PRD covering journey, agents, and wireframe structure. The user approves before anything is built, and the PRD stays in sync on every iteration |
| **Agents** | Real Lyzr Studio agents with tools and knowledge bases. GitAgent (beta) is the alternative, with agents as files in a repo |
| **App** | A React or Next.js frontend wired to agent outputs, themed by a Theme Engine, backed by an auto-provisioned NoSQL database and generated auth |
| **Deploy** | A public subdomain on architect.new, renameable, with custom domain support and re-deploy control |

Around that pipeline sit the features 2.0 has to keep: AI Consultant onboarding, prompt library, file
attach for RAG, themes, Studio agent import, plan mode, app preview, testing agent, database tab, env vars,
30+ integrations and MCP, GitHub connect and repo import, usage and credits, sharing, and the marketplace.

## Nine gaps

Evidence for each is in the [research doc](research/architect-today-research.md#gaps-especially-for-developers).

| # | Gap | Opportunity for 2.0 |
|---|---|---|
| 1 | Agent depth lives in another product. Editing an agent means leaving for Lyzr Studio | Inspect, edit, and test agents in place, with progressive depth |
| 2 | Lyzr has publicly stated it wants an "agent workbench" to watch an agent work live and edit its files | Design that workbench. It aligns the submission with their own roadmap |
| 3 | Import supports Next.js repos only | Detect the framework, import any repo, show what was understood before building |
| 4 | "Build agents in any framework" is not actually supported | A framework picker (Lyzr, GitAgent, LangGraph, CrewAI, OpenAI Agents SDK) behind one run and trace UI |
| 5 | Cost is visible only after the build | Estimate before running, per phase, with a spend cap |
| 6 | No developer surfaces at all: no code editor, diffs, terminal, logs, or CLI | A code view with file tree, per-change diffs, logs, and an API path |
| 7 | No environments, and deploy status is not tied to versions. Per-commit revert already exists, confirmed hands-on in [01](01-competitive-teardown.md) | Preview versus production, and bind the version list to what is deployed so "what is live" is always visible |
| 8 | Testing is a toggle with a time cost, and results are not first-class | Show test runs as readable checks, the way CI does |
| 9 | Generated auth is email and password only | Offer OAuth providers, and SSO for enterprise apps |

Gap 5 is the same complaint that tops [02-voice-of-customer.md](02-voice-of-customer.md), reached from a
completely different direction. That convergence is worth weighting heavily.

## The design problem this sets up

The guided path is an asset, not a liability, and 2.0 should not trade it away to win developers. The problem
is letting a developer open any layer (plan, agents, code, data, deploy) and take control, without leaving the
product and without making the non-technical user look at any of it.

## Pending: first-hand friction from building GroundTruth

Desk research cannot answer how the product actually feels. Still to capture from building GroundTruth on
Architect:

- Real time from first prompt to live preview
- What editing an agent actually does: whether Studio opens in a new tab, and whether state survives
- Whether any cost estimate exists before a build, and what the credit breakdown looks like after one
- The import flow on a non-Next.js repo, including the exact error message
