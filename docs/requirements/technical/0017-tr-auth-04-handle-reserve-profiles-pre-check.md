---
id: TR-AUTH-04
type: tr
status: accepted
date: 2026-04-29
level: MUST
topics: [auth, handle, reservation, profiles]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-29
---

# TR-AUTH-04 — Handle reservation must check `profiles` table before inserting

> **Level:** MUST

`POST /api/handle/reserve` executes a GET against `profiles WHERE handle = $1`
before writing to `handle_reservations`. If the handle is permanently claimed
(a profiles row exists), the endpoint returns 409 `{ reserved: false, reason: "handle_taken" }`
immediately without touching `handle_reservations`.

This eliminates the late-failure path where a reservation succeeds but verification
later rejects the handle. The profiles check errors gracefully (network blip → fall
through to INSERT, verify catches any race).

## Covers

BR-AUTH-07
