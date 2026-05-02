-- Bug 6 fix (#149): Drop SQL DEFAULT on handle_reservations.expires_at.
--
-- The JS route (api.handle.reserve.ts) now computes expires_at from the
-- HANDLE_RESERVATION_TTL_SECONDS Workers env var (default 600 = 10 min,
-- DEC-326 = A). The SQL DEFAULT was 15 min and can no longer reflect the
-- env-var value at runtime, so it is dropped to avoid confusion.
--
-- The application always passes expires_at explicitly on INSERT, so this
-- change is backward-compatible; no INSERT needs updating.
--
-- Rollback: ALTER TABLE handle_reservations
--             ALTER COLUMN expires_at SET DEFAULT now() + interval '15 minutes';

ALTER TABLE handle_reservations ALTER COLUMN expires_at DROP DEFAULT;
