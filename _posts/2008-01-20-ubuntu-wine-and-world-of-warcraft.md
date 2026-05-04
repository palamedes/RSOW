---
published: true
type: post
title: Ubuntu, Wine and World of Warcraft
description: "Installed Ubuntu on my game machine and got World of Warcraft running in WINE on the first try. Same frame rates as Windows or better. I'm stunned."
excerpt: I am far from a linux "fanboi", in fact until recently I didn't really use linux all that much at all..  All of my games are played in WindowsXP simply because there really is no other option... or is there?
layout: post
tags:
categories:
- Rant
- Hobbies
image: /assets/images/2008/01/ubuntulogo.png
ribbon:
private: false
allow_comments: true
---
I am far from a linux "fanboi", in fact until recently I didn't really use linux all that much at all..  All of my games are played in WindowsXP simply because there really is no other option... or is there?

I have been using linux quite a lot at work, and really like where Ubuntu is going.  Pretty much everything about it leads me to think that Microsoft should be worried.  (Apple has nothing to fear, simply because they are a hardware company..)

<img src="/assets/images/2008/01/ubuntulogo.png" alt="Ubuntu is awesome" class='pull-right' />Anyway, after having XP tell me for the umpteenth time that I had "unused icons on my desktop"..  (Yes I know.. I PUT THEM THERE..)  I decided to install Ubuntu on my game machine and try to get WoW working.  I figured I'd be in a long and protracted fight, an impossible up hill battle with a colossal fight at the end!   I couldn't have been more wrong -- but I get ahead of myself.

Getting Ubuntu installed on my game machine was cake.  I installed a new hard drive, partitioned it to have a /, a /home and a swap.. Installed Envy to get the nvidia drivers running.. and fiddled with the xorg.conf file for hours on end trying to get my dual monitors to work correctly.  That was the only part that was hard to be honest, I screwed it up a couple times.. heh.  That and I had to correct some oddity with the alsamixer being muted.. not sure what that was about.

<img src="/assets/images/2008/01/winehq_top_logo.png" alt="WINE" class='pull-left' />So with that, my game machine is now dual bootable into XP and Ubuntu.   Synergy works nicely on both installs which gets me to my email goofing off box (also ubuntu) and all the peripherals work nicely.. (er.. I haven't gotten the G15 keyboard stuff working in Ubuntu yet.. but haven't tried either)

So next, I installed WINE.  I really didn't know what to expect here, but was pleasantly surprised..  It's very simple, clean and works nicely.

Next I dragged the World of Warcraft install off my XP C: partition into the .wine directory.. and typed "wine Wow.exe" via command line..

And holy shit if World of Warcraft didn't launch first try!!  I was shocked and stunned beyond describing..  I mean I didn't expect it to work at all.. little alone the first damn try.

Now the truth is, it didn't work fully the first try.  It got to the loading in screen, got to 100% and locked up.  But a couple of config file changes later (I had to enter 3 lines into the WTF config file) it worked and I played on it for several hours.

What amuses me the most about this is that the game actually played in Linux at roughly the same frame rates as my windows XP box or HIGHER frame rates depending on what I was doing.

I have no idea how they do it, but the WINE folks are awesome..Awesome I tell ya.  Wine you're the bomb!

I don't know how it would handle a much more intense game.. Lets face it, World of Warcraft doesn't exactly push the envelope here..  So if I tried the same trick with say, Crysis... I doubt it would work.  But still I'm damn impressed.
