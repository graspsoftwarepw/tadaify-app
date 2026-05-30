/**
 * DesignAnimations — Animations sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3192-3344
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .fg-help, .tile-grid, .tile-grid-anim,
 *   .tile.anim-tile, .anim-preview, .anim-{none,tada,cascade,fadeup,
 *   spotlight,typewriter}, .anim-dot, .anim-orb, .anim-caret,
 *   .pill-signature, .seg, .color-input, .a11y-row.
 *
 * Brand reaffirmed via 3-span wordmark (.wm-mini in mockup, but this
 * sub-tab uses italic display-font span per mockup line 3194).
 * Reduced-motion respected via CSS (body.reduced-motion .anim-preview).
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-23..26, ECN-26b-10
 */

import { useState } from "react";

const ENTRANCE_TILES = [
  { id: "none", label: "None" },
  { id: "tada", label: "Ta-da reveal", signature: true },
  { id: "cascade", label: "Cascade" },
  { id: "fade-up", label: "Fade up" },
  { id: "spotlight", label: "Spotlight orbit" },
  { id: "typewriter", label: "Typewriter" },
] as const;

const BLOCK_ENTRANCE = [
  { id: "none", label: "None" },
  { id: "stagger", label: "Stagger cascade" },
  { id: "pop", label: "Pop-in" },
  { id: "slide-up", label: "Slide up" },
] as const;

const HOVER_EFFECTS = [
  { id: "none", label: "None" },
  { id: "lift", label: "Lift" },
  { id: "glow", label: "Glow" },
  { id: "tilt", label: "Tilt 3D" },
] as const;

const AMBIENT_TILES = [
  { id: "none", label: "None", icon: null },
  { id: "snow", label: "Snow", icon: "❄" },
  { id: "confetti", label: "Confetti", icon: "🎊" },
  { id: "sparkles", label: "Sparkles", icon: "✨" },
  { id: "bokeh", label: "Bokeh", icon: "🔵" },
  { id: "aurora", label: "Aurora", icon: null },
  { id: "hearts", label: "Hearts", icon: "💗" },
  { id: "stars", label: "Stars", icon: "⭐" },
  { id: "bubbles", label: "Bubbles", icon: "🫧" },
  { id: "petals", label: "Petals", icon: "🌸" },
] as const;

interface DesignAnimationsProps {
  onSave?: (toast: string) => void;
}

function EntrancePreview({ id }: { id: string }) {
  switch (id) {
    case "tada":
      return (
        <div className="anim-preview anim-tada">
          <span className="anim-dot" />
        </div>
      );
    case "cascade":
      return (
        <div className="anim-preview anim-cascade">
          <span />
          <span />
          <span />
        </div>
      );
    case "fade-up":
      return (
        <div className="anim-preview anim-fadeup">
          <span />
        </div>
      );
    case "spotlight":
      return (
        <div className="anim-preview anim-spotlight">
          <span className="anim-orb" />
        </div>
      );
    case "typewriter":
      return (
        <div className="anim-preview anim-typewriter">
          <span className="anim-caret">|</span>
        </div>
      );
    case "none":
    default:
      return <div className="anim-preview anim-none" />;
  }
}

