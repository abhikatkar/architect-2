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

## Three findings from the before capture

Desk research gave the shape of these gaps. A capture session on the live product on 2026-09-24 gave the
specifics, and each one is worse than the docs suggest. Screenshots in
[portfolio/assets/before/](portfolio/assets/before/), redacted per [D12](07-decision-log.md).

**1. "Edit in Studio" loses the agent, not just the tab.** The button exists only on the Agents tab and is
covered by the sticky Credits popover. Clicking it opens a new browser tab, blanks on "Loading" for about
40 seconds, and lands on a Studio folder listing named after the app, showing a single card. It is not
deep-linked to the agent editor, and it carries no workflow canvas, knowledge base or response schema, so
the user has to click again to reach what they wanted. Studio also reports the same balance in a different
unit from Architect, and its visual design does not match.
[05-edit-in-studio-redacted.jpg](portfolio/assets/before/05-edit-in-studio-redacted.jpg)

This sharpens gap 1. The problem is not only that editing lives in another product, it is that the handoff
drops the user's context on the way.

**2. A Python repo was accepted for import with no warning, on the wrong branch.** Importing
`pallets/flask`, a Flask project, produced no compatibility error at any pre-send step, even though import
officially supports Next.js only. The modal showed the same "ports the parts it needs" copy as a valid repo
and preselected the branch `automatic-options` rather than the repository's actual default. Nothing showed
a cost before Send.
[12-import-nonnext-modal-redacted.jpg](portfolio/assets/before/12-import-nonnext-modal-redacted.jpg),
[13-import-nonnext-attached-redacted.jpg](portfolio/assets/before/13-import-nonnext-attached-redacted.jpg)

This makes gap 3 concrete and worse. An unsupported repo does not fail early, it fails after the user has
spent credits on a build.

**3. A GitHub repo was created and set to auto-sync without the user ever clicking Push.** Earlier the same
modal read "No repository yet. Push your code to create one". After the build and auto-fix, it showed a
connected repository with "Account connected, code syncs automatically", a branch selector and Pull and Push
controls. Push was never clicked. The modal does not show whether the created repo is public or private.
[08-github-modal-redacted.jpg](portfolio/assets/before/08-github-modal-redacted.jpg)

This is more serious than the one-way-push limitation in gap 6. Writing to a user's GitHub account without
an explicit action is a consent problem, and it is the sharpest argument for the "Own it" principle in
[05-product-strategy.md](05-product-strategy.md).

## The design problem this sets up

The guided path is an asset, not a liability, and 2.0 should not trade it away to win developers. The problem
is letting a developer open any layer (plan, agents, code, data, deploy) and take control, without leaving the
product and without making the non-technical user look at any of it.

## First-hand friction: building GroundTruth

GroundTruth is a 6-agent support-resolution app I built entirely in Architect and Lyzr Studio in August 2026,
documented in a 5-part teardown. Full notes in
[research/groundtruth-friction.md](research/groundtruth-friction.md).

**What held up.** Guided Plan mode decomposed the problem well and proposed a hybrid pattern on its own: a
Manager with sub-agents for resolution, plus an Independent agent for finalization after human approval.
Multi-agent orchestration, knowledge-base retrieval, and per-agent model choice are real differentiators that
no prompt-to-UI tool in the [teardown](01-competitive-teardown.md) came close to. A verification agent I
designed caught a false high-confidence retrieval match, about 90%, on a SAML SSO ticket that a confidence
score alone would have shipped.

**What broke.** An agent over-escalated because the drafting agent embellished its source, writing "start of
the next billing cycle" where the source said "the next billing cycle". Tracing that took about eight
technical inferences: reading the verification reasoning, isolating retrieval, spotting the embellishment,
connecting it to temperature, finding the parameter panel, changing 0.4 to 0.2, then re-testing. The fix
itself had to be made in Lyzr Studio, not Architect.

Five things follow from that, and each one points at a principle in
[05-product-strategy.md](05-product-strategy.md):

| Friction | Why it matters |
|---|---|
| Diagnosis needs engineering skill | Persona A cannot do any of those eight steps. This is where they leave |
| The fix lives in another product | Sharpens finding 1 above: the diagnosis and the cure are in different tools |
| Reliability tooling is Enterprise-gated | Improvement Engine, Agent Eval, Simulation Engine and Hallucination Manager exist, but not for the self-serve builder Architect targets |
| Improvement suggestions cover instructions, not parameters | The fix that actually worked was a parameter change, which an instruction-only loop never surfaces |
| Residual variance is architectural | Even after the fix, repeated runs of the same ticket can differ. A builder needs to see run-to-run variance, not a single answer |
| Credits constrain testing | Every diagnostic re-run costs money, which discourages exactly the testing that reliability needs |

This build is the direct source of the signature feature in
[05-product-strategy.md](05-product-strategy.md): the "Why did it do that?" loop productizes the diagnosis I
did by hand. See [D15](07-decision-log.md).
