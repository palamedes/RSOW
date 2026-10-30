# /// script
# requires-python = ">=3.10"
# dependencies = ["playwright", "pyyaml"]
# ///
"""Check every design ("view", _data/views.yml) on the key pages.

    uv run --quiet _tools/view-check.py [OUT_DIR] [options]

Builds the site (jekyll build --future), serves _site on a free port and
loads each page in each ready design at 1440 and 390 px wide (and dark, for
a design with a light/dark toggle). It fails, loudly, when

  - the build warns (main builds clean, so any warning is new)
  - a page scrolls sideways at 390 px
  - a hook the scripts rely on is missing: main.site-content, the design
    picker, the nav and its toggle, #resume-slot, the gallery modal, the
    narration player, the support widget's script (and .post-content /
    the archive grid where they belong)
  - the stylesheet in use isn't the design's own (or another site
    stylesheet is loaded alongside it), or <html data-view> is wrong
  - a design with a `script:` didn't load it, or any design's page loads
    another design's script (a design without one must load none)
  - the picker isn't in the footer, or (on the home page, where it's
    opened) its list doesn't show, runs off the screen or is covered
  - Default shows any .view-extra
  - a page throws a JavaScript error

Screenshots (the first screenful of each page, plus the home page's foot
with the picker open) go to OUT_DIR, default /tmp/rsow-view-check. --thumbs also remakes the /views/ gallery's
screenshots, assets/images/views/<key>.webp (720x450), from the home page,
and the picker's small ones, assets/images/views/thumbs/<key>.webp (144x90).

Options:
  --views a,b     only these designs (default: every `ready: true` one)
  --all           include designs that aren't ready yet
  --pages /,/x/   only these pages
  --widths 1440   only these widths
  --full          full-page screenshots instead of the first screenful
  --no-build      use the _site that's there
  --no-dark       skip the dark pass for designs with a light/dark toggle
  --thumbs        remake the gallery screenshots too
  --allow-warnings  don't fail on build warnings
"""
import argparse
import functools
import glob
import http.server
import os
import re
import socketserver
import subprocess
import sys
import threading
import time

import yaml
from playwright.sync_api import sync_playwright

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

PAGES = [
    "/",
    "/post/welcome-to-mount-stupid-the-view-is-fantastic-and-nobody-knows-shit/",
    "/post/building-7/",
    "/archive/",
    "/tags/",
    "/topics/",
    "/about/",
    "/views/",
    "/explain/",
    "/games/",
    "/investments/",
    "/hire/",
    "/404.html",
]

# Requests that only add flake: the comments iframe and the support widget's
# script (its <script> tag is still checked for). Google Fonts load.
BLOCK = ("giscus.app", "jasonellisbuilds.com")

HOOKS_JS = r"""
(view) => {
  const q = (s) => document.querySelectorAll(s).length;
  const out = { missing: [], sheets: [], extras: [] };
  const need = {
    "main.site-content": q("main.site-content") === 1,
    "#view-picker (in the footer)": q("footer #view-picker") === 1 && q("#view-picker") === 1 && q("#view-picker-btn") === 1 && q("#view-picker-menu") === 1,
    "#site-nav": q("#site-nav") === 1,
    "#nav-toggle": q("#nav-toggle") === 1,
    "#resume-slot": q("#resume-slot") === 1,
    "#gallery-modal": q("#gallery-modal") === 1,
    "#rsow-player": q("#rsow-player") === 1,
    "support widget script": q('script[src*="jasonellisbuilds.com/widget.js"]') === 1,
    "footer link to /views/": q('footer a[href$="/views/"]') >= 1,
  };
  if (location.pathname.startsWith("/post/")) need[".post-content"] = q(".post-content") === 1;
  if (location.pathname === "/archive/") need["#archive-grid .post-card-wrap"] = q("#archive-grid .post-card-wrap") > 100;
  for (const k in need) if (!need[k]) out.missing.push(k);
  for (const l of document.querySelectorAll('link[rel~="stylesheet"]')) {
    const u = new URL(l.href, location.href);
    if (u.origin === location.origin) out.sheets.push(u.pathname + (l.sheet ? "" : " (not loaded)"));
  }
  // design scripts (views.yml `script:`): every one on the page, and whether it arrived
  out.scripts = [...document.querySelectorAll('script[src]')]
    .map((x) => new URL(x.src, location.href))
    .filter((u) => u.origin === location.origin && u.pathname.startsWith("/assets/js/views/"))
    .map((u) => {
      const e = performance.getEntriesByType("resource").find((r) => r.name === u.href);
      const st = e && typeof e.responseStatus === "number" ? e.responseStatus : (e ? 200 : 0);
      return { path: u.pathname, ok: st >= 200 && st < 400 };
    });
  out.view = document.documentElement.getAttribute("data-view");
  out.viewCss = (() => { const l = document.getElementById("view-css"); if (!l) return null;
    let n = -1; try { n = l.sheet ? l.sheet.cssRules.length : -1; } catch (e) {}
    return { path: new URL(l.href, location.href).pathname, rules: n }; })();
  if (view === "default") {
    for (const e of document.querySelectorAll(".view-extra"))
      if (getComputedStyle(e).display !== "none") out.extras.push(e.className);
  }
  out.scrollW = document.documentElement.scrollWidth;
  out.innerW = window.innerWidth;
  return out;
}
"""

