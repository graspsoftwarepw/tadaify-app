---
id: 0005
aliases: ["DEC-036"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [pricing, currency, localization]
---

# USD currency — all plan SKUs in USD

## Context

tadaify targets an international creator base (US, EU, PL). Plan pricing must be in a
single currency for Stripe subscription simplicity. USD is the de-facto SaaS pricing
standard globally; EUR or PLN would complicate Stripe plan creation and competitive
price anchoring.

## Decision

All prices in USD. Plan SKUs (Creator $7.99/mo, Pro $19.99/mo, Business $49/mo) are
defined in USD. EU creators see local-currency display via `F-073` (multi-currency
display at checkout) but the plan SKU and Stripe subscription are USD.

## Consequences

- `F-073` multi-currency display shows local FX equivalent at checkout but charges in USD.
- PL creators see PLN equivalent displayed; actual charge in USD via Stripe FX.
- All competitive price anchors (Linktree $12 Pro, Stan $29, Beacons $30 CP) are USD —
  direct comparison is clean.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L20, L1354
- Original ID: DEC-036
- Locked: 2026-04-24
