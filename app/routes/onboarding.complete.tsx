/**
 * /onboarding/complete — SSR redirect to /app (DEC-366=A)
 *
 * DEC-366=A (2026-05-05): skip the intermediate "tada! 🎉" celebration screen;
 * both loader and action redirect immediately to /app. The celebration will be
 * surfaced as a first-publish overlay once the page editor ships.
 *
 * Historical UI render (DEC-332=D "page coming soon" semantics) is removed.
 * If an inbound GET hits this route (deep-link, back-nav), the loader's 302
 * redirect is safe — user lands on /app rather than a stale/blank celebration.
 *
 * DB finalization note: onboarding_completed_at is set by a Supabase Auth Hook
 * on the before-user-created / post-sign-in chain, not here. No DB work is
 * needed in this route handler.
 *
 * Covers: BR-ONBOARDING-006 (post-wizard success)
 *
 * DEC trail:
 *   DEC-311=A  tier is always "free" — this route no longer reads tier
 *   DEC-332=D  "page coming soon" UI — REMOVED per DEC-366=A
 *   DEC-366=A  skip intermediate screen; redirect to /app directly
 */

import { redirect } from "react-router";
import type { Route } from "./+types/onboarding.complete";

// ─── Loader ────────────────────────────────────────────────────────────────────
// Any GET to /onboarding/complete (back-nav, deep-link) → 302 /app

export async function loader(_: Route.LoaderArgs) {
  return redirect("/app");
}

// ─── Action ────────────────────────────────────────────────────────────────────
// POST from any lingering form submission → 302 /app

export async function action(_: Route.ActionArgs) {
  return redirect("/app");
}

// No default export — this route renders nothing.
// React Router requires at least a loader or action; both are defined above.
