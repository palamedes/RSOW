---
published: true
type: post
title: Big5 to UTF-8 on Chinese Windows
excerpt: Microsoft has yet again been a source of pain for me.. And let me say that I find it amusing that English windows does unicode better than Chinese windows.. How is that even possible?!
layout: post
tags:
categories:
- Software Development
image:
ribbon:
tile_size: 1x1
tile_color: #2d88ef
private: false
allow_comments: true
---

Microsoft has yet again been a source of pain for me.. And let me say that I find it amusing that English windows does unicode better than Chinese windows.. How is that even possible?!

We are in the process of internationalizing our product, and we stumbled across this bizarre issue where a person in Taiwan on a Chinese windows machine couldn't enter simplified Chinese into our product.  Doing so would give unpredictable results.

So, I picked 5 random simplified Chinese characters that sat across the character set;

? - 5355 (16) / E5 8D 95 (8)
? - 7684 (16) / E7 9A 84 (8)
? - 7B80 (16) / E7 AE 80 (8)
? - 6C49 (16) / E6 B1 89 (8)
? - 5B57 (16) / E5 AD 97 (8)

These 5 characters are spread nicely across the <a target="_blank" href="http://www.unicode.org/cgi-bin/UnihanRadicalIndex.pl?strokes=4&useutf8=false">Radical-stroke index</a> and all have commonality to one another across UTF-16/UTF-8 and bits.

So, after much rigmarole I secured myself an account on the box and began to test it, and sure enough these 5 Chinese characters (?????) have proven to me that internationalization stinks.. heh  Depending on the order in which they are placed, random ones would show up..  Rearrange them, double them, spaces between.. whatever.. Always different ones would show.

But ONLY on the Chinese version of windows.  Locally using our own boxes, it works great. No worries. But over there, strangeness. After much ado and testing both locally and in Taiwan it appears that the Chinese version of windows tries to concatenate the bits of each symbol and make them into a single letter due to them being in a certain order.

In other words, it's trying to say that X number of characters after the first one are combining characters.  Where X = a random number of them.  And it appears completely random.. No amount of byte/bit/hex/dec whatever seems to pan out to the reason this is happening.

Something that you'd think the people in Taiwan would know about and maybe give us a clue to -- naw..  So now we have to figure out how to make it work correctly.. *sigh*

Pain I tell ya..  Clearly there is a solution.. I mean other people have crossed this bridge..  Though after digging into this it's interesting how many different applications aren't UTF-8 compliant at all.  Linux does this at the OS level, windows doesn't.  The results seem to be that the majority of the software in the windows world thus doesn't correctly support it.

heh the bug tracking tool we use here at work doesn't either, which I find amusing.  Do you know how hard it is to talk about Chinese characters in a tool that wont let you write any?!

More as we fight through this.. we haven't solved it yet.. it should be interesting to say the least..
