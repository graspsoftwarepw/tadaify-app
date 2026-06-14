---
id: fr-creator-about-public
title: Public creator About page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-about-public]
related_files:
  - src/proto/screens/creator-about-public/CreatorAboutPublicScreen.tsx
  - src/proto/screens/creator-about-public/creator-about-public-proto.css
  - src/proto/screens/creator-about-public/creatorAboutPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator About page

What a visitor sees at `tadaify.com/<handle>/about` — a long-form About sub-page of the creator's main
public page. Ported from `mockups/tadaify-mvp/creator-about-public.html`. Visitors see the creator's own
theme; the colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses the public
page chrome and styling conventions of [fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render a creator nav bar with the creator handle (avatar initial + name, linking to the
  main public page) and a row of section links (Home, About, Blog, Portfolio, Book, Contact).
- The current section ("About") shall be marked as the active link.

Hero:

- The page shall render a large circular hero photo (creator initial), the display name, a tagline, and a
  social-proof row showing the handle, follower count, and the year the creator started.

Bio:

- The page shall render a "My story" heading followed by long-form bio paragraphs, with optional
  emphasised (italic, muted) inline copy.

Highlights:

- The page shall render a "Highlights" heading and a grid of highlight cards, each with an icon, a value,
  and a caption.

Story timeline:

- The page shall render a "The road here" heading and a vertical timeline of entries, each with a year
  marker, a title, and a body. On desktop, entries alternate left and right of a centre rail.

Press carousel:

- The page shall render an "In the press" heading and a carousel of press quotes, each with the quote, a
  source icon (with an optional warm or mint tint), and the source attribution.
- The carousel shall support dot navigation that selects a slide, and shall auto-advance between slides.
- Auto-advance shall pause while the carousel is hovered or focused and shall not run when the visitor
  prefers reduced motion.

Contact CTA:

- The page shall render a "Get in touch" eyebrow, a "Want to train together?" heading, and a "Work with
  me" call-to-action button linking back to the main public page.

Footer:

- The page shall render a row of circular social links and a "made with tada!ify" powered-by note.

## Layout

- **Desktop / tablet (≥760px):** the hero is a two-column grid (photo beside text); the highlights grid
  shows three columns; the timeline alternates entries across a centre rail.
- **Tablet (≤760px):** the hero stacks and centres; the highlights grid drops to two columns.
- **Phone (≤600px):** the highlights grid collapses to a single column; the timeline collapses to a single
  left-rail column; the press carousel falls back to a horizontal scroll-snap strip with the dots hidden.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
