---
type: product-spec
project: tadaify
title: Tadaify — Functional Specification v2 (locked-architecture + locked-pricing)
created_at: 2026-04-24
author: orchestrator-opus-4-7-spec-agent
status: superseded-by-functional-spec-final.md
supersedes: functional-spec.md (v1, 2026-04-24)
---

# Tadaify — Functional Specification v2

## 0. What changed from v1 + how to read v2

v1 (same date, earlier in the day) was written before four pivots landed. Those pivots re-shaped the gating model, the infra surface, the pricing ladder, and the acquisition wedge. v2 encodes the locked state.

### 0.1 Four pivots that invalidated v1

1. **Architecture (DEC-035) — LOCKED Cloudflare-first.** Edge + custom domains + media + hot analytics = Cloudflare (Workers, R2, Pages, Cloudflare-for-SaaS, Analytics Engine, DNS). Central brain = Supabase (Postgres, GoTrue, Edge Functions, Realtime). AWS is reduced to S3 (cold analytics Parquet) + Athena + Glue + IAM OIDC. **No CloudFront, no Route53, no ACM, no Lambda by default.** v1 assumed an AWS-first path; all infra callouts in v1 are superseded by `infra-architecture-v2.md`.
2. **Currency (DEC-036) — LOCKED USD.** v1 oscillated between $ and €/€2–3 prices. v2 prices everything in USD. Cloudflare, Stripe, OpenAI, Resend all bill in USD and ≥70% of target creators are USD-denominated. EU creators see local-currency display via `F-073` but the plan SKU is USD.
3. **Tier structure (DEC-037) — LOCKED 4-tier flat.** v1 used Linktree-inspired Free / Starter / Pro / Premium or Free / Pro / Business, with a 0%-vs-9%-vs-12% seller fee ladder as the upgrade engine. v2 kills the seller fee ladder entirely — **every tier is 0% platform fees on every product sale**. Upgrade drivers are domain add-ons + Pro power features + Business agency features. Tiers are:
   - **Free — $0** — every product feature unlocked; 0 custom domains included (add 1 for $3/mo).
   - **Creator — $5/mo** — Free + 1 custom domain included + add-on domains at $3/mo.
   - **Pro — $15/mo** — Creator + 3 custom domains + **5-8 genuine power features** listed in §N+9.
   - **Business — $49/mo** — Pro + agency sub-accounts + white-label + SLA + priority support.
4. **Feature gating model (DEC-043) — LOCKED "everything free".** v1 put commerce, communities, bundles, upsells, discount codes, revenue analytics, email broadcasts, social profile live counts, reviews, verified-buyer badges, per-block color overrides, BNPL, Przelewy24/BLIK, and animated highlight blocks all behind Pro. v2 unlocks **every product feature on Free**. A nano creator with 1M views pays $0 and gets every feature a $99 Stan Pro creator gets. Pricing differentiation comes from (a) custom domain add-ons (primary revenue driver, ~97% marginal margin), (b) Pro-tier power features (§N+9), and (c) Business agency features.

### 0.2 Why "everything free" is economically viable

The analysis in `infra-architecture-v2.md` §7 shows that **bandwidth is effectively free on Cloudflare's Business plan**. A viral creator pushing 1M page views/mo costs tadaify at the margin:

- Workers invocations: ~$0.30 (10M req overage, but most requests are cached — typical 1M views = ~100k origin hits)
- R2 storage + ops: ~$0.50 for the viral creator's media
- Analytics Engine writes: ~$1
- Supabase DB queries via Edge Functions: ~$2 (viral creators hit DB rarely — most traffic is cached HTML)

**Total marginal cost for a 1M-view creator ≈ $3–5/mo.** This is why DEC-034's bandwidth-metering plan was abandoned — the measurement overhead (per-view counter + quota reset logic + dashboard + upgrade-nag UX + edge-case handling for bot spikes) would cost more in engineering + support than the revenue it captured. v2 ships NO view quotas, NO bandwidth metering, NO throttling. Revenue comes from creators who want a domain or who want power features, not from creators whose pages caught fire.

### 0.3 What a creator actually unlocks by upgrading (the new mental model)

| Jump | What opens up | Who pays for this |
|---|---|---|
| Free → Creator ($5) | 1 custom domain included (no add-on needed) + 180d analytics retention (vs Free 90d) + 40 AI generations/mo (vs Free 20) + 24h priority support (vs Free 48h) + custom favicon + scheduled publishing for blocks + verified creator badge (2FA + OAuth-gated) + directory listing opt-in + seamless Free-with-domain-add-on → Creator upgrade (same DB row, zero DNS re-setup) | Creators who want a branded URL + meaningful quality-of-life upgrades; ~15-20% of active creators expected |
| Creator → Pro ($15) | 8 power features justifying the $10/mo delta (see §N+9) | Creators with real audience who need depth (analytics 365d retention, A/B testing, team seats, API, custom CSS/HTML/JS, higher AI quota, dedicated email sender) |
| Pro → Business ($49) | Agency sub-accounts, bulk management, white-label, 4h SLA, custom T&Cs | Social media managers + small agencies running 3-10 creator pages |

v1's seller fee ladder is dead. v2's ladder is **feature depth**, not revenue clawback.

### 0.4 Preview generator elevated to MVP-critical (admin-only sales tool)

v1 mentioned a preview tool as a possible acquisition lever but did not write feature units for it. v2 ships seven dedicated MVP feature units (`F-PREVIEW-001..007`) plus three M+0.5 post-launch units (`F-PREVIEW-010..012`). **Architecture pivot (DEC-MKT-B-v2 + DEC-Q5-C):** the preview generator is NOT a public endpoint. It is an admin-only marketing tool at `/admin/marketing/preview-generator`. Admin pastes a target creator's Linktree URL (MVP), customizes the preview visually, and generates a private `preview.tadaify.com/<slug>?ref=<hash>` URL to send 1-to-1. If the target signs up via `?ref=<hash>`, onboarding is pre-populated with admin's customization. This is a hand-crafted 1-to-1 white-glove conversion tool — zero public attack surface, zero legal exposure from auto-generating public pages, maximum conversion (10x higher reply rate vs generic outreach). At MVP launch, parsing is Linktree-only (DEC-Q5-C). Beacons, Stan, and Bio.link parsers follow at M+0.5 (week +2 of launch). Details in §3a.

### 0.5 Naming conventions (carried over from v1)

| Prefix | Meaning |
|---|---|
| `F-NNN` / `F-XXX-NNN` | Feature unit |
| `PAT-NNN` | Competitor pattern (patterns-library.md) |
| `DEC-SYN-NN` | Strategic decision (research-synthesis.md) |
| `DEC-NNN` | 2026-04 user-locked decisions (`/tmp/claude-decisions/decisions.json`) |
| `BR-NNN` / `TR-NNN` | Business / Technical requirement (target `tadaify-app/docs/`) |
| `STS-/LT-/BCN-/CRD-/LKB-/TPL-NNN` | Competitor screen citations |

### 0.6 Feature-unit anatomy

Each `F-NNN` carries: Summary · Why it's in scope · Competitor baseline · Behavior · Data model · Interfaces/APIs · **Tier gating (Free/Creator/Pro/Business)** · Eng effort (S<3d / M=1w / L=2-3w / XL>3w) · Dependencies · MVP/Y1/Y2 placement · Test surface · Open questions.

### 0.7 What did NOT change from v1

- Product positioning as a link-in-bio + lightweight creator commerce platform aimed at nano/micro creators, with an EU regulatory wedge (VAT OSS, Przelewy24, BLIK, SEPA, EU/PL payment methods). Note: marketing copy is EN-only per DEC-MKT-C; PL-culture templates and PL-localized positioning are deferred to Y2+ pending organic PL pull.
- Brand lock (Indigo Serif palette, variant-F wordmark, Warm-orb motion, tagline "Turn your bio link into your best first impression.").
- LinkOfMe-inherited port surface (~45 BRs ≈ 60-70% code reuse for analytics, auth, admin, moderation, rate-limits, GDPR, maintenance mode, social-icon auto-detect, QR share).
- Feature areas overview (§2) stays the same 14 areas, but feature counts shift because gating collapses (more features now "Free" rather than "Pro").

---

## 1. Product positioning summary (updated)

**Tadaify is the link-in-bio + creator commerce platform where every product feature is free, forever.** The only things you pay for are (a) your own domain on your own URL and (b) power features that only matter once you have a real audience. A nano/micro creator can ship a full tadaify page with commerce at 0% fees, deep analytics, AI-assisted copy, email capture, scheduling, reviews, bundles, communities, PL/EU payment methods — all free. Competitors gate most of this behind $10-30/mo paywalls or seller-fee ladders; tadaify refuses to.

Pricing:

| Tier | USD | What's gated ON (not unlocked from below) |
|---|---|---|
| Free | $0 | 0 custom domains (add 1 @ $3/mo if desired); 90d analytics; 20 AI gens/mo; 48h support |
| Creator | $5/mo | 1 custom domain included (add more @ $3/mo); 180d analytics; 40 AI gens/mo; 24h priority support; custom favicon; scheduled publishing; verified creator badge; directory listing opt-in; seamless domain-add-on → Creator upgrade (no DNS re-setup) |
| Pro | $15/mo | 3 domains + 8 power features (§N+9); 365d analytics; 200 AI gens/mo; 12h support |
| Business | $49/mo | Unlimited domains + agency sub-accounts + white-label + 4h SLA; all-time analytics; unlimited AI |

### 1.1 The five wedges (unchanged in direction, sharpened in magnitude)

1. **"Linktree Premium on Free, forever."** Not just Linktree Pro $12 — Linktree **Premium** $30. Every feature Linktree paywalls at any tier (custom themes, deep analytics (90d Free / 180d Creator / 365d Pro), email capture, scheduling, per-block CTA, full block library, no branding on any tier (AP-001 hard-locked), QR, entrance animations, featured/highlighted blocks, inline checkout, reviews, bundles, PL/EU payments) ships on Free or Creator — never behind Pro or a paywall in ways competitors charge for. Anchor units: F-003 / F-023 / F-030 / F-050 / F-072 / F-077 / F-148.
2. **0% platform fees at every tier, contractually locked. Published on Trust Center. Guaranteed for the Price Lock window (`F-172a`).** Linktree takes 12% on Free, 9% on Starter+Pro, 0% only on Premium $30. Beacons takes 9% on Free+Creator, 0% on Creator Plus $30. Stan takes 0% but has no Free. Tadaify takes 0% on every tier, forever — the commitment is published on `trust.tadaify.com/zero-fee`, bound by the Price Lock (DEC-SYN-06), and cannot be raised mid-subscription. A creator at $300/mo MRR keeps $300 on tadaify vs $273 on Linktree Pro.
3. **Custom domain at $3/mo — the category's lowest entry point.** Lnk.bio sells it at $39.99/year ≈ $3.33/mo and makes you upgrade first; we sell it at $3/mo as an add-on on top of Free (no plan upgrade required), OR include it free with Creator ($5/mo bundle = $3 domain + $2 "for the soul"). Positioning: domain is a commitment signal, not a revenue tier. `F-060`.
4. **EU/PL regulatory + payment wedge** — VAT OSS, Przelewy24 + BLIK + SEPA, EU payment methods native in checkout. None of the 7 audited competitors ship even one of these. PL creator directory, PL-culture templates (formerly planned as Chopin / Kopernik / Skłodowska references), and native PL copy are deferred to Y2+ per DEC-MKT-C (EN-only marketing at launch). Template naming convention is TBD — was planned as PL-culture references but DEC-MKT-C scoped to EN only; names will be neutral or brand-neutral (e.g., "Indigo", "Dusk", "Minimal") at MVP. `F-074 / F-085 / F-127 / F-165 / F-230-F-239`.
5. **Preview-generator acquisition flywheel** — admin-only marketing tool at `/admin/marketing/preview-generator`. Admin pastes a target creator's Linktree URL (MVP), system fetches + parses, admin customizes the preview visually (theme/animation/layout/CTA/palette), system generates a private `preview.tadaify.com/<slug>?ref=<hash>` URL, admin sends it privately via DM/email. If the target signs up via `?ref=<hash>`, their onboarding is pre-populated with the admin's customization. This is a hand-crafted 1-to-1 white-glove conversion tool, not a public endpoint. At MVP: Linktree parser only (DEC-Q5-C). Beacons, Stan, Bio.link parsers follow at M+0.5. This is the single strongest non-generic thing in our GTM. `F-PREVIEW-001..007` (MVP) + `F-PREVIEW-010..012` (M+0.5).

### 1.2 Who we serve

(Unchanged from v1 §1.1.)

### 1.3 What we explicitly do NOT do (unchanged from v1 §1.3)

