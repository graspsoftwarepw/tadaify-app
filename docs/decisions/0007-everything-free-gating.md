---
id: 0007
aliases: ["DEC-043"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [pricing, feature-gating, free-tier]
---

# "Everything free" gating model

## Context

v1 spec gated many features (product blocks, analytics depth, commerce, form builder)
behind Pro or Business tiers. Competitive audit showed Linktree and Beacons charge for
features that have near-zero marginal cost at scale (custom themes, deep analytics).
tadaify's differentiation is "everything free" — pricing only on things with real cost.

## Decision

Every product feature is Free. Pricing differentiation:
1. Custom domain add-ons (~97% margin, primary revenue lever)
2. Pro power features (§18) — 8 features that only matter with a real audience
3. Business agency features (§19) — 5 features for agencies managing multiple pages

Specific v1 gating flips to Free:
- F-028 Product block: Pro → Free
- F-029 Community block: Pro → Free
- F-030 Bundle block: Pro → Free
- F-031 Countdown timer: Pro → Free
- F-040 Featured highlight: Pro → Free
- F-042 Form builder: Pro (Y1) → Free (MVP)
- F-044 Geo-conditional block: Pro → Free
- F-058 Password-protected pages: Pro → Free
- F-131 "Brag stats" counter: Pro → Free

## Consequences

- Free tier is genuine — analytics, commerce, email capture, scheduling all free.
- Revenue model depends on domain add-on conversion rate (8% D30 target) and Pro
  upgrade at D60 (1.5% target).
- Gross margin at 10k MAU ~68% (low COGS per user).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L22, L1480
- Original ID: DEC-043
- Locked: 2026-04-24
