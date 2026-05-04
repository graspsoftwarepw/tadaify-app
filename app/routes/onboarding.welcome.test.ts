/**
 * Unit tests for onboarding.welcome.tsx — Step 1/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-001 / ECN-136-01 / ECN-136-02
 *
 * U1: loader reads ?handle param
 * U2: action with no platforms returns error
 * U3: action with valid platforms redirects to /onboarding/social
 * U4: action with skip intent redirects to /onboarding/profile
 * U5: isValidPlatformId correctly validates
 *
 * Bug #3 regression tests (issue tadaify-app#188):
 * U6: 9 platforms present in PLATFORM_LIST
 * U7: each platform has branded CSS vars defined in PLATFORM_COLORS
 */

import { describe, it, expect } from "vitest";
import { loader, action, isValidPlatformId, PLATFORM_LIST, PLATFORM_COLORS } from "./onboarding.welcome";

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
  it("redirects to /onboarding/profile on skip", async () => {
    const req = makeRequest("/onboarding/welcome", "POST", {
      handle: "alice",
      intent: "skip",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toMatch(/^\/onboarding\/profile/);
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

// ── U6: 9 platforms present (Bug #3 regression) ───────────────────────────────

describe("onboarding.welcome — U6: 9 platforms present (Bug #3)", () => {
  it("PLATFORM_LIST has exactly 9 entries", () => {
    expect(PLATFORM_LIST).toHaveLength(9);
  });

  it("all 9 expected platform ids are present", () => {
    const ids = PLATFORM_LIST.map((p) => p.id);
    const expected = [
      "instagram", "tiktok", "youtube", "x",
      "twitch", "spotify", "linkedin", "pinterest", "threads",
    ];
    for (const id of expected) {
      expect(ids).toContain(id);
    }
  });
});

// ── U7: branded CSS vars in PLATFORM_COLORS (Bug #3 regression) ───────────────

describe("onboarding.welcome — U7: PLATFORM_COLORS branded styling (Bug #3)", () => {
  const platforms = [
    { id: "instagram", a: "#F58529" },
    { id: "tiktok",    a: "#25F4EE" },
    { id: "youtube",   a: "#FF0000" },
    { id: "x",         a: "#000"    },
    { id: "twitch",    a: "#9146FF" },
    { id: "spotify",   a: "#1DB954" },
    { id: "linkedin",  a: "#0A66C2" },
    { id: "pinterest", a: "#E60023" },
    { id: "threads",   a: "#000"    },
  ];

  for (const { id, a } of platforms) {
    it(`PLATFORM_COLORS["${id}"].a matches brand hex ${a}`, () => {
      expect(PLATFORM_COLORS[id]).toBeDefined();
      expect(PLATFORM_COLORS[id].a).toBe(a);
    });
  }

  it("every platform in PLATFORM_LIST has a PLATFORM_COLORS entry", () => {
    for (const p of PLATFORM_LIST) {
      expect(PLATFORM_COLORS[p.id]).toBeDefined();
      expect(PLATFORM_COLORS[p.id]).toHaveProperty("a");
      expect(PLATFORM_COLORS[p.id]).toHaveProperty("b");
      expect(PLATFORM_COLORS[p.id]).toHaveProperty("c");
    }
  });
});
