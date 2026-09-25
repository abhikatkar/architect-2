import { NextResponse, type NextRequest } from "next/server";
import { safeNext, siteUrl } from "@/lib/site-url";

export const THEME_COOKIE = "theme";

/**
 * Switches theme by setting a cookie and re-rendering on the server.
 *
 * A form post rather than a class flipped in the browser, so it works before
 * hydration and survives a reload, consistent with D19 and D25. With no cookie
 * set, nothing is forced and prefers-color-scheme decides, which is what a
 * visitor who never touches this keeps.
 */
export async function POST(request: NextRequest) {
  const base = siteUrl(request);
  const form = await request.formData();

  const raw = form.get("theme");
  const theme = raw === "dark" || raw === "light" ? raw : "system";
  const next = safeNext(
    typeof form.get("next") === "string" ? (form.get("next") as string) : null,
  );

  const response = NextResponse.redirect(`${base}${next}`, { status: 303 });

  if (theme === "system") {
    response.cookies.delete(THEME_COOKIE);
  } else {
    response.cookies.set(THEME_COOKIE, theme, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }

  return response;
}
