---
id: fr-tier-gate-modal
title: Tier gate modal
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/tier-gate-modal]
related_files:
  - src/proto/screens/tier-gate-modal/TierGateModalScreen.tsx
  - src/proto/screens/tier-gate-modal/tier-gate-modal-proto.css
  - src/proto/screens/tier-gate-modal/tierGateFixture.ts
devices: all
related_requirements: [fr-block-editor-modal, fr-globalui-theme-and-colours]
---

# Tier gate modal

The single shared upsell scene in tadaify, shown at Save when a configured feature needs a higher
subscription tier than the creator currently has. Premium features stay fully visible and interactive
everywhere else in the editors — the gate happens only here, at save. Ported from
`mockups/tadaify-mvp/app-tier-gate-modal.html`; overlays the dashboard
([fr-block-editor-modal](./fr-block-editor-modal.md)) and uses the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Composition

Header:

- The modal shall render a friendly headline "Just one step — <feature> needs <tier>" (the feature
  name and required tier reflect the trigger; for a role gate the tier reads "Admin role") and a close
  button.

Body:

- The modal shall render a context section ("You set up:" / "You tried to:") listing what the creator
  configured, a tier panel for the lowest tier that covers every gated feature (tier pill, plan name,
  price reflecting the billing cycle, and 5–7 plan highlights), a draft-reassurance note ("Your work
  is saved as draft"), and, when a meaningful partial save exists, a "save without <feature>" link.

Triggers (gated features):

- The modal shall reproduce the per-feature triggers from the mockup: A/B testing (Free → Business),
  custom domain (Free → Creator), team invite (Pro → Business), far-future scheduling (Free →
  Creator), Klaviyo custom fields (Pro → Business), a multi-feature trigger, an already-covered case,
  and an admin-role gate. The required tier shown is the highest required across the trigger's
  features.

Checkout states:

- The modal shall reproduce the default, loading-checkout (primary button shows a spinner +
  "Opening checkout…", other controls disabled), checkout-success (celebration + "Continue → Publish"),
  and checkout-cancel (friendly "still saved as draft" + "Try upgrade again" / "Save as draft and
  exit") states.
- When the current tier already covers every feature, no modal opens — a confirmation toast is shown
  instead.
- Because the mockup presented triggers and states as static comparison frames, they are reproduced
  here only behind an explicit, clearly labelled in-view "mockup states" switcher (trigger + checkout
  state) — never as the page's real content.

Footer:

- For an upgrade gate the footer shall render a "Save as draft" action, a monthly/yearly billing
  toggle (yearly bills 10 months and shows the annual saving), and a warm "Upgrade — $<price>/mo"
  button. For the admin-role gate the footer shall render "Cancel invite" and "Notify <owner>".

Dismissal:

- The close button, a click on the backdrop, the Escape key, and "Save as draft" / Cancel shall
  dismiss the modal and return to the dashboard. From the loading-checkout state, close/Escape/backdrop
  first fall back to the checkout-cancel state.

Mock actions:

- Upgrade advances to the loading-checkout state; save-as-draft, partial save, continue-publish,
  notify-owner, and the upgrade-flow entry points are mocked (alert) and return to the dashboard.

## Layout

- **Desktop / tablet:** a centered modal (max 640px).
- **Phone:** the modal fills the viewport; the footer stacks vertically.

## Related requirements

- [fr-block-editor-modal](./fr-block-editor-modal.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
