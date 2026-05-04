---
published: true
type: post
title: IE7's JSFoo sucks so badly it's painful!
description: "IE7's JavaScript engine is slower than IE6, which was already slow as hell. The event model is broken and fromElement is unreliable garbage."
excerpt: Since I work for IBM, I can't officially say that IE sucks in my code comments -- someone complained..
layout: post
tags:
categories:
- Rant
image:
ribbon:
tile_size: 1x1
tile_color: #2d88ef
private: false
allow_comments: true
---

Since I work for IBM, I can't officially say that IE sucks in my code comments -- someone complained..

But by god I can say it here... IE7's javascript engine is complete shit.  They need to scrap it completely and start over.  Firstly, It's sloooowww..  IE7's JS is slower than IE6.. which I find to be impressive as IE6 was slow as hell..

In one of my current projects we have a bunch of objects being cloned in real time to make a popup menu.  It pops up over all other divs and what not from a nested element to a child element of the body.  It's a very simple procedure;

Mouse over the icon - pop goes the menu.

We are attaching the event to fire the pop dynamically.. (Don't even get me started on the "attachEvent" command.. Can we please use addEventListener like everyone else.. )  When the even fires it is sent to a function which does the work.

All other browsers know that "this" in that function is the sender.. Not IE.  IE expressly requires you to define the sender through the function handle and then call "sender.fromElement" to get the sender.  That's retarded.  Oh but the good times don't stop there.. No no..

See it takes time to figure out who the sender is, and it will report the sender as whatever is below the mouse when it finally gets around to it.    So the fromElement could be fricken anything! Its the most unreliable crap on the planet.

Thank you very much Microsoft for this wonderful piece of crap browser.  You're an inspiration to us all.
