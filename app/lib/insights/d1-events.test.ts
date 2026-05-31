/**
 * d1-events unit tests. Story: F-INSIGHTS-D1-001.
 */

import { describe, it, expect } from "vitest";
import { RAW_EVENTS_INSERT_SQL, buildEventBindings } from "./d1-events";
import { validateBeacon, type BeaconServerContext } from "./beacon-event";

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

describe("RAW_EVENTS_INSERT_SQL", () => {
  it("has exactly 17 placeholders matching the binding count", () => {
    const placeholders = (RAW_EVENTS_INSERT_SQL.match(/\?/g) || []).length;
    expect(placeholders).toBe(17);
  });
});

describe("buildEventBindings", () => {
  it("orders the columns to match the schema, with the block id for clicks", () => {
    const r = validateBeacon({
      handle: "alex",
      type: "click",
      blockId: "b1",
      path: "/",
      referrer: "https://t.co/x",
      utmSource: "tiktok",
    });
    if (!r.ok) throw new Error("expected ok");
    const b = buildEventBindings(r.data, ctx, 1_750_000_000_000, "2026-05-31");
    expect(b).toEqual([
      1_750_000_000_000, // ts
      "2026-05-31", // date_key
      "alex", // handle
      "click", // event_type
      "b1", // block_id
      "/", // path
      "t.co", // referrer_host (extracted)
      "PL", // country
      "Warsaw", // city
      "mobile", // device
      "Safari", // browser
      "iOS", // os
      "tiktok", // utm_source
      "", // utm_medium
      "", // utm_campaign
      "abcd1234abcd1234", // visitor_day_hash
      0, // is_bot
    ]);
    expect(b).toHaveLength(17);
  });

  it("blanks the block id for views and stores is_bot=1 for bots", () => {
    const r = validateBeacon({ handle: "alex", type: "view", blockId: "ignored" });
    if (!r.ok) throw new Error("expected ok");
    const b = buildEventBindings(r.data, { ...ctx, isBot: true }, 1, "2026-05-31");
    expect(b[4]).toBe(""); // block_id blank for views
    expect(b[16]).toBe(1); // is_bot
  });
});
