/**
 * SettingsSecurity — Security sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-security.html (1990 LOC)
 * Every class, SVG path, copy, and stub value copied verbatim from the mockup.
 * No real API wiring — all interactive handlers are no-ops or local React state.
 *
 * Sections (in order):
 *   1. Conditional banners — no-2FA warn / suspicious-activity danger
 *   2. Password — change-password button, sign-out-all-others button
 *   3. Two-factor authentication — TOTP status, backup codes, recovery method
 *   4. Active sessions — 5 stub sessions, per-session sign-out
 *   5. Login history — 12 rows, filter tabs, search, CSV download stub
 *   6. Connected accounts — Google (connected), GitHub, Apple (disconnected)
 *   7. Recommendations rail — security score, 4 rec items, about card
 *
 * Modals (centered, NEVER drawers per locked mockup rule):
 *   - Change password        (AC-1..4, ECN-07)
 *   - 2FA setup stepper      (AC-5..6, step 1: QR, step 2: verify, step 3: backup codes)
 *   - View backup codes      (AC-7, ECN-01)
 *   - Regenerate codes       (AC-8, ECN-08)
 *   - Disable 2FA            (ECN-09)
 *   - Sign out all others    (AC-11)
 *   - Disconnect OAuth
 *   - Backup-codes save-prompt-on-close (ECN-01)
 *
 * TODO: wire to auth/security API
 *
 * Story: F-APP-SETTINGS-SECURITY-001 (#35)
 */

import { useState, useCallback, useRef, useEffect } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type SecurityState = "filled" | "no-2fa" | "suspicious";
type ModalId =
  | "change-password"
  | "totp-setup"
  | "backup-codes-view"
  | "regenerate-codes"
  | "disable-2fa"
  | "signout-all"
  | "disconnect"
  | "codes-close-warn"
  | null;

// ─── Stub data (verbatim from mockup) ────────────────────────────────────────

const STUB_SESSIONS = [
  {
    id: "s1",
    icon: "💻",
    device: "MacBook Pro 16\" — Safari 17.4",
    isCurrent: true,
    location: "Lisbon, Portugal",
    ip: "212.18.4.22",
    lastSeen: "just now",
    stale: false,
    chips: [] as string[],
  },
  {
    id: "s2",
    icon: "📱",
    device: "iPhone 15 Pro — Safari Mobile 17.4",
    isCurrent: false,
    location: "Lisbon, Portugal",
    ip: "212.18.4.22",
    lastSeen: "2 hours ago",
    stale: false,
    chips: [] as string[],
  },
  {
    id: "s3",
    icon: "💻",
    device: "MacBook Air M2 — Chrome 124",
    isCurrent: false,
    location: "Lisbon, Portugal",
    ip: "212.18.4.22",
    lastSeen: "yesterday 18:42",
    stale: false,
    chips: ["Same Wi-Fi"],
  },
  {
    id: "s4",
    icon: "🖥️",
    device: "Windows 11 — Chrome 124",
    isCurrent: false,
    location: "Berlin, Germany",
    ip: "85.214.38.12",
    lastSeen: "",
    stale: true,
    staleText: "Last seen 27 days ago — will auto-expire in 63 days",
    chips: [] as string[],
  },
  {
    id: "s5",
    icon: "📱",
    device: "iPad Pro 11\" — Safari Mobile 16.6",
    isCurrent: false,
    location: "Lagos, Portugal",
    ip: "213.13.205.7",
    lastSeen: "5 days ago",
    stale: false,
    chips: [] as string[],
  },
] as const;

const STUB_HISTORY = [
  { id: "h1",  kind: "success", icon: "✅", event: "Signed in",             meta: "MacBook Pro · Safari 17 · Lisbon, PT · 212.18.4.22", method: "m-totp",     methodLabel: "Password + 2FA",  time: "Today 09:14" },
  { id: "h2",  kind: "success", icon: "✅", event: "Signed in",             meta: "iPhone 15 Pro · Safari Mobile · Lisbon, PT · 212.18.4.22", method: "m-magic",    methodLabel: "Magic link",      time: "Yesterday 21:02" },
  { id: "h3",  kind: "success", icon: "🔐", event: "2FA enabled",           meta: "MacBook Pro · Safari · Lisbon, PT", method: "m-totp",     methodLabel: "TOTP enrol",      time: "Mar 9, 14:32" },
  { id: "h4",  kind: "success", icon: "✅", event: "Signed in",             meta: "MacBook Pro · Safari 17 · Lisbon, PT · 212.18.4.22", method: "m-password", methodLabel: "Password",        time: "Apr 22, 08:40" },
  { id: "h5",  kind: "fail",    icon: "⚠️", event: "Failed sign-in attempt", meta: "Unknown device · Berlin, DE · 85.214.38.12 · wrong password", method: "m-password", methodLabel: "Password",    time: "Apr 20, 03:17" },
  { id: "h6",  kind: "success", icon: "🔑", event: "Password changed",      meta: "MacBook Pro · Safari · Lisbon, PT · all other sessions revoked", method: "m-password", methodLabel: "Password", time: "Mar 9, 14:18" },
  { id: "h7",  kind: "success", icon: "✅", event: "Signed in",             meta: "iPad Pro · Safari Mobile · Lagos, PT · 213.13.205.7", method: "m-oauth",    methodLabel: "Google OAuth",    time: "Apr 19, 19:11" },
  { id: "h8",  kind: "success", icon: "✅", event: "Signed in",             meta: "Windows 11 · Chrome 124 · Berlin, DE · 85.214.38.12", method: "m-password", methodLabel: "Password",      time: "Apr 18, 22:55" },
  { id: "h9",  kind: "fail",    icon: "⚠️", event: "Failed sign-in attempt", meta: "Unknown device · Berlin, DE · 85.214.38.12 · invalid 2FA code", method: "m-totp",  methodLabel: "Password + 2FA", time: "Apr 18, 22:51" },
  { id: "h10", kind: "success", icon: "🚪", event: "Signed out — manual",   meta: "MacBook Air · Chrome · Lisbon, PT · 212.18.4.22", method: "m-password", methodLabel: "—",               time: "Apr 16, 17:30" },
  { id: "h11", kind: "success", icon: "✅", event: "Signed in",             meta: "MacBook Pro · Safari 17 · Lisbon, PT · 212.18.4.22", method: "m-magic",    methodLabel: "Magic link",      time: "Apr 14, 10:08" },
  { id: "h12", kind: "success", icon: "✅", event: "Signed in via Google",  meta: "MacBook Pro · Safari 17 · Lisbon, PT · 212.18.4.22", method: "m-oauth",    methodLabel: "Google OAuth",    time: "Apr 12, 09:00" },
] as const;

const BACKUP_CODES_SETUP = [
  "4P9C-WK2L", "JX7V-Q3RM",
  "HG1A-D8YN", "T6BS-LF2K",
  "9MC3-XZ7P", "RW8E-N5VT",
  "K2HJ-PQ6Y", "BX4U-S9LM",
  "FD7T-G3WA", "YN1Q-VB6E",
] as const;

