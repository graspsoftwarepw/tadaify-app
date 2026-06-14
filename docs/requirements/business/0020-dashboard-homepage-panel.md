---
id: BR-DASH-004
title: Homepage panel - blocks list, empty-state quick-start cards, pinned message toggle, profile card
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [app/routes/app.tsx, app/routes/api.account.pinned-message.ts]
tests: []
migrations: [supabase/migrations/20260531000001_account_settings_pinned_message.sql]
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-004 — Homepage panel

The dashboard homepage panel shows the blocks list, empty-state quick-start
cards, a pinned-message toggle (persisted to `account_settings`), and the
profile card.

Traceability: functional-spec.md §31 (dashboard architecture).
Originating issue: tadaify-app#171.
