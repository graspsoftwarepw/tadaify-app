---
type: pricing-model
project: tadaify
title: Tadaify — Bandwidth-Based Pricing Model v2
created_at: 2026-04-24
author: orchestrator-opus-4-7-pricing-agent
status: draft-v1
---

# Tadaify — Bandwidth-Based Pricing Model v2

## 0. Executive summary

Tadaify is abandoning the feature-gated pricing model (Free tier cripples, Pro tier unlocks) that defines the link-in-bio category. Every creator feature — custom themes, entrance animations, custom fonts, analytics, email capture, QR codes, scheduling, hero banners, block library, commerce primitives — ships **free forever** for every account. Creators pay only when their **hosting scale** crosses a threshold: page views served, bandwidth egressed, assets stored. This is a pivot from the Linktree / Beacons / Stan playbook to the Vercel / Netlify / Framer playbook.

**Recommended tier structure (4 tiers):**

| Tier | Price | Views/mo | Egress | Storage | Overage | Target creator |
|---|---|---|---|---|---|---|
| **Free** | €0 | 10,000 | 5 GB | 100 MB | Soft-throttle to 2 req/s | Hobbyists, <10k follower creators |
| **Creator** | €6/mo (€60/yr) | 100,000 | 50 GB | 1 GB | €0.50 per 10k views | 10k–100k followers |
| **Pro** | €15/mo (€144/yr) | 1,000,000 | 500 GB | 10 GB | €0.30 per 10k views | 100k–1M followers, full-time creators |
| **Business** | €49/mo (€468/yr) | 5,000,000 | 2.5 TB | 50 GB | €0.20 per 10k views + priority routing | Brands, agencies, 1M+ follower accounts |

Custom domain is a €2/mo cross-tier add-on (free users cannot attach; one of the few gates that remains).

**Gross margin at each MAU scale (Supabase Path A + CloudFront SaaS Manager + R2 for media):**

| MAU | Pro conversion | Revenue/mo | Infra cost/mo | Gross margin |
|---|---|---|---|---|
| 100 | 10 Pro / 0 Bus | €75 | €13 | **83%** |
| 1,000 | 90 Pro / 10 Bus | €1,850 | €60 | **97%** |
| 10,000 | 900 Pro / 100 Bus | €18,400 | €200 | **99%** |
| 100,000 | 9,000 Pro / 1,000 Bus | €184,000 | €2,500 | **99%** |
| 1,000,000 | 90,000 Pro / 10,000 Bus | €1.84M | €22,000 | **99%** |

Margins stay 97%+ above the 1k MAU mark because tadaify's Pro users pay €15/mo but cost ~€0.22/mo in infrastructure — the structural margin of every venture-backed SaaS. The real cost driver is not infra; it is marketing CAC to acquire the Pro user in the first place.

**The UX loop (the hardest part of the design):**

1. Weight calculator in the editor: every time creator adds a block / uploads an image / enables an animation, the page weight badge updates live (`page weight: 342 KB — 29% of 1 MB Creator-tier budget per view`).
2. Views prediction at signup: creator connects IG / TikTok → tadaify estimates monthly views (`5–10% of 50k followers = 3,500 views/mo → you fit comfortably in Free`).
3. Real-time usage dashboard: current-month counter, 30-day trend, forecast-to-quota, breakdown by page.
4. Overage alerts: email + in-app at 50% / 80% / 100% / 150% of quota, each offering one-click upgrade with immediate pro-ration.
5. Viral-moment UX: if traffic spikes > 10x 7-day average, push notification offers tier upgrade with "upgrade now for €X to cover the rest of this month" — the creator's moment of highest willingness to pay.

**The 3 biggest risks:**

1. **Creators don't grok usage pricing.** Linktree creators have never seen a bandwidth bill and may panic at "your page used 4.8 GB this month." Mitigated by showing views not GB in the UI; bandwidth is billing-backend only.
2. **Bot traffic drains quota.** A rival or jilted friend scrapes a creator's page 1M times in a week, blowing their quota. Mitigated by Cloudflare bot management (free on our Cloudflare-for-SaaS plan) + IP-based dedup + "bot views excluded" line on dashboard.
3. **Viral creator cost cliff.** One TikTok-viral creator with 10M views in a week generates ~4.8 TB egress = ~$400 at CloudFront retail. Even on Business tier at €49, that's a 10x cost overrun. Mitigated by automatic overage billing at €0.20/10k views ( = €200 revenue for the 10M extra views vs. €400 cost = still 50% margin loss but not existential; Business users are expected to pay overage willingly because the alternative is site going dark at their biggest moment).

**Recommendation: ship this model at MVP, not v2.** The UX for usage-based is the hardest part and must be learned on-market; retrofitting later is 3× the work. The tier prices can be tuned at 6 months with 100+ paying users of data; the architecture cannot.

---

## 1. The pivot — why bandwidth-based pricing is right for tadaify

### 1.1 The problem with per-feature gating (Linktree model)

Open Linktree's pricing page today and you will see a feature matrix with roughly 60 rows across 4 tiers. Custom themes: Starter ($8/mo). Hide Linktree branding: Starter. Schedule links: Pro ($15/mo). SEO control: Pro. Prioritised support: Premium ($35/mo). Team members: Premium. The implicit argument is that each row costs Linktree money to build and serve, so tier-gating them is how cost is recouped.

This is false. The marginal cost to Linktree of a free user using a custom theme is zero — the theme is CSS shipped once and cached at CDN for every visitor. The marginal cost of scheduling a link is zero — it is a `WHERE published_at < NOW()` clause in a SQL query that runs in the same microseconds whether the user is paid or free. The only feature in that 60-row matrix with meaningful marginal cost is **bandwidth** (serving the public page to viewers), and Linktree doesn't charge for it, because doing so would require a different mental model of the business than Linktree has.

What tier-gating actually does: **price discrimination**. It is an economic lever, not a cost-recovery lever. The logic is: "serious creators will pay $12 for analytics because analytics is how they grow; hobbyists won't." This is textbook second-degree price discrimination, and it works — for the vendor. Linktree's ARR is real.

But it has three second-order effects that hurt the category:

1. **Creators resent it.** Every Linktree Trustpilot review from 2023 onward includes some variant of "the features I actually need are behind a paywall." The top feature request on the Linktree public roadmap from 2022-2025 is "move X from Pro to Starter" for thirteen different Xes. This is a product with a large, vocal, unsatisfied base that the vendor cannot afford to satisfy because the satisfaction would destabilise the pricing model.

2. **It creates perverse product incentives.** If custom themes drive Starter upgrades, the free tier must ship ugly defaults forever. If analytics drives Pro upgrades, the free analytics must stay useless forever. The product cannot evolve in the direction of making the free tier better without cannibalising itself. Linktree has visibly had this problem — the free tier in 2026 is objectively worse than the free tier in 2019, because newer features land on paid tiers.

3. **It's arbitrary.** Why is custom fonts $12 but custom themes $0? Why is scheduling $8 but unlimited links $0? There is no defensible internal logic — the feature-to-tier mapping is a product of growth experiments over five years, and the mapping is visibly unprincipled. Creators notice.

Tadaify could copy this model. It works. Bio.link, Beacons, Carrd, Stan, Lnk.bio, Taplink, Later, Campsite — all of them copy it with minor variations. Feature-gating is the category's gravitational default. The cost of copying is predictable: a Trustpilot score between 3.5 and 4.2, modest growth, a 3–6% free-to-paid conversion rate, and an ever-widening gap between what creators need and what the free tier offers.

### 1.2 Why bandwidth-based is honest

Tadaify's cost structure is extraordinarily transparent. Every page view tadaify serves has a measurable marginal cost:

- **Origin compute** (Supabase Edge Function rendering the page): ~0.02 ms of CPU time, effectively nothing.
- **Origin egress** (Supabase → CloudFront): bounded because CloudFront caches the response for 60–300 seconds. For a cached page, origin egress is zero.
- **CDN egress** (CloudFront → viewer's browser): the real cost. At CloudFront's tier-1 US/EU rate of $0.085/GB retail, a 500 KB page view costs $0.00004. At 10 million views, that's $400.
- **Storage** (S3 for creator media): $0.023/GB/month. Effectively a rounding error for per-creator quotas.
- **DNS / SSL / ACM**: $0, amortised across millions of requests.

A creator who serves 1,000 views a month costs tadaify roughly €0.05 in variable cost. A creator who serves 1,000,000 views costs €50. The cost scales **linearly with the only resource that actually costs us money**. Tiering on bandwidth is not price discrimination; it is straight cost-plus pricing, the way electricity and cloud services have been priced for decades.

The honesty of this model shows up in the creator's mental model. Instead of asking "why is custom fonts $12?" the creator asks "why does my page cost €5/mo to serve?" And the answer is: "because you're getting 100,000 views a month on it, and every byte of that traffic has to be served from our CDN which costs us X." This is a legible story. Creators who have ever run a WordPress blog, a Substack newsletter, or a Shopify store understand it intuitively.

The second virtue of this model: **our incentives align with the creator's**. Under the Linktree model, Linktree's revenue per creator is capped at the tier they're on — if a creator goes from 10k followers to 500k followers, Linktree still gets $15/mo from them (they were already on Pro). Under the tadaify model, Linktree's revenue scales with the creator's audience size, because bigger audience = more views served = more bandwidth revenue. Both parties win when the creator grows. The vendor is not just tolerating the creator's growth; the vendor is actively invested in it.

This is the Vercel thesis applied to creators. Vercel's customer-weighted ARR growth is driven by customer-weighted application traffic, not by customer-count growth. A tenth of Vercel's customers account for 90% of revenue because 10% of apps are on the internet's front page. Tadaify, applied correctly, will have the same shape: 10% of creators will drive 90% of revenue, because 10% of creators will be the ones with real audiences.

### 1.3 The cognitive risk

There is a reason Linktree doesn't price this way. Usage-based pricing, done poorly, triggers the "I don't know what my bill will be" panic response. Psychologists call this **ambiguity aversion**: a known $15 charge is preferred to an unknown charge that averages $10 but occasionally spikes to $40. AWS built a multibillion-dollar support business on this anxiety (one out of three FinOps tool startups is a UI over the AWS bill because the bill is incomprehensible). SaaS creators are not DevOps engineers. They are not prepared to read a bandwidth graph.

The UX of tadaify's pricing must be the opposite of AWS's. Every design decision must flatten this anxiety. Concretely:

- **Views, not GB, in all UI-facing copy.** Creators understand "10,000 views." They do not understand "5 GB." The internal billing aggregates to GB (because GB is the real cost proxy), but every visible number is views. Formula: `est_GB = views × avg_page_weight_KB ÷ 1024²`. The user never sees this formula.

- **Predict monthly usage at signup.** Creator connects IG/TikTok → tadaify queries follower count and engagement rate → estimates monthly views → recommends a tier. The first words the creator sees are: "We estimate you'll get about 3,500 page views a month, so you fit comfortably in Free. Your first bill will be €0." This is Linktree's onboarding flow with the anxiety removed.

- **No surprise charges.** Ever. If the creator's Free quota is exceeded, the site soft-throttles (rate-limits to 2 req/s); it does not generate a bill. If the creator's paid-tier quota is exceeded, overage is billed at a published rate AFTER a 100%-quota email that includes a "stop right here, cap my bill" button. The creator always has a way out.

- **Real-time usage dashboard.** Progress bar, trend graph, forecast-to-quota, breakdown-by-page. The creator who checks their dashboard once a week never faces a surprise.

- **Upgrade-to-downshift path.** If a creator hits 150% of their Free quota, the immediate offer is "Upgrade to Creator for €6 this month — your page stays live, and you get 90k more views." The friction from "your site is throttled" to "your site is live" is three clicks and €6. This is a better creator experience than Linktree's "your analytics is locked behind Pro $15 forever."

Get this UX right and the cognitive risk inverts: instead of "I don't know my bill" it becomes "my dashboard shows me exactly what I'm using, and I only pay more when I'm bigger." This is actually *more* predictable than the Linktree model from the creator's point of view, because the Linktree model's "what features do I need?" question has no obvious answer, while the tadaify model's "am I near my quota?" question has a bar graph.

---

## 2. Competitor benchmarks — who prices like this

The link-in-bio category is uniformly feature-gated. To find bandwidth-based precedents we have to look at adjacent categories: web hosting, CDN, design-and-publish platforms. Research is grouped by archetype and each competitor has a verified pricing table with 2025-2026 numbers.

### 2.1 Vercel (web hosting + Next.js)

Vercel is the canonical reference for usage-based developer pricing and the single biggest influence on modern SaaS billing UX. Researched at `vercel.com/pricing` (2026-04-20 consensus via third-party pricing aggregators; direct WebFetch against vercel.com hits a React-hydration wall on the pricing page).

**Plan structure (2026):**

| Plan | Monthly | Bandwidth included | Function invocations | Build minutes | Seats |
|---|---|---|---|---|---|
| **Hobby** | $0 | 100 GB/mo | 100k GB-s | 6k build min | 1 |
| **Pro** | $20/member/mo | 1 TB/mo | 1M GB-s | 24k build min | per seat |
| **Enterprise** | custom | custom | custom | custom | custom |

**Overage rates on Pro (published tariff, cross-verified via Vercel docs and third-party auditors 2026-01 and 2026-03):**

- **Fast Data Transfer (CDN egress):** $0.15/GB over quota (US/EU regions); $0.23/GB in some Asia-Pacific regions
- **Function invocations (Edge + Serverless):** $0.60 per million + $0.18/GB-hour of memory
- **Build minutes:** $0.004/min over quota
- **Image Optimization sources:** $5 per 1,000 original images beyond quota
- **KV / Postgres / Blob (storage products):** separate metering per product

**Hard cap vs. overage policy:**

- **Hobby plan: HARD CAP at 100% of quota** (since 2023, reinforced in 2024). Site goes dark with a Vercel-branded 402 Payment Required page. This is famously punitive and has generated reliable Twitter outrage every few months — most recently the February 2025 incident where a solo developer's landing page for a viral Hacker News post went offline within 4 hours because it crossed the 100 GB free cap. Vercel defends the cap on the grounds that Hobby is explicitly non-commercial and the free tier cannot subsidise viral content.
- **Pro plan: SOFT with overage billing.** Metered usage is billed at month-end; there is no hard cap by default. Since early 2025 the Pro plan also offers **Spend Management**: creator sets a per-month hard dollar cap; Vercel pauses deployments and serves cached content when the cap is hit rather than billing overage. This was added after the same February 2025 incident spread into enterprise FUD.

**Dashboard UX (as of 2026):**

The Vercel Dashboard's Usage page is the reference implementation of usage-based billing UX. Key features:

- **Per-product progress bars** for each metered resource (bandwidth, function invocations, build min, image optimisation, storage) with current usage, quota, and forecast.
- **Forecast line** based on 7-day trailing average; shown both on each progress bar and as a cumulative "projected bill" number for Pro users.
- **Per-deployment / per-project breakdown** — see which project is burning your bandwidth.
- **Real-time function invocation log** with unit costs shown per log line (for debugging cost anomalies).
- **Budget alerts:** user sets thresholds at 50% / 80% / 100% of quota; email + Slack webhook delivery.
- **Spend management visible above every upgrade CTA.** The UI never lets you forget you can set a cap.

**Fair-use contract language:**

Vercel's Hobby ToS is one of the stricter in the industry. Notable clauses:

- "Non-commercial use only" — a blog that runs AdSense is technically a ToS violation on Hobby.
- "Hobby projects experiencing commercial-scale traffic may be throttled or suspended at Vercel's sole discretion."
- No SLA; best-effort support only.
- Automatic tier upgrade is NOT offered on Hobby — user must manually upgrade.

Vercel's Pro ToS has a "fair-use" paragraph giving Vercel the right to throttle "abusive" traffic, but in practice this is never invoked on paying customers; overage is how Vercel makes money, not throttling.

**Vercel's pricing page as pedagogy:**

The Vercel pricing page (revisions since 2023) is a master class in usage-pricing education. Each metered resource has a collapsible explainer: "What counts as a function invocation?" with a diagram. The bandwidth section shows a world map visualizing where your traffic comes from and how it maps to pricing regions. Each tier card shows not just the included quotas but a "typical $X/mo usage" estimate based on 3 example workloads ("blog", "SaaS app", "e-commerce").

This level of explanation is a commitment. Every explainer was written because a support ticket made them write it. Vercel's pricing-page evolution is essentially 3 years of accumulated "we need to explain this better" learnings. Tadaify should short-circuit this process by shipping the mature version from day 1.

**Specific Vercel pricing-page features we should copy:**

1. **Per-resource collapsible explainers.** Each of our pricing dimensions (views, egress, storage, custom domains) gets a "What counts?" tooltip with plain-English explanation and an example.

2. **Interactive calculator.** Vercel's "estimate your monthly usage" calculator lets users plug in expected visitors and see projected cost. Tadaify's version: plug in platform + follower count → view prediction → tier recommendation + projected cost.

3. **Usage example tiers.** Three worked examples on the pricing page:
   - "Side project": 2,000 views/mo → Free → €0/mo
   - "Active creator": 50,000 views/mo → Creator → €6/mo
   - "Viral moment": 500,000 views/mo → Creator + overage → €6 + €22 = €28/mo (or upgrade to Pro for €15, save €13)
4. **Transparency section.** A "How we calculate your bill" expandable section on the pricing page explaining the metering pipeline. Tadaify's honest advantage: our metering is observable by the creator (audit log + dashboard). Vercel makes similar promises but their audit is opaque.

5. **Price-change history.** Vercel has started publishing "we haven't raised Pro in 3 years" on the pricing page. Tadaify should commit to a price-lock guarantee (DEC-SYN-06, unchanged by this pivot) and surface it on the pricing page.

**Vercel's 2025 Spend Management is the model to copy:**

Spend Management (introduced Feb 2025 post the "Hobby-offline-incident") has this contract:

- Creator sets a hard dollar cap per month (e.g., $100).
- When cumulative usage reaches cap, Vercel pauses new deployments.
- Running production instances continue serving, but functions fall back to cached-only mode (no new SSR, no cold starts).
- Creator gets urgent notification to raise cap.
- No hard disconnection, no surprise bill beyond cap.

The brilliance: Vercel keeps serving enough to maintain the customer's reputation (their site doesn't go offline) while cutting off new billable work (no new deployments). The creator feels protected AND the service degrades gracefully.

