---
type: research
project: tadaify
title: "Affiliate program design + creator payout intermediary — legal/tax/operational research"
created_at: 2026-04-28
---

# Affiliate program design + creator payout intermediary

> Two-topic deep-research dossier for tadaify (link-in-bio SaaS, EU founder / Polish JDG → planned sp. z o.o.).
> Topic 1 — how to design the affiliate program so it explodes.
> Topic 2 — how to pay affiliates and creators legally and tax-safely from a Polish entity.

---

## Executive summary (60-second read)

**Topic 1 (growth).** The link-in-bio category is dominated by recurring-commission programs in the **20-50%** band. Beacons pays 25% lifetime, Stan Store 20% lifetime, ConvertKit/Kit 30% for 24 months, Webflow 50% for 12 months, Beehiiv 50% for 12 months, Whop 30% for 6 months. **"30% lifetime" — the founder's working model — is at the high end of what's standard but defensible in this category** (Beacons does lifetime, Stan does lifetime, both at lower %). What separates exploding programs from dead ones is *not* the commission %; it's three things: (a) a **double-sided incentive** so the referred creator also gets value (Beehiiv: 14-day trial + 20% off for 3 months; ConvertKit: 30 days free), (b) **eligibility friction-vs-fraud calibration** (Whop requires 18+, application, approval; Beacons blocks self-referrals), and (c) **a transparent, real-time affiliate dashboard with cohort retention**. Recommendation: ship at **30% recurring for 24 months** (NOT lifetime — see §1.3 reasoning), open to all paid-tier creators after 1 paid invoice, $50 payout floor, 60-day attribution cookie, double-sided 30-day-free for the referred creator, and reserve a **45-day hold period** before commission becomes payable. Lock self-referral + same-card-fingerprint detection at v1.

**Topic 2 (legal/tax).** The founder's intuition is correct and validated: **Stripe Connect Standard is the right rail for a Polish founder paying global affiliates and (later) creators.** The flow he described — tadaify holds money in its Stripe balance, issues `transfers` to affiliate-owned `acct_*` connected accounts, books each transfer as a tadaify business expense, the affiliate books it as their revenue — is the canonical pattern. Stripe's EMI license (Stripe Technology Europe Ltd, Central Bank of Ireland) absorbs the PSD2/payment-institution regulatory burden; tadaify stays a "platform user," not a payment institution. **For affiliate payouts: use Stripe Connect Standard, ~0.25% of transferred amount + €2 cap fee, affiliate handles their own KYC via Stripe-hosted onboarding.** **For future creator monetisation (Paid articles / Shop / Tip jar): same rail, Connect Standard with `application_fee` for tadaify's cut, but watch the marketplace-vs-reseller distinction — Lemon Squeezy's "merchant-of-record" model is a viable alternative if tax compliance becomes existential, at a higher 5%+€0.50/txn vs Stripe's 1.5%-2.9%.**

The Polish-tax landmines, in order of importance:
1. **DAC7 reporting** is real and live since 2024-07-01. tadaify will be a "platform operator" once it facilitates creator-to-end-user payments (Paid articles / Shop). For the *affiliate-only* flow (tadaify pays affiliates *its own* commission), DAC7 does NOT apply — tadaify is not facilitating a sale between a seller and a buyer. **Affiliate program v1 is DAC7-free.** Creator monetisation v2 will require a Polish DAC7 platform-operator registration.
2. **Withholding tax (podatek u źródła)** — the 20% WHT rate on advertising/marketing services to foreign individuals is the biggest sleeper risk. Reframe the affiliate as a **marketing-cost partnership** (not a "service"), collect a tax-residency certificate from every paid affiliate, apply DTT rates (typically 0%), and you're safe. Without a residency cert, default 20% WHT at source.
3. **VAT** — affiliate to Polish JDG: standard 23% on B2B service inside Poland (affiliate issues invoice to tadaify); intra-EU B2B: reverse charge, no VAT on affiliate's invoice; non-EU: outside scope. tadaify deducts the cost as a marketing expense for PIT/CIT.
4. **B2C affiliates (private individuals, not registered businesses)** — these are the riskiest payouts. Polish individuals can declare affiliate income as "other sources of income" (8.5% lump sum up to PLN 100k) without registering a business, but tadaify still has paperwork (PIT-11 information form for them, plus WHT considerations for foreign B2C affiliates).

**Critical 30-day actions for the founder:**
1. Engage a Polish księgowa with EU-SaaS experience NOW — not after launch. Cost: ~PLN 800-1500/month.
2. Draft + publish the affiliate ToS in English + Polish; explicitly frame it as a marketing partnership, set self-referral exclusion, hold period, %, attribution window, eligibility.
3. Stripe Connect Standard pilot: enable Connect on the existing tadaify Stripe account (acct_1...), test the transfer flow with one self-owned test connected account before opening to real affiliates.
4. Decide DAC7 trajectory: file for "platform operator" registration in Poland *only when* shipping creator monetisation (v2), not for affiliate v1.
5. Revisit the planned 30%-lifetime model → recommend 30%-for-24-months as the published default to keep CAC-payback math sane (see §1.3.3).

---

## Topic 1 — Affiliate program design (the growth angle)

### 1.1 Competitor landscape — link-in-bio + adjacent creator-economy SaaS

Comprehensive matrix below. Sources cited inline; "(estimate)" or "(my analysis)" marks inferred numbers. Default attribution is "last-click" unless noted; default cookie is the program's stated number; "lifetime" means commission paid as long as referred subscriber is paying.

#### 1.1.1 Direct link-in-bio competitors

| Platform | Has program? | Commission | Recurring? | Cookie | Eligibility | Payout rail | Treats affiliate as |
|---|---|---|---|---|---|---|---|
| **Linktree** | NO public cash program for referring users to Linktree itself. Has **Linktree Shops** (creators earn from linked retailers via affiliate networks like Awin/Impact). | n/a | n/a | n/a | n/a | n/a | n/a |
| **Beacons.ai** | YES | **25%** of subscription revenue | **Lifetime** ("every month for as long as they remain on Pro") | not disclosed (estimate 60d) | All users (Free + paid) | not disclosed (likely Stripe Connect — Beacons is on Stripe) | T&C clause, end-user |
| **Stan Store** | YES | **20%** | **Lifetime / "for as long as that Creator stays subscribed"** | not disclosed (estimate 60-90d) | All users | "Stan" payout system — likely Stripe Connect | T&C clause |
| **Carrd** | NO public program found | — | — | — | — | — | — |
| **Koji** (defunct → sunset 2024) | YES (historical) | **2%** for year 1 only — a very low % | One year | — | All users | Internal balance | T&C clause |
| **Bento.me** | YES — "Creator Code Program" | not publicly disclosed (likely % of referral revenue) | not disclosed | — | Application required | not disclosed | Curated partner |
| **Hopp** (formerly Hopp.ai) | unclear; no public page | — | — | — | — | — | — |
| **Snipfeed** | No active public affiliate program (sunset/pivot in 2024-25) | — | — | — | — | — | — |
| **Komi** | No public affiliate program found | — | — | — | — | — | — |
| **Linkin.bio (Later)** | No public *standalone* affiliate program for the link-in-bio product (Later as a whole has a partner program for agencies) | — | — | — | — | — | — |
| **Linkpop (Shopify)** | rolled into Shopify Partners (one-time bounty $58 per Shopify Plan) | $58 one-time | No | — | Shopify Partner | Stripe + ACH | Partner contract |

