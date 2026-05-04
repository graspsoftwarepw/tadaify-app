/**
 * /onboarding/tier — Step 5/5: Plan comparison (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-tier.html (merged PR #135)
 *
 * DEC-311=A refined: read-only plan comparison.
 *   - No billing UI, no tier selection.
 *   - Every user starts on Free.
 *   - The single CTA always routes to /onboarding/complete?tier=free.
 *   - If URL contains ?tier=<anything>, it is IGNORED — complete always
 *     receives tier=free. This is the DEC-311 refinement: S4 test verifies
 *     that tier=premium in the URL still produces tier=free in the output.
 *
 * URL state:
 *   loader reads → all accumulated params + optional tier (ignored)
 *   action emits → /onboarding/complete?<all params>&tier=free
 *
 * Covers: BR-ONBOARDING-005 (step 5 plan overview)
 */

import { redirect } from "react-router";
import { Link } from "react-router";
import type { Route } from "./+types/onboarding.tier";
import { CREATOR_PRICE_MONTHLY } from "~/lib/tier-gate";

/** Canonical pricing for Pro/Business — sourced here to keep one place to update. */
const PRO_PRICE_MONTHLY = "$19";
const BUSINESS_PRICE_MONTHLY = "$49";

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

export async function action({ request }: Route.ActionArgs) {
  const form = await request.formData();
  const handle = (form.get("handle") as string) ?? "";
  const platforms = (form.get("platforms") as string) ?? "";
  const socials = (form.get("socials") as string) ?? "";
  const name = (form.get("name") as string) ?? "";
  const bio = (form.get("bio") as string) ?? "";
  const av = (form.get("av") as string) ?? "";
  const tpl = (form.get("tpl") as string) ?? "";

  // DEC-311=A: always free — ignore any tier value from form or URL
  const params = new URLSearchParams();
  if (handle) params.set("handle", handle);
  if (platforms) params.set("platforms", platforms);
  if (socials) params.set("socials", socials);
  if (name) params.set("name", name);
  if (bio) params.set("bio", bio);
  if (av) params.set("av", av);
  if (tpl) params.set("tpl", tpl);
  params.set("tier", "free"); // always free — DEC-311=A

  return redirect(`/onboarding/complete?${params.toString()}`);
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

      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 24, lineHeight: 1.5 }}>
        Upgrade whenever you want from <strong>Settings → Billing</strong>. 30-day money-back on
        any paid tier.
      </p>

      <form method="post">
        <input type="hidden" name="handle" value={handle} />
        <input type="hidden" name="platforms" value={platforms} />
        <input type="hidden" name="socials" value={socials} />
        <input type="hidden" name="name" value={name} />
        <input type="hidden" name="bio" value={bio} />
        <input type="hidden" name="av" value={av} />
        <input type="hidden" name="tpl" value={tpl} />

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
            Take me to my page →
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
