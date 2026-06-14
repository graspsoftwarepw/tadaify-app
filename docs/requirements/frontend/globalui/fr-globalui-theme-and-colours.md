---
id: fr-globalui-theme-and-colours
title: Global UI theme and colours
area: GLOBALUI
status: accepted
modules: [GLOBALUI]
routes: [/__proto/style-guide]
related_files:
  - src/proto/theme/proto-tokens.css
  - src/proto/lib/ThemeToggle.tsx
  - src/proto/lib/Wordmark.tsx
  - src/proto/StyleGuide.tsx
devices: all
related_requirements: [fr-globalui-view-layout]
---

# Global UI theme and colours

The single source of "what colour" for the tadaify prototype: the locked Indigo Serif accent, the full
light **and** dark palette, and the brand wordmark. Every screen FR links this instead of restating values.

## Composition

Brand accent (theme-invariant):

- Primary `--brand-primary` `#6366F1`, primary-hover `--brand-primary-hover` `#4F46E5`.
- Secondary `--brand-secondary` `#8B5CF6`; warm `--brand-warm` `#F59E0B` with soft/dark variants.

Surfaces, foreground, border, and semantic colours are token pairs that flip between themes:

- Light theme renders the light values defined on `:root`; dark theme renders the values defined under `.dark`.
- Surfaces: background, elevated, muted, sunken.
- Foreground: text, muted text, subtle text, inverse.
- Border: default, strong, focus.
- Semantic: success, warning, danger, info — each with a tinted background.

Wordmark:

- The wordmark shall render "tada!ify" with `tada` in primary, `!` in warm, and `ify` in foreground colour.
- The `!` is part of the mark and shall never be substituted or removed.

Theme toggle:

- The shell shall render a single light/dark toggle control with an accessible label naming the target theme.
- Activating the toggle shall switch the entire palette between light and dark for every surface and component.

Style-guide showcase (dev-only):

- The showcase route shall render swatches for every brand, surface, foreground, border, and semantic token.
- The showcase shall render every core component state — buttons (primary, secondary, ghost, warm, small, large),
  inputs, pills (default, primary, warm, success, danger, pro), and cards (standard, large, highlight) — and the
  typography scale, all driven by the same tokens so colour drift is visible.

## Layout

Identical structure on desktop, tablet, and phone: a sticky top bar carrying the wordmark and theme toggle above a
scrollable token/state gallery. Swatch grids reflow from four to two columns on narrow viewports. The toggle is
present on every device.

## Related requirements

- [fr-globalui-view-layout](./fr-globalui-view-layout.md)
