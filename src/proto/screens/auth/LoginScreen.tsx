/**
 * LoginScreen — the tadaify sign-in card. Faithful port of
 * mockups/tadaify-mvp/login.html (`.login-page` / `.login-card`): a three-step
 * flow (provider picker → email entry → 6-digit OTP) inside the shared
 * <AuthChrome>. All auth is mocked — OAuth and code verification raise a
 * prototype alert; the email "Verify code" submit navigates to the dashboard.
 *
 * @implements fr-login
 */
import { useEffect, useRef, useState } from "react";
import { AuthChrome } from "./AuthChrome";
import { makeLoginContent, type LoginProvider } from "./loginFixture";
import "./login-proto.css";

const DASHBOARD_ROUTE = "/__proto/dashboard";

function ProviderIcon({ id }: { id: LoginProvider["id"] }) {
  if (id === "google") {
    return (
      <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.36-8.16 2.36-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
      </svg>
    );
  }
  if (id === "x") {
    return (
      <svg className="icon-x" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  );
}

const mockAlert = (msg: string) => window.alert(msg);
const validEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v || "");

type Step = "provider" | "email" | "otp";

export function LoginScreen() {
  const c = makeLoginContent();
  const [step, setStep] = useState<Step>("provider");
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resend, setResend] = useState(c.otp.resendSeconds);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const otpValue = digits.join("");
  const canSend = validEmail(email);
  const canVerify = otpValue.length === 6;

  // Resend countdown — runs only while on the OTP step.
  useEffect(() => {
    if (step !== "otp") return;
    if (resend <= 0) return;
    const t = setTimeout(() => setResend((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resend]);

  function goEmail() {
    setStep("email");
  }
  function sendCode() {
    if (!canSend) return;
    setDigits(["", "", "", "", "", ""]);
    setResend(c.otp.resendSeconds);
    setStep("otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }
  function backToProvider() {
    setStep("provider");
  }
  function backToEmail() {
    setDigits(["", "", "", "", "", ""]);
    setStep("email");
  }

  function setDigit(idx: number, raw: string) {
    const val = raw.replace(/[^0-9]/g, "");
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = val.charAt(0) || "";
      // Spread a multi-char paste across the following boxes.
      for (let k = 1; k < val.length && idx + k < 6; k++) {
        next[idx + k] = val.charAt(k);
      }
      return next;
    });
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }
  function otpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) {
      otpRefs.current[idx - 1]?.focus();
    }
  }
  function otpPaste(idx: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    setDigits((prev) => {
      const next = [...prev];
      for (let k = 0; k < paste.length && idx + k < 6; k++) {
        next[idx + k] = paste.charAt(k);
      }
      return next;
    });
    const nextIdx = Math.min(idx + paste.length, 5);
    otpRefs.current[nextIdx]?.focus();
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!canVerify) return;
    // Mockup: real flow calls supabase.auth.verifyOtp → session → dashboard.
    window.location.href = DASHBOARD_ROUTE;
  }

  return (
    <AuthChrome
      barLink={
        <>
          Don't have an account?{" "}
          <a href="/__proto/register">
            <strong>Sign up →</strong>
          </a>
        </>
      }
    >
      <div className="proto-login">
        <div className="login-page">
          <div className="login-card">
            <div className="login-header">
              <h1>{c.heading}</h1>
              <p className="subhead">{c.subhead}</p>
            </div>

            {step === "provider" && (
              <div>
                <div className="provider-stack">
                  {c.providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`auth-btn ${p.tier}`}
                      onClick={
                        p.id === "email"
                          ? goEmail
                          : () =>
                              mockAlert(
                                `Mockup: in the real app this authenticates via ${p.id} and signs you in (prototype).`,
                              )
                      }
                    >
                      <span className="icon-wrap">
                        <ProviderIcon id={p.id} />
                      </span>
                      <span className="label-wrap">
                        <span className="label-main">{p.labelMain}</span>
                        <span className="label-hint">{p.labelHint}</span>
                      </span>
                    </button>
                  ))}
                </div>

                <div className="all-paths-note">{c.allPathsNote}</div>

                <button
                  type="button"
                  className="forgot-link"
                  onClick={() =>
                    mockAlert(
                      "Mockup: in the real app a password-reset email is sent. Hidden when the user signs in via OTP only (prototype).",
                    )
                  }
                >
                  {c.forgotLabel}
                </button>
              </div>
            )}

            {step === "email" && (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  sendCode();
                }}
              >
                <div className="email-step-wrap">
                  <label htmlFor="login-email">{c.email.label}</label>
                  <input
                    id="login-email"
                    className="input"
                    type="email"
                    placeholder={c.email.placeholder}
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="btn btn-primary"
                    style={{ width: "100%", marginTop: 14, minHeight: 44 }}
                    disabled={!canSend}
                  >
                    {c.email.sendLabel}
                  </button>
                </div>
                <div className="all-paths-note">{c.email.note}</div>
                <button type="button" className="back-link" onClick={backToProvider}>
                  {c.email.backLabel}
                </button>
              </form>
            )}

            {step === "otp" && (
              <form onSubmit={verifyOtp}>
                <div className="otp-head">
                  <div className="badge">{c.otp.badge}</div>
                  <h2>{c.otp.heading}</h2>
                  <p>
                    {c.otp.sentToLead}
                    <br />
                    <strong className="otp-email">{email || c.email.placeholder}</strong>
                  </p>
                </div>
                <div className="otp-grid" role="group" aria-label="6-digit verification code">
                  {digits.map((d, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpRefs.current[idx] = el;
                      }}
                      className="otp-input"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={1}
                      aria-label={`Digit ${idx + 1}`}
                      value={d}
                      onChange={(e) => setDigit(idx, e.target.value)}
                      onKeyDown={(e) => otpKeyDown(idx, e)}
                      onPaste={(e) => otpPaste(idx, e)}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: 12, minHeight: 44 }}
                  disabled={!canVerify}
                >
                  {c.otp.verifyLabel}
                </button>
                <div className="resend-row">
                  Didn't get the code?{" "}
                  <button
                    type="button"
                    className="resend-btn"
                    disabled={resend > 0}
                    onClick={() => {
                      mockAlert(
                        "Mockup: in the real flow Supabase GoTrue resends a fresh 6-digit code (prototype).",
                      );
                      setResend(c.otp.resendSeconds);
                    }}
                  >
                    {resend > 0 ? `Resend in ${resend}s` : "Resend code"}
                  </button>
                </div>
                <button type="button" className="back-link" onClick={backToEmail}>
                  {c.otp.backLabel}
                </button>
              </form>
            )}

            <div className="trust-strip">
              {c.trustChips.map((chip) => (
                <span key={chip} className="trust-chip">
                  {chip}
                </span>
              ))}
            </div>

            <div className="create-account-row">
              {c.createAccountLead} <a href="/__proto/register">{c.createAccountLink}</a>
            </div>

            <div className="login-foot">
              <a href="/__proto/landing">
                <span className="wordmark wordmark-sm" aria-label="tada!ify">
                  <span className="wm-ta" aria-hidden>ta</span>
                  <span className="wm-da" aria-hidden>da!</span>
                  <span className="wm-ify" aria-hidden>ify</span>
                </span>
              </a>
              <p>{c.footerTagline}</p>
            </div>
          </div>
        </div>
      </div>
    </AuthChrome>
  );
}
