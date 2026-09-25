/*
  Responsive check. The design system requires every P0 screen to be verified at
  375, 768, 1280 and 1920 px before it counts as done, so that check is a script
  rather than a habit.

  Usage, against a running server:
    node scripts/responsive-check.mjs <url> <outDir> [widths...] [options]

  Options:
    --cookies <file>   JSON array of {name, value}, from scripts/mint-session.mjs.
                       Lets the check run against signed-in screens.
    --theme <name>     light or dark. Emulates prefers-color-scheme so the real
                       media query is exercised, not a forced attribute.
    --wait <ms>        settle time before measuring, default 2500. Raise it for
                       screens that animate, so the capture lands on the state
                       you meant to check rather than an early frame.

  It drives the installed Chrome over CDP with real device metrics. Passing
  --window-size to headless Chrome is not enough: without Emulation metrics the
  page lays out wide and the screenshot is merely cropped, which looks like a
  responsive bug that is not there. The overflow number is the real check.
  Overflow must be 0. A wide element inside its own scroll container is fine.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
// Random, so back-to-back runs cannot collide on a port still closing.
const PORT = 9300 + Math.floor(Math.random() * 600);

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const [url, outDir, ...widthArgs] = positional;
const widths = widthArgs.length ? widthArgs.map(Number) : [375, 768, 1280, 1920];
const cookies = flags.cookies ? JSON.parse(readFileSync(flags.cookies, "utf8")) : [];
const theme = flags.theme;
const wait = flags.wait ? Number(flags.wait) : 2500;
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
await send("Network.enable");

if (cookies.length) {
  const { hostname } = new URL(url);
  for (const c of cookies) {
    await send("Network.setCookie", {
      name: c.name,
      value: c.value,
      domain: hostname,
      path: "/",
      httpOnly: false,
      secure: false,
    });
  }
}

if (theme) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });
}

const report = [];
for (const w of widths) {
  await send("Emulation.setDeviceMetricsOverride", {
    width: w,
    height: 900,
    deviceScaleFactor: 1,
    mobile: w < 640,
    screenWidth: w,
    screenHeight: 900,
  });
  await send("Page.navigate", { url });
  await sleep(wait);

  const { result } = await send("Runtime.evaluate", {
    expression: `JSON.stringify({
      url: location.pathname + location.search,
      inner: window.innerWidth,
      scroll: document.documentElement.scrollWidth,
      overflow: document.documentElement.scrollWidth - window.innerWidth,
      bg: getComputedStyle(document.body).backgroundColor,
      title: (document.querySelector('h1') || {}).textContent || null,
      widest: (() => {
        let worst = null, max = 0;
        for (const el of document.querySelectorAll('*')) {
          const r = el.getBoundingClientRect();
          if (r.right > max) { max = r.right; worst = el; }
        }
        return worst ? worst.tagName + '.' + (worst.className && worst.className.toString ? worst.className.toString().slice(0,60) : '') + ' right=' + Math.round(max) : 'none';
      })(),
    })`,
    returnByValue: true,
  });
  const m = JSON.parse(result.value);
  report.push({ width: w, theme: theme ?? "system", ...m });

  const suffix = theme ? `-${theme}` : "";
  const shot = await send("Page.captureScreenshot", { format: "png" });
  writeFileSync(`${outDir}/w${w}${suffix}.png`, Buffer.from(shot.data, "base64"));
}

console.log(JSON.stringify(report, null, 2));
const bad = report.filter((r) => r.overflow !== 0);
ws.close();
chrome.kill();
process.exit(bad.length ? 1 : 0);
