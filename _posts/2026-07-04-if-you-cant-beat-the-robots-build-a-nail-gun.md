---
title: "If You Can't Beat the Robots, Build a Nail Gun"
layout: post
date: 2026-07-04
image: /assets/images/2026/if-you-cant-beat-the-robots-build-a-nail-gun.png
categories:
- Rant
- Software
tags:
description: "Everyone's terrified AI is coming for their job. Most of that fear is theater. The real question was never 'can a robot replace me' ... it's 'what can I build now that I couldn't before.' So I built Cardinal, a Kanban board where dragging a card hires an AI to do the work, and the human still owns every merge."
excerpt: "A lot of people are terrified of AI right now, and honestly, I get it. But the fear is pointed in the wrong direction. The question was never 'can AI replace me.' The better question is 'what can I build now that I couldn't build before.' AI isn't a god or a genius in a glowing rectangle. It's a nail gun. And I built a very opinionated, Kanban-shaped nail gun to prove the point."
---

A lot of people are absolutely terrified of AI right now.

And honestly? I get it.

Everywhere you look, somebody is promising that AI is going to save the world, end the world, cure cancer, cause cancer, design your house, destroy your house, diagnose your rash, or give you a rash!  Or more likely, replace your entire dev team and you're going to become worthless and unhireable.

I feel like it's a lot. It's loud. And most of it is nonsense.

**Because here's the thing nobody screaming about the robot apocalypse seems willing to say out loud: the question was never "can AI replace me."**

The better question (the only useful question) is "what can I build now that I couldn't build before?"

That's the part everyone keeps fumbling.

## The Panic Is Mostly Theater

Let me be clear about what I'm *not* saying.

I'm not saying nobody's job will ever change. I'm not saying there's zero disruption coming. I'm not saying every executive salivating over the phrase "headcount reduction" is your friend. Those are real. We'll get to them.

What I'm saying is that most of the loud fear ... the stuff clogging your feed, the breathless "AI will make us all obsolete by Tuesday" takes ... isn't analysis. It's theater.

It's the same move as every other moral panic: take something complicated, flatten it into a cartoon, and cast a villain. Except this time the villain is a text box.

The cartoon goes like this: any day now, a machine is going to wake up, understand your entire job better than you do, and quietly do it while you're demoted to watching a dashboard blink. The robot takes the wheel. You take the exit.

And it sounds profound right up until you actually use one of these things for more than eleven minutes.

Because if you've *actually* worked with AI ... not watched a demo, not read a tweet, actually put your hands on it and tried to ship something ... you know it is not a genius trapped in a glowing rectangle. It's a very fast, very confident, very well-read intern who will occasionally invent a function that doesn't exist, cite a source that was never written, misread a plain instruction, and then apologize with the warmth of a hostage.

It is genuinely useful. It is also genuinely dumb in ways that would get a human fired. Both things are true at once, and any honest conversation about AI has to hold both.

**The panic pretends only the first half exists. The denial pretends only the second half does. Both are lying to you.**

So let's do what the fearmongering, finger-wagging, vibes-first crowd never does: let's actually look at the thing.

## What People Are Actually Afraid Of

Strip away the sci-fi and the fear breaks into three piles.

**Pile one: "It'll do my job better than me."** For the overwhelming majority of real jobs, no, it won't. Not because the tech is weak, but because most jobs are not "produce text" or "produce code." They're judgment, context, taste, accountability, and knowing which of the ten plausible answers is the one that won't blow up in production. AI is spectacular at generating options and genuinely bad at knowing which option is correct. That gap is not a rounding error. That gap is the job.

**Pile two: "My boss will use it as an excuse to fire me."** Now *this* one is real. This is the actual worry hiding under the sci-fi costume. But notice ... that's not a fear of AI. That's a fear of the same management that would offshore you, RIF you, or replace you with a spreadsheet if the number looked better. The robot didn't decide to cut your team. A person did, and they were going to reach for whatever excuse was handy. Be angry at the right thing. "AI took my job" is usually "a human used AI as a reason for a decision they already wanted to make." The tool is not the one signing the paperwork.

**Pile three: "It'll flood the world with confident garbage."** Also real, and already happening. The internet is filling up with plausible, soulless, wrong-in-subtle-ways slop. But the fix for that isn't fearing the tool. The fix is the exact thing the panic crowd refuses to value: humans in the loop who can tell good from garbage and are willing to say "no, that's wrong, do it again."

See the pattern? Two of the three real fears aren't about the machine at all. They're about *people* ... people making lazy decisions, people abdicating judgment, people wanting a villain more than a solution.

**The machine is not the problem. The plan for the machine is the problem.**

And a bad plan is a fixable thing. Which is the entire point.

## AI Is a Nail Gun

Here's the analogy I keep coming back to, and I'm going to beat it into the ground because it's correct.

AI is a nail gun.

Can you build a house with a hammer? Absolutely. People framed houses by hand for centuries, one swing at a time, and those houses are still standing.

