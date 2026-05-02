/**
 * U3: External-resource scanner — TR-tadaify-002 §4 enforcement.
 * Run: node --test supabase/templates/auth/no-external-resources.test.mjs
 *
 * Scans ALL *.html files in supabase/templates/auth/ and asserts that none
 * reference external resources (link tags, img https/http, script tags,
 * @import url(), Google Fonts, CSS variables). Rendering must work fully
 * offline per TR-tadaify-002 §4.
 *
 * NOTE: *.txt plain-text files (DEC-333=B) are intentionally excluded from
 * this scan — the external-resource check is an HTML/CSS concern. The .txt
 * files may contain https:// URLs (e.g. tadaify.com links) which are brand
 * references in plain text, not external resource loads.
 *
 * Covers: TR-tadaify-002 §4 (inline CSS only, no external resources)
 * Story: #150 (auth email templates Phase 1+2), DEC-333=B
 */

import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { join, dirname } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Collect all *.html files only (excludes .txt files and test files themselves)
const htmlFiles = readdirSync(__dirname)
  .filter((f) => f.endsWith(".html"))
  .map((f) => ({ name: f, content: readFileSync(join(__dirname, f), "utf-8") }));

assert.ok(
  htmlFiles.length >= 6,
  `Expected at least 6 template HTML files, found ${htmlFiles.length}`
);

describe("TR-tadaify-002 §4 — no external resources in any template", () => {
  for (const { name, content } of htmlFiles) {

    it(`${name}: no <link rel="stylesheet"`, () => {
      assert.ok(
        !/<link[^>]+rel=["']stylesheet["']/i.test(content),
        `${name} must not contain <link rel="stylesheet"> — inline CSS only (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no <img src="https://`, () => {
      assert.ok(
        !/<img[^>]+src=["']https:\/\//i.test(content),
        `${name} must not contain <img src="https://"> — no remote images (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no <img src="http://`, () => {
      assert.ok(
        !/<img[^>]+src=["']http:\/\//i.test(content),
        `${name} must not contain <img src="http://"> — no remote images (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no <script`, () => {
      assert.ok(
        !/<script[\s>]/i.test(content),
        `${name} must not contain <script> — no JavaScript in email templates (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no @import url(`, () => {
      assert.ok(
        !/@import\s+url\(/i.test(content),
        `${name} must not contain @import url() — inline CSS only (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no Google Fonts reference`, () => {
      assert.ok(
        !/(fonts\.googleapis\.com|fonts\.gstatic\.com)/i.test(content),
        `${name} must not reference Google Fonts — no external font loading (TR-tadaify-002 §4)`
      );
    });

    it(`${name}: no CSS variables var(--)`, () => {
      assert.ok(
        !/var\(--/.test(content),
        `${name} must not use CSS variables var(--*) — hardcoded hex values required (TR-tadaify-002 §4)`
      );
    });
  }
});
