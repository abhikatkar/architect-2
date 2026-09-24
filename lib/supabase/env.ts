/**
 * Whether Supabase credentials are present.
 *
 * The app is scaffolded before a Supabase project exists, so every entry point
 * has to behave predictably without credentials. Protected routes fail closed
 * when this returns false.
 */
export function hasSupabaseEnv() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}
