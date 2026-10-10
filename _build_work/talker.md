---
title: "talker"
kind: "AI · Video generation"
order: 7
year: "2026"
summary: "Turns a photo and an audio clip into a lip-synced talking-head video, on a home gaming graphics card running a model normally meant for data centers."
services: [ai]
stack: [Python, PyTorch, CUDA]
icon: face
hue: 300
stat: "16 GB GPU"
repo: https://github.com/palamedes/talker
facts:
  - { k: "Model", v: "LongCat-Video-Avatar 1.5, in 8-bit" }
  - { k: "Trick", v: "Streams half the model from system memory each step" }
  - { k: "Sync", v: "Video length matches the audio to the frame" }
---

## The problem

The best open talking-head model wants data-center hardware. I wanted to run it on the graphics card I already own.

## What I built

The plumbing that makes it fit: an 8-bit version of the model, and an automatic low-memory mode that streams about half of it from system RAM on each step. Output matches the audio to the frame, as video or GIF. A small companion script scores several takes of synthetic speech for calm, natural delivery before spending minutes rendering video.

## Under the hood

- Measured, not guessed: about five to six minutes per three-second segment on a 16 GB card
- Compared four competing models head to head before choosing one, and documented why
- One lesson recorded for the next person: the photo decides the scene and posture far more than any prompt

## What it shows

Making cutting-edge AI practical on the hardware and budget you actually have, and being honest about the tradeoffs.
