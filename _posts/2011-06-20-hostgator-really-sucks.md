---
published: true
type: post
title: Hostgator Really Sucks...
excerpt: I have moved my hosting off Hostgator because frankly, they suck.   My site was suffering repeated down times, crashes, database disconnects, SSH daemon crashes/hangups, ..etc..
layout: post
tags:
categories:
- Rant
image: /assets/images/2011/06/hostgator_sucks.jpg
ribbon:
private: false
allow_comments: true
---

<img class="pull-right" title="Hostgator Sucks" src="/assets/images/2011/06/hostgator_sucks.jpg" alt="Hostgator Sucks" width="198" height="306" />

I have moved my hosting off Hostgator because frankly, they suck.   My site was suffering repeated down times, crashes, database disconnects, SSH daemon crashes/hangups, ..etc..

The big pisser for me though was the SSH restricted access that they had given me, combined with the more recent downtime..

For whatever reason I'd try to SSH into my account and it would fail acting as if there was no SSH daemon running..  I'd have to contact them via their live chat system, wait in queue forever for some support monkey to help me, only to have them either tell me that;  A) nothings wrong.  B) I don't have an account with them or best of all C) "Oh yeah we changed the SSH port to ### now.. use that.. "

Seriously?  You just up and changed the SSH port?  Why?!  It's been 22 for ever.. Now suddenly its 2222? ... WHY?!

Apparently their support team is filled with more assholes than a donkey in an iron maiden..

Okay that probably wasn't fair, but it was funny =)..  But I mean seriously, If I can't SSH/SCP into my box then there is a serious issue here..  They also have it setup apparently so that you can't have more than 2 SSH connections at a time, and each time you SCP a file to/from the box it creates a new connection, thus that's the reason for the failure of the third connection attempt and the reason you have to wait for 3 minutes for those connections to time out.  (Or so their tech support drone said.. )  What a crock of shit..

And when I did finally manage to SSH in they had me stuck in a jail shell so I can't do dick anyway.. I just wanted to use screen people.. that's all!!

It wasn't so bad 2 years ago when I first got the account, but it's been getting worse and recently my site was down for nearly 48 hours.. Done.. Stick a fork in me..

I'm kicking them to the curb..  Their shit stinks and if they continue they are going to be hurting for business..

__EDIT__:  Okay so I did talk to them at length over the phone about the service I was getting and they didn't make a lot of excuses or try to be shady about it, but rather owned up to the issues and apologized.    While I am unhappy with their service, I am impressed at how they handled the whole thing..  They were very professional and courteous..   So with that I'm still moving on, but I am willing to give them the benefit of the doubt and say that they are still a good company, if maybe just not the right ones for me.*
