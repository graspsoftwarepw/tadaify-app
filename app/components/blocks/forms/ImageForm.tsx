/**
 * ImageForm — form body for block_type = "image".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.image.form
 * Fields: Image upload · Alt text · Caption (AI) · Click-through URL · CTA label (AI) · Aspect ratio
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export interface ImageFormValue {
  src: string | null;
  alt: string;
  caption: string;
  href: string;
  ctaLabel: string;
  aspect: "1" | "43" | "169" | "rounded";
}

export const IMAGE_FORM_DEFAULTS: ImageFormValue = {
  src: null,
  alt: 'Album cover for "Spring Drops"',
  caption: 'Album cover for "Spring Drops"',
  href: "",
  ctaLabel: "Listen now",
  aspect: "rounded",
};

export interface ImageFormProps {
  value: ImageFormValue;
  onChange: (next: ImageFormValue) => void;
}

export function ImageForm({ value, onChange }: ImageFormProps): ReactElement {
  return (
    <div className="section-body" data-testid="image-form">
      {/* Image upload */}
      <div className="field">
        <label>Image (jpg / png / webp · max 5MB)</label>
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
          {value.src ? (
            <span>
              Image uploaded —{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", padding: 0, color: "var(--danger, #dc2626)", cursor: "pointer", fontSize: "inherit" }}
                onClick={() => onChange({ ...value, src: null })}
              >
                Remove
              </button>
            </span>
          ) : (
            <>
              <button
                type="button"
                style={{ background: "var(--brand-primary)", color: "#fff", border: 0, borderRadius: "8px", padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "12px" }}
              >
                {/* TODO: wire to R2 upload API */}
                Upload image
              </button>
              <div style={{ marginTop: "6px", fontSize: "11px", color: "var(--fg-subtle)" }}>or paste a URL below</div>
            </>
          )}
        </div>
      </div>

      {/* Alt text */}
      <div className="field">
        <label htmlFor="img-alt">Alt text (accessibility)</label>
        <input
          id="img-alt"
          type="text"
          value={value.alt}
          placeholder='Album cover for "Spring Drops"'
          onChange={(e) => onChange({ ...value, alt: e.target.value })}
        />
        <div className="help">Describe the image for screen readers and SEO. Not visible on the public page.</div>
      </div>

      {/* Caption */}
      <div className="field with-ai">
        <label htmlFor="img-caption">
          Caption (optional, shown under the image)
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest caption">
            ✨ Suggest
          </button>
        </label>
        <input
          id="img-caption"
          type="text"
          value={value.caption}
          placeholder="Add a caption…"
          onChange={(e) => onChange({ ...value, caption: e.target.value })}
        />
        <div className="help">Visible text shown on the public page, beneath the image.</div>
      </div>

      {/* Click-through URL */}
      <div className="field">
        <label htmlFor="img-href">Click-through URL (optional)</label>
        <input
          id="img-href"
          type="url"
          value={value.href}
          placeholder="https://…"
          onChange={(e) => onChange({ ...value, href: e.target.value })}
        />
        {/* TODO: link-target picker (FIX-6B) */}
      </div>

      {/* CTA label */}
      <div className="field with-ai">
        <label htmlFor="img-cta">
          CTA label (shown when click-through URL is set)
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest CTA">
            ✨ Suggest
          </button>
        </label>
        <input
          id="img-cta"
          type="text"
          value={value.ctaLabel}
          placeholder="Listen now"
          onChange={(e) => onChange({ ...value, ctaLabel: e.target.value })}
        />
        <div className="help">Small inline link rendered inside the card, e.g. &ldquo;Listen now&rdquo;, &ldquo;Buy&rdquo;, &ldquo;Read&rdquo;.</div>
      </div>

      {/* Aspect ratio */}
      <div className="field">
        <label htmlFor="img-aspect">Aspect ratio</label>
        <select
          id="img-aspect"
          value={value.aspect}
          onChange={(e) => onChange({ ...value, aspect: e.target.value as ImageFormValue["aspect"] })}
        >
          <option value="1">Square 1:1</option>
          <option value="43">Standard 4:3</option>
          <option value="169">Wide 16:9</option>
          <option value="rounded">Rounded card</option>
        </select>
      </div>
    </div>
  );
}
