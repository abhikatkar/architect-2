import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeNext, siteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const base = siteUrl(request);

  const fail = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`);

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

  const next = safeNext(searchParams.get("next"));

  // First sign in: ask how they like to build before dropping them into the
  // product. A row exists for anyone who answered or skipped, so this asks once.
  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .maybeSingle();

  if (!profile) {
    return NextResponse.redirect(
      `${base}/onboarding?next=${encodeURIComponent(next)}`,
    );
  }

  return NextResponse.redirect(`${base}${next}`);
}
