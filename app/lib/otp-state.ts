/**
 * OTP state machine for the 5-section register flow.
 *
 * Sections (per mockups/tadaify-mvp/register.html):
 *   A              — handle prefill / confirmation
 *   B              — method selection (4 providers)
 *   B-email        — email input
 *   B-otp          — 6-digit code grid
 *   B-password-toggle — inline toggle (code next time vs set password)
 *   C              — success + 2s countdown
 *
 * DEC trail:
 *   DEC-291  — B-modified flow; 6-digit OTP; inline toggle post-OTP
 *   DEC-295  — default "Send code next time"; opt-in "Set password"
 *   DEC-305  — 3 wrong codes → 15-min frontend lockout
 *
 * Story: F-REGISTER-001a
 */

export type RegisterSection =
  | "A"
  | "B"
  | "B-email"
  | "B-otp"
  | "B-password-toggle"
  | "C";

export type PasswordMode = "otp" | "password"; // DEC-295

export interface OtpState {
  /** Current visible section */
  section: RegisterSection;
  /** Handle value from URL param or typed (populated on section A) */
  handle: string;
  /** Email address entered in B-email */
  email: string;
  /** 6-digit OTP as array of single chars (index 0–5) */
  otpDigits: [string, string, string, string, string, string];
  /** Number of failed OTP attempts in current cooldown window (DEC-305) */
  failedAttempts: number;
  /** Unix ms timestamp when the 15-min lockout ends; null = not locked */
  lockedUntil: number | null;
  /** Timestamp when the 60s resend cooldown expires; null = can resend */
  resendCooldownUntil: number | null;
  /** Post-OTP password mode selection (DEC-295) */
  passwordMode: PasswordMode;
  /** Password value when mode = "password" */
  password: string;
  /** Confirm-password value when mode = "password" */
  passwordConfirm: string;
  /** Whether the form is currently submitting */
  isSubmitting: boolean;
  /** Error message to display */
  error: string | null;
}

export const MAX_FAILED_ATTEMPTS = 3; // DEC-305: 3 strikes
export const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 min
export const RESEND_COOLDOWN_MS = 60 * 1000; // 60 s
export const SUCCESS_REDIRECT_DELAY_MS = 2000; // 2 s countdown

export function createInitialState(handle = ""): OtpState {
  return {
    section: "A",
    handle,
    email: "",
    otpDigits: ["", "", "", "", "", ""],
    failedAttempts: 0,
    lockedUntil: null,
    resendCooldownUntil: null,
    passwordMode: "otp",
    password: "",
    passwordConfirm: "",
    isSubmitting: false,
    error: null,
  };
}

// ─── Actions ─────────────────────────────────────────────────────────────────

export type OtpAction =
  | { type: "SET_HANDLE"; handle: string }
  | { type: "PROCEED_TO_METHOD" }
  | { type: "PROCEED_TO_EMAIL" }
  | { type: "SET_EMAIL"; email: string }
  | { type: "SEND_CODE"; resendCooldownUntil: number }
  | { type: "SET_OTP_DIGIT"; index: number; digit: string }
  | { type: "SET_OTP_FULL"; value: string }
  | { type: "OTP_SUCCESS" }
  | { type: "OTP_FAILURE"; now: number }
  | { type: "RESEND_CODE"; now: number }
  | { type: "SET_PASSWORD_MODE"; mode: PasswordMode }
  | { type: "SET_PASSWORD"; value: string }
  | { type: "SET_PASSWORD_CONFIRM"; value: string }
  | { type: "SUBMIT_START" }
  | { type: "SUBMIT_END" }
  | { type: "SET_ERROR"; error: string | null }
  | { type: "SUCCESS" }
  | { type: "BACK" };

// ─── Reducer ─────────────────────────────────────────────────────────────────

