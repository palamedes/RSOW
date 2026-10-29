/*
 * Windows 95 (the "win95" design, _data/views.yml): windows you can
 * minimize, maximize, close and drag, a button on the taskbar for each,
 * the Start menu, and the clock in the tray.
 *
 * The loader in <head> adds this file only while Windows 95 is the
 * active design. It is progressive enhancement: without it every window
 * is simply open (its title bar and buttons are drawn by the stylesheet,
 * for show) and nothing is lost. Nothing is remembered either: a reload
 * brings every window back where it was.
 *
 * Which blocks are windows is the list below; keep it in step with
 * $windows in _sass/views/win95/_windows.scss.
 *
 * The narration player swaps <main> while it plays (soft navigation)
 * and then fires "rsow:navigated"; the windows in the new <main> are set
 * up again and the old ones' task buttons go away.
 */
(function () {
  "use strict";

  var doc = document;
  var root = doc.documentElement;
  if (root.getAttribute("data-view") !== "win95") return;

  var DRAG_MIN = 1100;          // windows can be dragged from this width up
  var motion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
  function still() { return !!(motion && motion.matches); }

  // ── Which blocks are windows ─────────────────────────────
  function heading(sel, fallback, suffix, titleCase) {
    return function (el) {
      var n = el.querySelector(sel);
      var t = n ? n.textContent.replace(/\s+/g, " ").trim() : "";
      if (t && titleCase) t = toTitle(t);
      return (t || fallback) + (suffix || "");
    };
  }
  // "a life in chapters" -> "A Life in Chapters"
  function toTitle(t) {
    var small = /^(a|an|and|at|but|by|for|in|of|on|or|the|to)$/i;
    return t.split(" ").map(function (w, i) {
      if (i > 0 && small.test(w)) return w.toLowerCase();
      return w.charAt(0).toUpperCase() + w.slice(1);
    }).join(" ");
  }
  var WINDOWS = [
    [".home-hero", "About Jason Ellis", "user"],
    [".home-body", heading(".recent-posts-heading", "Most Recent Blog Posts"), "folder-open"],
    [".post", heading(".post-hero-title", "Document", " - WordPad"), "wordpad"],
    [".recent-posts", heading("h3", "Recent Posts"), "folder-open"],
    [".arc:not(.tc)", "Exploring - Blog", "folder-open"],
    [".arc.tc", function (el) { return el.querySelector(".tc-cloud--tag") ? "Exploring - Tags" : "Exploring - Topics"; }, "folder-open"],
    [".abt-hero", "Jason Ellis Properties", "user"],
    [".abt-names-section", heading(".abt-kicker", "Who's Writing", "", true), "user"],
    [".abt-timeline-section", heading(".abt-kicker", "A Life in Chapters", "", true), "calendar"],
    [".abt-maker-section", heading(".abt-kicker", "Off the Clock", "", true), "tools"],
    [".abt-writing-section", heading(".abt-kicker", "In My Own Words", "", true), "folder-open"],
    [".abt-gallery-section", heading(".abt-kicker", "A Few Snapshots", "", true), "picture"],
    [".abt-outro", "RandomStringOfWords", "info"],
    [".site-content article.page:not(.page-bare)", function (el) {
      return el.querySelector(".vg") ? "Display Properties" : heading("h1", "RandomStringOfWords")(el);
    }, function (el) { return el.querySelector(".vg") ? "computer" : "notepad"; }],
    [".site-content .archive", heading("h1", "RandomStringOfWords"), "folder-open"],
    [".gam", heading("h1", "Games"), "joystick"],
    [".inv", heading("h1", "The Drip Fund"), "chart"],
    [".exp-index", "Explainers - Help Topics", "help"],
    [".exp:not(.exp-index)", heading("h1", "Explainers", " - Help"), "help"],
    [".pal", heading("h1", "Palamedes"), "doc"],
    [".bld", heading("h1", "Build"), "tools"],
    [".photo-desk", "Photos - Paint", "paint"],
    [".footer-about", heading("h3", "About Me"), "user"]
  ];

  var header = doc.querySelector(".site-header .header-inner");
  if (!header) return;

  var wins = [];                // { el, bar, task, title, maxBtn }
  var zTop = 10;

  // ── The taskbar's buttons ────────────────────────────────
  var tasks = doc.createElement("div");
  tasks.className = "w95-tasks";
  tasks.setAttribute("role", "group");
  tasks.setAttribute("aria-label", "Windows");
  var nav = doc.getElementById("site-nav");
  header.insertBefore(tasks, nav ? nav.nextSibling : null);

  function el(tag, cls, attrs) {
    var n = doc.createElement(tag);
    if (cls) n.className = cls;
    for (var k in attrs || {}) n.setAttribute(k, attrs[k]);
    return n;
  }

  function makeWindow(node, title, icon) {
    node.classList.add("w95-win");
    if (!node.hasAttribute("tabindex")) node.setAttribute("tabindex", "-1");

    var bar = el("div", "w95-titlebar");
    var ico = el("span", "w95-title-ico", { "data-icon": icon, "aria-hidden": "true" });
    var txt = el("span", "w95-title-text", { "aria-hidden": "true" });
    txt.textContent = title;
    var btns = el("div", "w95-tbtns", { role: "group", "aria-label": title + " window" });
    var bMin = el("button", "w95-tbtn w95-tbtn--min", { type: "button", "aria-label": "Minimize", title: "Minimize" });
    var bMax = el("button", "w95-tbtn w95-tbtn--max", { type: "button", "aria-label": "Maximize", title: "Maximize" });
    var bClose = el("button", "w95-tbtn w95-tbtn--close", { type: "button", "aria-label": "Close", title: "Close" });
    btns.appendChild(bMin); btns.appendChild(bMax); btns.appendChild(bClose);
    bar.appendChild(ico); bar.appendChild(txt); bar.appendChild(btns);
    node.insertBefore(bar, node.firstChild);

    var task = el("button", "w95-task", { type: "button", title: title });
    var tIco = el("span", "w95-task-ico", { "data-icon": icon, "aria-hidden": "true" });
    var tTxt = el("span", "w95-task-text");
    tTxt.textContent = title;
    var tState = el("span", "w95-task-state");
    task.appendChild(tIco); task.appendChild(tTxt); task.appendChild(tState);
    tasks.appendChild(task);

    var w = { el: node, bar: bar, task: task, state: tState, title: title, maxBtn: bMax };
    wins.push(w);

    bMin.addEventListener("click", function () { hide(w, "min"); });
    bClose.addEventListener("click", function () { hide(w, "closed"); });
    bMax.addEventListener("click", function () { setMax(w, !node.classList.contains("is-max")); });
    bar.addEventListener("dblclick", function (e) {
      if (e.target.closest(".w95-tbtns")) return;
      setMax(w, !node.classList.contains("is-max"));
    });
    task.addEventListener("click", function () { onTask(w); });
    node.addEventListener("pointerdown", function () { activate(w); });
    node.addEventListener("focusin", function () { activate(w); });
    bar.addEventListener("pointerdown", function (e) { startDrag(w, e); });
    if (io) io.observe(node);
  }

  function setup(scope) {
    WINDOWS.forEach(function (d) {
      var list = scope.querySelectorAll(d[0]);
      for (var i = 0; i < list.length; i++) {
        var n = list[i];
        // already a window, or not shown in this design right now (the
        // blue screen hides the footer's windows)
        if (n.classList.contains("w95-win") || getComputedStyle(n).display === "none") continue;
        var title = typeof d[1] === "function" ? d[1](n) : d[1];
        var icon = typeof d[2] === "function" ? d[2](n) : d[2];
        makeWindow(n, title, icon);
      }
    });
    // task buttons in page order (after soft navigation the new <main>'s
    // windows come before the footer's)
    wins.sort(function (a, b) { return a.el.compareDocumentPosition(b.el) & 4 ? -1 : 1; });
    wins.forEach(function (w) { tasks.appendChild(w.task); });
    syncTasks();
  }

  // ── Minimize / close / restore ───────────────────────────
  function isHidden(w) {
    return w.el.classList.contains("is-min") || w.el.classList.contains("is-closed");
  }

  function hide(w, how) {
    if (w.el.classList.contains("is-max")) setMax(w, false);
    var from = w.bar.getBoundingClientRect();
    var hadFocus = w.el.contains(doc.activeElement);
    w.el.classList.remove("is-min", "is-closed", "is-active");
    w.el.classList.add(how === "closed" ? "is-closed" : "is-min");
    syncTasks();
    zoom(from, w.task.getBoundingClientRect());
    if (hadFocus) w.task.focus();
    // the next window in view takes over as the active one
    var next = wins.filter(function (x) { return !isHidden(x) && inView(x.el); })[0];
    if (next) activate(next);
  }

  function restore(w) {
    var from = w.task.getBoundingClientRect();
    w.el.classList.remove("is-min", "is-closed");
    syncTasks();
    activate(w);
    var r = w.el.getBoundingClientRect();
    if (r.top < 0 || r.top > window.innerHeight - 120) {
      w.el.scrollIntoView({ block: "start", behavior: still() ? "auto" : "smooth" });
    }
    zoom(from, w.bar.getBoundingClientRect());
    w.el.focus({ preventScroll: true });
  }

  function onTask(w) {
    if (isHidden(w)) { restore(w); return; }
    if (w.el.classList.contains("is-active") && inView(w.el)) { hide(w, "min"); return; }
    activate(w);
    w.el.scrollIntoView({ block: "start", behavior: still() ? "auto" : "smooth" });
    w.el.focus({ preventScroll: true });
  }

  function setMax(w, on) {
    w.el.classList.toggle("is-max", on);
    w.maxBtn.className = "w95-tbtn " + (on ? "w95-tbtn--restore" : "w95-tbtn--max");
    w.maxBtn.setAttribute("aria-label", on ? "Restore" : "Maximize");
    w.maxBtn.title = on ? "Restore" : "Maximize";
    if (on) { w.el.scrollTop = 0; activate(w); }
    root.classList.toggle("w95-has-max", wins.some(function (x) { return x.el.classList.contains("is-max"); }));
  }

  // The taskbar button's look and its spoken state.
  function syncTasks() {
    wins.forEach(function (w) {
      var min = w.el.classList.contains("is-min"), closed = w.el.classList.contains("is-closed");
      w.task.classList.toggle("is-hidden", min || closed);
      w.task.classList.toggle("is-active", w.el.classList.contains("is-active"));
      w.state.textContent = min ? " (minimized)" : closed ? " (closed)" : "";
      w.task.title = w.title + (min ? " (minimized)" : closed ? " (closed)" : "");
    });
  }

  // The outline that flies between a window and its task button.
  function zoom(a, b) {
    if (still() || !a.width || !b.width) return;
    var z = el("div", "w95-zoom", { "aria-hidden": "true" });
    function put(r) {
      z.style.left = r.left + "px"; z.style.top = r.top + "px";
      z.style.width = r.width + "px"; z.style.height = r.height + "px";
    }
    put(a);
    doc.body.appendChild(z);
    z.getBoundingClientRect();
    put(b);
    setTimeout(function () { if (z.parentNode) z.parentNode.removeChild(z); }, 260);
  }

  // ── The active window ────────────────────────────────────
  function activate(w) {
    if (!w || isHidden(w)) return;
    if (!w.el.classList.contains("is-active")) {
      wins.forEach(function (x) { x.el.classList.toggle("is-active", x === w); });
      syncTasks();
    }
  }
  function inView(n) {
    var r = n.getBoundingClientRect();
    return r.bottom > 40 && r.top < window.innerHeight - 60;
  }
  // As you scroll, the window across the upper middle of the screen is
  // the active one (blue title bar); the others go grey.
  var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
    for (var i = 0; i < entries.length; i++) {
      if (!entries[i].isIntersecting) continue;
      for (var j = 0; j < wins.length; j++) {
        if (wins[j].el === entries[i].target) { activate(wins[j]); break; }
      }
    }
  }, { rootMargin: "-30% 0px -60% 0px" }) : null;

  // ── Dragging (wide screens) ──────────────────────────────
  function wide() { return window.innerWidth >= DRAG_MIN; }
  function offset(n, prop) { return parseFloat(n.style[prop]) || 0; }

  function startDrag(w, e) {
    if (!wide() || e.button !== 0 || e.target.closest(".w95-tbtns")) return;
    if (w.el.classList.contains("is-max")) return;
    var n = w.el, bar = w.bar;
    var x0 = e.clientX, y0 = e.clientY;
    var left0 = offset(n, "left"), top0 = offset(n, "top");
    var r0 = n.getBoundingClientRect(), b0 = bar.getBoundingClientRect();
    var taskbar = (doc.querySelector(".dark-header-wrap") || { offsetHeight: 34 }).offsetHeight;
    var moved = false;
    zTop += 1;
    if (zTop > 800) zTop = 11;
    n.style.zIndex = zTop;
    try { bar.setPointerCapture(e.pointerId); } catch (err) {}

    function move(ev) {
      var dx = ev.clientX - x0, dy = ev.clientY - y0;
      if (!moved && Math.abs(dx) + Math.abs(dy) < 3) return;
      moved = true;
      n.classList.add("is-dragging");
      // keep the window on screen: across, all of it (or its left edge if
      // it's wider than the screen); its top edge below the top of the
      // screen, and its title bar above the taskbar
      var W = doc.documentElement.clientWidth, H = window.innerHeight - taskbar;
      var minDx = -r0.left, maxDx = Math.max(minDx, W - r0.right);
      var minDy = -r0.top, maxDy = H - b0.bottom;
      dx = Math.min(Math.max(dx, minDx), maxDx);
      dy = Math.min(Math.max(dy, minDy), maxDy);
      n.style.left = (left0 + dx) + "px";
      n.style.top = (top0 + dy) + "px";
    }
    function end() {
      n.classList.remove("is-dragging");
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", end);
      bar.removeEventListener("pointercancel", end);
    }
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", end);
    bar.addEventListener("pointercancel", end);
    e.preventDefault();
  }

  // back into the stack when the screen gets too narrow to drag
  window.addEventListener("resize", function () {
    if (wide()) return;
    wins.forEach(function (w) { w.el.style.left = ""; w.el.style.top = ""; w.el.style.zIndex = ""; });
  });

  // ── The Start menu (the site nav and its toggle) ─────────
  var start = doc.getElementById("nav-toggle");
  if (start && nav) {
    // the button reads "Start" here, so that's its name too
    start.setAttribute("aria-label", "Start");
    var links = function () { return Array.prototype.slice.call(nav.querySelectorAll("a")); };
    var open = function () { return start.getAttribute("aria-expanded") === "true"; };
    // the shared script toggles on click; open with the keyboard and the
    // first item is selected, as in Windows
    start.addEventListener("keydown", function (e) {
      if ((e.key === "ArrowUp" || e.key === "ArrowDown") && !open()) {
        e.preventDefault();
        start.click();
      }
    });
    start.addEventListener("click", function (e) {
      if (open() && e.detail === 0) { var l = links(); if (l[0]) l[0].focus(); }
    });
    doc.addEventListener("click", function (e) {
      if (open() && !nav.contains(e.target) && !start.contains(e.target)) start.click();
    });
    nav.addEventListener("keydown", function (e) {
      var l = links(), i = l.indexOf(doc.activeElement), next = null;
      if (e.key === "ArrowDown") next = l[(i + 1) % l.length];
      else if (e.key === "ArrowUp") next = l[(i - 1 + l.length) % l.length];
      else if (e.key === "Home") next = l[0];
      else if (e.key === "End") next = l[l.length - 1];
      if (next) { e.preventDefault(); next.focus(); }
    });
    nav.addEventListener("focusout", function (e) {
      if (open() && e.relatedTarget && !nav.contains(e.relatedTarget) && e.relatedTarget !== start) start.click();
    });
  }

  // ── Display Properties (the design picker) gets a close box ──
  var pick = doc.getElementById("view-picker-btn");
  var pickMenu = doc.getElementById("view-picker-menu");
  var pickHead = doc.getElementById("view-picker-head");
  if (pick && pickMenu && pickHead) {
    var x = el("button", "w95-tbtn w95-tbtn--close w95-picker-close", { type: "button", "aria-label": "Close", title: "Close" });
    pickHead.parentNode.insertBefore(x, pickHead.nextSibling);
    x.addEventListener("click", function () {
      if (pick.getAttribute("aria-expanded") === "true") pick.click();
      pick.focus();
    });
  }

  // ── The clock ────────────────────────────────────────────
  var clock = el("span", "w95-clock", { "aria-hidden": "true" });
  header.appendChild(clock);
  function tick() {
    var d = new Date(), h = d.getHours(), m = d.getMinutes();
    clock.textContent = ((h % 12) || 12) + ":" + (m < 10 ? "0" : "") + m + " " + (h < 12 ? "AM" : "PM");
    try {
      clock.title = d.toLocaleDateString(undefined, { weekday: "long", year: "numeric", month: "long", day: "numeric" });
    } catch (err) {}
  }
  tick();
  setTimeout(function () { tick(); setInterval(tick, 60000); }, (60 - new Date().getSeconds()) * 1000 + 50);

  // ── The blue screen: press any key to continue ───────────
  doc.addEventListener("keydown", function (e) {
    if (!doc.querySelector(".site-content .error-404")) return;
    if (e.ctrlKey || e.metaKey || e.altKey || e.defaultPrevented) return;
    var t = e.target;
    if (t !== doc.body && t !== root && !(t.matches && t.matches("main"))) return;
    if (e.key.length !== 1 && e.key !== "Enter" && e.key !== "Escape") return;
    var home = doc.querySelector(".error-404 a[href]");
    if (home) location.href = home.href;
  });

  // ── Go ───────────────────────────────────────────────────
  setup(doc);
  var first = wins.filter(function (w) { return inView(w.el); })[0] || wins[0];
  activate(first);

  // soft navigation swapped <main>: drop the old windows, set up the new
  doc.addEventListener("rsow:navigated", function () {
    wins = wins.filter(function (w) {
      if (doc.contains(w.el)) return true;
      if (w.task.parentNode) w.task.parentNode.removeChild(w.task);
      if (io) io.unobserve(w.el);
      return false;
    });
    root.classList.toggle("w95-has-max", wins.some(function (x) { return x.el.classList.contains("is-max"); }));
    var main = doc.querySelector("main.site-content");
    setup(doc);
    var top = wins.filter(function (w) { return main && main.contains(w.el); })[0];
    if (top) activate(top);
  });
})();