export function DesignAnimations({ onSave }: DesignAnimationsProps) {
  const [entrance, setEntrance] = useState<string>("tada");
  const [blockEntrance, setBlockEntrance] = useState<string>("stagger");
  const [hover, setHover] = useState<string>("lift");
  const [ambient, setAmbient] = useState<string>("none");
  const [reducedMotion, setReducedMotion] = useState(true);

  // Ambient sub-controls only visible when ambient !== 'none' (mockup line 3313)
  const ambientControlsVisible = ambient !== "none";
  const [density, setDensity] = useState(5);
  const [speed, setSpeed] = useState(4);
  const [ambientColorMatch, setAmbientColorMatch] = useState(true);
  const [ambientColor, setAmbientColor] = useState("#6366F1");

  const handleReplay = () => onSave?.("Preview replayed");

  return (
    <>
      <div
        className="fg-help"
        style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 14 }}
      >
        Motion is core to the{" "}
        <span style={{ fontFamily: "var(--font-display)", fontStyle: "italic" }}>tada!ify</span>{" "}
        brand — visitors should feel the reveal.
        <button
          type="button"
          onClick={handleReplay}
          style={{
            marginLeft: 6,
            background: "transparent",
            border: 0,
            color: "var(--brand-primary)",
            fontWeight: 600,
            cursor: "pointer",
            padding: 0,
          }}
        >
          ↻ Replay preview
        </button>
      </div>

      {/* SECTION 1: Entrance */}
      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--fg-subtle)",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Entrance</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "none",
              letterSpacing: 0,
              color: "var(--fg-muted)",
              opacity: 0.7,
            }}
          >
            — runs once on page load
          </span>
        </div>

        {/* Page entrance tiles */}
        <div className="field-group">
          <label className="fg-label">Page entrance</label>
          <div className="fg-help">The first thing visitors see when the page loads.</div>
          <div className="tile-grid tile-grid-anim">
            {ENTRANCE_TILES.map((tile) => {
              const isSelected = entrance === tile.id;
              return (
                <div
                  key={tile.id}
                  className={`tile anim-tile${isSelected ? " selected" : ""}`}
                  data-anim-entrance={tile.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setEntrance(tile.id);
                    onSave?.("Saved");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setEntrance(tile.id);
                      onSave?.("Saved");
                    }
                  }}
                >
                  <EntrancePreview id={tile.id} />
                  <div className="tile-label">
                    {tile.label}
                    {"signature" in tile && tile.signature && (
                      <span className="pill-signature"> signature</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Block entrance segmented */}
        <div className="field-group">
          <label className="fg-label">Block entrance</label>
          <div className="fg-help">
            How each block appears individually on first view.
          </div>
          <div
            className="seg-row"
            role="group"
            style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
          >
            {BLOCK_ENTRANCE.map((b) => (
              <button
                key={b.id}
                type="button"
                className={`seg${blockEntrance === b.id ? " active" : ""}`}
                data-anim-block={b.id}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background:
                    blockEntrance === b.id ? "var(--bg-elevated)" : "var(--bg-muted)",
                  color: blockEntrance === b.id ? "var(--fg)" : "var(--fg-muted)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setBlockEntrance(b.id);
                  onSave?.("Saved");
                }}
              >
                {b.label}
              </button>
            ))}
          </div>
        </div>

        {/* Hover effect segmented */}
        <div className="field-group">
          <label className="fg-label">Hover effect</label>
          <div className="fg-help">
            What happens when a visitor hovers (desktop) or taps (mobile) a block.
          </div>
          <div
            className="seg-row"
            role="group"
            style={{ display: "flex", flexWrap: "wrap", gap: 6 }}
          >
            {HOVER_EFFECTS.map((h) => (
              <button
                key={h.id}
                type="button"
                className={`seg${hover === h.id ? " active" : ""}`}
                data-anim-hover={h.id}
                style={{
                  padding: "7px 14px",
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background: hover === h.id ? "var(--bg-elevated)" : "var(--bg-muted)",
                  color: hover === h.id ? "var(--fg)" : "var(--fg-muted)",
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
                onClick={() => {
                  setHover(h.id);
                  onSave?.("Saved");
                }}
              >
                {h.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 2: Ambient */}
      <section style={{ marginBottom: 24 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--fg-subtle)",
            marginBottom: 12,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span>Ambient</span>
          <span
            style={{
              fontSize: 11,
              fontWeight: 500,
              textTransform: "none",
              letterSpacing: 0,
              color: "var(--fg-muted)",
              opacity: 0.7,
            }}
          >
            — always-on motion overlay
          </span>
        </div>

        <div className="field-group">
          <label className="fg-label">Effect</label>
          <div className="fg-help">
            A continuous particle or overlay effect on your page background. Respects
            reduced-motion OS setting.
          </div>
          <div
            className="tile-grid tile-grid-anim"
            style={{ gridTemplateColumns: "repeat(5,1fr)" }}
          >
            {AMBIENT_TILES.map((tile) => {
              const isSelected = ambient === tile.id;
              const isAurora = tile.id === "aurora";
              return (
                <div
                  key={tile.id}
                  className={`tile anim-tile${isSelected ? " selected" : ""}`}
                  data-ambient={tile.id}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isSelected}
                  onClick={() => {
                    setAmbient(tile.id);
                    onSave?.("Saved");
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setAmbient(tile.id);
                      onSave?.("Saved");
                    }
                  }}
                >
                  {tile.id === "none" ? (
                    <div className="anim-preview anim-none" />
                  ) : (
                    <div
                      className="anim-preview"
                      style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: 18,
                        ...(isAurora && {
                          background:
                            "linear-gradient(135deg, rgba(99,102,241,.3), rgba(139,92,246,.3), rgba(16,185,129,.2))",
                        }),
                      }}
                    >
                      {tile.icon}
                    </div>
                  )}
                  <div className="tile-label">{tile.label}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Ambient sub-controls — only when ambient !== 'none' */}
        {ambientControlsVisible && (
          <div className="field-group" id="ambient-controls">
            <label className="fg-label">Density</label>
            <input
              type="range"
              min={1}
              max={10}
              value={density}
              onChange={(e) => setDensity(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--brand-primary)" }}
              aria-label="Ambient density"
            />

            <label className="fg-label" style={{ marginTop: 12 }}>
              Speed
            </label>
            <input
              type="range"
              min={1}
              max={10}
              value={speed}
              onChange={(e) => setSpeed(Number(e.target.value))}
              style={{ width: "100%", accentColor: "var(--brand-primary)" }}
              aria-label="Ambient speed"
            />

            <label className="fg-label" style={{ marginTop: 12 }}>
              Color
            </label>
            <div
              style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 4 }}
            >
              <button
                type="button"
                className={`seg${ambientColorMatch ? " active" : ""}`}
                onClick={() => setAmbientColorMatch(true)}
                style={{
                  padding: "5px 10px",
                  cursor: "pointer",
                  fontSize: 12,
                  borderRadius: 8,
                  border: "1px solid var(--border-strong)",
                  background: ambientColorMatch ? "var(--bg-elevated)" : "var(--bg-muted)",
                  color: ambientColorMatch ? "var(--fg)" : "var(--fg-muted)",
                  fontWeight: 500,
                }}
              >
                Match theme
              </button>
              <div className="color-input" style={{ width: 120 }}>
                <input
                  type="text"
                  value={ambientColor}
                  onChange={(e) => {
                    setAmbientColor(e.target.value);
                    setAmbientColorMatch(false);
                  }}
                  style={{ fontSize: 12 }}
                  aria-label="Ambient custom color hex"
                />
                <span className="swatch" style={{ background: ambientColor }} />
              </div>
            </div>
          </div>
        )}
      </section>

      {/* SECTION 3: Accessibility */}
      <section style={{ borderTop: "1px solid var(--border)", paddingTop: 16 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.07em",
            color: "var(--fg-subtle)",
            marginBottom: 12,
          }}
        >
          Accessibility
        </div>
        <label className="a11y-row">
          <input
            type="checkbox"
            checked={reducedMotion}
            onChange={(e) => {
              setReducedMotion(e.target.checked);
              onSave?.("Saved");
            }}
            aria-label="Respect reduced-motion"
          />
          <div>
            <div style={{ fontWeight: 600, color: "var(--fg)", fontSize: 14 }}>
              Respect reduced-motion
            </div>
            <div className="fg-help" style={{ marginTop: 2 }}>
              Visitors with <code>prefers-reduced-motion: reduce</code> in their OS settings see
              a still version. Applies to both Entrance and Ambient. Keep this on unless you
              have a strong reason.
            </div>
          </div>
        </label>
      </section>
    </>
  );
}
