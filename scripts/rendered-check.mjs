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

    node --experimental-strip-types scripts/rendered-check.mjs http://127.0.0.1:3131

  The flag is for section 28, which imports the fixtures so it can compare the
  page against the derivation rather than against numbers typed in here.

  Exits non-zero on any failure.
*/
import { DEMO_PROJECT as project } from "../lib/seed/northwind.ts";
import { changeRequests, FIX_CHANGE_ID } from "../lib/seed/code.ts";
import { appliedState } from "../lib/seed/totals.ts";

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

/** Without following, so a guard's redirect can actually be asserted. */
async function raw(path) {
  const res = await fetch(`${base}${path}`, { redirect: "manual" });
  return { status: res.status, location: res.headers.get("location") ?? "" };
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
  /*
    The footer's noun.

    Round 3 changed "builds" to "deploys" because 14 builds sat above 9 rows.
    Round 4 found the replacement worse: 7 of those 9 rows read "not deployed",
    and accepting a change moved the count although it deploys nothing. It
    counts builds and says how many were kept, which is two numbers because one
    cannot be read unambiguously against a table of a different length.
  */
  check(
    "the footer counts builds and how many were kept, not deploys",
    /14 builds, 9 kept this month/.test(text) && !/deploys this month/.test(text),
    "14 builds, 9 kept",
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

// 14. The Code tab: tree, read-only file view, and the editor honesty line.
{
  const { html } = await get("/demo?tab=code&pane=canvas");
  const text = visibleText(html);
  check(
    "the code tab lists the whole file tree, read only",
    text.includes("42 files, read only"),
    "42 paths",
  );
  check(
    "the Edit control says what it would do and that this demo does not",
    text.includes("In the full product this opens an editor. This demo is read-only."),
    "editor honesty line",
  );
  check(
    "changes are grouped by the request that caused them",
    text.includes("Asked for: Show me why each conversation was escalated"),
    "request wording above the files",
  );
  check(
    "accept and revert say they are demo actions",
    text.includes("the verdict travels in the page address"),
    "demo label beside the controls",
  );
}

// 15. A file opens in mono and shows the agent's own config, not a copy of it.
{
  const { html } = await get("/demo?tab=code&pane=canvas&file=agents-answer-yaml");
  const text = visibleText(html);
  check(
    "a file opens read only in mono",
    text.includes("model: claude-sonnet-4-6") && html.includes("font-mono"),
    "agents/answer.yaml body",
  );
}

// 16. A diff renders both ways from one array, and says which lines moved.
{
  const { html } = await get("/demo?tab=code&pane=canvas&diff=d6");
  const text = visibleText(html);
  check(
    "the diff shows the parameter moving",
    text.includes("temperature: 0.4") && text.includes("temperature: 0.2"),
    "0.4 to 0.2, derived from the agent",
  );
  check(
    "side by side at laptop width, unified below it",
    html.includes("lg:table") && html.includes("lg:hidden"),
    "one array, two renderings",
  );
  check(
    "diff cells align to the top so wrapped lines keep their rhythm",
    html.includes("align-top") && html.includes("[overflow-wrap:anywhere]"),
    "align-top and wrapping, not sideways scroll",
  );
}

// 17. Verdicts are URL state, and a request reads back from its files.
{
  const { html } = await get("/demo?tab=code&pane=canvas&accept=d6");
  const text = visibleText(html);
  check(
    "an accepted file reports back as accepted",
    text.includes("ok accepted"),
    "accept=d6",
  );
  /*
    A change that shipped reads as accepted, and cannot be re-decided.

    Round 4 found a41c9e2 and c93f7a0, the changes behind the live and the
    preview version, reading "not decided yet", as though two versions had been
    deployed without anyone agreeing to them. Passing their file ids in the
    address changes nothing, which is what this asserts.
  */
  const { html: landed } = await get("/demo?tab=code&pane=canvas&accept=d1&revert=d2");
  const landedText = visibleText(landed);
  // Sliced per change, because the pending one below them is legitimately
  // undecided and a whole-page search would pass on its text.
  const blockOf = (hash) => {
    const start = landedText.indexOf(hash);
    const rest = landedText.slice(start + hash.length);
    const next = rest.search(/[0-9a-f]{7}(?![0-9a-f])/);
    return next === -1 ? rest : rest.slice(0, next);
  };
  check(
    "a change that shipped reads as accepted, with the version it shipped in",
    blockOf("a41c9e2").includes("ok accepted, in v12") &&
      blockOf("c93f7a0").includes("ok accepted, in v14") &&
      !blockOf("a41c9e2").includes("not decided yet") &&
      !blockOf("c93f7a0").includes("not decided yet"),
    "a41c9e2 in v12, c93f7a0 in v14",
  );
  check(
    "and its files are not offered a verdict at all",
    landedText.includes("Shipped in") && !landedText.includes("Accept all 3"),
    "no accept or revert on a shipped file",
  );
  const { html: junk } = await get("/demo?tab=code&pane=canvas&accept=nonsense");
  check(
    "an id that is not in the fixture is dropped, not rendered",
    !visibleText(junk).includes("nonsense"),
    "hand typed ids are validated",
  );
}

// 18. The bottom panel, and the one real artifact on the screen.
{
  const { html } = await get("/demo?tab=code&pane=canvas&panel=checks");
  const text = visibleText(html);
  check(
    "checks read like CI, with a word beside the colour",
    /ok pass\s+Type check/.test(text) && text.includes("Preview health"),
    "state carries a word",
  );
  check(
    "the real change is labeled real and linked to the commit",
    text.includes("Real change, from this repository") &&
      html.includes("/commit/b8ba98a700fc94f6f868c78b5d98b12c52b5f527"),
    "b8ba98a, generated from git",
  );
  const { html: phone } = await get("/demo?tab=code&pane=canvas");
  check(
    "the terminal is absent on a phone and says why",
    phone.includes("The terminal is not shown on a phone"),
    "D22, stated rather than silent",
  );
}

// 19. Carried state survives a tab click, which it did not before this slice.
{
  const { html } = await get("/demo?tab=agents&pane=canvas&fix=applied");
  check(
    "tab links carry the applied fix instead of silently dropping it",
    html.includes("tab=code") && /href="\/demo\?tab=code[^"]*fix=applied/.test(html),
    "fix survives a tab click",
  );
  const { html: why } = await get("/demo?tab=agents&pane=canvas&why=r-104&fix=applied");
  check(
    "but the run trace is cleared, so a tab click really changes tab",
    !/href="\/demo\?tab=code[^"]*why=/.test(why),
    "why is dropped on purpose",
  );
}

