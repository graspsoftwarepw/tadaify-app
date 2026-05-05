/**
 * Unit tests for onboarding.complete.tsx — DEC-366=A SSR redirect handler
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-006 / DEC-311=A / DEC-332=D / DEC-366=A
 *
 * DEC-366=A (2026-05-05): loader + action both redirect to /app.
 * No UI render — the intermediate "tada! 🎉" celebration screen is removed.
 * Tests updated per issue tadaify-app#190 (Bug #4 / U8 entries).
 *
 * U8a: loader returns 302 redirect to /app, not page data
 * U8b: action returns 302 redirect to /app
 *
 * Legacy U1-U4 tests (loader returning handle/tier fields) are replaced —
 * the loader no longer reads URL params, it just redirects.
 */

import { describe, it, expect } from "vitest";
import { loader, action } from "./onboarding.complete";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeGetRequest(path: string): Request {
  return new Request(`http://localhost${path}`);
}

function makePostRequest(path: string): Request {
  return new Request(`http://localhost${path}`, { method: "POST", body: new FormData() });
}

// ── U8a: loader returns 302 redirect, no page data (DEC-366=A) ───────────────
// Covers Bug #4 / U8 from issue tadaify-app#190

describe("onboarding.complete — U8a: loader returns 302 redirect (DEC-366=A)", () => {
  it("loader returns 302 redirect to /app, NOT page data", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=alice&tier=free");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const location = res.headers.get("Location");
    expect(location).toBe("/app");
  });

  it("loader redirects to /app even with no query params", async () => {
    const req = makeGetRequest("/onboarding/complete");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("loader redirects to /app regardless of tier param (DEC-311=A no longer applies — DEC-366=A supersedes)", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=alice&tier=premium");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("loader does NOT return handle, tier, or any page data", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=alice&tier=free&name=Alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // result must be a Response (redirect), not a plain object with page data
    expect(result).toBeInstanceOf(Response);
    // It must NOT be a plain object with data fields
    const maybeObj = result as Record<string, unknown>;
    expect(maybeObj.handle).toBeUndefined();
    expect(maybeObj.tier).toBeUndefined();
    expect(maybeObj.name).toBeUndefined();
  });
});

// ── U8b: action returns 302 redirect to /app (DEC-366=A) ─────────────────────
// Covers Bug #4 / U8 from issue tadaify-app#190

describe("onboarding.complete — U8b: action returns 302 redirect (DEC-366=A)", () => {
  it("action redirects to /app on success, no UI render", async () => {
    const req = makePostRequest("/onboarding/complete");
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("action does NOT redirect to /onboarding/complete or any other path", async () => {
    const req = makePostRequest("/onboarding/complete");
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const location = res.headers.get("Location") ?? "";
    expect(location).toBe("/app");
    expect(location).not.toContain("/onboarding/complete");
    expect(location).not.toContain("/dashboard");
  });
});

// ── Regression-lock: celebration screen copy absent from source ───────────────

describe("onboarding.complete — regression-lock: celebration UI removed (DEC-366=A)", () => {
  it("source has no default export component (no UI render)", async () => {
    const mod = await import("./onboarding.complete");
    // DEC-366=A: no default export — route is pure SSR redirect handler
    expect((mod as Record<string, unknown>).default).toBeUndefined();
  });
});
