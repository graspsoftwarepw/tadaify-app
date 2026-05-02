/**
 * Unit tests for onboarding.template.tsx — Step 4/5
 *
 * Story: F-ONBOARDING-001a
 * Covers: BR-ONBOARDING-004 / ECN-136-07
 *
 * U1: isValidTemplateId validates preset list
 * U2: loader reads selectedTemplate from URL
 * U3: action returns error when tpl missing
 * U4: action returns error for invalid tpl id
 * U5: action redirects to /onboarding/tier with all params
 */

import { describe, it, expect } from "vitest";
import {
  isValidTemplateId,
  PRESET_TEMPLATES,
  loader,
  action,
} from "./onboarding.template";

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

// ── U1: isValidTemplateId ─────────────────────────────────────────────────────

describe("onboarding.template — U1: isValidTemplateId", () => {
  it("returns true for all preset template ids", () => {
    for (const t of PRESET_TEMPLATES) {
      expect(isValidTemplateId(t.id)).toBe(true);
    }
  });

  it("returns false for unknown id", () => {
    expect(isValidTemplateId("rainbow")).toBe(false);
    expect(isValidTemplateId("")).toBe(false);
  });

  it("has 6 preset templates", () => {
    expect(PRESET_TEMPLATES).toHaveLength(6);
  });
});

// ── U2: loader ────────────────────────────────────────────────────────────────

describe("onboarding.template — U2: loader", () => {
  it("returns selectedTemplate from URL param", async () => {
    const req = makeRequest("/onboarding/template?handle=alice&tpl=neon");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBe("neon");
  });

  it("returns null selectedTemplate for invalid tpl param", async () => {
    const req = makeRequest("/onboarding/template?tpl=invalidtpl");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBeNull();
  });

  it("returns null selectedTemplate when tpl absent", async () => {
    const req = makeRequest("/onboarding/template");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBeNull();
  });
});

// ── U3: action — tpl required ────────────────────────────────────────────────

describe("onboarding.template — U3: action tpl required", () => {
  it("returns error when tpl is missing", async () => {
    const req = makeRequest("/onboarding/template", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: "{}",
      name: "Alice",
      bio: "",
      av: "",
      tpl: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({ error: { message: expect.any(String) } });
    expect(result).not.toBeInstanceOf(Response);
  });
});

// ── U4: action — invalid tpl id ───────────────────────────────────────────────

describe("onboarding.template — U4: action invalid tpl", () => {
  it("returns error for invalid template id", async () => {
    const req = makeRequest("/onboarding/template", "POST", {
      handle: "alice",
      tpl: "notarealtemplate",
      platforms: "",
      socials: "",
      name: "Alice",
      bio: "",
      av: "",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toMatchObject({ error: { message: expect.any(String) } });
  });
});

// ── U5: action — success redirect ────────────────────────────────────────────

describe("onboarding.template — U5: action success", () => {
  it("redirects to /onboarding/tier on valid tpl", async () => {
    const req = makeRequest("/onboarding/template", "POST", {
      handle: "alice",
      platforms: "instagram",
      socials: '{"instagram":"alice"}',
      name: "Alice Smith",
      bio: "Creator",
      av: "",
      tpl: "chopin",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const loc = res.headers.get("Location") ?? "";
    expect(loc).toMatch(/^\/onboarding\/tier/);
    expect(loc).toContain("tpl=chopin");
  });

  it("carries all accumulated params to tier step", async () => {
    const socials = encodeURIComponent('{"instagram":"alice"}');
    const req = makeRequest("/onboarding/template", "POST", {
      handle: "alice",
      platforms: "instagram,youtube",
      socials: '{"instagram":"alice"}',
      name: "Alice",
      bio: "Hello",
      av: "",
      tpl: "neon",
    });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const u = new URL(`http://localhost${res.headers.get("Location") ?? ""}`);
    expect(u.searchParams.get("handle")).toBe("alice");
    expect(u.searchParams.get("platforms")).toBe("instagram,youtube");
    expect(u.searchParams.get("name")).toBe("Alice");
    expect(u.searchParams.get("tpl")).toBe("neon");
  });
});
