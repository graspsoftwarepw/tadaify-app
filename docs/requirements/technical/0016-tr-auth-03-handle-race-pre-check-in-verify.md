---
id: TR-AUTH-003
title: Handle race-condition pre-check in `POST /api/auth/verify`
area: AUTH
status: accepted
level: MUST
covers: [BR-AUTH-003]
authorized_by: vvaser@gmail.com
aliases: [TR-AUTH-03]
---

# TR-AUTH-03 — Handle race-condition pre-check in `POST /api/auth/verify`

> **Level:** MUST

Before inserting the profiles row, `api.auth.verify.ts` must execute:

```sql
SELECT id FROM profiles WHERE handle = $1 LIMIT 1
```

- If a row exists with a DIFFERENT `id` → return 409 `{ verified: false, reason: "handle_taken" }`.
- If a row exists with the SAME `id` → idempotent retry by the same user — fall through to INSERT.
- If no row exists → proceed normally.

This prevents EC-002 (handle collision race condition) from being silently treated as
success. See the e2e plan for story #129.

## Covers

BR-AUTH-03
