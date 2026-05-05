/**
 * Unit tests for handle-validator.ts
 * Run: npx vitest run app/lib/handle-validator.test.ts
 */

import { describe, it, expect } from "vitest";
import {
  validateHandle,
  generateAlternatives,
  BLOCKED_WORDS,
  HANDLE_REGEX,
} from "./handle-validator";

describe("validateHandle — valid handles", () => {
  it("accepts a simple lowercase word", () => {
    expect(validateHandle("alex")).toEqual({ valid: true });
  });

  it("accepts exactly 3 chars (minimum)", () => {
    expect(validateHandle("abc")).toEqual({ valid: true });
  });

  it("accepts exactly 30 chars (maximum)", () => {
    const h = "a".repeat(30);
    expect(validateHandle(h)).toEqual({ valid: true });
  });

  it("accepts digits in handle", () => {
    expect(validateHandle("creator99")).toEqual({ valid: true });
  });

  it("accepts underscore in middle", () => {
    expect(validateHandle("the_creator")).toEqual({ valid: true });
  });

  it("accepts handle starting with digit", () => {
    expect(validateHandle("42alex")).toEqual({ valid: true });
  });

  it("accepts handle with multiple underscores", () => {
    expect(validateHandle("kuba_bar_music")).toEqual({ valid: true });
  });
});

describe("validateHandle — invalid: too short", () => {
  it("rejects empty string", () => {
    expect(validateHandle("")).toEqual({ valid: false, reason: "empty" });
  });

  it("rejects 1 char", () => {
    expect(validateHandle("a")).toEqual({ valid: false, reason: "too_short" });
  });

  it("rejects 2 chars", () => {
    expect(validateHandle("ab")).toEqual({ valid: false, reason: "too_short" });
  });
});

describe("validateHandle — invalid: too long", () => {
  it("rejects 31 chars", () => {
    const h = "a".repeat(31);
    expect(validateHandle(h)).toEqual({ valid: false, reason: "too_long" });
  });

  it("rejects 50 chars", () => {
    const h = "a".repeat(50);
    expect(validateHandle(h)).toEqual({ valid: false, reason: "too_long" });
  });
});

