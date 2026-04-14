---
published: true
type: post
title: A bots route to localhost
excerpt: Recently my server came under what I can only describe as an attack.  Clearly some poorly written bot was trying to slurp emails or some such and was sucking up bandwidth by repeatedly loading the same loop of pages.
layout: post
tags:
categories:
- RandomStrings
image:
ribbon:
private: false
allow_comments: true
---
Recently my server came under what I can only describe as an attack.  Clearly some poorly written bot was trying to slurp emails or some such and was sucking up bandwidth by repeatedly loading the same loop of pages.

Normally this sort of thing comes and goes and really doesn't cause much nuisance, but when they broke the 50,000 page load mark in less than 24 hours I started to get annoyed.

My initial reaction was to complain to the ISP and simply block them with a .htaccess file.    I thought about it and realized that this isn't a very good solution simply because that method still delivers to them my "Go away" page.

So I asked an admin buddy of mine what he thought I should do beyond the .htaccess or iptables.   Specifically if there was anything fun we could do back.  Something subtle that isn't a direct hack back, but rather just something to get the message across.

He came up with this;

    route add -host {incoming.annoying.bots.ip}  gw 127.0.0.1

Evidently this will route the bot directly back to itself ~ localhost.  Which just amuses the hell out of me.  What's more is, it will likely take about 5 minutes per hit for the TCP/IP layer to time out.  So it will really slow their bot down, which I'm pretty sure the rest of the internet appreciates.
