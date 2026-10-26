---
title: "Apparently, Every AI Prompt Kills a Fish"
layout: post
date: 2026-11-22
image: /assets/images/2026/apparently-every-ai-prompt-kills-a-fish.jpg
categories:
- Technology
- Science
tags:
- Rant
- AI
- Critical Thinking
description: "AI isn't drinking the planet dry. Cooling water evaporates and comes back as rain. Local supplies need managing, but that's engineering, not an apocalypse."
excerpt: "Apparently, artificial intelligence is now drinking the planet dry. Every time you ask ChatGPT a question, a poor thirsty child somewhere loses access to clean drinking water. Every AI-generated image kills a fish, and every email somebody has AI write sends another lake evaporating into oblivion. That's the impression you'd get, anyway, from some of the outrage circulating online."
words: [aquifer, consumptive-use]
ai_notes:
  - quote: "Every time you ask ChatGPT a question"
    rating: "Context"
    note: >-
      Google reported in August 2025 that a median Gemini text prompt uses
      about 0.26 milliliters of water, roughly five drops. OpenAI's Sam Altman
      put an average ChatGPT query at about 0.000085 gallons, "roughly one
      fifteenth of a teaspoon." Both are the companies' own figures.
    sources:
      - title: "MIT Technology Review — In a first, Google has released data on how much energy an AI prompt uses (August 21, 2025)"
        url: "https://www.technologyreview.com/2025/08/21/1122288/google-gemini-ai-energy/"
      - title: "Sam Altman — The Gentle Singularity (June 2025)"
        url: "https://blog.samaltman.com/the-gentle-singularity"
  - quote: "Other data centers use evaporative cooling towers"
    rating: "Context"
    note: >-
      Evaporation sheds heat using less electricity than other methods, so
      it's a trade-off. Microsoft's zero-water design, announced in December
      2024, keeps coolant in a sealed loop and should avoid more than 125
      million liters a year per data center, at the cost of what Microsoft
      calls a nominal rise in energy use.
    sources:
      - title: "Microsoft — Sustainable by design: Next-generation datacenters consume zero water for cooling (December 9, 2024)"
        url: "https://www.microsoft.com/en-us/microsoft-cloud/blog/2024/12/09/sustainable-by-design-next-generation-datacenters-consume-zero-water-for-cooling/"
      - title: "GeekWire — Microsoft shares new data center design featuring a closed-loop water system for cooling (December 2024)"
        url: "https://www.geekwire.com/2024/microsoft-shares-new-data-center-design-featuring-a-closed-loop-water-system-for-cooling/"
  - quote: "estimated roughly 500 milliliters for 10 to 50 responses"
    rating: "Accurate"
    note: >-
      The paper, by researchers at UC Riverside and UT Arlington, modeled
      GPT-3 in Microsoft's U.S. data centers. Its figures count water used to
      generate the electricity as well as on-site cooling; for training GPT-3,
      that off-site water was 4.7 million of the 5.4 million liters.
    sources:
      - title: "Li, Yang, Islam & Ren — Making AI Less \"Thirsty\": Uncovering and Addressing the Secret Water Footprint of AI Models (arXiv)"
        url: "https://arxiv.org/abs/2304.03271"
  - quote: "Agricultural irrigation accounts for the overwhelming majority"
    rating: "Accurate"
    note: >-
      USDA's Economic Research Service puts agriculture at 80 to 90 percent of
      U.S. consumptive water use: water lost to evaporation, taken up by
      crops, or built into products. Its estimate rests on older federal
      water-use data.
    sources:
      - title: "USDA Economic Research Service — Irrigated agriculture and consumptive water use (Charts of Note)"
        url: "https://www.ers.usda.gov/data-products/charts-of-note/76667"
  - quote: "drop a massive facility in the middle of Arizona"
    rating: "Context"
    note: >-
      In August 2025 Tucson's city council voted unanimously to stop Project
      Blue, a proposed data center, after residents objected to its water and
      power use. The developer said it would have been "net water positive,"
      mainly by using reclaimed water.
    sources:
      - title: "AZ Luminaria — Tucson City Council rejects Project Blue amid intense community pressure (August 6, 2025)"
        url: "https://azluminaria.org/2025/08/06/tucson-city-council-rejects-project-blue-amid-intense-community-pressure/"
      - title: "Arizona's Family — Tucson rejects Amazon-linked data center amid water, energy concerns (August 2025)"
        url: "https://www.azfamily.com/2025/08/09/tucson-rejects-amazon-linked-data-center-amid-water-energy-concerns/"
  - quote: "Medical research could move faster than it ever has"
    rating: "Context"
    note: >-
      Half of the 2024 Nobel Prize in Chemistry went to Google DeepMind's Demis
      Hassabis and John Jumper for AlphaFold2, an AI model that solved a
      50-year-old problem: predicting a protein's structure. It has predicted
      the structures of virtually all 200 million proteins researchers have
      identified.
    sources:
      - title: "The Nobel Prize — Press release: The Nobel Prize in Chemistry 2024"
        url: "https://www.nobelprize.org/prizes/chemistry/2024/press-release/"
