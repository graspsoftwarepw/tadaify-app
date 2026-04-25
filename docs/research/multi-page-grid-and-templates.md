---
type: research
project: tadaify
title: Multi-page accounts, grid layouts, and API-driven templates — feasibility + recommendation
created_at: 2026-04-25
author: orchestrator-opus-4.7
status: draft-for-review
---

# Multi-page accounts, grid layouts, and API-driven templates

> SPIKE deliverable for the user's open question: *"Should tadaify support multi-page accounts, grid layouts, and 'add page as Instagram/YouTube wall' templates?"*

## Executive summary

Three distinct ideas were evaluated. One is a clean win, one is a Pro-tier post-MVP lever, and one is a trap dressed up as a feature.

| Idea | Verdict | Reasoning (one line) |
|------|---------|----------------------|
| **A — Multi-page accounts** | 🟡 **Post-MVP, ship in Q+1 as Creator-tier differentiator** | Genuine differentiator vs Linktree (1 page, every tier); cheap to ship; conflicts with "single-page link-in-bio" brand if forced into MVP. |
| **B — Grid / panel layouts (bento)** | 🟡 **Pro-tier post-MVP, Q+2** | Editor complexity is 6–10× a stack editor; mobile collapse trivializes the visual payoff for ~70% of viewers; ship stack-only for MVP, grid as a Pro upsell once we have telemetry. |
| **C — API-driven page templates (IG/YouTube wall)** | ❌ **Reject for MVP and most of post-MVP roadmap** | Instagram Graph API requires Meta Business app review (4–8 weeks) and Business/Creator IG accounts only; Basic Display deprecated Dec 2024; rate limits + token rotation = real ops cost. YouTube/Spotify/Twitch are feasible individually but the *page-template* abstraction overweights an effort that returns a single-block-equivalent UX. Ship as **F-PRO-OAUTH-IMPORT block** (already deferred), not as a page template. |

**Strategic synthesis:** A and B reinforce each other (multi-page is much more valuable when each page can be visually distinct). C is orthogonal and should be decoupled — it's a *block* feature, not a *page* feature. Adopting all three at MVP turns tadaify into a Webflow-lite, breaking the "simple link-in-bio that respects creators" promise.

---

## Idea A — Multi-page accounts

### A.1 Competitive landscape

| Competitor | Multi-page support | Limit | Tier | Model |
|------------|-------------------|-------|------|-------|
| **Linktree** | ❌ No | 1 page total | All (Free → Premium) | Strict single-page; everything is one scroll |
| **Beacons** | ✅ Yes | 1 / 1 / 3 / 10 pages | Free / Creator / Plus / Max | "Website Builder" mode is multi-page; link-in-bio mode is single |
| **Stan Store** | ❌ No | 1 page (single store) | All tiers | Each *product* gets its own `/p/<slug>` URL but pages aren't user-creatable |
| **Carrd** | 🟡 Multi-*site* | 3 / 3 / 10 / 25 sites | Free / Lite / Standard / Plus | Each site = a separate URL, not nav-linked sub-pages of one profile |
| **Bio.link** | 🟡 Has "Landing page builder" | Unclear — appears unlimited on Pro | Pro | Separate landing pages, weak interconnection |
| **Taplink** | ✅ Yes — "Internal pages" | Unlimited on Business | Business ($12/yr) | Multi-page is the marquee Business-tier feature |
| **Campsite.bio** | ✅ Yes — "Multiple profiles" | Pro+ | Pro+ | Multiple profiles per account |
| **Milkshake** | ❌ No (cards only) | — | All | Card-based, single screen |
| **Later (link.in.bio)** | ❌ No | — | All | Single page tied to Instagram |

Sources:
- `competitors/linktree/templates-themes.md` ("single-page only; Linktree is a single-page builder")
- `competitors/beacons/templates-themes.md:62-64` (Multiple pages: 1/1/3/10 by tier)
- `competitors/beacons/pricing.md:55-60` (Creator Max = 10 websites × 10 pages each)
- `competitors/taplink/notes.md:113` (Business tier = "Internal pages (multi-page)")
- `competitors/carrd/help-docs.md:70-73` (multi-*site*, not multi-page)
- `competitors/stan-store/notes.md:47` ("No multi-page")
- `competitors/campsite-bio/templates-themes.md:47` (Multiple pages / profiles, Pro+)

