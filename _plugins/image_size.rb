# `{{ page.image | image_size }}` → [width, height] for a local image, or nil.
#
# jekyll-seo-tag emits og:image but not its dimensions. Facebook only puts the
# picture on the first share of a URL when og:image:width and og:image:height
# are present; without them it measures the image in the background and the
# first card goes out without one. Reads the size straight from the PNG, GIF,
# or JPEG header so no image gem is needed.
module Jekyll
  module ImageSize
    CACHE = {}

    def image_size(path)
      path = path["path"] if path.is_a?(Hash)
      path = path.to_s
      return nil if path.empty? || path.match?(%r{\A[a-z][a-z0-9+.-]*://}i)

      site = @context.registers[:site]
      file = File.join(site.source, path.sub(%r{\A/}, "").split(/[?#]/).first.to_s)
      return nil unless File.file?(file)

      key = [file, File.mtime(file).to_i]
      CACHE.key?(key) ? CACHE[key] : (CACHE[key] = ImageSize.read(file))
    end

    def self.read(file)
      File.open(file, "rb") do |f|
        head = f.read(26).to_s
        if head.start_with?("\x89PNG\r\n\x1a\n".b)
          head[16, 8].unpack("NN")
        elsif head.start_with?("GIF8")
          head[6, 4].unpack("vv")
        elsif head.start_with?("\xFF\xD8".b)
          f.seek(2)
          jpeg(f)
        end
      end
    rescue StandardError
      nil
    end

    # Walk the JPEG markers until a start-of-frame, which carries the size.
    def self.jpeg(f)
      loop do
        return nil unless f.read(1)&.ord == 0xFF
        code = f.read(1)&.ord
        code = f.read(1)&.ord while code == 0xFF # fill bytes
        return nil if code.nil? || code == 0xD9 || code == 0xDA # EOI / scan data
        next if code == 0x01 || (0xD0..0xD8).cover?(code)       # no length field

        len = f.read(2).unpack1("n")
        if (0xC0..0xCF).cover?(code) && ![0xC4, 0xC8, 0xCC].include?(code)
          height, width = f.read(5).unpack("Cnn").drop(1)
          return [width, height]
        end
        f.seek(len - 2, IO::SEEK_CUR)
      end
    end
  end
end

Liquid::Template.register_filter(Jekyll::ImageSize)
