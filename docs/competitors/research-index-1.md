---
type: competitor-research-index
project: tadaify
title: Competitor desk-research — research-1 batch index
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Tadaify — competitor research-1 index

Batch: **research-1** (desk-research only, no live login or
screenshots; screenshots are a later pass via Claude-in-Chrome).

Agent: `orchestrator-opus-4-7-agent-1`. Date: 2026-04-24. Total
files produced in this batch: **70 new files + 5 notes.md top-
section additions**, across 10 competitors.

Research constraints encountered:
- `linktr.ee`, `beacons.ai` root, `bio.link`, `lnk.bio` returned HTTP
  403 to direct WebFetch (Cloudflare / WAF). Research for those
  competitors relied on WebSearch results + third-party reviewer
  corpora + partial-fetchable sub-paths.
- `beacons.ai/i/plans` and `beacons.ai/i/blog/*` WERE directly
  fetchable — Beacons' pricing content is verified first-hand.
- `carrd.co/`, `name.com/hopp`, `campsite.bio/`, `later.com/link-in-bio`,
  `taplink.cc/`, `milkshake.app/` were fetchable — their hero copy
  and feature sections are verified first-hand.
- `stan.store/` rendered a client-side-only shell with no usable
  content on direct fetch; `stan.store/pricing` redirected to a
  "store under construction" page. Stan research synthesised from
  `stan.store/blog/*` and third-party reviewers.

## Files by competitor

Each competitor folder contains 7 desk-research files plus a `notes.md`
(UI audit with optional desk-research summary prepended). `notes.md`
for linktree and bio-link already had substantial UI audit content
from a prior screenshot pass — those were preserved untouched. The
other 8 competitors had 53-line empty `notes.md` templates; a
`## Desk Research Summary` section was prepended to each.

### 1. Linktree (reference competitor — deepest research)

- [landing.md](competitors/linktree/landing.md) — full landing page
  audit; 70M+ users, `linktr.ee/<slug>` URL, 403-blocked so synthesised
  from third parties
- [pricing.md](competitors/linktree/pricing.md) — Free / Starter $8 /
  Pro $15 / Premium $35; 12%/9%/9%/0% seller-fee ladder; November 2025
  price hike documented
- [help-docs.md](competitors/linktree/help-docs.md) — 5-category help
  centre structure (Analytics, How-to's, Earn with Linktree, Account
  support, Security + Policies); ~181 articles
- [integrations.md](competitors/linktree/integrations.md) — Marketplace
  categories, Shopify + Stripe + Mailchimp + Klaviyo + Zapier + GA4 +
  Meta/TikTok Pixels; paid-tier gating table
- [api-public.md](competitors/linktree/api-public.md) — early-access-
  gated developer programme at `linktr.ee/marketplace/developer`; REST
  + GraphQL + webhooks exist but not self-serve; rich scraper ecosystem
  (keosariel, Apify, scrapecreators) fills the gap
- [reviews.md](competitors/linktree/reviews.md) — Capterra 4.4/5 (107),
  takedown-without-recourse biggest complaint, bot-first support,
  "no custom domain on any tier" structural gripe
- [templates-themes.md](competitors/linktree/templates-themes.md) —
  `/s/templates` niche-oriented gallery, customisation ceiling
  (no custom CSS); third-party Linktree-clone ecosystem (GitHub,
  Webflow, Envato, Astro)
- [notes.md](competitors/linktree/notes.md) — preserved (4285 lines
  of existing screenshot UI audit content)

### 2. Beacons.ai (second-deepest)

- [landing.md](competitors/beacons/landing.md) — "All-in-One Creator
  Platform to Monetize & Grow"; trusted-by IG/TikTok/FB/YT/X; 12k
  affiliate brand partners; Trustpilot 1.9/5 risk flag
- [pricing.md](competitors/beacons/pricing.md) — Free / Creator $10 /
  Creator Plus $30 / Creator Max $90; "2 months free" annual; 9%/9%/
  0%/0% fee ladder; AI credits 30/300/unlimited/unlimited daily;
  head-to-head vs Linktree comparison
- [help-docs.md](competitors/beacons/help-docs.md) — 13-category help
  centre, ~181 articles, heavy commerce tilt (48 Products + 19 Brand
  Collabs); 1024+ fonts, no custom CSS
- [integrations.md](competitors/beacons/integrations.md) — Integration
  Block architecture with Laylo / QuikPlace / Split / Ko-fi launch
  partners; Stripe + PayPal + BNPL (Klarna/Affirm); Shopify; IG DM
  automation via Smart Reply
- [api-public.md](competitors/beacons/api-public.md) — no public API;
  disambiguation table vs hellobeacon.ai / beaconcrm.org / HelpScout
  Beacon / MDN Beacon
