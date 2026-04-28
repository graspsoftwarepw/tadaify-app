# Decision Index — tadaify

Every `DEC-*` from `specs/functional-spec.md`, indexed for fast lookup.
Full rationale lives in the spec; this is the navigation table.

Also includes DEC-* cited in `architecture/infra-v2.md`, `architecture/infra-cost-analysis.md`,
and `pricing/bandwidth-based-model-v2.md`.

---

| ID | Status | Title | Spec ref |
|---|---|---|---|
| DEC-033 | locked | Self-referral block — F-125 is opt-in growth block, NOT "Powered by tadaify" watermark. AP-001 hard-locked. | `specs/functional-spec.md` L1486 |
| DEC-035 | locked 2026-04-24 | Cloudflare-first architecture. Edge + custom domains + media + hot analytics = Cloudflare Workers, R2, Pages, Cloudflare-for-SaaS, Analytics Engine. Central brain = Supabase. AWS = S3 cold + Athena + Glue only. | `specs/functional-spec.md` L19, L1353 |
| DEC-036 | locked 2026-04-24 | USD currency. All prices in USD. EU creators see local-currency display via F-073 but plan SKU is USD. | `specs/functional-spec.md` L20, L1354 |
| DEC-037 | superseded by DEC-083 | 4-tier flat structure: Free $0 / Creator $5/mo / Pro $15/mo / Business $49/mo. 0% platform fees on every tier forever. Superseded by DEC-083 (2026-04-28). | `specs/functional-spec.md` L21, L1355 |
| DEC-083 | superseded by DEC-279 (same-day 2026-04-28) | Pricing revised: Creator $8/mo / Pro $19/mo (supersedes DEC-037 $5/$15). Business $49/mo unchanged. Rationale: Phase-A landing flagship sections were already designed at $8/$19 (DEC-274 user answer); aligning canonical pricing avoids contradicting the rendered marketing surface. DEC-274 answer=2. **Superseded same-day by DEC-279 ($7.99/$19.99).** | `specs/functional-spec.md` §Pricing, `mockups/tadaify-mvp/landing.html` L1578 |
| DEC-279 | locked 2026-04-28 | Pricing: Creator $7.99/mo, Pro $19.99/mo, extra-domain $1.99/mo (supersedes DEC-083 + DEC-PRICELOCK-02 domain price). User directive — final .99 pricing for landing/marketing alignment. Annual: Creator $95.88, Pro $239.88, Free+domain $23.88. | `specs/functional-spec.md` §DEC-279 |
| DEC-038 | locked | Custom domain included in Creator tier (1 domain built per DEC-038). | `specs/functional-spec.md` L638 |
| DEC-043 | locked 2026-04-24 | "Everything free" gating model. Every product feature is Free. Pricing differentiation: custom domain add-ons (~97% margin) + Pro power features + Business agency features. | `specs/functional-spec.md` L22, L1480 |
| DEC-AI-FEATURES-ROADMAP-01 | locked 2026-04-25 | Text-only AI scope (answer A): theme matcher + bio rewrite (F-AI-BIO-REWRITE-001) + block copy suggest (F-AI-COPY-SUGGEST-001). Image generation deferred. | `specs/functional-spec.md` L1524 |
| DEC-AI-QUOTA-LADDER-01 | locked 2026-04-25 | AI quota (answer B): Free 5/mo / Creator 20/mo / Pro 100/mo / Business unlimited. Unified shared bucket across all AI features. | `specs/functional-spec.md` L1523 |
| DEC-ANIMATIONS-SPLIT-01 | locked 2026-04-25 | Animations sub-tab: 2 sections (answer A) — Entrance (page + block + hover, runs once) + Ambient (always-on overlay: 10 effects × density/speed/color). Third section: Accessibility footer. | `specs/functional-spec.md` L1525 |
| DEC-ANTI-001 | locked | No "Powered by tadaify" footer on ANY tier. Not a paid unlock. Hard-locked. | `specs/functional-spec.md` L1491 |
| DEC-ANTI-002 | locked | 0% platform fees contractually locked. Published on Trust Center. Cannot be raised mid-subscription. | `specs/functional-spec.md` L1492 |
| DEC-ANTI-003 | locked | F-UPSELL-004 does NOT pre-select paid radio. Default stays Free. Badge-only recommendation. | `specs/functional-spec.md` L1493 |
| DEC-ANTI-004 | locked | F-191a Plain-Language Content Policy + F-191b Creator Safeguard = both MVP. | `specs/functional-spec.md` L1494 |
| DEC-ANTI-005 | locked | F-180a one-click cancel. No multi-step survey. No retention modal cascade. | `specs/functional-spec.md` L1495 |
| DEC-ANTI-006 | locked | Trial revert NEVER deletes data. Trial mechanism removed entirely per DEC-TRIAL-01. | `specs/functional-spec.md` L1496 |
| DEC-ANTI-007 | locked | T+14 days max payout SLA. Published on tadaify.com/trust/payouts. | `specs/functional-spec.md` L1497 |
| DEC-ANTI-008 | locked | Creator page stays live during dunning. No public shame overlay. Ever. | `specs/functional-spec.md` L1498 |
| DEC-ANTI-009 | locked | Feature-preservation: tier gates only move cheaper for existing users. Grandparent via `user_features`. | `specs/functional-spec.md` L1499 |
| DEC-ANTI-010 | locked | "We never sell creator or visitor data; never share with LLMs for training." Published on Trust Center. | `specs/functional-spec.md` L1500 |
| DEC-ANTI-011 | locked | F-PREVIEW-004 disclosure strip is TOP of preview page; mandatory; one-click remove form; admin cannot disable. | `specs/functional-spec.md` L1501 |
| DEC-ANTI-012 | locked | F-058a EU visitor cookie consent banner. Granular (not bare "Got it"). MVP. | `specs/functional-spec.md` L1502 |
| DEC-ANTI-013 | locked | Editor progressive disclosure: 6-block "Getting Started" default. F-020 §4a. | `specs/functional-spec.md` L1503 |
| DEC-ANTI-014 | locked | Double-opt-in email mandatory. Inherited from linkofme subscribe/confirm stack. | `specs/functional-spec.md` L1504 |
| DEC-ANTI-015 | locked | No persistent upgrade banner in editor chrome. F-UPSELL-003 chips = 1/session hard cap, dismissible, informational only. | `specs/functional-spec.md` L1505 |
| DEC-APIPAGES-01 | locked 2026-04-25 | Platform OAuth import rejected (answer C). F-PRO-OAUTH-IMPORT permanently removed from roadmap. Creator API (F-PRO-CREATOR-API-001) is the better investment. | `specs/functional-spec.md` L1519 |
| DEC-CREATOR-API-01 | locked 2026-04-25 | Creator API for Pro tier (answer A): OpenAPI 3.0, per-user keys, `@tadaify/mcp` npm MCP server, custom GPT template, agent-recipe gallery, rate limit 1000 req/h Pro. | `specs/functional-spec.md` L1127, L1520 |
| DEC-CUSTOM-DOMAIN-NAV-01 | locked 2026-04-25 | Custom Domain as 6th sidebar item (answer A) after Settings. Globe SVG + "Domain" label + "soon" pill. Placeholder panel referencing $1.99/mo add-on per DEC-PRICELOCK-02/DEC-279. | `specs/functional-spec.md` L1529 |
| DEC-DNS-01 | locked 2026-04-24 | Cloudflare authoritative DNS for `tadaify.com`. OVH holds registrar ownership; nameservers point to Cloudflare. Route 53 not used for `tadaify.com`. | `specs/functional-spec.md` L79, L1351 |
| DEC-DOMAIN-01 | locked 2026-04-24 | Single-domain architecture: everything under `tadaify.com/`. Creator URL = `tadaify.com/<handle>`. Dashboard at `tadaify.com/app`. Admin at `tadaify.com/admin`. No subdomain variants. | `specs/functional-spec.md` L75, L1350 |
| DEC-FRAMEWORK-01 | locked 2026-04-24 | Full-stack framework is Remix (React Router 7) on Cloudflare Workers runtime. SSR for public pages, CSR for authenticated dashboard. Native `@remix-run/cloudflare` adapter. | `specs/functional-spec.md` L77, L1352 |
| DEC-INFRA-MINIMAL-01 | locked | AWS usage minimal (invisible backend only): S3 cold Parquet + Athena + Glue + SNS/SES. ~100-150 lines Terraform total (vs ~500 in standard template). | `specs/functional-spec.md` L1555 |
| DEC-LAYOUT-01 | locked 2026-04-25 | Grid layout ships in MVP (answer A). `pages.layout_mode='stack'|'grid'`. `block_placements` table with col/row/span_cols/span_rows/mobile_order. All tiers. | `specs/functional-spec.md` L1108, L1508 |
| DEC-MKT-B-v2 | locked | Preview generator is admin-only tool at `/admin/marketing/preview-generator`. Not a public endpoint. Generated previews served at `preview.tadaify.com/<slug>`. | `specs/functional-spec.md` L351, L1483 |
| DEC-MKT-C | locked | Marketing language: EN-only at launch. PL copy, PL-culture template names, PL outreach deferred to Y2+. | `specs/functional-spec.md` L1484 |
| DEC-MULTIPAGE-01 | locked 2026-04-25 | Multi-page accounts confirmed for post-MVP (Q+1, Creator-tier unlock). Tier ladder Free 1 / Creator 5 / Pro 20 / Business unlimited. MVP must be forward-compatible: blocks need `page_id` FK, URL routes use `/<handle>/<slug>`. | `specs/functional-spec.md` L128, L1094 |
| DEC-PINNED-MSG-01 | locked 2026-04-25 | Pinned message: adopt primitive (answer A). Toggleable fading line above profile card on Page tab. Max 80 chars. Dismissible by visitor. | `specs/functional-spec.md` L1528 |
| DEC-PRICELOCK-01 | locked 2026-04-25 | Price-lock-for-life (supersedes DEC-SYN-06). Paid subscription price locked forever for uninterrupted subscriptions. New prices apply only to new signups or re-subscribers after cancellation. Brand commitment. | `specs/functional-spec.md` L124, L1489 |
| DEC-PRICELOCK-02 | locked 2026-04-25 (domain price superseded by DEC-279) | $1.99/mo domain add-on universal across all tiers (was $2/mo — superseded by DEC-279 2026-04-28). Pro tier simplified to 1 custom domain (was 3). Business: 10 included (was unlimited). Pro differentiator = 8 power features, not domain count. | `specs/functional-spec.md` L126, L1490 |
| DEC-Q5-A | locked | Full Business tier at MVP. All 5 F-BIZ units ship MVP. No stripped-down beta. | `specs/functional-spec.md` L1044, L1360, L1485 |
| DEC-Q5-C | locked | Preview parser: Linktree-only at MVP. Beacons/Stan/Bio.link parsers at M+0.5. | `specs/functional-spec.md` L353, L1361, L1486 |
| DEC-SOCIAL-01 | locked 2026-04-24 | Social-import on onboarding switched from OAuth auto-import to handle-based link generation. F-004 rewritten, F-005 merged into F-004. OAuth deferred to F-PRO-OAUTH-IMPORT (Pro tier, §18.9). | `specs/functional-spec.md` L330, L1358 |
| DEC-SYN-01 | locked | Progressive signup — no phone field at signup (AP-021 GREEN). | `specs/functional-spec.md` L1401 |
| DEC-SYN-04 | locked | Hero layouts: 5 defaults, hero-first rendering (F-151). | `specs/functional-spec.md` L727 |
| DEC-SYN-05 | locked | Creator Safeguard: 48h warning + human appeal + prepaid refund contract. Codified as F-191b. | `specs/functional-spec.md` L840, L1487 |
| DEC-SYN-06 | superseded by DEC-PRICELOCK-01 | 3-year price lock at signup rate + fee lock. Codified as F-172a, F-TRUST-002/003/004. Superseded by DEC-PRICELOCK-01. | `specs/functional-spec.md` L133, L1488 |
| DEC-TRIAL-01 | locked 2026-04-24 | No Pro trial mechanism. Replaced by: transparent feature preview with lock badge + 30-day money-back guarantee + subtle upsell (F-UPSELL-001..006). Removes AP-017. | `specs/functional-spec.md` L272, L1357, L1482 |
| DEC-WALLPAPER-ANIM-01 | locked 2026-04-25 | Background stays static (Fill/Gradient/Blur/Pattern/Image/Video). All motion lives in Animations > Ambient (answer C). | `specs/functional-spec.md` L1526 |

---

## Additional DEC-* from architecture / pricing docs

| ID | File | Brief |
|---|---|---|
| DEC-035 | `architecture/infra-v2.md` | Cloudflare-first (cross-ref with spec) |
| DEC-INFRA-MINIMAL-01 | `architecture/infra-v2.md` | Minimal AWS footprint for tadaify |
| DEC-PRICELOCK-01/02 | `pricing/bandwidth-based-model-v2.md` | Domain add-on pricing + price-lock model |

---

*This index was auto-generated by grepping `specs/functional-spec.md`. Last updated: 2026-04-28.*
*For full rationale on any decision, open the spec and search for the DEC-ID.*
