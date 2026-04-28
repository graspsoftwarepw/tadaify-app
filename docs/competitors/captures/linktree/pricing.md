---
type: competitor-research
project: tadaify
competitor: linktree
title: Linktree — pricing matrix
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Linktree — pricing matrix

## Scrape notes

Direct fetch of `linktr.ee/s/pricing` returned HTTP 403. Matrix below is
synthesised from SaaSworthy (April 2026 snapshot), talkspresso breakdowns
(2026), daily-ads 2026 review, GetApp, creator-hero, and Capterra pricing
page. Prices are USD, as monthly-billing equivalents; annual billing
advertised as saving ~20%. **Linktree raised prices across all paid plans
in November 2025** [source:
https://talkspresso.com/blog/linktree-price-plans-breakdown]. The April 2026
matrix reflects post-increase pricing.

## Tier matrix (April 2026)

| Tier      | Monthly | Annual (effective monthly) | Savings | Target user |
|-----------|---------|----------------------------|---------|-------------|
| Free      | $0      | $0                         | —       | Anyone, forever-free anchor |
| Starter   | $8      | ~$6.40 [unclear — exact annual needs audit] | ~20% | Solo creators wanting branding removal |
| Pro       | $15     | ~$12 [unclear] | ~20% | Creators with monetisation + marketing stack |
| Premium   | $35     | ~$28 [unclear] | ~20% | Creators whose sales volume makes the 0% fee pay back |
| Enterprise | Custom | Custom | — | Agencies, labels, media orgs; sales-qualified |

Sources:
- [SaaSworthy Linktree pricing April 2026](https://www.saasworthy.com/product/linktree/pricing)
- [talkspresso — Every plan & fee explained (2026)](https://talkspresso.com/blog/linktree-price-plans-breakdown)
- [talkspresso — Free vs paid 2026](https://talkspresso.com/blog/linktree-free-vs-paid-features-2026)
- [Capterra Linktree pricing](https://www.capterra.com/p/229171/Linktree/pricing/)

## Free plan — what you get

- Unlimited links on your Linktree
- Basic themes (limited selection) [source: talkspresso free-plan 2026]
- QR code generator
- Simple analytics (lifetime clicks; no date-range filtering
  at the free level) [unclear — exact retention needs live audit]
- Ability to sell digital products — **BUT with a 12% seller fee**
  in addition to Stripe/PayPal processor fees
  [source: talkspresso — free plan]
- Linktree logo badge on your public page (removable only on paid)
- No custom branding (buttons and logo badge enforced)
- No email / lead capture integrations
- No scheduled links
- No advanced analytics

## Starter plan — $8/mo

Adds on top of Free:
- Remove Linktree branding (logo / badge)
- Email collection (lead capture) [source: talkspresso]
- Custom branding (logo, colours beyond theme palette)
- Advanced analytics (date-range filtering)
- Instagram automation (auto-pull latest posts as links)
- Third-party integrations (Mailchimp, Klaviyo, Google Sheets, etc.)
- **Seller fee reduced to 9%** on digital-product sales
  [source: talkspresso — price breakdown]
- Priority-ish support [unclear — tier differentiation
  not explicit on pricing page]

## Pro plan — $15/mo

Adds on top of Starter:
- Lead-generation and conversion tools (deeper forms, incentives)
  [source: talkspresso — features & pricing 2026]
- Unlocks the richer monetisation surface (tips, paid subscribers,
  affiliate catalogues at better terms) [source: biotree]
- Advanced link scheduling / time-sensitive link types
- Same 9% seller fee as Starter [source: talkspresso]
- Additional theme / customisation depth
- Google Analytics integration [source:
  https://linktr.ee/help/en/articles/5434201-google-analytics-integration]
  [unclear — whether this is Pro-only or Starter+; GA is historically
  Pro+ on Linktree]

## Premium plan — $35/mo

Marketed around **zero seller fees**:
- 0% transaction fees on digital-product sales (US) [source:
  thesocialcat.com quoting Linktree]
- All lower-tier features
- Priority support
- Possibly higher integration limits / team seats [unclear]
- Targets creators whose monthly sales × 9% > ($35 − $15) = $20 delta,
  i.e. roughly $222+/mo of digital sales would justify upgrade
  (ROI anchor)

## Enterprise tier

Custom-priced, sales-led; for agencies, record labels, large publishers
and multi-seat teams. Features referenced but not enumerated on the
public pricing page:
- SSO / SAML [unclear]
- Bulk-profile management (many Linktrees under one org)
  [source: daily-ads, creator-hero mention "agencies"]
- Admin user management enhancements [source:
  https://linktr.ee/help/en/articles/8609951-how-to-add-an-admin-user-to-manage-your-linktree]

## Transaction & seller fees (the hidden pricing)

| Plan     | Seller fee on digital products |
|----------|-------------------------------|
| Free     | 12% + processor               |
| Starter  | 9% + processor                |
| Pro      | 9% + processor                |
| Premium  | 0% + processor                |

Source: [talkspresso — Every plan & fee explained](https://talkspresso.com/blog/linktree-price-plans-breakdown)

Processor fees (Stripe/PayPal) are separate and typical
(2.9% + $0.30 US) [source: talkspresso].

## Discount / student / NGO pricing

- No publicly advertised student discount [unclear — confirm]
- No explicit NGO tier on public pricing page [unclear]
- Annual billing is the only public discount, ~20% off
- Enterprise is the negotiation path for large non-profits / agencies

## Anchor pattern & psychological framing

- **"Free forever" as the first column** — primary acquisition funnel
- **Pro highlighted as "Most popular"** or similar [unclear — 2026
  emphasis; historically Pro has been the emphasised tier]
- **Premium framed around ROI math** — zero fees is the headline feature,
  simple enough that creators can self-calculate break-even
- **Seller-fee ladder** (12% → 9% → 9% → 0%) is the real pricing lever,
  not the sticker price

## Scrape metadata

- Page scraped (indirect): April 2026 via third-party trackers
- Page scraped (direct): not possible (HTTP 403)
- Exact annual prices need Claude-in-Chrome confirmation pass

## Sources

- [Linktree pricing page (inaccessible via direct fetch)](https://linktr.ee/s/pricing)
- [SaaSworthy Linktree pricing April 2026](https://www.saasworthy.com/product/linktree/pricing)
- [talkspresso — Every plan & fee explained 2026](https://talkspresso.com/blog/linktree-price-plans-breakdown)
- [talkspresso — Linktree free plan 2026](https://talkspresso.com/blog/linktree-free-plan-pricing-features-2026)
- [talkspresso — Free vs paid 2026](https://talkspresso.com/blog/linktree-free-vs-paid-features-2026)
- [talkspresso — Features & pricing 2026](https://talkspresso.com/blog/linktree-features-pricing-2026)
- [GetApp Linktree](https://www.getapp.com/marketing-software/a/linktree/)
- [Capterra Linktree pricing](https://www.capterra.com/p/229171/Linktree/pricing/)
- [daily-ads — Linktree review 2026](https://daily-ads.com/blog/linktree-review-2026-is-it-still-worth-using-or-should-you-switch)
- [KHABY.AI — Linktree pricing 2026](https://khaby.ai/pricing/linktree/)
- [TechCrunch — monetization suite 2025](https://techcrunch.com/2025/04/23/linktree-rolls-out-a-suite-of-monetization-features-for-creators/)
