# The laser materials library keeps one spreadsheet tab per material at
# _data/laser/<material>.csv (the pages read it as site.data.laser.<material>).
#
# - Each tab is also published as a download at /laser/<material>.csv, so the
#   file on the site is always the one the pages were built from.
# - Each material (_laser/<material>.md) gets a designer at
#   /laser/<material>/designer/ (layout laser-designer).
# - A material with validated colors gets a LightBurn material library at
#   /laser/<material>-validated-colors.clb, built from its `validated` list.
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

  # LightBurn's Material Library format (.clb), as in fiber libraries
  # LightBurn writes: LightBurnLibrary > Material > Entry > CutSetting.
  # Each validated color is an entry with no thickness, grouped under the
  # "Validated colors" title (NoThickTitle), named after the color. The
  # CutSetting fields match a project's: frequency in Hz, QPulseWidth in
  # ns, interval in mm.
  class LibraryGenerator < Jekyll::Generator
    safe true
    priority :low

    def generate(site)
      collection = site.collections["laser"] or return
      collection.docs.each do |doc|
        validated = Array(doc.data["validated"])
        next if validated.empty?
        key = doc.data["material"] || doc.basename_without_ext
        page = Jekyll::PageWithoutAFile.new(site, site.source, "laser", "#{key}-validated-colors.clb")
        page.data.merge!("layout" => nil, "sitemap" => false)
        page.content = library_xml(doc.data["title"].to_s, validated)
        site.pages << page
      end
    end

    private

    def esc(text)
      text.to_s.gsub("&", "&amp;").gsub("<", "&lt;").gsub(">", "&gt;").gsub('"', "&quot;")
    end

    def num(value)
      f = value.to_f
      f == f.round ? f.round.to_s : f.round(4).to_s
    end

    def library_xml(material, validated)
      group = "Validated colors"
      out = +%(<?xml version="1.0" encoding="UTF-8"?>\n)
      out << %(<LightBurnLibrary DisplayName="#{esc(material)} validated colors">\n)
      out << %(    <Material name="#{esc(material)}">\n)
      validated.each do |v|
        k = v.is_a?(Hash) ? v["key"] : v.to_s
        name = v.is_a?(Hash) && v["name"] ? v["name"] : k
        power, speed, freq, qpulse, interval, passes = k.to_s.split("|")
        out << %(        <Entry Thickness="-1.0000" Desc="#{esc(name)}" NoThickTitle="#{esc(group)}">\n)
        out << %(            <CutSetting type="Scan">\n)
        out << %(                <index Value="0"/>\n)
        out << %(                <name Value=""/>\n)
        out << %(                <LinkPath Value="#{esc(material)}/#{esc(group)}/#{esc(name)}"/>\n)
        out << %(                <minPower Value="#{num(power)}"/>\n)
        out << %(                <maxPower Value="#{num(power)}"/>\n)
        out << %(                <maxPower2 Value="#{num(power)}"/>\n)
        out << %(                <speed Value="#{num(speed)}"/>\n)
        out << %(                <frequency Value="#{(freq.to_f * 1000).round}"/>\n)
        out << %(                <QPulseWidth Value="#{num(qpulse)}"/>\n)
        out << %(                <numPasses Value="#{[passes.to_i, 1].max}"/>\n)
        out << %(                <interval Value="#{num(interval)}"/>\n)
        out << %(                <priority Value="0"/>\n)
        out << %(            </CutSetting>\n)
        out << %(        </Entry>\n)
      end
      out << %(    </Material>\n</LightBurnLibrary>\n)
      out
    end
  end
end
