/**
 * DividerBlockRenderer — public-page renderer for `block_type = "divider"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`
 * so the public `GET /:handle` route emits a real rule/spacer instead of the
 * empty `<article data-block-type data-block-id />` default.
 *
 * Block shape (PublicBlock):
 *   - `title` / `url` are unused for dividers.
 *   - `meta`  is a JSON blob mirroring `DividerFormValue`:
 *             `{ style?: "line"|"dotted"|"spacer", size?: "sm"|"md"|"lg",
 *                color?: string }`. `color` is a swatch id ("theme", "indigo",
 *                …) or a raw hex; defaults: style=line, size=md, color=theme.
 *
 * Style lives in `app/styles/public-creator.css` under the `.block-divider*`
 * selectors.
 *
 * Story: F-BLOCK-DIVIDER-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { CSSProperties, ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";

type DividerStyle = "line" | "dotted" | "spacer";
type DividerSize = "sm" | "md" | "lg";

interface DividerBlockMeta {
  style: DividerStyle;
  size: DividerSize;
  color: string;
}

const STYLES: readonly string[] = ["line", "dotted", "spacer"];
const SIZES: readonly string[] = ["sm", "md", "lg"];

/**
 * Swatch id → CSS color. Mirrors `COLOR_SWATCHES` in
 * `app/components/blocks/forms/DividerForm.tsx`. `theme` resolves to the
 * themable `--border` token so the rule follows the creator's theme.
 */
const SWATCH_CSS: Record<string, string> = {
  theme: "var(--border)",
  indigo: "#6366F1",
  warm: "#F59E0B",
  success: "#10B981",
  danger: "#EF4444",
  "gray-100": "#F3F4F6",
  "gray-300": "#D1D5DB",
  "gray-500": "#6B7280",
  "gray-700": "#374151",
  "gray-900": "#111827",
};

function resolveColor(color: string): string {
  if (/^#[0-9A-Fa-f]{3,8}$/.test(color)) return color;
  return SWATCH_CSS[color] ?? "var(--border)";
}

/** Type-guard for the `meta` JSON blob. */
function readDividerMeta(meta: unknown): DividerBlockMeta {
  if (!meta || typeof meta !== "object") {
    return { style: "line", size: "md", color: "theme" };
  }
  const m = meta as Record<string, unknown>;
  const style =
    typeof m.style === "string" && STYLES.includes(m.style)
      ? (m.style as DividerStyle)
      : "line";
  const size =
    typeof m.size === "string" && SIZES.includes(m.size)
      ? (m.size as DividerSize)
      : "md";
  const color = typeof m.color === "string" && m.color ? m.color : "theme";
  return { style, size, color };
}

/**
 * Render a single divider block.
 *
 * `line` / `dotted` emit a semantic `<hr>` with the resolved color applied to
 * `border-color`. `spacer` emits an empty, aria-hidden gap (presentational
 * whitespace only — no visible rule).
 */
export function DividerBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readDividerMeta(block.meta);

  if (meta.style === "spacer") {
    return (
      <article
        data-block-type="divider"
        data-block-id={block.id}
        className="block-divider-wrap"
      >
        <div
          className={`block-divider block-divider-spacer block-divider-${meta.size}`}
          role="separator"
          aria-hidden="true"
          data-testid={`block-divider-${block.id}`}
        />
      </article>
    );
  }

  const style: CSSProperties = { borderColor: resolveColor(meta.color) };

  return (
    <article
      data-block-type="divider"
      data-block-id={block.id}
      className="block-divider-wrap"
    >
      <hr
        className={`block-divider block-divider-${meta.style} block-divider-${meta.size}`}
        style={style}
        data-testid={`block-divider-${block.id}`}
      />
    </article>
  );
}