- [reviews.md](competitors/beacons/reviews.md) — Trustpilot 1.9/5;
  41% unreliable support mentions, 27% technical glitches, affiliate
  payouts held over 1 year; cancellation gated behind multi-step
  surveys
- [templates-themes.md](competitors/beacons/templates-themes.md) —
  1024+ fonts, video-background on free, no custom CSS, no public
  `/templates` gallery URL (SEO gap)
- [notes.md](competitors/beacons/notes.md) — new Desk Research Summary
  prepended (53-line template preserved below)

### 3. Stan Store

- [landing.md](competitors/stan-store/landing.md) — "Your Creator
  Store", mobile-first; Trustpilot 4.8/5 (1906 reviews) — category
  highest after Milkshake
- [pricing.md](competitors/stan-store/pricing.md) — Creator $29 /
  Creator Pro $99, 0% platform fee both tiers, no free plan,
  14-day trial
- [help-docs.md](competitors/stan-store/help-docs.md) — 30-minute
  launch promise, 11 theme styles, 10 fonts, 2 colours; gallery at
  help article 330
- [integrations.md](competitors/stan-store/integrations.md) — Stripe +
  PayPal, GA4 + Meta Pixel + TikTok Pixel (Pro only), Google Cal +
  Zoom; native AutoDM
- [api-public.md](competitors/stan-store/api-public.md) — no public
  API; Zapier bridge only
- [reviews.md](competitors/stan-store/reviews.md) — 4.8 Trustpilot,
  ease + zero fees + support praised; no-free-plan / cookie-cutter
  design / $99 email paywall / thin course features complained-about
- [templates-themes.md](competitors/stan-store/templates-themes.md) —
  11 styles × 10 fonts × 2 colours; Etsy + Reveal Studio third-party
  template market
- [notes.md](competitors/stan-store/notes.md) — new Desk Research
  Summary prepended

### 4. Bio.link (Hopp by Wix)

- [landing.md](competitors/bio-link/landing.md) — rebrand note:
  bio.link → Hopp → Hopp by Wix; "The link in bio that's built for
  business"; unique "searchable links" feature
- [pricing.md](competitors/bio-link/pricing.md) — 2-tier simplicity:
  Free / Pro $8.50-$9.99; free .bio/.link domain with Pro
- [help-docs.md](competitors/bio-link/help-docs.md) — split help:
  support.wix.com + name.com/support; Wix ecosystem crossovers
- [integrations.md](competitors/bio-link/integrations.md) — Stripe +
  Wix Stores + Wix Payments; branded URL shortener; Pre-rolls
  ad-format monetisation
- [api-public.md](competitors/bio-link/api-public.md) — no public API;
  disambiguation vs scientific BioLink tools
- [reviews.md](competitors/bio-link/reviews.md) — thin review surface
  (multi-owner rebrand), weak brand recognition, clean/simple praised
- [templates-themes.md](competitors/bio-link/templates-themes.md) —
  professional templates, premium tier, Canva + Jotform + Envato +
  GitHub third-party ecosystem
- [notes.md](competitors/bio-link/notes.md) — preserved (392 lines of
  existing UI audit content)

### 5. Carrd

- [landing.md](competitors/carrd/landing.md) — "Simple, free, fully
  responsive one-page sites for pretty much anything"; indie /
  designer / HN audience; no testimonials or user-count on homepage
- [pricing.md](competitors/carrd/pricing.md) — Free / Pro Lite $9/yr
  / Pro Standard $19/yr / Pro Plus $49/yr; **ANNUAL-ONLY billing**,
  no monthly; 7-day trial no credit card
- [help-docs.md](competitors/carrd/help-docs.md) — developer-
  oriented docs, Pro Plus source-download feature
- [integrations.md](competitors/carrd/integrations.md) — embed-first
  philosophy; Mailchimp + ConvertKit + Zapier + Google Sheets native
  form integrations; unlimited iframe / widget embeds
- [api-public.md](competitors/carrd/api-public.md) — no API, but Pro
  Plus source-download = actual data ownership / zero lock-in
- [reviews.md](competitors/carrd/reviews.md) — loved by designers /
  devs, steep learning curve for non-technical, "bounce rate dropping
  30%+ switching from Linktree to Carrd" stat
- [templates-themes.md](competitors/carrd/templates-themes.md) —
  **264 templates** (category leader); custom CSS + JS on Pro Plus
  (unique)
- [notes.md](competitors/carrd/notes.md) — new Desk Research Summary
  prepended

### 6. Taplink

- [landing.md](competitors/taplink/landing.md) — "Drive more leads and
  sales on Instagram"; dual-domain (taplink.cc marketing, taplink.at
  signup); CIS / Eastern-European origin
