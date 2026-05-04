/**
 * DesignText — Text sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3121-3143
 *
 * Contains:
 *   - Page font tile-list: System sans / Crimson Pro / Fraunces / Playfair /
 *     Display serif / Mono — each shows "Aa — Ready when you are." preview
 *   - Page text color input field with hex + swatch
 *
 * All font choices are FREE per DEC-043.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-19, VE-26b-20
 */

import { useState } from "react";

const FONTS = [
  { id: "system-sans", label: "System sans", family: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" },
  { id: "crimson-pro", label: "Crimson Pro", family: "'Crimson Pro', Georgia, serif" },
  { id: "fraunces", label: "Fraunces", family: "'Fraunces', Georgia, serif" },
  { id: "playfair", label: "Playfair", family: "'Playfair Display', Georgia, serif" },
  { id: "display-serif", label: "Display serif", family: "'DM Serif Display', Georgia, serif" },
  { id: "mono", label: "Mono", family: "'JetBrains Mono', 'Courier New', monospace" },
] as const;

interface DesignTextProps {
  onSave?: (toast: string) => void;
}

export function DesignText({ onSave }: DesignTextProps) {
  const [selectedFont, setSelectedFont] = useState<string>("crimson-pro");
  const [textColor, setTextColor] = useState("#111827");

  return (
    <section data-panel="text" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Typography
      </h3>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18, lineHeight: 1.5 }}>
        Choose your page font and text color.
      </p>

      {/* Font tile list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 28 }}>
        {FONTS.map((font) => {
          const isSelected = selectedFont === font.id;
          return (
            <button
              key={font.id}
              type="button"
              data-font-tile={font.id}
              onClick={() => {
                setSelectedFont(font.id);
                onSave?.("Saved");
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 16px",
                border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                borderRadius: 10,
                background: isSelected
                  ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
                  : "var(--bg-elevated)",
                cursor: "pointer",
                transition: "border-color .15s",
              }}
              aria-pressed={isSelected}
              aria-label={font.label}
            >
              {/* Font preview */}
              <span
                style={{
                  fontFamily: font.family,
                  fontSize: 17,
                  color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                  fontWeight: 400,
                }}
              >
                Aa — Ready when you are.
              </span>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected ? "var(--brand-primary)" : "var(--fg-muted)",
                  whiteSpace: "nowrap",
                  marginLeft: 12,
                }}
              >
                {font.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Text color */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 18px",
          background: "var(--bg-elevated)",
        }}
      >
        <label
          style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)", display: "block", marginBottom: 10 }}
        >
          Page text color
        </label>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <input
            type="color"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            style={{
              width: 36,
              height: 36,
              border: "1px solid var(--border)",
              borderRadius: 6,
              padding: 2,
              cursor: "pointer",
              background: "none",
            }}
            aria-label="Text color swatch"
          />
          <input
            type="text"
            value={textColor}
            onChange={(e) => setTextColor(e.target.value)}
            maxLength={7}
            style={{
              width: 90,
              padding: "7px 10px",
              border: "1px solid var(--border)",
              borderRadius: 6,
              background: "var(--bg)",
              color: "var(--fg)",
              fontSize: 13,
              fontFamily: "monospace",
            }}
            aria-label="Text color hex"
          />
        </div>
      </div>
    </section>
  );
}
