---
id: fr-product-public
title: Public single Product page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/product-public]
related_files:
  - src/proto/screens/product-public/ProductPublicScreen.tsx
  - src/proto/screens/product-public/product-public-proto.css
  - src/proto/screens/product-public/productPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public single Product page

What a buyer sees at `tadaify.com/<handle>/p/<slug>` — a per-product landing page with full sales copy
and an inline checkout, so the buyer never leaves the creator's page. Ported from
`mockups/tadaify-mvp/product-public.html`. Buyers see the creator's own theme; colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md).

## Composition

Chrome:

- Unlike the creator sub-pages, the product page does not render the shared creator nav. It shall render
  its own minimal chrome: a back-bar (back link to the creator's page, the product url pill, and the
  theme toggle) and a tada!ify wordmark attribution near the checkout, both reusing the shared brand
  components described in [fr-public-creator-page](./fr-public-creator-page.md).

Hero and sales copy:

- The page shall render a hero banner with a promotional badge, the product title, and a sub-line.
- The page shall render a creator strip (avatar, name, role, link back to the creator page), the product
  subtitle, a price row (current price, struck-through original, discount pill), an Instagram
  social-proof embed, multi-paragraph sales copy, an outcomes checklist, and a reviews grid.

Inline checkout:

- The page shall render a checkout card with name (required) and email (required) fields, an opt-in
  upsell that is unchecked by default, a discount-code field with a mocked Apply button, a mock card
  field with a Stripe note, a live order summary, a required terms-agreement checkbox, a purchase
  button, and a secure-checkout note.
- Ticking the upsell shall add its line to the order summary and update both the summary total and the
  purchase-button amount; un-ticking shall revert them.
- Submitting the checkout is mocked: it confirms a successful payment for the current total rather than
  charging. The Apply and Terms actions are mocked.

## Layout

- **Desktop (≥920px):** a two-column shell with the sales copy beside a sticky checkout column.
- **Phone / tablet (<920px):** the shell collapses to a single column and the checkout is no longer
  sticky; the reviews grid collapses to a single column on the narrowest screens.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
