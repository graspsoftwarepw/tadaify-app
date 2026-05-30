/**
 * Unit tests for onboarding.complete.tsx — Celebration screen
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-006 / DEC-311=A / DEC-332=D / DEC-366=A
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-complete.html (Slice C, 2026-04-29)
 *
 * DEC-332=D: page-coming-soon semantics — loader returns data, component renders
 *   with "all set" copy (not "live"). Page is not yet published at this step.
 *
 * DEC-366=A: action redirects directly to /app.
 *
 * U8a: loader returns page data when handle param is present
 * U8b: loader returns 302 redirect to /app when handle is absent (invalid deep-link)
 * U8c: action returns 302 redirect to /app
 * U8d: component default export is present (celebration UI re-added per mockup refresh)
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

// ── U8a: loader returns page data when handle is present ──────────────────────

describe("onboarding.complete — U8a: loader returns page data (handle present)", () => {
  it("loader returns handle and accumulated state fields", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=alice&name=Alice&tpl=chopin");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // Must NOT be a redirect Response when handle is present
    expect(result).not.toBeInstanceOf(Response);
    const data = result as Record<string, unknown>;
    expect(data.handle).toBe("alice");
    expect(data.name).toBe("Alice");
    expect(data.tpl).toBe("chopin");
  });

  it("loader returns empty strings for optional absent params", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=bob");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result).not.toBeInstanceOf(Response);
    const data = result as Record<string, unknown>;
    expect(data.handle).toBe("bob");
    expect(data.name).toBe("");
    expect(data.bio).toBe("");
    expect(data.av).toBe("");
    expect(data.platforms).toBe("");
    expect(data.tpl).toBe("");
  });

  it("loader does NOT read tier param (DEC-311=A: tier field absent from returned data)", async () => {
    const req = makeGetRequest("/onboarding/complete?handle=alice&tier=premium");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    const data = result as Record<string, unknown>;
    expect(data.tier).toBeUndefined();
  });
});

// ── U8b: loader returns 302 redirect when handle is absent (DEC-366=A guard) ──

describe("onboarding.complete — U8b: loader redirects to /app when handle absent", () => {
  it("loader redirects to /app when no handle param is present", async () => {
    const req = makeGetRequest("/onboarding/complete");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("loader redirects to /app for stale deep-link with only tier param", async () => {
    const req = makeGetRequest("/onboarding/complete?tier=free");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });
});

// ── U8c: action returns 302 redirect to /app (DEC-366=A) ─────────────────────

describe("onboarding.complete — U8c: action returns 302 redirect (DEC-366=A)", () => {
  it("action redirects to /app on form submission", async () => {
    const req = makePostRequest("/onboarding/complete?handle=alice");
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("action does NOT redirect to /onboarding/complete or /dashboard", async () => {
    const req = makePostRequest("/onboarding/complete");
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const location = res.headers.get("Location") ?? "";
    expect(location).toBe("/app");
    expect(location).not.toContain("/onboarding/complete");
    expect(location).not.toContain("/dashboard");
  });
});

// ── U8d: component default export present (celebration UI restored) ───────────

describe("onboarding.complete — U8d: default export present (mockup refresh)", () => {
  it("module has a default export component (celebration UI re-added per onboarding-complete-mockup refresh)", async () => {
    const mod = await import("./onboarding.complete");
    expect((mod as Record<string, unknown>).default).toBeDefined();
    expect(typeof (mod as Record<string, unknown>).default).toBe("function");
  });
});
