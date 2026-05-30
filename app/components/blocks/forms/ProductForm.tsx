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

import { type ReactElement } from "react";
import { IconPicker } from "~/components/blocks/IconPicker";

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
  ctaIcon: "shopping-cart",
  showPrice: true,
};

export interface ProductFormProps {
  value: ProductFormValue;
  onChange: (next: ProductFormValue) => void;
}

export function ProductForm({ value, onChange }: ProductFormProps): ReactElement {
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
        />
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

      {/* Product image */}
      <div className="field">
        <label>Product image (jpg / png / webp · max 5MB)</label>
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
            <span>
              Image uploaded —{" "}
              <button
                type="button"
                style={{ background: "none", border: "none", padding: 0, color: "var(--danger, #dc2626)", cursor: "pointer", fontSize: "inherit" }}
                onClick={() => onChange({ ...value, image: null })}
              >
                Remove
              </button>
            </span>
          ) : (
            <button
              type="button"
              style={{ background: "var(--brand-primary)", color: "#fff", border: 0, borderRadius: "8px", padding: "8px 14px", fontWeight: 600, cursor: "pointer", fontFamily: "var(--font-sans)", fontSize: "12px" }}
            >
              {/* TODO: wire to R2 upload API */}
              Upload image
            </button>
          )}
        </div>
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
        />
        {/* TODO: link-target picker (FIX-6B) — default to External URL tab */}
        <div className="help">Where shoppers land when they click &ldquo;Buy&rdquo;. Shopify / Stripe / Etsy / Gumroad / your own store — any URL.</div>
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
