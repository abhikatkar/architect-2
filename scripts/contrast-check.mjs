/*
  Every pair of colours a person actually reads, measured on the page.

  The accessibility floor in the design system says WCAG AA in both themes. It
  was a sentence in a document until the refresh moved ink to a deep navy and
  blueprint to a more vivid blue, at which point every text pair in the product
  changed at once and no amount of reading the CSS would say whether the floor
  still held. A token's contrast is also not a property of the token: text
  inherits its colour from one element and its background from another, three
  ancestors up, possibly through a translucent layer, and only the browser
  knows what that composites to.

  So this walks the rendered page. For every element with its own visible text
  it takes the computed colour, composites the backgrounds behind it until one
  is opaque, and applies the WCAG 2.1 contrast formula with the threshold the
  text's own size and weight earn: 3:1 for large text (24 px, or 18.66 px at
  700 and up), 4.5:1 for everything else.

  Three further things it checks, each because a refresh can break it quietly:

    - Interactive boundaries. A control whose outline is the only thing saying
      it is a control needs 3:1 against what is behind it (WCAG 1.4.11). A
      hairline divider is decorative and exempt, which is why `rule` and
      `rule-strong` are two tokens rather than one.
    - The focus ring, which is blueprint on paper, at 3:1.
    - The type tier. Marketing surfaces may not drop into the workspace's dense
      scale: nothing under 16 px on a page meant to be read at arm's length,
      with monospace allowed one step down at 14 px, because mono set inline in
      a sentence matches the sans around it one size smaller. It rides along
      here because this pass already holds the computed size of every run of
      text, and a second browser just to read font sizes would double the gate
      for nothing.

  Usage, against a running server:

    node scripts/contrast-check.mjs [url] [--cookies <file>]

  A cookies file from scripts/mint-session.mjs covers the signed-in screens.
  Exits non-zero on any pair below its threshold.
*/
import { spawn } from "node:child_process";
import { readFileSync } from "node:fs";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const PORT = 9600 + Math.floor(Math.random() * 90);

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
  Every surface, marked with its type tier. "marketing" pages are also held to
  the 16 px floor; the workspace is dense on purpose and is not.
