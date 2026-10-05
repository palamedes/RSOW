/*
 * Word Notes — uncommon words in a post get a squiggly underline, and
 * hovering (or focusing, or tapping) one shows a small card explaining it.
 * Curated entries live in _data/glossary/<key>.yml; a post opts in with
 * `words: [key, ...]` in front matter, and _includes/word-notes.html hands
 * those entries over as JSON. Fully client-side; the prose is never edited.
 *
 * Only the first usable occurrence of each word is marked: not in a heading,
 * link, code, caption or aside, and not inside a phrase an AI Note anchors to
 * (ai-notes.js can only highlight a phrase that sits in a single text node).
 * `_tools/word-notes.py check` mirrors these rules, so keep the two in step.
 *
 * Safe to run more than once: RSOW's soft navigation re-executes page
 * scripts after swapping <main>, and a second run just scans the new page.
 */
(function () {
  'use strict';

  if (window.RSOWWordNotes) { window.RSOWWordNotes.init(); return; }

  var SKIP = 'a, code, pre, kbd, samp, h1, h2, h3, h4, h5, h6, script, style, ' +
             'button, textarea, select, aside, figcaption, .post-actions, .word-note';
  var LABEL = 'Word worth knowing';

  function svg(paths) {
    return '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" ' +
      'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' +
      paths + '</svg>';
  }
  var BOOK = svg('<path d="M3 5.6c2.6-1.1 5.6-1 9 .9 3.4-1.9 6.4-2 9-.9v13.2c-2.6-1.1-5.6-1-9 .9-3.4-1.9-6.4-2-9-.9z"/><path d="M12 6.5v13.2"/>');
  // One small glyph per topic (the chip in the card's corner).
  var ICONS = {
    geology: svg('<path d="M2.5 20h19"/><path d="M3.5 20 9.5 9l3.2 5 2.3-3.3L20.5 20"/><path d="M7.4 13l2.6 1.6 1.4-.9"/>'),
    chemistry: svg('<path d="M9.5 3h5M10.5 3v5.6L5 18.4A1.8 1.8 0 0 0 6.6 21h10.8a1.8 1.8 0 0 0 1.6-2.6L13.5 8.6V3"/><path d="M7.4 15h9.2"/>'),
    physics: svg('<circle cx="12" cy="12" r="1.5"/><ellipse cx="12" cy="12" rx="9.5" ry="3.7"/><ellipse cx="12" cy="12" rx="9.5" ry="3.7" transform="rotate(60 12 12)"/><ellipse cx="12" cy="12" rx="9.5" ry="3.7" transform="rotate(-60 12 12)"/>'),
    biology: svg('<path d="M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9s8 4 8 9"/><path d="M9.6 6.5h4.8M9.6 17.5h4.8"/>'),
    medicine: svg('<path d="M3 12.5h4l2-5 4 10 2.2-5H21"/>'),
    law: svg('<path d="M12 3.5v17M7.5 20.5h9M4.5 7h15"/><path d="M4.5 7 2 13a2.5 2.2 0 0 0 5 0zM19.5 7 17 13a2.5 2.2 0 0 0 5 0z"/>'),
    economics: svg('<circle cx="12" cy="12" r="9"/><path d="M14.8 9.3c-.6-1-1.6-1.5-2.8-1.5-1.6 0-2.8.8-2.8 2.1 0 2.9 5.8 1.5 5.8 4.4 0 1.3-1.3 2.1-3 2.1-1.3 0-2.4-.5-3-1.5M12 6v12"/>'),
    politics: svg('<path d="M3 20.5h18M5.3 20.5v-8M9.8 20.5v-8M14.2 20.5v-8M18.7 20.5v-8M3.5 9.5 12 4l8.5 5.5z"/>'),
    history: svg('<path d="M6.5 3h11M6.5 21h11M8 3c0 4.5 8 5 8 9s-8 4.5-8 9M16 3c0 4.5-8 5-8 9s8 4.5 8 9"/>'),
    technology: svg('<rect x="6.5" y="6.5" width="11" height="11" rx="1.5"/><path d="M9.5 3v3.5M14.5 3v3.5M9.5 17.5V21M14.5 17.5V21M3 9.5h3.5M3 14.5h3.5M17.5 9.5H21M17.5 14.5H21"/>'),
    photography: svg('<path d="M3 8h3.8l1.7-2.5h7L17.2 8H21v11H3z"/><circle cx="12" cy="13.3" r="3.6"/>'),
    language: svg('<path d="M4 4.5h16v11.5H9.5L4 20z"/><path d="M9 9h6M9 12h4"/>'),
    psychology: svg('<path d="M9.2 18h5.6M10.2 21h3.6"/><path d="M12 3a6 6 0 0 0-3.8 10.6c.7.6 1.2 1.5 1.2 2.4h5.2c0-.9.5-1.8 1.2-2.4A6 6 0 0 0 12 3z"/>'),
    military: svg('<path d="M12 3 4.5 6v5.5c0 4.7 3.2 8 7.5 9.5 4.3-1.5 7.5-4.8 7.5-9.5V6z"/><path d="m9 12 2 2 4-4"/>'),
    philosophy: svg('<path d="M4 20.5h16M5.5 17.5h13M7 17.5v-9M12 17.5v-9M17 17.5v-9M4.5 8.5h15L12 3.5z"/>'),
    general: BOOK
  };

  var reduceMotion = !!(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  var card = null;      // the one shared card, in <body>
  var srBox = null;     // hidden descriptions the words point at (aria-describedby)
  var entries = [];
  var figBase = '';
  var current = null;   // the .word-note whose card is showing
  var pinned = false;   // opened by click, tap or Enter: stays until dismissed
  var lastPointer = 'mouse';
  var showTimer = 0;
  var hideTimer = 0;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Same 1:1 quote normalization as ai-notes.js, so offsets line up.
  function normQuotes(s) {
    return String(s).replace(/[‘’‚‛]/g, "'").replace(/[“”„‟]/g, '"');
  }

  function escapeRe(s) {
    return String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }

  // Any listed form (longest first), optionally plural, as a whole word.
  function patternFor(e) {
    var forms = (e.forms && e.forms.length ? e.forms : [e.word || e.key]).map(String)
      .sort(function (a, b) { return b.length - a.length; });
    var alts = forms.map(function (f) { return escapeRe(normQuotes(f)).replace(/ /g, '\\s+'); }).join('|');
    return new RegExp('(^|[^\\p{L}\\p{N}])((?:' + alts + ')(?:s|es)?)(?![\\p{L}\\p{N}])', 'giu');
  }

  // Character ranges, per <p>, of every phrase an AI Note anchors to.
  function aiRanges(content) {
    var out = new Map();
    var el = document.getElementById('ai-notes-data');
    if (!el) return out;
    var quotes;
    try {
      quotes = JSON.parse(el.textContent).map(function (n) { return normQuotes(n.quote || ''); }).filter(Boolean);
    } catch (err) { return out; }
    Array.prototype.forEach.call(content.querySelectorAll('p'), function (p) {
      var text = normQuotes(p.textContent);
      var spans = [];
      quotes.forEach(function (q) {
        for (var i = text.indexOf(q); i !== -1; i = text.indexOf(q, i + 1)) spans.push([i, i + q.length]);
      });
      if (spans.length) out.set(p, spans);
    });
    return out;
  }

  function offsetIn(block, node) {
    var w = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
    var n, pos = 0;
    while ((n = w.nextNode())) {
      if (n === node) return pos;
      pos += n.nodeValue.length;
    }
    return -1;
  }

  // Wrap the first usable occurrence of the entry's word in a <span>.
  function markFirst(content, e, blocked) {
    var rx = patternFor(e);
    var walker = document.createTreeWalker(content, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        return n.parentElement && !n.parentElement.closest(SKIP) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    var nodes = [];
    var n;
    while ((n = walker.nextNode())) nodes.push(n);
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      var text = normQuotes(node.nodeValue);
      var p = node.parentElement.closest('p');
      var spans = p ? blocked.get(p) : null;
      var off = spans ? offsetIn(p, node) : 0;
      var m;
      rx.lastIndex = 0;
      while ((m = rx.exec(text))) {
        var start = m.index + m[1].length;
        var end = start + m[2].length;
        if (spans && spans.some(function (s) { return off + start < s[1] && off + end > s[0]; })) continue;
        var word = node.splitText(start);
        word.splitText(end - start);
        var span = document.createElement('span');
        word.parentNode.insertBefore(span, word);
        span.appendChild(word);
        return span;
      }
    }
    return null;
  }

  function wire(span, e, idx) {
    span.className = 'word-note';
    span.tabIndex = 0;
    span.setAttribute('role', 'button');
    span.setAttribute('data-word-note', idx);
    var d = document.createElement('span');
    d.id = 'word-note-desc-' + idx;
    d.textContent = (e.word || e.key) + (e.pos ? ', ' + e.pos : '') + ': ' + e.definition;
    srBox.appendChild(d);
    span.setAttribute('aria-describedby', d.id);
  }

  function cardHtml(e) {
    var topic = e.topic && ICONS[e.topic] ? e.topic : '';
    var meta = [];
    if (e.say) meta.push('<span class="word-card__say">' + esc(e.say) + '</span>');
    if (e.pos) meta.push('<span class="word-card__pos">' + esc(e.pos) + '</span>');
    return '<div class="word-card__body">' +
      '<div class="word-card__top">' +
        '<span class="word-card__label">' + BOOK + esc(LABEL) + '</span>' +
        (topic && topic !== 'general' ? '<span class="word-card__topic">' + ICONS[topic] + esc(topic) + '</span>' : '') +
      '</div>' +
      '<p class="word-card__word">' + esc(e.word || e.key) + '</p>' +
      (meta.length ? '<p class="word-card__meta">' + meta.join('<span class="word-card__dot">·</span>') + '</p>' : '') +
      '<p class="word-card__def">' + esc(e.definition) + '</p>' +
      (e.figure ? '<div class="word-card__fig"><img src="' + esc(figBase + e.figure + '.svg') + '" alt="' +
        esc(e.figure_alt || '') + '" decoding="async"></div>' : '') +
      (e.origin ? '<p class="word-card__origin"><span>Origin</span>' + esc(e.origin) + '</p>' : '') +
    '</div>';
  }

  // Above the word when it fits (the reader has already read that part),
  // otherwise below. If it fits neither way, it takes the roomier side and
  // scrolls inside itself, so it never runs off screen or covers the word.
  function place(el) {
    var rects = el.getClientRects();
    var r = rects.length ? rects[0] : el.getBoundingClientRect();
    var vw = document.documentElement.clientWidth;
    var vh = window.innerHeight;
    var margin = 12;
    var gap = 10;
    var body = card.querySelector('.word-card__body');
    body.style.maxHeight = '';
    card.style.left = '0px';
    card.style.top = '0px';
    var cw = card.offsetWidth;
    var ch = card.offsetHeight;
    var roomAbove = r.top - gap - margin;
    var roomBelow = vh - r.bottom - gap - margin;
    var above = ch <= roomAbove || (ch > roomBelow && roomAbove >= roomBelow);
    if (ch > (above ? roomAbove : roomBelow)) {
      body.style.maxHeight = Math.max(120, (above ? roomAbove : roomBelow) - (ch - body.offsetHeight)) + 'px';
      ch = card.offsetHeight;
    }
    var cx = r.left + r.width / 2;
    var left = Math.max(margin, Math.min(cx - cw / 2, vw - cw - margin));
    card.classList.toggle('is-below', !above);
    card.style.setProperty('--arrow-x', Math.max(18, Math.min(cx - left, cw - 18)) + 'px');
    card.style.left = Math.round(left + window.scrollX) + 'px';
    card.style.top = Math.round((above ? r.top - gap - ch : r.bottom + gap) + window.scrollY) + 'px';
  }

  function show(el, pin) {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    var e = entries[+el.getAttribute('data-word-note')];
    if (!e) return;
    var same = current === el && !card.hidden;
    if (!same) {
      if (current) current.classList.remove('is-open');
      card.innerHTML = cardHtml(e);
      current = el;
      pinned = false;
      el.classList.add('is-open');
      card.hidden = false;
      place(el);
      var img = card.querySelector('img');
      if (img && !img.complete) img.addEventListener('load', function () { if (current === el) place(el); }, { once: true });
      card.classList.remove('is-in');
      if (!reduceMotion) void card.offsetWidth;
      card.classList.add('is-in');
    }
    if (pin) pinned = true;
  }

  function hide() {
    clearTimeout(showTimer);
    clearTimeout(hideTimer);
    if (current) current.classList.remove('is-open');
    current = null;
    pinned = false;
    if (card && !card.hidden) {
      card.hidden = true;
      card.classList.remove('is-in');
    }
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 220);
  }

  function wordFrom(target) {
    return target && target.closest ? target.closest('.word-note') : null;
  }

  function listenOnce() {
    // Mouse: hover shows, leaving hides (the card itself is hoverable).
    document.addEventListener('pointerover', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      var el = wordFrom(ev.target);
      if (!el) return;
      clearTimeout(hideTimer);
      if (current === el && !card.hidden) return;
      clearTimeout(showTimer);
      showTimer = setTimeout(function () { show(el, false); }, card.hidden ? 90 : 0);
    });
    document.addEventListener('pointerout', function (ev) {
      if (ev.pointerType !== 'mouse') return;
      var el = wordFrom(ev.target);
      if (!el) return;
      var to = ev.relatedTarget;
      if (to && (el.contains(to) || card.contains(to))) return;
      clearTimeout(showTimer);
      if (!pinned) scheduleHide();
    });
    card.addEventListener('pointerenter', function () { clearTimeout(hideTimer); });
    card.addEventListener('pointerleave', function (ev) {
      if (ev.pointerType === 'mouse' && !pinned && !(ev.relatedTarget && current && current.contains(ev.relatedTarget))) scheduleHide();
    });

    // Click or tap pins the card open; the same again closes it.
    document.addEventListener('pointerdown', function (ev) {
      lastPointer = ev.pointerType || 'mouse';
      if (card.hidden) return;
      if (wordFrom(ev.target) || card.contains(ev.target)) return;
      hide();
    });
    document.addEventListener('click', function (ev) {
      var el = wordFrom(ev.target);
      if (!el) return;
      if (current === el && pinned) hide();
      else show(el, true);
    });

    // Keyboard: focus shows it; Enter or Space toggles; Escape closes.
    document.addEventListener('focusin', function (ev) {
      var el = wordFrom(ev.target);
      if (el && lastPointer === 'keyboard') show(el, false);
    });
    document.addEventListener('focusout', function (ev) {
      var el = wordFrom(ev.target);
      if (!el || el !== current) return;
      if (ev.relatedTarget) hide();
      else if (!pinned) scheduleHide();
    });
    document.addEventListener('keydown', function (ev) {
      lastPointer = 'keyboard';
      if (ev.key === 'Escape' && !card.hidden) { hide(); return; }
      if (ev.key !== 'Enter' && ev.key !== ' ') return;
      var el = wordFrom(ev.target);
      if (!el) return;
      ev.preventDefault();
      if (current === el && !card.hidden) hide();
      else show(el, true);
    });

    // Phones fire resize as the address bar slides away mid-scroll, so
    // re-aim the card rather than closing it.
    window.addEventListener('resize', function () { if (current && !card.hidden) place(current); });
    document.addEventListener('rsow:navigated', function () {
      hide();
      if (srBox) srBox.textContent = '';
    });
  }

  function ensureDom() {
    if (card) return;
    card = document.createElement('div');
    card.className = 'word-card';
    card.setAttribute('aria-hidden', 'true');   // screen readers get the description instead
    card.hidden = true;
    srBox = document.createElement('div');
    srBox.className = 'word-notes-sr';
    srBox.hidden = true;
    document.body.appendChild(card);
    document.body.appendChild(srBox);
    listenOnce();
  }

  function init() {
    ensureDom();
    var content = document.querySelector('.post-content');
    if (content && content.hasAttribute('data-word-notes')) return;   // this page is done
    hide();
    srBox.textContent = '';
    entries = [];
    var dataEl = document.getElementById('word-notes-data');
    if (!dataEl || !content) return;
    content.setAttribute('data-word-notes', '');
    try { entries = JSON.parse(dataEl.textContent) || []; } catch (err) { entries = []; return; }
    figBase = dataEl.getAttribute('data-figure-base') || '';
    var blocked = aiRanges(content);
    entries.forEach(function (e, i) {
      if (!e || !e.definition) return;
      var span = markFirst(content, e, blocked);
      if (span) wire(span, e, i);
      if (e.figure) new Image().src = figBase + e.figure + '.svg';   // warm the cache before a hover
    });
  }

  window.RSOWWordNotes = { init: init, hide: hide };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
