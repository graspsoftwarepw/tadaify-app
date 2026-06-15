---
id: fr-feedback
title: Feedback
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/feedback]
related_files:
  - src/proto/screens/feedback/FeedbackScreen.tsx
  - src/proto/screens/feedback/feedbackFixture.ts
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Feedback

The creator-facing surface a creator opens from the "Feedback" entry at the bottom of the
dashboard sidebar, ported from `mockups/tadaify-mvp/app-feedback.html`. It lets a creator send
feedback, a bug report, or a feature idea to the tadaify product team. It renders inside the creator
dashboard chrome (appbar + sidebar, [fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md))
and uses the global colour tokens ([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

Submission, attachments and public roadmap voting are out of scope for this iteration; the surface
proves the route exists and shows the shape of the form.

## Shell

- The screen shall render inside the shared dashboard chrome (appbar + sidebar), with the sidebar
  "Feedback" entry marked as the current navigation item.
- A page header shall show the title "Feedback" and a one-line sub-description explaining that the
  product team reads everything.

## Quick-pick cards

- The screen shall show three quick-pick cards — "Report a bug" (🐞), "Suggest a feature" (💡), and
  "General feedback" (💬) — each with a tinted icon tile, a title, and a one-line description.
- Each card carries its own accent tint (primary, warm, success).
- Activating a card shall pre-select the matching topic in the form's "What is this about?" select
  and smooth-scroll the page to the feedback form.

## Feedback form

- A "Send us feedback" form shall contain: a "What is this about?" topic select (Bug report / Feature
  idea / General feedback), a "Short title" text input, a "Tell us more" textarea, a checkbox opting
  in to a reply at the account address (on by default), and a sub-line offering a `support@tadaify.com`
  mailto link for urgent issues.
- The form shall expose a primary "Send feedback" submit action and a "Cancel" link back to the
  dashboard. Submission is mocked: it prevents the default and shows a placeholder confirmation.

## Theming & responsiveness

- The screen shall render correctly in light and dark themes via the shared colour tokens.
- The quick-pick cards shall stack on phone widths and lay out in three columns on wider screens; the
  form shall stay within a single readable column and shall not overflow at a 390px viewport.