# The widest things poking past the right edge, to say where an overflow is.
OVERFLOW_JS = r"""
() => {
  const W = window.innerWidth, hits = [];
  for (const e of document.body.querySelectorAll("*")) {
    const r = e.getBoundingClientRect();
    if (r.width && r.right > W + 1) {
      let p = e.parentElement, clipped = false;
      while (p && p !== document.body) {
        const s = getComputedStyle(p);
        if (/(hidden|clip|auto|scroll)/.test(s.overflowX)) { const pr = p.getBoundingClientRect(); if (pr.right <= W + 1) { clipped = true; break; } }
        p = p.parentElement;
      }
      if (!clipped) hits.push([Math.round(r.right - W), e.tagName.toLowerCase() + (e.id ? "#" + e.id : "") + (typeof e.className === "string" && e.className ? "." + e.className.trim().split(/\s+/).join(".") : "")]);
    }
  }
  hits.sort((a, b) => b[0] - a[0]);
  return hits.slice(0, 6);
}
"""

SETTLE_JS = r"""
async () => {
  await document.fonts.ready;
  const t0 = Date.now();
  while (Date.now() - t0 < 4000) {
    const pending = [...document.images].filter(i => i.loading !== "lazy" && i.src && i.getClientRects().length && !i.complete);
    if (!pending.length) break;
    await new Promise(r => setTimeout(r, 100));
  }
}
"""

# The picker's list, once opened: on screen, and on top of whatever is there.
PICKER_JS = r"""
() => {
  const m = document.getElementById("view-picker-menu");
  if (!m || m.hidden) return { open: false };
  const r = m.getBoundingClientRect();
  const W = document.documentElement.clientWidth, H = window.innerHeight;
  const pts = [[r.left + 12, r.top + 12], [r.right - 12, r.top + 12], [r.left + r.width / 2, r.top + r.height / 2], [r.left + 12, r.bottom - 12]];
  const covered = pts.some(([x, y]) => { const e = document.elementFromPoint(x, y); return !e || !m.contains(e); });
  return { open: r.width > 0 && r.height > 0, left: r.left, right: r.right, top: r.top, bottom: r.bottom, W, H, covered };
}
"""

FREEZE_CSS = "*, *::before, *::after { animation-play-state: paused !important; caret-color: transparent !important; }"


def launch(p):
    try:
        return p.chromium.launch()
    except Exception as first:
        # Fall back to any Chromium Playwright has already downloaded.
        cands = sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium-*/chrome-linux*/chrome")), reverse=True)
        cands += sorted(glob.glob(os.path.expanduser("~/.cache/ms-playwright/chromium_headless_shell-*/chrome-headless-shell-linux*/chrome-headless-shell")), reverse=True)
        for exe in cands:
            try:
                return p.chromium.launch(executable_path=exe)
            except Exception:
                continue
        raise SystemExit(f"Couldn't start Chromium ({first}). Try: uv run --with playwright playwright install chromium")


class Quiet(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a):
        pass


def serve(directory):
    handler = functools.partial(Quiet, directory=directory)
    httpd = http.server.ThreadingHTTPServer(("127.0.0.1", 0), handler)
    threading.Thread(target=httpd.serve_forever, daemon=True).start()
    return httpd, f"http://127.0.0.1:{httpd.server_address[1]}"


def build(allow_warnings):
    print("Building (jekyll build --future)…", flush=True)
    r = subprocess.run(["bundle", "exec", "jekyll", "build", "--future"], cwd=ROOT, capture_output=True, text=True)
    out = r.stdout + r.stderr
    if r.returncode != 0:
        print(out)
        raise SystemExit("Build failed.")
    # Jekyll's warnings, and the site's own (Description:, Thumbs:, Listing:…)
    warn = [l.strip() for l in out.splitlines()
            if re.search(r"warn|deprecat|error", l, re.I) or re.match(r"\s*(Description|Thumbs|Listing|Words?):", l)]
    for l in warn:
        print("  BUILD WARNING:", l)
    if warn and not allow_warnings:
        return [f"build: {len(warn)} warning(s)"]
    return []


