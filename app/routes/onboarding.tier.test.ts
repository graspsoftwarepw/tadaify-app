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

// ── U2: action redirects to /app (DEC-366=A — supersedes DEC-311=A intermediate) ─────────

describe("onboarding.tier — U2: action redirects to /app (DEC-366=A)", () => {
  it("action returns 302 redirect to /app regardless of form data", async () => {
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
    // DEC-366=A: goes directly to /app, not /onboarding/complete
    expect(loc).toBe("/app");
    expect(loc).not.toContain("/onboarding/complete");
  });

  it("action always redirects to /app even with empty form (DEC-366=A)", async () => {
    const fd = new FormData();
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: fd });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });
});

// ── U3: loader still reads params (for back-link) ────────────────────────────

describe("onboarding.tier — U3: loader reads params for back-link", () => {
  it("loader still reads handle and other params (used for back-link URL)", async () => {
    const req = makeRequest(
      "/onboarding/tier?handle=bob&platforms=tiktok%2Cyoutube&name=Bob&tpl=neon"
    );
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.handle).toBe("bob");
    expect(result.platforms).toBe("tiktok,youtube");
    expect(result.name).toBe("Bob");
    expect(result.tpl).toBe("neon");
  });
});

// ── U4: action ignores all form state ────────────────────────────────────────

describe("onboarding.tier — U4: action ignores form state (DEC-366=A)", () => {
  it("action still redirects to /app even if someone submits unexpected fields", async () => {
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
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });
});

// ── U5: submit button text — Bug #6a regression (issue tadaify-app#188) ──────

describe("onboarding.tier — U5: submit button text (Bug #6a / updated for DEC-366=A)", () => {
  it("source does NOT contain old 'Start for free →' button text", () => {
    expect(tierSrc).not.toContain("Start for free");
  });

  // U5 regression-lock updated: old "Take me to my page" replaced by "Take me to my dashboard"
  // per DEC-366=A (issue tadaify-app#190 Bug #4). The original assertion is replaced.
  it("source does NOT contain legacy 'Take me to my page' text (DEC-366=A)", () => {
    expect(tierSrc).not.toMatch(/Take me to my page/);
  });
});

// ── U6: CTA button text === "Take me to my dashboard →" (Bug #4, issue tadaify-app#190) ─────

describe("onboarding.tier — U6: CTA button text 'Take me to my dashboard →' (Bug #4)", () => {
  it("source contains button text 'Take me to my dashboard →'", () => {
    expect(tierSrc).toContain("Take me to my dashboard →");
  });

  it("source does NOT contain legacy 'Take me to my page →' copy", () => {
    // Regression-lock: old label was "Take me to my page →"
    expect(tierSrc).not.toMatch(/Take me to my page/i);
  });

  it("source does NOT contain 'Go to dashboard →' (that was the complete-screen label)", () => {
    // Regression-lock: ensure we didn't accidentally use the old complete-screen CTA text
    expect(tierSrc).not.toMatch(/Go to dashboard/i);
  });
});

// ── U7: action redirects to /app, NOT to /onboarding/complete (Bug #4, issue tadaify-app#190) ─

describe("onboarding.tier — U7: action redirects to /app (DEC-366=A, Bug #4)", () => {
  it("submitting tier form redirects to /app, NOT to /onboarding/complete", async () => {
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: new FormData() });
    const result = await action({ request: req, params: {}, context: {} } as never);
    expect(result).toBeInstanceOf(Response);
    const res = result as Response;
    expect(res.status).toBe(302);
    const location = res.headers.get("Location") ?? "";
    expect(location).toBe("/app");
    // Regression-lock: must NOT redirect to /onboarding/complete
    expect(location).not.toContain("/onboarding/complete");
    expect(location).not.toContain("/dashboard");
  });

  it("action redirects to /app even with empty form", async () => {
    const fd = new FormData();
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: fd });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    expect(res.status).toBe(302);
    expect(res.headers.get("Location")).toBe("/app");
  });

  it("action code does NOT produce a redirect to /onboarding/complete (DEC-366=A)", async () => {
    // Behavioural regression-lock: the action must redirect to /app, never to /onboarding/complete.
    // (Source may mention /onboarding/complete in comments — test against runtime behaviour.)
    const req = new Request("http://localhost/onboarding/tier", { method: "POST", body: new FormData() });
    const result = await action({ request: req, params: {}, context: {} } as never);
    const res = result as Response;
    const location = res.headers.get("Location") ?? "";
    expect(location).not.toContain("/onboarding/complete");
    expect(location).toBe("/app");
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
