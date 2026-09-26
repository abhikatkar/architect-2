"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Keyboard and focus behaviour for a sheet. Enhancement only.
 *
 * The sheet works with no JavaScript: it is rendered by the server when its
 * parameter is present, the backdrop and the Close control are links that
 * remove the parameter, and the Close link carries a fragment pointing back at
 * the trigger, so focus returns there on its own.
 *
 * What this adds when JavaScript runs, and only that:
 *
 * - Escape closes the sheet.
 * - Focus moves to the sheet's heading when it opens.
 * - Tab is trapped inside the sheet while it is open.
 *
 * The theme toggle set this precedent: the form still posts without
 * JavaScript, and the client version only makes it faster. Works without it,
 * better with it. See D27 and D51.
 */
export function SheetKeys({
  closeHref,
  dialogId,
}: {
  closeHref: string;
  dialogId: string;
}) {
  const router = useRouter();

  useEffect(() => {
    const found = document.getElementById(dialogId);
    if (!found) return;
    // Bound after the null check so the handlers below close over a value
    // TypeScript can see is present.
    const dialog: HTMLElement = found;

    const heading = dialog.querySelector<HTMLElement>("[data-sheet-heading]");
    heading?.focus();

    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        router.push(closeHref);
        return;
      }
      if (event.key !== "Tab") return;

      const items = focusable();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      // Wrap at both ends, and pull focus back in if it has escaped the sheet.
      if (event.shiftKey && (active === first || !dialog.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !dialog.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeHref, dialogId, router]);

  return null;
}
