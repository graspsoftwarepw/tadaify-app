/**
 * SettingsTheme — Theme sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-theme.html (2426 LOC)
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real API wiring — all interactive handlers are stubs or local state.
 *
 * Sections (in order):
 *   1. Tier upsell banner (Free only)
 *   2. Two-column grid:
 *      LEFT controls:
 *        1. Theme presets gallery (8 cards + Surprise me)
 *        2. Custom palette (Pro+) — 4 swatches, Match my logo, Random palette
 *        3. Typography — Display + Body font, weight, letter-spacing, line-height,
 *           custom font upload (Business+)
 *        4. Background style — Solid / Gradient / Radial wash / Custom image +
 *           image controls + pattern overlay (Pro+)
 *        5. Spacing & density — Compact / Comfortable / Roomy
 *        6. Custom CSS (Business+) — mock editor
 *        7. Theme history (Pro+) — last 5 entries
 *      RIGHT:
 *        Live preview pane — Desktop / Tablet / Mobile + Dark toggle
 *   3. Sticky save bar — Discard + Apply theme
 *   4. Modals (centered, NEVER drawers):
 *        - Color picker (HEX / HSL sliders / recent / Match my logo / contrast)
 *        - Custom font upload
 *        - Save palette as preset
 *        - Revert confirm
 *
 * Story: F-APP-SETTINGS-THEME-001
 */

import { useState, type ReactElement } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type PresetId =
  | "indigo"
  | "mono"
  | "pastel"
  | "glass"
  | "earth"
  | "neon"
  | "sunrise"
  | "editorial";

type DeviceId = "desktop" | "tablet" | "mobile";
type BgType = "solid" | "gradient" | "radial" | "image";
type DensityId = "compact" | "comfortable" | "roomy";
type PatternId = "dots" | "grid" | "waves" | "hex" | "tri" | "noise" | null;
type SwatchTarget = "primary" | "accent" | "background" | "text" | "logo-match";

// ─── Stub data (verbatim from mockup) ────────────────────────────────────────

interface PresetMeta {
  id: PresetId;
  label: string;
  fontLabel: string;
  thumbClass: string;
  btnLabel: string;
  badgeLabel: string;
  badgeClass: string;
}

const PRESETS: PresetMeta[] = [
  { id: "indigo",    label: "Indigo Serif",   fontLabel: "Crimson Pro · default", thumbClass: "theme-preset-thumb-indigo",    btnLabel: "Subscribe",  badgeLabel: "Active", badgeClass: "success" },
  { id: "mono",      label: "Mono Minimal",   fontLabel: "Inter",                 thumbClass: "theme-preset-thumb-mono",      btnLabel: "Subscribe",  badgeLabel: "Free",   badgeClass: "" },
  { id: "pastel",    label: "Pastel Pop",     fontLabel: "Quicksand",             thumbClass: "theme-preset-thumb-pastel",    btnLabel: "Tap me",     badgeLabel: "Free",   badgeClass: "" },
  { id: "glass",     label: "Dark Glass",     fontLabel: "Inter · dark default",  thumbClass: "theme-preset-thumb-glass",     btnLabel: "Subscribe",  badgeLabel: "Free",   badgeClass: "" },
  { id: "earth",     label: "Earth Tones",    fontLabel: "Lora",                  thumbClass: "theme-preset-thumb-earth",     btnLabel: "Read more",  badgeLabel: "Free",   badgeClass: "" },
  { id: "neon",      label: "Neon Night",     fontLabel: "Space Grotesk",         thumbClass: "theme-preset-thumb-neon",      btnLabel: "Listen now", badgeLabel: "Free",   badgeClass: "" },
  { id: "sunrise",   label: "Soft Sunrise",   fontLabel: "Raleway",               thumbClass: "theme-preset-thumb-sunrise",   btnLabel: "Say hi",     badgeLabel: "Free",   badgeClass: "" },
  { id: "editorial", label: "Editorial",      fontLabel: "Playfair Display",      thumbClass: "theme-preset-thumb-editorial", btnLabel: "Read piece", badgeLabel: "Free",   badgeClass: "" },
];

const HISTORY_ENTRIES = [
  { thumb: "radial-gradient(circle at 30% 20%, #C7D2FE, #F9FAFB)", name: "Indigo Serif", when: "Applied today, 2:14 PM", current: true },
  { thumb: "linear-gradient(135deg, #FED7AA, #FBCFE8, #FEF3C7)",   name: "Soft Sunrise (custom palette)", when: "Applied 3 days ago · 14h published", current: false },
  { thumb: "linear-gradient(135deg, #6366F1, #8B5CF6)",            name: "Indigo Serif", when: "Applied April 22 · 2 days published", current: false },
  { thumb: "radial-gradient(circle at 70% 30%, #A855F7, #1A0B2E)", name: "Neon Night (custom CSS)", when: "Applied April 18 · 4 days published", current: false },
  { thumb: "linear-gradient(180deg, #FAFAFA, #FFF)",               name: "Editorial",    when: "Applied April 14 · 4 days published", current: false },
  { thumb: "linear-gradient(135deg, #FED7AA, #FECACA, #D9F99D)",   name: "Earth Tones",  when: "Applied April 10 · 4 days published", current: false },
];

