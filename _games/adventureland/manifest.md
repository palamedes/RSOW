---
layout: manifest
permalink: /games/adventureland/manifest.json
game_id: adventureland
title: Adventureland
author: Scott Adams (1978)
credits: |
  ADVENTURELAND by Scott Adams (1978)
  The first commercial text adventure ever published.

  Originally written for the TRS-80 and ported to virtually every
  home computer of the era. Released as freeware by Scott Adams.

  This faithful re-creation: Jason Ellis, RSOW.com (2026)

  A fully static implementation — no server, no database, no backend.
  Every room is a flat JSON file served straight from GitHub Pages.
  The JavaScript engine never reloads the page; it AJAX-fetches each
  room on demand and caches it in memory as you explore. Your save
  game lives in your browser's localStorage and never leaves your
  machine.

  Engine and HTML/JS implementation by Jason Ellis.
  All puzzles, locations, and original design © Scott Adams.
intro: |
  Welcome to ADVENTURE!!  Special thanks to Scott Adams.

  Somewhere nearby is Colossal Cave, where others have found
  fortunes in treasure and gold, though it is rumored that some
  who enter are never seen again. Magic is said to work in the
  Cave. I will be your eyes and hands. Direct me with commands
  of one or two words.

  (Type HELP for command list, or just start exploring.)
start_room: forest
treasure_room: stump_interior
treasure_count: 13
lamp_turns: 60
items:
  axe:        { name: "rusty axe",        portable: true,  starts_in: lake_shore }
  ox:         { name: "small statue of a blue ox", portable: true, starts_in: quicksand,  treasure: true,  value: 7 }
  flint:      { name: "flint & steel",    portable: true,  starts_in: ledge }
  fruit:      { name: "jeweled fruit",    portable: true,  starts_in: grove,      treasure: true,  value: 8 }
  keys:       { name: "ring of skeleton keys", portable: true, starts_in: cypress_top }
  lamp:       { name: "old-fashioned brass lamp", portable: true, starts_in: stump_interior }
  water:      { name: "bottle of water",  portable: true,  starts_in: stump_interior }
  rubies:     { name: "pot of rubies",    portable: true,  starts_in: root_chamber, treasure: true, value: 8 }
  ring:       { name: "diamond ring",     portable: true,  starts_in: nowhere,    treasure: true,  value: 8 }
  bracelet:   { name: "diamond bracelet", portable: true,  starts_in: nowhere,    treasure: true,  value: 7 }
  bladder:    { name: "empty wine bladder", portable: true, starts_in: anteroom }
  bricks:     { name: "fire bricks",      portable: true,  starts_in: royal_chamber }
  firestone:  { name: "glowing firestone",portable: true,  starts_in: nowhere,    treasure: true,  value: 8 }
  mirror:     { name: "magic mirror",     portable: true,  starts_in: ledge_throne, treasure: true, value: 7, fragile: true }
  crown:      { name: "golden crown",     portable: true,  starts_in: throne_room, treasure: true, value: 8 }
  rug:        { name: "persian rug",      portable: true,  starts_in: bottom_pit, treasure: true,  value: 8 }
  net:        { name: "magic golden net", portable: true,  starts_in: chasm_bottom, treasure: true, value: 7 }
  honey:      { name: "royal honey",      portable: true,  starts_in: octagon,    treasure: true,  value: 8 }
  bees:       { name: "swarm of angry bees", portable: true, starts_in: nowhere }
  fish:       { name: "golden fish",      portable: true,  starts_in: nowhere,    treasure: true,  value: 8 }
  eggs:       { name: "dragon's eggs",    portable: true,  starts_in: nowhere,    treasure: true,  value: 8 }
  mud:        { name: "smelly mud",       portable: true,  starts_in: swamp }
  gas:        { name: "swamp gas",        portable: true,  starts_in: swamp }
  dragon:     { name: "sleeping dragon",  portable: false, starts_in: meadow }
  chiggers:   { name: "biting chiggers",  portable: false, starts_in: swamp }
  bear:       { name: "very thin bear",   portable: false, starts_in: ledge_throne }
  advert:     { name: "weathered advertisement", portable: false, starts_in: hole_edge }
  writing:    { name: "writing in a spider's web", portable: false, starts_in: cypress_top }
  honeycomb:  { name: "vast honeycomb",   portable: false, starts_in: octagon }
