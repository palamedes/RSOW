(function () {
  "use strict";

  const DIRS = {
    n: "north", s: "south", e: "east", w: "west", u: "up", d: "down",
    north: "north", south: "south", east: "east", west: "west",
    up: "up", down: "down", in: "in", out: "out"
  };

  const SAVE_PREFIX = "rsow.adv.save.";
  const AUTO_SLOT = "_auto";

  const modal = document.getElementById("adventure-modal");
  const titleEl = document.getElementById("adv-modal-title");
  const output = document.getElementById("adv-output");
  const form = document.getElementById("adv-form");
  const input = document.getElementById("adv-input");

  if (!modal || !output || !form || !input) return;

  let game = null;
  let state = null;
  let gameOver = false;
  const roomCache = new Map();
  const history = [];
  let historyIdx = 0;

  function print(text, cls) {
    if (text === undefined || text === null) return;
    const lines = ("" + text).split("\n");
    lines.forEach(function (ln) {
      const span = document.createElement("span");
      span.className = "adv-line" + (cls ? " " + cls : "");
      span.textContent = ln.length ? ln : " ";
      output.appendChild(span);
    });
    output.scrollTop = output.scrollHeight;
  }
  function blank() { print(" "); }

  async function fetchJSON(url) {
    const r = await fetch(url, { cache: "no-store" });
    if (!r.ok) throw new Error("fetch " + url + " -> " + r.status);
    return r.json();
  }

  async function loadRoom(id) {
    if (!roomCache.has(id)) {
      const room = await fetchJSON("/games/" + game.id + "/rooms/" + id + ".json");
      roomCache.set(id, room);
    }
    return applyExitOverrides(roomCache.get(id));
  }

  function applyExitOverrides(room) {
    if (!state || !state.exit_overrides) return room;
    const overrides = state.exit_overrides[room.id];
    if (!overrides) return room;
    const merged = Object.assign({}, room.exits || {});
    Object.keys(overrides).forEach(function (k) {
      if (overrides[k] === null) delete merged[k];
      else merged[k] = overrides[k];
    });
    return Object.assign({}, room, { exits: merged });
  }

  function prefetchAdjacent(room) {
    if (!room || !room.exits) return;
    Object.values(room.exits).forEach(function (id) {
      if (!roomCache.has(id)) {
        fetchJSON("/games/" + game.id + "/rooms/" + id + ".json")
          .then(function (r) { roomCache.set(id, r); })
          .catch(function () {});
      }
    });
  }

  function itemsHere() {
    return Object.entries(game.items || {})
      .filter(function (e) { return state.locations[e[0]] === state.room; })
      .map(function (e) { return Object.assign({ id: e[0] }, e[1]); });
  }

  function inventoryItems() {
    return state.inventory.map(function (id) {
      return Object.assign({ id: id }, game.items[id]);
    });
  }

  function findItemId(noun) {
    if (!noun) return null;
    noun = noun.toLowerCase().trim();
    const ids = Object.keys(game.items || {});
    if (ids.indexOf(noun) > -1) return noun;
    return ids.find(function (id) {
      const name = (game.items[id].name || "").toLowerCase();
      if (name === noun) return true;
      return name.split(/\s+/).indexOf(noun) > -1;
    }) || null;
  }

  function isDark(room) {
    if (!room || !room.dark) return false;
    if (state.flags.lamp_lit && state.inventory.indexOf("lamp") >= 0) return false;
    return true;
  }

  function describeRoom(room) {
    if (isDark(room)) {
      print("It is now pitch dark. If I proceed I am likely to fall into a pit.", "adv-error");
      return;
    }
    print("I'm in " + (room.name || room.id) + ".", "adv-room-name");
    if (room.description) print(room.description);
    const exits = Object.keys(room.exits || {});
    if (exits.length) print("Obvious exits: " + exits.join(", ") + ".", "adv-info");
    const here = itemsHere().filter(function (i) { return i.name; });
    if (here.length) print("I can also see: " + here.map(function (i) { return i.name; }).join(", ") + ".", "adv-info");
  }

  function normalizeVerb(word) {
    if (!word) return null;
    word = word.toLowerCase();
    if (DIRS[word]) return "go";
    if (!game.verbs) return word;
    for (let i = 0; i < game.verbs.length; i++) {
      const v = game.verbs[i];
      if (v.word === word) return v.word;
      if (v.aliases && v.aliases.indexOf(word) > -1) return v.word;
    }
    return word;
  }

  function nounMatch(triggerNoun, evtNoun) {
    if (!triggerNoun) return true;
    if (!evtNoun) return false;
    const t = triggerNoun.toLowerCase();
    const e = evtNoun.toLowerCase();
    if (t === e) return true;
    if (e.split(/\s+/).indexOf(t) > -1) return true;
    const id = findItemId(e);
    if (id && t === id) return true;
    return false;
  }

  function checkConditions(cond) {
    if (!cond) return true;
    if (cond.flag && !state.flags[cond.flag]) return false;
    if (cond.not_flag && state.flags[cond.not_flag]) return false;
    if (cond.has && state.inventory.indexOf(cond.has) < 0) return false;
    if (cond.not_has && state.inventory.indexOf(cond.not_has) >= 0) return false;
    if (cond.here && state.locations[cond.here] !== state.room) return false;
    if (cond.not_here && state.locations[cond.not_here] === state.room) return false;
    if (cond.room && cond.room !== state.room) return false;
    return true;
  }

  function moveItem(item, to) {
    const target = (to === "_here") ? state.room : to;
    state.inventory = state.inventory.filter(function (x) { return x !== item; });
    state.locations[item] = target;
    if (target === "_inv") state.inventory.push(item);
  }

  function takeRandomTreasure() {
    const candidates = Object.keys(game.items).filter(function (id) {
      const it = game.items[id];
      if (!it.treasure) return false;
      const loc = state.locations[id];
      return loc !== "_nowhere" && loc !== game.treasure_room;
    });
    if (!candidates.length) return;
    const pick = candidates[Math.floor(Math.random() * candidates.length)];
    moveItem(pick, "_nowhere");
    print("The genie grabs the " + game.items[pick].name + " and is gone!", "adv-error");
  }

  async function runActions(actions) {
    let blocked = false;
    for (const a of actions) {
      if (a.say !== undefined) print(a.say);
      if (a.set_flag) state.flags[a.set_flag] = true;
      if (a.clear_flag) delete state.flags[a.clear_flag];
      if (a.move_player) {
        state.room = a.move_player;
        const r = await loadRoom(state.room);
        blank();
        describeRoom(r);
        prefetchAdjacent(r);
      }
      if (a.move_item) moveItem(a.move_item.item, a.move_item.to);
      if (a.move_inventory_to) {
        const dest = a.move_inventory_to;
        state.inventory.slice().forEach(function (id) { moveItem(id, dest); });
      }
      if (a.add_exit) {
        state.exit_overrides = state.exit_overrides || {};
        state.exit_overrides[a.add_exit.from] = state.exit_overrides[a.add_exit.from] || {};
        state.exit_overrides[a.add_exit.from][a.add_exit.dir] = a.add_exit.to;
      }
      if (a.remove_exit) {
        state.exit_overrides = state.exit_overrides || {};
        state.exit_overrides[a.remove_exit.from] = state.exit_overrides[a.remove_exit.from] || {};
        state.exit_overrides[a.remove_exit.from][a.remove_exit.dir] = null;
      }
      if (a.take_random_treasure) takeRandomTreasure();
      if (a.end_game) {
        blank();
        print(a.end_game.message || "GAME OVER", "adv-system");
        gameOver = true;
        blocked = true;
      }
      if (a.block) blocked = true;
    }
    return blocked;
  }

  async function runTriggers(verb, noun) {
    const triggers = game.triggers || [];
    for (const t of triggers) {
      if (!t || !t.when) continue;
      if (t.when.phase) continue;
      if (t.when.verb && t.when.verb !== verb) continue;
      if (t.when.noun && !nounMatch(t.when.noun, noun)) continue;
      const cond = Object.assign({}, t["if"] || {});
      if (t.when.room) cond.room = t.when.room;
      if (!checkConditions(cond)) continue;
      const blocked = await runActions(t["do"] || []);
      if (blocked) return true;
    }
    return false;
  }

  async function handle(line) {
    const raw = line.trim();
    if (!raw) return;

    print("> " + raw, "adv-cmd-echo");
    history.push(raw);
    historyIdx = history.length;

    if (gameOver) {
      const w = raw.toLowerCase().split(/\s+/)[0];
      if (w === "restart") return await cmdRestart();
      if (w === "quit" || w === "q") return cmdQuit();
      print("The game is over. Type RESTART to play again or QUIT to close.", "adv-info");
      return;
    }

    const parts = raw.toLowerCase().split(/\s+/);
    let verb = normalizeVerb(parts[0]);
    let noun = parts.slice(1).join(" ").replace(/^(the|a|an|some)\s+/, "");
    if (DIRS[parts[0]]) { verb = "go"; noun = DIRS[parts[0]]; }

    const blocked = await runTriggers(verb, noun);
    if (blocked) {
      state.turns++;
      postTurn();
      return;
    }

    state.turns++;
    await doVerb(verb, noun);
    postTurn();
  }

  async function doVerb(verb, noun) {
    switch (verb) {
      case "go":        return await cmdGo(noun);
      case "look":      return await cmdLook();
      case "take":      return cmdTake(noun);
      case "drop":      return cmdDrop(noun);
      case "inventory": return cmdInv();
      case "score":     return cmdScore();
      case "save":      return cmdSave(noun || "1");
      case "load":      return await cmdLoad(noun || "1");
      case "help":      return cmdHelp();
      case "quit":      return cmdQuit();
      case "restart":   return await cmdRestart();
      case "examine":   return cmdExamine(noun);
      case "say":       return print("Nothing happens.");
      default:
        print("I don't know how to \"" + verb + "\".", "adv-error");
    }
  }

  function postTurn() {
    autoSave();
    if (state.flags.lamp_lit && state.inventory.indexOf("lamp") >= 0) {
      state.lamp_turns = (state.lamp_turns || 0) + 1;
      const cap = game.lamp_turns || 60;
      const left = cap - state.lamp_turns;
      if (left === 10) print("My lamp is getting dim.", "adv-info");
      else if (left === 3) print("My lamp is sputtering!", "adv-info");
      if (left <= 0) {
        delete state.flags.lamp_lit;
        print("My lamp has gone out!", "adv-error");
      }
    }
    const cur = roomCache.get(state.room);
    if (!gameOver && cur && cur.dark && !(state.flags.lamp_lit && state.inventory.indexOf("lamp") >= 0)) {
      // Standing in the dark without a lamp: no immediate death, but warn.
      // Movement in the dark already prints stumble text.
    }
    if (!gameOver && state.room === "meadow" && state.inventory.indexOf("mud") >= 0 && !state.flags.dragon_gone) {
      blank();
      print("The dragon's nostrils flare — it smells the mud! With a roar of fury it rears up and incinerates me with a single blast.", "adv-error");
      print("*** YOU HAVE DIED ***   Type RESTART to try again.", "adv-system");
      gameOver = true;
      return;
    }
    checkWin();
  }

  function checkWin() {
    if (gameOver) return;
    let pts = 0, total = 0, n = 0;
    Object.keys(game.items).forEach(function (id) {
      const it = game.items[id];
      if (it.treasure) {
        total += it.value || 0;
        if (state.locations[id] === game.treasure_room) { pts += it.value || 0; n++; }
      }
    });
    if (n >= (game.treasure_count || total) && pts >= total && total > 0) {
      blank();
      print("FANTASTIC! You've solved it ALL!", "adv-treasure");
      print("Final score: " + pts + " / " + total + " in " + state.turns + " turns.", "adv-treasure");
      gameOver = true;
    }
  }

  async function cmdGo(dirRaw) {
    if (!dirRaw) return print("Go where?", "adv-error");
    const room = await loadRoom(state.room);
    const dir = DIRS[dirRaw] || dirRaw;
    const target = (room.exits || {})[dir] || (room.exits || {})[dirRaw];
    if (!target) return print("I can't go " + dirRaw + " from here.", "adv-error");
    state.room = target;
    const next = await loadRoom(target);
    blank();
    describeRoom(next);
    prefetchAdjacent(next);
  }

  async function cmdLook() {
    const room = await loadRoom(state.room);
    describeRoom(room);
  }

  function cmdTake(noun) {
    if (!noun) return print("Take what?", "adv-error");
    const id = findItemId(noun);
    if (!id) return print("I don't see that here.", "adv-error");
    if (state.locations[id] !== state.room) return print("I don't see that here.", "adv-error");
    if (!game.items[id].portable) return print("I can't take that.", "adv-error");
    moveItem(id, "_inv");
    print("Taken: " + game.items[id].name + ".");
  }

  function cmdDrop(noun) {
    if (!noun) return print("Drop what?", "adv-error");
    const id = findItemId(noun);
    if (!id || state.inventory.indexOf(id) < 0) return print("I'm not carrying that.", "adv-error");
    moveItem(id, state.room);
    print("Dropped: " + game.items[id].name + ".");
  }

  function cmdInv() {
    const inv = inventoryItems();
    if (!inv.length) return print("I'm not carrying anything.");
    print("I'm carrying: " + inv.map(function (i) { return i.name; }).join(", ") + ".");
  }

  function cmdScore() {
    let pts = 0, total = 0, n = 0;
    Object.keys(game.items).forEach(function (id) {
      const it = game.items[id];
      if (it.treasure) {
        total += it.value || 0;
        if (state.locations[id] === game.treasure_room) { pts += it.value || 0; n++; }
      }
    });
    print("Score: " + pts + " / " + total + " — " + n + " of " + (game.treasure_count || total) + " treasures stowed (turns: " + state.turns + ").", "adv-info");
  }

  function cmdHelp() {
    print("COMMANDS", "adv-info");
    print(" ");
    print("Movement", "adv-info");
    print("  N  S  E  W  U  D     (or GO <direction>)");
    print("  Named exits like GO HOLE, GO STUMP, GO THRONE");
    print(" ");
    print("Things", "adv-info");
    print("  TAKE <thing>      GET <thing>");
    print("  DROP <thing>      EXAMINE <thing>");
    print("  INVENTORY (I)");
    print(" ");
    print("Magic", "adv-info");
    print("  SAY <word>        RUB <thing>");
    print("  CHOP <thing>      LIGHT <thing>");
    print("  UNLIGHT <thing>   POUR <thing>");
    print("  IGNITE <thing>    BUILD <thing>");
    print("  UNLOCK <thing>    READ <thing>");
    print("  YELL              JUMP");
    print(" ");
    print("Game", "adv-info");
    print("  LOOK              SCORE");
    print("  SAVE [slot]       LOAD [slot]");
    print("  RESTART           QUIT");
    print(" ");
    print("Progress auto-saves. RESTART wipes the auto-save.", "adv-info");
  }

  function cmdQuit() {
    print("Goodbye.", "adv-system");
    setTimeout(closeModal, 600);
  }

  function cmdExamine(noun) {
    if (!noun) return cmdLook();
    const id = findItemId(noun);
    if (!id) return print("I see nothing special.");
    print(game.items[id].name + (game.items[id].treasure ? " (looks valuable)" : "") + ".");
  }

  function cmdSave(slot) {
    const key = SAVE_PREFIX + game.id + "." + slot;
    try {
      localStorage.setItem(key, JSON.stringify(snapshotState()));
      print("Saved to slot " + slot + ".", "adv-system");
    } catch (e) { print("Save failed: " + e.message, "adv-error"); }
  }

  async function cmdLoad(slot) {
    const key = SAVE_PREFIX + game.id + "." + slot;
    const raw = localStorage.getItem(key);
    if (!raw) return print("No save in slot " + slot + ".", "adv-error");
    try {
      restoreState(JSON.parse(raw));
      print("Restored from slot " + slot + ".", "adv-system");
      blank();
      const room = await loadRoom(state.room);
      describeRoom(room);
    } catch (e) { print("Load failed: " + e.message, "adv-error"); }
  }

  async function cmdRestart() {
    localStorage.removeItem(autoKey());
    blank();
    print("Starting a new game.", "adv-system");
    gameOver = false;
    await startFresh();
  }

  function snapshotState() {
    return {
      v: 2,
      room: state.room,
      inventory: state.inventory,
      locations: state.locations,
      flags: state.flags,
      turns: state.turns,
      lamp_turns: state.lamp_turns,
      exit_overrides: state.exit_overrides
    };
  }

  function restoreState(blob) {
    state.room = blob.room;
    state.inventory = blob.inventory || [];
    state.locations = blob.locations || {};
    state.flags = blob.flags || {};
    state.turns = blob.turns || 0;
    state.lamp_turns = blob.lamp_turns || 0;
    state.exit_overrides = blob.exit_overrides || {};
    gameOver = false;
  }

  function autoKey() { return SAVE_PREFIX + game.id + "." + AUTO_SLOT; }

  function autoSave() {
    if (!game || !state) return;
    try { localStorage.setItem(autoKey(), JSON.stringify(snapshotState())); } catch (e) {}
  }

  async function loadAuto() {
    const raw = localStorage.getItem(autoKey());
    if (!raw) return false;
    try {
      restoreState(JSON.parse(raw));
      blank();
      print("Resuming where I left off (turn " + state.turns + ").", "adv-system");
      blank();
      const room = await loadRoom(state.room);
      describeRoom(room);
      prefetchAdjacent(room);
      return true;
    } catch (e) {
      print("Auto-save was unreadable; starting fresh.", "adv-error");
      return false;
    }
  }

  function freshState() {
    const locations = {};
    Object.keys(game.items).forEach(function (id) {
      locations[id] = game.items[id].starts_in;
    });
    return {
      room: game.start_room,
      inventory: [],
      locations: locations,
      flags: {},
      turns: 0,
      lamp_turns: 0,
      exit_overrides: {}
    };
  }

  async function startFresh() {
    state = freshState();
    gameOver = false;
    blank();
    const room = await loadRoom(state.room);
    describeRoom(room);
    prefetchAdjacent(room);
    autoSave();
  }

  async function startGame(id) {
    output.innerHTML = "";
    roomCache.clear();
    gameOver = false;
    game = await fetchJSON("/games/" + id + "/manifest.json");
    state = freshState();
    titleEl.textContent = (game.title || id).toUpperCase();
    if (game.intro) print(game.intro, "adv-system");
    if (localStorage.getItem(autoKey())) {
      const ok = await loadAuto();
      if (!ok) await startFresh();
    } else {
      await startFresh();
    }
    input.focus();
  }

  function openModal(id) {
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    startGame(id).catch(function (e) {
      print("Failed to load game: " + e.message, "adv-error");
    });
  }

  function closeModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }

  function showCredits() {
    if (!game) return;
    blank();
    print("--- CREDITS ---", "adv-system");
    print(game.credits || "(no credits)", "adv-system");
    print("---------------", "adv-system");
  }

  document.querySelectorAll("[data-game]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      const id = btn.getAttribute("data-game");
      if (id) openModal(id);
    });
  });
  modal.querySelectorAll("[data-adv-close]").forEach(function (el) {
    el.addEventListener("click", closeModal);
  });
  modal.querySelectorAll("[data-adv-action='credits']").forEach(function (el) {
    el.addEventListener("click", showCredits);
  });

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    const v = input.value;
    input.value = "";
    handle(v).catch(function (err) { print("Engine error: " + err.message, "adv-error"); });
  });

  input.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp") {
      if (history.length && historyIdx > 0) { historyIdx--; input.value = history[historyIdx]; e.preventDefault(); }
    } else if (e.key === "ArrowDown") {
      if (history.length && historyIdx < history.length - 1) { historyIdx++; input.value = history[historyIdx]; e.preventDefault(); }
      else { historyIdx = history.length; input.value = ""; }
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && modal.classList.contains("active")) closeModal();
  });
})();
