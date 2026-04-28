---
type: marketing-strategy
project: tadaify
title: Tadaify — Aggressive Go-to-Market Strategy
created_at: 2026-04-24
author: orchestrator-opus-4-7-marketing-agent
status: draft-v1
---

# Tadaify — Aggressive Go-to-Market Strategy

> **Primary thesis (user-locked):** tadaify steals its first 1000 paying users **FROM Linktree / Beacons / Stan / Carrd** via aggressive, personalised direct outreach powered by a preview-generator flywheel. SEO + Product Hunt + influencers are amplifiers, not the engine.
>
> **Why this thesis works:** the category has ~50M Linktree users + ~1M Beacons + ~200k Stan + a long tail. Every one of them is **already convinced they need a link-in-bio tool** — we skip the "educate the market" step entirely. We just need to convince them ours is better and give them a frictionless way to switch. That is 100x cheaper per acquisition than paid ads chasing cold "best link in bio" searchers.
>
> **This document lays out 6 tracks and their costs.** The user picks the blend. Defaults recommended inline.

Referenced upstream research (read these as the proof layer, this doc is the plan layer):

- `competitors/_synthesis/00-tldr.md` — competitor audit TL;DR (78 patterns, 10-section feature-mix)
- `marketing-channels.md` — 121 channels catalogued
- `marketing-pitch-angles.md` — 10 pitch templates
- `marketing-seo-keyword-map.md` — 45 queries ownability-scored
- `marketing-affiliate-programs.md` — competitor affiliate rates (Taplink 40% lifetime, Beacons/Stan 20-25% recurring)
- `marketing-vs-articles-catalog.md` — 15 pair queries with T1-T4 article ranking
- `brand-lock.md` — `tada!ify` + Indigo Serif + tagline `Turn your bio link into your best first impression.`
- `tadaify-research-synthesis.md` — 34 DEC-SYN proposals (pending user review)

---

## 0. Executive summary

**Marketing language: EN-only at launch per DEC-MKT-C.**

**The 5-track strategy in one page.**

| Track | What it is | 90-day cost range | Expected 90-day signups | Risk | Recommended allocation |
|---|---|---|---|---|---|
| **A — Direct outreach** | DM/email Linktree + Beacons + Stan + Carrd users; personalised via preview-tool | $500 – $8k | 300 – 3,000 | Medium (IG bans, GDPR) | **40% of effort** |
| **B — Preview-generator sales tool** | Admin-only tool at `/admin/marketing/preview-generator` — admin pastes target's Linktree URL, customizes preview, generates private `preview.tadaify.com/<slug>?ref=<hash>` URL, sends 1-to-1 in DMs | $0 (3 weeks eng) | 300 – 2,000 | Low | **25% of effort** |
| **C — Influencer partnerships** | 10-20 micro creators free Pro + 50% affiliate; 3-5 mid creators paid | $0 – $50k | 500 – 5,000 | Medium | **15% of effort** |
| **D — PH + HN + IH launch wave** | Coordinated Tues→Thu launch in week +8 | $500 – $5k (hunter + prep) | 1,000 – 5,000 (one-off) | Low | **10% of effort** |
| **E — SEO + content (slow burn)** | 11 vs-pages + 5 niche pages + monthly roundup | $0 (owned) – $10k (content hire) | 0 – 500 (compounds after m6) | Low | **5% of effort** |
| **F — Social / brand presence** | Twitter/X + IG + TikTok + Discord community | $0 – $3k | 100 – 1,000 | Low | **5% of effort** |

**Total allocation:** Tracks A + B = 65% of effort. **These are the signature tactics that make tadaify's GTM non-generic.** Everything else is hygiene.

**90-day signup expectations:**

| Scenario | Signups (m0-m3) | Free→Pro 5% | Paying users | MRR (Pro $5/$15) |
|---|---|---|---|---|
| **Bootstrap ($5k)** | 2,400 | 120 | 120 | **$900–$1,800** |
| **Seed ($30k)** | 6,200 | 310 | 310 | **$2,325–$4,650** |
| **Well-funded ($150k)** | 14,000 | 700 | 700 | **$5,250–$10,500** |

Bootstrap is viable for tadaify because the preview-generator is a **CapEx, not OpEx** lever — build it once, compounds forever.

**Cadence:** week -8 to week -1 is prep. Week 0 is PH/HN/IH launch. Week +1 to +12 is outreach + influencer scale-up.

**Key KPIs** (track weekly):

- Signups/week
- Admin preview generations/week (Track B — admin-only sales tool; private 1-to-1)
- Preview conversion rate (preview URL sent in DM → signup via hash within 7 days; target 3-10%)
- Cold-outreach reply rate (target 3-10%)
- Cold-outreach conversion rate (target 0.3-1%)
- Free → Pro conversion (target 5%; industry median is 3-6%, we gate commerce so we expect higher)
- CAC by channel (target <$10 Track A+B, <$50 Track C+D, <$200 Track E)
- LTV (expected $50-375 given Creator $5/mo or Pro $15/mo × 10-25 month retention)

---

## 1. Strategy overview — 6 marketing tracks

### Track A — Direct outreach to Linktree/Beacons/Stan/Carrd users (AGGRESSIVE thesis)

**What it is:** We build a list of creators currently using competitor link-in-bio tools, then contact them with a personalised message offering a preview of their own page on tadaify. Aim for 3-10% reply rate, 0.3-1% signup rate.

**Why it fits tadaify:** The category has ~50M existing users. 40% of Linktree users are on Free (never paid) — **these are our primary targets, not Linktree's paying customers**. We pitch what they can't get free on Linktree (custom themes, 365-day analytics, scheduling, email capture, custom fonts, 0% commerce fees) — because on tadaify, every single one of those is free. They only pay if they want a custom domain ($5 Creator) or agency/team features ($49 Business).

**Cost range:** $500/mo (manual DM, 100/day) up to $8k/mo (full cold-email stack + enrichment + VA team).

**Expected velocity:** manual DM = 30-150 signups/mo; tooled = 100-1000 signups/mo. Scales linearly with outreach volume up to deliverability / platform-ban ceilings.

**Risk profile:** IG auto-DM bans at ~100/day/account; cold-email deliverability degrades without warm-up; GDPR soft-opt-in window is narrow in EU.

**Recommended as:** Primary engine. 40% of effort, 60% of signup volume.

### Track B — Preview-generator private sales tool (admin-only)

**What it is:** Admin goes to `/admin/marketing/preview-generator`, pastes a target creator's Linktree URL (MVP), customizes the preview visually (theme/animation/layout/CTA/palette), and clicks "Generate shareable preview." System creates a private `preview.tadaify.com/<slug>?ref=<hash>` URL. Admin sends this URL privately in a DM or email. The creator clicks, sees their own page already looking amazing on tadaify, clicks "Claim in 30 seconds," signs up, and finds their editor pre-configured exactly as the preview. This is a **hand-crafted 1-to-1 white-glove conversion tool** — admin literally spends 5 minutes customizing each preview for that specific target. Not automated, not broadcast, not public.

