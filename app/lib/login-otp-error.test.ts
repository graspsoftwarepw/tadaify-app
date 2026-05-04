/**
 * Unit tests for app/lib/login-otp-error.ts
 * Run: npx vitest run app/lib/login-otp-error.test.ts
 * Story: issue tadaify-app#176 — friendly no-account UX on /login.
 * Covers: BR-AUTH-05, TR-AUTH-01
 */

import { describe, it, expect } from "vitest";
import { buildRegisterCtaHref, mapLoginOtpResponse } from "./login-otp-error";

describe("mapLoginOtpResponse — login form / error mapper", () => {
  it("renders no-account CTA with email pre-filled in /register link when error code is 'no_account'", () => {
    const action = mapLoginOtpResponse(
      false,
      { error: "no_account" },
      "user@example.com"
    );
    expect(action.kind).toBe("no_account");
    if (action.kind === "no_account") {
      expect(action.email).toBe("user@example.com");
      // The /register CTA href must carry the user's email URL-encoded so the
      // register page can pre-fill it (issue tadaify-app#176).
      expect(buildRegisterCtaHref(action.email)).toBe(
        "/register?email=user%40example.com"
      );
    }
  });

  it("renders generic error text on server_error", () => {
    const action = mapLoginOtpResponse(
      false,
      { error: "server_error" },
      "user@example.com"
    );
    expect(action).toEqual({
      kind: "inline",
      text: "Something went wrong — please try again.",
    });
  });

  it("renders nothing on initial state", () => {
    // Initial state on /login = response.ok=true + sent=true (i.e. happy path,
    // OTP delivered). The form must NOT render either the no-account block
    // or an inline error — the user's view is the OTP-entry section.
    const action = mapLoginOtpResponse(true, { sent: true }, "user@example.com");
    expect(action).toEqual({ kind: "ok" });
  });
});

describe("buildRegisterCtaHref", () => {
  it("URL-encodes email so '+' and space survive the round-trip", () => {
    expect(buildRegisterCtaHref("plus+tag@example.com")).toBe(
      "/register?email=plus%2Btag%40example.com"
    );
  });
});
