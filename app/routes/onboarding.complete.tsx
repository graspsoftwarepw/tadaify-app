/**
 * /onboarding/complete — Post-wizard success screen (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-complete.html (merged PR #135)
 *
 * URL state:
 *   loader reads → ?handle=&tier=free&tpl=&name=&bio=&av=&platforms=&socials=
 *
 * DEC trail:
 *   DEC-311=A  tier is always "free" on arrival; any other value is invalid
 *   DEC-332=D  "page coming soon" semantics: show success + "your page is being set up"
 *
 * Covers: BR-ONBOARDING-006 (post-wizard success)
 */

import { Link } from "react-router";
import type { Route } from "./+types/onboarding.complete";
import { MotionLogo } from "~/components/landing/MotionLogo";

// ─── Loader ────────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  const tier = url.searchParams.get("tier") ?? "free";
  const tpl = url.searchParams.get("tpl") ?? "";
  const name = url.searchParams.get("name") ?? "";
  const bio = url.searchParams.get("bio") ?? "";
  const av = url.searchParams.get("av") ?? "";
  const platforms = url.searchParams.get("platforms") ?? "";
  const socials = url.searchParams.get("socials") ?? "";

  // DEC-311=A: only "free" is valid in this step
  const effectiveTier = tier === "free" ? "free" : "free";

  return { handle, tier: effectiveTier, tpl, name, bio, av, platforms, socials };
}

// ─── Component ─────────────────────────────────────────────────────────────────

export default function CompletePage({ loaderData }: Route.ComponentProps) {
  const { handle, tier, tpl, name } = loaderData;

  const displayName = name || (handle ? `@${handle}` : "there");

  return (
    <div
      style={{
        minHeight: "calc(100vh - 54px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(24px, 5vw, 64px)",
        textAlign: "center",
      }}
    >
      <div style={{ maxWidth: 560, width: "100%" }}>
        {/* Logo */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 20,
          }}
        >
          <MotionLogo size="nav" />
        </div>

        {/* tada! celebration */}
        <div
          className="font-display font-semibold"
          style={{
            fontSize: "clamp(44px, 8vw, 72px)",
            lineHeight: 1,
            marginBottom: 16,
          }}
          aria-hidden
        >
          tada! 🎉
        </div>

        {/* Welcome heading */}
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(24px, 4vw, 36px)",
            lineHeight: 1.15,
            marginBottom: 12,
          }}
        >
          Welcome,{" "}
          <span style={{ color: "var(--brand-primary)" }}>
            {handle ? `@${handle}` : displayName}
          </span>
          !
        </h1>

        {/* DEC-332=D: page coming soon semantics */}
        <p
          style={{
            fontSize: 17,
            color: "var(--fg-muted)",
            lineHeight: 1.6,
            marginBottom: 8,
          }}
        >
          Your page is being set up.
        </p>
        <p
          style={{
            fontSize: 15,
            color: "var(--fg-muted)",
            lineHeight: 1.6,
            marginBottom: 32,
          }}
        >
          You'll be able to customise everything once the editor is live. We'll let you know
          when it's ready.
        </p>

        {/* URL display */}
        {handle && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              padding: "12px 20px",
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius)",
              marginBottom: 28,
              fontSize: 15,
              fontWeight: 600,
            }}
            aria-label={`Your page URL: tadaify.com/${handle}`}
          >
            <span style={{ color: "var(--fg-muted)" }}>tadaify.com/</span>
            <span style={{ color: "var(--brand-primary)" }}>{handle}</span>
            <button
              type="button"
              onClick={() => {
                const url = `https://tadaify.com/${handle}`;
                void navigator.clipboard?.writeText(url);
              }}
              style={{
                marginLeft: 8,
                padding: "4px 10px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius-sm)",
                fontSize: 12,
                cursor: "pointer",
                color: "var(--fg-muted)",
              }}
              aria-label={`Copy URL tadaify.com/${handle}`}
            >
              Copy
            </button>
          </div>
        )}

        {/* Next steps */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "stretch",
          }}
        >
          <Link
            to="/dashboard"
            style={{
              display: "block",
              padding: "14px 24px",
              background: "var(--brand-primary)",
              color: "#FFF",
              textDecoration: "none",
              borderRadius: "var(--radius)",
              fontSize: 15,
              fontWeight: 600,
            }}
            aria-label="Go to your dashboard"
          >
            Go to dashboard →
          </Link>

          <div
            style={{
              display: "flex",
              gap: 10,
            }}
          >
            <button
              type="button"
              onClick={() => {
                const text = encodeURIComponent(
                  `Just set up my page on @tadaify! Check it out: https://tadaify.com/${handle}`
                );
                window.open(`https://x.com/intent/tweet?text=${text}`, "_blank");
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                color: "var(--fg-muted)",
              }}
            >
              𝕏 Tweet
            </button>

            <button
              type="button"
              onClick={() => {
                const url = `https://tadaify.com/${handle}`;
                void navigator.clipboard?.writeText(url);
              }}
              style={{
                flex: 1,
                padding: "10px 16px",
                background: "transparent",
                border: "1px solid var(--border-strong)",
                borderRadius: "var(--radius)",
                fontSize: 13,
                fontWeight: 500,
                cursor: "pointer",
                color: "var(--fg-muted)",
              }}
            >
              🔗 Copy URL
            </button>
          </div>
        </div>

        {/* Plan info */}
        <p
          style={{
            marginTop: 24,
            fontSize: 13,
            color: "var(--fg-subtle)",
            lineHeight: 1.5,
          }}
        >
          You're on the <strong>Free</strong> plan. Upgrade anytime from Settings → Billing.
          30-day money-back on any paid tier.
        </p>
      </div>
    </div>
  );
}
