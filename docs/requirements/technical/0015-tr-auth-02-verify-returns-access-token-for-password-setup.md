---
id: TR-AUTH-02
type: tr
status: accepted
date: 2026-04-29
level: MUST
topics: [auth, verify, access_token, password]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-29
---

# TR-AUTH-02 — `POST /api/auth/verify` response includes `access_token`

> **Level:** MUST

The verify response body is `{ verified: true, handle: string, access_token: string }`.
The `access_token` is the Supabase JWT returned from `verifyOtp`. The frontend
(register.tsx B-password-toggle step) passes it as `Authorization: Bearer <token>`
to `POST /api/auth/password` when the user opts to set a password. Without this
field the password-setup step is silently skipped. See DEC-295, BR-AUTH-04.

## Covers

BR-AUTH-04
