import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

const DIAGRAMS: Record<string, { title: string; blurb: string }> = {
  architecture: {
    title: "System architecture",
    blurb: "What runs, what is staged, and where the trust boundaries are.",
  },
  "agent-workflow": {
    title: "Agent workflow",
    blurb: "The four agents, and which kind of model each one runs on.",
  },
  "jev-call-sequence": {
    title: "Jev call sequence",
    blurb: "One press of Run this agent, end to end.",
  },
};

export function generateStaticParams() {
  return Object.keys(DIAGRAMS).map((slug) => ({ slug }));
}

export async function generateMetadata(props: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await props.params;
  const diagram = DIAGRAMS[slug];
  return {
    title: diagram ? diagram.title : "Diagram",
  };
}

/**
 * A diagram with a way back.
 *
 * The diagrams are generated artifacts whose bytes are recorded in a delivery
 * receipt (D42), so a link cannot be edited into them afterwards without making
 * that receipt false. Round 3 asked for a way back to the demo from a diagram,
 * so the link lives in a frame around the artifact instead of inside it. The
 * file itself is untouched and still reachable on its own URL.
 */
export default async function DiagramPage(props: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await props.params;
  const diagram = DIAGRAMS[slug];
  if (!diagram) notFound();

  return (
    <main className="flex min-h-dvh flex-col">
      <header className="flex flex-wrap items-center gap-x-4 gap-y-2 border-b border-rule px-4 py-2">
        <div className="min-w-0">
          <h1 className="truncate text-body font-semibold">{diagram.title}</h1>
          <p className="truncate text-caption text-graphite">{diagram.blurb}</p>
        </div>
        <nav className="ml-auto flex flex-wrap items-center gap-x-3 gap-y-1 text-caption">
          <Link href="/demo" className="text-blueprint underline">
            Back to the demo
          </Link>
          <Link href="/architecture" className="text-blueprint underline">
            All diagrams
          </Link>
          <a href={`/architecture/${slug}.html`} className="text-blueprint underline">
            Open on its own
          </a>
        </nav>
      </header>

      <iframe
        src={`/architecture/${slug}.html`}
        title={`${diagram.title} diagram`}
        className="min-h-0 w-full flex-1 border-0"
      />
    </main>
  );
}
