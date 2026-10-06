# Tags: a fixed vocabulary in _data/tags.yml, checked at build time, plus the
# numbers the tag cloud (/tags/) and the archive's tag filter are drawn from.
#
# Categories are the shelf a post sits on (one or two); tags are the specific
# subjects that connect posts across shelves (as many as fit). The vocabulary
# keeps tags from sprawling into near-duplicates ("Wood Working" next to
# "Woodworking"): a tag that isn't in _data/tags.yml still builds, but the
# build warns so it gets added there on purpose or fixed.
require "set"

Jekyll::Hooks.register :site, :post_read do |site|
  vocab = Array(site.data["tags"]).map { |t| t.is_a?(Hash) ? t["name"] : t }.compact.to_set
  site.posts.docs.each do |post|
    cats = Array(post.data["categories"])
    if cats.size > 2
      Jekyll.logger.warn "Tags:", "#{post.relative_path} has #{cats.size} categories (#{cats.join(', ')}); the limit is 2"
    end
    Array(post.data["tags"]).each do |tag|
      next if vocab.include?(tag)
      Jekyll.logger.warn "Tags:", "#{post.relative_path}: tag \"#{tag}\" isn't in _data/tags.yml (add it there, or fix the spelling)"
    end
  end
end

# site.data["tags_by_count"]: every tag on a listed post, most-used first,
#   as { name, count }. Feeds the archive's tag dropdown.
# site.data["tag_cloud"]: the same tags in center-out order (the biggest in
#   the middle, then alternating outward), each with a font size, a weight
#   from 0 to 1 and a small deterministic nudge, so the cloud reads as a
#   jumble rather than a sorted list. Sizes follow the square root of the
#   count, so one huge tag doesn't flatten everything else to the minimum.
#
# Posts marked `archive: false` (_plugins/listing_flags.rb) don't count.
class RSOWTagCloud < Jekyll::Generator
  safe true
  priority :low

  MIN_REM = 0.85
  MAX_REM = 3.1

  def generate(site)
    counts = Hash.new(0)
    site.posts.docs.each do |post|
      next if post.data["archive"] == false
      Array(post.data["tags"]).uniq.each { |tag| counts[tag] += 1 }
    end

    by_count = counts.sort_by { |tag, n| [-n, tag.downcase] }
    site.data["tags_by_count"] = by_count.map { |tag, n| { "name" => tag, "count" => n } }

    max = by_count.first ? by_count.first[1].to_f : 1.0
    min = by_count.last ? by_count.last[1].to_f : 1.0
    sized = by_count.map do |tag, n|
      weight = max > min ? Math.sqrt((n - min) / (max - min)) : 1.0
      seed = tag.bytes.sum
      {
        "name"   => tag,
        "count"  => n,
        "weight" => weight.round(3),
        "size"   => (MIN_REM + weight * (MAX_REM - MIN_REM)).round(2),
        "tier"   => (weight * 4).ceil.clamp(1, 4),
        "nudge"  => (seed % 9) - 4,
      }
    end

    cloud = []
    sized.each_with_index { |entry, i| i.even? ? cloud.push(entry) : cloud.unshift(entry) }
    site.data["tag_cloud"] = cloud
  end
end