// 20. Sheets are closed until their parameter says otherwise.
{
  const { html } = await get("/demo?tab=deploy&pane=canvas");
  check(
    "no sheet is open until its parameter is present",
    !html.includes('role="dialog"'),
    "deploy opens with nothing over it",
  );
  const { html: open } = await get("/demo?tab=deploy&pane=canvas&sheet=promote");
  check(
    "a sheet opens from the address, and is a real dialog",
    open.includes('role="dialog"') && open.includes('aria-modal="true"'),
    "sheet=promote",
  );
  check(
    "the confirm is pinned so a phone never scrolls to find it",
    open.includes("sticky bottom-0"),
    "pinned footer",
  );
}

// 21. Nothing claims to have been written before its confirm.
//
// Stated as a negative on purpose: it is easy to write a screen that says
// "Connected" or "Deployed" the moment you open it, and that is the exact
// failure the teardown found on a real product.
{
  for (const path of [
    "/demo?tab=deploy&pane=canvas&sheet=promote",
    "/demo?tab=deploy&pane=canvas&sheet=github",
    "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8",
    "/demo/import",
  ]) {
    const text = visibleText((await get(path)).html);
    const claims =
      /\b(Deployed|Connected to GitHub|Repository created|Rolled back|Imported successfully|Invite sent)\b/.test(
        text,
      );
    check(
      `nothing on ${path.split("&sheet=")[1] ?? "import"} claims it already happened`,
      !claims && text.includes("Demo action"),
      "no past tense, and the demo label is present",
    );
  }
}

// 22. The consent sheet says exactly what it would write, counted not typed.
{
  const text = visibleText((await get("/demo?tab=deploy&pane=canvas&sheet=github")).html);
  check(
    "the consent sheet lists what will be written",
    text.includes("Push 42 files") && text.includes("Create 2 commits"),
    "42 files and 2 commits, from the tree and the change list",
  );
  check(
    "the repository is private by default and says so",
    /private\s+by default/.test(text),
    "the modal it replaces never said which it was",
  );
  check(
    "sync is two way by default, shown in both directions",
    text.includes("two-way") && text.includes("into Architect") && text.includes("from Architect"),
    "commits in and out",
  );
}

// 23. Import reports before it runs, and says Partial out loud.
{
  const text = visibleText((await get("/demo/import?repo=northwind%2Fbilling-api")).html);
  check(
    "the Flask repo is reported Partial, not accepted silently",
    text.includes("part Partial") && text.includes("will not modify your Python routes"),
    "the finding this screen answers",
  );
  check(
    "the branch is named as the repository default",
    text.includes("ok the repository default"),
    "the teardown found the wrong branch preselected",
  );
  check(
    "nothing is charged before Import, and the screen says so",
    text.includes("Nothing is charged before you press Import"),
    "report first, cost second",
  );
  // Asserted without following the redirect, so a 200 from the login page
  // cannot be mistaken for the guard working.
  const guarded = await raw("/app/import");
  check(
    "the signed-in import route is behind the guard",
    guarded.status >= 300 && guarded.status < 400 && guarded.location.includes("/login"),
    `${guarded.status} to ${guarded.location.replace(base, "") || "nowhere"}`,
  );
  const twin = await raw("/demo/import");
  check(
    "and the demo twin is reachable without signing in",
    twin.status === 200,
    `/demo/import ${twin.status}`,
  );
}

