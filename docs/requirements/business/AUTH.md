# Business Requirements — AUTH

> **Auto-generated** on 2026-06-05 by `bin/migrate-records.mjs --kind=br`.
> Do NOT hand-edit this file. Edit the individual BR records in `docs/requirements/business/`.

## AUTH Business Requirements

| ID | Title | Status |
|----|-------|--------|
| [BR-AUTH-001](0003-register-with-unique-handle.md) | User can register with a unique @handle | implemented |
| [BR-AUTH-002](0004-email-otp-verification.md) | Email-OTP verification (6-digit code) for new users | implemented |
| [BR-AUTH-003](0005-handle-permanently-bound-after-otp.md) | Handle is permanently bound to the user after OTP verification | implemented |
| [BR-AUTH-004](0006-optional-password-setup-post-otp.md) | Optional password setup post-OTP (returning users can use OTP-only) | implemented |
| [BR-AUTH-005](0007-returning-user-sign-in-via-email-otp.md) | Returning user can sign in via email OTP (no handle required) | implemented |
| [BR-AUTH-006](0008-handle-availability-live-check.md) | Handle availability check (live, 300 ms debounce) during registration | implemented |
| [BR-AUTH-007](0009-handle-reservation-prevents-race.md) | Handle reservation (15 min) prevents race on landing → register flow | implemented |
| [BR-AUTH-008](0010-otp-3-strike-lockout.md) | 3-strike OTP lockout protects against brute-force attempts | implemented |

---

*Generated from 8 MADR records in area `AUTH`.*
