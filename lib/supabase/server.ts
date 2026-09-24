import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Server Supabase client, backed by the request cookie store.
 *
 * Environment variables are read inside the factory rather than at module
 * scope, so importing this file can never fail a build that has no .env.local.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options);
            });
          } catch {
            // Server Components get a read only cookie store. The middleware
            // refreshes the session on every request, so losing the write here
            // is safe to ignore.
          }
        },
      },
    },
  );
}
