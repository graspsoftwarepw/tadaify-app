/**
 * DesignTheme — Theme sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 2927-3015
 *
 * Contains:
 *   - AI theme matcher card ("Generate with AI" + sparkle icon + help copy)
 *   - AI credits pill (4/5 AI credits left) right-aligned in card header
 *   - AI prompt input (placeholder text, maxlength 120)
 *   - Image upload button next to prompt input
 *   - Preset catalogue (placeholder)
 *
 * Visual only — no persistence in this slice.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-09, VE-26b-10, VE-26b-11, VE-26b-12
 */

import { useState } from "react";

interface DesignThemeProps {
  onSave?: (toast: string) => void;
}

export function DesignTheme({ onSave }: DesignThemeProps) {
  const [prompt, setPrompt] = useState("");

  const handleGenerate = () => {
    if (onSave) onSave("Saved");
  };

  return (
    <section data-panel="theme" style={{ padding: "24px 28px", maxWidth: 680 }}>
      {/* AI theme matcher card */}
      <div
        data-ai-theme-card
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          padding: "20px 22px",
          marginBottom: 28,
          background: "var(--bg-elevated)",
        }}
      >
        {/* Card header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 15,
                fontWeight: 700,
                color: "var(--fg)",
              }}
            >
              {/* Sparkle icon */}
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                style={{ color: "var(--brand-primary)" }}
              >
                <path d="M12 2l2.09 6.26L20 10l-5.91 1.74L12 18l-2.09-6.26L4 10l5.91-1.74L12 2z" />
              </svg>
              <span>Generate with AI</span>
            </div>
            <p
              style={{
                margin: "4px 0 0",
                fontSize: 13,
                color: "var(--fg-muted)",
                lineHeight: 1.45,
              }}
            >
              Describe what you like — or upload a photo
              <br />
              We match from 1000+ presets
            </p>
          </div>
          {/* AI credits pill */}
          <span
            data-ai-credits
            style={{
              fontSize: 12,
              fontWeight: 600,
              background: "var(--bg-muted)",
              color: "var(--fg-muted)",
              borderRadius: 20,
              padding: "3px 10px",
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            4/5 AI credits left
          </span>
        </div>

        {/* Prompt row */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <input
            type="text"
            data-ai-prompt
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={120}
            placeholder="e.g. warm sunset over Lisbon rooftops, editorial feel"
            style={{
              flex: 1,
              padding: "9px 12px",
              fontSize: 13.5,
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--fg)",
              outline: "none",
            }}
            aria-label="AI theme prompt"
          />
          {/* Image upload button */}
          <button
            type="button"
            data-tip="Upload an inspiration image — we extract the 2 dominant colors and match a theme"
            title="Upload an inspiration image — we extract the 2 dominant colors and match a theme"
            style={{
              padding: "9px 12px",
              border: "1px solid var(--border)",
              borderRadius: 8,
              background: "var(--bg)",
              color: "var(--fg-muted)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13,
            }}
            aria-label="Upload inspiration image"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21 15 16 10 5 21" />
            </svg>
            <span>Photo</span>
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            style={{
              padding: "9px 16px",
              border: "none",
              borderRadius: 8,
              background: "var(--brand-primary)",
              color: "#fff",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: 600,
            }}
          >
            Generate
          </button>
        </div>
      </div>

      {/* Preset catalogue placeholder */}
      <div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg-muted)",
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            marginBottom: 14,
          }}
        >
          Preset themes
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))",
            gap: 12,
          }}
        >
          {["Minimal", "Editorial", "Vibrant", "Dark", "Warm", "Cool"].map((name) => (
            <button
              key={name}
              type="button"
              onClick={() => onSave?.("Saved")}
              style={{
                padding: "28px 16px",
                border: "1px solid var(--border)",
                borderRadius: 10,
                background: "var(--bg-elevated)",
                color: "var(--fg)",
                cursor: "pointer",
                fontSize: 13,
                fontWeight: 500,
                textAlign: "center",
              }}
            >
              {name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
