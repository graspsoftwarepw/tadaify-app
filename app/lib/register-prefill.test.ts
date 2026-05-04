/**
 * Unit tests for app/lib/register-prefill.ts
 * Run: npx vitest run app/lib/register-prefill.test.ts
 * Story: issue tadaify-app#176 — /register?email= prefill from /login CTA.
 * Covers: BR-AUTH-05, TR-AUTH-01
 */

import { describe, it, expect } from "vitest";
import { normalizePrefillEmail } from "./register-prefill";

describe("normalizePrefillEmail — register prefill from ?email= query", () => {
  it("pre-fills email input from `?email=` query param on first render", () => {
    // Happy path: a normal valid email survives the URL round-trip and is
    // normalised (trim + lowercase) so SET_EMAIL receives a canonical value.
    expect(normalizePrefillEmail("User@Example.COM")).toBe("user@example.com");
    expect(normalizePrefillEmail("  user@example.com  ")).toBe("user@example.com");
  });

  it("ignores `?email=` param when value is malformed", () => {
    // Defensive: URL-tampered or typo'd values must NOT crash, must NOT prefill.
    expect(normalizePrefillEmail("not-an-email")).toBeNull();
    expect(normalizePrefillEmail("javascript:alert(1)")).toBeNull();
    expect(normalizePrefillEmail("@example.com")).toBeNull();
    expect(normalizePrefillEmail("")).toBeNull();
    expect(normalizePrefillEmail(null)).toBeNull();
    expect(normalizePrefillEmail(undefined)).toBeNull();
  });
});
