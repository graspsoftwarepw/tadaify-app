---
id: fr-page-editor-custom
title: Page editor — Custom page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-custom]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/CustomEditorScreen.tsx
  - src/proto/screens/page-editors/customEditorFixture.ts
  - src/proto/screens/dashboard/DashboardChrome.tsx
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Custom page

The creator-facing editor a creator opens for a Custom page, ported from
`mockups/tadaify-mvp/app-page-custom.html`. It pairs with the public visitor view
(creator-custom-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). A Custom page is a blank,
creator-named page built from the block library; its content is a drag-reorderable stack of
blocks. It renders inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) and uses the global colour
tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / <page name>), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus the active Custom page sub-page row.
- The page header shall show the emoji "🧩", the page title, a one-line description, a URL pill
  (`tadaify.com/<handle>/<slug>` with a live dot when published), a "Use template" action, and a
  "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section shall contain: a URL slug (prefixed `tadaify.com/<handle>/`),
  a "Page is live" publish toggle, an "Add to homepage nav" toggle, a `noindex` toggle, a
  page-background swatch row (one selected), and a collapsible "SEO settings" expander (meta title with
  ✨ Suggest, meta description, and an OG-image auto-generate toggle with an upload link).

## Page options section

- A "Page options" section shall contain three power features, each marked Pro and each fully visible
  and interactive: a per-page custom-domain field with a Verify-DNS action, a password-protection
  toggle plus password field, and a redirect-after pair (seconds + URL).
- Each power feature shall show an inline upgrade hint; the upgrade gate is mocked at Save.

## Page content section

- A "Page content" section shall present the block stack with "Starter templates" and "Add block"
  header actions, and shall describe drag-to-reorder.
- Each block row shall show a drag grip, a tinted emoji icon, the block name, a type pill, a one-line
  summary, optional flags (A/B active, scheduled), an Edit action, and a kebab menu (Edit, Duplicate,
  Schedule visibility, A/B test variants, Hide from public, Delete).
- An inline "Add block here" CTA shall appear within the stack and an "Add another block" CTA at the end.

## Modals

- "Add block" shall open a centred modal — never a side drawer — with a search field and a grid of the
  12 block types (the Custom HTML type marked Business). Cancel / Escape / the backdrop closes it.
- "Starter templates" / "Use template" shall open a centred modal with the six starter compositions
  (Press kit, Speaking, Resources, FAQ-style, Coming soon, Thank you), each showing its block pills.

## States

- The Page content section shall render either a filled state (the seeded block list) or an empty state
  ("Start with a blank canvas — or pick a starter" with add-block / browse-templates actions and a
  starter-tile grid). A demo control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (field rows, the section header actions, and block rows reflow on narrow screens).
