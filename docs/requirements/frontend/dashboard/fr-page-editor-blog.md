---
id: fr-page-editor-blog
title: Page editor — Blog page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-blog]
related_files:
  - src/proto/screens/page-editors/BlogEditorScreen.tsx
  - src/proto/screens/page-editors/blogEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Blog page

The creator-facing editor a creator opens at Pages > Blog, ported from
`mockups/tadaify-mvp/app-page-blog.html`. It pairs with the public visitor view
(creator-blog-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Blog), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Blog" sub-page row marked as the active page.
- The page header shall show the emoji "📝", the title "Blog", a one-line description, a URL pill
  (`tadaify.com/<handle>/blog` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section shall contain: page title, URL slug (prefixed
  `tadaify.com/<handle>/`), a "Page is live" publish toggle, an "Enable RSS" toggle, a page-background
  swatch row (one selected), and a collapsible "SEO settings" expander (meta title with ✨ Suggest,
  meta description, OG-image drop with an AI-generate link).

## Layout section

- A "Layout" section shall contain: a card-layout select (Cards / List / Magazine), a posts-per-page
  number input, a sort-order select (Newest / Oldest / Manual), and a "Display author" byline toggle.

## Administration separation

- An "Manage posts in Administration → Blog" callout shall explain that day-to-day publishing lives in
  the Administration tab and link there; this page is page-level setup only.

## Posts section

- A "Posts" section shall offer a quick view of recent posts with a "New post" header action, a status
  tab bar (All / Published / Drafts / Scheduled with counts), a title search, and a list of post rows.
- Each post row shall show a drag grip, a tinted emoji thumbnail, the title, a status chip
  (Published / Draft / Scheduled), meta text, tag pills, an Edit/Continue action, and a kebab menu.
  A pagination footer shall show the visible range and page controls.

## Composer modal

- "New post" / a row's Edit action shall open a centred modal — never a side drawer — with: a cover-image
  preview (Replace), title (✨ Suggest), URL slug, a rich-text body toolbar + textarea, a tags input, an
  author select marked with a Business badge plus an upgrade hint, and a schedule date/time pair with a
  Pro upgrade hint. Cancel / Escape / the backdrop closes the modal.
- Premium fields (author selection, far-future scheduling) shall stay fully visible and interactive on
  every tier; the upgrade gate is mocked at Save.

## States

- The Posts section shall render either a filled state (the seeded post list) or an empty state
  ("Write your first post" with a create action and a starter-template link). A demo control toggles
  between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (field rows, the list toolbar, and post rows reflow on narrow screens).
