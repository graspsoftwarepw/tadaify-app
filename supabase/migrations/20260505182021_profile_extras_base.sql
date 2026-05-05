-- Migration: profile_extras_base — TR-tadaify-007 contract
-- Story: F-ONBOARDING-001d (#139)
--
-- Ships the base `profile_extras` table that holds onboarding/profile-side
-- fields that don't belong on auth.users and aren't part of the public
-- profiles blob (handle/name/bio).
--
-- Design decisions:
--   - Single table, incrementally extended via ALTER ADD COLUMN per sub-feature.
--   - FK ON DELETE CASCADE covers GDPR Art. 17 (right to erasure) automatically.
--   - RLS: own-row SELECT / INSERT / UPDATE; service_role bypass for Stripe
--     webhook (F-PRICING-001 future) and admin ops.
--   - updated_at trigger fires on every row mutation.
--   - IF NOT EXISTS / CREATE OR REPLACE guards for idempotency across
--     supabase db reset cycles and manual re-runs.
--
-- Sister migration that depends on this one shipping FIRST:
--   tadaify-app#138 — ALTER TABLE public.profile_extras ADD COLUMN avatar_r2_key TEXT NULL

-- ── Table ─────────────────────────────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS public.profile_extras (
  user_id     UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  tier_slug   TEXT NOT NULL DEFAULT 'free'
              CHECK (tier_slug IN ('free', 'creator', 'pro', 'business')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ── RLS ───────────────────────────────────────────────────────────────────────

ALTER TABLE public.profile_extras ENABLE ROW LEVEL SECURITY;

-- Own-row SELECT
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profile_extras'
      AND policyname = 'profile_extras_own_select'
  ) THEN
    CREATE POLICY "profile_extras_own_select" ON public.profile_extras
      FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

-- Own-row INSERT (WITH CHECK prevents inserting on behalf of another user)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profile_extras'
      AND policyname = 'profile_extras_own_insert'
  ) THEN
    CREATE POLICY "profile_extras_own_insert" ON public.profile_extras
      FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- Own-row UPDATE
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename  = 'profile_extras'
      AND policyname = 'profile_extras_own_update'
  ) THEN
    CREATE POLICY "profile_extras_own_update" ON public.profile_extras
      FOR UPDATE
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

-- service_role bypasses RLS by default in Supabase — this means:
--   - Stripe webhook (F-PRICING-001 future) can mutate tier_slug via service_role
--   - Admin ops and GDPR delete_user_data() RPC (SECURITY DEFINER) can access all rows
-- No explicit service_role policy needed — the bypass is Supabase infrastructure default.

-- ── updated_at trigger ────────────────────────────────────────────────────────

CREATE OR REPLACE FUNCTION public.profile_extras_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger
    WHERE tgname = 'profile_extras_set_updated_at'
      AND tgrelid = 'public.profile_extras'::regclass
  ) THEN
    CREATE TRIGGER profile_extras_set_updated_at
      BEFORE UPDATE ON public.profile_extras
      FOR EACH ROW EXECUTE FUNCTION public.profile_extras_set_updated_at();
  END IF;
END $$;

-- ── GDPR: update delete_user_data() RPC ──────────────────────────────────────
-- Add DELETE FROM profile_extras to the existing GDPR data-deletion RPC.
-- Defensive: ON DELETE CASCADE on auth.users FK also removes the row, but
-- the explicit DELETE here is belt-and-suspenders for direct RPC calls
-- (e.g. user clicking Settings → Delete Account before auth.users deletion).

CREATE OR REPLACE FUNCTION public.delete_user_data(p_user_id uuid)
  RETURNS void
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = public
AS $$
BEGIN
  -- Ownership guard: caller must be the same user they are deleting.
  IF auth.uid() IS DISTINCT FROM p_user_id THEN
    RAISE EXCEPTION 'permission denied: caller % cannot delete data for %',
      auth.uid(), p_user_id
      USING ERRCODE = '42501';
  END IF;

  DELETE FROM profile_extras      WHERE user_id = p_user_id;
  DELETE FROM blocks              WHERE user_id = p_user_id;
  DELETE FROM pages               WHERE user_id = p_user_id;
  DELETE FROM account_settings    WHERE id      = p_user_id;
  DELETE FROM profiles            WHERE id      = p_user_id;
  -- auth.users deletion handled by caller (service_role) via Supabase Admin API.
END;
$$;

GRANT EXECUTE ON FUNCTION public.delete_user_data(uuid) TO authenticated;

-- ── Comments ──────────────────────────────────────────────────────────────────

COMMENT ON TABLE public.profile_extras IS
  'Shared profile-side extras keyed on user_id. Incrementally extended per sub-feature '
  '(each adds a NULLABLE column via ALTER TABLE). Initial column: tier_slug. '
  'TR-tadaify-007 data contract. F-ONBOARDING-001d (#139).';

COMMENT ON COLUMN public.profile_extras.tier_slug IS
  'Billing tier slug. Written as ''free'' on onboarding completion (DEC-311=A). '
  'Mutated to non-free values only by the Stripe webhook (F-PRICING-001, future). '
  'TR-tadaify-004.';
