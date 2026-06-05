---
id: BR-AUTH-001
title: User can register with a unique @handle
area: AUTH
status: implemented
routes: [/register]
modules: [AUTH]
related_files: [app/routes/register.tsx, app/routes/api.auth.signup.ts, app/lib/handle-validator.ts]
tests: []
migrations: [supabase/migrations/20260501000001_profiles.sql]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-01]
---

# BR-AUTH-001 — User can register with a unique @handle

New users register at `/register` by claiming a globally unique `@handle`.
The signup endpoint (`/api/auth/signup`) requires a valid, available handle and
seeds the `profiles` row with `plan = 'free'`.

Traceability: functional-spec.md §3 (§3.2 F-002 progressive username-first signup).
Originating issue: tadaify-app#129.
