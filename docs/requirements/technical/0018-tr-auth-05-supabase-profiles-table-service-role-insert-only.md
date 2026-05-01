---
id: TR-AUTH-05
type: tr
status: accepted
date: 2026-04-29
level: MUST
topics: [auth, profiles, rls, supabase]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
authorized_at: 2026-04-29
---

# TR-AUTH-05 — `profiles` table: service-role INSERT only; RLS own-row for select/update

> **Level:** MUST

The `profiles` table has RLS enabled. INSERT is permitted only via the Supabase
service-role key (used by `api.auth.verify.ts` Workers route). Anon and authenticated
roles have no INSERT policy — this prevents users from self-inserting arbitrary handles.

RLS policies:
- `own_row_select` — `FOR SELECT TO authenticated USING (auth.uid() = id)`
- `own_row_update` — `FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id)`

## Covers

BR-AUTH-03
