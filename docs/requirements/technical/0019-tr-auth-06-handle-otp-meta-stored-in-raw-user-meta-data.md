---
id: TR-AUTH-006
title: Handle + tos_version stored in `raw_user_meta_data` at OTP send time
area: AUTH
status: accepted
level: MUST
covers: [BR-AUTH-001, BR-AUTH-003]
authorized_by: vvaser@gmail.com
aliases: [TR-AUTH-06]
---

# TR-AUTH-06 — Handle + tos_version stored in `raw_user_meta_data` at OTP send time

> **Level:** MUST

`POST /api/auth/signup` passes `data: { handle, tos_version }` in the Supabase
`/auth/v1/otp` call. Supabase stores this in `auth.users.raw_user_meta_data`.
On verify, `api.auth.verify.ts` reads these fields from the verify response
`user.user_metadata` to populate the `profiles` INSERT. This avoids a separate
metadata-fetch round-trip. See DEC-306.

## Covers

BR-AUTH-01, BR-AUTH-03
