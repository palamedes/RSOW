---
title: "Fact vs. Narrative"
kind: "Faulty reasoning"
tagline: "Whether something happened and what it means are two different arguments — and running them together is how both of them go bad."
tell: "A fact is being argued with as though it were an opinion, or an opinion is being stated as though it were a fact."
description: "What happened and what it means are separate arguments with separate rules. Why collapsing them makes people fight the facts, and how to pull the two apart mid-conversation."
---

## The short version

There are two arguments happening, and almost nobody says which one they're in:

- **What happened.** Checkable. It has an answer whether or not anybody likes the answer.
- **What it means.** Contestable, legitimately, possibly forever.

The failure runs in both directions. Somebody refuses a documented fact because they object to the story it seems to come with. Or somebody states their reading of events in the flat voice of a fact, so that disagreeing with it sounds like denying reality.

From inside the room both of these feel like one argument. Neither one gets settled.

## About the name

This one doesn't have a standard name, and I'm not going to invent one and present it as established.

The named things nearby each cover a piece of it. **Denialism** is the umbrella for rejecting settled facts to protect a position — Diethelm and McKee's 2009 paper in the *European Journal of Public Health* is the usual reference, building on work by the Hoofnagle brothers, and it lays out the recognisable tactics: conspiracy, fake experts, cherry picking, impossible standards. **[Cherry-picking](/explain/cherry-picking/)** is keeping the facts that fit and quietly dropping the rest. **Ad hoc rescue** is giving every inconvenient fact its own private reason for not counting, which is a close cousin of [moving the goalposts](/explain/moving-the-goalposts/).

None of them is quite this. Every other page here has a name you can go look up in the literature; ::this title is mine::, and it's worth knowing that.

## When the fact gets refused

{% include explain-swap.html
   a_label="What was shown"
   a="Deployment frequency dropped 40% last quarter. Here’s the chart and the query behind it."
   a_tone="cool"
   mid="The reply"
   b_label="What comes back"
   b="That’s just a narrative somebody’s pushing to make this team look bad."
   b_tone="warm" %}

Nothing has been said about the chart. Not the query, not the date range, not the definition of a deployment. The number has been answered as though it were an accusation, because that's how it arrived.

## When the story gets stated as a fact

{% include explain-compare.html
   left_label="Presented as one thing"
   left="The fact is, this team has a quality problem."
   right_label="What’s actually on the record"
   right="Three incidents last quarter|Two of them in the same module|One was an upstream dependency outage|No comparison to any other team, or to last year"
   note="Every item on the right is checkable. The sentence on the left is a reading of them — possibly a correct one, and still a reading." %}

## When both are in the same sentence

> The reckless rewrite caused the outage.

Six words, three separate claims. There was a rewrite — fact. It caused the outage — also a fact, checkable, possibly hard. It was reckless — a judgement, and a completely different kind of thing.

Agree with the first two and you have been recorded as agreeing with the third. Dispute the third and you sound like you're disputing the outage. This is the most common form by a distance, and it's usually nobody's plan — it's just how people talk.

## Why it doesn't work

**The two have different rules.** A fact gets settled by going and looking. An interpretation gets settled by argument, or doesn't get settled at all. Apply the wrong procedure and you get nothing: you cannot argue a number into being a different number, and you cannot measure your way to what something meant.

**The second direction does more damage than the first.** Denying a fact at least looks like what it is — somebody in the room will notice. Dressing an interpretation as a fact is invisible, and it converts disagreement into denial. Once "this team has a quality problem" has been established as *a fact*, anybody who disagrees isn't offering a different reading any more. They're refusing to face reality.

**And it poisons the facts themselves**, which is the part worth understanding. ::People don't usually fight numbers. They fight the sentence they think is coming after the number.:: If accepting the 40% means accepting that the team is failing, then the 40% has been made load-bearing for something a percentage cannot hold — and a perfectly reasonable person will start attacking the chart. Bundle a fact with a story and you have given everybody who dislikes the story a reason to deny the fact.

## This is not it

- **Disagreeing about what the facts mean.** Same numbers, different reading. This is most of what honest disagreement consists of and it is not a foul; it's the entire point.
- **Disputing a fact on evidentiary grounds.** "That number's wrong, the query double-counts reverts" is exactly right. Disputing facts is fine. Disputing them *because of the story attached* is the problem.
- **Genuinely unsettled questions.** Plenty of things aren't known yet. "We don't have that data" is a real answer.
- **Using facts to build an argument.** That's called making a case, and it's required. The distinction just has to stay visible rather than disappear.
- **Strong language.** Calling something reckless isn't a fallacy — it's a judgement, and you're allowed to have one. It only goes wrong when it's slipped in as though it had been measured.

The test: ::could somebody who disagreed with you completely still go and check this?:: If yes, it's a fact. If no, it's a reading — which may well be right, and still has to be argued for.

## How to call it out

Pull the two apart out loud. That's the whole technique, and it works in both directions:

- "Let's do the number on its own first. Is 40% right? We can fight about what it means after that."
- "I'll agree with all three incidents. I don't agree they add up to a quality problem. Those are two different conversations."
- "Which part am I supposed to be disagreeing with — that it happened, or that it was reckless?"

And the one to use on yourself, which is the one that actually pays: when you notice you're resisting a fact, stop and ask what story you think is riding along with it. Almost always the resistance isn't to the number at all. It's to the sentence you're expecting somebody to say next.

::You can accept the number and still fight the sentence.:: They were never the same argument.
