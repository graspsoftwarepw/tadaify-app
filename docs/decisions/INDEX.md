# Decision Index — tadaify

Auto-generated from `docs/decisions/*.md` frontmatter. Sorted by numeric id.

Each file contains: frontmatter (id, aliases, status, date, supersedes, superseded_by, topics)
+ body sections (Context, Decision, Alternatives, Consequences, Provenance).

Full rationale lives in the per-file record. This table is the navigation layer.

---

| ID (numeric) | Aliases | Status | Title | Topics | File |
|---|---|---|---|---|---|
| 0001 | DEC-DOMAIN-01 | accepted | Single-domain architecture: everything under `tadaify.com/` | architecture, url, domain, routing | [0001-single-domain-architecture.md](0001-single-domain-architecture.md) |
| 0002 | DEC-DNS-01 | accepted | Cloudflare authoritative DNS for `tadaify.com` | dns, cloudflare, infrastructure | [0002-cloudflare-authoritative-dns.md](0002-cloudflare-authoritative-dns.md) |
| 0003 | DEC-FRAMEWORK-01 | accepted | Full-stack framework: Remix (React Router 7) on Cloudflare Workers runtime | framework, ssr, cloudflare, remix, react-router | [0003-remix-cloudflare-workers-framework.md](0003-remix-cloudflare-workers-framework.md) |
| 0004 | DEC-035 | accepted | Cloudflare-first architecture | architecture, cloudflare, infrastructure, aws | [0004-cloudflare-first-architecture.md](0004-cloudflare-first-architecture.md) |
| 0005 | DEC-036 | accepted | USD currency — all plan SKUs in USD | pricing, currency, localization | [0005-usd-currency.md](0005-usd-currency.md) |
| 0006 | DEC-037 | **superseded** by 0008 | 4-tier flat structure: Free $0 / Creator $5/mo / Pro $15/mo / Business $49/mo | pricing, tiers | [0006-four-tier-structure.md](0006-four-tier-structure.md) |
| 0007 | DEC-043 | accepted | "Everything free" gating model | pricing, feature-gating, free-tier | [0007-everything-free-gating.md](0007-everything-free-gating.md) |
| 0008 | DEC-083 | **superseded** by 0009 | Pricing revised: Creator $8/mo, Pro $19/mo (supersedes DEC-037) | pricing, tiers | [0008-pricing-interim-8-19.md](0008-pricing-interim-8-19.md) |
| 0009 | DEC-279 | accepted | Final pricing: Creator $7.99/mo, Pro $19.99/mo, extra-domain $1.99/mo | pricing, tiers, domain-addon | [0009-pricing-final-7.99-19.99.md](0009-pricing-final-7.99-19.99.md) |
| 0010 | DEC-TRIAL-01 | accepted | No Pro trial mechanism — replaced by transparent preview + 30-day money-back | onboarding, trials, ux, anti-patterns | [0010-no-pro-trial-mechanism.md](0010-no-pro-trial-mechanism.md) |
| 0011 | DEC-SOCIAL-01 | accepted | Social-import on onboarding: handle-based link generation (not OAuth) | onboarding, social, oauth, anti-patterns | [0011-social-import-handle-based.md](0011-social-import-handle-based.md) |
| 0012 | DEC-MKT-B-v2 | accepted | Preview generator is admin-only tool — not a public endpoint | marketing, preview-generator, admin | [0012-preview-generator-admin-only.md](0012-preview-generator-admin-only.md) |
| 0013 | DEC-MKT-C | accepted | EN-only marketing at launch; PL deferred to Y2+ | marketing, localization, language | [0013-en-only-marketing-at-launch.md](0013-en-only-marketing-at-launch.md) |
| 0014 | DEC-Q5-A | accepted | Full Business tier at MVP — all 5 F-BIZ units ship MVP | business-tier, mvp-scope | [0014-full-business-tier-at-mvp.md](0014-full-business-tier-at-mvp.md) |
| 0015 | DEC-Q5-C | accepted | Linktree-only preview parser at MVP; Beacons/Stan/Bio.link at M+0.5 | preview-generator, mvp-scope, parsers | [0015-linktree-only-preview-parser-mvp.md](0015-linktree-only-preview-parser-mvp.md) |
| 0016 | DEC-033 | accepted | Self-referral block (F-125) is opt-in growth mechanism, NOT a "Powered by tadaify" watermark | anti-patterns, branding, growth | [0016-self-referral-block-not-watermark.md](0016-self-referral-block-not-watermark.md) |
| 0017 | DEC-038 | accepted | Custom domain included in Creator tier (1 domain per DEC-038) | custom-domain, creator-tier, pricing | [0017-custom-domain-included-creator.md](0017-custom-domain-included-creator.md) |
| 0018 | DEC-INFRA-MINIMAL-01 | accepted | Minimal AWS footprint — S3 cold analytics + Athena + Glue only | infrastructure, aws, terraform | [0018-minimal-aws-footprint.md](0018-minimal-aws-footprint.md) |
| 0019 | DEC-SYN-01 | accepted | Progressive signup — no phone field at signup (AP-021 GREEN) | onboarding, signup, anti-patterns | [0019-progressive-signup-no-phone.md](0019-progressive-signup-no-phone.md) |
| 0020 | DEC-SYN-04 | accepted | Hero layouts: 5 defaults, hero-first rendering (F-151) | customization, hero, theming | [0020-hero-layouts-five-defaults.md](0020-hero-layouts-five-defaults.md) |
| 0021 | DEC-SYN-05 | accepted | Creator Safeguard: 48h warning + human appeal + prepaid refund contract | moderation, trust, anti-patterns | [0021-creator-safeguard-48h-warning.md](0021-creator-safeguard-48h-warning.md) |
| 0022 | DEC-SYN-06 | **superseded** by 0027 | 3-year price lock at signup rate + fee lock (superseded by DEC-PRICELOCK-01) | pricing, price-lock, trust | [0022-price-lock-3yr-superseded.md](0022-price-lock-3yr-superseded.md) |
| 0023 | DEC-ANTI-001, DEC-ANTI-002, DEC-ANTI-003, DEC-ANTI-004, DEC-ANTI-005, DEC-ANTI-006, DEC-ANTI-007, DEC-ANTI-008, DEC-ANTI-009, DEC-ANTI-010, DEC-ANTI-011, DEC-ANTI-012, DEC-ANTI-013, DEC-ANTI-014, DEC-ANTI-015 | accepted | Anti-pattern commitments (DEC-ANTI-001 through DEC-ANTI-015) | anti-patterns, trust, branding, pricing, ux | [0023-anti-patterns-platform-trust.md](0023-anti-patterns-platform-trust.md) |
| 0024 | DEC-MULTIPAGE-01 | accepted | Multi-page accounts confirmed for post-MVP (Q+1, Creator-tier unlock) | multi-page, mvp-scope, pages | [0024-multi-page-post-mvp.md](0024-multi-page-post-mvp.md) |
| 0025 | DEC-LAYOUT-01 | accepted | Grid layout ships in MVP (answer A) — `pages.layout_mode='stack'\|'grid'` | editor, grid, layout, mvp-scope | [0025-grid-layout-ships-mvp.md](0025-grid-layout-ships-mvp.md) |
| 0026 | DEC-APIPAGES-01 | accepted | Platform OAuth import permanently rejected — Creator API is the better investment | api, oauth, integrations, mvp-scope | [0026-platform-oauth-import-rejected.md](0026-platform-oauth-import-rejected.md) |
| 0027 | DEC-PRICELOCK-01 | accepted | Price-lock-for-life — paid subscription price locked forever for uninterrupted subscriptions | pricing, price-lock, trust | [0027-price-lock-for-life.md](0027-price-lock-for-life.md) |
| 0028 | DEC-PRICELOCK-02 | accepted | Universal domain add-on across all tiers: structure locked (DEC-PRICELOCK-02) | pricing, custom-domain, domain-addon | [0028-domain-addon-pricing.md](0028-domain-addon-pricing.md) |
| 0029 | DEC-CREATOR-API-01 | accepted | Creator API for Pro tier: OpenAPI 3.0 + `@tadaify/mcp` npm MCP server | api, pro-tier, mcp, openapi | [0029-creator-api-pro-tier.md](0029-creator-api-pro-tier.md) |
| 0030 | DEC-AI-QUOTA-LADDER-01 | accepted | AI quota: unified shared bucket — Free 5/mo / Creator 20/mo / Pro 100/mo / Business unlimited | ai, quota, pricing | [0030-ai-quota-unified-ladder.md](0030-ai-quota-unified-ladder.md) |
| 0031 | DEC-AI-FEATURES-ROADMAP-01 | accepted | Text-only AI scope at MVP: theme matcher + bio rewrite + copy suggest (answer A) | ai, mvp-scope, features | [0031-ai-text-only-scope.md](0031-ai-text-only-scope.md) |
| 0032 | DEC-ANIMATIONS-SPLIT-01 | accepted | Animations sub-tab: 2 sections — Entrance + Ambient (answer A) | animations, customization, ux | [0032-animations-two-sections.md](0032-animations-two-sections.md) |
| 0033 | DEC-WALLPAPER-ANIM-01 | accepted | Background stays static — all motion lives in Animations > Ambient (answer C) | animations, background, customization | [0033-background-stays-static.md](0033-background-stays-static.md) |
| 0034 | DEC-PINNED-MSG-01 | accepted | Pinned message: adopt primitive — toggleable fading line above profile card (answer A) | features, profile, ux | [0034-pinned-message-primitive.md](0034-pinned-message-primitive.md) |
| 0035 | DEC-CUSTOM-DOMAIN-NAV-01 | accepted | Custom Domain as 6th sidebar item — globe SVG + "Domain" label + "soon" pill | ux, navigation, custom-domain | [0035-custom-domain-nav-6th-sidebar.md](0035-custom-domain-nav-6th-sidebar.md) |
| 0036 | DEC-073 | accepted | Billing management: hybrid — in-app plan summary + Stripe Portal for invoice/card mgmt | billing, stripe, ux | [0036-billing-hybrid-stripe-portal.md](0036-billing-hybrid-stripe-portal.md) |
| 0037 | DEC-074 | accepted | Handle redirect on rename: redirect to new handle URL for 30-day grace period | url-routing, handles, ux | [0037-handle-redirect-30day-grace.md](0037-handle-redirect-30day-grace.md) |
| 0038 | DEC-075 | accepted | Cookieless unique visitor methodology: daily salt (Plausible-style) | analytics, privacy, insights | [0038-cookieless-unique-visitor-daily-salt.md](0038-cookieless-unique-visitor-daily-salt.md) |
| 0039 | DEC-076 | accepted | Dashboard refresh cadence: honest gating Cat A/B/C — no fake margin (Option 9) | analytics, insights, gating, tier-pricing | [0039-insights-gating-honest-cat-abc.md](0039-insights-gating-honest-cat-abc.md) |
| 0040 | DEC-077 | accepted | Click event coverage: every interaction at all tiers (Option 1) | analytics, click-tracking, insights | [0040-click-event-coverage-all-tiers.md](0040-click-event-coverage-all-tiers.md) |
| 0041 | DEC-078 | accepted | Retention windows: D1 rollups forever + UI gates query window by tier (Option 1) | analytics, data-retention, insights | [0041-retention-windows-d1-rollups.md](0041-retention-windows-d1-rollups.md) |
| 0042 | DEC-079 | accepted | Unique visitors: show per-day unique with tooltip; aggregates show pageviews/sessions | analytics, insights, ux, privacy | [0042-unique-visitors-per-day-tooltip.md](0042-unique-visitors-per-day-tooltip.md) |
| 0043 | DEC-080 | accepted | API access tier: Pro 100 req/h, Business 1000 req/h + Parquet R2 download | api, analytics, insights, tier-pricing | [0043-api-access-pro-100-business-1000.md](0043-api-access-pro-100-business-1000.md) |
| 0044 | DEC-081 | accepted | Research SPIKE acceptance: insights feasibility accepted — dispatch mockup work (Option 1) | research, process | [0044-research-spike-accepted.md](0044-research-spike-accepted.md) |
| 0045 | DEC-082 | accepted | Polling architecture for Pro live-view — no Durable Objects push (Option 6) | analytics, architecture, durable-objects, polling | [0045-polling-architecture-no-do-for-pro.md](0045-polling-architecture-no-do-for-pro.md) |
| 0046 | DEC-083-insights | **superseded** by 0009 | Pro and Business tier pricing from insights session (superseded by DEC-083 spec lock) | pricing, business-tier, insights | [0046-insights-pro-business-tier-pricing.md](0046-insights-pro-business-tier-pricing.md) |

