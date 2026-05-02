/**
 * Unit tests for onboarding.complete.tsx — Post-wizard success screen
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-006 / DEC-311=A / DEC-332=D
 *
 * U1: loader reads handle and tier from URL
 * U2: loader enforces tier=free regardless of URL value (DEC-311=A)
 * U3: loader reads all accumulated state fields
 * U4: loader handles empty/missing params gracefully
 */

import { describe, it, expect } from "vitest";
import { loader } from "./onboarding.complete";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(path: string): Request {
  return new Request(`http://localhost${path}`);
}

// ── U1: loader reads handle and tier ──────────────────────────────────────────

describe("onboarding.complete — U1: loader handle + tier", () => {
  it("reads handle from URL", async () => {
    const req = makeRequest("/onboarding/complete?handle=alice&tier=free");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
  });

  it("reads tier=free from URL", async () => {
    const req = makeRequest("/onboarding/complete?handle=alice&tier=free");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.tier).toBe("free");
  });
});

// ── U2: loader enforces free tier ────────────────────────────────────────────

describe("onboarding.complete — U2: tier always free (DEC-311=A)", () => {
  it("returns tier=free even when URL has tier=premium", async () => {
    const req = makeRequest("/onboarding/complete?handle=alice&tier=premium");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // DEC-311=A: loader normalises any tier value to "free"
    expect(result.tier).toBe("free");
  });

  it("returns tier=free when tier param absent", async () => {
    const req = makeRequest("/onboarding/complete?handle=alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.tier).toBe("free");
  });

  it("returns tier=free for tier=creator", async () => {
    const req = makeRequest("/onboarding/complete?handle=alice&tier=creator");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.tier).toBe("free");
  });
});

// ── U3: loader reads accumulated state ───────────────────────────────────────

describe("onboarding.complete — U3: accumulated state", () => {
  it("reads all accumulated URL params", async () => {
    const socials = encodeURIComponent('{"instagram":"alice"}');
    const url =
      `/onboarding/complete?handle=alice&tier=free&tpl=neon&name=Alice+Smith` +
      `&bio=Hello&av=&platforms=instagram&socials=${socials}`;
    const req = makeRequest(url);
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
    expect(result.tier).toBe("free");
    expect(result.tpl).toBe("neon");
    expect(result.name).toBe("Alice Smith");
    expect(result.bio).toBe("Hello");
    expect(result.platforms).toBe("instagram");
  });
});

// ── U4: loader handles empty/missing params ───────────────────────────────────

describe("onboarding.complete — U4: empty/missing params", () => {
  it("returns empty strings for all missing params", async () => {
    const req = makeRequest("/onboarding/complete");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("");
    expect(result.tier).toBe("free"); // DEC-311=A default
    expect(result.tpl).toBe("");
    expect(result.name).toBe("");
    expect(result.bio).toBe("");
  });

  it("returns handle=test-136 from URL param (Playwright S5 pattern)", async () => {
    const req = makeRequest(
      "/onboarding/complete?handle=test-136&tier=free&tpl=chopin&name=Test+User"
    );
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("test-136");
    expect(result.tier).toBe("free");
    expect(result.name).toBe("Test User");
  });
});
