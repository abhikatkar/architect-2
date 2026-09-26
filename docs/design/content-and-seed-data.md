# Content and seed data

All simulated flows use one consistent demo project, so the product feels real and reviewers can follow a single story. The demo is the exact app from the hands-on teardown prompt (a customer support agent with a dashboard), so the before and after comparison with other tools is like for like.

All names are fictional. All copy follows the writing rules in the [design system](design-system.md): sentence case, units on every number, no long dashes.

## The project
- **Company (fictional):** Northwind Cloud, a subscription software company.
- **App name:** Northwind Helpline.
- **What it does:** answers customer billing questions from a help center, escalates to a human when it cannot ground an answer, and gives support admins a dashboard of conversations by status (open, resolved, escalated).
- **Owner:** Maya Rao, support operations lead (persona A). Collaborator: Dev Iyer, product engineer (persona B).

## Agents

| Agent | Role | Knowledge | Model settings (details layer) |
|---|---|---|---|
| Intake | Reads the message, sets topic and urgency | None | temperature 0.2 |
| Answer | Drafts a reply using only help articles | Help center, 24 articles | temperature 0.4, then 0.2 after fix |
| Grounding Checker | Confirms every claim is in a source; escalates if not | Help center | temperature 0.1 |
| Escalation Router | Assigns escalations to a human queue with a reason | Team roster | temperature 0.2 |

## Help articles (sample of the 24)
- Refunds for annual plans
- When credits are applied: "Account credits apply at the next billing cycle."
- Changing seat count
- Updating a payment method
- Invoices and receipts

Deliberately missing (so escalation can be demonstrated): SSO setup, data deletion requests.

## Demo conversations

| Customer | Question | Outcome |
|---|---|---|
| Priya S. | How do I download last month's invoice? | Answered, grounded |
| Tom W. | Can I get a refund on my annual plan? | Answered, grounded |
| Lena K. | When will my credit be applied? | Escalated (the embellishment bug, fixed in v15) |
| Arun M. | How do I set up SSO for my team? | Escalated, no source (correct) |
| Chen L. | Please delete all my data | Escalated, no source (correct) |

Dashboard counts: 18 open, 42 resolved, 7 escalated.

## The run trace for F4
- Question: "When will my credit be applied?"
- Retrieved: "When credits are applied", match 0.91
- Answer agent draft: "Your credit will be applied at the start of your next billing cycle."
- Grounding Checker: "The source says 'at the next billing cycle'. 'At the start of' is not supported." Result: not grounded, escalated.
- Suggested fix: keep answers as specific as the source and no more; lower creativity for the Answer agent.
- After fix, 5 re-runs: 5 of 5 grounded. Re-test cost: $0.06.

## Build history and costs

| Version | Change | Cost | Environment |
|---|---|---|---|
| v1 | First build | $1.46 (estimate $1.20 to $2.00) | Preview |
| v8 | Admin dashboard counts | $0.38 | |
| v12 | Escalation reasons | $0.22 | Production, live |
| v14 | Invoice download links | $0.31 | Preview |
| v15 | Grounding fix from F4 | $0.06 | Preview |

Spend this month, both states, because the demo has two:

- **$3.37 of a $5.00 cap** by default. Nine deployed versions, plus five builds that never reached deploy
  and are charged $0.00 each.
- **$3.43** once the F4 reliability fix is applied, which creates v15 and adds its $0.06.

There are two ways to apply that fix, from the trace and by accepting its file in the Code tab, and they are
one change: either produces $3.43, v15 in preview and 10 deploys, and reverting the file produces $3.37, v14
and 9 again. See [D57](../07-decision-log.md#d57-2026-09-26-one-applied-state-computed-once-per-request).

Neither number is written down in the fixtures. Both are summed from the version list at render time, so
this table is a description of what the code computes rather than a second place to keep it. See D36.

## Commits (Code and Deploy)
- `a41c9e2` Add escalation reason to dashboard (3 files)
- `7be0d15` Keep answers as specific as the source (1 file)
- `c93f7a0` Invoice download links in answers (2 files)

## Import example (F7)
- Repo: `northwind/billing-portal`, branch `main`, subfolder `apps/web`. Detected: Next.js 16. Support: Full.
- Second example: `northwind/billing-api`. Detected: Flask (Python). Support: Partial. "Architect can add agents and a new interface, but will not modify your Python routes."

## Error and status copy
- Stage failed: "A page could not load because a package is missing. Retrying once."
- Loop stopped: "Stopped after 3 identical failures. No further credits used."
- Platform retry charge: "Retry caused by Architect. Charged $0.00."
- Stale preview: "This preview is from v13. Refresh preview to see v14."
- Estimate over cap: "This build may cost up to $2.00, which would pass your $5.00 cap by $0.43. Raise the cap or build anyway."
- GitHub consent: "Nothing is written to your GitHub account until you confirm." The sheet lists what would
  be written above that line, counted from the file tree and the change list rather than written here: 42
  files and 3 commits today. The earlier version of this string said "1 commit", which was wrong and sat
  directly under the derived line that said otherwise.
- Marketplace note: "If published, people who use your app spend your credits. Off by default."
