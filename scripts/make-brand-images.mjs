/*
  Generates the two raster brand images from the same mark as app/icon.svg.

    node scripts/make-brand-images.mjs

  Writes app/apple-icon.png (180x180) and app/opengraph-image.png (1200x630).

  Why a script and not a design file: the mark is geometry and the colours are
  the design tokens, so both images can be rebuilt from the repository at any
  time and cannot drift from the SVG by hand-editing. Chrome does the drawing,
  which is the same renderer that will show them.

  The icon is the product's own argument in one shape: two inputs meeting at a
  decision point, on the faint grid the canvases use. Nothing here is borrowed
  from another product's mark.
*/
import { spawn } from "node:child_process";
import { writeFileSync } from "node:fs";
import { join } from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9800 + Math.floor(Math.random() * 150);

// The blueprint tokens, light theme, from app/globals.css.
const PAPER = "#f5f7f6";
const INK = "#16202e";
const GRAPHITE = "#586474";
const RULE = "#d9dfe3";
const BLUEPRINT = "#1d4ed8";

/** The mark itself, at whatever size is asked for. Same geometry as icon.svg. */
const mark = (size, plate = PAPER) => `
<svg viewBox="0 0 32 32" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="32" height="32" fill="${plate}" />
  <g stroke="${RULE}" stroke-width="1" opacity="0.9">
    <path d="M7.5 2.5V29.5M24.5 2.5V29.5M2.5 7.5H29.5M2.5 24.5H29.5" />
  </g>
  <g stroke="${BLUEPRINT}" stroke-width="2.6" stroke-linecap="round" fill="none">
    <path d="M8 8 15.5 16" /><path d="M8 24 15.5 16" /><path d="M15.5 16h3.4" />
  </g>
  <circle cx="7.6" cy="7.6" r="3.6" fill="${BLUEPRINT}" />
  <circle cx="7.6" cy="24.4" r="3.6" fill="${BLUEPRINT}" />
  <circle cx="23.2" cy="16" r="4.6" fill="${plate}" stroke="${BLUEPRINT}" stroke-width="2.4" />
</svg>`;

/*
  Apple wants a full bleed square: iOS masks the corners itself, so rounding
  them here would show a rounded tile inside a rounded mask.
*/
const APPLE = `<!doctype html><html><body style="margin:0">${mark(180)}</body></html>`;

const OG = `<!doctype html><html><body style="margin:0">
  <div style="width:1200px;height:630px;background:${PAPER};color:${INK};
              font-family:ui-sans-serif,system-ui,sans-serif;position:relative;
              display:flex;flex-direction:column;justify-content:center;padding:0 88px;box-sizing:border-box">
    <div style="position:absolute;inset:0;
                background-image:linear-gradient(${RULE} 1px,transparent 1px),linear-gradient(90deg,${RULE} 1px,transparent 1px);
                background-size:48px 48px;opacity:0.5"></div>
    <div style="position:relative">
      <div style="display:flex;align-items:center;gap:20px">
        <div style="width:72px;height:72px;border-radius:16px;overflow:hidden;box-shadow:0 0 0 1px ${RULE}">${mark(72)}</div>
        <div style="font-size:56px;font-weight:600;letter-spacing:-0.02em">Architect 2.0</div>
      </div>
      <div style="margin-top:36px;font-size:46px;font-weight:500;line-height:1.25;max-width:20ch">
        See it. Steer it. Own it.<br />Ship it safely.
      </div>
      <div style="margin-top:32px;font-size:26px;color:${GRAPHITE};max-width:46ch;line-height:1.4">
        A vibe-coding platform for agentic apps, for people who do not write code
        and the developers they hand the repo to.
      </div>
      <div style="position:absolute;right:0;bottom:-84px;font-size:22px;color:${BLUEPRINT}">
        architect-2-zeta.vercel.app
      </div>
    </div>
  </div>
</body></html>`;

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

async function shot(html, width, height, out) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: width,
    screenHeight: height,
  });
  await send("Page.navigate", {
    url: `data:text/html;charset=utf-8,${encodeURIComponent(html)}`,
  });
  await sleep(900);
  const { data } = await send("Page.captureScreenshot", {
    format: "png",
    clip: { x: 0, y: 0, width, height, scale: 1 },
  });
  writeFileSync(out, Buffer.from(data, "base64"));
  console.log(`  wrote ${out} at ${width}x${height}`);
}

const app = join(process.cwd(), "app");
await shot(APPLE, 180, 180, join(app, "apple-icon.png"));
await shot(OG, 1200, 630, join(app, "opengraph-image.png"));

ws.close();
chrome.kill();
process.exit(0);
