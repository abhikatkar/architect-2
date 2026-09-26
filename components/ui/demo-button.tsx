import { DemoNote } from "./sheet";

/**
 * A confirm control for an action this demo does not perform.
 *
 * Round 4 found seven of these rendered as styled spans: "Deploy to
 * production", "Roll back to vN", "Connect and push", "Import", "Send invite",
 * the Marketplace toggle and the repository option. None could be focused, none
 * did anything, and none said why, so the only readable control in a sheet was
 * Close.
 *
 * They are buttons now. `aria-disabled` rather than `disabled`, because a
 * disabled button is removed from the tab order, and a keyboard user finding
 * nothing there learns less than one who reaches the control and is told what
 * it would do. The note beside it is the button's accessible description, so
 * "Demo action. Nothing is deployed" is read out with the label rather than
 * sitting near it visually and nowhere semantically.
 *
 * `type="button"` so it cannot submit anything, and no handler, so a press does
 * exactly what the note says it does: nothing.
 */
export function DemoButton({
  id,
  children,
  note,
  variant = "primary",
}: {
  /** Needed for the description association, and unique per screen. */
  id: string;
  children: React.ReactNode;
  /** What is not going to happen. Becomes the accessible description. */
  note: React.ReactNode;
  variant?: "primary" | "quiet";
}) {
  const noteId = `${id}-note`;
  return (
    <>
      <button
        type="button"
        id={id}
        aria-disabled="true"
        aria-describedby={noteId}
        className={`inline-flex min-h-11 cursor-not-allowed items-center rounded-input px-4 text-body ${
          variant === "primary"
            ? "bg-blueprint text-paper"
            : "border border-rule text-ink"
        }`}
      >
        {children}
      </button>
      <DemoNote id={noteId}>{note}</DemoNote>
    </>
  );
}

/**
 * A setting this demo shows but does not let you change.
 *
 * The Marketplace control was a chip reading "off" with no role at all, so
 * nothing announced it as a setting or said which way it was set. A switch with
 * `aria-checked` says both, and `aria-disabled` says it cannot be moved here.
 */
export function DemoSwitch({
  id,
  label,
  on,
  note,
}: {
  id: string;
  label: string;
  on: boolean;
  note: React.ReactNode;
}) {
  const noteId = `${id}-note`;
  return (
    <>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={on}
        aria-disabled="true"
        aria-describedby={noteId}
        className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-input border border-rule px-3 text-small"
      >
        <span className="rounded-input border border-rule px-2 py-0.5 text-caption">
          {on ? "on" : "off"}
        </span>
        <span>{label}</span>
      </button>
      <DemoNote id={noteId}>{note}</DemoNote>
    </>
  );
}
