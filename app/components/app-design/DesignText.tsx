/**
 * DesignText — Text sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3121-3141
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .font-list, .font-tile, .ft-preview, .ft-name,
 *   .color-input, .swatch.
 *
 * All font choices are FREE per DEC-043.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-19, VE-26b-20
 */

import { useState } from "react";

const FONTS = [
  { id: "system", label: "System sans", family: "Inter, sans-serif", size: undefined },
  { id: "crimson", label: "Crimson Pro", family: "'Crimson Pro', serif", size: undefined },
  { id: "fraunces", label: "Fraunces", family: "'Fraunces', serif", size: undefined },
  { id: "playfair", label: "Playfair", family: "'Playfair Display', serif", size: undefined },
  {
    id: "display",
    label: "Display serif",
    family: "Georgia, serif",
    weight: 600,
    size: undefined,
  },
  {
    id: "mono",
    label: "Mono",
    family: "'JetBrains Mono', monospace",
    size: 17,
  },
] as const;

interface DesignTextProps {
  onSave?: (toast: string) => void;
}

export function DesignText({ onSave }: DesignTextProps) {
  const [font, setFont] = useState<string>("crimson");
  const [textColor, setTextColor] = useState("#111827");

  return (
    <>
      <div className="field-group">
        <label className="fg-label">Page font</label>
        <div className="font-list">
          {FONTS.map((f) => {
            const isSelected = font === f.id;
            return (
              <button
                key={f.id}
                type="button"
                className={`font-tile${isSelected ? " selected" : ""}`}
                onClick={() => {
                  setFont(f.id);
                  onSave?.("Saved");
                }}
              >
                <span
                  className="ft-preview"
                  style={{
                    fontFamily: f.family,
                    ...(("weight" in f && f.weight) ? { fontWeight: f.weight } : {}),
                    ...(f.size ? { fontSize: f.size } : {}),
                  }}
                >
                  Aa — Ready when you are.
                </span>
                <span className="ft-name">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="fg-label">Page text color</label>
        <div className="color-input">
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            aria-label="Page text color hex"
          />
          <span className="swatch" style={{ background: textColor }} />
        </div>
      </div>
    </>
  );
}
