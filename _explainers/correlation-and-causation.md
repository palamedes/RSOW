---
title: "Correlation and Causation"
kind: "Bad evidence"
aka: "cum hoc ergo propter hoc, post hoc ergo propter hoc"
tagline: "Two things move together, so one gets announced as the cause of the other — and the third thing driving both is never mentioned, because nobody went looking for it."
tell: "A relationship in the data was upgraded to a mechanism, and nobody proposed one."
description: "Two things moving together is consistent with four different explanations, and the data can’t choose between them. Why reverse causation is the underrated one, and what separates predicting from intervening."
---

## The short version

Two things rise and fall together. That's a real observation and frequently a useful one. Then it quietly becomes the claim that one of them *makes* the other happen — which is a different and far larger claim, and nothing in the correlation supports it.

## Where the name comes from

The Latin comes in a pair. *Cum hoc ergo propter hoc* — "with this, therefore because of this" — for two things that move together. And *post hoc ergo propter hoc* — "after this, therefore because of this" — for the version where one merely came first, which is the same mistake wearing a watch.

## What it looks like

{% include explain-compare.html
   left_label="What the data shows"
   left="A and B move together"
   right_label="Which is equally consistent with"
   right="A causes B|B causes A|Something else causes both|Coincidence, if enough pairs were checked"
   note="The data is exactly as happy with all four. Picking one is a decision somebody made, not a finding." %}

## Why it doesn't work

Because all four of those explanations fit the observation perfectly, and the correlation contains no information that distinguishes them. ::What feels like reading the answer off the data is actually choosing one, and the choosing happens somewhere you can't see it.::

**Reverse causation** is the underrated one. "People who eat breakfast are thinner" — or being thinner makes you likelier to want breakfast. The numbers are symmetric. Only the sentence has a direction, and the direction came from the person writing the sentence.

**The confounder** is the common one. Ice cream sales and drownings track each other beautifully, and neither is doing anything to the other; it's summer. The third variable is usually mundane, usually obvious in hindsight, and reliably absent from the chart.

**Coincidence** scales with how hard you looked. Compare enough pairs of unrelated series and you'll turn up correlations above 0.9 that mean nothing whatsoever — there's a whole cottage industry of these, and they're funny precisely because the fit is so good.

What makes the fallacy sticky is that we don't experience a correlation neutrally. A story arrives attached to it, immediately and for free, and the story feels like evidence because it explains the data so well. The trouble is that the three rival stories explain it exactly as well, and they didn't happen to show up.

## This is not the fallacy

- **Using a correlation to predict.** If all you need is a forecast, you don't need the mechanism at all. This is the distinction that matters most in practice: ::a correlation is enough to bet on and not enough to intervene on.:: Insurers price on correlations happily and correctly, and they aren't claiming to know why.
- **Correlation as the start of an investigation.** It's how almost every causal discovery in history began. Noticing is not concluding.
- **A causal claim with a mechanism and a test.** Once somebody can say *how*, and the how makes a prediction that could come out wrong, you have an argument rather than a pattern.
- **Randomised experiments.** Random assignment is the specific tool built to turn correlation into causation. If it was a properly randomised trial, this objection simply doesn't apply, and raising it anyway is its own kind of error.

The test: ::what's the third thing, and has anybody actually looked for it?::

## How to call it out

- "Which direction is this? What rules out the other one?"
- "What would explain both of them at once?"
- "If we changed A on purpose, what's the prediction?"

That last one does the most work, because it walks the conversation straight to the difference between predicting and intervening — and intervening is almost always the thing being proposed. Somebody who only has a correlation will notice, at that moment, that they can't answer it. Usually before you have to point it out.
