/**
 * LinkForm — form body for block_type = "link".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.link.form
 * Fields: Button label (AI suggest) · URL (link-target) · Icon picker · Open in new tab · Custom thumbnail
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

export interface LinkFormValue {
  label: string;
  url: string;
  icon: string | null;
  newtab: boolean;
  thumb: string | null;
}

export const LINK_FORM_DEFAULTS: LinkFormValue = {
  label: "Listen on Spotify",
  url: "https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF",
  icon: "spotify",
  newtab: true,
  thumb: null,
};

export interface LinkFormProps {
  value: LinkFormValue;
  onChange: (next: LinkFormValue) => void;
  labelError?: string | null;
  urlError?: string | null;
}

export function LinkForm({ value, onChange, labelError, urlError }: LinkFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="link-form">
      {/* Button label */}
      <div className="field">
        <label htmlFor="lf-label">
          Button label
          {/* TODO: wire to AI suggest API */}
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest label">
            ✨ Suggest
          </button>
        </label>
        <input
          id="lf-label"
          type="text"
          maxLength={60}
          value={value.label}
          placeholder="Listen on Spotify"
          onChange={(e) => onChange({ ...value, label: e.target.value })}
          aria-invalid={labelError ? true : undefined}
        />
        <div className="help">Short and clickable. Use a verb where you can.</div>
        {labelError && (
          <div role="alert" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500 }}>
            {labelError}
          </div>
        )}
      </div>

      {/* URL */}
      <div className="field">
        <label htmlFor="lf-url">URL</label>
        <input
          id="lf-url"
          type="url"
          value={value.url}
          placeholder="https://open.spotify.com/artist/…"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          aria-invalid={urlError ? true : undefined}
        />
        {/* TODO: link-target picker (FIX-6B — internal page tab + external URL tab) */}
        <div className="help">Paste any URL — we&apos;ll add https:// if you skip the scheme.</div>
        {urlError && (
          <div role="alert" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500 }}>
            {urlError}
          </div>
        )}
      </div>

      {/* Icon */}
      <div className="field">
        <label>Icon</label>
        <IconPicker
          value={value.icon}
          onChange={(id) => onChange({ ...value, icon: id })}
          clearable
        />
        <div className="help">Pick a brand logo for social platforms or a generic glyph for any other link.</div>
      </div>

      {/* Open in new tab */}
      <div className="toggle-row" style={{ padding: "4px 0" }}>
        <div className="lbl">
          <div className="t">Open in new tab</div>
          <div className="s">Keeps visitors on your page after they click.</div>
        </div>
        <span
          className={`switch${value.newtab ? " on" : ""}`}
          role="switch"
          aria-checked={value.newtab}
          tabIndex={0}
          onClick={() => onChange({ ...value, newtab: !value.newtab })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ ...value, newtab: !value.newtab });
            }
          }}
          style={{ cursor: "pointer" }}
        />
      </div>

      {/* Custom thumbnail — TODO: wire to R2 upload API */}
      <div className="field">
        <label>Custom thumbnail</label>
        <div
          style={{
            padding: "14px",
            background: "var(--bg-muted)",
            border: "1.5px dashed var(--border)",
            borderRadius: "8px",
            textAlign: "center",
            fontSize: "12px",
            color: "var(--fg-muted)",
          }}
        >
          {value.thumb ? (
            <span>Thumbnail set — <button type="button" style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", cursor: "pointer", fontSize: "inherit" }} onClick={() => onChange({ ...value, thumb: null })}>Remove</button></span>
          ) : (
            <span>
              <button type="button" style={{ background: "var(--brand-primary)", color: "#fff", border: 0, borderRadius: "8px", padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "12px" }}>
                {/* TODO: wire to R2 upload API */}
                Upload image
              </button>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--fg-subtle)" }}>jpg / png / webp · max 5MB</div>
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
