/**
 * Settings · Theme tab — preset gallery, custom palette (Pro), typography,
 * background style + pattern overlays (Pro), spacing & density, custom CSS
 * (Business), theme history (Pro), and a sticky live-preview pane. Faithful
 * port of mockups/tadaify-mvp/app-settings-theme.html, composed on the shared
 * SettingsShell primitives.
 *
 * Presentational, local-state only: picking a preset / background / pattern /
 * density highlights it and flips the shell save-bar to dirty (registered via
 * `onSaveBar`, with the Theme "Preview only…" copy and an "Apply theme"
 * button). A palette swatch opens a centred colour-picker modal that closes on
 * Escape / backdrop / Cancel. Premium controls stay fully visible and
 * interactive on every tier; the gate is mocked at Apply. Data comes from the
 * typed themeFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import {
  SettingsSection,
  FieldRow,
  TierChip,
  SettingsModal,
  type SaveBar,
} from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import type { SettingsTabProps } from "./AccountTab";
import { themeFixture } from "./themeFixture";

export function ThemeTab({ onSaveBar }: Pick<SettingsTabProps, "onSaveBar">) {
  const fx = themeFixture();

  const [preset, setPreset] = useState(fx.activePreset);
  const [bg, setBg] = useState(fx.activeBg);
  const [pattern, setPattern] = useState(fx.activePattern);
  const [density, setDensity] = useState(fx.activeDensity);
  const [device, setDevice] = useState<"desktop" | "tablet" | "mobile">("desktop");
  const [picker, setPicker] = useState<string | null>(null);

  const markDirty = () =>
    onSaveBar({
      state: "dirty",
      hint: "Preview only — your live page hasn't changed yet.",
      saveLabel: "Apply theme",
      onSave: () => {
        alert("Mockup — would publish the theme to your live page");
        onSaveBar(null);
      },
      onDiscard: () => onSaveBar(null),
    });

  const pickerSwatch = fx.palette.find((p) => p.id === picker);

  return (
    <div className="theme-grid">
      {/* ── Left column: controls ── */}
      <div className="theme-controls">
        {/* 1. Presets */}
        <SettingsSection
          title="Theme presets"
          lede="Eight curated starting points. Click one to apply it instantly to the live preview — nothing publishes until you hit Apply theme."
          action={
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setPreset(fx.presets[Math.floor(Math.random() * fx.presets.length)].id); markDirty(); }}>
              🎲 Surprise me
            </button>
          }
        >
          <div className="preset-grid">
            {fx.presets.map((p) => (
              <button
                key={p.id}
                type="button"
                className={`preset-card${p.id === preset ? " is-active" : ""}`}
                onClick={() => { setPreset(p.id); markDirty(); }}
              >
                <div className="preset-thumb" style={{ background: p.thumb }}>
                  <span className="pt-mini-btn" style={{ background: p.miniBg, color: p.miniColor }}>{p.miniLabel}</span>
                </div>
                <div className="preset-meta">
                  <div>
                    <div className="pm-name">{p.name}</div>
                    <div className="pm-font">{p.font}</div>
                  </div>
                  {p.id === preset ? <span className="chip success" style={{ fontSize: 10 }}>Active</span> : <span className="chip" style={{ fontSize: 10 }}>Free</span>}
                </div>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* 2. Custom palette (Pro) */}
        <SettingsSection
          title={<>Custom palette <TierChip tier="pro" /></>}
          lede="Override any preset color. Each swatch opens a picker with HEX, HSL sliders, and a contrast checker so your text stays readable."
          action={
            <>
              <button className="ai-btn" type="button" onClick={() => setPicker("primary")}>
                <S w={14}><path d="M12 2L2 7l10 5 10-5-10-5z" /><path d="M2 17l10 5 10-5" /><path d="M2 12l10 5 10-5" /></S>
                Match my logo
              </button>
              <button className="ai-btn is-warm" type="button" onClick={markDirty}>
                <S w={14}><circle cx="12" cy="12" r="10" /><path d="M16 8l-8 8M8 8l8 8" /></S>
                Random palette <TierChip tier="creator" />
              </button>
            </>
          }
        >
          <div className="swatch-row">
            {fx.palette.map((sw) => (
              <button key={sw.id} type="button" className="swatch" title={sw.tip} onClick={() => setPicker(sw.id)}>
                <div className="sw-block" style={{ background: sw.hex, boxShadow: sw.id === "background" ? "inset 0 0 0 1px var(--border)" : undefined }} />
                <div className="sw-name">{sw.name}</div>
                <div className="sw-hex">{sw.hex}</div>
              </button>
            ))}
          </div>
          <div className="palette-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => alert("Mockup — would save the custom palette to your preset library")}>
              Save as preset <TierChip tier="pro" />
            </button>
            <button className="btn btn-ghost btn-sm" type="button" onClick={markDirty}>Reset to preset</button>
          </div>
        </SettingsSection>

        {/* 3. Typography */}
        <SettingsSection title="Typography" lede="Pick a display font for headings and a body font for everything else. Mix and match — or upload your own (Business).">
          <FieldRow label="Display font" hint="Used for the page title, block headlines, and creator name">
            <div className="row-2">
              <select className="field-select" defaultValue={fx.displayFont} onChange={markDirty}>
                {fx.fonts.map((f) => <option key={f} value={f}>{f}{f === fx.displayFont ? " (default)" : ""}</option>)}
              </select>
              <select className="field-select" defaultValue="600" onChange={markDirty}>
                <option value="400">Regular 400</option>
                <option value="500">Medium 500</option>
                <option value="600">Semibold 600</option>
                <option value="700">Bold 700</option>
              </select>
            </div>
          </FieldRow>
          <FieldRow label="Body font" hint="Used for block labels, bio, captions">
            <div className="row-2">
              <select className="field-select" defaultValue={fx.bodyFont} onChange={markDirty}>
                {fx.fonts.map((f) => <option key={f} value={f}>{f}{f === fx.bodyFont ? " (default)" : ""}</option>)}
              </select>
              <select className="field-select" defaultValue="400" onChange={markDirty}>
                <option value="300">Light 300</option>
                <option value="400">Regular 400</option>
                <option value="500">Medium 500</option>
                <option value="600">Semibold 600</option>
              </select>
            </div>
          </FieldRow>
          <FieldRow label="Letter spacing" hint="Tighten or loosen everything in lockstep">
            <div className="cp-row">
              <input type="range" min={-3} max={6} step={1} defaultValue={0} onChange={markDirty} />
              <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 48, textAlign: "right" }}>0.00em</span>
            </div>
          </FieldRow>
          <FieldRow label="Line height" hint="More for airy, less for compact">
            <div className="cp-row">
              <input type="range" min={120} max={180} step={5} defaultValue={155} onChange={markDirty} />
              <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)", width: 48, textAlign: "right" }}>1.55</span>
            </div>
          </FieldRow>
          <FieldRow label="Custom fonts" hint=".woff2 / .woff / .ttf · 2MB each · 4 max">
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => alert("Mockup — would open the custom-font uploader")}>
                <S w={14}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></S>
                Upload font
              </button>
              <TierChip tier="business" />
              <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>{fx.fontSlots.used} of {fx.fontSlots.max} used</span>
            </div>
            <div className="uploaded-fonts">
              {fx.uploadedFonts.map((uf) => (
                <div className="uploaded-font" key={uf.id}>
                  <span style={{ fontFamily: uf.family, fontWeight: 600, fontSize: 18, width: 32 }}>{uf.sample}</span>
                  <span className="uf-name">{uf.name}</span>
                  <span className="uf-size">{uf.size}</span>
                  <button className="iconbtn" type="button" aria-label="Remove font" onClick={markDirty}>
                    <S w={16}><polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></S>
                  </button>
                </div>
              ))}
            </div>
          </FieldRow>
        </SettingsSection>

        {/* 4. Background style */}
        <SettingsSection title="Background style" lede="How the page sits behind your blocks. Solid is fastest, gradients add personality, images are unique to you.">
          <FieldRow label="Type">
            <div className="radio-row">
              {fx.bgTypes.map((b) => (
                <button key={b.id} type="button" className={`radio-card${b.id === bg ? " is-active" : ""}`} onClick={() => { setBg(b.id); markDirty(); }}>
                  <div className="rc-swatch" style={{ background: b.swatch }} />
                  <div>{b.name}</div>
                  <div className="rc-sub">{b.tier ? <TierChip tier={b.tier} /> : b.sub}</div>
                </button>
              ))}
            </div>
          </FieldRow>
          <FieldRow label={<>Pattern overlay</>} hint={<><TierChip tier="pro" /> · 6 SVG patterns blend on top of background</>}>
            <div className="pattern-row">
              {fx.patterns.map((pn) => (
                <button key={pn.id} type="button" className={`pattern-card ${pn.cls}${pn.id === pattern ? " is-active" : ""}`} onClick={() => { setPattern(pn.id); markDirty(); }}>
                  <div className="pn-name">{pn.name}</div>
                </button>
              ))}
            </div>
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
              <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Opacity</span>
              <input type="range" min={0} max={100} defaultValue={35} style={{ flex: 1, minWidth: 0, maxWidth: 200 }} onChange={markDirty} />
              <span className="mono" style={{ fontSize: 12, color: "var(--fg-muted)" }}>35%</span>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => { setPattern(""); markDirty(); }}>Clear</button>
            </div>
          </FieldRow>
        </SettingsSection>

        {/* 5. Density */}
        <SettingsSection title="Spacing & density" lede="How tightly or loosely your blocks sit on the page. We map this to spacing tokens.">
          <div className="density-row">
            {fx.densities.map((d) => (
              <button key={d.id} type="button" className={`radio-card density-card${d.id === density ? " is-active" : ""}`} data-density={d.id} onClick={() => { setDensity(d.id); markDirty(); }}>
                <div className="rc-swatch" style={{ height: 60 }}>
                  {Array.from({ length: d.bars }).map((_, i) => <div className="rc-bar" key={i} />)}
                </div>
                <div>{d.name}</div>
                <div className="rc-sub">{d.sub}</div>
              </button>
            ))}
          </div>
        </SettingsSection>

        {/* 6. Custom CSS (Business) */}
        <SettingsSection
          title={<>Custom CSS <TierChip tier="business" /></>}
          lede="For when the controls above don't go far enough. Wrapped in a scoped layer so you can't break the editor or sign-in flows."
          action={
            <>
              <button className="btn btn-ghost btn-sm" type="button" onClick={markDirty}>Reset</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={markDirty}>Apply</button>
            </>
          }
        >
          <div className="css-editor-wrap">
            <div className="css-editor-head">
              <div className="ce-tabs">
                <span className="ce-dot r" /><span className="ce-dot y" /><span className="ce-dot g" />
                <span className="ce-file">theme.custom.css</span>
              </div>
              <span>scoped @layer custom</span>
            </div>
            <pre className="css-editor-body">