---

Apparently, artificial intelligence is now drinking the planet dry. Every time you ask ChatGPT a question, a poor thirsty child somewhere loses access to clean drinking water. Every AI-generated image kills a fish, and every email somebody has AI write sends another lake evaporating into oblivion. That's the impression you'd get, anyway, from some of the outrage circulating online.

I'm getting pretty damn tired of it, and I'll say up front that I'm a huge proponent of artificial intelligence. I think it's one of the most important technological developments of our lifetime, and it has the potential to fundamentally transform medicine, science, engineering, education, and just about everything else we do. We're watching the early stages of something extraordinary. Instead of having intelligent discussions about how to make the most of it, though, we're apparently supposed to feel guilty because the computers need cooling.

So let's talk about this water crisis, because a rather important detail is missing from a lot of the conversation: water doesn't magically disappear when you use it to cool something.

## Apparently, we've forgotten how water works

A lot of modern data centers use closed-loop cooling systems, where water or some other coolant circulates through the equipment, absorbs heat, gets cooled down, and goes around again. We've been cooling engines and industrial machinery this way for generations. Other data centers use evaporative cooling towers, in which some of the water evaporates and carries the heat away with it, and apparently this is where civilization ends.

You remember evaporation, right? That thing from elementary school where water turns to vapor, rises into the atmosphere, condenses, and eventually falls back to Earth as rain? It's called the water cycle, and the oceans have been running it for billions of years. But apparently when the sun evaporates water, that's nature, and when a computer does it, we're destroying the planet.

Now, before somebody starts furiously typing: yes, evaporated water doesn't necessarily come back down in the same place, and drawing too much from an aquifer that's already stressed can absolutely be a problem. That's a local water-management problem, though, not evidence that AI is destroying the world's water supply, and those are two very different arguments.

## The great water bottle scare

One popular claim says AI drinks a bottle of water every time you ask it a question. Except the [original research](https://doi.org/10.1145/3724499) estimated roughly 500 milliliters for 10 to 50 responses, depending on conditions, and that was a modeled estimate for an older AI system, not a universal measurement of every AI query. Newer cooling technologies, meanwhile, can cut water consumption dramatically. Microsoft has developed data-center designs meant to use essentially no ongoing water for cooling. But "water consumption varies depending on cooling technology, climate, and infrastructure" doesn't make a particularly exciting headline, does it?

It's much more entertaining to convince people their chatbot is stealing Dasani bottles from Ethiopian orphans.

One more little detail: agriculture, manufacturing, power generation, streaming services, and practically every other part of modern civilization need water too. Agricultural irrigation accounts for the overwhelming majority of consumptive water use in the United States, and nobody is suggesting we stop growing food because of it. We improve irrigation instead. I don't see why AI should be treated any differently.

## Maybe we should solve problems instead of manufacturing outrage

None of this means data centers should get unlimited access to public water supplies. If somebody wants to drop a massive facility in the middle of Arizona and drain an aquifer that's already struggling, then yes, let's have that conversation. Make them source their water responsibly and put real money into better cooling, and make sure the infrastructure can actually handle the demand. Fixing that sort of thing is ordinary engineering, which is how progress gets made. It gives nobody grounds to treat every AI query like some kind of environmental atrocity.

Think about what's actually on the table here. Medical research could move faster than it ever has. Engineering gets better, and education could be remade almost from scratch, while ordinary people are already doing things with this technology that nobody would have believed possible a few years ago. And I'm supposed to feel guilty because the computers get hot? Give me a fucking break.

AI does carry legitimate environmental costs. So does practically everything else humans have ever built, and those costs should get scrutiny, with the companies held accountable for how responsibly they manage them. My quarrel is with the people passing off plain hostility to the technology as environmental concern, since that has very little to do with environmental responsibility. Water evaporates, it comes back down, and local supplies still need responsible management. There's nothing contradictory about holding all of that in your head at once.

If your whole argument against one of the most promising technologies in human history is that the computers get hot and need cooling, I don't think artificial intelligence is your problem. I think it's how little intelligence went into the argument.
