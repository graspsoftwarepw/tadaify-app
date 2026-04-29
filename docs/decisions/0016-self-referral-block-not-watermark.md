---
id: 0016
aliases: ["DEC-033"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [anti-patterns, branding, growth]
---

# Self-referral block (F-125) is opt-in growth mechanism, NOT a "Powered by tadaify" watermark

## Context

Linktree and many competitors show "Powered by Linktree" on creator pages — especially
on free tiers. AP-001 identifies this as the most critical anti-pattern: it cheapens the
creator's professional image and creates resentment. Some platforms make it a paid "removal"
feature. tadaify's F-125 (self-referral growth block) could be confused with this pattern.

## Decision

F-125 is an **opt-in growth block** — a creator-controlled referral mechanism that creators
can add if they want to participate in the affiliate program (30% recurring commission).
It is NOT a mandatory "Powered by tadaify" watermark. tadaify has no platform watermark on
any tier. AP-001 is hard-locked: removing non-existent branding can never be a paid "unlock."

## Consequences

- F-125 is opt-in: creator actively chooses to add the referral block.
- No platform branding on public creator pages on any tier, ever.
- Trust positioning: creators can show a professional page without any platform attribution.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1486; `docs/decisions/INDEX.md`
- Original ID: DEC-033
- Locked: 2026-04-24
