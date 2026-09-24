import { NextResponse, type NextRequest } from "next/server";
import { createProject } from "@/lib/projects";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { siteUrl } from "@/lib/site-url";

/**
 * Creates a project from the Home prompt box.
 *
 * A form post rather than a client call, so the button works before hydration.
 * This is the one write path that exercises the real database.
 */
export async function POST(request: NextRequest) {
  const base = siteUrl(request);

  const fail = (message: string) =>
    NextResponse.redirect(`${base}/app?error=${encodeURIComponent(message)}`, {
      status: 303,
    });

  if (!hasSupabaseEnv()) return fail("Supabase is not configured.");

  const form = await request.formData();
  const raw = form.get("prompt");
  const prompt = typeof raw === "string" ? raw.trim() : "";

  if (!prompt) return fail("Describe what you want to build first.");
  if (prompt.length > 2000) return fail("That prompt is too long.");

  try {
    const project = await createProject(prompt);
    return NextResponse.redirect(`${base}/app/p/${project.id}`, { status: 303 });
  } catch (cause) {
    return fail(cause instanceof Error ? cause.message : "Could not create the project.");
  }
}
