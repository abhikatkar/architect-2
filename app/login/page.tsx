import { GoogleSignInButton } from "./google-sign-in-button";
import { hasSupabaseEnv } from "@/lib/supabase/env";

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function LoginPage(props: PageProps<"/login">) {
  const searchParams = await props.searchParams;
  const error = firstValue(searchParams.error);
  const next = firstValue(searchParams.next) ?? "/app";
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

      <GoogleSignInButton next={next} disabled={!configured} />
    </main>
  );
}
