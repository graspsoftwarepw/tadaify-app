/**
 * U2 — Register route: Apple SSO removal verification (DEC-346=C)
 *
 * Verifies that the /register route source contains exactly 3 SSO provider references
 * (Google, X, Email) and zero Apple references after cleanup (issue tadaify-app#183).
 *
 * These are static-analysis tests against the route source. We use fs.readFileSync
 * so they run under vitest node environment without jsdom/React rendering.
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183)
 * Covers: U2 per issue spec
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { resolve } from "path";

const registerSrc = readFileSync(
  resolve(__dirname, "register.tsx"),
  "utf8",
);

// ---------------------------------------------------------------------------
// U2-1: "renders 3 SSO buttons NOT 4 (Apple absent)"
// ---------------------------------------------------------------------------

describe("register.tsx — SSO provider count (DEC-346=C)", () => {
  it("contains a Google provider button", () => {
    expect(registerSrc).toContain("Continue with Google");
  });

  it("contains an X provider button", () => {
    expect(registerSrc).toContain("Continue with X");
  });

  it("contains an Email provider button", () => {
    expect(registerSrc).toContain("Continue with Email");
  });

  it("does NOT contain an Apple provider button label", () => {
    expect(registerSrc).not.toMatch(/Continue with Apple/);
  });

  it("does NOT contain an Apple onClick handler", () => {
    expect(registerSrc).not.toMatch(/onProviderClick\(['"]apple['"]\)/);
  });
});

// ---------------------------------------------------------------------------
// U2-2: "no element matches /Apple/i in rendered output"
//        (source-level: no user-facing copy mentioning Apple)
// ---------------------------------------------------------------------------

describe("register.tsx — no user-facing Apple copy (DEC-346=C)", () => {
  it("handleProviderClick prop type does NOT include 'apple'", () => {
    // onProviderClick prop in SectionB component should be (p: "google" | "x")
    expect(registerSrc).not.toMatch(/"google" \| "apple"/);
    expect(registerSrc).not.toMatch(/"apple" \| "x"/);
    expect(registerSrc).not.toMatch(/["']apple["'] \| ["']x["']/);
  });

  it("no label or hint text references Apple or iOS (button copy)", () => {
    expect(registerSrc).not.toContain("iOS users + privacy");
  });

  it("apple key is absent from the coming-soon messages map", () => {
    expect(registerSrc).not.toMatch(/apple:\s*["']Apple sign-in/);
  });

  it("ProviderButton Apple SVG path is absent from source", () => {
    // Apple icon path prefix: d="M17.05 20.28
    expect(registerSrc).not.toMatch(/M17\.05 20\.28/);
  });
});
