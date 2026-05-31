/**
 * POST /api/beacon
 *
 * First-party, cookieless analytics ingestion (DEC-075/077/082). The public
 * creator page sends a small JSON beacon on pageview and on block click. This
 * Worker enriches it with edge geo (request.cf) + UA facets + a daily visitor
 * token, writes one row to Workers Analytics Engine (the raw event store), and
 * bumps a Workers KV "today" counter for the live tile.
 *
 * Anonymous endpoint (no auth — visitors aren't logged in). It NEVER stores the
 * raw IP; the IP is only an input to the daily-rotating visitor hash.
 *
 * Always responds 204 (fire-and-forget): a malformed beacon is silently
 * dropped, never surfaced to the visitor's browser.
 *
 * Story: F-INSIGHTS-CAPTURE-001.
 */

import type { Route } from "./+types/api.beacon";
import { classifyUa } from "~/lib/insights/ua-classify";
import { utcDateKey, visitorDayHash } from "~/lib/insights/visitor-hash";
import {
  buildDataPoint,
  kvCounterKey,
  validateBeacon,
  type BeaconServerContext,
} from "~/lib/insights/beacon-event";
import { RAW_EVENTS_INSERT_SQL, buildEventBindings } from "~/lib/insights/d1-events";

interface BeaconEnv {
  /** PRIMARY raw store (local-first). */
  INSIGHTS_DB?: D1Database;
  /** Future-scale secondary sink — no-op locally. */
  PAGE_EVENTS?: AnalyticsEngineDataset;
  INSIGHTS_KV?: KVNamespace;
  DAILY_SALT_SECRET?: string;
}

const NO_CONTENT = new Response(null, { status: 204 });

// KV "today" counters self-expire after 48h so the namespace stays small.
const COUNTER_TTL_SECONDS = 60 * 60 * 48;

function cfOf(request: Request): { country?: string; city?: string } {
  const cf = (request as Request & { cf?: Record<string, unknown> }).cf;
  if (!cf || typeof cf !== "object") return {};
  return {
    country: typeof cf.country === "string" ? cf.country : undefined,
    city: typeof cf.city === "string" ? cf.city : undefined,
  };
}

export async function action({ request, context }: Route.ActionArgs) {
  if (request.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405 });
  }

  const env = (context as { cloudflare?: { env?: BeaconEnv } }).cloudflare?.env ?? {};

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NO_CONTENT; // unparseable → drop silently
  }

  const validated = validateBeacon(body);
  if (!validated.ok) {
    return NO_CONTENT; // bad handle/type → drop silently
  }
  const beacon = validated.data;

  const ua = request.headers.get("user-agent") ?? "";
  const ip = request.headers.get("cf-connecting-ip") ?? "";
  const facets = classifyUa(ua);
  const { country = "", city = "" } = cfOf(request);

  const now = Date.now();
  const dateKey = utcDateKey(now);
  const selfHost = (() => {
    try {
      return new URL(request.url).host;
    } catch {
      return "";
    }
  })();

  const tokenHash = env.DAILY_SALT_SECRET
    ? await visitorDayHash({
        secret: env.DAILY_SALT_SECRET,
        dateKey,
        ip,
        userAgent: ua,
        handle: beacon.handle,
      })
    : "";

  const serverCtx: BeaconServerContext = {
    country,
    city,
    device: facets.device,
    browser: facets.browser,
    os: facets.os,
    isBot: facets.isBot,
    visitorDayHash: tokenHash,
    selfHost,
  };

  // Raw event → D1, the PRIMARY queryable store (bots included, flagged).
  if (env.INSIGHTS_DB) {
    try {
      await env.INSIGHTS_DB.prepare(RAW_EVENTS_INSERT_SQL)
        .bind(...buildEventBindings(beacon, serverCtx, now, dateKey))
        .run();
    } catch {
      // Best-effort — a single dropped event must never 5xx a visitor.
    }
  }

  // Same event → WAE (future-scale sink). No-op locally; flip reads here when
  // D1 economics no longer fit. Bots flagged for forensics.
  if (env.PAGE_EVENTS) {
    env.PAGE_EVENTS.writeDataPoint(buildDataPoint(beacon, serverCtx));
  }

  // "Today" counter → KV, humans only (creator-facing totals exclude bots).
  if (env.INSIGHTS_KV && !facets.isBot) {
    const key = kvCounterKey(beacon.type, beacon.handle, dateKey);
    try {
      const current = await env.INSIGHTS_KV.get(key);
      const next = (Number.parseInt(current ?? "0", 10) || 0) + 1;
      await env.INSIGHTS_KV.put(key, String(next), {
        expirationTtl: COUNTER_TTL_SECONDS,
      });
    } catch {
      // KV is best-effort for the live tile — never fail the beacon on it.
    }
  }

  return NO_CONTENT;
}
