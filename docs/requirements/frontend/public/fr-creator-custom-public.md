---
id: fr-creator-custom-public
title: Public creator Custom page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-custom-public]
related_files:
  - src/proto/screens/creator-custom-public/CreatorCustomPublicScreen.tsx
  - src/proto/screens/creator-custom-public/creator-custom-public-proto.css
  - src/proto/screens/creator-custom-public/creatorCustomPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Custom page

What a visitor sees at a creator-named URL such as `tadaify.com/<handle>/press-kit` — a custom page
that renders the creator's block list as a vertical stack, the same patterns as the homepage block
render but at a creator-defined slug. Ported from `mockups/tadaify-mvp/creator-custom-public.html`.
Visitors see the creator's own theme; colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses the shared
public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav and footer. A custom slug is not a canonical nav section,
  so no nav link is marked as the current page; the url pill shows the custom slug.

Page hero:

- The page shall render a page hero with the page title and an optional sub-line, both taken from the
  page settings.

Block stack:

- The page shall render the creator's ordered block list, supporting at least: a hero image block, a
  heading block (H1/H2/H3 with an optional sub-line), link-button blocks (with optional meta and a warm
  call-to-action variant), a divider, an accordion (each row expands to reveal its answer), and an inline
  newsletter signup block.
- Link buttons and the newsletter submit are mocked: clicking them confirms the intended action rather
  than navigating away.

Mockup states:

- The page shall render three mockup-only states reachable from an in-view state strip: the full page
  with all blocks, a password-gate state, and an empty-page placeholder.
- In the password-gate state, submitting the correct password reveals the full page; an incorrect
  password shows an inline error.
- In the empty-page placeholder, the page shall offer links to the creator's other pages.

## Layout

- **Desktop / tablet:** the block stack is centred in a single readable column.
- **Phone (≤600px):** block padding and gaps tighten; the layout stays single-column.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
