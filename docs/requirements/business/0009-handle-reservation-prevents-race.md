---
id: BR-AUTH-007
title: Handle reservation (15 min) prevents race on landing → register flow
area: AUTH
status: implemented
routes: [/register, /api/handle/reserve]
modules: [AUTH]
related_files: [app/routes/api.handle.reserve.ts]
tests: []
migrations: [supabase/migrations/20260429000001_handle_reservations.sql, supabase/migrations/20260501000002_handle_reservation_cleanup_trigger.sql]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-07]
---

# BR-AUTH-007 — Handle reservation (15 min) prevents race on landing → register

A handle chosen on the landing page is reserved for 15 minutes via
`/api/handle/reserve`, preventing a race where another visitor claims the same
handle between landing and register. Reservations are cleaned up by a DB trigger.

Traceability: functional-spec.md §3 (§3.2 F-002 signup, handle claim flow).
Originating issue: tadaify-app#129.
