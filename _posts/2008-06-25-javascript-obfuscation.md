---
published: true
type: post
title: Javascript Obfuscation
excerpt: Code obfuscators will strip out the unnecessary characters like white space, tabs, newlines and comments.. but that's not all.
layout: post
tags:
- Javascript
categories:
- Software Development
image:
ribbon:
private: false
allow_comments: true
---

Code obfuscators will strip out the unnecessary characters like white space, tabs, newlines and comments.  The modern flock of javascript obfuscators will also go through and replace every command and variable in the file with some random key that points to an array which then gets eval'd back out at run time.  Generally speaking the code you see in an obfuscated javascript file looks like completely gobbledygook which is sorta the point.

My stance on it is simple;  Don't do it -- If you ever catch me encoding or obfuscating my javascript, come kick me square in the jimmy.  I simply cannot abide by people who think they need be secretive with javascript.  And lets be completely honest here, that's what it's about.

Some folks will try to sling a steaming pile by saying it's to shrink the file size for bandwidth purposes, but that's crap -- most .jpgs on this site are larger than its javascript.  Most servers gzip everything before sending it to the client anyway so any file size benefits gained by obfuscation is nearly nil -- unless you've written war and peace in the comments of the file.

Javascript obfuscation is purely about power -- People who think they are smart and have done something they want to be noted for obfuscate their code to play the pointless and asinine game of "knowledge is power".  They yammer on about how they don't want anyone to "steal it" -- which is again a steaming pile of shash.

Obfuscation is at best like a padlock on a door -- "it keeps the honest people honest" as my father would say. if someone wants it their gonna take it. More over, javascript on some webpage SHOULD be free and open.

Most of these folks fail to realize that they themselves wouldn't be able to write the code in the first place if there wasn't a "view source" button.  Myself included -- And now you've written something you think is so awesome and innovative you need to hide it?!  Douche.

By obfuscating, all you're doing is refusing to give back to the community and saying "fuck you" to the very system that trained you to begin with.  You are stifling innovation in the industry, screwing over the little guy who doesn't know as much, and making yourself look like an ass, and generally speaking you should hang your head.

All of us are the modern day equivalent to shade tree mechanics. You wanna know how something works?  Look under the hood.  That's the beauty of the system we use. There are no secrets, and there shouldn't be.

Stop it.
