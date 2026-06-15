/**
 * RegisterScreen — the tadaify claim-your-handle flow. Faithful port of
 * mockups/tadaify-mvp/register.html: a split grid (form + live URL preview) with
 * a stacked progressive section machine (A handle → B method → B-email → B-otp →
 * B-pwtoggle → C success) inside the shared <AuthChrome>. All auth is mocked —
 * OAuth/email both resolve to the success burst, which advances to the
 * onboarding-welcome route. Revealing a step never collapses earlier steps,
 * matching the mockup's stacked UX.
 *
 * @implements fr-register
 */
import { useEffect, useRef, useState } from "react";
import { AuthChrome } from "./AuthChrome";
import {
  evaluateHandle,
  makeRegisterContent,
  type RegisterProvider,
} from "./registerFixture";
import { readHandleParam, withHandle } from "../onboarding/handleParam";
import "./register-proto.css";

const ONBOARDING_ROUTE = "/__proto/onboarding-welcome";

function ProviderIcon({ id }: { id: RegisterProvider["id"] }) {
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

/** Ordered section ids, matching register.html's state machine. */
type SectionId = "a" | "b" | "b-email" | "b-otp" | "b-pwtoggle" | "c";
const SEQ: SectionId[] = ["a", "b", "b-email", "b-otp", "b-pwtoggle", "c"];

export function RegisterScreen() {
  const c = makeRegisterContent();
  const rules = c.handle;

  const [handle, setHandle] = useState(() => readHandleParam(rules.defaultValue));
  const [revealed, setRevealed] = useState<Set<SectionId>>(new Set(["a"]));
  const [tos, setTos] = useState(true);
  const [email, setEmail] = useState("");
  const [digits, setDigits] = useState<string[]>(["", "", "", "", "", ""]);
  const [resend, setResend] = useState(c.otp.resendSeconds);
  const [pwSelected, setPwSelected] = useState<1 | 2>(1);
  const [pw, setPw] = useState("");
  const [pwConfirm, setPwConfirm] = useState("");
  const [pwVisible, setPwVisible] = useState(false);
  const [pwConfirmVisible, setPwConfirmVisible] = useState(false);
  const [pwMatchError, setPwMatchError] = useState(false);
  const [countdown, setCountdown] = useState(2);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);

  const cleanHandle = (handle || "").toLowerCase().replace(/[^a-z0-9-]/g, "");
  const displayHandle = cleanHandle || "yourname";
  const previewHandle = cleanHandle || "…";
  const state = evaluateHandle(handle, rules);
  const canContinue = state.kind === "ok";
  const otpValue = digits.join("");
  const canSend = validEmail(email);
  const canVerify = otpValue.length === 6;
  const onOtp = revealed.has("b-otp");
  const onSuccess = revealed.has("c");

  function reveal(id: SectionId) {
    setRevealed((prev) => new Set(prev).add(id));
  }
  /** Collapse target + everything after it (the "back" links). */
  function collapseFrom(id: SectionId) {
    const idx = SEQ.indexOf(id);
    setRevealed((prev) => {
      const next = new Set(prev);
      for (let i = idx; i < SEQ.length; i++) next.delete(SEQ[i]);
      return next;
    });
  }

  // Resend countdown on the OTP step.
  useEffect(() => {
    if (!onOtp || resend <= 0) return;
    const t = setTimeout(() => setResend((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [onOtp, resend]);

  // Success-burst auto-advance.
  useEffect(() => {
    if (!onSuccess) return;
    if (countdown <= 0) {
      goToOnboarding();
      return;
    }
    const t = setTimeout(() => setCountdown((n) => n - 1), 1000);
    return () => clearTimeout(t);
  }, [onSuccess, countdown]);

  function goToOnboarding() {
    window.location.href = withHandle(ONBOARDING_ROUTE, cleanHandle);
  }

  function ensureTos(): boolean {
    if (!tos) {
      mockAlert("Please accept the Terms to continue.");
      return false;
    }
    return true;
  }

  function onProvider(p: RegisterProvider) {
    if (!ensureTos()) return;
    if (p.id === "email") {
      reveal("b-email");
      return;
    }
    // OAuth path skips email/otp/pwtoggle → straight to the success burst.
    setCountdown(2);
    reveal("c");
  }

  function sendCode() {
    if (!canSend) return;
    setDigits(["", "", "", "", "", ""]);
    setResend(c.otp.resendSeconds);
    reveal("b-otp");
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  }

  function setDigit(idx: number, raw: string) {
    const val = raw.replace(/[^0-9]/g, "");
    setDigits((prev) => {
      const next = [...prev];
      next[idx] = val.charAt(0) || "";
      for (let k = 1; k < val.length && idx + k < 6; k++) next[idx + k] = val.charAt(k);
      return next;
    });
    if (val && idx < 5) otpRefs.current[idx + 1]?.focus();
  }
  function otpKeyDown(idx: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !digits[idx] && idx > 0) otpRefs.current[idx - 1]?.focus();
  }
  function otpPaste(idx: number, e: React.ClipboardEvent<HTMLInputElement>) {
    e.preventDefault();
    const paste = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, 6);
    setDigits((prev) => {
      const next = [...prev];
      for (let k = 0; k < paste.length && idx + k < 6; k++) next[idx + k] = paste.charAt(k);
      return next;
    });
    otpRefs.current[Math.min(idx + paste.length, 5)]?.focus();
  }

  function verifyOtp(e: React.FormEvent) {
    e.preventDefault();
    if (!canVerify) return;
    // Email path → inline login-next-time choice, mirroring the mockup.
    reveal("b-pwtoggle");
  }

  function finishPwToggle() {
    if (pwSelected === 2) {
      if (pw.trim().length < 8) {
        mockAlert("Password must be at least 8 characters.");
        return;
      }
      if (pw !== pwConfirm) {
        setPwMatchError(true);
        return;
      }
    }
    setCountdown(2);
    reveal("c");
  }

  const trustStrip = (
    <div className="trust-strip">
      {c.trustChips.map((chip) => (
        <span key={chip} className="trust-chip">
          {chip}
        </span>
      ))}
    </div>
  );

  return (
    <AuthChrome
      barLink={
        <>
          Already have an account?{" "}
          <a href="/__proto/login">
            <strong>Log in →</strong>
          </a>
        </>
      }
    >
      <div className="proto-register">
        <div className="register-grid">
          {/* LEFT: form */}
          <div className="form-col">
            <div className="form-inner">
              {/* SECTION A — claim handle */}
              <section className={`reg-section${revealed.has("a") ? " revealed" : ""}`}>
                <h1 className="section-a-head">
                  Hey <span className="greet">@{displayHandle}</span> 👋
                  <br />
                  <span className="welcome">welcome to</span>{" "}
                  <span className="wordmark wordmark-md" aria-label="tada!ify">
                    <span className="wm-ta" aria-hidden>ta</span>
                    <span className="wm-da" aria-hidden>da!</span>
                    <span className="wm-ify" aria-hidden>ify</span>
                  </span>
                </h1>
                <p className="section-a-lede">
                  Grab your handle first — it's yours forever, free.
                </p>

                <label htmlFor="handle-input">Your public URL</label>
                <div className="input-group">
                  <span className="prefix">{rules.prefix}</span>
                  <input
                    id="handle-input"
                    type="text"
                    autoComplete="off"
                    placeholder="yourname"
                    value={handle}
                    onChange={(e) => setHandle(e.target.value)}
                  />
                </div>
                <div className={`availability ${state.kind}`}>{state.message}</div>
                {state.kind === "taken" && state.alternatives && (
                  <div className="alternatives">
                    {state.alternatives.map((alt) => (
                      <button key={alt} type="button" onClick={() => setHandle(alt)}>
                        {alt}
                      </button>
                    ))}
                  </div>
                )}

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: 20, minHeight: 44 }}
                  disabled={!canContinue}
                  onClick={() => canContinue && reveal("b")}
                >
                  Continue →
                </button>

                <div className="tier-hint">{c.tierHint}</div>
                {trustStrip}
              </section>

              {/* SECTION B — sign-in method */}
              <section className={`reg-section${revealed.has("b") ? " revealed" : ""}`}>
                <p className="section-header-mini">How would you like to sign in?</p>
                <p className="section-sub">
                  Your handle <strong>@{displayHandle}</strong> is saved. Pick a method and it's
                  yours.
                </p>

                <div className="provider-stack">
                  {c.providers.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      className={`auth-btn ${p.tier}`}
                      onClick={() => onProvider(p)}
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

                <div className="tos-row">
                  <input
                    type="checkbox"
                    id="tos"
                    checked={tos}
                    onChange={(e) => setTos(e.target.checked)}
                  />
                  <label htmlFor="tos">
                    {c.tosLead}{" "}
                    <a
                      href="/__proto/landing"
                      className="tos-link"
                      onClick={(e) => {
                        e.preventDefault();
                        mockAlert("Mockup: would open the Terms of Service (prototype).");
                      }}
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="/__proto/landing"
                      className="tos-link"
                      onClick={(e) => {
                        e.preventDefault();
                        mockAlert("Mockup: would open the Privacy Policy (prototype).");
                      }}
                    >
                      Privacy Policy
                    </a>
                    .
                  </label>
                </div>

                <div className="no-phone-notice">{c.noPhoneNotice}</div>

                <button type="button" className="back-link" onClick={() => collapseFrom("b")}>
                  ← back to handle
                </button>
                {trustStrip}
              </section>

              {/* SECTION B-EMAIL — email entry */}
              <section className={`reg-section${revealed.has("b-email") ? " revealed" : ""}`}>
                <p className="section-header-mini">What's your email?</p>
                <p className="section-sub">We'll email you a 6-digit code. No password required.</p>

                <form
                  className="email-step-wrap"
                  onSubmit={(e) => {
                    e.preventDefault();
                    sendCode();
                  }}
                >
                  <label htmlFor="register-email">{c.email.label}</label>
                  <input
                    id="register-email"
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
                </form>

                <div className="all-paths-note">{c.email.note}</div>
                <button type="button" className="back-link" onClick={() => collapseFrom("b-email")}>
                  ← back to sign-in options
                </button>
                {trustStrip}
              </section>

              {/* SECTION B-OTP — 6-digit code */}
              <section className={`reg-section${revealed.has("b-otp") ? " revealed" : ""}`}>
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
                    style={{ width: "100%", marginTop: 14, minHeight: 44 }}
                    disabled={!canVerify}
                  >
                    {c.otp.verifyLabel}
                  </button>
                </form>
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
                <button
                  type="button"
                  className="back-link"
                  onClick={() => {
                    setDigits(["", "", "", "", "", ""]);
                    collapseFrom("b-otp");
                  }}
                >
                  ← wrong email? go back
                </button>
                {trustStrip}
              </section>

              {/* SECTION B-PWTOGGLE — inline post-OTP choice */}
              <section className={`reg-section${revealed.has("b-pwtoggle") ? " revealed" : ""}`}>
                <p className="section-header-mini">How do you want to log in next time?</p>
                <p className="section-sub">
                  You're all set, <strong>@{displayHandle}</strong>. One quick choice before we set
                  up your page.
                </p>

                <div className="pw-toggle-cards">
                  <button
                    type="button"
                    className={`pw-card${pwSelected === 1 ? " selected" : ""}`}
                    role="radio"
                    aria-checked={pwSelected === 1}
                    onClick={() => setPwSelected(1)}
                  >
                    <span className="radio-dot" aria-hidden="true" />
                    <span className="pw-card-body">
                      <span className="pw-card-title">
                        Send me a login code
                        <span className="recommended-badge">✓ Recommended</span>
                      </span>
                      <span className="pw-card-sub">
                        We'll email you a 6-digit code each time. No password to remember.
                      </span>
                    </span>
                  </button>

                  <div
                    className={`pw-card${pwSelected === 2 ? " selected" : ""}`}
                    role="radio"
                    aria-checked={pwSelected === 2}
                    tabIndex={0}
                    onClick={() => setPwSelected(2)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setPwSelected(2);
                      }
                    }}
                  >
                    <span className="radio-dot" aria-hidden="true" />
                    <div className="pw-card-body">
                      <div className="pw-card-title">Set a password for faster sign-in</div>
                      <div className="pw-card-sub">
                        Faster daily sign-in. You can always use a code instead.
                      </div>

                      {pwSelected === 2 && (
                        <div className="pw-card-extra">
                          <label className="pw-field-label" htmlFor="set-pw-input">
                            Choose a password
                          </label>
                          <div className="pw-input-wrap-card">
                            <input
                              id="set-pw-input"
                              className="input"
                              type={pwVisible ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              value={pw}
                              onChange={(e) => {
                                setPw(e.target.value);
                                setPwMatchError(false);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="pw-show-btn"
                              aria-label="Show/hide password"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPwVisible((v) => !v);
                              }}
                            >
                              {pwVisible ? "Hide" : "Show"}
                            </button>
                          </div>
                          <div className="pw-min-hint">
                            At least 8 characters. Mix of letters and numbers recommended.
                          </div>

                          <label className="pw-field-label" htmlFor="set-pw-confirm">
                            Confirm password
                          </label>
                          <div className="pw-input-wrap-card">
                            <input
                              id="set-pw-confirm"
                              className="input"
                              type={pwConfirmVisible ? "text" : "password"}
                              placeholder="••••••••"
                              autoComplete="new-password"
                              value={pwConfirm}
                              onChange={(e) => {
                                setPwConfirm(e.target.value);
                                setPwMatchError(false);
                              }}
                              onClick={(e) => e.stopPropagation()}
                            />
                            <button
                              type="button"
                              className="pw-show-btn"
                              aria-label="Show/hide confirm password"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPwConfirmVisible((v) => !v);
                              }}
                            >
                              {pwConfirmVisible ? "Hide" : "Show"}
                            </button>
                          </div>
                          <div className={`pw-min-hint${pwMatchError ? " error" : ""}`}>
                            {pwMatchError
                              ? "✗ Passwords do not match — re-type to confirm."
                              : "Re-enter to confirm — protects you from a typo lock-out."}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ width: "100%", marginTop: 18, minHeight: 46 }}
                  onClick={finishPwToggle}
                >
                  Continue →
                </button>
                {trustStrip}
              </section>

              {/* SECTION C — success */}
              <section className={`reg-section${revealed.has("c") ? " revealed" : ""}`}>
                <div className="success-burst">
                  <div className="big-tada">tada! 🎉</div>
                  <h2>
                    Welcome, <span className="final-greet">@{displayHandle}</span>
                  </h2>
                  <p className="success-lede">Next: let's set up your page in 60 seconds.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-lg"
                    style={{ marginTop: 24, minHeight: 52 }}
                    onClick={goToOnboarding}
                  >
                    Let's go →
                  </button>
                  <p className="tip-microcopy">
                    Auto-advancing in <span>{Math.max(countdown, 0)}</span>s…
                  </p>
                </div>
              </section>
            </div>
          </div>

          {/* RIGHT: live URL preview (desktop only) */}
          <div className="preview-col">
            <div className="preview-wrapper">
              <p className="preview-eyebrow">Live preview</p>
              <div className="preview-card">
                <div className="preview-wordmark" aria-label="Live URL preview">
                  <span className="url-letters">tadaify</span>
                  <span className="url-punct">.</span>
                  <span className="url-tld">com</span>
                  <span className="url-punct">/</span>
                  <span className="handle">{previewHandle}</span>
                </div>
              </div>

              <div className="preview-url">
                Your public URL will be: https://tadaify.com/{previewHandle}
              </div>

              <div className="preview-thumb">
                <div className="dot-row">
                  <div className="dot" />
                  <div className="dot" />
                  <div className="dot" />
                </div>
                <div className="line short" />
                <div className="line" />
                <div className="line pill-row" />
                <div className="line pill-row" />
                <div className="line short" />
              </div>

              <p className="preview-note">
                This is how your brand shows up on every page, share card, and email receipt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AuthChrome>
  );
}
