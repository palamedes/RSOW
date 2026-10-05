---
title: "Special Pleading"
kind: "Faulty reasoning"
aka: "one rule for me, the convenient exception"
tagline: "The rule applies to everybody — right up until it applies to you, and then there’s a reason it doesn’t, and the reason has never come up before."
tell: "The exception has no test behind it. It just happens to cover this case."
description: "Special pleading exempts a favoured case from a rule applied to everyone else, without a reason that would work for anyone in the same position. Usually the favoured case is your own — it doesn't have to be."
---

## The short version

You hold a standard. It applies generally. Then your own case comes up, and it turns out there's a reason this one is different — a reason that has never been offered to anybody else, and wouldn't be.

The move isn't *having* an exception. Exceptions are fine, common, and often correct. The move is having one that's justified by nothing except whose case it is.

## What it looks like

{% include explain-compare.html
   left_label="The rule, for everyone"
   left="Every change gets reviewed before merge|Estimates go in the tracker|Break the build, fix it the same day"
   right_label="The rule, for me"
   right="Mine was urgent|Mine was too small to be worth the ceremony|I’ll get to it, I’m in the middle of something"
   note="None of the three exceptions is unreasonable. None of them has ever been extended to anybody else, either." %}

{% include explain-swap.html
   a_label="The policy, stated"
   a="No exceptions to the code freeze. None. I don’t care what it is."
   a_tone="cool"
   mid="When it’s their release"
   b_label="The policy, applied"
   b="This one’s different — it’s basically a config change."
   b_tone="warm" %}

## Why it doesn't work

An exception is supposed to come with a *rule*. "X is exempt when condition C holds" is a perfectly good refinement of a standard, and the reason it's good is that it's testable: you can go and look for other cases where C held, and check whether they got exempted too.

Special pleading skips the rule and delivers only the exemption. There's nothing to test, because there's no general statement — just this case, this once, for reasons that evaporate the moment somebody else needs them.

::Ask for the exception stated as a principle that doesn't mention you.:: If it can't be stated that way, there isn't one.

It's worth saying that almost nobody does this deliberately. You have access to your own reasons in a way you never have to anybody else's. You *know* your change was genuinely urgent — you can feel the urgency, you remember the Slack thread. When somebody else skips review, all you can see is that they skipped review. So your case really does look different from where you're standing. It just isn't.

## This is not special pleading

- **Real exceptions, written down.** "Hotfixes skip review. Here's the definition of a hotfix, and here's the log of every one we've shipped." That's a rule, and it applies to everybody.
- **Circumstances that actually differ.** Sometimes your case genuinely is different. The test is whether you'd hand the same exemption to the next person whose case matched — and whether you'd recognise the match.
- **Asking for an exception out loud.** "I know the rule, I'm asking you to waive it this once, here's why" is a request, not a fallacy. It's honest precisely *because* it concedes the rule applies.
- **Rules that differ by role on purpose.** Some things really are different for the on-call engineer or the person who owns the system. That's policy, as long as it's policy somewhere other than in your head.

## How to call it out

- "What's the rule? Say it in a way that doesn't mention you."
- "Would that reason have worked for [the last person who asked]? Because they got told no."
- "I'm fine with the exception. I want it written down, so the next person gets it too."

That last one is the strongest thing you can say, and it isn't even an attack — it's agreement, with one condition attached: the exception becomes a rule.

If that lands fine, then it was a real exception and you've just improved the policy. If it doesn't land fine, you've learned what the exception was actually for, and so has everybody else in the room.
