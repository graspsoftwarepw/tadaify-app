---
type: competitor-synthesis
project: tadaify
title: Tadaify feature mix — best-of-breed decision doc
created_at: 2026-04-24
author: orchestrator
status: in-progress
---

# Tadaify Feature Mix — Best-of-Breed Decision Doc

**Purpose:** final output of the competitor audit. One document that says, per feature area,
- which competitor's pattern we adopt as-is (`ADOPT`)
- which pattern we adapt (`ADAPT` — what to keep, what to change)
- which pattern we deliberately reject (`AVOID` — and why)
- what tadaify ships that none of the competitors have (`ORIGINATE`)

Populated incrementally as `patterns-library.md` fills up. Every decision here must cite a pattern ID (`PAT-NNN`).

Once stable → feeds `docs/BUSINESS_REQUIREMENTS.md` + `docs/TECHNICAL_REQUIREMENTS.md` in `tadaify-app` repo and updates open `DEC-SYN-NNN` entries in `tadaify-research-synthesis.md`.

## 1. Onboarding

### 1.1 Signup identity model — `ADAPT` Beacons (PAT-001), `AVOID` Stan (PAT-024, PAT-025)

**Decision:** username-first PROGRESSIVE signup, Beacons-style, with tadaify upgrades.

- [x] Handle claim before email/password — `PAT-001` (Beacons)
- [x] Live availability indicator (green check)
- [ ] Upgrade 1: 3 smart alternatives if taken (`waserek-pl`, `thewaserek`, `itswaserek`)
- [ ] Upgrade 2: live preview of future public URL below input in brand font (`tadaify.com/waserek` with `tada!ify` wordmark in header position)
- [ ] Upgrade 3: "Soft skip" — let visitor explore with auto-handle, claim later
- [ ] Upgrade 4: locale-aware suggestions (if email domain is PL → offer PL-friendly variants)
- [ ] Explicitly AVOID Stan's all-fields-at-once signup (PAT-024) — ship progressive
- [ ] Explicitly AVOID Stan's phone-mandatory (PAT-025) — phone collected only at Stripe Connect KYC / 2FA opt-in / SMS opt-in
- [ ] Dynamic `Hey @<handle> 👋` welcome header that mirrors live input (PAT-027)
- [ ] Unsaved-changes guard modal on nav-away (PAT-029)
- [ ] IP-geo country-code auto-default with `+1` US fallback (PAT-028) — never `+66`
- [ ] Social login: Google + Apple day 1, LinkedIn optional (PAT-026)

**Tadaify BR-candidate:** BR-ONBOARD-001 through BR-ONBOARD-004 (populate in tadaify-research-synthesis.md)

### 1.1.1 Guest-mode editor — `ADOPT` Carrd (PAT-067)

**Decision:** visitor can open tadaify editor and start building a mockup of their public page WITHOUT creating an account. Signup gate fires at `Publish` / `Claim handle` / `Save` click.

- [ ] Guest-mode editor at `tadaify.com/try` (or similar) — pre-loaded with a starter template + 3-4 sample product blocks
- [ ] Full editor functionality except publish / save to account / custom domain
- [ ] Local storage persists the guest session across browser reload (up to 7 days)
- [ ] `Publish` / `Save` → signup modal with 3 options: Google SSO / Apple SSO / Email
- [ ] Guest-session data auto-migrated to the new account on signup — nothing lost

### 1.2 Free tier vs trial — `ORIGINATE` against Stan (PAT-009 adapted)

**Decision:** ship a free tier with 0% platform fees. Stan's refusal to offer free is their acquisition hole.

- [ ] Free tier: unlimited products, unlimited sales, 0% platform fees (Stripe fee passthrough only)
- [ ] Free tier: tadaify-branded footer ("Powered by tadaify") — removeable on paid
- [ ] Paid tier: custom domain + email marketing + advanced analytics + no footer
- [ ] Price point TBD — see pricing decision below (§6)

## 2. Editor

### 2.1 Block types on day 1 — `ADOPT` Stan (PAT-012, PAT-022)

**Decision:** ship all 7 block types on day 1.

