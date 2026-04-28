---
type: SPIKE
project: tadaify
title: Livestream Block — Integration vs Self-Hosting (provider survey + live-state detection)
agent: opus-4-7
author: orchestrator
related_brs: []
tags: [tadaify, blocks, livestream, embed, mvp]
created_at: 2026-04-26
status: draft
---

# SPIKE — tadaify Livestream Block: Integration vs Self-Hosting

## 1. Executive summary

**Recommendation: ship the Livestream block as a thin "embed-someone-else's-livestream" wrapper, NOT a streaming product.** v1 supports YouTube Live, Twitch and Kick via official iframe embeds — three providers cover 90 %+ of creator audiences and 100 % of supported providers expose a documented iframe player URL. tadaify writes zero bytes of video, runs zero ingest infrastructure, and pays zero per-minute delivery cost.

Live-state detection (is the creator on air right now?) is solved with a single Postgres-backed cron that calls each provider's official "is this channel live" endpoint every 60 s for channels that are currently embedded on a published page. tadaify's per-month detection cost stays in the cents at MVP scale and only crosses USD 10 / month past the 100 k-DAU mark.

Two-line rationale: (a) creators who want to livestream already have an audience on YouTube / Twitch / Kick — duplicating their stream on tadaify-hosted infra would force them to split chat, lose subscribers and cost tadaify ~100× more per delivered minute than embedding; (b) the "Livestream" picker block is a UX signal ("creator is live RIGHT NOW") more than a storage product, so the right primitive is `<iframe src=…> + live-state badge + when-not-live fallback`, not a video pipeline.

The Livestream block is **free on all paid tiers** (it costs us almost nothing) and **available on the free tier with a single "saved channel" cap** (no per-channel cost — the cap exists only to gate against spammy abuse of the live-detection cron).

---

## 2. Comparison: Livestream block vs Video block vs Embedded block

The picker today (per the block library research) ships these three shapes. They overlap visually but solve different problems:

| Block | Primary input | What the visitor sees | When does the creator pick it? |
|---|---|---|---|
| **Video** | A specific video URL (YouTube / Vimeo / direct mp4) | A static, always-available video player. Plays the same video forever. | "Here is my latest tutorial / trailer / loop reel — watch it any time." |
| **Embedded** | An arbitrary URL (Spotify track, Calendly, Notion page, Substack post, anything with an oEmbed/iframe) | Whatever that URL renders to. Creator is responsible for the embed making sense. | "Here is a third-party widget I want on my page that does not have a dedicated block yet." |
| **Livestream** | A **channel identity** (YouTube channel ID, Twitch username, Kick username) — NOT a video ID | (a) live player when the creator is broadcasting; (b) "offline" state with last-VOD CTA / schedule / native-platform follow link when they are not. | "I broadcast regularly. When I am live, my fans should see the player; when I am not, they should see how to follow / the next stream time." |

### Decision tree the block-picker UX should encode

```
Q1: Do you broadcast live regularly (weekly+) and want fans to land on the live player when you are on air?
  YES  → Livestream block (handles live/offline state automatically)
  NO   → Q2

Q2: Do you have a specific recorded video you want everyone to watch?
  YES  → Video block (static, always available, predictable)
  NO   → Q3

Q3: Is it a third-party URL (Spotify, Calendly, Substack, …)?
  YES  → Embedded block
  NO   → none of these — pick a different block (Bio, Links, Newsletter, …)
```

### Why this matters

If a creator drops their YouTube **Live** URL into the **Video** block, it works exactly once: when that specific live broadcast is on air. The moment the broadcast ends, that videoId becomes a VOD playback (or 410-Gone if it was set to "Premiere" without archive), the page silently shows yesterday's stream forever, and the creator does not notice until a fan tells them. The Livestream block solves this by binding to the **channel**, not the video, and resolving "what is on this channel right now?" at request time.

Conversely, if a creator drops a static "trailer" video into the Livestream block, every page load triggers a useless live-state check that always returns "offline", we waste API quota on them, and the visitor sees a permanent "offline — not live right now" badge over a video that was never meant to be live. The picker copy must steer them toward the Video block.

**Implication for the picker UI:** the Livestream tile in the block picker carries a one-line clarifier: *"Auto-shows your live broadcast when you go on air, with an offline fallback. Not for static videos — use the Video block."* This text is the cheapest way to prevent the most common mis-pick.

---

## 3. Integration approaches — provider-by-provider

For each provider we evaluate four things:

1. **Embed feasibility** — does an official iframe exist?
2. **Channel-level vs video-level binding** — can we point at a creator and auto-resolve their current live broadcast, or do we need a fresh videoId every stream?
3. **Live-state detection** — how do we know if they are on air?
4. **Offline state** — what does the iframe render when they are not live?

### 3.1 YouTube Live — DEFAULT, ship in MVP

**Embed URL pattern:**

```
https://www.youtube.com/embed/live_stream?channel=<YOUTUBE_CHANNEL_ID>
```

This is the canonical "auto-resolve current live broadcast for a channel" embed. It accepts a channel ID (the `UC…` 24-char form, NOT the @handle). When the channel is broadcasting, the iframe shows the live player; when offline, YouTube renders a generic offline placeholder (channel avatar + "This live event has ended" or "Stream offline" depending on broadcast state).

**Known limitation (from search results):** if the channel has multiple **scheduled** future live streams set to public, the channel embed can break and refuse to resolve. This is a YouTube-side constraint we cannot fix. Mitigation: in the offline-state UI, expose a "having trouble seeing the stream? open in YouTube" link so visitors are never fully stuck.

**Channel ID lookup UX:** creators rarely know their `UC…` ID — they only know their @handle or vanity URL. The block editor must accept either of:

- `https://www.youtube.com/@creator-handle`
- `https://www.youtube.com/channel/UC…`
- `UC…` directly
- `@creator-handle`

…and resolve it server-side to the canonical `UC…` ID at save time (one YouTube Data API call: `channels.list?forHandle=@…&part=id`, cost = 1 unit, cached forever per handle). Store both the resolved `UC…` and the original input on the block row so we can re-resolve if a creator changes handle.

**Live-state detection — two paths:**

| Path | API call | Quota cost (per call) | Realtime? | When to use |
|---|---|---|---|---|
| **Polling** | `search.list?part=snippet&channelId=UC…&type=video&eventType=live` | **100 units** | every poll (we choose the cadence) | MVP default — predictable |
| **Push** | WebSub / PubSubHubbub `https://pubsubhubbub.appspot.com/` with topic `https://www.youtube.com/xml/feeds/videos.xml?channel_id=UC…` | 0 quota | yes (server-to-server webhook on new video / live start) | upgrade path — saves quota dramatically once we have >100 channels |

YouTube's `search.list` is the **most expensive** call in the v3 API (100 units per call). Default daily quota is 10 000 units → 100 polls / day / project total — NOT per channel. This means naive "poll every channel every 60 s" ceases to work past ~7 channels per day on a single API project.

**Consequences for our cost model (see §9):**

- MVP (≤1 000 channels): poll **only channels currently rendered on a published page in the last 24 h**, every 5 min, with a project-pool of 5–10 API projects rotated round-robin to multiply quota. Estimated cost: $0 (free tier) up to ~5 k channels.
- Growth (>5 k channels): switch primary detection to **WebSub push**. Each tadaify-side webhook handler writes an `is_live` flag + `live_video_id` to Postgres. Polling remains as a 30-min fallback for missed pushes. Quota cost drops to near-zero.

**Offline state in the iframe itself is ugly** (generic YouTube channel-offline placeholder with no creator branding). This is the single biggest reason the tadaify block must overlay its own offline UI on top of the iframe — see §6.

### 3.2 Twitch — ship in MVP

**Embed pattern (Twitch uses a JS object, NOT a raw iframe URL — but the underlying iframe URL is documented and works):**

Raw iframe form:
```
<iframe
  src="https://player.twitch.tv/?channel=<USERNAME>&parent=tadaify.com&parent=*.tadaify.com&parent=<creator-custom-domain>"
  height="378" width="620" allowfullscreen></iframe>
```

Critical: the `parent=` query parameter is **mandatory** and must list every domain on which the embed will be rendered. Twitch refuses to play if the actual `window.location.host` does not match a `parent=` value. Effects on tadaify:

- `parent=tadaify.com` covers `creator.tadaify.com/<page>` only if Twitch accepts wildcards. It does NOT — `parent=` accepts exact hostnames only, not wildcards.
- Custom domains (BR-022 from the brand audit) mean each creator may use their own `creator-domain.com`. We must inject `parent=<that-domain>` server-side when rendering the page.

