/**
 * Unit tests for otp-state.ts
 * Run: npx vitest run app/lib/otp-state.test.ts
 * Story: F-REGISTER-001a
 * BR: BR-OTP-RATE-LIMIT-001 (U2 block — issue tadaify-app#179)
 */

import { describe, it, expect } from "vitest";
import {
  createInitialState,
  otpReducer,
  isLocked,
  canResend,
  isResendCapReached,
  otpValue,
  isOtpComplete,
  MAX_FAILED_ATTEMPTS,
  LOCKOUT_DURATION_MS,
  RESEND_COOLDOWN_MS,
  MAX_ATTEMPTS_PER_SESSION,
  type OtpState,
  type OtpAction,
} from "./otp-state";

const NOW = 1_700_000_000_000; // fixed fake "now" for deterministic tests

function reduce(state: OtpState, ...actions: OtpAction[]): OtpState {
  return actions.reduce(otpReducer, state);
}

// ─── Initial state ────────────────────────────────────────────────────────────

describe("createInitialState", () => {
  it("starts on section A", () => {
    expect(createInitialState().section).toBe("A");
  });

  it("prefills handle from argument", () => {
    expect(createInitialState("alex").handle).toBe("alex");
  });

  it("starts with empty OTP digits", () => {
    const s = createInitialState();
    expect(s.otpDigits.every((d) => d === "")).toBe(true);
  });

  it("starts with passwordMode = otp (DEC-295 default)", () => {
    expect(createInitialState().passwordMode).toBe("otp");
  });
});

// ─── Happy path section transitions ──────────────────────────────────────────

describe("section transitions — happy path", () => {
  it("A → B via PROCEED_TO_METHOD", () => {
    const s = reduce(createInitialState("alex"), { type: "PROCEED_TO_METHOD" });
    expect(s.section).toBe("B");
  });

  it("B → B-email via PROCEED_TO_EMAIL", () => {
    const s = reduce(
      createInitialState("alex"),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" }
    );
    expect(s.section).toBe("B-email");
  });

  it("B-email → B-otp via SEND_CODE (resets OTP)", () => {
    const s = reduce(
      createInitialState("alex"),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "SET_EMAIL", email: "user@example.com" },
      { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS }
    );
    expect(s.section).toBe("B-otp");
    expect(s.email).toBe("user@example.com");
    expect(s.otpDigits.every((d) => d === "")).toBe(true);
  });

  // Regression guard: handleSendCode dispatches SUBMIT_START before the
  // /api/auth/signup fetch and SEND_CODE on success. Without resetting
  // isSubmitting in SEND_CODE, the next screen's verify button stayed
  // disabled with the "Verifying…" label and blocked the entire OTP flow
  // even though no verify request was ever made.
  // Caught by app-dashboard.spec.ts S2 during #171 escalation.
  it("SEND_CODE clears isSubmitting (regression: SUBMIT_START leaks into B-otp)", () => {
    const s = reduce(
      createInitialState("alex"),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "SET_EMAIL", email: "user@example.com" },
      { type: "SUBMIT_START" },
      { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS }
    );
    expect(s.section).toBe("B-otp");
    expect(s.isSubmitting).toBe(false);
  });

  it("B-otp → B-password-toggle via OTP_SUCCESS", () => {
    const s = reduce(
      createInitialState("alex"),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "SET_EMAIL", email: "user@example.com" },
      { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS },
      { type: "OTP_SUCCESS" }
    );
    expect(s.section).toBe("B-password-toggle");
    expect(s.failedAttempts).toBe(0);
    expect(s.lockedUntil).toBeNull();
  });

  it("B-password-toggle → C via SUCCESS", () => {
    const s = reduce(
      createInitialState("alex"),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "SET_EMAIL", email: "user@example.com" },
      { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS },
      { type: "OTP_SUCCESS" },
      { type: "SUCCESS" }
    );
    expect(s.section).toBe("C");
  });
});

// ─── Back navigation ──────────────────────────────────────────────────────────

describe("back navigation preserves state", () => {
  it("B → A preserves email and handle", () => {
    const base = reduce(
      createInitialState("alex"),
      { type: "SET_EMAIL", email: "u@example.com" },
      { type: "PROCEED_TO_METHOD" }
    );
    const s = otpReducer(base, { type: "BACK" });
    expect(s.section).toBe("A");
    expect(s.handle).toBe("alex");
    expect(s.email).toBe("u@example.com");
  });

  it("B-email → B", () => {
    const s = reduce(
      createInitialState(),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "BACK" }
    );
    expect(s.section).toBe("B");
  });

  it("B-otp → B-email", () => {
    const s = reduce(
      createInitialState(),
      { type: "PROCEED_TO_METHOD" },
      { type: "PROCEED_TO_EMAIL" },
      { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS },
      { type: "BACK" }
    );
    expect(s.section).toBe("B-email");
  });

  it("BACK from A is a no-op", () => {
    const s = otpReducer(createInitialState(), { type: "BACK" });
    expect(s.section).toBe("A");
  });

  it("BACK from C is a no-op", () => {
    const base: OtpState = { ...createInitialState(), section: "C" };
    const s = otpReducer(base, { type: "BACK" });
    expect(s.section).toBe("C");
  });
});

