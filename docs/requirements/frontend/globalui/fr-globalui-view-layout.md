---
id: fr-globalui-view-layout
title: Global UI view layout
area: GLOBALUI
status: accepted
modules: [GLOBALUI]
routes: [/__proto/dashboard]
related_files:
  - src/proto/screens/dashboard/DashboardScreen.tsx
  - src/proto/screens/dashboard/DashboardChrome.tsx
  - src/proto/StyleGuide.tsx
devices: all
related_requirements: [fr-globalui-theme-and-colours]
---

# Global UI view layout

The persistent authenticated app shell every dashboard-side screen renders inside: a primary sidebar, a sticky
top bar, and a scrollable content region.

The shell mirrors `mockups/tadaify-mvp/app-dashboard.html`, reusing the app's own dashboard styling.

App bar (top):

- The app bar shall render the tada!ify wordmark with the brand orb, linking to the landing.
- The app bar shall render a "Creator dashboard" environment label.
- The app bar shall render, right-aligned, a live handle pill ("tadaify.com/{handle}"), a notifications
  button, and the light/dark theme toggle.

Sidebar:

- The sidebar shall render an account switcher: avatar initials, display name, "@handle · tier", and a chevron.
- The sidebar shall render these grouped sections, separated by dividers:
  - **Pages** (accordion, with a page count) → Home, Add page.
  - **Configuration** (accordion) → Theme, Profile, Background, Text, Buttons, Animations, Colors, Footer, Domain.
  - **Insights** and **Affiliate** (flat items).
  - **Administration** (accordion) → Blog, Store (with a "v2" pill), Schedule, Portfolio, Paid articles.
  - **Settings**, **Help & docs**, **Feedback** (flat items).
- The active navigation item shall render highlighted.

Content region:

- The content region shall render the active screen's body in a scrollable area to the right of the sidebar.

## Layout

- **Desktop / tablet:** fixed-width sidebar on the left, content column on the right; the app bar spans the top.
- **Phone:** the sidebar collapses to bottom navigation; the app bar and content region span full width.

## Related requirements

- [fr-globalui-theme-and-colours](./fr-globalui-theme-and-colours.md)
