# tadaify docs — Navigation Map

Single source of truth for all product research, decisions, architecture, and branding.
**Open this file first** in any new Claude session working on tadaify.

---

## Specs (canonical)

| File | Description |
|---|---|
| [`specs/functional-spec.md`](specs/functional-spec.md) | **THE canonical spec** — 121KB, 1600+ lines. Contains all feature units F-001..F-MULTIPAGE, all DEC-* lockings, anti-patterns audit results. Start here. |
| [`specs/archive/functional-spec-v2.md`](specs/archive/functional-spec-v2.md) | v2 (superseded) — applied 4 architecture pivots. Reference only. |
| [`specs/archive/functional-spec-v1.md`](specs/archive/functional-spec-v1.md) | v1 (superseded) — post-competitor-audit baseline. Reference only. |

For a flat lookup of all locked decisions: **see `decisions/INDEX.md`** below.

---

## Decisions

| File | Description |
|---|---|
| [`decisions/INDEX.md`](decisions/INDEX.md) | Flat table of all 50 DEC-* entries with one-line summary + line refs into `specs/functional-spec.md`. Fast lookup when you know a DEC-ID. |
| [`decisions/insights-2026-04.md`](decisions/insights-2026-04.md) | DEC-073..DEC-083 — Insights & analytics decisions log (2026-04). |

---

## Architecture

| File | Description |
|---|---|
| [`architecture/infra-v2.md`](architecture/infra-v2.md) | Full infra architecture v2 — Cloudflare + Supabase + AWS split, deployment topology, edge routing. |
| [`architecture/infra-cost-analysis.md`](architecture/infra-cost-analysis.md) | Cost breakdown per tier and per component. |
| [`architecture/supabase-cross-project-auth.md`](architecture/supabase-cross-project-auth.md) | Research on Supabase cross-project auth patterns (GoTrue, JWT sharing). |

---

## Pricing

| File | Description |
|---|---|
| [`pricing/bandwidth-based-model-v2.md`](pricing/bandwidth-based-model-v2.md) | 127KB deep-dive: bandwidth-based pricing model v2, Cloudflare R2 cost modelling, domain add-on economics. Cross-refs DEC-PRICELOCK-01/02. |

---

## Roadmap

| File | Description |
|---|---|
| [`roadmap/execution-roadmap.md`](roadmap/execution-roadmap.md) | Sequenced execution plan — MVP sprints, Q+1 features, post-MVP waves. |
| [`roadmap/research-synthesis.md`](roadmap/research-synthesis.md) | Master synthesis: key insights from competitor audit, positioning strategy, feature priority conclusions. |
| [`roadmap/mvp-features-index.html`](roadmap/mvp-features-index.html) | Interactive HTML index of all MVP features (open in browser). |
| [`roadmap/anti-patterns-audit.md`](roadmap/anti-patterns-audit.md) | 18 anti-patterns identified across competitors (AP-001..AP-018). Each resolved in functional spec. |
| [`roadmap/positioning-gaps.md`](roadmap/positioning-gaps.md) | Positioning gap analysis — where tadaify wins vs. Linktree/Beacons/Stan. |

---

## Branding

| File | Description |
|---|---|
| [`branding/brand-lock.md`](branding/brand-lock.md) | **Canonical brand spec** — locked palette, typography, tone, pricing commitments §9. |
| [`branding/theme-tokens.md`](branding/theme-tokens.md) | Design tokens (text) — colors, fonts, spacing, radius, shadows. |
| [`branding/theme-tokens.html`](branding/theme-tokens.html) | Interactive token preview. |
| [`branding/tagline-proposals.md`](branding/tagline-proposals.md) | Tagline options and rationale. |
| [`branding/tagline-proposals.html`](branding/tagline-proposals.html) | Visual tagline comparison. |
| [`branding/wordmark-no-hyphens.html`](branding/wordmark-no-hyphens.html) | Wordmark variant: "tadaify" (no hyphens). |
| [`branding/wordmark-variant-F.html`](branding/wordmark-variant-F.html) | Wordmark variant F (stylized F glyph). |
| [`branding/feature-mockups.md`](branding/feature-mockups.md) | Feature mockup descriptions. |
| [`branding/feature-mockups.html`](branding/feature-mockups.html) | Feature mockup HTML demo. |
| [`branding/brand-exploration.md`](branding/brand-exploration.md) | Brand exploration process notes. |
| [`branding/brand-exploration.html`](branding/brand-exploration.html) | Brand exploration visual. |
| [`branding/logo-motion/FINAL.html`](branding/logo-motion/FINAL.html) | **Canonical logo motion** (v10 FINAL) — open in browser. |
| [`branding/logo-motion/FINAL.md`](branding/logo-motion/FINAL.md) | Logo motion description and rationale. |
| [`branding/logo-motion/archive/`](branding/logo-motion/archive/) | v2..v10 iterations (HTML + MD). |

---

