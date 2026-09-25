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
