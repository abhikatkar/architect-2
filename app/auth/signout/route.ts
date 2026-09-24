import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export async function POST(request: NextRequest) {
  if (hasSupabaseEnv()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  // 303 turns the POST into a GET, so the browser does not resubmit on reload.
  return NextResponse.redirect(new URL("/", request.url), { status: 303 });
}
