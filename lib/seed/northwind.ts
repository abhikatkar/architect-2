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
      settings: { temperature: 0.2 },
    },
    {
      id: "answer",
      name: "Answer",
      role: "Drafts a reply using only help articles",
      knowledge: "Help center, 24 articles",
      settings: { temperature: 0.4, temperatureAfterFix: 0.2 },
    },
    {
      id: "grounding-checker",
      name: "Grounding Checker",
      role: "Confirms every claim is in a source, escalates if not",
      knowledge: "Help center",
      settings: { temperature: 0.1 },
    },
    {
      id: "escalation-router",
      name: "Escalation Router",
      role: "Assigns escalations to a human queue with a reason",
      knowledge: "Team roster",
      settings: { temperature: 0.2 },
    },
  ],

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
      outcome: "Escalated. The embellishment bug, fixed in v15",
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

  versions: [
    {
      id: "v1",
      label: "v1",
      change: "First build",
      cost: 1.46,
      environment: "preview",
      estimate: { low: 1.2, high: 2.0 },
    },
    { id: "v8", label: "v8", change: "Admin dashboard counts", cost: 0.38, environment: null },
    {
      id: "v12",
      label: "v12",
      change: "Escalation reasons",
      cost: 0.22,
      environment: "production",
      live: true,
    },
    { id: "v14", label: "v14", change: "Invoice download links", cost: 0.31, environment: "preview" },
    { id: "v15", label: "v15", change: "Grounding fix", cost: 0.06, environment: "preview" },
  ],

  commits: [
    { sha: "a41c9e2", message: "Add escalation reason to dashboard", files: 3 },
    { sha: "7be0d15", message: "Keep answers as specific as the source", files: 1 },
    { sha: "c93f7a0", message: "Invoice download links in answers", files: 2 },
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
    rollbackTo: "v3",
    retryEstimate: { low: 0.2, high: 0.4 },
  },

  ledger: {
    previewVersion: "v14",
    productionVersion: "v12",
    builtAgo: "3 min ago",
    spend: 3.43,
    cap: 5.0,
  },

  copy: {
    stageFailed:
      "A page could not load because a package is missing. Retrying once.",
    loopStopped: "Stopped after 3 identical failures. No further credits used.",
    platformRetry: "Retry caused by Architect. Charged $0.00.",
    stalePreview: "This preview is from v13. Refresh preview to see v14.",
    estimateOverCap:
      "This build may cost up to $2.00, which would pass your $5.00 cap by $0.43. Raise the cap or build anyway.",
    githubConsent:
      "Create private repo northwind-helpline, push 42 files, 1 commit. Nothing is written until you confirm.",
    marketplaceNote:
      "If published, people who use your app spend your credits. Off by default.",
    firstBuildEstimate:
      "First build for this kind of app: about 6 to 10 min, $1.20 to $2.00.",
  },
};
