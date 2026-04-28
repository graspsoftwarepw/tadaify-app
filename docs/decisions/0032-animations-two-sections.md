---
id: 0032
aliases: ["DEC-ANIMATIONS-SPLIT-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [animations, customization, ux]
---

# Animations sub-tab: 2 sections — Entrance + Ambient (answer A)

## Context

The Animations design tab needed a structure. Options: 2 sections (Entrance + Ambient),
3 sections (+ Scroll effects), or a flat list. Scroll effects are a separate concern from
both entrance and ambient motion. 2 sections is clean and matches the primary creator
mental models.

## Decision

Animations sub-tab has 2 sections (answer A):
1. **Entrance** — runs once on page load: page-level, block-level, hover effects
2. **Ambient** — always-on overlay: 10 effects × density/speed/color controls

Third section (accessibility): footer with `prefers-reduced-motion` toggle. Mandatory,
always visible.

Background stays static (Fill/Gradient/Blur/Pattern/Image/Video) — all motion lives in
Animations > Ambient per DEC-WALLPAPER-ANIM-01.

## Consequences

- 20 Free / 60 Pro entrance animation effects (F-148).
- Ambient effects: 10 effects, always-on overlay, density/speed/color knobs.
- Accessibility footer: `prefers-reduced-motion` system preference respected.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1525; `docs/decisions/INDEX.md`
- Original ID: DEC-ANIMATIONS-SPLIT-01
- Locked: 2026-04-25
