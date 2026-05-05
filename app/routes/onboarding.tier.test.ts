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
 *
 * Bug #6a regression tests (issue tadaify-app#188):
 * U5: submit button text matches /Take me to my page/
 *
 * Bug #6b regression tests (issue tadaify-app#188):
 * U6: displayed Creator price equals CREATOR_PRICE_MONTHLY constant (no hard-coded $9)
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { loader, action } from "./onboarding.tier";
import { CREATOR_PRICE_MONTHLY, PRO_PRICE_MONTHLY, BUSINESS_PRICE_MONTHLY } from "~/lib/tier-gate";

const tierSrc = readFileSync(
  fileURLToPath(new URL("./onboarding.tier.tsx", import.meta.url)),
  "utf8",
);

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

// ── U5: submit button text — Bug #6a regression (issue tadaify-app#188) ──────

describe("onboarding.tier — U5: submit button text (Bug #6a)", () => {
  it("source contains button text matching /Take me to my page/", () => {
    expect(tierSrc).toMatch(/Take me to my page/);
  });

  it("source does NOT contain old 'Start for free →' button text", () => {
    expect(tierSrc).not.toContain("Start for free");
  });
});

// ── U6: Creator price == CREATOR_PRICE_MONTHLY constant — Bug #6b ────────────

describe("onboarding.tier — U6: Creator price single source of truth (Bug #6b)", () => {
  it("CREATOR_PRICE_MONTHLY constant is defined", () => {
    expect(CREATOR_PRICE_MONTHLY).toBeTruthy();
    expect(typeof CREATOR_PRICE_MONTHLY).toBe("string");
  });

  it("source does NOT hard-code '$9' as Creator price (must use CREATOR_PRICE_MONTHLY)", () => {
    expect(tierSrc).toContain("CREATOR_PRICE_MONTHLY");
    expect(tierSrc).not.toMatch(/price:\s*["']\$9["']/);
  });

  it("source does NOT hard-code Pro/Business prices (must import from tier-gate)", () => {
    // No local const PRO_PRICE or BUSINESS_PRICE with hard-coded dollar values
    expect(tierSrc).not.toMatch(/const\s+PRO_PRICE_MONTHLY\s*=/);
    expect(tierSrc).not.toMatch(/const\s+BUSINESS_PRICE_MONTHLY\s*=/);
    // Imports must come from tier-gate
    expect(tierSrc).toContain("PRO_PRICE_MONTHLY");
    expect(tierSrc).toContain("BUSINESS_PRICE_MONTHLY");
  });

  it("CREATOR_PRICE_MONTHLY equals $7.99 per DEC-279/287", () => {
    expect(CREATOR_PRICE_MONTHLY).toBe("$7.99");
  });

  it("PRO_PRICE_MONTHLY equals $19.99 per DEC-279/287", () => {
    expect(PRO_PRICE_MONTHLY).toBe("$19.99");
  });

  it("BUSINESS_PRICE_MONTHLY equals $49.99 per DEC-279/287", () => {
    expect(BUSINESS_PRICE_MONTHLY).toBe("$49.99");
  });
});

// ── U7: hard-coded $9 NOT rendered (Bug #6b regression-lock) — issue tadaify-app#188 ─────────

describe("onboarding.tier — U7: hard-coded $9 price is NOT rendered (Bug #6b)", () => {
  it("hard-coded $9 price is NOT rendered (regression-lock dual-source bug)", () => {
    // Before the fix, tier page hard-coded "$9" for Creator.
    // After fix, only CREATOR_PRICE_MONTHLY ("$7.99") may appear as Creator price.
    // "$9" must not appear as a bare string-literal price in the source.
    expect(tierSrc).not.toMatch(/price:\s*["']\$9["']/);
    // Also must not appear as standalone price display string
    expect(tierSrc).not.toMatch(/>\s*\$9\s*</);
  });

  it("source contains CREATOR_PRICE_MONTHLY as the Creator price (not a hard-coded value)", () => {
    // The CREATOR_PRICE_MONTHLY constant must be imported and used
    expect(tierSrc).toContain("CREATOR_PRICE_MONTHLY");
    expect(tierSrc).toMatch(/from ["']~\/lib\/tier-gate["']/);
  });
});

// ── U8: no "coming in a future update" copy on tier page (Bug #6d) — issue tadaify-app#188 ────

describe("onboarding.tier — U8: no deferred-feature copy (Bug #6d)", () => {
  it("tier page does not render 'coming in a future update' deferred-feature copy", () => {
    expect(tierSrc).not.toMatch(/coming in a future update/i);
  });

  it("source does not contain 'Live preview' deferred right-pane copy on tier step", () => {
    // The previous stub rendered "Live preview · Coming in a future update."
    expect(tierSrc).not.toMatch(/Live preview[\s·]*Coming/i);
  });
});
