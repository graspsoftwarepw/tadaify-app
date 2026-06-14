---
id: BR-DASH-007
title: Mobile bottom tab bar (<600px) - 5 tabs (Home/Design/Insights/Shop/Settings), sidebar hidden
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [app/components/AppMobileTabs.tsx]
tests: []
migrations: []
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-007 — Mobile bottom tab bar (<600px)

On viewports below 600px the dashboard hides the sidebar and shows a 5-tab bottom
tab bar (Home / Design / Insights / Shop / Settings).

Traceability: functional-spec.md §31 (dashboard architecture, responsive).
Originating issue: tadaify-app#171.
