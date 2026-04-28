---
id: 0019
aliases: ["DEC-SYN-01"]
status: accepted
date: 2026-04-24
supersedes: []
superseded_by: null
topics: [onboarding, signup, anti-patterns]
---

# Progressive signup — no phone field at signup (AP-021 GREEN)

## Context

Many platforms require phone number at signup for verification. AP-021 identifies this
as a friction anti-pattern that causes signup abandonment, especially for nano/micro
creators who don't want to share their phone number with a new platform.

## Decision

No phone field at signup. Progressive signup flow: handle → credentials → plan (screens
separated per F-002). AP-021 GREEN — resolved by this decision.

## Consequences

- Signup flow is handle-first, frictionless.
- Phone verification not available as 2FA method at MVP.
- 2FA via email or authenticator app.

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1401
- Original ID: DEC-SYN-01
- Locked: 2026-04-24
