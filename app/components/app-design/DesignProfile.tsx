/**
 * DesignProfile — Profile sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3016-3076
 *
 * Contains:
 *   - Profile card layout tile-grid (3 cols): Classic Card / Hero Cover / Sidebar Compact
 *   - Each tile shows mini-render preview of the layout
 *   - Title styling field group below the layout grid
 *
 * Visual only — layout PICKER, NOT field editor (field editing = #26c).
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-13, VE-26b-14, VE-26b-15
 */

import { useState } from "react";

const LAYOUTS = [
  {
    id: "classic-card",
    label: "Classic Card",
    description: "Avatar top-center, name below",
    preview: (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 4,
          padding: "12px 8px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--brand-primary)",
            opacity: 0.7,
          }}
        />
        <div
          style={{
            width: 48,
            height: 4,
            borderRadius: 4,
            background: "var(--fg-muted)",
            opacity: 0.5,
          }}
        />
        <div
          style={{
            width: 36,
            height: 3,
            borderRadius: 4,
            background: "var(--fg-subtle)",
            opacity: 0.4,
          }}
        />
      </div>
    ),
  },
  {
    id: "hero-cover",
    label: "Hero Cover",
    description: "Full-width header image, avatar left",
    preview: (
      <div style={{ padding: "4px 4px 8px" }}>
        <div
          style={{
            height: 28,
            borderRadius: "6px 6px 0 0",
            background: "linear-gradient(135deg, var(--brand-primary) 0%, #a78bfa 100%)",
            opacity: 0.6,
            marginBottom: 6,
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "0 6px" }}>
          <div
            style={{
              width: 20,
              height: 20,
              borderRadius: "50%",
              background: "var(--brand-primary)",
              opacity: 0.8,
              border: "2px solid var(--bg-elevated)",
              flexShrink: 0,
            }}
          />
          <div>
            <div
              style={{
                width: 40,
                height: 4,
                borderRadius: 4,
                background: "var(--fg-muted)",
                opacity: 0.5,
              }}
            />
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "sidebar-compact",
    label: "Sidebar Compact",
    description: "Avatar left, details right (compact)",
    preview: (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 8px",
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: "50%",
            background: "var(--brand-primary)",
            opacity: 0.7,
            flexShrink: 0,
          }}
        />
        <div style={{ flex: 1 }}>
          <div
            style={{
              width: 44,
              height: 4,
              borderRadius: 4,
              background: "var(--fg-muted)",
              opacity: 0.5,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              width: 32,
              height: 3,
              borderRadius: 4,
              background: "var(--fg-subtle)",
              opacity: 0.4,
            }}
          />
        </div>
      </div>
    ),
  },
] as const;

interface DesignProfileProps {
  onSave?: (toast: string) => void;
}

export function DesignProfile({ onSave }: DesignProfileProps) {
  const [selectedLayout, setSelectedLayout] = useState<string>("classic-card");
  const [titleFont, setTitleFont] = useState("inherit");
  const [titleSize, setTitleSize] = useState("18");

  return (
    <section data-panel="profile" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Profile card layout
      </h3>
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 18, lineHeight: 1.5 }}>
        Choose how your profile card is displayed at the top of your page.
      </p>

      {/* 3-column layout tile-grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 12,
          marginBottom: 32,
        }}
      >
        {LAYOUTS.map((layout) => {
          const isSelected = selectedLayout === layout.id;
          return (
            <button
              key={layout.id}
              type="button"
              data-layout-tile={layout.id}
              onClick={() => {
                setSelectedLayout(layout.id);
                onSave?.("Saved");
              }}
              style={{
                border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                borderRadius: 10,
                background: isSelected ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))" : "var(--bg-elevated)",
                cursor: "pointer",
                padding: 0,
                overflow: "hidden",
                transition: "border-color .15s",
              }}
              aria-pressed={isSelected}
              aria-label={layout.label}
            >
              {/* Mini-render preview */}
              <div
                style={{
                  borderBottom: "1px solid var(--border)",
                  minHeight: 70,
                  background: "var(--bg)",
                }}
              >
                {layout.preview}
              </div>
              <div style={{ padding: "8px 10px", textAlign: "left" }}>
                <div
                  style={{
                    fontSize: 12.5,
                    fontWeight: 600,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                  }}
                >
                  {layout.label}
                </div>
                <div style={{ fontSize: 11.5, color: "var(--fg-muted)", marginTop: 2 }}>
                  {layout.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Title styling field group */}
      <div
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "16px 18px",
          background: "var(--bg-elevated)",
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: "var(--fg)",
            marginBottom: 14,
          }}
        >
          Title styling
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label
              style={{ fontSize: 12, color: "var(--fg-muted)", display: "block", marginBottom: 4 }}
            >
              Font
            </label>
            <select
              value={titleFont}
              onChange={(e) => setTitleFont(e.target.value)}
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13,
              }}
              aria-label="Title font"
            >
              <option value="inherit">System default</option>
              <option value="Crimson Pro">Crimson Pro</option>
              <option value="Fraunces">Fraunces</option>
              <option value="Playfair Display">Playfair Display</option>
            </select>
          </div>
          <div style={{ width: 80 }}>
            <label
              style={{ fontSize: 12, color: "var(--fg-muted)", display: "block", marginBottom: 4 }}
            >
              Size
            </label>
            <input
              type="number"
              value={titleSize}
              onChange={(e) => setTitleSize(e.target.value)}
              min={12}
              max={48}
              style={{
                width: "100%",
                padding: "7px 10px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13,
              }}
              aria-label="Title size"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
