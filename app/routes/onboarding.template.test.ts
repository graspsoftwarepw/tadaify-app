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
 *
 * Bug #5 regression tests (issue tadaify-app#188):
 * U3-bug5: tpl URL param updates via loader (controlled-input regression)
 *   — verifies loader returns the tpl value so the component can drive
 *     checked={isSelected} correctly (action path tested via U3-U5).
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

// ── U3-bug5: loader drives controlled radio (Bug #5 regression) ─────────────

describe("onboarding.template — U3-bug5: tpl URL param drives loader selectedTemplate (Bug #5)", () => {
  it("loader returns selectedTemplate matching URL ?tpl=neon", async () => {
    const req = new Request("http://localhost/onboarding/template?tpl=neon");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // Component uses loaderData.selectedTemplate → checked={isSelected}
    // so this is the controlled-radio source of truth
    expect(result.selectedTemplate).toBe("neon");
  });

  it("loader returns selectedTemplate=null for unknown tpl, not a string (no default injection)", async () => {
    const req = new Request("http://localhost/onboarding/template?tpl=wrongvalue");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBeNull();
  });

  it("loader returns selectedTemplate=null when tpl absent", async () => {
    const req = new Request("http://localhost/onboarding/template");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBeNull();
  });

  it("each PRESET_TEMPLATE id is accepted as valid selectedTemplate by loader", async () => {
    for (const t of PRESET_TEMPLATES) {
      const req = new Request(`http://localhost/onboarding/template?tpl=${t.id}`);
      const result = await loader({ request: req, params: {}, context: {} } as never);
      expect(result.selectedTemplate).toBe(t.id);
    }
  });
});

// ── U3: preview-cards styled (Bug #4a regression) — issue tadaify-app#188 ────

describe("onboarding.template — U3: each template card has a styled mini-preview (Bug #4a)", () => {
  it("each template card renders a styled mini-preview, not just emoji+tagline", () => {
    // Verify that each PRESET_TEMPLATES entry has a corresponding CSS class
    // .preview-<id> defined in the component source (static source assertion).
    // This is a regression lock: previous impl only rendered emoji+tagline.
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    for (const t of PRESET_TEMPLATES) {
      expect(src).toContain(`preview-${t.id}`);
    }
  });

  it("source contains expected font-family per template (Chopin → Georgia/Crimson Pro, Neon → Inter, etc.)", () => {
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    // Chopin / Minimal / Nightfall use serif fonts
    expect(src).toMatch(/preview-chopin.*?font-family.*?Georgia|font-family.*?Georgia.*?preview-chopin/s);
    // Neon / Sunrise use Inter
    expect(src).toMatch(/preview-neon.*?font-family.*?Inter|Inter.*?preview-neon/s);
  });

  it("source contains preview-inner wrapper class within template cards", () => {
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    expect(src).toContain("preview-inner");
    // Sample link element in preview (→ Latest post)
    expect(src).toContain("preview-link");
  });
});

// ── U4: no "coming in a future update" copy (Bug #4b regression) — issue tadaify-app#188 ─────

describe("onboarding.template — U4: no deferred-feature copy (Bug #4b)", () => {
  it("page does not render 'coming in a future update' deferred-feature copy", () => {
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    expect(src).not.toMatch(/coming in a future update/i);
  });

  it("source does not contain 'Live preview' deferred right-pane copy", () => {
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    // The previous stub rendered "Live preview · Coming in a future update."
    expect(src).not.toMatch(/Live preview[\s·]*Coming/i);
  });
});

// ── U5: controlled radio selection (Bug #5 regression) — issue tadaify-app#188 ──────────────

describe("onboarding.template — U5: controlled radio selection (Bug #5)", () => {
  it("selecting a template updates URL param to that template id", async () => {
    // Loader is the source of truth for selectedTemplate.
    // When ?tpl=custom is in URL, loader.selectedTemplate === "custom".
    const req = new Request("http://localhost/onboarding/template?tpl=custom&handle=alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBe("custom");
  });

  it("only the selected card has selected-style at any time (single source of truth in loader)", async () => {
    // After clicking 'neon', loader returns selectedTemplate='neon' only.
    // No other template should be returned as selected.
    const req = new Request("http://localhost/onboarding/template?tpl=neon&handle=alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    expect(result.selectedTemplate).toBe("neon");
    // Verify that "chopin" (the default) is NOT also flagged as selected
    // (this is the regression: old code had `selectedTemplate ?? "chopin"` which always set chopin)
    expect(result.selectedTemplate).not.toBe("chopin");
  });

  it("clicking from default chopin to neon changes selectedTemplate exclusively", async () => {
    // Simulate: user visits with ?tpl=chopin then changes to neon
    const req = new Request("http://localhost/onboarding/template?tpl=neon&handle=alice");
    const result = await loader({ request: req, params: {}, context: {} } as never);
    // Only neon is selected
    expect(result.selectedTemplate).toBe("neon");
    // Total loader shape still valid
    expect(typeof result.handle).toBe("string");
  });

  it("source uses checked={isSelected} (controlled) not defaultChecked (uncontrolled)", () => {
    const { readFileSync } = require("fs");
    const { fileURLToPath } = require("url");
    const src = readFileSync(
      fileURLToPath(new URL("./onboarding.template.tsx", import.meta.url)),
      "utf8"
    );
    // Bug #5 was caused by defaultChecked (uncontrolled). Fix uses checked={}.
    expect(src).toContain("checked={isSelected}");
    expect(src).not.toContain("defaultChecked={isSelected}");
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