const DISPLAY_FONTS = [
  "Crimson Pro", "Inter", "Quicksand", "Lora",
  "Space Grotesk", "Raleway", "Playfair Display", "Cormorant",
];
const BODY_FONTS = [
  "Inter", "Crimson Pro", "Quicksand", "Lora",
  "Space Grotesk", "Raleway", "Playfair Display", "Cormorant",
];
const DISPLAY_WEIGHTS  = [["400","Regular 400"],["500","Medium 500"],["600","Semibold 600"],["700","Bold 700"]] as const;
const BODY_WEIGHTS     = [["300","Light 300"],["400","Regular 400"],["500","Medium 500"],["600","Semibold 600"]] as const;

const RECENT_COLORS = ["#6366F1","#8B5CF6","#F59E0B","#10B981","#EF4444","#0EA5E9","#EC4899","#111827"];

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsTheme() {
  // Preset gallery
  const [activePreset, setActivePreset] = useState<PresetId>("indigo");

  // Custom palette swatches
  const [swatchColors, setSwatchColors] = useState({
    primary:    "#6366F1",
    accent:     "#F59E0B",
    background: "#F9FAFB",
    text:       "#111827",
  });

  // Typography
  const [displayFont,   setDisplayFont]   = useState("Crimson Pro");
  const [displayWeight, setDisplayWeight] = useState("600");
  const [bodyFont,      setBodyFont]      = useState("Inter");
  const [bodyWeight,    setBodyWeight]    = useState("400");
  const [letterSpacing, setLetterSpacing] = useState(0);
  const [lineHeight,    setLineHeight]    = useState(155);

  // Background
  const [bgType,   setBgType]   = useState<BgType>("radial");
  const [pattern,  setPattern]  = useState<PatternId>("dots");
  const [patternOpacity, setPatternOpacity] = useState(35);

  // Density
  const [density, setDensity] = useState<DensityId>("comfortable");

  // Preview
  const [previewDevice, setPreviewDevice] = useState<DeviceId>("desktop");
  const [previewDark,   setPreviewDark]   = useState(false);

  // Save bar
  const [dirty, setDirty] = useState(false);
  const [saved, setSaved] = useState(false);

  // Tier (stub — Free tier shows banner)
  const [showFreeBanner] = useState(false);

  // Modals
  const [colorPickerOpen,  setColorPickerOpen]  = useState(false);
  const [colorPickerTarget, setColorPickerTarget] = useState<SwatchTarget>("primary");
  const [cpHex, setCpHex]  = useState("#6366F1");
  const [cpH,   setCpH]    = useState(238);
  const [cpS,   setCpS]    = useState(84);
  const [cpL,   setCpL]    = useState(66);

  const [fontModalOpen,        setFontModalOpen]        = useState(false);
  const [savePresetModalOpen,  setSavePresetModalOpen]  = useState(false);
  const [presetNameInput,      setPresetNameInput]      = useState("Studio Spring 2026");
  const [revertModalOpen,      setRevertModalOpen]      = useState(false);
  const [revertName,           setRevertName]           = useState("");

  // ── Helpers ────────────────────────────────────────────────────────────────

  function markDirty() {
    setDirty(true);
    setSaved(false);
  }

  function markSaved() {
    // TODO: wire to theme API
    setDirty(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 4000);
  }

  function handleApplyPreset(id: PresetId) {
    // TODO: wire to theme API
    setActivePreset(id);
    markDirty();
  }

  function handleSurpriseMe() {
    // TODO: wire random preset logic
    const ids = PRESETS.map((p) => p.id);
    const next = ids[Math.floor(Math.random() * ids.length)] as PresetId;
    handleApplyPreset(next);
  }

  function handleMatchLogo() {
    // TODO: wire logo color extraction API
    setCpHex("#7C3AED");
    setCpH(263); setCpS(70); setCpL(56);
  }

  function handleRandomPalette() {
    // TODO: wire harmonious palette generator
    setSwatchColors({ primary: "#0EA5E9", accent: "#F97316", background: "#FAFAFA", text: "#0F172A" });
    markDirty();
  }

  function handleResetPalette() {
    // TODO: reset to active preset palette
    markDirty();
  }

  function openColorPicker(target: SwatchTarget) {
    setColorPickerTarget(target);
    const colorMap: Record<string, string> = {
      primary:    swatchColors.primary,
      accent:     swatchColors.accent,
      background: swatchColors.background,
      text:       swatchColors.text,
    };
    setCpHex(colorMap[target] ?? "#6366F1");
    setColorPickerOpen(true);
  }

  function applyPickerColor() {
    // TODO: wire to live preview CSS custom property updates
    if (colorPickerTarget !== "logo-match") {
      setSwatchColors((prev) => ({ ...prev, [colorPickerTarget]: cpHex }));
    }
    setColorPickerOpen(false);
    markDirty();
  }

  function handleApplyTheme() {
    // TODO: wire TierGate + theme API publish
    markSaved();
  }

  function handleDiscard() {
    // TODO: confirm dialog + revert to server state
    setDirty(false);
    setSaved(false);
  }

  function handleRevert(name: string) {
    // TODO: open revert confirm
    setRevertName(name);
    setRevertModalOpen(true);
  }

  function handleRevertConfirm() {
    // TODO: wire theme history revert API
    setRevertModalOpen(false);
    markSaved();
  }

  function handleResetCustomCss() {
    // TODO: confirm + clear custom CSS in editor
  }

  function handleApplyCustomCss() {
    // TODO: wire custom CSS apply
    markDirty();
  }

  function handleRemoveUploadedFont(_name: string) {
    // TODO: wire font delete API
  }

  function handleFontUpload() {
    // TODO: wire font upload API
    setFontModalOpen(false);
    markDirty();
  }

  function handleClearPattern() {
    // TODO: clear pattern overlay
    setPattern(null);
    markDirty();
  }

  function handleSelectPattern(p: PatternId) {
    // TODO: update live preview
    setPattern(p);
    markDirty();
  }

  function handleSelectBg(t: BgType) {
    // TODO: update live preview
    setBgType(t);
    markDirty();
  }

  function handleSelectDensity(d: DensityId) {
    // TODO: update live preview
    setDensity(d);
    markDirty();
  }

  function handleTogglePreviewDark() {
    // TODO: toggle preview frame dark mode tokens
    setPreviewDark((v) => !v);
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  const cpTitleMap: Record<SwatchTarget, string> = {
    primary:    "Pick a color · Primary",
    accent:     "Pick a color · Accent",
    background: "Pick a color · Background",
    text:       "Pick a color · Text",
    "logo-match": "Pick a color · Match my logo",
  };

  return (
    <div className="settings-content" id="theme-pane">

      {/* ── Tier upsell banner (Free tier only) ────────────────────────────── */}
      {showFreeBanner && (
        <div className="theme-tier-banner">
          <div className="theme-tb-ico">🎨</div>
          <div className="theme-tb-text">
            <div className="theme-tb-title">You're on Free — pick any of the 8 starter themes</div>
            <div className="theme-tb-sub">Custom palette, custom fonts, background images, and patterns unlock on Pro. Custom CSS unlocks on Business.</div>
          </div>
          <button type="button" className="btn btn-primary btn-sm">
            {/* TODO: wire to upgrade flow */}
            See plans
          </button>
        </div>
      )}

      {/* ── Two-column: controls + sticky live preview ──────────────────────── */}
      <div className="theme-tab-grid">

        {/* ════════════════════════════════════════════════
            LEFT COLUMN — controls
            ════════════════════════════════════════════════ */}
        <div className="theme-tab-controls">

          {/* ── 1. Theme presets ──────────────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-presets">
            <div className="section-head-row">
              <div className="sh-text">
                <div className="settings-section-title" id="sec-presets">Theme presets</div>
                <p className="settings-section-lede">Eight curated starting points. Click one to apply it instantly to the live preview — nothing publishes until you hit Apply theme.</p>
              </div>
              <div className="sh-actions">
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  data-tip="Preview a randomly picked preset"
                  onClick={handleSurpriseMe}
                >
                  🎲 Surprise me
                </button>
              </div>
            </div>

            <div className="theme-preset-grid" id="preset-grid">
              {PRESETS.map((p) => {
                const isActive = activePreset === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    className={`theme-preset-card${isActive ? " is-active" : ""}`}
                    data-preset={p.id}
                    onClick={() => handleApplyPreset(p.id)}
                  >
                    <div className={`theme-preset-thumb ${p.thumbClass}`}>
                      <span className="theme-pt-mini-btn">{p.btnLabel}</span>
                    </div>
                    <div className="theme-preset-meta">
                      <div>
                        <div className="theme-pm-name">{p.label}</div>
                        <div className="theme-pm-font">{p.fontLabel}</div>
                      </div>
                      <span className={`chip${p.badgeClass ? ` ${p.badgeClass}` : ""}`} style={{ fontSize: 10 }}>
                        {p.badgeLabel}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 2. Custom palette (Pro+) ────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-palette">
            <div className="section-head-row">
              <div className="sh-text">
                <div className="settings-section-title" id="sec-palette">
                  Custom palette
                  <span className="chip-tier pro">PRO</span>
                </div>
                <p className="settings-section-lede">Override any preset color. Each swatch opens a picker with HEX, HSL sliders, and a contrast checker so your text stays readable.</p>
              </div>
              <div className="sh-actions">
                <button type="button" className="theme-ai-btn" onClick={() => openColorPicker("logo-match")}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    <path d="M2 17l10 5 10-5"/>
                    <path d="M2 12l10 5 10-5"/>
                  </svg>
                  Match my logo
                </button>
                <button type="button" className="theme-ai-btn is-warm" onClick={handleRandomPalette}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M16 8l-8 8M8 8l8 8"/>
                  </svg>
                  Random palette <span className="chip-tier creator" style={{ marginLeft: 4 }}>CREATOR</span>
                </button>
              </div>
            </div>

            <div className="theme-swatch-row">
              {(["primary","accent","background","text"] as const).map((key) => {
                const labels: Record<string, string> = { primary: "Primary", accent: "Accent", background: "Background", text: "Text" };
                const tips: Record<string, string>   = { primary: "Primary — buttons + accents", accent: "Accent — secondary highlights", background: "Page background", text: "Body text" };
                const needsBorder = key === "background";
                return (
                  <button
                    key={key}
                    type="button"
                    className="theme-swatch"
                    data-tip={tips[key]}
                    onClick={() => openColorPicker(key as SwatchTarget)}
                  >
                    <div
                      className="theme-sw-block"
                      style={{
                        background: swatchColors[key],
                        boxShadow: needsBorder ? "inset 0 0 0 1px rgba(17,24,39,0.10)" : undefined,
                      }}
                    />
                    <div className="theme-sw-name">{labels[key]}</div>
                    <div className="theme-sw-hex">{swatchColors[key]}</div>
                  </button>
                );
              })}
            </div>

            <div className="theme-palette-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSavePresetModalOpen(true)} data-tip="Save your custom palette to your preset library">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save as preset <span className="chip-tier pro" style={{ marginLeft: 4 }}>PRO</span>
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetPalette}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="1 4 1 10 7 10"/>
                  <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
                </svg>
                Reset to preset
              </button>
            </div>
          </section>

          {/* ── 3. Typography ───────────────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-typography">
            <div className="settings-section-title" id="sec-typography">Typography</div>
            <p className="settings-section-lede">Pick a display font for headings and a body font for everything else. Mix and match — or upload your own (Business).</p>

            {/* Display font */}
            <div className="field-row">
              <div className="field-label">
                Display font
                <span className="field-hint">Used for the page title, block headlines, and creator name</span>
              </div>
              <div className="field-body">
                <div className="row-2">
                  <select
                    className="field-select"
                    value={displayFont}
                    onChange={(e) => { setDisplayFont(e.target.value); markDirty(); }}
                  >
                    {DISPLAY_FONTS.map((f) => (
                      <option key={f} value={f}>{f}{f === "Crimson Pro" ? " (default)" : ""}</option>
                    ))}
                  </select>
                  <select
                    className="field-select"
                    value={displayWeight}
                    onChange={(e) => { setDisplayWeight(e.target.value); markDirty(); }}
                  >
                    {DISPLAY_WEIGHTS.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Body font */}
            <div className="field-row">
              <div className="field-label">
                Body font
                <span className="field-hint">Used for block labels, bio, captions</span>
              </div>
              <div className="field-body">
                <div className="row-2">
                  <select
                    className="field-select"
                    value={bodyFont}
                    onChange={(e) => { setBodyFont(e.target.value); markDirty(); }}
                  >
                    {BODY_FONTS.map((f) => (
                      <option key={f} value={f}>{f}{f === "Inter" ? " (default)" : ""}</option>
                    ))}
                  </select>
                  <select
                    className="field-select"
                    value={bodyWeight}
                    onChange={(e) => { setBodyWeight(e.target.value); markDirty(); }}
                  >
                    {BODY_WEIGHTS.map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Letter spacing */}
            <div className="field-row">
              <div className="field-label">
                Letter spacing
                <span className="field-hint">Tighten or loosen everything in lockstep</span>
              </div>
              <div className="field-body">
                <div className="theme-cp-row">
                  <input
                    type="range" min={-3} max={6} step={1}
                    value={letterSpacing}
                    onChange={(e) => { setLetterSpacing(+e.target.value); markDirty(); }}
                  />
                  <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 48, textAlign: "right" }}>
                    {(letterSpacing / 100).toFixed(2)}em
                  </span>
                </div>
              </div>
            </div>

            {/* Line height */}
            <div className="field-row">
              <div className="field-label">
                Line height
                <span className="field-hint">More for airy, less for compact</span>
              </div>
              <div className="field-body">
                <div className="theme-cp-row">
                  <input
                    type="range" min={120} max={180} step={5}
                    value={lineHeight}
                    onChange={(e) => { setLineHeight(+e.target.value); markDirty(); }}
                  />
                  <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 48, textAlign: "right" }}>
                    {(lineHeight / 100).toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* Custom fonts */}
            <div className="field-row">
              <div className="field-label">
                Custom fonts
                <span className="field-hint">.woff2 / .woff / .ttf · 2MB each · 4 max</span>
              </div>
              <div className="field-body">
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFontModalOpen(true)}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    Upload font
                  </button>
                  <span className="chip-tier business">BUSINESS</span>
                  <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>2 of 4 used</span>
                </div>
                <div className="theme-uploaded-fonts">
                  <div className="theme-uploaded-font">
                    <span style={{ fontFamily: "'Cormorant', serif", fontWeight: 600, fontSize: 18, width: 32 }}>Aa</span>
                    <span className="theme-uf-name">Atelier-Display.woff2</span>
                    <span className="theme-uf-size">142 KB</span>
                    <button type="button" className="iconbtn" data-tip="Remove" onClick={() => handleRemoveUploadedFont("Atelier-Display.woff2")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                  <div className="theme-uploaded-font">
                    <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: 16, width: 32 }}>Aa</span>
                    <span className="theme-uf-name">Manrope-Variable.woff2</span>
                    <span className="theme-uf-size">86 KB</span>
                    <button type="button" className="iconbtn" data-tip="Remove" onClick={() => handleRemoveUploadedFont("Manrope-Variable.woff2")}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── 4. Background style ─────────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-bg">
            <div className="settings-section-title" id="sec-bg">Background style</div>
            <p className="settings-section-lede">How the page sits behind your blocks. Solid is fastest, gradients add personality, images are unique to you.</p>

            <div className="field-row">
              <div className="field-label">Type</div>
              <div className="field-body">
                <div className="theme-radio-row">
                  <button
                    type="button"
                    className={`theme-radio-card${bgType === "solid" ? " is-active" : ""}`}
                    data-bg="solid"
                    onClick={() => handleSelectBg("solid")}
                  >
                    <div className="theme-rc-swatch" style={{ background: "#F9FAFB" }} />
                    <div>Solid</div>
                    <div className="theme-rc-sub">Background swatch</div>
                  </button>
                  <button
                    type="button"
                    className={`theme-radio-card${bgType === "gradient" ? " is-active" : ""}`}
                    data-bg="gradient"
                    onClick={() => handleSelectBg("gradient")}
                  >
                    <div className="theme-rc-swatch" style={{ background: "linear-gradient(135deg,#EEF2FF,#FED7AA)" }} />
                    <div>Gradient</div>
                    <div className="theme-rc-sub">From palette</div>
                  </button>
                  <button
                    type="button"
                    className={`theme-radio-card${bgType === "radial" ? " is-active" : ""}`}
                    data-bg="radial"
                    onClick={() => handleSelectBg("radial")}
                  >
                    <div className="theme-rc-swatch" style={{ background: "radial-gradient(circle at 30% 20%, #C7D2FE, #F9FAFB)" }} />
                    <div>Radial wash</div>
                    <div className="theme-rc-sub">Indigo Serif default</div>
                  </button>
                  <button
                    type="button"
                    className={`theme-radio-card${bgType === "image" ? " is-active" : ""}`}
                    data-bg="image"
                    onClick={() => handleSelectBg("image")}
                  >
                    <div
                      className="theme-rc-swatch"
                      style={{
                        background: "linear-gradient(135deg,#94A3B8,#475569)",
                        backgroundImage: "radial-gradient(rgba(255,255,255,0.18) 1px, transparent 1px)",
                        backgroundSize: "6px 6px",
                      }}
                    />
                    <div>Custom image</div>
                    <div className="theme-rc-sub"><span className="chip-tier pro" style={{ fontSize: 9 }}>PRO</span></div>
                  </button>
                </div>
              </div>
            </div>

            {/* Image controls */}
            <div className="field-row" id="bg-image-controls">
              <div className="field-label">
                Image controls
                <span className="field-hint">Active when type = Custom image</span>
              </div>
              <div className="field-body">
                <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 10, flexWrap: "wrap" }}>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => { /* TODO: open file picker */ }}>Replace image</button>
                  <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>studio-wall.jpg · 1.4 MB</span>
                </div>
                <div className="row-2" style={{ marginBottom: 8 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Opacity</label>
                    <div className="theme-cp-row">
                      <input type="range" min={0} max={100} defaultValue={60} onChange={() => { /* TODO */ }} />
                      <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 38, textAlign: "right" }}>60%</span>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Blur</label>
                    <div className="theme-cp-row">
                      <input type="range" min={0} max={40} defaultValue={8} onChange={() => { /* TODO */ }} />
                      <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 38, textAlign: "right" }}>8px</span>
                    </div>
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Fit</label>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => { /* TODO */ }}>Cover</button>
                    <button type="button" className="btn btn-ghost btn-xs" style={{ background: "rgba(99,102,241,0.10)", borderColor: "rgba(99,102,241,0.30)", color: "var(--brand-primary)" }} onClick={() => { /* TODO */ }}>Tile</button>
                    <button type="button" className="btn btn-ghost btn-xs" onClick={() => { /* TODO */ }}>Contain</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Pattern overlay */}
            <div className="field-row">
              <div className="field-label">
                Pattern overlay
                <span className="field-hint"><span className="chip-tier pro" style={{ fontSize: 9 }}>PRO</span> · 6 SVG patterns blend on top of background</span>
              </div>
              <div className="field-body">
                <div className="theme-pattern-row">
                  {(["dots","grid","waves","hex","tri","noise"] as const).map((p) => {
                    const names: Record<string, string> = { dots: "Dots", grid: "Grid", waves: "Waves", hex: "Hexagons", tri: "Triangles", noise: "Noise" };
                    return (
                      <button
                        key={p}
                        type="button"
                        className={`theme-pattern-card theme-pn-${p}${pattern === p ? " is-active" : ""}`}
                        data-pattern={p}
                        onClick={() => handleSelectPattern(p)}
                      >
                        <div className="theme-pn-name">{names[p]}</div>
                      </button>
                    );
                  })}
                </div>
                <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Opacity</span>
                  <input
                    type="range" min={0} max={100}
                    value={patternOpacity}
                    onChange={(e) => { setPatternOpacity(+e.target.value); markDirty(); }}
                    style={{ flex: 1, maxWidth: 200 }}
                  />
                  <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>{patternOpacity}%</span>
                  <button type="button" className="btn btn-ghost btn-xs" onClick={handleClearPattern}>Clear</button>
                </div>
              </div>
            </div>
          </section>

          {/* ── 5. Spacing & density ────────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-density">
            <div className="settings-section-title" id="sec-density">Spacing &amp; density</div>
            <p className="settings-section-lede">
              How tightly or loosely your blocks sit on the page. We map this to{" "}
              <code className="mono" style={{ fontSize: "11.5px" }}>--space-*</code> tokens.
            </p>

            <div className="theme-density-row">
              {(["compact","comfortable","roomy"] as const).map((d) => {
                const labels: Record<DensityId, [string, string]> = {
                  compact:     ["Compact",     "More on screen"],
                  comfortable: ["Comfortable", "Default — balanced"],
                  roomy:       ["Roomy",        "Premium feel"],
                };
                const barCounts: Record<DensityId, number> = { compact: 4, comfortable: 3, roomy: 2 };
                return (
                  <button
                    key={d}
                    type="button"
                    className={`theme-radio-card theme-density-card${density === d ? " is-active" : ""}`}
                    data-density={d}
                    onClick={() => handleSelectDensity(d)}
                  >
                    <div className="theme-rc-swatch" style={{ height: 60 }}>
                      {Array.from({ length: barCounts[d] }).map((_, i) => (
                        <div key={i} className="theme-rc-bar" />
                      ))}
                    </div>
                    <div>{labels[d][0]}</div>
                    <div className="theme-rc-sub">{labels[d][1]}</div>
                  </button>
                );
              })}
            </div>
          </section>

          {/* ── 6. Custom CSS (Business+) ───────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-css">
            <div className="section-head-row">
              <div className="sh-text">
                <div className="settings-section-title" id="sec-css">
                  Custom CSS
                  <span className="chip-tier business">BUSINESS</span>
                </div>
                <p className="settings-section-lede">For when the controls above don't go far enough. Wrapped in a scoped layer so you can't break the editor or sign-in flows.</p>
              </div>
              <div className="sh-actions">
                <button type="button" className="btn btn-ghost btn-sm" onClick={handleResetCustomCss}>Reset</button>
                <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyCustomCss}>Apply</button>
              </div>
            </div>

            <div className="theme-css-editor-wrap">
              <div className="theme-css-editor-head">
                <div className="theme-ce-tabs">
                  <span className="theme-ce-dot r" /><span className="theme-ce-dot y" /><span className="theme-ce-dot g" />
                  <span className="theme-ce-file">theme.custom.css</span>
                </div>
                <span>scoped @layer custom</span>
              </div>
              <pre className="theme-css-editor-body">
                <span className="theme-css-comment">{"/* Your CSS lands inside @layer theme-custom { ... } */"}</span>{"\n"}
                <span className="theme-css-comment">{"/* The 4 palette swatches are exposed as CSS custom properties: */"}</span>{"\n"}
                <span className="theme-css-selector">{":root"}</span>{" {\n"}
                {"  "}<span className="theme-css-comment">{"/* readable in your overrides */"}</span>{"\n"}{"\n"}
                {"}\n\n"}
                <span className="theme-css-selector">{".creator-page .block"}</span>{" {\n"}
                {"  "}<span className="theme-css-prop">{"border-radius"}</span>{": "}<span className="theme-css-num">{"22px"}</span>{";\n"}
                {"  "}<span className="theme-css-prop">{"box-shadow"}</span>{": "}<span className="theme-css-num">{"0"}</span>{" "}<span className="theme-css-num">{"8px"}</span>{" "}<span className="theme-css-num">{"24px"}</span>{" "}<span className="theme-css-value">{"rgba"}</span>{"("}<span className="theme-css-num">{"17"}</span>{","}<span className="theme-css-num">{"24"}</span>{","}<span className="theme-css-num">{"39"}</span>{","}<span className="theme-css-num">{"0.06"}</span>{");\n"}
                {"  "}<span className="theme-css-prop">{"transition"}</span>{": "}<span className="theme-css-prop">{"transform"}</span>{" "}<span className="theme-css-num">{"160ms"}</span>{" "}<span className="theme-css-value">{"ease"}</span>{";\n"}{"\n"}
                {"}\n"}
                <span className="theme-css-selector">{".creator-page .block"}</span><span className="theme-css-prop">{":hover"}</span>{" {\n"}
                {"  "}<span className="theme-css-prop">{"transform"}</span>{": "}<span className="theme-css-value">{"translateY"}</span>{"("}<span className="theme-css-num">{"-2px"}</span>{");\n"}{"\n"}
                {"}\n\n"}
                <span className="theme-css-selector">{".creator-page .pf-name"}</span>{" {\n"}
                {"  "}<span className="theme-css-prop">{"background"}</span>{": "}<span className="theme-css-value">{"linear-gradient"}</span>{"("}<span className="theme-css-num">{"90deg"}</span>{", "}<span className="theme-css-value">{"var"}</span>{"("}<span className="theme-css-prop">{"--theme-primary"}</span>{"), "}<span className="theme-css-value">{"var"}</span>{"("}<span className="theme-css-prop">{"--theme-accent"}</span>{"))"+";\n"}
                {"  "}<span className="theme-css-prop">{"-webkit-background-clip"}</span>{": "}<span className="theme-css-value">{"text"}</span>{";\n"}
                {"  "}<span className="theme-css-prop">{"color"}</span>{": "}<span className="theme-css-value">{"transparent"}</span>{";\n"}{"\n"}
                {"}"}
              </pre>
              <div className="theme-css-editor-foot">
                <span>1,247 chars · 22 lines · CSS valid ✓</span>
                <span>Last saved 4 min ago</span>
              </div>
            </div>

            <div className="theme-css-disclaim">
              ⚠️ Custom CSS is power-user territory. We don't support arbitrary CSS in customer support — if your page breaks, the first thing we'll ask is to clear this field.
            </div>
          </section>

          {/* ── 7. Theme history (Pro+) ────────────────────────────────────── */}
          <section className="settings-section" aria-labelledby="sec-history">
            <div className="section-head-row">
              <div className="sh-text">
                <div className="settings-section-title" id="sec-history">
                  Theme history
                  <span className="chip-tier pro">PRO</span>
                </div>
                <p className="settings-section-lede">Your last 10 published themes. Click revert to roll back instantly — no re-design needed.</p>
              </div>
            </div>

            <div className="theme-history-list">
              {HISTORY_ENTRIES.map((entry, i) => (
                <div key={i} className="theme-history-row">
                  <div
                    className="theme-hr-thumb"
                    style={{
                      background: entry.thumb,
                      ...(entry.name === "Editorial" ? { borderBottom: "3px solid #DC2626" } : {}),
                    }}
                  />
                  <div className="theme-hr-meta">
                    <div className="theme-hr-name">
                      {entry.name}
                      {entry.current && <span className="chip success" style={{ fontSize: 10, marginLeft: 6 }}>Current</span>}
                    </div>
                    <div className="theme-hr-when">{entry.when}</div>
                  </div>
                  {!entry.current && (
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs theme-hr-revert"
                      onClick={() => handleRevert(entry.name)}
                    >
                      Revert
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>{/* /theme-tab-controls */}

        {/* ════════════════════════════════════════════════
            RIGHT COLUMN — sticky live preview
            ════════════════════════════════════════════════ */}
        <aside className="theme-preview-col" aria-label="Live preview">
          <div className="theme-preview-panel">
            <div className="theme-preview-panel-head">
              <div className="theme-pp-title">Live preview · tadaify.com/alexandra</div>
              <div className="theme-preview-segment">
                {(["desktop","tablet","mobile"] as const).map((d) => {
                  const icons: Record<DeviceId, ReactElement> = {
                    desktop: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>,
                    tablet:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
                    mobile:  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>,
                  };
                  const tips: Record<DeviceId, string> = { desktop: "Desktop", tablet: "Tablet", mobile: "Mobile" };
                  return (
                    <button
                      key={d}
                      type="button"
                      className={previewDevice === d ? "is-active" : ""}
                      data-device={d}
                      data-tip={tips[d]}
                      onClick={() => setPreviewDevice(d)}
                    >
                      {icons[d]}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="theme-preview-stage" data-device={previewDevice}>
              <div className={`theme-preview-frame${pattern ? " has-pattern" : ""}`}>
                <div className="theme-pf-avatar">A</div>
                <div className="theme-pf-name">Alexandra Silva</div>
                <div className="theme-pf-handle">@alexandra</div>
                <div className="theme-pf-bio">Designer &amp; writer. Currently building tadaify.</div>
                <a className="theme-pf-block is-primary">Subscribe to my newsletter →</a>
                <a className="theme-pf-block">Latest essay on craft</a>
                <a className="theme-pf-block">Book a 30-min call</a>
                <a className="theme-pf-block">Spotify · Late nights playlist</a>
                <div className="theme-pf-socials">
                  <span className="theme-pf-soc" /><span className="theme-pf-soc" /><span className="theme-pf-soc" /><span className="theme-pf-soc" />
                </div>
              </div>
            </div>

            <div className="theme-preview-panel-foot">
              <span className="theme-pf-update">
                <span className="theme-pf-dot" /> Live · updates as you change controls
              </span>
              <button
                type="button"
                className="btn btn-ghost btn-xs"
                onClick={handleTogglePreviewDark}
              >
                {previewDark ? "☀️ Light" : "🌙 Dark"}
              </button>
            </div>
          </div>
        </aside>

      </div>{/* /theme-tab-grid */}

      {/* ── Sticky save bar ─────────────────────────────────────────────────── */}
      <div className={`theme-save-bar${saved ? " is-saved" : ""}`}>
        <div className="theme-save-hint">
          <span className="theme-save-dot" />
          <span>
            {saved
              ? "✓ Theme published. Visitors see it within 30 seconds."
              : "Preview only — your live page hasn't changed yet."}
          </span>
        </div>
        <div className="theme-save-actions">
          <button type="button" className="btn btn-ghost btn-sm" onClick={handleDiscard}>Discard</button>
          <button type="button" className="btn btn-primary btn-sm" onClick={handleApplyTheme}>Apply theme</button>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════
          COLOR PICKER MODAL
          ══════════════════════════════════════════════════════════ */}
      {colorPickerOpen && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setColorPickerOpen(false); }}
        >
          <div className="modal modal-wide" role="dialog" aria-labelledby="cp-title">
            <button type="button" className="modal-close-x" onClick={() => setColorPickerOpen(false)} aria-label="Close">×</button>
            <h3 id="cp-title">{cpTitleMap[colorPickerTarget]}</h3>
            <p className="modal-sub">HEX, RGB, or HSL — whichever feels natural. We'll show you whether your text stays readable on it.</p>

            <div className="theme-cp-grid">
              <div>
                <div className="theme-cp-preview" style={{ background: cpHex }}>{cpHex}</div>
                <div style={{ marginTop: 10 }}>
                  <label style={{ display: "block", marginBottom: 6 }}>Recently used</label>
                  <div className="theme-cp-recent">
                    {RECENT_COLORS.map((c) => (
                      <span
                        key={c}
                        className="theme-cp-chip"
                        style={{ background: c }}
                        onClick={() => setCpHex(c)}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="theme-cp-controls">
                <div>
                  <label>HEX</label>
                  <div className="theme-cp-row">
                    <input
                      type="text"
                      value={cpHex}
                      onChange={(e) => setCpHex(e.target.value)}
                      style={{ fontFamily: "var(--font-mono)", fontSize: 13, padding: "8px 10px", borderRadius: 8, border: "1px solid var(--border-strong)", background: "var(--bg)", color: "var(--fg)", width: 110, outline: "none" }}
                    />
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      data-tip="Copy"
                      onClick={() => { /* TODO: copy to clipboard */ }}
                    >📋</button>
                  </div>
                </div>

                <div>
                  <label>Hue · <span className="mono">{cpH}°</span></label>
                  <div className="theme-cp-row">
                    <input type="range" min={0} max={360} value={cpH} onChange={(e) => setCpH(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Saturation · <span className="mono">{cpS}%</span></label>
                  <div className="theme-cp-row">
                    <input type="range" min={0} max={100} value={cpS} onChange={(e) => setCpS(+e.target.value)} />
                  </div>
                </div>
                <div>
                  <label>Lightness · <span className="mono">{cpL}%</span></label>
                  <div className="theme-cp-row">
                    <input type="range" min={0} max={100} value={cpL} onChange={(e) => setCpL(+e.target.value)} />
                  </div>
                </div>

                <div className="theme-cp-actions" style={{ marginTop: 6 }}>
                  <button type="button" className="theme-ai-btn" onClick={handleMatchLogo}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M12 2L2 7l10 5 10-5-10-5z"/>
                    </svg>
                    Match my logo
                  </button>
                </div>

                <div className="theme-cp-contrast">
                  <span>Contrast vs Background <span className="mono" style={{ fontSize: "11.5px", opacity: 0.7 }}>(#F9FAFB)</span></span>
                  <span className="theme-cp-badge aa">5.41 · AA pass</span>
                </div>
              </div>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setColorPickerOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={applyPickerColor}>Apply color</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          CUSTOM FONT UPLOAD MODAL
          ══════════════════════════════════════════════════════════ */}
      {fontModalOpen && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setFontModalOpen(false); }}
        >
          <div className="modal" role="dialog" aria-labelledby="fm-title">
            <button type="button" className="modal-close-x" onClick={() => setFontModalOpen(false)} aria-label="Close">×</button>
            <h3 id="fm-title">Upload a custom font</h3>
            <p className="modal-sub">For brand fonts not on Google Fonts. We accept .woff2 (best), .woff, and .ttf — up to 2MB each, 4 fonts per workspace.</p>

            <div className="theme-upload-zone" onClick={() => { /* TODO: open file picker */ }}>
              <div style={{ fontSize: 28, marginBottom: 6 }}>⬆️</div>
              Drag your <strong>.woff2</strong> file here, or <strong>browse</strong>
              <div style={{ marginTop: 6, fontSize: 12, color: "var(--fg-subtle)" }}>2MB max · woff2 / woff / ttf</div>
            </div>

            <div style={{ marginTop: 14 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Family name</label>
              <input className="field-input" placeholder="e.g. Atelier Display" />
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setFontModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleFontUpload}>Upload</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          SAVE PRESET MODAL
          ══════════════════════════════════════════════════════════ */}
      {savePresetModalOpen && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setSavePresetModalOpen(false); }}
        >
          <div className="modal" role="dialog" aria-labelledby="sp-title">
            <button type="button" className="modal-close-x" onClick={() => setSavePresetModalOpen(false)} aria-label="Close">×</button>
            <h3 id="sp-title">Save palette as preset</h3>
            <p className="modal-sub">Add your current 4-color palette to your personal preset library. Reuse it across pages or share with collaborators (Business).</p>

            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6, display: "block" }}>Preset name</label>
              <input
                className="field-input"
                placeholder="e.g. Studio Spring 2026"
                value={presetNameInput}
                onChange={(e) => setPresetNameInput(e.target.value)}
              />
            </div>

            <div className="theme-cp-contrast" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <span>Saving 4 colors · Primary, Accent, Background, Text</span>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setSavePresetModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={() => { /* TODO: save preset API */ setSavePresetModalOpen(false); }}>Save preset</button>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════
          REVERT CONFIRM MODAL
          ══════════════════════════════════════════════════════════ */}
      {revertModalOpen && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setRevertModalOpen(false); }}
        >
          <div className="modal" role="dialog" aria-labelledby="rv-title">
            <button type="button" className="modal-close-x" onClick={() => setRevertModalOpen(false)} aria-label="Close">×</button>
            <h3 id="rv-title">Revert to <span>{revertName}</span>?</h3>
            <p className="modal-sub">This will replace your current theme on the live page. The current theme will be saved in history so you can come back to it.</p>

            <div className="theme-cp-contrast" style={{ background: "var(--bg)", border: "1px solid var(--border)" }}>
              <span>Visitors see the change within 30 seconds.</span>
            </div>

            <div className="modal-actions">
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRevertModalOpen(false)}>Cancel</button>
              <button type="button" className="btn btn-primary btn-sm" onClick={handleRevertConfirm}>Revert &amp; publish</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
