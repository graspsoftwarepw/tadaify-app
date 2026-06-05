---
id: BR-DASH-009
title: Theme toggle - localStorage-persisted, body.dark-mode, graceful fallback if storage blocked
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [app/lib/theme-utils.ts, app/components/AppAppbar.tsx]
tests: []
migrations: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-009 — Theme toggle

The dashboard theme toggle persists to `localStorage`, applies `body.dark-mode`,
and falls back gracefully when storage is blocked.

Traceability: functional-spec.md §31 (dashboard architecture); §10 customization & theming.
Originating issue: tadaify-app#171.
