---
published: true
type: post
title: Delphi like IDE/VCL for Javascript, written in javascript
excerpt: So something that I have been pondering is the creation of a rapid application framework/IDE similar to Delphi for javascript, in javascript..  Bear with me.. 
layout: post
tags:
- jQuery
categories:
- Software Development
image:
ribbon:
private: false
allow_comments: true
---

So something that I have been pondering is the creation of a rapid application framework/IDE similar to Delphi for javascript, in javascript..  Bear with me..  This is more or less theoretical conjecture at this point, but it amuses me and I wonder what kind of value there would be to be had from such a platform.

Where Delphi has always excelled, even to this day, is where its IDE and it's VCL meet -- you design the look of the application first, and then slap code in behind it second.   Not the other way around.   Users are given a "form" on which they can drag components from the visual component library.   The VCL is a vast palette of components and elements really allowing you to make your program look however you want..   Afterward positioning everything and making the program look "correct" you go into each component and add the various bits needed to make them do what you want.  

When it comes to rapid application development, Delphi is king.   It beats VB, VC and Java hands down for easy of program design.  This is my opinion of course and largely an opinion based on my experiences with it years ago.   I don't use it any more but I know a lot of folks still do and it's doing fairly well..  I also see a lot of elements of Delphi's innovated IDE in other IDE's out there.. (*cough*Eclipse*cough*)

So my thought is.. How useful would that be for javascript?  This fits in nicely with a project I'm doing at work in that some of the same concepts are there..    You have a framework in the background that all this rests on (lets call it a desktop), then on top of that you have delphi like "forms" (lets call them viewlets) which are nothing more than a window framework container.  Each viewlet would have components that would be pulled from a common component library that you have positioned how you see fit and now have working how you want.

With jQuery it would be fairly simple to allow for any kind of function definitions; from onclicks to mouseovers.. Custom code would be simple and all of that could easily be serialized into a simple object definition that would be easy to store remotely..

You would need a "component inspector" like object that allowed you to edit and change things within a viewlet but once that's done you simply disable the component inspector and you're off to the races..

There are a lot of good javascript frameworks but they all come at this problem from the other direction.. More over there aren't any drag and drop Delphi like application creation tools out there for javascript and certainly not any written entirely in javascript..

For work I am creating a whole new system and I was thinking of how I could keep it easy enough that third party developers could design and create their own viewlets for our system.. That's when this whole thing plonked itself into my head..   If you designed it from the onset to be a system that could be entirely dynamically done then it would take very little programming on the part of the third party creator to get something new.. They don't even need to know the framework because they could simply drag and drop the components they want onto a form (I have a hard time calling it a viewlet) then you'd have drop down boxes in the component inspector to attach information to that component..

At that point its just a matter of making your components sophisticated enough to provide the functionality you want..  The other nice thing is your shop goes from being application developers to simply being component developers..  If the framework works, you simply need to continue to develop better and better components..  You aren't rewriting the wheel each time you want to make a change..

There would need to be some back end code in place to handle the storage of user generated forms, but all HTML, CSS, JPGS, and Components as well as the window framework and desktop are already written.  They don't change. 

From a support standpoint it would be nice to give your support folks a way to pop-up some kind of component inspector widget that would allow you to browse components and forms on the fly.. etc.. 

I dunno.. its one of those things I was pondering.. I know I wont be allowed to do this for work but it amuses me..
