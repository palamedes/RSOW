---
published: true
type: post
title: jQuery Lightbox
description: "Building my own lightbox plugin with jQuery. Any link with rel=\"lightbox\" opens a proper overlay -- and it was shockingly easy."
excerpt: I have been playing with the javascript library jQuery for a couple days now.. My intent is to learn the ins and out's of it for a project at work.  So far I like what I am seeing.
layout: post
tags:
categories:
- Software
image: /assets/images/2009/03/rocky-mountains-poster.jpg
ribbon:
private: false
allow_comments: true
---

<a rel="lightbox" href="/assets/images/2009/03/rocky-mountains-poster.jpg" class='pull-right'><img title="rocky-mountains-poster" src="/assets/images/2009/03/rocky-mountains-poster-150x150.jpg" alt="Lightbox Test" width="150" height="150" /><br /><span>Lightbox Test Image</span></a>

I have been playing with the javascript library jQuery for a couple days now.. My intent is to learn the ins and out's of it for a project at work.  So far I like what I am seeing.

I need to learn a "best practices" as there are many ways to do things in jQuery and I am very likely going about some of it incorrectly..  But, there is only one way to try things and that's to jump off the deep end!  So far it's cake..  Something I have wanted for my site for a while now was a lightbox implementation.  And while Wordpress has quite a few lightbox like plugins, I thought it would be interesting to create my own using jQuery such that ANY link (on any website) with an attribute of rel="lightbox" would be opened as a lightbox.  This is the file I'm actively developing on;

<pre id="line13"><span class="attribute-value">http://rsow.com/files/jquery.lightbox.js</span></pre>

And the image above will be my lightbox test image for the time being.  Clicking the image will close the lightbox.

So far so good!  The lightbox appears to be working nicely.  Clicking the image correctly pulls the "shade" (the darker background) and opens a white background over the shade with a "loading" gif.  It then loads the image into memory.   Once the image is loaded, it then resizes the white background to the size of the image, and displays the image in the place of the loading image.

<a rel="lightbox" href="/assets/images/2009/03/wideimage.jpg" class='pull-right'><img title="wideimage" src="/assets/images/2009/03/wideimage-150x150.jpg" alt="Large Wide Image" width="150" height="150" /><br /><span>Large Wide Image</span></a>

You most likely wont ever see the loading GIF unless you're loading a very large image like the one to the left.  But that brought up a different problem.  What if the image is larger than the screen?

The lightbox will now automatically size the image to fit your screen upon load. If you resize your desktop while the lightbox is displaying it wont adjust itself yet.

At this point the only real pain is remembering to add rel="lightbox" to your anchors.  I'm sure there is a way to get Wordpress to play nice with that regard.. not sure yet.  Also my goal was to make it so that the only thing you would need would be to add jQuery and my jQuery.lightbox files to your site and you're good to go. Unfortunately I forgot about the loading graphic.. so you'll want that gif too..  And it will need to live at /assets/images/loading.gif   You can use any you like, so long as it's there and it isn't too large.

<img title="Loading" src="/assets/images/loading.gif" alt="Loading GIF" width="48" height="47" class='pull-left' />

Feel free to use mine..

I want to add some more features to this thing.. I dunno how crazy I'll get though.  Comments would be nice on an image by image basis, but not sure how to go about that.  Either I can try to embed the comments in the page in some hidden way and then have jQuery pull them or I could try loading them from a similarily named file that resides next to the image?  I dunno.

I also like the idea of creating other forms of pop-ups / lightbox styles through the use of the rel attribute.  If you use "lightbox" it does what it does now, but if you use "lightbox_zoom" (or something) it does something else..   I already have other ideas but I dunno how crazy I want to get.

Right now this system has no way to do groups either.. this is purely a singleton solution right now.  I'd like to add more features but for now it's where its at.  I'm a little stunned at how easy it was to create to be honest.  This bodes very well for jQuery.
