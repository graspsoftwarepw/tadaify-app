/**
 * U1 — Loader URL-param parsing + view-model assembly
 *
 * Tests the pure URL-param parsing functions extracted from the /app loader.
 * Loader data-fetch logic (Supabase REST calls) is tested via E2E (S1-S7).
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: U1 per issue spec
 */

import { describe, it, expect } from "vitest";
import { parseTab, parseDevice } from "./app.js";

// ---------------------------------------------------------------------------
// U1-1: default ?tab=page renders Homepage panel
// ---------------------------------------------------------------------------

describe("parseTab", () => {
  it("default (empty searchParams) returns 'page'", () => {
    const sp = new URLSearchParams();
    expect(parseTab(sp)).toBe("page");
  });

  it("?tab=page returns 'page'", () => {
    const sp = new URLSearchParams("tab=page");
    expect(parseTab(sp)).toBe("page");
  });

  it("?tab=design returns 'design'", () => {
    const sp = new URLSearchParams("tab=design");
    expect(parseTab(sp)).toBe("design");
  });

  it("?tab=insights returns 'insights'", () => {
    const sp = new URLSearchParams("tab=insights");
    expect(parseTab(sp)).toBe("insights");
  });

  it("?tab=settings returns 'settings'", () => {
    const sp = new URLSearchParams("tab=settings");
    expect(parseTab(sp)).toBe("settings");
  });

  // U1-3: invalid ?tab falls back to 'page'
  it("invalid ?tab=foobar falls back to 'page'", () => {
    const sp = new URLSearchParams("tab=foobar");
    expect(parseTab(sp)).toBe("page");
  });

  it("?tab=XSS<script> falls back to 'page'", () => {
    const sp = new URLSearchParams("tab=XSS<script>");
    expect(parseTab(sp)).toBe("page");
  });
});

// ---------------------------------------------------------------------------
// U1-device: device param parsing
// ---------------------------------------------------------------------------

describe("parseDevice", () => {
  it("default (empty searchParams) returns 'mobile'", () => {
    const sp = new URLSearchParams();
    expect(parseDevice(sp)).toBe("mobile");
  });

  it("?device=tablet returns 'tablet'", () => {
    const sp = new URLSearchParams("device=tablet");
    expect(parseDevice(sp)).toBe("tablet");
  });

  it("?device=desktop returns 'desktop'", () => {
    const sp = new URLSearchParams("device=desktop");
    expect(parseDevice(sp)).toBe("desktop");
  });

  it("?device=invalid falls back to 'mobile'", () => {
    const sp = new URLSearchParams("device=invalid");
    expect(parseDevice(sp)).toBe("mobile");
  });
});
