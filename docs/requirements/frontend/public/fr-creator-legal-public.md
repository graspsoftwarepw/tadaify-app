---
id: fr-creator-legal-public
title: Public creator Legal page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-legal-public]
related_files:
  - src/proto/screens/creator-legal-public/CreatorLegalPublicScreen.tsx
  - src/proto/screens/creator-legal-public/creator-legal-public-proto.css
  - src/proto/screens/creator-legal-public/creatorLegalPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Legal page

What a visitor sees at `tadaify.com/<handle>/legal` — a single compliance-readable page that renders
every published policy (Terms, Privacy, Cookie, Refund, DMCA). Ported from
`mockups/tadaify-mvp/creator-legal-public.html`. Visitors see the creator's own theme; colour tokens
come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses
the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav and footer. Legal is not a canonical nav section, so no
  nav link is marked as the current page; the url pill shows the `legal` slug.

Hero:

- The page shall render a page hero with the title, a lede, and a meta line showing the last-reviewed
  date, the policy count, and available languages.

Policy chooser and table of contents:

- The page shall render a policy chooser (one pill per policy) and a table of contents listing each
  policy with its sub-sections. Choosing a policy from the chooser or the table of contents focuses the
  page on that single policy; choosing it again, or the "All policies" control, returns to the full list.

Policy sections:

- The page shall render each policy with an icon, title, version chip, effective date, an optional note,
  and a body of headings, paragraphs, lists, and block quotes.
- Each policy shall render a footer with its permalink and, where past versions exist, a collapsible
  version-history list; expanding it reveals each archived version's range and a mocked "View archived"
  action.
- The copy-permalink, single-policy, print, copy-page-link, and view-archived actions are mocked: they
  confirm the intended action rather than navigating away.

Page footer:

- The page shall render a last-reviewed / next-review line and a mocked direct-contact email.

Mockup states:

- The page shall render an in-view state strip letting a reviewer switch between all policies and any
  single-policy focus, mirroring the sub-views a visitor reaches via the chooser or table of contents.

## Layout

- **Desktop (≥960px):** a sticky table-of-contents sidebar sits beside the policy content column.
- **Phone / tablet (<960px):** the layout collapses to a single column with the contents above the
  policies.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