**Implementation:** server-side, generate the iframe `src` per request based on the page's host header. Add `parent=<host>` and (defensively) `parent=tadaify.com` and `parent=creator-name.tadaify.com`. Three or four `parent=` params is fine; Twitch documents no limit.

**Live-state detection:**

- **Polling:** `GET https://api.twitch.tv/helix/streams?user_login=<username>` — empty `data: []` array means offline; non-empty means live with the current title, viewer count, game category, thumbnail. **Rate limit: ~800 requests / minute / app**, 100 logins per call. → in one batched call we can check the live state of 100 channels, so even at 10 000 channels we use 100 calls / minute, well under the limit.
- **Push (preferred at scale):** Twitch **EventSub** with `stream.online` and `stream.offline` topics. Each subscription costs 1 toward a `max_total_cost` of 10 (free) — but the cap raises significantly once you authenticate the channel via the broadcaster's OAuth (the "user has authorised your app" path lifts the cap to thousands). For tadaify the cleanest path is: poll-only at MVP (well under the rate limit), upgrade to authenticated EventSub later if we cross 5 k embedded channels.

**Offline state in the iframe itself:** Twitch renders a clean "Channel is offline" card with the streamer's avatar, panels and a follow button — significantly better looking than YouTube's offline state. We can ship the Twitch offline state as-is in MVP and skip the overlay; or for consistency overlay our own. Pick: overlay our own (consistency wins over per-provider polish at MVP).

**Chat:** Twitch documents a separate chat-only embed (`https://www.twitch.tv/embed/<channel>/chat?parent=…`). Out of scope for v1 — adds visual clutter on a creator page and most fans want chat on twitch.tv proper. Mark as v2.

### 3.3 Kick — ship in MVP (or v1.1)

**Embed URL pattern (true iframe, no JS lib needed):**

```
<iframe src="https://player.kick.com/<USERNAME>?muted=true&allowfullscreen=true"
        height="720" width="1280" frameborder="0" scrolling="no" allowfullscreen></iframe>
```

Simpler than Twitch — no `parent=` requirement, no JS bundle. The player auto-shows live state vs offline state internally.

**Live-state detection:**

- **Public API:** Kick now ships a documented public API (`https://api.kick.com`) with OAuth 2.1. The `Stream` object includes `is_live` and viewer count.
- **Webhooks:** the same dev portal documents events (subject to OAuth scope). At MVP scale, polling the channel endpoint every 60 s is fine.
- **Anonymous access:** Kick has historically allowed unauthenticated reads of channel JSON (`https://kick.com/api/v2/channels/<username>`) — useful as a fallback but NOT load-bearing because Kick can change this without notice. Use the documented OAuth API as the primary source of truth, treat the unauthenticated route as a defensive cache.

**Decision: ship Kick in MVP.** It is the smallest of the three but the embed is the simplest and growth is fastest in the demographic tadaify targets (gaming creators, alt-platform escapees from YouTube monetisation).

### 3.4 X (Twitter) Live / Spaces — DEFER to v2

**Status as of 2026-04-26:**

- **Live video broadcasts:** X's "Twitter Publish" tool generates an embeddable widget that auto-shows the chosen handle's broadcast when on air, but the embed is implemented as a `blockquote + script` (twitter-publish JS), NOT a clean iframe URL. Customisation is poor.
- **Spaces (audio):** Spaces are audio-only. There is **no public iframe-style embed** for a live Space. The X mobile / web app is the only first-class consumer.
- **Developer API access:** the X API v2 has been turned restrictive since 2023 — broadcast embed code retrieval has been the subject of dev-forum complaints since 2024 with no clean public solution.

**Decision: skip in MVP.** Document as a v2 experiment if real creator demand surfaces. If we ship anything in v2, route it as a thin wrapper around the official Twitter Publish widget, accept that it will look like an X tweet card more than a full player, and badge the block with "X Live (beta)" so we can drop it without breaking expectations.

### 3.5 TikTok Live — DEFER to v2 (or NEVER)

**Status as of 2026-04-26:**

- TikTok offers an **oEmbed API** for **VOD videos**, not Lives.
- TikTok's developer platform documents an "Embed Player" but only for posted videos, not for the Live experience.
- All "embed your TikTok Live on a website" tutorials in 2026 use **third-party scrapers** (SociableKIT, EmbedSocial) that proxy a screen-scraped player. These are unreliable, frequently break with TikTok web changes, and create a cross-site cookie / privacy footprint we do not want to take responsibility for.

**Decision: skip in MVP. Do NOT ship third-party scraper integrations.** If a creator demands TikTok Live integration, the right fallback in the Livestream block is "Provider not supported — drop a TikTok profile link in your Bio block instead, and use the Video block to embed individual TikTok videos." The Embedded block can wrap a third-party widget at the creator's own risk, which keeps tadaify out of the maintenance loop.

### 3.6 Instagram Live — DO NOT SHIP (no compliant path)

**Status as of 2026-04-26:**

- Instagram Basic Display API has been end-of-lifed.
- Instagram Graph API (the only remaining sanctioned route) requires the **creator** to OAuth-authorise tadaify's Meta app, requires App Review, requires the account to be Business or Creator (not Personal), and only exposes their own data — there is no public live-state lookup for arbitrary accounts.
- There is **no public embed** for a live IG broadcast. Every "embed Instagram Live" SaaS is a screen-scrape with a short half-life.

**Decision: do NOT ship Instagram Live, in MVP or v2.** The compliance overhead is multi-quarter (Meta App Review for "Live" scopes is one of the slowest in the industry) and the value-add is small. Document this clearly in the picker as "Instagram Live is not supported because Meta does not provide an embed API. Use the Embedded block with a third-party tool at your own risk, or a Bio link to your IG profile."

### 3.7 Comparison summary

| Provider | Iframe? | Channel-bound? | Live-state API | Webhooks? | Ship in MVP? | Ship in v1.1? | Ship in v2? |
|---|---|---|---|---|---|---|---|
| YouTube Live | YES (official) | YES (`live_stream?channel=…`) | yes (search.list, expensive) | yes (WebSub) | **YES** | — | — |
| Twitch | YES (player.twitch.tv) | YES (`?channel=…`) | yes (Helix `streams`) | yes (EventSub) | **YES** | — | — |
| Kick | YES (player.kick.com) | YES (`/<username>`) | yes (api.kick.com) | yes (events API) | **YES** | — | — |
| X Live | partial (JS widget) | partial | broken / restrictive | no | NO | maybe (beta) | yes if demand |
| TikTok Live | NO (third-party scrape only) | NO | none | no | NO | NO | NO (out of scope) |
| Instagram Live | NO | NO | none (Graph API requires per-creator OAuth) | no | NO | NO | NO (out of scope) |

---

## 4. Detect-live-state mechanism — design

### 4.1 The cheap default: page-render-time detection

When a visitor hits a tadaify creator page that contains a Livestream block, we do **not** render the iframe immediately. Instead the block ships an inline component that:

1. Hits an internal `/api/livestream/state?block_id=<uuid>` endpoint (cached by Postgres, NOT a passthrough to the provider).
2. Receives `{ is_live: bool, current_video_id?: string, last_seen_live_at?: ISO, schedule_text?: string }`.
3. Renders either the live iframe (when `is_live=true`) OR the offline-state UI (see §6).

The `/api/livestream/state` endpoint is the only external surface; it never calls the provider directly — it only reads from the `livestream_state` Postgres table. Read latency is sub-50 ms.

### 4.2 The cheap default: write side — pull cron

A single cron (Supabase edge function on a `pg_cron` schedule, every 60 s) executes:

```sql
-- 1. Find channels that are 'hot':
--    embedded on a page that has been published AND received a visitor
--    in the last 24h.
SELECT DISTINCT block_id, provider, channel_handle
  FROM livestream_block lb
  JOIN page p ON p.id = lb.page_id
 WHERE p.published_at IS NOT NULL
   AND p.last_visitor_at > now() - interval '24 hours'
   AND (lb.last_polled_at IS NULL OR lb.last_polled_at < now() - interval '60 seconds')
 ORDER BY lb.last_polled_at NULLS FIRST
 LIMIT 100;
```

The cron then dispatches by provider:

- **Twitch / Kick:** batch the 100 channels into a single Helix call (Twitch supports 100 logins per call) or 100 individual Kick calls (rate-limit-safe at the documented Kick limits).
- **YouTube:** 100 channels = 100 `search.list` calls = 10 000 quota units. This is a full day of free quota in one minute — not viable at scale. **Mitigation: WebSub push subscription is the production path for YouTube; polling only as fallback for the first 200 channels in the system before WebSub onboarding completes.**

