---
id: fr-page-editor-schedule
title: Page editor — Schedule (booking) page
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/page-schedule]
related_files:
  - src/proto/screens/page-editors/ScheduleEditorScreen.tsx
  - src/proto/screens/page-editors/scheduleEditorFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours, fr-page-editor-about]
---

# Page editor — Schedule (booking) page

The creator-facing editor a creator opens at Pages > Schedule, ported from
`mockups/tadaify-mvp/app-page-schedule.html`. It pairs with the public visitor view
(creator-schedule-public) and is built on the shared editor shell
([fr-page-editor-about](./fr-page-editor-about.md) is its sibling). It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render the shared editor shell: the dashboard appbar + sidebar, a breadcrumb
  (Home / Pages / Schedule), a page header, the section stack, and a sticky save-bar.
- The sidebar Pages group shall list Home plus a "Schedule" sub-page row marked as the active page.
- The page header shall show the emoji "📅", the title "Schedule", a one-line description, a URL pill
  (`tadaify.com/<handle>/book` with a live dot when published), and a "Preview" link to the public view.
- The save-bar shall show a save status, a "Discard" button, and a "Save changes" button. Editing any
  field shall flip the status to "Unsaved changes"; Save and Discard shall return it to "All changes saved".

## Administration separation

- A leading "Manage bookings in Administration → Schedule" callout shall explain that day-to-day bookings
  (today's sessions, upcoming list, calendar, per-booking actions) live in the Administration tab and link
  there; this page is page-level setup only.

## Page settings section

- A collapsible "Page settings" section shall contain: page title (✨ Suggest), URL slug (prefixed
  `tadaify.com/<handle>/`), a "Page is live" publish toggle, a theme-colour swatch row (one selected), and
  a collapsible "SEO settings" expander (meta title with ✨ Suggest, meta description).

## Calendar integration section

- A "Calendar integration" section shall contain: a provider grid (Google / Apple / Outlook each with a
  post-MVP pill, Manual / Tadaify-only recommended and selected) as single-select cards, an info note
  about MVP scope, a three-up buffer / booking-window / timezone select row, and a seven-day working-hours
  grid where each day toggles open/closed and exposes from/to time inputs.

## Booking types section

- A "Booking types" section shall offer a "New booking type" header action, a status tab bar
  (All / Active / Paused with counts), a free-plan usage note with an upgrade link, and a list of
  booking-type rows. Each row shows a drag grip, a tinted emoji thumbnail, the title with status + price
  chips, meta text (and a locked Business marker for group bookings), an Edit action, and a kebab menu.

## Availability rules section

- An "Availability rules" section (Creator+ chip) shall contain: recurring-rule toggle rows with an
  "Add recurring rule" action, one-off blackout rows with a remove action and an "Add blackout" action,
  and a month-at-a-glance grid with a Free / Has-bookings / Blocked legend.

## Notifications section

- A "Notifications" section shall contain a creator group (email-on-booking, day-before reminder with a
  Creator+ chip, and a push-to-tools provider chip row with a Pro upgrade hint) and a visitor group
  (booking confirmation, a collapsible confirmation-email subject/body editor, a 24-hour reminder with a
  Creator+ chip, and a 1-hour reminder with a Pro+ chip).

## Payments section

- A "Payments" section (Creator+ chip) shall contain a connected-Stripe panel (status, payout email,
  dashboard + disconnect actions), a default-currency select, a default-cancellation-refund select, and a
  "Require deposit at booking" toggle.

## Composer modal

- "New booking type" / a row's Edit action shall open a centred modal — never a side drawer — with: title
  (✨ Suggest), a cover-image drop, duration + a Free pricing toggle that reveals price + cancellation
  fields with a Creator+ upgrade hint, buffer-override + visibility selects, a booking-form-field builder
  (locked built-in Name/Email rows, removable custom rows with a Required/Optional toggle, and an
  add-field row), a description, a post-booking thank-you, and an Active status toggle. Cancel / Escape /
  the backdrop closes the modal.
- Premium features (availability rules, payments, push providers, far-out reminders, paid types) shall
  stay fully visible and interactive on every tier; the upgrade gate is mocked at Save.

## States

- The Booking types section shall render either a filled state (the seeded type list) or an empty state
  ("Create your first booking type" with a build action and starter templates). A demo control toggles
  between the two.

## Theming & responsiveness

- The editor shall render correctly in light and dark themes and adapt across desktop, tablet, and phone
  widths (the provider grid, the three-up config row, the hours grid, the month grid, and booking-type
  rows reflow on narrow screens).