- [pricing.md](competitors/taplink/pricing.md) — 3 tiers, $0 / ~$2-3
  / ~$6-8; 0% platform commission; 60+ payment processors (widest
  in category)
- [help-docs.md](competitors/taplink/help-docs.md) — AI page
  generator, countdown timer blocks, form-to-CRM flow
- [integrations.md](competitors/taplink/integrations.md) — 60+
  payment processors including regional CIS / European
  processors; WhatsApp / Viber / Messenger / Telegram messenger links
- [api-public.md](competitors/taplink/api-public.md) — no public API
- [reviews.md](competitors/taplink/reviews.md) — praised for ease +
  customisation + AI generator; flagged countdown-timer bug, trial-
  expiry public shaming, support-upsell behaviour
- [templates-themes.md](competitors/taplink/templates-themes.md) —
  100+ templates × 400+ themes (template/theme decoupling);
  unique AI page generator
- [notes.md](competitors/taplink/notes.md) — new Desk Research Summary
  prepended

### 7. Later Link in Bio (Linkin.bio)

- [landing.md](competitors/later-linkinbio/landing.md) — "One link in
  bio, Endless Possibilities"; enterprise social proof (Baggu,
  YouTube, L'Oréal, HGTV); Wix-style multi-product positioning
- [pricing.md](competitors/later-linkinbio/pricing.md) — Linkin.bio
  bundled in Later subscriptions $25-$200+/mo; free standalone
  Linkin.bio; up-to-5-links-per-post on Growth+
- [help-docs.md](competitors/later-linkinbio/help-docs.md) —
  grid-match rendering, per-post analytics, Shopify product tagging
- [integrations.md](competitors/later-linkinbio/integrations.md) —
  multi-platform scheduler (IG/FB/TikTok/Pinterest/LinkedIn/Snap);
  Shopify deep; Canva + Dropbox; Mailchimp email capture
- [api-public.md](competitors/later-linkinbio/api-public.md) — no
  public API; enterprise custom integrations only
- [reviews.md](competitors/later-linkinbio/reviews.md) — enterprise-
  favourable, creator-ambivalent; $25 floor dealbreaker for solo
  creators; limited Linkin.bio themes
- [templates-themes.md](competitors/later-linkinbio/templates-themes.md)
  — IG grid-mirror signature pattern (unique); featured banner
  block; limited theme count
- [notes.md](competitors/later-linkinbio/notes.md) — new Desk
  Research Summary prepended

### 8. Lnk.Bio

- [landing.md](competitors/lnk-bio/landing.md) — "most affordable
  link-in-bio tool"; Italian (Milan) origin, since 2016
- [pricing.md](competitors/lnk-bio/pricing.md) — Free (unlimited
  links) / Mini Monthly $0.99 / Mini One-Time $9.99 / **Unique
  One-Time $24.99 lifetime** / Ultra ~$90/yr; 5-year TCO devastating
  vs subscription competitors
- [help-docs.md](competitors/lnk-bio/help-docs.md) — 368+ themes,
  44,000+ Google Fonts, video wallpapers
- [integrations.md](competitors/lnk-bio/integrations.md) — Mailchimp,
  social embeds, custom domain on Unique+; thin integration surface
- [api-public.md](competitors/lnk-bio/api-public.md) — no public API
- [reviews.md](competitors/lnk-bio/reviews.md) — loved for price +
  unlimited-free-links + lifetime option; weak brand recognition,
  sparse integrations
- [templates-themes.md](competitors/lnk-bio/templates-themes.md) —
  368+ themes (category high by theme count), 44,000+ Google Fonts,
  video wallpapers
- [notes.md](competitors/lnk-bio/notes.md) — new Desk Research
  Summary prepended

### 9. Campsite.bio

- [landing.md](competitors/campsite-bio/landing.md) — "Create your
  space on the web"; 250k creators/agencies/brands; **enterprise
  logos Dell / Georgetown / OrangeTheory / Participant** (stronger
  B2B roster than Linktree); Milwaukee indie
- [pricing.md](competitors/campsite-bio/pricing.md) — Free (more
  generous than Linktree) / Pro $7/mo / Pro+ $24/mo (Organizations
  multi-profile); cheapest custom-domain entry
- [help-docs.md](competitors/campsite-bio/help-docs.md) — Groups
  (nested links), carousels free tier, Auto-Pilot scheduling,
  UTM parameters
- [integrations.md](competitors/campsite-bio/integrations.md) —
  Mailchimp, GA4, Meta/TikTok Pixel, embed-based commerce
- [api-public.md](competitors/campsite-bio/api-public.md) — no
  public API
- [reviews.md](competitors/campsite-bio/reviews.md) — more generous
  free tier than Linktree (consistent theme); customer service
  praised; fewer templates than Lnk.Bio/Taplink
