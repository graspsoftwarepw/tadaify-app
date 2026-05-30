/**
 * SocialBlockRenderer — public-page renderer for `block_type = "social"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Renders a row of social icon links. Each handle is resolved to a profile URL
 * via a per-platform template; when the handle can't be turned into a reliable
 * URL (free-text display name, unknown platform) we render the icon WITHOUT a
 * link rather than emitting a broken href (no fake margin).
 *
 * Block shape (PublicBlock):
 *   - `meta` mirrors `SocialFormValue`: `{ handles?: Record<id,{handle,iconStyle}>,
 *     handlesOrder?: string[], shape?: "circle"|"square"|"none" }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-social*`.
 *
 * Story: F-BLOCK-SOCIAL-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";

type SocialShape = "circle" | "square" | "none";

interface SocialEntry {
  platformId: string;
  handle: string;
  iconStyle: string;
}

interface SocialBlockMeta {
  entries: SocialEntry[];
  shape: SocialShape;
}

const SHAPES: readonly string[] = ["circle", "square", "none"];

/** Per-platform profile URL templates. `{u}` is the cleaned handle. */
const URL_TEMPLATES: Record<string, string> = {
  instagram: "https://instagram.com/{u}",
  tiktok: "https://tiktok.com/@{u}",
  youtube: "https://youtube.com/@{u}",
  x: "https://x.com/{u}",
  twitter: "https://x.com/{u}",
  linkedin: "https://linkedin.com/in/{u}",
  discord: "https://discord.gg/{u}",
  telegram: "https://t.me/{u}",
  whatsapp: "https://wa.me/{u}",
  facebook: "https://facebook.com/{u}",
  pinterest: "https://pinterest.com/{u}",
  threads: "https://threads.net/@{u}",
  bluesky: "https://bsky.app/profile/{u}",
  github: "https://github.com/{u}",
  patreon: "https://patreon.com/{u}",
  twitch: "https://twitch.tv/{u}",
  spotify: "https://open.spotify.com/user/{u}",
  substack: "https://{u}.substack.com",
};

/**
 * Build a profile URL from a free-text handle.
 *  - A full URL passes through verbatim.
 *  - Otherwise the leading `@` is stripped and the platform template applied.
 *  - Handles containing whitespace (display names) or unknown platforms return
 *    null so the caller renders a non-linked icon instead of a broken href.
 */
export function buildSocialUrl(platformId: string, handle: string): string | null {
  const trimmed = handle.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  const user = trimmed.replace(/^@+/, "").trim();
  if (!user) return null;
  // whatsapp expects digits only — phone numbers legitimately carry spaces,
  // parens and dashes, so this branch runs BEFORE the whitespace guard.
  if (platformId === "whatsapp") {
    const digits = user.replace(/[^\d]/g, "");
    return digits ? URL_TEMPLATES.whatsapp.replace("{u}", digits) : null;
  }
  if (/\s/.test(user)) return null;
  const template = URL_TEMPLATES[platformId];
  if (!template) return null;
  return template.replace("{u}", encodeURIComponent(user));
}

function readSocialMeta(meta: unknown): SocialBlockMeta {
  if (!meta || typeof meta !== "object") return { entries: [], shape: "circle" };
  const m = meta as Record<string, unknown>;
  const handles =
    m.handles && typeof m.handles === "object"
      ? (m.handles as Record<string, unknown>)
      : {};
  const order = Array.isArray(m.handlesOrder)
    ? (m.handlesOrder.filter((x) => typeof x === "string") as string[])
    : Object.keys(handles);
  const shape =
    typeof m.shape === "string" && SHAPES.includes(m.shape)
      ? (m.shape as SocialShape)
      : "circle";

  const entries: SocialEntry[] = [];
  for (const platformId of order) {
    const h = handles[platformId];
    if (!h || typeof h !== "object") continue;
    const hr = h as Record<string, unknown>;
    const handle = typeof hr.handle === "string" ? hr.handle : "";
    const iconStyle =
      typeof hr.iconStyle === "string" && hr.iconStyle ? hr.iconStyle : platformId;
    entries.push({ platformId, handle, iconStyle });
  }
  return { entries, shape };
}

export function SocialBlockRenderer(block: PublicBlock): ReactNode {
  const { entries, shape } = readSocialMeta(block.meta);

  return (
    <article
      data-block-type="social"
      data-block-id={block.id}
      className="block-social-wrap"
    >
      <div
        className={`block-social block-social-${shape}`}
        data-testid={`block-social-${block.id}`}
      >
        {entries.length === 0 ? (
          <p className="block-social-empty">No social links added yet.</p>
        ) : (
          entries.map((entry) => {
            const url = buildSocialUrl(entry.platformId, entry.handle);
            const iconEl = renderIcon(`simple-icons:${entry.iconStyle}`, { size: 22 });
            const label = entry.handle || entry.platformId;
            const inner = (
              <>
                <span className="block-social-icon" aria-hidden="true">
                  {iconEl}
                </span>
                <span className="block-social-sr">{label}</span>
              </>
            );
            return url ? (
              <a
                key={entry.platformId}
                className="block-social-item"
                href={url}
                target="_blank"
                rel="noopener noreferrer me"
                aria-label={`${entry.platformId}: ${label}`}
                data-platform={entry.platformId}
              >
                {inner}
              </a>
            ) : (
              <span
                key={entry.platformId}
                className="block-social-item is-static"
                aria-label={`${entry.platformId}: ${label}`}
                data-platform={entry.platformId}
              >
                {inner}
              </span>
            );
          })
        )}
      </div>
    </article>
  );
}
