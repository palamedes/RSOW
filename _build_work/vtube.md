---
title: "vtube"
kind: "Creative tool · Real-time video"
order: 8
year: "2026"
summary: "Turns your face, from an iPhone, a webcam or just your voice, into a live cartoon character on camera, with a browser studio that exports both widescreen and vertical video."
services: [web-apps]
stack: [TypeScript, React, Python, MediaPipe]
icon: film
hue: 45
stat: "16:9 + 9:16"
repo: https://github.com/palamedes/vtube
facts:
  - { k: "Inputs", v: "iPhone face tracking, a webcam, or a microphone" }
  - { k: "Export", v: "H.264 MP4 at 30 or 60 fps, both formats at once" }
  - { k: "By design", v: "No AI voice, no AI-generated faces" }
---

## The problem

I wanted to record readings and short videos as a cartoon character, in my real voice, and post them as both normal widescreen video and vertical shorts, without an AI voice or an AI-generated face.

## What I built

A tracking hub and a browser studio. An iPhone, a webcam or just a microphone drives the character live (the microphone mode reads loudness and vowel shapes to move the mouth). The studio shows widescreen and vertical previews side by side, lets you tune every one of the face's 52 tracking channels, records takes, and exports finished video for both formats. It also plugs straight into OBS for live streaming.

## Under the hood

- Video frames render in the browser with WebCodecs, through exactly the same pipeline as the preview
- The original voice is muxed in as AAC; nothing is synthesized
- A compare mode puts two face trackers side by side to choose the better one

## What it shows

A real-time interface with a lot of moving parts, made approachable. That's a polished web front end, live data, and media processing working together.
