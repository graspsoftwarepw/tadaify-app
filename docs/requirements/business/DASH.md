# Business Requirements — DASH

> **Auto-generated** on 2026-06-05 by `bin/migrate-records.mjs --kind=br`.
> Do NOT hand-edit this file. Edit the individual BR records in `docs/requirements/business/`.

## DASH Business Requirements

| ID | Title | Status |
|----|-------|--------|
| [BR-DASH-001](0017-dashboard-app-route.md) | Creator dashboard /app route - SSR-first, auth-gated, onboarding-interrupt-aware | implemented |
| [BR-DASH-002](0018-dashboard-appbar.md) | App appbar - 3-span wordmark (DEC-WORDMARK-01), handle pill with clipboard copy, live-dot, theme toggle | implemented |
| [BR-DASH-003](0019-dashboard-sidebar.md) | App sidebar - profile card, Pages group (Home active + +Add disabled Q+1), Configuration + Administration accordions | implemented |
| [BR-DASH-004](0020-dashboard-homepage-panel.md) | Homepage panel - blocks list, empty-state quick-start cards, pinned message toggle, profile card | implemented |
| [BR-DASH-005](0021-dashboard-welcome-banner.md) | Welcome banner - state-machine copy (6 states, DEC-332=D never claims the page is live), dismissible (persisted to account_settings) | implemented |
| [BR-DASH-006](0022-dashboard-live-preview-pane.md) | Live preview pane - 3-device toggle (mobile/tablet/desktop), publish-state chip, prefers-reduced-motion | implemented |
| [BR-DASH-007](0023-dashboard-mobile-tab-bar.md) | Mobile bottom tab bar (<600px) - 5 tabs (Home/Design/Insights/Shop/Settings), sidebar hidden | implemented |
| [BR-DASH-008](0024-dashboard-tablet-viewport.md) | Tablet viewport (600-1023px) - sidebar visible, preview pane hidden | implemented |
| [BR-DASH-009](0025-dashboard-theme-toggle.md) | Theme toggle - localStorage-persisted, body.dark-mode, graceful fallback if storage blocked | implemented |
| [BR-DASH-010](0026-dashboard-gdpr-export-delete.md) | GDPR - user-export-data Edge Function (Art. 20) + delete_user_data() RPC cascade | implemented |

---

*Generated from 10 MADR records in area `DASH`.*
