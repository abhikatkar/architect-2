import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { hasSupabaseEnv } from "./env";

/** Everything at or below this prefix requires a signed-in user. */
const PROTECTED_PREFIX = "/app";

function isProtectedPath(pathname: string) {
  return (
    pathname === PROTECTED_PREFIX ||
    pathname.startsWith(`${PROTECTED_PREFIX}/`)
  );
}

function redirectToLogin(request: NextRequest) {
  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.search = "";
  url.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(url);
}

/**
 * Refreshes the Supabase session on every matched request and guards the
 * protected routes.
 */
export async function updateSession(request: NextRequest) {
  const protectedPath = isProtectedPath(request.nextUrl.pathname);

  // With no credentials there is no way to establish a session, so protected
  // routes deny rather than rendering as though the visitor were signed in.
  if (!hasSupabaseEnv()) {
    return protectedPath
      ? redirectToLogin(request)
      : NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  // Nothing may run between createServerClient and getUser. An await inserted
  // here drops the refreshed cookie and sessions start expiring at random.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (protectedPath && !user) {
    return redirectToLogin(request);
  }

  return supabaseResponse;
}
