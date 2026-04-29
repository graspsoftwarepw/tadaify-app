---
id: 0020
aliases: ["DEC-SYN-04"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [customization, hero, theming]
---

# Hero layouts: 5 defaults, hero-first rendering (F-151)

## Context

Creator pages need visual variety but building unlimited hero configurations is out of
scope. 5 curated hero layouts cover the primary use cases: centered, left-aligned,
split-image, minimal, and full-bleed. Hero-first rendering means the profile card +
hero is the first visible element on any creator page.

## Decision

5 default hero layouts ship at MVP (F-151). Hero-first rendering: profile card + hero
is always rendered above the block list. All tiers. The 5 layouts are part of the
20 curated theme presets.

## Consequences

- Creators choose one of 5 hero layouts; no custom hero builder at MVP.
- Hero-first rendering is a fixed architectural choice — blocks scroll below.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L727
- Original ID: DEC-SYN-04
- Locked: 2026-04-24
