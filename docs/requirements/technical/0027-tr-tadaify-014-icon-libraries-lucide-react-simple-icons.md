---
id: TR-SHARED-017
title: "Icon libraries: lucide-react + simple-icons (DEC-378=A)"
area: SHARED
status: accepted
level: MUST
covers: []
supersedes: []
superseded_by: null
authorized_by: vvaser@gmail.com
aliases: [TR-tadaify-014]
---

# TR-tadaify-014 — Icon libraries: lucide-react + simple-icons (DEC-378=A)

**ID:** TR-tadaify-014  
**Status:** LOCKED (DEC-378=A, 2026-05-06)  
**Introduced by:** tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001  

---

## Decision

`lucide-react` and `simple-icons` are the **canonical icon library dependencies**
for all tadaify icon usage. Icon identifiers stored in the DB and rendered at
runtime use the format `lucide:<name>` or `simple-icons:<slug>`.

## Rationale

**DEC-378=A (locked 2026-05-06):** Explicit product decision after evaluating four
alternatives:

| Option | Verdict |
|--------|---------|
| A — lucide-react + simple-icons npm, tree-shaken per icon | **CHOSEN** |
| B — curated subset bundled as local SVG files | Rejected — maintenance burden |
| C — Iconify CDN runtime fetch | Rejected — runtime CDN dep, SSR complexity |
| D — full icon bundle (no tree-shake) | Rejected — bundle too large |

## Canonical icon libraries

### lucide-react (monochrome icons)

- **Package:** `lucide-react`
- **Usage:** Generic, content, communication, and popular icons
- **Render:** `stroke="currentColor"` — color controlled by CSS
- **Identifier format:** `lucide:<camelCase-name>` (e.g. `lucide:link`, `lucide:heart`)
- **Import pattern (tree-shaken):**
  ```ts
  import { Link } from 'lucide-react';
  ```

### simple-icons (brand icons)

- **Package:** `simple-icons`
- **Usage:** Social media, music platforms, shop platforms
- **Render:** Inline SVG with brand hex color from `icon.hex` metadata
- **Identifier format:** `simple-icons:<slug>` (e.g. `simple-icons:spotify`, `simple-icons:instagram`)
- **Access pattern:**
  ```ts
  import * as SimpleIcons from 'simple-icons';
  const icon = SimpleIcons[`si${capitalizedSlug}`];
  // icon.path  — SVG path data
  // icon.hex   — brand color (no leading #)
  // icon.slug  — canonical slug
  // icon.title — display name
  ```

## Icon registry

Icons are curated in `app/lib/icons-catalog.ts` — a static array of `IconEntry`
objects across 7 categories:

| Category | Count target | Source |
|----------|-------------|--------|
| popular | ~20 | Mixed |
| social | ~20 | simple-icons |
| music-video | ~15 | simple-icons |
| shop | ~10 | simple-icons |
| communication | ~10 | Mixed |
| content | ~15 | lucide-react |
| generic | ~10 | lucide-react |

Total: ≥100 entries.

## Icon resolver

`app/lib/icon-resolve.ts` exports `renderIcon(id, props?)` — resolves any
catalog identifier to a JSX element. Handles unknown IDs via `HelpCircle`
fallback (Lucide). SSR-safe (no DOM APIs; Lucide components are SSR-safe by
design; simple-icons path data is static).

## Bundle target

Tree-shaken icon bundle addition: **≤ 100KB** (Vite tree-shakes unused Lucide
exports automatically; simple-icons are accessed as named exports so unused
icons are pruned by the bundler).

## Banned alternatives

- **Iconify CDN** — runtime fetch dependency; fails in Worker SSR without polyfills
- **Font Awesome** — licensing complications; CSS-based icon fonts conflict with
  Tailwind v4's utility-first approach
- **Material Icons** — Google CDN dependency; not SSR-friendly
- **Full bundles without tree-shaking** — violates the ≤100KB bundle target

## Identifier storage contract

Block metadata stores icon identifiers as plain strings in the `meta.icon` field:

```json
{ "icon": "simple-icons:spotify" }
{ "icon": "lucide:link" }
```

This allows the icon catalog to be updated (add/rename/remove entries) without
requiring DB migrations. Unknown identifiers render as fallback via `renderIcon()`.

## SSR contract

`renderIcon()` MUST work in both React client and Cloudflare Workers SSR contexts:

- No `window`, `document`, or other browser-only globals
- No dynamic imports with `await` (synchronous resolution from catalog)
- Returns a JSX element that serializes cleanly to HTML via `renderToString`

## Related

- DEC-378=A — locked icon library decision (2026-05-06)
- `app/lib/icons-catalog.ts` — curated icon catalog (source of truth)
- `app/lib/icon-resolve.ts` — runtime resolver + fallback
- `app/components/blocks/IconPicker.tsx` — consumer component
- TR-tadaify-008 — Radix Dialog (IconPicker uses Radix Popover from same vendor)
- tadaify-app#205 — story that introduced this TR
