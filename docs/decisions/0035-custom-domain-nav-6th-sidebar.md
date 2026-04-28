---
id: 0035
aliases: ["DEC-CUSTOM-DOMAIN-NAV-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [ux, navigation, custom-domain]
---

# Custom Domain as 6th sidebar item — globe SVG + "Domain" label + "soon" pill

## Context

Custom domain management is a key Creator-tier feature. Where to surface it in the
dashboard sidebar was debated: under Settings, as a standalone item, or in a billing
sub-panel. A dedicated sidebar item makes the feature discoverable and positions the
domain as a first-class creator asset.

## Decision

Custom Domain as 6th sidebar item (answer A) after Settings. Globe SVG icon + "Domain"
label + "soon" pill at MVP (shipped as placeholder panel with the universal add-on CTA).

Mobile bottom-tabs unchanged (5 max — Home/Pages/Insights/Account/Settings).

Placeholder panel text: "Coming soon — universal $1.99/mo add-on per DEC-PRICELOCK-02/DEC-279."

## Consequences

- Domain is visible in sidebar from day 1 — creates anticipation and education before
  the feature fully ships.
- "Soon" pill removed when F-CUSTOM-DOMAIN-001 ships.
- Mobile bottom-tabs stay at 5 to avoid crowding.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1529; `docs/decisions/INDEX.md`
- Original ID: DEC-CUSTOM-DOMAIN-NAV-01
- Locked: 2026-04-25
