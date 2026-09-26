# Tinkered Tactile — how the site works

The maker-shop site at **/tinkered-tactile/**. It's part of this Jekyll repo but
shares nothing with RSOW's look: its own layout, fonts, styles and script.

| What | Where |
|---|---|
| Pages | `tinkered-tactile/` (home, work, what-we-make, custom-projects, for-businesses, about, contact) |
| Pieces of work | `_tt_work/*.md` — one file per piece |
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
   <http://127.0.0.1:4000/tinkered-tactile/work/>.

The gallery packs tiles automatically. To keep its bottom edge flush, the
cells should add up to a multiple of 4 (big = 4, wide = 2, tall = 2, square = 1).

## Swap a placeholder photo

The hero, the About photos and the closing background are named under
`photos:` in `_data/tt.yml`. Process the new photo with `tt-image.sh`, put its
name there, and blank out `hero_caption` if it's a real photo that doesn't
need explaining.

## Fill in the placeholders

All in `_data/tt.yml`; blank values simply don't render.

- **`email`, `phone`, `social.*`** — appear in the footer and on the Contact page.
- **`shops.etsy`, `shops.ebay`** — the shop pages, for the structured data.
- **`form_endpoint`** — the project and contact forms post here. Until it's set,
  they show "this form isn't connected yet" instead of pretending to send.
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