def slug(path):
    return path.strip("/").replace("/", "_").replace(".html", "") or "home"


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("out", nargs="?", default="/tmp/rsow-view-check")
    ap.add_argument("--views")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--pages")
    ap.add_argument("--widths", default="1440,390")
    ap.add_argument("--full", action="store_true")
    ap.add_argument("--no-build", action="store_true")
    ap.add_argument("--no-dark", action="store_true")
    ap.add_argument("--thumbs", action="store_true")
    ap.add_argument("--allow-warnings", action="store_true")
    a = ap.parse_args()

    with open(os.path.join(ROOT, "_data", "views.yml")) as f:
        views = yaml.safe_load(f)
    if a.views:
        want = a.views.split(",")
        views = [v for v in views if v["key"] in want]
        missing = set(want) - {v["key"] for v in views}
        if missing:
            raise SystemExit(f"Not in _data/views.yml: {', '.join(sorted(missing))}")
    elif not a.all:
        views = [v for v in views if v.get("ready")]
    pages = a.pages.split(",") if a.pages else PAGES
    widths = [int(w) for w in a.widths.split(",")]

    failures = [] if a.no_build else build(a.allow_warnings)
    site = os.path.join(ROOT, "_site")
    for v in views:
        css = os.path.join(site, v["stylesheet"].lstrip("/"))
        if not os.path.exists(css):
            failures.append(f"{v['key']}: {v['stylesheet']} wasn't built")
    httpd, base = serve(site)
    os.makedirs(a.out, exist_ok=True)
    print(f"Serving _site at {base}; screenshots in {a.out}", flush=True)

    t0 = time.time()
    count = 0
    with sync_playwright() as p:
        browser = launch(p)
        for v in views:
            key = v["key"]
            themes = [None] + (["dark"] if v.get("schemes") and not a.no_dark else [])
            for theme in themes:
                for w in widths:
                    ctx = browser.new_context(viewport={"width": w, "height": 900 if w > 600 else 844})
                    ctx.route("**/*", lambda r: r.abort() if any(h in r.request.url for h in BLOCK) else r.continue_())
                    page = ctx.new_page()
                    # a clean slate: no saved design, and the theme this pass is for
                    page.goto(base + "/404.html")
                    page.evaluate("(t) => { try { localStorage.clear(); if (t) localStorage.setItem('rsow.theme', t); } catch (e) {} }", theme)
                    errors = []
                    page.on("pageerror", lambda e: errors.append(str(e).splitlines()[0]))
                    for i, path in enumerate(pages):
                        tag = f"{key}{'-' + theme if theme else ''} {w} {path}"
                        errors.clear()
                        # The first page arrives with ?view=<key> (which saves it); the rest
                        # must remember it on their own, as a visitor's next click would.
                        url = base + path + (f"?view={key}" if i == 0 else "")
                        resp = page.goto(url, wait_until="load")
                        if resp is None or resp.status >= 400 and not path.endswith("404.html"):
                            failures.append(f"{tag}: HTTP {resp.status if resp else '?'}")
                            continue
                        page.evaluate(SETTLE_JS)
                        info = page.evaluate(HOOKS_JS, key)
                        count += 1
                        problems = []
                        if info["view"] != key:
                            problems.append(f"<html data-view> is {info['view']!r}")
                        if i == 0 and "view=" in page.url:
                            problems.append("?view= wasn't taken back out of the address bar")
                        want_css = v["stylesheet"]
                        if not info["viewCss"] or info["viewCss"]["path"] != want_css:
                            problems.append(f"stylesheet is {info['viewCss'] and info['viewCss']['path']}, not {want_css}")
                        elif info["viewCss"]["rules"] <= 0:
                            problems.append(f"{want_css} didn't load")
                        others = [s for s in info["sheets"] if s.split(" ")[0] != want_css and "/assets/css/" in s and "giscus" not in s]
                        if others:
                            problems.append("other site stylesheets loaded too: " + ", ".join(others))
                        want_js = v.get("script")
                        mine = [x for x in info["scripts"] if x["path"] == want_js]
                        foreign = sorted({x["path"] for x in info["scripts"] if x["path"] != want_js})
                        if want_js and not mine:
                            problems.append(f"{want_js} isn't on the page")
                        elif want_js and not all(x["ok"] for x in mine):
                            problems.append(f"{want_js} didn't load")
                        elif len(mine) > 1:
                            problems.append(f"{want_js} is on the page {len(mine)} times")
                        if foreign:
                            problems.append("another design's script loaded: " + ", ".join(foreign))
                        if info["missing"]:
                            problems.append("missing hooks: " + ", ".join(info["missing"]))
                        if info["extras"]:
                            problems.append("Default shows view-extras: " + ", ".join(sorted(set(info["extras"]))[:5]))
                        if w <= 400 and info["scrollW"] > info["innerW"]:
                            where = page.evaluate(OVERFLOW_JS)
                            problems.append(f"scrolls sideways ({info['scrollW']}px > {info['innerW']}px): "
                                            + "; ".join(f"{sel} +{dx}px" for dx, sel in where))
                        # The picker, at the foot of the page: visible on every page;
                        # on the home page, opened and photographed.
                        btn = page.locator("#view-picker-btn")
                        if not btn.is_visible():
                            problems.append("the design picker isn't visible")
                        if errors:
                            problems.append("JavaScript errors: " + " | ".join(errors[:3]))
                        shot = os.path.join(a.out, f"{key}{'-' + theme if theme else ''}-{w}-{slug(path)}.png")
                        page.add_style_tag(content=FREEZE_CSS)
                        page.screenshot(path=shot, full_page=a.full)
                        if path == "/" and btn.is_visible():
                            btn.scroll_into_view_if_needed()
                            btn.click()
                            page.wait_for_timeout(200)
                            pk = page.evaluate(PICKER_JS)
                            if not pk["open"]:
                                problems.append("the design picker's list didn't open")
                            else:
                                if pk["left"] < 0 or pk["right"] > pk["W"] or pk["top"] < 0 or pk["bottom"] > pk["H"]:
                                    problems.append("the design picker's list runs off the screen "
                                                    f"({round(pk['left'])},{round(pk['top'])} to {round(pk['right'])},{round(pk['bottom'])} in {pk['W']}x{pk['H']})")
                                if pk["covered"]:
                                    problems.append("the design picker's list is covered or clipped")
                            page.screenshot(path=shot.replace(".png", "-picker.png"))
                            page.keyboard.press("Escape")
                            page.wait_for_timeout(100)
                            page.evaluate("() => window.scrollTo(0, 0)")
                        for pr in problems:
                            failures.append(f"{tag}: {pr}")
                        print(f"  {'FAIL' if problems else 'ok  '} {tag}", flush=True)
                    ctx.close()

        if a.thumbs:
            out_dir = os.path.join(ROOT, "assets", "images", "views")
            os.makedirs(out_dir, exist_ok=True)
            for v in views:
                ctx = browser.new_context(viewport={"width": 1440, "height": 900})
                ctx.route("**/*", lambda r: r.abort() if any(h in r.request.url for h in BLOCK) else r.continue_())
                page = ctx.new_page()
                page.goto(f"{base}/?view={v['key']}", wait_until="load")
                page.evaluate(SETTLE_JS)
                page.add_style_tag(content="*, *::before, *::after { animation: none !important; transition: none !important; }")
                page.wait_for_timeout(300)
                png = os.path.join(a.out, f"thumb-{v['key']}.png")
                page.screenshot(path=png)
                webp = os.path.join(out_dir, f"{v['key']}.webp")
                subprocess.run(["vips", "thumbnail", png, webp + "[Q=80,strip]", "720", "--height", "450"],
                               check=True, capture_output=True)
                print(f"  thumb {os.path.relpath(webp, ROOT)}", flush=True)
                small = os.path.join(out_dir, "thumbs", f"{v['key']}.webp")
                os.makedirs(os.path.dirname(small), exist_ok=True)
                subprocess.run(["vips", "thumbnail", png, small + "[Q=82,strip]", "144", "--height", "90"],
                               check=True, capture_output=True)
                print(f"  thumb {os.path.relpath(small, ROOT)}", flush=True)
                ctx.close()
        browser.close()
    httpd.shutdown()

    print(f"\n{count} page loads in {time.time() - t0:.0f}s across {len(views)} design(s): "
          + ", ".join(v["key"] for v in views))
    if failures:
        print(f"\n{len(failures)} problem(s):")
        for f in failures:
            print("  ✗", f)
        sys.exit(1)
    print("All designs pass.")


if __name__ == "__main__":
    main()
