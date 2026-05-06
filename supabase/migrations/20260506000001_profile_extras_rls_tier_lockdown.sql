-- Migration: profile_extras RLS tier lockdown — Codex P1 security fix (v2)
-- Story: F-ONBOARDING-001d (#139)
--
-- Fixes: authenticated users could self-escalate tier_slug to paid tiers
-- (creator/pro/business) by calling the Supabase REST API directly with
-- their JWT. This violates TR-tadaify-004: only the Stripe webhook
-- (service_role) may mutate tier_slug to a non-free value.
--
-- v2 (Codex follow-up P1): replaced the self-referential RLS subquery
-- with a BEFORE UPDATE trigger. The original UPDATE policy queried
-- public.profile_extras from inside an RLS policy on the same table,
-- which can cause policy recursion in PostgreSQL. The trigger approach
-- is non-recursive and cleanly separates ownership RLS from column
-- immutability enforcement.
--
-- Changes:
--   1. INSERT policy: WITH CHECK now enforces tier_slug = 'free'.
--   2. UPDATE policy: simple ownership (no self-reference); tier_slug
--      immutability enforced by trigger (fires only for authenticated role).
--   3. service_role bypass (Supabase default) remains — no explicit policy needed.

-- ── 1. Tighten INSERT: authenticated can only insert tier_slug='free' ─────────

DROP POLICY IF EXISTS "profile_extras_own_insert" ON public.profile_extras;

CREATE POLICY "profile_extras_own_insert" ON public.profile_extras
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND tier_slug = 'free');

-- ── 2. Tighten UPDATE: ownership-only RLS + trigger for tier immutability ─────
-- RLS policy checks ownership (no self-referential subquery).
-- Tier_slug immutability is enforced by the guard trigger below.

DROP POLICY IF EXISTS "profile_extras_own_update" ON public.profile_extras;

CREATE POLICY "profile_extras_own_update" ON public.profile_extras
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- ── 3. Guard trigger: tier_slug immutability for authenticated users ──────────
-- Uses current_setting('role') to identify the PostgreSQL session role.
-- In Supabase: authenticated requests → 'authenticated', service_role → bypasses.
-- This avoids the RLS recursion that the self-referential subquery caused.

CREATE OR REPLACE FUNCTION public.profile_extras_guard_tier_slug()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  -- Only enforce for authenticated role; service_role/postgres bypass
  IF current_setting('role') = 'authenticated'
     AND OLD.tier_slug IS DISTINCT FROM NEW.tier_slug THEN
    RAISE EXCEPTION 'tier_slug is immutable for authenticated users; only service_role may change it'
      USING ERRCODE = '42501';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profile_extras_guard_tier_slug ON public.profile_extras;

CREATE TRIGGER profile_extras_guard_tier_slug
  BEFORE UPDATE ON public.profile_extras
  FOR EACH ROW
  EXECUTE FUNCTION public.profile_extras_guard_tier_slug();