The cron writes `is_live`, `current_video_id`, `last_polled_at`, `last_state_change_at` back to the `livestream_block` row. The `/api/livestream/state` endpoint reads from this row.

### 4.3 Hot-channel optimisation

Most creator pages get one or two visitors per day. Polling the channel every 60 s for a creator whose page nobody is on costs us money for nothing. The query above filters to "channels embedded on a page with at least one visitor in the last 24 h". If a page goes cold for 24 h, we stop polling its embedded channels, and the next visitor triggers a one-shot synchronous resolution (`/api/livestream/state` with `?fresh=true` does a single live API call inline with a 5-second timeout).

### 4.4 Webhook upgrade path (post-MVP)

| Provider | Webhook mechanism | Effort to add | When to add |
|---|---|---|---|
| YouTube | WebSub (PubSubHubbub) — subscribe to `https://www.youtube.com/xml/feeds/videos.xml?channel_id=<UC…>` | medium (2–3 days: subscription mgmt, HMAC verification, callback handler, lease renewal cron) | as soon as we cross **500 polled YouTube channels** (quota concern) |
| Twitch | EventSub (webhook transport) — `stream.online` + `stream.offline` per channel | medium (2 days) | as soon as we cross **5 000 polled Twitch channels** (rate limit not an issue till then) |
| Kick | events API (per docs) | medium | parallel with Twitch upgrade |

When webhooks are wired, the cron in §4.2 becomes a fallback for missed events (runs every 30 min instead of every 60 s), saving ~95 % of the API budget.

### 4.5 Cost implications of polling — see §9 cost-at-scale table

---

## 5. When-not-live UX

The block must look intentional when the creator is offline — it cannot just show a YouTube grey placeholder forever. Recommended layered fallback:

### 5.1 Layered fallback hierarchy

```
1. If is_live:
     render <iframe>
     overlay LIVE badge top-left ("● LIVE NOW · 1.2k watching")

2. Else if next_scheduled_broadcast_at is in the future:
     render thumbnail of channel avatar OR most-recent-VOD thumbnail
     overlay text:
       "<creator name> goes live <relative time> — set a reminder"
     CTA #1: native-platform notify ("Notify me on YouTube/Twitch/Kick")
     CTA #2: "Watch the latest stream" → links to last VOD on native platform

3. Else if last_seen_live_at within 30 days:
     thumbnail of last VOD
     "<creator name> is offline. Last live <relative time>."
     CTA: "Watch the recording" → last VOD on native platform
     CTA: "Follow on <Provider>" → native subscribe page

4. Else (cold channel, never seen live or last seen >30d):
     channel avatar + handle
     "<creator name> isn't streaming right now."
     CTA: "Follow on <Provider>" → native subscribe page
```

### 5.2 Source of "next scheduled broadcast"

- **YouTube:** `search.list?eventType=upcoming&channelId=…` — same 100-unit cost. We pull this opportunistically once per day per channel via the same hot-channel cron, NOT on every poll. Cache the next scheduled time on the row.
- **Twitch:** `GET /helix/schedule?broadcaster_id=…` returns the schedule, low rate-limit cost.
- **Kick:** documented in the public API.

Treat `next_scheduled_broadcast_at` as a nice-to-have, NOT a hard requirement. If the field is `null`, fall back to (3) or (4).

### 5.3 What we do NOT show

- "Subscribe to be notified when X goes live" — captures email, requires push notification infrastructure, expands MVP scope by an order of magnitude. **DEFER, see §7.**
- A countdown timer that ticks every second — battery / CPU hit on mobile, hard to keep accurate, low value. Show "in ~3 h" / "tomorrow at 19:00 your local time", refreshed every minute.
- Comments / chat — no chat embed in MVP. Chat lives on the source platform.
- Per-provider branding (the YouTube logo, the Twitch glitch). Use a neutral "● LIVE" + small provider icon (16 px) inside the badge. Keeps the creator's page brand-consistent.

### 5.4 Mobile considerations

The iframe is 16:9 by default. On narrow viewports (<480 px), the live badge collapses to just `●` (no text) to avoid covering the player. Offline state collapses the CTAs into a single "Notify me / Follow" button.

---

## 6. Notification flow — visitors getting pinged when creator goes live

**Recommendation: do NOT build this in MVP.**

### 6.1 What it would actually require

| Component | Effort | Ongoing cost |
|---|---|---|
| Email capture + verification flow on the creator page | medium (1 week) | Resend / SES per email |
| Push notification opt-in (web push via VAPID) | medium-high (1.5 weeks: service worker, VAPID keys, browser permission UX) | free (web push is free) |
| Notification queue (when `stream.online` event fires → fan-out to N subscribers) | medium (1 week: queue + worker + retry + dead-letter) | SQS + Lambda — cheap but not zero |
| Compliance (CAN-SPAM, GDPR consent UI, unsubscribe per creator, double opt-in flow) | high (compliance and legal review) | ongoing legal review |
| Anti-spam (rate limit / captcha to prevent enumeration of creator subscribers) | medium | moderation time |
| Per-creator preferences (mute notifications without unfollowing, frequency caps) | medium (1 week) | DB storage |

Total MVP scope expansion: ~5–6 dev weeks + recurring compliance burden + an entirely new product surface (subscriber lists per creator).

### 6.2 The cheap MVP alternative: native subscribe links

For each provider, link to the **native** subscribe / notify-me path:

| Provider | Native subscribe URL |
|---|---|
| YouTube | `https://www.youtube.com/channel/<UC…>?sub_confirmation=1` (auto-popup the subscribe modal) |
| Twitch | `https://www.twitch.tv/<username>/follow` |
| Kick | `https://kick.com/<username>` (their follow flow is in-page, deep-link to the channel) |

The fan gets notified through the platform they already use, the platform handles delivery + compliance + unsubscribe + frequency caps. tadaify owns zero of that surface.

### 6.3 v2 path

If real creator demand surfaces ("my fans want a tadaify-side ping that aggregates across all my Live presences"), build it as a **separate feature** ("Fan club") not as part of the Livestream block. It overlaps with email capture for the Newsletter block (see sibling research SPIKE on newsletter integration). Do not couple Livestream-block delivery to a brand-new email infrastructure.

---

## 7. Native streaming evaluation — why we are NOT hosting livestreams

### 7.1 Cloudflare Stream Live: the cheapest credible self-host option

Pricing (2026-04-26): **$5 per 1 000 minutes of recorded video stored** + **$1 per 1 000 minutes of video delivered** (i.e. summed across all viewers). Ingest and encoding are free. Bandwidth is included in the delivery price. (Sources at end.)

Concrete worked example for ONE creator who streams 4 h / week with 200 average concurrent viewers:

- Ingest: 4 h × 60 = 240 minutes per week
- Storage: 240 min × 4 weeks = 960 minutes/month → 0.96 × $5 = **$4.80 / month / creator** (recording stored)
- Delivery: 240 min × 200 viewers × 4 weeks = 192 000 viewer-minutes/month → 192 × $1 = **$192 / month / creator** (delivery)

**Total: ~$197 / month for ONE small creator with 200 average concurrent viewers.**

Now compare: that creator on YouTube Live pays YouTube zero (YouTube monetises through ads, of which the creator gets a cut). On Twitch, the creator earns from subs / bits. On tadaify-hosted streaming, that $197/month comes out of tadaify's gross margin per creator. To break even, the cheapest paid tier would have to gross >$200/month per livestreaming creator just to pay for the stream — before any other tadaify cost.

### 7.2 Comparison

| Approach | Per-creator monthly cost (200 avg viewers, 4 h/wk) | Audience-portability | Chat | Discovery |
|---|---|---|---|---|
| Embed YouTube | $0 (creator already there) | 100 % (their YouTube subs follow them anywhere) | YouTube chat (in iframe) | YouTube's algorithm sends new viewers |
| Embed Twitch | $0 | 100 % (Twitch subs persist) | Twitch chat | Twitch directory |
| Embed Kick | $0 | 100 % | Kick chat | Kick directory |
| Self-host on Cloudflare Stream Live | ~$197 / creator | 0 % (no native subscribers, isolated chat, zero discovery) | tadaify must build chat | none |
| Self-host on Mux / Livepeer / others | similar order of magnitude (Mux is more expensive than CF, Livepeer cheaper but more ops) | same as above | same | same |

### 7.3 Verdict

