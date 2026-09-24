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
