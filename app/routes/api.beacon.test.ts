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
  // Minimal D1 prepared-statement spy: prepare(sql).bind(...args).run()
  const d1Rows: { sql: string; binds: unknown[] }[] = [];
  const db = {
    prepare: vi.fn((sql: string) => ({
      bind: (...binds: unknown[]) => ({
        run: async () => {
          d1Rows.push({ sql, binds });
          return { success: true };
        },
      }),
    })),
  };
  return {
    env: {
      INSIGHTS_DB: db,
      PAGE_EVENTS: { writeDataPoint },
      INSIGHTS_KV: kv,
      DAILY_SALT_SECRET: "test-secret",
    },
    writeDataPoint,
    kv,
    kvStore,
    db,
    d1Rows,
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

  it("writes a D1 row + a WAE row + increments the KV view counter for a human view", async () => {
    const { env, writeDataPoint, kvStore, d1Rows } = makeEnv();
    const res = await call(makeRequest({ handle: "alex", type: "view", path: "/" }), env);
    expect(res.status).toBe(204);
    // D1 is the primary store.
    expect(d1Rows).toHaveLength(1);
    expect(d1Rows[0].sql).toContain("INSERT INTO raw_events");
    expect(d1Rows[0].binds[2]).toBe("alex"); // handle
    expect(d1Rows[0].binds[3]).toBe("view"); // event_type
    expect(d1Rows[0].binds[16]).toBe(0); // is_bot
    // WAE secondary sink.
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    expect(writeDataPoint.mock.calls[0][0].indexes).toEqual(["alex"]);
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

  it("logs bots to D1 + WAE (flagged) but does NOT bump the KV counter", async () => {
    const { env, writeDataPoint, kv, d1Rows } = makeEnv();
    const res = await call(
      makeRequest({ handle: "alex", type: "view" }, { ua: "Googlebot/2.1 (+http://www.google.com/bot.html)" }),
      env,
    );
    expect(res.status).toBe(204);
    expect(d1Rows).toHaveLength(1);
    expect(d1Rows[0].binds[16]).toBe(1); // is_bot stored in D1
    expect(writeDataPoint).toHaveBeenCalledTimes(1);
    expect(writeDataPoint.mock.calls[0][0].blobs[13]).toBe("1"); // flagged bot
    expect(kv.put).not.toHaveBeenCalled();
  });

  it("still 204s when bindings are absent (degrades, never throws)", async () => {
    const res = await call(makeRequest({ handle: "alex", type: "view" }), {});
    expect(res.status).toBe(204);
  });
});
