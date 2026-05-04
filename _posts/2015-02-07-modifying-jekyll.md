---
published: true
type: post
title: "Modifying Jekyll to track my RV-10 Build Log! Sorta..."
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