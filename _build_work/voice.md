---
title: "Voice"
kind: "AI · Local machine learning"
order: 2
year: "2026"
summary: "Narrates blog posts in my own cloned voice, entirely on my own computer. Nothing is uploaded anywhere. It powers the audio versions of posts on this site."
services: [ai]
stack: [Python, PyTorch, Whisper, ffmpeg]
icon: mic
hue: 268
stat: "100% local"
repo: https://github.com/palamedes/voice
facts:
  - { k: "Input", v: "A 10–15 second reference clip" }
  - { k: "Output", v: "Loudness-normalized audio, ~1 MB per 3.5 minutes" }
  - { k: "Hardware", v: "A 16 GB consumer graphics card" }
---

## The problem

I wanted every post on this site available as audio, read in my own voice, without paying a service per minute or uploading recordings of my voice to someone else's servers.

## What I built

A command-line toolkit that turns text into speech in a cloned voice, entirely offline. It supports two voice-cloning engines, and a simple markup for pacing: breaths, timed pauses, paragraph gaps, and tags that switch speakers mid-text for conversations. The default engine can even perform sounds like a sigh or a laugh.

A warm background server keeps the model loaded, so new lines start speaking in a second or two and stream sentence by sentence.

## Under the hood

- Reference clips are cleaned automatically (trimmed, denoised, normalized) and transcribed with Whisper
- Output is normalized to broadcast loudness and can be compressed to Opus for the web
- The repository records an honest evaluation of five other models that were tried and dropped, and why
- Built-in commands for driving it from Claude Code

## What it shows

AI doesn't have to mean sending your data to a cloud API. When privacy, cost or ownership matter, I can build on open models that run on hardware you control, and I'll do the unglamorous comparison work to pick the right one.
