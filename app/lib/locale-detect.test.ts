/**
 * Unit tests for locale-detect.ts
 * Run: npx vitest run app/lib/locale-detect.test.ts
 */

import { describe, it, expect } from "vitest";
import { detectLocale } from "./locale-detect";

// Helper to build a Headers object from a plain record
function makeHeaders(rec: Record<string, string>): Headers {
  return new Headers(rec);
}

describe("detectLocale — Cloudflare cf-ipcountry priority", () => {
  it("returns 'pl' for Polish IP", () => {
    const h = makeHeaders({ "cf-ipcountry": "PL" });
    expect(detectLocale(h)).toBe("pl");
  });

  it("returns 'en' for US IP", () => {
    const h = makeHeaders({ "cf-ipcountry": "US" });
    expect(detectLocale(h)).toBe("en");
  });

  it("returns 'en' for German IP", () => {
    const h = makeHeaders({ "cf-ipcountry": "DE" });
    expect(detectLocale(h)).toBe("en");
  });

  it("handles lowercase cf-ipcountry 'pl'", () => {
    const h = makeHeaders({ "cf-ipcountry": "pl" });
    expect(detectLocale(h)).toBe("pl");
  });

  it("cf-ipcountry takes priority over Accept-Language", () => {
    const h = makeHeaders({
      "cf-ipcountry": "US",
      "accept-language": "pl,en-US;q=0.9",
    });
    expect(detectLocale(h)).toBe("en");
  });
});

describe("detectLocale — Accept-Language fallback", () => {
  it("returns 'pl' for Accept-Language: pl", () => {
    const h = makeHeaders({ "accept-language": "pl" });
    expect(detectLocale(h)).toBe("pl");
  });

  it("returns 'pl' for Accept-Language: pl,en-US;q=0.9", () => {
    const h = makeHeaders({ "accept-language": "pl,en-US;q=0.9,en;q=0.8" });
    expect(detectLocale(h)).toBe("pl");
  });

  it("returns 'en' for Accept-Language: en-US", () => {
    const h = makeHeaders({ "accept-language": "en-US" });
    expect(detectLocale(h)).toBe("en");
  });

  it("returns 'en' for Accept-Language: de-DE,de;q=0.9", () => {
    const h = makeHeaders({ "accept-language": "de-DE,de;q=0.9,en;q=0.8" });
    expect(detectLocale(h)).toBe("en");
  });

  it("returns 'en' for Accept-Language: fr-FR", () => {
    const h = makeHeaders({ "accept-language": "fr-FR,fr;q=0.9" });
    expect(detectLocale(h)).toBe("en");
  });
});

describe("detectLocale — default fallback", () => {
  it("returns 'en' when no relevant headers present", () => {
    const h = makeHeaders({});
    expect(detectLocale(h)).toBe("en");
  });
});

describe("detectLocale — plain record (non-Headers) input", () => {
  it("works with a plain lowercase-key record", () => {
    const rec = { "cf-ipcountry": "PL" };
    expect(detectLocale(rec)).toBe("pl");
  });

  it("works with mixed-case key record", () => {
    const rec = { "CF-IPCountry": "PL" };
    expect(detectLocale(rec)).toBe("pl");
  });
});
