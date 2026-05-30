/**
 * SettingsAccount — Account sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-account.html
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real API wiring — all interactive handlers are no-ops or local state.
 *
 * Sections (in order):
 *   1. Identity  — avatar hero, display name, username/handle, bio, pronouns,
 *                  location (autocomplete stub), personal website, date of birth
 *   2. Email & notifications — primary email, recovery email, 4 notification toggles
 *   3. Profile visibility — public profile toggle, discover opt-in
 *   4. Cross-link to GDPR
 *   5. Sticky save bar
 *   6. Modals — change email, change handle confirm, avatar crop, AI suggest bio
 *
 * TODO: wire to settings API
 *
 * Story: F-APP-SETTINGS-ACCOUNT-001 (#33)
 */

import { useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SettingsAccountProps {
  /** Creator handle — stub value pre-fills the handle input. TODO: wire to settings API */
  handle: string;
  /** Primary email — stub value shown in the email row. TODO: wire to settings API */
  email: string;
}

// ─── Stub data (verbatim from mockup) ────────────────────────────────────────

const STUB_DISPLAY_NAME = "Alexandra Silva"; // TODO: wire to settings API
const STUB_BIO =
  "Photographer, traveller, and content creator based in Lisbon 🇵🇹"; // TODO: wire to settings API
const STUB_PRONOUNS = "she/her"; // TODO: wire to settings API
const STUB_LOCATION = "Lisbon, Portugal"; // TODO: wire to settings API
const STUB_WEBSITE = "https://alexandra.com"; // TODO: wire to settings API

const BIO_SUGGESTIONS = [
  "Lisbon-based photographer chasing soft light and slow mornings.",
  "I take pictures and travel slowly. Currently in Portugal.",
  "Photographer · traveller · gentle observer of warm corners.",
  "Catching light in unfamiliar places — currently rooted in Lisbon 🇵🇹",
  "Telling small stories with a camera. Photography, words, and the occasional recipe.",
]; // TODO: wire to settings API

const CITY_DB = [
  { name: "Lisbon, Portugal", flag: "🇵🇹", region: "Iberia" },
  { name: "Lisburn, Northern Ireland", flag: "🇬🇧", region: "UK" },
  { name: "Liverpool, United Kingdom", flag: "🇬🇧", region: "UK" },
  { name: "Lima, Peru", flag: "🇵🇪", region: "South America" },
  { name: "Lyon, France", flag: "🇫🇷", region: "Europe" },
  { name: "London, United Kingdom", flag: "🇬🇧", region: "UK" },
  { name: "Los Angeles, USA", flag: "🇺🇸", region: "North America" },
  { name: "Berlin, Germany", flag: "🇩🇪", region: "Europe" },
  { name: "Barcelona, Spain", flag: "🇪🇸", region: "Iberia" },
  { name: "Buenos Aires, Argentina", flag: "🇦🇷", region: "South America" },
  { name: "Bali, Indonesia", flag: "🇮🇩", region: "Asia" },
  { name: "Tokyo, Japan", flag: "🇯🇵", region: "Asia" },
  { name: "New York, USA", flag: "🇺🇸", region: "North America" },
  { name: "Paris, France", flag: "🇫🇷", region: "Europe" },
  { name: "Porto, Portugal", flag: "🇵🇹", region: "Iberia" },
  { name: "Mexico City, Mexico", flag: "🇲🇽", region: "North America" },
]; // TODO: replace with real location search API

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsAccount({ handle: _handle, email }: SettingsAccountProps) {
  // ── Identity fields ──────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState(STUB_DISPLAY_NAME);
  const [handleValue, setHandleValue] = useState(_handle || "alexandra"); // TODO: wire to settings API
  const [bio, setBio] = useState(STUB_BIO);
  const [pronouns, setPronouns] = useState(STUB_PRONOUNS);
  const [location, setLocation] = useState(STUB_LOCATION);
  const [website, setWebsite] = useState(STUB_WEBSITE);
  const [dob, setDob] = useState(""); // TODO: wire to settings API

  // ── Handle check state ───────────────────────────────────────────────────
  const [handleStatus, setHandleStatus] = useState<{
    label: string;
    tone: "neutral" | "ok" | "err" | "warn";
    hint: string;
  }>({ label: "current", tone: "neutral", hint: "Lowercase letters, numbers, and dashes. 3–30 chars. Last changed: never." });
  const [handleSaveable, setHandleSaveable] = useState(false);

  // ── Email & notification toggles ─────────────────────────────────────────
  const [recoveryEmail, setRecoveryEmail] = useState(""); // TODO: wire to settings API
  const [notifProduct, setNotifProduct] = useState(true); // TODO: wire to settings API
  const [notifDigest, setNotifDigest] = useState(true); // TODO: wire to settings API
  const [notifBilling, setNotifBilling] = useState(true); // TODO: wire to settings API
  const [notifSecurity, setNotifSecurity] = useState(true); // TODO: wire to settings API

  // ── Visibility toggles ───────────────────────────────────────────────────
  const [visPublic, setVisPublic] = useState(true); // TODO: wire to settings API
  const [visDiscover, setVisDiscover] = useState(false); // TODO: wire to settings API

  // ── Dirty / save bar ─────────────────────────────────────────────────────
  const [isDirty, setIsDirty] = useState(false);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved">("idle");

  const markDirty = useCallback(() => {
    setIsDirty(true);
    setSaveState("idle");
  }, []);

  const handleSaveChanges = useCallback(() => {
    // TODO: wire to settings API
    setSaveState("saving");
    setTimeout(() => {
      setSaveState("saved");
      setIsDirty(false);
      setTimeout(() => setSaveState("idle"), 3000);
    }, 500);
  }, []);

  const handleDiscard = useCallback(() => {
    // TODO: wire to settings API
    setDisplayName(STUB_DISPLAY_NAME);
    setBio(STUB_BIO);
    setPronouns(STUB_PRONOUNS);
    setLocation(STUB_LOCATION);
    setWebsite(STUB_WEBSITE);
    setIsDirty(false);
    setSaveState("idle");
  }, []);

  // ── Validation ───────────────────────────────────────────────────────────
  const nameError = displayName.trim().length === 0;
  const websiteError =
    website.trim().length > 0 && !/^https:\/\/[^\s]+\.[^\s]+/.test(website.trim());

  const bioLen = bio.length;
  const bioCounterClass =
    bioLen > 140 ? "field-counter is-red" : bioLen >= 80 ? "field-counter is-amber" : "field-counter";

  // ── Handle availability ───────────────────────────────────────────────────
  const RESERVED_HANDLES = new Set([
    "admin","api","app","www","support","blog","help","docs","login","register",
    "signin","signup","about","pricing","terms","privacy","legal","contact",
    "tadaify","settings","dashboard","onboarding","mail","email","status",
    "assets","static","public","admin-panel",
  ]);
  const TAKEN_DEMO = new Set(["alex","john","test","demo","taken","sarah","emma","mike"]);
  const EXPIRING_HANDLES: Record<string, number> = { taylor: 22, oldalex: 7, jess: 3 };
  const HANDLE_VALID_RE = /^[a-z0-9](?:[a-z0-9-]{1,28}[a-z0-9])?$/;

  const checkHandle = useCallback(
    (value: string) => {
      const v = value.toLowerCase().trim();
      const currentHandle = _handle || "alexandra";
      if (v === currentHandle) {
        setHandleSaveable(false);
        setHandleStatus({ label: "current", tone: "neutral", hint: "Lowercase letters, numbers, and dashes. 3–30 chars. Last changed: never." });
        return;
      }
      if (v.length < 3) {
        setHandleSaveable(false);
        setHandleStatus({ label: "too short", tone: "err", hint: "Minimum 3 characters." });
        return;
      }
      if (!HANDLE_VALID_RE.test(v)) {
        setHandleSaveable(false);
        setHandleStatus({ label: "invalid", tone: "err", hint: "Use lowercase letters, numbers, and dashes (no leading/trailing dash)." });
        return;
      }
      if (RESERVED_HANDLES.has(v)) {
        setHandleSaveable(false);
        setHandleStatus({ label: "reserved", tone: "err", hint: "This handle is reserved for system use." });
        return;
      }
      if (Object.prototype.hasOwnProperty.call(EXPIRING_HANDLES, v)) {
        const days = EXPIRING_HANDLES[v];
        setHandleSaveable(false);
        setHandleStatus({
          label: `expiring · ${days}d`,
          tone: "warn",
          hint: `Taken — releases in ${days} day${days === 1 ? "" : "s"}. Previous owner changed handle; we hold a 30-day redirect so their old links keep working. Come back after release to claim it.`,
        });
        return;
      }
      if (TAKEN_DEMO.has(v)) {
        setHandleSaveable(false);
        setHandleStatus({ label: "taken", tone: "err", hint: "Someone already uses this handle." });
        return;
      }
      setHandleSaveable(true);
      setHandleStatus({
        label: "available",
        tone: "ok",
        hint: "Available — old slug 301s to your primary page for 30 days, then released. Custom domain (if any) keeps working unchanged. You can change again in 30 days.",
      });
    },
    [_handle] // eslint-disable-line react-hooks/exhaustive-deps
  );

  // ── Location autocomplete ─────────────────────────────────────────────────
  const [locationSuggestions, setLocationSuggestions] = useState<typeof CITY_DB>([]);
  const [locationOpen, setLocationOpen] = useState(false);

  const onLocationInput = useCallback((value: string) => {
    setLocation(value);
    markDirty();
    const v = value.toLowerCase().trim();
    if (v.length < 1) {
      setLocationSuggestions([]);
      setLocationOpen(false);
      return;
    }
    const matches = CITY_DB.filter((c) => c.name.toLowerCase().includes(v)).slice(0, 6);
    setLocationSuggestions(matches);
    setLocationOpen(true);
  }, [markDirty]);

  const pickLocation = useCallback((name: string) => {
    setLocation(name);
    setLocationOpen(false);
    setLocationSuggestions([]);
    markDirty();
  }, [markDirty]);

  // ── Modals ────────────────────────────────────────────────────────────────
  const [openModal, setOpenModal] = useState<string | null>(null);
  const [ceNewEmail, setCeNewEmail] = useState("");
  const [cePwd, setCePwd] = useState("");
  const [showAiGen, setShowAiGen] = useState(false);
  const [aiGenPrompt, setAiGenPrompt] = useState("");
  const [cropZoom, setCropZoom] = useState(120);
  const [suggestBioList, setSuggestBioList] = useState(false);
  const [handleHistoryOpen, setHandleHistoryOpen] = useState(false);

  // ── Save bar derived classes ──────────────────────────────────────────────
  const saveBarClass = [
    "save-bar",
    isDirty || saveState !== "idle" ? "is-visible" : "",
    saveState === "saved" ? "is-saved" : "",
    saveState === "saving" ? "is-saving" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const saveHintText =
    saveState === "saved"
      ? "✓ Saved · just now"
      : saveState === "saving"
      ? "Saving…"
      : "You have unsaved changes";

  return (
    <>
      {/* ============================================================
           Content pane
           ============================================================ */}
      <div className="settings-content" id="account-pane">

        {/* ============================================================
             1. IDENTITY
             ============================================================ */}
        <section className="settings-section" aria-labelledby="sec-identity">
          <div className="settings-section-title" id="sec-identity">Identity</div>
          <p className="settings-section-lede">
            How you show up across tadaify — to visitors, in emails, in your URL.
          </p>

          {/* Profile photo / avatar */}
          <div className="field-row">
            <div className="field-label">
              Profile photo
              <span className="field-hint">JPG, PNG, GIF, WebP — max 5 MB</span>
            </div>
            <div className="field-body">
              <div className="avatar-hero-row">
                <div className="avatar-hero" id="avatar-preview" aria-label="Current profile photo">
                  <span id="avatar-letter">A</span>
                  <button
                    type="button"
                    className="upload-overlay"
                    onClick={() => { setShowAiGen(false); setOpenModal("crop"); }}
                    aria-label="Change photo"
                  >
                    Change photo
                  </button>
                </div>
                <div className="avatar-controls">
                  <div className="avatar-btn-row">
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => { setShowAiGen(false); setOpenModal("crop"); }}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <polyline points="16 16 12 12 8 16" />
                        <line x1="12" y1="12" x2="12" y2="21" />
                        <path d="M20.4 7A8 8 0 1 0 4 11" />
                      </svg>
                      Upload photo
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => { setShowAiGen(true); setOpenModal("crop"); }}
                    >
                      ✨ AI generate
                    </button>
                    <button
                      className="btn btn-ghost btn-sm"
                      type="button"
                      onClick={() => { /* TODO: wire to settings API */ markDirty(); }}
                    >
                      Remove
                    </button>
                  </div>
                  <p className="avatar-meta">
                    Recommended 512×512 px. We&apos;ll crop to a square automatically.
                  </p>
                  <div className="avatar-preview-strip" aria-label="Preview at smaller sizes">
                    <span className="label">Preview:</span>
                    <span className="pv pv-64">A</span>
                    <span className="pv pv-32">A</span>
                    <span className="pv pv-24">A</span>
                    <span className="pv pv-16">A</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Display name */}
          <div className="field-row">
            <div className="field-label">
              Display name
              <span className="field-hint">Shown on your page and in emails. 3–50 chars.</span>
            </div>
            <div className="field-body">
              <input
                className={`field-input${nameError ? " has-error" : ""}`}
                type="text"
                id="field-name"
                value={displayName}
                placeholder="Your full name or display name"
                minLength={3}
                maxLength={50}
                onChange={(e) => { setDisplayName(e.target.value); markDirty(); }}
              />
              <div className={`field-error${nameError ? " is-visible" : ""}`} id="name-error">
                Name is required.
              </div>
              <div className="name-preview">
                <span className="np-label">Visitors see:</span>
                <span className="np-name" style={nameError ? { color: "var(--danger)" } : undefined}>
                  {nameError ? "(name required)" : displayName}
                </span>
                <span className="np-sep">·</span>
                <span className="np-handle">@{handleValue || _handle || "alexandra"}</span>
              </div>
            </div>
          </div>

          {/* Username (handle) */}
          <div className="field-row">
            <div className="field-label">
              Username (handle)
              <span className="field-hint">Your public URL slug. 1 change per 30 days.</span>
            </div>
            <div className="field-body">
              <div className="handle-input-wrap">
                <div className="handle-input-shell">
                  <span className="handle-prefix">tadaify.com/</span>
                  <input
                    className="field-input"
                    type="text"
                    id="handle-input"
                    value={handleValue}
                    style={{ paddingLeft: 96, paddingRight: 104 }}
                    maxLength={30}
                    autoComplete="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    onChange={(e) => {
                      setHandleValue(e.target.value);
                      checkHandle(e.target.value);
                    }}
                  />
                  <span
                    className={`handle-status-pill${
                      handleStatus.tone === "ok"
                        ? " is-ok"
                        : handleStatus.tone === "err"
                        ? " is-err"
                        : handleStatus.tone === "warn"
                        ? " is-warn"
                        : ""
                    }`}
                  >
                    {handleStatus.label}
                  </span>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  id="handle-save-btn"
                  type="button"
                  disabled={!handleSaveable}
                  onClick={() => setOpenModal("change-handle")}
                >
                  Save handle
                </button>
              </div>
              <p
                id="handle-hint"
                style={{
                  fontSize: 12,
                  color: handleStatus.tone === "err" ? "var(--danger)" : "var(--fg-muted)",
                  margin: "8px 0 0",
                  lineHeight: 1.5,
                }}
              >
                {handleStatus.hint}
              </p>

              {/* Handle history (Pro+ — fully visible per no-blur rule) */}
              <details
                className="handle-history"
                id="handle-history"
                open={handleHistoryOpen}
                onToggle={(e) => setHandleHistoryOpen((e.currentTarget as HTMLDetailsElement).open)}
              >
                <summary>
                  Handle change history
                  {/* TODO: wire to settings API — tier badge */}
                </summary>
                <div className="hh-list">
                  <p style={{ fontSize: 12, color: "var(--fg-muted)", margin: "0 0 8px" }}>
                    Each row tracks an old slug and the redirect window. Useful when you share old links and want to know when they release.
                  </p>
                  <div className="hh-row">
                    <span className="hh-old">@alex</span>
                    <span className="hh-arrow">→</span>
                    <span className="hh-new">@alexandra</span>
                    <span className="hh-when">14 Mar 2026</span>
                    <span className="chip success hh-status">released</span>
                  </div>
                  <div className="hh-row">
                    <span className="hh-old">@alex-silva</span>
                    <span className="hh-arrow">→</span>
                    <span className="hh-new">@alex</span>
                    <span className="hh-when">2 Aug 2025</span>
                    <span className="chip success hh-status">released</span>
                  </div>
                  <div
                    className="hh-row"
                    style={{ opacity: 0.7, fontStyle: "italic", color: "var(--fg-muted)", fontSize: 12, borderBottom: 0 }}
                  >
                    Saved automatically every time you change your handle. Premium history view shows redirect targets + click-through counts.
                  </div>
                </div>
              </details>
            </div>
          </div>

          {/* Bio */}
          <div className="field-row">
            <div className="field-label">
              Bio
              <span className="field-hint">Appears under your name. Emoji count as 2.</span>
            </div>
            <div className="field-body">
              <div className="with-suggest">
                <textarea
                  className="field-input"
                  id="field-bio"
                  maxLength={140}
                  placeholder="Tell visitors who you are…"
                  value={bio}
                  onChange={(e) => { setBio(e.target.value); markDirty(); }}
                />
                <button
                  type="button"
                  className="suggest-btn"
                  onClick={() => setSuggestBioList(true)}
                  title="✨ Suggest 5 alternatives"
                >
                  ✨ Suggest
                </button>
              </div>
              <div className={bioCounterClass} id="bio-counter">
                <span id="bio-count">{bioLen}</span>/140
              </div>
            </div>
          </div>

          {/* Pronouns */}
          <div className="field-row">
            <div className="field-label">
              Pronouns
              <span className="field-hint">Optional. Freeform.</span>
            </div>
            <div className="field-body">
              <input
                className="field-input"
                type="text"
                id="field-pronouns"
                value={pronouns}
                placeholder="e.g. she/her, they/them, he/him"
                maxLength={30}
                style={{ maxWidth: 280 }}
                onChange={(e) => { setPronouns(e.target.value); markDirty(); }}
              />
            </div>
          </div>

          {/* Location with autocomplete */}
          <div className="field-row">
            <div className="field-label">
              Location
              <span className="field-hint">Optional. Visible on your public page.</span>
            </div>
            <div className="field-body">
              <div className="autocomplete-shell">
                <input
                  className="field-input"
                  type="text"
                  id="field-location"
                  value={location}
                  autoComplete="off"
                  placeholder="Start typing a city…"
                  style={{ maxWidth: 380 }}
                  onChange={(e) => onLocationInput(e.target.value)}
                  onFocus={() => { if (location.length > 0) onLocationInput(location); }}
                  onBlur={() => setTimeout(() => setLocationOpen(false), 150)}
                />
                <div
                  className={`autocomplete-list${locationOpen ? " is-open" : ""}`}
                  role="listbox"
                  aria-label="City suggestions"
                >
                  {locationSuggestions.length === 0 && locationOpen ? (
                    <div className="ac-item" style={{ color: "var(--fg-muted)", cursor: "default" }}>
                      No matches — keep typing or use any text
                    </div>
                  ) : (
                    locationSuggestions.map((c) => (
                      <div
                        key={c.name}
                        className="ac-item"
                        onClick={() => pickLocation(c.name)}
                      >
                        <span className="ac-flag">{c.flag}</span>
                        <span>{c.name}</span>
                        <span className="ac-meta">{c.region}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Personal website */}
          <div className="field-row">
            <div className="field-label">
              Personal website
              <span className="field-hint">Optional. Must start with https://</span>
            </div>
            <div className="field-body">
              <input
                className={`field-input${websiteError ? " has-error" : ""}`}
                type="url"
                id="field-website"
                value={website}
                placeholder="https://your-site.com"
                style={{ maxWidth: 380 }}
                onChange={(e) => { setWebsite(e.target.value); markDirty(); }}
              />
              <div className={`field-error${websiteError ? " is-visible" : ""}`} id="website-error">
                Please enter a valid https:// URL.
              </div>
            </div>
          </div>

          {/* Date of birth (Pro+ — fully visible per no-blur rule) */}
          <div className="field-row">
            <div className="field-label">
              Date of birth
              {/* TODO: wire to settings API — tier badge */}
              <span className="field-hint">Optional. Hidden from your public page. Used for age-gated features.</span>
            </div>
            <div className="field-body">
              <input
                className="field-input"
                type="date"
                id="field-dob"
                value={dob}
                max="2008-01-01"
                style={{ maxWidth: 220 }}
                onChange={(e) => { setDob(e.target.value); markDirty(); }}
              />
              <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", margin: "6px 0 0" }}>
                We never share your date of birth publicly. Used only for compliance (e.g. age-gated link types).
              </p>
            </div>
          </div>
        </section>

        {/* ============================================================
             2. EMAIL & NOTIFICATIONS
             ============================================================ */}
        <section className="settings-section" aria-labelledby="sec-email">
          <div className="settings-section-title" id="sec-email">Email &amp; notifications</div>
          <p className="settings-section-lede">
            Where we send your sign-in links, alerts, and product updates.
          </p>

          {/* Primary email */}
          <div className="field-row">
            <div className="field-label">
              Primary email
              <span className="field-hint">Used for sign-in and billing receipts.</span>
            </div>
            <div className="field-body">
              <div className="email-display">
                <span className="email-text">{email || "alexandra@example.com"}</span>{/* TODO: wire to settings API */}
                <span className="chip success" title="Verified — clicked link in inbox">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  Verified
                </span>
                <div className="email-actions">
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => setOpenModal("change-email")}
                  >
                    Change email →
                  </button>
                </div>
              </div>
              <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", margin: "6px 0 0" }}>
                Your current email stays active until you click the verification link in your new inbox.
              </p>
            </div>
          </div>

          {/* Recovery email (Pro+ — fully visible per no-blur rule) */}
          <div className="field-row">
            <div className="field-label">
              Recovery email
              {/* TODO: wire to settings API — tier badge */}
              <span className="field-hint">Optional. Used if you lose access to your primary email.</span>
            </div>
            <div className="field-body">
              <input
                className="field-input"
                type="email"
                id="field-recovery"
                value={recoveryEmail}
                placeholder="recovery@example.com"
                style={{ maxWidth: 380 }}
                onChange={(e) => { setRecoveryEmail(e.target.value); markDirty(); }}
              />
              <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", margin: "6px 0 0" }}>
                We&apos;ll send a verification link to confirm. Your recovery email is private and never shown publicly.
              </p>
            </div>
          </div>

          {/* Notification preferences */}
          <div className="field-row">
            <div className="field-label">
              Notification preferences
              <span className="field-hint">What lands in your inbox.</span>
            </div>
            <div className="field-body">
              <div className="toggle-list">
                <div className="toggle-row">
                  <div className="tr-text">
                    <div className="tr-name">Product updates</div>
                    <div className="tr-desc">
                      New features, design tweaks, and the occasional changelog email. Roughly 1–2 per month.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle${notifProduct ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={notifProduct}
                    aria-label="Product updates"
                    onClick={() => { setNotifProduct((v) => !v); markDirty(); }}
                  />
                </div>
                <div className="toggle-row">
                  <div className="tr-text">
                    <div className="tr-name">Weekly digest</div>
                    <div className="tr-desc">
                      Mon morning summary — page views, top blocks, new subscribers. Skip if you&apos;d rather check Insights yourself.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle${notifDigest ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={notifDigest}
                    aria-label="Weekly digest"
                    onClick={() => { setNotifDigest((v) => !v); markDirty(); }}
                  />
                </div>
                <div className="toggle-row">
                  <div className="tr-text">
                    <div className="tr-name">Billing alerts</div>
                    <div className="tr-desc">
                      Card failures, renewals, and invoice receipts. We recommend keeping this on.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle${notifBilling ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={notifBilling}
                    aria-label="Billing alerts"
                    onClick={() => { setNotifBilling((v) => !v); markDirty(); }}
                  />
                </div>
                <div className="toggle-row">
                  <div className="tr-text">
                    <div className="tr-name">Security alerts</div>
                    <div className="tr-desc">
                      Sign-ins from new devices, password changes, recovery email used. Always recommended.
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`toggle${notifSecurity ? " is-on" : ""}`}
                    role="switch"
                    aria-checked={notifSecurity}
                    aria-label="Security alerts"
                    onClick={() => { setNotifSecurity((v) => !v); markDirty(); }}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ============================================================
             3. PROFILE VISIBILITY
             ============================================================ */}
        <section className="settings-section" aria-labelledby="sec-visibility">
          <div className="settings-section-title" id="sec-visibility">Profile visibility</div>
          <p className="settings-section-lede">
            Control how your name, bio, and location appear to people who land on your page.
          </p>

          <div className="toggle-list">
            <div className="toggle-row">
              <div className="tr-text">
                <div className="tr-name">Public profile</div>
                <div className="tr-desc">
                  When on, your display name, bio, and location appear on your visitor pages. When off, only your handle is shown — useful while you&apos;re still setting things up.
                </div>
              </div>
              <button
                type="button"
                className={`toggle${visPublic ? " is-on" : ""}`}
                role="switch"
                aria-checked={visPublic}
                aria-label="Public profile"
                onClick={() => { setVisPublic((v) => !v); markDirty(); }}
              />
            </div>

            <div className="toggle-row">
              <div className="tr-text">
                <div className="tr-name">
                  Show in tadaify discover
                  {/* TODO: wire to settings API — tier badge */}
                </div>
                <div className="tr-desc">
                  Opt into our &quot;discover creators&quot; surface — a curated browse experience visitors find on tadaify.com. Off by default; turning it on takes ~24h to be picked up by the index.
                </div>
              </div>
              <button
                type="button"
                className={`toggle${visDiscover ? " is-on" : ""}`}
                role="switch"
                aria-checked={visDiscover}
                aria-label="Show in tadaify discover"
                onClick={() => { setVisDiscover((v) => !v); markDirty(); }}
              />
            </div>
          </div>
        </section>

        {/* Cross-link to GDPR */}
        <p style={{ fontSize: 12.5, color: "var(--fg-muted)", margin: "6px 0 24px" }}>
          Want to export everything or delete your account?{" "}
          <a href="/app?tab=settings&subtab=gdpr" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
            Go to GDPR &amp; data →
          </a>
        </p>
      </div>

      {/* ============================================================
           STICKY SAVE BAR
           ============================================================ */}
      <div className={saveBarClass} id="save-bar" role="region" aria-label="Save changes">
        <span className="save-hint" id="save-hint">
          <span className="save-dot" aria-hidden="true" />
          <span id="save-hint-text">{saveHintText}</span>
        </span>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-ghost btn-sm" type="button" onClick={handleDiscard}>
            Discard
          </button>
          <button
            className="btn btn-primary btn-sm"
            id="save-btn"
            type="button"
            onClick={handleSaveChanges}
            disabled={!isDirty || saveState === "saving"}
          >
            Save changes
          </button>
        </div>
      </div>

      {/* ============================================================
           MODALS — centered, NEVER drawers
           ============================================================ */}

      {/* Change email */}
      {openModal === "change-email" && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal" role="dialog" aria-modal={true} aria-labelledby="ce-title">
            <button className="modal-close-x" type="button" onClick={() => setOpenModal(null)} aria-label="Close">×</button>
            <h3 id="ce-title">Change email</h3>
            <p className="modal-sub">
              We&apos;ll send a verification link to your new address. Your current email stays active until you click the link.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 5, display: "block" }}>
                  Current email
                </label>
                <input className="field-input" type="email" value={email || "alexandra@example.com"} readOnly />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 5, display: "block" }}>
                  New email
                </label>
                <input
                  className="field-input"
                  type="email"
                  placeholder="new@example.com"
                  autoComplete="email"
                  id="ce-new"
                  value={ceNewEmail}
                  onChange={(e) => setCeNewEmail(e.target.value)}
                />
              </div>
              <div>
                <label style={{ fontSize: 12.5, fontWeight: 600, color: "var(--fg-muted)", marginBottom: 5, display: "block" }}>
                  Confirm your password
                </label>
                <input
                  className="field-input"
                  type="password"
                  placeholder="Current password"
                  autoComplete="current-password"
                  id="ce-pwd"
                  value={cePwd}
                  onChange={(e) => setCePwd(e.target.value)}
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpenModal(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to settings API
                  setOpenModal(null);
                }}
              >
                Send verification link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change handle confirm */}
      {openModal === "change-handle" && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal" role="dialog" aria-modal={true} aria-labelledby="ch-title">
            <button className="modal-close-x" type="button" onClick={() => setOpenModal(null)} aria-label="Close">×</button>
            <h3 id="ch-title">Change handle?</h3>
            <p className="modal-sub">
              Your tadaify slug changes from{" "}
              <strong>tadaify.com/{_handle || "alexandra"}</strong> to{" "}
              <strong>tadaify.com/{handleValue}</strong>.
            </p>
            <div className="modal-warning" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <div>
                <strong>What happens to the old URL</strong>
                <br />
                For 30 days,{" "}
                <code>tadaify.com/{_handle || "alexandra"}</code> will{" "}
                <strong>301-redirect to your primary page</strong>:
                <span style={{ display: "block", marginTop: 4 }}>
                  → <code>https://alexandra.com/</code>{" "}
                  <span style={{ color: "var(--fg-muted)", fontSize: 11.5 }}>
                    (your active custom domain — primary)
                  </span>
                </span>
                After 30 days the old slug is released and someone else can claim it.
              </div>
              <div style={{ fontSize: 12.5, color: "var(--fg-muted)", borderTop: "1px solid var(--border)", paddingTop: 10 }}>
                <strong>Custom domains stay bound to your account</strong> — they&apos;re not tied to your handle, so{" "}
                <code>alexandra.com</code> keeps working with no DNS change. Only the tadaify.com slug needs a redirect.
                <br /><br />
                You can change your handle again in <strong>30 days</strong>.
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpenModal(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to settings API
                  setOpenModal(null);
                }}
              >
                Confirm change
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Avatar crop modal (centered, NEVER drawer) */}
      {openModal === "crop" && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal modal-wide" role="dialog" aria-modal={true} aria-labelledby="cr-title">
            <button className="modal-close-x" type="button" onClick={() => setOpenModal(null)} aria-label="Close">×</button>
            <h3 id="cr-title">Crop your photo</h3>
            <p className="modal-sub">
              Drag to reposition, scale to zoom. We&apos;ll save a square crop at 512×512 px.
            </p>

            <div className="crop-stage" id="crop-stage" aria-label="Crop preview">
              <span style={{ position: "absolute", bottom: 10, left: 14, fontSize: 11, color: "rgba(255,255,255,0.85)", fontWeight: 600, zIndex: 1 }}>
                drag · scroll to zoom
              </span>
              <div className="crop-img" aria-hidden="true" />
            </div>

            <div className="crop-controls">
              <label htmlFor="crop-zoom">Zoom</label>
              <input
                id="crop-zoom"
                type="range"
                min={100}
                max={200}
                value={cropZoom}
                onChange={(e) => setCropZoom(Number(e.target.value))}
              />
              <span style={{ fontSize: 11.5, color: "var(--fg-muted)", minWidth: 40, textAlign: "right" }}>
                {cropZoom}%
              </span>
            </div>

            {showAiGen && (
              <div className="ai-gen-panel" id="ai-gen-panel">
                <div className="ag-title">✨ AI generate avatar</div>
                <p className="ag-sub">Describe yourself in a few words. We&apos;ll generate a few options.</p>
                <input
                  className="field-input"
                  type="text"
                  placeholder="e.g. friendly photographer with curly hair, warm smile, soft light"
                  id="ai-gen-prompt"
                  value={aiGenPrompt}
                  onChange={(e) => setAiGenPrompt(e.target.value)}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => { /* TODO: wire to settings API */ }}
                  >
                    Generate 4 options
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => setShowAiGen(false)}
                  >
                    Back to upload
                  </button>
                </div>
              </div>
            )}

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setOpenModal(null)}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to settings API
                  setOpenModal(null);
                  markDirty();
                }}
              >
                Save photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AI Suggest bio results modal */}
      {suggestBioList && (
        <div
          className="modal-backdrop is-open"
          onClick={(e) => { if (e.target === e.currentTarget) setSuggestBioList(false); }}
        >
          <div className="modal" role="dialog" aria-modal={true} aria-labelledby="sb-title">
            <button className="modal-close-x" type="button" onClick={() => setSuggestBioList(false)} aria-label="Close">×</button>
            <h3 id="sb-title">✨ 5 bio suggestions</h3>
            <p className="modal-sub">Click one to swap it into your bio. You can keep editing after.</p>
            <div id="suggest-bio-list" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {BIO_SUGGESTIONS.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => {
                    setBio(s);
                    markDirty();
                    setSuggestBioList(false);
                  }}
                  style={{
                    textAlign: "left",
                    background: "var(--bg-muted)",
                    border: "1px solid var(--border)",
                    borderRadius: 9,
                    padding: "10px 12px",
                    fontFamily: "inherit",
                    fontSize: 13,
                    cursor: "pointer",
                    lineHeight: 1.5,
                    color: "var(--fg)",
                  }}
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setSuggestBioList(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
