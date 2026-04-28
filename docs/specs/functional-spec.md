---
type: product-spec
project: tadaify
title: Tadaify — Functional Specification (FINAL canonical)
created_at: 2026-04-24
author: orchestrator-sonnet-4-6-merge-agent
status: canonical-2026-04-24
supersedes: functional-spec.md (v1 2026-04-24), functional-spec-v2.md (v2 2026-04-24)
---

# Tadaify — Functional Specification (FINAL canonical)

## 0. How to read this document

This is the **canonical, merged functional specification** for tadaify. It supersedes both `functional-spec.md` (v1) and `functional-spec-v2.md` (v2). v1 was the post-competitor-audit baseline. v2 applied four architecture pivots (Cloudflare-first DEC-035, USD currency DEC-036, 4-tier flat DEC-037, "everything free" DEC-043). The anti-patterns audit (`anti-patterns-audit.md` 2026-04-24) resolved RED/YELLOW flags in v2. This FINAL document encodes all three layers.

### 0.1 Four pivots from v2 (locked in this spec)

1. **Architecture (DEC-035) — LOCKED Cloudflare-first.** Edge + custom domains + media + hot analytics = Cloudflare (Workers, R2, Pages, Cloudflare-for-SaaS, Analytics Engine, DNS). Central brain = Supabase (Postgres, GoTrue, Edge Functions, Realtime). AWS = S3 (cold analytics Parquet) + Athena + Glue. No CloudFront, no Route53, no ACM, no Lambda by default.
2. **Currency (DEC-036) — LOCKED USD.** All prices in USD. EU creators see local-currency display via `F-073` but plan SKU is USD.
3. **Tier structure (DEC-037, revised by DEC-083 → DEC-279 2026-04-28) — LOCKED 4-tier flat.** Free $0 / Creator $7.99/mo / Pro $19.99/mo / Business $49/mo. 0% platform fees on every tier forever (contractually locked per F-172a, F-TRUST-001..004, and ToS clause). [Pricing revised 2026-04-28 via DEC-083 → DEC-279 same-day chain: $5/$15 → $8/$19 → $7.99/$19.99. Domain add-on $2/mo → $1.99/mo. DEC-037, DEC-083, and DEC-PRICELOCK-02 (domain price) all superseded. Rationale: DEC-279 user directive — final .99 pricing for landing/marketing alignment.]
4. **Feature gating (DEC-043) — LOCKED "everything free".** Every product feature (commerce, analytics, email capture, scheduling, reviews, bundles, communities, upsells, discount codes, Przelewy24/BLIK) is Free. Pricing differentiation: custom domain add-ons (primary revenue, ~97% margin), Pro power features (§18), Business agency features (§19).

### 0.2 Anti-patterns resolved (from `anti-patterns-audit.md`)

- **AP-001** — No "Powered by tadaify" footer on ANY tier. Not a paid unlock. Hard-locked. (Self-referral growth block F-125 is opt-in, not a watermark.)
- **AP-047** — F-UPSELL-004 uses Recommended BADGE only; default radio stays Free regardless of follower signals.
- **AP-018/046** — 0% fees published as contractual Trust Center commitment, not just a marketing bullet (F-172a, F-TRUST-001).
- **AP-010** — One-click cancel (F-180a), no multi-step survey cascade.
- **AP-029** — Creator page stays live during dunning (F-175a). No public "did not pay" overlay.
- **AP-005/026/027** — Creator Safeguard (F-191b): 48h warning + human appeal + prepaid refund contract.
- **AP-036/037** — EU visitor cookie consent on creator pages (F-058a).
- **AP-029-adjacent** — F-PREVIEW-004 disclosure: prominent top strip "Preview only" + one-click remove form; admin cannot disable.

### 0.3 What did NOT change from v1

- Product positioning as link-in-bio + lightweight creator commerce platform aimed at nano/micro creators.
- EU regulatory wedge (VAT OSS, Przelewy24, BLIK, SEPA, EU/PL payment methods).
- Brand lock (Indigo Serif palette, variant-F wordmark, Warm-orb motion, tagline "Turn your bio link into your best first impression.").
- LinkOfMe-inherited port surface (~45 BRs ≈ 60-70% code reuse for analytics, auth, admin, moderation, rate-limits, GDPR, maintenance mode, social-icon auto-detect, QR share).
- F-001 through F-019 onboarding units (with F-012 removed per DEC-TRIAL-01, see §3).
- F-020 through F-049 editor units (with gating updates per §4).
- F-050 through F-063 public page rendering (with F-060 replaced by F-CUSTOM-DOMAIN-001..003).
- F-070 through F-085 commerce (all gating flipped to Free per DEC-043).
- F-100 through F-113 analytics (retention window tiered, full depth Free).
- F-115 through F-121 email & audience.
- F-125 through F-139 growth loops.
- F-140 through F-164 customization & theming.
- F-165 through F-169 templates.
- F-170 through F-179 trust/hosting (F-170 replaced by F-CUSTOM-DOMAIN-003 billing).
- F-180 through F-191 admin & trust (expanded with F-180a, F-191a, F-191b).
- F-200 through F-219 integrations & API.
- F-220 through F-229 AI features (quotas updated).
- F-230 through F-244 EU/PL localization — **NOTE: DEC-MKT-C locks EN-only marketing at launch.** PL copy, PL-culture template names (Chopin/Kopernik/Skłodowska), and PL outreach templates are deferred to Y2+ pending organic PL pull. Template naming at MVP: neutral/brand-neutral (e.g., "Indigo", "Dusk", "Minimal").
- F-245 through F-264 marketing surfaces.

### 0.4 Naming conventions

| Prefix | Meaning |
|---|---|
| `F-NNN` / `F-XXX-NNN` | Feature unit — implementable slice, 1:1 convertible to a GitHub story |
| `PAT-NNN` | Competitor pattern (from `patterns-library.md`) |
| `DEC-SYN-NN` | Strategic decision (from `tadaify-research-synthesis.md`) |
| `DEC-NNN` | 2026-04 user-locked decisions (`/tmp/claude-decisions/decisions.json`) |
| `BR-NNN` / `TR-NNN` | Business / Technical requirement (target `tadaify-app/docs/`) |
| `AP-NNN` | Anti-pattern (from `anti-patterns-audit.md`) |
| `STS-/LT-/BCN-/CRD-/LKB-/TPL-NNN` | Competitor screen citations |

---

## 1. Product positioning summary (v2 locked)

**Tadaify is the link-in-bio + creator commerce platform where every product feature is free, forever.** The only things you pay for are (a) your own domain on your own URL and (b) power features that only matter once you have a real audience. A nano/micro creator can ship a full tadaify page with commerce at 0% fees, deep analytics, AI-assisted copy, email capture, scheduling, reviews, bundles, communities, PL/EU payment methods — all free.

**Single-domain architecture (DEC-DOMAIN-01 — locked 2026-04-24).** Every creator page, every marketing page, every authenticated dashboard route lives under one root: `tadaify.com` (prod) / `dev.tadaify.com` (dev). Creator URL = `tadaify.com/<handle>` is the primary brand asset — NOT `app.tadaify.com/<handle>` or any subdomain variant. The authenticated creator dashboard is at `tadaify.com/app`, the admin panel at `tadaify.com/admin`, the landing at `tadaify.com/`. Competitors (Linktree, Beacons, Stan) use `linktr.ee/<handle>` — we match with `tadaify.com/<handle>`, keeping root domain clean and simple.

**Framework (DEC-FRAMEWORK-01 — locked 2026-04-24).** Full-stack framework is Remix (merged with React Router 7 as of 2024) on Cloudflare Workers runtime. File-based routing covers all paths under the single domain. SSR for public creator/product/marketing pages (fast first paint + SEO). Client-side navigation for authenticated dashboard (SPA feel after first load). Native Cloudflare Workers adapter (`@remix-run/cloudflare`).

**DNS (DEC-DNS-01 — locked 2026-04-24).** Cloudflare is the authoritative DNS provider for `tadaify.com`. OVH holds registrar ownership; nameservers point to Cloudflare (`ns1.cloudflare.com` + `ns2.cloudflare.com`). Route 53 is not used for `tadaify.com`.

**URL routing table (complete — all under `tadaify.com`):**

```
tadaify.com/                    → landing page (marketing home)
tadaify.com/<handle>            → public creator page (PRIMARY creator asset)
tadaify.com/<handle>/p/<slug>   → per-product page
tadaify.com/app                 → authenticated creator dashboard (SPA routes)
tadaify.com/admin               → admin panel (authenticated, admin-only)
tadaify.com/try                 → guest-mode editor (pre-signup, F-001)
tadaify.com/register            → signup flow
tadaify.com/login               → login
tadaify.com/pricing             → pricing page
tadaify.com/trust               → Trust Center (F-TRUST-001)
tadaify.com/faq                 → FAQ
tadaify.com/t/<template-name>   → public template preview (F-131, F-059, F-167)
tadaify.com/templates           → template gallery (category filter)
tadaify.com/directory           → public creator directory
tadaify.com/vs/<competitor>     → 11 vs-pages
tadaify.com/for/<niche>         → 5 niche landing pages
tadaify.com/blog                → blog (if shipped Y1)
tadaify.com/api/*               → backend (Supabase Edge Functions + Cloudflare Workers)
tadaify.com/assets/*            → static assets (Cloudflare R2)
tadaify.com/opt-out             → preview generator opt-out form
```

**Subdomains (separate concerns only — no handle-namespace collision):**

```
preview.tadaify.com              → admin preview generator output (F-PREVIEW-004)
developers.tadaify.com           → API docs portal (Mintlify/Docusaurus)
status.tadaify.com               → uptime page (BetterUptime/Statuspage integration)
mail.tadaify.com                 → Resend email sender (SPF/DKIM)
```

Pricing:

| Tier | USD | What's gated ON (not unlocked from below) |
|---|---|---|
| Free | $0 | Subdomain only (`tadaify.com/you`). Custom domain optional via universal $1.99/mo add-on (see F-DOMAIN-ADDON-001) — no plan upgrade required; 90d analytics; **5 AI uses/mo** (theme matcher + bio rewrite + copy suggest); 48h support. Pages: **1** (homepage only, post-MVP F-MULTIPAGE-001). |
| Creator | $7.99/mo | 1 custom domain included. Extra domains via universal $1.99/mo add-on; 180d analytics; **20 AI uses/mo**; 24h priority support; custom favicon; scheduled publishing; verified creator badge; directory listing opt-in. Pages: **5** (post-MVP F-MULTIPAGE-001). **Price locked for life per F-PRICELOCK-001.** |
| Pro | $19.99/mo | 1 custom domain included. Extra domains via universal $1.99/mo add-on. 8 power features (§18): unlimited analytics, **100 AI uses/mo**, A/B testing, Creator API + MCP server (OpenAPI 3.0 + `@tadaify/mcp` npm + custom GPT template), advanced integrations, removable branding in email receipts, abandoned-cart recovery, advanced SEO tools; 365d analytics; 12h support. Pages: **20** (post-MVP F-MULTIPAGE-001). **Price locked for life per F-PRICELOCK-001.** |
| Business | $49/mo | 10 custom domains included (agency — manage multiple client pages from one account). Extra domains via universal $1.99/mo add-on. Agency sub-accounts + white-label + 4h SLA; all-time analytics; **unlimited AI**. Pages: **unlimited** (post-MVP F-MULTIPAGE-001). **Price locked for life per F-PRICELOCK-001.** |

**DEC-PRICELOCK-01** (numeric 0027) — price-lock-for-life — see [docs/decisions/0027-price-lock-for-life.md](../decisions/0027-price-lock-for-life.md)

**DEC-PRICELOCK-02** (numeric 0028, domain price superseded by DEC-279) — universal domain add-on — see [docs/decisions/0028-domain-addon-pricing.md](../decisions/0028-domain-addon-pricing.md)

**DEC-MULTIPAGE-01** (numeric 0024) — multi-page post-MVP, forward-compat MVP — see [docs/decisions/0024-multi-page-post-mvp.md](../decisions/0024-multi-page-post-mvp.md)

**DEC-083** (numeric 0008) — superseded same-day — see [docs/decisions/0008-pricing-interim-8-19.md](../decisions/0008-pricing-interim-8-19.md)

**DEC-279** (numeric 0009) — final pricing $7.99/$19.99/$1.99 — see [docs/decisions/0009-pricing-final-7.99-19.99.md](../decisions/0009-pricing-final-7.99-19.99.md)

### 1.1 The five wedges (v2-locked)

1. **"Linktree Premium on Free, forever."** Not just Linktree Pro $12 — Linktree **Premium** $30. Every feature Linktree paywalls at any tier (custom themes, deep analytics 90d Free / 180d Creator / 365d Pro, email capture, scheduling, per-block CTA, full block library, no branding on any tier — AP-001 hard-locked, QR, entrance animations, featured/highlighted blocks, inline checkout, reviews, bundles, PL/EU payments) ships on Free or Creator. Anchor units: F-003 / F-023 / F-030 / F-050 / F-072 / F-077 / F-148.
2. **0% platform fees at every tier, contractually locked. Published on Trust Center. Guaranteed for the Price Lock window (`F-172a`).** Linktree takes 12% on Free, 9% on Starter+Pro, 0% only on Premium $30. Beacons takes 9% on Free+Creator, 0% on Creator Plus $30. Stan takes 0% but has no Free. Tadaify takes 0% on every tier, forever — the commitment is published on `tadaify.com/trust/zero-fee`, bound by the Price Lock (DEC-SYN-06), and cannot be raised mid-subscription. A creator at $300/mo MRR keeps $300 on tadaify vs $273 on Linktree Pro.
3. **Custom domain at $1.99/mo — the category's lowest entry point.** Lnk.bio sells it at $39.99/year ≈ $3.33/mo and makes you upgrade first; we sell it at $1.99/mo as a universal add-on on any tier (no plan upgrade required ever), OR include it free with Creator/Pro ($7.99/$19.99 bundle). Positioning: domain is a commitment signal, not a revenue gate. "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included. No upgrade needed." `F-CUSTOM-DOMAIN-001..003`, `F-DOMAIN-ADDON-001`.
4. **EU/PL regulatory + payment wedge** — VAT OSS, Przelewy24 + BLIK + SEPA, EU payment methods native in checkout. None of the 7 audited competitors ship even one of these. PL creator directory, PL-culture templates, and native PL copy are deferred to Y2+ per DEC-MKT-C (EN-only marketing at launch). `F-074 / F-085 / F-127 / F-165 / F-230-F-239`.
5. **Preview-generator acquisition flywheel** — admin-only marketing tool at `/admin/marketing/preview-generator`. Admin pastes a target creator's Linktree URL (MVP), system fetches + parses, admin customizes, system generates a private `preview.tadaify.com/<slug>?ref=<hash>` URL, admin sends it privately. If the target signs up via `?ref=<hash>`, onboarding is pre-populated. Admin-only, never public. At MVP: Linktree parser only (DEC-Q5-C). Beacons, Stan, Bio.link parsers follow at M+0.5. `F-PREVIEW-001..007` (MVP) + `F-PREVIEW-010..012` (M+0.5).

### 1.2 Who we serve

- **Primary (MVP):** nano/micro IG/TikTok/newsletter creators, 0–100k followers, English or Polish speaking, tired of Linktree (price hike, bans, Pro-gating) and priced out of Stan ($29/mo min, no free).
- **Secondary (MVP):** solo digital-product sellers at $5–$50 AOV ("coach", "newsletter", "template creator").
- **Tertiary (Y1):** PL coaches, educators, service providers who need VAT-correct checkout in PLN + Przelewy24/BLIK.
- **Explicit non-targets:** enterprise / agencies (beyond F-BIZ tier), Shopify-first sellers, adult-only creators (age gate shipped quietly), 100k+ creators (Stan + Linktree have the brand gravity).

### 1.3 What we explicitly do NOT do (day-1 through Y2)

