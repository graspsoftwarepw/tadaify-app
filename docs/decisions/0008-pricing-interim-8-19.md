---
id: 0008
aliases: ["DEC-083"]
status: superseded
date: 2026-04-28
supersedes: ["0006-four-tier-structure.md"]
superseded_by: "0009-pricing-final-7.99-19.99.md"
topics: [pricing, tiers]
---

# Pricing revised: Creator $8/mo, Pro $19/mo (supersedes DEC-037)

## Context

During Phase-A landing mockup work (`mockups/tadaify-mvp/landing.html` L1578), the
flagship "Most Generous Free" comparison sections were already written and rendered at
Creator $8/mo and Pro $19/mo — based on DEC-274 user answer (option 2). Aligning
canonical spec pricing to the rendered mockup avoids contradicting the approved visual
surface and is cheaper than reverting both spec and mockup.

## Decision

Pricing revised: Creator **$8/mo**, Pro **$19/mo**. Business $49/mo unchanged. Free $0
unchanged. 0% platform fees unchanged. Price-lock-for-life (DEC-PRICELOCK-01) applies.

Competitive framing remains valid at $8/$19: Linktree Pro is $12, Linktree Premium is $30;
Creator $8 still undercuts significantly.

## Alternatives considered

- Keep DEC-037 ($5/$15) and update mockup to match — rejected as more work with more
  user-facing inconsistencies.

## Consequences

- DEC-037 (Creator $5 / Pro $15) superseded.
- Phase-A marketing copy at $8/$19 aligned.
- DEC-PRICELOCK-01 applies: any subscriber at $8 or $19 pays that price for life.

## Supersession chain

DEC-037 ($5/$15) → **DEC-083 ($8/$19)** → DEC-279 ($7.99/$19.99, same-day 2026-04-28).
Superseded same-day by DEC-279 (user directive for .99 pricing).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` §Pricing §DEC-083; `docs/decisions/INDEX.md`
- Original ID: DEC-083
- Locked: 2026-04-28
- Superseded same-day by: DEC-279
