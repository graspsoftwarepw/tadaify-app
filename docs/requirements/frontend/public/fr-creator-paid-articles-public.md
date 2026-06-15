---
id: fr-creator-paid-articles-public
title: Public creator Paid articles listing page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-paid-articles-public]
related_files:
  - src/proto/screens/creator-paid-articles-public/CreatorPaidArticlesPublicScreen.tsx
  - src/proto/screens/creator-paid-articles-public/creator-paid-articles-public-proto.css
  - src/proto/screens/creator-paid-articles-public/creatorPaidArticlesPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Paid articles listing page

What a visitor sees at `tadaify.com/<handle>/articles` — a searchable, tag-filterable grid of the
creator's paid articles, each priced one-time with no subscription. Ported from
`mockups/tadaify-mvp/creator-paid-articles-public.html`. Visitors see the creator's own theme; colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page
reuses the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav with an "Articles" link marked as the current page (an
  extra section beyond the canonical nav), and the shared footer; the url pill shows the `articles` slug.

Hero:

- The page shall render a hero with the page title, a count badge, and a lede.

Toolbar:

- The page shall render a search field and a row of tag-filter chips, the first of which ("All") is the
  default. Typing in search and selecting a tag shall filter the grid live; when nothing matches, the
  page shall show an empty-results note.

Article grid:

- The page shall render each article as a card with a tinted cover, a locked badge, the title, an
  excerpt, the one-time price, and the read time.
- Clicking a card cover or title navigates to the single-article page; the per-card Buy button is mocked
  and confirms the intended Stripe checkout rather than charging.

Pagination:

- The page shall render a "Load more" control showing the visible count out of the catalogue total; the
  control is mocked.

## Layout

- **Desktop / tablet:** the article grid shows multiple responsive columns.
- **Phone:** the hero type scales down and the grid collapses toward a single column.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
