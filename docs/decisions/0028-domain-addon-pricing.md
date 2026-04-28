---
id: 0028
aliases: ["DEC-PRICELOCK-02"]
status: superseded
date: 2026-04-25
supersedes: []
superseded_by: "0009-pricing-final-7.99-19.99.md"
topics: [pricing, custom-domain, domain-addon]
---

# Universal $1.99/mo domain add-on across all tiers (domain price superseded by DEC-279)

## Context

v1 spec had domain pricing unclear — either tier-gated or variable. DEC-PRICELOCK-02
locked the universal model. The domain price was initially $2/mo, later changed to
$1.99/mo by DEC-279.

## Decision

$1.99/mo custom-domain add-on universal across all tiers (Free / Creator / Pro / Business).
Never frame it as Free-tier-only perk. Creator/Pro each include 1 domain in the plan price;
Business includes 10 (agency). Extra domains cost $1.99/mo each regardless of tier.

Pro tier simplified to 1 custom domain (was 3) — multi-domain is a Business/agency need.
Business changed from "Unlimited" to 10 domains. Pro differentiator = 8 power features,
not domain count.

**Note:** domain price of $2/mo was superseded by DEC-279 → $1.99/mo. The structural
decisions (tier shape, universality, domain counts) remain valid.

## Consequences

- "Need extra domains? Add $1.99/mo per custom domain to any plan — Free included.
  No upgrade needed." is canonical copy.
- F-DOMAIN-ADDON-001: Stripe metered add-on, cancel anytime per domain.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L126, L1490; `docs/decisions/INDEX.md`; `pricing/bandwidth-based-model-v2.md`
- Original ID: DEC-PRICELOCK-02
- Locked: 2026-04-25
- Domain price superseded by: DEC-279 (2026-04-28, $2/mo → $1.99/mo)
