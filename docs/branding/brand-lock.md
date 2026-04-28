---
type: branding
project: tadaify
title: Brand Lock — tadaify final decisions
created_at: 2026-04-24
author: orchestrator
status: locked
---

# Brand Lock — tadaify

Locked decisions from user on 2026-04-24. This file is the single source of truth for the brand from this point forward. Any deviation requires a new DEC entry and explicit user approval.

## 1. Naming

| Surface | Value |
|---|---|
| Domain | `tadaify.com` |
| URL slug / system handle | `tadaify` |
| Repository names | `tadaify-app`, `tadaify-aws` |
| Display brand / marketing / logo wordmark | `tada!ify` (final — zero separators, all inline) |
| Plain-text contexts (where punctuation breaks) | `tadaify` |

Rationale: `.com` for trust + universal keyboard typability, `tada!ify` as the display form for emotional recall in marketing, landing, logo, social. System/URL context always falls back to `tadaify`.

## 2. Palette — Indigo Serif (locked)

| Token | Hex | Usage |
|---|---|---|
| Primary | `#6366F1` | Primary CTA, wordmark `ta`, large orb |
| Secondary | `#8B5CF6` | Gradient partner, accents, hover states |
| Warm accent | `#F59E0B` | Wordmark `da!`, small orb, spotlight |
| Warm accent soft | `#FDE68A` | Warm gradients, callouts |
| Background | `#F9FAFB` | Light-mode canvas |
| Foreground | `#111827` | Body text on light, wordmark `ify` on light |
| Foreground inverse | `#F9FAFB` | Wordmark `ify` on dark backgrounds |
| Hero gradient | `linear-gradient(135deg, #6366F1 → #8B5CF6)` | Hero sections, promotional backgrounds |

## 3. Wordmark — `tada!ify` (final, locked 2026-04-24 via DEC-WORDMARK-01)

Display form: **`tada!ify`** — zero separators, all inline, exclamation stays.

- `ta` — `#6366F1` (primary opening)
- `da!` — `#F59E0B` (warm reveal, including the `!`)
- `ify` — `#111827` on light / `#F9FAFB` on dark (sits directly next to `!` with no gap)

**Why `tada!ify` (no hyphen):** earlier variants used a muted hyphen to mark the "ta-da" reveal beat. Testing in mockups showed it weakens the brand — the hyphen draws attention to the break rather than the reveal. Final form is cleaner, more ownable, reads as one word with the `!` providing the rhythm.