const BACKUP_CODES_VIEW = [
  { code: "4P9C-WK2L", used: false },
  { code: "used",       used: true  },
  { code: "HG1A-D8YN", used: false },
  { code: "T6BS-LF2K", used: false },
  { code: "9MC3-XZ7P", used: false },
  { code: "RW8E-N5VT", used: false },
  { code: "K2HJ-PQ6Y", used: false },
  { code: "used",       used: true  },
  { code: "FD7T-G3WA", used: false },
  { code: "YN1Q-VB6E", used: false },
] as const;

// ─── Password strength helpers (verbatim heuristic from mockup) ───────────────

const COMMON_PASSWORDS = ["password","123456","qwerty","letmein","admin","welcome","alexandra","tadaify"];

function scorePassword(v: string): number {
  if (!v) return 0;
  let score = 0;
  if (v.length >= 12) score += 1;
  if (v.length >= 16) score += 1;
  if (/[a-z]/.test(v) && /[A-Z]/.test(v)) score += 1;
  if (/\d/.test(v) && /[^a-zA-Z\d]/.test(v)) score += 1;
  const lc = v.toLowerCase();
  const isCommon = COMMON_PASSWORDS.some((c) => lc.includes(c));
  if (isCommon) score = Math.max(0, score - 2);
  return Math.min(4, score);
}