// 24. Deploy: safe defaults, and rollback only to versions that exist.
{
  const text = visibleText((await get("/demo?tab=deploy&pane=canvas&sheet=promote")).html);
  check(
    "marketplace is off by default with the credits note beside it",
    /off\s+List on Marketplace/.test(text) && text.includes("spend your credits"),
    "the default that cost people money",
  );
  check(
    "admin is an invite, and the env var it replaces is named",
    text.includes("Send invite") &&
      text.includes("Invite by email") &&
      text.includes("environment variable"),
    "roles and invites replace the env var",
  );
  const { html: bogus } = await get("/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v99");
  check(
    "a rollback to a version that does not exist opens nothing",
    !bogus.includes('role="dialog"'),
    "the v3-that-did-not-exist bug cannot recur",
  );
  const { html: liveTarget } = await get("/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v12");
  check(
    "a rollback to the version already live opens nothing",
    !liveTarget.includes('role="dialog"'),
    "v12 is already what people see",
  );
}

// 25. F6's last hop: accepting in Code moves the version on Deploy.
{
  const before = visibleText((await get("/demo?tab=deploy&pane=canvas")).html);
  const after = visibleText((await get("/demo?tab=deploy&pane=canvas&accept=d6")).html);
  check(
    "accepting a change in Code moves the preview version on Deploy",
    before.includes("Preview v14") && after.includes("Preview v15"),
    "one URL state, two screens",
  );
  check(
    "and Deploy says where that version came from",
    after.includes("you accepted, from the Code tab or the trace"),
    // Both routes, because the trace's apply and this accept are one change.
    "the last hop of F6",
  );
}

// 26. Screen 11, the framework picker.
{
  const { html: closed } = await get("/demo?tab=agents&pane=canvas");
  check(
    "the framework picker is closed until it is asked for",
    !closed.includes('role="dialog"') && closed.includes("Add agent"),
    "trigger present, sheet not",
  );

  const { html } = await get("/demo?tab=agents&pane=canvas&sheet=framework");
  const text = visibleText(html);
  check(
    "all five frameworks are offered",
    ["Lyzr", "GitAgent", "LangGraph", "CrewAI", "OpenAI Agents SDK"].every((n) =>
      text.includes(n),
    ),
    "the five the brief and gap 4 name",
  );
  // Lyzr is the default and manages everything, so the "no" rows only appear on
  // a framework that has gaps. Asserting them on the default would have been an
  // assertion that could never pass.
  const { html: lang } = await get(
    "/demo?tab=agents&pane=canvas&sheet=framework&framework=langgraph",
  );
  const langText = visibleText(lang);
  check(
    "the picker says what Architect cannot manage, not only what it can",
    text.includes("What you keep doing yourself") &&
      /x no/.test(langText) &&
      langText.includes("You bring the runtime"),
    "LangGraph shows the no rows",
  );
  check(
    "which frameworks exist in Architect today is not hidden",
    text.includes("in Architect today") && text.includes("new in 2.0"),
    "two today, three new",
  );
  check(
    "picking a framework creates nothing, and says so",
    text.includes("Demo action") && text.includes("No agent is created"),
    "D52 applies here too",
  );

  const { html: crew } = await get(
    "/demo?tab=agents&pane=canvas&sheet=framework&framework=crewai",
  );
  const crewText = visibleText(crew);
  check(
    "choosing a framework changes what it says you keep doing",
    crewText.includes("Architect will not rewrite your crew definitions") &&
      crewText.includes("3 of 5"),
    "CrewAI names three things that stay yours",
  );
}

/*
  27. The plan gate states the cap against what has actually been spent.

  It used to be handed the month's whole spend while reviewing the first build,
  so it read "$3.37 already spent" about a build that had not run and whose own
  $1.46 was inside that figure. Before the first version, nothing has been
  spent. The cap is still checked, in the same derived sentence, and the over
  branch is proven by invariant on the state where it is true.
*/
{
  const text = visibleText((await get("/demo/plan")).html);
  check(
    "the plan gate counts nothing spent before the first build",
    /\$0\.00 spent this month so far/.test(text) &&
      text.includes("This is the first build of this project"),
    "$0.00, not the month's $3.37",
  );
  check(
    "and it still states the cap this build would use",
    /would use up to \$2\.00 of your \$5\.00 cap/.test(text) &&
      !text.includes("would pass your"),
    "checked, and it does not cross",
  );
}

