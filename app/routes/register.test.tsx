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
 * U-187 — F-002a (issue tadaify-app#187):
 *   WelcomeHeader is imported at route-level (DEC-352=A + DEC-358=A).
 *   generateAlternatives called without locale param (DEC-357=D).
 *
 * These are static-analysis tests against the route source. We use fs.readFileSync
 * so they run under vitest node environment without jsdom/React rendering.
 *
 * Story: F-REGISTER-001a cleanup (issue tadaify-app#183, tadaify-app#188, tadaify-app#190)
 *        F-002a persistent header (issue tadaify-app#187)
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

// ---------------------------------------------------------------------------
// U-187: F-002a — WelcomeHeader at route-level + locale-free alternatives
// ---------------------------------------------------------------------------

describe("register.tsx — U-187: WelcomeHeader imported at route-level (DEC-352=A)", () => {
  it("imports WelcomeHeader component", () => {
    expect(registerSrc).toContain("WelcomeHeader");
    expect(registerSrc).toMatch(/from ["']~\/components\/WelcomeHeader["']/);
  });

  it("renders <WelcomeHeader handle={state.handle} /> in route component body", () => {
    // Must be rendered above or outside SectionA, at route level
    expect(registerSrc).toMatch(/<WelcomeHeader\s+handle=\{state\.handle\}/);
  });

  it("does NOT pass locale to generateAlternatives (DEC-357=D)", () => {
    // Old: generateAlternatives(handle, locale)
    // New: generateAlternatives(handle) — no locale arg
    expect(registerSrc).not.toMatch(/generateAlternatives\(handle,\s*locale\)/);
    // Must not reference navigator.language for locale detection
    expect(registerSrc).not.toMatch(/navigator\.language/);
  });
});

// ---------------------------------------------------------------------------
// U2 — Issue #142 mockup match: sub-copy literal + top-right link copy
// ---------------------------------------------------------------------------
//
// Visual checklist items 6 + 4 from issue tadaify-app#142:
//  - sub-copy reads "Your public URL will be:" (was "Your public URL:")
//  - top-right link reads "Log in →" (was "Already have an account? Sign in")
//
// Source: mockups/tadaify-mvp/register.html (canonical contract).
// ---------------------------------------------------------------------------

describe("register.tsx — U2-1: Section A sub-copy matches mockup (item 6)", () => {
  it("contains 'Your public URL will be:' literal", () => {
    expect(registerSrc).toContain("Your public URL will be:");
  });

  it("does NOT contain the old 'Your public URL:' preview-pane sub-copy", () => {
    // The preview-pane sub-copy was previously `Your public URL:{" "}` (with the
    // trailing colon literal followed by a JSX whitespace). After the fix it reads
    // `Your public URL will be:{" "}`. The form-field <label>Your public URL</label>
    // is a separate render and is unchanged.
    expect(registerSrc).not.toContain('Your public URL:{" "}');
    expect(registerSrc).toContain('Your public URL will be:{" "}');
  });
});

describe("register.tsx — U2-2: top-right auth-bar link reads 'Log in →' (item 4)", () => {
  it("contains 'Log in →' literal", () => {
    // Uses the actual right-arrow character (→ U+2192) per mockup register.html.
    expect(registerSrc).toContain("Log in →");
  });

  it("does NOT contain the old 'Already have an account?' / 'Sign in' copy", () => {
    expect(registerSrc).not.toContain("Already have an account?");
    // The old <strong>Sign in</strong> link is gone. Other "Sign in" mentions in
    // unrelated UI (e.g. provider button labels) are not on this auth-bar — but the
    // old copy was the ONLY use of the exact phrase, so a strict negative is safe.
    expect(registerSrc).not.toMatch(/<strong[^>]*>Sign in<\/strong>/);
  });

  it("link routes to /login (ECN-142-07)", () => {
    // The only <a href="/login"> in this route is the auth-bar Log in link.
    expect(registerSrc).toMatch(/href="\/login"/);
  });
});

// ---------------------------------------------------------------------------
// U2-3 — Visual checklist items 1, 2, 3, 5 wiring (mockup match)
//
// These items can be verified at the source level (CSS class + JSX shape).
// Runtime visual is covered by Playwright S1/S2/S4/S6.
// ---------------------------------------------------------------------------

describe("register.tsx — U2-3: visual checklist wiring", () => {
  it("preview-col aside has className 'preview-col' (radial overlay target — item 3)", () => {
    expect(registerSrc).toMatch(/className="preview-col-hide-mobile preview-col"/);
  });

  it("logo-corner div is present in preview pane (item 1 — MotionLogo wrapper)", () => {
    expect(registerSrc).toContain('className="logo-corner"');
    // Wrapper aria-hidden so the decorative logo doesn't double up in the AT tree
    expect(registerSrc).toMatch(/className="logo-corner"[\s\S]*?aria-hidden="true"/);
  });

  it("preview-thumb skeleton has className 'preview-thumb' (item 2)", () => {
    expect(registerSrc).toContain('className="preview-thumb"');
  });

  it("ThemeToggleButton is rendered in the auth-bar nav (item 5)", () => {
    expect(registerSrc).toContain("<ThemeToggleButton />");
    expect(registerSrc).toMatch(/from ["']~\/components\/ThemeToggleButton["']/);
  });

  it("inline <style> declares .preview-col::before radial overlay (item 3)", () => {
    expect(registerSrc).toContain(".preview-col::before");
    expect(registerSrc).toContain("radial-gradient");
  });

  it("inline <style> respects prefers-reduced-motion on .logo-corner (ECN-142-05)", () => {
    expect(registerSrc).toContain("prefers-reduced-motion: reduce");
    expect(registerSrc).toMatch(/\.logo-corner[\s\S]*?animation-play-state:\s*paused/);
  });
});
