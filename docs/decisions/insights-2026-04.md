---
type: decisions
project: tadaify
title: Insights & analytics decisions log — DEC-073 through DEC-083
created_at: 2026-04-26T07:10:00Z
---

# Insights & analytics decisions log — DEC-073 through DEC-083

Locked decisions from the Insights & analytics product session (2026-04-26).
Source data: `/tmp/claude-decisions/decisions.json` (volatile — reboot clears it).
This file is the durable, repo-tracked record.

---

## DEC-073 — Billing hybrid (Stripe Portal)

**Question:** Should billing management use a custom in-app UI or Stripe Customer Portal (or hybrid)?

**Options considered:**
- Fully custom in-app billing UI
- Redirect 100% to Stripe Customer Portal
- Hybrid: in-app plan summary + upgrade flow + Stripe Portal for invoice/card management

**Decision:** Hybrid approach. In-app: plan overview, upgrade CTA, subscription status. Stripe Portal: invoice history, payment method changes, cancellation. This keeps the core upgrade path on-product (conversion) while offloading invoice/card management complexity to Stripe.

**Status:** Answered (2026-04-26)

**Cross-references:** Affects issue #34 (Billing tab), DEC-083 (pricing), issue #33 (Account tab Stripe portal link).

---

## DEC-074 — Handle redirect target (30-day grace period)

**Question:** When a creator changes their handle (e.g. @alex → @alexandra), where does the old URL redirect for the 30-day grace period?

**Options considered:**
- Redirect to new primary handle URL
- Show a "this creator moved" page with a link to new URL
- No redirect (immediately 404)

**Decision:** Redirect to new primary handle URL for 30 days. After 30 days, the old handle is released for re-registration. This is an implementation detail (not marketing-visible) but is relevant to the URL routing design in Phase B multi-handle architecture.

**Status:** Answered (2026-04-26)

**Cross-references:** DEC-083 (multi-handle architecture), Phase B — issue handle routing decisions.

---

## DEC-075 — Cookieless unique visitor methodology

**Question:** Cookieless unique visitor methodology (Plausible-style daily salt vs cookie-based vs hybrid vs no-uniques)

**Options considered:**
1. Cookieless daily-salt (Plausible-style)
2. First-party visitor cookie (per-creator, 30-day TTL)
3. Hybrid — cookieless default, opt-in cookie after consent
4. No unique visitors metric at all

**Decision:** Option 1 — cookieless daily salt. Additionally elevated by user to PRIMARY marketing positioning: "privacy-first, no cookies, no tracking" is now a flagship message that needs to land on landing page + every relevant surface. Insights UI must show approximate unique visitors with prominent inline explanation of why it's an approximation, why we chose this trade-off (no cookie banners, no annoyance, better UX even at slight accuracy cost), framed as a feature not a limitation. Triggers two new stories (landing flagship + Insights UI) plus dedicated Insights UI requirement.

**Status:** Answered (2026-04-26T05:35:46Z)

**Cross-references:** Issue #41 (Privacy flagship landing), Issue #45 (Insights tab — DEC-079 tooltip), DEC-079 (uniques display), marketing pillar #1.

---

## DEC-076 — Dashboard refresh cadence and depth-based tier gating

**Question:** Dashboard refresh cadence per tier (Insights tab data freshness) — REVISED after user challenged whether real-time has actual creator value

**Options considered:**
1. Free+Creator: KV today (~60s) + hourly historical. Pro: + DO live (10s). Business: + DO+SSE 1s.
2. Free: 6h batch (Linktree-style). Creator: hourly. Pro: 60s. Business: 10s.
3. All tiers: hourly only. No real-time anywhere.
4. All tiers: 60s real-time (DO for everyone).
5. USER VARIANT: Free=60min stale. Creator=5min stale. Pro=live (DO-backed). Business=live + REPLAY.
6. OPTION 6: All tiers get 60s today + hourly historical (no live, no DO). Tier-gating on DEPTH.
7. OPTION 7: Cadence-tiered AND depth-tiered hybrid.
9. OPTION 9: Honest gating split into 3 categories — Category A (real infra cost), Category B (storytelling, user-accepted), Category C (UNGATED — was fake margin).

