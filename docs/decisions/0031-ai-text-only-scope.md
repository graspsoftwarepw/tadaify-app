---
id: 0031
aliases: ["DEC-AI-FEATURES-ROADMAP-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [ai, mvp-scope, features]
---

# Text-only AI scope at MVP: theme matcher + bio rewrite + copy suggest (answer A)

## Context

AI features can be broad (image generation, video thumbnails, brand kit generation) or
focused (text-only: copy suggestions, bio rewrites). Image generation requires dedicated
models (DALL-E, Midjourney API), higher costs, and content moderation complexity. Text-only
AI is cheaper, faster to ship, and covers the most common creator need (copy).

## Decision

Text-only AI features at MVP and Y1 (answer A):
- F-220 AI product description (existing, updated quota)
- F-221 AI page copy
- F-222 AI thumbnail generator (pre-templated Satori, NOT generative image — just typography
  + gradient from existing tokens)
- F-AI-BIO-REWRITE-001: bio rewrite via Claude Haiku, 3 tone variants
- F-AI-COPY-SUGGEST-001: block copy suggest for Link/Product blocks

Image generation deferred indefinitely — revisited when market demands it.

## Consequences

- Lower AI cost than if image generation was included.
- F-222 "AI thumbnail" is Satori-powered pre-templated composition, not DALL-E.
- All AI features use Claude Haiku (~$0.0005/call) or similar lightweight model.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1524; `docs/decisions/INDEX.md`
- Original ID: DEC-AI-FEATURES-ROADMAP-01
- Locked: 2026-04-25
