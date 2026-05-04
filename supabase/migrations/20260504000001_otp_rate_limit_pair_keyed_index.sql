-- Migration: add pair-keyed index for OTP rate-limit (email_hash + handle)
-- BR-OTP-RATE-LIMIT-001 requires the backend guard to be keyed by the
-- email-handle pair so different legitimate users sharing an email address
-- are not cross-blocked.
--
-- The original index (email_hash, attempted_at DESC) supported email-only
-- limiting. This new index supports the required pair-keyed lookup.
-- Codex review finding F1 on PR #182.

-- New composite index for pair-keyed lookups.
CREATE INDEX idx_otp_rate_limit_email_handle_attempted_at
  ON public.otp_rate_limit_attempts (email_hash, handle, attempted_at DESC);

-- Drop the old email-only index — the new one covers email-only queries
-- (handle IS NULL for login) and email+handle queries (signup).
DROP INDEX IF EXISTS idx_otp_rate_limit_email_hash_attempted_at;
