---
id: fr-ai-suggest-modal
title: AI suggest modal
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/ai-suggest-modal]
related_files:
  - src/proto/screens/ai-suggest-modal/AiSuggestModalScreen.tsx
  - src/proto/screens/ai-suggest-modal/ai-suggest-modal-proto.css
  - src/proto/screens/ai-suggest-modal/aiSuggestFixture.ts
devices: all
related_requirements: [fr-block-editor-modal, fr-globalui-theme-and-colours]
---

# AI suggest modal

The ✨ Suggest sub-modal opened from a short-text field (title, caption, button label) in the block
editor. It reads the field's surrounding context and returns five short alternatives in different
tones. Ported from `mockups/tadaify-mvp/app-ai-suggest-modal.html`; overlays the dashboard
([fr-block-editor-modal](./fr-block-editor-modal.md)) and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Composition

Header:

- The modal shall render a ✨ icon, the title "AI suggestions for <field>" (the field name reflects
  the triggering field), and a close button.

Cost transparency strip:

- For metered tiers (Free, Creator) the modal shall render a usage strip under the header showing
  "<used> of <limit> suggestions today", a progress bar, and a reset-at-midnight note. The strip
  shifts neutral → amber when 2 or fewer remain → red when none remain.
- For unlimited tiers (Pro, Business) the cost strip shall be hidden entirely.

Body:

- The modal shall render a context strip (what the AI is basing suggestions on — block type plus a
  monospaced URL / filename / alt-text detail) and an optional free-text "Add context for AI" field.
- In the loaded state the modal shall render five suggestion cards, each with an index, the suggested
  copy, and a tone tag (Direct / Playful / Friendly / Professional / Curious); selecting a card marks
  it as chosen.

States:

- The modal shall reproduce the loaded, loading (shimmer skeletons), error (with a "Try again"
  action), empty (no input yet), and out-of-quota (hard-block with reset countdown, an upgrade
  prompt, and a "why is there a limit" disclosure) states. The error "Try again" returns to the
  loaded state. Because the mockup presented these as static comparison frames, they are reproduced
  here only behind an explicit, clearly labelled in-view "mockup states" switcher (alongside a field
  and tier switcher) — never as the page's real content.

Footer:

- The modal shall render a "Refresh" action (labelled as using 1 of the daily quota), a "Cancel"
  action, and a primary "Use this" action; "Use this" is disabled outside the loaded state.

Dismissal:

- The close button, a click on the backdrop, the Escape key, and Cancel shall dismiss the modal and
  return to the dashboard.

Mock actions:

- Refresh, Upgrade, and applying a suggestion ("Use this") are mocked (alert); "Use this" then closes.

## Layout

- **Desktop / tablet:** a centered modal (max 560px) with a single-column suggestion list.
- **Phone:** the modal fills the viewport; the same single-column list is used.

## Related requirements

- [fr-block-editor-modal](./fr-block-editor-modal.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
