---
id: fr-creator-schedule-public
title: Public creator Schedule page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-schedule-public]
related_files:
  - src/proto/screens/creator-schedule-public/CreatorSchedulePublicScreen.tsx
  - src/proto/screens/creator-schedule-public/creator-schedule-public-proto.css
  - src/proto/screens/creator-schedule-public/creatorSchedulePublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Schedule page

What a visitor sees at `tadaify.com/<handle>/book` — a multi-step booking flow. Ported from
`mockups/tadaify-mvp/creator-schedule-public.html`. Visitors see the creator's own theme; colour tokens
come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses
the shared public-page chrome described in [fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav with the "Book" link marked as the current page, and the
  shared footer.

Step indicator:

- The page shall render a three-step indicator (Pick a session → Pick a time → Fill details) reflecting
  the current step, with completed steps marked done.

Step 1 — pick a session:

- The page shall render a grid of session-type cards (each with a cover, duration, price/free badge, a
  note, title, and description); selecting one advances to step 2 with that type carried into the recap.

Step 2 — pick a time:

- The page shall render a recap chip for the selected type with a "Change" control, a month calendar
  (bookable / blocked / blank / other days, with today and selected markers and a phone month-strip
  fallback), and a time-slot list. Selecting a bookable day selects it; selecting an available slot
  enables a Continue control that advances to step 3. Month navigation, timezone switch, and "find next
  available" are mocked.

Step 3 — fill details:

- The page shall render a recap chip, a details form (name, email, focus — all required — and optional
  phone), a mocked Stripe payment block shown only for paid sessions, a cancellation-policy block, a
  running total, and a side recap. Submitting advances to the confirmation state.

Confirmation states:

- The page shall render a booked confirmation (summary card, .ics / Google Calendar actions — mocked —
  and reschedule / cancel links), a friendly error state, a cancel-confirmation state, and a reschedule
  state with a quick day picker.
- A mockup-only demo strip shall let a reviewer jump to every step and state.

## Layout

- **Desktop / tablet:** the session grid shows two columns; step 2 and step 3 use a two-column layout.
- **Phone (≤880px):** the step layouts stack to one column; (≤720px) the session grid is one column;
  (≤480px) the calendar swaps to a horizontal month-strip.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
