---
title: Games
layout: page
permalink: /games/
---

A small collection of classic games from my childhood — ones I loved and have tried to faithfully recreate so you can play them right here in your browser. No downloads, no logins, no servers; saves live in your browser only.

<div class="games-grid">
  <article class="game-card">
    <header class="game-card-header">
      <h2 class="game-card-title">Adventureland</h2>
      <span class="game-card-tag">[work in progress]</span>
    </header>
    <div class="game-card-body">
      <p class="game-meta">Scott Adams &middot; 1978 &middot; The first commercial text adventure ever published.</p>
      <p>Wander a forest of tall trees, a hollow stump, and the caverns below in search of thirteen lost treasures. Watch out for the dragon, the bees, and the bear.</p>
    </div>
    <footer class="game-card-footer">
      <span class="game-card-status" data-status-for="adventureland"></span>
      <button class="game-play-btn" data-game="adventureland">Play</button>
    </footer>
  </article>

  <article class="game-card">
    <header class="game-card-header">
      <h2 class="game-card-title">Scorched Earth</h2>
      <span class="game-card-tag">[work in progress]</span>
    </header>
    <div class="game-card-body">
      <p class="game-meta">Wendell Hicken &middot; 1991 &middot; "The mother of all games."</p>
      <p>Pit your tank against the computer on a procedurally generated battlefield. Adjust your angle, dial in your power, account for the wind &mdash; and pray. A persistent bank carries between sessions; spend it in the shop on shells, shields, and parachutes.</p>
    </div>
    <footer class="game-card-footer">
      <span class="game-card-status" data-status-for="scorched"></span>
      <button class="game-play-btn" data-canvas-game="scorched">Play</button>
    </footer>
  </article>
</div>

<script>
  (function () {
    function setStatus(key, text) {
      var el = document.querySelector('.game-card-status[data-status-for="' + key + '"]');
      if (el) el.textContent = text;
    }

    try {
      var raw = localStorage.getItem("rsow.adv.save.adventureland._auto");
      if (raw) {
        var save = JSON.parse(raw);
        if (save && save.turns && save.turns >= 1) {
          var room = save.room ? " · in " + save.room.replace(/_/g, " ") : "";
          setStatus("adventureland", save.turns + " turns" + room);
        } else {
          setStatus("adventureland", "no progress yet");
        }
      } else {
        setStatus("adventureland", "no progress yet");
      }
    } catch (e) { setStatus("adventureland", "no progress yet"); }

    try {
      var raw2 = localStorage.getItem("rsow.scorched.bank");
      if (raw2) {
        var n = parseInt(raw2, 10);
        if (isFinite(n) && n > 0) {
          setStatus("scorched", "Bank: $" + n.toLocaleString());
        } else {
          setStatus("scorched", "no progress yet");
        }
      } else {
        setStatus("scorched", "no progress yet");
      }
    } catch (e) { setStatus("scorched", "no progress yet"); }
  })();
</script>
