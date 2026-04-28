---
type: competitor-research
project: tadaify
competitor: stan-store
title: Stan Store — integrations catalogue
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Stan Store — integrations catalogue

## Payment processors
- **Stripe** — primary processor; 2.9% + $0.30 US baseline [source:
  crevio.co/blog/is-stan-store-legit]
- **PayPal** — alternative [source: slashdot.org/Stan.store integrations]
- Buy Now Pay Later [unclear — not advertised in the Stripe
  integration surface]

## Automation
- **Zapier** — bridges Stan events to thousands of apps [source:
  slashdot integrations listing]

## Analytics / Ad pixels
- **Google Analytics (GA4)** — page + event tracking
- **Facebook Pixel (Meta)** — retargeting
- **TikTok Pixel** — conversion tracking
- All three gated to Creator Pro $99 per [talkspresso Stan
  pricing & features 2026](https://talkspresso.com/blog/stan-store-pricing-and-features-2026)

## Calendar / scheduling
- **Google Calendar sync** — real-time availability for bookings
  [source: talkspresso]
- **Zoom** — auto-Zoom link on booking [source: same]
- [unclear — Apple Cal, Outlook, Cal.com support]
- No documented Calendly integration; Stan's native bookings surface
  replaces Calendly for 1:1s

## Social DM automation
- **AutoDM (Instagram)** — Stan-native post-purchase DM flow;
  Meta Graph API under the hood [source: Stan pricing blog]

## Email
- **Native Stan Email Marketing** (Creator Pro only, $99)
- External ESPs (Mailchimp, ConvertKit/Kit, etc.) — [unclear — via
  Zapier bridge only, no native connector surfaced]

## Community
- **Native Stan Community** (Creator tier)
- External communities (Discord, Circle) — via Zapier bridge or
  link-out only [unclear]

## Shopify / physical products
- Stan focuses on digital-first; physical product support exists
  [unclear — exact model: drop-in Shopify embed vs Stan-native
  inventory]

## Notable absences vs competitors

- **No Mailchimp-native / Klaviyo-native connector** (Beacons has it;
  Stan routes via Zapier)
- **No Shopify-native storefront embed** (Beacons + Linktree both have
  it; Stan's strategy is to BE the store)
- **No public creator API / webhooks** (see api-public.md)

## Partnership model

Stan's integration surface is materially narrower than Beacons'. Where
Beacons markets its Integration Block as an extensible partner
platform, Stan treats integrations as utility connectors (payments,
pixels, calendar). This is consistent with Stan's positioning: the
store IS the product, third-party tools are plumbing.

## Sources

- [Slashdot — Stan integrations listing](https://slashdot.org/software/p/Stan.store/integrations/)
- [Stan help — integrations category](https://help.stan.store/category/320-integrations)
- [Stan pricing blog](https://stan.store/blog/stan-store-pricing/)
- [talkspresso — Stan 2026](https://talkspresso.com/blog/stan-store-pricing-and-features-2026)
- [crevio — is Stan legit](https://crevio.co/blog/is-stan-store-legit)
