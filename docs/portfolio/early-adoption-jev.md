# Early adoption: Jev as the decision model

## What this is

Three of Northwind Helpline's four agents do not write anything. Intake sorts a message into a topic and
rates urgency, the Grounding Checker answers one yes-or-no question about a source article, and the
Escalation Router picks a queue. Those are typed decisions. They run on
[Jev](https://vercel.com/ai-gateway/models/jev), TypeSafe AI's decision model, through Vercel AI Gateway.
The Answer agent, the one that writes prose, stays on a language model. The contrast is the point, and the
product shows it: see [D37](../07-decision-log.md).

## Dates

| Event | Date | Source |
|---|---|---|
| Jev available on AI Gateway | Changelog published 16 Sep 2026 | [changelog](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) |
| Launch write-up | Published 18 Sep 2026 | [blog](https://vercel.com/blog/ai-gateway-jev-model-launch) |
| This integration | 26 Sep 2026 | this repo |

One inconsistency worth recording rather than smoothing over: the blog post says Jev "was introduced on
September 15", while the changelog it links to as the introduction is dated 16 September 2026. Both are
cited above rather than picking one.

## Why these three agents

A decision model is the right tool when the set of acceptable answers is known in advance. All three of
these have a fixed answer space: a topic from five, a score on a four-level rubric, a yes or no, a queue
from three. Running them on a language model means asking something that can produce any string to produce
one of five, then parsing and validating the result, and handling the case where it invents a sixth.

The Answer agent is the opposite case. Its output is prose for a customer to read, so it needs a model that
writes. It is also, not coincidentally, the one agent in the demo that drifted from its source and caused
the escalation the "Why did it do that?" screen is built around.

## What we measured

Measured by us, on our own calls, and published in [metrics.md](metrics.md):

- **Median wall-clock latency** of a live call, measured in our own code around the `evaluate` call.
- **Call count**, from the `jev_calls` table.

Both are small-sample figures from one region on one day. They are not a benchmark and are not comparable
to the vendor's evaluations below.

**The AI SDK does not return a latency.** No timing field is documented on the evaluate result, so every
latency here is wall-clock measured on our side, which includes network time to the Gateway. That is what
we publish and it is labelled as such.

## What TypeSafe AI claims, and what we did not verify

These are **vendor claims from TypeSafe AI's own workflow evaluations**, not independent testing and not
reproduced by us. Both pages say "up to". The two pages give the same benchmark to different precision, so
each is quoted to its own source rather than averaged:

| Claim | Exact wording | Source |
|---|---|---|
| Speed | "up to 193.6x faster ... than LLMs on its workflow evaluations" | [changelog, 16 Sep 2026](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway) |
| Cost | "444.6x cheaper" | same changelog |
| Speed, rounded | "up to 194 times faster" | [blog, 18 Sep 2026](https://vercel.com/blog/ai-gateway-jev-model-launch) |
| Cost, rounded | "445 times cheaper than language models" | same blog |

Attribution on both pages is explicit: "TypeSafe reports" and "In its own workflow evaluations, TypeSafe AI
reports". No independent evaluator is named on either.

Adoption figures are Vercel's own Gateway usage data, not TypeSafe's, and appear only on the blog: "By hour
24, nearly 13% of paid teams were using it", and "That's 2x the GPT-5.6 family and more than 6x Fable 5.1's
share".

A figure of "about 100x" circulates elsewhere. It appears on none of the three Vercel pages read on
26 Sep 2026, so it is not cited here.

## What we verified ourselves

Pricing and limits come from the Gateway's own models endpoint, `https://ai-gateway.vercel.sh/v1/models`,
which needs no authentication, read 26 Sep 2026. This is a primary source rather than a blog figure:

```
id: typesafe-ai/jev   type: evaluation
pricing: input $0.000000042 per token, output $0
context window: 32000
```

That is $0.042 per million input tokens, with output free.

## Limitations

- **Early access to a new model.** Jev became available on 16 September 2026 and this integration is ten
  days later. There is no long-run reliability history to draw on.
- **The API is experimental.** `experimental_evaluate` is prefixed that way deliberately, and the AI SDK
  docs state it "and the evaluation model specification are experimental and may change in patch releases".
  It requires AI SDK 7.0.105 or later; this repo pins 7.0.114.
- **Vendor benchmarks are unreproduced.** We have not run TypeSafe's workflow evaluations and make no claim
  about them beyond quoting them with their sources.
- **Our sample is small.** A median over a handful of calls from one machine in one region is an
  observation, not a measurement of the model's performance.
- **Confidence is not available for boolean questions.** The docs state Jev returns
  `providerMetadata.typesafe.confidence` for choice and score only, and that a boolean's `probability` is
  the probability the statement is true and "not a confidence in either outcome". The Grounding Checker
  therefore shows a probability, not a confidence, and the interface says which it is.
- **Calibration is not promised.** The docs treat overconfident answers as a calibration concern rather than
  an API error, so a high probability is not a guarantee of correctness.

## Guardrails

`/demo` is public and signed out, so anyone can trigger a real call. The limits, and why, are in
[D38](../07-decision-log.md): 10 live calls per IP per hour, 300 per day in total, enforced through
`SECURITY DEFINER` functions so the browser never needs a privileged key, and the call log stores only a
timestamp, the agent id, a latency and a salted IP hash. No user content is stored, ever.
