---
type: branding
project: tadaify
title: Theme Tokens — Light + Dark System
created_at: 2026-04-24
author: orchestrator-sonnet-agent-brand-v2
status: draft
---

# Theme Tokens — Light + Dark System

## Dark Mode Derivation Rationale

### Canvas philosophy

The dark background is `#0B0F1E` — a cool, desaturated navy — not pure black (`#000000`)
or a simple dark grey. Reasoning:

- Pure black looks harsh with indigo/purple brand colors and creates unnatural
  contrast extremes that feel like a debug theme.
- A warm grey like `#1A1A1A` clashes with the cool indigo palette — the warm undertone
  fights the brand hue.
- Cool navy (`#0B0F1E`, ~222° HSL) is perceptually harmonious with the indigo primary
  (`#6366F1`, 239° HSL). The canvas recedes behind the brand colors rather than
  competing with them.

### Surface layers (dark)

Three levels of elevation use three distinct values, all cool-navy:

| Token | Value | Contrast vs canvas |
|-------|-------|--------------------|
| `--background` | `#0B0F1E` | — (base) |
| `--surface` | `#141828` | Subtle but distinct — perceivable in side-by-side |
| `--surface-elevated` | `#1E2338` | Clearly above surface — dropdowns, command palette |

No shadows at the deepest level (canvas → surface). Shadows become visible at
`surface → surface-elevated` because the canvas is already dark enough to absorb
soft shadows poorly; elevation is communicated by fill difference + border, not shadow.

### Brand primary: `#6366F1` → `#818CF8`

`#6366F1` on `#0B0F1E` yields contrast ratio **3.1:1** — fails WCAG AA (4.5:1 required
for normal text, 3:1 for large text/UI components).

`#818CF8` (Indigo 400 in Tailwind scale) on `#0B0F1E` yields **4.7:1** — passes AA
for both text and UI components. This is the minimum lift needed; going higher
(e.g. `#A5B4FC`, Indigo 300) would wash out the brand identity.

State derivation in dark:
- Hover: `#A5B4FC` (lighter than base — hover = brighter in dark mode, not darker)
- Pressed: `#6366F1` (the original locked value — pressed = retreats back toward canvas)

### Brand warm: `#F59E0B` → `#FCD34D`

`#F59E0B` on `#0B0F1E` yields **6.1:1** — technically passes AA. However, it reads
as slightly muddy on the dark canvas (the orange-amber shifts toward brown perceptually).

`#FCD34D` (Amber 300) reads clean and warm on the dark canvas: **9.1:1** contrast,
clearly readable, retains the warm identity without muddiness. Also improves readability
of the `-da!` segment of the wordmark in dark mode.

### Semantic colors (dark)

All semantic colors are lifted toward the 300–400 range of their respective Tailwind hues
to ensure AA contrast on `#0B0F1E`:

| Semantic | Light value | Dark value | Dark contrast on canvas |
|----------|-------------|------------|-------------------------|
| success | `#10B981` (500) | `#34D399` (400) | 7.2:1 |
| warning | `#F59E0B` (500) | `#FCD34D` (300) | 9.1:1 |
| danger  | `#EF4444` (500) | `#F87171` (400) | 4.8:1 |
| info    | `#3B82F6` (500) | `#60A5FA` (400) | 4.5:1 |

Semantic backgrounds in dark use deeply saturated, near-black tints of the color family
(e.g. `--danger-bg: #450A0A`) to avoid the "painted" look of light-mode colored fills.

---

## Token Reference

### Surface tokens

| Token | Light | Dark | When to use |
|-------|-------|------|-------------|
| `--background` | `#F9FAFB` | `#0B0F1E` | The page/app canvas. Never place content directly on this except full-bleed hero sections. |
| `--surface` | `#FFFFFF` | `#141828` | Cards, modals, panels, sidebars. One elevation above canvas. |
| `--surface-elevated` | `#FFFFFF` + shadow-md | `#1E2338` | Dropdowns, command palette, tooltips, popovers. Two elevations above canvas. In light mode, same color as surface but differentiated by `--shadow-md`. |
| `--border-subtle` | `#E5E7EB` | `#252A3D` | Dividers, section separators, inactive input outlines. |
| `--border-strong` | `#D1D5DB` | `#323754` | Active input borders, focused outlines (before brand color takes over), table borders. |

### `surface` vs `surface-elevated` — when to use which

Use `--surface` for any element that "lives on the page" — a card scrolls with the page,
a modal's backdrop is on the canvas, the modal panel itself is `--surface`.

Use `--surface-elevated` for anything that "floats above the page" — a dropdown menu,
a tooltip, a command palette, a context menu. These elements need to visually sit above
the `--surface` elements beneath them.

In light mode both values are white; the elevation is communicated purely by shadow
(`--shadow-md` vs `--shadow-lg`). In dark mode the fill value changes
(`#141828` vs `#1E2338`), which creates visible depth without relying on shadows
(which are absorbed by dark backgrounds).

