---
id: TR-AUTH-005
title: "`profiles` table: service-role INSERT only; RLS own-row for select/update"
area: AUTH
status: accepted
level: MUST
covers: [BR-AUTH-003]
authorized_by: vvaser@gmail.com
aliases: [TR-AUTH-05]
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
