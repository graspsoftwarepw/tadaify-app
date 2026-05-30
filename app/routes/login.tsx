/**
 * /login — 3-provider login screen for returning users
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * Visual contract: mockups/tadaify-mvp/login.html (644 LOC)
 *
 * DEC trail:
 *   DEC-291   B-modified flow; email path → 6-digit OTP
 *   DEC-296   provider order: Google → X → Email
 *   DEC-307   separate /login reuses register's email-OTP API; returning user → dashboard
 *   DEC-308=C Google+Email MVP; X "Coming soon" toast
 *   DEC-346=C Apple SSO DROPPED entirely from MVP (2026-05-04)
 *   DEC-291   auth flow Option B-modified; email path → 6-digit OTP code (NOT magic-link)
 *   DEC-294   3 providers parallel: X / Google / Email-OTP
 *   DEC-292   (mocked = A parallel) — 3 buttons stacked, NOT email-first discovery
 *   DEC-293   (mocked = auto-link ON) — identity linking via email; UI doesn't surface explicitly
 *
 * Flow:
 *   Login screen → (Google/X) → OAuth round-trip → dashboard
 *   Login screen → (Email)    → email-input → 6-digit OTP → dashboard
 */

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import type { Route } from "./+types/login";
import {
  validateEmail,
  EMAIL_ERROR_MESSAGES,
} from "~/lib/auth-validator";
import {
  createInitialState,
  otpReducer,
  isLocked,
  canResend,
  isResendCapReached,
  otpValue,
  isOtpComplete,
  RESEND_COOLDOWN_MS,
} from "~/lib/otp-state";
import { buildRegisterCtaHref, mapLoginOtpResponse } from "~/lib/login-otp-error";
import { MotionLogo } from "~/components/landing/MotionLogo";
import { OTP_GRID_TEMPLATE } from "~/lib/otp-grid-style";
import { OtpResendControl } from "~/components/OtpResendControl";

