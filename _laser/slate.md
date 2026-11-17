---
title: "Slate"
material: slate
surface: "#6f7475"
description: "Fiber laser test grids on slate: power, speed, frequency and pulse width, and the color each setting makes, from faint grey to gold and bronze."
image: /assets/images/laser/slate-power-speed.jpg
image_alt: "A slate tile engraved with a 10 by 10 laser test grid, grey at the fast, low-power corner and glossy gold at the slow, high-power corner."
card_image: /assets/images/laser/slate-power-speed.webp
summary: >-
  Low energy turns slate a soft grey and nearly white. More takes it through
  beige and tan to gold, which an 80 ns pulse reaches without melting. Push
  past a slight satin sheen and it melts: the surface rises, then bubbles
  into glossy bronze, and both damage the slate.
# The color families used in this material's tab (the "color" column), light
# to dark. hex is a typical swatch from the sampled cells.
palette:
  - { name: "Faint grey", hex: "#8c908d", hint: "Barely there." }
  - { name: "Light grey", hex: "#a3a4a3", hint: "A soft, light grey." }
  - { name: "Pale grey", hex: "#bab9b4", hint: "Cool, nearly white." }
  - { name: "White", hex: "#d9d4ce", hint: "The brightest mark: a fine line interval at low power." }
  - { name: "Warm grey", hex: "#b1af9e", hint: "Light grey with a hint of beige." }
  - { name: "Off-white", hex: "#c3bfaf", hint: "The closest to white." }
  - { name: "Cream", hex: "#ccc5ad", hint: "Soft, warm white." }
  - { name: "Beige", hex: "#afa58c", hint: "Light beige." }
  - { name: "Sand", hex: "#c4b796", hint: "Pale golden beige." }
  - { name: "Tan", hex: "#b0a07d", hint: "Light brown." }
  - { name: "Gold", hex: "#a2906c", hint: "Golden brown. The 80 ns grid gets it without melting." }
  - { name: "Bronze", hex: "#8d7d59", hint: "Deep golden brown. Only the 80 ns grid gets it without melting, right at the limit." }
  - { name: "Dark bronze", hex: "#786447", hint: "The darkest. Only from settings that melt and damage the slate." }
  - { name: "No mark", hex: "", hint: "Nothing visible." }
# The designer offers at most seven colors: these groups, light to dark,
# each combining palette colors that look alike. Dark bronze isn't here
# because only settings that melt slate make it.
groups:
  - { name: "White", hint: "The brightest marks.", colors: ["White", "Off-white"] }
  - { name: "Pale grey", hint: "Cool, nearly white.", colors: ["Pale grey"] }
  - { name: "Light grey", hint: "Soft grey, down to barely there.", colors: ["Light grey", "Faint grey"] }
  - { name: "Cream", hint: "Soft, warm white.", colors: ["Cream", "Sand"] }
  - { name: "Beige", hint: "Greyish to light beige.", colors: ["Warm grey", "Beige"] }
  - { name: "Tan", hint: "Light brown.", colors: ["Tan"] }
  - { name: "Gold", hint: "Golden to deep golden brown.", colors: ["Gold", "Bronze"] }
# Validated colors: settings proven on this machine, in chart order (lightest
# row first, each row neutral to warm), as power|speed|frequency|q_pulse|
# interval|passes. They're the designer's main palette and get a ✓ here.
# Filled in once a standard-pattern run confirms them.
validated: []
# The designer's standard test pattern, v2 (2026-11-17), row by row as
# power|speed|frequency|q_pulse|interval|passes. 25 colors at least ΔE 4
# apart: run 1's distinct ones plus the tested settings that fill its gaps.
# Laid out as a chart: lightest row first, each row neutral to warm.
pattern:
  cols: 5
  cells:
    - "5|400|70|350|0.02|1"   # #c6c6c3 measured
    - "5|400|70|350|0.01|1"   # #dddad2 predicted
    - "40|40|50|50|0.1|1"   # #d3ceba predicted
    - "40|40|50|88.89|0.1|1"   # #ded7bb predicted
    - "40|40|30|166.67|0.1|1"   # #d4cbad predicted
    - "20|160|100|80|0.1|1"   # #b9bdc1 predicted
    - "12|400|70|350|0.05|1"   # #c6c3b9 measured
    - "26.7|80|100|80|0.1|1"   # #bfb8a9 predicted
    - "50|40|20|200|0.1|1"   # #c6bda3 measured
    - "40|40|70|88.89|0.1|1"   # #cfc19b predicted
    - "10|120|100|80|0.1|1"   # #a9adb1 predicted
    - "8|400|70|350|0.1|1"   # #b9b7b1 measured
    - "90|76|20|200|0.1|1"   # #b5ae99 measured
    - "30|53|100|80|0.1|1"   # #b4ab8d measured
    - "40|40|90|88.89|0.1|1"   # #bba87e predicted
    - "50|76|20|200|0.1|1"   # #929690 predicted
    - "80|200|20|200|0.1|1"   # #a4a39b measured
    - "100|93|20|200|0.1|1"   # #a19a88 measured
    - "50|58|20|200|0.1|1"   # #aba38b predicted
    - "40|40|100|88.89|0.1|1"   # #a99d7e measured
    - "4|400|70|350|0.1|1"   # #8b8c8b measured
    - "10|76|20|200|0.1|1"   # #7d8588 predicted
    - "80|129|20|200|0.1|1"   # #928e85 measured
    - "100|129|20|200|0.1|1"   # #7e7b71 measured
    - "100|58|20|200|0.1|1"   # #96896f predicted
