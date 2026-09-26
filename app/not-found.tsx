import Link from "next/link";

/**
 * Plain language, and exactly one next action, per the writing rules.
 * No "something went wrong", no code, no apology paragraph.
 */
export default function NotFound() {
  return (
    <main className="mx-auto flex w-full max-w-[600px] min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-16 sm:px-6">
      <p className="font-mono text-caption text-graphite">404</p>
      <h1 className="text-heading font-bold">That page is not here</h1>
      <p className="max-w-[72ch] text-body text-graphite">
        The link may be old, or the project may belong to a different account.
        Nothing was changed and nothing was charged.
      </p>
      <Link
        href="/demo"
        className="inline-flex min-h-11 items-center self-start rounded-input bg-blueprint px-4 text-body text-paper"
      >
        Open the demo project
      </Link>
      <Link href="/" className="self-start text-body text-blueprint underline">
        Back to the start
      </Link>
    </main>
  );
}