// ─── OTP digit management ─────────────────────────────────────────────────────

describe("OTP digit management", () => {
  it("SET_OTP_DIGIT sets a single digit", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_DIGIT", index: 0, digit: "7" });
    expect(s.otpDigits[0]).toBe("7");
  });

  it("SET_OTP_DIGIT strips non-numeric chars", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_DIGIT", index: 2, digit: "a5" });
    expect(s.otpDigits[2]).toBe("5");
  });

  it("SET_OTP_FULL fills all 6 slots from a pasted string", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "123456" });
    expect(s.otpDigits).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("SET_OTP_FULL strips non-digits from paste", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "1 2-3 4 5 6" });
    expect(s.otpDigits).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("SET_OTP_FULL truncates to 6", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "12345678" });
    expect(s.otpDigits).toEqual(["1", "2", "3", "4", "5", "6"]);
  });

  it("isOtpComplete is false when any digit missing", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_DIGIT", index: 0, digit: "1" });
    expect(isOtpComplete(s)).toBe(false);
  });

  it("isOtpComplete is true when all 6 digits set", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "123456" });
    expect(isOtpComplete(s)).toBe(true);
  });

  it("otpValue returns joined digits", () => {
    const s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "654321" });
    expect(otpValue(s)).toBe("654321");
  });
});

// ─── 3-strike lockout (DEC-305) ───────────────────────────────────────────────

describe("3-strike lockout (DEC-305)", () => {
  it("increments failedAttempts on OTP_FAILURE", () => {
    const s = otpReducer(createInitialState(), { type: "OTP_FAILURE", now: NOW });
    expect(s.failedAttempts).toBe(1);
    expect(s.lockedUntil).toBeNull();
  });

  it("sets lockedUntil after MAX_FAILED_ATTEMPTS failures", () => {
    let s = createInitialState();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    }
    expect(s.lockedUntil).toBe(NOW + LOCKOUT_DURATION_MS);
  });

  it("error message reflects remaining attempts before lockout", () => {
    const s = otpReducer(createInitialState(), { type: "OTP_FAILURE", now: NOW });
    expect(s.error).toContain("2 attempts remaining");
  });

  it("error message on 2nd failure = 1 attempt remaining", () => {
    let s = createInitialState();
    s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    expect(s.error).toContain("1 attempt remaining");
  });

  it("error message on lockout mentions 15 minutes", () => {
    let s = createInitialState();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    }
    expect(s.error).toContain("15 minutes");
  });

  it("isLocked returns true during lockout window", () => {
    let s = createInitialState();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    }
    expect(isLocked(s, NOW + 1000)).toBe(true);
  });

  it("isLocked returns false after lockout expires", () => {
    let s = createInitialState();
    for (let i = 0; i < MAX_FAILED_ATTEMPTS; i++) {
      s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    }
    expect(isLocked(s, NOW + LOCKOUT_DURATION_MS + 1)).toBe(false);
  });

  it("OTP_SUCCESS clears failedAttempts and lockedUntil", () => {
    let s = createInitialState();
    s = otpReducer(s, { type: "OTP_FAILURE", now: NOW });
    s = otpReducer(s, { type: "OTP_SUCCESS" });
    expect(s.failedAttempts).toBe(0);
    expect(s.lockedUntil).toBeNull();
  });
});

// ─── Resend cooldown ──────────────────────────────────────────────────────────

describe("60s resend cooldown", () => {
  it("sets resendCooldownUntil on SEND_CODE", () => {
    const s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    expect(s.resendCooldownUntil).toBe(NOW + RESEND_COOLDOWN_MS);
  });

  it("canResend is false during cooldown window", () => {
    const s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    expect(canResend(s, NOW + 5000)).toBe(false);
  });

  it("canResend is true when cooldown expires", () => {
    const s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    expect(canResend(s, NOW + RESEND_COOLDOWN_MS + 1)).toBe(true);
  });

  it("RESEND_CODE resets OTP digits and updates cooldown", () => {
    let s = otpReducer(createInitialState(), { type: "SET_OTP_FULL", value: "123456" });
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW });
    expect(s.otpDigits.every((d) => d === "")).toBe(true);
    expect(s.resendCooldownUntil).toBe(NOW + RESEND_COOLDOWN_MS);
  });
});

// ─── Password mode (DEC-295) ──────────────────────────────────────────────────

describe("password mode DEC-295", () => {
  it("SET_PASSWORD_MODE changes mode", () => {
    const s = otpReducer(createInitialState(), { type: "SET_PASSWORD_MODE", mode: "password" });
    expect(s.passwordMode).toBe("password");
  });

  it("SET_PASSWORD_MODE resets password fields", () => {
    let s: OtpState = { ...createInitialState(), password: "old", passwordConfirm: "old" };
    s = otpReducer(s, { type: "SET_PASSWORD_MODE", mode: "otp" });
    expect(s.password).toBe("");
    expect(s.passwordConfirm).toBe("");
  });

  it("SET_PASSWORD updates password field", () => {
    const s = otpReducer(createInitialState(), { type: "SET_PASSWORD", value: "Secure1!" });
    expect(s.password).toBe("Secure1!");
  });

  it("SET_PASSWORD_CONFIRM updates confirm field", () => {
    const s = otpReducer(createInitialState(), { type: "SET_PASSWORD_CONFIRM", value: "Secure1!" });
    expect(s.passwordConfirm).toBe("Secure1!");
  });
});

