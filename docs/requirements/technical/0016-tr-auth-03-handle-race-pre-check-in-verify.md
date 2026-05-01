---
id: TR-AUTH-03
type: tr
status: accepted
date: 2026-04-29
level: MUST
topics: [auth, verify, profiles, race-condition]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-29
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
