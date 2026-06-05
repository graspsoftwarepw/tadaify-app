---
id: BR-AUTH-002
title: Email-OTP verification (6-digit code) for new users
area: AUTH
status: implemented
routes: [/register]
modules: [AUTH]
related_files: [app/routes/api.auth.verify.ts, app/lib/otp-state.ts, app/lib/otp-grid-style.ts]
tests: []
migrations: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-02]
---

# BR-AUTH-002 — Email-OTP verification (6-digit code) for new users

New-user signup is verified by a 6-digit email OTP. The verify endpoint
(`/api/auth/verify`) confirms the code before the handle is bound and the
account is provisioned.

Traceability: functional-spec.md §3 (§3.2 F-002 signup; §3.3 F-003 email signup).
Originating issue: tadaify-app#129.
