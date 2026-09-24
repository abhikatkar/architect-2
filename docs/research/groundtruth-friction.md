# Research: first-hand friction from building GroundTruth on Architect

Source: my own GroundTruth build (August 2026), documented in a 5-part teardown (Build and Findings, Analysis and Recommendations, Business Case, Test It Yourself, PRD). GroundTruth is a 6-agent support-resolution app built entirely in Architect and Lyzr Studio. Case study: abhishekkatkar.com/work/groundtruth. Summarized here in my own words for docs/03.

## What worked
- Guided (Plan) mode decomposed the problem well. Architect proposed a hybrid pattern on its own: a Manager with sub-agents for resolution, plus an Independent agent for finalization after human approval.
- Multi-agent orchestration, knowledge-base retrieval, and per-agent model choice are real differentiators versus prompt-to-UI tools.
- The verification agent I designed caught a false high-confidence retrieval match (about 90%) on a SAML SSO ticket that a score alone would have shipped.

## Where it broke down

| # | Friction | Detail | Principle it supports |
|---|---|---|---|
| 1 | Diagnosing a misbehaving agent needed engineering skill | Over-escalation traced to the drafting agent adding unsupported detail ("start of the next billing cycle" when the source said "the next billing cycle"). Finding it took about 8 technical inferences: reading verification reasoning, isolating retrieval, spotting the embellishment, linking it to temperature, finding the parameter panel, changing 0.4 to 0.2, re-testing | Steer it |
| 2 | The fix lived in a different product | Instruction and temperature edits had to be made in Lyzr Studio, not in Architect | Steer it |
| 3 | Reliability tooling is out of reach | Improvement Engine, Agent Eval, Simulation Engine, and Hallucination Manager exist but are Enterprise-gated, while Architect targets self-serve builders | Steer it |
| 4 | Improvement suggestions cover instructions, not parameters | The fix that worked was a parameter change, which an instruction-only loop would not surface | Steer it |
| 5 | Residual variance is architectural | Even after the fix, repeated runs of the same ticket could differ; a builder needs to see run-to-run variance, not just one answer | See it |
| 6 | Limited free credits constrained testing | Each diagnostic re-run spent credits, which discourages the testing that reliability needs | See it |

## Implication for Architect 2.0
The "Why did it do that?" loop productizes the diagnosis I did by hand: plain-language run trace, where confidence dropped, a suggested fix at instruction or parameter level, a before and after preview, and apply as a new version. Never silently applied.
