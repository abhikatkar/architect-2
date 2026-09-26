import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "paper", cls: "bg-paper", light: "#F5F7F6", dark: "#0E1A2B", meaning: "Canvas. Dark mode is blueprint navy, not black" },
  { name: "ink", cls: "bg-ink", light: "#0B1F4D", dark: "#E8EEF6", meaning: "Primary text" },
  { name: "graphite", cls: "bg-graphite", light: "#4F5F7C", dark: "#9FB0C8", meaning: "Secondary text" },
  { name: "rule", cls: "bg-rule", light: "#DCE2EC", dark: "#23354E", meaning: "Hairline dividers and panel edges. Decorative" },
  { name: "rule-strong", cls: "bg-rule-strong", light: "#7D89A1", dark: "#5C6E8C", meaning: "The outline of a control, at 3:1. Never a divider" },
  { name: "blueprint", cls: "bg-blueprint", light: "#2451E6", dark: "#6E9BFF", meaning: "Primary action, selection, the drawing" },
  { name: "cost", cls: "bg-cost", light: "#A16207", dark: "#E3B35C", meaning: "Money only: estimates, meters, charges" },
  { name: "live", cls: "bg-live", light: "#15803D", dark: "#5CCB8A", meaning: "What is live in production, passing checks" },
  { name: "fault", cls: "bg-fault", light: "#B42318", dark: "#FF8A7A", meaning: "Errors and stopped loops" },
];

/* Marketing tier: read at arm's length, set in Urbanist from 20px up. */
const MARKETING_TYPE = [
  { name: "hero", px: "36 to 60", cls: "text-hero", lh: "1.05" },
  { name: "display", px: "48", cls: "text-display", lh: "1.1" },
  { name: "heading", px: "32", cls: "text-heading", lh: "1.15" },
  { name: "subhead", px: "20", cls: "text-subhead", lh: "1.2" },
  { name: "lead", px: "18", cls: "text-lead", lh: "1.5" },
  { name: "note", px: "16", cls: "text-note", lh: "1.5" },
];

/* Workspace tier: dense on purpose, Instrument Sans all the way down. */
const WORKSPACE_TYPE = [
  { name: "heading", px: "32", cls: "text-heading", lh: "1.15" },
  { name: "title", px: "24", cls: "text-title", lh: "1.15" },
  { name: "lead", px: "18", cls: "text-lead", lh: "1.5" },
  { name: "body", px: "15", cls: "text-body", lh: "1.5" },
  { name: "small", px: "14", cls: "text-small", lh: "1.5" },
  { name: "caption", px: "13", cls: "text-caption", lh: "1.5" },
];

const RADIUS = [
  { name: "input", cls: "rounded-input", px: "8px", use: "Inputs and chips" },
  { name: "panel", cls: "rounded-panel", px: "12px", use: "Panels" },
  { name: "card", cls: "rounded-card", px: "16px", use: "Cards" },
  { name: "overlay", cls: "rounded-overlay", px: "16px", use: "Sheets and modals" },
  { name: "pill", cls: "rounded-pill", px: "full", use: "Primary marketing calls to action" },
];

const SPACING = [1, 2, 3, 4, 6, 8, 12];

/** One tier of the scale, every size set in the face it will actually use. */
function TypeList({ rows }: { rows: { name: string; px: string; cls: string; lh: string }[] }) {
  return (
    <ul className="flex flex-col gap-4">
      {rows.map((t) => (
        <li key={t.name} className="flex flex-col gap-1 sm:flex-row sm:items-baseline sm:gap-6">
          <span className="font-mono text-caption text-graphite sm:w-40 sm:shrink-0">
            {t.name} {t.px}px / {t.lh}
          </span>
          <span className={`${t.cls} min-w-0 break-words`}>
            Make the machine legible
          </span>
        </li>
      ))}
    </ul>
  );
}

function Section({ title, note, children }: { title: string; note?: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-rule pt-6 min-w-0">
      <h2 className="text-title font-semibold">{title}</h2>
      {note ? <p className="text-small text-graphite mt-1 max-w-[72ch]">{note}</p> : null}
      <div className="mt-4 min-w-0">{children}</div>
    </section>
  );
}

function ThemePanel({ theme }: { theme: "light" | "dark" }) {
  return (
    <div
      data-theme={theme}
      className="bg-paper text-ink border border-rule rounded-panel p-4 sm:p-6 flex flex-col gap-6 min-w-0"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-lead font-semibold capitalize">{theme}</h3>
        <span className="font-mono text-caption text-graphite">
          data-theme=&quot;{theme}&quot;
        </span>
      </div>

      <ul className="flex flex-col gap-2">
        {COLORS.map((c) => (
          <li key={c.name} className="flex items-center gap-3">
            <span
              className={`${c.cls} h-10 w-10 shrink-0 rounded-input border border-rule`}
              aria-hidden="true"
            />
            <span className="min-w-0">
              <span className="font-mono text-small block truncate">{c.name}</span>
              <span className="font-mono text-caption text-graphite block">
                {theme === "light" ? c.light : c.dark}
              </span>
            </span>
          </li>
        ))}
      </ul>

      {/* Status is never color alone: each one carries an icon and a word. */}
      <div className="flex flex-wrap gap-2">
        <span className="text-caption rounded-input border border-live px-2 py-1 text-live">
          ok Live v12
        </span>
        <span className="text-caption rounded-input border border-cost px-2 py-1 text-cost">
          $0.40 to $0.70
        </span>
        <span className="text-caption rounded-input border border-fault px-2 py-1 text-fault">
          x Stopped
        </span>
      </div>
    </div>
  );
}

