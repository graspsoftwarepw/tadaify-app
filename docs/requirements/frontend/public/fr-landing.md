---
id: fr-landing
title: Marketing landing page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/landing]
related_files:
  - src/proto/screens/marketing/LandingScreen.tsx
  - src/proto/screens/marketing/landingFixture.ts
  - src/proto/screens/marketing/landing-proto.css
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Marketing landing page

The public marketing landing page a logged-out visitor sees at the top of the funnel. Ported from
`mockups/tadaify-mvp/landing.html` (Indigo Serif v2, Phase A three-flagships). Colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md) so the page renders in both
light and dark. The page renders inside the shared marketing shell (`MarketingChrome` — sticky top nav with
brand wordmark, section links, Login/Claim CTAs, a mobile drawer toggle, and the dark footer). That shell is
shared marketing infrastructure and is documented here in prose only, not listed as a related file.

## Composition

Shared shell:

- The page shall render inside the shared marketing chrome (top nav + footer). The "Pricing" nav link and
  footer "Pricing" link shall target the pricing page; "Login" shall target the login route and "Claim your
  handle" the register route. Marketing sub-pages with no prototype screen yet (Templates, Trust, Docs, and
  the remaining footer links) shall be mocked, never dead links.

Hero + handle claim:

- The page shall render a hero with an eyebrow pill, a headline, a sub-headline, and a handle-claim form.
- The claim form shall validate the typed handle live: it shall reject handles shorter than 3 or longer than
  30 characters, double hyphens, characters outside `[a-z0-9-]`, leading/trailing hyphens, a reserved list,
  and a taken list; otherwise it shall report the handle as available after a short debounce.
- The form shall show a live preview of the resulting `tadaify.com/<handle>` URL, muted until the visitor
  types.
- Submitting a valid handle shall route to the register flow with the handle as a query parameter; submitting
  an invalid handle shall surface the validation message and block navigation.
- The page shall render the same claim form a second time in the final call-to-action band.

Body sections:

- The page shall render, in order: a social-proof strip, a clickable real-creator showcase (each card links
  to the public creator page), an "everything on Free" comparison table, a three-feature band, three flagship
  pillars (privacy-first, Creator API with a code sample, most-generous-Free with a competitor matrix and an
  upgrade-tier strip), a "why creators choose tadaify" wedge row, an upsell-philosophy card, and a six-item
  FAQ accordion.
- The privacy pillar and each FAQ entry shall be expandable; expanding one reveals its detail.

## Layout

- **Desktop (≥1024px):** the hero is two columns; the creator showcase is five columns; feature/wedge bands
  are three columns; the top-nav section links are visible inline.
- **Tablet / phone:** grids collapse toward one or two columns; the top-nav section links collapse into a
  mobile drawer toggled by a local menu button. Nothing overflows at 390px.

## Related requirements

- [fr-pricing](./fr-pricing.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
