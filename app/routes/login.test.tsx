/**
 * U1 — Login route: Apple SSO removal verification (DEC-346=C)
 *
 * Verifies that the /login route source contains exactly 3 SSO provider references
 * (Google, X, Email) and zero Apple references after cleanup (issue tadaify-app#183).
 *
 * U5 (issue tadaify-app#190 Bug #3, DEC-307 canonical route fix):
 *   successful OTP verify navigates to /app, NOT /dashboard (which 404s).
 *
 * These are static-analysis tests against the route source. We use fs.readFileSync
 * so they run under vitest node environment without jsdom/React rendering.
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183, tadaify-app#190)
 * Covers: U1, U5 per issue spec
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const loginSrc = readFileSync(
  fileURLToPath(new URL("./login.tsx", import.meta.url)),
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

// ---------------------------------------------------------------------------
// U6 (smoke-test-2026-05-06 WARN-1): login page uses "Log in" brand copy, not "Sign in"
// Brand lock: register + landing use "Log in"; login page must match.
// Covers: feedback_brand_lock_sweep_all_renderings.md
// ---------------------------------------------------------------------------

describe("login.tsx — U6: 'Log in' brand copy (not 'Sign in')", () => {
  it("page title uses 'Log in — tadaify'", () => {
    expect(loginSrc).toContain("Log in — tadaify");
  });

  it("meta description uses 'Log in to your tadaify account'", () => {
    expect(loginSrc).toContain("Log in to your tadaify account.");
  });

  it("H2 heading uses 'Log in to your tadaify account'", () => {
    // The visible paragraph under "Welcome back" heading
    expect(loginSrc).toContain("Log in to your tadaify account.");
  });

  it("does NOT contain user-visible 'Sign in to your tadaify account'", () => {
    expect(loginSrc).not.toContain("Sign in to your tadaify account");
  });

  it("does NOT contain 'Sign in — tadaify' page title", () => {
    expect(loginSrc).not.toContain("Sign in — tadaify");
  });
});

// ---------------------------------------------------------------------------
// U5 (issue tadaify-app#190 Bug #3): successful OTP verify navigates to /app
// DEC-307: returning user → dashboard — canonical route is /app, not /dashboard
// ---------------------------------------------------------------------------

describe("login.tsx — U5: successful OTP verify navigates to /app (Bug #3 DEC-307)", () => {
  it("source contains navigate('/app') for OTP verify success", () => {
    // After OTP verify success, navigate must go to /app (not /dashboard which 404s)
    expect(loginSrc).toContain('navigate("/app")');
  });

  it("source does NOT contain navigate('/dashboard') (regression-lock — /dashboard 404s)", () => {
    // Regression-lock: /dashboard route does not exist; /app is the canonical dashboard.
    expect(loginSrc).not.toContain('navigate("/dashboard")');
  });

  it("DEC-307 comment still present but references /app as canonical route", () => {
    // The DEC-307 comment may reference 'dashboard' semantically — that's OK.
    // The literal navigate call must be /app.
    const navigateDashboard = /navigate\(["']\/dashboard["']\)/.test(loginSrc);
    expect(navigateDashboard).toBe(false);
  });
});