**Decision:** Option 9 — honest gating per Cat A/B/C classification (no fake margin).
- **Free**: FULL dataset (cross-tab unlimited, top-N unlimited, geo country+city, device/browser/referrer full) at hourly cadence + 7d window.
- **Creator**: 5min cadence + 90d window.
- **Pro**: real-time via HTTP polling 60s (KV today counter, NOT DO+SSE push per DEC-082 Option 6) + 1y window + API 100/h + saved views + daily CSV.
- **Business**: real-time polling + replay scrub via DO+SSE for short sessions only (DO+R2) + A/B + identity stitching + scheduled email digests + Parquet R2 archive + 1000 req/h API.
- Category C features that are **NOT gated** (free at all tiers): cross-tab dimensions (unlimited), top-N counts (unlimited), geographic detail (country+city), device/browser detail, referrer detail — all same SQL slicing, no cost differential.
- Triggers third marketing pillar: "Most generous Free in link-in-bio analytics" parallel to DEC-075 (privacy-first) and DEC-080 (first creator API).
- Architecture cost: ~$195/mo at 1M DAU (revised per DEC-082 Option 6 polling architecture; was $235 under DO+SSE push).

**Status:** Answered (2026-04-26T06:10:34Z)

**Cross-references:** Issue #43 (Generous-Free flagship), Issue #45 (Insights tab tier display), DEC-082 (polling architecture supersedes DO push for Pro live), DEC-083 (tier pricing), marketing pillar #3.

---

## DEC-077 — Click event coverage

**Question:** Click event coverage — every block / outbound only / sampled

**Options considered:**
1. Every interaction (click/accordion/video/copy) all tiers
2. Outbound-only Free, every interaction Creator+
3. Sample 10% Free, 100% paid
4. Outbound-only all tiers (Linktree match)

**Decision:** Option 1 — log every interaction at all tiers. WAE adaptive sampling protects from write-volume blowups; tier-gate via UI which interaction types are visible per tier. Key differentiator vs competitor blind spots ("I can't tell if anyone watched my video"). Cost: +$13/mo at 1M DAU vs outbound-only — negligible vs revenue impact.

**Status:** Answered (2026-04-26T05:53:42Z)

**Cross-references:** Issue #45 (Insights tab UI — interaction type visibility by tier).

---

## DEC-078 — Retention windows per tier

**Question:** Retention windows per tier — raw events vs aggregates

**Options considered:**
1. D1 rollups forever for all; raw WAE drops at 90d (CF cap); Business gets R2 Parquet monthly archive
2. Tiered retention 90d/365d/3y/forever
3. All 365d, history $5/mo add-on
4. Tiered 30/90/365/forever

**Decision:** Option 1 — D1 rollups forever; UI gates query window by tier (Free=7d, Creator=90d, Pro=1y, Business=unlimited slices on same data); raw WAE 90d cap (CF-imposed). Business: + R2 Parquet monthly archive — only paid line item beyond baseline. Trust signal ("your data stays"). Cost: +$1.50/mo at 1M DAU for R2.

**Status:** Answered (2026-04-26T05:53:42Z)

**Cross-references:** Issue #45 (Insights tab — time window UI per tier), DEC-076 (depth gating), DEC-080 (Parquet R2 for Business API downloads).

---

## DEC-079 — Show "unique visitors" with cookieless caveat

**Question:** Show "unique visitors" given cookieless caveat

**Options considered:**
1. Show per-day unique with tooltip; aggregates = pageviews/sessions
2. Show uniques at all aggregations with disclaimer
3. Hide uniques entirely
4. Uniques only on Pro+ with cookie opt-in

**Decision:** Option 1 — show "unique visitors per day" with prominent ⓘ tooltip explaining cookieless methodology + trade-off (Mon+Tue same person = 2 visitors); aggregate views (week/month) show pageviews/sessions only — honest framing. Footer banner "Cookieless analytics. No cookie banner shown to your visitors." as recurring privacy-first flex. Zero cost differential.

**Tooltip text (verbatim — use exactly this in the Insights tab implementation):**

