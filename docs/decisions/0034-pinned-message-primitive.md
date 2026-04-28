---
id: 0034
aliases: ["DEC-PINNED-MSG-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [features, profile, ux]
---

# Pinned message: adopt primitive — toggleable fading line above profile card (answer A)

## Context

Pinned message is a simple creator-controlled text banner shown above the profile card
on the Page tab. Options: full sticky card (heavy), simple text primitive (light), or
don't ship. The primitive is low-engineering cost and a genuine tadaify-only differentiator
vs Linktree/Beacons (neither has this feature).

## Decision

Pinned message: adopt primitive (answer A). Toggleable fading line above profile card
on the Page tab. Max 80 chars. Dismissible by visitor (dismissed state in sessionStorage).

Positioning: tadaify-only differentiator — "top of mind" signal for creators (limited-time
offer, event announcement, live discount code).

## Consequences

- Simple UI: text input in editor, toggle show/hide, visible above profile card on public page.
- 80-char limit keeps it to one line on mobile.
- Dismissed by visitor → session-scoped (not tracked across visits for privacy reasons).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1528; `docs/decisions/INDEX.md`
- Original ID: DEC-PINNED-MSG-01
- Locked: 2026-04-25
