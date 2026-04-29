---
id: 0025
aliases: ["DEC-LAYOUT-01"]
status: accepted
date: 2026-04-25
supersedes: []
superseded_by: null
topics: [editor, grid, layout, mvp-scope]
---

# Grid layout ships in MVP (answer A) — `pages.layout_mode='stack'|'grid'`

## Context

tadaify blocks can be arranged in a vertical stack (standard link-in-bio pattern) or in
a CSS Grid (richer page layout for creators with multiple products or content types).
The question was whether to defer grid to Q+1 alongside multi-page or ship it in MVP.

## Decision

Grid layout ships in MVP (answer A). All tiers. Schema additions:
- `pages.layout_mode` enum: `'stack' | 'grid'` (default `'stack'`)
- `block_placements` table: `id, block_id FK, page_id FK, col, row, span_cols, span_rows, mobile_order, updated_at`

Editor UX: drag-onto-cell (via `@dnd-kit/core`), resize handles for col/row span, mobile
auto-collapse to 1-column with manual `mobile_order` override. CSS rendering uses
`grid-template-columns: repeat(N, 1fr)`.

## Consequences

- `@dnd-kit/core` + `@dnd-kit/sortable` used for both stack-mode reorder and grid-mode
  cell placement.
- Mobile breakpoint collapses to single column ordered by `mobile_order ASC NULLS LAST, row ASC`.
- Eng effort: M (1-2 weeks editor + schema + rendering).

## Provenance

- Migrated 2026-04-28 from `docs/specs/functional-spec.md` L1108, L1508; `docs/decisions/INDEX.md`
- Original ID: DEC-LAYOUT-01
- Locked: 2026-04-25
