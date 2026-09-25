import Link from "next/link";
import type { ChatTurn, Conversation, ConversationStatus } from "@/lib/seed/types";

export const DEVICES = ["phone", "tablet", "desktop"] as const;
export type Device = (typeof DEVICES)[number];

export function parseDevice(value: string | string[] | undefined): Device {
  const v = Array.isArray(value) ? value[0] : value;
  return DEVICES.includes(v as Device) ? (v as Device) : "desktop";
}

const FRAME_WIDTH: Record<Device, string> = {
  phone: "max-w-[390px]",
  tablet: "max-w-[768px]",
  desktop: "max-w-full",
};

/**
 * Under 640px the frame starts on Phone. Showing a desktop frame inside a
 * phone was the mismatch the review caught, and the toggle still overrides it.
 */
export function defaultDevice(explicit: string | string[] | undefined): Device {
  return parseDevice(explicit);
}

type Props = {
  device: Device;
  deviceHref: (d: Device) => string;
  chat: ChatTurn[];
  conversations: Conversation[];
  counts: Record<ConversationStatus, number>;
  previewVersion: string;
  /** Set when the preview is behind the current version. */
  staleFrom?: string;
  /** Entry point 1 into the trace, from the escalated answer itself. */
  whyHref?: string;
};

/**
 * Screen 8. The built app, running.
 *
 * The device toggle is URL state (D25), so every device view is linkable and
 * survives a refresh. A stale preview says so rather than quietly serving an
 * old version, which is what the teardown caught happening elsewhere.
 */
export function AppPreview({
  device,
  deviceHref,
  chat,
  conversations,
  counts,
  previewVersion,
  staleFrom,
  whyHref,
}: Props) {
  return (
    <section className="flex min-w-0 flex-1 flex-col gap-3">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-title font-semibold">App preview</h2>
        <span className="rounded-input border border-rule px-1.5 py-0.5 font-mono text-caption">
          {previewVersion}
        </span>

        <nav aria-label="Preview device" className="ml-auto flex gap-1">
          {DEVICES.map((d) => (
            <Link
              key={d}
              href={deviceHref(d)}
              aria-current={d === device ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-input px-3 text-caption capitalize ${
                d === device ? "bg-blueprint text-paper" : "text-graphite"
              }`}
            >
              {d}
            </Link>
          ))}
        </nav>
      </div>

      {staleFrom ? (
        <p className="flex flex-wrap items-center gap-2 rounded-panel border border-cost p-3 text-caption">
          <span className="text-cost">
            This preview is from {staleFrom}. Refresh preview to see {previewVersion}.
          </span>
          <button
            type="button"
            className="min-h-11 rounded-input border border-rule px-3 text-body"
          >
            Refresh preview
          </button>
        </p>
      ) : null}

      <div
        className={`mx-auto w-full min-w-0 ${FRAME_WIDTH[device]} rounded-panel border border-rule`}
      >
        <div className="border-b border-rule px-3 py-2">
          <p className="text-caption text-graphite">
            northwind-helpline.architect.app
          </p>
        </div>

        <div className="grid min-w-0 gap-0 md:grid-cols-2">
          {/* Customer chat */}
          <div className="min-w-0 border-rule p-3 md:border-r">
            <p className="text-caption text-graphite">Customer chat</p>
            <ul className="mt-2 flex flex-col gap-2">
              {chat.map((t, i) => (
                <li
                  key={i}
                  className={`min-w-0 rounded-input border p-2 text-small ${
                    t.from === "customer"
                      ? "border-rule"
                      : t.escalated
                        ? "border-fault"
                        : "border-blueprint"
                  }`}
                >
                  <span className="block text-caption text-graphite">
                    {t.from === "customer" ? "Customer" : "Helpline"}
                  </span>
                  <span className="block">{t.text}</span>
                  {t.escalated ? (
                    <span className="mt-1 flex flex-wrap items-center gap-2">
                      <span className="text-caption text-fault">
                        Escalated to a human
                      </span>
                      {whyHref ? (
                        <Link
                          href={whyHref}
                          className="inline-flex min-h-11 items-center rounded-input border border-blueprint px-2 text-caption text-blueprint"
                        >
                          Why did it do that?
                        </Link>
                      ) : null}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>

          {/* Admin inbox */}
          <div className="min-w-0 p-3">
            <p className="text-caption text-graphite">Admin inbox</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {(["open", "resolved", "escalated"] as const).map((k) => (
                <span
                  key={k}
                  className="rounded-input border border-rule px-2 py-1 text-caption"
                >
                  <span className="font-mono">{counts[k]}</span>{" "}
                  <span className="text-graphite">{k}</span>
                </span>
              ))}
            </div>
            <ul className="mt-2 flex flex-col gap-1">
              {conversations.map((c) => (
                <li
                  key={c.id}
                  className="flex flex-wrap items-baseline gap-2 border-b border-rule py-1 text-small last:border-b-0"
                >
                  <span className="font-medium">{c.customer}</span>
                  <span className="min-w-0 flex-1 truncate text-graphite">
                    {c.question}
                  </span>
                  <span
                    className={`text-caption ${
                      c.status === "escalated" ? "text-fault" : "text-live"
                    }`}
                  >
                    {c.status}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

    
    </section>
  );
}
