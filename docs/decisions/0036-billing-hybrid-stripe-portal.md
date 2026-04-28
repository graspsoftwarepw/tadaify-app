---
id: 0036
aliases: ["DEC-073"]
status: accepted
date: 2026-04-26
supersedes: []
superseded_by: null
topics: [billing, stripe, ux]
---

# Billing management: hybrid — in-app plan summary + Stripe Portal for invoice/card mgmt

## Context

Billing management options: fully custom in-app UI, redirect 100% to Stripe Customer
Portal, or hybrid. Full custom UI requires reimplementing invoice history, payment method
management, and cancellation flows. Full Stripe Portal removes the in-app conversion
funnel for upgrades.

## Decision

Hybrid approach:
- **In-app**: plan overview, upgrade CTA, subscription status
- **Stripe Portal**: invoice history, payment method changes, cancellation

Keeps the core upgrade path on-product (conversion) while offloading invoice/card
management complexity to Stripe.

## Consequences

- In-app billing tab shows: current plan, price, next renewal date, usage metrics.
- Stripe Portal link visible from billing tab: "Manage invoices & payment method →"
- Upgrade flow (Free → Creator/Pro/Business) is 100% in-app with Stripe Elements.
- Cancellation via Stripe Portal OR via F-180a one-click cancel in Settings.

Cross-references: Issue #34 (Billing tab), DEC-083 (pricing), Issue #33 (Account tab
Stripe portal link).

## Provenance

- Migrated 2026-04-28 from `docs/decisions/insights-2026-04.md` §DEC-073
- Original ID: DEC-073
- Locked: 2026-04-26
