---
title: "The XY Problem"
kind: "Thinking trap"
aka: "asking about your guess instead of your goal"
tagline: "You need X, you decide Y will get you there, and you only ever ask about Y — so everybody helps you perfect an approach that was never going to work."
tell: "The question is about a solution, and nobody has said what it's for."
description: "The XY problem is asking about your attempted solution instead of your actual problem. Why hiding the goal wastes the one thing the helper needed, and the single question that unpicks it."
---

## The short version

You have a problem — call it X. You come up with an approach that you think will solve it — call that Y. Then you go and ask for help with Y.

Nobody hears about X. So everybody helps you with Y, carefully and in good faith, and some of them are quite good at it. ::You get an excellent answer to the wrong question,:: and X is still sitting there when you're finished.

## Where the name comes from

Help channels — Usenet, IRC, and later every question site that replaced them. It's folklore rather than anybody's coinage, and the letters are just algebra: X is what you actually want, Y is the thing you guessed would get you it.

The example that made it famous is a small one. Somebody asks how to get the last three characters of a filename. It's an easy question and it gets easy answers, and every one of them is wrong, because what they wanted was the file extension — and `.jpeg` is four, `archive.tar.gz` is complicated, and `Makefile` doesn't have one at all. The question was answerable. It just wasn't the question.

## What it looks like

{% include explain-swap.html
   a_label="What you actually need (X)"
   a="The file’s extension."
   a_tone="cool"
   mid="Gets replaced by a guess"
   mid_note="…and only the guess gets asked about."
   b_label="What you ask about (Y)"
   b="How do I get the last three characters of a filename?"
   b_tone="warm" %}

{% include explain-swap.html
   a_label="What you actually need (X)"
   a="The nightly deploy keeps failing, always around five o’clock."
   a_tone="cool"
   mid="Gets replaced by a guess"
   mid_note="…and only the guess gets asked about."
   b_label="What you ask about (Y)"
   b="How do I raise the CI timeout?"
   b_tone="warm" %}

{% include explain-swap.html
   a_label="What you actually need (X)"
   a="My kid keeps arriving at school late."
   a_tone="cool"
   mid="Gets replaced by a guess"
   mid_note="…and only the guess gets asked about."
   b_label="What you ask about (Y)"
   b="What’s the loudest alarm clock I can buy?"
   b_tone="warm" %}

The last one isn't a programming problem, which is the point. This isn't a technical failure mode that happens to show up at work — it's a shape that human questions take, and the alarm clock will not help if the child is missing the bus for some entirely different reason.

## Why it doesn't work

Because you spent the most valuable thing you had before the conversation started.

You know X for free. It's yours, it costs you nothing to say, and it is the only piece of information the other person cannot get on their own. Then you throw it away and hand over the guess instead. ::The people best placed to tell you that Y is the wrong approach are exactly the people you've hidden X from.::

What makes it so easy to fall into is that it feels considerate. You're being efficient. You've done the thinking, you've narrowed it down, and you're not going to waste anybody's time with a rambling story about your afternoon — you'll just ask the specific technical question. The instinct is generous. It just happens to delete the only part that mattered.

And it gets worse when it works. If nobody ever solves Y, you'll eventually go back and explain yourself. But if somebody *does* solve Y — cleanly, helpfully, in four lines — then you now have a working piece of machinery pointed at the wrong problem, plus the belief that you're nearly finished. That's a harder position to climb out of than having got no answer at all.

{% include explain-compare.html
   left_label="What you gave them"
   left="Your guess|A narrow technical question|Your afternoon’s thinking, pre-chewed"
   right_label="What they needed"
   right="The goal|What you’ll do once you have it|Whether Y was ever going to work"
   note="One of these you had lying around for free. It’s the one you kept to yourself." %}

## This is not the XY problem

- **Actually wanting Y.** Sometimes the last three characters really is the question. Asking a narrow question because you want a narrow answer is just asking a question.
- **A deliberately scoped ask.** "I know this is a workaround and I want the workaround, we ship on Thursday" isn't hiding anything. The context is right there, and so is the reason.
- **Not being able to say X.** Sometimes the goal is genuinely confidential. The fix for that is to say *that* — "I can't get into what this is for, but here's the constraint" — rather than letting the guess stand in as the whole story.
- **A question that needs no background.** Not everything requires your life history. "What's the flag for case-insensitive grep?" is complete as it stands.

The test takes one second. ::If they solve exactly what you asked, are you actually finished?:: If the honest answer is no, then you've asked about Y, and you should say so before somebody starts working.

## How to call it out

On yourself, which is where most of the value is, it's one extra sentence in front of the question: **"I'm trying to X. I thought Y might do it — is Y right?"** That's the whole discipline. It costs you nine words and it gives the other person permission to throw out your approach, which they will not otherwise feel entitled to do.

On somebody else, ask the goal, not the diagnosis:

- "What are you going to do with it once you've got it?"
- "Say this works perfectly — walk me to the end. What happens next?"
- "What made you land on that approach? I might have another one."

And a small piece of advice about the name itself: don't use it. ::"That's an XY problem" is a status move,:: however accurate it is — it tells somebody they asked wrong before it tells them anything useful, and the reliable result is that they defend the question instead of answering the one you actually want. "What's it for?" gets you the same information and costs nobody anything.
