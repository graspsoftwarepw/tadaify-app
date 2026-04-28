---
type: competitor-research
project: tadaify
competitor: linktree
title: Linktree — integrations catalogue
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Linktree — integrations catalogue

## Source of truth

Linktree markets its integration surface as **"Marketplace"** at
`https://linktr.ee/marketplace` (and per-integration sub-pages at
`https://linktr.ee/marketplace/integrations/<slug>`). Direct WebFetch is
blocked; catalogue below is synthesised from third-party reviews, Shopify
App Store listing, and talkspresso breakdowns.

## Integration categories (Linktree's taxonomy)

Linktree groups its marketplace into roughly these categories [source:
multiple review syntheses — taxonomy inferred from Marketplace navigation
surfaced in search]:

1. **Commerce** — Shopify storefront, Spring (merch), Amazon links,
   Gumroad links, Etsy embeds
2. **Digital products & monetisation** — Stripe connection, PayPal,
   Cameo, Bonfire
3. **Email & marketing** — Mailchimp, Klaviyo, ConvertKit (Kit),
   Google Sheets, MailerLite
4. **Video & audio** — YouTube, Vimeo, Spotify, Apple Music, SoundCloud,
   Anchor/Podcast embeds
5. **Social** — Instagram (auto-post), TikTok (auto-post / latest video),
   Twitter/X embed, Pinterest
6. **Analytics** — Google Analytics (GA4), Meta (Facebook) Pixel,
   TikTok Pixel, Twitter/X Pixel
7. **Booking & scheduling** — Calendly, Cal.com [unclear]
8. **Other / Zapier-bridged** — Zapier connection opens hundreds of
   downstream integrations

Counts at a glance: apitracker.io lists "9 integrations" at the API-level
[source: https://apitracker.io/a/linktr-ee], but this is the developer
API surface, not the product integration count which is materially
higher (50+). [unclear — exact count needs live Marketplace crawl]

## Integration deep-dive (cited)

### Shopify
- Partnership since 2021: "Linktree partners with Shopify to allow users
  to add storefronts on its platform" [source:
  https://techcrunch.com/2021/11/11/linktree-partners-with-shopify-to-allow-users-to-add-storefronts-on-its-platform/]
- Marketplace page: `https://linktr.ee/marketplace/integrations/shopify`
- Shopify App Store listing: `https://apps.shopify.com/linktree`
- Mechanism: Shopify collection / product embed inline on the Linktree
  page ("shop your collections, sales, and most popular products right
  alongside your latest content") [source: Linktree marketplace page
  quoted by payable.at]
- Checkout: redirect to Shopify storefront (not inline) [unclear —
  confirm 2026]

### Stripe + PayPal
- Payment processors for Digital Products, Tips, and Paid content
- Linktree takes a platform fee (seller fee) ON TOP of Stripe/PayPal
  processor fees [source: talkspresso breakdown]
- Connection model: OAuth to the creator's own Stripe / PayPal account
  (Connect-style) [unclear — confirm model]

### Mailchimp / Klaviyo / Google Sheets
- Used for lead capture: email-collection form routes new emails to the
  chosen ESP or to a Google Sheets row [source: thesocialcat,
  talkspresso]
- Double-opt-in configurable [unclear]
- Available Starter+ (not free) [source: talkspresso]

### Gumroad
- Users link to their existing Gumroad products from a Linktree link
  (not inline embed) [source: multiple reviews]
- No first-party Gumroad integration for inline checkout [unclear]

### Spotify / YouTube / Apple Music / SoundCloud
- Inline-embed style: the track / playlist / video renders on the
  Linktree page [source: thesocialcat]
- Most valuable for musician / podcaster segment

### Calendly
- Booking embed for creators offering 1:1 time [unclear — confirm Calendly
  specifically vs generic URL embed]

### Zapier
- Broad bridge integration — any event on a Linktree (email capture,
  link click beyond threshold) can be Zapier-triggered [unclear —
  exact trigger catalogue]
- Opens the long tail of integrations Linktree does not build directly

### Google Analytics (GA4)
- Pixel/code injection for creator's own GA property [source:
  https://linktr.ee/help/en/articles/5434201-google-analytics-integration]
- Appears to be paid-tier gated [unclear — verify tier]

### Meta (Facebook) Pixel + TikTok Pixel
- Standard pixel injection for retargeting [unclear — which tier]

## Paid-tier gating pattern

Based on synthesised reviewer evidence:

| Integration | Free | Starter | Pro | Premium |
|-------------|------|---------|-----|---------|
| Basic embeds (IG, TikTok, YT, Spotify) | ✓ | ✓ | ✓ | ✓ |
| Shopify storefront | [unclear] | ✓ | ✓ | ✓ |
| Email capture → Mailchimp/Klaviyo | ✗ | ✓ | ✓ | ✓ |
| GA4 / Meta Pixel / TikTok Pixel | ✗ | [unclear] | ✓ | ✓ |
| Zapier bridge | ✗ | [unclear] | ✓ | ✓ |
| Calendly booking | ✓ (as link) | ✓ | ✓ | ✓ |
| Stripe / PayPal payouts | ✓ w/ 12% fee | ✓ w/ 9% fee | ✓ w/ 9% fee | ✓ w/ 0% fee |

[unclear cells need live audit]

## OAuth / API / embed mechanisms

- Most integrations use OAuth to the creator's account (Shopify, Stripe,
  PayPal, Mailchimp, Google, Spotify)
