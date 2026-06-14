---
id: fr-block-picker-modal
title: Block picker modal
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/block-picker]
related_files:
  - src/proto/screens/block-picker/BlockPickerScreen.tsx
  - src/proto/screens/block-picker/block-picker-proto.css
  - src/proto/screens/block-picker/blockPickerFixture.ts
devices: all
related_requirements: [fr-dashboard-my-page, fr-globalui-theme-and-colours]
---

# Block picker modal

The "Add a block" modal opened from the dashboard. A searchable, category-filtered gallery of block
types. Ported from `mockups/tadaify-mvp/app-block-picker.html`; overlays the dashboard
([fr-dashboard-my-page](./fr-dashboard-my-page.md)) and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

`status: proposed` — the render-baseline e2e is deferred to the dedicated Playwright batch.

## Composition

Header:

- The modal shall render the title "Add a block", a search input ("Find a block type…"), and a close button.

Category tabs:

- The modal shall render a tab row: All, Links, Media, Forms, Shop, Layout, and "AI ✨".
- Each tab except "AI ✨" shall render a count of matching block types; the active tab is highlighted.
- Selecting "AI ✨" shall open the AI suggestions sub-modal.

Card grid:

- The modal shall render a card per block type: an icon, the label, a description, and badges
  ("Most clicked", "New", or a tier badge such as "Pro+").
- A card whose tier exceeds the current tier shall render in a locked state with an "Upgrade →" hint;
  unlocked cards show an "Add →" hint on hover.
- When search or category filtering yields no types, the modal shall render an empty state.

Footer:

- The modal shall render a "Drag to reorder blocks after adding." note and a "Browse our templates" link.

AI suggestions sub-modal:

- The sub-modal shall render the title "AI block suggestions", a quota note, and a list of suggestion
  sets; each set renders a title and a row of block chips. A close button dismisses it.

## Layout

- **Desktop:** centered modal (max 720px), three-column card grid, sub-modal centered (max 560px).
- **Tablet:** two-column card grid.
- **Phone:** the modal fills the viewport; the card grid collapses to a single column.

## Related requirements

- [fr-dashboard-my-page](./fr-dashboard-my-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
