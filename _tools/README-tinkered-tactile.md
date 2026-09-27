# Tinkered Tactile — how the site works

The maker-shop site at **/tinkered-tactile/**. It's part of this Jekyll repo but
shares nothing with RSOW's look: its own layout, fonts, styles and script.

| What | Where |
|---|---|
| Pages | `tinkered-tactile/` (home, for-sale, work, what-we-make, custom-projects, for-businesses, about) |
| Pieces of work | `_tt_work/*.md` — one file per piece ("things we can make") |
| Things for sale | `_tt_inventory/*.md` — one file per item actually for sale |
| Settings & shared copy | `_data/tt.yml` (contact, socials, form, analytics, nav, categories, materials, placeholder photos) |
| Image list (generated) | `_data/tt_images.yml` — never edit by hand |
| Templates | `_layouts/tt.html`, `_layouts/tt-work.html`, `_includes/tt/` |
| Styles / script | `_sass/tt/`, `assets/tinkered-tactile/css/tt.scss`, `assets/tinkered-tactile/js/tt.js` |
| Images | `assets/tinkered-tactile/img/` (generated), `assets/tinkered-tactile/brand/` (logo, icons, social card) |
| Full-size originals | `_tt_originals/` — git-ignored, stays on this machine |

## Add a piece of work

1. **Crop the photo** so the piece fills the frame (any tool).
2. **Process it:**

   ```sh
   _tools/tt-image.sh ~/Downloads/new-thing.jpg new-thing
   ```

   That writes AVIF + WebP at up to four widths plus one JPEG fallback, strips
   all metadata (GPS included), and updates `_data/tt_images.yml`. Keep the
   full-size original in `_tt_originals/` if you might re-crop later.
3. **Describe it** in `_tt_work/new-thing.md` (the file name becomes the URL:
   `/tinkered-tactile/work/new-thing/`). Copy an existing piece and change it:

   ```yaml
   ---
   title: New Thing
   seo_title: "What someone would type into Google"   # page <title>
   description: "One or two sentences. Used on cards and for search."
   caption: "The short line under the picture in galleries."
   order: 140               # gallery position (lower = earlier)
   tile: square             # square | tall | wide | big — its shape in the gallery
   focus: "50% 40%"         # optional: which part of the photo to keep when cropped
   featured: false          # true = eligible for "More things we can make"
   buckets: [woodwork]      # personalized | home-bar | woodwork | business
   filters: [woodwork, gifts]   # laser-engraved woodwork coasters signs maps business gifts custom
   labels: [Wood, Hand turned]  # the little tags that appear on hover
   offering: personalize    # ready | personalize | custom (the three ways to buy)
   personalizable: true
   materials: "Walnut"
   process: "Hand turned"
   dimensions: ""           # leave out if you don't know
   customization: "What people can change."
   price: ""                # e.g. "$40 for a set of four" — blank shows nothing
   starting_price: ""       # e.g. "From $120"
   lead_time: ""            # e.g. "About two weeks"
   care: ""                 # e.g. "Hand wash only."
   cta: "I want one like this"  # the button; it opens the form pre-filled
   form_category: Woodworking   # pre-selects this category on the form
   buy_url: ""              # an Etsy/eBay listing; adds a "Buy it" button
   images:
     - name: new-thing      # from step 2
       alt: "Describe the picture for someone who can't see it."
       kind: photo          # photo | render (AI render) | design (artwork, a design file)
       caption: ""          # optional, shown under it on the detail page
   notes: []                # optional small print (credits, disclaimers)
   ---
   The story, in plain paragraphs. Markdown works.
   ```

   Anything marked `kind: render` gets a **Render** badge and the note "that's
   an AI render; the real one sold". `kind: design` gets a **Design** badge.

4. **Check it:** `bundle exec jekyll serve`, then open
   <http://127.0.0.1:4000/tinkered-tactile/work/>. If you've changed
   `_config.yml`, restart the server first — it only reads that file at startup.

The gallery packs tiles automatically. To keep its bottom edge flush, the
cells should add up to a multiple of 4 (big = 4, wide = 2, tall = 2, square = 1).

## List something for sale

The **For Sale** page (`/tinkered-tactile/for-sale/`) shows whatever is in
`_tt_inventory/`. With nothing there it says the shelf is empty, which is the
honest thing to say. Each item is a specific thing you have, not a type of
thing (that's what `_tt_work` is for). Photos go through `tt-image.sh` like
any other; then add `_tt_inventory/<name>.md`:

```yaml
---
title: Purpleheart Pepper Mill
price: 45                # a number, in dollars: shows "$45" (12.5 shows "$12.50")
                         # or text with a $, like "$40 a set", shown as-is
price_note: ""           # optional small print under the price, e.g. "set of 4"
status: available        # available | on-hold | sold
quantity: 1              # "3 available" appears when it's more than 1
order: 10                # position on the page (lower = earlier)
buy_url: ""              # the Etsy or eBay listing: adds "Buy on Etsy" / "Buy on eBay"
work: purpleheart-pepper-mills   # optional: a _tt_work file name, for "More like this"
description: "One or two sentences."
materials: "Purpleheart, spalted maple"
dimensions: "About 8 in tall"
images:
  - name: purpleheart-mill-no-3   # from tt-image.sh
    alt: "Describe the picture."
---
```

Without a `buy_url`, the button reads "I want this one" and opens the form with
the item filled in. When it sells, either delete the file or set
`status: sold`, which moves it to a "Recently sold" section (price struck
through, with a "Want one like it?" button). Plain numeric prices are also
published as structured data, so search engines can show price and stock.

## The form (projects and questions)

`/tinkered-tactile/custom-projects/` is the only form. The nav's **Contact** and
every **Start a project** button go there. "Just a question" is one of its
categories; picking it relabels the form for a plain question. Only name,
email and message are required. Links can pre-fill it:

- `?piece=<work file name>` — "I saw the … and I want something like it."
- `?item=<for-sale file name>` — "I'm interested in the … ($45)."
- `?type=business` — picks Business / Logo
- `?type=question` — picks Just a question (the footer's "Just have a question?")

## Swap a placeholder photo

The hero, the About photos and the closing background are named under
`photos:` in `_data/tt.yml`. Process the new photo with `tt-image.sh`, put its
name there, and blank out `hero_caption` if it's a real photo that doesn't
need explaining.

## Fill in the placeholders

All in `_data/tt.yml`; blank values simply don't render.

- **`email`, `phone`, `social.*`** — appear in the footer and beside the form.
- **`shops.etsy`, `shops.ebay`** — the shop pages, for the structured data.
- **`form_endpoint`** — the form posts here. Until it's set,
  it shows "this form isn't connected yet" instead of pretending to send.
  With [Formspree](https://formspree.io): create a form, paste its endpoint
  (`https://formspree.io/f/xxxxxxx`), and turn on file uploads (a paid-plan
  feature) for the attachments. The field names (`email`, `_subject`,
  `_gotcha` honeypot) already match what Formspree expects.
- **`analytics`** — `provider: goatcounter | plausible | ga4` plus `id`.

## The domain

Canonical URLs point at `https://randomstringofwords.com/tinkered-tactile/`.
To send **tinkeredtactile.com** here, forward it (301) to that address from
the registrar or Wix's domain settings. GitHub Pages can only serve one custom
domain per repo, so a true tinkeredtactile.com site would mean moving
everything listed above into its own repo — it's self-contained for exactly
that reason.
