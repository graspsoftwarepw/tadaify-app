---
type: synthesis
project: tadaify
title: Tadaify competitor audit — 1-page TL;DR
created_at: 2026-04-24
author: orchestrator
status: current
---

# Tadaify Competitor Audit — TL;DR (1 page)

**7 competitors audited** (Stan / Linktree / Beacons / Carrd deep + Lnk.bio / Taplink landing) · **78 patterns** catalogued (PAT-001..078) · **10-section feature-mix** with ~45 sub-decisions in `tadaify-feature-mix.md`

## Category reading in one paragraph

The link-in-bio category splits into 3 clear archetypes: **link-list tools** (Linktree, Lnk.bio, Taplink, Carrd — cheap, broad, shallow commerce), **creator-commerce storefronts** (Stan, Beacons — paid, narrow, deep commerce), and **one-page site builders** (Carrd adjacent). Each archetype has its weakness: link-list tools have weak checkout, storefronts have no free tier, site builders have no commerce primitives. Tadaify plays **the one missing position**: free-tier link-list + paid-tier storefront-depth + inline checkout + EU/PL focus.

## Tadaify's defensible wedges (ranked by moat-depth)

| # | Wedge | Against whom | Why it's ours to take |
|---|---|---|---|
| 1 | **Commerce-gated free tier** — Free = link-list only, Pro+ = commerce with 0% fees always | Stan (no free), Linktree (12% free fee) | Avoids Linktree fee ladder complexity + avoids Stan's trial-only friction. See feature-mix §6.2. |
| 2 | **Public self-serve API + OpenAPI docs day 1** | All 3 main rivals (Linktree partner-only, Stan none, Beacons none) | Low engineering cost, agency + indie dev moat. Feature-mix §8.1 (PAT-055). |
| 3 | **EU/PL localization** — VAT auto-calc, PL payment methods (Przelewy24/BLIK), PL creator directory, PL-culture template names, bilingual copy | None of 7 competitors | Real regulatory + cultural wedge; no copy-paste catch-up possible from US-first rivals. Feature-mix §9, §9.12. |
| 4 | **Guest-mode editor** (build before signup; account at publish) | All 7 (nobody ships this) | Massive friction reduction. Carrd pattern adopted. Feature-mix §1.1.1 (PAT-067). |
| 5 | **Trust Center + real-time SLA adherence** published from day 1 | Linktree publishes SLA commitment; Stan + Beacons zero | Trustpilot proves Stan + Beacons fail here. Feature-mix §6.3, §7.2, §7.4 (PAT-044). |
| 6 | **Inline checkout + per-product landing pages** with reviews + IG embed + upsell | Linktree + Beacons don't; Stan does but paywalled | Ship at MVP so every product URL is shareable. Feature-mix §3.2-3.6 (PAT-013..020). |

## Top 10 adoptions from the audit (prioritized for MVP)

1. **Progressive username-first signup** (Beacons PAT-001) + Google/Apple SSO day 1 (PAT-026) + phone at Stripe time only (AVOID Stan PAT-025)
2. **Guest-mode editor** (Carrd PAT-067) — open `/try`, build without account, signup gate at Publish
3. **Per-product vanity URLs** `/<handle>/p/<slug>` with SSR + OpenGraph + Schema.org (Stan PAT-013)
4. **Inline Stripe Elements checkout** with name + email + promo code + ToS + upsell checkbox (Stan PAT-016, PAT-017)
5. **Desktop 2-col sticky-creator / drawer-product** + mobile single-column (Stan PAT-014)
6. **7 block types day 1:** product · community · lead-magnet · affiliate-link · external-link · section-header · **bundle** (Stan PAT-012, PAT-022)
7. **Per-product reviews + verified-buyer badge** from Stripe record (Stan PAT-018 + ORIGINATE)
8. **Self-referral `Powered by tadaify` footer block on every Free-tier page** with creator's ref code (Stan PAT-008)
9. **Audience-persona tabs in hero** (Twórcy / Edukatorzy / Usługi / Sklepy) (Taplink PAT-075)
10. **3 AI features MVP** — AI product description, AI page copy, AI thumbnail — volume-tiered 5/100/∞ + diff-approval UX (Beacons PAT-065 + ORIGINATE)

## Top 10 things we deliberately DON'T do

