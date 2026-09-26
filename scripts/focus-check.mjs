/*
  Where focus goes when a sheet closes.

  D51 claimed focus returns to whatever opened a sheet, because the close links
  carry a fragment pointing at the trigger. That was true of clicking Close and
  false of pressing Escape: the client router changes the URL without navigating
  to the anchor, so a round 4 measurement found document.activeElement was BODY
  on every sheet. The claim was in the decision log and nothing checked it.

  So the claim is a script. It drives the real page over CDP, opens each sheet,
  presses Escape, and reports where focus actually landed at two widths. Reading
  the source cannot answer this question, which is the same reason
  rendered-check.mjs exists.

  Usage, against a running server:

    node scripts/focus-check.mjs [url]

  Exits non-zero if any sheet loses focus to the document.
*/
import { spawn } from "node:child_process";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9400 + Math.floor(Math.random() * 400);
const base = process.argv[2] ?? "http://127.0.0.1:3131";

/*
  Every sheet in the product, with the control that opens it.

  The rollback trigger is the interesting one. It is not a single control: it is
  a "Roll back" link on the one version that was in production, rendered twice,
  once in the phone list and once in the table, so only one of the two is
  visible at a given width. It is found by data attribute for that reason.
*/
const SHEETS = [
  ["promote", "/demo?tab=deploy&pane=canvas&sheet=promote", "promote-trigger"],
  ["github", "/demo?tab=deploy&pane=canvas&sheet=github", "github-trigger"],
  ["rollback", "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8", "rollback-v8"],
  ["framework", "/demo?tab=agents&pane=canvas&sheet=framework", "add-agent-trigger"],
];

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

const evalJs = async (expression) =>
  (await send("Runtime.evaluate", { expression, returnByValue: true })).result?.value;

const press = async (key, code) => {
  for (const type of ["keyDown", "keyUp"]) {
    await send("Input.dispatchKeyEvent", {
      type,
      key,
      code,
      windowsVirtualKeyCode: key === "Escape" ? 27 : 9,
      nativeVirtualKeyCode: key === "Escape" ? 27 : 9,
    });
  }
};

const rows = [];
let failed = 0;

for (const width of [1280, 390]) {
  await send("Emulation.setDeviceMetricsOverride", {
    width,
    height: 900,
    deviceScaleFactor: 1,
    mobile: width < 640,
    screenWidth: width,
    screenHeight: 900,
  });

  for (const [name, path, trigger] of SHEETS) {
    await send("Page.navigate", { url: `${base}${path}` });
    await sleep(1600);

    const onOpen = await evalJs(
      `(document.activeElement?.tagName ?? "?") + ":" + (document.activeElement?.id ?? "")`,
    );
    const heading = String(onOpen).startsWith("H2:sheet-");

    // Ten tabs, counting every press that leaves the dialog.
    await evalJs("window.__escapes = 0");
    for (let i = 0; i < 10; i++) {
      await press("Tab", "Tab");
      await evalJs(
        `if (!document.querySelector('[role="dialog"]')?.contains(document.activeElement)) window.__escapes++`,
      );
    }
    const escapes = await evalJs("window.__escapes");

    await press("Escape", "Escape");
    await sleep(1400);

    const landed = await evalJs(
      `(() => {
         const a = document.activeElement;
         if (!a || a === document.body) return "BODY";
         return a.getAttribute?.("data-return-to") ?? a.id ?? a.tagName;
       })()`,
    );
    const closed = !(await evalJs(`!!document.querySelector('[role="dialog"]')`));
    const search = await evalJs("location.search");
    const cleared = !search.includes("sheet=");

    const ok = heading && escapes === 0 && landed === trigger && closed && cleared;
    if (!ok) failed++;
    rows.push(
      `  ${ok ? "ok  " : "FAIL"} ${String(width + "px").padEnd(6)} ${name.padEnd(10)} ` +
        `opens on ${heading ? "the heading" : String(onOpen)}, ` +
        `${escapes} tab escapes, Escape closes and focuses ${landed}` +
        `${cleared ? "" : ", parameter left behind"}`,
    );
  }
}

for (const r of rows) console.log(r);
console.log(`\n${rows.length - failed} of ${rows.length} sheet focus checks pass.`);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
