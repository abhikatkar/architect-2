import Link from "next/link";

export default function HomePage() {
  return (
    <main className="p-8">
      <h1>Architect 2.0</h1>
      <p>
        A vibe-coding platform for building agentic applications. Placeholder
        page, replaced once the design system lands.
      </p>
      <Link href="/login">Sign in</Link>
    </main>
  );
}
