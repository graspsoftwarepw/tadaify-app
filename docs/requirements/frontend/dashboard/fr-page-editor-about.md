---
id: fr-page-editor-about
title: Page editor — About page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-about]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/AboutEditorScreen.tsx
  - src/proto/screens/page-editors/aboutEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-creator-about-public]
---

# Page editor — About page

The creator-facing editor a creator opens at Pages > About, ported from
`mockups/tadaify-mvp/app-page-about.html`. It pairs with the public visitor view
([fr-creator-about-public](../public/fr-creator-about-public.md)) and is built on the shared editor shell
([fr-page-editor-links-archive](./fr-page-editor-links-archive.md) is its sibling). It renders inside the
creator dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / About), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus an "About" sub-page row marked as the active page.
- The page header shall show the emoji "👤", the title "About", a one-line description, a URL pill
  (`tadaify.com/<handle>/about` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status with a dot (green when saved, warm when dirty), a "Discard" button,
  and a "Save changes" button. Editing any field shall flip the status to "Unsaved changes"; Save and Discard
  shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section shall contain: page title, URL slug (prefixed `tadaify.com/<handle>/`),
  a "Page is live" publish toggle, a "Link from main page" nav toggle, a page-background swatch row (one
  selected), a "Custom domain" field marked with a Pro tier badge plus an inline upgrade hint, and a
  collapsible "SEO settings" expander (meta title with a ✨ Suggest action, meta description).

## Page content section

- A "Page content" section shall show a section count chip and a stack of collapsible section cards. Each card
  has a drag grip, a tinted type icon, a title + sub-line, a remove action, and a collapse chevron; clicking
  the chevron collapses/expands the card body.
- The seeded cards shall be: **Hero** (square photo drop showing the avatar initial, display name, tagline with
  a ✨ Suggest action, and a social-proof line `@alexandra · 24k followers · since 2018`), **Bio** (a rich-text
  toolbar over a textarea seeded with Alexandra's bio and a word-count meta reading "147 words · ~45 sec read"),
  **Highlights** (a grid of stat cards each with an emoji icon, value, and caption, plus an "Add highlight"
  tile), **Story timeline** (a list/cards visual-style switch and year + title + description milestone rows
  with an "Add milestone" button), **Press / quotes** (marked with a Creator tier badge — a grid of editable
  quote cards with attribution, plus an upgrade hint), and **Contact CTA** (button label with ✨ Suggest, a
  destination select, and a button-style pill group marked with a Pro tier badge plus an upgrade hint).
- Premium fields (custom domain, Press section, custom CTA style) shall stay fully visible and interactive on
  every tier; the upgrade gate is mocked at Save.

## Add-section picker

- An "Add section" button (and the empty-state actions) shall open a centred modal — never a side drawer —
  listing the six section types as tiles (Press / quotes carries a Creator badge) and three starter templates
  (Musician, Author, Coach). Selecting a tile or pressing Cancel / Escape / the backdrop closes the modal.

## States

- The content section shall render either a filled state (the seeded section stack) or an empty state
  (a "Tell visitors who you are" prompt with "Add your first section" and "Use a starter template" actions).
  A demo control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the hero, highlights, quotes, and field rows collapse to single columns on narrow screens).
