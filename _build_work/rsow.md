---
title: "Random String of Words"
kind: "Website · Design & engineering"
order: 4
year: "2000 – now"
summary: "This site, rebuilt from a stock blog into a fast static site with reading tools I designed: sourced AI fact-check notes, glossary hover cards, narrated posts, a tag cloud, games and a live investment dashboard."
services: [web-design, web-apps, ai, rescue, small-business]
stack: [Jekyll, Ruby, JavaScript, Sass, GitHub Actions]
icon: book
hue: 215
shot: /assets/images/build/rsow-post.png
shot_alt: "A post on Random String of Words with AI Notes turned on: a highlighted claim, its sourced note marked Accurate, and a word underlined for its glossary card"
live: https://randomstringofwords.com/
facts:
  - { k: "Posts", v: "260+, back to 2000" }
  - { k: "Hosting", v: "Static, on GitHub Pages: fast and nearly free" }
  - { k: "Custom features", v: "Plugins, reading aids, games and dashboards" }
---

## The problem

Two decades of posts lived in an aging blog platform: slow, hard to change, and tied to someone else's hosting. I wanted something fast and permanent that I fully own, and room to build reading tools no off-the-shelf theme offers.

## What I built

A static site with a custom design, and a set of features built from scratch:

- **AI Notes**: a button on each post that turns on sourced, fact-checking annotations anchored to specific phrases, clearly labeled as AI-generated. See any [recent post](/archive/).
- **Word notes**: underlined words open a card with pronunciation, a plain definition, an origin and sometimes a small diagram. More than 100 curated entries.
- **Narration**: posts read aloud in my cloned voice (see [Voice](/build/work/voice/)), with a player that draws the audio's waveform into the seek bar and keeps playing as you move between pages.
- **Tags and topics**: a [tag cloud](/tags/), a [topic cloud](/topics/), and an [archive](/archive/) with multi-select filters.
- **Games, explainers and an investments dashboard** with charts and a forecast simulator.

## Under the hood

- Custom Jekyll plugins: build-time checks that catch a misspelled tag or a missing glossary entry before it ships
- Command-line tools that nominate unusual words for the glossary and verify every annotation lands on the page
- Automated deploys through GitHub Actions; image dimensions read straight from the files for social previews
- Accessible by default: keyboard-friendly menus, real alt text and captions

## What it shows

Design and engineering together, on a real site with real content, and the rescue-and-modernize work of moving twenty years of material onto a stack that's faster, cheaper and entirely owned.