> **About this number**
> This is an approximate count. We don't track you across visits — no cookies, no fingerprinting. We use a privacy-first method that counts unique visitors per day.
>
> **Trade-off:** if the same person visits Monday and Tuesday, we count them as 2 visitors (not 1).
>
> **Why we do this:** cookie banners annoy your visitors and hurt your conversion. We chose a slightly fuzzy number over an annoying experience for your audience. Most creators tell us they'd rather have happy visitors than perfectly precise analytics.
>
> [Learn more →] (link to a /how-we-count page or expandable section)

**Status:** Answered (2026-04-26T05:53:42Z)

**Cross-references:** Issue #45 (Insights tab — unique visitors tile + tooltip), DEC-075 (cookieless methodology), marketing pillar #1 (privacy-first).

---

## DEC-080 — API access tier

**Question:** API access tier — Pro+rate-limited vs Business-only vs Creator+ vs add-on

**Options considered:**
1. Pro: 100 req/h. Business: 1000 req/h + Parquet R2 download.
2. Business only — drives Pro→Business upsell.
3. Creator+: 50/500/5000 req/h ladder.
4. $5/mo API add-on on top of any tier.

**Decision:** Option 1 — Pro 100 req/h, Business 1000 req/h + Parquet R2. ALSO elevated to PRIMARY MARKETING POSITIONING parallel to DEC-075 privacy-first: "first creator analytics API in link-in-bio space" is a flagship message that needs to land on landing page + cross-mockup audit + Insights tab. Triggers parallel set of stories: landing.html API flagship section, audit catalog flag, Insights tab API teaser/CTA.

**Status:** Answered (2026-04-26T05:48:05Z)

**Cross-references:** Issue #42 (API flagship landing), Issue #45 (Insights tab API tile), DEC-078 (Parquet R2 for Business), marketing pillar #2.

---

## DEC-081 — Research SPIKE acceptance gate

**Question:** Research doc acceptance gate — accept / accept with revisions / reject

**Options considered:**
1. Accept, dispatch mockup work
2. Accept with revisions
3. Reject, redo research

**Decision:** Option 1 — accepted. PR #40 merged. Dispatched Sonnet for 4 stories: F-LANDING-PRIVACY-FIRST-001 + F-LANDING-API-FLAGSHIP-001 + F-MOCKUP-AUDIT-FEATURE-PROMINENCE-001 + F-APP-INSIGHTS-001.

**Status:** Answered (2026-04-26T05:53:42Z)

