# TR-tadaify-008 — Radix UI Dialog as canonical modal/dialog primitive

**ID:** TR-tadaify-008  
**Status:** LOCKED (DEC-375=B, 2026-05-06)  
**Introduced by:** tadaify-app#200 F-BLOCK-INFRA-EDITOR-MODAL-001  

---

## Decision

`@radix-ui/react-dialog` is the **canonical modal/dialog primitive** for all
tadaify user interfaces. Every modal, dialog, drawer-style overlay, and
sheet opened within the app MUST use Radix Dialog primitives.

## Rationale

- **DEC-375=B (locked 2026-05-06):** Explicit product decision — Radix Dialog
  chosen after evaluating alternatives (HeadlessUI, native `<dialog>`, custom
  implementation). Radix provides production-grade a11y (focus trap, scroll
  lock, ARIA attributes) without additional implementation cost.
- **~12KB addition** — negligible for a Cloudflare Workers bundle; tree-shakes
  cleanly.
- **Headless API** — styles apply via Tailwind v4 tokens (no Radix-owned CSS
  imported); consistent with TR-003 (Tailwind v4).

## Scope

All future modals / dialogs MUST use Radix Dialog primitives:

| Feature | Component | Story |
|---------|-----------|-------|
| Block editor shell | `BlockEditorModal` | #200 (this story) |
| Block type picker | (future) | #56 Phase 2 |
| Delete confirm sub-modal | (future) | #209 |
| AI suggest modal | (future) | — |
| Tier-gate / upgrade prompt | (future) | — |
| Settings sub-modals | (future) | — |

## Banned alternatives

The following alternatives are **explicitly banned** for new modal/dialog UI
in tadaify to maintain consistency, a11y quality, and avoid duplicated focus/
scroll-lock logic:

- `<dialog>` native HTML element (incomplete a11y in all major browsers as of
  2026; no built-in focus trap; no scroll lock)
- HeadlessUI Dialog (`@headlessui/react`) — adds another vendor for identical
  capability already covered by Radix
- Custom `position:fixed` overlay built from scratch — prohibitively expensive
  to replicate Radix's a11y primitives correctly
- Any solution that bypasses `@radix-ui/react-dialog` for overlays matching
  the modal pattern (blocking, role="dialog", aria-modal="true")

## Sub-modal stacking contract

Nested modals (e.g. delete confirm opened on top of block editor) are each
their own `<Dialog.Root>` with an explicit z-index tier:

| Level | Usage | z-index |
|-------|-------|---------|
| Level 0 (base) | Block editor, pickers, settings modals | 50 |
| Level 1 (sub-modal) | Delete confirm, AI suggest, tier-gate | 60 |

Radix manages focus order automatically for nested dialogs when each root is
independent.

## SSR safety

`<Dialog.Portal>` mounts content on the client only (Radix internals use
`ReactDOM.createPortal` guarded by a `canUseDOM` check). Server-render returns
`null` for portal content. No hydration mismatch. This is required for Remix /
React Router 7 SSR.

## Reduced-motion compliance

Transition CSS MUST respect `@media (prefers-reduced-motion: reduce)` — skip
`transform` / `opacity` transitions entirely when the user has opted out.
Radix exposes `data-state="open|closed"` attributes that drive CSS transitions;
any `@keyframes` or `transition` declarations referencing these MUST include a
`prefers-reduced-motion` override.

## Related

- DEC-375=B (decision record in `/tmp/claude-decisions/decisions.json`)
- `feedback_no_right_side_drawers.md` — all overlays are centered modals, never
  right-side slide-in drawers
- TR-003 — Tailwind v4 for styling (applies to Radix Dialog overlay styles too)