Sources:
- Beacons referral T&C: [help.beacons.ai/en/articles/4705537](https://help.beacons.ai/en/articles/4705537)
- Stan Store referral FAQ: [help.stan.store/article/89](https://help.stan.store/article/89-what-is-stans-referral-or-affiliate-program)
- Linktree Shops affiliate model: [help.linktr.ee/en/articles/8619620](https://help.linktr.ee/en/articles/8619620-how-to-promote-affiliate-links-with-linktree)
- Koji referral program (historical): [blog.withkoji.com/referral-affiliate](https://blog.withkoji.com/referral-affiliate/)
- Bento creator code: [bentonow.com/creators](https://bentonow.com/creators)

**Read of the category:** the link-in-bio market has converged on **20-25% lifetime / recurring** as the paid-creator-tier benchmark. **30% would put tadaify at the top of the pack** — unique selling angle, but margin-tight.

#### 1.1.2 Adjacent creator-economy SaaS

| Platform | Commission | Duration | Cookie | Tier system | Notable |
|---|---|---|---|---|---|
| **ConvertKit / Kit** | **30%** | **24 months** then drops to 10-20% based on Bronze (10+/yr) / Silver (50+/yr) / Gold (100+/yr) tier | 90 days | Yes | $50 payout floor, monthly via PartnerStack |
| **Beehiiv** | **50%** base, escalating to 55% / 60% | **12 months** | 60 days | Yes | Referred creator gets 14-day trial + 20% off 3 months |
| **Webflow** | **50%** | **12 months** | 90 days | Pro / Premium tiers add another +10% / +15% for renewals after y1 | $300/year cap on commissions in some tiers |
| **Substack** | None for *creator-to-creator* referrals (no cash). Subscriber-referral feature is reward-based (free comp subs). Profile-level "Creator Referrals" badge program is non-monetary. | — | — | — | Substack chose social/credibility incentive over cash |
| **Whop** | **30%** | **6 months** | 60 days | No (uniform) | 30-day commission hold; 18+ application required |
| **Patreon** | None — Patreon does not have a public affiliate program for creators referring creators | — | — | — | Heavy MoR-style compliance via DAC7 |
| **Gumroad** | Per-product affiliate, set by creator, typical 20-50% on individual digital products | One-time | varies | n/a | Affiliates per-product, not platform-level |
| **Lemon Squeezy** | Built-in affiliate hub for individual products, creator sets % per product, default 20-30% | One-time | varies | n/a | Affiliates per-store, MoR for the store itself |
| **Notion** | $5 fixed per converted "Plus" plan signup; 10% recurring for "Business" plan referrals | varies | 90 days | No | Tiny commission; volume-based |
| **Framer** | 25% lifetime via Tolt | Lifetime | 60 days | No | One of the more aggressive lifetime offers in design SaaS |
| **Tally** | 25% recurring for 12 months | 12 months | 60 days | No | Form-builder reference |
| **Typeform** | 20% for 12 months | 12 months | 30 days | No | Tighter cookie window |

Sources:
- ConvertKit affiliate FAQ: [help.kit.com/en/articles/5982708](https://help.kit.com/en/articles/5982708-new-affiliate-program-faq)
- Beehiiv partner program: [www.beehiiv.com/partners](https://www.beehiiv.com/partners)
- Webflow affiliate overview: [webflow.com/solutions/affiliates](https://webflow.com/solutions/affiliates) and [help.webflow.com/.../33961372613011](https://help.webflow.com/hc/en-us/articles/33961372613011-Webflow-s-affiliate-program-overview)
- Whop affiliate docs: [docs.whop.com/manage-your-business/growth-marketing/affiliate-program](https://docs.whop.com/manage-your-business/growth-marketing/affiliate-program)
- Substack creator referrals: [substack.com/referral](https://substack.com/referral)
- Patreon DAC7 doc: [support.patreon.com/.../21712170817293](https://support.patreon.com/hc/en-us/articles/21712170817293-EU-Creator-Introduction-to-income-reporting-requirements-DAC7)

**Pattern (my analysis):** the **24-month window** has emerged as the prevailing creator-tool standard (ConvertKit, Tally, etc.). It's mathematically equivalent to ~85% of lifetime LTV for a typical low-churn SaaS subscription, while capping the founder's recurring liability and aligning commission economics with CAC-payback math. **Lifetime is rare** outside of Beacons (25%) and Stan (20%); both have lower %s to compensate.

### 1.2 What makes creator-economy affiliate programs explode

Synthesis from public benchmarks (Rewardful's 2025 SaaS benchmark report, Beehiiv's published numbers):

#### 1.2.1 Recurring vs one-time
**Recurring wins for low-ARPU subscription products.** A one-time bounty ($50) only works if your CAC ≪ bounty (Shopify-scale) or if you have a heavy partner channel (Squarespace). For a $19-49/mo SaaS, a one-time bounty creates a one-day spike of motivation and then dies. Recurring keeps affiliates *invested* in the referred creator's retention, which is exactly the alignment you want. Industry data ([Supademo benchmark](https://supademo.com/blog/saas-affiliate-programs)): affiliates promoting recurring programs earn ~67% more annually than one-off.

#### 1.2.2 Commission % calibration
The math: take your effective gross margin per paying user (after Stripe fees + infra cost). Subtract the commission %. Subtract any double-sided discount cost. The remainder must still pay back CAC + serve as profit.

For tadaify (Creator tier ~$9-12/mo, gross margin ~85% after Stripe + infra of ~10%):
- 20% commission → keeps 65% margin per referred user — comfortable.
- 30% commission → keeps 55% margin per referred user — viable.
- 40% commission → keeps 45% margin — works only if churn is very low.
- 50% commission → keeps 35% margin — only justified if your blended LTV is verified > 24 months of subscription.

**Recommendation: 30%** as the published number; it positions tadaify aggressively against Beacons (25%) and Stan (20%) while leaving headroom.

#### 1.2.3 Attribution windows
Industry default is **60-90 days last-click**. Webflow/ConvertKit use 90; Beehiiv/Whop/Tally/Framer use 60; Typeform uses 30. **60 days is the sweet spot:** long enough to capture the typical creator's "I saw it, I'll think about it, I'll come back" cycle, short enough to limit cookie-stuffing exposure. ([clickguard.com/blog/cookie-stuffing](https://www.clickguard.com/blog/cookie-stuffing/))

#### 1.2.4 Tiers vs flat
For early-stage programs (<200 active affiliates), **flat % is better.** Tiers add cognitive load without driving behaviour at this scale. Once you have a long tail (1000+ affiliates) and a meaningful top-decile, switch to tiers (Bronze/Silver/Gold) — primarily because **tiers give you a comms reason to email the long tail every month** ("you're 8 referrals away from Silver"), not because the % delta drives behaviour.

#### 1.2.5 "Locked for life" vs "24 months"
This is the founder's working model. It's a meaningful question.

**Pro lifetime:**
- Strong narrative ("you've earned this user forever") — easier to message.
- Aligns affiliate with referred creator's long-term retention.
- Beacons does it at 25% and Stan does it at 20%, so the category has precedent.

**Con lifetime:**
- Long-tail commission liability that doesn't expire — a single lucky affiliate who drops 50 high-LTV creators in year 1 owns you forever.
- Most SaaS recurring programs (ConvertKit 24mo, Webflow 12mo, Beehiiv 12mo, Whop 6mo, Tally 12mo) have moved AWAY from lifetime, suggesting the founders learned something the hard way.
- LTV math: 80%+ of LTV is realised in the first 24-36 months. The lifetime tail doesn't add growth velocity proportional to its cost.

**Recommendation: 24 months at 30%.** Ship it as "earn 30% for 2 years per referral, no cap on number of referrals." Reserve "lifetime" as a tier reward for top affiliates (Gold tier: 30% lifetime once they cross 50 active referrals). This gives you the lifetime narrative *only* for affiliates who have proven they're not gaming the system, and bounds the long-tail liability.

#### 1.2.6 Reverse-affiliate (referred-creator discount)
Two-sided incentive lifts referral conversion ~40-65% depending on study ([impact.com SaaS referral guide](https://impact.com/referral/saas-referral-program-guide/)). The cost is real (you discount the new creator's first cycle), but the conversion lift more than pays for it.

| Reference | Referred-user benefit |
|---|---|
| Beehiiv | 14-day trial + 20% off for 3 months |
| ConvertKit | 30 days free |
| Stan | none |
| Beacons | none |
| Webflow | none |

**Recommendation:** ship a 30-day-free promo for referred creators. Costs ~$10 per converted referral, lifts conversion. Frame: "Your friend gave you 30 days of Creator free."

#### 1.2.7 Co-branded landing pages
Beacons routes affiliate links through a personalised page: `beacons.ai/?referring_user=<handle>`. Beehiiv and ConvertKit do similar. **High lift:** a page that says "Hi, I'm @creatorhandle — here's how I built mine on tadaify" converts ~2-3x a generic homepage hit (my analysis based on Beacons' published 12-14% MRR-from-affiliates number).

**Recommendation:** build affiliate landing page at `tadaify.com/r/<affiliate-handle>` showing the affiliate's actual tadaify page as a screenshot/iframe. Ship at v1.

#### 1.2.8 Built-in share kit
Pre-written tweet copy, IG story stickers, downloadable graphics. Beacons' kit is well-regarded. The mockup at `mockups/tadaify-mvp/app-affiliate.html` already includes this — confirmed against best practice.

#### 1.2.9 Affiliate dashboard transparency
Real-time referrals, conversion %, MRR by referral, retention curve of referred cohort. The two most-praised dashboards in the category are **Webflow** (clean cohort view) and **Beehiiv** (real-time MRR, even shows where their leads went). **Most-criticised:** PartnerStack (slow attribution, frequent disputes). My advice — build the dashboard internally, do not outsource attribution to PartnerStack at v1; it's only worth the platform fee at >$10k MRR through affiliates.

#### 1.2.10 Anti-fraud
Three classes:
- **Self-referral** — easy to detect: same email domain, same IP, same payment-method fingerprint, same browser fingerprint. Beacons explicitly bans it. Block at v1.
- **Cookie stuffing** — affiliate scripts dropping cookies via browser extension or stealth iframes. Mitigation: short cookie window (60 days, not 365), require post-attribution last-touch, log all referral events with IP + UA for forensic review.
- **Fake signups** — affiliate creates throwaway accounts to claim commission. Mitigation: **45-day hold period** before first commission becomes payable; verify referred account has at least 1 successful paid invoice (not just a free signup) before commission accrues.

References: [refgrow.com/how-to-prevent-affiliate-fraud](https://refgrow.com/how-to-prevent-affiliate-fraud), [rewardful.com/articles/affiliate-fraud-tactics](https://www.rewardful.com/articles/affiliate-fraud-tactics).

#### 1.2.11 Activation friction vs fraud
Whop requires age + manual application + approval; Beacons opens to all users; Beehiiv requires email opt-in only. At tadaify's stage:
- **Open to all** = lowest friction, highest fraud surface.
- **Application + approval** = quality control, high friction, slow growth.
- **Open to all paid creators after 1 paid invoice** = sweet spot; you've already KYC'd the user via Stripe.

**Recommendation:** open to any creator who has paid at least one invoice on Creator/Pro/Business tier. Free creators can preview the affiliate dashboard but cannot generate referral links until they convert. This gates fraud (they paid by card → there's a billing identity) without slowing growth.

### 1.3 Recommendations for tadaify (locked decision matrix)

| Decision | Recommendation | Rationale |
|---|---|---|
| **Commission %** | **30%** | Top of category vs Beacons 25 / Stan 20, but mathematically safe at 85% gross margin. |
| **Recurring?** | **Yes — 24 months** | Mainstream creator-SaaS standard. ~85% of LTV captured. Bounded long-tail liability. |
| **Lifetime?** | **Only as Gold-tier reward** at 50+ active referrals | Preserves the lifetime narrative for top performers without diffuse liability. |
| **Eligibility** | **Any creator on Creator+/Pro/Business with at least 1 paid invoice** | Free users can see dashboard preview but not generate links. |
| **Attribution window** | **60 days last-click** | Sweet spot from category benchmarks. |
| **Payout floor** | **$50** (~€45) | ConvertKit/Beehiiv default. Below this, transaction fees eat too much. |
| **Hold period** | **45 days** before commission becomes payable | Catches refunds, disputes, fake signups. Whop uses 30, ConvertKit uses 30, but 45 is safer for a young program. |
| **Referred-user benefit** | **30 days of Creator tier free** | Lifts conversion. Costs ~$10/converted referral. |
| **Anti-fraud** at v1 | Block self-referrals (email/IP/card fingerprint match), require referred user pays first invoice before commission accrues, log everything | Hard rules first; sophisticated detection later. |
| **Tiers** | **None at v1**; reserve for v2 once >200 active affiliates | Tiers add comms hooks, not behaviour change at small scale. |
| **Co-branded landing page** | `tadaify.com/r/<handle>` showing referrer's own page | High-conversion pattern from Beacons. |
| **Share kit** | Pre-written tweets, IG stickers, downloadable graphics | Already in the mockup, validated. |
| **Dashboard** | Build in-house at v1 | Real-time, with cohort retention. PartnerStack/Tolt only worth it later. |

**3-5 specific growth tactics for the first 90 days post-launch:**
1. **Beta-launch to top 50 paid creators** with a short personal-line email from the founder ("you're one of the first; here's a private link"). Their early activations will seed the leaderboard and create FOMO when you announce publicly.
2. **Public launch on ProductHunt + IndieHackers + Twitter/X** with the headline "30% recurring, 24 months, lifetime for top affiliates" — the lifetime hook drives clicks even though the default is 24mo.
3. **Affiliate-of-the-month feature on tadaify's blog/newsletter** — interview the top affiliate, showcase their tadaify page, social-proof the program.
4. **Co-branded landing pages live from day 1** — every affiliate gets one immediately, not as a v2 feature.
5. **Quarterly leaderboard email + bonus** — top 10 affiliates each quarter get a $250 bonus on top of commission. Cheap, social, drives competition.

### 1.4 Topic 1 — open decisions (DEC candidates)

#### DEC-XXX-A — Commission % and duration
- **Czego dotyczy:** affiliate commission published number
- **Szczegolowy opis:** the founder's working model is 30%-lifetime. Research shows 30%-for-24mo is the safer mainstream default; lifetime liability tail is unbounded. Need to lock the published number and the tier escalation.
- **Opcje:**
  1. 30% recurring lifetime — founder's original
  2. 30% recurring 24 months (lifetime as Gold-tier reward at 50+ active referrals) — research recommendation
  3. 25% recurring lifetime (matches Beacons exactly)
- **Rekomendacja:** option 2.

#### DEC-XXX-B — Eligibility
- **Czego dotyczy:** who can become an affiliate
- **Szczegolowy opis:** open-to-all is high-fraud, application-only is slow, paid-tier-after-first-invoice is the recommended balance.
- **Opcje:**
  1. Open to any signed-up user (Free included)
  2. Open to any creator with 1+ paid invoices
  3. Curated/application-only
- **Rekomendacja:** option 2.

#### DEC-XXX-C — Referred-creator double-sided benefit
- **Czego dotyczy:** does the new creator get a discount?
- **Opcje:**
  1. None (Stan/Beacons model)
  2. 30 days of Creator tier free (research recommendation)
  3. 50% off first 3 months
- **Rekomendacja:** option 2.

#### DEC-XXX-D — Attribution + cookie window
- **Opcje:** 30 / 60 / 90 days, last-click vs first-touch
- **Rekomendacja:** 60 days, last-click.

#### DEC-XXX-E — Affiliate-platform: in-house vs Rewardful/Tolt/PartnerStack
- **Czego dotyczy:** build it ourselves vs pay $49-499/mo for SaaS attribution
- **Opcje:**
  1. In-house (read-the-mockup; ship it as part of tadaify)
  2. Rewardful ($49/mo + revenue share)
  3. Tolt ($69/mo)
  4. PartnerStack ($500+/mo)
- **Rekomendacja:** option 1 (in-house) for v1. Re-evaluate when affiliate revenue >$10k/mo.

---

## Topic 2 — Legal + tax + operational structure for creator payouts

### 2.1 Stripe Connect deep-dive

Stripe Connect is **the right rail for tadaify**, both for affiliate payouts (now) and creator monetisation (v2). This section establishes why and how.

#### 2.1.1 Account types — Standard / Express / Custom

| Account type | Onboarding UX | KYC handler | Dashboard | Fees | Best for |
|---|---|---|---|---|---|
| **Standard** | Affiliate clicks Stripe-hosted onboarding link, completes KYC on stripe.com, gets full Stripe dashboard | Stripe (self-service) | Affiliate has full Stripe dashboard | Standard Stripe fees on the affiliate's transactions. Platform pays $2/active payout (capped). | Tadaify ✓ — affiliates are independent, want their own Stripe account anyway |
| **Express** | Onboarding hosted by Stripe but branded for the platform; lighter dashboard ("Express Dashboard") | Stripe (some fields collected by platform) | Lightweight Express dashboard | 0.25% + $2/payout, +$2/active connected account/mo (in EU: €2/active acct/mo) | Marketplaces where seller relationship is owned by platform |
| **Custom** | Fully white-labelled; platform collects all KYC docs and submits to Stripe via API | Platform (heavy lift) | None — affiliate sees only what platform builds | More expensive; full responsibility | Large marketplaces (Lyft, Postmates) — overkill for tadaify |

Sources:
- [stripe.com/connect/pricing](https://stripe.com/connect/pricing)
- [docs.stripe.com/connect/charges](https://docs.stripe.com/connect/charges)
- [docs.stripe.com/connect/separate-charges-and-transfers](https://docs.stripe.com/connect/separate-charges-and-transfers)
- [greenmoov.app/articles/en/stripe-connect-for-marketplace-payments-explained-account-types-onboarding-and-pricing-2026-guide](https://greenmoov.app/articles/en/stripe-connect-for-marketplace-payments-explained-account-types-onboarding-and-pricing-2026-guide)

**Recommendation: Standard for both affiliate payouts AND creator monetisation v2.**
- Affiliates already exist as independent creators — they want their own Stripe Dashboard.
- KYC is fully handled by Stripe — zero ops burden on tadaify.
- Lowest tadaify-side cost.
- Tradeoff: tadaify cannot deduct platform fees at charge time (Standard only allows transfers, not application_fee). For affiliate payouts, that's fine — there's no charge to split, just a transfer. For creator monetisation, this means tadaify has to charge the creator separately (e.g., monthly subscription fee includes the platform cut, or via `application_fee_amount` on Express/Custom — but for Standard you bill the creator separately). Acceptable.

#### 2.1.2 The transfer flow the founder described — verified

The founder asked: *"Do affiliates onboard themselves into Stripe, then I just do a Stripe-to-Stripe transfer that counts as my business expense?"*

**Yes, exactly that, and it's the canonical pattern.** Stripe documents this as ["separate charges and transfers"](https://docs.stripe.com/connect/separate-charges-and-transfers). The flow:

1. Tadaify charges its creators their monthly subscription fee → money lands in tadaify's Stripe balance.
2. Once a month, tadaify's affiliate-payout cron computes earned commission per affiliate.
3. Tadaify's backend issues `stripe.transfers.create({ amount: 1234, currency: 'usd', destination: 'acct_1ABC...' })` → money moves from tadaify's Stripe balance to the affiliate's connected account balance.
4. Stripe automatically pays the affiliate out to their bank account on their normal Stripe schedule (daily / weekly / monthly per their Stripe settings).
5. Each transfer is logged in tadaify's books as a marketing expense. Each transfer received is the affiliate's revenue.
6. **Stripe does NOT issue tax forms on tadaify's behalf for these transfers** — they are platform-to-connected-account transfers, not customer-to-merchant payments. tadaify is responsible for issuing whatever Polish tax forms are required (PIT-11 for B2C affiliates, etc. — see §2.2).

**No PSD2 / payment-institution license risk** because Stripe Technology Europe Ltd (STEL) — Stripe's EMI subsidiary regulated by the Central Bank of Ireland — is the payment institution. tadaify is just a "Connect platform user," same as Substack, Whop, Patreon. ([stripe.com/guides/frequently-asked-questions-about-stripe-connect-and-psd2](https://stripe.com/guides/frequently-asked-questions-about-stripe-connect-and-psd2))

#### 2.1.3 Onboarding UX + completion rate

Stripe-hosted Standard onboarding is ~10-15 minutes. Industry estimate (my analysis from public benchmarks): 70-85% completion rate for already-engaged users (people who have already opted into your affiliate program). The 15-30% drop-off is mostly KYC docs (passport scan, proof of address, banking details).

**Tadaify-side optimisation:** make the affiliate onboarding state visible in the affiliate dashboard ("3 of 4 steps complete — finish on Stripe"), email reminders after 24h / 72h / 7d, fallback contact via support if stuck.

#### 2.1.4 Geographic coverage

Stripe Connect supports payouts to **all 27 EU member states + 3 EEA (Iceland, Norway, Liechtenstein) + UK + US + Canada + Switzerland + Japan + Australia + Singapore + ~30 more**. As of January 2026, Stripe's Global Payouts adds 15 additional non-Connect-native countries via cross-border payouts. ([docs.stripe.com/changelog/clover/2026-01-28/cross-border-payouts-new-countries](https://docs.stripe.com/changelog/clover/2026-01-28/cross-border-payouts-new-countries))

**Coverage gap:** affiliates in Russia, Belarus, Iran, North Korea, Cuba, Syria — Stripe blocks. Affiliates in India, Brazil, Indonesia, Nigeria, South Africa — partial support, requires extra docs. For the affiliate program, **list supported countries on the program page**; don't promise pay-out before checking Stripe's support list per country.

#### 2.1.5 Fees on Connect

| Fee component | Standard | Express | Custom |
|---|---|---|---|
| Platform fee per active connected account | $0 (or €2/mo in EU for Express) | $2/mo (€2/mo) per active account | Custom pricing |
| Per-payout fee | $0.25 + 0.25% capped at $2 (in EU: €0.25 + 0.25% capped at €2) | Same | Custom |
| Cross-border (CB) fee | 0.25-1% on top, depending on rail | Same | Same |
| Standard Stripe fees on the affiliate's underlying *transactions* | Yes — but these are paid out of the affiliate's transactions, not tadaify's | Yes | Yes |

**For tadaify's affiliate-payout flow specifically (transfer-only, no charge to split):** roughly **0.25% + €2 per payout, capped, plus FX if cross-currency.** A $300 payout to a German affiliate in EUR = ~€2-3 in Stripe fees. Tadaify absorbs this; the affiliate gets the gross amount.

#### 2.1.6 Reporting and tax forms

- **US:** Stripe issues 1099-K to US-based connected accounts that meet IRS thresholds (currently $20k + 200 transactions; $5k threshold is being phased in 2025-2026).
- **EU/Poland:** Stripe does NOT generate Polish PIT-11/PIT-8AR. tadaify must do this. (See §2.2.)
- **DAC7:** if tadaify becomes a "platform operator" (creator monetisation), tadaify must do its own DAC7 reporting. Stripe is not the platform operator for DAC7 purposes — tadaify is. ([pbl.legal/insights/dac7-reporting-content-creators-platform-rules](https://pbl.legal/insights/dac7-reporting-content-creators-platform-rules/))

#### 2.1.7 Other rails — comparison

| Rail | Best for | Tadaify fit | Notes |
|---|---|---|---|
| **Stripe Connect Standard** | Both affiliate + creator monetisation | ✓✓ | Already on Stripe Billing — zero infra cost to enable |
| **Wise Business (Mass Payouts)** | Cheap cross-border, simple bank transfers | ⚠ for affiliate, ✗ for creator monetisation | No KYC done by Wise on the recipient's behalf — tadaify would be on the hook for compliance. 0.35-1.5% FX fee. |
| **PayPal Mass Payouts** | One-shot bulk payments | ⚠ — high fees, awful UX, US-friendly | 2% fee per payout (capped at $1 US, $20 international) plus FX |
| **Tipalti** | Enterprise mass payouts at scale | ✗ at tadaify's stage | $49+/mo plus per-txn; overkill until 1000+ affiliates |
| **Trolley** (formerly Payment Rails) | Creator-economy mid-market | ⚠ — niche fit | $49/mo + per-txn; less integrated with Stripe Billing |
| **Deel Payouts / Hyperwallet** | Contractor-style payouts | ✗ for affiliate | Designed for ongoing-employee-style contractor payments, not micro-payouts |

Sources:
- [tipalti.com/resources/learn/trolley-competitors-and-alternatives](https://tipalti.com/resources/learn/trolley-competitors-and-alternatives/)
- [trolley.com/blog/how-to-choose-the-right-global-payouts-platform](https://trolley.com/blog/how-to-choose-the-right-global-payouts-platform/)

**Verdict:** Stripe Connect Standard wins on three counts — already integrated, lowest ops, regulatory cover via STEL EMI license.

### 2.2 EU / Polish tax + legal angle

This section is THE landmine field. Polish tax law is unforgiving on outbound payments to non-residents.

#### 2.2.1 VAT — affiliate commission paid by Polish entity

Three scenarios.

**(a) Polish affiliate (B2B, with their own JDG/sp. z o.o.)**
- Affiliate issues a VAT invoice to tadaify with 23% Polish VAT.
- tadaify pays gross + VAT, deducts the VAT as input VAT in tadaify's own JPK_V7 (SAF-T).
- Net cost to tadaify = the gross amount.
- **No surprises.**

**(b) EU-resident affiliate (B2B, their own VAT-registered business outside Poland)**
- Affiliate issues an invoice with **reverse-charge** notation (in Poland: "odwrotne obciążenie", in EU jargon: "reverse charge — Article 196 of VAT Directive 2006/112/EC").
- No VAT on the affiliate's invoice.
- tadaify self-accounts for VAT in its own JPK_V7 — declares 23% output VAT *and* simultaneously 23% input VAT. **Net zero VAT impact.**
- tadaify reports the transaction on the **VAT-UE recapitulative statement** (mandatory for intra-EU service trade).
- ([marosavat.com/manual/vat/poland/reverse-charge](https://marosavat.com/manual/vat/poland/reverse-charge/), [crido.pl/en/blog-taxes/reverse-charge-transactions-tax-point-in-poland](https://crido.pl/en/blog-taxes/reverse-charge-transactions-tax-point-in-poland/))

**(c) Non-EU affiliate (B2B, e.g. US LLC or UK Ltd)**
- The service (affiliate marketing) is "imported services" for tadaify.
- Place of supply = recipient's country = Poland.
- tadaify self-accounts for VAT in JPK_V7 (output 23% + input 23%, net zero).
- No VAT-UE statement (only intra-EU).
- Affiliate's invoice is outside Polish VAT scope.

**(d) Individual affiliate (B2C, no business registration) — the messy case**
- Polish individual: under PIT, affiliate income can be declared as "other sources of income" without registering a business, **as long as it's incidental** ([infor.pl/podatki/pit/734353](https://ksiegowosc.infor.pl/podatki/pit/734353,Jak-rozliczac-dochody-z-uczestnictwa-w-programach-partnerskich.html)). Above ~PLN 100k/year or if "regular and organized," tax authorities may reclassify as JDG-required.
- **No VAT** on payments to a private individual without VAT registration (they're not a VAT taxpayer). tadaify simply pays the gross amount. tadaify does NOT deduct any input VAT.
- BUT tadaify must consider PIT-11 (annual information form to the affiliate + tax office for some payment types) — **practical operational item**: most Polish tax practitioners recommend requiring affiliates above a threshold (e.g. PLN 1000/yr) to register a JDG (or rycaalt) and invoice. Below threshold, treat as "other income" and issue PIT-11. **A clean policy for tadaify: require a business invoice from any affiliate earning >PLN 1000 in a year.** Push that into the affiliate ToS.

**Recommendation: require an invoice from every paid affiliate.** This is the cleanest path. Build the affiliate onboarding to ask: "Are you (a) a registered business [provide VAT-ID] or (b) a private individual [we'll issue a tax form to your local authority]." For private individuals, set the program payout floor higher (e.g. €100) and warn that they're responsible for self-declaring their income.

#### 2.2.2 PIT/CIT cost classification

**Affiliate commission paid by tadaify is a deductible business expense** for Polish PIT (sole proprietor) or CIT (sp. z o.o.):
- Service has a clear nexus to revenue generation (it generated a paying customer).
- Documented via affiliate's invoice + payment record.
- ([poradnikprzedsiebiorcy.pl on foreign invoices](https://poradnikprzedsiebiorcy.pl/-polski-podatek-vat-na-fakturze-od-zagranicznego-kontrahenta), my analysis based on standard PIT/CIT rules for marketing expenses.)

#### 2.2.3 Withholding tax (podatek u źródła) — the biggest sleeper risk

This is where founders get burned. Polish WHT applies to certain outbound payments to **non-residents** (foreign individuals or entities). The base rate is **20% on intangible services, advisory, advertising, marketing**.

**Does affiliate commission count as "advertising/marketing"?** **Almost certainly YES**, per Polish tax practice. The fact that the payment is recurring and per-conversion does not change the underlying classification.

**The escape hatches:**
1. **Double Tax Treaty (DTT) reduction** — Poland has 90+ DTTs. Most reduce WHT on marketing/advertising to **0%** for treaty-country residents who provide a valid **tax residency certificate** (CFR / certyfikat rezydencji podatkowej) issued by their home country's tax authority. **tadaify must collect this certificate from every paid affiliate before issuing the first payout, and must verify it's valid on the payment date** ([taxsummaries.pwc.com/poland/corporate/withholding-taxes](https://taxsummaries.pwc.com/poland/corporate/withholding-taxes), [crowe.com/pl/en-us/services/doradztwo-podatkowe/withholding-tax](https://www.crowe.com/pl/en-us/services/doradztwo-podatkowe/withholding-tax)).
2. **PLN 2,000,000 threshold** — payments below PLN 2m/year per recipient generally don't trigger the more onerous "pay-and-refund" mechanism. tadaify is well below for any single affiliate.
3. **For payments to companies (not individuals)** — exemptions are broader; for individuals, exemption requires DTT + tax residency cert specifically.

**Operational recommendation:**
- Build affiliate onboarding to require: "If you live outside Poland, upload your tax residency certificate (CFR). Without it, we will withhold 20% Polish withholding tax."
- For the payout-management UI, show "withholding status: not provided / valid / expired" for each affiliate.
- Annual: file CIT-10Z / IFT-1R (information forms) with Polish tax authority listing all WHT events.
- This is **non-optional**. Get a Polish księgowa to set up the WHT process before the first foreign-affiliate payout.

#### 2.2.4 Affiliate-as-employee reclassification risk

Polish tax authorities have a track record of reclassifying high-recurring-payment "contractor" relationships as covert employment (umowa-zlecenie), particularly when:
- The "contractor" is paid regularly (monthly).
- The relationship is exclusive or quasi-exclusive.
- The "contractor" performs work essentially identical to an employee's.

**For affiliate commissions, this risk is LOW** because:
- Affiliates are not exclusive — they can promote any competitor.
- Affiliates do not perform any defined work for tadaify; they earn from results.
- Compensation is performance-based, not time-based.

**Mitigations to lock in low risk:**
- ToS explicitly frames the relationship as "marketing partnership; affiliate is independent, free to promote competing products, no work hours, no exclusive obligation."
- No single affiliate accounts for >X% of tadaify's affiliate spend (concentration risk). My suggestion: cap at 25% per affiliate by year 2; flag at 15%.
- Pay only on conversion, never on activity (clicks/impressions only would push it closer to a service contract).

#### 2.2.5 MOSS / OSS / IOSS — relevance

**Not relevant for affiliate payouts.** OSS/IOSS apply to VAT collection on B2C sales of digital services to EU consumers. Affiliate commission is a payment FROM tadaify TO the affiliate (not a sale). Different direction.

**OSS/IOSS WILL be relevant for creator monetisation v2** — when tadaify takes a platform fee on a creator's sale to an end-user, tadaify must charge VAT on the platform fee (OSS) at the end-user's country rate. (Confirm with the Polish księgowa; OSS rules around platform-vs-marketplace are still evolving in 2025-26.)

#### 2.2.6 AML

For a Polish JDG/sp. z o.o. acting as a Connect platform on Stripe:
- Stripe handles AML/KYC on the connected accounts (affiliates).
- tadaify's residual obligation: keep records of payments, file high-volume payment reports if any single affiliate crosses local thresholds (rare).
- For payouts < PLN 15k/recipient/year, no specific AML obligation beyond standard bookkeeping.

#### 2.2.7 JDG vs sp. z o.o. — when to incorporate

| Factor | Stay JDG | Incorporate sp. z o.o. |
|---|---|---|
| Annual revenue < PLN 200k | ✓ | — |
| Annual revenue PLN 200k-1M | borderline | — |
| Annual revenue > PLN 1M | — | ✓ |
| Multiple founders / equity needed | — | ✓ |
| Liability risk (creators suing for lost income) | — | ✓ |
| Selling the business | — | ✓ |
| Investor entry | — | ✓ |
| Outbound payments > PLN 100k to foreign affiliates | borderline | ✓ — better WHT optics |

**Recommendation:** stay JDG through the first ~12 months (until >PLN 500k/yr revenue or first material outside-PL contract). Switch to sp. z o.o. when:
- Revenue is consistently >€10k/mo
- First investor inquires about equity
- Material customer-facing liability surfaces (e.g. a creator claims tadaify caused them loss)

The transition is well-trodden — księgowa handles in 4-6 weeks at PLN 5-10k cost.

### 2.3 Same questions for creator monetisation (Paid articles / Shop / Tip jar)

Creator monetisation is a *different beast* than affiliate. The legal weight is much higher because tadaify is now intermediating payments between *third parties* (the creator's customer pays the creator).

#### 2.3.1 Marketplace vs reseller

| Model | What it means | Who issues invoice to end-user | VAT obligation | Examples |
|---|---|---|---|---|
| **Marketplace / Facilitator** | Platform connects buyer + seller. Money flows buyer → platform → seller. Seller is the merchant; platform takes a fee. | The seller (creator) | Each creator handles their own VAT on the gross sale. Platform charges VAT on its platform fee. | Stripe Connect Standard, Substack, Patreon, Etsy |
| **Reseller / Merchant of Record (MoR)** | Platform legally buys from the creator, then resells to the end-user. Platform is the merchant. | The platform | Platform handles ALL VAT (collects from buyer, pays to creator's tax authority). Creator just gets net royalty. | Lemon Squeezy, Paddle, Gumroad |

**For tadaify specifically:**
- **Marketplace via Stripe Connect Standard** — recommended for v1 of creator monetisation. Lower friction, lower platform liability, but each creator must handle their own VAT (and this is exactly where DAC7 kicks in — see §2.3.3).
- **Merchant-of-Record via Lemon Squeezy or Paddle** — recommended only if VAT compliance becomes existential. Higher fee (5%+€0.50/txn vs Stripe ~1.5-2.9%) but tadaify offloads ALL the VAT/tax burden. Worth considering if tadaify's audience skews heavily into VAT-complex jurisdictions (high-volume EU B2C).

The current trend in creator-economy SaaS is **marketplace** (Substack, Beacons, Stan, Whop, Patreon all do this). MoR (Lemon Squeezy, Paddle) is the safer-but-pricier alternative. I recommend tadaify start as a marketplace and revisit at v3 if the VAT/DAC7 ops becomes painful.

References:
- [stripe.com/connect](https://stripe.com/connect)
- [www.lemonsqueezy.com/reporting/merchant-of-record](https://www.lemonsqueezy.com/reporting/merchant-of-record)
- [docs.lemonsqueezy.com/help/payments/merchant-of-record](https://docs.lemonsqueezy.com/help/payments/merchant-of-record)

#### 2.3.2 PSD2 — does tadaify need a payment-institution license?

**No, as long as tadaify uses Stripe Connect Standard or equivalent.** Stripe (via STEL EMI license) is the regulated payment institution. tadaify is a "platform user." This is the entire point of Connect Standard.

If tadaify ever decides to *hold customer funds itself* (e.g. an in-platform wallet that creators can withdraw from), it WOULD trigger PSD2 / PSD3 license requirements. Don't go there. ([stripe.com/guides/how-psd2-impacts-marketplaces-and-platforms](https://stripe.com/guides/how-psd2-impacts-marketplaces-and-platforms))

#### 2.3.3 DAC7 reporting — yes, when shipping creator monetisation

DAC7 (EU directive, in force in Poland since 2024-07-01) requires "platform operators" to report annual revenue by "seller" to tax authorities. ([pbl.legal/insights/dac7-reporting-content-creators-platform-rules](https://pbl.legal/insights/dac7-reporting-content-creators-platform-rules/), [rsm.global/poland/en/insights/tax/dac7-reporting-registration](https://www.rsm.global/poland/en/insights/tax/dac7-reporting-registration))

**Thresholds:**
- "Goods" sellers: report when seller >€2,000 OR >30 transactions/year.
- "Services" sellers (incl. content/digital): NO threshold — every seller reported.
- Reporting deadline: **31 January each year** for previous-year activity.

**Does affiliate-only flow trigger DAC7?** **NO.** DAC7 is about platforms facilitating sales BETWEEN sellers and buyers. tadaify paying its own commission to its affiliates is not a DAC7 transaction — it's an internal marketing expense. Patreon explicitly distinguishes: DAC7 applies to creator earnings from members, NOT to Patreon's own contractor payments.

**Does creator monetisation v2 trigger DAC7?** **YES.** Once a creator's article/product/tip is sold via tadaify and tadaify keeps a fee, tadaify is a platform operator. tadaify must:
- Register as a Polish DAC7 platform operator before launch.
- Collect each creator's tax info: legal name, residence address, tax ID (PESEL/NIP for PL, equivalent for foreign), VAT-ID if any.
- Annually report each creator's gross revenue + tadaify fees + transaction count to Polish tax authority by 31 January.
- Provide creators with their reporting summary by 31 January (so they can file their own taxes).

**Implementation cost (my analysis):** ~2 weeks of dev time to build the data model + reporting pipeline + admin export. Polish księgowa handles the actual filing. ~PLN 3-5k/yr ops cost.

#### 2.3.4 Refunds, chargebacks, disputes

In Stripe Connect Standard:
- If end-user disputes a charge → Stripe debits the **creator's connected account** (not tadaify's platform balance) by default.
- BUT if the creator's balance is insufficient → Stripe debits **tadaify's platform balance** to cover, and tadaify has to chase the creator.
- This is a real cash-flow risk; some platforms (Substack, Patreon) hold creator earnings for 7-30 days specifically to provision for chargebacks.

**Recommendation for v2:** mirror Substack — hold creator earnings for **14 days** before transfer to creator's connected account. Display "available 14 days from sale" in creator dashboard. Mention in ToS that tadaify can claw back transfers in case of dispute.

#### 2.3.5 Invoicing — who issues to the end-user?

In **marketplace** mode (Stripe Connect Standard):
- The CREATOR is the merchant of record from a tax perspective.
- Stripe sends a generic receipt to the end-user.
- The CREATOR is responsible for issuing a VAT invoice if requested by an EU B2B end-user.
- Tadaify can build an "invoice generation" feature for creators (per-sale PDF), but tadaify is NOT the issuer — the creator is.

In **MoR** mode (Lemon Squeezy/Paddle):
- The PLATFORM issues the invoice to the end-user.
- The platform handles all VAT.
- The creator just gets a royalty statement.

**This is a big driver in MoR vs marketplace decision.** EU creators selling to EU B2B customers will be VERY GLAD if tadaify acts as MoR (saves them from VAT registration). Solo / small creators selling B2C to global retail customers don't really care.

### 2.4 Case studies

Compressed summaries of how creator-economy platforms handle this:

**Linktree.** Operates as a marketplace via affiliate networks (Awin/Impact) for Linktree Shops. Doesn't disclose its own commerce backend in detail, but appears to be Stripe-based. Uses Awin for creator-affiliate-program tracking.

**Beacons.ai.** Stripe Connect Standard, US-based. Public referral program at 25% lifetime; strict self-referral block. Uses Stripe for both billing AND creator-monetisation payouts. ([help.beacons.ai/en/articles/4705537](https://help.beacons.ai/en/articles/4705537))

**Stan Store.** Same pattern — Stripe Connect, US-based. 20% lifetime affiliate. ([help.stan.store/article/89](https://help.stan.store/article/89-what-is-stans-referral-or-affiliate-program))

**Whop.** Stripe Connect, manual review for affiliates, 30% for 6 months. Aggressive about anti-fraud (30-day commission hold, 18+ application). ([docs.whop.com/manage-your-business/growth-marketing/affiliate-program](https://docs.whop.com/manage-your-business/growth-marketing/affiliate-program))

**Gumroad.** US-based, Stripe Connect. Operates closer to MoR for creator sales — Gumroad is the merchant for tax purposes. Per-product affiliate splits.

**Lemon Squeezy.** Pure MoR. Acquired by Stripe in July 2024. Charges 5%+€0.50/txn flat. Handles ALL VAT/tax/invoicing globally for creators. Best path for creators selling SaaS-licensed software, courses, or anything where VAT is messy. ([www.lemonsqueezy.com](https://www.lemonsqueezy.com), [www.lemonsqueezy.com/reporting/merchant-of-record](https://www.lemonsqueezy.com/reporting/merchant-of-record))

**Substack.** Marketplace via Stripe Connect. Takes 10% platform fee. Did NOT have a creator-affiliate program until very recently (creator-referral badge in 2024). Implements 14-day creator-earnings hold for chargeback provisioning. Files DAC7 for EU creators. ([support.substack.com/hc/en-us/articles/8946512015892](https://support.substack.com/hc/en-us/articles/8946512015892-Does-Substack-have-a-referral-program))

**Beehiiv.** Marketplace pattern. Heavy investment in affiliate program — 50% / 12mo, with referred-creator double-sided benefit. Generates 12-14% of MRR via affiliates per their own published numbers (2024). On track for $1.2-1.5M affiliate revenue in 2024. ([beehiiv.com/blog/beehiiv-partner-program-promotion](https://www.beehiiv.com/blog/beehiiv-partner-program-promotion))

**Patreon.** Marketplace via Stripe Connect (US) + Payoneer (non-US). DAC7-compliant for EU creators. NO creator-to-creator affiliate program. Payouts via Stripe. ([support.patreon.com/hc/en-us/articles/360047578411](https://support.patreon.com/hc/en-us/articles/360047578411-EU-Creator-Frequently-Asked-Tax-Questions))

### 2.5 Recommendations for tadaify (locked decision matrix)

| Decision | Recommendation | Rationale |
|---|---|---|
| **Affiliate payout rail** | **Stripe Connect Standard** | Already on Stripe, lowest ops, regulatory cover via STEL |
| **Creator monetisation v2 rail** | **Stripe Connect Standard (marketplace)**; revisit Lemon Squeezy MoR if VAT ops becomes existential | Mainstream creator-SaaS pattern, lower fees |
| **Legal model** | **Marketplace** (not reseller / not MoR) at v1-v2 | Aligns with Substack/Beacons/Stan; revisit when VAT pain forces MoR |
| **DAC7** | NOT required for affiliate v1; REQUIRED for creator monetisation v2; register as Polish platform operator before v2 launch | Patreon precedent |
| **VAT** | tadaify charges VAT on its platform fee (OSS for cross-border B2C); each creator handles their own VAT on their gross sale | Marketplace standard |
| **WHT (foreign affiliates)** | Collect tax-residency certificate from every paid affiliate before first payout; default to 20% WHT if none provided | Polish tax law mandate |
| **JDG vs sp. z o.o.** | Stay JDG until ~PLN 500k/yr revenue or first investor inquiry; then move to sp. z o.o. | Standard SaaS-founder trajectory |
| **Affiliate-employee reclassification** | Mitigate via ToS (independent contractor framing), no exclusivity, performance-based pay only, concentration cap (no single affiliate >25% of spend) | Low risk if ToS is clear |
| **Chargeback handling** | Hold creator earnings 14 days before transfer; reserve right to claw back via ToS | Substack precedent |
| **Onboarding flow** | Affiliate clicks "Become an affiliate" → ToS accept → Stripe Connect Standard onboarding (Stripe-hosted) → upload tax residency certificate → first payout enabled after 1 valid referred customer + 45-day hold | One coherent path |

**Specific contract / T&C clauses to include in tadaify's Affiliate Agreement:**
1. **Independent contractor / marketing partnership** — "Affiliate is an independent contractor; no employment, no agency, no exclusivity. Affiliate is free to promote competing services."
2. **Self-referral exclusion** — "Affiliate may not refer themselves, their employees, or any other entity controlled by the Affiliate. Self-referrals will be voided and any commission paid clawed back."
3. **Hold period** — "Commissions are accrued upon a Referred User's first paid invoice and become payable 45 days thereafter, subject to refund/chargeback adjustment."
4. **Withholding tax** — "If Affiliate is a non-Polish individual, Affiliate must provide a valid tax residency certificate. Without it, tadaify will deduct 20% Polish withholding tax from each payout."
5. **VAT** — "Affiliate is responsible for invoicing tadaify in compliance with their local VAT regulations. EU B2B affiliates must use reverse-charge mechanism per VAT Directive 2006/112/EC Art. 196."
6. **Termination** — "Tadaify may terminate this agreement at any time, including for fraud, ToS violations, or business reasons. On termination, accrued unpaid commissions remain payable; future commissions cease."
7. **Jurisdiction** — "Polish law; Warsaw courts."
8. **Concentration cap** — "If Affiliate's monthly commission exceeds 25% of tadaify's total affiliate spend, tadaify may renegotiate terms to ensure compliance with Polish employment-reclassification rules."
9. **DAC7 (when v2 ships)** — "Affiliate's earnings are reportable to Polish tax authorities under DAC7. Affiliate must provide accurate tax-identification information."

### 2.6 Topic 2 — open decisions (DEC candidates)

#### DEC-XXX-F — Connect account type
- **Czego dotyczy:** Standard / Express / Custom for both affiliates AND future creators
- **Szczegolowy opis:** Standard offloads everything to Stripe (KYC, dashboard, tax forms) but tadaify can't deduct application_fee at charge-time. Express is more branded but adds €2/mo per active account. Custom is overkill.
- **Opcje:**
  1. Standard for both (research recommendation)
  2. Express for both (white-labeled, more control, +€2/mo/account)
  3. Standard for affiliates, Express for creators v2
- **Rekomendacja:** option 1.

#### DEC-XXX-G — MoR for creator monetisation v2
- **Czego dotyczy:** marketplace via Stripe Connect Standard vs MoR via Lemon Squeezy/Paddle
- **Szczegolowy opis:** Marketplace = lower fees (1.5-2.9%) but each creator handles their own VAT. MoR = higher fees (5%+€0.50) but tadaify offloads ALL VAT/tax/invoicing.
- **Opcje:**
  1. Marketplace at v2, revisit at v3 if VAT pain (research recommendation)
  2. MoR from day 1 (higher fees but cleaner ops)
  3. Hybrid — Stripe for tip-jar / shop, Lemon Squeezy for paid articles
- **Rekomendacja:** option 1.

#### DEC-XXX-H — DAC7 platform-operator registration
- **Czego dotyczy:** when to register as Polish DAC7 platform operator
- **Szczegolowy opis:** Required by law before tadaify facilitates a creator-to-end-user sale. NOT required for affiliate-only flow.
- **Opcje:**
  1. Register only when shipping creator monetisation v2 (research recommendation)
  2. Register pre-emptively now (prep work for v2)
- **Rekomendacja:** option 1; saves PLN 5k/yr until needed.

#### DEC-XXX-I — Tax residency certificate enforcement
- **Czego dotyczy:** how strict to be on collecting CFR before first payout
- **Opcje:**
  1. Block first payout until CFR uploaded (strict, research recommendation)
  2. Withhold 20% on first payout if missing, refund retroactively when uploaded (lenient)
  3. Withhold 20% with no refund mechanism (strictest)
- **Rekomendacja:** option 1.

#### DEC-XXX-J — Hold period for chargeback provisioning (creator monetisation v2)
- **Opcje:** 7 / 14 / 21 / 30 days
- **Rekomendacja:** 14 days (Substack precedent).

#### DEC-XXX-K — Engage Polish księgowa now or after launch
- **Czego dotyczy:** timing of Polish tax-advisor engagement
- **Opcje:**
  1. Engage now (PLN 800-1500/mo retainer)
  2. Engage at first paid affiliate
  3. Engage at first material foreign payout
- **Rekomendacja:** option 1. Cost-of-error on WHT is much higher than 12 months of retainer.

#### DEC-XXX-L — JDG → sp. z o.o. trigger
- **Opcje:** revenue threshold (PLN 200k / 500k / 1M / 2M annual)
- **Rekomendacja:** PLN 500k/yr, OR first investor entry, OR first material liability surface — whichever first.

---

## Topic 1 + Topic 2 — combined open decisions, framed as DEC table v2

**(For founder convenience, here's the same DEC list as a single batch, ID-spaces left for filing.)**

| ID | Czego dotyczy | Szczegolowy opis | Opcje | Rekomendacja |
|---|---|---|---|---|
| A | Affiliate commission % + duration | Founder's working model: 30%-lifetime. Research: 30%/24mo + lifetime as tier reward, bounded liability | 1) 30% lifetime / 2) 30% 24mo + Gold tier lifetime / 3) 25% lifetime | 2 |
| B | Affiliate eligibility | Open-to-all is high-fraud, paid-tier-after-1-invoice is balanced | 1) All / 2) Paid creators with 1+ invoice / 3) Curated | 2 |
| C | Referred-creator double-sided benefit | Boosts conversion ~40-65%; cost ~$10/conversion | 1) None / 2) 30 days Creator free / 3) 50% off 3 months | 2 |
| D | Attribution + cookie | Industry default is 60-90 days last-click | 1) 30d / 2) 60d / 3) 90d | 2 |
| E | Affiliate platform: in-house vs Rewardful/Tolt | In-house at v1, SaaS later when affiliate revenue >$10k/mo | 1) In-house / 2) Rewardful / 3) Tolt / 4) PartnerStack | 1 |
| F | Stripe Connect account type | Standard offloads everything to Stripe but no charge-time fee deduction | 1) Standard for both / 2) Express for both / 3) mix | 1 |
| G | MoR for creator monetisation v2 | Marketplace cheaper, MoR cleaner | 1) Marketplace / 2) MoR / 3) Hybrid | 1 |
| H | DAC7 registration timing | Required before creator monetisation v2 only | 1) At v2 launch / 2) Pre-emptive now | 1 |
| I | CFR (tax residency cert) enforcement | Strict reduces WHT exposure | 1) Block first payout / 2) Withhold + refund / 3) Withhold no refund | 1 |
| J | Chargeback hold period (v2) | Substack uses 14 days | 1) 7d / 2) 14d / 3) 21d / 4) 30d | 2 |
| K | Engage Polish księgowa | Cost of error >> retainer cost | 1) Now / 2) At first paid affiliate / 3) At first foreign payout | 1 |
| L | JDG → sp. z o.o. trigger | Revenue + investor + liability triggers | 1) PLN 200k/500k/1M/2M annual or investor entry | 500k OR investor OR liability |

---

## Sources

Cited inline throughout. The most load-bearing references:

**Competitor programs:**
- Beacons referral T&C — https://help.beacons.ai/en/articles/4705537
- Stan Store referral FAQ — https://help.stan.store/article/89-what-is-stans-referral-or-affiliate-program
- Beehiiv partner program — https://www.beehiiv.com/partners
- ConvertKit/Kit affiliate FAQ — https://help.kit.com/en/articles/5982708-new-affiliate-program-faq
- Webflow affiliate overview — https://webflow.com/solutions/affiliates
- Whop affiliate docs — https://docs.whop.com/manage-your-business/growth-marketing/affiliate-program
- Linktree Shops affiliate model — https://help.linktr.ee/en/articles/8619620-how-to-promote-affiliate-links-with-linktree
- Koji referral (historical) — https://blog.withkoji.com/referral-affiliate/

**SaaS affiliate benchmarks:**
- Rewardful 2025 SaaS benchmark report — https://www.rewardful.com/articles/saas-affiliate-program-benchmarks
- Supademo SaaS affiliate review — https://supademo.com/blog/saas-affiliate-programs

**Stripe Connect:**
- Stripe Connect pricing — https://stripe.com/connect/pricing
- Stripe Connect docs (charges) — https://docs.stripe.com/connect/charges
- Separate charges and transfers — https://docs.stripe.com/connect/separate-charges-and-transfers
- Stripe Connect + PSD2 FAQ — https://stripe.com/guides/frequently-asked-questions-about-stripe-connect-and-psd2
- Cross-border payouts — https://docs.stripe.com/connect/cross-border-payouts

**Polish + EU tax:**
- PwC Poland — Withholding taxes — https://taxsummaries.pwc.com/poland/corporate/withholding-taxes
- Crowe Poland — WHT — https://www.crowe.com/pl/en-us/services/doradztwo-podatkowe/withholding-tax
- Marosa VAT — Reverse charge in Poland — https://marosavat.com/manual/vat/poland/reverse-charge/
- DAC7 Polish implementation (RSM) — https://www.rsm.global/poland/en/insights/tax/dac7-reporting-registration
- DAC7 for content creators (PBL Legal) — https://pbl.legal/insights/dac7-reporting-content-creators-platform-rules/
- KPMG EU Tax Centre — DAC7 state-of-play — https://kpmg.com/xx/en/our-insights/eu-tax/etf-503-eu-reporting-requirement-for-platform-operators-state-of-play-of-domestic-implementation-of-dac7.html
- Polish affiliate tax practice (Infor) — https://ksiegowosc.infor.pl/podatki/pit/734353,Jak-rozliczac-dochody-z-uczestnictwa-w-programach-partnerskich.html
- JDG sole proprietor in Poland (Deel) — https://www.deel.com/blog/sole-proprietorship-poland/

**Anti-fraud:**
- Refgrow — How to prevent affiliate fraud — https://refgrow.com/how-to-prevent-affiliate-fraud
- Rewardful — Affiliate fraud tactics — https://www.rewardful.com/articles/affiliate-fraud-tactics

**MoR / Marketplace alternatives:**
- Lemon Squeezy MoR — https://www.lemonsqueezy.com/reporting/merchant-of-record
- Lemon Squeezy MoR docs — https://docs.lemonsqueezy.com/help/payments/merchant-of-record

**Case studies (creator economy):**
- Patreon EU tax FAQ — https://support.patreon.com/hc/en-us/articles/360047578411-EU-Creator-Frequently-Asked-Tax-Questions
- Patreon DAC7 — https://support.patreon.com/hc/en-us/articles/21712170817293-EU-Creator-Introduction-to-income-reporting-requirements-DAC7
- Substack referral — https://support.substack.com/hc/en-us/articles/8946512015892-Does-Substack-have-a-referral-program

**Payout rails comparison:**
- Trolley vs Tipalti — https://tipalti.com/resources/learn/trolley-competitors-and-alternatives/
- Trolley payout-platform comparison — https://trolley.com/blog/how-to-choose-the-right-global-payouts-platform/
