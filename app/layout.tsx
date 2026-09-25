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

export const metadata: Metadata = {
  title: "Architect 2.0",
  description:
    "A vibe-coding platform for building agentic applications, for builders and developers alike.",
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
      className={`${instrumentSans.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-paper text-ink">
        {children}
      </body>
    </html>
  );
}
