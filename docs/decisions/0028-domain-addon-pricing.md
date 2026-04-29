---
id: 0028
aliases: ["DEC-PRICELOCK-02"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [pricing, custom-domain, domain-addon]
---

# Universal domain add-on across all tiers: structure locked (DEC-PRICELOCK-02)

## Context

v1 spec had domain pricing unclear — either tier-gated or variable. DEC-PRICELOCK-02
locked the universal model. The domain price was initially $2/mo, later changed to
$1.99/mo by DEC-279 (see Price history below). Only the price changed; the structural
decisions (universality, tier shape, included counts) remain valid and are NOT superseded.

## Decision

Custom-domain add-on is universal across all tiers (Free / Creator / Pro / Business).
Never frame it as Free-tier-only perk. Creator/Pro each include 1 domain in the plan price;
Business includes 10 (agency). Extra domains cost the current add-on rate regardless of tier.

Pro tier simplified to 1 custom domain (was 3) — multi-domain is a Business/agency need.
Business changed from "Unlimited" to 10 domains. Pro differentiator = 8 power features,
not domain count.

## Consequences

- "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included.
  No upgrade needed." is canonical copy.
- F-DOMAIN-ADDON-001: Stripe metered add-on, cancel anytime per domain.

## Price history

| Effective | Price | Decision | Notes |
|---|---|---|---|
| 2026-04-25 | $2.00/mo | DEC-PRICELOCK-02 (this record) | Initial lock |
| 2026-04-28 | $1.99/mo | DEC-279 → `0009-pricing-final-7.99-19.99.md` | .99-pricing alignment |

Only the price was superseded. Structural decisions (universality, included-domain counts,
tier shape) in this record remain accepted and authoritative.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L126, L1490; `docs/decisions/INDEX.md`; `pricing/bandwidth-based-model-v2.md`
- Original ID: DEC-PRICELOCK-02
- Locked: 2026-04-25
- Domain price superseded by: DEC-279 (2026-04-28, $2/mo → $1.99/mo) — see `0009-pricing-final-7.99-19.99.md`
