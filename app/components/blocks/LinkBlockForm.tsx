/**
 * LinkBlockForm — editor form body for `block_type = "link"`.
 *
 * Rendered inside `BlockEditorModal.Form` (left column of the editor body).
 * Pure controlled form — the parent passes `value` + `onChange` and is
 * responsible for the actual save call to `POST /api/blocks`.
 *
 * Visual contract: mockup `mockups/tadaify-mvp/app-block-editor.html`, the
 * Link button form (label / URL / icon / newtab / thumbnail). Slice A ships
 * label + URL + icon + newtab — the Custom thumbnail field is OUT OF SCOPE
 * for this slice (R2 storage is a separate sub-story).
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 * Covers: BR-BLOCK-LINK-002 (editor fields), AC#2, AC#4 (URL auto-prepend).
 */

import { IconPicker } from "~/components/blocks/IconPicker";

export interface LinkBlockFormValue {
  /** Button label. Required, max 60 chars. */
  label: string;
  /** Destination URL. Stored verbatim — normalisation happens on save. */
  url: string;
  /**
   * Icon id (e.g. `simple-icons:spotify` / `lucide:link`), or null when the
   * creator has cleared the picker.
   */
  icon: string | null;
  /** Open the destination in a new tab. Default ON. */
  newtab: boolean;
}

export const LINK_BLOCK_FORM_DEFAULTS: LinkBlockFormValue = {
  label: "",
  url: "",
  icon: null,
  newtab: true,
};

export const LABEL_MAX_CHARS = 60;

export interface LinkBlockFormProps {
  value: LinkBlockFormValue;
  onChange: (next: LinkBlockFormValue) => void;
  /** When set, the form shows an inline error above the URL field. */
  urlError?: string | null;
  /** When set, the form shows an inline error above the label field. */
  labelError?: string | null;
}

export function LinkBlockForm({
  value,
  onChange,
  urlError = null,
  labelError = null,
}: LinkBlockFormProps) {
  return (
    <div className="flex flex-col gap-[18px]" data-testid="link-block-form">
      {/* ── Button label ─────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor="link-block-label"
          className="text-[13px] font-semibold text-[var(--fg)]"
        >
          Button label
        </label>
        <input
          id="link-block-label"
          data-testid="link-block-label-input"
          type="text"
          maxLength={LABEL_MAX_CHARS}
          value={value.label}
          placeholder="Listen on Spotify"
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          aria-invalid={labelError ? true : undefined}
          aria-describedby={labelError ? "link-block-label-error" : "link-block-label-help"}
          className="
            block w-full px-[12px] py-[9px] rounded-[8px]
            border border-[var(--border-strong)] bg-[var(--bg)]
            text-[14px] text-[var(--fg)]
            outline-none focus:border-[var(--brand-primary)]
            focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_25%,transparent)]
          "
        />
        <p
          id="link-block-label-help"
          className="text-[12px] text-[var(--fg-muted)]"
        >
          Short and clickable. Use a verb where you can.
        </p>
        {labelError ? (
          <p
            id="link-block-label-error"
            role="alert"
            data-testid="link-block-label-error"
            className="text-[12px] text-[var(--danger,#dc2626)] font-medium"
          >
            {labelError}
          </p>
        ) : null}
      </div>

      {/* ── URL ──────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[6px]">
        <label
          htmlFor="link-block-url"
          className="text-[13px] font-semibold text-[var(--fg)]"
        >
          URL
        </label>
        <input
          id="link-block-url"
          data-testid="link-block-url-input"
          type="text"
          inputMode="url"
          value={value.url}
          placeholder="https://open.spotify.com/artist/…"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          aria-invalid={urlError ? true : undefined}
          aria-describedby={urlError ? "link-block-url-error" : "link-block-url-help"}
          className="
            block w-full px-[12px] py-[9px] rounded-[8px]
            border border-[var(--border-strong)] bg-[var(--bg)]
            text-[14px] text-[var(--fg)] font-mono
            outline-none focus:border-[var(--brand-primary)]
            focus:ring-2 focus:ring-[color-mix(in_srgb,var(--brand-primary)_25%,transparent)]
          "
        />
        <p
          id="link-block-url-help"
          className="text-[12px] text-[var(--fg-muted)]"
        >
          Paste any URL — we&apos;ll add <code>https://</code> if you skip the
          scheme.
        </p>
        {urlError ? (
          <p
            id="link-block-url-error"
            role="alert"
            data-testid="link-block-url-error"
            className="text-[12px] text-[var(--danger,#dc2626)] font-medium"
          >
            {urlError}
          </p>
        ) : null}
      </div>

      {/* ── Icon ─────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-[6px]">
        <span className="text-[13px] font-semibold text-[var(--fg)]">Icon</span>
        <IconPicker
          value={value.icon}
          onChange={(id) => onChange({ ...value, icon: id })}
          clearable
        />
        <p className="text-[12px] text-[var(--fg-muted)]">
          Brand logo for socials, or a generic glyph for any other link.
        </p>
      </div>

      {/* ── Open in new tab ─────────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-[12px] py-[6px]">
        <div className="flex flex-col">
          <span className="text-[13px] font-semibold text-[var(--fg)]">
            Open in new tab
          </span>
          <span className="text-[12px] text-[var(--fg-muted)]">
            Keeps visitors on your page after they click.
          </span>
        </div>
        <button
          type="button"
          role="switch"
          aria-checked={value.newtab}
          data-testid="link-block-newtab-toggle"
          aria-label="Open in new tab"
          onClick={() => onChange({ ...value, newtab: !value.newtab })}
          className={[
            "relative inline-flex h-[22px] w-[40px] flex-shrink-0 rounded-full",
            "transition-colors duration-150 cursor-pointer",
            "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1",
            value.newtab
              ? "bg-[var(--brand-primary)]"
              : "bg-[var(--border-strong)]",
          ].join(" ")}
        >
          <span
            aria-hidden="true"
            className={[
              "absolute top-[2px] h-[18px] w-[18px] rounded-full bg-white shadow-sm",
              "transition-[left] duration-150",
              value.newtab ? "left-[20px]" : "left-[2px]",
            ].join(" ")}
          />
        </button>
      </div>
    </div>
  );
}
