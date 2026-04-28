---
id: 0014
aliases: ["DEC-Q5-A"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [business-tier, mvp-scope]
---

# Full Business tier at MVP — all 5 F-BIZ units ship MVP

## Context

Business tier targets social media managers and small agencies running 3-10 creator pages.
The question was whether to launch with a stripped-down Business tier or ship all 5 features.

## Decision

Full Business tier at MVP. All 5 F-BIZ units ship MVP. No stripped-down beta, no deferred
features.

- F-BIZ-001: Agency sub-accounts (master account manages N creator pages)
- F-BIZ-002: White-label domain + co-branded emails + custom ToS
- F-BIZ-003: Priority support + 4h SLA + dedicated CSM
- F-BIZ-004: Bulk product + block management across sub-accounts
- F-BIZ-005: Agency revenue reporting + client billing

## Consequences

- Business $49/mo tier is credible and complete from day 1.
- AP-049 (top-tier pricing that feels arbitrary) mitigated — transparent feature list.
- Engineering investment: ~12 weeks total for all 5 F-BIZ units.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1044, L1360, L1485; `docs/decisions/INDEX.md`
- Original ID: DEC-Q5-A
- Locked: 2026-04-24
