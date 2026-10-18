#!/usr/bin/env bash
# Card thumbnails: a small WebP next to every post image, at
# <image dir>/thumbs/<name>.webp. Post cards (homepage, archive, "more posts"
# on each post) load these instead of the full image, which can be several
# megabytes; the full image is still used on the post itself and for social
# share previews. _plugins/thumbs.rb picks them up and warns about any post
# whose thumbnail is missing.
#
#   _tools/make-thumbs.sh            # make any missing or out-of-date thumbs
#   _tools/make-thumbs.sh --force    # remake them all
#
# Needs libvips (`vips`). Run it after adding a post image, then commit the
# new .webp along with the post.
set -euo pipefail
cd "$(dirname "$0")/.."

WIDTH=720     # cards are ~360px wide; 2x for high-density screens
QUALITY=72
force=${1:-}

# every image a post uses, plus the fallback for posts without one
{
  grep -h '^image:' _posts/*.md | sed -E 's/^image:[[:space:]]*//; s/^"//; s/"$//'
  grep -E '^default_image:' _config.yml | sed -E 's/^default_image:[[:space:]]*//'
} | sed 's#^/##; s#%20# #g' | grep -E '\.(png|jpe?g|gif|webp)$' -i | sort -u |
while read -r src; do
  [ -f "$src" ] || { echo "missing image: $src" >&2; continue; }
  dir=$(dirname "$src"); name=$(basename "${src%.*}")
  out="$dir/thumbs/$name.webp"
  if [ "$force" = "--force" ] || [ ! -f "$out" ] || [ "$src" -nt "$out" ]; then
    mkdir -p "$dir/thumbs"
    vips thumbnail "$src" "$out[Q=$QUALITY,strip]" "$WIDTH" --size down
    echo "made $out ($(du -h "$out" | cut -f1))"
  fi
done

# The footer photo strip (every page): 150px tall, so 300px WebPs. Clicking
# one still opens the full-size original.
for src in assets/images/gallery/gallery-*.*; do
  case "$src" in *.webp) continue ;; esac
  name=$(basename "${src%.*}")
  out="assets/images/gallery/thumbs/$name.webp"
  if [ "$force" = "--force" ] || [ ! -f "$out" ] || [ "$src" -nt "$out" ]; then
    mkdir -p assets/images/gallery/thumbs
    vips thumbnail "$src" "$out[Q=$QUALITY,strip]" 2000 --height 300 --size down
    echo "made $out ($(du -h "$out" | cut -f1))"
  fi
done
