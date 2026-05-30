/**
 * /onboarding/complete — Celebration screen (F-ONBOARDING-001a)
 *
 * Visual contract: mockups/tadaify-mvp/onboarding-complete.html (Slice C, 2026-04-29)
 *
 * DEC-332=D (page-coming-soon semantics): the user's tadaify page is NOT yet
 *   published at this point in the onboarding flow. Copy reflects "you're all set
 *   up" rather than "you're live". The big URL strip is shown for awareness /
 *   sharing but the preview pane and feature cards carry the "coming soon" framing
 *   already baked into the tier grid and feature list copy.
 *
 * DEC-311=A: tier is always "free" — this route does not read or display tier.
 *
 * DEC-366=A (2026-05-05): action redirects directly to /app. The celebration
 *   component is restored per the onboarding-complete-mockup refresh; the loader
 *   now returns URL-accumulated state so the component can render. Any direct GET
 *   to /onboarding/complete (back-nav, deep-link without going through the wizard)
 *   still results in a redirect to /app via the loader.
 *
 * URL state:
 *   loader reads  → handle, name, bio, av, platforms, tpl (accumulated from wizard)
 *   action emits  → /app (DEC-366=A)
 *
 * DB finalization note: onboarding_completed_at is set by a Supabase Auth Hook.
 *   No DB work is needed in this route handler.
 *
 * Covers: BR-ONBOARDING-006 (post-wizard success)
 *
 * DEC trail:
 *   DEC-311=A  tier is always "free" — this route never reads tier
 *   DEC-332=D  "page coming soon" semantics — copy must NOT say "page is live"
 *   DEC-366=A  action redirects to /app directly
 */

import { redirect } from "react-router";
import { useEffect, useRef } from "react";
import { Form, Link } from "react-router";
import type { Route } from "./+types/onboarding.complete";

// ─── Loader ────────────────────────────────────────────────────────────────────
// Returns URL-accumulated state for the component.
// A bare GET to /onboarding/complete with no wizard state (no handle param) is
// treated as an invalid deep-link and redirected to /app (DEC-366=A guard).

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const handle = url.searchParams.get("handle") ?? "";
  // Guard: without a handle this is a stale / direct deep-link — send to /app.
  if (!handle) return redirect("/app");
  const name = url.searchParams.get("name") ?? "";
  const bio = url.searchParams.get("bio") ?? "";
  const av = url.searchParams.get("av") ?? "";
  const platforms = url.searchParams.get("platforms") ?? "";
  const tpl = url.searchParams.get("tpl") ?? "";
  return { handle, name, bio, av, platforms, tpl };
}

// ─── Action ────────────────────────────────────────────────────────────────────
// Dashboard CTA form submission → 302 /app (DEC-366=A).

export async function action(_: Route.ActionArgs) {
  return redirect("/app");
}

// ─── Avatar fixture map (mirrors mockup JS) ────────────────────────────────────

const AV_FIXTURES: Record<string, string> = {
  instagram: "https://i.pravatar.cc/200?img=47",
  tiktok:    "https://i.pravatar.cc/200?img=12",
  youtube:   "https://i.pravatar.cc/200?img=33",
  x:         "https://i.pravatar.cc/200?img=22",
  threads:   "https://i.pravatar.cc/200?img=15",
  linkedin:  "https://i.pravatar.cc/200?img=58",
  facebook:  "https://i.pravatar.cc/200?img=64",
  upload:    "https://i.pravatar.cc/200?img=68",
};

// ─── Component ─────────────────────────────────────────────────────────────────