But if you're framing walls all day and somebody hands you a nail gun, only a lunatic plants his feet and says, "No thank you, I prefer to prove my craftsmanship by slowly destroying my elbow, one nail at a time."

The nail gun doesn't build the house. It doesn't read the plans. It doesn't decide where the walls go, whether the foundation is level, whether the kitchen should be bigger, whether the wiring will burn the place down, or whether the roofline makes any sense at all.

**You still need a builder. You still need judgment. You still need taste. You still need experience. And yes ... sometimes you still need the hammer.**

What the nail gun changes is the *speed* and the *scale* of what one person can do. It turns the mindless, repetitive, elbow-wrecking grind into something fast and repeatable, so the builder can spend their attention on the parts that actually require a brain.

That is exactly what AI is becoming for software.

Not a replacement for the developer but a force multiplier for the developer who's willing to stop pretending the hammer is sacred.

And here's the part the doomers and the worshippers both miss: a nail gun is dangerous *precisely because* it's powerful. You don't toss it into an empty room and shout "good luck, little buddy, build whatever you feel like!" You point it at the right thing. You keep your hands clear. You follow the safety rules. You inspect the work.

That's not fear of the tool. That's respect for consequences. There's a difference, and the whole argument lives in that difference.

## So I Built a Nail Gun

Which brings me to the genuinely funny part.

I used AI to build a tool for using AI to build software.

I know. Read it again. It sounds like a snake eating its own tail. But sit with it for five seconds and it's the most natural thing in the world, because *this is what good tools have always done.* They compress friction.

A compiler lets you write something close to your intent instead of hand-assembling machine code. A framework saves you from rebuilding routing and sessions and background jobs from scratch every single time. Git lets you branch, review, merge, and undo instead of maintaining a folder called `final_final_REAL_v7_ACTUAL`.

Every one of those was, at some point, "cheating." And every one of them just became *how we work.*

The tool I built is called **Cardinal**, and I built it because using AI to write code ... right now, today, the normal way ... feels like babysitting a brilliant, hyperactive junior developer through a keyhole.

You know the dance. You paste a prompt into a chat window. It hands you code. You copy the code into your editor. It breaks. You explain what broke. It hands you a patch. You paste the patch. You realize it forgot half the context from four messages ago. You remind it. It fixes the bug and casually changes three unrelated things you didn't ask about. You catch two of them. The third one you find in production.

That works for small stuff. But it is not a workflow. It's duct tape and vigilance.

**Cardinal is my attempt to turn that chaos into an actual work surface** ... and to be honest about who's in charge while doing it.

Did Claude write a huge amount of Cardinal? Yes. Genuinely. Big chunks of it. Fable is amazing.

Did it "write itself" in the stupid sci-fi sense? No. It didn't wake up, form opinions, and decide to start a company. *I* had the idea. *I* made the calls. *I* argued with the shape of the thing, killed the bad ideas, redirected it when it wandered into the weeds, and decided what actually mattered. Claude did an enormous amount of the typing while I was off making lunch, but I did all of the deciding.

That division of labor isn't a compromise. That division of labor is the *whole design.*

## What Cardinal Actually Is

Here's the idea in one sentence: **it's a Kanban board where dragging a card to "In Progress" hires an AI to actually do the task.**

Not summarize the task. Not chat about the task. *Do* it ... on its own branch, asking you questions when it's stuck, handing you a pull request at the end.

But the part that makes my programmer brain light up isn't the agent. It's what the *columns* mean.

On a normal Kanban board, columns are labels. Tasks. In Progress. Review. Done. They're sticky notes describing where a thing happens to be sitting. They're passive. They don't *do* anything.

**In Cardinal, columns aren't labels. Columns are policies.**

That's the big idea. That's the whole thing. Let me make it concrete, because "columns are policies" sounds like a LinkedIn slide until you see it move.

A card sitting in **Tasks** is just an idea in a parking lot. Nothing is happening. It's a note to yourself.

Drag the task into **Planning**, and the card changes character. Now an assistant reads your card *and your actual code* and starts asking the questions that turn a vague wish into a real feature spec. "Fix the login thing" becomes "when a user gets redirected after login, send them back to where they were trying to go ... unless that URL is unsafe, in which case fall back to the dashboard." That precision matters, because AI is dramatically better when the target is clear, and most of the value is in forcing the target to *get* clear before a single line is written. Suddenly feature specs are hard coded into the process.

Drag the task into **In Progress**, and the card changes character *again.* It's not a conversation anymore. It becomes an active worker. The card gets its own agent, its own run, its own branch, its own live timeline. The agent studies the repo, proposes a plan, and waits. You approve the plan with one click ... or you don't. Then it works, and you watch it work, and it stops and asks you when it hits a real decision instead of guessing and hoping.

Drag the task into **Review**, and now it's on you. You read the final report and the pull request. Something wrong? Say so, in plain English, right there in the card's conversation, and it goes back and revises. Looks good? Move it forward.

**QA** pushes the pull request out for real review on GitHub. **Done** merges it ... and if the project has CI and it's red or still running, Cardinal flat-out refuses to merge and tells you why, right on the card. No silent "eh, probably fine."

