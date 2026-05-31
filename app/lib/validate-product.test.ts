/**
 * U — validateProductMeta
 *
 * Story: F-BLOCK-PRODUCT-COMPLETE-001 (#291)
 */

import { describe, it, expect } from "vitest";
import { validateProductMeta, PRODUCT_PRICE_MAX } from "./validate-product";

describe("validateProductMeta", () => {
  it("passes through any non-product block type unchanged", () => {
    expect(validateProductMeta("link", { price: "x".repeat(500) })).toEqual({ ok: true });
    expect(validateProductMeta("image", { price: 12345 })).toEqual({ ok: true });
    expect(validateProductMeta(undefined, null)).toEqual({ ok: true });
  });

  it("accepts a product with a normal free-text price", () => {
    expect(validateProductMeta("product", { price: "$24" })).toEqual({ ok: true });
    expect(validateProductMeta("product", { price: "From €5" })).toEqual({ ok: true });
  });

  it("accepts a product with no price / null price / non-object meta", () => {
    expect(validateProductMeta("product", {})).toEqual({ ok: true });
    expect(validateProductMeta("product", { price: null })).toEqual({ ok: true });
    expect(validateProductMeta("product", null)).toEqual({ ok: true });
    expect(validateProductMeta("product", "nope")).toEqual({ ok: true });
  });

  it("rejects a non-string price", () => {
    const r = validateProductMeta("product", { price: 2400 });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/must be a string/);
  });

  it("accepts a price exactly at the max length", () => {
    expect(validateProductMeta("product", { price: "x".repeat(PRODUCT_PRICE_MAX) })).toEqual({ ok: true });
  });

  it("rejects a price longer than the max length", () => {
    const r = validateProductMeta("product", { price: "x".repeat(PRODUCT_PRICE_MAX + 1) });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.error).toMatch(/characters or fewer/);
  });
});