/*
  28. One page, one set of numbers.

  This is the assertion round 4 found missing. Sections above check that a
  parameter produces the right number on the screen that owns it, one screen at
  a time. Nothing checked that the screens agreed with each other, and they did
  not: accepting the fix in the Code tab moved the Deploy panel to v15 while the
  ledger bar underneath still read v14, and setting the fix flag did the
  opposite. Both were "correct" by the old assertions.

  So this reads every surface that states a preview version, a deploy count or a
  spend, on every tab that shows one, and requires them all to agree with each
  other and with appliedState. Five states: the default, the fix applied from
  the trace, the same file accepted in the Code tab, both at once, and accepted
  then reverted.
*/
{
  const fixDiffs = changeRequests(project)
    .find((c) => c.id === FIX_CHANGE_ID)
    .diffs.map((d) => d.id)
    .join(".");

  const STATES = [
    { label: "default", fix: false, accept: "", revert: "" },
    { label: "fix applied from the trace", fix: true, accept: "", revert: "" },
    { label: "the file accepted in the Code tab", fix: false, accept: fixDiffs, revert: "" },
    { label: "both routes at once", fix: true, accept: fixDiffs, revert: "" },
    { label: "applied, then reverted", fix: true, accept: fixDiffs, revert: fixDiffs },
  ];

  /* Every reading of a shared number on the page, with the surface that said
     it, so a disagreement names the two surfaces rather than just failing. */
  const readings = (text, where) => {
    const found = [];
    const take = (re, surface, key, cast) => {
      for (const m of text.matchAll(re)) {
        found.push({ surface: `${surface} (${where})`, key, value: cast(m[1]) });
      }
    };
    take(/Preview (v\d+)/g, "preview label", "version", String);
    take(/Preview is now on (v\d+)/g, "conversation rail", "version", String);
    take(/Deploy (v\d+) to production/g, "deploy control", "version", String);
    take(/Applied as (v\d+) in preview/g, "why panel", "version", String);
    take(/(\d+) builds, (?:\d+) kept this month/g, "ledger bar", "builds", Number);
    take(/(\d+) versions plus \d+ discarded at/g, "table total row", "versionsKept", Number);
    take(/\$(\d+\.\d\d) of \$5\.00/g, "spend", "spend", Number);
    return found;
  };

  for (const state of STATES) {
    const q =
      `&${state.fix ? "fix=applied&" : ""}accept=${state.accept}&revert=${state.revert}`;
    const want = appliedState(project, state.fix, state.accept, state.revert);

    const pages = [
      ["deploy", `/demo?tab=deploy&pane=canvas${q}`],
      ["code", `/demo?tab=code&pane=canvas${q}`],
      ["why", `/demo?tab=agents&why=${project.runs[0].id}&pane=canvas${q}`],
    ];

    const all = [];
    for (const [where, path] of pages) {
      all.push(...readings(visibleText((await get(path)).html), where));
    }

    // A vanished surface must fail rather than pass by saying nothing. Three
    // tabs give at least the ledger's version, count and spend on each.
    const counts = {
      version: all.filter((r) => r.key === "version").length,
      builds: all.filter((r) => r.key === "builds").length,
      spend: all.filter((r) => r.key === "spend").length,
      versionsKept: all.filter((r) => r.key === "versionsKept").length,
    };
    check(
      `every surface is still reporting its numbers, ${state.label}`,
      counts.version >= 6 &&
        counts.builds === 3 &&
        counts.spend >= 4 &&
        counts.versionsKept === 1,
      `${counts.version} version, ${counts.builds} build count, ${counts.spend} spend, ${counts.versionsKept} row count readings`,
    );

    const expected = {
      version: want.previewVersion,
      builds: want.builds,
      spend: want.spend,
      versionsKept: want.versionsKept,
    };
    const wrong = all.filter((r) => r.value !== expected[r.key]);
    check(
      `one preview version, one deploy count, one spend, ${state.label}`,
      wrong.length === 0,
      wrong.length === 0
        ? `${expected.version}, ${expected.builds} builds, ${expected.versionsKept} kept, $${expected.spend.toFixed(2)}, agreed by ${all.length} readings`
        : wrong
            .map((r) => `${r.surface} said ${r.value}, not ${expected[r.key]}`)
            .join("; "),
    );

    /*
      The rows, added up from the page.

      This is the assertion round 4's blocker needed: the total was right, the
      footer was right, and the table under them summed to something else.
      Reading the cost column out of the HTML is the only way to catch that.
    */
    {
      const deployHtml = (await get(`/demo?tab=deploy&pane=canvas${q}`)).html;
      const costs = [
        ...deployHtml.matchAll(
          /<td class="border-b border-rule py-2 pr-4 font-mono text-cost">\s*\$(\d+\.\d\d)\s*<\/td>/g,
        ),
      ].map((m) => Number(m[1]));
      const summed = +costs.reduce((a, b) => a + b, 0).toFixed(2);
      check(
        `the version rows add up to the total the screen states, ${state.label}`,
        costs.length === want.versionsKept && summed === want.spend,
        `${costs.length} rows summing to $${summed.toFixed(2)} against a stated $${want.spend.toFixed(2)}`,
      );
      check(
        `the row for what is in preview exists and is the only one, ${state.label}`,
        // Twice, because the phone list and the table both render every row and
        // one of them is hidden by CSS at any width.
        (deployHtml.match(/>preview</g) ?? []).length === 2 &&
          deployHtml.includes(`>${want.previewVersion}</td>`),
        `${want.previewVersion} is the only row marked preview, in both lists`,
      );
    }

    // The two verdict surfaces have to tell the same story as the numbers.
    const codeText = visibleText((await get(`/demo?tab=code&pane=canvas${q}`)).html);
    const whyText = visibleText(
      (await get(`/demo?tab=agents&why=${project.runs[0].id}&pane=canvas${q}`)).html,
    );
    /*
      Scoped to the pending change, because the two that shipped always read as
      accepted now. The pending one's own line is what tracks the fix state.
    */
    const pendingLine = codeText.match(/7be0d15[^|]{0,180}/)?.[0] ?? "";
    check(
      `the Code tab and the trace agree on whether the fix landed, ${state.label}`,
      pendingLine.includes("ok accepted") === want.fixApplied &&
        /Applied as v\d+ in preview/.test(whyText) === want.fixApplied,
      want.fixApplied
        ? "accepted in the Code tab, applied in the trace"
        : "open in the Code tab, not applied in the trace",
    );
  }
}

