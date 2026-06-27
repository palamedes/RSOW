/* ════════════════════════════════════════════════════════════════
   The Drip Fund — /investments
   Tabs · dashboard charts · forecast simulator (with Monte Carlo) ·
   story animations · optional live prices.
   Reads data from window.DRIP (injected by the page).
   ════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var D = window.DRIP || {};
  var H = D.holdings || [];

  /* ─── Live prices (optional) ──────────────────────────────────
     Free, client-side. Leave the key blank and the page happily shows
     the snapshot. To switch live prices on, grab a free key at
     finnhub.io and paste it below, or set window.DRIP_FINNHUB_KEY
     before this script loads.                                       */
  var FINNHUB_KEY = window.DRIP_FINNHUB_KEY || '';

  var root = document.getElementById('inv-app');
  if (!root) return;

  /* ─── tiny helpers ──────────────────────────────────────────── */
  function $(sel, ctx) { return (ctx || document).querySelector(sel); }
  function $all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }
  function cv(name, fb) { var v = getComputedStyle(root).getPropertyValue(name).trim(); return v || fb; }

  var C = {
    accent: cv('--inv-accent', '#2673da'),
    gain: cv('--inv-gain', '#15915b'),
    loss: cv('--inv-loss', '#cc4b3e'),
    build: cv('--inv-build', '#1f9d6b'),
    hold: cv('--inv-hold', '#2673da'),
    monitor: cv('--inv-monitor', '#c8861d'),
    muted: cv('--inv-muted', '#666'),
    line: cv('--inv-line', '#ddd')
  };
  function tierColor(t) { return t === 'build' ? C.build : t === 'monitor' ? C.monitor : C.hold; }

  function money(n) { return '$' + Math.round(n).toLocaleString('en-US'); }
  function moneyC(n) { // compact for axes
    n = Math.round(n);
    if (Math.abs(n) >= 1e6) return '$' + (n / 1e6).toFixed(n % 1e6 === 0 ? 0 : 1) + 'M';
    if (Math.abs(n) >= 1e3) return '$' + Math.round(n / 1e3) + 'k';
    return '$' + n;
  }
  function pct(n, dp) { return (n >= 0 ? '+' : '') + n.toFixed(dp == null ? 1 : dp) + '%'; }

  function hex2rgb(h) { h = h.replace('#', ''); return [parseInt(h.substr(0, 2), 16), parseInt(h.substr(2, 2), 16), parseInt(h.substr(4, 2), 16)]; }
  function mixWhite(hex, t) { var c = hex2rgb(hex); return 'rgb(' + Math.round(c[0] + (255 - c[0]) * t) + ',' + Math.round(c[1] + (255 - c[1]) * t) + ',' + Math.round(c[2] + (255 - c[2]) * t) + ')'; }
  function alpha(hex, a) { var c = hex2rgb(hex); return 'rgba(' + c[0] + ',' + c[1] + ',' + c[2] + ',' + a + ')'; }

  var hasChart = (typeof Chart !== 'undefined');
  if (hasChart) {
    Chart.defaults.font.family = "'Nunito Sans', Arial, sans-serif";
    Chart.defaults.color = C.muted;
    Chart.defaults.font.size = 12;
  }
  var charts = {};
  var built = { dashboard: false, forecast: false, story: false };

  /* ════════════════════════════════════════════════════════════
     TABS
     ════════════════════════════════════════════════════════════ */
  function showTab(name) {
    $all('.inv-tab').forEach(function (b) { b.setAttribute('aria-selected', String(b.dataset.tab === name)); });
    $all('.inv-panel').forEach(function (p) { p.hidden = (p.dataset.panel !== name); });
    if (name === 'dashboard' && !built.dashboard) { built.dashboard = true; buildDashboard(); }
    if (name === 'forecast' && !built.forecast) { built.forecast = true; buildForecast(); }
    if (name === 'story' && !built.story) { built.story = true; revealStory(); }
    // charts need a resize nudge when their panel becomes visible
    Object.keys(charts).forEach(function (k) { if (charts[k]) charts[k].resize(); });
    if (history.replaceState) history.replaceState(null, '', '#' + name);
  }
  function initTabs() {
    $all('.inv-tab').forEach(function (b) {
      b.addEventListener('click', function () { showTab(b.dataset.tab); });
    });
    var hash = (location.hash || '').replace('#', '');
    var start = (hash === 'forecast' || hash === 'story') ? hash : 'dashboard';
    showTab(start);
  }

  /* ════════════════════════════════════════════════════════════
     DASHBOARD CHARTS
     ════════════════════════════════════════════════════════════ */
  function buildDashboard() {
    if (!hasChart) return;
    var order = { build: 0, hold: 1, monitor: 2 };

    /* — Allocation donut, shaded by tier — */
    var alloc = H.slice().sort(function (a, b) {
      return (order[a.tier] - order[b.tier]) || (b.value - a.value);
    });
    var seen = {};
    var aColors = alloc.map(function (h) {
      seen[h.tier] = (seen[h.tier] || 0);
      var shade = Math.min(0.55, seen[h.tier] * 0.11);
      seen[h.tier]++;
      return mixWhite(tierColor(h.tier), shade);
    });
    var total = alloc.reduce(function (s, h) { return s + h.value; }, 0);
    charts.alloc = new Chart($('#chart-alloc'), {
      type: 'doughnut',
      data: {
        labels: alloc.map(function (h) { return h.ticker; }),
        datasets: [{ data: alloc.map(function (h) { return h.value; }), backgroundColor: aColors, borderColor: '#fff', borderWidth: 2, hoverOffset: 6 }]
      },
      options: {
        responsive: true, maintainAspectRatio: false, cutout: '58%',
        plugins: {
          legend: { position: 'right', labels: { boxWidth: 10, boxHeight: 10, font: { size: 10 }, padding: 6 } },
          tooltip: { callbacks: { label: function (ctx) { var v = ctx.parsed; return ' ' + ctx.label + '  ' + money(v) + '  (' + (v / total * 100).toFixed(1) + '%)'; } } }
        }
      }
    });

    /* — Income by holding (horizontal, top payers first) — */
    var inc = H.filter(function (h) { return h.annualIncome > 0; }).sort(function (a, b) { return b.annualIncome - a.annualIncome; });
    charts.income = new Chart($('#chart-income'), {
      type: 'bar',
      data: {
        labels: inc.map(function (h) { return h.ticker; }),
        datasets: [{ data: inc.map(function (h) { return h.annualIncome; }), backgroundColor: inc.map(function (h) { return alpha(C.gain, 0.85); }), borderColor: C.gain, borderWidth: 1, borderRadius: 3 }]
      },
      options: {
        indexAxis: 'y', responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (ctx) { var h = inc[ctx.dataIndex]; return ' ' + money(h.annualIncome) + '/yr  ·  ' + (h.annualIncome / h.value * 100).toFixed(1) + '% run-rate'; } } }
        },
        scales: { x: { ticks: { callback: function (v) { return moneyC(v); } }, grid: { color: '#f0f0f0' } }, y: { grid: { display: false } } }
      }
    });

    /* — Gain / loss diverging bars — */
    var gl = H.slice().sort(function (a, b) { return b.gain - a.gain; });
    charts.gl = new Chart($('#chart-gl'), {
      type: 'bar',
      data: {
        labels: gl.map(function (h) { return h.ticker; }),
        datasets: [{
          data: gl.map(function (h) { return h.gain; }),
          backgroundColor: gl.map(function (h) { return alpha(h.gain >= 0 ? C.gain : C.loss, 0.85); }),
          borderColor: gl.map(function (h) { return h.gain >= 0 ? C.gain : C.loss; }),
          borderWidth: 1, borderRadius: 3
        }]
      },
      options: {
        responsive: true, maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: { callbacks: { label: function (ctx) { var h = gl[ctx.dataIndex]; return ' ' + (h.gain >= 0 ? '+' : '') + money(h.gain) + '  (' + pct(h.gainPct) + ')'; } } }
        },
        scales: {
          x: { grid: { display: false }, ticks: { font: { family: "'SFMono-Regular',monospace", size: 11 } } },
          y: { ticks: { callback: function (v) { return moneyC(v); } }, grid: { color: function (c) { return c.tick.value === 0 ? '#bbb' : '#f0f0f0'; } } }
        }
      }
    });

    initChartSwitch();
  }

  // sub-tabs that swap the two-up overview charts for the winners/laggards chart
  function initChartSwitch() {
    var map = { overview: ['alloc', 'income'], gl: ['gl'] };
    $all('.inv-cs-tab').forEach(function (tab) {
      tab.addEventListener('click', function () {
        var view = tab.dataset.csview;
        $all('.inv-cs-tab').forEach(function (t) { t.setAttribute('aria-selected', String(t === tab)); });
        $all('.inv-cs-panel').forEach(function (p) { p.hidden = (p.dataset.csview !== view); });
        (map[view] || []).forEach(function (k) { if (charts[k]) charts[k].resize(); });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     FORECAST SIMULATOR
     ════════════════════════════════════════════════════════════ */
  var MODE = 'line';
  var ANNUAL_VOL = 0.13; // assumed volatility for the range model

  function readParams() {
    return {
      start: +$('#sim-start').value,
      contrib: +$('#sim-contrib').value,
      r: +$('#sim-return').value / 100,
      y: +$('#sim-yield').value / 100,
      years: +$('#sim-years').value,
      mortOn: $('#sim-mortgage').checked,
      mortYear: +$('#sim-payoff-year').value,
      mortContrib: +$('#sim-payoff-contrib').value
    };
  }
  function contribAt(p, month) {
    var yr = Math.ceil(month / 12);
    return (p.mortOn && yr >= p.mortYear) ? p.mortContrib : p.contrib;
  }
  // deterministic monthly compounding → year-end values
  function project(p) {
    var val = p.start, contributed = p.start, out = [p.start];
    var mr = p.r / 12, N = p.years * 12;
    for (var m = 1; m <= N; m++) {
      var c = contribAt(p, m);
      val = val * (1 + mr) + c;
      contributed += c;
      if (m % 12 === 0) out.push(val);
    }
    return { values: out, contributed: contributed };
  }
  // Box–Muller standard normal
  function gauss() {
    var u = 0, v = 0;
    while (u === 0) u = Math.random();
    while (v === 0) v = Math.random();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
  }
  function monteCarlo(p, K) {
    var N = p.years * 12, mr = p.r / 12, mv = ANNUAL_VOL / Math.sqrt(12);
    var perYear = []; for (var y = 0; y <= p.years; y++) perYear.push([]);
    for (var k = 0; k < K; k++) {
      var val = p.start;
      perYear[0].push(val);
      for (var m = 1; m <= N; m++) {
        val = val * (1 + mr + gauss() * mv) + contribAt(p, m);
        if (val < 0) val = 0;
        if (m % 12 === 0) perYear[m / 12].push(val);
      }
    }
    function pctl(arr, q) { var a = arr.slice().sort(function (x, y) { return x - y; }); return a[Math.min(a.length - 1, Math.floor(q * (a.length - 1)))]; }
    return {
      p10: perYear.map(function (a) { return pctl(a, 0.10); }),
      p50: perYear.map(function (a) { return pctl(a, 0.50); }),
      p90: perYear.map(function (a) { return pctl(a, 0.90); })
    };
  }

  function ensureForecastChart(labels) {
    if (charts.forecast) return charts.forecast;
    charts.forecast = new Chart($('#chart-forecast'), {
      type: 'line',
      data: { labels: labels, datasets: [] },
      options: {
        responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { labels: { boxWidth: 12, usePointStyle: true, font: { size: 11 } } },
          tooltip: { callbacks: { label: function (ctx) { return ' ' + ctx.dataset.label + ': ' + money(ctx.parsed.y); } } }
        },
        scales: {
          x: { title: { display: true, text: 'years from now', color: C.muted, font: { size: 10 } }, grid: { display: false } },
          y: { position: 'left', title: { display: true, text: 'portfolio value', color: C.muted, font: { size: 10 } }, ticks: { callback: function (v) { return moneyC(v); } }, grid: { color: '#f0f0f0' } },
          y1: { position: 'right', title: { display: true, text: 'monthly income', color: C.muted, font: { size: 10 } }, ticks: { callback: function (v) { return moneyC(v); } }, grid: { display: false } }
        }
      }
    });
    return charts.forecast;
  }

  function renderForecast() {
    // sync slider read-outs
    var p = readParams();
    $('#out-start').textContent = money(p.start);
    $('#out-contrib').textContent = money(p.contrib);
    $('#out-return').textContent = (p.r * 100).toFixed(1) + '%';
    $('#out-yield').textContent = (p.y * 100).toFixed(1) + '%';
    $('#out-years').textContent = p.years;
    $('#out-payoff-year').textContent = p.mortYear;
    $('#out-payoff-contrib').textContent = money(p.mortContrib);
    $('#sim-mortgage-opts').hidden = !p.mortOn;

    var labels = []; for (var i = 0; i <= p.years; i++) labels.push(i);
    if (!hasChart) return;
    var chart = ensureForecastChart(labels);
    chart.data.labels = labels;

    var finalValue, contributed = project(p).contributed, datasets;

    if (MODE === 'range') {
      var mc = monteCarlo(p, 320);
      finalValue = mc.p50[p.years];
      var income = mc.p50.map(function (v) { return v * p.y / 12; });
      datasets = [
        { label: 'Rougher case (10th pct)', data: mc.p10, borderColor: alpha(C.accent, 0.0), backgroundColor: alpha(C.accent, 0.10), pointRadius: 0, fill: false, yAxisID: 'y', order: 3 },
        { label: 'Better case (90th pct)', data: mc.p90, borderColor: alpha(C.accent, 0.0), backgroundColor: alpha(C.accent, 0.12), pointRadius: 0, fill: '-1', yAxisID: 'y', order: 3 },
        { label: 'Expected (median)', data: mc.p50, borderColor: C.accent, backgroundColor: C.accent, borderWidth: 2.5, pointRadius: 0, tension: 0.15, fill: false, yAxisID: 'y', order: 1 },
        { label: 'Monthly income', data: income, borderColor: C.gain, backgroundColor: C.gain, borderWidth: 2, borderDash: [5, 4], pointRadius: 0, tension: 0.15, fill: false, yAxisID: 'y1', order: 2 }
      ];
      $('#sim-chart-title').textContent = 'A cone of outcomes, not a promise';
      $('#sim-chart-note').textContent = 'Shaded band = the middle 80% of ~320 randomized markets · dashed = expected monthly income';
    } else {
      var pr = project(p);
      finalValue = pr.values[p.years];
      var inc2 = pr.values.map(function (v) { return v * p.y / 12; });
      datasets = [
        { label: 'Portfolio value', data: pr.values, borderColor: C.accent, backgroundColor: alpha(C.accent, 0.12), borderWidth: 2.5, pointRadius: 0, tension: 0.15, fill: true, yAxisID: 'y', order: 1 },
        { label: 'Monthly income', data: inc2, borderColor: C.gain, backgroundColor: C.gain, borderWidth: 2, borderDash: [5, 4], pointRadius: 0, tension: 0.15, fill: false, yAxisID: 'y1', order: 2 }
      ];
      $('#sim-chart-title').textContent = 'Projected value & monthly income';
      $('#sim-chart-note').textContent = 'Reinvested dividends compounding over time · steady-average assumption';
    }
    chart.data.datasets = datasets;
    chart.update('none');

    // output tiles
    var annual = finalValue * p.y, monthly = annual / 12;
    $('#out-final-value').textContent = money(finalValue);
    $('#out-final-year').textContent = '(year ' + p.years + ')';
    $('#out-final-monthly').textContent = money(monthly);
    $('#out-final-annual').textContent = money(annual);
    $('#out-contributed').textContent = money(contributed);
  }

  var rafPending = false;
  function scheduleRender() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(function () { rafPending = false; renderForecast(); });
  }

  function buildForecast() {
    $all('#sim-controls input').forEach(function (el) { el.addEventListener('input', scheduleRender); });
    $all('.inv-seg').forEach(function (btn) {
      btn.addEventListener('click', function () {
        MODE = btn.dataset.mode;
        $all('.inv-seg').forEach(function (b) { b.setAttribute('aria-pressed', String(b === btn)); });
        renderForecast();
      });
    });
    renderForecast();
  }

  /* ════════════════════════════════════════════════════════════
     STORY — animate the yield-trap bars on first reveal
     ════════════════════════════════════════════════════════════ */
  function revealStory() {
    $all('.inv-yt-track span').forEach(function (bar) {
      var w = bar.getAttribute('data-w');
      bar.style.width = '0%';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { bar.style.width = w + '%'; });
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     LIVE PRICES (graceful — degrades to snapshot)
     ════════════════════════════════════════════════════════════ */
  function setLiveStatus(text, live) {
    var el = $('#inv-live-status'); if (el) el.textContent = text;
    var asof = $('#inv-asof'); if (asof) asof.classList.toggle('is-live', !!live);
  }
  function paintLive(ticker, q, suffix) {
    var el = root.querySelector('.inv-live[data-live="' + ticker + '"]');
    if (!el || !q || typeof q.c !== 'number' || q.c <= 0) return;
    var dp = (typeof q.dp === 'number') ? q.dp : 0;
    var dir = dp > 0.0001 ? 'up' : dp < -0.0001 ? 'down' : 'flat';
    var arrow = dir === 'up' ? '▲' : dir === 'down' ? '▼' : '·';
    var tail = (suffix == null) ? ' today' : (suffix ? ' ' + suffix : '');
    el.innerHTML = '<span class="inv-live-px">$' + q.c.toFixed(2) + '</span>' +
      '<span class="inv-live-chg ' + (dir === 'flat' ? '' : dir) + '">' + arrow + ' ' + (dp >= 0 ? '+' : '') + dp.toFixed(2) + '%' + tail + '</span>';
  }
  // Seed every badge with the real price + day move from the snapshot data,
  // so the dashboard looks current even before live prices are switched on.
  function paintSnapshotBadges() {
    H.forEach(function (h) {
      if (typeof h.price === 'number') paintLive(h.ticker, { c: h.price, dp: h.todayPct }, '');
    });
  }
  // Auto-refresh cadence (ms). Override with window.DRIP_REFRESH_MS; default 3 min.
  var REFRESH_MS = (typeof window.DRIP_REFRESH_MS === 'number' && window.DRIP_REFRESH_MS > 0) ? window.DRIP_REFRESH_MS : 180000;
  var liveLast = null, liveOk = 0, liveN = 0;

  function relTime(d) {
    var s = Math.max(0, Math.round((Date.now() - d.getTime()) / 1000));
    if (s < 45) return 'just now';
    var m = Math.round(s / 60);
    return m < 60 ? m + 'm ago' : Math.round(m / 60) + 'h ago';
  }
  function renderLiveStatus() {
    if (!liveLast) return;
    var t = liveLast.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setLiveStatus('live · ' + liveOk + '/' + liveN + ' · refreshed ' + t + ' (' + relTime(liveLast) + ')', true);
  }
  function fetchLive() {
    if (document.hidden) return; // don't burn API calls on a backgrounded tab
    var tickers = H.map(function (h) { return h.ticker; });
    liveN = tickers.length;
    var ok = 0;
    Promise.allSettled(tickers.map(function (t) {
      return fetch('https://finnhub.io/api/v1/quote?symbol=' + encodeURIComponent(t) + '&token=' + FINNHUB_KEY)
        .then(function (r) { return r.ok ? r.json() : Promise.reject(); })
        .then(function (q) { paintLive(t, q, 'today'); if (q && q.c > 0) ok++; });
    })).then(function () {
      if (ok > 0) { liveOk = ok; liveLast = new Date(); renderLiveStatus(); }
      else if (!liveLast) { setLiveStatus('live feed unavailable — showing snapshot', false); }
      // a failed refresh after a prior success keeps the last-good status untouched
    });
  }
  function initLive() {
    if (!FINNHUB_KEY) { setLiveStatus('live prices off — showing snapshot', false); return; }
    if (!('fetch' in window)) return;
    setLiveStatus('fetching live prices…', false);
    fetchLive();
    setInterval(fetchLive, REFRESH_MS);                                   // re-fetch every few minutes
    setInterval(function () { if (liveLast) renderLiveStatus(); }, 30000); // keep "(Xm ago)" ticking
    document.addEventListener('visibilitychange', function () {           // catch up when the tab returns
      if (!document.hidden && (!liveLast || Date.now() - liveLast.getTime() > REFRESH_MS)) fetchLive();
    });
  }

  /* ════════════════════════════════════════════════════════════
     CLICK-TO-EXPAND — per-holding "how it's doing & might do"
     ════════════════════════════════════════════════════════════ */
  // Rough long-run planning assumptions per position (total return % & volatility %).
  // These are opinions, not data — the panel lets the visitor drag them.
  var RET = { SCHD: 8.5, SCHY: 7, JEPI: 7, JEPQ: 9, O: 6, BP: 6, AAPL: 9, KO: 6.5, MTB: 8, WFC: 8, XYLD: 6.5, NLY: 6, QQQH: 8.5 };
  var VOL = { SCHD: 15, SCHY: 15, JEPI: 12, JEPQ: 12, O: 16, BP: 24, AAPL: 26, KO: 15, MTB: 26, WFC: 26, XYLD: 12, NLY: 23, QQQH: 13 };
  function parseYield(s) {
    var nums = (String(s || '').match(/[0-9]+(\.[0-9]+)?/g) || []).map(Number);
    if (!nums.length) return 3.5;
    return nums.reduce(function (a, b) { return a + b; }, 0) / nums.length;
  }
  function holdingProject(start, rate, years) {
    var out = [start], v = start;
    for (var i = 1; i <= years; i++) { v = v * (1 + rate); out.push(v); }
    return out;
  }
  function holdingMC(start, rate, vol, years, K) {
    var perYear = []; for (var y = 0; y <= years; y++) perYear.push([]);
    var mr = rate / 12, mv = vol / Math.sqrt(12), N = years * 12;
    for (var k = 0; k < K; k++) {
      var v = start; perYear[0].push(v);
      for (var m = 1; m <= N; m++) { v = v * (1 + mr + gauss() * mv); if (v < 0) v = 0; if (m % 12 === 0) perYear[m / 12].push(v); }
    }
    function q(a, p) { var s = a.slice().sort(function (x, y) { return x - y; }); return s[Math.min(s.length - 1, Math.floor(p * (s.length - 1)))]; }
    return { p10: perYear.map(function (a) { return q(a, 0.1); }), p50: perYear.map(function (a) { return q(a, 0.5); }), p90: perYear.map(function (a) { return q(a, 0.9); }) };
  }

  function panelHTML(h, assumed) {
    return '' +
      '<div class="inv-expand-controls">' +
        '<div class="inv-mini-ctrl"><label>Years <span class="v ex-years-v">10</span></label><input type="range" class="ex-years" min="1" max="30" step="1" value="10"></div>' +
        '<div class="inv-mini-ctrl"><label>Assumed annual return <span class="v ex-ret-v">' + assumed.toFixed(1) + '%</span></label><input type="range" class="ex-ret" min="0" max="15" step="0.5" value="' + assumed + '"></div>' +
        '<label class="inv-drip-row"><input type="checkbox" class="ex-drip" checked> <span><strong>Reinvest dividends (DRIP)</strong> — toggle it off to see what compounding was doing for you</span></label>' +
      '</div>' +
      '<div class="inv-expand-canvas"><canvas></canvas></div>' +
      '<div class="inv-expand-tiles">' +
        '<div class="t"><div class="tv ex-invested">—</div><div class="tl">Invested</div></div>' +
        '<div class="t"><div class="tv ex-today">—</div><div class="tl">Today</div></div>' +
        '<div class="t"><div class="tv ex-value up">—</div><div class="tl">Projected (<span class="ex-year-lbl">yr 10</span>)</div></div>' +
        '<div class="t"><div class="tv ex-income">—</div><div class="tl">Income / yr by then</div></div>' +
      '</div>' +
      '<p class="inv-expand-note">⚠ The dashed grey line is what you paid for ' + h.ticker + '. The shaded band is the middle 80% of hundreds of randomized markets — a spread of maybes, <em>not</em> a prediction. Return and volatility are rough planning assumptions you can drag; the future is genuinely unknown.</p>';
  }

  function buildHoldingPanel(panel, h) {
    var assumed = RET[h.ticker] || 7;
    var vol = (VOL[h.ticker] || 18) / 100;
    var iyield = parseYield(h.targetYield) / 100;
    panel.innerHTML = panelHTML(h, assumed);

    var elYears = $('.ex-years', panel), elYearsV = $('.ex-years-v', panel);
    var elRet = $('.ex-ret', panel), elRetV = $('.ex-ret-v', panel);
    var elDrip = $('.ex-drip', panel), canvas = $('canvas', panel);
    var tInv = $('.ex-invested', panel), tToday = $('.ex-today', panel),
        tVal = $('.ex-value', panel), tInc = $('.ex-income', panel), yearLbl = $('.ex-year-lbl', panel);
    var chart = null;

    function render() {
      var years = +elYears.value, ret = +elRet.value / 100, drip = elDrip.checked;
      var growth = drip ? ret : Math.max(0, ret - iyield); // DRIP off → price-only growth
      elYearsV.textContent = years;
      elRetV.textContent = (ret * 100).toFixed(1) + '%';
      yearLbl.textContent = 'yr ' + years;

      var labels = []; for (var i = 0; i <= years; i++) labels.push(i);
      var finalVal, datasets;
      var costLine = labels.map(function () { return h.costBasis; });

      if (hasChart) {
        var mc = holdingMC(h.value, growth, vol, years, 240);
        finalVal = mc.p50[years];
        datasets = [
          { label: '_lo', data: mc.p10, borderColor: 'transparent', backgroundColor: alpha(C.accent, 0.10), pointRadius: 0, fill: false, order: 5 },
          { label: 'Range of outcomes', data: mc.p90, borderColor: 'transparent', backgroundColor: alpha(C.accent, 0.13), pointRadius: 0, fill: '-1', order: 5 },
          { label: 'Expected', data: mc.p50, borderColor: C.accent, backgroundColor: C.accent, borderWidth: 2.5, pointRadius: 0, tension: 0.15, fill: false, order: 1 },
          { label: 'What you paid', data: costLine, borderColor: C.muted, borderWidth: 1.5, borderDash: [5, 4], pointRadius: 0, fill: false, order: 2 }
        ];
        if (!chart) {
          chart = new Chart(canvas, {
            type: 'line', data: { labels: labels, datasets: datasets },
            options: {
              responsive: true, maintainAspectRatio: false, interaction: { mode: 'index', intersect: false },
              plugins: {
                legend: { labels: { filter: function (it) { return it.text && it.text.charAt(0) !== '_'; }, boxWidth: 12, font: { size: 10 }, usePointStyle: true } },
                tooltip: { filter: function (it) { return it.dataset.label.charAt(0) !== '_'; }, callbacks: { label: function (ctx) { return ' ' + ctx.dataset.label + ': ' + money(ctx.parsed.y); } } }
              },
              scales: {
                x: { title: { display: true, text: 'years from now', color: C.muted, font: { size: 10 } }, grid: { display: false } },
                y: { ticks: { callback: function (v) { return moneyC(v); } }, grid: { color: '#f0f0f0' } }
              }
            }
          });
        } else { chart.data.labels = labels; chart.data.datasets = datasets; chart.update('none'); }
      } else {
        finalVal = holdingProject(h.value, growth, years)[years];
      }

      tInv.textContent = money(h.costBasis);
      tToday.textContent = money(h.value);
      tVal.textContent = money(finalVal);
      tVal.classList.toggle('up', finalVal >= h.value);
      tVal.classList.toggle('down', finalVal < h.value);
      tInc.textContent = money(finalVal * iyield);
    }

    elYears.addEventListener('input', render);
    elRet.addEventListener('input', render);
    elDrip.addEventListener('change', render);
    render();
  }

  function initHoldingExpanders() {
    var byTicker = {}; H.forEach(function (h) { byTicker[h.ticker] = h; });
    $all('.inv-sheet').forEach(function (sheet) {
      var h = byTicker[sheet.dataset.ticker];
      if (!h) return;

      var toggle = document.createElement('button');
      toggle.type = 'button';
      toggle.className = 'inv-sheet-toggle';
      toggle.setAttribute('aria-expanded', 'false');
      toggle.innerHTML = '<span class="lbl">How ' + h.ticker + ' is doing &amp; might do</span><span class="chev">›</span>';

      var panel = document.createElement('div');
      panel.className = 'inv-sheet-expand';
      panel.hidden = true;

      sheet.appendChild(toggle);
      sheet.appendChild(panel);

      function toggleOpen() {
        var open = sheet.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(open));
        panel.hidden = !open;
        $('.lbl', toggle).innerHTML = open ? ('Hide ' + h.ticker + ' forecast') : ('How ' + h.ticker + ' is doing &amp; might do');
        if (!open) return;
        if (!panel.dataset.built) { buildHoldingPanel(panel, h); panel.dataset.built = '1'; }
        else if (hasChart) { var cv = $('canvas', panel); var c = cv && Chart.getChart(cv); if (c) c.resize(); }
      }

      toggle.addEventListener('click', function (e) { e.stopPropagation(); toggleOpen(); });
      sheet.addEventListener('click', function (e) {
        if (e.target.closest('.inv-sheet-expand') || e.target.closest('.inv-sheet-toggle')) return;
        toggleOpen();
      });
    });
  }

  /* ════════════════════════════════════════════════════════════
     INTRO show/hide — remembered across visits (localStorage)
     ════════════════════════════════════════════════════════════ */
  function initManifesto() {
    var section = $('.inv-manifesto');
    var showBtn = $('.inv-manifesto-show');
    var hideBtn = section ? $('.inv-manifesto-hide', section) : null;
    if (!section) return;
    var KEY = 'rsow.inv.hideIntro';
    function read() { try { return localStorage.getItem(KEY) === '1'; } catch (e) { return false; } }
    function write(v) { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch (e) {} }
    function apply(hidden) { section.hidden = hidden; if (showBtn) showBtn.hidden = !hidden; }
    apply(read());
    if (hideBtn) hideBtn.addEventListener('click', function () { apply(true); write(true); });
    if (showBtn) showBtn.addEventListener('click', function () { apply(false); write(false); });
  }

  /* ════════════════════════════════════════════════════════════
     "Keen observer" modal — income vs. contributions nuance
     ════════════════════════════════════════════════════════════ */
  function initObserverModal() {
    var opener = $('#inv-observer-open');
    var modal = $('#inv-observer-modal');
    if (!opener || !modal) return;
    function show() {
      modal.hidden = false;
      document.body.style.overflow = 'hidden';
      var x = $('.inv-modal-x', modal); if (x) x.focus();
    }
    function hide() {
      modal.hidden = true;
      document.body.style.overflow = '';
      opener.focus();
    }
    opener.addEventListener('click', show);
    $all('[data-close]', modal).forEach(function (el) { el.addEventListener('click', hide); });
    $all('[data-goforecast]', modal).forEach(function (el) {
      el.addEventListener('click', function () {
        hide();
        showTab('forecast');
        var tabs = $('.inv-tabs'); if (tabs) tabs.scrollIntoView({ behavior: 'smooth' });
      });
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !modal.hidden) hide(); });
  }

  /* ─── boot ─────────────────────────────────────────────────── */
  initManifesto();
  initObserverModal();
  initTabs();   // builds the dashboard (default tab) immediately
  initHoldingExpanders();
  paintSnapshotBadges();
  initLive();
})();
