/**
 * U1 — unit tests for getWelcomeCopy (DEC-358=B, tadaify-app#196)
 *
 * Tests per issue body:
 *  U1-1: "section A returns 'Hey @{handle} 👋'"
 *  U1-2: "section B returns 'Hey @{handle} 👋'"
 *  U1-3: "section B-email returns 'Hey @{handle} 👋'"
 *  U1-4: "section B-otp returns '@{handle}, almost there...'"
 *  U1-5: "section B-password-toggle returns '@{handle}, almost there...'"
 *  U1-6: "section C returns 'Welcome @{handle}!'"
 *  U1-7: "interpolates handle correctly"
 */

import { describe, it, expect } from "vitest";
import { getWelcomeCopy } from "./register-welcome-copy";

const HANDLE = "tadaify_user";

describe("getWelcomeCopy — section A/B/B-email → Hey greeting", () => {
  it("section A returns 'Hey @{handle} 👋'", () => {
    expect(getWelcomeCopy("A", HANDLE)).toBe(`Hey @${HANDLE} 👋`);
  });

  it("section B returns 'Hey @{handle} 👋'", () => {
    expect(getWelcomeCopy("B", HANDLE)).toBe(`Hey @${HANDLE} 👋`);
  });

  it("section B-email returns 'Hey @{handle} 👋'", () => {
    expect(getWelcomeCopy("B-email", HANDLE)).toBe(`Hey @${HANDLE} 👋`);
  });
});

describe("getWelcomeCopy — section B-otp / B-password-toggle → almost there", () => {
  it("section B-otp returns '@{handle}, almost there...'", () => {
    expect(getWelcomeCopy("B-otp", HANDLE)).toBe(`@${HANDLE}, almost there...`);
  });

  it("section B-password-toggle returns '@{handle}, almost there...'", () => {
    expect(getWelcomeCopy("B-password-toggle", HANDLE)).toBe(`@${HANDLE}, almost there...`);
  });
});

describe("getWelcomeCopy — section C → Welcome", () => {
  it("section C returns 'Welcome @{handle}!'", () => {
    expect(getWelcomeCopy("C", HANDLE)).toBe(`Welcome @${HANDLE}!`);
  });
});

describe("getWelcomeCopy — handle interpolation", () => {
  it("interpolates handle correctly for each copy variant", () => {
    const h = "janedoe";
    expect(getWelcomeCopy("A", h)).toContain(`@${h}`);
    expect(getWelcomeCopy("B-otp", h)).toContain(`@${h}`);
    expect(getWelcomeCopy("C", h)).toContain(`@${h}`);
  });
});
