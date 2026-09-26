/*
  Checks the rendered page, not the source.

  Two review rounds reported the same bug as "still broken" after it was marked
  fixed. Both times the code looked right and the page did not:

    1. app-preview exported defaultDevice(), whose docblock promised "under
       640px the frame starts on Phone", whose body did nothing, and which
       nothing ever called.
    2. The Real and Simulated markings on the architecture diagram were set in
       a field the renderer does not draw.

  Reading the source would have passed both. So these assertions run against
  HTML served by a real build, and they gate commits alongside
  consistency-check.mjs.

  Usage, against an already running server:

    node scripts/rendered-check.mjs http://127.0.0.1:3131

  Exits non-zero on any failure.
*/
const base = process.argv[2] ?? "http://127.0.0.1:3131";
const results = [];

function check(name, ok, detail) {
  results.push({ name, ok, detail });
}

/** Visible text only: scripts, styles, tags and React's comment separators out. */
function visibleText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<style[\s\S]*?<\/style>/g, " ")
    .replace(/<!-- -->/g, "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;|&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ");
}

async function get(path) {
  const res = await fetch(`${base}${path}`, { redirect: "follow" });
  return { status: res.status, html: await res.text() };
}

// 1. The app preview must not start on Desktop. "Auto" is the default and it
//    is phone width below 640px by CSS, because a server cannot measure a
//    viewport and this product runs without JavaScript.
{
  const { html } = await get("/demo?tab=app&pane=canvas");
  const text = visibleText(html);
  const autoSelected = /aria-current="page"[^>]*>\s*Auto\s*</.test(
    html.replace(/\s+/g, " "),
  );
  check(
    "app preview defaults to Auto, not Desktop",
    autoSelected,
    autoSelected ? "Auto is the current device" : "Auto is not marked current",
  );
  check(
    "the Auto frame is phone width below 640px",
    html.includes("max-w-[390px] sm:max-w-full"),
    "max-w-[390px] sm:max-w-full on the frame",
  );
  check(
    "the device switcher still offers an explicit override",
    text.includes("Phone") && text.includes("Desktop"),
    "Phone and Desktop present",
  );
}

// 2. Opening an agent must land on the inspector, which on a phone renders
//    far below the graph.
{
  const { html } = await get("/demo?tab=agents&pane=canvas");
  check(
    "agent links point at the inspector anchor",
    html.includes("#agent-inspector"),
    "#agent-inspector in the agent links",
  );
  const { html: opened } = await get(
    "/demo?tab=agents&pane=canvas&agent=grounding-checker",
  );
  check(
    "the inspector carries that anchor when open",
    opened.includes('id="agent-inspector"'),
    'id="agent-inspector" on the open inspector',
  );
}

// 3. The Grounding Checker must show what it checked against.
{
  const { html } = await get(
    "/demo?tab=agents&pane=canvas&agent=grounding-checker",
  );
  const text = visibleText(html);
  check(
    "the grounding inspector shows the source article",
    text.includes("Account credits apply at the next billing cycle"),
    "source text on the page",
  );
  check(
    "the fixed field is labeled as fixed",
    text.includes("Source article, fixed"),
    '"Source article, fixed"',
  );
}

// 4. Jev is explained in plain words where it is named.
{
  const { html } = await get("/demo?tab=agents&pane=canvas&agent=intake");
  const text = visibleText(html);
  check(
    "Decision model is explained, not just named",
    text.includes("chooses from a list instead of writing text"),
    "plain explainer present",
  );
}

// 5. Nothing offers a rollback on the first build.
{
  const { html } = await get("/demo?tab=plan&pane=canvas&build=failed");
  const text = visibleText(html);
  check(
    "the failed first build offers no rollback",
    !/Roll back to v\d/.test(text),
    text.includes("Nothing to roll back to")
      ? '"Nothing to roll back to"'
      : "no rollback offer found",
  );
}

// 6. The version story is one story.
{
  const { html } = await get("/demo?tab=plan&pane=canvas&build=done");
  const text = visibleText(html);
  check(
    "the build rail names which build it is showing",
    text.includes("First build, v1"),
    '"First build, v1"',
  );
  // Deploys, not builds: 14 numbers were taken this month and 9 deployed, so
  // calling 9 of them "builds" became the wrong noun (round 3).
  check(
    "the footer counts deploys and matches the rows on Deploy",
    text.includes("9 deploys this month") && !/\d+ builds this month/.test(text),
    "9 rows, 9 deploys",
  );
}

