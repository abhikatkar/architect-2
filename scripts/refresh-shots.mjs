/*
  The five surfaces of the visual refresh, at two sizes in two themes.

  A refresh is a claim about how something looks, so the claim is a set of
  images taken the same way before and after rather than a description. Same
  script, same widths, same waits, same pages: the only difference between the
  two runs is the build being served.

    node scripts/refresh-shots.mjs <url> <outDir> [--cookies <file>]

  Writes <outDir>/<surface>-<device>-<theme>.png, twenty files. Laptop is
  1280x900 and phone is 375x812, which are the two tiers the design system
  names as most used. prefers-color-scheme is emulated rather than forced
  through the cookie, so the media query itself is exercised.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9200 + Math.floor(Math.random() * 90);

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const base = positional[0] ?? "http://127.0.0.1:3131";
const outDir = positional[1];
if (!outDir) throw new Error("usage: refresh-shots.mjs <url> <outDir>");
const cookies = flags.cookies ? JSON.parse(readFileSync(flags.cookies, "utf8")) : [];
mkdirSync(outDir, { recursive: true });

/** The five screens the refresh has to answer for. */
const SURFACES = [
  ["landing", "/"],
  ["app-tab", "/demo?tab=app&pane=canvas"],
  ["why-did-it-do-that", "/demo?tab=agents&pane=canvas&why=r-104"],
  ["deploy", "/demo?tab=deploy&pane=canvas"],
  ["sheet-github", "/demo?tab=deploy&pane=canvas&sheet=github"],
];

const DEVICES = [
  ["laptop", 1280, 900],
  ["phone", 375, 812],
];

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

if (cookies.length) {
  const { hostname } = new URL(base);
  for (const c of cookies) {
    await send("Network.setCookie", {
      name: c.name,
      value: c.value,
      domain: hostname,
      path: "/",
      httpOnly: false,
      secure: base.startsWith("https"),
    });
  }
}

let written = 0;
for (const theme of ["light", "dark"]) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });
  for (const [device, width, height] of DEVICES) {
    await send("Emulation.setDeviceMetricsOverride", {
      width,
      height,
      deviceScaleFactor: 2,
      mobile: width < 640,
      screenWidth: width,
      screenHeight: height,
    });
    for (const [name, path] of SURFACES) {
      await send("Page.navigate", { url: `${base}${path}` });
      await sleep(1600);
      const shot = await send("Page.captureScreenshot", { format: "png" });
      const file = `${outDir}/${name}-${device}-${theme}.png`;
      writeFileSync(file, Buffer.from(shot.data, "base64"));
      written++;
    }
  }
}

console.log(`  wrote ${written} screenshots to ${outDir}`);
ws.close();
chrome.kill();
process.exit(0);
