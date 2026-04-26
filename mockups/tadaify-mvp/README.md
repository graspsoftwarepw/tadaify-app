# tadaify MVP mockups — registry & changelog

> This folder is the **visual contract** for tadaify implementation. Every accepted
> mockup links to a GitHub Issue (F-XXX-NNN) which carries acceptance criteria,
> test plan, and DoD checklist. Implementation MUST match the mockup unless an
> approach-change comment is added to the issue per the orchestrator's
> `change-tracker` skill.

## Canonical mockups (final, ready for implementation)

| File | Purpose | Implementation story | Last accepted |
|------|---------|---------------------|---------------|
| `landing.html` | Public landing page — hero, social proof, pricing, FAQ | [#1 F-LANDING-001](https://github.com/graspsoftwarepw/tadaify-app/issues/1) | 2026-04-24 |
| `register.html` | Sign-up — 3-section progressive wizard, magic-link / Google OAuth | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `login.html` | Sister page to register, magic-link toggle, welcome-back hint via ?handle= | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-welcome.html` | Step 1 — multi-select platform picker (9 platforms, mobile-first) | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-social.html` | Step 2 — enter @handles for selected platforms (no OAuth, DEC-SOCIAL-01) | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-template.html` | Step 3 — choose starter template (6 CSS-rendered previews) | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-blocks.html` | Step 4 — confirm pre-populated social blocks + add manually | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-tier.html` | Step 5 — pick plan (Free default, price-lock-for-life banner, universal $2 add-on) | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `onboarding-complete.html` | Success — confetti + clipboard copy + Motion v10 burst | [#3 F-FULLFLOW-001](https://github.com/graspsoftwarepw/tadaify-app/issues/3) | 2026-04-25 |
| `app-dashboard.html` | **Authenticated creator dashboard** — single sidebar + accordion + breadcrumb stepper for Design (v2 IA, accepted 2026-04-25) | [#26 F-APP-DASHBOARD-001](https://github.com/graspsoftwarepw/tadaify-app/issues/26) | 2026-04-25 |
| `app-domain.html` | Custom domain management — 3-step add wizard (Enter / DNS / Live) + Free-tier subscription overlay + status states | [#30 F-CUSTOM-DOMAIN-001](https://github.com/graspsoftwarepw/tadaify-app/issues/30) | 2026-04-25 |
| `app-settings.html` | **Authenticated creator settings** — Account / Billing / Security / GDPR & data / API keys (Pro) / Team (Business) / Danger zone (1-click cancel per AP-010, page-stays-live per AP-029, delete account per F-COMPLIANCE-001) | [#33 Account](https://github.com/graspsoftwarepw/tadaify-app/issues/33) · [#34 Billing](https://github.com/graspsoftwarepw/tadaify-app/issues/34) · [#35 Security](https://github.com/graspsoftwarepw/tadaify-app/issues/35) · [#36 GDPR](https://github.com/graspsoftwarepw/tadaify-app/issues/36) · [#37 API keys](https://github.com/graspsoftwarepw/tadaify-app/issues/37) · [#38 Team](https://github.com/graspsoftwarepw/tadaify-app/issues/38) · [#39 Danger zone](https://github.com/graspsoftwarepw/tadaify-app/issues/39) | 2026-04-25 |
| `admin-panel.html` | **Founder admin panel — `/admin`** — 8 sections (Overview / Users / Registration & waitlist / Maintenance / Moderation / Legal versioning / Health / Audit log). Distinct admin sidebar, role chip (Super-admin / Admin / Read-only), demo toolbar switches role for testing, all interactive controls do something. Integrates [#55 F-WAITLIST-001](https://github.com/graspsoftwarepw/tadaify-app/issues/55), [#5 F-LEGAL-002](https://github.com/graspsoftwarepw/tadaify-app/issues/5), [#6 F-LEGAL-003](https://github.com/graspsoftwarepw/tadaify-app/issues/6) and orchestrator standard Maintenance Mode. | [#58 F-ADMIN-PANEL-001](https://github.com/graspsoftwarepw/tadaify-app/issues/58) | 2026-04-26 |
| `app-insights.html` | **Insights tab** — single-handle Phase A scope, KPI tiles, cross-tab analyzer, time series, sources, blocks table, power-feature cards for Saved views (Pro+) / A/B (Business) / Replay (Business) / Identity stitching (Business) / Parquet R2 (Business) — fully visible previews per `feedback_no_blur_premium_features` (2026-04-26), tier-aware time-window picker | [#45 F-APP-INSIGHTS-001](https://github.com/graspsoftwarepw/tadaify-app/issues/45) | 2026-04-26 |
| `app-block-editor.html` | **Block editor centered modal** — 960px centered modal (full-screen on mobile) over frozen dashboard with two-column layout (form left, live preview right), 12 block-type forms, schedule visibility (Creator+) and A/B testing (Business) fully visible + interactive on every tier per `feedback_no_blur_premium_features` (2026-04-26) — gates at Save via the shared `TierGate` modal, AI suggest sub-modal, block-level analytics drill-down to Insights, type-to-confirm delete, duplicate, save/discard sticky footer. **A/B test redesigned 2026-04-26 (PR #54 extension):** Variant A \| B tabs in the Content section header split EVERY field of any block type into independent variants (label, url, icon, html, FAQ Q/A, social handles + per-platform icon styles, …); dual stacked preview + live diff summary + Copy A→B / Reset B→A. Plus an `A/B test available` / `active` identity chip in every Content section-head so the feature reads as named capability, not a footnote. **Social icons row redesigned 2026-04-26 (PR #54 extension):** empty default + `+ Add social` CTA → 30-platform picker → cards with drag-reorder + per-platform icon-style picker (6 base styles + 3 legacy alternates = 183 total synthesized variants). Drawer pattern rejected 2026-04-26 — see `feedback_no_right_side_drawers`. | [#52 F-APP-BLOCK-EDITOR-001](https://github.com/graspsoftwarepw/tadaify-app/issues/52) | 2026-04-26 |
| `app-block-picker.html` | **Block picker modal** — 720px modal with 3-column gallery of 12 block types, search, 7 category tabs (All / Links / Media / Forms / Shop / Layout / AI ✨), "Most clicked" badges, AI-suggest hero CTA → 5 ready-to-use block sets sub-modal, Pro+ tier badges with locked-state for lower tiers | [#53 F-APP-BLOCK-PICKER-001](https://github.com/graspsoftwarepw/tadaify-app/issues/53) | 2026-04-26 |
| `app-ai-suggest-modal.html` | **AI Suggest sub-modal** — 560px centered modal (full-screen on mobile) that opens from any ✨ Suggest button on title / label / caption / short-text fields. Sister of FIX-SUGGEST-RESTORE-001 (PR #70 round-2 polish that landed the trigger on every relevant field). Context strip (block-type summary + URL/alt-text), optional refinement textarea (visible empty per simple-UI rule, no Advanced toggle), 5 suggestion cards with style tags (Friendly / Direct / Playful / Professional / Curious), 6 documented states: Loaded / Loading (shimmer skeletons) / Error (friendly retry) / Empty (no input — Generate from context CTA) / Rate-limited (Free 30/day cap with tier upsell, typical creator never sees) / Selected confirmation. Standalone demo launcher with 3 trigger buttons (Block title / Caption / Button label) for cold review. Cost frame: Claude Haiku ~$0.0001/click, ~$50/year at 100k creators. | TBD — file F-AI-SUGGEST-MODAL-001 after acceptance | 2026-04-26 |
| `pricing.html` | Public pricing matrix — 4 tiers, compare table, Creator API spotlight, FAQ | [F-PRICING-LANDING-001 — TBD] | 2026-04-25 |
| `creator-public.html` | Public creator page — what visitors see at tadaify.com/handle | implicit (rendered via F-FULLFLOW-001 publish path) | 2026-04-24 |
| `product-public.html` | Public per-product page — tadaify.com/handle/p/slug | TBD (depends on F-PAGE-SHOP-001 #18) | 2026-04-24 |
| `app-page-blog.html` | **Blog page editor (creator-facing)** — `/app/pages/blog`. Page settings (title, slug, publish, RSS, page background, SEO expander), Layout config (cards/list/magazine, posts per page, sort, author byline), Posts table with filter tabs (All / Published / Drafts / Scheduled) + search + drag-reorder + kebab actions (Edit / Duplicate / Schedule / View public / Delete) + pagination. New/Edit post composer is a centered modal (NEVER a drawer per `feedback_no_right_side_drawers`) with cover image, AI-suggested title, slug, rich-text editor with formatting toolbar, tags multiselect, premium author dropdown (Business/Team — fully visible per `feedback_no_blur_premium_features`, gates at Save via shared `TierGate.checkAndProceed`), schedule datetime (Pro gate beyond 7 days), Save as draft / Schedule / Publish footer. Empty state with CTA + AI starter templates. Demo toolbar switches state (filled/empty) + tier (Free/Creator/Pro/Business). | [#19 F-PAGE-BLOG-001](https://github.com/graspsoftwarepw/tadaify-app/issues/19) | 2026-04-26 |
| `creator-blog-public.html` | **Public Blog render (visitor-facing)** — `tadaify.com/<handle>/blog`. Three sub-views in one file via in-page hash routing: list view (paginated 6-card grid + tag filter that actually filters), single post (cover + author/date/read-time + body + share + related posts + comments provider switcher Disqus/Hyvor/Off), tag-filter view. Inherits creator's theme (Indigo Serif, Crimson Pro display + Inter sans). Mobile-responsive: cards collapse to single column; pagination becomes "Load more". Footer mirrors `creator-public.html` social block. | [#19 F-PAGE-BLOG-001](https://github.com/graspsoftwarepw/tadaify-app/issues/19) | 2026-04-26 |
| `try.html` | Guest-mode editor — pre-signup flow per DEC-SYN-PAT-067 | TBD | 2026-04-24 |

## Reference / exploration

| File | Purpose |
|------|---------|
| `app-dashboard-variants.html` | 10-layout exploration — V1 Classic Sidebar selected (preserved for documentation) |
| `index.html` | Hub linking to all mockups (review tool, not user-facing) |

## Shared assets

- `shared/tokens.css` — Indigo Serif palette + typography + spacing tokens
- `shared/partials.js` — nav + footer + **app-sidebar** partials. Mark a host element with `<div data-partial="app-sidebar" data-active="..." data-tier="..." data-handle="..." data-username="..."></div>` and the canonical Pages-parent sidebar is injected (CSS shipped inline). `data-active` accepts `pages|design|domain|insights|shop|settings|help`. Public marketing nav + footer use the same `data-partial="nav"` / `"footer"` markers as before.
- `shared/tokens.js` — Motion v10 logo SVG injection + theme bootstrap

## Sidebar consistency audit (2026-04-26)

Scope: every dashboard-style mockup must render the canonical sidebar — Pages parent (Home + disabled Add page per DEC-MULTIPAGE-01) → Design / Domain / Insights / Shop / Settings / Help & docs.

| Mockup | Active tab | Approach | Notes |
|--------|-----------|----------|-------|
| `app-dashboard.html` | `pages` (default) | **Inline** (preserved) | Owns the Pages-accordion + Design-accordion + tab-switching state machine; cannot be safely externalised. Cross-link inconsistencies fixed in this PR: Domain link no longer says "soon" (app-domain.html exists), Insights link points to `app-insights.html` (was an internal placeholder tab). |
| `app-domain.html`    | `domain`   | **Shared partial** | Migrated. |
| `app-insights.html`  | `insights` | **Shared partial** | Migrated. The partial keeps `id="side-tier"` on the `.uhandle` div so the existing tier-switcher JS keeps working. |
| `app-settings.html`  | `settings` | **Shared partial** | Migrated. |

### Cross-link inventory (post-migration)

| From → To | Status |
|-----------|--------|
| any sidebar → Home (`./app-dashboard.html?tab=page`) | ✅ |
| any sidebar → Design (`./app-dashboard.html?tab=design`) | ✅ |
| any sidebar → Domain (`./app-domain.html`) | ✅ |
| any sidebar → Insights (`./app-insights.html`) | ✅ |
| any sidebar → Shop (`./app-shop.html`) | ⏳ TODO — file doesn't exist; partial currently shows alert placeholder. Tracked as future work. |
| any sidebar → Settings (`./app-settings.html`) | ✅ |
| any sidebar → Help & docs (`./app-help.html`) | ⏳ TODO — file doesn't exist; partial shows alert placeholder. Tracked as future work. |
| `app-dashboard.html` block click → `app-block-editor.html` | ✅ (mockup demo flow) |
| `app-dashboard.html` "+ Add block" → `app-block-picker.html` | ✅ (mockup demo flow) |
| `app-block-picker.html` card click → `app-block-editor.html?type=<id>` | ✅ |
| `app-block-editor.html` analytics tile → `app-insights.html` | ✅ |
| `app-block-editor.html` "Add block" → `app-block-picker.html` | ✅ |
| `app-settings.html` Billing tab → "Custom domain add-ons" → `app-domain.html` | ✅ (existing) |

## Brand lock (every mockup MUST honour)

- Wordmark `tada!ify` (3-span: `ta` indigo / `da!` warm / `ify` foreground) — NO hyphen separator (DEC-WORDMARK-01)
- Tagline DEC-019: "Turn your bio link into your best first impression."
- Palette: Indigo Serif — `#6366F1` primary, `#F59E0B` warm, `#0B0F1E` dark canvas, `#F8F9FC` bg
- Fonts: Crimson Pro (display) + Inter (body)
- Motion v10 logo via `<span class="logo-mark" data-logo></span>`
- Light/dark mode toggle in topbar (consistent across all dashboard surfaces)
- Trust trio chip strip on auth pages: 🔒 Price locked for life · 💸 30-day money-back · 🛡 GDPR-compliant

## Locked DECs that gate implementation

| DEC | Decision | Where applied |
|-----|----------|---------------|
| DEC-WORDMARK-01 | `tada!ify` no hyphen | Every mockup |
| DEC-019 | Tagline locked | Hero + footer copy |
| DEC-PRICELOCK-01 | Price locked for life on active subs | pricing / onboarding-tier / dashboard / register / login |
| DEC-PRICELOCK-02 | Universal $2/mo custom-domain add-on | pricing / onboarding-tier / app-domain |
| DEC-MULTIPAGE-01 (B) | Multi-page post-MVP Q+1 — Free 1 / Creator 5 / Pro 20 / Business unlimited | dashboard sidebar (Add page disabled) / pricing / onboarding-tier |
| DEC-LAYOUT-01 (A) | Grid layout in MVP | F-LAYOUT-001 #9 + dashboard preview |
| DEC-APIPAGES-01 (C) | Reject OAuth integrations | DECs page templates / onboarding-social handle-only |
| DEC-CREATOR-API-01 (A) | Pro tier REST API + MCP server | pricing Pro card spotlight |
| DEC-AI-QUOTA-LADDER-01 (B) | Free 5 / Creator 20 / Pro 100 / Business unlimited | pricing / dashboard AI matcher / onboarding-tier |
| DEC-AI-FEATURES-ROADMAP-01 (A) | Text-only AI (theme matcher / bio rewrite / copy suggest) | dashboard Theme panel + future story |
| DEC-ANIMATIONS-SPLIT-01 (A) | Animations sub-tab = Entrance + Ambient | dashboard Design > Animations |
| DEC-WALLPAPER-ANIM-01 (C) | Wallpaper stays static; motion in Animations only | dashboard Design > Background |
| DEC-PINNED-MSG-01 (A) | Toggleable fading line above profile card | dashboard Page tab |
| DEC-CUSTOM-DOMAIN-NAV-01 (A) | Domain in main sidebar (was 6th item; now in Pages section) | dashboard sidebar |
| DEC-CUSTOM-DOMAIN-PROVIDER-01 (A) | Cloudflare for SaaS (Custom Hostnames API), Business plan | F-CUSTOM-DOMAIN-001 + app-domain |
| DEC-CUSTOM-DOMAIN-VALIDATION-01 (B) | TXT+CNAME fallback | app-domain step 2 DNS instructions |
| DEC-OPT-BADGE | Opt-in support badge default OFF, every tier free, no tracking | dashboard Design > Footer |
| DEC-SOCIAL-01 (B) | Handle-input only, no OAuth at signup | onboarding-welcome + onboarding-social |
| DEC-TRIAL-01 | No trials; 30-day money-back instead | pricing / onboarding-tier / register / login |
| DEC-TADAIFY-BILLING-01 (A) | Stripe for tadaify SaaS subscriptions | pricing checkout + onboarding-tier paid path |

## Anti-patterns enforced (verified by grep across all mockups)

- AP-001: NO "Powered by tadaify" forced — opt-in support badge only
- AP-013: NO phone field at signup — explicit "We never ask" microcopy
- AP-017: NO trials — 30-day money-back framing instead
- AP-024: Progressive reveal in register flow (3-section wizard, no monolithic form)
- AP-028: Pro/Creator gating shown as inline pills, never blocking modals
- AP-030: Free default on tier picker
- AP-031: NO sticky upgrade banner anywhere
- AP-045: Progressive disclosure on Add Block modal (6 default categories, "More" reveals full set)
- **AP-NO-BLUR-PREMIUM (2026-04-26, locked)**: NO blur, no `display:none` swap, no overlay-card-covering-feature for tier-gated UIs. Premium features are ALWAYS fully visible and interactive; gating happens at save/apply/click time via the shared `TierGate.checkAndProceed` modal. Required signals: inline `.tdf-tier-badge` in section header + (where applicable) `.tier-hint` / `.lc-cta-footer` / `.tier-banner` underneath. See `~/.claude/projects/-Users-waserekmacstudio-git-claude-project-orchestrator/memory/feedback_no_blur_premium_features.md` for the full rule.
- Zero competitor name-drops (Linktree / Beacons / Stan / Carrd / Bio.link / Taplink — verified by grep)

## Changelog

### 2026-04-26 — AI Suggest sub-modal mockup added (sister of FIX-SUGGEST-RESTORE-001)

`app-ai-suggest-modal.html` NEW — designs what happens AFTER a creator clicks the ✨ Suggest button anywhere across the block editor. PR #70 round-2 polish (FIX-SUGGEST-RESTORE-001) landed the trigger on every title / label / caption / short-text field flagged with `ai: true` in `BLOCK_TYPES.*.form()`; until now the post-click behaviour was undefined. This mockup fills the gap so the implementation PR has a clear contract.

- **Centered modal, never right-drawer** per `feedback_no_right_side_drawers` (560px wide, full-screen <600px).
- **Six states** rendered as static frames in the same file: Loaded (5 cards) / Loading (shimmer skeletons) / Error (friendly retry, no error codes) / Empty (no input — Generate from context CTA) / Rate-limited (Free 30/day cap with tier upsell — typical creator never sees per `feedback_no_blur_premium_features` + DEC-119) / Selected confirmation.
- **Context strip** at top of body shows what tadaify is feeding the AI as prompt context (block type + URL or filename or current copy). Reads "Based on your <block-type> — <salient field>".
- **Refinement textarea** visible + empty by default per `feedback_tadaify_simple_ui_no_advanced_toggle` (DEC-114). No "Show advanced" toggle. Placeholder gives 3 example tones to teach without forcing.
- **Five suggestion cards** with index marker + copy + style tag (Friendly / Direct / Playful / Professional / Curious). Click any card to select (border + background tint + check). Use this disabled until selection.
- **Sticky foot.** Refresh suggestions (left, secondary, with spinner) / Cancel (right, ghost) / Use this (right, primary, disabled until pick).
- **Standalone demo launcher** at top of file with 3 trigger buttons (Block title / Caption / Button label) — opens the live modal with the matching context strip, swappable state via demo chip strip. Lets the file be reviewed cold without embedding in app-block-editor.html.
- **Cost frame** documented in the file header (DEC-097-era cost-value). Claude Haiku ≈ $0.0001/click; 100k creators × 5 clicks/year ≈ $50/year total — cheap, on brand with marketing pillar #2 (AI baked in).
- **Scope.** This PR ships the mockup only. Wiring the trigger from `app-block-editor.html` into this modal lands in a follow-up PR after the design is accepted. No changes to `app-block-editor.html`, `shared/partials.js`, or any other file beyond README + index + the new file.

### 2026-04-26 — Blog page template (F-PAGE-BLOG-001 #19)

`app-page-blog.html` (NEW) + `creator-blog-public.html` (NEW). First implementation of the page-template framework for `type='blog'` per the page-type registry. Pairs the creator-side editor with the visitor-side public render so refinement/implementation has a complete contract for both surfaces.

- **`app-page-blog.html`** — canonical app-shell (top app bar + injected sidebar via shared `data-partial="app-sidebar" data-active="pages"` + main pane). Breadcrumb `Home > Pages > Blog`. Three sections: (1) **Page settings** — title, URL slug with `tadaify.com/alexandra/` prefix, Publish toggle, RSS toggle, theme color picker (8 swatches per FIX-DIV-001), expandable SEO panel (meta title + description + OG image, all with ✨ Suggest); (2) **Layout** — card layout (cards/list/magazine), posts per page (1-50 per page-type schema), sort order (newest/oldest/manual-drag), show-author toggle; (3) **Posts** — filter tabs (All 23 / Published 18 / Drafts 3 / Scheduled 2), search input, post rows with drag handle + cover thumbnail + title + status chip + meta line + tag pills + Edit button + kebab menu (Edit / Duplicate / Schedule / View public / Delete), pagination chips. Empty state with friendly illustration + "Create your first post" CTA + ✨ starter-template link.
- **New/Edit post composer = centered modal**, NEVER a drawer (per `feedback_no_right_side_drawers`). 880px wide, max-height 92vh with internal scroll, mobile-responsive. Contains: cover image with crop hint + Replace, title with ✨ Suggest, auto-generated URL slug (editable until first publish), rich-text editor with formatting toolbar (Bold / Italic / Heading / Quote / Code / Link / Image / Bullet / Number + ✨ AI paragraph), tags input with chip + remove, premium **author dropdown** (Business/Team — fully visible + interactive per `feedback_no_blur_premium_features`, gates at Save via shared `TierGate.checkAndProceed`), schedule datetime picker (Pro gate beyond 7 days). Sticky footer: Cancel / Delete draft / Save as draft / Schedule / Publish.
- **No "Show advanced" toggle anywhere** per `feedback_tadaify_simple_ui_no_advanced_toggle`. Power fields (SEO panel, schedule, author) are inline + visible-by-default-empty, not hidden behind a mode switcher.
- **`creator-blog-public.html`** — visitor view at `tadaify.com/<handle>/blog`. Three sub-views in one file via hash routing (`#/`, `#/post/<slug>`, `#/tag/<slug>`) so reviewers can click through every state without leaving the file. List view: page hero (title + lede + post count + RSS + email-subscribe links), tag chip bar (All / training / recovery / mindset / nutrition / habits — clicking actually filters the grid; empty-tag state surfaces when 0 match), 2-column post-card grid (6 cards) with cover + title + 2-line excerpt + author + date + read-time + tag, pagination (desktop chips → mobile "Load more"). Single post: full-width cover, h1, meta row (author / date / read-time / share buttons), long-form body in Crimson Pro display font with h2 / blockquote / list, tag chips that route back to filter view, related posts (3 cards), comments section with provider switcher (Disqus / Hyvor / Off — content swaps live). Footer mirrors `creator-public.html` social block.
- **Theme inheritance**: creator-blog-public.html uses the same `tokens.css` palette (Indigo Serif) so the blog feels like a sub-page of the creator's main page. The same overrideable `Page background` field exposed in the editor would in production rebind a CSS var on the public render.
- **Comments provider** stays mockup-level (Disqus/Hyvor/Off) per the issue's "Scope (out): Comments system (separate story)" — the visitor view shows where it lives without committing to an integration.
- **Tier gates surfaced inline** — author dropdown carries a `🔒 Business` badge + `tier-hint` strip ("Switching author is part of Team on the Business plan…"); schedule field carries a `tier-hint` for far-future dates ("Scheduling beyond the next 7 days is a Pro perk…"). At Save the modal calls `TierGate.checkAndProceed` with the actual premium delta and offers Upgrade / Save without premium / Cancel — matches the pattern locked in PR #54 for `app-block-editor.html`.
- **Sidebar canonical** per `feedback_sidebar_pages_grouping`: shared `app-sidebar` partial renders Pages parent (accordion-expanded) with Home as the first sub-item; the editor JS post-injects a "Blog" sub-item above the disabled "+ Add page" so the active page is highlighted under Pages. (Production: when DEC-MULTIPAGE-01 ships multi-page, the sidebar renders all of the creator's pages as sub-items natively; the post-inject step goes away.)
- **Demo toolbar (`app-page-blog.html`)** — bottom-right pill swaps State (filled / empty) + Tier (Free / Creator / Pro / Business) live without reload, so reviewers can exercise the empty state, the tier-gate save flow, and the modal end-to-end.

Files: `mockups/tadaify-mvp/app-page-blog.html` (NEW), `mockups/tadaify-mvp/creator-blog-public.html` (NEW), `mockups/tadaify-mvp/index.html` (links added), `mockups/tadaify-mvp/README.md` (this entry + canonical-mockups table rows).

### 2026-04-26 — Social icons row redesign: addable cards + drag-reorder + per-platform icon variants (PR #54 extension)

`app-block-editor.html` overhauls the `Social icons row` block type per user feedback during PR #54 review. The fixed 6-platform input list is replaced with an addable, removable, draggable card list and a per-platform icon-style picker. Plus a small global change: an "A/B test" identity chip in the Content section header so the feature reads as a named capability across all 12 block types, not a footnote.

- **30 platforms supported.** `SOCIAL_PLATFORMS` registry (Instagram, TikTok, YouTube, X, Spotify, Apple Music, SoundCloud, Twitch, LinkedIn, Discord, Telegram, WhatsApp, Facebook, Pinterest, Threads, Mastodon, Bluesky, GitHub, Substack, Patreon, Buy Me a Coffee, Ko-fi, Gumroad, Snapchat, Reddit, Vimeo, Dribbble, Behance, PayPal, Etsy). Each carries `id`, `name`, brand `color`, default style. Adding a new platform = one line in the array + (optional) one extra entry in the existing `ICON_LIBRARY` brand bodies.
- **183 synthesized icon variants.** Per-platform style catalog (`SOCIAL_ICON_STYLES`): `brand` (canonical brand-coloured logo), `mono` (currentColor — adapts to light / dark), `mono-frame` (mono with a circle outline), `outline` (hollow brand outline), `filled-circle` (white glyph on brand-coloured circle), `filled-square` (white glyph on brand-coloured rounded square). Plus `SOCIAL_LEGACY_STYLES` for the 3 platforms with iconic alternates: X gets the `twitter-classic` blue bird, Instagram gets `classic-camera` (gradient camera glyph), YouTube gets `subscribe-red` (the iconic SUBSCRIBE button). 30 platforms × 6 base styles + 3 legacy = **183 total variants**, all rendered from `renderSocialVariant(variantId, size)` with no inline-SVG bloat (each style is a wrapper around the canonical brand body kept in `ICON_LIBRARY`).
- **`social-cards` field kind.** Replaces the old `social-list` (fixed 6 input rows). Default state: `state.handles = {}` (empty), `state.handlesOrder = []`. The form renders: a primary `+ Add social` button + a count chip ("N platforms added") + a card list. Click the button → platform-picker dropdown (search + 30 rows, brand-coloured glyph + name + Add CTA). Already-added platforms are filtered out with a footer note "N already added — they don't show in this list". Picking a platform creates a card.
- **Card anatomy.** Each card has 4 zones: (1) **drag handle** on the left (HTML5 drag-and-drop reorder, with `is-dragging` / `is-drag-over` visual feedback), (2) **icon-style picker** (a button that opens a 3-column grid of all variants for THAT platform — Instagram-only filtered to the 7 Instagram styles, etc.), (3) **handle input** with a fixed `@` prefix and per-platform aria-label, (4) **remove (X)** button. Cards live inside `.social-cards-list` and reorder via drag.
- **Per-platform icon-style picker.** New `.social-style-pop` popover keyed off `STYLE_PICKER_OPEN_FOR` (single-open at a time). Tile grid (3-col desktop, 2-col mobile) showing each variant's glyph at 28px above its style-name label. Selecting a tile writes `state.handles[platformId].iconStyle = '<variantId>'` (e.g. `instagram-mono-frame`). Outside-click closes the picker. Same UX skeleton as the existing `icon-picker` but scoped to the platform — no category tabs, no search.
- **Live preview.** `BLOCK_TYPES.social.preview()` rewritten to render visitor-view social icons in `state.handlesOrder` with the chosen icon style per platform. Wrapper shape (`circle` / `square` / `none`) drives the `.preview-social.shape-*` class. Filled-* and legacy variants self-provide their background, so `.shape-none` strips the wrapper for those styles to avoid double-stacking. Empty state: dashed-border "Add a social platform to see the preview" card.
- **Wrapper shape options extended** from 2 (Circle / Rounded square) to 3 — added `none` (Bare icons) so creators who pick `filled-circle` / `filled-square` icon styles don't get an extra background rectangle behind them.
- **A/B integration.** `state.handles` and `state.handlesOrder` now live in `CONTENT_FIELD_KEYS` so they route per-variant transparently. Switching to Variant B starts with empty cards (independent of A) — adding/removing/reordering platforms in B doesn't affect A. The diff card (`renderDiffCell`) accepts both legacy `{ig: '@x'}` (string handle) and the new `{ig: {handle, iconStyle}}` shape, and renders array-typed values (the order array) as `ig → tt → yt`.
- **Backward-compat migration.** `normaliseHandles(raw)` accepts both shapes — string handles get auto-upgraded to `{handle, iconStyle: <platformId>}` on first read. Pre-existing state from earlier mockup builds keeps working without manual rewrites.
- **A/B section identity chip (FIX-005, applies to all 12 block types).** New `.ab-section-chip` element sits in the Content section-head right of the H4. Two states: `data-state="available"` (neutral pill, "A/B test available") when Variant B has no diffs; `data-state="active"` (warm-tinted pill with a pulsing dot, "A/B test active · N field(s)") when B differs. Wired in `applyAbVisibility()` from `countAbDiffs()`. Goal: the user can scan the editor and instantly see "A/B testing is a feature on this block" without parsing the italic explainer line below the tabs. **NO toggle restored** — auto-detect from Variant B edits stays per DEC-093.
- **Smoke coverage.** 19/19 functional checks pass (jsdom-style harness): empty default, addSocialPlatform, updateSocialHandle (auto-prefixes `@`), pickSocialStyle, drag-reorder, removeSocialPlatform, Variant A / B independence, renderSocialVariant (brand / mono / mono-frame / outline / filled-circle / filled-square / legacy), countSocialVariants, ICON_LIBRARY untouched, empty-preview state, populated-preview shape class, diff cell with new shape, diff cell with platform array.
- **Files touched.** `app-block-editor.html` only. `creator-public.html` and the onboarding `onboarding-social.html` are NOT touched in this pass — they have their own social-stack rendering and will be reconciled in a follow-up if/when the icon-style picker ships to public pages.

### 2026-04-26 — A/B section UX overhaul: always-visible tabs + auto-detect (PR #54, FIX-001..004)

`app-block-editor.html` — second pass on the A/B implementation that landed
earlier today (commit `ccfcc0a`). User reviewed and locked DEC-093
(Option 1, auto-detect): no explicit toggle, tabs always visible,
A/B intent inferred at save from whether Variant B has differing edits.
Layout cleanup + cross-block-type consistency verification.

- **FIX-001 — Visible toggle layout.** `.section-head` gains `flex-wrap: wrap` and a `.head-spacer` filler. The `Visible` toggle stays right-aligned on wide modals and wraps to its own row on narrow widths instead of overflowing the panel.
- **FIX-002 — Variant tab labels.** Dropped the value-echo `.ab-tab-meta` suffix (`Variant A · LISTEN ON SPOTIFY`). Tabs read `[A] Variant A` and `[B] Variant B` only — no informational repeat of the field below. Tabs are now narrow enough that the section-head fits comfortably without wrapping in 99% of viewport widths.
- **FIX-003 — Always-visible tabs + auto-detect (DEC-093 = Option 1).** Removed the standalone `A/B test this block` section and its toggle. Variant A | B tabs now render at all times in the Content section header. `state.ab.enabled` is permanently `true`; the `toggleAb()` function is gone. Variant A is the primary editing surface for every tier. Variant B is fully visible and clickable for non-Business tiers but carries dimmed styling + a `🔒 Business` lock pill on the tab itself; clicking B reveals an inline `.ab-tier-callout` above the form fields explaining the gate without blurring or disabling anything (per `feedback_no_blur_premium_features`). A new `.ab-edu` line below the tabs delivers the standing pitch — "On Business, edit Variant B to test two versions… Traffic splits 50/50 and the winner promotes automatically." — visible at every tier, every block type. A/B intent auto-detects at save: `collectPremiumChanges()` adds the A/B feature only when `countAbDiffs() > 0`. The win-criteria copy ("auto-promote after 7 days or 1k clicks") moves to the `.ab-win-note` footnote that surfaces only when B has differing edits. Dual stacked preview + diff card also key off `abVariantsDiffer()` instead of the old toggle.
- **FIX-004 — 12 block-type consistency.** Manually walked the type switcher through all 12 BLOCK_TYPES (Link, Image, Embed, Heading, Divider, Social, Newsletter, Shop, Video, Accordion, Custom HTML, Countdown). Livestream removed 2026-04-26 per `feedback_no_livestream_block_in_tadaify_mvp.md` (DEC-099). Variant A | B tabs render identically positioned + sized + styled in every type. Variant B locked-state visual (dimmed + lock pill) is identical across types. The `.ab-edu` explainer is the same copy on every type (kept universal, not type-adapted — locks the brand voice). Helper bar, dual preview, diff card, copy A→B button render identically. State-routing via `getContentState()` / `writeContent()` already handles all 28 `CONTENT_FIELD_KEYS` transparently per block type, so per-type form differences route correctly into per-variant state.
- **State + lifecycle.** `loadType()` always re-seeds both variants from the freshly-defaulted state (so type-switch resets B to match A under the new type, identical to before). `saveBlock()` drops the soft-warn-on-identical-variants confirm — with auto-detect, identical = single-variant save, no friction. `Save without A/B` in the TierGate flow now collapses Variant B to match A (instead of the old "disable toggle" path).
- **Removed surface area.** Deleted standalone A/B `<section>` (`#ab-card`), the `#ab-switch` element, the `#ab-explainer` rows under the toggle, the `#ab-tier-hint` line, the `.ab-tab-meta` slots, the `updateVariantTabMeta()` function, the `toggleAb()` function, and their `window.toggleAb` export. Orphan CSS classes (`.ab-explainer*`, `.ab-pill-traffic`) kept in the stylesheet for reuse / minimal-diff.
- **New CSS primitives.** `.ab-tab.is-locked` + `.ab-tab-lock` (lock pill on Variant B tab), `.ab-edu` (italic explainer line under tabs), `.ab-tier-callout` (inline tier explainer when on Variant B + non-Business), `.ab-win-note` (footnote when B has differing edits). Tier callout uses `var(--brand-warm)` accents to align with the B variant's brand-warm pill.

### 2026-04-26 — A/B test = full Content split (PR #54 extension)

`app-block-editor.html` replaces the "Variant B label" half-feature with full
Content-section variant tabs. Every field in any block type's form (label,
url, icon, schedule, html, FAQ Q/A, social handles, autoplay, …) can now
differ between A and B — the A/B test now matches the product promise
"compare two block variants and ship the winner" (commit pending).

- **State model.** `state.ab = { enabled, activeTab, previewView, variants: { A: {...}, B: {...} } }`. Content keys (28 total per `CONTENT_FIELD_KEYS`) live at top level when A/B is off and inside `state.ab.variants[activeTab]` when A/B is on. Form rendering reads through `getContentState()`; field writes go through `writeContent()`. `BLOCK_TYPES.form()` and `.preview()` keep receiving a single content-state object — variant routing is transparent to the 12 block-type specs.
- **Variant tabs.** When A/B is on, the Content section header gains a balanced `Variant A | Variant B` tab strip (A = brand indigo pill, B = brand warm pill). Tab metadata shows a short summary of each variant's identity (label / cta / heading text — first non-empty). Switching tabs preserves state per variant; edits in A do NOT affect B.
- **Helper bar.** When the active tab is B, a dashed-warm helper bar surfaces `Copy A → B` and `Reset B to match A` actions. Reset prompts confirm if B has diverged from A.
- **Dual preview.** When A/B is on, the preview pane stacks two cards — `Variant A · 50% of visitors` + `Variant B · 50% of visitors` — both rendering live from their respective variant state. A `Both / A only / B only` picker above the preview lets the creator focus.
- **Diff summary.** A "What's different between A and B" card under the preview lists only the fields that actually differ (label, url, icon, …) — color-coded by variant. Empty values render as italic "(empty)". Object values (social handles) flatten to `ig:@x · tt:@y`. Updates live on every keystroke. When A and B are identical, the card shows "No differences yet — switch to Variant B and edit a field."
- **Toggle off.** When the user turns A/B off and B has diverged from A, a confirm prompt warns that Variant B will be discarded. On confirm, Variant A's values collapse back to the top-level state and the form continues editing as if A/B was never on.
- **Type-switch within an A/B session.** Switching block type while A/B is on re-seeds both variants from the new type's defaults (so B starts as a clone of A under the new type, not a stale clone of the previous type). The toggle stays on; the active tab resets to A.
- **Save flow.** `saveBlock()` adds: (1) soft warning when A/B is on but variants are identical (the test would be meaningless); (2) tier-gate when A/B is on but tier < Business — existing `TierGate.checkAndProceed` modal lists "A/B testing" with the count of differing fields in the meta line. `Save without` collapses A/B back to single state (keeps Variant A's values) and proceeds.
- **Tier visibility (per `feedback_no_blur_premium_features`).** The A/B section header still carries the inline `🔒 Business` tier badge. The toggle is interactive at every tier — Free/Creator/Pro users can fully explore the Variant A | B tabs, the Copy/Reset actions, and the dual preview. Only at Save time does the TierGate modal appear. Demo toolbar Free/Creator/Pro/Business switching exercises this end-to-end.
- **CSS.** New tokens-driven primitives under the existing tier-gated section block: `.ab-tabs`, `.ab-tab`, `.ab-tab-pill-a/-b`, `.ab-helper`, `.ab-explainer`, `.preview-pair`, `.ab-preview-picker`, `.ab-diff`. All colours map to `var(--brand-primary)` (A) and `var(--brand-warm)` (B). Mobile collapses the variant tab metadata + diff grid to single-column.
- **Coverage.** Functional smoke (jsdom): 30/30 checks pass — initial state, toggle on/off, variant seeding, tab switching, field isolation between variants, diff card rendering, type-switch preservation, copyAtoB, identical-variants save warning, Free-tier TierGate trigger, preview-view picker.

### 2026-04-26 — Icon picker redesigned (PR #54 extension)

`app-block-editor.html` ships a proper dropdown + search icon picker that replaces the throwaway 18-emoji grid (commit `b6bcda3`).

- **UX.** Closed state is a single trigger button showing the currently selected icon + name with a chevron. Click to open a 480px popover containing: search input (real-time filter on name + tags), 7 category tabs (Popular / Social / Music & Video / Shop & Money / Communication / Content / Generic), live count, 6-col grid (4-col on <540px). Outside-click + Esc close; Enter on the search input picks the first visible result.
- **Library.** ~126 inline SVG icons covering Lucide-style monochrome outline (94 icons inheriting `currentColor` for dark-mode safety) + Simple Icons brand logos (32 icons rendered in their official brand color: Spotify green, TikTok black, YouTube red, Stripe purple, Instagram pink, etc.). Real-impl mapping: `lucide-react` (ISC) + `simple-icons` (CC0). Mockup is dependency-free — every path inlined so the file loads over `file://`.
- **Field kind.** Added reusable `kind: 'icon-picker'` to the `BLOCK_TYPES` form spec. Multiple block types declare it and get the picker for free.
- **Block type coverage.** Picker now appears on: Link button (default `spotify`), Newsletter signup (`ctaIcon` default `send`), Product (`ctaIcon` default `shopping-cart`; renamed from "Shop product" 2026-04-26 per FIX-SHOP-001 — block now links to creator's external store, no native shop in MVP), Heading / text (optional leading `icon`), Countdown timer (label `icon` default `flame`), FAQ / accordion (optional `sectionIcon`). Image / Video / Embed / Divider / Custom HTML / Social icons row keep their existing visual treatment (Social row uses its own platform-handle picker — different concept, not conflated). Livestream block removed 2026-04-26 per `feedback_no_livestream_block_in_tadaify_mvp.md` (DEC-099).
- **Backward-compat.** State value `state.icon` (and friends) is now an icon-id string from `ICON_LIBRARY_BY_ID`. Legacy emoji values (e.g. `▶`) still render via a fallback path in `renderIconForPreview()` so any pre-existing state survives. Default for the link block changed from `▶` to `spotify`.
- **A11y + dark mode.** Trigger has `aria-haspopup="listbox"` + `aria-expanded`. Tiles have `role="option"` + `aria-selected`. Search has Escape-to-clear / Enter-to-select-first. `prefers-reduced-motion` kills the popover animation. Brand glyphs render with their fixed brand color in both light + dark mode; Lucide icons inherit the surrounding text color.

### 2026-04-26 — Tier-gating UX refactor (no-blur rule, this PR)

**Background.** During PR #54 review the user flagged that the A/B test section of `app-block-editor.html` was rendered behind a blurred overlay carrying only an "Upgrade to Business" CTA — the user couldn't read what A/B testing was, couldn't toggle anything, couldn't make an informed decision. Locked rule `feedback_no_blur_premium_features` (2026-04-26): premium UIs must be FULLY visible and interactive on every tier; gating happens at save/apply/click time, not at display time.

**Scope of refactor (PR #54 extension).**

| Mockup | Violation | Fix |
|--------|-----------|-----|
| `app-block-editor.html` | Schedule (Creator+) and A/B (Business) sections wrapped in `.locked-card` with absolute-positioned `.locked-overlay` (blur + centered upgrade card hiding form fields) | Removed `.locked-card`/`.locked-overlay` CSS + markup. Sections now `.section.tier-gated`, fully interactive on every tier. Inline `.tdf-tier-badge` in section header signals required tier. New `tier-hint` line below the inputs explains "we'll prompt to upgrade when you save". `saveBlock()` runs `TierGate.checkAndProceed` — modal lists premium features the user enabled and offers Upgrade / Save without / Cancel. |
| `app-insights.html` | 6 power-feature cards (Saved views, A/B, Digest, Replay, Identity, Parquet) used `.lc-preview` with `filter: blur(2.5px); opacity: 0.5; pointer-events: none` and a centered `.lc-cta-overlay` covering the preview | Removed the blur + opacity + pointer-events overrides on `.lc-preview`. Replaced `.lc-cta-overlay` (absolute-positioned) with `.lc-cta-footer` — a non-blurring, in-flow informational footer below the preview. Existing `.chip pro` / `.chip business` heads kept as the inline tier indicator. The faux preview content is now real-looking and fully readable on every tier. |
| `app-settings.html` | API keys tab (`#api-locked` vs `#api-unlocked`, swapped via `display:none`) and Team tab (`#team-locked` vs `#team-unlocked`) hid the entire feature UI from lower tiers | Removed the locked/unlocked div swap. Feature UIs render on every tier. New `.tier-banner` element appears above each section only when the current tier is below the requirement, explaining "click Generate / Invite — we'll prompt to upgrade". The action buttons now route through the new `gateAction()` helper which calls `TierGate.checkAndProceed`. |
| `app-block-picker.html` | Locked block types use `opacity: 0.85` on `.type-card.is-locked` + click → confirm() → upgrade flow | **No change** — current pattern keeps cards fully readable + interactive (clicking a locked card already routes to upgrade). Marginal opacity dim is informational, not obscuring. |
| `app-domain.html`, `app-dashboard.html`, `landing.html`, `pricing.html`, onboarding-* | No tier-gating violations | n/a |

**New shared components in `shared/partials.js`.**

- `TadaifyPartials.renderTierBadge(tier, opts)` — returns the canonical `<span class="tdf-tier-badge tier-...">` markup (inline pill, color-coded per tier: Creator = teal, Pro = brand-primary indigo, Business = warm amber). Accepts `{ included: boolean, tooltip: string }`.
- `TierGate.checkAndProceed({ currentTier, features, onProceed, onSaveWithout, onUpgrade, onCancel })` — save-time validation. If the user's tier covers every required tier, runs `onProceed` immediately. Otherwise opens the shared upgrade modal listing premium features + branches: Upgrade / Save without premium / Cancel.
- `TierGate.open` / `TierGate.close` — direct modal control for callers that don't want the auto-skip semantics.
- CSS for `.tdf-tier-badge` and `.tdf-gate-*` is shipped inline by partials.js; no extra CSS file required.

### 2026-04-25 — Settings mockup added (F-180..199 scope)
- `app-settings.html` NEW — full settings panel: Account, Billing, Security, GDPR & data, API keys (Pro-gated), Team (Business-gated), Danger zone
- AP-010 one-click cancel modal wired (no survey cascade)
- AP-029 "page stays live" messaging in cancel + delete account flows
- F-COMPLIANCE-001 GDPR data export + delete account + cookie preferences
- DEC-CREATOR-API-01 API keys section with MCP server install snippet + Custom GPT template
- DEC-PRICELOCK-01 "Locked for life" amber pill on Billing plan card
- DEC-PRICELOCK-02 custom domain add-on line items in Billing
- Demo toolbar (bottom-right, aria-hidden) for tier switching (Free/Creator/Pro/Business) to preview gated states
- Settings link wired in `app-dashboard.html` and `app-domain.html` sidebars (were placeholders)
- Cross-mockup link audit completed — 17 files scanned, 0 broken refs, 3 orphan candidates documented

### 2026-04-25 — Single-sidebar IA adopted (this PR)
- `app-dashboard.html` replaced with v2 content (single-sidebar + breadcrumb stepper accordion). Old dual-rail v1 superseded.
- `app-domain.html` added — full custom-domain management mockup
- All cross-mockup links wired (Domain item in dashboard sidebar → app-domain.html)
- This README created

### 2026-04-25 — Second wave DEC application
- Plagiarism renames: Header → Profile, Wallpaper → Background (Design sub-nav)
- Animations 2-section (Entrance + Ambient + Accessibility) per DEC-ANIMATIONS-SPLIT-01
- Pinned message primitive on Page tab per DEC-PINNED-MSG-01
- AI theme matcher in Theme panel (predefined catalogue + token meter, Free 5 quota)
- Universal $2 custom-domain add-on (pricing, onboarding-tier)
- Add Block modal extensible (43 integrations, 9 categories, search + URL detect)
- Light/dark mode toggle in dashboard topbar (replaces avatar)
- Footer panel: opt-in support badge default OFF (DEC-OPT-BADGE refines AP-001)

### 2026-04-26 — Block editor + picker + sidebar partial canon
- `shared/partials.js` extended with `data-partial="app-sidebar"` injector. Renders the canonical Pages-parent sidebar with `data-active` / `data-tier` / `data-handle` / `data-username` attributes. CSS shipped inline so a single `<script src="./shared/partials.js"></script>` is enough; works over `file://`.
- `app-settings.html`, `app-domain.html`, `app-insights.html` migrated to use the partial — 73 lines of duplicated sidebar markup removed per file.
- `app-dashboard.html` keeps in-page sidebar (owns the Pages/Design accordion + tab-switching state) but two cross-link inconsistencies fixed: Domain link no longer says "soon" (app-domain.html exists), Insights links to `./app-insights.html` (was an internal placeholder tab).
- `app-block-editor.html` NEW — initially shipped as a 480px right-side drawer; refactored on 2026-04-26 (same PR) to a 960px centered modal with two-column layout (form left + sticky live preview right) per `feedback_no_right_side_drawers` (user-locked rule: edit views are always centered modals, never drawers). Mobile (<720px) renders full-screen with a chevron-collapsible preview. 12 block-type forms + future-ready scaffolding (schedule visibility for Creator+, A/B for Business as locked-state UI; AI suggest sub-modal; analytics drill-down to Insights). Issue #52.
- `app-block-picker.html` NEW — modal gallery with search, category tabs, "Most clicked" badges, AI suggest hero CTA → 5 example block sets sub-modal. Issue #53.
- Sidebar consistency audit added to README (see "Sidebar consistency audit" section above).

### 2026-04-25 — Multi-page foundations
- F-MULTIPAGE-001 issue created (#8) — post-MVP Q+1
- F-ARCHITECTURE-001 spec entry — global vs per-page settings boundary
- 11 page-type stories in Backlog (#13-#23) for predefined templates

### 2026-04-25 — Auth screens refresh
- `register.html` refreshed (light/dark toggle, trust trio chip, "log in" link, AP-013 "no phone" microcopy)
- `login.html` NEW (sister page, magic-link toggle, welcome-back hint)

### 2026-04-25 — Pricing landing refresh (F-PRICING-LANDING-001)
- All locked DECs reflected: Pages tier ladder, AI quotas 5/20/100/∞, Creator API spotlight, $2 add-on banner
- Compare matrix added (7 categories × 4 tiers)

### 2026-04-24 — DEC-MULTIPAGE-01 application
- Pages tier ladder added to pricing.html, onboarding-tier.html
- Dashboard sidebar: Pages accordion (parent) with Home as first page + disabled Add page sub-item. Mirror this structure in every dashboard-side mockup; first page is always labeled **Home**, never "Homepage" (rejected 2026-04-25).
- Issues #1, #3 forward-compat updates

### 2026-04-24 — Initial dashboard mockup wave
- 10-variant exploration (`app-dashboard-variants.html`)
- V1 Classic Sidebar selected
- Polished V1 with profile card / Design sub-nav / 3-way device toggle
- Subsequent iterations added Animations sub-tab, AI matcher, theme toggle, support badge, plagiarism mitigations

### 2026-04-24 — Onboarding flow + auth + landing
- 7-screen onboarding flow created (welcome → social → template → blocks → tier → complete)
- Landing page, register page, pricing page initial versions

## Notes for implementing agents

- Read this README before starting any F-XXX-NNN implementation. The DEC trail and brand-lock are non-negotiable.
- If your implementation deviates from the mockup, add a comment to the corresponding issue (per `change-tracker` skill) BEFORE merging the PR.
- Cross-mockup navigation references: `./app-dashboard.html`, `./app-domain.html`, `./app-settings.html`, `./creator-public.html`, etc. — keep relative paths working when implementing routes.
- All mockups use `./shared/` assets — implementation should mirror this design-token approach (tokens.css → CSS variables in production).