**Plain-text fallback** (tooling that can't render the `!` gracefully): `tadaify` (slug form, no punctuation).

**Iteration history (superseded):**
- A — `tada!ify` (initial, two hyphens) — deprecated
- E — `ta · da! · ify` (middle dots) — deprecated
- F — `tada!ify` (one hyphen + bound tail, locked via DEC-025) — **superseded by FINAL 2026-04-24**
- **FINAL — `tada!ify` (zero separators) — LOCKED via DEC-WORDMARK-01**

## 4. Logo motion — LOCKED 2026-04-24 (DEC-029)

**Source of truth:** `tadaify-logo-motion-v10-FINAL.html` + `.md`

**Pattern:** clockwise 360° orbit from 3 o'clock + subtle radial breath.

- Warm orb starts centered on purple orb (static brand mark position §5)
- Glides to 3 o'clock (right edge) along horizontal radius — 0.9s ease-out
- Orbits clockwise along circle of radius ≈ `R × 0.92` — 5.6s ease-in-out
- Returns to center along radius — 0.9s ease-in
- Rests at center — 0.8s
- Total cycle: **8.2s**, infinite loop
- During orbit: ±3% radial breath, 4 breaths per lap (~1.4s per breath)
- Wordmark `tada!ify` (final) sits static below; never animates
- `prefers-reduced-motion` → static centered warm orb, zero motion

**Sizing (unchanged from earlier lock):**
- Warm orb diameter = large orb RADIUS (warm is ½ the size of purple)
- Orbit radius = R × 0.92 (warm orb edge touches purple perimeter without spill)

**Visual — gradient orbs (v9 lock):**
- Purple: `linearGradient 145° #7C78FF → #5B56E8 @ 58% → #4F46E5` + white radial catchlight cx=32% cy=24% + inner stroke `rgba(255,255,255,0.28)`
- Warm: `linearGradient 145° #FFD36A → #F59E0B @ 58% → #D97706` + white radial catchlight cx=28% cy=22%
- Drop-shadow (light mode): purple `rgba(79,70,229,0.30)` / warm `rgba(245,158,11,0.32)`
- Drop-shadow (dark mode): purple `rgba(79,70,229,0.40)` / warm `rgba(245,158,11,0.42)`
- Dark mode purple lift: `#818CF8 → #6366F1 → #4F46E5`

**Iteration history:**
- v1 (4 variants) — rejected, wanted one final
- v2 (center → 4-point arc sweep → center) — warm orb too small, arc not bouncy
- v3 (pop + settle bounce-back) — cartoon pop, not premium
- v4 (wave-at-edge oscillation) — too chaotic
- v5 (single-axis L↔R sway 9s) — too slow
- v6 (Opus Step Forward 70% stillness) — "galareta" (jelly, didn't move)
- v7 (continuous L↔R 5.5s) — superseded by orbit spec change
- v8 (360° orbit + radial breath) — motion ACCEPTED
- v9 (v8 + gradient orbs) — visual accepted, pending formal lock
- **v10 FINAL — LOCKED via DEC-029 on 2026-04-24**

## 5. Static logo placement — Center (locked)

For all static surfaces (favicon, nav logo, email signature, social avatar, OG image, app icon):
- Small warm orb centered on (or in front of) the large purple orb.

## 6. Tagline (locked)

**Final tagline:** `Turn your bio link into your best first impression.`

- Char count: 51
- Used in: landing hero, App Store first line, Twitter/X bio
- Polish localization: TBD (to be proposed alongside first Polish marketing copy)

## 7. Theme tokens — light + dark (locked)

Full token system locked per `tadaify-theme-tokens.html` (2026-04-24). Key derivations:

- **Dark canvas:** `#0B0F1E` (cool desaturated navy — premium, not pure black)
- **Brand primary lift (dark):** `#6366F1` → `#818CF8` (contrast 3.1:1 → 4.7:1, passes WCAG AA)
- **Wordmark `ify` in dark:** `#F9FAFB`
- All 5 surface + 4 foreground + 5 brand + 4×3 semantic + 2 gradient tokens defined for both modes
- CSS custom properties + Tailwind config snippet available in `tadaify-theme-tokens.html` / `.md`

**Source-of-truth:** `tadaify-theme-tokens.html` + `tadaify-theme-tokens.md`

## 9. Pricing commitments (locked — 2026-04-25, DEC-PRICELOCK-01)

- **Price-lock-for-life (DEC-PRICELOCK-01)** — any paid subscriber pays the price at which they signed up, indefinitely, as long as the subscription stays uninterrupted. New public prices apply only to new signups or to users who cancelled and re-subscribed. This is a **brand commitment**, not a promotion. Must appear on: pricing page, onboarding tier step, public marketing. Copy: "Price locked for life" or "Your price is locked for life — we never raise the price on active subscribers." Supersedes the prior 3-year windowed lock (DEC-SYN-06). Implemented via Stripe `price_id` anchoring — each subscription is pinned to the price object at signup time; new Stripe price objects serve new subscribers only.
- **Universal $2/mo custom-domain add-on (DEC-PRICELOCK-02)** — every tier (Free / Creator / Pro / Business) can attach extra custom domains at $2/mo per domain. Free has no baseline; Creator/Pro include 1; Business includes 10 (agency). Never frame the add-on as a Free-tier-only perk — it is a universal unlock available on every plan. Creator/Pro's 1-domain baseline is included in the plan price; adding a second domain on Creator is also $2/mo. Copy on pricing + onboarding: "Need extra domains? Add $2/mo per custom domain to any plan — Free included. No upgrade needed." Implementation: Stripe metered add-on (`custom_domain_addon`) bound to the main subscription, cancel anytime per domain. See `F-DOMAIN-ADDON-001`.
- **No trials.** 30-day money-back instead. DEC-TRIAL-01.
- **Multi-page accounts (DEC-MULTIPAGE-01)** — post-MVP feature, Q+1. Each tier has a page count limit: Free 1 / Creator 5 / Pro 20 / Business unlimited. Sub-pages live at `tadaify.com/<handle>/<slug>` (e.g. `/privacy`, `/about`, `/portfolio`). Each page is its own blocks + theme override + SEO. Marketed as "the only link-in-bio that lets you have a privacy page, portfolio page, workshop landing — without leaving tadaify."
- **Account vs Page settings boundary** — locked architecture defining global vs per-page settings, see F-ARCHITECTURE-001 in functional-spec-final.md. Single source of truth for "is this overridable per-page or not" decisions.

### §9 additions (2026-04-25 second wave)

- **Creator API (Pro tier pillar — DEC-CREATOR-API-01=A).** AI-friendly REST API, per-user keys, OpenAPI 3.0, `@tadaify/mcp` npm MCP server, custom GPT template. Positioning line: *"Your AI assistant manages your tadaify so you don't have to."* Pro differentiator alongside 100 AI uses/mo.
- **AI quota ladder (DEC-AI-QUOTA-LADDER-01=B).** Unified token bucket: **Free 5 uses/mo / Creator 20 uses/mo / Pro 100 uses/mo / Business unlimited**. All text-only AI features (theme matcher, bio rewrite, block copy suggest) share the same bucket. Image generation deferred per DEC-AI-FEATURES-ROADMAP-01=A.
- **Opt-in support badge (DEC-OPT-BADGE — refines AP-001).** AP-001 remains fully intact: no forced "Powered by tadaify" on any tier, ever. Refinement: an **opt-in** "made with tada!ify" badge is available on every tier, default **OFF**. Creators who want to show brand affinity can enable it. Never default ON, never a condition for Free tier, never a paid unlock.
- **Pinned message primitive (DEC-PINNED-MSG-01=A).** Toggleable fading announcement line above profile card. Max 80 chars. Dismissible by visitor. tadaify-only differentiator — no competitor ships this as a built-in page primitive.

## 10. Naming hygiene (2026-04-25 second wave)

| Old label | New label | Surface | Rationale |
|---|---|---|---|
| Header | Profile | Design sub-nav tab | "Profile" is the universal creator-tool word for avatar + name section. "Header" is a dev/CSS term that confused non-technical users. |
| Wallpaper | Background | Design sub-nav tab | "Background" is the universal consumer word (iOS, Android, Windows all use it). "Wallpaper" carries desktop-era connotation. |
| Contact (block category) | Inbox | Add Block modal | "Inbox" captures the intent — where messages come in — vs generic "Contact". |
| Events (block category) | Calendar | Add Block modal | "Calendar" is more immediately understood and matches the icon (📅). |
| Text (block category) | Words | Add Block modal | "Words" is the tadaify brand voice — playful, differentiated from every other tool that says "Text". |
| Suggested (block category) | Smart picks | Add Block modal | "Smart picks" clarifies this is AI-assisted personalization, not just a default. |

**Rationale for IA language choices:** category-leader information architecture (linking to familiar concepts like Inbox/Calendar/Words) is recognizable and reduces friction. We differentiate by language, not just function — these names carry tadaify's voice without sacrificing clarity. "Organise…" dropdown (Group / Archive / Reorder / Export) replaces two separate chips for the same reason: one verb, progressive disclosure.

## 8. Next unlocks (not yet decided)

- [ ] Typography — display face + body face + mono face
- [ ] Button shape language (rounded vs sharp vs pill)
- [ ] Icon system (Lucide? Phosphor? custom?)
- [ ] Polish tagline localization

## References

- [brand-exploration.md](./brand-exploration.md) — source of alternative name options (now decided)
- [brand-exploration.html](./brand-exploration.html) — visual source for the locked palette + wordmark split
- [tadaify-logo-motion-mockup.md](./tadaify-logo-motion-mockup.md) — source of motion core idea + deferred variants
- [tadaify-logo-motion-mockup.html](./tadaify-logo-motion-mockup.html) — visual source for motion variants

## Decision log

- DEC-004: name locked — `tadaify.com` + display `tada!ify`
- DEC-005: palette locked — Indigo Serif
- DEC-006: motion locked at the core-idea level only; specific variant deferred
- DEC-007: static placement locked — Center
- DEC-018: motion v2 rejected; v3 spec: warm orb radius = large-orb radius, point-to-point bounce-back-to-center
- DEC-019: tagline locked — "Turn your bio link into your best first impression."
- DEC-020: theme tokens locked — full light + dark system (`tadaify-theme-tokens.html`)
- DEC-024: superseded by DEC-WORDMARK-01
- DEC-025: wordmark locked — variant F `tada!ify` (one muted hyphen + bound tail) — **superseded by DEC-WORDMARK-01**
- DEC-029: motion locked — v10 FINAL (`tadaify-logo-motion-v10-FINAL.html`)
- DEC-WORDMARK-01: final wordmark — `tada!ify` with no hyphens; `ta/da!/ify` color split unchanged (locked 2026-04-24)
- DEC-PRICELOCK-01: price-lock-for-life — paid subscription price locked perpetually for uninterrupted subscriptions; supersedes DEC-SYN-06 (3-year window); no trials (DEC-TRIAL-01 reaffirmed). Locked 2026-04-25. See §9.
- DEC-PRICELOCK-02: $2/mo domain add-on universalised — available on every tier (Free / Creator / Pro / Business), never framed as Free-only; Pro tier simplified to 1 domain (was 3), multi-domain is Business/agency need; Business changed to 10 domains (was unlimited). Locked 2026-04-25. See §9 and `F-DOMAIN-ADDON-001`.
- DEC-MULTIPAGE-01: multi-page accounts confirmed for post-MVP (Q+1). Tier ladder Free 1 / Creator 5 / Pro 20 / Business unlimited. Sub-pages at `tadaify.com/<handle>/<slug>`. MVP stories must be forward-compat (`blocks.page_id` FK, `/<handle>/<slug>` routing). Locked 2026-04-25. See §9, `F-MULTIPAGE-001` (functional-spec-final.md §20), and `docs/research/multi-page-grid-and-templates.md`.
- DEC-LAYOUT-01=A: grid layout ships in MVP. `pages.layout_mode='stack'|'grid'`. `block_placements` table. Editor drag-onto-cell + span handles + mobile auto-collapse. CSS Grid rendering. All tiers. Locked 2026-04-25. See `F-LAYOUT-001`.
- DEC-APIPAGES-01=C: platform OAuth import (IG/YT/Spotify) **permanently rejected**. F-PRO-OAUTH-IMPORT removed from roadmap. Creator API (F-PRO-CREATOR-API-001) is the power-user path. Locked 2026-04-25.
- DEC-CREATOR-API-01=A: Pro tier REST API (OpenAPI 3.0 + `@tadaify/mcp` npm + custom GPT template). "Your AI assistant manages your tadaify so you don't have to." Rate limit 1000 req/h Pro. Locked 2026-04-25. See `F-PRO-CREATOR-API-001`.
- DEC-AI-QUOTA-LADDER-01=B: unified AI token bucket — Free 5/mo, Creator 20/mo, Pro 100/mo, Business unlimited. Locked 2026-04-25.
- DEC-AI-FEATURES-ROADMAP-01=A: text-only AI (theme matcher + bio rewrite + block copy suggest). Image gen deferred. Locked 2026-04-25. See `F-AI-BIO-REWRITE-001`, `F-AI-COPY-SUGGEST-001`.
- DEC-ANIMATIONS-SPLIT-01=A: Animations sub-tab = 2 sections (Entrance + Ambient) + Accessibility footer. Locked 2026-04-25.
- DEC-WALLPAPER-ANIM-01=C: Background stays static (Fill/Gradient/Blur/Pattern/Image/Video). Motion lives exclusively in Animations > Ambient. Locked 2026-04-25.
- DEC-PINNED-MSG-01=A: pinned message primitive — toggleable fading line above profile card. 80 chars max, dismissible by visitor. tadaify differentiator. Locked 2026-04-25.
- DEC-CUSTOM-DOMAIN-NAV-01=A: 6th "Domain" sidebar item with "soon" pill. Mobile bottom-tabs unchanged (5 items max). Locked 2026-04-25.
- F-ARCHITECTURE-001: account vs page settings boundary locked — `account_settings` (1 row/user, global: theme/profile/footer/domain) vs `pages` (1+rows/user, per-page: type/layout_mode/theme_override JSONB) vs `blocks.page_id` FK NOT NULL. Merge rule: `effective_theme = merge(account.theme, page.theme_override)`. Locked 2026-04-25. See functional-spec-final.md §31.