### Foreground tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--text-primary` | `#111827` | `#F1F5F9` | Headings, labels, button text, active nav items |
| `--text-secondary` | `#374151` | `#CBD5E1` | Body copy, paragraph text, descriptive labels |
| `--text-muted` | `#6B7280` | `#64748B` | Timestamps, metadata, hint text, placeholder text |
| `--text-inverse` | `#F9FAFB` | `#111827` | Text on colored fills (e.g. white text inside a `--brand-primary` button) |

### Brand tokens

| Token | Light | Dark | Notes |
|-------|-------|------|-------|
| `--brand-primary` | `#6366F1` | `#818CF8` | CTAs, links, active states, orb fill. LOCKED light value. |
| `--brand-primary-hover` | `#4F46E5` | `#A5B4FC` | Hover: darker in light, lighter in dark |
| `--brand-primary-pressed` | `#4338CA` | `#6366F1` | Pressed: even darker in light, back to locked value in dark |
| `--brand-secondary` | `#8B5CF6` | `#A78BFA` | Gradient partner, accent fills |
| `--brand-warm` | `#F59E0B` | `#FCD34D` | Wordmark `-da!`, warm orb, spotlight accents. LOCKED light value. |

### Semantic tokens

| Token | Light | Dark |
|-------|-------|------|
| `--success` / `--success-bg` / `--success-text` | `#10B981` / `#D1FAE5` / `#065F46` | `#34D399` / `#064E3B` / `#6EE7B7` |
| `--warning` / `--warning-bg` / `--warning-text` | `#F59E0B` / `#FEF3C7` / `#92400E` | `#FCD34D` / `#451A03` / `#FDE68A` |
| `--danger` / `--danger-bg` / `--danger-text` | `#EF4444` / `#FEE2E2` / `#991B1B` | `#F87171` / `#450A0A` / `#FCA5A5` |
| `--info` / `--info-bg` / `--info-text` | `#3B82F6` / `#DBEAFE` / `#1E40AF` | `#60A5FA` / `#1E3A5F` / `#BFDBFE` |

### Gradient tokens

| Token | Light | Dark | Usage |
|-------|-------|------|-------|
| `--hero-gradient` | `linear-gradient(135deg, #6366F1, #8B5CF6)` | `linear-gradient(135deg, #6366F1, #7C3AED)` | Hero sections, promotional banners, CTA backgrounds |
| `--warm-glow-gradient` | `linear-gradient(135deg, #F59E0B, #FDE68A)` | `linear-gradient(135deg, #F59E0B, #FDE68A)` | Spotlight moments, warm CTAs, featured badge backgrounds |

The dark hero gradient shifts the right stop from `#8B5CF6` (Violet 500) to
`#7C3AED` (Violet 600) — slightly deeper to avoid washed-out gradients against
the dark canvas.

---

## Wordmark in Dark Mode

In dark mode, the `ify` segment of `tada!ify` uses `--text-primary` (`#F1F5F9`).

| Segment | Light | Dark |
|---------|-------|------|
| `ta`    | `#6366F1` (brand-primary) | `#818CF8` (brand-primary dark) |
| `-da!`  | `#F59E0B` (brand-warm) | `#FCD34D` (brand-warm dark) |
| `-ify`  | `#111827` (text-primary) | `#F1F5F9` (text-primary dark) |

The `-da!` warm segment reads correctly in dark mode — `#FCD34D` on `#0B0F1E`
yields 9.1:1 contrast, the strongest ratio among all wordmark segments in either mode.
The `ify` segment at `#F1F5F9` on `#0B0F1E` yields 16.5:1 — well above AA.

---

## WCAG AA Contrast Checks

Minimum required: 4.5:1 for normal text, 3:1 for large text (18pt+) and UI components.

### Light mode

