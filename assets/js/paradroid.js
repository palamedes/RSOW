(function () {
  "use strict";

  const modal = document.getElementById("paradroid-modal");
  const canvas = document.getElementById("pd-canvas");
  if (!modal || !canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;   // 320 (C64 hires)
  const H = canvas.height;  // 200

  // ─────────────────────────────────────────────────────────────
  // C64 VIC-II palette (Pepto Williamson RGB values).
  // ─────────────────────────────────────────────────────────────
  const C64 = {
    BLACK:       "#000000",
    WHITE:       "#FFFFFF",
    RED:         "#883932",
    CYAN:        "#67B6BD",
    PURPLE:      "#8B3F96",
    GREEN:       "#55A049",
    BLUE:        "#40318D",
    YELLOW:      "#BFCE72",
    ORANGE:      "#8B5429",
    BROWN:       "#574200",
    LIGHT_RED:   "#B86962",
    DARK_GREY:   "#505050",
    MID_GREY:    "#787878",
    LIGHT_GREEN: "#94E089",
    LIGHT_BLUE:  "#7869C4",
    LIGHT_GREY:  "#9F9F9F"
  };

  // ─────────────────────────────────────────────────────────────
  // URL cheat hooks (dev-only; not exposed in UI).
  // Usage: ?cheat=energy or ?cheat=tier=420,deck=5
  // ─────────────────────────────────────────────────────────────
  const params = new URLSearchParams(window.location.search);
  const cheats = {};
  (params.get("cheat") || "").split(",").forEach(function (s) {
    if (!s) return;
    const eq = s.indexOf("=");
    if (eq < 0) cheats[s.trim()] = true;
    else cheats[s.slice(0, eq).trim()] = s.slice(eq + 1).trim();
  });
  if (Object.keys(cheats).length) console.info("[paradroid] cheats:", cheats);

  // ─────────────────────────────────────────────────────────────
  // 5x7 pixel font — placeholder for Milestone 0. Will be replaced
  // by a proper C64 character set in a later milestone.
  // ─────────────────────────────────────────────────────────────
  const G = {
    A:["01110","10001","10001","11111","10001","10001","10001"],
    B:["11110","10001","10001","11110","10001","10001","11110"],
    C:["01111","10000","10000","10000","10000","10000","01111"],
    D:["11110","10001","10001","10001","10001","10001","11110"],
    E:["11111","10000","10000","11110","10000","10000","11111"],
    F:["11111","10000","10000","11110","10000","10000","10000"],
    G:["01111","10000","10000","10011","10001","10001","01110"],
    H:["10001","10001","10001","11111","10001","10001","10001"],
    I:["01110","00100","00100","00100","00100","00100","01110"],
    J:["00001","00001","00001","00001","00001","10001","01110"],
    K:["10001","10010","10100","11000","10100","10010","10001"],
    L:["10000","10000","10000","10000","10000","10000","11111"],
    M:["10001","11011","10101","10001","10001","10001","10001"],
    N:["10001","11001","10101","10011","10001","10001","10001"],
    O:["01110","10001","10001","10001","10001","10001","01110"],
    P:["11110","10001","10001","11110","10000","10000","10000"],
    Q:["01110","10001","10001","10001","10101","10010","01101"],
    R:["11110","10001","10001","11110","10100","10010","10001"],
    S:["01111","10000","10000","01110","00001","00001","11110"],
    T:["11111","00100","00100","00100","00100","00100","00100"],
    U:["10001","10001","10001","10001","10001","10001","01110"],
    V:["10001","10001","10001","10001","10001","01010","00100"],
    W:["10001","10001","10001","10001","10101","11011","10001"],
    X:["10001","10001","01010","00100","01010","10001","10001"],
    Y:["10001","10001","10001","01010","00100","00100","00100"],
    Z:["11111","00001","00010","00100","01000","10000","11111"],
    "0":["01110","10001","10011","10101","11001","10001","01110"],
    "1":["00100","01100","00100","00100","00100","00100","01110"],
    "2":["01110","10001","00001","00010","00100","01000","11111"],
    "3":["01110","10001","00001","00110","00001","10001","01110"],
    "4":["00010","00110","01010","10010","11111","00010","00010"],
    "5":["11111","10000","11110","00001","00001","10001","01110"],
    "6":["00110","01000","10000","11110","10001","10001","01110"],
    "7":["11111","00001","00010","00100","01000","01000","01000"],
    "8":["01110","10001","10001","01110","10001","10001","01110"],
    "9":["01110","10001","10001","01111","00001","00010","01100"],
    " ":["00000","00000","00000","00000","00000","00000","00000"],
    ".":["00000","00000","00000","00000","00000","00100","00100"],
    "-":["00000","00000","00000","01110","00000","00000","00000"],
    "/":["00001","00001","00010","00100","01000","10000","10000"],
    ":":["00000","00100","00100","00000","00100","00100","00000"],
    "%":["11001","11010","00100","01000","10011","00011","00000"],
    "<":["00001","00010","00100","01000","00100","00010","00001"],
    ">":["10000","01000","00100","00010","00100","01000","10000"]
  };

  function drawText(str, x, y, scale, color) {
    ctx.fillStyle = color;
    for (let i = 0; i < str.length; i++) {
      const glyph = G[str[i].toUpperCase()];
      if (!glyph) { continue; }
      for (let row = 0; row < 7; row++) {
        const line = glyph[row];
        for (let col = 0; col < 5; col++) {
          if (line[col] === "1") {
            ctx.fillRect(x + col * scale, y + row * scale, scale, scale);
          }
        }
      }
      x += 6 * scale; // 5 px glyph + 1 px gap, scaled
    }
  }

  function textWidth(str, scale) {
    return str.length * 6 * scale - scale;
  }

  function drawTextCentered(str, y, scale, color) {
    drawText(str, ((W - textWidth(str, scale)) >> 1), y, scale, color);
  }

  // ─────────────────────────────────────────────────────────────
  // Tile system + Deck 1 (cargo holds).
  // ─────────────────────────────────────────────────────────────
  const TILE = {
    FLOOR: '.', WALL: '#', DOOR: 'D',
    LIFT: 'L', ENERGIZER: 'E', HATCH: 'H'
  };
  const TILE_SIZE = 8;
  // The world is measured in "macro tiles" of 3×3 cells = 24×24 px.
  // A droid fits in 1 macro. Walls are 1 macro (3 cells) thick.
  // Hallways are 2 macros (6 cells / 48 px) wide.
  const MACRO = 3;

  function isWalkable(t) {
    return t === TILE.FLOOR || t === TILE.DOOR || t === TILE.LIFT ||
           t === TILE.ENERGIZER || t === TILE.HATCH;
  }

  // Build Deck 1 procedurally. Everything is laid out in MACRO units
  // (3×3 cells) so walls are droid-thickness and corridors are 2
  // droids wide.
  //
  // Layout (20 × 10 macros = 60 × 30 cells = 480 × 240 px):
  //
  //   macro row 0      ███████ outer top wall
  //   macro rows 1-2   ▓ 3 storage rooms (energizer / / lift)
  //   macro row 3      ▓ divider w/ 3 doors
  //   macro rows 4-5   ▓ central corridor (2 macros / 6 cells tall)
  //   macro row 6      ▓ divider w/ 2 doors
  //   macro rows 7-8   ▓ 2 bays (hatch / open)
  //   macro row 9      ███████ outer bottom wall
  //
  function buildDeck1() {
    const Wt = 60, Ht = 30;
    const rows = [];
    for (let y = 0; y < Ht; y++) rows.push(new Array(Wt).fill(TILE.FLOOR));

    // Paint a rectangle (in macro units) with a given tile.
    function mrect(mx, my, mw, mh, t) {
      const x0 = mx * MACRO, y0 = my * MACRO;
      const x1 = x0 + mw * MACRO, y1 = y0 + mh * MACRO;
      for (let y = y0; y < y1 && y < Ht; y++) {
        if (y < 0) continue;
        for (let x = x0; x < x1 && x < Wt; x++) {
          if (x < 0) continue;
          rows[y][x] = t;
        }
      }
    }
    // Center a single cell inside the macro at (mx,my).
    function mcenter(mx, my, t) {
      rows[my * MACRO + 1][mx * MACRO + 1] = t;
    }

    // Outer hull (1 macro = 3 cells thick all around)
    mrect( 0, 0, 20, 1, TILE.WALL);  // top
    mrect( 0, 9, 20, 1, TILE.WALL);  // bottom
    mrect( 0, 0,  1, 10, TILE.WALL); // left
    mrect(19, 0,  1, 10, TILE.WALL); // right

    // Horizontal dividers
    mrect(0, 3, 20, 1, TILE.WALL);   // upper divider (rooms → corridor)
    mrect(0, 6, 20, 1, TILE.WALL);   // lower divider (corridor → bays)

    // Vertical interior walls dividing top rooms
    mrect( 6, 1, 1, 2, TILE.WALL);   // top-left / top-middle
    mrect(12, 1, 1, 2, TILE.WALL);   // top-middle / top-right

    // Vertical interior wall dividing bottom bays
    mrect(10, 7, 1, 2, TILE.WALL);

    // Doors — each is one macro = 3×3 punched through the wall
    mrect( 3, 3, 1, 1, TILE.DOOR);   // top-left room → corridor
    mrect( 9, 3, 1, 1, TILE.DOOR);   // top-middle room → corridor
    mrect(15, 3, 1, 1, TILE.DOOR);   // top-right room → corridor
    mrect( 5, 6, 1, 1, TILE.DOOR);   // corridor → bottom-left bay
    mrect(14, 6, 1, 1, TILE.DOOR);   // corridor → bottom-right bay

    // Features
    mrect(16, 1, 1, 1, TILE.LIFT);   // lift in top-right room (3×3)
    mcenter( 2, 1, TILE.ENERGIZER);  // single energizer tile in top-left room
    mcenter( 3, 7, TILE.HATCH);      // single hatch tile in bottom-left bay

    // Waypoint graph — droids navigate between these on patrol.
    // Each waypoint must have a straight-line walkable path (for a
    // halfSize-8 droid) to all of its listed neighbors. Coordinates
    // are the actual pixel centers of door / room / corridor blocks.
    const waypoints = [
      { x:  84, y:  48, neighbors: [1] },           //  0: top-left room
      { x:  84, y:  84, neighbors: [0, 2] },        //  1: top-left door
      { x:  84, y: 120, neighbors: [1, 8] },        //  2: corridor west
      { x: 228, y:  48, neighbors: [4] },           //  3: top-middle room
      { x: 228, y:  84, neighbors: [3, 5] },        //  4: top-middle door
      { x: 228, y: 120, neighbors: [4, 8, 9] },     //  5: corridor middle
      { x: 348, y:  48, neighbors: [7] },           //  6: top-right room
      { x: 372, y:  84, neighbors: [6, 10] },       //  7: top-right door
      { x: 132, y: 120, neighbors: [2, 5, 11] },    //  8: corridor over bottom-left door
      { x: 348, y: 120, neighbors: [5, 10, 13] },   //  9: corridor over bottom-right door
      { x: 372, y: 120, neighbors: [7, 9] },        // 10: corridor east
      { x: 132, y: 156, neighbors: [8, 12] },       // 11: bottom-left door
      { x: 128, y: 192, neighbors: [11] },          // 12: bottom-left bay
      { x: 348, y: 156, neighbors: [9, 14] },       // 13: bottom-right door
      { x: 360, y: 192, neighbors: [13] }           // 14: bottom-right bay
    ];

    return {
      width: Wt,
      height: Ht,
      pixelW: Wt * TILE_SIZE,
      pixelH: Ht * TILE_SIZE,
      rows: rows.map(function (r) { return r.join(''); }),
      waypoints: waypoints,
      // Player drops in the corridor near the left
      playerStart: { x: 3 * MACRO * TILE_SIZE, y: 4 * MACRO * TILE_SIZE + (MACRO * TILE_SIZE >> 1) }
    };
  }

  function nearestWaypoint(deck, x, y) {
    let best = 0;
    let bestDist = Infinity;
    for (let i = 0; i < deck.waypoints.length; i++) {
      const w = deck.waypoints[i];
      const d = (w.x - x) * (w.x - x) + (w.y - y) * (w.y - y);
      if (d < bestDist) { bestDist = d; best = i; }
    }
    return best;
  }

  function tileAt(deck, px, py) {
    const tx = Math.floor(px / TILE_SIZE);
    const ty = Math.floor(py / TILE_SIZE);
    if (tx < 0 || ty < 0 || tx >= deck.width || ty >= deck.height) return TILE.WALL;
    return deck.rows[ty][tx];
  }

  // ─────────────────────────────────────────────────────────────
  // Enemies (just 123 Disposal for Milestone 2)
  // ─────────────────────────────────────────────────────────────
  function spawnEnemy(num, x, y, charges, speed) {
    return {
      num: num,
      x: x, y: y,
      charges: charges, maxCharges: charges,
      speed: speed,
      halfSize: 8,                       // ~1 macro: matches droid silhouette
      currentWP: -1,                     // initialized after spawn
      prevWP: -1,
      targetWP: -1,
      stuckFrames: 0
    };
  }

  function fireBullet(x, y, dirX, dirY) {
    const len = Math.hypot(dirX, dirY) || 1;
    bullets.push({
      x: x, y: y,
      vx: (dirX / len) * BULLET_SPEED,
      vy: (dirY / len) * BULLET_SPEED,
      damage: WEAK_LASER_DAMAGE,
      life: BULLET_LIFE
    });
  }

  // ─────────────────────────────────────────────────────────────
  // Game state
  // ─────────────────────────────────────────────────────────────
  let rafId = null;
  let frame = 0;
  let state = "title";          // "title" | "playing"
  let currentDeck = null;
  const player = {
    x: 0, y: 0, vx: 0, vy: 0,
    facingX: 0, facingY: -1,         // default facing up
    halfSize: 8,                     // ~1 macro: matches droid silhouette
    charges: 4, maxCharges: 4,       // 001 Influence Device has 4 charges
    num: "001",
    fireCooldown: 0
  };
  const enemies = [];                 // hostile droids on current deck
  const bullets = [];                 // active projectiles
  const keys = {};

  // Movement tuning — small accel/decel for a "weighty" feel without
  // sluggishness. ACCEL of 0.18 reaches ~95% of target in ~16 frames
  // (~0.27s at 60 fps). DRAG_STOP nudges tiny residual velocity to 0.
  const MAX_SPEED = 1.4;
  const ACCEL = 0.18;
  const DRAG_STOP = 0.05;

  // Weapon tuning
  const BULLET_SPEED = 3.0;           // px/frame
  const BULLET_LIFE = 90;             // frames before auto-fade
  const WEAK_LASER_COOLDOWN = 20;     // frames between shots
  const WEAK_LASER_DAMAGE = 1;

  // ─────────────────────────────────────────────────────────────
  // Transfer mini-game (Milestone 3 — circuit-board duel)
  //
  // Board: 12-pin IC chip in the center. Each side has 8 wires
  // running from its outer rail to the chip. Topology is random per
  // transfer — wires may dead-end, go to one pin, split to several
  // pins, or pass a color-lock that forces the spark to one color.
  //
  // Verb: player moves cursor up/down to select one of their 8
  // wires, presses Space to fire a charge along it. Sparks animate
  // along the wire, hit reachable pins, set pin color to incoming
  // (after any color-lock).
  //
  // Charges are limited by droid stats (001=4). When both sides
  // are out of charges, the round ends. Timer also forces end.
  // Most pins of your color = win; equal = deadlock (tie).
  // ─────────────────────────────────────────────────────────────
  const TR = {
    WIRES: 8,                      // wires per side
    PINS: 12,                      // chip pins
    BOARD_Y0: 20,
    BOARD_Y1: 188,
    LEFT_RAIL_X: 10,
    LEFT_WIRE_END: 132,            // touches chip's left edge
    RIGHT_WIRE_START: 192,         // touches chip's right edge
    RIGHT_RAIL_X: 312,
    CHIP_X: 134,                   // left edge of chip body
    CHIP_W: 56,
    CHIP_INSET: 4,                 // inner pin box inset
    TIME_LIMIT: 60 * 30,           // 30 seconds @ 60fps
    SPARK_SPEED: 2,                // pixels per frame
    AI_THINK_MIN: 60,              // ~1 sec
    AI_THINK_MAX: 150,             // ~2.5 sec
    YELLOW: "#BFCE72",             // player color (C64 yellow)
    PURPLE: "#9F7AC9",             // opponent color (lavender, matches screenshot)
    PURPLE_DARK: "#6F4C9A",        // shaded variant
    BG: "#8B5429",                 // board brown
    BG_DARK: "#574200",            // darker brown
    RAIL_HI: "#BFCE72",            // yellow rail (player)
    RAIL_OPP: "#9F7AC9",           // purple rail (opponent)
    WIRE_COLOR: "#000000"
  };

  // A "wire" is a linear sequence of segments with elements in
  // between. For our purposes we precompute, per wire, a "resolved"
  // result: which pins it affects, what color it commits the spark
  // to (or null = use firer's color), and a rendered geometry.
  //
  // Element types:
  //   DEAD     — wire terminates here, no pin reached
  //   DIODE    — pass-through (decorative for the player)
  //   LOCK     — color-lock (forces spark color to a specific side)
  //   SPLIT    — wire fans out vertically to additional pin(s)
  //
  // We model a wire as: { fromRow, elements: [...], pins: [...],
  // colorLock: null|"yellow"|"purple" }. Geometry (for render +
  // spark animation) is computed once at generation time.

  const transfer = {
    phase: "select",               // "select" | "playing" | "result"
    playerSide: "left",            // "left" or "right" — chosen at match start
    playerNum: "001",
    playerCharges: 4,
    playerMaxCharges: 4,
    oppNum: "123",
    oppCharges: 8,
    oppMaxCharges: 8,
    oppTier: 1,                    // 1..10, smarter at higher
    leftWires: [],
    rightWires: [],
    leftEnergy: [],                // [null | "yellow" | "purple"] — flow color
    rightEnergy: [],
    leftEnergyExpiry: [],          // [frameNumber | Infinity] — when flow stops
    rightEnergyExpiry: [],
    pendingFlips: [],              // [{pin, color, atFrame}] — pin colors waiting for travel
    pins: [],                      // [{color: "yellow"|"purple"}]
    cursor: 0,                     // player wire 0..WIRES-1
    oppCursor: 0,
    sparks: [],                    // unused, kept for compatibility
    fireCooldown: 0,
    aiNextFireFrame: 0,
    timer: 0,
    result: null,
    resultHoldFrame: 0,
    deadlocked: false
  };

  // PRNG seeded per transfer — also handy for the chip-swap feature.
  function rng() { return Math.random(); }

  // ── Circuit generation ───────────────────────────────────────
  // Each wire is generated independently. For MVP: single-splitter
  // chains (no combiners yet). Outcome per wire is one of:
  //   - dead end (~25%)
  //   - direct to 1 pin (~50%)
  //   - splitter to 2 pins (~25%)
  // Then 20% of non-dead wires get a color-lock somewhere.
  // Generate a wire's elements + destination pins. Each wire's
  // primary target is the pin at its own Y (wirePrimaryPin(i)).
  // Splitters add a neighbouring "in-between" pin so the player
  // can reach the 4 unmapped pins (1, 4, 7, 10) too.
  function generateWire(side, wireIndex, claimedPins) {
    const wire = {
      side: side,
      wireIndex: wireIndex,
      elements: [],
      pins: [],
      colorLock: null
    };
    const primary = wirePrimaryPin(wireIndex);

    // 20% chance the wire is a dead end (no pin reached)
    if (rng() < 0.20) {
      wire.elements.push({ type: "DEAD" });
      return wire;
    }

    // Optional pass-through diode for flavor
    if (rng() < 0.35) wire.elements.push({ type: "DIODE" });

    // Optional color-lock (15%) — ALWAYS the opposite side's color.
    // Left-side locks paint enemy color (trap for player); right-side
    // locks paint friendly color (trap for opponent).
    if (rng() < 0.15) {
      wire.colorLock = (side === "left") ? "purple" : "yellow";
      wire.elements.push({ type: "LOCK", color: wire.colorLock });
    }

    wire.pins.push(primary);

    // Splitter: ~30% chance to also reach an adjacent in-between pin
    if (rng() < 0.30) {
      const neighbors = [];
      if (primary > 0 && WIRE_PIN_MAP.indexOf(primary - 1) === -1) neighbors.push(primary - 1);
      if (primary < TR.PINS - 1 && WIRE_PIN_MAP.indexOf(primary + 1) === -1) neighbors.push(primary + 1);
      if (neighbors.length > 0) {
        const pick = neighbors[Math.floor(rng() * neighbors.length)];
        wire.pins.push(pick);
        wire.elements.push({ type: "SPLIT", pins: wire.pins.slice() });
      }
    }
    return wire;
  }

  function generateCircuit() {
    const leftWires = [];
    const rightWires = [];
    for (let i = 0; i < TR.WIRES; i++) {
      leftWires.push(generateWire("left", i, null));
      rightWires.push(generateWire("right", i, null));
    }
    return { leftWires: leftWires, rightWires: rightWires };
  }

  // Top of pin area pushed down to leave room for the winner header.
  function pinY(i) {
    const top = TR.BOARD_Y0 + 18;
    const bot = TR.BOARD_Y1 - 4;
    return top + Math.floor(i * (bot - top) / (TR.PINS - 1));
  }
  // Map 8 wires to 8 of the 12 pins so wires line up cleanly with
  // pin Y positions (no jogs needed for direct connections).
  // Pins 1, 4, 7, 10 are the "in-between" ones — only reachable via
  // splitter from an adjacent wire.
  const WIRE_PIN_MAP = [0, 2, 3, 5, 6, 8, 9, 11];
  function wirePrimaryPin(i) { return WIRE_PIN_MAP[i]; }
  function wireY(i) { return pinY(wirePrimaryPin(i)); }

  // The visible "entry Y" of a wire — where the main horizontal
  // enters the splitter (or just the pin row for direct wires).
  // For splitters this is the midpoint of the bridge bar so the
  // main wire visually connects to the centre of the bridge.
  function wireEntryY(wireIndex, isLeft) {
    const w = (isLeft ? transfer.leftWires : transfer.rightWires)[wireIndex];
    if (!w || w.pins.length <= 1) return wireY(wireIndex);
    let minY = Infinity, maxY = -Infinity;
    for (let i = 0; i < w.pins.length; i++) {
      const py = pinY(w.pins[i]);
      if (py < minY) minY = py;
      if (py > maxY) maxY = py;
    }
    return Math.floor((minY + maxY) / 2);
  }

  function isWireDead(w) {
    return w.elements.length > 0 && w.elements[0].type === "DEAD";
  }

  function clear(color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, W, H);
  }

  // ─────────────────────────────────────────────────────────────
  // Rendering
  // ─────────────────────────────────────────────────────────────
  function drawTitle() {
    clear(C64.BLUE);
    drawTextCentered("PARADROID", 36, 4, C64.WHITE);
    drawTextCentered("THE GOOD HOPE INCIDENT", 84, 1, C64.CYAN);
    if (Math.floor(frame / 30) % 2 === 0) {
      drawTextCentered("PRESS SPACE TO START", 132, 1, C64.WHITE);
    }
    drawTextCentered("RSOW EDITION - AFTER BRAYBROOK 1985", 180, 1, C64.LIGHT_GREY);
  }

  // Draw one 8×8 tile at (sx, sy) screen-space.
  function drawTile(t, sx, sy) {
    switch (t) {
      case TILE.WALL: {
        ctx.fillStyle = C64.LIGHT_GREY;
        ctx.fillRect(sx, sy, 8, 8);
        ctx.fillStyle = C64.MID_GREY;
        ctx.fillRect(sx, sy, 8, 1);
        ctx.fillRect(sx, sy + 7, 8, 1);
        break;
      }
      case TILE.DOOR: {
        ctx.fillStyle = C64.BLUE;
        ctx.fillRect(sx, sy, 8, 8);
        ctx.fillStyle = C64.YELLOW;
        ctx.fillRect(sx + 1, sy + 2, 6, 4);
        break;
      }
      case TILE.LIFT: {
        ctx.fillStyle = C64.BLUE;
        ctx.fillRect(sx, sy, 8, 8);
        ctx.fillStyle = C64.GREEN;
        ctx.fillRect(sx + 1, sy + 1, 6, 6);
        ctx.fillStyle = C64.LIGHT_GREEN;
        ctx.fillRect(sx + 2, sy + 3, 4, 2);
        break;
      }
      case TILE.ENERGIZER: {
        ctx.fillStyle = C64.BLUE;
        ctx.fillRect(sx, sy, 8, 8);
        ctx.fillStyle = C64.LIGHT_GREEN;
        ctx.fillRect(sx + 2, sy + 2, 4, 4);
        ctx.fillStyle = C64.WHITE;
        ctx.fillRect(sx + 3, sy + 3, 2, 2);
        break;
      }
      case TILE.HATCH: {
        ctx.fillStyle = C64.BLUE;
        ctx.fillRect(sx, sy, 8, 8);
        ctx.fillStyle = C64.RED;
        ctx.fillRect(sx + 1, sy + 1, 6, 6);
        ctx.fillStyle = C64.BLACK;
        ctx.fillRect(sx + 3, sy + 3, 2, 2);
        break;
      }
      case TILE.FLOOR:
      default: {
        ctx.fillStyle = C64.BLUE;
        ctx.fillRect(sx, sy, 8, 8);
        break;
      }
    }
  }

  function getCamera(deck) {
    let cx = player.x - (W >> 1);
    let cy = player.y - (H >> 1);
    cx = Math.max(0, Math.min(cx, deck.pixelW - W));
    cy = Math.max(0, Math.min(cy, deck.pixelH - H));
    return { x: Math.floor(cx), y: Math.floor(cy) };
  }

  function drawDeck(deck, cam) {
    const x0 = Math.max(0, (cam.x / TILE_SIZE) | 0);
    const y0 = Math.max(0, (cam.y / TILE_SIZE) | 0);
    const x1 = Math.min(deck.width - 1, ((cam.x + W) / TILE_SIZE) | 0);
    const y1 = Math.min(deck.height - 1, ((cam.y + H) / TILE_SIZE) | 0);
    for (let ty = y0; ty <= y1; ty++) {
      const row = deck.rows[ty];
      for (let tx = x0; tx <= x1; tx++) {
        drawTile(row[tx], tx * TILE_SIZE - cam.x, ty * TILE_SIZE - cam.y);
      }
    }
  }

  // Draws a droid cell (3-digit number, domed hat above & below) at
  // screen-space center (cx, cy). Color encodes relationship:
  // white = you, black = hostile, blue = transferring.
  function drawDroidCell(cx, cy, num, color) {
    const numScale = 1;
    const numW = textWidth(num, numScale);
    const cellW = numW + 4;
    const cellX = cx - (cellW >> 1);
    const numY = cy - ((numScale * 7) >> 1);

    drawText(num, cx - (numW >> 1), numY, numScale, color);

    const HAT_FRAMES = 8;
    const gapW = 2;
    const step = (frame >> 3) % HAT_FRAMES;
    const gapX = cellX + Math.floor(step * (cellW - gapW) / (HAT_FRAMES - 1));
    const decorOuter = (step & 1) === 0;

    function hatHeightAt(xRel) {
      const dEdge = Math.min(xRel, cellW - 1 - xRel);
      if (dEdge < 2) return 2;
      if (dEdge < 4) return 3;
      if (dEdge < 6) return 4;
      if (dEdge < 8) return 5;
      return 6;
    }
    function drawHat(anchorY, flipDown) {
      ctx.fillStyle = color;
      for (let xRel = 0; xRel < cellW; xRel++) {
        const sx = cellX + xRel;
        if (sx >= gapX && sx < gapX + gapW) continue;
        const h = hatHeightAt(xRel);
        for (let row = 0; row < h; row++) {
          const isOuter = row === h - 1;
          const isInner = row === 0;
          const isDecorRow = decorOuter ? isOuter : isInner;
          if (isDecorRow && (xRel & 1) !== 0) continue;
          const sy = flipDown ? (anchorY + row) : (anchorY - row);
          ctx.fillRect(sx, sy, 1, 1);
        }
      }
    }
    drawHat(numY - 2, false);
    drawHat(numY + numScale * 7 + 1, true);
  }

  function drawHUD() {
    ctx.fillStyle = C64.BLACK;
    ctx.fillRect(0, 0, W, 9);
    drawText("DECK 1", 4, 1, 1, C64.LIGHT_GREY);
    drawText("CHARGES " + player.charges + "/" + player.maxCharges, 50, 1, 1,
             player.charges === 0 ? C64.LIGHT_RED : C64.WHITE);
    drawText("DROIDS " + enemies.length, 168, 1, 1, C64.CYAN);
    drawText("CARGO HOLDS", 222, 1, 1, C64.LIGHT_GREY);
  }

  function drawBullet(b, cam) {
    const x = Math.floor(b.x - cam.x);
    const y = Math.floor(b.y - cam.y);
    ctx.fillStyle = C64.WHITE;
    ctx.fillRect(x, y, 2, 2);
  }

  function drawPlaying() {
    clear(C64.BLACK);
    const cam = getCamera(currentDeck);
    drawDeck(currentDeck, cam);

    // Enemies first, then bullets, then player on top
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      drawDroidCell(
        Math.floor(e.x - cam.x),
        Math.floor(e.y - cam.y),
        e.num,
        C64.BLACK
      );
    }
    for (let i = 0; i < bullets.length; i++) drawBullet(bullets[i], cam);

    drawDroidCell(
      Math.floor(player.x - cam.x),
      Math.floor(player.y - cam.y),
      player.num,
      C64.WHITE
    );
    drawHUD();
  }

  function render() {
    frame++;
    if (state === "title") drawTitle();
    else if (state === "transfer") drawTransfer();
    else drawPlaying();
  }

  // ─────────────────────────────────────────────────────────────
  // Transfer mini-game renderer
  // ─────────────────────────────────────────────────────────────

  // Compute spark (x,y) at parameter t in [0,1] along its route. The
  // wire enters at entryY (for splitters that's the centre of the
  // bridge bar; otherwise the primary pin row). Spark then jogs
  // vertically to the target pin Y and runs out to the chip.
  function computeSparkPos(s, t) {
    const isLeft = (s.side === "yellow");
    const eY = wireEntryY(s.wireIndex, isLeft);
    const xStart = isLeft ? TR.LEFT_RAIL_X + 2 : TR.RIGHT_RAIL_X - 2;
    const xEnd   = isLeft ? TR.LEFT_WIRE_END  : TR.RIGHT_WIRE_START;
    const branchX = isLeft ? TR.LEFT_WIRE_END - 10 : TR.RIGHT_WIRE_START + 10;

    if (s.targetPin < 0) {
      const tt = Math.min(t * 1.5, 1);
      const ex = isLeft ? TR.LEFT_WIRE_END - 30 : TR.RIGHT_WIRE_START + 30;
      return { x: xStart + (ex - xStart) * tt, y: eY };
    }
    const targetY = pinY(s.targetPin);
    const straight = (targetY === eY);
    const phase1End = 0.5;
    const phase2End = straight ? 0.5 : 0.7;
    if (t < phase1End) {
      const tt = t / phase1End;
      return { x: xStart + (branchX - xStart) * tt, y: eY };
    } else if (!straight && t < phase2End) {
      const tt = (t - phase1End) / (phase2End - phase1End);
      return { x: branchX, y: eY + (targetY - eY) * tt };
    } else {
      const t0 = straight ? phase1End : phase2End;
      const tt = (t - t0) / (1 - t0);
      return { x: branchX + (xEnd - branchX) * tt, y: targetY };
    }
  }

  // Render every fired wire as a continuously-flowing series of
  // dashes (yellow for player, purple for opponent), plus a small
  // arrow at the wire's rail end (the "voltage applied" indicator).
  function drawEnergizedWires() {
    const FLOW_DASHES = 8;
    const DASH_PHASE = 0.06;          // spacing between dashes (in t)
    const FLOW_SPEED = 0.018;         // how fast the chase scrolls
    const baseT = (frame * FLOW_SPEED) % 1;

    function drawFlow(side, wireIndex, w, color) {
      const fillColor = (color === "yellow") ? TR.YELLOW : TR.PURPLE;
      ctx.fillStyle = fillColor;
      const targets = w.pins.length > 0 ? w.pins : [-1];
      for (let p = 0; p < targets.length; p++) {
        const fake = { side: color, wireIndex: wireIndex, targetPin: targets[p] };
        for (let k = 0; k < FLOW_DASHES; k++) {
          const tt = (baseT + k * DASH_PHASE) % 1;
          // Skip dashes that would land past dead-end terminator
          if (targets[p] < 0 && tt > 0.67) continue;
          const pos = computeSparkPos(fake, tt);
          ctx.fillRect(Math.floor(pos.x) - 2, Math.floor(pos.y) - 1, 4, 2);
        }
      }
      // Voltage arrow at the rail end of the wire (at entry Y)
      const isLeft = (side === "left");
      const eY = wireEntryY(wireIndex, isLeft);
      const ax = isLeft ? TR.LEFT_RAIL_X + 4 : TR.RIGHT_RAIL_X - 4;
      const dir = isLeft ? 1 : -1;
      ctx.fillStyle = fillColor;
      ctx.beginPath();
      ctx.moveTo(ax, eY - 3);
      ctx.lineTo(ax + 5 * dir, eY);
      ctx.lineTo(ax, eY + 3);
      ctx.closePath();
      ctx.fill();
    }

    for (let i = 0; i < TR.WIRES; i++) {
      if (transfer.leftEnergy[i])  drawFlow("left",  i, transfer.leftWires[i],  transfer.leftEnergy[i]);
      if (transfer.rightEnergy[i]) drawFlow("right", i, transfer.rightWires[i], transfer.rightEnergy[i]);
    }
  }

  // Charge stack at a fixed top position beside each rail. Vertical
  // stack of `>` triangles — one per remaining charge.
  function drawChargeStack(side, charges) {
    const isLeft = (side === "yellow");
    const baseX = isLeft ? TR.LEFT_RAIL_X - 10 : TR.RIGHT_RAIL_X + 8;
    const dir = isLeft ? 1 : -1;
    ctx.fillStyle = isLeft ? TR.YELLOW : TR.PURPLE;
    for (let i = 0; i < charges; i++) {
      const y = TR.BOARD_Y0 + 20 + i * 6;
      ctx.beginPath();
      ctx.moveTo(baseX, y - 2);
      ctx.lineTo(baseX + 4 * dir, y);
      ctx.lineTo(baseX, y + 2);
      ctx.closePath();
      ctx.fill();
    }
  }

  function drawTransferElement(el, x, y, sparkColor) {
    if (el.type === "DEAD") {
      // Triangle at wire end, pointing AWAY from origin
      const dir = (sparkColor === "yellow") ? 1 : -1;
      ctx.fillStyle = TR.YELLOW;
      ctx.beginPath();
      ctx.moveTo(x, y - 3);
      ctx.lineTo(x + 5 * dir, y);
      ctx.lineTo(x, y + 3);
      ctx.closePath();
      ctx.fill();
    } else if (el.type === "DIODE") {
      const dir = (sparkColor === "yellow") ? -1 : 1;
      ctx.fillStyle = TR.YELLOW;
      ctx.beginPath();
      ctx.moveTo(x - 2 * dir, y - 3);
      ctx.lineTo(x + 3 * dir, y);
      ctx.lineTo(x - 2 * dir, y + 3);
      ctx.closePath();
      ctx.fill();
    } else if (el.type === "LOCK") {
      ctx.fillStyle = TR.WIRE_COLOR;
      ctx.fillRect(x - 4, y - 4, 8, 8);
      ctx.fillStyle = el.color === "yellow" ? TR.YELLOW : TR.PURPLE;
      ctx.fillRect(x - 3, y - 3, 6, 6);
    }
    // SPLIT is rendered as the bar joining wire-Y to extra pin-Y, not an element icon
  }

  function drawWireRoute(side, wireIndex, w) {
    const isLeft = (side === "left");
    const wy = wireY(wireIndex);
    const eY = wireEntryY(wireIndex, isLeft);     // main-wire visual Y
    const x0 = isLeft ? TR.LEFT_RAIL_X + 2 : TR.RIGHT_RAIL_X - 2;
    const xEnd = isLeft ? TR.LEFT_WIRE_END  : TR.RIGHT_WIRE_START;
    const branchX = isLeft ? TR.LEFT_WIRE_END - 10 : TR.RIGHT_WIRE_START + 10;
    const wireColor = TR.WIRE_COLOR;
    const splitColor = TR.YELLOW;

    if (isWireDead(w)) {
      const dx = isLeft ? TR.LEFT_WIRE_END - 30 : TR.RIGHT_WIRE_START + 30;
      ctx.fillStyle = wireColor;
      const a = Math.min(x0, dx), b = Math.max(x0, dx);
      ctx.fillRect(a, wy - 1, b - a, 2);
      // Terminator triangle: points BACK toward the rail (← on left,
      // → on right). Wire physically stops here. Symmetric 6×6.
      const dir = isLeft ? -1 : 1;
      ctx.fillStyle = splitColor;
      ctx.beginPath();
      ctx.moveTo(dx, wy - 3);
      ctx.lineTo(dx + 6 * dir, wy);
      ctx.lineTo(dx, wy + 3);
      ctx.closePath();
      ctx.fill();
      return;
    }

    const isSplitter = w.pins.length > 1;
    const needsJog = isSplitter ||
                     (w.pins.length === 1 && pinY(w.pins[0]) !== eY);
    const mainEndX = needsJog ? branchX : xEnd;

    // Main horizontal at the wire's entry Y (centre of bridge for splitters)
    ctx.fillStyle = wireColor;
    const mA = Math.min(x0, mainEndX), mB = Math.max(x0, mainEndX);
    ctx.fillRect(mA, eY - 1, mB - mA, 2);

    if (needsJog) {
      let minY = eY, maxY = eY;
      for (let i = 0; i < w.pins.length; i++) {
        const py = pinY(w.pins[i]);
        if (py < minY) minY = py;
        if (py > maxY) maxY = py;
      }
      if (isSplitter) {
        ctx.fillStyle = splitColor;
        ctx.fillRect(branchX - 2, minY - 2, 4, (maxY - minY) + 4);
      } else {
        ctx.fillStyle = wireColor;
        ctx.fillRect(branchX - 1, minY, 2, (maxY - minY));
      }
      ctx.fillStyle = wireColor;
      for (let i = 0; i < w.pins.length; i++) {
        const py = pinY(w.pins[i]);
        const bA = Math.min(branchX, xEnd), bB = Math.max(branchX, xEnd);
        ctx.fillRect(bA, py - 1, bB - bA, 2);
      }
    }

    // Diodes and color-locks along the main horizontal (at entry Y)
    let eX = isLeft ? TR.LEFT_RAIL_X + 22 : TR.RIGHT_RAIL_X - 22;
    const step = isLeft ? 24 : -24;
    for (let i = 0; i < w.elements.length; i++) {
      const el = w.elements[i];
      if (el.type === "DIODE") {
        const dir = isLeft ? 1 : -1;
        ctx.fillStyle = splitColor;
        ctx.beginPath();
        ctx.moveTo(eX - 2 * dir, eY - 3);
        ctx.lineTo(eX + 3 * dir, eY);
        ctx.lineTo(eX - 2 * dir, eY + 3);
        ctx.closePath();
        ctx.fill();
        eX += step;
      } else if (el.type === "LOCK") {
        ctx.fillStyle = "#000000";
        ctx.fillRect(eX - 4, eY - 4, 8, 8);
        ctx.fillStyle = (el.color === "yellow") ? TR.YELLOW : TR.PURPLE;
        ctx.fillRect(eX - 3, eY - 3, 6, 6);
        eX += step;
      }
    }
  }

  function drawTransfer() {
    // Background
    clear(TR.BG);

    // Header bar — white plate with dark text. During side-selection
    // the centre prompts for input; otherwise it shows the logo.
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(4, 2, W - 8, 14);
    drawText(transfer.deadlocked ? "DEADLOCK" : "TRANSFER",
             10, 6, 1, TR.BG_DARK);
    if (transfer.phase === "select") {
      drawText("CHOOSE SIDE < OR >", 100, 6, 1, TR.BG_DARK);
    } else {
      drawText("PARADROID", 124, 6, 1, TR.BG_DARK);
    }
    const tsec = Math.max(0, Math.ceil(transfer.timer / 60));
    drawText("TIME " + tsec, 264, 6, 1, TR.BG_DARK);

    // Rails
    ctx.fillStyle = TR.RAIL_HI;
    ctx.fillRect(TR.LEFT_RAIL_X - 3, TR.BOARD_Y0 + 4, 4, TR.BOARD_Y1 - TR.BOARD_Y0 - 8);
    ctx.fillStyle = TR.RAIL_OPP;
    ctx.fillRect(TR.RIGHT_RAIL_X - 1, TR.BOARD_Y0 + 4, 4, TR.BOARD_Y1 - TR.BOARD_Y0 - 8);

    // Wires
    for (let i = 0; i < TR.WIRES; i++) {
      drawWireRoute("left",  i, transfer.leftWires[i]);
      drawWireRoute("right", i, transfer.rightWires[i]);
    }

    // Chip body
    ctx.fillStyle = "#000000";
    ctx.fillRect(TR.CHIP_X - 2, TR.BOARD_Y0 + 4, TR.CHIP_W + 4, TR.BOARD_Y1 - TR.BOARD_Y0 - 8);

    // Winner header: a colored bar at the top of the chip body that
    // shows who is currently winning on pins. Black if tied.
    let yc = 0, pc = 0;
    for (let i = 0; i < TR.PINS; i++) {
      if (transfer.pins[i].color === "yellow") yc++;
      else if (transfer.pins[i].color === "purple") pc++;
    }
    let winCol = "#000000";
    if (yc > pc) winCol = TR.YELLOW;
    else if (pc > yc) winCol = TR.PURPLE;
    ctx.fillStyle = winCol;
    ctx.fillRect(TR.CHIP_X + 2, TR.BOARD_Y0 + 6, TR.CHIP_W - 4, 10);
    // Pin segments
    for (let i = 0; i < TR.PINS; i++) {
      const py = pinY(i);
      const pin = transfer.pins[i];
      ctx.fillStyle = pin.color === "yellow" ? TR.YELLOW : TR.PURPLE;
      ctx.fillRect(TR.CHIP_X + TR.CHIP_INSET, py - 4, TR.CHIP_W - TR.CHIP_INSET * 2, 8);
      // Pin connection triangles on each side of chip
      ctx.fillStyle = TR.YELLOW;
      ctx.beginPath();
      ctx.moveTo(TR.CHIP_X - 2, py);
      ctx.lineTo(TR.CHIP_X + 2, py - 3);
      ctx.lineTo(TR.CHIP_X + 2, py + 3);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = TR.PURPLE;
      ctx.beginPath();
      ctx.moveTo(TR.CHIP_X + TR.CHIP_W + 2, py);
      ctx.lineTo(TR.CHIP_X + TR.CHIP_W - 2, py - 3);
      ctx.lineTo(TR.CHIP_X + TR.CHIP_W - 2, py + 3);
      ctx.closePath();
      ctx.fill();
    }

    // Cursors + charge stacks — only after side selection.
    if (transfer.phase !== "select") {
      const pIsLeft = (transfer.playerSide === "left");
      const oIsLeft = !pIsLeft;
      // Player cursor — hidden once out of charges
      if (transfer.playerCharges > 0) {
        const cwy = wireEntryY(transfer.cursor, pIsLeft);
        ctx.fillStyle = pIsLeft ? TR.YELLOW : TR.PURPLE;
        const pAx = pIsLeft ? TR.LEFT_RAIL_X - 8 : TR.RIGHT_RAIL_X + 8;
        const pTx = pIsLeft ? TR.LEFT_RAIL_X - 4 : TR.RIGHT_RAIL_X + 4;
        ctx.beginPath();
        ctx.moveTo(pAx, cwy - 3); ctx.lineTo(pTx, cwy); ctx.lineTo(pAx, cwy + 3);
        ctx.closePath(); ctx.fill();
      }
      // Opponent cursor — hidden once they're out of charges
      if (transfer.oppCharges > 0) {
        const owy = wireEntryY(transfer.oppCursor, oIsLeft);
        ctx.fillStyle = oIsLeft ? TR.YELLOW : TR.PURPLE;
        const oAx = oIsLeft ? TR.LEFT_RAIL_X - 8 : TR.RIGHT_RAIL_X + 8;
        const oTx = oIsLeft ? TR.LEFT_RAIL_X - 4 : TR.RIGHT_RAIL_X + 4;
        ctx.beginPath();
        ctx.moveTo(oAx, owy - 3); ctx.lineTo(oTx, owy); ctx.lineTo(oAx, owy + 3);
        ctx.closePath(); ctx.fill();
      }
    }

    // Energized wires — persistent flow animation.
    drawEnergizedWires();

    // Charge stacks — player's on their side, AI's on the other.
    if (transfer.phase !== "select") {
      drawChargeStack(playerColorStr(), transfer.playerCharges);
      drawChargeStack(oppColorStr(), transfer.oppCharges);
    }

    // (Side-selection prompt now lives in the header bar above.)

    // Footer intentionally empty — charges live in the `>` stacks
    // beside the cursors; time and header are at the top.

    // Result overlay
    if (transfer.result !== null) {
      ctx.fillStyle = "rgba(0,0,0,0.82)";
      ctx.fillRect(60, 78, 200, 50);
      let txt = "TRANSFER COMPLETE";
      let col = "#FFFFFF";
      if (transfer.result === "win")  { txt = "TRANSFER SUCCESS"; col = TR.YELLOW; }
      if (transfer.result === "loss") { txt = "TRANSFER FAILED";  col = C64.LIGHT_RED; }
      if (transfer.result === "tie")  { txt = "DEADLOCK";         col = "#FFFFFF"; }
      drawTextCentered(txt, 90, 1, col);
      if (transfer.resultHoldFrame > 30 && Math.floor(transfer.resultHoldFrame / 30) % 2 === 0) {
        drawTextCentered("SPACE OR ESC", 110, 1, C64.LIGHT_GREY);
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Update (movement + collision)
  // ─────────────────────────────────────────────────────────────
  function canStandAt(cx, cy, halfSize, ignore) {
    const r = (halfSize !== undefined) ? halfSize : player.halfSize;
    // Walls
    if (!isWalkable(tileAt(currentDeck, cx - r, cy - r))) return false;
    if (!isWalkable(tileAt(currentDeck, cx + r, cy - r))) return false;
    if (!isWalkable(tileAt(currentDeck, cx - r, cy + r))) return false;
    if (!isWalkable(tileAt(currentDeck, cx + r, cy + r))) return false;
    // Other entities (mutual collision between droids)
    if (ignore !== player) {
      const dx = cx - player.x, dy = cy - player.y;
      const pr = r + player.halfSize;
      if (Math.abs(dx) < pr && Math.abs(dy) < pr) return false;
    }
    for (let i = 0; i < enemies.length; i++) {
      const e = enemies[i];
      if (e === ignore) continue;
      const dx = cx - e.x, dy = cy - e.y;
      const er = r + e.halfSize;
      if (Math.abs(dx) < er && Math.abs(dy) < er) return false;
    }
    return true;
  }

  function updatePlayer() {
    let dx = 0, dy = 0;
    if (keys["ArrowLeft"]  || keys["a"]) dx -= 1;
    if (keys["ArrowRight"] || keys["d"]) dx += 1;
    if (keys["ArrowUp"]    || keys["w"]) dy -= 1;
    if (keys["ArrowDown"]  || keys["s"]) dy += 1;

    if (dx !== 0 || dy !== 0) {
      player.facingX = dx;
      player.facingY = dy;
    }

    let tvx = dx * MAX_SPEED;
    let tvy = dy * MAX_SPEED;
    if (dx !== 0 && dy !== 0) { tvx *= 0.71; tvy *= 0.71; }

    player.vx += (tvx - player.vx) * ACCEL;
    player.vy += (tvy - player.vy) * ACCEL;
    if (Math.abs(player.vx) < DRAG_STOP && dx === 0) player.vx = 0;
    if (Math.abs(player.vy) < DRAG_STOP && dy === 0) player.vy = 0;

    if (player.vx !== 0) {
      if (canStandAt(player.x + player.vx, player.y, player.halfSize, player)) player.x += player.vx;
      else player.vx = 0;
    }
    if (player.vy !== 0) {
      if (canStandAt(player.x, player.y + player.vy, player.halfSize, player)) player.y += player.vy;
      else player.vy = 0;
    }

    // Firing — each shot drains 1 charge. No charges, no shot.
    if (player.fireCooldown > 0) player.fireCooldown--;
    if (keys[" "] && player.fireCooldown === 0 && player.charges > 0) {
      fireBullet(player.x, player.y, player.facingX, player.facingY);
      player.charges--;
      player.fireCooldown = WEAK_LASER_COOLDOWN;
    }
  }

  function pickNextWaypoint(enemy, deck) {
    const wp = deck.waypoints[enemy.currentWP];
    const opts = wp.neighbors;
    if (opts.length === 0) return -1;
    if (opts.length === 1) return opts[0];
    // Prefer not to immediately backtrack
    const filtered = opts.filter(function (n) { return n !== enemy.prevWP; });
    const pool = filtered.length > 0 ? filtered : opts;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  function updateEnemy(enemy) {
    const deck = currentDeck;
    if (enemy.currentWP < 0) enemy.currentWP = nearestWaypoint(deck, enemy.x, enemy.y);
    if (enemy.targetWP < 0) enemy.targetWP = pickNextWaypoint(enemy, deck);
    if (enemy.targetWP < 0) return;

    const t = deck.waypoints[enemy.targetWP];
    const dx = t.x - enemy.x;
    const dy = t.y - enemy.y;
    const dist = Math.hypot(dx, dy);
    if (dist < 2) {
      enemy.prevWP = enemy.currentWP;
      enemy.currentWP = enemy.targetWP;
      enemy.targetWP = -1;
      enemy.stuckFrames = 0;
      return;
    }

    const step = Math.min(enemy.speed, dist);
    const mx = (dx / dist) * step;
    const my = (dy / dist) * step;
    let moved = false;
    if (canStandAt(enemy.x + mx, enemy.y, enemy.halfSize, enemy)) { enemy.x += mx; moved = true; }
    if (canStandAt(enemy.x, enemy.y + my, enemy.halfSize, enemy)) { enemy.y += my; moved = true; }

    // If wedged for too long (likely blocked by another droid), abandon this leg
    if (!moved) enemy.stuckFrames++;
    else        enemy.stuckFrames = 0;
    if (enemy.stuckFrames > 60) {
      enemy.targetWP = -1;
      enemy.stuckFrames = 0;
    }
  }

  function updateBullets() {
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      // Wall collision
      if (!isWalkable(tileAt(currentDeck, b.x, b.y)) || b.life <= 0) {
        bullets.splice(i, 1);
        continue;
      }

      // Enemy collision
      let hit = false;
      for (let j = 0; j < enemies.length; j++) {
        const e = enemies[j];
        const r = e.halfSize + 2;     // generous hit radius
        if (Math.abs(b.x - e.x) < r && Math.abs(b.y - e.y) < r) {
          e.charges -= b.damage;
          if (e.charges <= 0) enemies.splice(j, 1);
          hit = true;
          break;
        }
      }
      if (hit) bullets.splice(i, 1);
    }
  }

  function update() {
    if (state === "playing") {
      updatePlayer();
      for (let i = 0; i < enemies.length; i++) updateEnemy(enemies[i]);
      updateBullets();
    } else if (state === "transfer") {
      updateTransfer();
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Transfer mini-game logic
  // ─────────────────────────────────────────────────────────────
  function enterTransfer(targetNum, targetTier) {
    transfer.playerNum = player.num;
    transfer.playerCharges = player.maxCharges;
    transfer.playerMaxCharges = player.maxCharges;
    transfer.oppNum = targetNum || "123";
    transfer.oppTier = targetTier || 1;
    // 123 = 8 charges per Jason's roster; later we'll look up by num.
    transfer.oppCharges = 8;
    transfer.oppMaxCharges = 8;
    const c = generateCircuit();
    transfer.leftWires = c.leftWires;
    transfer.rightWires = c.rightWires;
    transfer.leftEnergy = new Array(TR.WIRES).fill(null);
    transfer.rightEnergy = new Array(TR.WIRES).fill(null);
    transfer.leftEnergyExpiry = new Array(TR.WIRES).fill(0);
    transfer.rightEnergyExpiry = new Array(TR.WIRES).fill(0);
    transfer.pendingFlips = [];
    // Initial pin colors — half yellow, half purple, randomly placed
    transfer.pins = [];
    const colors = [];
    for (let i = 0; i < TR.PINS; i++) colors.push(i < TR.PINS / 2 ? "yellow" : "purple");
    for (let i = colors.length - 1; i > 0; i--) {
      const j = Math.floor(rng() * (i + 1));
      const t = colors[i]; colors[i] = colors[j]; colors[j] = t;
    }
    for (let i = 0; i < TR.PINS; i++) transfer.pins.push({ color: colors[i] });
    transfer.phase = "select";
    transfer.playerSide = "left";
    transfer.cursor = 0;
    transfer.oppCursor = 0;
    transfer.sparks.length = 0;
    transfer.fireCooldown = 0;
    transfer.aiNextFireFrame = frame + 60;
    transfer.timer = TR.TIME_LIMIT;
    transfer.result = null;
    transfer.resultHoldFrame = 0;
    transfer.deadlocked = false;
    for (const k in keys) keys[k] = false;
    state = "transfer";
  }

  // Helpers — color/side mapping. "yellow" = left rail, "purple" = right.
  function playerColorStr() { return transfer.playerSide === "left" ? "yellow" : "purple"; }
  function oppColorStr()    { return transfer.playerSide === "left" ? "purple" : "yellow"; }
  function oppSideStr()     { return transfer.playerSide === "left" ? "right" : "left"; }

  function commitSide(side) {
    transfer.playerSide = side;
    transfer.phase = "playing";
    transfer.cursor = 0;
    transfer.oppCursor = Math.floor(rng() * TR.WIRES);
    transfer.aiNextFireFrame = frame + 60;
  }

  function leaveTransfer() {
    for (const k in keys) keys[k] = false;
    state = currentDeck ? "playing" : "title";
  }

  // Fire a charge along a side's wire. Each fire costs one charge;
  // wires can be fired more than once.
  //   • If the wire has a `>` (DIODE pass-through), energy is
  //     permanent — flow continues for the rest of the round.
  //   • If the wire has no `>`, energy lasts 6 seconds, then stops.
  // Pin color flips after a short travel delay so you see the
  // connection moment land.
  const FLIP_DELAY = 50;             // frames between fire and pin flip
  const TEMP_ENERGY_FRAMES = 360;    // 6 seconds @ 60fps
  function wireHasDiode(w) {
    for (let i = 0; i < w.elements.length; i++) {
      if (w.elements[i].type === "DIODE") return true;
    }
    return false;
  }
  function fireWire(side, wireIndex) {
    const isLeft = (side === "yellow");
    const wires = isLeft ? transfer.leftWires : transfer.rightWires;
    const energy = isLeft ? transfer.leftEnergy : transfer.rightEnergy;
    const expiry = isLeft ? transfer.leftEnergyExpiry : transfer.rightEnergyExpiry;
    const w = wires[wireIndex];
    if (!w) return false;
    const color = w.colorLock || side;
    energy[wireIndex] = color;
    expiry[wireIndex] = wireHasDiode(w) ? Infinity : (frame + TEMP_ENERGY_FRAMES);
    for (let i = 0; i < w.pins.length; i++) {
      transfer.pendingFlips.push({
        pin: w.pins[i], color: color, atFrame: frame + FLIP_DELAY
      });
    }
    return true;
  }

  // AI: pick the wire that would flip the most pins toward AI's color.
  // Wires are re-firable, but the AI prefers wires not already
  // energized in its color (no point doubling up).
  function aiPickWire(aiSide) {
    const tier = transfer.oppTier;
    const wires  = (aiSide === "yellow") ? transfer.leftWires : transfer.rightWires;
    const energy = (aiSide === "yellow") ? transfer.leftEnergy : transfer.rightEnergy;
    const expiry = (aiSide === "yellow") ? transfer.leftEnergyExpiry : transfer.rightEnergyExpiry;
    const enemyColor = (aiSide === "yellow") ? "purple" : "yellow";
    let bestIdx = -1;
    let bestScore = -Infinity;
    for (let i = 0; i < TR.WIRES; i++) {
      const w = wires[i];
      if (isWireDead(w)) {
        if (tier <= 2 && rng() < 0.3) return i;
        continue;
      }
      const effectiveColor = w.colorLock || aiSide;
      let score = 0;
      for (let j = 0; j < w.pins.length; j++) {
        const pin = transfer.pins[w.pins[j]];
        if (pin.color !== effectiveColor) score++;
        if (tier >= 5 && w.colorLock === enemyColor) score -= 3;
      }
      if (energy[i] === aiSide && expiry[i] > frame + 60) score -= 2;
      score += rng() * (11 - tier);
      if (score > bestScore) { bestScore = score; bestIdx = i; }
    }
    return bestIdx;
  }

  function updateTransfer() {
    if (transfer.phase === "select") return;          // waiting for side pick
    if (transfer.result !== null) {
      transfer.resultHoldFrame++;
      return;
    }

    // Player firing is press-discrete (handled in onKeyDown). The
    // cooldown is only needed if we ever want held-fire later.
    if (transfer.fireCooldown > 0) transfer.fireCooldown--;

    // Opponent AI firing — picks best wire on AI's side
    if (transfer.oppCharges > 0 && frame >= transfer.aiNextFireFrame) {
      const aiSide = oppColorStr();
      const idx = aiPickWire(aiSide);
      if (idx >= 0) {
        transfer.oppCursor = idx;
        if (fireWire(aiSide, idx)) {
          transfer.oppCharges--;
          const lo = TR.AI_THINK_MIN, hi = TR.AI_THINK_MAX;
          const factor = 1 - Math.min(1, transfer.oppTier / 10) * 0.5;
          transfer.aiNextFireFrame = frame + Math.floor((lo + rng() * (hi - lo)) * factor);
        }
      }
    }

    // Process pending pin flips (travel delay)
    for (let i = transfer.pendingFlips.length - 1; i >= 0; i--) {
      const f = transfer.pendingFlips[i];
      if (frame >= f.atFrame) {
        transfer.pins[f.pin].color = f.color;
        transfer.pendingFlips.splice(i, 1);
      }
    }
    // De-energize wires whose temporary pulse has expired
    for (let i = 0; i < TR.WIRES; i++) {
      if (transfer.leftEnergy[i]  && frame >= transfer.leftEnergyExpiry[i]) {
        transfer.leftEnergy[i] = null;
      }
      if (transfer.rightEnergy[i] && frame >= transfer.rightEnergyExpiry[i]) {
        transfer.rightEnergy[i] = null;
      }
    }

    // End conditions — both sides spent + no flips still queued
    transfer.timer--;
    const bothEmpty = transfer.playerCharges === 0 && transfer.oppCharges === 0 &&
                       transfer.pendingFlips.length === 0;
    if (transfer.timer <= 0 || bothEmpty) {
      const pc = playerColorStr();
      const oc = oppColorStr();
      let pCount = 0, oCount = 0;
      for (let i = 0; i < TR.PINS; i++) {
        if (transfer.pins[i].color === pc) pCount++;
        else if (transfer.pins[i].color === oc) oCount++;
      }
      if (pCount > oCount) transfer.result = "win";
      else if (oCount > pCount) transfer.result = "loss";
      else { transfer.result = "tie"; transfer.deadlocked = true; }
    }
  }

  function tick() {
    update();
    render();
    rafId = requestAnimationFrame(tick);
  }

  // ─────────────────────────────────────────────────────────────
  // State transitions
  // ─────────────────────────────────────────────────────────────
  function enterGame() {
    currentDeck = buildDeck1();
    player.x = currentDeck.playerStart.x;
    player.y = currentDeck.playerStart.y;
    player.vx = 0; player.vy = 0;
    player.facingX = 0; player.facingY = -1;
    player.charges = player.maxCharges;
    player.fireCooldown = 0;
    bullets.length = 0;
    enemies.length = 0;

    // Milestone 2: one 123 Disposal droid (8 charges) in the top-middle room.
    enemies.push(spawnEnemy("123", 228, 48, 8, 0.8));

    for (const k in keys) keys[k] = false;
    state = "playing";
  }
  function leaveToTitle() {
    for (const k in keys) keys[k] = false;
    state = "title";
  }

  function openModal() {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!rafId) rafId = requestAnimationFrame(tick);
  }
  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    for (const k in keys) keys[k] = false;
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ─────────────────────────────────────────────────────────────
  // Input
  // ─────────────────────────────────────────────────────────────
  const MOVE_KEYS = ["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","a","d","w","s","A","D","W","S"," "];

  function onKeyDown(e) {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") {
      if (state === "transfer") leaveTransfer();
      else if (state === "playing") leaveToTitle();
      else closeModal();
      e.preventDefault();
      return;
    }
    if (state === "title" && (e.key === " " || e.key === "Enter")) {
      enterGame();
      e.preventDefault();
      return;
    }
    // Debug hook: T during gameplay opens the transfer mini-game
    // standalone against a 123. Real wiring lands in Milestone 4.
    if (state === "playing" && (e.key === "t" || e.key === "T")) {
      enterTransfer("123", 1);
      e.preventDefault();
      return;
    }
    // Transfer end screen: Space or Esc dismisses (Esc is handled above)
    if (state === "transfer" && transfer.result !== null && transfer.resultHoldFrame > 30) {
      if (e.key === " " || e.key === "Enter") {
        leaveTransfer();
        e.preventDefault();
        return;
      }
    }
    // Pre-match side selection
    if (state === "transfer" && transfer.phase === "select") {
      if (e.key === "ArrowLeft" || e.key === "a" || e.key === "A") {
        commitSide("left");
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowRight" || e.key === "d" || e.key === "D") {
        commitSide("right");
        e.preventDefault();
        return;
      }
    }
    // Transfer cursor / fire — only during play
    if (state === "transfer" && transfer.phase === "playing") {
      if (e.key === "ArrowUp" || e.key === "w" || e.key === "W") {
        if (transfer.cursor > 0) transfer.cursor--;
        e.preventDefault();
        return;
      }
      if (e.key === "ArrowDown" || e.key === "s" || e.key === "S") {
        if (transfer.cursor < TR.WIRES - 1) transfer.cursor++;
        e.preventDefault();
        return;
      }
      if (e.key === " ") {
        // Discrete press — fires one charge along the cursor's wire
        // on the player's chosen side.
        if (transfer.playerCharges > 0) {
          if (fireWire(playerColorStr(), transfer.cursor)) {
            transfer.playerCharges--;
          }
        }
        e.preventDefault();
        return;
      }
    }
    if (state === "playing" && MOVE_KEYS.indexOf(e.key) !== -1) {
      keys[e.key.toLowerCase ? e.key.toLowerCase() : e.key] = true;
      keys[e.key] = true;
      e.preventDefault();
    }
  }
  function onKeyUp(e) {
    if (MOVE_KEYS.indexOf(e.key) !== -1) {
      keys[e.key.toLowerCase ? e.key.toLowerCase() : e.key] = false;
      keys[e.key] = false;
    }
  }

  // Wiring
  document.querySelectorAll("[data-canvas-game='paradroid']").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  modal.querySelectorAll("[data-pd-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("keyup", onKeyUp);
})();