- No course hosting with quizzes + certificates (Stan's moat)
- No brand-deal CRM inbox (Beacons's moat)
- No media kit builder (Beacons's moat)
- No lifetime one-time-payment plan (Lnk.bio's territory)
- No native iOS/Android apps at MVP (PWA only)
- No no-pricing-on-landing trick
- No anti-platform "algorithm is the enemy" verbatim copy
- No middle-dot · separator (Stan's rhythm)
- No seller-fee ladder (v2-locked: always 0%)

### 1.4 Brand constraints (unchanged from `brand-lock.md`)

Domain `tadaify.com`, slug `tadaify`, wordmark `tada!ify` variant F, palette Indigo Serif (Primary #6366F1 / Secondary #8B5CF6 / Warm accent #F59E0B / Warm soft #FDE68A / BG #F9FAFB / FG #111827 / Dark canvas #0B0F1E), warm-orb 360° orbit 8.2s, `prefers-reduced-motion` static. Tagline: "Turn your bio link into your best first impression."

### 1.5 Success criteria for MVP (sharpened)

- Time from landing → live public page with one block: ≤ **60 seconds**.
- Free-tier D30 retention: ≥ **45%** (Linktree benchmark ~38%; v1 used "NPS" which is a lagging indicator).
- **Custom domain attach rate at D30:** ≥ **8%** of Free creators add a $3 domain OR upgrade to Creator $5 (this is the primary revenue metric; views are not).
- **Free → Pro conversion at D60:** ≥ **1.5%** (Linktree free→paid industry baseline).
- Preview-generator conversion: ≥ **3% of sent preview URLs convert to signup within 7 days** (admin-only 1-to-1 outreach tool; previews are private, never indexed, never broadcast). No R0 / viral mechanic — this is a hand-crafted sales tool, not a discovery product.
- SLA adherence published + met: Free 48h / Creator 24h / Pro 12h / Business 4h (per Trust Center live dashboard `F-172`).

---

## 2. Feature areas overview (updated counts)

| Area | Code | Feature units | MVP count | Note vs v1 |
|---|---|---|---|---|
| Onboarding & Identity | `F-001..019` | 13 | 13 | Unchanged; v1 referenced 14 but F-013 is inside F-002. |
| Editor & Block System | `F-020..049` | 18 | 15 | Unchanged. |
| Public Page Rendering | `F-050..069` | 14 | 12 | Unchanged. |
| **Preview Generator** | `F-PREVIEW-001..012` | **10** | **7** (MVP) + 3 (M+0.5) | **NEW in v2 (admin-only sales tool)** — `/admin/marketing/preview-generator`. MVP = Linktree parser only (DEC-Q5-C). M+0.5 = Beacons/Stan/Bio.link parsers (F-PREVIEW-010..012). |
| **Custom Domain System** | `F-CUSTOM-DOMAIN-001..003` | **3** | **3** | **Replaces v1 F-060 single unit** — Cloudflare-for-SaaS integration. |
| Commerce & Checkout | `F-070..099` | 16 | 15 | Gating flipped to Free for most. |
| **Subtle Contextual Upsell** | `F-UPSELL-001..006` | **6** | **5** | **NEW in v2** — signal-based hints; F-UPSELL-005 deferred to Y1 (needs user base). |
| Analytics & Insights | `F-100..114` | 10 | 7 | Tiered retention: Free 90d / Creator 180d / Pro 365d / Business all-time. Full feature depth on Free (no analytics paywall). |
| Email & Audience | `F-115..124` | 6 | 5 | Campaign builder Free (was Pro in v1). |
| Growth Loops & Social Proof | `F-125..139` | 8 | 7 | Unchanged. |
| Customization & Theming | `F-140..164` | 14 | 12 | All unlocked Free. |
| Templates & Starters | `F-165..169` | 4 | 4 | Unchanged. |
| Custom Domain & Hosting (trust/sla) | `F-170..179` | 5 | 5 | F-170 merges into F-CUSTOM-DOMAIN-003. |
| Admin & Trust | `F-180..199` | 11 | 10 | Unchanged. |
| Integrations & API | `F-200..219` | 10 | 8 | API quota differs per tier (Pro power feature §N+9). |
| AI Features | `F-220..229` | 5 | 4 | Quota tiered Free 20 / Pro 200 / Business ∞ (was 5/100/∞). |
| EU/PL Localization | `F-230..244` | 8 | 8 | Unchanged. |
| Marketing Surfaces | `F-245..264` | 10 | 10 | Unchanged. |
| **Pro-tier Power Features** | `F-PRO-001..008` | **8** | **8** | **NEW in v2** — justifies $15 vs $5 gap. |
| **Business-tier Features** | `F-BIZ-001..005` | **5** | **5** (all MVP — DEC-Q5-A) | **NEW in v2** — agency surface. Full Business tier at MVP; no deferred features. |

**Total feature-unit count: ~157 (v1 ~130).** Growth is from preview generator (+10 total: 7 MVP + 3 M+0.5), custom domain as 3 sub-units (+2 net), Pro power features being explicit (+8), Business tier being explicit (+5), and Subtle Contextual Upsell System (+6).

**MVP subset: ~127 units** (5 F-UPSELL units MVP; F-UPSELL-005 deferred to Y1; F-PREVIEW-010/011/012 deferred to M+0.5). **M+0.5 (week +2 post-launch): 3 units** (Beacons/Stan/Bio.link parsers — F-PREVIEW-010..012). **Y1: ~20 units.** Y2: ~5 units.

**MVP eng-week impact of DEC-Q5-C (Linktree-only at launch):** reduces preview-generator MVP scope by ~6 eng-days vs. the original 4-platform simultaneous build. Linktree parser alone is S-sized (3 days) vs. 4-parser framework (9+ days). The pivot to admin-only tool adds L-sized UI work (~2-3 weeks for the admin preview-generator UI and customization engine) but eliminates the public endpoint complexity entirely. Net MVP eng-week estimate for preview section: **6-7 eng-weeks** (admin UI + customization engine + Linktree parser + preview renderer + hash-inheritance + admin dashboard + outreach workflow).

---

## 3. Onboarding & Identity

v1 §3 spec stands for F-001 through F-019 with two gating changes driven by DEC-043:

- **F-012 (Pro trial) — REMOVED per DEC-TRIAL-01 (2026-04-24).** Rationale: every Pro feature is sticky (team seats, custom CSS, API integrations, email campaigns, 365-day analytics). Reverting after 7 days creates data-loss UX + creator frustration + chargeback risk. Replaced by: (1) **Transparent feature preview in admin** — each Pro feature shown with `🔒 Pro $15/mo` pill + one-click pricing modal (no forced trial). (2) **30-day money-back guarantee** on Pro upgrade — if creator upgrades and doesn't find value, full refund; zero data-loss revert pain. (3) **Subtle upsell F-UPSELL-001..006** already in spec covers discovery without time-bombed trial. Pattern AP-017 (sticky-feature-revert) eliminated by removing the mechanism entirely rather than mitigating it.
- **F-015 (onboarding checklist)** — gets a new row: "Buy your custom domain for $3/mo" as item 5 (replaces "claim domain" aspiration language — we now sell it explicitly).

All other F-001..F-019 units ship as written in v1 §3 with the following pointer updates:
- Every reference to "Free tier" implicitly means "Free — $0" in the 4-tier model.
- Every reference to "€2-€3/mo" domain becomes "$3/mo" (DEC-036 USD).
- "Pro" in v1 unit text maps to "Pro $15" in v2.

---

## 3a. Preview Generator (NEW SECTION — MVP-critical, admin-only marketing tool)

**This section is the single highest-priority eng work after core editor + public page rendering.** Without the preview generator, Track A (direct outreach) loses 3-10× on conversion rate per `marketing-strategy.md` §3.

**Architecture decision (DEC-MKT-B-v2 + DEC-Q5-C — locked):** the preview generator is an **admin-only private marketing tool**, NOT a public endpoint. It lives at `/admin/marketing/preview-generator`. There is no `tadaify.com/preview/<handle>` public URL. Generated previews are served at `preview.tadaify.com/<slug>?ref=<hash>` and sent privately by the admin 1-to-1.

**DEC-Q5-C (locked):** MVP launches with Linktree-only parsing. Beacons, Stan, and Bio.link parsers are M+0.5 units (F-PREVIEW-010/011/012) — approximately week +2 post-launch.

**Positioning:** "Hand-crafted 1-to-1 white-glove conversion tool. Admin spends 5 minutes customizing a preview for a specific target creator. Target clicks the private link, sees their own page already looking amazing on tadaify, clicks 'Claim in 30 seconds', signs up, and finds their editor pre-configured with the admin's customization. Zero friction from 'wow, I want this' to 'it's mine.'"

### 3a.1 — F-PREVIEW-001 · Admin preview-generator UI (MVP)

- **Summary:** Admin-auth UI at `/admin/marketing/preview-generator` where admin pastes a target creator's URL, customizes the preview, and generates a private shareable link.
- **Location:** `/admin/marketing/preview-generator` (admin-auth required; `admin_users` table check).
- **Why it's in scope:** Core acquisition tool. 10x higher DM conversion vs generic outreach. Zero public attack surface.
- **Workflow:**
  1. Admin pastes URL of target creator's page (Linktree / Beacons / Stan / Bio.link / other).
  2. System fetches + parses HTML → extracts `CreatorPreviewData` (name, avatar, bio, links, theme-color approximation, socials).
  3. Opens split-view editor: Left: live preview of rendered tadaify page (buyer view). Right: customization sidebar (F-PREVIEW-002).
  4. Admin tweaks to make the preview look mind-blowing for THIS specific target.
  5. Admin clicks "Generate shareable preview".
  6. System assigns slug (prefer target's handle; fallback random), creates hash, returns shareable URL `preview.tadaify.com/<slug>?ref=<hash>`.
  7. Admin copies URL + sends privately to target (IG DM, email, LinkedIn etc.).
- **Tier gating:** Admin only (not a customer-facing tier feature).
- **Eng effort:** **L** (2-3 weeks — admin UI + split-view editor + customization engine + preview renderer reuse).
- **Dependencies:** F-PREVIEW-002 (customization engine), F-PREVIEW-003 (Linktree parser), F-PREVIEW-004 (preview renderer + slug), F-PREVIEW-005 (hash-based referral).
- **MVP/Y1/Y2:** **MVP — Week 0-3** (ship before outreach starts; Track A+B both depend on it).
- **Test surface:**
  1. Admin pastes `linktr.ee/alex` → `CreatorPreviewData` populated in split-view editor within 5s.
  2. Admin customizes theme → live preview updates in real-time.
  3. "Generate shareable preview" → `preview.tadaify.com/alex?ref=h_xxxxx` returned.
  4. Non-admin user attempting to access URL → 403 redirect to login.
  5. Invalid/unparseable URL → graceful error with manual fallback (admin enters data manually).

### 3a.2 — F-PREVIEW-002 · Customization engine (admin-side) (MVP)

- **Summary:** Admin-configurable customization options for each generated preview.
- **Available tweaks admin can set per preview:**

| Category | Options |
|---|---|
| Theme | All available tadaify themes (8-12 starter + custom palette override) |
| Entrance animation | Full animation library (10 MVP / 55 Y1 per DEC-SYN-21 reduced scope) |
| Layout preset | Hero-first / list-focused / grid / cards / split / minimalist |
| Color palette | Override primary + secondary + accent colors manually |
| Hero banner | Use creator's imported avatar / upload custom hero / pick from creator's visible content |
| Typography | Font pair selector (standard set + premium fonts) |
| CTA text | Override CTA button labels |
| Block ordering | Drag-reorder imported blocks |
| Added blocks | Admin can add promotional blocks (e.g., "Want this? Claim yours →" block) |
| Hide/show blocks | Toggle visibility per block |

- **Save state:** `preview_config` JSONB in `preview_generations` table.
- **Why it's in scope:** Hand-crafted customization is the "hand-crafted" in "hand-crafted 1-to-1 tool". Admin literally spends 5 minutes on each preview.
- **Eng effort:** **M** (1-1.5 weeks — reuses editor block system + theme selector).
- **Dependencies:** F-PREVIEW-001 (admin UI shell), existing editor + theme subsystems.
- **MVP/Y1/Y2:** **MVP — Week 1-2** (co-shipped with F-PREVIEW-001).
- **Test surface:**
  1. Switch theme → live preview updates within 200ms.
  2. Change animation → entrance animation updates in preview panel.
  3. Drag-reorder blocks → order preserved in `preview_config` JSON.
  4. Override CTA text → reflected on preview page.

### 3a.3 — F-PREVIEW-003 · Linktree platform parser (MVP)

- **Summary:** Parser module that fetches + extracts creator content from `linktr.ee/<handle>` public SSR HTML and normalizes to `CreatorPreviewData` schema.
- **Why it's in scope:** Linktree is the MVP target (DEC-Q5-C — 70M+ user pool, SSR-stable `data-testid` anchors).
- **Behavior:**
  - Server-side fetch (Supabase Edge Function or Cloudflare Worker) with `User-Agent: tadaify-preview/1.0 (+https://tadaify.com/preview-bot)`.
  - Custom DOM-walker (no headless browser — cost-prohibitive at admin-call volume is unnecessary, but Edge Function still preferred over client-side).
  - Extracts: `meta[property="og:image"]` (avatar), `meta[property="og:title"]` + `h1` (display name), `.profile-description` (bio), `a[data-testid="LinkButton"]` (blocks), inline CSS custom properties `--background-color`/`--button-color` (theme).
  - Parse failure (≥3 block selectors miss): returns `{ status: 'parse_failed' }` with partial best-effort data.
  - Normalizes into `CreatorPreviewData { platform, handle, displayName, avatarUrl, bio, links[], themeColor, parsedAt }`.
  - Handle missing/broken fields gracefully; smoke-tested against 20 real Linktree handles.
- **Eng effort:** **S** (2-3 days — parser + schema + 20-handle smoke test suite).
- **Dependencies:** F-PREVIEW-001 (admin UI that calls the parser).
- **MVP/Y1/Y2:** **MVP — Week 1** (prerequisite for admin UI).
- **Test surface:**
  1. 10 known Linktree handles → all parse with display name + ≥1 block.
  2. Handle with minimal content → graceful partial parse.
  3. Linktree page with theme color → `themeColor` populated.
  4. Simulated HTML with removed `data-testid` → `parse_failed` status + partial data returned.
  5. Monthly smoke test against 20 real handles (regression for Linktree HTML drift).
- **Open questions:**
  - Weekly regression cron to detect Linktree HTML drift early.

### 3a.4 — F-PREVIEW-004 · Preview renderer + slug management (MVP)

- **URL structure:** `preview.tadaify.com/<slug>?ref=<hash>` (subdomain off main tadaify.com DNS).
- **Summary:** Serves the generated preview page publicly (but not discoverable) using admin's customization config.
- **Slug rules:**
  - Prefer target creator's actual handle (e.g., `preview.tadaify.com/waserek`).
  - If handle already claimed by an actual tadaify creator → fallback to random slug (`preview.tadaify.com/wa3rxk`).
  - Admin can manually override slug in customization panel.
  - Admin can "burn" a preview (delete slug) anytime from admin dashboard.
- **Rendering:**
  - Serves tadaify public-page HTML with `preview_config` from `preview_generations` table.
  - Entrance animation plays on first load (the "wow/tada" moment — the product selling itself).
  - Footer (REQUIRED, NOT optional): prominent disclosure strip at top of preview page: "Preview only — this page is not live. tadaify built this from [target's] public Linktree as a one-time preview for them. If you're @[target] and want this removed: [one-click remove form]." Only AFTER disclosure, at bottom: CTA "Claim @yourhandle on tadaify →". Admin cannot disable the top disclosure.
  - Remove-on-request form at `preview.tadaify.com/remove/<slug>` — target confirms via email-match (target's Linktree email parsed from HTML where available, or manual contact verification) — preview deleted + admin notified + target blacklisted from future outreach.
- **Security:**
  - `noindex, nofollow` meta tag — never indexed.
  - `/preview/*` path (on `preview.tadaify.com`) in `robots.txt disallow`.
  - Cloudflare Bot Management filters scrapers.
  - Rate limit per slug: 100 views/hour (prevent abuse scraping the preview itself).
- **Expiry:**
  - Default preview lives 90 days after generation (admin-configurable 7/30/90/365/unlimited).
  - On expiry: slug freed + 404 returned + email to admin ("preview for @target expired").
  - Exception: if target creator already converted via the hash → preserve preview indefinitely as reference.
- **Data model:** `preview_generations` table (see §3a database schema).
- **Eng effort:** **M** (1 week — preview subdomain setup + renderer + slug management + expiry cron).
- **Dependencies:** F-PREVIEW-001/002/003; F-050 (tadaify public page engine).
- **MVP/Y1/Y2:** **MVP — Week 2-3.**
- **Test surface:**
  1. Generated preview URL loads with admin's custom theme + animation.
  2. Slug collision (target's handle already taken) → fallback slug auto-assigned.
  3. Admin manually sets slug → custom slug served.
  4. Expired preview → 404 + admin email notification.
  5. Rate limit: 101 views/hr from same IP → 429.

### 3a.5 — F-PREVIEW-005 · Hash-based referral + onboarding inheritance (MVP)

- **Summary:** If target creator signs up via the preview URL's `?ref=<hash>`, their onboarding is pre-populated with the admin's customization. The "magic" user asked for.
- **On preview generation:**
  - Generate unique hash (e.g., `h_9XkL2aPqR4nWz`).
  - Store in `preview_generations.hash` column.
  - Shareable URL format: `preview.tadaify.com/<slug>?ref=h_9XkL2aPqR4nWz`.
- **On target visit:**
  - Visitor lands on preview page.
  - `?ref=<hash>` captured from URL → stored in cookie (`tadaify_preview_ref`, 30-day expiry).
  - Preview renders with admin's customizations.
  - CTA click → signup page with hash pre-populated in `ref` query param.
- **On signup:**
  - User completes signup flow.
  - System checks: `tadaify_preview_ref` cookie OR `?ref=<hash>` query param?
  - If YES: lookup `preview_generations WHERE hash = X` → attribution recorded.
  - **Onboarding pre-populates:** theme, animation, layout preset, color palette, typography, any imported blocks.
  - Display welcome message: "Welcome back! We've pre-configured your page based on the preview you saw. Feel free to tweak anything."
  - `preview_generations.converted_user_id` + `converted_at` updated.
- **If NO hash:** standard signup → default empty-state onboarding.
- **Creator experience:** target clicks link → sees amazing preview of THEIR content → clicks "Claim this in 30 seconds" → signs up → lands in editor → page ALREADY set up exactly as the preview. Zero friction.
- **Data model:** `preview_generations` table (see §3a database schema below).
- **Eng effort:** **M** (1 week — hash generation + cookie logic + signup attribution + onboarding config inheritance).
- **Dependencies:** F-PREVIEW-001/004; signup flow (F-002); editor block system.
- **MVP/Y1/Y2:** **MVP — Week 3.**
- **Test surface:**
  1. Sign up via `?ref=<hash>` → editor opens with admin's chosen theme.
  2. Sign up without hash → default onboarding (no pre-config).
  3. `tadaify_preview_ref` cookie set on preview page visit → persists through 30-day window.
  4. Second signup attempt with same hash → allowed (hash reuse for same target; not single-use).
  5. `preview_generations` row updated: `converted_user_id` + `converted_at` populated on hash-signup.

### 3a.6 — F-PREVIEW-006 · Admin preview dashboard (MVP)

- **Location:** `/admin/marketing/previews`.
- **Summary:** Table of all generated previews with analytics and bulk actions.
- **Features:**
  - Table: slug, target handle, platform, created_at, expires_at, status (active/expired/burned/converted), view count, conversion status.
  - Filter: converted / not converted / expired / expiring soon.
  - Per-preview analytics: unique visitors, time on page, CTA click rate, signup conversion (yes/no + creator_id if converted).
  - Bulk actions: extend expiry, burn (delete), clone (duplicate config for a different target).
- **Eng effort:** **M** (1 week — admin table + simple charts + bulk ops).
- **Dependencies:** F-PREVIEW-001/004/005; `preview_generations` table.
- **MVP/Y1/Y2:** **MVP — Week 3-4.**
- **Test surface:**
  1. Dashboard lists all previews with correct status.
  2. Conversion status updates when target signs up via hash.
  3. Bulk "burn" deletes slugs + returns 404 for those URLs.
  4. Clone action → new preview_generation row with new slug + hash, inheriting `preview_config`.

### 3a.7 — F-PREVIEW-007 · Admin outreach workflow integration (MVP)

- **Summary:** Reduces friction between generating preview and sending it to the target.
- **Flow:**
  1. Admin generates preview (F-PREVIEW-001).
  2. On success screen, options:
     - [Copy URL] — copies `preview.tadaify.com/<slug>?ref=<hash>`.
     - [Generate IG DM copy] — fills EN DM templates with target's name + preview link (pre-rewritten variants to avoid pattern detection; see `marketing-strategy.md §2.3`). EN-only per DEC-MKT-C; PL variants deferred to Y2+.
     - [Generate email copy] — same for cold email.
     - [Log outreach] — records "sent to @target via IG DM on 2026-05-01" in `preview_generations` for tracking.
- **Integration with `marketing-strategy.md` Track A:** outreach volume (10k touches/mo per DEC-MKT-A) flows through this workflow. Admin can scale via VA who uses same admin panel.
- **Eng effort:** **S** (3-5 days — success screen + template populator + outreach log field).
- **Dependencies:** F-PREVIEW-001; marketing templates from `marketing-strategy.md §2.3`.
- **MVP/Y1/Y2:** **MVP — Week 4.**
- **Test surface:**
  1. "Generate IG DM copy" → EN variants populated with target's display name + preview URL (EN-only per DEC-MKT-C).
  2. "Log outreach" → `preview_generations.outreach_log` JSONB updated with channel + date.
  3. Template variants are non-identical (anti-pattern-detection).

---

### 3a — Database schema (F-PREVIEW shared)

```sql
CREATE TABLE preview_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),  -- who generated it
  created_at TIMESTAMPTZ DEFAULT now(),

  source_url TEXT NOT NULL,                        -- 'https://linktr.ee/someone'
  source_platform TEXT NOT NULL,                   -- 'linktree' | 'beacons' | 'stan' | 'biolink' | 'other'
  target_handle TEXT,                              -- 'someone' (parsed from URL)
  target_display_name TEXT,                        -- 'Jane Doe' (parsed from HTML)

  slug TEXT UNIQUE NOT NULL,                       -- URL segment after preview.tadaify.com/
  slug_is_target_handle BOOLEAN DEFAULT FALSE,     -- did we claim target's handle as slug?

  hash TEXT UNIQUE NOT NULL,                       -- referral hash for onboarding inheritance

  preview_config JSONB NOT NULL,                   -- admin's customization state
  imported_data JSONB NOT NULL,                    -- raw CreatorPreviewData from parser

  expires_at TIMESTAMPTZ,                          -- null = never
  status TEXT NOT NULL DEFAULT 'active',           -- 'active' | 'expired' | 'burned' | 'converted'

  outreach_log JSONB DEFAULT '[]',                 -- [{channel, sent_at, note}]

  -- analytics (denormalized for speed)
  view_count INTEGER DEFAULT 0,
  unique_visitor_count INTEGER DEFAULT 0,
  cta_click_count INTEGER DEFAULT 0,
  converted_user_id UUID REFERENCES profiles(id),  -- if target signed up via hash
  converted_at TIMESTAMPTZ
);

CREATE INDEX idx_preview_generations_slug ON preview_generations(slug);
CREATE INDEX idx_preview_generations_hash ON preview_generations(hash);
CREATE INDEX idx_preview_generations_admin ON preview_generations(admin_id);
CREATE INDEX idx_preview_generations_status ON preview_generations(status);
```

**RLS:** admin users only (SELECT + INSERT + UPDATE + DELETE); regular users have no access.

---

### 3a M+0.5 — Additional platform parsers (F-PREVIEW-010..012, week +2 post-launch)

### 3a M+0.5.1 — F-PREVIEW-010 · Beacons HTML parser (M+0.5 — week +2 post-launch)

- **Summary:** Parser module for `https://beacons.ai/<handle>` — Next.js SSR, `data-type="block"` attributes. Enables admin to generate previews from Beacons handles.
- **Why M+0.5 and not MVP:** Beacons outreach pool is ~1M handles vs. Linktree's 70M. First 2 weeks of outreach will be Linktree-only; Beacons outreach starts in sprint 2.
- **Implementation:** Mirror of F-PREVIEW-003 with Beacons-specific selectors. Maps `data-block-type="product"` → tadaify `type: 'product'` block (price + thumbnail propagated). Common `CreatorPreviewData` schema unchanged.
- **Eng effort:** **S** (2-3 days — leverages F-PREVIEW-003 parser harness).
- **Dependencies:** F-PREVIEW-001/003 (admin UI + parser framework).
- **MVP/Y1/Y2:** **M+0.5 — approximately week +2 post-launch.**
- **Test surface:** product block with price renders at correct USD amount; weekly regression mandatory (Beacons HTML more volatile than Linktree).

### 3a M+0.5.2 — F-PREVIEW-011 · Stan Store HTML parser (M+0.5 — week +2 post-launch)

- **Summary:** Parser module for `https://stan.store/<handle>` — Shopify-like templated SSR. Stan users are highest-intent ($29+/mo paying) — strong "switch and save" angle.
- **Implementation:** Stan's simpler single-column template. Maps `.product-card` → tadaify `type: 'product'`, `.link-card` → `type: 'external-link'`, `.creator-avatar` → avatar. Note: some Stan content is JS-hydrated only; SSR HTML covers ~80%; parser falls back gracefully.
- **Eng effort:** **S** (2-3 days).
- **Dependencies:** F-PREVIEW-001/003.
- **MVP/Y1/Y2:** **M+0.5 — week +2 post-launch.**
- **Test surface:** price propagation in USD + JS-hydration gap handled gracefully.

### 3a M+0.5.3 — F-PREVIEW-012 · Bio.link HTML parser (M+0.5 — week +2 post-launch)

- **Summary:** Parser module for `https://bio.link/<handle>` — clean semantic HTML, easiest to parse. Bio.link has ~3M handles.
- **Implementation:** Standard semantic HTML (`<a class="link-item">` with title + URL). Simplest of all parsers; expected 1.5 days eng.
- **Eng effort:** **S** (2-3 days).
- **Dependencies:** F-PREVIEW-001/003.
- **MVP/Y1/Y2:** **M+0.5 — week +2 post-launch.**
- **Test surface:** handles with 1 link vs. 20+ links parse cleanly.

---

## 3b. Custom Domain System (NEW SECTION — replaces v1 F-060 single unit)

v1 had `F-060` as one M-sized unit. Reality per `infra-architecture-v2.md` §3.1: custom domains via Cloudflare for SaaS is a 3-unit system (verification UX + Cloudflare API integration + Stripe metered billing). Splitting it makes eng planning honest.

### 3b.1 — F-CUSTOM-DOMAIN-001 · CNAME verification + DNS instructions UX

- **Summary:** Creator enters `yourdomain.com` in `Settings → Custom Domain` → UI shows DNS instructions ("add CNAME `yourdomain.com` → `domains.tadaify.com`") → polls verification every 30s → surfaces status (pending / verifying / active / failed).
- **Why:** Creator UX for the domain-claim flow. Table stakes; Linktree / Beacons both ship; we need to ship it better (PL creators, clearer instructions).
- **Competitor baseline:**
  - Linktree: CNAME + TXT verification. Instructions assume US registrar (GoDaddy screenshot).
  - Beacons: CNAME only. Brief instructions.
  - Lnk.bio: CNAME; $39.99/yr.
- **Behavior:**
  - Settings page with input `yourdomain.com` (validated as hostname).
  - On submit: row inserted in `custom_domains` with status `pending`. UI shows DNS instructions with registrar-specific copy (auto-detect: OVH PL / Cloudflare / GoDaddy / Namecheap via WHOIS nameserver lookup). Bilingual EN+PL instructions.
  - Poll `POST /api/custom-domain/:id/verify` every 30s for up to 60 min; on success status → `verifying` (Cloudflare SaaS API response pending SSL) → `active`.
  - On failure at 60min: status → `failed` with error text; creator can retry.
  - Status surfaced in dashboard widget on every page load until active.
  - Apex (`@`) vs subdomain (`www`): apex requires ALIAS/ANAME (not all registrars support) or CNAME flattening (Cloudflare DNS free) — instructions detect and show appropriate path.
- **Data model:**
  - `custom_domains(id uuid pk, user_id fk → profiles, domain text unique, status text CHECK IN ('pending','verifying','active','failed','suspended'), cloudflare_custom_hostname_id text, ssl_status text, verified_at, last_error text, created_at, updated_at)`
  - RLS: creator can CRUD own; admins can read all.
- **Interfaces / APIs:**
  - `POST /api/custom-domain` — create; returns id + instructions.
  - `POST /api/custom-domain/:id/verify` — trigger verification check (calls F-CUSTOM-DOMAIN-002 API).
  - `DELETE /api/custom-domain/:id` — remove; triggers Cloudflare API removal.
  - `GET /api/custom-domain` — list own.
- **Tier gating:**
  - Free: 0 domains included. Creator buys first domain via `F-CUSTOM-DOMAIN-003` add-on ($3/mo).
  - Creator $5: 1 domain included. Additional domains at $3/mo each.
  - Pro $15: 3 domains included.
  - Business $49: unlimited domains.
- **Eng effort:** **M** (1.5 weeks — UX + polling + registrar detection + bilingual copy).
- **Dependencies:** F-CUSTOM-DOMAIN-002 (API layer); F-CUSTOM-DOMAIN-003 (billing).
- **MVP/Y1/Y2:** **MVP — Week 6-8.**
- **Test surface:**
  1. Create domain → pending state → CNAME set in DNS (test via Cloudflare DNS) → within 60s → verifying → within 3min → active.
  2. Invalid domain syntax → rejected at validator.
  3. Domain already claimed by another tadaify creator → "Domain taken" error.
  4. Retry after failed verification → fresh attempt works.
  5. Delete domain → Cloudflare hostname removed; row deleted.
- **Open questions:**
  - Do we support apex via Cloudflare DNS free? v2 answer: yes, include "use Cloudflare free DNS and set A record to our IP" as the apex path.

### 3b.2 — F-CUSTOM-DOMAIN-002 · Cloudflare for SaaS API integration

- **Summary:** Supabase Edge Function wraps Cloudflare's Custom Hostnames API — on create_domain: POST `/zones/<zone-id>/custom_hostnames` with `{hostname, ssl: {method: 'http', type: 'dv', settings: {min_tls_version: '1.2'}}}`; polls status; on active: stores `cloudflare_custom_hostname_id` + flips row status.
- **Why:** We can't hand-hold SSL provisioning; Cloudflare for SaaS does it automatically in <5min for CNAME'd domains.
- **Competitor baseline:** Linktree + Beacons use similar Cloudflare for SaaS or AWS ACM + CloudFront multi-tenant. Nothing bespoke; category convergence.
- **Behavior:**
  - Edge Function `cf-custom-hostname` with methods: `create`, `delete`, `status`.
  - On `create`: validates domain + user's tier quota (via `custom_domain_quota(user_id)` RPC) → calls Cloudflare API → stores hostname id.
  - Cloudflare webhook → Edge Function `cf-webhook-domain-status` → updates row status.
  - On `delete`: Cloudflare API DELETE + row status → `removed`.
  - Error handling: exponential retry (200ms/1s/5s/30s) on Cloudflare 5xx; permanent failure logs + surfaces to creator.
- **Data model:** uses `custom_domains` table from F-CUSTOM-DOMAIN-001.
- **Interfaces:**
  - Internal: Edge Function `cf-custom-hostname` with RPC-like body.
  - External: Cloudflare API v4 `/zones/<zone-id>/custom_hostnames`.
- **Tier gating:** enforced server-side via `custom_domain_quota()` RPC that counts active domains vs tier limit.
- **Eng effort:** **M** (1 week — Cloudflare API wrapper + webhook + quota enforcement + error paths).
- **Dependencies:** Cloudflare account with for-SaaS enabled (infra setup one-off); Cloudflare API token in Supabase Vault.
- **MVP/Y1/Y2:** **MVP — Week 6-8** (in parallel with F-CUSTOM-DOMAIN-001).
- **Test surface:**
  1. Create → Cloudflare Custom Hostname exists; our row has id.
  2. Delete → Cloudflare row gone.
  3. Quota exceeded (Creator tier with 2nd domain without paying $3 add-on) → rejected.
  4. Cloudflare 500 → retry 3x → eventually succeed.
  5. Cloudflare permanent 4xx (malformed domain) → logged; creator sees friendly error.
- **Open questions:**
  - What's our Cloudflare zone scheme? Single `tadaify.com` zone hosts all Custom Hostnames? Yes — per Cloudflare SaaS docs.

### 3b.3 — F-CUSTOM-DOMAIN-003 · Stripe metered billing integration

- **Summary:** $3/mo per add-on domain beyond tier quota — implemented as Stripe metered subscription with usage records incremented when `custom_domains` status goes `active` and decremented when deleted. Pro-rated mid-month.
- **Why:** Custom domain is the primary revenue driver (DEC-043); billing must be frictionless, honest, and match creator expectations.
- **Behavior:**
  - Stripe product `custom_domain_addon` with price $3/mo (metered by quantity).
  - When creator adds a domain beyond their tier quota:
    - UI shows "This will add $3/mo to your subscription. Confirm?"
    - On confirm: Edge Function `stripe-record-domain-usage` increments subscription item quantity.
  - When creator removes a domain that's billed: usage quantity decrements; proration credit applied at next invoice (or optional mid-month credit for customer-delight scenarios).
  - Dashboard surfaces: "Your domains: 2 / 3 included (Pro tier) — no extra charge" OR "Your domains: 4 / 3 included (Pro tier) — $3/mo for 1 additional".
- **Data model:**
  - `custom_domain_billing(user_id pk, stripe_subscription_item_id text, billed_quantity int, billed_at timestamp)` — mirror of Stripe state for reconciliation.
- **Interfaces:**
  - `POST /api/billing/custom-domain-usage` — internal; called on domain add/remove.
  - Stripe webhook `customer.subscription.updated` → reconcile `custom_domain_billing`.
- **Tier gating:** N/A (this IS the billing mechanism).
- **Eng effort:** **M** (1 week — Stripe metered config + Edge Function + dashboard UX + reconciliation).
- **Dependencies:** Stripe subscription infra (F-175 plan-gating); F-CUSTOM-DOMAIN-001/002.
- **MVP/Y1/Y2:** **MVP — Week 8-9.**
- **Test surface:**
  1. Free tier + add 1 domain → $3/mo charge applied at next billing cycle.
  2. Creator tier + add 2nd domain → $3 add-on charge.
  3. Remove a billed domain → proration credit at next invoice.
  4. Pro tier with 3 included + add 4th → $3/mo for 4th only.
  5. Downgrade Pro → Creator with 3 domains → warning: 2 domains will be billed at $3 each unless removed; user confirms; 2 domains added to metered subscription.
- **Open questions:**
  - Do we offer yearly pricing ($30/yr per domain = $2.50/mo effective)? v2 answer: MVP no, Y1 yes; price locks in at $30/yr with 2-month savings as the anchor.

---

## 4. Editor & Block System (gating updates)

v1 §4 spec stands for F-020 through F-049. The following gating flips apply per DEC-043:

| Unit | v1 gating | v2 gating |
|---|---|---|
| F-028 Product block | Pro | **Free** (commerce is free — but Stripe Connect onboarding required) |
| F-029 Community block | Pro | **Free** |
| F-030 Bundle block | Pro | **Free** |
| F-031 Countdown timer | Pro | **Free** |
| F-040 Featured highlight | Pro | **Free** |
| F-042 Form builder | Pro (Y1) | **Free (MVP)** — moved up because Free + commerce + forms = superior to Linktree Starter $8 |
| F-044 Geo-conditional block | Pro | **Free** |
| F-045 Device-conditional block | Pro (Y1) | **Free (Y1)** |
| F-046 A/B test per block | Pro (Y1) | **Pro (Y1)** — STAYS POWER FEATURE (`F-PRO-004`) |
| F-038 Version history | Pro (Y1) | **Pro (Y1)** — STAYS POWER FEATURE (`F-PRO-006`) |
| F-039 Multi-page support | Free 1 / Pro 5 / Biz ∞ | Free 1 / Creator 3 / Pro 10 / Business ∞ |

### 4a — Editor IA guideline (progressive disclosure)

The editor surfaces a **Getting Started** set of 6 blocks by default (link, image, text, product, social, email-capture). "More blocks" reveals the full 30+ catalogue on click. First-time creators never see the long list. AP-045 mitigated; AP-030 mitigated ("too many clicks" = avoided because the 6 defaults cover 90% of first-session use).

Everything else in v1 §4 unchanged.

---

## 5. Public Page Rendering (gating updates)

v1 §5 spec stands for F-050 through F-063. Gating flips:

| Unit | v1 | v2 |
|---|---|---|
| F-058 Password-protected pages | Pro | **Free** |
| F-060 Custom domain add-on | Free + €2-3 OR Pro | → REPLACED by `F-CUSTOM-DOMAIN-001..003` |

### 5a — F-058a · Creator-page visitor cookie consent (EU)

- **Summary:** When a creator has enabled any tracking (F-PRO-006 pixel whitelist, F-109 GA4/Meta/TikTok, affiliate UTMs), tadaify renders a granular cookie consent banner on the creator's public page for EU visitors. Auto-detected via Cloudflare `cf-ipcountry`. Creator can force-show global.
- **Why:** AP-036 + AP-037. Lnk.bio-style granular banner per PAT-078.
- **Behavior:**
  - Banner: "This page uses cookies for [analytics / pixels]. Accept all · Reject non-necessary · Customize."
  - Customize → per-category toggles with clear label ("Google Analytics — counts visitors", "Meta Pixel — ad targeting").
  - State stored in cookie; remembered 6 months.
  - Non-EU visitors: banner hidden by default; creator can toggle "always show".
- **Eng effort:** M (1 week).
- **MVP/Y1/Y2:** **MVP** (EU launch requirement).

F-050 hub renderer + F-051 per-product page move to Cloudflare Workers SSR (v2 architecture) instead of Next.js-on-Vercel (v1 implicit assumption). Implementation deltas:
- SSR framework: Hono or Cloudflare Workers raw fetch handler, not Next.js App Router.
- Cache invalidation: on Publish → tadaify Edge Function calls Cloudflare Cache API `purge` with tags `tenant:<handle>`.
- R2 direct-serve for media (avatars, thumbnails, hero banners) — signed URLs for private content (password-protected pages).

---

## 6. Commerce & Checkout (gating updates)

v1 §6 spec stands for F-070 through F-085. The single most important gating flip:

**Every commerce feature moves to Free.** Product creation, Stripe Connect onboarding, inline checkout, multi-currency, VAT auto-calc (Stripe Tax), order bumps, discount codes, reviews, hub aggregate trust score, order management, digital download delivery, magic-link buyer account, community subscriptions, refunds, BNPL (Klarna/Affirm — still Y1 due to Stripe config), Przelewy24+BLIK+SEPA — all Free.

Why this is economically safe: 2.9% + $0.30 Stripe fees are passed through to the creator (we take 0% platform fee).

**Payout SLA (contractual):** all creator earnings via Stripe Connect settle on Stripe Express default schedule (T+2 US / T+7 EU) or Custom (T+1). tadaify never holds creator funds. Affiliate commissions (F-PREVIEW referral, F-141 creator-referrals) settle T+14 via Stripe Connect payout. Any earnings > $5 are paid — no minimum-threshold-hold dark patterns (AP-019). Published on `trust.tadaify.com/payouts`.

Our only marginal cost on a commerce transaction is:
- One Edge Function invocation (~$0.0000002)
- Postgres writes for `orders` (~$0.0000001)
- Stripe webhook handler (~$0.0000002)
- Optional email send via Resend ($0.001)

**Total: ~$0.0012 per transaction.** Even a creator doing 1000 transactions/mo costs us $1.20. Pro/Business does NOT gate commerce — commerce is a loss-leader that keeps creators from ever switching to Stan or Beacons.

### What commerce features remain Pro-gated

- **F-PRO-003 — Advanced commerce analytics retention** (365d → lifetime revenue reports). Pro tier.
- **F-PRO-008 — Abandoned cart recovery email automation.** Pro tier.
- **F-BIZ-001 — Agency bulk product management.** Business tier.

The commerce core is Free. The analytics/automation on top of commerce is Pro/Business.

### PL/EU payment methods

F-085 Przelewy24 + BLIK + SEPA stays MVP, Free. No PL creator should ever see a paywall to accept BLIK from a PL buyer. This is the entire EU/PL wedge.

---

## 6a. Subtle Contextual Upsell System (NEW SECTION)

**Philosophy:** tadaify never blocks a creator from using features. It gently suggests the right tier based on signals (follower count, posting cadence, niche, traffic patterns). These hints are scattered naturally throughout the UI as informational nudges — NEVER popups, NEVER modals, NEVER forced upgrade paths.

> **Copy test:** "Would a creator screenshot this and mock tadaify on Twitter?" If yes, rewrite.

### 6a.1 — F-UPSELL-001 · Social signal collection during onboarding

- **Summary:** During IG/TikTok/YouTube import (DEC-SYN-02), record follower count, posting cadence, engagement rate, and platform mix into `creator_profile_signals` table.
- **Why it's in scope:** Every downstream upsell feature (F-UPSELL-002 through F-UPSELL-006) needs raw signals to reason from. Without this, tier recommendations are guesses. Collecting signals during the import flow already used by onboarding (F-002/F-007) adds zero extra creator friction.
- **Competitor baseline:** None of the 7 audited competitors collect follower data to inform tier suggestions rather than to gatekeep features.
- **Behavior:**
  - Creator connects IG → fetch public profile data (follower count, bio, recent posts).
  - Store: `creator_id`, `platform`, `handle`, `follower_count`, `post_count_90d`, `estimated_engagement`, `niche_guess`, `captured_at`.
  - Creator sees: "We noticed you have 500k followers on Instagram 🎉" — celebratory one-liner, NOT an upsell trigger.
  - Data is creator's own — exportable via GDPR export path, never sold.
- **Data model:** new table `creator_profile_signals (creator_id uuid fk → profiles, platform text, handle text, follower_count int, post_count_90d int, estimated_engagement numeric, niche_guess text, captured_at timestamptz, pk(creator_id, platform, captured_at))`.
- **Privacy:** public-profile data only; no scraping of non-public content.
- **Tier gating:** Free (baseline for all — signals power recommendations for every tier).
- **Eng effort:** **M** (3-5 days).
- **Dependencies:** F-002 (platform import), F-007 (social import OAuth).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Connect IG with 500k followers → `creator_profile_signals` row created with correct follower_count.
  2. Connect with private IG account → graceful fallback (null follower_count, no error surfaced to creator).
  3. GDPR export includes `creator_profile_signals` rows.
- **Open questions:** If the platform API changes rate limits, do we cache the last-known signal for 30 days before expiring? v2 recommendation: yes, 30-day stale-signal retention.

### 6a.2 — F-UPSELL-002 · Tier recommendation engine

- **Summary:** Rules-based engine maps signals → recommended tier. Output: `recommended_tier`, `confidence`, `reasoning`. Consumed by F-UPSELL-003/004/006.
- **Why it's in scope:** Central reasoning layer so hint logic isn't duplicated across every surface. A single engine means calibration changes one place.
- **Competitor baseline:** None ship this; all competitors use hard-coded paywall cutoffs, not signal-based recommendations.
- **Behavior:**
  - Input: creator signals from `creator_profile_signals`.
  - Output: one of `{Free, Creator, Pro, Business}` + `confidence` (0–1) + natural-language `reasoning`.
  - Example: `(Creator, 0.87, "You have 500k+ followers on Instagram — creators with your reach usually benefit from the custom domain included in Creator.")`.
  - Thresholds (initial calibration; refine with A/B data):
    - **Free**: <10k combined followers, low post cadence (hobby creator).
    - **Creator**: 10k–500k, active creator brand.
    - **Pro**: 500k–5M, professional creator; OR agency pattern detected (multi-client signals).
    - **Business**: >5M or explicit agency signals.
  - Queried by: signup flow (F-UPSELL-004), dashboard welcome card, analytics sidebar, billing page, viral-moment celebrator (F-UPSELL-006).
- **Engineering:** **S** (2-3 days) — simple rules engine, no ML needed for MVP; iterate heuristics with data.
- **Tier gating:** Infrastructure feature — not a creator-facing tier; runs for all tiers.
- **Eng effort:** **S** (2-3 days).
- **Dependencies:** F-UPSELL-001.
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Creator with 600k IG followers → engine returns `(Pro, ≥0.80, …)`.
  2. Creator with 5k followers → returns `(Free, ≥0.90, …)`.
  3. Creator with no connected platform → returns `(Free, 0.5, "No social signals detected — our best guess for new creators.")`.
  4. Engine called twice within same session uses cached result (no re-query).

### 6a.3 — F-UPSELL-003 · Contextual tier hints scattered in dashboard

- **Summary:** Small info chips (💡 icon) placed naturally across dashboard surfaces. Never popups. Never modals. Never banners. Never blocking.
- **Why it's in scope:** Linktree reviews cite "aggressive upsell" as a top-3 churn reason. A non-blocking hint system is the primary behavioral differentiator in the upgrade funnel (see §N+7 competitive positioning).
- **Competitor baseline:** Linktree shows upgrade modals on feature click (blocking). Beacons shows inline banners. Neither system is signal-aware.
- **Behavior:**
  - **Analytics page sidebar:** small card "💡 Pro users see 365-day trends. Your current audience pattern could benefit." — shown when creator is on Free/Creator with high view count.
  - **Custom-domain setup card (if domain not added):** "💡 Creator plan includes 1 free domain ($3/mo saved)".
  - **Billing page:** small sidebar comparison chart with "💡 Based on your 500k followers, Creator is most common for creators with your reach" tag.
  - **Welcome tour step 4/5:** one line: "For your audience size, most creators choose Creator." — NOT forced, just informational.
  - **Empty states** (e.g., no custom domain set): subtle hint "Creator plan includes 1 domain free".
  - Each hint is dismissible (remember dismissal for 90 days).
  - Rate-limited: max 1 hint per dashboard session.
  - A/B testable (hint wording + placement via feature-flag).
  - Each hint exposes a "Why am I seeing this?" link → shows `reasoning` from F-UPSELL-002.
- **Anti-patterns (DO NOT implement):**
  - No fake urgency ("only 48 hours left")
  - No fake scarcity ("2 people just upgraded")
  - No popups interrupting creator flow
  - No modals blocking any action
  - No countdown timers
  - No aggressive CTAs ("Upgrade NOW!")
- **Engineering:** **M** (1 week) — hint placement system + dismissal tracking + A/B infrastructure.
- **Tier gating:** Infrastructure feature; hints shown based on current tier vs recommended tier gap.
- **Eng effort:** **M** (1 week).
- **Dependencies:** F-UPSELL-001, F-UPSELL-002.
- **MVP/Y1/Y2:** **MVP** (critical differentiator — Linktree reviews cite aggressive upsell as churn driver; we exploit the opening).
- **Test surface:**
  1. Creator on Free with 200k followers → analytics sidebar shows 💡 hint within one dashboard session.
  2. Creator dismisses hint → hint gone for 90 days → reappears after 90 days.
  3. Rate limit: creator refreshes dashboard 5× in one session → hint not repeated.
  4. "Why am I seeing this?" click → shows `reasoning` string from engine.
  5. Creator with no signals → no hints shown (engine confidence <0.5 threshold suppresses hints).

### 6a.4 — F-UPSELL-004 · Signup form tier recommendation badge (NOT pre-selection)

- **Summary:** If creator signs up via social import with >100k followers detected, SHOW a "Recommended for your audience size" badge next to the Creator tier radio. DEFAULT selection STAYS Free. Creator consciously picks paid.
- **Why it's in scope:** Signal-based recommendations help creators find the right tier faster. Default-pre-selection would be AP-047 — structurally the same as PAT-034 / default-choice-architecture weaponized against the creator's intent.
- **Competitor baseline:** Linktree defaults to Free on signup with no pre-selection. Beacons defaults to Free. Neither adapts to incoming signals. We adapt but never override the creator's default.
- **Behavior:**
  - Signup flow step "Pick your plan": 4 radio options (Free / Creator / Pro / Business). Default radio: **Free**, always, regardless of signals.
  - If signals detect >100k followers → show a subtle 💡 "Recommended for your audience size" badge next to Creator tier. Never the radio-checked state.
  - Subtle explanation under the badge: "Creators with 100k+ followers often choose Creator — you can always switch later."
  - No A/B test of default-pre-select variant. We commit to "Free is the default, period."
  - If signals detect <10k followers or no connection → no badge shown; plain Free radio default.
  - If creator is on Free and later connects IG (post-signup), dashboard hint chip follows F-UPSELL-003 rules — never a plan-switch default.
- **AP-047 hard guard:** No variant of this feature may ever pre-check a paid radio. If A/B infrastructure is configured, the control group is always "Free pre-checked, badge only".
- **Tier gating:** Signup flow — not a per-tier feature.
- **Eng effort:** **S** (1 day — replaces pre-select logic with badge only).
- **Dependencies:** F-UPSELL-001, F-UPSELL-002, signup flow (F-001/F-002).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Signup with IG handle that has 500k followers → Free radio pre-selected; Creator has "Recommended" badge; Creator is NOT pre-checked.
  2. Creator consciously selects Creator → Creator applied.
  3. Creator ignores badge, continues with Free → Free applied, no modal or friction.
  4. Signup with no social connection → Free pre-selected, no badge.
  5. Signup with 5k followers → Free pre-selected, no badge (below threshold).
  6. Attempt to A/B test with Creator pre-checked variant → feature flag check blocks it (hard guard).

### 6a.5 — F-UPSELL-005 · Peer-creator benchmarking

- **Summary:** Dashboard analytics surfaces aggregated peer-creator stats as social proof — e.g., "Creators with 100k-500k followers see average 3.2% engagement on their bio link."
- **Why it's in scope:** Exclusive Pro-tier insight that is a genuine data moat (requires N≥1000 creators per cohort to be statistically valid). Strengthens the $15 Pro justification (see §N+9 Pro tier analysis row 9).
- **Behavior:**
  - Placed in analytics dashboard as "Benchmark" cards alongside creator's own metrics.
  - Data source: anonymized aggregates from our own user base; minimum 100 creators per cohort; refreshed weekly.
  - Privacy: never identifies specific creators; cohort-based only.
  - Creator can collapse "Benchmark" section if they prefer minimal UI.
  - Examples:
    - "Creators with 100k-500k followers see average 3.2% engagement on their bio link."
    - "Creators at your audience size use custom domains 68% of the time."
    - "Creators upgrading from Free to Creator report 12% more clicks on their primary CTA."
- **Tier gating:** **Pro** (benchmark data is a paid insight — data moat only platforms with large N can offer).
- **Eng effort:** **M** (1 week) — aggregate calculation job + dashboard card UI.
- **Dependencies:** F-UPSELL-001 (follower cohort bucketing), F-PRO-001 (analytics infra), minimum user base of ~1k creators.
- **MVP/Y1/Y2:** **Y1** (M+2 or later — needs user base for statistically valid cohorts; MVP cohorts would be too small to surface accurate benchmarks).
- **Test surface:**
  1. Pro creator with 200k followers → Benchmark cards visible in analytics dashboard.
  2. Free creator → Benchmark section not shown (Pro gate).
  3. Cohort <100 creators → Benchmark card not shown (insufficient sample guard).
  4. Creator collapses Benchmark section → preference persisted across sessions.

### 6a.6 — F-UPSELL-006 · Post-viral moment awareness

- **Summary:** When analytics detect a viral moment (sudden traffic or follower spike), show a one-line celebratory message that subtly suggests Creator tier.
- **Why it's in scope:** Viral moments are peak intent-to-upgrade moments — creator is already excited and thinking about growth. This is the highest-signal conversion opportunity that doesn't require any creator-initiated action.
- **Competitor baseline:** No competitor ships viral-moment awareness. Linktree shows generic upsell banners; neither Beacons nor Stan is event-reactive.
- **Behavior:**
  - Trigger: daily analytics rollup detects one of:
    - View count >3× 30-day rolling average.
    - Unique visitors >5× 30-day rolling average.
    - Social referrer (IG/TikTok) spike >5×.
  - Display: small celebratory banner (dismissible): "🎉 Your traffic tripled yesterday! Creators often upgrade to Creator plan during viral moments to add a custom domain — makes sharing in your bio cleaner."
  - Shown once per viral event; NEVER repeated for the same event.
  - 30-day cooldown between viral messages (anti-spam).
  - A/B copy variants:
    - V1: "🎉 Your traffic tripled yesterday! Creators often upgrade to Creator plan during viral moments for a custom domain."
    - V2: "📈 Viral moment detected. Consider adding a custom domain — creators do this during their first viral post."
    - V3: "Your numbers went big today. Custom domain (Creator plan, $5/mo) makes it stickier."
- **Tier gating:** Shown to Free and Creator creators (Pro/Business already have domains).
- **Eng effort:** **M** (1 week) — viral detection job + message queue + dismissal tracking.
- **Dependencies:** F-UPSELL-001, F-100 (event tracking), analytics rollup job (F-PRO-001 adjacent).
- **MVP/Y1/Y2:** **MVP** (marketing lever — viral moments are prime upgrade opportunities; cost: 1 week eng).
- **Test surface:**
  1. Simulate 4× traffic spike in rollup job → banner appears next dashboard load.
  2. Creator dismisses banner → not shown again for same event.
  3. Two viral events within 30 days → only the first triggers a message (cooldown).
  4. Pro creator (already has domain) → banner not shown.
  5. A/B variant assignment is stable per-session (not randomized on each load).

### Cross-cutting copy guidelines for the upsell system

These apply to every hint, banner, and recommendation surface across F-UPSELL-001 through F-UPSELL-006:

1. **Always suggest, never demand.** Language patterns: "You might find...", "Many creators pick...", "Consider...". Never: "You must...", "Upgrade now to...", "You've exceeded...".
2. **Transparency.** Always explain WHY a hint is shown. Creator can click "💡 Why am I seeing this?" to see their signals (powered by F-UPSELL-002 `reasoning` field).
3. **Dismissible by default.** Every hint has an × button. Dismissals remembered 90 days. Creator can reset via Settings → "Show me recommendations again".
4. **Opt-out supported.** Settings → Account → "Less suggestions" toggle. Respected immediately with no re-prompt.
5. **Match the moment.** No upsell hints during active checkout flow, editor save, or crash recovery path.
6. **Mobile-friendly.** Hints on mobile: one-line max, bottom of screen, never covers nav.

### Revenue impact (upsell system)

Subtle upsell done well can raise Free→paid conversion by 1.5-3× (Slack, Notion, Linear benchmarks). At 10k MAU with 1.5% baseline conversion → 150 paying. With subtle upsell: projected 3% → 300 paying. Delta = 150 extra Creator-tier signups × $5 = $750/mo extra MRR at 10k MAU. At 100k MAU: $7,500/mo extra MRR. Major lever at zero marginal hosting cost.

---

## 6b. Creator Tier Composition (updated — anti-patterns-audit-2026-04-24)

Creator at $5/mo earns its $2 premium above the $3 domain add-on through 8 concrete features — NONE involving "Powered by tadaify removal" or any AP-001 variant.

| Feature | Tier | Eng effort |
|---|---|---|
| 1 custom domain included | Creator | 0 (built per DEC-038) |
| Analytics retention 180d (vs Free 90d) | Creator | 0 (flip `hasFeature` + Athena query range) |
| AI generations 40/mo (vs Free 20) | Creator | 0 (quota config) |
| Priority support 24h SLA (vs Free 48h) | Creator | 0 (SLA routing) |
| Custom favicon upload | Creator | 1d (storage + render path) |
| Scheduled block publishing | Creator | 4-5d (cron + editor UI) |
| Verified creator badge (2FA + social OAuth, NOT purchase-gated per AP-048) | Creator | 2d (verification logic + badge UI) |
| Directory listing opt-in (`tadaify.com/directory`) | Creator | 0 (opt-in flag; directory is Free feature; opt-in is Creator) |
| Seamless Free-with-domain → Creator upgrade (same DB row, zero DNS re-setup) | Creator | 0 (correct design; high perceived polish) |

**Total new eng: ~8 days.** Fits within MVP budget.

**Upgrade flow (ORIGINATE polish):** When a creator upgrades from Free+domain-addon ($3) to Creator ($5), domain seamlessly migrates — same DB row, no DNS re-verification, no downtime. Beacons/Linktree treat tier upgrades as new transactions; we make it one atomic flow.

**Creator messaging (pricing page):**
> "Your own domain. Priority support (24h). Twice the AI credits. Longer analytics memory (180d). Custom favicon. Scheduled publishing. Verified creator badge. Listed in the tadaify directory. Everything you got on Free — still free. We just added the features that feel like the first real upgrade."

**Anti-pattern checklist (pre-ship):**
- No AP-001 — no branding removal as benefit (tadaify has no footer branding on ANY tier).
- No AP-047 — no default pre-selection (badge only per F-UPSELL-004 update).
- No AP-031 — no persistent upgrade banner (hint chips per F-UPSELL-003).
- No AP-050 — analytics / commerce / CRM basics remain Free.

---

## 7. Analytics & Insights (gating updates)

v1 §7 had 28d Free / 365d Pro / all-time Business retention. v2 per DEC-043:

| Unit | v1 gating | v2 gating |
|---|---|---|
| F-100 Event tracking | Free 28d | **Free 90d** (still metered but generous) |
| F-101 Analytics overview dashboard | Free 28d basic / Pro 365d / Biz all | **Free 90d full** / **Creator 180d** / Pro 365d (`F-PRO-001`) / Business all-time |
| F-102 Per-block click analytics | Free | **Free** (full depth all blocks) |
| F-103 Revenue analytics | Pro | **Free** (90d); Pro 365d (`F-PRO-001`) |
| F-104 Revenue attribution per link | Pro | **Free** (90d); Pro 365d (`F-PRO-001`) |
| F-105 Data export CSV | Pro | **Free** (last 90d); Pro all-time (`F-PRO-002`) |
| F-107 Top 10 vs full | Free 10 / Pro full | **Free full** (depth is cheap) |
| F-108 Conversion funnel | Pro (Y1) | **Pro (Y1)** — stays in `F-PRO-007` |
| F-109 GA4 / Meta / TikTok pixel | Pro | **Free** |
| F-112 Weekly email digest | Free basic / Pro deep | **Free deep** |

Retention of 90d on Free is still cheap — Cloudflare Analytics Engine retains 90 days by default at zero incremental cost. After 90 days, events flush to S3 + Athena (AWS cold tier). Pro gets Athena-backed 365d window + CSV all-time export; Business gets all-time dashboard queries.

**Net: analytics is no longer a Pro upgrade driver except for retention window + all-time export + funnel + cohort.** This is fine — those are real needs of creators with ≥1k monthly visitors, which is exactly the Pro target segment.

---

## 8. Email & Audience (gating updates)

v1 had campaign builder as Pro. v2:

| Unit | v1 | v2 |
|---|---|---|
| F-115 Subscriber list | Free list / Pro send | **Free list + send** (capped: 1k sends/mo Free) |
| F-118 Campaign builder | Pro | **Free** (up to 1k sends/mo); Pro 10k/mo (`F-PRO-005`); Business 100k/mo |
| F-119 Automated drip | Pro (Y1) | **Pro (Y1)** — in `F-PRO-005` |
| F-120 Cart-abandon recovery | Business (Y1) | **Pro** — in `F-PRO-008` |
| F-121 ESP integrations | Pro | **Free** (OAuth connect Mailchimp/Kit/Beehiiv — creator's own account, no tadaify cost) |

Resend cost: $0.001/email × 1k/mo/free-creator × 10k active creators = $10/mo baseline. Bearable.

---

## 9. Growth Loops (unchanged from v1 — all Free)

F-125..F-139 all Free as in v1. F-131 "brag stats public counter" flipped from Pro to Free.

---

## 10. Customization & Theming (gating updates)

v1 §10 spec stands. Gating flips:

| Unit | v1 | v2 |
|---|---|---|
| F-142 Font selector | Free 8 / Pro custom | **Free 20** / Pro custom upload (`F-PRO-006`) |
| F-145 Custom favicon | Pro | **Free** |
| F-146 Custom CSS/HTML | Business (Y1) | **Pro (`F-PRO-006`)** — moved down; real power feature |
| F-148 Entrance animations | Free 5 / Pro 55 | **Free 20** / Pro 60 (`F-PRO-007`) |
| F-153 Per-block color override | Pro | **Free** |

F-146 custom CSS move to Pro is deliberate — this is a genuine power feature worth $10/mo extra (Linktree Premium $30 has this).

---

## 11. Templates & Starters (unchanged)

F-165..F-169 all Free as in v1. v2 adds **template count target: 20 MVP templates** (up from 8-12) because templates are also Free and feed the category-filter SEO pages (`F-252` vs-pages).

---

## 12. Trust / SLA / Platform (unchanged from v1 §12 apart from F-170 replacement)

F-170 "custom domain billing" replaced by `F-CUSTOM-DOMAIN-001..003` (see §3b). F-171 through F-179 stand.

### 12a — F-172a · Published zero-fee + price-lock contract

- **Summary:** Trust Center page at `trust.tadaify.com/price-lock` + per-subscription DB field `price_locked_until` (3 years from signup) + `fee_locked_until` (same) + quarterly billing audit to ensure no subscription is silently re-priced.
- **Behavior:**
  - Public page lists the commitment verbatim: "Your price is locked at the rate you signed up at, for 3 years. If we ever raise prices, your subscription stays at your signup rate until your price-lock window ends. If you delete your subscription and resubscribe later, you re-lock at then-current price."
  - DB: `subscriptions.price_locked_until TIMESTAMPTZ`, `subscriptions.fee_locked_until TIMESTAMPTZ`.
  - Quarterly cron reconciles Stripe prices vs locked prices; any drift → PagerDuty.
  - Billing UI shows creator their own `price_locked_until` date.
- **Tier gating:** Applies to every tier.
- **Eng effort:** S (2-3 days — db field + cron + page + UI row).
- **MVP/Y1/Y2:** **MVP** (commitment is credible from day 1, not added at month 6).
- **Dependencies:** F-175 subscription infra.
- **Test surface:**
  1. Creator signs up at $5/mo → `price_locked_until = now() + interval '3 years'`.
  2. Tadaify raises list price → existing creator's Stripe price unchanged via `ignore_changes` on subscription item; new signups pay new price.
  3. Price-Lock page loads + renders the commitment verbatim.

### 12b — F-175a · Creator page stays live during dunning + no platform-shame overlay

- **Summary:** If creator's subscription fails (card expired, chargeback), their public page stays fully live. There is NO platform-branded message visible to buyers ("The owner did not pay" — AP-029 Taplink). Creator receives dunning emails privately. Subscription-dependent features (F-PRO-006 custom CSS) continue serving for a 14-day grace window. After grace, those features revert but core page + commerce stay live forever (Free tier by definition doesn't depend on subscription).
- **Why:** AP-029 — Taplink's public "did not pay" text is the cautionary tale. We commit publicly to the opposite.
- **Eng effort:** S (extends F-175 billing infra).
- **MVP/Y1/Y2:** **MVP**.

### 12c — Data ethics baseline (AP-038)

- We never sell creator or visitor data to third parties.
- We never share creator content with LLMs for training.
- Aggregate analytics (F-UPSELL-005 peer benchmarks) are per-cohort anonymized; N≥100 creators per cohort minimum.
- Published on `trust.tadaify.com/data-ethics`.

### Feature-preservation commitment (AP-042)

Once a feature is shipped at a given tier, it stays at that tier or moves cheaper — never more expensive. If tadaify later decides a Free feature needs to be Creator-tier, existing users keep the feature on Free forever; only new signups see the new tier gate. Published on Trust Center. Enforced via grandfathering fields in `user_features` table.

### 12d — F-TRUST-001 · `/trust` page — publishing 0% fee commitment + price-lock contract + SLA adherence

- **Summary:** Public Trust Center at `trust.tadaify.com` (or `/trust` on main domain) aggregates all contractual commitments in one place: zero fees, price lock, SLA targets vs actuals, payout SLA, data ethics baseline, content policy link, Creator Safeguard link.
- **Tier gating:** None — public page, no auth.
- **MVP/Y1/Y2:** **MVP** (trust-at-launch is competitive positioning, not a post-launch add-on).
- **Eng effort:** S (1-2 days — static page with live data for SLA actuals + uptime widget).

### 12e — F-TRUST-002 · `profiles.fee_locked_until` column

- **Summary:** DB artifact: `profiles.fee_locked_until TIMESTAMPTZ` — set to `now() + 3 years` at signup, updated on tier change. Billing webhook checks this; cannot charge platform fees while column is in future. Complements `subscriptions.fee_locked_until` at subscription level.
- **Tier gating:** All tiers.
- **MVP/Y1/Y2:** **MVP**.
- **Eng effort:** XS (<1 day — migration + billing webhook guard).

### 12f — F-TRUST-003 · `profiles.price_locked_until` column

- **Summary:** DB artifact: `profiles.price_locked_until TIMESTAMPTZ` — set at signup, referenced in Stripe subscription update guard. Billing webhook verifies no price change before `price_locked_until`. Implements DEC-SYN-06 at DB level.
- **Tier gating:** All tiers.
- **MVP/Y1/Y2:** **MVP**.
- **Eng effort:** XS (<1 day — migration + billing webhook guard).

### 12g — F-TRUST-004 · ToS clause — 3-year price-lock + 0% fees (linked from `/trust`)

- **Summary:** Terms of Service includes explicit clause: "tadaify commits to charging 0% platform fees on all creator product sales for the lifetime of the platform. Your subscription price is locked at your signup rate for 3 years." Link from Trust Center to relevant ToS section. No fine print. No carve-outs.
- **Tier gating:** None — ToS is platform-wide.
- **MVP/Y1/Y2:** **MVP**.
- **Eng effort:** XS (legal drafting + ToS update).

---

## 13. Admin & Trust (unchanged — all MVP, all ports from LinkOfMe)

F-180..F-191 as in v1 §13.

### 13a — F-180a · One-click subscription cancellation

- **Summary:** Billing → Cancel subscription → single confirmation modal with ONE reason dropdown (optional) and one "Cancel my subscription" button. No survey. No retention offer modal cascade. No "are you sure? still sure? really sure?".
- **Why:** AP-010 (multi-step cancel is Beacons' top-10 complaint). Respecting creator time = trust. Retention comes from product quality, not friction walls.
- **Behavior:**
  - "Cancel subscription" button in Billing.
  - Confirmation modal: "Cancel? Your current period continues until [date]; no further charges. Optional: Tell us why (dropdown of 6 options + Other)."
  - ONE button: "Confirm cancel".
  - Subscription status → `cancel_at_period_end = true`; Stripe handles the rest.
  - Reactivation: single button in Billing up until `current_period_end`.
  - Post-cancel email: receipt of cancel + reactivation link.
- **Anti-pattern guardrails:**
  - NO multi-step survey.
  - NO retention modal ("Wait! Here's 50% off!"). That's AP-010.
  - NO "Pause instead?" nudge — offer pausing in the same modal as one radio option, don't chain it.
- **Eng effort:** S (2 days).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:** 1 button + 1 confirmation = subscription canceled. Time-to-cancel from Billing page ≤3 seconds.

### 13b — F-191a · Plain-Language Content Policy page + examples-rich do/don't list

- **Summary:** Public page `/trust/content-policy` with plain-English allowed/disallowed categories, real examples per category, and visual "what a borderline case looks like" panels. Linked from signup + every moderation-related email.
- **Why:** AP-026 — every competitor has a lawyer-ese content policy that creators can't read. Transparent moderation starts with a readable policy.
- **Behavior:**
  - Sections: Allowed (creator commerce, adult content YES/NO, health/wellness, political commentary, harm-reduction, crypto, etc.), Disallowed (CSAM, clear hate speech, verified fraud, dangerous misinformation), Borderline (specific examples with tadaify's call).
  - Each borderline case has a YES/NO verdict plus reasoning.
  - Last-updated timestamp + changelog visible.
  - Search within policy.
- **Eng effort:** S (3 days — static page + CMS + changelog).
- **MVP/Y1/Y2:** **MVP** (Trust is launch-critical).
- **Dependencies:** none.
- **Test surface:** content policy loads; each borderline example has a verdict; changelog shows ≥1 entry.

### 13c — F-191b · Creator Safeguard — 48h warning + human appeal + prepaid refund

- **Summary:** Codifies DEC-SYN-05 as a committed contract. For any moderation action beyond a single-block hide:
  1. 48h notice in creator's inbox + email BEFORE any account-level action (ban / suspend / hold).
  2. Human-reviewed appeal via dedicated queue (linkofme-inherited `admin_appeals`).
  3. If appeal fails AND creator prepaid annually: automatic refund of unused months via Stripe refund API.
  4. If appeal succeeds: account restored to pre-action state within 4h.
- **Why:** AP-005 + AP-027 + AP-028 combined. Creator trust wedge per positioning-gaps A3.
- **Behavior:**
  - Creator gets email: "Your tadaify account is scheduled for [action] on [date+48h]. Reason: [summary]. Appeal here."
  - Appeal form + human reviewer within SLA.
  - Stripe refund on ban-with-prepay calculated: `(months_remaining / total_months) × annual_price`, processed within 14 days.
- **Eng effort:** M (1 week — extends `admin_appeals` + refund cron).
- **MVP/Y1/Y2:** **MVP** (launch-critical trust feature).
- **Test surface:** prepay creator gets banned → refund queued within 14 days; appeal succeeds within 4h → account restored.

---

## 14. Integrations & API (gating updates)

v1 §14 spec stands. Gating flips per DEC-043:

| Unit | v1 | v2 |
|---|---|---|
| F-200 Public REST API | All tiers diff limits | **Free 100 req/hr** / Pro 1k req/hr (`F-PRO-004`) / Business 10k req/hr |
| F-201 Webhooks | All tiers | **Free 3 webhooks** / Pro 10 (`F-PRO-004`) / Business 100 |
| F-203 Zapier integration | Free | **Free** (Zapier handles their own rate limits) |
| F-206 Deep OAuth integrations | Pro | **Free** (Mailchimp/Kit/GA4 all free to connect) |

API is a Pro power feature (`F-PRO-004`) because higher rate limits + more webhooks are genuinely expensive infra-wise at scale (Supabase Edge Function invocations + webhook retry queue). Ship Free API with meaningful quota; Pro for volume.

---

## 15. AI Features (gating updates)

v1 had Free 5/mo / Pro 100/mo / Business ∞. v2 per DEC-043 generous-Free:

| Unit | v1 quota | v2 quota |
|---|---|---|
| F-220 AI product description | 5/mo/∞ | **20/mo** Free / **40/mo** Creator / 200/mo Pro (`F-PRO-002`) / ∞ Business |
| F-221 AI page copy | 5/mo/∞ | **10/mo** Free / **20/mo** Creator / 100/mo Pro / ∞ Business |
| F-222 AI thumbnail generator | 5/mo/∞ | **10/mo** Free / **20/mo** Creator / 100/mo Pro / ∞ Business |
| F-223 AI diff-approval UX | — | **Free** (UX pattern) |
| F-224 AI FAQ search | Y1 | **Y1 Free** |

Cost model at 10k creators: 20 gens × $0.005/gen × 10k × 0.3 (utilization) = $300/mo baseline on Free tier. Creator tier (40 gens) adds marginal cost covered by Creator subscription margin. Pro upgrades cover the rest.

---

## 16. EU/PL Localization (unchanged — all Free)

F-230..F-239 all Free MVP as in v1 §16.

---

## 17. Marketing Surfaces (unchanged)

F-245..F-254 all MVP as in v1 §17 with copy updated to reflect new pricing ladder.

---

## 18. Pro-tier Power Features (NEW SECTION — §N+9 target)

**This is the single most important section of v2.** The user asked: if every product feature is Free, what justifies $15/mo Pro (3× Creator $5)? Answer: 8 genuinely-useful, genuinely-expensive-to-build power features that only matter once a creator has a real audience. Each feature is evaluated against four criteria:
1. Useful for creators with real audience (not gimmick)
2. Expensive enough for us that it justifies the margin
3. NOT available on Free (doesn't cannibalize)
4. Demonstrably competitive vs Linktree $12 Pro / Linktree $30 Premium / Beacons Creator Plus $30

### 18.1 — F-PRO-001 · Analytics retention 365d + all-time dashboard + cohort analysis

- **Summary:** Free gets 90-day analytics window (Cloudflare Analytics Engine native). Creator gets 180-day window. Pro gets 365-day live dashboard (Athena-backed), cohort analysis (repeat-visitor segmentation over time), and funnel charts. Business gets all-time + benchmarks.
- **Why it's worth $10/mo extra:**
  - Linktree charges $12 Pro for 365d analytics (exactly our price point).
  - Linktree charges $30 Premium for lifetime/all-time.
  - A creator at 10k MAU generates ~1M events over a year — ~100MB Parquet in S3 × Athena scan cost = $0.50-$2/mo per creator infrastructure cost, so margin is solid but not absurd.
  - Cohort analysis is the #2 requested analytics feature in creator forums (after revenue breakdown, which is Free).
- **Competitor baseline:** Linktree Pro 365d, Premium lifetime. Beacons Creator Plus unlimited. We match Linktree Pro at Pro $15; match Premium at Business $49.
- **Behavior:**
  - Free tier `getAnalytics(range)` RPC caps range at 90 days (`now() - interval '90 days'`).
  - Creator tier same RPC caps range at 180 days; queries Athena for days 91-180.
  - Pro tier same RPC accepts range up to 365 days; queries Athena if range exceeds Analytics Engine's 90d retention.
  - Cohort view: new UI tab "Cohorts" — shows weekly cohort retention matrix (week 1 / week 4 / week 12 retention heatmap).
  - Business tier: all-time + benchmark comparison vs anonymized peer creators in same niche.
- **Data model:** uses `analytics_events` (Cloudflare) + `s3://tadaify-analytics/events/` (AWS cold) + Athena view `cohort_retention_by_creator`.
- **Interfaces:** `getAnalytics(range, granularity, metric)` RPC; Cohort view UI.
- **Tier gating:** enforced server-side via `hasFeature(user, 'analytics_365d')` check.
- **Eng effort:** **L** (2 weeks — Athena query plumbing + cohort SQL + UI).
- **MVP/Y1/Y2:** **MVP** (needed for Pro to be credible on day 1).

### 18.2 — F-PRO-002 · CSV/JSON export all-time + Google Sheets live sync

- **Summary:** Free exports last 90d as CSV. Pro exports all-time + supports Google Sheets live sync (every query result piped to a Sheet in real-time via OAuth). Business adds Looker Studio + Tableau connectors.
- **Why it's worth $10/mo extra:**
  - Power creators run their analytics in Sheets (pivot tables, combined data from multiple sources). Live sync eliminates manual CSV re-import every month.
  - Google Sheets API + OAuth + row updates is non-trivial eng (refresh tokens, sync frequency, rate limits).
  - Linktree Pro has "Data export" but not live Sheets sync — we originate here.
- **Competitor baseline:** Linktree Pro CSV export. Beacons no explicit. Stan Pro has audience-level export but not live sync. We originate.
- **Behavior:**
  - Export CSV: available to all tiers in dashboard, but capped at 90d on Free / 365d on Creator+Pro / all on Business.
  - Google Sheets sync: Pro+. Creator OAuths a Sheet; we write a hourly sync job that appends new rows of configured metrics.
- **Eng effort:** **M** (1.5 weeks — Sheets OAuth + sync scheduler + UI).
- **MVP/Y1/Y2:** **MVP** (lightweight differentiator).

### 18.3 — F-PRO-003 · Team seats (3 collaborators on Pro, 10 on Business)

- **Summary:** Invite up to 2 additional editors (Pro: 3 total seats) or 9 additional (Business: 10 total seats) per account. Editor role can edit blocks + theme + see analytics; Admin role can do everything except billing; Owner = billing.
- **Why it's worth $10/mo extra:**
  - Solopreneur → sub-agency growth path. A creator scaling to "I have a social media manager" needs this. Without it they share passwords (security nightmare) or upgrade elsewhere.
  - Role-based access + audit log = real eng (RLS policies + audit trail + invite flow + seat billing).
  - Linktree Premium $30 ships "Add Admins" — we match at Pro $15 (half the price).
  - Beacons doesn't ship per-account team seats at any tier (they ship Brands-as-customer, which is different).
- **Competitor baseline:** Linktree Premium $30. Beacons N/A. Carrd no. Stan no.
- **Behavior:**
  - Settings → Team → Invite member by email → role (Editor / Admin).
  - Invited user gets magic-link email; clicks → creates account OR links existing tadaify account.
  - Audit log: every action (`block.created`, `theme.updated`, `product.price.changed`) timestamped + author.
  - Billing: owner always pays; invited users don't need payment.
  - Seat revocation: owner revokes → access removed immediately; audit log preserved.
- **Data model:**
  - `team_memberships(id uuid pk, owner_user_id, member_user_id, role text CHECK IN ('editor','admin'), invited_at, accepted_at, revoked_at)`.
  - `team_audit_log(id, owner_user_id, actor_user_id, action text, resource_type, resource_id, payload jsonb, created_at)`.
- **Eng effort:** **L** (2-3 weeks — invite flow + RLS + audit log + UI).
- **MVP/Y1/Y2:** **MVP** (real differentiator; easy SEO "tadaify for agencies").

### 18.4 — F-PRO-004 · API + Webhook high-quota tier + API keys multi-scope

- **Summary:** Free gets 100 req/hr API + 3 webhooks. Pro gets 1000 req/hr + 10 webhooks + multi-scope API keys (read-only / write-orders / admin). Business gets 10k req/hr + 100 webhooks + SLA on webhook delivery.
- **Why it's worth $10/mo extra:**
  - API-savvy creators build automations (Zapier alternatives, custom dashboards, Discord bot integrations). 100 req/hr is too low for any real automation (Zapier Basic is 100 req/hr); 1000 req/hr supports a real automation.
  - Webhook delivery SLA + retries + dead-letter queue = real infra work.
  - Linktree offers NO public API at any tier (partner-only). We win this comparison at any tier, but Pro-tier volume is the upgrade driver.
- **Competitor baseline:** Linktree partner-only API. Beacons no public API. Stan no public API. We originate entirely.
- **Behavior:**
  - API keys: Settings → API → Create key → name + scopes + expiration. Show key ONCE, then hashed.
  - Rate limiting: Redis-backed sliding window in Cloudflare KV, per-key + per-user.
  - Webhook retries: exponential backoff 5s / 30s / 3min / 30min / 6h / 24h; max 6 attempts; dead letter queue visible in dashboard.
- **Data model:** `api_keys(id, user_id, name, hash, scopes text[], expires_at, last_used_at, revoked_at)`; `webhook_endpoints(id, user_id, url, events text[], secret, created_at)`; `webhook_deliveries(id, endpoint_id, event_id, status, attempts, last_attempt_at, response_code, response_body)`.
- **Eng effort:** **L** (2-3 weeks — key mgmt + scopes + retries + DLQ + dashboard).
- **MVP/Y1/Y2:** **MVP** (API is MVP per v1 F-200; quota tiering is the Pro lock).

### 18.5 — F-PRO-005 · Email marketing automations + 10k sends/mo + custom sender + segmentation

- **Summary:** Free gets 1k sends/mo + single broadcasts. Pro gets 10k sends/mo + automations (welcome sequence, birthday email, purchase follow-up) + segmentation (buyers vs lead-captures vs country) + custom sender domain (send from `hello@yourdomain.com` instead of `noreply@tadaify.com`).
- **Why it's worth $10/mo extra:**
  - 10k sends/mo = real creator email list territory (~1k engaged subscribers × 4 sends/mo × some growth).
  - Custom sender domain requires SPF/DKIM/DMARC setup per creator — real eng work + deliverability support.
  - Automations require a workflow engine (on-trigger + branching + state).
  - Linktree Pro has email integrations (Mailchimp, Kit) but no built-in sender. Beacons Creator Plus has unlimited email sends as the explicit headline power feature — we match at Pro $15.
- **Competitor baseline:** Beacons Creator Plus $30 unlimited sends. Linktree Pro integrations only. Stan Pro $99 has email. We match Beacons at half the price.
- **Behavior:**
  - Free: 1k sends/mo via `noreply@tadaify.com`; simple broadcast (pick segment, compose, send).
  - Pro: 10k sends/mo via custom domain (SPF/DKIM auto-configured on Cloudflare SaaS domain); automations UI (trigger → delay → email OR branch); segmentation builder (country, purchase history, subscription status, custom tag).
  - Business: 100k sends/mo + advanced segmentation (cohorts, LTV bands, inactivity triggers).
- **Data model:** `email_campaigns` (existing); `email_automations(id, user_id, name, trigger_event, steps jsonb, active bool)`; `email_sender_domains(user_id, domain, spf_status, dkim_status, verified_at)`.
- **Eng effort:** **XL** (3-4 weeks — workflow engine + sender domain verification + segmentation + UI).
- **MVP/Y1/Y2:** **MVP** (needed for Pro-tier credibility).

### 18.6 — F-PRO-006 · Custom CSS/HTML/JS + custom font upload + advanced code panel

- **Summary:** Pro unlocks a "Custom code" panel with sandboxed CSS, limited HTML, AND script tag whitelisting for analytics (GA4, Meta Pixel, TikTok, Hotjar, Mixpanel, Amplitude, PostHog, Plausible — 8 approved providers). Upload 1 custom font file (woff2, <200KB). Note: tadaify branding is NOT present on any tier's public pages — there is no "remove branding" toggle because there is no branding to remove (AP-001 hard-locked). F-BIZ-002 is the white-label feature for agencies who want "Powered by [AgencyName]" instead of a neutral footer.
- **Why it's worth $10/mo extra:**
  - Power creators want pixel-level control of their page. This is why Carrd Pro Plus and Linktree Premium both ship it.
  - Custom font + sandboxed code panel are power-creator table stakes.
  - Script whitelisting requires careful CSP + XSS review — real eng effort, not a checkbox.
  - Linktree Premium $30 ships "Personalized Linktree" (logo + full-screen visuals + remove branding — the branding-as-paywall pattern we refuse). We match the custom code depth at half the price without the anti-pattern.
- **Competitor baseline:** Linktree Premium $30 (visuals + no-branding toggle — AP-001 anti-pattern). Carrd Pro Plus $19/yr ≈ $1.58/mo (custom code; cheapest comp but no commerce). Beacons Creator Plus custom code. We match at Pro $15 with script whitelisting originated.
- **Behavior:**
  - Settings → Custom Code (Pro+ only, flag-gated). Three text areas: Custom CSS, Custom HTML (head), Script providers (checkbox list of 8 approved).
  - CSS sanitized by `postcss-sanitize` on save; rejected if contains `@import` or external URLs.
  - HTML head: whitelist of tags (meta, link rel=canonical, link rel=preconnect); reject style/script/iframe.
  - Script: only approved provider snippets, injected server-side at render with provider-specific ID (e.g., GA4 measurement ID field, no raw JS).
  - Custom font upload: Supabase Storage; hashed filename; served from R2 via `@font-face` in generated CSS.
- **Data model:** `pages.theme.custom_css`, `pages.theme.custom_head`, `pages.theme.analytics_providers jsonb`, `pages.theme.custom_font_url`.
- **Eng effort:** **L** (2-3 weeks — sanitization + sandbox + UI + R2 font serve + CSP review).
- **MVP/Y1/Y2:** **MVP** (critical for Pro-tier credibility; custom CSS is the #1 forum request from power creators).

### 18.7 — F-PRO-007 · A/B testing per block + smart-winner auto-promote + funnel analytics

- **Summary:** Pro creators can set up an A/B test on any block — define variant A + variant B → 50/50 split → after N clicks (creator-chosen, default 100), auto-promote the winner (by CTR). Includes funnel analytics (visitors → block click → checkout → purchase → review) with drop-off visualization.
- **Why it's worth $10/mo extra:**
  - Serious creators optimize constantly. A/B testing is why they'd upgrade.
  - Funnel analysis + A/B = real stats work (confidence intervals, sample size calculator, test duration estimator).
  - Linktree Premium $30 ships A/B (called "Experiments"). We match at Pro $15.
- **Competitor baseline:** Linktree Premium. Nobody else. We match Premium at half.
- **Behavior:**
  - Editor: click block → "A/B test" button → opens modal with variant B editor. On save: block becomes a test.
  - Visitor: random 50/50 A vs B via session-stable hash (same visitor always sees same variant during test).
  - Dashboard "Experiments" tab: live CTR + confidence + status (running / winner-found / stopped).
  - Auto-promote: when variant has >95% confidence via Bayesian test (not frequentist — avoids peeking issue), winner block becomes the only block.
  - Funnel: per-product page shows visitors → clicks → checkouts-started → purchases → reviews with % drop-off.
- **Data model:** `block_variants(id, block_id, variant_key char, content jsonb, active_until, winner_declared_at)`; `analytics_events` schema adds `variant_key`.
- **Eng effort:** **XL** (3 weeks — variant assignment + Bayesian stats + UI + auto-promote cron).
- **MVP/Y1/Y2:** **Y1 M+3** (post-MVP; needs real traffic to prove out).

### 18.8 — F-PRO-008 · Abandoned cart recovery + commerce automations + Stripe advanced features

- **Summary:** Pro unlocks abandoned cart recovery (checkout started but not completed → email 1h + 24h later), post-purchase upsell email (7-day follow-up with related product discount), subscription dunning customization (failed payment recovery flows).
- **Why it's worth $10/mo extra:**
  - Real commerce creators need abandoned cart recovery — proven +5-15% revenue lift on e-commerce.
  - Stripe integration complexity is real (webhook reliability, retry logic, customer match).
  - Linktree Pro has "Conversion tracking" but not automations. Beacons Creator Plus has email automations but not commerce-specific.
- **Competitor baseline:** Linktree partial (conversion tracking). Beacons CP automations. Stan Pro $99 has everything. We match Stan Pro at 15% of price.
- **Behavior:**
  - Settings → Commerce Automations → toggle: Abandoned cart / Post-purchase upsell / Dunning.
  - Abandoned cart: Stripe `payment_intent.created` without `.succeeded` within 60min → enqueue email; 24h reminder if still unpaid.
  - Post-purchase: 7 days after `payment_intent.succeeded` → email with creator-set "related product" at creator-set discount.
  - Dunning: on `invoice.payment_failed` → custom email sequence (Day 1/3/7).
- **Data model:** `commerce_automations(user_id, kind text, active bool, config jsonb)`; `automation_runs(id, automation_id, buyer_email, scheduled_at, sent_at, outcome)`.
- **Eng effort:** **L** (2 weeks — Stripe webhook depth + scheduler + email templates).
- **MVP/Y1/Y2:** **Y1 M+4** (post-MVP; needs commerce traffic to validate).

### 18.9 Pro-tier summary — "is $15 worth 3× Creator?"

Customer mental model:

> "I'm on Creator $5 because I want my own domain. I've grown to 5k monthly visitors. My Pro upgrade at $15 unlocks:
> 1. Full-year analytics + cohort retention charts
> 2. Live Google Sheets sync of my analytics
> 3. My social media manager gets her own editor seat
> 4. I can build a Discord bot using the tadaify API (1000 req/hr)
> 5. I send newsletters from `hello@mydomain.com` with automations
> 6. I customize my page with my own CSS + custom font (no tadaify footer to remove — it never existed on any tier)
> 7. (Y1) I A/B test my top product's headline
> 8. (Y1) I recover abandoned carts that currently silently churn
> PLUS 3 custom domains included (up from 1).
>
> Am I getting $10/mo of value? If I have ≥1k monthly visitors, yes, the answer is obviously yes."

Four MVP features (F-PRO-001, F-PRO-003, F-PRO-005, F-PRO-006) + three Y1 features (F-PRO-002, F-PRO-007, F-PRO-008) + F-PRO-004 API already ship MVP. At MVP launch, Pro has 5 of 8 power features live. The Y1 three (F-PRO-002 Sheets sync, F-PRO-007 A/B testing, F-PRO-008 abandoned cart) complete the promise over the first 4 months of operation.

---

## 19. Business-tier Features (NEW SECTION)

Business tier at $49/mo targets social media managers + small agencies running 3-10 creator pages. If scope runs heavy, 2 features defer to Y1 (flagged).

### 19.1 — F-BIZ-001 · Agency sub-accounts (master account manages N creator pages)

- **Summary:** Business Owner account manages N child creator pages. Each child has its own handle + theme + blocks + commerce. Owner sees all children in one dashboard; can bulk-edit (apply theme to 5 children); can switch context instantly.
- **Why:** Direct agency use case — social media managers running pages for 3-10 clients. Without this, they'd share passwords across 10 tadaify accounts (operational nightmare).
- **Competitor baseline:** Linktree Premium $30 "Unlimited social posts (3 brands)" partial. Beacons Brands persona (B2B2C distinct model). We originate simple agency sub-accounts at $49.
- **Behavior:**
  - Owner account → Settings → Agency → Create sub-account → choose handle + creator contact email.
  - Sub-account is independent (own `profiles` row) but `agency_parent_id` links back.
  - Owner sees "Switch account" dropdown in global nav.
  - Bulk-theme: "Apply this theme to children" checkbox + list.
  - Billing: Owner pays single Business $49 subscription + $3/mo per sub-account beyond the first 3 included (e.g., 5 sub-accounts = $49 + 2×$3 = $55).
- **Data model:** `profiles.agency_parent_id uuid fk → profiles.user_id`; RLS policies let parent SELECT/UPDATE child pages.
- **Eng effort:** **XL** (3-4 weeks — identity model + context switching + bulk ops + billing).
- **MVP/Y1/Y2:** **MVP** (Business tier needs at least this to exist).

### 19.2 — F-BIZ-002 · White-label domain + co-branded emails + custom ToS

- **Summary:** Agency can offer tadaify under their own brand — custom domain for the admin UI, customized email sender for ALL their creator accounts, custom Terms & Conditions page (agency legal review). Public creator pages have no platform branding on any tier (AP-001 hard-locked); white-label here means the **agency dashboard + emails** branded as "[AgencyName]", not removal of tadaify creator-page watermarks (which don't exist).
- **Why:** Agencies want to resell tadaify as their own managed service. White-label admin UI + co-branded emails = agency can pitch "we manage your link-in-bio on our platform" without mentioning tadaify.
- **Competitor baseline:** Linktree Premium has "Custom T&Cs". Not much else direct. We originate at Business.
- **Eng effort:** **L** (2 weeks).
- **MVP/Y1/Y2:** **MVP** (moved from Y1 per DEC-Q5-A — full Business tier at MVP).

### 19.3 — F-BIZ-003 · Priority support + 4h SLA + dedicated CSM

- **Summary:** Business tickets routed to priority queue; 4h response SLA (published on Trust Center `F-171`); dedicated Customer Success Manager for accounts >$500/mo spend.
- **Why:** Agency buyers demand SLA commitments (their clients demand it from them).
- **Eng effort:** **S** (routing + Trust Center config).
- **MVP/Y1/Y2:** **MVP** (moved from Y1 per DEC-Q5-A — full Business tier at MVP).

### 19.4 — F-BIZ-004 · Bulk product + block management across sub-accounts

- **Summary:** Owner selects N sub-accounts → bulk apply: "Add this product to all selected" / "Update theme across all" / "Schedule campaign across all".
- **Why:** Agencies running seasonal campaigns across multiple creators need this.
- **Eng effort:** **L** (~2 weeks).
- **MVP/Y1/Y2:** **MVP** (moved from Y1 per DEC-Q5-A — full Business tier at MVP).

### 19.5 — F-BIZ-005 · Agency revenue reporting + client billing

- **Summary:** Report revenue across sub-accounts + generate invoice to agency's own clients with configurable markup.
- **Why:** Agencies charge clients a management fee on top of tadaify; a billing report helps.
- **Eng effort:** **L** (~1 week).
- **MVP/Y1/Y2:** **MVP** (moved from Y1 per DEC-Q5-A — full Business tier at MVP).

### 19.6 Business-tier verdict on MVP placement

**All 5 Business features ship MVP** (F-BIZ-001 through F-BIZ-005) per DEC-Q5-A (user accepted full Business tier at MVP). This gives Business full credibility at launch — agency can switch from Linktree Premium managing 10 brands for $300/mo to tadaify Business at $49 + extras with no stripped-down beta experience. Business launches as a full product, not a roadmap promise. The prior "rename Agency (beta)" discussion is removed — Business tier launches fully-featured. **+6 eng-weeks** added to MVP total (F-BIZ-002 ~2w + F-BIZ-003 ~1w + F-BIZ-004 ~2w + F-BIZ-005 ~1w).

---

## N+1. MVP scope — rich MVP for an "everything free" Linktree-killer launch

### MVP feature count: **~126 units** (was ~118; +8 from Creator tier features + F-058a + F-172a + F-175a + F-180a + F-191a + F-191b + F-TRUST-001..004)

| Area | MVP | Eng weeks (summed) |
|---|---|---|
| Onboarding & Identity | 13 | 7 |
| Editor & Block System | 15 | 12 (4 extra for commerce blocks flipping to Free) |
| Public Page Rendering | 12 | 8 |
| **Preview Generator** | **7** | **6-7** (L admin UI + M customization + S parser + M renderer + M hash-inheritance + M dashboard + S outreach workflow) |
| **Custom Domain System** | **3** | **3.5** |
| Commerce & Checkout | 15 | 11 (larger because flipped Free = all MVP) |
| **Creator-tier Features** | **8 new items** | **1.5** (favicon 1d + scheduled publishing 4-5d + verified badge 2d = ~8 eng-days) |
| **Subtle Contextual Upsell** | **5** | **5** (F-UPSELL-001/002/003/004/006; F-UPSELL-005 → Y1) |
| Analytics & Insights | 7 | 5 |
| Email & Audience | 5 | 5 (campaign builder moved to Free) |
| Growth Loops | 7 | 5 |
| Customization & Theming | 12 | 7 |
| Templates & Starters | 4 | 3 |
| Trust/Platform | 5 | 4 |
| Admin & Trust | 10 | 3 (port) |
| Integrations & API | 8 | 7 |
| AI Features | 4 | 2.5 |
| EU/PL Localization | 8 | 4 |
| Marketing Surfaces | 10 | 6 |
| **Pro-tier Power Features** | **5 of 8 MVP** | **10** (F-PRO-001/003/004/005/006) |
| **Business-tier Features** | **5 of 5 MVP** (DEC-Q5-A) | **12** (F-BIZ-001/002/003/004/005 — all MVP) |

**Aggregate engineer-time: ~134-135 weeks** (+5 weeks from F-UPSELL-001/002/003/004/006; +2 weeks net from preview-generator pivot to admin tool; **+6 weeks from DEC-Q5-A moving F-BIZ-002/003/004/005 from Y1 → MVP**; **+1.5 weeks from Creator-tier features** (favicon + scheduled publishing + verified badge); **+1 week from trust features** (F-058a + F-172a + F-175a + F-180a + F-191a + F-191b)). With a 3-engineer team at 85% velocity = **~52 calendar weeks ≈ 13 months** to MVP. With 5-engineer team + 2 weeks contingency = **~30 calendar weeks ≈ 7-8 months**.

**Risky/critical path items:**

1. **Cloudflare Workers SSR infrastructure** — if this is first attempt at Workers-as-app-framework for team, add 2 weeks risk buffer. Lack of Cloudflare Workers experience is the biggest schedule risk.
2. **Cloudflare for SaaS custom domains** — SSL provisioning + multi-tenant routing + edge caching purge. Non-obvious failure modes at scale.
3. **Stripe Connect + Tax + Przelewy24/BLIK triple integration** — commerce stack complexity. Plan 6 weeks minimum.
4. **Preview generator parser resilience** — Linktree changing their HTML breaks the parser; need weekly regression test + parser versioning from day 1. Admin-only scope means a parser outage is a marketing inconvenience, not a user-facing incident — lower severity than the old public endpoint model.

### Controversial MVP inclusions — defending v2 choices

#### Why F-PRO-001/003/004/005/006 ship at MVP

- Without Pro power features, the Pro tier at $15 looks like "Creator + 2 extra domains" — not worth the upgrade. Pro must be *obviously* worth it from day 1.
- 5 of 8 power features MVP = enough for Pro to be credible. The 3 deferred (Sheets sync, A/B testing, cart recovery) all need real data/traffic to prove out.

#### Why Business tier ships fully at MVP (DEC-Q5-A — LOCKED)

**User accepted: full Business tier at MVP.** All 5 F-BIZ units ship at MVP. No stripped-down tier, no "Agency (beta)" framing, no deferred features. Business launches as a complete product.

1. Agency segment is the highest-LTV segment (≥$500/mo per agency over multi-year).
2. F-BIZ-001 sub-account model is a data-model decision — deferring means re-architecting `profiles` later, which is 3× more expensive than shipping it day 1.
3. F-BIZ-002/003/004/005 are the features that make Business genuinely compete with Linktree Premium at 60% lower price — shipping them at MVP means credibility from day 1.
4. Without full Business tier, Pro at $15 is the ceiling for agencies — bad positioning for an agency pitch.

**Eng cost: +6 weeks** (F-BIZ-002 ~2w + F-BIZ-003 ~1w + F-BIZ-004 ~2w + F-BIZ-005 ~1w). MVP total updated accordingly.

---

## N+2. Y1 roadmap

| Month | Feature units | Why now |
|---|---|---|
| M+1 | F-016 email drip · F-019 Apple SSO · F-119 automated drips · F-190 refund polish | Activation + retention |
| M+2 | F-038 version history · F-045 device-conditional blocks · **F-UPSELL-005 peer benchmarking** | Post-MVP polish; F-UPSELL-005 added once user base reaches N≥1k per cohort; F-BIZ-004 moved to MVP per DEC-Q5-A |
| M+3 | **F-PRO-007 A/B testing** · F-108 conversion funnel · F-PRO-002 Sheets sync | Power-feature completion round 1 |
| M+4 | **F-PRO-008 abandoned cart** · F-084 BNPL Klarna+Affirm · F-120 cart-abandon recovery baseline | Commerce depth; F-BIZ-005 moved to MVP per DEC-Q5-A |
| M+5 | F-042 custom form builder · F-132 review request automation · full F-148 extended animations (60 total) | Editor + polish |
| M+6 | Native Shopify sync (if signals demand) · F-207 IFTTT · F-192 suspicious activity detection | Post-Linktree refugees + scale-ready |
| M+7 | F-224 AI FAQ search · F-146 custom CSS expansion · F-BIZ-002 advanced white-label (own iOS PWA manifest) | AI + Business depth |
| M+8 | F-063 link health v2 realtime · Geo-targeted block → per-country inventory (Pro) | Advanced targeting |
| M+9 | Partner-submitted integrations marketplace (Business) | Ecosystem |
| M+10 | Native iOS app (if PMF met) · Brand-deal marketplace lite | Native + ecosystem |
| M+11 | Full transparency report Y1 · enterprise sales page · PL localization polish round 2 | Maturity |
| M+12 | Full AI suite v2 (audience insights, subject-line gen, content calendar) | AI depth |

Total Y1 additions: ~22 units. End of Y1 = ~140 live features.

---

## N+3. Y2 roadmap

- Multi-brand workspace advanced (agency managing 20+ creators)
- Brand-deal marketplace v2 (Beacons moat challenge if primary segment demands)
- Light course hosting (video upload + basic progress — NOT Stan depth)
- Native Android app
- GraphQL API v2 + bulk endpoints
- AI animation generator (creator prompts → custom Lottie)
- Cross-creator promotional network ("promote another creator, earn 10%")
- Advanced team roles + approval workflows + audit log export (Business)
- SOC 2 Type I certification
- Etsy / Gumroad / Podia import parsers (beyond MVP 3)
- PL Business features (JPK-FA XML, iFirma/Fakturownia, INPOST paczkomaty for physical goods)
- AppSumo lifetime deal at M+18 only
- Enterprise SSO (SAML / SCIM) if real contract

---

## N+4. Explicit NOT-doing list

(Unchanged from v1 §N+4; v2 keeps the same non-goals: no course hosting depth, no native video hosting, no podcast hosting, no AI brand-deal pitch automation, no media kit builder, no lifetime OTP tier, **no seller fee ladder (v2-reconfirmed)**, no celebrity showcase, no apex domain registration, no full CRM, no affiliate network for creators' products, no own payment processor, no NFT/crypto, no `·` separator, no land acknowledgement, no "algorithm is the enemy" copy.)

---

## N+5. Revenue model — unit economics per tier

### Assumptions

- Top-of-funnel CAC (blended Track A+B+C): **$2-5 per signup** (per `marketing-strategy.md`).
- Signup → activation (first published page within 7d): **55%**.
- Activation → D30 retention: **45%**.
- D30 retained → D90 retained: **70%**.
- D90 retained → D180 retained: **85%**.

### Tier conversion rates (D90 from signup)

| Tier | Conversion | Basis |
|---|---|---|
| Free → Free-plus-domain-addon ($3/mo) | 8% | Linktree benchmark for domain upgrades |
| Free → Creator ($5) | 4% | mid-tier commitment signal |
| Free → Pro ($15) | 1.5% | Linktree free→paid baseline |
| Free → Business ($49) | 0.2% | agency niche |
| Creator → Pro | 12% of Creators upgrade in 6mo (as audience grows) |

### ARPU by tier

| Tier | Monthly | Annual ARPU |
|---|---|---|
| Free | $0 | $0 |
| Free + 1 domain addon | $3 | $36 |
| Creator | $5 | $60 |
| Creator + 1 extra domain | $8 | $96 |
| Pro | $15 | $180 |
| Pro + 2 extra domains | $21 | $252 |
| Business (3 sub-accounts included, full feature set per DEC-Q5-A) | $49 | $588 |
| Business + 5 extra sub-accounts | $64 | $768 |

### Blended ARPU at 10k MAU

Assumed distribution:
- 86% Free, $0
- 8% Free+domain, $3 avg effective = $0.24 blended
- 4% Creator, $5 avg = $0.20 blended
- 1.5% Pro, $15 avg = $0.23 blended (0.5% with extra domains → $17.50 avg; simplification OK)
- 0.2% Business, $55 avg = $0.11 blended
- 0.3% variable

**Blended ARPU ≈ $0.78/MAU/mo.** At 10k MAU: **$7,800/mo ≈ $94k/yr**. At 100k MAU: **$78,000/mo ≈ $936k/yr**.

### Gross margin

Infrastructure cost per MAU (per infra-architecture-v2.md): **~$0.03/mo**.

Other COGS per paying user:
- Stripe 2.9% + $0.30 on subscription billing (passthrough at product level; we pay on our own sub fees only)
- Resend $0.001/email × ~100 emails/creator/mo = $0.10
- OpenAI ~$0.005/gen × 20 gens/mo avg on Free = $0.10

**Total infra+SaaS COGS per active user: ~$0.25/mo.**

Gross margin at 10k MAU:
- Revenue: $7,800/mo
- COGS: $0.25 × 10,000 = $2,500/mo (includes Free users who still cost infra)
- Gross margin: $5,300 / $7,800 = **68%**

At 100k MAU: margin improves to ~**75%** (fixed costs like Cloudflare Business plan amortize better).

### LTV

Paying tier avg LTV (Creator+Pro+Business blended):
- ARPU $15/mo (weighted toward Pro)
- Churn 8%/mo (bio-link category norm)
- LTV = $15 / 0.08 = **$187.50**

CAC $3 → LTV/CAC = 62× (great; typical SaaS target is 3-5×).

### Break-even analysis

Fixed costs at MVP launch (per infra-architecture-v2.md):
- Cloudflare Business: $200/mo
- Supabase Pro: $25/mo
- Resend Pro: $20/mo
- AWS: $10/mo
- Monitoring (Sentry etc.): $50/mo
- **Total fixed: ~$305/mo**

Break-even paying users (excluding salaries): **~20 Pro subscribers** or ~100 Creator subscribers. Trivially achievable post-launch (Track A outreach alone targets 300-3000 signups in Q1).

**Including a 2-engineer team at $10k/mo salary burden total → break-even at ~670 Pro-equivalent paying users.** Achievable by M+9 under modest assumptions.

---

## N+6. Cost-of-goods drivers per MVP feature

Updated for Cloudflare-first architecture:

### HIGH cost-of-goods (monitor + gate in higher tiers)

| F-NNN | Driver | Notes |
|---|---|---|
| F-220..F-222 AI features | OpenAI per-token | ~$0.005/gen. Free 20/mo × 10k × 0.3 utilization = $300/mo baseline. Pro 200/mo spike to $1k-3k. Cache aggressive + use gpt-4o-mini for first draft. |
| F-CUSTOM-DOMAIN-* custom domains | Cloudflare for SaaS | ~$0.10/domain/mo beyond 100 included. At 10k domains = $990/mo. Revenue at $3/mo per = $30k/mo. Margin 97%. |
| F-PRO-001 analytics 365d | Athena scans | ~$0.50-2/mo per active Pro creator. Revenue $15/mo. Margin 90%. |
| F-PRO-005 email marketing | Resend per-email | $0.001/email × 10k/mo per Pro creator = $10/mo at MAX. Revenue $15/mo. Margin 33% on Pro if they max their quota; safety via hard quota cap + per-creator throttling. |
| F-070..F-085 commerce | Stripe passthrough | Not our cost. Refund dispute fees $15/case — absorb. |
| F-PREVIEW-001..007 (MVP) + 010..012 (M+0.5) | Supabase Edge Function CPU + preview.tadaify.com serving | Admin-generated previews; expected volume = 100-500 admin-generated previews/mo (1-to-1 sales tool, not mass-public). Infra cost negligible (<$5/mo). Admin panel serving is internal traffic. Total acquisition ROI ~$0.10 per signup vs $2-5 CPC on paid ads. |

### MEDIUM cost-of-goods

- F-050..F-051 hub + product SSR — cached heavily; Workers+KV ~$0 per page view
- F-054 per-buyer analytics ingest — pre-aggregated in Cloudflare Analytics Engine
- F-200..F-202 API — bounded by quota
- F-006 palette extract — one k-means per avatar, cached in R2

### LOW cost-of-goods (no gating pressure)

- All template / theming / editor work (creator edit time is free)
- F-125..F-139 growth features (one-time generation + KV cache)
- F-165..F-169 templates (CDN-served)

### Top 3 cost monitoring priorities

1. **AI features budget** — $500-3000/mo MVP; hard quota + cheaper models.
2. **Email sends on Pro** — 10k/mo cap + per-minute throttling.
3. **Preview generator at Track A scale** — cap at 10k/day/IP; graceful degradation.

---

## N+7. Competitive positioning

### Counter-positioning on upsell UX

Linktree reviews cite "aggressive upsell" as a top-3 complaint (per `competitors/linktree/notes.md` §reviews + `competitors-research-3-index.md`). Our subtle-upsell approach (F-UPSELL-001..006) is a deliberate counter-positioning: **"tadaify helps you grow; Linktree reminds you to upgrade."** This copy should appear in landing page hero, pricing page footer, and DM outreach templates (Track A). The behavioral contract is the differentiator: we collect signals and inform — we never block, never nag, never guilt.

### Anchor messaging for landing + pricing page

> **"Everything Linktree charges for is free on tadaify. Even commerce. Even analytics. Even custom themes. Even PL payments.**
>
> **Pay only for what actually scales with you: your own domain ($3/mo), or Pro power features ($15/mo) once you have a real audience.**
>
> **0% platform fees at every tier. Always. No seller-fee ladder. No gotchas."**

### Per-tier anchors

- **Free:** "Everything Linktree Pro locks behind $12. Every block type. Every theme. Every analytics chart. 90-day retention. Email capture. Commerce at 0% fees. BLIK + Przelewy24 for Polish creators. Forever free."
- **Creator $5:** "Your own domain included. 180-day analytics memory. 40 AI credits/month (twice Free). 24h priority support. Custom favicon. Scheduled publishing. Verified creator badge. Directory listing. Plus: upgrade from Free-with-domain-add-on to Creator with zero DNS re-setup. The $2 delta above the $3 domain delivers real creator tools, not just a URL."
- **Pro $15:** "The 8 power features serious creators actually need: 365-day analytics + team seats + custom CSS + high-volume email + advanced API + A/B testing + abandoned cart recovery + Sheets sync. Linktree Premium is $30 for less."
- **Business $49:** "Agency sub-accounts + white-label + 4-hour SLA. Manage 10 clients under one dashboard for less than Linktree Premium costs for one."

### vs competitors — pricing-page comparison table

| Feature | Linktree | Beacons | Stan | **Tadaify** |
|---|---|---|---|---|
| Free plan | Yes (12% fee on products) | Yes (9% fee on products) | No (trial only) | **Yes (0% fee)** |
| Custom domain | $12/mo (Pro) | $30/mo (CP) | $29/mo (Creator) | **$3/mo add-on OR $5/mo Creator** |
| 365-day analytics | $12/mo (Pro) | Included CP $30 | $99/mo (Pro) | **$15/mo (Pro)** |
| Email campaigns | Integrations only | Unlimited CP $30 | $99/mo (Pro) | **Free 1k/mo / Pro 10k/mo** |
| Inline checkout | 9-12% fee (tiered) | 9% → 0% at CP | 0% (Creator+) | **Free 0%** |
| A/B testing | $30/mo (Premium) | No | No | **$15/mo (Pro)** |
| Custom CSS | $30/mo (Premium) | Yes (CP) | No | **$15/mo (Pro)** |
| Team seats | $30/mo (Premium) | No | No | **$15/mo (Pro)** |
| Public API | Partner-only | No | No | **Free tier + Pro quotas** |
| Polish payments | No | No | No | **Free** |
| EU VAT auto-calc | No | No | No | **Free** |

---

## N+8. Glossary (updated)

(Unchanged from v1 with these additions.)

- **Preview generator** — admin-only marketing tool at `/admin/marketing/preview-generator`. Admin pastes a target creator's Linktree URL (MVP), customizes the preview visually, and generates a private `preview.tadaify.com/<slug>?ref=<hash>` URL to send 1-to-1. If target signs up via the hash, onboarding is pre-populated with admin's customization. Not a public endpoint. Acquisition weapon per `F-PREVIEW-001..007` (MVP) + `F-PREVIEW-010..012` (M+0.5).
- **Power features** — the 8 Pro-tier features that justify the $15/mo price point over Creator $5, per `F-PRO-001..008`.
- **Agency sub-account** — Business-tier feature where a single Owner account manages N child creator pages; `F-BIZ-001`.
- **Custom domain add-on** — $3/mo metered Stripe billing for each custom domain beyond tier quota; `F-CUSTOM-DOMAIN-003`.
- **Cloudflare for SaaS** — Cloudflare's multi-tenant custom-hostname + SSL provisioning product; the edge layer for all custom domains in v2 architecture.
- **DEC-035** — user's locked architecture decision (Cloudflare-first) on 2026-04-24.
- **DEC-036** — user's locked currency decision (USD) on 2026-04-24.
- **DEC-037** — user's locked tier structure (Free/Creator/Pro/Business) on 2026-04-24.
- **DEC-043** — user's locked "everything free" gating model on 2026-04-24.
- **DEC-044** — user's preview generator MVP-critical placement on 2026-04-24.

---

## N+9. Pro-tier justification analysis (THE critical research output)

### The $15 vs $5 gap — what Pro *actually* gets

The user asked the sharpest question: "What makes someone with 1M views pay $15 instead of $5?" Answer: power features, each sized to a specific creator need, each genuinely expensive for us to ship, each benchmarked against competitor Premium tiers.

| # | Feature | Creator need | Cost to build (eng) | Competitor benchmark | Worth ≥$10/mo? |
|---|---|---|---|---|---|
| 1 | **F-PRO-001** 365d analytics + cohort + funnel | Creator with >6mo history wants to see yearly seasonality, cohort retention charts, multi-step conversion funnels | L (2wk) + Athena infra + cohort SQL | Linktree Pro $12 (365d); Premium $30 (lifetime) | **Yes** — competitor price-anchored here |
| 2 | **F-PRO-002** CSV all-time + Google Sheets live sync | Power creator who runs dashboards in Sheets | M (1.5wk) — Sheets OAuth + sync scheduler | Nobody ships live Sheets sync natively | **Yes** — originate |
| 3 | **F-PRO-003** 3 team seats + roles + audit log | Creator working with a VA / social media manager | L (2-3wk) — RLS + invites + audit | Linktree Premium $30 ("Add Admins") | **Yes** — we're half Premium price |
| 4 | **F-PRO-004** API 1k req/hr + 10 webhooks + multi-scope keys | Power creator building automations | L (2-3wk) — key mgmt + rate limit + DLQ | Linktree: no public API at any tier | **Yes** — we originate the whole category |
| 5 | **F-PRO-005** 10k sends/mo + automations + custom sender domain + segmentation | Creator sending newsletters to ~1-5k subscribers | XL (3-4wk) — workflow engine + sender domain + segmentation | Beacons CP $30 (unlimited sends); Stan Pro $99 | **Yes** — half Beacons, 85% off Stan |
| 6 | **F-PRO-006** Custom CSS + HTML head + script whitelist + custom font | Creator who wants pixel-level brand control; no "remove branding" toggle because there is no branding (AP-001 hard-locked) | L (2-3wk) — sanitize + sandbox + serve | Linktree Premium $30; Carrd Pro Plus $19/yr | **Yes** — Premium parity at half price |
| 7 | **F-PRO-007** A/B testing + auto-promote winner + Bayesian stats | Serious creator optimizing top products | XL (3wk) — variant assignment + stats + auto-promote | Linktree Premium $30 ("Experiments") | **Yes** — Premium parity at half price |
| 8 | **F-PRO-008** Abandoned cart recovery + post-purchase upsell + dunning | Creator with recurring commerce | L (2wk) — Stripe webhook depth + scheduler | Linktree partial, Stan Pro $99 | **Yes** — 85% off Stan |
| 9 | **F-UPSELL-005** Peer-creator benchmarking | Creator wants to know how their page performs vs peers at their audience size; validates pricing/CTA choices without expensive consultants | M (1wk) — aggregate calculation job + dashboard card UI | Nobody ships signal-aware peer benchmarks natively (data moat requires N≥1k creators per cohort) | **Yes** — data moat exclusive to platforms with real user base; bundles naturally with F-PRO-001 analytics story to make Pro analytics compelling end-to-end |

**Aggregate eng-weeks: ~19-23 weeks** (+1 week from F-UPSELL-005). MVP ships 5 of 8 F-PRO units + F-UPSELL-005 deferred to Y1 (= ~11 eng-weeks for Pro at MVP). Y1 adds F-PRO-002/007/008 + F-UPSELL-005 = ~8 eng-weeks.

### The math for a creator with 1M views

If tadaify had just Creator at $5 and no Pro, a 1M-view creator would say "I'm already paying $5, why would I pay $15?" With Pro:

- Their social media manager gets an editor seat (doesn't share password) = saves $20/mo of operational mistake risk
- Their 365-day analytics + cohort charts tell them which product needs a price test = +10-15% revenue lift = $100-500/mo for a mid-creator
- Their newsletter goes to `hello@yourdomain.com` instead of `noreply@tadaify.com` = +30% open rate (gmail sender reputation) = more sales per broadcast
- Custom CSS removes the footer + matches their brand identity = perceptual premium of their whole brand
- A/B testing top product headline = +5-20% CTR on top block

**A 1M-view creator who uses 3 of 8 Pro features gets obvious 5-20× ROI on $10/mo Pro delta.** This is the justification.

### What we explicitly did NOT include in Pro tier (and why)

- **Concierge onboarding** (Linktree Premium $30) — labor-intensive; not scalable; we substitute with generous Free + onboarding checklist + video library.
- **Unlimited Instagram auto-replies** (Linktree Premium) — social DM automation is a whole product; defer to Y2.
- **Brand deal CRM** (Beacons moat) — Beacons's moat; we don't fight it.
- **Dedicated IP for email** — overkill for 10k-subscriber creators; Resend shared IP works fine.
- **100% affiliate commission** (Linktree Premium) — different business model (Linktree monetizes affiliate clicks; we don't); skip.
- **Concierge setup assistance** — doesn't scale.

### Open questions on Pro features (flag for user)

1. **F-PRO-005 email marketing**: Should custom-sender-domain verification be hand-held (tadaify walks creator through DNS setup) or self-serve with automated verify? v2 recommendation: automated + fallback to human in week 2 post-launch based on support volume.
2. **F-PRO-006 script whitelist**: 8 providers enough for MVP, or do we allow any `<script>` tag (CSP-locked)? v2 recommendation: whitelist 8 for MVP; expand based on request frequency.
3. **F-PRO-007 A/B testing auto-promote**: Bayesian vs frequentist stats? v2 recommendation: Bayesian (sidesteps peeking issue; simpler story "we'll tell you when one variant is 95% likely to be better").

---

## Return summary (for orchestrator)

**File written:** `~/git/claude-startup-ideas/full-research/tadaify/functional-spec-v2.md` (~145 F-units total, ~131 MVP units).

**MVP / Y1 / Y2 / M+0.5 counts:**
- MVP: ~131 units (7 F-PREVIEW MVP; +4 from DEC-Q5-A moving F-BIZ-002/003/004/005 to MVP)
- M+0.5: 3 units (F-PREVIEW-010/011/012 — Beacons/Stan/Bio.link parsers)
- Y1: ~18 units (F-BIZ-002/003/004/005 removed from Y1 per DEC-Q5-A)
- Y2: ~5 units

**DEC-Q5-A impact:** Full Business tier at MVP. +6 eng-weeks. Pre-DEC-Q5-A total: ~118-120 eng-weeks. Post-DEC-Q5-A total: ~124-126 eng-weeks.

**DEC-MKT-C impact:** EN-only marketing copy. PL outreach templates removed from spec references. Template naming convention changed from PL-culture (Chopin/Kopernik) to TBD neutral/brand-neutral names.

**Preview generator unit breakdown (admin-tool model):**
- F-PREVIEW-001 — Admin preview-generator UI (L, 2-3 weeks) — MVP
- F-PREVIEW-002 — Customization engine (M, 1-1.5 weeks) — MVP
- F-PREVIEW-003 — Linktree platform parser (S, 2-3 days) — MVP
- F-PREVIEW-004 — Preview renderer + slug management (M, 1 week) — MVP
- F-PREVIEW-005 — Hash-based referral + onboarding inheritance (M, 1 week) — MVP
- F-PREVIEW-006 — Admin preview dashboard (M, 1 week) — MVP
- F-PREVIEW-007 — Admin outreach workflow integration (S, 3-5 days) — MVP
- F-PREVIEW-010 — Beacons parser (S, 2-3 days) — M+0.5
- F-PREVIEW-011 — Stan parser (S, 2-3 days) — M+0.5
- F-PREVIEW-012 — Bio.link parser (S, 2-3 days) — M+0.5

**MVP eng-weeks for preview section: 6-7 weeks.** (L admin UI 2-3w + M customization 1.5w + S parser 0.5w + M renderer 1w + M hash-inheritance 1w + M dashboard 1w + S outreach 0.5w = heaviest estimate 6.5w, lightest 5.5w)

**Pro-tier power features identified (5 MVP + 3 Y1 = 8 total):**
1. **F-PRO-001** · 365d analytics + cohort + funnel — Linktree $12 price-anchored; Athena-backed.
2. **F-PRO-002** · CSV all-time + Google Sheets live sync — originate; nobody ships native Sheets sync.
3. **F-PRO-003** · 3 team seats + roles + audit log — Linktree Premium $30 parity at half price.
4. **F-PRO-004** · API 1k req/hr + 10 webhooks + multi-scope keys — originate public API tier.
5. **F-PRO-005** · 10k sends/mo + automations + custom sender domain + segmentation — Beacons CP $30 parity at half.
6. **F-PRO-006** · Custom CSS + HTML + script whitelist + custom font + white-label — Linktree Premium $30 parity at half.
7. **F-PRO-007** · A/B testing + Bayesian auto-promote — Linktree Premium $30 parity at half (Y1).
8. **F-PRO-008** · Abandoned cart + post-purchase upsell + dunning — Stan Pro $99 parity at 15% (Y1).

**Note: F-PREVIEW is NOT a Pro-tier feature.** It is admin-only infrastructure — no customer-facing tier gating.

**Top 3 highest-risk MVP eng items:**
1. **Cloudflare Workers SSR framework choice + execution** — team's first Workers-as-app adventure; 2-week buffer recommended.
2. **F-CUSTOM-DOMAIN-001..003** custom domain stack end-to-end (CNAME UX + Cloudflare SaaS API + Stripe metered billing) — 3 integrations compound risk.
3. **F-PRO-005** email marketing (workflow engine + custom sender domain SPF/DKIM + segmentation) — biggest single Pro feature at XL; if slips, Pro tier credibility at launch is at stake.

**One question still needing user decision:**
1. **Annual pricing at MVP?** v2 recommendation: Free/Creator/Pro/Business monthly only at MVP. Add annual (20% discount, pre-selected) at M+2 once churn data validates pricing. Confirm?

**Locked decisions (no longer open):**
- Preview generator P0 scope: admin-only tool, Linktree-only at launch per DEC-MKT-B-v2 + DEC-Q5-C.
- **Business tier: full MVP per DEC-Q5-A** — all 5 F-BIZ units ship at MVP. +6 eng-weeks. No stripped-down tier.
- **EN-only marketing: per DEC-MKT-C** — all outreach templates, landing copy, onboarding text in EN. PL-culture templates renamed to neutral names at MVP. PL outreach deferred to Y2+.