verbs:
  - { word: "go",       aliases: ["walk","move"] }
  - { word: "look",     aliases: ["l"] }
  - { word: "take",     aliases: ["get","grab","pick"] }
  - { word: "drop",     aliases: ["put","leave"] }
  - { word: "inventory",aliases: ["i","inv"] }
  - { word: "score",    aliases: [] }
  - { word: "save",     aliases: [] }
  - { word: "load",     aliases: ["restore"] }
  - { word: "help",     aliases: ["?"] }
  - { word: "quit",     aliases: ["q"] }
  - { word: "restart",  aliases: [] }
  - { word: "chop",     aliases: ["cut"] }
  - { word: "rub",      aliases: [] }
  - { word: "say",      aliases: [] }
  - { word: "yell",     aliases: ["shout","scream"] }
  - { word: "light",    aliases: [] }
  - { word: "ignite",   aliases: [] }
  - { word: "unlight",  aliases: ["extinguish","douse"] }
  - { word: "pour",     aliases: ["empty"] }
  - { word: "fill",     aliases: [] }
  - { word: "climb",    aliases: [] }
  - { word: "swim",     aliases: [] }
  - { word: "open",     aliases: [] }
  - { word: "unlock",   aliases: [] }
  - { word: "read",     aliases: [] }
  - { word: "examine",  aliases: ["x"] }
  - { word: "jump",     aliases: ["leap"] }
  - { word: "build",    aliases: [] }
