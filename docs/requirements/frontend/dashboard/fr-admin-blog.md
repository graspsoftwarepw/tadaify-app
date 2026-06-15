---
id: fr-admin-blog
title: Administration — Blog
area: DASHBOARD
status: proposed
modules: [DASHBOARD]
routes: [/__proto/admin-blog]
related_files:
  - src/proto/screens/admin-blog/AdminBlogScreen.tsx
  - src/proto/screens/admin-blog/adminBlogFixture.ts
  - src/proto/screens/admin-blog/admin-blog-proto.css
devices: all
related_requirements: [fr-globalui-view-layout, fr-globalui-theme-and-colours]
---

# Administration — Blog

The day-to-day blog publishing surface a creator opens at Administration > Blog,
ported from `mockups/tadaify-mvp/app-admin-blog.html`. It is where posts are
written, scheduled and managed; page-level setup (theme, layout, SEO) lives in
the separate Pages → Blog editor. The screen renders inside the creator
dashboard chrome (appbar + sidebar,
[fr-globalui-view-layout](../globalui/fr-globalui-view-layout.md)) with the Blog
entry in the sidebar Administration group marked as the current screen, and uses
the global colour tokens
([fr-globalui-theme-and-colours](../globalui/fr-globalui-theme-and-colours.md)).

## Shell

- The screen shall render inside the shared dashboard chrome, with the
  Administration > Blog sidebar sub-item marked active.
- A breadcrumb shall read Dashboard / Administration · Blog, the Dashboard crumb
  linking back to the dashboard.
- The page header shall show the emoji "✍️", the title "Blog publishing", a
  one-line description ("Write, schedule, and manage posts. Page-level setup
  (theme, layout, SEO) lives in Pages → Blog"), and two header actions
  ("Comments" and a primary "＋ New post"). The actions shall be hidden in the
  no-Blog-page state.

## Demo state

- A prototype-only demo switcher shall flip the body between three states:
  Filled (23 posts), Empty (0 posts) and No Blog page yet.

## No Blog page state

- An empty card shall read "You don't have a Blog page yet" with an explanation,
  an "＋ Add Blog page now" link, and a "Skip — what is Blog?" button that
  expands an explainer.
- A collapsible explainer ("What is the Blog page?") shall describe the Blog
  surface (behind-the-scenes posts, newsletter archive, SEO-friendly long
  content, Substack alternative) and the Creator+ tier note.

## Empty (no posts) state

- An empty card shall read "No posts yet", state the live blog URL
  (`tadaify.com/<handle>/blog`), and offer a "＋ Write your first post" button
  that opens the post composer.

## Filled state

- A "Posts" section card shall show a summary line ("23 posts · 4 drafts ·
  1 scheduled") and a toolbar with filter tabs (All, Published, Drafts,
  Scheduled — each with a count) and a search box ("Search posts by title…").
  Selecting a tab shall filter the list; typing in the search box shall filter
  by title.
- Each post row shall show a tinted thumbnail badge, the title, a status chip
  (Published / Scheduled / Draft) with a meta line (reads + comments, scheduled
  time, or last-edited + word count), and Edit / More icon buttons.
- A pagination control shall show previous, numbered pages (current page
  highlighted) and next controls.
- A collapsible "Recent comments" section shall show the connected provider
  (Disqus), the awaiting-reply count, a "Disqus connected" chip, and comment
  rows (avatar initial, author, context line, text, Reply button).

## Post composer modal

- "＋ New post" (and the empty-state "Write your first post") shall open a
  centred post-composer modal — never a side drawer. It shall close on the close
  icon, the Cancel button, the Escape key and a backdrop click.
- The modal shall contain a "New post" title with a "Draft" chip, a cover-image
  drop zone, a Title field, a URL slug + Tags row, a rich-text toolbar above a
  Markdown body textarea, and an Author + Schedule row. The Author field carries
  a "Business" tier badge and stays fully visible and interactive; the upgrade
  gate is mocked at Save.
- The footer shall offer "Delete draft" plus "Cancel", "Save draft", "Schedule"
  and "Publish now" actions.

## Theming & responsiveness

- The screen shall render correctly in light and dark themes using only colour
  tokens, and shall adapt from phone to desktop without horizontal overflow
  (toolbar tabs, post rows, the composer field rows and rich-text toolbar reflow
  on narrow screens).
