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

# Clouds for tags and topics (categories), computed once per build:
#
# site.data["tags_by_count"] / ["topics_by_count"]: every tag / category on a
#   listed post, most-used first, as { name, count }. Feed the archive's
#   dropdowns and the header stats.
# site.data["tag_cloud"] / ["topic_cloud"]: the same in center-out order (the
#   biggest in the middle, then alternating outward), each with a font size, a
#   weight from 0 to 1, a tier for color and a small deterministic nudge, so
#   the cloud reads as a jumble rather than a sorted list. Sizes follow the
#   square root of the count, so one huge entry doesn't flatten everything
#   else to the minimum.
#
# Posts marked `archive: false` (_plugins/listing_flags.rb) don't count.
class RSOWTagCloud < Jekyll::Generator
  safe true
  priority :low

  MIN_REM = 0.85
  MAX_REM = 3.1

  def generate(site)
    listed = site.posts.docs.reject { |post| post.data["archive"] == false }
    { "tag" => "tags", "topic" => "categories" }.each do |kind, field|
      counts = Hash.new(0)
      listed.each { |post| Array(post.data[field]).uniq.each { |v| counts[v] += 1 } }
      by_count = counts.sort_by { |name, n| [-n, name.downcase] }
      site.data["#{kind}s_by_count"] = by_count.map { |name, n| { "name" => name, "count" => n } }
      site.data["#{kind}_cloud"] = cloud(by_count)
    end
  end

  private

  def cloud(by_count)
    max = by_count.first ? by_count.first[1].to_f : 1.0
    min = by_count.last ? by_count.last[1].to_f : 1.0
    sized = by_count.map do |name, n|
      weight = max > min ? Math.sqrt((n - min) / (max - min)) : 1.0
      {
        "name"   => name,
        "count"  => n,
        "weight" => weight.round(3),
        "size"   => (MIN_REM + weight * (MAX_REM - MIN_REM)).round(2),
        "tier"   => (weight * 4).ceil.clamp(1, 4),
        "nudge"  => (name.bytes.sum % 9) - 4,
      }
    end
    out = []
    sized.each_with_index { |entry, i| i.even? ? out.push(entry) : out.unshift(entry) }
    out
  end
end
