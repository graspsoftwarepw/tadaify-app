---
id: BR-AUTH-003
title: Handle is permanently bound to the user after OTP verification
area: AUTH
status: implemented
routes: [/register]
modules: [AUTH]
related_files: [app/routes/api.auth.verify.ts, app/lib/worker-auth.ts]
tests: []
migrations: [supabase/migrations/20260501000001_profiles.sql]
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-03]
---

# BR-AUTH-003 — Handle is permanently bound to the user after OTP verification

Once OTP verification succeeds, the claimed handle is permanently bound to the
user's profile (unique constraint on `profiles.handle`); a service-role insert
finalizes the binding.

Traceability: functional-spec.md §3 (§3.2 F-002 signup).
Originating issue: tadaify-app#129.
