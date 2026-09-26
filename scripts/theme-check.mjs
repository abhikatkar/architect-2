/*
  How long the theme switch takes to respond to the earliest possible click.

  Round 3 reported the toggle as broken: 4 to 6 seconds, no pending state.
  Round 4 reported the first click after a load as ignored, 4 times in 5. Both
  were the same defect and neither was a dead control: before the client
  component hydrated, the click fell through to the form post, and the theme
  changed only after a full round trip. A control that answers in 1.5 seconds
  has been ignored, as far as the person clicking it is concerned.

  So the claim is a measurement. This drives the real page over CDP on a
  throttled connection, clicks Dark as soon as the control is painted, and times
  how long the document takes to change. It reports the readyState at the moment
  of the click, because a click while the page is still loading is the case that
  was broken.

  Usage, against a running server or a deployment:

    node scripts/theme-check.mjs [url]

  Exits non-zero if any click fails to flip the theme, or if the worst flip is
  slower than the bar below.
*/
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9700 + Math.floor(Math.random() * 200);
const base = process.argv[2] ?? "http://127.0.0.1:3131";

/** A response has to be felt as a response. Anything slower is the old bug. */
const BAR_MS = 400;
const RUNS = 5;

const chrome = spawn(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--no-first-run",
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1280,
  screenHeight: 900,
});

const evaluate = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;

const dark = () =>
  evaluate(`document.documentElement.getAttribute("data-theme")`).then(
    (v) => v === "dark",
  );

let worst = 0;
let flipped = 0;
const rows = [];

for (let run = 1; run <= RUNS; run++) {
  /*
    Start from a blank page every time.

    Without this the poll below finds the previous run's toggle, still painted
    while the next navigation is in flight, and times a click on a document that
    is about to be replaced. The first version of this script did exactly that
    and produced numbers that looked like a result.
  */
  await send("Page.navigate", { url: "about:blank" });
  await sleep(300);
  await send("Network.clearBrowserCookies");
  await send("Network.setCacheDisabled", { cacheDisabled: true });
  // Slow enough that the script bundle lands well after the markup, which is
  // the window a real visitor on a phone connection clicks in.
  await send("Network.emulateNetworkConditions", {
    offline: false,
    latency: 400,
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
  });

  await send("Page.navigate", { url: `${base}/demo` });

  let box = null;
  let waited = 0;
  while (!box && waited < 25000) {
    box = await evaluate(`(() => {
      const b = [...document.querySelectorAll('button[name="theme"][value="dark"]')][0];
      if (!b) return null;
      const r = b.getBoundingClientRect();
      if (!r.width) return null;
      return JSON.stringify({
        x: r.x + r.width / 2,
        y: r.y + r.height / 2,
        ready: document.readyState,
        where: location.pathname,
      });
    })()`);
    if (!box) {
      await sleep(25);
      waited += 25;
    }
  }
  if (!box) {
    rows.push(`  FAIL run ${run}: the toggle never painted`);
    continue;
  }
  const { x, y, ready, where } = JSON.parse(box);
  if (await dark()) {
    rows.push(`  FAIL run ${run}: already dark before the click`);
    continue;
  }

  const start = Date.now();
  for (const type of ["mousePressed", "mouseReleased"]) {
    await send("Input.dispatchMouseEvent", {
      type,
      x,
      y,
      button: "left",
      clickCount: 1,
      buttons: type === "mousePressed" ? 1 : 0,
    });
  }

  let flip = null;
  while (Date.now() - start < 12000) {
    if (await dark()) {
      flip = Date.now() - start;
      break;
    }
    await sleep(25);
  }

  if (flip === null) {
    rows.push(
      `  FAIL run ${run}: clicked at ${waited}ms, readyState ${ready}, theme never changed`,
    );
    continue;
  }
  flipped++;
  worst = Math.max(worst, flip);
  rows.push(
    `  ${flip <= BAR_MS ? "ok  " : "FAIL"} run ${run}: clicked ${waited}ms after navigating, ` +
      `readyState ${ready.padEnd(11)} on ${where}, theme changed in ${flip}ms`,
  );
}

for (const r of rows) console.log(r);
const ok = flipped === RUNS && worst <= BAR_MS;
console.log(
  `\n${flipped} of ${RUNS} clicks changed the theme, worst ${worst}ms against a ${BAR_MS}ms bar.`,
);

ws.close();
chrome.kill();
process.exit(ok ? 0 : 1);
