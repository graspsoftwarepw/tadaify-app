/**
 * MOCK_R2 — in-memory R2 binding stub for local dev + tests.
 *
 * Activated when `MOCK_R2=1` env var is set (via .dev.vars or test env).
 * In production R2 mode, the real Cloudflare R2 binding is used instead.
 *
 * Implements the same interface as the Cloudflare R2Bucket binding
 * (subset: put, get, delete, list).
 *
 * Story: F-ONBOARDING-001c (tadaify-app#138)
 * TR-tadaify-003: MOCK_R2 stub for non-prod environments
 */

// ── Storage ───────────────────────────────────────────────────────────────────

interface MockR2Object {
  body: Uint8Array;
  contentType: string;
  uploadedAt: Date;
}

const store = new Map<string, MockR2Object>();

// Track keys that should fail once (for MOCK_R2_FAIL_FIRST testing)
let failNextPut = false;

export function setFailNextPut(val: boolean): void {
  failNextPut = val;
}

// ── R2 Bucket interface (subset) ───────────────────────────────────────────────

export interface R2PutOptions {
  httpMetadata?: { contentType?: string };
}

export interface MockR2GetResult {
  arrayBuffer(): Promise<ArrayBuffer>;
  httpMetadata?: { contentType?: string };
}

export const mockR2: {
  put(key: string, value: ArrayBuffer | Uint8Array, options?: R2PutOptions): Promise<void>;
  get(key: string): Promise<MockR2GetResult | null>;
  delete(key: string): Promise<void>;
  list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string; uploadedAt: Date }> }>;
  has(key: string): boolean;
  clear(): void;
} = {
  async put(key: string, value: ArrayBuffer | Uint8Array, options?: R2PutOptions): Promise<void> {
    if (failNextPut) {
      failNextPut = false;
      throw new Error("MOCK_R2_FAIL_FIRST: simulated PUT failure");
    }
    const bytes = value instanceof Uint8Array ? value : new Uint8Array(value);
    store.set(key, {
      body: bytes,
      contentType: options?.httpMetadata?.contentType ?? "application/octet-stream",
      uploadedAt: new Date(),
    });
  },

  async get(key: string): Promise<MockR2GetResult | null> {
    const obj = store.get(key);
    if (!obj) return null;
    const body = obj.body;
    const contentType = obj.contentType;
    return {
      async arrayBuffer(): Promise<ArrayBuffer> {
        return body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer;
      },
      httpMetadata: { contentType },
    };
  },

  async delete(key: string): Promise<void> {
    store.delete(key);
  },

  async list(options?: { prefix?: string }): Promise<{ objects: Array<{ key: string; uploadedAt: Date }> }> {
    const prefix = options?.prefix ?? "";
    const objects = [];
    for (const [key, obj] of store.entries()) {
      if (key.startsWith(prefix)) {
        objects.push({ key, uploadedAt: obj.uploadedAt });
      }
    }
    return { objects };
  },

  has(key: string): boolean {
    return store.has(key);
  },

  clear(): void {
    store.clear();
    failNextPut = false;
  },
};
