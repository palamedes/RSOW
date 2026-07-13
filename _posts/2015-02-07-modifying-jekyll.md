---
published: true
type: post
title: "Modifying Jekyll to track my RV-10 Build Log! Sorta..."
description: "I wanted a build-log post type in Jekyll for my RV-10 project. Rewriting Jekyll wasn't going to fly, so I found a clever workaround."
excerpt:  I started writing a special custom plugin that would allow me to have a new post type but the more I got into it the more I realized it would take a massive rewrite of the entire jekyll stack to make this happen.. So I cheated.. 
layout: post
tags:
 - Ruby
 - Jekyll
categories:
 - Software
image: /assets/images/2015/02/build-log.png
gallery:
ribbon:
tile_size: 1x1
tile_color:
tile_class:
private: false
allow_comments: true
duration:
costs: 
ai_notes:
  - quote: "as my primary blogging system"
    rating: "Context"
    note: >-
      Jekyll is a static site generator written in Ruby that turns Markdown and Liquid templates into plain HTML files. It was created by GitHub co-founder Tom Preston-Werner in 2008 and remains widely used for blogs and project sites.
    sources:
      - title: "Jekyll — Simple, blog-aware, static sites (official site)"
        url: "https://jekyllrb.com/"
  - quote: "Each page is built as raw html and then pushed to the servers"
    rating: "Accurate"
    note: >-
      Accurate description of the static-site model. Jekyll renders all content ahead of time into a _site directory of static HTML, so pages are served without database queries at request time, which generally makes them fast and reduces the attack surface.
    sources:
      - title: "Jekyll Docs — Quickstart / how Jekyll works"
        url: "https://jekyllrb.com/docs/"
  - quote: "add a special post type"
    rating: "Context"
    note: >-
      Jekyll's built-in mechanism closest to a custom post type is a "collection," which lets you group related documents (like a build log) with their own output rules. Collections were introduced in Jekyll 2.0, released in 2014, roughly when this 2015 post was written.
    sources:
      - title: "Jekyll Docs — Collections"
        url: "https://jekyllrb.com/docs/collections/"
  - quote: "re-architecture/re-factor all of Jekyll"
    rating: "Context"
    note: >-
      Deep custom behavior in Jekyll is typically added through plugins such as generators and Liquid tags rather than by modifying Jekyll's core. Sites hosted on GitHub Pages build in a sandboxed "safe" mode that only allows a fixed whitelist of plugins, so unlisted custom code will not run there.
    sources:
      - title: "Jekyll Docs — Plugins"
        url: "https://jekyllrb.com/docs/plugins/"
      - title: "GitHub Docs — About GitHub Pages and Jekyll"
        url: "https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/about-github-pages-and-jekyll"
  - quote: "using all the same views as the main blog"
    rating: "FYI"
    note: >-
      Jekyll's layouts and includes are reusable across sites by copying the _layouts and _includes directories, so two separate Jekyll projects can share an identical look. The workaround of building a second site and nesting its output is a common way to reuse templates without merging the source repositories.
    sources:
      - title: "Jekyll Docs — Layouts"
        url: "https://jekyllrb.com/docs/layouts/"
  - quote: "instead of the old facebook comments"
    rating: "Background"
    note: >-
      Disqus is a third-party, JavaScript-embedded commenting service, a common choice for static sites that have no server-side backend. Comments are stored on Disqus's own servers rather than in the site's repository, so they are not part of the statically generated HTML.
    sources:
      - title: "Disqus — Wikipedia"
        url: "https://en.wikipedia.org/wiki/Disqus"
---

I love being a programmer.  It's one of those things that I truly enjoy and get a real sense of accomplish out of when I can make something work the way I want it to.

I switched to [Jekyll](http://jekyllrb.com/) as my primary blogging system a [while back](http://randomstringofwords.com/blogging-like-its-1999/) and haven't looked back.  It's been great.  Just like my early post says; Blogging like it's 1999!  Each page is built as raw html and then pushed to the servers.  Fast, secure, easy.  
   
But I wanted to add a special post type "build-log" to my blog so that I could write all about my RV-10 build experience and have it track just like any other blog, but in a different directory structure.  This would be basically a blog, within a blog.  

I started writing said plugin and it got pretty massive.  I was basically having to re-architecture/re-factor all of Jekyll to make it happen and that was just not going to fly.  It wouldn't be performant, it would have to be forward/backwards compatible and in the long run maintaining it would suck.

SO I cheated.

I simply deleted the plugin ( and the probably hundred hours I put into making it ) and started a new Jekyll blog for the build log, using all the same views as the main blog.  

I then had the build log blog output to a directory structure nested within the main blog.  This forced me to go in and move all the files down one directory once it was build but I have a script now that will do it all for me!    Ding!  I get two complete blogs within one another that are stored in different repo's and build into a single blog.  Easy!

Jekyll.. I'm still a huge fan.

Also, with this new addition to the site I have implemented [Disqus](http://disqus.com) comments instead of the old facebook comments which were a pain and not very good.