import Link from "next/link";
import {
  DEVICES,
  DEVICE_ARIA,
  DEVICE_FRAMES,
  DEVICE_LABEL,
  deviceNote,
  frameBox,
  type Device,
  type FramedDevice,
} from "@/lib/devices";
import type { ChatTurn, Conversation, ConversationStatus } from "@/lib/seed/types";

/** The project's default host. One literal, read by Auto and by the desktop window. */
const PREVIEW_HOST = "northwind-helpline.architect.app";

/**
 * Auto keeps the class string it has always had: phone width below 640px, the
 * whole panel above it. It is the one option with no frame, so the panel and
 * its address bar are the frame, exactly as before.
 */
const AUTO_WIDTH = "max-w-[390px] sm:max-w-full";

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
 *
 * Phone, Tablet and Desktop draw a real frame and the app inside reflows to
 * that device's width rather than to the window's, which is the whole point of
 * a device preview: it has to be able to disagree with the screen it is being
 * looked at on. The mechanism is container queries and one transform, all of it
 * in globals.css, all of it server rendered. See D65.
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
        <h2 className="text-title font-bold">App preview</h2>
        <span className="rounded-input border border-rule px-1.5 py-0.5 font-mono text-caption">
          {previewVersion}
        </span>

        <nav aria-label="Preview device" className="ml-auto flex gap-1">
          {DEVICES.map((d) => (
            <Link
              key={d}
              href={deviceHref(d)}
              aria-label={DEVICE_ARIA[d]}
              aria-current={d === device ? "page" : undefined}
              className={`inline-flex min-h-11 items-center rounded-input px-3 text-caption ${
                d === device ? "bg-blueprint text-paper" : "text-graphite"
              }`}
            >
              {DEVICE_LABEL[d]}
            </Link>
          ))}
        </nav>
      </div>

      {/* Left aligned and always in the same place, so it reads as part of the
          switcher rather than as a label floating under a centred device. The
          width in it comes from the geometry table, not from the copy. */}
      <p className="text-caption text-graphite">{deviceNote(device)}</p>

      {staleFrom ? (
        <p className="flex flex-wrap items-center gap-2 rounded-panel border border-cost p-3 text-caption">
          <span className="text-cost">
            This preview is from {staleFrom}. Refresh preview to see {previewVersion}.
          </span>
          <button
            type="button"
            className="min-h-11 rounded-input border border-rule-strong px-3 text-body"
          >
            Refresh preview
          </button>
        </p>
      ) : null}

      {/* The stage is what "fit" is measured against: every frame is at most as
          wide as this element, because --fit is derived from its width. */}
      <div className="device-stage min-w-0">
        {device === "auto" ? (
          <div
            className={`mx-auto w-full min-w-0 ${AUTO_WIDTH} rounded-panel border border-rule`}
          >
            <div className="border-b border-rule px-3 py-2">
              <p className="text-caption text-graphite">{PREVIEW_HOST}</p>
            </div>
            <AppScreen
              chat={chat}
              conversations={conversations}
              counts={counts}
              whyHref={whyHref}
            />
          </div>
        ) : (
          <DeviceFrame device={device}>
            <AppScreen
              chat={chat}
              conversations={conversations}
              counts={counts}
              whyHref={whyHref}
            />
          </DeviceFrame>
        )}
      </div>
    </section>
  );
}

/**
 * The body around the app: a slab for the phone and tablet, a browser window
 * for the desktop.
 *
 * Every number is from lib/devices.ts and every colour is a token, so the frame
 * is correct in both themes without a second palette. The body is `rule-strong`
 * because that is the token that already holds 3:1 against the canvas, which is
 * what makes the device's edge visible rather than a guess about grey.
 */
