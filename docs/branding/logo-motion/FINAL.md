---
type: branding
project: tadaify
title: Tadaify Logo Motion v10 — FINAL
created_at: 2026-04-24
author: orchestrator-sonnet-motion-v10
status: pending-user-lock
---

# Tadaify Logo Motion v10 — FINAL

## Iteration history

| Version | Verdict |
|---------|---------|
| v1 | 4 variants (Crowd Sweep / Stage Wave / Spotlight Bow / Full House) — user wanted single final, not a menu |
| v2 | Center → 4-point arc sweep → center — arc not bouncy enough, warm orb too small |
| v3 | Center → pop + settle bounce-back — "pop reads cartoon, not premium" |
| v4 | Wave-at-each-edge oscillation — "too chaotic" |
| v5 | Single-axis L↔R sway 9s — "za wolno" (too slow) |
| v6 | Opus "Step Forward" 70% stillness — "galareta" (too static, gelatinous) |
| v7 | Continuous L↔R 5.5s — superseded by v8 spec change before review |
| v8 | 360° clockwise orbit + radial breath 8.2s cycle — **user ACCEPTED**: "V8 mi się podoba" |
| v9 | v8 motion + gradient orbs (catchlights + drop-shadows from v1 mockup) — motion locked, visuals accepted; formal brand-lock pending |
| **v10** | v9 polish: richer drop-shadow + dark-mode preview — **this file** |

---

## Locked specification

### Geometry (SVG 100×100 viewBox)

| Element | Value |
|---------|-------|
| Large orb (stage) | `cx=50 cy=50 r=40` |
| Warm orb (creator) | `r=20` |
| Orbit radius | `18.4` SVG units |
| Orbit start | 3 o'clock → `(68.4, 50)` |
| Direction | Clockwise |

### Motion timing (8.2s cycle, loops indefinitely)

| Phase | Duration | Easing | Description |
|-------|----------|--------|-------------|
| 1 — Center → 3oc glide | 0.9 s | ease-out cubic | Warm orb glides right from (50,50) to (68.4,50) |
| 2 — 360° clockwise orbit | 5.6 s | linear + radial sway | 3oc → 6oc → 9oc → 12oc → 3oc; radial breath ±0.55 SVG units at 4 cycles/orbit |
| 3 — 3oc → Center return | 0.9 s | ease-in cubic | Warm orb returns from (68.4,50) to (50,50) |
| 4 — Rest at center | 0.8 s | — | Static brandmark, brief pause |
| **Total** | **8.2 s** | | Loops |

### Visual — orb rendering

**Purple stage orb (light mode):**
- Base fill: `linearGradient(145°) #7C78FF → #5B56E8 @ 58% → #4F46E5`
- Catchlight: `radialGradient cx=32% cy=24% r=30%` — `rgba(255,255,255,0.36) → 0`
- Secondary bounce: `radialGradient cx=72% cy=78% r=28%` — `rgba(255,255,255,0.12) → 0`
- Inner rim stroke: `rgba(255,255,255,0.28)` stroke-width 3.5
- Drop-shadow: `feDropShadow dy=8 stdDeviation=8 rgba(79,70,229,0.30)` ← **v10: was 0.25**

**Purple stage orb (dark mode):**
- Base fill: `linearGradient(145°) #818CF8 → #6366F1 @ 58% → #4F46E5` ← lifted primary
- Catchlight, bounce, rim: same proportions as light
- Drop-shadow: `feDropShadow dy=8 stdDeviation=10 rgba(99,102,241,0.40)` — proportionally richer on dark canvas

**Warm creator orb (both modes — unchanged):**
- Base fill: `linearGradient(145°) #FFD36A → #F59E0B @ 58% → #D97706`
- Catchlight: `radialGradient cx=28% cy=22% r=38%` — `rgba(255,255,255,0.42) → 0`
- Drop-shadow light: `feDropShadow dy=6 stdDeviation=7 rgba(245,158,11,0.32)` ← **v10: was 0.28**
- Drop-shadow dark: `feDropShadow dy=6 stdDeviation=9 rgba(245,158,11,0.42)` — richer on dark

### Wordmark — `tada!ify` (variant F)

- `ta` → `#6366F1` (primary)
- `-` → `rgba(fg, 0.35)` opacity separator, font-weight 900
- `da!` → `#F59E0B` (warm)
- `ify` → `#111827` light / `#F9FAFB` dark
- Font: Inter 700

---

## Dark mode derivation rules

| Token | Light | Dark |
|-------|-------|------|
| Canvas | `#F9FAFB` | `#0B0F1E` |
| Surface | `#ffffff` | `#111827` |
| Foreground / `ify` | `#111827` | `#F9FAFB` |
| Purple orb start stop | `#7C78FF` | `#818CF8` (lifted +1 tone) |
| Purple orb mid stop | `#5B56E8` | `#6366F1` |
| Purple orb end stop | `#4F46E5` | `#4F46E5` (same anchor) |
| Warm orb | `#FFD36A → #F59E0B → #D97706` | unchanged |
| `ta` / `da!` wordmark colours | unchanged | unchanged |

Derivation principle: dark mode lifts the purple spectrum ~1 Tailwind step toward 400/500 to compensate for dark-canvas brightness compression, while anchoring at `#4F46E5` at the rim. Warm orb is self-illuminating at this scale — no shift needed.

---

## Accessibility

- `@media (prefers-reduced-motion: reduce)` → all `requestAnimationFrame` animation suppressed; warm orb stays centred on both light and dark panels. The dark-mode preview itself is unaffected — it remains visible as a static render.
- The dark-mode preview does NOT get disabled on reduced-motion — it is a colour/visual lock, not a motion feature.
- Animated SVGs carry `role="img" aria-label="tadaify logo — [light|dark] mode"`.
- Static/decorative SVGs carry `aria-hidden="true"`.
- Favicon sizes (32px, 16px) are always static regardless of motion preference.

---

## Implementation hint

Single-file implementation: pure inline SVG with `<defs>` per instance for gradient and filter ids (ids must be unique per SVG — use a suffix scheme like `-hero`, `-nav`, `-32`). Motion via a single `requestAnimationFrame` loop that sets `cx`/`cy` on all warm orb circle elements in sync. No CSS `@keyframes` required for the orbit — JS gives the precise radial breath math. `@media (prefers-reduced-motion)` guard at the top of the JS block.

```html
<!-- Minimal structure -->
<svg viewBox="0 0 100 100">
  <defs>
    <linearGradient id="stage-SUFFIX">...</linearGradient>
    <filter id="stage-glow-SUFFIX">
      <feDropShadow dx="0" dy="8" stdDeviation="8"
        flood-color="rgba(79,70,229,0.30)" flood-opacity="1"/>
    </filter>
    <!-- warm gradient + filter -->
  </defs>
  <g filter="url(#stage-glow-SUFFIX)">
    <circle cx="50" cy="50" r="40" fill="url(#stage-SUFFIX)"/>
    <!-- catchlight + rim circles -->
  </g>
  <g filter="url(#warm-glow-SUFFIX)">
    <circle id="warm-base-SUFFIX" cx="50" cy="50" r="20" fill="url(#warm-SUFFIX)"/>
    <circle id="warm-hl-SUFFIX"   cx="50" cy="50" r="20" fill="url(#warm-hl-grad-SUFFIX)"/>
  </g>
</svg>
```

---

## Lock question

**Accept v10 as the final lock for tadaify logo motion?**

- **Yes** — update `brand-lock.md` Motion entry to `v10-FINAL (locked)`
- **No** — provide specific feedback for v11
