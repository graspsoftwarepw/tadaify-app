/**
 * beacon-event — canonical analytics event contract for the WAE pipeline.
 *
 * Defines the FIXED WAE blob layout that the beacon endpoint writes and the
 * (future) D1 rollup cron reads. Changing a blob index here is a breaking
 * change to the analytics schema — append, never reorder.
 *
 * WAE row layout
 *   indexes[0] = handle              (analytics partition / sampling key)
 *   doubles[0] = 1                   (event count)
 *   blobs[0]   = event_type          ("view" | "click")
 *   blobs[1]   = block_id            ("" for views)
 *   blobs[2]   = path                (page slug, no query string)
 *   blobs[3]   = referrer_host       (host only — no full URL, privacy)
 *   blobs[4]   = country             (request.cf.country)
 *   blobs[5]   = city                (request.cf.city — never the IP)
 *   blobs[6]   = device              (mobile|tablet|desktop|bot|unknown)
 *   blobs[7]   = browser
 *   blobs[8]   = os
 *   blobs[9]   = utm_source
 *   blobs[10]  = utm_medium
 *   blobs[11]  = utm_campaign
 *   blobs[12]  = visitor_day_hash    (cookieless daily token — DEC-075)
 *   blobs[13]  = is_bot              ("1" | "0")
 *
 * Story: F-INSIGHTS-CAPTURE-001 (DEC-075/077/078/082).
 */

/** Matches profiles.handle CHECK constraint (2–30, lower alnum + underscore). */
const HANDLE_RE = /^[a-z0-9](?:[a-z0-9_]{1,29})?$/;

export type BeaconEventType = "view" | "click";

/** Untrusted client payload (sent from the public page). */
export interface BeaconInput {
  /** Creator handle (partition key). */
  handle: string;
  type: BeaconEventType;
  /** Block id — required for clicks, ignored for views. */
  blockId?: string;
  /** Page path/slug (no query string). */
  path?: string;
  /** Full or partial referrer URL (host is extracted server-side). */
  referrer?: string;
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
}

export interface ValidatedBeacon {
  handle: string;
  type: BeaconEventType;
  blockId: string;
  path: string;
  referrer: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
}

function clampStr(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  return v.slice(0, max);
}

/**
 * Validate + normalize a client beacon. Rejects anything without a well-formed
 * handle + known event type; everything else is clamped, not rejected (a beacon
 * should be lossy-tolerant, never 4xx on a slightly-odd payload).
 */
export function validateBeacon(
  body: unknown,
): { ok: true; data: ValidatedBeacon } | { ok: false; error: string } {
  if (typeof body !== "object" || body === null) {
    return { ok: false, error: "body must be an object" };
  }
  const b = body as Record<string, unknown>;

  const handle = typeof b.handle === "string" ? b.handle.toLowerCase() : "";
  if (!HANDLE_RE.test(handle)) {
    return { ok: false, error: "invalid handle" };
  }
  if (b.type !== "view" && b.type !== "click") {
    return { ok: false, error: "invalid type" };
  }

  return {
    ok: true,
    data: {
      handle,
      type: b.type,
      blockId: clampStr(b.blockId, 64),
      path: clampStr(b.path, 512),
      referrer: clampStr(b.referrer, 1024),
      utmSource: clampStr(b.utmSource, 128),
      utmMedium: clampStr(b.utmMedium, 128),
      utmCampaign: clampStr(b.utmCampaign, 128),
    },
  };
}

/**
 * Extract just the host from a referrer URL (privacy: we never store the full
 * referring URL/path). Same-origin / empty referrers collapse to "".
 */
export function referrerHost(referrer: string, selfHost: string): string {
  if (!referrer) return "";
  try {
    const host = new URL(referrer).host.toLowerCase();
    if (!host || host === selfHost.toLowerCase()) return "";
    return host.slice(0, 255);
  } catch {
    return "";
  }
}

/** Server-derived facets attached to every event. */
export interface BeaconServerContext {
  country: string;
  city: string;
  device: string;
  browser: string;
  os: string;
  isBot: boolean;
  visitorDayHash: string;
  /** Self host, used to drop same-origin referrers. */
  selfHost: string;
}

export interface AnalyticsDataPoint {
  indexes: string[];
  doubles: number[];
  blobs: string[];
}

/** Build the WAE data point from a validated beacon + server context. */
export function buildDataPoint(
  beacon: ValidatedBeacon,
  ctx: BeaconServerContext,
): AnalyticsDataPoint {
  return {
    indexes: [beacon.handle],
    doubles: [1],
    blobs: [
      beacon.type, // 0
      beacon.type === "click" ? beacon.blockId : "", // 1
      beacon.path, // 2
      referrerHost(beacon.referrer, ctx.selfHost), // 3
      clampStr(ctx.country, 8), // 4
      clampStr(ctx.city, 80), // 5
      clampStr(ctx.device, 16), // 6
      clampStr(ctx.browser, 32), // 7
      clampStr(ctx.os, 16), // 8
      beacon.utmSource, // 9
      beacon.utmMedium, // 10
      beacon.utmCampaign, // 11
      clampStr(ctx.visitorDayHash, 32), // 12
      ctx.isBot ? "1" : "0", // 13
    ],
  };
}

/** KV key for the per-day "today" counter (views or clicks). */
export function kvCounterKey(
  type: BeaconEventType,
  handle: string,
  dateKey: string,
): string {
  return `${type === "view" ? "v" : "c"}:${handle}:${dateKey}`;
}
