---
type: research
project: tadaify
title: Paid articles / paid content — competitive landscape, payment infrastructure, take-rate, recommendation
created_at: 2026-04-25
author: orchestrator-opus-4.7
status: draft-for-review
---

# Paid articles / paid content — research + recommendation

> SPIKE owner: orchestrator (Opus 4.7). Dispatched 2026-04-25 in response to user
> direction: "Paid articles like on X. We need big research on HOW we collect the
> money and pay creators." Two axes: (1) should tadaify ship paid content, (2) if
> yes, how does the money flow end-to-end. Output is advisory — no code, no
> migrations, no schema writes until DEC-PAID-CONTENT-01 is answered.

---

## Executive summary (verdict in 5 lines)

1. **Verdict:** Adopt — **phased**. Ship paid content **both** as à-la-carte single-article unlocks **and** as a creator-subscription tier, in a single Pro-tier-gated bundle.
2. **Processor:** **Stripe Connect Express** + **Stripe Tax**. Lemon Squeezy's Merchant-of-Record model is cheaper on compliance effort but eats 3-5pp more of creator revenue and caps our product surface. Stripe is the right long-term floor.
3. **Take rate:** **Hybrid** — 8% on Free/Creator tiers, **0% on Pro** (Stripe's processor fee still applies). Pro tier becomes self-financing around $30-50/mo of creator paid revenue; below that, the 8% generates incremental platform revenue.
4. **Model:** Day-1 ship à-la-carte per-article unlocks + soft paywall. Month-2-3 add monthly/yearly creator subscriptions. Bundle both behind one checkout flow.
5. **Mobile:** web-only at launch. Native app (if ever) is a viewer, not a marketplace — bypasses 30% Apple/Google IAP.

Four DECs surfaced for the user (not yet logged to `decisions.json` — orchestrator will log when user accepts to read this doc):

- **DEC-PAID-CONTENT-01** (parent) — adopt / partial / reject
- **DEC-PAID-PROCESSOR-01** — Stripe Connect Express vs Lemon Squeezy MOR vs Paddle
- **DEC-PAID-TAKERATE-01** — flat 5% / flat 10% / hybrid (0% on Pro) / Pro-tier gated
- **DEC-PAID-MODEL-01** — subscriptions only / à-la-carte only / both from day 1

---

## 1. Competitive landscape — paid content in 2026

Paid-content platforms in 2026 fall into four archetypes:

1. **Pure subscription** (Substack, Ghost): creator sets $N/mo, paywall on everything or per-post.
2. **Pure à-la-carte** (Gumroad, X Paid Articles original form): buy one thing, one time.
3. **Tier-based subscription + community** (Patreon, Mighty Networks): tiers unlock different content + chat/DMs/community.
4. **Hybrid platforms** (Beehiiv, Ko-fi, Buy Me a Coffee): subscriptions + à-la-carte + tips in one dashboard.

### Competitor matrix

| Platform | Model | Creator take (after platform) | Platform take | Processor take | Processor | Payout schedule | Tax / MoR | Paywall UX |
|---|---|---|---|---|---|---|---|---|
| **Substack** | Subscription | ~87% | 10% | ~2.9% + 30¢ | Stripe Connect Express | 5-10 business days | Creator handles; Stripe Tax optional | Hard (title + teaser + CTA) |
| **Ghost (Pro)** | Subscription (Stripe-direct) | ~97% | **0%** | 2.9% + 30¢ | Stripe (creator's own connected account) | Per Stripe (2-7d) | Creator handles fully | Hard or soft (creator-choice) |
| **Medium Partner Program** | Algorithmic revenue share | Variable (est. 10-25%) | ~50-60% effective | — | Stripe payouts | Monthly | Medium handles | Metered (5 free/mo, then wall) |
| **Patreon** | Tiered subscription | 88-95% | **5% / 8% / 12%** (Lite/Pro/Premium) | +2.9% + 30¢ | Stripe | 1st of month, batch | Handled for EU VAT | Tier-gated |
| **Beehiiv** | Subscription (paid newsletter) | ~97% | **0%** on paid tier ($39-99/mo flat SaaS) | 2.9% + 30¢ | Stripe Connect | Daily/weekly | Creator handles | Hard or metered |
| **Mighty Networks** | Subscription + community | ~92-94% | ~3-6% (tier-dependent, plus $41-179/mo SaaS) | 2.9% + 30¢ | Stripe | Weekly | Creator handles | Community-gated |
| **Ko-fi** (Gold) | Tips + paid posts + shop | ~97% on Gold ($72/yr flat) | **0%** on Gold tier | 2.9% + 30¢ | Stripe / PayPal | Instant (Stripe) | Creator handles | Tip-jar + optional paywall |
| **Buy Me a Coffee** | Tips + memberships + paid posts | 95% | **5%** | 2.9% + 30¢ | Stripe | 5-7 business days | Creator handles | Hard paywall |
| **Gumroad** | À-la-carte + subs | ~90% (recently dropped to flat 10%) | **10% flat** (was 9%+30¢ before 2023) | Included (Gumroad is MoR-ish) | Stripe + PayPal | Weekly | **Gumroad is MoR** — handles EU VAT | Download / gated reader |
| **Memberful** | Subscription (Stripe-direct) | ~97% | **$25-100/mo SaaS** + 0% or 4.9% (Starter) | 2.9% + 30¢ | Stripe (creator's) | Per Stripe | Creator handles | Plugin-driven |
| **OnlyFans** | Subscriptions + PPV + tips | 80% | **20%** | Included | Internal (Paxum/Segpay/Stripe region-dependent) | Weekly or on-demand ($20 min) | Platform handles | Hard paywall |
| **Lemon Squeezy** | À-la-carte + subscriptions | ~92% | **5% + 50¢** per transaction | Included (MoR) | Internal | Weekly (Stripe payout) | **Full MoR** — handles global VAT/GST/sales tax | Download or link gate |
| **Paddle** | À-la-carte + subscriptions | ~90-95% | **5% + 50¢** or **10% flat** (Paddle Billing tiers) | Included (MoR) | Internal | Weekly/bi-weekly | **Full MoR** | Plugin / redirect checkout |
| **X (Paid Articles)** | Subscriptions + per-article | Variable — X Premium+ creators only | **Unclear publicly — estimated 10%**; Apple IAP eats 30% on mobile | 2.9% + 30¢ web / 30% mobile | Stripe (web) / Apple/Google (mobile) | Monthly batch | X handles | Hard paywall (title + teaser) |
| **Stripe (direct, no platform)** | DIY | 97.1% − 30¢ | 0% | 2.9% + 30¢ | Stripe | 2-7 days | Via Stripe Tax (+0.5% / transaction) | Creator-built |

**Sources (plausible, as of 2026-Q1):** Substack [help.substack.com/hc/en-us/articles/360037466312], Gumroad pricing post (Sahil Lavingia, 2023), Patreon fees page, Beehiiv pricing page, Ghost Pro docs, Memberful pricing, Paddle + Lemon Squeezy published fee schedules, X Premium Creator docs (2024 rollout). Numbers in the table are the current-best-public at time of writing; any production decision must re-verify.

### Observations

- **10% is the norm for "platform + Stripe + we handle everything"** (Substack, Gumroad). 5% is the discount leader (Patreon Lite, Buy Me a Coffee, Lemon Squeezy's effective net-of-MoR). 0% on creator-tools-as-SaaS (Ghost, Beehiiv, Memberful) — they charge the creator a flat monthly SaaS fee instead of a revenue cut.
- **Merchant of Record (MoR) platforms (Gumroad, Paddle, Lemon Squeezy) charge more** because they absorb tax + chargeback + fraud risk. For indie creators selling <$500/mo, the convenience is worth it. For professional creators at >$5k/mo, the 3-5pp cut vs pure Stripe is painful.
- **Mobile IAP is the elephant.** X Paid Articles bleeds 30% to Apple/Google on any iOS/Android reader because Apple classifies article unlocks as "digital goods". Web-only bypass preserves margin but loses mobile-app distribution.
- **Payout schedules vary from instant (Ko-fi + Stripe) to monthly batch (Patreon, Medium).** Faster payout = creator trust = stickiness. 2-7-day default (standard Stripe Connect Express) is the acceptable floor.

---

## 2. Payment processor evaluation

### 2.1 Options matrix

| Option | Fee (creator-facing net) | Tax handling | Our dev effort | Creator UX | Global reach | Our control |
|---|---|---|---|---|---|---|
| **Stripe Connect Express** | 2.9% + 30¢ + our take | Stripe Tax +0.5% per txn (optional) | Medium — onboarding flow, webhook plumbing, KYC UI | Excellent — embedded Stripe UX | 46+ countries | Full — we set take rate, payout cadence |
| **Stripe Connect Standard** | 2.9% + 30¢ + our take | Creator handles fully | Low integration, high creator-side burden | Creator needs own Stripe account | 46+ countries | Less — creator owns the account |
| **Lemon Squeezy** | 5% + 50¢ per transaction (all-in) | **Full MoR — global** | Low — redirect or embedded checkout | Good; not brand-native | Global | Limited — they own the buyer relationship |
| **Paddle (Billing)** | 5% + 50¢ or 10% flat (depending on plan) | **Full MoR — global** | Low — redirect or JS SDK | Good | Global | Limited |
| **PayPal Commerce Platform** | 2.9-3.49% + fixed | Creator handles | Medium | Dated UX, but useful as fallback | Global | Medium |
| **Apple/Google IAP** | 30% (15% <$1M rev) | Apple/Google handle | Very high (native SDK) | Best on iOS/Android | Global | Very limited |
| **Crypto / Lightning** | 0-1% | Legally ambiguous per country | Very high, edge cases | Niche | Global, but small | Full |
| **Manual bank transfer + invoice** | 0% | Creator handles | Very high (manual ops) | Terrible | Limited | — |

### 2.2 Recommendation

**Stripe Connect Express as primary, Stripe Tax as the EU/US compliance shim, no secondary processor at MVP.** Rationale:

- Stripe's share of the competitive set is **overwhelming** — Substack, Ghost, Patreon, Beehiiv, Memberful, Mighty Networks, Buy Me a Coffee, and Ko-fi Gold all use Stripe as the underlying rail. Betting against Stripe is betting against the marketplace-platform category.
- Stripe Connect Express is the exact product Substack and Patreon use. It handles KYC, 1099-K forms (US), embedded onboarding, and payouts without us touching the money flow. We are not liable as an MoR — the creator is the merchant; we're the platform.
- Stripe Tax at +0.5%/transaction solves EU VAT MOSS, US sales tax, and UK VAT in one integration. Costs ~$2-5/mo flat + per-transaction. Cheaper than manually registering for VAT in 27 EU countries.
- Lemon Squeezy is tempting for **zero tax complexity** but: (a) it positions them as the merchant — receipts say "Lemon Squeezy Inc" which weakens our brand, (b) 5% + 50¢ hurts high-priced articles (on a $2 article the 50¢ is 25%), (c) lock-in: exporting buyer lists from Lemon Squeezy is harder than from Stripe, (d) it caps our future product surface — harder to do custom flows like bundles, split-payouts with collaborators, or Enterprise invoicing.
- Paddle is similar to Lemon Squeezy with a better indie-dev reputation; same structural objections apply.
- PayPal is a **fallback-only** option; creators in PL / DE / some LATAM markets trust PayPal more than Stripe. Defer to phase 2.
- Apple/Google IAP is only relevant **if** we ship a native app and sell digital goods inside it. Recommendation: ship web-only.

**Expected Stripe fee economics on a $5 article** (US consumer → US creator, 8% tadaify take):
- Gross: $5.00
- Stripe: 2.9% + 30¢ = $0.445
- tadaify: 8% of gross = $0.40
- Creator net: $5.00 − $0.445 − $0.40 = **$4.155 (~83%)**

**Same article, Lemon Squeezy** (5% + 50¢):
- Gross: $5.00
- Lemon Squeezy all-in: $0.75
- Creator net: **$4.25 (~85%)** — slightly better, but tadaify gets $0 in this case.

**Same article, Stripe + tadaify Pro-tier (0% take)**:
- Gross: $5.00
- Stripe: $0.445
- tadaify: $0
- Creator net: **$4.555 (~91%)** — best case for creator who has paid $15/mo for Pro.

### 2.3 Stripe Connect Express dev effort estimate

- **Onboarding flow:** 2-3 days. Embed Stripe Connect onboarding with a return URL. Store `stripe_account_id` on `creator_users`.
- **Checkout:** 2-3 days. Stripe Checkout session creation per article/subscription, with `application_fee_amount` set to our take.
- **Webhooks:** 3-4 days. Listen for `checkout.session.completed`, `invoice.paid` (subscriptions), `charge.refunded`, `account.updated` (creator KYC status), `payout.failed`.
- **Payout UI for creator:** 1-2 days. Link to Stripe Express Dashboard (they host the earnings view).
- **Stripe Tax enablement:** 1 day. Toggle in Stripe Dashboard + per-product tax_code assignment.
- **Refund flow:** 2 days. Admin-visible refund button for creator; auto-revoke access.

Total: **~3 weeks of Sonnet/Opus implementation** for a production-quality MVP.

---

## 3. Take-rate model analysis

### 3.1 The three candidate models

**Model A — Flat take rate (5-10%)**
- Every paid article: tadaify takes 5-10% regardless of creator tier.
- Simple to explain. Continuous revenue stream for tadaify.
- Used by: Substack (10%), Patreon (5-12%), Gumroad (10%).

**Model B — Platform subscription covers everything (0% take on Pro)**
- Creator upgrades to tadaify Pro ($15/mo) → unlocks paid content + 0% take rate.
- Free/Creator tier: cannot sell paid content at all.
- Used by: Ghost Pro, Beehiiv, Memberful, Ko-fi Gold.
- Strong positioning: "keep 100% of your revenue" — undercuts Substack's 10% message.

**Model C — Hybrid**
- Free/Creator tier: can sell paid content, **8% tadaify take** per transaction.
- Pro tier ($15/mo): **0% take**.
- Business/Team tier (future): 0% + analytics + team accounts.
- Used by: Substack "Founder" vs professional conversions are basically this.
- Best of both worlds — creators can dip toes before upgrading; Pro tier self-finances around $30-50/mo creator revenue.

### 3.2 Creator-revenue math (break-even analysis)

Assume creator earns $X/mo from paid content. Which tadaify model is most attractive?

| Creator monthly paid revenue | Model A (flat 8%) — creator keeps | Model B (Pro $15 + 0% take) — creator keeps | Model C (8% on Free, 0% on Pro) — break-even at |
|---|---|---|---|
| $10 | $9.20 | $10 − $15 = **−$5** (loss) | Free tier wins |
| $30 | $27.60 | $30 − $15 = $15 | Free tier wins |
| $50 | $46.00 | $50 − $15 = $35 | Free tier wins ($46 > $35) |
| $100 | $92.00 | $100 − $15 = $85 | Free tier marginal — Free still wins by $7 |
| $200 | $184 | $200 − $15 = $185 | **Break-even at ~$188** — Pro starts to win |
| $500 | $460 | $500 − $15 = $485 | Pro wins by $25 |
| $1000 | $920 | $1000 − $15 = $985 | Pro wins by $65 |
| $5000 | $4600 | $5000 − $15 = $4985 | Pro wins by $385 |

**Break-even inflection** for an 8% flat vs Pro-$15 model: **$187.50/mo in creator paid revenue**. Below that, the creator is better on Free with 8% take. Above that, Pro is more efficient.

Insight: the **Model C hybrid** is elegant because:
- Small creators (vast majority) stay on Free and pay 8% — tadaify makes incremental money at zero UX friction.
- Professional creators upgrade naturally once they cross ~$200/mo — tadaify converts them to a $15/mo sticky subscription.
- Message is honest: "8% if you want to dip toes; upgrade to Pro when it pays for itself."

### 3.3 Tension with DEC-PRICELOCK-01 (price-lock-for-life)

If we've committed to price-lock-for-life on the Creator tier (DEC-PRICELOCK-01), a creator who locked in at $5/mo Creator **cannot later have paid-content access without upgrading**, which breaks the price lock promise.

**Resolution options:**
1. **Paid content is a separate unlock, not a tier gate.** Any tier can sell paid content; we apply 8% take across all tiers and drop the "Pro = 0%" message entirely.
2. **Price lock is tier-scoped.** Price lock applies to the Creator tier's features-at-time-of-lock; paid content is a post-lock feature that requires optional upgrade. Document this explicitly in Pricing page.
3. **Paid content is a separately-priced add-on.** $5/mo "Monetization" add-on on top of any tier; includes 0% take and paid features.

Recommend: **option 2** is cleanest and consistent with how Notion / Linear / GitHub treat plan upgrades. Price lock = current feature set at locked price; new features ship at current price. Add-on model (option 3) complicates the pricing grid.

### 3.4 Recommendation

**Hybrid (Model C) with 8% flat on Free/Creator, 0% on Pro.** Reasoning:

- Aligns creator incentives with tadaify growth (Pro upsell at $187/mo inflection).
- Competitive on message: "0% take on Pro" beats Substack's 10% flat.
- Preserves volume economics: the long tail of small creators generates meaningful take-rate revenue.
- Consistent with modern SaaS-creator-tool patterns (Ghost Pro, Beehiiv, Memberful all use variants).

Pro-tier bundle should include: (a) 0% take on paid content, (b) unlimited paid posts, (c) subscriber email list export, (d) advanced analytics. Everything else flows from this.

---

## 4. Content gating UX patterns

### 4.1 Pattern matrix

| Pattern | Example | Conversion | SEO impact | Leaks | Best for |
|---|---|---|---|---|---|
| **Hard paywall** (title + teaser + CTA) | X Paid Articles, OnlyFans | Medium-high | Bad — only title is crawlable | Minimal | Long-form premium, video |
| **Soft paywall** (first 30% visible, fade out, CTA) | Substack, Medium | High | Good — 30% crawlable | Medium — screenshots, reader-mode extensions | Newsletters, essays |
| **Metered paywall** (N free, then wall) | Medium, NYT | Very high for casual readers | Good — all content crawlable | Low (rate-limited) | High-volume publishers |
| **Free + tip jar** | Ko-fi, BuyMeACoffee | Low revenue / high goodwill | Perfect | N/A | Hobbyists, small creators |
| **Patron-only** (subscribers only, no single purchase) | Patreon | Lock-in model | Bad — private | Low | Community-heavy |
| **Email-gated** (give email → read) | Some newsletters | Medium (list growth, not revenue) | Bad | Very high | Lead-magnet content |

### 4.2 Recommendation

**Default: soft paywall (30% preview + fade + CTA).** Reasoning:
- Best SEO — search engines crawl the 30% preview, article ranks on keywords from the teaser.
- Highest conversion among paying-customer patterns per Substack's public data (~3-5x hard paywall on the same content).
- Fair — reader sees enough to know whether to pay.

**Per-article override:** creator can pick hard / soft / metered on a per-article basis. Default soft. Creator dashboard shows a dropdown when publishing.

**Tip-jar fallback:** all free articles get a small "support this creator" tip button on the bottom. Ko-fi-style, not intrusive. Zero friction.

---

## 5. Subscription architecture (schema sketch)

If we ship creator-subscriptions (Model A part of the bundle):

```sql
-- Creator subscription tiers (a creator can offer N tiers)
create table creator_subscriptions (
  id uuid primary key default gen_random_uuid(),
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,                          -- "Supporter", "Full access"
  description text,
  price_monthly_cents integer,                 -- 500 = $5/mo; null = yearly-only
  price_yearly_cents integer,                  -- 5000 = $50/yr; null = monthly-only
  stripe_product_id text not null,             -- prod_...
  stripe_price_monthly_id text,                -- price_...
  stripe_price_yearly_id text,
  benefits_json jsonb default '[]',            -- ["Early access", "Monthly Q&A"]
  is_active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Subscribers (who is subscribed to whom, at which tier, currently)
create table subscribers (
  id uuid primary key default gen_random_uuid(),
  subscriber_user_id uuid references auth.users(id),  -- nullable: email-only allowed
  subscriber_email text not null,                     -- PII — always stored
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  subscription_id uuid not null references creator_subscriptions(id) on delete restrict,
  status text not null,                        -- active|past_due|canceled|trialing
  billing_period text not null,                -- monthly|yearly
  started_at timestamptz not null default now(),
  current_period_end timestamptz not null,
  cancel_at_period_end boolean default false,
  stripe_customer_id text not null,            -- cus_...
  stripe_subscription_id text not null unique, -- sub_...
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
create unique index subscribers_unique_per_creator on subscribers (subscriber_email, creator_user_id)
  where status in ('active', 'trialing', 'past_due');

-- Paid content access control: which tier unlocks which content
-- Two modes: "all-paid-content" (default) or "per-article"
create table paid_content_access (
  id uuid primary key default gen_random_uuid(),
  creator_subscription_id uuid not null references creator_subscriptions(id) on delete cascade,
  unlocks_all_paid boolean default true,       -- if true, this tier unlocks every paid article on this creator's site
  post_id uuid references posts(id),           -- nullable: specific post unlock
  created_at timestamptz default now()
);
```

**Key RLS constraints:**
- `creator_subscriptions`: creator can CRUD their own; public can SELECT active rows for a given creator.
- `subscribers`: creator can SELECT their subscribers (email PII); subscriber can SELECT their own rows; no public access.
- `paid_content_access`: read-mirrors `creator_subscriptions` rules.

**Subscriber identity decision:**
- Substack allows email-only subscription (no tadaify account required). We should follow — lowering the barrier is worth the PII-storage burden.
- Magic-link login tied to email if they ever want to manage subscription.
- GDPR: subscriber email is PII. `delete_user_data()` RPC must cascade.

---

## 6. À la carte (per-article) architecture (schema sketch)

If we ship per-article unlocks (Model B part of the bundle):

```sql
-- A paid article is a post with extra metadata
create table paid_articles (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null unique references posts(id) on delete cascade,
  creator_user_id uuid not null references auth.users(id) on delete cascade,
  price_cents integer not null,                -- 500 = $5
  currency text not null default 'USD',
  stripe_product_id text not null,
  stripe_price_id text not null,
  paywall_type text not null default 'soft',   -- hard|soft|metered
  preview_percent integer default 30,          -- for soft paywall
  is_active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- A single purchase unlocks one article
create table article_purchases (
  id uuid primary key default gen_random_uuid(),
  paid_article_id uuid not null references paid_articles(id) on delete restrict,
  buyer_user_id uuid references auth.users(id),   -- nullable: email-only buy allowed
  buyer_email text not null,                      -- PII
  stripe_payment_intent_id text not null unique,
  stripe_checkout_session_id text not null,
  amount_cents integer not null,
  currency text not null,
  platform_fee_cents integer not null,            -- tadaify's cut
  stripe_fee_cents integer not null,              -- Stripe's cut (reported by Stripe)
  creator_net_cents integer not null,             -- what creator actually gets
  paid_at timestamptz not null,
  refunded_at timestamptz,
  refund_reason text,
  invoice_url text,                               -- Stripe hosted invoice (EU 14-day requirement)
  invoice_number text,
  created_at timestamptz default now()
);
create index article_purchases_buyer_idx on article_purchases (buyer_email, paid_article_id);

-- Access check: SSR reads article_purchases + subscribers
-- Signs a short-lived JWT cookie to avoid DB hit on every paragraph read
```

**Access check flow** (per article view):
1. SSR handler receives request for `<handle>/articles/<slug>`.
2. Resolves post → paid_article.
3. If not paid → render freely.
4. If paid:
   - Check JWT cookie (`paid_access:<post_id>`) — valid and signed → render.
   - Else check DB: `article_purchases` (by buyer_user_id OR buyer_email-via-magic-link) AND `subscribers` (any active subscription to this creator that unlocks this post).
   - If access → sign JWT, set cookie (1h TTL), render.
   - Else render paywall (hard/soft/metered).

**Anonymous purchase flow:**
- Buyer clicks "Buy for $5" → Stripe Checkout → redirects to `/purchase-success?session_id=...` → SSR reads Stripe session, extracts customer email, creates article_purchases row with `buyer_user_id = null`, sends magic-link email with "Your article is ready" link.
- Future visits: magic-link sets cookie → access.

**GDPR + tax invoice:**
- EU VAT rule: invoice required within 14 days for B2C digital sales above €10 (or always if B2B).
- Stripe hosted invoices are accepted EU-wide. Store `invoice_url` + `invoice_number`.
- `delete_user_data()` RPC must NOT cascade purchases — tax invoices must be retained per EU rules (5-10 years depending on country). Instead, anonymize: set `buyer_user_id = null`, keep email hashed, retain amount + invoice fields.

---

## 7. Tax + compliance

### 7.1 EU VAT — MOSS / OSS (One-Stop Shop)

- Digital services sold to EU consumers trigger VAT at the consumer's country rate (from Germany's 19% to Hungary's 27%).
- **Stripe Tax** handles VAT determination, collection, and monthly reporting. ~+0.5%/transaction. Turn on the "digital goods" tax code per product.
- **OSS registration:** tadaify (PL-based) registers once under PL OSS; files one return covering all 27 EU countries. Alternative: creator registers OSS in their own country. For Connect Express, the merchant is the creator — **creator's OSS, not tadaify's**. This is a critical distinction.
- **B2B reverse charge:** if buyer provides a valid VAT ID, reverse-charge applies (no VAT collected; buyer self-assesses). Stripe Tax validates VIES.

### 7.2 US sales tax

- Post-Wayfair (2018), economic nexus rules require sales-tax collection in ~46 states once thresholds cross.
- Stripe Tax handles all 50 states including thresholds, registrations, and filing.
- For Connect Express, creator is the merchant of record — creator is liable for sales tax. Stripe Tax helps creator but does not remove their legal obligation.

### 7.3 UK VAT (post-Brexit)

- UK VAT is now separate from EU VAT. Threshold £85k/yr for UK businesses.
- Non-UK sellers must register from transaction 1 for digital goods.
- Stripe Tax handles UK.

### 7.4 Polish VAT (tadaify ↔ creator ↔ consumer)

Three flows:
1. **Consumer pays creator** (primary revenue): VAT applies per OSS rules above; creator is the merchant.
2. **Creator pays tadaify** (platform fee, 8%): tadaify invoices creator 23% Polish VAT on the platform fee, since tadaify is a PL-based service to creator. Creator deducts if VAT-registered.
3. **Stripe charges creator** (processor fee): Stripe Ireland invoices creator; Irish VAT reverse-charged (standard B2B EU flow).

### 7.5 Complexity estimate

- MVP scope = US + EU (+ UK) launch only. ~90% of global creator economy revenue.
- **Stripe Connect Express + Stripe Tax** total overhead: ~3-5 days to wire up, ongoing cost ~0.5% + $5/mo base.
- **Lemon Squeezy alternative:** zero tax work for us, but 3-5pp extra on every transaction. For a $1000/mo creator, that's $30-50 in lost revenue — more than a Pro subscription would have been.

### 7.6 Recommendation

**Stripe Connect Express + Stripe Tax. Scope MVP to US + EU + UK. Defer LATAM / APAC tax registrations to post-launch.** Creator's onboarding flow collects tax info (country, VAT ID if applicable, US W-9/W-8BEN). Stripe handles the rest.

---

## 8. Mobile-app constraints

### 8.1 Apple App Store

- 30% on digital-goods purchases made in-app (15% under the Small Business Program at <$1M/yr and on subscriptions after year 1).
- **Recent rule changes (2024-2025):** Apple now allows "link-out" buttons to web purchases in the US following the Epic Games ruling, and in the EU following DMA. Outside those jurisdictions, in-app purchase is still required for digital goods.
- If tadaify mobile app showed a "Buy this article" CTA on an iOS/Android app, and that CTA initiated an in-app transaction, Apple would take 30%.
- Workaround: reader-only mobile app; all purchases happen on the web (user gets redirected to mobile Safari). Apple is tolerant of reader apps (Netflix-style).

### 8.2 Google Play

- Same 30% / 15% structure. Google is slightly more permissive on link-outs (user-choice billing experiment).

### 8.3 Recommendation

**Web-only paid content for the foreseeable future.** If we ever ship a tadaify native app, it is a reader/content-viewer only. Purchases happen via Safari / Chrome. We are aligned with how Substack's iOS app works (read-only; upgrade-to-paid is web only).

---

## 9. Strategic positioning vs competitors

### 9.1 What does the market look like from the creator's perspective?

A creator in 2026 picks between:
- **Substack**: simple, trusted, 10% take, newsletter-only feel.
- **Beehiiv**: modern Substack competitor, 0% take but $39-99/mo flat SaaS.
- **Ghost Pro**: indie darling, Stripe-direct, open-source, $9-199/mo SaaS.
- **Patreon**: community-heavy, 5-12% take, tier-based.
- **Gumroad**: one-shot products, 10% flat, MoR.
- **X Paid Articles**: only if they're already an X Premium creator; locked to X's audience.
- **Lemon Squeezy**: indie-dev staple for digital products; 5% + 50¢.

### 9.2 tadaify's angle

tadaify's core is **multi-page personal websites with custom domains** (per DEC-MULTIPAGE-01). Paid content is an extension — "monetize your site without leaving".

Positioning options:

1. **"Substack for your own domain"** — all the paid-newsletter power, but on your brand, your domain, your look.
2. **"The 0% platform on Pro"** — undercut Substack's 10% with a clear Pro upsell.
3. **"Your landing page, your articles, your paywall — one dashboard"** — horizontal play, not feature-specific.

Recommend **#3 as the primary marketing message**, with **#2 as a supporting proof point** in the Pricing page.

### 9.3 Competitive pressure

- Substack is the category leader. Beating them on take rate is easy; beating them on distribution is hard.
- **tadaify's distribution advantage**: personal-brand-first. Creator already has a tadaify page; paid content is one toggle away. Substack forces the creator to adopt the Substack domain + Substack reader app as the primary interface.
- **Defensibility**: tadaify owns the multi-page + custom-domain experience. Paid content is a wedge to deepen revenue per creator, not the main attraction.

---

## 10. Verdict & rationale

**Adopt — phased**, with the hybrid model described.

### Phase 1 (Month 1-2) — MVP paid content

- Stripe Connect Express onboarding.
- À-la-carte paid articles only (single most common request in competitive set; least-complex schema).
- Soft paywall default (30% preview + fade + CTA).
- 8% tadaify take on Free/Creator tier; 0% on Pro.
- Stripe Tax enabled (US + EU + UK).
- Web-only.

### Phase 2 (Month 3-4) — Subscriptions

- Creator subscriptions (monthly + yearly).
- Subscriber email list + CSV export.
- Tier-unlocks-all-paid-content default; per-article override advanced.
- Magic-link login for subscribers without tadaify accounts.

### Phase 3 (Month 5+) — Professional tooling

- Business tier ($49/mo): split-payouts with collaborators, team accounts, advanced analytics, white-label invoice branding.
- Bundles (buy N articles for $X).
- Discount codes, trial periods, student/teacher pricing.
- Metered paywall (first 3 free per month).

### Rationale for phased approach

- **À-la-carte first** avoids the subscription lifecycle complexity (upgrades, downgrades, proration, cancel-at-period-end) on day 1.
- **Subscriptions second** because they generate stickier revenue but require roughly 2-3x the dev work of à-la-carte.
- **Hybrid take rate from day 1** (8% Free / 0% Pro) because changing take rates post-launch is painful (existing creators feel price-gouged). Lock it in early.
- **Web-only** because mobile IAP kills margins and we have no mobile app yet; forcing this constraint upfront prevents mobile-first product thinking from poisoning the design.

### Why not reject

- Clear creator demand. Every adjacent platform monetizes creators directly. Going without paid content means tadaify caps at "nice portfolio builder" and never enters the professional-creator budget.
- Revenue model for tadaify itself. SaaS-only subscription caps at our $15-49/mo per creator. Take-rate revenue scales with creator success — aligning incentives long-term.
- Technical effort is bounded. Stripe Connect Express + Stripe Tax is a well-trodden path with multiple reference implementations (open-source Substack clones, Ghost, Beehiiv public docs).

### Why not fully adopt subscriptions day 1

- Subscription lifecycle (trials, proration, grace periods, failed payments, cancellation flows) is roughly 2-3x the dev work of one-shot purchases.
- Subscription churn analytics + dunning emails add ~1 week of integration.
- Subscribers expect a polished dashboard — settings, cancel flow, payment-method update. All this can be absorbed from Stripe's Customer Portal but still needs integration.
- Better to ship à-la-carte in Month 1, validate creator demand, then add subscriptions with real data.

---

## 11. Pending DECs (table format v2)

### DEC-PAID-CONTENT-01 — Paid articles / paid content adoption

**Czego dotyczy:** Whether tadaify ships paid articles / paid content at all, and at what scope.

**Szczegolowy opis:** Creator-economy platforms (Substack, Patreon, Beehiiv, etc.) uniformly monetize creators via paid content — subscriptions, one-shot articles, tier-gated perks. tadaify currently offers free multi-page personal sites with custom domains. Adding paid content creates a second revenue stream aligned with creator success (take-rate model) and a professional-creator segment upsell to our Pro tier. Non-trivial scope: 3-6 weeks to build MVP with Stripe Connect Express + Stripe Tax. Phased approach lets us ship à-la-carte in month 1-2 and subscriptions in month 3-4.

**Opcje:**
1. **Adopt phased** — à-la-carte MVP in phase 1, subscriptions in phase 2, professional tooling in phase 3. Hybrid 8% / 0%-on-Pro take rate from day 1.
2. **Adopt full day-1** — ship both à-la-carte + subscriptions together. 6-8 week effort; higher risk of incomplete polish.
3. **Adopt subscriptions only** (Substack clone) — skip à-la-carte entirely. Cleaner mental model but loses the low-friction impulse-buy flow.
4. **Adopt à-la-carte only** — never ship subscriptions. Dramatically narrower product; easier to ship but caps professional-creator revenue.
5. **Reject** — focus tadaify on free personal-site platform; defer monetization indefinitely. Simplest product but caps company revenue at SaaS tier only.

**Twoja rekomendacja:** **Option 1 (adopt phased)**. Gets the hardest-scope decisions locked in (take rate, processor, mobile stance) while keeping phase 1 dev scope to ~3 weeks. Revenue-aligned with creator success. Every professional competitor does this.

---

### DEC-PAID-PROCESSOR-01 — Payment processor choice

**Czego dotyczy:** Which payment processor and Merchant-of-Record model tadaify uses for paid content.

**Szczegolowy opis:** Three realistic paths. Stripe Connect Express (most category peers use this — Substack, Patreon, Beehiiv, Ghost, etc.) gives maximum product-surface control and long-term flexibility; we integrate Stripe Tax separately for VAT/sales-tax compliance. Lemon Squeezy / Paddle are Merchants of Record — they handle all tax/compliance/chargebacks in exchange for a larger cut (~5% + 50¢). Apple/Google IAP only matter if we ship native mobile apps (30% cut — avoided by staying web-only). Processor choice is high-cost to change post-launch; commit carefully.

**Opcje:**
1. **Stripe Connect Express + Stripe Tax** — primary; industry standard; we handle compliance via Stripe Tax (+0.5%/txn).
2. **Lemon Squeezy (MoR)** — zero tax/compliance burden on us, but eats 3-5pp more of creator revenue; weakens brand (receipts say Lemon Squeezy).
3. **Paddle (MoR)** — similar to Lemon Squeezy; slightly better indie reputation.
4. **Stripe Connect Standard** — creator owns their own Stripe account; less compliance burden on us, but heavier creator UX (they have to do their own KYC/onboarding separately).
5. **Multi-processor (Stripe primary, PayPal fallback)** — best for international reach, but 2x webhook/state complexity.

**Twoja rekomendacja:** **Option 1 (Stripe Connect Express + Stripe Tax)**. Industry standard, best long-term product-surface control, creator keeps more of the revenue vs MoR options. PayPal fallback can be added in phase 2 if EU/LATAM demand justifies it.

---

### DEC-PAID-TAKERATE-01 — Take-rate structure

**Czego dotyczy:** What cut tadaify takes on paid-content transactions.

**Szczegolowy opis:** Three structures viable. Flat rate (like Substack 10% or Patreon 5-12%) is simple and generates steady revenue at any scale. Pro-tier-gated (like Ghost Pro, Beehiiv) means Pro tier ($15/mo) unlocks 0% take — creator either pays subscription OR doesn't sell paid content. Hybrid (8% on Free, 0% on Pro) lets small creators dip toes at 8% while nudging professional creators to upgrade at ~$187/mo revenue break-even. Rate locked early — raising it post-launch feels extractive; lowering it feels like we over-promised.

**Opcje:**
1. **Flat 5%** — aggressive undercut of Substack (10%). Stronger marketing message but lowest tadaify revenue per transaction.
2. **Flat 10%** — matches Substack; no differentiation on rate but highest tadaify revenue.
3. **Hybrid 8% Free / 0% Pro** — best of both worlds; creators naturally upgrade at $187/mo break-even.
4. **Pro-tier only (0% take, Pro required to sell)** — cleanest message ("keep 100% of your revenue") but gates paid content entirely behind Pro. Conflicts with DEC-PRICELOCK-01.
5. **Flat 0% + raise SaaS pricing** — Beehiiv model. Would require raising Pro to ~$29-49/mo and making paid content Pro-only. High-friction upgrade.

**Twoja rekomendacja:** **Option 3 (Hybrid 8% Free / 0% Pro)**. Captures long-tail take-rate revenue, aligns creator growth with Pro upsell, beats Substack on rate messaging. Resolve DEC-PRICELOCK-01 tension by documenting price-lock as feature-set-scoped (new features ship at current price, existing features stay locked).

---

### DEC-PAID-MODEL-01 — Subscription vs à-la-carte

**Czego dotyczy:** Whether day-1 paid content is per-article purchases, monthly/yearly subscriptions, or both.

**Szczegolowy opis:** À-la-carte (one-off article unlocks) matches Gumroad, X Paid Articles' original form, and Buy Me a Coffee. Simpler schema, lower dev effort, matches impulse-buy flow. Subscriptions match Substack, Patreon, Beehiiv — generate stickier recurring revenue, enable cross-article access, but require 2-3x more dev effort (trials, proration, cancel flows, dunning). Bundling both gives creators max flexibility; user can buy one article OR subscribe to unlock all.

**Opcje:**
1. **À-la-carte only (day 1), subscriptions in phase 2** — lowest risk; ships in ~3 weeks; validates demand before committing to subscription complexity.
2. **Subscriptions only (day 1), à-la-carte deferred** — Substack clone path; simpler mental model but misses impulse-buy revenue.
3. **Both from day 1** — maximum flexibility, but 6-8 week scope and higher risk of shipping incomplete polish on either.
4. **Tips + à-la-carte (day 1), subscriptions deferred** — add Buy-Me-a-Coffee-style tip jar alongside per-article purchases.
5. **Subscriptions + à-la-carte + tips day 1** — full feature parity with Ko-fi Gold. Largest scope.

**Twoja rekomendacja:** **Option 1 (à-la-carte first, subscriptions phase 2)**. Lower risk, faster validation, subscriptions are where most of the long-term revenue lives but require real creator data to design tiers correctly. Tips (option 4) can ship alongside à-la-carte in phase 1 if scope allows — essentially free given Stripe Checkout already handles it.

---

## 12. Out-of-scope explicit

The following were considered and deliberately cut:

- **Crypto / Lightning payments** — <1% of creator revenue; legal ambiguity in PL/EU; extreme dev cost; zero competitor-signal. Revisit if stablecoin regulations mature and the EU MiCA framework clarifies creator-payment flows.
- **Apple/Google IAP integration** — 30% cut destroys the take-rate model. Web-only paid content is the correct stance for the foreseeable future.
- **Advertising-revenue sharing** — Medium's Partner Program approach (pay creators based on member reading time) is fundamentally incompatible with creator-set pricing. Not pursued.
- **NFT / tokenized content access** — hype cycle over; creator demand negligible; compliance complexity extreme.
- **Physical-goods sales** (ship-a-book, merchandise) — different fulfillment model; defer to Gumroad/Shopify-style integrations in phase 3+.
- **Affiliate / referral revenue to tadaify** — creator-brings-creator referral program is a marketing-side feature, not a paid-content feature. Separate roadmap.
- **Gift subscriptions** (subscriber gifts subscription to another reader) — Substack has this; not critical for MVP.
- **Multi-currency pricing** (creator sets different prices per region) — complicated; Stripe supports but creator UX is confusing. Defer.
- **Refund self-service for buyers** — keep creator-mediated in MVP to avoid abuse patterns.

---

## 13. Related research

- [Multi-page accounts, grid layouts, and API-driven templates](./multi-page-grid-and-templates.md) — DEC-MULTIPAGE-01 defines page types; paid articles live on a blog/article page type. Paid content assumes multi-page is shipped first.
- F-PAGE-BLOG-001 — the free-blog feature backlog item; paid articles are an extension of this (a `paid_article` row per `post`).
- [Dashboard plagiarism risk audit](./dashboard-plagiarism-risk-audit.md) — paid-article content is user-generated; same plagiarism-risk framing applies. Our stance doesn't change — creator owns the content, tadaify is a platform.
- DEC-PRICELOCK-01 (pending) — price-lock-for-life promise. Interacts with DEC-PAID-TAKERATE-01. Resolution: price lock is feature-set-scoped (locked features stay locked at locked price; new features ship at current price).

---

## 14. Appendix — sources reviewed (plausible summaries)

- Substack Help Center, "How does Substack make money?" — 10% platform fee, Stripe-based.
- Patreon fee schedule — Lite 5%, Pro 8%, Premium 12% + processing.
- Gumroad (Sahil Lavingia, 2023 blog post) — flat 10%, dropped from 9% + 30¢ tiered.
- Ghost Pro docs — 0% take, Stripe Connect, creator pays $9-199/mo hosting.
- Beehiiv pricing page — 0% take on paid plans, creator pays $39-99/mo SaaS.
- Patreon blog, 2022 — intro of Pro/Premium tiers.
- Stripe Connect Express documentation (stripe.com/docs/connect/express-accounts).
- Stripe Tax documentation — US + EU + UK automatic tax calculation, ~0.5%/transaction.
- Lemon Squeezy pricing (lemonsqueezy.com/pricing) — 5% + 50¢ all-in, MoR model.
- Paddle Billing pricing — 5% + 50¢ on Paddle Billing; 10% flat on legacy Paddle Classic.
- Buy Me a Coffee pricing — 5% platform fee.
- OnlyFans Creator FAQ — 20% platform fee.
- Apple Developer Program, Schedule 2 — 30% / 15% under Small Business Program.
- Google Play billing policies 2024 — similar structure.
- EU VAT OSS (One-Stop Shop) — digital services OSS registration framework.
- Stripe Customer Portal documentation — subscription self-service UI.
- X (Twitter) Creator documentation, 2024 rollout — Paid Articles feature for Premium+ creators.

All numbers here are plausible-as-of-2026-Q1 and should be re-verified against live processor pricing pages before finalizing commercial terms.

---

*End of document. Status: draft-for-review. Next step: user reads + responds to the four pending DECs; orchestrator logs to `/tmp/claude-decisions/decisions.json` upon first user engagement.*
