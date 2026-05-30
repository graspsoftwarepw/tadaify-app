/**
 * DesignTheme — Theme sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 2927-3013
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .ai-theme-card, .ai-theme-head, .ai-spark, .ai-tokens-pill,
 *   .ai-theme-input-row, .ai-theme-prompt, .ai-image-btn, .ai-generate-btn,
 *   .ai-suggest-chips, .ai-chip, .ai-tier-hint, .tile-grid, .tile,
 *   .theme-{minimal,bold,editorial,playful,dark,sunset,ocean,nord}.
 *
 * Visual only — AI generate is a no-op stub; tier ladder copy is static.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-09..12
 */

import { useState } from "react";

const THEME_PRESETS = [
  { id: "minimal", label: "Minimal" },
  { id: "bold", label: "Bold" },
  { id: "editorial", label: "Editorial" },
  { id: "playful", label: "Playful" },
  { id: "dark", label: "Dark" },
  { id: "sunset", label: "Sunset" },
  { id: "ocean", label: "Ocean" },
  { id: "nord", label: "Nord" },
] as const;

const AI_HINTS = [
  "cozy bookstore",
  "90s zine",
  "brutalist concrete",
  "soft pastel skincare",
  "vinyl record store",
];

interface DesignThemeProps {
  onSave?: (toast: string) => void;
}

export function DesignTheme({ onSave }: DesignThemeProps) {
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string>("bold");

  // TODO(#173 backend): wire AI theme generation to API
  const handleGenerate = () => {
    onSave?.("AI matching…");
  };

  // TODO(#173 backend): wire image-based theme match (extract 2 dominant colors)
  const handleImageSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onSave?.("Inspiration uploaded");
  };

  return (
    <>
      {/* ✨ AI theme matcher card (mockup lines 2930-2994) */}
      <div className="field-group ai-theme-card">
        <div className="ai-theme-head">
          <div>
            <label
              className="fg-label"
              style={{ display: "flex", alignItems: "center", gap: 8, margin: 0 }}
            >
              <span className="ai-spark" aria-hidden="true">
                <svg
                  viewBox="0 0 24 24"
                  width={18}
                  height={18}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2l2.4 5.4L20 10l-5.6 2.6L12 18l-2.4-5.4L4 10l5.6-2.6L12 2z" />
                  <path d="M19 17l.6 1.4L21 19l-1.4.6L19 21l-.6-1.4L17 19l1.4-.6L19 17z" />
                </svg>
              </span>
              Generate with AI
            </label>
            <div className="fg-help" style={{ marginTop: 6 }}>
              Describe what you like — or upload a photo that captures the vibe. We'll match you
              to the closest theme from our catalogue of 1000+ presets.
            </div>
          </div>
          <span className="ai-tokens-pill" data-tip="AI credits reset on the 1st of each month">
            <strong>4</strong>
            &nbsp;/&nbsp;5 AI credits left
          </span>
        </div>

        <div className="ai-theme-input-row">
          <input
            type="text"
            className="ai-theme-prompt"
            placeholder="e.g. warm sunset over Lisbon rooftops, editorial feel"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            maxLength={120}
            aria-label="AI theme prompt"
          />
          <label
            htmlFor="ai-theme-image"
            className="ai-image-btn"
            data-tip="Upload an inspiration image — we extract the 2 dominant colors and match a theme"
          >
            <svg
              viewBox="0 0 24 24"
              width={18}
              height={18}
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="3" width="18" height="18" rx="2" />
              <circle cx="9" cy="9" r="2" />
              <path d="M21 15l-5-5-9 9" />
            </svg>
            <span className="hide-sm">Image</span>
          </label>
          <input
            type="file"
            id="ai-theme-image"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImageSelected}
          />
          <button
            type="button"
            className="btn btn-warm ai-generate-btn"
            onClick={handleGenerate}
          >
            <span className="ai-btn-label">✨ Generate</span>
          </button>
        </div>

        {/* Suggested chips */}
        <div className="ai-suggest-chips">
          <span className="ai-suggest-label">Try:</span>
          {AI_HINTS.map((hint) => (
            <button
              key={hint}
              type="button"
              className="ai-chip"
              onClick={() => setPrompt(hint)}
            >
              {hint}
            </button>
          ))}
        </div>

        {/* Tier hint (subtle, AP-028) — DEC-286: 5/20/100/∞ */}
        <div className="ai-tier-hint">
          💡 Free: <strong>5 AI credits/mo</strong>. Creator <strong>20</strong> · Pro{" "}
          <strong>100</strong> · Business <strong>unlimited</strong>. Price locked for life.
        </div>
      </div>

      {/* Preset catalogue */}
      <div className="field-group">
        <label className="fg-label">Or pick a preset</label>
        <div className="fg-help">
          A preset sets all seven layers at once — you can still tweak any of them after.
        </div>
        <div className="tile-grid">
          {THEME_PRESETS.map((preset) => {
            const isSelected = selectedPreset === preset.id;
            return (
              <div
                key={preset.id}
                className={`tile${isSelected ? " selected" : ""}`}
                data-theme-preset={preset.id}
                role="button"
                tabIndex={0}
                aria-pressed={isSelected}
                onClick={() => {
                  setSelectedPreset(preset.id);
                  onSave?.("Saved");
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelectedPreset(preset.id);
                    onSave?.("Saved");
                  }
                }}
              >
                <div
                  className={`theme-${preset.id}`}
                  style={{ position: "absolute", inset: 0 }}
                />
                <div className="tile-label">{preset.label}</div>
              </div>
            );
          })}
        </div>
        <div className="fg-help" style={{ marginTop: 10, fontSize: 12 }}>
          Browsing all <strong>1000+ themes</strong>?{" "}
          <a href="#" className="link-inline">
            Open theme library →
          </a>
        </div>
      </div>
    </>
  );
}
