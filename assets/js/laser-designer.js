// Laser Materials Library: the designer (/laser/<material>/designer/).
//
// Upload a silhouette; it's split into connected areas (each dark shape and
// each light shape enclosed by them). Pick a tested color, click areas to
// apply it, and preview the result on a simulated material surface. The
// layer plan lists the laser settings for every color used. Everything runs
// here in the browser: the image is never sent anywhere.
//
// Data comes from #lzr-designer-data (the material's tab and palette).
// Settings with the finish "Melted" damage the material and aren't offered.
// Soft navigation re-runs this script after swapping <main>, so it binds to
// whatever #lzr-designer is on the page now, once.
(function () {
  'use strict';

  var MAX_SIDE = 1000;   // working size of the long side, in pixels

  function hexRgb(h) {
    h = String(h || '').replace('#', '');
    if (!/^[0-9a-f]{6}$/i.test(h)) return [111, 116, 117];
    return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
  }
  function rgbHex(c) {
    return '#' + c.map(function (v) { return ('0' + Math.round(v).toString(16)).slice(-2); }).join('');
  }
  function medianRgb(list) {
    return [0, 1, 2].map(function (k) {
      var v = list.map(function (c) { return c.rgb[k]; }).sort(function (a, b) { return a - b; });
      return v[v.length >> 1];
    });
  }
  function rgbLab(c) {
    var l = c.map(function (v) { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; });
    var x = (0.4124 * l[0] + 0.3576 * l[1] + 0.1805 * l[2]) / 0.95047;
    var y = 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    var z = (0.0193 * l[0] + 0.1192 * l[1] + 0.9505 * l[2]) / 1.08883;
    function f(t) { return t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116; }
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
  }
  function deltaE(a, b) {
    var d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2];
    return Math.sqrt(d0 * d0 + d1 * d1 + d2 * d2);
  }
  function dist2(a, b) {
    var d0 = a[0] - b[0], d1 = a[1] - b[1], d2 = a[2] - b[2];
    return d0 * d0 + d1 * d1 + d2 * d2;
  }
  function mulberry32(a) {
    return function () {
      a |= 0; a = a + 0x6D2B79F5 | 0;
      var t = Math.imul(a ^ a >>> 15, 1 | a);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  // A stone-like surface: broad mottling, horizontal cleavage streaks and fine
  // grain, centred on 0. Seeded, so a design always renders the same way.
  function makeNoise(w, h) {
    var rnd = mulberry32(1987), out = new Float32Array(w * h);
    var layers = [[6, 6, 0.35], [8, 40, 0.30], [Math.max(1, w >> 2), Math.max(1, h >> 2), 0.15]];
    for (var l = 0; l < layers.length; l++) {
      var gx = layers[l][0], gy = layers[l][1], wt = layers[l][2];
      var grid = new Float32Array((gx + 1) * (gy + 1));
      for (var k = 0; k < grid.length; k++) grid[k] = rnd() * 2 - 1;
      for (var y = 0; y < h; y++) {
        var fy = y / h * gy, iy = fy | 0, ty = fy - iy;
        ty = ty * ty * (3 - 2 * ty);
        for (var x = 0; x < w; x++) {
          var fx = x / w * gx, ix = fx | 0, tx = fx - ix;
          tx = tx * tx * (3 - 2 * tx);
          var i0 = iy * (gx + 1) + ix, i1 = i0 + gx + 1;
          var a = grid[i0] + (grid[i0 + 1] - grid[i0]) * tx;
          var b = grid[i1] + (grid[i1 + 1] - grid[i1]) * tx;
          out[y * w + x] += (a + (b - a) * ty) * wt;
        }
      }
    }
    for (var i = 0; i < out.length; i++) out[i] += (rnd() * 2 - 1) * 0.2;
    return out;
  }

  // Otsu's method: the cut-off that best separates dark from light.
  function otsu(lum) {
    var hist = new Float64Array(256), total = lum.length, sum = 0, i;
    for (i = 0; i < total; i++) hist[lum[i]]++;
    for (i = 0; i < 256; i++) sum += i * hist[i];
    var sumB = 0, wB = 0, best = -1, thr = 127;
    for (i = 0; i < 256; i++) {
      wB += hist[i];
      if (!wB) continue;
      var wF = total - wB;
      if (!wF) break;
      sumB += i * hist[i];
      var mB = sumB / wB, mF = (sum - sumB) / wF, between = wB * wF * (mB - mF) * (mB - mF);
      if (between > best) { best = between; thr = i; }
    }
    return Math.min(254, Math.max(1, thr + 1));
  }

  // Split the image into connected areas of dark (ink) and light pixels.
  // Specks smaller than minArea (noise, watermark dots) join a neighbour.
  function segment(lum, w, h, thr, invert) {
    var n = w * h, ink = new Uint8Array(n), labels = new Int32Array(n), i;
    for (i = 0; i < n; i++) {
      var dark = lum[i] < thr ? 1 : 0;
      ink[i] = invert ? 1 - dark : dark;
      labels[i] = -1;
    }
    var regions = [], stack = new Int32Array(n);
    for (i = 0; i < n; i++) {
      if (labels[i] !== -1) continue;
      var id = regions.length, cls = ink[i], sp = 0, area = 0, x0 = w, y0 = h, x1 = 0, y1 = 0;
      labels[i] = id; stack[sp++] = i;
      while (sp) {
        var p = stack[--sp], x = p % w, y = (p - x) / w;
        area++;
        if (x < x0) x0 = x; if (x > x1) x1 = x;
        if (y < y0) y0 = y; if (y > y1) y1 = y;
        if (x > 0 && labels[p - 1] === -1 && ink[p - 1] === cls) { labels[p - 1] = id; stack[sp++] = p - 1; }
        if (x < w - 1 && labels[p + 1] === -1 && ink[p + 1] === cls) { labels[p + 1] = id; stack[sp++] = p + 1; }
        if (y > 0 && labels[p - w] === -1 && ink[p - w] === cls) { labels[p - w] = id; stack[sp++] = p - w; }
        if (y < h - 1 && labels[p + w] === -1 && ink[p + w] === cls) { labels[p + w] = id; stack[sp++] = p + w; }
      }
      regions.push({ id: id, ink: cls, area: area, x0: x0, y0: y0, x1: x1, y1: y1, alive: true });
    }

    var minArea = Math.max(16, Math.round(n * 0.00003));
    for (var r = 0; r < regions.length; r++) {
      var reg = regions[r];
      if (reg.area >= minArea) continue;
      var target = -1;
      find:
      for (var yy = reg.y0; yy <= reg.y1; yy++) {
        for (var xx = reg.x0; xx <= reg.x1; xx++) {
          var q = yy * w + xx;
          if (labels[q] !== reg.id) continue;
          var nb = [xx > 0 ? q - 1 : -1, xx < w - 1 ? q + 1 : -1, yy > 0 ? q - w : -1, yy < h - 1 ? q + w : -1];
          for (var k = 0; k < 4; k++) {
            if (nb[k] < 0) continue;
            var other = labels[nb[k]];
            if (other !== reg.id && regions[other].area >= minArea) { target = other; break find; }
          }
        }
      }
      if (target < 0) continue;
      for (var y2 = reg.y0; y2 <= reg.y1; y2++) {
        for (var x2 = reg.x0; x2 <= reg.x1; x2++) {
          if (labels[y2 * w + x2] === reg.id) labels[y2 * w + x2] = target;
        }
      }
      var t = regions[target];
      t.area += reg.area;
      t.x0 = Math.min(t.x0, reg.x0); t.y0 = Math.min(t.y0, reg.y0);
      t.x1 = Math.max(t.x1, reg.x1); t.y1 = Math.max(t.y1, reg.y1);
      reg.alive = false; reg.area = 0;
    }
    return { labels: labels, regions: regions };
  }

  function init() {
    var root = document.getElementById('lzr-designer');
    var dataEl = document.getElementById('lzr-designer-data');
    if (!root || !dataEl || root.dataset.ready) return;
    root.dataset.ready = '1';

    var data;
    try { data = JSON.parse(dataEl.textContent); } catch (e) { return; }
    function $(sel) { return root.querySelector(sel); }
    function role(r) { return root.querySelector('[data-role="' + r + '"]'); }

    var SURFACE = hexRgb(data.surface);
    var testTitle = {};
    for (var ti = 0; ti + 1 < (data.tests || []).length; ti += 2) testTitle[data.tests[ti]] = data.tests[ti + 1];

    // Usable settings: ran, have a color and swatch, and don't melt the material.
    // secs is the time to cover one square centimetre: 100 mm² ÷ (speed ×
    // line interval ÷ passes). A fine interval at a high speed can still be
    // slow. It ignores the galvo's jumps, so treat it as a comparison.
    var settings = (data.cells || []).filter(function (c) {
      return c.status === 'done' && c.hex && c.color && c.color !== 'No mark' && c.finish !== 'Melted';
    }).map(function (c) {
      c.rgb = hexRgb(c.hex);
      c.lab = rgbLab(c.rgb);
      var rate = (parseFloat(c.speed) || 0) * (parseFloat(c.interval) || 0) / (parseFloat(c.passes) || 1);
      c.secs = rate > 0 ? 100 / rate : Infinity;
      c.label = c.power + '% · ' + c.speed + ' mm/s · ' + c.frequency + ' kHz · ' + c.q_pulse + ' ns · ' +
        c.interval + ' mm' + (c.passes && c.passes !== '1' ? ' · ' + c.passes + ' passes' : '');
      c.short = c.power + '% · ' + c.speed + ' mm/s · ' + c.interval + ' mm';
      c.from = testTitle[c.test] || c.test;
      return c;
    });

    // At most seven colors, light to dark: the material's `groups`, each
    // combining palette colors that look alike. Inside a color, settings
    // within SAME_SHADE of each other count as one shade.
    var SAME_SHADE = 4;   // CIE76 ΔE: a difference you'd barely see side by side
    var groupDefs = (data.groups && data.groups.length) ? data.groups :
      (data.palette || []).map(function (f) { return { name: f.name, hint: f.hint, colors: [f.name] }; });
    var groups = groupDefs.map(function (g) {
      var list = settings.filter(function (c) { return (g.colors || []).indexOf(c.color) >= 0; });
      list.forEach(function (c) { c.group = g.name; });
      return { name: g.name, hint: g.hint, list: list };
    }).filter(function (g) { return g.list.length; });
    groups.forEach(function (g) {
      g.hex = rgbHex(medianRgb(g.list));
      g.shades = shadesOf(g.list);
    });

    function shadesOf(list) {
      var shades = [];
      list.slice().sort(function (a, b) { return b.lab[0] - a.lab[0]; }).forEach(function (c) {
        for (var i = 0; i < shades.length; i++) {
          if (deltaE(shades[i].seed, c.lab) < SAME_SHADE) { shades[i].list.push(c); return; }
        }
        shades.push({ seed: c.lab, list: [c] });
      });
      shades.forEach(function (sh) { sh.rep = recommend(sh.list); });
      return shades;
    }
    // A shade's setting: a favourite first, then the best quality grade,
    // then the fastest.
    function recommend(list) {
      var pool = list.filter(function (c) { return c.favorite === 'Yes'; });
      if (!pool.length) pool = list;
      var best = null, bq = 0;
      pool.forEach(function (c) { var q = parseFloat(c.quality) || 0; if (q > bq) { bq = q; best = c; } });
      if (best) return best;
      return pool.slice().sort(function (a, b) { return a.secs - b.secs; })[0];
    }
    function ordered(g) {
      var list = g.shades.slice();
      if (S.order === 'speed') list.sort(function (a, b) { return a.rep.secs - b.rep.secs; });
      else list.sort(function (a, b) { return b.seed[0] - a.seed[0] || a.rep.secs - b.rep.secs; });
      return list;
    }
    // Picking a color: the fastest shade when ordering by speed, otherwise
    // its most common shade.
    function defaultShade(g) {
      if (S.order === 'speed') return ordered(g)[0];
      return g.shades.slice().sort(function (a, b) { return b.list.length - a.list.length; })[0];
    }
    function secsText(n) {
      if (!isFinite(n)) return '—';
      return '≈ ' + (n < 10 ? n.toFixed(1) : Math.round(n)) + ' s/cm²';
    }

    var canvas = role('canvas'), ctx = canvas.getContext('2d');
    var overlay = role('overlay'), octx = overlay.getContext('2d');
    var S = {
      w: 0, h: 0, lum: null, noise: null, labels: null, regions: [], assign: [], undo: [],
      view: 'material', hover: -1, name: 'design',
      active: null, group: null, order: 'color', shown: []
    };
    var startGroup = groups[0];
    if (startGroup) { S.group = startGroup.name; S.active = defaultShade(startGroup).rep; }

    // ── palette ──────────────────────────────────────────
    var pal = role('palette'), pick = role('settings');
    function swatch(hex) {
      var s = document.createElement('span');
      s.className = 'lzr-sw' + (hex ? '' : ' is-blank');
      if (hex) s.style.setProperty('--sw', hex);
      s.setAttribute('aria-hidden', 'true');
      return s;
    }
    function palButton(name, hex, key) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'lzr-pal-btn'; b.dataset.group = key;
      b.appendChild(swatch(hex));
      b.appendChild(document.createTextNode(name));
      return b;
    }
    function findGroup(name) { return groups.filter(function (g) { return g.name === name; })[0]; }
    groups.forEach(function (g) { pal.appendChild(palButton(g.name, g.hex, g.name)); });
    pal.appendChild(palButton('Bare ' + String(data.title || '').toLowerCase(), data.surface, '__bare'));
    pal.addEventListener('click', function (e) {
      var b = e.target.closest('.lzr-pal-btn');
      if (!b) return;
      if (b.dataset.group === '__bare') { S.group = '__bare'; S.active = null; }
      else { var g = findGroup(b.dataset.group); S.group = g.name; S.active = defaultShade(g).rep; }
      drawPalette();
    });
    pick.addEventListener('click', function (e) {
      var o = e.target.closest('[data-order]');
      if (o) {
        S.order = o.dataset.order;
        var g = findGroup(S.group);
        if (g && S.order === 'speed') S.active = defaultShade(g).rep;
        drawPalette();
        return;
      }
      var b = e.target.closest('.lzr-shade');
      if (b) { S.active = S.shown[+b.dataset.i].rep; drawPalette(); }
    });
    function drawPalette() {
      var btns = pal.querySelectorAll('.lzr-pal-btn');
      for (var i = 0; i < btns.length; i++) btns[i].setAttribute('aria-pressed', btns[i].dataset.group === S.group ? 'true' : 'false');
      pick.textContent = '';
      if (S.group === '__bare') {
        var p0 = document.createElement('p'); p0.className = 'lzr-active';
        p0.innerHTML = '<strong>Bare ' + esc(String(data.title || '').toLowerCase()) + '</strong>: no laser. Click an area to clear it.';
        pick.appendChild(p0);
        return;
      }
      var g = findGroup(S.group);
      if (!g) return;
      var head = document.createElement('div'); head.className = 'lzr-pick-head';
      head.innerHTML = '<p class="lzr-note">' + g.shades.length + (g.shades.length === 1 ? ' shade' : ' shades') +
        ' of ' + esc(g.name.toLowerCase()) + ', from ' + g.list.length + (g.list.length === 1 ? ' setting' : ' settings') + '.</p>' +
        '<div class="lzr-seg lzr-seg-sm" role="group" aria-label="Order shades by">' +
        '<button type="button" data-order="color" aria-pressed="' + (S.order === 'color') + '">Color</button>' +
        '<button type="button" data-order="speed" aria-pressed="' + (S.order === 'speed') + '">Fastest</button></div>';
      pick.appendChild(head);
      var box = document.createElement('div'); box.className = 'lzr-shades';
      S.shown = ordered(g);
      S.shown.forEach(function (sh, i) {
        var c = sh.rep, b = document.createElement('button');
        b.type = 'button'; b.className = 'lzr-shade'; b.dataset.i = i;
        b.setAttribute('aria-pressed', c === S.active ? 'true' : 'false');
        b.title = c.label + ' (' + c.from + ')' + (sh.list.length > 1 ? '. ' + (sh.list.length - 1) + ' similar settings make almost the same shade.' : '');
        var sw = swatch(c.hex); if (c.finish === 'Satin') sw.classList.add('is-satin');
        b.appendChild(sw);
        var t = document.createElement('span'); t.className = 'lzr-shade-set';
        t.textContent = c.short + (sh.list.length > 1 ? ' (+' + (sh.list.length - 1) + ')' : '');
        b.appendChild(t);
        var tm = document.createElement('span'); tm.className = 'lzr-shade-time'; tm.textContent = secsText(c.secs);
        b.appendChild(tm);
        box.appendChild(b);
      });
      pick.appendChild(box);
      var a = S.active, p = document.createElement('p'); p.className = 'lzr-active';
      p.innerHTML = '<strong>' + esc(a.group) + '</strong>' + (a.color !== a.group ? ' · ' + esc(a.color) : '') +
        (a.finish ? ', ' + esc(a.finish.toLowerCase()) : '') + ' · ' + secsText(a.secs) +
        '<br>' + esc(a.label) + '<br><span class="lzr-note">From ' + esc(a.from) + (a.notes ? '. ' + esc(a.notes) : '') + '</span>';
      pick.appendChild(p);
    }
    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }
    drawPalette();

    // ── loading an image ─────────────────────────────────
    var fileIn = role('file'), err = role('error'), status = role('status');
    var thr = role('threshold'), thrVal = role('threshold-value'), inv = role('invert');
    function showError(msg) { err.textContent = msg; err.hidden = !msg; }
    function loadURL(url, name, revoke) {
      showError('');
      var im = new Image();
      im.onload = function () { ingest(im, name); if (revoke) URL.revokeObjectURL(url); };
      im.onerror = function () { showError("Couldn't read that image. Try a PNG, JPG, WebP or SVG."); if (revoke) URL.revokeObjectURL(url); };
      im.src = url;
    }
    function loadFile(file) {
      if (!file) return;
      if (!/^image\//.test(file.type)) { showError('That file isn’t an image.'); return; }
      loadURL(URL.createObjectURL(file), file.name.replace(/\.[^.]+$/, ''), true);
    }
    fileIn.addEventListener('change', function () { loadFile(fileIn.files[0]); });
    root.addEventListener('dragover', function (e) { e.preventDefault(); root.classList.add('is-dragging'); });
    root.addEventListener('dragleave', function (e) { if (e.target === root || !root.contains(e.relatedTarget)) root.classList.remove('is-dragging'); });
    root.addEventListener('drop', function (e) {
      e.preventDefault(); root.classList.remove('is-dragging');
      if (e.dataTransfer && e.dataTransfer.files.length) loadFile(e.dataTransfer.files[0]);
    });

    function ingest(im, name) {
      var nw = im.naturalWidth || im.width || MAX_SIDE, nh = im.naturalHeight || im.height || MAX_SIDE;
      var s = MAX_SIDE / Math.max(nw, nh), w = Math.max(1, Math.round(nw * s)), h = Math.max(1, Math.round(nh * s));
      var c = document.createElement('canvas'); c.width = w; c.height = h;
      var x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#fff'; x.fillRect(0, 0, w, h);          // transparent counts as light
      x.drawImage(im, 0, 0, w, h);
      var d = x.getImageData(0, 0, w, h).data, lum = new Uint8Array(w * h);
      for (var i = 0, j = 0; i < lum.length; i++, j += 4) lum[i] = (d[j] * 0.2126 + d[j + 1] * 0.7152 + d[j + 2] * 0.0722) | 0;
      S.w = w; S.h = h; S.lum = lum; S.name = name || 'design';
      S.noise = makeNoise(w, h);
      canvas.width = overlay.width = w; canvas.height = overlay.height = h;
      thr.value = otsu(lum); inv.checked = false;
      root.dataset.state = 'ready';
      resegment();
    }

    function resegment() {
      thrVal.textContent = thr.value;
      var seg = segment(S.lum, S.w, S.h, +thr.value, inv.checked);
      S.labels = seg.labels; S.regions = seg.regions; S.undo = []; S.hover = -1;
      // Start with every dark area in the chosen color and the rest bare.
      var start = S.active || (startGroup && defaultShade(startGroup).rep) || null;
      S.assign = S.regions.map(function (r) { return r.alive && r.ink ? start : null; });
      octx.clearRect(0, 0, S.w, S.h);
      render();
    }
    var segTimer = 0;
    function queueSegment() { clearTimeout(segTimer); segTimer = setTimeout(resegment, 150); thrVal.textContent = thr.value; }
    thr.addEventListener('input', queueSegment);
    inv.addEventListener('change', queueSegment);

    // ── drawing ──────────────────────────────────────────
    function paint(target, mode) {
      var w = S.w, h = S.h, img = target.createImageData(w, h), d = img.data, L = S.labels;
      var cols = [], marked = [], satin = [];
      for (var r = 0; r < S.regions.length; r++) {
        var a = S.assign[r];
        cols[r] = a ? a.rgb : SURFACE; marked[r] = !!a; satin[r] = !!(a && a.finish === 'Satin');
      }
      var noise = mode === 'material' ? S.noise : null;
      for (var i = 0, j = 0; i < w * h; i++, j += 4) {
        var id = L[i], c = cols[id], k = 1;
        if (noise) {
          var nz = noise[i];
          k = marked[id] ? 1 + nz * 0.1 : 1 + nz * 0.22;
          if (satin[id]) k += 0.03 + (nz > 0 ? nz * 0.1 : 0);
        } else {
          var x = i % w;
          if ((x < w - 1 && L[i + 1] !== id) || (i + w < w * h && L[i + w] !== id)) k = 0.55;
        }
        d[j] = c[0] * k; d[j + 1] = c[1] * k; d[j + 2] = c[2] * k; d[j + 3] = 255;
      }
      target.putImageData(img, 0, 0);
    }
    function render() {
      paint(ctx, S.view);
      var n = 0;
      for (var r = 0; r < S.regions.length; r++) if (S.regions[r].alive) n++;
      canvas.setAttribute('aria-label', 'Preview of the design ' + (S.view === 'material' ? 'on ' + String(data.title || '').toLowerCase() : 'in flat colors') + ', ' + n + ' areas');
      status.textContent = n + ' areas. Click one to color it.';
      $('[data-act="undo"]').disabled = !S.undo.length;
      plan();
    }

    // ── hover and click ──────────────────────────────────
    function regionAt(e) {
      var rect = canvas.getBoundingClientRect();
      var x = Math.floor((e.clientX - rect.left) * S.w / rect.width), y = Math.floor((e.clientY - rect.top) * S.h / rect.height);
      if (x < 0 || y < 0 || x >= S.w || y >= S.h) return -1;
      return S.labels[y * S.w + x];
    }
    var hoverFrame = 0, pending = -1;
    function showHover(id) {
      if (id === S.hover) return;
      S.hover = id;
      octx.clearRect(0, 0, S.w, S.h);
      if (id < 0) return;
      var r = S.regions[id], bw = r.x1 - r.x0 + 1, bh = r.y1 - r.y0 + 1, img = octx.createImageData(bw, bh), d = img.data;
      // A cyan outline and a faint wash, so the hover never reads as a color.
      var L = S.labels, w = S.w, h = S.h;
      for (var y = 0; y < bh; y++) {
        var gy = y + r.y0, row = gy * w + r.x0;
        for (var x = 0; x < bw; x++) {
          var q = row + x;
          if (L[q] !== id) continue;
          var gx = x + r.x0, j = (y * bw + x) * 4;
          var edge = gx === 0 || gx === w - 1 || gy === 0 || gy === h - 1 ||
            L[q - 1] !== id || L[q + 1] !== id || L[q - w] !== id || L[q + w] !== id;
          d[j] = 56; d[j + 1] = 200; d[j + 2] = 248; d[j + 3] = edge ? 255 : 40;
        }
      }
      octx.putImageData(img, r.x0, r.y0);
    }
    canvas.addEventListener('pointermove', function (e) {
      if (!S.labels) return;
      pending = regionAt(e);
      if (!hoverFrame) hoverFrame = requestAnimationFrame(function () { hoverFrame = 0; showHover(pending); });
    });
    canvas.addEventListener('pointerleave', function () { pending = -1; showHover(-1); });
    canvas.addEventListener('click', function (e) {
      if (!S.labels) return;
      var id = regionAt(e);
      if (id < 0 || S.assign[id] === S.active) return;
      S.undo.push([[id, S.assign[id]]]);
      S.assign[id] = S.active;
      render();
    });

    function fill(inkClass) {
      var batch = [];
      for (var r = 0; r < S.regions.length; r++) {
        var reg = S.regions[r];
        if (!reg.alive || reg.ink !== inkClass || S.assign[r] === S.active) continue;
        batch.push([r, S.assign[r]]); S.assign[r] = S.active;
      }
      if (batch.length) { S.undo.push(batch); render(); }
    }

    // ── buttons ──────────────────────────────────────────
    root.addEventListener('click', function (e) {
      var b = e.target.closest('[data-act], [data-view]');
      if (!b || !root.contains(b)) return;
      if (b.dataset.view) {
        S.view = b.dataset.view;
        var vs = root.querySelectorAll('[data-view]');
        for (var i = 0; i < vs.length; i++) vs[i].setAttribute('aria-pressed', vs[i] === b ? 'true' : 'false');
        if (S.labels) render();
        return;
      }
      switch (b.dataset.act) {
        case 'sample': loadURL(data.sample, 'sample', false); break;
        case 'fill-dark': if (S.labels) fill(1); break;
        case 'fill-light': if (S.labels) fill(0); break;
        case 'undo':
          var batch = S.undo.pop();
          if (batch) { for (var k = batch.length - 1; k >= 0; k--) S.assign[batch[k][0]] = batch[k][1]; render(); }
          break;
        case 'new':
          root.dataset.state = 'empty'; fileIn.value = ''; S.labels = null; S.regions = []; S.lum = null; S.noise = null;
          status.textContent = ''; plan();
          break;
        case 'download': download(); break;
      }
    });

    function download() {
      if (!S.labels) return;
      var c = document.createElement('canvas'); c.width = S.w; c.height = S.h;
      paint(c.getContext('2d'), 'material');
      c.toBlob(function (blob) {
        if (!blob) return;
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = S.name + '-on-' + (data.material || 'material') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }, 'image/png');
    }

    // ── layer plan ───────────────────────────────────────
    var planBody = role('plan');
    function plan() {
      planBody.textContent = '';
      if (!S.labels) {
        planBody.innerHTML = '<tr><td colspan="11">Upload an image to start.</td></tr>';
        return;
      }
      var total = S.w * S.h, used = [], bare = 0;
      for (var r = 0; r < S.regions.length; r++) {
        var reg = S.regions[r];
        if (!reg.alive) continue;
        var a = S.assign[r];
        if (!a) { bare += reg.area; continue; }
        var row = used.filter(function (u) { return u.s === a; })[0];
        if (!row) { row = { s: a, area: 0 }; used.push(row); }
        row.area += reg.area;
      }
      used.sort(function (x, y) { return y.area - x.area; });
      function pct(n) { var v = n / total * 100; return (v < 0.1 && v > 0 ? '<0.1' : v.toFixed(1)) + '%'; }
      used.forEach(function (u) {
        var s = u.s, tr = document.createElement('tr');
        tr.innerHTML = '<td><span class="lzr-sw lzr-sw-sm" style="--sw: ' + esc(s.hex) + '" aria-hidden="true"></span>' + esc(s.group || s.color) + (s.group && s.group !== s.color ? ' <span class="lzr-note">(' + esc(s.color) + ')</span>' : '') + '</td>' +
          '<td>' + esc(s.finish || '') + '</td><td>' + esc(s.power) + '%</td><td>' + esc(s.speed) + ' mm/s</td>' +
          '<td>' + esc(s.frequency) + ' kHz</td><td>' + esc(s.q_pulse) + ' ns</td><td>' + esc(s.interval) + ' mm</td><td>' + esc(s.passes) + '</td><td>' + secsText(s.secs) + '</td>' +
          '<td>' + esc(s.from) + '</td><td>' + pct(u.area) + '</td>';
        planBody.appendChild(tr);
      });
      var tb = document.createElement('tr');
      tb.innerHTML = '<td><span class="lzr-sw lzr-sw-sm" style="--sw: ' + esc(data.surface) + '" aria-hidden="true"></span>Bare ' +
        esc(String(data.title || '').toLowerCase()) + '</td><td colspan="9">No laser</td><td>' + pct(bare) + '</td>';
      planBody.appendChild(tb);
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
