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
 * - Focus returns to the trigger after Escape, which the fragment cannot do,
 *   because the client router changes the URL without navigating to the anchor.
 *   Round 4 measured the active element as BODY after Escape, while D51 claimed
 *   otherwise, so the claim was true of Close and false of Escape.
 * - Tab is trapped inside the sheet while it is open.
 *
 * The theme toggle set this precedent: the form still posts without
 * JavaScript, and the client version only makes it faster. Works without it,
 * better with it. See D27 and D51.
 */
export function SheetKeys({
  closeHref,
  dialogId,
  returnTo,
}: {
  closeHref: string;
  dialogId: string;
  /** The trigger to focus once the sheet has closed, if it named itself. */
  returnTo?: string;
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

    /*
      Put focus back on the control that opened the sheet.

      The target is looked up by data attribute rather than by id, because the
      rollback trigger exists twice, once in the phone list and once in the
      table, and only one of them is visible at a time. The id is the fallback,
      since it is what the no-JavaScript fragment uses.

      It focuses twice on purpose: once straight away, so focus is never dropped
      to the document, and again once the dialog has left the page, because the
      route change re-renders everything between those two moments and measuring
      showed focus landing on BODY when only the early attempt was made.
    */
    let frame = 0;
    function trigger(): HTMLElement | null {
      if (!returnTo) return null;
      const byData = Array.from(
        document.querySelectorAll<HTMLElement>(`[data-return-to="${returnTo}"]`),
      ).find((el) => el.offsetParent !== null);
      const byId = document.getElementById(returnTo);
      return byData ?? (byId?.offsetParent ? byId : null);
    }

    function focusTrigger() {
      if (!returnTo) return;
      trigger()?.focus();
      let frames = 0;
      const tick = () => {
        // Up to two seconds of frames, so a slow navigation still gets the
        // second attempt rather than being cut off mid transition.
        if (document.getElementById(dialogId) && frames++ < 120) {
          frame = requestAnimationFrame(tick);
          return;
        }
        const target = trigger();
        if (target && document.activeElement !== target) target.focus();
      };
      frame = requestAnimationFrame(tick);
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        event.preventDefault();
        router.push(closeHref);
        focusTrigger();
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
    return () => {
      document.removeEventListener("keydown", onKeyDown);
      cancelAnimationFrame(frame);
    };
  }, [closeHref, dialogId, returnTo, router]);

  return null;
}
