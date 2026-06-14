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

- The modal shall render the title "Add a block", a search input ("Find a block type…"), a category
  filter dropdown, an "✨" AI suggestions button, and a close button.

Category filter:

- The category dropdown shall list "All categories" plus the real categories (Links, Media, Forms,
  Shop, Layout), each with a count of matching block types — chosen over a tab strip so it does not
  overflow as categories grow.
- "AI ✨" is not a category; the "✨" header button opens the AI suggestions sub-modal.

Block list (grouped compact rows):

- With "All categories" selected, the list shall group blocks under category section headers
  (Links / Media / Forms / Shop / Layout); selecting a single category shows just that category.
- The modal shall render one row per block type — an icon, the label with inline badges
  ("Most clicked", "New", or a tier badge such as "Pro+") on a single line, and a one-line description
  beneath — chosen over a square-card grid so the modal stays compact across devices.
- A row whose tier exceeds the current tier shall render in a locked state with an "Upgrade →" hint;
  unlocked rows show an "Add →" hint on hover (always shown on phone).

- The modal shall render one row per block type — an icon, the label with inline badges
  ("Most clicked", "New", or a tier badge such as "Pro+") on a single line, and a one-line description
  beneath — chosen over a square-card grid so the modal stays compact across devices.
- A row whose tier exceeds the current tier shall render in a locked state with an "Upgrade →" hint;
  unlocked rows show an "Add →" hint on hover (always shown on phone).
- When search or category filtering yields no types, the modal shall render an empty state.

AI suggestions sub-modal:

- The sub-modal shall render the title "AI block suggestions", a quota note, and a list of suggestion
  sets; each set renders a title and a row of block chips. A close button dismisses it.

## Layout

- **Desktop / tablet:** a compact centered modal (max 520px) with a single-column list of block rows;
  the AI sub-modal is centered (max 560px).
- **Phone:** the modal fills the viewport; the same single-column row list is used.

## Related requirements

- [fr-dashboard-my-page](./fr-dashboard-my-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
