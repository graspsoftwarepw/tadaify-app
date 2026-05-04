/**
 * DesignButtons — Buttons sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3144-3191
 *
 * Contains:
 *   - 6-style tile-grid: Fill / Outline / Soft / Hard edge / Round / Shadow
 *   - Each tile shows "Follow" preview button + style name
 *   - Button color + Button text color input fields (hex + swatch)
 *
 * All button styles are FREE per DEC-043.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-21, VE-26b-22
 */

import { useState } from "react";

interface ButtonStyle {
  id: string;
  label: string;
  previewStyle: React.CSSProperties;
}

const BUTTON_STYLES: ButtonStyle[] = [
  {
    id: "fill",
    label: "Fill",
    previewStyle: {
      background: "#6366F1",
      color: "#fff",
      border: "none",
      borderRadius: 8,
    },
  },
  {
    id: "outline",
    label: "Outline",
    previewStyle: {
      background: "transparent",
      color: "#6366F1",
      border: "2px solid #6366F1",
      borderRadius: 8,
    },
  },
  {
    id: "soft",
    label: "Soft",
    previewStyle: {
      background: "rgba(99, 102, 241, 0.12)",
      color: "#6366F1",
      border: "none",
      borderRadius: 8,
    },
  },
  {
    id: "hard-edge",
    label: "Hard edge",
    previewStyle: {
      background: "#6366F1",
      color: "#fff",
      border: "none",
      borderRadius: 0,
    },
  },
  {
    id: "round",
    label: "Round",
    previewStyle: {
      background: "#6366F1",
      color: "#fff",
      border: "none",
      borderRadius: 999,
    },
  },
  {
    id: "shadow",
    label: "Shadow",
    previewStyle: {
      background: "#6366F1",
      color: "#fff",
      border: "none",
      borderRadius: 8,
      boxShadow: "0 4px 14px rgba(99, 102, 241, 0.45)",
    },
  },
];

interface DesignButtonsProps {
  onSave?: (toast: string) => void;
}

export function DesignButtons({ onSave }: DesignButtonsProps) {
  const [selectedStyle, setSelectedStyle] = useState<string>("fill");
  const [btnColor, setBtnColor] = useState("#6366F1");
  const [btnTextColor, setBtnTextColor] = useState("#FFFFFF");

  return (
    <section data-panel="buttons" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Button style
      </h3>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18, lineHeight: 1.5 }}>
        Choose a visual style for your page buttons and links.
      </p>

      {/* 6-style tile-grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 28,
        }}
      >
        {BUTTON_STYLES.map((style) => {
          const isSelected = selectedStyle === style.id;
          return (
            <button
              key={style.id}
              type="button"
              data-button-tile={style.id}
              onClick={() => {
                setSelectedStyle(style.id);
                onSave?.("Saved");
              }}
              style={{
                border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                borderRadius: 10,
                background: isSelected
                  ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
                  : "var(--bg-elevated)",
                cursor: "pointer",
                padding: "16px 12px 12px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                transition: "border-color .15s",
              }}
              aria-pressed={isSelected}
              aria-label={style.label}
            >
              {/* "Follow" preview button */}
              <div
                style={{
                  padding: "7px 18px",
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: "default",
                  ...style.previewStyle,
                }}
              >
                Follow
              </div>
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: isSelected ? "var(--brand-primary)" : "var(--fg-muted)",
                }}
              >
                {style.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Color inputs */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 18px",
          background: "var(--bg-elevated)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        {/* Button color */}
        <div>
          <label
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", display: "block", marginBottom: 8 }}
          >
            Button color
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={btnColor}
              onChange={(e) => setBtnColor(e.target.value)}
              style={{ width: 36, height: 36, border: "1px solid var(--border)", borderRadius: 6, padding: 2, cursor: "pointer", background: "none" }}
              aria-label="Button color swatch"
            />
            <input
              type="text"
              value={btnColor}
              onChange={(e) => setBtnColor(e.target.value)}
              maxLength={7}
              style={{ width: 90, padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "monospace" }}
              aria-label="Button color hex"
            />
          </div>
        </div>

        {/* Button text color */}
        <div>
          <label
            style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg)", display: "block", marginBottom: 8 }}
          >
            Button text color
          </label>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <input
              type="color"
              value={btnTextColor}
              onChange={(e) => setBtnTextColor(e.target.value)}
              style={{ width: 36, height: 36, border: "1px solid var(--border)", borderRadius: 6, padding: 2, cursor: "pointer", background: "none" }}
              aria-label="Button text color swatch"
            />
            <input
              type="text"
              value={btnTextColor}
              onChange={(e) => setBtnTextColor(e.target.value)}
              maxLength={7}
              style={{ width: 90, padding: "7px 10px", border: "1px solid var(--border)", borderRadius: 6, background: "var(--bg)", color: "var(--fg)", fontSize: 13, fontFamily: "monospace" }}
              aria-label="Button text color hex"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
