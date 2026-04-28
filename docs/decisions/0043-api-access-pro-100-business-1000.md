---
id: 0043
aliases: ["DEC-080"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [api, analytics, insights, tier-pricing]
---

# API access tier: Pro 100 req/h, Business 1000 req/h + Parquet R2 download

## Context

API access for analytics data: Pro 100 req/h + Business 1000 req/h + Parquet R2 download;
Business-only; Creator+ ladder; or $5/mo API add-on. Creator-class analytics API is a
genuine differentiator — "first creator analytics API in link-in-bio space."

## Decision

Option 1 — Pro 100 req/h, Business 1000 req/h + Parquet R2. This is also elevated to
PRIMARY MARKETING POSITIONING parallel to DEC-075 privacy-first: "first creator analytics
API in link-in-bio space" is a flagship message that must land on landing page + Insights
tab.

Triggers: landing.html API flagship section (Issue #42), Insights tab API teaser/CTA,
audit catalog flag for cross-mockup audit.

## Consequences

- Pro tier has an analytics API with 100 req/h rate limit.
- Business gets 1000 req/h + R2 Parquet downloads (CSV + Parquet export).
- Second marketing pillar: "first creator analytics API."
- API also exposed via F-PRO-CREATOR-API-001 for page management (DEC-CREATOR-API-01).

Cross-references: Issue #42 (API flagship landing), Issue #45 (Insights tab API tile),
DEC-078 (Parquet R2 for Business), marketing pillar #2.

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-080
- Original ID: DEC-080
- Locked: 2026-04-26T05:48:05Z
