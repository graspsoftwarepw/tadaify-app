/**
 * DesignButtons — Buttons sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3144-3189
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .btn-style-grid, .btn-style-tile,
 *   .bst-preview.{fill,outline,soft,hard,round,shadow}, .bst-label,
 *   .color-input, .swatch.
 *
 * All button styles are FREE per DEC-043.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-21, VE-26b-22
 */

import { useState } from "react";

const STYLES = [
  { id: "fill", label: "Fill" },
  { id: "outline", label: "Outline" },
  { id: "soft", label: "Soft" },
  { id: "hard", label: "Hard edge" },
  { id: "round", label: "Round" },
  { id: "shadow", label: "Shadow" },
] as const;

interface DesignButtonsProps {
  onSave?: (toast: string) => void;
}

export function DesignButtons({ onSave }: DesignButtonsProps) {
  const [style, setStyle] = useState<string>("fill");
  const [btnColor, setBtnColor] = useState("#FFFFFF");
  const [btnTextColor, setBtnTextColor] = useState("#111827");

  return (
    <>
      <div className="field-group">
        <label className="fg-label">Button style</label>
        <div className="btn-style-grid">
          {STYLES.map((s) => {
            const isSelected = style === s.id;
            return (
              <button
                key={s.id}
                type="button"
                className={`btn-style-tile${isSelected ? " selected" : ""}`}
                onClick={() => {
                  setStyle(s.id);
                  onSave?.("Saved");
                }}
                aria-pressed={isSelected}
              >
                <div className={`bst-preview ${s.id}`}>Follow</div>
                <div className="bst-label">{s.label}</div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="field-group">
        <label className="fg-label">Button color</label>
        <div className="color-input">
          <input
            type="text"
            value={btnColor}
            onChange={(e) => setBtnColor(e.target.value)}
            aria-label="Button color hex"
          />
          <span
            className="swatch"
            style={{ background: btnColor, border: "1px solid var(--border-strong)" }}
          />
        </div>
      </div>

      <div className="field-group">
        <label className="fg-label">Button text color</label>
        <div className="color-input">
          <input
            type="text"
            value={btnTextColor}
            onChange={(e) => setBtnTextColor(e.target.value)}
            aria-label="Button text color hex"
          />
          <span className="swatch" style={{ background: btnTextColor }} />
        </div>
      </div>
    </>
  );
}