**Adjacent tools (1-line each):**
- **Notion sites** — multi-page wiki by default; different category (CMS/notes-as-site).
- **Webflow / Squarespace / Wix** — full website builders; different category, 100× the complexity.
- **Bento.me / about.me** — single-page bio only; same category as us.
- **Snipfeed, Hopp** — single-page, no multi-page support documented.

**Read:** Multi-page is the **Taplink Business** and **Beacons Creator-Max** marquee feature. Linktree explicitly does *not* offer it on any tier — meaning a tadaify that ships multi-page on Creator beats Linktree at every paid level on this single dimension. Carrd's multi-*site* model is the wrong abstraction for us (creators don't want disconnected sites; they want sub-pages of one profile).

### A.2 User mental model

The user-proposed mental model:

```
tadaify.com/<handle>           — Home (default page, can't delete)
tadaify.com/<handle>/privacy   — Sub-page
tadaify.com/<handle>/about     — Sub-page
tadaify.com/<handle>/portfolio — Sub-page
tadaify.com/<handle>/links-archive
```

This works. It maps cleanly to creator intent:
- **Privacy / ToS / Imprint** — most creators need these for ad platforms (Meta Ads, Google Ads require a privacy URL); today they paste a Notion link, which looks unprofessional. **Real demand.**
- **About / Bio long-form** — for people who want richer storytelling than the 200-char hero text.
- **Portfolio** — visual freelancers (designers, photographers).
- **Links archive** — the "old links I'm not featuring anymore but want kept" page.
- **Workshop landing**, **Newsletter signup landing**, **Affiliate disclosure** — specific use-cases where one creator might want a dedicated URL to share.

**Concern (mild):** The mental model breaks the "link-in-bio = ONE page you put in your IG bio" promise. Creators don't put 5 URLs in IG bio — they put one. So sub-pages are *secondary* surfaces accessed via:
1. Nav menu on the home page (creator decides if visible).
2. Direct sharing (`tadaify.com/anna/workshop` shared in a story or email).
3. Search engines (sub-pages can be SEO-targeted).

This is *consistent with how Beacons positions multi-page* — the home page stays the link-in-bio, sub-pages are utility/landing surfaces.

### A.3 Architectural implications

**Schema (new):**

```sql
CREATE TABLE pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,                -- '' for homepage, 'privacy', 'about'
  title TEXT NOT NULL,
  description TEXT,                  -- SEO meta description
  is_homepage BOOLEAN NOT NULL DEFAULT FALSE,
  layout_mode TEXT NOT NULL DEFAULT 'stack',  -- 'stack' | 'grid' (Idea B)
  theme_override JSONB,              -- per-page theme overrides; NULL = inherit account theme
  position INT NOT NULL DEFAULT 0,   -- order in nav menu
  is_visible_in_nav BOOLEAN NOT NULL DEFAULT TRUE,
  is_published BOOLEAN NOT NULL DEFAULT TRUE,
  noindex BOOLEAN NOT NULL DEFAULT FALSE,  -- for privacy/utility pages
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, slug),
  CHECK (is_homepage = FALSE OR slug = '')
);

CREATE UNIQUE INDEX one_homepage_per_user ON pages (user_id) WHERE is_homepage = TRUE;
```

**Migration of existing data:**

```sql
-- For each existing user, create a homepage row
INSERT INTO pages (user_id, slug, title, is_homepage, position)
SELECT id, '', display_name, TRUE, 0 FROM auth.users;

-- Add page_id FK to blocks
ALTER TABLE blocks ADD COLUMN page_id UUID REFERENCES pages(id) ON DELETE CASCADE;

-- Backfill: every existing block points to the user's homepage
UPDATE blocks b SET page_id = p.id
FROM pages p WHERE p.user_id = b.user_id AND p.is_homepage = TRUE;

ALTER TABLE blocks ALTER COLUMN page_id SET NOT NULL;
```

Reversible via `ALTER TABLE blocks DROP COLUMN page_id` + `DROP TABLE pages` — clean rollback.

**URL routing:**
- `tadaify.com/<handle>` → SSR page where `is_homepage = TRUE`
- `tadaify.com/<handle>/<slug>` → SSR page lookup by `(user_id, slug)`
- 404 if slug doesn't exist
- Per-page `<title>` and `<meta name="description">` from `pages.title` / `pages.description`
- Per-page `noindex` honoured in the SSR `<head>`

**Editor changes:**
- New route `/app/pages` — list of pages, "+ Add page" button, drag-reorder.
- Each page row: title, slug (editable), visible-in-nav toggle, published toggle, "Edit blocks" → existing block editor scoped to `page_id`.
- Existing block editor gains a page-context header: `<handle> / <page-title>` breadcrumb + page switcher dropdown.
- Sidebar gains a **Pages** section (matches user request).

