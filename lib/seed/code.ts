import type {
  ChangeRequest,
  CheckResult,
  CodeFile,
  DemoProject,
  LogLine,
  TerminalLine,
} from "./types";

/**
 * The Northwind Helpline codebase, for the Code tab.
 *
 * Simulated, like everything downstream of a project (D16). The one real
 * artifact on that screen is the change from this repo, which lives in
 * lib/seed/real-change.ts, is generated from git, and says what it is.
 *
 * Two rules this file follows, both learned the hard way in earlier slices:
 *
 * 1. Nothing is stored that can be counted. A change does not carry a file
 *    count, a diff does not carry an added-lines count, and the repo does not
 *    carry a file count. All three are derived in totals.ts (D36).
 * 2. The four agent files are not written here. Their bodies come from the
 *    agent fixtures the inspector already renders, so the Code tab and the
 *    agent inspector cannot drift apart.
 */

/**
 * Every path in the repo.
 *
 * The GitHub consent line reads "push N files" and counts this list, so the
 * number a reviewer sees on the consent screen is the number of files they can
 * actually browse here.
 */
const PATHS: { path: string; language: CodeFile["language"] }[] = [
  { path: "README.md", language: "md" },
  { path: "package.json", language: "ts" },
  { path: "next.config.ts", language: "ts" },
  { path: "tsconfig.json", language: "ts" },
  { path: "app/layout.tsx", language: "tsx" },
  { path: "app/page.tsx", language: "tsx" },
  { path: "app/globals.css", language: "ts" },
  { path: "app/chat/page.tsx", language: "tsx" },
  { path: "app/chat/message.tsx", language: "tsx" },
  { path: "app/dashboard/page.tsx", language: "tsx" },
  { path: "app/dashboard/filters.tsx", language: "tsx" },
  { path: "app/dashboard/status-chip.tsx", language: "tsx" },
  { path: "app/inbox/page.tsx", language: "tsx" },
  { path: "app/inbox/conversation.tsx", language: "tsx" },
  { path: "app/inbox/transcript.tsx", language: "tsx" },
  { path: "app/api/chat/route.ts", language: "ts" },
  { path: "app/api/escalations/route.ts", language: "ts" },
  { path: "app/api/invoices/route.ts", language: "ts" },
  { path: "app/api/health/route.ts", language: "ts" },
  { path: "agents/intake.yaml", language: "yaml" },
  { path: "agents/answer.yaml", language: "yaml" },
  { path: "agents/grounding-checker.yaml", language: "yaml" },
  { path: "agents/escalation-router.yaml", language: "yaml" },
  { path: "agents/runtime.ts", language: "ts" },
  { path: "lib/escalations.ts", language: "ts" },
  { path: "lib/help-center.ts", language: "ts" },
  { path: "lib/conversations.ts", language: "ts" },
  { path: "lib/queues.ts", language: "ts" },
  { path: "lib/supabase.ts", language: "ts" },
  { path: "lib/format.ts", language: "ts" },
  { path: "db/schema.sql", language: "sql" },
  { path: "db/policies.sql", language: "sql" },
  { path: "db/seed.sql", language: "sql" },
  { path: "db/migrations/0001_init.sql", language: "sql" },
  { path: "db/migrations/0002_escalation_reason.sql", language: "sql" },
  { path: "tests/chat.test.ts", language: "ts" },
  { path: "tests/grounding.test.ts", language: "ts" },
  { path: "tests/escalations.test.ts", language: "ts" },
  { path: "tests/inbox.test.ts", language: "ts" },
  { path: "public/favicon.svg", language: "md" },
  { path: "public/logo.svg", language: "md" },
  { path: ".github/workflows/checks.yml", language: "yaml" },
];

