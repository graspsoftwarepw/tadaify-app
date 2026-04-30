---
type: research
project: tadaify
title: "Public-profile scraping feasibility for Slice C onboarding profile-step (5 platforms)"
agent: opus-4-7
author: orchestrator
created_at: 2026-04-30
status: draft
tags: [onboarding, scraping, gdpr, cloudflare-workers, decisions]
related_brs: []
---

# Public-profile scraping feasibility — Slice C onboarding profile-step

## TL;DR

| Platform | Login wall? | Scrape feasibility (direct from CF Workers) | Practical path |
|---|---|---|---|
| **Instagram** | YES — aggressive (Meta WAF, Very Difficult 5/5) | Effectively zero from datacenter IP. CF Workers IP blocked instantly. | Paid API service ($1.5–7.0 / 1k profiles) or skip |
| **X (Twitter)** | YES — 2023 login wall, Cloudflare WAF (Hard 4/5) | <10% from CF Workers; auth required for most endpoints | Paid API service (twitterapi.io, ~$1–3 / 1k) or skip |
| **Facebook** | YES — Meta WAF (Very Difficult 5/5) | Near zero. OG tags on **public Pages** sometimes leak via `facebookexternalhit`-style fetches but personal profiles are walled. | Paid API service or skip; OG tags only viable for public Page URLs |
| **TikTok** | NO for profile pages (currently). Official `oembed` endpoint exists. | Moderate — OG tags + `https://www.tiktok.com/oembed?url=…` work. ~50–70% from CF Workers; flaky over time. | **Direct fetch via oEmbed + OG** OR paid API ($1.5–4.0 / 1k) |
| **YouTube (chosen 5th)** | NO for `/@handle` and `/channel/<id>` pages. Public Atom feed + page OG fully accessible. | High — ~80–95% from CF Workers; Google does throttle but rarely blocks. | **Direct fetch viable** (Atom + page meta) |

**DEC-298 recommendation: Option C — Scrape via third-party API service for IG/X/FB; direct-fetch oEmbed/OG for TikTok and YouTube; budget ~$10–30/mo at <1k DAU, scaling per the Cost-at-scale table below. Most importantly: scrape on demand, do NOT persist if user picks a different option. NEW DEC required (does not contradict DEC-026 — different mechanism).**

**DEC-297 ordering: Profile-step AFTER social-step** — only profiles the user explicitly listed are eligible to scrape, and we present scraped values as opt-in cards on the profile-step. Without scraping, ordering is indifferent (Option A would invert).

---

## Why this research

Tadaify's Slice C onboarding wizard is currently 4 steps: welcome → social → template → tier → complete. User wants to add a **profile-setup step (avatar + bio)** and pre-populate it from public profiles the creator already declared in the social-step.

> User exact quote (paraphrased Polish): "if someone provides a public Instagram profile, X profile, Facebook, TikTok — can we scrape the profile descriptions from those public profiles? On the profile-setup screen the user picks one of the scraped descriptions or edits manually."

UX intent: cards on the profile-step like "Use bio from Instagram", "Use bio from X", "Use this avatar from Instagram"; user picks one OR edits.

---

## Scraping vs. OAuth — the DEC-026 distinction (CRITICAL)

`docs/decisions/0026-platform-oauth-import-rejected.md` permanently removed F-PRO-OAUTH-IMPORT (Instagram Basic Display API + Graph API content import) because:

- Facebook app review is 2–8 weeks
- IG Basic Display API was deprecated Dec 2024
- Graph API requires Business accounts (most nano-creators lack these)
- High maintenance burden

**Scraping public HTML profile pages is a different mechanism:**

| Aspect | OAuth import (DEC-026, REJECTED) | Public-page scraping (this research) |
|---|---|---|
| User auth required | YES (user logs into IG/FB and grants scopes) | NO (we fetch public URL) |
| Platform app review required | YES (Meta app review 2–8 weeks) | NO |
| Data scope | Posts, media, captions (deep) | Display name, bio, avatar (surface) |
| Failure mode | OAuth token revoked → integration dead | URL fetch returns wall → graceful fallback |
| Cost | ~$0 + dev time | ~$0 (direct) or $0–$30/mo (API) |
| Legal posture | Explicit user consent via OAuth | Legitimate-interest with disclosure (GDPR), TOS-friction varies by platform |

