---
id: fr-block-editor-modal
title: Block editor modal
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/block-editor]
related_files:
  - src/proto/screens/block-editor/BlockEditorScreen.tsx
  - src/proto/screens/block-editor/block-editor-proto.css
  - src/proto/screens/block-editor/blockEditorFixture.ts
devices: all
related_requirements: [fr-dashboard-my-page, fr-globalui-theme-and-colours, fr-block-picker-modal]
---

# Block editor modal

The block editor opened from the dashboard when a creator edits an existing block. A centered modal
dialog (never a right-side drawer) presenting a type-specific form alongside a live preview, with
inline premium features (A/B testing, schedule visibility) and a per-block analytics drill-down.
Ported from `mockups/tadaify-mvp/app-block-editor.html`; overlays the dashboard
([fr-dashboard-my-page](./fr-dashboard-my-page.md)), shares the block-type catalogue with the block
picker ([fr-block-picker-modal](./fr-block-picker-modal.md)), and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Composition

Shell:

- The editor shall render as a centered modal dialog (max 960px) over a frozen, non-interactive
  dashboard backdrop — never a right-side slide-in drawer.
- The header shall render the block type icon, an "Editing block" label, the block title, a block-type
  switcher (a select grouped by category cycling all block types), and a close button.

Two-column body:

- On desktop/tablet the body shall present two columns — the type-specific form on the left and the
  live preview plus analytics on the right.
- On phone the body shall collapse to a single column; the preview shall sit behind a chevron toggle
  ("Show preview / Hide preview") so the form has full width.

Block types and forms:

- The editor shall support every block type: Link button, Image, Embed, Heading / text, Divider,
  Social icons row, Newsletter signup, Product, Video, FAQ / accordion, Custom HTML, and Countdown
  timer.
- Selecting a block type in the switcher shall replace the form fields and the preview with that
  type's definition and re-seed both A/B variants from the type defaults.
- The form shall render every field kind the type declares: text, url, link-target, icon-picker,
  check (toggle), thumb, upload, select, social-cards, theme-color-picker, faq-items, code, and
  datetime, plus the bespoke embed-detect chip, embed-provider reminder, and newsletter
  provider/schedule/A-B panels.
- Each field marked AI-enabled shall render a "✨ Suggest" affordance that opens the AI copy
  suggestions sub-modal targeting that field.

Icon picker:

- The icon picker field shall present a trigger showing the current glyph and a popover with a search
  input, category tabs (Popular, Social, Music & Video, Shop & Money, Communication, Content,
  Generic), an icon count, and a glyph grid. Brand glyphs render in their own brand colour; generic
  glyphs render monochrome.

Social icons row:

- The social-cards field shall let the creator add platforms from a searchable picker, edit each
  platform's handle, choose a per-platform icon style from a style popover, reorder cards by drag, and
  remove a card. An empty state shall prompt the creator to add their first platform.

A/B testing:

- The Content section shall always render Variant A | B tabs and an A/B section chip that reads
  "A/B test available" when the variants match and "A/B test active · N fields" when Variant B
  differs.
- An educational explainer shall always be visible describing the 50/50 split and automatic winner
  promotion.
- When Variant B is active and the current tier is below Business, an inline tier callout shall appear
  above the fields; the fields shall remain fully editable (premium features are never blurred or
  disabled).
- When Variant B is active, a helper bar shall offer "Copy A → B" and "Reset B to match A".
- When Variant B differs from A, a win-criteria footnote shall summarise the differing field count and
  promotion rule.

Live preview:

- The preview shall render the current block type from the active form state.
- When Variant B matches A, the preview shall show a single pane of the active variant.
- When Variant B differs, the preview shall show a dual A/B pair with a "Both / A only / B only"
  picker and a diff summary listing each differing field's A and B values.
- The preview shall reflect the visibility toggle (a hidden flag when the block is set not visible).

Schedule visibility:

- A Schedule visibility section (Creator+) shall offer "Show from" and "Hide after" datetime inputs
  with help text and a tier hint shown only when the current tier is below Creator.

Analytics:

- An analytics drill-down section shall show today, last-7-days, and top-source figures for the block,
  a "View in Insights" link, and a "↑ Trending" pill for trending blocks.

Actions and footer:

- The form shall include Duplicate and Delete actions; the footer shall show a save-status hint plus
  Discard and Save buttons.

Demo tier toolbar:

- A demo toolbar shall switch the previewed tier (Free / Creator / Pro / Business), toggling the
  inline tier badges and hint copy while keeping every premium UI fully visible and editable.

Sub-modals:

- The AI copy suggestions sub-modal shall present a quota hint and a list of suggestion options; tapping
  one applies it to the target field.
- The Delete confirm sub-modal shall require the creator to type a confirmation phrase before the
  destructive "Delete block" button is enabled.

Dismissal:

- The close button, a click on the backdrop, and the Escape key shall dismiss the editor and return to
  the dashboard. While a sub-modal or the icon picker popover is open, Escape shall close that first.

## Layout

- **Desktop / tablet:** centered modal (max 960px), two-column body (form + preview).
- **Phone:** the modal fills the viewport; single column with the preview behind a chevron toggle.

## Related requirements

- [fr-dashboard-my-page](./fr-dashboard-my-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
- [fr-block-picker-modal](./fr-block-picker-modal.md)