Self-hosting livestream is **strictly worse** than embedding on every dimension that matters for tadaify's MVP target (small / mid creators who already have an audience on YouTube / Twitch / Kick). The only scenario in which self-hosting is justified is "creator wants exclusive paid streams gated behind tadaify subscription" — which is a v3+ premium feature ("Tadaify Live Pro: paywalled live broadcasts hosted by us"), explicitly out of MVP and probably never. Even then, the right architecture is to pass the embed credentials to YouTube's "unlisted live" or Twitch's sub-only stream and gate access at the iframe-render layer, not to host video ourselves.

**Decision: do NOT build native streaming. Ever, until proven wrong by a paying customer asking for it specifically.**

---

## 8. Cost-at-scale table

Assumptions for this table:

- 1 livestream block on average per creator page that uses the feature
- 30 % of creators on the platform use at least one Livestream block (industry-typical adoption)
- Of those, 50 % stream weekly+ (true "hot" channels), 50 % stream rarely (cold channels, polled less aggressively)
- Each "hot" channel polled every 60 s **only when its page received a visitor in the last 24 h** (see §4.3)
- Each "cold" channel polled every 30 min on visitor activity, otherwise never
- Average page sees 5 visitors per day at 100 DAU plat-wide; ratio holds at scale

DAU here = total unique daily visitors to ANY tadaify creator page, NOT creators.

| Plat DAU | Active hot channels (estimate) | Polls/day (Twitch+Kick batched) | Polls/day (YouTube, before WebSub) | YouTube quota cost/day | Estimated USD/month for live-state |
|---|---|---|---|---|---|
| 100 | ~5 | ~7k (batched) | ~7k → 7×100 = 700 units/day if individual | well under free quota | $0 |
| 1 000 | ~50 | ~70k (batched into 700 calls/day) | ~70k → unfeasible without WebSub | exceeds free 10k/day → must move to WebSub | $0 (WebSub is free; just dev time) |
| 10 000 | ~500 | ~700k (7k calls/day Helix, well under limit) | ~700k via WebSub: free | 0 (WebSub) | < $1 (cron compute) |
| 100 000 | ~5 000 | ~7M (70k calls/day, near 50% of Helix daily ceiling — use authenticated app) | ~7M via WebSub | 0 (WebSub) | $5–$10 (compute + DB writes) |
| 1 000 000 | ~50 000 | ~70M — REQUIRES authenticated EventSub (cap raised) for Twitch; sharding of WebSub callbacks for YouTube | ~70M via WebSub | 0 (WebSub) | $50–$200 (compute, mostly Postgres write IOPS for state-change rows) |

**Key insight:** the dominant cost of live-state detection at every scale is **engineer time to migrate to webhooks**, NOT API quota or compute. There is **no scale at which embedding livestreams costs tadaify more than dollars per month.** Self-hosting (§7) costs >$100 per active creator per month from creator #1.

### 8.1 Iframe rendering cost

Rendering an iframe is **free to tadaify** — the visitor's browser fetches video bytes directly from YouTube / Twitch / Kick. tadaify serves zero video bytes. Page weight goes up by ~1 MB (provider's player JS + initial player chunk) on first paint, which is comparable to the Video block today.

---

## 9. MVP recommendation

### 9.1 Ship in v1 (MVP)

| Question | Answer |
|---|---|
| Which providers? | **YouTube Live, Twitch, Kick** (in this priority order in the picker UI) |
| Self-host streaming? | **NO** — never, until proven wrong by a paying customer asking |
| Notification subscription ("ping me when X goes live")? | **NO** — link to native platform follow buttons instead |
| Chat embed? | **NO** — link to native chat on the provider's site |
| Schedule / next-broadcast field? | **YES, soft** — read it from the provider when free to do so, fall back gracefully when missing |
| Multi-channel binding? | **NO** — one channel per Livestream block. Creators add a second block if they stream on two platforms (rare). |
| Per-block tier? | **FREE on all paid tiers AND on the free tier with a 1-block cap** (see §10) |
| Live-state detection? | Polling-only at MVP, hot-channel filter active, WebSub upgrade staged for v1.1 once real channel count requires it |

### 9.2 Defer to v1.1 / v2

| Item | Trigger to revisit |
|---|---|
| YouTube WebSub push subscription | when polled YouTube channel count crosses ~500 |
| Twitch EventSub authenticated push | when polled Twitch channel count crosses ~5 000 |
| Kick events push | parallel with Twitch upgrade |
| X Live (beta) | if 10+ MVP creators ask for it specifically |
| Chat embed | if a creator pilot shows fans expect chat in the iframe (uncertain — most fans use the native platform's chat) |
| TikTok Live | most likely never (no compliant integration path) |
| Instagram Live | never (no compliant integration path) |
| Native streaming (Cloudflare Stream Live) | only if a paying creator explicitly contracts for paywalled exclusive lives |
| Notification subscription | only as part of a broader "Fan club" feature, not a Livestream-block bolt-on |

---

## 10. Tier-gating

Per the user's standing rule (`feedback_no_fake_margin_tier_gating.md`): only gate features on **real infra cost**, not on perceived value.

**Real infra cost of a Livestream block:**

- Iframe render: $0
- Live-state detection: <$0.001 / channel / month at MVP scale; <$0.01 / channel / month even at 1 M DAU
- Storage: ~200 bytes per block row in Postgres

**Therefore: the Livestream block should NOT be a paid-tier-only feature.** Charging for it would be fake-margin gating.

### 10.1 Recommended tiering

| Tier | Livestream block availability |
|---|---|
| **Free** | YES — limited to **1 Livestream block** per page (sufficient for the typical case of "one creator, one platform"). The cap exists not to extract revenue but to limit abuse: a malicious user creating a thousand Livestream blocks pointed at the most-popular YouTube channels could trigger meaningful poll volume against our quota with zero personal interest in the page. |
| **Pro / Paid** | YES — unlimited Livestream blocks per page (multi-platform creators, special-event pages with multiple co-hosts) |
| **Pro / Paid** | YES — Livestream block can be configured with custom poll cadence (default 60 s; Pro can request 30 s for high-stakes broadcasts) — purely a UX choice, the underlying cost difference is rounding-error |

### 10.2 What the picker should look like

- Free user: Livestream tile is enabled, fully visible, fully interactive in the editor. If they try to add a SECOND Livestream block, the save fails with "Free plan supports 1 Livestream block per page. Upgrade for unlimited livestream blocks across multiple platforms." Per `feedback_no_blur_premium_features.md`: validation at save time, never at display time. The block in the picker is never blurred or hidden.

### 10.3 Three pricing variants (per `feedback_no_fake_margin_tier_gating.md`)

| Variant | Free tier limit | Paid tier behaviour | Rationale |
|---|---|---|---|
| **Cost-based (recommended)** | 1 block / page | Unlimited | Reflects the actual ~$0 cost of the feature; cap is anti-abuse, not revenue extraction |
| **Competitor-match** | 1 block / page, polling cadence 5 min | Unlimited blocks, polling cadence 60 s | Gating on detection latency feels like a real difference but is technically arbitrary; matches what Linktree-likes do for "live" widgets |
| **Aggressive (NOT recommended)** | 0 blocks / page (paid-only) | Unlimited | Maximises conversion pressure but extracts revenue from a feature that costs us nothing to ship — invites churn and competitor mockery |

**Pick: cost-based (variant 1).** Strong defaults; matches the rest of tadaify's no-fake-gating posture.

---

## 11. UX flow in the block editor

### 11.1 Form fields

```
[ Livestream block configuration ]

Provider:   ( ) YouTube Live    ( ) Twitch    ( ) Kick

Channel:    [______________________________]  [Test]
            Examples (per provider):
              YouTube — paste your channel URL or @handle (e.g. https://youtube.com/@my-channel or @my-channel)
              Twitch — paste your channel URL or username (e.g. https://twitch.tv/myhandle or myhandle)
              Kick   — paste your channel URL or username

[Test] button result:
  ✓ Found channel: <Channel Display Name> (last live: 3 days ago)
  ✗ Channel not found. Double-check the handle and try again.

When offline:
  [○] Show offline state with last-VOD link  (default ON)
  [○] Show "Follow me on <Provider>" CTA      (default ON)
  Custom message (optional, replaces default):
  [_______________________________________________________]

When live:
  [○] Auto-play (muted)        (default ON; visitor can unmute)
  [○] Show LIVE badge overlay  (default ON)
```

### 11.2 The [Test] button

This is the highest-leverage UX element in the entire block. On click:

1. Server-side resolves the input to canonical form (YouTube `@handle` → `UC…`; Twitch / Kick username already canonical).
2. Calls the live-state API once.
3. Returns one of:
   - `✓ Found channel: <Display Name> (currently LIVE — 1.2k watching)`
   - `✓ Found channel: <Display Name> (last live: 3 days ago)`
   - `✗ Channel not found.`
   - `✗ Channel found but appears to never have streamed live. Are you sure this is the right account?`

The last variant is critical for catching the most common error: a creator pasting their personal YouTube account ID instead of their broadcast channel ID, or pasting a channel that only posts VODs.

### 11.3 Edge cases the editor must handle

| Edge case | UX response |
|---|---|
| Creator pastes a YouTube **video URL** (not a channel URL) | Detect `watch?v=…` pattern, error: "This looks like a single video, not a channel. Use the Video block for one-off videos. For Livestream, paste your channel URL." |
| Creator pastes a YouTube **playlist URL** | Detect `playlist?list=…`, error: "Playlists aren't supported by the Livestream block. Use the Video block for playlists." |
| Creator pastes a Twitch **VOD URL** (`twitch.tv/videos/…`) | Detect, error: "This is a Twitch VOD, not a live channel. Paste `twitch.tv/<your-username>` instead." |
| Creator's channel is private / unlisted | API returns "channel not found" — generic error message acceptable |
| Creator changes their YouTube @handle after saving the block | We stored both `UC…` and the original handle. `UC…` is permanent; embed continues to work. The "original input" field on the block becomes a paper trail. |
| Creator's channel is suspended / DMCA'd | Iframe shows the provider's suspension placeholder. Block still renders. We can detect this from the API call (404 / 403) and surface a "this channel appears to be suspended on <Provider>" warning in the editor on next save. |
| Creator has multiple scheduled future YouTube streams (the "embed breaks" case) | We cannot fix this — it is YouTube's bug. The offline-state UI must include "having trouble seeing the stream? open in YouTube" CTA so visitors are never fully stuck. |
| Provider has an outage (YouTube, Twitch, Kick API down) | The cron's last-known state remains in Postgres. The block shows the last known state with a small `state may be stale` icon. Better than 500-ing the whole page. |
| Visitor is in a country / network where the provider is blocked (e.g. Twitch in Russia) | Iframe fails silently — provider's problem, not ours. We can detect repeated iframe load failures client-side and surface "having trouble loading the stream? open in <Provider>" after a 10 s timeout. |

### 11.4 Editor preview

The block editor shows a live preview of the configured block in both live and offline states (toggle switch in the editor toolbar). The preview uses a stub channel ("twitchpresents") for which we know the iframe renders correctly, NOT the creator's own channel — which would risk showing them an embarrassing offline state in the editor when they are actively configuring the block. (Per `feedback_mockup_full_feature_vision.md`: the editor preview SHOWS the live state regardless of whether the creator's channel is currently live. This is the design contract.)

