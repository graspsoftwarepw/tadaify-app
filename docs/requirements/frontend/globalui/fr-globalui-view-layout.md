---
id: fr-globalui-view-layout
title: Global UI view layout
area: GLOBALUI
status: accepted
modules: [GLOBALUI]
routes: [/__proto/view-layout]
related_files:
  - src/proto/lib/ProtoShell.tsx
  - src/proto/fixtures/appShell.ts
  - src/proto/StyleGuide.tsx
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Global UI view layout

The persistent authenticated app shell every dashboard-side screen renders inside: a primary sidebar, a sticky
top bar, and a scrollable content region.

## Composition

Sidebar:

- The sidebar shall render the tada!ify wordmark at the top, linking to the prototype home.
- The sidebar shall render grouped navigation sections: a primary group (Dashboard, Design, Insights),
  a "Pages" group, a "Grow" group, and a Settings entry.
- Each navigation item shall render an icon and label; tier-gated items shall render an inline "Pro" badge.
- The active navigation item shall render in the accent colour and carry an aria-current marker.
- The sidebar foot shall render the creator identity: avatar initials, display name, and "@handle · tier".

Top bar:

- The top bar shall render the current screen title.
- The top bar shall render the theme toggle and a secondary "View public page" action, right-aligned.

Content region:

- The content region shall render the active screen's body in a scrollable area below the top bar.

## Layout

- **Desktop (≥768px):** fixed-width sidebar on the left, content column on the right; top bar sticky to the
  content column.
- **Tablet:** same two-column structure; the sidebar remains visible.
- **Phone (<768px):** the sidebar is hidden in favour of bottom navigation (authored with the dashboard screen);
  the top bar and content region span full width.

## Related requirements

- [fr-globalui-theme-and-colours](./fr-globalui-theme-and-colours.md)
