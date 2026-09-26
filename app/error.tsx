"use client";

import Link from "next/link";

/**
 * React requires an error boundary to be a client component, which is a
 * framework constraint rather than a widening of D27. It holds no state and
 * runs no timer: the one interactive control calls the reset function React
 * hands it, and there is a plain link beside it for when JavaScript is not
 * running.
 */
export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[600px] min-w-0 flex-1 flex-col justify-center gap-4 px-4 py-16 sm:px-6">
      <p className="font-mono text-caption text-graphite">Error</p>
      <h1 className="text-heading font-bold">This screen could not load</h1>
      <p className="max-w-[72ch] text-body text-graphite">
        The problem is on our side. Your work is saved and nothing was charged.
        Trying again usually resolves it.
      </p>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="min-h-11 rounded-input bg-blueprint px-4 text-body text-paper"
        >
          Try again
        </button>
        <Link href="/" className="text-body text-blueprint underline">
          Back to the start
        </Link>
      </div>

      {error.digest ? (
        <p className="font-mono text-caption text-graphite">
          Reference {error.digest}
        </p>
      ) : null}
    </main>
  );
}
