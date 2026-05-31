/**
 * validate-link-url unit tests. Story: F-BLOCK-LINK-COMPLETE-001 (#289).
 */

import { describe, it, expect } from "vitest";
import { validateLinkUrl, MAX_URL_LENGTH } from "./validate-link-url";

describe("validateLinkUrl", () => {
  it("accepts a full https URL", () => {
    expect(validateLinkUrl("https://open.spotify.com/x")).toEqual({
      ok: true,
      url: "https://open.spotify.com/x",
    });
  });

  it("auto-prepends https to a bare domain", () => {
    expect(validateLinkUrl("spotify.com/artist/x")).toEqual({
      ok: true,
      url: "https://spotify.com/artist/x",
    });
  });

  it("upgrades a protocol-relative URL", () => {
    expect(validateLinkUrl("//cdn.example.com/a")).toEqual({
      ok: true,
      url: "https://cdn.example.com/a",
    });
  });

  it("requires a non-empty value", () => {
    expect(validateLinkUrl("   ")).toMatchObject({ ok: false });
    expect(validateLinkUrl(null)).toMatchObject({ ok: false });
  });

  it("rejects dangerous schemes (XSS / data-exfil)", () => {
    for (const bad of [
      "javascript:alert(1)",
      "  JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
      "vbscript:msgbox(1)",
      "file:///etc/passwd",
      "blob:https://x",
    ]) {
      const r = validateLinkUrl(bad);
      expect(r.ok, bad).toBe(false);
    }
  });

  it("rejects a URL without a dotted domain", () => {
    expect(validateLinkUrl("https://localhost").ok).toBe(false);
    expect(validateLinkUrl("notaurl").ok).toBe(false);
  });

  it("rejects an over-long URL", () => {
    const long = "https://x.com/" + "a".repeat(MAX_URL_LENGTH);
    expect(validateLinkUrl(long).ok).toBe(false);
  });
});
