import type { NextRequest } from "next/server";

/**
 * The address the visitor actually used.
 *
 * On Vercel the app runs behind a proxy, so the request origin is the internal
 * one and the forwarded host is what the browser asked for. OAuth redirects
 * have to point at the latter or the user lands on the wrong hostname.
 */
export function siteUrl(request: NextRequest) {
  const { origin } = new URL(request.url);
  const forwardedHost = request.headers.get("x-forwarded-host");

  if (process.env.NODE_ENV === "development" || !forwardedHost) return origin;

  const proto = request.headers.get("x-forwarded-proto") ?? "https";
  return `${proto}://${forwardedHost}`;
}

/**
 * Rejects absolute URLs, so a redirect target taken from user input cannot be
 * used to bounce someone off the site.
 */
export function safeNext(next: string | null | undefined) {
  if (!next || !next.startsWith("/") || next.startsWith("//")) return "/app";
  return next;
}
