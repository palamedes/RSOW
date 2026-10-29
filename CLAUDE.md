# Random String of Words: working notes

Jekyll site for randomstringofwords.com. These are rules the build depends on
for search (SEO) and page speed. The build warns when one is broken; treat a
warning as something to fix before pushing.

## Every new post (and any new page)

- **`description:` is 155 characters or fewer.** Google cuts search snippets
  off at about 155, often right before the point. Write a complete sentence or
  two in the post's own voice, not a truncation. The build warns
  (`Description:`) about any over the limit (`_plugins/description_length.rb`).
- **Make the card thumbnail.** After adding the post's `image:`, run
  `_tools/make-thumbs.sh` and commit the new
  `<image dir>/thumbs/<name>.webp` with the post. Cards on the homepage, the
  archive and under each post load this ~30 KB WebP instead of the
  multi-megabyte original. Without it the card falls back to the full image and
  the build warns (`Thumbs:`) (`_plugins/thumbs.rb`). The full-size image stays
  as the post's header and its social share preview.

## Structured data

Every page's author is `site.author` in `_config.yml` (Jason Ellis, pointing at
/about/), and `site.social.links` are his profiles. jekyll-seo-tag puts both
into the schema.org data; /about/ carries the full Person (ProfilePage).

## Links

Link text says where it goes ("More about me", "View all posts"), never a bare
"Read more" or "click here". Lighthouse flags those.

## Designs (views)

Visitors can switch the whole site between designs, after the CSS Zen
Garden: **one HTML, many stylesheets**. `_data/views.yml` lists them (key,
name, stylesheet, Google Fonts URL, swatches, `schemes` for a
light/dark toggle, `ready`). The inline loader in `_layouts/default.html`
`<head>` picks the design before first paint (`?view=<key>`, else the saved
choice, else Default) and writes only that design's fonts and stylesheet.
The header's "Design" menu (`_includes/view-picker.html`) and `/views/`
(`_pages/views.html`) list the ready ones; both read `views.yml`.

- **One HTML.** Templates never branch on the design. A design changes only
  its own CSS (and images it brings): `assets/css/views/<key>.scss` built from
  `_sass/views/<key>/`. Default is `assets/css/main.scss` (its partials:
  `_sass/views/_default-look.scss`) and must not move when a template changes.
- **`view-extra`.** Markup only some designs use carries `class="view-extra
  …"` and is hidden everywhere except in a design that lists it in its
  `$show` (`@use "views/extras" with ($show: (".post-dek", …))`; the full
  list is in `_sass/views/_extras.scss`). Neutral wrappers (`.hero-photo`,
  `.card-figure`, `.post-hero-tools`, …) are `display: contents` in Default.
  Add an extra only when CSS (`::before` content, `order`, grid) can't do it,
  and keep Default's visible text in one text node (splitting it moves
  pixels).
- **Adding a design.** Add its `views.yml` entry (`ready: false` while you
  work; `?view=<key>` previews it), create `assets/css/views/<key>.scss`
  (`@use "views/extras" with ($show: …)`, `@use "views/picker"`, then either
  your own partials plus any shared ones from `_sass/`, or
  `@use "views/default-look"` and your changes on top), style the picker and
  `/views/` (the `--vp-*` properties), then flip `ready: true` and run
  `uv run --quiet _tools/view-check.py --thumbs` for its gallery shot and the picker's small one.
  `_sass/views/PORTING.md` maps every hook.
- **Check every design before pushing any template or design change:**
  `uv run --quiet _tools/view-check.py` builds, loads the key pages in each
  ready design at 1440 and 390 px (and dark), and fails on sideways scroll at
  390, a missing script hook, the wrong stylesheet, a JS error, or Default
  showing an extra. Screenshots land in `/tmp/rsow-view-check`.
