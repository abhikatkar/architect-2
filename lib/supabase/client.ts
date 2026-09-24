import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client.
 *
 * Environment variables are read inside the factory rather than at module
 * scope, so importing this file can never fail a build that has no .env.local.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