export default function OnboardingComplete({ loaderData }: Route.ComponentProps) {
  const { handle, name, bio, av, platforms, tpl } = loaderData as {
    handle: string;
    name: string;
    bio: string;
    av: string;
    platforms: string;
    tpl: string;
  };

  const copyBtnRef = useRef<HTMLButtonElement>(null);

  // Confetti burst on mount
  useEffect(() => {
    const container = document.getElementById("onb-complete-confetti");
    if (!container) return;
    const colors = ["#6366F1", "#F59E0B", "#FDE68A", "#8B5CF6", "#10B981"];
    for (let i = 0; i < 60; i++) {
      const el = document.createElement("div");
      el.className = "onb-complete-confetti-piece";
      el.style.left = `${Math.random() * 100}%`;
      el.style.background = colors[i % colors.length];
      el.style.animationDuration = `${2.5 + Math.random() * 2}s`;
      el.style.animationDelay = `${Math.random() * 1.5}s`;
      el.style.transform = `rotate(${Math.random() * 360}deg)`;
      container.appendChild(el);
    }
    const timer = setTimeout(() => { container.innerHTML = ""; }, 6000);
    return () => clearTimeout(timer);
  }, []);

  // Seed preview pane (matches mockup Slice C init script)
  useEffect(() => {
    const pane = document.querySelector<HTMLElement>("[data-onboarding-preview]");
    if (!pane) return;
    if (handle)    pane.setAttribute("data-handle", handle);
    if (platforms) pane.setAttribute("data-platforms", platforms);
    if (tpl)       pane.setAttribute("data-template", tpl);

    // Give the preview pane script time to initialise then call .update()
    const timer = setTimeout(() => {
      const w = window as Window & typeof globalThis & { tdfPreview?: { update: (s: object) => void } };
      if (!w.tdfPreview?.update) return;
      w.tdfPreview.update({
        handle,
        displayName: name,
        bio,
        avatarUrl: AV_FIXTURES[av] ?? "",
        platforms: platforms.split(",").filter(Boolean),
        template: tpl || "chopin",
      });
    }, 0);
    return () => clearTimeout(timer);
  }, [handle, name, bio, av, platforms, tpl]);

  function copyUrl() {
    const url = `https://tadaify.com/${handle}`;
    const btn = copyBtnRef.current;
    if (!btn) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(url).then(() => {
        btn.textContent = "Copied ✓";
        btn.classList.add("copied");
        setTimeout(() => {
          btn.textContent = "Copy";
          btn.classList.remove("copied");
        }, 1800);
      });
    } else {
      alert(`Your URL: ${url}`);
    }
  }

  function shareTwitter() {
    const url = `https://tadaify.com/${handle}`;
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Just built my new page! ${url}`)}`,
      "_blank",
    );
  }

  function shareIG() {
    alert("Mockup: in the real app this opens the IG Story deep-link with your URL pre-embedded.");
  }

  const dashboardHref = `/app?handle=${encodeURIComponent(handle)}&state=ready`;
  const previewHref   = `/creator/${encodeURIComponent(handle)}`;
  const domainHref    = `/app/domain`;
  const affiliateHref = `/app/affiliate?handle=${encodeURIComponent(handle)}`;

  return (
    <>
      {/* No step counter — post-onboarding success state (Slice C) */}

      <div className="onb-complete-hero">
        {/* Logo spotlight */}
        <div className="onb-complete-logo-wrap">
          <span className="logo-mark" data-logo style={{ width: 140, height: 140 }} />
        </div>

        {/* DEC-332=D: copy says "all set" not "live" — page is not published yet */}
        <h1 style={{ marginTop: 32, fontSize: "clamp(44px, 6vw, 72px)" }}>
          🎉 You&apos;re all set!
        </h1>
        <p className="lead text-muted" style={{ marginTop: 16, fontSize: 19 }}>
          Your page will be ready soon. Every click, every sale, every email — yours.
        </p>

        {/* Big URL strip */}
        <div className="onb-complete-big-url">
          <span>
            tadaify.com/<span>{handle}</span>
          </span>
          <button
            ref={copyBtnRef}
            className="onb-complete-copy-btn"
            type="button"
            onClick={copyUrl}
          >
            Copy
          </button>
        </div>

        {/* TADA-BUG-004: prominent primary CTA → Dashboard */}
        <div className="onb-complete-primary-cta-wrap">
          <Form method="post">
            <button
              id="onb-complete-dashboard-cta"
              type="submit"
              className="onb-complete-primary-cta"
            >
              Go to Dashboard
              <span className="onb-complete-arrow" aria-hidden="true">→</span>
            </button>
          </Form>
        </div>
      </div>

      {/* Slice C: 3-viewport preview pane */}
      <div className="onb-complete-preview-wrap">
        <aside
          data-onboarding-preview
          data-render="complete"
          data-handle={handle}
          data-platforms={platforms}
          data-template={tpl || "chopin"}
          aria-label="Final preview of your tadaify page"
        >
          {/* Populated by onboarding-preview-pane.js */}
        </aside>
      </div>

      {/* Secondary actions (TADA-BUG-004: 2-card row — "Customize further" removed) */}
      <div className="onb-complete-next-steps">
        <Link to={previewHref} className="onb-complete-step-card">
          <div className="onb-complete-step-icon">👀</div>
          <h4 style={{ fontSize: 18, marginBottom: 8 }}>Preview your page</h4>
          <p className="text-muted text-sm">
            See what visitors see — including the desktop and mobile layouts.
          </p>
        </Link>

        <Link to={domainHref} className="onb-complete-step-card onb-complete-step-card-warm">
          <div className="onb-complete-step-icon">🌐</div>
          <h4 style={{ fontSize: 18, marginBottom: 8 }}>Add custom domain</h4>
          <p className="text-muted text-sm">
            Use your own domain (yoursite.com) for $1.99/mo. Free on Creator +.
          </p>
        </Link>
      </div>

      {/* Share row */}
      <div className="onb-complete-share-row">
        <button className="btn btn-secondary" type="button" onClick={copyUrl}>
          🔗 Copy URL
        </button>
        <button className="btn btn-secondary" type="button" onClick={shareTwitter}>
          𝕏 Tweet
        </button>
        <button className="btn btn-secondary" type="button" onClick={shareIG}>
          📸 Instagram Story
        </button>
      </div>

      {/* Affiliate tip (dismissible) */}
      <div className="onb-complete-affiliate-tip" id="onb-complete-aff-tip">
        <div>
          💡{" "}
          <strong>Set up your affiliate code in 2 minutes</strong> and earn 30%
          recurring on anyone you refer to tadaify.
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to={affiliateHref} className="btn btn-primary btn-sm">
            Set up affiliate →
          </Link>
          <button
            className="onb-complete-aff-close"
            type="button"
            onClick={() => {
              const el = document.getElementById("onb-complete-aff-tip");
              el?.classList.add("onb-complete-aff-tip-closed");
            }}
          >
            ✕
          </button>
        </div>
      </div>

      {/* Confetti container */}
      <div id="onb-complete-confetti" aria-hidden="true" />
    </>
  );
}
