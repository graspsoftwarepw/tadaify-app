---
id: fr-pricing
title: Marketing pricing page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/pricing]
devices: all
related_requirements: [fr-globalui-theme-and-colours]
related_files:
  - src/proto/screens/marketing/PricingScreen.tsx
  - src/proto/screens/marketing/pricingFixture.ts
  - src/proto/screens/marketing/pricing-proto.css
---

# Marketing pricing page

The public pricing page a logged-out visitor reaches from the marketing nav. Ported from
`mockups/tadaify-mvp/pricing.html` (v2 Phase A). Colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md) so the page renders in both
light and dark. The page renders inside the shared marketing shell (`MarketingChrome` — top nav + footer),
which is shared marketing infrastructure documented here in prose only, not listed as a related file.

## Composition

Shared shell:

- The page shall render inside the shared marketing chrome. Tier and call-to-action buttons shall route to the
  register flow (carrying the chosen plan as a query parameter) or the login flow; "Contact support" and
  "View API docs" shall be mocked actions, never dead links.

Hero + billing toggle:

- The page shall render a hero with a no-trials pill, a headline, a lede, and a price-lock-for-life banner.
- The page shall render an annual/monthly billing toggle; switching shall update each paid tier's cadence
  label (the Free tier keeps its "forever" cadence).

Tier grid:

- The page shall render four tier cards (Free, Creator, Pro, Business) with price, cadence, tagline, and a
  feature list; the Creator card is marked most-popular and the paid cards carry a locked-for-life badge.
- The page shall render a universal domain add-on banner and an AI-credits explainer below the grid.

Comparison + remaining sections:

- The page shall render a quick-scan compare matrix grouped by category (horizontally scrollable when it
  exceeds the viewport), a Creator-API spotlight, an expandable per-category full-comparison accordion, an
  optional made-with badge section, a pricing FAQ accordion, and a final call-to-action band.
- The page shall render a sticky bottom call-to-action bar that appears after the visitor scrolls past the
  tier grid and hides again when scrolled back to the top.

## Layout

- **Desktop (≥1080px):** the tier grid is four columns.
- **Tablet (≤1080px):** the tier grid is two columns.
- **Phone (≤640px):** the tier grid is a single column; the compare matrix scrolls horizontally. Nothing
  overflows at 390px.

## Related requirements

- [fr-landing](./fr-landing.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
