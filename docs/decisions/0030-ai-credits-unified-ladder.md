---
id: 0030
aliases: ["DEC-AI-QUOTA-LADDER-01", "DEC-286", "DEC-030"]
status: accepted
date: 2026-04-25
updated: 2026-04-29
supersedes: []
superseded_by: null
topics: [ai, credits, pricing]
---

# AI credits: unified shared bucket — Free 5/mo / Creator 20/mo / Pro 100/mo / Business unlimited

## Context

AI features (theme matcher, bio rewrite, block copy suggest, product description) could
each have separate per-feature credits, or share a single pool. Per-feature tracking is
complex to explain; a unified bucket is simpler for creators to understand and model.

## Decision

Unified shared AI credits bucket across all AI features (answer B):
- Free: **5 credits/mo**
- Creator: **20 credits/mo**
- Pro: **100 credits/mo**
- Business: **unlimited**

All credits (theme matcher, bio rewrite, copy suggest, product description) draw from the
same pool. Prior per-feature quotas (from v1) superseded.

**Terminology lock (DEC-286, 2026-04-29):** human-facing label is **"AI credits"** uniformly.
"AI quota", "AI uses", "AI generations" are retired terminology. Internal code identifiers
already using neutral terms (e.g. `aiCreditsRemaining`) stay. The alias
`DEC-AI-QUOTA-LADDER-01` is preserved for backwards searchability only — it is NOT
used in user-facing copy.

## Consequences

- Simple mental model: "I have 20 AI credits this month" (Creator).
- 1 credit = 1 API call regardless of which AI feature (all ~$0.0005/call via Claude Haiku).
- Free 5/mo = $75/mo baseline cost at 10k users × 0.3 active × 5 credits × $0.005.
- Aggressive caching + gpt-4o-mini for first draft to reduce cost.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1523; `docs/decisions/INDEX.md`
- Original ID: DEC-AI-QUOTA-LADDER-01
- Locked: 2026-04-25
- Terminology updated 2026-04-29 per DEC-286 (AI credits uniform language)
