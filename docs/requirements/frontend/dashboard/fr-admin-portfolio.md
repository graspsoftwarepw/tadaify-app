---
id: fr-admin-portfolio
title: Administration — Portfolio
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-portfolio]
related_files:
  - src/proto/screens/admin-portfolio/AdminPortfolioScreen.tsx
  - src/proto/screens/admin-portfolio/adminPortfolioFixture.ts
  - src/proto/screens/admin-portfolio/admin-portfolio-proto.css
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Administration — Portfolio

The creator-facing day-to-day project management view a creator opens at
Administration > Portfolio, ported from `mockups/tadaify-mvp/app-admin-portfolio.html`.
It manages the projects that surface on the public Portfolio page; page-level setup
(layout, items per row, visitor controls) lives separately in the Portfolio page editor.
The screen renders inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the
Administration > Portfolio nav entry marked current, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome with the Administration >
  Portfolio sidebar entry marked as the current view.
- The body shall open with a breadcrumb (Dashboard / Administration · Portfolio).
- A page header shall show the emoji "🎨", the title "Projects", a one-line description
  pointing page-level setup to Pages → Portfolio, a "Bulk import" ghost button, and a
  primary "＋ New project" button. The header actions shall be hidden in the no-page state.

## States

The screen shall expose a demo state switcher cycling three mutually exclusive states:

- **No page** — an empty card explaining that no Portfolio page exists yet, with a primary
  "＋ Add Portfolio page now" action and a "Skip — what is Portfolio?" ghost action.
- **Empty** — the Portfolio page exists but has no projects: a primary "＋ Add first project"
  action plus four template tiles (Case study, Image gallery, Video showcase, Code project).
- **Filled** (default) — a "Projects" section listing project cards.

## Filled state

- The section head shall show "Projects" and a count summary
  ("12 total · 9 published, 2 drafts, 1 archived").
- A toolbar shall provide status filter tabs (All / Published / Drafts / Archived, each with a
  count, one active), a project search input, and a sort select (Custom order, Newest first,
  Oldest first, Most viewed, A → Z).
- Projects shall render as a responsive card grid. Each card shows a cover tile with status
  chips (Published / Draft / Archived) and an optional Featured chip, a drag handle, the
  project title, a category · views meta line, and Edit + More icon buttons.
- A pagination control shall render below the grid (prev, page numbers, next).

## Project composer modal

- The "New project" / Edit actions shall open a centred modal titled "New project" with a Draft
  chip. The modal shall close on Escape, on the Cancel/close control, and on a backdrop click.
- The modal body shall contain a cover-image dropzone, a Title field, a Category select + URL
  slug field row, short and long description textareas, a gallery thumb grid with an add tile,
  and an external-link + tags field row.
- The modal footer shall show a "Delete draft" danger-ghost action, a "Save draft" ghost action,
  and a primary "Publish" action.

## Behaviour & theming

- All controls are presentational: buttons are real `type="button"` controls that no-op or
  surface a mockup alert; there are no dead `href="#"` links. State is local React state only.
- Layout shall stay within the viewport with no horizontal overflow at 390px width.
- Colours derive from the global tokens so light and dark themes both render correctly.
