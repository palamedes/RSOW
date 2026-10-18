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
