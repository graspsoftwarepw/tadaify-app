/**
 * /register — 5-section email-OTP registration flow
 *
 * Story: F-REGISTER-001a — email-OTP + Auth Hook + handle binding
 * Visual contract: mockups/tadaify-mvp/register.html (merged PR #125)
 *
 * Section state machine (DEC-291 B-modified):
 *   A (handle)       → B (4 providers)
 *   B                → B-email (Email path)   | Coming-soon toast (OAuth)
 *   B-email          → B-otp
 *   B-otp            → B-password-toggle
 *   B-password-toggle → C (success)
 *   C                → /onboarding-welcome?handle=<value>  (2s auto-advance)
 *
 * DEC trail applied in this file:
 *   DEC-291   B-modified flow
 *   DEC-293   auto-link ON (Supabase default; no explicit UI)
 *   DEC-294   force-email Auth Hook — handled server-side (before-user-created)
 *   DEC-295   inline post-OTP password toggle (default OTP; opt-in password)
 *   DEC-296   provider order: Google → Apple → X → Email (001a: only Email functional)
 *   DEC-305   3-strike lockout (frontend + Supabase rate-limit)
 *   DEC-306   implicit ToS microcopy + tos_version capture
 *   DEC-308=C Google+Email MVP; Apple/X "Coming soon" toast
 */

