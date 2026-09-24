# 01. Competitive teardown

Seven tools, one identical prompt, one hour. Written from the timestamped session log in
[research/teardown-log.md](research/teardown-log.md). Screenshots in [research/screenshots/](research/screenshots/).

## Method

The same brief went to every tool: a customer support agent with an FAQ knowledge base that escalates
when unsure, plus a dashboard listing conversations by status with transcripts and a resolve action.
Where a tool asked clarifying questions, the answers were identical everywhere: both a customer chat and
an admin inbox, escalations flagged in the dashboard, data persisted, admin sign-in required.

Window: 12:06 to 13:04 IST on 2026-09-24, Chrome, free tiers only. Timings come from timestamped
screenshots and are good to roughly 15 seconds.

## Limits of this test

These matter more than the numbers, and any claim built on this teardown has to carry them.

- **One prompt, one session, one run.** No repeats, so none of the timings are averages. A second run
  could differ substantially, particularly for anything model-dependent.
- **Five of seven had existing accounts.** Signup timings for Architect, Lovable, Replit, Emergent and v0
  are returning-login times, not first-signup times, and are not comparable to a cold start.
- **Bolt and Rocket were never tested.** Both required creating a new account, which was out of scope.
  Their rows cover only what is observable before signup. See [D11](07-decision-log.md).
- **No new OAuth grants and no repos created.** Only already-authorized GitHub connections were used, and
  import flows were walked up to the last step before anything would be created or billed. Import was
  tested against the public repo `nextjs/saas-starter`.
- **One environment quirk, not a product fault.** The bare `rocket.new` domain was blocked by the testing
  browser's allowlist. `www.rocket.new` loaded normally.

## Comparison

Lovable was the only tool that went from prompt to a working, deployed agent on a free tier. v0 deployed,
but shipped a UI prototype with no live agent. Architect produced the most capable system and the only
real agent tooling, and was also the slowest and the most expensive.

| | Architect | Lovable | Replit | Emergent | v0 |
|---|---|---|---|---|---|
| **Prompt to working preview** | 42 min | 12.5 min | 2 min, then blocked | never, stalled 45+ min | 4 min 50 s |
| **Deployed and working?** | Deployed, chat untested | **Yes, verified live** | Blocked | No | Deployed, agent not live |
| **Agent surface** | Visual canvas, editable, KB, MCP, strict JSON schema | Code plus an AI gateway, usage metrics, no graph | Locked on free tier | LLM connector in code, no graph | None, plus a failed DB wire-up |
| **Repo import** | **Best: private repos, branch, monorepo subfolder** | **Not supported** | Blocked by free-app limit | Modal with no import button | Yes, URL or repo list |
| **GitHub connect** | 1 click, push to new repo only | 7 clicks, GitHub App, per-repo | Over-broad `repo` scope, declined | Not tested | 4 clicks, new repo only |
| **Cost for one build** | **$3.33 of $7.33, about 45%** | 16.2 of 45 credits, about 36% | n/a | 1.88 credits, nothing produced | model silently downgraded |
| **Cost shown before running?** | No | No, but a credit cap exists | No | No | No |
| **Distinct errors or dead ends** | 9 | 7 | 6 | 6 | 5 |

Bolt and Rocket are excluded from the table. Neither got past the signup wall
([bolt-signup-wall.jpg](research/screenshots/bolt-signup-wall.jpg)).

## Friction, per tool

### Architect

1. **The time estimate was wrong by roughly 7x.** The build screen said "usually 4 to 6 min" for about 35
   minutes, offering a tips carousel and a "Play a game" button in place of progress, with no percentage and
   no ETA ([architect-build-progress-opaque.jpg](research/screenshots/architect-build-progress-opaque.jpg)).
2. **Completion was announced before the app worked.** The agent declared the build complete and verified,
   and the preview immediately showed "App restarting"
   ([architect-complete-but-preview-restarting.jpg](research/screenshots/architect-complete-but-preview-restarting.jpg)).
   A module-not-found error followed, which the auto-fix then diagnosed as a stale compile needing no code
   change, yet the fix run still cost $0.43.