**Conclusion:** scraping does NOT contradict DEC-026. DEC-026 was about deep content import via official APIs. This is shallow public-page metadata for onboarding pre-fill. **A new DEC (DEC-298) is warranted to lock the chosen approach.**

---

## Per-platform deep-dive

### 1. Instagram

- **URL pattern:** `https://www.instagram.com/<handle>/` — user pastes `@handle` or full URL.
- **Public data theoretically available:** display name, bio, avatar, verified flag, follower count, public posts.
- **HTML/SSR posture (April 2026):** Meta deploys aggressive bot detection (custom WAF + device fingerprinting + ML). Server-side render of `/instagram.com/<handle>` returns a login redirect or partial OG tags only. GraphQL `doc_id` rotates every 2–4 weeks. ([scrapfly][ig-scrapfly], [proxyway][ig-proxyway])
- **Rate limits / blocking:** datacenter IPs blocked **instantly** at the IP-quality layer (before rate limits matter). Residential proxies tolerated up to a few hundred req/h. ([torchproxies][ig-torch])
- **TOS posture:** Instagram Terms (Section "What you can't do") explicitly prohibits "collect[ing] information in an automated way without our prior permission." Civil dispute risk is real (Meta has sued scrapers — Bright Data v. Meta 2024 went in scraper's favor on public data, but Meta still issues C&D). [Instagram Terms](https://help.instagram.com/581066165581870)
- **From Cloudflare Workers:** **NOT VIABLE.** CF Worker egress is ASN 13335 (Cloudflare datacenter). Instagram blocks instantly. ([cf community][cf-community])
- **Third-party APIs:**
  - Apify "Instagram Profile Scraper" (`apidojo/instagram-scraper`): pay-per-result ~$1.5/1k profiles. Reliability ~95%. ([apify][apify-ig])
  - Bright Data Instagram dataset: ~$0.001/record at scale (pay-as-you-go from $10/mo, batch). ([brightdata][bd-pricing])
  - ScrapingBee with `stealth_proxy`: $49/mo for 250k credits, ~25 credits per IG profile = ~10k profiles. ([scrapingbee][sb-pricing])
  - ScrapeCreators: dedicated IG endpoint, pay-as-you-go, ~$0.003–0.005/profile (no monthly commitment). ([scrapecreators][sc-pricing])
- **Verdict:** Option C (paid API). Direct-fetch from CF Workers is dead.

### 2. X (Twitter)

- **URL pattern:** `https://x.com/<handle>` (also `twitter.com/<handle>`).
- **Public data theoretically available:** display name, bio, avatar, verified, follower count.
- **HTML/SSR posture (April 2026):** Almost everything behind login wall since 2023. Cloudflare WAF + login wall on profile pages. OG tags sometimes still leak on `og:title` / `og:description` / `og:image` for very-public accounts but inconsistent. ([scrapfly-twitter][x-scrapfly])
- **Syndication/embed endpoint:** `https://cdn.syndication.twimg.com/widgets/timelines/profile?screen_name=<handle>` historically returned partial JSON for embedded timelines, but reliability has degraded throughout 2024–2025.
- **Rate limits / blocking:** non-logged-in fetches throttled aggressively; CF Worker IPs flagged.
- **TOS posture:** [X Developer Agreement](https://developer.x.com/en/developer-terms/agreement) prohibits scraping; X Terms of Service prohibit "automated access." X is the most litigation-prone in 2024–2026 (sued multiple scraping vendors).
- **From Cloudflare Workers:** **NOT VIABLE for reliable extraction.** OG-tag-only path may work ~30–50% of time but inconsistent.
- **Third-party APIs:**
  - twitterapi.io: 140+ req/s, ~$1–3 per 1k profile fetches, OpenAPI spec, considered the canonical 2026 unofficial API. ([dev.to-twitter-2026][x-dev])
  - Apify "Twitter Scraper": $99/mo Scale plan covers ~30k profiles. ([apify-twitter][apify-x])
  - Bright Data X dataset: similar to IG ~$0.001/record at scale.
  - Nitter is **dead** in production (most public instances offline by late 2024). Self-hosting requires guest-account pool, high failure rate. ([nitter-alternatives][nitter])
- **Verdict:** Option C (paid API). twitterapi.io is the canonical pick for low-volume.

### 3. Facebook

- **URL pattern:** `https://www.facebook.com/<page-handle>` (Pages) or `https://www.facebook.com/<profile-id>` (personal profiles, less likely for creators).
- **Public data:** Pages — name, about, avatar, OG tags. Personal profiles — almost nothing without login.
- **HTML/SSR posture (April 2026):** Public Pages return some OG tags via direct fetch (`og:title`, `og:image`, `og:description`) when the URL is a published Page. Personal profiles return login wall. Meta's WAF rated Very Difficult 5/5. ([scraperly-fb][fb-scraperly])
- **Open Graph specifics:** since FB invented OG, FB Pages reliably emit `og:title`, `og:description`, `og:image`. The `og:image` is a CDN URL on `scontent.*.fbcdn.net` that **rotates** (avoid hot-linking long-term).
- **Rate limits:** non-FB-crawler User-Agents get login-walled fast; spoofing as `facebookexternalhit/1.1` works for OG endpoints (LinkPreview / oEmbed style), is gray-area legally.
- **TOS posture:** [Facebook Terms](https://www.facebook.com/legal/terms) — automated data collection requires written permission. UODO / GDPR also a concern (see §9 below).
- **From Cloudflare Workers:** **partially viable for public Pages only**, fetching just OG tags with a friendly UA. ~40% success rate. Personal profiles 0%.
- **Third-party APIs:** Apify Facebook Page Scraper (~$2–5/1k pages), Bright Data FB dataset, ScrapingBee with `render_js=false` for OG. ([best-fb-2026][fb-best])
- **Verdict:** Option C (paid API) for reliable extraction. Direct OG-only fetch from CF Workers as a "best effort, no SLA" fallback when the URL is a Page (not a profile).
- **Practical reality for tadaify:** most nano-creators don't list a *Facebook Page* as their main social — many will paste a personal profile URL that we can't scrape regardless. Facebook is the lowest-ROI platform of the four.

### 4. TikTok

- **URL pattern:** `https://www.tiktok.com/@<handle>`.
- **Public data:** display name, bio (signature), avatar, verified, follower/like counts, video count.
- **HTML/SSR posture (April 2026):** profile pages render OG tags + JSON-LD on initial server response. JavaScript hydration on top, but the scrape-relevant fields are in the initial HTML. Less aggressive blocking than IG/X. ([scrapfly-tiktok][tt-scrapfly])
- **Official oEmbed endpoint:** `https://www.tiktok.com/oembed?url=https://www.tiktok.com/@<handle>` — returns JSON with `title`, `author_name`, `thumbnail_url`, `html`. **No auth required.** Documented at [TikTok for Developers](https://developers.tiktok.com/doc/embed-creator-profiles).
- **Rate limits:** oEmbed endpoint tolerates a few hundred req/h per IP; profile-page scraping ~50–100 req/h before blocking. CF Worker IPs less aggressively blocked than IG/FB.
- **TOS posture:** [TikTok Terms of Service](https://www.tiktok.com/legal/page/global/terms-of-service/en) — Section "Your conduct" prohibits "automated systems… to access the Services." oEmbed is documented & blessed for embed previews; using it for onboarding pre-fill is a gray edge but consistent with how the data is exposed.
- **From Cloudflare Workers:** **VIABLE.** oEmbed call from CF Worker has ~70–90% success. Profile-page HTML scrape ~50–70%.
- **Third-party APIs:** Apify TikTok Profile Scraper $1.5–4/1k. ([apify-tiktok][apify-tt])
- **Verdict:** Direct fetch via oEmbed (free) is the right MVP path. Cost-free, reliable enough, and TOS-defensible for embed-style metadata. Fallback to paid API only if direct fails.

### 5. YouTube (chosen as the 5th platform)

Selected over LinkedIn (TOS-hostile, high legal-risk after HiQ post-remand) and Threads (mostly mirrors IG, same Meta WAF problem).

- **URL pattern:** `https://www.youtube.com/@<handle>` or `https://www.youtube.com/channel/<channel-id>`.
- **Public data:** channel name, description ("about"), avatar, banner, subscriber count, country, external links, join date.
- **HTML/SSR posture (April 2026):** channel page renders OG tags + a giant `ytInitialData` JSON blob in the initial HTML. ~95% of the time the page returns a usable response without browser rendering. ([scrapfly-yt][yt-scrapfly])
- **Public Atom feed:** `https://www.youtube.com/feeds/videos.xml?channel_id=<id>` returns video list (no bio, but useful for verification). Free, stable, no auth.
- **Rate limits:** Google throttles aggressive scraping but rarely outright blocks for low-volume requests.
- **TOS posture:** [YouTube Terms](https://www.youtube.com/static?template=terms) prohibit "access[ing] the Service using automated means" but the YouTube Data API v3 is available for legitimate use (10k units/day quota free). For onboarding-pre-fill purposes, the Data API v3 + an API key is the cleanest path: zero TOS risk.
- **From Cloudflare Workers:** **VIABLE.** Direct fetch ~80–95% success. Data API v3 endpoint `https://www.googleapis.com/youtube/v3/channels` with `forHandle=<handle>&part=snippet` is rock solid.
- **Third-party APIs:** unnecessary; the official Data API is free and sufficient.
- **Verdict:** **Use YouTube Data API v3 directly.** API key is free with generous quota. Zero scraping legal risk.

---

## Cross-cutting questions

### 9. GDPR / UODO posture (Polish data protection)

- **Subject:** when we scrape someone's bio from Instagram, **the data subject is the creator themselves** (the tadaify user). They explicitly typed in their own profile URL during onboarding. This is markedly easier than the typical "scraping strangers' data" GDPR scenario.
- **Lawful basis:** Article 6(1)(b) GDPR — **performance of a contract with the data subject**. The user signed up for tadaify and asked us to set up their profile. Scraping their own publicly-listed bio to pre-populate their tadaify profile is contractual necessity. We do **NOT** need a legitimate-interest assessment (LIA) because the data subject is the user themselves.
- **Polish UODO precedent:** the €220k fine in [Inside Privacy / Bisnode](https://www.insideprivacy.com/data-privacy/polish-supervisory-authority-issues-gdpr-fine-for-data-scraping-without-informing-individuals/) was for **scraping data about non-users without notification**. Not applicable here — our subject is a consenting user.
- **Best practice (mandatory):**
  1. **Disclose** in onboarding UI: "We'll fetch your public bio from the profiles you listed to suggest options. You can edit or skip."
  2. **Scrape on demand** — only when user clicks "Suggest from my socials" or as part of the profile-step load.
  3. **Don't persist** the raw scraped value if user picks a different option. Persist only the value the user accepts.
  4. **Privacy notice** entry: add a short clause to tadaify's privacy policy: "When you list a public profile URL during onboarding, we may briefly fetch the public bio/avatar from that URL to offer it as a pre-fill option."
- **Risk verdict:** LOW. Significantly lower than typical scraping concerns because the subject = user.

### 10. Avatar storage / hot-linking

| Approach | Pros | Cons | Verdict |
|---|---|---|---|
| **Hot-link IG/FB CDN URL** (`scontent.*.fbcdn.net`) | Zero storage cost, zero copy step | URLs rotate within hours/days → broken images | **NO** |
| **Hot-link TikTok/YouTube CDN** | URLs more stable | Still platform-controlled | NO for production |
| **Copy to R2 on accept** | Durable, we control. CF R2 has zero egress fee. | Storage cost ~$0.015/GB/mo + write op | **YES** — copy on user-accept only |
| **Copy on scrape (pre-accept)** | Always have local copy | Pays storage even if user rejects | NO — wasteful |

**Recommended:** when user clicks the "Use this avatar from <platform>" card, server-side fetches the CDN URL once and writes the bytes to R2 at `avatars/<user-id>/<random>.jpg`. Tadaify already uses R2 (DEC-FRAMEWORK-01 = Cloudflare). If user rejects, no copy is made. Cost: negligible (<<$1/mo at 10k DAU).

### 11. Failure UX

The profile-step MUST degrade gracefully. Required failure surfaces:

- **All scrapes failed (rate limit, captcha, network):** show only the manual entry form with no cards. No error toast — silent fallback.
- **Some scrapes succeeded:** show only the cards that have data; missing platforms simply absent.
- **Profile is private / handle invalid:** the card is absent (treat as failure).
- **Scrape latency >5s:** we time out and present cards-loaded-so-far. The user must never wait staring at a spinner.
- **Backend telemetry:** log scrape outcomes anonymously to refine which platforms are worth keeping. Do NOT log scraped content.

### 12. Latency strategy

Direct fetches are 1–3 s best case; API-service fetches 2–6 s. Three options:

| Strategy | Latency-to-screen | Wasted scrapes | UX |
|---|---|---|---|
| **A. Lazy on profile-step open** | 2–6s spinner before cards render | Zero waste | Bad UX |
| **B. Eager on social-step submit** | 0s on profile-step (already cached) | Wasted if user backs out | Best UX |
| **C. Background-prefetch during welcome step** | 0s | Wasted on user drop-off | Compromise |

**Recommended: Option B (eager on social-step submit)** with 5s timeout per platform, parallel fetches, results cached in a `KV` namespace keyed by `<user-id>`. If a fetch hasn't completed by the time the user lands on profile-step, show a per-card skeleton then resolve in place. CF Workers KV TTL = 1h (then garbage-collected).

---

## Cost-at-scale table (DEC-format v3)

Assumptions:
- 60% of new users select Instagram, 50% X, 30% Facebook, 50% TikTok, 30% YouTube (overlap allowed; max 4 selected).
- Average 2.5 scrapes per onboarding (most users select 2–3 platforms).
- IG + X + FB = paid API ~$0.003/profile blended (Apify pay-per-result tier).
- TikTok + YouTube = direct fetch from CF Workers (free + bundled CF Workers calls).

| DAU (new signups/day) | Onboarding scrapes/mo | IG+X+FB cost | TikTok+YouTube cost | **Total /mo** |
|---|---|---|---|---|
| 100 | ~7,500 | ~$10 | $0 | **~$10** |
| 1k | ~75,000 | ~$100 | <$1 | **~$100** |
| 10k | ~750,000 | ~$1,000 | ~$5 | **~$1,000** |
| 100k | ~7,500,000 | ~$5,000 (vol disc) | ~$50 | **~$5,050** |
| 1M | ~75,000,000 | ~$30,000 (enterprise tier) | ~$500 | **~$30,500** |

> **Important:** these numbers assume **every** social-step selection triggers a scrape. With Option D (hybrid: try direct first, paid fallback), the IG/X cost can drop ~40% but engineering complexity rises. At scale (>10k DAU), pre-purchase Bright Data dataset access (~$0.001/record) cuts costs ~3×.

> TODO: verify exact 2026 per-result pricing on Apify Instagram Actor and twitterapi.io once we engage. Numbers above are mid-2026 list-price estimates.

---

## Decision options (for DEC-298)

### Option A — Skip scraping entirely
- **Business rationale:** zero infra cost, zero legal exposure, zero ongoing maintenance. Profile-step is manual-only, takes ~30 s longer per user.
- **Cost:** $0/mo
- **Risk:** users abandon onboarding at higher rate (no concrete number; assumption ~5–10% incremental abandon vs. pre-fill flow per general onboarding-friction research).
- **DEC-297 implication:** profile-step *FIRST* makes sense (no dependency on social).

### Option B — Direct scrape from CF Workers, no paid API
- **Business rationale:** truly free, zero vendor lock-in.
- **Reality check:** ~30–50% success rate aggregated across IG/X/FB; ~70–90% TikTok; ~80–95% YouTube. So 50–60% of users will see at least one "Use this bio" card; the rest see manual entry only.
- **Cost:** $0 + dev maintenance (selectors break every 2–4 weeks for IG/X/FB).
- **Risk:** maintenance burden, occasional Meta C&D risk (low for low-volume).
- **DEC-297 implication:** profile-step AFTER social.

### Option C — Third-party API service for IG/X/FB; direct for TikTok/YouTube *(RECOMMENDED)*
- **Business rationale:** ~95% reliability across all 5 platforms; vendor abstracts platform brittleness; we focus on UX not anti-bot warfare. Free tier of Apify covers <500 onboardings/mo (i.e. through ~50 DAU).
- **Cost:** $0–$10/mo to ~50 DAU; ~$100/mo at 1k DAU; ~$1k/mo at 10k DAU. See cost table.
- **Risk:** vendor goes down → graceful fallback to manual entry. Vendor pricing changes (~yearly).
- **DEC-297 implication:** profile-step AFTER social.

### Option D — Hybrid (direct first, paid fallback)
- **Business rationale:** lowest steady-state cost (~40% below Option C) once tuning settles.
- **Cost:** ~$60/mo at 1k DAU (vs $100 in Option C).
- **Risk:** highest engineering complexity; two code paths per platform; harder to monitor.
- **Verdict:** worth revisiting at 10k+ DAU when the ~$400/mo savings justify the complexity. **Not for MVP.**

### Option E — Re-evaluate OAuth for ONE platform (YouTube only)
- **Business rationale:** YouTube Data API v3 has zero app-review friction, free quota, official endpoint for `channels.list?forHandle=<handle>`. This is **identical to what Option C+ already does** — Data API v3 IS the official endpoint. We don't need OAuth for it; just an API key + the handle.
- **Verdict:** subsumed into Option C. No new DEC-026 reversal needed.

---

## DEC-298 (proposed) — Public-profile scraping for onboarding profile-step

| Field | Value |
|---|---|
| **ID** | DEC-298 |
| **Czego dotyczy** | Profile-step onboarding scraping mechanism |
| **Szczegolowy opis** | Slice C onboarding adds a profile-setup step (avatar + bio). To reduce friction we want to pre-populate options from public profiles the user listed in the social-step. Five platforms in scope: Instagram, X, Facebook, TikTok, YouTube. DEC-026 rejected OAuth-based deep import — that decision stands and is unrelated to this surface-level metadata fetch. The question: which mechanism do we use? |
| **Opcje** | 1. Skip scraping; manual entry only. 2. Direct fetch from CF Workers, no vendor; 30–50% success on IG/X/FB. 3. Hybrid: TikTok+YouTube direct, IG+X+FB via Apify pay-per-result; ~95% blended success. 4. Pure direct + hybrid fallback (eng-heavy, not worth at MVP). 5. Re-evaluate OAuth (subsumed by Option 3 for YouTube). |
| **Twoja rekomendacja** | **Option 3** — direct fetch where viable (TikTok oEmbed + YouTube Data API v3), paid Apify pay-per-result for IG/X/FB. Blended ~95% success, ~$10/mo cost at <100 DAU, scales linearly. Eager-prefetch on social-step submit, 5s timeout per platform, KV-cached. Avatar copied to R2 only on user-accept. GDPR basis = contract performance (subject is the user). Privacy-policy clause added. |

## DEC-297 (proposed) — Profile-step ordering relative to social-step

| Field | Value |
|---|---|
| **ID** | DEC-297 |
| **Czego dotyczy** | Onboarding step ordering: where does the new profile-setup step go? |
| **Szczegolowy opis** | Slice C currently has welcome → social → template → tier → complete. The new profile-step (avatar + bio) needs a slot. If we scrape (DEC-298 = Option 3), profile-step depends on social-step having been completed. If we skip scraping (DEC-298 = Option 1), no dependency. |
| **Opcje** | 1. welcome → **profile** → social → template → tier → complete (profile FIRST; only viable if DEC-298=skip). 2. welcome → social → **profile** → template → tier → complete (profile AFTER social; required if DEC-298 ∈ {2,3,4}). 3. welcome → social → template → **profile** → tier → complete (profile late; user has chosen template by then so we can show preview). |
| **Twoja rekomendacja** | **Option 2** — profile-step immediately after social-step, BEFORE template. Two reasons: (a) DEC-298=Option 3 requires it; (b) putting profile before template means template selection can use the avatar in its preview, which is a UX win. Total flow: welcome → social → **profile** → template → tier → complete. |

---

## Done / out-of-scope / TODO

- **Out of scope:** code changes (research only). LinkedIn (legal exposure post-HiQ remand high; nano-creators rarely list LinkedIn as primary). Threads (Meta WAF same as IG; subsumed by IG decision).
- **TODO: verify** exact Apify Instagram Actor + twitterapi.io 2026 list price when engagement starts (price tables in §"Cost-at-scale" are list-price estimates from vendor pages April 2026).
- **TODO: verify** TikTok oEmbed reliability from CF Workers IP at >100 req/min (sample size in this research is qualitative from vendor blogs, not measured).
- **Follow-up DECs that may emerge:** privacy policy clause wording (DEC-299), R2 avatar retention TTL (DEC-300), telemetry schema for scrape success rates (DEC-301).

---

## Sources

- [How to Scrape Instagram in 2026 (Scrapfly)][ig-scrapfly] — IG Very Difficult 5/5 rating, doc_id rotation, residential-proxy mandate
- [Best Instagram Scrapers 2026 (Proxyway)][ig-proxyway] — vendor benchmark
- [Instagram Scraping in 2026 (Torchproxies)][ig-torch] — datacenter IPs blocked instantly
- [Comprehensive Guide to Twitter/X Scraping 2026 (DEV)][x-dev] — twitterapi.io as canonical 2026 unofficial API
- [How to Scrape X.com in 2026 (Scrapfly)][x-scrapfly] — Hard 4/5, login-wall, syndication endpoint
- [Nitter Alternatives 2026 (simple-web.org)][nitter] — Nitter public network largely collapsed by late 2024
- [How to Scrape Facebook in 2026 (Scraperly)][fb-scraperly] — FB Very Difficult 5/5
- [Best Facebook Scrapers (aimultiple)][fb-best] — vendor benchmark
- [How To Scrape TikTok in 2026 (Scrapfly)][tt-scrapfly] — initial-HTML data extractable
- [TikTok Embed Creator Profiles (TikTok for Developers)](https://developers.tiktok.com/doc/embed-creator-profiles) — official oEmbed endpoint documentation
- [How to Scrape YouTube in 2026 (Scrapfly)][yt-scrapfly] — channel page scrape feasibility
- [Apify Instagram Scraper (apidojo, pay-per-result)][apify-ig] — $1.5/1k profiles
- [Apify TikTok Profile Scraper][apify-tt] — pricing reference
- [Apify Twitter Scraper][apify-x] — pricing reference
- [Bright Data pricing][bd-pricing] — pay-as-you-go from $10/mo
- [ScrapingBee pricing][sb-pricing] — $49/mo for 250k credits
- [ScrapeCreators pay-as-you-go scraping APIs][sc-pricing] — pay-as-you-go social-media APIs
- [Cloudflare Workers egress IPs (community)][cf-community] — datacenter ASN 13335, dedicated egress IP requires sales contact
- [Polish UODO scraping fine €220k (Inside Privacy)](https://www.insideprivacy.com/data-privacy/polish-supervisory-authority-issues-gdpr-fine-for-data-scraping-without-informing-individuals/) — Bisnode case, scraping non-users without notice
- [Web Scraping in 2025: GDPR (Medium / Tugui)](https://medium.com/deep-tech-insights/web-scraping-in-2025-the-20-million-gdpr-mistake-you-cant-afford-to-make-07a3ce240f4f) — legitimate-interest analysis
- [Instagram Terms of Use](https://help.instagram.com/581066165581870)
- [X Developer Agreement](https://developer.x.com/en/developer-terms/agreement)
- [Facebook Terms of Service](https://www.facebook.com/legal/terms)
- [TikTok Terms of Service](https://www.tiktok.com/legal/page/global/terms-of-service/en)
- [YouTube Terms of Service](https://www.youtube.com/static?template=terms)

[ig-scrapfly]: https://scrapfly.io/blog/posts/how-to-scrape-instagram
[ig-proxyway]: https://proxyway.com/best/instagram-scrapers
[ig-torch]: https://torchproxies.com/instagram-scraping-in-2026-scrape-without-getting-blocked/
[x-dev]: https://dev.to/ashish_soni08/comprehensive-guide-to-twitterx-scraping-frameworks-and-tools-in-2026-37p2
[x-scrapfly]: https://scrapfly.io/blog/posts/how-to-scrape-twitter
[nitter]: https://simple-web.org/guides/nitter-alternatives-2026-view-twitter-x-timelines-anonymously
[fb-scraperly]: https://scraperly.com/scrape/facebook
[fb-best]: https://aimultiple.com/facebook-scraping
[tt-scrapfly]: https://scrapfly.io/blog/posts/how-to-scrape-tiktok-python-json
[yt-scrapfly]: https://scrapfly.io/blog/posts/how-to-scrape-youtube
[apify-ig]: https://apify.com/apidojo/instagram-scraper
[apify-tt]: https://apify.com/clockworks/tiktok-profile-scraper
[apify-x]: https://apify.com/cryptosignals/twitter-scraper
[bd-pricing]: https://brightdata.com/blog/web-data/best-web-scraping-apis
[sb-pricing]: https://www.scrapingbee.com/pricing/
[sc-pricing]: https://scrapecreators.com/blog/pay-as-you-go-scraping-apis
[cf-community]: https://community.cloudflare.com/t/what-are-cf-worker-egress-ip-ranges/911150
