---
id: fr-page-editor-paid-articles
title: Page editor — Paid articles list page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-paid-articles]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/PaidArticlesEditorScreen.tsx
  - src/proto/screens/page-editors/paidArticlesEditorFixture.ts
  - src/proto/screens/dashboard/DashboardChrome.tsx
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Paid articles list page

The creator-facing editor a creator opens at Pages > Paid articles, ported from
`mockups/tadaify-mvp/app-page-paid-articles.html`. It configures the page visitors land on at
`tadaify.com/<handle>/articles`, which lists all the creator's monetized articles; per-article
publishing/management lives in Administration → Paid articles (a callout links there). It is built on
the shared editor shell ([fr-page-editor-about](./fr-page-editor-about.md) is its sibling), renders
inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)), and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Paid articles), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Paid articles" sub-page row marked as the active page.
- The page header shall show the emoji "💰", the title "Paid articles", a one-line description that
  links to Administration → Paid articles, a URL pill (`tadaify.com/<handle>/articles` with a live dot
  when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A "Page settings" section shall contain: a visitor-facing page title, a URL slug (prefixed
  `tadaify.com/<handle>/`), a lede/intro line, a "Page is published" toggle, and a "Show in navigation"
  toggle marked Creator.

## Layout section

- A "Layout" section shall offer a three-option visual picker for the visitor list layout (Grid /
  List / Featured-on-top) with one option selected.

## Visitor controls section

- A "Visitor controls" section shall contain three toggles: a search bar, tag-filter chips, and a sort
  selector (Newest / Most popular / Price).

## Theme section

- A "Theme" section shall offer a page-background swatch row with one swatch selected.

## SEO & sharing section

- An "SEO & sharing" section shall contain a collapsible expander with a search-engine title, a meta
  description, an Open Graph image drop, and a custom-domain field marked Pro. The custom-domain field
  shall stay fully visible and interactive; the upgrade gate is mocked at Save.

## Preview section

- A "Preview" section shall show a sample of the public page (hero title with article count + lede and a
  grid of sample article cards) and an "Open full preview" link.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (field rows, the layout picker, and preview grid reflow on narrow screens).
