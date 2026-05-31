/**
 * visitor-hash unit tests. Story: F-INSIGHTS-CAPTURE-001 (DEC-075).
 */

import { describe, it, expect } from "vitest";
import {
  sha256Hex,
  utcDateKey,
  dailySalt,
  visitorDayHash,
} from "./visitor-hash";

describe("sha256Hex", () => {
  it("produces a 64-char hex digest, stable for the same input", async () => {
    const a = await sha256Hex("hello");
    const b = await sha256Hex("hello");
    expect(a).toBe(b);
    expect(a).toMatch(/^[0-9a-f]{64}$/);
    expect(await sha256Hex("world")).not.toBe(a);
  });
});

describe("utcDateKey", () => {
  it("returns YYYY-MM-DD in UTC", () => {
    expect(utcDateKey(Date.parse("2026-05-31T23:30:00Z"))).toBe("2026-05-31");
    expect(utcDateKey(Date.parse("2026-01-01T00:00:00Z"))).toBe("2026-01-01");
  });
});

describe("visitorDayHash", () => {
  const base = {
    secret: "s3cret",
    dateKey: "2026-05-31",
    ip: "203.0.113.7",
    userAgent: "Mozilla/5.0",
    handle: "alex",
  };

  it("is a 16-char hex token", async () => {
    const h = await visitorDayHash(base);
    expect(h).toMatch(/^[0-9a-f]{16}$/);
  });

  it("is identical for the same person+page on the same day", async () => {
    expect(await visitorDayHash(base)).toBe(await visitorDayHash({ ...base }));
  });

  it("differs across days (salt rotates)", async () => {
    const today = await visitorDayHash(base);
    const tomorrow = await visitorDayHash({ ...base, dateKey: "2026-06-01" });
    expect(today).not.toBe(tomorrow);
  });

  it("differs by visitor (ip/ua) and by handle partition", async () => {
    expect(await visitorDayHash({ ...base, ip: "198.51.100.2" })).not.toBe(
      await visitorDayHash(base),
    );
    expect(await visitorDayHash({ ...base, userAgent: "curl/8" })).not.toBe(
      await visitorDayHash(base),
    );
    expect(await visitorDayHash({ ...base, handle: "sam" })).not.toBe(
      await visitorDayHash(base),
    );
  });

  it("dailySalt depends on both secret and date", async () => {
    expect(await dailySalt("a", "2026-05-31")).not.toBe(
      await dailySalt("b", "2026-05-31"),
    );
    expect(await dailySalt("a", "2026-05-31")).not.toBe(
      await dailySalt("a", "2026-06-01"),
    );
  });
});