// 7. US spelling in served copy.
{
  const paths = [
    "/demo?tab=app&pane=canvas",
    "/demo?tab=agents&pane=canvas&agent=intake",
    "/demo?tab=plan&pane=canvas",
  ];
  const british =
    /\b(behaviour|colour|coloured|labelled|recognise|analyse|organisation|catalogue|centre|favourite|summarise|optimise|normalise|cancelled|modelling)\b/i;
  let found = "";
  for (const path of paths) {
    const { html } = await get(path);
    const hit = visibleText(html).match(british);
    if (hit) found = `${hit[0]} on ${path}`;
  }
  check("served copy uses US spelling", !found, found || "none of the listed forms");
}

// 8. The Agents subtitle must not claim every message runs through all four,
//    now that two agents can hand a message to a person instead (round 3).
{
  const { html } = await get("/demo?tab=agents&pane=canvas");
  const text = visibleText(html);
  check(
    "the agents subtitle does not claim all four, in order",
    !/runs through all \d+, in order/.test(text),
    "no 'all 4, in order'",
  );
  check(
    "the phone agent list names the branch to a person",
    text.includes("if not clearly decided") && text.includes("if not grounded"),
    "both branch labels present in the list",
  );
}

// 9. The config and version history expand in place, rather than replacing the
//    panel. Round 3 reported the old behavior as showing nothing.
{
  const { html } = await get(
    "/demo?tab=agents&pane=canvas&agent=grounding-checker&depth=details",
  );
  const text = visibleText(html);
  check(
    "config and version history appear without losing the panel",
    text.includes("model: typesafe-ai/jev") &&
      text.includes("Version history") &&
      text.includes("Decision model: Jev"),
    "config, versions and the model block together",
  );
  check(
    "the typed question wraps instead of clipping",
    html.includes("whitespace-pre-wrap"),
    "whitespace-pre-wrap on the JSON block",
  );
}

// 10. The Deploy table must not force a width wider than a phone card.
{
  const { html } = await get("/demo?tab=deploy&pane=canvas");
  const text = visibleText(html);
  check(
    "the deploy table sets no phone-breaking minimum width",
    !html.includes("min-w-[480px]"),
    "no min-w-[480px]",
  );
  check(
    "the skipped version numbers are explained on Deploy",
    /A version number is taken when a build starts/.test(text) &&
      text.includes("v2, v4, v7, v10, v13"),
    "the gap is accounted for",
  );
  check(
    "discarded builds are shown at $0.00",
    text.includes("$0.00"),
    "charged nothing, with a reason",
  );
}

// 11. The grounding bar is stated before a run, not only in the result.
{
  const { html } = await get(
    "/demo?tab=agents&pane=canvas&agent=grounding-checker",
  );
  const text = visibleText(html);
  check(
    "the bar is shown before anyone presses Run",
    /at least 60% sure every detail is supported/.test(text),
    "60% stated up front",
  );
  check(
    "the worked examples are shown with their date",
    /Worked examples: \d+ real calls, \d{4}-\d{2}-\d{2}/.test(text),
    "dated worked examples",
  );
}

// 12. Diagram pages link back, and the sequence title matches the button.
{
  for (const slug of ["architecture", "agent-workflow", "jev-call-sequence"]) {
    const { html, status } = await get(`/architecture/${slug}`);
    check(
      `the ${slug} page links back to the demo`,
      status === 200 && html.includes('href="/demo"'),
      `status ${status}`,
    );
  }
  const { html } = await get("/architecture/jev-call-sequence.html");
  check(
    "the sequence diagram title matches the button",
    html.includes("Run this agent") && !html.includes("Test this agent:"),
    "titled 'Run this agent'",
  );
}

// 13. A phone opening /demo lands on the app preview, not the chat rail.
{
  const { html } = await get("/demo");
  check(
    "/demo resolves to the canvas pane",
    /aria-current="page"[^>]*>\s*Canvas\s*</.test(html.replace(/\s+/g, " ")) ||
      html.includes("App preview"),
    "the canvas pane is what a phone meets first",
  );
}

const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} rendered checks pass.`);
process.exit(failed ? 1 : 0);