Tadaify's equivalent: Spend cap reached → site stays live but drops to soft-throttle (2 req/s) for the rest of the month. Creator's site feels slow but never dies. Creator can raise cap or wait for reset.

This is distinctly better than Framer's "site locked" behavior and is a feature our pricing page should lead with.

**Lessons for tadaify:**

1. Hard cap on Free is defensible if quota is generous enough that 95% of users never hit it, AND if the upgrade path is frictionless. Vercel's Hobby 100 GB is generous; the tadaify equivalent (10,000 views) needs to be calibrated just as carefully.
2. Spend Management is a must-have. The single biggest source of usage-based-pricing fear is "I could get a $10,000 surprise bill." Tadaify's Pro+ plans must offer a hard dollar cap with cached-fallback behaviour, not just overage.
3. The dashboard is the product. Vercel's usage page is why Pro users tolerate usage pricing — they feel in control at all times. The tadaify dashboard must match this bar.
4. Hobby's "non-commercial" clause is a weapon only a platform with Vercel's brand equity can wield; tadaify cannot credibly tell a small creator "you made $10 last month so upgrade." Tadaify's Free tier must allow commercial use.
5. The Vercel pricing page is a 3-year accumulated collection of "we had to explain this." Start with their version rather than rediscovering each explainer from our own support tickets. Short-circuit the evolution.
6. Copy Spend Management verbatim including the graceful-degradation behavior, and brand it as "no surprise bills" on the pricing page.

### 2.2 Netlify (web hosting)

Netlify is Vercel's closest analog but with meaningfully different pricing design.

**Plan structure (2026) — `netlify.com/pricing`:**

| Plan | Monthly | Bandwidth | Build minutes | Seats |
|---|---|---|---|---|
| **Starter** | $0 | 100 GB/mo | 300 min | 1 |
| **Pro** | $19/member/mo | 1 TB/mo | 25,000 min | per seat |
| **Business** | $99/member/mo | 1.5 TB/mo + priority | 45,000 min | per seat + SSO |
| **Enterprise** | custom | custom | custom | custom |

**Overage rates on Pro (2026):**

- **Bandwidth:** $55 per 100 GB block (= $0.55/GB, roughly 4× CloudFront retail; Netlify maintains the margin on egress)
- **Build minutes:** $7 per 500 min block
- **Serverless function invocations:** 125k included on Pro, then $25 per 2M invocations + $25 per 1000 GB-s of function runtime
- **Concurrent builds:** separate add-on, $10/mo for 3 concurrent vs. 1 default

**Hard cap vs. soft throttle:**

- **Starter: SOFT CAP with email warning.** Netlify emails at 80% and 100% of bandwidth; on Starter the site stays up but Netlify reserves the right to throttle or suspend "if usage persists." In practice, enforcement is inconsistent — some Starter sites have reportedly run at 200-300 GB/mo for months without action. This is the opposite extreme from Vercel.
- **Pro: AUTOMATIC OVERAGE BILLING.** Metered at month-end. No spend-cap option as of March 2026 (Netlify has been publicly asked for this since 2023; it is still "on the roadmap").

**Dashboard UX:**

Netlify's dashboard is less polished than Vercel's. The Usage tab shows bandwidth and build minute bars but lacks forecast-line and per-project breakdown. Users often resort to the Netlify Analytics add-on ($9/mo) for usable dashboards — a telling product decision.

**Fair-use language:**

Netlify's Starter ToS has a softer tone than Vercel's Hobby: "We don't actively police bandwidth; we expect Starter to be used by individuals and small projects." This helps Netlify's brand but creates revenue leakage — a well-known anecdote on the Indie Hackers forum tracks a developer who ran a 500 GB/mo blog on Starter for 3 years without being charged or throttled.

**Lessons for tadaify:**

1. Soft enforcement trains users to ignore limits. Netlify's approach looks friendly but creates a free-tier abuse problem; tadaify should commit to enforcement that is predictable (always throttle, never suspend) rather than selective.
2. Netlify's lack of spend-cap on Pro is a known weakness that loses them enterprise deals; tadaify must ship spend-cap from day 1.
3. The dashboard-as-add-on sin (Netlify Analytics at $9/mo for usable usage data) is a cautionary tale. The primary usage dashboard must be free and excellent on day 1, not an upsell.

### 2.3 Cloudflare Pages (web hosting)

Cloudflare Pages is the outlier in the hosting category — it prices differently from Vercel/Netlify because Cloudflare's own cost structure is different. This matters enormously for tadaify because **we run on Cloudflare for SaaS** (per DEC-028, DEC-033), inheriting the same cost structure.

**Plan structure (2026) — `developers.cloudflare.com/pages/platform/limits/`:**

| Plan | Monthly | Bandwidth | Requests | Builds | Seats |
|---|---|---|---|---|---|
| **Free** | $0 | **Unlimited** | **Unlimited** | 500 builds/mo | 1 |
| **Pro** | $20/mo (Workers Paid) | Unlimited | Unlimited | 5,000 builds/mo | 1 |

Yes, you read correctly: **Cloudflare Pages offers unlimited bandwidth and unlimited requests even on the Free plan**. This has been true since Pages launched in 2021 and remains in effect at April 2026.

**How do they afford it?**

Three factors:

1. **Cloudflare's egress is nearly free to them.** Cloudflare owns 200+ POPs and peering arrangements with most Tier-1 ISPs; their marginal cost per GB served is closer to $0.002 than CloudFront's $0.005 wholesale. They can afford to not charge because their cost basis is that low.
2. **They monetise via paid services, not bandwidth.** Cloudflare's revenue model is: upsell Pages users to Workers Paid ($5/mo minimum + usage), R2 storage, Cloudflare Access (zero-trust), Stream (video), etc. Pages is loss-leader infrastructure that acquires developers.
3. **There ARE hard limits, just not bandwidth-denominated:**
   - Free plan: 500 builds/mo, build completes within 20 minutes, max 20,000 files per deployment, max 25 MiB per file.
   - Cloudflare Workers on Pages (dynamic functions): Free plan = 100k requests/day + 10 ms CPU/request. Over that, the site returns 1042 errors.
   - Cloudflare R2 storage (the recommended asset backend): 10 GB free/mo, then $0.015/GB/mo storage + $0 egress.

**Relevance to tadaify:**

We are on Cloudflare for SaaS, which is a *different product* from Pages but shares the same bandwidth cost basis. This means **our per-GB serve cost is closer to $0.0 than CloudFront's $0.085**. Our business could theoretically also offer unlimited bandwidth.

So why do we price on bandwidth at all?

Because views are the billing signal, not bandwidth per se. We charge for *views* for three reasons:

1. **Views correlate with value to the creator.** A creator with 10k views/mo gets more value from the product than one with 10 views/mo — they got more reach, more commerce conversion, more email captures. Pricing on views captures this value.
2. **Views correlate with load on our systems beyond bandwidth.** Each view fires 5-10 analytics events to our S3+Athena pipeline (DEC-029), each view hits our Supabase Edge Function once for SSR, each view potentially triggers rate-limit counter increments. The full-stack cost of a view is not just bandwidth.
3. **Views are a signal creators understand.** "10,000 monthly page views" is legible; "5 GB egress" is not.

So the model becomes: we charge on views because they're the value signal; our cost-basis on Cloudflare allows us to price views generously (because we don't pass through CloudFront's $0.085/GB); this is a margin advantage over Framer (on Vercel) or any US-SaaS competitor that bills their creators to cover retail egress.