**Cross-references:** `docs/research/insights-metrics-feasibility.md` (the accepted SPIKE, PR #40).

---

## DEC-082 — Polling architecture for live-view (hard cost cap on Durable Objects)

**Question:** Hard cost cap on Durable Objects spend for Pro+ live-view feature — RE-OPENED after DEC-076=Option 9 reintroduced DO live (Pro+) and DO replay (Business) into architecture

**Options considered:**
1. No hard cap; monitor + alert at $X threshold; rely on engineering controls
2. Hard $/mo cap per environment ($200/mo); auto-throttle when cap reached
3. Per-creator hard cap (4h live-view/day); no environment-level cap
4. Hybrid: per-creator daily cap + environment-level monthly soft alert
5. Three-layer architecture (per-creator daily caps + env-level budget caps + anomaly detection cron)
6. OPTION 6 (FINAL): Pro live view is HTTP polling 60s (KV-based, no DO, no continuous connection) — industry standard (Plausible/Fathom/Simple Analytics). NO PER-CREATOR CAP on Pro live view (polling has zero abuse vector). Per-creator cap ONLY on Business replay (60min/day total scrub time — DO-backed, real cost). Layer B: env-level monthly budget cap $200/mo across all categories (DO+WAE+email+R2). Layer C: anomaly detection cron (5min) with alerts at 2× rolling 7-day baseline + single-creator >50% daily WAE share + budget thresholds. Forward-compatible env vars throughout.

**Decision:** Option 6 — polling-based architecture. Pro live view = HTTP polling 60s (KV today counter), zero abuse vector, NO PER-CREATOR CAP needed. Business replay = DO+SSE for scrub sessions only, capped 60min/day per Business creator. Layer B environment-level $200/mo total budget hard cap unchanged. Layer C anomaly detection unchanged. Industry-standard pattern (matches Plausible/Fathom/Simple Analytics). Architecture simpler + cheaper (~$195/mo at 1M DAU vs $235 with DO push). Pro live-view experience truly unlimited.

**Status:** Answered (2026-04-26T06:27:58Z)

**Cross-references:** DEC-076 (supersedes the DO+SSE architecture for Pro live view), Issue #45 (Insights tab real-time polling implementation).

---

## DEC-083 — Pro and Business tier pricing

**Question:** Pro and Business tier pricing — 3 variants per no-fake-margin rule (Creator locked at $8/mo per DEC-PRICELOCK-01) — REFINED with agency multi-seat dimension

**Options considered:**
1. Cost-based minimum margin: Pro $9/mo, Business $20/mo
2. Competitor-matching: Pro $24/mo (Linktree Premium match), Business $99/mo (Stan Pro match)
3. Orchestrator recommended: Pro $19/mo, Business $49/mo
4. USER VARIANT (single agency pack): Pro $19 (1 seat). Business $89/mo includes 10 seats, +$8.99/seat over 10.
5. OPTION 5 (tiered agency packs): Pro $19 (1 seat). Business Starter $49/mo for 3 seats. Business Agency $89/mo for 10 seats. Add-on seats $8.99/each.

**Decision:** FINAL — single Business tier (no Starter/Agency split). Pro $19 (1 handle). Business $49/mo includes 5 handles + 10 team members + all Business features (replay, A/B, identity stitching, scheduled digests, Parquet R2 archive, 1000 req/h API). Add-on: $9.99/mo per additional handle (subscription model parallel to $2 custom domain). Team members FREE/included up to 10 (cost ~$0 thanks to polling architecture; cap is for support-load + abuse prevention). Agency-scale (>30 handles or >10 team members): contact support / custom deal — no fixed pricing in MVP. Triggers 4th marketing pillar: "Agency-friendly: 5 handles + 10 team members for $49/mo".

**Status:** Answered (2026-04-26T06:31:38Z)

**Cross-references:** Issue #38 (Team feature rescope to Business-only, 10-member cap), DEC-083 4th marketing pillar, Phase B — F-APP-MULTI-HANDLE-001 (new story), landing.html agency flagship section (future), pricing.html update.

---

## How this list is maintained

DECs go through the orchestrator's `/tmp/claude-decisions/decisions.json` first (volatile — `/tmp` is cleared on reboot). When a DEC is answered and stable, it is persisted here under a PR to `docs/decisions/`. This file is the durable, version-controlled record.

The `/tmp` file is the working scratchpad; this file is the source of truth for any agent reading historical decisions.

To add new DECs: edit this file in a `docs/` branch PR alongside any relevant issue body updates. The `decisions.json` entry remains the runtime record during active sessions.

---

## Open DECs (Phase B)

The following decision areas are NOT YET LOCKED. They are queued as DEC-084..DEC-090+ and will be filed in a follow-up session after the Phase B multi-handle architecture SPIKE completes:

- **URL routing convention**: `/app/{handle}/...` vs `/app/...?handle={handle}` vs subdomain routing — needs multi-handle SPIKE to determine CF Workers routing pattern
- **Per-handle vs per-account scoping** for Settings tabs: Account, Billing, API Keys, GDPR export, Danger — some of these are naturally account-level (Billing), some should be handle-level (API Keys scoped to a handle, GDPR export per-handle vs aggregate)
- **Solo-Business default UX**: when a Business user has only 1 handle, do they see the profile switcher at all? Or does it appear only when they add a 2nd handle?
- **GDPR export aggregation**: does the "Export my data" button export all handles in one ZIP, or one handle at a time? (Art. 20 portability)
- **Delete-handle vs delete-account separation**: deleting a secondary handle should NOT delete the account; deleting the primary handle may require handle reassignment before deletion
- **Add-on handle subscription flow**: Stripe subscription_item for $9.99/mo per additional handle — how does downgrade (removing a handle) interact with the subscription item?
- **Team member cross-handle visibility**: can an admin team member see all handles in the Business account, or only the one they were invited under?

Multi-handle SPIKE must be dispatched BEFORE any Phase B implementation stories are filed. See `docs/research/insights-implementation-context.md` for Phase B queue detail.
