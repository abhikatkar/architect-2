import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeNext, siteUrl } from "@/lib/site-url";

/**
 * Starts Google sign-in from a plain form post.
 *
 * The provider URL is built on the server, so the button works before any
 * JavaScript has loaded. Doing this in the browser meant the first click was
 * dropped whenever it landed before hydration.
 */
export async function POST(request: NextRequest) {
  const base = siteUrl(request);
  const form = await request.formData();
  const next = safeNext(
    typeof form.get("next") === "string" ? (form.get("next") as string) : null,
  );

  // 303 turns the POST into a GET, so the browser does not resubmit on reload.
  const fail = (message: string) =>
    NextResponse.redirect(`${base}/login?error=${encodeURIComponent(message)}`, {
      status: 303,
    });

  if (!hasSupabaseEnv()) return fail("Supabase is not configured.");

  const callback = new URL("/auth/callback", base);
  callback.searchParams.set("next", next);

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: callback.toString(),
      // Return the URL instead of navigating. There is no browser here, and
      // this is what lets the PKCE verifier cookie ride on our response.
      skipBrowserRedirect: true,
    },
  });

  if (error) return fail(error.message);
  if (!data?.url) return fail("Could not start sign in.");

  return NextResponse.redirect(data.url, { status: 303 });
}
