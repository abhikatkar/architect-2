import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Depth = "guided" | "details";

export type Profile = {
  user_id: string;
  depth: Depth;
  created_at: string;
  updated_at: string;
};

export function parseDepthChoice(value: FormDataEntryValue | null): Depth {
  return value === "details" ? "details" : "guided";
}

/**
 * The signed-in user's profile, or null if they have not onboarded.
 *
 * No user filter here, for the same reason as listProjects: row level security
 * is the only thing deciding visibility, so a missing policy shows up as
 * another user's row appearing rather than hiding behind a where clause (D24).
 */
export async function getProfile(): Promise<Profile | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase.from("profiles").select("*").maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}

/** True when the user asked to see code and config by default. */
export async function prefersDetails(): Promise<boolean> {
  try {
    return (await getProfile())?.depth === "details";
  } catch {
    // A preference is not worth failing a page render over.
    return false;
  }
}

export async function saveDepth(depth: Depth): Promise<void> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, depth }, { onConflict: "user_id" });

  if (error) throw new Error(error.message);
}
