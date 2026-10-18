# Meta descriptions: Google cuts search snippets off at about 155 characters,
# so every page's `description:` must be 155 or fewer (see
# CLAUDE.md). The build warns about any that run long.
DESCRIPTION_LIMIT = 155

Jekyll::Hooks.register :site, :post_read do |site|
  (site.pages + site.documents).each do |item|
    desc = item.data["description"].to_s.strip
    next if desc.length <= DESCRIPTION_LIMIT
    Jekyll.logger.warn "Description:", "#{item.relative_path} is #{desc.length} characters; keep it to #{DESCRIPTION_LIMIT}"
  end
end
