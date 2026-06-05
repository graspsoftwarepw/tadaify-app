/**
 * @module AUTH
 * @covers BR-AUTH-001
 * @covers BR-AUTH-002
 * @covers BR-AUTH-003
 * @covers BR-AUTH-006
 * @covers BR-AUTH-007
 * /register — 5-section email-OTP registration flow
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * Visual contract: mockups/tadaify-mvp/register.html (1191 LOC)
 *
 * Section state machine (DEC-291 B-modified):
 *   A (handle)       → B (3 providers)
 *   B                → B-email (Email path)   | Coming-soon toast (OAuth)
 *   B-email          → B-otp
 *   B-otp            → B-password-toggle
 *   B-password-toggle → C (success)
 *   C                → /onboarding/welcome?handle=<value>  (2s auto-advance)
 *
 * DEC trail applied in this file:
 *   DEC-291   B-modified flow
 *   DEC-293   auto-link ON (Supabase default; no explicit UI)
 *   DEC-294   force-email Auth Hook — handled server-side (before-user-created)
 *   DEC-295   inline post-OTP password toggle (default OTP; opt-in password)
 *   DEC-296   provider order: Google → X → Email (001a: only Email functional)
 *   DEC-305   3-strike lockout (frontend + Supabase rate-limit)
 *   DEC-306   implicit ToS microcopy + tos_version capture
 *   DEC-308=C Google+Email MVP; X "Coming soon" toast
 *   DEC-346=C Apple SSO DROPPED entirely from MVP (2026-05-04)
 *   DEC-290   "Try without an account →" link REMOVED. try.html killed.
 */

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { validateHandle, generateAlternatives } from "~/lib/handle-validator";
import {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  EMAIL_ERROR_MESSAGES,
  PASSWORD_ERROR_MESSAGES,
  PASSWORD_MATCH_ERROR_MESSAGES,
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
  SUCCESS_REDIRECT_DELAY_MS,
  type OtpState,
} from "~/lib/otp-state";
import { OtpResendControl } from "~/components/OtpResendControl";
import { normalizePrefillEmail } from "~/lib/register-prefill";
import { MotionLogo } from "~/components/landing/MotionLogo";
import { ThemeToggleButton } from "~/components/ThemeToggleButton";
import { OTP_GRID_TEMPLATE } from "~/lib/otp-grid-style";
import { WelcomeHeader } from "~/components/WelcomeHeader";

