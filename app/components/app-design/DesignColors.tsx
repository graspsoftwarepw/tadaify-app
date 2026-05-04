/**
 * DesignColors — Colors sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3347-3375
 *
 * Contains:
 *   - Help copy "Three color tokens — primary actions, text, and background..."
 *   - 3 color input field-groups: Primary / Text / Background (hex + swatch each)
 *
 * NO tier-gating on colors — all FREE per DEC-043 (corrected from v1 which over-gated).
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-27, VE-26b-28, VE-26b-29
 */

import { useState } from "react";

const COLOR_TOKENS = [
  {
    id: "primary",
    label: "Primary",
    description: "Action buttons, links, accents",
    defaultHex: "#6366F1",
  },
  {
    id: "text",
    label: "Text",
    description: "Page body text",
    defaultHex: "#111827",
  },
  {
    id: "background",
    label: "Background",
    description: "Page canvas color",
    defaultHex: "#FFFFFF",
  },
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

  const handleColorChange = (token: string, value: string) => {
    setColors((prev) => ({ ...prev, [token]: value }));
  };

  return (
    <section data-panel="colors" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Color palette
      </h3>
      {/* Help copy — VE-26b-27 */}
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.55 }}>
        Three color tokens — primary actions, text, and background. Change once, everything
        follows.
      </p>

      {/* 3 color input field-groups */}
      <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 24 }}>
        {COLOR_TOKENS.map((token) => (
          <div
            key={token.id}
            style={{
              border: "1px solid var(--border)",
              borderRadius: 10,
              padding: "14px 18px",
              background: "var(--bg-elevated)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
                  {token.label}
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)" }}>{token.description}</div>
              </div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <input
                type="color"
                value={colors[token.id] ?? token.defaultHex}
                onChange={(e) => handleColorChange(token.id, e.target.value)}
                style={{
                  width: 36,
                  height: 36,
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  padding: 2,
                  cursor: "pointer",
                  background: "none",
                }}
                aria-label={`${token.label} color swatch`}
              />
              <input
                type="text"
                value={colors[token.id] ?? token.defaultHex}
                onChange={(e) => handleColorChange(token.id, e.target.value)}
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
                aria-label={`${token.label} color hex`}
              />
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => onSave?.("Saved")}
        style={{
          padding: "9px 22px",
          border: "none",
          borderRadius: 8,
          background: "var(--brand-primary)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        Save palette
      </button>
    </section>
  );
}
