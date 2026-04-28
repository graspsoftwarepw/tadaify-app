---
type: competitor-synthesis
project: tadaify
title: Cross-competitor UI pattern library
created_at: 2026-04-24
author: orchestrator
status: in-progress
---

# Cross-competitor Pattern Library — tadaify

Living document. Every time the audit surfaces a pattern (onboarding flow, editor block, monetization UI, conversion CTA copy, trust-signal placement, etc.) it lands here with:

- `ID` — short kebab-case
- `Pattern` — 1-sentence description
- `Seen in` — which competitors ship it
- `Variants` — how each one does it differently
- `Strategic value` — why it matters
- `Verdict` — `ADOPT` / `ADAPT` / `AVOID` / `NEUTRAL`
- `Tadaify note` — our take (what we take, what we leave)

Once populated, this feeds `tadaify-feature-mix.md` (final decision doc).

## Tagging

Each pattern gets one primary tag:
- `onboarding` · `editor` · `public-page` · `monetization` · `analytics` · `email-crm` · `landing-marketing` · `growth-loops` · `trust-signals` · `admin-ui` · `paywall-gating` · `integrations`

## Patterns

### PAT-001 — Username-first signup (handle before credentials)

- **Pattern:** claim handle BEFORE email/password; live availability indicator
- **Seen in:** Beacons (BCN-001), Linktree (LT-001 adjacent)
- **Variants:**
  - Beacons: username input with `beacons.ai/` prefix + green-check availability + single `Next` button → then email/password
  - Linktree: email/Google signup first, handle on second screen
- **Strategic value:** pre-commits visitor to identity, reduces "blank canvas" abandonment
- **Verdict:** `ADOPT` (with upgrade — see tadaify-feature-mix)
- **Tag:** `onboarding`
- **Tadaify note:** adopt Beacons pattern + add 3 smart alternatives if taken + preview of live public URL `tadaify.com/yourname` in brand font below input

### PAT-002 — Real public stores as landing social proof

- **Pattern:** landing page links directly to live creator pages, not mockups; visitor audits product pre-signup
- **Seen in:** Stan Store (STS-001)
- **Variants:** Stan ships 5 creator cards (name + handle + follower count + niche + `stan.store/<handle>` link); Linktree/Beacons use figma mockups
- **Strategic value:** trust play — visitor verifies the product works before committing. Trust gap Linktree/Beacons leave open.
- **Verdict:** `ADOPT`
- **Tag:** `landing-marketing`, `trust-signals`
- **Tadaify note:** ship from launch with 2-3 seeded demo stores; pay creators if needed to maintain live demos

### PAT-003 — Dashboard screenshots as social proof

- **Pattern:** testimonial tiles overlay raw Stan admin UI (revenue chart, dashboard totals `$32,012`, growth curves `$1,716,041.00 lifetime`)
- **Seen in:** Stan Store (STS-001 testimonials block)
- **Variants:** Stan exclusively; Linktree/Beacons sanitize to figma
- **Strategic value:** social proof + product demo in one tile
- **Verdict:** `ADOPT` — but as design constraint on admin UI, not just marketing decision
- **Tag:** `trust-signals`, `admin-ui`
- **Tadaify note:** admin revenue/product views must be screenshot-worthy on day 1 — constrain design system accordingly

### PAT-004 — Single conversion path × multiple placements

- **Pattern:** one CTA verb repeated 3× on the landing (hero + mid + footer), no A/B visible copy variants
- **Seen in:** Stan Store (`Start My Trial` / `Continue →` all land same place)
- **Variants:** Linktree = 5+ CTAs with varying copy; Beacons = 2-3 CTAs
- **Strategic value:** conversion clarity, lower decision friction
- **Verdict:** `ADOPT` — replace CTA verb with handle-claim ("Claim tadaify.com/yourname")
- **Tag:** `landing-marketing`

### PAT-005 — Middle-dot `·` separator as brand rhythm

- **Pattern:** typographic separator `·` used consistently across marketing copy (`All·in·One`, `Not just another link·in·bio`)
- **Seen in:** Stan Store
- **Strategic value:** ownable brand-rhythm signal
- **Verdict:** `AVOID` for tadaify — we already locked variant F (`tada!ify` with single hyphen + bound tail) per DEC-025; adopting `·` now would be trend-following
- **Tag:** `landing-marketing`

### PAT-006 — Custom-labeled CTA per product

- **Pattern:** each product block on a public page has a creator-written CTA label — not "Buy Now"
- **Seen in:** Stan Store public page (Abigail Peugh: `Join My Community`, `TAP HERE TO GRAB IT`, `GRAB IT HERE`, `HAVE A RICH GIRL LAUNCH`, `START SELLING MORE`)
- **Strategic value:** personalization ladder — creator's voice shines through, raises conversion on tribal-audience stores
- **Verdict:** `ADOPT`
- **Tag:** `editor`, `public-page`
- **Tadaify note:** editor lets creator override default CTA ("Buy") per product block; smart default = "Get it for $X"

### PAT-007 — Per-product star rating visible on public page

- **Pattern:** numeric rating (`5.0`) shown next to price on each product block
- **Seen in:** Stan Store public page (Abigail Peugh first 2 products)
- **Variants:** Stan shows `5.0` + star icon; rating seems to appear only on products with ≥1 review
- **Strategic value:** product-level social proof separate from platform rating
- **Verdict:** `ADAPT` — ship it, but require minimum 3 reviews before showing (avoid "new product, 5.0 from 1 review" trust-wash)
- **Tag:** `public-page`, `trust-signals`

### PAT-008 — Self-referral affiliate block on every public page

- **Pattern:** creator's public store includes an affiliate card `Get your own Stan Store!` — built-in viral acquisition loop
- **Seen in:** Stan Store public page (Abigail Peugh, presumably all creator stores)
- **Strategic value:** every creator's audience becomes an acquisition channel; Stan pays out referral → creator has incentive to keep the block live
- **Verdict:** `ADOPT`
- **Tag:** `growth-loops`
- **Tadaify note:** default ON for every creator; toggle OFF available but lose the commission if disabled. Critical for $0 paid acquisition strategy.

