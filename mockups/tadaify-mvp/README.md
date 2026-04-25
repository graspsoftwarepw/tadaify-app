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
| `pricing.html` | Public pricing matrix — 4 tiers, compare table, Creator API spotlight, FAQ | [F-PRICING-LANDING-001 — TBD] | 2026-04-25 |
| `creator-public.html` | Public creator page — what visitors see at tadaify.com/handle | implicit (rendered via F-FULLFLOW-001 publish path) | 2026-04-24 |
| `product-public.html` | Public per-product page — tadaify.com/handle/p/slug | TBD (depends on F-PAGE-SHOP-001 #18) | 2026-04-24 |
| `try.html` | Guest-mode editor — pre-signup flow per DEC-SYN-PAT-067 | TBD | 2026-04-24 |

## Reference / exploration

| File | Purpose |
|------|---------|
| `app-dashboard-variants.html` | 10-layout exploration — V1 Classic Sidebar selected (preserved for documentation) |
| `index.html` | Hub linking to all mockups (review tool, not user-facing) |

## Shared assets

- `shared/tokens.css` — Indigo Serif palette + typography + spacing tokens
- `shared/partials.js` — nav + footer partials, light/dark toggle wiring
- `shared/tokens.js` — Motion v10 logo SVG injection + theme bootstrap

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
- Zero competitor name-drops (Linktree / Beacons / Stan / Carrd / Bio.link / Taplink — verified by grep)

## Changelog

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
- Dashboard sidebar gained Pages placeholder (post-merge: replaced with Homepage + disabled Add page)
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
