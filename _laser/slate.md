---
title: "Slate"
material: slate
description: "Fiber laser test grids on slate: power, speed, frequency and pulse width, and the color each setting makes, from faint grey to gold and bronze."
image: /assets/images/laser/slate-power-speed.jpg
image_alt: "A slate tile engraved with a 10 by 10 laser test grid, grey at the fast, low-power corner and glossy gold at the slow, high-power corner."
card_image: /assets/images/laser/slate-power-speed.webp
summary: >-
  Low energy turns slate a soft grey and nearly white. Add more and it goes
  cream, tan and gold, and at the top end it melts into a glossy bronze.
# The color families used in this material's tab (the "color" column), light
# to dark. hex is a typical swatch from the sampled cells.
palette:
  - { name: "Faint grey", hex: "#8c908d", hint: "Barely there." }
  - { name: "Light grey", hex: "#9b9d97", hint: "A soft, light grey." }
  - { name: "Pale grey", hex: "#afb1ac", hint: "Cool, nearly white." }
  - { name: "Warm grey", hex: "#aeaf9e", hint: "Light grey with a hint of beige." }
  - { name: "Off-white", hex: "#c3bfaf", hint: "The closest to white." }
  - { name: "Cream", hex: "#ccc5ad", hint: "Soft, warm white." }
  - { name: "Beige", hex: "#bbb091", hint: "Light beige." }
  - { name: "Sand", hex: "#c4b796", hint: "Pale golden beige." }
  - { name: "Tan", hex: "#b2a27e", hint: "Light brown." }
  - { name: "Gold", hex: "#a5926a", hint: "Golden brown, often with a sheen." }
  - { name: "Bronze", hex: "#8d7d59", hint: "Glossy, metallic brown." }
  - { name: "Dark bronze", hex: "#786447", hint: "The darkest: glossy and melted." }
  - { name: "No mark", hex: "", hint: "Nothing visible." }
tests:
  - id: power-speed-1
    title: "Power × Speed"
    status: complete
    x: { key: power, label: "Power", unit: "%", values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }
    y: { key: speed, label: "Speed", unit: "mm/s", values: [200, 182, 164, 147, 129, 111, 93, 76, 58, 40] }
    fixed:
      - { label: "Frequency", value: "20 kHz" }
      - { label: "Q-pulse", value: "200 ns" }
      - { label: "Interval", value: "0.1 mm" }
      - { label: "Passes", value: "1" }
    photo: /assets/images/laser/slate-power-speed.webp
    photo_alt: "The slate tile with the power × speed grid: power 10 to 100 percent across, speed 40 to 200 mm/s down. The fast rows are faint grey; the slow, high-power corner turns cream, tan and glossy gold."
    notes:
      - "LightBurn rounds the speed labels. The real steps are 17.8 mm/s apart (57.78, 75.56, 93.33 and so on)."
      - "JPT rates this source for full output at 200 ns only above 75 kHz; below that, power drops. At 20 kHz, expect roughly a quarter of rated power at most (20 ÷ 75)."
  - id: freq-qpulse-1
    title: "Frequency × Q-pulse"
    status: stopped
    x: { key: frequency, label: "Frequency", unit: "kHz", values: [10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }
    y: { key: q_pulse, label: "Q-pulse", unit: "ns", values: ["400", "361.11", "322.22", "283.33", "244.44", "205.56", "166.67", "127.78", "88.89", "50"] }
    fixed:
      - { label: "Speed", value: "40 mm/s" }
      - { label: "Power", value: "40%" }
      - { label: "Interval", value: "0.1 mm" }
      - { label: "Passes", value: "1" }
    photo: /assets/images/laser/slate-frequency-q-pulse.webp
    photo_alt: "The slate tile with the frequency × Q-pulse grid: frequency 10 to 100 kHz across, pulse width 50 to 400 ns up. The bottom four rows and part of the fifth are marked, from light grey to glossy bronze; the rest never ran."
    notes:
      - "**Stopped partway.** The slate started cracking and got very hot, so I stopped it. LightBurn ran the grid from the bottom row up, so everything from 205.56 ns at 50 kHz onward never ran."
      - "From 60 kHz up, the 127.78 and 166.67 ns rows melted into a glossy, bubbled finish."
      - "This source fires only 16 fixed pulse widths (listed under [the laser](/laser/#the-laser)), so in-between values like 88.89 ns probably snap to one of them. The 127.78 and 166.67 ns rows came out nearly identical, which fits both landing on 150 ns."
      - "At 10 kHz every pulse width barely marked, and 50 ns left no visible mark."
---