import { useReducer, useEffect, useRef, useCallback, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import type { Route } from "./+types/register";
import { validateHandle } from "~/lib/handle-validator";
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
  otpValue,
  isOtpComplete,
  RESEND_COOLDOWN_MS,
  SUCCESS_REDIRECT_DELAY_MS,
  type OtpState,
} from "~/lib/otp-state";
import { MotionLogo } from "~/components/landing/MotionLogo";

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
  return { prefillHandle: handle };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function RegisterPage({ loaderData }: Route.ComponentProps) {
  const { prefillHandle } = loaderData;
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

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([null, null, null, null, null, null]);
  const handleCheckTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Prefill handle from URL param ──────────────────────────────────────────

  useEffect(() => {
    if (prefillHandle) {
      dispatch({ type: "SET_HANDLE", handle: prefillHandle });
      setHandleAvailable(true); // already validated on landing
    }
  }, [prefillHandle]);

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
          navigate(`/onboarding-welcome?handle=${encodeURIComponent(state.handle)}`);
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
        setHandleError(data.available ? null : "This handle is already taken.");
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

  const handleProviderClick = (provider: "google" | "apple" | "x") => {
    // DEC-308=C: Google gated to 001b; Apple/X post-MVP
    const messages: Record<string, string> = {
      google: "Google sign-in is coming soon. Use email for now.",
      apple: "Apple sign-in is coming soon. Use email for now.",
      x: "X sign-in is coming soon. Use email for now.",
    };
    showToast(messages[provider]);
  };

  const handleEmailFlow = () => {
    dispatch({ type: "PROCEED_TO_EMAIL" });
  };

  // ── Section B-email → B-otp ───────────────────────────────────────────────

  const handleSendCode = useCallback(async () => {
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
          <span
            className="font-display font-semibold text-[20px] tracking-tight"
          >
            <span style={{ color: "var(--wm-ta)" }}>ta</span>
            <span style={{ color: "var(--wm-da)" }}>da!</span>
            <span style={{ color: "var(--wm-ify)" }}>ify</span>
          </span>
        </a>
        <span style={{ flex: 1 }} />
        <a
          href="/login"
          style={{ fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", textDecoration: "none" }}
        >
          Already have an account?{" "}
          <strong style={{ color: "var(--brand-primary)" }}>Sign in</strong>
        </a>
      </nav>

      {/* Main register grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          minHeight: "calc(100vh - 54px)",
        }}
        className="register-grid-responsive"
      >
        {/* Form column */}
        <div
          style={{
            padding: "clamp(24px, 4vw, 64px)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            overflowY: "auto",
          }}
        >
          <div style={{ maxWidth: 460, width: "100%", padding: "clamp(16px, 3vw, 32px) 0" }}>

            {/* ── SECTION A — Handle ─────────────────────────────────────── */}
            <SectionA
              state={state}
              handleAvailable={handleAvailable}
              handleError={handleError}
              onHandleChange={handleHandleChange}
              onHandleKeyDown={handleHandleKeyDown}
              onContinue={handleProceedToMethod}
              handleValid={handleValid}
            />

            {/* ── SECTION B — Method selection ───────────────────────────── */}
            {(state.section === "B" ||
              state.section === "B-email" ||
              state.section === "B-otp" ||
              state.section === "B-password-toggle" ||
              state.section === "C") && (
              <SectionB
                state={state}
                onProviderClick={handleProviderClick}
                onEmailFlow={handleEmailFlow}
                onBack={() => dispatch({ type: "BACK" })}
              />
            )}

            {/* ── SECTION B-EMAIL — Email input ──────────────────────────── */}
            {(state.section === "B-email" ||
              state.section === "B-otp" ||
              state.section === "B-password-toggle" ||
              state.section === "C") && (
              <SectionBEmail
                state={state}
                emailValid={emailValid}
                onEmailChange={(v) => dispatch({ type: "SET_EMAIL", email: v })}
                onEmailKeyDown={handleEmailKeyDown}
                onSendCode={handleSendCode}
                onBack={() => dispatch({ type: "BACK" })}
                visible={state.section === "B-email"}
              />
            )}

            {/* ── SECTION B-OTP — 6-digit code ───────────────────────────── */}
            {(state.section === "B-otp" ||
              state.section === "B-password-toggle" ||
              state.section === "C") && (
              <SectionBOtp
                state={state}
                otpInputRefs={otpInputRefs}
                otpComplete={otpComplete}
                locked={locked}
                resendable={resendable}
                resendSecondsLeft={resendSecondsLeft}
                onDigitChange={handleOtpDigitChange}
                onKeyDown={handleOtpKeyDown}
                onVerify={handleVerifyOtp}
                onResend={handleResend}
                onBack={() => dispatch({ type: "BACK" })}
                visible={state.section === "B-otp"}
              />
            )}

            {/* ── SECTION B-PASSWORD-TOGGLE ──────────────────────────────── */}
            {(state.section === "B-password-toggle" || state.section === "C") && (
              <SectionBPasswordToggle
                state={state}
                onModeChange={(mode) => dispatch({ type: "SET_PASSWORD_MODE", mode })}
                onPasswordChange={(v) => dispatch({ type: "SET_PASSWORD", value: v })}
                onPasswordConfirmChange={(v) => dispatch({ type: "SET_PASSWORD_CONFIRM", value: v })}
                onContinue={handlePasswordToggleContinue}
                visible={state.section === "B-password-toggle"}
              />
            )}

            {/* ── SECTION C — Success ────────────────────────────────────── */}
            {state.section === "C" && (
              <SectionC
                state={state}
                countdown={successCountdown}
                onGoNow={() =>
                  navigate(
                    `/onboarding-welcome?handle=${encodeURIComponent(state.handle)}`
                  )
                }
              />
            )}
          </div>
        </div>

        {/* Preview column (desktop only) */}
        <aside
          className="preview-col-hide-mobile"
          style={{
            background: "var(--hero-gradient)",
            color: "#FFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "clamp(32px, 5vw, 72px)",
            position: "relative",
            overflow: "hidden",
            minHeight: 400,
          }}
        >
          <div
            style={{ position: "relative", textAlign: "center", maxWidth: 420, zIndex: 1 }}
          >
            <p
              style={{
                opacity: 0.7,
                fontSize: 12,
                letterSpacing: "2px",
                textTransform: "uppercase",
                marginBottom: 16,
              }}
            >
              Live preview
            </p>
            <div
              style={{
                background: "rgba(255,255,255,0.12)",
                backdropFilter: "blur(14px)",
                border: "1px solid rgba(255,255,255,0.22)",
                padding: "36px 28px",
                borderRadius: 24,
                boxShadow: "0 20px 60px rgba(0,0,0,0.22)",
              }}
            >
              <div
                className="font-display font-semibold tracking-tight"
                style={{ fontSize: "clamp(26px, 3.5vw, 40px)", lineHeight: 1.05, wordBreak: "break-all" }}
                aria-label="Live URL preview"
              >
                <span style={{ color: "#FFF" }}>tadaify</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>.</span>
                <span style={{ color: "#FFF", opacity: 0.78 }}>com</span>
                <span style={{ color: "rgba(255,255,255,0.55)" }}>/</span>
                <span style={{ color: "#FDE68A" }}>
                  {state.handle || "yourname"}
                </span>
              </div>
            </div>

            <div
              style={{
                marginTop: 24,
                background: "rgba(0,0,0,0.3)",
                borderRadius: 10,
                padding: "10px 16px",
                fontFamily: "var(--font-mono, monospace)",
                fontSize: 13,
                color: "rgba(255,255,255,0.9)",
                overflowX: "auto",
                whiteSpace: "nowrap",
              }}
            >
              Your public URL:{" "}
              <span style={{ color: "#FDE68A" }}>
                https://tadaify.com/{state.handle || "yourname"}
              </span>
            </div>

            <p
              style={{
                marginTop: 28,
                opacity: 0.85,
                fontSize: 13,
                lineHeight: 1.6,
              }}
            >
              This is how your brand shows up on every page, share card, and email receipt.
            </p>
          </div>
        </aside>
      </div>

      {/* Responsive CSS (minimal — uses tokens from app.css / mockup tokens.css) */}
      <style>{`
        @media (max-width: 960px) {
          .preview-col-hide-mobile { display: none !important; }
          .register-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}

// ─── Section A ────────────────────────────────────────────────────────────────

function SectionA({
  state,
  handleAvailable,
  handleError,
  onHandleChange,
  onHandleKeyDown,
  onContinue,
  handleValid,
}: {
  state: OtpState;
  handleAvailable: boolean | null;
  handleError: string | null;
  onHandleChange: (v: string) => void;
  onHandleKeyDown: (e: React.KeyboardEvent) => void;
  onContinue: () => void;
  handleValid: boolean;
}) {
  return (
    <section aria-label="Choose your handle" style={{ marginBottom: state.section !== "A" ? 0 : undefined }}>
      <h1
        className="font-display"
        style={{ fontSize: "clamp(28px,4vw,38px)", lineHeight: 1.1, marginBottom: 12 }}
      >
        {state.handle ? (
          <>
            Hey{" "}
            <span style={{ color: "var(--brand-primary)" }}>@{state.handle}</span>{" "}
            <span aria-hidden>👋</span>
            <br />
            <span style={{ color: "var(--fg-muted)", fontSize: "clamp(20px,3vw,28px)" }}>
              welcome to{" "}
            </span>
            <span className="font-display font-semibold" style={{ fontSize: "clamp(28px,4vw,36px)" }}>
              <span style={{ color: "var(--wm-ta)" }}>ta</span>
              <span style={{ color: "var(--wm-da)" }}>da!</span>
              <span style={{ color: "var(--wm-ify)" }}>ify</span>
            </span>
          </>
        ) : (
          <>
            Claim your handle
            <br />
            <span
              className="font-display font-semibold"
              style={{ fontSize: "clamp(28px,4vw,36px)" }}
            >
              <span style={{ color: "var(--wm-ta)" }}>ta</span>
              <span style={{ color: "var(--wm-da)" }}>da!</span>
              <span style={{ color: "var(--wm-ify)" }}>ify</span>
            </span>
          </>
        )}
      </h1>

      {state.section === "A" && (
        <>
          <p style={{ fontSize: 15, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.6 }}>
            Grab your handle first — it's yours forever, free.
          </p>

          <label htmlFor="handle-input" style={{ display: "block", marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
            Your public URL
          </label>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              border: "1.5px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              background: "var(--bg-elevated)",
              overflow: "hidden",
              transition: "border-color .15s",
            }}
          >
            <span
              style={{
                padding: "12px 10px 12px 14px",
                fontSize: 15,
                fontWeight: 500,
                color: "var(--fg-muted)",
                userSelect: "none",
                whiteSpace: "nowrap",
              }}
            >
              tadaify.com/
            </span>
            <input
              id="handle-input"
              type="text"
              autoComplete="off"
              placeholder="yourname"
              value={state.handle}
              autoFocus
              style={{
                flex: 1,
                border: 0,
                background: "transparent",
                padding: "12px 14px 12px 0",
                fontSize: 16,
                fontWeight: 500,
                minWidth: 0,
                outline: "none",
                color: "var(--fg)",
              }}
              onChange={(e) => onHandleChange(e.target.value)}
              onKeyDown={onHandleKeyDown}
              aria-describedby="handle-availability"
              aria-invalid={handleAvailable === false}
            />
          </div>

          {/* Availability feedback */}
          <div
            id="handle-availability"
            role="status"
            aria-live="polite"
            style={{
              marginTop: 10,
              fontSize: 14,
              minHeight: 22,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontWeight: 500,
              color:
                handleAvailable === true
                  ? "var(--success)"
                  : handleAvailable === false
                  ? "var(--danger)"
                  : "var(--fg-subtle)",
            }}
          >
            {handleAvailable === true && state.handle && "✓ Available!"}
            {handleAvailable === false && (handleError ?? "Handle unavailable.")}
            {handleAvailable === null && state.handle && "Checking…"}
          </div>

          {/* Error message */}
          {state.error && (
            <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
              {state.error}
            </p>
          )}

          <button
            type="button"
            onClick={onContinue}
            disabled={!handleValid}
            style={{
              width: "100%",
              marginTop: 20,
              minHeight: 44,
              background: handleValid ? "var(--brand-primary)" : "var(--bg-muted)",
              color: handleValid ? "#FFF" : "var(--fg-muted)",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 15,
              fontWeight: 600,
              cursor: handleValid ? "pointer" : "not-allowed",
              transition: "background .15s",
            }}
          >
            Continue →
          </button>

          <p style={{ marginTop: 16, fontSize: 13, color: "var(--fg-muted)", lineHeight: 1.5 }}>
            Start on Free — 5 AI credits, 1 page, all core features. Upgrade anytime, never auto-enrolled.
          </p>

          <TrustStrip />
        </>
      )}
    </section>
  );
}

// ─── Section B ────────────────────────────────────────────────────────────────

function SectionB({
  state,
  onProviderClick,
  onEmailFlow,
  onBack,
}: {
  state: OtpState;
  onProviderClick: (p: "google" | "apple" | "x") => void;
  onEmailFlow: () => void;
  onBack: () => void;
}) {
  if (state.section === "A") return null;

  return (
    <section
      aria-label="Choose sign-in method"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--border)",
        display: state.section === "B" ? undefined : "none",
      }}
    >
      <p className="font-display font-semibold" style={{ fontSize: 22, color: "var(--fg)", marginBottom: 8 }}>
        How would you like to sign in?
      </p>
      <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>
        Your handle{" "}
        <strong style={{ color: "var(--brand-primary)" }}>@{state.handle}</strong> is saved.
        Pick a method and it's yours.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 4 }}>
        {/* Google */}
        <ProviderButton
          label="Continue with Google"
          hint="fastest for Gmail users"
          tier={1}
          onClick={() => onProviderClick("google")}
          icon={
            <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width={22} height={22}>
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
          }
        />
        {/* Apple */}
        <ProviderButton
          label="Continue with Apple"
          hint="iOS users + privacy"
          tier={1}
          onClick={() => onProviderClick("apple")}
          icon={
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width={22} height={22} fill="currentColor">
              <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
          }
        />
        {/* X */}
        <ProviderButton
          label="Continue with X"
          hint="creator-friendly"
          tier={2}
          onClick={() => onProviderClick("x")}
          icon={
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" width={22} height={22} fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
            </svg>
          }
        />
        {/* Email — functional */}
        <ProviderButton
          label="Continue with Email"
          hint="we'll send a 6-digit code"
          tier={2}
          onClick={onEmailFlow}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" width={22} height={22}>
              <rect x="3" y="5" width="18" height="14" rx="2"/>
              <path d="m3 7 9 6 9-6"/>
            </svg>
          }
        />
      </div>

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 16 }}>
        ✉️ All paths confirm your email. We never ask for your phone.
      </p>

      {/* DEC-306 implicit ToS microcopy */}
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 12 }}>
        By continuing, you agree to the{" "}
        <a href="/terms" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" style={{ color: "var(--brand-primary)", textDecoration: "underline" }}>
          Privacy Policy
        </a>.
      </p>

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 10 }}>
        🔒 We never ask for your phone number. Ever.
      </p>

      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 16,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--fg-muted)",
          padding: 0,
        }}
      >
        ← back to handle
      </button>

      <TrustStrip />
    </section>
  );
}

// ─── Section B-email ─────────────────────────────────────────────────────────

function SectionBEmail({
  state,
  emailValid,
  onEmailChange,
  onEmailKeyDown,
  onSendCode,
  onBack,
  visible,
}: {
  state: OtpState;
  emailValid: boolean;
  onEmailChange: (v: string) => void;
  onEmailKeyDown: (e: React.KeyboardEvent) => void;
  onSendCode: () => void;
  onBack: () => void;
  visible: boolean;
}) {
  return (
    <section
      aria-label="Enter email"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--border)",
        display: visible ? undefined : "none",
      }}
    >
      <p className="font-display font-semibold" style={{ fontSize: 22, color: "var(--fg)", marginBottom: 8 }}>
        What's your email?
      </p>
      <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 18 }}>
        We'll email you a 6-digit code. No password required.
      </p>

      <label htmlFor="email-input" style={{ display: "block", marginBottom: 8, fontWeight: 500, fontSize: 14 }}>
        Email address
      </label>
      <input
        id="email-input"
        type="email"
        placeholder="you@example.com"
        autoComplete="email"
        value={state.email}
        onChange={(e) => onEmailChange(e.target.value)}
        onKeyDown={onEmailKeyDown}
        style={{
          width: "100%",
          minHeight: 44,
          border: "1.5px solid var(--border-strong)",
          borderRadius: "var(--radius)",
          background: "var(--bg-elevated)",
          padding: "12px 14px",
          fontSize: 15,
          color: "var(--fg)",
          outline: "none",
          boxSizing: "border-box",
        }}
        aria-invalid={state.email.length > 0 && !emailValid}
      />

      {state.error && (
        <p role="alert" style={{ marginTop: 8, fontSize: 13, color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      <button
        type="button"
        onClick={onSendCode}
        disabled={!emailValid || state.isSubmitting}
        style={{
          width: "100%",
          marginTop: 14,
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

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 12 }}>
        ✉️ Your code expires in 10 minutes. Check spam if it doesn't arrive.
      </p>

      <button
        type="button"
        onClick={onBack}
        style={{
          marginTop: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--fg-muted)",
          padding: 0,
        }}
      >
        ← back to sign-in options
      </button>

      <TrustStrip />
    </section>
  );
}

// ─── Section B-OTP ───────────────────────────────────────────────────────────

function SectionBOtp({
  state,
  otpInputRefs,
  otpComplete,
  locked,
  resendable,
  resendSecondsLeft,
  onDigitChange,
  onKeyDown,
  onVerify,
  onResend,
  onBack,
  visible,
}: {
  state: OtpState;
  otpInputRefs: React.MutableRefObject<(HTMLInputElement | null)[]>;
  otpComplete: boolean;
  locked: boolean;
  resendable: boolean;
  resendSecondsLeft: number;
  onDigitChange: (i: number, v: string) => void;
  onKeyDown: (i: number, e: React.KeyboardEvent<HTMLInputElement>) => void;
  onVerify: () => void;
  onResend: () => void;
  onBack: () => void;
  visible: boolean;
}) {
  return (
    <section
      aria-label="Enter verification code"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--border)",
        display: visible ? undefined : "none",
      }}
    >
      <div style={{ textAlign: "center", padding: "16px 0 0" }}>
        <div style={{ fontSize: 52, marginBottom: 14 }} aria-hidden>📬</div>
        <h2
          className="font-display"
          style={{ fontSize: "clamp(22px,3.5vw,30px)", marginBottom: 10 }}
        >
          Check your email
        </h2>
        <p style={{ fontSize: 15, color: "var(--fg-muted)", lineHeight: 1.6 }}>
          We sent a 6-digit code to
          <br />
          <strong style={{ color: "var(--brand-primary)" }}>{state.email}</strong>
        </p>
      </div>

      {/* 6-digit OTP grid */}
      <div
        role="group"
        aria-label="6-digit verification code"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(6, 1fr)",
          gap: 8,
          margin: "24px 0 0",
        }}
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
            onChange={(e) => onDigitChange(i, e.target.value)}
            onKeyDown={(e) => onKeyDown(i, e)}
            onPaste={(e) => {
              e.preventDefault();
              onDigitChange(0, e.clipboardData.getData("text"));
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
              transition: "border-color .12s",
              cursor: locked ? "not-allowed" : undefined,
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
        onClick={onVerify}
        disabled={!otpComplete || locked || state.isSubmitting}
        style={{
          width: "100%",
          marginTop: 14,
          minHeight: 44,
          background:
            otpComplete && !locked && !state.isSubmitting ? "var(--brand-primary)" : "var(--bg-muted)",
          color:
            otpComplete && !locked && !state.isSubmitting ? "#FFF" : "var(--fg-muted)",
          border: "none",
          borderRadius: "var(--radius)",
          fontSize: 15,
          fontWeight: 600,
          cursor: otpComplete && !locked && !state.isSubmitting ? "pointer" : "not-allowed",
        }}
      >
        {state.isSubmitting ? "Verifying…" : "Verify code →"}
      </button>

      <div style={{ marginTop: 14, fontSize: 13, color: "var(--fg-muted)", textAlign: "center" }}>
        Didn't get the code?{" "}
        <button
          type="button"
          onClick={onResend}
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
        onClick={onBack}
        style={{
          marginTop: 12,
          background: "none",
          border: "none",
          cursor: "pointer",
          fontSize: 13,
          color: "var(--fg-muted)",
          padding: 0,
          display: "block",
        }}
      >
        ← wrong email? go back
      </button>

      <TrustStrip />
    </section>
  );
}

// ─── Section B-password-toggle ────────────────────────────────────────────────

function SectionBPasswordToggle({
  state,
  onModeChange,
  onPasswordChange,
  onPasswordConfirmChange,
  onContinue,
  visible,
}: {
  state: OtpState;
  onModeChange: (m: "otp" | "password") => void;
  onPasswordChange: (v: string) => void;
  onPasswordConfirmChange: (v: string) => void;
  onContinue: () => void;
  visible: boolean;
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
      (pwResult?.valid === false || matchResult?.valid === false || !state.password || !state.passwordConfirm));

  return (
    <section
      aria-label="Login preference"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--border)",
        display: visible ? undefined : "none",
      }}
    >
      <p className="font-display font-semibold" style={{ fontSize: 22, color: "var(--fg)", marginBottom: 8 }}>
        How do you want to log in next time?
      </p>
      <p style={{ fontSize: 14, color: "var(--fg-muted)", marginBottom: 20 }}>
        You're all set,{" "}
        <strong style={{ color: "var(--brand-primary)" }}>@{state.handle}</strong>. One quick
        choice before we set up your page.
      </p>

      {/* Card 1 — default: OTP */}
      <RadioCard
        selected={state.passwordMode === "otp"}
        onSelect={() => onModeChange("otp")}
        title={
          <>
            Send me a login code{" "}
            <span
              style={{
                marginLeft: 6,
                fontSize: 11,
                fontWeight: 600,
                padding: "2px 8px",
                borderRadius: "var(--radius-full)",
                background: "var(--brand-primary)",
                color: "#FFF",
              }}
            >
              ✓ Recommended
            </span>
          </>
        }
        subtitle="We'll email you a 6-digit code each time. No password to remember."
      />

      {/* Card 2 — opt-in: password */}
      <RadioCard
        selected={state.passwordMode === "password"}
        onSelect={() => onModeChange("password")}
        title="Set a password for faster sign-in"
        subtitle="Faster daily sign-in. You can always use a code instead."
        extra={
          state.passwordMode === "password" ? (
            <div onClick={(e) => e.stopPropagation()} style={{ marginTop: 14 }}>
              <label
                htmlFor="set-pw-input"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", marginBottom: 6 }}
              >
                Choose a password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="set-pw-input"
                  type={showPw ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={state.password}
                  onChange={(e) => onPasswordChange(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: "var(--radius)",
                    background: "var(--bg)",
                    padding: "12px 48px 12px 14px",
                    fontSize: 15,
                    color: "var(--fg)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--fg-muted)",
                  }}
                >
                  {showPw ? "Hide" : "Show"}
                </button>
              </div>
              {pwResult && !pwResult.valid && (
                <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                  {PASSWORD_ERROR_MESSAGES[pwResult.reason]}
                </p>
              )}
              <p style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4 }}>
                At least 8 characters. Mix of letters and numbers recommended.
              </p>

              <label
                htmlFor="set-pw-confirm"
                style={{ display: "block", fontSize: 13, fontWeight: 500, color: "var(--fg-muted)", margin: "14px 0 6px" }}
              >
                Confirm password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  id="set-pw-confirm"
                  type={showConfirm ? "text" : "password"}
                  placeholder="••••••••"
                  autoComplete="new-password"
                  value={state.passwordConfirm}
                  onChange={(e) => onPasswordConfirmChange(e.target.value)}
                  style={{
                    width: "100%",
                    minHeight: 44,
                    border: "1.5px solid var(--border-strong)",
                    borderRadius: "var(--radius)",
                    background: "var(--bg)",
                    padding: "12px 48px 12px 14px",
                    fontSize: 15,
                    color: "var(--fg)",
                    outline: "none",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  style={{
                    position: "absolute",
                    right: 12,
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    fontSize: 12,
                    color: "var(--fg-muted)",
                  }}
                >
                  {showConfirm ? "Hide" : "Show"}
                </button>
              </div>
              {matchResult && !matchResult.valid && (
                <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 4 }}>
                  {PASSWORD_MATCH_ERROR_MESSAGES[matchResult.reason]}
                </p>
              )}
              {matchResult?.valid && (
                <p style={{ fontSize: 12, color: "var(--success)", marginTop: 4 }}>✓ Passwords match</p>
              )}
            </div>
          ) : null
        }
      />

      {state.error && (
        <p role="alert" style={{ marginTop: 12, fontSize: 13, color: "var(--danger)" }}>
          {state.error}
        </p>
      )}

      <button
        type="button"
        onClick={onContinue}
        disabled={continueDisabled}
        style={{
          width: "100%",
          marginTop: 18,
          minHeight: 46,
          background: !continueDisabled ? "var(--brand-primary)" : "var(--bg-muted)",
          color: !continueDisabled ? "#FFF" : "var(--fg-muted)",
          border: "none",
          borderRadius: "var(--radius)",
          fontSize: 15,
          fontWeight: 600,
          cursor: !continueDisabled ? "pointer" : "not-allowed",
        }}
      >
        {state.isSubmitting ? "Saving…" : "Continue →"}
      </button>

      <TrustStrip />
    </section>
  );
}

// ─── Section C ───────────────────────────────────────────────────────────────

function SectionC({
  state,
  countdown,
  onGoNow,
}: {
  state: OtpState;
  countdown: number;
  onGoNow: () => void;
}) {
  return (
    <section
      aria-label="Registration complete"
      style={{
        marginTop: 32,
        paddingTop: 24,
        borderTop: "1px solid var(--border)",
        textAlign: "center",
      }}
    >
      <div>
        <div
          className="font-display font-semibold"
          style={{
            fontSize: "clamp(32px,5vw,52px)",
            color: "var(--brand-warm)",
            marginBottom: 8,
          }}
        >
          tada! 🎉
        </div>
        <h2
          className="font-display"
          style={{ fontSize: "clamp(22px,3.5vw,30px)" }}
        >
          Welcome,{" "}
          <span style={{ color: "var(--brand-primary)" }}>@{state.handle}</span>
        </h2>
        <p style={{ fontSize: 15, color: "var(--fg-muted)", marginTop: 12 }}>
          Next: let's set up your page in 60 seconds.
        </p>
        <button
          type="button"
          onClick={onGoNow}
          style={{
            marginTop: 24,
            minHeight: 52,
            padding: "0 32px",
            background: "var(--brand-primary)",
            color: "#FFF",
            border: "none",
            borderRadius: "var(--radius)",
            fontSize: 17,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Let's go →
        </button>
        <p style={{ marginTop: 12, fontSize: 13, color: "var(--fg-muted)" }}>
          Auto-advancing in{" "}
          <span style={{ fontWeight: 600 }}>{countdown}</span>s…
        </p>
      </div>
    </section>
  );
}

// ─── Shared sub-components ────────────────────────────────────────────────────

function ProviderButton({
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
        transition: "border-color .12s, background .12s",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--brand-primary)";
        (e.currentTarget as HTMLButtonElement).style.background = "var(--bg-muted)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.borderColor = "var(--border-strong)";
        (e.currentTarget as HTMLButtonElement).style.background =
          tier === 1 ? "var(--bg-elevated)" : "transparent";
      }}
    >
      <span style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
        {icon}
      </span>
      <span style={{ display: "flex", flexDirection: "column", gap: 2, flex: 1, minWidth: 0 }}>
        <span style={{ fontSize: 14, fontWeight: 600, lineHeight: 1.2, color: "var(--fg)" }}>
          {label}
        </span>
        <span style={{ fontSize: 12, fontWeight: 400, lineHeight: 1.3, color: "var(--fg-subtle)" }}>
          {hint}
        </span>
      </span>
    </button>
  );
}

function RadioCard({
  selected,
  onSelect,
  title,
  subtitle,
  extra,
}: {
  selected: boolean;
  onSelect: () => void;
  title: React.ReactNode;
  subtitle: string;
  extra?: React.ReactNode;
}) {
  return (
    <div
      role="radio"
      aria-checked={selected}
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      style={{
        marginBottom: 10,
        padding: "16px",
        border: `2px solid ${selected ? "var(--brand-primary)" : "var(--border-strong)"}`,
        borderRadius: "var(--radius)",
        background: selected ? "rgba(99,102,241,0.05)" : "var(--bg-elevated)",
        cursor: "pointer",
        transition: "border-color .12s, background .12s",
        display: "flex",
        gap: 12,
        alignItems: "flex-start",
      }}
    >
      <span
        style={{
          width: 18,
          height: 18,
          borderRadius: "50%",
          border: `2px solid ${selected ? "var(--brand-primary)" : "var(--border-strong)"}`,
          background: selected ? "var(--brand-primary)" : "transparent",
          flexShrink: 0,
          marginTop: 2,
          transition: "all .12s",
        }}
        aria-hidden
      />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--fg)", lineHeight: 1.3 }}>
          {title}
        </div>
        <div style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 4, lineHeight: 1.4 }}>
          {subtitle}
        </div>
        {extra}
      </div>
    </div>
  );
}

function TrustStrip() {
  return (
    <div
      style={{
        display: "flex",
        gap: 8,
        flexWrap: "wrap",
        marginTop: 20,
        marginBottom: 8,
      }}
    >
      {[
        "🔒 Price locked for life",
        "💸 30-day money-back · No trials",
        "🛡 GDPR-compliant · export & delete anytime",
      ].map((text) => (
        <span
          key={text}
          style={{
            padding: "4px 10px",
            borderRadius: "var(--radius-full)",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            fontSize: 11,
            color: "var(--fg-muted)",
            fontWeight: 500,
          }}
        >
          {text}
        </span>
      ))}
    </div>
  );
}
