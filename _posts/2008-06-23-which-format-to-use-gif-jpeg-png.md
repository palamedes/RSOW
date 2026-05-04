---
published: true
type: post
title: Which format to use; Gif, Jpeg, Png
description: "When to use GIF, JPEG, or PNG in web design. Use PNG for small graphics, JPEG for photos, and GIF only for animations."
excerpt: I was asked today what my professional opinion was with regards to which graphical format to use in web design.  I pondered it a bit and it occurred to me that this was a very misleading question, and showed an error in thinking.
layout: post
tags:
categories:
- Software
image: /assets/images/2008/06/pngdemo.png
ribbon:
private: false
allow_comments: true
---

<img class="pull-right" title="pngdemo" src="/assets/images/2008/06/pngdemo.png" alt="" width="150" height="150" />

I was asked today what my professional opinion was with regards to which graphical format to use in web design.  I pondered it a bit and it occurred to me that this was a very misleading question, and showed an error in thinking.  Of the three commonly used formats none of them are "correct" and all three of them have their place in web design.  This is very much a "use the correct format, for the correct job."

Of the three image types commonly used on the web today (GIF, PNG and JPEG) usually the argument comes in the form of people agreeing that JPEG has one use; and either GIF or PNG has the other use. The religious war begins when folks try to argue the merits of GIF versus PNG.  And usually it comes in the form of arguing PNG's new hotness and it's lack of support by Microsoft against GIF as the old standard that may not have as many features but at least its supported.

Lets examine each format;

__Graphics Interchange Format__, or GIF is an 8 bit format that was introduced by CompuServe back in the late 80's. It's one of the first 2 image formats used on the world wide web and continues to be one of the big three formats used through out the web.  GIF images are compressed using the Lempel-Ziv-Welch (LZW) lossless data compression technique and as of 1989 and the GIF89a format can store multiple images in a single stream.  The GIF format uses a palette of up to 256 distinct colors from the 24-bit RGB color space.

__Portable Network Graphics__, or PNG was created in the mid 90's and was created with the intention of improving upon and replacing the GIF format.  The PNG brings to the table the ability to have an alpha channel transparency which gives us a much wider range of transparency options.   The PNG also gives us a much wider range of color depths than GIF (truecolor up to 48-bit compared to 8-bit 245-color), which allows for greater color precision and smoother fades..etc..  In just about every way the PNG is superior to the GIF, save one.  PNG's do not support storing multiple images in a single file.

__Joint Photographic Experts Group__, or JPEG was a group who got together and issued a graphical standard (of the same name) back in the early 90's.  It's commonly used for compressing photographic images and allows for an adjustable degree of compression.  This adjustment gives the user a tradeoff between storage size and image quality.

__In my opinion__,  any more for your small graphics I'd use PNG.  PNG's are far superior to GIF's in that they can achieve greater compression, have a "cleaner" compression algorithm, have wider range of color, more transparency options, and are very easy to work with.

The PNG's major down fall was it's lack of full support from Microsoft -- hell they used to crash IE4..  However, as of IE7 support is native (with full alpha transparency) and once IE6 hits its end of life (which I personally think needed to happen back in August of 2001) there really is only one reason to use a GIF and that's for animations.  (Though in all likelihood you'll see an influx of browsers supporting MNGs natively in the near future which is the PNG extension that supports animations.)

For any large color intense image (photographs) use a JPEG.

It really is that simple..

If you're aiming for IE6 and absolutely need to use a transparent PNG you can use various IE PNG fixs JS hacks to make them work -- though what a pain.  If you don't need the transparency just use a GIF.
