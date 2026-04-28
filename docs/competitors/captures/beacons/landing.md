---
type: competitor-research
project: tadaify
competitor: beacons
title: Beacons.ai — landing page audit
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Beacons.ai — landing page audit

## Scrape constraints

`beacons.ai/` root returned HTTP 403 to direct WebFetch (same WAF pattern
as Linktree), but `beacons.ai/i/plans` and `beacons.ai/i/blog/*` paths
ARE reachable. All homepage-specific claims below come from third-party
reviewers, help-centre metadata, and search-surfaced snippets; live audit
marked where required.

## Root domain + URL structure

- Primary marketing domain: `https://beacons.ai/` (homepage)
- Secondary/informational: `https://home.beacons.ai/` — apps + plans
  mirror, has its own `/plans` surface
- Public profile URL template: `beacons.ai/<username>` (flat, single-
  level, mirrors Linktree's pattern)
- Key sub-landings:
  - `/i/plans` — pricing (mirrored at `home.beacons.ai/plans`)
  - `/i/app-pages/link-in-bio` — dedicated link-in-bio product page
  - `/i/websites` — dedicated website-builder product page
  - `/i/blog/*` — content marketing (e.g.
    `/i/blog/announcing-the-integration-block`,
    `/i/blog/customizing-your-page`,
    `/i/blog/enabling-visitors-to-support-your-content`)
  - `/i/app-pages/*` — product-surface pages (media kit, store, email,
    brand deals — each surface has its own marketing page)
  - `/support`, `/support.business.contact` — support funnels
  - `/api`, `/apis`, `/developer.com` — exist as URLs but [unclear —
    likely marketing stubs not dev portals; see api-public.md]
  - `home.beacons.ai/apps/store` — app store / integration surface

## Positioning (hero)

Beacons' own taxonomy describes itself as "All-in-One Creator Platform to
Monetize & Grow" [source: search-surfaced page title for `beacons.ai/`
root]. Secondary positioning across reviewer paraphrases:

> "Beacons is a free, all-in-one platform with the best link in bio,
> media kit builder, online store and email marketing tool for creators
> on Instagram + TikTok." [source:
> https://later.com/social-media-glossary/beacons/ paraphrasing the
> Beacons homepage]

The **critical positioning move** vs. Linktree: Beacons frames itself as
a "creator OS" (media kit + store + email + DM automation + link in
bio), not merely a link list. This repositioning explains the 9%/0% fee
ladder and the $10→$30→$90 tier spread.

## Value proposition blocks (surfaces)

Visible surfaces based on beacons.ai navigation and product-page slugs:

1. **Link in Bio** (`/i/app-pages/link-in-bio`) — the entry product
2. **Website Builder** (`/i/websites`) — richer multi-page surface
3. **Media Kit** — auto-updating media kit for brand deals
4. **Store** — digital products, courses, memberships,
   physical/affiliate products
5. **Email Marketing** — sends, automations, list segmentation
6. **Instagram DM Automation** ("Smart Reply") — triggered auto-replies
   from IG Reels/Posts/Stories DMs