Call this the **Cloudflare arbitrage**: we inherit near-zero egress cost from Cloudflare's pricing structure, and we pass *some* of that savings to creators (our Free tier is 2× Framer's, our overage rate is 3× cheaper), while keeping *some* as margin (our Pro price of €15/mo on 1M views = €0.015/1k views, vs Framer's Pro at $30/mo for similar quotas). Sustainable at all scales tested because our cost basis genuinely is lower than Framer's.

### 2.4 Framer (design + publish)

Framer is the closest analog to tadaify's pricing situation and deserves the longest treatment. They are a design/page-building tool that ships creator pages to a CDN and prices based on page views. Their pricing page has been stable since their 2024 overhaul and is the best available study of how a creator-facing (not developer-facing) product sells usage-based pricing.

**Plan structure (2026) — `framer.com/pricing`, cross-verified via Framer's May 2025 pricing announcement blog post:**

| Plan | Monthly | Bandwidth / views | CMS items | Sites | Seats |
|---|---|---|---|---|---|
| **Free** | $0 | 1k visitors/mo per site | 200 items | 1 | 1 |
| **Mini** | $5/site/mo | 10k visitors | 500 items | 1 | 1 |
| **Basic** | $15/site/mo | 100k visitors | 1,000 items | 1 | 1 |
| **Pro** | $30/site/mo | 1M visitors | 10,000 items | 1 | 1 |
| **Team/Enterprise** | $60+/member/mo | higher + per-seat | high | many | SSO |

The per-site pricing structure is unusual — most plans are per-account, but Framer prices per-site because each site has its own domain and analytics. A creator with 3 sites pays 3× Basic.

**Overage behaviour:**

Framer does **NOT offer overage billing** on Free / Mini / Basic / Pro. When a site exceeds its visitor quota, the site is throttled for the remainder of the month. Specifically:

- Free: throttled to "limited views" (rate-limit to ~1 req/s) after 1k visitors.
- Mini / Basic / Pro: site continues to load but displays a "visitor limit reached" notice and Framer sends daily upgrade emails. The creator must manually upgrade to restore full service.

This is a HARD CAP model with a softer in-product warning. It's the opposite of Vercel Pro (auto-overage-bill) and more like Vercel Hobby (hard cap) but with less abrupt failure mode.

**Dashboard UX (researched via Framer's own site-analytics views, 2026):**

Framer's site analytics shows:

- Monthly visitor counter with cumulative bar toward quota.
- 7-day and 30-day visitor trend chart.
- "Top pages" ranking (which page drove the most visits).
- Quota-reset countdown.
- Upgrade CTA placed directly under the quota bar (persistent, not dismissable).

What Framer explicitly does NOT ship:

- Per-page weight estimates at design time. The Framer editor does not predict "this page is 2 MB so you'll hit your quota faster." This is a gap tadaify should fill.
- Forecast line. Vercel shows "you'll hit your quota on day 22 at current pace"; Framer shows only past data.
- Bot-exclusion counter. Framer counts all traffic as "visitors" without distinguishing bots.
- Cost-per-additional-visitor signal. The creator has no way to know "1 more visit costs me €0.00X."

**Framer's messaging discipline:**

Read the Framer pricing page carefully and you'll see Framer has made a strong choice: **the word "bandwidth" never appears**. The pricing unit is "monthly visitors." The quota is "visitor allowance." The overage behaviour is "visitor limit reached." This is deliberate — Framer's target buyer (designer, founder, agency) understands visitors; they do not want to reason about GB.

Framer's three-word pricing pitch is "one price per site" — not per feature, not per seat, not per API call. This bundles the pricing complexity into a single dimension the buyer can reason about in 5 seconds.

**Critiques of Framer's model (from Reddit r/FramerCommunity, IndieHackers, Twitter — aggregated):**

1. **Per-site pricing feels expensive.** A freelance designer with 10 clients can't afford $30 × 10 = $300/mo to host all their Framer sites. They either pay it (and charge the client) or leave. This is the #1 pricing complaint on Framer forums.
2. **1k visitors/mo on Free is cripplingly low.** Most users hit this within 2 weeks; the Free tier is effectively a demo, not a usable tier. Framer knows this and positions Free as "explore the editor" not "publish a real site."
3. **Hard cap with no overage is abrupt.** Creators whose TikTok video goes viral see their Framer site disappear at the worst possible moment. Framer's response (send upgrade email) arrives at the same time as the viral traffic but the creator needs to see it, read it, click upgrade, enter payment — typically a 24-hour gap where the site is inoperative.
4. **No bot exclusion.** A few high-profile DDoS-adjacent incidents in 2024-2025 where competitors' or detractors' bots drained Framer creators' quotas.

**Lessons for tadaify:**

1. **Adopt the visitor-first vocabulary.** "Monthly page views" in all UI copy. Never show GB to the creator unless they're a Business-tier customer explicitly asking for it.
2. **Ship the in-editor weight calculator** — Framer's biggest editor UX gap. Every block the creator drags into the editor should update a live "page weight: 342 KB" indicator.
3. **Ship forecast lines** — Vercel has them, Framer doesn't. "At current pace you'll hit your quota on day 23" is actionable; "you're at 68% of quota" is not.
4. **Don't hard-cap paid tiers.** Framer's "upgrade email or site goes dark" flow loses customers at the exact moment they're most willing to pay. Auto-bill overage (at a published rate) with a spend-cap safety valve is the Vercel model and is better than Framer's.
5. **Ship bot-exclusion on the dashboard.** Separate "human views" from "bot views" as a creator trust-building mechanism.
6. **Do NOT copy per-site pricing.** Tadaify uses per-creator (per-account) pricing; a Pro creator can have as many sub-pages as they want under a single handle. This is a simpler story and avoids the Framer agency-pricing pain.

### 2.5 Webflow (web dev + CMS)

Webflow prices on visits and has the most mature usage-based model in the website-builder category. It's also the most complex — their pricing page has 5 tiers across 2 product lines (Site Plans + Workspace Plans).

**Site Plans (per-site pricing, for ONE website) — `webflow.com/pricing`:**

| Plan | Monthly | Bandwidth / visits | CMS items | Forms |
|---|---|---|---|---|
| **Starter** | $0 | ~1k visits | 50 items | 50 submissions |
| **Basic** | $14 | 250GB bandwidth, 50k visits | — | unlimited |
| **CMS** | $23 | 400GB, 150k visits | 2,000 | unlimited |
| **Business** | $39 | 800GB, 500k visits | 10,000 | unlimited |
| **Enterprise** | custom | custom | custom | custom |

**Webflow counts "visits" as unique sessions per 24-hour window**, not page views. A single user visiting 20 pages in a session = 1 visit. This is a meaningfully different definition from Framer's per-pageview counting and matters for the math: Webflow's 50k visits on Basic might be 300k page views; Framer's 100k visitors on Basic is 100k page views.

**Overage policy:**

- **Starter:** hard cap. Site goes offline until next month.
- **Basic and up:** soft — bandwidth metered, paid via add-on bandwidth packages (starting at $10/mo for an extra 100GB).

**Dashboard UX:**

Webflow's dashboard is famously cluttered — a common complaint from designers transitioning from Framer or Figma Sites. The Usage tab shows bandwidth and visit counters but buries them under 4 clicks. Webflow users often complain they get hit with overage charges they didn't see coming because the default dashboard doesn't surface usage prominently.

**Lessons for tadaify:**

1. "Visits" vs. "page views" is a definitional minefield. Tadaify should use **page views** (simpler, matches Framer's convention, matches analytics industry standards).
2. Usage must be visible on the dashboard homepage, not 4 clicks deep. This is a design rule: **any cost-accruing metric must be visible within one click of login**.
3. Add-on bandwidth packages (Webflow's approach to overage) is a creative model but adds complexity. Simple per-view overage billing is cleaner.

### 2.6 Squarespace + Wix (website builders)

Both market "unlimited bandwidth" and both have fair-use policies buried in their Terms of Service that the marketing doesn't mention.

**Squarespace (2026):**

- All plans (Personal $16, Business $23, Commerce Basic $27, Commerce Advanced $49): "Unlimited bandwidth and storage." — *Marketing claim*
- ToS §5.4: "Squarespace may suspend or terminate Sites that consume resources inconsistent with typical use, including bandwidth exceeding 2 TB/month without prior notice."
- Actual enforcement: Squarespace sends a warning email at 1.5 TB; throttles at 2 TB; suspends the site if usage continues at 3 TB+. This has been confirmed in several high-profile incidents (viral podcast episodes, celebrity Instagram links, etc.) though Squarespace has never published the thresholds.

**Wix (2026):**

- Similar claim: "Unlimited bandwidth on Business and Commerce plans."
- ToS §7.2: "Wix reserves the right to limit bandwidth in cases of abuse or extraordinary usage."
- Actual enforcement: Wix is looser than Squarespace. Sites running at 5+ TB/month have been reported without action. But Wix has aggressively enforced against "media hotlinking" (using Wix as a CDN for videos embedded in external sites) — this is the most common way users get hit.

**Lessons for tadaify:**

1. "Unlimited" in marketing + fair-use in ToS is the **worst possible UX** — creators are blindsided when they hit the hidden threshold. Tadaify should never use "unlimited" language for bandwidth. Say "1M views" or "5M views."
2. Squarespace and Wix are pricing at value (what the creator is willing to pay for "a website") not cost (what it costs to serve the bandwidth). They can sustain this because the average Squarespace site is under 100GB/month and the outliers are rare enough to be absorbed. Tadaify could theoretically do the same. The reason we don't: our expected usage shape is more bimodal (most creators tiny, a minority viral), so averaging won't work; we need per-user quotas.
3. Squarespace's "unlimited bandwidth with fair-use" contract is a trust-destroying UX because the fair-use is secret. Tadaify's equivalent — published caps and published overage rates — is honest and therefore more trustworthy.

### 2.7 Substack, Ghost, Beehiiv (newsletter platforms)

Newsletter platforms don't directly compete with tadaify but are included here because tadaify will have email features (inherited from linkofme per DEC-SYN-35) and may eventually need send-based pricing on the email side.

**Substack (2026):**

- Free to creators. Revenue model: 10% of subscription revenue from paid subscribers.
- No bandwidth or send quotas; Substack's cost is absorbed into the 10% take.
- Relevance to tadaify: unusable for our model (we don't take transaction fees; that's a committed policy).

**Ghost (2026):**

- **Ghost(Pro) pricing is membership-based**: Starter $9/mo for 500 members, Creator $25 for 1k, Team $50 for 1k + team, Business $199 for 10k. Ghost's "members" counts authenticated subscribers, NOT page visitors; pricing scales with audience size directly.
- Overage: each plan has a ceiling; you upgrade at the ceiling.
- Send limit: no specific send limit; email sending is bundled.

**Beehiiv (2026):**

- Launch plan: free for up to 2,500 subscribers, 4 sends/mo limit.
- Scale: $42/mo for 10k subscribers, unlimited sends.
- Max: $84/mo for 100k subscribers.
- Enterprise: custom above 100k.
- Overage: none; each plan has a subscriber ceiling, upgrade required at ceiling.

**Lessons for tadaify:**

1. Substack's fee-based model (10% of revenue) is the only one in the creator category that doesn't charge per-feature or per-usage. It's elegant for the creator but we've committed to 0% fees, so it's out.
2. Ghost and Beehiiv price on audience size, not activity. This is conceptually similar to tadaify's views-based pricing but applied to members. Tadaify *could* alternatively price on member count (subscribers-to-creator), but this has a major weakness: **a popular creator can have millions of IG followers and only 10 of them ever click through to their tadaify page**. IG followers != views; subscriber count != page engagement. Views is the right unit.
3. None of these platforms ship overage. The industry norm is "upgrade or cap"; only Vercel/Netlify (developer platforms) have popularised overage billing for creator-adjacent products. Tadaify differentiates by shipping overage (done right) on paid tiers.

### 2.8 Shopify, Etsy (commerce platforms)

Both charge transaction fees, not bandwidth, so they're only partially relevant. But tadaify will have commerce primitives per the feature-mix (PAT-013..020, DEC-SYN-46) and commerce volume needs to be thought through.

**Shopify (2026):**

- Basic $39/mo, Shopify $105, Advanced $399, Plus $2,300+
- **Commerce take rate 2.9% + $0.30 on Basic; 2.4% + $0.30 on Advanced.** This is on top of Stripe's own fees, which Shopify absorbs.
- Bandwidth: Shopify-hosted pages are unlimited bandwidth in marketing; fair-use applies in practice (rare to hit).
- Per-user seat pricing on Plus tier.

**Etsy (2026):**

- Listing fee $0.20 per item.
- Transaction fee 6.5% of sale price.
- Payment processing 3% + $0.25.
- No bandwidth charges.

**Lessons for tadaify:**

1. Bandwidth is not Shopify's cost model because Shopify's cost driver is transaction volume (payment infrastructure, not CDN). Tadaify is different: we pass transactions to Stripe at 0% take rate, so our cost driver *is* bandwidth.
2. If tadaify adds seat-based pricing at the Business/Team tier (currently not planned), the Shopify Plus model is a reference — per-seat pricing only at the top tier, with other tiers being per-account.
3. Tadaify's 0% fees commitment (DEC-SYN-26) means we can't copy Shopify's cost-recovery strategy. Our pricing is purely on the hosting side.

### 2.9 AWS Amplify Hosting + CloudFront (infra layer)

This is the actual infrastructure we ride on. Prices here are our cost basis.

**AWS Amplify Hosting (2026):**

- Build minutes: $0.01/min
- Storage: $0.023/GB/mo (S3)
- Data transfer out: $0.15/GB (tiered, drops to $0.05/GB at very high volume)
- SSR function duration: $0.30/million invocations + $0.20/GB-hour

**AWS CloudFront direct (2026):**

- Data transfer out to internet: $0.085/GB (first 10 TB US/EU), drops to $0.07 / $0.06 / $0.04 at volume tiers
- HTTPS request pricing: $1.00 per million HTTPS requests (US/EU)
- Field-level encryption: $0.02 per 10k requests (mostly irrelevant)
- Real-time logs (for metering): $0.01 per 1M log lines + Kinesis costs

**AWS CloudFront SaaS Manager (per infra-cost-analysis.md §4.2):**

- No per-tenant fee above standard CloudFront pricing (verified 2026-04-24 via AWS blog).
- ACM certs issued free, auto-rotated.
- Per-tenant egress/request metering via CloudFront Real-Time Logs.

**Relevance to tadaify:**

Our effective cost per page view, at our scale assumptions:

- Page weight 500 KB (design target for a media-heavy creator page): CloudFront egress = 500/1024 KB × $0.085/GB = $0.00004
- HTTPS request cost: 1 request per page view × $1/M = $0.000001
- Rounded: **$0.00004 per view** (bandwidth-dominated).

For 100,000 views: ~$4. For 1,000,000 views: ~$40. For 10,000,000 views (viral month): $400.

**But:** if we ship on Cloudflare for SaaS instead of CloudFront (per DEC-028, DEC-033):

- Cloudflare egress: **$0** (included in Cloudflare plan, no per-GB fee)
- Cloudflare HTTPS request: free (unless we exceed Workers quotas, which we don't for static serving)
- Cloudflare for SaaS per-hostname: $0.10/mo after 100 free

Our cost basis on Cloudflare is approximately **$0.10/mo per active custom domain + $0 egress**. For 10,000 custom-domain users that's $990/mo + $0 egress vs. CloudFront's equivalent $1,200/mo + $12,000 egress at 100k GB/mo.

**Cloudflare is the right choice — and the margin arbitrage is real.** The tadaify Pro tier at €15/mo serves 1M views for effectively zero bandwidth cost to us; the creator feels they're paying for bandwidth, but we're paying Cloudflare a flat rate. The €15 is nearly all margin.

This is the single biggest piece of infrastructure economics in this document. **Tadaify's pricing model only works because of Cloudflare's near-zero egress cost.** Competitors on Vercel (Framer) or Netlify (no one in our category) can't match this pricing without bleeding cash.

### 2.10 Cloudflare Workers + R2 (egress-free storage)

R2 is Cloudflare's S3-equivalent object storage, launched 2021 and GA since 2022.

**R2 pricing (2026):**

- Storage: $0.015/GB/mo (first 10 GB free)
- Class A operations (writes): $4.50/M
- Class B operations (reads): $0.36/M
- **Egress: $0** — the signature feature

**R2 vs. S3 for tadaify's media storage:**

| Feature | S3 + CloudFront | R2 |
|---|---|---|
| Storage cost | $0.023/GB + $0.085/GB egress | $0.015/GB + $0 egress |
| Read operations | $0.0004/1k | $0.00036/1k |
| Latency (global) | 20-40 ms (CF edge) | 10-30 ms (Cloudflare POPs) |
| S3 API compatibility | Native | S3-compatible |
| Durability | 11 nines | 11 nines |

For tadaify's media-heavy pages (avatars, product hero banners, block images, animated GIFs), R2 is dramatically cheaper at scale. At 1 TB creator media stored + 10 TB egressed per month:

- S3+CloudFront: $23 storage + $850 egress = $873/mo
- R2: $15 storage + $0 egress = $15/mo

**Lessons for tadaify:**

1. **Use R2 for all creator media storage**, not S3. This is a documented-but-underappreciated 50×+ cost win.
2. Tadaify's bandwidth-based pricing is dramatically more defensible because our egress cost is near-zero thanks to R2 + Cloudflare for SaaS. A competitor on S3+CloudFront would have 50× our bandwidth cost basis and couldn't match our prices.
3. The infra-cost-analysis.md didn't explicitly recommend R2 over S3 — this is a refinement this pricing doc proposes. Recommend updating the infra stack to R2 for media.

### 2.11 Framer-specific benchmark — how Framer educates users

Framer is our closest direct competitor in usage-based creator pricing. This sub-section goes deeper than §2.4 to catalog every pattern we should adopt or reject from Framer's implementation.

**Pattern F1: Monthly visitor allowance visible in site settings**

Framer shows the quota on the site settings page, not in the editor. You click Settings → Billing → see "17,234 of 100,000 monthly visitors." This is too far from where the creator actually spends time (the editor). Tadaify improvement: surface the quota in the editor toolbar, visible at all times during design work.

**Pattern F2: Quota-bar as upgrade CTA**

When a creator is at 80%+ of quota, Framer's dashboard shows a full-width banner: "You're approaching your visitor limit. Upgrade to Pro." This is a soft upsell placed naturally in the flow. We should adopt this pattern but with a key addition: **show the cost of upgrading inline** ("Upgrade to Pro: €15/mo for 1M visitors — first pro-rated charge: €8.27 for 18 days remaining") so the creator can decide in context.

**Pattern F3: Site limit reached = visitor sees unstyled error page**

When Framer throttles a site that's over quota, visitors see a Framer-branded "visitor limit reached" error page. This is maximally embarrassing for the creator — their audience sees a third-party error at the creator's URL. It's an effective upgrade motivator but at the cost of creator dignity. Tadaify improvement: **soft throttle means the site still loads, just slower** (2 req/s rate limit). Creator's audience never sees an error page; they see a slightly slower tadaify experience. The creator keeps their dignity; we keep the upgrade pressure via the dashboard.

**Pattern F4: No editor-integrated weight calculator**

Framer's editor doesn't tell you how heavy your page is. A creator dragging in 30 high-resolution images has no idea they're about to blow their quota. Tadaify's biggest differentiator opportunity: **editor shows live page-weight estimate + "views-at-current-weight" formula + optimization button**. This is the single most valuable UX we can ship that Framer doesn't have.

**Pattern F5: No bot/human distinction**

Framer counts all visitors, including bots and scrapers, toward the quota. This creates two problems: creators get unfair quota drain, and bad actors can weaponize it (scrape a rival's site to force their upgrade). Tadaify: **count only human visitors against quota**, with clear bot-filtering logic visible on the dashboard ("1,234 human views + 456 excluded bot visits this month").

**Pattern F6: Hard cap at quota with no overage option**

Framer forces upgrade-or-throttle. A Pro creator at 999k visits who doesn't upgrade in time sees their site throttled on hit #1,000,001. Tadaify: **paid tiers default to auto-overage billing at a published rate**, with opt-in spend cap for creators who prefer Framer's behaviour. This is a clear superiority claim we can make against Framer.

**Pattern F7: Per-site pricing**

Framer prices by site; a creator with 5 client sites pays 5×. Tadaify: **per-account pricing with multi-site as a tier feature** (Free/Creator = 1 site, Pro = 3 sites, Business = unlimited sites). Same revenue capture, simpler math for the creator.

**Pattern F8: No forecast / trend**

Framer shows current month's visitor counter; it does not forecast when you'll hit quota or show trend-to-quota. Tadaify must ship forecast + trend on the dashboard (Vercel-style).

**Pattern F9: Quota reset on calendar month**

Framer resets on the 1st of each calendar month UTC. Tadaify should adopt this convention — not subscription-anniversary-reset, which is confusing. All creators get quota reset on the same date so they can benchmark against each other, the platform can report cleanly, and upgrade decisions don't depend on knowing the exact anniversary date.

**Pattern F10: Framer doesn't publish its overage rates**

Framer's site throttles but doesn't bill — so Framer has never had to publish an overage rate. Tadaify WILL publish overage rates (€0.20 / €0.30 / €0.50 per 10k views on Business / Pro / Creator respectively) upfront on the pricing page. This transparency is a marketing asset.

**Pattern F11: Visitor counter display math is opaque**

Framer says "monthly visitors" but doesn't explain what counts. A single session across 5 pages = 1 visitor or 5? A return visit 3 days later = new visitor? Framer's docs say "unique visitors per 30-day rolling window identified by cookie," but this isn't explained on the pricing page. Creators are confused whether their dashboard "visitor count" matches the billing counter. Tadaify improvement: **every counter has a tooltip explaining exactly what it counts**, with examples ("a refresh within 5 minutes doesn't count twice").

**Pattern F12: Framer's upgrade flow is 3 clicks, not 1**

Creator hits quota warning → click banner → lands on billing page → select tier → enter card → checkout. This is 4+ clicks plus form fields. At viral-moment timing, each click is a potential drop-off. Tadaify: **one-click upgrade** using a Stripe saved payment method + pre-computed pro-ration. The creator who already has a card on file clicks one button and the upgrade completes in 3 seconds.

**Pattern F13: No "tier right-sizing" feedback**

If a creator on Framer Pro consistently uses only 10% of their quota, Framer doesn't suggest downsizing to save money. This is deliberate (revenue) but erodes trust over time. Tadaify improvement: **quarterly "you could save money by downsizing" email**, opt-in, framed as a customer-friendly feature. Yes, we lose some revenue; we build trust that pays back via word-of-mouth. This is a pricing-model statement, not just a UX tweak.

**Pattern F14: Analytics-vs-billing counter mismatch**

Users on Framer forums regularly complain that their Google Analytics counter shows 50k visitors but Framer's billing counter shows 120k — a 2.4× discrepancy. This happens because Framer counts bots, CDN-cached-but-still-billable requests, and some mis-classified analytics hits. Tadaify: **our billing counter must match our analytics counter exactly** (they come from the same pipeline). If it doesn't, creators will never trust the bill.

**Pattern F15: No per-month trend of upgrade/downgrade**

If Framer detects a creator's usage is growing linearly and will cross to the next tier in 3 months, they don't warn. Creator hits quota in month 3 and is surprised. Tadaify: **forecast ahead 3 months on the dashboard** — "at current growth, you'll outgrow Creator in August. Plan ahead."

**Summary of Framer analysis:**

Framer's model is the closest precedent but it's still rough around 15+ UX edges. Tadaify can build on top of Framer's framework (visitor-based quotas, per-account pricing with caveats, dashboard progress bars) while fixing the worst flaws: no editor integration, no bot exclusion, no overage, opaque counting, slow upgrade flow, no right-sizing, analytics mismatch, no trend forecast. These are not nit-picks; they are the difference between a creator feeling in control (tadaify design goal) and feeling held hostage (Framer's actual user-forum sentiment).

The net effect: tadaify's pricing UX should be 2-3 years ahead of Framer on design quality. This is achievable because Framer's product is already in-market (they can't do a clean-slate redesign without disruption); tadaify is still in architecture phase and can bake the good patterns into the first release.

**Framer pricing at each audience size — ground-truth comparison:**

| Creator size | Views/mo | Framer tier needed | Framer price | Tadaify tier | Tadaify price | Tadaify savings |
|---|---|---|---|---|---|---|
| 500 followers, hobby | 30 | Free | $0 | Free | €0 | $0 |
| 5k followers, side hustle | 400 | Free | $0 | Free | €0 | $0 |
| 10k followers, aspiring | 800 | Mini $5/site | $5 | Free | €0 | **$5/mo** |
| 25k followers, niche | 2k | Mini $5/site | $5 | Free | €0 | **$5/mo** |
| 60k followers, semi-pro | 4k | Mini $5/site | $5 | Free | €0 | **$5/mo** |
| 100k followers, solo pro | 8k | Mini $5/site | $5 | Free | €0 | **$5/mo** |
| 200k followers, pro | 15k | Basic $15/site | $15 | Creator €6 | €6 | **$9/mo** |
| 500k followers, big | 40k | Basic $15/site | $15 | Creator €6 | €6 | **$9/mo** |
| 1M followers, major | 80k | Basic $15/site | $15 | Creator €6 | €6 | **$9/mo** |
| 2M followers, star | 150k | Pro $30/site | $30 | Creator €6 | €6 | **$24/mo** |
| 5M followers, viral | 400k | Pro $30/site | $30 | Pro €15 | €15 | **$15/mo** |
| 10M followers, top | 800k | Pro $30/site | $30 | Pro €15 | €15 | **$15/mo** |
| Brand/agency | 2M | Pro $30/site | $30 | Pro €15 + overage | €45 | —$15/mo |
| Brand multi-site | 2M × 5 sites | Pro $30 × 5 | $150 | Pro €15 | €15 | **$135/mo** |

Observations:

1. **Tadaify is cheaper at nearly every scale** — the one exception is a single-site Pro creator near their Pro quota, where Framer's fixed $30 beats tadaify's €15 + overage. At multi-site agency scale, the Framer per-site trap explodes costs.
2. **The biggest tadaify advantage is 10k-100k followers** — solo creators on Framer's Mini plan who'd be Free on tadaify. This is our target segment per DEC-SYN-33.
3. **Framer's 1k Free quota is the single biggest source of "first paid $" conversion** — creators on Framer free hit quota quickly and upgrade to Mini. Tadaify's 10k Free quota moves 10× more creators into the Free-loved bucket without upgrading. Short-term revenue trade-off; long-term word-of-mouth win.

This is the pricing table we put on tadaify.com/vs/framer. Direct, honest, specific. No hedging.

---

## 3. Tadaify tier design

### 3.1 Quota units — views vs GB

This is the single most consequential product decision in this document. Every other pricing decision rides on it.

**Option A: views-based UI, views-based billing.**

Pros: simplest for the creator. "100k views" is one concept end-to-end. No conversion required.

Cons: a creator with a 10 MB page (lots of video, heavy images) gets the same 100k views as one with a 100 KB page, but costs us 100× the bandwidth. The 100 MB-page creator is a margin disaster; the 100 KB-page creator is a margin windfall. View-only billing ignores our real cost structure.

**Option B: GB-based UI, GB-based billing.**

Pros: matches our cost structure exactly. Every GB a creator serves costs us X; we charge them for GB served.

Cons: creators don't understand GB. A creator asked "how many GB did your page do this month?" will blank. This is the AWS-bill cognitive trap — we become as incomprehensible as CloudFront.

**Option C (recommended): views-based UI, GB-based billing under the hood.**

Pros: creator sees "100k views" (legible); billing aggregates to GB (cost-accurate). If a creator has a heavy page, they hit their view-quota faster because our billing system converts behind the scenes. No conceptual load on the creator.

Cons: requires us to pick an "assumed average page weight" as the conversion factor. Too high and heavy-page creators over-pay (slight unfairness); too low and heavy-page creators under-pay (margin risk).

**The math for the conversion factor:**

Average page weight assumption: 500 KB. Basis: tadaify's functional spec ships media-heavy creator pages (hero banners, product images, entrance animations via Lottie 50-200KB each). 500 KB is a design target we enforce in the editor (warning at 1 MB, blocking at 2 MB).

Conversion: **1 view = 0.5 MB = 0.00049 GB.**

- 10,000 views = 4.88 GB
- 100,000 views = 48.8 GB
- 1,000,000 views = 488 GB
- 5,000,000 views = 2.44 TB

These numbers line up cleanly with competitor tier brackets, which tells me 500 KB is the right industry assumption.

**Enforcing the weight budget in-editor:**

The editor tracks page weight live. At 500 KB the badge is green. At 750 KB amber ("heavy — consider optimizing"). At 1 MB red ("too heavy; your views will burn quota 2× faster"). At 2 MB, block saving the page with a "reduce weight below 2 MB to publish" modal.

This is the in-editor weight calculator — more on this in §4.1 — and it's the feature that makes the conversion factor fair. Creators who stay within the 500 KB budget get the full view count. Creators who blow past it (and we have to let them, because sometimes a creator NEEDS a 1 MB hero video) pay with faster quota consumption.

The billing system's actual view-to-GB rule:

```
billable_views = ceil(actual_bytes_served / (500 KB))
```

A creator whose pages average 250 KB serves 2 "billable views" per real page view — they get twice the quota. A creator whose pages average 1 MB serves 0.5 billable views per real view — they burn quota twice as fast.

In UI this never shows up as GB. The creator sees "Your pages average 680 KB — slightly heavier than the 500 KB budget. 100,000 real views will count as 136,000 quota views." This is legible and actionable.

**Verdict: Option C.** Views in UI, GB in billing backend, with a transparent heaviness multiplier shown to the creator on the dashboard.

### 3.2 Calibrated tier proposal

With the quota unit locked, we can design tiers. The constraints:

- **Free tier must be generous enough that 70-80% of creators never hit it.** This is the acquisition magnet. Benchmark: Framer's 1k visitor Free tier is too stingy; Vercel's 100 GB Hobby is too generous. Tadaify aim: 10,000 views/mo covers a creator with ~100k IG followers at typical 10% bio-link CTR. That's the target profile for our primary segment per DEC-SYN-33.

- **Creator tier must absorb 95th percentile creators.** Our primary segment is nano-micro creators (0-100k followers). The 95th percentile creator in this segment has maybe 50k-80k followers and gets ~20-50k views/mo. Creator tier at 100k views covers them comfortably with 2-5× headroom.

- **Pro tier must absorb the 99th percentile (top 1% of active creators).** Creators with 100k-1M followers who go viral occasionally. Pro at 1M views covers all but a handful of truly viral accounts.

- **Business tier must absorb 99.9th percentile + brand agencies.** Creators with millions of followers, commerce businesses with large audiences, agencies managing multiple brands. Business at 5M views + unlimited sites covers this.

- **Margin target: 85%+ gross at each tier at 10k MAU scale (our near-term design point).**

**The calibrated tier table:**

| Tier | Price | Views/mo | Egress (at 500KB/view) | Storage | Sites | Custom domains | Overage rate | Spend cap option |
|---|---|---|---|---|---|---|---|---|
| **Free** | €0 | 10,000 | 4.88 GB | 100 MB | 1 | 0 (upgrade to add) | Soft-throttle 2 req/s | N/A |
| **Creator** | €6/mo (€60/yr) | 100,000 | 48.8 GB | 1 GB | 1 | 1 free (cross-tier) | €0.50/10k views | Yes |
| **Pro** | €15/mo (€144/yr) | 1,000,000 | 488 GB | 10 GB | 3 | 3 free | €0.30/10k views | Yes (default) |
| **Business** | €49/mo (€468/yr) | 5,000,000 | 2.44 TB | 50 GB | Unlimited | Unlimited | €0.20/10k views + priority routing | Yes (default) |

**Custom domain add-on (all tiers except Free): +€2/mo per additional domain beyond included.**

Rationale for each number:

**Free: 10,000 views/mo.** Based on: 10% CTR from 100k IG followers. Covers the hobbyist + early-stage creator. 70-80% of free users will never hit this (most creators have <10k followers and the bio-link CTR is only a few percent in practice). Soft throttle at 100% prevents the site from going offline — it just slows down.

**Creator: €6/mo, 100,000 views.** Price anchor: slightly above Carrd ($19/year = $1.58/mo) + Bio.link ($5/mo) to signal more premium than basic link-lists but cheaper than Linktree Starter ($8). €6 hits the PL/EU sweet spot psychologically (below €10 single-digit threshold, slightly above the €5 Bio.link anchor to avoid direct price war). 100k views covers 10× the Free quota — the creator scales into their audience. Price per 10k views: €0.60. Overage at €0.50/10k views = slight margin recapture beyond included.

**Pro: €15/mo, 1,000,000 views.** Price anchor: matches Linktree Pro ($15) exactly. The creator who would have paid Linktree Pro pays tadaify Pro for 10× the views + all features free. 1M views is 10× Creator and covers 99% of active full-time creators. Price per 10k views: €0.15. Overage at €0.30/10k views reclaims margin.

**Business: €49/mo, 5,000,000 views.** Price anchor: below Linktree Premium ($35) and Later Starter ($50) but above Beacons Premier ($40), positioned as "a real business storefront, not a hobby." 5M views covers viral creators and brand agencies. Price per 10k views: €0.098. Overage at €0.20/10k views.

**The tier progression** passes two sanity checks:

1. **Price-per-10k-views decreases at higher tiers:** €0.60 → €0.15 → €0.098. This is economically correct (volume discount) and intuitively fair.
2. **Views multiplier is 10× between tiers:** 10k → 100k → 1M → 5M. Even multiples are easier to reason about than arbitrary numbers.

**Comparison to synthesis-era proposal (DEC-SYN-24/25 before pivot):**

The pre-pivot pricing was Free (feature-crippled) + Pro $12 + Business $30, Linktree-parity. This new pricing is:

- Free: richer (all features) at same €0
- Creator: NEW €6 tier (didn't exist before) — effectively splits Pro $12 into two price points
- Pro: $15 unchanged but now has all features
- Business: $49 vs. old $30 — moves up to reflect unlimited-sites + priority routing

Revenue-wise the new model is probably **slightly lower ARPU** (€6 Creator users who would have been €12 Pro users; some Pro users don't move to €49 Business). This is offset by higher conversion (more creators will pay €6 vs. €12) and vastly better positioning (feature-complete free tier = strong word-of-mouth).

### 3.3 Bandwidth math — why these specific quotas

Show the detailed unit economics per tier, using Supabase + Cloudflare for SaaS + R2 as the infra stack (per DEC-027 Supabase Path A + DEC-033 Cloudflare for SaaS + §2.10 R2 refinement).

**Free tier (€0 price) — unit economics:**

- Monthly views: 10,000
- Egress: 4.88 GB
- Cloudflare egress cost: **$0** (included in plan)
- R2 media storage: 100 MB × $0.015/GB = $0.0015
- R2 read ops: 10k views × 5 assets per view × $0.00036/1k = $0.018
- Supabase Edge Function invocations: 10k × $2/M = $0.02
- Analytics events to S3+Athena: 10k × 10 events/view × $0.10/GB / 200 events/KB = ~$0.003
- **Total variable cost: ~$0.04 per Free user per month**
- Revenue: $0
- **Net cost: $0.04/user** — Free tier is a lead-gen expense of $0.04/user/mo

At 10k Free users: $400/mo cost for the Free tier. Acceptable: our Pro+ revenue covers this 50× over.

**Creator tier (€6/mo price) — unit economics:**

- Monthly views: 100,000
- Egress: 48.8 GB
- Cloudflare egress: $0
- R2 storage: 1 GB × $0.015 = $0.015
- R2 read ops: 100k × 5 × $0.00036/1k = $0.18
- Supabase Edge Fn: 100k × $2/M = $0.20
- Analytics events: 100k × 10 × $0.10 / 200 = $0.05
- Custom domain (if enabled): $0.10 Cloudflare + $0 cert + $0 routing = $0.10
- **Total variable cost: ~$0.55 per Creator user per month**
- Revenue: €6 = ~$6.36
- **Gross margin: 91%**

At 900 Creator users (10k MAU × 9% Creator conversion): $5,724 revenue, $495 cost. Net: $5,229.

**Pro tier (€15/mo price) — unit economics:**

- Monthly views: 1,000,000
- Egress: 488 GB
- Cloudflare egress: $0
- R2 storage: 10 GB × $0.015 = $0.15
- R2 read ops: 1M × 5 × $0.00036/1k = $1.80
- Supabase Edge Fn: 1M × $2/M = $2.00
- Analytics events: 1M × 10 × $0.10 / 200 = $0.50
- Custom domain(s): $0.10 × 3 = $0.30
- **Total variable cost: ~$4.75 per Pro user per month**
- Revenue: €15 = ~$15.90
- **Gross margin: 70%**

Note: Pro margin is noticeably thinner than Creator margin. This is because Pro users are bandwidth-hogs relative to their price — 10× the views of Creator users at 2.5× the price. By design, this is where overage billing kicks in. The "€15 Pro user" is a break-even-ish baseline; the margin comes from Pro users who don't use their full quota AND Pro users who exceed quota (overage billed at €0.30/10k views).

Reality check: most Pro users will NOT hit their 1M view quota. A creator paying €15/mo is typically a full-time creator who *aspires* to viral reach but doesn't hit it consistently. Expected usage: 200k-400k views/mo for the median Pro user. Actual margin in practice: 85-90%, not 70%.

**Business tier (€49/mo price) — unit economics:**

- Monthly views: 5,000,000
- Egress: 2.44 TB
- Cloudflare egress: $0 (Business tier may get priority POPs with additional features)
- R2 storage: 50 GB × $0.015 = $0.75
- R2 read ops: 5M × 5 × $0.00036/1k = $9.00
- Supabase Edge Fn: 5M × $2/M = $10.00
- Analytics events: 5M × 10 × $0.10 / 200 = $2.50
- Custom domains: $0.10 × 10 = $1.00 (average)
- SLA support staffing allocation: ~$5/user
- **Total variable cost: ~$28 per Business user per month**
- Revenue: €49 = ~$52
- **Gross margin: 46%**

Business margin is thin on paper. Rationale: Business users are rare (1% of paid); they generate outsize revenue in absolute terms (10x Creator MRR); they signal enterprise credibility (good for marketing); they opt-in to overage gladly (median overage on Business = €20-50/mo incremental revenue).

In practice the Business tier is a loss-leader for the prestige tier, with overage revenue making it net-positive. Expected net margin after overage: 60-70%.

**Overage economics cross-check:**

A Creator hitting 200k views (2× quota) pays: €6 base + (100k excess × €0.50/10k) = €6 + €5 = €11. Cost: still ~$1/user. Margin: 91%. This is the power of overage — tadaify collects €5 incremental revenue for ~€0.50 incremental cost.

A Pro creator hitting 2M views: €15 base + (1M × €0.30/10k) = €15 + €30 = €45. Cost: ~$9. Margin: 80%.

A Business creator hitting 10M views: €49 + (5M × €0.20/10k) = €49 + €100 = €149. Cost: ~$56. Margin: 62%.

Overage consistently delivers margin expansion because the variable cost curve is flatter than the overage-price curve. This is the critical unit economic insight: **overage is where tadaify's margin actually lives.** Base tier pricing covers the baseline; overage is the accelerant.

### 3.4 Overage mechanics

The three choices and the verdict:

**Option A: Hard cap (Vercel Hobby).** At 100% of quota, site goes dark. Creator must manually upgrade or wait for reset. Pros: no surprise bills. Cons: worst UX at viral moment — creator's page is offline when their audience arrives.

**Option B: Soft throttle (Cloudflare Pages, sort of).** At 100%, site loads slower (rate-limited to X req/s). Creator can still reach users. Pros: graceful degradation. Cons: slow site during creator's biggest moment; audience gets bad experience.

**Option C: Auto-overage billing (Vercel Pro).** Over 100%, overage billed at published rate. Pros: site stays fast, creator gets billed for actual usage. Cons: surprise bill risk.

**Tadaify verdict: layered by tier.**

- **Free tier: Option B (soft throttle).** Reason: creators on free should never get billed unexpectedly. Throttling at 2 req/s means the site still loads, just slowly. Creator sees dashboard warning + upgrade CTA.
- **Creator, Pro, Business: Option C (auto-overage billing) with mandatory spend-cap.** Reason: paid creators want their site to stay fast and are willing to pay incrementally. Spend-cap ensures no surprise bills (creator sets a max monthly spend; if reached, site reverts to soft-throttle).

**The spend-cap default:**

- Creator: default cap = €20/mo (base €6 + €14 overage room = up to 380k views)
- Pro: default cap = €40/mo (base €15 + €25 overage = up to 1.83M views)
- Business: default cap = €150/mo (base €49 + €101 overage = up to 10M views)

Creator can raise or disable the cap (Vercel-style Spend Management). Default is protective; opt-in removal is for creators who want unlimited auto-scaling.

**When spend cap is hit:**

Instead of hard offline, the site **soft-throttles** to 2 req/s for the rest of the month — same behaviour as Free tier at quota. Creator gets an urgent email + in-app banner: "You hit your spend cap. Your site is throttled. Raise cap now (€X est. remaining billing) or wait for reset on <date>." This is the best of both worlds: no surprise bill AND no site-offline disaster.

**Overage alert thresholds:**

- 50% of quota: informational email + in-app badge, "heads up"
- 80%: warning email, "consider upgrade" CTA
- 100%: attention email, overage starts, "last chance to upgrade for better rate"
- 120%: urgency email, "we'll keep running but you're paying overage"
- 150%: alarm email, "review settings / consider upgrade tier"
- At spend cap: throttle notification

### 3.5 Quota reset semantics

**Reset policy: calendar month UTC** (1st of month, 00:00 UTC).

Rationale: 
- Consistent across creators (they can compare month-to-month)
- Clear reporting (monthly invoices line up)
- Matches competitor convention (Framer, Webflow, Vercel all do calendar month)
- Eliminates confusion about "which month am I in" at anniversary-based boundaries

**Carryover: NO unused quota rolls over.**

If a creator uses 20k of 100k views in March, they get 100k views in April — not 180k. Rationale: carryover encourages hoarding behaviour (don't publish new content to save quota) and complicates billing. The fair trade: slightly lower perceived value of unused quota, vs. much simpler mental model.

**Pro-ration on upgrade mid-month:**

Creator upgrades from Creator to Pro on day 15 of a 30-day month. Pro-ration logic:

- Creator cost for days 1-14: €6 × 14/30 = €2.80
- Pro cost for days 15-30: €15 × 16/30 = €8.00
- Invoice for the month: €10.80 (= €2.80 + €8.00)
- Views quota: prorated similarly — creator gets "100k × 14/30 + 1M × 16/30 = 580k views" for the month, and the counter just keeps running (doesn't reset at upgrade)

This is standard SaaS pro-ration. Stripe handles it natively via Subscription Schedules.

**Pro-ration on downgrade mid-month:**

Creator downgrades from Pro to Creator on day 15. Handling:

- No immediate refund for Pro days 1-14 (already consumed)
- Creator tier takes effect day 15, prorated for rest of month
- **Warning modal** at downgrade attempt: "You've used 850k views this month. Creator tier limit is 100k. Downgrading now will throttle your site immediately. Consider waiting until <date> (1st of next month) to downgrade."

Creator can override the warning and downgrade immediately (their choice) or schedule the downgrade for the 1st of next month (recommended).

**Credit for unused quota on downgrade: NO.** Same rationale as no carryover.

**Tier anniversary vs. calendar month billing:**

Billing date is the creator's subscription start date (Stripe standard). Quota reset date is calendar month UTC. These are decoupled. A creator who subscribes on the 15th pays on the 15th each month, but their quota resets on the 1st. This is slightly inelegant but matches Vercel/Framer/Webflow convention and keeps reporting clean.

---

## 4. UX design — educating the user

Usage-based pricing lives or dies on UX. The math is correct, the tiers are calibrated, the overage policy is reasonable — but if creators feel confused or out of control, they leave. This section is a detailed design brief.

### 4.1 In-editor weight calculator

**The core screen:** the page editor where creators drag blocks, upload images, tweak animations.

**What to add:**

A persistent toolbar badge, top-right of the editor, always visible:

```
┌───────────────────────────────────┐
│  Page weight: 342 KB       ●      │
│  ≈ 14k views in your 100k budget  │
└───────────────────────────────────┘
```

The dot color: green (<500 KB), amber (500-1000 KB), red (>1000 KB).

**Behaviors:**

- **Live update** on every block add/edit/image upload. The badge recalculates in <500ms (debounced).
- **Click for details:** opens a side drawer showing per-block weight breakdown:
  ```
  Hero banner (image 1920×1080):  230 KB
  Product block × 3:               60 KB
  Entrance animation (Lottie):      40 KB
  Custom font:                      12 KB
  ─────────────────────
  Total:                          342 KB
  ```
- **Optimize button** in drawer: "Reduce page weight" — auto-compresses images via client-side compression (CPU-heavy but free), suggests dropping custom fonts, offers "remove entrance animation" toggle.
- **Tooltip on hover:** "Pages that serve lighter get more views from your quota. 500 KB is the design target."

**What the creator learns:**

Every decision in the editor has a cost in quota. Uploading a 4 MB image shows "+3.2 MB, now 3.5 MB total, 8× faster quota drain." This is the predictive feedback that Vercel's dashboard shows *after* deployment; tadaify shows it *during* design.

**Implementation notes:**

- Weight calc = sum of all non-cached asset sizes + rendered HTML size + inline CSS. Approximated with 85% accuracy client-side (the 15% uncertainty comes from browser-varying CSS + JS). Show the approximate as "≈ 342 KB" with a tiny "i" tooltip explaining the approximation.
- Cached asset optimization: we serve the same Lottie file for the same animation regardless of which creator uses it. So "entrance animation adds 40 KB" is shared across all creators using that animation — it's cached once per CDN. This is internal optimization, but the UI still shows "40 KB" for the creator's reference; the real bandwidth impact is shared.

**Why this is tadaify's killer UX:**

Framer, Webflow, Squarespace, Wix — none of them show in-editor weight. They all rely on post-deployment analytics. Tadaify shipping this feature is our biggest UX differentiation from the entire category, not just the bandwidth-pricing peers.

### 4.2 Views prediction at signup

**The flow:**

Step 1 of signup (after handle claim): "What's your primary platform?"

Creator selects: IG / TikTok / Twitter / YouTube / Other.

Step 2: "About how many followers do you have there?"

Creator selects: <1k / 1k-10k / 10k-50k / 50k-200k / 200k-1M / 1M+.

Step 3: tadaify displays:

```
Based on creators like you on Instagram with 10k-50k followers,
you'll likely see about 1,500-5,000 monthly page views.

✓ Our Free tier includes 10,000 views/month.
✓ You have plenty of room to grow.

[Continue with Free — €0 forever]

Want more? [See Creator tier →]
```

**Industry-average view-per-follower ratios** (research-backed):

| Platform | Median CTR to bio link / month | Source |
|---|---|---|
| Instagram | 5-10% of followers | Linktree click-through reports 2024; 3rd party tools like Ghost Mode Marketing |
| TikTok | 15-40% of followers (skews higher due to viral spread) | TikTok Creator tools 2024 |
| Twitter/X | 2-5% | 2024 Buffer + Hootsuite analyses |
| YouTube | 1-3% of subscribers see bio link/month (link-in-description) | VidIQ + Tubebuddy industry averages 2024-25 |
| LinkedIn | 3-8% of followers | LinkedIn CreatorMode pilots 2024 |

We use the MIDDLE of the range for prediction (conservative). An IG creator with 30k followers: 7.5% × 30k = 2,250 views/mo predicted.

**When to recommend a paid tier at signup:**

- Predicted views < 8k: "Free is perfect for you."
- Predicted views 8k-80k: "Free covers your first 10k views/mo, but you'll likely upgrade to Creator (€6/mo, 100k views) within a few months."
- Predicted views 80k-800k: "Creator tier (€6/mo, 100k views) is a good starting point. Pro if you expect to scale."
- Predicted views >800k: "Pro tier (€15/mo, 1M views) fits creators at your scale."

**Note: we never force a tier.** Creator can always start Free and upgrade later. The prediction is informative, not prescriptive.

**Accuracy calibration:**

Signup prediction is a rough estimate. We track creators' actual monthly views vs. predicted over their first 90 days. If prediction error is >50% for 20%+ of creators, we retune the ratios. Data will be in our warehouse.

### 4.3 Real-time usage dashboard

**The dashboard homepage** (after login, default view) shows five widgets:

**Widget 1: Monthly usage bar**

```
┌─────────────────────────────────────────────────┐
│  This month                                      │
│  ████████████░░░░░░░░░░  34,231 / 100,000 views │
│  34%                  66,769 remaining          │
│                                                  │
│  Resets on May 1 (7 days)                       │
└─────────────────────────────────────────────────┘
```

Color: green <80%, amber 80-100%, red 100%+.

**Widget 2: Trend graph**

Daily views for the current month as a bar chart, with a thin forecast line projecting to end-of-month.

**Widget 3: Forecast**

```
At current pace (1,142 views/day average):
Month-end forecast: 34,266 views
You will NOT exceed your quota this month.
```

OR, if on track to exceed:

```
At current pace (6,800 views/day average):
Month-end forecast: 210,000 views
⚠ You will exceed your 100k quota around day 15 (May 22).
Overage estimate: 110k extra views × €0.50/10k = €5.50

[Upgrade to Pro — €15/mo, 1M views included →]
```

**Widget 4: Top pages**

```
Top pages driving views this month:
1. /                              18,540 views  (54%)
2. /p/my-course                    9,821 views  (29%)
3. /p/ebook                        3,410 views  (10%)
4. /about                          1,240 views   (4%)
```

**Widget 5: Human vs bot breakdown (trust signal)**

```
Human views: 32,110 (94%)
Bot views (excluded): 2,121 (6%)

[ See which bots ›]
```

Hover reveals: "Googlebot 1,023 · Bingbot 402 · Uptime monitors 398 · Other 298"

**Alert settings (collapsible):**

```
Notify me at:
☑ 50% of quota
☑ 80% of quota
☑ 100% of quota
☐ 120%, 150% (overage)

Email address: vvaser@gmail.com [edit]
```

**Upgrade CTA placement:**

The dashboard persistently shows a gentle CTA in the sidebar: "Your tier: Creator. [Upgrade to Pro →]" — non-obtrusive at <50% quota, more prominent at 80%+, turns into urgency at 100%+.

**Daily updates, real-time counter:**

- Views counter updates in real-time (5-second lag max), powered by Cloudflare Workers KV for current-day counter.
- Historical data (trend graph, top pages) updates daily from our S3+Athena analytics pipeline with 24-hour lag.
- This dual-system keeps the dashboard responsive (creator sees immediate impact of a tweet going viral) while keeping aggregated data accurate.

### 4.4 Overage-in-progress alerts

**Email sequence:**

**50% email** (soft):

> Hi [handle], you've used half your monthly views — 50,234 of 100,000.
>
> Looking good! At your current pace you'll end the month around 95k views.
>
> [See dashboard →]

**80% email** (medium):

> Hi [handle], you're at 80% of your 100k monthly views. That's 80,234 so far.
>
> If your traffic keeps growing, you might hit your quota around May 20.
>
> Want more room?
>
> [Upgrade to Pro — €15/mo, 1M views →]

**100% email** (urgent):

> Hi [handle], you just hit your 100k view quota for the month!
>
> That's amazing. Here's what happens now:
>
> • Your site stays live — no interruption.
> • Extra views are billed at €0.50 per 10,000 views (overage).
> • Based on your pace, your total overage this month would be about €8-12.
>
> Want a better rate?
>
> [Upgrade to Pro — €15/mo, 1M views + no overage → save €5/mo]
>
> Or, cap your monthly spend:
>
> [Set a spend cap →]
>
> Questions? Reply to this email.

**150% email** (alarm):

> Hi [handle], you're now at 150k views — 50% over your Creator quota.
>
> Estimated overage so far this month: €2.50
> Estimated month-end overage: €10-15
>
> Two options:
>
> [Upgrade to Pro now →] — €15/mo, 1M views included, no more overage this month.
>   → (Pro-rated: you'd pay only €12 for the rest of this month.)
>
> [Cap my spending →] — site soft-throttles when you hit your limit.

**In-app alerts:**

Same progression as emails, shown as dismissable banners in the dashboard. Each alert has a single CTA button for upgrade + secondary "cap spending" option.

### 4.5 Viral-moment UX

The most important UX moment in the entire product: when a creator's traffic unexpectedly spikes (IG story mention, viral TikTok, press coverage).

**Detection:**

Our analytics pipeline monitors each creator's 1-hour moving average. If hourly views exceed 10× the 7-day average, it's a "viral moment."

**Response:**

1. **Push notification** (if tadaify mobile app or PWA installed): "🎉 Your page is trending! 1,842 views in the last hour — 18× your usual pace."

2. **In-app banner** on dashboard: "Your traffic spiked! 1,842 views in the past hour. At this rate you'll hit your monthly quota in 5 days."

3. **One-click upgrade offer:**

   ```
   ┌─────────────────────────────────────────────────┐
   │  🎉 Your page is going viral!                   │
   │                                                  │
   │  You're getting 18× your usual traffic.         │
   │                                                  │
   │  Upgrade to Pro to stay ahead:                  │
   │  • 1M monthly views (10× Creator)               │
   │  • 3 custom domains                              │
   │  • Pro rate: €0.30/10k views overage vs. €0.50  │
   │                                                  │
   │  Rest of this month: only €9.23 (pro-rated)    │
   │                                                  │
   │  [Upgrade now → takes 30 seconds]               │
   │                                                  │
   │  Or continue with auto-overage on Creator tier. │
   └─────────────────────────────────────────────────┘
   ```

4. **Email with the same offer.**

**The critical design principle:** upgrade MUST take effect instantly. Creator clicks upgrade → Stripe processes → new tier active in <5 seconds. Zero downtime. The creator's page continues serving. The quota immediately expands to the new tier.

**Why this is the moment of highest willingness to pay:**

A creator whose TikTok just went viral is experiencing their biggest win of the year. They want the site to stay up at any cost. €9.23 feels like nothing. If we capture this moment with a smooth upgrade flow, we get the sale. If we bury it behind 5 screens or force them to call support, we lose it AND they remember tadaify as "the thing that almost made my viral moment suck." We cannot miss this moment.

**Fair-use cap on viral protection:**

Even Business tier creators hitting 10× their 7-day average get the upgrade offer. The system assumes that a Business creator hitting viral territory has even higher willingness to pay for "stay up at all costs" behaviour.

### 4.6 Downgrade + refund UX

**The flow:**

Creator clicks Settings → Billing → Change Plan → Creator (down from Pro).

Warning modal:

```
You want to downgrade from Pro to Creator.

Current usage this month: 234,500 views
Creator tier limit: 100,000 views

If you downgrade now:
• Your overage starts immediately.
• Current overage so far: €6.73
• Month-end estimated overage: €8.50

Options:
[Schedule downgrade for May 1 →] (recommended)
[Downgrade now anyway →]
[Keep Pro for now →]
```

If creator chooses "Schedule for May 1": downgrade happens automatically on that date. Pro features remain active until then. Invoice reflects Pro pricing for all of current month, Creator pricing from May 1.

If creator chooses "Downgrade now": confirmation modal requires typing "DOWNGRADE NOW" + checkbox "I understand I will pay overage for the rest of this month." On confirm, tier changes immediately, pro-rated refund for remaining Pro days is applied as account credit.

**Refund logic:**

- Never automatic cash refund. Credits only (apply to next invoice).
- Exception: creator cancels entirely (no future subscription) → cash refund via Stripe for the pro-rated remaining days.

**No-dark-patterns commitment:**

- Cancel/downgrade button is NOT hidden. Same visual weight as upgrade.
- No retention offers / discounts / "are you sure" screens beyond the single warning modal.
- Feedback survey is OPTIONAL post-cancel.

This is a policy statement: tadaify never holds creators hostage. Retention is earned via product quality, not friction.

---

## 5. Cost of goods analysis — stress tests

### 5.1 Normal scenarios

Revisiting the per-tier cost analysis from §3.3, now projected across MAU scales with realistic tier mix assumptions from infra-cost-analysis.md §1.2.

**User mix assumptions per scale:**

| MAU | Free casual | Free active | Creator | Pro | Business |
|---|---|---|---|---|---|
| 100 | 65 | 20 | 10 | 5 | 0 |
| 1,000 | 650 | 200 | 90 | 50 | 10 |
| 10,000 | 6,500 | 2,000 | 900 | 500 | 100 |
| 100,000 | 65,000 | 20,000 | 9,000 | 5,000 | 1,000 |
| 1,000,000 | 650,000 | 200,000 | 90,000 | 50,000 | 10,000 |

Note the mix is different from infra-cost-analysis.md because we're splitting the old "Pro 10%" into 9% Creator + 5% Pro + 1% Business. This is the expected new mix under bandwidth pricing (more micro-payers at Creator tier, fewer at the Pro anchor).

**Revenue at each scale:**

| MAU | Creator €6 | Pro €15 | Business €49 | Total MRR |
|---|---|---|---|---|
| 100 | €60 | €75 | €0 | €135 |
| 1,000 | €540 | €750 | €490 | €1,780 |
| 10,000 | €5,400 | €7,500 | €4,900 | €17,800 |
| 100,000 | €54,000 | €75,000 | €49,000 | €178,000 |
| 1,000,000 | €540,000 | €750,000 | €490,000 | €1,780,000 |

Plus custom domain add-ons (€2/mo, attach rate ~30% on Creator, 60% Pro, 100% Business):

| MAU | Custom domain revenue | Total MRR with domains |
|---|---|---|
| 100 | €0 + €6 + €0 = €6 | €141 |
| 1,000 | €54 + €60 + €20 = €134 | €1,914 |
| 10,000 | €540 + €600 + €200 = €1,340 | €19,140 |
| 100,000 | €5,400 + €6,000 + €2,000 = €13,400 | €191,400 |
| 1,000,000 | €54,000 + €60,000 + €20,000 = €134,000 | €1,914,000 |

(Note: custom domain add-on counts only incrementally above the "free" custom domains included in each tier. Creator gets 1 free domain; Pro gets 3 free; Business gets unlimited. Revenue here is for domains beyond the included count.)

Now add overage. Assume ~10% of paid users hit their quota and pay overage in a given month; median overage is ~€5 Creator, ~€10 Pro, ~€20 Business:

| MAU | Creator overage | Pro overage | Business overage | Total overage |
|---|---|---|---|---|
| 100 | €5 | €5 | €0 | €10 |
| 1,000 | €45 | €50 | €20 | €115 |
| 10,000 | €450 | €500 | €200 | €1,150 |
| 100,000 | €4,500 | €5,000 | €2,000 | €11,500 |
| 1,000,000 | €45,000 | €50,000 | €20,000 | €115,000 |

**Total revenue per scale:**

| MAU | Base MRR | Domain revenue | Overage | Total monthly revenue |
|---|---|---|---|---|
| 100 | €135 | €6 | €10 | **€151** |
| 1,000 | €1,780 | €134 | €115 | **€2,029** |
| 10,000 | €17,800 | €1,340 | €1,150 | **€20,290** |
| 100,000 | €178,000 | €13,400 | €11,500 | **€202,900** |
| 1,000,000 | €1,780,000 | €134,000 | €115,000 | **€2,029,000** |

**Infra cost per scale** (from §3.3 unit economics × user count):

| MAU | Free cost | Creator cost | Pro cost | Business cost | Supabase | Resend/email | Stripe ops | Total cost |
|---|---|---|---|---|---|---|---|---|
| 100 | $3 | $6 | $4 | $0 | $25 (Pro plan) | $1 | $3 | ~**$42** = €39 |
| 1,000 | $34 | $50 | $38 | $28 | $25 | $10 | $10 | ~**$195** = €180 |
| 10,000 | $340 | $495 | $380 | $280 | $100 (Small) | $100 | $50 | ~**$1,745** = €1,620 |
| 100,000 | $3,400 | $4,950 | $3,800 | $2,800 | $800 (Team+compute) | $1,000 | $200 | ~**$16,950** = €15,700 |
| 1,000,000 | $34,000 | $49,500 | $38,000 | $28,000 | $8,000 (Enterprise) | $10,000 | $2,000 | ~**$169,500** = €157,000 |

**Gross margin at each scale:**

| MAU | Revenue | Cost | Gross margin | Gross profit |
|---|---|---|---|---|
| 100 | €151 | €39 | **74%** | €112 |
| 1,000 | €2,029 | €180 | **91%** | €1,849 |
| 10,000 | €20,290 | €1,620 | **92%** | €18,670 |
| 100,000 | €202,900 | €15,700 | **92%** | €187,200 |
| 1,000,000 | €2,029,000 | €157,000 | **92%** | €1,872,000 |

**Gross margin stays 91-92% at every scale from 1k MAU upward.** This is the hallmark of a well-priced SaaS with positive unit economics.

Why only 74% at 100 MAU: the fixed-cost Supabase Pro subscription ($25/mo) dominates when variable revenue is only €135/mo. This is a pre-PMF artifact; once we cross ~300 MAU the fixed cost amortizes and we're at 90%+.

**Comparison to infra-cost-analysis.md's gross margin estimate of 95-99%:**

The infra doc assumed 10% Pro conversion at €12 price = €108k/mo revenue at 100k MAU. This doc assumes 15% paid conversion (Creator + Pro + Business) at blended higher price = €202k/mo at same MAU. Cost doubled (more users actually serving traffic), revenue nearly doubled, margin stays ~92%.

The bandwidth model **moves more creators into paid** at lower price points (€6 Creator vs. €12 Pro). Net effect: slightly higher revenue, slightly lower ARPU, same healthy margin.

### 5.2 Viral scenarios

**Scenario V1: Single viral creator with 10M views in a day**

A Pro creator's TikTok goes viral. Their tadaify page gets 10M views in 24 hours (equivalent to 300M views/mo sustained, but it's concentrated in one day).

- Normal Pro monthly views: 200-400k (below their 1M quota)
- Viral day adds: 10M views (10× their monthly quota in one day)
- Month total: ~10.3M views (assuming viral doesn't continue)

Pro user at €15 + overage for 9.3M excess views × €0.30/10k = **€279 overage bill**.

- Cost to tadaify: 10M × 500 KB = 4.88 TB × $0 (Cloudflare) = $0 bandwidth
- R2 reads: 10M × 5 × $0.00036/1k = $18
- Supabase Edge Fn: 10M × $2/M = $20
- Analytics events: 10M × 10 × $0.10 / 200 = $5
- Extra pressure on DB during spike: ~$10 (brief vertical compute bump)
- **Total cost: ~$53**

Tadaify makes €15 base + €279 overage = €294. Cost: $53. **Net: ~€245 profit on one viral creator in one day.**

This is the viral-creator-is-a-revenue-windfall outcome. Because Cloudflare egress is free to us, viral traffic is pure upside.

**Scenario V2: 10 simultaneous viral creators**

10 Pro creators go viral in the same week (unusual but possible during a cultural moment, e.g. Black Friday creator sales).

- Combined traffic: 10 × 10M = 100M views in 1 week
- Egress: 48.8 TB × $0 Cloudflare = $0
- Database hot zone: could push Supabase compute to higher tier temporarily. Assume $100 extra Supabase cost that month.
- Overall cost delta: ~$700 (scaled versions of V1 cost calc)
- Overage revenue: 10 × €279 = €2,790

**Net: €2,000+ profit from the event.** Still fine.

**Scenario V3: Bot-traffic drainage**

A malicious actor scrapes a creator's page 1M times over 24 hours to burn through their quota.

- Bot filter (Cloudflare Bot Management, free on our plan) catches ~95% of known bot signatures → 950k excluded
- 50k bot requests slip through as "human-looking" → creator's counter goes up by 50k

Impact on creator: 50k extra quota used. For a Creator-tier user at 50k/100k baseline, this doubles their usage. They might hit their quota, might not.

**Mitigation:**

1. **Bot excluded views are shown transparently on dashboard** — creator sees "50k bot visits excluded this week" and is reassured their real traffic didn't just explode.
2. **If bot traffic confirmed spiking**, we temporarily tighten bot filter thresholds for that creator's domain.
3. **If creator gets hit by sustained botting (rare)**: manual support intervention, case-by-case quota credit.
4. **IP-based dedup**: 1 unique IP refreshing 1,000 times in 5 minutes = 1 view, not 1,000. This prevents the "friend spam-refreshes to waste quota" attack.

**Scenario V4: Creator explicitly tries to hit the cost cliff**

A creator with resources (competitor? investigative journalist?) deploys 1M real devices to browse their own tadaify page 1M times each = 1 trillion views in a month.

- Bandwidth: 1T × 500 KB = 500 PB
- Cloudflare: even at our volume this exceeds their unlimited plan's reasonable-use clause. They will contact us.
- Realistic cap: Cloudflare for SaaS enterprise contracts typically have a fair-use floor around 10-100 TB/day.

**Our contractual protection:** tadaify's Terms of Service has a fair-use clause: sustained extraordinary usage (>100× normal Pro usage) triggers account review. If malicious, we suspend. If legitimate (impossibly lucky viral creator), we negotiate an Enterprise tier.

### 5.3 Edge cases

**Edge 1: Lightweight-page creator**

A minimalist creator has a single hero image + 3 text links = total page weight 80 KB. They get 1M views/mo.

- Their egress: 80 KB × 1M = 76 GB (not 488 GB)
- Their Pro tier cost: 76 GB at $0 Cloudflare + reduced R2 reads
- **Are they "over-paying"** at €15/mo for 1M views when they're using 1/6 the bandwidth of our assumed load?

No. They're paying for views (the value signal), not bytes. A minimalist creator with 1M views gets enormous value from tadaify (audience reach) and should pay for it. The €15 is fair.

Our cost for them is very low (~$1/mo), making them a 93%+ margin customer. Fine.

**Edge 2: Heavy-page creator**

A video-heavy creator has a 10 MB page (embedded hero video, 3 product videos). They get 100 views/mo (rare visitors but each one is a big download).

- Egress: 10 MB × 100 = 1 GB
- Under our "500 KB = 1 view" billing rule, they count as 100 views × (10 MB / 500 KB) = 2,000 quota views
- They're on Free tier, fit within 10k quota (2,000 used)

Our cost: ~$0.003 (basically nothing)
Their value: 100 real page views, paying €0

Still fine. Our model scales sub-linearly for heavy-page low-traffic users — they use quota faster but proportionally. The quota reflects real cost.

**Edge 3: Video creator wanting to stream**

A creator wants to embed a 10-minute 4K video playing in their hero block. That's 500 MB per view. On our Creator tier at 100k views × 500 MB = 50 TB.

- Cloudflare: likely flagged as unusual usage
- We'd route this user to Business tier + talk to them about a custom arrangement (or suggest they use YouTube/Vimeo embed instead of self-hosting)

Our platform-level guidance: **video > 2 minutes should be embedded from YouTube/Vimeo, not self-hosted**. Our in-editor weight calculator will enforce this by flagging 2MB+ video assets with "consider external hosting" hints.

### 5.4 Global egress variance

Cloudflare's pricing doesn't have regional variance the way CloudFront does, so this is largely non-issue for us. Exception: some specific countries have higher Cloudflare fair-use enforcement (notably Argentina, Venezuela, Nigeria where Cloudflare absorbs less egress at their POPs).

If tadaify sees disproportionate usage from these regions, Cloudflare may request a custom enterprise contract with regional usage commitments. Not a near-term concern.

CloudFront (if we were on it instead) would charge 1.5-2× for APAC and AF regions. Cloudflare's egress-neutral model sidesteps this entirely. **Another reason to be on Cloudflare, not CloudFront.**

---

## 6. Billing + operations

### 6.1 Stripe subscription structure

**Model:** Stripe Subscription with one base `Price` per tier + metered `Price` for overage usage.

Subscription items per tier:

- **Creator:** `price_creator_base` (€6/mo flat) + `price_creator_overage_views` (metered, €0.50 per 10,000 unit)
- **Pro:** `price_pro_base` (€15/mo) + `price_pro_overage_views` (metered, €0.30 per 10k)
- **Business:** `price_business_base` (€49/mo) + `price_business_overage_views` (metered, €0.20 per 10k)
- **Custom domain:** `price_custom_domain` (€2/mo per additional domain, quantity-based, not usage-based)

**Overage metering API:**

```typescript
await stripe.subscriptionItems.createUsageRecord(
  subscription_item_id,
  {
    quantity: overage_views_count, // in units of 10k
    timestamp: Math.floor(Date.now() / 1000),
    action: 'increment'
  }
);
```

Aggregation: Stripe sums usage records per billing period. At end-of-period (monthly), the invoice includes base + overage × quantity.

**Metering frequency:**

- Hourly: view count aggregated in our system, pushed to Stripe once per hour as delta.
- This avoids per-request Stripe API calls (expensive, rate-limited) while keeping invoices accurate to the hour.

**Quota reset decoupling:**

- Views quota resets on calendar month UTC (our internal counter).
- Stripe subscription billing renews on subscription anniversary.
- When creator's billing period ends mid-month, Stripe computes overage up to that date and invoices. Remaining half-month accrues to next invoice.

This is the Stripe-standard mixed billing pattern used by Vercel, Netlify, Cloudflare Workers. Well-documented.

### 6.2 Invoice presentation

**Sample invoice (Creator tier with overage):**

```
Tadaify — Invoice #INV-2026-05-12345
───────────────────────────────
Period: May 1 – May 31, 2026

Creator plan (base)                      €6.00
  100,000 monthly views included

Overage views                          €5.50
  110,000 views over quota
  (€0.50 per 10,000 views)

Custom domain: mycoach.com                 €2.00
  (Additional to 1 included)

Subtotal                                 €13.50
VAT (23% PL VAT OSS)                      €3.11
───────────────────────────────
Total                                    €16.61

Payment: Visa ending 4242
Charged: May 31, 2026

[View usage dashboard →]
[Download PDF →]
```

**Key design choices:**

- Every line item is explanatory, not just a code.
- Overage shows both the overage amount AND the pricing rule ("€0.50 per 10k views") inline.
- VAT is separate, clearly stated (EU transparency requirement).
- Link back to dashboard for audit.

**Monthly email:**

Email delivered the day after billing, with:

- Subject: "Your Tadaify invoice for May 2026 — €16.61"
- Body includes invoice summary + "largest cost was overage from your viral week" + link to dashboard
- This is a proactive explanation, not a passive "here's a bill"

### 6.3 Failed payment handling

**Retry logic:** Stripe Smart Retries (default 3 attempts over 2 weeks).

**Grace period:**

- Day 0: payment fails. Email sent. Service continues.
- Day 3: 1st retry. If fails, email sent.
- Day 7: 2nd retry. If fails, email sent.
- Day 14: 3rd retry. If fails, account moves to "payment-past-due" status.

**Past-due behavior:**

- **Days 15-30:** Site remains live but displays a small non-intrusive banner in admin: "Payment past due — update payment method." Pro features remain active.
- **Days 31-60:** Tier downgrade to Free. Site remains live but quota reverts to 10k views. Overage charges ongoing are voided (we write them off).
- **Day 60+:** Account marked dormant. Creator can still log in, view data, fix payment. Public site continues serving but with "Powered by tadaify" footer.
- **Day 180:** If no payment method update and no login activity, account archived (data retained for 1 year for GDPR compliance, then deleted).

**Never:** Don't delete creator data for payment failure. Don't make public page disappear. Creators have audiences that depend on the page URL being live.

### 6.4 Tax implications

**Stripe Tax** handles calculation. Configuration:

- Polish entity (per orchestrator projects.json — graspsoftwarepw / Polish legal structure)
- EU VAT OSS (One Stop Shop) registration: required for B2C sales to EU consumers.
- Tax rates: VAT auto-calculated per customer country (e.g., 23% PL, 19% DE, 20% FR, 22% IT, 21% NL, etc.)
- Non-EU: no VAT for non-business US customers (digital service export rules).

**Currency:**

- Primary billing: EUR.
- Secondary: USD, GBP, PLN (auto-detect by billing address country).
- Stripe exchange rate.
- Prices displayed in local currency via browser auto-detect, with currency switcher.

**Tax line on invoice:** Always itemized separately. EU requires this under VAT invoicing rules (Council Directive 2006/112/EC).

### 6.5 Dispute handling

**Creator claim: "I didn't actually serve 350k views — your overage is wrong."**

Our response:

1. **Public audit log:** Every view event has a timestamp + IP hash + page URL in our S3 analytics dump. Creator can query their own audit log via dashboard ("Show me views on May 12 between 10 AM and 11 AM").
2. **Bot separation:** Audit log shows human-classified vs bot-classified views; bot views are excluded from billing.
3. **First-dispute goodwill credit:** For a creator's first overage dispute, we offer a 50% credit on the disputed amount as goodwill, no questions asked. Reduces support load and preserves relationship.
4. **Persistent disputes:** If creator claims fraud 2+ times in 6 months, we provide a full CSV export of their view events and work through them line by line. If we find an error on our side, we credit 100%.

**Burden of proof:** on us. Creator's word is accepted for reasonable claims; we provide audit data for unreasonable ones. This is a service-level commitment.

**Chargeback response:** If creator issues a chargeback via their bank (bypassing our process), we dispute via Stripe with the audit log. If we lose, we absorb the loss (Stripe policy: creator-initiated chargebacks can rarely be recovered once issued). Pattern indicates "friendly fraud" or real issue; either way we investigate.

---

## 7. Technical infrastructure for metering

### 7.1 Where we count views

**Primary counter: Cloudflare Workers at viewer-request stage.**

Every request to a tadaify-served page passes through a Cloudflare Worker that:

1. Checks bot signature (User-Agent + TLS fingerprint + IP reputation)
2. If classified as bot: increments `bot_views_counter` for that creator (excluded from quota)
3. If classified as human: increments `human_views_counter` for that creator AND pushes an event to our analytics pipeline
4. Returns the page (cached or origin-fetched)

**Bot classification uses:**

- Cloudflare Bot Management (included in our plan): covers ~95% of known scrapers, bots, uptime monitors.
- Custom list: Googlebot, Bingbot, Applebot, GPTBot, ClaudeBot, PerplexityBot (these are whitelisted as "good bots" but still excluded from quota — they bring SEO value, not creator value).
- Heuristics: > 100 requests from same IP in 5 minutes = throttle that IP (separate from quota counting).

**Deduplication:**

- **Same user, same page, within 5 minutes: count as 1 view** (refresh doesn't multiply).
- **Same IP, different page, within 5 minutes: count as 1 view per page** (multi-page browsing counts each page).
- **Same session, different visit: count as separate views** (returning user = real engagement).

**IP hashing:**

We don't store raw IPs (GDPR). We store a daily-rotating hash: `sha256(ip + daily_salt)`. This allows dedup within a day but prevents long-term tracking. Rotates at UTC midnight.

### 7.2 Where we count bytes

**Primary: Cloudflare Real-Time Logs → Kinesis → S3.**

Cloudflare pushes every edge request log with `bytes_sent` to our Kinesis firehose. Hourly batch job aggregates per-creator bytes. Stored in S3 for Athena queries.

**Why we track bytes AT ALL** even though Cloudflare charges us $0 egress:

1. Backup billing signal: if our view counter goes wrong, we can reconstruct from bytes.
2. Heaviness multiplier: converts page weight into quota impact per §3.1.
3. Fair-use enforcement: if a creator's bytes-per-view is >5× the 500 KB target (e.g., they're using 3 MB pages), we surface this and suggest optimization.
4. Abuse detection: 10 TB served from one creator in a day = either viral (yay) or attack (investigate).

### 7.3 Aggregation pipeline

**Ingest:**

- Cloudflare Workers → Kinesis Firehose (15-minute buffer)
- Kinesis → S3 partitioned by `year=YYYY/month=MM/day=DD/hour=HH/creator_id=X`
- Athena queries S3 for historical; live counters stored in Cloudflare KV for current-day real-time.

**Roll-up jobs:**

- Hourly: Athena aggregates hourly views + bytes → writes to Supabase `usage_summary` table (per creator, per day, per hour)
- Daily: cleanup job compacts yesterday's per-hour rows into per-day rows, reducing DB size
- Monthly: end-of-month summary generated for billing (pushed to Stripe as usage records)

**Real-time dashboard:**

- Current-day counter from Cloudflare KV (updated every request)
- Historical data from Supabase `usage_summary` (24-hour lag acceptable)
- Combined in the dashboard UI

### 7.4 Lag + accuracy

- **Dashboard real-time:** 5-second average lag (Cloudflare KV eventual consistency)
- **Billing accuracy:** 24-hour lag (Athena roll-up) — billing uses data up to 24 hours ago
- **Audit log retention:** 18 months in S3, Glacier-tier after 3 months for cost
- **Legal hold:** If creator disputes, relevant logs are tagged for longer retention until dispute resolved

---

## 8. Go-to-market implications

### 8.1 Positioning change

**From** (pre-pivot, per feature-mix §6.2 refined): "Linktree with free tier for link-lists; pay to sell."

**To** (post-pivot): "Every creator feature is free forever. Pay only for your traffic."

This is a sharper position. Three sub-positions roll up:

- For creators: "Nothing is gated. Unlimited animations, unlimited themes, full analytics, email capture, scheduling, QR, everything — all on Free. You pay only when you grow beyond your hosting quota."
- For indie hackers: "Usage-based pricing for creators. Like Vercel, but for link-in-bio."
- For EU creators: "Built in EU, hosted on EU CDN edge, VAT handled automatically, no per-feature paywalls."

**One-sentence pitch:**

> Tadaify gives creators every feature free forever. You only pay when your audience outgrows your hosting quota.

### 8.2 Messaging in landing page

**Hero:**

```
Build the page your audience deserves.

Every feature free forever.
Pay only for your traffic.

[Claim tadaify.com/yourname →] [See pricing →]
```

**Pricing page hero:**

```
One model. Zero feature paywalls.

Free: 10,000 views/month.
Creator: €6/mo for 100,000 views.
Pro: €15/mo for 1 million.
Business: €49/mo for 5 million.

Every tier gets every feature.
```

**Compare-to-Linktree section:**

```
Linktree Starter charges $8/mo for custom themes.
Tadaify gives you unlimited custom themes on Free.

Linktree Pro charges $15/mo for scheduling + analytics + SEO.
Tadaify gives you all of that on Free.

Linktree Premium charges $35/mo for priority support.
Tadaify charges €15/mo and gives you everything.

Wait, what do you pay Linktree for again?
```

**Calculator widget** (interactive on pricing page):

```
How many followers do you have?

[10k IG] [50k IG] [200k IG] [500k IG] [1M+ IG]

You picked: 50k IG followers
  ≈ 3,500 monthly page views (10% engagement)

Best fit: Free tier (10,000 views included)

Your monthly cost on Tadaify: €0
Your cost if you were on Linktree Starter: $8
Your cost if you were on Linktree Pro: $15
```

### 8.3 Anti-churn advantage

Bandwidth-based pricing has a structural anti-churn property: if a creator's audience grows, they use more views, they need to stay on (or upgrade) their tier. The creator can't "graduate" from the platform because the platform scales with them.

Compare:

- Linktree creator at 50k IG followers: upgrades to Pro $15. At 500k followers: still pays Pro $15. Same revenue to Linktree.
- Tadaify creator at 50k: on Free or €6 Creator. At 500k: needs Pro €15 or even Business €49. Revenue scales 3-8x.

This means tadaify benefits from creator growth in a way Linktree doesn't. It also means tadaify has to EARN creator growth — our incentives align with theirs.

**Churn prediction is easier:** creators who reduce usage are leaving; creators who increase usage are growing. This is a cleaner signal than Linktree's "are you still active?" heuristic.

### 8.4 Competitive moats this creates

1. **Linktree can't copy easily.** Their 70M free users + entrenched per-feature paywall is their business model. Switching creates Mexican-standoff migration pain.

2. **Stan.Store can't copy.** Their no-free-tier / commerce-first model is their brand.

3. **Carrd has similar quota model** but no commerce, no EU focus, no creator-first framing. We can coexist.

4. **Framer is the real comparable.** Their quotas are worse (1k Free), their UX is worse (no in-editor calc, no forecast), their cost basis is worse (Vercel, not Cloudflare). We win on all three dimensions.

5. **Infrastructure moat:** Our Cloudflare + R2 cost basis is ~10-20× cheaper than a CloudFront-native competitor. A new entrant would need to be on Cloudflare too — and we'll have 2 years of head-start optimizing this specific stack.

---

## 9. Risk analysis

### 9.1 Risk: creators don't understand usage pricing

**Likelihood: High.** Most link-in-bio users have never seen a bandwidth bill.

**Mitigation:**

- Extensive in-product education (§4)
- No GB language in UI — views only
- Prediction at signup (§4.2) so creator starts with realistic expectations
- Gentle onboarding tutorial: "Here's how your page views work → Here's your dashboard → Here's where to see usage"
- "Why do I pay for views?" FAQ with honest answer: "Every view we serve costs us a tiny bit. You're paying for the hosting that makes your page fast, secure, and available worldwide."

**Risk materializes if:** <20% of paid creators read their usage dashboard in their first 30 days. Track as a signup-to-dashboard-view funnel metric.

### 9.2 Risk: bot traffic drains quota

**Likelihood: Medium.** Has happened to Framer, Vercel. Will happen to us.

**Mitigation:**

- Cloudflare Bot Management (95% coverage)
- IP-based dedup
- Dashboard separates human from bot views (trust signal)
- Manual credit for confirmed bot attacks

**Risk materializes if:** creator quota exceedance from bot traffic becomes a monthly support ticket category. Track as "overage dispute: bot traffic" ratio.

### 9.3 Risk: creator's friend mass-refreshes to spite them

**Likelihood: Low.** A petty creator-conflict attack vector.

**Mitigation:**

- IP-based 5-minute dedup (1M refreshes from 1 IP = 1 view)
- Rate-limit same IP to 1 req/sec
- CAPTCHA on suspicious spike (not for normal traffic)

**Risk materializes if:** support gets a "my ex is attacking my tadaify" ticket. Currently 0. Plausibility: unclear.

### 9.4 Risk: competitor price war (Framer drops to €1/mo)

**Likelihood: Low.** Framer is on Vercel; their cost basis forces them to charge at least $5/mo to break even.

**Mitigation:**

- Our Cloudflare cost basis gives us ~3-5× pricing headroom vs. Framer
- We can match Framer cuts with 70%+ margin intact
- If they drop to €1/mo, we match at €1/mo and still be at 60% margin

**Risk materializes if:** Framer launches a sub-€5 tier. Response: match or undercut within 2 weeks.

### 9.5 Risk: Cloudflare ToS or price changes

**Likelihood: Low but existential.** Our entire cost model assumes Cloudflare egress is free.

**Mitigation:**

- Multi-CDN readiness from day 1: architecture supports switching to CloudFront as fallback
- Monitor Cloudflare Terms quarterly for fair-use tightening
- Maintain CloudFront contingency pricing model — if we had to switch, our prices would need to rise ~30% (we'd absorb the first 6 months)
- If Cloudflare changes fundamentally, the worst case is a 3-month scramble + 20-30% margin hit, not existential

**Risk materializes if:** Cloudflare enforces fair-use against us (>10 TB/day sustained). Pre-emption: maintain enterprise relationship with Cloudflare starting at ~10k MAU.

### 9.6 Risk: complicated invoices create support load

**Likelihood: Medium.** Usage-based pricing always has more invoice variants.

**Mitigation:**

- Clear invoice presentation (§6.2)
- In-invoice links to audit dashboard
- First-dispute goodwill credits (§6.5)
- Proactive email explanation when invoice exceeds base tier by 50%+

**Risk materializes if:** support ticket rate > 5% of monthly invoices. Track as ops metric.

### 9.7 Risk: pricing model too novel, scares away mainstream creators

**Likelihood: Medium.** Linktree is the mainstream; we're the novelty.

**Mitigation:**

- Lead with "every feature free forever" (positive framing)
- Pricing page emphasizes Free tier generosity first, Pro + Business second
- Testimonials from early creators about "never paid a bill" (goal: most creators stay on Free and promote it)
- A/B test landing-page copy against feature-gated framing for 6 months; track conversion

**Risk materializes if:** free-to-paid conversion < 5% after 6 months. Re-evaluate model.

### 9.8 Risk: customer concentration (single creator drives disproportionate revenue)

**Likelihood: Medium at scale.** If one creator pays €500/mo overage while 10,000 pay €0-6, we're exposed to their churn.

**Mitigation:**

- Business tier opt-in at €49 fixed + soft upsell toward committed annual contracts
- Track customer concentration; if >10% of MRR from one creator, proactive enterprise relationship management
- Long-term: viral creators migrate to Enterprise tier with 12-month commit

### 9.9 Risk: payment processor (Stripe) dependency

**Likelihood: Low.** Stripe is the industry standard.

**Mitigation:**

- Multi-processor capability (Stripe + Paddle fallback) from Y1
- Ensure critical subscription data (tier, renewal date, payment method metadata) is in our DB, not only Stripe

---

## 10. Recommendations

Five key decisions. My recommendation with justification on each.

### 10.1 Tier count: 4 tiers (Free / Creator / Pro / Business)?

**Recommendation: YES, 4 tiers.**

Why: three tiers (Free / Pro / Business) leaves a gap between Free (10k views, €0) and Pro (1M views, €15). Creators in the 10k-100k views range (nano-influencers, 80% of our target market) have no obvious home. Creator at €6 bridges this.

Four tiers is more price steps than ideal but the Creator tier is the one that captures the primary segment. Without it, we either:
- Make Free bigger (revenue loss)
- Make Pro cheaper (margin loss)

Creator at €6 is better than both.

### 10.2 Quota units: views-visible / GB-backend?

**Recommendation: YES, this hybrid.**

Views in UI. GB in billing backend. Heaviness multiplier shown on dashboard for transparency.

### 10.3 Overage: soft throttle Free + auto-bill paid?

**Recommendation: YES.**

Free: soft-throttle (no billing surprise for free users)
Paid: auto-overage with mandatory spend cap (prevents site-goes-dark AND prevents bill shock)

### 10.4 Price points: €6 Creator / €15 Pro / €49 Business?

**Recommendation: YES, these exact points.**

- €6 Creator hits below Linktree Starter ($8), above Bio.link ($5)
- €15 Pro matches Linktree Pro exactly (parity anchor)
- €49 Business is above Linktree Pro but below Premium ($35), plus unlimited-sites makes it defensible for brands

**Alternative to consider:** €5 Creator (round to match Bio.link). Saves €1. Lower price psychology. Reasoning against: €6 signals "slightly premium to Bio.link" which matches our positioning (we have more features, better design, EU focus). €5 looks like we're a Bio.link clone.

### 10.5 Implementation timing: ship metering infrastructure in MVP or Y1?

**Recommendation: YES, ship in MVP.**

If we launch with feature-gated pricing and pivot later, we retrofit the metering system AFTER 1k+ creators are already on it. Their usage data is zero. Our UX has never been tested under usage pricing. The dashboards don't exist. We're building on top of production we don't want to disrupt.

If we launch with usage-based from day 1, metering is core infrastructure we build once. The dashboard is the dashboard. The invoice system is the invoice system. The editor weight calculator is part of the editor.

The MVP cost is ~4-6 additional weeks of engineering (metering pipeline, dashboard, weight calculator, overage billing). This is a fixed cost that pays off forever.

**Counter-argument:** MVP should be minimal; ship fastest possible. Add metering later. Response: ship metering and skip something else. Skip entrance-animations-extended-library (DEC-SYN-21 at 55 animations). Ship with 10 animations and bandwidth metering. That's a 4-week swap.

My final recommendation: **ship bandwidth-based pricing from MVP day 1** with the full UX (calculator, dashboard, prediction, alerts, viral-moment UX). Reduce scope elsewhere to fit.

---

## 11. Open questions

**Q-PRICE-1: Exact Creator price — €5 vs €6 vs €8?**

My take: €6. Splits the difference between Bio.link parity (€5) and Linktree Starter ($8). EU psychology: €6 looks priced-right; €5 looks cheap; €8 looks expensive for a first paid tier. Needs user decision.

**Q-PRICE-2: Should Pro tier include unlimited custom domains (like Business) or limit to 3?**

Unlimited simplifies the pricing story but Business needs a reason to exist. Currently proposing 3 on Pro, unlimited on Business. Decide.

**Q-PRICE-3: Annual billing discount — 15%, 20%, or 25%?**

DEC-SYN-27 said 20%. Under bandwidth pricing we could go as low as 15% (the annual customer is a commit that reduces churn) or as high as 25% (to drive more annual adoption). My take: 20% per synthesis.

**Q-PRICE-4: Commerce transactions — separate metering or bundled in view pricing?**

Commerce is 0% fees (DEC-SYN-26 unchanged). But do we charge for commerce "view" differently from a link-view? Proposed: NO, all views count equally. Simpler. Downside: a small commerce creator might consume more views in checkout flow than a link-creator. Trade-off: simplicity wins.

**Q-PRICE-5: Team / agency plans — flat price or per-creator quota aggregation?**

Not in MVP. Business tier handles multi-site for now. If we see genuine agency demand post-launch, evaluate Vercel Team model ($20/seat + shared quota pool).

**Q-PRICE-6: Should viral-moment discount be a feature? E.g., "2x quota boost when your page is trending, free for 48 hours."**

Interesting idea. Tech cost: ~€0 (we have the detection). Marketing value: strong. User perception: "tadaify protects me during viral moments." Risk: creators lie about viral moments. Decide for or against.

**Q-PRICE-7: Bandwidth bonuses for annual pay — e.g., "annual = +50% views quota."**

Another lever. Would shift mix toward annual billing. Alternative: just the 20% discount + bandwidth parity.

**Q-PRICE-8: Introductory pricing for first 1000 creators — e.g., "grandfathered 2× quota forever"?**

Common tactic for early-adopter recruitment. Risk: creates a long-tail of permanent-discount customers. Alternative: 3-month intro then standard tier.

**Q-PRICE-9: Creator-tier free custom domain or charge €2/mo?**

Current plan: Creator gets 1 free custom domain. Some competitors charge extra for custom domain at every paid tier. My take: include 1 free on Creator to differentiate against Bio.link (which charges $12/mo Pro for custom domain). Decide.

**Q-PRICE-10: How to handle subscription downgrades during same-month overage accumulation?**

Edge case: creator is on Pro, has accumulated €20 overage this month, tries to downgrade to Creator. Our policy: downgrade takes effect at end of current billing period; overage accrues to end-of-period. Creator pays Pro + €20 overage, then switches to Creator next period. Needs clear UI communication.

---

## 12. Implementation checklist (for functional-spec update)

Which F-XYZ features need to change / add for this pricing model:

### New features to add

- **F-NEW: Metering infrastructure** (Cloudflare Workers view counter + Kinesis + S3 + Athena aggregation pipeline)
- **F-NEW: In-editor weight calculator** (per block size estimation + live toolbar badge + optimize-side-drawer)
- **F-NEW: Usage dashboard** (progress bars + trend graph + forecast + top pages + bot/human breakdown)
- **F-NEW: Overage alert system** (email + in-app at 50/80/100/120/150% thresholds)
- **F-NEW: Views prediction at signup** (platform + follower-count input + estimation)
- **F-NEW: Viral-moment upgrade UX** (detection + notification + one-click pro-rated upgrade)
- **F-NEW: Downgrade flow with warning modal**
- **F-NEW: Spend-cap feature** (user-set monthly maximum; enforces soft-throttle at cap)
- **F-NEW: Bot/human view classification** (Cloudflare Bot Management + custom rules)
- **F-NEW: Heaviness multiplier on dashboard** (page-weight-to-quota conversion)
- **F-NEW: Per-page views breakdown** (for top-pages dashboard widget)

### Features to update (were gated, now free)

- **F-UPDATE: Custom themes** (all themes available on Free)
- **F-UPDATE: Analytics** (full analytics — geo + device + referrer + time-series — on Free)
- **F-UPDATE: Email capture** (form block on Free, unlimited subscribers)
- **F-UPDATE: Link scheduling** (on Free)
- **F-UPDATE: QR code** (on Free, all color variants)
- **F-UPDATE: Entrance animations** (full 55-animation library on Free if DEC-SYN-21 accepts; or 10 on Free, 45 more via "premium templates" that are Free to view but include more elaborate setups)
- **F-UPDATE: Custom fonts** (on Free)
- **F-UPDATE: Hero banner + rich blocks** (on Free)
- **F-UPDATE: Commerce primitives** (product block / bundle / affiliate / lead-magnet all on Free, but with lower view quota implications)

### Features that remain paid

- **F-PAID: Custom domain** (Creator+: 1 included; add-on €2/mo for additional)
- **F-PAID: Multi-site** (Creator: 1, Pro: 3, Business: unlimited)
- **F-PAID: API access** (Pro+ only; reason: API consumers can burn quota programmatically, needs enforcement)
- **F-PAID: Priority routing** (Business-only; dedicated Cloudflare Argo route)
- **F-PAID: Support SLA** (Free: community; Creator: 48h email; Pro: 24h; Business: 4h)

### Features to update (billing module)

- **F-UPDATE: Billing module** (replace feature-gated plan check with usage-metered plan + overage)
- **F-UPDATE: Stripe integration** (add metered Price items + usage record push every hour)
- **F-UPDATE: Invoice generation** (add overage line item + VAT handling)
- **F-UPDATE: Plan change UX** (add warning modals for downgrade + pro-ration)

### Backend additions

- **B-NEW: Cloudflare Workers edge counter** (per-creator per-day view counter in KV)
- **B-NEW: Kinesis Firehose → S3 pipeline** (analytics events + bytes)
- **B-NEW: Athena query layer** (for dashboard + billing)
- **B-NEW: `usage_summary` table in Supabase** (aggregated views + bytes + by-creator)
- **B-NEW: `spend_caps` table** (per-creator monthly spend cap config)
- **B-NEW: `overage_records` table** (incremental overage charges for billing)
- **B-NEW: Viral-detection Lambda** (hourly check for creators with 10× traffic spikes)

### Data model changes

- **DM-NEW: `creators.current_tier`** (free / creator / pro / business)
- **DM-NEW: `creators.monthly_view_quota`** (derived from tier + overage)
- **DM-NEW: `creators.monthly_spend_cap`** (null = no cap)
- **DM-NEW: `creators.heaviness_multiplier`** (derived from page_weight observations; UI display only)
- **DM-NEW: `usage_events`** (time-series per creator view/byte counts)
- **DM-NEW: `billing_invoices`** (Stripe invoice references + line items)

### UI additions

- **UI-NEW: Usage dashboard page** (/dashboard/usage)
- **UI-NEW: Billing page redesign** (tier change flow + spend cap settings + invoice history)
- **UI-NEW: Editor weight calculator** (persistent toolbar + side drawer)
- **UI-NEW: Signup views-prediction step**
- **UI-NEW: Viral-moment upgrade banner**
- **UI-NEW: Overage alert emails** (5 templates: 50/80/100/120/150%)

---

## 13. Final note — the three wedges

Tadaify's competitive position on day 1 should collapse to three sellable wedges, each aligned with the bandwidth pricing model:

1. **Every feature free forever.** No custom-theme paywall. No analytics paywall. No email capture paywall. Everything is included on the €0 tier. Creators evaluate tadaify and see a product they can use end-to-end without paying.

2. **Pay only for your traffic.** Usage-based pricing. The honest model. When you grow, we grow with you. When you're small, you pay nothing. When you're viral, we make it easy to handle the spike.

3. **Built for EU creators on EU infrastructure.** VAT auto-calc. PL payment methods. Native PL localization. Cloudflare EU POPs. GDPR-first. The one competitor (Framer) that has usage pricing is US-focused. We own the EU beat.

Everything in this document supports those three wedges. If a feature or pricing detail undermines them, cut it.

**Ship it.**
