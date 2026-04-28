---
id: 0022
aliases: ["DEC-SYN-06"]
status: superseded
date: 2026-04-24
supersedes: []
superseded_by: "0027-price-lock-for-life.md"
topics: [pricing, price-lock, trust]
---

# 3-year price lock at signup rate + fee lock (superseded by DEC-PRICELOCK-01)

## Context

Creators fear platforms raising prices after they've built their presence. A time-windowed
price lock is a trust mechanism. DEC-SYN-06 originally set a 3-year window. This was
superseded by DEC-PRICELOCK-01 which made the lock perpetual.

## Decision

3-year price lock at signup rate + fee lock. Codified as F-172a, F-TRUST-002/003/004.
DB columns: `profiles.price_locked_until TIMESTAMPTZ`, `profiles.fee_locked_until TIMESTAMPTZ`.

## Consequences

This decision was the initial formulation of the price-lock concept. It was superseded
by DEC-PRICELOCK-01 (perpetual lock for uninterrupted subscriptions) on 2026-04-25.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L133, L1488; `docs/decisions/INDEX.md`
- Original ID: DEC-SYN-06
- Locked: 2026-04-24
- Superseded by: DEC-PRICELOCK-01 (2026-04-25)
