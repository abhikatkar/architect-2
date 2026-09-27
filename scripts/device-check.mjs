/*
  The device frames, measured in a browser.

  Nothing in this file can be answered by reading the source. Whether a frame
  wider than its canvas scales down instead of pushing the page sideways, and
  whether the app inside a phone frame stacks at 390px while the viewer is on a
  1920px monitor, are computed facts: they come out of a container query, a
  transform and one division CSS has no operator for. The same reason
  rendered-check.mjs exists (D50) and focus-check.mjs after it (D51).

  So this asserts, for every device option, at four widths, in both themes:

    - the frame is there, and its painted box is the geometry in lib/devices.ts
      scaled by exactly one factor in both axes, so nothing is squashed
    - the app inside still lays out at the device's width, not the viewer's
    - the app's layout is the shape the device's width earns and not the
      window's: one column inside a phone, an uneven two inside a tablet, an
      even two inside a desktop
    - the page has no horizontal overflow

  Usage, against a running server:

    node --experimental-strip-types scripts/device-check.mjs [url]

  The flag is for the import: the geometry is read from lib/devices.ts rather
  than typed in here, so this check cannot drift away from what is shipped.

  Exits non-zero on any failure.
*/
import { spawn } from "node:child_process";
import { DEVICES, DEVICE_FRAMES, frameBox } from "../lib/devices.ts";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9600 + Math.floor(Math.random() * 300);
const base = process.argv[2] ?? "http://127.0.0.1:3131";

/** 375 is a phone, 1280 a laptop where tablet and desktop must both scale. */
const WIDTHS = [375, 768, 1280, 1920];

/*
  What the app's own layout has to be inside each frame, as a shape rather than
  as a count: a count alone would pass a tablet that had quietly picked up the
  desktop layout. "split" means two unequal columns, the 3 to 2 the tablet gets
  so the chat keeps a readable measure at 820px. "equal" means the two even
  columns a 1280px desktop has room for.
*/
const WANT_LAYOUT = { phone: "one", tablet: "split", desktop: "equal" };

/** Reads the shape back off the computed track sizes. */
function layoutOf(tracks) {
  if (!tracks) return "none";
  if (tracks.length === 1) return "one";
  if (tracks.length !== 2) return `${tracks.length} columns`;
  return Math.abs(tracks[0] - tracks[1]) <= 2 ? "equal" : "split";
}

const results = [];
function check(name, ok, detail) {
  results.push({ name, ok, detail });
}

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  "--hide-scrollbars",
  `--remote-debugging-port=${PORT}`,
  "about:blank",
]);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 80; i++) {
  try {
    if ((await fetch(`http://127.0.0.1:${PORT}/json/version`)).ok) break;
  } catch {}
  await sleep(250);
}
const tab = await (
  await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })
).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const m = JSON.parse(e.data);
  if (m.id && pending.has(m.id)) {
    pending.get(m.id)(m.result);
    pending.delete(m.id);
  }
};
const send = (method, params = {}) =>
  new Promise((res) => {
    const n = ++id;
    pending.set(n, res);
    ws.send(JSON.stringify({ id: n, method, params }));
  });

await send("Page.enable");
await send("Runtime.enable");
await send("Network.enable");

/*
  Runs in the page.

  getBoundingClientRect on the body reports the painted box, which is what the
  transform changes. offsetWidth reports the layout box, which it does not, and
  the gap between the two is the whole mechanism: 1282px of layout painted into
  888px of canvas. gridTemplateColumns comes back as computed track sizes, so
  the tracks are the columns the container query actually applied, at the widths
  it actually gave them.
*/
const SAMPLE = `(() => {
  const stage = document.querySelector(".device-stage");
  const slot = document.querySelector(".device-slot");
  const body = document.querySelector(".device-body");
  const screen = document.querySelector(".app-screen");
  const grid = document.querySelector(".app-grid");
  const r = (el) => {
    if (!el) return null;
    const b = el.getBoundingClientRect();
    return { w: b.width, h: b.height, left: b.left, right: b.right };
  };
  return JSON.stringify({
    overflow: document.documentElement.scrollWidth - window.innerWidth,
    stage: r(stage),
    slot: r(slot),
    framed: !!body,
    bodyPainted: r(body),
    bodyLayout: body ? { w: body.offsetWidth, h: body.offsetHeight } : null,
    screenLayout: screen ? screen.offsetWidth : null,
    tracks: grid
      ? getComputedStyle(grid)
          .gridTemplateColumns.trim()
          .split(/\\s+/)
          .map((t) => Math.round(parseFloat(t)))
      : null,
    why: [...document.querySelectorAll("a")].filter((a) =>
      /Why did it do that|See what changed/.test(a.textContent || ""),
    ).length,
    statusBar: !!document.querySelector('.device-body [aria-hidden="true"] .font-mono'),
    dots: document.querySelectorAll(".device-body .rounded-pill").length,
    host: /northwind-helpline\\.architect\\.app/.test(document.body.textContent || ""),
    switcher: [...document.querySelectorAll('[aria-label^="Preview in"], [aria-label^="Preview at"]')].length,
    current: (document.querySelector('nav[aria-label="Preview device"] [aria-current="page"]') || {}).textContent || "",
  });
})()`;

