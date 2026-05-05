-- Migration: profile_extras RLS tier lockdown — Codex P1 security fix
-- Story: F-ONBOARDING-001d (#139)
--
-- Fixes: authenticated users could self-escalate tier_slug to paid tiers
-- (creator/pro/business) by calling the Supabase REST API directly with
-- their JWT. This violates TR-tadaify-004: only the Stripe webhook
-- (service_role) may mutate tier_slug to a non-free value.
--
-- Changes:
--   1. INSERT policy: WITH CHECK now enforces tier_slug = 'free'.
--   2. UPDATE policy: WITH CHECK now enforces tier_slug stays unchanged
--      (immutable for authenticated users — only service_role can change it).
--   3. service_role bypass (Supabase default) remains — no explicit policy needed.

-- ── 1. Tighten INSERT: authenticated can only insert tier_slug='free' ─────────

DROP POLICY IF EXISTS "profile_extras_own_insert" ON public.profile_extras;

CREATE POLICY "profile_extras_own_insert" ON public.profile_extras
  FOR INSERT
  WITH CHECK (auth.uid() = user_id AND tier_slug = 'free');

-- ── 2. Tighten UPDATE: authenticated cannot change tier_slug ──────────────────
-- The subquery reads the current stored tier_slug; WITH CHECK ensures the
-- new value equals the old value, making tier_slug effectively immutable
-- for authenticated users. Future columns (avatar_r2_key, etc.) are not
-- constrained — they can be updated freely.

DROP POLICY IF EXISTS "profile_extras_own_update" ON public.profile_extras;

CREATE POLICY "profile_extras_own_update" ON public.profile_extras
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (
    auth.uid() = user_id
    AND tier_slug = (
      SELECT pe.tier_slug
      FROM public.profile_extras pe
      WHERE pe.user_id = auth.uid()
    )
  );
