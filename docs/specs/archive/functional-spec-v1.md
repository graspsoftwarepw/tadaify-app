---
type: product-spec
project: tadaify
title: Tadaify — Functional Specification (post-competitor-audit)
created_at: 2026-04-24
author: orchestrator-opus-4-7-spec-agent
status: superseded-by-functional-spec-final.md
---

# Tadaify — Functional Specification

## 0. How to read this document

This is the **canonical functional specification** for tadaify, produced after the 2026-04-24 competitor audit (7 competitors: Stan Store + Linktree deep; Beacons + Carrd + Lnk.bio + Taplink + Bio.link / Later / Milkshake / Campsite landing / desk). It converts the audit's ~78 UI patterns (PAT-001..PAT-078), 10-section feature-mix decision doc, and 50 DEC-SYN proposals into **concrete, implementable feature units (F-XYZ)** that map directly onto user stories.

### Layered inputs feeding this doc (read in order if unfamiliar)

1. `competitors/_synthesis/00-tldr.md` — 1-page executive summary.
2. `competitors/_synthesis/patterns-library.md` — 78 cross-competitor patterns with verdicts (`ADOPT` / `ADAPT` / `AVOID` / `DEFER` / `ORIGINATE` / `NEUTRAL`).
3. `competitors/_synthesis/tadaify-feature-mix.md` — 10-section product decision doc with ~45 sub-decisions.
4. `tadaify-research-synthesis.md` — 50 DEC-SYN proposals (incl. §10 post-audit alignment + 4-way pricing conflict).
5. `positioning-gaps.md` — gap analysis A1..A8 + unique combinations C1..C5.
6. Per-competitor `notes.md` — live UI audit observations with screen IDs (`STS-NNN`, `LT-NNN`, `BCN-NNN`, `CRD-NNN`, `LKB-NNN`, `TPL-NNN`).
7. `brand-lock.md` — brand palette + wordmark + motion + tagline (locked).
8. `inheritance/linkofme-features-implemented.md` — 45 LinkOfMe BRs available for port (60-70% code reuse).

### Naming conventions inside this doc

| Prefix | Meaning |
|---|---|
| `F-NNN` | **Feature unit** — an implementable slice, 1:1 convertible to a GitHub story. |
| `PAT-NNN` | Competitor pattern (from `patterns-library.md`). |
| `DEC-SYN-NN` | Strategic decision (from `tadaify-research-synthesis.md`). |
| `BR-NNN` | Business requirement (to be issued in tadaify-app `docs/BUSINESS_REQUIREMENTS.md`). Prefixes like `BR-004` from linkofme are cited verbatim when inherited. |
| `TR-NNN` | Technical requirement. Shared TRs ported from other projects keep their number. |
| `STS-NNN` / `LT-NNN` / `BCN-NNN` / `CRD-NNN` / `LKB-NNN` / `TPL-NNN` | Stan / Linktree / Beacons / Carrd / Lnk.bio / Taplink screen-ID citations. |

### Feature-unit anatomy (one per §3..N entry)

Each `F-NNN` carries:

- **Summary** — one-sentence "what it does".
- **Why it's in scope** — positioning argument against Linktree or EU/PL wedge.
- **Competitor baseline** — how each audited competitor does it (with screen IDs + verdicts).
- **Tadaify implementation — behavior** — creator + buyer + admin UX, written as a PM-to-engineer brief (defaults, validation, empty states, error states).
- **Tadaify implementation — data model** — tables, columns, relationships, LOM port vs net-new.
- **Tadaify implementation — interfaces / APIs** — REST endpoints (method + path + auth + rate limit tier), webhook events, Edge Functions, background jobs, client components.
- **Free vs Pro vs Business gating** — what each tier unlocks.
- **Eng effort** — S (<3d) / M (1w) / L (2-3w) / XL (>3w).
- **Dependencies** — other `F-NNN` this blocks on.
- **MVP / Y1 / Y2 recommendation** — with rationale anchored to "differentiates vs Linktree AND low marginal cost → MVP".
- **Test surface** — 3-5 critical scenarios for the Playwright plan.
- **Open questions** — what a PM would raise before the first story.

### From feature units to user stories

Each `F-NNN` typically decomposes into 1-4 user stories during refinement. Stories inherit the feature unit's `Test surface`, `Data model`, and `Free vs Pro vs Business` slice. Trivial sub-slices (e.g. "edit button tooltip") stay inside the parent feature unit.

### Pricing assumption baked in

This spec assumes **Option B from DEC-SYN §10.2** — Free (link-list only, no commerce) + Pro ($10-15/mo range, 0% fees, commerce unlocked) + Business $30 Y1. The user's most recent direction (2026-04-24) overrides the original Synthesis `$5 Pro` proposal: **maximum free customization** + **commerce paywalled** + **symbolic $2-3/mo custom domain** as an acquisition weapon. Where that deviates from Option B, I call it out explicitly (notably F-060 custom domain pricing and F-023..F-030 free-tier customization breadth).

---

## 1. Product positioning summary

**Tadaify is a link-in-bio + lightweight creator commerce platform aimed at nano/micro creators (0–100k followers) frustrated by Linktree's feature-gating and price hikes**, shipped with an unusually generous Free tier (maximum customization, zero commerce) and a single Pro tier that unlocks commerce at 0% platform fees. The PL/EU regulatory + payment wedge (VAT + Przelewy24 + BLIK + PL directory + native PL copy) is an anti-catch-up moat none of the US-first rivals can copy quickly.

### 1.1 Who we serve

