---
id: fr-creator-faq-public
title: Public creator FAQ page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-faq-public]
related_files:
  - src/proto/screens/creator-faq-public/CreatorFaqPublicScreen.tsx
  - src/proto/screens/creator-faq-public/creator-faq-public-proto.css
  - src/proto/screens/creator-faq-public/creatorFaqPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator FAQ page

What a visitor sees at `tadaify.com/<handle>/faq` — a searchable Help Center. Ported from
`mockups/tadaify-mvp/creator-faq-public.html`. Visitors see the creator's own theme; colour tokens come
from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses the
shared public-page chrome described in [fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav with the "FAQ" link marked as the current page, and the
  shared footer.

Hero + meta:

- The page shall render an "FAQ" heading, a lede, and a meta line with the question count, section count,
  and last-updated date.

Search:

- The page shall render a sticky search input that live-filters questions across all sections by question
  and answer text, highlights the matched term, hides empty sections, auto-expands matches, and shows a
  match-count banner. A clear control resets the search.
- When a search yields no matches, the page shall render a no-match block offering a "Message" link and a
  clear-search control.

Tag filter:

- The page shall render a row of tag chips; selecting a chip filters questions to that tag and marks the
  chip active; "All tags" clears the filter.

Table of contents:

- The page shall render a TOC listing each section with its icon and question count; selecting an entry
  marks it current and scrolls to that section. On phones the TOC collapses behind a toggle.

Question accordion:

- The page shall render sections of question/answer items; each item expands to reveal answer paragraphs
  and lists, its tags (each clickable to filter), a "was this helpful?" Yes/No control that records a
  thank-you, and a permalink copy control (mocked).

Footer CTA:

- The page shall render a "Still have questions?" block linking to the Contact page.

## Layout

- **Desktop (≥920px):** a two-column layout with a sticky TOC sidebar beside the content.
- **Phone:** the layout is a single column and the TOC collapses behind a toggle.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
