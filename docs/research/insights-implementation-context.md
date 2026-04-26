---
type: research
project: tadaify
title: Insights implementation context — Phase A scope, marketing pillars, UI copy, Phase B queue
created_at: 2026-04-26T07:10:00Z
supersedes: /tmp/tadaify-insights-pending-work.md (volatile working notes — cleared on reboot)
---

# Insights implementation context — Phase A scope, marketing pillars, UI copy, Phase B queue

This document is the single place a new agent goes to understand:
- What was decided (Insights product session 2026-04-26, DEC-075..DEC-083)
- Why it was decided (strategic rationale)
- What ships in Phase A (issues #38, #41–#45)
- What is explicitly queued for Phase B (multi-handle SPIKE + sub-decisions)
- Exact UI copy, tone rules, and verbatim strings the implementation agent must use

Full DEC text lives in `docs/decisions/insights-2026-04.md`. This doc summarises and adds the "what to build" layer on top.

---

## Quick DEC status table

| DEC | Topic | Answer | Phase |
|-----|-------|--------|-------|
| DEC-073 | Billing: Stripe Portal hybrid | Hybrid (in-app plan + Portal for invoices) | A (issues #33–#34) |
| DEC-074 | Handle redirect grace period | Redirect to new handle for 30 days | B (URL routing) |
| DEC-075 | Cookieless unique visitors | Option 1: daily salt — MARKETING PILLAR #1 | A (issue #41, #45) |
| DEC-076 | Refresh cadence + depth gating | Option 9: honest gating (Cat A/B/C) — MARKETING PILLAR #3 | A (issues #43, #45) |
| DEC-077 | Click event coverage | Option 1: log all interactions, gate UI visibility | A (issue #45) |
| DEC-078 | Retention windows | Option 1: D1 rollups forever, R2 Parquet for Business | A (issue #45) |
| DEC-079 | Show uniques with caveat | Option 1: per-day with ⓘ tooltip, aggregates = pageviews/sessions | A (issue #45) |
| DEC-080 | API access tier | Option 1: Pro 100 req/h, Business 1000 req/h — MARKETING PILLAR #2 | A (issues #42, #45) |
| DEC-081 | Research SPIKE acceptance | Accepted (PR #40 merged) | Done |
| DEC-082 | Live-view polling vs DO | Option 6: HTTP polling (no DO for Pro), Business replay only via DO | A (issue #45 arch) |
| DEC-083 | Pro/Business pricing | Pro $19 (1 handle), Business $49 (5 handles + 10 members) | A (pricing.html) |

For full option text and rationale, see `docs/decisions/insights-2026-04.md`.

---

## The four marketing pillars (locked 2026-04-26)

These are not features — they are the product's flagship VALUE PROPS. They must be visible and prominent on landing.html, pricing.html, onboarding-tier.html, and any creator-facing UI surface.

### Pillar #1 — Privacy-first (DEC-075)

**Headline copy:** "🔒 No cookies. No tracking. Ever."

**Soft proof:** "your visitors don't see a cookie banner. ever."

**Badge row (4 items):**
- 🔒 no cookies
- 👁️‍🗨️ no fingerprinting
- 🇪🇺 GDPR-clean by design
- 🤝 your visitors stay happy

**Comparison row label:** "Cookie banner required" — Linktree=✗ required / Beacons=✗ required / Stan=✗ required / Bento=✗ required / Tadaify=✓ never

**Tone rules:**
- Reassuring, not preachy. Don't lecture about privacy; sell it as a UX win.
- Frame as: "more conversion because no banner" and "values match for their audience"
- Do NOT say "privacy is important for humanity" — that's preachy
- No GDPR article numbers, no "salted hash", no "anonymous identifier" in user-facing copy
- Expandable "How it works" section for technical readers (≤120 words, plain language)

**"How it works" expandable content (plain language, no jargon):**
> We count visitors without storing anything on their device. Each day, we combine your visitor's general location and browser type with a secret code that changes every 24 hours. The result tells us whether two visits came from the same person today — but we can't connect visits across different days. No cookie. No fingerprint. Nothing installed. Just math that forgets itself daily.

### Pillar #2 — First creator analytics API in link-in-bio (DEC-080)

**Headline copy:** "🔌 First creator analytics API in link-in-bio"

**Soft proof:** "every other platform locks your data inside their dashboard. Tadaify gives you the keys."

**Badge row (4 items):**
- 🔌 first creator API
- 📊 your data, your tools
- 🦾 build dashboards / Slack bots / iOS widgets
- ⚡ send yourself a DM when your link hits 100 clicks

**Comparison row label:** "Public API access" — Linktree=✗ No / Beacons=✗ No / Stan=✗ No / Bento=✗ No / Tadaify=✓ Pro+

**Code snippet tile (copy-pasteable, max 10 lines):**
```bash
curl -H "Authorization: Bearer sk_tdf_your_key_here" \
  "https://api.tadaify.com/v1/insights/clicks?from=7d"

# Response:
{
  "blocks": [
    { "id": "spotify-link", "clicks": 1240, "top_source": "tiktok.com" },
    { "id": "merch-store", "clicks": 387, "top_source": "instagram.com" }
  ]
}
```

**Tone rules:**
- Empowerment framing only: "your data, your tools" / "build your own"
- No competitor names in the section body (comparison row in matrix is sufficient)
- Use creator-centric examples alongside developer ones: "Send yourself a DM when your link hits 100 clicks" alongside "Slack bot" and "iOS widget"
- Do NOT show rate limit numbers (100/h Pro, 1000/h Business) in the section body — those belong on pricing page
- Mention API keys are in Settings → API Keys (tooltip or footnote)

### Pillar #3 — Most generous Free tier in link-in-bio analytics (DEC-076)

**Headline copy:** "🎁 The most generous Free tier in link-in-bio analytics. Period."

**Trust badge:** "🎁 No data hidden behind paywall. Free creators get the full dataset."

**Free tier includes comparison:**
- Linktree Free: basic click counts only
- Beacons Free: real-time today + flat list
- Bento Free: limited features
- Stan Free: ❌ (paid-only platform)
- Tadaify Free: ✅ ALL data — cross-tab analysis, geo+city, devices, referrers — hourly cadence + 7-day window

**Price comparison data point:** "Cross-tab analysis: Linktree Premium $24/mo. Tadaify Free: $0."

**Tone rules:**
- Confident generosity, not gloating. Sell as "we believe in fair tools" not "competitors are evil"
- Frame Free as VALID and COMPLETE — not as a trial that nags
- "Your data is your data" energy
- Free users feel respected; no FOMO copy, no countdown timers
- Do NOT say "upgrade to unlock full data" — Free already has the full data
- Upgrade pulls are about freshness (faster cadence), history (longer window), and power features (API, replay) — NOT about having data at all

### Pillar #4 — Agency-friendly Business (DEC-083) — Phase B work pending

**Headline copy:** "👥 5 handles + 10 team members for $49/mo. Built for music labels, talent agencies, content studios."

**Comparison row:** "Multi-creator support" — Linktree=No / Beacons=No / Stan=No / Tadaify Business=Yes (5 handles + 10 members)

**Soft proof:** "managing 10 creators? You'd pay $190/mo on Linktree Premium. With Tadaify Business that's $49 + $9.99 per handle beyond 5."

**Tone:** "for the people running the show" — agency operators, label managers, content producers

> ⚠️ **Phase B — DO NOT IMPLEMENT YET.** Pillar #4 landing section is blocked on multi-handle architecture SPIKE. The multi-handle architecture (F-APP-MULTI-HANDLE-001) must be specced and its sub-decisions locked (DEC-084..DEC-090+) before pillar #4 lands on landing.html and before the agency angle is added to pricing.html.

---

## Insights tab (issue #45) — key UI requirements

### Unique visitors tile (DEC-079 — verbatim copy required)

The "Unique visitors" tile shows the number with a small ⓘ icon next to the label. Hovering / tapping the icon reveals this tooltip (copy verbatim):

> **About this number**
> This is an approximate count. We don't track you across visits — no cookies, no fingerprinting. We use a privacy-first method that counts unique visitors per day.
>
> **Trade-off:** if the same person visits Monday and Tuesday, we count them as 2 visitors (not 1).
>
> **Why we do this:** cookie banners annoy your visitors and hurt your conversion. We chose a slightly fuzzy number over an annoying experience for your audience. Most creators tell us they'd rather have happy visitors than perfectly precise analytics.
>
> [Learn more →] (link to a /how-we-count page or expandable section)

**Aggregate views (week/month) show "Pageviews" or "Sessions" — NOT "Unique visitors"** (only daily view shows uniques; this is honest framing).

### Footer banner (recurring on every Insights tab load)

"🔒 Cookieless analytics. No cookie banner shown to your visitors."

This is a soft, non-intrusive banner at the bottom of the Insights tab. It reinforces the privacy pillar on every dashboard visit.

### Tier-specific UI elements

**Free user viewing Insights:**
- Small "🎁 Free tier — full dataset, hourly refresh" pill near header — reassurance that they have full access
- Tooltip on the pill: "Tadaify Free includes all data dimensions — cross-tab, geo, devices, referrers. Other platforms gate this behind paid tiers. Upgrade to Creator or Pro for faster refresh and longer history."
- Locked sections (live view, API, saved views): "Available on Pro" pill — soft upsell, NOT greyed-out-with-modal

**Pro/Business user viewing Insights:**
- "API Access" tile in top-right of page header showing rate-limit usage ("47 / 100 req/h used today") + link to Settings → API Keys
- This doubles as: visible reminder they have API access + soft prompt to use it

**Free/Creator user viewing Insights (API section):**
- Small "🔌 API Access — available on Pro" pill near top-right
- Tooltip: "Build your own dashboards, Slack bots, iOS widgets. First creator analytics API in link-in-bio. [Upgrade to Pro →]" — soft upsell, not pushy modal
- Public docs link in tab footer: "[API documentation →]" so creators can preview before upgrading

### Tier gating summary (what's gated and what's NOT)

**Category A — real infra cost, gated:**
- Live view (Pro+): HTTP polling 60s via KV — $0.04/creator/month, essentially free but categorically a "real-time" feature
- Business replay: DO+SSE scrub sessions, capped 60min/day — real DO duration cost
- Parquet R2 archive (Business): real R2 storage + read cost
- Scheduled email digests (Business): email API cost
- A/B testing (Business): compute cost
- Identity stitching (Business): compute cost
- API rate limits (Pro 100/h, Business 1000/h): rate limiter infra

**Category B — storytelling, user-accepted, gated:**
- Cadence (Free=hourly / Creator=5min / Pro=real-time polling / Business=real-time)
- Time window (Free=7d / Creator=90d / Pro=1y / Business=unlimited)
- Saved views (Pro+)
- CSV export frequency (daily for Pro)

**Category C — NOT gated (same cost across tiers, forbidden to gate):**
- Cross-tab dimensions: UNLIMITED for ALL tiers
- Top-N counts: UNLIMITED for ALL tiers
- Geographic detail: country + city for ALL tiers
- Device/browser detail: ALL tiers
- Referrer detail: full list for ALL tiers

---

## Differentiator catalog (for cross-mockup audit — issue #44)

Audit all mockups against this catalog. Score: 0=invisible / 1=mentioned / 2=prominent.

| # | Differentiator | Category | Issues |
|---|---------------|----------|--------|
| 1 | 🚩 **FLAGSHIP**: Privacy-first / no cookies / GDPR-clean | DEC-075 | #41, #45 |
| 2 | 🚩 **FLAGSHIP**: First creator analytics API in link-in-bio | DEC-080 | #42, #45 |
| 3 | 🚩 **FLAGSHIP**: Most generous Free in link-in-bio analytics | DEC-076 | #43, #45 |
| 4 | Locked-for-life pricing | DEC-PRICELOCK-01 | pricing.html |
| 5 | $2 universal custom domain | DEC-PRICELOCK-02 | pricing.html |
| 6 | Stripe-Portal-hybrid Billing | DEC-073 | #33, #34 |
| 7 | Handle 30-day redirect to primary URL | DEC-074 | future |
| 8 | Full block-interaction tracking (every click type) | DEC-077 | #45 |
| 9 | Forever data retention (D1 rollups) | DEC-078 | #45 |
| 10 | Business replay (scrub past traffic) | DEC-082 | #45 |
| 11 | Pages + Home sidebar IA (not "Homepage") | UI/IA rule | all app mockups |
| 12 | Agency-friendly Business (5 handles + 10 members $49) | DEC-083 | 🚩 Phase B flagship |

Items #1, #2, #3 must score 2/2 (visible + prominent) on landing.html, pricing.html, and onboarding-tier.html. Items #4–#5 are secondary flagships (score 1 acceptable on all surfaces). Items #6–#11 are implementation details (mention in expandables / tooltips). Item #12 is Phase B.

---

## Phase A — shipped (2026-04-26)

| Issue | Story | Status |
|-------|-------|--------|
| #41 | F-LANDING-PRIVACY-FIRST-001 — privacy flagship section on landing.html | Filed (Phase A) |
| #42 | F-LANDING-API-FLAGSHIP-001 — API flagship section on landing.html | Filed (Phase A) |
| #43 | F-LANDING-GENEROUS-FREE-001 — generous-Free flagship section on landing.html | Filed (Phase A) |
| #44 | F-MOCKUP-AUDIT-FEATURE-PROMINENCE-001 — cross-mockup feature prominence audit | Filed (Phase A) |
| #45 | F-APP-INSIGHTS-001 — Insights tab mockup (single-handle scope) | Filed (Phase A) |
| #38 | F-APP-SETTINGS-TEAM-001 — Team tab, rescoped Business-only, 10-member cap | Rescoped (Phase A) |
| PR #46 | landing.html (3 flagships) + pricing.html (new tier values) | Merged |
| PR #47 | app-insights.html (single-handle, Phase A) | Merged |

DECs DEC-075..DEC-083: all answered and locked.

---

## Phase B — NOT YET STARTED

**Gate:** Multi-handle architecture SPIKE must be dispatched and its sub-decisions locked first.

**Stories queued:**
1. F-LANDING-AGENCY-FLAGSHIP-001 — Agency-friendly pillar #4 on landing.html (blocked on multi-handle SPIKE)
2. F-APP-MULTI-HANDLE-001 — Multi-handle architecture: profile switcher, URL routing, per-handle independent data, aggregate billing, add-on subscription
3. onboarding-tier.html update with multi-handle context (agency-friendly messaging)

**Issue body edits needed post-SPIKE:**
- #33 (Account tab): per-user vs per-handle scoping
- #34 (Billing tab): handle add-ons subscription flow
- #36 (GDPR export): multi-handle export aggregation (one ZIP or per-handle?)
- #37 (API key scoping): per-handle vs per-account API keys
- #39 (Danger tab): delete-handle vs delete-account separation

**Sub-decisions to lock (DEC-084..DEC-090+) before Phase B implementation:**
1. URL routing convention: `/app/{handle}/...` vs query param vs subdomain
2. Per-handle vs per-account scoping for Settings tabs (Account/Billing/API/GDPR/Danger)
3. Solo-Business default UX (profile switcher visibility when only 1 handle)
4. GDPR export aggregation method (Art. 20)
5. Delete-handle vs delete-account separation (especially for primary handle)
6. Add-on handle Stripe subscription_item design (downgrade edge cases)
7. Team member cross-handle visibility (admin sees all handles or just one?)

---

## Cross-cutting concerns map

Which DECs affect which existing stories (#33–#39):

| Story | Affected DECs | Impact |
|-------|--------------|--------|
| #33 Account tab | DEC-073 (Portal link), DEC-074 (handle redirect, Phase B) | Billing Portal link placement |
| #34 Billing tab | DEC-073 (hybrid), DEC-083 (pricing tiers, add-on $9.99/handle) | Stripe Portal section + plan summary copy |
| #35 Custom domain tab | DEC-PRICELOCK-02 ($2/domain) | Pricing copy |
| #36 GDPR export | Phase B multi-handle | Blocked on SPIKE |
| #37 API keys tab | DEC-080 (rate limits), Phase B handle scoping | Rate limit display: "100 req/h (Pro)" |
| #38 Team tab | DEC-083 (Business-only, 10 members, account-level cap) | Rescoped — see issue body for updated BRs |
| #39 Danger tab | Phase B delete-handle | Blocked on SPIKE |

---

## Architecture summary (for Insights tab implementer)

- **Event ingestion**: Cloudflare Workers → Workers Analytics Engine (WAE) writeDataPoint
- **"Today" counter**: Workers KV (fast, cheap, polled by frontend every 60s for Pro live view)
- **Historical rollups**: D1 nightly cron — WAE SQL → D1; rollups kept forever
- **Business replay**: Durable Objects + SSE (short scrub sessions only, 60min/day cap)
- **R2 Parquet archive**: Business tier, monthly archive job; download via time-limited R2 presigned URL
- **API endpoint**: `api.tadaify.com/v1/...`, Bearer token `sk_tdf_...`, Pro 100 req/h, Business 1000 req/h
- **Cost at 1M DAU**: ~$195/mo total (WAE $90 + D1 $50 + KV $30 + DO Business replay $15 + R2 $10)
- **DO cost abuse vector**: NONE for Pro live view (polling = GET KV, no DO per-request cost); only Business replay has DO duration billing

### Polling implementation (Pro live view)

The frontend polls a `GET /insights/today` endpoint every 60 seconds. The endpoint reads from Workers KV (the today counter) — not WAE or D1. This matches industry standard (Plausible, Fathom, Simple Analytics all do polling). No WebSocket, no SSE, no Durable Object needed for Pro live view. The KV value is set by the same Worker that processes each visit event.

### Business replay implementation

Business users can scrub through past traffic on a timeline. This uses Durable Objects + SSE: a DO streams pre-computed WAE events for a selected time window. Capped at 60min/day per Business creator (DO duration billing is the real cost). Beyond 60min: "Daily replay limit reached — resets at 00:00 UTC" message.

---

## Pricing (locked DEC-083)

| Tier | Price | Included | Notes |
|------|-------|----------|-------|
| Free | $0 | 1 handle, full dataset, hourly cadence, 7d window | Most generous Free in link-in-bio |
| Creator | $8/mo | 1 handle, 5min cadence, 90d window | Locked price (DEC-PRICELOCK-01) |
| Pro | $19/mo | 1 handle, real-time polling 60s, 1y window, API 100/h, saved views, daily CSV | Under Linktree Premium ($24) |
| Business | $49/mo | 5 handles + 10 team members + all Pro + replay + A/B + identity stitching + digests + Parquet R2 + API 1000/h | Under Stan Pro ($99) |
| Handle add-on | $9.99/mo | 1 additional handle for Business accounts | Parallel to $2 custom domain model |
| Agency (>30 handles) | Contact support | Custom deal | No fixed pricing in MVP |

---

## Implementation agent instructions (issue #45 — Insights tab)

1. Read `docs/decisions/insights-2026-04.md` FIRST for full DEC context
2. Use **verbatim** copy from this document for: tooltip text (DEC-079), footer banner, Free pill, API tile, all badge rows and comparison row labels
3. Do NOT gate Category C features (cross-tab, top-N, geo+city, device, referrer) — they are free at ALL tiers
4. Pro live view = polling every 60s via KV — do NOT use Durable Objects for Pro live
5. Business replay = DO+SSE with 60min/day cap per creator
6. Sidebar structure: "Pages" parent (accordion) → "🏠 Home" as first sub-item — NEVER "Homepage"
7. Phase A is single-handle scope only — no profile switcher, no multi-handle UI
8. Run `docs/research/insights-metrics-feasibility.md` as background reading for architecture decisions
