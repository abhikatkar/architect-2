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
- **Streams:** hands-on teardown of 7 tools (Claude Cowork), voice of customer (Perplexity), Architect architecture and docs (Claude).

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