for (const theme of ["light", "dark"]) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });

  for (const device of DEVICES) {
    const path = `/demo?tab=app&pane=canvas${device === "auto" ? "" : `&device=${device}`}`;
    const seen = [];

    for (const width of WIDTHS) {
      await send("Emulation.setDeviceMetricsOverride", {
        width,
        height: 900,
        deviceScaleFactor: 1,
        mobile: width < 640,
        screenWidth: width,
        screenHeight: 900,
      });
      await send("Page.navigate", { url: `${base}${path}` });
      await sleep(1300);
      const m = JSON.parse(
        (await send("Runtime.evaluate", { expression: SAMPLE, returnByValue: true }))
          .result?.value ?? "{}",
      );
      seen.push({ width, ...m });
    }

    const at = (w) => seen.find((s) => s.width === w);
    const label = `${device} in ${theme}`;

    // 1. Zero horizontal overflow, which is the whole reason the fit exists.
    const over = seen.filter((s) => s.overflow !== 0);
    check(
      `${label}: no horizontal page overflow at any width`,
      over.length === 0,
      over.length === 0
        ? seen.map((s) => `${s.width}:0`).join(" ")
        : over.map((s) => `${s.width} overflows by ${s.overflow}px`).join(", "),
    );

    // 2. The frame is drawn, or deliberately is not.
    check(
      `${label}: ${device === "auto" ? "no frame, as before" : "the frame is drawn"}`,
      seen.every((s) => s.framed === (device !== "auto")),
      seen.map((s) => `${s.width}:${s.framed ? "framed" : "bare"}`).join(" "),
    );

    if (device === "auto") {
      // Auto is the panel's width, so it may not be pinned to one number. What
      // it must do is reflow: one column on a phone, more than one on a laptop.
      check(
        `${label}: one column at 375, two at 1280`,
        layoutOf(at(375).tracks) === "one" && at(1280).tracks.length === 2,
        seen.map((s) => `${s.width}:${layoutOf(s.tracks)}`).join(" "),
      );
      check(
        `${label}: the address bar still names the host`,
        seen.every((s) => s.host),
        "northwind-helpline.architect.app present at every width",
      );
      check(
        `${label}: Auto is the option marked current`,
        seen.every((s) => s.current.trim() === "Auto"),
        seen.map((s) => `${s.width}:${s.current.trim()}`).join(" "),
      );
    } else {
      const geometry = DEVICE_FRAMES[device];
      const box = frameBox(device);

      // 3. The app lays out at the device's width whatever the window is.
      check(
        `${label}: the app lays out at ${geometry.width}px at every window width`,
        seen.every((s) => s.screenLayout === geometry.width),
        seen.map((s) => `${s.width}:${s.screenLayout}`).join(" "),
      );
      check(
        `${label}: the frame's layout box stays ${box.width}x${box.height}`,
        seen.every(
          (s) => s.bodyLayout.w === box.width && s.bodyLayout.h === box.height,
        ),
        seen.map((s) => `${s.width}:${s.bodyLayout.w}x${s.bodyLayout.h}`).join(" "),
      );

      // 4. The layout the device's own width earns, not the window's.
      check(
        `${label}: the app inside lays out "${WANT_LAYOUT[device]}"`,
        seen.every((s) => layoutOf(s.tracks) === WANT_LAYOUT[device]),
        seen.map((s) => `${s.width}:${layoutOf(s.tracks)} [${s.tracks}]`).join(" "),
      );

      // 5. Scaled by one factor in both axes, and never up.
      const ratios = seen.map((s) => ({
        width: s.width,
        x: s.bodyPainted.w / box.width,
        y: s.bodyPainted.h / box.height,
      }));
      check(
        `${label}: the device scales proportionally, never distorted`,
        ratios.every((r) => Math.abs(r.x - r.y) < 0.002),
        ratios.map((r) => `${r.width}:${r.x.toFixed(3)}/${r.y.toFixed(3)}`).join(" "),
      );
      check(
        `${label}: it fits the canvas and is never enlarged`,
        seen.every(
          (s) => s.bodyPainted.w <= s.stage.w + 1 && s.bodyPainted.w <= box.width + 1,
        ),
        seen
          .map(
            (s) =>
              `${s.width}: ${Math.round(s.bodyPainted.w)}px in ${Math.round(s.stage.w)}px`,
          )
          .join(", "),
      );

      // 6. Centred in the canvas. Left and right gaps equal within a pixel.
      const off = seen.filter(
        (s) =>
          Math.abs(s.slot.left - s.stage.left - (s.stage.right - s.slot.right)) > 1.5,
      );
      check(
        `${label}: the device is centred in the canvas`,
        off.length === 0,
        off.length === 0
          ? "left and right gaps equal at every width"
          : off.map((s) => `${s.width} is off centre`).join(", "),
      );

      // 7. The frame's own furniture, and the trace entry point inside it.
      if (device === "phone") {
        check(
          `${label}: the status strip is drawn`,
          seen.every((s) => s.statusBar),
          "time, signal and battery inside the frame",
        );
      }
      if (device === "desktop") {
        check(
          `${label}: three window dots and the address bar`,
          seen.every((s) => s.dots === 3 && s.host),
          seen.map((s) => `${s.width}:${s.dots} dots`).join(" "),
        );
      }
      check(
        `${label}: the trace entry point is inside the frame`,
        seen.every((s) => s.why >= 1),
        seen.map((s) => `${s.width}:${s.why}`).join(" "),
      );
    }

    // 8. Four options, each with the label a screen reader reads.
    check(
      `${label}: all four options carry their aria label`,
      seen.every((s) => s.switcher === 4),
      seen.map((s) => `${s.width}:${s.switcher}`).join(" "),
    );
  }
}

const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(62)} ${r.detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} device checks pass.`);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
