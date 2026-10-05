# frozen_string_literal: true
#
# ::highlight:: — custom inline markdown that renders a highlighter-pen swipe.
#
# Kramdown passes `::` through untouched, so the swap happens after rendering:
# `::like this::` becomes `<mark class="hl">like this</mark>`, styled in
# _sass/_base.scss. This only works because the site builds with
# `bundle exec jekyll build` in .github/workflows/deploy.yml — the stock
# github-pages gem ignores _plugins entirely.
#
# Guards, roughly in order of how much trouble they save:
#
#   * <pre>/<code>/<script>/<style> are split out before anything is rewritten,
#     so `std::cout` in a code sample is safe and a highlight can never span
#     into or across one.
#   * HTML tags pass through untouched, so `::` inside an attribute is safe.
#   * The opening `::` must be followed by a non-space, and the closing `::`
#     preceded by one. Every `::` already in the archive is a separator with a
#     space after it (`__DAY 984__ :: The evil one...`), so none of them match.
#     Write it tight: `::like this::`, never `:: like this ::`.
#   * The delimiters must sit on a word boundary, so `Foo::Bar::Baz` and
#     `std::cout` survive being written in plain prose without backticks.
#     The flip side: you can't start a highlight mid-word (`un::likely::`).
#   * A highlight can't swallow a block-level tag, so it stays within one
#     paragraph, heading, or list item.
#
module RSOW
  module Highlighter
    # Regions whose contents are never rewritten. One capture group, because
    # String#split emits every group it has and extras would corrupt the output.
    PROTECTED = %r{(<pre\b[^>]*>.*?</pre>|<code\b[^>]*>.*?</code>|<script\b[^>]*>.*?</script>|<style\b[^>]*>.*?</style>)}mi

    # Tags a highlight is not allowed to cross.
    BLOCK = %r{</?(?:p|div|h[1-6]|li|ul|ol|dl|dt|dd|table|thead|tbody|tr|td|th|blockquote|section|article|aside|header|footer|figure|figcaption|br|hr)\b}i

    MARK = %r{
      (?<tag><[^>]*>)                                  # tags pass through as-is
      |
      (?<![\w:])::(?!\s)                               # opening :: — on a word boundary, no padding space
      (?<text>(?:(?!::)(?!#{BLOCK})[\s\S])+?)
      (?<!\s)::(?![\w:])                               # closing :: — on a word boundary, no padding space
    }x

    def self.apply(html)
      return html unless html.is_a?(String) && html.include?("::")

      html.split(PROTECTED).map { |chunk|
        if chunk.nil? || chunk.empty? || chunk.match?(/\A<(?:pre|code|script|style)\b/i)
          chunk
        else
          chunk.gsub(MARK) do
            m = Regexp.last_match
            m[:tag] || %(<mark class="hl">#{m[:text]}</mark>)
          end
        end
      }.join
    end
  end
end

Jekyll::Hooks.register %i[documents pages], :post_render do |doc|
  next unless doc.output_ext == ".html"

  doc.output = RSOW::Highlighter.apply(doc.output)
end
