/**
 * d1-events — D1 raw-event write contract (the PRIMARY, local-first store).
 *
 * Column order here MUST match `workers/insights/d1/0001_raw_events.sql`.
 * Pure + unit-tested so the bind shape is locked independently of the route.
 *
 * Story: F-INSIGHTS-D1-001.
 */

import {
  referrerHost,
  type BeaconServerContext,
  type ValidatedBeacon,
} from "./beacon-event";

export const RAW_EVENTS_INSERT_SQL =
  "INSERT INTO raw_events " +
  "(ts, date_key, handle, event_type, block_id, path, referrer_host, country, city, device, browser, os, utm_source, utm_medium, utm_campaign, visitor_day_hash, is_bot) " +
  "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

/** Ordered bind params for RAW_EVENTS_INSERT_SQL. */
export function buildEventBindings(
  beacon: ValidatedBeacon,
  ctx: BeaconServerContext,
  ts: number,
  dateKey: string,
): (string | number)[] {
  return [
    ts,
    dateKey,
    beacon.handle,
    beacon.type,
    beacon.type === "click" ? beacon.blockId : "",
    beacon.path,
    referrerHost(beacon.referrer, ctx.selfHost),
    ctx.country,
    ctx.city,
    ctx.device,
    ctx.browser,
    ctx.os,
    beacon.utmSource,
    beacon.utmMedium,
    beacon.utmCampaign,
    ctx.visitorDayHash,
    ctx.isBot ? 1 : 0,
  ];
}
