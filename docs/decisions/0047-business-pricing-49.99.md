---
id: 0047
aliases: ["DEC-287"]
status: accepted
date: 2026-04-29
supersedes: ["0009-pricing-final-7.99-19.99.md"]
superseded_by: null
topics: [pricing, business-tier]
---

# Business pricing: $49.99/mo (DEC-287 — .99 alignment with DEC-279 chain)

## Context

DEC-279 (0009) locked Creator at $7.99/mo and Pro at $19.99/mo on 2026-04-28, applying
.99 pricing convention for landing/marketing alignment. Business at $49/mo was left
unchanged in that same-day chain. DEC-287 extends the .99 alignment to Business tier.

## Decision

Business plan price: **$49.99/mo** (was $49/mo).

Annual figures:
- Business annual: $49.99 × 12 = **$599.88/yr** (was $588/yr)
- Save-2-months monthly equivalent: $599.88 / 12 = $49.99 (no change to monthly; annual
  shows full-year price)

Note: this is a **partial supersede** of 0009. DEC-279 / 0009 remains the authoritative
source for Creator ($7.99/mo), Pro ($19.99/mo), and domain add-on ($1.99/mo). Only the
Business line is superseded by this record.

## Consequences

- Business: $49 → **$49.99/mo**; annual: $588 → **$599.88/yr**.
- Pricing ladder now fully .99 aligned: $7.99 / $19.99 / $49.99.
- DEC-PRICELOCK-01 applies: future subscribers at $49.99 pay that price for life.
- No impact on Creator / Pro / domain-addon pricing (0009 stays authoritative for those).
- All mockups, spec, and landing code updated to reflect $49.99.

## Rationale

.99 pricing convention established by DEC-279 chain (user directive 2026-04-28). Extending
to Business is consistent and eliminates the mixed-precision anomaly ($49 vs $7.99/$19.99).
Annual math: $49.99 × 12 = $599.88 (not a round number — consistent with Creator $95.88
and Pro $239.88, which are also non-round).

## Supersession chain

DEC-037 ($49, 2026-04-24) → 0009/DEC-279 ($49 unchanged, 2026-04-28) →
**0047/DEC-287 ($49.99/mo, 2026-04-29)**.

## Provenance

- Locked: 2026-04-29
- Original alias: DEC-287
- Partial supersede of 0009 (Business line only)