*/
const PAGES = [
  ["the landing page", "/", "marketing"],
  ["sign in", "/login", "marketing"],
  ["onboarding", "/onboarding", "marketing"],
  ["privacy", "/privacy", "marketing"],
  ["terms", "/terms", "marketing"],
  ["the diagrams index", "/architecture", "marketing"],
  ["the demo, App", "/demo?tab=app&pane=canvas", "workspace"],
  ["the demo, Agents", "/demo?tab=agents&pane=canvas", "workspace"],
  ["the demo, why did it do that", "/demo?tab=agents&pane=canvas&why=r-104", "workspace"],
  ["the demo, Code", "/demo?tab=code&pane=canvas", "workspace"],
  ["the demo, Deploy", "/demo?tab=deploy&pane=canvas", "workspace"],
  ["the demo, the GitHub sheet", "/demo?tab=deploy&pane=canvas&sheet=github", "workspace"],
  ["the demo, a build running", "/demo?tab=app&pane=canvas&build=running", "workspace"],
  ["the plan gate", "/demo/plan", "workspace"],
  ["the import report", "/demo/import", "workspace"],
  ["the signed in workspace", "/app", "workspace"],
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
  Runs in the page.

  Compositing is the part worth spelling out. `getComputedStyle` gives a
  colour that may carry alpha, and a background that may be transparent or
  translucent. So the background is built by walking up from the element,
  stacking every layer that is not fully transparent, and painting them back
  to front onto the page's own background. Skipping that step reports white
  behind a chip that is actually sitting on a tinted banner.
*/
const SAMPLE = `(() => {
  const parse = (c) => {
    const m = c.match(/rgba?\\(([^)]+)\\)/);
    if (!m) return null;
    const p = m[1].split(/[,\\s\\/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const over = (top, bottom) => ({
    r: top.r * top.a + bottom.r * (1 - top.a),
    g: top.g * top.a + bottom.g * (1 - top.a),
    b: top.b * top.a + bottom.b * (1 - top.a),
    a: 1,
  });
  const lum = (c) => {
    const f = (v) => {
      const s = v / 255;
      return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b);
  };
  const ratio = (a, b) => {
    const l1 = lum(a), l2 = lum(b);
    return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
  };
  const hex = (c) =>
    "#" + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("");

  const pageBg = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 };

  /** Everything painted behind this element, composited to one opaque colour. */
  const behind = (el, includeSelf) => {
    const stack = [];
    let node = includeSelf ? el : el.parentElement;
    while (node) {
      const s = getComputedStyle(node);
      const c = parse(s.backgroundColor);
      if (c && c.a > 0) stack.push(c);
      if (c && c.a === 1) return stack.reverse().reduce((acc, layer) => over(layer, acc), c);
      node = node.parentElement;
    }
    return stack.reverse().reduce((acc, layer) => over(layer, acc), pageBg);
  };

  const visible = (el) => {
    const s = getComputedStyle(el);
    if (s.display === "none" || s.visibility === "hidden" || Number(s.opacity) === 0) return false;
    if (el.closest("[hidden]")) return false;
    if (el.getAttribute("aria-hidden") === "true" || el.closest('[aria-hidden="true"]')) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };

  const ownText = (el) => {
    let t = "";
    for (const n of el.childNodes) if (n.nodeType === 3) t += n.textContent;
    return t.replace(/\\s+/g, " ").trim();
  };

  const text = [];
  const borders = [];
  let smallest = Infinity;
  let smallestFloor = 16;
  let smallestWhat = "";

  for (const el of document.querySelectorAll("body *")) {
    if (!visible(el)) continue;
    const s = getComputedStyle(el);
    const label = ownText(el);

    if (label) {
      const fg0 = parse(s.color);
      if (fg0) {
        const bg = behind(el, true);
        const fg = fg0.a < 1 ? over(fg0, bg) : fg0;
        const size = parseFloat(s.fontSize);
        const weight = Number(s.fontWeight) || 400;
        const large = size >= 24 || (size >= 18.66 && weight >= 700);
        const need = large ? 3 : 4.5;
        const got = ratio(fg, bg);
        text.push({
          kind: "text",
          ok: got + 0.005 >= need,
          got: Math.round(got * 100) / 100,
          need,
          size,
          weight,
          fg: hex(fg),
          bg: hex(bg),
          what: el.tagName.toLowerCase() + ": " + label.slice(0, 40),
        });
        // Mono is allowed one step down, so it is measured against its own
        // floor rather than pulling the page's smallest reading down with it.
        const mono = /mono|JetBrains/i.test(s.fontFamily);
        const floor = mono ? 14 : 16;
        if (size - floor < smallest - smallestFloor) {
          smallest = size;
          smallestFloor = floor;
          smallestWhat = el.tagName.toLowerCase() + (mono ? " (mono)" : "") + ": " + label.slice(0, 40);
        }
      }
    }

    /*
      A control's own outline, where that outline is what identifies it.
      Measured on the top border, since every control here uses one width and
      one colour on all four sides.
    */
    const interactive =
      el.matches("button, [role=button], [role=radio], [role=switch], [role=tab], a[href], input, select, textarea");
    if (interactive && parseFloat(s.borderTopWidth) > 0 && s.borderTopStyle !== "none") {
      const edge0 = parse(s.borderTopColor);
      if (edge0 && edge0.a > 0) {
        const bg = behind(el, false);
        const edge = edge0.a < 1 ? over(edge0, bg) : edge0;
        const got = ratio(edge, bg);
        borders.push({
          kind: "border",
          ok: got + 0.005 >= 3,
          got: Math.round(got * 100) / 100,
          need: 3,
          fg: hex(edge),
          bg: hex(bg),
          what: el.tagName.toLowerCase() + ": " + (el.textContent || "").replace(/\\s+/g, " ").trim().slice(0, 40),
        });
      }
    }
  }

  /*
    The focus ring is an outline in blueprint, and an outline is not something
    getComputedStyle will hand over for an element that is not focused. So the
    token is resolved the way the browser resolves it, by painting it on a
    throwaway element and reading back what came out.
  */
  const probe = document.createElement("span");
  probe.style.color = "var(--blueprint)";
  document.body.appendChild(probe);
  const ring = parse(getComputedStyle(probe).color);
  probe.remove();
  const ringBg = pageBg;
  const ringRatio = ring ? ratio(ring, ringBg) : 0;

  return JSON.stringify({
    rows: text.concat(borders),
    smallest: smallest === Infinity ? null : smallest,
    smallestFloor,
    smallestWhat,
    ring: { got: Math.round(ringRatio * 100) / 100, need: 3, fg: ring ? hex(ring) : "?", bg: hex(ringBg) },
  });
})()`;

const results = [];
let pairs = 0;
let worst = { got: 99, where: "" };

for (const theme of ["light", "dark"]) {
  await send("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-color-scheme", value: theme }],
  });

  for (const [label, path, tier] of PAGES) {
    await send("Page.navigate", { url: `${base}${path}` });
    await sleep(1400);

    const where = (
      await send("Runtime.evaluate", { expression: "location.pathname", returnByValue: true })
    ).result?.value;
    if (path.startsWith("/app") || path.startsWith("/onboarding")) {
      if (where !== path.split("?")[0]) {
        results.push({
          ok: false,
          name: `${label} was reachable in ${theme}`,
          detail: `redirected to ${where}, so nothing was measured. Pass --cookies to cover it`,
        });
        continue;
      }
    }

    const data = JSON.parse(
      (await send("Runtime.evaluate", { expression: SAMPLE, returnByValue: true })).result?.value ??
        '{"rows":[]}',
    );
    const rows = data.rows;
    pairs += rows.length;
    const bad = rows.filter((r) => !r.ok);
    for (const r of rows) {
      if (r.got < worst.got) worst = { got: r.got, where: `${label} (${theme}): ${r.what}` };
    }

    results.push({
      ok: bad.length === 0,
      name: `${label} in ${theme}`,
      detail:
        bad.length === 0
          ? `${rows.length} pairs, lowest ${Math.min(...rows.map((r) => r.got)).toFixed(2)}:1`
          : bad
              .slice(0, 5)
              .map((r) =>
                `${r.kind} ${r.fg} on ${r.bg} is ${r.got}:1, needs ${r.need} (${r.what})`,
              )
              .join("; "),
    });

    if (tier === "marketing" && data.smallest !== null) {
      const ok = data.smallest >= data.smallestFloor;
      results.push({
        ok,
        name: `${label} in ${theme} stays in the marketing tier`,
        detail: ok
          ? `smallest text ${data.smallest}px against its ${data.smallestFloor}px floor`
          : `${data.smallest}px under a ${data.smallestFloor}px floor (${data.smallestWhat})`,
      });
    }

    if (path === "/" ) {
      results.push({
        ok: data.ring.got >= data.ring.need,
        name: `the focus ring is visible in ${theme}`,
        detail: `${data.ring.fg} on ${data.ring.bg} is ${data.ring.got}:1, needs ${data.ring.need}`,
      });
    }
  }
}

const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(
  `\n${results.length - failed} of ${results.length} contrast checks pass, over ${pairs} measured pairs. Tightest: ${worst.got}:1, ${worst.where}`,
);

ws.close();
chrome.kill();
process.exit(failed ? 1 : 0);
