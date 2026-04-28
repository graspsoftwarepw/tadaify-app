---
type: research
project: tadaify
title: "Embedded block — scope, alternatives, security (oEmbed vs whitelisted iframe vs kill)"
created_at: 2026-04-26
---

# tadaify Embedded block — scope, alternatives, security

## 1. Executive summary

**Recommendation: Option A — ship `Embedded` as an oEmbed-only block in MVP, with a curated whitelist of 12 providers.** Kill the placeholder "generic embedded" idea (Option B, freeform iframe) for v1, and do **not** fold it into Link/Video either (Option C). The block solves a job-to-be-done that Link and Video do not: **rendering a third-party widget inline on the creator page** — a Spotify track that plays without leaving tadaify, a Bandcamp album with cover art and Buy button, a TikTok post that auto-plays, a Bluesky/Twitter post quoted with avatar and reactions. Link sends visitors away. Video is a special case of this same pattern but already shipped with its own UX (cover art, play-overlay, fullscreen). The Embedded block is the rest of the long tail (audio, social posts, podcasts, Loom recordings, Figma boards) — and those use cases are **central to a creator landing page**.

**Why oEmbed-only for v1, not generic iframe:** oEmbed gives us (a) provider does the work — they return ready HTML with their own sandbox/CSP guarantees, (b) zero per-host firefighting on cookies/X-Frame-Options/CSP, (c) deterministic per-provider rendering we can style consistently, (d) no creator pasting a malicious URL because the URL is parsed and validated against a whitelist before any iframe is rendered. The cost: 12 providers covers ~95% of real creator demand, and we can extend the whitelist (oEmbed or per-provider iframe parser) story-by-story without ever opening "paste arbitrary HTML".

**Why not C (kill it):** the use cases that require a separate block are real — *audio that plays inline*, *social posts quoted with their original styling*, *interactive widgets like Calendly/Tally*. Folding them into Link is a downgrade ("here's a SoundCloud link, click to leave my page"). Folding them into Video confuses the type system (Spotify is not a video). Keeping a single dedicated `Embedded` block with provider auto-detection is cleaner than overloading the existing two.

**Open decisions (5):** see §11. Headline: DEC-EMBED-01 (oEmbed-only Y/N) leaning **Y**; DEC-EMBED-02 (initial whitelist of 12) leaning **YES on the named list**; DEC-EMBED-03 (Iframely vendor or roll-your-own per provider) leaning **roll-your-own** for v1, switch to Iframely paid plan only when whitelist hits 30+ providers; DEC-EMBED-04 (per-tier gating) leaning **all tiers, no gating** because zero tadaify-side cost; DEC-EMBED-05 (block-level vs page-level) leaning **block-level only**, no "embed entire page" mode.

---

## 2. Why this SPIKE exists — context

The tadaify creator-page block library currently has 6 block types in MVP scope:

1. **Link** — title + URL + optional thumbnail; click sends visitor to external URL.
2. **Video** — YouTube URL → render YouTube player inline (also supports Vimeo per Video block spec).
3. **Image** — uploaded file or external URL → render `<img>` inline.
4. **Text** — rich-text paragraph (markdown subset).
5. **Shop** — for MVP this is an external link to creator's existing storefront (Shopify/Stripe/Etsy/Gumroad), not a native shop. See `feedback_tadaify_no_shop_in_mvp.md`. Native shop deferred to v2.
6. **Embedded** — placeholder. The block renders a "coming soon" card in the editor. No implementation, no spec, no test plan.

The user asked: *what should this block actually do, and how does it differ from the Video block?* That is the question this report answers.

Two intuitions are in conflict:

- **Intuition A (the one driving "Embedded exists as a placeholder"):** creators want to drop in arbitrary widgets — a Spotify player, a Calendly booking widget, a Substack subscribe form, a Twitter post — and tadaify should not have to ship a custom block per widget.
- **Intuition B (the one driving "kill it"):** every realistic widget is either a media player (Video block already does this) or a link with a fancy preview (Link block already does this). A separate "Embedded" block is duplication.

Intuition B is *partially* correct — Video block already handles inline media for a very small number of providers (YouTube, Vimeo). The question is whether it should grow to handle Spotify, Bandcamp, SoundCloud, Loom, Twitter, Bluesky, TikTok, Instagram, Calendly, Tally, Typeform, Figma, etc. — at which point the block name "Video" becomes a lie and the data model becomes unwieldy. Intuition A wins on the data-model argument: a generic "Embedded" block with a `provider` field is cleaner than a "Video" block whose `provider` enum has 30 values, half of which are not videos.

This report walks through both options, surveys what 5 competitors do, and lands on a concrete recommendation.

---

## 3. Comparison: Embedded vs Video vs Link button vs Image

### 3.1 The four blocks side-by-side

| Block | Job-to-be-done | Visitor action | Visitor stays on page? | Render mode |
|---|---|---|---|---|
| **Link** | Drive traffic to an external URL | Click → navigates away (new tab) | **No** — leaves tadaify | Static card (title + thumbnail + URL) |
| **Image** | Show a static image (gallery, photo, screenshot) | Optional click-to-enlarge | Yes | `<img>` tag |
| **Video** | Inline video playback (YouTube, Vimeo) | Click play → video plays inline | **Yes** — plays in the page | Provider iframe (YouTube embed, Vimeo player) |
| **Embedded** | Inline widget that is **not** a video (audio, social post, form, doc, board) | Click play / interact → widget responds inline | **Yes** — interacts in the page | Provider iframe (Spotify, Bandcamp, Twitter, Calendly, …) |

The Embedded block exists for the same reason Video does: **the visitor stays on the creator's page and interacts with the third-party widget there**. The only difference is medium — Video happens to be the audiovisual subset that already shipped first.

### 3.2 What goes in Embedded that does NOT fit Link, Image, or Video

