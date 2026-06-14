---
id: BR-AUTH-008
title: 3-strike OTP lockout protects against brute-force attempts
area: AUTH
status: implemented
routes: [/register, /login]
modules: [AUTH]
related_files: [app/lib/otp-state.ts, app/routes/api.auth.verify.ts]
tests: []
migrations: []
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-08]
---

# BR-AUTH-008 — 3-strike OTP lockout protects against brute-force

After 3 wrong OTP code entries the verification is locked out, protecting against
brute-force guessing of the 6-digit code. This is distinct from OTP resend
rate-limiting (BR-OTP-001), which governs send attempts, not wrong codes.

Traceability: functional-spec.md §3 (§3.2/§3.3 auth flows).
Originating issue: tadaify-app#129.
