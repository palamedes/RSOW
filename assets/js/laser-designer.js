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
    // A setting's identity, whichever test measured it.
    function keyOf(c) { return [c.power, c.speed, c.frequency, c.q_pulse, c.interval, c.passes].join('|'); }
    // Saved patterns from before kept the test's id in front.
    function keyFix(k) { var p = String(k).split('|'); return p.length === 7 ? p.slice(1).join('|') : String(k); }
    var testTitle = {}, testSlate = {}, testOrder = {};
    (data.tests || []).forEach(function (t, i) { testTitle[t.id] = t.title; testSlate[t.id] = t.slate; testOrder[t.id] = i; });
    // Each photo was exposed differently. Scaling a photo so its bare slate
    // matches the designer's surface puts every test on the same footing.
    function lum(c) {
      var l = c.map(function (v) { v /= 255; return v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92; });
      return 0.2126 * l[0] + 0.7152 * l[1] + 0.0722 * l[2];
    }
    function scaled(c, g) {
      return c.map(function (v) {
        v /= 255; v = v > 0.04045 ? Math.pow((v + 0.055) / 1.055, 2.4) : v / 12.92;
        v = Math.min(1, v * g);
        return Math.round(255 * (v > 0.0031308 ? 1.055 * Math.pow(v, 1 / 2.4) - 0.055 : 12.92 * v));
      });
    }

    // Usable settings: ran, have a color and swatch, and don't melt the material.
    // secs is the time to cover one square centimetre: 100 mm² ÷ (speed ×
    // line interval ÷ passes). A fine interval at a high speed can still be
    // slow. It ignores the galvo's jumps, so treat it as a comparison.
    // When a setting was measured more than once, the newest test wins (the
    // standard pattern re-runs settings from the earlier grids).
    var newest = {};
    (data.cells || []).forEach(function (c) {
      if (c.status !== 'done') return;
      var k = keyOf(c), seen = newest[k];
      if (!seen || (testOrder[c.test] || 0) >= (testOrder[seen.test] || 0)) newest[k] = c;
    });
    var settings = Object.keys(newest).map(function (k) { return newest[k]; }).filter(function (c) {
      return c.hex && c.color && c.color !== 'No mark' && c.finish !== 'Melted';
    }).map(function (c) {
      c.photoHex = c.hex;
      var raw = hexRgb(c.hex), slate = testSlate[c.test];
      c.rgb = slate ? scaled(raw, lum(SURFACE) / lum(hexRgb(slate))) : raw;
      c.hex = rgbHex(c.rgb);
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
      active: null, group: null, order: 'color', shown: [],
      mode: 'image', image: null
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
      if (e.target.closest('[data-act="pat-add-all"]')) { addAll(findGroup(S.group)); return; }
      var b = e.target.closest('.lzr-shade');
      if (!b) return;
      S.active = S.shown[+b.dataset.i].rep;
      if (S.mode === 'pattern') togglePattern(S.active);
      drawPalette();
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
        var inPat = S.mode === 'pattern' && P.items.indexOf(c) >= 0;
        b.setAttribute('aria-pressed', (S.mode === 'pattern' ? inPat : c === S.active) ? 'true' : 'false');
        if (inPat) b.classList.add('is-in');
        b.title = c.label + ' (' + c.from + ')' + (sh.list.length > 1 ? '. ' + (sh.list.length - 1) + ' similar settings make almost the same shade.' : '');
        var sw = swatch(c.hex); if (c.finish === 'Satin') sw.classList.add('is-satin');
        b.appendChild(sw);
        var t = document.createElement('span'); t.className = 'lzr-shade-set';
        t.textContent = c.short + (c.relief === 'Raised' ? ' · raised' : '') + (sh.list.length > 1 ? ' (+' + (sh.list.length - 1) + ')' : '');
        b.appendChild(t);
        var tm = document.createElement('span'); tm.className = 'lzr-shade-time'; tm.textContent = secsText(c.secs);
        b.appendChild(tm);
        box.appendChild(b);
      });
      pick.appendChild(box);
      if (S.mode === 'pattern') {
        var all = document.createElement('p');
        all.innerHTML = '<button type="button" class="lzr-btn-quiet" data-act="pat-add-all">Add all ' + S.shown.length + ' shades</button>';
        pick.appendChild(all);
      }
      var a = S.active, p = document.createElement('p'); p.className = 'lzr-active';
      p.innerHTML = '<strong>' + esc(a.group) + '</strong>' + (a.color !== a.group ? ' · ' + esc(a.color) : '') +
        (a.finish ? ', ' + esc(a.finish.toLowerCase()) : '') + (a.relief ? ', ' + esc(a.relief.toLowerCase()) : '') + ' · ' + secsText(a.secs) +
        '<br>' + esc(a.label) + '<br><span class="lzr-note">From ' + esc(a.from) + (a.notes ? '. ' + esc(a.notes) : '') + '</span>';
      pick.appendChild(p);
    }
    function esc(s) {
      return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; });
    }

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
      if (S.mode !== 'image') setMode('image');
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
      status.textContent = S.mode === 'pattern' ? patternSummary() : n + ' areas. Click one to color it.';
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
      if (!S.labels || S.mode !== 'image') return;
      pending = regionAt(e);
      if (!hoverFrame) hoverFrame = requestAnimationFrame(function () { hoverFrame = 0; showHover(pending); });
    });
    canvas.addEventListener('pointerleave', function () { pending = -1; showHover(-1); });
    canvas.addEventListener('click', function (e) {
      if (!S.labels || S.mode !== 'image') return;
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
      var b = e.target.closest('[data-act], [data-view], [data-mode]');
      if (!b || !root.contains(b)) return;
      if (b.dataset.mode && b.tagName === 'BUTTON') { setMode(b.dataset.mode); return; }
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
        case 'pat-sort-color': sortPattern('color'); break;
        case 'pat-sort-speed': sortPattern('speed'); break;
        case 'pat-clear': P.items = []; patternChanged(); break;
        case 'pat-remove': P.items.splice(+b.dataset.i, 1); patternChanged(); break;
        case 'pat-lbrn': downloadLbrn(); break;
        case 'pat-default': standardPattern(); syncFields(); patternChanged(); break;
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
        a.download = (S.mode === 'pattern' ? 'test-pattern' : S.name) + '-on-' + (data.material || 'material') + '.png';
        document.body.appendChild(a); a.click(); a.remove();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
      }, 'image/png');
    }

    // ── layer plan ───────────────────────────────────────
    var planBody = role('plan');
    function plan() {
      planBody.textContent = '';
      if (!S.labels) {
        planBody.innerHTML = '<tr><td colspan="11">' + (S.mode === 'pattern' ? 'Add shades to build a pattern.' : 'Upload an image to start.') + '</td></tr>';
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
          '<td>' + esc(s.finish || '') + (s.relief === 'Raised' ? ', raised' : '') + '</td><td>' + esc(s.power) + '%</td><td>' + esc(s.speed) + ' mm/s</td>' +
          '<td>' + esc(s.frequency) + ' kHz</td><td>' + esc(s.q_pulse) + ' ns</td><td>' + esc(s.interval) + ' mm</td><td>' + esc(s.passes) + '</td><td>' + secsText(s.secs) + '</td>' +
          '<td>' + esc(s.from) + '</td><td>' + pct(u.area) + '</td>';
        planBody.appendChild(tr);
      });
      var tb = document.createElement('tr');
      tb.innerHTML = '<td><span class="lzr-sw lzr-sw-sm" style="--sw: ' + esc(data.surface) + '" aria-hidden="true"></span>Bare ' +
        esc(String(data.title || '').toLowerCase()) + '</td><td colspan="9">No laser</td><td>' + pct(bare) + '</td>';
      planBody.appendChild(tb);
    }

    // ── test pattern ─────────────────────────────────────
    // A grid of squares, one per chosen shade, each labelled with its
    // settings, for proving the shades on real material. It downloads as a
    // LightBurn project (.lbrn2): one layer per square plus one for the
    // labels. LightBurn has 30 layers, so a pattern holds 29 shades.
    var MAX_SWATCHES = 29;
    var byKey = {};
    settings.forEach(function (c) { byKey[keyOf(c)] = c; });
    var whites = [];
    groups.forEach(function (g) {
      if (g.name === 'White' || g.name === 'Pale grey') g.shades.forEach(function (sh) { whites.push(sh.rep); });
    });
    whites.sort(function (a, b) { return b.lab[0] - a.lab[0]; });
    var P = { items: [], cols: 5, sq: 8, gap: 2.5, th: 1.6, field: parseFloat(data.lens) || 100, text: whites[0] || null };
    var STORE = 'rsow.laser.pattern.' + (data.material || 'material');
    var saved = null;
    try { saved = JSON.parse(localStorage.getItem(STORE) || 'null'); } catch (e) {}
    if (!saved) standardPattern();
    try {
      if (saved) {
        ['cols', 'sq', 'gap', 'th', 'field'].forEach(function (k) { if (+saved[k] > 0) P[k] = +saved[k]; });
        P.items = (saved.items || []).map(function (k) { return byKey[keyFix(k)]; }).filter(Boolean).slice(0, MAX_SWATCHES);
        if (saved.text && byKey[keyFix(saved.text)]) P.text = byKey[keyFix(saved.text)];
      }
    } catch (e) {}
    function savePattern() {
      try {
        localStorage.setItem(STORE, JSON.stringify({ items: P.items.map(keyOf), cols: P.cols, sq: P.sq, gap: P.gap, th: P.th, field: P.field, text: P.text ? keyOf(P.text) : null }));
      } catch (e) {}
    }

    var textSel = root.querySelector('[data-pat="text"]');
    whites.forEach(function (c) {
      var o = document.createElement('option');
      o.value = keyOf(c); o.textContent = c.group + ' · ' + c.short + ' (' + secsText(c.secs) + ')';
      textSel.appendChild(o);
    });
    if (P.text) textSel.value = keyOf(P.text);
    var fields = root.querySelectorAll('input[data-pat]');
    function syncFields() { for (var fi = 0; fi < fields.length; fi++) fields[fi].value = P[fields[fi].dataset.pat]; }
    syncFields();
    root.addEventListener('change', function (e) {
      var el = e.target;
      if (!el.dataset || !el.dataset.pat) return;
      if (el.dataset.pat === 'text') P.text = byKey[el.value] || P.text;
      else {
        var v = parseFloat(el.value), lo = parseFloat(el.min), hi = parseFloat(el.max);
        if (!(v > 0)) { el.value = P[el.dataset.pat]; return; }
        v = Math.min(hi, Math.max(lo, v));
        if (el.dataset.pat === 'cols') v = Math.round(v);
        P[el.dataset.pat] = v; el.value = v;
      }
      patternChanged();
    });

    function togglePattern(c) {
      var i = P.items.indexOf(c);
      if (i >= 0) P.items.splice(i, 1);
      else if (P.items.length >= MAX_SWATCHES) { status.textContent = 'A pattern holds ' + MAX_SWATCHES + ' shades: LightBurn has 30 layers and the labels use one.'; return; }
      else P.items.push(c);
      patternChanged();
    }
    function addAll(g) {
      if (!g) return;
      ordered(g).forEach(function (sh) {
        if (P.items.indexOf(sh.rep) < 0 && P.items.length < MAX_SWATCHES) P.items.push(sh.rep);
      });
      patternChanged();
    }
    function groupIndex(c) {
      for (var i = 0; i < groups.length; i++) if (groups[i].name === c.group) return i;
      return groups.length;
    }
    function sortPattern(by) {
      P.items.sort(by === 'speed' ? function (a, b) { return a.secs - b.secs; } :
        function (a, b) { return groupIndex(a) - groupIndex(b) || b.lab[0] - a.lab[0]; });
      patternChanged();
    }
    // The material's standard pattern (front matter `pattern`), used until
    // someone saves their own, and by "Start over".
    function standardPattern() {
      var d = data.pattern || {};
      if (+d.cols > 0) P.cols = +d.cols;
      P.items = (d.cells || []).map(function (k) { return byKey[keyFix(k)]; }).filter(Boolean).slice(0, MAX_SWATCHES);
    }
    function patternChanged() {
      savePattern();
      drawPatternList();
      if (S.mode === 'pattern') { drawPalette(); buildPattern(); }
    }

    var patList = role('pat-list'), patCount = role('pat-count'), patSummary = role('pat-summary');
    function drawPatternList() {
      patCount.textContent = '(' + P.items.length + ' of ' + MAX_SWATCHES + ')';
      patList.textContent = '';
      P.items.forEach(function (c, i) {
        var li = document.createElement('li');
        li.appendChild(swatch(c.hex));
        var t = document.createElement('span'); t.textContent = c.group + ' · ' + c.label + (c.relief === 'Raised' ? ' · raised' : '');
        li.appendChild(t);
        var x = document.createElement('button');
        x.type = 'button'; x.className = 'lzr-textbtn'; x.dataset.act = 'pat-remove'; x.dataset.i = i;
        x.setAttribute('aria-label', 'Remove ' + c.group + ' ' + c.short); x.textContent = '×';
        li.appendChild(x);
        patList.appendChild(li);
      });
    }

    // Three short lines: power and speed (mm/s), frequency and Q-pulse,
    // line interval (and passes). Short lines let the text be large.
    function labelLines(c) {
      return [c.power + '% ' + c.speed, c.frequency + 'k ' + c.q_pulse + 'ns',
        c.interval + 'mm' + (c.passes && c.passes !== '1' ? ' x' + c.passes : '')];
    }
    // Layout in millimetres, y down from the top-left corner. LightBurn's
    // text height is about a capital's height; an em is about 1.4 of it.
    var measure = document.createElement('canvas').getContext('2d');
    var FONT = 'bold {size}px Arial, Helvetica, sans-serif';
    function font(px) { return FONT.replace('{size}', px); }
    function patternLayout() {
      var em = P.th * 1.4, lineH = em * 1.15, pad = Math.max(0.5, P.th * 0.5), margin = 2;
      measure.font = font(100);
      var labelW = 0;
      P.items.forEach(function (c) {
        labelLines(c).forEach(function (l) { labelW = Math.max(labelW, measure.measureText(l).width / 100 * em); });
      });
      var cols = Math.max(1, Math.min(P.cols, P.items.length)), rows = Math.ceil(P.items.length / cols);
      var cellW = Math.max(P.sq, labelW), cellH = P.sq + pad + 3 * lineH;
      var W = cols * cellW + (cols - 1) * P.gap + 2 * margin, H = rows * cellH + (rows - 1) * P.gap + 2 * margin;
      var cells = P.items.map(function (c, i) {
        var col = i % cols, row = Math.floor(i / cols);
        var cx = margin + col * (cellW + P.gap) + cellW / 2, top = margin + row * (cellH + P.gap);
        return { c: c, cx: cx, sy: top + P.sq / 2, ly: top + P.sq + pad + 1.5 * lineH, lines: labelLines(c) };
      });
      return { W: W, H: H, em: em, lineH: lineH, cells: cells };
    }

    function buildPattern() {
      if (!P.items.length) {
        root.dataset.pstate = 'empty'; S.labels = null; S.regions = []; patSummary.textContent = ''; plan();
        return;
      }
      root.dataset.pstate = 'ready';
      var Lo = patternLayout(), k = Math.max(4, Math.min(40, 900 / Math.max(Lo.W, Lo.H)));
      var w = Math.round(Lo.W * k), h = Math.round(Lo.H * k), labels = new Int32Array(w * h);
      var regions = [{ id: 0, ink: 0, area: 0, x0: 0, y0: 0, x1: w - 1, y1: h - 1, alive: true }];
      var assign = [null];
      Lo.cells.forEach(function (cell, i) {
        var id = i + 1, x0 = Math.round((cell.cx - P.sq / 2) * k), y0 = Math.round((cell.sy - P.sq / 2) * k);
        var x1 = Math.round((cell.cx + P.sq / 2) * k) - 1, y1 = Math.round((cell.sy + P.sq / 2) * k) - 1;
        for (var y = y0; y <= y1; y++) for (var x = x0; x <= x1; x++) labels[y * w + x] = id;
        regions.push({ id: id, ink: 1, area: (x1 - x0 + 1) * (y1 - y0 + 1), x0: x0, y0: y0, x1: x1, y1: y1, alive: true });
        assign.push(cell.c);
      });
      // the labels, drawn with the browser's font and read back as a mask
      var tc = document.createElement('canvas'); tc.width = w; tc.height = h;
      var tx = tc.getContext('2d', { willReadFrequently: true });
      tx.fillStyle = '#fff'; tx.fillRect(0, 0, w, h);
      tx.fillStyle = '#000'; tx.textAlign = 'center'; tx.textBaseline = 'middle';
      tx.font = font(Lo.em * k);
      Lo.cells.forEach(function (cell) {
        cell.lines.forEach(function (l, i) { tx.fillText(l, cell.cx * k, (cell.ly + (i - 1) * Lo.lineH) * k); });
      });
      var td = tx.getImageData(0, 0, w, h).data, tid = regions.length, tarea = 0;
      for (var i = 0, j = 0; i < w * h; i++, j += 4) if (td[j] < 128 && labels[i] === 0) { labels[i] = tid; tarea++; }
      regions.push({ id: tid, ink: 1, area: tarea, x0: 0, y0: 0, x1: w - 1, y1: h - 1, alive: true });
      assign.push(P.text);
      regions[0].area = w * h - tarea - regions.slice(1, -1).reduce(function (t, r) { return t + r.area; }, 0);
      S.w = w; S.h = h; S.labels = labels; S.regions = regions; S.assign = assign; S.undo = [];
      S.noise = makeNoise(w, h); S.textArea = tarea / (k * k); S.layout = Lo;
      canvas.width = overlay.width = w; canvas.height = overlay.height = h;
      octx.clearRect(0, 0, w, h);
      render();
      patSummary.textContent = patternSummary();
    }
    function patternSummary() {
      var Lo = S.layout;
      if (!Lo || !P.items.length) return '';
      var secs = P.items.reduce(function (t, c) { return t + P.sq * P.sq / 100 * c.secs; }, 0) + (P.text ? S.textArea / 100 * P.text.secs : 0);
      return P.items.length + (P.items.length === 1 ? ' square' : ' squares') + ', ' + Lo.W.toFixed(0) + ' × ' + Lo.H.toFixed(0) +
        ' mm, centered on a ' + P.field + ' mm field. Roughly ' + Math.max(1, Math.round(secs / 60)) + ' min of lasering.';
    }

    function xmlEsc(v) {
      return String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/\n/g, '&#10;');
    }
    function num(v) { return String(Math.round(v * 10000) / 10000); }
    // One Scan (fill) layer per setting. Fiber settings as LightBurn writes
    // them: frequency in Hz, QPulseWidth in ns, interval in mm.
    function cutSetting(index, name, c, priority) {
      var pw = parseFloat(c.power) || 0;
      return '    <CutSetting type="Scan">\n' +
        '        <index Value="' + index + '"/>\n' +
        '        <name Value="' + xmlEsc(name) + '"/>\n' +
        '        <minPower Value="' + pw + '"/>\n' +
        '        <maxPower Value="' + pw + '"/>\n' +
        '        <maxPower2 Value="' + pw + '"/>\n' +
        '        <speed Value="' + (parseFloat(c.speed) || 0) + '"/>\n' +
        '        <frequency Value="' + Math.round((parseFloat(c.frequency) || 0) * 1000) + '"/>\n' +
        '        <QPulseWidth Value="' + (parseFloat(c.q_pulse) || 0) + '"/>\n' +
        '        <interval Value="' + (parseFloat(c.interval) || 0.1) + '"/>\n' +
        '        <numPasses Value="' + (parseInt(c.passes, 10) || 1) + '"/>\n' +
        '        <priority Value="' + priority + '"/>\n' +
        '    </CutSetting>\n';
    }
    function lbrnXml() {
      var Lo = patternLayout(), cx0 = P.field / 2, cy0 = P.field / 2, n = Lo.cells.length;
      // LightBurn's Y axis points up, and a rectangle's XForm is its centre.
      function X(x) { return num(cx0 + x - Lo.W / 2); }
      function Y(y) { return num(cy0 + Lo.H / 2 - y); }
      var out = '<?xml version="1.0" encoding="UTF-8"?>\n' +
        '<LightBurnProject AppVersion="1.6.00" FormatVersion="1" MaterialHeight="0" MirrorX="False" MirrorY="False">\n';
      Lo.cells.forEach(function (cell, i) {
        var c = cell.c;
        out += cutSetting(i, c.group + ' ' + c.power + '% ' + c.speed, c, 0);
      });
      if (P.text) out += cutSetting(n, 'Labels', P.text, 1);
      Lo.cells.forEach(function (cell, i) {
        out += '    <Shape Type="Rect" CutIndex="' + i + '" W="' + num(P.sq) + '" H="' + num(P.sq) + '" Cr="0">\n' +
          '        <XForm>1 0 0 1 ' + X(cell.cx) + ' ' + Y(cell.sy) + '</XForm>\n    </Shape>\n';
      });
      if (P.text) Lo.cells.forEach(function (cell) {
        out += '    <Shape Type="Text" CutIndex="' + n + '" Font="Arial,-1,100,5,75,0,0,0,0,0" Str="' + xmlEsc(cell.lines.join('\n')) +
          '" H="' + num(P.th) + '" LS="0" LnS="0" Ah="1" Av="1" Bold="1" Weld="1">\n' +
          '        <XForm>1 0 0 1 ' + X(cell.cx) + ' ' + Y(cell.ly) + '</XForm>\n    </Shape>\n';
      });
      var notes = String(data.title || '') + ' test pattern from ' + (data.page || 'the laser materials library') + '\n' +
        n + ' shades, one layer each, plus a Labels layer.\n' +
        'Centered on a ' + P.field + ' mm field: check it sits where you want before running, and that each label is under its square.';
      out += '    <Notes ShowOnLoad="1" Notes="' + xmlEsc(notes) + '"/>\n</LightBurnProject>\n';
      return out;
    }
    function downloadLbrn() {
      if (!P.items.length) { status.textContent = 'Add some shades first.'; return; }
      var blob = new Blob([lbrnXml()], { type: 'application/xml' });
      var a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = (data.material || 'material') + '-test-pattern.lbrn2';
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000);
    }

    // ── switching between a design and a pattern ─────────
    var IMAGE_KEYS = ['w', 'h', 'lum', 'noise', 'labels', 'regions', 'assign', 'undo', 'name'];
    function setMode(m) {
      if (m === S.mode) return;
      var ms = root.querySelectorAll('button[data-mode]');
      for (var i = 0; i < ms.length; i++) ms[i].setAttribute('aria-pressed', ms[i].dataset.mode === m ? 'true' : 'false');
      if (m === 'pattern') {
        S.image = {};
        IMAGE_KEYS.forEach(function (key) { S.image[key] = S[key]; });
        S.mode = 'pattern'; root.dataset.mode = 'pattern';
        drawPalette(); drawPatternList(); buildPattern();
      } else {
        S.mode = 'image'; root.dataset.mode = 'image';
        if (S.image) IMAGE_KEYS.forEach(function (key) { S[key] = S.image[key]; });
        S.hover = -1;
        if (S.labels) { canvas.width = overlay.width = S.w; canvas.height = overlay.height = S.h; octx.clearRect(0, 0, S.w, S.h); render(); }
        else { status.textContent = ''; plan(); }
        drawPalette();
      }
    }

    drawPalette();
    drawPatternList();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
