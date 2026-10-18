# Card thumbnails: sets post.thumb to the small WebP that _tools/make-thumbs.sh
# writes at <image dir>/thumbs/<name>.webp, so cards load ~30-60 KB instead of
# the multi-megabyte original. Falls back to the full image (with a build
# warning) when the thumbnail hasn't been made yet. site.data["default_thumb"]
# does the same for site.default_image, used by posts without an image.
require "uri"

module RSOWThumbs
  def self.thumb_for(site, image)
    return nil if image.to_s.strip.empty? || image.to_s.match?(%r{\A[a-z]+://}i)
    path = URI::DEFAULT_PARSER.unescape(image.to_s).sub(%r{\A/}, "")
    thumb = File.join(File.dirname(path), "thumbs", File.basename(path, ".*") + ".webp")
    File.exist?(File.join(site.source, thumb)) ? "/#{thumb}" : nil
  end
end

Jekyll::Hooks.register :site, :post_read do |site|
  default = site.config["default_image"]
  site.data["default_thumb"] = RSOWThumbs.thumb_for(site, default) || default
  site.posts.docs.each do |post|
    image = post.data["image"]
    next if image.to_s.strip.empty? || image.to_s.match?(%r{\A[a-z]+://}i)
    thumb = RSOWThumbs.thumb_for(site, image)
    unless thumb
      Jekyll.logger.warn "Thumbs:", "#{post.relative_path}: no thumbnail for #{image} (run _tools/make-thumbs.sh)"
    end
    post.data["thumb"] = thumb || image
  end
end
