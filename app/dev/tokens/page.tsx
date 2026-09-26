import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tokens",
  robots: { index: false, follow: false },
};

const COLORS = [
  { name: "paper", cls: "bg-paper", light: "#F5F7F6", dark: "#0E1A2B", meaning: "Canvas. Dark mode is blueprint navy, not black" },
  { name: "ink", cls: "bg-ink", light: "#16202E", dark: "#E8EEF6", meaning: "Primary text" },
  { name: "graphite", cls: "bg-graphite", light: "#586474", dark: "#9AA8BA", meaning: "Secondary text" },
  { name: "rule", cls: "bg-rule", light: "#D9DFE3", dark: "#22324A", meaning: "Borders and dividers" },
  { name: "blueprint", cls: "bg-blueprint", light: "#1D4ED8", dark: "#7FA6FF", meaning: "Primary action, selection, the drawing" },
  { name: "cost", cls: "bg-cost", light: "#A16207", dark: "#E3B35C", meaning: "Money only: estimates, meters, charges" },
  { name: "live", cls: "bg-live", light: "#15803D", dark: "#5CCB8A", meaning: "What is live in production, passing checks" },
  { name: "fault", cls: "bg-fault", light: "#B42318", dark: "#FF8A7A", meaning: "Errors and stopped loops" },
];

const TYPE = [
  { name: "display", px: 34, cls: "text-display", lh: "1.2" },
  { name: "heading", px: 26, cls: "text-heading", lh: "1.2" },
  { name: "title", px: 20, cls: "text-title", lh: "1.2" },
  { name: "lead", px: 16, cls: "text-lead", lh: "1.5" },
  { name: "body", px: 14, cls: "text-body", lh: "1.5" },
  { name: "small", px: 13, cls: "text-small", lh: "1.5" },
  { name: "caption", px: 12, cls: "text-caption", lh: "1.5" },
];

const RADIUS = [
  { name: "input", cls: "rounded-input", px: "4px", use: "Inputs and chips" },
  { name: "panel", cls: "rounded-panel", px: "8px", use: "Panels" },
  { name: "overlay", cls: "rounded-overlay", px: "12px", use: "Modals and sheets" },
];

const SPACING = [1, 2, 3, 4, 6, 8, 12];

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
        title="Type scale"
        note="Instrument Sans for the whole interface. Line height 1.5 for body, 1.2 for headings. Sentence case everywhere, and no line longer than 72 characters."
      >
        <ul className="flex flex-col gap-4">
          {TYPE.map((t) => (
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

      <Section title="Radius" note="Radius follows hierarchy. Never one value for everything.">
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
