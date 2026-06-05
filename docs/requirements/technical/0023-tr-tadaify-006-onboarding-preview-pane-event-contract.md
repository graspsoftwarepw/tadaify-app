---
id: TR-ONBOARDING-001
title: Onboarding preview-pane event/state contract
area: ONBOARDING
status: accepted
level: MUST
covers: [BR-ONBOARDING-001, BR-ONBOARDING-002, BR-ONBOARDING-003, BR-ONBOARDING-004]
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [TR-tadaify-006]
---

# TR-tadaify-006 — Onboarding preview-pane event/state contract

**Level:** MUST
**Introduced:** F-ONBOARDING-001b (tadaify-app#137)
**Status:** accepted

## Context

The onboarding wizard (steps 1–4: welcome / social / profile / template) shows a live preview pane
in the right column. The preview must update as the user types in the form — without hard coupling
between the step route and the preview pane component, and without page navigation.

The mechanism needs to survive SSR hydration (route modules run server-side first), handle rapid
typing without excessive re-renders, and persist the user's preferred viewport across step
navigations and page reloads.

## Decision

### Custom DOM event contract

Every onboarding step form publishes its current state via a custom DOM event:

- **Event name:** `tdf:onboarding:state-update`
- **Payload type:**
  ```ts
  interface OnboardingPreviewState {
    handle: string;
    name: string | null;
    bio: string | null;
    av: string | null;       // null until tadaify-app#138 ships R2 upload
    platforms: string[];
    socials: Record<string, string>;
    tpl: string | null;
  }
  ```
- **Dispatch:** `window.dispatchEvent(new CustomEvent('tdf:onboarding:state-update', { detail: state, bubbles: true }))`
- **Debounce:** publisher MUST debounce at 150ms (only the LATEST payload fires per burst)
- **Subscribe:** `<OnboardingPreviewPane />` calls `window.addEventListener` on mount and removes
  the listener on unmount (`useEffect` cleanup)

### Viewport state persistence

- **sessionStorage key:** `tadaify:onboarding:viewport`
- **Valid values:** `'desktop'` | `'tablet'` | `'mobile'`
- **Default:** `'desktop'` (on missing key or invalid stored value)
- On viewport button click: `setViewport(value)` → writes to sessionStorage
- On component mount: `getViewport()` → reads from sessionStorage

### Viewport dimensions

| Viewport | Logical width × height | Rendering |
|----------|----------------------|-----------|
| Desktop  | 1280 × 800           | Native (scaled to container) |
| Tablet   | 820 × 1180           | `transform: scale(N)` from top-left |
| Mobile   | 390 × 844            | `transform: scale(N)` from top-left |

Scale factor = `min(containerWidth / logicalWidth, containerHeight / logicalHeight)`

### Dark/Light theme propagation

- The preview pane has an icon-only sun/moon toggle button.
- Toggling switches the `darkMode` boolean in component state.
- `buildSrcdoc(state, darkMode)` regenerates the iframe srcdoc with dark or light CSS variables.
- This is intentionally NOT a full palette flip (that waits for `tokens.css` dark variant).

### Iframe srcdoc debounce

- iframe `srcDoc` is regenerated on every `liveState` update (which already comes in debounced
  at 150ms from the publisher).
- No additional client-side debounce at the consumer; the publisher-side 150ms covers the contract.

### Steps without preview pane

- `/onboarding/tier` — **NO preview pane** (single-column layout, per DEC-297=B)
- `/onboarding/complete` — **NO preview pane** (DEC-332=D handle-claim semantics)

## Consequences

- Future onboarding steps that want to update the preview pane MUST publish `tdf:onboarding:state-update`
  with the full payload — not partial updates.
- Future page-editor preview implementations that reuse a similar event bus SHOULD cite this TR to
  prevent contract drift (e.g. if they introduce a different event name or debounce period).
- The `av` field is intentionally `string | null`. It accepts `null` (initials placeholder) or a
  local `URL.createObjectURL(file)` string until tadaify-app#138 ships the R2 upload pipeline.
  When tadaify-app#138 ships, the same field transitions to `r2_key` — the preview pane consumes
  it transparently.

## References

- `app/lib/onboarding-preview-bus.ts` — publish / subscribe / debounce
- `app/lib/onboarding-viewport-store.ts` — sessionStorage round-trip
- `app/components/OnboardingPreviewPane.tsx` — consumer component
- DEC-251 (preview pane shared partial pattern)
- DEC-297=B (no preview on tier step)
- DEC-332=D (complete step handle-claim semantics)
