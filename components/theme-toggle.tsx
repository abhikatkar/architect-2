const OPTIONS = [
  { value: "light", label: "Light" },
  { value: "dark", label: "Dark" },
  { value: "system", label: "Auto" },
] as const;

/**
 * Theme control.
 *
 * A form post, so it works with no JavaScript (D19). "Auto" clears the cookie
 * and hands the decision back to prefers-color-scheme, which is the default a
 * visitor arrives with. Without this control a reviewer on a light-mode laptop
 * could never see the dark theme, which is what the cold review ran into.
 */
export function ThemeToggle({
  current,
  next,
}: {
  current: "light" | "dark" | "system";
  next: string;
}) {
  return (
    <form
      action="/theme"
      method="post"
      className="flex items-center gap-0.5 rounded-input border border-rule p-0.5"
    >
      <input type="hidden" name="next" value={next} />
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="submit"
          name="theme"
          value={o.value}
          aria-pressed={current === o.value}
          className={`min-h-9 rounded-input px-2 text-caption ${
            current === o.value ? "bg-blueprint text-paper" : "text-graphite"
          }`}
        >
          {o.label}
        </button>
      ))}
    </form>
  );
}
