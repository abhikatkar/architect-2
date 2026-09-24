import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

/** Rejects absolute URLs, so the callback cannot be used as an open redirect. */
function safeNext(next: string | null) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  // On Vercel the deployment sits behind a proxy, so the forwarded host is the
  // address the user actually typed.
  const forwardedHost = request.headers.get("x-forwarded-host");
  const base =
    process.env.NODE_ENV === "development" || !forwardedHost
      ? origin
      : `https://${forwardedHost}`;

  const fail = (message: string) =>
    NextResponse.redirect(
      `${base}/login?error=${encodeURIComponent(message)}`,
    );

  // Supabase sends the user back here with an error when consent is denied.
  const providerError =
    searchParams.get("error_description") ?? searchParams.get("error");
  if (providerError) return fail(providerError);

  if (!hasSupabaseEnv()) return fail("Supabase is not configured.");

  const code = searchParams.get("code");
  if (!code) return fail("Missing authorization code.");

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) return fail(error.message);

  return NextResponse.redirect(`${base}${safeNext(searchParams.get("next"))}`);
}
