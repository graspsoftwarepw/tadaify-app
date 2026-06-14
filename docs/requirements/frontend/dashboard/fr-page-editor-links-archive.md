---
id: fr-page-editor-links-archive
title: Page editor — Links archive
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-links-archive]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/LinksArchiveEditorScreen.tsx
  - src/proto/screens/page-editors/linksArchiveEditorFixture.ts
  - src/proto/screens/dashboard/DashboardChrome.tsx
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Links archive

The creator-facing editor for the browse-all-links sub-page, ported from
`mockups/tadaify-mvp/app-page-links-archive.html`. The archive derives its contents from link buttons across
the creator's other pages (homepage, blog post bodies, About, custom pages) plus optional manual additions —
for creators with many links who want a "browse all my links" page beyond the curated homepage. It is built on
the shared editor shell (sibling of [fr-page-editor-about](./fr-page-editor-about.md)), renders inside the
dashboard chrome ([fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)), and uses the global
colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Links archive), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Links archive" sub-page row marked as the active page.
- The page header shall show the emoji "🗂️", the title "Links archive", a one-line description, a URL pill
  (`tadaify.com/<handle>/<slug>` with a live dot when published), a "Preview" link, and a row of title-idea
  chips. Clicking a title-idea chip shall set the page title and derive the slug from it.
- The save-bar shall behave as in [fr-page-editor-about](./fr-page-editor-about.md): editing flips the status
  to "Unsaved changes"; Save / Discard return it to saved.

## Page settings section

- A "Page settings" section shall contain: page title (with live slug derivation), URL slug (prefixed
  `tadaify.com/<handle>/`), a "Publish to public" toggle, a "Show in homepage footer" toggle, a theme-color
  swatch row (one selected), and a collapsible "SEO & sharing" expander (meta title, meta description).

## Sources section

- A "Where do the links come from?" section shall list source rows, each with a toggle, a tinted icon, a name
  + description, and a per-source link count. The seeded sources are Homepage (87, default, on), Blog post
  bodies (42, on), About page sections (9, on), All custom pages (0, off), and Manually-added bonus links
  (5, on). An active source row shall be visually highlighted.
- A live-count summary shall read "N links from M sources" and update whenever a source is toggled.

## Manual bonus links section

- A "Manual bonus links" section shall show a count + an "Add manual link" button and a list of manual link
  rows (drag handle, tinted icon, title, URL, optional A/B-test chip, Edit + Delete actions). Add appends a
  row, Delete removes one, and both update the count.
- Clicking Edit on a row shall expand an inline editor (title, icon, URL, an A/B-test-variant select marked
  Business, and a schedule-visibility field marked Creator+) with Cancel / Save; only one row may be open at a
  time. Premium fields stay interactive on every tier; the gate is mocked at Save.

## How visitors browse section

- A "How visitors browse" section shall offer a grouping-mode picker of five cards (By source page — default;
  Manual categories — Creator+; Alphabetical; Most clicked — Creator+; Newest first), with the selected card
  marked.
- It shall also list visitor-control toggles: Search bar (free, on), Tag filter chips (Creator+, on), Sort
  dropdown for visitors (Pro+, off), and Show click counts on every link (Pro+, off). Tier badges are inline
  and the gate is mocked at Save.

## Excluded links section

- An "Excluded from archive" section shall show an excluded count and rows (icon, title, URL, reason, Edit
  reason + Restore actions). "Restore" removes the row and decrements the count. "Edit reason" opens a centred
  modal — never a side drawer — showing the link URL (read-only) and an editable reason; Save / Cancel /
  Escape / backdrop close it.

## States

- The body shall render either a filled state (all five sections) or an empty state (a "No links to archive
  yet" prompt with "Add your first link button" and a manual-link action). A demo control toggles between them.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (source rows, grouping-mode cards, manual rows, and field rows reflow on narrow screens).
