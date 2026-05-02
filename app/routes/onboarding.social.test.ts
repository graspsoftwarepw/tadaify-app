/**
 * Unit tests for onboarding.social.tsx — Step 2/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-002 / ECN-136-03 / ECN-136-04
 *
 * U1: parsePlatforms parses CSV correctly
 * U2: parseSocials parses JSON correctly (and handles invalid JSON)
 * U3: buildSocialsParam encodes non-empty entries
 * U4: validateSocialEntry validates length + empty
 * U5: loader pre-fills from URL params
 * U6: action skip redirects to /onboarding/profile
 * U7: action continue redirects with socials encoded
 */

import { describe, it, expect } from "vitest";
import {
  parsePlatforms,
  parseSocials,
  buildSocialsParam,
  validateSocialEntry,
  loader,
  action,
} from "./onboarding.social";

// ── Helpers ────────────────────────────────────────────────────────────────────

function makeRequest(
  path: string,
  method: "GET" | "POST" = "GET",
  body?: Record<string, string>
): Request {
  if (method === "GET") {
    return new Request(`http://localhost${path}`);
  }
  const fd = new FormData();
  if (body) {
    for (const [k, v] of Object.entries(body)) fd.append(k, v);
  }
  return new Request(`http://localhost${path}`, { method: "POST", body: fd });
}

// ── U1: parsePlatforms ─────────────────────────────────────────────────────────

describe("onboarding.social — U1: parsePlatforms", () => {
  it("returns empty array for null input", () => {
    expect(parsePlatforms(null)).toEqual([]);
  });

  it("returns empty array for empty string", () => {
    expect(parsePlatforms("")).toEqual([]);
  });

  it("parses valid platform ids", () => {
    const result = parsePlatforms("instagram,youtube");
    expect(result).toContain("instagram");
    expect(result).toContain("youtube");
    expect(result).toHaveLength(2);
  });

  it("filters out invalid platform ids", () => {
    const result = parsePlatforms("instagram,fakebook,youtube");
    expect(result).toContain("instagram");
    expect(result).toContain("youtube");
    expect(result).not.toContain("fakebook");
    expect(result).toHaveLength(2);
  });
});

// ── U2: parseSocials ──────────────────────────────────────────────────────────

describe("onboarding.social — U2: parseSocials", () => {
  it("returns empty object for null input", () => {
    expect(parseSocials(null)).toEqual({});
  });

  it("returns empty object for invalid JSON", () => {
    expect(parseSocials("not-json")).toEqual({});
  });

  it("returns empty object for JSON array", () => {
    expect(parseSocials(JSON.stringify([1, 2, 3]))).toEqual({});
  });

  it("parses valid JSON object with string values", () => {
    const result = parseSocials(JSON.stringify({ instagram: "myname", youtube: "channel" }));
    expect(result).toEqual({ instagram: "myname", youtube: "channel" });
  });

  it("ignores non-string values in JSON", () => {
    const result = parseSocials(JSON.stringify({ instagram: "myname", count: 42 }));
    expect(result).not.toHaveProperty("count");
    expect(result.instagram).toBe("myname");
  });
});

// ── U3: buildSocialsParam ─────────────────────────────────────────────────────

describe("onboarding.social — U3: buildSocialsParam", () => {
  it("excludes empty/whitespace values", () => {
    const result = buildSocialsParam({ instagram: "alice", youtube: "  ", tiktok: "" });
    const parsed = JSON.parse(result) as Record<string, string>;
    expect(parsed).toHaveProperty("instagram", "alice");
    expect(parsed).not.toHaveProperty("youtube");
    expect(parsed).not.toHaveProperty("tiktok");
  });

  it("trims whitespace from values", () => {
    const result = buildSocialsParam({ instagram: "  alice  " });
    const parsed = JSON.parse(result) as Record<string, string>;
    expect(parsed.instagram).toBe("alice");
  });

  it("returns valid JSON string", () => {
    const result = buildSocialsParam({ instagram: "alice" });
    expect(() => JSON.parse(result)).not.toThrow();
  });
});

// ── U4: validateSocialEntry ───────────────────────────────────────────────────

describe("onboarding.social — U4: validateSocialEntry", () => {
  it("returns invalid for empty string", () => {
    expect(validateSocialEntry("").valid).toBe(false);
  });

  it("returns invalid for whitespace-only string", () => {
    expect(validateSocialEntry("   ").valid).toBe(false);
  });

  it("returns valid for normal handle", () => {
    expect(validateSocialEntry("alice123").valid).toBe(true);
  });

  it("returns invalid for string exceeding max length", () => {
    const longString = "a".repeat(201);
    expect(validateSocialEntry(longString).valid).toBe(false);
  });

  it("returns valid message when invalid", () => {
    const result = validateSocialEntry("");
    expect(result.valid).toBe(false);
    expect(typeof result.message).toBe("string");
  });
});

// ── U5: loader ────────────────────────────────────────────────────────────────

describe("onboarding.social — U5: loader", () => {
  it("returns handle, platforms, existingSocials from URL", async () => {
    const socials = JSON.stringify({ instagram: "alice" });
    const url = `/onboarding/social?handle=alice&platforms=instagram,youtube&socials=${encodeURIComponent(socials)}`;
    const req = makeRequest(url);
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
    expect(result.platforms).toContain("instagram");
    expect(result.existingSocials).toMatchObject({ instagram: "alice" });
  });
});

// ── U6: action — skip ─────────────────────────────────────────────────────────

describe("onboarding.social — U6: action skip", () => {
  it("redirects to /onboarding/profile on skip", async () => {
    const req = makeRequest("/onboarding/social", "POST", {
      handle: "alice",
      platforms: "instagram",
      intent: "skip",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toMatch(/^\/onboarding\/profile/);
    expect(res.headers.get("Location")).toContain("handle=alice");
  });
});

// ── U7: action — continue with socials ───────────────────────────────────────

describe("onboarding.social — U7: action continue", () => {
  it("redirects to /onboarding/profile with socials param when handles entered", async () => {
    const req = makeRequest("/onboarding/social", "POST", {
      handle: "alice",
      platforms: "instagram,youtube",
      intent: "continue",
      social_instagram: "alice_ig",
      social_youtube: "alicetv",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    expect(loc).toMatch(/^\/onboarding\/profile/);
    expect(loc).toContain("socials=");
    // Decode and verify socials content
    const u = new URL(`http://localhost${loc}`);
    const socials = JSON.parse(u.searchParams.get("socials") ?? "{}") as Record<string, string>;
    expect(socials.instagram).toBe("alice_ig");
    expect(socials.youtube).toBe("alicetv");
  });

  it("redirects without socials param when all fields empty", async () => {
    const req = makeRequest("/onboarding/social", "POST", {
      handle: "alice",
      platforms: "instagram",
      intent: "continue",
      social_instagram: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    // socials param absent or empty when nothing filled
    const u = new URL(`http://localhost${loc}`);
    expect(u.searchParams.has("socials")).toBe(false);
  });
});
