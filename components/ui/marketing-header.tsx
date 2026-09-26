import Link from "next/link";
import { Mark } from "./mark";

/**
 * The lockup at the top of every marketing surface.
 *
 * One component rather than the same six lines on five pages, because the five
 * had already drifted: three said "Architect 2.0" in mono at 12px, one made it
 * a link home and two did not. The mark plus the name, always the same size,
 * always going home.
 *
 * `right` takes whatever the page puts opposite it, which today is the theme
 * toggle on the landing page and nothing anywhere else.
 */
export function MarketingHeader({ right }: { right?: React.ReactNode }) {
  return (
    <header className="flex w-full min-w-0 items-center gap-4">
      <Link href="/" className="flex min-w-0 items-center gap-2.5">
        <Mark className="h-8 w-8 shrink-0" />
        <span className="truncate text-subhead font-semibold">Architect 2.0</span>
      </Link>
      {right ? <span className="ml-auto shrink-0">{right}</span> : null}
    </header>
  );
}