<span className="css-comment">{"/* Your CSS lands inside @layer theme-custom { ... } */"}</span>{"\n"}
<span className="css-selector">.creator-page .block</span>{" {\n  "}
<span className="css-prop">border-radius</span>{": "}<span className="css-num">22px</span>{";\n  "}
<span className="css-prop">transition</span>{": "}<span className="css-prop">transform</span>{" "}<span className="css-num">160ms</span>{" "}<span className="css-value">ease</span>{";\n}"}
            </pre>
            <div className="css-editor-foot">
              <span>1,247 chars · 22 lines · CSS valid ✓</span>
              <span>Last saved 4 min ago</span>
            </div>
          </div>
          <div className="css-disclaim">
            ⚠️ Custom CSS is power-user territory. We don't support arbitrary CSS in customer support — if your page breaks, the first thing we'll ask is to clear this field.
          </div>
        </SettingsSection>

        {/* 7. Theme history (Pro) */}
        <SettingsSection title={<>Theme history <TierChip tier="pro" /></>} lede="Your last 10 published themes. Click revert to roll back instantly — no re-design needed.">
          <div className="history-list">
            {fx.history.map((h) => (
              <div className="history-row" key={h.id}>
                <div className="hr-thumb" style={{ background: h.thumb }} />
                <div className="hr-meta">
                  <div className="hr-name">{h.name}{h.current && <span className="chip success" style={{ fontSize: 10 }}>Current</span>}</div>
                  <div className="hr-when">{h.when}</div>
                </div>
                {!h.current && (
                  <button className="btn btn-ghost btn-sm hr-revert" type="button" onClick={() => alert(`Mockup — would revert to "${h.name}"`)}>Revert</button>
                )}
              </div>
            ))}
          </div>
        </SettingsSection>
      </div>

      {/* ── Right column: live preview ── */}
      <aside className="theme-preview-col" aria-label="Live preview">
        <div className="preview-panel">
          <div className="preview-panel-head">
            <div className="pp-title">Live preview · tadaify.com/{fx.handle}</div>
            <div className="preview-segment">
              {(["desktop", "tablet", "mobile"] as const).map((d) => (
                <button key={d} type="button" className={d === device ? "is-active" : ""} aria-label={d} aria-pressed={d === device} onClick={() => setDevice(d)}>
                  {d === "desktop" && <S w={14}><rect x="2" y="3" width="20" height="14" rx="2" /><line x1="8" y1="21" x2="16" y2="21" /><line x1="12" y1="17" x2="12" y2="21" /></S>}
                  {d === "tablet" && <S w={14}><rect x="4" y="2" width="16" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></S>}
                  {d === "mobile" && <S w={14}><rect x="5" y="2" width="14" height="20" rx="2" /><line x1="12" y1="18" x2="12.01" y2="18" /></S>}
                </button>
              ))}
            </div>
          </div>
          <div className="preview-stage" data-device={device}>
            <div className="preview-frame">
              <div className="pf-avatar">A</div>
              <div className="pf-name">Alexandra Silva</div>
              <div className="pf-handle">@{fx.handle}</div>
              <div className="pf-bio">Designer &amp; writer. Currently building tadaify.</div>
              <a className="pf-block is-primary">Subscribe to my newsletter →</a>
              <a className="pf-block">Latest essay on craft</a>
              <a className="pf-block">Book a 30-min call</a>
              <div className="pf-socials">
                <span className="pf-soc" /><span className="pf-soc" /><span className="pf-soc" /><span className="pf-soc" />
              </div>
            </div>
          </div>
          <div className="preview-panel-foot">
            <span className="pf-update"><span className="pf-dot" /> Live · updates as you change controls</span>
          </div>
        </div>
      </aside>

      {/* Colour picker modal */}
      {picker && (
        <SettingsModal
          title={`Pick a color · ${pickerSwatch?.name ?? "Primary"}`}
          sub="HEX, RGB, or HSL — whichever feels natural. We'll show you whether your text stays readable on it."
          onClose={() => setPicker(null)}
          wide
          confirm={
            <button className="btn btn-primary btn-sm" type="button" onClick={() => { markDirty(); setPicker(null); }}>Use color</button>
          }
        >
          <div className="cp-preview" style={{ background: pickerSwatch?.hex ?? "#6366F1" }}>{pickerSwatch?.hex ?? "#6366F1"}</div>
          <div className="modal-fields">
            <input className="field-input" type="text" defaultValue={pickerSwatch?.hex ?? "#6366F1"} aria-label="HEX value" />
          </div>
          <p className="set-section-lede" style={{ margin: "12px 0 6px" }}>Recently used</p>
          <div className="cp-recent">
            {fx.recentColors.map((c) => (
              <button key={c} type="button" className="cp-chip" style={{ background: c }} aria-label={`Use ${c}`} />
            ))}
          </div>
        </SettingsModal>
      )}
    </div>
  );
}
