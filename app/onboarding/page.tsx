import Link from "next/link";
import { redirect } from "next/navigation";
import { MarketingHeader } from "@/components/ui/marketing-header";
import { createClient } from "@/lib/supabase/server";
import { safeNext } from "@/lib/site-url";

const CHOICES = [
  {
    value: "guided",
    title: "Describe it and let Architect handle the details",
    blurb:
      "Plain language, one clear next action, and the cost before anything runs. You can open any layer whenever you want to.",
  },
  {
    value: "details",
    title: "Show me the code and config",
    blurb:
      "Agent configuration, diffs, logs and parameters open by default. Nothing is hidden behind a simpler view.",
  },
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function OnboardingPage(props: PageProps<"/onboarding">) {
  const searchParams = await props.searchParams;
  const error = firstValue(searchParams.error);
  const next = safeNext(firstValue(searchParams.next));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-dvh flex-col bg-paper text-ink">
      <div className="mx-auto w-full max-w-[760px] min-w-0 px-4 py-6 sm:px-8">
        <MarketingHeader />
      </div>

      <main className="mx-auto flex w-full max-w-[760px] min-w-0 flex-1 flex-col gap-8 px-4 pt-8 pb-16 sm:px-8">
        <header className="min-w-0">
          <h1 className="max-w-[18ch] text-display font-bold">
            How do you like to build?
          </h1>
          <p className="mt-4 max-w-[60ch] text-lead text-graphite">
            This only sets a starting point. Every screen can go deeper or
            simpler whenever you want, and you can change this later in
            settings.
          </p>
        </header>

        {error ? (
          <p role="alert" className="rounded-panel border border-fault p-4 text-note text-fault">
            {error}
          </p>
        ) : null}

        {/* Form posts, so both choices work before hydration (D19). */}
        <div className="flex min-w-0 flex-col gap-4">
          {CHOICES.map((c) => (
            <form key={c.value} action="/onboarding/save" method="post">
              <input type="hidden" name="depth" value={c.value} />
              <input type="hidden" name="next" value={next} />
              <button
                type="submit"
                className="flex w-full min-w-0 flex-col gap-2 rounded-card border border-rule-strong bg-paper p-6 text-left shadow-soft"
              >
                <span className="text-subhead font-semibold">{c.title}</span>
                <span className="max-w-[64ch] text-note text-graphite">
                  {c.blurb}
                </span>
              </button>
            </form>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-5">
          {/* Skip still writes a row, so nobody is asked this twice. */}
          <form action="/onboarding/save" method="post">
            <input type="hidden" name="depth" value="guided" />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="min-h-12 rounded-pill border border-ink px-6 text-note font-medium"
            >
              Skip for now
            </button>
          </form>
          <Link href="/demo" className="text-note text-blueprint underline">
            Or read a finished project first
          </Link>
        </div>
      </main>
    </div>
  );
}
