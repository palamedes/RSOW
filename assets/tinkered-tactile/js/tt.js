/* Tinkered Tactile — progressive enhancement for /tinkered-tactile/.
 * Everything here is optional: without it the pages still read, link and
 * submit. No libraries. */
(function () {
  'use strict';

  var doc = document;
  var root = doc.documentElement;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  root.classList.add('tt-ready');

  function $(sel, ctx) { return (ctx || doc).querySelector(sel); }
  function $$(sel, ctx) { return Array.prototype.slice.call((ctx || doc).querySelectorAll(sel)); }

  // ── Header: floats over the hero, turns solid once you scroll ──────────
  var header = $('[data-tt-header]');
  if (header && header.classList.contains('tt-header--over')) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 24); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  // ── Full-screen menu ───────────────────────────────────────────────────
  var menu = $('[data-tt-menu]');
  var menuBtn = $('[data-tt-menu-open]');
  if (menu && menuBtn) {
    var openMenu = function () {
      if (typeof menu.showModal === 'function') menu.showModal(); else menu.setAttribute('open', '');
      menuBtn.setAttribute('aria-expanded', 'true');
    };
    var closeMenu = function () {
      if (typeof menu.close === 'function') menu.close(); else menu.removeAttribute('open');
      menuBtn.setAttribute('aria-expanded', 'false');
    };
    menuBtn.addEventListener('click', openMenu);
    menu.addEventListener('close', function () { menuBtn.setAttribute('aria-expanded', 'false'); });
    $$('[data-tt-menu-close]', menu).forEach(function (b) { b.addEventListener('click', closeMenu); });
    menu.addEventListener('click', function (e) { if (e.target.closest('a')) closeMenu(); });
  }

  // ── Reveal on scroll ───────────────────────────────────────────────────
  var reveals = $$('[data-reveal]');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); revealer.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -6% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { revealer.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // ── Mobile "Start a project" bar: after the first screen, not over the footer
  var sticky = $('[data-tt-sticky]');
  if (sticky) {
    var atFooter = false;
    var updateSticky = function () {
      sticky.classList.toggle('is-visible', window.scrollY > window.innerHeight * 0.7 && !atFooter);
    };
    var footer = $('.tt-footer');
    if (footer && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) { atFooter = en[0].isIntersecting; updateSticky(); }).observe(footer);
    }
    window.addEventListener('scroll', updateSticky, { passive: true });
    updateSticky();
  }

  // ── Detail carousels: thumbnails scroll the strip, the strip moves the marker
  function initSlides(ctx) {
    $$('.tt-detail', ctx).forEach(function (detail) {
      var track = $('[data-tt-slides]', detail);
      var thumbs = $$('[data-tt-slide]', detail);
      if (!track || !thumbs.length || track.dataset.ttBound) return;
      track.dataset.ttBound = '1';
      thumbs.forEach(function (t) {
        t.addEventListener('click', function () {
          track.scrollTo({ left: Number(t.dataset.ttSlide) * track.clientWidth, behavior: reduceMotion ? 'auto' : 'smooth' });
        });
      });
      var ticking = false;
      track.addEventListener('scroll', function () {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(function () {
          ticking = false;
          var i = Math.round(track.scrollLeft / Math.max(1, track.clientWidth));
          thumbs.forEach(function (t, n) { t.setAttribute('aria-current', String(n === i)); });
        });
      }, { passive: true });
    });
  }
  initSlides(doc);

  // ── Gallery: filters + detail overlay ─────────────────────────────────
  var gallery = $('[data-tt-gallery]');
  if (gallery) {
    var cards = $$('.tt-card', gallery);
    var filterBtns = $$('[data-tt-filter]');
    var empty = $('[data-tt-empty]');
    var matches = function (card, key) {
      return key === 'all' || (' ' + card.dataset.filters + ' ').indexOf(' ' + key + ' ') !== -1;
    };
    filterBtns.forEach(function (b) {
      var n = cards.filter(function (c) { return matches(c, b.dataset.ttFilter); }).length;
      var slot = $('.tt-filter__n', b);
      if (slot) slot.textContent = n;
      if (!n && b.dataset.ttFilter !== 'all') b.hidden = true;
    });

    var applyFilter = function (key, animate) {
      if (!filterBtns.some(function (b) { return b.dataset.ttFilter === key; })) key = 'all';
      filterBtns.forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.ttFilter === key)); });
      var before = new Map();
      if (animate && !reduceMotion) {
        cards.forEach(function (c) { if (!c.classList.contains('is-hidden')) before.set(c, c.getBoundingClientRect()); });
      }
      var shown = 0;
      cards.forEach(function (c) {
        var on = matches(c, key);
        c.classList.toggle('is-hidden', !on);
        if (on) shown++;
      });
      if (empty) empty.hidden = shown > 0;
      if (!animate || reduceMotion) return;
      // FLIP: slide survivors from where they were; fade newcomers in.
      cards.forEach(function (c) {
        if (c.classList.contains('is-hidden')) return;
        var a = before.get(c);
        if (!a) {
          c.classList.remove('is-entering');
          void c.offsetWidth;
          c.classList.add('is-entering');
          return;
        }
        var b = c.getBoundingClientRect();
        var dx = a.left - b.left, dy = a.top - b.top;
        if (Math.abs(dx) < 1 && Math.abs(dy) < 1) return;
        if (c.animate) {
          c.animate([{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }],
            { duration: 480, easing: 'cubic-bezier(.2,.7,.2,1)' });
        }
      });
    };
    filterBtns.forEach(function (b) {
      b.addEventListener('click', function () {
        var key = b.dataset.ttFilter;
        applyFilter(key, true);
        var url = new URL(location.href);
        if (key === 'all') url.searchParams.delete('filter'); else url.searchParams.set('filter', key);
        history.replaceState(history.state, '', url);
      });
    });
    applyFilter(new URLSearchParams(location.search).get('filter') || 'all', false);

    // Detail overlay
    var dlg = $('[data-tt-dialog]');
    if (dlg && typeof dlg.showModal === 'function') {
      var body = $('[data-tt-dialog-body]', dlg);
      var countEl = $('[data-tt-dialog-count]', dlg);
      var pageLink = $('[data-tt-dialog-page]', dlg);
      var baseTitle = doc.title;
      var galleryUrl = location.href;
      var current = null;
      var pushed = false;

      var visible = function () { return cards.filter(function (c) { return !c.classList.contains('is-hidden'); }); };
      var openSlug = function (slug, mode) {
        var tpl = doc.getElementById('tt-tpl-' + slug);
        var card = gallery.querySelector('.tt-card[data-slug="' + slug + '"]');
        if (!tpl || !card) return false;
        body.innerHTML = '';
        body.appendChild(tpl.content.cloneNode(true));
        body.scrollTop = 0;
        current = card;
        var list = visible();
        var i = list.indexOf(card);
        countEl.textContent = (i < 0 ? 1 : i + 1) + ' / ' + list.length;
        var url = card.querySelector('.tt-card__link').getAttribute('href');
        pageLink.href = url;
        doc.title = card.querySelector('.tt-card__title').textContent + ' | Tinkered Tactile';
        if (!dlg.open) dlg.showModal();
        if (mode === 'push') { history.pushState({ ttSlug: slug }, '', url); pushed = true; }
        else if (mode === 'replace') { history.replaceState({ ttSlug: slug }, '', url); }
        initSlides(body);
        var title = $('.tt-detail__title', body);
        if (title) { title.setAttribute('tabindex', '-1'); title.focus({ preventScroll: true }); }
        return true;
      };
      var step = function (d) {
        var list = visible();
        if (!current || list.length < 2) return;
        var i = list.indexOf(current);
        openSlug(list[(i + d + list.length) % list.length].dataset.slug, pushed ? 'replace' : null);
      };

      gallery.addEventListener('click', function (e) {
        var a = e.target.closest('[data-tt-open]');
        if (!a || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        if (openSlug(a.dataset.ttOpen, 'push')) e.preventDefault();
      });
      $('[data-tt-dialog-close]', dlg).addEventListener('click', function () { dlg.close(); });
      $('[data-tt-dialog-prev]', dlg).addEventListener('click', function () { step(-1); });
      $('[data-tt-dialog-next]', dlg).addEventListener('click', function () { step(1); });
      dlg.addEventListener('click', function (e) { if (e.target === dlg) dlg.close(); });   // backdrop
      dlg.addEventListener('keydown', function (e) {
        if (e.target.closest('input, textarea, select, [data-tt-slides], .tt-detail__thumbs')) return;
        if (e.key === 'ArrowRight') { e.preventDefault(); step(1); }
        if (e.key === 'ArrowLeft') { e.preventDefault(); step(-1); }
      });
      dlg.addEventListener('close', function () {
        doc.title = baseTitle;
        body.innerHTML = '';
        var link = current && current.querySelector('.tt-card__link');
        current = null;
        if (pushed) { pushed = false; history.back(); }
        if (link) link.focus({ preventScroll: true });
      });
      window.addEventListener('popstate', function (e) {
        var slug = e.state && e.state.ttSlug;
        if (slug) {                       // forward into a piece
          if (openSlug(slug, null)) pushed = true;
        } else if (dlg.open) {            // back out of one
          pushed = false;
          dlg.close();
          if (location.href !== galleryUrl) galleryUrl = location.href;
        }
      });
    }
  }

  // ── Forms ──────────────────────────────────────────────────────────────
  var MAX_FILE = 10 * 1024 * 1024;
  var FILE_OK = /\.(jpe?g|png|pdf|svg)$/i;
  var fmtSize = function (n) { return n < 1048576 ? Math.max(1, Math.round(n / 1024)) + ' KB' : (n / 1048576).toFixed(1) + ' MB'; };

  $$('[data-tt-form]').forEach(function (form) {
    var endpoint = form.getAttribute('data-endpoint') || '';
    var status = $('[data-tt-status]', form);
    var success = doc.getElementById(form.getAttribute('data-success') || '');
    var params = new URLSearchParams(location.search);

    var setCategory = function (value) {
      $$('input[name="category"]', form).forEach(function (r) { if (r.value === value) r.checked = true; });
    };
    var showStatus = function (kind, text) {
      if (!status) return;
      status.className = 'tt-form__status tt-form__status--' + kind;
      status.textContent = text;
      status.hidden = false;
      status.scrollIntoView({ block: 'nearest', behavior: reduceMotion ? 'auto' : 'smooth' });
    };

    // Arriving from a piece ("I want one like this") or the business page
    var pieces = {};
    try { pieces = JSON.parse(($('#tt-pieces') || { textContent: '{}' }).textContent); } catch (err) { pieces = {}; }
    var msg = form.elements.message;
    var piece = pieces[params.get('piece')];
    if (piece && msg && !msg.value) {
      msg.value = 'I saw the ' + piece.title + ' and I want something like it. ';
      if (piece.category) setCategory(piece.category);
      var from = $('[data-tt-from]', form);
      if (from) { from.hidden = false; $('a', from).href = piece.url; $('a', from).textContent = piece.title; }
    }
    if (params.get('type') === 'business') setCategory('Business / Logo');

    // Files: keep a running list so people can add in batches and remove one
    var input = $('input[type="file"]', form);
    var list = $('[data-tt-files]', form);
    var drop = $('[data-tt-drop]', form);
    var store = null;
    try { store = new DataTransfer(); } catch (err) { store = null; }
    var badFiles = function () {
      var files = input ? input.files : [];
      return Array.prototype.some.call(files, function (f) { return !FILE_OK.test(f.name) || f.size > MAX_FILE; });
    };
    var renderFiles = function () {
      if (!list || !input) return;
      list.innerHTML = '';
      Array.prototype.forEach.call(input.files, function (f, i) {
        var bad = !FILE_OK.test(f.name) || f.size > MAX_FILE;
        var li = doc.createElement('li');
        li.className = 'tt-file' + (bad ? ' tt-file--bad' : '');
        li.innerHTML = '<svg class="tt-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>';
        var name = doc.createElement('span');
        name.className = 'tt-file__name';
        name.textContent = f.name;
        var size = doc.createElement('span');
        size.className = 'tt-file__size';
        size.textContent = bad ? (FILE_OK.test(f.name) ? 'Over 10 MB' : 'JPG, PNG, PDF or SVG only') : fmtSize(f.size);
        li.appendChild(name);
        li.appendChild(size);
        if (store) {
          var rm = doc.createElement('button');
          rm.type = 'button';
          rm.className = 'tt-file__remove';
          rm.setAttribute('aria-label', 'Remove ' + f.name);
          rm.innerHTML = '<svg class="tt-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M6 6l12 12M18 6 6 18"/></svg>';
          rm.addEventListener('click', function () {
            var next = new DataTransfer();
            Array.prototype.forEach.call(store.files, function (g, n) { if (n !== i) next.items.add(g); });
            store = next;
            input.files = store.files;
            renderFiles();
            input.focus();
          });
          li.appendChild(rm);
        }
        list.appendChild(li);
      });
    };
    if (input) {
      input.addEventListener('change', function () {
        if (store) {
          Array.prototype.forEach.call(input.files, function (f) {
            var dupe = Array.prototype.some.call(store.files, function (g) { return g.name === f.name && g.size === f.size; });
            if (!dupe) store.items.add(f);
          });
          input.files = store.files;
        }
        renderFiles();
      });
    }
    if (drop) {
      ['dragenter', 'dragover'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.add('is-over'); }); });
      ['dragleave', 'dragend', 'drop'].forEach(function (t) { drop.addEventListener(t, function () { drop.classList.remove('is-over'); }); });
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (status) status.hidden = true;
      if (!form.reportValidity()) return;
      if (badFiles()) { showStatus('error', 'One of those files won’t go through: JPG, PNG, PDF or SVG, up to 10 MB each.'); return; }
      var done = function () {
        form.hidden = true;
        if (success) {
          success.hidden = false;
          success.scrollIntoView({ block: 'start', behavior: reduceMotion ? 'auto' : 'smooth' });
          var h = $('h2, h3', success);
          if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        }
      };
      if (form.elements._gotcha && form.elements._gotcha.value) { done(); return; }   // bots get a nice day too
      if (!endpoint) {
        showStatus('notice', 'This form isn’t connected yet, so nothing was sent. (It’s a preview.)');
        return;
      }
      form.classList.add('is-sending');
      fetch(endpoint, { method: 'POST', body: new FormData(form), headers: { Accept: 'application/json' } })
        .then(function (r) {
          return r.json().catch(function () { return {}; }).then(function (j) { return { ok: r.ok, json: j }; });
        })
        .then(function (res) {
          if (res.ok) { done(); return; }
          var errs = res.json && res.json.errors;
          showStatus('error', (errs && errs.map(function (x) { return x.message; }).join(' ')) ||
            'Something went sideways sending that. Try again in a minute?');
        })
        .catch(function () { showStatus('error', 'We couldn’t reach the server. Check your connection and try again.'); })
        .then(function () { form.classList.remove('is-sending'); });
    });
  });
})();
