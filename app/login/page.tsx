import Link from "next/link";
import type { Metadata } from "next";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/site-url";

// Every other page names itself. Without this one, a tab or a bookmark for the
// sign-in page is indistinguishable from the landing page.
export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in with Google to create a project.",
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error = firstValue(searchParams.error);
  const next = safeNext(firstValue(searchParams.next));
  const configured = hasSupabaseEnv();

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <main className="mx-auto flex w-full max-w-[520px] min-w-0 flex-1 flex-col justify-center gap-6 px-4 py-12 sm:px-6">
        <header className="min-w-0">
          <Link href="/" className="font-mono text-caption text-graphite">
            Architect 2.0
          </Link>
          <h1 className="mt-3 text-heading font-semibold">Sign in</h1>
          <p className="mt-2 max-w-[72ch] text-body text-graphite">
            Your projects are saved to your account. Everything else in this
            concept is simulated.
          </p>
        </header>

        {error ? (
          <p role="alert" className="rounded-panel border border-fault p-3 text-body text-fault">
            Sign in failed: {error}
          </p>
        ) : null}

        {configured ? null : (
          <p role="alert" className="rounded-panel border border-fault p-3 text-body text-fault">
            Supabase is not configured. Copy .env.example to .env.local and fill
            both values.
          </p>
        )}

        {/*
          A real form post, handled entirely on the server. No client component
          and no onClick, so the first click works whether or not JavaScript has
          finished loading. This is D19 and it must stay this way.
        */}
        <form action="/auth/signin" method="post" className="min-w-0">
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="min-h-11 w-full rounded-input bg-blueprint px-4 text-lead text-paper disabled:opacity-50"
            disabled={!configured}
          >
            Continue with Google
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-2 border-t border-rule pt-4">
          <span className="text-body text-graphite">Just looking?</span>
          <Link
            href="/demo"
            className="inline-flex min-h-11 items-center rounded-input border border-rule px-4 text-body"
          >
            Try the demo, no account needed
          </Link>
        </div>

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-caption text-graphite">
          <span>Signing in stores your name, email and picture.</span>
          <Link href="/privacy" className="text-blueprint underline">
            What is stored
          </Link>
          <Link href="/terms" className="text-blueprint underline">
            Terms
          </Link>
        </p>
      </main>
    </div>
  );
}
