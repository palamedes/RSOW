# The laser materials library keeps one spreadsheet tab per material at
# _data/laser/<material>.csv (the pages read it as site.data.laser.<material>).
# This publishes each tab as a download at /laser/<material>.csv, so the
# file on the site is always the one the pages were built from.
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
end