/*
  29. Closing a sheet has somewhere to put focus, and leaves nothing behind.

  The focus behaviour itself is measured in a browser by scripts/focus-check.mjs,
  because activeElement is not in the HTML. What is in the HTML is the half that
  makes it possible: a close link that names its trigger, and a trigger with that
  name on the page. The rollback sheet had neither, and D51 claimed otherwise.
*/
{
  const SHEETS = [
    ["promote", "/demo?tab=deploy&pane=canvas&sheet=promote", "promote-trigger"],
    ["github", "/demo?tab=deploy&pane=canvas&sheet=github", "github-trigger"],
    ["rollback", "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8", "rollback-v8"],
    ["framework", "/demo?tab=agents&pane=canvas&sheet=framework", "add-agent-trigger"],
  ];

  for (const [name, path, trigger] of SHEETS) {
    const { html } = await get(path);
    check(
      `the ${name} sheet closes to its own trigger`,
      html.includes('role="dialog"') && html.includes(`#${trigger}"`),
      `close links carry #${trigger}`,
    );
    const { html: closed } = await get(path.replace(/&sheet=[^&]*/, ""));
    check(
      `and that trigger is on the page to receive focus`,
      closed.includes(`data-return-to="${trigger}"`),
      `data-return-to="${trigger}" present with the sheet shut`,
    );
  }

  // Both copies of the rollback link, because only one is visible at a time and
  // the client picks the visible one.
  const { html: deploy } = await get("/demo?tab=deploy&pane=canvas");
  /*
    One rollback target and one promotion target, each named twice because the
    phone list and the table both render every row. Before, every row that was
    not live offered a rollback, including eight that had never been live.
  */
  const backTargets = (deploy.match(/data-return-to="rollback-v\d+"/g) ?? []).length;
  const upTargets = (deploy.match(/data-return-to="promote-v\d+"/g) ?? []).length;
  check(
    "each version's own control names itself, in the phone list and the table",
    backTargets === 2 && upTargets === 2,
    `${backTargets / 2} rollback and ${upTargets / 2} promote targets, each rendered twice`,
  );

  // Changing tab closes whatever was open rather than carrying it along.
  const openSheet = await get(
    "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8",
  );
  const tabLinks = (openSheet.html.match(/href="\/demo\?[^"]*tab=agents[^"]*"/g) ?? []);
  check(
    "switching tab drops the sheet parameters",
    tabLinks.length > 0 && tabLinks.every((h) => !h.includes("sheet=") && !h.includes("rollback=")),
    `${tabLinks.length} links to Agents, none carrying a sheet`,
  );
}

// 30. Every page names itself, including the one that is only a sign-in form.
{
  const { html } = await get("/login");
  check(
    "the sign-in page has a title of its own",
    /<title>Sign in \| Architect 2\.0<\/title>/.test(html),
    "not the root layout's title",
  );
}

/*
  31. A rollback goes back to something that was live.

  Round 4: a rollback was offered to v1 through v11, none of which had ever been
  in production, and to v14, which is newer than production and is a promotion.
  The v11 sheet then listed v14 under "What reverts" and said in the next
  sentence that v14 stays in preview.
*/
{
  const { html } = await get("/demo?tab=deploy&pane=canvas");
  const text = visibleText(html);
  check(
    "only a version that was in production offers a rollback",
    (html.match(/>Roll back</g) ?? []).length === 2 &&
      html.includes('id="rollback-v8"'),
    "v8 only, in the phone list and the table",
  );
  check(
    "a version newer than production offers a promotion instead",
    (html.match(/>Promote</g) ?? []).length === 2 &&
      html.includes('id="promote-v14"'),
    "v14 is promoted, not rolled back",
  );
  check(
    "and a version that was never live and is older offers neither",
    (text.match(/never live, older than production/g) ?? []).length === 12,
    "6 versions, in both lists",
  );
  check(
    "the screen states the real number of production deploys",
    /2 deploys to production this month, out of 14 builds/.test(text),
    "2 of 14, which is what the word means",
  );

  const sheet = visibleText(
    (await get("/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8")).html,
  );
  check(
    "what reverts on a rollback is what was in production",
    // The list itself, between its heading and the sentence after it.
    /What reverts in production(.*?)After this/.test(sheet) &&
      sheet.match(/What reverts in production(.*?)After this/)[1].includes("v12") &&
      !sheet.match(/What reverts in production(.*?)After this/)[1].includes("v14"),
    "v12 reverts, v14 is not in the list",
  );
  check(
    "and the sheet does not contradict itself about preview",
    /v14 stays in preview and is not affected, because it has never been live/.test(
      sheet,
    ),
    "one claim about v14, not two",
  );
  const missing = await get("/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v11");
  check(
    "a rollback to a version that was never live opens nothing",
    !missing.html.includes('role="dialog"'),
    "v11 was never in production",
  );
}

