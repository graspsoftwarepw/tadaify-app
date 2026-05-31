/**
 * ProductForm — form body for block_type = "product".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.product.form
 * Fields: Product title (AI) · Price · Product image (upload) · External URL · Buy button label (AI)
 *   · Buy button icon · Show price toggle
 *
 * FIX-SHOP-001: Renamed from "Shop product" to "Product". External product link only.
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement, useRef, useState } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";
import { buildBlockThumbUrl } from "~/routes/api.block-thumb.$key";

export interface ProductFormValue {
  title: string;
  price: string;
  image: string | null;
  url: string;
  cta: string;
  ctaIcon: string | null;
  showPrice: boolean;
}

export const PRODUCT_FORM_DEFAULTS: ProductFormValue = {
  title: "Spring drop merch",
  price: "$24",
  image: null,
  url: "https://shop.example.com/spring-drop",
  cta: "Buy on Shopify",
  ctaIcon: "lucide:shoppingCart",
  showPrice: true,
};

export interface ProductFormProps {
  value: ProductFormValue;
  onChange: (next: ProductFormValue) => void;
  titleError?: string | null;
  urlError?: string | null;
}

export function ProductForm({ value, onChange, titleError, urlError }: ProductFormProps): ReactElement {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Backend-proxy R2 upload — reuses the link-thumb pipeline (#289): same
  // /api/upload/block-thumb route + AVATARS_R2 `block-thumbs/` prefix. No new
  // route or bucket. Worker is the authoritative validator (size + magic bytes).
  async function handleImageFile(file: File): Promise<void> {
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
      onChange({ ...value, image: json.r2_key });
    } catch {
      setUploadError("Upload failed — please retry.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="section-body" data-testid="product-form">
      {/* Product title */}
      <div className="field with-ai">
        <label htmlFor="pf-title">
          Product title
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest title">✨ Suggest</button>
        </label>
        <input
          id="pf-title"
          type="text"
          value={value.title}
          placeholder="Spring drop merch"
          onChange={(e) => onChange({ ...value, title: e.target.value })}
          aria-invalid={titleError ? true : undefined}
        />
        {titleError && (
          <div role="alert" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500 }}>
            {titleError}
          </div>
        )}
      </div>

      {/* Price */}
      <div className="field">
        <label htmlFor="pf-price">Price (free text — include currency)</label>
        <input
          id="pf-price"
          type="text"
          value={value.price}
          placeholder="$24"
          onChange={(e) => onChange({ ...value, price: e.target.value })}
        />
        <div className="help">Type the price exactly as you want it shown, e.g. &ldquo;$24&rdquo;, &ldquo;€19.99&rdquo;, &ldquo;PLN 79&rdquo;.</div>
      </div>

      {/* Product image — backend-proxy R2 upload (reuses link-thumb pipeline, #289) */}
      <div className="field">
        <label>Product image (jpg / png / webp · max 5MB)</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          data-testid="product-image-input"
          style={{ display: "none" }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            // Reset so re-selecting the same file still fires onChange.
            e.target.value = "";
            if (file) void handleImageFile(file);
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
          {value.image ? (
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px" }}>
              <img
                src={buildBlockThumbUrl(value.image)}
                alt="Product image preview"
                data-testid="product-image-preview"
                style={{ width: "44px", height: "44px", objectFit: "cover", borderRadius: "8px" }}
              />
              <button
                type="button"
                data-testid="product-image-remove"
                style={{ background: "none", border: "none", padding: 0, color: "var(--brand-primary)", cursor: "pointer", fontSize: "inherit" }}
                onClick={() => onChange({ ...value, image: null })}
              >
                Remove
              </button>
            </span>
          ) : (
            <span>
              <button
                type="button"
                disabled={uploading}
                data-testid="product-image-upload"
                style={{ background: "var(--brand-primary)", color: "#fff", border: 0, borderRadius: "8px", padding: "8px 14px", fontWeight: 600, cursor: uploading ? "default" : "pointer", opacity: uploading ? 0.6 : 1, fontFamily: "var(--font-sans)", fontSize: "12px" }}
                onClick={() => fileInputRef.current?.click()}
              >
                {uploading ? "Uploading…" : "Upload image"}
              </button>
            </span>
          )}
        </div>
        {uploadError && (
          <div role="alert" data-testid="product-image-error" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500, marginTop: "6px" }}>
            {uploadError}
          </div>
        )}
      </div>

      {/* External product URL */}
      <div className="field">
        <label htmlFor="pf-url">External product URL (required)</label>
        <input
          id="pf-url"
          type="url"
          value={value.url}
          placeholder="https://shop.example.com/spring-drop"
          onChange={(e) => onChange({ ...value, url: e.target.value })}
          aria-invalid={urlError ? true : undefined}
        />
        {/* TODO: link-target picker (FIX-6B) — default to External URL tab */}
        <div className="help">Where shoppers land when they click &ldquo;Buy&rdquo;. Shopify / Stripe / Etsy / Gumroad / your own store — any URL.</div>
        {urlError && (
          <div role="alert" style={{ fontSize: "12px", color: "var(--danger, #dc2626)", fontWeight: 500 }}>
            {urlError}
          </div>
        )}
      </div>

      {/* Buy button label */}
      <div className="field with-ai">
        <label htmlFor="pf-cta">
          Buy button label
          <button type="button" className="ai-btn" style={{ marginLeft: "8px" }} aria-label="AI suggest CTA">✨ Suggest</button>
        </label>
        <input
          id="pf-cta"
          type="text"
          value={value.cta}
          placeholder="Buy on Shopify"
          onChange={(e) => onChange({ ...value, cta: e.target.value })}
        />
        <div className="help">Tell shoppers where they&apos;re going, e.g. &ldquo;Buy on Shopify&rdquo;, &ldquo;Get yours&rdquo;, &ldquo;Order now&rdquo;.</div>
      </div>

      {/* Buy button icon */}
      <div className="field">
        <label>Buy button icon</label>
        <IconPicker
          value={value.ctaIcon}
          onChange={(id) => onChange({ ...value, ctaIcon: id })}
          clearable
        />
        <div className="help">A cart, bag, or download glyph reads instantly. Defaults to shopping cart.</div>
      </div>

      {/* Show price toggle */}
      <div className="toggle-row" style={{ padding: "4px 0" }}>
        <div className="lbl">
          <div className="t">Show price on card</div>
        </div>
        <span
          className={`switch${value.showPrice ? " on" : ""}`}
          role="switch"
          aria-checked={value.showPrice}
          tabIndex={0}
          onClick={() => onChange({ ...value, showPrice: !value.showPrice })}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onChange({ ...value, showPrice: !value.showPrice });
            }
          }}
          style={{ cursor: "pointer" }}
        />
      </div>
    </div>
  );
}
