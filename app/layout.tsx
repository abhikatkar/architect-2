import type { Metadata } from "next";
import { Instrument_Sans, JetBrains_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";

// Sans carries the whole interface. Mono is reserved for raw machine output,
// so the typeface itself tells the user which depth they are looking at.
const instrumentSans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

/*
  The theme switch, working before the page has hydrated.

  Measured: with the client component as the only fast path, a click landing
  before hydration fell through to the form post, and on a throttled connection
  the theme changed 5 to 6 seconds later, after a full navigation. Round 3
  reported that as a broken button and round 4 reported the first click as
  ignored 4 times in 5. Both were the same thing: correct, and far too slow to
  read as a response.

  So the fast path is registered from the document itself, in the capture phase,
  which is available as soon as this tag is parsed. It flips one attribute,
  which is all the theme is, and writes the cookie in the background. React
  hydrates later and takes over with identical behaviour.

  The form still posts with scripting off entirely, which is the real fallback
  and the reason this is a form at all. See D19, D27 and D61.
*/
const THEME_SCRIPT = `
document.addEventListener("click", function (event) {
  var button = event.target.closest && event.target.closest('form[data-theme-form] button[name="theme"]');
  if (!button) return;
  event.preventDefault();
  var value = button.value;
  var root = document.documentElement;
  if (value === "system") root.removeAttribute("data-theme");
  else root.setAttribute("data-theme", value);
  var form = button.closest("form");
  var next = form.querySelector('input[name="next"]');
  var body = new URLSearchParams({ theme: value, next: next ? next.value : "/" });
  fetch("/theme", { method: "POST", headers: { "x-theme-only": "1" }, body: body }).catch(function () {});
  var buttons = form.querySelectorAll('button[name="theme"]');
  for (var i = 0; i < buttons.length; i++) {
    buttons[i].setAttribute("aria-pressed", String(buttons[i].value === value));
  }
  // The toggle component listens for this and follows the document, because
  // this handler runs for every click, before and after hydration.
  window.dispatchEvent(new CustomEvent("architect:theme"));
}, true);
`;

/*
  What a shared link looks like.

  The icon, the apple icon and the link preview are app/icon.svg,
  app/apple-icon.png and app/opengraph-image.png, which the App Router finds by
  name, so there are no <link> tags to keep in sync. The two rasters are built
  from the same geometry as the SVG by scripts/make-brand-images.mjs. The
  default Next favicon is gone: shipping another project's mark on a submission
  about owning what you build would have been a poor first impression.

  metadataBase makes the preview URLs absolute, which is what a link unfurler
  needs. It follows the deployment rather than being written down, so a preview
  build advertises itself and not production.
*/
const SITE =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_ENV === "production"
    ? "https://architect-2-zeta.vercel.app"
    : process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");

const TITLE = "Architect 2.0";
const DESCRIPTION =
  "See it. Steer it. Own it. Ship it safely. A vibe-coding platform for agentic apps, for people who do not write code and the developers they hand the repo to.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE),
  title: {
    default: TITLE,
    // Every page names itself, and gets the product name after it.
    template: "%s | Architect 2.0",
  },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    siteName: TITLE,
    title: TITLE,
    description: DESCRIPTION,
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
  },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // No cookie means no data-theme, so prefers-color-scheme decides. See the
  // theme route for why this is a cookie rather than a class flipped in JS.
  const theme = (await cookies()).get("theme")?.value;
  const forced = theme === "dark" || theme === "light" ? theme : undefined;

  return (
    <html
      lang="en"
      data-theme={forced}
      /* The script above changes this attribute before React hydrates, which is
         the point of it, so React is told not to complain about the difference. */
      suppressHydrationWarning
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {/* First thing in the body, so the listener is registered before any
            control it handles has been parsed. */}
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        {children}
      </body>
    </html>
  );
}