### PAT-009 — "Not just link-in-bio" positioning

- **Pattern:** Stan explicitly distances itself from link-in-bio category despite discoverability depending on it
- **Seen in:** Stan Store (`Not just another link·in·bio🚀` section)
- **Strategic value:** unlocks higher pricing ($29-99/mo) vs link-in-bio anchored-to-free category
- **Verdict:** `ADAPT` — tadaify plays storefront-axis BUT keeps free tier (hits Stan's refusal-to-offer-free gap)
- **Tag:** `landing-marketing`, `paywall-gating`

### PAT-010 — "1-Tap Checkout = conversion feature" framing

- **Pattern:** checkout UX described as revenue outcome for creator, not UX for buyer
- **Seen in:** Stan Store landing
- **Strategic value:** speaks to creator's P&L, not buyer's convenience; inverts standard SaaS language
- **Verdict:** `ADOPT` — apply to all tadaify feature copy (emails → "x% more opens", analytics → "spot your bestsellers in 1 click", etc.)
- **Tag:** `landing-marketing`

### PAT-011 — Affiliate links grouped under FTC-friendly label

- **Pattern:** public page groups affiliate products under explicit "THINGS I LOVE (affiliate links)" label
- **Seen in:** Stan Store public page (Abigail Peugh)
- **Strategic value:** FTC compliance + creator honesty = higher trust
- **Verdict:** `ADOPT`
- **Tag:** `editor`, `trust-signals`, `public-page`
- **Tadaify note:** ship a typed `affiliate-section` block; forces disclosure label

### PAT-012 — Mixed monetization block types

- **Pattern:** single public page hosts paid products + free lead magnets + affiliate links + external links (podcast, email capture) without visual jarring
- **Seen in:** Stan Store (Abigail Peugh: 5 paid products, 1 freebie, 4 affiliates, podcast external, content-tools bundle)
- **Strategic value:** creator doesn't need 2 tools; single page serves full funnel
- **Verdict:** `ADOPT`
- **Tag:** `editor`, `public-page`
- **Tadaify note:** block types we must support on day 1: `product`, `community` (subscription), `lead-magnet` (email capture), `affiliate-link`, `external-link` (incl. podcast / social), `section-header` (separator label)

### PAT-013 — Per-product vanity URL `/handle/p/slug`

- **Pattern:** each product has its own shareable SPA-routed URL under the creator's hub
- **Seen in:** Stan Store (`stan.store/abigailpeugh/p/ig-growth-for-sales-2025`)
- **Variants:** Linktree — redirects only (no per-product pages); Beacons — TBD
- **Strategic value:** creators share product URLs to social/email, not hub URL. Product IS the campaign asset.
- **Verdict:** `ADOPT`
- **Tag:** `public-page`, `growth-loops`
- **Tadaify note:** `/<handle>/p/<slug>` server-rendered for SEO + OpenGraph + Schema.org markup. MVP-critical.

### PAT-014 — 2-column desktop / single-column mobile product drawer

- **Pattern:** desktop product-detail page has sticky creator identity on left + product content on right; mobile collapses to single-column drawer overlay
- **Seen in:** Stan Store STS-011
- **Strategic value:** creator brand stays present during entire purchase journey, even scrolling through 500+ words of sales copy
- **Verdict:** `ADOPT`
- **Tag:** `public-page`

### PAT-015 — Long-form sales copy per product (rich-text)

- **Pattern:** product page renders 500+ words of creator-written copy with bullets, bold/italic, multiple paragraphs — effectively a landing page per product
- **Seen in:** Stan Store STS-011 (Abigail Peugh `IG Growth for Sales` = ~600 words, bullet list, emphasis, structure)
- **Strategic value:** creators don't need external landing page tools (Carrd, Leadpages) — Stan swallows that surface
- **Verdict:** `ADOPT` with default short-form / optional long-form toggle
- **Tag:** `editor`, `public-page`
- **Tadaify note:** rich-text editor (tiptap / lexical) for product description; default card shows 2-3 lines, "See more" expands to full landing

### PAT-016 — Inline checkout (no Stripe redirect)

- **Pattern:** checkout form (name + email + promo code + ToS checkbox + total + PURCHASE button) renders on the product page itself, not a separate Stripe hosted checkout
- **Seen in:** Stan Store STS-011
- **Strategic value:** creator brand preserved through payment; no jarring redirect to stripe.com
- **Verdict:** `ADOPT`
- **Tag:** `monetization`
- **Tadaify note:** Stripe Elements or Payment Intent API + custom UI. Higher engineering cost but product-defining.

### PAT-017 — Order-bump checkbox (upsell before PURCHASE)

- **Pattern:** one bonus product offered as pre-checkbox addon before final PURCHASE — adds to total if checked
- **Seen in:** Stan Store STS-011 (`Digital Product Starter Kit $67 / $87 Value` checkbox)
- **Strategic value:** revenue multiplier — bump rate 30-50% in DTC; stacked with 0% platform fees = meaningful creator uplift
- **Verdict:** `ADOPT` — default unchecked (honesty), only one bump per product (avoid clutter)
- **Tag:** `monetization`

### PAT-018 — Per-product reviews rendered on product page

- **Pattern:** review tiles with reviewer handle + 5-star rating + quoted text + optional screenshot, displayed mid-product-page before checkout
- **Seen in:** Stan Store STS-011 (5 review tiles — `@somewhereworthwhile`, `@ellysugc`, etc.)
- **Strategic value:** product-level social proof at point-of-purchase
- **Verdict:** `ADOPT` + add verified-buyer badge (ORIGINATE against Stan — Stan reviews seem creator-curated)
- **Tag:** `public-page`, `trust-signals`
- **Tadaify note:** auto-generate "Verified Buyer ✓" badge from Stripe purchase record; optional 7-day-post-purchase review request flow

### PAT-019 — Embedded social profile as creator credential

- **Pattern:** creator's own IG/TikTok/YouTube profile embedded mid-product-page — live follower count, bio, verification badge surfaced as "trust me, I have 100K followers"
- **Seen in:** Stan Store STS-011 (IG profile embed inside product description)
- **Strategic value:** social proof without asking buyer to leave the checkout page
- **Verdict:** `ADOPT`
- **Tag:** `public-page`, `trust-signals`, `editor`
- **Tadaify note:** support IG / TikTok / LinkedIn / YouTube / Twitter embed blocks with live follower count (fall back to screenshot if API quota exceeded)

### PAT-020 — Discount code input visible by default at checkout

- **Pattern:** promo code textbox + Apply button rendered default-visible at checkout, not behind "Have a code?" collapsible
- **Seen in:** Stan Store STS-011
- **Strategic value:** trusts buyer — no friction to apply code; reduces abandonment from "I know there's a code somewhere" bounce
- **Verdict:** `ADOPT`
- **Tag:** `monetization`

### PAT-021 — Per-creator default currency (multi-currency platform)

- **Pattern:** platform supports creator-set default currency, likely tied to Stripe Connect country; all products on that store render in that currency
- **Seen in:** Stan Store (Abigail = $, Eddie = £ on the same platform STS-010 vs STS-012)
- **Variants:** Stan = creator-set, all-products-same; TBD whether buyer sees local currency or platform forces creator's
- **Strategic value:** enables non-US creators without currency friction
- **Verdict:** `ADOPT` (MVP, not Pro-tier deferred) + `ORIGINATE` buyer-locale auto-convert overlay
- **Tag:** `monetization`, `public-page`
- **Tadaify note:** per-creator default from Stripe Connect country + manual override + optional buyer-locale currency-switcher

### PAT-022 — Bundle as first-class product type

- **Pattern:** platform supports a `bundle` product that groups multiple individual products at a grouped price
- **Seen in:** Stan Store (Eddie Abbew `Fat Loss & Muscle Guide Bundle £34.99`)
- **Strategic value:** common creator revenue move (individual purchase OR discounted bundle)
- **Verdict:** `ADOPT`
- **Tag:** `editor`, `monetization`
- **Tadaify note:** `bundle` block type, creator selects child products + sets bundle price; UI auto-calculates implied discount vs sum

### PAT-023 — Empty-ish store ships without nag

- **Pattern:** creator can publish and share a public page with as few as 3 blocks; no platform-mandated setup checklist, no "add more blocks to publish" gate
- **Seen in:** Stan Store (Eddie Abbew, 3 paid products + zero extras)
- **Variants:** Beacons pushes through setup checklist; Linktree encourages more blocks
- **Strategic value:** sparse-store publishability = lower time-to-first-share
- **Verdict:** `ADOPT`
- **Tag:** `onboarding`, `editor`

### PAT-024 — All-fields signup (anti-pattern)

- **Pattern:** username + name + email + phone + password all collected on a single screen before first commit
- **Seen in:** Stan Store STS-020
- **Variants:** Stan = 5 fields at once; Beacons = progressive (handle → Next → credentials); Linktree = email-first; Carrd/Taplink TBD
- **Strategic value:** trades completion friction for commit atomicity — bad trade for acquisition-stage SaaS
- **Verdict:** `AVOID`
- **Tag:** `onboarding`
- **Tadaify note:** locked on Beacons progressive signup per BCN-001 user preference; never ship Stan's all-at-once variant

### PAT-025 — Phone mandatory at signup (anti-pattern)

- **Pattern:** phone number required field during initial account creation
- **Seen in:** Stan Store STS-020
- **Strategic value:** enables SMS 2FA, marketing, fraud detection — but raises friction significantly for EU/GDPR-aware creators
- **Verdict:** `AVOID`
- **Tag:** `onboarding`, `trust-signals`
- **Tadaify note:** phone only collected at moment of need (Stripe Connect KYC, 2FA opt-in, SMS reminders opt-in); never at signup

### PAT-026 — Social login day 1 (anti-of-Stan, adopt-of-Beacons)

- **Pattern:** SSO options offered at signup and login (Google + Apple minimum; optional LinkedIn/Twitter)
- **Seen in:** Beacons (Google SSO), Linktree (Google + Apple); **absent from Stan**
- **Strategic value:** halves signup time for creators with existing accounts
- **Verdict:** `ADOPT`
- **Tag:** `onboarding`

### PAT-027 — Dynamic placeholder that mirrors input

- **Pattern:** welcome heading like `Hey @Username 👋` updates live as user types their chosen handle into the username field
- **Seen in:** Stan Store STS-020
- **Strategic value:** micro-delight + raises perceived investment cost (the page "feels like yours" before signup completes)
- **Verdict:** `ADOPT`
- **Tag:** `onboarding`
- **Tadaify note:** `Hey @<handle> 👋 welcome to tadaify` style header; handle binding real-time

### PAT-028 — IP-geo country-code auto-default

- **Pattern:** phone-country-code dropdown auto-detects visitor's country from IP, falls back to sensible default on detection failure
- **Seen in:** Stan Store fails this (defaults to `+66` Thailand for unknown geo — likely infra-region default, not visitor geo)
- **Strategic value:** removes the 3-second "open dropdown, scroll, find my country" friction for 99% of visitors
- **Verdict:** `ADOPT` + fallback to `+1` US (not `+66`)
- **Tag:** `onboarding`

### PAT-029 — Unsaved-changes guard modal on nav-away

- **Pattern:** pre-rendered modal intercepts tab-close / back-button / in-app nav when user has entered data; offers `Stay on Page` / `Discard Changes`
- **Seen in:** Stan Store STS-020 (DOM snapshot)
- **Strategic value:** respects user's input; reduces accidental data loss
- **Verdict:** `ADOPT`
- **Tag:** `onboarding`, `editor`

### PAT-030 — Hide higher paid tiers during signup (anti-pattern)

- **Pattern:** platform shows only the entry-price paid tier during signup funnel; higher tiers surfaced via in-app upsell later
- **Seen in:** Stan Store STS-022 (shows only Creator $29, hides Pro $99)
- **Variants:** Linktree + Beacons show all tiers in signup; Stan hides
- **Strategic value:** lowers decision friction at acquisition, bets on creator upgrading to Pro after hitting feature wall
- **Verdict:** `AVOID` — trust erosion, creators feel baited when they find Pro later
- **Tag:** `paywall-gating`, `onboarding`
- **Tadaify note:** publish ALL tiers on public pricing page; transparency = trust wedge

### PAT-031 — Pricing shown DURING onboarding (not before landing click)

- **Pattern:** pricing surfaces as a signup step, not via nav link on marketing site
- **Seen in:** Stan Store (landing nav has no `/pricing`; pricing appears at `/subscribe/plan` post-signup)
- **Variants:** Linktree + Beacons show pricing publicly in nav
- **Strategic value:** maximizes signups by removing pre-commit friction
- **Verdict:** `AVOID` — show pricing publicly, let creators pre-qualify
- **Tag:** `landing-marketing`, `paywall-gating`

### PAT-032 — Manual-only social handle entry, no OAuth connect (anti-pattern)

- **Pattern:** during socials-onboarding step, creator manually types every handle; no OAuth "Connect Instagram / TikTok" buttons, no handle verification, no auto-fetch of follower count or profile data
- **Seen in:** Stan Store STS-021 (corrected 2026-04-24 — all fields empty by default; user typed `waserek` manually)
- **Variants:** Linktree supports Instagram auto-import (limited); Beacons OAuth-connects Instagram for content import; Stan purely manual
- **Strategic value:** lowest engineering effort for Stan; highest creator friction
- **Verdict:** `AVOID` — ship at minimum autofill-from-store-handle + OAuth verification for IG/TikTok; fall back to manual if OAuth fails
- **Tag:** `onboarding`, `integrations`
- **Tadaify note:** autofill from handle + OAuth connect (IG / TikTok / YouTube) + live follower-count fetch → threads into PAT-019 product-page social-proof block

### PAT-033 — Yearly savings badge at 20% (category high)

- **Pattern:** `Save 20%` badge on Yearly plan vs Monthly × 12
- **Seen in:** Stan Store STS-022 (`$300/yr` vs `$29 × 12 = $348`, so actual saving is 13.8% but marketed as 20% off $360 list)
- **Variants:** Linktree 17%, Beacons ~16%, Stan 20% marketed
- **Strategic value:** highest annual commit incentive in the category
- **Verdict:** `ADOPT` at 20%+ OR `ORIGINATE` with no-annual-commit lock-in (monthly-price-matches-yearly)
- **Tag:** `monetization`, `landing-marketing`

### PAT-034 — Card capture at $0 trial start

- **Pattern:** 14-day free trial requires card at signup; automatic conversion to paid on day 15 unless cancelled
- **Seen in:** Stan Store STS-022 (`Due today $0 🙌` + presumably card form on Next)
- **Variants:** Beacons free tier does NOT require card; Stan requires card even for trial
- **Strategic value:** captures 30-60% of non-cancellers as paid customers (industry pattern)
- **Verdict:** `AVOID` for tadaify free-tier; `CONDITIONAL-ADOPT` if we offer paid tiers — only collect card when creator actively upgrades, not on signup
- **Tag:** `monetization`, `paywall-gating`

### PAT-035 — Lifestyle photography hero vs device mockups

- **Pattern:** marketing hero features real creators in lifestyle/editorial photography (gym, studio, home), not product device screenshots
- **Seen in:** Linktree (Kelsey Rose trainer, Perfect Person podcaster)
- **Variants:** Stan = layered device mockup (Alexandra Silva fictional); Beacons = phone mockup (Elizabeth Kane fictional)
- **Strategic value:** aspirational + editorial feel; reads as premium lifestyle magazine, not SaaS marketing
- **Verdict:** `ADOPT` (mix with Stan's PAT-002 real-public-stores approach)
- **Tag:** `landing-marketing`
- **Tadaify note:** hero combines lifestyle photography (Linktree) + real tadaify store link (Stan PAT-002) + `tada!ify` wordmark live-rendering (ORIGINATE)

### PAT-036 — Audience-segments scrolling marquee

- **Pattern:** horizontal-scroll marquee ticker listing 20+ audience niches ("creators · influencers · small businesses · athletes · models · monetizers · musicians · podcasters...")
- **Seen in:** Linktree landing (22 niches, 3× looped)
- **Strategic value:** inclusive positioning — signals "this is for you, whoever you are" + lowers perceived category gate
- **Verdict:** `ADOPT` — localize for PL with PL-relevant niches
- **Tag:** `landing-marketing`, `trust-signals`

### PAT-037 — A-list celebrity + brand showcase (anti-pattern for new entrants)

- **Pattern:** landing prominently displays handles of famous users (celebrities, major brands, pro athletes)
- **Seen in:** Linktree (`/selenagomez /hbo /pharrell /tonyhawk /laclippers /comedycentral`)
- **Strategic value:** aspirational scale-proof — only works when you have them
- **Verdict:** `AVOID` for tadaify MVP (we don't have A-listers, don't fake; use Stan PAT-002 mid-creator showcase instead)
- **Tag:** `landing-marketing`, `trust-signals`

### PAT-038 — FAQ on landing (not a separate help page)

- **Pattern:** 6-10 common-question Q&A collapsed items rendered as a landing section
- **Seen in:** Linktree (9 items: "Can you get paid and sell things?", "Is Linktree safe?", "How many links?", etc.)
- **Variants:** Stan does NOT ship FAQ on landing; Beacons has help center but not on landing
- **Strategic value:** SEO long-tail query match + late-funnel objection handling
- **Verdict:** `ADOPT` (6-8 FAQs MVP, extend to live AI-search post-MVP)
- **Tag:** `landing-marketing`, `trust-signals`

### PAT-039 — Enterprise-grade trust surfaces in footer

- **Pattern:** footer links include Trust Center, Transparency Report, Law Enforcement Access Policy, Human Rights, plus Cookie Preferences + Privacy Notice + Terms
- **Seen in:** Linktree (all 4 trust surfaces live + ABN + physical address + indigenous land acknowledgement)
- **Variants:** Stan has just PDF Privacy + ToS on external `stanwith.me`; Beacons TBD
- **Strategic value:** maturity signal, enterprise-procurement readiness, regulatory preparedness
- **Verdict:** `ADOPT` partial — Trust Center + uptime page + SLA publication from launch; Transparency Report + Law Enforcement policy deferred until Y1 (when we have something to report)
- **Tag:** `trust-signals`, `landing-marketing`

### PAT-040 — Public creator profile directory (discovery + SEO)

- **Pattern:** separate browseable directory of all creator profiles, searchable by niche
- **Seen in:** Linktree (`Creator Profile Directory` footer link)
- **Strategic value:** SEO long-tail + creator cross-discovery + network-effect moat (creators prefer platforms where they get organic discovery)
- **Verdict:** `ADOPT` (MVP or near-MVP — cheap to build, high SEO value)
- **Tag:** `growth-loops`, `public-page`
- **Tadaify note:** PL creator directory as EU wedge — public page `tadaify.com/directory` with niche + language filter

### PAT-041 — Solutions-by-intent taxonomy (content SEO)

- **Pattern:** landing links out to dedicated sub-pages per creator intent (`/solutions/share-content`, `/solutions/earn`, `/solutions/grow-followers`)
- **Seen in:** Linktree
- **Strategic value:** SEO depth + conversion tuning per persona
- **Verdict:** `DEFER` for MVP (no traffic to justify); revisit at Y1
- **Tag:** `landing-marketing`, `growth-loops`

### PAT-042 — Native mobile apps (iOS + Android)

- **Pattern:** SaaS ships native admin apps alongside web
- **Seen in:** Linktree (iOS + Android in footer)
- **Variants:** Stan = web-only per desk-research; Beacons = web-only
- **Strategic value:** creator-on-the-go editing + push notifications for sales / analytics
- **Verdict:** `DEFER` for MVP (web-first); revisit post-PMF when we have sales to notify about
- **Tag:** `integrations`

### PAT-043 — Seller fee ladder as upgrade engine (!!!)

- **Pattern:** platform charges progressively lower seller fee at higher tiers (12% free → 9% mid → 0% top); higher tier becomes cheaper for creators above a revenue threshold, driving self-upgrade
- **Seen in:** Linktree (12% Free / 9% Starter / 9% Pro / 0% Premium)
- **Variants:** Stan uses flat 0% fees at all paid tiers, no free; Beacons uses 9% free / 0% paid — Linktree's 4-tier ladder is the most sophisticated
- **Strategic value:** converts free users automatically as they grow revenue — zero-marketing-cost upgrade. Also the single most underrated SaaS pricing mechanic in this category.
- **Verdict:** `ADAPT` — tadaify picks a variant (see feature-mix §6.2 refinement)
- **Tag:** `monetization`, `paywall-gating`

### PAT-044 — Tier-based support SLA (publicly published)

- **Pattern:** pricing page publicly commits to response-time SLA per tier (e.g., 48h free / 24h starter / 12h pro / 4h premium)
- **Seen in:** Linktree pricing page
- **Variants:** Stan publishes NO SLA; Beacons publishes NO SLA (and Trustpilot flags slow support as their #1 complaint)
- **Strategic value:** trust signal + tier differentiator; also used by enterprise procurement
- **Verdict:** `ADOPT` + `ORIGINATE` real-time adherence publication on Trust Center
- **Tag:** `trust-signals`, `paywall-gating`

### PAT-045 — Recommended-tier badge (psychology of the middle)

- **Pattern:** one of the middle tiers gets a "Recommended" or "Most popular" badge to anchor decision-making
- **Seen in:** Linktree (Pro badged Recommended)
- **Strategic value:** nudges indecisive buyers to the anchor tier (center-bias psychology)
- **Verdict:** `ADOPT` if tadaify ships 3+ tiers
- **Tag:** `paywall-gating`

### PAT-046 — One-click 7-day Pro trial from Free account

- **Pattern:** Free-tier creator can "Try Pro for 7 days" with one click, no card; auto-reverts to Free on trial end
- **Seen in:** Linktree (only Pro has this trial; Starter direct-paid, Premium direct-paid)
- **Strategic value:** zero-friction product-led trial specifically drops creators into the Recommended tier
- **Verdict:** `ADOPT` — single button from Free dashboard to trial Pro for 7 days, no card collection, auto-revert
- **Tag:** `paywall-gating`, `onboarding`

### PAT-047 — Volume-tiered AI/usage features

- **Pattern:** variable-cost features (AI generations, auto-replies, API calls) get volume gates per tier rather than binary on/off
- **Seen in:** Linktree Instagram auto-replies (1k / 1.5k / 2.5k / unlimited per tier)
- **Strategic value:** matches cost-of-goods to creator willingness-to-pay; avoids all-or-nothing binary paywall on high-cost features
- **Verdict:** `ADOPT` for AI-heavy features (AI page copy, AI product description, AI email body)
- **Tag:** `paywall-gating`, `monetization`

### PAT-048 — Time-window tiered analytics

- **Pattern:** analytics retention window grows with tier (28d / 90d / 365d / all-time)
- **Seen in:** Linktree
- **Strategic value:** zero-incremental-storage-cost feature tier; creators perceive big value jump
- **Verdict:** `ADOPT`
- **Tag:** `paywall-gating`, `analytics`

### PAT-049 — Depth-tiered analytics (Top 10 → full)

- **Pattern:** same data, different slice per tier (e.g., Top 10 referrers on Pro → full list on Premium)
- **Seen in:** Linktree (location-based + referrer-based analytics: Top 10 on Pro, full on Premium)
- **Strategic value:** zero-cost feature differentiation
- **Verdict:** `ADOPT`
- **Tag:** `paywall-gating`, `analytics`

### PAT-050 — Comparative pricing table ("us vs other platforms")

- **Pattern:** pricing page includes a side-by-side feature table comparing the platform to "other platforms" (not named)
- **Seen in:** Linktree pricing ("Linktree Earn vs Other Platforms" — instant checkout, courses, sponsored links, commissions, setup time)
- **Strategic value:** directly addresses "why not Linktree / Stan / Beacons" objection in-funnel
- **Verdict:** `ADOPT` at Y1+ when we have honest differentiators; defer MVP
- **Tag:** `landing-marketing`, `paywall-gating`

### PAT-051 — Feature matrix on pricing page (50+ features × 4 tiers)

- **Pattern:** exhaustive public feature table listing every feature × every tier
- **Seen in:** Linktree pricing (50+ features × 4 tiers across Links/Monetization/Customization/Analytics/Marketing Tech/Management)
- **Strategic value:** transparency for expert buyers, enterprise procurement-friendly
- **Verdict:** `DEFER` for MVP (simpler "top 10 features per tier" is enough); add full matrix at Y1 when feature count justifies
- **Tag:** `paywall-gating`

### PAT-052 — 4-tier pricing structure (Free / Starter / Pro / Premium)

- **Pattern:** four paid tiers covering beginner → solopreneur → growth → business
- **Seen in:** Linktree ($0 / $6 / $12 / $30)
- **Variants:** Stan = 2-tier ($29 / $99); Beacons = 4-tier but with free ($0 / $10 / $30 / $90)
- **Strategic value:** granular self-selection but decision-paralysis risk
- **Verdict:** `DEFER` for MVP (start 2-tier Free + Pro); revisit at 3-tier when we see creator segments needing granularity
- **Tag:** `paywall-gating`

### PAT-053 — Two-tier integrations model (Link Apps + Integrations)

- **Pattern:** platform distinguishes **Link Apps** (lightweight embed blocks rendering partner content inline) from **Integrations** (OAuth-connected data bridges to external services)
- **Seen in:** Linktree Marketplace (`/apps/<slug>` vs `/integrations/<slug>` URL convention)
- **Strategic value:** product-surface-appropriate architecture; lightweight embeds scale to 50+ without engineering cost, deep OAuth reserved for high-value platforms (Shopify, Mailchimp)
- **Verdict:** `ADOPT`
- **Tag:** `integrations`, `editor`

### PAT-054 — Intent-categorized marketplace (Share / Earn / Grow)

- **Pattern:** marketplace apps grouped by creator intent, not by vendor or platform
- **Seen in:** Linktree Marketplace (Share your content / Make and collect money / Grow your following / All)
- **Strategic value:** creator self-navigates by goal; taxonomic clarity
- **Verdict:** `ADOPT`
- **Tag:** `integrations`, `growth-loops`

### PAT-055 — Public self-serve developer program (ORIGINATE against all competitors)

- **Pattern:** documented REST + webhook API, self-serve API keys, public OpenAPI spec
- **Seen in:** Linktree has partner-gated program; Stan + Beacons have NONE
- **Strategic value:** agency tooling + custom integrations + indie-dev ecosystem; only wedge left in the category
- **Verdict:** `ORIGINATE` for tadaify
- **Tag:** `integrations`, `growth-loops`

### PAT-056 — Zapier as integration-count deflator

- **Pattern:** platform ships Zapier webhook integration from day 1, exposing 5000+ Zapier apps as "tadaify integrations" without per-integration engineering
- **Seen in:** Stan + Beacons (Zapier via paid tier)
- **Strategic value:** closes 80% of the "you don't have Integration X" objection without engineering
- **Verdict:** `ADOPT` day 1
- **Tag:** `integrations`

### PAT-057 — Category-filtered template gallery

- **Pattern:** templates browseable by niche (fashion, fitness, creator, music, SMB, sports, messaging app)
- **Seen in:** Linktree `/s/templates` (10 niche filters, 46 templates)
- **Strategic value:** SEO acquisition + onboarding shortcut (creator picks template → skips empty-canvas)
- **Verdict:** `ADOPT` (8-12 MVP templates across 6 niches)
- **Tag:** `editor`, `onboarding`, `landing-marketing`

### PAT-058 — Template names as brand-locale signature

- **Pattern:** templates named after a regional / cultural reference tied to the company's origin (Linktree uses Australian place/surname names: Artemis, Warburton, Heffernan, Mitre...)
- **Seen in:** Linktree
- **Strategic value:** brand-identity reinforcement embedded in product surface
- **Verdict:** `ADOPT` with Polish cultural names (Chopin, Kopernik, Skłodowska, Kraków, Tatra, Wisła, Bałtyk)
- **Tag:** `editor`, `landing-marketing`

### PAT-059 — Public template deep-link (ORIGINATE against Linktree)

- **Pattern:** each template has a public preview URL viewable without login (`/t/<name>`), SEO-indexable
- **Seen in:** NONE — Linktree requires login to preview; Stan TBD
- **Strategic value:** SEO long-tail + pre-signup qualification
- **Verdict:** `ORIGINATE`
- **Tag:** `editor`, `landing-marketing`, `growth-loops`

### PAT-060 — "Ask AI about us" pre-authored LLM prompts in footer

- **Pattern:** landing footer includes buttons linking to ChatGPT, Claude, Gemini, Perplexity, Grok with pre-filled query ("Explain Beacons for creators: what it is, how monetization works, setup, and how it compares to Linktree")
- **Seen in:** Beacons (unique in category)
- **Strategic value:** pre-steers the LLM answer; meta-marketing for the LLM era; captures visitors who will query AI assistants anyway
- **Verdict:** `ADOPT` + `ORIGINATE` bilingual (PL + EN) prompts for EU wedge
- **Tag:** `landing-marketing`, `growth-loops`

### PAT-061 — Multi-persona top nav (Creators / Managers / Brands)

- **Pattern:** top-nav persona switcher routing to distinct marketing paths per audience
- **Seen in:** Beacons (For Creators / For Managers / For Brands)
- **Strategic value:** enables B2B2C business model (creators free, brands pay)
- **Verdict:** `DEFER` for MVP (creators-only); Y1+ add Managers; Y2+ add Brands
- **Tag:** `landing-marketing`

### PAT-062 — Brand Deals CRM (inbox + pitch + track + pay)

- **Pattern:** dedicated CRM surface for creator brand partnerships — inbox integration, pitch templates, negotiation tracking, payment status
- **Seen in:** Beacons (with fake-inbox demo on landing: OSEA, Fenty Beauty, Lululemon, Armani, Blue Bottle)
- **Variants:** NONE — unique to Beacons
- **Strategic value:** deep creator workflow capture; upsells brand-matching revenue
- **Verdict:** `DEFER` Y2+ for tadaify (outside MVP scope)
- **Tag:** `monetization`, `admin-ui`

### PAT-063 — BNPL (buy-now-pay-later) at checkout

- **Pattern:** platform offers Klarna/Affirm installment payments at buyer checkout, enabling high-ticket product sales ($500+ courses, coaching)
- **Seen in:** Beacons (Creator Plus tier) — confirms Stan desk-research mention (BNPL at Creator Plus+)
- **Strategic value:** unlocks higher-AOV sales (creator keeps full price, buyer pays installments)
- **Verdict:** `ADOPT` — Y1+ (Stripe Klarna + Affirm — easy integration, high uplift for high-ticket creators)
- **Tag:** `monetization`

### PAT-064 — Anti-platform "Own your audience" positioning

- **Pattern:** landing copy explicitly frames the platform as a way to escape social media algorithm dependency ("Screw the algorithm & market direct to fans")
- **Seen in:** Beacons
- **Strategic value:** memorable positioning, taps creator frustration with algorithmic reach decline
- **Verdict:** `CONDITIONAL-ADOPT` — soften tone but keep the message ("Your direct line to your audience — no algorithm")
- **Tag:** `landing-marketing`

### PAT-065 — 7+ prominent AI features on landing

- **Pattern:** dedicated landing section listing 7+ distinct AI features (AI copy, AI emails, AI product descriptions, AI thumbnails, AI audience intelligence, AI social assets, AI digest emails)
- **Seen in:** Beacons (only competitor with AI on landing; Linktree has 1 AI feature = Instagram auto-replies; Stan has zero)
- **Strategic value:** credibility in LLM era; AI has become table stakes for creator SaaS
- **Verdict:** `ADOPT` at 3 features MVP, scale to 7+ at Y1
- **Tag:** `landing-marketing`, `integrations`

### PAT-066 — "Cash out in one day" payout speed as differentiator

- **Pattern:** landing copy explicitly calls out payout speed to creator bank account ("Cash out in one day")
- **Seen in:** Beacons
- **Variants:** Stan — payouts via Stripe, timing not prominent; Linktree — payouts per platform
- **Strategic value:** removes creator cash-flow friction; Stripe Express/Custom accounts support 1-day payout in US
- **Verdict:** `ADOPT` — if we ship Stripe Express connect, call out payout speed on landing
- **Tag:** `monetization`, `landing-marketing`

### PAT-067 — Guest-mode editor (no signup required to start building)

- **Pattern:** visitor can open the editor and start building without creating an account; account is required only to publish
- **Seen in:** Carrd (`/build` opens editor without auth)
- **Variants:** NONE in the audited set — Linktree / Stan / Beacons all force signup before editor access
- **Strategic value:** massive friction reduction — visitor commits to the product before being asked for credentials
- **Verdict:** `ADOPT` — tadaify ships guest-mode editor with "Claim your handle & publish" gate at save/publish
- **Tag:** `onboarding`, `editor`

### PAT-068 — Annual-only pricing positioning ($X/year not $Y/month)

- **Pattern:** pricing callout leads with annual total, not monthly equivalent
- **Seen in:** Carrd (`$19/year (yup, per year)` with italic emphasis on "year")
- **Strategic value:** breaks SaaS-per-month expectation, positions as affordable one-time annual commit
- **Verdict:** `DEFER` — unsustainable at tadaify's infra cost (Stripe fees + hosting + AI credits)
- **Tag:** `monetization`, `landing-marketing`

### PAT-069 — Live demo sub-domains as primary social proof

- **Pattern:** landing links to 3-5 real, live sub-domain URLs of example sites (not mockups, not carousels, not celebrity handles)
- **Seen in:** Carrd (`johnsmith-demo.carrd.co`, `caycepollard-demo.carrd.co`, etc.)
- **Variants:** Stan's `stan.store/<handle>` real creator stores (PAT-002) is similar; Linktree + Beacons use mockups or celebrity handles
- **Strategic value:** max trust, auditable product proof, zero deception
- **Verdict:** `ADOPT` (already adopted via Stan PAT-002; Carrd re-confirms)
- **Tag:** `landing-marketing`, `trust-signals`

### PAT-070 — Deep-cut reference as brand-tone signal

- **Pattern:** demo site names or template names contain references to designer/indie-hacker/literary culture (Cayce Pollard = William Gibson novel character)
- **Seen in:** Carrd (`caycepollard-demo.carrd.co` — invisibly signals "we know the designer culture" to those who know)
- **Strategic value:** brand kinship signal to target audience; invisible to others (no downside)
- **Verdict:** `ADOPT` (already planned via PL-culture template names PAT-058 — Chopin, Kopernik; extend demo creators similarly)
- **Tag:** `landing-marketing`

### PAT-071 — "Absence of features" as positioning

- **Pattern:** landing deliberately OMITS AI callouts, FAQ, mobile apps, marketplace, trust center, testimonial carousels — leaving just the core message
- **Seen in:** Carrd
- **Strategic value:** signals product focus — "we do one thing well"; appeals to indie hackers + designers who distrust feature-bloat
- **Verdict:** `AVOID` for tadaify (we compete in a feature-expected category); retain as option if we ever ship "tadaify lite"
- **Tag:** `landing-marketing`

### PAT-072 — Company-values "Our cores" section on landing

- **Pattern:** landing includes a dedicated section listing company ESG / ethics values (Black Owned Business, Woman Owned & Led, LGBTQIA+, Menstrual Leave, No Data Sold, etc.)
- **Seen in:** Lnk.bio (unique in category)
- **Strategic value:** brand-trust wedge — signals alignment with ethical-consumer creators
- **Verdict:** `ADAPT` for tadaify with PL-culture values — Polish independent business / No data resale / Work-life balance / Supports PL creators / Fair wages
- **Tag:** `landing-marketing`, `trust-signals`

### PAT-073 — Lifetime one-time pricing option

- **Pattern:** "buy once, own forever" pricing tier, no recurring subscription
- **Seen in:** Lnk.bio (`Unique $24.99 ONE-TIME`)
- **Strategic value:** appeals to anti-subscription-fatigue segment; rare in creator SaaS
- **Verdict:** `DEFER` — tadaify unit economics (Stripe fees + hosting + AI credits) cannot sustain
- **Tag:** `monetization`

### PAT-074 — À la carte add-on pricing (features sold separately from tiers)

- **Pattern:** individual features (verification badge, booking calendar, translations) sold as separate monthly add-ons independent of tier
- **Seen in:** Lnk.bio (Blue Tick $2/mo, Booking $4/mo, Translations $3/mo, Custom domain $39.99/yr)
- **Strategic value:** creator pays only for features used; high-customization billing
- **Verdict:** `DEFER` — Y1+ consideration; MVP stays tier-based for simpler billing
- **Tag:** `monetization`, `paywall-gating`

### PAT-075 — Audience-persona tabs in hero

- **Pattern:** hero section includes a tab component listing 3-4 audience types (Services / Creators / Goods / Everyone) with persona-specific messaging + visual per tab
- **Seen in:** Taplink (4 tabs with distinct niches per)
- **Variants:** Linktree audience-segments marquee is horizontal-scroll, static (PAT-036); Taplink tabs are interactive
- **Strategic value:** persona-specific landing without 4 separate URLs; creator self-identifies
- **Verdict:** `ADOPT` as tadaify hero enhancement — 4 PL-localized tabs (Twórcy / Edukatorzy / Usługi / Sklepy)
- **Tag:** `landing-marketing`

### PAT-076 — Countdown timer as creator-controlled block

- **Pattern:** product block supports an optional expiry countdown (creator sets: "Sale ends in 2 days")
- **Seen in:** Taplink (Pro tier feature)
- **Variants:** Stan deliberately avoids platform-wide countdown; Taplink makes it opt-in per-product creator choice
- **Strategic value:** scarcity marketing tool; creator authors urgency, platform enables but doesn't mandate
- **Verdict:** `ADOPT` — Pro tier feature, creator-configurable
- **Tag:** `editor`, `monetization`

### PAT-077 — SEO farm: payment-method pages for long-tail queries

- **Pattern:** dedicated marketing pages `/payments/visa`, `/payments/paypal`, `/payments/amex` etc. — SEO targeting queries like "link in bio with PayPal"
- **Seen in:** Lnk.bio (8+ payment-method SEO pages)
- **Strategic value:** captures long-tail search intent from payment-system-aware creators
- **Verdict:** `NEUTRAL` — low engineering cost, modest SEO return; post-MVP SEO tactic
- **Tag:** `growth-loops`

### PAT-078 — Granular GDPR cookie consent with Accept All / Reject non-necessary (ADOPT) vs bare "Got it" banner (AVOID)

- **Pattern:** cookie banner includes explicit `Accept all` + `Reject non-necessary` buttons (Lnk.bio); vs bare "We use cookies. Got it." style (Taplink)
- **Seen in:** Lnk.bio (granular, EU-compliant); Taplink (bare, non-compliant for EU serious usage)
- **Strategic value:** EU legal compliance + user trust
- **Verdict:** `ADOPT` Lnk.bio-style granular consent; MUST for EU/PL launch
- **Tag:** `trust-signals`, `landing-marketing`

## Open pattern slots (to populate as audit progresses)

- [ ] Onboarding: time-to-first-published-page (measure signup → live)
- [ ] Editor: block reorder UX (drag / arrow / autosave)
- [ ] Editor: image upload flow (crop? compression? CDN?)
- [ ] Public page: mobile-first vs desktop-responsive behaviour
- [ ] Public page: URL structure (slash-handle / sub-domain / custom domain)
- [ ] Monetization: checkout UI (Stripe embed / redirect / iframe)
- [ ] Monetization: refund policy surfacing
- [ ] Email-CRM: list management UI
- [ ] Email-CRM: campaign builder UX
- [ ] Analytics: creator dashboard KPIs shown by default
- [ ] Analytics: export / report format
- [ ] Admin: team/seats UI (if any)
- [ ] Paywall: upsell prompt timing + copy
- [ ] Paywall: trial-end behaviour
- [ ] Integrations: which are native blocks vs Zapier-bridged vs OAuth-app
- [ ] Growth loops: beyond self-referral — what else creates virality?
- [ ] Trust signals: uptime page / SLA publication / response-time badges

## Next audits

- [ ] Stan Store — signup flow (STS-01x)
- [ ] Stan Store — dashboard/editor post-signup (STS-02x)
- [ ] Stan Store — paywall/pricing page (STS-11x)
- [ ] Linktree — re-review notes.md (already 42 screens), extract into this library
- [ ] Beacons — finish UI audit (BCN-003+)
- [ ] lnk.bio / Carrd / Bio-link / Later / Taplink / Milkshake / Campsite-bio
