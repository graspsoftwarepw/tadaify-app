---
id: fr-admin-panel
title: Platform admin — super-admin panel
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-panel]
related_files:
  - src/proto/screens/admin-panel/AdminChrome.tsx
  - src/proto/screens/admin-panel/AdminPanelScreen.tsx
  - src/proto/screens/admin-panel/admin-panel-proto.css
  - src/proto/screens/admin-panel/adminPanelFixture.ts
  - src/proto/screens/admin-panel/adminPanelTypes.ts
  - src/proto/screens/admin-panel/sections/AdminModals.tsx
  - src/proto/screens/admin-panel/sections/AuditSection.tsx
  - src/proto/screens/admin-panel/sections/HealthSection.tsx
  - src/proto/screens/admin-panel/sections/LegalSection.tsx
  - src/proto/screens/admin-panel/sections/MaintenanceSection.tsx
  - src/proto/screens/admin-panel/sections/ModerationSection.tsx
  - src/proto/screens/admin-panel/sections/OverviewSection.tsx
  - src/proto/screens/admin-panel/sections/RegistrationSection.tsx
  - src/proto/screens/admin-panel/sections/UsersSection.tsx
  - src/proto/screens/admin-panel/sections/adminModalsFixture.ts
  - src/proto/screens/admin-panel/sections/auditSectionFixture.ts
  - src/proto/screens/admin-panel/sections/healthSectionFixture.ts
  - src/proto/screens/admin-panel/sections/legalSectionFixture.ts
  - src/proto/screens/admin-panel/sections/maintenanceSectionFixture.ts
  - src/proto/screens/admin-panel/sections/moderationSectionFixture.ts
  - src/proto/screens/admin-panel/sections/overviewSectionFixture.ts
  - src/proto/screens/admin-panel/sections/registrationSectionFixture.ts
  - src/proto/screens/admin-panel/sections/usersSectionFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Platform admin — super-admin panel

The internal platform-admin console, ported from `mockups/tadaify-mvp/admin-panel.html`. It is the
**Platform admin** layer in the audiences matrix — a surface only the Platform admin persona reaches,
entirely separate from the creator dashboard. It renders inside its own admin chrome (`AdminChrome`,
distinct from the creator `DashboardChrome`) and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)) and view layout
([fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)).

## Shell (`AdminChrome`)

- The screen shall render a single-page admin shell: an appbar (the tadaify wordmark + an "Admin"
  brand tag, a global search field with a `⌘K` hint, the current admin role chip, the admin email,
  and a dark-mode toggle) and a left admin sidebar.
- The sidebar shall show the signed-in admin (avatar + email + role chip) and an "Operations" nav
  group of eight items — Overview, Users (847), Registration (247, warn), Maintenance, Moderation
  (3, danger), Legal, Health (an "All green" status pill), and Audit log — followed by a divider and
  links to the Creator dashboard and Sign out.
- Selecting a nav item shall switch the active section in place; the active item shall be the only
  one marked current.
- A **read-only** role state shall surface a read-only banner and disable mutating actions (the
  `ro-disable` / `ro-hide-write` affordances), driven by the shell's `data-role`. A role chip in the
  appbar toggles between Super-admin and Read-only for prototype demonstration.
- An **impersonation** banner shall appear while impersonating a creator (entered from the user-detail
  modal's "Login as user"), with an "Exit impersonation" control that clears it.

## Sections

- **Overview** — operational KPIs, a status tile, two trend charts (signups + MRR, rendered as inline
  SVG), tier mix, quick-action buttons that jump to other sections, a recent-events feed, and open
  support tickets.
- **Users** — a searchable, filterable, sortable user table with bulk-select, per-row action menus,
  and actions that open the user-detail / comp-upgrade / hard-delete modals.
- **Registration** — the registration/waitlist queue: KPIs, cap configuration, cohort telemetry, the
  approval queue, and email-template previews.
- **Maintenance** — a maintenance-mode hero toggle with downtime presets, an end-time + reason, and a
  CLI fallback snippet.
- **Moderation** — the report inbox (filters + queue), take-down history, and repeat offenders;
  take-down opens the take-down modal.
- **Legal** — live legal documents (ToS / Privacy) with acceptance stats, a draft with a
  before/after diff, version history, and a publish action that opens the publish-legal modal.
- **Health** — service status grid, request-rate and error-rate charts (inline SVG), a recent-errors
  list, and an endpoint latency table.
- **Audit log** — a searchable, filterable, sortable audit entry table.

## Modals (`AdminModals`)

- The panel shall render five global modals — user-detail, take-down, hard-delete, comp-upgrade, and
  publish-legal — centrally; only the open one renders.
- Every modal shall close on Escape, its close (`×`) control, its Cancel/Close button, and a backdrop
  click. The hard-delete confirmation button shall stay disabled until the confirmation text matches.
- Mutating confirmations are mocked (an alert) — the prototype performs no real platform action.