export function otpReducer(state: OtpState, action: OtpAction): OtpState {
  switch (action.type) {
    case "SET_HANDLE":
      return { ...state, handle: action.handle, error: null };

    case "PROCEED_TO_METHOD":
      return { ...state, section: "B", error: null };

    case "PROCEED_TO_EMAIL":
      return { ...state, section: "B-email", error: null };

    case "SET_EMAIL":
      return { ...state, email: action.email, error: null };

    case "SEND_CODE": {
      return {
        ...state,
        section: "B-otp",
        otpDigits: ["", "", "", "", "", ""],
        resendCooldownUntil: action.resendCooldownUntil,
        failedAttempts: 0,
        lockedUntil: null,
        error: null,
      };
    }

    case "SET_OTP_DIGIT": {
      const digits = [...state.otpDigits] as OtpState["otpDigits"];
      digits[action.index] = action.digit.replace(/\D/g, "").slice(-1);
      return { ...state, otpDigits: digits, error: null };
    }

    case "SET_OTP_FULL": {
      const cleaned = action.value.replace(/\D/g, "").slice(0, 6);
      const digits = (cleaned.split("").concat(["", "", "", "", "", ""])).slice(
        0,
        6
      ) as OtpState["otpDigits"];
      return { ...state, otpDigits: digits, error: null };
    }

    case "OTP_SUCCESS":
      return {
        ...state,
        section: "B-password-toggle",
        failedAttempts: 0,
        lockedUntil: null,
        error: null,
        isSubmitting: false,
      };

    case "OTP_FAILURE": {
      const newFailed = state.failedAttempts + 1;
      const locked =
        newFailed >= MAX_FAILED_ATTEMPTS
          ? action.now + LOCKOUT_DURATION_MS
          : null;
      return {
        ...state,
        failedAttempts: newFailed,
        lockedUntil: locked,
        isSubmitting: false,
        error:
          locked != null
            ? "Too many incorrect codes. Try again in 15 minutes."
            : `Incorrect code. ${MAX_FAILED_ATTEMPTS - newFailed} attempt${
                MAX_FAILED_ATTEMPTS - newFailed === 1 ? "" : "s"
              } remaining.`,
      };
    }

    case "RESEND_CODE":
      return {
        ...state,
        otpDigits: ["", "", "", "", "", ""],
        resendCooldownUntil: action.now + RESEND_COOLDOWN_MS,
        failedAttempts: 0,
        lockedUntil: null,
        error: null,
      };

    case "SET_PASSWORD_MODE":
      return {
        ...state,
        passwordMode: action.mode,
        password: "",
        passwordConfirm: "",
        error: null,
      };

    case "SET_PASSWORD":
      return { ...state, password: action.value, error: null };

    case "SET_PASSWORD_CONFIRM":
      return { ...state, passwordConfirm: action.value, error: null };

    case "SUBMIT_START":
      return { ...state, isSubmitting: true, error: null };

    case "SUBMIT_END":
      return { ...state, isSubmitting: false };

    case "SET_ERROR":
      return { ...state, error: action.error, isSubmitting: false };

    case "SUCCESS":
      return { ...state, section: "C", isSubmitting: false, error: null };

    case "BACK": {
      const backMap: Partial<Record<RegisterSection, RegisterSection>> = {
        B: "A",
        "B-email": "B",
        "B-otp": "B-email",
        "B-password-toggle": "B-otp",
      };
      const prev = backMap[state.section];
      if (!prev) return state;
      return { ...state, section: prev, error: null, isSubmitting: false };
    }

    default:
      return state;
  }
}

// ─── Selectors ───────────────────────────────────────────────────────────────

export function isLocked(state: OtpState, now: number): boolean {
  return state.lockedUntil !== null && now < state.lockedUntil;
}

export function canResend(state: OtpState, now: number): boolean {
  return (
    state.resendCooldownUntil === null || now >= state.resendCooldownUntil
  );
}

export function otpValue(state: OtpState): string {
  return state.otpDigits.join("");
}

export function isOtpComplete(state: OtpState): boolean {
  return state.otpDigits.every((d) => d.length === 1);
}
