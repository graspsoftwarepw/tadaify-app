---
id: fr-creator-paid-article-public
title: Public creator single Paid article page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-paid-article-public]
related_files:
  - src/proto/screens/creator-paid-article-public/CreatorPaidArticlePublicScreen.tsx
  - src/proto/screens/creator-paid-article-public/creator-paid-article-public-proto.css
  - src/proto/screens/creator-paid-article-public/creatorPaidArticlePublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-globalui-theme-and-colours]
---

# Public creator single Paid article page

What a visitor sees at `tadaify.com/<handle>/articles/<slug>` — a single paid article with a free
above-the-fold preview, a paywall over the rest, and an unlock path. Ported from
`mockups/tadaify-mvp/creator-paid-article-public.html`. Visitors see the creator's own theme; colour
tokens come from [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page
reuses the shared public-page chrome (top strip, creator nav, footer) described in
[fr-public-creator-page](./fr-public-creator-page.md).

## Composition

Inherited chrome:

- The page shall render the shared creator nav with the "Articles" link marked as the current page, and
  the shared footer; the url pill shows the `articles/<slug>` path.

Article header:

- The page shall render a breadcrumb back to the listing, the title, an author line with date and read
  time, a cover, and either a price chip (before purchase) or a "You bought this" badge (after purchase).

Body and paywall:

- The page shall render the free above-the-fold body to everyone, then a paywalled body that is blurred
  and inert until purchase. The paywall is the paid-content product mechanic, not premium-feature gating.
- Before purchase, the page shall render a sticky Buy bar and a paywall card with the unlock heading,
  price, a Buy-with-Stripe button, and reassurance + secure-checkout notes.
- Buying (from the sticky bar or the paywall card) is mocked: it confirms the intended Stripe checkout,
  then unlocks the full body, hides the sticky bar and paywall card, and swaps the price chip for the
  purchased badge.

Comments and related:

- The page shall render a comments section (count, provider, and a few comments) visible regardless of
  purchase, and a grid of related articles whose cards navigate to a single-article page.

Mockup states:

- The page shall render an in-view state strip letting a reviewer toggle directly between the preview
  (paywalled) and purchased (unlocked) states.

## Layout

- **Desktop / tablet:** the article is a single readable column; the related grid shows multiple columns.
- **Phone:** the title type scales down and the related grid collapses toward a single column.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
