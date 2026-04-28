---
id: 0041
aliases: ["DEC-078"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, data-retention, insights]
---

# Retention windows: D1 rollups forever + UI gates query window by tier (Option 1)

## Context

Analytics data retention options: D1 rollups forever for all (raw WAE drops at 90d CF cap,
Business gets R2 Parquet archive); tiered retention 90d/365d/3y/forever; all 365d with
history add-on; or tiered 30/90/365/forever.

## Decision

Option 1 — D1 rollups forever for all. UI gates which query window is available per tier:
- **Free**: 7d query window
- **Creator**: 90d query window
- **Pro**: 1y query window
- **Business**: unlimited slices on same data

Raw WAE events: 90d cap (Cloudflare-imposed). D1 aggregates: kept forever.
Business: + R2 Parquet monthly archive — only real paid line item beyond baseline.

Cost: +$1.50/mo at 1M DAU for R2 Parquet archive. Trust signal: "your data stays."

## Consequences

- All data is stored once in D1 aggregates; no per-tier duplicate storage.
- UI query window gating is a UI change, not a data architecture change.
- R2 Parquet archive is Business-only — genuine cost justification.

Cross-references: Issue #45 (Insights tab — time window UI per tier), DEC-076 (depth gating),
DEC-080 (Parquet R2 for Business API downloads).

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-078
- Original ID: DEC-078
- Locked: 2026-04-26T05:53:42Z
