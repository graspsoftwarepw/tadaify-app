/**
 * Unit tests for POST /api/feedback.
 *
 * Story: F-FEEDBACK-001 (tadaify-app#56 follow-up).
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { action, validateFeedbackBody, TITLE_MAX_LENGTH } from "./api.feedback";

const SUPABASE_URL = "http://localhost:44210";
const SERVICE_KEY = "test-service-key";

function makeContext() {
  return { cloudflare: { env: { SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY: SERVICE_KEY } } };
}

function makeRequest(opts: { method?: string; cookie?: string; body?: unknown }): Request {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (opts.cookie) headers["Cookie"] = opts.cookie;
  return new Request("http://localhost/api/feedback", {
    method: opts.method ?? "POST",
    headers,
    body: opts.body === undefined ? undefined : JSON.stringify(opts.body),
  });
}

const AUTH_COOKIE = `sb-localhost-auth-token=${encodeURIComponent(
  JSON.stringify({ access_token: "valid-token" }),
)}`;

const VALID = { topic: "bug", title: "It broke", body: "Schedule block fails on mobile" };

describe("validateFeedbackBody", () => {
  it("accepts a valid submission, trimming + defaulting contact_ok", () => {
    expect(validateFeedbackBody({ topic: "idea", title: "  Hi  ", body: "  more  " })).toEqual({
      ok: true,
      data: { topic: "idea", title: "Hi", body: "more", contact_ok: true },
    });
    expect(
      (validateFeedbackBody({ ...VALID, contact_ok: false }) as { data: { contact_ok: boolean } }).data
        .contact_ok,
    ).toBe(false);
  });

  it("rejects bad topic, empty/over-long title, empty body", () => {
    expect(validateFeedbackBody({ ...VALID, topic: "rant" }).ok).toBe(false);
    expect(validateFeedbackBody({ ...VALID, title: "" }).ok).toBe(false);
    expect(validateFeedbackBody({ ...VALID, title: "x".repeat(TITLE_MAX_LENGTH + 1) }).ok).toBe(false);
    expect(validateFeedbackBody({ ...VALID, body: "   " }).ok).toBe(false);
  });
});

describe("api.feedback action (mocked fetch)", () => {
  let mockFetch: ReturnType<typeof vi.fn>;
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    mockFetch = vi.fn();
    globalThis.fetch = mockFetch as unknown as typeof fetch;
  });
  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("rejects non-POST", async () => {
    const res = (await action({
      request: makeRequest({ method: "GET" }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(405);
  });

  it("401 without auth", async () => {
    const res = (await action({
      request: makeRequest({ body: VALID }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(401);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("400 on validation failure before resolving user", async () => {
    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: { topic: "nope" } }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(400);
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it("inserts feedback with the resolved user_id", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-9" }) } as Response)
      .mockResolvedValueOnce({ ok: true, text: async () => "" } as Response);

    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: VALID }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;

    expect(res.status).toBe(200);
    const [url, init] = mockFetch.mock.calls[1];
    expect(url).toContain("/rest/v1/feedback");
    expect(init.method).toBe("POST");
    expect(JSON.parse(init.body)).toEqual({
      user_id: "user-9",
      topic: "bug",
      title: "It broke",
      body: "Schedule block fails on mobile",
      contact_ok: true,
    });
  });

  it("500 when the insert fails", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => ({ id: "user-9" }) } as Response)
      .mockResolvedValueOnce({ ok: false, text: async () => "db error" } as Response);

    const res = (await action({
      request: makeRequest({ cookie: AUTH_COOKIE, body: VALID }),
      context: makeContext(),
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any)) as Response;
    expect(res.status).toBe(500);
  });
});
