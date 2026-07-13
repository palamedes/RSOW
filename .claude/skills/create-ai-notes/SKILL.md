---
name: create-ai-notes
description: >-
  Generate distributed, sourced, factual "AI Notes" for a blog post on this
  Jekyll site. Adds an `ai_notes:` block to the post's front matter, which the
  post layout renders as toggleable inline annotations (a "Click for AI Notes"
  button, yellow bubbles anchored to phrases, and a footer disclaimer). Use
  whenever the user wants to create / add / generate AI notes or fact-context
  annotations for a post.
---

# Create AI Notes for a post

AI Notes are short, **factual, sourced** annotations that a reader can toggle on
per post. They add context to specific claims and moments in the writing — they
are **not** rebuttals, opinions, or the author's words. The article is never
modified; notes live in front matter and anchor to a verbatim phrase.

## The feature (already built — don't rebuild it)

- `_layouts/post.html` — renders the "Click for AI Notes" toolbar button and the
  "About AI Notes" footer disclaimer automatically for any post that has an
  `ai_notes:` key. Also `{% include ai-notes.html %}`.
- `_includes/ai-notes.html` — emits the notes as JSON + loads the JS.
- `assets/js/ai-notes.js` — on toggle, finds each anchor phrase, highlights it,
  and injects a numbered yellow bubble after that paragraph.
- `_sass/_ai-notes.scss` — styling.

Your only job in this skill is to **write good `ai_notes:` front matter** for the
target post and verify the anchors resolve. Do not touch the prose or the plumbing.

## Steps

1. **Resolve the target post.** Use the path/slug the user gives. If none, list
   recent `_posts/*.md` and ask which one (or use the most recent if they say so).
   Read the full post body.

2. **Plan for DISTRIBUTION (this is the point).** Notes must be sprinkled across
   the *entire* article, not clumped:
   - Walk the post section by section (by `##` headings, else by thirds). Put at
     least one note in the opening, several through the middle, and at least one
     near the end.
   - Aim for roughly **one note per 150–250 words** (typically 5–10 notes; scale
     with length). **Max one note per paragraph** (rare exception for a very long
     list paragraph).
   - **Annotate narrative too**, not just argumentative claims. When the author
     tells a story or names a person, place, date, war, law, book, show, or
     statistic, a note can add neutral context (who/what/when, an origin, a
     figure, a definition, a common correction). Storytelling passages are fair
     game — that's how notes stay spread across the whole piece.

3. **Write each note.**
   - `quote` — a **verbatim substring copied from the body**, ~3–10 words, that
     appears **exactly once**. It must be **plain text**: do not let it cross
     markdown emphasis (`*...*`, `_..._`), and avoid `--`/`---` (en/em dash) and
     `...` (ellipsis), which Kramdown rewrites into single characters of a
     different length and will break the anchor. Apostrophes and quotes are FINE —
     the JS normalizes Kramdown's curly quotes back to straight before matching.
   - `note` — **1–3 sentences, ≤ ~55 words. Factual and neutral.** Add verifiable
     context: dates, numbers, definitions, origins, corrections. **Never** state
     an opinion, take the author's side, or argue against them. If a claim is
     accurate, it's fine to lead with "Accurate —" then add context; if it's a
     common misconception, state the correction plainly. Aim for a mix: some
     notes add context the author omitted, some confirm/contextualize. Don't let
     every note lean the same direction.
   - `rating` (optional but encouraged) — a short verdict pill that rides far
     right on the note's header. **Rate the author's assertion as written** — the
     pill sits next to the author's sentence, so it must answer "is what the
     author is claiming here accurate?" **Never rate the strawman, the opposing
     view, or a negated form of the claim** — that inverts the color and makes the
     AI look like it's calling the author wrong when the note actually agrees with
     them. (Example: on "pretending every civilization was a peaceful drum circle,"
     the author is asserting it was *not* peaceful; a note confirming pre-contact
     warfare rates **True**, not False.) If the note merely adds a fact and isn't
     judging a claim, use a blue informational label instead. Use the taxonomy
     below; anything unrecognized shows neutral grey, so stick to these:
     - Green — `True`, `Accurate`
     - Light green — `Mostly True`
     - Amber — `Needs Context`, `Partly True`, `Mixed`
     - Orange — `Misleading`
     - Red — `False`, `Mostly False`
     - Blue (not a verdict, just added info) — `Random Fact`, `Context`,
       `Background`, `FYI`
     Prefer a blue informational label when the note simply adds a fact rather
     than judging a claim's truth.
   - `sources` — 1–2 **real, reputable, stable** sources (government archives,
     official records, encyclopaedias, primary documents). **Verify facts and
     capture real URLs with WebSearch/WebFetch — never invent a URL.** Prefer
     primary/authoritative sources (National Archives, State Dept Office of the
     Historian, Library of Congress, UNESCO, Britannica, court opinions).

4. **Format as YAML** using folded block scalars (`>-`) so you don't have to
   escape apostrophes or quotes inside the note text:

   ```yaml
   ai_notes:
     - quote: "verbatim phrase from the body"
       rating: "True"          # optional; see taxonomy above (or "Random Fact")
       note: >-
         One to three factual sentences of neutral context, with a date or
         number where possible.
       sources:
         - title: "National Archives — Document Name (Year)"
           url: "https://www.archives.gov/…"
   ```

   Insert/merge this `ai_notes:` key into the post's front matter (create it if
   absent; if it exists, add notes while keeping the distribution balanced).
   **Do not edit the article body.**

5. **Verify.** Run `bundle exec jekyll build`, then confirm every `quote` appears
   **exactly once in the prose**. Note the phrase is also embedded once in the
   notes JSON blob, so a naive whole-page grep prints **2**. Strip that blob first:

   ```bash
   POST=_site/post/<slug>/index.html
   awk '/id="ai-notes-data"/{skip=1} skip&&/<\/script>/{skip=0;next} !skip' "$POST" > /tmp/prose.html
   # each of these should print 1
   grep -cF "verbatim phrase from the body" /tmp/prose.html
   ```

   Prose count `1` = good. `0` = the anchor didn't match (Kramdown rewrote a
   character like `--`/`...`/quotes, or the phrase crosses `*emphasis*`) — revise
   it. `2+` = not unique — lengthen the phrase. Rebuild and report which matched.

6. **Remind the user** the notes are AI-generated and unvetted (the site's footer
   disclaimer already says so): they should click each source link before relying
   on it, and fix or drop any note whose source doesn't hold up.

## Notes

- Serve locally to eyeball it: `bundle exec jekyll serve --host 0.0.0.0 --port 4000`
  then open the post and click **Click for AI Notes**.
- `sleep` is blocked in this environment; wait on the server with a Monitor
  until-loop, not `sleep`.
