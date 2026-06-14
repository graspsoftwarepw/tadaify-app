---
id: BR-AUTH-005
title: Returning user can sign in via email OTP (no handle required)
area: AUTH
status: implemented
routes: [/login]
modules: [AUTH]
related_files: [app/routes/login.tsx, app/routes/api.auth.login-otp.ts, app/lib/login-otp-error.ts]
tests: []
migrations: []
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-05]
---

# BR-AUTH-005 — Returning user can sign in via email OTP

Returning users sign in at `/login` by email OTP alone (no handle). The login
flow uses the dedicated `/api/auth/login-otp` endpoint with `create_user: false`
(see TR-AUTH-01), never the signup endpoint.

Traceability: functional-spec.md §3 (§3.3 F-003 SSO + email signup).
Originating issue: tadaify-app#129.
