import Link from "next/link";
import { SheetKeys } from "./sheet-keys";

/**
 * A consent or confirm sheet.
 *
 * The first overlay in this product, and it is still server rendered: it exists
 * only when its query parameter is present, and it closes through links that
 * remove that parameter. No client component decides whether it is open, so it
 * works before hydration and a sheet is a shareable link like every other view.
 *
 * The design system asks for a modal that becomes a full height bottom sheet on
 * phone with the confirm pinned. That is what this is: centred panel from sm
 * up, bottom sheet below, with the footer sticky so the confirm is always
 * reachable without scrolling to it.
 *
 * Focus returns to whatever opened it without any JavaScript, because the close
 * links carry a fragment pointing at the trigger's id. SheetKeys adds Escape,
 * initial focus, a tab trap, and the focus return that the fragment cannot do
 * on an Escape press, since the client router does not navigate to the anchor.
 */
export function Sheet({
  id,
  title,
  note,
  closeHref,
  returnTo,
  children,
  footer,
}: {
  id: string;
  title: string;
  note?: string;
  /** Removes the parameter that opened this. */
  closeHref: string;
  /** The id of the control that opened it, so focus can go back. */
  returnTo?: string;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  const dialogId = `sheet-${id}`;
  const headingId = `${dialogId}-title`;
  const back = returnTo ? `${closeHref}#${returnTo}` : closeHref;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      {/* The backdrop is a link, so tapping outside closes without JavaScript.
          Hidden from assistive tech: Close in the header does the same job. */}
      <Link
        href={back}
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 bg-ink/40"
      />

      <div
        id={dialogId}
        role="dialog"
        aria-modal="true"
        aria-labelledby={headingId}
        className="relative flex max-h-full w-full flex-col overflow-hidden rounded-t-overlay border border-rule bg-paper shadow-lg sm:max-w-2xl sm:rounded-overlay"
      >
        <div className="flex min-w-0 items-start gap-3 border-b border-rule p-4">
          <div className="min-w-0">
            <h2
              id={headingId}
              data-sheet-heading
              tabIndex={-1}
              className="text-lead font-semibold outline-none"
            >
              {title}
            </h2>
            {note ? (
              <p className="mt-1 max-w-[72ch] text-small text-graphite">{note}</p>
            ) : null}
          </div>
          <Link
            href={back}
            className="ml-auto inline-flex min-h-11 items-center rounded-input border border-rule px-3 text-caption"
          >
            Close
          </Link>
        </div>

        <div className="min-w-0 flex-1 overflow-y-auto p-4">{children}</div>

        {/* Pinned, so the confirm never scrolls out of reach on a phone. */}
        <div className="sticky bottom-0 flex min-w-0 flex-wrap items-center gap-3 border-t border-rule bg-paper p-4">
          {footer}
        </div>
      </div>

      <SheetKeys closeHref={back} dialogId={dialogId} returnTo={returnTo} />
    </div>
  );
}

/** The control that opens a sheet. Carries the id focus returns to. */
export function SheetTrigger({
  id,
  href,
  children,
  variant = "primary",
}: {
  id: string;
  href: string;
  children: React.ReactNode;
  variant?: "primary" | "quiet";
}) {
  return (
    <Link
      id={id}
      data-return-to={id}
      href={href}
      className={`inline-flex min-h-11 items-center rounded-input px-3 text-body ${
        variant === "primary"
          ? "bg-blueprint text-paper"
          : "border border-rule text-ink"
      }`}
    >
      {children}
    </Link>
  );
}

/**
 * Said next to every confirm, so nothing looks like it wrote something.
 *
 * Takes an id so a DemoButton can point its `aria-describedby` here, which is
 * what makes the note part of the control rather than text near it.
 */
export function DemoNote({
  id,
  children,
}: {
  id?: string;
  children: React.ReactNode;
}) {
  return (
    <span id={id} className="max-w-[72ch] text-caption text-graphite">
      {children}
    </span>
  );
}
