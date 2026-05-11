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
      <div class="game-card-actions">
        <button class="game-reset-btn" data-reset-for="adventureland" hidden>Reset</button>
        <button class="game-play-btn" data-game="adventureland">Play</button>
      </div>
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
      <div class="game-card-actions">
        <button class="game-reset-btn" data-reset-for="scorched" hidden>Reset</button>
        <button class="game-play-btn" data-canvas-game="scorched">Play</button>
      </div>
    </footer>
  </article>

  <article class="game-card">
    <header class="game-card-header">
      <h2 class="game-card-title">Paradroid</h2>
      <span class="game-card-tag">[work in progress]</span>
    </header>
    <div class="game-card-body">
      <p class="game-meta">Andrew Braybrook &middot; 1985 &middot; The C64 classic.</p>
      <p>You are the Influence Device aboard the freighter <em>Good Hope</em>, overrun by mutinous droids. Shoot them, or transfer into them and wear their chassis. Climb the droid hierarchy from a feeble 001 to the 999 Command Cyborg, deck by deck.</p>
    </div>
    <footer class="game-card-footer">
      <span class="game-card-status" data-status-for="paradroid"></span>
      <div class="game-card-actions">
        <button class="game-reset-btn" data-reset-for="paradroid" hidden>Reset</button>
        <button class="game-play-btn" data-canvas-game="paradroid">Play</button>
      </div>
    </footer>
  </article>
</div>

<script>
  (function () {
    function setStatus(key, text, hasProgress) {
      var statusEl = document.querySelector('.game-card-status[data-status-for="' + key + '"]');
      var resetEl  = document.querySelector('.game-reset-btn[data-reset-for="' + key + '"]');
      if (statusEl) statusEl.textContent = text;
      if (resetEl) resetEl.hidden = !hasProgress;
    }

    function refreshAdventureland() {
      try {
        var raw = localStorage.getItem("rsow.adv.save.adventureland._auto");
        if (raw) {
          var save = JSON.parse(raw);
          if (save && save.turns && save.turns >= 1) {
            var room = save.room ? " · in " + save.room.replace(/_/g, " ") : "";
            setStatus("adventureland", save.turns + " turns" + room, true);
            return;
          }
        }
      } catch (e) {}
      setStatus("adventureland", "no progress yet", false);
    }

    function refreshScorched() {
      try {
        var raw = localStorage.getItem("rsow.scorched.bank");
        if (raw) {
          var n = parseInt(raw, 10);
          if (isFinite(n) && n > 0) {
            setStatus("scorched", "Bank: $" + n.toLocaleString(), true);
            return;
          }
        }
      } catch (e) {}
      setStatus("scorched", "no progress yet", false);
    }

    function refreshParadroid() {
      try {
        var raw = localStorage.getItem("rsow.paradroid.save");
        if (raw) {
          var save = JSON.parse(raw);
          if (save && save.currentDeck) {
            var droid = save.currentDroid ? " · droid " + save.currentDroid : "";
            setStatus("paradroid", "Deck " + save.currentDeck + droid, true);
            return;
          }
        }
      } catch (e) {}
      setStatus("paradroid", "no progress yet", false);
    }

    function clearAdventureland() {
      if (!confirm("Wipe all Adventureland progress? This can't be undone.")) return;
      try {
        var prefix = "rsow.adv.save.adventureland.";
        for (var i = localStorage.length - 1; i >= 0; i--) {
          var k = localStorage.key(i);
          if (k && k.indexOf(prefix) === 0) localStorage.removeItem(k);
        }
      } catch (e) {}
      window.location.reload();
    }

    function clearScorched() {
      if (!confirm("Wipe your Scorched Earth bank balance? This can't be undone.")) return;
      try { localStorage.removeItem("rsow.scorched.bank"); } catch (e) {}
      window.location.reload();
    }

    function clearParadroid() {
      if (!confirm("Wipe all Paradroid progress? This can't be undone.")) return;
      try {
        localStorage.removeItem("rsow.paradroid.save");
        localStorage.removeItem("rsow.paradroid.hiscore");
      } catch (e) {}
      window.location.reload();
    }

    refreshAdventureland();
    refreshScorched();
    refreshParadroid();

    document.querySelectorAll(".game-reset-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var key = btn.getAttribute("data-reset-for");
        if (key === "adventureland") clearAdventureland();
        else if (key === "scorched")   clearScorched();
        else if (key === "paradroid")  clearParadroid();
      });
    });
  })();
</script>
