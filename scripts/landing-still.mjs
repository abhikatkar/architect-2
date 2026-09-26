/*
  The screenshot on the landing page, taken from the running product.

    node scripts/landing-still.mjs [url]

  Writes public/still/why-did-it-do-that-light.png and -dark.png, 1280x820.

  Why a script: the landing page shows one screen, "Why did it do that?", and
  a landing page showing a screen the product does not have is the exact thing
  the teardown criticised five other tools for. Generating it from the running
  build means the picture cannot drift from the screen, and rerunning this
  after any change to that screen is a one line job.

  Two files, because the page has two themes and a visitor who forces one with
  the toggle has to get a picture that matches the page around it. The pair is
  switched in CSS by the same rules the tokens use, so no JavaScript decides
  which one shows.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9750 + Math.floor(Math.random() * 40);
const base = process.argv[2] ?? "http://127.0.0.1:3131";

/* The trace, opened on the run the whole screen is built around. */
const PATH = "/demo?tab=agents&pane=canvas&why=r-104";
/*
  1280 wide because the demo banner across the top wraps to two lines below
  about 1200, and a picture of a wrapped banner is a picture of a layout
  problem the product does not have at the width this screen is used at.
*/
const WIDTH = 1280;
const HEIGHT = 820;

const out = join(process.cwd(), "public", "still");
mkdirSync(out, { recursive: true });

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
await send("Emulation.setDeviceMetricsOverride", {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: 2,
  mobile: false,
  screenWidth: WIDTH,
  screenHeight: HEIGHT,
});

for (const theme of ["light", "dark"]) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });
  await send("Page.navigate", { url: `${base}${PATH}` });
  await sleep(2000);
  const { data } = await send("Page.captureScreenshot", { format: "png" });
  const file = join(out, `why-did-it-do-that-${theme}.png`);
  writeFileSync(file, Buffer.from(data, "base64"));
  console.log(`  wrote ${file} at ${WIDTH}x${HEIGHT}`);
}

ws.close();
chrome.kill();
process.exit(0);
