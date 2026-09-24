import { createClient } from "@/lib/supabase/server";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export type Project = {
  id: string;
  user_id: string;
  name: string;
  prompt: string | null;
  status: "draft" | "building" | "built" | "deployed";
  created_at: string;
  updated_at: string;
};

/**
 * The signed-in user's projects, newest first.
 *
 * No user filter is applied here on purpose. Row level security scopes the
 * result to auth.uid(), so the policy is the only thing deciding visibility and
 * a mistake in this file cannot widen it.
 */
export async function listProjects(): Promise<Project[]> {
  if (!hasSupabaseEnv()) return [];

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) throw new Error(error.message);
  return data ?? [];
}

/** Derives a short project name from the first line of the prompt. */
export function nameFromPrompt(prompt: string) {
  const firstLine = prompt.trim().split("\n")[0].trim();
  if (!firstLine) return "Untitled project";
  const clipped = firstLine.length > 60 ? `${firstLine.slice(0, 57)}...` : firstLine;
  return clipped.charAt(0).toUpperCase() + clipped.slice(1);
}

export async function createProject(prompt: string): Promise<Project> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Not signed in.");

  const { data, error } = await supabase
    .from("projects")
    .insert({ user_id: user.id, name: nameFromPrompt(prompt), prompt })
    .select()
    .single();

  if (error) throw new Error(error.message);
  return data;
}

export async function getProject(id: string): Promise<Project | null> {
  if (!hasSupabaseEnv()) return null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) throw new Error(error.message);
  return data;
}
