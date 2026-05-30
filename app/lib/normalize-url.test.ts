/**
 * Unit tests for `normalizeUrl`.
 *
 * Story: F-BLOCK-LINK-001 slice A (tadaify-app#56)
 */

import { describe, it, expect } from "vitest";
import { normalizeUrl, DEFAULT_URL_SCHEME } from "./normalize-url";

describe("normalizeUrl", () => {
  it("returns empty string for empty input", () => {
    expect(normalizeUrl("")).toBe("");
    expect(normalizeUrl("   ")).toBe("");
  });

  it("leaves https:// URLs untouched (modulo trim)", () => {
    expect(normalizeUrl("https://spotify.com/artist/123")).toBe(
      "https://spotify.com/artist/123",
    );
    expect(normalizeUrl("  https://spotify.com/x  ")).toBe(
      "https://spotify.com/x",
    );
  });

  it("leaves http:// URLs untouched", () => {
    expect(normalizeUrl("http://example.com")).toBe("http://example.com");
  });

  it("prepends https:// to a bare domain (ECN-BLOCK-LINK-01)", () => {
    expect(normalizeUrl("spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF")).toBe(
      "https://spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF",
    );
    expect(normalizeUrl("example.org")).toBe("https://example.org");
  });

  it("upgrades protocol-relative URLs to https://", () => {
    expect(normalizeUrl("//cdn.example.com/x.png")).toBe(
      "https://cdn.example.com/x.png",
    );
  });

  it("lower-cases an upper-cased scheme so storage is canonical", () => {
    expect(normalizeUrl("HTTPS://Foo.Com/Bar")).toBe("https://Foo.Com/Bar");
  });

  it("exports the default scheme constant for callers that want to label UI", () => {
    expect(DEFAULT_URL_SCHEME).toBe("https://");
  });
});
