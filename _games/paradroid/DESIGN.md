---
title: Paradroid — Design Document
layout: page
permalink: /games/paradroid/design/
published: false
---

# Paradroid (RSOW edition) — Design Document

**Status:** draft v0.6 — Milestones 0-4 complete + post-launch bug pass on AI pathing and transfer pin resolution; ready to begin Milestone 5 (full Deck 1 droid mix + lift to Deck 2).

## Current implementation state (as of v0.6)

✅ **Milestone 0** — modal, game card, canvas + C64 palette scaffold landed.
✅ **Milestone 1** — Deck 1 procedurally generated (60×30 cells, 20×10 macros) with thick walls, 3-tile doors, 3×3 lift. Player movement with acceleration/deceleration. Camera follows. Wall + entity collision (both axes, slide-along-walls).
✅ **Milestone 2** — 123 Disposal droid spawned in top-middle room, navigates via per-deck **waypoint graph** (rooms, doors, corridor segments). Player + droid each have **charges** (001=4, 123=8). Player fires weak laser with Space. Bullets collide with walls and droids. Both walls + entities block movement.
✅ **Milestone 3** — Full circuit-board transfer mini-game (see §6, rewritten). Accessible via `T` in deck (debug hook). Side selection, random topology, all element types except combiners, charge pool, color-locks, splitters routing through bar center, persistent vs 6-second pulse, last-spark-wins, winner indicator, AI scaling.
✅ **Milestone 4** — Transfer wired into gameplay. `DROID_STATS` + `WEAPONS` tables drive per-chassis charges / speed / weapon. Deck 1 now spawns a mix (123, 139, 247, 302 + a stowaway 476 for armed-transfer testing). Holding **Shift** in contact with an enemy starts a grapple — both droids flash blue for ~0.5s, then the transfer mini-game opens against that specific target. **Win** = remove target, `applyChassis(target.num)` swaps the player's number / charges / speed / weapon (a 476 yields a strong laser). **Loss** = 50% damage to the current chassis; if it dies, drop to bare 001, or game-over from 001. **Tie** = no transfer, no damage. HUD now shows the worn chassis number. Debug `T` retargets to the nearest enemy.
✅ **Post-M4 bug pass (v0.6)** — Five fixes from playtesting:
  1. **AI pathing / bot-bot deadlock.** When two enemies wedge, the bot probes one body-length ahead and — if blocked by another droid (not a wall) — yields on a per-bot randomized timer (~18–47 frames). Yielding swaps `currentWP ↔ prevWP`, sending the bot back the way it came. The per-bot random threshold staggers head-on encounters so both bots don't flip on the same frame and immediately re-wedge. Geometry wedges keep the original 60-frame reroute. Enemies also freeze (`grappling=true` skips `updateEnemy`) so a target can't drift out of grapple range mid-lock.
  2. **Phantom-fire from OS key-repeat.** `e.repeat` guard on the Space handler in transfer phase — a quick Space tap was producing 2–3 keydown events at the OS level and draining extra charges. One fire per real tap now.
  3. **Voltage indicator vs diode markers.** The original `>` voltage arrow at the rail end looked identical to the static `>` diode markers on the wire (same color, same shape, ~15 px apart). Replaced with a colored "plug" rectangle overlaid on the rail itself — different shape, different position, unambiguous.
  4. **Color-locked flow rendered on the wrong rail.** `computeSparkPos` keyed off `s.side === "yellow"` to pick which rail to start from, and `drawFlow` was passing the *energy color* (post-lock) as `s.side`. When the AI fired a yellow-locked right wire, the flow color became yellow and the dashes rendered from the **left** rail — looked like phantom player fires. Fixed by passing the actual rail (`"left"`/`"right"`) and keying `computeSparkPos` off `"left"`.
  5. **Claim-based pin resolution.** Replaced one-shot `pendingFlips` with a per-frame recompute. Each energized wire continuously "claims" its connected pins with its `fireFrame` as strength (active `FLIP_DELAY` frames after fire, matching spark travel time). Among active claims on a pin, the highest fireFrame wins. Result: permanent (`>`) pulses beat temp pulses once the temp expires, two permanent claims resolve **deterministically by recency** (no more end-of-round coin flip), and re-firing your wire refreshes your claim. Match-end also now waits `TEMP_ENERGY_FRAMES` (6s) past the last fire so temp pulses fully expire and permanent counter-claims get their final say before pins are tallied.

🚧 **Milestone 5 (NEXT)** — Full Deck 1 droid mix at proper densities, enemy combat behaviors (Wanderer / Civilian / Patroller flee + engage), lift menu UI, ~70%-cleared gate before the lift unlocks Deck 2. See §10 for the full milestone runway.

