/**
 * LinkForm — form body for block_type = "link".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.link.form
 * Fields: Button label (AI suggest) · URL (link-target) · Icon picker · Open in new tab · Custom thumbnail
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement, useRef, useState } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";
import { buildBlockThumbUrl } from "~/routes/api.block-thumb.$key";

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
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  async function handleThumbFile(file: File): Promise<void> {
    setUploadError(null);
    setUploading(true);
    try {
      const body = new FormData();
      body.append("file", file);
      const res = await fetch("/api/upload/block-thumb", {
        method: "POST",
        credentials: "include",
        body,
      });
      const json = (await res.json().catch(() => null)) as
        | { r2_key?: string; message?: string; error?: string }
        | null;
      if (!res.ok || !json?.r2_key) {
        setUploadError(json?.message ?? json?.error ?? "Upload failed — please retry.");
        return;
      }
      onChange({ ...value, thumb: json.r2_key });
    } catch {
      setUploadError("Upload failed — please retry.");
    } finally {
      setUploading(false);
    }
  }

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

      {/* Custom thumbnail — backend-proxy R2 upload (#289) */}
      <div className="field">
        <label>Custom thumbnail</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          data-testid="link-thumb-input"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so re-selecting the same file still fires onChange.
            e.target.value = "";
            if (file) void handleThumbFile(file);
          }}
        />
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
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <img
                src={buildBlockThumbUrl(value.thumb)}
                alt="Thumbnail preview"
                data-testid="link-thumb-preview"
                style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }}
              />
              <button
                type="button"
                data-testid="link-thumb-remove"
                style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", cursor: "pointer", fontSize: "inherit" }}
                onClick={() => onChange({ ...value, thumb: null })}
              >
                Remove
              </button>
            </span>
          ) : (
            <span>
              <button
                type="button"
                disabled={uploading}
                data-testid="link-thumb-upload"
                style={{ background: "var(--brand-primary)", color: "#fff", border: 0, borderRadius: "8px", padding: "8px 14px", fontWeight: 600, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1, fontFamily: "var(--font-sans)", fontSize: "12px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--fg-subtle)" }}>jpg / png / webp · max 5MB</div>
            </span>
          )}
        </div>
        {uploadError && (
          <div role="alert" data-testid="link-thumb-error" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500, marginTop: "6px" }}>
            {uploadError}
          </div>
        )}
      </div>
    </div>
  );
}