triggers:
  # ----- Reading clues -----
  - when: { verb: read, noun: advertisement, room: hole_edge }
    do:
      - { say: "The advertisement reads: 'PAUL BUNYAN cleared this forest single-handed! Look for his mark on the trusty woodsman's tools.'" }
      - { block: true }
  - when: { verb: read, noun: ad, room: hole_edge }
    do:
      - { say: "The advertisement reads: 'PAUL BUNYAN cleared this forest single-handed! Look for his mark on the trusty woodsman's tools.'" }
      - { block: true }
  - when: { verb: read, noun: writing, room: cypress_top }
    do:
      - { say: "Faintly written in the spider's web is: 'CHOP 'ER DOWN!'" }
      - { block: true }
  - when: { verb: read, noun: web, room: cypress_top }
    do:
      - { say: "Faintly written in the spider's web is: 'CHOP 'ER DOWN!'" }
      - { block: true }
  - when: { verb: read, noun: axe }
    if: { has: axe }
    do:
      - { say: "Stamped along the head of the axe: 'BUNYON'." }
      - { block: true }
  - when: { verb: read, noun: sign, room: chasm_bottom }
    do:
      - { say: "The sign reads: 'MAGIC WORD — AWAY'." }
      - { block: true }
  - when: { verb: read, noun: sign, room: stump_interior }
    do:
      - { say: "The sign reads: 'LEAVE TREASURES HERE'." }
      - { block: true }

  # ----- BUNYON: teleport inventory to grove -----
  - when: { verb: say, noun: bunyon }
    do:
      - { say: "Everything I'm carrying vanishes in a flash of light!" }
      - { move_inventory_to: grove }
      - { block: true }

  # ----- Quicksand SWIM rescue -----
  - when: { verb: swim, room: quicksand }
    do:
      - { say: "I splash and kick frantically and finally pull myself back to the lake shore." }
      - { move_player: lake_shore }
      - { block: true }

  # ----- Climb tree (forest oak / swamp cypress) -----
  - when: { verb: climb, noun: tree, room: forest }
    do:
      - { move_player: forest_top }
      - { block: true }
  - when: { verb: climb, room: forest }
    do:
      - { move_player: forest_top }
      - { block: true }
  - when: { verb: climb, noun: tree, room: swamp }
    do:
      - { move_player: cypress_top }
      - { block: true }
  - when: { verb: climb, room: swamp }
    do:
      - { move_player: cypress_top }
      - { block: true }
  - when: { verb: climb, noun: tree, room: cypress_top }
    do:
      - { say: "I can't climb any higher." }
      - { block: true }
  - when: { verb: climb, noun: tree, room: forest_top }
    do:
      - { say: "I can't climb any higher." }
      - { block: true }

  # ----- Death traps -----
  - when: { verb: go, noun: west, room: forest }
    do:
      - { say: "I push west into the dense forest. The trees close in around me. I lose my way utterly... and never find it again." }
      - { end_game: { result: lose, message: "*** YOU HAVE DIED ***   Type RESTART to try again." } }
      - { block: true }
  - when: { verb: go, noun: down, room: ledge }
    do:
      - { say: "I lower myself off the ledge. My foothold gives way! I tumble end over end into the bottomless dark..." }
      - { end_game: { result: lose, message: "*** YOU HAVE DIED ***   Type RESTART to try again." } }
      - { block: true }

  # ----- Chop tree (reveals stump) -----
  - when: { verb: chop, noun: tree, room: swamp }
    if: { has: axe, not_flag: tree_chopped }
    do:
      - { say: "I take a few good swings with the axe. The cypress falls away to reveal a hollow STUMP!" }
      - { set_flag: tree_chopped }
      - { add_exit: { from: swamp, dir: stump, to: stump_interior } }
      - { block: true }
  - when: { verb: chop, noun: tree, room: swamp }
    if: { not_has: axe }
    do:
      - { say: "Chop with what?" }
      - { block: true }
  - when: { verb: chop, noun: tree, room: swamp }
    if: { flag: tree_chopped }
    do:
      - { say: "It's already chopped. The hollow stump is right here." }
      - { block: true }

  # ----- Rub lamp -----
  - when: { verb: rub, noun: lamp }
    if: { has: lamp, not_flag: rubbed_once }
    do:
      - { say: "A glowing genie appears! He drops something at my feet, then vanishes." }
      - { move_item: { item: ring, to: _here } }
      - { set_flag: rubbed_once }
      - { block: true }
  - when: { verb: rub, noun: lamp }
    if: { has: lamp, flag: rubbed_once, not_flag: rubbed_twice }
    do:
      - { say: "The genie returns! He drops something else, then is gone forever." }
      - { move_item: { item: bracelet, to: _here } }
      - { set_flag: rubbed_twice }
      - { block: true }
  - when: { verb: rub, noun: lamp }
    if: { has: lamp, flag: rubbed_twice }
    do:
      - { say: "The genie's voice booms from nowhere: 'GREEDY MORTAL!' He snatches a treasure and is gone." }
      - { take_random_treasure: true }
      - { block: true }
  - when: { verb: rub, noun: lamp }
    if: { not_has: lamp }
    do:
      - { say: "I'm not carrying a lamp." }
      - { block: true }

  # ----- Unlock door / locked passage -----
  - when: { verb: unlock, noun: door, room: root_chamber }
    if: { has: keys, not_flag: door_unlocked }
    do:
      - { say: "The skeleton keys turn the lock. The door swings open." }
      - { set_flag: door_unlocked }
      - { add_exit: { from: root_chamber, dir: hole, to: passage } }
      - { add_exit: { from: root_chamber, dir: down, to: passage } }
      - { block: true }
  - when: { verb: unlock, noun: door, room: root_chamber }
    if: { not_has: keys }
    do:
      - { say: "I have nothing to unlock it with." }
      - { block: true }
  - when: { verb: unlock, noun: door, room: root_chamber }
    if: { flag: door_unlocked }
    do:
      - { say: "It's already unlocked." }
      - { block: true }
  - when: { verb: open, noun: door, room: root_chamber }
    if: { not_flag: door_unlocked }
    do:
      - { say: "The door is locked tight." }
      - { block: true }
  - when: { verb: go, noun: hole, room: root_chamber }
    if: { not_flag: door_unlocked }
    do:
      - { say: "The door is locked tight." }
      - { block: true }
  - when: { verb: go, noun: down, room: root_chamber }
    if: { not_flag: door_unlocked }
    do:
      - { say: "The door is locked tight." }
      - { block: true }

  # ----- Lamp on/off -----
  - when: { verb: light, noun: lamp }
    if: { has: lamp, not_flag: lamp_lit }
    do:
      - { say: "The lamp glows warmly." }
      - { set_flag: lamp_lit }
      - { block: true }
  - when: { verb: light, noun: lamp }
    if: { has: lamp, flag: lamp_lit }
    do:
      - { say: "It's already lit." }
      - { block: true }
  - when: { verb: unlight, noun: lamp }
    if: { flag: lamp_lit }
    do:
      - { say: "The lamp goes out." }
      - { clear_flag: lamp_lit }
      - { block: true }
  - when: { verb: unlight, noun: lamp }
    if: { not_flag: lamp_lit }
    do:
      - { say: "It's not lit." }
      - { block: true }

  # ----- Ignite gas (blow open the window) -----
  - when: { verb: ignite, noun: gas, room: royal_chamber }
    if: { here: bladder, has: flint, not_flag: window_open }
    do:
      - { say: "I strike the flint and steel against the bladder of swamp gas. KABOOM! The bricked window shatters into a gaping hole!" }
      - { set_flag: window_open }
      - { move_item: { item: bladder, to: _nowhere } }
      - { move_item: { item: gas, to: _nowhere } }
      - { add_exit: { from: royal_chamber, dir: hole, to: ledge_chasm } }
      - { block: true }
  - when: { verb: light, noun: gas, room: royal_chamber }
    if: { here: bladder, has: flint, not_flag: window_open }
    do:
      - { say: "I strike the flint and steel against the bladder of swamp gas. KABOOM! The bricked window shatters into a gaping hole!" }
      - { set_flag: window_open }
      - { move_item: { item: bladder, to: _nowhere } }
      - { move_item: { item: gas, to: _nowhere } }
      - { add_exit: { from: royal_chamber, dir: hole, to: ledge_chasm } }
      - { block: true }
  - when: { verb: ignite, noun: gas }
    if: { not_has: flint }
    do:
      - { say: "I have nothing to spark it with." }
      - { block: true }

  # ----- Jump between ledges -----
  - when: { verb: jump, room: ledge_chasm }
    do:
      - { say: "I leap across the chasm and land on the far ledge!" }
      - { move_player: ledge_throne }
      - { block: true }
  - when: { verb: jump, room: ledge_throne }
    do:
      - { say: "I leap back across the chasm!" }
      - { move_player: ledge_chasm }
      - { block: true }

  # ----- Yell at the bear -----
  - when: { verb: yell, room: ledge_throne }
    if: { here: bear, not_flag: bear_gone }
    do:
      - { say: "I let loose a thunderous YELL! The bear is so startled he loses his footing and tumbles into the chasm." }
      - { move_item: { item: bear, to: _nowhere } }
      - { set_flag: bear_gone }
      - { block: true }
  - when: { verb: yell }
    do:
      - { say: "I YELL with all my might. Nothing happens." }
      - { block: true }

  # ----- Build dam -----
  - when: { verb: build, noun: dam, room: chasm_bottom }
    if: { has: bricks, not_flag: dam_built }
    do:
      - { say: "I stack the fire bricks across the lava stream. The dam holds back the molten flow, revealing a glowing FIRESTONE." }
      - { set_flag: dam_built }
      - { move_item: { item: bricks, to: _nowhere } }
      - { move_item: { item: firestone, to: _here } }
      - { block: true }
  - when: { verb: build, noun: dam }
    if: { not_has: bricks }
    do:
      - { say: "I have nothing to build it with." }
      - { block: true }

  # ----- Pour water (cool firestone, or just empty bottle) -----
  - when: { verb: pour, noun: water, room: chasm_bottom }
    if: { has: water, here: firestone, not_flag: firestone_cool }
    do:
      - { say: "I pour the water onto the firestone. It hisses and steams, then cools enough to handle." }
      - { set_flag: firestone_cool }
      - { move_item: { item: water, to: _nowhere } }
      - { block: true }
  - when: { verb: pour, noun: water }
    if: { has: water }
    do:
      - { say: "I pour out the water. The bottle is now empty." }
      - { move_item: { item: water, to: _nowhere } }
      - { block: true }
  - when: { verb: pour, noun: water }
    if: { not_has: water }
    do:
      - { say: "I have no water to pour." }
      - { block: true }

  # ----- Hot firestone -----
  - when: { verb: take, noun: firestone, room: chasm_bottom }
    if: { not_flag: firestone_cool, here: firestone }
    do:
      - { say: "OUCH! The firestone is far too hot to touch!" }
      - { block: true }

  # ----- Magic word AWAY -----
  - when: { verb: say, noun: away, room: chasm_bottom }
    do:
      - { say: "The world spins around me... and I find myself in a sunny meadow!" }
      - { move_player: meadow }
      - { block: true }
  - when: { verb: say, noun: away }
    do:
      - { say: "Nothing happens." }
      - { block: true }

  # ----- Get water at lake (refill empty bottle) -----
  - when: { verb: take, noun: water, room: lake_shore }
    if: { not_has: water }
    do:
      - { say: "I dip the bottle into the lake. It fills with cold water." }
      - { move_item: { item: water, to: _inv } }
      - { block: true }
  - when: { verb: fill, noun: bottle, room: lake_shore }
    do:
      - { say: "I dip the bottle into the lake. It fills with cold water." }
      - { move_item: { item: water, to: _inv } }
      - { block: true }

  # ----- Catch fish (need net) -----
  - when: { verb: take, noun: fish, room: lake_shore }
    if: { not_has: net }
    do:
      - { say: "It's too quick to catch with bare hands." }
      - { block: true }
  - when: { verb: take, noun: fish, room: lake_shore }
    if: { has: net }
    do:
      - { say: "Got it! The golden fish wriggles in the net." }
      - { move_item: { item: fish, to: _inv } }
      - { block: true }

  # ----- Get bees (need empty bottle, in octagon) -----
  - when: { verb: take, noun: bees, room: octagon }
    if: { has: water }
    do:
      - { say: "My bottle is full of water — no room for bees." }
      - { block: true }
  - when: { verb: take, noun: bees, room: octagon }
    if: { not_has: water }
    do:
      - { say: "I trap the angry bees inside the bottle." }
      - { move_item: { item: bees, to: _inv } }
      - { block: true }

  # ----- Mud + dragon = death -----
  - when: { verb: go, noun: north, room: swamp }
    if: { has: mud, not_flag: dragon_gone }
    do:
      - { say: "I step into the meadow. The dragon's nostrils flare — it smells the mud! With a roar of fury, it rears up and incinerates me with a single blast." }
      - { end_game: { result: lose, message: "*** YOU HAVE DIED ***   Type RESTART to try again." } }
      - { block: true }

  # ----- Drop bees on dragon -----
  - when: { verb: drop, noun: bees }
    if: { here: dragon, has: bees, not_flag: dragon_gone }
    do:
      - { say: "The bees swarm out and attack the dragon! With a screech of pain, the dragon takes flight, leaving behind a clutch of EGGS!" }
      - { move_item: { item: dragon, to: _nowhere } }
      - { move_item: { item: bees, to: _nowhere } }
      - { move_item: { item: eggs, to: _here } }
      - { set_flag: dragon_gone }
      - { block: true }
  - when: { verb: drop, noun: bees }
    if: { has: bees }
    do:
      - { say: "I release the bees. They swarm angrily for a moment, then disperse." }
      - { move_item: { item: bees, to: _nowhere } }
      - { block: true }

  # ----- Mirror shatters off the rug -----
  - when: { verb: drop, noun: mirror }
    if: { has: mirror, here: rug }
    do:
      - { say: "The magic mirror lands safely on the rug. It glows briefly and whispers: 'DRAGON STING'." }
      - { move_item: { item: mirror, to: _here } }
      - { block: true }
  - when: { verb: drop, noun: mirror }
    if: { has: mirror }
    do:
      - { say: "The magic mirror falls and SHATTERS into a thousand glittering shards." }
      - { move_item: { item: mirror, to: _nowhere } }
      - { block: true }
---
