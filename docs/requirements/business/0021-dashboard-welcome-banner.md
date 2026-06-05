---
id: BR-DASH-005
title: Welcome banner - state-machine copy (6 states, DEC-332=D never claims the page is live), dismissible (persisted to account_settings)
area: DASH
status: implemented
routes: [/app]
modules: [DASH]
related_files: [app/components/WelcomeBanner.tsx, app/routes/api.account.dismiss-welcome.ts]
tests: []
migrations: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: []
---

# BR-DASH-005 — Welcome banner

The dashboard welcome banner uses state-machine copy across 6 states (DEC-332=D:
never claims "your page is live") and is dismissible, with dismissal persisted to
`account_settings`.

Traceability: functional-spec.md §31 (dashboard architecture).
Originating issue: tadaify-app#171.
