/*
  Captures a still image of each delivered diagram.

  The interactive diagrams are built for a desktop canvas and are not usable at
  phone width: the toolbar clips on the left and the nodes run off the right.
  Rather than pretend otherwise, the diagrams index serves these stills below
  640px with a line saying where the interactive version lives.

  The stills are generated, never drawn, so they cannot drift from the diagram
  they represent. Regenerate after any archify deliver:

    node scripts/diagram-stills.mjs

  Each page is captured at 1440x900, the size the delivered artifact is checked
  to fit, so one screenshot is the whole diagram with nothing cut off.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9300 + Math.floor(Math.random() * 600);
const DIAGRAMS = ["architecture", "agent-workflow", "jev-call-sequence"];
const OUT = "public/architecture/still";
const ROOT = process.cwd();

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${PORT}`,
  "about:blank",
]);

for (let i = 0; i < 60; i++) {
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
// Two device pixels per CSS pixel, so the still is readable when a phone
// scales it down to 390px wide.
await send("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 2,
  mobile: false,
});

for (const name of DIAGRAMS) {
  await send("Page.navigate", {
    url: `file://${ROOT}/public/architecture/${name}.html`,
  });
  // The viewer lays out and measures before it paints; this is the same wait
  // the responsive checks use.
  await sleep(2800);

  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: false,
  });
  const file = `${OUT}/${name}.png`;
  writeFileSync(file, Buffer.from(shot.data, "base64"));

  const size = await send("Runtime.evaluate", {
    returnByValue: true,
    expression:
      "JSON.stringify({ sh: document.documentElement.scrollHeight, ih: innerHeight })",
  });
  const { sh, ih } = JSON.parse(size.result.value);
  console.log(
    `${name.padEnd(20)} ${file}  page ${sh}px in a ${ih}px viewport` +
      (sh > ih ? "  (SCROLLS: the still may cut content)" : ""),
  );
}

chrome.kill();
process.exit(0);
