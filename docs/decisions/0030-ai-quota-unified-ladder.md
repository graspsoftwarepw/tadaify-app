---
id: 0030
aliases: ["DEC-AI-QUOTA-LADDER-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [ai, quota, pricing]
---

# AI quota: unified shared bucket — Free 5/mo / Creator 20/mo / Pro 100/mo / Business unlimited

## Context

AI features (theme matcher, bio rewrite, block copy suggest, product description) could
each have separate per-feature quotas, or share a single pool. Per-feature quotas are
complex to explain; a unified bucket is simpler for creators to understand and model.

## Decision

Unified shared AI token bucket across all AI features (answer B):
- Free: **5 uses/mo**
- Creator: **20 uses/mo**
- Pro: **100 uses/mo**
- Business: **unlimited**

All uses (theme matcher, bio rewrite, copy suggest, product description) draw from the
same pool. Prior per-feature quotas (from v1) superseded.

## Consequences

- Simple mental model: "I have 20 AI credits this month" (Creator).
- 1 use = 1 API call regardless of which AI feature (all ~$0.0005/call via Claude Haiku).
- Free 5/mo = $75/mo baseline cost at 10k users × 0.3 active × 5 uses × $0.005.
- Aggressive caching + gpt-4o-mini for first draft to reduce cost.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1523; `docs/decisions/INDEX.md`
- Original ID: DEC-AI-QUOTA-LADDER-01
- Locked: 2026-04-25
