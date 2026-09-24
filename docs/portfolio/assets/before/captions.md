# Architect "before" screenshots (24 Sep 2026)

Viewport 1547x784 unless noted. Captured on the existing test app support-nest-clever-deck-k6tr (undeployed before capture). No build, import or deploy was sent.

> **Redaction note.** Architect shows the account's credit balance in the top bar and sidebar on every
> screen, so every capture needed treatment before it could be published. Per [D12](../../../07-decision-log.md),
> each published file has its top bar cropped away and its account details blurred beyond recovery.
> Nothing in the product interface was moved, retouched or recomposed. Files are named `*-redacted`.
> This file is the original caption list with two changes: filenames updated to match, and one GitHub
> handle replaced with `<handle>`.

| File | Caption |
|---|---|
| 01-homepage-redacted.jpg | Homepage: one prompt box, a + button, and "Connect with" integration icons; no cost or time hint. |
| 02-plus-menu-redacted.jpg | The + menu: Add files, Add studio agents, Select theme, Import codebase. |
| 03-plan-phase-redacted.jpg | Plan phase: clarifier answers on the left, PRD on the right, "Handed off" badge and a sticky Credits popover. |
| 04-agents-canvas-redacted.jpg | Agents canvas: Customer Message -> FAQ Support Agent -> Grounded Support Response; the Credits popover hides "Edit Agents in Studio". |
| 05-edit-in-studio-redacted.jpg | Edit in Studio opens a new tab after about 40 s of loading, on a folder list, not the agent; credits are shown in a different unit from Architect's. |
| 07-database-tab-redacted.jpg | Database tab: read-only PostgreSQL browser (_users, conversations, messages) holding rows left by the agent's own self-test. |
| 08-github-modal-redacted.jpg | GitHub modal: a repo now syncs automatically to `<handle>/support-nest-clever-deck...` even though Push was never clicked. |
| 09-deploy-modal-redacted.jpg | Deploy modal: "Publish to Marketplace" is on by default (and spends your credits); Description is required; earlier inputs are not remembered. |
| 11-usage-page-blank.jpg | The Usage page (and the homepage) rendered blank for 30+ s after returning from Studio. Not redacted, the page is empty. |
| 12-import-nonnext-modal-redacted.jpg | Import codebase with a Python repo (pallets/flask): no compatibility warning, and the default branch is wrongly "automatic-options". |
| 13-import-nonnext-attached-redacted.jpg | After "Use this repo" the Flask repo attaches as "will import" with no error; nothing shows cost before Send. |

## Not published

| File | Reason |
|---|---|
| 00-low-credits-modal-on-load.jpg | The credit balance is the entire subject of the frame. Redacting it would leave nothing. The finding it evidences (a Low Credits modal interrupts every page load) is recorded in [01](../../../01-competitive-teardown.md) instead. |
| 06-build-progress-ARCHIVAL.jpg | Duplicate. Already published as [architect-build-progress-opaque.jpg](../../../research/screenshots/architect-build-progress-opaque.jpg) from the teardown session. |
| 10-credits-popover.jpg | Same as 00. The balance is the subject of the frame. |
