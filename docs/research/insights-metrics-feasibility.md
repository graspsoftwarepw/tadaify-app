---
type: research
project: tadaify
title: Insights & analytics metrics feasibility — Cloudflare Workers stack × creator user demand
created_at: 2026-04-26T04:47:31Z
author: orchestrator-opus-4.7
status: draft-for-review
---

# Insights & analytics metrics feasibility — Cloudflare Workers stack × creator user demand

## Executive summary (read this first)

1. **The Cloudflare stack we already chose for custom domains is the right substrate for our own first-party analytics.** Workers Analytics Engine (WAE) gives us unlimited-cardinality event ingestion at the edge with 90-day retention and a SQL API; combined with Workers KV for "today" counters and D1 for nightly rollups, we can ship a creator-grade Insights tab without a third-party tracker, without cookies, and without sending visitor data to anyone but ourselves. The reference architecture (Counterscale, MIT-licensed) proves the pattern works in production at "100k hits/day on free tier" scale [Source: <https://counterscale.dev/>].
2. **The single most under-served need across Linktree, Beacons, Bento, Stan, and Carrd is `traffic source × time × link` cross-tabulation.** Every competitor has either flat lifetime totals or shallow time-series, and almost none let creators answer "did the TikTok I posted Thursday actually drive clicks on my Stripe link, and which hours converted?" without exporting CSVs. Shipping that one cross-tab as a default view is the most differentiable thing we can do — and our stack supports it natively because WAE indexes each event with a free-form `index` field (typically the link/block id) plus 20 string blobs.
3. **Recommendation for tier gating:** Free gets 7-day windows and country-level geo (enough to validate value, narrow enough to drive upgrade); **Creator $8/mo** unlocks 90-day windows, hourly granularity, top-20 links, and CSV export — i.e., everything WAE can natively do at zero marginal cost; **Pro/Business** add real-time (60s refresh), city-level geo (using IP→city at the Worker, *never stored*), UTM breakdown, and a read-only API. We can ship Free + Creator on day 1 and gate the rest behind feature flags without architectural change.

The rest of this document is the homework that backs those three claims.

---

## Phase 1 — Cloudflare capability mapping (technical truth)

This phase is a precision read of every Cloudflare primitive that could plausibly appear in our analytics pipeline. The intent is to know — not guess — what each one can do, what it costs, and where it caps out, so the architecture in Phase 4 is grounded in reality rather than marketing pages.

### 1.1 Workers Analytics Engine (WAE)

**What it is.** A purpose-built time-series store inside Cloudflare's edge. You call `env.MY_DATASET.writeDataPoint({ blobs: [...], doubles: [...], indexes: [...] })` from any Worker; events are persisted asynchronously and queried later via a SQL HTTP endpoint. Designed exactly for the "log every event with arbitrary tags, query it later" pattern [Source: <https://developers.cloudflare.com/analytics/analytics-engine/>].

**Per-data-point shape.**
- Up to **20 blobs** (UTF-8 strings, total max 16 KB) — used for high-cardinality dimensions like `link_id`, `referrer_host`, `country`, `device`, `path`.
- Up to **20 doubles** (floats) — used for numeric facts like `bytes`, `latency_ms`, `viewport_width`.
- **One index** (string, max 96 bytes) — the *sampling key*. WAE samples per-index, so high-volume indexes are sampled more aggressively than low-volume ones, ensuring the long tail isn't drowned out [Source: <https://developers.cloudflare.com/analytics/analytics-engine/sampling/>].
- Up to **250 data points per Worker invocation** [Source: <https://developers.cloudflare.com/analytics/analytics-engine/limits/>].

**Retention.** 90 days for the raw sampled rows. Older data is gone — if we want a "last 12 months" view for Business tier we have to roll up nightly into D1 or R2 ourselves.

**Query model.** SQL via HTTP POST to `https://api.cloudflare.com/client/v4/accounts/{account_id}/analytics_engine/sql`. Standard `SELECT … FROM <dataset> WHERE timestamp >= NOW() - INTERVAL '7' DAY GROUP BY blob3` syntax. ABR (Adaptive Bit Rate) means longer-window queries return higher-sample-interval results, so a 90-day query might be 1% sampled and a 1-hour query 100% — Cloudflare picks the resolution to keep the query under its time budget [Source: <https://developers.cloudflare.com/analytics/analytics-engine/sampling/>].

**Pricing (current published rates — billing is currently dormant but the pricing page is the future intent).**
- **Free (Workers Free):** 100,000 writes/day + 10,000 reads/day.
- **Paid (Workers Paid $5/mo):** 10M writes/month + 1M reads/month included.
- **Overage:** $0.25 per additional million writes, $1.00 per additional million reads [Source: <https://developers.cloudflare.com/analytics/analytics-engine/pricing/>].

**What tadaify can do with this.** Log every pageview and every block-click as a `writeDataPoint` call with `blobs=[link_id, referrer_host, country, device_class, utm_source, utm_medium, utm_campaign, page_slug]`, `doubles=[1]`, `index=[creator_user_id]`. Query the dashboard via SQL grouped by any blob. This is the **primary event store**.

### 1.2 Workers Logs / `wrangler tail` / Workers Trace

**What it is.** Real-time tail of `console.log` output and request-level metadata from Workers, plus Logpush for persistent logs to R2/S3.

**What we can do with it.** Useful for *debugging the analytics pipeline itself* (catching beacons that 5xx, malformed payloads). Not a metrics primitive — too coarse and not queryable as time-series. **Not a primary candidate for the dashboard.**

### 1.3 Cloudflare Web Analytics (the zero-JS one)

**What it is.** Cloudflare's privacy-first, cookieless website analytics, available on **all** plans (including Free) by default since the September 2025 RUM-by-default rollout. Captures pageviews, top URLs, top countries, and Core Web Vitals (LCP, INP, CLS) for any zone proxied through Cloudflare [Source: <https://blog.cloudflare.com/the-rum-diaries-enabling-web-analytics-by-default/>] [Source: <https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/>].

**Limitations for our case.**
- It's *site-level* analytics, not *creator-level*. We'd see "tadaify.com had X pageviews" not "creator alex had Y pageviews on his page".
- It cannot key on creator-owned dimensions (which block was clicked, which UTM, which path-segment).
- The dashboard is Cloudflare-owned and we can't embed slices of it into our own UI.

**What tadaify can do with this.** Use it as **internal infra-monitoring** for the SaaS itself (page load speed, top creator pages by traffic for capacity planning, RUM/Core Web Vitals for our own product quality). **NOT the source of truth for the creator-facing Insights tab.** Stays in our infrastructure dashboard, not the creator dashboard.

### 1.4 Real User Monitoring (RUM) / Browser Insights

**What it is.** Same product as Web Analytics in 2026 — Cloudflare merged Browser Insights into Web Analytics. Provides Core Web Vitals (LCP, INP, CLS) measured from real visitor browsers via a small JS beacon [Source: <https://blog.cloudflare.com/start-measuring-web-vitals-with-browser-insights/>] [Source: <https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/>].

**What tadaify can do with this.** Surface "your page loaded fast for 95% of visitors this week" as a single health badge in the Insights tab, especially valuable for creators on slow custom-domain configurations. Optional, low-priority. Can also power a "your page is slow on mobile in India, fix it" advisory on Pro+.

### 1.5 D1 (SQLite at the edge)

**What it is.** Cloudflare's managed SQLite. Strongly consistent within a region, eventually consistent globally via read replicas.

**Pricing & limits (2026).**
- Free tier: 5 GB storage, ~150M rows read/month, ~3M rows written/month.
- Paid: 25B reads/month + 50M writes/month included; overage $0.001 per million reads, $1.00 per million writes; storage $0.75/GB/month.
- Per-database cap: 10 GB; per-account cap on Workers Paid: 1 TB [Source: <https://developers.cloudflare.com/d1/platform/pricing/>] [Source: <https://developers.cloudflare.com/d1/platform/limits/>].

**What tadaify can do with this.** Store **rolled-up aggregates** (per-creator-per-day per-link click counts, per-creator-per-hour pageview counts, per-creator-per-day-per-country pageview counts) in narrow, indexed tables. A nightly cron Worker reads from WAE via SQL API and writes the rollups into D1. The dashboard then reads exclusively from D1 (cheap, fast, RLS-able by `creator_user_id`). This is the **derived store** that powers historical views beyond WAE's 90-day window and that keeps WAE read-query budget low.

### 1.6 Workers KV

**What it is.** Eventually-consistent key-value store with global edge replication (~60s propagation).

**Pricing & limits (2026).**
- Free: 100k reads + 1k writes/day, 1 GB storage.
- Paid: included with Workers Paid; overage $0.50 per million reads, $5.00 per million writes/lists/deletes, $0.50 per GB/month [Source: <https://developers.cloudflare.com/kv/platform/pricing/>].

**What tadaify can do with this.** Store "today's counters" — increment a counter key like `views:creator_123:2026-04-26` on every pageview. Eventually consistent so inter-region race conditions can drop a single increment, but at scale it averages out. Read on dashboard for the "today" tile without hitting WAE every refresh. **Caveat:** `1k writes/day on Free` means the *unpaid* tadaify infra account can't use KV for live counters at scale; we are already on Workers Paid for the custom-domain plan, so this is moot for us.

### 1.7 Durable Objects

**What it is.** Single-instance, strongly consistent stateful objects. Can host counters with no race conditions. SQLite-backed storage option (billing began Jan 2026) [Source: <https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/>].

**What tadaify can do with this.** Strict per-page-per-second counters for "live now" view (Pro+). One DO per active creator page during peak; deserialise to nothing during idle. Overkill for the bulk of what we need — KV's eventual consistency is fine for "today" totals. **Reserve DOs for the Pro+ live view feature only.**

### 1.8 R2 (S3-compatible object storage)

**Pricing.** $0.015/GB/month storage. **Zero egress.** Class A (writes/lists) free first 1M/month then $4.50/million; Class B (reads) free first 10M/month then $0.36/million [Source: <https://developers.cloudflare.com/r2/pricing/>].

**What tadaify can do with this.** Long-term archival of *raw* events (Parquet exports nightly from WAE for Business tier "unlimited history" claims). Egress-free is huge if we ever expose a raw-data download to Business tier. Default cold storage of `>90d` events.

### 1.9 Cache Analytics / Bot Management / WAF

**What they are.** Cloudflare zone-level products surfacing bot scores, cache hit rates, WAF rule fires.

**What tadaify can do with these.** Use **Bot Management** scores at the Worker beacon to filter bot pageviews out of the analytics stream — visible bots (`cf.botManagement.score < 30`) get logged as `is_bot=true` so they can be excluded from creator-facing numbers but still preserved for forensics. Cache Analytics is irrelevant to creator-facing dashboards; useful only for our own SRE.

### 1.10 GraphQL Analytics API

**What it is.** Cloudflare's account-level GraphQL endpoint exposing all zone analytics (HTTP, firewall, DNS, etc.) [Source: <https://developers.cloudflare.com/analytics/graphql-api/>].

**What tadaify can do with this.** Cross-check raw HTTP request counts to detect drift between what WAE captured and what the edge actually saw — an internal data-quality gate, not a user-facing surface. Also useful for the reseller pattern where Business creators want their *zone-level* analytics for their custom domain — but Cloudflare for SaaS Custom Hostnames don't naturally surface in the GraphQL API the same way (each Custom Hostname is sub-zone). Defer this until we hit a Business-tier customer who explicitly asks.

### 1.11 Flagged out-of-scope: Enterprise-only primitives

- **Logpush (Enterprise pricing for full request logs)** — too expensive at our scale.
- **Workers for Platforms (multi-tenant Workers per creator)** — overkill; we're not running creator-supplied code.
- **Cloudflare Stream/Images analytics** — separate products; out of MVP.

### 1.12 Summary table — Cloudflare primitives

| Primitive | Role in analytics pipeline | Tier needed | Notes |
|---|---|---|---|
| Workers Analytics Engine | **Primary event store** (raw events, 90d retention, SQL queryable) | Workers Paid ($5/mo) | The whole pipeline hinges on this; sampling is automatic and fine for our scale |
| Workers KV | "Today" near-real-time counters | Workers Paid | Eventual consistency OK for tile widgets |
| D1 | **Derived store** for historical rollups | Workers Paid | Nightly cron writes here from WAE; dashboard reads here |
| Durable Objects | Strict counters for "live now" Pro+ feature | Workers Paid | Reserved for Pro+ tier |
| R2 | Cold archival of raw events for "unlimited history" Business claim | Workers Paid | Egress-free is nice |
| Web Analytics + RUM | Internal SRE / our SaaS perf monitoring | Free (all zones) | Surface as health badge on creator dashboard optional |
| Bot Management score | Filter bot pageviews from creator metrics | Pro+ zone | We're on Business for Custom Hostnames already |
| GraphQL Analytics | Internal data-quality cross-check | Free | Not creator-facing |
| Workers Logs / Logpush | Pipeline debugging | Workers Paid | Not creator-facing |

---

## Phase 2 — User research (what creators actually want)

This phase is the highest-value section per the SPIKE prompt. The synthesis below is built from explicit creator complaints, competitor feature pages, review aggregator pull-quotes, and indie-hacker community posts about the broader analytics-frustration trope. Citations are inline against each claim.

### 2.1 Why creators look at link-in-bio analytics at all

Three jobs-to-be-done emerge across reviews:

**Job 1 — "Did my last post drive any traffic?"** Creators post a TikTok/Reel/IG-Story expecting it to push some clicks to their bio. They want a single chart that shows the spike (or absence of one) within minutes-to-hours. This is the most common opening of the dashboard — they're not browsing analytics, they're verifying a hypothesis [Source: <https://www.beehiiv.com/blog/link-in-bio-tool>] [Source: <https://www.liinks.co/blog/the-analytics-advantage-unlocking-data-to-drive-your-link-in-bio-success>].

**Job 2 — "Which links do people actually click?"** Once creators have ≥3 blocks, they stop guessing which to keep at the top. They want a click-distribution view — top blocks by clicks over a window, with click-through rate (CTR = clicks/views) so they can compare blocks fairly [Source: <https://help.linktr.ee/en/articles/5434178-understanding-your-insights>] [Source: <https://stan.store/blog/best-link-in-bio-platforms/>].

**Job 3 — "Where is my audience coming from?"** Cross-platform creators (IG + TikTok + YouTube + newsletter) want to know which platform is actually their best driver, both in volume and conversion. Without this, they over-invest on the loudest platform [Source: <https://www.tokportal.com/post/tiktok-link-in-bio-setup-utm-tracking-best-practices>] [Source: <https://bitly.com/blog/link-in-bio-to-track-social-referrals/>].

### 2.2 Top 10 metrics creators repeatedly ask for (ranked by frequency)

Synthesised from competitor help-center pages, reviews, blog roundups, and creator-tool buyer's guides:

1. **Total pageviews & total clicks (lifetime + windowed).** Universal. Every competitor surfaces these. The interesting variable is the time-window selector — Linktree's recent addition of "lifetime clicks and views" was a top-requested change [Source: <https://linktr.ee/blog/lifetime-clicks-views-analytics>].
2. **Top blocks/links by clicks (ranked list).** Universal. Every competitor surfaces it. The differentiation is whether CTR appears next to absolute clicks (Beacons does, Linktree doesn't by default) [Source: <https://help.linktr.ee/en/articles/5434178-understanding-your-insights>].
3. **Time-series chart (clicks/views over time, daily granularity).** Universal at Pro tiers; absent or coarse on free tiers. The exact granularity (daily vs hourly vs real-time) is the single most-cited complaint when missing [Source: <https://www.theleap.co/blog/beacons-vs-linktree/>].
4. **Geographic breakdown (country & city).** Universal at Pro; many free tiers cap at country only. Creators with international audiences (musicians, language teachers) cite city-level as critical for tour planning / local-content decisions [Source: <https://creatorblog.direct.me/link-in-bio-analytics-a-beginners-guide-to-track-performance/>] [Source: <https://later.com/link-in-bio/>].
5. **Device split (mobile vs desktop, and within mobile: iOS vs Android).** Universal at Pro. Creators making decisions about asset sizing/formatting want this [Source: <https://qrlynx.com/link-in-bio-qr-code>].
6. **Referrer / traffic source (Instagram, TikTok, Twitter, Direct, Other).** This is THE most under-served metric. Creators consistently complain that Linktree shows only "Top referrers" as raw URLs, not platform-grouped, so it requires manual interpretation. Beacons does platform grouping. UTM-based platforms (Liinks, Bitly bio) show this best [Source: <https://www.liinks.co/blog/how-to-use-the-free-liinks-utm-link-builder-to-track-campaign-traffic>] [Source: <https://bitly.com/blog/link-in-bio-to-track-social-referrals/>].
7. **Click-through rate (CTR = clicks / pageviews).** Universal at Pro. Often shown per-block.
8. **Unique visitors (vs raw pageviews).** Standard at Pro. Creators care about this for "how many real people saw this" — though most reviewers admit they can't always tell the difference and over-attribute meaning to it. We'd be doing them a favour by surfacing the methodology clearly (cookieless daily-salt) [Source: <https://github.com/plausible/analytics/discussions/1150>] [Source: <https://github.com/plausible/analytics/discussions/970>].
9. **Hour-of-day heatmap / "best time to post".** Beacons heavily features this. Creators trying to optimise posting cadence want it. Stan Store does it as a chart [Source: <https://hastewire.com/blog/beacons-ai-review-features-pricing-and-user-insights>].
10. **CSV export.** Pro/Premium-only across the board. Creators with newsletters / their own analytics setups want raw exports to merge with email/ad platform data [Source: <https://linktr.ee/help/en/articles/5707122-how-to-download-a-csv-of-your-analytics-activity>].

### 2.3 Top 5 frustrations with existing analytics (frequency-ranked)

**Frustration 1 — "Pro tier is required for any non-trivial analytics, and even then it's shallow."** Repeated across G2, Capterra, Trustpilot, and Indie Hackers reviews of Linktree specifically: *"Analytics are limited and often delayed, while professional alternatives provide real-time insights with more actionable data and conversion tracking"* [Source: <https://autoposting.ai/linktree-review/>]. *"detailed analytics require upgrading to Pro and paying"* [Source: <https://biotree.bio/blog/linktree-free-vs-pro>]. Trustpilot has a documented 1-star review from a paid Pro customer who couldn't access all-time analytics they were paying for. The takeaway: **shallow analytics behind a paywall is worse than no analytics, because it's perceived as a bait-and-switch.**

**Frustration 2 — "Data is delayed, no real-time signal."** A recurring complaint that the Linktree number you see today was actually rolled up overnight, so the "did my morning TikTok work?" loop doesn't close until tomorrow. Beacons advertises real-time as a differentiator on its free plan, which is part of why it's growing [Source: <https://stewartgauld.com/beacons-vs-linktree/>].

**Frustration 3 — "I can't tell which platform sent which click."** Linktree shows top referrer URLs (e.g., `l.instagram.com`, `t.co`, `out.reddit.com`) but doesn't normalise them to "Instagram / Twitter / Reddit". Creators are forced to mentally translate every line, and they make mistakes (not knowing that `lm.facebook.com` is also Instagram in-app browser) [Source: <https://help.linktr.ee/en/articles/5434178-understanding-your-insights>]. UTM-tracker tools like Liinks fix this but require the creator to manually build UTM URLs for every platform — not most creators' workflow [Source: <https://www.liinks.co/blog/how-to-use-the-free-liinks-utm-link-builder-to-track-campaign-traffic>].

**Frustration 4 — "I'm checking 5 dashboards every morning."** Indie Hackers thread complaining about exactly this pattern across the creator-tool landscape: Sensor Tower for app data, separate tool for newsletter, separate tool for Stripe revenue, separate Linktree dashboard for clicks. *"Indie hackers don't need to spend days configuring Google Analytics or paying significant amounts for enterprise analytics software; they need analytics that works immediately, costs almost nothing, and shows what actually matters — without overwhelming them with data they'll never use."* [Source: <https://www.indiehackers.com/post/i-built-an-analytics-dashboard-for-indie-devs-tired-of-paying-450-month-for-sensor-tower-43c175a0bd>] [Source: <https://www.datasag.com/blog/lightweight-analytics-tools-indie-hackers>]. The creators of tomorrow's link-in-bio tools win by giving a 30-second morning glance with the right 4-5 numbers.

**Frustration 5 — "Bot/ghost views inflate the numbers and I can't tell what's real."** Especially painful at low-volume creators where 500 views could be 200 humans + 300 bots. Linktree and Beacons both surface raw view counts without bot-filtering by default, leading to the constant accusation of "the numbers don't match my Stripe revenue at all" [Source: <https://www.maria-johnsen.com/million-dollar-blog/stopping-bot-referral-traffic/>]. Plausible's testing-bot-filtering blog post is a creator-friendly explainer for why this matters [Source: <https://plausible.io/blog/testing-bot-traffic-filtering-google-analytics>].

### 2.4 Surprising asks (commonly mentioned but not obvious)

These are repeated across creator forums but absent from most competitor product pages — surfacing them is differentiable value:

- **"What was my best post this week?"** — not a typical analytics axis, but creators want a Spotify-Wrapped-style auto-narrative ("Tuesday's TikTok drove 412 clicks — your best of the week"). Direct.me surfaces something close [Source: <https://creatorblog.direct.me/link-in-bio-analytics-a-beginners-guide-to-track-performance/>].
- **"How do I compare to last week?"** — week-over-week deltas, ideally with a colour cue (green if up). Most competitors show this only in Pro tiers if at all.
- **"Which link converted to revenue?"** — for creators selling on Stripe/Gumroad, "click to Gumroad" is a leading indicator but the truth lives in the Stripe dashboard. We can ship a partial view of this with conversion-pixel-style tracking on outbound clicks; the full version requires Stripe webhook integration (out of scope for analytics tab — covered separately by tadaify's existing Stripe connector).
- **"How does my page perform on mobile?"** — Core Web Vitals as a creator-facing metric. Most competitors don't expose RUM data; Cloudflare gives it to us free.
- **"What time of day do my visitors actually click?"** — heatmap by hour-of-day, day-of-week. Beacons does it; Linktree doesn't [Source: <https://hastewire.com/blog/beacons-ai-review-features-pricing-and-user-insights>].
- **"Which UTM campaigns sent the most converters?"** — for creators running paid ads at their bio link, this is critical. Stan Store on Creator Pro does this via Meta/TikTok pixel integration; we can do it natively from UTM parameters at zero pixel cost [Source: <https://help.stan.store/article/407-creator-pro-features>].

### 2.5 Things creators DON'T care about (so we don't waste UI on them)

- **Bounce rate / time on page.** Single-page link-in-bios make these meaningless metrics. Don't show them.
- **Browser brand breakdown (Chrome vs Firefox vs Safari).** Useful for web SaaS, irrelevant for creators. Reduce to OS-level only if at all.
- **Operating-system version detail.** Same as above.
- **Screen resolution.** Same.
- **ISP / network operator.** Useful in fraud / ad-tech, irrelevant for creators.
- **Server response time histograms.** Engineering metric, not creator metric.
- **Detailed referrer URL paths.** Show platform-grouped, not raw URL.

Don't expose any of those in the default view. They could appear in a Business-tier "advanced" sub-tab but should never be the default Insights experience.

### 2.6 Competitor feature matrix (what each shows by tier)

This table is the empirical anchor for our tier-gating proposal in Phase 5.

| Feature | Linktree Free | Linktree Pro ($5/mo) | Linktree Premium ($24/mo) | Beacons Free | Beacons Creator Pro ($10/mo) | Bento (free) | Stan Creator ($29/mo) | Stan Pro ($99/mo) | Carrd Pro+ ($49/yr) |
|---|---|---|---|---|---|---|---|---|---|
| Total clicks/views (lifetime) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | via 3rd-party |
| Time-series chart | ⚠️ basic | ✅ | ✅ | ✅ | ✅ | ⚠️ basic | ✅ | ✅ | via 3rd-party |
| Real-time data | ❌ | ⚠️ delayed | ⚠️ delayed | ✅ | ✅ | ❌ | ⚠️ | ✅ | n/a |
| Geographic (country) | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | via GA |
| Geographic (city) | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ✅ | via GA |
| Device split | ❌ | ✅ | ✅ | ✅ | ✅ | ⚠️ | ✅ | ✅ | via GA |
| Referrers (URL) | ❌ | ✅ raw | ✅ raw | ✅ grouped | ✅ grouped | ❌ | ✅ | ✅ | via GA |
| UTM breakdown | ❌ | ❌ | ⚠️ partial | ❌ | ⚠️ partial | ❌ | ✅ via pixel | ✅ via pixel | via GA |
| CTR per link | ❌ | ⚠️ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | n/a |
| Unique visitors | ❌ | ✅ | ✅ | ✅ | ✅ | ❌ | ✅ | ✅ | via GA |
| Hour-of-day heatmap | ❌ | ❌ | ❌ | ❌ | ✅ | ❌ | ⚠️ | ✅ | n/a |
| CSV export | ❌ | ❌ | ✅ | ❌ | ✅ | ❌ | ❌ | ⚠️ | n/a |
| API access | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | n/a |
| Bot filtering disclosed | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | depends on GA |

Sources: [Linktree Help Center pricing](https://linktr.ee/s/pricing), [Linktree Insights](https://help.linktr.ee/en/articles/5434178-understanding-your-insights), [Beacons review](https://hastewire.com/blog/beacons-ai-review-features-pricing-and-user-insights), [Stan Creator Pro](https://help.stan.store/article/407-creator-pro-features), [Carrd Pro Plus features](https://carrd.co/docs/pro/features), [Bento.me](https://bento.me/en/home).

The headline takeaways:

- **No competitor exposes API access for creator analytics, at any tier.** That's a credible Pro/Business differentiator.
- **No competitor discloses bot filtering.** A "we filter bots and tell you the count" badge is a credibility win.
- **Hour-of-day heatmap is offered only on Beacons Creator Pro and Stan Pro.** Free-tier exposure of this would be a sharp differentiator.
- **CSV export is upper-tier-only everywhere.** Putting it on our Creator $8 tier is a price-anchored differentiator.
- **Real-time on the free tier (à la Beacons) is the table-stakes bar to clear.** Linktree's delayed analytics is the floor.

---

## Phase 3 — Capability × demand matrix

Cross-referencing Phase 1 (what Cloudflare can do) with Phase 2 (what creators want) gives the feasibility table. Costs assume Workers Paid baseline ($5/mo) already paid, and average pageview-and-click traffic patterns of ~5 events per visitor per session.

Feasibility legend: 🟢 trivial / 🟡 doable with engineering / 🔴 needs alternative architecture.

| User wants | CF primitive | Feasibility | Cost @ 1k DAU | Cost @ 100k DAU | Notes |
|---|---|---|---|---|---|
| Total pageviews & clicks (windowed) | WAE → D1 rollup | 🟢 | $0 | $0.50/mo | within paid baseline |
| Time-series, daily granularity | WAE → D1 daily rollup | 🟢 | $0 | $0.50/mo | nightly cron writes 1 row/creator/day |
| Time-series, hourly granularity | WAE → D1 hourly rollup | 🟢 | $0 | $1/mo | nightly cron writes 24 rows/creator/day |
| Real-time (60s refresh, "today" tile) | KV counter incremented at edge | 🟢 | $0 | $5/mo | KV write per pageview at 100k DAU = ~5M writes/day = $25/mo at full price; need batch-increment pattern |
| Real-time (10s "live now") | Durable Object per active page | 🟡 | $0 | ~$10/mo | DO request charges; only needed for Pro+ |
| Top blocks by clicks | WAE GROUP BY blob | 🟢 | $0 | $0 | within paid baseline |
| CTR per block | WAE — divide click count by pageview count | 🟢 | $0 | $0 | derived in SQL |
| Geographic — country | `request.cf.country` → blob in WAE | 🟢 | $0 | $0 | CF gives this for free |
| Geographic — city | `request.cf.city` → blob in WAE; never store IP | 🟢 | $0 | $0 | CF gives this for free; cardinality concern at city level only matters for query speed not storage |
| Device split (mobile/desktop) | UA parse at Worker → blob | 🟢 | $0 | $0 | use cheap UA-parser or CF's own |
| Browser detail | UA parse → blob | 🟢 | $0 | $0 | dedup via blob |
| OS detail | UA parse → blob | 🟢 | $0 | $0 | |
| Referrer (raw URL) | `Referer` header → blob | 🟢 | $0 | $0 | |
| Referrer grouped (Instagram/TikTok/Twitter/Direct) | Referrer normaliser at Worker → blob | 🟢 | $0 | $0 | static rule table |
| UTM breakdown | URL query params → blobs (utm_source/medium/campaign) | 🟢 | $0 | $0 | |
| Unique visitors (cookieless) | hash(daily_salt + IP + UA + creator_id) → blob; salt rotated nightly via KV | 🟡 | $0 | $1/mo | needs the salting cron + correct discard semantics |
| Hour-of-day heatmap | WAE GROUP BY toStartOfHour(timestamp) | 🟢 | $0 | $0 | derived in SQL |
| Day-of-week heatmap | WAE GROUP BY toDayOfWeek(timestamp) | 🟢 | $0 | $0 | |
| Best post / week-over-week deltas | D1 rollups + lightweight SQL | 🟢 | $0 | $0 | UI feature on top of D1 |
| Bot filtering | Bot Management score → blob; default exclude in dashboard | 🟢 | $0 | $0 | Business-plan zone already has Bot Management |
| Core Web Vitals | Cloudflare Web Analytics RUM (free) | 🟢 | $0 | $0 | |
| CSV export | dashboard read from D1 → stream CSV | 🟢 | $0 | $0 | |
| API access (read-only, rate-limited) | new Worker route reading D1 | 🟢 | $0 | $0 | |
| "Live now" stream of last 100 events | Durable Object subscriber + WebSocket | 🟡 | $0 | ~$5/mo | only for Pro+; or SSE poll D1 |
| 365-day history | R2 archive + nightly Parquet export | 🟡 | $0 | $1/mo | Business-tier only; queries via D1 are fine for last 365d if rollups are kept |
| Per-visitor session journey | reconstruct from anonymous_id + sequence — needs hashing on client side | 🔴 | n/a | n/a | adds storage + risks creator-misinterpretation; recommend NOT shipping |
| Cross-page funnel (visited X then Y then Z) | join across events by anonymous_id | 🔴 | n/a | n/a | same |
| True unique visitors across days | persistent cookie | 🔴 | n/a | n/a | breaks cookieless promise; do not ship; explain methodology in tooltip |

The 🔴 rows are the ones where we deliberately *won't* ship a competitor feature because either (a) it requires cookies which breaks our privacy promise, or (b) the data quality is misleading and we'd rather not over-claim. We tell creators about this trade-off explicitly in the tooltip ("we don't track across days, on purpose — here's why").

---

## Phase 4 — Architecture proposal

One canonical design. Diagram first, then walk-through, then specifics for the custom-domain vs subdomain split.

### 4.1 System diagram

```
                  ┌──────────────────────────────────────────┐
                  │              VISITOR BROWSER             │
                  │   alex.tadaify.com  OR  alexandra.com    │
                  └──────────────┬───────────────────────────┘
                                 │ HTTPS
                                 ▼
                  ┌──────────────────────────────────────────┐
                  │        CLOUDFLARE EDGE (anycast)         │
                  │  - SNI matches Custom Hostname OR zone   │
                  │  - Bot Management scores request         │
                  │  - request.cf.{country, city, ...} set   │
                  └──────────────┬───────────────────────────┘
                                 │
                                 ▼
              ┌──────────────────────────────────────────────┐
              │   tadaify-page-worker  (single Worker on the │
              │   tadaify.com zone, fallback origin for all  │
              │   custom hostnames per Cloudflare for SaaS)  │
              │                                              │
              │   1. Resolve creator from host or path       │
              │   2. Render page (HTML)                      │
              │   3. Inline 0.6 KB beacon snippet            │
              │      (no external script tag, same-origin)   │
              └──────┬─────────────────────────┬─────────────┘
                     │ render HTML             │ on subsequent
                     │                         │ pageview/click
                     ▼                         ▼
              ┌───────────────┐         ┌──────────────────────┐
              │ static assets │         │ tadaify-beacon-worker│
              │ (Pages CDN)   │         │ POST /b/v  /b/c      │
              └───────────────┘         │ same Worker, sub-route│
                                        └──────┬───────────────┘
                                               │
                  ┌────────────────────────────┼──────────────────────────┐
                  │                            │                          │
                  ▼                            ▼                          ▼
         ┌───────────────┐         ┌──────────────────┐         ┌───────────────┐
         │ Workers       │         │   Workers KV     │         │ Durable Object│
         │ Analytics Eng │         │ "today" counters │         │ (Pro+ only —  │
         │ (90d, raw)    │         │ key=views:cid:dt │         │ live view)    │
         └───────┬───────┘         └────────┬─────────┘         └───────────────┘
                 │ nightly cron              │ dashboard reads
                 ▼                            ▼
         ┌─────────────────────┐    ┌─────────────────────┐
         │  rollup-worker      │    │   tadaify-app SPA   │
         │  (cron trigger      │    │  /app/insights tab  │
         │   every hour:       │    │                     │
         │   read WAE SQL,     │    │  reads from D1 +    │
         │   write D1)         │    │  KV (today tile)    │
         └─────────┬───────────┘    └──────────▲──────────┘
                   ▼                            │
         ┌─────────────────────┐                │
         │  Cloudflare D1      │────────────────┘
         │  rollup tables:     │
         │  • daily_pageviews  │
         │  • hourly_pageviews │
         │  • daily_clicks     │
         │  • daily_geo        │
         │  • daily_referrers  │
         │  • daily_devices    │
         │  • daily_utm        │
         └──────────┬──────────┘
                    │ for >365d Business archive
                    ▼
         ┌─────────────────────┐
         │     R2 (parquet)    │
         │  yyyy-mm/<crc>.pq   │
         └─────────────────────┘
```

### 4.2 Beacon contract

Two endpoints on the same Worker, both same-origin so no CORS preflight on most browsers:

**Pageview** — `POST /b/v` with body:
```json
{
  "p": "/posts/hello",          // page path
  "r": "https://t.co/abc",       // document.referrer (truncated to host)
  "t": 1714099200,               // client timestamp (server overrides)
  "v": "2"                       // beacon protocol version
}
```

**Click** — `POST /b/c` with body:
```json
{
  "p": "/posts/hello",
  "b": "blk_a1b2c3",             // block id
  "u": "https://gumroad.com/...", // outbound URL (host only stored)
  "t": 1714099210,
  "v": "2"
}
```

Both endpoints:
- Send `keepalive: true` on the fetch so navigation-following clicks don't drop the beacon.
- Are wrapped server-side in a check: if the host's `user_consent.analytics === false` (looked up from a session cookie set during the consent flow → JWT in `Authorization: Bearer` for tadaify-hosted, or per-visitor consent state in localStorage for custom domains), the Worker returns 204 without writing anything to WAE.
- Anonymise the IP client-side: never log raw `request.headers.get('cf-connecting-ip')`. Use it transiently for the unique-visitor hash and for `request.cf.city` resolution, then drop it from the captured payload.

### 4.3 WAE schema (logical)

Single dataset `tadaify_events`. Each row:

| Column | Source | Cardinality |
|---|---|---|
| `index` | creator_user_id | medium (one per creator) |
| `blob1` | event type: `view` or `click` | low |
| `blob2` | page slug (e.g. `/`, `/posts/hello`) | medium |
| `blob3` | block id (clicks only; `_` for views) | medium |
| `blob4` | host (`tadaify.com`, `alexandra.com`) | medium |
| `blob5` | country (ISO-3166-2) | low |
| `blob6` | city | medium |
| `blob7` | region | medium |
| `blob8` | device class (`mobile`, `desktop`, `tablet`, `bot`) | low |
| `blob9` | OS (`ios`, `android`, `macos`, `windows`, `linux`, `other`) | low |
| `blob10` | browser family (`chrome`, `safari`, `firefox`, `edge`, `webview`, `other`) | low |
| `blob11` | referrer host (`instagram.com`, `t.co`, `direct`) | medium |
| `blob12` | referrer platform (normalised: `instagram`, `tiktok`, `twitter`, `youtube`, `reddit`, `linkedin`, `direct`, `other`) | low |
| `blob13` | utm_source | medium |
| `blob14` | utm_medium | low |
| `blob15` | utm_campaign | medium |
| `blob16` | bot score bucket (`0-29-bot`, `30-69-likely-bot`, `70-100-human`) | low |
| `blob17` | viewport class (`xs`, `sm`, `md`, `lg`, `xl`) | low |
| `blob18` | visitor_hash (cookieless, daily-salted) | high (intentional — used for unique-visitor counts within day) |
| `blob19` | outbound_host (clicks only — `gumroad.com`) | medium |
| `blob20` | session_seq (1, 2, 3 — only meaningful within session) | low |
| `double1` | 1.0 (event count) | n/a |
| `double2` | viewport_w | n/a |
| `double3` | viewport_h | n/a |
| `timestamp` | server-set | n/a |

The `index = creator_user_id` choice means WAE's adaptive sampling is fair across creators — one viral creator with 10M views/day gets sampled aggressively while a small creator with 100 views/day stays at 100%.

### 4.4 Custom domain vs subdomain — does the analytics flow change?

**Visitor on `alex.tadaify.com` (sub-zone of our zone) OR `tadaify.com/alex` (path-based):**
- Hits Cloudflare edge → `tadaify-page-worker` directly.
- `request.headers.get('host')` is `tadaify.com` or the subdomain.
- We resolve creator from path or subdomain → render → inline beacon → beacon Worker writes WAE.
- Visitor consent: we serve our own consent banner; consent state lives in a same-origin cookie on `*.tadaify.com`.

**Visitor on `alexandra.com` (Custom Hostname per Cloudflare for SaaS):**
- Hits Cloudflare edge → SNI matches `alexandra.com` Custom Hostname → traffic terminates and is proxied to the fallback origin (typically `cname.tadaify.com`) → arrives at the same `tadaify-page-worker`.
- `request.headers.get('host')` is `alexandra.com` (preserved by the Custom Hostname proxy).
- We resolve creator by querying our `custom_domains` table: `SELECT user_id FROM custom_domains WHERE domain='alexandra.com' AND status='active'` — this is the same lookup the page-render path already does.
- Beacon endpoint is on the **same Worker** but the fetch URL is `https://alexandra.com/b/v` so the request also flows through the Custom Hostname → fallback origin path. The beacon Worker reads `host` and tags `blob4 = 'alexandra.com'`, then attributes the event to alex's `user_id` via the same lookup.
- Visitor consent: we serve the same consent banner as on tadaify.com but cookie domain is now `alexandra.com` only. Important: consent given on `alexandra.com` must NOT silently transfer to `tadaify.com` and vice versa — they are legally separate first-party contexts even though both serve alex's content.

**One Worker handles both flows.** No second beacon endpoint, no second Worker, no second WAE dataset. The schema's `blob4 = host` is the only thing that distinguishes the two paths in storage, and it's used purely for diagnostics ("what fraction of alex's traffic comes through her custom domain vs the tadaify subdomain?"). For the dashboard, both paths roll up into the same creator's totals because the resolved `user_id` is the same.

### 4.5 Cookieless unique visitors — the daily salt approach

Lifted from Plausible's published methodology [Source: <https://plausible.io/data-policy>]:

1. Every 24h at UTC midnight, the rollup-worker generates a fresh random 256-bit salt and stores it in KV under `salt:current` (and shifts the previous one to `salt:previous` for grace-period writes during the boundary).
2. On every beacon ingest, the Worker computes `visitor_hash = sha256(salt:current || ip || user_agent || creator_user_id)` (truncated to 8 bytes to keep blob size reasonable).
3. The Worker writes `blob18 = visitor_hash` into WAE. **The raw IP is never persisted to WAE, KV, D1, or R2.**
4. Old salts are deleted at next rotation. Without the old salt, the hashes from yesterday cannot be re-derived from any IP, so cross-day re-identification is computationally impossible.
5. Unique-visitor count for a given day = `SELECT count(distinct blob18) FROM tadaify_events WHERE timestamp >= 'today' AND blob1='view'`.
6. Tooltip in UI: "Unique visitors are counted per day, without cookies, using a privacy-preserving daily-rotating hash. The same person visiting two days in a row counts as 2 — that's the trade-off we make to avoid tracking you across days."

This satisfies GDPR Art. 5(1)(c) data minimisation and avoids the "is /24 IP truncation enough?" debate (it isn't, per CNIL/Garante rulings [Source: <https://gdpranalytics.com/ip-anonymization-how-it-works-in-different-analytics-tools/>] [Source: <https://00f.net/2025/10/27/ip-anonymization/>]) by simply never storing the IP at all.

### 4.6 Aggregation worker (cron)

Schedule: every 60 minutes for the most recent hour's rollup; nightly at 02:00 UTC for daily rollups + R2 archival.

Hourly cron job (60 min granularity is the floor for "Pro tier real-time" without going to DOs):

```sql
INSERT INTO d1.hourly_pageviews
  (creator_user_id, hour_utc, page, host, country, device, referrer_platform,
   pageviews, clicks, unique_visitors)
SELECT
  index AS creator_user_id,
  toStartOfHour(timestamp) AS hour_utc,
  blob2 AS page,
  blob4 AS host,
  blob5 AS country,
  blob8 AS device,
  blob12 AS referrer_platform,
  countIf(blob1 = 'view') AS pageviews,
  countIf(blob1 = 'click') AS clicks,
  count(DISTINCT blob18) AS unique_visitors
FROM tadaify_events
WHERE timestamp >= NOW() - INTERVAL '2' HOUR
  AND timestamp < toStartOfHour(NOW())
  AND blob16 = '70-100-human'  -- exclude bots
GROUP BY index, hour_utc, page, host, country, device, referrer_platform;
```

The nightly cron does the same with day granularity and additional aggregations (top-N blocks, hour-of-day heatmap, UTM breakdown). After 90 days, the raw WAE rows are dropped by Cloudflare; our D1 rollups remain as long as we keep them (10 GB cap per-database is plenty — at 1k creators × 365 days × 24 hours × 100 (avg cardinality of pages) = ~876M rows, well under 1 TB account quota; we'd have to shard at ~10k creators).

### 4.7 Dashboard read path

Dashboard reads exclusively from D1 for historical and from KV for "today". Never directly from WAE — that path is reserved for the rollup worker, to keep the WAE read-query budget predictable.

Per-tile typical query pattern (Creator tier, last 30 days):

```sql
-- "today" tile: KV.get(`views:${cid}:${utc_today}`)
-- "this week" tile:
SELECT sum(pageviews), sum(clicks), sum(unique_visitors)
FROM daily_pageviews
WHERE creator_user_id = ? AND day_utc >= today - 7;
-- "top blocks":
SELECT block_id, sum(clicks) c
FROM daily_clicks
WHERE creator_user_id = ? AND day_utc >= today - 30
GROUP BY block_id ORDER BY c DESC LIMIT 20;
```

These are all index hits on a narrow table — D1 reads are well within the 25B/month included quota even for thousands of creators refreshing the dashboard hourly.

### 4.8 Failure modes

- **WAE down / slow.** Beacons should not block the user-facing render. Fire-and-forget; if WAE returns non-200 within 100ms, log and move on. Acceptable data loss in this rare window.
- **Rollup worker fails.** Re-run it on next cron with a longer lookback window (3 hours instead of 2). Idempotent — the D1 rollup uses `INSERT … ON CONFLICT DO UPDATE` keyed on `(creator_user_id, hour_utc, page, ...)`.
- **D1 region failure.** Read replicas globally distributed (D1's 2026 multi-region default). Acceptable read-after-write delay <60s.
- **Salt rotation race.** Use both `salt:current` and `salt:previous` for ±5 min after rotation; events near boundary may produce duplicate hashes for one visitor (counted as 2 uniques). Acceptable error margin.
- **Bot Management mis-classification.** `blob16` records the score; if we discover bot floods we can re-aggregate in D1 by filtering more aggressively. Raw row remains available for 90 days for forensics.

---

## Phase 5 — Tier gating proposal

Drawn from the Phase 1 cost reality and Phase 2 user research. The goal is to make Free tier **good enough** that creators stick (Linktree's Free is the floor; we want above), and Creator $8 tier **everything we can technically do for free given our paid baseline**.

### 5.1 Proposed matrix

| Capability | Free | Creator $8/mo | Pro | Business |
|---|---|---|---|---|
| Time range | Last 7 days | Last 90 days | Last 365 days | Unlimited (R2 archive) |
| Granularity | Daily | Daily + Hourly | Hourly + 60s "today" | Real-time (10s "live now") + DO |
| Top blocks | Top 5 | Top 25 | Unlimited | Unlimited |
| Total pageviews/clicks | ✅ | ✅ | ✅ | ✅ |
| CTR per block | ✅ | ✅ | ✅ | ✅ |
| Unique visitors (daily) | ✅ | ✅ | ✅ | ✅ |
| Geographic — country | ✅ | ✅ | ✅ | ✅ |
| Geographic — region | ❌ | ✅ | ✅ | ✅ |
| Geographic — city | ❌ | ❌ | ✅ | ✅ |
| Device — mobile/desktop split | ✅ | ✅ | ✅ | ✅ |
| Device — OS detail | ❌ | ✅ | ✅ | ✅ |
| Device — browser detail | ❌ | ❌ | ✅ | ✅ |
| Device — viewport class | ❌ | ❌ | ✅ | ✅ |
| Referrer — top 5 grouped | ✅ | ✅ | ✅ | ✅ |
| Referrer — top 20 grouped | ❌ | ✅ | ✅ | ✅ |
| Referrer — raw URL detail | ❌ | ❌ | ✅ | ✅ |
| UTM breakdown (utm_source) | ❌ | ✅ | ✅ | ✅ |
| UTM breakdown (utm_campaign × source × medium) | ❌ | ❌ | ✅ | ✅ |
| Hour-of-day heatmap | ❌ | ✅ | ✅ | ✅ |
| Day-of-week heatmap | ❌ | ✅ | ✅ | ✅ |
| Week-over-week deltas | ❌ | ✅ | ✅ | ✅ |
| "Best post this week" auto-narrative | ❌ | ✅ | ✅ | ✅ |
| Bot-filtering badge ("X bots filtered") | ✅ | ✅ | ✅ | ✅ |
| Core Web Vitals (Cloudflare RUM) | ❌ | ✅ | ✅ | ✅ |
| Real-time "live now" view | ❌ | ❌ | ✅ | ✅ |
| CSV export — last 30 days | ❌ | ✅ monthly | ✅ daily | ✅ daily |
| CSV export — full history | ❌ | ❌ | ✅ | ✅ |
| Read-only API access | ❌ | ❌ | ⚠️ rate-limited 100 req/h | ✅ rate-limited 1000 req/h |
| R2 raw event archive download (Parquet) | ❌ | ❌ | ❌ | ✅ |

### 5.2 Defence per tier

**Why Free includes Top 5 blocks, country geo, and mobile/desktop split (not "fewer numbers"):** competitive floor — Beacons free already shows real-time + top-N + country, so anything less than that is non-starter. We get the data essentially for free at Cloudflare cost ($0 marginal), so the gate has to be on *granularity and history*, not on *which axes are visible at all*.

**Why Free is capped at 7 days:** Linktree free is "lifetime totals only" with no time-window control, which is the worst-of-both-worlds (overwhelming + useless). Our 7-day window with a chart is more usable AND a clear upgrade hook to Creator's 90 days.

**Why Creator $8/mo includes UTM:** UTM is genuinely zero-cost for us (parsed at the Worker into a blob), and *it's a creator-pain Linktree gates behind Premium*. Putting UTM at $8 is a pricing wedge.

**Why Hour-of-day heatmap is on Creator $8:** Beacons gates this at $10/mo Creator Pro. Putting it $2 cheaper at the same tier is direct attack on Beacons.

**Why Real-time "live now" is Pro+:** Durable Objects per-active-page have non-zero cost ($5-10/mo at 100k DAU), and real-time view is a "wow factor" feature creators photograph for screenshots more than they actually use day-to-day. Strong differentiator for the creators willing to pay >$8.

**Why API access is gated to Pro+:** No competitor offers API access at any tier. Even rate-limited, this is a Pro+ flagship feature for integration-heavy creators (Zapier, Make, custom dashboards).

**Why Business gets Parquet R2 download:** Heavy creators (newsletter operators with 100k+ subs running paid ads) want raw data to load into their own warehouse. R2 costs us nothing on egress. This is an addressable use case at the very top of the market.

### 5.3 What the Free tier explicitly does NOT have, and why that's defensible

- **No CSV export.** This is the single most-cited complaint about Linktree Free; we keep it on Creator. The marginal export cost is zero, but exposing it on Free removes the strongest upgrade hook for creators with even modest analytical curiosity.
- **No referrer detail beyond top-5.** Creators will see their top platform but will need Creator tier to see "and what's that long-tail traffic from `bsky.app`?".
- **No hour-of-day heatmap.** This is the most specifically-requested optimization metric; gating it pulls power-creators to upgrade.

### 5.4 What Free tier DOES have that's competitively above-floor

- **Real-time freshness.** Today's numbers update within 60s (KV-driven). Linktree Free does not have this.
- **Bot filtering.** No competitor explicitly states they filter bots for free creators; we do, and we surface "X bot views excluded" as a credibility badge.
- **Top 5 blocks with CTR.** Linktree Free shows total clicks per block but not pageviews-of-block-context, so no CTR. We compute CTR for free.
- **Cookieless / privacy methodology in plain language.** Tooltip: "We don't use cookies. Visitor counts use a daily privacy hash that we delete every 24 hours." This is a marketing differentiator with real cost = zero.

### 5.5 Risk: are we leaving Pro tier value-thin?

The proposed gating leaves Pro mostly differentiated by *granularity* (city geo, browser detail, hour-level real-time) and *API access*. If product stretches Pro for a "differentiating headline feature", candidates are:
- **Custom segmentation builder** (slice by any blob via UI, no SQL).
- **Saved views + scheduled email reports** ("send me last week's top performers every Monday at 9am").
- **A/B testing framework on blocks** (which uses analytics data to declare winners).

Hold these for post-MVP iteration. Don't ship Pro on day 1 unless we have a clear answer for "why $X/mo over Creator $8".

---

## Phase 6 — Open DECs

Six DECs that need answers before mockup work. Each follows table format v2 per `~/.claude/CLAUDE.md`.

### DEC-075 — Cookieless unique visitor methodology

**Czego dotyczy:** Visitor identity strategy for "unique visitors" metric.

**Szczegolowy opis:** Every link-in-bio competitor shows "unique visitors" but most use first-party cookies, which would force us to surface a cookie banner and break the privacy promise we've built into tadaify so far. Plausible's daily-salt SHA-256 approach (rotate salt every 24h, never store IP, hash IP+UA+creator_id+salt) is the cleanest GDPR-compliant alternative — it works without cookies but counts the same person visiting on Monday and Tuesday as 2 unique visitors. The trade-off: more accurate cross-day data requires either a cookie OR over-claiming on the methodology. Recommendation surfacing: explain the trade-off plainly in a tooltip and accept the 2-counts-on-2-days behaviour.

**Opcje:**
1. Cookieless daily-salt (Plausible-style) — accept 2-counts-on-2-days, no cookie banner needed for analytics.
2. First-party visitor cookie (per-creator, 30-day TTL) — accurate cross-day count, requires cookie consent gate.
3. Hybrid — cookieless by default, opt-in cookie for "more accurate" count after consent.
4. No "unique visitors" metric at all; show only pageviews and clicks.

**Twoja rekomendacja:** **Option 1 — cookieless daily-salt.** Privacy-first matches the tadaify story, Plausible has proven the methodology is creator-acceptable when explained, and the 2-counts-on-2-days "loss" is academic for ~95% of creators who care about absolute volumes more than precise dedup.

---

### DEC-076 — Dashboard refresh cadence (real-time vs near-real-time vs daily)

**Czego dotyczy:** How fresh the numbers in the Insights tab are at each tier.

**Szczegolowy opis:** WAE has a few-minute write-to-query latency; D1 rollups run hourly at minimum (or the cron has to be every 60s which costs more). KV "today" counters can be sub-second (eventual consistency ~60s for global propagation). Durable Objects are strongly consistent for "live now" but cost real money per-active-page-second. The competitive baseline is Beacons-Free showing real-time today (likely backed by their own KV-equivalent). Linktree-Pro is documented as "delayed" without specifying — likely 6-24h batch. Our floor should match Beacons; the question is what counts as "Pro+ live" worth gating.

**Opcje:**
1. Free + Creator: KV "today" tile updates every ~60s; historical tiles on hourly cron. Pro: same + 10s "live now" view via DO. Business: same + 1s push via DO+SSE.
2. Free: 6h batch (Linktree-style). Creator: hourly. Pro: 60s. Business: 10s.
3. All tiers: hourly only. No real-time anywhere.
4. All tiers: 60s real-time. No further differentiation on freshness.

**Twoja rekomendacja:** **Option 1.** Match Beacons floor on Free (60s "today"), gate the visually-impressive "live now" (DO-backed) at Pro. The DO cost is small at our expected DAU and the "watch a creator's page get hit in real time" view is a screenshot-worthy retention feature.

---

### DEC-077 — Click event coverage (every block vs outbound only vs sampled)

**Czego dotyczy:** Whether to write a WAE event on EVERY click on a block, only on clicks that navigate to an outbound URL, or sample.

**Szczegolowy opis:** A tadaify page has multiple block types: links (outbound URL), text/heading/image (no click), embed (e.g. video player), social-icon (outbound URL), expandable accordion (in-page interaction). Logging only outbound-link clicks misses accordion-opens and video-play events that creators care about ("did anyone actually watch the embedded video?"). Logging every interaction inflates write volume by ~2-3x. Sampling (e.g. 10% on free tier) saves write costs but misleads creators with "only 1 person clicked" when 10 did. WAE adaptive sampling already handles volume scaling at high traffic — our sampling decision is about whether to record the event at all, not how WAE stores it.

**Opcje:**
1. Log every block interaction (clicks, accordion-opens, video-play-starts, copy-button-clicks) for all tiers.
2. Log only outbound clicks for Free, every interaction for Creator+.
3. Log every interaction for all tiers, but sample 10% on Free, 100% on paid.
4. Log only outbound clicks for all tiers (simplest; matches Linktree).

**Twoja rekomendacja:** **Option 1 — log every interaction at all tiers.** WAE adaptive sampling protects us from write-volume blowups at scale, the marginal cost difference is negligible at our target DAU, and creators consistently complain about "I can't tell if anyone watched my video"-class blind spots. Log everything; gate via UI which interaction types are visible per tier (e.g., video-play visible only on Creator+).

---

### DEC-078 — Retention windows per tier

**Czego dotyczy:** How long we keep raw events vs rolled-up aggregates per tier, and whether Business "unlimited history" is real or marketing.

**Szczegolowy opis:** WAE retains raw events for 90 days regardless of tier — this is a Cloudflare-imposed cap. After that, only our D1 rollups remain. D1 rollups can persist indefinitely at trivial cost (~$0.75/GB/month). For Business "unlimited history", we either (a) keep daily/hourly rollups in D1 forever (cheap, but can't re-slice on a new dimension we didn't pre-aggregate), or (b) write nightly Parquet snapshots to R2 (slightly more flexible for ad-hoc re-slicing, $0.015/GB/month, but requires a Parquet query path to read back). The risk in (b) is exposing R2 download to Business users: they get a raw data dump, which competitors don't offer.

**Opcje:**
1. All tiers: D1 rollups kept forever (10y+); raw WAE drops at 90d. Business gets all rollup levels visible + monthly Parquet R2 archive download.
2. Free: 90d rollups only. Creator: 365d. Pro: 3y. Business: forever + Parquet.
3. All tiers: 365d rollups; older data dropped. Sell a "history" add-on for $5/mo extra.
4. Free: 30d. Creator: 90d. Pro: 365d. Business: forever.

**Twoja rekomendacja:** **Option 1.** D1 storage is so cheap that retention-as-a-tier-gate adds no margin and a lot of complexity. Keep rollups forever; the dashboard query window is what's actually gated by tier (Free sees only 7-day slices even if data exists for years). R2 Parquet for Business is the only thing that costs marginal money, and it's the headline feature for Business tier.

---

### DEC-079 — Show "unique visitors" at all, given cookieless caveat

**Czego dotyczy:** Whether to expose the "unique visitors" metric at all, knowing it's an estimate that creators may misinterpret.

**Szczegolowy opis:** With cookieless daily-salt methodology (DEC-075), "unique visitors" is per-day-only and over-counts cross-day. Creators looking at "1,000 unique visitors this month" will assume 1,000 distinct humans; actually it's ~30 days × ~33 unique visitors/day where the same people are double-counted. Plausible's GitHub discussion #970 notes this confusion is real among their users [Source: <https://github.com/plausible/analytics/discussions/970>]. The alternatives: (a) hide "unique visitors" entirely and show only "sessions" which is more honest; (b) expose unique visitors with a mandatory tooltip; (c) expose unique visitors per-day only, never aggregated. Each has UX trade-offs.

**Opcje:**
1. Show "unique visitors per day" with tooltip; aggregate views are pageviews/sessions only.
2. Show "unique visitors" at all aggregation levels with mandatory inline disclaimer.
3. Don't show unique visitors at all; show only pageviews + sessions + clicks.
4. Show unique visitors only on Pro+ where we can offer first-party cookie opt-in for accurate count.

**Twoja rekomendacja:** **Option 1.** This is the honest middle path: per-day unique-visitor count is accurate and useful (it's how Plausible/Simple Analytics frame it), and forcing aggregates to be sessions/pageviews keeps the number-meaning correct without hiding the metric entirely.

---

### DEC-080 — API access tier (Pro or Business only)

**Czego dotyczy:** Whether read-only analytics API access is a Pro feature or Business-only.

**Szczegolowy opis:** No competitor exposes a creator analytics API at any tier. This is a strong differentiator. The technical cost of exposing it is small (a Worker route reading D1 with rate-limit, JWT-keyed). The strategic question is whether to anchor it as "Pro flagship" (helping Pro stand out vs Creator) or as "Business power-creator perk" (helping Business stand out vs Pro). Stan Pro at $99/mo gates pixel integration but no API; Beacons Pro at $10/mo gates real-time but no API; nobody anywhere does API at $25/mo.

**Opcje:**
1. Pro: rate-limited (100 req/h). Business: higher rate (1000 req/h) + Parquet R2 download.
2. Business only: not on Pro at all. Drives upsell from Pro to Business.
3. Creator+: rate-limited 50 req/h on Creator, 500 on Pro, 5000 on Business. (Maximum addressable market.)
4. Add-on: $5/mo API add-on on top of any tier.

**Twoja rekomendacja:** **Option 1.** Pro gets the headline "first creator analytics API in the link-in-bio space" for marketing, with rate-limiting that prevents abuse. Business gets the volume bump + Parquet for the heavy users. Don't dilute it to Creator (cannibalises the Pro upsell) and don't gate it to Business-only (we lose the marketing-asset value).

---

## Phase 7 — Cost analysis

DAU = daily active *visitors* (not creators). Cost assumes Workers Paid baseline ($5/mo) is already paid (we are on it for the custom-domains plan anyway), so the deltas below are *marginal analytics-pipeline* costs only.

Assumptions per DAU:
- 1 pageview-event + 2 click-events per visitor session = 3 WAE writes.
- 1 KV write for "today" counter increment per pageview (batched to ~0.2 writes/visitor with debouncing).
- ~50 dashboard hits/creator/day = 50 D1 reads, each scanning ~10 rollup rows.
- Nightly cron: 1 WAE read query per creator per night.

### 7.1 Per-component cost at 1k / 10k / 100k / 1M DAU

(Figures for all-creators combined, in USD/month, marginal over the $5/mo Workers Paid baseline.)

| Component | 1k DAU | 10k DAU | 100k DAU | 1M DAU |
|---|---|---|---|---|
| WAE writes (3/visitor × 30d) | 90k/mo (free) | 900k/mo (free) | 9M/mo (free of 10M) | 90M/mo → $20 |
| WAE reads (~1k/mo for crons + ~1k/mo for live queries) | 2k (free of 1M) | 5k (free) | 30k (free) | 300k (free) |
| KV writes (~0.2/visitor × 30d) | 6k/mo (free) | 60k/mo (free) | 600k/mo → $3 | 6M/mo → $30 |
| KV reads (dashboard "today" tile, ~5/creator/day) | trivial | trivial | trivial | $1 |
| D1 writes (rollups: ~50 rows/creator/day × 100 creators × 30d = 150k) | 150k (free) | 1.5M (free of 50M) | 15M (free) | 150M → $100 |
| D1 reads (dashboard ~50/creator/day × 100 creators × 30d = 150k × ~10 rows scanned each = 1.5M) | 1.5M (free of 25B) | 15M (free) | 150M (free) | 1.5B (free) |
| D1 storage (~100 KB/creator/year) | <1 GB (free of 5 GB) | <1 GB (free) | ~5 GB (free) | ~50 GB → $35 |
| R2 storage (Business archives only; ~10% of creators × 1 GB/yr) | 0 | 1 GB → $0.02 | 10 GB → $0.15 | 100 GB → $1.50 |
| Durable Objects (Pro+ live view; ~1% of creators × 30s/day active) | $0 | $0.50 | $5 | $50 |
| **Total marginal** | **$0** | **~$1** | **~$10** | **~$240** |

So:
- **At 1k DAU:** $0/mo marginal — entirely within free tiers and the existing paid baseline.
- **At 10k DAU:** ~$1/mo. Trivial.
- **At 100k DAU:** ~$10/mo. Still trivial vs. $200/mo we're paying for Cloudflare Business plan + Custom Hostnames.
- **At 1M DAU:** ~$240/mo. Notable but well under $1k/mo and a minuscule fraction of revenue at that scale (1M DAU ≈ 100k+ paying creators × $8 = $800k/mo MRR).

### 7.2 Where the architecture breaks

The first cost-pressure point is **D1 writes** at 1M DAU (~$100/mo), driven by hourly rollups. Mitigation: switch to coarser cron frequency for low-volume creators (still hourly for top 10%, daily for the rest). Easy adjustment.

The second is **WAE writes** at >1M DAU (~$20/mo per million DAU). WAE adaptive sampling kicks in automatically; the cost reflects raw event count. If we went to 10M DAU we'd see ~$200/mo on WAE alone — still acceptable.

The architecture starts to require a redesign at ~50M DAU where R2-Parquet becomes the primary store and WAE is downstream-aggregated immediately (skip nightly batch). We are nowhere near that horizon in any 24-month plan.

### 7.3 At what DAU does cost cross $50/mo?

At ~500k DAU. Specifically:
- 500k DAU × 3 WAE writes/day × 30 = 45M writes/mo → $9 (over the 10M free)
- D1 writes for rollups: ~75M/mo → $25
- Other line items: ~$15

Total ~$50/mo at 500k DAU. At that point we are at >$5M/year ARR — the cost is rounding error.

### 7.4 At what DAU does cost cross $500/mo?

Extrapolating the curve, ~5M DAU. We'd be deep into reseller territory needing dedicated CF account negotiation by then.

---

## Phase 8 — Recommendations summary

### Ship in MVP (next 4 weeks of implementation)

The MVP scope corresponds to **Free + Creator $8 tiers only**. Concretely:

- Beacon Worker (`/b/v` and `/b/c`) on tadaify.com zone, integrated with the existing page-render Worker.
- WAE dataset `tadaify_events` with the schema in §4.3.
- KV "today" counter with hourly write-debounce.
- D1 rollup tables (`daily_pageviews`, `daily_clicks`, `daily_geo`, `daily_referrers`, `daily_devices`, `daily_utm`, `hourly_pageviews`).
- Cron Worker doing hourly + nightly rollups.
- Insights tab in the React SPA reading from D1 with the Free-tier and Creator-tier views (plus feature-flag gates for the bigger tiers — code path exists but UI hides them).
- Cookieless daily-salt for unique visitors.
- Bot Management score capture + filter.
- Cookie-consent gate (the Worker checks consent state and 204s if analytics consent is false).
- CSV export endpoint reading D1 → streaming response.
- Tooltips explaining methodology for unique visitors and bot filtering.
- ~~Real-time "live now" Pro+ feature~~ — feature-flag-off.
- ~~Read-only API~~ — feature-flag-off.

### Ship in Q+1

- Real-time "live now" via Durable Objects (Pro tier).
- Read-only Analytics API (Pro+).
- City-level geographic display (Pro+).
- Browser detail (Pro+).
- Saved views + scheduled email digests.
- A/B testing framework on blocks (uses the analytics pipeline as input).

### Ship in Q+2 or Business-only

- R2 Parquet archive download.
- Cross-creator benchmarks ("you're in the 75th percentile of fashion creators on TikTok-driven traffic").
- Custom segmentation builder (slice on any blob via UI).

### Never ship (out of scope)

- Cross-day visitor tracking via persistent cookies (breaks privacy promise).
- Per-visitor "session journey" replay (privacy concern + over-claim risk).
- Detailed bounce-rate / time-on-page (single-page surface makes them meaningless).
- ISP / network-operator detail (creator-irrelevant).
- Browser-version detail past family (creator-irrelevant; bloats UI).

### Open issues to file post-research

- `tadaify-app#NEW`: Implement Worker beacon route `/b/v`, `/b/c` with consent-gate.
- `tadaify-app#NEW`: WAE dataset schema + D1 rollup tables migration.
- `tadaify-app#NEW`: Cron Worker for hourly + nightly rollups (idempotent upsert).
- `tadaify-app#NEW`: Insights tab UI scaffolding (Free + Creator tier views).
- `tadaify-app#NEW`: Cookie-consent integration with analytics beacon.
- `tadaify-app#NEW`: Bot-filtering badge UI ("X bots filtered today").
- `tadaify-app#NEW`: CSV export endpoint + UI button.
- `tadaify-app#NEW`: Tooltips explaining cookieless methodology.
- (Q+1) `tadaify-app#NEW`: Real-time "live now" view via Durable Objects.
- (Q+1) `tadaify-app#NEW`: Read-only Analytics API + rate limiter.

---

## Appendix A — Worker pseudocode for the beacon route

```typescript
// in src/workers/page.worker.ts (single Worker on tadaify.com zone)

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);

    // Beacon ingest
    if (url.pathname === '/b/v' || url.pathname === '/b/c') {
      return await ingestBeacon(request, env, url.pathname === '/b/c');
    }

    // Normal page render
    return await renderCreatorPage(request, env);
  },
};

async function ingestBeacon(req: Request, env: Env, isClick: boolean) {
  // Read host (works for both tadaify.com subdomains and Custom Hostnames)
  const host = req.headers.get('host') ?? '';

  // Resolve creator
  const creator = await resolveCreator(host, await req.json(), env);
  if (!creator) return new Response(null, { status: 204 });

  // Consent gate
  const consent = await getConsentState(req, env);
  if (consent.analytics === false) return new Response(null, { status: 204 });

  // Bot scoring (CF zone-level)
  const botScore = (req as any).cf?.botManagement?.score ?? 100;
  const botBucket = botScore < 30 ? '0-29-bot' : botScore < 70 ? '30-69-likely-bot' : '70-100-human';

  // Daily-salt visitor hash; IP never persisted
  const ip = req.headers.get('cf-connecting-ip') ?? '';
  const ua = req.headers.get('user-agent') ?? '';
  const salt = await env.KV.get('salt:current') ?? '';
  const visitorHash = await sha256Hex(salt + ip + ua + creator.user_id);
  // ip and salt are now out of scope; never logged anywhere

  // Geographic from CF edge — no IP storage
  const country = (req as any).cf?.country ?? '??';
  const region = (req as any).cf?.region ?? '';
  const city = (req as any).cf?.city ?? '';

  const body = await req.json();

  // Referrer normalisation
  const refHost = body.r ? new URL(body.r).host : 'direct';
  const refPlatform = normaliseReferrer(refHost); // static lookup table

  // UTM
  const utmSource = body.utm_source ?? '';
  const utmMedium = body.utm_medium ?? '';
  const utmCampaign = body.utm_campaign ?? '';

  // UA classify
  const { device, os, browser, viewport } = parseUA(ua, body);

  // Outbound (clicks only)
  const outboundHost = isClick && body.u ? new URL(body.u).host : '';

  // Write to WAE
  env.TADAIFY_EVENTS.writeDataPoint({
    indexes: [creator.user_id],
    blobs: [
      isClick ? 'click' : 'view',
      body.p ?? '/',
      isClick ? body.b ?? '_' : '_',
      host,
      country,
      city,
      region,
      device,
      os,
      browser,
      refHost,
      refPlatform,
      utmSource,
      utmMedium,
      utmCampaign,
      botBucket,
      viewport,
      visitorHash.substring(0, 16),
      outboundHost,
      String(body.seq ?? 1),
    ],
    doubles: [1, body.vw ?? 0, body.vh ?? 0],
  });

  // Increment "today" counter (KV) for human traffic only
  if (botBucket === '70-100-human' && !isClick) {
    const day = new Date().toISOString().slice(0, 10);
    const k = `views:${creator.user_id}:${day}`;
    // Read-modify-write is OK here; KV eventual consistency means occasional drift
    // In practice: batch via Durable Object on Pro+; on Free/Creator simple increment
    const cur = parseInt((await env.KV.get(k)) ?? '0', 10);
    await env.KV.put(k, String(cur + 1), { expirationTtl: 86400 * 32 });
  }

  return new Response(null, { status: 204 });
}
```

This is sketch-quality — production version needs error handling, retries on KV writes, and the salt-rotation grace-period logic.

---

## Appendix B — Sources

All citations from this document, deduplicated:

### Cloudflare official documentation
- [Cloudflare Analytics — overview](https://developers.cloudflare.com/analytics/)
- [Workers Analytics Engine — overview](https://developers.cloudflare.com/analytics/analytics-engine/)
- [Workers Analytics Engine — pricing](https://developers.cloudflare.com/analytics/analytics-engine/pricing/)
- [Workers Analytics Engine — limits](https://developers.cloudflare.com/analytics/analytics-engine/limits/)
- [Workers Analytics Engine — sampling](https://developers.cloudflare.com/analytics/analytics-engine/sampling/)
- [GraphQL Analytics API](https://developers.cloudflare.com/analytics/graphql-api/)
- [D1 — pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [D1 — limits](https://developers.cloudflare.com/d1/platform/limits/)
- [Workers KV — pricing](https://developers.cloudflare.com/kv/platform/pricing/)
- [R2 — pricing](https://developers.cloudflare.com/r2/pricing/)
- [Durable Objects — pricing](https://developers.cloudflare.com/durable-objects/platform/pricing/)
- [Durable Objects SQLite billing changelog](https://developers.cloudflare.com/changelog/2025-12-12-durable-objects-sqlite-storage-billing/)
- [Web Analytics — Core Web Vitals](https://developers.cloudflare.com/web-analytics/data-metrics/core-web-vitals/)
- [Cloudflare blog — RUM by default](https://blog.cloudflare.com/the-rum-diaries-enabling-web-analytics-by-default/)
- [Cloudflare blog — Browser Insights / Web Vitals](https://blog.cloudflare.com/start-measuring-web-vitals-with-browser-insights/)

### Reference implementations
- [Counterscale — self-hosted CF analytics](https://counterscale.dev/)
- [Counterscale on GitHub](https://github.com/benvinegar/counterscale)
- [Plausible — data policy + cookieless methodology](https://plausible.io/data-policy)
- [Plausible — unique visitor methodology discussion](https://github.com/plausible/analytics/discussions/1150)
- [Plausible — unique visitor caveat discussion](https://github.com/plausible/analytics/discussions/970)
- [Plausible — bot-traffic test](https://plausible.io/blog/testing-bot-traffic-filtering-google-analytics)

### Competitor analytics pages
- [Linktree — pricing](https://linktr.ee/s/pricing)
- [Linktree — Insights help](https://help.linktr.ee/en/articles/5434178-understanding-your-insights)
- [Linktree — CSV download](https://linktr.ee/help/en/articles/5707122-how-to-download-a-csv-of-your-analytics-activity)
- [Linktree — lifetime clicks/views announcement](https://linktr.ee/blog/lifetime-clicks-views-analytics)
- [Beacons review (Hastewire)](https://hastewire.com/blog/beacons-ai-review-features-pricing-and-user-insights)
- [Beacons review (Skywork)](https://skywork.ai/skypage/en/Beacons-AI-Review-2025-Is-This-The-Ultimate-Beacon-for-Creator-Success/1973913389733310464)
- [Beacons vs Linktree (StewartGauld)](https://stewartgauld.com/beacons-vs-linktree/)
- [Beacons vs Linktree (TheLeap)](https://www.theleap.co/blog/beacons-vs-linktree/)
- [Beacons vs Linktree 2026 (Linkero)](https://linke.ro/blog/beacons-vs-linktree)
- [Bento.me](https://bento.me/en/home)
- [Stan Store — Creator Pro features](https://help.stan.store/article/407-creator-pro-features)
- [Stan Store — Analytics help collection](https://help.stan.store/collection/322-analytics)
- [Carrd Pro — features](https://carrd.co/docs/pro/features)
- [Liinks — UTM tracking](https://www.liinks.co/blog/how-to-use-the-free-liinks-utm-link-builder-to-track-campaign-traffic)
- [Liinks — analytics advantage](https://www.liinks.co/blog/the-analytics-advantage-unlocking-data-to-drive-your-link-in-bio-success)
- [Direct.me — link-in-bio analytics guide](https://creatorblog.direct.me/link-in-bio-analytics-a-beginners-guide-to-track-performance/)

### Creator economy & frustration sources
- [Linktree review — Autoposting](https://autoposting.ai/linktree-review/)
- [Linktree pros/cons — BioTree](https://biotree.bio/blog/linktree-free-vs-pro)
- [Linktree review — Creator-Hero](https://www.creator-hero.com/blog/linktree-review-and-pricing)
- [Linktree free vs pro 2026 — Talkspresso](https://talkspresso.com/blog/linktree-free-vs-pro-features-2026)
- [Indie Hackers — analytics dashboard frustration](https://www.indiehackers.com/post/i-built-an-analytics-dashboard-for-indie-devs-tired-of-paying-450-month-for-sensor-tower-43c175a0bd)
- [DataSag — lightweight analytics for indie hackers](https://www.datasag.com/blog/lightweight-analytics-tools-indie-hackers)
- [TokPortal — TikTok bio link UTM](https://www.tokportal.com/post/tiktok-link-in-bio-setup-utm-tracking-best-practices)
- [Bitly — link-in-bio social referrals](https://bitly.com/blog/link-in-bio-to-track-social-referrals/)
- [Beehiiv — link-in-bio rant](https://www.beehiiv.com/blog/link-in-bio-tool)
- [Stan blog — best link-in-bio platforms](https://stan.store/blog/best-link-in-bio-platforms/)

### GDPR / IP anonymisation
- [GDPR Analytics — IP anonymisation methods](https://gdpranalytics.com/ip-anonymization-how-it-works-in-different-analytics-tools/)
- [Frank Denis — why IP truncation fails](https://00f.net/2025/10/27/ip-anonymization/)
