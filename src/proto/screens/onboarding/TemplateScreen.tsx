/**
 * Onboarding step 4/5 — Pick a template. Faithful port of
 * mockups/tadaify-mvp/onboarding-template.html: a grid of starter templates
 * (Chopin default + Neon, Minimal, Nightfall, Sunrise, Custom), each with a
 * self-contained CSS preview card. Rendered inside OnboardingShell.
 *
 * Selection is local React state; the Continue label reflects the choice. Back
 * / Continue are real `/__proto/onboarding-*` links. The mockup's right-column
 * preview pane is a labelled placeholder here.
 *
 * @implements fr-onboarding
 */
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { templateFixture } from "./templateFixture";
import { readHandleParam, withHandle } from "./handleParam";

export function TemplateScreen() {
  const { templates } = templateFixture();
  const handle = readHandleParam("yourname");
  const [selected, setSelected] = useState(
    templates.find((t) => t.isDefault)?.id ?? templates[0].id,
  );
  const selectedName = templates.find((t) => t.id === selected)?.name ?? "Chopin";

  return (
    <OnboardingShell
      step={4}
      stepLabel="Step 4 of 5 · Template"
      fillPct={80}
      showActionBar={false}
    >
      <div className="ob-tpl-head">
        <h1>Pick a template that feels like you</h1>
        <p>You can change it anytime. Just helps us start you off with good defaults.</p>
      </div>

      <div className="tpl-grid">
        {templates.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`tpl-card${selected === t.id ? " is-selected" : ""}`}
            aria-pressed={selected === t.id}
            onClick={() => setSelected(t.id)}
          >
            <div className={`tpl-preview preview-${t.previewKind}`}>
              {t.isCustom ? (
                <div className="preview-inner" style={{ alignItems: "center", justifyContent: "center" }}>
                  <div>
                    Start blank
                    <br />
                    <span style={{ fontSize: 11, fontFamily: "var(--font-sans)", opacity: 0.7 }}>
                      Build from scratch
                    </span>
                  </div>
                </div>
              ) : (
                <div className="preview-inner">
                  <div className="preview-name">{t.previewName}</div>
                  <div className="preview-bio">{t.previewBio}</div>
                  <div className="preview-link">{t.previewLink}</div>
                </div>
              )}
            </div>
            <div className="tpl-info">
              <h4>
                {t.name}
                {t.isDefault && <span className="tpl-default-pill">Default</span>}
              </h4>
              <p>{t.tagline}</p>
            </div>
          </button>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 48, flexWrap: "wrap", gap: 16 }}>
        <a href={withHandle("/__proto/onboarding-profile", handle)} className="ob-btn ob-btn-ghost">
          ← Back
        </a>
        <a href={withHandle("/__proto/onboarding-tier", handle)} className="ob-btn ob-btn-primary ob-btn-lg">
          Continue with {selectedName} →
        </a>
      </div>
    </OnboardingShell>
  );
}