| Use case | Link? | Image? | Video? | Embedded? |
|---|---|---|---|---|
| Spotify track (creator's own song) plays inline | No (sends away) | No | No (not video) | **Yes** |
| SoundCloud podcast episode plays inline | No | No | No | **Yes** |
| Bandcamp album with Buy Now button | No | No | No | **Yes** |
| Apple Podcasts episode preview | No | No | No | **Yes** |
| Twitter/X post (quoted with replies count) | No (just a link) | No (PNG screenshot loses interactivity) | No | **Yes** |
| Bluesky post (quoted) | No | No | No | **Yes** |
| Instagram post (single post, embedded with caption) | No | No | No | **Yes** |
| TikTok video (embedded, plays in-page) | Maybe Video | No | **Yes** but stretches the block name | **Yes** (cleaner) |
| YouTube video | No | No | **Yes** | (Yes — but Video already handles it) |
| Vimeo video | No | No | **Yes** | (Yes — but Video already handles it) |
| Loom recording (screen-share / async video) | No | No | Stretches Video | **Yes** |
| Calendly booking widget | No (link, but loses inline UX) | No | No | **Yes** |
| Tally / Typeform form | No | No | No | **Yes** |
| Substack subscribe form | No | No | No | **Yes** |
| Figma file (read-only board) | No | No | No | **Yes** |

The Embedded block fills a real gap. About 70% of the entries above (Spotify, SoundCloud, Bandcamp, Twitter, Bluesky, Instagram, podcasts) are on the **critical path** for a music/social/podcast creator — i.e. exactly the segments tadaify is targeting per `competitors-user-segments.md`.

### 3.3 Why not extend Video instead?

Two arguments against:

1. **Naming.** A "Video" block whose `provider` enum is `["youtube","vimeo","spotify","bandcamp","twitter","calendly"]` is a lie. New creators looking for "where do I add a Spotify player?" will not look under Video. They will look under Music, Audio, or Embedded.

2. **Rendering contract.** Video block ships a play-overlay with cover thumbnail, fullscreen toggle, mute/unmute. Spotify embeds ship their own player chrome. Twitter embeds ship a static post with reply/like links. The rendering contract per provider is not "video player" — it is "whatever the provider returns". Forcing them all into the Video block's UX shell is wrong.

The cleanest split: **Video stays YouTube + Vimeo + TikTok** (the pure video subset). **Embedded handles everything else**.

---

## 4. Industry pattern survey — what do competitors do?

### 4.1 Linktree

Linktree is the category leader (~40M creators per their 2025 IR deck). Their block library has separate, named blocks for each major provider rather than a generic "Embedded" block:

- **Music block** — supports Spotify, Apple Music, SoundCloud, Bandcamp, YouTube Music. Creator pastes URL; Linktree renders the provider's official embed.
- **Video block** — supports YouTube, Vimeo, TikTok, Twitch, Facebook video.
- **Twitter/X embed** — separate dedicated block.
- **Instagram** — dedicated block (embed single post or profile).
- **Form** — dedicated block (Typeform, ConvertKit, Mailchimp).

Linktree explicitly does **not** have a generic "Embedded" or "Custom HTML" block. Reason (per their docs): they value safety + visual consistency over flexibility. A creator cannot paste arbitrary HTML, and cannot embed a non-whitelisted provider — they have to file a feature request.

**Implication for tadaify:** Linktree's split-by-provider approach works but explodes the block library. For MVP we have 6 blocks; if we follow Linktree we'd need ~12 (Music, Video, Twitter, Instagram, Form, Calendly, …). A single Embedded block with auto-detection is more compact and still safe if we whitelist providers.

### 4.2 Beacons.ai

Beacons takes a hybrid approach:

- **Music block** — Bandcamp, YouTube Music, Spotify, SoundCloud, Apple Music. Creator pastes a URL OR pastes the iframe embed code copied from the provider.
- **Video block** — YouTube, TikTok, Vimeo, Twitch.
- **Embed block (generic)** — supports Twitter posts, OpenSea NFT, Instagram. URL or iframe code accepted.
- **Custom HTML** — only on top tier (Creator Pro / Creator Max).

Beacons is the closest precedent for the "Embedded" block — they have one called "Embed" and it covers the long tail. Notably, **they accept iframe paste** as a fallback when URL detection fails. This is a security risk that they've decided to live with on paid tiers.

**Implication for tadaify:** Beacons' "URL or iframe paste" pattern is more flexible than oEmbed-only but more dangerous. A safer take: we accept URLs only, parse them against a whitelist, and reject anything else. Tadaify creators upload to their *own* page so the security blast radius is per-creator, but a single hostile creator pasting an `<iframe src="malicious.example.com/csrf-trigger">` could fire CSRF against any visitor's logged-in session on that domain. Whitelist-only is the right MVP default.

### 4.3 Bento.me

**Important context:** Bento.me shut down on 2026-02-13 after Linktree acquired them in 2023. Bento is no longer a product, but their block library design was the most influential reference for tadaify's grid layout (per `multi-page-grid-and-templates.md`).

Bento's approach:

- **Spotify block** — dedicated.
- **YouTube block** — dedicated.
- **Twitter block** — dedicated.
- **Image block, link block, text block** — dedicated.
- **No generic "Embed" block.**

Bento's design philosophy was: every block has a fixed visual treatment (Spotify always renders the green Spotify card; YouTube always the YouTube player; Twitter always the white-on-black post card). Visual consistency was a feature, not a limitation. Creators reportedly liked this.

**Implication for tadaify:** Bento proved that a per-provider block library can scale to 15+ block types without confusing creators, *if* the editor groups them well (e.g. "Music" submenu containing Spotify/SoundCloud/Bandcamp). For MVP we go with one Embedded block to ship faster, but if usage data shows confusion, we can split into Music/Social/Forms sub-blocks in v1.5.

### 4.4 Carrd

Carrd is a different beast — it's a generic single-page builder, not link-in-bio. Their embed story:

- **Embed element (Pro tier+)** — accepts arbitrary URL → renders in iframe with three aspect-ratio modes (Ignore / Strict / Flexible). No whitelist; no sandbox attribute documented.
- **Custom HTML element (Pro tier+)** — accepts arbitrary HTML, CSS, JavaScript, including `<head>` injection.

Carrd is the **most permissive** of the five competitors — they trust creators because their tier is paid ($19/year Pro, $49/year Pro Plus) and creator velocity is their pitch. The blast radius is per-page (each Carrd page is its own subdomain).

**Implication for tadaify:** Carrd's Custom HTML block is what tadaify must explicitly reject for MVP. A tadaify page is `tadaify.com/<handle>` — all on one origin, sharing cookies. A creator pasting `<script>fetch("/admin/...", { credentials: "include" })</script>` could attempt CSRF against any logged-in tadaify visitor on the same origin. Even if visitors don't have admin access on `tadaify.com`, the reputational risk of "tadaify hosts XSS" is too high. Custom HTML is a v3+ consideration after we have proper origin isolation (per-creator subdomain on a separate apex, e.g. `<handle>.user-content.tadaify.io`).

### 4.5 Stan.store

Stan is a creator-store platform, not a link-in-bio builder. Their "URL/Media product" supports:

- **Display styles:** Button (compact), Callout (large card), Embed (inline iframe).
- **URL types:** YouTube, Spotify (podcast), Apple Podcasts, affiliate links, generic URL.

Stan's "Embed" mode is essentially a fallback for any URL — it renders an iframe with a fixed aspect ratio. This is closer to Carrd's permissive model than Linktree's whitelist model. Stan creators reportedly run into "the iframe shows nothing" bugs frequently — because most non-whitelisted sites set X-Frame-Options: DENY.

**Implication for tadaify:** Stan's experience confirms that a permissive "any URL becomes an iframe" approach is **bad UX**. Creators paste URLs that don't render and don't understand why. Whitelist-only avoids this entire failure mode.

### 4.6 Summary table

| Platform | Generic Embed block? | Custom HTML? | Approach |
|---|---|---|---|
| Linktree | No — per-provider blocks | No | Whitelist via dedicated blocks |
| Beacons | Yes (URL or iframe paste) | Pro tier only | Hybrid; paid tier = trusted |
| Bento.me | No — per-provider blocks | No | Visual consistency over flexibility |
| Carrd | Yes (any URL) | Yes (Pro tier) | Maximum flexibility, paid trust model |
| Stan.store | Yes (any URL) | No | Permissive but UX issues |

**Tadaify's natural position:** between Linktree and Beacons. Single generic "Embedded" block (less library bloat than Linktree) but URL-only against a whitelist (safer than Beacons' iframe-paste).

---

## 5. Option A — oEmbed-based with curated whitelist

### 5.1 What it is

Creator pastes a URL into the Embedded block:

```
https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh
```

Tadaify:

1. Parses URL → extracts host.
2. Looks up host in our whitelist (e.g. `open.spotify.com` → matches `spotify` provider).
3. Constructs the provider's embed URL deterministically: `https://open.spotify.com/embed/track/4iV5W9uYEdYUVa79Axb7Rh`.
4. Renders `<iframe src=...>` with provider-recommended height, sandbox flags, and CSP allowlist.
5. Stores in DB: `{ block_type: "embedded", provider: "spotify", resource_url: "https://open.spotify.com/track/...", resource_type: "track", resource_id: "4iV5..." }`.

The iframe URL is **constructed by tadaify code** from the parsed input — never passed through unchanged. This eliminates an entire class of attacks (URL parameter injection, fragment-based XSS).

### 5.2 Initial whitelist (12 providers)

For MVP, ship support for these 12. Each has a stable embed URL pattern, modest abuse surface, and is on the critical path for at least one creator segment.