Deferred for future milestones: combiners (N→1 elements), chip swap (re-roll topology), real-time damage flash, SFX, sprite-art polish pass, all 8 decks, all 23 droids.
**Source game:** Paradroid, Andrew Braybrook / Hewson Consultants / Graftgold, 1985 (Commodore 64).
**Fidelity target:** faithful recreation of mechanics and feel. Modernized controls (keyboard + touch), browser-native rendering, no audio yet (TBD).
**Non-goals:** pixel-accurate sprite copies of copyrighted artwork; we'll do our own pixel art in the spirit of the original. Music — TBD; the original is silent in-game by design, with SFX only.

**Design principle — "no Paradroid 90."** Braybrook's own 1990 Amiga remake polished the visuals (more colors, parallax, smoother sprites) and the game felt *worse* — the tiny C64 silhouettes read instantly at speed in a chaotic corridor; the prettier Amiga sprites don't. We commit to the 1985 aesthetic. "Doesn't look as good as Paradroid 90" is a feature, not a bug.

> **Note on accuracy.** Stats, droid names, and deck layouts below are drawn from public Paradroid documentation (wiki, manual scans, Braybrook's Zzap!64 dev diaries) and my own memory. Anything I'm uncertain about is flagged **[verify]**. The D64 binary on disk can serve as ground truth for specific numbers when disassembled, but we shouldn't depend on it for the first pass.

---

## 1. Elevator pitch

You are the **Influence Device** — a small, expendable robot dropped onto a hostile starship full of mutinous droids. You have two ways to fight:

1. **Shoot** them with your weak built-in laser.
2. **Transfer** into them — physically grapple, then win a real-time logic-circuit duel for control of their chassis. If you win, you *become* that droid, inheriting its weapons, speed, and armor.

You climb the ship's droid hierarchy from a feeble 001 to the all-powerful 999 Command Cyborg, deck by deck, by always upgrading into something tougher than the body you currently wear. Lose your host, you fall back to your bare Influence Device. Lose *that*, game over.

---

## 2. The first five minutes (player experience)

1. Player clicks **Play** on `/games/` card. A modal opens — full-bleed canvas, like Scorched Earth.
2. Title screen: ship schematic, "PRESS START" prompt, brief lore crawl.
3. Player drops onto **Deck 1** as the 001 Influence Device. Sees a top-down corridor, a few low-tier droids patrolling.
4. Player learns the **transfer** mechanic via a forced tutorial against a 123 disposal droid (lowest enemy). The transfer mini-game opens on a separate canvas overlay.
5. Player wins → now wearing a 123 chassis → can shoot. Continues exploring deck. Finds a lift to Deck 2.
6. Save state persists per-deck in `localStorage`.

---

## 3. The ship — "Good Hope"

A merchant freighter overrun by its own crew of droids after a software fault during deep-space transit.

### 3.1 Deck structure

**8 decks**, each a 2D top-down tilemap. Decks get larger and more dangerous as you ascend. **[verify exact deck count — some sources say 8, some say more]**

| Deck | Theme              | Droid tier range | Notes                                  |
|------|--------------------|------------------|----------------------------------------|
| 1    | Cargo holds        | 100s–200s        | Tutorial deck, easy droids             |
| 2    | Service corridors  | 200s–300s        | Maintenance droids dominant            |
| 3    | Crew quarters      | 300s–400s        | Mixed; first laser-armed enemies       |
| 4    | Engineering        | 400s–500s        | Heavy maintenance, sentries appear     |
| 5    | Security           | 500s–600s        | Combat droids; lift access restricted  |
| 6    | Labs               | 600s–700s        | Experimental droids; environmental haz |
| 7    | Bridge approaches  | 700s–800s        | Heavy combat; mortar droids            |
| 8    | Command bridge     | 800s–999         | The 999 Command Cyborg lives here      |

### 3.2 Tile vocabulary (per deck)

- **Floor** — passable, no collision
- **Wall** — solid, blocks droids and shots
- **Door** — opens for any droid; can be jammed by some
- **Lift pad** — initiates lift sequence (mini-menu picks target deck)
- **Energizer** — recharges player energy on contact (rare)
- **Hatch** — one-way drop to lower deck (escape route)
- **Hazard tile** — damages over time (Deck 6+ only) **[verify]**

### 3.2.1 Sizing convention — "macro tiles"

The world is measured in **macro tiles** of 3×3 cells = 24×24 internal pixels. A droid is exactly 1 macro tile. This is the unit of design intent:

- **Walls** are 1 macro thick (24 px) — droid-thickness bulkheads.
- **Corridors** are 2 macros wide (48 px) = 2 droid widths.
- **Doors** are 1 macro × 1 macro (3×3 cells) — a full 3×3 punched through the wall.
- **Lifts** are 1 macro (3×3 cells) — droid-sized platforms.
- **Rooms** are sized in macros: e.g., 5×2 macros = 120×48 px interior.

The underlying tile grid stays 8×8 (matches C64 character cell size) — macros are a design-time abstraction. Sub-features inside rooms (energizers, hatches, hazards) can be sub-macro size if it reads well.

### 3.3 Lifts

Lifts are the only way between decks. A lift offers a menu: pick destination deck. Higher decks are locked until you've cleared enough of the current deck (threshold: ~70% of droids destroyed or transferred). **[verify lock condition — original may use a different gating mechanic]**

---

## 4. Droid roster

The 24 droid classes (canonical names and weapons confirmed against the C64 longplay / Jason's reference).

**"Charges" = unified resource pool.** Per Jason's correction: each droid has a fixed charge count that serves as both transfer-game ammo AND in-deck shot capacity / HP. 001 has 4, 123 has 8. Confirmed canonical values; the rest of the column is **[verify]** — first-pass estimates extrapolated from the curve, to be tuned later.

Speed and Armor columns are still **[verify]** — feel estimates.

| #   | Class           | Weapon                  | Charges | Speed | Armor | Notes                               |
|-----|-----------------|-------------------------|---------|-------|-------|-------------------------------------|
| 001 | Influence       | weak laser              | **4**   | 4     | 1     | The player's base form (canonical)  |
| 123 | Disposal        | none                    | **8**   | 3     | 1     | Trash bot; tutorial target (canonical) |
| 139 | Disposal        | none                    | 9       | 3     | 1     | Trash bot                           |
| 247 | Servant         | none                    | 10      | 4     | 1     | Civilian                            |
| 249 | Servant         | none                    | 11      | 4     | 1     | Civilian                            |
| 296 | Servant         | none                    | 12      | 4     | 2     | Civilian                            |
| 302 | Messenger       | none                    | 12      | 5     | 2     | Fast unarmed; courier               |
| 329 | Messenger       | none                    | 13      | 5     | 2     | Fast unarmed; courier               |
| 420 | Maintenance     | none — **flash-proof**  | 14      | 3     | 3     | Immune to flash disruptor AoE       |
| 476 | Maintenance     | strong single laser     | 15      | 4     | 3     | First real threat                   |
| 493 | Maintenance     | none                    | 16      | 4     | 3     |                                     |
| 516 | Crew            | none                    | 16      | 4     | 4     | Civilian (high-tier)                |
| 571 | Crew            | none                    | 17      | 4     | 4     | Civilian (high-tier)                |
| 598 | Crew            | none                    | 18      | 5     | 4     | Civilian (high-tier)                |
| 614 | Sentinel        | laser rifle             | 19      | 5     | 5     | First armed sentinel                |
| 615 | Sentinel        | lasers                  | 19      | 5     | 5     |                                     |
| 629 | Sentinel        | strong laser            | 20      | 5     | 5     |                                     |
| 711 | Battle          | **flash disruptor**     | 21      | 3     | 6     | AoE screen-flash; very dangerous    |
| 742 | Battle          | **flash disruptor**     | 22      | 3     | 6     | AoE screen-flash; very dangerous    |
| 751 | Battle          | lasers                  | 22      | 6     | 5     | Fastest battle droid                |
| 821 | Security        | twin lasers             | 23      | 5     | 7     | Two parallel laser beams            |
| 834 | Security        | lasers                  | 25      | 5     | 8     |                                     |
| 883 | Security        | exterminator            | 28      | 5     | 9     | Powerful, near bridge-tier          |
| 999 | Command Cyborg  | lasers                  | 32      | 6     | 10    | The boss. Only on Deck 8.           |

**Special properties:**
- **420 (Maintenance)** is *flash-proof* — immune to the flash-disruptor AoE attack used by 711 and 742. Worth wearing through flash-heavy decks.

### 4.1 Weapon classes

| Weapon                  | Behavior                                                                |
|-------------------------|-------------------------------------------------------------------------|
| **Weak laser**          | Short range, slow rate of fire. 1 dmg.                                  |
| **Lasers** (basic)      | Standard projectile, medium range. 2 dmg.                               |
| **Strong/single laser** | Higher damage projectile. 3 dmg.                                        |
| **Laser rifle**         | Long-range single beam. 3 dmg.                                          |
| **Twin lasers**         | Two parallel beams fired together. 3 dmg each.                          |
| **Flash disruptor**     | Screen-wide AoE: all visible droids take heavy damage. Big telegraph; flashes the playfield. **Ignores walls / line of sight.** 420 immune. 4-5 dmg. |
| **Exterminator**        | Powerful directed beam, longest range. 5 dmg.                           |

The **flash disruptor** is the signature mechanic of the Battle-class droids — it's a panic button that punishes the player for being in line of sight. Standard counter: hide behind a corner, or wear a 420 and tank it.

### 4.2 AI archetypes

Five behavior buckets mapped to the canonical class roles:

| Archetype     | Used by classes              | Behavior                                                |
|---------------|------------------------------|---------------------------------------------------------|
| **Wanderer**  | Disposal (123, 139)          | Random walk; flee on sight of armed droid               |
| **Civilian**  | Servant (247–296), Crew (516–598), Messenger (302, 329) | Patrol fixed route; flee combat; never attack |
| **Patroller** | Maintenance (420, 476, 493)  | Fixed route; armed Maintenance shoots if engaged        |
| **Sentry**    | Sentinel (614, 615, 629)     | Stays in a zone; hunts intruders within zone            |
| **Hunter**    | Battle (711, 742, 751), Security (821, 834, 883) | Pursues player across rooms; uses flash disruptor when in line of sight (Battle only) |
| **Boss**      | Command Cyborg (999)         | Aggressive pursuit; uses cover; coordinates with nearby droids |

---

## 5. Combat (top-down action)

### 5.1 Player controls

| Action          | Keyboard          | Touch            |
|-----------------|-------------------|------------------|
| Move            | Arrows / WASD     | Left thumb stick |
| Fire            | Space / J         | Right tap        |
| Transfer (init) | Shift / K         | Right hold       |
| Lift menu       | E (on lift pad)   | Tap lift         |
| Pause           | P / Esc           | Pause button     |

### 5.2 Energy

The currently-worn droid has an **energy** pool. Taking damage drains it. At 0 energy, the droid host is destroyed and you fall back to the bare 001 Influence Device. Lose the 001 → game over.

Energy regenerates slowly while not taking damage **[verify — original may not regen]**, faster on Energizer tiles.

### 5.3 Transfer (initiating)

Walk into an enemy droid while holding the transfer button. If contact holds for ~0.5s, screen wipes to the **transfer mini-game** (see §6). If you win, you wear that droid's chassis. If you lose, you take damage and bounce back.

A successful transfer **does not damage the host droid** — you simply replace it. Transferring into a *higher-tier* droid is the only way to progress.

### 5.4 Damage model

- Shots have a single damage value (see weapon classes).
- Armor reduces incoming damage by a flat amount (min 1 dmg dealt).
- Player and enemy droids use the same model — when you wear a 711 Crusher, you take its armor.

---

## 6. The transfer mini-game (canonical spec, v0.4)

The signature mechanic — a real-time **circuit-board duel** where you redirect electrical charges across logic elements to flip segments of an IC chip toward your color. **30-second round.**

> This section was rewritten in v0.4 against Jason's reference screenshots and corrections. Earlier drafts were guesswork.

### 6.1 Pre-match: side selection

The circuit topology is generated randomly each match. **Before play starts, the player chooses which side to play.** They see the full board (chip, wires, splitters, color-locks, dead-ends, initial pin colors) and decide.

- Press **LEFT / A** → play **yellow** (left rail)
- Press **RIGHT / D** → play **purple** (right rail)
- AI takes the other side.

The header bar shows `CHOOSE SIDE < OR >` during selection. Cursors and charge stacks appear only after commit.

### 6.2 The board

- **Central IC chip** with **12 pins** stacked vertically. Each pin's segment is colored yellow or purple. Chip starts with random initial pin colors (half yellow, half purple, shuffled).
- **Winner indicator** — colored bar at the top of the chip body. **Black** if tied, **yellow** if yellow has more pins, **purple** if purple does. Updates live.
- Two **rails** at the far edges — yellow on the left, purple on the right.
- **8 wires per side** running from rail to chip. Wires align with **8 of the 12 pin Y positions** (indices `[0, 2, 3, 5, 6, 8, 9, 11]`). Pins **1, 4, 7, 10** are "in-between" pins — only reachable via a splitter from a neighboring wire.

### 6.3 Wire elements (random per match)

Each wire is generated independently with a random combination of:

- **Terminator** (`<` on left wires, `>` on right wires — points BACK at the rail). Wire physically ends here. Firing along this wire wastes a charge; spark dissipates. No pin reached.
- **Pass-through diode** (`>` on left wires, `<` on right wires — points TOWARD the chip). Charge keeps flowing through. **Crucially: a wire with a `>` keeps its pulse permanent** for the rest of the round once fired. A wire WITHOUT a `>` pulses for only **6 seconds** then stops.
- **Color-lock square** — a small colored square along the wire. Forces any charge passing through to that color regardless of who fired. **Always the opposite-side color** — left wires only get purple locks (sabotaging player charges), right wires only get yellow locks. They're permanent traps that benefit the opposite side.
- **Splitter bridge** — a vertical yellow bar mid-wire that fans the wire out to 2+ chip pins. One charge → multiple pin flips. Splitters are how the 4 "in-between" pins (1, 4, 7, 10) are reached. **The main wire enters the bar at its vertical centre**, not at one of the pin rows.

### 6.4 Charges (transfer-game ammo)

Each droid type has a fixed **charge pool**. The player's 001 has **4**. A 123 has **8**. Higher tiers have more (see §4 droid roster).

- Charges visualize as a **vertical stack of `>` triangles** at the top of each side's rail.
- Each fire costs 1 charge.
- **Wires are re-firable** — fire the same line again as long as you have charges.
- When a side hits 0 charges, their cursor caret disappears.

### 6.5 Cursor and firing

- Each side has a cursor caret pointing at a selected wire.
- Player: **Up/Down (or W/S)** moves cursor, **Space** fires (discrete press, one charge per tap).
- AI: moves and fires automatically on a 1-2.5 second deliberation cadence.
- Cursor sits at the **wire's visible entry Y** — for splitters that's the bar center; for direct wires it's the pin row.

### 6.6 Charge flow

When fired:

1. The fired wire becomes **energized** with the firing side's color (modified by any color-lock).
2. A bright **voltage plug** appears overlaid on the rail at the wire's entry Y (rectangle, not a triangle — visually distinct from the static `>` diode markers along the wire).
3. **Yellow/purple dashes flow** continuously along the wire from rail to pin in a chase pattern.
4. After ~50-frame travel delay (≈0.8s), the wire's "claim" on its connected pin(s) activates and the pin flips to the energy's final color.
5. Through a splitter, the spark enters the bar at center then jogs out to each pin.
6. **Claim-based resolution** (v0.6 rewrite of "last spark wins"): each energized wire continuously claims its pins as long as it stays energized. Among active claims on a pin, the one with the most recent **fireFrame** wins. Re-firing the same wire bumps its fireFrame, refreshing your claim. So:
   - Temp vs permanent (`>`) → permanent wins once the temp expires (the temp's claim disappears and the permanent's is the only one left).
   - Permanent vs permanent → whichever was fired *later* holds the pin. Deterministic and skill-based — fire your diode after the opponent fires theirs to lock it in.
   - Refresh tactic: spend a charge re-firing a wire you already own to bump your fireFrame above any future opponent fire.
7. **Without a `>`**, the wire de-energizes after 6 seconds and stops claiming. **With a `>`**, it claims forever.

### 6.7 Win condition

The match ends when **(timer ≤ 0 OR both sides spent)** AND **at least 6 seconds (`TEMP_ENERGY_FRAMES`) have passed since the most recent fire** — the settle wait ensures any temp pulse from the last few seconds has fully expired and permanent counter-claims have had their final say before pins are tallied. Then:

- More pins of your color than opponent's → **TRANSFER SUCCESS** (wear the new chassis).
- Fewer → **TRANSFER FAILED** (current chassis takes 50% damage).
- Equal → **DEADLOCK** (no transfer, no damage).

### 6.8 AI behavior

Opponent fires deliberately on a 1-2.5s cadence. Decision quality scales with tier:

| Tier  | Behavior                                                                |
|-------|-------------------------------------------------------------------------|
| 1-2   | Mostly random; sometimes fires dead-end wires (wastes charges).         |
| 3-6   | Picks wires that flip the most pins to its color.                        |
| 7-10  | Avoids opposite-color lock wires (recognizes traps); near-optimal play.  |

Higher tier also fires slightly faster (less "think" time).

### 6.9 Visual conventions

- Background: C64 ORANGE brown
- Yellow color: `#BFCE72` (C64 yellow)
- Purple color: `#9F7AC9` (lavender — lighter than Pepto's PURPLE to read on brown)
- Wires: pure black lines, 2px thick
- Chip body: pure black with colored pin segments
- Voltage indicators: colored "plug" rectangle on the rail (4×6 px) with a 1-px black halo, in the firing side's color. Rectangle (not triangle) so it can't be confused with diode markers.
- **No purple text anywhere** — it's hard to read on brown. Use yellow / white / light-red.

### 6.10 Deferred for future iteration

- **Combiners** (N wires merging into 1 output). Iconic Paradroid element, not yet generated.
- **Chip swap** — re-roll topology mid-match if unfavorable.
- **More wire-element variety** — e.g., amplifiers, multi-pin splitter chains.
- ~~**Wiring into actual gameplay**~~ — landed in Milestone 4.

---

## 7. Scoring & progression

- +10 per droid destroyed by shooting.
- +25 × tier per successful transfer (transferring into a 999 = 25,000).
- +5,000 per deck cleared (≥70% of droids removed).
- +50,000 for destroying the 999.
- **Bonus**: clearing a deck without losing your host = ×2 deck bonus.

High score persists in `localStorage` (`rsow.paradroid.hiscore`). Per-deck save state in `rsow.paradroid.save`.

---

## 8. Trainers / cheats (optional)

The REM crack on the source D64 includes 8 trainers. Worth offering a couple of dev-only toggles via URL params (matches RSOW vibe):

- `?cheat=energy` — infinite energy
- `?cheat=transfer` — always-win transfer game
- `?cheat=deck=5` — start on deck 5
- `?cheat=tier=820` — start wearing a 821

Not exposed in UI. Just hooks for testing / Jason's amusement.

---

## 9. Technology

### 9.1 Stack

Match existing pattern:

- **HTML/JS/CSS** — vanilla, no framework. Same as Scorched Earth.
- **Canvas 2D** for rendering. (No WebGL needed — top-down 16×16 tiles, modest sprite count.)
- **Single ES module** at `assets/js/paradroid.js` with submodules colocated *if* it grows past ~1,500 lines; otherwise one file.
- **Tilemap data** as JSON in `_games/paradroid/decks/deck-N.json` (so we can edit by hand or with a small tool).
- **Droid stats** as JSON in `_games/paradroid/droids.json`.
- **SCSS** at `_sass/_paradroid.scss`. Tokens match the Scorched Earth modal styling.
- **Modal include** at `_includes/paradroid-modal.html`. Game canvas lives inside.

### 9.2 Renderer

- **Internal resolution: 320×200** (C64 hires), upscaled with `image-rendering: pixelated`. Drawn as if multicolor (effectively 160×200 fat pixels) for the authentic look.
- **Palette: exact C64 16-color palette** (RGB values from the VIC-II reference). Defined once as a constant in `paradroid.js`.
- **Tiles: 8×8** (C64 character cell). Walls, floors, doors, lift pads.
- Fixed timestep main loop (16.67 ms / 60 fps). Decoupled render.

### 9.3 In-game droid rendering (faithful to original)

Critical design point: in the top-down view, droids are **not** depicted as full character sprites. Each droid is a composite:

```
  ██████████ █  ← flat "hat" bar (3 px tall), with a moving gap → implies rotation
       001        ← the droid's 3-digit class number, in a colored char cell
  ██ ██████████  ← same hat, mirrored vertically (anchor), gap mirrored
```

- **Hat:** a **domed silhouette** above the number — 2 px tall at the far edges, rising gradually to 6 px tall in the center (a rounded arch). Approx 24-28 px wide. Structure:
  - **Solid dome** — white, profile rises from 3 to 5 rows tall toward the center.
  - **Decoration row** — 1 px tall, dotted (every other column). Same on all droid classes (not class-specific).
  - **Animation 1 (gap scan):** a small ~2 px black gap scans across the bar's length in 6-8 discrete positions — like a spinning disc viewed edge-on, where the disc appears as a flat line and a marker creates a moving dark spot.
  - **Animation 2 (edge alternation):** the decoration row alternates between the *outer* edge (away from the number) and the *inner* edge (next to the number) of the dome on each step. Both hats are in phase — they pulse outward/inward together.
  - **Always animating** — both effects play continuously regardless of droid movement.
- **Number:** 3 character cells (24×8) showing the model number (`001`, `123`, ..., `999`). Color encodes **relationship to the player**, not droid type:
  - **White** — your currently-worn droid (the one you control)
  - **Black** — everything else (hostile droids; all enemies share this color regardless of class or armament)
  - **Medium blue** — droid currently engaged in a transfer with you (both you and the target flash blue while the transfer mini-game runs)
- **Mirrored hat:** the dome drawn again below the number, **vertically flipped only** — the dome points downward. The gap is at the **same horizontal X** as the top hat, so as it scans, both gaps move together in the same direction across the assembly. Creates a unified "spinning top" / gyroscope feel.
- **Player (bare 001 Influence Device):** small custom sprite (~16×16), not the number-and-hat composite. Tiny floating probe shape with a halo effect.

This is the key reason the original game reads so well at speed: number = identity, hat-rotation = motion/life, color = threat level. We preserve all of it.

### 9.4 Transfer-game portraits

The side panel during the transfer mini-game shows a portrait of the droid you're attempting to take over. These are the "real" droid graphics — ~24×21 multicolor sprites, one per class. We have the original C64 portraits as reference in `_games/paradroid/reference/p64ref.gif`. We redraw clean versions in our repo.

### 9.5 Renderer summary table

| Asset                       | Count | Size        | Source                                |
|-----------------------------|-------|-------------|---------------------------------------|
| Droid hats                  | 24    | ~24×8       | Our design (per-class silhouettes)    |
| Droid number font           | 1     | 8×8 chars   | Our design (C64-style digit set)      |
| Influence Device player     | 1     | ~16×16      | Our design                            |
| Transfer-game portraits     | 24    | ~24×21      | Redraw using `p64ref.gif` reference   |
| Tileset (walls/floors/etc.) | ~16   | 8×8         | Our design                            |
| Transfer-game board parts   | ~12   | varies      | Our design (gates, pulses)            |

### 9.3 Save format

```json
{
  "version": 1,
  "currentDeck": 3,
  "currentDroid": 420,
  "energy": 7,
  "decksCleared": [1, 2],
  "deckProgress": { "3": 0.45 },
  "score": 12350,
  "playTime": 1840
}
```

Stored at `rsow.paradroid.save`. Hiscore separate at `rsow.paradroid.hiscore`.

### 9.4 File layout

```
_games/paradroid/
  DESIGN.md                    ← this file
  droids.json                  ← all 23 droid stats
  decks/
    deck-1.json
    deck-2.json
    ...
    deck-8.json
  sprites/                     ← source pixel art (PNGs)

_includes/paradroid-modal.html
_sass/_paradroid.scss
assets/js/paradroid.js
assets/images/paradroid/
  spritesheet.png              ← packed sprites
  tileset.png
```

`games.md` gets a third card following the existing pattern. Modal opens via `data-canvas-game="paradroid"`.

---

## 10. Milestone breakdown

Rough sequencing. Each milestone is a working, playable slice — never a half-finished commit.

| # | Milestone                                  | Status | What you can do at the end                                |
|---|--------------------------------------------|--------|-----------------------------------------------------------|
| 0 | Modal + canvas + game card                 | ✅ done | Open Paradroid from /games/; see "hello world"            |
| 1 | Tilemap renderer + player movement         | ✅ done | Walk a 001 around Deck 1 (no enemies)                     |
| 2 | One enemy with AI + shooting               | ✅ done | Kill a 123 with the weak laser                            |
| 3 | Transfer mini-game (standalone)            | ✅ done | Press T in deck; play the circuit-board duel              |
| 4 | Transfer integrated; multiple droid types  | ✅ done | Walk up, transfer, wear new chassis, shoot with new gun   |
| 5 | Full Deck 1 with mixed droids + lift       | 🚧 next | Clear Deck 1, ride lift to Deck 2                         |
| 6 | All 8 decks + all 23 droids                |        | Play the whole campaign                                   |
| 7 | Save/load + hiscore + polish               |        | Quit mid-game, come back, resume                          |
| 8 | SFX, juice, screen shake, particles        |        | Feels good                                                |
| 9 | Sprite art final pass                      |        | Looks good                                                |

Realistic effort: **multi-week**, working in evenings. Milestones 0–4 are the meat — once transfer works, everything else is content + polish.

### 10.1 Restart cheat-sheet — Milestone 5 entry checklist

If you're picking this up in a fresh chat, here's the state of play and what's next:

**Where the code lives:**
- `_games/paradroid/DESIGN.md` — this file (spec; source of truth for design intent).
- `assets/js/paradroid.js` — single-file ES module (~1,700 lines, no submodules yet — split out if it crosses ~2,000).
- `_includes/paradroid-modal.html` — game container (canvas + close button).
- `_sass/_paradroid.scss` — modal styles.
- `games.md` — the listing card.

**Milestone 5 work, in suggested order:**

1. **Deck-1 droid roster at proper densities.** Replace the test mix (currently 123 / 139 / 247 / 302 + a stowaway 476) with ~8–10 droids drawn only from the 100s–200s tier per the §3.1 deck plan. The 476 was a Milestone-4 testing concession for armed-transfer; it should leave Deck 1 once the player has a credible reason to climb to Deck 4.

2. **Enemy AI behaviors per §4.2.**
   - **Wanderer** (Disposal 123/139) — already random-walks; add **flee on sight of armed droid** (LOS check, run toward farthest waypoint from the threat).
   - **Civilian** (Servant 247/249/296, Crew, Messenger) — patrol fixed route; flee combat; never attack.
   - **Patroller** (Maintenance 420/476/493) — fixed route; armed ones shoot if engaged.
   - Sentry / Hunter / Boss come with Decks 3+.
   - All behaviors share the current waypoint graph and the bot-bot yield rules from the v0.6 pass.

3. **Lift menu + deck gating.**
   - Walking onto a `LIFT` tile + pressing `E` opens a small menu overlay listing reachable decks (current + any unlocked).
   - Lock condition: ≥70% of the current deck's spawned droids removed (shot or transferred). Tracked as `decksCleared` and `deckProgress` in the save format (§9.3).
   - Lift menu uses the same modal canvas; arrow keys + Enter to select.

4. **Deck 2 stub.** Build a second `buildDeckN()` in the deck-builder style (or move to JSON in `_games/paradroid/decks/deck-N.json` as §9.4 plans). One playable deck with 200s–300s droids is enough to prove the lift loop.

5. **HUD updates.** "DECK N" should reflect the current deck. Add a small "CLEARED N%" readout when on the lift tile so the player knows whether the lift will unlock.

**Known small follow-ups outside Milestone 5:**
- Combiners in the transfer game (deferred since v0.4 — needed for visual parity with the original, not for win/loss math).
- Real-time damage flash on the worn chassis (the HUD shows charges but the chassis itself doesn't react visually to bullet hits).
- Energy regeneration / Energizer tiles — the energizer tile renders but doesn't yet refill charges on contact.
- Hatch tile is rendered but has no behavior yet (one-way drop to lower deck).
- SFX (intentionally deferred to Milestone 8).

---

## 11. Design decisions (locked v0.3)

| # | Topic              | Decision                                                                          |
|---|--------------------|-----------------------------------------------------------------------------------|
| 1 | Ship name / lore   | Keep canonical: the **Good Hope**, merchant freighter, mutinous-droids backstory. |
| 2 | Audio              | **Silent for now.** Original SFX are iconic — we'll add them later, done right. No music. |
| 3 | Difficulty         | **Single faithful difficulty.** Match 1985 tuning.                                |
| 4 | Mobile             | **Desktop-only.** Match Scorched Earth's pattern. Keyboard only.                  |
| 5 | Art style          | **A+C.** Authentic C64 (320×200, exact VIC-II palette). Extract Braybrook's originals as private silhouette reference; redraw clean in our repo. "No Paradroid 90." |
| 6 | Lift gating        | **% cleared to unlock.** Original behavior — clear ~70% of a deck before the lift opens the next. |
| 7 | Transfer fidelity  | Refine during implementation against C64 longplay video. §6 is best-effort recall. |
| 8 | Trainers           | **Yes, URL-param dev cheats.** Not exposed in UI. `?cheat=energy`, `?cheat=transfer`, `?cheat=deck=N`, `?cheat=tier=NNN`. |

---

## 12. Reference material

- **D64 binary** — `/Users/jellis/Downloads/Paradroid_C64_EN/PARADRO1.D64` (REM cracked release, includes 8 trainers; not portable / not shipped).
- **C64 droid portraits** — `_games/paradroid/reference/p64ref.gif` (the original transfer-game side-panel sprites; reference for our redraws).
- **Fan redesign concept art** — `_games/paradroid/reference/paradroid_64_lineup4.jpg`, `paradroid_90_lineup4.jpg` (AndroidArts; inspiration only, not original art).
- **C64 longplay** — https://www.youtube.com/watch?v=OEam-zQgWcU (Jason's pick — frame-source for verifying hat rotation, color codes, transfer-game flow, lift UX).
- **Birth of a Paradroid** dev diary — https://codetapper.com/c64/diary-of-a-game/paradroid/birth-of-a-paradroid-part-1/ (Braybrook's Zzap!64 diary; design rationale).
- **AndroidArts PSG Paradroid** — https://androidarts.com/paradroid/paradroid.htm (sprite reference + redesign discussion).

## 13. Next steps

1. Scaffold Milestone 0 (modal + game card + canvas hello-world with C64 palette).
2. Iterate through the 10 milestones in §10.
3. Verify visual details against the longplay video as questions arise.