**Why it fits tadaify:** Single highest-leverage marketing lever — simultaneously (a) 10x higher DM reply rate vs generic outreach (recipient sees their own content, hand-crafted for them), (b) onboarding inheritance (target's account pre-configured on signup via hash), (c) proof of product quality before signup, (d) zero public attack surface or legal exposure. No competitor has shipped anything like this.

**Cost range:** ~3 weeks of eng for admin UI + customization engine + parser + preview renderer + hash-inheritance (one-time). Marginal cost per preview near-zero ($0.001 Edge Function + serving).

**Expected velocity:** Conversion-driven, not virality-driven. Target: 3-10% DM reply rate (vs 0.5-1% for generic) × 1-3% signup rate = 30-300 signups per 1,000 DMs sent. **10x multiplier** over generic outreach at same volume.

**Risk profile:** Low-to-none. Admin-only tool means zero public catalog, zero scraping surface, zero C&D risk from auto-generating public pages. Preview URLs are `noindex`. Admin controls every preview — no abuse vector.

**Note on M+0.5:** Beacons, Stan, Bio.link parsers ship in week +2 post-launch (F-PREVIEW-010..012), expanding Track B outreach to those pools. Track B outreach in sprint 2 targets Beacons users.

**Recommended as:** DM personalisation engine. 25% of effort. Must ship before outreach starts (Track A + Track B are fused).

### Track C — Influencer / creator marketing

**What it is:** Partner with creator-economy content creators who already review creator tools. Two tiers: (1) 10-20 nano/micro creators on free-Pro + 50% affiliate boost (cost = $0 cash), (2) 3-5 mid creators paid $3-10k each for dedicated content.

**Why it fits tadaify:** The existing "Linktree alternative" review economy is paid almost entirely by Beacons (25% recurring) and Stan (20% recurring). Matching or beating these rates flips the SEO-farm ecosystem onto us within 30 days of affiliate-program launch.

**Cost range:** $0 (affiliate-only) to $50k (paid mid-tier creators for 90 days).

**Expected velocity:** Slow start (4-6 weeks to produce content), compounds after month 3.

**Risk profile:** Low. Budget-predictable, outcome-variable.

**Recommended as:** Amplification layer. 15% of effort.

### Track D — Product Hunt + Hacker News + Indie Hackers launch waves

**What it is:** Coordinated three-platform launch in a single week (Tue PH, Wed HN, Thu IH). Single biggest SEO-free traffic event we can create.

**Why it fits tadaify:** tadaify's positioning (mockup-first, EU/PL wedge, 0% fees, Indigo Serif brand) is specifically PH-friendly. Our `tada!ify` brand voice + aggressive positioning against Linktree reads well on HN. IH audience loves build-in-public MRR posts.

**Cost range:** $500 – $5k. Main costs: hunter fee ($0-2k), pre-launch waitlist builder (Waitlister $0-500), launch-day assets.

**Expected velocity:** Concentrated. Top-5 PH Day = 1-5k signups; #1 PH Day = 5-20k signups.

**Risk profile:** Low. One-shot; worst case = no traction, we still keep the SEO backlink from PH page.

**Recommended as:** Week 0 catalyst. 10% of effort.

### Track E — SEO + content (baseline slow-burn)

**What it is:** Per `marketing-seo-keyword-map.md` — 11 vs-pages (bio.link vs lnk.bio type) + 5 niche landing pages (newsletters, coaches, real estate, musicians, photographers) + monthly "what's new in link-in-bio" roundup. Public template gallery + public creator directory as SEO assets.

**Why it fits tadaify:** Defensive + compounding. Will not drive signups in month 1-3 but is the primary channel from month 9 onwards.

**Cost range:** $0 (founder writes) – $10k (content contractor @ $500/post).

**Expected velocity:** 0-500 signups in 90 days; 2000-5000/mo by month 12.

**Risk profile:** Low. Compounds even if we de-prioritise.

**Recommended as:** Set-and-forget background. 5% of effort in first 90 days.

### Track F — Social media brand presence

**What it is:** Twitter/X founder voice + brand account, Instagram (the visual showcase), TikTok (growth channel), LinkedIn (founder only), Discord (creator community).

**Why it fits tadaify:** Creators live on these platforms. We MUST be present, but we're not pretending this is the primary engine. It's a supporting layer that makes Tracks A+B+C land.

**Cost range:** $0 (founder posts) – $3k/mo (social-media VA + content agency).

**Recommended as:** Hygiene. 5% of effort.

---

## 2. Track A — Direct outreach (AGGRESSIVE primary thesis)

This is the load-bearing track. Every tactic below is chosen for maximum personalisation + volume.

### 2.1 Feasibility research — can we identify Linktree users at scale?

We need to answer: for each source platform (Google, IG, TikTok, X, LinkedIn), how cheaply + legally can we identify people currently using Linktree / Beacons / Stan / Carrd / Bio.link?

#### 2.1.1 Google SERP scraping — `site:linktr.ee/<username>` (PRIMARY — largest pool)

**Feasibility:** High. Every public Linktree page is indexed by Google. `site:linktr.ee` returns roughly 4-6 million indexed URLs (2026-04-24 estimate). Same dork works for `site:beacons.ai`, `site:stan.store`, `site:carrd.co`, `site:bio.link`.

**Tools:** SerpAPI ($50/mo for 5,000 searches), Bright Data SERP API ($0.001-0.005 per query), Apify Google SERP actor (~$0.50 per 1,000 results). Combined with basic pagination, we can extract 10,000 linktree handles per $100 of tool spend.

**Legality:** Scraping Google's SERP is a grey zone. Google ToS prohibits it but enforcement is rare for <$100k-volume operations. Risk mitigation: use residential-IP rotation (Bright Data handles this).

**ToS risk:** Linktree ToS prohibits automated harvesting of user handles, BUT we're scraping Google, not Linktree directly. Linktree has no standing to enforce.

**GDPR:** Publicly-listed usernames without personal data are not "personal data" under GDPR Article 4. If we link usernames to full names (via IG bio cross-reference), GDPR applies — we need legitimate-interest basis + unsubscribe path.

**Expected pool:** 2-4 million unique handles discoverable in first 30 days of scraping at ~$500 tool cost. This is the entire addressable funnel for Track A.

**Verdict:** **BUILD THIS FIRST.** Single highest-ROI data source.

#### 2.1.2 Instagram bio-URL scraping (SECONDARY — highest-intent signal)

**The signal we want:** Instagram bios containing `linktr.ee/` or `beacons.ai/` or `stan.store/` or `carrd.co/`. These creators are actively linking from IG to one of our competitors — they are by definition target users.

**Feasibility angles:**

- **Instagram Graph API (official):** Business + Creator accounts expose the `website` field via `/me?fields=website` (requires Instagram Login or Facebook Login + app review). Basic Display API was deprecated December 2024. Practical: we can NOT scan all 2B IG users via Graph API — the API only exposes data for accounts that explicitly authenticate with our app. Useful only AFTER signup, not for cold outreach.
- **Public web scraping (`instagram.com/<handle>`):** Scraping Instagram's public pages is legally grey — the `hiQ Labs v. LinkedIn` Ninth Circuit ruling (2022, reaffirmed post-remand) established that scraping publicly accessible data does NOT violate the CFAA. HOWEVER, Meta has actively sued scrapers (Bright Data settlement 2024). Meta aggressively blocks scrapers via rate-limiting, JS challenges, and account bans. Practical rate: ~1 profile per 3-10 seconds per warm residential IP = ~10k profiles/day/IP stack = $500-2000/mo infra for 500k profiles/mo.
- **Third-party enrichment tools:**
  - **Modash** — $120-300/mo for search-by-bio-keyword. Can filter IG bios containing "linktr.ee". Returns handle + follower count + niche. ~5-10M bios indexed.
  - **HypeAuditor** — enterprise pricing ($300-2000/mo). Influencer search + bio text filter.
  - **Phyllo** — creator data API, priced per pull ($0.01-0.10 per profile). Accesses IG Creator data via official integrations + partnerships.
  - **Heepsy** — $49-349/mo. 11M+ creator database searchable by bio keyword.

**Best play:** pay Modash $300/mo OR Heepsy $149/mo for 3 months, filter for bios containing our competitor URLs. Extract: handle, follower count, niche, any available email. Expected: 100k-500k filtered profiles across the 3 months.

**Legality:** GDPR applies if we contact EU creators (most of them). Legitimate-interest basis is available for B2B outreach to business/creator accounts. Private individuals require opt-in (we don't have it for cold DMs).

**Verdict:** Use Modash ($300/mo) or Heepsy ($149/mo) as the primary IG enrichment source. Do NOT self-scrape IG — the risk-adjusted ROI is poor.

#### 2.1.3 TikTok bio-URL scraping

**Feasibility:**
- TikTok Research API: academic-only (2024 policy tightened further in 2025); commercial access restricted.
- TikTok Business API: limited to advertisers; no bulk creator discovery.
- Public web: TikTok bios are visible at `tiktok.com/@<handle>` without login; scrapers work but TikTok's anti-bot is aggressive (Cloudflare Turnstile + TT Proof).
- Third-party: Modash + HypeAuditor + Phyllo cover TikTok (same subscriptions as above).

**Verdict:** Piggyback on Modash/Heepsy subscription for TikTok. Do not build dedicated TikTok scraper.

#### 2.1.4 Twitter/X bio-URL scraping

**Feasibility:**
- X API v2: Free tier = 100 reads/month (useless). Basic $200/mo = 15k reads/month. Pro $5k/mo = 1M reads/month. Pricing changed again in late 2025 post-Musk-era optimization.
- Public web: protected by extensive anti-bot; near-impossible to scrape at scale.
- Third-party: many enrichment tools include X data.

**Verdict:** X API Basic at $200/mo gives us 15k bio-searches, enough for targeted high-value outreach (verified creators, specific niches). Do NOT pay Pro $5k/mo.

#### 2.1.5 LinkedIn scraping (B2B creators — coaches, consultants, authors)

**Feasibility:**
- LinkedIn has sued scrapers repeatedly — hiQ paid a settlement in 2022, others followed. Civil exposure is real even when criminal (CFAA) risk is low.
- LinkedIn API: ultra-restricted for hiring/sales platforms only.
- Sales Navigator: $99/user/mo for search + saved lists. 200 InMails/mo.
- Apollo.io ($49/user/mo Basic with 900 credits/yr, $79 Professional with unlimited fair-use) scrapes public LI data at scale.

**Verdict:** Apollo.io Professional plan (~$79/mo) is the best play for LinkedIn B2B-creator outreach. Budget 1 seat.

#### 2.1.6 Feasibility summary

| Source | Tool | Cost/mo | Pool size | Best use |
|---|---|---|---|---|
| Google `site:linktr.ee` | SerpAPI + Apify | $100-300 | 2-4M handles | **Bulk cold email/DM** |
| Google `site:beacons.ai` | Same | Same | 100-500k | **Cold DM target 2** |
| Google `site:stan.store` | Same | Same | 50-200k | **Cold DM target 3** |
| Google `site:carrd.co` | Same | Same | 200k-1M | **Cold DM target 4** |
| Google `site:bio.link` | Same | Same | 500k-2M | **Cold DM target 5** |
| IG bios w/ competitor URL | Modash or Heepsy | $149-300 | 100-500k | **Primary personalisation** |
| TikTok bios | Modash/Heepsy (same sub) | — | 50-200k | Secondary |
| X bios | X API Basic | $200 | 15k/mo budget | Verified-creator outreach |
| LinkedIn B2B creators | Apollo.io | $79 | ~5M | Coaches/consultants niche |

**Total budget for discovery tools: $600-900/mo** for a 5-channel sweep. This is cheaper than a single paid ad on "Linktree alternatives" (~$5-15 CPC = ~$500 for 50 clicks).

### 2.2 Outreach infrastructure

Once we have the handles, we need four infrastructure layers:

#### 2.2.1 Contact enrichment (handle → email/DM)

- **Hunter.io** — $34/mo Starter (2000 Unified Credits); $139/mo Scale (10k searches + 20k verifications). Email-finder by domain.
- **Apollo.io** — $49-79/user/mo. Bulk email enrichment + unlimited fair-use on Professional.
- **Clearout / NeverBounce / ZeroBounce** — $10-30/mo for verification only (lowers bounce rate below 3% which is required by Instantly/Smartlead for deliverability).

**Stack for tadaify:** Apollo.io Professional ($79/mo) as primary (covers LinkedIn + email + enrichment). Hunter.io Starter ($34/mo) as backup + domain-specific searches. Clearout ($30/mo) for final verification before send.

**Total:** **~$143/mo** for enrichment.

**Reality check:** most creators do NOT have a public email. Our primary outreach channel for IG/TikTok creators is DM, not email.

#### 2.2.2 DM automation (for IG/TikTok outreach)

- **InstaDM / Manychat** — Manychat $15-25/mo for IG DM automation (only works with Business/Creator accounts via approved Meta Business integration). Rate-limited to avoid Meta enforcement.
- **Phantombuster** — $69/mo Starter, $159/mo Team. Runs custom IG/TikTok/LinkedIn automations via "phantoms". Higher ban risk because it bypasses official APIs.
- **Manual + VA team** — 1 VA at $400-800/mo can send 100 personalised DMs/day = 3,000/mo. Best quality, most scalable linearly.

**Stack for tadaify:** Start manual + VA (1 VA @ $500/mo) for first 30 days. Add Manychat ($25/mo) for warm replies auto-response. Skip Phantombuster unless volume exceeds 5k DMs/mo.

**Critical:** use MULTIPLE IG accounts (10-20) for volume, each warmed up over 2 weeks of natural engagement before sending any DM. One account = 50-100 DMs/day max. Going higher = shadowban within 72h.

**Budget:** **$500-800/mo** for VA + tooling.

#### 2.2.3 Email warmup + deliverability (for email-available creators)

- **Instantly.ai** — Growth $37/mo (5k leads, 10k sends, unlimited mailboxes, built-in warmup). Hypergrowth $97/mo (25k leads, 100k sends). Light Speed $358/mo (500k leads).
- **Smartlead** — Basic $39/mo (2k leads, 6k sends); Pro $94/mo (30k leads, 150k sends). Marginally cheaper than Instantly at Pro tier.
- **Lemlist** — $55-99/user/mo. Best multichannel (adds LinkedIn + cold call) but per-seat pricing makes it 2-3x more expensive.

**Domain strategy:** Purchase 5-10 alternate domains (e.g. `trytadaify.com`, `tadaify.co`, `tadaify.app`, `hellotadaify.com`) + SPF/DKIM/DMARC per domain + 2-3 warmup mailboxes per domain = 20-30 sender addresses. This is mandatory for deliverability at any meaningful volume (>500 sends/day).

**Stack for tadaify:** **Instantly.ai Hypergrowth ($97/mo)** — the flat-fee structure, 100k send limit, and best-in-class warmup suite make it optimal for a solo founder + VA setup. Add 7 alternate `.com` domains (~$10/yr each via Cloudflare Registrar = $70/yr).

**Budget:** **~$100/mo** for cold-email stack.

#### 2.2.4 CRM for tracking

- **HubSpot Free** — free CRM for 1M contacts; paid tiers from $20/mo.
- **Attio** — $29/user/mo; modern, good for startup ops.
- **Close.com** — $49-129/user/mo; sales-team focused.
- **Pipedrive** — $14-79/user/mo.
- **Spreadsheet + Airtable** — $0-20/mo; scrappy but fine for <10k leads.

**Stack for tadaify:** **HubSpot Free** for 0-6 months, upgrade to Attio ($29/mo) when contact count exceeds 50k.

**Budget:** **$0-29/mo.**

#### 2.2.5 Total infrastructure budget

| Layer | Tool | Monthly |
|---|---|---|
| Discovery | Modash + SerpAPI | $300-500 |
| Enrichment | Apollo + Hunter + Clearout | $143 |
| DM automation | Manychat + VA | $525 |
| Cold email | Instantly Hypergrowth | $97 |
| CRM | HubSpot Free → Attio | $0-29 |
| Domains | 7 alternates | $6 |
| **TOTAL** | | **~$1,100 – $1,300 / mo** |

This supports 3,000-10,000 DMs + emails per month. At 0.5% conversion = 15-50 paying users/mo = $75–750 MRR added per month (Creator $5–Pro $15 mix). At 1.0% conversion = 30-100 paying users/mo = $150–$1,500 MRR added per month. **Breaks even in month 2-3, becomes net-positive from month 4.**

### 2.3 Outreach message playbook

**Principle:** every message must reference the recipient's existing Linktree/Beacons/Stan page. Generic "hi, try our tool" messages get <0.1% reply. Preview-linked personalised messages get 3-10%. This is the game.

#### 2.3.1 Cold IG DM — EN #1 (recipient has Linktree)

> Hey [name]! Saw your page at linktr.ee/[handle] — love the [specific thing from their page, e.g. "photography print drops"].
>
> I'm building tadaify — a link-in-bio where custom themes, 365-day analytics, scheduling, and email capture are **free for everyone**. Only thing you pay for is a custom domain ($5 Creator plan). Spent 5 minutes designing a preview of your page on tadaify for you: **{{preview_url}}**
>
> No signup to view. If you want your handle, claim it in 30 seconds.
>
> Zero pressure — just curious what you think. Cheers!

**Length:** 66 words. Leads with the "everything free" contrast vs Linktree's paywalled features. Preview URL is the personalisation hook.

**Key angle:** "everything free" — immediately answers the Linktree user's core frustration (paying $12/mo for features that should be basic).

#### 2.3.3 Cold email — EN #1 (recipient has email + Linktree)

> Subject: Spent 5 minutes designing your tadaify page — take a look
>
> Hi [name],
>
> Big fan of [specific content — newsletter topic, product, recent launch]. Quick hello from tadaify, a link-in-bio we're launching next month.
>
> I spent 5 minutes designing a preview of your page on tadaify — picked a theme + layout that I thought suited your brand:
>
> → {{preview_url}}
>
> **What actually changes vs your current Linktree setup:**
> - Custom themes, 365-day analytics, scheduling, animations, email capture, QR, reviews: **all free on tadaify** (Linktree locks most of these behind $9–24/mo Pro)
> - Commerce: **0% platform fees** (Linktree Shops takes ~12%)
> - Custom domain: **$5/mo Creator plan** — vs Linktree's $12/mo Pro required for the same thing
> - You stay on Free forever if you never want a custom domain — zero nag, zero upgrade popups
>
> If any of that matters to you, claim your handle here: tadaify.com/claim/[handle]
>
> If not, no worries — I'll let you get back to [their niche].
>
> — [founder name], tadaify
> P.S. one-click unsubscribe: [link]

**Length:** 160 words. Standard cold-email spec. Enumerates concrete feature contrasts with Linktree prices anchored ($12 vs $5), adds anti-popup copy to pre-empt "another annoying SaaS" objection.

**Key angle:** "everything free" + explicit price comparison ($5 vs $12 custom domain). The anti-upsell line ("zero nag, zero upgrade popups") is 1-of-5 subtle upsell philosophy mention per task spec.

**Required compliance footer (for EU recipients):** physical address + unsubscribe + processing-basis line ("This is a commercial outreach under legitimate interest — Article 6(1)(f) GDPR. Click here to opt out forever.").

---

#### 2.3.4 Cold DM — Beacons user #1

> Hey [name]! Your beacons.ai/[handle] caught my eye — [specific thing].
>
> Building tadaify, a link-in-bio that fixes 2 of Beacons' biggest complaints:
> — 0% platform fees on every plan including Free (Beacons takes 9% even on small sales)
> — Custom domain at **$5/mo Creator** — Beacons charges $30/mo Creator Plus for the same thing
>
> AND all the features (themes, analytics for 365 days, scheduling, email capture) are free on every plan — no upgrade walls.
>
> Spent 5 minutes designing a preview of your page on tadaify for you: **{{preview_url}}**
>
> Quick look, no signup. LMK what you think!

**Hook:** Beacons' 9% fee is the largest aggregate complaint in their reviews. Named explicitly. Second hook: $5 custom domain vs Beacons' $30 Creator Plus — an even stronger contrast than the Linktree comparison ($5 vs $12).

**Key angle:** Beacons price comparison is more dramatic than Linktree ($5 vs $30 = 6x cheaper), so the custom domain hook is the primary angle here rather than "everything free".

#### 2.3.5 Follow-up sequence

##### DM-IG-EN #2 — Follow-up Day +3 (for non-openers)

> Just bumping this — did the preview at {{preview_url}} load OK for you? (Instagram compresses some links.)

**Angle:** purely frictionless bump. No new pitch — just ensures the preview link got through.

---

##### DM-IG-EN #3 — Follow-up Day +7 (for openers who didn't reply)

> Last one from me, promise. We're launching on Product Hunt in 2 weeks at #tadaify — a link-in-bio where everything (themes, 365-day analytics, scheduling, email capture) is free. Only custom domain costs $5/mo. Founder to founder — 30 seconds of honest reaction before we go live would genuinely help us. Cheers.

**Angle:** introduces the "everything free" pricing in one sentence before the social request. Shorter than the original but more concrete on what tadaify actually is.

---

##### DM-IG-EN #4 — Day +14 (claimed handle but didn't configure)

> Noticed you grabbed @[handle] on tadaify — welcome! If the editor isn't obvious, I made a 90-second walkthrough: [link]. Any blocker, just reply.

---

**Unsubscribe** triggered at any time stops the entire sequence + adds to permanent suppression list.

---

#### 2.3.6 Cold email — "preview ready" EN (pre-generated preview sent before first DM)

> Subject: Spent 5 minutes designing your page on tadaify — take a look
>
> Hi [name],
>
> I spent 5 minutes designing a preview of your linktr.ee/[handle] on tadaify before reaching out — here it is:
>
> → {{preview_url}} (no signup needed to view)
>
> Why bother? Because a generic "try our link-in-bio" email is noise. Seeing YOUR page, already styled and configured the way I think it would look amazing, in 2 seconds — is signal.
>
> Here's what's different on tadaify:
> - **Everything is free** — custom themes, 365-day analytics, scheduling, email capture, QR codes, social embeds. Not paywalled. Free.
> - **0% commerce fees** on every plan including Free (vs Linktree Shops ~12%)
> - **Custom domain at $5/mo** via Creator plan — vs Linktree's $12/mo Pro required for the same
> - Pro adds team seats, A/B testing, cohort analytics, API, email automations ($15/mo)
> - Business adds white-label + sub-accounts for agencies ($49/mo)
>
> If Free + a $5 custom domain covers 90% of what you need, you can stay on those forever.
>
> Claim your handle: tadaify.com/claim/[handle]
>
> If you want the preview adjusted — different theme, different layout — just reply and I'll update it.
>
> — [founder name], tadaify
> P.S. one-click unsubscribe: [link]

**Length:** ~200 words. This is the Track A + B fusion template — sent when admin has generated a hand-crafted preview before any contact. Longer than the DM variants because email allows it.

**Key angle:** leads with the transparent "spent 5 minutes on this for you" hook (highest reply rate category in B2B outreach — now literally true under the admin-tool model), then lays out full pricing tiers ($5 Creator / $15 Pro / $49 Business) explicitly. The offer to "update the preview" reinforces the hand-crafted nature.

**Required compliance footer (EU recipients):** physical address + unsubscribe + "This is a commercial outreach under legitimate interest — Article 6(1)(f) GDPR. Click here to opt out forever."

---

### 2.4 Legal + ethical considerations

**GDPR compliance for EU creator outreach:**

- Legal basis: **legitimate interest (Article 6(1)(f))** for B2B outreach to business/creator accounts. Requires balancing test documented internally.
- Data minimisation: retain only handle + email + platform + last-outreach-date. Purge after 18 months.
- Right to object: every email/DM MUST include a one-click unsubscribe. Track in CRM.
- Right to erasure: honour within 30 days.
- Data Processing Agreement: required if we use Apollo/Hunter/Modash — they are GDPR-compliant by default but need DPA on file.

**CAN-SPAM (US):**
- Physical postal address in every email footer.
- Unsubscribe within 10 business days.
- Accurate "from" line.
- No misleading subject.

**CASL (Canada):**
- Implicit consent only for 6 months after a business relationship.
- Express consent required for ongoing — CA recipients go through a narrower funnel (1 email only, then opt-in gate).

**DSA (EU):**
- Platform ToS cold-outreach restrictions apply when messaging IS the platform's DM system. Our IG DM approach uses legitimate business-profile DM permissions but volumes above 500/day/account risk classification as "platform abuse".

**Instagram ToS:**
- Officially prohibits automation of any kind. In practice, manual DMs at 50-100/day/account are tolerated. Shadowbans kick in above ~150/day. Hard bans above 300/day or patterns flagged by their ML.
- Mitigation: warm accounts 2+ weeks before use; vary messages (template with 3+ variants); human-like timing (300-600s jitter between DMs).

**Ethical line (the one the user's brand cares about):**

- **Contact each creator maximum 3 times** (day 0, day +3, day +7). Stop thereafter forever.
- **Offer actual value** (preview of their real page, not a generic pitch).
- **No impersonation** (the preview page shows "preview generated by tadaify — [creator] does not endorse").
- **No misleading claims** (our prices and features must match what we actually ship).
- **One-click unsubscribe** in every message, honoured within 24h.

The user's brand explicitly rejects Beacons' "screw the algorithm" anti-platform tone. Our outreach voice stays **polite, curious, creator-to-creator** — not "growth-hacky cold sales rep".

### 2.5 Volume + cost model

**Week 1-4 (warmup):**
- Manual DMs only, 50/day × 1 founder + 1 VA × 5 days = 500/week = 2,000/mo.
- Expected reply rate: 5-10% (personalised with preview).
- Expected signup rate: 1-2%.
- Expected Creator/Pro conversion: 15-25% (commerce-gated + domain-wanting users self-select into paid).
- **Output: 20-50 signups/mo, 3-12 paying users/mo = $15-180 MRR added (Creator $5–Pro $15 mix).**

**Week 4-12 (scale):**
- Manual DMs + cold email stack: 100 DMs/day × 2 VAs × 6 IG accounts × 5 days = 3,000/week = 12,000 DMs/mo. Plus 5,000 emails/mo (100% warmed domains).
- Expected total touches: 17,000/mo.
- Expected reply rate: 3-7% (dilution at scale).
- Expected signups: 200-400/mo.
- Expected paying users added: 30-80/mo = $150–$1,200 MRR/mo added (Creator $5–Pro $15 mix).
- **Cumulative MRR at week 12: $750 – $5,000 from Track A alone (wide range due to Creator vs Pro tier split).**

**Week 12+ (steady-state):**
- Add 2-3 more VAs + 10-15 more IG accounts.
- Volume: 30-50k touches/mo.
- Paying users added: 100-300/mo.
- Run sustained until the addressable pool is saturated (approximately month 18-24 given ~5M Linktree handles).

**Recommended week-1 focus:**

1. Build the preview generator (Track B prerequisite).
2. Scrape Google for 10k linktree.ee/bio.link/beacons.ai/stan.store handles.
3. Rank by follower count (via Modash cross-reference).
4. Start with 500 top-tier targets (10k-100k followers, niche = newsletter/photography/coaching).
5. Send 20 manual DMs/day for 2 weeks before any automation.
6. Measure reply rate, iterate message, THEN scale.

---

## 3. Track B — Admin preview-generator (private 1-to-1 sales tool)

**This section deserves the most engineering attention of any item in this document. It is the single feature that makes tadaify's marketing strategy non-generic.**

**Architecture (MANDATORY — DEC-MKT-B-v2 locked 2026-04-24):** the preview generator is an **admin-only private marketing tool at `/admin/marketing/preview-generator`**. There is NO public `tadaify.com/preview/<handle>` endpoint. Generated previews are served at `preview.tadaify.com/<slug>?ref=<hash>` — `noindex`, private, sent 1-to-1 by admin only. This is a hand-crafted 1-to-1 white-glove conversion tool, not a viral catalog or broadcast mechanism.

**MVP launch scope (DEC-Q5-C):** Linktree-only parsing. Beacons, Stan, Bio.link follow at M+0.5 (week +2 post-launch). See `functional-spec-v2.md §3a`.

### 3.1 The concept

**Admin workflow (hand-crafted, 1-to-1):**

1. Admin opens `/admin/marketing/preview-generator`.
2. Admin pastes target creator's Linktree URL (e.g., `linktr.ee/alex`).
3. System fetches + parses → extracts `CreatorPreviewData` (name, avatar, bio, links, theme-color, socials).
4. Split-view editor opens: left = live preview (what target will see); right = customization sidebar.
5. Admin spends ~5 minutes tailoring this preview for THIS specific target — picks best theme, animation, layout, CTA text, reorders blocks.
6. Admin clicks "Generate shareable preview."
7. System assigns slug (prefer target's handle; fallback random if taken), creates referral hash, returns `preview.tadaify.com/alex?ref=h_9XkL2aPqR4nWz`.
8. Admin copies URL + uses F-PREVIEW-007 to generate DM copy → sends privately to target.

**What the target creator sees (on click):**

- Entrance animation plays immediately (the "wow/tada" moment).
- Their own page rendered beautifully on tadaify with admin's chosen theme and customizations.
- Above the fold: "Claim @alex in 30 seconds" CTA.
- Footer CTA: "Preview generated by tadaify — [Claim tadaify.com/alex →]".

**On signup via the preview link:**

- Target signs up → `?ref=<hash>` captured → `tadaify_preview_ref` cookie set (30-day).
- System detects hash → pre-populates onboarding with admin's full customization.
- Welcome message: "We've pre-configured your page based on the preview you saw. Feel free to tweak anything."
- Target lands in editor → page ALREADY looks amazing → zero "blank page" friction → immediate activation.

**What the preview does NOT do:**

- No public index or discovery catalog.
- No viral share mechanic — private sales artefact only.
- No automated bulk-generation without admin — hand-crafted nature is the conversion lever.
- No public counter. No search discoverability (`noindex` + `robots.txt disallow`).

### 3.2 Technical feasibility

**Can we parse Linktree pages reliably?**

Yes. Linktree serves SSR React HTML with deterministic attributes (confirmed via 2026-04-24 experiments on 10 sample pages). The block structure:

```html
<a data-testid="LinkButton" href="..." class="...">
  <img src="..." alt="..." />
  <p>Block title</p>
</a>
```

Fragility: `data-testid` attributes stable 2+ years. Weekly regression test catches HTML drift early.

**Beacons pages** — SSR (Next.js), `data-type="block"` attributes. Parseable. **Stan Store** — SSR Shopify-like template, `.product-card` / `.link-card`. **Bio.link** — standard semantic HTML. Trivially parseable.

**Verdict:** feasible for all 4 major platforms. Each = 2-3 days parser eng. **MVP ships Linktree-only (DEC-Q5-C).** Beacons/Stan/Bio.link parsers ship at M+0.5. See `functional-spec-v2.md F-PREVIEW-010..012`.

**Legal (admin-tool model — cleaner than prior public endpoint):**
- No auto-generated public pages → zero C&D exposure from mass auto-scraping.
- Admin manually creates each preview → intentional fair-use activity.
- Preview served at `preview.tadaify.com/<slug>` (not `tadaify.com/preview/<handle>`) → no direct brand confusion path.
- Risk: near-zero. If Linktree C&D: single KV flag disables Linktree parser in <1h; M+0.5 parsers continue.

### 3.3 Conversion mechanics (private sales tool, 10x conversion)

**The key insight:** a creator who receives a DM saying "Spent 5 minutes designing a preview of your page on tadaify for you" — with a link that proves it — converts at 3-10x the rate of any generic outreach. Under the admin-tool model, this is literally true: admin did spend 5 minutes on their specific preview.

**Predicted conversion metrics:**

| Outreach type | Response rate | Signup rate |
|---|---|---|
| Generic cold DM (no preview) | 0.5-1% | 0.1-0.3% |
| Cold DM + admin-crafted preview | 3-10% | 1-3% |
| Multiplier | **6-10x response** | **10x signup** |

**At 1,000 DMs sent with admin-crafted preview URLs:**
- 30-100 replies (vs 5-10 with generic)
- 10-30 signups (vs 1-3 with generic)
- CAC via Track B: ~$0.50-$2.00 per signup

**Hash-based onboarding inheritance as activation amplifier:**
- Target signs up → page instantly pre-configured → zero "blank page" friction.
- D1 activation rate expected significantly higher than standard signups.
- Pre-configured page immediately shareable → organic word-of-mouth from account itself.

### 3.4 "Spent 5 minutes designing this for you" DM — the Track A+B fusion

**This is the highest conversion rate tactic of any outbound channel in any B2B SaaS GTM. Track A + Track B merged.**

Flow:
1. Scrape 10k Linktree handles via Google SERP (§2.1.1).
2. Admin (or VA using admin panel) generates previews for priority targets.
3. Each preview URL + outreach log stored in F-PREVIEW-007 dashboard.
4. VA/founder sends DM using F-PREVIEW-007 auto-populated template: "Spent 5 minutes designing a preview of your page on tadaify for you. Check it: preview.tadaify.com/alex?ref=h_xxxxx"
5. Creator clicks → sees amazing hand-crafted version of their own page → claims → lands with everything pre-configured.

Reply rate: **3-10%** (6-10x improvement over generic — backed by genuinely hand-crafted content).

### 3.5 Cost + engineering estimate

**MVP (admin tool + Linktree parser — DEC-Q5-C):**

| Component | Eng time | Who |
|---|---|---|
| Admin preview-generator UI + split-view editor (F-PREVIEW-001) | 10-15 days | Sonnet agent |
| Customization engine (F-PREVIEW-002) | 5-7 days | Sonnet agent |
| Linktree HTML parser (F-PREVIEW-003) | 2-3 days | Sonnet agent |
| Preview renderer + slug management (F-PREVIEW-004) | 4-5 days | Sonnet agent |
| Hash-based referral + onboarding inheritance (F-PREVIEW-005) | 4-5 days | Sonnet agent |
| Admin preview dashboard (F-PREVIEW-006) | 4-5 days | Sonnet agent |
| Admin outreach workflow integration (F-PREVIEW-007) | 2-3 days | Sonnet agent |
| **MVP Total** | **~31-43 eng days (~6-7 eng weeks)** | |

**M+0.5 (week +2 post-launch — Beacons/Stan/Bio.link parsers):**

| Component | Eng time | Who |
|---|---|---|
| Beacons parser (F-PREVIEW-010) | 2-3 days | Sonnet agent |
| Stan parser (F-PREVIEW-011) | 2-3 days | Sonnet agent |
| Bio.link parser (F-PREVIEW-012) | 2-3 days | Sonnet agent |
| **M+0.5 Total** | **~6-9 eng days (~1.5 eng weeks)** | |

**Marginal cost per admin-generated preview:** near-zero (<$0.01). Expected volume: 100-500/mo. Infra cost: <$5/mo.

**ROI vs. paid ads:** <$0.01 per preview vs $2-5 CPC on "Linktree alternatives" Google Ads = **200-500x cheaper per click**.

### 3.6 Platform parser priority (admin tool scope)

| Source platform | Parseability | Priority | Est. targets in pool |
|---|---|---|---|
| **Linktree** | Easy (stable React SSR + data-testid) | **P0 — MVP (week 0); F-PREVIEW-003** | ~70M |
| **Beacons** | Medium (Next.js SSR, more fragile) | **P1 — M+0.5 (week +2); F-PREVIEW-010** | ~1M |
| **Stan Store** | Medium (templated but JS-hydrated) | **P1 — M+0.5 (week +2); F-PREVIEW-011** | ~200k |
| **Bio.link** | Easy (clean semantic HTML) | **P1 — M+0.5 (week +2); F-PREVIEW-012** | ~3M |
| **Carrd** | Hard (user-customisable layouts) | P2 — week +6 post-launch | ~2M |
| **Lnk.bio** | Easy | P3 — month +3 | ~500k |
| **Taplink** | Medium | P3 — month +3 | ~1M |

**Ship P0 (Linktree) at launch. P1 (Beacons/Stan/Bio.link) at M+0.5 = week +2 post-launch. P2-P3 follow as outreach signal demands.**

---

## 4. Track C — Influencer / creator marketing

### 4.1 Tier-by-tier cost benchmarks (2026 market rates)

Verified via `influencermarketinghub.com`, `influenceflow.io/resources`, `shopify.com/blog/influencer-pricing`, `stan.store/blog/influencer-rates`, `hootsuite.com/influencer-pricing` (2026-04-24 search):

| Tier | Followers | IG post | IG Reel | TikTok | YouTube integration | YouTube dedicated |
|---|---|---|---|---|---|---|
| **Nano** | 1k-10k | $50-500 | $50-500 (Reels priced 85-120% of static) | $100-500 | $300-1,000 | $500-2,000 |
| **Micro** | 10k-100k | $150-500 (low-mid), $300-500+ (mid) | $200-700 | $200-800, up to $2k for Reels-heavy | $500-2,000 | $2,000-10,000 |
| **Mid** | 100k-1M | $1,000-10,000 | $1,500-12,000 | $1,500-10,000 | $5,000-25,000 | $10,000-50,000 |
| **Macro** | 1M-10M | $10,000-50,000 | $15,000-70,000 | $10,000-50,000 | $25,000-100,000 | $50,000-200,000 |

**Engagement rate premium:** creators with ER > 8% command 30-50% premium over category median.

**Commission-alternative deals** (cash-light):
- Free lifetime Pro + affiliate: works with 80% of nano, 40% of micro, 10% of mid.
- Free lifetime Pro + $X one-off + affiliate: works with 95% of nano, 80% of micro, 40% of mid.

### 4.2 Who to target specifically

**Tier A — Creator-tool specialists (priority 1, 5-10 creators):**

- **Adam Connell** (`bloggingwizard.com`, `adamconnell.me`) — Tier-1 "Linktree alternatives" reviewer. ~500k monthly readers. Affiliate-first. Pitch: 50% first-year commission boost + featured-in-review slot.
- **Site Builder Report** founder — ~60k/mo. Neutral voice. Pitch: 90-day lifetime Pro + request re-test.
- **Creator Hero** — ~300k/mo. Already has affiliate storefront. Pitch: integrated cross-referral.
- **Jay Clouse** (`Creator Science` podcast + YouTube ~100k subs) — invests in creator-tools. Pitch: podcast guest + portfolio-company introduction.
- **Nathan Barry** (Kit / ConvertKit founder, 100k+ audience) — integration angle.
- **Dean Long** (`deanlong.io`, 15k/mo) — indie affiliate marketer. Pitch: affiliate-first with unlock bonuses.
- **Justin Welsh** (500k+ LinkedIn) — solopreneur audience. Pitch: solopreneur playbook co-authored piece.

**Tier B — Creator-economy content machines (priority 2, 5-10 creators):**

- Reviewing channels on YouTube: **Creator Hero**, **Think Media**, **Pat Flynn / Smart Passive Income**, **Income School**, **Charli Prangley**, **Matt Giovanisci**.
- Substack writers: **Ollie Forsyth (New Economies)** — Creator Economy Report annual inclusion. **Publish Press**.

**Tier C — Polish market (priority 2, EU wedge):**

- **Michał Sadowski** (Brand24 founder, 300k+ YT) — SaaS for creators angle.
- **Maciej Gałecki** (marketing content, 50k+ YT).
- **Kamil Porembiński** (podcast host, indie SaaS angle).
- **Niezgodka** (Polish-language creator-econ newsletter, growing).
- **Polish IG creators** — look for handles with >10k followers + linktr.ee/X in bio, in NICHE == photography / fitness / bookish / food / travel. We'll use our own Track A scraping infrastructure to surface them.

**Tier D — Vertical-niche creators (priority 3, scale):**

From `marketing-pitch-angles.md` Angle 8:
- **Photographers:** Pixieset blog + 20 photographer Instagram micros.
- **Newsletter creators:** beehiiv bloggers + Kit community voices.
- **Coaches:** The Leap, Teachable community, Kajabi forum influencers.
- **Musicians:** Biotree community + NotNoise coverage.
- **Real estate:** handful of niche RE content creators.

**Target list:** 50 creators in the first 90 days. Budget mix below.

### 4.3 Commercial models

1. **Free Pro-for-life + 50% affiliate for 12 months** — cost = $0 cash. Works with 80% of nano, 40% of micro. Scale: 20 creators × 0 = $0 cash commitment.
2. **Sponsored post — one-off** — flat $500-$5k per micro, $10-25k per mid. Predictable output.
3. **Affiliate + bonus** — 30% recurring (tadaify Amplify baseline per `marketing-affiliate-programs.md`) + first-10-referrals bonus 50%. Cost scales with performance.
4. **Equity for reach** — 0.1-0.5% equity to a Tier-1 creator for 12-month audience commitment. Rare. Reserve for 1-2 true tier-1 creators.
5. **"tadaify for Creators" ambassador program** — 10 named creators get "tadaify Ambassador" badge + co-marketing + $500/mo retainer + 50% affiliate bonus. Cost: $5k/mo for a 10-ambassador program.

### 4.4 Recommended blend for tadaify launch

**Week 1-4 (bootstrap, $0-2k):**

- Recruit 20 nano creators (1k-10k followers) via Track A-style outreach: "free Pro + 50% affiliate for 12 months if you post once in the first 30 days".
- Send each: custom tadaify page pre-built, invitation, press kit.
- Expected: 10-12 posts, aggregate ~500k impressions, ~50-200 signups.
- **Cost: ~$200 for gift boxes / tadaify merch for top 5.**

**Week 4-12 (seed, $10-20k):**

- Add 5-10 micro creators (10k-100k followers) at $500-2k each for one sponsored post + affiliate. Mix niches: 2 newsletter, 2 photography, 2 coaching, 2 fitness, 2 polish-market.
- 3 mid-tier sponsored posts at $3-10k each — pick ONE creator-tool reviewer (e.g. Creator Hero), ONE solopreneur (Justin Welsh or similar), ONE PL market (Michał Sadowski).
- **Cost: ~$30-50k across 90 days.**

**Week 12-24 (scale, $50k+):**

- 1-2 Tier-2 YouTuber dedicated reviews ($10-25k each) — Jay Clouse, Adam Connell video, or a Think Media segment.
- **Cost: ~$50k across months 3-6.**

### 4.5 Campaign tracking + measurement

**URL structure:** `tadaify.com/go/<creator-slug>` — short vanity links per creator.
- Redirects to `tadaify.com/?ref=<creator-slug>&utm_source=<channel>&utm_campaign=<slug>`
- Referral captured via cookie + passed to Stripe on conversion
- Creator sees live dashboard: clicks, signups, paid conversions, MRR attributed, lifetime $ earned

**Stripe + affiliate integration:**
- Use `Rewardful` or `Tolt` or `FirstPromoter` for affiliate program infrastructure. Tolt is cheapest at $99/mo + 3% of tracked revenue, Rewardful is $49-149/mo, FirstPromoter is $49-149/mo.
- **Recommendation: Rewardful** ($49/mo Starter). Tight Stripe integration, good UX, used by most tier-1 SaaS affiliates.

**Attribution window:** 90 days cookie, then lifetime recurring on referred subscription.

**Dashboard:** creators access at `tadaify.com/partners/<slug>` — see clicks, signups, MRR, payouts. Single pain-point Stan solved well, we must match.

---

## 5. Track D — Product Hunt + Hacker News + Indie Hackers

### 5.1 Product Hunt strategy

**Per 2026 PH playbook research** (dev.to/iris1031 "30x #1 winner", blazonagency.com, smollaunch.com — verified 2026-04-24):

**When to launch:**
- **Tuesday or Wednesday** at **12:01 AM PST** (09:01 CET / 10:01 CEST).
- First 4-6 hours are algorithmically weighted heavily.
- Avoid Monday (back-to-work noise), Friday (low engagement), weekends.

**Upvote targets:**
- Winners typically have **500-800+ upvotes** by end of day.
- First hour target: **150-200** (algorithm sets initial ranking).
- Throughout day: **25-50/hour** sustained.
- **Quality matters more than raw count** — PH weights upvotes from established users ~10x higher than new accounts.

**Hunter choice:**
- In 2025-2026, **PH reduced the weight of top hunters**. Self-hunting is usually fine if your own network is strong.
- If founder's network is <500 Twitter followers: hire a tier-2 hunter ($500-1,500) — tier-1 hunters like Chris Messina are $2-5k and don't move the needle as much as they used to.
- **Recommendation: self-hunt** — save the $2k, invest in pre-launch waitlist.

**Pre-launch (4-6 weeks):**
- Build a waitlist of 500-1,000 engaged supporters via Twitter + IG + mailing list.
- Use **Waitlister.me** or similar ($0-99) to collect + auto-remind.
- Tease product on Twitter weekly (show the preview tool, show the brand, show MRR).
- Reach out to 20-30 PH power users who engage with creator-tool launches — ask politely for a launch-day support pledge.
- Prepare assets:
  - 1-sentence positioning
  - 5-10 high-quality screenshots (desktop + mobile, light + dark)
  - 30-60s demo video (critical — products without video underperform by ~30%)
  - Founder's 400-word story
  - 5-10 prepared comment responses to common questions

**Launch day:**
- Submit at 12:01 AM PST exactly.
- Post in founder's Twitter immediately.
- Email waitlist at 8 AM PST with "we're live" reminder.
- Respond to EVERY comment within 10 minutes for first 4 hours, within 30 minutes for rest of day.
- DO NOT directly ask for upvotes (PH ToS violation) — ask for "feedback" / "your honest reaction".
- Track live: aim for 200+ upvotes + 30+ comments in first 6 hours.

**Expected outcomes by rank:**
- **#1 Product of the Day**: 5k-20k signups (first 7 days), 50-500 paying conversions, featured in PH weekly digest.
- **#2-5**: 1k-5k signups, 10-100 paying.
- **#6-10**: 500-2k signups, 5-50 paying.
- **Unranked**: 100-500 signups, still useful as DR backlink + brand signal.

**Post-launch week (critical, often ignored):**
- 70% of long-term value is captured in the week after launch.
- Follow-up email to signups within 24h.
- Personal DM to top 50 commenters thanking them.
- Cross-post to IH + HN + Reddit (next sections).
- Pitch journalists who saw the launch (Marketing Brew, Amanda Silberling at TechCrunch) with "we launched and here's what we learned" angle.

### 5.2 Hacker News strategy

**Day:** Wednesday or Thursday, 08:00-10:00 PT.
**Post type:** `Show HN: Tadaify — [concrete technical angle]`

**What works on HN for SaaS launches:**
- Technical depth > marketing copy. Lean into: the Supabase vs DynamoDB analysis (from infra-cost-analysis.md), the CloudFront SaaS Manager custom-domain research, the 78-pattern competitor audit, the open-source bits (preview-generator parser framework).
- Transparency: public roadmap, public pricing math, public cost breakdowns.
- Real problem statement: "Linktree users don't know their paid tier costs them 2-4x what tadaify Pro does, here's the math."

**What fails on HN:**
- "Revolutionary" / "disrupting" / "game-changing".
- Influencer-voice marketing copy.
- Thin product-hype without substance.

**Post format (recommended):**

> Show HN: Tadaify — A link-in-bio we built in 6 weeks on Supabase after reading 78 competitor patterns
>
> We spent 2 weeks auditing 10 link-in-bio competitors (Stan, Linktree, Beacons, Carrd, Bio.link, Lnk.bio, Taplink, Later, Campsite, Milkshake) and catalogued 78 UX + feature patterns before writing a single line of code. Findings are public: [link to competitor audit].
>
> The preview tool is the part I'm proudest of — paste any `linktr.ee/<handle>`, `beacons.ai/<handle>`, or `bio.link/<handle>` URL and tadaify renders it on our design system in 2-5s. No signup needed. The parser framework is open source: [github link].
>
> Pricing: Free plan has everything unlocked (custom themes, 365-day analytics, scheduling, email capture, 0% commerce fees). Creator $5/mo adds 1 custom domain. Pro $15/mo adds A/B testing, cohort analytics, API + webhooks, email automations. Business $49/mo adds white-label + sub-accounts. Custom domain is $5/mo via Creator (vs Linktree's $12/mo Pro required for the same, Beacons' $30/mo Creator Plus).
>
> Happy to answer any technical questions — stack is Vite + React + Supabase + Cloudflare Workers + Stripe Connect.

**Engagement:** reply to every top-level comment within 30 min for first 2 hours. Stay polite even when someone flags design nitpicks — HN rewards humility.

**Expected outcome:**
- Front page (20+ upvotes in first hour): 5k-20k visitors, 200-1k signups.
- Off front page: 500-2k visitors, 20-100 signups.

### 5.3 Indie Hackers strategy

**Pre-launch (weeks -8 to -1):**
- Founder writes weekly "what I'm building" posts on IH.
- Share small wins (preview-tool shipped, 10 waitlist signups, first paying user).
- Build ~500 followers on IH before launch.

**Launch day post (Thursday after PH + HN):**

> Launched tadaify today — link-in-bio targeted at Linktree's 50M users (here's how)
>
> Quick recap: 6 weeks ago I started tadaify, a link-in-bio that ships with 0% commerce fees + preview-generator that imports from Linktree. Launched on PH Tuesday (#2 of day, 1.2k upvotes), HN Wednesday (front page for 6h, 800 upvotes).
>
> Current numbers:
> - 47 paying users ($350–$700 MRR — Creator/Pro mix)
> - 2,400 free signups
> - 18k preview generations (80% never signed up, but 500 did)
>
> Here's what worked, what didn't, and what I wish I'd done differently... [full breakdown]

**Monthly MRR transparency post:**
- Post revenue/churn/growth numbers monthly to IH.
- Build the "tadaify journey" log that compounds into a Starter Story feature later.

### 5.4 Coordinated launch wave — full timeline

| Day | Action |
|---|---|
| **-60** | Start Twitter/X build-in-public cadence |
| **-45** | Start IH weekly posts |
| **-30** | Ship public waitlist page with preview-tool demo |
| **-14** | Seed 10 trusted beta creators, collect 500 waitlist |
| **-7** | Private beta for waitlist, collect testimonials, send preview URLs to 500 waitlist |
| **-2** | Launch assets final: PH post, HN draft, IH draft, 10 screenshots, 60s demo video |
| **Day 0 (Tue)** | **PH launch at 12:01 AM PST** — full PH day engagement |
| **Day +1 (Wed)** | **HN Show HN at 09:00 PT** — engage all day |
| **Day +2 (Thu)** | **IH milestone post + Reddit (r/SideProject + r/SaaS)** |
| **Day +3 (Fri)** | BetaList, Product Hunt newsletter pitches, Starter Story pitch |
| **Week +1** | Tier-1 PR pitches (Amanda Silberling, Marketing Brew, Ollie Forsyth's newsletter) |
| **Week +2** | Tier-2 blog pitches via `marketing-pitch-angles.md` Angle 1 (mockup-first) + Angle 7 (0% fees) |
| **Week +4** | Track A scale-up (from manual to tooled outreach) |
| **Week +8** | Influencer wave 2 (paid mid creators) |
| **Week +12** | First public MRR transparency post on IH, pitch podcasts |

---

## 6. Track E — SEO + content (baseline)

**Already well-specified in `marketing-seo-keyword-map.md`. Not duplicated here.**

### 6.1 The 6-month plan (condensed from source file)

**Month 1-2:**
- Ship 11 `tadaify.com/vs/<competitor>` pages for ownable-now pair queries: bio.link-vs-lnk.bio, linktree-vs-campsite, bio.link-vs-carrd, beacons-vs-bio.link, stan-vs-carrd, stan-vs-bio.link, campsite-vs-carrd, milkshake-vs-stan, taplink-vs-stan, later-vs-stan, buffer-start-vs-linktree.
- Each page: PAA-mirrored sub-headings, comparison table, honest pros/cons, updated pricing.
- Internal linking web between all 11.

**Month 2-4:**
- Pitch Site Builder Report, Adam Connell, Jotform, Zapier for "Linktree alternatives" refresh inclusion.
- Seed G2 + Capterra with 15 reviews via early users ($10 Amazon gift card incentive).
- Submit to SaaS directories: Product Hunt Goldies, BetaList, Launching Next, SaaSHub.

**Month 4-6:**
- 5 niche vertical landing pages: `tadaify.com/for/photographers`, `/for/newsletters`, `/for/coaches`, `/for/real-estate`, `/for/musicians`.
- Each page: niche-specific templates + 3-5 public-creator examples + guest-post placement on niche-blog (Pixieset, beehiiv, Kajabi, Biotree).
- Start monthly roundup blog: "What's new in link-in-bio — [month 2026]".

**Month 6+:**
- Open template gallery + creator directory for SEO long-tail.
- Re-audit vs-page rankings; double down on top-5 via backlink building.

### 6.2 Volume expectation

- Month 1-3: 0-500 organic signups.
- Month 4-6: 500-2,000.
- Month 7-12: 2k-10k/mo compounding.
- Month 12+: 10k-50k/mo if content discipline holds.

**Do not expect SEO to materially drive launch-quarter revenue.** It's infrastructure, not an engine.

---

## 7. Track F — Social media brand presence

### 7.1 Platform priority

| Platform | Priority | Why | Content cadence |
|---|---|---|---|
| **Twitter/X** | P0 | Primary PH pre-launch audience. Founder voice. Daily build-in-public. | 3-5 tweets/day (founder) + 1-2/day (brand) |
| **Instagram** | P0 | Visual brand credibility. Showcase creator pages. | 3 posts/week + 5-7 Stories/week |
| **TikTok** | P1 | Highest growth potential. 30-60s "what's new on tadaify" clips. | 2-3 videos/week |
| **LinkedIn** | P2 | Founder-only. B2B / agency acquisition pathway later. | 1-2 posts/week (founder) |
| **YouTube** | P2 | Long-form tutorials. Slow build, highest LTV. | 1 video/month minimum |
| **Discord** | P0 | Build tadaify creator community. 100 creators in Slack/Discord within month 1 = massive iteration advantage. | 24/7 presence |
| **Threads** | P3 | Underweight for now. Handle reserved, light repost of X. | 1-2 reposts/day |
| **Bluesky** | P3 | Same as Threads. Handle reserved only. | Daily repost |
| **Reddit** | P1 | r/SideProject, r/SaaS, r/CreatorsAdvice. Value-add posts only, never spam. | 1-2 posts/week |

### 7.2 Handle reservation checklist (IMMEDIATE action — week -12)

Reserve `@tadaify` on every platform listed below. Run all within 48 hours. Takes ~3 hours total.

| Platform | Handle | Status to verify |
|---|---|---|
| Twitter/X | @tadaify | Check availability |
| Instagram | @tadaify | Check availability |
| TikTok | @tadaify | Check availability |
| YouTube | @tadaify | Check availability |
| LinkedIn company page | /company/tadaify | Claim |
| LinkedIn personal | founder handle | Existing |
| GitHub org | `tadaify` | Claim |
| Reddit | u/tadaify | Claim |
| Threads | @tadaify | Auto-inherits from IG |
| Pinterest | @tadaify | Check |
| Mastodon | @tadaify@mastodon.social | Check |
| Bluesky | @tadaify.bsky.social | Claim |
| Discord | server name "tadaify" | Create |
| Telegram | @tadaify | Check |
| Product Hunt | tadaify | Create maker account |
| IndieHackers | @tadaify | Create |
| BetaList | tadaify | Create |
| HackerNews | `tadaify` (founder handle) | Existing or create |

**Backup handles** (in case primary is taken):
- `@tadaifyhq`, `@tadaify_com`, `@tadaify_app`, `@trytadaify`, `@getdatadaify`, `@tada_ify`

**Domain squatting check** (WebFetch each, week -12):
- `tadaify.com` — **owned (user confirmed)**
- `tadaify.app` — verify
- `tadaify.co` — verify
- `tadaify.io` — verify
- `tadaify.design` — verify (brand angle)
- `ta-da.ify.com` — verify
- `tada.ify.com` — verify
- `tadaify.pl` — verify (PL market)
- `tadaify.eu` — verify (EU wedge)

Recommendation: acquire `tadaify.app`, `tadaify.pl`, `tadaify.eu` (~$20/yr total) for brand protection. Skip others.

### 7.3 Content cadence — concrete

**Pre-launch (week -8 to -1):**

- **3 tweets/day from founder:** build-in-public (1 technical detail, 1 founder reflection, 1 product demo/screenshot)
- **1-2 tweets/day from brand account:** amplify founder, RT relevant creator-economy news, engage with target creators' tweets
- **3 IG posts/week:** product-screenshot-based, brand-aesthetic-aligned (Indigo Serif + `tada!ify` wordmark)
- **5-7 IG Stories/week:** behind-the-scenes, polls, countdown to launch
- **1 TikTok/week:** 30-60s founder talking head + product demo
- **1 YouTube/month:** long-form "how I built tadaify in 6 weeks" kind of narrative
- **1-2 blog posts/week:** vs-page content (SEO Track E)
- **Daily Discord engagement:** welcome messages, answer questions, preview upcoming features

**Post-launch (week 0+):**

- **5 tweets/day** (founder + brand blended)
- **Daily IG Story**
- **3 TikTok/week**
- **2 YouTube/month**
- **2 blog/week**
- **Monthly MRR transparency post on IH + Twitter thread**

### 7.4 Creator community Discord (P0)

Target: 100 active creators within month 1, 500 by month 3.

Channels:
- `#welcome` — onboarding
- `#show-off` — creators share their tadaify pages
- `#feedback` — bug reports + feature requests (roadmap items get thumbs-up voting)
- `#tips` — creator-to-creator advice
- `#seo-&-traffic` — growth techniques shared
- `#founder-ama` — weekly Thursday AMA with founder (1hr)
- `#changelog` — shipped features announced
- `#memes` — brand culture

**Growth mechanism:** every new user who upgrades to Pro gets an invite link to "tadaify Early Access" Discord. Access is a perk, not a chore. Keeps signal density high.

---

## 8. Week-by-week launch timeline (20 weeks: -8 to +12)

| Week | Phase | Objectives | Activities | KPI target | Budget spend | Owner |
|---|---|---|---|---|---|---|
| **-12** | Foundation | Brand + handles secured; stack finalised | Reserve all social handles; buy backup domains ($30); scaffold -app repo | 100% handles claimed | $30 | founder |
| **-8** | Pre-launch | Social seeded; waitlist live | Start Twitter build-in-public (3/day); launch waitlist page; preview-tool eng kickoff | 100 Twitter followers; 50 waitlist | $0 | founder |
| **-6** | Pre-launch | Preview-tool ships (v0) | Complete Linktree parser (F-PREVIEW-003) + preview renderer + slug management (F-PREVIEW-004); stand up `/admin/marketing/preview-generator` UI skeleton (F-PREVIEW-001) | Admin can generate 5 preview URLs from linktr.ee handles end-to-end | $0 (eng time) | Sonnet agent + founder |
| **-4** | Pre-launch | Preview-tool v1 complete | Admin UI + customisation engine + hash-based referral inheritance complete (F-PREVIEW-001..007); admin dashboard live (F-PREVIEW-006); private beta: admin hand-crafts 20 previews, DMs target creators | 20 previews generated; 5 beta signups via `?ref=<hash>`; onboarding inheritance confirmed | $200 (beta-user gifts) | agent |
| **-3** | Pre-launch | Waitlist scales | Pitch 10 creator-economy newsletter writers (seed buzz); run 100 manual DMs/day ( warmup phase) | 300 waitlist; 500 previews | $500 (Modash trial, 1 VA week) | founder + 1 VA |
| **-2** | Launch prep | Assets final | PH post draft; HN draft; IH draft; 10 screenshots; 60s demo video; 50 commenter outreach | 500 waitlist; launch assets approved | $200 (video editing) | founder |
| **-1** | Launch imminent | Last-mile | PH hunt scheduled; email to waitlist teasing launch day; Twitter countdown | 1000 waitlist; pre-launch buzz | $0 | founder |
| **0 (Tue)** | **PH LAUNCH** | #1-5 of day | PH submit 12:01 AM PST; respond to every comment; coordinate waitlist pings | 500+ upvotes; 5k visitors | $500 (hunter + PH Pro) | founder (all day) |
| **0 (Wed)** | HN LAUNCH | HN front page | Show HN at 09:00 PT; engage all day | 200+ upvotes | $0 | founder |
| **0 (Thu)** | IH LAUNCH + Reddit | Community amplify | IH milestone + r/SideProject + r/SaaS posts | 200 IH upvotes | $0 | founder |
| **+1** | Post-launch | Convert the spike | Email all signups (onboarding); Tier-1 PR pitches (Amanda, Marketing Brew, IMH, Ollie) | 2k signups cumulative; 20 paying | $500 (email infra) | founder |
| **+2** | Track A ramp + M+0.5 | Outreach scales + parsers expand | Admin generating 20–30 hand-crafted previews/day targeting Linktree creators; M+0.5: Beacons/Stan/Bio.link parsers ship (F-PREVIEW-010..012) — admin preview scope expands to those pools in week +3 | 200 previews generated; 20–50 DMs sent by admin (quality over volume); M+0.5 parsers deployed | $700 (Modash + Apollo + VA) | 2 VAs + founder + Sonnet agent |
| **+3** | Track A scale | Volume up | 1000 DMs/day across 5 IG accounts; cold email stack live with 7 warmed domains; Instantly Hypergrowth activated | 5000 touches; 100 replies; 20 new paying | $1,200 | 2 VAs + founder |
| **+4** | Track C starts | Influencers onboarded | 20 nano creators sign "free Pro + 50% affiliate" agreement; press kit + 1-on-1 calls | 10 influencer posts live | $500 (gifts + coffee) | founder |
| **+5** | Track C | First mid paid | 2 micro-creator sponsored posts go live | 1M impressions from influencers | $3,000 | founder + creators |
| **+6** | Multi-channel | Full stack running | Track A = 2000 touches/day across Linktree + Beacons + Stan pools (all parsers live); SEO vs-pages published | 5k total signups; 100 paying; ~$750–$1,500 MRR | $2,000 | team of 4 |
| **+8** | Scale-up | Mid creator push | 3 mid-tier creators paid ($3-10k each); 5 new niche landing pages live | 8k total signups; 200 paying; ~$1,500–$3,000 MRR | $15,000 | team |
| **+10** | Scale-up | Press secondary | Secondary press pitches (Zapier refresh, SBR re-test, Creator Science podcast) | 10k signups; 300 paying; ~$2,250–$4,500 MRR | $1,000 (pitches) | founder |
| **+12** | Milestone | 90-day report | Public MRR post on IH + Twitter thread; retrospective; plan weeks +13-24 | 12k signups; 400 paying; ~$3,000–$6,000 MRR | $500 | founder |

**Cumulative 90-day budget: ~$26,000** (Seed scenario).

---

## 9. Budget scenarios

**Note (DEC-MKT-C):** All budget scenarios below reflect EN-only content. PL-language VA time, PL content contractor hours, and PL-specific outreach collateral are removed. The EU/PL payment feature-mix (Przelewy24, BLIK, SEPA) is not affected — those are regional payment infrastructure, not marketing content. PL-language outreach templates are deferred to Y2+ pending organic PL user pull.

### 9.1 Bootstrap — $5k total first 90 days

| Line item | 90-day spend |
|---|---|
| Domains + handles | $50 |
| Modash 3 months | $450 |
| Apollo + Hunter + Clearout | $430 |
| Instantly Hypergrowth | $291 |
| 1 VA part-time (20h/wk) | $1,800 |
| PH launch (self-hunt, PH Pro optional) | $100 |
| Video production (60s demo) | $300 |
| Nano creator gifts ($10-30 × 20) | $400 |
| Misc tooling (Rewardful affiliate, Waitlister, Canva) | $500 |
| Dev tools + CDN | $200 |
| Buffer | $479 |
| **TOTAL** | **$5,000** |

**Expected 90-day outputs:**
- Signups: 2,400
- Paying: ~120
- MRR at day 90: ~$900–$1,800 (Creator $5 + Pro $15 mix; assumes 60% Creator, 40% Pro)
- CAC: ~$42/paying

**Best for:** solo founder with 60-80 hrs/week available. Very aggressive execution on Tracks A + B. Track C = free-only (nano + affiliate).

### 9.2 Seed — $30k total first 90 days

| Line item | 90-day spend |
|---|---|
| Domains + handles | $50 |
| Modash Pro | $900 |
| Apollo Professional 3 mo | $237 |
| Hunter.io Growth | $150 |
| Instantly Hypergrowth | $291 |
| 2 VAs full-time | $9,000 |
| PH launch (tier-2 hunter + Pro) | $1,500 |
| Video (60s + 2m tutorials) | $1,000 |
| Nano creator program | $1,000 |
| Micro creator sponsored posts (5 × $1,000 avg) | $5,000 |
| Mid creator (1 × $5k) | $5,000 |
| Newsletter sponsorships (2 × $500) | $1,000 |
| Rewardful + tooling | $500 |
| Content contractor (4 blog posts) | $2,000 |
| Paid pilot ads (Google + Meta) | $1,500 |
| Buffer | $872 |
| **TOTAL** | **$30,000** |

**Expected 90-day outputs:**
- Signups: 6,200
- Paying: ~310
- MRR at day 90: ~$2,325–$4,650 (Creator $5 + Pro $15 mix)
- CAC: ~$97/paying

**Best for:** user (or 2-person team) with Angel/Seed round secured. Balance of organic + paid channels.

### 9.3 Well-funded — $150k total first 90 days

| Line item | 90-day spend |
|---|---|
| Domains + handles | $50 |
| Modash Pro + HypeAuditor | $3,000 |
| Apollo Professional + Hunter Scale | $800 |
| Instantly Light Speed (full cold-email stack) | $1,074 |
| 4 VAs full-time | $18,000 |
| Full-time marketing hire (1 person × 90 days) | $30,000 |
| PH launch (tier-1 hunter if network weak + ads + Pro) | $5,000 |
| Professional video (PH video + 5 tutorials) | $5,000 |
| Nano creator program (50 creators) | $2,000 |
| Micro creator sponsored posts (15 × $2k) | $30,000 |
| Mid creator sponsored posts (3 × $10k) | $30,000 |
| 1 Tier-2 YouTuber dedicated review | $20,000 |
| Rewardful + full GTM tooling stack | $1,500 |
| Content contractor (12 blog + 5 niche landing pages) | $6,000 |
| Paid ads (Google + Meta + TikTok Ads) | $5,000 |
| PR agency 3 months (retainer) | $15,000 |
| Conference / event sponsorships (1 small) | $3,000 |
| Buffer | $576 |
| **TOTAL** | **$150,000** |

**Expected 90-day outputs:**
- Signups: 14,000
- Paying: ~700
- MRR at day 90: ~$5,250–$10,500 (Creator $5 + Pro $15 mix)
- CAC: ~$214/paying

**Best for:** user has Series A-ish runway. Maximum aggression. PR agency drives tier-1 coverage simultaneously.

**Note:** well-funded CAC is higher per-paying than bootstrap because paid channels cost more per conversion. But absolute signup and MRR numbers are ~5x higher. Trade-off is capital vs. time.

### 9.4 Budget scenario decision matrix

| Your situation | Recommended scenario |
|---|---|
| Solo founder, 60+ hrs/week, runway 6+ months | **Bootstrap** |
| 2-person team, angel round secured ($50-200k), runway 12 months | **Seed** |
| Funded ($1M+), full marketing hire available | **Well-funded** |
| Unsure | **Start Bootstrap, escalate to Seed at week 4 if outreach is working** |

---

## 10. KPIs + measurement

### 10.1 Weekly dashboard (tracked every Monday)

| KPI | Target (week 4) | Target (week 8) | Target (week 12) |
|---|---|---|---|
| Signups / week | 100 | 500 | 1,000 |
| Free → Pro conversion | 3% | 4% | 5% |
| Paying users added / week | 3 | 20 | 50 |
| Track A touches / week | 500 | 5,000 | 10,000 |
| Track A reply rate | 10% (high personalisation) | 6% | 4% (dilution at scale) |
| Track A conversion rate | 1.5% | 1% | 0.7% |
| Track B admin previews generated / week | 50 | 200 | 500 |
| Track B signup rate (preview → signup within 7d via hash) | 3-10% | 3-10% | 3-10% |
| Track B signup quality (hash-inherited onboarding → D1 activation) | n/a baseline | track | compare vs standard signup |
| Track C influencer content live | 3 pieces | 10 pieces | 20 pieces |
| Track D PH/HN cumulative signups | 2,000 | 2,500 | 3,000 |
| Track E organic SEO signups / week | 10 | 50 | 150 |
| MRR | $100–$200 | $500–$1,500 | $2,000–$6,000 |
| CAC (blended) | $40 | $60 | $80 |
| LTV:CAC ratio (projected) | 3:1 | 4:1 | 5:1 |

### 10.2 Quarterly LTV audit (tracked monthly thereafter)

- Actual Pro retention at month 3, 6, 12
- Actual ARPU growth (Pro → Business upgrades)
- Actual gross margin (per `infra-cost-analysis.md` §1 — target 90%+ at 10k+ MAU)

### 10.3 Channel-attribution model

- **First-touch** (how did you hear about tadaify?) — single-value capture at signup
- **Last-touch** (which UTM brought you to the sign-up form?) — auto via GA4 + first-party cookie
- **Multi-touch** — GA4 + Segment + Rewardful composite attribution (post month 3)

### 10.4 Admin preview-tool-specific metrics (Track B)

- Admin previews generated / week (measure admin outreach throughput)
- Unique creators previewed / week
- Preview → signup rate via hash (within 7 days) — target 3-10%
- Outreach log: channel breakdown (IG DM / email / LinkedIn) per preview
- Hash-inherited onboarding → D1 activation rate vs standard signup D1 activation (quality signal)
- Admin time-per-preview (5min target; if >15min → UX improvement needed in customization panel)
- Conversion attribution: which admin DM template variant drove the best signup rate

---

## 11. Compliance + legal

### 11.1 GDPR (EU outreach)

- **Marketing language (DEC-MKT-C):** EN-only marketing at launch. GDPR disclosure language (opt-out notices, consent notices, data-subject request responses) defaults to EN. PL-language GDPR copies are deferred to Y2+ pending organic PL pull.
- **Legal basis:** legitimate interest (Art 6(1)(f)) for B2B outreach to business/creator accounts with documented balancing test
- **Data retention:** handle + email + outreach-log retained 18 months post last contact; purged on unsubscribe within 30 days
- **Right of objection:** one-click unsubscribe in every outreach + permanent suppression list
- **Processing transparency:** "we found your public handle via Google / Modash" disclosed on request
- **Sub-processors:** Apollo, Hunter, Modash, Instantly — all publish GDPR DPAs; signed + filed before first send
- **Controller vs processor:** tadaify is controller; all tools are processors; BSA/DPA on file

### 11.2 CAN-SPAM (US)

- Physical postal address in every email footer
- Unsubscribe within 10 business days
- No misleading subject or sender name
- "This is commercial email from tadaify" disclosed near subject (not required but reduces complaint rate)

### 11.3 CASL (Canada)

- Implicit consent only for 6 months after established business relationship
- Express consent required for ongoing — CA recipients get narrower funnel (1 email only, then opt-in gate)

### 11.4 DSA (EU) + Instagram ToS

- IG DM volume capped at 80/day/account (under 100 shadowban threshold)
- Every message varies via 3+ template mutations (no verbatim repeats)
- Human-like timing (300-600s jitter)
- Rotate across 10-20 warm accounts
- No automated DM tools that bypass Meta Business API (zero Phantombuster)

### 11.5 Affiliate FTC disclosure

- All creators promoting tadaify under affiliate program MUST disclose "#ad" / "#sponsored" or equivalent per FTC rules
- tadaify ToS for creators requires disclosure; our compliance team audits top-20 creator posts quarterly

### 11.6 Preview-tool safeguards

**Architecture note (DEC-MKT-B-v2 LOCKED):** Preview-generator is an **admin-only private tool** — no public endpoint, no auto-generated public pages. All previews are created manually by admin via `/admin/marketing/preview-generator`. This near-eliminates public legal exposure and removes the "tadaify generates thousands of pages about creators without consent" narrative.

- Preview pages (`preview.tadaify.com/<slug>`) are private URLs, not indexed (`noindex, nofollow`); URL is non-guessable (slug = random token when handle is ambiguous)
- Preview pages disclaim: "This is a hand-crafted preview designed by the tadaify team. [Creator handle] has not endorsed tadaify. Sign up → this becomes your actual page."
- Admin suppression list: if a creator explicitly asks to be removed, their handle is blocked from future preview generation and all existing previews for that handle are unpublished
- Never claim or imply creator endorses tadaify until they explicitly sign up and publish their page
- No Linktree logos or trademarked visuals rendered in preview; only the creator's own public content (bio, links, avatar) re-styled in tadaify's design system
- Preview expiry: 90-day default; admin can extend per-preview (7/30/90/365/unlimited)

---

## 12. Risks + mitigation

| # | Risk | Probability | Impact | Mitigation |
|---|---|---|---|---|
| 1 | Linktree legal C&D on preview tool | **Very Low** | Low (narrow admin exposure) | Admin-only model (DEC-MKT-B-v2): no public endpoint, no auto-generated pages at scale. URL `preview.tadaify.com/<slug>` — non-guessable, `noindex, nofollow`, shared privately by admin only. Near-zero public legal exposure. Disclaimer on preview page. Admin suppression list (handle blocked on request). Linktree logo NOT used. If C&D received: Linktree parser disabled in <1h (KV flag), previews unpublished; admin workflow continues with M+0.5 parsers (Beacons/Stan/Bio.link). |
| 2 | Instagram bans outreach accounts | Medium-High | Medium (requires rebuild) | 10-20 warm accounts; 80 DMs/day ceiling per account; human-like jitter; rotate across team; don't use single primary brand account for outreach |
| 3 | Product Hunt flop (no top-5 rank) | Medium | Low | Pre-launch waitlist of 500+; wave to HN + IH the next day to rebuild signal; minimum acceptable = front page for 4 hours |
| 4 | GDPR complaint / regulator letter | Low | High (financial) | Document legitimate-interest basis; unsubscribe rate <2%; complaint handling SLA <5 business days; DPO contact published |
| 5 | Cold-email domain blacklisting | Medium | Medium (deliverability crash) | 7+ warmed domains; daily Instantly warmup; bounce rate <3%; complaint rate <0.1% |
| 6 | Influencer ghosts the deal after payment | Medium | Low-Medium (limited) | Contract with milestone-based payment (50% upfront, 50% on post-publish); metrics-based clawback if <50% of contracted views |
| 7 | Competitor copies preview-generator | High (inevitable) | Low (brand-first-mover) | Admin-tool model is harder to copy at scale — it's a manual human workflow, not a public API. Moat = quality of the hand-crafted experience + speed of outreach iteration + hash-based onboarding inheritance (seamless signup flow). First-mover on Linktree at MVP then Beacons/Stan at M+0.5 parsers (F-PREVIEW-010..012). |
| 8 | First 100 paying users churn at high rate | Medium | Medium (cohort loss) | Commerce-gating means paid users self-select; weekly founder-onboarding call for first 100; rapid support <12h first-month |
| 9 | Linktree competitive response (price drop) | Medium | Low | Our wedge is EU + 0% fees + commerce-depth + preview; price war favors smaller player (lower opex); weather 3 months |
| 10 | Founder burnout (20+ weeks intense) | High | High | Week 4 VA onboarded; week 8 marketing contractor; week 12 optional full-time hire (Seed / Well-funded scenario) |

---

## 13. Recommended decision-gates (for user before execution)

Below are the 5 highest-impact open questions. User answers determine downstream execution.

### DEC-MKT-A — Outreach volume ceiling

- Czego dotyczy: legal + ethical cap on daily cold outreach
- Szczegolowy opis: Aggressive outreach works but has ethical and legal ceilings. Our maximum sustainable volume is 3,000-10,000 touches/mo before IG bans / GDPR complaints / brand damage. The user's ethical preference + risk tolerance sets the ceiling.
- Opcje:
  1. Conservative — max 3,000 touches/mo, high personalisation, 5-10% reply rate
  2. Aggressive — max 10,000 touches/mo, balanced, 3-5% reply rate
  3. Maximum — max 30,000 touches/mo, full automation + VA army, 1-2% reply rate, 5x ban risk
- Rekomendacja: **Option 2 (Aggressive).** Best ROI with manageable risk. Option 3 adds linear cost but sub-linear returns AND burns brand faster than replies can compound.

### DEC-MKT-B — Preview-tool architecture

- **LOCKED (DEC-MKT-B-v2, 2026-04-24):** Admin-only private sales tool. No public endpoint. No auto-generated pages at scale.
- Architecture: `/admin/marketing/preview-generator` — admin pastes target's URL, customises theme/layout/CTA/palette in split-view editor, generates `preview.tadaify.com/<slug>?ref=<hash>` URL, copies DM copy, sends privately to creator.
- Previous options (Aggressive / Moderate / Safe public-endpoint models) are all superseded by this decision. The admin-tool model delivers 10× conversion vs any public-endpoint variant while near-eliminating legal risk.
- Additional lock: DEC-Q5-C = Linktree-only at MVP. Beacons/Stan/Bio.link parsers at M+0.5 (F-PREVIEW-010..012, week +2 post-launch).

### DEC-Q5-C — Preview-tool platform scope at MVP

- **LOCKED (2026-04-24):** Linktree-only at MVP launch. Rationale: 70M+ user base (largest pool), most stable SSR HTML (`data-testid` anchors, 2+ year track record), highest pain-point in reviews (aggressive upsell). Beacons, Stan, Bio.link deferred to M+0.5 (week +2 post-launch) as `F-PREVIEW-010..012`. Carrd and smaller platforms defer to Y1.

### DEC-MKT-C — Polish-market split

- **LOCKED (2026-04-24): EN-only marketing at launch.** All marketing content, outreach templates, landing copy, pricing copy, blog posts, onboarding text → EN only. No PL versions. PL outreach templates that were drafted in §2.3 (DM-IG-PL #1/2/3, Cold email PL #1) are removed per this decision.
- **What is NOT affected:** Payment method features (Przelewy24, BLIK, SEPA) — regional payment infrastructure, not a language choice; stays in the product feature-mix for EU creators using the EN UI. EU VAT handling (Stripe Tax) — regulatory, not language.
- **PL strategy:** deferred to Y2+ pending organic PL user pull. If PL signups reach 10%+ of user base without active PL outreach, revisit bilingual at that point.

### DEC-MKT-D — PH launch timing

- Czego dotyczy: Product Hunt launch week
- Szczegolowy opis: PH traffic is one-shot. Need at least 500-waitlist before launch day. User decides: launch as soon as preview-tool is live (faster feedback loop), OR launch with full stack + 1000 waitlist (higher top-5 probability).
- Opcje:
  1. Launch at week +4 (aggressive) — 300 waitlist; probable rank: #5-15 of day; 1-3k signups
  2. Launch at week +8 (balanced) — 800 waitlist; probable rank: #3-10; 3-8k signups
  3. Launch at week +12 (safer) — 1500+ waitlist; probable rank: #1-5; 5-20k signups
- Rekomendacja: **Option 2 (week +8).** Balances momentum with preparation. At week 12, waitlist growth plateaus and we're delaying real signups for a marginal PH rank gain. Week 4 is too early — preview-tool is still rough on launch day.

### DEC-MKT-E — Affiliate program rate (ties to DEC-SYN-29)

- Czego dotyczy: affiliate commission % for tadaify Amplify
- Szczegolowy opis: Per `marketing-affiliate-programs.md` the recommended baseline is 30% recurring lifetime. But Taplink has 40% lifetime — some high-volume affiliates won't switch. User decides: match category median (30%), match top rate (40%), or above (45-50% for aggressive market entry).
- Opcje:
  1. 25% recurring lifetime (match Beacons; conservative)
  2. 30% recurring lifetime (match Carrd/Later; market median; recommended in affiliate-programs doc)
  3. 40% recurring lifetime (match Taplink; aggressive market entry)
  4. 50% recurring first-10-referrals, then 30% (tiered bonus for top affiliates)
- Rekomendacja: **Option 4 (50%/30% tiered).** Best of both: headline "50% commission" outperforms Taplink at recruitment marketing, steady-state 30% is sustainable long-term. Creators who refer <10 users aren't motivated enough by 40% to switch anyway; creators who refer 10+ are the power users we MUST win.

---

## 14. Appendix — compounding rationale

### 14.1 Why Track A + Track B beat Track E (SEO) for launch

| Metric | Track A+B | Track E |
|---|---|---|
| Signups at day 30 | 500-2,000 | 0-50 |
| Signups at day 90 | 2,500-10,000 | 0-500 |
| Signups at day 365 | 15,000-80,000 (with saturation) | 5,000-50,000 (compounding) |
| Cost at day 90 | $5-30k | $0-5k (founder time) |
| Cost at day 365 | $50-200k | $10-50k |
| Signup velocity | Immediate | 6-12 month ramp |
| Brand control | High (message) | Low (Google ranks what it ranks) |

**Conclusion:** Track A+B is an immediate, high-velocity, expensive-per-unit channel. Track E is slow, cheap-per-unit, compounding. For **month 0-6**, A+B dominate. For **month 6-24**, A+B + E both contribute. For **month 24+**, E becomes the dominant channel because A's addressable pool saturates (we've contacted all 5M Linktree handles).

### 14.2 Why the preview-tool is defensibly differentiated

The admin-tool model (DEC-MKT-B-v2) is inherently harder to copy at scale — it is a human workflow, not a public API endpoint. Competitors can build the same parser and renderer, but they cannot replicate:

1. **First-mover brand association** — admins who hand-craft 20-30 previews/day over months create a perception that tadaify is the most design-thoughtful tool. Creators who receive a preview feel individually valued, not bulk-scraped.
2. **Engineering head-start** — Linktree parser at MVP; Beacons/Stan/Bio.link parsers at M+0.5 (F-PREVIEW-010..012). By month 3 tadaify's admin team covers 4 platforms; competitors starting from zero need 6+ months to catch up.
3. **Hash-based onboarding inheritance** — when a creator signs up via the `?ref=<hash>` preview link, the admin's customisation (theme, palette, layout) pre-populates their onboarding. This seamless "it's already designed for you" activation moment cannot be copied without the full referral + onboarding pipeline.
4. **Outreach infrastructure + admin dashboard** — tracked DM copy, outreach log, per-preview analytics, conversion attribution to admin action. This compound data asset (which previews convert, at what outreach timing, with which CTA) creates a flywheel no new entrant can bootstrap quickly.

### 14.3 The TL;DR for the user

**If you read nothing else, read this:**

1. Build the admin preview-generator (`/admin/marketing/preview-generator`) in 6-7 weeks (F-PREVIEW-001..007). Ship MVP with Linktree parser only (DEC-Q5-C). Beacons/Stan/Bio.link at M+0.5 (F-PREVIEW-010..012, week +2 post-launch).
2. Reserve all social handles THIS WEEK. ($50)
3. Start founder-led Twitter build-in-public from day 1. (Free)
4. Start Track A outreach at week +2 post-preview-shipping. Manual first, tooled later. ($1-2k/mo)
5. Launch coordinated PH / HN / IH wave at week +8. ($500)
6. Influencer Track C launches at week +4 with free-Pro + 50% affiliate. ($0-5k in first 8 weeks)
7. SEO Track E runs in background. ($0-2k/mo content contractor)

**Everything else is iteration.** This 7-step playbook ships tadaify from 0 to $5k MRR in 90 days on a Bootstrap or Seed budget.

---

## Sources

Primary desk research (2026-04-24):

- [hiQ Labs v. LinkedIn — scraping law precedent](https://en.wikipedia.org/wiki/HiQ_Labs_v._LinkedIn)
- [2026 social media scraping legal guide — SociaVault](https://sociavault.com/blog/social-media-scraping-complete-guide)
- [Influencer marketing rates 2026 — Influencer Marketing Hub](https://influencermarketinghub.com/micro-influencer-rates/)
- [Sponsored post rates 2026 guide — InfluenceFlow](https://influenceflow.io/resources/sponsored-post-rates-the-complete-2026-pricing-guide-for-brands-and-creators/)
- [Shopify influencer pricing 2026](https://www.shopify.com/blog/influencer-pricing)
- [Stan Store influencer rates 2026](https://stan.store/blog/influencer-rates/)
- [TikTok influencer rates 2026 — IMH](https://influencermarketinghub.com/tiktok-influencer-rates/)
- [Instantly.ai 2026 pricing](https://instantly.ai/blog/instantly-vs-smartlead-lemlist-2026/)
- [Smartlead 2026 pricing — Puzzle Inbox](https://puzzleinbox.com/blog/smartlead-pricing-guide/)
- [Lemlist 2026 pricing — Puzzle Inbox](https://puzzleinbox.com/blog/lemlist-pricing-guide/)
- [Cold email tool pricing comparison 2026 — litemail.ai](https://litemail.ai/blog/cold-email-tool-pricing-comparison-2026)
- [Product Hunt launch playbook 2026 (30x #1 winner)](https://dev.to/iris1031/product-hunt-launch-playbook-the-definitive-guide-30x-1-winner-48g5)
- [PH launch guide 2026 — Blazon Agency](https://blazonagency.com/post/how-to-launch-on-product-hunt)
- [Smol Launch — How to launch on Product Hunt 2026](https://smollaunch.com/guides/launching-on-product-hunt)
- [Hunter.io 2026 pricing — MarketBetter](https://marketbetter.ai/blog/hunter-io-pricing-breakdown-2026/)
- [Apollo.io 2026 pricing — Enrich](https://www.enrich.so/blog/apollo-pricing-breakdown)
- [Hunter.io vs Apollo contact coverage — Cleanlist](https://www.cleanlist.ai/blog/2026-03-07-hunter-vs-apollo)

Internal research consumed (cross-reference):

- `tadaify/competitors/_synthesis/00-tldr.md`
- `tadaify/marketing-channels.md`
- `tadaify/marketing-pitch-angles.md`
- `tadaify/marketing-seo-keyword-map.md`
- `tadaify/marketing-affiliate-programs.md`
- `tadaify/marketing-vs-articles-catalog.md`
- `tadaify/brand-lock.md`
- `tadaify/infra-cost-analysis.md`
- `tadaify/tadaify-research-synthesis.md`
- `tadaify/functional-spec.md`
