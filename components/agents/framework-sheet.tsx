import { CAPABILITIES, FRAMEWORKS, notManaged } from "@/lib/seed/frameworks";
import { Sheet, DemoNote } from "@/components/ui/sheet";

/**
 * Screen 11, the framework picker.
 *
 * The brief asks for a platform where you can build agents in any framework.
 * Today's Architect offers Lyzr agents or GitAgent in beta, which is gap 4 in
 * docs/03, so this screen exists to answer a sentence in the ask itself.
 *
 * The design is mostly the second column. Each framework says what Architect
 * cannot manage for it, because a picker where everything is fully supported is
 * the kind of promise that gets found out, and because a developer choosing a
 * framework is choosing what they will have to do themselves.
 */
export function FrameworkSheet({
  selected,
  closeHref,
  hrefFor,
}: {
  selected: string;
  closeHref: string;
  hrefFor: (id: string) => string;
}) {
  const current =
    FRAMEWORKS.find((f) => f.id === selected) ?? FRAMEWORKS[0];
  const missing = notManaged(current);

  return (
    <Sheet
      id="framework"
      title="Add an agent"
      note="Pick the framework it runs on. Each one says what Architect can and cannot manage for it."
      closeHref={closeHref}
      returnTo="add-agent-trigger"
      footer={
        <>
          <span className="inline-flex min-h-11 cursor-default items-center rounded-input bg-blueprint px-4 text-body text-paper">
            Add a {current.name} agent
          </span>
          <DemoNote>Demo action. No agent is created.</DemoNote>
        </>
      }
    >
      <div className="flex min-w-0 flex-col gap-4">
        <section className="min-w-0">
          <h3 className="text-body font-medium">Framework</h3>
          <ul className="mt-2 flex flex-col gap-1">
            {FRAMEWORKS.map((f) => {
              const active = f.id === current.id;
              return (
                <li key={f.id} className="min-w-0">
                  <a
                    href={hrefFor(f.id)}
                    aria-current={active ? "page" : undefined}
                    className={`flex min-h-11 min-w-0 flex-wrap items-center gap-x-3 gap-y-1 rounded-input border p-3 ${
                      active ? "border-blueprint" : "border-rule"
                    }`}
                  >
                    <span className="text-small font-medium">{f.name}</span>
                    <span className="min-w-0 text-caption text-graphite">
                      {f.summary}
                    </span>
                    {/* Honest about which of these exist in today's product. */}
                    <span
                      className={`ml-auto text-caption ${
                        f.availableToday ? "text-graphite" : "text-cost"
                      }`}
                    >
                      {f.availableToday ? "in Architect today" : "new in 2.0"}
                    </span>
                  </a>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="min-w-0 rounded-input border border-rule p-3">
          <h3 className="text-body font-medium">
            What Architect manages for {current.name}
          </h3>
          <p className="mt-1 text-caption text-graphite">
            The agent itself lives in: {current.home}.
          </p>
          <ul className="mt-2 flex flex-col gap-1">
            {CAPABILITIES.map((c) => {
              const managed = current.manages.includes(c.id);
              return (
                <li
                  key={c.id}
                  className="flex min-w-0 flex-wrap items-baseline gap-x-2 text-small"
                >
                  {/* A word beside the mark, never colour alone. */}
                  <span className={managed ? "text-live" : "text-graphite"}>
                    {managed ? "ok yes" : "x no"}
                  </span>
                  <span className="font-medium">{c.label}</span>
                  <span className="min-w-0 text-caption text-graphite">{c.note}</span>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="min-w-0">
          <h3 className="text-body font-medium">
            What you keep doing yourself
          </h3>
          <ul className="mt-1 flex flex-col gap-1">
            {current.limits.map((l) => (
              <li key={l} className="text-small">
                {l}
              </li>
            ))}
          </ul>
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            {missing.length === 0
              ? "Architect manages every part of this one, which is why it is the default."
              : `${missing.length} of ${CAPABILITIES.length} things on the list above are yours rather than Architect's. Every framework here gets the same run and trace view, which is the part that does not change.`}
          </p>
        </section>
      </div>
    </Sheet>
  );
}