---

## 12. Technical implementation sketch

### 12.1 Data model

```sql
-- Per-block configuration
create table livestream_block (
  id              uuid primary key default gen_random_uuid(),
  page_id         uuid not null references page(id) on delete cascade,
  provider        text not null check (provider in ('youtube','twitch','kick')),
  channel_handle  text not null,         -- raw user input
  channel_id      text not null,         -- resolved canonical id (UC… for YT; username for Twitch/Kick)
  display_name    text,                  -- cached for offline state UI
  show_offline_state         boolean not null default true,
  show_native_follow_cta     boolean not null default true,
  custom_offline_message     text,
  autoplay_when_live         boolean not null default true,
  show_live_badge            boolean not null default true,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index livestream_block_page_id_idx on livestream_block(page_id);

-- Per-channel live-state cache (one row per (provider, channel_id), shared across blocks)
create table livestream_state (
  provider                  text not null,
  channel_id                text not null,
  is_live                   boolean not null default false,
  current_video_id          text,
  current_title             text,
  current_viewer_count      int,
  last_seen_live_at         timestamptz,
  next_scheduled_live_at    timestamptz,
  last_polled_at            timestamptz not null default now(),
  last_state_change_at      timestamptz,
  last_polled_method        text check (last_polled_method in ('poll','websub','eventsub','events')),
  primary key (provider, channel_id)
);

create index livestream_state_polled_at_idx on livestream_state(last_polled_at);
```

Note: `livestream_state` is keyed on `(provider, channel_id)`, NOT on `block_id`. Two creators embedding the same Twitch channel share the same state row — single source of truth, single poll per channel regardless of how many tadaify pages embed it.

### 12.2 Edge functions

| Function | Trigger | Job |
|---|---|---|
| `resolve-channel` | Called by editor on `[Test]` click and on save | Resolves user input → canonical id; one call to the provider's API; writes / updates `livestream_state` |
| `poll-live-state` | `pg_cron` every 60 s | Picks the 100 oldest "hot" `livestream_state` rows, fan-outs to provider APIs, updates rows |
| `livestream-state` | HTTP, called from the block render | Reads `livestream_state` for the block's channel; returns JSON |
| `youtube-websub-callback` (v1.1) | HTTP, hit by YouTube's WebSub hub | Verifies HMAC, parses Atom feed, updates `livestream_state` with `last_polled_method='websub'` |
| `twitch-eventsub-callback` (v1.1) | HTTP, hit by Twitch | Verifies HMAC, parses event, updates state |

### 12.3 RLS

- `livestream_block`: standard tenancy (creator can read/write their own; published pages allow public SELECT for renderer)
- `livestream_state`: public read, service-role write only (only edge functions write)

### 12.4 Secrets

- `YOUTUBE_DATA_API_KEY` — Supabase Secrets, read by `resolve-channel` and `poll-live-state`
- `TWITCH_CLIENT_ID` + `TWITCH_CLIENT_SECRET` — Supabase Secrets, used to mint app-access tokens
- `KICK_CLIENT_ID` + `KICK_CLIENT_SECRET` (if using OAuth) — Supabase Secrets

Per CLAUDE.md secrets convention: each one also gets an SSM parameter in Terraform for documentation / cleanup.

### 12.5 Dependencies

- `youtubei.js` or direct REST calls via `fetch` (no SDK strictly required)
- `@twitch/easy-helix` or direct fetch (no SDK strictly required)
- For WebSub HMAC verification: `crypto.subtle` is sufficient — no extra dep

### 12.6 Telemetry & operational metrics

Every Livestream block deserves first-class observability — both to debug visitor reports and to feed the upgrade-trigger decisions in DEC-LIVE-05. The minimum operational surface:

| Metric | Source | Use |
|---|---|---|
| `livestream.block.count.total` | Postgres count | base population for all ratios |
| `livestream.block.count.by_provider` | Postgres group-by | provider mix; informs which webhook upgrade to ship first |
| `livestream.poll.invocations.per_minute` | edge function logs | watching the Helix / YouTube quota burn rate |
| `livestream.poll.errors.rate` | edge function logs | provider outage detection; auto-degrade to last-known state |
| `livestream.poll.latency.p99` | edge function logs | Helix outages typically manifest as p99 spikes before they become 5xx |
| `livestream.state.is_live.changes_per_hour` | trigger on UPDATE | sanity check on detection — wild oscillation = bug |
| `livestream.render.is_live.fraction` | rendered-page beacon | empirical "what fraction of Livestream-block visits land on a live broadcast?" — informs whether the offline-state UX actually matters or is the dominant case |
| `livestream.render.click_through.by_state` | rendered-page beacon | how often visitors click the "Follow on Provider" CTA when offline; informs DEC-LIVE-04 fallback ladder |

These metrics drive two decisions post-launch:
- **WebSub upgrade timing (DEC-LIVE-05):** when `livestream.poll.invocations.per_minute` * 100 (YouTube) crosses the daily 10k quota line, file the migration ticket.
- **Offline-state ladder (DEC-LIVE-04):** if `livestream.render.is_live.fraction < 0.05` (95 % of visits land in offline state), the offline-state UX is the dominant experience and worth additional polish; if `> 0.5`, it is a thin failure case and we can simplify.

### 12.7 Failure modes & defensive UX

Detailed failure-mode analysis — every external dep is a future incident.

