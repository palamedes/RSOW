---
published: true
type: post
title: My own custom blogging software
description: "WordPress kept getting exploited so I decided to write my own blogging and CMS software from scratch. Because that's the kind of nerd I am."
excerpt: As many of you know, I am very much my own special kind of nerd.  I enjoy doing many a'geeky thing that others wouldn't even dream of.  To be honest, I think all software engineers have to be a bit brain damaged just to do their job.
layout: post
tags:
categories:
- Software
image: /assets/images/2011/11/iframe.jpg
ribbon:
private: false
allow_comments: true
---

<a href="/assets/images/2011/11/iframe.jpg" rel="lightbox" class='pull-right fancybox'><img title="Example" src="/assets/images/2011/11/iframe-150x150.jpg" alt="Example" width="150" height="150" /><br /><span>Click for Example</span></a>

Final Update:  Okay.. I owe a huge apology to the wordpress folks..  After doing a bunch of digging this isn't a wordpress bug at all, but rather a server exploit that someone used to edit a good portion of the .php files on my site in order to inject their shitty obfuscated iframe crap.  There were files that were edited completely outside the realm of wordpress, on my server that the wordpress user didn't even have access too.. So wordpress is completely off the hook!  Sorry guys.

Now having said that I'm still planning on making my own blogging software for funsies.. but I am not feeling as much pressure now since I now know how to purge the iframes off and wordpress isn't to blame.


__Update__: Click the image to the right to see the highlighted code that got injected into the site tonight.. I have no clue how it got in there and am actively taking steps to figure it out.. it's magically there one second then a refresh shows its gone..   I have tested my codebase thoroughly and I can't find it anywhere, nor can I find it in any of the javascript that is being called..  Either way,  Please don't install or run anything that you download from my site.  Note: I'm deactivating all extra plugins for the time being until I figure out whats causing this.*

As many of you know, I am very much my own special kind of nerd.  I enjoy doing many a'geeky thing that others wouldn't even dream of.  To be honest, I think all software engineers have to be a bit brain damaged just to do their job.  Recently my own affliction has been leading me down the path of writing my own blogging and content management system.


I have used a lot of different packages over the years from full on CMS systems like Joomla and Mambo to more specific blogging solutions like Wordpress and Blogger..  They all have their good points and their bad points..  I have stuck with wordpress the longest as it most fit my need, but the more I dig into programming for wordpress the more I hate it..  I really think that wordpress needs to be rewritten from the ground up, but that's a post for a different thread..

Long story short, I have decided to begin work on my very own blogging and content management system that is fully featured and professionally developed.    My ultimate goal is to make it a fully featured suite of tools that folks can install and use for their own site that has a very low bar to entry.    It should be easy to install and work seamlessly out of the box..etc..

The main reason lately that this has become an issue is that I'm tired of having folks hack/inject code into my headers and footers.   I have done everything I know to do to harden my wordpress install, yet I am still constantly fighting random crap showing up in the various theme files on the site.

I hate it!

It's frustrating and not fun.  More over, if they have the ability to do that then they have the ability to inject all manner of malicious code..

So with that I'm going to begin designing and building something that can do all the work I need and take all the stuff already done (all of my wordpress blog) and convert it.. etc..

Gonna be a lot of work.. design will be huge, but should be good in the long run if for no other reason than something fun to do..  yes.. I see this as fun..

