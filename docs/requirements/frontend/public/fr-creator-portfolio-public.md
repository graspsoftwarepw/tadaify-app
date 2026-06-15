---
id: fr-creator-portfolio-public
title: Public creator Portfolio page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-portfolio-public]
related_files:
  - src/proto/screens/creator-portfolio-public/CreatorPortfolioPublicScreen.tsx
  - src/proto/screens/creator-portfolio-public/creator-portfolio-public-proto.css
  - src/proto/screens/creator-portfolio-public/creatorPortfolioPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-creator-about-public, fr-creator-blog-public, fr-globalui-theme-and-colours]
---

# Public creator Portfolio page

What a visitor sees at `tadaify.com/<handle>/portfolio` — the portfolio sub-page of the creator's main
public page. Ported from `mockups/tadaify-mvp/creator-portfolio-public.html`. Visitors see the creator's
own theme; the colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses the public
page chrome and styling conventions of [fr-public-creator-page](./fr-public-creator-page.md) and is a
sibling of [fr-creator-about-public](./fr-creator-about-public.md) and
[fr-creator-blog-public](./fr-creator-blog-public.md).

The portfolio renders two top-level views, switched via local state (no real routing): the project
**list** (in one of three switchable layouts — masonry, grid, or carousel — and optionally filtered by a
tag) and a **single project** case study. The mockup opened projects through hash routing; the prototype
opens them via local state and replaces the browser back button with an explicit "Back to all work"
control.

## Composition

Inherited chrome:

- The page shall render a creator nav bar with the creator handle (avatar initial + name "Alexandra Silva",
  linking to the main public page) and a row of section links (Home, About, Blog, Portfolio, Book, Contact).
- The current section ("Portfolio") shall be marked as the active link.

List view — hero:

- The page shall render the portfolio title "Selected work" and a lede: "A growing collection of brand
  systems, illustrations, and photography from the last six years. Available for commissions — Lisbon &
  remote."
- A meta line shall show the project count and span ("47 projects · 6 years"), a "Subscribe via RSS" link,
  and an "Email me about a project" link.

List view — controls:

- A layout switcher (segmented control) shall offer Masonry, Grid, and Carousel modes; the active mode is
  highlighted. The default mode is Masonry.
- A sort dropdown shall offer "Newest first" (default), "Oldest first", and "Featured first".
- A tag filter bar shall offer an "All" chip plus chips for `branding`, `illustration`, `photography`, `3D`,
  `video`, and `lettering`. The active chip is highlighted.

List view — masonry layout (default):

- Projects shall render as variable-height cards in a multi-column masonry: a decorative cover (emoji on a
  coloured gradient, sized tall / mid / low), an optional "★ Featured" pin, an optional video duration pill,
  the title, a year/client line, and one or more tag badges.

List view — grid layout:

- The same projects shall render as uniform square-cover cards: cover, optional "★ Featured" pin, title, and
  a compact year + primary-tag line.

List view — carousel layout:

- A single hero stage shall show the current project's cover wash, title, year, client, tag badges, and an
  "Open case study →" button. Previous / next arrows, a dot strip, and a thumbnail strip shall navigate
  between projects.

List view — projects:

- The seeded projects are: "Sourdough & Co — bakery rebrand" (2026, branding/illustration, featured),
  "Norte Bank — onboarding film" (2025, video/branding, featured, 0:42), "Sintra fog — landscape series"
  (2025, photography, featured), "Botanica — calendar lettering" (2025, illustration/lettering), "Cubica —
  3D type explorations" (2024, 3d/branding), "After hours — Lisbon nights" (2024, photography), "Marca Café
  — coffeeshop identity" (2024, branding), "Pétalo — perfume box illustration" (2024, illustration), and
  "Ferrocarril — heritage railway poster set" (2023, branding/lettering).

List view — pagination:

- The masonry and grid layouts shall render a pagination row: a "Showing 1–9 of 47 projects" meta, numbered
  page controls (prev disabled, page 1 current, pages 2–5, next), and a "Load more" button shown on phone
  widths instead of the numbered controls.

List view — empty state:

- When a tag filter matches no projects, the layout body shall be replaced by an empty state: a leaf emoji, a
  heading 'No projects tagged "<tag>" yet', and a "view all projects" link that clears the filter.

Single-project view:

- The view shall render a full-width cover banner, a "Back to all work" link, the project title "Sourdough &
  Co — bakery rebrand", and a meta row with the year ("2026"), medium ("Branding · Illustration"), client
  ("Sourdough & Co"), and three share buttons (copy link, share to X, share via email).
- The article body shall render long-form prose: intro paragraphs, the sections Brief, Process, and Outcome,
  a pull blockquote ("We needed something that doesn't shrink. The old logo only worked at the size we found
  it. The new one had to read on a 5cm sticker and a 2-metre awning."), and a bulleted process list.
- A multi-image gallery shall render clickable thumbnails (Cover — wordmark + crest, Loaf wrapper, Seasonal
  illustration — winter, Loyalty card — pearl + foil, Reusable tote, Wood bread tags) that open a centered
  lightbox modal.
- A "Made with" collaborators block shall show Maya Chen (Co-illustration) and Tomás Reis (Print &
  production).
- An external CTA button shall read "View full case study on Behance".
- The project's own tag chips (`branding`, `illustration`, `lettering`) shall filter the list when clicked.
- A "Related projects" section shall show three compact cards ("Marca Café — coffeeshop identity", "Botanica
  — calendar lettering", "Pétalo — perfume box illustration").

Lightbox:

- The lightbox shall be a centered modal (never a side drawer) showing the selected image's cover wash and
  emoji, a "<n> / <total>" counter, the image name, previous / next controls, and a close button. It shall
  close on the backdrop click, the close button, or Escape, and navigate with the arrow keys.

Footer:

- The page shall render a row of circular social links (Instagram, Behance, Dribbble, Email) and a "Powered
  by tada!ify · get yours free →" note.

## Behaviour

- The layout switcher shall swap the active layout (masonry / grid / carousel) via local state.
- Clicking a tag chip shall filter the visible projects to those carrying that tag, update the active chip
  and the project count, reset the layout to masonry, and (from the single project) return to the list view.
- "All" shall clear the active tag and show every project.
- Clicking a project card, the carousel "Open case study →" button, or a related card shall open the
  single-project view and scroll to top.
- The single-project "Back to all work" link shall return to the list view.
- The carousel arrows, dots, and thumbnails shall change the active slide (wrapping at both ends).
- The gallery thumbnails shall open the lightbox; the lightbox navigates and closes as described above.
- RSS, email, sort, share, external CTA, social, and "Load more" controls are mock affordances (no real
  navigation).

## Layout

- **Desktop (≥901px):** masonry uses three columns; the grid uses three columns; the carousel thumb strip
  shows six columns; the gallery and related grid show three columns.
- **Tablet (561–900px):** masonry and grid collapse to two columns; the carousel thumb strip shows four
  columns; the gallery shows two columns.
- **Phone (≤560px):** masonry, grid, gallery, and related grid collapse to a single column; the carousel
  thumb strip shows three columns; pagination hides the numbered controls and shows the "Load more" button.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-creator-about-public](./fr-creator-about-public.md)
- [fr-creator-blog-public](./fr-creator-blog-public.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
