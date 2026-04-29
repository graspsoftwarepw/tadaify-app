---
id: 0010
aliases: ["DEC-TRIAL-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [onboarding, trials, ux, anti-patterns]
---

# No Pro trial mechanism — replaced by transparent preview + 30-day money-back

## Context

v1 spec included F-012: a 7-day Pro trial. Audit revealed this creates a data-loss UX
problem: Pro features are sticky (team seats, custom CSS, API integrations, 365-day
analytics, email automations). Reverting after 7 days causes data loss, creator frustration,
and chargeback risk. AP-017 pattern identified this as a common anti-pattern.

## Decision

Remove F-012 Pro trial mechanism entirely. Replace with:
1. **Transparent feature preview** — each Pro feature shown in admin with `🔒 Pro $19.99/mo`
   pill + one-click pricing modal.
2. **30-day money-back guarantee** — full refund if creator upgrades and doesn't find value;
   zero data-loss revert pain.
3. **Subtle upsell F-UPSELL-001..006** — discovery without time-bombed trial.

AP-017 (trial reverts sticky features = data-loss UX) eliminated by removing the mechanism.
AP-016 (credit-card-required trial that auto-bills) also eliminated.

## Consequences

- F-012 permanently removed from spec and roadmap.
- `profiles.plan` starts at `'free'` for all new users.
- 30-day money-back is a brand commitment, not a promotional period.
- Pro features fully visible in UI with lock badge — creates aspiration without time pressure.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L272, L1357, L1482
- Original ID: DEC-TRIAL-01
- Locked: 2026-04-24
