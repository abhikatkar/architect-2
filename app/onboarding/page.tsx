import Link from "next/link";
import { redirect } from "next/navigation";
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
    <main className="mx-auto flex w-full max-w-[720px] min-w-0 flex-col gap-6 px-4 py-10 sm:px-6">
      <header className="min-w-0">
        <h1 className="text-heading font-semibold">How do you like to build?</h1>
        <p className="mt-2 max-w-[72ch] text-body text-graphite">
          This only sets a starting point. Every screen can go deeper or simpler
          whenever you want, and you can change this later in settings.
        </p>
      </header>

      {error ? (
        <p role="alert" className="rounded-panel border border-fault p-3 text-body text-fault">
          {error}
        </p>
      ) : null}

      {/* Form posts, so both choices work before hydration (D19). */}
      <div className="flex min-w-0 flex-col gap-3">
        {CHOICES.map((c) => (
          <form key={c.value} action="/onboarding/save" method="post">
            <input type="hidden" name="depth" value={c.value} />
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="flex w-full min-w-0 flex-col gap-1 rounded-panel border border-rule p-4 text-left"
            >
              <span className="text-lead font-medium">{c.title}</span>
              <span className="max-w-[72ch] text-small text-graphite">{c.blurb}</span>
            </button>
          </form>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        {/* Skip still writes a row, so nobody is asked this twice. */}
        <form action="/onboarding/save" method="post">
          <input type="hidden" name="depth" value="guided" />
          <input type="hidden" name="next" value={next} />
          <button
            type="submit"
            className="min-h-11 rounded-input border border-rule px-4 text-body text-graphite"
          >
            Skip for now
          </button>
        </form>
        <Link href="/demo" className="text-body text-blueprint underline">
          Or read a finished project first
        </Link>
      </div>
    </main>
  );
}
