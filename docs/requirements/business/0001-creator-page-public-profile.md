---
id: BR-CREATOR-001
title: Creator page public profile
area: CREATOR
status: implemented
routes: [/$handle]
modules: [CREATOR]
related_files: [app/routes/$handle.tsx, app/lib/public-page-query.ts]
tests: []
migrations: []
authorized_by: vvaser@gmail.com
aliases: [BR-001]
---

# BR-CREATOR-001 — Creator page public profile

Every creator has a public, edge-rendered profile page at `tadaify.com/<handle>`
(route `app/routes/$handle.tsx`). The page renders the creator's blocks and
profile from the published page record and stays live regardless of billing
state (no platform-shame overlay).

Traceability: functional-spec.md §3 (Onboarding & Identity / public profile).
Originating issue: tadaify-app#202 (slice).
