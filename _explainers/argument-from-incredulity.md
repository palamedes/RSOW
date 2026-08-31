---
title: "Argument from Incredulity"
kind: "Thinking trap"
aka: "the appeal to personal incredulity"
tagline: "“I can’t imagine how that could be true, therefore it isn’t” — treating the limits of your own imagination as a measurement of the world."
tell: "The evidence on offer is a feeling of disbelief."
description: "Argument from incredulity mistakes 'I can't see how' for 'it can't be'. Why the reaction is useful but the conclusion isn't, and why expertise makes this one worse rather than better."
---

## The short version

"I can't see how that could work, so it doesn't."

The premise is a fact about you. The conclusion is a claim about the world. There is nothing in between them, and no amount of confidence supplies it.

## What it looks like

{% include explain-swap.html
   a_label="What’s actually known"
   a="I don’t see how a two-person team could have shipped that in three weeks."
   a_tone="cool"
   mid="Therefore"
   b_label="What gets concluded"
   b="They’re lying about the timeline."
   b_tone="warm" %}

{% include explain-swap.html
   a_label="What’s actually known"
   a="I can’t picture how that outage would produce this error."
   a_tone="cool"
   mid="Therefore"
   b_label="What gets concluded"
   b="The outage isn’t the cause. Look somewhere else."
   b_tone="warm" %}

{% include explain-swap.html
   a_label="What’s actually known"
   a="There’s no way a real user would ever click that."
   a_tone="cool"
   mid="Therefore"
   b_label="What gets concluded"
   b="We don’t need to handle it."
   b_tone="warm" %}

The third one has a body count. Most of the interesting bugs in production were once somebody's confident sentence about what no user would ever do.

## Why it doesn't work

Your ability to picture a mechanism is a fact about your imagination, your experience, and roughly how much sleep you got. It isn't a measurement of anything outside your head, and it never becomes one no matter how strongly you feel it.

But it's worth being fair about why this feels so reasonable, because the reaction itself is genuinely useful. ::When something sounds impossible, quite often it is.:: Experienced people are right about this more often than not, which is exactly what makes the trap work — the reaction has a decent hit rate, so it gets promoted from *signal* to *verdict* without anybody noticing the promotion.

The failure isn't having the reaction. It's stopping there. "I can't see how that works" is the best reason there is to go and find out how it works. Nearly everything worth knowing is on the far side of that sentence.

And this one gets *worse* with expertise, not better. The more you know, the more confident your incredulity feels, and the more the room defers to it. Senior people kill correct ideas this way constantly, and they do it with a completely straight face, because from the inside it doesn't feel like a failure of imagination — it feels like judgement.

## This is not argument from incredulity

- **A named constraint.** "That can't be right, because the disk won't do more than twelve thousand IOPS" is not incredulity. It's a specific limit, and it's checkable — which means it can also be wrong, which is what makes it an argument.
- **Assigning a low probability.** "I doubt it" is a reasonable position and it isn't a conclusion. Doubt with the door left open is just calibration.
- **Wanting evidence in proportion to the claim.** Big claims genuinely do need more support. Asking for it isn't the same as refusing to look.
- **Pattern recognition, stated as such.** "I've seen this go wrong four times, so I want to check" is experience being used properly — as a reason to investigate rather than a reason to stop.

The test is a single question: ::can you say what's wrong with it, or only that it seems wrong?:: A named mechanism is an argument. A feeling is a prompt to go and look.

## How to call it out

Including — mostly — on yourself:

- "What specifically breaks? Name the step."
- "Is that a constraint or a hunch? Both are worth having, I just want to know which one this is."
- "What would have to be true for this to work?"

That last one is the good one. Asked honestly, it has exactly two outcomes: you find the flaw, which is what you wanted, or you find the explanation, which is better than what you had. There's no third outcome where you stay where you were, which is precisely why it's worth asking.