3. **Cost appeared only after it was spent.** The balance display lagged, then dropped from $6.97 to $4.43
   in one step. One build consumed about 45% of the balance, and the first warning was a Low Credits modal.
4. **Three gates before any code.** A clarifier form, then Start Building, then an artifact-picker modal.
   About 3 minutes of approvals before the build started.
5. **Risky deploy defaults.** "Publish to Marketplace" defaults to on, and the modal itself warns that
   strangers reaching the app through the marketplace spend the owner's credits. Separately, the admin role
   can only be granted through a server environment variable, with no UI for it.

### Lovable

1. **A clarifying question with no way to answer it.** The agent said it needed two choices, then rendered
   no choice widget, so the answers had to be guessed and typed as prose
   ([lovable-missing-clarifier.jpg](research/screenshots/lovable-missing-clarifier.jpg)).
2. **Four interruptions in the first minute.** A Drafts modal, a "menu moved" tooltip, a highlight coachmark,
   and a plan approval gate ([lovable-plan-approval-gate.jpg](research/screenshots/lovable-plan-approval-gate.jpg)).
3. **The preview never refreshed itself.** The build finished but the pane held a spinner until refreshed by
   hand, with confusing "Plan Cancelled" and "Rerunning build" lines in the log.
4. **No import, and Git buried five levels deep.** Lovable states outright that importing an existing repo is
   not supported ([lovable-github-connect-buried.jpg](research/screenshots/lovable-github-connect-buried.jpg)).
5. **A bug in the shipped app.** The generated chat says "Enter to send", and Enter does not send.

### Replit

1. **A paywall ate the prompt.** The first Enter opened an upsell; choosing "Stay on Starter" discarded the
   typed prompt entirely.
2. **Old projects blocked everything.** Repls from 2021 counted against the free project limit, which blocked
   build, import and deploy alike. The only remedy offered was deleting projects.
3. **The free tier is a mock.** The output was a standalone HTML file storing data in the browser. A real
   agent and backend require a paid plan.
4. **An over-broad GitHub scope.** The OAuth app requested `repo`, meaning read and write across every public
   and private repository, with no per-repo selection. Declined.
5. **Onboarding noise and leaked reasoning.** Two tours, a tooltip and a rename notice, plus status text that
   exposed the agent's internal monologue.

### Emergent

1. **It never finished.** "Thinking" ran for over 45 minutes with no streamed steps, no error and no preview
   ([emergent-stalled-27-minutes.jpg](research/screenshots/emergent-stalled-27-minutes.jpg)).
2. **A reload destroyed the session.** The welcome message and all five wizard answers vanished from the chat.
3. **The preview pane sold features instead of showing progress.** A rotating marketing carousel occupied the
   space where the build should have been, alongside a support-bot popup.
4. **Import resolves the repo, then offers no way to import it.** The modal found the repo and its branches and
   had no import button.
5. **Spent with nothing to show.** 1.88 credits gone, no output. Backend surface is a connector catalogue
   ([emergent-connectors-manage.jpg](research/screenshots/emergent-connectors-manage.jpg)).

### v0

1. **A modal ate the prompt and downgraded the model.** A "new team experience" dialog swallowed the first
   prompt, and the model silently changed from v0 Max to v0 Mini.
2. **The backend was claimed, not wired.** Neon connected in one click, then schema introspection failed, so
   the app shipped seeded client-side data and made no live AI calls. v0 disclosed this only at the end, which
   is honest but still a gap ([v0-publish-flow-and-backend-gap.jpg](research/screenshots/v0-publish-flow-and-backend-gap.jpg)).
3. **Public by force.** The free tier offers Public visibility only, so the deployed admin dashboard is
   readable by anyone with the URL, with no login
   ([v0-live-public-admin-dashboard.jpg](research/screenshots/v0-live-public-admin-dashboard.jpg)).