// ─── Meta ─────────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Log in — tadaify" },
    {
      name: "description",
      content: "Log in to your tadaify account.",
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const handle = searchParams.get("handle") ?? "";

  const [state, dispatch] = useReducer(otpReducer, createInitialState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  // no_account: { email } | null — drives the friendly "no account found" CTA block
  const [noAccountEmail, setNoAccountEmail] = useState<string | null>(null);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);

  // ── Toast ──────────────────────────────────────────────────────────────────

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  }, []);

  // ── Resend countdown ──────────────────────────────────────────────────────

  useEffect(() => {
    if (state.resendCooldownUntil === null) {
      setResendSecondsLeft(0);
      return;
    }
    const tick = () => {
      const left = Math.max(0, Math.ceil((state.resendCooldownUntil! - Date.now()) / 1000));
      setResendSecondsLeft(left);
    };
    tick();
    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [state.resendCooldownUntil]);

  // ── Provider buttons (DEC-308=C) ──────────────────────────────────────────

  const handleProviderClick = (provider: "google" | "x") => {
    const messages: Record<string, string> = {
      google: "Google log-in is coming soon. Use email for now.",
      x: "X log-in is coming soon. Use email for now.",
    };
    showToast(messages[provider]);
  };

  // ── Email flow ────────────────────────────────────────────────────────────

  const handleSendCode = useCallback(async () => {
    // Defensive guard: block send when per-session cap already reached
    // (BR-OTP-RATE-LIMIT-001 / DEC-342 — Codex follow-up review F1).
    if (isResendCapReached(state)) return;

    // Clear stale no-account state before every submission attempt (Codex review F1).
    setNoAccountEmail(null);

    const emailResult = validateEmail(state.email);
    if (!emailResult.valid) {
      dispatch({ type: "SET_ERROR", error: EMAIL_ERROR_MESSAGES[emailResult.reason] });
      return;
    }
    dispatch({ type: "SUBMIT_START" });
    try {
      // For login, we use the dedicated login-otp endpoint that does NOT require a handle
      // and sets create_user: false (DEC-307 returning-user flow).
      const res = await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email }),
      });
      const data = (await res.json()) as { sent?: boolean; error?: string };
      const action = mapLoginOtpResponse(res.ok, data, state.email);
      if (action.kind === "no_account") {
        // Friendly UX: show the no-account block with a sign-up CTA (issue tadaify-app#176).
        setNoAccountEmail(action.email);
        dispatch({ type: "SET_ERROR", error: "" });
        return;
      }
      if (action.kind === "inline") {
        dispatch({ type: "SET_ERROR", error: action.text });
        return;
      }
      dispatch({
        type: "SEND_CODE",
        resendCooldownUntil: Date.now() + RESEND_COOLDOWN_MS,
      });
      setTimeout(() => otpInputRefs.current[0]?.focus(), 400);
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error. Please try again." });
    }
  }, [state.email]);

  // ── OTP digit management ──────────────────────────────────────────────────

  const handleOtpDigitChange = (index: number, value: string) => {
    if (value.length > 1) {
      dispatch({ type: "SET_OTP_FULL", value });
      setTimeout(() => otpInputRefs.current[5]?.focus(), 0);
      return;
    }
    dispatch({ type: "SET_OTP_DIGIT", index, digit: value });
    if (value && index < 5) {
      setTimeout(() => otpInputRefs.current[index + 1]?.focus(), 0);
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !state.otpDigits[index] && index > 0) {
      dispatch({ type: "SET_OTP_DIGIT", index: index - 1, digit: "" });
      setTimeout(() => otpInputRefs.current[index - 1]?.focus(), 0);
    }
  };

  // ── OTP verify ────────────────────────────────────────────────────────────

  const handleVerifyOtp = useCallback(async () => {
    const now = Date.now();
    if (isLocked(state, now)) return;
    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, token: otpValue(state) }),
      });
      const data = (await res.json()) as {
        verified?: boolean;
        handle?: string;
        error?: string;
      };
      if (!res.ok || !data.verified) {
        dispatch({ type: "OTP_FAILURE", now });
        return;
      }
      // DEC-307: returning user → dashboard (canonical route is /app, not /dashboard)
      navigate("/app");
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error. Please try again." });
    }
  }, [state, navigate]);

  // ── Resend ────────────────────────────────────────────────────────────────

  const handleResend = useCallback(async () => {
    const now = Date.now();
    if (!canResend(state, now)) return;
    try {
      await fetch("/api/auth/login-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email }),
      });
      dispatch({ type: "RESEND_CODE", now });
      showToast("New code sent! Check your inbox.");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch {
      showToast("Failed to resend. Please try again.");
    }
  }, [state, showToast]);

  const now = Date.now();
  const locked = isLocked(state, now);
  const otpComplete = isOtpComplete(state);
  const emailValid = validateEmail(state.email).valid;

  // Step detection: login uses sections A/B as provider-step, B-email as email-step, B-otp as otp-step
  const showProviderStep = state.section === "A" || state.section === "B";
  const showEmailStep = state.section === "B-email";
  const showOtpStep = state.section === "B-otp";

  return (
    <>
      {/* Toast */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium"
          style={{
            background: "var(--bg-elevated)",
            border: "1px solid var(--border-strong)",
            color: "var(--fg)",
            maxWidth: "360px",
            textAlign: "center",
          }}
        >
          {toastMessage}
        </div>
      )}

      {/* ============ AUTH TOPBAR ============ */}
      <header className="auth-bar">
        <a className="brand" href="/">
          <MotionLogo size="nav" />
          <span className="wm">
            <span className="ta">ta</span>
            <span className="da">da!</span>
            <span className="ify">ify</span>
          </span>
        </a>
        <span className="spacer" />
        <span className="bar-link">
          {"Don't have an account? "}
          <a href="/register"><strong>Sign up →</strong></a>
        </span>
        <ThemeToggleBtn />
      </header>

      {/* ============ LOGIN PAGE ============ */}
      <div className="login-page">
        <div className="login-card">

          {/* WELCOME-BACK HINT (shown when ?handle= param present) */}
          {handle && (
            <div className="welcome-hint" style={{ display: "flex" }}>
              <div className="wh-avatar">{handle.charAt(0).toUpperCase()}</div>
              <div className="wh-text">
                <div className="wh-title">Hey, @{handle} 👋</div>
                <div className="wh-sub">Good to see you back.</div>
              </div>
            </div>
          )}

          {/* LOGIN HEADER */}
          <div className="login-header fade-up">
            <h1 id="login-heading">
              {handle ? `Welcome back, @${handle}` : "Welcome back"}
            </h1>
            <p className="subhead">Sign in to keep building.</p>
          </div>

          {/* ============ PROVIDER PICKER (default state) ============ */}
          {showProviderStep && (
            <div id="provider-step">
              <div className="provider-stack">
                {/* Google */}
                <button
                  type="button"
                  className="auth-btn tier-1 fade-up delay-1"
                  onClick={() => handleProviderClick("google")}
                >
                  <span className="icon-wrap">
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  </span>
                  <span className="label-wrap">
                    <span className="label-main">Continue with Google</span>
                    <span className="label-hint">fastest for Gmail users</span>
                  </span>
                </button>

                {/* X */}
                <button
                  type="button"
                  className="auth-btn tier-2 fade-up delay-2"
                  onClick={() => handleProviderClick("x")}
                >
                  <span className="icon-wrap">
                    <svg className="icon-x" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  </span>
                  <span className="label-wrap">
                    <span className="label-main">Continue with X</span>
                    <span className="label-hint">creator-friendly</span>
                  </span>
                </button>

                {/* Email */}
                <button
                  type="button"
                  className="auth-btn tier-2 fade-up delay-3"
                  onClick={() => dispatch({ type: "PROCEED_TO_EMAIL" })}
                >
                  <span className="icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2"/>
                      <path d="m3 7 9 6 9-6"/>
                    </svg>
                  </span>
                  <span className="label-wrap">
                    <span className="label-main">Continue with Email</span>
                    <span className="label-hint">{"we'll send a 6-digit code"}</span>
                  </span>
                </button>
              </div>

              <div className="all-paths-note">
                ✉️ All paths sign you in via your email. We never ask for your phone.
              </div>

              {/* DESIGN_QUESTION: Forgot-password link is shown unconditionally here.
                  In production it should only render if the authenticated user record
                  has password_set=true. Mockup shows always for completeness. */}
              <button
                type="button"
                className="forgot-link"
                onClick={() => showToast("Password reset email sent. Hidden if user signs in via OTP only.")}
              >
                Forgot password?
              </button>
            </div>
          )}

          {/* ============ EMAIL STEP — entry ============ */}
          {showEmailStep && (
            <div id="email-step">
              <div className="email-step-wrap">
                <label htmlFor="email-input">Email address</label>
                <input
                  className="input"
                  type="email"
                  id="email-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={state.email}
                  onChange={(e) => {
                    setNoAccountEmail(null);
                    dispatch({ type: "SET_EMAIL", email: e.target.value });
                  }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSendCode(); }}
                />
                <button
                  type="button"
                  className="btn btn-primary"
                  id="send-code-btn"
                  onClick={handleSendCode}
                  disabled={!emailValid || state.isSubmitting}
                  style={{ width: "100%", marginTop: 14, minHeight: 44 }}
                >
                  {state.isSubmitting ? "Sending…" : "Send me a code →"}
                </button>

                {state.error && !noAccountEmail && (
                  <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
                    {state.error}
                  </p>
                )}

                {/* No-account friendly block (issue tadaify-app#176) */}
                {noAccountEmail && (
                  <div
                    role="alert"
                    data-testid="no-account-block"
                    style={{
                      marginTop: 10,
                      padding: "14px 16px",
                      borderRadius: "var(--radius)",
                      background: "var(--bg-muted)",
                      border: "1px solid var(--border-strong)",
                    }}
                  >
                    <p style={{ fontSize: 13, color: "var(--fg)", marginBottom: 10 }}>
                      No account found for <strong>{noAccountEmail}</strong>.
                    </p>
                    <a
                      href={buildRegisterCtaHref(noAccountEmail)}
                      data-testid="create-account-cta"
                      style={{
                        display: "inline-block",
                        padding: "10px 18px",
                        background: "var(--brand-primary)",
                        color: "#FFF",
                        borderRadius: "var(--radius)",
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Create your account →
                    </a>
                  </div>
                )}
              </div>

              <div className="all-paths-note">
                ✉️ Your code expires in 10 minutes. Check spam if it doesn&apos;t arrive.
              </div>
              <button
                type="button"
                className="back-link"
                onClick={() => dispatch({ type: "BACK" })}
              >
                ← back to sign-in options
              </button>
            </div>
          )}

          {/* ============ OTP STEP — 6 digits ============ */}
          {showOtpStep && (
            <div id="otp-step">
              <div style={{ textAlign: "center", padding: "4px 0 0" }}>
                <div style={{ fontSize: 48, marginBottom: 10 }} aria-hidden="true">📬</div>
                <h2 style={{ fontSize: "clamp(20px,3.5vw,26px)", marginBottom: 8 }}>Check your email</h2>
                <p style={{ fontSize: 14, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  We sent a 6-digit code to<br/>
                  <strong id="otp-email-display" style={{ color: "var(--brand-primary)" }}>
                    {state.email}
                  </strong>
                </p>
              </div>

              <div
                className="otp-grid"
                role="group"
                aria-label="6-digit verification code"
                style={{ display: "grid", gridTemplateColumns: OTP_GRID_TEMPLATE }}
              >
                {state.otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpInputRefs.current[i] = el; }}
                    className="otp-input"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={1}
                    value={digit}
                    aria-label={`Digit ${i + 1}`}
                    disabled={locked}
                    onChange={(e) => handleOtpDigitChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onPaste={(e) => {
                      e.preventDefault();
                      handleOtpDigitChange(0, e.clipboardData.getData("text"));
                    }}
                    data-otp-index={i}
                  />
                ))}
              </div>

              {state.error && (
                <p role="alert" style={{ marginTop: 12, fontSize: 13, color: "var(--danger)", textAlign: "center" }}>
                  {state.error}
                </p>
              )}

              <button
                type="button"
                className="btn btn-primary"
                id="verify-otp-btn"
                onClick={handleVerifyOtp}
                disabled={!otpComplete || locked || state.isSubmitting}
                style={{ width: "100%", marginTop: 12, minHeight: 44 }}
              >
                {state.isSubmitting ? "Signing in…" : "Verify code →"}
              </button>

              <OtpResendControl
                state={state}
                now={now}
                resendSecondsLeft={resendSecondsLeft}
                onResend={handleResend}
                onUseDifferentEmail={() => dispatch({ type: "BACK_TO_EMAIL" })}
              />

              <button
                type="button"
                className="back-link"
                onClick={() => dispatch({ type: "BACK" })}
              >
                ← wrong email? go back
              </button>
            </div>
          )}

          {/* TRUST TRIO STRIP */}
          <div className="trust-strip fade-up delay-4">
            <span className="trust-chip">🔒 Price locked for life</span>
            <span className="trust-chip">💸 30-day money-back · No trials</span>
            <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
          </div>

          <div className="create-account-row fade-up delay-4">
            First time here? <a href="/register">Create account →</a>
          </div>

          <div style={{ textAlign: "center", marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--border)" }}>
            <a href="/" style={{ display: "inline-flex", alignItems: "center", gap: 6, textDecoration: "none", opacity: 0.6 }}>
              <MotionLogo size="nav" />
              <span className="wm" style={{ fontSize: 15 }}>
                <span className="ta">ta</span>
                <span className="da">da!</span>
                <span className="ify">ify</span>
              </span>
            </a>
            <p style={{ fontSize: 11, color: "var(--fg-subtle)", marginTop: 4 }}>
              Turn your bio link into your best first impression.
            </p>
          </div>

        </div>{/* /login-card */}
      </div>{/* /login-page */}
    </>
  );
}

// ─── Theme toggle button ──────────────────────────────────────────────────────

function ThemeToggleBtn() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("tadaify-theme");
      if (saved === "dark") {
        document.body.classList.add("dark-mode");
        setDark(true);
      }
    } catch {}
  }, []);

  const toggle = () => {
    const isDark = document.body.classList.toggle("dark-mode");
    setDark(isDark);
    try { localStorage.setItem("tadaify-theme", isDark ? "dark" : "light"); } catch {}
  };

  return (
    <button
      type="button"
      className="theme-toggle-btn"
      id="theme-toggle"
      aria-label="Toggle light / dark theme"
      onClick={toggle}
    >
      <svg
        className={`theme-icon-sun${dark ? " opacity-0" : ""}`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={dark ? { opacity: 0, transform: "rotate(30deg) scale(0.6)" } : undefined}
      >
        <circle cx="12" cy="12" r="4"/>
        <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/>
      </svg>
      <svg
        className="theme-icon-moon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={dark ? { opacity: 1, transform: "rotate(0) scale(1)" } : { opacity: 0, transform: "rotate(-30deg) scale(0.6)" }}
      >
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      </svg>
    </button>
  );
}
