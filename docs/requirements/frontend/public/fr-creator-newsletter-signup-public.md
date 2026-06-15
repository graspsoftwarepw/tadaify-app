---
id: fr-creator-newsletter-signup-public
title: Public creator Newsletter signup page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-newsletter-signup-public]
related_files:
  - src/proto/screens/creator-newsletter-signup-public/CreatorNewsletterSignupPublicScreen.tsx
  - src/proto/screens/creator-newsletter-signup-public/creator-newsletter-signup-public-proto.css
  - src/proto/screens/creator-newsletter-signup-public/creatorNewsletterSignupPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Newsletter signup page

What a visitor sees at `tadaify.com/<handle>/subscribe` — a focused, single-purpose newsletter conversion
page in the Substack/Beehiiv landing tradition. Ported from
`mockups/tadaify-mvp/creator-newsletter-signup-public.html`. Visitors see the creator's own theme; colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page
reuses the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav and footer. The subscribe page is not a canonical nav
  section, so no nav link is marked as the current page; the url pill shows the `subscribe` slug.

Hero + trust:

- The page shall render a hero with a cover icon, a heading and a lede, plus a provider trust strip
  (provider, GDPR note, unsubscribe note).

Signup form:

- The page shall render exactly ONE signup form in the layout the creator selected in their dashboard
  editor (one-line, two-line, or centred card — sourced from the fixture's `chosenLayout`), with an
  email input and a consent checkbox. The layout choice belongs to the editor; the public page never
  shows a layout comparison. The prototype's chosen layout is the centred card.
- Submitting the form shall show a submitting state that auto-advances to a success state. The
  page shall also offer an "already subscribed" state and an error state with a retry and a direct email
  fallback.
- A mockup-only state strip shall let a reviewer switch between the default landing and every confirmation
  state.

Supporting sections:

- The page shall render a social-proof block (subscriber count + reader quotes), a "what you'll get" list,
  a recent-issues preview grid, an FAQ accordion, and a closing call-to-action that focuses the signup
  form.

## Layout

- **Desktop / tablet:** the proof quotes show two columns and the recent-issues grid shows three.
- **Phone (≤640px / ≤760px):** the proof quotes and the recent-issues grid collapse to a single column;
  the one-line form stacks vertically (≤540px).

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
