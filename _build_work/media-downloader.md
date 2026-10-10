---
title: "Media Downloader"
kind: "Web application · Utility"
order: 6
year: "2026"
summary: "A private, friendly web app for saving video or audio from YouTube and 1,000+ other sites. It shows exactly what you'll get before downloading, and transcribes it locally."
services: [web-apps, ai]
stack: [Python, FastAPI, yt-dlp, Whisper]
icon: download
hue: 28
stat: "1,000+ sites"
repo: https://github.com/palamedes/media-downloader
facts:
  - { k: "Preview", v: "e.g. \"1080p · H.264 + AAC · MP4 · ≈ 21 MB\" before downloading" }
  - { k: "Transcripts", v: "Text, timestamps or subtitles, with speakers named" }
  - { k: "Privacy", v: "Runs entirely on your own machine" }
---

## The problem

The best download tool there is, yt-dlp, is a command-line program with hundreds of options. Most people need three of them and a clear answer to "what am I actually going to get?"

## What I built

A small local web app: paste a link anywhere on the page, pick the format and quality, and see the exact streams and file size before you commit. Downloads run in the background with progress and cancel. It can also transcribe anything it downloads, or any audio file you drop on it, and label who's speaking.

## Under the hood

- It previews choices with yt-dlp's own format selector, so what you see is what you get
- Background jobs with progress, cancel and cleanup
- Local speech recognition with faster-whisper, on the graphics card when there is one
- Speaker labeling with on-device models
- One launcher command, and a test suite

## What it shows

Taking a powerful but intimidating tool and wrapping it in an interface anyone can use. A lot of business software is exactly this: the capability exists, people just can't get at it.
