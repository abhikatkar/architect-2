# Research: how Architect works today

Source: docs.architect.new (overview, How It Works, Build Guide, Database and Auth, Architect vs Studio, GitAgent, changelog v2.0.0 to v2.2.0), read on 2026-09-24. Written in our own words. Feeds docs/03-architect-today.md.

## Important context
Lyzr already shipped a release called v2.0.0 on June 18, 2026 (UI revamp, planning mode, custom themes). The current product is v2.2.0 (August 7, 2026). The assignment's "Architect 2.0" means the next product generation, not a version number. Our docs should say this explicitly so reviewers see we studied the real product.

## Mental model of the current system

| Layer | What it is today |
|---|---|
| Entry | Prompt box, plus an AI Consultant that interviews the user (role, time sinks, tools) and proposes app ideas with time-savings estimates |
| Plan | Architect writes a PRD: user journey, required agents, UX and wireframe structure. User approves, then pushes to agents. PRD stays in sync on every iteration (v2.2.0) |
| Agents | Real Lyzr Studio agents with tools and knowledge bases. Editing an agent sends the user out to Lyzr Studio. GitAgent (beta) is the alternative: agents as files in a repo |
| App | React / Next.js frontend wired to agent outputs, themed by a Theme Engine (45+ presets or bring your own design system) |
| Data | Attach files: PDF, DOCX, TXT go to a vector DB; CSV, Excel go to a dataframe for an analyst agent |
| Backend | Auto-provisioned managed NoSQL database with a Database tab (collections, live documents, schema). Generated auth is email and password with hashed storage |
| Quality | Self-correction loop on type and console errors; optional Testing agent runs the app in a real browser and fixes errors (adds roughly 2 to 5 minutes per build) |
| Code | Connect GitHub to push and sync, or deploy with a platform-managed repo and export later. Import an existing GitHub repo (Next.js only) |
| Deploy | Public subdomain on architect.new, rename the subdomain, custom domain, re-deploy control |
| Cost | Credits. Usage shows a per-agent breakdown after a build: Plan, Agent Creator, UI Generation, Build, Testing, plus token counts |
| Integrations | 30+ tools (Gmail, Slack, HubSpot, Jira, Notion, Freshdesk and more), MCP servers, custom tools via Studio, env vars for your own keys |
| Collaboration | Share an app with teammates, marketplace of community apps to clone, prompt library |

## Baseline: features 2.0 must keep
The brief says 2.0 must have everything the current Architect has. From the docs, that is: AI Consultant onboarding, prompt library, file attach (RAG), themes, Studio agent import, Plan phase with PRD, Plan mode for changes, agent network view, app preview, testing agent, database tab, auth, env vars, integrations and MCP, GitHub connect, repo import, deploy with custom domain, usage and credits, sharing, marketplace, artifacts (docs and reports), help and support.

## Gaps, especially for developers

| # | Gap in today's product | Evidence | Opportunity for 2.0 |
|---|---|---|---|
| 1 | Agent depth lives in a different product. Editing an agent means leaving for Lyzr Studio | Build Guide, Architect vs Studio page | Inspect, edit, and test agents in place, with progressive depth |
| 2 | Lyzr has stated its own goal: a dedicated "agent workbench" UI to talk to an agent, watch it work live, and edit its files | GitAgent page, "What's next" | Design that workbench. This aligns the submission with their roadmap |
| 3 | Import supports Next.js repos only | v2.2.0 changelog | Framework detection, import any repo, show what was understood before building |
| 4 | "Build agents in any framework" is not supported. Agents are Lyzr agents or GitAgent | Agents docs | Framework picker: Lyzr, GitAgent, LangGraph, CrewAI, OpenAI Agents SDK, with the same run and trace UI |
| 5 | Cost is visible only after the build | v2.2.0 usage breakdown | Estimate before running, per phase, with a spend cap. Matches the top voice-of-customer complaint |
| 6 | No developer surfaces: no code editor, diff review, terminal, logs, or CLI in the builder | Docs describe no such views | A code view with file tree, diffs per change, logs, and a CLI or API path |
| 7 | Deploy has no visible environments, version history, or rollback | Deployment docs | Preview vs production, version list, one-click rollback, "what is live" always visible |
| 8 | Testing is a toggle with a time cost, and its results are not first-class | v2.2.0 changelog | Show test runs as checks the user can read, like CI |
| 9 | Generated auth is email and password only | Database and Auth page | Offer OAuth providers and SSO for enterprise apps |

## What this means for the design
Today's Architect is a strong guided pipeline for non-technical users: Plan, then Agents, then App, then Deploy. The 2.0 problem is keeping that guided path while letting a developer open any layer (plan, agents, code, data, deploy) and take control, without leaving the product. Lyzr's own GitAgent roadmap points the same way.

## To verify hands-on
- Real time from first prompt to live preview
- The exact experience of editing an agent (does it open Studio in a new tab, is state kept)
- What the credit breakdown looks like and whether any estimate exists before a build
- Import flow on a non-Next.js repo (expected to fail, confirm the error message)
