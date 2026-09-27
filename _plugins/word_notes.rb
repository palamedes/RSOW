# Word notes: build-time warnings for the squiggly-underline word cards.
#
# A post lists its words in front matter (`words: [ultramafic, bokeh]`); each
# key needs a curated entry at _data/glossary/<key>.yml, and an entry's
# `figure:` needs assets/images/words/<figure>.svg. A missing piece doesn't
# break the build (the word just isn't underlined), so say so here instead of
# letting it fail silently. Whether each word actually appears somewhere it
# can be underlined is checked by `uv run _tools/word-notes.py check`.
Jekyll::Hooks.register :site, :post_read do |site|
  glossary = site.data["glossary"] || {}

  site.posts.docs.each do |post|
    Array(post.data["words"]).each do |key|
      entry = glossary[key.to_s]
      if !entry.is_a?(Hash)
        Jekyll.logger.warn "Word notes:", "#{post.relative_path} lists \"#{key}\" but _data/glossary/#{key}.yml doesn't exist"
      elsif entry["definition"].to_s.strip.empty?
        Jekyll.logger.warn "Word notes:", "_data/glossary/#{key}.yml has no definition"
      end
    end
  end

  glossary.each do |key, entry|
    next unless entry.is_a?(Hash) && entry["figure"]
    figure = File.join(site.source, "assets", "images", "words", "#{entry['figure']}.svg")
    next if File.exist?(figure)
    Jekyll.logger.warn "Word notes:", "_data/glossary/#{key}.yml wants a figure, but assets/images/words/#{entry['figure']}.svg is missing"
  end
end
