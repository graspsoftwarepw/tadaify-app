---
type: competitor-matrix
project: tadaify
title: Competitor research (Agent 3) — master feature matrix + positioning gap analysis — index
created_at: 2026-04-24
author: orchestrator-opus-4-7-agent-3
source: desk-research
status: draft
---

# tadaify — Competitor research Agent 3 — index

Research dispatch: 2026-04-24. Agent: orchestrator-opus-4-7-agent-3 (Opus 4.7). Scope: master feature matrix + positioning gap analysis across 10 link-in-bio competitors (linktree, beacons, bio.link, lnk.bio, stan.store, carrd, later-linkinbio, taplink, milkshake, campsite.bio).

This set of outputs is **standalone** and does not depend on Agents 1 or 2. Cross-references where useful.

## Outputs

| # | File | Purpose |
|---|------|---------|
| 1 | [`competitors-feature-matrix.md`](./competitors-feature-matrix.md) | 161 features × 10 competitors + tadaify-planned column. Grouped by 15 categories (Onboarding, Editor, Public Page, Design, Monetization, Commerce, Analytics, Integrations, AI, Team, API, Growth, Compliance, Mobile, Content). Cells: Y / $ / N / P / ? + tier note. |
| 2 | [`competitors-feature-matrix.csv`](./competitors-feature-matrix.csv) | Same matrix in CSV for spreadsheet import. |
| 3 | [`competitors-pricing-normalized.md`](./competitors-pricing-normalized.md) | Tier-by-tier USD pricing (annual), feature unlocks, branding-removal paywall, transaction-fee breakdown, price-hike history. |
| 4 | [`positioning-gaps.md`](./positioning-gaps.md) | Strategic output. Sections A (weak-category gaps), B (saturated categories), C (unique-bundle opportunities), D (paid-tier gating patterns + pricing recommendation), E (9 reveal-first concepts mapped to competition), F (honest no-gap categories). Ends with 10-item MVP-critical priority list. |
| 5 | [`competitors-user-segments.md`](./competitors-user-segments.md) | Per-competitor primary/secondary segments. Over-served vs under-served segment analysis. Tadaify target-segment recommendation. |

## Key findings (TL;DR)

1. **Market is saturated on features**. Beacons (117 features) and Linktree (114) are feature-complete leaders. Stan.Store (114) is commerce-specialised. The bottom half compete on price/simplicity, not parity.
2. **4 genuine market gaps nobody fills**: block-level conditionals (geo/device), revenue attribution per link, link-health monitoring, native age gate, transparent moderation policy, price-lock guarantee.
3. **Tadaify's wedge is a tight bundle, not any single unique feature**: reveal-first onboarding (social import → AI palette → hero template → entrance animation) in <30 seconds is the unique combination. Each piece exists individually somewhere; the bundled experience exists nowhere.
4. **Recommended pricing**: Free (no branding, full analytics, 5 animations) / Pro $5/mo (custom domain, revenue attribution, geo blocks, 50 animations) / Business $15/mo (team, API, white-label). Consistent with `competitors.md` framework. Undercuts Linktree's post-Nov-2025 $15 Pro while offering meaningfully different value.
5. **Explicit don't-build list**: course hosting, email campaigns beyond capture, Shopify native sync, native mobile apps at MVP, enterprise SSO, AI brand-outreach pitches (all belong to incumbents' moats).
6. **Target segment**: Nano-micro (0-100k) Instagram/TikTok creators frustrated with Linktree generic-look + pricing + bans. ~85% of addressable market, and the reveal-first product moment doubles as distribution (they screenshot + share).

## Methodology

- **Evidence-first**: every cell marked `Y` or `$` has a source (competitor landing/pricing page or third-party review with URL). `N` cells confirmed by search for absence.
- **No paid trials**: all evidence from public surfaces + third-party comparison sites (G2, Capterra, SaaSworthy, alinkinbio, Talkspresso, Adam Connell, Schoolmaker, Orichi, LinkTree.cx, etc).
- **403/blocked fetches** (Linktree, Beacons, Stan.Store, Bio.link, Campsite direct): compensated by aggregated review-site data, help-center articles, and official changelogs where findable.
- **Independent of Agent 1**: did not consume Agent 1 outputs while working; results intended to stand alone. Overlap with `competitors.md` (parent research doc, 2026-04-12) is explicit and referenced.

## Progress log

See `/tmp/tadaify-research-3-progress.log` for timestamped milestones.

## Next actions for orchestrator

1. Gate on DEC: user reads + accepts the positioning-gaps.md MVP priority list before any tadaify repo scaffold is created.
2. Cross-reference Agent 1 output (per-competitor deep dives) when it lands — expect overlap on 6/10 competitors' financial data + founder details; diverge on feature depth.
3. Cross-reference Agent 2 output (marketing channels) when it lands — feed into distribution strategy that consumes the target-segment profile here.
4. If moving to project creation: run `/research-to-project tadaify` to consume `positioning-gaps.md` § MVP scope into `docs/BUSINESS_REQUIREMENTS.md`.
