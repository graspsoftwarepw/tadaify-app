---
id: fr-error-pages
title: Error and edge-case pages
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/error-pages]
related_files:
  - src/proto/screens/error-pages/ErrorPagesScreen.tsx
  - src/proto/screens/error-pages/errorPagesFixture.ts
  - src/proto/screens/error-pages/error-pages-proto.css
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Error and edge-case pages

The error / edge-case states a visitor or signed-in creator may hit across tadaify. Ported from
`mockups/tadaify-mvp/error-pages.html`, which showcases ten distinct states. Colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md); each state re-themes in
light and dark automatically.

## States

The screen shall reproduce all ten states, each as a centred hero card with a decorative illustration,
an eyebrow pill, a heading, a lead paragraph, action buttons, and (where applicable) a secondary help
note:

1. **404 — handle not found.** Heading "We can't find that creator", a creator search box, three
   popular-creator suggestions, a claim-handle action, and a back-home action.
2. **404 — handle released.** Heading "This handle was released", explaining the 30-day redirect grace
   period after a handle change, with claim and search actions.
3. **500 — server error.** Heading "Something broke on our side", a status row linking to the status
   page, retry and back-home actions, and a collapsible request-ID + stack-trace details block.
4. **Maintenance mode.** Heading "tadaify is under maintenance", an admin-set reason row, a live
   countdown (hours/minutes/seconds), a restoration progress bar, an estimated-end note, social/status
   links, and an admin-bypass note.
5. **Offline (PWA).** Heading "No connection right now", a list of cached resources with timestamps, and
   try-again / cached-home actions.
6. **403 — permission denied.** Heading "You don't have access here", a logged-in user row, and
   dashboard / request-access / sign-out actions.
7. **Subscription expired.** Heading "This page is taking a quick break", a creator-friendly inactive
   notice (never blaming the visitor for creator billing), with discover and sign-up actions plus a
   sign-in note for the affected creator.
8. **Account suspended.** Heading "Your account is on hold", an appeal preview (reason category,
   reviewer notes, case reference), and submit-appeal / sign-out actions.
9. **429 — rate limited.** Heading "You're moving fast!", a live retry-after pill, retry / dashboard
   actions, and an inline Pro rate-limit hint (no popup, no upgrade banner).
10. **404 — block deleted.** Heading "This link has been removed", with visit-page and browse actions and
    a bookmark-the-handle note.

## State switcher

- The screen shall render a clearly-labelled state switcher (a select in the top bar) that lets a
  reviewer flip between all ten states. This mirrors the mockup's own showcase of distinct states; it is
  not a set of competing design variants of one screen.
- The top bar shall render the locked tada!ify wordmark and a light/dark theme toggle.

## Behaviour

- The single "go home" / "back to tadaify" action per state shall link to the landing prototype route.
- All other actions (claim, search, retry, request access, sign out, appeal, external links, etc.) are
  mockup-only and shall raise a prototype alert without navigating.
- The maintenance countdown and the 429 retry-after pill shall tick down live; the retry-after pill loops
  for demo purposes.
- The 500 state's details block shall expand to reveal the request ID and a development stack trace.

## Layout

- **Desktop / tablet:** the hero card is centred and capped (wider for the maintenance state); creator
  suggestions show three columns.
- **Phone (≤600px):** creator suggestions collapse to two columns.
- **Phone (≤540px):** action buttons stack full-width. No horizontal overflow at 390px.

## Related requirements

- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
