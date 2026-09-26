"use client";

import { useState } from "react";

const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
] as const;

type Choice = (typeof OPTIONS)[number]["value"];

/**
 * Theme control.
 *
 * Still a form post, so it works with no JavaScript (D19): the button submits
 * to /theme, the cookie is set, and the page re-renders. That path is the
 * fallback, not the fast path.
 *
 * With JavaScript, the click flips `data-theme` on the document immediately and
 * sends the cookie in the background. Round 3 measured the server round trip at
 * 4 to 6 seconds with no pending state, which reads as a broken button, and a
 * reviewer clicked 2 to 3 times before it moved. The theme is CSS keyed off one
 * attribute, so there is no reason to wait for a server to change it.
 *
 * "Auto" clears the cookie and hands the decision back to prefers-color-scheme,
 * which is what a visitor who never touches this keeps.
 */
export function ThemeToggle({
  current,
  next,
}: {
  current: Choice;
  next: string;
}) {
  // Seeded from the server so the first paint matches, then owned here. After
  // a click this is the truth and the cookie is being made to agree with it.
  const [choice, setChoice] = useState<Choice>(current);

  function apply(value: Choice) {
    const root = document.documentElement;
    if (value === "system") root.removeAttribute("data-theme");
    else root.setAttribute("data-theme", value);
    setChoice(value);

    // Persistence only. The header tells the route to answer 204 instead of
    // redirecting, so nothing navigates and a slow reply cannot be felt.
    void fetch("/theme", {
      method: "POST",
      headers: { "x-theme-only": "1" },
      body: new URLSearchParams({ theme: value, next }),
    }).catch(() => {
      // The attribute is already applied. A failed write means the choice does
      // not survive a reload, which is better than blocking on it.
    });
  }

  return (
    <form
      action="/theme"
      method="post"
      className="flex items-center gap-0.5 rounded-input border border-rule p-0.5"
      onSubmit={(event) => {
        const submitter = (event.nativeEvent as SubmitEvent)
          .submitter as HTMLButtonElement | null;
        const value = submitter?.value as Choice | undefined;
        if (!value) return; // Let the browser post it the ordinary way.
        event.preventDefault();
        apply(value);
      }}
    >
      <input type="hidden" name="next" value={next} />
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="submit"
          name="theme"
          value={o.value}
          aria-pressed={choice === o.value}
          className={`min-h-9 rounded-input px-2 text-caption ${
            choice === o.value ? "bg-blueprint text-paper" : "text-graphite"
          }`}
        >
          {o.label}
        </button>
      ))}
    </form>
  );
}
