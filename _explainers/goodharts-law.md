---
title: "Goodhart's Law"
kind: "Bad evidence"
aka: "when a measure becomes a target, teaching to the test"
tagline: "The number was useful because it tracked the thing you cared about. Then you started rewarding the number, and people optimised the number — which is precisely what stopped it tracking anything."
tell: "The metric is improving and nobody can point at anything that got better."
description: "A proxy earns its usefulness in the wild and loses it the moment it becomes a target. Goodhart’s actual sentence, Strathern’s famous one, and the question to ask before adopting any metric."
---

## The short version

You want something you can't measure directly — good teaching, healthy code, customers who got helped. So you find a number that reliably goes up when that thing goes up, and you start paying attention to it.

Then you attach a consequence to the number. And people do what people do, which is get you the number. ::The correlation that made the measure worth having is the exact thing the pressure destroys.::

## Where the name comes from

Two sentences, twenty years apart, and the famous one isn't Goodhart's.

Charles Goodhart, a Bank of England economist, wrote the original in 1975, about monetary policy: *any observed statistical regularity will tend to collapse once pressure is placed upon it for control purposes.* Dry, narrow, and exactly right.

The version everybody quotes — **"when a measure becomes a target, it ceases to be a good measure"** — is the anthropologist **Marilyn Strathern's**, from a 1997 paper about audit culture in British universities. She was generalising his point and gave it the phrasing that made it travel. Goodhart's name stayed on it; her sentence is the one people actually say.

The sociologist Donald Campbell arrived at the same place independently in 1979, in a form worth having alongside it: the more a quantitative indicator is used to make social decisions, the more it will be corrupted, and the more it will distort the process it was meant to monitor.

## What it looks like

{% include explain-compare.html
   left_label="What you actually wanted"
   left="Children who can read|Fast emergency care|Working software|Customers who got helped|A codebase people can maintain"
   right_label="What the number came to mean"
   right="Children who are good at the test|Ambulances held outside the doors so the clock doesn’t start|More lines of code|Tickets closed inside the window|Nobody touches the risky parts"
   note="Every number on the right went the right way. That is what makes it hard to argue with in a meeting." %}

## Why it doesn't work

A proxy earns its keep out in the world, where nobody is trying. Test scores track reading ability because, left alone, the main way to get a good score is to be able to read. That's the whole basis of the measurement — an incidental relationship that held while nothing depended on it.

Attach a consequence and you've changed the conditions under which the relationship was observed. ::Now there are two ways to move the number, and the cheaper one has nothing to do with what you wanted.:: Nobody has to be cynical about this. A teacher who spends March on exam technique is responding sensibly to what they are being asked for.

There's a second effect, and it's the one that does the lasting damage: the measure stops being able to tell you it's broken. Before the target, a falling number was information. Afterwards, a rising number is compatible with the underlying thing getting worse, and you have lost the instrument you would have used to notice. The dashboard is green. That's all you know.

And it gets worse with better enforcement. Harder targets, tighter monitoring and stiffer consequences all increase the pressure on the regularity — which is Goodhart's actual claim, and the reason "we just need to hold people properly accountable to the metric" is a proposal to make the problem worse.

## This is not Goodhart's Law

- **Measuring things.** You have to. Running an organisation on vibes because metrics can be gamed is not the lesson, and it fails in more ways.
- **A target that is the goal itself.** If you want revenue and you target revenue, there's no proxy to come apart — the number *is* the thing. Goodhart needs a stand-in.
- **A measure watched without consequences attached.** This is Goodhart's own qualifier: the collapse comes from pressure applied *for control purposes*. A number nobody is rewarded or punished for keeps reporting honestly, which is why the most useful metrics are often the ones nobody's bonus touches.
- **Ordinary gaming that gets caught.** Somebody fiddling a figure and being stopped is a discipline problem. Goodhart is what happens when nobody breaks a single rule.

The test to run before you adopt a metric, not after: ::could somebody max this number while doing nothing you actually wanted — and would you find out?::

## How to head it off

- **Ask the maxing question out loud, in the meeting where the target is proposed.** Somebody in the room can always answer it, and they will enjoy being asked.
- **Keep the measure away from the consequence** wherever you can afford to. A number used to *understand* and a number used to *reward* should ideally not be the same number.
- **Measure several things that trade against each other.** Speed alone gets you speed. Speed plus reopened-tickets plus a sample somebody actually reads is much harder to satisfy dishonestly than either half.
- **Keep a qualitative channel that is allowed to contradict the number** — and listen to it specifically when the dashboard is green, because that's the only condition under which it tells you anything you didn't already have.

The counsel of despair here is to give up on measurement, and it's wrong. ::A measure that can be gamed is still better than a guess that can't be checked.:: What Goodhart buys you is the knowledge that the number has a shelf life, that the shelf life gets shorter the more weight you put on it, and that the day it stops being questioned is the day it stops being evidence.
