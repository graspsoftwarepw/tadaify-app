---
id: 0009
aliases: ["DEC-279"]
status: accepted
date: 2026-04-28
supersedes: ["0008-pricing-interim-8-19.md", "0046-insights-pro-business-tier-pricing.md"]
superseded_by: null
topics: [pricing, tiers, domain-addon]
---

# Final pricing: Creator $7.99/mo, Pro $19.99/mo, extra-domain $1.99/mo

## Context

DEC-083 set Creator $8 / Pro $19 (same-day as this DEC). User directive: .99 pricing
aligns with landing/marketing conventions and is the correct recommendation per Codex
review on PR #116. Stripe subscriptions use exact decimal pricing; `.99` is industry
standard and reduces the psychological price perception.

## Decision

Final prices:
- Creator: **$7.99/mo**
- Pro: **$19.99/mo**
- Custom-domain add-on: **$1.99/mo** (supersedes DEC-PRICELOCK-02's $2/mo)
- Business: $49/mo (unchanged)
- Free: $0 (unchanged)

Annual figures:
- Creator annual: $7.99 × 12 = $95.88
- Pro annual: $19.99 × 12 = $239.88
- Free + 1 domain add-on annual: $1.99 × 12 = $23.88
- Creator + 1 extra domain monthly: $7.99 + $1.99 = $9.98

$6 Creator premium math: $7.99 − $1.99 = $6.00 premium above the $1.99 domain add-on.

## Consequences

- DEC-083 ($8/$19) superseded.
- DEC-PRICELOCK-02 domain price ($2/mo) superseded — now $1.99/mo.
- DEC-PRICELOCK-01 applies: subscribers at $7.99/$19.99 pay that price for life
  (no subscribers yet — product not shipped).
- All mockups, spec, and marketing copy updated to reflect .99 pricing.

## Supersession chain

DEC-037 ($5/$15, 2026-04-24) → DEC-083 ($8/$19, 2026-04-28) → **DEC-279 ($7.99/$19.99, 2026-04-28)**.
Domain: DEC-PRICELOCK-02 ($2/mo) → **DEC-279 ($1.99/mo, same-day)**.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` §DEC-279, §1 tier table; `docs/decisions/INDEX.md`
- Original ID: DEC-279
- Locked: 2026-04-28
