# 05. Product strategy

## Thesis
Prompt-to-app builders win the first demo and lose trust after it. Codebase-native agents earn trust but make you build the stack yourself. **Architect 2.0 is the agentic app builder where every layer is visible, steerable, and yours.**

Short form: **See it. Steer it. Own it. Ship it safely.**

## The four principles

| Principle | Promise | Evidence it is needed | What it looks like |
|---|---|---|---|
| **See it** | You always know what is happening and what it costs | 42 min vs "4 to 6 min" label; $3.33 build with no estimate ([01](01-competitive-teardown.md)) | Cost estimate before every build, live stage checklist with ETA, no charge for platform false alarms |
| **Steer it** | You can open and control any layer, at your depth | GroundTruth diagnosis took about 8 technical steps; agent editing lives in a separate product ([03](03-architect-today.md)) | Agent workbench in place, "Why did it do that?" guided fix for misbehaving agents, code, diff, logs, terminal for developers |
| **Own it** | Your code and agents are yours | GitHub is one-way; import is Next.js only; agents tied to Lyzr ([03](03-architect-today.md)) | Two-way GitHub sync with explicit consent, import any repo with a compatibility check, choice of agent framework |
| **Ship it safely** | Going live never surprises you | Marketplace on by default; admin via env var ([01](01-competitive-teardown.md)) | Safe defaults, roles UI, preview health check before "complete", preview and production environments with rollback |

## Positioning
The market splits into two categories ([02](02-voice-of-customer.md)): prompt-to-app builders (Lovable, Replit, Bolt, Emergent, v0) and codebase-native agents (Cursor, Claude Code, Codex). Architect 2.0 sits between them and keeps what only Architect has: real multi-agent orchestration, knowledge bases, 30+ business integrations, and the best repo import of the tools tested.

## What we keep
Everything current Architect ships (full list in [03](03-architect-today.md)). 2.0 redesigns the flows around these features; it does not remove any.

## Signature feature: the guided reliability loop
Drawn directly from my GroundTruth build. When an agent answers badly, the builder clicks "Why did it do that?", sees the run trace in plain language (retrieved sources, each agent's step, where confidence dropped), and gets a suggested fix they can preview and apply. Developers see the same trace with raw parameters and diffs. This is the "Steer it" principle in one screen, and it matches Lyzr's stated direction toward an agent workbench.

## Cut list (deliberately out of scope for this submission)
- Real code generation and a real agent runtime. Flows are simulated, per the brief.
- Billing and payments. Cost estimates are shown, not charged.
- Real-time multi-user collaboration. Sharing is shown as a flow only.
- Marketplace redesign beyond safer publish defaults.
- Native mobile app. The web app is responsive.

## Answers to the submission questions

**Why would a non-technical user pick this over Replit, Lovable, or Emergent?**
Those tools get you to a demo fast, then leave you guessing: why the build is taking so long, what it will cost, and why your agent answered the way it did. Architect 2.0 shows a cost estimate before every build and a live checklist during it. When an agent misbehaves, "Why did it do that?" explains it in plain language and offers a fix you can preview. And it builds real agents with knowledge bases and business integrations, not just screens.

**Why would a technical user pick this over Claude Code, Codex, or Cursor?**
Those tools are excellent inside a repo, but you still wire up agents, auth, data, and deploy yourself. Architect 2.0 generates that whole stack, then hands you the controls: every change as a reviewable diff, logs and a terminal in the workspace, agents as versioned files you edit in place, your choice of agent framework, and two-way GitHub sync so you can keep working in your own editor and sync back.