/*
  32. The commits the consent sheet would create are the ones the Code tab lists.

  The sheet said "3 commits" while the only hashes anywhere near it were two
  that arrive from the editor, so the three it meant appeared on no screen.
*/
{
  const sheet = visibleText(
    (await get("/demo?tab=deploy&pane=canvas&sheet=github")).html,
  );
  const code = visibleText((await get("/demo?tab=code&pane=canvas")).html);
  const landedHashes = ["a41c9e2", "c93f7a0"];
  check(
    "the consent sheet names the commits it would create",
    landedHashes.every((h) => sheet.includes(h)),
    landedHashes.join(", "),
  );
  check(
    "and every one of them is on the Code tab",
    [...landedHashes, "7be0d15"].every((h) => code.includes(h)),
    "the same list, not a second one",
  );

  /*
    A change nobody has agreed to is not a commit.

    The sheet offered to push the pending reliability fix in the default state,
    where it has not been accepted anywhere. It appears once it has, by either
    route, which is the same signal every other surface reads (D57).
  */
  for (const [label, q, expected] of [
    ["not accepted", "", 2],
    ["applied from the trace", "&fix=applied", 3],
    ["accepted in the Code tab", "&accept=d6", 3],
    ["accepted then reverted", "&accept=d6&revert=d6", 2],
  ]) {
    const t = visibleText(
      (await get(`/demo?tab=deploy&pane=canvas&sheet=github${q}`)).html,
    );
    // Only the sheet's own list: the pending change is also named on the
    // Deploy screen behind it, under "Waiting on your review".
    const list = t.slice(
      t.indexOf("What will be written"),
      t.indexOf("Counted and named"),
    );
    check(
      `the push list holds only landed or accepted changes, ${label}`,
      list.includes(`Create ${expected} commit`) &&
        list.includes("7be0d15") === (expected === 3),
      `${expected} commits, the pending fix ${expected === 3 ? "included" : "left out"}`,
    );
  }
  check(
    "the commits arriving from the editor are labelled as such",
    sheet.includes("commits you made in your own editor"),
    "3f21a0c and 9d4e7b1 are not Architect's",
  );
}

/*
  33. The fix reaches the app preview.

  After applying it the trace claimed the question had been re-run and came back
  grounded, while the App tab still showed the escalated answer with "Why did it
  do that?" beside it.
*/
{
  const before = visibleText((await get("/demo?tab=app&pane=canvas")).html);
  const after = visibleText(
    (await get("/demo?tab=app&pane=canvas&fix=applied")).html,
  );
  check(
    "the preview escalates the credit question until the fix is applied",
    before.includes("I do not have a reliable answer for that") &&
      before.includes("Escalated to a human"),
    "the escalated answer, and why",
  );
  check(
    "and answers it once the fix is applied",
    after.includes("Your credit will be applied at the next billing cycle.") &&
      !after.includes("Escalated to a human") &&
      after.includes("grounded, answered after the fix"),
    "the corrected answer, on v15",
  );
  check(
    "the version in the preview frame follows the same state",
    after.includes("v15") && before.includes("v14"),
    "v14 before, v15 after",
  );
}

/*
  34. The banner carries the state it was clicked from.

  Following "Why did it do that?" with the fix applied reset the whole page to
  v14 and $3.37, because the banner links were written by hand.
*/
{
  const { html } = await get("/demo?tab=app&pane=canvas&fix=applied");
  const banner = html.slice(0, html.indexOf("Sign in to build your own"));
  const links = [...banner.matchAll(/href="(\/demo\?[^"]*)"/g)].map((m) =>
    m[1].replace(/&amp;/g, "&"),
  );
  check(
    "every banner link into the workspace carries the applied fix",
    links.length >= 3 && links.every((h) => h.includes("fix=applied")),
    `${links.length} links, all carrying fix=applied`,
  );
  const carried = await get("/demo?tab=agents&why=r-104&pane=canvas&fix=applied");
  check(
    "and following one keeps the page on v15",
    visibleText(carried.html).includes("Preview v15"),
    "the trace opens without resetting the state",
  );
}

