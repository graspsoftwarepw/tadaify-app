/**
 * Onboarding step 3/5 — Make it yours. Faithful port of
 * mockups/tadaify-mvp/onboarding-profile.html (manual-only profile setup):
 * a display name field, an avatar picker (Upload OR Initials), and a
 * "Write your own" bio with a 160-char counter. Rendered inside OnboardingShell.
 *
 * Name, avatar choice and bio are local React state. Back / Continue / Skip are
 * real `/__proto/onboarding-*` links; Upload is a mock action. The mockup's
 * right-column preview pane is a labelled placeholder here.
 *
 * @implements fr-onboarding
 */
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { profileFixture } from "./profileFixture";
import { readHandleParam, withHandle } from "./handleParam";

function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "YOU";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function ProfileScreen() {
  const { displayNamePlaceholder, bioPlaceholder, bioMaxLength, avatarOptions } =
    profileFixture();
  const handle = readHandleParam("yourname");
  const [name, setName] = useState("");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [bioActive, setBioActive] = useState(false);
  const [bio, setBio] = useState("");

  return (
    <OnboardingShell
      step={3}
      stepLabel="Step 3 of 5 · Make it yours"
      fillPct={60}
      showActionBar={false}
    >
      <div className="ob-twocol">
        <div className="ob-card">
          <div className="onb-hero">
            <span className="ob-logo-sm" aria-hidden="true">t</span>
            <div>
              <h2>Make it yours</h2>
              <p>
                How should visitors see you?{" "}
                <strong>You can always change this later.</strong>
              </p>
            </div>
          </div>

          {/* Display name */}
          <div className="field-label">
            <h3>Display name</h3>
            <span className="field-hint">Required</span>
          </div>
          <input
            className="name-input"
            type="text"
            autoComplete="name"
            spellCheck={false}
            placeholder={displayNamePlaceholder}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          {/* Avatar */}
          <div className="field-label">
            <h3>Avatar</h3>
            <span className="field-hint">Pick one</span>
          </div>
          <div className="av-grid">
            {avatarOptions.map((opt) => {
              const isSelected = avatar === opt.source;
              return (
                <button
                  key={opt.source}
                  type="button"
                  className={`av-card${isSelected ? " is-selected" : ""}`}
                  data-source={opt.source}
                  role="radio"
                  aria-checked={isSelected}
                  onClick={() => {
                    setAvatar(opt.source);
                    if (opt.source === "upload") {
                      window.alert("Pick a photo to upload (prototype)");
                    }
                  }}
                >
                  <span className="av-thumb" aria-hidden="true">
                    {opt.source === "initials" ? (
                      initialsFor(name)
                    ) : (
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                  </span>
                  <span className="av-source">{opt.label}</span>
                </button>
              );
            })}
          </div>

          {/* Bio */}
          <div className="field-label">
            <h3>Bio / description</h3>
            <span className={`field-hint${bio.length > 140 ? " is-warn" : ""}`}>
              {bio.length} / {bioMaxLength}
            </span>
          </div>
          <div className="bio-list">
            <button
              type="button"
              className={`bio-row${bioActive ? " is-selected" : ""}`}
              onClick={() => setBioActive(true)}
            >
              <span className="bio-radio" aria-hidden="true" />
              <span className="bio-content">
                <span className="bio-source">Write your own</span>
                {bioActive ? (
                  <textarea
                    className="bio-textarea"
                    placeholder={bioPlaceholder}
                    maxLength={bioMaxLength}
                    value={bio}
                    autoFocus
                    onChange={(e) => setBio(e.target.value)}
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <span className="bio-text">Click to write your own…</span>
                )}
              </span>
            </button>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 28, flexWrap: "wrap", alignItems: "center" }}>
            <a href={withHandle("/__proto/onboarding-social", handle)} className="ob-btn ob-btn-secondary">
              ← Back
            </a>
            <a href={withHandle("/__proto/onboarding-template", handle)} className="ob-btn ob-btn-primary ob-btn-lg" style={{ flex: 1 }}>
              Continue →
            </a>
          </div>

          <a href={withHandle("/__proto/onboarding-template", handle)} className="skip-link-text">
            Skip for now — set up later
          </a>

          <p className="trust-strip">
            🔒 GDPR-compliant · We never share your profile data
          </p>
        </div>

        <aside className="ob-preview-pane" aria-label="Live preview of your tadaify page">
          <p className="ob-preview-title">Live preview</p>
          A 3-viewport preview of your page (avatar + name + bio + socials)
          appears here in the app.
        </aside>
      </div>
    </OnboardingShell>
  );
}
