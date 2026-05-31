/**
 * client-beacon unit tests. Story: F-INSIGHTS-EMIT-001.
 */

import { describe, it, expect, vi } from "vitest";
import {
  parseUtm,
  viewBeacon,
  clickBeacon,
  sendClientBeacon,
  BEACON_ENDPOINT,
} from "./client-beacon";

describe("parseUtm", () => {
  it("reads utm params and defaults to empty", () => {
    expect(parseUtm("?utm_source=tiktok&utm_medium=social&utm_campaign=spring")).toEqual({
      utmSource: "tiktok",
      utmMedium: "social",
      utmCampaign: "spring",
    });
    expect(parseUtm("")).toEqual({ utmSource: "", utmMedium: "", utmCampaign: "" });
  });
});

describe("viewBeacon", () => {
  it("builds a view payload with utm + referrer", () => {
    expect(
      viewBeacon({
        handle: "alex",
        pathname: "/",
        search: "?utm_source=ig",
        referrer: "https://instagram.com/",
      }),
    ).toEqual({
      handle: "alex",
      type: "view",
      path: "/",
      referrer: "https://instagram.com/",
      utmSource: "ig",
      utmMedium: "",
      utmCampaign: "",
    });
  });

  it("defaults an empty pathname to /", () => {
    expect(viewBeacon({ handle: "a", pathname: "", search: "", referrer: "" }).path).toBe("/");
  });
});

describe("clickBeacon", () => {
  it("builds a click payload with the block id", () => {
    expect(clickBeacon({ handle: "alex", pathname: "/", blockId: "b1" })).toEqual({
      handle: "alex",
      type: "click",
      path: "/",
      blockId: "b1",
    });
  });
});

describe("sendClientBeacon", () => {
  const payload = clickBeacon({ handle: "alex", pathname: "/", blockId: "b1" });

  it("prefers navigator.sendBeacon with a JSON blob", () => {
    const sendBeacon = vi.fn();
    const nav = { sendBeacon } as unknown as Navigator;
    const fetchImpl = vi.fn();
    sendClientBeacon(payload, nav, fetchImpl as unknown as typeof fetch);
    expect(sendBeacon).toHaveBeenCalledTimes(1);
    expect(sendBeacon.mock.calls[0][0]).toBe(BEACON_ENDPOINT);
    expect(sendBeacon.mock.calls[0][1]).toBeInstanceOf(Blob);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it("falls back to fetch keepalive when sendBeacon is unavailable", () => {
    const fetchImpl = vi.fn().mockResolvedValue(undefined);
    sendClientBeacon(payload, {} as Navigator, fetchImpl as unknown as typeof fetch);
    expect(fetchImpl).toHaveBeenCalledWith(
      BEACON_ENDPOINT,
      expect.objectContaining({ method: "POST", keepalive: true }),
    );
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body)).toMatchObject({
      handle: "alex",
      type: "click",
      blockId: "b1",
    });
  });

  it("never throws when no transport is available", () => {
    expect(() => sendClientBeacon(payload, undefined, undefined)).not.toThrow();
  });
});
