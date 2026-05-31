/**
 * beacon-event unit tests. Story: F-INSIGHTS-CAPTURE-001.
 */

import { describe, it, expect } from "vitest";
import {
  validateBeacon,
  referrerHost,
  buildDataPoint,
  kvCounterKey,
  type BeaconServerContext,
} from "./beacon-event";

describe("validateBeacon", () => {
  it("accepts a valid view, lowercasing + clamping", () => {
    const r = validateBeacon({ handle: "Alex", type: "view", path: "/x" });
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.data.handle).toBe("alex");
      expect(r.data.type).toBe("view");
      expect(r.data.path).toBe("/x");
    }
  });

  it("rejects a bad handle or unknown type", () => {
    expect(validateBeacon({ handle: "no spaces!", type: "view" }).ok).toBe(false);
    expect(validateBeacon({ handle: "alex", type: "scroll" }).ok).toBe(false);
    expect(validateBeacon(null).ok).toBe(false);
  });

  it("clamps over-long fields", () => {
    const r = validateBeacon({ handle: "alex", type: "click", blockId: "x".repeat(200) });
    expect(r.ok && r.data.blockId.length).toBe(64);
  });
});

describe("referrerHost", () => {
  it("extracts the host and drops same-origin / invalid", () => {
    expect(referrerHost("https://www.tiktok.com/@a/video/1", "alex.tadaify.com")).toBe(
      "www.tiktok.com",
    );
    expect(referrerHost("https://alex.tadaify.com/x", "alex.tadaify.com")).toBe("");
    expect(referrerHost("", "alex.tadaify.com")).toBe("");
    expect(referrerHost("not a url", "alex.tadaify.com")).toBe("");
  });
});

describe("buildDataPoint", () => {
  const ctx: BeaconServerContext = {
    country: "PL",
    city: "Warsaw",
    device: "mobile",
    browser: "Safari",
    os: "iOS",
    isBot: false,
    visitorDayHash: "abcd1234abcd1234",
    selfHost: "alex.tadaify.com",
  };

  it("places fields at the fixed blob indices, index=handle, double=1", () => {
    const r = validateBeacon({
      handle: "alex",
      type: "click",
      blockId: "b1",
      path: "/",
      referrer: "https://t.co/x",
      utmSource: "tiktok",
    });
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const dp = buildDataPoint(r.data, ctx);
    expect(dp.indexes).toEqual(["alex"]);
    expect(dp.doubles).toEqual([1]);
    expect(dp.blobs[0]).toBe("click");
    expect(dp.blobs[1]).toBe("b1");
    expect(dp.blobs[3]).toBe("t.co");
    expect(dp.blobs[4]).toBe("PL");
    expect(dp.blobs[5]).toBe("Warsaw");
    expect(dp.blobs[6]).toBe("mobile");
    expect(dp.blobs[9]).toBe("tiktok");
    expect(dp.blobs[12]).toBe("abcd1234abcd1234");
    expect(dp.blobs[13]).toBe("0");
  });

  it("omits block_id for views and flags bots", () => {
    const r = validateBeacon({ handle: "alex", type: "view", blockId: "ignored" });
    if (!r.ok) throw new Error("expected ok");
    const dp = buildDataPoint(r.data, { ...ctx, isBot: true });
    expect(dp.blobs[1]).toBe("");
    expect(dp.blobs[13]).toBe("1");
  });
});

describe("kvCounterKey", () => {
  it("namespaces views vs clicks per handle per day", () => {
    expect(kvCounterKey("view", "alex", "2026-05-31")).toBe("v:alex:2026-05-31");
    expect(kvCounterKey("click", "alex", "2026-05-31")).toBe("c:alex:2026-05-31");
  });
});
