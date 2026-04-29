---
id: 0046
aliases: ["DEC-083-insights"]
status: superseded
date: 2026-04-26
supersedes: []
superseded_by: "0009-pricing-final-7.99-19.99.md"
topics: [pricing, business-tier, insights]
---

# Pro and Business tier pricing from insights session (superseded by DEC-083 spec lock)

## Context

During the Insights session (2026-04-26), the Pro and Business pricing was decided.
Creator was locked at $8/mo per DEC-PRICELOCK-01. This session locked Pro $19/mo and
Business $49/mo with specific features: 5 handles + 10 team members for Business.

Note: this is the same decision as DEC-083 (spec lock) — the insights session locked
pricing first, then the spec was updated. The numeric DEC-083 in the insights log refers
to the same decision as DEC-083 in the spec.

## Decision

FINAL — single Business tier (no Starter/Agency split):
- **Pro $19/mo** (1 handle)
- **Business $49/mo** includes 5 handles + 10 team members + all Business features
  (replay, A/B, identity stitching, scheduled digests, Parquet R2 archive, 1000 req/h API)
- Add-on: $9.99/mo per additional handle

Team members FREE/included up to 10 (cost ~$0 thanks to polling architecture; cap is
for support-load + abuse prevention). Agency-scale (>30 handles or >10 team members):
contact support / custom deal.

Fourth marketing pillar: "Agency-friendly: 5 handles + 10 team members for $49/mo."

**Note: Superseded same-day by DEC-279** ($7.99/$19.99 pricing; structural decisions on
tier shape and feature list remain valid).

Cross-references: Issue #38 (Team feature rescope to Business-only), DEC-083 4th marketing
pillar, Phase B F-APP-MULTI-HANDLE-001, DEC-076 (insights gating), DEC-279 (final prices).

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-083
- Original ID: DEC-083 (insights session)
- Locked: 2026-04-26T06:31:38Z
- Superseded by: DEC-279 (pricing values; structure retained)
