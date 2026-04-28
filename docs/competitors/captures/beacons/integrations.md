---
type: competitor-research
project: tadaify
competitor: beacons
title: Beacons.ai — integrations catalogue
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Beacons.ai — integrations catalogue

## Architecture: the Integration Block

Beacons' integration model is **inline-embed-first** rather than
link-out-first. It surfaces via the **Integration Block** — a single
block type in the page editor that renders interactive partner content
inline. Source: [Announcing the Integration
Block](https://beacons.ai/i/blog/announcing-the-integration-block) on
beacons.ai blog.

The announcement names four launch partners:
1. **Laylo** — fan contact capture + messaging
2. **QuikPlace** — influencer profile cards with offer + pricing
3. **Split** — commissionable-product showcase with shared commissions
4. **Ko-fi** — donation panel with direct tips to Ko-fi account

The announcement commits to "additional integrations rolling out
weekly" — implying a pipeline of partners [source: same blog post].

## Full integration surface (synthesised April 2026)

### Payments & commerce
- **Stripe** — primary processor for Store (digital products, courses,
  memberships) [source: multiple reviews, confirmed by the
  Zapier cross-connector
  https://zapier.com/apps/beacon/integrations/stripe]
- **PayPal** — alternative processor [source: reviews]
- **Klarna + Affirm (Buy Now Pay Later)** — on Creator Plus+
  [source: direct fetch `beacons.ai/i/plans`]
- **Shopify** — creators can connect a Shopify store to sell
  physical + digital products alongside Beacons-native products
  [source:
  https://zapier.com/apps/beacon/integrations/shopify,
  https://www.tiktok.com/discover/how-to-connect-a-beacons-website-to-shopify]

### Social platforms
- **Instagram** — auto-pull feed, DM automation (Smart Reply) via
  Meta Graph API [source: `/i/plans` + help-centre "Smart Reply 🎩"
  category]
- **TikTok** — feed pull, commerce-block integrations
  [source: product-page marketing]
- **YouTube** — video embed, latest-video auto-pull
- **X / Twitter** — trusted-by listed [source: `/i/plans` FAQ]
- **Facebook** — trusted-by listed

### Email & marketing
- **Mailchimp** — referenced across reviewer posts
  [unclear — exact integration mechanism, may be via Zapier vs
  native]
- **Native Beacons Email Marketing** — because Beacons HAS its own
  email product, reliance on external ESPs is less critical than for
  competitors
- **Audience export** — [unclear — confirm export-to-CSV / ESP works
  from free tier]

### Donation / tipping
- **Ko-fi** — inline via Integration Block
- Beacons' own "Tips" feature (creators can collect tips natively)
  [source: /i/blog/enabling-visitors-to-support-your-content]

### Scheduling / booking
- **Zoom** — referenced in third-party review syntheses
  [unclear — verify integration depth]
- **Multiple calendar sync** on Creator Plus+ [source: `/i/plans`]
  — likely Google Calendar / Outlook / Apple Cal
  [unclear — enumerate]

### Affiliate / brand-deals
- **12,000 brand partners** — Beacons' own affiliate catalogue,
  creators drop-in products rather than applying to each brand
  individually [source: `/i/plans`]
- **Split** — commissionable-product showcase inline (Integration Block
  launch partner)
- **QuikPlace** — influencer profile marketplace (launch partner)

### Automation / general
- **Zapier** — cross-connections documented on Zapier
  [source: https://zapier.com/apps/beacon/integrations]
  [unclear — this may refer to a different "Beacon" CRM product, not
  beacons.ai; Zapier directory has both a "Beacon" and a "Beacons"
  entry and the search result set mixed them. Verify live.]

### Fan engagement
- **Laylo** — contact capture + messaging (Integration Block)
- **Smart Reply** (native) — IG DM automation

## Integration paid-tier gating (synthesised)

| Integration | Free | Creator | Creator Plus | Creator Max |
|-------------|------|---------|--------------|-------------|
| Stripe / PayPal (store) | ✓ 9% fee | ✓ 9% fee | ✓ 0% fee | ✓ 0% fee |
| Shopify connect | [unclear] | ✓ | ✓ | ✓ |
| Klarna / Affirm BNPL | ✗ | ✗ | ✓ | ✓ |
| Integration Block (Laylo/QuikPlace/Split/Ko-fi) | [unclear — likely all tiers] | ✓ | ✓ | ✓ |
| IG DM automation (Smart Reply) | Entry only | Unlimited | Unlimited | Unlimited |
| Mailchimp (ESP bridge) | [unclear] | ✓ | ✓ | ✓ |
| Calendar sync | [unclear] | [unclear] | Multiple | Multiple |
| Zoom | [unclear] | ✓ | ✓ | ✓ |

## OAuth / API / embed mechanisms

- Payment processors: Stripe Connect-style OAuth
- Social platforms: OAuth via Meta Graph / TikTok API / YouTube Data
  API
- Integration Block partners: each maintains their own OAuth; Beacons
  renders partner UI inline via partner-provided iframe or JS SDK
- Custom-domain: DNS-level (CNAME / A record) setup
  [source: Custom Domains ✨ help-centre category, 6 articles]

## Co-marketing / mutual partnerships

- **Ko-fi** — mutual (both directions; Ko-fi also offers its own
  "feature your links" surface)
- **Shopify** — Beacons is listed as an embed option in creator-
  monetization guides (not a Shopify App Store app AFAICT —
  [source: not surfaced; verify live])
- **Laylo, QuikPlace, Split** — dedicated partners with co-marketing
  in the Integration Block launch post; Beacons is the featured
  integration for each of them on their sides [unclear — verify
  partner directories]

## Gaps vs competitors

- **No Substack / Beehiiv native** [unclear — check 2026]
- **No Notion inline embed** [unclear]
- **No Discord / Slack community integration native**
  [unclear]
- **No Zapier-first-class depth** (Zapier's "Beacons" entry has
  limited triggers; compared to Linktree, Beacons' Zapier footprint
  seems thinner — although the naming collision with the CRM-Beacon
  makes this hard to confirm remotely)
  [unclear — verify]
- **No public webhook catalogue for creators**

## Integrations by the numbers

Beacons runs a growing Integration Block partner pipeline. At launch
(April 2024-ish) they shipped 4 partners; as of April 2026 the
exact count is [unclear — "rolling out weekly" for 24+ months
suggests dozens of partners]. A live audit of `beacons.ai/i/blog/*`
would enumerate each announcement.

## Sources

- [Announcing the Integration Block](https://beacons.ai/i/blog/announcing-the-integration-block)
- [Enabling visitor support](https://beacons.ai/i/blog/enabling-visitors-to-support-your-content)
- [Beacons plans page — direct fetch](https://beacons.ai/i/plans)
- [Beacons help centre](https://help.beacons.ai/en)
- [Zapier — Beacon × Stripe integration](https://zapier.com/apps/beacon/integrations/stripe)
- [Zapier — Beacon × Shopify integration](https://zapier.com/apps/beacon/integrations/shopify)
- [Zapier — Beacon integrations directory](https://zapier.com/apps/beacon/integrations)
- [TikTok — connect Beacons website to Shopify how-to](https://www.tiktok.com/discover/how-to-connect-a-beacons-website-to-shopify)
- [digitalsoftwarelabs — Beacons AI review](https://digitalsoftwarelabs.com/ai-reviews/beacons-ai/)
- [entrepreneurs.ng — Beacons AI review](https://entrepreneurs.ng/beacons-ai-review/)