/*
  35. One charging policy, in the same words on both screens.

  The failure screen read "Spent $0.71" while Deploy said a failed build is
  charged $0.00, which are two different products.
*/
{
  const POLICY =
    "A failed build is charged $0.00, because the platform did not deliver a working app.";
  const failed = visibleText((await get("/demo?tab=app&build=failed&pane=canvas")).html);
  const deploy = visibleText((await get("/demo?tab=deploy&pane=canvas")).html);
  check(
    "the failure screen states what a failed build costs",
    failed.includes("$0.71 used, not charged because the build failed") &&
      failed.includes(POLICY),
    "$0.71 used, $0.00 charged",
  );
  check(
    "and Deploy states it in the same words",
    deploy.includes(POLICY),
    "one string, two screens",
  );
  check(
    "neither screen says a failed build was spent",
    !failed.includes("Spent $0.71"),
    "used, not spent",
  );
}

/*
  36. The confirm controls are controls.

  Seven of them were styled spans: unfocusable, inert, and silent about it.
*/
{
  for (const [where, path, id] of [
    ["promote", "/demo?tab=deploy&pane=canvas&sheet=promote", "promote-confirm"],
    ["rollback", "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v8", "rollback-confirm"],
    ["github", "/demo?tab=deploy&pane=canvas&sheet=github", "github-confirm"],
    ["invite", "/demo?tab=deploy&pane=canvas&sheet=promote", "invite-confirm"],
    ["import", "/demo/import", "import-confirm"],
  ]) {
    const { html } = await get(path);
    const button = html.match(
      new RegExp(`<button[^>]*id="${id}"[^>]*>`),
    )?.[0];
    check(
      `the ${where} confirm is a button that says it does nothing`,
      Boolean(button) &&
        button.includes('aria-disabled="true"') &&
        button.includes(`aria-describedby="${id}-note"`) &&
        html.includes(`id="${id}-note"`),
      "a real button, with the demo note as its description",
    );
  }
  const { html } = await get("/demo?tab=deploy&pane=canvas&sheet=promote");
  check(
    "the Marketplace setting is a switch that says which way it is set",
    /<button[^>]*role="switch"[^>]*aria-checked="false"[^>]*aria-disabled="true"/.test(
      html.replace(/\s+/g, " "),
    ),
    "off, and it says so to a screen reader",
  );
  const github = await get("/demo?tab=deploy&pane=canvas&sheet=github");
  check(
    "the repository choice is a radio group rather than two chips",
    github.html.includes('role="radiogroup"') &&
      (github.html.match(/role="radio"/g) ?? []).length === 2 &&
      github.html.includes('aria-checked="true"'),
    "two options, one selected, both reachable",
  );
}

/*
  37. Every worked example shows the source it was checked against.

  Three of the six are about refunds while the sample above them is about
  credits, so against the visible source "Refund requests are reviewed by our
  support team" read as an unrelated claim passing at 78%.
*/
{
  const text = visibleText(
    (
      await get(
        "/demo?tab=agents&pane=canvas&agent=grounding-checker&depth=details",
      )
    ).html,
  );
  check(
    "each example names its own source",
    (text.match(/checked against:/g) ?? []).length === 6,
    "6 examples, 6 sources",
  );
  check(
    "the refund examples show the refund article",
    text.includes(
      "Refund requests made within 14 days of purchase are reviewed by our support team.",
    ) && text.includes("a different article from the sample above"),
    "not the credits article",
  );
  check(
    "the Escalation Router does not reuse the checker's wording",
    !visibleText(
      (
        await get(
          "/demo?tab=agents&pane=canvas&agent=escalation-router&depth=details",
        )
      ).html,
    ).includes("what the answer was checked against"),
    "its fixed field is a reason, not a source",
  );
  const intake = visibleText(
    (await get("/demo?tab=agents&pane=canvas&agent=intake&depth=details")).html,
  );
  check(
    "the Intake inspector states the bar it would apply",
    intake.includes("at least 60% sure") && intake.includes("goes to a person"),
    "60%, named where it is used",
  );
}

/* 38. The theme switch works before hydration, which only a browser can check. */
{
  const { html } = await get("/demo");
  check(
    "the theme fast path is registered from the document itself",
    html.includes("data-theme-form") &&
      html.includes('form[data-theme-form] button[name="theme"]'),
    "a capture handler, not only the hydrated component",
  );
}

/*
  39. The inbox says why its counts do not move when the fix does.

  The chat answers the credit question once the fix is applied, so a reader can
  reasonably expect "7 escalated" to become 6. It does not, because those are
  the month's conversations and Lena K.'s was escalated before the fix existed.
*/
{
  const text = visibleText(
    (await get("/demo?tab=app&pane=canvas&fix=applied")).html,
  );
  check(
    "the admin inbox says its counts are history",
    text.includes("This month's conversations") &&
      text.includes("an answer that already went to a person stays there"),
    "7 escalated stays 7, and the screen says why",
  );
  check(
    "and Lena K.'s earlier conversation is still escalated after the fix",
    /Lena K\.[^|]{0,80}escalated/.test(text),
    "history is not rewritten by a fix",
  );
}

