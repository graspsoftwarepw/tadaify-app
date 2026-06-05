---
module: BLOCKS
covers: BR-CREATOR-001, BR-DASH-004, TR-tadaify-008
routes: /app, /api/blocks, /:handle
story: "#310"
---

# Plan — BLOCKS · link block create (module-first reference)

Companion plan for `e2e/modules/blocks/block-link-create.spec.ts`, the first spec
authored under the canonical `e2e/modules/<AREA>/` tree (grasp-app-structure P7,
epic #303). The front-matter mirrors the spec's 4-key header so a plan-only entry
can appear in the generated e2e map (P5/#261) before the spec is wired into the
runtime.

## Module

`BLOCKS` — content blocks (the registry's worked example). Directory slug `blocks`
under `e2e/modules/` and `e2e/plans/`.

## Covered requirements

| Requirement     | Why this spec proves it                                              |
|-----------------|---------------------------------------------------------------------|
| BR-CREATOR-001  | A creator's content block persists and renders on the public page.  |
| BR-DASH-004     | The dashboard homepage panel is the surface to add/edit the block.  |
| TR-tadaify-008  | Blocks API + storage contract behind the create flow.               |

## Scenario

1. Creator opens `/app` (dashboard homepage panel).
2. Adds a link block via the picker → editor; fills label + URL.
3. `POST /api/blocks` persists the block.
4. The public page `/:handle` renders the link.

## Status

Reference layout/header artifact for P7. The single test is `test.skip()`-gated
until the module-first suite is wired into the Playwright runtime; it is still
discovered by `npx playwright test --list`.
