---
title: "Cardinal"
kind: "AI product · Developer tool"
order: 1
year: "2026"
summary: "A Kanban board where dragging a card to \"In Progress\" hands the task to a Claude agent, which works on its own branch and opens a pull request for review."
services: [ai, web-apps]
stack: [Ruby on Rails 8, JavaScript, Claude, GitHub]
icon: board
hue: 352
stat: "Card → PR"
repo: https://github.com/palamedes/cardinal
facts:
  - { k: "Packaged as", v: "A Rails engine, installed with gem install cardinal-ai" }
  - { k: "Agents", v: "Claude, via each board's own linked account" }
  - { k: "Safety", v: "Agents push only to their card's branch; you merge" }
---

## The problem

AI coding agents are powerful and unsupervised. Hand one a vague task in a terminal and you get a wall of changes with no plan, no review step and no record of who decided what. Teams already manage work on boards; the agent should live there too.

## What I built

Cardinal is a Kanban board where **the columns are policies**. Drag a card into Planning and an agent proposes a plan for you to approve. Drag it to In Progress and the agent does the work on its own branch, asking questions when it gets stuck. Review and QA columns hold it for a human, and dragging to Done merges the pull request, unless CI is red or still running, in which case Cardinal refuses.

Each column's settings choose the AI model, how many agents can run at once, spending limits and arrival rules written in plain English.

## Under the hood

- A Rails 8 engine distributed as a Ruby gem, running locally per project
- A read-only "deep dive" agent writes a brief of the codebase that every worker agent gets, so they don't re-explore it from scratch. The button drifts toward red as new commits make the brief stale.
- Agents can only push to their card's branch; merging is always a human drag
- Per-project state lives in a git-invisible folder, and each board can use a different Claude account
- An optional mode turns off shell access entirely: the agent edits files, Cardinal makes the commits

## What it shows

How to put a powerful AI system inside guardrails people already understand: a board, a branch, a review, a merge button. That's the same thinking I bring to adding AI to your product: useful autonomy, human sign-off, nothing irreversible without a person in the loop.