/* 40. Each repository option carries its own description, not the group's. */
{
  const { html } = await get("/demo?tab=deploy&pane=canvas&sheet=github");
  check(
    "every repository option describes what would happen to it",
    ["repo-new", "repo-existing"].every(
      (id) =>
        new RegExp(`id="${id}"[^>]*aria-describedby="${id}-note"`).test(
          html.replace(/\s+/g, " "),
        ) && html.includes(`id="${id}-note"`),
    ),
    "two options, two notes",
  );
}

/* 41. Every clickable thing shows the pointing hand. Checked in a browser by
   scripts/cursor-check.mjs, because a cursor is a computed style. What is in
   the HTML is the rule itself, which is asserted here so it cannot vanish. */
{
  const page = await fetch(`${base}/demo`).then((r) => r.text());
  // Whatever Next called the bundle: its path moves between builds.
  const href = page.match(/href="(\/_next\/static\/[^"]+\.css)"/)?.[1];
  const sheet = href ? await fetch(`${base}${href}`).then((r) => r.text()) : "";
  check(
    "the cursor rule is in the served stylesheet",
    Boolean(href) &&
      // The minifier drops the quotes around the attribute value.
      /button:not\(\[aria-disabled=("?)true\1\]\):not\(:disabled\)/.test(sheet) &&
      sheet.includes("cursor:pointer") &&
      sheet.includes("cursor:not-allowed"),
    href ? "one rule, served, not a utility class per control" : "no stylesheet found",
  );
}

/* 42. The tab icon and the link preview are this project's own. */
{
  const { html } = await get("/");
  check(
    "the page carries our own icon, not the framework's default",
    /<link rel="icon"[^>]*\/icon\.svg/.test(html) &&
      !html.includes("favicon.ico"),
    "app/icon.svg, and no favicon.ico",
  );
  check(
    "a shared link has a preview image and a description",
    /<meta property="og:image"[^>]*opengraph-image/.test(html) &&
      /<meta property="og:title" content="Architect 2\.0"/.test(html) &&
      /See it\. Steer it\. Own it\. Ship it safely\./.test(html),
    "1200x630, titled and described",
  );
  const icon = await fetch(`${base}/icon.svg`);
  const svg = await icon.text();
  check(
    "the icon is a real SVG with a dark variant inside it",
    icon.status === 200 &&
      svg.includes("prefers-color-scheme: dark") &&
      svg.includes("#2451e6"),
    "blueprint light and dark, in one file",
  );
  const og = await fetch(`${base}/opengraph-image.png`);
  // The body, not the header: the response can be chunked with no length.
  const bytes = (await og.arrayBuffer()).byteLength;
  check(
    "and the preview image is actually served",
    og.status === 200 &&
      og.headers.get("content-type") === "image/png" &&
      bytes > 10000,
    `${og.status}, ${og.headers.get("content-type")}, ${bytes} bytes`,
  );
}

/*
  43. The landing page shows a real screen and four checkable figures.

  A landing page is the one surface where it is easiest to show something the
  product does not have, which is what the teardown found on five other tools.
  So the picture is asserted to be the file scripts/landing-still.mjs writes
  from this build, in both themes, and each principle is asserted to carry its
  teardown figure rather than an adjective.
*/
{
  const { html } = await get("/");
  const text = visibleText(html);

  check(
    "the landing page shows the real screen, in both themes",
    html.includes("/still/why-did-it-do-that-light.png") &&
      html.includes("/still/why-did-it-do-that-dark.png") &&
      html.includes('data-shot="light"') &&
      html.includes('data-shot="dark"'),
    "two files, switched by the same rules as the tokens",
  );

  for (const [file, what] of [
    ["why-did-it-do-that-light.png", "light"],
    ["why-did-it-do-that-dark.png", "dark"],
  ]) {
    const res = await fetch(`${base}/still/${file}`);
    const bytes = (await res.arrayBuffer()).byteLength;
    check(
      `and the ${what} screenshot is actually served`,
      res.status === 200 &&
        res.headers.get("content-type") === "image/png" &&
        bytes > 10000,
      `${res.status}, ${res.headers.get("content-type")}, ${bytes} bytes`,
    );
  }

  const FIGURES = ["42 min", "8 steps", "0 presses", "2 defaults"];
  check(
    "every promise carries a figure from the teardown",
    FIGURES.every((f) => text.includes(f)),
    FIGURES.filter((f) => !text.includes(f)).join(", ") || FIGURES.join(", "),
  );

  check(
    "the hero makes one claim and one sentence of it",
    text.includes("Build agentic apps you can see inside.") &&
      text.includes(
        "Every layer is visible while it runs, steerable when it goes wrong, yours when you leave, and reversible once it is live.",
      ),
    "thesis and one sentence",
  );

  check(
    "and it is still honest about what is simulated",
    /Sign-in and projects are real; build, agents, code and deploy flows are simulated\./.test(
      text,
    ),
    "the footer says which half is real",
  );
}


const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} rendered checks pass.`);
process.exit(failed ? 1 : 0);
