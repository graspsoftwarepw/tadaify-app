---
id: 0039
aliases: ["DEC-076"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, insights, gating, tier-pricing]
---

# Dashboard refresh cadence: honest gating Cat A/B/C — no fake margin (Option 9)

## Context

Multiple options evaluated (1-9) for how to gate analytics refresh cadence and depth
by tier. Option 9 emerged after the user challenged whether real-time has actual creator
value and introduced the Category A/B/C classification (genuine infra cost vs storytelling
vs fake margin). No fake-margin gating is a platform-level commitment.

## Decision

Option 9 — honest gating per Cat A/B/C classification:

**Category C — UNGATED (no fake margin):**
- Cross-tab dimensions (unlimited), top-N counts (unlimited), geographic detail
  (country+city), device/browser/referrer detail — all same SQL slicing, zero cost differential

**Per-tier gating (real infra cost only):**
- **Free**: FULL dataset, hourly cadence, 7d window
- **Creator**: 5min cadence, 90d window
- **Pro**: real-time via HTTP polling 60s (KV today counter, NOT DO+SSE — see DEC-082),
  1y window, API 100/h, saved views, daily CSV
- **Business**: real-time polling + replay scrub via DO+SSE for short sessions (DO+R2),
  A/B, identity stitching, scheduled email digests, Parquet R2 archive, 1000 req/h API

Architecture cost: ~$195/mo at 1M DAU.

## Consequences

- Third marketing pillar: "Most generous Free in link-in-bio analytics" (parallel to
  DEC-075 privacy-first and DEC-080 first creator API).
- Cross-tabs/top-N/geo/device detail NOT gated — these are NOT real costs.
- DEC-082 corrects Pro live-view to HTTP polling (not DO+SSE push).

Cross-references: Issue #43 (Generous-Free flagship), Issue #45 (Insights tab), DEC-082,
DEC-083.

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-076
- Original ID: DEC-076
- Locked: 2026-04-26T06:10:34Z
