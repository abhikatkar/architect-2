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
