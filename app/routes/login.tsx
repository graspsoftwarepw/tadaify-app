/**
 * /login — 4-provider login screen for returning users
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * Visual contract: mockups/tadaify-mvp/login.html (merged PR #125)
 *
 * DEC trail:
 *   DEC-291   B-modified flow; email path → 6-digit OTP
 *   DEC-296   provider order: Google → Apple → X → Email (001a: only Email functional)
 *   DEC-307   separate /login reuses register's email-OTP API; returning user → dashboard
 *   DEC-308=C Google+Email MVP; Apple/X "Coming soon" toast
 *
 * Flow:
 *   Login screen → (Email) → B-email → B-otp → dashboard
 *   Login screen → (Google/Apple/X) → "Coming soon" toast
 */

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { useNavigate } from "react-router";
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
  otpValue,
  isOtpComplete,
  RESEND_COOLDOWN_MS,
} from "~/lib/otp-state";
import { MotionLogo } from "~/components/landing/MotionLogo";

// ─── Meta ─────────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Sign in — tadaify" },
    {
      name: "description",
      content: "Sign in to your tadaify account.",
    },
  ];
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const [state, dispatch] = useReducer(otpReducer, createInitialState());
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);

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

  const handleProviderClick = (provider: "google" | "apple" | "x") => {
    const messages: Record<string, string> = {
      google: "Google sign-in is coming soon. Use email for now.",
      apple: "Apple sign-in is coming soon. Use email for now.",
      x: "X sign-in is coming soon. Use email for now.",
    };
    showToast(messages[provider]);
  };

  // ── Email flow ────────────────────────────────────────────────────────────

  const handleSendCode = useCallback(async () => {
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
      if (!res.ok || !data.sent) {
        dispatch({ type: "SET_ERROR", error: data.error ?? "Failed to send code." });
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
      // DEC-307: returning user → dashboard
      navigate("/dashboard");
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
  const resendable = canResend(state, now);
  const otpComplete = isOtpComplete(state);
  const emailValid = validateEmail(state.email).valid;
  const showEmailInput = state.section === "A" || state.section === "B" || state.section === "B-email";
  const showOtp = state.section === "B-otp";

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

      {/* Top bar */}
      <nav
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          minHeight: 54,
        }}
      >
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "inherit" }}>
          <MotionLogo size="nav" />
          <span className="font-display font-semibold text-[20px] tracking-tight">
            <span style={{ color: "var(--wm-ta)" }}>ta</span>
            <span style={{ color: "var(--wm-da)" }}>da!</span>
            <span style={{ color: "var(--wm-ify)" }}>ify</span>
          </span>
        </a>
        <span style={{ flex: 1 }} />
        <a
          href="/register"
          style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", textDecoration: "none" }}
        >
          New here?{" "}
          <strong style={{ color: "var(--brand-primary)" }}>Get started free</strong>
        </a>
      </nav>

      {/* Login card */}
      <div
        style={{
          minHeight: "calc(100vh - 54px)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(24px, 5vw, 64px) 20px",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: 460,
            background: "var(--bg-elevated)",
            border: "1px solid var(--border)",
            borderRadius: 20,
            padding: "clamp(28px, 5vw, 44px)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <h1
            className="font-display font-semibold"
            style={{ fontSize: "clamp(24px,3.5vw,32px)", marginBottom: 6, lineHeight: 1.15 }}
          >
            Welcome back
          </h1>
          <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 28 }}>
            Sign in to your tadaify account.
          </p>

          {/* Method selection + email input */}
          {showEmailInput && (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {/* Google */}
                <ProviderBtn
                  label="Continue with Google"
                  hint="fastest for Gmail users"
                  tier={1}
                  onClick={() => handleProviderClick("google")}
                  icon={
                    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden width={22} height={22}>
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                    </svg>
                  }
                />
                {/* Apple */}
                <ProviderBtn
                  label="Continue with Apple"
                  hint="iOS users + privacy"
                  tier={1}
                  onClick={() => handleProviderClick("apple")}
                  icon={
                    <svg viewBox="0 0 24 24" aria-hidden width={22} height={22} fill="currentColor">
                      <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                  }
                />
                {/* X */}
                <ProviderBtn
                  label="Continue with X"
                  hint="creator-friendly"
                  tier={2}
                  onClick={() => handleProviderClick("x")}
                  icon={
                    <svg viewBox="0 0 24 24" aria-hidden width={22} height={22} fill="currentColor">
                      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                    </svg>
                  }
                />
                {/* Email — divider + input */}
                <div style={{ position: "relative", margin: "8px 0" }}>
                  <hr style={{ border: "none", borderTop: "1px solid var(--border)" }} />
                  <span
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: "50%",
                      transform: "translate(-50%, -50%)",
                      background: "var(--bg-elevated)",
                      padding: "0 12px",
                      fontSize: 12,
                      color: "var(--fg-muted)",
                    }}
                  >
                    or
                  </span>
                </div>
              </div>

              <label htmlFor="login-email" style={{ display: "block", fontSize: 14, fontWeight: 500, marginBottom: 8 }}>
                Email address
              </label>
              <input
                id="login-email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                value={state.email}
                onChange={(e) => dispatch({ type: "SET_EMAIL", email: e.target.value })}
                onKeyDown={(e) => { if (e.key === "Enter") handleSendCode(); }}
                style={{
                  width: "100%",
                  minHeight: 44,
                  border: "1.5px solid var(--border-strong)",
                  borderRadius: "var(--radius)",
                  background: "var(--bg)",
                  padding: "12px 14px",
                  fontSize: 15,
                  color: "var(--fg)",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />

              {state.error && (
                <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
                  {state.error}
                </p>
              )}

              <button
                type="button"
                onClick={handleSendCode}
                disabled={!emailValid || state.isSubmitting}
                style={{
                  width: "100%",
                  marginTop: 12,
                  minHeight: 44,
                  background: emailValid && !state.isSubmitting ? "var(--brand-primary)" : "var(--bg-muted)",
                  color: emailValid && !state.isSubmitting ? "#FFF" : "var(--fg-muted)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: emailValid && !state.isSubmitting ? "pointer" : "not-allowed",
                }}
              >
                {state.isSubmitting ? "Sending…" : "Send me a code →"}
              </button>

              {/* DEC-306 implicit ToS */}
              <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 12, lineHeight: 1.5 }}>
                By continuing you accept our{" "}
                <a href="/terms" style={{ color: "var(--brand-primary)" }}>Terms</a>{" "}
                and{" "}
                <a href="/privacy" style={{ color: "var(--brand-primary)" }}>Privacy Policy</a>.
              </p>
            </>
          )}

          {/* OTP step */}
          {showOtp && (
            <>
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 40, marginBottom: 10 }} aria-hidden>📬</div>
                <p style={{ fontSize: 15, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  We sent a code to{" "}
                  <strong style={{ color: "var(--brand-primary)" }}>{state.email}</strong>
                </p>
              </div>

              <div
                role="group"
                aria-label="6-digit verification code"
                style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}
              >
                {state.otpDigits.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpInputRefs.current[i] = el; }}
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
                    style={{
                      textAlign: "center",
                      fontSize: "clamp(20px, 5vw, 28px)",
                      fontWeight: 700,
                      height: 56,
                      border: "2px solid var(--border-strong)",
                      borderRadius: "var(--radius)",
                      background: locked ? "var(--bg-muted)" : "var(--bg-elevated)",
                      color: "var(--fg)",
                      outline: "none",
                    }}
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
                onClick={handleVerifyOtp}
                disabled={!otpComplete || locked || state.isSubmitting}
                style={{
                  width: "100%",
                  marginTop: 14,
                  minHeight: 44,
                  background: otpComplete && !locked && !state.isSubmitting ? "var(--brand-primary)" : "var(--bg-muted)",
                  color: otpComplete && !locked && !state.isSubmitting ? "#FFF" : "var(--fg-muted)",
                  border: "none",
                  borderRadius: "var(--radius)",
                  fontSize: 15,
                  fontWeight: 600,
                  cursor: otpComplete && !locked && !state.isSubmitting ? "pointer" : "not-allowed",
                }}
              >
                {state.isSubmitting ? "Signing in…" : "Verify code →"}
              </button>

              <div style={{ marginTop: 12, fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>
                Didn't get it?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={!resendable}
                  style={{
                    background: "none",
                    border: "none",
                    cursor: resendable ? "pointer" : "not-allowed",
                    fontSize: 13,
                    fontWeight: 600,
                    color: resendable ? "var(--brand-primary)" : "var(--fg-muted)",
                    padding: 0,
                  }}
                >
                  {resendable ? "Resend code" : `Resend in ${resendSecondsLeft}s`}
                </button>
              </div>

              <button
                type="button"
                onClick={() => dispatch({ type: "BACK" })}
                style={{ marginTop: 12, background: "none", border: "none", cursor: "pointer", fontSize: 13, color: "var(--fg-muted)", padding: 0, display: "block" }}
              >
                ← back
              </button>
            </>
          )}

          <div style={{ marginTop: 20, paddingTop: 20, borderTop: "1px solid var(--border)", textAlign: "center" }}>
            <p style={{ fontSize: 13, color: "var(--fg-muted)" }}>
              Don't have an account?{" "}
              <a href="/register" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
                Get started free →
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Provider button (login page variant) ────────────────────────────────────

function ProviderBtn({
  label,
  hint,
  tier,
  onClick,
  icon,
}: {
  label: string;
  hint: string;
  tier: 1 | 2;
  onClick: () => void;
  icon: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        padding: "12px 16px",
        background: tier === 1 ? "var(--bg-elevated)" : "transparent",
        border: `${tier === 1 ? "1.5px" : "1px"} solid var(--border-strong)`,
        borderRadius: "var(--radius)",
        cursor: "pointer",
        width: "100%",
        textAlign: "left",
      }}
    >
      <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)" }}>{label}</span>
        <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>{hint}</span>
      </span>
    </button>
  );
}