- [ ] `product` — paid digital/physical product with price, image, description, custom CTA (PAT-006)
- [ ] `community` — recurring subscription product
- [ ] `lead-magnet` — email capture for free download
- [ ] `affiliate-link` — external link with affiliate disclosure (PAT-011)
- [ ] `external-link` — unmonetized link (podcast, social, personal site)
- [ ] `section-header` — separator label block ("MY COURSES", "THINGS I LOVE (affiliate links)")
- [ ] `bundle` — compound product grouping multiple `product` children at a grouped price (PAT-022)

### 2.2 CTA customization per product — `ADOPT` Stan (PAT-006)

**Decision:** every block type supports a custom CTA label override.

- [ ] Default CTA: type-specific (`Get it for $97`, `Join community`, `Grab free download`, `Open link`)
- [ ] Override: plain-text input, 3-40 chars
- [ ] Character limit + emoji allowed (Stan example: `HAVE A RICH GIRL LAUNCH 💸`)

### 2.3 Block reorder UX — TBD

- [ ] Pattern capture pending (measure during editor audits)

## 3. Public page

### 3.1 Per-product rating surfacing — `ADAPT` Stan (PAT-007)

**Decision:** ship, but raise trust floor.

- [ ] Show rating only after 3+ reviews (Stan shows 5.0 from 1 review — trust-wash risk)
- [ ] Display: numeric 4.8/5.0 + star + review count ("4.8 from 47 reviews")
- [ ] Click-through to full reviews page per product (tadaify `ORIGINATE` — Stan doesn't have this)

### 3.2 URL model — `ADOPT` Stan (PAT-013)

**Decision:** `tadaify.com/<handle>` = creator hub; `tadaify.com/<handle>/p/<product-slug>` = per-product page. Both server-rendered for SEO + OpenGraph + Schema.org Product/Review markup.

- [ ] Per-product URLs SPA-routed for speed, SSR for crawlability
- [ ] OpenGraph per product (image = hero banner, title = product name, description = short copy)
- [ ] Schema.org `Product` + `AggregateRating` + `Review` markup for Google Shopping / rich results

### 3.3 Product detail page — `ADOPT` Stan (PAT-014, PAT-015, PAT-018, PAT-019)

**Decision:** product pages are first-class surfaces, not thumbnails.

- [ ] Desktop: 2-column split — sticky creator identity left (1/3), product content right (2/3) (PAT-014)
- [ ] Mobile: single-column drawer overlay over hub
- [ ] Content: hero banner image (per-product, separate from thumbnail), title, price, long-form rich-text description (PAT-015)
- [ ] Embedded social profile block (IG / TikTok / LinkedIn / YouTube / Twitter) — live follower count or screenshot fallback (PAT-019)
- [ ] Reviews rendered on page with verified-buyer badges (PAT-018)
- [ ] Back-arrow returns to hub without full page reload

### 3.4 Inline checkout (no Stripe redirect) — `ADOPT` Stan (PAT-016)

**Decision:** checkout renders on the product page itself. Stripe Elements / Payment Intent API + custom UI. No redirect to stripe.com.

- [ ] Name + email + discount code + ToS checkbox inline
- [ ] Total auto-recalcs on promo + upsell changes
- [ ] Card details render in Stripe Elements iframe within the checkout card
- [ ] Apple Pay / Google Pay supported on mobile (ORIGINATE beyond Stan's 1-Tap claim)
- [ ] PL/EU: VAT auto-calculated, visible as separate line item

### 3.5 Upsell / order bump — `ADOPT` Stan (PAT-017), default unchecked

**Decision:** one upsell per product, pre-PURCHASE checkbox, default unchecked.

- [ ] Creator configures one optional bonus product per product (admin UI)
- [ ] Buyer sees `Yes, add <bonus name> for $X ($Y value)` checkbox above PURCHASE
- [ ] Default unchecked (honesty — AVOID default-checked as sleazy)
- [ ] Available on Pro tier; Free tier does not ship this

### 3.6 Discount code visibility — `ADOPT` Stan (PAT-020)

**Decision:** promo code textbox always visible at checkout. No "have a code?" collapse.

## 4. Growth loops

### 4.1 Self-referral block on every public page — `ADOPT` Stan (PAT-008)

**Decision:** every tadaify public page ships with a `Powered by tadaify — get yours` block with the creator's referral code baked in.

- [ ] Default ON; toggle to remove available only on paid tier
- [ ] Paid tier: can hide; loses 10% kickback on any referred signup
- [ ] Commission: 10% of referred creator's first-year MRR (TBD — see pricing)

## 5. Landing marketing

### 5.1 Real creator stores as landing proof — `ADOPT` Stan (PAT-002)

**Decision:** ship from launch with 2-3 seeded demo creators visible + clickable on landing.

- [ ] Seed 2-3 demo-grade public stores before launch (pay creators if needed)
- [ ] Each card: portrait + name + handle + niche + direct `tadaify.com/<handle>` link
- [ ] Rotate/refresh quarterly

### 5.2 Dashboard screenshots as social proof — `ADOPT` Stan (PAT-003)

**Decision:** design constraint on admin UI — must be screenshot-worthy.

- [ ] Admin revenue view: hero-ready numbers + chart
- [ ] Product list view: clean enough to tweet
- [ ] Design system constraint: no `TEST DATA` watermarks, no dev tooling in prod admin

### 5.3 Single conversion path × 3 placements — `ADOPT` Stan (PAT-004)

**Decision:** one CTA label, three placements, zero copy variants.

- [ ] CTA label: `Claim tadaify.com/yourname` (handle-claim, stronger than Stan's generic `Continue`)
- [ ] Placements: hero + mid-page + footer + nav button
- [ ] A/B testing the label allowed post-launch; never ship two labels simultaneously

### 5.3.1 CTA copy — `ADOPT` Linktree `Sign up free` + `ORIGINATE` handle-claim

**Decision:** CTA copy is explicit free-tier handle-claim, stronger than Linktree's generic `Sign up free` and Stan's generic `Continue`.

- [ ] Primary CTA label: `Claim tadaify.com/yourname` or `Claim your handle — free`
- [ ] Secondary CTA: `Get started free` on mid-page sections
- [ ] Never: `Start trial`, `Try for free`, `Continue`

### 5.3.2 Audience-segments marquee ticker — `ADOPT` Linktree (PAT-036)

**Decision:** horizontal-scroll ticker of 20+ audience niches, PL-localized.

- [ ] 20-25 niches covering creators + small business + PL-specific segments
- [ ] Auto-scroll horizontal marquee, `prefers-reduced-motion` collapses to static grid
- [ ] Inclusive of PL creator niches: copywriterzy, trenerzy online, edukatorzy, mamy-blogerki, artyści AI

### 5.3.3 FAQ on landing — `ADOPT` Linktree (PAT-038)

**Decision:** 6-8 FAQ items as a landing section; AI-search extension post-MVP.

- [ ] MVP: 8 collapsed Q&A items covering monetization, reliability, cancellation, custom domain, EU VAT, data export
- [ ] Post-MVP: semantic search box over 40+ FAQs (ORIGINATE)

### 5.3.4 Hero photography style — `ADOPT` Linktree (PAT-035) MIX Stan (PAT-002, PAT-003)

**Decision:** mix 3 patterns for hero + scroll:
- Hero: lifestyle photography (real creator in setting, not device mockup)
- Section 2: live-rendered `tada!ify` wordmark preview as user types handle (ORIGINATE)
- Section 3: real public creator stores (Stan PAT-002)
- Section 4: admin dashboard screenshots (Stan PAT-003)

### 5.4 Pricing in nav — `ORIGINATE` against Stan (anti-PAT), `ADOPT` Linktree (confirms)

**Decision:** ship pricing in top nav. Stan's no-pricing-on-landing is a friction gap we exploit.

- [ ] Top nav: `Features`, `Pricing`, `Log in`, `Claim your handle`
- [ ] Pricing page live day 1

### 5.5 "Conversion feature" framing for every feature — `ADOPT` Stan (PAT-010)

**Decision:** every feature description on landing + docs speaks to the creator's P&L.

- [ ] Checkout: "1-tap checkout boosts your conversion by X%"
- [ ] Email: "Your first email campaign can recover 12% of cart abandons"
- [ ] Analytics: "Spot your bestseller in one click"
- [ ] Never: "smooth UX", "intuitive interface", "modern design" (empty phrases)

## 6. Pricing & paywalls

### 6.1 Tier structure — `ADAPT` Linktree (PAT-052 simplified) — 2-tier MVP, 3-tier Y1

**MVP Decision:** Free + Pro only. 3rd "Business" tier added at Y1 if creator segments justify.

| Tier | MVP price | Scope |
|---|---|---|
| **Free** | $0 forever | Link-in-bio ONLY — no digital products, no courses, no checkout. Limited customization, Tadaify footer present, 28-day analytics window. |
| **Pro** ⭐ | ~$10–15/mo (TBD) | Everything Free + commerce (digital products, bundles, communities, upsells) + 0% platform fees (Stripe passthrough only) + custom domain + email marketing + advanced analytics (365+ days) + no footer + priority support + AI features (volume-tiered) |

**Y1+ add:** **Business** tier (~$30/mo) — team seats, unlimited AI, Concierge onboarding, 4-hour SLA, team approval workflows, custom T&Cs.

**Pricing comparison (for context, not commitment):**
- Stan: $29 / $99 — NO free, trial-only
- Linktree: $0 / $6 / $12 / $30 — fee-ladder from 12% → 0%
- Beacons: $0 / $10 / $30 / $90 — 9% fees → 0%
- **Tadaify (proposed): $0 / ~$12 / $30 — 0% always on paid tiers, free excludes commerce**

### 6.1.1 Multi-currency — `ADOPT` Stan (PAT-021) + `ORIGINATE` buyer-locale switcher

**Decision:** multi-currency is MVP-critical, not Pro-tier deferred.

- [ ] Per-creator default currency — auto-set from Stripe Connect country on signup, manual override in settings
- [ ] All products on a creator's store render in their default currency
- [ ] ORIGINATE: buyer-locale detection → "Prices shown in £; switch to PLN?" prompt with live exchange rates (opt-in toggle for creator; creator sees both currencies in admin)

### 6.2 Transaction fees — `ADAPT` Stan positioning + `REJECT` Linktree fee ladder (PAT-043)

**Decision (refined 2026-04-24 post-Linktree-pricing audit):** 0% platform fees at every PAID tier. Free tier does NOT support commerce at all (no fees because no sales).

Rationale: Linktree's 12%→9%→9%→0% fee ladder is a brilliant self-upgrade engine but **conflicts with tadaify's "0% always" brand promise**. Our alternative architecture: **gate commerce behind paid**, keep "0% always" messaging pure on paid tiers.

**Architecture:**
- [ ] Free tier: unlimited links + basic customization + 28-day analytics. NO `product`, NO `community`, NO `bundle`, NO `lead-magnet` with payment. Only `external-link`, `affiliate-link` (uses creator's 3rd-party links), `section-header`, and a "Connect to sell" upsell card.
- [ ] Pro tier: all block types unlocked + 0% platform fees on ALL commerce + Stripe passthrough only
- [ ] Landing hero: "0% platform fees on every sale. Always. Free tier has zero fees because it's link-only."

**Upgrade driver:** instead of fee reduction (Linktree) or trial-to-paid (Stan), we use **feature gating on commerce itself** — creator hits paywall when they try to sell their first product, not when they're already selling.

### 6.2.1 7-day free Pro trial from Free account — `ADOPT` Linktree (PAT-046)

- [ ] One-click "Try Pro free for 7 days" button in Free dashboard
- [ ] No card collection required to start trial
- [ ] Auto-reverts to Free on trial end (creator can complete purchase during or after trial)
- [ ] Trial available once per account; post-trial creator can still upgrade manually

### 6.3 Support SLA published per tier — `ADOPT` Linktree (PAT-044)

- [ ] Free: 48h first-response
- [ ] Pro: 12h first-response
- [ ] Business (Y1): 4h first-response
- [ ] ORIGINATE: publish real-time SLA adherence on Trust Center (not just commitment)

### 6.4 Volume-tiered AI features — `ADOPT` Linktree (PAT-047)

- [ ] Free: 5 AI generations / month (AI-write-product-description, AI-write-page-copy)
- [ ] Pro: 100 AI generations / month
- [ ] Business (Y1): unlimited

### 6.5 Time-window + depth-tiered analytics — `ADOPT` Linktree (PAT-048, PAT-049)

- [ ] Free: 28-day window, Top 10 referrers/locations
- [ ] Pro: 365-day window, full referrer/location breakdown, lifetime totals
- [ ] Business (Y1): all-time + data export + UTM grouping

### 6.6 "Recommended" badge + annual-preselected toggle — `ADOPT` Linktree (PAT-045, PAT-033)

- [ ] Pro is badged `Most popular` or `Recommended` on pricing page (once we have 3 tiers)
- [ ] Monthly/Annual toggle with Annual pre-selected; 20%+ savings on Annual

## 7. Trust signals

### 7.1 FTC-compliant affiliate disclosure — `ADOPT` Stan (PAT-011)

- [ ] Every `affiliate-link` block auto-ships disclosure label
- [ ] Default label: "Things I love (affiliate links)" — customisable text, but disclosure badge non-removable

### 7.2 Verified Buyer badge on reviews — `ORIGINATE` against Stan (PAT-018 delta)

**Decision:** auto-generate `Verified Buyer ✓` badge on reviews from Stripe purchase record. Stan reviews appear creator-curated; we ship verifiable social proof.

- [ ] Buyer record links to review record
- [ ] Badge renders only when buyer has a confirmed Stripe charge for that product
- [ ] 7-days-post-purchase email flow requesting review
- [ ] Creator cannot approve a non-verified review as if it were verified
- [ ] Creator CAN moderate (hide) verified reviews but not fake attribution

### 7.3 Aggregated creator trust score at hub level — `ORIGINATE` against Stan

**Decision:** creator hub shows aggregated score across all products. Stan shows per-product ratings only.

- [ ] Hub header: "4.8 avg across 5 products · 230 reviews · since 2024"
- [ ] Paid tier: display customisable
- [ ] Requires minimum 10 reviews total before rendering (avoid 1-review trust-wash)

### 7.3.1 Public creator profile directory — `ADOPT` Linktree (PAT-040) with PL wedge

**Decision:** ship `tadaify.com/directory` with niche + language filter from day 1 (or near-MVP).

- [ ] All public creator stores indexed, browsable by niche + language
- [ ] PL-language filter as EU acquisition wedge (Linktree is English-only)
- [ ] SEO-optimized — each niche gets a canonical URL (`/directory/fitness-coaches`, `/directory/copywriterzy`)
- [ ] Creator can opt-out per-store

### 7.4 Uptime + SLA publication — `ORIGINATE` against whole category (Linktree partial confirms via PAT-039)

**Decision:** publish uptime status page + SLA commitments on day 1.

- [ ] `status.tadaify.com` — uptime + incident log
- [ ] SLA: first-response <4h, resolution <48h (Beacons' biggest gap on Trustpilot)
- [ ] Link in footer + in help-centre

## 8. Integrations

### 8.1 Open REST + webhook API — `ORIGINATE` against whole category (PAT-055)

**Decision (corrected 2026-04-24 post-Marketplace audit):** public creator API documented from day 1. Linktree has a partner-gated developer program; Stan + Beacons have none. Tadaify wedge = **self-serve, documented, free to developers**.

- [ ] REST endpoints for products / orders / analytics / email list
- [ ] Webhooks for order.created / order.refunded / product.created / lead.captured
- [ ] API keys from creator dashboard (self-serve, not partner-application-gated)
- [ ] Public OpenAPI 3.1 spec
- [ ] Public docs at `developers.tadaify.com` with code samples (JS, Python, Ruby, curl)
- [ ] Free tier: 1k API calls/month; Pro: 10k; Business: 100k

### 8.2 Two-tier integration architecture — `ADOPT` Linktree (PAT-053)

**Decision:** distinguish lightweight `Link Apps` from deep `Integrations`.

- [ ] **Link Apps** — native embed blocks rendering partner content inline (Spotify, YouTube, TikTok video, Instagram post, Twitch stream, Calendly widget, etc.). Cheap to add (iframe / oEmbed / partner API). MVP: 10-15 Link Apps.
- [ ] **Integrations** — OAuth-connected data bridges (Shopify products sync, Mailchimp subscriber sync, Google Analytics pixel, Stripe Connect). Expensive to add; MVP: 3-5 deep integrations.
- [ ] URL convention: `/marketplace/apps/<slug>` + `/marketplace/integrations/<slug>` mirrors Linktree convention

### 8.3 Intent-categorized marketplace — `ADOPT` Linktree (PAT-054)

- [ ] Categories: Share your content / Make money / Grow your audience / All
- [ ] Search box on marketplace (Linktree has it)
- [ ] Deep-linkable category URLs for SEO (`/marketplace/categories/share-content`, etc.)

### 8.4 Zapier from day 1 — `ADOPT` (PAT-056)

**Decision:** ship Zapier webhook integration day 1; instantly get 5000+ apps as "tadaify integrations".

- [ ] Zapier triggers: new_order, new_subscriber, new_product, new_review
- [ ] Zapier actions: create_product, send_email, apply_discount
- [ ] Webhook URL surfaced in creator's Pro dashboard; no Zapier account required from tadaify side — creator connects their own

## 9. EU/PL-specific wedge — `ORIGINATE`

## 9. EU/PL-specific wedge — `ORIGINATE`

**Decision:** ship with PL creator wedge visible on landing + GDPR/VAT baked in.

- [ ] At least 1 PL creator card on landing (or 1 EU creator)
- [ ] GDPR data export + delete surfaces (mandatory per global CLAUDE.md)
- [ ] VAT handling: auto-calculate EU VAT on physical + digital products
- [ ] PL localisation of UI day 1, tagline PL version (deferred per brand-lock §6)

## 9.5 Template gallery (editor + landing) — `ADOPT` Linktree (PAT-057, PAT-058) + `ORIGINATE` public previews (PAT-059)

**Decision:** MVP templates library with 8-12 named designs, PL-culture naming, public previews (no login).

- [ ] 8-12 templates across 6 niches: Kreator / Fitness / Moda / Muzyk / Small business / Sport
- [ ] Naming: Polish culture/geography — Chopin / Kopernik / Skłodowska / Kraków / Tatra / Wisła / Bałtyk / Mickiewicz (brand-locale signature)
- [ ] Each template gets public preview URL `tadaify.com/t/<name>` viewable WITHOUT login — indexable, shareable
- [ ] Category-filtered browse page `/templates` + category sub-pages (`/templates/kreator`, etc.)
- [ ] Search box on template gallery
- [ ] Template applies as "starter blocks" on signup — editable after apply, not locked-snapshot

## 9.6 AI features — `ADOPT` Beacons (PAT-065) + `ORIGINATE` AI diff-approval UX

**Decision:** 3 AI features on landing MVP, scale to 7+ Y1. Volume-tiered (§6.4). AI with approval diffs (ORIGINATE against Beacons's black-box).

- [ ] MVP AI features (3):
  - AI write-product-description (generate from product title + category + price)
  - AI write-page-copy (headline, tagline, intro paragraph from handle + niche)
  - AI generate-image-thumbnail (simple gradient + typography composition, not full image gen)
- [ ] Pro MVP volumes: 5 free / 100 Pro / unlimited Business (§6.4)
- [ ] ORIGINATE: every AI generation shows "before → after" diff with approve / regenerate / edit-manually buttons (Beacons ships black-box; we ship transparent)
- [ ] Y1+ additions: AI audience insights, AI email subject lines, AI automated responses, AI content calendar

## 9.7 "Ask AI about tadaify" footer — `ADOPT` Beacons (PAT-060) + bilingual

**Decision:** pre-authored LLM queries in footer, PL + EN versions.

- [ ] Footer row: `Ask AI about tadaify` + 5 assistant icons (ChatGPT, Claude, Gemini, Perplexity, Grok)
- [ ] Each link pre-fills a query: `Explain tadaify (tadaify.com) for creators: what it is, what I can build, how monetization works, setup steps, and how it compares to Linktree, Stan Store, and Beacons.`
- [ ] Second row (PL version): `Zapytaj AI o tadaify` + `Wyjaśnij tadaify dla twórców w języku polskim: co to jest, jak działa sprzedaż, czym różni się od Linktree / Stan Store / Beacons.`

## 9.8 BNPL (buy-now-pay-later) — `ADOPT` Beacons (PAT-063), Y1+

**Decision:** Stripe Klarna + Affirm integration on Pro tier, Y1+. Not MVP.

- [ ] Creator can enable BNPL per product (for products >$50)
- [ ] Buyer sees "3 payments of $X via Klarna" on checkout
- [ ] Creator still gets full price upfront; Klarna/Affirm handle buyer credit

## 9.9 Payout speed as differentiator — `ADOPT` Beacons (PAT-066)

**Decision:** use Stripe Express Connect for 1-day payouts; surface on landing.

- [ ] Creator onboarding: Stripe Express Connect (1-day payout to creator bank account)
- [ ] Landing copy: "Cash out in 1 day" or "From buyer to your bank in 24 hours"
- [ ] Display on pricing page as feature

## 9.10 Audience-persona tabs in hero — `ADOPT` Taplink (PAT-075)

**Decision:** interactive tab component in hero with 4 PL-localized personas.

- [ ] Tabs: `Twórcy` / `Edukatorzy` / `Usługi` / `Sklepy` (or analogous)
- [ ] Each tab shows persona-specific headline + 3-4 sub-niches + CTA
- [ ] Default tab: `Twórcy`
- [ ] Below tabs: shared handle-claim form + "Claim tadaify.com/yourname" CTA (persona-independent)

## 9.11 Countdown timer block — `ADOPT` Taplink (PAT-076), Pro tier

**Decision:** creator-configurable countdown timer as product block Pro-tier feature.

- [ ] Block config: end date/time, post-expiry behavior (hide block / show "expired" state / redirect to replacement product)
- [ ] Rendered as subtle overlay on product card, not platform-wide scarcity UI
- [ ] Opt-in per product (avoid sleaze-by-default)

## 9.12 "Our cores" values section — `ADAPT` Lnk.bio (PAT-072) for PL-culture

**Decision:** dedicated landing section signaling tadaify values.

- [ ] Values list: Polski niezależny biznes / No data resale / Fair wages + work-life balance / Supports PL creators in EU / Transparent pricing always / No dark patterns
- [ ] Visual: compact icon row (like Lnk.bio's) — low scroll weight
- [ ] Placement: between product section and pricing section on landing
- [ ] Localized: EN version for international visitors, PL version for PL IP

## 9.13 GDPR-compliant cookie consent — `ADOPT` Lnk.bio (PAT-078)

**Decision:** granular cookie consent with explicit Accept all / Reject non-necessary buttons.

- [ ] Banner lists cookie categories (Strictly necessary / Analytics / Marketing / Preferences)
- [ ] Per-category toggle
- [ ] `Accept all` + `Reject non-necessary` + `Manage preferences` buttons
- [ ] Persistent preferences accessible from footer `Cookie settings` link
- [ ] MUST for EU/PL launch

## 10. Explicit avoids

- `AVOID` Stan's `·` middle-dot separator — we locked variant F `tada!ify` (DEC-025)
- `AVOID` Stan's dead-item nav (`Blog` as text) — ship with zero dead items
- `AVOID` Stan's `Our Mission` over `Features`/`Pricing` in top nav — too aggressive for unknown brand
- `AVOID` Stan's no-free-tier — acquisition hole we exploit
- `AVOID` Linktree's custom-domain-only-on-paid (confirmed via desk-research) — we ship custom domain at or below Beacons' $10 anchor

## Open decisions (to resolve once audit complete)

- [ ] PRICING-TIERS — final $ per tier
- [ ] BLOCK-REORDER-UX — drag vs arrow vs autosave-on-move
- [ ] URL-MODEL — slash-handle (`tadaify.com/waserek`) vs subdomain (`waserek.tadaify.com`) vs both
- [ ] CHECKOUT-UI — Stripe embed vs redirect vs iframe
- [ ] EMAIL-CRM-DEPTH — full builder vs Zapier-bridge only (MVP decision)
- [ ] TEAM-SEATS — does MVP ship multi-user or solo-creator only
