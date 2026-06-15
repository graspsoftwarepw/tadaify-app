---
id: fr-creator-contact-public
title: Public creator Contact page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-contact-public]
related_files:
  - src/proto/screens/creator-contact-public/CreatorContactPublicScreen.tsx
  - src/proto/screens/creator-contact-public/creator-contact-public-proto.css
  - src/proto/screens/creator-contact-public/creatorContactPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Contact page

What a visitor sees at `tadaify.com/<handle>/contact` — a focused inquiry-capture page. Ported from
`mockups/tadaify-mvp/creator-contact-public.html`. Visitors see the creator's own theme; colour tokens
come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses
the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav with the "Contact" link marked as the current page, and
  the shared footer with social links and a made-with-tada!ify note.

Hero:

- The page shall render a rounded hero icon, a "Let's work together." heading, and a lede setting reply
  expectations.

Office hours:

- The page shall render an office-hours strip with a status dot and the creator's reply window.

FAQ quick-reference:

- The page shall render a small accordion of the three most common questions; expanding one reveals its
  answer.

Inquiry form:

- The page shall render a form with name (required), email (required, with a privacy helper), subject,
  inquiry type (select), message (required), a GDPR consent checkbox (required), and a hidden honeypot
  field.
- Submitting with any required field empty shall mark those fields invalid and block submission.
- Submitting with the honeypot filled shall route to a mockup-only "honeypot caught" state explaining the
  spam-prevention path.
- A valid submission shall show a submitting state that auto-advances to a success state with a message ID
  and related links; a separate error state offers retry and a direct email fallback.
- A mockup-only state strip shall let a reviewer switch between the default form and every confirmation
  state.

Other contact methods:

- The page shall render a grid of contact-method cards (email, phone, WhatsApp, Instagram), an address
  card with a map placeholder, and an inline social strip.

## Layout

- **Desktop / tablet:** the form and other-methods grids show two columns.
- **Phone (≤540px):** the form, methods grid, and address card collapse to a single column.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
