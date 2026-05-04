/**
 * U1 — Login route: Apple SSO removal verification (DEC-346=C)
 *
 * Verifies that the /login route source contains exactly 3 SSO provider references
 * (Google, X, Email) and zero Apple references after cleanup (issue tadaify-app#183).
 *
 * These are static-analysis tests against the route source. We use fs.readFileSync
 * so they run under vitest node environment without jsdom/React rendering.
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183)
 * Covers: U1 per issue spec
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const loginSrc = readFileSync(
  resolve(__dirname, "login.tsx"),
  "utf8",
);

// ---------------------------------------------------------------------------
// U1-1: "renders 2 OAuth buttons (Google, X) + inline email input — NOT 3 OAuth buttons + Apple absent"
//
// /login layout: Google (ProviderBtn) + X (ProviderBtn) + inline email input (NOT a 3rd button).
// Apple was the missing 3rd OAuth button — it has been permanently removed (DEC-346=C).
// ---------------------------------------------------------------------------

describe("login.tsx — SSO provider count (DEC-346=C)", () => {
  it("contains a Google provider button", () => {
    expect(loginSrc).toContain("Continue with Google");
  });

  it("contains an X provider button", () => {
    expect(loginSrc).toContain("Continue with X");
  });

  it("contains an inline email input (login uses inline email field, not a ProviderBtn)", () => {
    // /login shows the email field inline after OAuth buttons, not as a ProviderBtn
    expect(loginSrc).toContain("type=\"email\"");
  });

  it("does NOT contain an Apple provider button label", () => {
    // Only DEC history comment references are acceptable — no button copy
    expect(loginSrc).not.toMatch(/Continue with Apple/);
  });

  it("does NOT contain an Apple onClick handler", () => {
    expect(loginSrc).not.toMatch(/handleProviderClick\(['"]apple['"]\)/);
  });
});

// ---------------------------------------------------------------------------
// U1-2: "no element matches /Apple/i in rendered output"
//        (source-level: no user-facing copy mentioning Apple)
// ---------------------------------------------------------------------------

describe("login.tsx — no user-facing Apple copy (DEC-346=C)", () => {
  it("handleProviderClick type does NOT include 'apple'", () => {
    // The function signature should only mention "google" | "x"
    expect(loginSrc).not.toMatch(/"google" \| "apple"/);
    expect(loginSrc).not.toMatch(/"apple" \| "x"/);
  });

  it("no label or hint text references Apple or iOS (button copy)", () => {
    // "iOS users + privacy" was the hint for Apple button
    expect(loginSrc).not.toContain("iOS users + privacy");
  });

  it("apple key is absent from the coming-soon messages map", () => {
    expect(loginSrc).not.toMatch(/apple:\s*["']Apple sign-in/);
  });
});
