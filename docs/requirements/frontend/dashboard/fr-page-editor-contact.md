---
id: fr-page-editor-contact
title: Page editor — Contact page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-contact]
related_files:
  - src/proto/screens/page-editors/ContactEditorScreen.tsx
  - src/proto/screens/page-editors/contactEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Contact page

The creator-facing editor a creator opens at Pages > Contact, ported from
`mockups/tadaify-mvp/app-page-contact.html`. It pairs with the public visitor view
(creator-contact-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Contact), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Contact" sub-page row marked as the active page.
- The page header shall show the emoji "📮", the title "Contact", a one-line description, a URL pill
  (`tadaify.com/<handle>/contact` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Page settings section

- A collapsible "Page settings" section (with a "Live" chip) shall contain: page title, URL slug
  (prefixed `tadaify.com/<handle>/`), a "Page is live" publish toggle, a "Common alternatives"
  title/slug chip row, a page theme-colour swatch row (one selected), a collapsible "SEO settings"
  expander (meta title with ✨ Suggest, meta description, OG-image drop), and a "Custom domain" field
  marked with a Pro tier badge plus an inline upgrade hint.

## Content sections

- **Hero** — headline (with ✨ Suggest and headline-idea chips), sub-headline, and a cover-image drop.
- **Contact form** — a form-field builder list. Each row shows a drag grip, a tinted type icon, the
  field name + type, an optional Required chip, and a collapse caret; clicking a row expands an inline
  config (label, placeholder, help text, Required toggle, and a Pro-badged Conditional-visibility
  toggle with an upgrade hint, plus a Delete-field action). The GDPR consent row is locked at the
  bottom with an "Auto" chip. Below the list: an "Add field" action, a submit-button label (✨ Suggest),
  an "After submit" select (inline / redirect / thank-you sub-page) revealing the matching extra
  control, and a spam-protection toggle.
- **Where messages go** — an email-forwarding field, a Business-badged "Send to multiple" toggle, a
  Pro-badged grid of delivery-channel cards (Slack, Discord, Notion, Make, Generic webhook) that
  reveal a webhook input when enabled, an upgrade hint, and a copyable inbound endpoint.
- **Office hours** (Creator tier badge) — a display-mode select, a seven-day schedule grid where each
  day toggles open/closed, and timezone + response-time selects.
- **Other contact methods** — public email/phone, messaging handles, social profiles, a physical
  address, and a map-embed toggle revealing a map preview.
- **FAQ-quickref** (Creator tier badge) — editable question/answer rows with delete, plus an
  "Add question" action.
- Premium fields (custom domain, multi-forward, delivery channels, office hours, FAQ-quickref) shall
  stay fully visible and interactive on every tier; the upgrade gate is mocked at Save.

## Modals

- An "Add section" button shall open a centred modal — never a side drawer — listing the section types
  as tiles (some carrying tier badges and an "Already on page" marker).
- "Add field" shall open a centred field-type picker modal of twelve field-type tiles (File upload
  carries a Pro badge, Hidden field a Business badge).
- Choosing the "Thank-you sub-page" after-submit option and clicking its edit action shall open a
  centred thank-you editor modal (headline with ✨ Suggest, body). Cancel / Escape / the backdrop
  closes any modal.

## States

- The editor shall render either a filled state (the seeded section stack) or an empty state
  (a "Your contact page is empty" prompt with "Use recommended layout" and "Add section" actions).
  A demo control toggles between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (field rows, delivery channels, other-method cards, and the hours grid reflow on narrow screens).
