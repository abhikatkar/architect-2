import { NextResponse, type NextRequest } from "next/server";
import { parseDepthChoice, saveDepth } from "@/lib/profiles";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { safeNext, siteUrl } from "@/lib/site-url";

/**
 * Records the onboarding choice.
 *
 * Skip posts here too, with the guided default, so a user who skipped is not
 * asked again. That is what "skippable" has to mean, otherwise the screen
 * returns on every sign in.
 */
export async function POST(request: NextRequest) {
  const base = siteUrl(request);
  const form = await request.formData();
  const next = safeNext(
    typeof form.get("next") === "string" ? (form.get("next") as string) : null,
  );

  if (!hasSupabaseEnv()) {
    return NextResponse.redirect(`${base}${next}`, { status: 303 });
  }

  try {
    await saveDepth(parseDepthChoice(form.get("depth")));
  } catch (cause) {
    const message = cause instanceof Error ? cause.message : "Could not save that.";
    return NextResponse.redirect(
      `${base}/onboarding?error=${encodeURIComponent(message)}`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(`${base}${next}`, { status: 303 });
}
