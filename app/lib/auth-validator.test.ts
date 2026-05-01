/**
 * Unit tests for auth-validator.ts
 * Run: npx vitest run app/lib/auth-validator.test.ts
 * Story: F-REGISTER-001a
 */

import { describe, it, expect } from "vitest";
import {
  validateEmail,
  EMAIL_ERROR_MESSAGES,
  validatePassword,
  PASSWORD_ERROR_MESSAGES,
  validatePasswordMatch,
  PASSWORD_MATCH_ERROR_MESSAGES,
  validateOtp,
  OTP_ERROR_MESSAGES,
} from "./auth-validator";

// ─── validateEmail ────────────────────────────────────────────────────────────

describe("validateEmail — valid", () => {
  it("accepts a simple address", () => {
    expect(validateEmail("user@example.com")).toEqual({ valid: true });
  });

  it("accepts subdomains", () => {
    expect(validateEmail("user@mail.example.co.uk")).toEqual({ valid: true });
  });

  it("accepts plus-sign alias", () => {
    expect(validateEmail("user+tag@example.com")).toEqual({ valid: true });
  });

  it("accepts uppercase letters (normalised by caller)", () => {
    expect(validateEmail("User@Example.COM")).toEqual({ valid: true });
  });

  it("accepts digits in local part", () => {
    expect(validateEmail("user123@example.com")).toEqual({ valid: true });
  });

  it("accepts dot in local part", () => {
    expect(validateEmail("first.last@example.com")).toEqual({ valid: true });
  });

  it("trims surrounding whitespace before validating", () => {
    expect(validateEmail("  user@example.com  ")).toEqual({ valid: true });
  });
});

describe("validateEmail — invalid", () => {
  it("rejects empty string", () => {
    expect(validateEmail("")).toEqual({ valid: false, reason: "empty" });
  });

  it("rejects whitespace-only string", () => {
    expect(validateEmail("   ")).toEqual({ valid: false, reason: "empty" });
  });

  it("rejects missing @", () => {
    expect(validateEmail("userexample.com")).toEqual({ valid: false, reason: "invalid_format" });
  });

  it("rejects missing TLD", () => {
    expect(validateEmail("user@example")).toEqual({ valid: false, reason: "invalid_format" });
  });

  it("rejects double @", () => {
    expect(validateEmail("user@@example.com")).toEqual({ valid: false, reason: "invalid_format" });
  });

  it("rejects spaces inside", () => {
    expect(validateEmail("user name@example.com")).toEqual({
      valid: false,
      reason: "invalid_format",
    });
  });

  it("rejects no local part", () => {
    expect(validateEmail("@example.com")).toEqual({ valid: false, reason: "invalid_format" });
  });
});

describe("EMAIL_ERROR_MESSAGES", () => {
  it("has a message for each reason", () => {
    expect(EMAIL_ERROR_MESSAGES.empty).toBeTruthy();
    expect(EMAIL_ERROR_MESSAGES.invalid_format).toBeTruthy();
  });
});

// ─── validatePassword ─────────────────────────────────────────────────────────

describe("validatePassword — valid", () => {
  it("accepts exactly 8 chars with letter + digit", () => {
    expect(validatePassword("abcde123")).toEqual({ valid: true });
  });

  it("accepts a longer password", () => {
    expect(validatePassword("MyP@ssw0rd_long")).toEqual({ valid: true });
  });

  it("accepts all uppercase with digit", () => {
    expect(validatePassword("ABCDEFG1")).toEqual({ valid: true });
  });
});

describe("validatePassword — invalid", () => {
  it("rejects empty string", () => {
    expect(validatePassword("")).toEqual({ valid: false, reason: "empty" });
  });

  it("rejects password shorter than 8", () => {
    expect(validatePassword("abc123")).toEqual({ valid: false, reason: "too_short" });
  });

  it("rejects password with no letters", () => {
    expect(validatePassword("12345678")).toEqual({ valid: false, reason: "no_letter" });
  });

  it("rejects password with no digits", () => {
    expect(validatePassword("abcdefgh")).toEqual({ valid: false, reason: "no_digit" });
  });

  it("rejects 7-char edge case (one below minimum)", () => {
    expect(validatePassword("abcd123")).toEqual({ valid: false, reason: "too_short" });
  });
});

describe("PASSWORD_ERROR_MESSAGES", () => {
  it("has a message for each reason", () => {
    expect(PASSWORD_ERROR_MESSAGES.empty).toBeTruthy();
    expect(PASSWORD_ERROR_MESSAGES.too_short).toContain("8");
    expect(PASSWORD_ERROR_MESSAGES.no_letter).toBeTruthy();
    expect(PASSWORD_ERROR_MESSAGES.no_digit).toBeTruthy();
  });
});

// ─── validatePasswordMatch ────────────────────────────────────────────────────

describe("validatePasswordMatch — valid", () => {
  it("passes when passwords are identical", () => {
    expect(validatePasswordMatch("Secure1!", "Secure1!")).toEqual({ valid: true });
  });
});

describe("validatePasswordMatch — invalid", () => {
  it("rejects empty confirm field", () => {
    expect(validatePasswordMatch("Secure1!", "")).toEqual({
      valid: false,
      reason: "confirm_empty",
    });
  });

  it("rejects mismatched passwords", () => {
    expect(validatePasswordMatch("Secure1!", "Different1!")).toEqual({
      valid: false,
      reason: "mismatch",
    });
  });

  it("rejects case-sensitive mismatch", () => {
    expect(validatePasswordMatch("Secure1!", "secure1!")).toEqual({
      valid: false,
      reason: "mismatch",
    });
  });
});

describe("PASSWORD_MATCH_ERROR_MESSAGES", () => {
  it("has a message for each reason", () => {
    expect(PASSWORD_MATCH_ERROR_MESSAGES.confirm_empty).toBeTruthy();
    expect(PASSWORD_MATCH_ERROR_MESSAGES.mismatch).toBeTruthy();
  });
});

// ─── validateOtp ──────────────────────────────────────────────────────────────

describe("validateOtp — valid", () => {
  it("accepts exactly 6 digits", () => {
    expect(validateOtp("123456")).toEqual({ valid: true });
  });

  it("accepts leading zeros", () => {
    expect(validateOtp("000001")).toEqual({ valid: true });
  });
});

describe("validateOtp — invalid", () => {
  it("rejects empty string", () => {
    expect(validateOtp("")).toEqual({ valid: false, reason: "empty" });
  });

  it("rejects 5 digits (too short)", () => {
    expect(validateOtp("12345")).toEqual({ valid: false, reason: "wrong_length" });
  });

  it("rejects 7 digits (too long)", () => {
    expect(validateOtp("1234567")).toEqual({ valid: false, reason: "wrong_length" });
  });

  it("rejects letters", () => {
    expect(validateOtp("12345a")).toEqual({ valid: false, reason: "non_numeric" });
  });

  it("rejects alphanumeric mix", () => {
    expect(validateOtp("abc123")).toEqual({ valid: false, reason: "non_numeric" });
  });

  it("rejects spaces", () => {
    expect(validateOtp("123 56")).toEqual({ valid: false, reason: "non_numeric" });
  });
});

describe("OTP_ERROR_MESSAGES", () => {
  it("has a message for each reason", () => {
    expect(OTP_ERROR_MESSAGES.empty).toBeTruthy();
    expect(OTP_ERROR_MESSAGES.wrong_length).toContain("6");
    expect(OTP_ERROR_MESSAGES.non_numeric).toBeTruthy();
  });
});