/** Bodies for the files a change touches, plus the ones worth reading. */
const BODIES: Record<string, string> = {
  "app/dashboard/page.tsx": `import { listConversations } from "@/lib/conversations";
import { StatusChip } from "./status-chip";
import { reasonFor } from "@/lib/escalations";

export default async function Dashboard() {
  const rows = await listConversations();

  return (
    <table>
      <tbody>
        {rows.map((row) => (
          <tr key={row.id}>
            <td>{row.customer}</td>
            <td>{row.question}</td>
            <td>
              <StatusChip status={row.status} />
              {row.status === "escalated" ? (
                <span className="reason">{reasonFor(row)}</span>
              ) : null}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}`,
  "lib/escalations.ts": `import type { Conversation } from "./conversations";

const LABELS: Record<string, string> = {
  unsupported_detail: "Answer added detail the source did not support",
  no_source: "No help article covers this",
  low_confidence: "The checker was not confident enough to send it",
};

/** Plain words for the dashboard. The raw code stays in the database. */
export function reasonFor(conversation: Conversation) {
  if (!conversation.escalationReason) return "Escalated";
  return LABELS[conversation.escalationReason] ?? "Escalated";
}`,
  "db/schema.sql": `create table conversations (
  id uuid primary key default gen_random_uuid(),
  customer text not null,
  question text not null,
  status text not null check (status in ('open', 'resolved', 'escalated')),
  escalation_reason text,
  created_at timestamptz not null default now()
);

create index conversations_status_idx on conversations (status);`,
  "lib/help-center.ts": `import { search } from "./supabase";

export type Article = { title: string; body: string; invoiceUrl?: string };

/** Retrieval for the Answer agent. Returns the articles, never a summary. */
export async function findArticles(question: string): Promise<Article[]> {
  const hits = await search("help_articles", question, { limit: 3 });
  return hits.map((hit) => ({
    title: hit.title,
    body: hit.body,
    invoiceUrl: hit.invoice_url ?? undefined,
  }));
}`,
  "app/api/invoices/route.ts": `import { NextResponse } from "next/server";
import { invoiceUrlFor } from "@/lib/help-center";

export async function GET(request: Request) {
  const id = new URL(request.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const url = await invoiceUrlFor(id);
  if (!url) return NextResponse.json({ error: "not found" }, { status: 404 });

  return NextResponse.json({ url });
}`,
  "app/api/health/route.ts": `import { NextResponse } from "next/server";

/** The preview health check calls this before a build is called done. */
export async function GET() {
  return NextResponse.json({ ok: true });
}`,
  "tests/grounding.test.ts": `import { expect, test } from "vitest";
import { isGrounded } from "@/agents/runtime";

test("an answer that adds a timing word is not grounded", async () => {
  const result = await isGrounded({
    draft: "Your credit will be applied at the start of your next billing cycle.",
    source: "Account credits apply at the next billing cycle.",
  });
  expect(result.grounded).toBe(false);
});`,
};

/**
 * The file list.
 *
 * Agent files take their body from the agent fixtures rather than repeating
 * them, so editing an agent's config in one place changes it in both the
 * inspector and the Code tab.
 */
export function codeFiles(p: DemoProject): CodeFile[] {
  const agentBody = (path: string) => {
    const id = path.replace("agents/", "").replace(".yaml", "");
    return p.agents.find((a) => a.id === id)?.configFile;
  };

  return PATHS.map(({ path, language }) => ({
    id: path.replace(/[^a-z0-9]+/gi, "-").toLowerCase(),
    path,
    language,
    body: path.startsWith("agents/") ? agentBody(path) : BODIES[path],
  }));
}

const fileId = (path: string) => path.replace(/[^a-z0-9]+/gi, "-").toLowerCase();

/** Changes that have already landed. The pending one is derived, see below. */
const LANDED: ChangeRequest[] = [
  {
    id: "a41c9e2",
    request: "Show me why each conversation was escalated, on the dashboard",
    message: "Add escalation reason to dashboard",
    ago: "2 days ago",
    version: "v12",
    diffs: [
      {
        id: "d1",
        fileId: fileId("db/schema.sql"),
        status: "modified",
        rows: [
          { kind: "same", old: { line: 4, text: "  question text not null," }, new: { line: 4, text: "  question text not null," } },
          { kind: "same", old: { line: 5, text: "  status text not null check (status in ('open', 'resolved', 'escalated'))," }, new: { line: 5, text: "  status text not null check (status in ('open', 'resolved', 'escalated'))," } },
          { kind: "add", old: null, new: { line: 6, text: "  escalation_reason text," } },
          { kind: "same", old: { line: 6, text: "  created_at timestamptz not null default now()" }, new: { line: 7, text: "  created_at timestamptz not null default now()" } },
        ],
      },
      {
        id: "d2",
        fileId: fileId("lib/escalations.ts"),
        status: "added",
        rows: [
          { kind: "add", old: null, new: { line: 1, text: "const LABELS: Record<string, string> = {" } },
          { kind: "add", old: null, new: { line: 2, text: "  unsupported_detail: \"Answer added detail the source did not support\"," } },
          { kind: "add", old: null, new: { line: 3, text: "  no_source: \"No help article covers this\"," } },
          { kind: "add", old: null, new: { line: 4, text: "};" } },
        ],
      },
      {
        id: "d3",
        fileId: fileId("app/dashboard/page.tsx"),
        status: "modified",
        rows: [
          { kind: "same", old: { line: 14, text: "              <StatusChip status={row.status} />" }, new: { line: 15, text: "              <StatusChip status={row.status} />" } },
          { kind: "add", old: null, new: { line: 16, text: "              {row.status === \"escalated\" ? (" } },
          { kind: "add", old: null, new: { line: 17, text: "                <span className=\"reason\">{reasonFor(row)}</span>" } },
          { kind: "add", old: null, new: { line: 18, text: "              ) : null}" } },
        ],
      },
    ],
  },
  {
    id: "c93f7a0",
    request: "When someone asks for an invoice, give them the download link",
    message: "Invoice download links in answers",
    ago: "5 hours ago",
    version: "v14",
    diffs: [
      {
        id: "d4",
        fileId: fileId("lib/help-center.ts"),
        status: "modified",
        rows: [
          { kind: "same", old: { line: 3, text: "export type Article = { title: string; body: string };" }, new: { line: 3, text: "export type Article = { title: string; body: string; invoiceUrl?: string };" } },
          { kind: "mod", old: { line: 9, text: "  return hits.map((hit) => ({ title: hit.title, body: hit.body }));" }, new: { line: 9, text: "  return hits.map((hit) => ({" } },
          { kind: "add", old: null, new: { line: 10, text: "    title: hit.title," } },
          { kind: "add", old: null, new: { line: 11, text: "    invoiceUrl: hit.invoice_url ?? undefined," } },
        ],
      },
      {
        id: "d5",
        fileId: fileId("app/api/invoices/route.ts"),
        status: "added",
        rows: [
          { kind: "add", old: null, new: { line: 1, text: "import { NextResponse } from \"next/server\";" } },
          { kind: "add", old: null, new: { line: 4, text: "export async function GET(request: Request) {" } },
          { kind: "add", old: null, new: { line: 9, text: "  return NextResponse.json({ url });" } },
        ],
      },
    ],
  },
];

