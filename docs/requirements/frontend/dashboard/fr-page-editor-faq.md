---
id: fr-page-editor-faq
title: Page editor — FAQ / Help Center page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-faq]
related_files:
  - src/proto/screens/page-editors/FaqEditorScreen.tsx
  - src/proto/screens/page-editors/faqEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — FAQ / Help Center page

The creator-facing editor a creator opens at Pages > FAQ, ported from
`mockups/tadaify-mvp/app-page-faq.html`. It pairs with the public visitor view
(creator-faq-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / FAQ), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "FAQ" sub-page row marked as the active page.
- The page header shall show the emoji "💬", the title "FAQ / Help Center", a one-line description,
  a row of title quick-pick chips (FAQ, Help Center, Support, Common questions, ✨ Suggest more), a URL
  pill (`tadaify.com/<handle>/faq` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section shall contain: page title, URL slug (prefixed
  `tadaify.com/<handle>/`), a "Page is live" publish toggle, a "Show in main page nav" toggle, a page
  background swatch row (one selected), and a collapsible "SEO settings" expander (meta title with
  ✨ Suggest, meta description).

## FAQ behaviour section

- A "FAQ behaviour" section shall contain: a "Visitors can search" toggle, a "Show TOC sidebar" toggle,
  a "Default expand state" visual-radio group (First open / All collapsed / All expanded), a
  Creator-badged "Was this helpful?" feedback toggle with an upgrade hint, a Pro-badged "Cross-section
  tags" toggle with an upgrade hint, and a search-index summary pill.

## Sections & questions

- A "Sections & questions" section shall provide head actions (Pro-badged "Import CSV", "Add section"),
  a composer toolbar (search + Collapse all / Expand all), and a stack of section cards. Each section
  card has a drag grip, an icon, an editable section name, a question count, a collapse chevron, and a
  options button; clicking the chevron collapses/expands the card.
- Each section card body shall show an optional intro textarea, a list of question rows (each with a
  grip, the question text, a meta line with optional helpful-percentage / updated / tag chips, an Edit
  action, and an options button), and an "Add question to …" action.
- Below the stack: an AI-suggest CTA strip and a secondary "Add section" action.
- Premium behaviours (helpful feedback, cross-section tags, CSV import) shall stay fully visible and
  interactive on every tier; the upgrade gate is mocked at Save.

## Modals

- "Add section" shall open a centred modal — never a side drawer — listing section-type tiles and an
  "AI starter packs" group of tiles (each listing its sections).
- Edit / "Add question" shall open a centred Q&A modal (section select, question, a rich-text answer
  with ✨ Suggest, and a Pro-badged tags input with an upgrade hint).
- "Import CSV" shall open a centred CSV-import modal (a drop zone, a sample download link, and a Pro
  upgrade hint). Cancel / Escape / the backdrop closes any modal.

## States

- The "Sections & questions" section shall render either a filled state (the seeded section stack) or
  an empty state (a "Build your Help Center" prompt with "Create your first section", an AI-bootstrap
  link, and four starter-template tiles). A demo control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the behaviour field rows, the visual-radio group, and the section/question rows reflow on
  narrow screens).
