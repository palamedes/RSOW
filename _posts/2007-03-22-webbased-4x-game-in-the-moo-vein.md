---
published: true
type: post
title: Webbased 4X game in the MoO vein
description: "Design notes for a browser-based multiplayer 4X space game in the style of Master of Orion. Thinking out loud about turns, restarts, and home worlds."
excerpt: I have long wanted to make a game -- pretty much since I was a kid. Typically I try to make something bigger than is really realistic for my skills.
layout: post
tags:
categories:
- Games
image:
ribbon:
tile_size: 1x1
tile_color: #2d88ef
private: false
allow_comments: true
---

I have long wanted to make a game -- pretty much since I was a kid. Typically I try to make something bigger than is really realistic for my skills.  Some grandiose scheme that is so massive even a dedicated company with money to spare would scoff at it's vastness, little alone a single person with marginal programming skills.

So, in thinking about what those skills are and trying to keep a game within that vein; I have been considering a browser based <a target="_blank" href="http://en.wikipedia.org/wiki/4X">4X game</a> done like <a target="_blank" href="http://en.wikipedia.org/wiki/Master_of_orion">Masters of Orion</a> or <a target="_blank" href="http://www.freeorion.org/index.php/Main_Page">FreeOrion</a> (come on guys, I'm rooting for ya!).  More over, I'd like to make this a <a target="_blank" href="http://en.wikipedia.org/wiki/MMO">MMO</a> style game in that you're not alone in the universe.

The rest of this post is me thinking out loud -- take it with a grain of salt.

This would all revolve around a web service which would host the games.  There would be many different games running at once. This would allow players to join as many games as they like. These games are independent of each other and give the player something to do while waiting for a turn to end in a different game.  This also allows for the division of ability such that you can have a beginner game, and an expert game..etc.
Each game would be a browser based massively multiplayer online turn based (or real time) game (BBMMOTBG?! Say that three times fast) where you struggle to conquer the universe.

-Basic Gameplay-

The basic game play flow would be probably pretty close to what you're thinking when you think of Masters of Orion.  You start in a random location in a universe with a bunch of other star systems which in turn have planets and other objects..etc.  In fact this will pretty much be a clone of MoO or FreeOrion but in a browser - thus leaving the core of the game design already done. We can of course expand from that but the basic game play is the same.
In short; You move from one system to the next exploring and trying to reveal the map.  This is how you find other races/beings/npcs/pcs..whatever. All the while expanding your territory and technology such that you can deal with new found "threats" (cause everyone else is a threat). You also must gain new resources and protect them from others who are trying to exterminate you, while you kill them.  Sounds like fun.

-Real Time or Turn Based?-

This is a tough decision and to be completely honest, I can see it going either way right now.  Real time is trickier and presents more issues, however both game models will have their own hurdles.

The major issues as I see them are thus;

Real Time Game Issues:

* A real time game typically goes to the person who is playing the most.  The instant that someone logs off to go eat, or sleep is when everyone else will pounce.
* There will be some technical issues with displaying things in real time to browsers however I feel these can easily be solved with either Flash or Ajax.  (I lean towards ajax)

Turn Based Game Issues:

* By its very nature, a turn based game will be slow. Players will very quickly become bored while waiting for the turn to advance so they can go again.
* Must give the players something else to do while waiting for the turn to advance.. maybe some realtime mini-games?

Right now I'm leaning towards turn based on the major games and maybe offering a realtime game for smaller matches. It shouldn't be too hard to offer both actually.

<u>Home World or Mothership?</u>

One argument against this style of game play is that anyone who logs off or who isn't actively playing 24 hours a day, is a target.  I'd like to figure out a way where by someones home world is basically impossible to take or maybe give them a mother ship instead of a home world where they can keep moving all the time.  The mother ship would only be in the game while the player is actively playing the game.  If they log out, the mother ship provides a mechanic through you can say they went into warp or some such..

I personally like the idea of a home world that is near impossible to destroy.  Its not super useful other than it is your starting point.  It gives its own resources but very few.  The idea being if a player is beaten back to a home world they could still in time create new ships and what not to move out.  If someone does finally destroy your home world, then you're out of the game and rightly so as it's very hard to do.

The mother ship idea while having some merit, tends to prolong the game and encourages attacks from behind or out of nowhere.  Plus if you're doing poorly or you're directly under attack you could just log out, which would remove your mother ship from the world until the other person is gone at which point you just log back in.. Basically making you unkillable.  I think this would annoy players.

At this time, you start the game with a Home World.

<u>Restarts or forever persistent?
</u>

The ultimate goal of the game is to take over the universe and exterminate the other players and NPC's.  In some games that follow a similar model, it gets to the point where a new player simply can not compete with the current top player.  Thus they usually come a point in a game when someone has "won".  Meaning, if you follow that model the games would only last for so long before you would have to restart everything and even the playing field all over again.

Restart Pros - Persistent Cons:

* Fresh playing field every x number of days
* All players start over with the same possibility of winning the next game
* New players that log in to play aren't instantly trounced which means they have a chance
* Easy to maintain metrics that would allow us to rank players from one game to the next
* Resources can start over on a completely new / random playing field.
* The universe can stay smaller because you know that it will start again fresh eventually

Restart Cons - Persistent Pros:

* Restart kills the sense of accomplishment over the long term unless we give them some added character benefits that travel with them from one game to the next
* Persistent has sense of accomplishment, but only for those who are winning.

I think its a pretty good argument for a game system that only lasts X number of turns or Y number of days.. whatever, then restart.

At this time, the game will restart every so often.

-Start mid game?-

Players should be allowed to start mid-game.  The whole point behind having multiple games running all at once is to give players as much opportunity to play as possible.  So while they are waiting for their "main game" to advance, they can log into an already running game and start fresh.  So long as there is an unexplored/unclaimed system still on the map, a new player may join the campaign.

Turn lengths and Turns in general-

Each turn would be made every X amount of time, or in the event that everyone has clicked the "end turn" button, instantly.  Most likely you would make turns happen ever 10 minutes or so.   This gives you ample time to get up and walk away from it and come back to it later.  Plus even if you're gone for an hour, you've missed a whole 6 turns.. Woopie..

The down side to this is it makes the game VERY slow.  We need to try to avoid the slowness.  I'm not too sure how to deal with this in a turn based game.  If there are only 2 players logged in, and both have ended their turn you can go ahead and progress the game a turn.  But if there are 100 players actively playing you can't advance the turn until either the time is up, or the players have ALL gone.

You only have to worry about those players that are logged in as players that aren't logged in aren't there to do anything anyway.

That also brings up the ability to allow players to do some minor scripting in the event of things..  Allowing players to do basic stuff via a script or some other management system for when they are off line would be nice..

In the beginning turns should happen in a fixed amount of time, or in real time.

More as I ponder it... Stay tuned.
