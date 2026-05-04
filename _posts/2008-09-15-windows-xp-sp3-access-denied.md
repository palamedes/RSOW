---
published: true
type: post
title: Windows XP Sp.3 ... "Access Denied!"
description: "Windows XP SP3 won't install unless you hack the registry. Here's how to fix the Access Denied error with Microsoft's own tools."
excerpt:  "Updates are ready for your computer.  Click here to download these updates. " But don't expect Windows XP to actually know how to install them.
layout: post
tags:
categories:
- Rant
image: /assets/images/2008/09/software.png
ribbon:
private: false
allow_comments: true
---

<img class="pull-right" title="software" src="/assets/images/2008/09/software.png" alt="" width="48" height="48" />

<img title="updatesicon" src="/assets/images/2008/09/updatesicon.gif" alt="" width="21" height="18" /> "Updates are ready for your computer.  Click here to download these updates. " But don't expect Windows XP to actually know how to install them.  I'm stunned by yet another sloppy piece of work by Microsoft.  This almost smacks of an intentional ploy on their part to say "well if you just go to Vista this wont be a problem."

So, to sum up; Windows XP Service Pack 3, wont install unless you hack your into your registry.   That's the short of it.

Microsoft's official stance is to say that "some programs change the system access control lists (SACL) in the Registry so that administrator accounts cannot alter them. The service pack installer runs under the user (admin) account and not under the SYSTEM account. Failure to update a registry key causes the Setup program to fail."

Wait..  You mean Administrator isn't root?  Why does the root login for my box not have root access?!  Who's the jackass that thought that was a good idea?! 

And Microsofts official stance is that you must edit your registry.. something that if you don't do 100% correctly, you're boned.  I swear they developers at Microsoft are the biggest bunch of asshats..  I'd love to hear why this is acceptable and how this got through QA.. Someone MUST know -- Please chime in..

What's jacked up is on their website it actually says that this is for advanced users only and if you're not comfortable then here is our support link where you can pay us to help you.. (I'm paraphrasing.)

They give instructions on how to fix it, then below the instructions they say that they aren't responsible if these instructions don't work.  Awesome..  Gotta love good customer support on top of a huge snafu.

To save you the trouble, here are the steps to fix it;

* <a href="http://support.microsoft.com/kb/322756/" target="_blank">Backup your registry.</a>
* <a href="http://www.microsoft.com/downloads/details.aspx?FamilyID=e8ba3e56-d8fe-4a91-93cf-ed6985e3927b&amp;displaylang=en" target="_blank">Download Microsofts Subinacl.</a>
* <a href="/assets/images/2008/09/reset.cmd" target="_blank">Download this file and double click it.</a>
* <a href="http://support.microsoft.com/kb/322389/" target="_blank">Install Service Pack 3 from the FULL install.</a>

It works.  Step 1 is vital just in case, 2 is a microsoft tool that enables the script that is step three.  Step three is just what passes for a shell script, feel free to read it via notepad.  Also, step three takes about 10 minutes to run so go have a coke and a smile.

 I had actually been considering installing Vista just to test out DX10 on a different partition, now screw that.  Install Vista? Accept/Deny... Denied.

Game developers please.. start releasing your games for Linux..  Let's make Microsoft shape up or get the hell out of the market..
