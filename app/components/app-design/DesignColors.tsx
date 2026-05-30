/**
 * DesignColors — Colors sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3346-3373
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .fg-help, .color-input, .swatch.
 *
 * NO tier-gating on colors — all FREE per DEC-043.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-27..29
 */

import { useState } from "react";

const TOKENS = [
  { id: "primary", label: "Primary (buttons · accents)", default: "#6366F1", needsBorder: false },
  { id: "text", label: "Text", default: "#111827", needsBorder: false },
  { id: "background", label: "Background", default: "#FFFFFF", needsBorder: true },
] as const;

interface DesignColorsProps {
  onSave?: (toast: string) => void;
}

export function DesignColors({ onSave }: DesignColorsProps) {
  const [colors, setColors] = useState<Record<string, string>>({
    primary: "#6366F1",
    text: "#111827",
    background: "#FFFFFF",
  });

  const handleChange = (id: string, value: string) => {
    setColors((prev) => ({ ...prev, [id]: value }));
    onSave?.("Saved");
  };

  return (
    <>
      <div
        className="fg-help"
        style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 4 }}
      >
        Three color tokens — primary actions, text, and background. Change once, everything
        follows.
      </div>

      {TOKENS.map((t) => (
        <div key={t.id} className="field-group">
          <label className="fg-label">{t.label}</label>
          <div className="color-input">
            <input
              type="text"
              value={colors[t.id]}
              onChange={(e) => handleChange(t.id, e.target.value)}
              aria-label={`${t.label} hex`}
            />
            <span
              className="swatch"
              style={{
                background: colors[t.id],
                ...(t.needsBorder ? { border: "1px solid var(--border-strong)" } : {}),
              }}
            />
          </div>
        </div>
      ))}
    </>
  );
}
