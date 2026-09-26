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
  const { html: mixed } = await get("/demo?tab=code&pane=canvas&accept=d1&revert=d2");
  check(
    "a part accepted request says so rather than claiming either",
    visibleText(mixed).includes("part accepted"),
    "derived from its files, never stored",
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
    "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v11",
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
    text.includes("Push 42 files") && text.includes("Create 3 commits"),
    "42 files and 3 commits, from the tree and the change list",
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

// 27. The plan gate warns before a build crosses the cap.
{
  const text = visibleText((await get("/demo/plan")).html);
  check(
    "the plan gate warns that this build would pass the cap",
    /would pass your \$5\.00 cap by \$0\.37/.test(text),
    "$3.37 spent plus up to $2.00 against a $5.00 cap",
  );
  check(
    "and the warning is arithmetic, not a sentence with a number in it",
    text.includes("already spent") && text.includes("Raise the cap or build anyway"),
    "derived from three fixtures",
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
    take(/(\d+) deploys? this month/g, "ledger bar", "deploys", Number);
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
      deploys: all.filter((r) => r.key === "deploys").length,
      spend: all.filter((r) => r.key === "spend").length,
    };
    check(
      `every surface is still reporting its numbers, ${state.label}`,
      counts.version >= 6 && counts.deploys === 3 && counts.spend >= 4,
      `${counts.version} version, ${counts.deploys} deploy count, ${counts.spend} spend readings`,
    );

    const expected = {
      version: want.previewVersion,
      deploys: want.deploys,
      spend: want.spend,
    };
    const wrong = all.filter((r) => r.value !== expected[r.key]);
    check(
      `one preview version, one deploy count, one spend, ${state.label}`,
      wrong.length === 0,
      wrong.length === 0
        ? `${expected.version}, ${expected.deploys} deploys, $${expected.spend.toFixed(2)}, agreed by ${all.length} readings`
        : wrong
            .map((r) => `${r.surface} said ${r.value}, not ${expected[r.key]}`)
            .join("; "),
    );

    // The two verdict surfaces have to tell the same story as the numbers.
    const codeText = visibleText((await get(`/demo?tab=code&pane=canvas${q}`)).html);
    const whyText = visibleText(
      (await get(`/demo?tab=agents&why=${project.runs[0].id}&pane=canvas${q}`)).html,
    );
    check(
      `the Code tab and the trace agree on whether the fix landed, ${state.label}`,
      codeText.includes("ok accepted") === want.fixApplied &&
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
    ["rollback", "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v11", "rollback-v11"],
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
  const rollbackTargets = (deploy.match(/data-return-to="rollback-v\d+"/g) ?? []).length;
  check(
    "each rollback link names itself, in the phone list and the table",
    rollbackTargets === 16,
    `${rollbackTargets} return targets for 8 versions, twice over`,
  );

  // Changing tab closes whatever was open rather than carrying it along.
  const openSheet = await get(
    "/demo?tab=deploy&pane=canvas&sheet=rollback&rollback=v11",
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

const failed = results.filter((r) => !r.ok).length;
for (const r of results) {
  console.log(`  ${r.ok ? "ok  " : "FAIL"} ${r.name.padEnd(52)} ${r.detail}`);
}
console.log(`\n${results.length - failed} of ${results.length} rendered checks pass.`);
process.exit(failed ? 1 : 0);
