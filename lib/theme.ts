import { cookies } from "next/headers";

export type ThemeChoice = "light" | "dark" | "system";

/** The visitor's explicit choice, or "system" when they have not made one. */
export async function currentTheme(): Promise<ThemeChoice> {
  const v = (await cookies()).get("theme")?.value;
  return v === "dark" || v === "light" ? v : "system";
}
