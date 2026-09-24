/*
  Responsive check. The design system requires every P0 screen to be verified at
  375, 768, 1280 and 1920 px before it counts as done, so that check is a script
  rather than a habit.

  Usage, against a running server:
    node scripts/responsive-check.mjs http://localhost:3000/dev/tokens ./shots 375 768 1280 1920

  It drives the installed Chrome over CDP with real device metrics. Passing
  --window-size to headless Chrome is not enough: without Emulation metrics the
  page lays out wide and the screenshot is merely cropped, which looks like a
  responsive bug that is not there. The overflow number is the real check.
  Overflow must be 0. A wide element inside its own scroll container is fine.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9333;
const url = process.argv[2];
const outDir = process.argv[3];
const widths = process.argv.slice(4).map(Number);
mkdirSync(outDir, { recursive: true });

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
  `--remote-debugging-port=${PORT}`,
  "about:blank",
]);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function waitForChrome() {
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (r.ok) return;
    } catch {}
    await sleep(250);
  }
  throw new Error("chrome did not start");
}

await waitForChrome();
const tab = await (await fetch(`http://127.0.0.1:${PORT}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));

let id = 0;
const pending = new Map();
ws.onmessage = (e) => {
  const msg = JSON.parse(e.data);
  if (msg.id && pending.has(msg.id)) {
    pending.get(msg.id)(msg.result);
    pending.delete(msg.id);
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

const report = [];
for (const w of widths) {
  const mobile = w < 640;
  await send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: w,
    screenHeight: 900,
  });
  await send("Page.navigate", { url });
  await sleep(2500);

  const { result } = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      inner: window.innerWidth,
      scroll: document.documentElement.scrollWidth,
      body: document.body.scrollWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      widest: (() => {
        let worst = null, max = 0;
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.right > max) { max = r.right; worst = el; }
        }
        return worst ? worst.tagName + '.' + (worst.className && worst.className.toString ? worst.className.toString().slice(0,80) : '') + ' right=' + Math.round(max) : 'none';
      })(),
    })`,
    returnByValue: true,
  });
  const m = JSON.parse(result.value);
  report.push({ width: w, ...m });

  const shot = await send("Page.captureScreenshot", { format: "png", captureBeyondViewport: false });
  writeFileSync(`${outDir}/w${w}.png`, Buffer.from(shot.data, "base64"));
}

console.log(JSON.stringify(report, null, 2));
ws.close();
chrome.kill();
process.exit(0);