- **Primary (MVP):** nano/micro IG/TikTok/newsletter creators, 0–100k followers, English or Polish speaking, tired of Linktree (price hike, bans, Pro-gating of custom themes/analytics/email capture) and priced out of Stan Store ($29/mo min, trial-only, no free). `DEC-SYN-33`.
- **Secondary (MVP):** solo digital-product sellers at €5–€50 AOV ("coach", "newsletter", "template creator") who find Stan too expensive and Gumroad too stark.
- **Tertiary (Y1):** PL coaches, educators, service providers who need VAT-correct checkout in PLN + Przelewy24/BLIK; an underserved segment the US incumbents ignore.
- **Explicit non-targets:** enterprise / agencies, Shopify-first sellers (Later's moat), adult-only creators (age gate shipped quietly per `DEC-SYN-33`), 100k+ creators (Stan + Linktree have the brand gravity).

### 1.2 The 5 wedges we commit to (in priority order)

1. **"Linktree Pro on Free."** Ship a Free tier that matches or exceeds Linktree Pro ($12/mo) on every non-commerce dimension: custom themes, 365-day analytics, email capture, scheduling, full block library, unlimited links, no-branding, QR, entrance animations. The marketing tagline writes itself: *"Everything Linktree locks behind Pro. For free. Forever."* Anchor wedges: `F-003` / `F-023` / `F-030` / `F-050`.
2. **Commerce-gated paywall + 0% fees.** Instead of Linktree's 12% free-tier seller fee (`PAT-043`) or Stan's no-free wall, Free is **link-list only**; the moment a creator wants to sell (`F-080` per-product pages, `F-090` inline checkout), they upgrade to Pro and pay 0% platform fees forever (`PAT-009`, `DEC-SYN-26`). Cleaner than any ladder and clearly ahead of the category.
3. **Custom domain at €2–€3/month.** Category price is $8–$12/mo hidden inside Pro ($96–$144/yr); Lnk.bio sells it as a $40/yr add-on (`PAT-074`). Tadaify sells it as a **symbolic add-on** (€2–€3/mo ≈ €24–€36/yr) purchasable on top of Free *or* Pro — undercuts the entire category and turns custom domain from a monetization hook into an acquisition weapon (`F-060`).
4. **EU/PL regulatory + payment wedge.** VAT OSS auto-calc (`F-097`) + Przelewy24 + BLIK + SEPA (`F-095`) + PL creator directory (`F-140`) + native PL copy (not translation) (`F-200`) + Polish-culture template names (Chopin, Kopernik, Skłodowska) (`F-130`). None of the 7 audited competitors ship any of this (`DEC-SYN-47`, `PAT-058`).
5. **Trust & policy contract.** Price-lock guarantee 3 years (`F-170`), published support SLA with live adherence dashboard (`F-172`), transparent moderation with 48h warning (`F-173`), granular GDPR cookies (`F-174`), Trust Center + incident log + uptime (`F-171`). `DEC-SYN-05`, `DEC-SYN-06`, `PAT-039`, `PAT-044`, `PAT-078`.

### 1.3 What we explicitly do NOT do (day-1 through Y2)

- Course hosting with video + quizzes + certificates (Stan moat — `DEC-SYN-13`, `PAT-NONE`). Ship only digital-product + community + bundle at MVP.
- Native Shopify sync (Later's moat — `DEC-SYN-14`). Defer to Y2.
- Native iOS/Android apps (`DEC-SYN-15`). PWA-only at MVP.
- Brand-deal CRM inbox (Beacons moat — `DEC-SYN-16`, `PAT-062`).
- Lifetime one-time-payment plan (Lnk.bio territory — `DEC-SYN-17`, `PAT-073`).
- Enterprise SSO / SAML / SCIM (`DEC-SYN-18`).
- Media kit builder (Beacons signature — `DEC-SYN-19`).
- Fee ladder (Linktree's 12% → 9% → 9% → 0%). One rate, 0%, on Pro.
- No-pricing-on-landing (Stan's friction hole). Public pricing in nav day 1 (`PAT-031` AVOID).
- Celebrity showcase on landing (`PAT-037` AVOID). We don't have Selena Gomez; use real mid-creator stores instead.
- Anti-platform copy tone (`PAT-064` AVOID verbatim). Soften to *"Your direct line to your audience — no algorithm"*.
- Middle-dot `·` separator (Stan's brand rhythm, `PAT-005`). We're locked on `tada!ify` variant F.

### 1.4 Brand constraints feeding the spec (from `brand-lock.md`)

- Domain: `tadaify.com`; slug: `tadaify`; display wordmark: `tada!ify` (variant F).
- Palette: Indigo Serif — Primary `#6366F1`, Secondary `#8B5CF6`, Warm accent `#F59E0B`, Warm soft `#FDE68A`, BG `#F9FAFB`, FG `#111827`, Dark canvas `#0B0F1E`.
- Logo motion: warm orb 360° orbit, 8.2s loop, `prefers-reduced-motion` static (DEC-029).
- Tagline: **"Turn your bio link into your best first impression."** (51 chars; PL localization pending).

### 1.5 Success criteria for MVP

- Time from landing → live public page with one block: ≤ **60 seconds** (Carrd guest-mode + social-import reveal).
- Free-tier creator satisfaction: >= **8/10** NPS at 30-day mark.
- First-product-sold conversion (Pro trial): **20%** at 14 days from upgrade.
- Category-wedge recall: Linktree-displaced creator arrivals recognize **all 5 wedges from §1.2** on first landing-page scroll without scrolling to FAQ.
- SLA adherence published and met: **48h / 12h / 4h** across Free / Pro / Business (live on Trust Center).

---

## 2. Feature areas overview

| Area | Code | Feature units | 1-line description |
|---|---|---|---|
| Onboarding & Identity | `F-001..019` | 12 | Guest-mode editor, handle claim, SSO, social import, palette extraction, first-run reveal. |
| Editor & Block System | `F-020..049` | 18 | Block library (10 types), rich-text, drag reorder, per-block CTA, theming, templates, draft/publish. |
| Public Page Rendering | `F-050..069` | 14 | Hub renderer, per-product page, SSR, OG/Schema.org, custom domain, PWA, age gate. |
| Commerce & Checkout | `F-070..099` | 16 | Products, bundles, communities, upsells, discounts, inline checkout, Stripe Connect, BNPL, multi-currency, VAT. |
| Analytics & Insights | `F-100..114` | 10 | Page views, link clicks, referrer, geo/device, revenue attribution, exports, tiered retention. |
| Email & Audience | `F-115..124` | 6 | Lead capture, subscriber list, double opt-in, newsletters, campaign builder light, Zapier bridge. |
| Growth Loops & Social Proof | `F-125..139` | 8 | Self-referral block, reviews, verified-buyer, hub trust score, directory, templates public previews, QR. |
| Customization & Theming | `F-140..164` | 14 | Themes, custom fonts, entrance animations, custom CSS (Business), dark-mode, favicon, OG image. |
| Templates & Starters | `F-165..169` | 4 | 8–12 PL-culture-named templates, niche-filtered gallery, public template URLs. |
| Custom Domain & Hosting | `F-170..179` | 5 | CNAME flow, SSL auto-provision, symbolic €2–€3 pricing, status page, incident log. |
| Admin & Trust | `F-180..199` | 10 | Admin panel, user mgmt, moderation queue, appeals, rate limits, GDPR export + delete, maintenance mode. |
| Integrations & API | `F-200..219` | 10 | Public REST API, webhooks, OpenAPI docs, Link Apps (embeds), deep integrations, Zapier, OAuth social. |
| AI Features | `F-220..229` | 5 | AI product description, AI page copy, AI thumbnail, AI diff-approval UX, AI search in FAQ. |
| EU/PL Localization | `F-230..244` | 8 | PL copy, Przelewy24/BLIK, VAT OSS, PL directory, PL-culture templates, GDPR cookie, "Ask AI" bilingual, values section. |
| Marketing Surfaces | `F-245..264` | 10 | Landing hero, audience marquee, persona tabs, FAQ, vs-pages, niche landing pages, pricing page, legal docs, status. |

**Total feature-unit budget: ~130 units.** Actual count after drafting: **see §N+1 MVP rollup**.

---

## 3. Onboarding & Identity

### 3.1 — F-001 · Guest-mode editor (build before signup)

- **Summary:** Visitor at `tadaify.com/try` opens the editor, builds a real page preview, and is prompted to sign up only at Publish/Save.
- **Why it's in scope:** Largest friction cut in the audit (`PAT-067`, Carrd-only). Stan + Linktree + Beacons all force signup before editor. A creator who spends 3 minutes arranging blocks has committed cognitively; signup completion rate jumps ≥30% (Carrd's observed ratio). Direct anti-Linktree wedge.
- **Competitor baseline:**
  - Stan: blocks editor pre-signup (`STS-020` — 5-field signup wall). Verdict `AVOID`.
  - Linktree: email/Google signup first, then editor. Verdict `AVOID`.
  - Beacons: username-first signup (`BCN-001`), still gates editor. Verdict `AVOID`.
  - Carrd: `/build` opens the editor cold (`CRD-LAND-001`). Verdict `ADOPT` (`PAT-067`).
  - Lnk.bio / Taplink / Milkshake / Bio.link / Later / Campsite: signup-first.
- **Tadaify implementation — behavior:**
  - `/try` route lands on the editor preloaded with template `Chopin` (default starter) + 3 sample blocks (1 external link, 1 section header, 1 lead-magnet stub).
  - Left pane: block palette (add new). Center: live preview. Right pane: block settings for selected block.
  - Creator can: add/remove blocks, reorder via drag, edit copy, change theme, try entrance animations, preview mobile/desktop.
  - Creator cannot: publish to a real handle, attach a custom domain, sell a product (commerce paywall), or persist beyond 7 days.
  - Guest session persisted to `localStorage` under `tadaify_guest_draft_v1` + server-side backup via anonymous `guest_drafts` row keyed to a UUID cookie (60-day TTL, rolling).
  - `Publish` / `Save` / `Claim handle` → signup modal (F-002). On signup success → backend migrates `guest_drafts[uuid]` → `pages[user_id]` and deletes the draft.
  - Unsaved-changes guard modal on nav-away (`PAT-029`, ports from Stan's pattern, which is itself a port from rich-text-editor conventions).
- **Tadaify implementation — data model:**
  - `guest_drafts(id uuid pk, session_cookie_id uuid, content jsonb, theme jsonb, created_at, updated_at, expires_at)` — net-new table; TTL via nightly pg_cron.
  - RLS: anonymous role can SELECT/UPDATE own by `session_cookie_id` match in header.
  - On migrate: `INSERT INTO pages (user_id, slug, content, theme) SELECT $1, 'new-page', gd.content, gd.theme FROM guest_drafts gd WHERE gd.id = $2`; then `DELETE FROM guest_drafts WHERE id = $2`.
- **Tadaify implementation — interfaces / APIs:**
  - `POST /api/guest/draft` — create draft (sets cookie, returns draft id).
  - `PATCH /api/guest/draft/:id` — update content (anonymous rate-limited — 10 req/min).
  - `GET /api/guest/draft/:id` — fetch (anonymous).
  - `POST /api/guest/draft/:id/migrate` — authenticated-only; called after signup completes.
  - Edge Function: `migrate-guest-draft` (Supabase Deno).
  - Background: pg_cron nightly `DELETE FROM guest_drafts WHERE expires_at < now()`.
- **Free vs Pro vs Business gating:** Free (and guest). No Pro/Business uplift.
- **Eng effort:** **L** (2 weeks). Editor must work cold without auth context; requires careful separation of `useAuth()` vs `useGuestSession()` and a render path that tolerates both.
- **Dependencies:** `F-020` editor shell; `F-025` theme engine; `F-002` signup modal.
- **MVP/Y1/Y2:** **MVP**. This is wedge #1 against Linktree's force-signup.
- **Test surface:**
  1. Cold visit `/try` → editor loads, preview renders, no network error; close tab → reopen within 60d → draft restored.
  2. Add 5 blocks, reorder, change theme, preview mobile → refresh → all changes persisted.
  3. Click Publish → signup modal appears → create account via Google SSO → new page appears in dashboard with blocks and theme intact, `guest_drafts` row deleted.
  4. Try Publish + close signup modal → draft still intact; try again tomorrow → still works.
  5. Unsaved-changes guard fires on browser close after edits.
- **Open questions:**
  - Which template seed — `Chopin` or empty-but-stylized blank? (Default: `Chopin` — reveal-first thesis per `DEC-SYN-04`.)
  - Should guest-mode allow entrance animations preview? (Yes — it's the reveal moment; Pro extension of 50 animations is gated at publish time.)
  - Abuse mitigation: anonymous user creates 1000 drafts as DoS? → rate-limit by cookie + fingerprint + CF rules; cap at 3 guest drafts per cookie.

### 3.2 — F-002 · Progressive username-first signup with live preview

- **Summary:** Handle claim first (with 3 smart alternatives + live `tadaify.com/<handle>` preview in brand wordmark), then SSO/email on screen 2.
- **Why it's in scope:** Commits visitor to identity before asking for credentials (`PAT-001`, Beacons). Stan's all-at-once signup (`PAT-024`) is the worst pattern in the audit — we explicitly invert it. The live wordmark preview is an `ORIGINATE` moment (nobody renders `tada!ify` live from user input) that converts the handle into an ownership instinct.
- **Competitor baseline:**
  - Beacons `BCN-001`: handle → Next → credentials. Verdict `ADOPT` (`PAT-001`).
  - Stan `STS-020`: 5 fields on screen 1. Verdict `AVOID`.
  - Linktree: email/Google first, handle second. Verdict `ADAPT` (we flip to handle-first).
  - Carrd: no handle concept (one-page sites).
  - Lnk.bio / Taplink: handle + email together.
- **Tadaify implementation — behavior:**
  - **Screen 1 — Claim handle:**
    - Input `tadaify.com/` prefix + text field + live availability indicator (debounced 300ms; green check / red × / amber "taken, try:").
    - Below input, render `tada!ify` wordmark live (Warm orb + purple orb + variant-F typography) with `/<handle>` appended in FG color — as the user types, the wordmark materializes ("this is what your page header looks like").
    - 3 smart alternatives on taken-handle: `<handle>-pl`, `the<handle>`, `its<handle>`. Locale-aware (PL IP → `<handle>-pl` first; US IP → `the<handle>` first).
    - `Hey @<handle> 👋 welcome to tadaify` dynamic header (`PAT-027`).
    - `Soft skip` link: "Decide later — claim auto-handle" → generates `user-<rand6>` and lets them continue.
    - Primary CTA: `Continue →` (Indigo primary).
    - Progress bar top: step 1 of 3 (~33%).
  - **Screen 2 — Credentials:**
    - 3 buttons stacked: `Continue with Google` / `Continue with Apple` / `Continue with email`.
    - Email path: email + password + (hidden) reserved name/country. IP-geo country default, `+1` US fallback — NEVER `+66` (`PAT-028` AVOID Stan's bug).
    - Social login buttons launch OAuth flow; successful OAuth → back to screen 3.
  - **Screen 3 — Welcome reveal:**
    - 30-second social import offered (IG handle + TikTok handle, both optional — `F-004` + `F-005`). Skip button.
    - Palette extracted from avatar on successful OAuth (`F-006`).
  - No phone field anywhere (`PAT-025` AVOID). Phone captured later at Stripe Connect KYC or 2FA opt-in.
  - No captcha on first paint; lazy-load hCaptcha on 3rd failed signup from same IP.
- **Tadaify implementation — data model:**
  - `profiles(user_id pk → auth.users.id, handle text unique, display_name, avatar_url, locale, country_code, plan text default 'free', stripe_customer_id, stripe_subscription_id, subscription_status, price_locked_until date, created_at)` — port from LinkOfMe `profiles` + add `handle` unique index + `price_locked_until`.
  - `reserved_handles(handle pk, reason)` — net-new, seeded with ~50 disallowed (admin/api/trust/help/blog/legal/directory/pricing/login/signup/…).
  - Trigger on `auth.users` insert → `profiles` row; handle claim after first screen via `claim_handle(p_handle)` SECURITY DEFINER RPC.
- **Tadaify implementation — interfaces / APIs:**
  - `GET /api/handle/available?h=<handle>` — anonymous, rate-limited 30/min.
  - `GET /api/handle/suggestions?h=<handle>&locale=pl|en` — anonymous, returns 3 smart alternatives.
  - `POST /api/handle/claim` — authenticated, transactional (SELECT FOR UPDATE on reserved + unique check).
  - `/auth/callback/google`, `/auth/callback/apple` — Supabase built-ins.
- **Free vs Pro vs Business gating:** N/A (signup is universal).
- **Eng effort:** **M** (1 week).
- **Dependencies:** `F-001` (guest draft migration), `F-003` (SSO), `F-006` (palette extract).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Claim available handle → live preview renders → Continue works.
  2. Claim taken handle → 3 alternatives appear → select `<handle>-pl` → Continue works.
  3. Try reserved `admin` → red × + message "Reserved handle".
  4. Soft skip → auto-handle `user-ab12cd` assigned.
  5. OAuth Google → back to app in claimed-handle state; Apple same.
- **Open questions:**
  - Rate limit target for handle availability check: 30/min/IP? (Tuned to allow typing.)
  - Handle minimum/maximum length: min 3, max 30? (Linktree allows up to 30.)
  - Allowed charset: `[a-z0-9-_]`? Emoji forbidden.

### 3.3 — F-003 · Google + Apple SSO + email signup

- **Summary:** Three authentication methods from day 1; Google and Apple visibly on screen 2, email as tertiary.
- **Why it's in scope:** `PAT-026` — Stan ships zero SSO; that alone is a ≥60% friction gap. Every audited competitor except Stan has Google. We match Linktree (Google + Apple) and exceed Beacons (Google only).
- **Competitor baseline:**
  - Beacons: Google only.
  - Linktree: Google + Apple.
  - Stan: none (`STS-020`). Verdict `AVOID`.
  - Carrd: email + Google.
- **Tadaify implementation — behavior:**
  - Supabase GoTrue with Google + Apple providers enabled.
  - Apple SSO: follows Apple's requirement for "Sign in with Apple" if any other SSO exists in an iOS app (future-proofs us if we add PWA-installable).
  - Email path collects email + password + confirm-password + ToS checkbox.
  - Post-signup: send verification email (`email_verified` row in `auth.users`).
- **Data model:** `auth.users` + `profiles` trigger already ported from LinkOfMe.
- **Interfaces:** Supabase GoTrue endpoints; post-signup webhook → our signup-complete Edge Function (send welcome email, seed `tadaify.com/<handle>` starter page).
- **Gating:** N/A.
- **Eng effort:** **S** (2 days — Supabase built-in + post-signup seed function).
- **Dependencies:** `F-002`.
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Google SSO happy path.
  2. Apple SSO happy path (requires Apple Developer account — gate on Y1 if not ready at launch).
  3. Email signup + verification.
  4. Email unverified → can log in but banner "Verify your email to publish".
  5. Re-use same email across Google + email path → GoTrue merges accounts (tested manually).
- **Open questions:**
  - Apple Developer account — when does the user want this provisioned? Claude recommends: week 2 of build.
  - LinkedIn SSO — defer to Y1 (`PAT-026` marks it optional).

### 3.4 — F-004 · Instagram social import (handle → avatar + bio + posts)

- **Summary:** Creator pastes IG handle, tadaify fetches public profile data (avatar, bio, follower count, last 3 posts) via official Meta API (or oEmbed fallback), pre-populates page.
- **Why it's in scope:** `DEC-SYN-02` wedge #2 — nobody bundles social-import + palette-extract + hero-default + animation. Even Linktree's Social Commerce has import but no animation/palette. Time-to-first-value becomes < 60 seconds.
- **Competitor baseline:**
  - Linktree 2026 Social Commerce: IG import ✅ + TikTok ✅, no palette, no animation.
  - Beacons: AI page gen from prompt, no handle import.
  - Stan `STS-021`: manual social handle entry, no autofill. Verdict `AVOID`.
  - Taplink AI: prompt-based gen, no handle import.
- **Tadaify implementation — behavior:**
  - On screen 3 of signup: input `Instagram: @<handle>` + `TikTok: @<handle>` both optional.
  - On submit: Edge Function calls Meta Graph API (public Basic Display) → fetches profile_pic_url, bio, username, media(limit=3).
  - On success: avatar → `profiles.avatar_url`; bio → `profiles.bio_short`; 3 posts → seeded as `external-link` blocks with "View on IG" CTA and embedded thumbnails.
  - On failure (private profile / rate-limited / handle typo): fall back to manual entry, show friendly error "Couldn't fetch — you can still enter details manually."
  - UX: shows progress `Importing your Instagram…` with 3-dot anim; when done, reveal animates the fetched data into the page preview ("before plain / after your page").
- **Data model:**
  - `profiles` adds: `instagram_handle`, `tiktok_handle`, `bio_short`, `avatar_url` (already ported).
  - `social_import_jobs(id uuid pk, user_id, provider text, handle, status text, raw_data jsonb, error_text, created_at)` — net-new for observability + retry.
- **Interfaces / APIs:**
  - `POST /api/import/instagram` — Edge Function; auth; body `{handle}`; calls Meta Graph API.
  - `POST /api/import/tiktok` — Edge Function; auth; body `{handle}`; calls TikTok Display API.
  - Rate limit: 10 imports/day/user (Meta quota constraint).
- **Gating:** Free. No Pro/Business uplift on MVP. (Y1: import 10 posts instead of 3, monthly re-sync — Pro.)
- **Eng effort:** **L** (2 weeks — Meta Basic Display + TikTok Display API + error handling + UI reveal).
- **Dependencies:** `F-002`, `F-006` palette extract.
- **MVP/Y1/Y2:** **MVP** (IG only is acceptable if TikTok API takes >1 week). TikTok is Y1 if budget tight.
- **Test surface:**
  1. Valid public IG handle → avatar + bio + 3 posts imported.
  2. Private profile → graceful fallback to manual, error logged to `social_import_jobs`.
  3. Rate-limited (11th import same day) → "Daily limit reached, try tomorrow" banner.
  4. Malformed handle `@@@` → rejected at validator.
  5. Skip entire step → page has blank avatar + no IG/TikTok blocks.
- **Open questions:**
  - Meta Basic Display requires Facebook app review — 1-2 week approval timeline at Meta. Start paperwork week 1.
  - Bio length trim: Linktree shows 100 chars max. IG bios go to 150. We trim at 150 + "…" overflow.
  - Retry policy on Meta 5xx: 3 retries with exponential backoff (200ms → 1s → 5s).

### 3.5 — F-005 · TikTok social import (handle → avatar + bio + posts)

- **Summary:** TikTok equivalent of F-004.
- **Why in scope:** Category table stakes; Linktree ships it.
- **Competitor baseline:** Linktree ✅, Beacons partial, others ✗.
- **Implementation:** mirrors `F-004` against TikTok Display API + oEmbed fallback.
- **Data model:** reuses `social_import_jobs`.
- **Interfaces:** `POST /api/import/tiktok`.
- **Gating:** Free.
- **Eng effort:** **M** (1 week).
- **Dependencies:** `F-004` Edge Function pattern.
- **MVP/Y1/Y2:** **MVP** (nice-to-have); Y1 acceptable.
- **Test surface:** mirrors F-004.
- **Open questions:** TikTok Display API quota limits.

### 3.6 — F-006 · Palette auto-extract from avatar (k-means)

- **Summary:** After social import (or first avatar upload), run k-means on the avatar image and derive a 3–5 color palette; apply as theme defaults.
- **Why in scope:** `DEC-SYN-03` wedge #3. No competitor ships this. The "magic moment" of "my page just matched my brand without me doing anything" is high-delight / low-engineering.
- **Competitor baseline:** None. Beacons has AI design suggestions, not pixel extraction.
- **Tadaify implementation — behavior:**
  - Edge Function receives image URL → downloads (10MB cap) → k-means (k=5) on downsampled 128×128 → returns 5 colors sorted by count.
  - Derive: Primary = most-frequent saturated; Accent = complementary HSV flip; Background = lightest neutral.
  - Apply to page `theme.palette`; store original avatar hash to skip re-processing.
  - UX: palette appears as 5 swatches with "Use this palette" + "Customize" + "Start from scratch".
- **Data model:**
  - `pages.theme` JSONB: `{palette: {primary, secondary, accent, bg, fg}, fonts, animation}`.
  - `avatar_palettes(avatar_hash pk, palette jsonb, created_at)` — cache to avoid re-k-means.
- **Interfaces:** `POST /api/palette/extract` Edge Function; accepts image URL; returns palette JSON.
- **Gating:** Free.
- **Eng effort:** **M** (1 week — k-means JS lib + caching + UI).
- **Dependencies:** `F-004`/`F-005` OR manual avatar upload (F-010).
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Brand-color avatar (blue logo) → palette has blue as Primary.
  2. Grayscale avatar → palette falls back to Indigo Serif defaults with a "Neutral avatar — using brand defaults" hint.
  3. Reject >10MB file.
  4. Cached palette hit (same avatar) returns in <50ms.
  5. User clicks "Customize" → opens appearance editor with palette pre-populated.
- **Open questions:**
  - Accessibility: derived palette may fail WCAG AA contrast. Policy: auto-adjust FG color to contrast-check pass; show warning if BG is too light/dark.

### 3.7 — F-007 · First-run reveal (before-plain → after-styled split preview)

- **Summary:** On first login post-import, show a split-screen animated reveal: "Linktree default" → "your tadaify page" with entrance animation.
- **Why in scope:** `DEC-SYN-12` + `PAT-069`. Converts onboarding completion from "chore" to "delight". Screenshotable social-share moment.
- **Competitor baseline:** None. Linktree has no reveal; Beacons AI is a 3-step wizard, not a before/after moment.
- **Implementation:** Static pre-rendered Linktree-style mockup (with creator's handle + basic list) on left; tadaify styled hero on right with chosen entrance animation (`F-148`) playing once; CTA `Publish →` below the pair.
- **Data model:** no persistent data; rendered from `profiles` + `pages`.
- **Interfaces:** client-only render.
- **Gating:** Free.
- **Eng effort:** **M** (1 week — visual polish matters).
- **Dependencies:** `F-006`, `F-148` animation library.
- **MVP/Y1/Y2:** **MVP**.
- **Test surface:**
  1. Fresh signup → reveal plays once → creator clicks Publish → page lives at `tadaify.com/<handle>`.
  2. "Use Plain Template instead" toggle → right side becomes default list layout.
  3. `prefers-reduced-motion` → reveal collapses to static side-by-side, no animation.
- **Open questions:** How aggressively do we compare to Linktree? User locked tone: *"we respect Linktree, we just ship more on Free"* — keep copy factual.

### 3.8 — F-008 · Dynamic `Hey @<handle> 👋` welcome (handle binding)

- **Summary:** Copy across signup + dashboard greets creator by claimed handle, mirroring input live.
- **Why in scope:** `PAT-027` — Stan's signup delight-touch. Raises perceived investment cost.
- **Implementation:** client-side render, bound to `profiles.handle`.
- **Eng effort:** **S** (1 day).
- **Dependencies:** `F-002`.
- **MVP**. Test: handle claim → welcome header updates in real time.

### 3.9 — F-009 · Unsaved-changes guard modal

- **Summary:** Modal intercepts nav-away when unsaved edits exist in editor or signup forms.
- **Why:** `PAT-029`.
- **Implementation:** `useBeforeUnload()` hook; modal component; two buttons `Stay on Page` / `Discard Changes`.
- **Eng effort:** **S**.
- **MVP**.

### 3.10 — F-010 · Avatar + cover image upload (with cropping)

- **Summary:** Creator can replace auto-imported avatar + upload a hub cover image; built-in cropper; Supabase Storage.
- **Why:** Every competitor has it; table stakes.
- **Implementation:** `react-easy-crop` + Supabase Storage (`avatars/` + `covers/` buckets); 5MB limit; JPEG/PNG/WebP.
- **Gating:** Free.
- **Eng effort:** **M**.
- **Dependencies:** none.
- **MVP**.

### 3.11 — F-011 · Country-code + locale auto-detect

- **Summary:** IP-geo detection populates country + locale on first render; PL IP → PL UI + PL copy.
- **Why:** `PAT-028` + EU/PL wedge. AVOID Stan's `+66` default.
- **Implementation:** Cloudflare `CF-IPCountry` header → fallback to accept-language → fallback to `US/en`.
- **Data model:** `profiles.country_code`, `profiles.locale`.
- **Eng effort:** **S**.
- **MVP**.

### 3.12 — F-012 · 7-day Pro trial from Free (one-click, no card)

- **Summary:** Free creator clicks "Try Pro 7 days free" in dashboard → Pro features unlock for 7 days → auto-reverts, no card collected.
- **Why:** `PAT-046`. Product-led upgrade funnel; drops creators into Pro's "wow moment" (commerce, email marketing) without card friction.
- **Implementation:** `profiles.trial_ends_at`; feature flags check trial OR paid; post-trial cron reverts.
- **Gating:** Free → Pro trial → Free or Pro.
- **Eng effort:** **M**.
- **Dependencies:** plan gating hooks (F-175).
- **MVP**.

### 3.13 — F-013 · Handle-locale suggestions (PL vs EN)

- **Summary:** If taken handle + PL email/IP → suggest `-pl`, `twoj-<handle>`, `polski-<handle>`.
- **Why:** EU/PL wedge, small polish.
- **Eng effort:** **S**.
- **MVP**.

### 3.14 — F-014 · Progress bar during signup (3 steps)

- **Summary:** Visual progress indicator 33% / 66% / 100% across signup screens.
- **Why:** `PAT` — Stan ships it; industry norm.
- **Eng effort:** **S**.
- **MVP**.

### 3.15 — F-015 · Onboarding checklist (dashboard post-signup)

- **Summary:** 5-item checklist visible on Free dashboard: complete profile → add first link → customize theme → claim domain → share on socials. Closeable.
- **Why:** `DEC-SYN-39` — LinkOfMe planned, unshipped; proven SaaS retention pattern.
- **Implementation:** `profiles.onboarding_state` JSONB tracking completion; dismissable per item.
- **Gating:** All tiers.
- **Eng effort:** **M**.
- **MVP** (not MVP-critical but ship-together).

### 3.16 — F-016 · Email onboarding sequence (7 emails over 30 days)

- **Summary:** Resend-driven drip: welcome → first block tip → analytics tour → Pro trial offer → success stories → retention pulse.
- **Why:** `DEC-SYN-40`. Activation + retention.
- **Implementation:** Resend templates + scheduled Edge Functions + unsubscribe handling.
- **Eng effort:** **M**.
- **MVP** (can be soft-launched Y1-early).

### 3.17 — F-017 · Skip-for-now path everywhere

- **Summary:** Every multi-step onboarding screen has a `Skip` secondary action; state captured so creator can return.
- **Why:** `PAT-023` — Stan's sparse-store publishability; Beacons gates too aggressively.
- **Eng effort:** **S** (pattern, not per-screen).
- **MVP**.

### 3.18 — F-018 · Registration limit / invite-gate (admin-toggleable)

- **Summary:** Admin can cap new signups per-day; over-cap visitors go to waitlist.
- **Why:** `DEC-SYN-41` — cost-controlled beta before scale. LinkOfMe pattern.
- **Implementation:** `app_settings.key='registration_limit'` JSONB; signup Edge Function checks.
- **Gating:** N/A.
- **Eng effort:** **S**.
- **MVP-early** (month 1).

### 3.19 — F-019 · `Sign in with Apple` compliance

- **Summary:** If any third-party SSO is offered + we eventually ship iOS → Apple required. Provision upfront.
- **Why:** App-store compliance future-proof.
- **Eng effort:** **S** (config; gated by Apple Dev account availability).
- **MVP** if Apple Dev account is ready; otherwise **Y1**.

---

## 4. Editor & Block System

### 4.1 — F-020 · Editor shell (left palette / center preview / right settings)

- **Summary:** Three-pane editor; left pane = add-block palette; center = live preview; right = per-block settings (show when block selected).
- **Why:** Industry-standard creator tool layout; Linktree/Beacons/Carrd all use variations.
- **Competitor baseline:**
  - Linktree: 2-pane (blocks list + preview); settings modal.
  - Beacons: 3-pane similar.
  - Stan: single-column list with per-block inline expand.
  - Carrd: 2-pane + floating settings.
- **Implementation:**
  - Virtualized block list (react-window if >50 blocks).
  - Center preview at fixed mobile (375×812) / tablet (768×1024) / desktop (1440×900) toggle.
  - Dark/light preview toggle.
  - Autosave every 2s after edit; debounce 500ms on typing.
  - Undo/Redo (ctrl-z / ctrl-shift-z) with 30-step history (client-side).
- **Data model:** `pages(id, user_id, slug, title, content jsonb, theme jsonb, status text default 'draft' CHECK IN ('draft','published'), published_at, created_at, updated_at)`; `blocks` embedded in `pages.content` as ordered array.
- **Interfaces:** `PATCH /api/pages/:id` with content diff; optimistic update; conflict-resolve last-write-wins for solo; Y1 CRDT for team.
- **Gating:** Free.
- **Eng effort:** **XL** (4 weeks — this is the product core).
- **Dependencies:** `F-021..F-034` block types populate the palette.
- **MVP**.
- **Test surface:**
  1. Add 10 blocks → reorder 3× → autosave → refresh → state persists.
  2. Undo 5 steps → redo 3 → state matches expectations.
  3. Switch to mobile preview → blocks reflow.
  4. Dark-mode preview toggles correctly.
  5. Conflict: edit same page in 2 tabs → last save wins, other tab toast warns.
- **Open questions:** CRDT Y1 vs LWW MVP — confirmed LWW + "someone else is editing" toast is enough for solo creators.

### 4.2..4.11 — Block types (one feature unit per type)

Tadaify ships **10 block types on day 1** (compared to Stan's 6 — `PAT-012` — and Linktree's 15+). The goal: cover every competitor pattern a real creator like Abigail Peugh (`STS-010`) needs, without ballooning to Linktree's 40-feature matrix.

#### 4.2 — F-021 · Link block (external link with icon)

- **Summary:** Simple external link with auto-detected icon, custom CTA, thumbnail optional.
- **Competitor baseline:** All competitors (table stakes).
- **Implementation:**
  - Fields: URL (required), label (default = URL title via oEmbed), icon (auto-detect from domain via `F-205`), thumbnail image (optional), custom CTA ("Visit", default).
  - Validation: URL format (native), open-graph fetch on paste for title + thumbnail suggestion.
  - Block schema: `{type:'link', url, label, icon_slug, thumbnail_url, cta_label, scheduled_at, expires_at}`.
- **Data:** port from LinkOfMe `links` rows; promote to block type.
- **Gating:** Free.
- **Eng effort:** **M** (port + extend).
- **MVP**.

#### 4.3 — F-022 · External-link block (unmonetized, e.g. podcast)

- **Summary:** Same as `F-021` but semantically tagged as external (Stan's `external-link`, `PAT-012`). Used for podcast, YouTube, Spotify.
- **Rationale:** Separation from affiliate helps analytics (`F-103`) and template rendering (no affiliate disclosure).
- **Implementation:** subtype flag `subtype:'external'`.
- **Gating:** Free.
- **Eng effort:** included in `F-021`.
- **MVP**.

#### 4.4 — F-023 · Section header block (separator label)

- **Summary:** Standalone typographic label, e.g. "MY COURSES", "THINGS I LOVE (affiliate links)" (`PAT-012`).
- **Implementation:** `{type:'section-header', text, style:'caps|normal|subtle'}`; renders as divider + label; no URL.
- **Gating:** Free.
- **Eng effort:** **S**.
- **MVP**.

#### 4.5 — F-024 · Affiliate-link block (FTC-compliant disclosure)

- **Summary:** External link with **auto-attached disclosure label** ("Affiliate link — I earn a small commission"). Creator cannot hide the disclosure.
- **Why:** `PAT-011` + US FTC compliance + EU similar. Trust wedge.
- **Implementation:** same as `F-021` + `{subtype:'affiliate', disclosure_text, disclosure_locked:true}`; default disclosure text is locale-aware ("Affiliate link" / "Link afiliacyjny").
- **Gating:** Free.
- **Eng effort:** **S**.
- **MVP**.

#### 4.6 — F-025 · Lead-magnet block (email capture for free download)

- **Summary:** Email-capture form that delivers a file (PDF/MP3/ZIP) after double-opt-in.
- **Why:** `PAT-012` + `DEC-SYN-07` — biggest Linktree complaint point (Linktree paywalls email capture on Starter $8/mo). Our free-tier wedge.
- **Implementation:**
  - Fields: title, description, file upload (Supabase Storage, max 50MB), thank-you copy, post-optin redirect URL.
  - Submission → `POST /api/lead-capture/:page_id/:block_id` → double opt-in email (Resend) → confirmation → deliver file URL (signed Supabase Storage URL, 7-day expiry).
- **Data:** `email_subscribers` (port from LinkOfMe BR-023/024/025) + new `lead_magnets(id, block_id, file_path, title, description, …)`.
- **Gating:** Free. (Linktree gates email-capture on Starter $8; we ship on Free.)
- **Eng effort:** **L** (2 weeks — file upload + signed URL + double opt-in + Resend template).
- **Dependencies:** `F-117` email subscribers infra.
- **MVP**.
- **Test surface:** file upload + opt-in + deliver + unsubscribe + expiry.

#### 4.7 — F-026 · Embed block (YouTube / Spotify / Vimeo / Calendly / generic iframe)

- **Summary:** oEmbed-powered rich media embed; auto-detect from pasted URL.
- **Why:** Table stakes; all competitors ship.
- **Implementation:** oEmbed providers whitelist; fallback generic iframe (creator must confirm CSP risk).
- **Gating:** Free.
- **Eng effort:** **M**.
- **MVP**.

#### 4.8 — F-027 · Social-profile block (IG / TikTok / YouTube / LinkedIn / Twitter with live follower count)

- **Summary:** Render creator's social profile with avatar + handle + live follower count; falls back to screenshot if API quota exhausted (`PAT-019` — Stan STS-011 pattern).
- **Why:** Social proof inside the public page; converts buyers at the credential level.
- **Implementation:** Meta/TikTok/YouTube APIs; cron refresh 24h per block; graceful fallback.
- **Data:** `social_profile_snapshots(block_id pk, provider, data jsonb, fetched_at)` cache.
- **Gating:** Free (basic: handle + link); Pro (live follower count refreshed daily).
- **Eng effort:** **L** (social API glue + refresh cron).
- **MVP**.

#### 4.9 — F-028 · Product block (paid digital product)

- **Summary:** Commerce block — price, thumbnail, description (rich-text), custom CTA, hero banner (for detail page), inline checkout (`F-090`), reviews (`F-132`), upsell slot (`F-075`).
- **Why:** Core commerce primitive (`PAT-012`). Gated to Pro — Free tier has no product block (`DEC-SYN-23/26` refined per §6.2).
- **Implementation:** see §5 Commerce.
- **Gating:** **Pro** (commerce-gated wedge).
- **Eng effort:** **XL** (part of commerce stack).
- **MVP**.

#### 4.10 — F-029 · Community block (recurring subscription)

- **Summary:** Monthly/annual subscription membership with Stripe Billing; gated content page post-purchase.
- **Why:** `PAT-012` — Stan Rich Girl Community pattern.
- **Gating:** **Pro**.
- **Eng effort:** **L**.
- **MVP** (thin version: subscribe + thank-you; gated content page Y1).

#### 4.11 — F-030 · Bundle block (compound product at grouped price)

- **Summary:** Creator selects 2-5 child products + sets bundle price; UI shows implied discount ("Save 25%").
- **Why:** `PAT-022` + Stan Eddie Abbew's `Fat Loss & Muscle Guide Bundle £34.99`.
- **Gating:** **Pro**.
- **Eng effort:** **M** (after F-028 ships).
- **MVP**.

#### 4.12 — F-031 · Countdown-timer block (opt-in scarcity)

- **Summary:** Creator adds end date/time + post-expiry behavior (hide / "expired" label / replace with fallback block).
- **Why:** `PAT-076` — Taplink; creator-configured opt-in, not platform-mandated.
- **Gating:** **Pro** (avoid sleaze-by-default on Free).
- **Eng effort:** **M**.
- **MVP** (Pro).

### 4.13 — F-032 · Rich-text editor (tiptap/lexical) for descriptions

- **Summary:** Product descriptions + section-header text + long-form sales copy support bold/italic/bullet/headers/links.
- **Why:** `PAT-015` — Stan STS-011 has 500+ word descriptions; we match.
- **Implementation:** tiptap (Apache 2 license) with minimal extension set.
- **Eng effort:** **M**.
- **MVP**.

### 4.14 — F-033 · Per-block custom CTA label (all tiers)

- **Summary:** Every block type accepts a custom CTA label override (3–40 chars, emoji allowed).
- **Why:** `PAT-006` — Stan's personalization superpower; Linktree paywalls CTA override on Pro; we ship on Free.
- **Eng effort:** **S** (universal field).
- **MVP**.

### 4.15 — F-034 · Drag-and-drop block reorder

- **Summary:** Mouse drag (desktop) + long-press (mobile) + keyboard up/down arrows; autosave on drop.
- **Why:** Industry standard; LinkOfMe ships it (BR-022 adj.).
- **Implementation:** `dnd-kit` library; accessibility-compliant (aria-grabbed, keyboard).
- **Eng effort:** **M**.
- **MVP**.

### 4.16 — F-035 · Block visibility toggle (show/hide without delete)

- **Summary:** Eye icon per block; hidden blocks omitted from public render but kept in editor.
- **Why:** Creator drafting convenience; Linktree has it.
- **Eng effort:** **S**.
- **MVP**.

### 4.17 — F-036 · Block scheduling (scheduled_at / expires_at)

- **Summary:** Per-block publish window: "live Mon 9am–Fri 5pm" or "publish next Monday, expire in 2 weeks".
- **Why:** `PAT-NONE` but LOM-008 (`DEC-SYN-10`); Linktree Starter+ only.
- **Implementation:** ports from LinkOfMe `link_scheduling` migration; RLS enforces visibility.
- **Gating:** Free.
- **Eng effort:** **S** (port).
- **MVP**.

### 4.18 — F-037 · Draft vs Published state + preview-only link

- **Summary:** `pages.status` flips draft ↔ published; creator gets a preview URL `tadaify.com/<handle>?preview_token=<uuid>` to share changes before going live.
- **Why:** Stan ships atomic publishing; we add preview-token share (ORIGINATE-adjacent).
- **Eng effort:** **M**.
- **MVP**.

### 4.19 — F-038 · Version history + rollback (Pro)

- **Summary:** Every Publish creates a snapshot; creator can view last 10 versions + rollback.
- **Why:** Not in competitor audit; differentiator for paid.
- **Gating:** **Pro**.
- **Eng effort:** **M**.
- **Y1** (defer — nice-to-have, not MVP-critical).

### 4.20 — F-039 · Multi-page support (creator can have N pages)

- **Summary:** Creator creates secondary pages at `tadaify.com/<handle>/<page-slug>`.
- **Why:** LinkOfMe ships it (BR-027). Useful for campaign landing pages.
- **Gating:** Free: 1 page. Pro: 5 pages. Business: unlimited.
- **Eng effort:** **M** (port from LinkOfMe `create_page` RPC).
- **MVP** (with Free=1 page, Pro=5).

### 4.21 — F-040 · Block type: "Featured" highlight (animated emphasis)

- **Summary:** Any block can be marked Featured — subtle glow/bounce entrance animation + larger visual weight.
- **Why:** `PAT` — Linktree Pro "highlight key links"; we ship on Pro to match parity.
- **Gating:** **Pro**.
- **Eng effort:** **S**.
- **MVP**.

### 4.22 — F-041 · Block type: QR-code block (shareable QR in-page)

- **Summary:** Block renders a QR code for a URL or the creator's own page; downloadable.
- **Why:** Table stakes.
- **Gating:** Free.
- **Eng effort:** **S** (LinkOfMe ships QR component, port).
- **MVP**.

### 4.23 — F-042 · Block type: Form (custom multi-field)

- **Summary:** Creator designs a form (name, email, dropdown, checkbox) + submissions land in dashboard.
- **Why:** Beacons ships; useful for coaches / services.
- **Gating:** **Pro** (anti-abuse).
- **Eng effort:** **L**.
- **Y1** (defer — useful but not wedge).

### 4.24 — F-043 · Block type: Booking (Calendly embed shortcut)

- **Summary:** Pre-configured Calendly/SavvyCal/Cal.com embed with nicer UX than raw iframe.
- **Why:** Coach segment (`DEC-SYN-34`) priority.
- **Gating:** Free (link) + Pro (native embed).
- **Eng effort:** **M**.
- **MVP** (thin version: link; Y1 for native calendar block).

### 4.25 — F-044 · Geo-conditional block (Pro)

- **Summary:** "Show this block only to visitors from [US/UK/PL]" or "everyone except PL".
- **Why:** `PAT-NONE` → positioning-gaps A6. Nobody ships.
- **Implementation:** Cloudflare CF-IPCountry header → `resolve_geo_variant(block_id, country)`; port concept from LinkOfMe BR-032 but rebuild at block level.
- **Gating:** **Pro**.
- **Eng effort:** **M**.
- **MVP** (`DEC-SYN-37` — reuse concept, not code).

### 4.26 — F-045 · Device-conditional block (Pro — Y1)

- **Summary:** Show iOS visitors App Store link; Android visitors Play Store link.
- **Why:** positioning-gaps A6.
- **Gating:** **Pro**.
- **Eng effort:** **S**.
- **Y1** (defer).

### 4.27 — F-046 · A/B test per block (Pro — Y1)

- **Summary:** Two block variants, 50/50 split, winner auto-promotes after N clicks.
- **Why:** LOM-018 concept; Linktree Premium only.
- **Gating:** **Pro**.
- **Eng effort:** **L**.
- **Y1**.

### 4.28 — F-047 · Import from Linktree (one-click migration)

- **Summary:** Creator pastes Linktree URL → we scrape blocks + create equivalent tadaify page.
- **Why:** Acquisition wedge — removes switching cost.
- **Implementation:** headless browser scrape (Playwright on Lambda) → parse blocks → create matching tadaify blocks; review screen before Publish.
- **Gating:** Free.
- **Eng effort:** **L** (scraping + mapping + ToS compliance).
- **MVP** (Linktree import only; Beacons/Stan imports Y1).

### 4.29 — F-048 · Copy-paste block duplicate

- **Summary:** Right-click or button → duplicate block below with "(copy)" suffix.
- **Why:** Minor UX; universal expectation.
- **Eng effort:** **S**.
- **MVP**.

### 4.30 — F-049 · Block template library (insert pre-made layouts)

- **Summary:** Creator inserts "Coach hero" or "Newsletter CTA" pre-configured block triplet.
- **Why:** Accelerates time-to-published; differentiator.
- **Gating:** Free.
- **Eng effort:** **M**.
- **MVP** (5-8 templates at launch; Y1 grows to 20+).

---

## 5. Public Page Rendering

### 5.1 — F-050 · Hub renderer at `tadaify.com/<handle>` (SSR)

- **Summary:** Server-rendered hub page; full theme application; full blocks; OG + Schema.org; mobile-first single-column by default.
- **Why:** SEO + social-share + crawlability (`PAT-013`). Stan/Linktree both SSR; we match.
- **Competitor baseline:**
  - Stan `STS-010`: mobile-first single column; SSR.
  - Linktree: SSR; column list.
  - Beacons: SSR-adjacent (Next.js).
  - Carrd: SSR static generation.
- **Implementation:**
  - Next.js-style SSR (or Astro/Remix/Nuxt — TR decision; likely **Next.js App Router** for React parity).
  - Cached at Cloudflare edge on published state (invalidate on Publish via webhook).
  - OG: `og:title` = creator display name, `og:description` = bio_short, `og:image` = auto-generated via F-055.
  - Schema.org: `Person` + `BreadcrumbList`; `Product`/`AggregateRating` on child product pages (F-051).
- **Gating:** Free.
- **Eng effort:** **XL** (foundational).
- **MVP**.

### 5.2 — F-051 · Per-product page `tadaify.com/<handle>/p/<slug>` (SSR + OG + Schema)

- **Summary:** Each product block gets its own SSR URL with full product detail (`PAT-013`, `PAT-014`).
- **Why:** Creator shares product URL, not hub URL (Stan pattern). Every product becomes a shareable SEO asset.
- **Competitor baseline:**
  - Stan `STS-011`: `/p/<slug>` SSR + 2-col sticky creator.
  - Linktree: no per-product page (redirect-only).
  - Beacons: product thumbnail → Stripe hosted.
- **Implementation:**
  - Desktop: 2-col; left = sticky creator identity (avatar + name + 4 social icons); right = product detail drawer.
  - Mobile: single-column full-width overlay.
  - Content: hero banner image, title, price, rich-text long-form description, embedded social profile, reviews, inline checkout (F-090), upsell (F-075).
  - OG per product (image = hero banner, title = product name, description = first 140 chars of description).
  - Schema.org `Product` + `Offer` + `AggregateRating` + `Review` markup.
  - Back arrow chip returns to hub without full page reload (SPA routing).
- **Gating:** Pro (blocks only appear if Pro active).
- **Eng effort:** **XL** (core commerce surface).
- **MVP**.

### 5.3 — F-052 · Short-form vs long-form product layout toggle

- **Summary:** Default layout is short-form (thumbnail + title + price + description 200 chars + Buy); creator toggles to long-form for high-ticket products.
- **Why:** Stan STS-011's long-form default is overwhelming for $9 products; `PAT-015` adapted.
- **Eng effort:** **S**.
- **MVP**.

### 5.4 — F-053 · Mobile-first responsive (single column mobile, 2-col desktop drawer)

- **Summary:** All public pages responsive; product pages switch to mobile drawer overlay at <768px.
- **Why:** `PAT-014`.
- **Eng effort:** covered in F-051.
- **MVP**.

### 5.5 — F-054 · Custom domain rendering (buyer at `yourdomain.com`)

- **Summary:** Creator CNAMEs `yourdomain.com` → `tadaify.com`; we serve their hub page at that domain.
- **Why:** `F-060` flagship wedge (symbolic €2–€3/mo).
- **Competitor baseline:** Linktree Pro $12+, Stan $29+, Beacons $10+, Lnk.bio $40/yr. We undercut.
- **Implementation:**
  - Creator adds `yourdomain.com` in settings → we verify CNAME points to `tadaify-edge.example.com`.
  - SSL via Let's Encrypt / Cloudflare SaaS (depending on scale).
  - Edge router maps `yourdomain.com` → `profiles.custom_domain → pages.<handle>`.
  - Apex (`@`) support via Cloudflare's flattening or AWS ALB.
- **Data:** `profiles.custom_domain text unique`, `profiles.domain_verified_at`, `profiles.domain_ssl_status`.
- **Gating:** Free + Custom Domain Add-on €2–€3/mo, OR Pro.
- **Eng effort:** **XL** (4+ weeks — SSL provisioning, verification, edge routing, renewal, error handling).
- **Dependencies:** plan billing (`F-175`).
- **MVP** (core wedge).
- **Test surface:**
  1. Creator adds domain, verification pending until CNAME set; we poll 1/min for 24h.
  2. Verification success → SSL provisioned within 5min → domain live.
  3. SSL renewal cron runs 30 days before expiry.
  4. Creator removes domain → routing removed within 5min.
  5. Apex + www both resolve correctly.

### 5.6 — F-055 · Auto-generated OG image per page + per product

- **Summary:** On publish, we generate a 1200×630 OG image: avatar + handle + brand orbs + tagline line.
- **Why:** `PAT-003` adjacent — social-share proof needs polish; no competitor auto-generates.
- **Implementation:** Satori/Vercel OG (React components → PNG) on Edge Function.
- **Eng effort:** **M**.
- **MVP**.

### 5.7 — F-056 · Schema.org markup (Product, Review, Person, BreadcrumbList)

- **Summary:** Structured data for Google Shopping rich results.
- **Why:** SEO organic; zero competitor ships product Schema on bio-link products.
- **Eng effort:** **S** (in SSR template).
- **MVP**.

### 5.8 — F-057 · Age gate interstitial (18+ click-through)

- **Summary:** Creator opts-in → visitors see click-through interstitial "I'm 18+". Local storage cookie persists 30 days.
- **Why:** `DEC-SYN-33` + `positioning-gaps A7`. No real verification (Yoti deferred).
- **Gating:** Free.
- **Eng effort:** **S**.
- **MVP** (toggle in settings; no marketing).

### 5.9 — F-058 · Password-protected pages (Pro)

- **Summary:** Creator sets a password; visitor enters password to view; session cookie 24h.
- **Why:** Carrd Pro Plus ships; paying market exists (private pages for coaching clients).
- **Gating:** **Pro**.
- **Eng effort:** **M**.
- **MVP**.

### 5.10 — F-059 · Public page light/dark toggle

- **Summary:** Per-page setting: always light / always dark / follow visitor's `prefers-color-scheme`.
- **Why:** Stan/Linktree don't ship dark on public pages; Etsy sells $15-50 templates for it. `ORIGINATE`.
- **Gating:** Free.
- **Eng effort:** **S**.
- **MVP**.

### 5.11 — F-060 · Custom domain pricing (€2–€3/mo add-on or Pro-included)

- **Summary:** Billing surface — creator buys `+ Custom domain €2.49/mo` on top of Free, OR Pro includes it.
- **Why:** USER-LOCKED positioning wedge. Linktree $12/mo vs ours €2.49 = 80%+ undercut.
- **Implementation:** Stripe add-on subscription; proration; cancel anytime.
- **Gating:** Free + add-on OR Pro.
- **Eng effort:** **M** (Stripe add-on + checkout flow).
- **MVP**.
- **Open Q:** Price point exactly — €2.49/mo or €2.99/mo? (Claude recommends €2.49/mo — the "under-€3" anchor.)

### 5.12 — F-061 · PWA installable (Add to Home Screen)

- **Summary:** Manifest + service worker; creators install app on mobile home screen.
- **Why:** Native-app feel without App Store cost. `DEC-SYN-15`.
- **Eng effort:** **M**.
- **MVP**.

### 5.13 — F-062 · Error states + maintenance banner rendering

- **Summary:** Public pages show friendly 404 / suspended / under-maintenance states.
- **Why:** UX polish; LinkOfMe has MaintenanceGuard.
- **Eng effort:** **S** (port).
- **MVP**.

### 5.14 — F-063 · Rate-limiting on public pages (anti-scrape + DoS)

- **Summary:** Per-IP rate limit on `/api/track` (analytics), `/api/lead-capture`, `/api/checkout/start`.
- **Why:** Abuse protection.
- **Implementation:** LinkOfMe rate-limit infrastructure ports (`check_rate_limit` RPC + 4 tables).
- **Eng effort:** **S** (port).
- **MVP**.

---

## 6. Commerce & Checkout

### 6.1 — F-070 · Product creation UI (admin)

- **Summary:** Creator creates a product: type (digital download / community / coaching / booking / bundle) + price + description + hero banner + thumbnail + files (for digital download) + upsell (Pro).
- **Why:** Core commerce. `PAT-012`.
- **Implementation:**
  - Form wizard: type → details → pricing → upsell → review.
  - Multi-image upload to Supabase Storage.
  - Digital download file (max 2GB, 1 file; Pro multi-file ZIP).
  - Rich-text description via `F-032`.
  - Slug auto-generated from title; editable; uniqueness within creator hub.
- **Data:** `products(id, user_id, slug, type, title, description_html, price_cents, currency, hero_banner_url, thumbnail_url, file_path, upsell_product_id, status, created_at)`; `product_files(product_id, file_path, display_name, ...)`.
- **Gating:** **Pro**.
- **Eng effort:** **XL** (core commerce).
- **MVP**.

### 6.2 — F-071 · Stripe Connect Express onboarding

- **Summary:** Creator connects Stripe Express account; 1-day payouts; handles KYC + bank connection.
- **Why:** `PAT-066` — Beacons highlights 1-day payouts; we match.
- **Implementation:** Stripe Connect Express; OAuth-like onboarding; phone collected here (not signup); KYC flows.
- **Data:** `profiles.stripe_connect_account_id`, `profiles.stripe_onboarding_completed_at`.
- **Gating:** Pro (only when creator creates first product).
- **Eng effort:** **L**.
- **MVP**.

### 6.3 — F-072 · Inline checkout (Stripe Elements on product page)

- **Summary:** Name + email + promo code + ToS + card (Stripe Elements) all on product page. No redirect to stripe.com. Apple/Google Pay on mobile.
- **Why:** `PAT-016` Stan moat. Product-defining.
- **Implementation:**
  - Stripe Elements via Payment Intent API.
  - `POST /api/checkout/start` → creates PaymentIntent (amount + currency + application_fee_amount=0 + transfer_data.destination=creator's Stripe account).
  - Apple Pay / Google Pay via Stripe's Payment Request API.
  - ToS checkbox required.
  - Promo code: `F-076`.
  - Upsell: `F-075`.
- **Data:** `orders(id, product_id, buyer_email, buyer_name, amount_cents, currency, stripe_payment_intent_id, status, promo_code_id, upsell_product_id, tax_amount_cents, created_at)`.
- **Gating:** **Pro**.
- **Eng effort:** **XL** (4 weeks).
- **MVP**.

### 6.4 — F-073 · Multi-currency (per-creator default + buyer-locale switcher)

- **Summary:** Creator sets default currency (auto from Stripe Connect country); buyer sees local currency switcher with live FX.
- **Why:** `PAT-021` + `ORIGINATE`.
- **Implementation:**
  - Creator's products stored at native currency (amount_cents).
  - Buyer-locale detection → offer "See prices in PLN" toggle.
  - FX via open exchange rates (4h cache); buyer sees their currency, charge still in creator's currency.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP**.

### 6.5 — F-074 · VAT auto-calculation (EU OSS) + invoice generation

- **Summary:** EU buyer country auto-detected via IP + billing address; VAT auto-applied (PL 23%, DE 19%, FR 20%, etc. — 27 EU countries); invoice PDF auto-emailed.
- **Why:** EU/PL wedge `DEC-SYN-47`; Stan/Linktree don't handle EU VAT.
- **Implementation:** **Stripe Tax** (official integration; handles OSS); invoice via Stripe's built-in.
- **Gating:** Pro.
- **Eng effort:** **L** (Stripe Tax integration + invoice branding + PL-language invoice copy).
- **MVP** (EU wedge).

### 6.6 — F-075 · Order-bump upsell (one per product, default unchecked)

- **Summary:** Creator configures 1 bonus product per product; buyer sees checkbox before PURCHASE; added to total on check.
- **Why:** `PAT-017`. Default unchecked (honesty).
- **Gating:** **Pro**.
- **Eng effort:** **M**.
- **MVP**.

### 6.7 — F-076 · Discount/promo code input (visible by default)

- **Summary:** Promo code input visible at checkout (not behind "have a code?"); live recalc.
- **Why:** `PAT-020` Stan pattern; conversion-positive for creators who share codes via email/IG.
- **Data:** `discount_codes(id, user_id, code, type text CHECK IN ('percent','flat'), value, usage_limit, expires_at, product_ids uuid[], created_at)`.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP**.

### 6.8 — F-077 · Reviews per product (verified-buyer badge)

- **Summary:** Reviews appear on product page; auto-verified-buyer badge if reviewer has a confirmed Stripe purchase.
- **Why:** `PAT-018` + `ORIGINATE` — Stan shows reviews but doesn't verify.
- **Implementation:**
  - 7 days post-purchase → email buyer with single-tap review link (signed token).
  - Review: rating (1-5) + text (max 500) + optional image upload.
  - Badge auto-set if `reviews.stripe_payment_intent_id` matches purchase.
  - Creator can hide a review (moderation) but cannot fake a verified badge.
- **Data:** `reviews(id, product_id, reviewer_email, rating, body, image_url, stripe_payment_intent_id, is_verified, hidden_at, created_at)`.
- **Gating:** Pro.
- **Eng effort:** **L**.
- **MVP**.

### 6.9 — F-078 · Hub aggregate trust score (creator level)

- **Summary:** Creator hub shows "4.8 avg across 5 products · 230 reviews · since 2024".
- **Why:** `ORIGINATE` — Stan has per-product only.
- **Implementation:** materialized view refresh on review insert; minimum 10 reviews before render.
- **Gating:** Pro.
- **Eng effort:** **S** (view + render).
- **MVP**.

### 6.10 — F-079 · Order management dashboard (creator)

- **Summary:** Orders list + detail + refund button + buyer info + dispute alerts.
- **Why:** Table stakes.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP**.

### 6.11 — F-080 · Digital download delivery (post-purchase)

- **Summary:** On successful Stripe webhook `payment_intent.succeeded` → email buyer with signed Supabase Storage URL (30-day expiry).
- **Why:** Core digital-product flow.
- **Eng effort:** **M**.
- **MVP**.

### 6.12 — F-081 · Buyer account (optional, for re-access)

- **Summary:** Optional — post-purchase "create password to re-download anytime"; otherwise magic-link login.
- **Why:** `ORIGINATE` against Stan (guest-checkout only); improves repeat purchases.
- **Gating:** Pro (creator-enabled) + Free (buyer).
- **Eng effort:** **L**.
- **MVP** (magic link only; full buyer account Y1).

### 6.13 — F-082 · Community subscription (Stripe Billing recurring)

- **Summary:** Monthly/annual subscription; gated content page post-purchase; cancel from buyer account.
- **Why:** `F-029` block type enable.
- **Gating:** Pro.
- **Eng effort:** **L** (Stripe Billing + gated content).
- **MVP** (thin: subscribe + thank-you; gated content Y1).

### 6.14 — F-083 · Refund UI (creator-initiated)

- **Summary:** Creator clicks Refund in order detail → Stripe refund; buyer emailed.
- **Eng effort:** **S**.
- **MVP**.

### 6.15 — F-084 · BNPL (Klarna + Affirm via Stripe)

- **Summary:** Creator enables BNPL per product for price > $50; buyer sees "3 payments of $X via Klarna".
- **Why:** `PAT-063` Beacons, Y1 `DEC-SYN-NEW`.
- **Gating:** Pro (opt-in per product).
- **Eng effort:** **M** (Stripe config).
- **Y1**.

### 6.16 — F-085 · Przelewy24 + BLIK + SEPA (PL/EU payment methods)

- **Summary:** Native PL payment methods alongside card; buyer in PL sees BLIK as default on mobile.
- **Why:** `F-095` EU wedge `DEC-SYN-47`. No US-first competitor ships.
- **Implementation:** Stripe supports Przelewy24 + BLIK natively as payment methods.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP** (EU wedge).

---

## 7. Analytics & Insights

### 7.1 — F-100 · Event tracking (page view + link click + conversion)

- **Summary:** Pixel-light events pipeline; session_id only (no PII); geo/device/referrer.
- **Why:** `DEC-SYN-11`; ports from LinkOfMe BR-012/014/015.
- **Implementation:**
  - `POST /api/track` from public page → inserts to `analytics_events`.
  - Session fingerprinting via cookie (30-day); no PII.
  - Geo via Cloudflare header; device via user-agent parse.
  - Sampling: 1:1 for <1k events/day per page; gradual sampling above.
  - `pg_cron` cleanup 28d (Free) / 365d (Pro) / all-time (Business).
- **Data:** ports `analytics_events` + `track-event` Edge Function + summary RPCs.
- **Gating:** Free: 28-day window + Top 10. Pro: 365-day + full. Business: all-time + export.
- **Eng effort:** **M** (port + tier gating).
- **MVP**.

### 7.2 — F-101 · Analytics dashboard — overview

- **Summary:** Creator sees page views + unique visitors + total clicks + top block + top referrer + geo heatmap + device split.
- **Why:** Table stakes; port LOM.
- **Gating:** Free (28d basic) / Pro (365d + detail) / Business (all-time + export).
- **Eng effort:** **M**.
- **MVP**.

### 7.3 — F-102 · Per-block click analytics

- **Summary:** Each block tile in editor shows "clicks last 7/28/365 days"; click-through expands to detail view.
- **Why:** Table stakes.
- **Eng effort:** **S**.
- **MVP**.

### 7.4 — F-103 · Revenue analytics (Pro — Stripe-connected)

- **Summary:** Per-product revenue + MRR (for communities) + AOV + refund rate.
- **Why:** Stan ships; we match.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP**.

### 7.5 — F-104 · Revenue attribution per link (beyond clicks)

- **Summary:** Where Stripe Connect attributes, show $ next to click count.
- **Why:** `DEC-SYN` (positioning A4) + `ORIGINATE`.
- **Implementation:** Stripe webhooks `payment_intent.succeeded` → `orders.source_block_id` link → aggregate.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **MVP**.

### 7.6 — F-105 · Data export (CSV) — Pro

- **Summary:** Creator exports events + orders + subscribers as CSV.
- **Why:** GDPR Art. 20 + creator convenience.
- **Gating:** Pro.
- **Eng effort:** **S** (port from LOM BR-017).
- **MVP**.

### 7.7 — F-106 · UTM parameter grouping (Business Y1)

- **Summary:** Group traffic by `utm_source`, `utm_campaign`, etc.
- **Gating:** Business.
- **Eng effort:** **M**.
- **Y1**.

### 7.8 — F-107 · Top 10 vs full (depth tier)

- **Summary:** Free shows top 10 referrers/locations; Pro shows full list.
- **Why:** `PAT-049`.
- **Gating:** Free / Pro.
- **Eng effort:** **S**.
- **MVP**.

### 7.9 — F-108 · Conversion funnel (Pro)

- **Summary:** Visitors → click → checkout started → purchase → review, rendered as funnel chart.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **Y1**.

### 7.10 — F-109 · GA4 / Meta / TikTok pixel integration

- **Summary:** Creator pastes tracking ID; events proxy to provider.
- **Why:** Stan Pro ships; Linktree Pro too.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **Y1** (MVP if eng budget allows).

### 7.11 — F-110 · Cohort retention (Business — Y2)

- **Summary:** Repeat-visitor cohorts.
- **Y2**.

### 7.12 — F-111 · Benchmarks ("your CTR vs fitness coaches avg") — Y2

- **Summary:** Anonymized peer benchmarks.
- **Y2**.

### 7.13 — F-112 · Weekly email digest (creator)

- **Summary:** Resend email every Monday with past-week stats.
- **Why:** Retention mechanism.
- **Gating:** Free (basic) + Pro (deep).
- **Eng effort:** **S**.
- **MVP**.

### 7.14 — F-113 · Real-time visitor count (Business — Y2)

- **Summary:** "12 people on your page right now".
- **Y2**.

---

## 8. Email & Audience

### 8.1 — F-115 · Subscriber list (port from LinkOfMe BR-023)

- **Summary:** `email_subscribers` table; creator sees list in dashboard.
- **Why:** `DEC-SYN-07` free-tier email capture.
- **Implementation:** port.
- **Gating:** Free (list view + CSV export) / Pro (send campaigns).
- **Eng effort:** **S** (port).
- **MVP**.

### 8.2 — F-116 · Double opt-in flow (Resend-based)

- **Summary:** Subscriber → email with confirm link → double opt-in → confirmed_at.
- **Why:** GDPR. Port from LinkOfMe BR-024.
- **Eng effort:** **S** (port).
- **MVP**.

### 8.3 — F-117 · Unsubscribe flow

- **Summary:** Every email has 1-click unsubscribe → updates `email_subscribers.unsubscribed_at`.
- **Eng effort:** **S** (port).
- **MVP**.

### 8.4 — F-118 · Campaign builder (Pro — lightweight)

- **Summary:** Creator composes simple text+image email, selects segment (all/product-buyers/lead-captures), sends via Resend.
- **Why:** Stan Pro ships at $99; we ship at $12 Pro.
- **Implementation:** Block editor for email; Resend API.
- **Data:** `email_campaigns(id, user_id, subject, body_html, segment, sent_at, stats jsonb)`.
- **Gating:** Pro.
- **Eng effort:** **L**.
- **MVP** (thin; Y1 segment builder).

### 8.5 — F-119 · Automated drip (welcome sequence)

- **Summary:** Trigger on subscribe → 3-email welcome sequence over 7 days.
- **Gating:** Pro.
- **Eng effort:** **M**.
- **Y1**.

### 8.6 — F-120 · Cart-abandon recovery (Business Y1)

- **Summary:** If buyer starts checkout but doesn't complete → email 1h later with link.
- **Gating:** Business.
- **Eng effort:** **M**.
- **Y1**.

### 8.7 — F-121 · ESP integrations (Mailchimp, Kit, Beehiiv)

- **Summary:** OAuth connect; subscriber forwarding.
- **Why:** `PAT-053` Linktree Pro parity.
- **Gating:** Pro.
- **Eng effort:** **M** each × 3 = **L total**.
- **MVP** (at least Mailchimp + Beehiiv for newsletter segment).

---

## 9. Growth Loops & Social Proof

### 9.1 — F-125 · Self-referral "Powered by tadaify" block (default ON on Free)

- **Summary:** Every Free page ships a footer block with creator's referral code; remove-branding only on Pro.
- **Why:** `PAT-008` Stan's viral-acquisition-replacement. Without this we need paid CAC.
- **Implementation:**
  - Default ON for Free.
  - Removable on Pro with toggle (creator loses 10% referral commission if hidden).
  - Links to `tadaify.com/?ref=<creator-handle>`.
- **Data:** `referral_codes(creator_user_id pk, code text unique)`; `referrals(id, referrer_user_id, referred_user_id, paid_plan_activated_at, commission_cents, created_at)`.
- **Gating:** Free (mandatory) / Pro (removable).
- **Eng effort:** **M**.
- **MVP**.

### 9.2 — F-126 · Referral program "tadaify Amplify" (30% recurring lifetime)

- **Summary:** Creator earns 30% of referred creator's MRR, recurring, as long as referred creator pays.
- **Why:** `DEC-SYN-29`. Matches Later, beats median.
- **Implementation:** referral link `tadaify.com/?ref=<code>`; 90-day cookie; Stripe Connect for payouts; dashboard shows referrals + earnings.
- **Gating:** All tiers earn; payouts require Stripe Connect.
- **Eng effort:** **L**.
- **MVP**.

### 9.3 — F-127 · Creator directory `tadaify.com/directory`

- **Summary:** Public, SEO-indexed directory of creator hubs + niche filter + language filter.
- **Why:** `PAT-040` + EU/PL wedge.
- **Implementation:** SSR; niche taxonomy (fitness / newsletter / coaches / photographers / …); language tags; per-creator opt-out.
- **Gating:** Free (opt-in, default).
- **Eng effort:** **L**.
- **MVP**.

### 9.4 — F-128 · Public template previews `tadaify.com/t/<name>`

- **Summary:** Each template has a public SSR preview URL viewable without login.
- **Why:** `PAT-059` `ORIGINATE`.
- **Eng effort:** **M**.
- **MVP**.

### 9.5 — F-129 · OG auto-share cards (per hub, per product)

- **Summary:** `F-055` extended — share buttons on hub that open pre-filled tweet / IG story.
- **Eng effort:** **S**.
- **MVP**.

### 9.6 — F-130 · QR code share modal

- **Summary:** Creator clicks Share → QR + color options + PNG download.
- **Why:** `DEC-SYN-08` + `PAT` (table stakes).
- **Implementation:** port LinkOfMe BR-022.
- **Eng effort:** **S** (port).
- **MVP**.

### 9.7 — F-131 · "Brag stats" public counter (optional)

- **Summary:** Creator toggles "show 500+ buyers · 4.8★ · since 2024" footer on hub.
- **Why:** `ORIGINATE` — social proof footer.
- **Gating:** Pro.
- **Eng effort:** **S**.
- **MVP**.

### 9.8 — F-132 · Review request email (7 days post-purchase)

- **Summary:** Automated email with single-tap review form (signed token).
- **Why:** Review acquisition; `PAT-018` adj.
- **Eng effort:** **M**.
- **MVP** (Pro).

---

## 10. Customization & Theming

### 10.1 — F-140 · Theme token system (light + dark)

- **Summary:** Creator sets Primary / Accent / BG / FG colors + dark variant. All blocks render against these tokens.
- **Why:** Theme engine. Brand-lock provides Indigo Serif defaults.
- **Eng effort:** **L**.
- **MVP**.

### 10.2 — F-141 · Theme presets (10–15 curated)

- **Summary:** Pre-configured palette bundles: Default / Minimal / Bold / Earth / Neon / Muted / PL-patriotic (red+white) / Premium Mono / etc.
- **Why:** `PAT-NONE` but Stan ships 11 presets, Linktree similar.
- **Eng effort:** **M**.
- **MVP**.

### 10.3 — F-142 · Font selector (8–12 display + 4 body faces)

- **Summary:** Creator picks heading font + body font from curated list.
- **Why:** Stan has 10 fonts; Linktree Pro has custom. We offer curated on Free, more on Pro.
- **Gating:** Free (8 pairings) / Pro (custom upload of 1 font).
- **Eng effort:** **M**.
- **MVP**.

### 10.4 — F-143 · Background types (solid / gradient / pattern / image)

- **Summary:** Creator chooses background: solid color, linear/radial gradient, subtle pattern, or uploaded image.
- **Why:** Table stakes.
- **Eng effort:** **M**.
- **MVP**.

### 10.5 — F-144 · Button shape (pill / rounded / sharp) + weight

- **Summary:** Creator picks button style globally.
- **Eng effort:** **S**.
- **MVP**.

### 10.6 — F-145 · Custom favicon (Pro)

- **Summary:** Upload 32×32 favicon for custom domain.
- **Why:** White-label polish.
- **Gating:** Pro.
- **Eng effort:** **S**.
- **MVP**.

### 10.7 — F-146 · Custom CSS/HTML (Business)

- **Summary:** Business creators can inject custom CSS + limited HTML (sanitized); preview-guarded.
- **Why:** `PAT` Linktree Premium ships; Lnk.bio Business.
- **Gating:** Business.
- **Eng effort:** **L**.
- **Y1**.

### 10.8 — F-147 · Dark-mode toggle on public pages

- **Summary:** Visitor can switch hub to dark; respects `prefers-color-scheme`.
- **Why:** `F-059`; duplicate — merge.
- **Eng effort:** covered.
- **MVP**.

### 10.9 — F-148 · Entrance animation library (5 free + 50 Pro)

- **Summary:** Choreographed animations that run once on page load: falling stars, paper confetti, spotlight sweep, card cascade, sticker pop (Free) + 50 extended (Pro).
- **Why:** `DEC-SYN-01` wedge #1 — nobody ships. But NOTE: user has refocused on Linktree-competitor wedge; keep but right-size.
- **Implementation:** Framer Motion + Lottie JSON definitions; per-page `theme.animation` selector; `prefers-reduced-motion` collapses.
- **Gating:** Free (5) / Pro (55).
- **Eng effort:** **L** (5 for MVP) + **XL** (50 extended for Y1 or MVP depending on DEC-SYN-21).
- **MVP** (5 core).

### 10.10 — F-149 · Animation diff-approval (AI-related)

- **Summary:** If creator picks AI-generated animation, show before/after preview.
- **Y1**.

### 10.11 — F-150 · Logo/avatar position (center/left/right)

- **Summary:** Creator picks hub identity layout.
- **Eng effort:** **S**.
- **MVP**.

### 10.12 — F-151 · Hero layouts (5 defaults, not stacked-list)

- **Summary:** `DEC-SYN-04` — tadaify defaults to hero-first layouts, not Linktree's stacked buttons.
- **Why:** `DEC-SYN-04` product-identity wedge.
- **Implementation:** 5 hero layouts: split-screen, full-bleed photo, centered-minimal, card-grid, spotlight-pinned.
- **Eng effort:** **L**.
- **MVP**.

### 10.13 — F-152 · Spacing + corner-radius scale

- **Summary:** Creator picks density (cozy / compact / spacious) + rounded vs sharp.
- **Eng effort:** **S**.
- **MVP**.

### 10.14 — F-153 · Per-block color overrides (Pro)

- **Summary:** Any block can override global theme color for emphasis.
- **Gating:** Pro.
- **Eng effort:** **S**.
- **MVP**.

---

## 11. Templates & Starters

### 11.1 — F-165 · 8–12 MVP templates (PL-culture-named)

- **Summary:** Chopin / Kopernik / Skłodowska / Kraków / Tatra / Wisła / Bałtyk / Mickiewicz + 2-4 generic (Prisma / Aurora / Noir).
- **Why:** `PAT-058` Linktree Aussie naming → we flip to PL (brand-locale signature) + `PAT-057` category-filtered gallery.
- **Implementation:** Each template = pre-configured `theme` + `content` blueprint + hero image + sample blocks.
- **Eng effort:** **L** (design + implementation of 10 templates).
- **MVP**.

### 11.2 — F-166 · Template gallery `/templates` + category filter

- **Summary:** Public gallery filterable by niche: Kreator / Fitness / Moda / Muzyk / SMB / Sport / Coach / Newsletter / Photographer.
- **Why:** `PAT-057`.
- **Eng effort:** **M**.
- **MVP**.

### 11.3 — F-167 · Public template preview at `/t/<name>`

- **Summary:** Full SSR preview without login — SEO-indexable.
- **Why:** `PAT-059` `ORIGINATE`.
- **Eng effort:** **M**.
- **MVP**.

### 11.4 — F-168 · Apply template = starter-blocks (editable)

- **Summary:** Template applies as editable blocks, not locked snapshot.
- **Eng effort:** **S**.
- **MVP**.

### 11.5 — F-169 · Template search box

- **Summary:** Text search across templates.
- **Eng effort:** **S**.
- **MVP**.

---

## 12. Custom Domain & Hosting

### 12.1 — F-170 · Custom domain add-on billing (€2–€3/mo)

- See `F-060`. Merge — same unit.

### 12.2 — F-171 · Trust Center `/trust` (uptime + incidents + SLA adherence)

- **Summary:** Public page with uptime % + incident log + SLA adherence dashboard.
- **Why:** `PAT-044` + `ORIGINATE` — no competitor ships real-time adherence.
- **Implementation:** Supabase + Statuspage.io-lite in-house; cron collects metrics; public JSON endpoint.
- **Eng effort:** **L**.
- **MVP**.

### 12.3 — F-172 · SLA adherence tracker (internal)

- **Summary:** Ticket system logs response times; dashboard shows real-time Free=48h / Pro=12h / Business=4h adherence.
- **Why:** Only works if support staffing resolves (open Q3 DEC-SYN).
- **Eng effort:** **L**.
- **MVP** (only if staffing is committed).

### 12.4 — F-173 · Creator Safeguard policy (48h warning + appeals)

- **Summary:** Public policy + appeals queue.
- **Why:** `DEC-SYN-05` wedge; 70% inherited from LinkOfMe.
- **Port:** LinkOfMe `CommunityStandardsPage` + `strikes` + `appeals` + `submit_moderation_appeal()` RPC + `TransparencyPage`.
- **Eng effort:** **M** (port + rebrand copy).
- **MVP**.

### 12.5 — F-174 · Granular GDPR cookie consent banner

- **Summary:** Per-category toggle (Necessary / Analytics / Marketing / Preferences); Accept All / Reject Non-Necessary / Manage buttons.
- **Why:** `PAT-078` + EU/PL wedge.
- **Eng effort:** **M**.
- **MVP**.

### 12.6 — F-175 · Plan gating hooks (frontend + backend)

- **Summary:** Central `hasFeature(user, feature_key)` utility; enforced client + server (RLS + RPC).
- **Why:** Infrastructure.
- **Eng effort:** **M**.
- **MVP**.

### 12.7 — F-176 · Price-lock guarantee (3-year)

- **Summary:** `profiles.price_locked_until`; billing webhook honors; quarterly audit.
- **Why:** `DEC-SYN-06` wedge.
- **Eng effort:** **S**.
- **MVP**.

### 12.8 — F-177 · Status page + incident subscriber emails

- **Summary:** Visitors subscribe to incidents via email.
- **Eng effort:** **S**.
- **MVP**.

### 12.9 — F-178 · SSL auto-renewal

- **Summary:** Cron renews 30d before expiry.
- **Eng effort:** included in F-054.
- **MVP**.

### 12.10 — F-179 · Domain health checker

- **Summary:** Dashboard warns if CNAME removed or domain expiring.
- **Eng effort:** **S**.
- **MVP**.

---

## 13. Admin & Trust

### 13.1 — F-180 · Admin panel `/admin` (port from LinkOfMe)

- **Summary:** Admin-only UI: users / moderation / maintenance / analytics.
- **Port:** LinkOfMe BR-007 + admin_users table + is_admin() RPC.
- **Eng effort:** **M** (port).
- **MVP**.

### 13.2 — F-181 · Maintenance mode (port)

- **Summary:** `app_settings.maintenance` JSONB; MaintenanceGuard in App.tsx; admin bypass.
- **Port:** LinkOfMe BR-041/042.
- **Eng effort:** **S** (port).
- **MVP** (required per global CLAUDE.md).

### 13.3 — F-182 · User management (list / ban / unban)

- **Port:** LinkOfMe admin-list / admin-ban / admin-unban Edge Functions + UserManagementAdminPage.
- **Eng effort:** **S** (port).
- **MVP**.

### 13.4 — F-183 · Moderation queue (reports + actions)

- **Port:** LinkOfMe BR-035..040.
- **Eng effort:** **S** (port).
- **MVP**.

### 13.5 — F-184 · Appeals queue (48h SLA)

- **Port:** LinkOfMe `submit_moderation_appeal()` RPC + queue UI.
- **Eng effort:** **S** (port).
- **MVP**.

### 13.6 — F-185 · Rate-limiting infrastructure

- **Port:** LinkOfMe 4 tables + `check_rate_limit()` RPC + Edge Function.
- **Eng effort:** **S** (port).
- **MVP**.

### 13.7 — F-186 · GDPR data export (port)

- **Port:** LinkOfMe BR-008 + user-export-data Edge Function.
- **Eng effort:** **S** (port + update table list).
- **MVP**.

### 13.8 — F-187 · GDPR data delete (port)

- **Port:** LinkOfMe BR-010 + delete_user_data() RPC.
- **Eng effort:** **S** (port + update table list).
- **MVP**.

### 13.9 — F-188 · Admin analytics (platform MRR, churn, creator cohort)

- **Summary:** Admin-only MRR chart + signups / day + top-10 creators by revenue.
- **Eng effort:** **M**.
- **MVP**.

### 13.10 — F-189 · Feature flag console (admin-toggle rollouts)

- **Summary:** `app_settings.feature_flags` JSONB; admin UI toggles per-feature.
- **Eng effort:** **S**.
- **MVP**.

### 13.11 — F-190 · Refund & dispute handling UI

- **Summary:** Admin can refund on behalf + mark dispute resolved.
- **Eng effort:** **S**.
- **MVP**.

### 13.12 — F-191 · Creator "suspicious activity" detection

- **Summary:** Heuristic — sudden product creation, high refund rate → flags.
- **Eng effort:** **M**.
- **Y1**.

---

## 14. Integrations & API

### 14.1 — F-200 · Public REST API (creator-self-serve keys)

- **Summary:** Endpoints `/api/v1/products`, `/v1/orders`, `/v1/analytics`, `/v1/subscribers`, `/v1/pages`; API keys in creator dashboard (multi-key, scoped).
- **Why:** `DEC-SYN-45` + `PAT-055` `ORIGINATE` — only wedge in category.
- **Implementation:**
  - JWT-based keys; scopes (`read:products`, `write:orders`, etc.).
  - Rate limits per tier: Free 1k req/mo / Pro 10k / Business 100k.
  - Standard REST (GET/POST/PATCH/DELETE); JSON:API-lite.
- **Gating:** All tiers (limits differ).
- **Eng effort:** **XL** (4 weeks).
- **MVP**.

### 14.2 — F-201 · Webhooks (order.created, order.refunded, page.published, lead.captured, review.created)

- **Summary:** Creator configures webhook URLs in dashboard; receives signed POST with event payload.
- **Why:** `DEC-SYN-45`.
- **Implementation:** Supabase + Deno Edge Function to fan out; HMAC signatures; retry queue with exponential backoff; dead-letter.
- **Eng effort:** **L**.
- **MVP**.

### 14.3 — F-202 · Public OpenAPI 3.1 spec + docs portal

- **Summary:** `developers.tadaify.com` with Redocly-style docs; code samples in JS/Python/Ruby/cURL.
- **Why:** `DEC-SYN-45`.
- **Eng effort:** **M**.
- **MVP**.

### 14.4 — F-203 · Zapier integration (triggers + actions)

- **Summary:** Triggers: new_order, new_subscriber, new_review, new_lead. Actions: create_product, apply_discount, send_email.
- **Why:** `PAT-056` — instant 5000+ apps.
- **Eng effort:** **M** (Zapier app build).
- **MVP** day 1.

### 14.5 — F-204 · Link Apps marketplace (10-15 embeds at launch)

- **Summary:** Lightweight embed blocks (Spotify / YouTube / TikTok / IG / Vimeo / Twitch / Calendly / Substack / Beehiiv / Kit / Patreon / Notion / Figma / Canva / Google Maps).
- **Why:** `PAT-053` + `PAT-054`.
- **Eng effort:** **L** (15 × S).
- **MVP**.

### 14.6 — F-205 · Social icon auto-detection (24 platforms, port)

- **Port:** LinkOfMe BR-021/LOM-009.
- **Eng effort:** **S** (port — 62 unit tests ported as-is).
- **MVP**.

### 14.7 — F-206 · Deep integrations (OAuth) — 3-5 at launch

- **Summary:** Mailchimp / Kit / Beehiiv / GA4 / Meta Pixel (OAuth-connected, not just embed).
- **Why:** `PAT-053`.
- **Gating:** Pro.
- **Eng effort:** **L** (each M).
- **MVP** (at least Mailchimp + Kit + GA4).

### 14.8 — F-207 · IFTTT integration (Y1)

- **Y1**.

### 14.9 — F-208 · Marketplace `/marketplace` with search + category filters

- **Why:** `PAT-054`.
- **Eng effort:** **M**.
- **MVP**.

### 14.10 — F-209 · Partner-submitted integrations (Y2)

- **Y2**.

---

## 15. AI Features

### 15.1 — F-220 · AI product description generator

- **Summary:** Creator enters title + category + price → GPT-4o generates 150-300 word description in creator's tone.
- **Why:** `PAT-065` Beacons has; we ship 3 on MVP (`DEC-SYN-NEW`).
- **Implementation:** OpenAI via Edge Function; diff-approval UX (before/after/regenerate/edit).
- **Gating:** Free 5/mo / Pro 100/mo / Business ∞.
- **Eng effort:** **M**.
- **MVP**.

### 15.2 — F-221 · AI page copy generator (hub tagline / intro)

- **Summary:** Creator inputs handle + niche → GPT generates headline + tagline + intro paragraph.
- **Eng effort:** **M**.
- **MVP**.

### 15.3 — F-222 · AI thumbnail generator (gradient + typography, not full image gen)

- **Summary:** Enter product title → generates 3 thumbnail options (palette-locked gradient + typography).
- **Why:** Low-cost AI (no image gen API); high perceived magic.
- **Implementation:** Satori/Canvas API server-rendered.
- **Eng effort:** **M**.
- **MVP**.

### 15.4 — F-223 · AI diff-approval UX

- **Summary:** Every AI output shows before/after side-by-side with approve/regenerate/edit buttons.
- **Why:** `ORIGINATE` against Beacons's black-box.
- **Eng effort:** **S** (pattern).
- **MVP**.

### 15.5 — F-224 · AI search in FAQ (landing + help)

- **Summary:** Semantic search over 40+ FAQs.
- **Why:** `DEC-SYN` — Linktree has static FAQ; we do semantic.
- **Gating:** Free.
- **Eng effort:** **M** (embedding + search).
- **Y1**.

---

## 16. EU/PL Localization & Wedge

### 16.1 — F-230 · Native PL copy across entire UI + landing

- **Summary:** All labels, emails, docs, landing copy translated (not machine-translated) to PL.
- **Why:** `DEC-SYN-47`. EU/PL wedge.
- **Eng effort:** **L** (translation + review).
- **MVP**.

### 16.2 — F-231 · Przelewy24 + BLIK + SEPA payment methods

- **Summary:** `F-085`; merged.

### 16.3 — F-232 · EU VAT OSS auto-calc via Stripe Tax

- **Summary:** `F-074`; merged.

### 16.4 — F-233 · PL creator directory filter

- **Summary:** `F-127` with language tag.
- **MVP**.

### 16.5 — F-234 · PL-culture template names (Chopin / Kopernik / etc.)

- **Summary:** `F-165` naming.
- **MVP**.

### 16.6 — F-235 · "Ask AI about tadaify" bilingual footer

- **Summary:** Pre-authored LLM queries in both EN and PL (ChatGPT / Claude / Gemini / Perplexity / Grok).
- **Why:** `PAT-060` + `ORIGINATE` bilingual extension.
- **Eng effort:** **S**.
- **MVP**.

### 16.7 — F-236 · "Our cores" PL values section on landing

- **Summary:** Polski niezależny biznes / No data resale / Fair wages / Work-life balance / Supports PL creators.
- **Why:** `PAT-072` adapted.
- **Eng effort:** **S**.
- **MVP**.

### 16.8 — F-237 · PLN currency support + PLN invoices

- **Summary:** Creator picks PLN as default; invoices in PLN with PL VAT text.
- **Eng effort:** **M**.
- **MVP**.

### 16.9 — F-238 · PL-IP auto-switch to PL locale

- **Summary:** `F-011`.
- **MVP**.

### 16.10 — F-239 · PL legal docs (ToS + Privacy + Cookie Policy in PL)

- **Summary:** Native PL legal copy reviewed by PL lawyer.
- **Eng effort:** **M** (external lawyer).
- **MVP**.

---

## 17. Marketing Surfaces

### 17.1 — F-245 · Landing hero with handle-claim + live wordmark preview

- **Summary:** `F-002` surface on landing; handle input → live `tada!ify/<handle>` preview.
- **Why:** `PAT-NONE` `ORIGINATE`.
- **Eng effort:** **M**.
- **MVP**.

### 17.2 — F-246 · Audience-persona tabs in hero (Twórcy / Edukatorzy / Usługi / Sklepy)

- **Summary:** `PAT-075` Taplink adapted.
- **Eng effort:** **M**.
- **MVP**.

### 17.3 — F-247 · Audience-segments marquee (22 PL-localized niches)

- **Summary:** `PAT-036` Linktree adapted.
- **Eng effort:** **S**.
- **MVP**.

### 17.4 — F-248 · FAQ on landing (8 items + semantic search Y1)

- **Summary:** `PAT-038`.
- **Eng effort:** **S**.
- **MVP**.

### 17.5 — F-249 · Real-creator showcase (2-3 seeded stores)

- **Summary:** `PAT-002`.
- **Eng effort:** **S** (seeded by content team).
- **MVP**.

### 17.6 — F-250 · Lifestyle-photography hero

- **Summary:** `PAT-035`.
- **Eng effort:** **S** (editorial photoshoot).
- **MVP**.

### 17.7 — F-251 · Pricing page (public, in nav, all tiers)

- **Summary:** `PAT-031` AVOID Stan; `PAT` ADOPT Linktree publicness.
- **Eng effort:** **M**.
- **MVP**.

### 17.8 — F-252 · 11 vs-pages targeting weak SERPs (tadaify vs linktree etc.)

- **Summary:** `DEC-SYN-30`.
- **Eng effort:** **L** (content × 11).
- **MVP**.

### 17.9 — F-253 · 5 niche landing pages (coach / newsletter / photographer / musician / real-estate)

- **Summary:** `DEC-SYN-31`.
- **Eng effort:** **L**.
- **MVP**.

### 17.10 — F-254 · Legal footer (ToS / Privacy / Cookie / Trust / SLA)

- **Summary:** `PAT-039` adapted.
- **Eng effort:** **S**.
- **MVP**.

---

## N+1. MVP scope recommendation — rich MVP for a Linktree-competitor launch

### Total MVP feature count: **~95 feature units**

Grouped by area (MVP subset only):

| Area | MVP feature units | Key units | Eng effort |
|---|---|---|---|
| Onboarding & Identity | 14 | F-001, F-002, F-003, F-004, F-005, F-006, F-007, F-008, F-009, F-010, F-011, F-012, F-014, F-015 | 7 weeks |
| Editor & Block System | 15 | F-020..F-030, F-032..F-037, F-044, F-047, F-048, F-049 | 10 weeks |
| Public Page Rendering | 11 | F-050..F-057, F-060..F-063 | 8 weeks |
| Commerce & Checkout | 11 | F-070, F-071, F-072, F-073, F-074, F-075, F-076, F-077, F-078, F-079, F-080, F-081, F-082, F-083, F-085 | 10 weeks |
| Analytics & Insights | 6 | F-100..F-104, F-105, F-107, F-112 | 4 weeks |
| Email & Audience | 4 | F-115, F-116, F-117, F-118, F-121 partial | 3 weeks |
| Growth Loops | 7 | F-125, F-126, F-127, F-128, F-129, F-130, F-131, F-132 | 5 weeks |
| Customization & Theming | 11 | F-140..F-145, F-147, F-148 (5 core), F-150..F-153 | 6 weeks |
| Templates & Starters | 5 | F-165, F-166, F-167, F-168, F-169 | 3 weeks |
| Custom Domain & Hosting | 7 | F-170, F-171, F-173, F-174, F-175, F-176, F-177, F-178, F-179 | 5 weeks |
| Admin & Trust | 10 | F-180..F-189, F-190 | 3 weeks (mostly port) |
| Integrations & API | 6 | F-200, F-201, F-202, F-203, F-204, F-205, F-206, F-208 | 6 weeks |
| AI Features | 4 | F-220, F-221, F-222, F-223 | 2 weeks |
| EU/PL Localization | 9 | F-230..F-239 | 4 weeks |
| Marketing Surfaces | 10 | F-245..F-254 | 6 weeks |

**Aggregate eng effort (parallelizable):** ~82 weeks of engineer-time. With a 3-person team at 90% velocity = **~30 calendar weeks ≈ 7 months** to MVP. With 5-person team = **~18 calendar weeks ≈ 4 months**. This is Q3-2026 launch at 3-engineer pace, Q2-2026 at 5-engineer pace.

### Controversial inclusions — rationale

#### Why custom domain at €2–€3/mo is MVP (not Y1)

- **User-locked positioning wedge.** The category's cheapest-in-class (Lnk.bio) is $39.99/year = ~$3.33/mo as an add-on; Linktree/Beacons bundle into $10-15/mo tiers. Our €2.49/mo add-on is ~25% below Lnk.bio and ~80% below Linktree Pro equivalent.
- **Acquisition weapon, not revenue driver.** A creator who buys `yourdomain.com` at €2.49/mo is 5× more committed to the product than a Pro subscriber. Churn is near-zero.
- **Eng cost is fixed.** Once SSL provisioning + CNAME edge routing ships (`F-054` ~4 weeks), the cost of adding the €2.49/mo SKU is one Stripe product + one billing line. No marginal cost per creator.

#### Why inline checkout is MVP (not Y1)

- **Only commerce moat with network effects.** Every product URL becomes a shareable marketing asset (`PAT-013`). Stan's entire business is built on this pattern. If we ship commerce without inline checkout, we're a worse Stan.
- **Pro tier pricing justification.** Charging $12/mo Pro requires something creators can't get at Linktree Free. Inline checkout + per-product pages is that thing.
- **Eng is bounded.** Stripe Elements + Payment Intent API is ~4 weeks for a senior engineer. Not cheap, but not open-ended.

#### Why "free customization max-out" requires specific F-XYZ items

The Free tier's "everything Linktree locks behind Pro, for free" promise requires:

- `F-021..F-027`, `F-033` — all standard block types + custom CTA labels (Linktree Pro-gated).
- `F-036` — link scheduling (Linktree Starter+).
- `F-100` + `F-107` — 28-day analytics with Top 10 referrers on Free (Linktree Starter $8+).
- `F-115`..`F-117`, `F-025` — email capture + subscriber list (Linktree Starter $8+).
- `F-130` — QR code (Linktree Free ships).
- `F-148` (5 core animations) — the reveal wedge (`DEC-SYN-01`).
- `F-140..F-145`, `F-147`, `F-150..F-153` — full theme system (Linktree Pro-gated).
- `F-165..F-169` — templates including public previews (no competitor ships public previews).
- `F-060` — custom domain add-on (Linktree Pro $12 min; we undercut to €2.49).

**Non-MVP on Free:** entrance-animation extended library (50 more) → Pro; real-time analytics → Pro; revenue attribution → Pro (requires Stripe Connect anyway); multi-page beyond 1 → Pro.

#### Why specific features are deferred despite being in synthesis

- `F-038` (version history) — useful but not wedge-critical; Y1.
- `F-042` (custom form builder) — useful but displaced by lead-magnet (`F-025`) for MVP audience; Y1.
- `F-046` (A/B testing) — Y1 (Pro differentiator when we have creators paying Pro).
- `F-084` (BNPL Klarna/Affirm) — useful on high-ticket but MVP audience AOV is <$50 anyway; Y1.
- `F-106` (UTM grouping) — advanced analytics; Y1.
- `F-108` (conversion funnel) — Y1.
- `F-146` (custom CSS/HTML) — Business tier feature; Y1.
- `F-191` (suspicious activity detection) — scales with users; Y1.
- Entrance animations 50-extended (`DEC-SYN-21`) — depends on user decision Q10. If full MVP = 55 animations at launch → 3-4 extra weeks. Claude recommends: ship 15 at MVP + 40 more over Y1.

---

## N+2. Y1 roadmap — months 1–12 post-launch

| Month | Feature unit(s) | Why now |
|---|---|---|
| M+1 | `F-016` email drip; `F-019` Apple SSO (if deferred); `F-190` refund UI polish | Activation / retention |
| M+2 | `F-038` version history (Pro); `F-045` device-conditional blocks (Pro) | First Pro differentiators |
| M+3 | `F-046` A/B testing (Pro); `F-108` conversion funnel (Pro); `F-068` additional Link Apps | Data-driven creators upgrade |
| M+4 | `F-084` BNPL (Klarna + Affirm); `F-106` UTM grouping (Business); `F-119` automated drip | High-ticket creators + advanced analytics |
| M+5 | `F-042` custom form builder (Pro); `F-132` review request automation; full `F-148` extended animations (55 total) | Extend editor + polish |
| M+6 | **NATIVE SHOPIFY SYNC** (`DEC-SYN-14` revisit); `F-120` cart-abandon recovery; `F-207` IFTTT | Post-Linkpop Shopify refugees |
| M+7 | `F-224` AI FAQ search; `F-191` suspicious activity detection; `F-146` custom CSS/HTML (Business) | Scale-ready features |
| M+8 | `F-063` auto-suggestions (link health v2 realtime); `F-193` team seats (Business) | Business-tier fill |
| M+9 | `F-213` partner-submitted integrations (Business app store) | Ecosystem |
| M+10 | Native iOS app (`DEC-SYN-15` if PMF met); Brand-deal marketplace lite (Beacons partial) | Native mobile if ARR justifies |
| M+11 | Full transparency report Y1; enterprise sales page | Maturity |
| M+12 | Full AI suite (audience insights, subject-line gen, content calendar) | AI depth |

---

## N+3. Y2 roadmap — months 12–24 post-launch

- **Multi-brand workspace** (`DEC-SYN-18` partial revisit) — agencies managing 3-10 creators.
- **Brand-deal marketplace** (Beacons moat challenge — only if primary segment demands).
- **Deep course hosting** — lightweight version with video upload + basic progress (not Teachable depth).
- **Native Android app**.
- **Open developer API v2** — bulk endpoints, GraphQL option.
- **AI animation generator** — creator prompts → custom Lottie via Stable-Video or similar.
- **Cross-creator promotional network** — "promote another creator's product, earn 10%".
- **Advanced team tools** — roles, approval workflows, audit log (Business).
- **SOC 2 Type I certification**.
- **Native Etsy / Gumroad / Podia import** (beyond Linktree).
- **PL Business customer features** — JPK-FA XML invoices, Polish accounting integration (iFirma, Fakturownia), INPOST paczkomaty for physical goods.
- **AppSumo lifetime deal** (month 18 only, not earlier — cash-flow call).
- **Enterprise SSO** (SAML / SCIM) if a real contract appears.

---

## N+4. Explicit NOT-doing list

Features we deliberately skip even at Y2:

1. **Course hosting with quizzes + certificates + drip lessons** (`DEC-SYN-13`). Stan's $400M GMV moat is deep; we'd lose.
2. **Native video hosting + live streaming** — bandwidth costs kill us; creators embed from YouTube / Vimeo.
3. **Native podcast hosting** — Transistor / Podbean own it.
4. **AI brand-deal pitch automation** (`DEC-SYN-16`, `PAT-062`) — Beacons's moat.
5. **Media kit builder** (`DEC-SYN-19`) — Beacons's moat.
6. **Lifetime one-time payment tier** (`DEC-SYN-17`, `PAT-073`) — unit economics don't support.
7. **Fee ladder** (`PAT-043`) — brand-conflicting.
8. **Celebrity showcase on landing** (`PAT-037`) — we use mid-creators.
9. **Apex-register domain sales** — too much Ops burden.
10. **Full CRM (brand contacts, deal pipeline)** — out of category.
11. **Affiliate network** for creators' products — out of scope; creators use Impact / ShareASale.
12. **Our own payment processor** — Stripe Connect only.
13. **NFT / crypto payments** — not our audience.
14. **Middle-dot `·` separator as brand mark** (`PAT-005`) — Stan's territory.
15. **Indigenous land acknowledgement footer** — Linktree's Aussie-specific signal (`PAT-039` partial AVOID).
16. **Anti-platform "algorithm is the enemy" verbatim copy** (`PAT-064`).

---

## N+5. Cost-of-goods drivers per feature unit (MVP + Y1)

HIGH cost-of-goods — gate to Pro/Business, monitor carefully:

| F-NNN | Cost driver | Why high |
|---|---|---|
| `F-220..F-222` AI features | OpenAI per-token | $0.003/1k input tokens × ~1.5k avg = $0.005/gen × 5/mo free × 10k creators = $250/mo baseline; Pro 100/mo can spike to $5k/mo. Mitigate: volume tiers, aggressive cache, cheaper models (gpt-4o-mini) for draft. |
| `F-054` + `F-060` custom domain | Cloudflare SaaS + SSL cert | ~$0.10/domain/mo (Cloudflare SaaS) or self-hosted Let's Encrypt (ops cost). At scale 10k domains = $1k/mo. Price €2.49 covers comfortably. |
| `F-100..F-104` analytics | Supabase storage + query compute | Events table grows fast; cleanup cron + partitioning + materialized views essential. |
| `F-115..F-121` email sends | Resend per-email | $0.001/email × 50k sends/mo = $50/mo baseline; spikes during newsletter campaigns. Pro quota needed. |
| `F-070..F-083` commerce | Stripe passthrough (not our cost) + refund dispute fees ($15/dispute) | Bank disputes hit creator, but we absorb the $15 in edge cases. |
| `F-004..F-005` social import | Meta/TikTok API quota | Free tier quotas limited — may need paid tier of APIs at scale. |
| `F-063` rate limiting | Supabase Edge Function invocations | Cheap but monitor. |
| `F-127` creator directory | SSR + CDN cache | Cheap if cached. |
| `F-148` entrance animations | One-time motion design + Lottie payload | Payload <50KB per animation; CDN-cached. |

MEDIUM cost-of-goods:

- `F-050..F-051` hub/product SSR — cached at edge, cost negligible at MVP scale.
- `F-200..F-202` API — bounded by rate limits; small.
- `F-006` palette extract — one k-means per avatar, cached.

LOW cost-of-goods (no gating pressure):

- All template / theming / editor work (purely compute at creator edit time).

**Infra cost agent should weigh top 3:**

1. **AI features** — the spike risk. Budget $500-2000/mo for MVP + tier gate.
2. **Custom domain SSL at scale** — need clear architecture (Cloudflare SaaS $200/mo for 10k domains vs self-hosted LE cert management).
3. **Analytics event storage** — partition strategy + cold storage off-loading by Y1.

---

## N+6. Glossary

- **Hub** — creator's main public page at `tadaify.com/<handle>`.
- **Block** — a single unit on a hub: link, product, community, lead-magnet, section-header, affiliate-link, external-link, embed, social-profile, bundle, countdown.
- **Product URL** — per-product shareable page at `tadaify.com/<handle>/p/<slug>`.
- **Page URL** — creator's hub URL `tadaify.com/<handle>` or secondary page URL `tadaify.com/<handle>/<page-slug>`.
- **Creator** — account holder with a hub; primary user persona.
- **Buyer** — end-visitor who purchases a product; may or may not have a tadaify account.
- **Handle** — unique creator identifier (3-30 chars, `[a-z0-9-_]`); also their public URL path.
- **Guest draft** — unsaved page built via `/try` before signup; TTL 60 days.
- **Reveal** — tadaify's signature onboarding moment: social import + palette extract + entrance animation on the first-view page.
- **Template** — pre-configured theme + starter blocks; PL-culture-named (Chopin, Kopernik, …).
- **Entrance animation** — choreographed motion that runs once on page load (`F-148`).
- **Custom domain** — creator's own domain (e.g., `yourdomain.com`) pointing at their hub via CNAME.
- **Verified Buyer badge** — auto-attached to reviews when reviewer has a matching Stripe payment intent.
- **SLA adherence** — tadaify's public dashboard of real-time support ticket response times per tier.
- **Self-referral block** — "Powered by tadaify" footer on every Free hub; removable on Pro (at cost of commission).
- **Price-lock guarantee** — tadaify's 3-year price commitment at signup.
- **Creator Safeguard** — tadaify's 48h-warning moderation policy with human-review appeals.
- **Free / Pro / Business** — three plan tiers (Business Y1 add).
- **Link App** — lightweight embed block (Spotify, YouTube, Calendly, …); distinct from deep OAuth integrations.
- **Integration** — deep OAuth-connected service (Mailchimp, Shopify, GA4, Meta Pixel).
- **BLIK / Przelewy24** — Polish online payment methods (native at checkout).
- **VAT OSS** — EU one-stop-shop VAT regime for digital services across EU27.
- **MVP** — launch scope; `F-NNN` items tagged MVP.
- **Y1** — months 1-12 post-launch; `F-NNN` items tagged Y1.
- **Y2** — months 12-24 post-launch.
- **BR-NNN** — business requirement ID in `tadaify-app/docs/BUSINESS_REQUIREMENTS.md`.
- **TR-NNN** — technical requirement ID in `tadaify-app/docs/TECHNICAL_REQUIREMENTS.md`.
- **LOM** — LinkOfMe, the source project for 14 subsystems ported into tadaify per `DEC-SYN-35`.
