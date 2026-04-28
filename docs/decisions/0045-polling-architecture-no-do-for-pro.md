---
id: 0045
aliases: ["DEC-082"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, architecture, durable-objects, polling]
---

# Polling architecture for Pro live-view — no Durable Objects push (Option 6)

## Context

DEC-076 Option 9 introduced DO live-view for Pro+ and DO replay for Business. After
re-evaluation, the DO+SSE push model for Pro is over-engineered and has abuse vectors.
Industry standard (Plausible/Fathom/Simple Analytics) uses HTTP polling for live views.

## Decision

Option 6 — polling-based architecture:
- **Pro live view**: HTTP polling 60s (KV today counter) — NO Durable Objects, NO continuous
  connection, zero abuse vector, NO per-creator cap needed
- **Business replay**: DO+SSE for scrub sessions only, capped 60min/day per Business creator
- **Layer B**: environment-level monthly budget cap $200/mo total (DO+WAE+email+R2)
- **Layer C**: anomaly detection cron (5min) with alerts at 2× rolling 7-day baseline +
  single-creator >50% daily WAE share + budget thresholds

Architecture simpler + cheaper: ~$195/mo at 1M DAU (vs $235 with DO push). Pro live-view
experience truly unlimited (polling has no per-creator throttle).

## Consequences

- DEC-076 Pro live-view architecture updated: KV polling, not DO+SSE.
- Business replay stays DO-backed but capped (60min/day scrub time — real cost).
- Forward-compatible env vars throughout for cost cap thresholds.

Cross-references: DEC-076 (supersedes DO+SSE architecture for Pro live view), Issue #45
(Insights tab real-time polling implementation).

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-082
- Original ID: DEC-082
- Locked: 2026-04-26T06:27:58Z
