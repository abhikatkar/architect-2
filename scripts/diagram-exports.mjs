/*
  Exports a delivered diagram as a high resolution PNG and a PDF.

  The submission form takes a file upload, not a URL, so the proposed
  architecture diagram has to exist as a flat image and as a document. The
  interactive HTML stays the source of truth: these two files are captured from
  it, never drawn, so they cannot say something the diagram does not.

  Run, after any archify deliver:

    node scripts/diagram-exports.mjs [slug ...]

  Defaults to proposed-architecture. The PNG is captured at a 1920px wide
  viewport with two device pixels per CSS pixel, clipped to the whole document,
  so it is 3840px wide and still readable when a reviewer zooms in on a node
  label. The PDF is printed at 1920x1080 with backgrounds on, so the boundaries
  survive: two pages, the canvas and then the cards that annotate it, for the
  reason recorded where it is printed.

  Both come from the file on disk rather than a running server, because the
  delivered HTML is self-contained by design.
*/
import { spawn } from "node:child_process";
import { writeFileSync, mkdirSync, statSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9400 + Math.floor(Math.random() * 500);
const OUT = "docs/architecture/exports";
const ROOT = process.cwd();

const slugs = process.argv.slice(2);
const DIAGRAMS = slugs.length ? slugs : ["proposed-architecture"];

// The capture size. 1920x1080 is the largest viewport the delivered artifact is
// checked to contain without scrolling, so it is the most the page can fill.
const WIDTH = 1920;
const HEIGHT = 1080;
const SCALE = 2;

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
await send("Emulation.setDeviceMetricsOverride", {
  width: WIDTH,
  height: HEIGHT,
  deviceScaleFactor: SCALE,
  mobile: false,
});

const kb = (file) => `${Math.round(statSync(file).size / 1024)} kB`;

for (const name of DIAGRAMS) {
  await send("Page.navigate", {
    url: `file://${ROOT}/public/architecture/${name}.html`,
  });
  // The viewer measures and lays out before it paints. Same wait the stills use.
  await sleep(2800);

  const measured = await send("Runtime.evaluate", {
    returnByValue: true,
    expression:
      "JSON.stringify({ sw: document.documentElement.scrollWidth, sh: document.documentElement.scrollHeight, iw: innerWidth, ih: innerHeight })",
  });
  const { sw, sh, iw, ih } = JSON.parse(measured.result.value);
  const contained = sw <= iw && sh <= ih;

  /*
    Captured under print media, so the viewer's own stylesheet takes the
    toolbar, the guided-view chips and the zoom dock out of the image. That is
    the viewer deciding what is furniture and what is the diagram, rather than
    this script hiding controls it finds inconvenient.

    The layout keeps the 1920x1080 viewport it was measured in, and the capture
    is clipped to the full document height instead, so the cards below the
    canvas are in the image rather than cut off at the fold.
  */
  await send("Emulation.setEmulatedMedia", { media: "print" });
  await sleep(600);
  const printHeight = JSON.parse(
    (
      await send("Runtime.evaluate", {
        returnByValue: true,
        expression: "JSON.stringify(document.documentElement.scrollHeight)",
      })
    ).result.value,
  );

  const png = `${OUT}/${name}.png`;
  const shot = await send("Page.captureScreenshot", {
    format: "png",
    captureBeyondViewport: true,
    clip: {
      x: 0,
      y: 0,
      width: WIDTH,
      height: printHeight,
      scale: SCALE,
    },
  });
  writeFileSync(png, Buffer.from(shot.data, "base64"));
  await send("Emulation.setEmulatedMedia", { media: "" });
  await sleep(300);

  /*
    Printed at scale 1, which gives two pages: the canvas, then the cards that
    annotate it. That split is the viewer's own print layout, where the diagram
    panel is sized against the page rather than against its content, so a
    smaller print scale cannot merge them. The panel shrinks with the paper and
    the cards still land below it. Measured rather than assumed: scaling all the
    way down to 0.57 still produced two pages.

    So the scale stays at 1 and the diagram page stays vector and exact, which
    is the point of shipping a PDF at all. The PNG beside it is the same view in
    one file, for anywhere that wants a single image.
  */
  const pdf = `${OUT}/${name}.pdf`;
  const printed = await send("Page.printToPDF", {
    landscape: true,
    printBackground: true,
    preferCSSPageSize: false,
    // 1920x1080 CSS pixels at 96dpi, so the page is the capture, not a crop.
    paperWidth: WIDTH / 96,
    paperHeight: HEIGHT / 96,
    marginTop: 0,
    marginBottom: 0,
    marginLeft: 0,
    marginRight: 0,
    scale: 1,
  });
  const bytes = Buffer.from(printed.data, "base64");
  writeFileSync(pdf, bytes);

  const pages = (bytes.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? [])
    .length;
  // More than the canvas and its cards means something spilled, and a reviewer
  // would be opening a diagram cut in half.
  if (pages > 2) {
    console.log(`  PDF SPILLED onto ${pages} pages`);
    process.exitCode = 1;
  }

  console.log(
    `${name}\n` +
      `  ${png}  ${WIDTH * SCALE}x${printHeight * SCALE}px, ${kb(png)}\n` +
      `  ${pdf}  ${(WIDTH / 96).toFixed(2)}x${(HEIGHT / 96).toFixed(2)}in, ${pages} pages, the canvas then its cards, ${kb(pdf)}\n` +
      `  page ${sw}x${sh} in a ${iw}x${ih} viewport` +
      (contained ? "" : "  (SCROLLS: the export may cut content)"),
  );
  if (!contained) process.exitCode = 1;
}

chrome.kill();
process.exit(process.exitCode ?? 0);
