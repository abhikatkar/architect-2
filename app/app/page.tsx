import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { listProjects } from "@/lib/projects";
import { DEMO_PROJECT } from "@/lib/seed/northwind";

const TEMPLATES = [
  {
    title: "Customer support agent",
    blurb: "Answers from your help center, escalates when unsure.",
    prompt:
      "Build a customer support agent that answers from our help center and escalates to a human when it is not confident, with an admin dashboard of conversations by status.",
  },
  {
    title: "Research assistant",
    blurb: "Reads your documents and answers with citations.",
    prompt:
      "Build a research assistant that answers questions from an uploaded document set and always cites the source passage.",
  },
  {
    title: "Onboarding concierge",
    blurb: "Walks a new customer through setup, hands off when stuck.",
    prompt:
      "Build an onboarding concierge that guides a new customer through account setup step by step and hands off to a human when it cannot resolve a step.",
  },
];

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
  });
}

export default async function HomePage(props: PageProps<"/app">) {
  const searchParams = await props.searchParams;
  const error = firstValue(searchParams.error);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Google puts it under one of two keys depending on the provider response.
  const meta = user.user_metadata ?? {};
  const avatar =
    typeof meta.avatar_url === "string"
      ? meta.avatar_url
      : typeof meta.picture === "string"
        ? meta.picture
        : null;

  const projects = await listProjects();

  return (
    <main className="mx-auto flex w-full max-w-[1100px] min-w-0 flex-col gap-8 px-4 py-8 sm:px-6">
      <header className="flex flex-wrap items-start gap-3">
        <div className="min-w-0">
          <h1 className="text-heading font-semibold">What should we build?</h1>
          <p className="mt-1 text-body text-graphite">
            Describe it in your own words. You will see the plan and the cost
            before anything runs.
          </p>
        </div>
        {/*
          Who is signed in, shown rather than assumed.

          Sign-in is one of the two things in this product that are actually
          real, and until now the only evidence it had worked was that you were
          not on the login page. The email comes from the session, and the
          picture from the Google account, which is what the privacy page says
          is stored.
        */}
        <div className="ml-auto flex flex-wrap items-center gap-3">
          <span className="flex min-w-0 items-center gap-2">
            {avatar ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={avatar}
                alt=""
                width={28}
                height={28}
                className="size-7 flex-none rounded-full border border-rule"
              />
            ) : (
              <span
                aria-hidden="true"
                className="flex size-7 flex-none items-center justify-center rounded-full border border-rule text-caption text-graphite"
              >
                {(user.email ?? "?").slice(0, 1).toUpperCase()}
              </span>
            )}
            <span className="min-w-0">
              <span className="block text-caption text-graphite">Signed in as</span>
              <span className="block truncate text-small">{user.email}</span>
            </span>
          </span>
          <form action="/auth/signout" method="post">
            <button
              type="submit"
              className="min-h-11 rounded-input border border-rule-strong px-3 text-body text-graphite"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      {error ? (
        <p role="alert" className="rounded-panel border border-fault p-3 text-body text-fault">
          {error}
        </p>
      ) : null}

      {/* A form post, so the prompt box works before hydration. */}
      <form action="/app/projects" method="post" className="flex flex-col gap-2">
        <label htmlFor="prompt" className="sr-only">
          What should we build?
        </label>
        <textarea
          id="prompt"
          name="prompt"
          rows={3}
          required
          autoFocus
          placeholder="A support agent that answers billing questions from our help center..."
          className="w-full resize-none rounded-panel border border-rule-strong bg-paper p-4 text-body placeholder:text-graphite"
        />
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="submit"
            className="min-h-11 rounded-input bg-blueprint px-4 text-body text-paper"
          >
            Start a project
          </button>
          <span className="text-caption text-graphite">
            {DEMO_PROJECT.copy.firstBuildEstimate}
          </span>
          {/* Removed in an earlier slice because /app/import did not exist yet,
              and a visible link to a 404 is a bug. The route exists now. */}
          <Link
            href="/app/import"
            className="ml-auto text-body text-blueprint underline"
          >
            Import a repo
          </Link>
        </div>
      </form>

      <section className="min-w-0">
        <h2 className="text-title font-semibold">Start from a template</h2>
        <ul className="mt-3 grid gap-3 md:grid-cols-3">
          {TEMPLATES.map((t) => (
            <li key={t.title} className="min-w-0">
              <form action="/app/projects" method="post" className="h-full">
                <input type="hidden" name="prompt" value={t.prompt} />
                <button
                  type="submit"
                  className="flex h-full w-full flex-col gap-1 rounded-panel border border-rule-strong p-4 text-left"
                >
                  <span className="text-body font-medium">{t.title}</span>
                  <span className="text-small text-graphite">{t.blurb}</span>
                </button>
              </form>
            </li>
          ))}
        </ul>
      </section>

      <section className="min-w-0">
        <h2 className="text-title font-semibold">Your projects</h2>

        {projects.length === 0 ? (
          <div className="mt-3 rounded-panel border border-rule p-6">
            <p className="text-body">No projects yet.</p>
            <p className="mt-1 max-w-[72ch] text-small text-graphite">
              Describe an app above to create your first one, or{" "}
              <Link href="/demo" className="text-blueprint underline">
                read a finished project
              </Link>{" "}
              to see where it ends up.
            </p>
          </div>
        ) : (
          <ul className="mt-3 flex flex-col gap-2">
            {projects.map((p) => (
              <li key={p.id} className="min-w-0">
                <Link
                  href={`/app/p/${p.id}`}
                  className="flex min-h-11 flex-wrap items-baseline gap-x-3 gap-y-1 rounded-panel border border-rule-strong p-3"
                >
                  <span className="min-w-0 flex-1 truncate text-body font-medium">
                    {p.name}
                  </span>
                  <span className="rounded-input border border-rule px-1.5 py-0.5 text-caption text-graphite">
                    {p.status}
                  </span>
                  <span className="text-caption text-graphite">
                    {formatDate(p.created_at)}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
