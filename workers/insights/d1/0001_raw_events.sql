-- Insights D1 schema — raw_events
--
-- The PRIMARY raw analytics event store (local-first; WAE is a future scale
-- swap). One row per pageview / click captured by /api/beacon. The dashboard
-- queries this table directly (GROUP BY) for all windows; a pre-aggregation
-- rollup is a later optimisation, not required for correctness.
--
-- `date_key` (UTC YYYY-MM-DD) is denormalised for cheap per-day grouping.
-- `is_bot` rows are retained for forensics but excluded from creator-facing
-- aggregates (WHERE is_bot = 0).
--
-- Apply locally:
--   wrangler d1 execute INSIGHTS_DB --local --file=workers/insights/d1/0001_raw_events.sql
--
-- Story: F-INSIGHTS-D1-001.

CREATE TABLE IF NOT EXISTS raw_events (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  ts               INTEGER NOT NULL,            -- epoch milliseconds (UTC)
  date_key         TEXT    NOT NULL,            -- YYYY-MM-DD (UTC)
  handle           TEXT    NOT NULL,
  event_type       TEXT    NOT NULL,            -- 'view' | 'click'
  block_id         TEXT    NOT NULL DEFAULT '',
  path             TEXT    NOT NULL DEFAULT '',
  referrer_host    TEXT    NOT NULL DEFAULT '',
  country          TEXT    NOT NULL DEFAULT '',
  city             TEXT    NOT NULL DEFAULT '',
  device           TEXT    NOT NULL DEFAULT '',
  browser          TEXT    NOT NULL DEFAULT '',
  os               TEXT    NOT NULL DEFAULT '',
  utm_source       TEXT    NOT NULL DEFAULT '',
  utm_medium       TEXT    NOT NULL DEFAULT '',
  utm_campaign     TEXT    NOT NULL DEFAULT '',
  visitor_day_hash TEXT    NOT NULL DEFAULT '',
  is_bot           INTEGER NOT NULL DEFAULT 0
);

-- Primary access path: a creator's events within a date window.
CREATE INDEX IF NOT EXISTS raw_events_handle_date
  ON raw_events (handle, date_key);

-- Time-ordered access (recent events, hour-of-day heatmaps).
CREATE INDEX IF NOT EXISTS raw_events_handle_ts
  ON raw_events (handle, ts);
