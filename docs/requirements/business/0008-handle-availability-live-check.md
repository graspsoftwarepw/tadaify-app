---
id: BR-AUTH-006
title: Handle availability check (live, 300 ms debounce) during registration
area: AUTH
status: implemented
routes: [/register, /api/handle/check]
modules: [AUTH]
related_files: [app/routes/api.handle.check.ts, app/lib/handle-validator.ts]
tests: []
migrations: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [BR-AUTH-06]
---

# BR-AUTH-006 — Handle availability check (live, 300 ms debounce)

During registration the handle input checks availability live via
`/api/handle/check`, debounced 300 ms, surfacing 3 smart alternatives when the
handle is taken.

Traceability: functional-spec.md §3 (§3.2 F-002 progressive username-first signup,
300 ms debounce + smart alternatives).
Originating issue: tadaify-app#129.
