/*
  Every control says what it is under the pointer.

  Tailwind v4's preflight sets `button { cursor: default }`. Most of this
  product's controls are buttons or ARIA roles rather than links, so the hand
  cursor appeared on the links and nowhere else, and a row of perfectly good
  controls read as text. One CSS rule fixes it; this checks the rule is actually
  reaching every control, on the rendered page, at the computed style.

  The demo confirms are the deliberate exception. They carry aria-disabled and
  are focusable on purpose (D62), so they have to read as not-allowed: a hand
  cursor over a control that will not act is a promise the page does not keep.

  Usage, against a running server:

    node scripts/cursor-check.mjs [url] [--cookies <file>]

  A cookies file from scripts/mint-session.mjs lets it cover /app, which is
  behind the proxy guard. Without one, /app is checked as the redirect to
  /login, which is reported rather than passed over.

  Exits non-zero if any sampled element has the wrong cursor.
*/
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9500 + Math.floor(Math.random() * 300);

const argv = process.argv.slice(2);
const flags = {};
const positional = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i].startsWith("--")) flags[argv[i].slice(2)] = argv[++i];
  else positional.push(argv[i]);
}
const base = positional[0] ?? "http://127.0.0.1:3131";
const cookies = flags.cookies ? JSON.parse(readFileSync(flags.cookies, "utf8")) : [];

/*
  The pages named in the request, plus the two workspace tabs that hold most of
  the controls in the product. A page with no interactive elements would pass
  silently, so each one declares how many it expects to find at least.
*/
const PAGES = [
  ["the landing page", "/", 6],
  ["sign in", "/login", 3],
  ["the demo", "/demo", 20],
  ["the demo, Deploy", "/demo?tab=deploy&pane=canvas", 20],
  ["the demo, a sheet open", "/demo?tab=deploy&pane=canvas&sheet=github", 10],
  ["the demo, Code", "/demo?tab=code&pane=canvas", 20],
  ["the signed in workspace", "/app", 6],
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
await send("Emulation.setDeviceMetricsOverride", {
  width: 1280,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
  screenWidth: 1280,
  screenHeight: 900,
});

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

/*
  Runs in the page. Collects every element a person can click, works out what
  its cursor ought to be, and reports the ones that disagree.

  "Clickable" is taken from the semantics rather than from a list of selectors:
  anything with a button, link, switch, radio or tab role, a form control, a
  summary, or a label bound to a control. An element that is none of those and
  still reacts to a click is a bug of a different kind, which the rest of the
  suite covers.
*/
const SAMPLE = `(() => {
  const wanted = (el) => {
    const role = el.getAttribute("role");
    const tag = el.tagName.toLowerCase();
    if (el.closest('[hidden]')) return null;
    if (el.getAttribute("aria-hidden") === "true") return null;
    if (el.offsetParent === null && el !== document.activeElement) return null;
    const interactive =
      (tag === "button") ||
      (tag === "a" && el.hasAttribute("href")) ||
      (tag === "summary") ||
      (tag === "select") ||
      (tag === "label" && el.hasAttribute("for")) ||
      (tag === "input" && ["checkbox", "radio", "submit", "button"].includes(el.type)) ||
      ["button", "switch", "radio", "tab", "link"].includes(role);
    if (!interactive) return null;
    const off = el.getAttribute("aria-disabled") === "true" || el.disabled === true;
    return { want: off ? "not-allowed" : "pointer" };
  };

  const rows = [];
  for (const el of document.querySelectorAll("*")) {
    const w = wanted(el);
    if (!w) continue;
    const got = getComputedStyle(el).cursor;
    rows.push({
      got,
      want: w.want,
      ok: got === w.want,
      what:
        el.tagName.toLowerCase() +
        (el.id ? "#" + el.id : "") +
        (el.getAttribute("role") ? "[role=" + el.getAttribute("role") + "]" : "") +
        ": " + (el.textContent || "").trim().slice(0, 28),
    });
  }
  return JSON.stringify(rows);
})()`;

const results = [];
let sampled = 0;

for (const [label, path, atLeast] of PAGES) {
  await send("Page.navigate", { url: `${base}${path}` });
  await sleep(1500);

  const where = (
    await send("Runtime.evaluate", {
      expression: "location.pathname",
      returnByValue: true,
    })
  ).result?.value;

  // A guarded page without a session redirects, and checking the login page
  // twice while calling it /app would be a check that cannot fail.
  if (path.startsWith("/app") && where !== path) {
    results.push({
      ok: false,
      name: `${label} was reachable`,
      detail: `redirected to ${where}, so its controls were not sampled. Pass --cookies to cover it`,
    });
    continue;
  }

  const rows = JSON.parse(
    (await send("Runtime.evaluate", { expression: SAMPLE, returnByValue: true }))
      .result?.value ?? "[]",
  );
  sampled += rows.length;
  const wrong = rows.filter((r) => !r.ok);

  results.push({
    ok: rows.length >= atLeast,
    name: `${label} has controls to check`,
    detail: `${rows.length} interactive elements, at least ${atLeast} expected`,
  });
  results.push({
    ok: wrong.length === 0,
    name: `every control on ${label} shows the right cursor`,
    detail:
      wrong.length === 0
        ? `${rows.length} elements, ${rows.filter((r) => r.want === "not-allowed").length} of them not-allowed`
        : wrong
            .slice(0, 4)
            .map((r) => `${r.what} is ${r.got}, wanted ${r.want}`)
            .join("; "),
  });
}

const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(
  `\n${results.length - failed} of ${results.length} cursor checks pass, over ${sampled} interactive elements.`,
);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
