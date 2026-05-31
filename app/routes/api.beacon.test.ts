/**
 * api.beacon action tests. Story: F-INSIGHTS-CAPTURE-001.
 */

import { describe, it, expect, vi } from "vitest";
import { action } from "./api.beacon";

function makeEnv() {
  const writeDataPoint = vi.fn();
  const kvStore = new Map<string, string>();
  const kv = {
    get: vi.fn(async (k: string) => kvStore.get(k) ?? null),
    put: vi.fn(async (k: string, v: string) => {
      kvStore.set(k, v);
    }),
  };
  return {
    env: {
      PAGE_EVENTS: { writeDataPoint },
      INSIGHTS_KV: kv,
      DAILY_SALT_SECRET: "test-secret",
    },
    writeDataPoint,
    kv,
    kvStore,
  };
}

function makeRequest(body: unknown, opts: { method?: string; ua?: string } = {}): Request {
  return new Request("https://alex.tadaify.com/api/beacon", {
    method: opts.method ?? "POST",
    headers: {
      "Content-Type": "application/json",
      "user-agent": opts.ua ?? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) Safari/604.1",
      "cf-connecting-ip": "203.0.113.9",
    },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function call(request: Request, env: unknown) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return action({ request, context: { cloudflare: { env } } } as any) as Promise<Response>;
}

describe("api.beacon", () => {
  it("rejects non-POST", async () => {
    const { env } = makeEnv();
    const res = await call(makeRequest(undefined, { method: "GET" }), env);
    expect(res.status).toBe(405);
  });

  it("drops an unparseable / invalid beacon with 204 and no writes", async () => {
    const { env, writeDataPoint, kv } = makeEnv();
    const res = await call(makeRequest({ handle: "bad handle", type: "view" }), env);
    expect(res.status).toBe(204);
    expect(writeDataPoint).not.toHaveBeenCalled();
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("writes a WAE row + increments the KV view counter for a human view", async () => {
    const { env, writeDataPoint, kvStore } = makeEnv();
    const res = await call(makeRequest({ handle: "alex", type: "view", path: "/" }), env);
    expect(res.status).toBe(204);
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    const dp = writeDataPoint.mock.calls[0][0];
    expect(dp.indexes).toEqual(["alex"]);
    expect(dp.blobs[0]).toBe("view");
    expect(dp.blobs[13]).toBe("0"); // not a bot
    // KV counter for today incremented to 1.
    const key = [...kvStore.keys()].find((k) => k.startsWith("v:alex:"));
    expect(key).toBeDefined();
    expect(kvStore.get(key as string)).toBe("1");
  });

  it("increments an existing KV counter", async () => {
    const { env, kvStore } = makeEnv();
    await call(makeRequest({ handle: "alex", type: "click", blockId: "b1" }), env);
    await call(makeRequest({ handle: "alex", type: "click", blockId: "b1" }), env);
    const key = [...kvStore.keys()].find((k) => k.startsWith("c:alex:"));
    expect(kvStore.get(key as string)).toBe("2");
  });

  it("logs bots to WAE (flagged) but does NOT bump the KV counter", async () => {
    const { env, writeDataPoint, kv } = makeEnv();
    const res = await call(
      makeRequest({ handle: "alex", type: "view" }, { ua: "Googlebot/2.1 (+http://www.google.com/bot.html)" }),
      env,
    );
    expect(res.status).toBe(204);
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    expect(writeDataPoint.mock.calls[0][0].blobs[13]).toBe("1"); // flagged bot
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("still 204s when bindings are absent (degrades, never throws)", async () => {
    const res = await call(makeRequest({ handle: "alex", type: "view" }), {});
    expect(res.status).toBe(204);
  });
});
