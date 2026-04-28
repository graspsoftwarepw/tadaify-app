---
id: 0040
aliases: ["DEC-077"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [analytics, click-tracking, insights]
---

# Click event coverage: every interaction at all tiers (Option 1)

## Context

Click event coverage options: every interaction (click/accordion/video/copy) at all tiers;
outbound-only Free, every interaction Creator+; 10% sample Free, 100% paid; or outbound-only
all tiers (Linktree match). Cost analysis: logging all interactions adds only ~$13/mo at
1M DAU vs outbound-only.

## Decision

Option 1 — log every interaction at all tiers. Click events: link clicks, accordion opens,
video play/pause/complete, copy button clicks, block visibility events. WAE (Cloudflare
Analytics Engine) adaptive sampling protects from write-volume blowups.

Tier-gate via UI: which interaction types are *visible* per tier (not which are logged).
Key differentiator: creators can see if anyone watched their video.

Cost: +$13/mo at 1M DAU vs outbound-only — negligible vs revenue impact.

## Consequences

- Analytics telemetry is comprehensive from day 1.
- UI visibility of interaction types tiered (e.g., video play-complete visible Creator+).
- WAE adaptive sampling guards against abuse / viral traffic spikes.

Cross-references: Issue #45 (Insights tab UI — interaction type visibility by tier).

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-077
- Original ID: DEC-077
- Locked: 2026-04-26T05:53:42Z