**Tier limits enforcement:**
- Soft cap at create-page mutation in Edge Function (`pages-create`):
  ```
  if (countByUser >= TIER_LIMIT[user.tier]) return 403 with upgrade prompt
  ```
- Frontend disables the "+ Add page" button + shows inline "Upgrade to Creator for 10 pages" CTA.
- No hard server cap beyond tier limit (defence in depth).

**SEO per page:**
- Each page can have its own meta tags, OG image (uploaded once, shared across pages by default with override).
- `noindex` flag for utility pages (privacy, ToS).
- Sitemap.xml regenerated to include all `is_published = TRUE AND noindex = FALSE` pages.

**Cost:**
- 1 new table, 1 schema migration on `blocks`, 1 SSR route variation, 1 editor list view, 1 sidebar section.
- Estimate: **3–5 days of implementation** for one Sonnet implementer; another 1–2 days for Playwright + unit tests.
- Storage cost: trivial. No new infra.

### A.4 Tier limits — proposal vs sanity check

User proposed: **Free 3 / Creator 10 / Pro 30 / Business unlimited.**

Sanity check against competitors:

| Tier | User proposed | Linktree | Beacons | Taplink | Carrd |
|------|---------------|----------|---------|---------|-------|
| Free | 3 | 1 | 1 | 1 | 3 sites |
| Mid | 10 | 1 | 3 | unlimited | 10 sites |
| Top | 30 | 1 | 10 | unlimited | 25 sites |

**Issues with user's proposal:**

1. **3 on Free is too generous.** Multi-page is the highest-perceived-value feature in this matrix. Giving 3 pages on Free undercuts the upgrade pressure to Creator and gives away Beacons-Creator-Max parity at $0. Recommended: **Free = 1 page (homepage only).** Multi-page becomes a clear, single-axis differentiator at Creator tier.

2. **Pro 30 is overkill.** The 80th-percentile user case for sub-pages is 4-6 (privacy, about, portfolio, archive, 1-2 campaign landings). 30 is engineering-budget waste. Recommended: **Pro = 15 pages.**

3. **Creator 10 is right.** Matches Beacons Creator-Max parity at our Creator price point — this is the "we beat Beacons one-tier-down" differentiation.

**Recommended ladder:**

| Tier | Pages | Rationale |
|------|-------|-----------|
| Free | **1** | Homepage only — keeps multi-page as a clear paid lever |
| Creator | **10** | Beats Beacons Creator-Max (10 pages but only on $300/yr top tier) at Creator price |
| Pro | **15** | Power users; covers every realistic creator use-case |
| Business | unlimited | Agencies / multi-brand operators |

If you genuinely want a Free-tier teaser, the moderate compromise is **Free = 2** (homepage + 1 utility page like privacy). But we'd encode "Free = 1, Creator unlocks multi-page" as a marketing message — it's clearer.

### A.5 Verdict & rationale

🟡 **Post-MVP, Q+1, Creator-tier unlock.**

Reasoning:

