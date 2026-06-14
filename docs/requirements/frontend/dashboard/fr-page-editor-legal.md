---
id: fr-page-editor-legal
title: Page editor — Legal page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-legal]
related_files:
  - src/proto/screens/page-editors/EditorShell.tsx
  - src/proto/screens/page-editors/page-editors-proto.css
  - src/proto/screens/page-editors/LegalEditorScreen.tsx
  - src/proto/screens/page-editors/legalEditorFixture.ts
  - src/proto/screens/dashboard/DashboardChrome.tsx
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Legal page

The creator-facing editor a creator opens at Pages > Legal, ported from
`mockups/tadaify-mvp/app-page-legal.html`. It pairs with the public visitor view
(creator-legal-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). A Legal page is a multi-policy
single page (Terms / Privacy / Cookie / Refund / DMCA / Accessibility / AUP); each policy renders as
its own anchored section with version tracking on the public page. It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)). All starter body
content is placeholder text the creator must replace before publishing.

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Legal), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Legal" sub-page row marked as the active page.
- The page header shall show the emoji "⚖️", the title "Legal", a one-line description, a
  title quick-pick chip row, a URL pill (`tadaify.com/<handle>/legal` with a live dot when published),
  and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save & publish" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Work area

- The screen shall lay the section stack alongside a right-hand compliance-helper sidebar on wide
  screens; the helper reflows below the main column on narrow screens.

## Page settings section

- A "Page settings" section shall contain: a page title, a URL slug (prefixed `tadaify.com/<handle>/`),
  a "Page is live" toggle, a "Footer link from your homepage" toggle, a page-background swatch row (one
  selected), and a collapsible SEO expander (a `noindex,follow` toggle, meta title with ✨ Suggest, and
  a meta description).

## Policies section

- A "Policies" section shall present the policy stack with "Use template" and "Add policy" header
  actions, and shall describe drag-to-reorder.
- Each policy card shall show a drag grip, a policy icon, an editable policy name, a meta line
  (version chip, effective date, last-updated date, optional variant chip), a version-history action, a
  kebab menu (Copy public link, Duplicate, Export as PDF, Remove), and a collapse chevron.
- An expanded policy card shall show a version / effective-date / last-updated meta grid, a rich-text
  body toolbar + textarea, a placeholder-warning callout, an auto-generated TOC preview, and a footer
  with a "View N past versions" link and the public anchor.
- Premium policies (DMCA, Accessibility, AUP) shall stay fully visible and show an inline upgrade hint;
  the gate is mocked at Save.

## Cookie banner integration section

- A "Cookie banner integration" section shall explain that the Cookie Policy is linked from the consent
  banner and link to the cookie-banner configuration.

## Compliance helper

- The helper sidebar shall show a "Required for your setup" checklist (met / needed / not-applicable
  items), an annual-review reminder with a "Mark reviewed" action, a translations list marked Pro with
  an inline upgrade hint, and a "Need help?" block linking to a lawyer directory.

## Modals

- "Add policy" shall open a centred modal — never a side drawer — with a grid of policy types
  (already-added types disabled and marked Added; premium types badged). Cancel / Escape / the backdrop
  closes it.
- "Use template" / "Browse templates" shall open a centred modal with a disclaimer callout and the six
  starter templates, each showing its summary bullets.
- The version-history action shall open a centred modal listing past versions (current marked Live), an
  inline Creator upgrade hint, and an "Export all as PDF" action.

## States

- The Policies section shall render either a filled state (the seeded policy list) or an empty state
  ("Start with a vetted template" with the six starter tiles and an add-custom-policy action). A demo
  control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the work grid, field rows, policy cards, and helper sidebar reflow on narrow screens).