Every one of those columns has a little gear, and that's where "columns are policies" stops being a slogan and starts being literal. In the gear you set the rules for that column: which AI model works there, how many cards are allowed to run at once, how much it's allowed to spend, and what should happen when a card arrives ... written in plain English, and Cardinal figures out the rest. You can even turn *off* shell access for a worker column, so the agent can read and edit files but can't run a single command, and Cardinal commits the work on its behalf.

So the board isn't a picture of your process. **The board *is* the process, with rules and limits baked into the geography.** The card doesn't just move through stages. Each stage is allowed to do different things, spend different amounts, and take different risks. Moving the card is you changing what the machine is *permitted* to do next.

That's not "AI wrote some code." That's a card that carries the entire story ... the original idea, the planning conversation, the agent's plan, the work it attempted, the places it got stuck, the questions it asked, the commands it ran, the changes it made, the review notes, the revision, the pull request, the merge. The whole arc, in one place, auditable.

There's also a **🔍 Deep dive** button that sends a read-only agent ... it can look, never touch ... through your repo once and saves what it learns as a *repo brief*: what the project is, where things live, how to build and test it, the traps to avoid. Every worker agent gets that brief handed to it with its assignment, so agents stop re-learning your codebase from scratch on every single card. And the button quietly drifts from grey toward red as new commits land that the brief hasn't seen, so you know when its knowledge is going stale. One AI call, and every agent after it is smarter.

The unit of work stopped being "a chat." The unit of work is a card. And that changes everything about how it feels.

## The Real Question Was Never Replacement

Here's why this matters, and why it's the exact opposite of the thing people are afraid of.

Cardinal is not built to remove the human. It's built to move the human to the *right layer.*

I don't want to spend half my life hand-typing boilerplate to prove I understand a system I already understand. I don't need to personally hold the nail for every single stud in the wall. That was never the part of the job that mattered.

What I need is **control.** Visibility. The ability to say "no, that's wrong." The ability to say "good direction, change this one thing." The ability to say "stop." The ability to see exactly what happened, why it happened, what changed, and whether it's safe to ship.

*That* is the real work. That was always the real work. The typing was just the tax you paid to get to it.

And notice what Cardinal refuses to automate. The human moves the card. The human approves the plan. The human reviews the work. The human decides when it's done. The agents can only ever push to their own card branches ... the merge is *always* your drag. There is no version of this where the machine quietly decides it's finished and advances everything through the board like an intern who found the deploy button.

That's not me being timid about AI. That's me respecting consequences. Same as the nail gun. You point it. You keep your hands clear. You inspect the work. You do not hand it the keys and leave the room.

Because the future here isn't "one developer, one chat window, one anxious question at a time." The future is a small workshop. A planning assistant that sharpens the task. Worker agents taking bounded, well-scoped assignments. Columns that define what each stage is even *allowed* to do. Cards that become branches and pull requests. Review loops. Spend limits. Audit trails. And a board whose entire job is to answer the single most important question in any system with more than one worker in it: **"Who needs me right now?"**

## Every Good Tool Was "Cheating" First

SO.. Yeah, this is going to scare some people. I understand why. If your entire identity is wrapped around personally typing every character, this feels like a cheat code, like you skipped the part that made it honest.

But we've had this exact argument before. Every single time.

High-level languages were cheating. Frameworks were cheating. Open-source libraries were cheating. Autocomplete was cheating. Google was cheating. Copying the error message into a search box was *definitely* cheating.

And every one of them became normal, because the point was never to suffer beautifully. **The point was always to build the thing.** Craftsmanship was never located in the self-inflicted pain. It was located in the judgment about what to build and the taste to know when it was right.

The nail gun didn't kill carpentry. It just meant the carpenter who learned to use it framed faster than the one who refused on principle.

That's where I land on all of it. I am not interested in being replaced by AI. I'm interested in being *amplified* by it. Those are wildly different things, and mixing them up is the single most expensive mistake in this entire conversation.

Cardinal is me leaning all the way into that difference. If this is the direction the world is going, I'm not going to stand on the beach shaking my fist at the tide. I'm going to build a boat.

**Or, more accurately, a very opinionated, local, developer-controlled, Kanban-shaped nail gun.** One that lets me take an idea, talk it through, hand it to an agent, watch the work happen live, review the output, send it back when it's wrong, and merge it when *I* decide it's ready.

And yes ... sometimes the tool jams. Sometimes it fires at the wrong angle and makes a mess. Sometimes I put it down, pick up the hammer, and do the delicate part by hand. Good. That's how tools work. The existence of a nail gun has never once meant carpentry is dead.

So you can fear AI. You can mock it, complain about it, pretend it's all hype and wait for it to go away. It's not going to.

Or you can put the robots on the board, hand them a card, cap their permissions, review their pull request, and ship the thing anyway ... with your name on the merge, because you're the one who decided it was good.

Because if you can't beat the robots, the answer was never surrender.

**The answer is to build a better nail gun, and never once mistake it for the carpenter.**
