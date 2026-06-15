---
id: fr-admin-schedule
title: Administration — Schedule
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-schedule]
related_files:
  - src/proto/screens/admin-schedule/AdminScheduleScreen.tsx
  - src/proto/screens/admin-schedule/adminScheduleFixture.ts
  - src/proto/screens/admin-schedule/admin-schedule-proto.css
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Administration — Schedule

The day-to-day bookings management view a creator opens at Administration > Schedule, ported from
`mockups/tadaify-mvp/app-admin-schedule.html`. It is where a creator confirms, reschedules and tracks
sessions; the page-level setup (booking types, calendar sync, payments) lives separately in the
Schedule page editor. It renders inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the Administration > Schedule
nav entry marked active, and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome (appbar + sidebar), owning only the
  `main.content` body, with the sidebar Administration > Schedule entry marked as the current screen.
- A breadcrumb shall read Dashboard / Administration · Schedule.
- The page header shall show the emoji "📅", the title "Bookings", and a one-line description noting
  that page-level setup lives in Pages → Schedule. In the filled state the header carries an
  "Export CSV" action and a primary "＋ New booking" action; in the no-page state those actions are
  hidden.

## Filled state

- A summary stats row shall show three cards: Today (bookings count + confirmed/pending split),
  This week (count + expected revenue), and No-show rate (carrying an inline "Pro" tier badge). The
  No-show stat stays fully visible and interactive on every tier — it is never blurred.
- A "Today" section shall list the day's bookings, each row showing a time token, the attendee name,
  a status chip (Confirmed / Pending confirm), a one-line type-and-price meta, and row actions. A
  confirmed booking shows a "Details" button; a pending booking shows a primary "Confirm" button.
  Returning attendees and reschedule clocks are reflected per the seeded data.
- An "Upcoming — next 14 days" section shall list further bookings with the same row anatomy, where a
  confirmed row also offers a Reschedule icon action.
- A "Calendar" section shall show a month/prev/next navigation, a Day / Week / Month view-tab group
  (Month active by default; clicking a tab switches the active tab), and a seven-column month grid.
  Cells outside the current month are dimmed, today is highlighted, and event chips render in default,
  warm (pending) and success (coaching) tones. On phone widths the per-cell event chips collapse to a
  single dot marker.

## No-page state

- When the creator has no Schedule page, the body shall show an empty state — an icon, the heading
  "You don't have a Schedule page yet", an explanatory paragraph, an "＋ Add Schedule page now" primary
  action and a "Skip — what is Schedule?" ghost action.
- A demo control shall toggle between the filled and no-page states.

## Booking-detail modal

- Clicking a booking row (or its Details action) shall open a centred booking-detail modal — never a
  side drawer. It shows the attendee in the title, a status chip, a definition list of booking details
  (when, type, price, contact, notes, meeting link, reminders), and a footer with a danger-ghost
  "Cancel booking" action plus "Reschedule" and "Send message" actions.
- The modal shall close on the close button, the Cancel/Escape key, and a click on the backdrop.

## Theming & responsiveness

- The view shall render correctly in light and dark themes via the design tokens and adapt across
  desktop, tablet, and phone widths (stats grid, booking rows, calendar cells, and the modal reflow on
  narrow screens) without horizontal overflow at 390px.
