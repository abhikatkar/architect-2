import type { DemoProject } from "./types";

/**
 * Northwind Helpline, the one demo story every simulated screen reads from.
 *
 * Deliberately the same app the teardown prompt asked seven tools to build, so
 * the before and after comparison is like for like. Every name is fictional.
 * Source of truth: docs/design/content-and-seed-data.md.
 */
export const DEMO_PROJECT: DemoProject = {
  slug: "northwind-helpline",
  name: "Northwind Helpline",
  company: "Northwind Cloud",
  summary:
    "Answers customer billing questions from the help center, escalates to a human when it cannot ground an answer, and gives admins a dashboard of conversations by status.",
  owner: { name: "Maya Rao", role: "Support operations lead" },
  collaborator: { name: "Dev Iyer", role: "Product engineer" },

  agents: [
    {
      id: "intake",
      name: "Intake",
      role: "Reads the message, sets topic and urgency",
      knowledge: null,
      tools: ["Topic classifier"],
      creativity: 20,
      at: { x: 8, y: 50 },
      settings: { temperature: 0.2 },
      configFile: `name: Intake
model: typesafe-ai/jev
outputs:
  topic: string
  urgency: low | normal | high`,
      versions: [{ label: "v1", change: "Created with the first build" }],
      sample: {
        input: "When will my credit be applied?",
        output: "topic: billing.credits\nurgency: normal",
      },
    },
    {
      id: "answer",
      name: "Answer",
      role: "Drafts a reply using only help articles",
      knowledge: "Help center, 24 articles",
      tools: ["Help center search"],
      creativity: 55,
      creativityAfterFix: 20,
      at: { x: 37, y: 50 },
      settings: { temperature: 0.4, temperatureAfterFix: 0.2 },
      configFile: `name: Answer
model: claude-sonnet-4-6
temperature: 0.4
knowledge: help_center
rules:
  - Answer only from retrieved articles.`,
      versions: [
        { label: "v1", change: "Created with the first build" },
        { label: "v12", change: "Added escalation reasons" },
      ],
      sample: {
        input: "Can I get a refund on my annual plan?",
        output:
          "Refund requests made within 14 days of purchase are reviewed by our support team.",
      },
    },
    {
      id: "grounding-checker",
      name: "Grounding Checker",
      role: "Confirms every claim is in a source, escalates if not",
      knowledge: "Help center",
      tools: ["Claim matcher"],
      creativity: 5,
      at: { x: 66, y: 50 },
      settings: { temperature: 0.1 },
      configFile: `name: Grounding Checker
model: typesafe-ai/jev
returns:
  grounded: boolean
  reason: string`,
      versions: [{ label: "v1", change: "Created with the first build" }],
      sample: {
        input: 'Draft: "Refunds are reviewed within 14 days."',
        output: "grounded: true",
      },
    },
    {
      id: "escalation-router",
      name: "Escalation Router",
      role: "Assigns escalations to a human queue with a reason",
      knowledge: "Team roster",
      tools: ["Queue assignment"],
      creativity: 20,
      at: { x: 66, y: 88 },
      settings: { temperature: 0.2 },
      configFile: `name: Escalation Router
model: typesafe-ai/jev
queues: [billing, technical, account]`,
      versions: [
        { label: "v1", change: "Created with the first build" },
        { label: "v12", change: "Reason now recorded on every escalation" },
      ],
      sample: {
        input: "reason: unsupported_detail",
        output: "queue: billing",
      },
    },
  ],

  edges: [
    { from: "intake", to: "answer" },
    { from: "answer", to: "grounding-checker" },
    { from: "grounding-checker", to: "escalation-router", label: "if not grounded" },
    // Intake sends its own low confidence answers to a person too. The graph
    // showed only the Grounding Checker's route, so the demo's 60% rule had no
    // path on screen. Round 2 review.
    { from: "intake", to: "escalation-router", label: "if not clearly decided" },
  ],

  // Entry point 2 for the trace. The escalation is the one F4 opens.
  runs: [
    {
      id: "r-104",
      question: "When will my credit be applied?",
      outcome: "Escalated, the answer added detail the source did not support",
      grounded: false,
      ago: "4 min ago",
    },
    {
      id: "r-103",
      question: "Can I get a refund on my annual plan?",
      outcome: "Answered from Refunds for annual plans",
      grounded: true,
      ago: "11 min ago",
    },
    {
      id: "r-102",
      question: "How do I download last month's invoice?",
      outcome: "Answered from Invoices and receipts",
      grounded: true,
      ago: "26 min ago",
    },
    {
      id: "r-101",
      question: "How do I set up SSO for my team?",
      outcome: "Escalated, no source covers this",
      grounded: false,
      ago: "1 hr ago",
    },
  ],

  fix: {
    // Plain language on purpose. No parameter, no number, no "temperature".
    summary: "Keep answers as close to the source as possible",
    before:
      "Your credit will be applied at the start of your next billing cycle.",
    after: "Your credit will be applied at the next billing cycle.",
    cost: 0.06,
    newVersion: "v15",
    previousVersion: "v14",
    unsupported: "at the start of",
    source: "Account credits apply at the next billing cycle.",
  },

  helpArticleCount: 24,
  helpArticles: [
    { title: "Refunds for annual plans" },
    {
      title: "When credits are applied",
      body: "Account credits apply at the next billing cycle.",
    },
    { title: "Changing seat count" },
    { title: "Updating a payment method" },
    { title: "Invoices and receipts" },
  ],
  // Absent on purpose, so correct escalation can be demonstrated.
  missingTopics: ["SSO setup", "Data deletion requests"],

  conversations: [
    {
      id: "c-1",
      customer: "Priya S.",
      question: "How do I download last month's invoice?",
      status: "resolved",
      outcome: "Answered, grounded",
    },
    {
      id: "c-2",
      customer: "Tom W.",
      question: "Can I get a refund on my annual plan?",
      status: "resolved",
      outcome: "Answered, grounded",
    },
    {
      id: "c-3",
      customer: "Lena K.",
      question: "When will my credit be applied?",
      status: "escalated",
      outcome: "Escalated. The embellishment bug the suggested fix addresses",
    },
    {
      id: "c-4",
      customer: "Arun M.",
      question: "How do I set up SSO for my team?",
      status: "escalated",
      outcome: "Escalated, no source",
      correctEscalation: true,
    },
    {
      id: "c-5",
      customer: "Chen L.",
      question: "Please delete all my data",
      status: "escalated",
      outcome: "Escalated, no source",
      correctEscalation: true,
    },
  ],
  counts: { open: 18, resolved: 42, escalated: 7 },

  trace: {
    question: "When will my credit be applied?",
    steps: [
      {
        actor: "Intake",
        summary: "Read the question and set the topic to billing credits.",
        detail: "topic: billing.credits\nurgency: normal",
      },
      {
        actor: "Retrieval",
        summary: 'Found one help article, "When credits are applied".',
        detail: 'match: 0.91\nsource: "Account credits apply at the next billing cycle."',
        score: 0.91,
      },
      {
        actor: "Answer",
        summary:
          "Drafted a reply saying the credit applies at the start of your next billing cycle.",
        detail:
          'draft: "Your credit will be applied at the start of your next billing cycle."',
      },
      {
        actor: "Grounding Checker",
        summary:
          'The source says "at the next billing cycle". "At the start of" is not supported, so the answer was not grounded.',
        detail: "grounded: false\nreason: unsupported_detail",
      },
      {
        actor: "Escalation Router",
        summary: "Escalated to a human, which is the safe behavior.",
        detail: "queue: billing\nreason: unsupported_detail",
      },
    ],
    suggestedFix:
      "Make the Answer agent stay as specific as the source and no more.",
    diff: "temperature: 0.4 -> 0.2\n+ Answer only with wording supported by the source article.",
    reRuns: { total: 5, grounded: 5, cost: 0.06 },
  },

  // Every version whose cost is counted is listed, so this list IS the monthly
  // spend. The review found 5 versions summing to $2.43 beside a footer reading
  // $3.43, because the total was written by hand somewhere else. See D36.
  versions: [
    {
      id: "v1",
      label: "v1",
      change: "First build",
      cost: 1.46,
      environment: "preview",
      estimate: { low: 1.2, high: 2.0 },
    },
    { id: "v3", label: "v3", change: "Plainer escalation wording", cost: 0.14, environment: null },
    { id: "v5", label: "v5", change: "Filter the inbox by status", cost: 0.21, environment: null },
    { id: "v6", label: "v6", change: "Search within conversations", cost: 0.3, environment: null },
    { id: "v8", label: "v8", change: "Admin dashboard counts", cost: 0.38, environment: null },
    { id: "v9", label: "v9", change: "Full transcript view", cost: 0.19, environment: null },
    { id: "v11", label: "v11", change: "Mark resolved from the list", cost: 0.16, environment: null },
    {
      id: "v12",
      label: "v12",
      change: "Escalation reasons",
      cost: 0.22,
      environment: "production",
      live: true,
    },
    { id: "v14", label: "v14", change: "Invoice download links", cost: 0.31, environment: "preview" },
    // v15 is deliberately absent. It does not exist until the reliability fix
    // is applied, so listing it would count $0.06 the user has not spent.
  ],

  /*
    The five numbers the deploy list skips.

    A version number is taken the moment a build starts, so a build that never
    reaches deploy still consumes one. Round 3 asked why v2, v4, v7, v10 and
    v13 are missing, and the honest answer has to account for their cost as
    well as their absence: each is $0.00, because the platform did not deliver
    a working app, which is the same rule the failed stage follows.
  */
  discarded: [
    { label: "v2", reason: "Build failed: the agent graph had a cycle", cost: 0 },
    { label: "v4", reason: "Build failed: the help center import timed out", cost: 0 },
    { label: "v7", reason: "Discarded: the preview health check never passed", cost: 0 },
    { label: "v10", reason: "Build failed: the interface stage lost a component", cost: 0 },
    { label: "v13", reason: "Discarded: the escalation queue was not configured", cost: 0 },
  ],


  imports: [
    {
      repo: "northwind/billing-portal",
      branch: "main",
      subfolder: "apps/web",
      detected: "Next.js 16",
      support: "full",
    },
    {
      repo: "northwind/billing-api",
      branch: "main",
      detected: "Flask (Python)",
      support: "partial",
      note: "Architect can add agents and a new interface, but will not modify your Python routes.",
    },
  ],

  // elapsedSeconds is what a real build takes and is the number shown.
  // demoMs is how long the animation spends there, about 24 s in total.
  // Costs sum to 1.46, inside the 1.20 to 2.00 estimate shown beforehand.
  stages: [
    { name: "Plan", state: "done", elapsedSeconds: 38, demoMs: 2300, cost: 0.12 },
    { name: "Database", state: "done", elapsedSeconds: 64, demoMs: 3900, cost: 0.18 },
    { name: "Agents", state: "done", elapsedSeconds: 96, demoMs: 5900, cost: 0.41 },
    { name: "Interface", state: "done", elapsedSeconds: 152, demoMs: 9300, cost: 0.62 },
    {
      name: "Checks",
      state: "done",
      elapsedSeconds: 41,
      demoMs: 2600,
      cost: 0.13,
      detail: "preview loads, 0 console errors",
    },
  ],

  clarifiers: [
    {
      id: "surface",
      question: "Where will customers reach the agent?",
      options: ["A chat page and an admin inbox", "Chat page only", "Admin inbox only"],
      defaultOption: "A chat page and an admin inbox",
    },
    {
      id: "escalation",
      question: "What should happen when the agent is not sure?",
      options: ["Flag it in the dashboard", "Email a shared inbox", "Answer anyway"],
      defaultOption: "Flag it in the dashboard",
    },
    {
      id: "auth",
      question: "Who can open the admin dashboard?",
      options: ["Signed-in admins only", "Anyone with the link"],
      defaultOption: "Signed-in admins only",
    },
  ],

  plan: {
    headline: "A grounded support agent with an admin dashboard",
    points: [
      "Customers ask billing questions on a chat page.",
      "Answers come only from your 24 help articles, never invented.",
      "Anything the agent cannot ground is escalated to a human, with the reason.",
      "Admins sign in to see conversations by status, read transcripts, and resolve them.",
    ],
    prd: `# Northwind Helpline

## Users
- Customer: asks a billing question, gets a grounded answer or a clear handoff.
- Admin: reviews conversations, reads transcripts, marks resolved.

## Agents
- Intake: topic and urgency.
- Answer: drafts from help articles only.
- Grounding Checker: verifies every claim against a source.
- Escalation Router: assigns to a human queue with a reason.

## Screens
- /chat            customer conversation
- /admin           inbox, filtered by status
- /admin/[id]      transcript and resolve

## Rules
- No answer ships unless every claim appears in a source.
- Escalation is the safe default, not a failure.
- Admin access requires a signed-in session.`,
    estimate: { low: 1.2, high: 2.0, minutesLow: 6, minutesHigh: 10 },
  },

  previewChat: [
    { from: "customer", text: "How do I download last month's invoice?" },
    {
      from: "agent",
      text: "You can download it from Billing, then Invoices and receipts. Each invoice has a download link next to its date.",
    },
    { from: "customer", text: "When will my credit be applied?" },
    {
      from: "agent",
      text: "I do not have a reliable answer for that, so I have passed this to a person who can help.",
      escalated: true,
    },
  ],

  failure: {
    stageName: "Interface",
    cause: "A page could not load because a package is missing.",
    attempts: 3,
    stopped: "Stopped after 3 identical failures. No further credits used.",
    platformCharge: "Retry caused by Architect. Charged $0.00.",
    detail: `Error: Cannot find module '@/app/sections/AdminWorkspace'
  at ./app/page.tsx:8:1
  attempt 1 of 3, identical signature
  attempt 2 of 3, identical signature
  attempt 3 of 3, identical signature -> stopped`,
    retryEstimate: { low: 0.2, high: 0.4 },
  },

  ledger: {
    previewVersion: "v14",
    productionVersion: "v12",
    // A finished demo, not a build that just ran three minutes ago.
    cap: 5.0,
  },

  /*
    Copy that is rendered somewhere. Five keys were removed on 2026-09-27:
    stageFailed, loopStopped, platformRetry and stalePreview were duplicates of
    strings the build screen and the preview already render from `failure` and
    from the version numbers, and estimateOverCap is now arithmetic at the plan
    gate rather than a sentence with the overage written into it. A consistency
    invariant now fails if a key here is not read anywhere.
  */
  copy: {
    // No counts in here. The sheet lists what would be written by counting the
    // file tree and the change list, and this string used to say "1 commit"
    // directly under a derived line reading 3.
    githubConsent:
      "Nothing is written to your GitHub account until you confirm.",
    marketplaceNote:
      "If published, people who use your app spend your credits. Off by default.",
    firstBuildEstimate:
      "First build for this kind of app: about 6 to 10 min, $1.20 to $2.00.",
  },
};
