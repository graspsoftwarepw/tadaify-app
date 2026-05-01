# Business Requirements — tadaify

tadaify is a link-in-bio platform for creators with a 4-tier pricing model (Free / Creator / Pro / Business), 0% platform fees, and a Cloudflare-first architecture for edge performance on custom domains.

The full functional specification lives in `docs/specs/functional-spec.md`. This file is the BR index — each BR traces to one or more spec sections and stories on the GitHub Project board.

## BR Index

| ID | Title | Spec ref | Status |
|---|---|---|---|
| BR-001 | Creator page public profile | `specs/functional-spec.md` §3 | Planned |
| BR-LANDING-001 | Landing page with handle claim flow | `specs/functional-spec.md` §1, Issue #1 | Implemented |
| BR-AUTH-01 | User can register with a unique @handle | Issue #129 | Implemented |
| BR-AUTH-02 | Email-OTP verification (6-digit code) for new users | Issue #129 | Implemented |
| BR-AUTH-03 | Handle is permanently bound to the user after OTP verification | Issue #129 | Implemented |
| BR-AUTH-04 | Optional password setup post-OTP (returning users can use OTP-only) | Issue #129 | Implemented |
| BR-AUTH-05 | Returning user can sign in via email OTP (no handle required) | Issue #129 | Implemented |
| BR-AUTH-06 | Handle availability check (live, 300 ms debounce) during registration | Issue #129 | Implemented |
| BR-AUTH-07 | Handle reservation (15 min) prevents race on landing → register flow | Issue #129 | Implemented |
| BR-AUTH-08 | 3-strike OTP lockout protects against brute-force attempts | Issue #129 | Implemented |

> Add BRs as features are implemented. Every PR must cite the BRs it implements in the commit body and changelog entry.
