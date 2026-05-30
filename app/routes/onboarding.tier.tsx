/**
 * /onboarding/tier — Step 5/5: Plan comparison (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-tier.html (merged PR #135)
 *
 * DEC-311=A refined: read-only plan comparison.
 *   - No billing UI, no tier selection.
 *   - Every user starts on Free.
 *
 * DEC-366=A (2026-05-05): action redirects directly to /app, bypassing the
 *   intermediate /onboarding/complete celebration screen (DEC-332=D UI removed).
 *   Button label changed to "Take me to my dashboard →" — "my page" was
 *   misleading since the page is not published at this point.
 *
 * TR-tadaify-004: action INSERTs tier_slug='free' into profile_extras via
 *   service-role REST (ignore-duplicates / ON CONFLICT DO NOTHING — never
 *   overwrites existing row). tier param in URL/body is IGNORED — server
 *   enforces 'free' regardless (DEC-311=A enforcement). If user is
 *   unauthenticated (no session cookie), the DB write is skipped and the
 *   redirect still goes to /app (which itself will gate auth and redirect
 *   to /login if needed).
 *
 * URL state:
 *   loader reads → all accumulated params (for back-link construction only)
 *   action emits → /app directly (DEC-366=A), after profile_extras INSERT
 *
 * Covers: BR-ONBOARDING-005 (step 5 plan overview)
 * Story: F-ONBOARDING-001d (#139), TR-tadaify-007 + TR-tadaify-004
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/onboarding.tier";
import { CREATOR_PRICE_MONTHLY, PRO_PRICE_MONTHLY, BUSINESS_PRICE_MONTHLY } from "~/lib/tier-gate";

// ─── Worker env interface ──────────────────────────────────────────────────────

interface WorkerEnv {
  SUPABASE_URL?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
}

// ─── Auth helpers (shared pattern with app.tsx / api.account.dismiss-welcome.ts) ─

/**
 * Extracts the Supabase JWT from the Authorization header or sb-*-auth-token cookie.
 * Returns null if no token is found.
 */
export function extractAccessToken(request: Request): string | null {
  const authHeader = request.headers.get("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) return authHeader.slice(7);

  const cookieHeader = request.headers.get("Cookie") ?? "";
  for (const pair of cookieHeader.split(";").map((c) => c.trim())) {
    const eqIdx = pair.indexOf("=");
    if (eqIdx < 0) continue;
    const key = pair.slice(0, eqIdx).trim();
    const val = pair.slice(eqIdx + 1).trim();
    if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
      try {
        const parsed = JSON.parse(decodeURIComponent(val));
        if (parsed?.access_token) return parsed.access_token as string;
      } catch {
        // Not JSON — skip
      }
    }
  }
  return null;
}

/**
 * R2 key pattern validation. Ensures the key matches the expected format
 * produced by the upload route: avatars/<userId>/<uuid>.<ext>
 * The userId parameter is checked against the key's userId segment to prevent
 * a user from binding another user's avatar to their own row.
 */
const AVATAR_R2_KEY_RE = /^avatars\/([a-f0-9-]+)\/[a-f0-9-]+\.(jpg|png|webp)$/;

export function isValidAvatarR2Key(key: string, userId: string): boolean {
  const match = key.match(AVATAR_R2_KEY_RE);
  if (!match) return false;
  return match[1] === userId;
}

/**
 * Persists tier_slug='free' into profile_extras for the authenticated user.
 * Uses INSERT with ON CONFLICT DO NOTHING (ignore-duplicates) so an existing
 * row (potentially with a non-free tier) is never overwritten (ECN-139-02).
 * Throws on real persistence failures so the action cannot claim completion
 * while no row was created.
 * Graceful skip: returns silently when env vars are missing (dev/test).
 * TR-tadaify-004: tier param is NEVER used here — always writes 'free'.
 */
