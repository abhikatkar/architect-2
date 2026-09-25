import { NextResponse, type NextRequest } from "next/server";
import { runJevAgent } from "@/lib/jev";
import { isJevAgent } from "@/lib/jev/questions";
import { safeNext, siteUrl } from "@/lib/site-url";

/**
 * Runs one decision agent against Jev and returns to where you came from.
 *
 * A form post, so "Test this agent" works before hydration (D19). The result is
 * carried back in the URL rather than held in memory, so it is linkable like
 * every other workspace view (D25).
 *
 * Deliberately NOT under /app: the proxy guard protects everything at or below
 * that prefix, and this has to work for a signed-out visitor on /demo.
 */
export async function POST(request: NextRequest) {
  const base = siteUrl(request);
  const form = await request.formData();

  const agentId = String(form.get("agent") ?? "");
  const next = safeNext(
    typeof form.get("next") === "string" ? (form.get("next") as string) : null,
  );

  if (!isJevAgent(agentId)) {
    return NextResponse.redirect(`${base}${next}`, { status: 303 });
  }

  const raw = form.get("input");
  const customInput = typeof raw === "string" ? raw.trim().slice(0, 500) : null;

  // Vercel sets x-forwarded-for. Falls back to a constant locally, which means
  // one bucket in development rather than no limit at all.
  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

  const result = await runJevAgent(agentId, customInput, ip);

  const url = new URL(`${base}${next}`);
  url.searchParams.set("jev", agentId);
  url.searchParams.set("jevResult", encodeURIComponent(JSON.stringify(result)));

  return NextResponse.redirect(url.toString(), { status: 303 });
}
