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
| Announced, TypeSafe launch | 15 Sep 2026 | [Vercel blog](https://vercel.com/blog/ai-gateway-jev-model-launch), which states Jev "was introduced on September 15" |
| Available on Vercel AI Gateway | 16 Sep 2026 | [changelog](https://vercel.com/changelog/typesafe-ai-jev-now-available-on-ai-gateway), published that date |
| Launch write-up | 18 Sep 2026 | [blog](https://vercel.com/blog/ai-gateway-jev-model-launch) |
| This integration | 26 Sep 2026 | this repo |

The two dates are different events rather than a contradiction: TypeSafe announced the model on the 15th,
and it became callable through Vercel AI Gateway on the 16th. Both are recorded because this integration
depends on the Gateway availability date, not the announcement.

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
- **Cost per call**, from the provider's own token counts multiplied by the Gateway's published price.

Both latency and cost are small-sample figures from one machine in one region on one day. They are not a
benchmark and are not comparable to the vendor's evaluations below.

**Status as of 26 Sep 2026: live and answering, on the deployment as well as locally.** All three agents
return `outcome: live` with a valid signature on `architect-2-zeta.vercel.app` and render "Live result". The run that produced these is reproducible:
`node --experimental-strip-types scripts/jev-latency.mjs`.

| Measured | Value | How |
|---|---|---|
| Median latency | **556 ms**, range 464 ms to 778 ms | 9 calls, 3 per agent, all successful |
| Median excluding the first call | 529 ms. A run's first call carries connection setup | same run |
| Input tokens per call | 482 intake, 422 grounding checker, 371 escalation router, identical on every repeat | provider `usage.inputTokens` |
| **Cost per call** | **$0.0000179** at the mean of 425 tokens, about **56,000 calls per dollar** | 425 times $0.000000042, the Gateway's published price |

**Latency moved between runs and we are not going to average that away.** An earlier run of 15 calls, fired
back to back, gave a median of 430 ms. This run of 9, spaced out, gave 556 ms. In between, the Gateway
started returning 503s from its upstream provider and advertising a 5 request window
(`x-ratelimit-limit-requests: 5`), so the scripts now space and retry. Both figures are real and neither is
a benchmark: this is one machine in one region against a service under varying load.

Cost is the figure that does not drift. The schema and the state are fixed, so token counts are identical on
every repeat, and the per call cost is arithmetic on two exact numbers. Note it rose from $0.000017 to
$0.0000179 when the grounding criteria were tightened: a longer question is a bigger prompt, 363 tokens to
422. That is the price of asking the question properly, and it is about two hundredths of a cent.

### The low confidence case, observed rather than constructed

On the sample message, one call returned both of these at once:

| Question | Type | Answer | Confidence |
|---|---|---|---|
| `topic` | choice | `billing_credits` | **100%** |
| `urgency` | score | `0.72` | **42%** |

Below 60% the interface stops showing a number alone and says "Jev was not clearly decided here, so this one
would go to a person rather than through automatically." So a single call produced one answer that routes
itself onward and one that routes itself to a human, which is the behavior the threshold exists for. It was
not arranged: it is what the sample input returns.

For contrast, given "My invoice charged me twice this morning and I need the money back today", the same
agent moved to `billing_refunds` at 95% and scored urgency 2.95 of 3, the rubric level that reads "money has
left their account".

### When the live model disagreed with our own demo

The round 2 review tried the first thing a technical reader tries: it ran the Grounding Checker on its own
sample. That sample is the sentence the "Why did it do that?" panel calls ungrounded. The live model
answered **grounded: Yes at 69%**. The demo contradicted itself in the one place built to show honesty.

The interesting part is that the model was not wrong. It was answering the question we asked:

> Is every claim in the draft answer supported by the source article?

The draft says "your credit will be applied **at the start of** your next billing cycle" and the source says
"account credits apply at the next billing cycle". As a paraphrase that is defensible, and 0.69 is a fair
reading of a loose question. The bug was ours: we wanted "does the source state every detail, including the
timing", and we did not ask that.

Asked the question we meant, naming timing words explicitly, the same model on the same input answers
differently. Five runs each, nothing else changed:

| Criteria | P(grounded) over 5 runs | Median | What the demo shows |
|---|---|---|---|
| Before, "is every claim supported" | 0.69, 0.71, 0.71, 0.73, 0.74 | **0.71** | "Yes", contradicting the trace |
| After, timing words named | 0.13, 0.14, 0.14, 0.14, 0.15 | **0.14** | "No", agreeing with the trace |

Two changes came out of it, and the second matters more than the first:

1. **The source article is now shown** beside the input, with every fixed field labeled. A grounding result
   that does not show what it was checked against cannot be checked by the reader either.
2. **A grounding answer ships only at P(grounded) >= 0.90**, and below that it goes to a person. The bar is
   an error budget, not a tuned number: at a bar of p, roughly (1 - p) of shipped answers carry an
   unsupported claim, and we will ship fewer than 1 in 10. Jev reads a boolean at 0.5, which is a coin flip
   rather than a bar. Full reasoning in [D43](../07-decision-log.md).

The honest lesson for anyone adopting a decision model: **the criteria are the program.** A vague criterion
does not fail loudly, it returns a confident number for a question you did not mean to ask. The fix was not
a better model or a higher temperature. It was writing down what we actually wanted checked.

### A boolean question really does return no confidence

The other thing the live responses settled that the docs alone could not. In one run, reading the same field
with the same code:

| Agent | Question type | `providerMetadata.typesafe.confidence` |
|---|---|---|
| Intake | choice and score | `{"topic":1,"urgency":0.43}` |
| Escalation Router | choice | `{"queue":1}` |
| Grounding Checker | **boolean** | **`{}`**, empty |

The boolean answer carried `probability: 0.71` and no confidence at all. The Grounding Checker shows a
probability because that is all there is, not as a matter of interpretation.

**The AI SDK does not return a latency.** No timing field is documented on the evaluate result, so every
latency here is wall-clock measured on our side, which includes network time to the Gateway. That is what
we publish and it is labeled as such.

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
  days later. There is no long-run reliability history to draw on. Our own sample is 22 calls on one day,
  which says nothing about reliability over weeks.
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
  therefore shows a probability, not a confidence, and the interface says which it is. Confirmed against
  real responses on 26 Sep 2026, not taken on the documentation's word: see [metrics.md](metrics.md).
- **Calibration is not promised.** The docs treat overconfident answers as a calibration concern rather than
  an API error, so a high probability is not a guarantee of correctness.

## Guardrails

`/demo` is public and signed out, so anyone can trigger a real call. The limits, and why, are in
[D38](../07-decision-log.md): 10 live calls per IP per hour, 300 per day in total, enforced through
`SECURITY DEFINER` functions so the browser never needs a privileged key, and the call log stores only a
timestamp, the agent id, a latency and a salted IP hash. No user content is stored, ever.

Both limits are proven rather than asserted, and they could be proven even while the Gateway was refusing,
because both are checked before the model is called. The method, the results and the cleanup are in
[metrics.md](metrics.md) and [D39](../07-decision-log.md). Worth stating: the counter deliberately counts
only successful calls, so a visitor who hits a Gateway error has spent none of their quota.
