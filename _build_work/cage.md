---
title: "cage"
kind: "AI safety · Developer tool"
order: 5
year: "2026"
summary: "Lets an AI coding agent run with full autonomy inside a throwaway container, working on a copy of the project, so it can never touch the real machine."
services: [ai]
stack: [Bash, Docker, Claude Code, git]
icon: shield
hue: 200
stat: "Zero host risk"
repo: https://github.com/palamedes/cage
facts:
  - { k: "Isolation", v: "Your disk is never mounted; the agent gets a copy" }
  - { k: "Exit", v: "Work leaves only by git push or a rescue bundle" }
  - { k: "Setup", v: "One command in any repository" }
---

## The problem

AI coding agents are most useful when you stop approving every single command, and most dangerous at exactly that moment. I wanted the speed of full autonomy without letting a model loose on my actual computer.

## What I built

One command that drops any project into a disposable Docker container and runs the agent there with permissions fully open. The agent works on a copy of the project, including uncommitted changes and history. When the session ends, unpushed work is offered back as a push, a shell, or a rescue patch, and then the container is destroyed.

## Under the hood

- Detects the project's stack (Ruby, Node, Go, Rust, Python…) from its files
- Builds a cached image per stack, with no project code baked in, so similar projects share one
- Runs the agent as a non-root user; login is kept in a shared volume so you don't sign in every time
- Health checks, cleanup and SSH forwarding built in

## What it shows

Security thinking applied to AI: assume the agent will eventually do something dumb, and design so that it can't matter. I bring that mindset to any AI feature that touches real systems or real data.