tests:
  - id: power-speed-1
    slate: "#7f8688"   # bare slate in this photo
    title: "Power × Speed at 200 ns"
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
      - "**Satin is the limit.** At 40 mm/s, 60% (and 90–100% at 58 mm/s) gives a slight satin gloss, which is as far as to push slate. At 70% the melting starts to raise the surface, the damage point, and from 80% up it bubbles."
  - id: freq-qpulse-1
    slate: "#6b7070"   # bare slate in this photo
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
      - "In the 127.78 and 166.67 ns rows, 50 kHz is the damage point: melting raises the surface. From 60 kHz up it bubbles into a glossy finish. At 205.56 ns the damage starts at 40 kHz. The satin cells just before them (40 kHz, and 30 kHz at 205.56 ns) are the limit."
      - "This source fires only 16 fixed pulse widths (listed under [the laser](/laser/#the-laser)), so in-between values like 88.89 ns probably snap to one of them. The 127.78 and 166.67 ns rows came out nearly identical, which fits both landing on 150 ns."
      - "At 10 kHz every pulse width barely marked, and 50 ns left no visible mark."
  - id: power-speed-2
    slate: "#6b6a6c"   # bare slate in this photo
    title: "Power × Speed at 80 ns"
    status: complete
    x: { key: power, label: "Power", unit: "%", values: [10, 13.3, 16.7, 20, 23.3, 26.7, 30, 33.3, 36.7, 40] }
    y: { key: speed, label: "Speed", unit: "mm/s", values: [160, 147, 133, 120, 107, 93, 80, 67, 53, 40] }
    fixed:
      - { label: "Frequency", value: "100 kHz" }
      - { label: "Q-pulse", value: "80 ns" }
      - { label: "Interval", value: "0.1 mm" }
      - { label: "Passes", value: "1" }
    photo: /assets/images/laser/slate-power-speed-80ns.webp
    photo_alt: "The slate tile with the 80 ns power × speed grid: power 10 to 40 percent across, speed 40 to 160 mm/s down. It runs from light grey at the fast, low-power corner through beige to gold at the slow, high-power corner, with a few dark specks."
    notes:
      - "**No damage.** Planned so every cell got less energy than 40% at 40 mm/s, which came out a little burned and slightly melted: the limit for this grid."
      - "The best safe range so far: light grey through beige and tan to gold, all matte."
      - "40% at 40 mm/s also ran in the frequency × Q-pulse grid (88.89 ns, 100 kHz), where it came out a lighter, undamaged gold. So 88.89 ns may not have run as 80 ns; a different tile and the heat that grid built up could also explain it."
      - "LightBurn rounds the labels: power steps are 3.33% and speed steps 13.3 mm/s."
      - "The photo's light falls off from top to bottom, so these colors were evened out against the 10% column before naming them."
  - id: interval-power-1
    slate: "#797675"   # bare slate in this photo
    title: "Interval × Power at 350 ns"
    status: complete
    x: { key: power, label: "Power", unit: "%", values: [3, 4, 5, 6, 7, 8, 9, 10, 11, 12] }
    y: { key: interval, label: "Interval", unit: "mm", values: ["0.1", "0.09", "0.08", "0.07", "0.06", "0.05", "0.04", "0.03", "0.02", "0.01"] }
    fixed:
      - { label: "Speed", value: "400 mm/s" }
      - { label: "Frequency", value: "70 kHz" }
      - { label: "Q-pulse", value: "350 ns" }
      - { label: "Passes", value: "1" }
    photo: /assets/images/laser/slate-interval-power.webp
    photo_alt: "The slate tile with the interval × power grid: power 3 to 12 percent across, line interval 0.1 to 0.01 mm down. Everything is a soft grey, getting whiter toward the finest intervals at the bottom; the 3 percent column barely shows."
    notes:
      - "**No damage, and the whitest marks so far**, at the finest intervals (0.01–0.02 mm) and low power. Vendor \"white\" recipes for slate use 0.02–0.05 mm; this grid tested that, starting from Thunder Laser's settings."
      - "Everything here stays a neutral grey-white, with none of the warmth (cream, tan, gold) the other grids reach. The hottest cell, 12% at 0.01 mm, is about 3 J/mm², well under where slate starts to melt."
      - "At 3% the slate barely marks. At the finest intervals, 8–10% reads a touch greyer than 4–6%; that may be the light in the photo."
  - id: standard-pattern-1
    title: "Standard pattern, run 1"
    kind: pattern
    status: complete
    slate: "#888888"   # bare slate in this photo
    x: { key: col, label: "Column", unit: "", values: [1, 2, 3, 4, 5] }
    y: { key: row, label: "Row", unit: "", values: [1, 2, 3, 4, 5] }
    fixed:
      - { label: "Squares", value: "8 mm" }
      - { label: "Labels", value: "1.2 mm" }
      - { label: "From", value: "the designer's LightBurn file" }
    photo: /assets/images/laser/slate-standard-pattern-1.webp
    photo_alt: "A slate tile with the standard 5 by 5 test pattern: rows of white and pale grey squares at the top, greys, then creams and beiges, and light golds along the bottom, each with two lines of small settings text underneath."
    notes:
      - "The designer's standard pattern, run from its LightBurn file. Each square repeats a setting from an earlier grid, and all 25 sit in one evenly lit photo, so **the designer now uses these colors for these settings**."
      - "Several came out quite differently from their first grids. The golds along the bottom are lighter than predicted, the 10 kHz grey (row 2) is much lighter, and 100% at 129 mm/s (row 4) is darker. Uneven light in the earlier photos skewed them."
      - "**Seven came out raised** (marked ▲): 40% at 40 mm/s with 50 ns at 90 kHz, and the five golds along the bottom plus the 30% at 53 mm/s gold above them, all 80–89 ns at 80–100 kHz. The rest are flat."
      - "The 1.2 mm labels came out too thin and faint to read. The designer now defaults to 1.6 mm bold, on three lines."
---
