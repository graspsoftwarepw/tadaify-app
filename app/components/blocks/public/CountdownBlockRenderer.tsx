/**
 * CountdownBlockRenderer — public-page renderer for `block_type = "countdown"`.
 *
 * Registered into `block-render-registry` via `~/lib/block-renderers-register`.
 * Renders the countdown to a target datetime as Days / Hours / Mins / Secs
 * unit boxes, with an optional label (+ icon) and an optional link.
 *
 * Live ticking is a deferred enhancement: these renderers emit static SSR
 * markup with no client hydration hooks. We render an accurate snapshot at load
 * time and expose `data-countdown-target` (ISO) + `data-block-countdown` so a
 * future client slice can tick the digits. The dynamic digits carry
 * `suppressHydrationWarning` to avoid an SSR/client second-boundary mismatch.
 *
 * Expiry:
 *   - target reached + `autoHide` → show the replacement copy ("Live now!")
 *     instead of zeros.
 *   - target reached + no autoHide → show 0/0/0/0.
 *
 * Block shape (PublicBlock):
 *   - `meta` mirrors the presentational subset of `CountdownFormValue`:
 *     `{ label?, icon?, targetAt?, style?, linkLabel?, linkUrl?, autoHide?,
 *        replacementCopy? }`.
 *
 * Style lives in `app/styles/public-creator.css` under `.block-countdown*`.
 *
 * Story: F-BLOCK-COUNTDOWN-001 (tadaify-app#56) — per-type renderer slice.
 */

import type { ReactNode } from "react";
import type { PublicBlock } from "~/lib/block-render-registry";
import { renderIcon } from "~/lib/icon-resolve";

type CountdownStyle = "boxed" | "inline" | "compact" | "flip";

interface CountdownBlockMeta {
  label: string;
  icon: string | null;
  targetAt: string;
  style: CountdownStyle;
  linkLabel: string;
  linkUrl: string;
  autoHide: boolean;
  replacementCopy: string;
}

const STYLES: readonly string[] = ["boxed", "inline", "compact", "flip"];

function readCountdownMeta(meta: unknown): CountdownBlockMeta {
  const m =
    meta && typeof meta === "object" ? (meta as Record<string, unknown>) : {};
  const style =
    typeof m.style === "string" && STYLES.includes(m.style)
      ? (m.style as CountdownStyle)
      : "boxed";
  return {
    label: typeof m.label === "string" ? m.label : "",
    icon: typeof m.icon === "string" && m.icon ? m.icon : null,
    targetAt: typeof m.targetAt === "string" ? m.targetAt : "",
    style,
    linkLabel: typeof m.linkLabel === "string" ? m.linkLabel : "",
    linkUrl: typeof m.linkUrl === "string" ? m.linkUrl : "",
    autoHide: m.autoHide === true,
    replacementCopy:
      typeof m.replacementCopy === "string" ? m.replacementCopy : "",
  };
}

/** IconPicker stores `lucide:<name>` / `simple-icons:<slug>`; tolerate bare names. */
function normalizeIconId(icon: string | null): string | null {
  if (!icon) return null;
  return icon.includes(":") ? icon : `lucide:${icon}`;
}

interface TimeParts {
  days: number;
  hours: number;
  mins: number;
  secs: number;
}

function splitRemaining(ms: number): TimeParts {
  const total = Math.max(0, Math.floor(ms / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    mins: Math.floor((total % 3600) / 60),
    secs: total % 60,
  };
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

export function CountdownBlockRenderer(block: PublicBlock): ReactNode {
  const meta = readCountdownMeta(block.meta);
  const iconEl = renderIcon(normalizeIconId(meta.icon), { size: 18 });
  const target = meta.targetAt ? Date.parse(meta.targetAt) : NaN;

  const wrap = (children: ReactNode): ReactNode => (
    <article
      data-block-type="countdown"
      data-block-id={block.id}
      className="block-countdown-wrap"
    >
      {children}
    </article>
  );

  if (Number.isNaN(target)) {
    return wrap(
      <p className="block-countdown-empty">No countdown date set yet.</p>,
    );
  }

  const diff = target - Date.now();
  const expired = diff <= 0;

  // Expired + auto-hide → replacement copy instead of a row of zeros.
  if (expired && meta.autoHide) {
    return wrap(
      <div
        className="block-countdown block-countdown-done"
        data-block-countdown=""
        data-countdown-target={new Date(target).toISOString()}
        data-testid={`block-countdown-${block.id}`}
      >
        <span className="block-countdown-replacement">
          {meta.replacementCopy || "It's time!"}
        </span>
      </div>,
    );
  }

  const t = splitRemaining(expired ? 0 : diff);
  const units: Array<{ key: string; value: number; label: string }> = [
    { key: "d", value: t.days, label: "Days" },
    { key: "h", value: t.hours, label: "Hours" },
    { key: "m", value: t.mins, label: "Mins" },
    { key: "s", value: t.secs, label: "Secs" },
  ];

  return wrap(
    <div
      className={`block-countdown block-countdown-${meta.style}`}
      data-block-countdown=""
      data-countdown-target={new Date(target).toISOString()}
      data-testid={`block-countdown-${block.id}`}
    >
      {meta.label ? (
        <div className="block-countdown-label">
          {iconEl ? (
            <span className="block-countdown-label-icon" aria-hidden="true">
              {iconEl}
            </span>
          ) : null}
          <span>{meta.label}</span>
        </div>
      ) : null}

      <div className="block-countdown-units">
        {units.map((u) => (
          <div key={u.key} className="block-countdown-unit">
            <span className="block-countdown-num" suppressHydrationWarning>
              {pad(u.value)}
            </span>
            <span className="block-countdown-unit-label">{u.label}</span>
          </div>
        ))}
      </div>

      {meta.linkUrl && meta.linkLabel ? (
        <a
          className="block-countdown-link"
          href={meta.linkUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          {meta.linkLabel}
        </a>
      ) : null}
    </div>,
  );
}