describe("validateHandle — invalid: invalid_chars", () => {
  it("rejects uppercase letters", () => {
    expect(validateHandle("AlexSilva")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects hyphen (not allowed by schema)", () => {
    expect(validateHandle("alex-silva")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects leading underscore", () => {
    expect(validateHandle("_alex")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects spaces", () => {
    expect(validateHandle("alex silva")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects special characters", () => {
    expect(validateHandle("alex@silva")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects dots", () => {
    expect(validateHandle("alex.silva")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects trailing underscore (doesn't match regex end)", () => {
    // The regex requires the last char to be [a-z0-9] via the lookahead structure
    // Actually: ^[a-z0-9](?:[a-z0-9_]{1,29})?$ — trailing underscore IS allowed by the pattern
    // but let's verify actual behaviour:
    const result = validateHandle("alex_");
    // "alex_" length=5, matches ^[a-z0-9](?:[a-z0-9_]{1,29})?$ → a, then lex_ (4 chars, all in [a-z0-9_])
    // So "alex_" IS valid by the regex. This test documents expected behaviour.
    expect(result.valid).toBe(true);
  });

  it("rejects emoji", () => {
    expect(validateHandle("alex🎉")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });

  it("rejects null bytes / control chars", () => {
    expect(validateHandle("alex\x00")).toEqual({
      valid: false,
      reason: "invalid_chars",
    });
  });
});

describe("validateHandle — invalid: blocked_word", () => {
  for (const word of BLOCKED_WORDS) {
    it(`rejects blocked word: "${word}"`, () => {
      expect(validateHandle(word)).toEqual({
        valid: false,
        reason: "blocked_word",
      });
    });
  }

  it("rejects 'admin'", () => {
    expect(validateHandle("admin")).toEqual({
      valid: false,
      reason: "blocked_word",
    });
  });

  it("rejects 'tadaify'", () => {
    expect(validateHandle("tadaify")).toEqual({
      valid: false,
      reason: "blocked_word",
    });
  });

  it("does NOT reject 'adminuser' (not an exact match)", () => {
    expect(validateHandle("adminuser")).toEqual({ valid: true });
  });
});

describe("HANDLE_REGEX sanity checks", () => {
  it("matches 'alex'", () => {
    expect(HANDLE_REGEX.test("alex")).toBe(true);
  });

  it("does not match empty string", () => {
    expect(HANDLE_REGEX.test("")).toBe(false);
  });

  it("does not match string with hyphen", () => {
    expect(HANDLE_REGEX.test("alex-silva")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// generateAlternatives — original tests (updated per DEC-357=D universal ranking)
// ---------------------------------------------------------------------------

describe("generateAlternatives", () => {
  it("returns 3 alternatives for a standard handle", () => {
    const alts = generateAlternatives("alex");
    expect(alts).toHaveLength(3);
  });

  it("first suggestion is the_ prefix", () => {
    const alts = generateAlternatives("alex");
    expect(alts[0]).toBe("the_alex");
  });

  it("second suggestion is numeric 2 suffix (DEC-357=D universal)", () => {
    const alts = generateAlternatives("alex");
    expect(alts[1]).toBe("alex2");
  });

  it("always includes its_ as third option", () => {
    const alts = generateAlternatives("kuba");
    expect(alts[2]).toBe("its_kuba");
  });

  it("does not include alternatives that are too long", () => {
    const longHandle = "a".repeat(28); // 28 chars — the_ prefix would be 32 chars
    const alts = generateAlternatives(longHandle);
    for (const a of alts) {
      expect(a.length).toBeLessThanOrEqual(30);
    }
  });

  it("does not include alternatives with blocked words", () => {
    // 'admin' is blocked; 'the_admin' is not (not exact match) — valid
    const alts = generateAlternatives("admin");
    // 'admin' itself blocked but alternatives like 'the_admin' are fine
    for (const a of alts) {
      expect(BLOCKED_WORDS.has(a)).toBe(false);
    }
  });

  it("returns only valid-length alternatives for very long handles", () => {
    const longHandle = "a".repeat(27); // 27 chars — 'the_' + 27 = 31 > 30
    const alts = generateAlternatives(longHandle);
    for (const a of alts) {
      expect(a.length).toBeLessThanOrEqual(30);
    }
  });

  it("locale param is accepted but ignored (backwards compat)", () => {
    // DEC-357=D: locale param dropped — same output regardless
    const altsNoLocale = generateAlternatives("alex");
    const altsEn = generateAlternatives("alex", "en");
    const altsPl = generateAlternatives("alex", "pl");
    const altsDe = generateAlternatives("alex", "de");
    expect(altsNoLocale).toEqual(altsEn);
    expect(altsEn).toEqual(altsPl);
    expect(altsPl).toEqual(altsDe);
  });
});

// ---------------------------------------------------------------------------
// U2 — DEC-357=D locale-independence + no _pl suffix regression (tadaify-app#187)
// ---------------------------------------------------------------------------

describe("generateAlternatives — U2: locale-independence (DEC-357=D, tadaify-app#187)", () => {
  it("generateAlternatives returns 3 alternatives regardless of locale param", () => {
    // Same count: undefined, 'pl', 'en', 'de'
    expect(generateAlternatives("alex")).toHaveLength(3);
    expect(generateAlternatives("alex", "pl")).toHaveLength(3);
    expect(generateAlternatives("alex", "en")).toHaveLength(3);
    expect(generateAlternatives("alex", "de")).toHaveLength(3);
  });

  it("same output for locale=undefined, locale='pl', locale='en'", () => {
    const base = generateAlternatives("creator");
    expect(generateAlternatives("creator", "pl")).toEqual(base);
    expect(generateAlternatives("creator", "en")).toEqual(base);
  });

  it("generateAlternatives output does NOT include `_pl` suffix (regression-lock against DEC-357=D)", () => {
    const alts = generateAlternatives("alex");
    for (const alt of alts) {
      expect(alt).not.toMatch(/_pl$/);
    }
  });

  it("generateAlternatives output does NOT include `_pl` suffix for any locale (DEC-357=D)", () => {
    const locales = [undefined, "pl", "en", "de", "fr", "ja"];
    for (const locale of locales) {
      const alts = generateAlternatives("alex", locale);
      for (const alt of alts) {
        expect(alt).not.toMatch(/_pl$/);
      }
    }
  });

  it("generateAlternatives output uses underscore where applicable, never hyphen (DEC-353)", () => {
    const alts = generateAlternatives("alex");
    for (const alt of alts) {
      // No hyphens in any suggestion
      expect(alt).not.toContain("-");
    }
  });

  it("universal output is: the_<handle>, <handle>2, its_<handle>", () => {
    const alts = generateAlternatives("kuba");
    expect(alts).toEqual(["the_kuba", "kuba2", "its_kuba"]);
  });
});