- **Pro:** Genuine differentiator vs the Linktree-shaped competition. Strong Creator-tier upgrade lever. Cheap to ship (3-5 days). Solves a real ad-platform problem (privacy URL) that creators currently solve with embarrassing Notion links. Carrd has 264+ templates and a 10-year head start; Linktree has 70M users; Beacons has IG-DM automation. Multi-page is one of the few axes where we can credibly *beat* Linktree (because they explicitly *don't* ship it).
- **Con:** Adopting at MVP risks scope creep into "page builder" territory and obscures the link-in-bio core promise during the initial pitch. Better to ship MVP single-page, get to first paying customers, then unlock multi-page as the Q+1 "now you can do more with tadaify" beat.
- **Brand fit:** `Free = 1 page` keeps the "every feature free" promise honest *for the link-in-bio core*. Multi-page is positioned as the **website utility layer**, not as a core link-in-bio feature — semantically different, defensible.

Implementation order if accepted: schema → migration → editor list view → SSR routing → sidebar nav → tier-limit enforcement → SEO per page → Playwright tests → documentation.

---

## Idea B — Grid / panel layouts (bento-style)

### B.1 Competitive landscape

| Competitor | Grid / 2D layout | Stack-only | Mobile collapse |
|------------|------------------|------------|-----------------|
| **Linktree** | ❌ Stack only | ✅ | n/a |
| **Beacons** | 🟡 "Drag-and-drop" but blocks still stack vertically; some templates have 2-col rows | partial | yes |
| **Stan Store** | ❌ Single column | ✅ | n/a |
| **Carrd** | ✅ Container-nested layout (Pro Plus) | ✗ | yes — manual breakpoint config |
| **Bio.link** | ❌ Stack | ✅ | n/a |
| **Taplink** | ❌ Stack with row variants | ✅ | n/a |
| **Bento.me** | ✅ Bento grid (entire UX) | ✗ | yes — auto |

Sources:
- `competitors/beacons/templates-themes.md:43` ("Mobile-optimised drag-and-drop template builder")
- `competitors/carrd/notes.md:36-37` ("Block-based editor with container nesting")
- Bento.me name = bento grid; that's the entire product positioning.

**Read:** Only **Carrd Pro Plus** (designer power-user tier) and **Bento.me** ship real 2D grid editors. Linktree, Stan, Beacons, Taplink, Bio.link all stack vertically. The category default is *stack*. Bento exists as a niche, but it is the niche — it has not displaced Linktree.

### B.2 User mental model

User-described example: *"1 left + 2 right, columns/rows, drag-drop blocks into cells."*

This is the bento.me / Carrd mental model. Pros and cons from creator perspective:

**Pros:**
- Visual differentiation — pages don't feel like Linktree clones.
- Better information density on desktop (less scrolling).
- Aesthetic appeal for creators who care about brand presentation (designers, photographers, agencies).

**Cons:**
- **Mobile collapses everything.** ~70% of link-in-bio traffic is mobile (Linktree's own data says ~85%+). On phone, the bento grid stacks anyway → identical UX to a stack layout for the majority of viewers. The visual payoff is only present on desktop.
- **Editor complexity multiplies.** Drag-onto-cell is fundamentally different from drag-to-reorder. We'd need:
  - Cell selection state
  - Span controls (col-span, row-span)
  - Empty-cell affordance
  - Mobile-preview-vs-desktop-preview toggle
  - Constraints (you can't put a 6-tall block in a 2-tall cell)
  - Undo for spatial moves (harder than for stack swaps)
- **Onboarding cliff.** Stack editor: "drag this up, drag this down." Grid editor: "pick a cell, pick a span, pick a position, see how it looks on mobile." This is the **opposite direction** from the user's stated brand promise (*"the simple link-in-bio"*).
- **Mobile-first design pressure.** If grid only matters on desktop, we'd need a separate "mobile order" override per page (so the creator can re-rank blocks for mobile-stacked view). That's another editor surface, another data field, another set of bugs.

### B.3 Architectural implications

**Schema option 1 — JSON on blocks:**
```sql
ALTER TABLE blocks ADD COLUMN layout_position JSONB;
-- shape: { col: 0, row: 0, span_cols: 1, span_rows: 1 }
-- NULL on stack-mode pages
```

**Schema option 2 — separate placements table:**
```sql
CREATE TABLE block_placements (
  block_id UUID PRIMARY KEY REFERENCES blocks(id) ON DELETE CASCADE,
  page_id UUID NOT NULL REFERENCES pages(id) ON DELETE CASCADE,
  col INT NOT NULL,
  row INT NOT NULL,
  span_cols INT NOT NULL DEFAULT 1,
  span_rows INT NOT NULL DEFAULT 1,
  mobile_order INT  -- override stack order on mobile
);
```

Option 2 is cleaner if grid mode is per-page (one user can have stack + grid pages mixed). Per-page `pages.layout_mode = 'stack' | 'grid'` (already in Idea A schema).

**Rendering:**
- CSS Grid with `grid-template-columns: repeat(12, 1fr); grid-template-rows: auto;` and auto-flow.
- Mobile breakpoint (< 640px): collapse to 1 column, ordered by `mobile_order` or by `(row, col)`.

**Editor:**
- **Time estimate: 6–10× the stack editor.** Drag-drop spatial move + span resize + cell preview + per-block mobile-order picker + collision handling.
- React-grid-layout or @dnd-kit + custom overlays. Both have known sharp edges (touch support, accessibility, mobile preview iframes).
- Realistic build: **2-3 weeks** for a senior implementer to ship a polished grid editor with proper undo/redo and mobile preview. Compare to multi-page (3-5 days).

**Cost vs stack:**
- 10× implementation time.
- 5× test surface (new combos: empty cell, overlapping blocks, span overflow, mobile-reorder, theme interaction with cell backgrounds).
- 2× documentation (grid mode quickstart, span semantics, when-to-use-stack-vs-grid).

### B.4 Verdict & rationale

🟡 **Pro-tier post-MVP, Q+2 at earliest. Not at MVP.**

Reasoning:

- **The visual payoff lives on desktop.** Mobile traffic dominates link-in-bio. Spending 2-3 weeks building a grid editor that affects the *minority* of viewers is questionable ROI vs other features (e.g. analytics, more block types, IG-DM automation).
- **It conflicts with the brand promise.** "Simple link-in-bio that respects creators" → the editor experience cliff between stack and grid is real. Carrd is the design-power-user reference and has a small audience for that exact reason. Linktree at 70M users does *not* have a grid editor — there's a reason.
- **Telemetry-justified later.** Once we have Pro-tier creators paying us monthly and they ask for grid via the suggestion/feedback channel (and they will, in some volume — it's an obvious idea), we'll have:
  - A clear paying-customer demand signal
  - A clear segment (Pro-tier designers/photographers/agencies)
  - A justified reason to invest 2-3 weeks
- **MVP alternative:** Ship `pages.layout_mode = 'stack'` as the only enum option. Reserve `'grid'` as a future migration. This is a 1-line change with zero cost.

If we accept multi-page (Idea A) and Pro-grid (Idea B post-MVP), the natural sequencing is:

```
MVP            : single-page, stack-only (existing)
Q+1            : multi-page (stack-only on every page)
Q+2 (Pro lever): grid layout per page (Pro tier unlock)
```

This staircase gives us 3 distinct upgrade beats over 2 quarters without scope-bombing the MVP.

---

## Idea C — API-driven page templates (IG/YouTube wall)

### C.1 API feasibility matrix

State of platform APIs as of 2026-04 (cross-checked against published rate limits, deprecation notices, and OAuth complexity):

| Platform | API | Auth | Rate limit | Refresh viability | App-review | Cost | Verdict |
|----------|-----|------|------------|-------------------|------------|------|---------|
| **Instagram** | Graph API (Business/Creator only) | OAuth via Meta App + IG → FB Page link | 200 calls/h/user | Daily refresh: feasible. Live feed: not at scale | **4-8 weeks Meta App Review** required | $0 API; ~80h dev for OAuth + review + maintenance | ❌ **Hard — high ops burden** |
| **Instagram (personal)** | Basic Display API | OAuth | n/a | n/a | n/a | n/a | ⛔ **Deprecated 2024-12** |
| **YouTube** | Data API v3 | OAuth or API key | 10k quota/day (∼100 channels at 1 refresh/day) | Daily: feasible | None — Google Cloud project + verified OAuth screen | $0 below quota | ✅ **Feasible** |
| **TikTok** | Display API | OAuth | Restrictive — videos endpoint, scoped | Daily: feasible-ish | App approval required (slow) | $0 | 🟡 **Medium — ops headache** |
| **Twitch** | Helix API | OAuth (user tokens) | 800 points/min/user | Live "is streaming?" check: easy | App registration in Twitch Dev Console; no formal review | $0 | ✅ **Feasible** |
| **Spotify** | Web API | OAuth (user tokens) | Reasonable | Daily top-tracks: easy | App registration; no review | $0 | ✅ **Feasible** |
| **X (Twitter)** | API v2 | Bearer/OAuth 2.0 | $100/mo Basic minimum, $5k/mo for production-grade | Daily latest-tweets: theoretically feasible at $100/mo | None | **$100/mo per Tadaify org** OR pass cost to creator | ❌ **Hard — paid API tier** |
| **LinkedIn** | API (Profile, Posts) | OAuth, partner program | Restrictive | n/a | Partner program required (slow, opaque) | $0 but gated | ❌ **Hard — partner gating** |
| **Pinterest** | API | OAuth | Reasonable | Daily refresh: feasible | None | $0 | ✅ **Feasible** |
| **SoundCloud** | API | OAuth | n/a — registrations frozen since 2023 | n/a | n/a | n/a | ⛔ **Blocked — registrations frozen** |
| **Threads** | API (just launched) | OAuth | TBD | Limited per-user posts endpoint | Meta App Review (likely) | $0 | 🟡 **Feasible-ish, immature** |
| **Bluesky** | atproto | App passwords / OAuth | Generous | Daily: trivial | None | $0 | ✅ **Feasible (small audience)** |

### C.2 Cost analysis

**Per-platform OAuth + sync infrastructure per Tadaify org:**

For *each* platform we ship as a "page template" we need:
1. Developer app/project registration (1× per platform per environment)
2. OAuth callback Edge Function
3. Encrypted token storage (with refresh-token rotation)
4. Refresh scheduler (Cron Trigger / pg_cron / Edge Function on schedule)
5. Cache table (`external_content_cache` keyed by user × platform × resource)
6. Render adapter (turn cached JSON → tadaify block representation)
7. Error handling: token expired, rate-limit hit, account disconnected, content deleted upstream
8. Privacy notice (GDPR Art. 13: we're processing data on creator's behalf)
9. Admin/support runbook for "my Instagram disconnected" incidents
10. Ongoing platform-API-deprecation babysitting (Meta breaks Graph API every 12-18 months)

**Realistic effort per platform:** **2-3 weeks for first integration, 1-1.5 weeks per subsequent integration** assuming the OAuth pattern is reused. This is not a "few days" feature.

**Ongoing maintenance cost:** ~10% of engineering time per quarter to handle deprecations, token-rotation failures, support tickets ("Instagram showing wrong photos"). Compounds with every additional platform.

### C.3 The page-template framing is wrong

The user's framing: *"add page as Instagram wall template — shows latest IG photos."*

**Problem with framing:** A page template (= preset of grid + blocks) is a *layout* abstraction. Instagram wall is a *content* abstraction. Conflating them creates two bad outcomes:

1. **The "Instagram page" is mostly empty.** A page that is *only* IG photos is a 1-block page. Why need a separate page just to host one block? (Counter: because it's a different URL — but we're spending a quarter of engineering effort to deliver "one block on its own page".)
2. **The block can be on any page already.** If we ship the IG-feed *as a block*, the creator can put it on their homepage, their /portfolio page, anywhere. That's strictly more flexible than a page template.

**Better abstraction:**
- Ship `IG_FEED_BLOCK`, `YOUTUBE_LATEST_BLOCK`, `TWITCH_LIVE_BLOCK`, `SPOTIFY_TOP_BLOCK` as **block types**, not as page templates.
- Creator drags block onto any page; block displays connected platform's content.
- "Add a page using IG block" = an empty page with one IG block dragged in. That's a 1-click button without inventing a "page template" abstraction.

This is also how Beacons does it — *Integration Block* with embedded Ko-fi/Split commerce panels (per `competitors/beacons/templates-themes.md:90-91`). Block-level, not page-level.

### C.4 Architectural implications (if shipped — block, not page)

**New schema:**

```sql
CREATE TABLE platform_connections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,                       -- 'youtube', 'spotify', 'twitch', 'instagram'
  external_account_id TEXT NOT NULL,
  access_token_encrypted TEXT NOT NULL,         -- pgsodium / pgcrypto
  refresh_token_encrypted TEXT,
  token_expires_at TIMESTAMPTZ,
  scope TEXT[],
  connected_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_sync_at TIMESTAMPTZ,
  last_error TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  UNIQUE (user_id, platform)
);

CREATE TABLE external_content_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT NOT NULL,
  resource_type TEXT NOT NULL,                  -- 'feed', 'top_tracks', 'live_status'
  payload JSONB NOT NULL,
  fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL,
  UNIQUE (user_id, platform, resource_type)
);
```

**Refresh scheduler:**
- pg_cron runs every hour, processes connections where `expires_at < now()`.
- Daily refresh window (3am UTC + jitter) per platform to avoid hot-cache misses at primetime.
- Failure path: increment retry counter, after 3 failures mark `is_active = FALSE` and email creator.

**Block render:**
- SSR fetches `external_content_cache.payload` for the block's `(user_id, platform, resource_type)`.
- Falls back to "Connect your {Platform}" call-to-action if no row.
- Stale cache (>48h old) shows "Last synced X hours ago" footer in editor mode (hidden in viewer).

### C.5 Verdict & rationale

❌ **Reject for MVP. Reject for Q+1. Reconsider as F-PRO-OAUTH-IMPORT (already deferred) for Q+2 or later.**

Reasoning:

1. **Instagram is the headline use-case and Instagram is the hardest API.** Meta App Review is 4-8 weeks of opaque back-and-forth, and only Business/Creator IG accounts can connect. Personal IG accounts (the majority of casual creators) cannot use this. Basic Display API was deprecated 2024-12 — there is no "easy mode" anymore.
2. **Maintenance cost compounds.** Each platform integration is a permanent ongoing operational burden. We're a small team. Beacons maintains many integrations and that's a moat *and* a tax.
3. **Page-template framing is wrong** (see C.3). The right abstraction is **block type**, not **page template**.
4. **Even as a block, it's a Pro-tier feature at best.** F-PRO-OAUTH-IMPORT is already on the deferred roadmap (per existing tadaify research). It belongs there.
5. **MVP-friendly alternative** — ship a *static* "Instagram-style grid block" where creator manually uploads 9 images with optional caption + link-out. Visually identical to an IG wall. Zero OAuth, zero maintenance, zero rate limits. Creator loses live-sync — most creators won't notice; the ones who do are post-MVP segments.

If we end up shipping any platform integration first, the order is:

1. **YouTube** (easiest API, broad creator appeal).
2. **Spotify** (musicians segment).
3. **Twitch** (live-streamers segment, smaller but underserved).
4. **Instagram** (only when we're willing to pay the App Review tax).

Skip TikTok, X, LinkedIn, SoundCloud entirely until they fix their developer story.

---

## Synthesis: how the three ideas interact

**A and B reinforce each other.** Multi-page is more valuable when each page can look distinct (grid, theme override, hero variants). Without multi-page, a per-page grid is just "the homepage looks bento now" — limited differentiation. With multi-page, grid lets creators design a portfolio page differently from a privacy page differently from a workshop landing.

**C is orthogonal.** It's a block-level feature, not a page-level feature. Adopting A and rejecting C is consistent. Adopting C without A is a coherent (different) direction. Adopting all three at once = becoming Webflow Lite.

**Brand-promise check:**
- "Simple link-in-bio that respects creators" + multi-page = ✅ ("respects creators by giving them sub-pages they actually need for ad platforms").
- "Simple link-in-bio that respects creators" + grid editor = 🟡 (grid is *not* simple; adding to MVP would dilute the simple promise).
- "Simple link-in-bio that respects creators" + IG wall via OAuth = 🟡 (the OAuth dance is *not* simple from the creator's viewpoint either; IG is in fact the *least* simple of all the integrations because it requires a Business account migration).

**Recommended phasing:**

```
MVP                        : single-page, stack, no integrations (existing scope)
Q+1                        : Multi-page (Idea A)  ← Creator-tier unlock
Q+2 (post-PMF telemetry)   : Static IG-grid block (no OAuth) + YouTube-via-OAuth block
Q+3+                       : Grid layout (Idea B, Pro tier) + Spotify/Twitch blocks
later, only if signal      : Instagram OAuth (after Meta App Review investment)
```

**Anti-recommendation:** *Do not* try to ship A+B+C together as a "page builder release". That's a 3-month feature lump that ships late, breaks brand simplicity, and gives Linktree time to copy.

---

## Pending DECs

The user must answer all three before any of these ideas enters the implementation queue. Use the table format v2 (per CLAUDE.md global instructions).

### DEC-MULTIPAGE-01 — Multi-page accounts in the roadmap

- **Czego dotyczy:** Multi-page accounts (Idea A — sub-pages like /privacy, /about, /portfolio under each handle).
- **Szczegolowy opis:** Today every tadaify account is a single page (`/<handle>`). The feature would let creators add sub-pages with their own slug, blocks, theme overrides, and SEO metadata. This is a genuine differentiator vs Linktree (which has zero multi-page support on any tier) and matches Beacons Creator-Max parity. Cheap to ship (3-5 days). The decision is not "if" but "when": MVP, Q+1, or never.
- **Opcje:**
  1. Adopt for MVP — ship in current sprint, included in launch scope.
  2. Adopt for Q+1 — keep MVP single-page; ship multi-page as the first post-launch feature, gated to Creator+ tier.
  3. Reject — stay single-page indefinitely, double down on Linktree's positioning.
- **Twoja rekomendacja:** Option **2 (Q+1)**. Genuine differentiator and cheap to build, but adopting at MVP risks scope creep into "page builder" territory and obscures the link-in-bio core promise during launch. Q+1 gives us a clean post-launch beat ("now you can do more with tadaify"). Tier ladder: Free 1 page / Creator 10 / Pro 15 / Business unlimited (the user's proposal of Free 3 / Creator 10 / Pro 30 leaks too much value to Free and over-engineers Pro).

### DEC-LAYOUT-01 — Grid / panel layouts

- **Czego dotyczy:** Grid layouts (Idea B — bento-style 2D layout of blocks instead of single-column stack).
- **Szczegolowy opis:** Grid editor would allow creators to place blocks in cells (e.g. "1 left + 2 right"), with col/row spans and mobile auto-collapse. Editor complexity is 6-10× the current stack editor. Mobile collapses everything to single column anyway, so the visual payoff lives only on desktop while ~70-85% of link-in-bio traffic is mobile. Bento.me is the only major competitor that ships this as a default; Carrd ships it on the Pro Plus tier ($49/yr, designer audience).
- **Opcje:**
  1. Adopt for MVP — ship grid editor in launch scope.
  2. Pro-tier post-MVP (Q+2 at earliest) — ship after we have telemetry signal from paying creators that they want it.
  3. Reject — stay stack-only forever, position simplicity as the moat.
- **Twoja rekomendacja:** Option **2 (Pro-tier post-MVP, Q+2)**. The mobile-collapse problem makes grid a desktop-only delight, which doesn't justify 2-3 weeks of editor work pre-revenue. Pro-tier creators (designers, photographers, agencies) will ask for it post-launch — that's our justification signal. Reserve `pages.layout_mode = 'grid'` as a future enum value when shipping Idea A schema (1-line cost) so the migration path is clean.

### DEC-APIPAGES-01 — API-driven page templates (IG / YouTube / Spotify wall)

- **Czego dotyczy:** API-driven content templates (Idea C — page templates that auto-pull live content via OAuth: IG photos, YouTube videos, Twitch live status, Spotify top tracks).
- **Szczegolowy opis:** Three combined problems: (1) Instagram Graph API requires 4-8 weeks of Meta App Review and only works with Business/Creator IG accounts (Basic Display deprecated 2024-12); (2) the page-template framing is the wrong abstraction — these are *block-level* features, not *page-level* features (a "page" with one IG block on it is just one block on its own URL); (3) maintenance cost compounds — each new platform integration is a permanent ongoing tax (token rotation, deprecation babysitting, support tickets). The closest sane shipping path is the already-deferred F-PRO-OAUTH-IMPORT block.
- **Opcje:**
  1. Static "IG-style grid" block only — creator manually uploads 9 images, no OAuth, no live sync. Ship in MVP or Q+1.
  2. Pro-tier OAuth block (existing F-PRO-OAUTH-IMPORT, already deferred) — start with YouTube + Spotify (easiest APIs); defer Instagram until we're willing to pay App Review tax.
  3. Reject entirely — never ship platform integrations; commit to "tadaify hosts your content; platforms host theirs".
- **Twoja rekomendacja:** Option **2 (Pro-tier OAuth block, deferred)**. Reframe the user's "Instagram page template" as an "Instagram block" inside the existing F-PRO-OAUTH-IMPORT roadmap item. Start with YouTube (easiest, broad appeal) once we have multi-page (Idea A) shipped — multi-page makes the block more valuable because creators can dedicate `/<handle>/youtube` as a video-wall surface. Skip Instagram until App Review pain is justified by paying-customer demand. Reject the page-template framing — that's a layout feature, not a content feature. Ship a static grid block (Option 1's spirit) at MVP if creators ask for it; the static version is 2 days of work vs OAuth's months.

---

## Out-of-scope explicit

Things mentioned during research that are **not** part of this SPIKE's recommendation:

- **Becoming Webflow.** Adding multi-page + grid + custom CSS injection + arbitrary HTML embed = full website builder. We'd lose to incumbents (Webflow, Squarespace) on every dimension. Stay in the "rich link-in-bio" lane.
- **Per-page commerce.** Letting Stripe products live on `/portfolio` separately from `/<handle>` adds account-payments complexity. Defer until we have multi-page shipped *and* a clear creator demand signal.
- **Membership-gated pages.** ("This page only visible to my Patreon supporters.") Massive rabbit-hole — auth, access tokens, payment-provider linkage, refund flows. Beacons Creator-Max ships gated content; we explicitly defer.
- **Custom domain *per page*.** (`portfolio.<creator>.com` pointing to `/<handle>/portfolio`.) Beyond MVP. Single custom domain for the whole account is the obvious first step.
- **Page-level analytics breakdown.** Required eventually for multi-page to be useful, but a separate ticket — out of scope for this SPIKE.
- **Page templates (preset layouts) beyond the IG/YouTube wall framing.** The user mentioned templates implicitly via the IG-wall idea. A *layout-only* template gallery (`Portfolio template`, `Privacy template`, `Workshop landing template`) is a cheap follow-up to multi-page, but not part of this DEC set.

---

## Index update

After this DEC is answered, append to `docs/research/README.md`:

```markdown
- 2026-04-25 — [Multi-page, grid, and API-driven templates](./multi-page-grid-and-templates.md) — status: <pending DEC | accepted with mods | rejected>
```
