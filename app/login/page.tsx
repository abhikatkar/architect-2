import Link from "next/link";
import type { Metadata } from "next";
import { MarketingHeader } from "@/components/ui/marketing-header";
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
      <div className="mx-auto w-full max-w-[560px] min-w-0 px-4 py-6 sm:px-8">
        <MarketingHeader />
      </div>

      <main className="mx-auto flex w-full max-w-[560px] min-w-0 flex-1 flex-col justify-center gap-8 px-4 pt-8 pb-16 sm:px-8">
        <header className="min-w-0">
          <h1 className="text-display font-bold">Sign in</h1>
          <p className="mt-4 max-w-[52ch] text-lead text-graphite">
            Your projects are saved to your account. Everything else in this
            concept is simulated.
          </p>
        </header>

        {error ? (
          <p role="alert" className="rounded-panel border border-fault p-4 text-note text-fault">
            Sign in failed: {error}
          </p>
        ) : null}

        {configured ? null : (
          <p role="alert" className="rounded-panel border border-fault p-4 text-note text-fault">
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
            className="min-h-12 w-full rounded-pill bg-blueprint px-6 text-note font-medium text-paper disabled:opacity-50"
            disabled={!configured}
          >
            Continue with Google
          </button>
        </form>

        <div className="flex flex-wrap items-center gap-3 border-t border-rule pt-6">
          <span className="text-note text-graphite">Just looking?</span>
          <Link
            href="/demo"
            className="inline-flex min-h-12 items-center rounded-pill border border-ink px-6 text-note font-medium"
          >
            Try the demo, no account needed
          </Link>
        </div>

        <p className="flex flex-wrap items-center gap-x-5 gap-y-1 text-note text-graphite">
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