7. **AI Assistant** ("Beam" — Beacons' branded AI teammate) for
   copywriting, content strategy, insight generation [source: plans page
   FAQ]

This is a materially broader surface area than Linktree.

## Social proof (on homepage)

- Meta-description positioning: "trusted by Instagram, TikTok, Facebook,
  YouTube, X" — referenced in plans-page FAQ copy
  [source: direct fetch of https://beacons.ai/i/plans]
- Claimed user count [unclear — reviewers cite "thousands of creators"
  or similar vague numbers; no specific headline figure observed]
- **Trustpilot score: 1.9/5** — notable negative outlier
  [source: https://www.trustpilot.com/review/beacons.ai]
  (this is a risk flag for Beacons' positioning)
- **"12k brand partners"** — affiliate catalogue depth claim on plans
  page [source: direct fetch of /i/plans]

## Feature-section taxonomy (their vocabulary)

From direct plans-page fetch + help-centre category names:

- "Link in Bio"
- "Website Builder"
- "Store" / "Products 💰"
- "Media Kit" / "Brand Collabs"
- "Smart Reply" (DM automation)
- "Beacons Audience" (the email list)
- "Brand Commission Affiliate" (affiliate catalogue + payouts)
- "AI Credits" (usage-metered AI actions)
- "Referrals"

## CTAs

- Primary: "Sign up free" / "Claim your Beacons page" → signup
- Secondary: "See plans" → `/i/plans`
- Tertiary: "Get the app" → iOS / Android stores
  [source: https://play.google.com/store/apps/details?id=ai.beacons.beacons&hl=en_IN]

## Trust signals

- Beacons is used by creators on Instagram, TikTok, Facebook, YouTube, X
  [source: `/i/plans` FAQ]
- "Less than 5 minutes" setup promise [source: `/i/plans` FAQ]
- "White glove onboarding" and NFC card on Creator Max — physical
  validation signal [source: `/i/plans`]
- No public SOC-2 / ISO badge [unclear — not surfaced on plans page]
- Trustpilot visible on web but score is low; Beacons does not
  self-embed it [source: trustpilot.com/review/beacons.ai]

## Footer info (inferred)

Standard SaaS pattern: Company / Product / Legal / Support / Social
links. Support contact addresses explicitly documented:
`sup@beacons.ai` and `support@beacons.ai`
[source:
https://beacons.pissedconsumer.com/customer-service.html,
https://beacons.ai/support]. A phone-number listing `+1 415-843-2267`
appears on Pissed Consumer but is not surfaced on beacons.ai
proper.

## Growth hooks visible on the landing

- **Forever-free plan** with 9% fee as the acquisition path [source:
  `/i/plans`]
- **Referrals 👯** surface as a dedicated help-centre category (4
  articles) — creator-referral programme with perk unlocks
  [source: https://help.beacons.ai/en categories list]
- **"12k brand partners" affiliate catalogue** — creators drop in,
  attach products, earn without any outbound sales
  [source: `/i/plans`]
- **Free custom domain on Creator tier** ($10/mo) — explicit value-for-
  money claim vs Linktree (which has NO custom domain at ANY tier)
- **Free first year of custom domain** referenced by khaby.ai reviewer
  [source: https://khaby.ai/pricing/beacons/] [unclear — verify current
  exact terms]
- **"Physical NFC card"** on Creator Max — novelty retention mechanic,
  turns a SaaS into a thing you hold

## Segment landings

Based on blog / `/i/app-pages/*` pattern, Beacons appears to run fewer
segment-specific pages than Linktree. Their segmentation is by
PRODUCT-surface (link-in-bio vs website vs store vs media kit) rather
than by creator niche. [unclear — verify live]

## Key landing observations for tadaify positioning

(Neutral observations — no "tadaify should" in this file.)

- Beacons' "creator OS" bundle is both a strength (one subscription,
  many tools) and a weakness (Trustpilot 1.9/5 suggests sprawl = quality
  drift; 41% of negative reviews cite unreliable support per autoposting
  analysis)
- The 9% → 0% fee ladder is more aggressive at the higher end ($30/mo
  Creator Plus = 0%) than Linktree ($35/mo Premium = 0%), so Beacons
  wins the "lower-price zero-fee" narrative
- Beacons' free custom domain at $10 is a major wedge vs Linktree's
  "no domain on any plan" — Beacons out-markets Linktree on brand
  ownership
- The AI-credits surface (30 / 300 / unlimited daily) is a category
  first — Linktree doesn't have a metered-AI surface at all as of
  April 2026

## Sources

- [Beacons.ai homepage (fetch blocked)](https://beacons.ai/)
- [Beacons plans page — direct fetch](https://beacons.ai/i/plans)
- [Beacons plans mirror](https://home.beacons.ai/plans)
- [Beacons help centre](https://help.beacons.ai/en)
- [Announcing the Integration Block](https://beacons.ai/i/blog/announcing-the-integration-block)
- [Customizing your page blog](https://beacons.ai/i/blog/customizing-your-page)
- [Enabling visitor support](https://beacons.ai/i/blog/enabling-visitors-to-support-your-content)
- [Later glossary: Beacons](https://later.com/social-media-glossary/beacons/)
- [Trustpilot — Beacons.ai](https://www.trustpilot.com/review/beacons.ai)
- [Google Play — Beacons Android app](https://play.google.com/store/apps/details?id=ai.beacons.beacons&hl=en_IN)
- [KHABY.AI — Beacons pricing 2026](https://khaby.ai/pricing/beacons/)
- [autoposting.ai — Beacons review](https://autoposting.ai/beacons-ai-review/)
