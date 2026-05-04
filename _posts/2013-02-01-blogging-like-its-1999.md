---
published: true
type: post
title: Blogging like its 1999!
excerpt: I have officially adopted Jekyll as my blogging solution, holy crap.. I love it.
layout: post
tags:
- Ruby
categories:
- Software
image: /assets/images/2013/01/jekyll.png
gallery:
ribbon:
private: false
allow_comments: true
---

I have been working on and off on the new personal blogging solution that I wanted to use as a replacement for wordpress for quite some time now and not really making a lot of headway just due to the scope of the project I had set for myself..   It was a pretty tall undertaking to begin with and I was doing it in a language that I had just learned..  A bit of a lofty goal to be honest..  Doable, but the motivation wasn't really there..

I didn't really feel any pressing issue as wordpress was working just fine -- but then I really thought about it and I realized that WP wasn't working just fine for me.. infact, I had pretty much stopped using it entirely due to its various issues and my particular feelings about it.  I was no longer updating my blog at all and that was starting to go against the grain..

To be frank, I was tired of the design and the lack of flexibility, it's bloat, it's poor performance and it's constant security issues..  I think WP is a fine solution if you have no technical chops and I think its place on the web has been thoroughly earned, but for me I just didn't want to have to fight with it any more.

I wanted to write some stuff for it and I've been working exclusively in Ruby for the past year and a half, so I was not really interested in working on something written in PHP, a language that now officially considers me an apostate.

I also noticed that every damn time I logged in there were new hacks or exploits injected into it that hadn't been there previously..  My server is hardened yet people still manage to find ways to exploit WP to put their crap in my blog..  So I was tired of it constantly getting exploited and having to fight that fight was very draining only disincentivized me even more.

I examined what I was trying to do with my blog and started to shop around for ruby solutions;  Enter Jekyll.

Jekyll is "a simple, blog aware, static site generator" that's written entirely in Ruby that allows me to write my blog entries in simple markdown and export the whole thing using Git to deploy.

I was putting a lot of time, effort and code into a blogging solution that was basically a replacement for wordpress, but it solved all the same problems in exactly the same way -- just in a different language..  That doesn't make sense and it was a bad idea from the start..

Also one of the directions I was going was to have it so that my dynamic blogging solution would output git pages statically..  Well, why do I need the dynamic blog at all then?!

The best part is, I can just host it on Github itself, or Amazone S3 for pennies.  And all the files are static, so there is no blog to hack.  There is no back end code to exploit.  Oh and if you do manage to break it or wipe it out, I just redeploy.  Done.

Really it is the best solution out there for this and I'm very excited about using it.

