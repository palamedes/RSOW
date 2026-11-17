# The laser materials library keeps one spreadsheet tab per material at
# _data/laser/<material>.csv (the pages read it as site.data.laser.<material>).
#
# - Each tab is also published as a download at /laser/<material>.csv, so the
#   file on the site is always the one the pages were built from.
# - Each material (_laser/<material>.md) gets a designer at
#   /laser/<material>/designer/ (layout laser-designer).
module RSOWLaser
  class SheetFile < Jekyll::StaticFile
    def url
      "/laser/#{name}"
    end
  end

  class SheetGenerator < Jekyll::Generator
    safe true

    def generate(site)
      Dir.glob(File.join(site.source, "_data", "laser", "*.csv")).sort.each do |path|
        site.static_files << SheetFile.new(site, site.source, "_data/laser", File.basename(path))
      end
    end
  end

  class DesignerGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      collection = site.collections["laser"] or return
      collection.docs.each do |doc|
        key = doc.data["material"] || doc.basename_without_ext
        title = doc.data["title"].to_s
        page = Jekyll::PageWithoutAFile.new(site, site.source, "laser/#{key}/designer", "index.html")
        page.data.merge!(
          "layout" => "laser-designer",
          "title" => "#{title} Designer",
          "material" => key,
          "full_width" => true,
          "image" => doc.data["image"],
          "description" => "Upload a silhouette, color each area with a tested #{title.downcase} setting, and preview " \
                           "how it will look engraved. It all runs in your browser."
        )
        page.content = ""
        site.pages << page
      end
    end
  end
end
