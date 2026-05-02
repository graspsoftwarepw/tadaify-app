/**
 * Unit tests for onboarding.welcome.tsx — Step 1/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-001 / ECN-136-01 / ECN-136-02
 *
 * U1: loader reads ?handle param
 * U2: action with no platforms returns error
 * U3: action with valid platforms redirects to /onboarding/social
 * U4: action with skip intent redirects to /onboarding/template
 * U5: isValidPlatformId correctly validates
 */

import { describe, it, expect } from "vitest";
import { loader, action, isValidPlatformId, PLATFORM_LIST } from "./onboarding.welcome";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, string | string[]>
): Request {
  if (method === "GET") {
    return new Request(`http://localhost${path}`);
  }
  const fd = new FormData();
  if (body) {
    for (const [k, v] of Object.entries(body)) {
      if (Array.isArray(v)) {
        for (const item of v) fd.append(k, item);
      } else {
        fd.append(k, v);
      }
    }
  }
  return new Request(`http://localhost${path}`, { method: "POST", body: fd });
}

// ── U1: loader ─────────────────────────────────────────────────────────────────

describe("onboarding.welcome — U1: loader", () => {
  it("returns empty handle when no param", async () => {
    const req = makeRequest("/onboarding/welcome");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("");
  });

  it("returns handle from URL search param", async () => {
    const req = makeRequest("/onboarding/welcome?handle=alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
  });

  it("returns empty string for missing param (not undefined)", async () => {
    const req = makeRequest("/onboarding/welcome");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(typeof result.handle).toBe("string");
  });
});

// ── U2: action — validation ────────────────────────────────────────────────────

describe("onboarding.welcome — U2: action validation", () => {
  it("returns error when no platforms selected and intent=continue", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "alice",
      intent: "continue",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({ error: { message: expect.any(String) } });
  });

  it("returns error with invalid platform ids filtered out", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "alice",
      intent: "continue",
      platform: ["nonexistent_platform"],
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({ error: expect.objectContaining({ message: expect.any(String) }) });
  });
});

// ── U3: action — happy path redirect ──────────────────────────────────────────

describe("onboarding.welcome — U3: action redirect", () => {
  it("redirects to /onboarding/social with platforms on valid selection", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "alice",
      intent: "continue",
      platform: ["instagram", "youtube"],
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    // redirect() returns a Response with status 302
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location).toMatch(/^\/onboarding\/social/);
    expect(location).toContain("handle=alice");
    expect(location).toContain("platforms=");
    expect(location).toContain("instagram");
  });

  it("preserves handle in redirect URL", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "bob-creator",
      intent: "continue",
      platform: ["tiktok"],
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.headers.get("Location")).toContain("handle=bob-creator");
  });
});

// ── U4: action — skip intent ───────────────────────────────────────────────────

describe("onboarding.welcome — U4: skip intent", () => {
  it("redirects to /onboarding/template on skip", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "alice",
      intent: "skip",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toMatch(/^\/onboarding\/template/);
  });

  it("skip preserves handle in redirect", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "test-handle",
      intent: "skip",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.headers.get("Location")).toContain("handle=test-handle");
  });
});

// ── U5: isValidPlatformId ──────────────────────────────────────────────────────

describe("onboarding.welcome — U5: isValidPlatformId", () => {
  it("returns true for all preset platform ids", () => {
    for (const p of PLATFORM_LIST) {
      expect(isValidPlatformId(p.id)).toBe(true);
    }
  });

  it("returns false for unknown platform id", () => {
    expect(isValidPlatformId("fakebook")).toBe(false);
    expect(isValidPlatformId("")).toBe(false);
    expect(isValidPlatformId("INSTAGRAM")).toBe(false); // case-sensitive
  });
});
