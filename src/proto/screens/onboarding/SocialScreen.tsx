/**
 * Onboarding step 2/5 — Your handles. Faithful port of
 * mockups/tadaify-mvp/onboarding-social.html: one handle-entry row per platform
 * with a URL prefix, a live "Follow me on …" preview line, and a per-row "Skip
 * this platform". Handle-based, no OAuth. Rendered inside OnboardingShell.
 *
 * Inputs + per-row skip are local React state. Back / Skip socials / Continue
 * are real `/__proto/onboarding-*` links. The mockup's right-column live
 * preview pane is represented by a labelled placeholder (preview engine is
 * out of scope for the prototype port).
 *
 * @implements fr-onboarding
 */
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { socialFixture } from "./socialFixture";
import { readHandleParam, withHandle } from "./handleParam";

export function SocialScreen() {
  const { handle: fallbackHandle, defaultPlatformIds, platforms } = socialFixture();
  const handle = readHandleParam(fallbackHandle);
  const shown = platforms.filter((p) => defaultPlatformIds.includes(p.id));

  const [handles, setHandles] = useState<Record<string, string>>(
    Object.fromEntries(shown.map((p) => [p.id, handle])),
  );
  const [skipped, setSkipped] = useState<Record<string, boolean>>({});

  function setHandleFor(id: string, value: string) {
    setHandles((prev) => ({ ...prev, [id]: value }));
  }

  return (
    <OnboardingShell
      step={2}
      stepLabel="Step 2 of 5 · Your socials"
      fillPct={40}
      showActionBar={false}
    >
      <div className="ob-twocol">
        <div className="ob-card">
          <div className="onb-hero">
            <span className="ob-logo-sm" aria-hidden="true">t</span>
            <div>
              <h2>Your handles</h2>
              <p>
                We'll create a "Follow me on …" link block for each.{" "}
                <strong>No connection, no login.</strong>
              </p>
            </div>
          </div>

          <div className="platform-list">
            {shown.map((p) => {
              const isSkipped = !!skipped[p.id];
              const value = handles[p.id] ?? "";
              return (
                <div
                  key={p.id}
                  className={`platform-row${isSkipped ? " is-skipped" : ""}`}
                >
                  <div className="platform-row-header">
                    <div className="platform-icon" style={{ background: p.bg }} aria-hidden="true">
                      {p.icon}
                    </div>
                    <span className="platform-name">{p.label}</span>
                    <button
                      type="button"
                      className="skip-link"
                      onClick={() => setSkipped((prev) => ({ ...prev, [p.id]: true }))}
                    >
                      Skip this platform ×
                    </button>
                  </div>
                  <div className="handle-input-row">
                    <span className="handle-prefix">{p.prefix}</span>
                    <input
                      className="handle-input"
                      type="text"
                      placeholder="yourname"
                      value={value}
                      autoComplete="off"
                      spellCheck={false}
                      onChange={(e) => setHandleFor(p.id, e.target.value)}
                    />
                  </div>
                  <p className="handle-preview">
                    {isSkipped ? (
                      <em>Skipped — won't appear on your page.</em>
                    ) : value.trim() ? (
                      <>
                        This will appear as:{" "}
                        <strong>Follow me on {p.label}</strong> → {p.prefix}
                        {value.trim()}
                      </>
                    ) : null}
                  </p>
                </div>
              );
            })}
          </div>

          <div className="affirmation-strip">
            These will appear as link blocks on your page. You can edit, reorder,
            or delete any of them later.
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
            <a href={withHandle("/__proto/onboarding-welcome", handle)} className="ob-btn ob-btn-secondary">
              ← Back
            </a>
            <a href={withHandle("/__proto/onboarding-profile", handle)} className="ob-btn ob-btn-secondary">
              Skip socials
            </a>
            <a href={withHandle("/__proto/onboarding-profile", handle)} className="ob-btn ob-btn-primary ob-btn-lg" style={{ flex: 1 }}>
              Continue →
            </a>
          </div>

          <p className="trust-strip">
            🔒 Handle-based — no OAuth, no account connection · You can edit any time
          </p>
        </div>

        <aside className="ob-preview-pane" aria-label="Live preview of your tadaify page">
          <p className="ob-preview-title">Live preview</p>
          A 3-viewport preview of your emerging page appears here in the app.
        </aside>
      </div>
    </OnboardingShell>
  );
}