4. **A false error that never cleared.** A red "Failed to assign domain" toast persisted while the deploy
   succeeded and the URL served
   ([v0-public-only-and-false-domain-error.jpg](research/screenshots/v0-public-only-and-false-domain-error.jpg)).
5. **GitHub hidden four clicks deep,** behind a tab menu rather than the top bar, and able to create a new
   repo only.

### Bolt and Rocket, pre-signup only

Bolt's Google consent screen hands the user to stackblitz.com rather than bolt.new and requests offline
access, which is a trust-relevant brand mismatch. Rocket gates everything behind a cookie banner and a
sign-in modal with a mandatory terms checkbox, and its landing page sells "Vibe Solutioning" without showing
a builder at all. Neither was tested further.

## What Architect already does best

This is the part worth protecting. On the two dimensions that matter most to developers, no other tool in
this test came close.

**The agent canvas.** Architect is the only tool here that renders the agent as an inspectable object: a
visual workflow from Customer Message to FAQ Support Agent to Grounded Support Response, with clickable nodes,
an attached knowledge base offering file upload or URL crawl, MCP server support, and a strict JSON response
contract ([architect-agent-canvas.jpg](research/screenshots/architect-agent-canvas.jpg)). Lovable and Emergent
treat the agent as code plus an API key with no graph at all
([lovable-backend-menu.jpg](research/screenshots/lovable-backend-menu.jpg)). v0 has no agent concept. The
caveat from [03-architect-today.md](03-architect-today.md) still holds: editing the agent sends the user out
to Lyzr Studio.

**Repo import.** Architect lists the user's repositories including private ones, accepts a pasted URL, and
offers branch selection plus a monorepo subfolder, in five clicks and about 45 seconds. Lovable does not
support import at all, Emergent's modal is a dead end, and Replit's was blocked. Only v0 is comparable, and it
lacks the subfolder control. This is the clearest moat in the product.

**Per-commit revert.** Each build step is committed and pushed, and the sidebar offers "Revert to this
version" against a specific commit, alongside a per-build test action. No other tool in the test exposed
version history this way. This matters because it is the escape hatch that
[02-voice-of-customer.md](02-voice-of-customer.md) identifies as the foundation of trust.

## What this means for 2.0

Ordered by how much evidence sits behind each.

1. **Estimate cost before spending it.** The strongest cross-source finding in the whole research set.
   The voice-of-customer work flagged unpredictable credits as the top churn driver, and this test reproduced
   it: $3.33 with no warning, a lagging balance, and a bill for the tool's own false alarm. Lovable at least
   offers a credit cap ([lovable-ai-usage-and-credit-cap.jpg](research/screenshots/lovable-ai-usage-and-credit-cap.jpg)).
   Architect should show a per-phase estimate before the build and a live meter during it.
2. **Show real progress and never bill for the tool's own mistakes.** Replace a fixed "4 to 6 min" label with
   the build stages already present in the log, and do not charge an auto-fix run that turns out to need no
   code change.
3. **Gate completion on a working preview.** Architect announced success twice before the app ran. Run the
   preview health check before saying "complete".
4. **Collapse three approval gates into one.** Show the plan inline and put the clarifier answers and the
   artifact picker behind a single Build action.
5. **Make deploy defaults safe.** Marketplace publishing should be off by default, and granting admin should
   not require editing a server environment variable.
6. **Protect import and revert as the moat,** and give the agent canvas the in-place editing that currently
   requires leaving for Studio.

## Live deployments from this test

| Tool | URL | Verified |
|---|---|---|
| Lovable | kind-convos-desk.lovable.app | FAQ answer and escalation both worked live |
| Architect | support-nest-clever-deck-k6tr.architect.space | Login page loads. Chat not tested, it needs an account |
| v0 | customer-support-agent-dashboard-three.vercel.app | Loads. Seeded data, public, no auth |

All three are public and should be unpublished from each tool once reviewed.
