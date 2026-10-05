---
title: "Survivorship Bias"
kind: "Bad evidence"
aka: "survivor bias, survival bias, counting only the ones that made it"
tagline: "You study the things that came through, work out what they had in common, and never notice that the things that didn’t come through had all the same qualities."
tell: "Every case in the sample is a success, and nobody went looking for the failures."
description: "Survivorship bias draws lessons from a sample that selected itself on the thing being studied. Why the missing cases are missing precisely because they’d have changed the answer."
---

## The short version

You look at what succeeded and ask what it did right. The trouble is that the failures aren't in the room, and they're absent *because* they failed — so whatever the winners have in common might be the reason they won, or might be a thing that everybody had.

You can't tell from the winners. That's the whole problem, and no amount of studying them harder fixes it.

## Where the name comes from

Abraham Wald, working for the Statistical Research Group during the second world war. Bombers were coming back from raids with bullet holes concentrated on the wings and fuselage and hardly any on the engines, and the obvious response was to put the armour where the holes were.

Wald's answer was the opposite: armour the engines. The aircraft with holes in the engines weren't in the sample. They hadn't come back. The story gets told a little tidier than the memoranda actually were, and the name isn't his either — "survivorship bias" is a later term of art out of statistics and fund-performance research, and the word "bias" appears nowhere in what Wald wrote. But the reasoning is his, and his is the example everybody still reaches for.

## What it looks like

{% include explain-compare.html
   left_label="What you looked at"
   left="The companies that made it|The buildings still standing|The songs still played|The people who took the risk and won"
   right_label="What you couldn’t see"
   right="The ones that did the same and folded|The ones that fell down|The ones nobody remembers|The people who took it and lost"
   note="The right-hand column is the same size or bigger. It just doesn’t file reports, write memoirs, or get invited to speak." %}

"They built things properly back then" is the purest everyday version. The badly built ones are not available for inspection, on account of having fallen down.

## Why it doesn't work

The sample selected itself, on precisely the variable you're trying to explain. Whatever filter produced your dataset is the thing you most need to understand, and it's the one thing the dataset can't tell you about.

Without the failures you have no base rate, and the base rate is the entire question. "All of these founders dropped out" is perfectly compatible with dropping out being a catastrophic idea, provided enough people did it. ::If a million people bet the house and ten got rich, the ten will have a great deal in common, and the advice is still ruinous.::

The trait you've found could be necessary, sufficient, irrelevant, or actively harmful. All four look identical from inside a room full of survivors, and the story you'll build to explain it will be equally satisfying in every case.

And the bias scales with the filter. The more brutal the selection, the more distinctive the survivors look and the more confidently wrong the lesson drawn from them. ::The harder something is to survive, the more compelling and the more useless the advice of the people who did.::

## This is not survivorship bias

- **A complete sample.** If the failures are in the data too, you're fine. That's just evidence.
- **Studying winners to generate hypotheses.** Reading about successful companies is a perfectly good way to find things worth testing. It is not a way to conclude them.
- **Claims about necessary conditions.** "Everyone who finished the marathon trained for it" is trivially safe, because it's a claim about what's required rather than what's sufficient.
- **When the survivors are the population you care about.** If you maintain the buildings that are still standing, the demolished ones are genuinely none of your business.

The test is a question about the shape of your data, not its contents: ::where are the ones it didn't work for, and would I ever have heard about them?::

## How to call it out

- "How many people did the same thing and it didn't work?"
- "Where would I see the ones that didn't make it?"
- "Is that why they won, or just something they all had?"

The uncomfortable place to point this is inward. Everything you've done that worked is available to you in detail, and the version of your life where you did exactly the same things and they didn't work is not available at all. Your own experience is unavoidably the most survivorship-biased dataset you will ever consult, and you consult it constantly.
