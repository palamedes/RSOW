---
title: "Sentry"
kind: "Web application · Self-hosted system"
order: 3
year: "2026"
summary: "A self-hosted home camera system that replaces cloud subscriptions. It finds the cameras, streams them live, and keeps a scrubbable recording history. No cloud, no account."
services: [web-apps]
stack: [Python, WebRTC, WebGL, SQLite, ffmpeg]
icon: camera
hue: 160
stat: "No cloud"
repo: https://github.com/palamedes/home-camera-system
facts:
  - { k: "Live view", v: "Sub-second latency over WebRTC" }
  - { k: "Recording", v: "60-second segments, never re-encoded" }
  - { k: "Access", v: "Default-deny login with admin and viewer roles" }
---

## The problem

Camera makers want a monthly subscription to show you your own footage, and they keep it on their servers. I wanted live view, history and retention on my own network, with nothing leaving the house.

## What I built

A web application that runs on a home server. It sweeps the network for cameras, identifies the brand, and connects. You get a live wall of cameras, a timeline you can scrub and zoom, clip export, and an instant-replay buffer in the browser. For 360° fisheye cameras, it can un-warp the image into saved "virtual cameras", several views out of one lens.

## Under the hood

- Every camera request is proxied behind authentication, with an allowlist of what can be reached
- Recordings are written straight from the camera stream in one-minute files and indexed in SQLite; playback stitches segments together instead of seeking through huge files
- Timestamps come from the files themselves, which sidesteps daylight-saving ambiguity
- Retention keeps a size budget, a maximum age and a free-space floor
- Fisheye dewarping runs on the graphics card in the browser with WebGL

## What it shows

Real-time video, security, storage management and a polished interface, in one system that has to run unattended for months. It's the same discipline any production web application needs.
