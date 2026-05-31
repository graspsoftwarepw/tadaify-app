/**
 * ua-classify unit tests. Story: F-INSIGHTS-CAPTURE-001.
 */

import { describe, it, expect } from "vitest";
import {
  classifyUa,
  classifyDevice,
  classifyBrowser,
  classifyOs,
  isLikelyBot,
} from "./ua-classify";

const IPHONE =
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1";
const ANDROID =
  "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36";
const IPAD =
  "Mozilla/5.0 (iPad; CPU OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Safari/604.1";
const MAC_CHROME =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";
const WIN_EDGE =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36 Edg/124.0";
const GOOGLEBOT =
  "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)";

describe("isLikelyBot", () => {
  it("flags empty UA + known crawlers", () => {
    expect(isLikelyBot("")).toBe(true);
    expect(isLikelyBot(GOOGLEBOT)).toBe(true);
    expect(isLikelyBot("python-requests/2.31")).toBe(true);
    expect(isLikelyBot(IPHONE)).toBe(false);
  });
});

describe("classifyDevice", () => {
  it("buckets mobile / tablet / desktop / bot", () => {
    expect(classifyDevice(IPHONE)).toBe("mobile");
    expect(classifyDevice(ANDROID)).toBe("mobile");
    expect(classifyDevice(IPAD)).toBe("tablet");
    expect(classifyDevice(MAC_CHROME)).toBe("desktop");
    expect(classifyDevice(GOOGLEBOT)).toBe("bot");
    expect(classifyDevice("")).toBe("unknown");
  });
});

describe("classifyBrowser", () => {
  it("identifies Edge before Chrome, and Safari/Firefox", () => {
    expect(classifyBrowser(WIN_EDGE)).toBe("Edge");
    expect(classifyBrowser(MAC_CHROME)).toBe("Chrome");
    expect(classifyBrowser(IPHONE)).toBe("Safari");
    expect(
      classifyBrowser("Mozilla/5.0 (X11; Linux x86_64; rv:124.0) Gecko/20100101 Firefox/124.0"),
    ).toBe("Firefox");
  });
});

describe("classifyOs", () => {
  it("identifies iOS / Android / Windows / macOS", () => {
    expect(classifyOs(IPHONE)).toBe("iOS");
    expect(classifyOs(ANDROID)).toBe("Android");
    expect(classifyOs(WIN_EDGE)).toBe("Windows");
    expect(classifyOs(MAC_CHROME)).toBe("macOS");
  });
});

describe("classifyUa", () => {
  it("returns the full facet set", () => {
    expect(classifyUa(IPHONE)).toEqual({
      device: "mobile",
      browser: "Safari",
      os: "iOS",
      isBot: false,
    });
  });
});