const PW_LABELS = ["—", "Weak", "Fair", "Good", "Strong"] as const;

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsSecurity() {
  // ── Demo security state (filled = 2FA on, no-2fa = off, suspicious) ──────
  const [secState, setSecState] = useState<SecurityState>("filled"); // TODO: wire to auth/security API

  // ── Sessions — track which ones have been signed out ─────────────────────
  const [dismissedSessions, setDismissedSessions] = useState<Set<string>>(new Set()); // TODO: wire to auth/security API

  // ── Login history filter ──────────────────────────────────────────────────
  const [historyFilter, setHistoryFilter] = useState<"all" | "success" | "fail">("all");
  const [historySearch, setHistorySearch] = useState("");

  // ── Modals ────────────────────────────────────────────────────────────────
  const [openModal, setOpenModal] = useState<ModalId>(null);
  const [disconnectProvider, setDisconnectProvider] = useState("Google");

  // ── TOTP setup stepper ────────────────────────────────────────────────────
  const [totpStep, setTotpStep] = useState(1);
  const [totpCode, setTotpCode] = useState("");
  const [totpCodeError, setTotpCodeError] = useState(false);
  const [codesAcknowledged, setCodesAcknowledged] = useState(false);
  const [codesSecretCopied, setCodesSecretCopied] = useState(false);
  const [copyAllLabel, setCopyAllLabel] = useState("Copy all");
  const [downloadLabel] = useState("Download as backup-codes.txt");

  // ── Change password modal state ───────────────────────────────────────────
  const [pwCurrent, setPwCurrent] = useState("");
  const [pwNew, setPwNew] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwCurrentError, setPwCurrentError] = useState(false);
  const [pwNewError, setPwNewError] = useState(false);
  const [pwConfirmError, setPwConfirmError] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  // ── Show/hide password toggles ────────────────────────────────────────────
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const [showDisablePw, setShowDisablePw] = useState(false);

  // ── Disable 2FA modal fields ──────────────────────────────────────────────
  const [disablePw, setDisablePw] = useState(""); // TODO: wire to auth/security API
  const [disableEmail, setDisableEmail] = useState(""); // TODO: wire to auth/security API

  // ── Derived password strength ─────────────────────────────────────────────
  const pwScore = scorePassword(pwNew);
  const pwMeetsLen       = pwNew.length >= 12;
  const pwMeetsMix       = /[a-zA-Z]/.test(pwNew) && /\d/.test(pwNew);
  const pwMeetsCase      = /[a-z]/.test(pwNew) && /[A-Z]/.test(pwNew);
  const pwMeetsUncommon  = pwNew.length > 0 && !COMMON_PASSWORDS.some((c) => pwNew.toLowerCase().includes(c));

  const pwSaveEnabled =
    pwCurrent.length > 0 &&
    pwNew.length >= 12 &&
    pwNew === pwConfirm;

  // ── Open / close modal helpers ────────────────────────────────────────────
  const showModal = useCallback((id: ModalId) => setOpenModal(id), []);

  const closeModal = useCallback(() => setOpenModal(null), []);

  const closeModalById = useCallback((id: ModalId) => {
    setOpenModal((prev) => (prev === id ? null : prev));
  }, []);

  // ── Esc key closes top-most modal ─────────────────────────────────────────
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key !== "Escape" || openModal === null) return;
      // ECN-01: backup codes close-without-save protective prompt
      if (openModal === "totp-setup" && totpStep === 3) {
        setOpenModal("codes-close-warn");
        return;
      }
      setOpenModal(null);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [openModal, totpStep]);

  // ── TOTP stepper helpers ──────────────────────────────────────────────────
  const resetTotpStepper = useCallback(() => {
    setTotpStep(1);
    setTotpCode("");
    setTotpCodeError(false);
    setCodesAcknowledged(false);
  }, []);

  const goTotpStep = useCallback((n: number) => setTotpStep(n), []);

  const verifyTotp = useCallback(() => {
    // TODO: wire to auth/security API
    // Mockup: reject "000000" (AC-6), accept anything else
    if (totpCode === "000000") {
      setTotpCodeError(true);
      return;
    }
    setTotpCodeError(false);
    goTotpStep(3);
  }, [totpCode, goTotpStep]);

  const finishTotpSetup = useCallback(() => {
    // TODO: wire to auth/security API
    closeModal();
    setSecState("filled");
    resetTotpStepper();
  }, [closeModal, resetTotpStepper]);

  // ── Password save (mockup stub) ───────────────────────────────────────────
  const handleSavePassword = useCallback(() => {
    // TODO: wire to auth/security API
    if (pwCurrent.toLowerCase() === "wrong") {
      setPwCurrentError(true);
      return;
    }
    setPwSaving(true);
    setTimeout(() => {
      setPwSaving(false);
      closeModal();
      setPwCurrent("");
      setPwNew("");
      setPwConfirm("");
      setPwCurrentError(false);
      setPwNewError(false);
      setPwConfirmError(false);
    }, 600);
  }, [pwCurrent, closeModal]);

  // ── Sign out single session ───────────────────────────────────────────────
  const signOutSession = useCallback((sessionId: string, label: string) => {
    // TODO: wire to auth/security API
    if (!window.confirm(`Sign out ${label}?\n\nThis will end that session immediately. They will receive 401 on the next request.`)) return;
    setDismissedSessions((prev) => new Set([...prev, sessionId]));
  }, []);

  // ── Copy helpers ──────────────────────────────────────────────────────────
  const copyText = useCallback((text: string, cb?: () => void) => {
    // TODO: wire to clipboard API
    if (navigator.clipboard) navigator.clipboard.writeText(text).catch(() => { /* no-op */ });
    cb?.();
  }, []);

  const handleCopyAllCodes = useCallback(() => {
    const text = BACKUP_CODES_SETUP.join("\n");
    copyText(text);
    setCopyAllLabel("✓ Copied");
    setTimeout(() => setCopyAllLabel("Copy all"), 1200);
  }, [copyText]);

  const handleDownloadCodes = useCallback(() => {
    // TODO: wire to auth/security API
    const content = `tadaify backup codes — alexandra@example.com\nGenerated ${new Date().toISOString()}\n\n${BACKUP_CODES_SETUP.join("\n")}\n`;
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "tadaify-backup-codes.txt";
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 100);
  }, []);

  const handleCopySecret = useCallback(() => {
    copyText("JBSWY3DPEHPK3PXPJBSWY3DPEHPK");
    setCodesSecretCopied(true);
    setTimeout(() => setCodesSecretCopied(false), 1000);
  }, [copyText]);

  // ── History filtering ─────────────────────────────────────────────────────
  const filteredHistory = STUB_HISTORY.filter((row) => {
    if (historyFilter !== "all" && row.kind !== historyFilter) return false;
    if (historySearch.trim()) {
      const q = historySearch.toLowerCase();
      if (!(row.event + row.meta + row.time).toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const twoFaEnabled = secState !== "no-2fa";

  return (
    <>
      {/* ============================================================
           Content pane — settings-content wraps the full security page
           ============================================================ */}
      <div className="settings-content" id="security-pane">

        {/* ── Conditional banners ── */}
        {secState === "no-2fa" && (
          <div className="sec-banner sec-banner--warn">
            <div className="sec-b-ico" aria-hidden="true">🛡️</div>
            <div className="sec-b-text">
              <div className="sec-b-title">Two-factor authentication is off</div>
              <div className="sec-b-sub">Adding an authenticator app is the single biggest thing you can do to protect your account. Takes about 90 seconds.</div>
            </div>
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => { resetTotpStepper(); showModal("totp-setup"); }}
            >
              Enable 2FA
            </button>
          </div>
        )}

        {secState === "suspicious" && (
          <div className="sec-banner sec-banner--danger">
            <div className="sec-b-ico" aria-hidden="true">⚠️</div>
            <div className="sec-b-text">
              <div className="sec-b-title">3 failed sign-in attempts in the last 24 hours</div>
              <div className="sec-b-sub">
                From{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>85.214.38.12</span>
                {" "}(Berlin, Germany). Your account stayed locked for 15 min after the 5-failure threshold. If this wasn't you, change your password and review sessions.
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              type="button"
              onClick={() => document.getElementById("sec-login-history")?.scrollIntoView({ behavior: "smooth" })}
            >
              Review history
            </button>
          </div>
        )}

        {/* ── Two-column grid: main column + recommendations rail ── */}
        <div className="sec-grid">
          <div className="sec-col-main">

            {/* ========================= PASSWORD ========================= */}
            <section className="sec" id="sec-password-section" aria-labelledby="sec-password-h">
              <div className="sec-head">
                <div>
                  <div className="sec-title">Password</div>
                  <h2 className="sec-h3" id="sec-password-h" style={{ marginTop: 6 }}>Sign-in password</h2>
                  <p className="sec-sub">Used when you sign in with email + password. We hash with bcrypt cost-10 server-side; we never store the plaintext.</p>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span className="chip chip-warn" title="Reminder shows after 90 days">
                    Last changed <b style={{ marginLeft: 4 }}>47 days ago</b>
                  </span>
                  <div style={{ fontSize: 11.5, color: "var(--fg-subtle)", marginTop: 4 }}>Reminder at 90 days</div>
                </div>
              </div>

              <div className="field-row">
                <div className="field-label">
                  Change password
                  <span className="field-hint">Opens a centered modal to change in one step</span>
                </div>
                <div className="field-body">
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    onClick={() => showModal("change-password")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                    </svg>
                    Change password
                  </button>
                  <p className="field-help">All other devices are signed out automatically when your password changes (this session stays active).</p>
                </div>
              </div>

              <div className="field-row">
                <div className="field-label">
                  Sign out everywhere
                  <span className="field-hint">Without changing your password</span>
                </div>
                <div className="field-body">
                  <button
                    className="btn btn-ghost btn-sm"
                    type="button"
                    onClick={() => showModal("signout-all")}
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                    </svg>
                    Sign out all other sessions
                  </button>
                  <p className="field-help">Useful if you signed in on a friend's laptop and forgot to log out. Your current session keeps working.</p>
                </div>
              </div>
            </section>

            {/* ========================= 2FA ========================= */}
            <section className="sec" id="sec-twofa-section" aria-labelledby="sec-twofa-h">
              <div className="sec-head">
                <div>
                  <div className="sec-title">Two-factor authentication</div>
                  <h2 className="sec-h3" id="sec-twofa-h" style={{ marginTop: 6 }}>Authenticator app (TOTP)</h2>
                  <p className="sec-sub">Time-based one-time codes from Google Authenticator, 1Password, Authy, Bitwarden, or any RFC-6238 app. Allows ±30 s clock skew (ECN-06).</p>
                </div>
                <div id="sec-totp-status">
                  {twoFaEnabled ? (
                    <span className="sec-status-pill sec-status-pill--on">
                      <span className="sec-status-dot" aria-hidden="true" />
                      Enabled
                    </span>
                  ) : (
                    <span className="sec-status-pill sec-status-pill--off">
                      <span className="sec-status-dot" aria-hidden="true" />
                      Disabled
                    </span>
                  )}
                </div>
              </div>

              {/* Authenticator row */}
              <div className="field-row">
                <div className="field-label">
                  Authenticator
                  <span className="field-hint">RFC-6238 TOTP, 6 digits / 30 s</span>
                </div>
                <div className="field-body" style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
                  {!twoFaEnabled ? (
                    <button
                      className="btn btn-primary btn-sm"
                      type="button"
                      onClick={() => { resetTotpStepper(); showModal("totp-setup"); }}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
                      </svg>
                      Set up authenticator
                    </button>
                  ) : (
                    <>
                      <span style={{ fontSize: 13, color: "var(--fg-muted)", display: "inline-flex", alignItems: "center", gap: 8 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--success)" }}>
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                        Enrolled <b style={{ color: "var(--fg)" }}>Mar 9, 2026</b> · last used <b style={{ color: "var(--fg)" }}>today 09:14</b>
                      </span>
                      <button
                        className="btn btn-danger-ghost btn-sm"
                        type="button"
                        onClick={() => showModal("disable-2fa")}
                      >
                        Disable 2FA
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Backup codes row — only when 2FA enabled */}
              {twoFaEnabled && (
                <div className="field-row">
                  <div className="field-label">
                    Backup codes
                    <span className="field-hint">Single-use, bypass 2FA if you lose your device</span>
                  </div>
                  <div className="field-body">
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                      <span className="chip chip-success">8 of 10 unused</span>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => showModal("backup-codes-view")}
                      >
                        View remaining
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        type="button"
                        onClick={() => showModal("regenerate-codes")}
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="23 4 23 10 17 10" /><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                        Regenerate (invalidates old)
                      </button>
                    </div>
                    <p className="field-help">2 used so far — if you used them on a known device, you're good. If they're missing and you didn't use them, regenerate immediately.</p>
                  </div>
                </div>
              )}

              {/* Recovery method row — only when 2FA enabled */}
              {twoFaEnabled && (
                <div className="field-row">
                  <div className="field-label">
                    Recovery method
                    <span className="field-hint">If both authenticator and backup codes are lost</span>
                  </div>
                  <div className="field-body">
                    <div style={{ fontSize: 13, color: "var(--fg)" }}>
                      Email <b>alexandra@example.com</b> — verified Apr 12, 2026
                    </div>
                    <p className="field-help">
                      If you lose access, contact{" "}
                      <a href="mailto:support@tadaify.com?subject=TOTP%20account%20recovery" style={{ color: "var(--brand-primary)" }}>
                        support@tadaify.com
                      </a>{" "}
                      from this verified email. We never auto-recover 2FA — security trade-off (ECN-02).
                    </p>
                  </div>
                </div>
              )}
            </section>

            {/* ========================= ACTIVE SESSIONS ========================= */}
            <section className="sec" id="sec-sessions-section" aria-labelledby="sec-sessions-h">
              <div className="sec-head">
                <div>
                  <div className="sec-title">Active sessions</div>
                  <h2 className="sec-h3" id="sec-sessions-h" style={{ marginTop: 6 }}>Where you're signed in</h2>
                  <p className="sec-sub">Sessions auto-prune after 90 days of inactivity (ECN-05). Click any device's <b>Sign out</b> to revoke access immediately — that browser will receive 401 on its next request.</p>
                </div>
                <button
                  className="btn btn-ghost btn-sm"
                  type="button"
                  onClick={() => showModal("signout-all")}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" />
                  </svg>
                  Sign out all other sessions
                </button>
              </div>

              {STUB_SESSIONS.filter((s) => !dismissedSessions.has(s.id)).map((sess) => (
                <div className="sec-sess-row" key={sess.id}>
                  <div className="sec-sess-icon" aria-hidden="true">{sess.icon}</div>
                  <div className="sec-sess-info">
                    <div className="sec-s-device">
                      {sess.device}
                      {sess.isCurrent && (
                        <span className="sec-sess-current-pill">This session</span>
                      )}
                      {sess.chips.map((c) => (
                        <span key={c} className="chip">{c}</span>
                      ))}
                    </div>
                    <div className="sec-s-meta">
                      {sess.location}
                      <span className="sec-s-dot">·</span>
                      <span className="sec-s-mono">{sess.ip}</span>
                      <span className="sec-s-dot">·</span>
                      {sess.stale ? (
                        <span className="sec-s-stale">{(sess as typeof STUB_SESSIONS[3]).staleText}</span>
                      ) : (
                        <>Last seen <b style={{ color: "var(--fg)" }}>{sess.lastSeen}</b></>
                      )}
                    </div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    type="button"
                    disabled={sess.isCurrent}
                    title={sess.isCurrent ? "Can't sign out the session you're using" : undefined}
                    onClick={() => !sess.isCurrent && signOutSession(sess.id, sess.device)}
                  >
                    Sign out
                  </button>
                </div>
              ))}
            </section>

            {/* ========================= LOGIN HISTORY ========================= */}
            <section className="sec" id="sec-login-history" aria-labelledby="sec-history-h">
              <div className="sec-head">
                <div>
                  <div className="sec-title">Login history</div>
                  <h2 className="sec-h3" id="sec-history-h" style={{ marginTop: 6 }}>Last 30 days</h2>
                  <p className="sec-sub">Read-only audit log of every sign-in event. Older entries are pruned automatically (ECN-10). Suspicious? Tell us — we'll investigate.</p>
                </div>
                <a
                  href="mailto:support@tadaify.com?subject=Suspicious%20activity%20on%20my%20account&body=I%20see%20unfamiliar%20activity%20in%20my%20login%20history.%20Please%20investigate.%20My%20handle%3A%20alexandra"
                  className="btn btn-ghost btn-sm"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                  Suspicious activity?
                </a>
              </div>

              <div className="sec-log-toolbar">
                <div className="sec-log-tabs" role="tablist">
                  {(["all", "success", "fail"] as const).map((f) => {
                    const labels = { all: `All 12`, success: `Successful 10`, fail: `Failed 2` };
                    return (
                      <button
                        key={f}
                        className={`sec-log-tab${historyFilter === f ? " active" : ""}`}
                        role="tab"
                        aria-selected={historyFilter === f}
                        type="button"
                        onClick={() => setHistoryFilter(f)}
                      >
                        {labels[f]}
                      </button>
                    );
                  })}
                </div>
                <div className="sec-log-search">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search by IP, device, or location…"
                    value={historySearch}
                    onChange={(e) => setHistorySearch(e.target.value)}
                  />
                </div>
              </div>

              <div id="sec-history-rows">
                {filteredHistory.map((row) => (
                  <div
                    key={row.id}
                    className={`sec-log-row${row.kind === "fail" ? " is-failed" : ""}`}
                    data-kind={row.kind}
                  >
                    <div className="sec-lr-icon">{row.icon}</div>
                    <div className="sec-lr-event">
                      {row.event}
                      <span className="sec-lr-meta"><span className="sec-lr-mono">{row.meta}</span></span>
                    </div>
                    <span className={`sec-lr-method ${row.method}`}>{row.methodLabel}</span>
                    <div className="sec-lr-time">{row.time}</div>
                  </div>
                ))}
              </div>

              <div className="sec-log-foot">
                <span>Showing last 30 days · Older entries pruned automatically (ECN-10).</span>
                <button
                  className="sec-lf-link"
                  type="button"
                  onClick={() => { /* TODO: wire to auth/security API — download CSV */ }}
                >
                  Download as CSV
                </button>
              </div>
            </section>

            {/* ========================= CONNECTED ACCOUNTS ========================= */}
            <section className="sec" aria-labelledby="sec-oauth-h">
              <div className="sec-head">
                <div>
                  <div className="sec-title">Connected accounts</div>
                  <h2 className="sec-h3" id="sec-oauth-h" style={{ marginTop: 6 }}>Sign in with…</h2>
                  <p className="sec-sub">Use a connected account as an alternative way to sign in. You can disconnect at any time as long as you have a password set.</p>
                </div>
              </div>

              <div className="sec-oauth-grid">
                {/* Google — connected */}
                <div className="sec-oauth-card">
                  <div className="sec-o-ico sec-o-ico--g">G</div>
                  <div className="sec-o-info">
                    <div className="sec-o-name">Google</div>
                    <div className="sec-o-meta">Connected as <b style={{ color: "var(--fg)" }}>alexandra@gmail.com</b></div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    type="button"
                    onClick={() => { setDisconnectProvider("Google"); showModal("disconnect"); }}
                  >
                    Disconnect
                  </button>
                </div>

                {/* GitHub — not connected */}
                <div className="sec-oauth-card sec-oauth-card--disconnected">
                  <div className="sec-o-ico sec-o-ico--gh">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56v-2c-3.2.7-3.87-1.36-3.87-1.36-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.69.08-.69 1.15.08 1.75 1.18 1.75 1.18 1.02 1.75 2.68 1.24 3.34.95.1-.74.4-1.24.72-1.53-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.05 0 0 .96-.31 3.15 1.18a10.99 10.99 0 0 1 5.74 0c2.19-1.49 3.15-1.18 3.15-1.18.62 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.42-2.7 5.4-5.27 5.68.41.36.78 1.07.78 2.16v3.2c0 .31.21.68.79.56 4.57-1.52 7.86-5.83 7.86-10.91C23.5 5.65 18.35.5 12 .5z" />
                    </svg>
                  </div>
                  <div className="sec-o-info">
                    <div className="sec-o-name">GitHub</div>
                    <div className="sec-o-meta">Not connected</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    type="button"
                    onClick={() => { /* TODO: wire to auth/security API — start GitHub OAuth flow */ }}
                  >
                    Connect
                  </button>
                </div>

                {/* Apple — not connected */}
                <div className="sec-oauth-card sec-oauth-card--disconnected">
                  <div className="sec-o-ico sec-o-ico--ap">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.05 12.04c-.03-2.96 2.42-4.39 2.53-4.46-1.38-2.02-3.53-2.3-4.29-2.33-1.83-.18-3.57 1.07-4.5 1.07-.93 0-2.36-1.05-3.88-1.02-2 .03-3.84 1.16-4.86 2.95-2.07 3.59-.53 8.91 1.49 11.83.99 1.43 2.16 3.03 3.7 2.97 1.49-.06 2.05-.96 3.85-.96s2.31.96 3.88.93c1.6-.03 2.61-1.45 3.59-2.89 1.13-1.66 1.59-3.27 1.61-3.35-.04-.02-3.09-1.18-3.12-4.74zM14.42 3.27c.82-1 1.37-2.37 1.22-3.74-1.18.05-2.6.79-3.45 1.78-.76.88-1.43 2.29-1.25 3.62 1.31.1 2.66-.66 3.48-1.66z" />
                    </svg>
                  </div>
                  <div className="sec-o-info">
                    <div className="sec-o-name">Apple</div>
                    <div className="sec-o-meta">Not connected</div>
                  </div>
                  <button
                    className="btn btn-ghost btn-xs"
                    type="button"
                    onClick={() => { /* TODO: wire to auth/security API — start Sign in with Apple flow */ }}
                  >
                    Connect
                  </button>
                </div>
              </div>

              <p className="field-help" style={{ marginTop: 14 }}>
                Disconnecting a provider doesn't sign you out — it just removes that sign-in option for next time.
              </p>
            </section>

          </div>

          {/* =================== RECOMMENDATIONS RAIL =================== */}
          <aside className="sec-col-side" aria-label="Security recommendations">

            <div className="sec-rec-card">
              <div className="sec-rec-head">
                <div className="sec-rec-title">Security score</div>
                <span className="sec-rec-score sec-rec-score--good">82 / 100 · Good</span>
              </div>
              <div style={{ fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.5, marginBottom: 14 }}>
                Based on password age, 2FA, recent sessions, and connected accounts. Updated live.
              </div>
              <div className="sec-rec-list">

                {/* 2FA rec — only shown when 2FA disabled */}
                {!twoFaEnabled && (
                  <div className="sec-rec-item sec-rec-2fa prio-high">
                    <span className="sec-rec-prio" aria-hidden="true" />
                    <div className="sec-rec-body">
                      <div className="sec-rec-name">Enable two-factor authentication</div>
                      <div className="sec-rec-desc">Single biggest jump in account safety. Costs you 90 seconds, blocks 99% of credential-stuffing attacks.</div>
                      <button
                        className="sec-rec-cta"
                        type="button"
                        onClick={() => { resetTotpStepper(); showModal("totp-setup"); }}
                      >
                        Set up now →
                      </button>
                    </div>
                  </div>
                )}

                <div className="sec-rec-item prio-med">
                  <span className="sec-rec-prio" aria-hidden="true" />
                  <div className="sec-rec-body">
                    <div className="sec-rec-name">Update your password</div>
                    <div className="sec-rec-desc">Last changed 47 days ago — still healthy. We'll remind you again at 90 days.</div>
                    <button
                      className="sec-rec-cta"
                      type="button"
                      onClick={() => showModal("change-password")}
                    >
                      Change now →
                    </button>
                  </div>
                </div>

                <div className="sec-rec-item prio-low">
                  <span className="sec-rec-prio" aria-hidden="true" />
                  <div className="sec-rec-body">
                    <div className="sec-rec-name">Review your active sessions</div>
                    <div className="sec-rec-desc">5 active sessions on 4 devices. The Berlin Windows session has been idle for 27 days — consider signing it out.</div>
                    <button
                      className="sec-rec-cta"
                      type="button"
                      onClick={() => document.getElementById("sec-sessions-section")?.scrollIntoView({ behavior: "smooth" })}
                    >
                      Review →
                    </button>
                  </div>
                </div>

                <div className="sec-rec-item prio-low sec-rec-item--done">
                  <span className="sec-rec-prio" aria-hidden="true" />
                  <div className="sec-rec-body">
                    <div className="sec-rec-name">Connect a backup sign-in method</div>
                    <div className="sec-rec-desc">Google connected — you can recover access even without your password.</div>
                  </div>
                </div>

              </div>
            </div>

            <div className="sec-rec-card">
              <div className="sec-rec-head">
                <div className="sec-rec-title">About this tab</div>
              </div>
              <p style={{ fontSize: 12.5, color: "var(--fg-muted)", lineHeight: 1.55, margin: "0 0 10px" }}>
                Security settings are <b style={{ color: "var(--fg)" }}>free for every tier</b> — Free, Creator, Pro, and Business get the same features.
                We never charge for staying safe.
              </p>
              <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", lineHeight: 1.5, margin: 0 }}>
                Powered by Supabase Auth (MFA module RFC-6238). Backup codes hashed with bcrypt cost-12. Login audit pruned at 30 days, sessions at 90 days.
              </p>
            </div>

            {/* "All changes saved automatically" strip */}
            <div className="sec-auto-status" title="Security changes apply immediately — there's no batch save here.">
              <span className="sec-auto-dot" aria-hidden="true" />
              All changes saved automatically
            </div>

          </aside>
        </div>
      </div>

      {/* ============================================================
           MODALS — every action opens a CENTERED MODAL (never a drawer)
           ============================================================ */}

      {/* ── Change password modal ── */}
      {openModal === "change-password" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true} aria-labelledby="sec-cp-title">
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3 id="sec-cp-title">Change password</h3>
            <p className="sec-modal-sub">All other devices will be signed out automatically — this session stays. If 2FA is on, it stays on (ECN-07).</p>

            <div className="field-row">
              <div className="field-label" style={{ width: 130 }}>Current password</div>
              <div className="field-body">
                <div className="sec-pw-wrap">
                  <input
                    className={`field-input${pwCurrentError ? " has-error" : ""}`}
                    type={showPwCurrent ? "text" : "password"}
                    id="sec-pw-current"
                    autoComplete="current-password"
                    placeholder="Your current password"
                    value={pwCurrent}
                    onChange={(e) => { setPwCurrent(e.target.value); setPwCurrentError(false); }}
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em", paddingRight: 38 }}
                  />
                  <button
                    className="sec-pw-eye"
                    type="button"
                    onClick={() => setShowPwCurrent((v) => !v)}
                    aria-label="Show / hide password"
                    style={{ color: showPwCurrent ? "var(--brand-primary)" : undefined }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                {pwCurrentError && <div className="field-error" style={{ display: "block" }}>Current password is incorrect.</div>}
              </div>
            </div>

            <div className="field-row">
              <div className="field-label" style={{ width: 130 }}>New password</div>
              <div className="field-body">
                <div className="sec-pw-wrap">
                  <input
                    className={`field-input${pwNewError ? " has-error" : ""}`}
                    type={showPwNew ? "text" : "password"}
                    id="sec-pw-new"
                    autoComplete="new-password"
                    placeholder="Min. 12 characters"
                    value={pwNew}
                    onChange={(e) => {
                      setPwNew(e.target.value);
                      setPwNewError(e.target.value.length > 0 && e.target.value.length < 12);
                    }}
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em", paddingRight: 38 }}
                  />
                  <button
                    className="sec-pw-eye"
                    type="button"
                    onClick={() => setShowPwNew((v) => !v)}
                    aria-label="Show / hide password"
                    style={{ color: showPwNew ? "var(--brand-primary)" : undefined }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>

                {/* Strength meter */}
                <div className="sec-pw-strength">
                  <div className="sec-pw-bars" data-level={pwScore}>
                    <span className="sec-pw-bar" />
                    <span className="sec-pw-bar" />
                    <span className="sec-pw-bar" />
                    <span className="sec-pw-bar" />
                  </div>
                  <div className="sec-pw-strength-label">
                    Strength:{" "}
                    <span
                      className="sec-lab-val"
                      style={{
                        color: pwScore === 0 ? "var(--fg-muted)"
                             : pwScore === 1 ? "var(--danger)"
                             : pwScore === 2 ? "#92400E"
                             : "#047857",
                      }}
                    >
                      {PW_LABELS[pwScore]}
                    </span>
                  </div>
                </div>

                {/* Requirements */}
                <ul className="sec-pw-reqs">
                  <li className={pwMeetsLen ? "is-met" : ""}>
                    <span className="sec-req-ico">{pwMeetsLen ? "✓" : "·"}</span>
                    At least 12 characters
                  </li>
                  <li className={pwMeetsMix ? "is-met" : ""}>
                    <span className="sec-req-ico">{pwMeetsMix ? "✓" : "·"}</span>
                    Mixes letters and numbers
                  </li>
                  <li className={pwMeetsCase ? "is-met" : ""}>
                    <span className="sec-req-ico">{pwMeetsCase ? "✓" : "·"}</span>
                    Has lowercase and uppercase
                  </li>
                  <li className={pwMeetsUncommon ? "is-met" : ""}>
                    <span className="sec-req-ico">{pwMeetsUncommon ? "✓" : "·"}</span>
                    Not a common pattern (no <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>password</code>, <code style={{ fontFamily: "var(--font-mono)", fontSize: 11 }}>123456</code>, your handle…)
                  </li>
                </ul>

                {pwNewError && <div className="field-error" style={{ display: "block" }}>Minimum 12 characters.</div>}
              </div>
            </div>

            <div className="field-row">
              <div className="field-label" style={{ width: 130 }}>Confirm</div>
              <div className="field-body">
                <div className="sec-pw-wrap">
                  <input
                    className={`field-input${pwConfirmError ? " has-error" : ""}`}
                    type={showPwConfirm ? "text" : "password"}
                    id="sec-pw-confirm"
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    value={pwConfirm}
                    onChange={(e) => {
                      setPwConfirm(e.target.value);
                      setPwConfirmError(e.target.value.length > 0 && e.target.value !== pwNew);
                    }}
                    style={{ fontFamily: "var(--font-mono)", letterSpacing: "0.05em", paddingRight: 38 }}
                  />
                  <button
                    className="sec-pw-eye"
                    type="button"
                    onClick={() => setShowPwConfirm((v) => !v)}
                    aria-label="Show / hide password"
                    style={{ color: showPwConfirm ? "var(--brand-primary)" : undefined }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
                {pwConfirmError && <div className="field-error" style={{ display: "block" }}>Passwords don't match.</div>}
              </div>
            </div>

            <div className="sec-modal-info">
              <b>Heads up:</b> All other active sessions will be signed out as soon as you save. You'll stay signed in here.
            </div>

            <div className="sec-modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                disabled={!pwSaveEnabled || pwSaving}
                onClick={handleSavePassword}
              >
                {pwSaving ? (
                  <>
                    <svg className="security-spin" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <path d="M21 12a9 9 0 1 1-6.2-8.55" />
                    </svg>
                    Saving…
                  </>
                ) : (
                  <>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Save password
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 2FA Setup modal (3 steps) ── */}
      {openModal === "totp-setup" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => {
            if (e.target !== e.currentTarget) return;
            if (totpStep === 3) { showModal("codes-close-warn"); return; }
            closeModal();
          }}
        >
          <div className="sec-modal-card sec-modal-card--wide" role="dialog" aria-modal={true} aria-labelledby="sec-totp-title">
            <button
              className="sec-modal-close-x"
              type="button"
              aria-label="Close"
              onClick={() => {
                if (totpStep === 3) { showModal("codes-close-warn"); return; }
                closeModal();
              }}
            >
              ×
            </button>
            <h3 id="sec-totp-title">Set up two-factor authentication</h3>
            <p className="sec-modal-sub">A 6-digit code from your authenticator app, in addition to your password. Adds about 5 seconds to sign-in.</p>

            {/* Stepper */}
            <div className="sec-totp-stepper" aria-label="Setup steps">
              {[
                { n: 1, label: "Scan QR" },
                { n: 2, label: "Verify code" },
                { n: 3, label: "Backup codes" },
              ].map((s, i) => (
                <span key={s.n} style={{ display: "contents" }}>
                  <span
                    className={`sec-step-pill${totpStep === s.n ? " is-current" : totpStep > s.n ? " is-done" : ""}`}
                  >
                    <span className="sec-step-num">{totpStep > s.n ? "✓" : s.n}</span>
                    {s.label}
                  </span>
                  {i < 2 && <span className="sec-step-arrow" aria-hidden="true">→</span>}
                </span>
              ))}
            </div>

            {/* Step 1: Scan QR */}
            {totpStep === 1 && (
              <div>
                <div className="sec-qr-row">
                  <div className="sec-qr-tile" aria-label="QR code preview">
                    {/* Decorative QR-style SVG (not a real code) */}
                    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <rect width="100" height="100" fill="#fff" />
                      <g fill="#0B0F1E">
                        <rect x="6" y="6" width="22" height="22" /><rect x="11" y="11" width="12" height="12" fill="#fff" /><rect x="14" y="14" width="6" height="6" />
                        <rect x="72" y="6" width="22" height="22" /><rect x="77" y="11" width="12" height="12" fill="#fff" /><rect x="80" y="14" width="6" height="6" />
                        <rect x="6" y="72" width="22" height="22" /><rect x="11" y="77" width="12" height="12" fill="#fff" /><rect x="14" y="80" width="6" height="6" />
                        <rect x="34" y="8" width="4" height="4" /><rect x="42" y="8" width="4" height="4" /><rect x="50" y="8" width="4" height="4" /><rect x="58" y="8" width="4" height="4" />
                        <rect x="34" y="16" width="4" height="4" /><rect x="46" y="16" width="4" height="4" /><rect x="58" y="16" width="4" height="4" />
                        <rect x="38" y="24" width="4" height="4" /><rect x="46" y="24" width="4" height="4" /><rect x="54" y="24" width="4" height="4" /><rect x="62" y="24" width="4" height="4" />
                        <rect x="34" y="32" width="4" height="4" /><rect x="42" y="32" width="4" height="4" /><rect x="50" y="32" width="4" height="4" /><rect x="58" y="32" width="4" height="4" /><rect x="66" y="32" width="4" height="4" /><rect x="74" y="32" width="4" height="4" /><rect x="82" y="32" width="4" height="4" />
                        <rect x="8" y="34" width="4" height="4" /><rect x="16" y="34" width="4" height="4" /><rect x="24" y="34" width="4" height="4" />
                        <rect x="38" y="40" width="4" height="4" /><rect x="46" y="40" width="4" height="4" /><rect x="54" y="40" width="4" height="4" /><rect x="62" y="40" width="4" height="4" /><rect x="74" y="40" width="4" height="4" /><rect x="82" y="40" width="4" height="4" />
                        <rect x="8" y="42" width="4" height="4" /><rect x="20" y="42" width="4" height="4" /><rect x="28" y="42" width="4" height="4" />
                        <rect x="34" y="48" width="4" height="4" /><rect x="42" y="48" width="4" height="4" /><rect x="58" y="48" width="4" height="4" /><rect x="66" y="48" width="4" height="4" /><rect x="74" y="48" width="4" height="4" />
                        <rect x="8" y="50" width="4" height="4" /><rect x="16" y="50" width="4" height="4" /><rect x="24" y="50" width="4" height="4" />
                        <rect x="38" y="56" width="4" height="4" /><rect x="50" y="56" width="4" height="4" /><rect x="62" y="56" width="4" height="4" /><rect x="70" y="56" width="4" height="4" /><rect x="82" y="56" width="4" height="4" />
                        <rect x="34" y="64" width="4" height="4" /><rect x="46" y="64" width="4" height="4" /><rect x="54" y="64" width="4" height="4" /><rect x="66" y="64" width="4" height="4" /><rect x="78" y="64" width="4" height="4" />
                        <rect x="34" y="72" width="4" height="4" /><rect x="42" y="72" width="4" height="4" /><rect x="58" y="72" width="4" height="4" /><rect x="74" y="72" width="4" height="4" /><rect x="86" y="72" width="4" height="4" />
                        <rect x="38" y="80" width="4" height="4" /><rect x="50" y="80" width="4" height="4" /><rect x="62" y="80" width="4" height="4" /><rect x="74" y="80" width="4" height="4" /><rect x="82" y="80" width="4" height="4" />
                        <rect x="34" y="88" width="4" height="4" /><rect x="46" y="88" width="4" height="4" /><rect x="58" y="88" width="4" height="4" /><rect x="70" y="88" width="4" height="4" /><rect x="82" y="88" width="4" height="4" />
                      </g>
                    </svg>
                  </div>
                  <div className="sec-qr-info">
                    <ol>
                      <li>Open your authenticator app (Google Authenticator, 1Password, Authy, Bitwarden…).</li>
                      <li>Tap <b>+ Add</b> or <b>Scan QR code</b>.</li>
                      <li>Point your phone's camera at the code on the left.</li>
                      <li>Or paste the secret manually if your app doesn't scan QR.</li>
                    </ol>
                    <div className="sec-qr-secret-row" title="Manual setup secret (base32)">
                      <code>JBSWY3DPEHPK3PXPJBSWY3DP EHPK</code>
                      <button className="btn btn-ghost btn-xs" type="button" onClick={handleCopySecret}>
                        {codesSecretCopied ? "✓" : "Copy"}
                      </button>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", margin: "8px 0 0", lineHeight: 1.5 }}>
                      Account label in your app: <b style={{ color: "var(--fg)" }}>tadaify (alexandra@example.com)</b>
                    </p>
                  </div>
                </div>
                <div className="sec-modal-actions">
                  <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-primary btn-sm" type="button" onClick={() => goTotpStep(2)}>I scanned it — next →</button>
                </div>
              </div>
            )}

            {/* Step 2: Verify */}
            {totpStep === 2 && (
              <div>
                <p style={{ fontSize: 13, color: "var(--fg)", margin: "8px 0 12px" }}>
                  Enter the 6-digit code currently shown in your authenticator app to confirm pairing.
                </p>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={6}
                  className={`field-input sec-totp-input${totpCodeError ? " has-error" : ""}`}
                  id="sec-totp-code"
                  placeholder="000000"
                  value={totpCode}
                  onChange={(e) => {
                    const v = e.target.value.replace(/\D/g, "").slice(0, 6);
                    setTotpCode(v);
                    setTotpCodeError(false);
                  }}
                />
                {totpCodeError && (
                  <div className="field-error" style={{ display: "block" }}>Invalid code — try again. Codes refresh every 30 seconds.</div>
                )}
                <p style={{ fontSize: 11.5, color: "var(--fg-subtle)", margin: "10px 0 0", lineHeight: 1.5 }}>
                  Allows a ±30 s clock skew (RFC-6238) — if it keeps failing, check that your phone's clock is on automatic time.
                </p>
                <div className="sec-modal-actions">
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => goTotpStep(1)}>← Back</button>
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    disabled={totpCode.length !== 6}
                    onClick={verifyTotp}
                  >
                    Verify and enable
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Backup codes */}
            {totpStep === 3 && (
              <div>
                <div className="sec-modal-warning">
                  <b>Save these codes now.</b> They will not be shown again.
                  Each one signs you in once if you lose access to your authenticator.
                </div>
                <div className="sec-codes-grid">
                  {BACKUP_CODES_SETUP.map((code) => (
                    <code key={code}>{code}</code>
                  ))}
                </div>
                <div className="sec-codes-actions">
                  <button className="btn btn-ghost btn-sm" type="button" onClick={handleCopyAllCodes}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                    </svg>
                    {copyAllLabel}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={handleDownloadCodes}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                    </svg>
                    {downloadLabel}
                  </button>
                  <button className="btn btn-ghost btn-sm" type="button" onClick={() => window.print()}>Print</button>
                </div>
                <label className="sec-codes-ack">
                  <input
                    type="checkbox"
                    checked={codesAcknowledged}
                    onChange={(e) => setCodesAcknowledged(e.target.checked)}
                  />
                  I've saved these codes somewhere safe (password manager, printed paper, encrypted note).
                </label>
                <div className="sec-modal-actions">
                  <button
                    className="btn btn-primary btn-sm"
                    type="button"
                    disabled={!codesAcknowledged}
                    onClick={finishTotpSetup}
                  >
                    2FA enabled — done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── View remaining backup codes ── */}
      {openModal === "backup-codes-view" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Remaining backup codes</h3>
            <p className="sec-modal-sub">8 of 10 unused. Used codes are masked. To see fresh codes, regenerate (which invalidates these).</p>
            <div className="sec-codes-grid">
              {BACKUP_CODES_VIEW.map((entry, i) => (
                <code
                  key={i}
                  style={entry.used ? { opacity: 0.4, textDecoration: "line-through" } : undefined}
                >
                  {entry.used ? "used" : entry.code}
                </code>
              ))}
            </div>
            <div className="sec-modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => { closeModal(); showModal("regenerate-codes"); }}
              >
                Regenerate
              </button>
              <button className="btn btn-primary btn-sm" type="button" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Regenerate backup codes confirm ── */}
      {openModal === "regenerate-codes" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Regenerate backup codes?</h3>
            <p className="sec-modal-sub">This invalidates your existing 10 codes immediately. New codes will be shown <b>once</b> — save them right away (ECN-08).</p>
            <div className="sec-modal-warning">
              Any code you've written down or stored will stop working after you confirm.
            </div>
            <div className="sec-modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to auth/security API
                  closeModal();
                  resetTotpStepper();
                  goTotpStep(3);
                  showModal("totp-setup");
                }}
              >
                Yes — generate new codes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Disable 2FA confirm ── */}
      {openModal === "disable-2fa" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Disable two-factor authentication?</h3>
            <p className="sec-modal-sub">Your account will be protected by your password alone. We strongly recommend keeping 2FA on.</p>
            <div className="sec-modal-warning">
              Disabling will also delete all unused backup codes (ECN-09). You can always re-enable later.
            </div>
            <div className="field-row">
              <div className="field-label" style={{ width: 140 }}>Confirm password</div>
              <div className="field-body">
                <div className="sec-pw-wrap">
                  <input
                    className="field-input"
                    type={showDisablePw ? "text" : "password"}
                    placeholder="Your current password"
                    autoComplete="current-password"
                    value={disablePw}
                    onChange={(e) => setDisablePw(e.target.value)}
                    style={{ paddingRight: 38 }}
                  />
                  <button
                    className="sec-pw-eye"
                    type="button"
                    onClick={() => setShowDisablePw((v) => !v)}
                    aria-label="Show / hide password"
                    style={{ color: showDisablePw ? "var(--brand-primary)" : undefined }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            <div className="field-row">
              <div className="field-label" style={{ width: 140 }}>Recovery email</div>
              <div className="field-body">
                <input
                  className="field-input"
                  type="email"
                  placeholder="alexandra@example.com"
                  value={disableEmail}
                  onChange={(e) => setDisableEmail(e.target.value)}
                />
                <p className="field-help">Type your verified recovery email to confirm you have access.</p>
              </div>
            </div>
            <div className="sec-modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to auth/security API — supabase.auth.mfa.unenroll() + login_audit row
                  closeModal();
                  setSecState("no-2fa");
                  setDisablePw("");
                  setDisableEmail("");
                }}
              >
                Disable 2FA
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Sign out all others confirm ── */}
      {openModal === "signout-all" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Sign out all other sessions?</h3>
            <p className="sec-modal-sub">Every device except this one will be signed out immediately. They'll need to enter your password (and 2FA, if enabled) to sign back in.</p>
            <div className="sec-modal-info">
              Your iPhone, MacBook Air, Windows 11, and iPad Pro sessions will end. <b>This MacBook Pro stays signed in.</b>
            </div>
            <div className="sec-modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to auth/security API — supabase.auth.signOut({ scope: 'others' })
                  closeModal();
                  setDismissedSessions(new Set(["s2", "s3", "s4", "s5"]));
                }}
              >
                Yes — sign out everywhere else
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Disconnect OAuth confirm ── */}
      {openModal === "disconnect" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Disconnect {disconnectProvider}?</h3>
            <p className="sec-modal-sub">You'll no longer be able to sign in with this provider. Make sure you have a working password before disconnecting.</p>
            <div className="sec-modal-actions">
              <button className="btn btn-ghost btn-sm" type="button" onClick={closeModal}>Cancel</button>
              <button
                className="btn btn-danger btn-sm"
                type="button"
                onClick={() => {
                  // TODO: wire to auth/security API — DELETE /auth/v1/identities/<id>
                  closeModal();
                }}
              >
                Disconnect
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Save-prompt-on-close (ECN-01) ── */}
      {openModal === "codes-close-warn" && (
        <div
          className="sec-modal-bd sec-modal-bd--open"
          onClick={(e) => { if (e.target === e.currentTarget) closeModal(); }}
        >
          <div className="sec-modal-card" role="dialog" aria-modal={true}>
            <button className="sec-modal-close-x" type="button" onClick={closeModal} aria-label="Close">×</button>
            <h3>Have you saved your backup codes?</h3>
            <p className="sec-modal-sub">If you lose access to your authenticator without backup codes, you'll need to email support to recover your account.</p>
            <div className="sec-modal-actions">
              <button
                className="btn btn-ghost btn-sm"
                type="button"
                onClick={() => showModal("totp-setup")}
              >
                Wait — let me save them
              </button>
              <button
                className="btn btn-primary btn-sm"
                type="button"
                onClick={() => { closeModal(); finishTotpSetup(); }}
              >
                I've saved them — close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
