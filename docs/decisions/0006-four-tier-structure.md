---
id: 0006
aliases: ["DEC-037"]
status: superseded
date: 2026-04-24
supersedes: []
superseded_by: "0008-pricing-interim-8-19.md"
topics: [pricing, tiers]
---

# 4-tier flat structure: Free $0 / Creator $5/mo / Pro $15/mo / Business $49/mo

## Context

tadaify needs a tier structure. 4-tier flat (Free / Creator / Pro / Business) follows
the Linktree/Beacons pattern but with 0% platform fees on every tier. Initial prices
were set at Creator $5/mo and Pro $15/mo.

## Decision

4-tier flat structure: Free $0 / Creator $5/mo / Pro $15/mo / Business $49/mo.
0% platform fees on every tier forever (contractually locked per F-172a, F-TRUST-001..004).

## Consequences

- Creator $5/mo is the domain-unlock tier (1 custom domain included).
- Pro $15/mo unlocks 8 power features.
- Business $49/mo targets agencies.

## Supersession chain

DEC-037 ($5/$15) → DEC-083 ($8/$19, 2026-04-28) → DEC-279 ($7.99/$19.99, 2026-04-28 same-day).
See `0008-pricing-interim-8-19.md` and `0009-pricing-final-7.99-19.99.md`.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L21, L1355
- Original ID: DEC-037
- Locked: 2026-04-24
- Superseded by: DEC-279 (via DEC-083 same-day chain 2026-04-28)
