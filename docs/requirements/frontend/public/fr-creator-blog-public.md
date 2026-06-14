---
id: fr-creator-blog-public
title: Public creator Blog page
area: PUBLIC
status: proposed
modules: [PUBLIC]
routes: [/__proto/creator-blog-public]
related_files:
  - src/proto/screens/creator-blog-public/CreatorBlogPublicScreen.tsx
  - src/proto/screens/creator-blog-public/creator-blog-public-proto.css
  - src/proto/screens/creator-blog-public/creatorBlogPublicFixture.ts
devices: all
related_requirements: [fr-public-creator-page, fr-creator-about-public, fr-globalui-theme-and-colours]
---

# Public creator Blog page

What a visitor sees at `tadaify.com/<handle>/blog` — the blog sub-page of the creator's main public
page. Ported from `mockups/tadaify-mvp/creator-blog-public.html`. Visitors see the creator's own theme;
the colour tokens come from
[fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md). The page reuses the public
page chrome and styling conventions of [fr-public-creator-page](./fr-public-creator-page.md) and is a
sibling of [fr-creator-about-public](./fr-creator-about-public.md).

The blog renders three sub-views, switched via local state (no real routing): the post **list** (optionally
filtered by a tag), a **single post**, and the **tag-filtered list** (the list with a tag preselected,
which reuses the same filtering logic).

## Composition

Inherited chrome:

- The page shall render a creator nav bar with the creator handle (avatar initial + name "Alexandra Silva",
  linking to the main public page) and a row of section links (Home, About, Blog, Portfolio, Book, Contact).
- The current section ("Blog") shall be marked as the active link.

List view — hero:

- The page shall render the blog title "Strong Not Skinny — Blog" and a lede: "Honest essays on training,
  recovery and building strength without burning out. New posts every Tuesday — read in your inbox or right
  here."
- A meta line shall show the post count and span ("23 posts · 2 years"), a "Subscribe via RSS" link, and a
  "Get new posts by email" link.
- A tag filter bar shall offer an "All" chip plus chips for `training`, `recovery`, `mindset`, `nutrition`,
  and `habits`. The active chip shall be highlighted.

List view — feed:

- The page shall render a grid of post cards. Each card shows a decorative cover (emoji on a coloured
  gradient), the title, a two-line excerpt, and a meta row with the author (avatar initial + "Alexandra"),
  the date and read-time (e.g. "Apr 2 · 7 min"), and one or more tag badges.
- The seeded posts are: "10 morning habits of high-energy women" (habits, mindset), "Why I stopped chasing
  PRs (and what I do instead)" (training), "A 5-day reset for when training feels heavy" (recovery), "Sleep
  first, supplements second" (recovery, mindset), "Macro tracking without losing your weekend" (nutrition),
  and "Training with anxiety — what works for me" (mindset, training).

List view — pagination:

- The page shall render a pagination row: a "Showing 1–6 of 23 posts" meta, numbered page controls (prev
  disabled, page 1 current, pages 2–4, next), and a "Load more posts" button shown on phone widths instead
  of the numbered controls.

List view — empty state:

- When a tag filter matches no posts, the feed shall be replaced by an empty state: a leaf emoji, a heading
  'No posts tagged "<tag>" yet', and a "view all posts" link that clears the filter.

Single-post view:

- The view shall render a full-width cover banner, a "Back to all posts" link, the post title "A 5-day reset
  for when training feels heavy", and a meta row with the author pill ("Posted by Alexandra Silva"), the
  date "Apr 2, 2026", "7 min read", and three share buttons (copy link, share to X, share via email).
- The article body shall render long-form prose: intro paragraphs, the day-by-day sections (Day 1 — Cut
  volume by 50%; Day 2-3 — Walk + breathe; Day 4 — Light return; Day 5 — Honest check-in), a pull
  blockquote ("You can't out-program a tired body. You can only out-rest it."), and a bulleted list.
- Below the body, the post's own tag chips (`recovery`, `training`) shall filter the list when clicked
  (returning to the list view with that tag preselected).
- A "Related posts" section shall show three compact cards ("Sleep first, supplements second", "Training
  with anxiety — what works for me", "10 morning habits of high-energy women").
- A "Comments" section shall offer a provider switch (Disqus / Hyvor / Off). Selecting a provider shall swap
  the panel copy: Disqus describes the embed and links to "Page settings → Comments"; Hyvor describes a
  privacy-first embed; Off states comments are off and points visitors to email.

Footer:

- The page shall render a row of circular social links (Instagram, TikTok, YouTube, Email) and a "Powered by
  tada!ify · get yours free →" note.

## Behaviour

- Clicking a post card (in the feed or related grid) shall open the single-post view and scroll to top.
- Clicking a tag chip shall filter the feed to posts carrying that tag, update the active chip and the post
  count, and (from the single post) return to the list view.
- "All" shall clear the active tag and show every post.
- The single-post "Back to all posts" link shall return to the list view.
- The comments provider switch shall update only the local panel state.
- RSS, email-subscribe, share, social, and "Load more" controls are mock affordances (no real navigation).

## Layout

- **Desktop (≥1024px):** the feed and related grid show two and three columns respectively.
- **Tablet (600–1023px):** the feed and related grid clamp to two columns.
- **Phone (≤599px):** the feed and related grid collapse to a single column; pagination hides the numbered
  controls and shows the "Load more posts" button instead.

## Related requirements

- [fr-public-creator-page](./fr-public-creator-page.md)
- [fr-creator-about-public](./fr-creator-about-public.md)
- [fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)
