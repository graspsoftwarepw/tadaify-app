/**
 * Unit tests for onboarding.profile.tsx — Step 3/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-003 / ECN-136-05 / ECN-136-06
 *
 * U1: validateDisplayName — required, max 80 chars
 * U2: validateBio — max 160 chars
 * U3: loader reads all accumulated URL params
 * U4: action returns error when name missing
 * U5: action returns error when bio too long
 * U6: action redirects to /onboarding/template with all params on success
 */

import { describe, it, expect } from "vitest";
import {
  validateDisplayName,
  validateBio,
  BIO_MAX_LENGTH,
  loader,
  action,
} from "./onboarding.profile";

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

// ── U1: validateDisplayName ───────────────────────────────────────────────────

describe("onboarding.profile — U1: validateDisplayName", () => {
  it("returns invalid for empty string", () => {
    expect(validateDisplayName("").valid).toBe(false);
  });

  it("returns invalid for whitespace-only string", () => {
    expect(validateDisplayName("   ").valid).toBe(false);
  });

  it("returns valid for typical name", () => {
    expect(validateDisplayName("Alice Smith").valid).toBe(true);
  });

  it("returns invalid when name exceeds 80 characters", () => {
    const longName = "A".repeat(81);
    const result = validateDisplayName(longName);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("returns valid for exactly 80 characters", () => {
    const name = "A".repeat(80);
    expect(validateDisplayName(name).valid).toBe(true);
  });

  it("returns error message when invalid", () => {
    const result = validateDisplayName("");
    expect(typeof result.message).toBe("string");
    expect(result.message!.length).toBeGreaterThan(0);
  });
});

// ── U2: validateBio ───────────────────────────────────────────────────────────

describe("onboarding.profile — U2: validateBio", () => {
  it("returns valid for empty bio (bio is optional)", () => {
    expect(validateBio("").valid).toBe(true);
  });

  it("returns valid for bio within limit", () => {
    expect(validateBio("Short bio.").valid).toBe(true);
  });

  it("returns invalid when bio exceeds max length", () => {
    const longBio = "A".repeat(BIO_MAX_LENGTH + 1);
    const result = validateBio(longBio);
    expect(result.valid).toBe(false);
    expect(result.message).toBeTruthy();
  });

  it("returns valid for exactly max length", () => {
    const bio = "A".repeat(BIO_MAX_LENGTH);
    expect(validateBio(bio).valid).toBe(true);
  });

  it("BIO_MAX_LENGTH is 160", () => {
    expect(BIO_MAX_LENGTH).toBe(160);
  });
});

// ── U3: loader ────────────────────────────────────────────────────────────────

describe("onboarding.profile — U3: loader", () => {
  it("returns all accumulated params from URL", async () => {
    const url =
      "/onboarding/profile?handle=alice&platforms=instagram&socials=%7B%7D&name=Alice&bio=Hello&av=";
    const req = makeRequest(url);
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
    expect(result.platforms).toBe("instagram");
    expect(result.prefillName).toBe("Alice");
    expect(result.prefillBio).toBe("Hello");
  });

  it("returns empty strings for missing params", async () => {
    const req = makeRequest("/onboarding/profile");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("");
    expect(result.prefillName).toBe("");
    expect(result.prefillBio).toBe("");
  });
});

// ── U4: action — name required ────────────────────────────────────────────────

describe("onboarding.profile — U4: action name required", () => {
  it("returns error when name is missing", async () => {
    const req = makeRequest("/onboarding/profile", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: "{}",
      name: "",
      bio: "",
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({
      error: { field: "name", message: expect.any(String) },
    });
    // Should NOT be a redirect
    expect(result).not.toBeInstanceOf(Response);
  });

  it("error message says 'Name is required'", async () => {
    const req = makeRequest("/onboarding/profile", "POST", {
      handle: "alice",
      platforms: "",
      socials: "",
      name: "",
      bio: "",
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never) as {
      error: { field: string; message: string };
    };
    expect(result.error.message).toMatch(/name/i);
  });
});

// ── U5: action — bio too long ─────────────────────────────────────────────────

describe("onboarding.profile — U5: action bio too long", () => {
  it("returns error when bio exceeds max length", async () => {
    const req = makeRequest("/onboarding/profile", "POST", {
      handle: "alice",
      platforms: "",
      socials: "",
      name: "Alice",
      bio: "A".repeat(BIO_MAX_LENGTH + 1),
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({
      error: { field: "bio", message: expect.any(String) },
    });
  });
});

// ── U6: action — success redirect ────────────────────────────────────────────

describe("onboarding.profile — U6: action success redirect", () => {
  it("redirects to /onboarding/template on valid input", async () => {
    const req = makeRequest("/onboarding/profile", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: '{"instagram":"alice_ig"}',
      name: "Alice Smith",
      bio: "Hello world",
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    expect(loc).toMatch(/^\/onboarding\/template/);
    expect(loc).toContain("name=Alice+Smith");
    expect(loc).toContain("handle=alice");
  });

  it("carries forward all accumulated params", async () => {
    const req = makeRequest("/onboarding/profile", "POST", {
      handle: "bob",
      platforms: "tiktok,youtube",
      socials: '{"tiktok":"bobdance"}',
      name: "Bob",
      bio: "Creator",
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const loc = res.headers.get("Location") ?? "";
    const u = new URL(`http://localhost${loc}`);
    expect(u.searchParams.get("handle")).toBe("bob");
    expect(u.searchParams.get("platforms")).toBe("tiktok,youtube");
    expect(u.searchParams.get("name")).toBe("Bob");
    expect(u.searchParams.get("bio")).toBe("Creator");
  });
});
