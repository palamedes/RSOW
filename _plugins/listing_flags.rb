# Where a post gets listed: two front matter switches, both true by default.
#
#   index: false     leave it off the home page's "Most Recent Blog Posts"
#   archive: false   leave it out of the blog archive (/archive/) and the
#                    category and tag pages
#
# Either way the post itself still builds and its link still works. The archive
# side is a `where_exp` in _pages/archive.html and _layouts/archive.html. The
# home page is paginated by jekyll-paginate-v2, which already skips any post
# marked `hidden`, so `index: false` just sets that before the paginator runs
# (this hook fires after reading, before any generator).
Jekyll::Hooks.register :site, :post_read do |site|
  site.posts.docs.each do |post|
    %w[index archive].each do |key|
      next unless post.data.key?(key)
      value = post.data[key]
      next if value == true || value == false
      Jekyll.logger.warn "Listing:", "#{post.relative_path} has `#{key}: #{value}`; use true or false (it's being treated as true)"
    end
    post.data["hidden"] = true if post.data["index"] == false
  end
end
