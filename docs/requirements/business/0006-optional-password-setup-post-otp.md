---
id: BR-AUTH-004
title: Optional password setup post-OTP (returning users can use OTP-only)
area: AUTH
status: implemented
routes: [/register]
modules: [AUTH]
related_files: [app/routes/api.auth.password.ts, app/routes/api.auth.verify.ts]
tests: []
migrations: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-04]
---

# BR-AUTH-004 — Optional password setup post-OTP

After OTP verification, password setup is offered but optional: the verify
response returns an access token that the password endpoint
(`/api/auth/password`) consumes. Returning users may continue to sign in with
OTP only.

Traceability: functional-spec.md §3 (§3.3 F-003 SSO + email signup).
Originating issue: tadaify-app#129.
