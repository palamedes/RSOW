# Porting a redesign onto the designs system

For the phase-2 ports of `redesign/broadsheet` and `redesign/zine` (and any
later design). Read the "Designs (views)" section of `CLAUDE.md` first.

Every page is one shared HTML; a design is one stylesheet. Your branch rewrote
the templates. Those rewrites are already merged into the shared markup as
hooks, so **your job is CSS only**: move your SCSS into your own folder and
point it at the shared hooks below.

## What you touch (and nothing else)

- `_sass/views/<key>/` (new): your partials.
- `assets/css/views/<key>.scss` (new): your one stylesheet.
- `assets/css/views/<key>-giscus.css` (Zine, optional): a comments theme.
- Your own entry in `_data/views.yml`: set `ready: true` when the check tool
  passes; add `giscus_theme:` if you made one.
- `assets/images/views/<key>/` (optional): images your CSS uses.
- `assets/images/views/<key>.webp`: the gallery shot, made by the check tool.
- `assets/js/views/<key>.js` (optional): one small script for the design,
  listed as `script:` in its views.yml entry (see below).

Don't edit the shared templates (`_layouts`, `_includes`, `index.html`,
`_pages`), the shared partials in `_sass/` (Default must not move; copy one
into your folder if you change it), `_sass/views/_*.scss`, other designs'
folders, `assets/js`, or anything in the hard-rules list in your brief. If a
hook is truly missing, stop and ask: a template change has to keep Default
pixel-identical and every design passing.

## The stylesheet

```scss
---
---
// <Name>, by Claude: one line on what it is.
@use "views/extras" with ($show: (
  ".post-dek",                        // the view-extras you show (see below)
  ".card-date .date-parts",
));
@use "views/picker";                  // picker, /views/ and skip-link structure
@use "views/<key>/base";              // your partials, in your branch's order
@use "views/<key>/layout";
@use "adventure";                     // shared ones you didn't change
// …
@use "views/<key>/views";             // picker + /views/ theme, glue
```

Inside your folder `@use "kit" as *;` (etc.) still finds your own partial
first. Only your stylesheet is ever loaded, so never scope against other
designs. Your branch's `assets/css/main.scss` lists the partials and order.

Copy from your branch (`git show redesign/<key>:_sass/_x.scss`):

- **broadsheet**: base, mixins, layout, front, post, archive, about, tags,
  ai-notes, word-notes, player, special, and its changed explain, games,
  investments, palamedes. Unchanged: adventure, scorched, paradroid, build,
  clapback (use the shared ones).
