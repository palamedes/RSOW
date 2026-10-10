---
title: "Tinkered Tactile"
kind: "Small-business site"
order: 9
year: "2026"
summary: "A showcase site for a maker brand (laser engraving, woodturning, signs and maps), with a gallery, a for-sale shelf and a project request form, built as a fast static site at almost no cost."
services: [small-business, web-design]
stack: [Jekyll, Sass, JavaScript]
icon: store
hue: 32
shot: /assets/images/build/tinkered-tactile.jpg
shot_alt: "The Tinkered Tactile home page, with a dark hero and a grid of handmade work"
live: https://randomstringofwords.com/tinkered-tactile/
facts:
  - { k: "Pages", v: "Gallery, piece pages, for-sale shelf, business page, request form" }
  - { k: "Images", v: "Modern formats at several sizes, generated automatically" }
  - { k: "Cost to run", v: "Static hosting: effectively free" }
---

## The problem

A small maker business needs to show its work, explain what it can make, and turn interest into conversations, without a monthly website-builder bill or a platform that won't let you leave.

## What I built

A complete small-business site with its own look, living inside this one: a gallery of finished pieces with a page for each, a "what we make" guide, a page for business customers, a for-sale shelf, and a single request form that handles both project inquiries and plain questions. Pieces can pre-fill the form ("I want one like this"), and attachments are supported.

## Under the hood

- One file per piece of work drives the gallery, the category pages and the detail pages
- An image script produces modern formats at several sizes and strips camera metadata
- Settings such as the form service, contact details and analytics live in one file, and anything left blank simply doesn't show
- A custom domain redirects to it with HTTPS, without paying for a second host

## What it shows

What most small businesses actually need: a fast, good-looking site they own, a way to get inquiries, and nothing to pay for every month.
