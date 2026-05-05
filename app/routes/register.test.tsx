/**
 * Register route: static source verification tests
 *
 * U1 — Bug #1 regression (issue tadaify-app#188):
 *   "✉️ All paths confirm your email. We never ask for your phone." must
 *   appear zero times — the line was removed per bug #1 fix.
 *   The 🔒 trust chip MUST still be present.
 *
 * U2 — Apple SSO removal verification (DEC-346=C):
 *   Verifies 3 SSO providers (Google, X, Email) and zero Apple references.
 *
 * U1-190 — Bug #1 (issue tadaify-app#190, DEC-363=A):
 *   Handle-taken error region must show new "Already taken. Try:" copy +
 *   3 clickable chips from generateAlternatives(). Old "Taken — someone beat
 *   you to it." text must be absent.
 *
 * These are static-analysis tests against the route source. We use fs.readFileSync
 * so they run under vitest node environment without jsdom/React rendering.
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183, tadaify-app#188, tadaify-app#190)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const registerSrc = readFileSync(
  fileURLToPath(new URL("./register.tsx", import.meta.url)),
  "utf8",
);

// ---------------------------------------------------------------------------
// U1: phone-disclaimer text must NOT appear (Bug #1 — issue tadaify-app#188)
// ---------------------------------------------------------------------------

describe("register.tsx — Bug #1: phone disclaimer removed", () => {
  it("does NOT contain the ✉️ phone disclaimer line", () => {
    expect(registerSrc).not.toContain(
      "All paths confirm your email. We never ask for your phone."
    );
  });

  it("still contains the 🔒 trust chip (not removed)", () => {
    expect(registerSrc).toContain("We never ask for your phone number. Ever.");
  });
});

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

// ---------------------------------------------------------------------------
// U1-190: Bug #1 (issue tadaify-app#190) — handle-taken renders new copy + 3 chips
// DEC-363=A: "Already taken. Try: <chip1> · <chip2> · <chip3>"
// ---------------------------------------------------------------------------

describe("register.tsx — U1-190: handle-taken 'Already taken. Try:' copy + chip rendering (DEC-363=A)", () => {
  it("source contains 'Already taken. Try:' copy (DEC-363=A)", () => {
    // New copy per DEC-363=A must be present in source
    expect(registerSrc).toContain("Already taken. Try:");
  });

  it("source does NOT contain legacy 'someone beat you to it' copy (regression-lock)", () => {
    // Old text that appeared before DEC-363=A fix
    expect(registerSrc).not.toMatch(/someone beat you to it/i);
  });

  it("source does NOT contain legacy 'Taken —' prefix (regression-lock)", () => {
    expect(registerSrc).not.toMatch(/Taken —\s/i);
  });

  it("source imports generateAlternatives from handle-validator (chips source)", () => {
    // generateAlternatives must be imported (not inlined) for testability
    expect(registerSrc).toContain("generateAlternatives");
    expect(registerSrc).toMatch(/from ["']~\/lib\/handle-validator["']/);
  });

  it("source renders handleAlternatives as clickable buttons (chips)", () => {
    // Each chip must be a <button> element with onClick handler
    expect(registerSrc).toContain("handleAlternatives");
    expect(registerSrc).toMatch(/onAlternativeClick/);
  });

  it("handleAlternatives state is reset when user changes handle input", () => {
    // Regression-lock: chips must clear when user types a new handle
    expect(registerSrc).toMatch(/setHandleAlternatives\(\[\]\)/);
  });

  it("source uses ✦ brand marker for taken copy (DEC-363=A)", () => {
    // The ✦ (sparkle) marker is the brand indicator for the taken state
    expect(registerSrc).toContain("✦ Already taken. Try:");
  });
});
