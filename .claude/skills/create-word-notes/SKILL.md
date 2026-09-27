---
name: create-word-notes
description: >-
  Add "word notes" to a blog post on this Jekyll site: curated hover cards for
  uncommon words and jargon (squiggly gold underline; hover, focus or tap shows
  the word, pronunciation, a plain-English definition, an optional little
  diagram and the origin). Picks the words, writes the shared
  _data/glossary/<key>.yml entries and lists them in the post's `words:` front
  matter. Use for every new post before its branch is pushed, when backfilling
  older posts, or whenever the user asks to define, explain or add vocabulary,
  glossary or "word of the day" cards to a post.
---

# Create word notes for a post

Word notes are for "the common man": a reader who follows the news but isn't a
specialist. Uncommon words get a squiggly gold underline, and hovering,
focusing or tapping one opens a small yellow card. The article text is never
edited; the post only lists which words to mark.

## The feature (already built — don't rebuild it)

- `_data/glossary/<key>.yml` — one curated entry per word, **shared by every
  post that uses it**. One file per word, so post branches don't collide.
- Post front matter `words: [key, key, ...]` — which entries this post uses.
- `_includes/word-notes.html` (from `_layouts/post.html`) → JSON →
  `assets/js/word-notes.js`, which marks each word's first usable occurrence and
  runs the card. Styles: `_sass/_word-notes.scss`.
- `assets/images/words/<figure>.svg` — optional diagrams for the card.
- `_plugins/word_notes.rb` — the build warns about missing entries or figures.
- `_tools/word-notes.py` — `candidates`, `check`, `unused` (run with `uv run`,
  which installs wordfreq and PyYAML on the fly).

## Steps

1. **Resolve the post** from the path/slug the user gives (else the post being
   worked on) and read all of it, front matter included.

2. **Nominate.** `uv run --quiet _tools/word-notes.py candidates _posts/<file>.md`
   lists single words rarer than Zipf 3.0 (once per million words) with where
   they appear. It is only a starting point: it flags plenty of words everyone
   knows, and it can't see multi-word jargon, so also read for terms like
   "depth of field", "value-added tax" or "pull request".

3. **Choose, with judgment.** Pick what a news-reading non-specialist would have
   to look up or only half-knows:
   - technical and scientific terms, and medical, legal, financial, political or
     tech jargon;
   - Latin and foreign phrases, and acronyms most readers can't expand;
   - everyday words used in a specialist sense ("engagement" on social media).

   Leave out:
   - proper nouns: people, places, brands, organizations, named laws or studies
     (that's AI Notes territory);
   - profanity and slang;
   - words most adults know even though they're rare in print (speedometer,
     cheeseburger, hemorrhoids, megapixel);
   - terms the post defines in the same sentence, unless they're central.

   Aim for roughly one per 400–600 words, favoring terms that matter to the
   argument. Zero is fine; never pad.

4. **Reuse before writing.** `ls _data/glossary/`. If the word already has an
   entry **in the same sense**, just list its key. If the sense differs, make a
   sense-specific key (`equity-dei`, `engagement-social-media`) so each card
   stays true for every post that uses it.

5. **Write the entry** at `_data/glossary/<key>.yml` (kebab-case key):

   ```yaml
   word: ultramafic              # headword as shown on the card
   say: ul-truh-MAF-ik           # respelling, stressed syllable in CAPS
   pos: adjective                # noun, verb, adjective, noun phrase, abbreviation...
   topic: geology                # geology chemistry physics biology medicine law economics
                                 # politics history technology photography language
                                 # psychology military philosophy general
   definition: >-
     One or two plain sentences, at most ~45 words, in the sense the post uses.
   origin: >-                    # optional: short, certain and interesting, or leave it out
     ultra- ("beyond") + mafic, coined in 1912 from magnesium and ferric (iron).
   forms: [ultramafic]           # optional: spellings to match; plural -s/-es is automatic.
                                 # Default is `word`. List irregular forms (fiduciaries).
   figure: ultramafic            # optional: assets/images/words/ultramafic.svg
   figure_alt: >-                # required with a figure
     What the diagram shows, in a sentence.
   ```

   - Neutral, plain and accurate. Match the post's sense. On contested political
     terms, describe how the term is used rather than taking a side.
   - Verify any number or technical claim with WebSearch/WebFetch. If sources
     disagree, say only what they agree on.
   - Keep `origin` only if you're sure of it.

6. **Figures, sparingly.** Draw one only when a picture explains the term better
   than words: a scale, a curve, a size comparison or a cross-section. Rules:
   - SVG with a 304-wide viewBox, height at most ~110.
   - Fonts `Nunito Sans, Arial, Helvetica, sans-serif`, no text under 9px.
   - Fixed colors that read on the card's pale yellow panel (`#fffdf3`).
   - Say only what sources agree on (see ultramafic.svg, which marks only the
     45% line).

   Check it by eye:
   `rsvg-convert -w 912 assets/images/words/<f>.svg -b '#fffdf3' -o /tmp/f.png`

7. **List the keys** in the post's front matter: `words: [ultramafic, peridotite]`.
   Order doesn't matter.

8. **Verify.**

   ```bash
   bundle exec jekyll build --future        # --future: new posts are usually dated ahead
   uv run --quiet _tools/word-notes.py check _posts/<file>.md
   ```

   Every word should print with the snippet where its underline lands.

   If a word "won't be underlined", all its occurrences are in excluded places:
   headings, links, code, captions, asides, or inside an AI Note's `quote`
   phrase. Fix it by listing a form that appears elsewhere, shortening that AI
   Note's quote, or dropping the word.

   To eyeball it, run `bundle exec jekyll serve --future`, open the post and
   hover a word.

9. **Report** the words you added (and any you reused), and remind the user the
   definitions are AI-written: worth a skim before merging.

## Part of finishing every new post

Before a new post's branch is pushed, it gets word notes (this skill). It also
gets AI Notes if the user wants them (`create-ai-notes`). If both are added, run
the word-notes `check` after the AI Notes, since a new AI Note quote can push
an underline to a later occurrence or off the page.
