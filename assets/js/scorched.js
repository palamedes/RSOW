(function () {
  "use strict";

  const modal = document.getElementById("scorched-modal");
  const canvas = document.getElementById("sc-canvas");
  if (!modal || !canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const overlay = document.getElementById("sc-overlay");
  const overlayTitle = document.getElementById("sc-overlay-title");
  const overlayMsg = document.getElementById("sc-overlay-msg");
  const angleInput = document.getElementById("sc-angle");
  const powerInput = document.getElementById("sc-power");
  const angleVal = document.getElementById("sc-angle-val");
  const powerVal = document.getElementById("sc-power-val");
  const weaponSel = document.getElementById("sc-weapon");
  const fireBtn = document.getElementById("sc-fire");
  const turnChip = document.getElementById("sc-turn-chip");
  const windChip = document.getElementById("sc-wind-chip");
  const hpEls = [document.getElementById("sc-hp-p1"), document.getElementById("sc-hp-p2")];
  const optPlayers = document.getElementById("sc-opt-players");
  const optDifficulty = document.getElementById("sc-opt-difficulty");
  const optDifficultyRow = document.querySelector(".sc-opt-difficulty-row");
  const optMatchLength = document.getElementById("sc-opt-match-length");
  const roundChip = document.getElementById("sc-round-chip");
  const cashChip = document.getElementById("sc-cash-chip");
  const shopEl = document.getElementById("sc-shop");
  const shopTitle = document.getElementById("sc-shop-title");
  const shopCash = document.getElementById("sc-shop-cash");
  const shopWeaponsList = document.getElementById("sc-shop-weapons");
  const shopDefensesList = document.getElementById("sc-shop-defenses");
  const shopDoneBtn = document.getElementById("sc-shop-done");
  const shopHint = document.getElementById("sc-shop-hint");

  const GRAVITY = 0.12;
  const WIND_ACCEL = 0.003;
  const TANK_HALFW = 4;
  const TANK_BODY_H = 3;
  const TANK_TURRET_LEN = 5;
  const MAX_HP = 100;

  function powerToSpeed(p) { return p / 100 * 12 + 1; }

  const WEAPONS = {
    // Standard explosives
    baby:        { name: "Baby Missile", kind: "explosive", radius: 11, maxDamage: 24, trail: "#ffe082", price: 0,     free: true },
    missile:     { name: "Missile",      kind: "explosive", radius: 22, maxDamage: 42, trail: "#ffe082", price: 1000 },
    babyNuke:    { name: "Baby Nuke",    kind: "explosive", radius: 42, maxDamage: 65, trail: "#ffb87a", price: 3000 },
    nuke:        { name: "Nuke",         kind: "explosive", radius: 70, maxDamage: 90, trail: "#ff9670", price: 20000 },
    plastique:   { name: "Plastique",    kind: "explosive", radius: 32, maxDamage: 58, trail: "#ffd95e", price: 1500 },
    // Multi-warhead splitters
    mirv:        { name: "MIRV",         kind: "split", count: 3, child: "missile",  fuseY: 0.55, spread: 4.5, trail: "#ffe082", price: 12000 },
    deathsHead:  { name: "Death's Head", kind: "split", count: 5, child: "babyNuke", fuseY: 0.45, spread: 5.5, trail: "#ffb87a", price: 50000 },
    funkyBomb:   { name: "Funky Bomb",   kind: "split", count: 8, child: "baby",     fuseY: 0.50, spread: 7.0, trail: "#ffd95e", price: 5000 },
    // Rollers — bounce along terrain after impact
    babyRoller:  { name: "Baby Roller",  kind: "roller", radius: 14, maxDamage: 28, trail: "#cccccc", price: 1500 },
    roller:      { name: "Roller",       kind: "roller", radius: 24, maxDamage: 48, trail: "#cccccc", price: 6000 },
    heavyRoller: { name: "Heavy Roller", kind: "roller", radius: 38, maxDamage: 70, trail: "#cccccc", price: 18000 },
    // Special
    leapfrog:    { name: "Leapfrog",     kind: "leapfrog", bounces: 1, radius: 22, maxDamage: 45, trail: "#a5e0ff", price: 8000 },
    tunneler:    { name: "Tunneler",     kind: "tunnel", radius: 11, maxDamage: 35, tunnelDist: 90, trail: "#c5a880", price: 1200 },
    napalm:      { name: "Napalm",       kind: "napalm", radius: 8, maxDamage: 6, lifeFrames: 110, trail: "#ff7a4d", price: 6000 },
    // Utility / no-damage
    tracer:      { name: "Tracer",       kind: "tracer", radius: 0, maxDamage: 0, trail: "#ffffff", price: 200 },
    dirtClod:    { name: "Dirt Clod",    kind: "dirt",   radius: 18, trail: "#a37548", price: 200 },
    liquidDirt:  { name: "Liquid Dirt",  kind: "dirt",   radius: 36, trail: "#a37548", price: 2000 },
    sandbag:     { name: "Sandbag",      kind: "dirt",   radius: 14, trail: "#c4ad6e", price: 100 }
  };

  const DEFENSES = {
    magShield:    { name: "Magnetic Shield",  kind: "shield",    price: 2000,  energy: 40 },
    magDeflector: { name: "Mag Deflector",    kind: "shield",    price: 6000,  energy: 80 },
    heavyShield:  { name: "Heavy Shield",     kind: "shield",    price: 18000, energy: 160 },
    superMag:     { name: "Super Magnetic",   kind: "shield",    price: 40000, energy: 300 },
    parachute:    { name: "Parachute",        kind: "parachute", price: 800 },
    battery:      { name: "Battery (refill)", kind: "battery",   price: 2000 }
  };

  const SHOP_ORDER = ["baby", "missile", "babyNuke", "nuke", "plastique",
                      "mirv", "deathsHead", "funkyBomb",
                      "babyRoller", "roller", "heavyRoller",
                      "leapfrog", "tunneler", "napalm",
                      "tracer", "dirtClod", "liquidDirt", "sandbag"];
  const DEFENSE_ORDER = ["magShield", "magDeflector", "heavyShield", "superMag", "parachute", "battery"];

  const STARTING_CASH = 10000;
  const BANK_KEY = "rsow.scorched.bank";

  function loadBank() {
    try {
      const raw = localStorage.getItem(BANK_KEY);
      if (raw == null) return STARTING_CASH;
      const n = parseInt(raw, 10);
      return isFinite(n) && n >= 0 ? n : STARTING_CASH;
    } catch (e) { return STARTING_CASH; }
  }

  function saveBank(amount) {
    try { localStorage.setItem(BANK_KEY, String(Math.max(0, Math.round(amount)))); } catch (e) {}
  }

  function persistP1Cash() {
    if (tanks[0] && !tanks[0].isAI) saveBank(tanks[0].cash);
  }

  let terrain = null;
  let tanks = [];
  let wind = 0;
  let turn = 0;
  let projectiles = [];
  let explosions = [];
  let effects = [];
  let particles = [];
  let inputLocked = false;
  let shotResolved = true;
  let lastAIShot = null;
  let lastLanding = null;
  let rafId = null;
  let gameDone = false;
  let gameStarted = false;

  const settings = { players: 1, difficulty: "shooter", matchLength: 3 };

  // Match state lives across rounds.
  const match = {
    active: false,
    totalRounds: 3,
    roundsToWin: 2,
    currentRound: 0,    // round about to be played (1-indexed once active)
    score: [0, 0],
    shopperIdx: 0       // who is currently shopping
  };

  // ---------- terrain ----------
  function genTerrain() {
    const t = new Float32Array(W);
    const base = H * 0.72;
    const amp = H * 0.22;
    // Sum a few sine waves at different phases for smooth rolling hills.
    const layers = [
      { f: (1 / W) * Math.PI * 1.3, a: amp * 0.55, p: Math.random() * Math.PI * 2 },
      { f: (1 / W) * Math.PI * 3.1, a: amp * 0.25, p: Math.random() * Math.PI * 2 },
      { f: (1 / W) * Math.PI * 6.7, a: amp * 0.12, p: Math.random() * Math.PI * 2 },
      { f: (1 / W) * Math.PI * 11.0, a: amp * 0.06, p: Math.random() * Math.PI * 2 }
    ];
    for (let x = 0; x < W; x++) {
      let y = base;
      for (let l = 0; l < layers.length; l++) {
        y -= Math.sin(x * layers[l].f + layers[l].p) * layers[l].a;
      }
      t[x] = clamp(y, H * 0.25, H - 8);
    }
    return t;
  }

  function clamp(v, lo, hi) { return v < lo ? lo : (v > hi ? hi : v); }

  function terrainY(x) {
    const xi = clamp(Math.round(x), 0, W - 1);
    return terrain[xi];
  }

  function settleTanks() {
    for (const t of tanks) {
      if (t.hp <= 0) continue;
      const left = clamp(Math.round(t.x) - TANK_HALFW, 0, W - 1);
      const right = clamp(Math.round(t.x) + TANK_HALFW, 0, W - 1);
      let minY = H;
      for (let x = left; x <= right; x++) {
        if (terrain[x] < minY) minY = terrain[x];
      }
      // Tank rests with bottom of body on terrain.
      const targetY = minY;
      if (Math.abs(targetY - t.y) > 0.5) {
        // Fall damage: any drop > 24px hurts, unless a parachute auto-deploys.
        const drop = targetY - t.y;
        if (drop > 24) {
          if (t.parachutes > 0) {
            t.parachutes--;
          } else {
            const dmg = Math.min(60, Math.floor((drop - 24) * 0.8));
            // Self-attribution (no attackerIdx) — pure fall damage doesn't pay.
            applyDamage(t, dmg, -1);
          }
        }
        t.y = targetY;
      }
    }
  }

  function carveCrater(cx, cy, r) {
    const left = clamp(Math.round(cx - r), 0, W - 1);
    const right = clamp(Math.round(cx + r), 0, W - 1);
    for (let x = left; x <= right; x++) {
      const dx = x - cx;
      const half = Math.sqrt(Math.max(0, r * r - dx * dx));
      const top = cy - half;
      const bot = cy + half;
      // Only carve if the crater intersects existing ground.
      if (bot < terrain[x]) continue;
      // New ground level is max(existing, bottom of crater).
      const newTop = Math.max(terrain[x], bot);
      terrain[x] = Math.min(H, newTop);
    }
  }

  // ---------- tanks ----------
  function freshTank(name, color, isAI, aiTier, defaultAngle, startingCash) {
    return {
      x: 0, y: 0, hp: MAX_HP,
      color: color, name: name,
      isAI: isAI, aiTier: aiTier,
      aim: { angle: defaultAngle, power: 55 },
      napalmFrames: 0,
      cash: startingCash,
      ammo: {},                  // weaponKey -> count
      shieldMax: 0,
      shieldEnergy: 0,
      parachutes: 0,
      damageThisRound: 0
    };
  }

  function newMatchTanks() {
    const twoPlayer = settings.players === 2;
    // Persistent bank only applies in 1P mode. 2P hot-seat is a fresh start for both.
    const p1Cash = twoPlayer ? STARTING_CASH : loadBank();
    tanks = [
      freshTank("P1", "#5bd28a", false, null, 45, p1Cash),
      freshTank(twoPlayer ? "P2" : "CPU", "#ff6b6b", !twoPlayer, twoPlayer ? null : settings.difficulty, 135, STARTING_CASH)
    ];
  }

  function placeTanks() {
    // Spawn tanks near the canvas edges so the playfield feels wide.
    const xs = [
      W * 0.04 + Math.random() * (W * 0.10),
      W * 0.86 + Math.random() * (W * 0.10)
    ];
    for (let i = 0; i < tanks.length; i++) {
      tanks[i].x = xs[i];
      tanks[i].y = terrainY(xs[i]);
      tanks[i].hp = MAX_HP;
      tanks[i].napalmFrames = 0;
      tanks[i].damageThisRound = 0;
      // Shield energy carries between rounds — buy batteries to refill it.
    }
  }

  // ---------- rendering ----------
  function draw() {
    ctx.clearRect(0, 0, W, H);
    drawSky();
    drawTerrain();
    for (const t of tanks) drawTank(t);
    for (const p of projectiles) drawProjectile(p);
    for (const e of explosions) drawExplosion(e);
    drawEffects();
    drawParticles();
    drawAimGuide();
    drawWindArrow();
  }

  function drawEffects() {
    for (const e of effects) {
      if (e.type === "napalm") {
        const alpha = Math.max(0.2, 1 - e.age / e.life);
        for (const g of e.globs) {
          ctx.beginPath();
          ctx.arc(g.x, g.y - 2, 3, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(255,120,40," + alpha + ")";
          ctx.fill();
        }
      } else if (e.type === "tracerTrail") {
        const alpha = Math.max(0, 1 - e.age / e.life) * 0.75;
        if (e.trail.length > 1) {
          ctx.beginPath();
          ctx.moveTo(e.trail[0].x, e.trail[0].y);
          for (let i = 1; i < e.trail.length; i++) ctx.lineTo(e.trail[i].x, e.trail[i].y);
          ctx.strokeStyle = "rgba(255,255,255," + alpha + ")";
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        // Landing marker.
        ctx.beginPath();
        ctx.arc(e.landX, e.landY, 3, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255,255,255," + alpha + ")";
        ctx.fill();
      }
    }
  }

  function drawSky() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, "#1f3e6e");
    g.addColorStop(0.55, "#4276b6");
    g.addColorStop(1, "#6ea4d8");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
  }

  function drawTerrain() {
    ctx.beginPath();
    ctx.moveTo(0, terrain[0]);
    for (let x = 1; x < W; x++) ctx.lineTo(x, terrain[x]);
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    const g = ctx.createLinearGradient(0, H * 0.5, 0, H);
    g.addColorStop(0, "#3a4d2a");
    g.addColorStop(1, "#1a2614");
    ctx.fillStyle = g;
    ctx.fill();

    // Crisp top line.
    ctx.beginPath();
    ctx.moveTo(0, terrain[0]);
    for (let x = 1; x < W; x++) ctx.lineTo(x, terrain[x]);
    ctx.strokeStyle = "#5b7c3e";
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  function drawTank(t) {
    if (t.hp <= 0) {
      // Wreck.
      ctx.fillStyle = "#3a3a3a";
      ctx.fillRect(t.x - TANK_HALFW, t.y - TANK_BODY_H, TANK_HALFW * 2, TANK_BODY_H);
      return;
    }
    // Body.
    ctx.fillStyle = t.color;
    roundRect(t.x - TANK_HALFW, t.y - TANK_BODY_H, TANK_HALFW * 2, TANK_BODY_H, 2);
    ctx.fill();
    // Turret base.
    ctx.beginPath();
    ctx.arc(t.x, t.y - TANK_BODY_H, 2, Math.PI, 0);
    ctx.fill();
    // Barrel.
    const rad = (t.aim.angle * Math.PI) / 180;
    const bx = t.x + Math.cos(rad) * TANK_TURRET_LEN;
    const by = (t.y - TANK_BODY_H) - Math.sin(rad) * TANK_TURRET_LEN;
    ctx.beginPath();
    ctx.moveTo(t.x, t.y - TANK_BODY_H);
    ctx.lineTo(bx, by);
    ctx.strokeStyle = t.color;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    // HP halo for active tank.
    if (tanks[turn] === t && !gameDone) {
      ctx.beginPath();
      ctx.arc(t.x, t.y - TANK_BODY_H, 10, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255,0.25)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
    // Shield halo when shield energy > 0.
    if (t.shieldEnergy > 0) {
      const frac = t.shieldMax > 0 ? t.shieldEnergy / t.shieldMax : 0;
      ctx.beginPath();
      ctx.arc(t.x, t.y - TANK_BODY_H, 14, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(111,196,255," + (0.35 + 0.45 * frac) + ")";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }

  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawProjectile(p) {
    // Trail.
    if (p.trail.length > 1) {
      ctx.beginPath();
      ctx.moveTo(p.trail[0].x, p.trail[0].y);
      for (let i = 1; i < p.trail.length; i++) ctx.lineTo(p.trail[i].x, p.trail[i].y);
      ctx.strokeStyle = WEAPONS[p.weapon].trail;
      ctx.lineWidth = 1.5;
      ctx.globalAlpha = 0.6;
      ctx.stroke();
      ctx.globalAlpha = 1;
    }
    ctx.beginPath();
    ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = WEAPONS[p.weapon].trail;
    ctx.fill();
  }

  function drawExplosion(e) {
    const t = e.age / e.life;
    const r = e.radius * Math.min(1, t * 1.6);
    const g = ctx.createRadialGradient(e.x, e.y, 0, e.x, e.y, r);
    g.addColorStop(0, "rgba(255,240,180,0.95)");
    g.addColorStop(0.4, "rgba(255,140,80,0.75)");
    g.addColorStop(1, "rgba(80,30,20,0)");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(e.x, e.y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    }
    ctx.globalAlpha = 1;
  }

  function drawWindArrow() {
    const cx = W - 70;
    const cy = 26;
    ctx.fillStyle = "rgba(255,255,255,0.75)";
    ctx.font = "12px 'Nunito Sans', sans-serif";
    ctx.textAlign = "right";
    ctx.fillText("WIND", cx - 6, cy + 4);
    const len = Math.min(40, Math.abs(wind) * 6);
    const dir = wind >= 0 ? 1 : -1;
    ctx.strokeStyle = "rgba(255,255,255,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + len * dir, cy);
    ctx.stroke();
    if (len > 4) {
      ctx.beginPath();
      ctx.moveTo(cx + len * dir, cy);
      ctx.lineTo(cx + (len - 5) * dir, cy - 4);
      ctx.lineTo(cx + (len - 5) * dir, cy + 4);
      ctx.closePath();
      ctx.fillStyle = "rgba(255,255,255,0.85)";
      ctx.fill();
    }
  }

  function drawAimGuide() {
    if (projectiles.length || explosions.length || gameDone) return;
    const t = tanks[turn];
    if (!t || t.hp <= 0 || t.isAI) return;
    const rad = (t.aim.angle * Math.PI) / 180;
    const p = powerToSpeed(t.aim.power);
    let x = t.x;
    let y = t.y - TANK_BODY_H;
    let vx = Math.cos(rad) * p;
    let vy = -Math.sin(rad) * p;
    ctx.setLineDash([3, 4]);
    ctx.strokeStyle = "rgba(255,255,255,0.45)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < 12; i++) {
      x += vx * 2;
      y += vy * 2;
      vy += GRAVITY * 2;
      vx += wind * WIND_ACCEL * 2;
      if (y > H || x < 0 || x > W) break;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  // ---------- firing ----------
  function ammoAvailable(tank, weapon) {
    const w = WEAPONS[weapon];
    if (!w) return false;
    if (w.free) return true;
    return (tank.ammo[weapon] || 0) > 0;
  }

  function consumeAmmo(tank, weapon) {
    const w = WEAPONS[weapon];
    if (!w || w.free) return;
    tank.ammo[weapon] = Math.max(0, (tank.ammo[weapon] || 0) - 1);
  }

  function fire(tank, aim, weapon) {
    if (!ammoAvailable(tank, weapon)) weapon = "baby"; // fallback
    consumeAmmo(tank, weapon);
    const rad = (aim.angle * Math.PI) / 180;
    const speed = powerToSpeed(aim.power);
    const w = WEAPONS[weapon] || WEAPONS.baby;
    projectiles.push({
      x: tank.x + Math.cos(rad) * TANK_TURRET_LEN,
      y: (tank.y - TANK_BODY_H) - Math.sin(rad) * TANK_TURRET_LEN,
      vx: Math.cos(rad) * speed,
      vy: -Math.sin(rad) * speed,
      weapon: weapon,
      kind: w.kind,
      trail: [],
      ownerIdx: tanks.indexOf(tank),
      bounces: 0,
      rolling: false,
      tunneling: false,
      tunnelLeft: w.tunnelDist || 0,
      split: false,
      dead: false,
      age: 0
    });
    inputLocked = true;
    shotResolved = false;
    fireBtn.disabled = true;
  }

  function stepProjectiles() {
    const n = projectiles.length;
    for (let i = 0; i < n; i++) {
      const p = projectiles[i];
      if (p.dead) continue;
      switch (p.kind) {
        case "split":    stepSplit(p);    break;
        case "roller":   stepRoller(p);   break;
        case "leapfrog": stepLeapfrog(p); break;
        case "dirt":     stepDirt(p);     break;
        case "tunnel":   stepTunnel(p);   break;
        case "tracer":   stepTracer(p);   break;
        case "napalm":   stepNapalm(p);   break;
        case "explosive":
        default:         stepExplosive(p);
      }
    }
    projectiles = projectiles.filter(function (p) { return !p.dead; });
  }

  // Common physics step. Returns true if the projectile should be removed
  // (went too far off-screen).
  function flyOne(p) {
    p.prevX = p.x;
    p.prevY = p.y;
    p.trail.push({ x: p.x, y: p.y });
    if (p.trail.length > 60) p.trail.shift();
    p.x += p.vx;
    p.y += p.vy;
    p.vy += GRAVITY;
    p.vx += wind * WIND_ACCEL;
    p.age++;
    if (p.x < -40 || p.x > W + 40) {
      lastLanding = { x: p.x, y: p.y };
      p.dead = true;
      return true;
    }
    return false;
  }

  // Slab-method swept-AABB: does the line from (x0,y0)→(x1,y1) intersect the
  // axis-aligned box (bx0..bx1, by0..by1)?
  function segHitsBox(x0, y0, x1, y1, bx0, by0, bx1, by1) {
    let tMin = 0, tMax = 1;
    const dx = x1 - x0;
    if (Math.abs(dx) < 1e-9) {
      if (x0 < bx0 || x0 > bx1) return false;
    } else {
      const t1 = (bx0 - x0) / dx, t2 = (bx1 - x0) / dx;
      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));
      if (tMin > tMax) return false;
    }
    const dy = y1 - y0;
    if (Math.abs(dy) < 1e-9) {
      if (y0 < by0 || y0 > by1) return false;
    } else {
      const t1 = (by0 - y0) / dy, t2 = (by1 - y0) / dy;
      tMin = Math.max(tMin, Math.min(t1, t2));
      tMax = Math.min(tMax, Math.max(t1, t2));
      if (tMin > tMax) return false;
    }
    return true;
  }

  // Returns hit tank index, or -1. Uses swept-AABB so fast shells can't step
  // over a small target between frames.
  function hitTank(p) {
    const padX = TANK_HALFW + 4;
    const padY = TANK_BODY_H + 4;
    for (let i = 0; i < tanks.length; i++) {
      const t = tanks[i];
      if (t.hp <= 0) continue;
      if (i === p.ownerIdx && p.age < 3) continue;
      const cx = t.x;
      const cy = t.y - TANK_BODY_H / 2;
      // Endpoint check first (cheap).
      if (Math.abs(p.x - cx) <= padX && Math.abs(p.y - cy) <= padY) return i;
      // Swept check from prev position to current position.
      if (p.prevX != null) {
        if (segHitsBox(p.prevX, p.prevY, p.x, p.y, cx - padX, cy - padY, cx + padX, cy + padY)) return i;
      }
    }
    return -1;
  }

  function stepExplosive(p) {
    if (flyOne(p)) return;
    const ti = hitTank(p);
    if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
    if (p.y >= terrainY(p.x)) detonateAt(p, p.x, p.y, -1);
  }

  function stepSplit(p) {
    if (flyOne(p)) return;
    const w = WEAPONS[p.weapon];
    const ti = hitTank(p);
    if (ti >= 0) { spawnChildren(p, p.x, p.y); return; }
    // Fuse at apex pass: trigger when projectile is descending past fuseY.
    if (!p.split && p.vy > 0 && p.y >= H * w.fuseY) {
      spawnChildren(p, p.x, p.y);
      return;
    }
    if (p.y >= terrainY(p.x)) spawnChildren(p, p.x, p.y);
  }

  function spawnChildren(parent, x, y) {
    const w = WEAPONS[parent.weapon];
    const childW = WEAPONS[w.child];
    const n = w.count;
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n - 0.5; // [-0.5, 0.5]
      projectiles.push({
        x: x,
        y: y,
        vx: parent.vx + t * w.spread,
        vy: parent.vy * 0.4 + 0.5,
        weapon: w.child,
        kind: childW.kind,
        trail: [],
        ownerIdx: parent.ownerIdx,
        bounces: 0, rolling: false, tunneling: false,
        tunnelLeft: childW.tunnelDist || 0,
        split: false, dead: false, age: 0
      });
    }
    parent.dead = true;
  }

  function stepRoller(p) {
    if (!p.rolling) {
      if (flyOne(p)) return;
      const ti = hitTank(p);
      if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
      if (p.y >= terrainY(p.x)) {
        p.rolling = true;
        p.y = terrainY(p.x);
        p.vy = 0;
        // Preserve horizontal momentum, dampened.
        p.vx = p.vx * 0.7;
        if (Math.abs(p.vx) < 0.4) p.vx = (p.vx < 0 ? -1 : 1) * 0.4;
      }
      return;
    }
    // Rolling: slide along terrain, accelerated by slope, retarded by friction.
    for (let sub = 0; sub < 3; sub++) {
      const xi = Math.round(p.x);
      if (xi <= 0 || xi >= W - 1) { detonateAt(p, p.x, terrainY(p.x), -1); return; }
      const slope = terrainY(xi + 1) - terrainY(xi - 1); // positive = downhill to the right
      p.vx += slope * 0.18;
      p.vx *= 0.985;
      p.x += p.vx;
      p.y = terrainY(p.x);
      p.trail.push({ x: p.x, y: p.y });
      if (p.trail.length > 80) p.trail.shift();
      const ti = hitTank(p);
      if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
      if (Math.abs(p.vx) < 0.06) { detonateAt(p, p.x, p.y, -1); return; }
    }
  }

  function stepLeapfrog(p) {
    if (flyOne(p)) return;
    const ti = hitTank(p);
    if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
    if (p.y >= terrainY(p.x)) {
      const maxBounces = WEAPONS[p.weapon].bounces || 1;
      if (p.bounces < maxBounces) {
        p.bounces++;
        p.y = terrainY(p.x) - 1;
        p.vy = -Math.abs(p.vy) * 0.65;
        p.vx *= 0.85;
        // Small puff per bounce.
        carveCrater(p.x, p.y + 4, 6);
      } else {
        detonateAt(p, p.x, p.y, -1);
      }
    }
  }

  function stepDirt(p) {
    if (flyOne(p)) return;
    if (p.y >= terrainY(p.x)) {
      const w = WEAPONS[p.weapon];
      depositDirt(p.x, p.y, w.radius);
      lastLanding = { x: p.x, y: p.y };
      // Small dust puff.
      for (let i = 0; i < 14; i++) {
        const a = Math.random() * Math.PI * 2;
        const sp = 0.3 + Math.random() * 1.5;
        particles.push({
          x: p.x, y: p.y,
          vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 1,
          age: 0, life: 25 + Math.random() * 15,
          color: "#a37548"
        });
      }
      p.dead = true;
      settleTanks();
    }
  }

  function stepTunnel(p) {
    if (!p.tunneling) {
      if (flyOne(p)) return;
      const ti = hitTank(p);
      if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
      if (p.y >= terrainY(p.x)) {
        p.tunneling = true;
        p.tunnelDir = p.vx >= 0 ? 1 : -1;
        p.tunnelY = terrainY(p.x);
      }
      return;
    }
    const w = WEAPONS[p.weapon];
    for (let sub = 0; sub < 2; sub++) {
      p.x += p.tunnelDir * 1.5;
      p.y = p.tunnelY;
      carveCrater(p.x, p.tunnelY + w.radius * 0.3, w.radius);
      p.tunnelLeft -= 1.5;
      const ti = hitTank(p);
      if (ti >= 0) { detonateAt(p, p.x, p.y, ti); return; }
      if (p.tunnelLeft <= 0 || p.x < 4 || p.x > W - 4) {
        detonateAt(p, p.x, p.y, -1);
        return;
      }
    }
  }

  function stepTracer(p) {
    if (flyOne(p)) return;
    const ti = hitTank(p);
    if (ti >= 0 || p.y >= terrainY(p.x)) {
      lastLanding = { x: p.x, y: p.y };
      effects.push({
        type: "tracerTrail",
        trail: p.trail.slice(),
        landX: p.x, landY: p.y,
        life: 110, age: 0
      });
      p.dead = true;
    }
  }

  function stepNapalm(p) {
    if (flyOne(p)) return;
    const ti = hitTank(p);
    if (ti >= 0 || p.y >= terrainY(p.x)) {
      spawnNapalm(p.x, p.y, p.ownerIdx);
      lastLanding = { x: p.x, y: p.y };
      p.dead = true;
      // small impact crater
      carveCrater(p.x, p.y, 8);
    }
  }

  function spawnNapalm(x, y, ownerIdx) {
    const globs = [];
    for (let i = -5; i <= 5; i++) {
      globs.push({ x: x + i * 4, y: terrainY(x + i * 4), vx: i * 0.15, age: 0 });
    }
    effects.push({
      type: "napalm",
      globs: globs,
      ownerIdx: ownerIdx == null ? -1 : ownerIdx,
      life: WEAPONS.napalm.lifeFrames,
      age: 0
    });
  }

  function detonateAt(p, x, y, directHitIdx) {
    const w = WEAPONS[p.weapon];
    spawnExplosion(x, y, w.radius);
    applyBlastDamage(x, y, w.radius, w.maxDamage || 0, directHitIdx, p.ownerIdx);
    if (w.radius > 0) carveCrater(x, y, w.radius);
    lastLanding = { x: x, y: y };
    p.dead = true;
  }

  function spawnExplosion(x, y, radius) {
    explosions.push({ x: x, y: y, radius: radius, age: 0, life: 28 });
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = 0.5 + Math.random() * 3;
      particles.push({
        x: x, y: y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp - 1,
        age: 0, life: 30 + Math.random() * 20,
        color: Math.random() < 0.5 ? "#ffd34d" : "#ff7a4d"
      });
    }
  }

  // Route damage through the shield first, then HP, and attribute it
  // to the attacker so they earn cash at round end.
  function applyDamage(tank, amount, attackerIdx) {
    if (amount <= 0 || tank.hp <= 0) return 0;
    let remaining = amount;
    if (tank.shieldEnergy > 0) {
      const absorbed = Math.min(tank.shieldEnergy, remaining);
      tank.shieldEnergy -= absorbed;
      remaining -= absorbed;
    }
    const hpDmg = Math.min(tank.hp, remaining);
    tank.hp -= hpDmg;
    if (attackerIdx != null && attackerIdx >= 0 && attackerIdx !== tanks.indexOf(tank)) {
      const attacker = tanks[attackerIdx];
      if (attacker) attacker.damageThisRound += amount;
    }
    return amount;
  }

  function applyBlastDamage(x, y, radius, maxDamage, directHitIdx, attackerIdx) {
    if (radius <= 0 || maxDamage <= 0) return;
    for (let i = 0; i < tanks.length; i++) {
      const t = tanks[i];
      if (t.hp <= 0) continue;
      const dx = t.x - x;
      const dy = (t.y - TANK_BODY_H / 2) - y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist <= radius) {
        const f = 1 - dist / radius;
        const dmg = Math.round(maxDamage * f) + (i === directHitIdx ? 10 : 0);
        applyDamage(t, dmg, attackerIdx);
      }
    }
  }

  function depositDirt(cx, cy, r) {
    const left = clamp(Math.round(cx - r), 0, W - 1);
    const right = clamp(Math.round(cx + r), 0, W - 1);
    for (let x = left; x <= right; x++) {
      const dx = x - cx;
      const half = Math.sqrt(Math.max(0, r * r - dx * dx));
      const top = cy - half;
      // Raise surface: smaller y is higher ground.
      if (top < terrain[x]) terrain[x] = Math.max(8, top);
    }
  }

  function stepEffects() {
    for (const e of effects) {
      if (e.type === "napalm") stepNapalmEffect(e);
      else if (e.type === "tracerTrail") e.age++;
    }
    effects = effects.filter(function (e) { return e.age < e.life; });
  }

  function stepNapalmEffect(e) {
    e.age++;
    for (const g of e.globs) {
      const xi = Math.round(g.x);
      if (xi <= 1 || xi >= W - 1) continue;
      const slope = terrainY(xi + 1) - terrainY(xi - 1);
      g.vx += slope * 0.04;
      g.vx *= 0.94;
      g.x += g.vx;
      g.y = terrainY(g.x);
    }
    // Damage on contact, ramped down toward end of life.
    const intensity = Math.max(0.2, 1 - e.age / e.life);
    for (let ti = 0; ti < tanks.length; ti++) {
      const t = tanks[ti];
      if (t.hp <= 0) continue;
      let touching = false;
      for (const g of e.globs) {
        if (Math.abs(g.x - t.x) < TANK_HALFW + 3 && Math.abs(g.y - t.y) < TANK_BODY_H + 4) {
          touching = true;
          break;
        }
      }
      if (touching) {
        t.napalmFrames = (t.napalmFrames || 0) + 1;
        if (t.napalmFrames % 6 === 0) {
          const dmg = Math.max(1, Math.round(WEAPONS.napalm.maxDamage * intensity));
          applyDamage(t, dmg, e.ownerIdx);
        }
      }
    }
  }

  function endShot() {
    const shooter = tanks[turn];
    if (shooter && shooter.isAI && lastLanding) {
      const target = tanks[(turn + 1) % tanks.length];
      lastAIShot = {
        aim: { angle: shooter.aim.angle, power: shooter.aim.power },
        offsetX: lastLanding.x - target.x,
        offsetY: lastLanding.y - (target.y - TANK_BODY_H / 2)
      };
    }
    afterShotResolve();
  }

  function afterShotResolve() {
    settleTanks();
    if (checkWin()) return;
    nextTurn();
  }

  function checkWin() {
    const alive = tanks.filter(function (t) { return t.hp > 0; });
    if (alive.length <= 1) {
      gameDone = true;
      inputLocked = true;
      fireBtn.disabled = true;
      const winnerIdx = alive.length === 1 ? tanks.indexOf(alive[0]) : -1;
      handleRoundEnd(winnerIdx);
      return true;
    }
    return false;
  }

  function handleRoundEnd(winnerIdx) {
    // Award cash for damage dealt + kill bonus + round-win bonus.
    for (let i = 0; i < tanks.length; i++) {
      tanks[i].cash += Math.round(tanks[i].damageThisRound);
    }
    if (winnerIdx >= 0) {
      match.score[winnerIdx]++;
      tanks[winnerIdx].cash += 500; // kill bonus
      tanks[winnerIdx].cash += 1000; // round win bonus
    }
    persistP1Cash();
    // Match end?
    if (match.score[0] >= match.roundsToWin || match.score[1] >= match.roundsToWin || match.currentRound >= match.totalRounds) {
      handleMatchEnd();
      return;
    }
    // Otherwise: between-round shop, then start next round.
    setTimeout(function () { openShopPhase(); }, 1100);
  }

  function handleMatchEnd() {
    match.active = false;
    let winnerIdx = -1;
    if (match.score[0] > match.score[1]) winnerIdx = 0;
    else if (match.score[1] > match.score[0]) winnerIdx = 1;
    persistP1Cash();
    const title = winnerIdx >= 0
      ? tanks[winnerIdx].name + " wins the match! (" + match.score[0] + "–" + match.score[1] + ")"
      : "Match drawn (" + match.score[0] + "–" + match.score[1] + ")";
    const bank = !tanks[0].isAI ? "  Bank: $" + tanks[0].cash.toLocaleString() : "";
    const msg = "Click Rematch for a new match, or close to bail out." + bank;
    setTimeout(function () { showOverlay(title, msg, "Rematch"); }, 800);
  }

  function nextTurn() {
    turn = (turn + 1) % tanks.length;
    while (tanks[turn].hp <= 0) turn = (turn + 1) % tanks.length;
    // Drift the wind a little between shots.
    wind = +clamp(wind + (Math.random() - 0.5) * 6, -10, 10).toFixed(1);
    inputLocked = false;
    fireBtn.disabled = false;
    rebuildWeaponDropdown();
    syncHUD();
    if (tanks[turn].isAI) {
      // Small delay before AI fires so the player sees the turn change.
      setTimeout(aiFire, 700);
    } else {
      // Restore the player's aim from their tank.
      angleInput.value = tanks[turn].aim.angle;
      powerInput.value = tanks[turn].aim.power;
      onAngleChange();
      onPowerChange();
    }
  }

  // ---------- AI tiers ----------
  function aiFire() {
    if (gameDone) return;
    const ai = tanks[turn];
    const target = tanks[(turn + 1) % tanks.length];
    if (!ai || !target) return;
    let aim;
    switch (ai.aiTier) {
      case "cyborg": aim = aimCyborg(ai, target); break;
      case "lobber": aim = aimLobber(ai, target); break;
      case "pyro":   aim = aimPyro(ai, target);   break;
      case "shooter":
      default:       aim = aimShooter(ai, target);
    }
    ai.aim.angle = clamp(Math.round(aim.angle), 5, 175);
    ai.aim.power = clamp(Math.round(aim.power), 10, 100);
    fire(ai, ai.aim, "baby");
  }

  // Heuristic + walk-in (broad jitter).
  function aimShooter(ai, target) {
    return heuristicAim(ai, target, { jitterA: 6, jitterP: 6, corrStep: 8 });
  }

  // Heuristic + walk-in (tight jitter, larger corrections).
  function aimPyro(ai, target) {
    return heuristicAim(ai, target, { jitterA: 2.5, jitterP: 3, corrStep: 6 });
  }

  function heuristicAim(ai, target, opts) {
    const dx = target.x - ai.x;
    let baseAngle = dx >= 0 ? 45 : 135;
    let basePower = clamp(35 + Math.abs(dx) / W * 60, 25, 90);
    if (lastAIShot && Math.sign(lastAIShot.aim.angle - 90) === Math.sign(baseAngle - 90)) {
      const off = lastAIShot.offsetX;
      const traveledRight = dx >= 0;
      const overshot = traveledRight ? off > 0 : off < 0;
      const mag = Math.min(opts.corrStep, Math.max(2, Math.abs(off) / 6));
      basePower = lastAIShot.aim.power + (overshot ? -mag : mag);
      baseAngle = lastAIShot.aim.angle;
    }
    if (dx >= 0) basePower -= wind * 1.5;
    else         basePower += wind * 1.5;
    baseAngle += (Math.random() - 0.5) * opts.jitterA * 2;
    basePower += (Math.random() - 0.5) * opts.jitterP * 2;
    return { angle: baseAngle, power: basePower };
  }

  // High-arc analytic solver (constrained angle range).
  function aimLobber(ai, target) {
    const solved = solveBallistic(ai, target, { angleMin: 55, angleMax: 125, angleStep: 2, powerStep: 4 });
    return {
      angle: solved.angle + (Math.random() - 0.5) * 4,
      power: solved.power + (Math.random() - 0.5) * 5
    };
  }

  // Full analytic solver, tiny jitter.
  function aimCyborg(ai, target) {
    const solved = solveBallistic(ai, target, { angleMin: 5, angleMax: 175, angleStep: 1, powerStep: 2 });
    return {
      angle: solved.angle + (Math.random() - 0.5) * 1.5,
      power: solved.power + (Math.random() - 0.5) * 2
    };
  }

  // Simulate a grid of (angle, power) combos and return the one whose
  // projectile passed closest to the target (terrain-aware).
  function solveBallistic(ai, target, opts) {
    let bestAngle = ai.x <= target.x ? 45 : 135;
    let bestPower = 55;
    let bestDist = Infinity;
    const tx = target.x;
    const ty = target.y - TANK_BODY_H / 2;
    for (let a = opts.angleMin; a <= opts.angleMax; a += opts.angleStep) {
      // Skip angles aiming the wrong way.
      const facingRight = a < 90;
      if (facingRight !== (target.x >= ai.x)) continue;
      const rad = a * Math.PI / 180;
      const cos = Math.cos(rad);
      const sin = Math.sin(rad);
      const baseX = ai.x + cos * TANK_TURRET_LEN;
      const baseY = (ai.y - TANK_BODY_H) - sin * TANK_TURRET_LEN;
      for (let p = 20; p <= 100; p += opts.powerStep) {
        const speed = powerToSpeed(p);
        let x = baseX, y = baseY;
        let vx = cos * speed;
        let vy = -sin * speed;
        let minD = Infinity;
        for (let step = 0; step < 400; step++) {
          x += vx; y += vy;
          vy += GRAVITY;
          vx += wind * WIND_ACCEL;
          if (x < -50 || x > W + 50 || y > H + 50) break;
          const ddx = x - tx;
          const ddy = y - ty;
          const d = Math.sqrt(ddx * ddx + ddy * ddy);
          if (d < minD) minD = d;
          if (y >= 0 && y >= terrainY(x)) break;
        }
        if (minD < bestDist) {
          bestDist = minD;
          bestAngle = a;
          bestPower = p;
        }
      }
    }
    return { angle: bestAngle, power: bestPower };
  }

  // ---------- main loop ----------
  function tick() {
    if (terrain) {
      stepProjectiles();
      stepExplosions();
      stepEffects();
      stepParticles();
      // End the shot once all projectiles + explosions for it have resolved.
      // Effects (e.g. napalm) keep running across turns.
      if (!shotResolved && projectiles.length === 0 && explosions.length === 0) {
        shotResolved = true;
        endShot();
      }
      // Effects can kill tanks mid-turn (napalm).
      if (!gameDone) checkWin();
      syncHPBars();
      draw();
    }
    rafId = requestAnimationFrame(tick);
  }

  function stepExplosions() {
    for (const e of explosions) e.age++;
    explosions = explosions.filter(function (e) { return e.age < e.life; });
  }

  function stepParticles() {
    for (const p of particles) {
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.1;
      p.age++;
    }
    particles = particles.filter(function (p) { return p.age < p.life && p.y < H; });
  }

  // ---------- HUD ----------
  function isShoppingOpen() { return shopEl && !shopEl.hidden; }

  function syncHUD() {
    const shoppingNow = isShoppingOpen();
    const t = tanks[shoppingNow ? match.shopperIdx : turn];
    if (shoppingNow && t) {
      turnChip.textContent = t.name + " · shopping";
      turnChip.style.background = "#4a4a2a";
    } else {
      turnChip.textContent = (t && t.name) || "—";
      turnChip.style.background = t ? (t.isAI ? "#3a2236" : "#1c3c4a") : "#1c2a40";
    }
    const dir = wind === 0 ? "" : (wind > 0 ? "right" : "left");
    windChip.classList.remove("left", "right");
    if (dir) windChip.classList.add(dir);
    windChip.textContent = "Wind: " + Math.abs(wind).toFixed(1);
    syncHPBars();
    syncRoundChip();
    syncCashChip();
    fireBtn.disabled = shoppingNow || !t || t.isAI || inputLocked || gameDone;
    angleInput.disabled = shoppingNow || !t || t.isAI || gameDone;
    powerInput.disabled = shoppingNow || !t || t.isAI || gameDone;
    weaponSel.disabled = shoppingNow || !t || t.isAI || gameDone;
  }

  function syncHPBars() {
    for (let i = 0; i < tanks.length; i++) {
      const el = hpEls[i];
      if (!el) continue;
      const hpBar = el.querySelector(".sc-bar:not(.sc-bar-shield) > i");
      const shBar = el.querySelector(".sc-bar-shield > i");
      const num = el.querySelector(".sc-hp-num");
      const label = el.querySelector("label");
      if (label) label.textContent = tanks[i].name;
      if (hpBar) hpBar.style.width = (tanks[i].hp / MAX_HP * 100) + "%";
      if (shBar) {
        const max = tanks[i].shieldMax || 0;
        shBar.style.width = max > 0 ? (tanks[i].shieldEnergy / max * 100) + "%" : "0%";
      }
      if (num) num.textContent = tanks[i].hp;
    }
  }

  function syncRoundChip() {
    if (!roundChip) return;
    if (!match.active || match.totalRounds <= 1) {
      roundChip.hidden = true;
      return;
    }
    roundChip.hidden = false;
    if (match.currentRound === 0) {
      roundChip.textContent = "Pre-match · Best of " + match.totalRounds;
    } else {
      roundChip.textContent = "Round " + match.currentRound + "/" + match.totalRounds + "  " + match.score[0] + "–" + match.score[1];
    }
  }

  function syncCashChip() {
    if (!cashChip) return;
    const t = tanks[isShoppingOpen() ? match.shopperIdx : turn];
    if (!t) { cashChip.textContent = "$0"; return; }
    cashChip.textContent = "$" + t.cash.toLocaleString();
  }

  // ---------- weapon dropdown ----------
  function rebuildWeaponDropdown() {
    if (!weaponSel) return;
    const prev = weaponSel.value;
    weaponSel.innerHTML = "";
    const groups = [
      { label: "Standard",      keys: ["baby", "missile", "babyNuke", "nuke", "plastique"] },
      { label: "Multi-warhead", keys: ["mirv", "deathsHead", "funkyBomb"] },
      { label: "Rollers",       keys: ["babyRoller", "roller", "heavyRoller"] },
      { label: "Special",       keys: ["leapfrog", "tunneler", "napalm"] },
      { label: "Utility",       keys: ["tracer", "dirtClod", "liquidDirt", "sandbag"] }
    ];
    const t = tanks[turn];
    for (const g of groups) {
      const og = document.createElement("optgroup");
      og.label = g.label;
      for (const k of g.keys) {
        const w = WEAPONS[k];
        const opt = document.createElement("option");
        opt.value = k;
        if (w.free) {
          opt.textContent = w.name + " (∞)";
        } else {
          const n = (t && t.ammo[k]) || 0;
          opt.textContent = w.name + " ×" + n;
          if (n <= 0) opt.disabled = true;
        }
        og.appendChild(opt);
      }
      weaponSel.appendChild(og);
    }
    // Restore selection if still ammo, else fall back to first enabled (baby).
    const restoreOpt = Array.from(weaponSel.options).find(function (o) { return o.value === prev && !o.disabled; });
    weaponSel.value = restoreOpt ? prev : "baby";
  }

  // ---------- shop ----------
  function showShop() {
    if (shopEl) shopEl.hidden = false;
  }
  function hideShop() {
    if (shopEl) shopEl.hidden = true;
  }

  function openShopPhase() {
    match.shopperIdx = 0;
    advanceShopPhase();
  }

  function advanceShopPhase() {
    // Skip dead tanks (shouldn't happen pre-round, but defensive).
    while (match.shopperIdx < tanks.length && tanks[match.shopperIdx].hp <= 0 && match.currentRound > 0) {
      match.shopperIdx++;
    }
    if (match.shopperIdx >= tanks.length) {
      hideShop();
      startRound();
      return;
    }
    const shopper = tanks[match.shopperIdx];
    if (shopper.isAI) {
      aiShop(shopper);
      match.shopperIdx++;
      advanceShopPhase();
      return;
    }
    openShopForTank(shopper);
  }

  function openShopForTank(tank) {
    showShop();
    shopTitle.textContent = tank.name + "'s Shop";
    shopHint.textContent = match.currentRound === 0
      ? "Pre-match: stock up with your starting cash."
      : "Round " + (match.currentRound + 1) + " of " + match.totalRounds + " incoming. Spend what you earned.";
    renderShop(tank);
    syncHUD();
  }

  function renderShop(tank) {
    shopCash.textContent = "$" + tank.cash.toLocaleString();
    shopWeaponsList.innerHTML = "";
    for (const k of SHOP_ORDER) {
      const w = WEAPONS[k];
      const li = document.createElement("li");
      li.className = "sc-shop-item";
      const qty = w.free ? "∞" : ((tank.ammo[k] || 0) + "");
      const priceLabel = w.free ? "Free" : "$" + w.price.toLocaleString();
      li.innerHTML =
        "<span class='sc-shop-name'></span>" +
        "<span class='sc-shop-price'></span>" +
        "<span class='sc-shop-qty'></span>" +
        "<button type='button' data-action='sub' " + (w.free ? "disabled" : "") + ">−</button>" +
        "<button type='button' data-action='add' " + (w.free ? "disabled" : "") + ">+</button>";
      li.querySelector(".sc-shop-name").textContent = w.name;
      li.querySelector(".sc-shop-price").textContent = priceLabel;
      li.querySelector(".sc-shop-qty").textContent = qty;
      if (!w.free) {
        li.querySelector("[data-action='add']").addEventListener("click", function () {
          if (tank.cash >= w.price) {
            tank.cash -= w.price;
            tank.ammo[k] = (tank.ammo[k] || 0) + 1;
            renderShop(tank);
          }
        });
        li.querySelector("[data-action='sub']").addEventListener("click", function () {
          if ((tank.ammo[k] || 0) > 0) {
            tank.ammo[k] = tank.ammo[k] - 1;
            tank.cash += w.price;
            renderShop(tank);
          }
        });
      }
      shopWeaponsList.appendChild(li);
    }
    shopDefensesList.innerHTML = "";
    for (const k of DEFENSE_ORDER) {
      const d = DEFENSES[k];
      const li = document.createElement("li");
      li.className = "sc-shop-item";
      let qtyLabel = "";
      if (d.kind === "shield") {
        // Show "+energy" and current shield-max contribution.
        qtyLabel = "+" + d.energy;
      } else if (d.kind === "parachute") {
        qtyLabel = (tank.parachutes || 0) + "";
      } else if (d.kind === "battery") {
        qtyLabel = "refill";
      }
      li.innerHTML =
        "<span class='sc-shop-name'></span>" +
        "<span class='sc-shop-price'></span>" +
        "<span class='sc-shop-qty'></span>" +
        "<button type='button' data-action='sub'>−</button>" +
        "<button type='button' data-action='add'>+</button>";
      li.querySelector(".sc-shop-name").textContent = d.name;
      li.querySelector(".sc-shop-price").textContent = "$" + d.price.toLocaleString();
      li.querySelector(".sc-shop-qty").textContent = qtyLabel;
      const sub = li.querySelector("[data-action='sub']");
      if (d.kind === "battery") sub.disabled = true; // batteries are a service, no refund
      if (d.kind === "shield")   sub.disabled = true; // can't sell back shield contribution
      li.querySelector("[data-action='add']").addEventListener("click", function () {
        if (tank.cash < d.price) return;
        if (d.kind === "shield") {
          tank.cash -= d.price;
          tank.shieldMax += d.energy;
          tank.shieldEnergy += d.energy; // refill on purchase too
        } else if (d.kind === "parachute") {
          tank.cash -= d.price;
          tank.parachutes = (tank.parachutes || 0) + 1;
        } else if (d.kind === "battery") {
          if (tank.shieldMax <= 0) return; // no shield to refill
          tank.cash -= d.price;
          tank.shieldEnergy = tank.shieldMax;
        }
        renderShop(tank);
      });
      if (d.kind === "parachute") {
        sub.addEventListener("click", function () {
          if ((tank.parachutes || 0) > 0) {
            tank.parachutes--;
            tank.cash += d.price;
            renderShop(tank);
          }
        });
      }
      shopDefensesList.appendChild(li);
    }
  }

  function aiShop(tank) {
    // Heuristic: buy a shield (best one affordable), some parachutes, then mid-tier offensives.
    const wantShields = ["superMag", "heavyShield", "magDeflector", "magShield"];
    for (const key of wantShields) {
      const d = DEFENSES[key];
      if (tank.cash >= d.price && tank.shieldMax < d.energy) {
        tank.cash -= d.price;
        tank.shieldMax += d.energy;
        tank.shieldEnergy += d.energy;
        break;
      }
    }
    while (tank.cash >= DEFENSES.parachute.price && (tank.parachutes || 0) < 2) {
      tank.cash -= DEFENSES.parachute.price;
      tank.parachutes = (tank.parachutes || 0) + 1;
    }
    while (tank.shieldMax > 0 && tank.shieldEnergy < tank.shieldMax && tank.cash >= DEFENSES.battery.price) {
      tank.cash -= DEFENSES.battery.price;
      tank.shieldEnergy = tank.shieldMax;
    }
    // Buy some shells, weighted toward bang/buck — cheap stuff first, splurge if rich.
    const wantShells = [
      ["missile", 6],
      ["babyNuke", 2],
      ["plastique", 2],
      ["funkyBomb", 1],
      ["mirv", 1],
      ["deathsHead", 1]
    ];
    for (const w of wantShells) {
      const key = w[0], maxN = w[1];
      const wp = WEAPONS[key];
      while (tank.cash >= wp.price && (tank.ammo[key] || 0) < maxN) {
        tank.cash -= wp.price;
        tank.ammo[key] = (tank.ammo[key] || 0) + 1;
      }
    }
  }

  function onAngleChange() {
    const v = parseInt(angleInput.value, 10);
    angleVal.textContent = v + "°";
    if (tanks[turn] && !tanks[turn].isAI) tanks[turn].aim.angle = v;
  }
  function onPowerChange() {
    const v = parseInt(powerInput.value, 10);
    powerVal.textContent = v;
    if (tanks[turn] && !tanks[turn].isAI) tanks[turn].aim.power = v;
  }

  // ---------- game lifecycle ----------
  function applySettingsFromUI() {
    settings.players = optPlayers.value === "2" ? 2 : 1;
    settings.difficulty = optDifficulty.value || "shooter";
    const ml = parseInt(optMatchLength.value, 10);
    settings.matchLength = (ml === 1 || ml === 3 || ml === 5 || ml === 7) ? ml : 3;
  }

  function syncSettingsUI() {
    optPlayers.value = String(settings.players);
    optDifficulty.value = settings.difficulty;
    optMatchLength.value = String(settings.matchLength);
    optDifficultyRow.hidden = settings.players !== 1;
  }

  function startMatch() {
    applySettingsFromUI();
    hideOverlay();
    newMatchTanks();
    match.active = true;
    match.totalRounds = settings.matchLength;
    match.roundsToWin = Math.ceil(settings.matchLength / 2);
    match.currentRound = 0;
    match.score = [0, 0];
    match.shopperIdx = 0;
    gameStarted = true;
    gameDone = false;
    // Pre-match shop phase: each player buys their initial loadout.
    openShopPhase();
  }

  function startRound() {
    terrain = genTerrain();
    placeTanks();
    settleTanks();
    wind = +(Math.random() * 16 - 8).toFixed(1);
    turn = 0;
    projectiles = [];
    explosions = [];
    effects = [];
    particles = [];
    shotResolved = true;
    lastAIShot = null;
    lastLanding = null;
    gameDone = false;
    inputLocked = false;
    match.currentRound++;
    angleInput.value = tanks[0].aim.angle;
    powerInput.value = tanks[0].aim.power;
    rebuildWeaponDropdown();
    onAngleChange();
    onPowerChange();
    syncHUD();
    hideOverlay();
    hideShop();
  }

  // Backwards-compat shim — the old start/rematch buttons call newGame().
  function newGame() { startMatch(); }

  function showOverlay(title, msg, btn) {
    overlayTitle.textContent = title;
    overlayMsg.textContent = msg;
    overlay.hidden = false;
    overlay.querySelector("[data-sc-action='start']").textContent = btn || "Start";
    syncSettingsUI();
  }
  function hideOverlay() { overlay.hidden = true; }

  function showStartScreen() {
    if (gameDone || !gameStarted) {
      showOverlay("Scorched Earth", "Pick your matchup, soldier.", "Start");
    } else {
      showOverlay("Paused", "Tweak the matchup or jump back in.", "New game");
    }
  }

  function openModal() {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    if (!gameStarted || gameDone) showStartScreen();
    if (!rafId) tick();
  }
  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
  }

  // ---------- input ----------
  function tryFire() {
    if (gameDone || inputLocked) return;
    const t = tanks[turn];
    if (!t || t.isAI || t.hp <= 0) return;
    if (!ammoAvailable(t, weaponSel.value)) {
      // Snap selection back to baby (free + unlimited) so the next click does something.
      weaponSel.value = "baby";
      return;
    }
    fire(t, t.aim, weaponSel.value);
  }

  function handleKey(e) {
    if (!modal.classList.contains("active")) return;
    if (e.key === "Escape") { closeModal(); return; }
    if (gameDone || inputLocked) return;
    const t = tanks[turn];
    if (!t || t.isAI) return;
    const step = e.shiftKey ? 5 : 1;
    if (e.key === "ArrowLeft")  { t.aim.angle = clamp(t.aim.angle + step, 0, 180); angleInput.value = t.aim.angle; onAngleChange(); e.preventDefault(); }
    else if (e.key === "ArrowRight") { t.aim.angle = clamp(t.aim.angle - step, 0, 180); angleInput.value = t.aim.angle; onAngleChange(); e.preventDefault(); }
    else if (e.key === "ArrowUp")    { t.aim.power = clamp(t.aim.power + step, 10, 100); powerInput.value = t.aim.power; onPowerChange(); e.preventDefault(); }
    else if (e.key === "ArrowDown")  { t.aim.power = clamp(t.aim.power - step, 10, 100); powerInput.value = t.aim.power; onPowerChange(); e.preventDefault(); }
    else if (e.key === " ") { tryFire(); e.preventDefault(); }
    else if (e.key === "Tab") {
      const opts = Array.from(weaponSel.options);
      const idx = opts.findIndex(function (o) { return o.value === weaponSel.value; });
      weaponSel.value = opts[(idx + 1) % opts.length].value;
      e.preventDefault();
    }
  }

  // ---------- wiring ----------
  document.querySelectorAll("[data-canvas-game='scorched']").forEach(function (btn) {
    btn.addEventListener("click", openModal);
  });
  modal.querySelectorAll("[data-sc-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  modal.querySelectorAll("[data-sc-action='new']").forEach(function (el) {
    el.addEventListener("click", function () { showStartScreen(); });
  });
  modal.querySelectorAll("[data-sc-action='start']").forEach(function (el) {
    el.addEventListener("click", function () { newGame(); });
  });
  optPlayers.addEventListener("change", function () {
    optDifficultyRow.hidden = optPlayers.value !== "1";
  });
  if (shopDoneBtn) {
    shopDoneBtn.addEventListener("click", function () {
      persistP1Cash();
      match.shopperIdx++;
      advanceShopPhase();
    });
  }
  angleInput.addEventListener("input", onAngleChange);
  powerInput.addEventListener("input", onPowerChange);
  fireBtn.addEventListener("click", tryFire);
  document.addEventListener("keydown", handleKey);

  // --- DEV: temporary console hooks, REMOVE BEFORE SHIP -------------------
  window.__sc = {
    flatten: function (y) {
      if (!terrain) return "start a match first";
      const floor = y != null ? y : H * 0.9;
      for (let x = 0; x < W; x++) terrain[x] = floor;
      for (const t of tanks) t.y = floor;
      return "terrain flattened at y=" + floor;
    },
    setWind: function (v) {
      wind = +clamp(+v, -20, 20).toFixed(1);
      syncHUD();
      return wind;
    },
    setCash: function (v) {
      if (!tanks[0]) return "no tanks";
      tanks[0].cash = +v || 0;
      saveBank(tanks[0].cash);
      syncCashChip();
      return tanks[0].cash;
    },
    resetBank: function () {
      try { localStorage.removeItem(BANK_KEY); } catch (e) {}
      return "bank cleared (refresh page)";
    },
    state: function () {
      return { wind: wind, turn: turn, tanks: tanks, match: match };
    }
  };
  // ------------------------------------------------------------------------

  // Click-to-aim: clicking the canvas sets angle/power based on click point from current tank.
  canvas.addEventListener("click", function (e) {
    if (gameDone || inputLocked) return;
    const t = tanks[turn];
    if (!t || t.isAI) return;
    const rect = canvas.getBoundingClientRect();
    const cx = (e.clientX - rect.left) * (W / rect.width);
    const cy = (e.clientY - rect.top) * (H / rect.height);
    const dx = cx - t.x;
    const dy = (t.y - TANK_BODY_H) - cy;
    const ang = Math.atan2(dy, dx) * 180 / Math.PI;
    t.aim.angle = clamp(Math.round(ang), 0, 180);
    const dist = Math.sqrt(dx * dx + dy * dy);
    t.aim.power = clamp(Math.round(30 + dist / W * 70), 10, 100);
    angleInput.value = t.aim.angle;
    powerInput.value = t.aim.power;
    onAngleChange();
    onPowerChange();
  });
})();