- [templates-themes.md](competitors/campsite-bio/templates-themes.md)
  — 10+ free templates with upload-own-image + adjustable fonts/
  spacing on free tier
- [notes.md](competitors/campsite-bio/notes.md) — new Desk Research
  Summary prepended

### 10. Milkshake

- [landing.md](competitors/milkshake/landing.md) — "Build a free
  website on your phone"; **mobile-only** (iOS + Android); 5M+
  downloads, **4.9 App Store rating (category high)**, 70K+ reviews;
  Webby + Vogue Codes + Lifehacker + InVision features
- [pricing.md](competitors/milkshake/pricing.md) — Free / Lite $2.99
  (cheapest branding-removal in category) / Pro $6.99 / Pro+ $9.99;
  annual discounts
- [help-docs.md](competitors/milkshake/help-docs.md) — mobile-only
  editor, "Shake it up" randomiser, 5 websites per account, no web
  version
- [integrations.md](competitors/milkshake/integrations.md) — Meta
  Pixel / GA4 / mailing list; **no native commerce** (shop card is
  display-only)
- [api-public.md](competitors/milkshake/api-public.md) — no public
  API; mobile-only architecture means no creator-facing URL admin
- [reviews.md](competitors/milkshake/reviews.md) — Capterra 4.6/5
  (290+), G2 4.3/5 (210+), App Store 4.9/5 (70K+); mobile-only is
  the biggest complaint
- [templates-themes.md](competitors/milkshake/templates-themes.md) —
  card-based swipeable architecture (signature pattern, copyable),
  "Shake it up" randomiser, shallow customisation
- [notes.md](competitors/milkshake/notes.md) — new Desk Research
  Summary prepended

## Cross-competitor observations (to feed Agent 3 positioning synthesis)

The following patterns emerged across all 10 competitors:

1. **Closed platforms are the norm** — 9/10 have no public API
   (Carrd's source-download is the exception). This is an uncontested
   tadaify wedge.

2. **Custom domain gating is the single most repeated complaint**
   across comparison articles. Linktree refuses it on ALL tiers.
   Beacons, Hopp, Carrd, Campsite, Stan, Taplink, Lnk.Bio, Milkshake,
   Later all offer it at paid tiers (often $7-$10).

3. **Seller-fee ladders are the real pricing lever** — not sticker
   price. Linktree 12%→9%→0%, Beacons 9%→0%, Stan 0% both tiers,
   everyone else 0%. Tadaify must commit to 0% on all tiers or have
   a clear "why fees" story.

4. **Trustpilot scores cluster at extremes** — Stan 4.8, Milkshake
   4.9 App Store, Beacons 1.9. Support quality is the biggest
   differentiator, far more than feature surface.

5. **AI page generation is now table stakes** — Taplink and Beacons
   ship it; others will follow. Tadaify launching without AI gen is
   instantly dated.

6. **Template SEO is under-exploited** — Only Linktree and Carrd
   run public `/templates` galleries that rank organically. Beacons,
   Stan, Later, Milkshake all keep templates in-editor. This is
   SEO airspace.

7. **Mobile-first is a legitimate niche** — Milkshake owns it via
   mobile-only architecture. Tadaify can serve the segment without
   being mobile-only.

8. **Card-based / multi-page / grid-mirror are three copyable UX
   patterns** from Milkshake / Carrd / Later. Tadaify shipping
   multiple template archetypes (link list, cards, grid mirror,
   multi-page) captures all three demographics.

9. **The 9-12% seller-fee free tier is a deliberate acquisition
   tax** on creators. Tadaify matching with 0%-fee on free tier is
   the single most disruptive pricing move possible.

10. **Agency / multi-profile management is an $24-75 price band**
    with Campsite Pro+ $24, Beacons Creator Max $90, Later Agency
    $200+. This is a profitable mid-market tier if Tadaify targets
    it.

## Next-step passes (future research agents)

- **Research-2** — Claude-in-Chrome live login + screenshot pass on
  the 8 empty `notes.md` competitors (beacons, stan-store, carrd,
  taplink, later-linkinbio, lnk-bio, campsite-bio, milkshake).
  Linktree and bio-link already have substantial screenshot audits
  in their `notes.md`.
- **Research-3** — positioning synthesis (Agent 3). Reads all 80+
  files in this index + the existing Linktree/Bio.link screenshot
  audits + the tadaify brand-exploration + mockups; produces
  positioning deck, hero messaging, feature-gap roadmap, pricing
  recommendation.
- **Research-4 (optional)** — live-pricing verification pass (quick
  fetch of each pricing page to confirm April 2026 numbers).

## Progress log

Final line appended to `/tmp/tadaify-research-1-progress.log`:
```
<TIMESTAMP> ALL DONE — <N> files written
```

See that log for per-competitor timing.
