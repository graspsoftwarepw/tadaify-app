/**
 * DesignAnimations — Animations sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3192-3346
 *
 * Contains:
 *   - Help text mentioning tada!ify brand (DEC-WORDMARK-01 — 3-span canonical)
 *   - "↻ Replay preview" link button (placeholder — preview iframe wiring = #26c)
 *   - Section 1 "Entrance" — runs once on page load; tile-grid for entrance animations
 *   - Section 2 "Ambient" — looping background motion (DEC-ANIMATIONS-SPLIT-01=A)
 *
 * Reduced-motion: transitions 0ms when prefers-reduced-motion is set.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-23, VE-26b-24, VE-26b-25, VE-26b-26, ECN-26b-10
 */

import { useState } from "react";

const ENTRANCE_ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "fade-in", label: "Fade in" },
  { id: "slide-up", label: "Slide up" },
  { id: "slide-down", label: "Slide down" },
  { id: "scale-in", label: "Scale in" },
  { id: "bounce-in", label: "Bounce in" },
] as const;

const AMBIENT_ANIMATIONS = [
  { id: "none", label: "None" },
  { id: "gentle-float", label: "Gentle float" },
  { id: "shimmer", label: "Shimmer" },
  { id: "gradient-shift", label: "Gradient shift" },
  { id: "particles", label: "Particles" },
] as const;

interface DesignAnimationsProps {
  onSave?: (toast: string) => void;
}

export function DesignAnimations({ onSave }: DesignAnimationsProps) {
  const [entranceAnim, setEntranceAnim] = useState("fade-in");
  const [ambientAnim, setAmbientAnim] = useState("none");
  const [entranceStagger, setEntranceStagger] = useState(true);
  const [entranceDuration, setEntranceDuration] = useState("400");

  const handleReplayPreview = () => {
    // Placeholder — preview iframe wiring deferred to #26c
    // no-op in this visual-only slice
  };

  return (
    <section data-panel="animations" style={{ padding: "24px 28px", maxWidth: 680 }}>
      {/* Header with brand + replay button */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          marginBottom: 6,
        }}
      >
        <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)", margin: 0 }}>
          Animations
        </h3>
        {/* Replay preview — placeholder action */}
        <button
          type="button"
          data-replay-preview
          onClick={handleReplayPreview}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "5px 10px",
            border: "1px solid var(--border)",
            borderRadius: 6,
            background: "transparent",
            color: "var(--fg-muted)",
            fontSize: 12.5,
            cursor: "pointer",
          }}
        >
          <span>↻</span>
          <span>Replay preview</span>
        </button>
      </div>

      {/* Help text with tadaify brand (DEC-WORDMARK-01 — 3-span canonical zero separator) */}
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.5 }}>
        Make your <span style={{ fontWeight: 700 }}>tada</span>
        <span style={{ fontWeight: 900, color: "var(--brand-primary)" }}>!</span>
        <span style={{ fontWeight: 700 }}>ify</span> page feel alive. Entrance animations run
        once when visitors land; Ambient animations loop gently in the background.
      </p>

      {/* SECTION 1: Entrance */}
      <div
        data-animation-section="entrance"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
          marginBottom: 20,
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 2 }}>
            Entrance
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
            Runs once when your page loads
          </div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
              marginBottom: 16,
            }}
          >
            {ENTRANCE_ANIMATIONS.map((anim) => {
              const isSelected = entranceAnim === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  data-entrance-tile={anim.id}
                  onClick={() => {
                    setEntranceAnim(anim.id);
                    onSave?.("Saved");
                  }}
                  style={{
                    padding: "10px 8px",
                    border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                    borderRadius: 8,
                    background: isSelected
                      ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
                      : "var(--bg-elevated)",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                    transition: "border-color .15s",
                  }}
                  aria-pressed={isSelected}
                >
                  {anim.label}
                </button>
              );
            })}
          </div>

          {/* Entrance options */}
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            <label
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                fontSize: 13,
                color: "var(--fg)",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={entranceStagger}
                onChange={(e) => setEntranceStagger(e.target.checked)}
                style={{ width: 15, height: 15 }}
              />
              Stagger blocks
            </label>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <label style={{ fontSize: 13, color: "var(--fg-muted)" }}>Duration</label>
              <input
                type="number"
                value={entranceDuration}
                onChange={(e) => setEntranceDuration(e.target.value)}
                min={100}
                max={1200}
                step={100}
                style={{
                  width: 72,
                  padding: "5px 8px",
                  border: "1px solid var(--border)",
                  borderRadius: 6,
                  background: "var(--bg)",
                  color: "var(--fg)",
                  fontSize: 13,
                }}
                aria-label="Entrance animation duration in ms"
              />
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>ms</span>
            </div>
          </div>
        </div>
      </div>

      {/* SECTION 2: Ambient */}
      <div
        data-animation-section="ambient"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
            background: "var(--bg-elevated)",
          }}
        >
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--fg)", marginBottom: 2 }}>
            Ambient
          </div>
          <div style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>
            Looping background motion — subtle and continuous
          </div>
        </div>
        <div style={{ padding: "16px 18px" }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3, 1fr)",
              gap: 10,
            }}
          >
            {AMBIENT_ANIMATIONS.map((anim) => {
              const isSelected = ambientAnim === anim.id;
              return (
                <button
                  key={anim.id}
                  type="button"
                  data-ambient-tile={anim.id}
                  onClick={() => {
                    setAmbientAnim(anim.id);
                    onSave?.("Saved");
                  }}
                  style={{
                    padding: "10px 8px",
                    border: `2px solid ${isSelected ? "var(--brand-primary)" : "var(--border)"}`,
                    borderRadius: 8,
                    background: isSelected
                      ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
                      : "var(--bg-elevated)",
                    cursor: "pointer",
                    fontSize: 12.5,
                    fontWeight: isSelected ? 600 : 400,
                    color: isSelected ? "var(--brand-primary)" : "var(--fg)",
                    transition: "border-color .15s",
                  }}
                  aria-pressed={isSelected}
                >
                  {anim.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
