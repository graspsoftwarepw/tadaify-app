---
id: BR-DASH-001
title: Creator dashboard /app route - SSR-first, auth-gated, onboarding-interrupt-aware
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [app/routes/app.tsx, app/lib/worker-auth.ts]
tests: []
migrations: [supabase/migrations/20260503000001_app_dashboard_tables.sql]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-001 — Creator dashboard /app route

The creator dashboard at `/app` is SSR-first and auth-gated, and is aware of an
in-progress onboarding interrupt (redirecting unfinished users back into the
wizard).

Traceability: functional-spec.md §31 (F-ARCHITECTURE-001 account vs page settings).
Originating issue: tadaify-app#171.
