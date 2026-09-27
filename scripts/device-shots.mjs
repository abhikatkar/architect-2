/*
  The four preview options, photographed on a laptop in both themes.

  A device frame is a claim about how something looks, so the claim is a set of
  images rather than a description. One width, 1280px, which is the laptop tier
  the design system names as most used and the width at which tablet and desktop
  both have to scale down to fit an 888px canvas.

    node scripts/device-shots.mjs <url> <outDir>

  Writes <outDir>/<option>-<theme>.png, eight files. The capture is the full
  page rather than the viewport, because the tablet frame is 1088px tall and a
  viewport crop would cut off the thing being photographed.
  prefers-color-scheme is emulated rather than forced through the cookie, so the
  media query itself is exercised.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { DEVICES } from "../lib/devices.ts";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9100 + Math.floor(Math.random() * 90);

const base = process.argv[2] ?? "http://127.0.0.1:3131";
const outDir = process.argv[3];
if (!outDir) throw new Error("usage: device-shots.mjs <url> <outDir>");
mkdirSync(outDir, { recursive: true });

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

let written = 0;
for (const theme of ["light", "dark"]) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });
  for (const device of DEVICES) {
    await send("Emulation.setDeviceMetricsOverride", {
      width: 1280,
      height: 900,
      deviceScaleFactor: 2,
      mobile: false,
      screenWidth: 1280,
      screenHeight: 900,
    });
    const path = `/demo?tab=app&pane=canvas${device === "auto" ? "" : `&device=${device}`}`;
    await send("Page.navigate", { url: `${base}${path}` });
    await sleep(1600);

    const { result } = await send("Runtime.evaluate", {
      expression:
        "JSON.stringify({h: Math.ceil(document.documentElement.scrollHeight)})",
      returnByValue: true,
    });
    const { h } = JSON.parse(result.value);
    const shot = await send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width: 1280, height: h, scale: 2 },
    });
    writeFileSync(
      `${outDir}/${device}-${theme}.png`,
      Buffer.from(shot.data, "base64"),
    );
    written++;
  }
}

console.log(`  wrote ${written} screenshots to ${outDir}`);
ws.close();
chrome.kill();
process.exit(0);