// ─── Per-session resend cap (BR-OTP-RATE-LIMIT-001 / DEC-342) — U2 ────────────

describe("per-session resend cap (BR-OTP-RATE-LIMIT-001)", () => {
  it("SEND_CODE increments attemptCount on first send", () => {
    const s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    expect(s.attemptCount).toBe(1);
  });

  it("RESEND_CODE increments attemptCount", () => {
    let s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    // expire the cooldown
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW + RESEND_COOLDOWN_MS + 1 });
    expect(s.attemptCount).toBe(2);
  });

  it("canResend returns false when attemptCount === MAX_ATTEMPTS_PER_SESSION", () => {
    let s = createInitialState();
    // Simulate 3 sends — SEND_CODE for first, RESEND_CODE for subsequent
    s = otpReducer(s, { type: "SEND_CODE", resendCooldownUntil: NOW + RESEND_COOLDOWN_MS });
    // Expire cooldown between resends
    s = { ...s, resendCooldownUntil: null };
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW });
    s = { ...s, resendCooldownUntil: null };
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW });
    expect(s.attemptCount).toBe(MAX_ATTEMPTS_PER_SESSION);
    expect(canResend(s, NOW + RESEND_COOLDOWN_MS + 1)).toBe(false);
  });

  it("isResendCapReached returns true when attemptCount >= MAX_ATTEMPTS_PER_SESSION", () => {
    let s = createInitialState();
    s = otpReducer(s, { type: "SEND_CODE", resendCooldownUntil: NOW });
    s = { ...s, resendCooldownUntil: null };
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW });
    s = { ...s, resendCooldownUntil: null };
    s = otpReducer(s, { type: "RESEND_CODE", now: NOW });
    expect(isResendCapReached(s)).toBe(true);
  });

  it("canResend returns false when within cooldown AND attemptCount < cap (cooldown still wins)", () => {
    // 1 send, cooldown still active
    const s = otpReducer(createInitialState(), {
      type: "SEND_CODE",
      resendCooldownUntil: NOW + RESEND_COOLDOWN_MS,
    });
    expect(s.attemptCount).toBe(1);
    expect(canResend(s, NOW + 5000)).toBe(false); // inside cooldown window
  });

  it("BACK_TO_EMAIL action resets attemptCount to 0 and email to ''", () => {
    let s = createInitialState();
    s = { ...s, email: "user@test.com", handle: "alex", attemptCount: 3, section: "B-otp" };
    s = otpReducer(s, { type: "BACK_TO_EMAIL" });
    expect(s.attemptCount).toBe(0);
    expect(s.email).toBe("");
    expect(s.handle).toBe("alex"); // handle preserved
    expect(s.section).toBe("B-email");
  });

  it("BACK_TO_EMAIL also clears OTP digits and cooldown", () => {
    let s = createInitialState();
    s = {
      ...s,
      otpDigits: ["1", "2", "3", "4", "5", "6"],
      resendCooldownUntil: NOW + 30000,
      section: "B-otp",
      attemptCount: 3,
    };
    s = otpReducer(s, { type: "BACK_TO_EMAIL" });
    expect(s.otpDigits.every((d) => d === "")).toBe(true);
    expect(s.resendCooldownUntil).toBeNull();
  });

  it("BACK from B-otp when cap reached behaves like BACK_TO_EMAIL (Codex F1)", () => {
    let s = createInitialState();
    s = {
      ...s,
      section: "B-otp",
      email: "user@test.com",
      handle: "alex",
      attemptCount: MAX_ATTEMPTS_PER_SESSION,
      otpDigits: ["1", "2", "3", "4", "5", "6"],
      resendCooldownUntil: NOW + 30000,
    };
    s = otpReducer(s, { type: "BACK" });
    // Must clear email and reset attemptCount (same as BACK_TO_EMAIL)
    expect(s.section).toBe("B-email");
    expect(s.email).toBe("");
    expect(s.attemptCount).toBe(0);
    expect(s.handle).toBe("alex"); // handle preserved
    expect(s.otpDigits.every((d) => d === "")).toBe(true);
    expect(s.resendCooldownUntil).toBeNull();
  });

  it("BACK from B-otp when cap NOT reached preserves email (normal back)", () => {
    let s = createInitialState();
    s = {
      ...s,
      section: "B-otp",
      email: "user@test.com",
      handle: "alex",
      attemptCount: 2, // below cap
    };
    s = otpReducer(s, { type: "BACK" });
    expect(s.section).toBe("B-email");
    expect(s.email).toBe("user@test.com"); // preserved
    expect(s.attemptCount).toBe(2); // unchanged
  });
});