function DeviceFrame({
  device,
  children,
}: {
  device: FramedDevice;
  children: React.ReactNode;
}) {
  const f = DEVICE_FRAMES[device];
  const box = frameBox(device);
  const slot = {
    "--frame-w": `${box.width}px`,
    "--frame-h": `${box.height}px`,
  } as React.CSSProperties;

  if (device === "desktop") {
    return (
      <div className="device-slot" style={slot}>
        <div className="device-body overflow-hidden rounded-panel border border-rule bg-paper">
          <div
            className="flex shrink-0 items-center gap-3 border-b border-rule bg-ink/5 px-3"
            style={{ height: f.chrome }}
          >
            {/*
              Three neutral dots, not three coloured ones. `fault`, `cost` and
              `live` mean errors, money and production in this product and
              nothing else, so borrowing them for window furniture would break
              the one rule the palette has. It would also be a copy of a
              specific operating system, which the frames are not.
            */}
            <span aria-hidden="true" className="flex shrink-0 gap-1.5">
              <span className="block size-2.5 rounded-pill bg-rule-strong" />
              <span className="block size-2.5 rounded-pill bg-rule-strong" />
              <span className="block size-2.5 rounded-pill bg-rule-strong" />
            </span>
            <span className="min-w-0 flex-1 truncate rounded-input border border-rule bg-paper px-2 py-0.5 text-caption text-graphite">
              {PREVIEW_HOST}
            </span>
          </div>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="device-slot" style={slot}>
      <div
        className="device-body bg-rule-strong"
        style={{ padding: f.bezel, borderRadius: f.radius }}
      >
        <div
          className="flex min-h-0 flex-1 flex-col overflow-hidden bg-paper"
          style={{ borderRadius: box.glassRadius }}
        >
          {f.status ? <StatusBar height={f.status} /> : null}
          {children}
        </div>
      </div>
    </div>
  );
}

/**
 * The phone's status strip: time, signal, battery, drawn as CSS boxes.
 *
 * Decorative chrome of a simulated device, so the whole strip is hidden from
 * assistive technology. A screen reader announcing a fictional time and a
 * battery level to someone reading a preview of their own app would be noise,
 * and the switcher already says which frame is on.
 */
function StatusBar({ height }: { height: number }) {
  return (
    <div
      aria-hidden="true"
      className="flex shrink-0 items-center justify-between px-4 text-caption"
      style={{ height }}
    >
      <span className="font-mono">9:30</span>
      <span className="flex items-center gap-2">
        {/* Signal: four bars, climbing. */}
        <span className="flex items-end gap-0.5">
          {[4, 6, 8, 10].map((h) => (
            <span
              key={h}
              className="block w-[3px] rounded-[1px] bg-ink"
              style={{ height: h }}
            />
          ))}
        </span>
        {/* Battery: a case, a charge, a terminal. */}
        <span className="flex items-center gap-[2px]">
          <span className="block h-[11px] w-[22px] rounded-[3px] border border-ink p-[2px]">
            <span className="block h-full w-2/3 rounded-[1px] bg-ink" />
          </span>
          <span className="block h-[4px] w-[2px] rounded-r-[1px] bg-ink" />
        </span>
      </span>
    </div>
  );
}

/**
 * The app itself, whatever is around it.
 *
 * This element is the container query container, so the layout below is a
 * question about the frame rather than about the monitor: one column at 390px,
 * a 3 to 2 split at 820px, two equal columns at 1280px, and Auto moving through
 * all three as the panel resizes. The thresholds are in globals.css.
 *
 * Inside a frame it is also the scroll region, because a device screen is a
 * fixed size and an app taller than the screen scrolls inside it rather than
 * stretching the phone. Under Auto it has no height of its own and flows.
 */
function AppScreen({
  chat,
  conversations,
  counts,
  whyHref,
}: {
  chat: ChatTurn[];
  conversations: Conversation[];
  counts: Record<ConversationStatus, number>;
  whyHref?: string;
}) {
  return (
    <div className="app-screen min-h-0 min-w-0 flex-1 overflow-y-auto">
      <div className="app-grid min-w-0">
        {/* Customer chat */}
        <div className="app-pane-chat min-w-0 border-rule p-3">
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
                {t.groundedAfterFix ? (
                  /* The fix landed, so this answer is the corrected one. It
                     says which version answers it, because the version in
                     the frame header is the same claim. */
                  <span className="mt-1 flex flex-wrap items-center gap-2">
                    <span className="text-caption text-live">
                      ok grounded, answered after the fix
                    </span>
                    {whyHref ? (
                      <Link
                        href={whyHref}
                        className="inline-flex min-h-11 items-center rounded-input border border-blueprint px-2 text-caption text-blueprint"
                      >
                        See what changed
                      </Link>
                    ) : null}
                  </span>
                ) : null}
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
          {/*
            Why the numbers do not move when the fix does.

            The chat above answers the credit question once the fix is
            applied, and a reader can reasonably expect "7 escalated" to
            become 6. It does not: these are the month's conversations, and
            Lena K.'s was escalated before the fix existed. The fix changes
            what the app does next, not what it already did.
          */}
          <p className="mt-2 max-w-[72ch] text-caption text-graphite">
            This month&apos;s conversations. Applying a fix changes what happens
            next, so an answer that already went to a person stays there.
          </p>
        </div>
      </div>
    </div>
  );
}
