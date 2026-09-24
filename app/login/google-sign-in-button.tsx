"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton({
  next,
  disabled,
}: {
  next: string;
  disabled?: boolean;
}) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function signIn() {
    setPending(true);
    setError(null);

    try {
      const callback = new URL("/auth/callback", window.location.origin);
      callback.searchParams.set("next", next);

      const { error } = await createClient().auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: callback.toString() },
      });
      if (error) throw error;
      // On success the browser leaves for Google, so pending stays true.
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Could not start sign in.",
      );
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={signIn}
        disabled={pending || disabled}
        className="border px-4 py-2 disabled:opacity-50"
      >
        {pending ? "Redirecting..." : "Continue with Google"}
      </button>
      {error ? <p role="alert">{error}</p> : null}
    </div>
  );
}
