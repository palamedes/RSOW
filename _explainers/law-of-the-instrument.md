---
title: "Law of the Instrument"
kind: "Thinking trap"
aka: "Maslow’s hammer, the golden hammer"
tagline: "You already have a favourite tool, so every problem starts arriving pre-shaped to fit it."
tell: "The solution was picked before the problem finished being described."
description: "Maslow's hammer: when you're good at one tool, problems start looking like the kind that tool solves. Why it compounds with expertise, and the question that breaks the groove."
---

## The short version

This one isn't a trick anybody plays on you. It's a groove you fall into, and you fall into it *because you're good at something*.

Once a tool is familiar, it's the cheapest thing to reach for. So you reach for it a little more often than the situation calls for. And then the reasoning runs backwards without announcing itself: the solution gets chosen first, and the problem gets described in whatever terms make that solution fit.

## Where the name comes from

Two people, two years apart, both called Abraham. Abraham Kaplan, in 1964: *"Give a small boy a hammer, and he will find that everything he encounters needs pounding."* Abraham Maslow, in 1966, in the form everybody actually quotes: *"I suppose it is tempting, if the only tool you have is a hammer, to treat everything as if it were a nail."*

## What it looks like

{% include explain-compare.html
   left_label="The tool, already chosen"
   left="Kubernetes|A new microservice|A machine-learning model|A recurring meeting|A rewrite"
   right_label="What the job actually needed"
   right="Two servers and a cron job|A function in the code you already have|Three if-statements and a lookup table|One message to one person|Four hours in the module that actually breaks"
   note="Every tool on the left is a good tool. That’s exactly why it got picked before anyone finished describing the problem." %}

## Why it doesn't work

The trouble isn't that the tool is bad. It's usually a good tool — that's why you like it, and that's why this is hard to catch.

The failure is that ::the problem never got characterised independently of the solution::. You can't tell whether the fit is good, because the description of the problem came *from* the tool. Any evidence you'd use to check has already been shaped by the thing you're checking.

And it compounds, which is the genuinely uncomfortable part. Every use makes you better with the tool. Being better makes it cheaper to reach for. Cheaper means you reach for it more. Expertise and this trap are the same process seen from two different angles, and there is no point at which you get good enough to stop being susceptible — you get more susceptible.

The organisational version is worse again. Teams that are good at a thing get handed the problems that suit the thing, which makes them better at it, which makes them the obvious choice next time. Give it three years and nobody left in the building is able to evaluate the alternatives, because nobody has used one since 2023.

## This is not the law of the instrument

- **Actual expertise.** Reaching for the tool you know best is frequently the right call, and it's always faster. The question isn't whether you used the familiar thing — it's whether you ever checked.
- **Deliberate standardisation.** "We use Postgres for everything, including things it's mediocre at, because running six databases is worse than running one" is a real trade-off, made on purpose, with the cost acknowledged. That's a decision, not a groove.
- **Constraints you don't control.** If it's the only thing your platform team supports, you're not choosing a hammer. You've been handed one.
- **Liking your tools.** Enthusiasm isn't a fallacy, and people who enjoy their tools tend to be good with them.

The test: ::can you describe what this problem would have to look like for you to pick something else?:: If there's no such shape — if every version of the problem ends the same way — then you weren't choosing, you were arriving.

## How to break the groove

All of these are for yourself, mostly:

- **"What would we do if we didn't have it?"** The single most useful question on this page. You don't have to like the answer. You just have to have one.
- **"How would somebody who's never used this solve it?"**
- **"What's the smallest thing that would work?"** — asked seriously, as an actual first draft, not as a rhetorical trap you're planning to dismiss.
- **Write the problem down before you start, in terms that name no tool.** If you can't write that paragraph, you don't have a problem yet. You have a preference, and you're about to go build it.
