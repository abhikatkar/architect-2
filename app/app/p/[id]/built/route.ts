import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { siteUrl } from "@/lib/site-url";

/**
 * Records a finished build.
 *
 * Backs both paths: the hidden form the animation submits when it completes,
 * and the visible "Finish build" control shown when JavaScript never runs.
 * One handler, so the two cannot drift.
 */
export async function POST(
  request: NextRequest,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const base = siteUrl(request);

  const supabase = await createClient();
  await supabase.from("projects").update({ status: "built" }).eq("id", id);

  return NextResponse.redirect(`${base}/app/p/${id}?tab=app&build=done`, {
    status: 303,
  });
}