/**
 * The reliability fix from "Why did it do that?", as a change.
 *
 * Derived, never written down twice. The numbers come from the Answer agent's
 * own settings and the fix fixture, so this diff, the trace's diff string and
 * the slider in the inspector are all the same change. Until it is applied it
 * has no version, which is why v15 is absent from the version list.
 */
export function pendingFixChange(p: DemoProject, fixApplied = false): ChangeRequest {
  const answer = p.agents.find((a) => a.id === "answer");
  const before = answer?.settings.temperature ?? 0;
  const after = answer?.settings.temperatureAfterFix ?? before;

  return {
    id: "7be0d15",
    request: p.fix.summary,
    message: "Keep answers as specific as the source",
    ago: fixApplied ? "just now" : "not applied yet",
    version: fixApplied ? p.fix.newVersion : null,
    diffs: [
      {
        id: "d6",
        fileId: fileId("agents/answer.yaml"),
        status: "modified",
        rows: [
          { kind: "same", old: { line: 2, text: "model: claude-sonnet-4-6" }, new: { line: 2, text: "model: claude-sonnet-4-6" } },
          {
            kind: "mod",
            old: { line: 3, text: `temperature: ${before}` },
            new: { line: 3, text: `temperature: ${after}` },
          },
          { kind: "same", old: { line: 5, text: "rules:" }, new: { line: 5, text: "rules:" } },
          { kind: "same", old: { line: 6, text: "  - Answer only from retrieved articles." }, new: { line: 6, text: "  - Answer only from retrieved articles." } },
          {
            kind: "add",
            old: null,
            new: { line: 7, text: "  - Answer only with wording supported by the source article." },
          },
        ],
      },
    ],
  };
}

/** Newest first. The pending change leads, because it is the one to review. */
export function changeRequests(p: DemoProject, fixApplied = false): ChangeRequest[] {
  return [pendingFixChange(p, fixApplied), ...LANDED];
}

/** Simulated CI for the Northwind app. Real checks live beside the real change. */
export const CHECKS: CheckResult[] = [
  { name: "Type check", state: "pass", detail: "42 files, no errors", ms: 2140 },
  { name: "Lint", state: "pass", detail: "no warnings", ms: 1380 },
  { name: "Unit tests", state: "pass", detail: "4 files, 11 tests", ms: 3260 },
  { name: "Preview health", state: "pass", detail: "preview loads, 0 console errors", ms: 840 },
  { name: "Grounding", state: "pass", detail: "5 of 5 replies grounded after the fix", ms: 1910 },
];

export const TERMINAL: TerminalLine[] = [
  { stream: "in", text: "npm run checks" },
  { stream: "out", text: "> northwind-helpline@0.1.0 checks" },
  { stream: "out", text: "> tsc --noEmit && eslint . && vitest run" },
  { stream: "out", text: "" },
  { stream: "out", text: "Type check passed in 2.14s" },
  { stream: "out", text: "Lint passed in 1.38s" },
  { stream: "out", text: "Test Files  4 passed (4)" },
  { stream: "out", text: "     Tests  11 passed (11)" },
];

export const LOGS: LogLine[] = [
  { at: "16:04:12", level: "info", source: "intake", text: "topic=billing_credits urgency=0.69" },
  { at: "16:04:12", level: "info", source: "retrieval", text: "1 article matched, score 0.91" },
  { at: "16:04:13", level: "info", source: "answer", text: "draft produced, 18 words" },
  { at: "16:04:13", level: "warn", source: "grounding", text: "unsupported detail: at the start of" },
  { at: "16:04:13", level: "info", source: "escalation", text: "queue=billing reason=unsupported_detail" },
  { at: "16:04:14", level: "info", source: "api", text: "POST /api/escalations 201 in 84ms" },
];
