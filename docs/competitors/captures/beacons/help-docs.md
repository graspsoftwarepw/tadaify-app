---
type: competitor-research
project: tadaify
competitor: beacons
title: Beacons.ai — help centre / knowledge base scan
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-1
source: desk-research
status: draft
---

# Beacons.ai — help centre / knowledge base scan

## Index

- Root: `https://help.beacons.ai/en`
- Product + app pages: `https://beacons.ai/i/app-pages/*`
- Support contact surface: `https://beacons.ai/support`
- Announcement blog: `https://beacons.ai/i/blog/*`
- FAQ on plans page: `https://beacons.ai/i/plans`

## Category structure (direct fetch 2026-04-24)

| Category | Articles | Functional area |
|----------|----------|-----------------|
| FAQ 📚 | 12 | Onboarding, general |
| Beacons Link-in-Bio and Website 🔗 | 35 | Editor, layouts, sharing |
| Custom Domains ✨ | 6 | Domain setup / DNS / verification |
| Products 💰 | 48 | Monetisation — storefront, payouts, refunds |
| Brand Commission Affiliate 💸 | 7 | Affiliate catalogue, payout setup |
| Brand Collabs 💸 | 19 | Brand deals, rate cards, invoicing |
| Beacons Email Marketing 📧 | 13 | Sends, automations, segments |
| Smart Reply 🎩 | 7 | IG DM automation |
| Beacons Audience 📥 | 9 | Email list / audience management |
| Referrals 👯 | 4 | Creator referral programme |
| Settings ⚙️ | 13 | Account configuration |
| Beacons for Managers 😎 | 5 | Team / manager permissions |
| Safety and Security 🚨 | 3 | Account protection |

**Total ~181 articles**, weighted heavily toward Products /
Monetisation. That imbalance alone signals Beacons' strategic focus:
this is a commerce platform wearing a link-in-bio shirt.