| Failure | Detection | Visitor-side UX | Engineer-side response |
|---|---|---|---|
| Provider API hard-down (5xx for >5 min) | poll error rate >50 % across N consecutive runs | Last-known state from cache; "stream state may be stale" subtle indicator | Pause cron for that provider, alert via Sentry |
| Provider API rate-limited (429) | 429 from Helix / YouTube | No visitor change (cron retries with exponential backoff) | Switch app token, batch more aggressively |
| Provider's iframe domain (player.kick.com) DNS-blocked locally | client-side iframe load failure timeout | After 10 s, surface "having trouble loading the stream? open in <Provider>" CTA | Nothing (visitor-side only) |
| Channel deleted / suspended on provider | poll returns 404 / 403 sustained | Surface "this channel appears unavailable on <Provider>" + offer to remove block | Email creator with cleanup suggestion (low-priority) |
| Creator changed YouTube handle (channel ID still valid) | Resolved `UC…` still works; cached display_name diverges | Visitor sees stale display name in offline-state UI | Background reconciliation cron refreshes display_name daily |
| Provider revokes our app's API access (ToS violation, incident) | poll returns 401 across all channels for that provider | All blocks for that provider show "stream state unavailable" placeholder + iframe still works | Page on-call; either re-key (transient) or re-apply (longer recovery) |
| Postgres `livestream_state` row deletion (operator error) | Render falls back to "cold" state | Block degrades gracefully | Restore from backup; not a visitor-visible outage |
| WebSub callback URL DNS / TLS failure (post-v1.1) | YouTube unsubscribes us automatically after N retries | Cron polling resumes as fallback | Re-subscribe via lease-renewal cron |

**Critical principle:** the Livestream block must NEVER make the entire creator page fail to render. Every external call wraps in a try/catch with a graceful degradation. The block area renders empty (or with the most pessimistic fallback UI) before it crashes the page.

### 12.8 Privacy & GDPR considerations

The iframe loads provider JS (YouTube/Twitch/Kick), which sets cookies, tracks visitors, and feeds the provider's analytics. This is a real GDPR concern for tadaify creators serving EU traffic.

| Concern | Mitigation |
|---|---|
| Provider sets tracking cookies before consent | Use `youtube-nocookie.com` for YouTube embeds (it defers cookie set until interaction). Twitch / Kick have no equivalent — accept the trade-off and document it. |
| Visitor in EU sees a creator page with auto-loading iframes that fingerprint them | Lazy-load: iframe is replaced with a click-to-load placeholder until visitor clicks or scrolls into view. Already a common pattern; reduces TTFP and is a privacy win. |
| Creator's GDPR notice must mention third-party embeds | Standard creator-side notice template (already on tadaify backlog as part of GDPR compliance work for the platform); the Livestream block adds YT/Twitch/Kick to the list of third parties. |
| `delete_user_data()` RPC must DELETE `livestream_block` rows | Already in scope: any table with `user_id` (transitively via `page.user_id`) is covered by the standard delete cascade |
| Visitor logs / analytics should NOT include provider iframe URLs | Render-time beacon includes only `block_id` + `is_live` state, never provider channel ID |

The lazy-load pattern is also a TTFP win on slow networks; recommended for v1 even before privacy review.

### 12.9 Tests

- **Unit (priority per `feedback_ci_unit_tests_allowed.md`):**
  - `resolveYouTubeHandle('@foo')` → `'UC…'` mock
  - `resolveTwitchUsername('foo')` → `'foo'` (passthrough)
  - `parseChannelInput('https://twitch.tv/videos/12345')` → `{ error: 'video_url_not_channel' }`
  - `parseChannelInput('https://www.youtube.com/watch?v=…')` → `{ error: 'video_url_not_channel' }`
  - `chooseFallbackUI({ is_live: false, last_seen_live_at: '2026-04-25', next_scheduled_live_at: null })` → `'recent_vod'`
  - `chooseFallbackUI({ is_live: false, last_seen_live_at: null, next_scheduled_live_at: null })` → `'cold'`
- **Integration (mocked HTTP):**
  - `pollLiveState` batches 100 Twitch logins into 1 call
  - `pollLiveState` skips channels not visited in the last 24 h
  - `youtube-websub-callback` rejects requests with bad HMAC
- **Playwright (per the new plan-then-tests workflow):**
  - Editor: paste a YouTube channel URL → `[Test]` shows `Found channel: …`
  - Editor: paste a Twitch VOD URL → `[Test]` shows `This is a Twitch VOD, not a live channel`
  - Block render: when `is_live=true` (mocked), iframe present
  - Block render: when `is_live=false`, offline-state UI present with the right CTA tier

---

## 12.10 Rollout plan

Phased rollout reduces blast radius and lets us validate live-state detection before opening the firehose.

**Phase 0 — internal dogfood (1 week)**
- Single tadaify-internal page with a YouTube + Twitch + Kick block each
- Manual `[Test]` flows; verify the cron writes correctly
- No real visitors; pure write-path validation

**Phase 1 — closed beta (2 weeks)**
- Whitelist of 10–20 friendly creators, all on the Pro tier
- Cron polls real channels, real visitors, real iframes
- Daily review of telemetry: `is_live.changes_per_hour`, poll error rate
- Goal: catch provider edge cases (handle changes, suspended channels, rate limit surprises) before public

**Phase 2 — public free + paid (open)**
- Block is live in the picker for all creators
- Anti-abuse cap on free tier engaged
- WebSub upgrade decision metric tracked from day 0

**Phase 3 — webhook migration (when triggered)**
- Per DEC-LIVE-05 timing
- Per-provider migration; YouTube first because of quota pressure
- Fallback polling stays as backstop at 30-min cadence

The hard rule: **no Livestream block ships to a real creator's published page until Phase 1 has run for one full creator-week without a P1 incident.** This is a "first impression matters" feature — a broken Livestream block is the kind of thing a creator publicly tweets a screenshot of.

## 12.11 Migration / backwards compatibility

If this SPIKE results in a breaking change to an already-shipped Livestream block schema (e.g. moving from `videoId` to `channelId`), provide a migration path:

1. New columns added with `NULL` default
2. Background backfill cron resolves existing `videoId` blocks → owner channel via provider API
3. Once 100 % backfilled, drop old columns in a follow-up PR
4. Editor UI defaults to the new flow but accepts old configurations until the deprecation deadline

For this SPIKE the assumption is the Livestream block does NOT yet ship in production — there is no migration burden. If it has shipped (verify before implementation), apply the above pattern.

## 12.12 Internationalisation notes

- Channel handles can contain Unicode (Twitch and YouTube both allow). The `[Test]` resolution must NOT lower-case or otherwise mangle input.
- Display names are user-controlled strings on the provider side. Render escaped, never as innerHTML.
- "Last live X ago" timestamp formatting must respect visitor locale (Intl.RelativeTimeFormat). Already a tadaify TR for any user-visible timestamp.
- Provider names ("YouTube", "Twitch", "Kick") stay in English everywhere, including localised UIs — these are brand names.
- The "Notify me on YouTube" CTA copy: localise the verb, keep the brand name. ("Powiadom mnie na YouTube", "Notify me on YouTube", etc.)

## 13. Open DECs

The following decisions need user input before implementation begins.

### DEC-LIVE-01 — Which 3 providers ship in MVP?

**Czego dotyczy:** scope of provider support in v1 of the Livestream block.

**Szczegolowy opis:** The Livestream block needs at least one provider to be usable. The research shows three providers (YouTube, Twitch, Kick) have clean iframe + live-state-API support; X Live is partial (JS widget, restrictive API); TikTok Live and Instagram Live have no compliant embed path. Shipping more providers means more editor UI and more edge cases per launch; shipping fewer leaves creators on excluded platforms unable to use the block at all.

**Opcje:**
1. YouTube + Twitch + Kick (recommended)
2. YouTube + Twitch only — defer Kick to v1.1 (smaller MVP scope, lose gaming-creator demo)
3. YouTube only — minimum viable Livestream block (creator survey first to validate before expanding)
4. All four (YouTube + Twitch + Kick + X Live as beta) — broadest support, accept X's UX is degraded

**Twoja rekomendacja:** **Option 1.** Three providers, all with first-class iframe + API support. Marginal cost of adding Kick alongside YouTube + Twitch is small (~2–3 days) and Kick is the fastest-growing alt-platform in tadaify's likely creator demographic. Skipping it now means another sprint later.

### DEC-LIVE-02 — Notification subscription in MVP?

**Czego dotyczy:** whether visitors can subscribe to a tadaify-side "ping me when X goes live" notification in v1.