- Some are pure iframe/oembed (Spotify playlist, YouTube video)
- Zapier uses its own per-app auth via Zapier's platform
- No documented first-party webhook infrastructure exposed to creators
  [unclear — developer API exposes webhooks separately; see api-public.md]

## Mutual / co-marketing partnerships

- **Shopify**: reciprocal listing in Shopify App Store
  [source: https://apps.shopify.com/linktree]
- **Calendly** [unclear]
- **Mailchimp**: Linktree featured in Mailchimp integration directory
  [unclear — verify live]
- **Amazon Influencer / storefront**: Amazon does not list Linktree
  officially but creators link to their Amazon storefronts
- **TikTok**: TikTok for Business partner [unclear — verify]

## Integration gaps (notable absences competitors exploit)

- **No native Substack integration** [unclear — verify 2026]
- **No Kajabi / Teachable / Thinkific native** (creators link out)
- **No Discord / community-platform native** beyond link-out
- **No Notion embed** (creators link out)
- **No Bluesky** [unclear — likely no]
- Weak **lead-gen-form customisation** compared to Beacons' form builder

## Sources

- [Linktree Marketplace — Shopify integration](https://linktr.ee/marketplace/integrations/shopify)
- [Linktree Shopify App Store listing](https://apps.shopify.com/linktree)
- [TechCrunch — Linktree × Shopify 2021](https://techcrunch.com/2021/11/11/linktree-partners-with-shopify-to-allow-users-to-add-storefronts-on-its-platform/)
- [TechCrunch — monetization suite 2025](https://techcrunch.com/2025/04/23/linktree-rolls-out-a-suite-of-monetization-features-for-creators/)
- [Google Analytics integration help](https://linktr.ee/help/en/articles/5434201-google-analytics-integration)
- [talkspresso — Features & pricing 2026](https://talkspresso.com/blog/linktree-features-pricing-2026)
- [Payable.at — Beacons vs Linktree](https://payable.at/compare/beacons-vs-linktree)
- [Payable.at — Carrd vs Linktree](https://payable.at/compare/carrd-vs-linktree)
- [thesocialcat — Linktree glossary](https://thesocialcat.com/glossary/linktree)
- [Biotree — make money with Linktree](https://biotree.bio/blog/make-money-with-linktree)
- [APITracker — Linktree](https://apitracker.io/a/linktr-ee)
