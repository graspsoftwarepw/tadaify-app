/**
 * DividerForm — form body for block_type = "divider".
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html BLOCK_TYPES.divider.form
 * Fields: Style · Size · Color (theme-color-picker with swatches + hex input)
 *
 * FIX-DIV-001: theme-aware color picker.
 *
 * Story: tadaify-app#52 block-editor-mockup
 */

import { type ReactElement } from "react";

export type DividerStyle = "line" | "dotted" | "spacer";
export type DividerSize = "sm" | "md" | "lg";

export interface DividerFormValue {
  style: DividerStyle;
  size: DividerSize;
  color: string;
}

export const DIVIDER_FORM_DEFAULTS: DividerFormValue = {
  style: "line",
  size: "md",
  color: "theme",
};

const COLOR_SWATCHES = [
  { id: "theme", label: "Theme default", css: "var(--border)" },
  { id: "indigo", label: "Indigo", css: "#6366F1" },
  { id: "warm", label: "Warm", css: "#F59E0B" },
  { id: "success", label: "Green", css: "#10B981" },
  { id: "danger", label: "Red", css: "#EF4444" },
  { id: "gray-100", label: "Gray 100", css: "#F3F4F6" },
  { id: "gray-300", label: "Gray 300", css: "#D1D5DB" },
  { id: "gray-500", label: "Gray 500", css: "#6B7280" },
  { id: "gray-700", label: "Gray 700", css: "#374151" },
  { id: "gray-900", label: "Gray 900", css: "#111827" },
];

export interface DividerFormProps {
  value: DividerFormValue;
  onChange: (next: DividerFormValue) => void;
}

export function DividerForm({ value, onChange }: DividerFormProps): ReactElement {
  const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(value.color);
  const hexValue = isHex ? value.color : "";

  return (
    <div className="section-body" data-testid="divider-form">
      {/* Style */}
      <div className="field">
        <label htmlFor="dv-style">Style</label>
        <select
          id="dv-style"
          value={value.style}
          onChange={(e) => onChange({ ...value, style: e.target.value as DividerStyle })}
        >
          <option value="line">Solid line</option>
          <option value="dotted">Dotted line</option>
          <option value="spacer">Empty space</option>
        </select>
      </div>

      {/* Size */}
      <div className="field">
        <label htmlFor="dv-size">Size</label>
        <select
          id="dv-size"
          value={value.size}
          onChange={(e) => onChange({ ...value, size: e.target.value as DividerSize })}
        >
          <option value="sm">Small</option>
          <option value="md">Medium</option>
          <option value="lg">Large</option>
        </select>
      </div>

      {/* Color — theme-color-picker (FIX-DIV-001) */}
      <div className="field">
        <label>Color</label>
        <div className="tcp">
          <div className="tcp-row">
            {COLOR_SWATCHES.map((sw) => (
              <button
                key={sw.id}
                type="button"
                className={`tcp-swatch${value.color === sw.id ? " is-selected" : ""}`}
                style={{ background: sw.css }}
                title={sw.label}
                aria-label={sw.label}
                aria-pressed={value.color === sw.id}
                onClick={() => onChange({ ...value, color: sw.id })}
              />
            ))}
          </div>
          <div className={`tcp-hex${isHex ? " is-selected" : ""}`}>
            <span className="tcp-hex-lbl">HEX</span>
            <input
              type="text"
              placeholder="#RRGGBB"
              value={hexValue}
              maxLength={9}
              onChange={(e) => {
                const v = e.target.value.trim();
                onChange({ ...value, color: v || "theme" });
              }}
            />
            <span
              className="tcp-hex-swatch"
              style={{ background: isHex ? value.color : "transparent" }}
            />
          </div>
        </div>
        <div className="help">&ldquo;Theme default&rdquo; follows your chosen theme automatically. Pick a swatch or enter a custom hex to override.</div>
      </div>
    </div>
  );
}