**Szczegolowy opis:** §6 lays out the cost: 5–6 dev weeks of MVP scope expansion, plus an entirely new product surface (subscriber lists per creator, compliance, anti-spam, unsubscribe UX). The cheap alternative is linking to native subscribe pages (YouTube `?sub_confirmation=1`, Twitch follow URL, Kick follow). The native path requires zero infrastructure and the platforms handle delivery + compliance. The downside is no aggregation across providers (a fan following a creator's YouTube and Twitch separately gets two pings, not one).

**Opcje:**
1. NO — link to native subscribe pages only (recommended)
2. YES — build email-only notify-me, push notifications deferred (still ~3 weeks of work)
3. YES — full email + web-push subscription (5–6 weeks of work)

**Twoja rekomendacja:** **Option 1.** Native subscribe is good enough for 95 % of fans, costs zero, and ships with the block. If adoption data later shows fans want aggregated notifications, build it as part of a "Fan club" feature (see open SPIKE on newsletter integration), NOT bolted onto Livestream.

### DEC-LIVE-03 — Tier-gating model

**Czego dotyczy:** how (or whether) to gate the Livestream block by paid tier.

**Szczegolowy opis:** Real infra cost is ~$0 / block / month. Per `feedback_no_fake_margin_tier_gating.md`, gating on imagined value rather than real cost is forbidden. §10 lists three pricing variants. Variant 1 (1 block / page on free, unlimited on paid) is cost-based. Variant 2 (poll cadence as the gate) feels like a real difference but is technically arbitrary. Variant 3 (paid-only) extracts revenue from a feature that costs nothing to ship.

**Opcje:**
1. Variant 1 — Free: 1 block / page; Paid: unlimited (recommended)
2. Variant 2 — Free: 1 block / page + 5-min poll cadence; Paid: unlimited + 60 s poll cadence
3. Variant 3 — Free: no Livestream block; Paid only
4. Free: unlimited blocks (no anti-abuse cap) — simplest, accept potential abuse risk

**Twoja rekomendacja:** **Option 1.** Cost-based gating, anti-abuse cap is light, paid users get a real benefit (multi-platform support on one page). Aligns with the no-fake-margin posture.

### DEC-LIVE-04 — When-not-live UX default state

**Czego dotyczy:** default UX when the creator is not currently live.

**Szczegolowy opis:** §5 proposes a 4-tier fallback (live → upcoming-scheduled → recent-VOD → cold). All four tiers are good UX, but the more we show, the more API quota we burn opportunistically (next-scheduled lookup, last-VOD lookup). The minimal version is "channel avatar + Follow CTA" (tier 4 only). The maximal version is the full 4-tier ladder.

**Opcje:**
1. Full 4-tier ladder (recommended) — best UX, opportunistic API hits
2. Minimal: channel avatar + Follow CTA only — cheapest, blandest
3. 2-tier: live → "channel offline + Follow CTA" — cheap, no need to look up VODs or schedule

**Twoja rekomendacja:** **Option 1.** The opportunistic lookups happen once per day per channel, well within any provider's free quota. The UX upside (showing the next stream time, or the most-recent VOD as a "while you wait" CTA) is significant for fan retention. Cost is rounding-error.

### DEC-LIVE-05 — WebSub / EventSub upgrade timing

**Czego dotyczy:** when to stop relying on polling and switch to push subscriptions per provider.

**Szczegolowy opis:** Polling is fine at MVP scale. YouTube specifically becomes infeasible past ~500 polled channels (10 000 quota / 100 per call = 100 polls / day max on default project). Twitch / Kick polling stays fine into the tens of thousands of channels. The trigger to migrate per provider is a function of channel count, NOT calendar time. The question is whether we pre-build the WebSub handler now (and ship it dormant) or defer the entire implementation until the trigger fires.

**Opcje:**
1. Ship polling-only at MVP; build WebSub when YouTube channel count crosses 500 (recommended)
2. Build WebSub at MVP, ship it active immediately (more work upfront, never have to scramble)
3. Ship polling-only at MVP; defer WebSub indefinitely, scramble if/when quota becomes a problem

**Twoja rekomendacja:** **Option 1.** Track the channel count metric from day 1; when it crosses 500 (or any provider's polling cost crosses $1/month), file the migration ticket. Do NOT build WebSub speculatively — there is a real chance Livestream-block adoption is low enough that we never need it.

### DEC-LIVE-06 — Native streaming (Cloudflare Stream Live) future path

**Czego dotyczy:** under what circumstances tadaify ever hosts livestreams ourselves.

**Szczegolowy opis:** §7 makes the case that self-hosting livestream is strictly worse than embedding for tadaify's MVP target. The only justification would be "creator wants exclusive paywalled live broadcasts that can't go on YouTube/Twitch/Kick because they violate ToS or because the creator wants to capture 100 % of revenue." This is a real market segment (paid live workshops, premium fitness classes, OnlyFans-adjacent content) but it is NOT MVP and probably not v1.

**Opcje:**
1. Document explicitly "NEVER, until proven wrong by a paying customer asking" (recommended)
2. Document as "v3+ candidate, file a research SPIKE if a creator asks"
3. Reserve the option silently, do not document publicly — keep it open

**Twoja rekomendacja:** **Option 1.** Public, unambiguous "we embed, we don't host" positioning is a feature: it sets the right expectation with creators (you keep your audience and your monetisation), it differentiates us from Linktree-likes that try to be everything, and it lets us focus engineering on actual MVP features.

---

## 14. Competitive precedents — what do similar creator-page tools do?

Quick survey of how the closest creator-page competitors handle livestream embedding. Useful both as feature-parity reference and as a sanity check that our recommendation isn't an outlier.

### 14.1 Linktree

- **Livestream support:** dedicated "YouTube" and "Twitch" link types that auto-detect a live broadcast on the linked channel and surface a "● LIVE NOW" badge inline on the linktree page.
- **Mechanism:** server-side polling (per their public engineering posts circa 2023); pull cadence not documented but appears to be in the 1–5 min range.
- **Self-hosted streaming:** none.
- **Notifications:** none on Linktree side; CTAs only deep-link to native subscribe.
- **Tier-gating:** free; the badge is part of the link card and not a paid upsell.

**Read-out for tadaify:** validates the "embed + live-state badge + link to native subscribe" pattern as the correct shape. Linktree has been at this for years and never expanded into self-hosted livestreaming.

### 14.2 Beacons

- **Livestream support:** generic "Embed video" block; no first-class live-state detection. Creators paste a YouTube URL and live works opportunistically.
- **Self-hosted streaming:** none.
- **Notifications:** general "subscribe to my updates" email capture (separate feature).
- **Tier-gating:** the embed block is free; email capture is paid.

**Read-out for tadaify:** Beacons leaves money on the table by not having a first-class Livestream block. Our differentiator is the live-state detection + offline-state UX. Worth shipping.

### 14.3 Carrd

- **Livestream support:** none specific. Creators use the generic "Embed" element with a YouTube URL.
- **Self-hosted streaming:** none.
- **Tier-gating:** Embed elements are gated behind Pro Plus ($19/year — the highest tier).

**Read-out for tadaify:** Carrd's "embed-everything-as-a-paid-feature" model is the wrong precedent for tadaify. Shipping Livestream as a clean first-class block on the free tier is a meaningful product differentiator vs Carrd.

### 14.4 Bento

- **Livestream support:** dedicated YouTube and Twitch blocks with live-state badge; same pattern as Linktree.
- **Self-hosted streaming:** none.
- **Notifications:** none.
- **Tier-gating:** free.

**Read-out for tadaify:** convergent design across Linktree and Bento — both shipped exactly the embed + badge + native-subscribe pattern. Strong evidence the recommendation in §9 is the right shape.

### 14.5 Stan Store

- **Livestream support:** none. Stan Store optimises for product sales, not live broadcasts.
- **Self-hosted streaming:** none.

**Read-out for tadaify:** different product positioning; not directly comparable. Mentioned only to confirm there is no creator-page competitor that has built native streaming infra.

### 14.6 Summary

**No major competitor self-hosts livestreaming.** Every player in the creator-page space that supports live (Linktree, Bento, and others) does it via embeds + live-state detection. This is dispositive evidence that the §7 conclusion (do not self-host) is correct: not a single competitor with a multi-million-creator user base has found a business case to build native streaming, despite all the obvious adjacent monetisation opportunities (paywalled streams, exclusive content, etc.).

The two consistent gaps across competitors that tadaify can differentiate on:
1. **Better offline-state UX** — Linktree's offline state is just "no badge"; Bento's is similar. Our 4-tier ladder (§5) is genuinely better.
2. **Multi-platform support on free tier** — Linktree caps custom blocks on free; we can ship YT + Twitch + Kick for free with a 1-block-per-page anti-abuse cap.

## 15. Editor copy strings (English source — for translation handoff)

Centralising the UX copy in one section so the unit-test-writer + i18n team work from the same source.

| Key | English source string |
|---|---|
| `livestream.picker.title` | Livestream |
| `livestream.picker.description` | Auto-shows your live broadcast when you go on air, with an offline fallback. Not for static videos — use the Video block. |
| `livestream.editor.provider.label` | Provider |
| `livestream.editor.channel.label` | Channel |
| `livestream.editor.channel.placeholder.youtube` | https://youtube.com/@your-channel |
| `livestream.editor.channel.placeholder.twitch` | https://twitch.tv/your-channel |
| `livestream.editor.channel.placeholder.kick` | https://kick.com/your-channel |
| `livestream.editor.test.button` | Test |
| `livestream.editor.test.success.live` | ✓ Found channel: {name} (currently LIVE — {viewers} watching) |
| `livestream.editor.test.success.recent` | ✓ Found channel: {name} (last live: {relative}) |
| `livestream.editor.test.success.cold` | ✓ Found channel: {name} (no live broadcasts yet) |
| `livestream.editor.test.error.notfound` | ✗ Channel not found. Double-check the handle and try again. |
| `livestream.editor.test.error.video_not_channel` | ✗ This looks like a single video, not a channel. Use the Video block for individual videos. |
| `livestream.editor.test.error.playlist_not_channel` | ✗ Playlists aren't supported by the Livestream block. Use the Video block for playlists. |
| `livestream.editor.test.error.vod_not_channel` | ✗ This is a {provider} VOD, not a live channel. Paste your channel URL instead. |
| `livestream.editor.test.error.suspended` | ⚠ This channel appears to be unavailable on {provider}. |
| `livestream.editor.offline.title` | When offline |
| `livestream.editor.offline.show_recent_vod` | Show offline state with last-VOD link |
| `livestream.editor.offline.show_follow_cta` | Show "Follow me on {provider}" CTA |
| `livestream.editor.offline.custom_message.label` | Custom message (optional, replaces default) |
| `livestream.editor.live.title` | When live |
| `livestream.editor.live.autoplay` | Auto-play (muted) |
| `livestream.editor.live.show_badge` | Show LIVE badge overlay |
| `livestream.editor.tier_cap.free` | Free plan supports 1 Livestream block per page. Upgrade for unlimited livestream blocks across multiple platforms. |
| `livestream.render.badge.live` | ● LIVE NOW |
| `livestream.render.badge.live_with_viewers` | ● LIVE NOW · {viewers} watching |
| `livestream.render.offline.scheduled` | {name} goes live {relative} — set a reminder |
| `livestream.render.offline.recent_vod` | {name} is offline. Last live {relative}. |
| `livestream.render.offline.cold` | {name} isn't streaming right now. |
| `livestream.render.offline.cta.notify_native` | Notify me on {provider} |
| `livestream.render.offline.cta.watch_recent` | Watch the latest stream |
| `livestream.render.offline.cta.follow` | Follow on {provider} |
| `livestream.render.error.iframe_failed` | Having trouble loading the stream? Open in {provider} |
| `livestream.render.error.state_stale` | Stream state may be stale |

These strings drive both the editor unit tests (assert correct copy by key) and the i18n bundle (every key has a Polish translation in `pl.json` per project i18n convention).

## 16. Open questions for follow-up SPIKEs

Items that surfaced during this research but are out of scope for this SPIKE — file as separate research tickets if/when relevant:

1. **Chat-on-page integration** — if v2 demand surfaces, is the right shape (a) embedded Twitch/YouTube/Kick chat in a sidebar, (b) a tadaify-side aggregated chat across providers (technically infeasible without read access to provider chat streams), or (c) skip entirely?
2. **Multi-host live events** — a creator co-streaming with another creator (real use case in gaming): should the Livestream block support pinning two channel handles and showing both side-by-side, or is that exotic enough to leave to the Embedded block?
3. **Schedule visualisation** — if the "next scheduled broadcast" data is good enough across providers, is there a separate "Live Schedule" block that just shows a calendar of upcoming broadcasts (no live player at all)? Different shape from the Livestream block; potential add for v2.
4. **Live broadcast announcements via the tadaify Newsletter block** — when `stream.online` fires, automatically push a one-line "I'm live now: <link>" to the creator's newsletter list. Couples Livestream to Newsletter; needs explicit consent design.
5. **Discord / Bluesky / Mastodon Live** — emerging providers with real but small audiences. Re-evaluate at v2 if any of them ship a clean public iframe + live-state API.
6. **iOS / Android native app considerations** — when tadaify ships native apps, can the Livestream block degrade gracefully (open native YouTube app via universal link instead of an in-app webview iframe)? Already standard practice; flag for the mobile app SPIKE.

## 17. Sources

### Embed documentation

- [YouTube IFrame Player API](https://developers.google.com/youtube/iframe_api_reference) — generic embed reference (live not specifically documented here)
- [YouTube embed support article](https://support.google.com/youtube/answer/171780) — generic video embed
- [Webflow community: embedding YouTube live by channel ID](https://discourse.webflow.com/t/how-to-embed-a-youtube-live-stream-via-channel-id/122543) — confirms `live_stream?channel=` URL pattern
- [Twitch — Embedding Everything](https://dev.twitch.tv/docs/embed/everything/) — official Twitch.Embed docs (parent= rules)
- [Kick — How to embed your livestream](https://help.kick.com/en/articles/8010826-how-to-embed-your-kick-livestream) — official Kick player iframe docs
- [Kick player embed page](https://kick.com/embed) — live demo of the embed
- [TikTok Embed Videos developer doc](https://developers.tiktok.com/doc/embed-videos/) — VOD embed only, no Live
- [TikTok Embed Player developer doc](https://developers.tiktok.com/doc/embed-player) — VOD only
- [Instagram embeds in 2026 (commentary)](https://storrito.com/resources/Instagram-API-2026/) — confirms no public IG Live embed
- [Iframely: TikTok / Instagram embed states](https://iframely.com/domains/tiktok)

### Live-state APIs

- [YouTube Data API quota cost calculator](https://developers.google.com/youtube/v3/determine_quota_cost) — confirms 100 units per `search.list`
- [YouTube Data API search.list reference](https://developers.google.com/youtube/v3/docs/search/list) — `eventType=live` requires `type=video`
- [YouTube WebSub / PubSubHubbub push notifications guide](https://developers.google.com/youtube/v3/guides/push_notifications) — official push-notification docs
- [Twitch Helix API reference](https://dev.twitch.tv/docs/api/reference/) — GetStreams endpoint
- [Twitch API request limits forum thread](https://discuss.dev.twitch.com/t/about-twitch-api-request-limits/46195) — ~800 req/min default
- [Twitch EventSub overview](https://dev.twitch.tv/docs/eventsub/) — webhook + websocket transports
- [Twitch EventSub subscription types](https://dev.twitch.tv/docs/eventsub/eventsub-subscription-types/) — `stream.online` / `stream.offline`
- [Twitch EventSub managing subscriptions / cost](https://dev.twitch.tv/docs/eventsub/manage-subscriptions/) — max_total_cost rules
- [Kick Dev Docs portal](https://dev.kick.com/) — public API + OAuth 2.1
- [KickEngineering / KickDevDocs GitHub](https://github.com/KickEngineering/KickDevDocs) — official source of API endpoints
- [Iframely X / Twitter embed coverage](https://iframely.com/domains/x-formely-twitter) — confirms widget-only, no clean iframe for Live broadcasts

### Native streaming pricing

- [Cloudflare Stream pricing docs](https://developers.cloudflare.com/stream/pricing/) — $5/1k stored + $1/1k delivered
- [Cloudflare Stream Live overview](https://developers.cloudflare.com/stream/stream-live/) — billed identically to VOD Stream
- [Serverless Live Streaming with Cloudflare Stream blog post](https://blog.cloudflare.com/stream-live/) — pricing example

### Related orchestrator memory / decisions

- `feedback_no_fake_margin_tier_gating.md` — gate only on real infra cost; 3 pricing variants
- `feedback_no_blur_premium_features.md` — premium features stay visible; gate at save time
- `feedback_mockup_full_feature_vision.md` — editor preview shows the live state regardless
- `feedback_ci_unit_tests_allowed.md` — unit-tests-first for any isolable logic
- `feedback_dec_format_v3_business_cost.md` — business rationale + cost-at-scale per option (applied to DEC-LIVE-* above)
- `feedback_tadaify_no_shop_in_mvp.md` — same thinking applied: ship the picker tile but the implementation is a thin wrapper around the existing creator presence
