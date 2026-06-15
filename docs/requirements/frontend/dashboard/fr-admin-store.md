---
id: fr-admin-store
title: Administration — Store
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-store]
related_files:
  - src/proto/screens/admin-store/AdminStoreScreen.tsx
  - src/proto/screens/admin-store/adminStoreFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Administration — Store

The creator-facing admin page a creator opens at Administration > Store, ported
from `mockups/tadaify-mvp/app-admin-store.html`. Native commerce — Stripe
Connect, product CRUD, checkout, and orders — ships in tadaify v2; the MVP only
ships the Product block that links to a creator's external store. This page
therefore renders a single coming-soon / empty state regardless of whether the
creator has added any "Store" affordance, because the Store page itself is not
in the MVP. It renders inside the creator dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) and uses the
global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome (appbar + sidebar)
  with the Administration > Store sidebar sub-item — which carries a "v2"
  pill — marked as the active navigation entry.
- A breadcrumb shall read "Dashboard / Administration · Store", with "Dashboard"
  linking back to the creator dashboard.
- The page header shall show the emoji "🛍", the title "Store" with a "v2" chip,
  and the one-line description "Native commerce, products, inventory, and orders
  ship in tadaify v2."

## v2 hero

- A centred, dashed-border hero shall show a large store icon, a timeline pill
  reading "⏱ Targeting v2 · later this year", the headline "Native Store comes
  in v2", and an explanatory paragraph directing the creator to sell through
  their existing store (Shopify, Stripe Payment Links, Etsy, Gumroad, Lemon
  Squeezy, or any URL) by adding a Product block.
- The hero shall offer two actions: a primary "＋ Add a Product block now" link
  to the block editor and a ghost "Browse other blocks" link to the block
  picker.

## Notify-me signup card

- A card shall offer "Get notified when Store ships" with the sub-line "One
  email when v2 launches with native commerce. No promo, no spam." and an email
  input plus a "Notify me" submit button.
- Submitting the form shall clear the input and surface a mock confirmation; no
  email is sent in the prototype.

## "What's coming in v2"

- A heading "What's coming in v2" shall introduce a responsive grid of feature
  cards, each with an icon, a name, and a description: Product CRUD, Stripe
  Connect checkout, Orders inbox, Sales analytics, Shipping & digital, and
  Discount codes.

## Cross-link

- A closing cross-link card ("In the meantime — use the Product block") shall
  explain that the Product block can link to any external store URL and offer an
  "Open block editor" action linking to the block editor.

## Theming & responsiveness

- The screen shall render correctly in light and dark themes and adapt across
  desktop, tablet, and phone widths (the hero, signup card, feature grid, and
  cross-link reflow on narrow screens without horizontal overflow).
