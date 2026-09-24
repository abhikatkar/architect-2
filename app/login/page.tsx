import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeNext } from "@/lib/site-url";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error = firstValue(searchParams.error);
  const next = safeNext(firstValue(searchParams.next));
  const configured = hasSupabaseEnv();

  return (
    <main className="p-8">
      <h1>Sign in</h1>

      {error ? <p role="alert">Sign in failed: {error}</p> : null}

      {configured ? null : (
        <p role="alert">
          Supabase is not configured. Copy .env.example to .env.local and fill
          both values.
        </p>
      )}

      {/*
        A real form post, handled entirely on the server. No client component
        and no onClick, so the first click works whether or not JavaScript has
        finished loading.
      */}
      <form action="/auth/signin" method="post">
        <input type="hidden" name="next" value={next} />
        <button
          type="submit"
          className="border px-4 py-2 disabled:opacity-50"
          disabled={!configured}
        >
          Continue with Google
        </button>
      </form>
    </main>
  );
}
