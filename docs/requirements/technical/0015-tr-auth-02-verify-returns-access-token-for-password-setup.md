---
id: TR-AUTH-002
title: `POST /api/auth/verify` response includes `access_token`
area: AUTH
status: accepted
level: MUST
covers: [BR-AUTH-004]
authorized_by: vvaser@gmail.com
aliases: [TR-AUTH-02]
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