| # | Provider | Host pattern | Embed URL pattern | Use case | Has oEmbed? |
|---|---|---|---|---|---|
| 1 | **Spotify** | `open.spotify.com/(track\|album\|playlist\|episode\|show)/<id>` | `https://open.spotify.com/embed/$1/$2` | Music creators (track/album/playlist), podcasters (episode/show) | Yes ([oEmbed](https://developer.spotify.com/documentation/embeds/reference/oembed)) |
| 2 | **SoundCloud** | `soundcloud.com/<artist>/<track>` or `/<artist>/sets/<set>` | `https://w.soundcloud.com/player/?url=<url-encoded>` | Music creators, podcasters | Yes |
| 3 | **Bandcamp** | `<artist>.bandcamp.com/(track\|album)/<slug>` | iframe with track/album ID (parsed from page meta) | Indie music sales | Per-page meta tags only |
| 4 | **Apple Podcasts** | `podcasts.apple.com/<country>/podcast/.../id<id>` | `https://embed.podcasts.apple.com/<country>/podcast/.../id<id>` | Podcasters | Yes ([endpoint](https://podcasts.apple.com/api/oembed)) |
| 5 | **Apple Music** | `music.apple.com/<country>/(album\|playlist\|song)/.../<id>` | `https://embed.music.apple.com/<country>/$1/.../$2` | Music creators | Yes |
| 6 | **YouTube** | `youtube.com/watch?v=<id>` or `youtu.be/<id>` | `https://www.youtube.com/embed/<id>` | Video creators (overlap with Video block — see §5.5) | Yes ([endpoint](https://www.youtube.com/oembed)) |
| 7 | **Vimeo** | `vimeo.com/<id>` | `https://player.vimeo.com/video/<id>` | Filmmakers (overlap with Video block) | Yes |
| 8 | **TikTok** | `tiktok.com/@<user>/video/<id>` | `https://www.tiktok.com/embed/v2/<id>` | Short-form video creators | Yes |
| 9 | **Twitter / X** | `(twitter\|x).com/<user>/status/<id>` | publish.twitter.com oEmbed (returns `<blockquote>` + script) | Social proof, quote-posts | Yes |
| 10 | **Bluesky** | `bsky.app/profile/<handle>/post/<id>` | `https://embed.bsky.app/oembed?url=<url-encoded>` | Bsky-native creators | Yes |
| 11 | **Instagram** | `instagram.com/(p\|reel)/<id>` | Meta oEmbed endpoint (requires Facebook App ID) | Visual creators | Yes (auth required) |
| 12 | **Loom** | `loom.com/share/<id>` | `https://www.loom.com/embed/<id>` | Async video, screen-share creators | Yes ([endpoint](https://www.loom.com/v1/oembed)) |

This list covers **music (3 providers + Apple Music = 4)**, **podcasts (Apple Podcasts + Spotify episodes/shows + SoundCloud)**, **video (YouTube + Vimeo + TikTok + Loom = 4)**, **social (Twitter + Bluesky + Instagram = 3)**. That is the entire bottom half of `competitors-user-segments.md`.

### 5.3 Whitelist v1.5 (next 8 providers, post-MVP)

Once MVP ships and we see real creator demand, add these in priority order:

| # | Provider | Use case |
|---|---|---|
| 13 | **Mixcloud** | DJ mixes |
| 14 | **Dailymotion** | EU video alternative to YouTube |
| 15 | **Twitch** | Live-stream highlights / clips |
| 16 | **Calendly** | Booking widget (high creator demand for coaches/consultants) |
| 17 | **Tally** | Free form alternative to Typeform |
| 18 | **Typeform** | Form widget |
| 19 | **Substack** | Subscribe form (writers) |
| 20 | **Figma** | Design portfolio (read-only board) |

These 8 add another ~3% of demand each, totaling ~24% — bringing whitelist coverage to ~95% of realistic creator embed needs. Anything below that is genuinely long-tail.

### 5.4 Pros (Option A)

- **Safe by construction.** No creator-supplied iframe HTML. URL is parsed, validated, and the iframe `src` is constructed by our code from a known template per provider. An attacker can't inject `<iframe src="evil.com">`.
- **Predictable rendering.** Every Spotify block renders the same way. Designers can theme the wrapper. No "this widget is 800px tall, my page looks broken".
- **Provider does the heavy lifting.** We don't ship a Spotify player — Spotify does. We don't worry about codecs, DRM, CDN, fallbacks. Their iframe handles it. Our maintenance burden is a regex per provider plus a height/aspect-ratio constant.
- **No per-host CSP/cookie/X-Frame-Options surprises.** All 12 providers have set their iframes up to be embedded by anyone (that's their business model). No firefighting.
- **Provider-side analytics.** Spotify counts plays from embedded players. Creators get their existing dashboards unchanged.
- **GDPR-friendly per provider.** Each provider is its own data controller; tadaify is just a frame host. Each provider iframe is the consent boundary (Spotify shows its own cookie banner inside the iframe). Cleaner than tadaify needing to surface 12 different consent flows.

### 5.5 Cons (Option A)

- **Limited to whitelisted providers.** Creator wanting to embed Beatport, Audius, or PeerTube (provider not on our list) is blocked until we add it. Workaround: they use Link block.
- **Per-provider implementation work.** Each provider needs: regex to extract resource ID, embed URL template, recommended height, optional thumbnail fetch, oEmbed call (when supported), test fixtures. Estimated **~2 hours per provider** including a unit test. 12 providers ≈ 24 hours engineering. Not nothing, but bounded.
- **Overlap with Video block (YouTube, Vimeo, TikTok).** Three providers exist in both Video and Embedded. Decision: leave them in both. Editor logic can detect the URL and suggest the more specific block (e.g. paste a YouTube URL → "this looks like a YouTube video — use the Video block, or click to embed as Embedded with provider auto-detected"). See `multi-page-grid-and-templates.md` precedent for "smart paste" routing.
- **oEmbed call latency.** Some providers (Bandcamp, Spotify, Twitter) require a server-side oEmbed call to fetch resource title + thumbnail. This adds 100-500ms to block creation. Mitigation: cache the response in DB at create time (`resource_title`, `resource_thumbnail_url`); never re-fetch on render.

### 5.6 Implementation sketch (Option A)

DB schema (added to `blocks` table or as `block_data` JSONB depending on existing convention — match what Link/Video already use):

```sql
-- if Video block uses block_data JSONB with shape:
--   { provider: 'youtube', video_id: '...', start_seconds: 0 }
-- then Embedded block uses:
--   { provider: 'spotify', resource_type: 'track',
--     resource_id: '4iV5W9uYEdYUVa79Axb7Rh',
--     resource_url: 'https://open.spotify.com/track/4iV5W9uYEdYUVa79Axb7Rh',
--     resource_title: 'Despacito', resource_thumbnail_url: 'https://...',
--     embed_height: 152 }
```

Frontend resolver (TypeScript):

```ts
// src/lib/embedded-block/resolvers.ts

export type EmbeddedProvider =
  | "spotify" | "soundcloud" | "bandcamp" | "apple-podcasts" | "apple-music"
  | "youtube" | "vimeo" | "tiktok" | "twitter" | "bluesky" | "instagram" | "loom";

export interface ResolvedEmbed {
  provider: EmbeddedProvider;
  resource_type: string;       // "track" | "album" | "post" | "video" | ...
  resource_id: string;
  embed_url: string;           // the URL we put in iframe src
  embed_height: number;        // default px height
  embed_aspect_ratio?: number; // for responsive (16/9, 1/1, ...)
  needs_oembed_metadata: boolean; // call oEmbed to fetch title/thumb?
  sandbox_flags: string;       // e.g. "allow-scripts allow-same-origin allow-popups"
  csp_frame_src: string;       // host pattern for CSP allowlist
}

const RESOLVERS: Array<(url: URL) => ResolvedEmbed | null> = [
  resolveSpotify,
  resolveSoundCloud,
  resolveBandcamp,
  resolveApplePodcasts,
  resolveAppleMusic,
  resolveYouTube,
  resolveVimeo,
  resolveTikTok,
  resolveTwitter,
  resolveBluesky,
  resolveInstagram,
  resolveLoom,
];

export function resolveEmbedded(rawUrl: string): ResolvedEmbed | null {
  let url: URL;
  try { url = new URL(rawUrl); } catch { return null; }
  for (const fn of RESOLVERS) {
    const r = fn(url);
    if (r) return r;
  }
  return null; // not whitelisted
}
```

Each resolver function is ~20 LOC. Example:

```ts
function resolveSpotify(url: URL): ResolvedEmbed | null {
  if (url.host !== "open.spotify.com") return null;
  const m = url.pathname.match(/^\/(track|album|playlist|episode|show)\/([A-Za-z0-9]+)$/);
  if (!m) return null;
  const [, type, id] = m;
  const heights = { track: 152, album: 352, playlist: 352, episode: 232, show: 232 };
  return {
    provider: "spotify",
    resource_type: type,
    resource_id: id,
    embed_url: `https://open.spotify.com/embed/${type}/${id}`,
    embed_height: heights[type as keyof typeof heights] ?? 352,
    needs_oembed_metadata: true, // fetch title via spotify oEmbed
    sandbox_flags: "allow-scripts allow-same-origin allow-popups allow-forms",
    csp_frame_src: "https://open.spotify.com",
  };
}
```

Render component:

```tsx
function EmbeddedBlock({ data }: { data: BlockData }) {
  const { embed_url, embed_height, sandbox_flags, resource_title, provider } = data;
  return (
    <div className={`embedded-block embedded-block--${provider}`}>
      <iframe
        src={embed_url}
        title={resource_title}
        height={embed_height}
        width="100%"
        sandbox={sandbox_flags}
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
        allow="encrypted-media; clipboard-write"
      />
    </div>
  );
}
```

Editor UX:

1. Creator clicks "Add block" → "Embedded".
2. Modal opens with single input: "Paste a URL".
3. As they paste, frontend calls `resolveEmbedded(url)`. If null, show "We don't support this site yet — try [request a provider](#)".
4. If matched, preview the iframe inline in the modal with provider name + resource title (fetched via oEmbed call to backend).
5. "Save" → POST to `/api/blocks` with `block_type=embedded` + resolved data.

Backend Edge Function `resolve-embedded`:

- Input: `{ url: string }`
- Output: `{ provider, resource_type, resource_id, embed_url, embed_height, sandbox_flags, csp_frame_src, resource_title?, resource_thumbnail_url? }`
- For providers with oEmbed: server-side fetch `https://provider/oembed?url=<encoded>` to get `title` + `thumbnail_url`.
- 5-second timeout; if oEmbed fails, return resolved data without `resource_title` (creator can edit it manually).
- Cached in Supabase with key `(provider, resource_id)` for 24h to avoid hammering provider oEmbed APIs.

### 5.7 Edge cases (Option A)

- **Provider URL changes format** (e.g. Spotify adds new resource type `chapter` for podcast chapters). Mitigation: ship a `unknown-resource-type` fallback that uses `embed_height: 352` and lets the iframe render whatever the provider returns. Add to whitelist regex in next release.
- **Provider oEmbed endpoint goes down.** Mitigation: oEmbed is called only at create-time for metadata. Render-time iframe works without oEmbed. So a Spotify oEmbed outage means new blocks save without title (degraded), existing blocks unaffected.
- **Provider blocks our user-agent on oEmbed.** Some providers rate-limit. Mitigation: identify ourselves as `tadaify-embed-resolver/1.0 (+https://tadaify.com/embed-info)` and respect 429s; fall back to no-metadata mode.
- **Creator pastes a non-canonical URL** (e.g. a Spotify share link with `?si=...` tracking parameter, or a TikTok URL with `/?_r=1&_t=...`). Mitigation: each resolver normalizes — strips query string, anchors, tracking params, then re-checks against the regex.
- **Creator pastes a URL behind a login wall** (private Spotify playlist, private Loom video). The iframe will render the provider's "Login required" UI. Acceptable — creator's problem, not ours. Show a tooltip in editor: "If your visitors can't see this, the resource may be private."
- **Creator embeds the same provider twice on one page** (two Spotify tracks). Should just work — each block is independent. Page-load perf may suffer (each iframe = one extra HTTP cascade). Mitigation: enforce `loading="lazy"` on every iframe; warn in editor at >5 embedded blocks.

---

## 6. Option B — generic iframe with whitelist

### 6.1 What it is

Same UX as Option A from creator's POV (paste URL → preview → save) but the resolver is **just a host-whitelist check**, not a per-provider URL parser. The URL is passed unchanged into the iframe `src`.

```ts
const HOST_WHITELIST = new Set([
  "open.spotify.com",
  "w.soundcloud.com",
  "bandcamp.com",
  "embed.podcasts.apple.com",
  // ... ~50 hosts
]);

function resolveEmbeddedB(rawUrl: string): { embed_url: string } | null {
  const url = new URL(rawUrl);
  if (!HOST_WHITELIST.has(url.host)) return null;
  return { embed_url: rawUrl };
}
```

### 6.2 Pros (Option B)

- **Faster to ship per provider.** Adding a new provider = one line in `HOST_WHITELIST`. No regex, no embed URL template, no per-resource-type height.
- **Supports providers without a clean URL → embed mapping.** If a provider says "use this URL directly in an iframe", we just whitelist the host.
- **Simpler code.** ~50 lines vs ~500 lines for Option A's 12 resolvers.

### 6.3 Cons (Option B)

- **Creator has to figure out the embed URL themselves.** Spotify shares a watch URL (`open.spotify.com/track/...`) but the embed URL is `open.spotify.com/embed/track/...`. The creator needs to know to paste the latter, not the former. Bad UX. Half of creators will paste the wrong URL and see "your URL is not on our whitelist" because we whitelisted `open.spotify.com/embed/...` not `open.spotify.com/...`.
- **No height/aspect-ratio guidance per resource type.** A Spotify track is 152px tall; an album is 352px. Without per-provider knowledge, we either pick one wrong default or force creator to set height manually (more bad UX).
- **No oEmbed metadata fetch.** No title, no thumbnail in editor preview. Creator pastes a URL and sees... a generic iframe with no idea if the URL is correct.
- **No URL normalization.** Tracking parameters, shorteners, redirects all break embed-or-not predictability.
- **More attack surface.** With Option A, the iframe `src` is constructed from a known template. With Option B, the creator-supplied URL is passed through. URL fragment XSS, query parameter injection, open-redirect chaining via the embed URL — all possible if any whitelisted host has any such bug. Whitelisting hosts ≠ whitelisting all URLs on those hosts.
- **CSP allowlist becomes wide.** With Option A we know exactly which hostnames need to be in CSP `frame-src`. With Option B, our CSP is roughly "all 50 whitelisted hosts" — bigger blast radius if any of them gets compromised.

### 6.4 When B becomes viable

If we hit 50+ providers and per-provider engineering is the bottleneck, B's "just add to whitelist" model wins on ops velocity. But at that point we're competing with Iframely (which has 1900+ providers) so we should evaluate buying Iframely, not rolling our own permissive whitelist.

For MVP: Option A wins.

---

## 7. Option C — kill the block, fold capabilities into Link / Video

### 7.1 What it is

Remove the Embedded block entirely. Either:

- **C.1 — Fold into Video.** Video block grows a `provider` enum from `[youtube, vimeo]` to `[youtube, vimeo, spotify, soundcloud, bandcamp, twitter, instagram, ...]`. Rename the block to "Media" or "Inline Player".
- **C.2 — Fold into Link.** Link block gets a "Show inline preview" toggle. When enabled and the URL is recognized (e.g. Spotify), render the provider iframe instead of the link card.
- **C.3 — Both.** Each provider goes into the most natural existing block.

### 7.2 Pros (Option C)

- **No new block type.** Editor stays at 5 blocks (Link, Image, Video, Text, Shop). Less to teach creators.
- **Slight code consolidation.** Resolver logic reused inside Video / Link.

### 7.3 Cons (Option C)

- **Naming lies.** Video block with a `provider: "twitter"` is not a video. Link block with "show inline preview" that happens to render an iframe is not a link.
- **Data model bloat.** Video block schema balloons with 30 provider-specific fields.
- **UX confusion.** Creator looking for "where do I add a Spotify player?" goes to Video block, doesn't find Spotify, gives up. Or goes to Link block, doesn't find an embed option, uses an external link → page degraded.
- **Loses the abstraction.** "I want to embed something on my page" is a single mental model. Splitting it across Video and Link is leaky.
- **Can't display Twitter/Instagram/Bluesky posts.** These are not videos and not links — they are posts with reactions, replies, avatar. Forcing them into Video or Link strips the metadata that makes them useful.

### 7.4 Verdict on C

**Reject.** The naming + UX cost is high; the savings are minimal (one block in the library, ~2 days of editor work). Keeping a dedicated Embedded block is cleaner and ships in the same time.

---

## 8. Security analysis

### 8.1 Attack surfaces

For each option, the relevant attack surfaces are:

| Surface | Option A (oEmbed-only, URL constructed) | Option B (URL whitelist) | Option C (folded) |
|---|---|---|---|
| **Creator pastes XSS payload** | Blocked — URL parsed, iframe src constructed from template. Payload can't reach iframe. | Partial — payload in URL query string passed through to whitelisted host. Depends on provider not having reflected XSS. | Same as A or B per provider. |
| **Creator pastes open-redirect URL** | Blocked — only canonical embed URLs match resolver regex. | Possible — `open.spotify.com/track/X?redirect=evil.com` if provider has open redirect. | Same as A or B. |
| **Creator embeds malicious provider** | Blocked — host not in whitelist → resolver returns null. | Blocked — same. | Same. |
| **Provider gets compromised, serves XSS via iframe** | Mitigated by sandbox flags + CSP. Provider can still execute scripts in iframe context, but not in tadaify origin. | Same. | Same. |
| **Clickjacking via iframe** | Iframes are sandboxed; tadaify doesn't render in an iframe (X-Frame-Options: DENY on tadaify itself). | Same. | Same. |
| **Cookie theft from logged-in visitor** | iframe is on different origin (open.spotify.com etc.); browser SOP blocks cross-origin cookie access from sandboxed iframe. | Same. | Same. |
| **Tracking / fingerprinting** | Each provider iframe loads provider's tracking. Disclosed in tadaify privacy notice. | Same. | Same. |
| **Mixed content (http inside https tadaify)** | Resolver enforces `https://` only. | Should also enforce. | Same. |

### 8.2 Sandbox flags

For each provider, ship the **minimum** sandbox flags needed for the iframe to function. Example per-provider matrix:

| Provider | `allow-scripts` | `allow-same-origin` | `allow-popups` | `allow-forms` | `allow-presentation` (fullscreen) | Reasoning |
|---|---|---|---|---|---|---|
| Spotify | Yes | Yes | Yes | No | Yes | Player needs JS + same-origin for auth cookie + popup for "open in app" + fullscreen for video podcasts |
| SoundCloud | Yes | Yes | Yes | No | No | Same minus fullscreen |
| Bandcamp | Yes | Yes | Yes | No | No | Player + Buy popup |
| Apple Podcasts | Yes | Yes | Yes | No | No | Player + Open in Apple Podcasts popup |
| Apple Music | Yes | Yes | Yes | No | Yes | Player + popup + AirPlay fullscreen |
| YouTube | Yes | Yes | Yes | No | Yes | Player + popup + fullscreen |
| Vimeo | Yes | Yes | Yes | No | Yes | Player + popup + fullscreen |
| TikTok | Yes | Yes | Yes | No | No | Player + popup |
| Twitter / X | Yes | Yes | Yes | No | No | Tweet card + popup for reply |
| Bluesky | Yes | Yes | Yes | No | No | Same |
| Instagram | Yes | Yes | Yes | No | No | Post card + popup |
| Loom | Yes | Yes | Yes | No | Yes | Player + popup + fullscreen |

**Critical caveat:** when iframe `src` is the **same origin as the embedding page**, `allow-scripts` + `allow-same-origin` together let the iframe break out of the sandbox by removing the sandbox attribute and reloading. **This only matters if the iframe and the embedder share an origin.** For tadaify, every embed is cross-origin (Spotify is `open.spotify.com`, tadaify is `tadaify.com`), so the combination is safe. Document this in code comments to prevent future regression where someone embeds tadaify-served HTML.

### 8.3 CSP `frame-src` policy

Tadaify ships a `Content-Security-Policy` header that includes:

```
frame-src 'self' https://open.spotify.com https://w.soundcloud.com https://bandcamp.com
          https://embed.podcasts.apple.com https://embed.music.apple.com
          https://www.youtube.com https://player.vimeo.com https://www.tiktok.com
          https://platform.twitter.com https://embed.bsky.app
          https://www.instagram.com https://www.loom.com;
```

**Maintenance:** the CSP is built from the resolver whitelist at build time. Adding a provider to the resolver auto-adds to CSP. Single source of truth.

### 8.4 X-Frame-Options bypass concerns

The CVE-2024-5691 disclosure (Mozilla bugzilla, May 2024) showed that an iframe with `sandbox` displaying a page that returns `X-Frame-Options: DENY` could be clickjacked via the browser's own error page. Mozilla patched this in Firefox 127. For tadaify: we don't intentionally embed pages that return XFO:DENY (those are exactly the providers that aren't on our whitelist). Defense-in-depth: ensure tadaify pages themselves return `X-Frame-Options: DENY` and `frame-ancestors 'self'` so tadaify can't be embedded inside another site as part of a clickjack chain.

### 8.5 What happens if creator pastes a malicious URL?

Walk through three concrete attacks:

1. **Attack:** `<iframe src="javascript:alert(1)">` via paste.
   - Option A: URL parsing throws (invalid scheme) → resolver returns null → block not created.
   - Option B: URL parsing throws → resolver returns null → block not created.
   - Mitigation: enforce `url.protocol === "https:"` early in every resolver.

2. **Attack:** `https://open.spotify.com/track/X?param=<script>` (reflected XSS in Spotify, hypothetical).
   - Option A: query string stripped during normalization → safe URL passed to iframe → no XSS.
   - Option B: query string passed through → XSS executes inside Spotify origin (not tadaify). Browser SOP prevents access to tadaify cookies. Reputational hit only; no data leak.
   - Both: dependence on Spotify not having such a bug. Real-world: providers on our whitelist are large enough to have hardened against reflected XSS.

3. **Attack:** `https://attacker.example.com/looks-like-spotify` (host not on whitelist).
   - Option A & B: resolver returns null → block not created → safe.

4. **Attack:** open-redirect chain via Spotify URL `https://open.spotify.com/track/X?redirect=https://evil.example.com`.
   - Option A: query string stripped → no redirect → safe.
   - Option B: query string preserved → if Spotify implements that redirect param (they don't), iframe loads evil.com inside Spotify's origin context → still cross-origin from tadaify, browser SOP applies → reputational hit only.

The conclusion: **Option A is meaningfully safer than Option B** because of URL normalization. The marginal cost (per-provider regex) is low.

### 8.6 GDPR / cookie consent

Each provider iframe sets its own cookies. From a GDPR perspective, tadaify is the controller of the page; the providers are joint controllers when their iframes load. We must:

- Disclose in tadaify privacy policy: "Embedded blocks load third-party content from [list]. These services may set cookies and collect data per their own privacy policies."
- Provide a per-provider opt-out (e.g. consent banner: "Allow embedded content?"). Until consent, render a placeholder thumbnail with "Click to load Spotify player" — common pattern.
- Per-block consent state stored in localStorage, not server (no PII).

This is a v1.5 add (consent UX); MVP can ship with the disclosure-only path and a single global "Embedded blocks may set cookies" notice in privacy policy, since most early-adopter creators won't have EU traffic at scale.

---

## 9. Cost-at-scale

The Embedded block has **near-zero tadaify-side cost** at any scale — all rendering is client-side via provider iframes; the only server cost is the one-time oEmbed metadata fetch at block creation, which is cached in DB.

### 9.1 Direct costs

| Component | 100 DAU | 1k DAU | 10k DAU | 100k DAU | 1M DAU |
|---|---|---|---|---|---|
| Page render (iframe HTML) | $0 | $0 | $0 | $0 | $0 |
| oEmbed call at block creation (1 per new block) | $0 | $0.01 | $0.10 | $1 | $10 |
| Cache row in Supabase (one row per resolved embed) | $0 | $0 | $0 | $0.50 | $5 |
| CDN bandwidth for embed iframe HTML wrapper (~2KB) | $0 | $0 | $0.01 | $0.10 | $1 |
| **Total tadaify cost** | **~$0** | **~$0.01** | **~$0.11** | **~$1.60** | **~$16** |

**Assumptions:**
- ~10% of pages have an Embedded block.
- oEmbed call avg 1KB request + 2KB response; cached for 24h then refreshed; ~100 calls/day at 10k DAU.
- Edge Function cold-start cost negligible at this scale.
- CDN serves the wrapper HTML (the iframe tag itself); provider serves the heavy assets.

### 9.2 Indirect costs

- **Provider rate limits on oEmbed.** Spotify: no documented rate limit for oEmbed (it's a public CDN endpoint). Twitter: 1500 req/15min from publish.twitter.com per IP. At 1M DAU and 1% block creation rate ≈ 10k calls/day spread across our IPs → well under any rate limit.
- **Provider takedown risk.** If Spotify decides to deprecate oEmbed (unlikely; it's been stable for 6 years), we lose metadata fetch. Embeds keep working. Acceptable risk.

### 9.3 Comparison vs alternatives

| Approach | Cost at 100k DAU |
|---|---|
| Option A (oEmbed + curated whitelist) | ~$1.60/mo |
| Option B (host whitelist, no oEmbed) | ~$0/mo (no oEmbed call) |
| Option C (folded into Video/Link) | Same as A — provider costs are identical |
| Iframely Cloud API (1900 providers) | $79/mo (Pro tier) → $399/mo (Business) |
| Self-host Iframely on AWS | ~$30/mo (1 t3.small + RDS) |

**Conclusion:** Option A is essentially free at MVP scale and remains under $20/mo even at 1M DAU. No tier gating needed (no real cost to gate against, per `feedback_no_fake_margin_tier_gating.md`). Iframely becomes cost-relevant only if we expand to 30+ providers AND have engineering capacity issues — not before MVP.

---

## 10. Recommendation

**Ship Option A — oEmbed-based with curated 12-provider whitelist — for MVP.**

Concrete plan:

1. **MVP scope (this story):**
   - DB column / JSONB shape for Embedded block data (per §5.6).
   - Resolver functions for all 12 providers in `src/lib/embedded-block/resolvers.ts`.
   - Edge Function `resolve-embedded` that calls oEmbed for the 7 providers that support it.
   - Editor modal: paste URL → preview iframe → save.
   - Render component: sandboxed iframe with provider-specific flags + per-block CSP allowlist.
   - Mockup (mandatory per `feedback_mockup_full_feature_vision.md`) showing all 12 providers populated on a sample creator page.
   - Unit tests for each resolver (12 × ~5 cases each = ~60 unit tests).
   - Playwright plan for end-to-end paste → preview → save → render → visitor sees iframe.

2. **v1.5 (next quarter):**
   - Add 8 more providers (Mixcloud, Dailymotion, Twitch, Calendly, Tally, Typeform, Substack, Figma).
   - Cookie consent banner per provider.
   - Editor: smart-paste detection (if URL matches Embedded provider, suggest Embedded over Link).

3. **v2 (later):**
   - Decision point: do we hit 30+ providers? If yes, evaluate Iframely Cloud API vs continuing to roll our own.
   - Decision point: do we offer a "request a provider" form to creators? Yes — collect demand data.
   - Stretch: per-creator subdomain isolation (move to `<handle>.user-content.tadaify.io`) so we can safely offer "Custom HTML" block on top tier without polluting `tadaify.com` origin.

**Reject Option B** (URL whitelist without per-provider parsing) — too many UX failures (wrong URL → broken iframe; no metadata; no height guidance) and marginally worse security.

**Reject Option C** (fold into Video/Link) — naming + data model + UX cost outweigh saving one block in the library.

---

## 10b. Implementation breakdown — story decomposition

The Embedded block MVP can ship as a single feature story, but the work decomposes naturally into 6 sub-tasks for review/PR-sizing purposes. Per `feedback_per_deliverable_verification.md` we ship one PR per sub-task and let the user click-test on DEV before the next.

### 10b.1 Sub-task list

| # | Sub-task | Estimate | Output | Risk |
|---|---|---|---|---|
| 1 | DB schema + Block type enum + JSONB shape | 1h | Migration `<ts>_add_embedded_block_type.sql`; TS types in `src/types/blocks.ts`; updated `delete_user_data()` RPC; updated user-export Edge Function | Low — additive only |
| 2 | Resolver library — 12 providers + tests | 8h | `src/lib/embedded-block/resolvers.ts` + `src/lib/embedded-block/resolvers.test.ts` (~60 unit tests) | Low — pure functions, well-tested |
| 3 | Edge Function `resolve-embedded` (oEmbed metadata) | 3h | `supabase/functions/resolve-embedded/index.ts` + unit tests + Supabase cache table for `(provider, resource_id) → metadata` | Medium — handles 7 different oEmbed APIs, each with quirks |
| 4 | Editor UI — modal + paste + preview | 4h | `src/components/blocks/EmbeddedBlockEditor.tsx` + Storybook story + Playwright plan | Medium — UX edge cases (invalid URL, oEmbed fail, network slow) |
| 5 | Render component — sandboxed iframe + CSP | 3h | `src/components/blocks/EmbeddedBlockRender.tsx` + CSP middleware update + per-provider sandbox flags table | Medium — security-critical, every flag matters |
| 6 | Mockup + acceptance criteria + e2e plan | 3h | `claude-reports/mockups/<slug>/index.html` showing all 12 providers populated; `e2e/plans/<story-id>-embedded.plan.md` | Low — design work, no code risk |
| **Total** | **~22h engineering + 3h ops/review** | | | |

### 10b.2 Suggested PR order

1. **PR 1 — schema + types + GDPR plumbing** (Sub-task 1). Lands first; no UI; safe to merge.
2. **PR 2 — resolver library** (Sub-task 2). Pure code with unit tests; ships ahead of any UI.
3. **PR 3 — Edge Function** (Sub-task 3). Backend ready before frontend can call it.
4. **PR 4 — render component + CSP** (Sub-task 5). Public-facing render contract before editor.
5. **PR 5 — editor + mockup + plan** (Sub-tasks 4 + 6). Closes the loop; user click-tests on DEV.
6. **PR 6 — Playwright spec** (post-merge, separate Opus dispatch via `test-spec-generator`).

### 10b.3 Acceptance criteria (story-level)

When this MVP story is "done":

- [ ] Creator can add an Embedded block to any page from the block library.
- [ ] All 12 providers in §5.2 successfully resolve from a canonical URL.
- [ ] Editor preview renders the iframe within 2 seconds of paste.
- [ ] Invalid / non-whitelisted URL shows a clear error with "request a provider" link.
- [ ] Saved blocks persist across reload and render on the public creator page.
- [ ] Public render uses correct sandbox flags per provider (table §8.2).
- [ ] CSP `frame-src` includes only the 12 whitelisted hosts.
- [ ] All 60 unit tests pass.
- [ ] e2e plan exists for paste → preview → save → render → visitor sees iframe.
- [ ] Mockup matches the final implementation pixel-for-pixel.
- [ ] User-export Edge Function includes `block_data` for embedded blocks.
- [ ] `delete_user_data()` cascades correctly (no orphan rows).

### 10b.4 Edge cases to spec in `e2e/plans/<story-id>-embedded.plan.md`

The following ECNs need to be enumerated at refinement and either covered or explicitly deferred (per `feedback_refinement_includes_test_plans.md`):

- **ECN-EMBED-01:** Creator pastes a Spotify share URL with `?si=...` tracking param → resolver normalizes, embed renders correctly without param leakage.
- **ECN-EMBED-02:** Creator pastes an Apple Podcasts URL from a country other than `us` (e.g. `podcasts.apple.com/pl/podcast/...`) → resolver respects country code; iframe renders Polish UI.
- **ECN-EMBED-03:** Creator pastes a private SoundCloud track URL → iframe renders SoundCloud's "Track unavailable" UI; tooltip in editor warns "If your visitors can't see this, the resource may be private".
- **ECN-EMBED-04:** Creator pastes an Instagram URL but tadaify's Facebook App ID has expired (oEmbed call fails) → fallback to "instagram-no-metadata" mode; embed still renders; creator can manually edit title.
- **ECN-EMBED-05:** Creator pastes a Bluesky URL where the post has been deleted between save-time and render-time → iframe renders Bluesky's "Post deleted" UI; no tadaify error.
- **ECN-EMBED-06:** Creator embeds 5 Spotify blocks on one page → all 5 lazy-load; first-paint <2s.
- **ECN-EMBED-07:** Creator embeds an oEmbed provider during a network outage → `resolve-embedded` Edge Function returns 503 within 5s; editor shows "couldn't fetch metadata, save anyway?".
- **ECN-EMBED-08:** Creator pastes a YouTube URL where the video has age restrictions → iframe shows YouTube's "Sign in to confirm your age" UI; we don't try to bypass.
- **ECN-EMBED-09:** Visitor with an ad-blocker that blocks `open.spotify.com` views the page → iframe is blocked at network layer; tadaify renders a fallback "Embedded content blocked by your browser" placeholder via `<iframe onerror>`.
- **ECN-EMBED-10:** Creator deletes an Embedded block → row removed; oEmbed cache row stays (cache reused if creator re-embeds same URL).
- **ECN-EMBED-11:** Tadaify CSP `frame-src` mismatched (deployment skipped) → iframe is blocked by CSP; visitor sees "blocked by CSP" in console; render component logs to Sentry. This is a deploy-time bug class — covered by §10b.5 below.
- **ECN-EMBED-12:** Creator embeds a Bandcamp URL but Bandcamp's track ID lookup (scraping page meta) fails → fall back to URL-only mode; embed renders; no thumbnail.

Of these, ECN-01 through ECN-08 are unit-testable in the resolver. ECN-09 through ECN-12 need either Playwright or integration tests.

### 10b.5 CI gate for CSP drift

Per `feedback_lambda_ci_deps_gate.md` and `feedback_env_var_grep_before_deploy.md`, every deploy that ships frontend code MUST:

1. **CI step: CSP-resolver consistency check.** A unit test that imports both the resolver whitelist (12 hostnames) and the CSP middleware (the `frame-src` directive string) and asserts they match. Drift fails CI.
2. **CI step: oEmbed endpoint reachability.** Optional — not every deploy. A nightly cron checks `https://open.spotify.com/oembed?url=X` and the other 6 endpoints; alarms if any go from 200 to non-200 for >2 consecutive runs.

These prevent the production-firefighting class of bugs.

---

## 10c. Comparison vs Iframely (the buy-vs-build calculation)

If we ever consider buying instead of building, here's the head-to-head.

### 10c.1 Iframely Cloud pricing (April 2026)

| Tier | Price | API calls/mo | Domains supported | Notes |
|---|---|---|---|---|
| Free | $0 | 1,000 | All 1,900 | No SLA; rate-limited |
| Starter | $25/mo | 10,000 | All 1,900 | No SLA |
| Pro | $79/mo | 100,000 | All 1,900 | 99.5% SLA |
| Business | $399/mo | 1,000,000 | All 1,900 | 99.9% SLA + dedicated support |
| Enterprise | Custom | Custom | All 1,900 + custom | + on-prem |

(Pricing per public iframely.com/pricing as of 2026-04-26 — confirm before any purchase decision.)

### 10c.2 Self-host Iframely (open source `itteco/iframely`)

- AWS cost: ~$30/mo for 1× t3.small EC2 + RDS Postgres for cache + ALB.
- Setup: ~1 day engineering for Terraform module + IAM + secrets.
- Maintenance: ~2h/mo to apply upstream updates.
- Pros: 1,900 providers out of the box; no per-call billing; we control the cache.
- Cons: another service to operate; updates require attention; cache is our problem.

### 10c.3 Roll-your-own decision matrix

| Factor | Roll-your-own (12 providers) | Iframely Cloud Pro | Self-host Iframely |
|---|---|---|---|
| Initial engineering | 22h | 4h | 8h |
| Monthly cost (10k DAU) | $0 | $79 | $30 |
| Monthly cost (100k DAU) | ~$2 | $79 | $30 |
| Monthly cost (1M DAU) | ~$16 | $399 | $40 |
| Provider coverage | 12 (95% of demand) | 1,900 (99.9% of demand) | 1,900 |
| Vendor lock-in | None | Iframely API surface | Open source — no lock |
| Security blast radius | Smallest (we construct iframe src) | Medium (Iframely returns HTML) | Medium |
| Time-to-add-provider | 2h | 0h | 0h |
| Fits MVP scope | YES | Yes (overkill) | Yes (overkill) |

**Recommendation reaffirmed: roll-our-own for MVP.** Buy/self-host becomes interesting only if we cross 30+ provider requests AND have engineering capacity issues. Realistic timeline for that crossover: 12+ months post-MVP.

### 10c.4 Hybrid path (if we change our minds in v2)

We can hybridize without rewriting: keep our 12 native resolvers (best UX, smallest blast radius), and fall back to Iframely for "everything else" providers gated to the paid tier. The data model already supports this — `provider` field expands from a 12-value enum to a `string` with a separate `resolved_via: "native" | "iframely"` discriminator. Future-friendly.

---

## 11. Open DECs for user

### DEC-EMBED-01 — oEmbed-only Y/N for v1?

- **Czego dotyczy:** scope of the Embedded block in MVP — strict oEmbed-only with 12 whitelisted providers, or also accept iframe-paste fallback (Beacons-style)?
- **Szczegolowy opis:** Option A as specified above is oEmbed-only — creator pastes a URL, we resolve it through one of 12 per-provider resolvers, and only matched URLs work. An alternative is to also accept "iframe paste" (creator copies the iframe code from the provider's "Share → Embed" UI and pastes it into tadaify). This is what Beacons does. It supports more providers but has security risk (creator could paste malicious iframe).
- **Opcje:**
  1. oEmbed-only, 12 providers, no iframe paste in MVP. (recommended)
  2. oEmbed + iframe-paste fallback gated to specific allowed iframe sources.
  3. Iframe-paste only on top tier (paid plan).
- **Twoja rekomendacja:** **1.** Iframe paste is a security regression we don't need to take in MVP. The 12 providers cover ~95% of demand and we can always add iframe-paste in v2 once we have proper origin isolation.

### DEC-EMBED-02 — initial whitelist of 12 providers — confirm?

- **Czego dotyczy:** which 12 providers ship in MVP.
- **Szczegolowy opis:** §5.2 lists Spotify, SoundCloud, Bandcamp, Apple Podcasts, Apple Music, YouTube, Vimeo, TikTok, Twitter/X, Bluesky, Instagram, Loom. Removing or substituting providers changes the engineering scope (each provider ≈ 2 hours).
- **Opcje:**
  1. Ship the named 12 as listed.
  2. Drop Apple Music + Apple Podcasts (lower demand for early adopters per `competitors-user-segments.md`); add Calendly + Tally instead.
  3. Drop YouTube and Vimeo from Embedded since they're already in Video block; ship 10 instead.
- **Twoja rekomendacja:** **1.** The named 12 hit every creator segment in our research. YouTube/Vimeo overlap with Video is fine — let them coexist; smart-paste will route correctly. Apple Music + Apple Podcasts matter more than Calendly for a creator-page MVP (forms/booking are v1.5).

### DEC-EMBED-03 — Iframely vendor or roll-your-own?

- **Czego dotyczy:** for the per-provider parsing work, do we use Iframely (paid SaaS, 1900+ providers) or write resolvers ourselves?
- **Szczegolowy opis:** Iframely is the standard third-party oEmbed proxy. Their cloud API costs $79-$399/mo and supports 1900+ providers out of the box. Self-host is ~$30/mo on AWS. Roll-your-own is ~24 hours engineering for 12 providers + ~2 hours per future provider.
- **Opcje:**
  1. Roll our own, 12 providers, ~24 hours engineering. (recommended for MVP)
  2. Use Iframely Cloud Pro ($79/mo) immediately — get 1900+ providers, near-zero engineering.
  3. Self-host Iframely on AWS (~$30/mo + ~1 day setup).
- **Twoja rekomendacja:** **1.** Roll our own for MVP. The 12-provider scope is bounded and the resolver code is straightforward. We avoid a vendor dependency on a critical-path feature, and we keep iframe `src` construction inside our own code (security win — see §8.5). Re-evaluate when whitelist exceeds 30 providers or engineering can't keep up with creator demand.

### DEC-EMBED-04 — per-tier gating?

- **Czego dotyczy:** is the Embedded block free / tier-gated?
- **Szczegolowy opis:** tadaify has Free / Pro / Business tiers (per pricing research). Some features are gated (e.g. custom domain, analytics depth). Embedded block has zero tadaify-side cost (per §9), so no real-cost basis to gate it. But Linktree / Beacons gate "advanced embeds" to paid tiers as a perceived-value lever.
- **Opcje:**
  1. Free tier — Embedded block available with all 12 providers. (recommended)
  2. Free tier — only 4 providers (YouTube + Spotify + Twitter + Instagram); paid tier — all 12.
  3. Free tier — no Embedded block at all; paid-only.
- **Twoja rekomendacja:** **1.** Per `feedback_no_fake_margin_tier_gating.md`, we don't gate on fake costs. Embedded is free across all tiers. We can still differentiate paid tiers on real-cost levers (custom domain, multi-page, analytics retention).

### DEC-EMBED-05 — block-level only, or "embed entire page" mode?

- **Czego dotyczy:** is Embedded a block within a tadaify page, or also a way to make an entire page = an embed (e.g. "this page IS my Substack subscribe form fullscreen")?
- **Szczegolowy opis:** some creators want a single-purpose page that is just a Calendly widget fullscreen. We could either (a) keep Embedded as a block (creator builds a page with one Embedded block + maybe a header), or (b) add a "Page type: Embed" mode that makes the entire `/<handle>/<slug>` page render the iframe with no chrome.
- **Opcje:**
  1. Block-level only. Page type stays normal; creator can build a 1-block page if they want a single embed. (recommended)
  2. Add "Embed page type" as a new template. ~1 extra day of engineering.
  3. Defer entire-page-embed to v2 based on real demand signal.
- **Twoja rekomendacja:** **1.** Same outcome as 3 (no entire-page mode in MVP) but cleaner — we don't promise a future feature, we just leave the door open. If a creator complains, they can build a one-block page in 30 seconds.

---

## Sources

- [oEmbed.com — official spec](https://oembed.com/)
- [oEmbed providers registry](https://oembed.com/providers.json) — 378 registered providers
- [iamcal/oembed GitHub repo](https://github.com/iamcal/oembed) — registry source-of-truth
- [Spotify oEmbed reference](https://developer.spotify.com/documentation/embeds/reference/oembed)
- [Spotify Embeds documentation](https://developer.spotify.com/documentation/embeds)
- [Beacons.ai — Music Block (Bandcamp, YouTube Music, Spotify, SoundCloud)](https://help.beacons.ai/en/articles/4696705)
- [Beacons.ai — Video Block (YouTube, Vimeo, TikTok)](https://help.beacons.ai/en/articles/4696641)
- [Beacons.ai — Find Music Embed URLs](https://help.beacons.ai/en/articles/4696833)
- [Carrd — Embedding IFRAMEs](https://carrd.co/docs/building/embedding-iframes)
- [Carrd — Embedding Custom Code](https://carrd.co/docs/building/embedding-custom-code)
- [Stan Store — URL/Media product](https://help.stan.store/article/18-external-link-url-product)
- [Linktree alternatives 2026 (taap.bio)](https://taap.bio/blog/best-linktree-alternatives)
- [Bento.me shutdown — popout.page summary](https://www.popout.page/blog/bento-alternatives)
- [Iframely — Provider docs](https://iframely.com/docs/providers)
- [Iframely — itteco/iframely PROVIDERS.md](https://github.com/itteco/iframely/blob/main/docs/PROVIDERS.md)
- [Iframely — Spotify domain](https://iframely.com/domains/spotify)
- [Notion — Embeds, bookmarks & link mentions](https://www.notion.com/help/embed-and-connect-other-apps)
- [MDN — `<iframe>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe)
- [web.dev — Play safely in sandboxed IFrames](https://web.dev/articles/sandboxed-iframes)
- [MDN — Content-Security-Policy: sandbox directive](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Security-Policy/sandbox)
- [Mozilla bug 1888695 — CVE-2024-5691 iframe sandbox bypass via clickjacking on XFO error page](https://bugzilla.mozilla.org/show_bug.cgi?id=1888695)
- [Bypassing X-Frame-Options — Requestly blog](https://requestly.com/blog/bypass-iframe-busting-header/)
- [Pragmatic Web Security — Restrict framing in the browser](https://pragmaticwebsecurity.com/articles/securitypolicies/preventing-framing-with-policies.html)
- [TikTok — Embedding TikTok Videos](https://developers.tiktok.com/doc/embed-videos/)
- [Loom — oEmbed endpoint](https://www.loom.com/v1/oembed)
- [Apple Podcasts — oEmbed endpoint](https://podcasts.apple.com/api/oembed)
- [Bluesky — oEmbed endpoint](https://embed.bsky.app/oembed)