export default function TokensPage() {
  return (
    <main className="px-4 py-8 sm:px-6 lg:px-8 w-full max-w-[1600px] mx-auto flex flex-col gap-8 min-w-0">
      <header>
        <p className="font-mono text-caption text-graphite">/dev/tokens</p>
        <h1 className="text-display font-semibold mt-1">Design tokens</h1>
        <p className="text-body text-graphite mt-2 max-w-[72ch]">
          Every token from the design system, rendered in both themes for visual
          review. This page is not part of the product and is excluded from
          search. It is the reference the screens are built against.
        </p>
      </header>

      <Section
        title="Color"
        note="Eight tokens, each with exactly one meaning. cost never appears on anything that is not money. live never means success in general, only that this is what users see."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ThemePanel theme="light" />
          <ThemePanel theme="dark" />
        </div>
        <div className="mt-4 overflow-x-auto min-w-0">
          <table className="w-full min-w-[520px] text-small border-collapse">
            <thead>
              <tr className="text-left text-graphite">
                <th className="border-b border-rule py-2 pr-4 font-medium">Token</th>
                <th className="border-b border-rule py-2 pr-4 font-medium">Light</th>
                <th className="border-b border-rule py-2 pr-4 font-medium">Dark</th>
                <th className="border-b border-rule py-2 font-medium">Meaning</th>
              </tr>
            </thead>
            <tbody>
              {COLORS.map((c) => (
                <tr key={c.name}>
                  <td className="border-b border-rule py-2 pr-4 font-mono">{c.name}</td>
                  <td className="border-b border-rule py-2 pr-4 font-mono text-graphite">{c.light}</td>
                  <td className="border-b border-rule py-2 pr-4 font-mono text-graphite">{c.dark}</td>
                  <td className="border-b border-rule py-2">{c.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section
        title="Type scale, marketing tier"
        note="Landing, sign in, onboarding, the legal pages and the diagrams index. Urbanist from 20px up, Instrument Sans below it. Line height 1.5 for body, about 1.15 for headings. Sentence case everywhere, and no line longer than 72 characters."
      >
        <TypeList rows={MARKETING_TYPE} />
      </Section>

      <Section
        title="Type scale, workspace tier"
        note="The demo and the signed in workspace. Dense on purpose, because a ledger bar and a diff list are read by scanning rather than by reading. Nothing here is Urbanist: below 20px its counters close up, so the dense tier is Instrument Sans throughout."
      >
        <TypeList rows={WORKSPACE_TYPE} />
      </Section>

      <Section
        title="Mono means raw"
        note="JetBrains Mono appears only where the text is literally what the machine sees. The typeface is the signal for which depth you are in, so it is never used for decoration."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="border border-rule rounded-panel p-4">
            <p className="text-caption text-graphite mb-2">Guided layer, sans</p>
            <p className="text-body">
              The agent escalated because it was not confident in the answer.
            </p>
          </div>
          <div className="border border-rule rounded-panel p-4 min-w-0">
            <p className="text-caption text-graphite mb-2">Details layer, mono</p>
            <pre className="font-mono text-small overflow-x-auto">
{`temperature: 0.2
confidence:  0.41
escalate:    true`}
            </pre>
          </div>
        </div>
      </Section>

      <Section
        title="Radius and elevation"
        note="Radius follows hierarchy. Never one value for everything. Card and overlay are the same measurement on purpose: a card and a sheet are the same object at two depths."
      >
        <div className="flex flex-wrap gap-4">
          {RADIUS.map((r) => (
            <div key={r.name} className="flex flex-col gap-2">
              <div className={`${r.cls} h-16 w-24 border border-rule bg-blueprint/10`} />
              <span className="font-mono text-caption text-graphite">
                {r.name} {r.px}
              </span>
              <span className="text-caption text-graphite">{r.use}</span>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap items-end gap-4">
          <div className="rounded-card border border-rule bg-paper p-4 shadow-soft">
            <p className="font-mono text-caption text-graphite">shadow-soft</p>
            <p className="text-body">Marketing cards and every overlay. Nothing else.</p>
          </div>
          <div className="rounded-panel border border-rule bg-paper p-4">
            <p className="font-mono text-caption text-graphite">no shadow</p>
            <p className="text-body">Workspace panels stay flat on a hairline.</p>
          </div>
        </div>
      </Section>

      <Section title="Spacing" note="A 4px base, giving 4, 8, 12, 16, 24, 32, 48.">
        <div className="flex flex-wrap items-end gap-3">
          {SPACING.map((s) => (
            <div key={s} className="flex flex-col items-center gap-2">
              <div className="bg-blueprint" style={{ width: s * 4, height: s * 4 }} />
              <span className="font-mono text-caption text-graphite">{s * 4}</span>
            </div>
          ))}
        </div>
      </Section>
    </main>
  );
}
