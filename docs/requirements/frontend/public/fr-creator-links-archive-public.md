---
id: fr-creator-links-archive-public
title: Public creator Links archive page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-links-archive-public]
related_files:
  - src/proto/screens/creator-links-archive-public/CreatorLinksArchivePublicScreen.tsx
  - src/proto/screens/creator-links-archive-public/creator-links-archive-public-proto.css
  - src/proto/screens/creator-links-archive-public/creatorLinksArchivePublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator Links archive page

What a visitor sees at `tadaify.com/<handle>/links` — a searchable, filterable, grouped catalogue of
every link button across the creator's site. Ported from
`mockups/tadaify-mvp/creator-links-archive-public.html`. Visitors see the creator's own theme; colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page
reuses the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav and footer. The archive is not a canonical nav section, so
  no nav link is marked as the current page; the url pill shows the `links` slug.

Page hero:

- The page shall render a heading with a total-link count badge and a lede explaining the catalogue.

Search + sort controls:

- The page shall render a sticky control bar with a search input (filtering on link title or URL) and a
  sort dropdown offering: group by source page, A → Z, most clicked, and newest first.
- Typing a query shall filter the rendered rows live and highlight the matched substring in the title and
  URL; a clear button resets the query.

Tag filter:

- The page shall render a tag chip bar; selecting a chip filters rows to that tag. The "All" chip clears
  the tag filter.

Grouped link list:

- The page shall render links grouped by source page, each group showing its name, an emoji marker, and a
  per-group link count. Groups with no visible rows after filtering are hidden.
- Each link row shows an icon, title, URL, its tags (clicking a tag applies that tag filter), and a click
  count. Clicking a row is mocked rather than navigating away.

Results, empty, and pagination states:

- When a search or tag filter is active, the page shall render a results-meta strip with the match count
  and a clear action.
- When no link matches, the page shall render a no-match state with a link to contact the creator.
- With no filter active, the page shall render a "Load more" pagination control reflecting the displayed
  count.

## Layout

- **Desktop / tablet (≥720px):** the link list shows two columns.
- **Phone:** the link list collapses to a single column; the control bar and tag chips wrap.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