- No course hosting with video + quizzes + certificates (Stan moat).
- No native Shopify sync (Later's moat — defer Y2).
- No native iOS/Android apps (PWA-only at MVP).
- No brand-deal CRM inbox (Beacons moat).
- No lifetime one-time-payment plan (Lnk.bio territory).
- No enterprise SSO / SAML / SCIM.
- No media kit builder (Beacons signature).
- No seller fee ladder (v2-locked: always 0% on every tier).
- No no-pricing-on-landing trick.
- No celebrity showcase on landing (use real mid-creator stores).
- No anti-platform "algorithm is the enemy" verbatim copy.
- No middle-dot `·` separator (Stan's brand rhythm).
- No "Powered by tadaify" removal as a paid unlock (AP-001 hard-locked — it simply never exists on any tier).

### 1.4 Brand constraints (from `brand-lock.md`)

Domain `tadaify.com`, slug `tadaify`, wordmark `tada!ify` variant F, palette Indigo Serif (Primary #6366F1 / Secondary #8B5CF6 / Warm accent #F59E0B / Warm soft #FDE68A / BG #F9FAFB / FG #111827 / Dark canvas #0B0F1E), warm-orb 360° orbit 8.2s, `prefers-reduced-motion` static. Tagline: "Turn your bio link into your best first impression."

### 1.5 Success criteria for MVP

- Time from landing → live public page with one block: ≤ **60 seconds**.
- Free-tier D30 retention: ≥ **45%**.
- **Custom domain attach rate at D30:** ≥ **8%** of Free creators attach a custom domain via the universal $1.99/mo add-on OR upgrade to Creator $7.99 (primary revenue metric).
- **Free → Pro conversion at D60:** ≥ **1.5%**.
- Preview-generator conversion: ≥ **3% of sent preview URLs convert to signup within 7 days** (admin-only 1-to-1 outreach; private, never indexed).
- SLA adherence published + met: Free 48h / Creator 24h / Pro 12h / Business 4h (per Trust Center live dashboard `F-172`).

---

## 2. Feature areas overview

| Area | Code | Feature units | MVP count | Note |
|---|---|---|---|---|
| Onboarding & Identity | `F-001..019` | 13 | 13 | F-012 removed per DEC-TRIAL-01 (see §3) |
| Editor & Block System | `F-020..049` | 18 | 15 | Gating flipped Free per DEC-043 |
| Public Page Rendering | `F-050..069` | 14 | 12 | F-060 replaced by F-CUSTOM-DOMAIN-001..003 |
| **Preview Generator** | `F-PREVIEW-001..012` | **10** | **7 MVP** + 3 M+0.5 | Admin-only sales tool; Linktree parser MVP only (DEC-Q5-C) |
| **Custom Domain System** | `F-CUSTOM-DOMAIN-001..003` | **3** | **3** | Replaces v1 F-060; Cloudflare-for-SaaS handles CREATOR custom domains (e.g. `mycoach.com → their tadaify page`). Tadaify's own domain `tadaify.com` is managed separately via Cloudflare DNS (DEC-DNS-01) — no overlap. |
| Commerce & Checkout | `F-070..099` | 16 | 15 | All gated Free per DEC-043 |
| **Subtle Contextual Upsell** | `F-UPSELL-001..006` | **6** | **5** | F-UPSELL-005 deferred to Y1 (needs user base) |
| Analytics & Insights | `F-100..114` | 10 | 7 | Free 90d / Creator 180d / Pro 365d / Business all-time |
| Email & Audience | `F-115..124` | 6 | 5 | Campaign builder Free (1k sends/mo) |
| Growth Loops & Social Proof | `F-125..139` | 8 | 7 | All Free |
| Customization & Theming | `F-140..164` | 14 | 12 | All unlocked Free |
| Templates & Starters | `F-165..169` | 4 | 4 | 20 MVP templates (up from 8-12); neutral/brand-neutral names |
| Custom Domain & Hosting (trust/sla) | `F-170..179` | 5 | 5 | F-170 merged into F-CUSTOM-DOMAIN-003 |
| Admin & Trust | `F-180..199` | 11 | 10 | + F-180a, F-191a, F-191b |
| Integrations & API | `F-200..219` | 10 | 8 | API quota tiered per tier |
| AI Features | `F-220..229` | 5 | 4 | Free 5/mo / Creator 20/mo / Pro 100/mo / Business ∞ |
| EU/PL Localization | `F-230..244` | 8 | 8 | DEC-MKT-C: EN-only at launch; PL deferred Y2+ |
| Marketing Surfaces | `F-245..264` | 10 | 10 | Copy updated to reflect 4-tier pricing |
| **Pro-tier Power Features** | `F-PRO-001..008` | **8** | **5 MVP** + 3 Y1 | Justifies $19.99 vs $7.99 gap |
| **Business-tier Features** | `F-BIZ-001..005` | **5** | **5 MVP (DEC-Q5-A)** | Full Business tier at MVP |

**Total feature-unit count: ~157.** MVP subset: ~127 units.

---

## §31. Account vs Page settings architecture (F-ARCHITECTURE-001)

> Locked 2026-04-25. Establishes the boundary between settings that apply
> globally per account and settings that are scoped to a single page.

### Global (per account, applies to ALL pages)

| Domain | What |
|---|---|
| Profile (header) | avatar, display_name, bio, handle, social handles row |
| Theme + design tokens | colors, fonts, buttons, animations, theme preset |
| Footer | empty / custom text / social handles + opt-in support badge (DEC-OPT-BADGE) |
| Custom domain | DNS mapping (applies to whole `tadaify.com/<handle>/...` namespace) |
| Account | email, password, billing, GDPR tools, API keys (Pro tier per F-PRO-CREATOR-API-001) |

Schema: single row in `account_settings` per `user_id`. Theme stored as JSONB
for flexibility (override individual tokens without schema migration).

### Per-page (one row per page in `pages` table)

| Field | What |
|---|---|
| slug | `''` for homepage, `privacy`, `about`, `portfolio` for sub-pages |
| title | `<title>` tag + page H1 |
| description | meta description (SEO) |
| og_image_ref | Open Graph card override (NULL = inherit account's default) |
| layout_mode | `'stack'` \| `'grid'` (per-page choice per F-LAYOUT-001) |
| type | enum from `F-PAGE-TEMPLATE-FRAMEWORK-001`: `custom \| about \| portfolio \| legal \| shop \| blog \| schedule \| contact \| newsletter \| links_archive` |
| type_config | JSONB — type-specific configuration validated by per-type Zod schema |
| theme_override | OPTIONAL JSONB — overrides for any global theme token; NULL = inherit |
| noindex | for utility pages (privacy/ToS — default true for those types) |
| is_homepage | `true` for the single home page; partial unique index enforces one |
| is_published | gating for soft-launch / draft mode |
| position | order in nav menu |

### Inheritance rule

For every public page render, the effective theme = `merge(account.theme, page.theme_override)`. Override wins per-key. Default (`theme_override = NULL`) = inherit everything.

Same merge rule applies to typography, button style, animation settings — anything in the global theme JSONB. There is no inheritance for blocks (those are strictly per-page) or for Profile/Footer (those are strictly global; never overridden per-page in MVP).

### Editor surfaces

- `/app/design/*` — global settings (Theme / Profile (renamed Header) / Background (renamed Wallpaper) / Buttons / Animations / Colors / Footer)
- `/app/pages/<slug>` — per-page editor: type-specific config + blocks list + per-page override panel (default collapsed)
- `/app/domain` — global custom domain mapping
- `/app/settings` — account stuff (billing, GDPR, API keys)

### Migration impact (MVP)

- `account_settings` table created at MVP migration with one row per user backfilled from existing creator data.
- `pages` table created at MVP migration with one row per user (slug='', is_homepage=true, type='custom', layout_mode='stack' or 'grid' per user).
- `blocks.page_id` FK NOT NULL referencing `pages.id`. Backfill: every existing block points to the user's homepage.
- `theme_override` is always NULL at MVP — inheritance is the only path until F-MULTIPAGE-001 enables explicit override editing.

### DEC trail

DEC-MULTIPAGE-01 (post-MVP multi-page) + DEC-LAYOUT-01 (grid in MVP) + DEC-CREATOR-API-01 (Pro API) + plagiarism rename of Header→Profile / Wallpaper→Background all cite this section as their data-architecture anchor.

> **2026-04-25** — F-ARCHITECTURE-001 captured to prevent post-launch confusion about which settings are per-account vs per-page. All forward-compat work in F-FULLFLOW-001 + F-LANDING-001 + F-MULTIPAGE-001 issues references this section.

---

## 3. Onboarding & Identity

F-001 through F-019 ship as written in v1 §3 with the following updates:

- **F-012 — REMOVED per DEC-TRIAL-01 (2026-04-24).** Rationale: every Pro feature is sticky (team seats, custom CSS, API integrations, email campaigns, 365-day analytics). Reverting after 7 days creates data-loss UX + creator frustration + chargeback risk. Replaced by: (1) **Transparent feature preview in admin** — each Pro feature shown with `🔒 Pro $19.99/mo` pill + one-click pricing modal. (2) **30-day money-back guarantee** on Pro upgrade — full refund if creator upgrades and doesn't find value; zero data-loss revert pain. (3) **Subtle upsell F-UPSELL-001..006** covers discovery without time-bombed trial. Pattern AP-017 eliminated by removing the mechanism entirely.
- **F-015 (onboarding checklist)** — gets a new row: "Buy your custom domain for $1.99/mo" as item 5.
- Every reference to "€2–€3/mo" domain → **$1.99/mo** (DEC-036 USD).
- "Pro" in v1 text → "Pro $19.99" in this spec.

### 3.1 — F-001 · Guest-mode editor (build before signup)

- **Summary:** Visitor at `tadaify.com/try` (single-domain — no separate subdomain; DEC-DOMAIN-01) opens the editor, builds a real page preview, prompted to sign up only at Publish/Save.
- **Why it's in scope:** Largest friction cut in the audit (`PAT-067`, Carrd-only). Stan + Linktree + Beacons all force signup before editor.
- **Competitor baseline:** Carrd `/build` opens editor cold (`CRD-LAND-001`). Verdict `ADOPT`. All others signup-first. Verdict `AVOID`.
- **Behavior:** `/try` route lands on editor preloaded with template starter + 3 sample blocks. Creator can add/remove blocks, reorder, edit copy, change theme, try entrance animations, preview mobile/desktop. Cannot publish to a real handle, attach a custom domain, sell a product, or persist beyond 7 days. Guest session persisted to `localStorage` + server-side anonymous `guest_drafts` row (60-day TTL rolling). Publish → signup modal (F-002). On signup: backend migrates `guest_drafts[uuid]` → `pages[user_id]`.
- **Data model:** `guest_drafts(id uuid pk, session_cookie_id uuid, content jsonb, theme jsonb, created_at, updated_at, expires_at)` — net-new.
- **APIs:** `POST /api/guest/draft`, `PATCH /api/guest/draft/:id`, `GET /api/guest/draft/:id`, `POST /api/guest/draft/:id/migrate`. Background: pg_cron nightly delete expired.
- **Gating:** Free (and guest). No Pro/Business uplift.
- **Eng effort:** **L** (2 weeks).
- **Dependencies:** `F-020` editor shell; `F-025` theme engine; `F-002` signup modal.
- **MVP**. Test: cold `/try` → editor loads → save + reopen → draft restored → signup → page intact + draft deleted.

### 3.2 — F-002 · Progressive username-first signup with live preview

- **Summary:** Handle claim first (with 3 smart alternatives + live `tadaify.com/<handle>` preview in brand wordmark), then SSO/email on screen 2. Signup route: `tadaify.com/register` (DEC-DOMAIN-01).
- **Why:** Commits visitor to identity before asking for credentials (`PAT-001`, Beacons). Stan's all-at-once signup (`PAT-024`) is explicitly avoided.
- **Behavior:** Screen 1 — Claim handle: input with live availability debounced 300ms; live `tada!ify/<handle>` wordmark materializes; 3 smart alternatives on taken-handle; soft-skip to auto-handle. Screen 2 — Credentials: 3 buttons Google / Apple / email. Screen 3 — Welcome reveal: multi-select social platform picker + handle-entry step (F-004, updated per DEC-SOCIAL-01). No phone field (`PAT-025` AVOID). `profiles.plan = 'free'` default.
- **Data model:** `profiles(user_id pk, handle text unique, display_name, avatar_url, locale, country_code, plan text default 'free', stripe_customer_id, stripe_subscription_id, subscription_status, price_locked_until date, fee_locked_until date, created_at)`.
- **APIs:** `GET /api/handle/available?h=<handle>`, `GET /api/handle/suggestions?h=<handle>&locale=pl|en`, `POST /api/handle/claim`.
- **Gating:** N/A (signup is universal).
- **Eng effort:** **M** (1 week). **MVP**.

### 3.3 — F-003 · Google + Apple SSO + email signup

- **Summary:** Three authentication methods from day 1.
- **Implementation:** Supabase GoTrue with Google + Apple providers. Post-signup webhook → welcome email + seed page.
- **Eng effort:** **S** (2 days). **MVP**.

### 3.4 — F-004 · Social handle entry (updated — DEC-SOCIAL-01)

- **Summary:** User selects which platforms they're on (multi-select: IG / TikTok / YouTube / X / Twitch / Spotify / LinkedIn / Pinterest / Threads) and provides their @handle for each. tadaify generates "Follow me on X" link blocks pointing to the canonical URL. No OAuth, no API calls, no account connection.
- **UI:** For each selected platform: platform icon + prefixed input (e.g. `instagram.com/` + `<input>`). Live preview: *"This will appear as: Follow me on Instagram → instagram.com/yourname"*. Pre-fill with tadaify handle as default. Per-platform "Skip this platform" link removes that row.
- **Output:** `social_handles` map stored on `profiles`. Each entry generates a social-profile block on the page (F-205 auto-detection runs on the resulting URL).
- **Step in onboarding flow:** Step 2 of 5 (welcome → **social-handles** → template → blocks → tier → complete = 6 screens; "Step 1 of 5" labels collapse welcome+social conceptually per mockup).
- **Gating:** Free. **Eng effort:** **S** (2-3 days — pure form, no external APIs). **MVP**.

> **Note:** OAuth-based auto-import of IG/TikTok bio + avatar + recent posts is deferred to Pro tier as a power feature (see F-PRO-OAUTH-IMPORT). Rationale: Facebook app review 2–8 weeks; Instagram Basic Display API deprecated Dec 2024; Instagram Graph requires Business accounts; minimal MVP value vs. 30 seconds manual entry.

### 3.5 — F-005 · (merged into F-004 — DEC-SOCIAL-01)

TikTok handle entry is part of the unified F-004 multi-platform handle form. No separate TikTok API call at MVP.

### 3.6 — F-006 · Palette auto-extract from avatar (k-means)

- **Summary:** k-means on 128×128 downsampled avatar → derive 3-5 color palette → apply as theme defaults.
- **Gating:** Free. **Eng effort:** **M** (1 week). **MVP**.

### 3.7 — F-007 · First-run reveal (before-plain → after-styled split preview)

- **Summary:** On first login post-onboarding: split-screen "plain link list" → "your tadaify page" with entrance animation. (Previously described as "post-import" — updated per DEC-SOCIAL-01: there is no OAuth import; reveal fires after handle entry + template selection.)
- **Eng effort:** **M** (1 week). **MVP**.

**DEC-SOCIAL-01** (numeric 0011) — social-import via handle-based link generation (not OAuth) — see [docs/decisions/0011-social-import-handle-based.md](../decisions/0011-social-import-handle-based.md)

### 3.8–3.19 — F-008..F-019 (shortened)

- **F-008** Dynamic `Hey @<handle> 👋` welcome. **S**, **MVP**.
- **F-009** Unsaved-changes guard modal. **S**, **MVP**.
- **F-010** Avatar + cover image upload with cropping. **M**, **MVP**.
- **F-011** Country-code + locale auto-detect (Cloudflare CF-IPCountry). **S**, **MVP**.
- ~~**F-012** 7-day Pro trial — **REMOVED per DEC-TRIAL-01**. See §3 header.~~
- **F-013** Handle-locale suggestions (PL vs EN). **S**, **MVP**.
- **F-014** Progress bar during signup (3 steps). **S**, **MVP**.
- **F-015** Onboarding checklist (5 items including "Buy your custom domain $1.99/mo"). **M**, **MVP**.
- **F-016** Email onboarding sequence (7 emails over 30 days via Resend). **M**, **Y1**.
- **F-017** Skip-for-now path everywhere. **S**, **MVP**.
- **F-018** Registration limit / invite-gate (admin-toggleable). **S**, **MVP-early**.
- **F-019** Sign in with Apple compliance. Route: `tadaify.com/login` (DEC-DOMAIN-01). **S**, **MVP** (if Apple Dev account ready, else Y1).

---

## 3a. Preview Generator (MVP-critical, admin-only marketing tool)

**Architecture decision (DEC-MKT-B-v2 + DEC-Q5-C + DEC-DOMAIN-01 — locked):** the preview generator is an **admin-only private marketing tool** at `tadaify.com/admin/marketing/preview-generator`. There is no `tadaify.com/preview/<handle>` public URL — that would collide with the handle namespace. Generated previews are served at `preview.tadaify.com/<slug>?ref=<hash>` (kept on subdomain precisely to prevent handle-namespace collision with real `tadaify.com/<handle>` creator pages) and sent privately 1-to-1.

**DEC-Q5-C (locked):** MVP launches with Linktree-only parsing. Beacons, Stan, and Bio.link parsers are M+0.5 (F-PREVIEW-010/011/012 — approximately week +2 post-launch).

### 3a.1 — F-PREVIEW-001 · Admin preview-generator UI (MVP)

- **Summary:** Admin-auth UI at `/admin/marketing/preview-generator`; admin pastes target creator's URL, customizes, generates private shareable link.
- **Workflow:** Paste URL → parse → split-view editor (left: live preview, right: customization sidebar) → "Generate shareable preview" → `preview.tadaify.com/<slug>?ref=<hash>`.
- **Tier gating:** Admin only.
- **Eng effort:** **L** (2-3 weeks). **MVP — Week 0-3**.

### 3a.2 — F-PREVIEW-002 · Customization engine (admin-side) (MVP)

Tweaks: theme / entrance animation / layout preset / color palette / hero banner / typography / CTA text / block ordering / added blocks / hide-show blocks. Save state: `preview_config` JSONB in `preview_generations` table. **Eng effort:** **M** (1-1.5 weeks). **MVP**.

### 3a.3 — F-PREVIEW-003 · Linktree platform parser (MVP)

Server-side fetch (Supabase Edge Function / Cloudflare Worker), custom DOM-walker. Extracts: `og:image` (avatar), `og:title` + `h1` (display name), `.profile-description` (bio), `a[data-testid="LinkButton"]` (blocks), inline CSS vars (theme). Normalizes to `CreatorPreviewData`. **Eng effort:** **S** (2-3 days). **MVP — Week 1**.

### 3a.4 — F-PREVIEW-004 · Preview renderer + slug management (MVP)

- **URL structure:** `preview.tadaify.com/<slug>?ref=<hash>`.
- **Footer (REQUIRED, NOT optional):** prominent disclosure strip at TOP of preview page: "Preview only — this page is not live. tadaify built this from [target's] public Linktree as a one-time preview for them. If you're @[target] and want this removed: [one-click remove form]." Only AFTER disclosure, at bottom: CTA "Claim @yourhandle on tadaify →". Admin cannot disable the top disclosure.
- **Remove-on-request form** at `preview.tadaify.com/remove/<slug>` — target confirms via email-match → preview deleted + admin notified + target blacklisted from future outreach.
- **Security:** `noindex, nofollow` meta tag; `/preview/*` in `robots.txt disallow`; rate limit 100 views/hour per slug.
- **Expiry:** default 90 days (admin-configurable). On expiry: slug freed + 404 + email to admin.
- **Eng effort:** **M** (1 week). **MVP — Week 2-3**.

### 3a.5 — F-PREVIEW-005 · Hash-based referral + onboarding inheritance (MVP)

If target signs up via `?ref=<hash>`, onboarding pre-populated with admin's customization (theme, animation, layout, blocks). **Eng effort:** **M** (1 week). **MVP — Week 3**.

### 3a.6 — F-PREVIEW-006 · Admin preview dashboard (MVP)

Table of all generated previews: slug, target handle, platform, status (active/expired/burned/converted), view count, conversion status. Bulk actions: extend expiry, burn, clone. **Eng effort:** **M** (1 week). **MVP — Week 3-4**.

### 3a.7 — F-PREVIEW-007 · Admin outreach workflow integration (MVP)

On success screen: [Copy URL] / [Generate IG DM copy — EN only per DEC-MKT-C] / [Generate email copy] / [Log outreach]. **Eng effort:** **S** (3-5 days). **MVP — Week 4**.

### 3a — Database schema (F-PREVIEW shared)

```sql
CREATE TABLE preview_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now(),
  source_url TEXT NOT NULL,
  source_platform TEXT NOT NULL,  -- 'linktree' | 'beacons' | 'stan' | 'biolink' | 'other'
  target_handle TEXT,
  target_display_name TEXT,
  slug TEXT UNIQUE NOT NULL,
  slug_is_target_handle BOOLEAN DEFAULT FALSE,
  hash TEXT UNIQUE NOT NULL,
  preview_config JSONB NOT NULL,
  imported_data JSONB NOT NULL,
  expires_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'active',  -- 'active'|'expired'|'burned'|'converted'
  outreach_log JSONB DEFAULT '[]',
  view_count INTEGER DEFAULT 0,
  unique_visitor_count INTEGER DEFAULT 0,
  cta_click_count INTEGER DEFAULT 0,
  converted_user_id UUID REFERENCES profiles(id),
  converted_at TIMESTAMPTZ
);
CREATE INDEX idx_preview_generations_slug ON preview_generations(slug);
CREATE INDEX idx_preview_generations_hash ON preview_generations(hash);
CREATE INDEX idx_preview_generations_admin ON preview_generations(admin_id);
CREATE INDEX idx_preview_generations_status ON preview_generations(status);
```

**RLS:** admin users only (SELECT + INSERT + UPDATE + DELETE).

### 3a M+0.5 — Additional platform parsers

- **F-PREVIEW-010** · Beacons HTML parser — `https://beacons.ai/<handle>`, `data-type="block"` selectors. **S** (2-3 days). **M+0.5 ~week +2**.
- **F-PREVIEW-011** · Stan Store HTML parser — `.product-card`, `.link-card`, `.creator-avatar`. **S** (2-3 days). **M+0.5**.
- **F-PREVIEW-012** · Bio.link HTML parser — clean semantic HTML, simplest parser. **S** (2-3 days). **M+0.5**.

---

## 3b. Custom Domain System (replaces v1 F-060)

### 3b.1 — F-CUSTOM-DOMAIN-001 · CNAME verification + DNS instructions UX

Creator enters `yourdomain.com` → UI shows DNS instructions (registrar-specific: OVH PL / Cloudflare / GoDaddy / Namecheap via WHOIS nameserver) → polls verification every 30s → status: pending / verifying / active / failed.

**Data model:** `custom_domains(id uuid pk, user_id fk, domain text unique, status text, cloudflare_custom_hostname_id text, ssl_status text, verified_at, last_error text, created_at, updated_at)`.

**Tier gating:** Free: 0 included (add 1 @ $1.99/mo via universal add-on). Creator $7.99: 1 included. Pro $19.99: 1 included. Business $49: 10 included (agency). Extra domains on any tier: $1.99/mo each via F-DOMAIN-ADDON-001.

**Eng effort:** **M** (1.5 weeks). **MVP — Week 6-8**.

### 3b.2 — F-CUSTOM-DOMAIN-002 · Cloudflare for SaaS API integration

Supabase Edge Function wraps Cloudflare Custom Hostnames API. On create: POST custom hostname → store id → poll for active. On Cloudflare webhook: update row status. On delete: Cloudflare API DELETE. Exponential retry on 5xx.

**Tier gating:** enforced server-side via `custom_domain_quota(user_id)` RPC.

**Eng effort:** **M** (1 week). **MVP — Week 6-8**.

### 3b.3 — F-CUSTOM-DOMAIN-003 · Stripe metered billing integration

$1.99/mo per add-on domain beyond tier quota. Stripe product `custom_domain_addon`, metered by quantity. UI shows "This will add $1.99/mo to your subscription. Confirm?" On remove: proration credit.

**Eng effort:** **M** (1 week). **MVP — Week 8-9**.

---

## 4. Editor & Block System

v1 §4 spec stands for F-020 through F-049. Gating flips per DEC-043:

| Unit | v1 gating | v2/final gating |
|---|---|---|
| F-028 Product block | Pro | **Free** |
| F-029 Community block | Pro | **Free** |
| F-030 Bundle block | Pro | **Free** |
| F-031 Countdown timer | Pro | **Free** |
| F-040 Featured highlight | Pro | **Free** |
| F-042 Form builder | Pro (Y1) | **Free (MVP)** |
| F-044 Geo-conditional block | Pro | **Free** |
| F-045 Device-conditional block | Pro (Y1) | **Free (Y1)** |
| F-046 A/B test per block | Pro (Y1) | **Pro (Y1)** — STAYS POWER FEATURE (`F-PRO-007`) |
| F-038 Version history | Pro (Y1) | **Pro (Y1)** — STAYS POWER FEATURE (`F-PRO-006`) |
| F-039 Multi-page support | Free 1 / Pro 5 / Biz ∞ | Free 1 / Creator 3 / Pro 10 / Business ∞ |

### 4a — Editor IA guideline (progressive disclosure — AP-045 fix)

The editor surfaces a **Getting Started** set of 6 blocks by default (link, image, text, product, social, email-capture). "More blocks" reveals the full 30+ catalogue on click. First-time creators never see the long list. AP-045 mitigated; AP-030 mitigated ("too many clicks" = avoided because the 6 defaults cover 90% of first-session use).

### Key editor feature units (v1 spec, carried forward)

- **F-020** — Editor shell (3-pane: left palette / center preview / right settings). Autosave 2s, undo/redo 30 steps. **XL** (4 weeks). **MVP**.
- **F-021..F-023** — Link / External-link / Section-header blocks. **M**. **MVP**.
- **F-024** — Affiliate-link block (FTC-compliant auto-disclosure, locked). **S**. **MVP**.
- **F-025** — Lead-magnet block (email capture for free download, double opt-in). **L**. **MVP**.
- **F-026** — Embed block (YouTube/Spotify/Vimeo/Calendly/generic iframe). **M**. **MVP**.
- **F-027** — Social-profile block with live follower count (cron refresh 24h). Free basic / Pro live count. **L**. **MVP**.
- **F-028** — Product block (paid digital product). All tiers Free. **XL**. **MVP**.
- **F-029** — Community block (recurring subscription). Free. **L**. **MVP**.
- **F-030** — Bundle block. Free. **M**. **MVP**.
- **F-031** — Countdown-timer block. Free. **M**. **MVP**.
- **F-032** — Rich-text editor (tiptap). **M**. **MVP**.
- **F-033** — Per-block custom CTA label. Free. **S**. **MVP**.
- **F-034** — Drag-and-drop block reorder (dnd-kit). **M**. **MVP**.
- **F-035** — Block visibility toggle. **S**. **MVP**.
- **F-036** — Block scheduling (scheduled_at / expires_at). Free. **S** (port from LOM). **MVP**.
- **F-037** — Draft vs Published state + preview-only link. **M**. **MVP**.
- **F-038** — Version history + rollback. Pro. **M**. **Y1**.
- **F-039** — Multi-page support. Free 1 / Creator 3 / Pro 10 / Business ∞. **M**. **MVP**.
- **F-040** — "Featured" highlight (animated emphasis). Free (was Pro in v1). **S**. **MVP**.
- **F-041** — QR-code block. Free. **S**. **MVP**.
- **F-042** — Form (custom multi-field). Free. **L**. **MVP** (moved from Y1).
- **F-043** — Booking (Calendly embed shortcut). Free link / Pro native embed. **M**. **MVP** thin.
- **F-044** — Geo-conditional block. Free (was Pro). **M**. **MVP**.
- **F-045** — Device-conditional block. Free (Y1). **S**. **Y1**.
- **F-046** — A/B test per block. Pro (Y1). **L**. **Y1**.
- **F-047** — Import from Linktree (one-click migration). Free. **L**. **MVP**.
- **F-048** — Copy-paste block duplicate. Free. **S**. **MVP**.
- **F-049** — Block template library. Free. **M**. **MVP**.

---

## 5. Public Page Rendering

v1 §5 spec stands for F-050 through F-063. Gating flips:

| Unit | v1 | Final |
|---|---|---|
| F-058 Password-protected pages | Pro | **Free** (DEC-043) |
| F-060 Custom domain add-on | Free + $3 OR Pro | → REPLACED by `F-CUSTOM-DOMAIN-001..003` |

**Architecture note (DEC-035 + DEC-FRAMEWORK-01 + DEC-DOMAIN-01):** F-050 hub renderer + F-051 per-product page are Remix routes on Cloudflare Workers runtime (not Next.js-on-Vercel as v1 assumed; not `app.tadaify.com` as alternate design). Routing: `tadaify.com/<handle>` → Remix loader identifies creator page. `tadaify.com/<handle>/p/<slug>` → Remix loader identifies product page. All under single domain. Cache invalidation: on Publish → Edge Function calls Cloudflare Cache API `purge` with tags `tenant:<handle>`. Media (avatars, thumbnails, hero banners) served from R2. Template previews at `tadaify.com/t/<name>` (DEC-DOMAIN-01).

### 5a — F-058a · Creator-page visitor cookie consent (EU — AP-036/037 fix)

- **Summary:** When a creator has enabled any tracking (F-PRO-006 pixel whitelist, F-109 GA4/Meta/TikTok, affiliate UTMs), tadaify renders a granular cookie consent banner on the creator's public page for EU visitors. Auto-detected via Cloudflare `cf-ipcountry`.
- **Behavior:** Banner: "This page uses cookies for [analytics / pixels]. Accept all · Reject non-necessary · Customize." Customize → per-category toggles. State stored in cookie, remembered 6 months. Non-EU visitors: banner hidden by default; creator can toggle "always show".
- **Eng effort:** M (1 week). **MVP** (EU launch requirement).

### Key public page feature units

- **F-050** — Hub renderer at `tadaify.com/<handle>` (SSR, Remix on Cloudflare Workers, DEC-DOMAIN-01 + DEC-FRAMEWORK-01). OG + Schema.org. **XL**. **MVP**.
- **F-051** — Per-product page `tadaify.com/<handle>/p/<slug>` (SSR + OG + Schema.org Product/AggregateRating, DEC-DOMAIN-01). Desktop 2-col sticky creator. **XL**. **MVP**.
- **F-052** — Short-form vs long-form product layout toggle. **S**. **MVP**.
- **F-053** — Mobile-first responsive (single column / 2-col desktop). **M**. **MVP**.
- **F-054** — Custom domain rendering (buyer at `yourdomain.com`) — edge router via Cloudflare. **XL** → now M (bulk handled by F-CUSTOM-DOMAIN-001..003). **MVP**.
- **F-055** — Auto-generated OG image (Satori/Cloudflare OG). **M**. **MVP**.
- **F-056** — Schema.org markup. **S**. **MVP**.
- **F-057** — Age gate interstitial (18+ click-through). Free. **S**. **MVP**.
- **F-058** — Password-protected pages. Free (was Pro). **M**. **MVP**.
- **F-059** — Public page light/dark toggle. Free. **S**. **MVP**.
- **F-061** — PWA installable (Add to Home Screen). **M**. **MVP**.
- **F-062** — Error states + maintenance banner rendering. **S** (port). **MVP**.
- **F-063** — Rate-limiting on public pages. **S** (port). **MVP**.

---

## 6. Commerce & Checkout

**Every commerce feature is Free (DEC-043).** Product creation, Stripe Connect onboarding, inline checkout, multi-currency, VAT auto-calc, order bumps, discount codes, reviews, hub aggregate trust score, order management, digital download delivery, magic-link buyer account, community subscriptions, refunds, BNPL (Klarna/Affirm Y1), Przelewy24 + BLIK + SEPA — all Free.

**Payout SLA (contractual — AP-019 fix):** all creator earnings via Stripe Connect settle on Stripe Express default schedule (T+2 US / T+7 EU) or Custom (T+1). tadaify never holds creator funds. Affiliate commissions settle T+14 via Stripe Connect. Any earnings > $5 are paid — no minimum-threshold-hold dark patterns. Published on `tadaify.com/trust/payouts`.

What commerce features remain Pro-gated:
- **F-PRO-003** — Advanced commerce analytics retention (365d → lifetime revenue reports). Pro.
- **F-PRO-008** — Abandoned cart recovery email automation. Pro.
- **F-BIZ-001** — Agency bulk product management. Business.

### Key commerce feature units

- **F-070** — Product creation UI. Free (was Pro). **XL**. **MVP**.
- **F-071** — Stripe Connect Express onboarding. Free (triggered when creator creates first product). **L**. **MVP**.
- **F-072** — Inline checkout (Stripe Elements, Apple/Google Pay, ToS checkbox). Free. **XL**. **MVP**.
- **F-073** — Multi-currency (per-creator default + buyer-locale switcher with live FX). Free. **M**. **MVP**.
- **F-074** — VAT auto-calculation (EU OSS via Stripe Tax) + invoice generation. Free. **L**. **MVP**.
- **F-075** — Order-bump upsell (one per product, default unchecked). Free. **M**. **MVP**.
- **F-076** — Discount/promo code input (visible by default). Free. **M**. **MVP**.
- **F-077** — Reviews per product (verified-buyer badge via Stripe purchase match). Free. **L**. **MVP**.
- **F-078** — Hub aggregate trust score (min 10 reviews). Free. **S**. **MVP**.
- **F-079** — Order management dashboard. Free. **M**. **MVP**.
- **F-080** — Digital download delivery (signed Storage URL, 30-day expiry). **M**. **MVP**.
- **F-081** — Buyer account (optional; magic link only MVP, full account Y1). Free. **L**. **MVP**.
- **F-082** — Community subscription (Stripe Billing recurring). Free (thin: subscribe + thank-you; gated content Y1). **L**. **MVP**.
- **F-083** — Refund UI (creator-initiated). **S**. **MVP**.
- **F-084** — BNPL (Klarna + Affirm via Stripe). Free. **M**. **Y1**.
- **F-085** — Przelewy24 + BLIK + SEPA (PL/EU payment methods). Free. **M**. **MVP**.

---

## 6a. Subtle Contextual Upsell System

**Philosophy:** tadaify never blocks a creator from using features. It gently suggests the right tier based on signals. These hints are scattered naturally throughout the UI as informational nudges — NEVER popups, NEVER modals, NEVER forced upgrade paths.

> **Copy test:** "Would a creator screenshot this and mock tadaify on Twitter?" If yes, rewrite.

### 6a.1 — F-UPSELL-001 · Social signal collection during onboarding (MVP)

Records platform mix and follower count into `creator_profile_signals` table. Follower count is collected as a **direct question** on the tier step ("How big is your audience?" with options: Under 1k / 1k–10k / 10k–100k / 100k+) — NOT scraped from a connected account (DEC-SOCIAL-01: no OAuth at MVP). Platform mix is inferred from the handles entered in F-004. Zero extra creator friction beyond the direct question. Data is creator's own — exportable via GDPR path, never sold. **S** (3-5 days). **MVP**.

### 6a.2 — F-UPSELL-002 · Tier recommendation engine (MVP)

Rules-based engine maps signals → `recommended_tier` + `confidence` + `reasoning`. Thresholds: Free (<10k followers), Creator (10k–500k), Pro (500k–5M), Business (>5M or agency). **S** (2-3 days). **MVP**.

### 6a.3 — F-UPSELL-003 · Contextual tier hints scattered in dashboard (MVP)

Small info chips (💡 icon). Never popups. Never modals. Never banners. Never blocking. Rate-limited: max 1 hint per dashboard session. Dismissible (90-day memory). "Why am I seeing this?" → shows `reasoning` from engine.

**Anti-patterns (HARD CAP — AP-031 fix):**
- No fake urgency, no fake scarcity, no popups, no modals, no countdown timers, no "Upgrade NOW!"

**Eng effort:** **M** (1 week). **MVP**.

### 6a.4 — F-UPSELL-004 · Signup form tier recommendation badge — NOT pre-selection (AP-047 fix)

If creator signs up with >100k followers detected, SHOW a "Recommended for your audience size" badge next to the Creator tier radio. **DEFAULT selection STAYS Free** regardless of signals. Never pre-check a paid radio. No A/B test of pre-select variant — we commit to "Free is the default, period."

**AP-047 hard guard:** No variant of this feature may ever pre-check a paid radio. **S** (1 day). **MVP**.

### 6a.5 — F-UPSELL-005 · Peer-creator benchmarking (Y1)

Deferred to Y1 (M+2 or later) — needs user base N≥1000 creators per cohort for statistically valid aggregates. Pro tier. **M** (1 week). **Y1**.

### 6a.6 — F-UPSELL-006 · Post-viral moment awareness (MVP)

When analytics detect a viral moment (>3× 30-day rolling average views), show small celebratory banner (dismissible): "🎉 Your traffic tripled yesterday! Creators often add a custom domain during viral moments — makes sharing cleaner." Shown once per viral event. 30-day cooldown. Shown to Free and Creator only.

**Eng effort:** **M** (1 week). **MVP**.

### Cross-cutting copy guidelines for the upsell system

1. **Always suggest, never demand.** Language: "You might find...", "Many creators pick...", "Consider...". Never: "You must...", "Upgrade now to...".
2. **Transparency.** Always explain WHY a hint is shown. Creator can click "Why am I seeing this?" to see their signals.
3. **Dismissible by default.** Every hint has an × button. Dismissals remembered 90 days. Reset via Settings → "Show me recommendations again".
4. **Opt-out supported.** Settings → Account → "Less suggestions" toggle.
5. **Match the moment.** No upsell hints during active checkout flow, editor save, or crash recovery.
6. **Mobile-friendly.** One-line max, bottom of screen, never covers nav.

---

## 6b. Creator Tier Composition ($7.99/mo — anti-patterns-audit-2026-04-24)

Creator at $7.99/mo earns its $6 premium above the $1.99 domain add-on through 8 concrete features — NONE involving "Powered by tadaify removal" or any AP-001 variant.

| Feature | Tier | Eng effort |
|---|---|---|
| 1 custom domain included | Creator | 0 (built per DEC-038) |
| Analytics retention 180d (vs Free 90d) | Creator | 0 (flip `hasFeature` + Athena query range) |
| AI generations 20/mo (vs Free 5) | Creator | 0 (quota config) |
| Priority support 24h SLA (vs Free 48h) | Creator | 0 (SLA routing) |
| Custom favicon upload | Creator | 1d (storage + render path) |
| Scheduled block publishing | Creator | 4-5d (cron + editor UI) |
| Verified creator badge (2FA + social OAuth, NOT purchase-gated per AP-048) | Creator | 2d (verification logic + badge UI) |
| Directory listing opt-in (`tadaify.com/directory`) | Creator | 0 (opt-in flag; directory is Free feature; opt-in is Creator) |

**Total new eng: ~8 days.**

**Creator messaging:** "Your own domain. Priority support (24h). 4× the AI credits. Longer analytics memory (180d). Custom favicon. Scheduled publishing. Verified creator badge. Listed in the tadaify directory. Everything you got on Free — still free."

**Anti-pattern checklist (pre-ship):**
- No AP-001 — no branding removal as benefit (tadaify has no footer branding on ANY tier).
- No AP-047 — no default pre-selection (badge only per F-UPSELL-004).
- No AP-031 — no persistent upgrade banner.
- No AP-050 — analytics / commerce / CRM basics remain Free.

---

## 7. Analytics & Insights

v2 gating (DEC-043):

| Unit | Final gating |
|---|---|
| F-100 Event tracking | **Free 90d** (Cloudflare Analytics Engine native retention) |
| F-101 Analytics overview dashboard | **Free 90d full** / **Creator 180d** / Pro 365d (`F-PRO-001`) / Business all-time |
| F-102 Per-block click analytics | **Free** (full depth) |
| F-103 Revenue analytics | **Free** (90d); Pro 365d |
| F-104 Revenue attribution per link | **Free** (90d); Pro 365d |
| F-105 Data export CSV | **Free** (last 90d); Pro all-time |
| F-107 Top 10 vs full | **Free full** |
| F-108 Conversion funnel | **Pro (Y1)** — in `F-PRO-007` |
| F-109 GA4 / Meta / TikTok pixel | **Free** |
| F-112 Weekly email digest | **Free deep** |

**Cold storage:** after 90 days, events flush to S3 + Athena. Pro gets Athena-backed 365d window. Business gets all-time dashboard.

---

## 8. Email & Audience

| Unit | Final gating |
|---|---|
| F-115 Subscriber list | **Free list + send** (capped: 1k sends/mo Free) |
| F-118 Campaign builder | **Free** (up to 1k sends/mo); Pro 10k/mo (`F-PRO-005`); Business 100k/mo |
| F-119 Automated drip | **Pro (Y1)** — in `F-PRO-005` |
| F-120 Cart-abandon recovery | **Pro** — in `F-PRO-008` |
| F-121 ESP integrations (Mailchimp/Kit/Beehiiv) | **Free** (OAuth connect to creator's own account) |

---

## 9. Growth Loops & Social Proof

F-125 through F-139 all Free (including F-131 "brag stats" flipped from Pro to Free).

- **F-125** — Self-referral growth block (opt-in by default on Free; NOT a "Powered by tadaify" watermark — AP-001 hard-locked). Creator referral code; 30% recurring commission. **M**. **MVP**.
- **F-126** — Referral program "tadaify Amplify" (30% recurring lifetime). **L**. **MVP**.
- **F-127** — Creator directory at `tadaify.com/directory` (SSR, Remix, SEO-indexed, niche + language filter; DEC-DOMAIN-01). Free opt-in; Creator = opt-in; Business = priority placement. **L**. **MVP**.
- **F-128** — Public template previews at `tadaify.com/t/<name>` (DEC-DOMAIN-01). **M**. **MVP**.
- **F-129** — OG auto-share cards (share buttons with pre-filled tweet / IG story). **S**. **MVP**.
- **F-130** — QR code share modal (PNG download). **S** (port LOM). **MVP**.
- **F-131** — "Brag stats" public counter. Free. **S**. **MVP**.
- **F-132** — Review request email (7 days post-purchase). **M**. **MVP**.

---

## 10. Customization & Theming

All gating per DEC-043:

| Unit | Final gating |
|---|---|
| F-142 Font selector | **Free 20** / Pro custom upload (`F-PRO-006`) |
| F-145 Custom favicon | **Free** (was Pro in v1) |
| F-146 Custom CSS/HTML | **Pro** (`F-PRO-006`) — moved from Business to Pro |
| F-148 Entrance animations | **Free 20** / Pro 60 (`F-PRO-007`) |
| F-153 Per-block color override | **Free** (was Pro) |

- **F-140** — Theme token system (light + dark). **L**. **MVP**.
- **F-141** — Theme presets (10-15 curated). **M**. **MVP**.
- **F-142** — Font selector (20 Free / Pro custom upload). **M**. **MVP**.
- **F-143** — Background types (solid / gradient / pattern / image). **M**. **MVP**.
- **F-144** — Button shape (pill / rounded / sharp). **S**. **MVP**.
- **F-145** — Custom favicon. Free. **S**. **MVP**.
- **F-148** — Entrance animation library (20 Free / 60 Pro). Framer Motion + Lottie. **L** (20 for MVP). **MVP**.
- **F-150** — Logo/avatar position. **S**. **MVP**.
- **F-151** — Hero layouts (5 defaults, hero-first per DEC-SYN-04). **L**. **MVP**.
- **F-152** — Spacing + corner-radius scale (cozy/compact/spacious). **S**. **MVP**.
- **F-153** — Per-block color overrides. Free. **S**. **MVP**.

---

## 11. Templates & Starters

All Free. **20 MVP templates** (up from 8-12). Template names at MVP: neutral/brand-neutral (e.g., "Indigo", "Dusk", "Minimal", "Bold", "Earth") — PL-culture names (Chopin/Kopernik/Skłodowska) deferred to Y2+ per DEC-MKT-C.

- **F-165** — 20 MVP templates. **L** (design + impl). **MVP**.
- **F-166** — Template gallery at `tadaify.com/templates` + niche category filter. **M**. **MVP**.
- **F-167** — Public template preview at `tadaify.com/t/<name>` (SSR-indexable, DEC-DOMAIN-01). **M**. **MVP**.
- **F-168** — Apply template = editable starter-blocks. **S**. **MVP**.
- **F-169** — Template search box. **S**. **MVP**.

---

## 12. Trust / SLA / Platform

F-171 through F-179 stand from v1. F-170 "custom domain billing" replaced by `F-CUSTOM-DOMAIN-001..003`.

### 12a — F-172a · Published zero-fee + price-lock contract (AP-012/018 fix)

- **Summary:** Trust Center page at `tadaify.com/trust/price-lock` + per-subscription DB field `price_locked_until` (3 years from signup) + `fee_locked_until` (same) + quarterly billing audit.
- **Behavior:** Public page: "Your price is locked at the rate you signed up at, for 3 years. If we ever raise prices, your subscription stays at your signup rate until your price-lock window ends." DB: `subscriptions.price_locked_until TIMESTAMPTZ`, `subscriptions.fee_locked_until TIMESTAMPTZ`. Quarterly cron reconciles Stripe prices vs locked prices; any drift → PagerDuty. Billing UI shows creator their own `price_locked_until` date.
- **Tier gating:** All tiers. **Eng effort:** S (2-3 days). **MVP**.

### 12a-ii — F-PRICELOCK-001 · Price-lock-for-life subscription guarantee (DEC-PRICELOCK-01)

- **Summary:** When a user subscribes to any paid tier at price X, they pay X for the entire lifetime of that uninterrupted subscription. tadaify never raises prices on active paying subscribers. A cancellation + new subscription later does trigger the then-current price. Applies to monthly and annual billing. This supersedes the prior 3-year windowed lock (F-172a `price_locked_until` date) — the lock is now **perpetual for uninterrupted subscriptions**.
- **Implementation note:** Enforced at Stripe subscription level via `price_id` anchoring — each subscription is tied to the price object at the time of signup. New public prices are new Stripe price objects; existing subs keep their original `price_id` forever. `price_locked_until` DB field is replaced by a `lifetime_lock: true` flag; `fee_locked_until` remains for the 0%-fee guarantee.
- **Justification:** Competitive differentiator vs Linktree/Beacons (which have raised prices multiple times on existing subscribers). Removes one of the biggest creator fears: "if I build here, will the price go up next year?" Builds long-term trust and lowers churn risk. Brand commitment, not a promotion — must appear on pricing page, onboarding tier step, and public marketing.
- **Copy (canonical):** "Price locked for life" / "Your price is locked for life — we never raise the price on active subscribers."
- **Universal custom-domain add-on note (DEC-PRICELOCK-02, revised by DEC-279):** The $1.99/mo custom-domain add-on is available on **every tier** (Free / Creator / Pro / Business) — never frame it as a Free-tier-only perk. Creator/Pro each include 1 domain in the plan price; Business includes 10 (agency). Extra domains cost $1.99/mo each regardless of tier. Free + add-on = $1.99/mo all-in. Copy: "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included. No upgrade needed." Implemented as F-DOMAIN-ADDON-001 (Stripe metered add-on, cancel anytime per domain).
- **Tier gating:** All paid tiers. **Eng effort:** XS (Stripe `price_id` anchoring is built-in). **MVP**.
- **See also:** `brand-lock.md §9 (Pricing commitments — locked)`.

### 12a-iii — F-DOMAIN-ADDON-001 · Universal $1.99/mo custom-domain add-on (DEC-PRICELOCK-02, revised by DEC-279)

- **Summary:** Any user on any tier (Free / Creator / Pro / Business) can attach one or more custom domains at $1.99/mo per domain, in addition to the domains included in their base plan (Free: 0 included; Creator/Pro: 1 included; Business: 10 included). The add-on is universal — not a Free-tier-only perk and not gated behind a plan upgrade.
- **Copy (canonical):** "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included. No upgrade needed."
- **Implementation:** Stripe metered add-on product `custom_domain_addon` bound to the main subscription; cancel anytime per domain; proration credit on removal. See `F-CUSTOM-DOMAIN-003` for the Stripe integration spec.
- **Presentation rules:** Never frame as "Free tier perk". Always present as universal. Surfaced on: pricing page, onboarding domain step, domain settings page, viral-moment upsell (F-UPSELL-*).
- **Tier gating:** All tiers. **Eng effort:** XS (extends existing F-CUSTOM-DOMAIN-003 metered billing; quota config only). **MVP**.
- **See also:** `brand-lock.md §9`, `F-CUSTOM-DOMAIN-001..003`, `F-PRICELOCK-001`.

### 12b — F-175a · Creator page stays live during dunning + no platform-shame overlay (AP-029 fix)

- **Summary:** If creator's subscription fails, their public page stays fully live. NO platform-branded message visible to buyers ("The owner did not pay" — AP-029 Taplink's unforced error). Creator receives dunning emails privately. Subscription-dependent features (F-PRO-006 custom CSS) continue for 14-day grace window. After grace, those features revert but core page + commerce stay live forever.
- **Why:** AP-029 — Taplink's public "did not pay" text is the cautionary tale. We commit publicly to the opposite.
- **Eng effort:** S (extends F-175 billing infra). **MVP**.

### 12c — Data ethics baseline (AP-038)

- We never sell creator or visitor data to third parties.
- We never share creator content with LLMs for training.
- Aggregate analytics (F-UPSELL-005 peer benchmarks) are per-cohort anonymized; N≥100 creators per cohort minimum.
- Published on `tadaify.com/trust/data-ethics`.

### Feature-preservation commitment (AP-042)

Once a feature is shipped at a given tier, it stays at that tier or moves cheaper — never more expensive. If tadaify later decides a Free feature needs to be Creator-tier, existing users keep the feature on Free forever; only new signups see the new tier gate. Published on Trust Center. Enforced via grandfathering fields in `user_features` table.

### 12d — F-TRUST-001 · `/trust` page

Public Trust Center at `tadaify.com/trust` (DEC-DOMAIN-01 — single-root domain; NOT `trust.tadaify.com`). Aggregates all contractual commitments: zero fees, price lock, SLA targets vs actuals, payout SLA, data ethics baseline, content policy link, Creator Safeguard link. Sub-paths: `tadaify.com/trust/zero-fee`, `tadaify.com/trust/price-lock`, `tadaify.com/trust/payouts`, `tadaify.com/trust/data-ethics`. Note: `status.tadaify.com` is the SEPARATE uptime/incident monitoring page (3rd-party integration — BetterUptime/Statuspage); it stays on a subdomain because it is served by a third party. **S** (1-2 days). **MVP**.

### 12e — F-TRUST-002 · `profiles.fee_locked_until` column

`profiles.fee_locked_until TIMESTAMPTZ` — set to `now() + 3 years` at signup. Billing webhook checks this; cannot charge platform fees while column is in future. **XS** (<1 day). **MVP**.

### 12f — F-TRUST-003 · `profiles.price_locked_until` column

`profiles.price_locked_until TIMESTAMPTZ` — set at signup. Billing webhook verifies no price change before `price_locked_until`. Implements DEC-SYN-06 at DB level. **XS** (<1 day). **MVP**.

### 12g — F-TRUST-004 · ToS clause — 3-year price-lock + 0% fees

Terms of Service includes explicit clause: "tadaify commits to charging 0% platform fees on all creator product sales for the lifetime of the platform. Your subscription price is locked at your signup rate for 3 years." No fine print. No carve-outs. **XS** (legal drafting). **MVP**.

### Other trust/platform units

- **F-171** — Trust Center uptime + incidents + SLA adherence dashboard. **L**. **MVP**.
- **F-172** — SLA adherence tracker (Free 48h / Creator 24h / Pro 12h / Business 4h). **L**. **MVP**.
- **F-173** — Creator Safeguard policy (48h warning + appeals). **M** (port). **MVP**.
- **F-174** — Granular GDPR cookie consent banner (per-category toggle). **M**. **MVP**.
- **F-175** — Plan gating hooks (frontend + backend). `hasFeature(user, feature_key)`. **M**. **MVP**.
- **F-176** — Price-lock guarantee (3-year). **S**. **MVP**.
- **F-177** — Status page + incident subscriber emails. **S**. **MVP**.
- **F-178** — SSL auto-renewal cron. Included in F-CUSTOM-DOMAIN-002. **MVP**.
- **F-179** — Domain health checker (CNAME removed / expiry warning). **S**. **MVP**.

---

## 13. Admin & Trust

F-180 through F-191 as in v1 §13 (all ports from LinkOfMe).

### 13a — F-180a · One-click subscription cancellation (AP-010 fix)

- **Summary:** Billing → Cancel subscription → single confirmation modal with ONE reason dropdown (optional) and one "Cancel my subscription" button. No survey. No retention offer modal cascade.
- **Behavior:** Confirmation modal: "Cancel? Your current period continues until [date]; no further charges. Optional: Tell us why (dropdown of 6 options + Other)." ONE button: "Confirm cancel." Subscription → `cancel_at_period_end = true`. Reactivation: single button in Billing up until `current_period_end`. Post-cancel email: receipt + reactivation link.
- **Anti-pattern guardrails:** NO multi-step survey. NO retention modal ("Wait! Here's 50% off!" = AP-010). NO "Pause instead?" chained — offer pausing as one radio option in same modal.
- **Eng effort:** S (2 days). **MVP**. Test: 1 button + 1 confirmation = subscription canceled. Time-to-cancel ≤3 seconds.

### 13b — F-191a · Plain-Language Content Policy page (AP-026 fix)

- **Summary:** Public page `/trust/content-policy` with plain-English allowed/disallowed categories, real examples per category, and visual "what a borderline case looks like" panels. Linked from signup + every moderation-related email.
- **Behavior:** Sections: Allowed / Disallowed / Borderline (each borderline case has YES/NO verdict + reasoning). Last-updated timestamp + changelog visible. Search within policy.
- **Eng effort:** S (3 days). **MVP**.

### 13c — F-191b · Creator Safeguard — 48h warning + human appeal + prepaid refund (AP-005/027/028 fix)

- **Summary:** Codifies DEC-SYN-05 as a committed contract. For any moderation action beyond a single-block hide:
  1. 48h notice in creator's inbox + email BEFORE any account-level action.
  2. Human-reviewed appeal via dedicated queue (`admin_appeals` port from linkofme).
  3. If appeal fails AND creator prepaid annually: automatic refund of unused months via Stripe refund API.
  4. If appeal succeeds: account restored to pre-action state within 4h.
- **Behavior:** Creator gets email: "Your tadaify account is scheduled for [action] on [date+48h]. Reason: [summary]. Appeal here." Stripe refund: `(months_remaining / total_months) × annual_price`, processed within 14 days.
- **Eng effort:** M (1 week). **MVP**.

### Other admin units

- **F-180** — Admin panel `tadaify.com/admin` (authenticated React route within Remix SPA, not a separate subdomain; DEC-DOMAIN-01; port LOM). **M**. **MVP**.
- **F-181** — Maintenance mode (port LOM BR-041/042). **S**. **MVP**.
- **F-182** — User management (list/ban/unban). **S** (port). **MVP**.
- **F-183** — Moderation queue (port LOM BR-035..040). **S**. **MVP**.
- **F-184** — Appeals queue (48h SLA). **S** (port). **MVP**.
- **F-185** — Rate-limiting infrastructure (port LOM 4 tables + RPC). **S**. **MVP**.
- **F-186** — GDPR data export (port LOM BR-008). **S**. **MVP**.
- **F-187** — GDPR data delete (port LOM BR-010). **S**. **MVP**.
- **F-188** — Admin analytics (platform MRR, churn, creator cohort). **M**. **MVP**.
- **F-189** — Feature flag console (admin-toggle rollouts). **S**. **MVP**.
- **F-190** — Refund & dispute handling UI. **S**. **MVP**.
- **F-191** — Creator "suspicious activity" detection. **M**. **Y1**.

---

## 14. Integrations & API

| Unit | Final gating |
|---|---|
| F-200 Public REST API | **Free 100 req/hr** / Pro 1k req/hr (`F-PRO-004`) / Business 10k req/hr |
| F-201 Webhooks | **Free 3 webhooks** / Pro 10 (`F-PRO-004`) / Business 100 |
| F-203 Zapier integration | **Free** |
| F-206 Deep OAuth integrations | **Free** (Mailchimp/Kit/GA4 all free to connect) |

- **F-200** — Public REST API (creator self-serve keys, scoped). **XL** (4 weeks). **MVP**.
- **F-201** — Webhooks (HMAC-signed POST, retry with exponential backoff + DLQ). **L**. **MVP**.
- **F-202** — Public OpenAPI 3.1 spec + docs portal at `developers.tadaify.com` (kept on subdomain as a separate third-party docs portal, not a handle-conflict risk; DEC-DOMAIN-01 subdomains). **M**. **MVP**.
- **F-203** — Zapier integration (triggers + actions). **M**. **MVP**.
- **F-204** — Link Apps marketplace (15 embeds: Spotify/YouTube/TikTok/IG/Vimeo/Twitch/Calendly/Substack/Beehiiv/Kit/Patreon/Notion/Figma/Canva/Google Maps). **L**. **MVP**.
- **F-205** — Social icon auto-detection (24 platforms, port LOM BR-021). **S**. **MVP**.
- **F-206** — Deep OAuth integrations (Mailchimp / Kit / Beehiiv / GA4 / Meta Pixel). **L**. **MVP**.
- **F-208** — Marketplace `/marketplace` with search + category filters. **M**. **MVP**.

---

## 15. AI Features

**DEC-AI-QUOTA-LADDER-01** (numeric 0030) — unified AI quota: Free 5/Creator 20/Pro 100/Business unlimited — see [docs/decisions/0030-ai-quota-unified-ladder.md](../decisions/0030-ai-quota-unified-ladder.md)

**DEC-AI-FEATURES-ROADMAP-01** (numeric 0031) — text-only AI scope: theme matcher + bio rewrite + copy suggest — see [docs/decisions/0031-ai-text-only-scope.md](../decisions/0031-ai-text-only-scope.md)

| Unit | Quota (DEC-AI-QUOTA-LADDER-01=B) |
|---|---|
| F-220 AI product description | Shared pool: **5/mo** Free / **20/mo** Creator / **100/mo** Pro / ∞ Business |
| F-221 AI page copy | Same shared pool |
| F-222 AI thumbnail (pre-templated, non-generative per DEC-AI-FEATURES-ROADMAP-01) | Same shared pool |
| F-223 AI diff-approval UX | **Free** (UX pattern, no token cost) |
| F-224 AI FAQ search | **Y1 Free** |
| F-AI-BIO-REWRITE-001 AI bio rewrite | Same shared pool. **MVP**. |
| F-AI-COPY-SUGGEST-001 AI block copy suggest | Same shared pool. **MVP**. |

- **F-220** — AI product description generator (diff-approval UX). **M**. **MVP**.
- **F-221** — AI page copy generator (handle + niche → headline + tagline). **M**. **MVP**.
- **F-222** — AI thumbnail generator (gradient + typography, Satori/Canvas — pre-templated only, no generative image per DEC-AI-FEATURES-ROADMAP-01=A). **M**. **MVP**.
- **F-223** — AI diff-approval UX (before/after side-by-side). **S**. **MVP**.
- **F-224** — AI FAQ search (semantic). **M**. **Y1**.
- **F-AI-BIO-REWRITE-001** — Paste current bio, AI returns 3 alternative tones (professional / playful / minimal) via Claude Haiku. Cost ~$0.0005/call. Consumes 1 AI use from the shared quota. UI in profile card edit panel. **MVP**. See GitHub issue F-AI-BIO-REWRITE-001.
- **F-AI-COPY-SUGGEST-001** — When adding a Link/Product block, AI suggests punchy title from URL or product name. Cost ~$0.0005/call. Consumes 1 AI use. **MVP**. See GitHub issue F-AI-COPY-SUGGEST-001.

---

## 16. EU/PL Localization

All Free. **DEC-MKT-C: EN-only marketing at MVP launch.** PL UI copy, PL outreach templates, PL-culture template names (Chopin/Kopernik/Skłodowska), and PL creator directory prominence are deferred to Y2+ pending organic PL pull. Infrastructure (Przelewy24/BLIK, VAT OSS, PLN currency, PL legal docs) ships MVP.

- **F-230** — Native PL copy across entire UI + landing. **L** (translation). **EN-only MVP; PL Y2+**.
- **F-231** — Przelewy24 + BLIK + SEPA → same as F-085. **MVP**.
- **F-232** — EU VAT OSS via Stripe Tax → same as F-074. **MVP**.
- **F-233** — PL creator directory filter → F-127 with language tag. **MVP**.
- **F-234** — Template names: neutral/brand-neutral at MVP (PL-culture names Y2+ per DEC-MKT-C). **MVP**.
- **F-235** — "Ask AI about tadaify" bilingual footer (pre-authored queries for ChatGPT/Claude/Gemini). **S**. **MVP**.
- **F-236** — "Our cores" values section on landing. **S**. **MVP**.
- **F-237** — PLN currency support + PLN invoices. **M**. **MVP**.
- **F-238** — PL-IP auto-switch to PL locale → F-011. **MVP**.
- **F-239** — PL legal docs (ToS + Privacy + Cookie in PL, reviewed by PL lawyer). **M**. **MVP**.

---

## 17. Marketing Surfaces

All MVP. Copy updated to reflect 4-tier USD pricing. All routes under `tadaify.com` (DEC-DOMAIN-01).

- **F-245** — Landing hero at `tadaify.com/` with handle-claim + live wordmark preview. **M**. **MVP**.
- **F-246** — Audience-persona tabs (Creator / Educator / Services / Shops). **M**. **MVP**.
- **F-247** — Audience-segments marquee (22 niches, EN). **S**. **MVP**.
- **F-248** — FAQ at `tadaify.com/faq` (8 items + semantic search Y1). **S**. **MVP**.
- **F-249** — Real-creator showcase (2-3 seeded stores). **S**. **MVP**.
- **F-250** — Lifestyle-photography hero. **S** (editorial photoshoot). **MVP**.
- **F-251** — Pricing page at `tadaify.com/pricing` (public, in nav, all tiers). **M**. **MVP**.
- **F-252** — 11 vs-pages at `tadaify.com/vs/<competitor>` targeting weak SERPs (tadaify vs linktree etc.). **L** (content × 11). **MVP**.
- **F-253** — 5 niche landing pages at `tadaify.com/for/<niche>` (coach / newsletter / photographer / musician / real-estate). **L**. **MVP**.
- **F-254** — Legal footer (ToS / Privacy / Cookie / Trust / SLA). **S**. **MVP**.

---

## 18. Pro-tier Power Features (§N+9 — justifies $19.99 vs $7.99)

**This section justifies $19.99/mo Pro (~2.5× Creator $7.99).** Eight features, each useful for creators with real audience, each expensive to build, each NOT available on Free, each competitive vs Linktree Premium $30.

### 18.1 — F-PRO-001 · Analytics retention 365d + all-time dashboard + cohort analysis (MVP)

Free 90d (Cloudflare Analytics Engine). Creator 180d. Pro 365d live dashboard (Athena-backed) + cohort retention matrix (weekly cohort heatmap) + funnel charts. Business all-time + benchmark vs peers.

**Why worth $10/mo:** Linktree charges $12 Pro for 365d (our price anchor). Linktree charges $30 Premium for lifetime (our Business is $49).

**Eng effort:** **L** (2 weeks — Athena query plumbing + cohort SQL + UI). **MVP**.

### 18.2 — F-PRO-002 · CSV/JSON export all-time + Google Sheets live sync (MVP)

Free exports last 90d as CSV. Pro exports all-time + Google Sheets live sync (hourly row append via OAuth). Business adds Looker Studio + Tableau connectors.

**Why worth $10/mo:** ORIGINATE — nobody ships native Sheets sync. Power creators run analytics in Sheets.

**Eng effort:** **M** (1.5 weeks). **MVP** (lightweight differentiator).

### 18.3 — F-PRO-003 · Team seats (3 collaborators on Pro, 10 on Business) (MVP)

Invite up to 2 additional editors (Pro: 3 total seats). Role-based: Editor / Admin / Owner. Audit log: every action timestamped + author. Invite via magic-link email.

**Why worth $10/mo:** Linktree Premium $30 ships "Add Admins" — we match at Pro $19.99 (33% cheaper, $10/mo savings).

**Data model:** `team_memberships(id, owner_user_id, member_user_id, role, invited_at, accepted_at, revoked_at)`, `team_audit_log(...)`.

**Eng effort:** **L** (2-3 weeks). **MVP**.

### 18.4 — F-PRO-004 · API + Webhook high-quota tier + multi-scope API keys (MVP)

Free 100 req/hr + 3 webhooks. Pro 1000 req/hr + 10 webhooks + multi-scope API keys (read-only / write-orders / admin). Business 10k req/hr + 100 webhooks + SLA on webhook delivery. Webhook retries: exponential backoff 5s/30s/3min/30min/6h/24h + DLQ.

**Why worth $10/mo:** Linktree offers NO public API at any tier. We originate.

**Eng effort:** **L** (2-3 weeks). **MVP**.

### 18.5 — F-PRO-005 · Email marketing automations + 10k sends/mo + custom sender + segmentation (MVP)

Free: 1k sends/mo via `noreply@tadaify.com`, simple broadcast. Pro: 10k sends/mo via custom domain (SPF/DKIM auto-configured on Cloudflare SaaS domain), automations (trigger → delay → email OR branch), segmentation (country / purchase history / subscription status / custom tag). Business: 100k sends/mo.

**Why worth $10/mo:** Beacons Creator Plus $30 = unlimited sends — we match at Pro $19.99.

**Eng effort:** **XL** (3-4 weeks — workflow engine + sender domain verification + segmentation). **MVP**.

### 18.6 — F-PRO-006 · Custom CSS/HTML/JS + custom font upload + advanced code panel (MVP)

Pro unlocks "Custom code" panel: sandboxed CSS + limited HTML + script tag whitelisting for 8 approved analytics providers (GA4, Meta Pixel, TikTok, Hotjar, Mixpanel, Amplitude, PostHog, Plausible). Upload 1 custom font (woff2, <200KB).

**Note: tadaify branding is NOT present on any tier's public pages — there is no "remove branding" toggle because there is no branding to remove (AP-001 hard-locked).** F-BIZ-002 is white-label for agencies who want "Powered by [AgencyName]" branding on their dashboard + emails — not removal of creator-page watermarks (which don't exist).

**Why worth $10/mo:** Linktree Premium $30 ships custom code (we match at Pro $19.99).

**Eng effort:** **L** (2-3 weeks — sanitization + sandbox + R2 font serve + CSP review). **MVP**.

### 18.7 — F-PRO-007 · A/B testing per block + smart-winner auto-promote + funnel analytics (Y1)

Pro creators set up A/B test on any block (50/50 split) → auto-promote winner at >95% Bayesian confidence. Funnel analytics: visitors → block click → checkout → purchase → review with drop-off visualization.

**Why worth $10/mo:** Linktree Premium $30 ships "Experiments" — we match at Pro $19.99.

**Eng effort:** **XL** (3 weeks). **Y1 M+3**.

### 18.8 — F-PRO-008 · Abandoned cart recovery + commerce automations + Stripe advanced features (Y1)

Abandoned cart (checkout started but not completed → email 1h + 24h later), post-purchase upsell email (7-day follow-up with related product discount), subscription dunning customization.

**Why worth $10/mo:** Proven +5-15% revenue lift. Stan Pro $99 has this — we match at 15% of price.

**Eng effort:** **L** (2 weeks). **Y1 M+4**.

### 18.9 — F-PRO-OAUTH-IMPORT ~~[PERMANENTLY REMOVED — DEC-APIPAGES-01=C]~~

**DEC-APIPAGES-01** (numeric 0026) — platform OAuth import permanently removed; Creator API is the better investment — see [docs/decisions/0026-platform-oauth-import-rejected.md](../decisions/0026-platform-oauth-import-rejected.md)

### 18.10 Pro-tier summary — "is $19.99 worth 2.5× Creator?"

> "I'm on Creator $7.99 for my domain. I've grown to 5k monthly visitors. Pro at $19.99 unlocks:
> 1. Full-year analytics + cohort retention charts
> 2. Live Google Sheets sync of my analytics
> 3. My social media manager gets her own editor seat
> 4. I build a Discord bot using the tadaify API (1000 req/hr)
> 5. I send newsletters from `hello@mydomain.com` with automations
> 6. I customize my page with my own CSS + custom font
> 7. (Y1) I A/B test my top product's headline
> 8. (Y1) I recover abandoned carts silently churning
> Am I getting $12/mo of value (= $19.99 − $7.99)? If I have ≥1k monthly visitors: obviously yes."
>
> Note: Pro includes 1 custom domain (same as Creator). Multi-domain is a Business/agency need. Pro's differentiator is the 8 power features above, not domain count.

MVP ships 5 of 8 Pro features live (F-PRO-001/002/003/004/005/006 at MVP; F-PRO-007 and F-PRO-008 at Y1).

---

## 19. Business-tier Features (all MVP per DEC-Q5-A)

Business tier at $49/mo targets social media managers + small agencies running 3-10 creator pages. **All 5 F-BIZ units ship MVP per DEC-Q5-A (user locked).** No stripped-down beta, no deferred features.

### 19.1 — F-BIZ-001 · Agency sub-accounts (master account manages N creator pages) (MVP)

Owner account manages N child creator pages under one dashboard. Each child has own handle + theme + blocks + commerce. Owner sees all children; can bulk-edit (apply theme to N children); context-switch instantly.

Billing: Owner pays single Business $49 + $1.99/mo per sub-account beyond the first 3 included.

**Data model:** `profiles.agency_parent_id uuid fk → profiles.user_id`; RLS policies let parent SELECT/UPDATE child pages.

**Eng effort:** **XL** (3-4 weeks). **MVP**.

### 19.2 — F-BIZ-002 · White-label domain + co-branded emails + custom ToS (MVP)

Agency can brand the admin UI under their own domain + customize email sender for all their creator accounts + add custom Terms & Conditions. Public creator pages have no platform branding on any tier (AP-001 hard-locked); white-label here means the **agency dashboard + emails** branded as "[AgencyName]".

**Eng effort:** **L** (2 weeks). **MVP** (per DEC-Q5-A).

### 19.3 — F-BIZ-003 · Priority support + 4h SLA + dedicated CSM (MVP)

Business tickets routed to priority queue. 4h response SLA published on Trust Center. Dedicated CSM for accounts >$500/mo.

**Eng effort:** **S** (routing + Trust Center config). **MVP**.

### 19.4 — F-BIZ-004 · Bulk product + block management across sub-accounts (MVP)

Owner selects N sub-accounts → bulk apply: "Add this product to all selected" / "Update theme across all" / "Schedule campaign across all."

**Eng effort:** **L** (~2 weeks). **MVP**.

### 19.5 — F-BIZ-005 · Agency revenue reporting + client billing (MVP)

Report revenue across sub-accounts + generate invoice to agency's own clients with configurable markup.

**Eng effort:** **L** (~1 week). **MVP**.

---

## 20. Post-MVP Features (Q+1 fast-follow)

### F-MULTIPAGE-001 · Multi-page accounts (post-MVP, Q+1 — DEC-MULTIPAGE-01)

- **Summary:** Default home page at `tadaify.com/<handle>` plus user-creatable sub-pages at `tadaify.com/<handle>/<slug>` (e.g. `/privacy`, `/about`, `/portfolio`, `/links-archive`, workshop landings, affiliate disclosures). Each page has its own blocks, theme overrides, SEO metadata.
- **Tier limits:** Free **1** page · Creator **5** pages · Pro **20** pages · Business **unlimited**.
- **Eng effort:** M-L (3-5 days schema + editor list + SSR routing; +1-2 days tests). Cheap because architecture was forward-compat from MVP.
- **Schema (anchor for forward-compat in MVP stories):**
  - new `pages` table (id, user_id FK, slug, title, description, is_homepage, `layout_mode='stack'|'grid'`, theme_override JSONB, position, is_visible_in_nav, is_published, noindex, timestamps). **NOTE: `layout_mode` enum ships with both `'stack'` and `'grid'` values from MVP per DEC-LAYOUT-01=A (grid ships in MVP, see F-LAYOUT-001).**
  - `blocks.page_id` FK NOT NULL (MUST be added in MVP F-FULLFLOW-001 even though only one page exists)
  - one-homepage-per-user partial unique index
- **URL contract (MVP MUST honour):** `/<handle>` resolves to `is_homepage=true` page; `/<handle>/<slug>` resolves to slug. Implementer in MVP can hardcode slug='' but routing pattern must accept any slug.
- **DEC trail:** **DEC-MULTIPAGE-01** (numeric 0024) — see [docs/decisions/0024-multi-page-post-mvp.md](../decisions/0024-multi-page-post-mvp.md). See also `docs/research/multi-page-grid-and-templates.md`.
- **Scope (out for MVP):** API-driven page templates (DEC-APIPAGES-01=C — platform OAuth import removed from roadmap entirely, see below). Grid layout per page ships in MVP per DEC-LAYOUT-01=A (see F-LAYOUT-001).

### F-LAYOUT-001 · Grid layout editor — drag-on-cell + col/row span (MVP per DEC-LAYOUT-01=A)

- **Summary:** Every page can switch between `layout_mode='stack'` (vertical list, current default) and `layout_mode='grid'` (CSS Grid with configurable col/row placement). Grid mode ships in MVP per DEC-LAYOUT-01=A.
- **Schema additions to MVP (alongside F-FULLFLOW-001 and F-MULTIPAGE-001):**
  - `block_placements` table: `id, block_id FK, page_id FK, col SMALLINT NOT NULL DEFAULT 1, row SMALLINT NOT NULL DEFAULT NULL (auto), span_cols SMALLINT NOT NULL DEFAULT 1, span_rows SMALLINT NOT NULL DEFAULT 1, mobile_order SMALLINT, updated_at`. Unique constraint on `(page_id, block_id)`.
  - `pages.layout_mode` enum: `'stack' | 'grid'` (default `'stack'`).
- **Editor UX:** drag-onto-cell (powered by `@dnd-kit/core` — consistent with sortable block list on stack mode), resize handles for col/row span, mobile auto-collapse to 1-column with manual `mobile_order` override per block. Tier: all tiers in MVP.
- **CSS rendering (public page):** `display: grid; grid-template-columns: repeat(N, 1fr)` (N configurable per page, default 2 on mobile 1). Each block placed via `grid-column: col / span span_cols; grid-row: row / span span_rows`. Mobile breakpoint collapses to single column ordered by `mobile_order ASC NULLS LAST, row ASC`.
- **Drag-drop library:** `@dnd-kit/core` + `@dnd-kit/sortable` (already used for stack mode reorder; extend with grid sensor).
- **Eng effort:** M (1-2 weeks editor + schema + rendering). **MVP**.
- **Dependencies:** F-FULLFLOW-001 (block system), F-MULTIPAGE-001 schema forward-compat (page_id FK).
- **DEC trail:** **DEC-LAYOUT-01** (numeric 0025) — see [docs/decisions/0025-grid-layout-ships-mvp.md](../decisions/0025-grid-layout-ships-mvp.md). See also GitHub issue F-LAYOUT-001.

### F-PRO-CREATOR-API-001 · AI-friendly REST API for Pro tier (Creator API + MCP + custom GPT)

- **Summary:** Pro-tier feature. REST API with OpenAPI 3.0 spec, per-user API key management, MCP server npm package, and custom GPT template. Positioning: "Hire ChatGPT to manage your link-in-bio."
- **Endpoints (MVP API v1):**
  - `GET /api/v1/me` — profile + current plan
  - `GET/POST/PATCH/DELETE /api/v1/pages` — list, create, update, delete pages
  - `GET/POST/PATCH/DELETE /api/v1/pages/{id}/blocks` — block CRUD
  - `POST /api/v1/pages/{id}/blocks/reorder` — reorder blocks
  - `POST /api/v1/pages/{id}/publish` — toggle publish state
- **API key management UI:** `/app/settings/api-keys` — generate, name, copy, revoke keys. Each key is scoped to the user's own data only.
- **OpenAPI 3.0 schema:** published at `tadaify.com/api/openapi.json` + rendered at `developers.tadaify.com`.
- **MCP server:** npm package `@tadaify/mcp` — Cloudflare Workers-based, standard MCP protocol. Claude Desktop config snippet generated in settings UI.
- **Custom GPT template:** published in `/app/settings/api-keys` as a JSON-downloadable "instructions" file for ChatGPT custom GPT. Includes auth setup + recommended actions.
- **Agent-recipe gallery:** 3 starter recipes (Daily YT refresh / Pinned message from Notion / Reorder by click analytics) — linked from settings page.
- **Rate limit:** 1000 req/h Pro (header `X-RateLimit-Remaining`). Business: 5000 req/h.
- **Tier gating:** Pro $19.99/mo + Business $49/mo. Free/Creator see a teaser in settings with upgrade CTA.
- **Eng effort:** L (2-3 weeks — API layer, key management, OpenAPI, MCP package, GPT template). **Y1 M+2**.
- **DEC trail:** **DEC-CREATOR-API-01** (numeric 0029) — see [docs/decisions/0029-creator-api-pro-tier.md](../decisions/0029-creator-api-pro-tier.md). **DEC-APIPAGES-01** (numeric 0026) confirms this replaces OAuth import. See also GitHub issue F-PRO-CREATOR-API-001.

---

## N+1. MVP scope summary

### MVP feature count: ~127 units

| Area | MVP | Eng weeks (summed) |
|---|---|---|
| Onboarding & Identity | 13 | 7 |
| Editor & Block System | 15 | 12 |
| Public Page Rendering | 12 | 8 |
| Preview Generator | 7 | 6-7 |
| Custom Domain System | 3 | 3.5 |
| Commerce & Checkout | 15 | 11 |
| Creator-tier Features | 8 items | 1.5 |
| Subtle Contextual Upsell | 5 | 5 |
| Analytics & Insights | 7 | 5 |
| Email & Audience | 5 | 5 |
| Growth Loops | 7 | 5 |
| Customization & Theming | 12 | 7 |
| Templates & Starters | 4 | 3 |
| Trust/Platform | 5 | 4 |
| Admin & Trust | 10 | 3 (port) |
| Integrations & API | 8 | 7 |
| AI Features | 4 | 2.5 |
| EU/PL Localization | 8 | 4 |
| Marketing Surfaces | 10 | 6 |
| Pro-tier Power Features | 5 of 8 MVP | 10 |
| Business-tier Features | 5 of 5 MVP (DEC-Q5-A) | 12 |

**Aggregate engineer-time: ~134-135 weeks.** With 3-engineer team at 85% velocity: **~52 calendar weeks ≈ 13 months**. With 5-engineer team: **~30 calendar weeks ≈ 7-8 months**.

### Critical path items

1. **Cloudflare Workers SSR infrastructure** — team's first Workers-as-app; 2-week buffer.
2. **Custom Domain Stack end-to-end** (CNAME UX + Cloudflare SaaS API + Stripe metered billing) — 3 integrations compound risk.
3. **Stripe Connect + Tax + Przelewy24/BLIK triple integration** — commerce stack complexity, 6 weeks minimum.
4. **F-PRO-005 email marketing** (workflow engine + custom sender SPF/DKIM + segmentation) — biggest single Pro feature; if slips, Pro tier credibility at launch is at stake.
5. **Preview generator parser resilience** — Linktree HTML drift; need weekly regression test from day 1.

---

## N+2. Y1 roadmap

| Month | Feature units | Why now |
|---|---|---|
| M+1 | F-016 email drip · F-019 Apple SSO · F-190 refund polish | Activation + retention |
| M+2 | F-038 version history · F-045 device-conditional blocks · **F-UPSELL-005 peer benchmarking** | Post-MVP polish; F-UPSELL-005 needs N≥1k creators per cohort |
| M+3 | **F-PRO-007 A/B testing** · F-108 conversion funnel · F-PRO-002 Sheets sync | Power-feature completion round 1 |
| M+4 | **F-PRO-008 abandoned cart** · F-084 BNPL Klarna+Affirm · F-120 cart-abandon recovery | Commerce depth |
| M+5 | F-042 custom form builder · F-132 review request automation · full F-148 extended animations (60 total) | Editor + polish |
| M+6 | Native Shopify sync (if signals demand) · F-207 IFTTT · F-192 suspicious activity detection | Post-Linktree refugees + scale-ready |
| M+7 | F-224 AI FAQ search · F-146 custom CSS expansion · F-BIZ-002 advanced white-label | AI + Business depth |
| M+8 | F-063 link health v2 realtime · Geo-targeted block → per-country inventory | Advanced targeting |
| M+9 | Partner-submitted integrations marketplace (Business) | Ecosystem |
| M+10 | Native iOS app (if PMF met) · Brand-deal marketplace lite | Native + ecosystem |
| M+11 | Full transparency report Y1 · enterprise sales page · PL localization polish round 2 | Maturity |
| M+12 | Full AI suite v2 (audience insights, subject-line gen, content calendar) | AI depth |

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
- PL-culture template names (Chopin/Kopernik/Skłodowska) per DEC-MKT-C deferred
- AppSumo lifetime deal at M+18 only
- Enterprise SSO (SAML / SCIM) if real contract

---

## N+4. Explicit NOT-doing list

1. Course hosting with quizzes + certificates + drip lessons (Stan moat)
2. Native video hosting + live streaming
3. Native podcast hosting
4. AI brand-deal pitch automation (Beacons moat)
5. Media kit builder (Beacons signature)
6. Lifetime one-time payment tier
7. Seller fee ladder (v2-reconfirmed: always 0%)
8. Celebrity showcase on landing (use mid-creator stores)
9. Apex-register domain sales
10. Full CRM (brand contacts, deal pipeline)
11. Affiliate network for creators' products
12. Our own payment processor (Stripe Connect only)
13. NFT / crypto payments
14. Middle-dot `·` separator as brand mark
15. Indigenous land acknowledgement footer (Linktree's Aussie-specific)
16. Anti-platform "algorithm is the enemy" verbatim copy

---

## N+5. Revenue model — unit economics

### Tier conversion rates (D90 from signup)

| Tier | Conversion | Basis |
|---|---|---|
| Any tier → tier-plus-domain-addon ($1.99/mo) | 8% | universal domain attach rate target (Free as primary cohort) |
| Free → Creator ($7.99) | 4% | mid-tier signal |
| Free → Pro ($19.99) | 1.5% | Linktree free→paid baseline |
| Free → Business ($49) | 0.2% | agency niche |

### ARPU by tier

| Tier | Monthly | Annual ARPU |
|---|---|---|
| Free | $0 | $0 |
| Free + 1 domain addon | $1.99 | $23.88 |
| Creator | $7.99 | $95.88 |
| Creator + 1 extra domain | $9.98 | $119.76 |
| Pro | $19.99 | $239.88 |
| Business (3 sub-accounts included) | $49 | $588 |

**Blended ARPU at 10k MAU ≈ $0.78/MAU/mo → $7,800/mo ≈ $94k/yr.**

### Gross margin

Infrastructure cost per MAU: ~$0.03/mo (Cloudflare-first architecture).

| Cost item | Per active user/mo |
|---|---|
| Cloudflare Workers + R2 + Analytics Engine | ~$0.01 |
| Supabase | ~$0.01 |
| Resend (~100 emails/creator) | $0.10 |
| OpenAI (~20 gens/mo avg × $0.005) | $0.10 |
| **Total COGS** | **~$0.25/mo** |

**Gross margin at 10k MAU: 68%. At 100k MAU: ~75%.**

### Break-even

Fixed costs at MVP launch: ~$305/mo (Cloudflare $200 + Supabase $25 + Resend $20 + AWS $10 + monitoring $50). Break-even paying users: **~20 Pro subscribers** or ~100 Creator subscribers.

---

## N+6. Cost-of-goods drivers per MVP feature

### HIGH (monitor + gate in higher tiers)

| F-NNN | Driver | Notes |
|---|---|---|
| F-220..F-222 AI features | OpenAI per-token | ~$0.005/gen. Free 5/mo × 10k × 0.3 = $75/mo baseline. Cache aggressive + gpt-4o-mini for first draft. |
| F-CUSTOM-DOMAIN-* custom domains | Cloudflare for SaaS | ~$0.10/domain/mo beyond 100 included. At 10k domains = $990/mo. Revenue at $1.99/mo = $29.9k/mo. Margin 97%. |
| F-PRO-001 analytics 365d | Athena scans | ~$0.50-2/mo per active Pro creator. Revenue $19.99/mo. Margin 90%. |
| F-PRO-005 email marketing | Resend per-email | $0.001/email × 10k/mo per Pro creator = $10/mo at MAX. Margin 33% at max quota; safety via hard cap. |
| F-PREVIEW-001..007 (MVP) | Edge Function CPU + preview serving | Volume = 100-500 admin-generated previews/mo. Cost negligible (<$5/mo). |

### Top 3 cost monitoring priorities

1. **AI features budget** — $500-3000/mo MVP; hard quota + cheaper models.
2. **Email sends on Pro** — 10k/mo cap + per-minute throttling.
3. **Preview generator at Track A scale** — cap 10k/day/IP; graceful degradation.

---

## N+7. Competitive positioning

### Anchor messaging for landing + pricing page

> **"Everything Linktree charges for is free on tadaify. Even commerce. Even analytics. Even custom themes. Even PL payments.**
>
> **Pay only for what actually scales with you: your own domain ($1.99/mo), or Pro power features ($19.99/mo) once you have a real audience.**
>
> **0% platform fees at every tier. Always. No seller-fee ladder. No gotchas."**

### Per-tier anchors

- **Free:** "Everything Linktree Pro locks behind $12. Every block type. Every theme. Every analytics chart. 90-day retention. Email capture. Commerce at 0% fees. BLIK + Przelewy24 for Polish creators. Forever free."
- **Creator $7.99:** "Your own domain included. 180-day analytics memory. 20 AI credits/month (4× Free). 24h priority support. Custom favicon. Scheduled publishing. Verified creator badge. Directory listing. The $6 premium delivers real creator tools, not just a URL."
- **Pro $19.99:** "The 8 power features serious creators actually need: 365-day analytics + team seats + custom CSS + high-volume email + advanced API + A/B testing + abandoned cart recovery + Sheets sync. 1 domain included (extras $1.99/mo). Linktree Premium is $30 for less."
- **Business $49:** "Agency sub-accounts + white-label + 4-hour SLA. 10 custom domains included — manage multiple client pages from one account. Extras $1.99/mo each."

### vs competitors pricing-page comparison

| Feature | Linktree | Beacons | Stan | **Tadaify** |
|---|---|---|---|---|
| Free plan | Yes (12% fee) | Yes (9% fee) | No (trial only) | **Yes (0% fee)** |
| Custom domain | $12/mo (Pro) | $30/mo (CP) | $29/mo (Creator) | **$1.99/mo add-on OR $7.99/mo Creator** |
| 365-day analytics | $12/mo (Pro) | Included CP $30 | $99/mo (Pro) | **$19.99/mo (Pro)** |
| Email campaigns | Integrations only | Unlimited CP $30 | $99/mo (Pro) | **Free 1k/mo / Pro 10k/mo** |
| Inline checkout | 9-12% fee (tiered) | 9% → 0% at CP | 0% (Creator+) | **Free 0%** |
| A/B testing | $30/mo (Premium) | No | No | **$19.99/mo (Pro)** |
| Custom CSS | $30/mo (Premium) | Yes (CP) | No | **$19.99/mo (Pro)** |
| Team seats | $30/mo (Premium) | No | No | **$19.99/mo (Pro)** |
| Public API | Partner-only | No | No | **Free tier + Pro quotas** |
| Polish payments | No | No | No | **Free** |
| EU VAT auto-calc | No | No | No | **Free** |

---

## N+8. Glossary

- **Hub** — creator's main public page at `tadaify.com/<handle>`.
- **Block** — a single unit on a hub: link, product, community, lead-magnet, section-header, affiliate-link, external-link, embed, social-profile, bundle, countdown.
- **Creator** — account holder with a hub; primary user persona.
- **Buyer** — end-visitor who purchases a product.
- **Handle** — unique creator identifier (3-30 chars, `[a-z0-9-_]`); also their public URL path.
- **Guest draft** — unsaved page built via `/try` before signup; TTL 60 days.
- **Reveal** — tadaify's signature onboarding moment: social handle entry (F-004) + palette extract (F-006) + entrance animation on first-view page. No OAuth at MVP (DEC-SOCIAL-01).
- **Template** — pre-configured theme + starter blocks. MVP names: neutral (Indigo/Dusk/Minimal/Bold/Earth). PL-culture names (Chopin/Kopernik/Skłodowska) deferred to Y2+.
- **Entrance animation** — choreographed motion that runs once on page load (`F-148`).
- **Custom domain** — creator's own domain pointing at their hub via CNAME.
- **Verified Buyer badge** — auto-attached to reviews when reviewer has a matching Stripe payment intent.
- **SLA adherence** — tadaify's public dashboard of real-time support ticket response times per tier.
- **Preview generator** — admin-only marketing tool at `/admin/marketing/preview-generator`. Admin pastes a target creator's Linktree URL (MVP), customizes preview visually, generates private `preview.tadaify.com/<slug>?ref=<hash>` URL to send 1-to-1. Not a public endpoint. `F-PREVIEW-001..007` (MVP) + `F-PREVIEW-010..012` (M+0.5).
- **Power features** — the 8 Pro-tier features justifying $19.99/mo over Creator $7.99. `F-PRO-001..008`.
- **Agency sub-account** — Business-tier feature where Owner manages N child creator pages. `F-BIZ-001`.
- **Custom domain add-on** — $1.99/mo metered Stripe billing for each custom domain beyond tier quota. `F-CUSTOM-DOMAIN-003`.
- **Cloudflare for SaaS** — Cloudflare's multi-tenant custom-hostname + SSL provisioning product.
- **Price-lock guarantee** — tadaify's 3-year price commitment at signup. `F-172a`, `F-TRUST-003`.
- **Creator Safeguard** — tadaify's 48h-warning moderation policy with human-review appeals + prepaid refund. `F-191b`.
- **DEC-DOMAIN-01** — Single-root-domain architecture: everything under `tadaify.com/` (locked 2026-04-24).
- **DEC-DNS-01** — Cloudflare authoritative DNS for `tadaify.com`; OVH registrar → Cloudflare nameservers (locked 2026-04-24).
- **DEC-FRAMEWORK-01** — Remix on Cloudflare Workers runtime; file-based routing for all paths (locked 2026-04-24).
- **DEC-035** — Cloudflare-first architecture (locked 2026-04-24).
- **DEC-036** — USD currency (locked 2026-04-24).
- **DEC-037** — 4-tier structure Free/Creator/Pro/Business (locked 2026-04-24).
- **DEC-043** — "everything free" gating model (locked 2026-04-24).
- **DEC-TRIAL-01** — Removal of F-012 Pro trial (locked 2026-04-24).
- **DEC-SOCIAL-01** — Social-import on onboarding switched from OAuth auto-import to handle-based link generation (locked 2026-04-24). OAuth deferred to F-PRO-OAUTH-IMPORT (Pro tier, §18.9).
- **DEC-MKT-C** — EN-only marketing at launch; PL deferred Y2+.
- **DEC-Q5-A** — Full Business tier at MVP (locked).
- **DEC-Q5-C** — Linktree-only preview parser at MVP (locked).
- **AP-NNN** — Anti-pattern from `anti-patterns-audit.md` (51 identified, all mitigated in this spec).

---

## §27. Anti-patterns appendix (from `anti-patterns-audit.md` §2 + §6)

### 51 Anti-patterns — tadaify MUST NOT repeat

**Domain: Branding / platform identity**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-001** | "Powered by [platform]" footer/watermark as a paid tier's "removal bonus" | Critical | GREEN — AP-001 hard-locked; no branding on ANY tier; not a paid unlock |
| **AP-002** | Watermark injected into exported analytics / CSV / invoice | High | GREEN — none in spec |
| **AP-003** | Hard-locked platform URL (no custom domain on any tier) | High | GREEN — F-CUSTOM-DOMAIN-001..003 + F-DOMAIN-ADDON-001: universal $1.99/mo add-on on every tier; Creator/Pro include 1 domain; Business includes 10 |
| **AP-004** | Platform interstitials / ads on creator pages | High | GREEN — F-PREVIEW-004 disclosure on preview pages ONLY (not actual creator pages) |

**Domain: Moderation / bans**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-005** | Account suspension without warning | Critical | GREEN — F-191b Creator Safeguard: 48h warning + human appeal + prepaid refund |
| **AP-026** | Vague content policy without examples | High | GREEN — F-191a Plain-Language Content Policy + examples-rich do/don't list |
| **AP-027** | Banning a prepaid creator without refunding unused time | Critical | GREEN — F-191b: automatic refund calculated `(months_remaining / total_months) × annual_price`, T+14 days |
| **AP-028** | Appeals as silent black-box / no human reviewer | High | GREEN — `admin_appeals` queue (linkofme-inherited), human-reviewed |

**Domain: Support**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-008** | Slow customer support (>1 week) | Critical | GREEN — F-172 Trust Center publishes live SLA: Free 48h / Creator 24h / Pro 12h / Business 4h |
| **AP-009** | Bot-first or bot-only support | High | GREEN — F-BIZ-003 dedicated CSM for Business; human contact available Free+ |
| **AP-010** | Multi-step survey gating subscription cancellation | Critical | GREEN — F-180a one-click cancel: 1 button + 1 optional reason dropdown |
| **AP-011** | No contact for billing disputes | High | GREEN — support email always published |

**Domain: Onboarding**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-021** | Phone number mandatory at signup | High | GREEN — DEC-SYN-01 progressive signup; no phone field |
| **AP-022** | All-fields signup on one screen | High | GREEN — F-001/F-002 Beacons progressive (handle → creds → plan) |
| **AP-023** | Pricing not available publicly | High | GREEN — F-251 public pricing page in nav |
| **AP-025** | Single opt-in email collection | High | GREEN — linkofme-inherited double-opt-in (subscribe / subscribe-confirm) |
| **AP-034** | Manual-only social handle entry | Medium | GREEN — F-004 handle-based link generation (DEC-SOCIAL-01): multi-select platforms + handle input generates "Follow me on" blocks. ~~OAuth deferred to F-PRO-OAUTH-IMPORT Pro tier~~ → **F-PRO-OAUTH-IMPORT removed from roadmap per DEC-APIPAGES-01=C.** Creator API (F-PRO-CREATOR-API-001) is the power-user path. |
| **AP-046** | Marketing "Free" when free tier has seller fee | High | GREEN — DEC-037/043: 0% fees at every tier |

**Domain: Data / privacy**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-006** | No user data export (GDPR Art. 20) | Critical | GREEN — F-186 `user-export-data` Edge Function (linkofme-inherited) |
| **AP-013** | No self-serve account deletion | Critical | GREEN — F-187 `delete_user_data()` RPC (linkofme-inherited) |
| **AP-036** | Tracking pixels injected without visitor consent (EU) | High | GREEN — F-058a EU visitor cookie consent banner on creator pages |
| **AP-037** | Bare "Got it" cookie banner without Reject option | High | GREEN — F-174 granular GDPR banner per PAT-078 |
| **AP-038** | Selling creator data to third parties | Critical | GREEN — F-TRUST-001 + 12c: "We never sell creator or visitor data" published on Trust Center |
| **AP-043** | Identity-matching across the web without consent | Medium | GREEN — F-004 handle-entry only (DEC-SOCIAL-01): no OAuth, no API scraping, no profile matching at MVP or Y1. ~~F-PRO-OAUTH-IMPORT (Pro) is explicit OAuth consent-gated~~ → **removed per DEC-APIPAGES-01=C.** Creator API (F-PRO-CREATOR-API-001) is read/write on the user's own data only. |

**Domain: Pricing**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-012** | Mid-cycle price hikes on existing subscribers | Critical | GREEN — F-172a: `price_locked_until` per-subscription + public price-lock page; quarterly audit |
| **AP-014** | Auto-renewal without clear notice | High | GREEN — Stripe subscription renewal notifications + F-175 explicit |
| **AP-016** | Credit-card-required trial that auto-bills | High | GREEN — DEC-TRIAL-01: F-012 removed; replaced by 30-day money-back guarantee |
| **AP-017** | Trial reverts "sticky" features (data-loss UX) | High | GREEN — DEC-TRIAL-01: trial mechanism removed entirely |
| **AP-018** | Seller fees on free tier as hidden tax | Critical | GREEN — DEC-037/043: 0% fees contractually locked, published Trust Center |
| **AP-019** | Holding creator/affiliate payouts indefinitely | Critical | GREEN — Payout SLA: T+14 days max, published `tadaify.com/trust/payouts` |
| **AP-020** | Annual-only billing (no monthly) | Medium | GREEN — monthly at MVP; annual at M+2 optional |
| **AP-024** | No `/pricing` public page in nav | High | GREEN — F-251 public pricing page |
| **AP-042** | Hidden infra-cost-driven tier squeezes | Medium | GREEN — feature-preservation commitment: tier gates only move cheaper for existing users |
| **AP-049** | Top-tier pricing that feels arbitrary | Medium | GREEN — Business $49 with transparent feature list (DEC-Q5-A) |
| **AP-050** | Locking essential CRM behind top tier | High | GREEN — DEC-043: all on Free; F-115 email + F-101 analytics Free |

**Domain: Admin UI / upsell patterns**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-031** | Persistent upgrade banner in creator workspace | Critical | GREEN — F-UPSELL-003: NEVER popups/modals/banners; dismissible chips; max 1/session |
| **AP-032** | Cascading modals | Medium | GREEN — F-UPSELL guidelines explicit |
| **AP-035** | "Upgrade to see your data" dark pattern | High | GREEN — DEC-043 Free gets 90d full analytics; Pro is retention extension, not depth-gate |
| **AP-044** | AI feature overwrites creator's voice without undo | Medium | GREEN — F-223 AI diff-approval UX: shows before/after before applying |
| **AP-045** | No progressive disclosure — 30+ features dumped in editor | Medium | GREEN — F-020 §4a editor IA: 6-block Getting Started default, "More blocks" reveals rest |
| **AP-047** | Signup-form pre-selects paid tier by default | Medium | GREEN — F-UPSELL-004: Recommended BADGE only; default radio stays Free always |
| **AP-048** | Verified badge gated behind purchase (pay-to-verify) | Medium | GREEN — F-001 §6b: verified badge requires 2FA + social OAuth, NOT payment |

**Domain: Feature availability**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-015** | "Useless" free-tier analytics (click count only) | High | GREEN — F-101 Free 90d full analytics (geo + device + referrer + revenue) |
| **AP-030** | Complex editor "too many clicks to add a link" | High | GREEN — F-020 §4a progressive disclosure; unified "Add block" modal |
| **AP-033** | Checkout / sales-flow reliability glitches | Critical | GREEN — F-072 Stripe inline checkout + e2e/critical-path.spec.ts covers checkout |
| **AP-039** | Single-platform admin (phone-only or web-only) | Medium | GREEN — PWA responsive per DEC-035 architecture |
| **AP-041** | Niggardly field limits (80-char bio) | Low | GREEN — bio at least 280 chars (tweet parity) |
| **AP-051** | Brand / URL rename mid-life stranding audience | Medium | GREEN — `tadaify.com` locked |

**Domain: Communication / emails**

| # | Anti-pattern | Severity | Current status |
|---|---|---|---|
| **AP-029** | Publicly-visible platform message during billing issues ("did not pay") | Critical | GREEN — F-175a: creator page stays live during dunning; NO public platform-shame overlay |
| **AP-048** | Deceptive social proof (A-list celebrity on landing) | Medium | GREEN — F-249 uses real mid-creator stores |
| **AP-052** | Spam promotional emails without unsubscribe | Medium | GREEN — Resend double-opt-in + per-category unsubscribe inherited from linkofme |

---

## §28. Locked DECs summary (product-relevant)

> One-line per DEC for quick reference. All listed as LOCKED / ANSWERED.
> **Full rationale, context, supersession chains, and provenance live in per-file MADR records:**
> [`docs/decisions/INDEX.md`](../decisions/INDEX.md) — auto-generated table with numeric IDs, aliases, and links.
> Per-file format: `docs/decisions/NNNN-<slug>.md`.

| DEC-ID | Domain | Decision |
|---|---|---|
| **DEC-DOMAIN-01** | URL architecture | Single-root-domain. Every user-facing page at `tadaify.com/<path>`. Creator URL = `tadaify.com/<handle>`. Dashboard = `tadaify.com/app`. Admin = `tadaify.com/admin`. Preview/developers/status/mail as subdomains (separate concerns, no handle collision). |
| **DEC-DNS-01** | DNS | Cloudflare authoritative for `tadaify.com`. OVH registrar → Cloudflare nameservers. Route 53 not used. |
| **DEC-FRAMEWORK-01** | Framework | Remix (React Router 7) on Cloudflare Workers runtime. File-based routing for all paths. SSR public + CSR dashboard. |
| **DEC-035** | Architecture | Cloudflare-first (Workers, R2, Pages, Cloudflare-for-SaaS, Analytics Engine). No CloudFront/Route53/ACM/Lambda by default. |
| **DEC-036** | Currency | USD. EU creators see local-currency display but plan SKU is USD. |
| **DEC-037** | Tier structure | 4-tier flat: Free $0 / Creator $5 / Pro $15 / Business $49. |
| **DEC-043** | Feature gating | "Everything free." Commerce, analytics, email, all product features are Free. |
| **DEC-TRIAL-01** | Trials | No Pro trial mechanism. Replaced by transparent feature preview + 30-day money-back guarantee + subtle upsell. |
| **DEC-MKT-B-v2** | Preview generator | Admin-only tool at `/admin/marketing/preview-generator`. Not a public endpoint. |
| **DEC-MKT-C** | Marketing language | EN-only at launch. PL copy, PL-culture template names, PL outreach deferred to Y2+. |
| **DEC-Q5-A** | Business tier | Full Business tier at MVP. All 5 F-BIZ units ship MVP. No stripped-down tier. |
| **DEC-Q5-C** | Preview parser | Linktree-only at MVP. Beacons/Stan/Bio.link parsers at M+0.5. |
| **DEC-033** | Self-referral block | F-125 is opt-in growth block, NOT a "Powered by tadaify" watermark. AP-001 hard-locked. |
| **DEC-SYN-05** | Creator Safeguard | 48h warning + human appeal + prepaid refund contract. Codified as F-191b. |
| **DEC-SYN-06** | Price lock (superseded) | 3-year price lock at signup rate + fee lock. Codified as F-172a, F-TRUST-002/003/004. **Superseded by DEC-PRICELOCK-01.** |
| **DEC-PRICELOCK-01** | Price-lock-for-life | Paid subscription price is locked **forever** (not 3 years) for uninterrupted subscriptions. New prices apply only to new signups or re-subscribers after cancellation. Brand commitment, not a promotion. Codified as F-PRICELOCK-001. Applied 2026-04-25. |
| **DEC-PRICELOCK-02** | Domain add-on + Pro tier | $1.99/mo custom-domain add-on is **universal** (all tiers) — **domain price superseded by DEC-279** (was $2/mo). Pro tier simplified to 1 custom domain (was 3) — multi-domain is Business/agency. Business: 10 included (was unlimited). Pro differentiator = 8 power features, not domain count. Codified as F-DOMAIN-ADDON-001. Applied 2026-04-25. |
| **DEC-ANTI-001** | AP-001 | No "Powered by tadaify" footer on ANY tier. Not a paid unlock. Hard-locked. |
| **DEC-ANTI-002** | AP-018/046 | 0% platform fees contractually locked. Published on Trust Center. Cannot be raised mid-subscription. |
| **DEC-ANTI-003** | AP-047 | F-UPSELL-004 DOES NOT pre-select paid radio. Default stays Free. Badge-only recommendation. |
| **DEC-ANTI-004** | AP-005/026/027 | F-191a Plain-Language Content Policy + F-191b Creator Safeguard = both MVP. |
| **DEC-ANTI-005** | AP-010 | F-180a one-click cancel. No multi-step survey. No retention modal cascade. |
| **DEC-ANTI-006** | AP-017 | Trial revert NEVER deletes data. Trial mechanism removed entirely per DEC-TRIAL-01. |
| **DEC-ANTI-007** | AP-019 | T+14 days max payout SLA. Published on tadaify.com/trust/payouts. |
| **DEC-ANTI-008** | AP-029 | Creator page stays live during dunning. No public shame overlay. Ever. |
| **DEC-ANTI-009** | AP-042 | Feature-preservation: tier gates only move cheaper for existing users. Grandparent via `user_features`. |
| **DEC-ANTI-010** | AP-038 | "We never sell creator or visitor data; never share with LLMs for training." Published on Trust Center. |
| **DEC-ANTI-011** | AP-029-preview | F-PREVIEW-004 disclosure strip is TOP of preview page; mandatory; one-click remove form; admin cannot disable. |
| **DEC-ANTI-012** | AP-036/037 | F-058a EU visitor cookie consent banner. Granular (not bare "Got it"). MVP. |
| **DEC-ANTI-013** | AP-045 | Editor progressive disclosure: 6-block "Getting Started" default. F-020 §4a. |
| **DEC-ANTI-014** | AP-025 | Double-opt-in email mandatory. Inherited from linkofme subscribe/confirm stack. |
| **DEC-ANTI-015** | AP-031 | No persistent upgrade banner in editor chrome. F-UPSELL-003 chips = 1/session hard cap, dismissible, informational only. |
| **DEC-LAYOUT-01** | Grid layout | Grid layout ships in MVP (answer A). `pages.layout_mode='stack'|'grid'`. `block_placements` table with col/row/span_cols/span_rows/mobile_order. Editor: drag-onto-cell, span handles, mobile auto-collapse. CSS Grid rendering. All tiers. See F-LAYOUT-001. Applied 2026-04-25. |
| **DEC-APIPAGES-01** | Platform OAuth import | Rejected (answer C). F-PRO-OAUTH-IMPORT **permanently removed from roadmap**. No IG/YT/Spotify OAuth wall. Creator API (F-PRO-CREATOR-API-001) is the better investment. Applied 2026-04-25. |
| **DEC-CREATOR-API-01** | Creator API | Pro tier AI-friendly REST API (answer A). OpenAPI 3.0, per-user keys, `@tadaify/mcp` npm MCP server, custom GPT template, agent-recipe gallery, rate limit 1000 req/h Pro. See F-PRO-CREATOR-API-001. Applied 2026-04-25. |
| **DEC-AI-QUOTA-LADDER-01** | AI quota | Answer B: Free **5 uses/mo** / Creator **20 uses/mo** / Pro **100 uses/mo** / Business **unlimited**. Unified shared bucket across all AI features. Applied 2026-04-25. |
| **DEC-AI-FEATURES-ROADMAP-01** | AI feature scope | Text-only AI (answer A): theme matcher + bio rewrite (F-AI-BIO-REWRITE-001) + block copy suggest (F-AI-COPY-SUGGEST-001). Image generation deferred. Applied 2026-04-25. |
| **DEC-ANIMATIONS-SPLIT-01** | Animations sub-tab | 2 sections (answer A): Entrance (page + block + hover, runs once) + Ambient (always-on overlay: 10 effects × density/speed/color). Third section: Accessibility footer. Applied 2026-04-25. |
| **DEC-WALLPAPER-ANIM-01** | Wallpaper/Background motion | Rejected (answer C). Background stays static (Fill/Gradient/Blur/Pattern/Image/Video). All motion lives in Animations > Ambient. Applied 2026-04-25. |
| **DEC-PINNED-MSG-01** | Pinned message | Adopt primitive (answer A). Toggleable fading line above profile card on Page tab. Max 80 chars. Dismissible by visitor. tadaify-only differentiator. Applied 2026-04-25. |
| **DEC-CUSTOM-DOMAIN-NAV-01** | Custom Domain sidebar | 6th sidebar item (answer A) after Settings. Globe SVG icon + "Domain" label + "soon" pill. Mobile bottom-tabs unchanged (5 max). Placeholder panel: "Coming soon — universal $1.99/mo add-on per DEC-PRICELOCK-02/DEC-279." Applied 2026-04-25. |

> **2026-04-25 second wave changelog:** DEC-LAYOUT-01=A grid in MVP; DEC-APIPAGES-01=C reject OAuth integrations; DEC-CREATOR-API-01=A Pro pillar; DEC-AI-QUOTA-LADDER-01=B 5/20/100/∞; DEC-AI-FEATURES-ROADMAP-01=A text-only; DEC-ANIMATIONS-SPLIT-01=A 2 sections; DEC-WALLPAPER-ANIM-01=C static background; DEC-PINNED-MSG-01=A primitive; DEC-CUSTOM-DOMAIN-NAV-01=A 6th sidebar item.

---

## §30. Infrastructure Architecture (locked — 2026-04-24)

### DNS + edge layer

- **Cloudflare** authoritative for `tadaify.com` (DEC-DNS-01)
- Nameservers set at OVH registrar to Cloudflare (`ns1.cloudflare.com` + `ns2.cloudflare.com`)
- Cloudflare Pages hosts main app (Remix on Workers runtime)
- Cloudflare for SaaS handles **creator custom domains** (e.g. `mycoach.com → creator's tadaify page`) — this is SEPARATE from tadaify's own domain management
- Cloudflare R2 for media storage (zero egress cost)
- Cloudflare Analytics Engine for hot analytics tier (90d real-time)

### Framework + deploy (DEC-FRAMEWORK-01)

- **Remix** (React Router 7 merge as of 2024) on Cloudflare Workers runtime
- File-based routing covers ALL paths under single domain:
  - `tadaify.com/` → landing (SSR)
  - `tadaify.com/<handle>` → creator hub (SSR, cache-tagged per tenant)
  - `tadaify.com/<handle>/p/<slug>` → product page (SSR)
  - `tadaify.com/app/*` → authenticated dashboard (CSR after first paint)
  - `tadaify.com/admin/*` → admin panel (CSR, `AdminRoute` guard checks `admin_users`)
  - `tadaify.com/try` → guest editor (CSR)
  - `tadaify.com/t/<name>` → template preview (SSR)
  - `tadaify.com/vs/<competitor>`, `tadaify.com/for/<niche>`, `tadaify.com/pricing`, etc. → marketing SSR routes
- SSR for public pages (fast first paint + SEO indexable)
- CSR/SPA feel for authenticated dashboard after first load
- GitHub Actions `deploy-cloudflare-pages.yml` workflow via Wrangler
- Branch `main` → prod (`tadaify.com`); branch `develop` → dev (`dev.tadaify.com`)

### Backend (central brain)

- **Supabase** (EU region — Frankfurt)
- Postgres + GoTrue Auth + Edge Functions + Realtime
- All user data, billing, Stripe Connect, email subscribers, analytics cold storage
- EU region for data residency (tadaify is PL-registered entity with EU ICP)

### AWS (invisible backend only — DEC-INFRA-MINIMAL-01)

`tadaify-aws` Terraform: ~100-150 lines total (vs ~500 in standard template):

```
tadaify-aws/
├── terraform/
│   ├── analytics/          # S3 bucket tdfy-analytics-{env} + Athena workgroup + Glue catalog
│   ├── iam-oidc/          # GitHub Actions OIDC role (github-actions-deploy)
│   └── backup/            # S3 bucket tdfy-backups-{env} (Supabase daily dumps + GDPR export staging)
```

**NOT in tadaify-aws (removed vs standard template-project-aws):**
- `terraform/frontend/` — no CloudFront, no S3 for app hosting (Cloudflare Pages handles it)
- `terraform/dns/` — no Route 53 hosted zone (Cloudflare DNS handles it)
- ACM certificates — TLS provisioned by Cloudflare
- No Lambda by default

### External services (per-use)

| Service | Purpose |
|---|---|
| Stripe | Billing + commerce + Connect + Tax |
| Resend | Transactional email; sender domain `mail.tadaify.com` (SPF/DKIM on Cloudflare DNS) |
| OpenAI | AI features (product desc, page copy, thumbnail gen) via backend proxy |

### URL architecture (DEC-DOMAIN-01 — see §1 for complete table)

All user-facing routes under `tadaify.com` (prod) / `dev.tadaify.com` (dev).

### Subdomains (separate concerns)

| Subdomain | Purpose | Who manages |
|---|---|---|
| `preview.tadaify.com` | Admin preview generator output — kept on subdomain to avoid `/<handle>` collision | Cloudflare Workers route |
| `developers.tadaify.com` | API docs portal (Mintlify or Docusaurus) | Third-party platform |
| `status.tadaify.com` | Uptime monitoring page | BetterUptime / Statuspage integration |
| `mail.tadaify.com` | Email sender SPF/DKIM | Resend (DNS record on Cloudflare) |

### Deploy pipelines

| Repo | Pipeline | What deploys |
|---|---|---|
| `tadaify-app` | GitHub Actions `deploy-cloudflare-pages.yml` via Wrangler | Remix Workers app to Cloudflare Pages |
| `tadaify-aws` | GitHub Actions → `terraform apply` | Analytics S3 + Athena + Glue + IAM OIDC |
| Supabase | GitHub Actions → `supabase db push` | Migrations + Edge Functions (DEV on merge to main, PROD on tag) |

### Secrets management

- Supabase Vault: runtime secrets for Edge Functions (`STRIPE_SECRET_KEY`, `RESEND_API_KEY`, etc.)
- AWS SSM: Terraform registry for audit + cleanup (one SSM param per secret even if runtime uses Vault)
- Cloudflare Workers secrets: via `wrangler secret put` for any Workers-specific env vars
- GitHub Secrets: `SUPABASE_ACCESS_TOKEN`, `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` (CI only; Claude never sees these values)
