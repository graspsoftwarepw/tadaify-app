-- Migration: OTP resend rate-limit audit table
-- BR-OTP-RATE-LIMIT-001 (issue tadaify-app#179, DEC-342=A)
--
-- Stores a hashed audit trail of OTP send attempts.
-- Raw email is never stored (GDPR Art. 5 data minimisation).
-- service_role only — no end-user reads.

CREATE TABLE public.otp_rate_limit_attempts (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email_hash   TEXT        NOT NULL,     -- sha256(lower(trim(email))) hex string
  handle       TEXT,                     -- nullable: present for /register, null for /login
  attempted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  outcome      TEXT        NOT NULL CHECK (outcome IN ('sent', 'rate_limited')),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Lookup index: find recent 'sent' rows for a given email within the 24h window.
CREATE INDEX idx_otp_rate_limit_email_hash_attempted_at
  ON public.otp_rate_limit_attempts (email_hash, attempted_at DESC);

-- RLS: only service_role can read/write — no end-user access ever.
ALTER TABLE public.otp_rate_limit_attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "otp_rate_limit_service_role_only"
  ON public.otp_rate_limit_attempts
  FOR ALL
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Comment for future maintainers.
COMMENT ON TABLE public.otp_rate_limit_attempts IS
  'Audit trail for OTP resend rate-limiting (BR-OTP-RATE-LIMIT-001). '
  'Rows older than 30 days can be pruned. email_hash = sha256(lower(trim(email))). '
  'Only service_role may read/write (RLS). Raw email never stored.';