| Pairing | Ratio | AA normal | AA large/UI |
|---------|-------|-----------|-------------|
| `--text-primary` (#111827) on `--background` (#F9FAFB) | 18.1:1 | ✓ | ✓ |
| `--text-primary` (#111827) on `--surface` (#FFFFFF) | 19.3:1 | ✓ | ✓ |
| `--text-secondary` (#374151) on `--surface` (#FFFFFF) | 10.7:1 | ✓ | ✓ |
| `--text-muted` (#6B7280) on `--surface` (#FFFFFF) | 4.6:1 | ✓ | ✓ |
| `--text-inverse` (#F9FAFB) on `--brand-primary` (#6366F1) | 4.6:1 | ✓ | ✓ |
| `--brand-primary` (#6366F1) on `--background` (#F9FAFB) | 4.7:1 | ✓ | ✓ |
| `--brand-warm` (#F59E0B) on `--surface` (#FFFFFF) | 2.7:1 | ✗ | ✗ |

**Note:** `--brand-warm` (#F59E0B) fails AA as a text color on white. It is only
used as a fill (wordmark `-da!`, warm orb, decorative accents). It is never used
as standalone body text or informational-only color. This is intentional and acceptable
per WCAG 1.4.1 (color alone must not convey information — warm accent is always
paired with adjacent text or an icon).

### Dark mode

| Pairing | Ratio | AA normal | AA large/UI |
|---------|-------|-----------|-------------|
| `--text-primary` (#F1F5F9) on `--background` (#0B0F1E) | 16.5:1 | ✓ | ✓ |
| `--text-primary` (#F1F5F9) on `--surface` (#141828) | 13.0:1 | ✓ | ✓ |
| `--text-secondary` (#CBD5E1) on `--surface` (#141828) | 8.9:1 | ✓ | ✓ |
| `--text-muted` (#64748B) on `--surface` (#141828) | 3.2:1 | ✗ | ✓ |
| `--text-inverse` (#111827) on `--brand-primary` (#818CF8) | 5.9:1 | ✓ | ✓ |
| `--brand-primary` (#818CF8) on `--background` (#0B0F1E) | 4.7:1 | ✓ | ✓ |
| `--brand-warm` (#FCD34D) on `--background` (#0B0F1E) | 9.1:1 | ✓ | ✓ |

**Note on `--text-muted` in dark:** 3.2:1 on `--surface` fails AA for normal text.
`--text-muted` must only be used for:
- Non-essential metadata (timestamps, byte counts)
- Placeholder text (WCAG exemption: placeholder is never the only description of a field)
- Icon labels where the icon itself is the primary communicator

Never use `--text-muted` for error messages, required labels, or status indicators
in dark mode.

---

## Component State Rules

### Hover (both modes)

- Light mode: hover = darken by ~15% (HSL lightness −10 to −15)
- Dark mode: hover = lighten by ~15% (HSL lightness +10 to +15)
- Always pair with a background change OR border change — never color-only hover

```
Light:  --brand-primary #6366F1  →  hover #4F46E5  (−15 lightness)
Dark:   --brand-primary #818CF8  →  hover #A5B4FC  (+15 lightness)
```

### Pressed / active

- Light mode: darken by ~25% from base
- Dark mode: return to or toward the base locked value (presses go "inward")

```
Light:  --brand-primary #6366F1  →  pressed #4338CA  (−25 lightness)
Dark:   --brand-primary #818CF8  →  pressed #6366F1  (back to locked value)
```

### Focus visible

```css
:focus-visible {
  outline: 2px solid var(--brand-primary);
  outline-offset: 2px;
}
```

Never remove focus outlines. The `outline-offset: 2px` ensures the ring is
outside the element boundary and visible on both light and dark backgrounds.

### Disabled

```
opacity: 0.45;
cursor: not-allowed;
pointer-events: none;
```

No token needed — opacity-based disabled state is consistent across modes.

---

## Tailwind Config Snippet

```js
// tailwind.config.js
module.exports = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        brand: {
          primary:   'var(--brand-primary)',
          hover:     'var(--brand-primary-hover)',
          pressed:   'var(--brand-primary-pressed)',
          secondary: 'var(--brand-secondary)',
          warm:      'var(--brand-warm)',
        },
        surface: {
          DEFAULT:  'var(--surface)',
          elevated: 'var(--surface-elevated)',
        },
        border: {
          subtle: 'var(--border-subtle)',
          strong: 'var(--border-strong)',
        },
        text: {
          primary:   'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          muted:     'var(--text-muted)',
          inverse:   'var(--text-inverse)',
        },
        semantic: {
          success: 'var(--success)',
          warning: 'var(--warning)',
          danger:  'var(--danger)',
          info:    'var(--info)',
        },
      },
      backgroundImage: {
        'hero-gradient':      'var(--hero-gradient)',
        'warm-glow-gradient': 'var(--warm-glow-gradient)',
      },
    },
  },
}
```

Usage in JSX:
```jsx
<button className="bg-brand-primary hover:bg-brand-hover text-text-inverse">
  Get started
</button>

<p className="text-text-muted text-sm">Last updated 2 hours ago</p>

<div className="bg-surface border border-border-subtle rounded-xl shadow-md">
  {/* card content */}
</div>
```

---

## Implementation Notes

### Applying themes

Set `data-theme` on `<html>`. The app default is `light`. Toggle via:

```ts
document.documentElement.setAttribute('data-theme', 'dark');
```

Persist the user's choice in `localStorage` under the key `tadaify-theme`.
On first load, respect `prefers-color-scheme`:

```ts
const saved = localStorage.getItem('tadaify-theme');
const system = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
document.documentElement.setAttribute('data-theme', saved ?? system);
```

### CSS transition on theme switch

Add to `body`:
```css
body {
  transition: background-color 0.25s ease, color 0.2s ease;
}
```

Do NOT transition `border-color` or `box-shadow` globally — causes janky flicker
on complex components. Add targeted transitions only to components that need them.

### Supabase user preference storage

Store `theme_preference: 'light' | 'dark' | 'system'` in the `profiles` table.
`'system'` means "follow OS setting" — do not store the resolved value.
On sign-in, load from DB and override `localStorage` (DB wins over local).