// ─── Meta ─────────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [
    { title: "Claim your handle — tadaify" },
    {
      name: "description",
      content: "Secure your free link-in-bio handle on tadaify. Takes 60 seconds.",
    },
  ];
}

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  // ?email= pre-fill — populated by the /login "no account found" CTA (issue tadaify-app#176).
  // Validated defensively before use in the component.
  const rawEmail = url.searchParams.get("email") ?? "";
  return { prefillHandle: handle, prefillEmail: rawEmail };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterPage({ loaderData }: Route.ComponentProps) {
  const { prefillHandle, prefillEmail } = loaderData;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // ── State machine ──────────────────────────────────────────────────────────

  const [state, dispatch] = useReducer(
    otpReducer,
    createInitialState(prefillHandle)
  );

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [resendSecondsLeft, setResendSecondsLeft] = useState(0);
  const [successCountdown, setSuccessCountdown] = useState(
    SUCCESS_REDIRECT_DELAY_MS / 1000
  );
  const [handleAvailable, setHandleAvailable] = useState<boolean | null>(null);
  const [handleError, setHandleError] = useState<string | null>(null);
  const [handleAlternatives, setHandleAlternatives] = useState<string[]>([]);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const handleCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Prefill handle from URL param ──────────────────────────────────────────

  useEffect(() => {
    if (prefillHandle) {
      dispatch({ type: "SET_HANDLE", handle: prefillHandle });
      setHandleAvailable(true); // already validated on landing
    }
  }, [prefillHandle]);

  // ── Prefill email from ?email= query param (login→register CTA, issue tadaify-app#176) ──

  useEffect(() => {
    const normalized = normalizePrefillEmail(prefillEmail);
    if (normalized) {
      dispatch({ type: "SET_EMAIL", email: normalized });
    }
    // If invalid, silently ignore — do not crash or show an error.
  }, [prefillEmail]);

  // ── Toast helper ──────────────────────────────────────────────────────────

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

  // ── Success countdown → redirect ──────────────────────────────────────────

  useEffect(() => {
    if (state.section !== "C") return;
    setSuccessCountdown(SUCCESS_REDIRECT_DELAY_MS / 1000);
    const countId = setInterval(() => {
      setSuccessCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(countId);
          navigate(`/onboarding/welcome?handle=${encodeURIComponent(state.handle)}`);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countId);
  }, [state.section, state.handle, navigate]);

  // ── Handle live availability check ────────────────────────────────────────

  const checkHandleAvailability = useCallback((handle: string) => {
    if (handleCheckTimeout.current) clearTimeout(handleCheckTimeout.current);
    const validation = validateHandle(handle);
    if (!validation.valid) {
      setHandleAvailable(false);
      return;
    }
    handleCheckTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch("/api/handle/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle }),
        });
        const data = (await res.json()) as { available: boolean };
        setHandleAvailable(data.available);
        if (data.available) {
          setHandleError(null);
          setHandleAlternatives([]);
        } else {
          // DEC-363=A: show alternatives as clickable chips (not static "Taken" message)
          // DEC-357=D: locale param dropped — universal alternatives ranking
          const alts = generateAlternatives(handle);
          setHandleAlternatives(alts);
          setHandleError("Already taken. Try:");
        }
      } catch {
        // Network error — allow proceed, server validates on submit
      }
    }, 300);
  }, []);

  const handleHandleChange = (value: string) => {
    const lower = value.toLowerCase().trim();
    dispatch({ type: "SET_HANDLE", handle: lower });
    setHandleAvailable(null);
    setHandleError(null);
    setHandleAlternatives([]);
    checkHandleAvailability(lower);
  };

  // ── Section A → B ─────────────────────────────────────────────────────────

  const handleProceedToMethod = useCallback(async () => {
    const validation = validateHandle(state.handle);
    if (!validation.valid || handleAvailable === false) {
      setHandleError("Please choose a valid, available handle.");
      return;
    }
    // Reserve the handle if not already reserved from landing
    if (!searchParams.get("handle")) {
      try {
        const res = await fetch("/api/handle/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: state.handle }),
        });
        if (!res.ok && res.status !== 409) {
          const data = (await res.json()) as { error?: string };
          dispatch({ type: "SET_ERROR", error: data.error ?? "Could not reserve handle." });
          return;
        }
      } catch {
        // Fire-and-forget; server validates on final submit too
      }
    }
    dispatch({ type: "PROCEED_TO_METHOD" });
  }, [state.handle, handleAvailable, searchParams]);

  // ── Provider buttons (DEC-296, DEC-308=C) ─────────────────────────────────

  const handleProviderClick = (provider: "google" | "x") => {
    // DEC-308=C: Google gated to 001b; X post-MVP. Apple dropped entirely (DEC-346=C).
    const messages: Record<string, string> = {
      google: "Google log-in is coming soon. Use email for now.",
      x: "X log-in is coming soon. Use email for now.",
    };
    showToast(messages[provider]);
  };

  const handleEmailFlow = () => {
    dispatch({ type: "PROCEED_TO_EMAIL" });
  };

  // ── Section B-email → B-otp ───────────────────────────────────────────────

  const handleSendCode = useCallback(async () => {
    // Defensive guard: block send when per-session cap already reached
    // (BR-OTP-RATE-LIMIT-001 / DEC-342 — Codex follow-up review F1).
    if (isResendCapReached(state)) return;

    const emailResult = validateEmail(state.email);
    if (!emailResult.valid) {
      dispatch({ type: "SET_ERROR", error: EMAIL_ERROR_MESSAGES[emailResult.reason] });
      return;
    }
    dispatch({ type: "SUBMIT_START" });
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: state.email,
          handle: state.handle,
          tos_version: "v1",
        }),
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
      // Focus first OTP input after transition
      setTimeout(() => otpInputRefs.current[0]?.focus(), 400);
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error. Please try again." });
    }
  }, [state.email, state.handle]);

  // ── OTP digit management ──────────────────────────────────────────────────

  const handleOtpDigitChange = (index: number, value: string) => {
    // Handle paste
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
        body: JSON.stringify({
          email: state.email,
          token: otpValue(state),
        }),
      });
      const data = (await res.json()) as {
        verified?: boolean;
        handle?: string;
        error?: string;
        access_token?: string;
      };
      if (!res.ok || !data.verified) {
        dispatch({ type: "OTP_FAILURE", now });
        return;
      }
      if (data.access_token) setAccessToken(data.access_token);
      dispatch({ type: "OTP_SUCCESS" });
    } catch {
      dispatch({ type: "SET_ERROR", error: "Network error. Please try again." });
    }
  }, [state]);

  // ── Resend OTP ────────────────────────────────────────────────────────────

  const handleResend = useCallback(async () => {
    const now = Date.now();
    if (!canResend(state, now)) return;
    try {
      await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: state.email, handle: state.handle, tos_version: "v1" }),
      });
      dispatch({ type: "RESEND_CODE", now });
      showToast("New code sent! Check your inbox.");
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch {
      showToast("Failed to resend. Please try again.");
    }
  }, [state, showToast]);

  // ── Password toggle continue ──────────────────────────────────────────────

  const handlePasswordToggleContinue = useCallback(async () => {
    if (state.passwordMode === "password") {
      const pwResult = validatePassword(state.password);
      if (!pwResult.valid) {
        dispatch({ type: "SET_ERROR", error: PASSWORD_ERROR_MESSAGES[pwResult.reason] });
        return;
      }
      const matchResult = validatePasswordMatch(state.password, state.passwordConfirm);
      if (!matchResult.valid) {
        dispatch({ type: "SET_ERROR", error: PASSWORD_MATCH_ERROR_MESSAGES[matchResult.reason] });
        return;
      }
      if (accessToken) {
        dispatch({ type: "SUBMIT_START" });
        try {
          const res = await fetch("/api/auth/password", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${accessToken}`,
            },
            body: JSON.stringify({ password: state.password }),
          });
          if (!res.ok) {
            const data = (await res.json()) as { error?: string };
            dispatch({ type: "SET_ERROR", error: data.error ?? "Password update failed." });
            return;
          }
        } catch {
          dispatch({ type: "SET_ERROR", error: "Network error saving password." });
          return;
        }
      }
    }
    dispatch({ type: "SUCCESS" });
  }, [state, accessToken]);

  // ── Keyboard handlers ─────────────────────────────────────────────────────

  const handleHandleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleProceedToMethod();
  };

  const handleEmailKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSendCode();
  };

  // Alias used for alternative-handle chip clicks (DEC-363=A)
  const onAlternativeClick = handleHandleChange;

  // ─────────────────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────────────────

  const now = Date.now();
  const locked = isLocked(state, now);
  const resendable = canResend(state, now);
  const otpComplete = isOtpComplete(state);
  const handleValid = validateHandle(state.handle).valid && handleAvailable !== false;
  const emailValid = validateEmail(state.email).valid;

  return (
    <>
      {/* Toast notification */}
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
          <a href="/login"><strong>Log in →</strong></a>
        </span>
        <ThemeToggleButton />
      </header>

      {/* Persistent welcome header — DEC-352=A + DEC-358=B (varying copy per section).
          Mounted ABOVE the grid, stays visible across A→B→B-email→B-otp→B-password-toggle→C.
          Reactive on state.handle (no debounce — availability check is debounced separately). */}
      <WelcomeHeader handle={state.handle} section={state.section} />

      {/* ============ REGISTER GRID ============ */}
      <div className="register-grid">

        {/* LEFT: FORM */}
        <div className="form-col">
          <div className="form-inner">

            {/* ── SECTION A — Handle ──────────────────────────────────────── */}
            <section
              id="section-a"
              className={`reg-section${state.section === "A" ? " revealed" : ""}`}
              aria-label="Choose your handle"
            >
              {state.section === "A" && (
                <>
                  <h1 style={{ fontSize: "clamp(28px,4vw,38px)", lineHeight: 1.1, marginBottom: 12 }}>
                    Hey{" "}
                    <span style={{ color: "var(--brand-primary)" }}>
                      @{state.handle || "yourname"}
                    </span>{" "}
                    👋<br />
                    <span style={{ color: "var(--fg-muted)", fontSize: "clamp(20px,3vw,28px)" }}>
                      welcome to
                    </span>{" "}
                    <span className="wm" style={{ fontSize: "clamp(28px,4vw,36px)" }}>
                      <span className="ta">ta</span>
                      <span className="da">da!</span>
                      <span className="ify">ify</span>
                    </span>
                  </h1>
                  <p style={{ fontSize: 15, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.6 }}>
                    Grab your handle first — it&apos;s yours forever, free.
                  </p>

                  <label htmlFor="handle-input">Your public URL</label>
                  <div className="input-group">
                    <span className="prefix">tadaify.com/</span>
                    <input
                      id="handle-input"
                      className="input"
                      type="text"
                      autoComplete="off"
                      placeholder="yourname"
                      value={state.handle}
                      autoFocus
                      style={{ border: 0, background: "transparent", padding: "14px 10px 14px 0", fontSize: 16, fontWeight: 500, minWidth: 0 }}
                      onChange={(e) => handleHandleChange(e.target.value)}
                      onKeyDown={handleHandleKeyDown}
                      aria-describedby="handle-availability"
                      aria-invalid={handleAvailable === false}
                    />
                  </div>

                  {/* Availability feedback */}
                  <div
                    id="handle-availability"
                    role="status"
                    aria-live="polite"
                    className={`availability${
                      handleAvailable === true && state.handle
                        ? " ok"
                        : handleAvailable === false
                        ? " taken"
                        : " idle"
                    }`}
                  >
                    {handleAvailable === true && state.handle && (
                      <>✓ tadaify.com/{state.handle} is yours.</>
                    )}
                    {handleAvailable === false && handleAlternatives.length > 0 && (
                      <>✦ Already taken. Try:</>
                    )}
                    {handleAvailable === false && handleAlternatives.length === 0 && (
                      <>{handleError ?? "Handle unavailable."}</>
                    )}
                    {handleAvailable === null && !state.handle && (
                      <>Type a handle…</>
                    )}
                    {handleAvailable === null && state.handle && (
                      <>Checking…</>
                    )}
                  </div>

                  {/* Alternative handle chips (DEC-363=A) */}
                  {handleAvailable === false && handleAlternatives.length > 0 && (
                    <div className="alternatives">
                      {handleAlternatives.map((alt) => (
                        <button
                          key={alt}
                          type="button"
                          onClick={() => onAlternativeClick(alt)}
                        >
                          {alt}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Error message */}
                  {state.error && (
                    <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
                      {state.error}
                    </p>
                  )}

                  <button
                    className="btn btn-primary"
                    id="next-btn"
                    type="button"
                    onClick={handleProceedToMethod}
                    disabled={!handleValid}
                    style={{ width: "100%", marginTop: 20, minHeight: 44 }}
                  >
                    Continue →
                  </button>

                  <div className="tier-hint">
                    Start on Free — 5 AI credits, 1 page, all core features. Upgrade anytime, never auto-enrolled.
                  </div>

                  {/* DEC-290: "Try without an account →" link REMOVED. try.html killed. */}

                  <div className="trust-strip">
                    <span className="trust-chip">🔒 Price locked for life</span>
                    <span className="trust-chip">💸 30-day money-back · No trials</span>
                    <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
                  </div>
                </>
              )}
            </section>

            {/* ── SECTION B — Sign-in method ──────────────────────────────── */}
            <section
              id="section-b"
              className={`reg-section${
                state.section === "B" ||
                state.section === "B-email" ||
                state.section === "B-otp" ||
                state.section === "B-password-toggle" ||
                state.section === "C"
                  ? " revealed"
                  : ""
              }`}
              aria-label="Choose log-in method"
              style={{
                display:
                  state.section === "B" ||
                  state.section === "B-email" ||
                  state.section === "B-otp" ||
                  state.section === "B-password-toggle" ||
                  state.section === "C"
                    ? undefined
                    : "none",
              }}
            >
              <p className="section-header-mini">How would you like to sign in?</p>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>
                Your handle{" "}
                <strong style={{ color: "var(--brand-primary)" }}>
                  @{state.handle || "yourname"}
                </strong>{" "}
                is saved. Pick a method and it&apos;s yours.
              </p>

              <div
                className="provider-stack"
                style={{ display: state.section === "B" ? undefined : "none" }}
              >
                {/* 1. Google — tier 1 (most-used) */}
                <button
                  className="auth-btn tier-1"
                  type="button"
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

                {/* 2. X (Twitter) — tier 2 */}
                <button
                  className="auth-btn tier-2"
                  type="button"
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

                {/* 3. Email — tier 2 */}
                <button
                  className="auth-btn tier-2"
                  type="button"
                  onClick={handleEmailFlow}
                >
                  <span className="icon-wrap">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect x="3" y="5" width="18" height="14" rx="2"/>
                      <path d="m3 7 9 6 9-6"/>
                    </svg>
                  </span>
                  <span className="label-wrap">
                    <span className="label-main">Continue with Email</span>
                    <span className="label-hint">we&apos;ll send a 6-digit code</span>
                  </span>
                </button>
              </div>

              {state.section === "B" && (
                <>
                  <div className="all-paths-note">
                    ✉️ All paths confirm your email. Sign in securely.
                  </div>

                  <div className="tos-row">
                    <input type="checkbox" id="tos" defaultChecked />
                    <label htmlFor="tos" style={{ margin: 0, fontWeight: 400, fontSize: 13, color: "var(--fg-muted)" }}>
                      I agree to the{" "}
                      <a href="/terms" className="tos-link">Terms of Service</a>{" "}
                      and{" "}
                      <a href="/privacy" className="tos-link">Privacy Policy</a>.
                    </label>
                  </div>

                  <div className="no-phone-notice">
                    🔒 We never ask for your phone number. Ever.
                  </div>

                  <button
                    className="back-link"
                    type="button"
                    onClick={() => dispatch({ type: "BACK" })}
                  >
                    ← back to handle
                  </button>

                  <div className="trust-strip">
                    <span className="trust-chip">🔒 Price locked for life</span>
                    <span className="trust-chip">💸 30-day money-back · No trials</span>
                    <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
                  </div>
                </>
              )}
            </section>

            {/* ── SECTION B-EMAIL — Email entry + Send code ───────────────── */}
            <section
              id="section-b-email"
              className={`reg-section${
                state.section === "B-email" ||
                state.section === "B-otp" ||
                state.section === "B-password-toggle" ||
                state.section === "C"
                  ? " revealed"
                  : ""
              }`}
              aria-label="Enter email"
              style={{
                display:
                  state.section === "B-email"
                    ? undefined
                    : "none",
              }}
            >
              <p className="section-header-mini">What&apos;s your email?</p>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 18 }}>
                We&apos;ll email you a 6-digit code. No password required.
              </p>

              <div className="email-step-wrap">
                <label htmlFor="email-input">Email address</label>
                <input
                  className="input"
                  type="email"
                  id="email-input"
                  placeholder="you@example.com"
                  autoComplete="email"
                  value={state.email}
                  onChange={(e) => dispatch({ type: "SET_EMAIL", email: e.target.value })}
                  onKeyDown={handleEmailKeyDown}
                  style={{ width: "100%", minHeight: 44 }}
                  aria-invalid={state.email.length > 0 && !emailValid}
                />

                {state.error && (
                  <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
                    {state.error}
                  </p>
                )}

                <button
                  className="btn btn-primary"
                  id="send-code-btn"
                  type="button"
                  onClick={handleSendCode}
                  disabled={!emailValid || state.isSubmitting}
                  style={{ width: "100%", marginTop: 14, minHeight: 44 }}
                >
                  {state.isSubmitting ? "Sending…" : "Send me a code →"}
                </button>
              </div>

              <div className="all-paths-note">
                ✉️ Your code expires in 10 minutes. Check spam if it doesn&apos;t arrive.
              </div>

              <button
                className="back-link"
                type="button"
                onClick={() => dispatch({ type: "BACK" })}
              >
                ← back to sign-in options
              </button>

              <div className="trust-strip">
                <span className="trust-chip">🔒 Price locked for life</span>
                <span className="trust-chip">💸 30-day money-back · No trials</span>
                <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
              </div>
            </section>

            {/* ── SECTION B-OTP — Enter 6-digit code ─────────────────────── */}
            <section
              id="section-b-otp"
              className={`reg-section${
                state.section === "B-otp" ||
                state.section === "B-password-toggle" ||
                state.section === "C"
                  ? " revealed"
                  : ""
              }`}
              aria-label="Enter verification code"
              style={{
                display:
                  state.section === "B-otp"
                    ? undefined
                    : "none",
              }}
            >
              <div style={{ textAlign: "center", padding: "16px 0 0" }}>
                <div style={{ fontSize: 52, marginBottom: 14 }} aria-hidden>📬</div>
                <h2 style={{ fontSize: "clamp(22px,3.5vw,30px)", marginBottom: 10 }}>
                  Check your email
                </h2>
                <p style={{ fontSize: 15, color: "var(--fg-muted)", lineHeight: 1.6 }}>
                  We sent a 6-digit code to<br />
                  <strong style={{ color: "var(--brand-primary)" }}>{state.email}</strong>
                </p>
              </div>

              {/* 6 separate inputs, auto-advance, paste-friendly */}
              <div
                className="otp-grid"
                role="group"
                aria-label="6-digit verification code"
                style={{ display: "flex" }}
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
                className="btn btn-primary"
                id="verify-otp-btn"
                type="button"
                onClick={handleVerifyOtp}
                disabled={!otpComplete || locked || state.isSubmitting}
                style={{ width: "100%", marginTop: 14, minHeight: 44 }}
              >
                {state.isSubmitting ? "Verifying…" : "Verify code →"}
              </button>

              <OtpResendControl
                state={state}
                now={now}
                resendSecondsLeft={resendSecondsLeft}
                onResend={handleResend}
                onUseDifferentEmail={() => dispatch({ type: "BACK_TO_EMAIL" })}
              />

              <button
                className="back-link"
                type="button"
                onClick={() => dispatch({ type: "BACK" })}
              >
                ← wrong email? go back
              </button>

              <div className="trust-strip">
                <span className="trust-chip">🔒 Price locked for life</span>
                <span className="trust-chip">💸 30-day money-back · No trials</span>
                <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
              </div>
            </section>

            {/* ── SECTION B-PASSWORD-TOGGLE — Inline post-OTP choice (DEC-295=A) ── */}
            {/* Only shown on email-OTP path, after successful verifyOtp.
                OAuth users (Google/X) skip this entirely. */}
            <section
              id="section-b-pwtoggle"
              className={`reg-section${
                state.section === "B-password-toggle" || state.section === "C"
                  ? " revealed"
                  : ""
              }`}
              aria-label="Login preference"
              style={{
                display:
                  state.section === "B-password-toggle"
                    ? undefined
                    : "none",
              }}
            >
              <p className="section-header-mini">How do you want to log in next time?</p>
              <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>
                You&apos;re all set,{" "}
                <strong style={{ color: "var(--brand-primary)" }}>
                  @{state.handle || "yourname"}
                </strong>. One quick choice before we set up your page.
              </p>

              <PwToggleSection
                state={state}
                onModeChange={(mode) => dispatch({ type: "SET_PASSWORD_MODE", mode })}
                onPasswordChange={(v) => dispatch({ type: "SET_PASSWORD", value: v })}
                onPasswordConfirmChange={(v) => dispatch({ type: "SET_PASSWORD_CONFIRM", value: v })}
                onContinue={handlePasswordToggleContinue}
              />
            </section>

            {/* ── SECTION C — Success transition ──────────────────────────── */}
            <section
              id="section-c"
              className={`reg-section${state.section === "C" ? " revealed" : ""}`}
              aria-label="Registration complete"
              style={{ display: state.section === "C" ? undefined : "none" }}
            >
              <div className="success-burst">
                <div className="big-tada">tada! 🎉</div>
                <h2 style={{ fontSize: "clamp(22px,3.5vw,30px)" }}>
                  Welcome,{" "}
                  <span style={{ color: "var(--brand-primary)" }}>
                    @{state.handle || "yourname"}
                  </span>
                </h2>
                <p style={{ fontSize: 15, color: "var(--fg-muted)", marginTop: 12 }}>
                  Next: let&apos;s set up your page in 60 seconds.
                </p>
                <button
                  className="btn btn-primary btn-lg"
                  type="button"
                  onClick={() =>
                    navigate(
                      `/onboarding/welcome?handle=${encodeURIComponent(state.handle)}`
                    )
                  }
                  style={{ marginTop: 24, minHeight: 52 }}
                >
                  Let&apos;s go →
                </button>
                <p className="tip-microcopy">
                  Auto-advancing in <span style={{ fontWeight: 600 }}>{successCountdown}</span>s…
                </p>
              </div>
            </section>

          </div>{/* /form-inner */}
        </div>{/* /form-col */}

        {/* RIGHT: LIVE PREVIEW (desktop only) */}
        <div className="preview-col-hide-mobile preview-col" aria-hidden="true">
          <span className="logo-corner" aria-hidden="true" style={{ display: "flex" }}>
            <MotionLogo size="nav" />
          </span>
          <div className="preview-wrapper">
            <p style={{ opacity: 0.7, fontSize: 12, letterSpacing: "2px", textTransform: "uppercase", marginBottom: 16 }}>
              Live preview
            </p>
            <div className="preview-card">
              {/* TADA-BUG-001: real URL string, NOT brand lockup. */}
              <div className="preview-wordmark" aria-label="Live URL preview">
                <span className="url-letters">tadaify</span>
                <span className="url-punct">.</span>
                <span className="url-tld">com</span>
                <span className="url-punct">/</span>
                <span className="handle">{state.handle || "yourname"}</span>
              </div>
            </div>

            <div className="preview-url">
              Your public URL will be:{" "}
              <span style={{ color: "#FDE68A" }}>
                https://tadaify.com/{state.handle || "yourname"}
              </span>
            </div>

            <div className="preview-thumb">
              <div className="dot-row">
                <div className="dot" /><div className="dot" /><div className="dot" />
              </div>
              <div className="line short" />
              <div className="line" />
              <div className="line pill-row" />
              <div className="line pill-row" />
              <div className="line short" />
            </div>

            <p style={{ marginTop: 28, opacity: 0.85, fontSize: 13, lineHeight: 1.6 }}>
              This is how your brand shows up on every page, share card, and email receipt.
            </p>
          </div>
        </div>

      </div>{/* /register-grid */}

      {/* Responsive + preview-col overlay CSS (inline — register page is outside app-dashboard-root) */}
      <style>{`
        @media (max-width: 960px) {
          .preview-col-hide-mobile { display: none !important; }
          .register-grid { grid-template-columns: 1fr !important; }
        }
        /* Radial overlay — matches mockups/tadaify-mvp/register.html .preview-col::before */
        .preview-col::before {
          content: "";
          position: absolute;
          inset: 0;
          background:
            radial-gradient(600px 300px at 20% 20%, rgba(245,158,11,0.28), transparent),
            radial-gradient(500px 400px at 80% 80%, rgba(255,255,255,0.1), transparent);
          pointer-events: none;
          z-index: 0;
        }
        /* Reduced-motion: no animation on logo-corner (ECN-142-05) */
        @media (prefers-reduced-motion: reduce) {
          .logo-corner * {
            animation-play-state: paused !important;
            animation-duration: 0.001ms !important;
          }
        }
      `}</style>

      {/* MOBILE STICKY CTA (visible < 600px, section A only) */}
      {state.section === "A" && (
        <div className="sticky-cta-mobile" id="mobile-cta-a">
          <button
            className="btn btn-primary"
            type="button"
            style={{ minHeight: 44 }}
            disabled={!handleValid}
            onClick={handleProceedToMethod}
          >
            Continue →
          </button>
        </div>
      )}
    </>
  );
}

// ─── PwToggleSection ──────────────────────────────────────────────────────────
// Extracted to avoid hook-in-conditional violation; rendered inside the section
// only when section === "B-password-toggle".

function PwToggleSection({
  state,
  onModeChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onContinue,
}: {
  state: OtpState;
  onModeChange: (m: "otp" | "password") => void;
  onPasswordChange: (v: string) => void;
  onPasswordConfirmChange: (v: string) => void;
  onContinue: () => void;
}) {
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const pwResult = state.password ? validatePassword(state.password) : null;
  const matchResult =
    state.password && state.passwordConfirm
      ? validatePasswordMatch(state.password, state.passwordConfirm)
      : null;

  const continueDisabled =
    state.isSubmitting ||
    (state.passwordMode === "password" &&
      (pwResult?.valid === false ||
        matchResult?.valid === false ||
        !state.password ||
        !state.passwordConfirm));

  return (
    <>
      <div className="pw-toggle-cards">
        {/* Card 1 — pre-selected default (recommended) */}
        <div
          className={`pw-card${state.passwordMode === "otp" ? " selected" : ""}`}
          id="pw-card-1"
          role="radio"
          aria-checked={state.passwordMode === "otp"}
          tabIndex={0}
          onClick={() => onModeChange("otp")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onModeChange("otp"); }}
        >
          <span className="radio-dot" aria-hidden="true" />
          <div className="pw-card-body">
            <div className="pw-card-title">
              Send me a login code
              <span className="recommended-badge">✓ Recommended</span>
            </div>
            <div className="pw-card-sub">We&apos;ll email you a 6-digit code each time. No password to remember.</div>
          </div>
        </div>

        {/* Card 2 — opt-in: set password (reveals password input) */}
        <div
          className={`pw-card${state.passwordMode === "password" ? " selected" : ""}`}
          id="pw-card-2"
          role="radio"
          aria-checked={state.passwordMode === "password"}
          tabIndex={0}
          onClick={() => onModeChange("password")}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onModeChange("password"); }}
        >
          <span className="radio-dot" aria-hidden="true" />
          <div className="pw-card-body">
            <div className="pw-card-title">Set a password for faster sign-in</div>
            <div className="pw-card-sub">Faster daily sign-in. You can always use a code instead.</div>

            {/* Revealed only on Card 2 when selected */}
            <div
              className="pw-card-extra"
              onClick={(e) => e.stopPropagation()}
            >
              <label
                htmlFor="set-pw-input"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", margin: "14px 0 6px" }}
              >
                Choose a password
              </label>
              <div className="pw-input-wrap-card">
                <input
                  className="input"
                  type={showPw ? "text" : "password"}
                  id="set-pw-input"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={state.password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                />
                <button
                  className="pw-show-btn"
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  aria-label="Show/hide password"
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {pwResult && !pwResult.valid && (
                <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                  {PASSWORD_ERROR_MESSAGES[pwResult.reason]}
                </p>
              )}
              <div className="pw-min-hint">
                At least 8 characters. Mix of letters and numbers recommended.
              </div>

              <label
                htmlFor="set-pw-confirm"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", margin: "14px 0 6px" }}
              >
                Confirm password
              </label>
              <div className="pw-input-wrap-card">
                <input
                  className="input"
                  type={showConfirm ? "text" : "password"}
                  id="set-pw-confirm"
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={state.passwordConfirm}
                  onChange={(e) => onPasswordConfirmChange(e.target.value)}
                />
                <button
                  className="pw-show-btn"
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  aria-label="Show/hide confirm password"
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {matchResult && !matchResult.valid && (
                <div className="pw-min-hint" id="pw-match-hint" style={{ color: "var(--danger)" }}>
                  {PASSWORD_MATCH_ERROR_MESSAGES[matchResult.reason]}
                </div>
              )}
              {matchResult?.valid && (
                <div className="pw-min-hint" style={{ color: "var(--success)" }}>
                  ✓ Passwords match
                </div>
              )}
              {!matchResult && (
                <div className="pw-min-hint" id="pw-match-hint">
                  Re-enter to confirm — protects you from a typo lock-out.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {state.error && (
        <p role="alert" style={{ marginTop: 12, fontSize: 13, color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      {/* DEC-295=A: NO "Skip" link — don't pollute with a third option. */}
      <button
        className="btn btn-primary"
        id="pwtoggle-continue-btn"
        type="button"
        onClick={onContinue}
        disabled={continueDisabled}
        style={{ width: "100%", marginTop: 18, minHeight: 46 }}
      >
        {state.isSubmitting ? "Saving…" : "Continue →"}
      </button>

      <div className="trust-strip">
        <span className="trust-chip">🔒 Price locked for life</span>
        <span className="trust-chip">💸 30-day money-back · No trials</span>
        <span className="trust-chip">🛡 GDPR-compliant · export &amp; delete anytime</span>
      </div>
    </>
  );
}
