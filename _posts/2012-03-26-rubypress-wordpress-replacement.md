---
layout: post
title: RubyPress Wordpress Replacement
description: "Building my own open-source WordPress replacement in Ruby on Rails. PHP had its run, time to move on to something better."
tags:
- Ruby
- Ruby on Rails
- WordPress
categories:
- Software
excerpt: So a while back I had thought my WordPress install was getting exploited through some bug and decided I wanted to write my own replacement...
published: true
type: post
image: /assets/images/2012/03/rubypress01-150x150.jpg
gallery:
ribbon: ruby
allow_comments: true
private: false
---
<a href="/assets/images/2012/03/rubypress01.jpg" rel="lightbox" class='pull-right fancybox'><img title="RubyPress" src="/assets/images/2012/03/rubypress01-150x150.jpg" alt="RubyPress" width="150" height="150" /><br /><span>RubyPress</span></a>

So a while back I had thought my WordPress install was getting exploited through some bug and decided I wanted to write my own replacement.. Turns out that bug had nothing to do with WordPress but was rather an issue with my host.. It's been resolved, but that niggling desire to [create my own blogging software](/my-own-custom-blogging-software/ "My own custom blogging software") stuck..

This is something I wanted to create from the ground up that would be a 100% "my own" solution to include even the look&amp;feel theme of the thing and I decided that it would also be 100% open source from the start.

I wanted to use this project as a possible way to expand my horizons but I also wanted something functional that I could use and expand on quickly;  the more I thought (and still think) about this the sooner I wanted off WordPress, not because WordPress is a bad thing (it's not) but because I wanted something that was fully mine that I could modify to my heart's content.

So with that, I moved forward with my project and started looking at which language I wanted to write it in.   After some consideration I decided to limit myself to writing the code in Python, Ruby, Node, or PHP.

I knew from the get-go that I didn't really want to write this thing in PHP.   PHP is a great language but it's getting a little long in the tooth and frankly some of the frameworks out there leave a lot to be desired.   Plus I have been writing PHP since '96 or so.. I'm ready to move on..

<a href="/assets/images/2012/03/rubypress02.jpg" rel="lightbox" class='pull-left fancybox'><img title="RubyPress Admin" src="/assets/images/2012/03/rubypress02-150x150.jpg" alt="RubyPress Admin" width="150" height="150" /><br /><span>RubyPress Admin</span></a>

So with my original intent in mind I decided to branch out and try NodeJS as I really like JavaScript and I think node is fairly clever.  I played with node for a couple of weeks even making an initial start on the blogging software and while I do believe Node is pretty cool, I just don't think it's "quite there" yet.  I think node has a little bit of growing to do before it's fully matured, which isn't to take away from it at all but rather just my opinion on its current state.  For whatever reason, node didn't excite me.

This left me in a bit of a pickle;  Suddenly my language options went to Python, Ruby or back to PHP.   At the time I knew nothing about Python or Ruby compared to my PHP knowledge.

I had to do some serious considering here and what I ultimately came back to was one simple fact;  PHP and the myriad of MVC frameworks I've worked with (Zend, Kohana, Cake, Symfony etc...) as well as Python and it's MVC frameworks (Django's really the only one I have any experience with) all do their damnedest to do what Rails is doing.

Rails does all the big stuff right out of the box and then you have the whole Gem library thing... dear god.. RoR seems awesome.. okay lets give that a try!  I've never so much as cracked a book on Ruby before so this will be a 100% new thing for me.. *shrug* why not?!  Off to the races I went.

Side note:  I found that [Lynda.com](http://www.lynda.com/) has some nice beginner intro courses on Ruby and Rails and of course Ryan Bates at [Railscasts.com](http://railscasts.com/) has lots of good video information for the watching.. both are totally worth checking out..

Now set the "not so" way-forward machine to 10 days later:    I've been working on it for 10 days or so, on and off, and in that amount of time I have created a system that allows me to import content directly from WordPress and display it on the site as seen in the screenshot above using my new theme.    I can create users, posts, pages, messages, have a functional (if sparse yet) admin area that forces authentication etc..  and they all work!

So, in 10 days using a language and framework I don't know and have never used before,  using plugins and modules I don't know and have never used before, even a brand new IDE..  etc..  I have managed to implement the core functionality of WordPress..    Holy crap, Ruby and Rails are easy as hell..   Seriously this stuff writes itself..  (I'm using [Twitter Bootstrap](http://twitter.github.com/bootstrap/) and [Devise](https://github.com/plataformatec/devise) which I think are both brilliant and likely will be using CanCan and a few other gems as I need them. )

I'm jokingly calling this project "RubyPress", more as a codename than a real product name since it's now become a Ruby blogging software to replace WordPress..

I have no idea if it will grow beyond my getting the basic blogging functionality working.. I still have a lot of stuff that are requirements like categories, tags, theme support..etc..  Lots and lots to do.. but I'm really enjoying it, and learning Rails at the same time.. so win win..   There is still a lot of "magic" to Ruby for me, stuff that I'm not sure how or why it works the way it does..etc.. but slowly I'm getting it..  I'm sure this thing will require a dozen rewrites before it's not embarrassing.. heh  What can I say.. I'm a Ruby and Rails noob.. bear with me..

Though I have to admin, it's coming together so quickly that I do entertain the notion of having something that might one day actually compete with WordPress.. WordPress itself has been around since 2003 and has a lot of very cool functionality that I doubt I'll ever match in my little toy project, but wouldn't it be fun?  =D

It is 100% open source; [https://github.com/palamedes/Press](https://github.com/palamedes/Press)

I will keep working on it and eventually have something worth using I hope..  For now I'm still on WordPress..