export async function upsertTierFree(userId: string, env: WorkerEnv): Promise<void> {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.warn("[onboarding.tier] SUPABASE env vars missing — skipping profile_extras INSERT");
    return;
  }

  const res = await fetch(`${supabaseUrl}/rest/v1/profile_extras`, {
    method: "POST",
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: "resolution=ignore-duplicates,return=minimal",
    },
    body: JSON.stringify({
      user_id: userId,
      tier_slug: "free",
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[onboarding.tier] profile_extras INSERT failed: ${res.status} ${body}`,
    );
  }
}

/**
 * Persists avatar_r2_key into profile_extras for the authenticated user.
 * Called AFTER upsertTierFree so the row is guaranteed to exist.
 * Uses PATCH with user_id filter (service-role bypasses RLS).
 * Validates the key pattern and ownership before writing.
 * Codex follow-up Finding 1: binds uploaded R2 key to profile_extras so the
 * orphan-cleanup cron does not delete active avatars after 24h.
 */
export async function persistAvatarR2Key(
  userId: string,
  avatarR2Key: string,
  env: WorkerEnv,
): Promise<void> {
  const supabaseUrl = env.SUPABASE_URL;
  const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    console.warn("[onboarding.tier] SUPABASE env vars missing — skipping avatar_r2_key UPDATE");
    return;
  }

  if (!isValidAvatarR2Key(avatarR2Key, userId)) {
    console.warn(
      `[onboarding.tier] avatar_r2_key rejected — pattern mismatch or userId mismatch: ${avatarR2Key}`,
    );
    return;
  }

  const res = await fetch(
    `${supabaseUrl}/rest/v1/profile_extras?user_id=eq.${userId}`,
    {
      method: "PATCH",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ avatar_r2_key: avatarR2Key }),
    },
  );

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(
      `[onboarding.tier] profile_extras avatar_r2_key UPDATE failed: ${res.status} ${body}`,
    );
  }
}

// ─── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  const platforms = url.searchParams.get("platforms") ?? "";
  const socials = url.searchParams.get("socials") ?? "";
  const name = url.searchParams.get("name") ?? "";
  const bio = url.searchParams.get("bio") ?? "";
  const av = url.searchParams.get("av") ?? "";
  const tpl = url.searchParams.get("tpl") ?? "";
  // tier param in URL is intentionally ignored — DEC-311=A: always free
  return { handle, platforms, socials, name, bio, av, tpl };
}

// ─── Action ────────────────────────────────────────────────────────────────────
// DEC-366=A: CTA submits form → action redirects directly to /app.
// TR-tadaify-004: action INSERTs tier_slug='free' into profile_extras BEFORE redirect.
// tier param in URL/body is IGNORED — server always writes 'free' (DEC-311=A / ECN-139-01).
// Codex Finding 1: authenticated users with env configured → throw on failed DB write.
// Codex Finding 2: throw on /auth/v1/user infrastructure failures (5xx, malformed 200).
// Graceful skip only for: missing env vars, missing session, or expired/invalid token (401/403).

export async function action({ request, context }: Route.ActionArgs) {
  const env = (context as { cloudflare?: { env?: WorkerEnv } }).cloudflare?.env ?? {};
  const url = new URL(request.url);
  const avatarR2Key = url.searchParams.get("av") ?? "";

  // Verify JWT and extract user ID so we can write to profile_extras.
  const accessToken = extractAccessToken(request);
  if (accessToken) {
    const supabaseUrl = env.SUPABASE_URL;
    const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;
    if (supabaseUrl && serviceKey) {
      const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
        headers: {
          apikey: serviceKey,
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (userRes.ok) {
        const userData = (await userRes.json()) as { id?: string };
        if (!userData?.id) {
          // Malformed 200 — Supabase returned OK but no user id. Treat as infra failure.
          throw new Error(
            `[onboarding.tier] /auth/v1/user returned 200 but no user id`,
          );
        }
        // upsertTierFree throws on real DB failures — let it propagate (500).
        await upsertTierFree(userData.id, env);

        // Codex follow-up Finding 1: persist avatar_r2_key AFTER tier row exists.
        // Validates key pattern + ownership (userId segment must match).
        if (avatarR2Key) {
          await persistAvatarR2Key(userData.id, avatarR2Key, env);
        }
      } else if (userRes.status === 401 || userRes.status === 403) {
        // Expired or invalid token — graceful skip, /app loader will gate auth.
        console.warn(
          `[onboarding.tier] /auth/v1/user returned ${userRes.status} — token expired/invalid, skipping tier persistence`,
        );
      } else {
        // Infrastructure failure (5xx, unexpected status) — throw so we don't
        // silently skip tier persistence while advancing the user to /app.
        const body = await userRes.text().catch(() => "");
        throw new Error(
          `[onboarding.tier] /auth/v1/user failed: ${userRes.status} ${body}`,
        );
      }
    }
  }
  // Always redirect to /app — unauthenticated case is handled by /app loader itself.
  return redirect("/app");
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function TierPage({ loaderData }: Route.ComponentProps) {
  const { handle, platforms, socials, name, bio, av, tpl } = loaderData;

  // Back URL preserves accumulated state (Slice C: back to template, step 4/5)
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (tpl) backParams.set("tpl", tpl);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  if (name) backParams.set("name", name);
  if (bio) backParams.set("bio", bio);
  if (av) backParams.set("av", av);
  const backUrl = `/onboarding/template?${backParams.toString()}`;

  return (
    <>
      {/* Progress bar: step 5 of 5 (Slice C revision: 4 → 5 steps) */}
      <div className="progress-bar">
        <div className="progress-step done"><span className="progress-dot"></span></div>
        <div className="progress-line done"></div>
        <div className="progress-step done"><span className="progress-dot"></span></div>
        <div className="progress-line done"></div>
        <div className="progress-step done"><span className="progress-dot"></span></div>
        <div className="progress-line done"></div>
        <div className="progress-step done"><span className="progress-dot"></span></div>
        <div className="progress-line done"></div>
        <div className="progress-step active"><span className="progress-dot"></span></div>
      </div>
      <p className="progress-label">Step 5 of 5 · Compare plans</p>

      <div style={{ textAlign: "center", marginTop: 40 }}>
        <h1>You're all set — starting on Free.</h1>
        <p className="lead text-muted" style={{ marginTop: 12, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          Most features are <strong>free to try</strong>. Take tadaify for a spin, build your page, see if it fits — then
          upgrade anytime from <strong>Settings → Billing</strong> if you want more pages, custom domains, or extra AI credits.
        </p>
      </div>

      <div className="onb-tier-recommendation">
        ✨ No credit card needed today. Here's what each plan includes so you know what's available when you're ready.
      </div>

      {/* Price-lock-for-life guarantee — info only, applies once user upgrades */}
      <div className="onb-tier-pricelock">
        <div className="onb-tier-pricelock-icon" aria-hidden="true">🔒</div>
        <div className="onb-tier-pricelock-body">
          <h4 className="onb-tier-pricelock-title">When you do upgrade, your price is locked for life.</h4>
          <p className="onb-tier-pricelock-text">
            Subscribe at <strong>$7.99/mo</strong> later → pay <strong>$7.99/mo</strong> in year 3, year 5, year 10.
            As long as your subscription stays active, we <strong>never</strong> raise your price. Ever.
            Only if you cancel and re-subscribe do you pay the then-current price.
          </p>
        </div>
      </div>

      {/* Tier cards: read-only comparison (DEC-311=A refined) */}
      <div className="onb-tier-grid">
        <div className="onb-tier-card onb-tier-starting" data-tier="free">
          <div className="onb-tier-ribbon">✓ Your starting plan</div>
          <h3>Free</h3>
          <div className="onb-tier-price">$0</div>
          <div className="text-sm text-muted">Forever · no credit card</div>
          <ul>
            <li>1 page (homepage) <span className="onb-tier-soon">coming soon</span></li>
            <li>All core features</li>
            <li>Unlimited blocks</li>
            <li>30d analytics</li>
            <li>5 AI credits/mo</li>
            <li>tadaify.com/you subdomain</li>
          </ul>
        </div>

        <div className="onb-tier-card" data-tier="creator">
          <h3>Creator</h3>
          <div className="onb-tier-price">{CREATOR_PRICE_MONTHLY} <span className="onb-tier-per">/mo</span></div>
          <div className="text-sm text-muted">Billed annually · $95.88/yr</div>
          <span className="onb-tier-lock-badge" title="Price locked as long as your subscription stays active">🔒 Locked for life</span>
          <ul>
            <li>5 pages — privacy, about, portfolio… <span className="onb-tier-soon">coming soon</span></li>
            <li>Everything in Free</li>
            <li>1 custom domain included</li>
            <li>180d analytics</li>
            <li>20 AI credits/mo</li>
            <li>Sell products + communities</li>
            <li>Priority support</li>
          </ul>
        </div>

        <div className="onb-tier-card" data-tier="pro">
          <h3>Pro</h3>
          <div className="onb-tier-price">{PRO_PRICE_MONTHLY} <span className="onb-tier-per">/mo</span></div>
          <div className="text-sm text-muted">Billed annually · $239.88/yr</div>
          <span className="onb-tier-lock-badge" title="Price locked as long as your subscription stays active">🔒 Locked for life</span>
          <ul>
            <li>20 pages <span className="onb-tier-soon">coming soon</span></li>
            <li>Everything in Creator</li>
            <li>1 custom domain included</li>
            <li>Unlimited analytics</li>
            <li>100 AI credits/mo</li>
            <li>Creator API + MCP server (Claude/ChatGPT)</li>
            <li>A/B testing</li>
            <li>Advanced integrations</li>
          </ul>
        </div>

        <div className="onb-tier-card" data-tier="business">
          <h3>Business</h3>
          <div className="onb-tier-price">{BUSINESS_PRICE_MONTHLY} <span className="onb-tier-per">/mo</span></div>
          <div className="text-sm text-muted">Billed annually · $599.88/yr</div>
          <span className="onb-tier-lock-badge" title="Price locked as long as your subscription stays active">🔒 Locked for life</span>
          <ul>
            <li>Unlimited pages <span className="onb-tier-soon">coming soon</span></li>
            <li>Everything in Pro</li>
            <li>10 custom domains (agency)</li>
            <li>Agency multi-client</li>
            <li>Unlimited AI credits</li>
            <li>White-label exports</li>
            <li>Dedicated success manager</li>
          </ul>
        </div>
      </div>

      {/* Universal add-on: applies to every plan, not just Free */}
      <div className="onb-tier-addon">
        <span className="onb-tier-addon-plus">+</span>
        <p>
          Need extra domains later? Add <strong>$1.99/mo per custom domain</strong> to any plan — Free included. No upgrade needed.
        </p>
      </div>

      {/* DEC-366=A: action redirects to /app directly — no form data needed.
          DEC-311=A: single CTA, every user starts Free; upgrade lives in Settings → Billing. */}
      <div style={{ display: "flex", gap: 12, marginTop: 40, flexWrap: "wrap", justifyContent: "center" }}>
        <form method="post">
          <button type="submit" className="btn btn-primary btn-lg">
            Take me to my dashboard →
          </button>
        </form>
      </div>

      <p className="text-sm text-muted" style={{ textAlign: "center", marginTop: 20 }}>
        Upgrade whenever you want from <strong>Settings → Billing</strong>. 30-day money-back on any paid tier.<br />
        🔒 <strong>Price locked for life</strong> — we never raise the price on active subscribers.
      </p>

      <p style={{ textAlign: "center", marginTop: 24 }}>
        <Link to={backUrl} className="text-sm text-muted">← back</Link>
      </p>
    </>
  );
}
