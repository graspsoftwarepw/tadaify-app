---
id: 0033
aliases: ["DEC-WALLPAPER-ANIM-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [animations, background, customization]
---

# Background stays static — all motion lives in Animations > Ambient (answer C)

## Context

Background/Wallpaper design options included: animated backgrounds (video loop, CSS
gradient animation, particle effects). An animated background was considered as a premium
feature. User feedback: animated backgrounds often feel cheap and distracting. All motion
should be channelled through the Animations system where creators have full control.

## Decision

Background stays static. The background types (Fill/Gradient/Blur/Pattern/Image/Video)
are all static renderings. All page motion lives in the Animations > Ambient section
(answer C). Video backgrounds are supported as a static "poster" that can loop, but
motion control is in Animations.

## Consequences

- Background editor simplified: no animation controls on background itself.
- DEC-ANIMATIONS-SPLIT-01 Ambient section handles all overlay/particle/motion effects.
- Consistent: motion is always controlled from one place (Animations tab).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1526; `docs/decisions/INDEX.md`
- Original ID: DEC-WALLPAPER-ANIM-01
- Locked: 2026-04-25