1. Stan's no-free-tier / card-at-signup (AVOID)
2. Linktree's 4-tier + 50+ feature matrix (KEEP 2-tier Free+Pro MVP; add Business Y1)
3. Linktree's seller-fee ladder 12→9→9→0 (REJECT — free has no commerce instead)
4. Beacons's `Screw the algorithm` anti-platform copy (tonal mismatch)
5. Beacons's brand-deals CRM and 7 AI features at MVP (DEFER Y1-Y2)
6. Carrd's $19/year pricing (unsustainable at our infra cost)
7. Lnk.bio's 44,813-fonts numerical flex (quality over quantity)
8. Taplink's bare `We use cookies. Got it.` banner (must be GDPR-granular)
9. Stan's Thailand `+66` default country code (IP-geo with US fallback)
10. Celebrity showcase on landing (we don't have Selena Gomez — use 2-3 seeded real demo stores instead)

## Top 10 ORIGINATE — moves no competitor makes

1. **Free tier without commerce** (§6.2) — cleaner than fee ladder, preserves "0% always" brand
2. **Guest-mode editor at `/try`** before account (§1.1.1)
3. **Public self-serve creator API + OpenAPI + webhooks** (§8.1)
4. **Verified-buyer badge** on reviews from Stripe record (§7.2)
5. **Aggregated creator trust score** at hub level — 4.8 across N products (§7.3)
6. **Real-time SLA adherence** on Trust Center, not just commitment (§7.4)
7. **Buyer-locale currency auto-convert** on top of per-creator default (§6.1.1)
8. **Public template previews** at `/t/<name>` without login (§9.5 — PAT-059)
9. **AI diff-approval UX** (before → after with approve/regenerate/edit) — Beacons black-boxes, we're transparent (§9.6)
10. **Bilingual "Ask AI about tadaify" footer prompts** — PL + EN pre-steered queries to ChatGPT/Claude/Gemini/Perplexity/Grok (§9.7 — PAT-060)

## Stack of decisions already locked in feature-mix

- Tier structure: Free + Pro MVP · ~$12/mo Pro · +Business $30 Y1 (§6.1)
- Platform fees: 0% on paid tiers; free has no commerce (§6.2 refined)
- 7-day Pro trial from Free, no card (§6.2.1)
- Support SLA: 48h / 12h / 4h (§6.3)
- AI volume tiers: 5 / 100 / ∞ per month (§6.4)
- Analytics tiers: 28d / 365d / all-time (§6.5)
- Zapier day 1 to deflate 59-integration gap (§8.4)
- 8-12 templates with PL-culture names · public preview (§9.5)
- Countdown timer Pro tier (§9.11)
- "Our cores" PL values section + GDPR granular cookies (§9.12, §9.13)

## Conflicts with older `tadaify-research-synthesis.md` to resolve

Synthesis was written BEFORE this audit. 4 pricing decisions conflict:

| DEC-SYN | Synthesis says | Feature-mix (new) says | Conflict? |
|---|---|---|---|
| DEC-SYN-23 Free contents | email capture + 5 animations + QR + link scheduling + analytics | All of those + commerce EXCLUDED (no digital products / courses / bundles) | **YES** — need user decision: does Free have commerce with 0% fees (DEC-SYN-23 + DEC-SYN-26) OR no commerce at all (feature-mix §6.2)? |
| DEC-SYN-24 Pro $5/mo | $5/mo annual | ~$12/mo (target range from Linktree Pro parity) | **YES** — $5 matches Bio.link anchor; $12 matches Linktree Pro anchor. User picks. |
| DEC-SYN-25 Business $15/mo | $15/mo | $30/mo Y1 (Linktree Premium parity) | **YES** — $15 = Linktree Pro; $30 = Linktree Premium. User picks. |
| DEC-SYN-26 0% fees all tiers incl. free | 0% at every tier | 0% on paid; free has no commerce | **YES** — these are mutually exclusive framings. |

**Recommended resolution:** adopt feature-mix §6.2 refined framing (free = link-list only, paid = 0% commerce). Cleaner messaging, closer to Stan's commerce depth while staying inclusive via free tier. Raise prices to Linktree parity ($12 / $30) to fund the commerce infra + AI credits + support SLA.

## Files to read (in order)

1. `00-tldr.md` — this file
2. `patterns-library.md` — 78 patterns cross-competitor
3. `tadaify-feature-mix.md` — 10 sections of product decisions
4. `../stan-store/notes.md` · `../linktree/notes.md` — deep audit notes (per-competitor findings)
5. `../beacons/notes.md` · `../carrd/notes.md` · `../lnk-bio/notes.md` · `../taplink/notes.md` — landing-only notes

## Open questions requiring user decision

From `../../tadaify-research-synthesis.md` §8 (unchanged by this audit, user input required):

- Q1: Age-gate depth (click-through vs Yoti vs skip)
- Q2: Launch geography (US-only vs US+UK+EU vs global)
- Q3: Moderation staffing (founder vs contractor $400-800/mo)
- Q4: Adult-content stance (explicitly allow vs industry boilerplate)
- Q5: Pricing currency (USD vs EUR vs auto-detect)
- Q6: Landing/app split (`tadaify.com` static vs `app.tadaify.com` SPA)
- Q7: Launch timing vs feature cut (Q3-2026 full vs Q2-2026 reduced)

Plus new ones from this audit:

- Q8: Free-tier commerce framing — feature-mix §6.2 refined vs DEC-SYN-23/26 (4-way conflict resolution above)
- Q9: Pro + Business price points — $5/$15 (synthesis) vs $12/$30 (feature-mix Linktree-parity)
- Q10: Entrance animations (DEC-SYN-01) vs commerce depth (Stan PAT-013..020) — both are MVP-wedge; eng budget constrained; which lane? (Recommended: do both at reduced scope — 10 animations MVP + core commerce; defer 50-animation extended library to Y1.)