## Marketing

| File | Description |
|---|---|
| [`marketing/strategy.md`](marketing/strategy.md) | 88KB master marketing strategy — go-to-market, channel plan, content calendar. |
| [`marketing/channels.md`](marketing/channels.md) | Channel-by-channel breakdown (organic, paid, partnerships, creator economy). |
| [`marketing/seo-keyword-map.md`](marketing/seo-keyword-map.md) | SEO keyword map — `tadaify.com/vs/<competitor>` and `tadaify.com/for/<niche>` route targets. |
| [`marketing/affiliate-programs.md`](marketing/affiliate-programs.md) | Affiliate program research and structure proposals. |
| [`marketing/pitch-angles.md`](marketing/pitch-angles.md) | Pitch angles per audience segment (creator types, agency, indie). |
| [`marketing/product-hunt-launch-story.md`](marketing/product-hunt-launch-story.md) | Product Hunt launch narrative + tagline candidates. |
| [`marketing/vs-articles-catalog.md`](marketing/vs-articles-catalog.md) | Catalog of competitor comparison article slots (`/vs/<competitor>`). |
| [`marketing/vs-articles-index.md`](marketing/vs-articles-index.md) | Index of vs-article strategy. |

---

## Competitors

| File | Description |
|---|---|
| [`competitors/overview.md`](competitors/overview.md) | Master competitors overview — 10 players, scoring matrix, narrative. |
| [`competitors/feature-matrix.md`](competitors/feature-matrix.md) | Feature-by-feature matrix (Markdown table). |
| [`competitors/feature-matrix.csv`](competitors/feature-matrix.csv) | Same matrix as CSV for data use. |
| [`competitors/pricing-normalized.md`](competitors/pricing-normalized.md) | Normalized pricing comparison across all competitors. |
| [`competitors/research-index-1.md`](competitors/research-index-1.md) | Competitor research round 1 — index + methodology. |
| [`competitors/research-index-3.md`](competitors/research-index-3.md) | Competitor research round 3 — index + methodology. |
| [`competitors/user-segments.md`](competitors/user-segments.md) | User segment analysis per competitor. |
| [`competitors/captures/`](competitors/captures/) | Per-competitor subdirs with screen captures (PNG) + probe reports: `bio-link/`, `beacons/`, `campsite-bio/`, `carrd/`, `later-linkinbio/`, `linktree/`, `lnk-bio/`, `milkshake/`, `stan-store/`, `taplink/` + synthesis and README. |

---

## Research (per-feature, post-MVP topics)

Existing research files — do NOT edit paths; these predate this migration.

| File | Description |
|---|---|
| [`research/affiliate-program.md`](research/affiliate-program.md) | Affiliate program feasibility research. |
| [`research/ai-cost-and-tier-strategy.md`](research/ai-cost-and-tier-strategy.md) | AI feature cost modelling and tier strategy. |
| [`research/custom-domains-cloudflare-vs-cloudfront.md`](research/custom-domains-cloudflare-vs-cloudfront.md) | Cloudflare-for-SaaS vs CloudFront custom domain comparison. |
| [`research/dashboard-plagiarism-risk-audit.md`](research/dashboard-plagiarism-risk-audit.md) | Plagiarism/clone risk audit on dashboard UX patterns. |
| [`research/embedded-block-explainer.md`](research/embedded-block-explainer.md) | Embedded content block oEmbed explainer. |
| [`research/insights-implementation-context.md`](research/insights-implementation-context.md) | Insights Phase A/B implementation context — single source of truth for Insights agent. |
| [`research/insights-metrics-feasibility.md`](research/insights-metrics-feasibility.md) | Opus 4.7 SPIKE: technical capability × user demand for analytics metrics (970 lines). |
| [`research/linktree-newsletter-parity-scan.md`](research/linktree-newsletter-parity-scan.md) | Linktree newsletter feature parity scan. |
| [`research/livestream-block-integration.md`](research/livestream-block-integration.md) | Livestream block oEmbed integration research. |
| [`research/multi-page-grid-and-templates.md`](research/multi-page-grid-and-templates.md) | Multi-page + grid layout DEC trail + competitive landscape. |
| [`research/newsletter-providers-integration.md`](research/newsletter-providers-integration.md) | Newsletter provider integration matrix (Kit, Beehiiv, MailerLite, Mailchimp, Klaviyo). |
| [`research/paid-articles-and-content.md`](research/paid-articles-and-content.md) | Paid articles feature research. |
| [`research/payment-vendor-vat-compliance.md`](research/payment-vendor-vat-compliance.md) | Payment vendor + EU VAT compliance research. |
| [`research/video-block-cloudflare-cost.md`](research/video-block-cloudflare-cost.md) | Cloudflare Stream video block cost modelling. |

---

*Migration source: `~/git/claude-startup-ideas/full-research/tadaify/`*
*Migrated: 2026-04-28. Companion delete PR removes the source dir.*
