# Architecture: Architect 2.0

**This is the proposed production architecture.** None of the seven sections below is built in this
repository. What actually runs in the demo is a labeled subset, described in
[08-architecture.md](08-architecture.md) and listed again in the table near the end of this file. The two
documents are deliberately separate: one is a design, the other is an inventory of what a reviewer can
click.

Written 2026-09-27.

## The diagram

| | |
|---|---|
| Interactive | [/architecture/proposed-architecture](https://architect-2-zeta.vercel.app/architecture/proposed-architecture) |
| Source | [architecture/proposed-architecture.json](architecture/proposed-architecture.json) |
| PNG, 3840px wide | [architecture/exports/proposed-architecture.png](architecture/exports/proposed-architecture.png) |
| PDF, 2 pages | [architecture/exports/proposed-architecture.pdf](architecture/exports/proposed-architecture.pdf) |

The diagram is generated from the JSON, and both exports are captured from the generated diagram rather
than drawn, so neither can say something the source does not. The PDF is two pages because the viewer's
own print stylesheet puts the canvas on one page and the cards that annotate it on the next. The PNG is
the whole thing in one image.

## The seven parts at a glance

| Part | Decision in one line | Principle | Strongest evidence |
|---|---|---|---|
| [Sandboxing](#1-sandboxing) | One isolated sandbox per build, with limits and an egress allowlist | Ship it safely | One build spent 45% of the balance with no ceiling |
| [Agent harness](#2-agent-harness) | Plan, then a gated execute loop with a checkpoint per step | See it, Steer it | "Usually 4 to 6 min" ran 35 minutes, then completed before the app worked |
| [The proxy](#3-the-proxy) | Two AI gateways: one for builds, one for deployed apps | See it, Ship it safely | No tool tested showed a cost before running |
| [Model agnosticism](#4-model-agnosticism) | A registry and routing by task type, declared per agent | Steer it, Own it | Our own decision model calls: 453 ms, $0.0000179 |
| [GitHub](#5-github-integration) | A per-repo App, explicit consent, two-way sync | Own it | A repo was created and auto-synced without Push being clicked |
| [Deployment](#6-deployment) | A preview per version, promotion gated on health, narrow rollback | Ship it safely | Deploy status is not tied to versions today |
| [Scaling](#7-scaling) | Stateless API, durable build queue, warm sandbox pool, per-tenant caps | Ship it safely, See it | A build stalled past 45 minutes with no error and no preview |

The principles are from [05-product-strategy.md](05-product-strategy.md). The evidence is from the
hands-on [teardown](01-competitive-teardown.md) of 5 tools, the [before capture](03-architect-today.md) of
today's Architect, and the numbers this repo measured itself in
[portfolio/metrics.md](portfolio/metrics.md).

## 1. Sandboxing

**Decision.** Every build runs in its own isolated sandbox, created for that build and destroyed with it.
Two builds never share a kernel, a filesystem or a network namespace, even for the same user. Each sandbox
carries an egress allowlist and a CPU, wall clock and cost limit. Its filesystem is snapshotted after every
step, so a bad step is rewound rather than rebuilt. Secrets are injected at run time from a vault and never
placed in model context.

**Tech.** Firecracker-class microVMs through a managed sandbox provider: E2B, Daytona or Vercel Sandbox.
A hardened container runtime (gVisor or Kata) where a microVM is not available. Snapshots to object
storage, keyed by build and step. Secrets in a vault, delivered to the sandbox process environment through
a short-lived token, never written into a prompt, a file in the repo, or a trace.

**Why.** Generated code is untrusted code. The moment an agent can run a package install, it can run
anything a package install can run, and the blast radius has to stop at one build. Isolation per build
rather than per tenant is the level that holds when one project's transitive dependency is hostile. The
limits are there for a different reason: the most expensive failure in the research was not a security
failure, it was a build with no ceiling. The egress allowlist keeps a sandbox able to reach a package
registry and the platform's own proxy, and nothing else. Secrets stay out of model context because a model
that can read a key can write it into a file, a log line or a commit.

**Answers.** Ship it safely. In the teardown, one Architect build cost $3.33 of a $7.33 balance, about
45%, and the first warning was a Low Credits modal after the money was gone. Its auto-fix run then charged
$0.43 to diagnose a stale compile that needed no code change at all. A per-build cost limit is what turns
that into a stop instead of a bill. Replit's free tier answered the same brief with a single browser-only
HTML file keeping data in the browser, which is what the absence of a real sandbox looks like from the
outside.

## 2. Agent harness

**Decision.** Two phases. Plan first, and show the plan before anything runs. Then an execute loop over
typed tools, one step at a time: edit file, run command, run test, open preview. Every step ends in a
checkpoint commit. The loop carries a budget and a stop-loss: it halts after three identical failure
signatures instead of spending the rest of the budget on the same error, and a platform retry is never
charged to the user. "Built" is a gated state rather than an announcement: type check, lint, preview health
check and grounding checks all have to pass first. Every step emits an OpenTelemetry span, and those traces
are what the "Why did it do that?" screen reads.

**Tech.** A Python service, which is what Lyzr already runs. Tools declared as JSON schemas, so a call can
be validated, metered, retried and rendered as a sentence for a non-technical user. Model calls through the
gateway in part 3, never direct. Checkpoints as real git commits on a build branch. Spans over OTLP to a
trace backend, archived to object storage. Gates as a check suite the build screen renders the way CI does.

**Why.** The difference between a demo and a product is what happens on step 14 of 20. Plan first, because
an approved plan is the only thing that makes a long run reviewable. Typed tools rather than a free-form
shell, because a tool with a schema can be priced and explained, and a shell cannot. A checkpoint per step,
because the escape hatch is the foundation of trust, and today's Architect already proves per-commit revert
works. A stop-loss, because an agent that cannot tell it is looping will spend the whole budget proving it.
Gates, because "complete" has to mean the preview served.

**Answers.** See it and Steer it. In the teardown, Architect's build screen said "usually 4 to 6 min" for
about 35 minutes, offering a tips carousel and a "Play a game" button in place of progress, with no
percentage and no ETA. It then declared the build complete and verified while the preview showed "App
restarting", and a module-not-found error followed. Emergent ran "Thinking" for over 45 minutes with no
streamed steps, no error and no preview. The trace requirement comes from a build of my own:
[GroundTruth](https://www.abhishekkatkar.com/work/groundtruth/), where diagnosing one embellished sentence
took about eight technical inferences, and the fix had to be made in a different product.

## 3. The proxy

**Decision.** Two proxies, not one. A build-time AI gateway sits between the harness and every model
provider, and owns routing, BYOK key management, per-stage metering, rate limits, caching, redaction and
provider fallback. A second, runtime proxy sits in front of deployed apps: a generated app calls its agents
through that proxy and never holds a provider key.

**Tech.** An AI gateway for build traffic: Vercel AI Gateway, LiteLLM, Portkey or an equivalent. A thin
runtime proxy issuing short-lived per-app tokens, with its own per-app quota. Provider keys in the vault,
never in an app bundle or an environment variable a user can read. Meters written per request and per build
stage into Postgres. A response cache keyed on the prompt hash, which planning calls hit often. Redaction
at the boundary, so a prompt cannot carry a secret out of the building.

**Why.** The metering is the product feature, not the plumbing. A cost estimate before a build is only
possible if the platform already knows what the last several hundred builds cost per stage, and that number
can only be collected where every call passes through one door. The rest of the gateway is protection: BYOK
so a team can bring its own account, its own rate limits and its own data agreement; fallback so one
provider's 503 is not a failed build; caching so a replanned build does not pay twice for the same
question. The runtime proxy exists because the alternative is a provider key shipped inside an app that a
non-technical user just published.

**Answers.** See it and Ship it safely. No tool in the teardown showed a cost before running, and
Architect's balance display lagged its own spend, then dropped from $6.97 to $4.43 in a single step. Its
publish modal warns that strangers reaching the app through the marketplace spend the owner's credits, with
marketplace publishing defaulted to on, which is exactly the hole a runtime proxy with per-app quotas
closes. A small version of this already runs in the demo: every live decision model call goes through a
gateway with a server-only key, a limit of 10 live calls per IP per hour and a cap of 300 per day, both
proven in [portfolio/metrics.md](portfolio/metrics.md).

## 4. Model agnosticism

**Decision.** No provider name in the product code. One provider-neutral interface, a model registry
recording capability, latency and cost for each model, and routing by task type: a decision model such as
Jev for classify, route and score; a language model for writing; a code model for code. The model each
agent uses is declared in that agent's config file, which the user can read, change and version. A model
change triggers an eval run before it ships.

**Tech.** A provider-neutral SDK behind one interface. The registry as a table holding the gateway's own
published price per token and the platform's own measured latency per model, so routing decisions are made
on measurements rather than on marketing. Agent config as a versioned file in the project repo. Evals as a
golden task set, run per model change, with the results attached to the change.

**Why.** Two reasons, one strategic and one measured. Strategically, the model layer moves faster than any
other part of this stack, and a product that hardcodes a provider is rebuilt every time a better one lands.
The measured reason is stronger. The three decision agents in this demo run on a decision model rather than
a language model, and the numbers are ours, not a vendor's: a median of **453 ms** over the **27** live
calls in the table the app writes to, range 189 to 733 ms, and about **$0.0000179 per call** at a mean of
425 input tokens, which is roughly **56,000 calls per dollar**. Classification is a different job from
writing, it costs a different amount, and a registry is what lets the platform act on that instead of
sending everything to one expensive generalist. Sources and limitations:
[portfolio/metrics.md](portfolio/metrics.md) and
[portfolio/early-adoption-jev.md](portfolio/early-adoption-jev.md).

The eval gate is the other half, and this repo earned that lesson. When the grounding criteria changed, the
confidence bar that had been derived from a tidy argument turned out to be wrong: a fully faithful draft
only reached 0.83 against a 0.90 bar, so correct answers were being escalated. Six drafts, labeled before
they were run, caught it and moved the bar to 0.60 ([D46](07-decision-log.md), which corrects
[D43](07-decision-log.md)). A model swap is a far bigger change than a reworded question, and it should
never ship on an argument either.

**Answers.** Steer it and Own it. In the teardown, v0 silently downgraded the model from v0 Max to v0 Mini
inside the same dialog that swallowed the prompt, which is what "the model is the platform's business, not
yours" looks like in practice. In today's Architect, "build agents in any framework" is stated but not
actually supported, which is gap 4 in [03-architect-today.md](03-architect-today.md).

## 5. GitHub integration

**Decision.** A GitHub App with fine-grained permissions, installed only on the repositories the user
picks. Never an OAuth app asking for the `repo` scope. Nothing is written without an explicit consent step
that names the repository, the branch and what is about to change. Sync is two-way through webhooks, so
work done in the user's own editor comes back into the project. Each accepted change lands as a commit on a
branch or as a pull request, never as a force push to the default branch. Import runs framework detection
first and shows a compatibility report before a build is started or charged.

**Tech.** A GitHub App whose installation token is held by the API tier, so neither the harness nor the
sandbox ever sees a GitHub credential. Webhooks for push, pull request and installation events. A framework
detector reading manifest files, with the compatibility report as a gate in the import flow rather than a
warning after it.

**Why.** The `repo` scope means read and write across every public and private repository a person has,
which is a disproportionate ask for "please push this project", and I declined it during the teardown
rather than granting it. Consent is the sharper problem: during the before capture, today's Architect had
created a repository and set it to sync automatically without Push ever being clicked. Writing to somebody
else's GitHub account without an explicit action is the clearest "Own it" violation in the whole research
set. Two-way sync is the other half of ownership, because one-way push is a platform saying the code is
really still its own.

**Answers.** Own it. From the teardown: Replit's OAuth app requested `repo` with no per-repo selection, and
was declined. Architect's GitHub connect is one click and pushes one way to a new repo only. Lovable states
outright that importing an existing repository is not supported, and its Git controls sit five levels deep.
v0's GitHub connect is four clicks behind a tab menu and can create a new repo only. From the before
capture: a Flask repository was accepted for import with no compatibility warning and the wrong default
branch preselected, in a product whose import officially supports Next.js only, so the failure arrives
after the user has paid for a build.

## 6. Deployment

**Decision.** A preview per version. Promotion to production is a separate, explicit action, and health
checks gate it: a version that does not serve does not get promoted. Rollback targets only versions that
were previously live. Custom domains with verification. Agents deploy to the Lyzr agent runtime rather than
to a bespoke runner, and the deployed app reaches them through the runtime proxy from part 3.

**Tech.** Immutable build artifacts in object storage, one preview URL per version, an aliasing layer for
production and custom domains, DNS verification for domains, and the same check suite the build gates use
running again as the promotion health check.

**Why.** "What is live" has to be a fact the product can state at any moment, which means deployment state
belongs to versions rather than to a project. Restricting rollback to previously live versions is a
deliberate limit: rolling back to a version that never served is not a rollback, it is an untested deploy
under a calmer name. The health check is the build gate one layer further out, for the same reason.

**Answers.** Ship it safely. Today's Architect has no environments, and deploy status is not tied to
versions, which is gap 7; its per-commit revert is the best version history of the five tools tested and
deserves to be connected to what is deployed. In the teardown, v0's free tier offers Public visibility
only, so the deployed admin dashboard is readable by anyone with the URL and no login, and a red "Failed to
assign domain" toast persisted over a deploy that had actually succeeded. Architect's publish modal
defaults "Publish to Marketplace" to on, and granting the admin role requires editing a server environment
variable with no UI for it.

## 7. Scaling

**Decision.** A stateless API tier that autoscales. Builds on a durable job queue feeding a pool of warm
sandboxes. Per-tenant quotas and spend caps enforced at the API tier and again at the gateway. Postgres for
relational state and object storage for artifacts, logs and traces. Horizontally scaled workers.
Multi-region later, deliberately.

**Tech.** Stateless API containers behind an autoscaler. A durable execution engine of the Temporal class
for the build queue, so a build survives a worker restart and resumes rather than starting over. A warm
sandbox pool to hide cold start. Quotas as first-class rows, visible in the product before they are hit.

**Why.** A build is a long-running, stateful, expensive job, which is the one workload a plain request
queue handles badly. Durable execution is what lets the platform deploy itself in the middle of somebody's
build. Warm sandboxes are as much a product decision as an infrastructure one: prompt to working preview in
the teardown ranged from 12.5 minutes at the fastest to 42 minutes at the slowest, and a cold sandbox per
build spends the user's attention on the platform's own provisioning. Multi-region is last on purpose. It
adds a class of failure the product cannot yet debug, and nothing measured in this research asks for it
yet.

**Answers.** Ship it safely and See it. Emergent stalled past 45 minutes with no error and no preview,
which is what a build with no durable state and no visible queue position looks like from the user's seat.
Replit's free project limit blocked build, import and deploy alike, with deleting old projects offered as
the only remedy, which is a quota the product never made legible until the user hit it.

## Fits Lyzr's current stack

The harness, the tool layer and the agent services are Python services, which is what Lyzr already runs,
and the agent runtime in part 6 is theirs rather than a new one. Nothing here requires replacing MongoDB:
a document store is a good fit for agents, runs and project documents, and the Postgres in the diagram is
the relational and metering layer, which can be a separate metering store beside Mongo if a team wants one
fewer database. The gateway, the durable queue and the sandbox pool are provider choices rather than
language choices, and each can be swapped without touching the harness.

This demo is Next.js and Supabase instead, for the reasons in [D1](07-decision-log.md). That was a decision
about what earns marks in four days against a rubric that ranks working functionality last. It is not a
recommendation for their backend.

## What the demo implements today

Real means a reviewer can click it and something happens on a server. Simulated means the screen is built
and honest about being a fixture. Full detail in [08-architecture.md](08-architecture.md) and in the status
table in the [README](../README.md).

| Part | In the demo today | Status |
|---|---|---|
| Sandboxing | Nothing. No code is generated, no command is run, no filesystem exists. The build screen reads a fixture | Simulated |
| Agent harness | The plan, the build stages with their costs, the run trace and the "Why did it do that?" fix all render from seeded data. Three agents do make live model calls | Mixed: screens simulated, decision calls real |
| The proxy | The live path is real and small: a server-only key, calls through an AI gateway, 10 per IP per hour, 300 per day, and every call logged to a table with row level security | Real, for the one model it calls |
| Model agnosticism | Each agent's config file names its model and the kind of model it is. Only one provider is actually reachable | Mixed: the config is real, the routing is not |
| GitHub | The consent sheet, repo import and the compatibility report are built screens. No repository is read, created or written | Simulated |
| Deployment | Promote, rollback, custom domain, publish and access are built, with versions and spend derived rather than stored. Nothing is deployed anywhere | Simulated |
| Scaling | Out of scope for a demo. It runs as one Next.js app on Vercel with Postgres on Supabase | Not applicable |

Authentication and the database are the two parts that are functional end to end, which is the bonus the
brief names. They are not in the seven parts above because they are table stakes rather than architecture
decisions for this product.

## Open questions

Listed rather than answered, because each one needs a number or a conversation this research does not have.

- **Which sandbox provider, and what cold start budget?** E2B, Daytona and Vercel Sandbox are all
  Firecracker-class. The choice should be made on measured cold start and on whether a warm pool is
  possible on their plan, not on the feature list.
- **Does BYOK reach the Lyzr agent runtime, or only the build?** A team bringing its own provider account
  expects it to cover the agents they deploy, and that depends on how the runtime holds credentials.
- **How much of the harness is already inside Lyzr Studio?** The agent execution path exists there. The
  question is whether the harness wraps it or replaces it, and that is an internal answer.
- **What does the stop-loss refund, exactly?** "Platform retries are not charged" is a clear rule for a
  retry the platform initiated. A user-initiated retry of a step the platform got wrong is the ambiguous
  case, and it needs a policy before it needs code.
- **How many golden tasks gate a model change?** Six labeled drafts were enough to catch one wrong
  threshold. A model swap needs a larger set, and nothing here says how large.
- **Two-way sync against rewritten history.** A user who rebases or force pushes in their own editor is
  the case that breaks naive webhook sync, and the product has to choose between refusing and reconciling.
- **Which state moves first for multi-region?** Postgres is the hard one. The sandbox pool and the API tier
  are comparatively easy, and doing those first buys latency without buying a consistency problem.