---

## Supersession chains

| Chain | Files |
|---|---|
| Tier pricing | `0006` (DEC-037, $5/$15) → `0008` (DEC-083, $8/$19) → `0009` (DEC-279, $7.99/$19.99) |
| Insights tier pricing | `0046` (DEC-083-insights, insights session) → `0009` (DEC-279, final prices) |
| Domain add-on price | `0028` (DEC-PRICELOCK-02) structure accepted; price history $2→$1.99 documented in `0028` body, price superseded by `0009` |
| Price-lock scope | `0022` (DEC-SYN-06, 3-year) → `0027` (DEC-PRICELOCK-01, lifetime) |
| Pro live-view architecture | `0039` DEC-076 Option 9 (originally DO+SSE) → corrected by `0045` DEC-082 (polling) |

---

## Notes

- `docs/decisions/insights-2026-04.md` kept as historical log alongside per-file records;
  it is the durable transcript of the 2026-04-26 insights decisions session.
- DEC-DOC-01 through DEC-DOC-17 (research-derived orchestrator DECs) are NOT in tadaify
  scope — they live in `orchestrator/` and `claude-reports/`.
- DEC-274 is an orchestrator-side decision (user answered a pricing question); not a
  tadaify-scoped DEC — omitted from this index.
- DEC-OPT-BADGE is referenced in the spec but has no full body documented; it is a
  minor implementation note about the optional support badge in footer — not a standalone DEC.

*Last updated: 2026-04-28 — supersession integrity fixed per Codex review PR #120 (P1: 0009 supersedes off-by-one + 0028 scope correction; P2: 0006/0046 chain alignment).*
