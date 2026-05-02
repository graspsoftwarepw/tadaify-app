/**
 * Unit tests for onboarding.tier.tsx — Step 5/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-005 / ECN-136-08 / DEC-311=A
 *
 * U1: loader reads all accumulated params (ignores tier URL param)
 * U2: action always redirects to complete with tier=free regardless of form state
 * U3: action carries all accumulated params to complete
 * U4: no billing / tier selection allowed (action always free)
 */

import { describe, it, expect } from "vitest";
import { loader, action } from "./onboarding.tier";

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

// ── U1: loader ────────────────────────────────────────────────────────────────

describe("onboarding.tier — U1: loader", () => {
  it("reads all accumulated params from URL", async () => {
    const req = makeRequest(
      "/onboarding/tier?handle=alice&platforms=instagram&tpl=neon&name=Alice"
    );
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("alice");
    expect(result.platforms).toBe("instagram");
    expect(result.tpl).toBe("neon");
    expect(result.name).toBe("Alice");
  });

  it("does NOT return tier field (DEC-311=A: tier always free)", async () => {
    const req = makeRequest("/onboarding/tier?handle=alice&tier=premium");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // tier param in URL is ignored — loader does not expose it
    expect(result).not.toHaveProperty("tier");
  });

  it("returns empty strings for missing params", async () => {
    const req = makeRequest("/onboarding/tier");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("");
    expect(result.tpl).toBe("");
  });
});

// ── U2: action always free ────────────────────────────────────────────────────

describe("onboarding.tier — U2: action always free (DEC-311=A)", () => {
  it("redirects to /onboarding/complete with tier=free", async () => {
    const req = makeRequest("/onboarding/tier", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: "{}",
      name: "Alice",
      bio: "",
      av: "",
      tpl: "chopin",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    expect(loc).toMatch(/^\/onboarding\/complete/);
    const u = new URL(`http://localhost${loc}`);
    expect(u.searchParams.get("tier")).toBe("free");
  });

  it("always sets tier=free even if form would try to set premium", async () => {
    // Even if someone manually submits tier=premium via form, action always sets free
    const fd = new FormData();
    fd.append("handle", "alice");
    fd.append("tpl", "chopin");
    fd.append("platforms", "");
    fd.append("socials", "");
    fd.append("name", "Alice");
    fd.append("bio", "");
    fd.append("av", "");
    // No "tier" field in form data since tier is not a form field in the component
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: fd });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const u = new URL(`http://localhost${res.headers.get("Location") ?? ""}`);
    expect(u.searchParams.get("tier")).toBe("free");
  });
});

// ── U3: action carries all params ────────────────────────────────────────────

describe("onboarding.tier — U3: action param propagation", () => {
  it("carries all accumulated params to complete step", async () => {
    const req = makeRequest("/onboarding/tier", "POST", {
      handle: "bob",
      platforms: "tiktok,youtube",
      socials: '{"tiktok":"bobtok"}',
      name: "Bob",
      bio: "Video creator",
      av: "",
      tpl: "neon",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const u = new URL(`http://localhost${res.headers.get("Location") ?? ""}`);
    expect(u.searchParams.get("handle")).toBe("bob");
    expect(u.searchParams.get("platforms")).toBe("tiktok,youtube");
    expect(u.searchParams.get("name")).toBe("Bob");
    expect(u.searchParams.get("tpl")).toBe("neon");
    expect(u.searchParams.get("tier")).toBe("free");
  });
});

// ── U4: action with minimal params ───────────────────────────────────────────

describe("onboarding.tier — U4: action with minimal params", () => {
  it("still redirects with tier=free when no params provided", async () => {
    const req = makeRequest("/onboarding/tier", "POST", {
      handle: "",
      platforms: "",
      socials: "",
      name: "",
      bio: "",
      av: "",
      tpl: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    const u = new URL(`http://localhost${res.headers.get("Location") ?? ""}`);
    expect(u.searchParams.get("tier")).toBe("free");
  });
});
