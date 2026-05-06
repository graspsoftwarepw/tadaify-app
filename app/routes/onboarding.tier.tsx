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

// ─── Tier data ─────────────────────────────────────────────────────────────────

const TIERS = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    period: "",
    highlight: true,
    ribbon: "Your starting plan",
    features: [
      "1 page",
      "5 AI credits / day",
      "All core link blocks",
      "Custom handle",
      "Basic analytics",
      "tadaify.com/<handle>",
    ],
  },
  {
    id: "creator",
    name: "Creator",
    price: CREATOR_PRICE_MONTHLY,
    period: "/mo",
    highlight: false,
    ribbon: null,
    features: [
      "5 pages",
      "50 AI credits / day",
      "Priority blocks (booking, newsletter)",
      "Custom domain",
      "Advanced analytics",
      "Remove tadaify badge",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    price: PRO_PRICE_MONTHLY,
    period: "/mo",
    highlight: false,
    ribbon: null,
    features: [
      "Unlimited pages",
      "200 AI credits / day",
      "Affiliate program access",
      "Pro integrations",
      "Team collaboration (2 seats)",
      "Priority support",
    ],
  },
  {
    id: "business",
    name: "Business",
    price: BUSINESS_PRICE_MONTHLY,
    period: "/mo",
    highlight: false,
    ribbon: null,
    features: [
      "Everything in Pro",
      "Unlimited AI credits",
      "White-label option",
      "10 team seats",
      "Custom integrations",
      "Dedicated support",
    ],
  },
] as const;

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

  // Back URL preserves accumulated state
  const backParams = new URLSearchParams();
  if (handle) backParams.set("handle", handle);
  if (platforms) backParams.set("platforms", platforms);
  if (socials) backParams.set("socials", socials);
  if (name) backParams.set("name", name);
  if (bio) backParams.set("bio", bio);
  if (av) backParams.set("av", av);
  if (tpl) backParams.set("tpl", tpl);
  const backUrl = `/onboarding/template?${backParams.toString()}`;

  return (
    <div style={{ maxWidth: 900 }}>
      <p
        style={{
          fontSize: 15,
          color: "var(--fg-muted)",
          lineHeight: 1.6,
          marginBottom: 28,
          marginTop: -16,
        }}
      >
        Most features are <strong>free to try</strong>. Take tada!ify for a spin, build your
        page, see if it fits — then upgrade whenever you want from Settings → Billing.
      </p>

      {/* Tier comparison grid (read-only, DEC-311=A) */}
      <div
        aria-label="Plan comparison"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
          gap: 12,
          marginBottom: 28,
        }}
        className="tier-grid-responsive"
      >
        {TIERS.map((tier) => (
          <div
            key={tier.id}
            aria-label={`${tier.name} plan${tier.ribbon ? ` — ${tier.ribbon}` : ""}`}
            style={{
              border: tier.highlight
                ? "2px solid var(--brand-primary)"
                : "1px solid var(--border-strong)",
              borderRadius: "var(--radius-md)",
              padding: "20px 16px",
              background: tier.highlight ? "rgba(99, 102, 241, 0.04)" : "var(--bg-elevated)",
              position: "relative",
            }}
          >
            {tier.ribbon && (
              <div
                style={{
                  position: "absolute",
                  top: -1,
                  left: 16,
                  right: 16,
                  textAlign: "center",
                  background: "var(--brand-primary)",
                  color: "#FFF",
                  fontSize: 11,
                  fontWeight: 700,
                  padding: "3px 8px",
                  borderRadius: "0 0 6px 6px",
                  letterSpacing: "0.05em",
                }}
                aria-label={tier.ribbon}
              >
                {tier.ribbon}
              </div>
            )}

            <div
              style={{
                marginTop: tier.ribbon ? 20 : 0,
                marginBottom: 4,
                fontSize: 16,
                fontWeight: 700,
                color: tier.highlight ? "var(--brand-primary)" : "var(--fg)",
              }}
            >
              {tier.name}
            </div>

            <div style={{ marginBottom: 12 }}>
              <span
                style={{
                  fontSize: 26,
                  fontWeight: 700,
                  color: "var(--fg)",
                  lineHeight: 1,
                }}
              >
                {tier.price}
              </span>
              {tier.period && (
                <span style={{ fontSize: 13, color: "var(--fg-muted)" }}>{tier.period}</span>
              )}
            </div>

            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: 0,
                display: "flex",
                flexDirection: "column",
                gap: 6,
              }}
            >
              {tier.features.map((f) => (
                <li
                  key={f}
                  style={{
                    fontSize: 13,
                    color: "var(--fg-muted)",
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 6,
                  }}
                >
                  <span
                    style={{ color: "var(--success)", fontWeight: 700, flexShrink: 0 }}
                    aria-hidden
                  >
                    ✓
                  </span>
                  {f}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* Plan-lock confidence chip — DEC-311=A / issue requirement: "🔒 Price locked for life" */}
      <div
        aria-label="Price locked for life guarantee"
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(245,158,11,0.08)",
          border: "1px solid rgba(245,158,11,0.25)",
          borderRadius: "var(--radius-full, 9999px)",
          padding: "6px 14px",
          fontSize: 13,
          fontWeight: 600,
          color: "var(--warning, #B45309)",
          marginBottom: 16,
        }}
      >
        <span aria-hidden>🔒</span>
        When you do upgrade — your price is locked for life
      </div>

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.5 }}>
        Upgrade whenever you want from <strong>Settings → Billing</strong>. 30-day money-back on
        any paid tier.
      </p>

      {/* DEC-366=A: action redirects to /app directly — no form data needed */}
      <form method="post">

        <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
          <Link
            to={backUrl}
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: "1px solid var(--border-strong)",
              borderRadius: "var(--radius)",
              fontSize: 14,
              fontWeight: 500,
              color: "var(--fg-muted)",
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
            }}
            aria-label="Back to template selection"
          >
            ← Back
          </Link>

          <button
            type="submit"
            style={{
              flex: 1,
              minHeight: 44,
              padding: "10px 24px",
              background: "var(--brand-primary)",
              color: "#FFF",
              border: "none",
              borderRadius: "var(--radius)",
              fontSize: 15,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Take me to my dashboard →
          </button>
        </div>
      </form>

      <style>{`
        @media (max-width: 700px) {
          .tier-grid-responsive { grid-template-columns: repeat(2, 1fr) !important; }
        }
        @media (max-width: 400px) {
          .tier-grid-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}
