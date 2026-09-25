import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-url";

/**
 * Starts a build: records the status and sends the user to the running view.
 *
 * A form post, so the Build button works before hydration (D19). The build
 * itself is simulated, but the status it writes is a real row (D28).
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const base = siteUrl(request);

  const supabase = await createClient();
  // RLS scopes the update, so another user's project simply matches no row.
  const { error } = await supabase
    .from("projects")
    .update({ status: "building" })
    .eq("id", id);

  if (error) {
    return NextResponse.redirect(
      `${base}/app/p/${id}/plan?error=${encodeURIComponent(error.message)}`,
      { status: 303 },
    );
  }

  return NextResponse.redirect(`${base}/app/p/${id}?tab=app&build=running`, {
    status: 303,
  });
}
