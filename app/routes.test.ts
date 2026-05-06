/**
 * U1 — routes.ts: route registration completeness
 *
 * Verifies that every test-harness route file has a corresponding registration
 * in app/routes.ts. Missing registrations cause 404s for Playwright specs.
 *
 * Context: smoke test 2026-05-06 found that test-block-editor-modal route was
 * present as a file (app/routes/test-block-editor-modal.tsx, from PR #211) but
 * NOT registered in app/routes.ts, causing Playwright S1-S7 specs to fail.
 *
 * Story: smoke-test-fixes-2026-05-06 (P1 fix)
 * Covers: U1 — route registration for test harness routes
 */

import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

const routesSrc = readFileSync(
  fileURLToPath(new URL("./routes.ts", import.meta.url)),
  "utf8",
);

// ---------------------------------------------------------------------------
// U1: test harness routes are registered
// Both /test-block-picker-modal and /test-block-editor-modal must be present
// so Playwright specs from PR #201 and PR #211 can resolve.
// ---------------------------------------------------------------------------

describe("routes.ts — test harness routes registered", () => {
  it("registers /test-block-picker-modal (tadaify-app#201)", () => {
    expect(routesSrc).toContain('"/test-block-picker-modal"');
    expect(routesSrc).toContain('"routes/test-block-picker-modal.tsx"');
  });

  it("registers /test-block-editor-modal (tadaify-app#211)", () => {
    expect(routesSrc).toContain('"/test-block-editor-modal"');
    expect(routesSrc).toContain('"routes/test-block-editor-modal.tsx"');
  });

  it("both test-harness routes are distinct (no path collision)", () => {
    const pickerCount = (routesSrc.match(/test-block-picker-modal/g) || []).length;
    const editorCount = (routesSrc.match(/test-block-editor-modal/g) || []).length;
    // Each should appear exactly twice: once as path string, once as file reference
    expect(pickerCount).toBeGreaterThanOrEqual(2);
    expect(editorCount).toBeGreaterThanOrEqual(2);
  });
});
