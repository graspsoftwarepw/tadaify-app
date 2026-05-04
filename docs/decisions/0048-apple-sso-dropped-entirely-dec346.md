---
id: 0048
aliases: ["DEC-346", "DEC-346=C"]
status: accepted
date: 2026-05-04
updated: 2026-05-04
supersedes: []
superseded_by: null
topics: [auth, sso, apple, providers]
---

# Apple SSO permanently dropped from MVP (DEC-346=C)

## Context

DEC-308=C previously locked: Google + Email active at MVP; Apple and X as "Coming soon"
toasts. This implied Apple SSO was a planned post-MVP feature.

Apple's "Sign in with Apple" ("SIWA") mandates a $99/yr Apple Developer Program membership
and produces opaque `privaterelay.appleid.com` relay addresses that users can revoke at
any time. For tadaify, email is the primary contact channel (welcome email, OTP fallback,
GDPR Art. 17 contact). An opaque Apple relay address breaks this channel entirely.

Additionally, Apple mandates SIWA in any iOS app that offers third-party login — but
tadaify ships as a web app with no native iOS binary planned at MVP. There is no legal
or App Store obligation to support SIWA.

## Decision (DEC-346=C — 2026-05-04)

Apple SSO is **permanently removed** from tadaify MVP. This is not a "Coming soon"
deferral — it is a hard removal. The "Coming soon" toast approach (option B) was
explicitly rejected because it signals a future intent we are not committing to.

Provider grid collapses from 4 → 3:
- Google (Coming soon toast — DEC-308=C still applies)
- X (Coming soon toast — DEC-347=B)
- Email-OTP (functional — F-REGISTER-001a)

## Consequences

- `app/routes/login.tsx` — Apple `ProviderBtn` removed; `handleProviderClick` type narrows to `"google" | "x"`.
- `app/routes/register.tsx` — same; `ProviderButton` Apple block removed; `onProviderClick` prop type narrowed.
- `mockups/tadaify-mvp/login.html` — Apple button removed; layout collapses to 3-provider grid.
- `mockups/tadaify-mvp/register.html` — same.
- `docs/decisions/` — this entry documents the permanent decision.
- Issue tadaify-app#131 (Apple SSO backlog item) → closed `wontfix`, citing DEC-346=C.

## Rationale

- Apple relay email is opaque + revocable → breaks OTP fallback + GDPR contact channel.
- No iOS binary → no App Store obligation.
- Permanent removal > "Coming soon" toast (toast implies future support; DEC-346=C commits to NOT supporting Apple SSO).
- No implementation cost: Apple SSO was never functional — only a placeholder button existed.

## Related decisions

- DEC-308=C — Google+Email MVP active; X "Coming soon" (unchanged; X stays as-is)
- DEC-347=B — X stays as "Coming soon" toast (status quo)
- DEC-346 — this decision (Apple dropped)
