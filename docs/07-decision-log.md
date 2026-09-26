# 07. Decision log

Format: date, decision, evidence, alternatives rejected.

---

### D1. 2026-09-24: Build on Next.js + Supabase + Vercel, not Lyzr's Python + MongoDB stack
- **Evidence:** The rubric ranks working functionality last and names "database or Google sign-in" as the bonus.
  Supabase provides both in hours. Reviewers evaluate a live URL and a repo, not backend parity.
- **Rejected:** Matching Lyzr's stack. It costs build days and earns nothing against the rubric.
  Instead, [08-architecture.md](08-architecture.md) maps each screen to how it would run on Lyzr's agent backend.

### D2. 2026-09-24: Document the full process in the repo
- **Evidence:** This is a TPM role. The process (research, decisions, tradeoffs) is as much the deliverable as the app.
- **Rejected:** A code-only repo with a default README.

### D3. 2026-09-24: Research before design, split across three parallel streams
- **Evidence:** "Think from first principles" is stated twice in the brief. First principles requires knowing what users actually struggle with.
- **Streams:** hands-on teardown, planned for 7 tools and completed for 5 (Claude Cowork), voice of customer (Perplexity), Architect architecture and docs (Claude). The cut to 5 is [D11](#d11-2026-09-24-stop-the-teardown-at-5-tools-skip-bolt-and-rocket).

### D4. 2026-09-24: Design artifacts live in docs/design/, not in renumbered top-level docs
- **Evidence:** Design, UI/UX and flows is the top judging criterion, yet no doc owned the visual language,
  the screen and state inventory, or the seed content that makes simulated flows feel real. Three new files
  now own them: [design/design-system.md](design/design-system.md), [design/screen-inventory.md](design/screen-inventory.md),
  and [design/content-and-seed-data.md](design/content-and-seed-data.md).
- **Rejected:** Renumbering the 00 to 09 sequence to slot them into reading order. It breaks every existing
  cross-link and the README reading list for no gain. A subfolder follows the precedent already set by docs/research/.

### D5. 2026-09-24: Strip unverified figures from research docs, keep the qualitative finding
- **Evidence:** [02-voice-of-customer.md](02-voice-of-customer.md) carried three numbers marked "(unverified)":
  a Replit bill amount, Emergent credit pricing, and Stack Overflow survey percentages. A number that cannot be
  traced to an original source is a liability in a hiring deliverable, and the finding it supports survives
  without it. The behaviour those numbers illustrate is well attested on its own.
- **Rejected:** Keeping them behind the "(unverified)" label. The label does not travel. Once a figure is in the
  doc it gets quoted into strategy and product copy, and the caveat is lost.
- **Reversible:** Any figure may be restored once checked against its original source.

### D6. 2026-09-24: "Architect 2.0" means the next product generation, not a version number
- **Evidence:** The docs changelog shows Lyzr already shipped a release called v2.0.0 on 2026-06-18
  (UI revamp, planning mode, custom themes), and the live product is v2.2.0 as of 2026-08-07.
  A submission presenting itself as "version 2.0" would be naming a release that shipped three months ago.
  Details in [research/architect-today-research.md](research/architect-today-research.md).
- **Rejected:** Reading the brief's "2.0" as a literal version target. Stating the distinction explicitly in
  [03-architect-today.md](03-architect-today.md) also shows reviewers that the real product was studied,
  which a version-number reading would not.

### D7. 2026-09-24: Use @supabase/ssr with cookie based sessions
- **Evidence:** Sessions must be readable by React Server Components, because the protected page checks the
  user on the server. A token in localStorage is invisible to the server, which forces every guard into the
  client where it can be bypassed. `@supabase/ssr` stores the session in cookies and refreshes it on the
  server, which keeps the check where it belongs.
- **Rejected:** `@supabase/auth-helpers-nextjs`, which Supabase has deprecated in favour of `@supabase/ssr`.
  Also rejected: the plain `supabase-js` browser client on its own, for the localStorage reason above.

### D8. 2026-09-24: Guard routes in proxy.ts, not per page, and adopt the new file name
- **Evidence:** One guard covering `/app` and everything below it cannot be forgotten when a route is added,
  whereas a per-page check is opt-in and silently absent on any page that omits it. The proxy also has to run
  regardless, because that is where the session token gets refreshed. Next 16 renamed the `middleware` file
  convention to `proxy` and warns on the old name at build time, so the repo uses `proxy.ts`.
- **Rejected:** Per page guards alone. The protected page does still re-check the user, but as a second layer,
  not as the only one.
- **Note:** With no Supabase credentials present, the guard denies protected routes instead of passing the
  request through. A configuration mistake should fail closed.

### D9. 2026-09-24: Namespace authenticated product routes under /app
- **Evidence:** A single prefix makes the guard a one-line rule and keeps marketing pages, auth routes, and
  the product itself visibly separate in both the URL and the file tree. It also leaves the root path free
  for the homepage the brief asks for.
- **Rejected:** Authenticated routes at the root, for example `/builder` and `/agents` as siblings of `/`.
  That spreads the guard across a list of paths that has to be maintained by hand.

### D10. 2026-09-24: Set agentRules: false in next.config.ts
- **Evidence:** `next dev` appends a generated instructions block to `CLAUDE.md` on every run. That file holds
  this project's own instructions, and the generated text contains em dashes, which those instructions forbid.
  The block also re-creates itself after any manual removal.
- **Rejected:** Committing the generated block. It would put a rule violation in the file that states the rule.
  Also rejected: deleting it after each run, since `next dev` simply writes it again.

### D11. 2026-09-24: Stop the teardown at 5 tools, skip Bolt and Rocket
- **Evidence:** Five tools were tested end to end and produced a clear, consistent picture: the cost, progress
  and reliability findings repeat across Architect, Lovable, Replit, Emergent and v0, and the two positioning
  answers the brief asks for are already supported. Bolt and Rocket both require creating new accounts, which
  is out of scope, so finishing them would cost real time to sharpen a conclusion that is not in doubt.
- **Rejected:** Creating two accounts to complete the set. Symmetry is not worth the time against a rubric that
  ranks design first, and the pre-signup observations are still recorded in
  [01-competitive-teardown.md](01-competitive-teardown.md).
- **Honesty requirement:** Both tools are shown as untested everywhere they appear. Neither is given a timing,
  a cost, or a place in the comparison table.

### D12. 2026-09-24: Redact screenshots by cropping and blurring, never by editing the UI
- **Evidence:** The two capabilities that make the strongest case for Architect, private repo import and
  per-commit revert, could not be shown at all under the original rule of skipping any frame containing a
  credit balance or account details. Architect renders the balance in a persistent top bar, so every capture
  of both features was disqualified, and the portfolio lost its best evidence to a blanket rule.
- **Policy:** A published screenshot may be redacted only by cropping a region away or by blurring it beyond
  recovery (pixelate, then blur). Nothing in the product interface may be moved, retouched, recoloured or
  recomposed. Every redacted image is named `*-redacted` and captioned
  "Account details redacted; UI otherwise unedited." so a reviewer knows exactly what was done.
- **Applied to:** the GitHub handle, the organization name, private repository names, and the account balance
  badge. Feature-bearing detail stays legible: the PRIVATE badges survive in the import frame, because the
  claim being evidenced is that Architect lists private repos at all.
- **Rejected:** Publishing the raw frames, which would expose a real person's private repository names.
  Also rejected: retouching the balance to a plausible fake number, which is fabricating evidence, and
  leaving the two features unevidenced, which was the status quo and the weakest option of the three.

### D13. 2026-09-25: The thesis is "See it. Steer it. Own it. Ship it safely."
- **Decision:** Architect 2.0 is the agentic app builder where every layer is visible, steerable, and yours.
  Four principles carry it: See it (know what is happening and what it costs), Steer it (open and control any
  layer at your depth), Own it (your code and agents are yours), Ship it safely (going live never surprises you).
- **Evidence:** Each principle is anchored to a measured failure, not a slogan. See it: a 42 minute build
  behind a "4 to 6 min" label, and $3.33 spent with no estimate ([01](01-competitive-teardown.md)). Steer it:
  diagnosing one misbehaving agent took about 8 technical steps, and agent editing lives in a different product
  ([03](03-architect-today.md)). Own it: a GitHub repo was created and set to auto-sync with no user action, and
  import accepted an unsupported Flask repo silently ([03](03-architect-today.md)). Ship it safely: Marketplace
  publishing defaults to on and spends the owner's credits, and admin access requires a server env var.
- **Rejected:** "Fastest prompt to app", which is the category's existing promise and the one the teardown
  shows every tool failing to keep. Also rejected: positioning purely at developers, which abandons the
  audience Architect already has.
- **Full strategy:** [05-product-strategy.md](05-product-strategy.md).

### D14. 2026-09-25: One product, depth on demand, with no technical mode switch
- **Decision:** Every screen opens on the guided layer (plain language, progress, cost, one next action), and
  every guided element carries an "Open details" affordance that reveals the layer underneath: plan becomes PRD,
  agent card becomes config files, preview becomes code and diff, deploy becomes logs and versions. Onboarding
  asks how the user likes to build, and that only sets a default depth. Nothing the developer layer adds may
  clutter the guided layer.
- **Evidence:** Both personas leave at the same moment, when the product becomes a black box: the business
  builder cannot see why, the developer cannot see how ([04](04-personas-and-jtbd.md)). A single surface with
  progressive depth serves both without building the product twice.
- **Rejected:** A mode toggle splitting the product into "simple" and "advanced". It forces a self-assessment
  at the moment of least information, strands each audience in a half-product, and doubles the design and build
  surface. Also rejected: separate products per audience, which is the Architect and Studio split that
  [finding 1 in 03](03-architect-today.md) shows already breaking context today.

### D15. 2026-09-25: The signature feature is the "Why did it do that?" guided reliability loop
- **Decision:** When an agent answers badly, the builder clicks "Why did it do that?" and gets the run trace in
  plain language (retrieved sources, each agent's step, where confidence dropped) plus a suggested fix they can
  preview before applying. Developers see the same trace with raw parameters and diffs.
- **Evidence:** GroundTruth Part 5. Diagnosing one misbehaving agent took about 8 technical steps: reading the
  verification reasoning, isolating retrieval, finding the model parameter panel, and lowering temperature from
  0.4 to 0.2. A non-technical builder cannot do any of that, and it is the exact moment Persona A abandons the
  product ([04](04-personas-and-jtbd.md)). It also matches Lyzr's own stated direction toward an agent workbench
  ([research/architect-today-research.md](research/architect-today-research.md)).
- **Rejected:** Exposing raw traces to everyone, which is what today's product effectively does and which only
  serves the developer. Also rejected: an automatic silent fix, which removes the learning and repeats the
  teardown's worst pattern, billing the user for the platform's own retries.
- **Why this one:** it is the single screen where "Steer it" becomes visible, and it is the clearest thing
  neither the prompt-to-app builders nor the codebase-native agents currently offer.

### D16. 2026-09-25: Per-user projects in Supabase are the database deliverable
- **Decision:** the real Postgres work is projects stored per user, created and listed from the home screen
  ([screen 4](design/screen-inventory.md)), plus the onboarding depth preference on the profile
  ([screen 3](design/screen-inventory.md)). Row level security scopes every row to its owner. Everything
  downstream of a project, the plan, agents, build, code and deploy, stays simulated.
- **Evidence:** the rubric names "database or Google sign-in" as the bonus, so one honest, working slice beats
  a broad but shallow schema. Projects are also the only entity a reviewer will actually exercise: sign in,
  create something, sign out, sign back in, and find it still there. That round trip is what proves the
  database is real, and it is cheap to build.
- **Rejected:** persisting simulated build artifacts, agent configs and deploy history. It multiplies schema
  and seeding work, competes with design time, and earns nothing against a rubric that ranks working
  functionality last. Also rejected: no database at all, which forfeits the stated bonus.
- **Honesty requirement:** [README.md](../README.md) names exactly which rows are real. A simulated flow that
  happens to read a real project row is still a simulated flow.

### D17. 2026-09-25: Scope the build in P0, P1, P2 tiers
- **Decision:** every screen in [design/screen-inventory.md](design/screen-inventory.md) carries a tier. P0
  must ship for submission, P1 should ship, P2 is shown only if time allows. The eight features the brief
  names are all P0, and so are the screens that carry the thesis: the single plan gate, the build stage
  checklist, the "Why did it do that?" trace, the code and diff view, the import compatibility report, and
  deploy with environments and rollback.
- **Evidence:** the rubric ranks design and flows first and feature coverage second, so the failure mode is a
  wide set of shallow screens rather than a narrow set of finished ones. Tiering decides in advance what gets
  cut when time runs short, instead of leaving that to the last night.
- **Rejected:** building in route order, which would spend the best hours on settings and templates. Also
  rejected: leaving priority implicit, which in practice means whatever is half-built at the deadline ships.
- **Consequence:** if a P0 screen is at risk, a P1 or P2 screen is cut first. P2 items may appear as static
  screens with no interaction, and the README must not imply otherwise.

### D18. 2026-09-25: Authentication is now reported as functional
- **Evidence:** Google sign-in was exercised end to end on the production deployment against a live Supabase
  project: sign in with Google, `/app` renders the signed-in email, sign out, and `/app` then redirects to
  `/login?next=/app`. That is the full round trip, not a code review, so the
  [README](../README.md) row moves from implemented-but-unverified to functional.
- **Why it was not claimed earlier:** every prior entry said the path existed but had never run against a real
  project. Under the repo's own rule, a feature is not functional until it has been seen working.
- **Caveat that remains:** the database row stays "planned". Auth working does not make per-user project
  storage exist, and the two must not be conflated in the status table.

### D19. 2026-09-25: Auth controls must work before hydration
- **Evidence:** on production, the first click on Sign in did nothing and the second worked. Sign in was a
  client component whose `onClick` called `signInWithOAuth` in the browser, so any click arriving before
  hydration was discarded.
- **Decision:** authentication controls are plain HTML forms posting to server routes. Sign in posts to
  `/auth/signin`, which builds the provider URL server side with `skipBrowserRedirect` and returns a 303.
  Sign out was already a form post. No auth action may depend on client JavaScript.
- **Rejected:** disabling the button until hydration completes, which replaces a dropped click with a dead
  control and still fails with JavaScript blocked. Also rejected: a `useEffect` readiness flag, which is the
  same bug with extra steps.
- **Generalises to:** any control on the critical path. A first click that silently does nothing is the most
  expensive possible failure on a sign-in screen, because the user concludes the product is broken.

### D20. 2026-09-25: The design language is blueprint, and mono means raw
- **Decision:** the product reads as a blueprint. A precise drawing anyone can take in at a glance, with detail
  available when you lean in. Eight colour tokens, each with exactly one meaning, and dark mode is blueprint
  navy rather than black. Instrument Sans carries the whole interface. JetBrains Mono appears only where the
  text is literally what the machine sees: code, config, logs, diffs, terminal.
- **Why mono carries meaning:** the dual-mode rule in [D14](#d14-2026-09-25-one-product-depth-on-demand-with-no-technical-mode-switch)
  needs the user to know which depth they are in without reading a label. Making the typeface the signal means
  the guided and details layers are distinguishable at a glance, with no chrome and no mode indicator.
- **Also decided:** `cost` is used for money and nothing else, `live` means "this is what users see" and never
  "success" in general, and status is never colour alone, so it always carries an icon and a word. That last
  rule is the accessibility floor and the reason the token set stays this small.
- **Rejected:** the category default of a near-black canvas with a neon accent, gradient washes, uniform
  rounded cards with one soft shadow, and monospace as decoration. All five tested tools and generic generated
  UI converge on that look, and the brief asks for first-principles design, so converging on it would be a
  failure regardless of how it looked.
- **Implementation note:** the design system says the tokens are exposed in `tailwind.config`. This repo is on
  Tailwind v4, which has no JS config file, so the equivalent is the `@theme` block in
  [app/globals.css](../app/globals.css). Same tokens, same utility names, different file.

### D21. 2026-09-25: Responsive from 360 px to 1920 px, verified by script
- **Decision:** every screen works from a 360 px phone to a 1920 px monitor, designed mobile-aware from the
  start rather than shrunk at the end. A P0 screen is not done until it has been checked at 375, 768, 1280 and
  1920 px in both themes.
- **Made enforceable:** [scripts/responsive-check.mjs](../scripts/responsive-check.mjs) drives the installed
  Chrome over CDP, reports `documentElement.scrollWidth` against `innerWidth` at each width, and captures a
  screenshot. Overflow must be 0.
- **Evidence for scripting it:** the first screenshots of the token page appeared badly broken at 375 px, with
  text clipped at the right edge. Measurement showed overflow was 0 and the layout was correct. Passing
  `--window-side` to headless Chrome without Emulation device metrics lays the page out wide and then crops
  the image, which looks exactly like a responsive bug. Eyeballing screenshots would have sent me to fix
  working code.
- **Rejected:** checking by eye at whatever width the window happened to be, and adding Playwright, which
  wanted a browser download when the machine already has Chrome.

### D22. 2026-09-25: The Code tab is read-only on phones
- **Decision:** the Code tab offers the full editor, diff and terminal from 640 px up. Below that it is
  deliberately read-only: browse files, read diffs, accept or revert changes.
- **Evidence:** editing code on a phone keyboard is a poor experience in every tool that offers it. Shipping a
  cramped editor would spend design effort on a path nobody completes, and would break the promise in
  [D14](#d14-2026-09-25-one-product-depth-on-demand-with-no-technical-mode-switch) that depth is always usable
  once revealed.
- **Rejected:** hiding the Code tab entirely on phones, which would leave a developer unable to review what
  changed while away from a desk, and that review is the main reason to open the product on a phone at all.
- **Honesty requirement:** the phone view says it is read-only. It does not present a disabled editor and
  leave the user guessing why typing does nothing, which is the same class of failure as
  [D19](#d19-2026-09-25-auth-controls-must-work-before-hydration).

### D23. 2026-09-25: Demo content lives in code, not in seeded database rows
- **Decision:** the Northwind Helpline demo is typed fixtures in `lib/seed/`. The database holds only real
  user data, which today means projects.
- **Evidence:** the demo is content, not user data. Every visitor sees the same story, nobody edits it, and it
  has to render for signed-out visitors at `/demo` where there is no user to scope rows to. Putting it in
  Postgres would mean seed scripts, a null owner, and RLS exceptions for rows that are not owned by anyone.
- **Rejected:** seeding the demo as rows belonging to a service account, which invites exactly the confusion
  the status table exists to prevent: a reviewer seeing database-backed content and concluding the simulated
  layers are real.
- **Consequence:** `lib/seed/` is the single source for every simulated screen, so the story stays consistent
  across slices rather than drifting per screen.

### D24. 2026-09-25: Row level security is the only thing deciding row visibility
- **Decision:** `listProjects()` applies no `user_id` filter in application code. It selects from `projects`
  and lets the policy scope the result to `auth.uid()`. Four policies, one per verb, rather than one
  permissive rule.
- **Evidence:** a filter in application code and a policy in the database are two places to get the same rule
  right, and the application one fails open. With no filter in the query, a missing policy shows up
  immediately as another user's data appearing, rather than hiding behind a `where` clause that happens to be
  correct today. One policy per verb means a mistake in update cannot silently widen select.
- **Rejected:** filtering in the query as well, which reads safer and is not. It makes the policy untested,
  because the query would pass whether or not RLS worked.
- **Verification requirement:** the policies are proven by querying as two real users and confirming each
  sees only their own row. A passing policy list is not evidence.

### D25. 2026-09-25: Workspace tabs and panes are URL state
- **Decision:** the layer tabs and the phone pane switch are plain links that change query parameters, not
  client state. The whole workspace shell stays a server component.
- **Evidence:** this is [D19](#d19-2026-09-25-auth-controls-must-work-before-hydration) applied to
  navigation. A tab that needs hydration before it responds has the same first-click failure the production
  sign-in button had. It also makes every view linkable and restorable, which matters for a submission where
  a reviewer may be sent straight to one screen.
- **Rejected:** client state with `useState`, which would force the shell and everything inside it into the
  client bundle for no gain.
- **Cost accepted:** each tab change is a server round trip. For a workspace whose panels are server-rendered
  anyway, that is the cheaper trade.

### D26. 2026-09-25: Row level security proven with two real users, and the database called functional
- **Evidence, at the database.** Two confirmed `auth.users` rows, each with one project, queried as themselves
  by setting `role authenticated` and `request.jwt.claims`. Actual results:

  | Check, run as | Result |
  |---|---|
  | User A select | `rows_visible: 1`, "A support agent that answers billing que..." |
  | User B select | `rows_visible: 1`, "Internal onboarding concierge for new hi..." |
  | User B updates user A's row | `cross_user_rows_updated: 0` |
  | User B deletes user A's row | `cross_user_rows_deleted: 0` |
  | User A's row afterwards | Still present, name unchanged, so the blocked update did not silently apply |

- **Evidence, over HTTP.** With real session cookies minted through `@supabase/ssr`: user A's Home links to
  user A's project id and not user B's, and the reverse for user B. Requesting another user's project returns
  `404`, so it is not found rather than found and refused. The create-project round trip works end to end:
  form post, insert, redirect to `/app/p/<id>`, and the row then appears on Home.
- **Decision:** the [README](../README.md) database row moves to functional. Both halves of the bonus in the
  brief, Google sign-in and a real database, are now exercised rather than asserted.
- **One test that lied, and what it changed.** The first isolation check grepped user B's Home for user A's
  prompt text and found a match, which looked like a leak. The match was the textarea placeholder, which is
  the same string on every Home. The corrected check counts links to each project id. A test that greps for
  content a page always contains cannot fail, so it proves nothing.
- **Cleanup:** both test projects were deleted after the proof, leaving `projects_remaining: 0`. The two test
  users are kept until submission, then deleted with the credentials in `.env.local`, which is gitignored and
  has never been committed.

### D27. 2026-09-25: Where the no-JavaScript rule stops, and what replaces it
- **Decision:** [D19](#d19-2026-09-25-auth-controls-must-work-before-hydration) covers auth actions and
  [D25](#d25-2026-09-25-workspace-tabs-and-panes-are-url-state) navigation. Progress is neither, so the build
  screen is the one client component in the product. The condition: its server render is the **finished**
  build, not an empty one.
- **How that works:** the elapsed timer starts as `null`, which renders the completed stage list, the cost
  inside the estimate, and a working "Finish build" control. On mount the interval starts and the animation
  plays from the beginning. A visitor without JavaScript keeps the finished view.
- **Evidence it holds:** the served HTML of `/demo?tab=app&build=running`, with nothing executed, contains
  "Built", the compressed-time label, the Checks detail and "Open the preview", and contains **zero**
  occurrences of "Building your app". The failure mode this rules out is precisely the one the teardown
  recorded: a spinner that never resolves and tells you nothing.
- **Rejected:** rendering the empty state on the server and letting hydration fill it in, which shows a
  visitor without JavaScript an unstarted build forever. Also rejected: advancing stages by link, which is
  fully server-rendered but makes progress something you click, which is not what this screen is for.
- **Secondary constraint:** no state is set from inside an effect body. The interval callback is the only
  writer, and everything else is derived from elapsed time. The linter caught two violations of this in the
  first version, and the fix made the component simpler rather than more complex.

### D28. 2026-09-25: Simulated builds write real status values
- **Decision:** starting a build sets `projects.status` to `building`, finishing sets it to `built`. The
  simulation is fake; the status is a real row.
- **Evidence:** verified end to end with a real session: create, then `/plan`, then Build, then Finish, and
  the row read back as `status: built` with `updated_at` later than `created_at`, so the trigger fired.
  Home's chip then reads "built". Without this the chip would say "draft" on every project forever, which
  looks broken in a way that undermines the real database underneath it.
- **Both paths, one handler:** the hidden form the animation submits and the visible no-JS "Finish build"
  control post to the same route, so the two cannot drift.
- **Test row deleted afterwards,** leaving `projects_remaining: 0`.

### D29. 2026-09-25: The guest demo reaches every screen the signed-in path does
- **Decision:** `/demo` reaches the plan gate, a running build, a failed build and the app preview, on client
  and URL state only, writing nothing to the database. The signed-in path keeps the real status round trip.
- **Evidence:** most reviewers will never sign in. A demo that stops at the workspace and sends them to a
  sign-in wall to see the thesis screens hides the exact work being assessed.
- **How duplication is avoided:** every screen takes its data as props, and one `WorkspaceCanvas` decides what
  to show. The route supplies either Supabase data and a write action, or fixtures and `null`. There is no
  second implementation to keep in sync.
- **Verified:** all six demo URLs return 200 signed out, and the responsive sweep runs against the demo path
  as well as the signed-in one.

### D30. 2026-09-25: The simulated build is time compressed and says so on screen
- **Decision:** the animation runs about 24 seconds while the stage list shows the real durations a build of
  this size would take, totalling 6 min 31 s. A label reading "Demo build, time compressed" sits next to the
  stage list, not in a footnote.
- **Evidence:** the teardown's sharpest finding was a "usually 4 to 6 min" label that ran for 35 minutes. A
  demo that silently implies 24 seconds is the real build time commits the same offence against the reviewer.
  Showing both numbers, and saying which is which, is the only version of this screen consistent with the
  thesis.
- **Arithmetic checked, not assumed:** stage costs total $1.46 against the $1.20 to $2.00 estimate shown
  before the build, and match the $1.46 the version history already records. The realistic total of 6 min
  31 s sits inside the "about 6 to 10 min" estimate. An estimate that did not hold would undo the point of
  showing one.

### D31. 2026-09-25: The agent canvas is hand-drawn, and the design system was corrected to match
- **Decision:** the agent network is agent cards positioned over the blueprint grid with SVG connector lines
  behind them. No graph library. Under 640 px the canvas is replaced by a list, not shrunk.
- **Evidence:** every node stays a real focusable link, the selection lives in the URL, and the whole screen
  renders on the server, which keeps it consistent with [D25](#d25-2026-09-25-workspace-tabs-and-panes-are-url-state).
  A graph library would push the Agents tab into the client bundle to pan and zoom a diagram of four fixed
  nodes.
- **Traded away:** pan, zoom and node dragging. For a four-agent network that fits on screen, none of those
  earn their cost.
- **The design system was wrong and has been changed.** It promised "pinch to zoom and pan on touch". That
  described a product we chose not to build, so `design/design-system.md` was corrected in the same commit.
  This is the first time building something forced a change back into the design doc rather than the other
  way round, and the rule in [CLAUDE.md](../CLAUDE.md) that docs stay in sync makes the doc the thing that
  moves.

### D32. 2026-09-25: Applying a fix is URL state, not a new table
- **Decision:** applying the suggested fix sets `fix=applied` in the URL. It is identical on the demo and
  signed-in paths, and nothing is written to the database.
- **Evidence:** agent versions are not in the schema. Adding a table so one simulated screen could survive a
  refresh would be schema built to serve a fixture, which [D23](#d23-2026-09-25-demo-content-lives-in-code-not-in-seeded-database-rows)
  already ruled against. As URL state the applied view is linkable, which matters more for a submission a
  reviewer walks through.
- **Rejected:** persisting an agent version for consistency with
  [D28](#d28-2026-09-25-simulated-builds-write-real-status-values). D28 persisted because `status` already
  existed and Home visibly depended on it. Neither is true here.

### D33. 2026-09-25: Nothing is applied silently, and the guided layer never names a parameter
- **Decision:** the "Why did it do that?" screen shows the trace, the exact unsupported words, and the before
  and after answers, then waits. Applying is an explicit action, and the applied state offers "Revert to
  v14". The guided layer never contains the word "temperature", any other parameter name, or a bare
  parameter value. Those live only behind Details.
- **Evidence:** this is the eight-step diagnosis from GroundTruth, turned into one screen
  ([03-architect-today.md](03-architect-today.md)). The success condition F4 states is that a non-technical
  builder fixes a real reliability issue without knowing the word "temperature", so the word's absence is a
  requirement, not a style preference.
- **Three signals on the marked phrase, never colour alone:** the `fault` colour, an underline, and a "Not in
  source" label. The design system requires that everywhere, and it matters most on the one phrase the whole
  screen exists to point at.
- **Verified in the served markup, on visible text:** with `<details>` and `<script>` stripped, the canvas,
  the inspector's guided view, the trace and the applied trace contain no banned word and no bare parameter
  value. The details layer does contain them, which is the point.
- **Rejected:** applying the fix automatically once it is found. It removes the builder's learning, and it
  repeats the teardown's worst pattern of the platform spending a user's money on its own initiative.

### D34. 2026-09-25: "Try the demo" is the primary action on the landing page, ahead of sign in
- **Decision:** the landing page leads with the demo. Sign in is the secondary control, and the demo is
  labelled as needing no account.
- **Evidence:** a reviewer assessing this submission has no reason to create an account, and
  [D29](#d29-2026-09-25-the-guest-demo-reaches-every-screen-the-signed-in-path-does) made the demo complete
  enough to carry the whole product. Putting sign in first would put a wall in front of the work being
  judged.
- **Also decided:** each of the four principles carries one measured finding rather than an adjective, every
  figure traceable to [01-competitive-teardown.md](01-competitive-teardown.md). A landing page for a product
  whose thesis is "show your evidence" cannot itself be assertions.
- **The footer states what is real**, in the same words as the README: sign-in and projects are real, the
  rest is simulated. On the first screen rather than buried, because the first screen is where a reviewer
  forms the impression the rest has to live up to.

### D35. 2026-09-26: The depth preference is a stored default that the URL always overrides
- **Decision:** onboarding writes `guided` or `details` to a `profiles` row. The workspace reads it and uses
  it only when the URL says nothing about depth. An explicit `?depth=` always wins.
- **Why the URL wins:** every workspace view is linkable by
  [D25](#d25-2026-09-25-workspace-tabs-and-panes-are-url-state). If a stored preference could override a
  link, the same URL would show two different things to two people, which breaks the one property that
  makes these screens shareable.
- **It reaches every disclosure,** not just the agent inspector: the PRD, the build error log, the test
  panel and the raw trace all open by default for a `details` user. Otherwise the onboarding question would
  be asking something that changes almost nothing.
- **Skip writes a row too,** with `guided`. A skipped user who was asked again on every sign in would not
  have been given a choice, only a delay.
- **RLS proven with the two real test users**, the same way as `projects` in
  [D26](#d26-2026-09-25-row-level-security-proven-with-two-real-users-and-the-database-called-functional):

  | Check, run as | Result |
  |---|---|
  | User A select | 1 row, `depth: details` |
  | User B select | 1 row, `depth: guided` |
  | User B updates user A's row | 0 rows updated |
  | User B deletes user A's row | 0 rows deleted |

- **Proven functional, not just stored.** With a project each, user A's workspace served `<details open>` on
  the trace and the plan PRD where user B's served a closed `<details>`, and the inspector opened on its
  configuration view for A and the simple view for B. `?depth=guided` forced A back to the simple view and
  `?depth=details` forced B into configuration, so the override holds in both directions. Test rows deleted
  afterwards, leaving both tables empty.

### D36. 2026-09-26: Any number that is a sum is derived, never written down beside its parts
- **Evidence:** a cold review of the deployed demo found the deploy screen listing five versions costing
  $2.43 directly above a footer reading $3.43. Both numbers were written by hand, in different files, and
  nothing made them agree. It also found a rollback offered to v3 when v3 was not in the list, and a stage
  labelled "Charged $0.00" still adding $0.62 to a total. In a submission whose whole thesis is that a
  builder should be able to see and trust what the machine did, totals that contradict each other on screen
  are the most expensive possible defect: a reviewer who catches one stops believing the rest, including
  everything that was correct.
- **Decision:** every total is computed from the rows that make it up, at render time, in
  [lib/seed/totals.ts](../lib/seed/totals.ts). `ledger.spend` was deleted from the fixture rather than
  corrected, because a stored total is the thing that drifts. Spend is now the sum of `versions`, the build
  total is the sum of its stages, and the failure total excludes the stage that was charged nothing.
- **Enforced, not intended.** [scripts/consistency-check.mjs](../scripts/consistency-check.mjs) asserts 15
  invariants and exits non-zero on any failure, so it gates a commit rather than being advice. Written
  before the fixes and **shown failing first**, catching exactly the two data defects the review found, so
  it is proven to detect them rather than trivially passing.
- **It immediately caught one I had introduced.** Adding v15 to the version list to make the arithmetic
  work put $0.06 into the monthly spend for a version that does not exist until the reliability fix is
  applied. v15 is now absent from the list, and applying the fix adds its cost and advances the preview
  version. The check found that within a minute of being written, which is the argument for writing it.
- **Rejected:** lowering the stated spend to match the five listed versions. That would have made the
  numbers agree by deleting the story that a month of work happened. Listing every version that was
  actually billed keeps both the arithmetic and the narrative.

### D37. 2026-09-26: The right model type per agent
- **Decision:** the three agents that make typed decisions (Intake, Grounding Checker, Escalation Router)
  run on [Jev](https://vercel.com/ai-gateway/models/jev), TypeSafe AI's decision model, through Vercel AI
  Gateway. The Answer agent, which writes prose for a customer to read, stays on a language model. The
  agent inspector shows which is which, and why, in plain words.
- **Evidence:** all three decisions have a fixed answer space known in advance: a topic from five, a score
  on a four-level rubric, a yes or no, a queue from three. Asking a model that can emit any string to emit
  one of five means parsing, validating, and handling the case where it invents a sixth. A decision model
  returns the answer already inside the schema. Verified from the Gateway's own models endpoint on
  2026-09-26: `typesafe-ai/jev`, type `evaluation`, input $0.000000042 per token, output free, 32,000
  context.
- **Why it belongs in the product, not just the stack:** the thesis is that a builder should be able to see
  what the machine is doing. "This agent uses a model that cannot invent an answer, and that one uses a
  model that can" is the most concrete form that idea takes anywhere in the submission, and it is the
  difference that caused the escalation the whole "Why did it do that?" screen is built around.
- **Rejected:** running all four on a language model, which is what today's Architect does and what makes
  the drift in the trace possible. Also rejected: moving the Answer agent to a decision model, which would
  be the same category error in the other direction, since its output is prose.
- **Honesty requirement:** confidence is shown only where the provider returns one. The docs state Jev
  returns `providerMetadata.typesafe.confidence` for choice and score but not boolean, and that a boolean's
  `probability` is P(true) and "not a confidence in either outcome". The Grounding Checker therefore shows
  a probability, labelled as one. Latency is wall-clock measured by us, because the API returns none, and
  the interface says so.

### D38. 2026-09-26: A documented cost ceiling, enforced without a privileged key
- **Decision:** 10 live Jev calls per IP per hour, and 300 per day in total. Past either, the demo serves a
  stored result labelled with the date it was captured, and never a fabricated one.
- **Why these numbers:** 10 per hour is enough for a reviewer to try every agent several times with their
  own input, and low enough that one visitor cannot drain the budget. 300 a day bounds the worst case
  across all visitors. At $0.042 per million input tokens these calls cost a fraction of a cent, so the
  thing actually being protected is the key and the blast radius of a leak, not the bill.
- **Enforced through `SECURITY DEFINER` functions, not a service role key.** `/demo` is signed out, so the
  insert runs as `anon`. Shipping a service role key to the app to do that would hand the browser tier a
  credential that can read and write everything. Instead `log_jev_call` writes exactly one row with only
  the allowed columns, `jev_call_counts` returns counts and never rows, and `anon` has `execute` on those
  and no `select` on the table.
- **Why `anon` must not read the table:** it holds salted IP hashes. The salt is a separate server-only
  environment variable, so the hashes are not reversible from a copy of the table alone.
- **What is stored:** timestamp, agent id, outcome, latency, salted IP hash. No user content, not the
  custom input and not the answer. That is what makes the latency figures publishable.
- **Verified, not assumed:** as `anon`, `log_jev_call` inserted a row and a direct `select` on
  `jev_calls` was refused with `permission denied for table jev_calls`. `jev_call_counts` returned counts
  to `anon` without exposing a row. Test rows deleted afterwards.
- **Rejected:** in-memory counters, which reset per serverless instance and would mean no real cap at all.

### D39. 2026-09-26: Proving a guardrail by moving its counter, not by faking its trigger
- **Decision:** the two Jev limits were proven by setting the counter state directly in `jev_calls`, making
  a real request against production, and reading the outcome. The synthetic rows were then deleted.
- **Why it had to be done this way:** both limits are checked before the Gateway is called, and
  `jev_call_counts` counts only rows with `outcome = 'live'`. That is deliberate, so a failed call does not
  spend a visitor's quota. It also means the failing calls we do have could not be used to trip either
  limit: 300 errors would still read as a day count of 0. Without a working Gateway, there was no way to
  accumulate 10 real live calls, so the counter was moved instead of the calls being faked.
- **What was proven:** 10 `live` rows on this IP's hash produced `rate_limited` with the real message and no
  Gateway call. Those deleted, 300 rows on an unrelated hash produced `daily_cap` the same way. Both served
  a stored result that correctly said no recorded result had been captured yet, rather than inventing one.
- **How it was kept honest:** every synthetic row carried `latency_ms = null`, so no published median could
  ever be computed from one even if cleanup had failed. All 310 were deleted, as were the two log rows the
  two test requests produced, since the state that triggered them was synthetic. The table was read back
  afterwards and holds exactly the three real rows, all with `outcome = 'error'`.
- **Rejected:** writing a plausible `live` row with a plausible latency to make the metrics table look
  finished. That is the same error as a hand-written "recorded result": a number presented as a measurement
  of something that never ran. Also rejected: lowering the limits to 1 so a single call could trip them,
  which would prove the code path but not the limits that ship.

### D40. 2026-09-26: Staying on eslint 9.39.5, and only one of the two build warnings accounted for
- **Decision:** keep `eslint` on the 9.x maintenance line, and treat its deprecation notice as expected
  output rather than something to silence.
- **The warning:** `npm warn deprecated eslint@9.39.5: This version is no longer supported.` It comes from
  the install step, not from the build. `eslint` publishes `maintenance: 9.39.5` and `latest: 10.11.0`, and
  `eslint-config-next@16.3.6` declares a peer range of `eslint: ">=9.0.0"`, so a clean install resolves the
  maintenance release.
- **Why it is not fixed:** bumping to `eslint@^10` resolved 10.11.0 and lint then crashed inside
  `node_modules/eslint-config-next/node_modules/eslint-plugin-react/lib/util/usedPropTypes.js`. The bundled
  plugin does not support eslint 10 yet. Reverted from backups; lint exits 0 and the build compiles on 9.x.
  Trading a working linter for a quieter install log is the wrong trade.
- **Only one warning reproduces.** A faithful reproduction of the deployment build, `git archive HEAD` into a
  clean directory then `npm ci` and `next build` on Node 22.16.0 with npm 10.9.2, produces exactly this one
  warning and no others. The build output itself is clean: compiled, TypeScript finished, 17 static pages,
  19 routes, exit 0. A second warning was reported from the deployment log and is not reproducible here, so
  it is recorded as unexplained rather than guessed at. It is most likely emitted by the platform's own
  build wrapper, which is outside this tree.
- **Rejected:** `npm install --no-warnings` or pinning a transitive dependency to hide the notice. The notice
  is true and it is the only signal that this pin needs revisiting once `eslint-plugin-react` supports 10.

### D41. 2026-09-26: Jev is live, and what the real responses changed
- **Decision:** the three decision agents are now Functional in the README. 22 live calls returned decisions.
- **Evidence:** median 430 ms over the 15 call run of `scripts/jev-latency.mjs`, range 389 ms to 919 ms, the
  first call of a run carrying connection setup. Input tokens are fixed per agent, 482, 363 and 371, because
  the schema and the state are fixed, so cost is exact arithmetic rather than an average: $0.000017 per call
  at the mean, about 58,700 calls per dollar. Producing that table cost $0.00026.
- **What the responses settled, which the docs could not:** in one run the choice and score agents returned a
  populated `providerMetadata.typesafe.confidence` and the boolean agent returned `{}`. The claim that a
  boolean carries no confidence is now an observation. The interface already said so, and now it is checked.
- **A low confidence case appeared on its own.** The sample message scored urgency at 0.72 with 42%
  confidence while topic came back at 100% in the same call, so one answer in a single call routes itself to
  a person and the other does not. That is a better demonstration than anything contrived, and it is the
  reason the threshold is shown in words rather than as a number alone.
- **The classification is not a formality.** Given "My invoice charged me twice this morning and I need the
  money back today", intake moved from the sample's `billing_credits` to `billing_refunds` at 95% and scored
  urgency 2.95 of 3, the rubric level that reads "money has left their account".
- **Recorded in `scripts/jev-latency.mjs` rather than pasted.** The published latency and cost come from a
  script in the repo, so a reader can re-run it and get their own numbers instead of trusting these.
- **Two failure modes were hit and are documented, not hidden:** before a card was on the account the Gateway
  refused with "requires a valid credit card on file", and both `.env.local` values had been pasted wrapped
  in angle brackets, which the Gateway reports as `401 authentication_error`. The deployment still carries a
  bad copy of the key and is called out in the README rather than papered over.
