# Screen inventory

The contract for flows ([06](../06-user-flows.md)) and the build. Every screen names its persona (A = business builder, B = developer, Both), the principle it serves, its states, and whether it is functional or simulated.

Priority: **P0** must ship for submission, **P1** should ship, **P2** shown only if time allows.

## Routes

| # | Screen | Route | Persona | Principle | Required feature | Status | Priority |
|---|---|---|---|---|---|---|---|
| 1 | Landing | `/` | Both | All | Auth entry | Functional | P0 |
| 2 | Sign in (Google + "Try the demo") | `/login` | Both | Ship safely | Authentication | Functional | P0 |
| 3 | Onboarding: "How do you like to build?" sets default depth | `/onboarding` | Both | Steer it | Authentication | Functional (saved to profile) | P0 |
| 4 | Home: prompt box with cost and time hint, templates, recent projects, import entry | `/app` | Both | See it | Homepage | Functional (projects stored per user) | P0 |
| 5 | Plan review: one gate with clarifiers, plan, agents, artifacts, and one Build button showing estimate | `/app/p/[id]/plan` | Both | See it | Chat window | Simulated | P0 |
| 6 | Workspace shell: chat panel, preview, layer tabs (Plan, Agents, App, Data, Code, Deploy), status bar with credits meter and live version | `/app/p/[id]` | Both | Steer it | Chat window | Simulated | P0 |
| 7 | Build in progress: stage checklist, live ETA, live cost meter, stream of what the agent is doing | Workspace state | Both | See it | UI getting built | Simulated | P0 |
| 8 | App preview: device toggle, point-and-prompt editing, version badge | Workspace, App tab | Both | Steer it | App preview | Simulated | P0 |
| 9 | Agent network canvas and inspector (guided view and config file view) | Workspace, Agents tab | Both | Steer it | Agent section | Simulated | P0 |
| 10 | "Why did it do that?" run trace and guided fix | Workspace, Agents tab | Both | Steer it | Agent section | Simulated | P0 |
| 11 | New agent: framework picker (Lyzr, GitAgent, LangGraph, CrewAI, OpenAI Agents SDK) | Modal | B | Own it | Agent section | Simulated | P1 |
| 12 | Code: file tree, read-only file view, diff per change, accept and revert, terminal, logs, checks | Workspace, Code tab | B | Steer it | Beyond list | Simulated, except one real change from this repo | P0 |
| 13 | Data: collections, users and roles (admin invite UI), secrets and env vars, integrations and MCP | Workspace, Data tab | Both | Ship safely | Beyond list | Simulated | P1 |
| 14 | GitHub connect: explicit consent, new or existing repo, visibility, two-way sync, nothing written until confirmed | Modal | Both | Own it | GitHub integration | Simulated | P0 |
| 15 | Import repo: pick repo, branch, subfolder, then compatibility report (detected framework, support level, what changes, estimate) | `/app/import` | B | Own it | Beyond list | Simulated | P0 |
| 16 | Deploy: preview and production environments, version list with what is live, promote, rollback, domain, publish settings (Marketplace off by default) | Workspace, Deploy tab | Both | Ship safely | Deploying the app | Simulated | P0 |
| 17 | Usage: per-project and per-phase cost, estimate vs actual, spend cap | `/app/usage` | Both | See it | Beyond list | Simulated | P1 |
| 18 | Settings: profile, default depth, bring-your-own keys, API and CLI tokens, team | `/app/settings` | Both | Own it | Beyond list | Simulated | P1 |
| 19 | AI Consultant: interview that suggests what to build (kept from today) | `/app/consultant` | A | See it | Beyond list | Simulated | P2 |
| 20 | Templates and Marketplace browse | `/app/templates` | A | All | Beyond list | Simulated | P2 |
| 21 | Share and publish to Marketplace (opt-in) | Modal | A | Ship safely | Beyond list | Simulated | P2 |
| 22 | Guest demo: seeded read-only project | `/demo` | Both | All | Beyond list | Functional | P0 |
| 23 | Not found and error pages | `*` | Both | See it | n/a | Functional | P1 |

## Required features coverage

| Required feature | Screens |
|---|---|
| Authentication | 1, 2, 3 |
| Homepage | 4 |
| Chat window | 5, 6 |
| App preview | 8 |
| Agent section | 9, 10, 11 |
| UI getting built | 7 |
| GitHub integration | 14 |
| Deploying the app | 16 |

## States every P0 screen must design

| State | Meaning | Example copy direction |
|---|---|---|
| Empty | First use, nothing yet | One clear next action |
| Loading | Waiting on data | Skeletons, never a blank page |
| Streaming | Agent working | Named stage, elapsed time, cost so far |
| Error | Something failed | Plain language cause, whether you were charged, one fix action |
| Loop stopped | Same failure repeated | "Stopped after 3 identical failures. No further credits used." |
| Success | Done and verified | Only after the preview health check passes |
| Rollback | Returned to an earlier version | What changed back and what is live |