Source: direct fetch of [https://help.beacons.ai/en](https://help.beacons.ai/en)

## Articles of strategic interest (surfaced via search)

- "Why is Beacons the most powerful Link in Bio for Creators?"
  [source: https://help.beacons.ai/en/articles/4705473] — effectively a
  sales-y positioning page inside the KB
- "Sharing My Beacons Link in Bio Page"
  [source: https://help.beacons.ai/en/articles/4697409]
- "Design your Page 🎨"
  [source: https://help.beacons.ai/en/articles/4697153] —
  customisation guide covering fonts, buttons, backgrounds

## Group by functional area (tadaify research lens)

### Onboarding
- "Less than 5 minutes" setup claim surfaces in FAQ on plans page
- Signup → template pick → prefill links → publish [inferred from
  product descriptions; needs live audit to confirm exact flow]
- "FAQ 📚" category hosts the new-user articles (12 items)

### Editor
- "Beacons Link-in-Bio and Website 🔗" — 35 articles on blocks,
  layouts, themes, reordering
- "Design your Page 🎨" — customisation details (1024+ fonts,
  backgrounds including video/image upload, block shape / shadow /
  outline / transparency)
- **No custom CSS/HTML** — explicitly flagged by
  [digitalsoftwarelabs review](https://digitalsoftwarelabs.com/ai-reviews/beacons-ai/):
  "CSS/HTML access is not available, so you're locked into the
  platform's design structure"

### Monetisation / Payments
- "Products 💰" (48 articles) — largest category by far
- Covers: digital product uploads, inventory, payouts, refunds,
  reviews, physical products, courses, memberships, subscriptions
- Payout processors: Stripe + PayPal [source: reviewer synthesis —
  Beacons uses Stripe Connect under the hood; confirm in live article]

### Analytics
- No dedicated "Analytics" category in the KB — analytics articles are
  spread across "Link-in-Bio and Website" and "Products"
- Advertises "real-time analytics", "advanced traffic analytics",
  "post performance across platforms"
  [source: `/i/plans` + reviewer paraphrases]
- "Custom AI-powered reports" on higher tiers [source: jotform.com/blog
  quote]

### Integrations
- "Announcing the Integration Block"
  [https://beacons.ai/i/blog/announcing-the-integration-block]
  documents the extensible integration surface
- Named partners in the launch: **Laylo, QuikPlace, Split, Ko-fi**
- Additional partners "rolling out weekly" per announcement
- Standard payment integrations: Stripe, PayPal
- Inferred: Shopify (via TikTok how-to articles referencing Shopify
  connection), Mailchimp, Zoom [source: multiple reviews]

### Admin / Team
- "Beacons for Managers 😎" — 5 articles specifically for agency /
  management-company users who run multiple creator accounts
- "Settings ⚙️" — 13 articles covering account-level configuration
- Multi-seat model exists [unclear — exact seat limits per tier;
  Creator Max mentions team features]

### API / Developer
- **No public developer documentation** in the help centre
- `beacons.ai/api`, `beacons.ai/apis`, `beacons.ai/developer.com` URLs
  exist but appear to be routing stubs / marketing placeholders, not
  actual developer portals [source: search-surfaced; verify in
  api-public.md]

### Migrations / Import / Export
- **No first-party import from Linktree / Carrd / Bio.link** surfaced in
  help centre [unclear — Beacons historically advertised "import from
  Linktree in minutes" as a marketing hook; confirm 2026 status]
- Data export surface [unclear — GDPR compliance suggests it exists but
  help article not surfaced in search]

### GDPR / Privacy / Safety
- "Safety and Security 🚨" (3 articles) — smallest KB category
- Content moderation / account protection
- Takedown process [unclear — Beacons has had takedown volume per
  Pissed Consumer complaints, so articles likely exist]

## Documented limits / quotas / rate limits

- **AI credits**: metered daily (30 / 300 / unlimited) per tier
  [source: `/i/plans`]
- **Email sends**: metered monthly (50 / 500 / unlimited)
- **Website pages**: 1 / 1 / 3 / 10-per-site × 10-sites
- **Digital products**: unlimited on all tiers
- **Memberships / courses**: limited to "1 course" on Free and
  Creator; unlimited on Creator Plus+
- **Video hosting**: only on Creator Max [source: `/i/plans`]
- **API rate limits**: [unclear — no public API]

## Hidden features surfaced only through docs or blog

- **Integration Block** — a single block type that embeds any partner
  integration inline (not just a link-out) [source:
  announcement blog]
- **Ko-fi donation panel** inline on Beacons page (not just a link)
  [source: announcement blog]
- **Gated access / video pitch upload** for brand deals (Creator Plus+)
  — creators can pitch brands with video and gate access until the
  brand accepts [source: `/i/plans`]
- **Buy Now Pay Later** via Klarna + Affirm on Creator Plus+ stores
  [source: `/i/plans`]
- **"Beam"** — branded AI teammate; the reason for AI credit metering
  [source: `/i/plans` FAQ]
- **Physical NFC card** on Creator Max — branded physical object that
  opens the Beacons page on tap [source: `/i/plans`, KHABY.AI review]

## Known issues / complaints referenced

- Subscription cancellation friction — multi-step surveys [source:
  autoposting.ai/beacons-ai-review/]
- Unreliable support in 41% of negative reviews [source: autoposting
  quoting 847-review sample]
- Affiliate payouts "pending for over one year" [source: same]
- Phone number to contact support not surfaced on beacons.ai proper;
  only Pissed Consumer lists `+1 415-843-2267`

## Support channel summary

- Help centre (self-serve)
- Email: `sup@beacons.ai` / `support@beacons.ai`
- Social DMs: X, LinkedIn, Instagram
- In-app chat [unclear — likely on paid tiers]
- <6h SLA on Creator Max tier (priority support) [source: `/i/plans`]
- White-glove onboarding on Creator Max (human-led)

## Sources

- [Beacons help centre — direct fetch](https://help.beacons.ai/en)
- [Beacons plans page — direct fetch](https://beacons.ai/i/plans)
- [Announcing the Integration Block — direct fetch](https://beacons.ai/i/blog/announcing-the-integration-block)
- [Customizing your page blog](https://beacons.ai/i/blog/customizing-your-page)
- [Enabling visitor support blog](https://beacons.ai/i/blog/enabling-visitors-to-support-your-content)
- ["Why is Beacons the most powerful..." article](https://help.beacons.ai/en/articles/4705473)
- [Sharing My Beacons Link in Bio Page](https://help.beacons.ai/en/articles/4697409)
- [Design your Page 🎨](https://help.beacons.ai/en/articles/4697153)
- [Products 💰 category](https://help.beacons.ai/en/categories/1087105)
- [digitalsoftwarelabs — Beacons AI review](https://digitalsoftwarelabs.com/ai-reviews/beacons-ai/)
- [autoposting.ai — Beacons AI review](https://autoposting.ai/beacons-ai-review/)