- **zine**: kit, base, bridge, layout, post, archive, about, tags, ai-notes,
  word-notes, player, clapback, and its changed explain, games, investments,
  palamedes. Unchanged: adventure, scorched, paradroid, build. Its
  `assets/css/giscus-imessage.css` edits go in `assets/css/views/zine-giscus.css`
  (the shared file stays Default's) with `giscus_theme:` in views.yml.

## View-extras

Elements with class `view-extra` are hidden (`display: none !important`)
unless your `$show` list names them. Listed ones get their natural display.
`_sass/views/_extras.scss` has the full list by template. `$show` takes any
selector, e.g. `".post-card--row .date-parts"`.

## Wrappers

Neutral wrappers that are `display: contents` in Default. Style them, or set
`display: contents` yourself to lay out their children directly:
`.hero-photo` (home portrait), `.card-figure` (card thumbnail),
`.snap` (each footer strip photo), `.post-hero-tools` (hero AI
Notes + listen), `.arc-year` / `.arc-year-list` (archive year groups),
`.colophon` (footer-main's three columns), `.photo-desk` (footer strip and
its head), `.footer-about-photo`.

## Hooks by template, with your branch's names

### Header (`_layouts/default.html`)

`.dark-header-wrap > header.site-header > .site-wrapper > .header-inner`, whose
children, in this order, are all direct (grid them with areas and `order`):

| shared | broadsheet | zine |
|---|---|---|
| `p.mast-rail-vol` (extra) "Vol. XXX · No. 302" | same | — |
| `p.mast-rail-date` (extra) short date | same | — |
| `div.mast-ear.mast-ear--left/right` (extras) | same | — |
| `a.site-title > span.site-title-short` (Default's "RSOW.com \| Home": hide it) + `span.site-title-long` (extra) `> span.site-title-line > span.stw.stw-random/-string/-of/-words` ("Words" has one span per letter) | `.site-title` text | `.zl-line` → `.site-title-line`, `.zl` → `.stw`, `.zl-random` → `.stw-random`, `.zl-string`, `.zl-of`, `.zl-words` likewise |
| `div.mast-dateline` (extra) `> .mast-dl-est/-date/-motto/-site` | same | — |
| `button#nav-toggle.nav-toggle > .nav-toggle-bars + span.nav-toggle-label` (extra, text "Menu") | `.nav-toggle-label` ("Sections": swap with `font-size:0` + `::before`, it's aria-hidden) | `.nav-toggle-word` → `.nav-toggle-label` |
| `nav#site-nav.nav-links > a[data-section]`; Etsy link has `span.nav-ext` (extra, ↗) | same; `.nav-ext` | — |
| `#resume-slot`, `.social-icons` | were in `.mast-rail-tools`: place them in the rail row instead | same |
| `#view-picker` (the picker) | new: style it | new: style it |
| `button#theme-toggle.theme-toggle` (extra; Quiet only) | hide | hide |

No `.masthead`, `.mast-rail`, `.mast-plate`, `.mast-rail-tools` wrappers:
broadsheet's rail and plate rows become grid rows of `.header-inner`.
"You are here": the nav link of the current page has `aria-current="page"`,
the section of the page you're in (a post under Blog) `aria-current="true"`;
style `[aria-current]`. Kept in step after soft navigation.

After the header, still inside `.dark-header-wrap`: `div.ticker` (extra) `>
p.ticker-label + .ticker-window > .ticker-belt > ul.ticker-track +
ul.ticker-track.ticker-copy` (zine's `zine-ticker*` → `ticker*`). Then
`a.skip-link` is before everything.

### Footer

`footer.site-footer >`
- `.photo-desk > .photo-desk-head` (extra; also `.site-wrapper`) `>
  h2.photo-desk-label + p.photo-desk-note`, then `.footer-photo-strip >
  .strip-track > span.snap > img.gallery-thumb` ×50.
- gallery modal + game modals + a script (leave them be).
- `.footer-main > .site-wrapper > .colophon >`
  `.footer-about > (.footer-about-photo > img.footer-about-img) +
  .footer-about-text + p.footer-stamp` (extra, zine's "Free / Take one /
  No. N"), then `nav.colophon-sections` and `div.colophon-note` (extras,
  broadsheet; `.colophon-rss` inside).
- `.footer-bottom > .site-wrapper > .footer-bottom-inner > p.footer-copy +
  nav.footer-links > (a.footer-views "Select a design" + a.footer-feed
  (extra, RSS)) + a.back-to-top > (span.back-to-top-text (extra) "Back to
  top " + span.back-to-top-ico ▲)`.

Zine: `.footer-about-snap` → `.footer-about-photo`; `.zine-hazard` isn't an
element, draw it as `.site-footer::before`. Order the footer's parts with
flex `order` if you need (Quiet puts `.footer-main` first).

### Home (`index.html`)

`div.home >`
- `section.home-hero > .hero-inner >` `p.fp-editor-label` (extra),
  `div.hero-photo > img.profile-image`, `div.hero-text > (h1.hero-name,
  p.hero-site-name, p.hero-tagline, a.fp-editor-more (extra))`,
  `p.hero-stamp` (extra, zine), `nav.fp-inside` (extra, broadsheet).
- `div.sub-hero` (Default's blue rule: hide it).
- `div.site-wrapper.home-body >` `.recent-posts-head > (p.fp-head-kicker
  (extra), h2.recent-posts-heading, the AI Notes explainer)`, `.post-grid`
  of cards, a script, `.view-more > (a, span.view-more-note (extra))`.

In `.post-grid`: cards with slots `post-card-wrap--lead` (1st),
`--second` (2nd), `--standard` (3rd–6th), `--brief` (7th+), plus
`div.fp-rule` (extra, before the 3rd) and `h2.fp-briefs-label` (extra, "In
Brief", before the 7th). Count cards with `:nth-child(n of
.post-card-wrap)`, not plain `:nth-child`.

| broadsheet | shared |
|---|---|
| `.front-page` / `.fp` grid | `.home` as the grid, with `.home-body` and `.post-grid` `display: contents` (give `.home` the page width) |
| `.fp-editor` | `.home-hero` (`.hero-inner` inside it) |
| `.fp-editor-photo` | `.hero-photo` |
| `.fp-head` | `.recent-posts-head` |

Zine: `.hero-mug` → `.hero-photo`; `.home-wall` → `.home-body`.

### The post card (`_includes/post-card.html`)

```
div.post-card-wrap.post-card-wrap--<slot>[data-year data-categories data-tags …]
  article.post-card.post-card--<slot>
    div.card-figure > img.card-image          (thumb WebP, lazy)
    div.card-body
      p.card-kicker                (extra: the first topic)
      div.card-meta > span.card-byline (extra) + time.card-date + button.card-listen?
      h2.card-title > a.card-link
      p.card-excerpt  (lead/second also carry span.card-excerpt-more, extra:
                       words 26–64, just before the "...")
```

Slots: home as above, `row` on /archive/, `standard` on /about/. Broadsheet's
order (kicker, title, figure, meta, excerpt): `.card-body { display: contents }`
and `order` on the parts. Zine's `.card-sticker` → `.card-kicker`. Excerpt
lengths are 25 words; use `.card-excerpt-more` and `line-clamp` for longer
or shorter. `.card-link::after` stretches over the card; keep it.

### Dates (`_includes/date.html`)

```
time.card-date > span.date-text "December 8, 2026"
               + span.date-parts (extra) > span.date-m.date-m-full "December"
                   + span.date-m.date-m-abbr "Dec" + span.date-m.date-m-ap "Dec."
                   + " " + span.date-d "8" + span.date-y ", 2026"
```

Post hero: `time.post-hero-date`, its `.date-text` is "Dec 8, 2026". Recent
Posts cards: `time.card-date`. For Broadsheet's AP dates: show
`.date-parts`, hide `.date-text, .date-m-full, .date-m-abbr`; your old
`.date-m` rules then apply to the AP month alone.

### Post (`_layouts/post.html`)

```
div.post > header.post-hero > div.post-hero-bg (hide) + div.post-hero-inner >
  div.post-hero-text >
    div.post-hero-cats > a + span.post-hero-cat-sep (extra, " & ") …
    h1.post-hero-title          (plain text, no inner span)
    p.post-dek                  (extra: the post's description)
    div.post-hero-meta > span.post-hero-author > (span.post-hero-by (extra)
        "By " + "Jason Ellis"), span.post-hero-dot, time.post-hero-date,
        span.post-hero-dot, span.post-hero-read, [span.post-hero-dot,
        span.post-hero-listen-note "🎧 31 min listen"],
        div.post-hero-tools > div.post-actions.post-actions--hero (extra:
          the hero AI Notes toggle) + div.post-listen-group
  figure.post-hero-art (extra) > span.post-hero-print > img.post-hero-img
      (the lead image again; + figcaption.post-body-cap if captioned)
div.post-wrap > article.post-article > div.post-content >
    div.post-actions (the in-article AI Notes toggle) + the lead image
    (figure.post-body-figure when captioned, else a bare img.post-body-img)
    + the post + aside.ai-notes-about
  footer.post-tags > .post-tags-row > span.post-tags-label + a … with
    span.post-tags-sep (extra, ", ") between
  … ai notes / word notes / section.post-comments > (h2.post-comments-head,
    p.post-comments-sub: extras "Letters to the Editor") + giscus
section.recent-posts > .recent-posts-header (h3 + "See All") +
  .recent-posts-grid > a.post-card (one link each) > img.card-image +
    div.card-body > (p.card-kicker (extra), time.card-date, h2.card-title,
    p.card-excerpt)
```

- **AI Notes**: two toggles; show one. Broadsheet: show
  `.post-actions--hero`, hide `.post-content > .post-actions`. Zine (sticker
  on the article): the reverse is Default's, so nothing to do.
  `ai-notes.js` drives both.
- **Broadsheet**: `.post-deck` → `.post-dek`, `.post-hero-byline` →
  `.post-hero-author` (with `.post-hero-by`), `.post-hero-tools` is the same.
- **Zine**: `.post-hero-mins` → `.post-hero-read`. The title's black
  highlighter boxes: make `h1.post-hero-title` itself `display: inline` with
  `box-decoration-break: clone` (there's no inner span). The hero image:
  show `.post-hero-art`, hide `.post-content > .post-body-img` and
  `.post-content > .post-body-figure`. The "🎧" is part of the listen
  note's text (Quiet hides it with `::first-letter`).
- Recent Posts cards are single links (no listen chip), unlike Zine's
  branch: style `.recent-posts .post-card`.

### Archive (`_pages/archive.html`, `_includes/archive-hero.html`)

`#archive-grid.post-grid.arc-list > div.arc-year[data-year] >
(h2.arc-year-label (extra) > span "2026") + div.arc-year-list > cards (slot
row)`. The script hides a year whose cards are all hidden (inline style).
Broadsheet's flat `h2.arc-year` → `.arc-year-label`. Set your batch sizes
with `#arc { --arc-initial: 16; --arc-batch: 8; }` (Default's numbers).
Broadsheet's eyebrow "The Morgue · …" isn't in the markup: `.arc-eyebrow::before`.

### Scripted bits that read your CSS

- Waveform colours: set `--wave-lit` (played; vary it for `.is-human` /
  `.is-error`), `--wave-loaded`, `--wave-rest` on `.rsow-player`. Broadsheet
  used `#f5f1e6` / `#ef4b54` and `rgba(245,241,230,.38)` / `.2`; Zine
  `#ffe600` / `#ff4a4a`.
- Card narration tooltip: `--tip-place: center` on `.card-tip` centres it on
  the chip (and sets `--tip-arrow` for the arrow); otherwise it pins right.
- Archive batches: `--arc-initial`, `--arc-batch` (above).

## The picker and /views/

Style `#view-picker` (`.view-picker-btn` with `.view-picker-ico`,
`.view-picker-label` "Design", `.view-picker-caret`; `.view-picker-menu >
.view-picker-head + ul.view-picker-list > li > a.view-picker-item(.is-current) >
img.view-picker-shot + .view-picker-text > .view-picker-name +
.view-picker-check`, then `a.view-picker-more`; designs carry no "by"
credit anywhere) so it
belongs to your design, and on phones put it in the menu panel (see
`_sass/views/_default.scss` and `_sass/views/quiet/_views.scss`). Theme the
shared structure with `--vp-font`, `--vp-ink`, `--vp-muted`, `--vp-bg`,
`--vp-line`, `--vp-hover`, `--vp-accent`, `--vp-radius`, `--vp-shadow`.
/views/ is `article.page > div.vg > (div.vg-intro, ul.vg-list > li.vg-item
(.is-current) > a.vg-shot > img + div.vg-body > (.vg-current, h2.vg-name,
.vg-swatches, p.vg-desc, p.vg-links > a.vg-try))`.

## A design's own script (optional)

A design may ship one small vanilla JS file: `assets/js/views/<key>.js`,
named in its views.yml entry as `script: /assets/js/views/<key>.js`. The
loader in `<head>` writes it as `<script id="view-js" src="…?v=<build>"
defer>` only while that design is active, so Default and the others never
load it (the check tool fails if a design's script is missing, or if any
page loads another design's). Rules:

- Progressive enhancement only. Without it every page shows all its content
  and works; style the un-scripted state first, then let the script add a
  class (on `<html>`, say) for what it changes.
- It runs once per real page load. The narration player's soft navigation
  replaces `main.site-content` and then dispatches `rsow:navigated` on
  `document`: redo whatever you did inside `<main>`, and don't duplicate
  what lives outside it (the header, the footer).
- Reuse the shared behaviour rather than replacing it (the nav toggle, the
  picker): click the existing buttons or listen to them.
- No third-party code, no storage beyond sessionStorage (localStorage only
  through the design preference), and respect `prefers-reduced-motion`.

## Text that differs from your branch

The shared HTML keeps Default's words where designs disagreed: "About Me",
"Blog", "Recent Posts" / "See All", "Topic" / "Tags", "Menu". Live with it,
or swap decoration-only text with CSS `content`. Put a design-only flourish
(a colophon line, a stamp) in CSS `content`, not in markup.

## Checking

```
uv run --quiet _tools/view-check.py --views <key> --all     # while ready: false
uv run --quiet _tools/view-check.py                          # every ready design
uv run --quiet _tools/view-check.py --thumbs                 # remake gallery shots
```

Then compare your screenshots with your branch's (build it in a scratch
worktree) at 1440 and 390, light pages and the special ones (games,
investments, explain, /build/), set `ready: true`, rerun the check for every
design, and make the gallery shot.
