---
id: fr-page-editor-portfolio
title: Page editor — Portfolio page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-portfolio]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/PortfolioEditorScreen.tsx
  - src/proto/screens/page-editors/portfolioEditorFixture.ts
  - src/proto/screens/dashboard/DashboardChrome.tsx
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Portfolio page

The creator-facing editor a creator opens at Pages > Portfolio, ported from
`mockups/tadaify-mvp/app-page-portfolio.html`. It pairs with the public visitor view
(creator-portfolio-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Portfolio), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Portfolio" sub-page row marked as the active page.
- The page header shall show the emoji "🎨", the title "Portfolio", a one-line description, a URL pill
  (`tadaify.com/<handle>/portfolio` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section shall contain: page title, URL slug (prefixed
  `tadaify.com/<handle>/`), a "Page is live" publish toggle, an "Enable RSS" toggle, a page-background
  swatch row (one selected), and a collapsible "SEO settings" expander (meta title with ✨ Suggest,
  meta description, OG-image drop with an AI-generate link).

## Layout section

- A "Layout" section shall contain: a grid-mode visual radio row (Masonry / Grid / Carousel, each with a
  preview), an items-per-row slider (Masonry & Grid), a cover-sizing select, a "Display tag pills" toggle,
  and a "Show filter chips" visitor-filter toggle.

## Administration separation

- An "Manage projects in Administration → Portfolio" callout shall explain that day-to-day project
  management lives in the Administration tab and link there; this page is page-level setup only.

## Projects section

- A "Projects" section shall offer a quick view of recent projects with a "New project" header action, a
  status tab bar (All / Published / Drafts / Archived with counts), a title search, a sort select, a
  visitor-style filter-chip bar that filters the rows, and a list of project rows.
- Each project row shall show a drag grip, a tinted thumbnail (with a featured pin and an optional video
  pill), the title, status + featured chips, meta text, tag pills, an Edit/Continue action, and a kebab
  menu. A pagination footer shall show the visible range and page controls.

## Composer modal

- "New project" / a row's Edit action shall open a centred modal — never a side drawer — with: cover-media
  Image/Video kind tabs over a cover preview (Replace), a gallery thumbnail strip with add tiles, title
  (✨ Suggest), URL slug + year, a multi-select medium/category input, a rich-text description toolbar +
  textarea, a tags input, project-URL + client fields, a collaborators multi-select marked with a Business
  badge + upgrade hint, a featured toggle with an upgrade hint, and a schedule date/time pair with a Pro
  upgrade hint. Cancel / Escape / the backdrop closes the modal.
- Premium fields (collaborators, featured cap, far-future scheduling) shall stay fully visible and
  interactive on every tier; the upgrade gate is mocked at Save.

## States

- The Projects section shall render either a filled state (the seeded project list) or an empty state
  ("Show your first project" with a create action and starter templates). A demo control toggles between
  the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the grid-mode cards, the three-up tunables row, the filter chips, and project rows reflow on
  narrow screens).
