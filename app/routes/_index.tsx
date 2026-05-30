/**
 * / — Landing page
 *
 * Story 1 / F-LANDING-001.
 * Implements all 12 sections per mockups/tadaify-mvp/landing.html (visual contract).
 * Framework: React Router 7 SSR on Cloudflare Workers (DEC-FRAMEWORK-01, DEC-DOMAIN-01).
 *
 * Pricing throughout: $7.99 (Creator) / $19.99 (Pro) / $49.99 (Business) / $1.99/mo (domain add-on) per DEC-279+DEC-287.
 * AI credits: Free 5 / Creator 20 / Pro 100 / Business ∞ per DEC-AI-QUOTA-LADDER-01 / DEC-286 (0030).
 *
 * TADA-BUG-001 + DEC-DOMAIN-01: wordmark preview shows tadaify.com/<handle> (real URL format).
 * The brand lockup (tada!ify with !, no separators per DEC-WORDMARK-01) appears ONLY in the wordmark element, never in
 * URL-context surfaces (heroPreview / finalPreview).
 *
 * Section order matches mockup:
 *   Nav → Hero → Social Proof → Creator Showcase → Free Table → 3-Feature Band →
 *   Privacy (Flagship 1) → API (Flagship 2) → Generous Free (Flagship 3) →
 *   Why Creators → Upsell Philosophy → FAQ → Final CTA → Footer
 */

import { useEffect, useRef, useState, useCallback } from "react";
import type { Route } from "./+types/_index";
import { MotionLogo } from "~/components/landing/MotionLogo";
import { detectLocaleFromRequest } from "~/lib/locale-detect";
import {
  validateHandle,
  generateAlternatives,
  HANDLE_ERROR_MESSAGES,
} from "~/lib/handle-validator";
import { landingFaqItems } from "~/lib/landing-faq";

// ─── Loader ───────────────────────────────────────────────────────────────────

export async function loader({ request }: Route.LoaderArgs) {
  const locale = detectLocaleFromRequest(request);
  return { locale };
}

// ─── Meta ─────────────────────────────────────────────────────────────────────

export function meta(_: Route.MetaArgs) {
  return [
    { title: "tadaify — Turn your bio link into your best first impression" },
    {
      name: "description",
      content:
        "The only link-in-bio where every feature is free. Pay only if you want your own domain — starting at $1.99/mo. 0% platform fees, every tier, forever.",
    },
    { property: "og:title", content: "tadaify" },
    {
      property: "og:description",
      content:
        "The only link-in-bio where every feature is free. 0% platform fees, every tier, forever.",
    },
    { property: "og:type", content: "website" },
    { property: "og:url", content: "https://tadaify.com/" },
    { name: "robots", content: "index, follow" },
    { rel: "canonical", href: "https://tadaify.com/" },
  ];
}

// ─── Handle claim form hook ────────────────────────────────────────────────────

type ClaimStatus = "idle" | "checking" | "ok" | "err" | "warn";

interface ClaimState {
  handle: string;
  status: ClaimStatus;
  message: string;
  alternatives: string[];
  isSubmitting: boolean;
}

const IDLE_MSG = "3–30 characters: lowercase letters, numbers, hyphens.";

function useHandleClaim(locale: string) {
  const [state, setState] = useState<ClaimState>({
    handle: "",
    status: "idle",
    message: IDLE_MSG,
    alternatives: [],
    isSubmitting: false,
  });
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkAvailability = useCallback(
    async (raw: string) => {
      if (!raw) {
        setState((s) => ({
          ...s,
          status: "idle",
          message: IDLE_MSG,
          alternatives: [],
        }));
        return;
      }

      // Immediate client-side validation
      const validation = validateHandle(raw);
      if (!validation.valid) {
        setState((s) => ({
          ...s,
          status: "err",
          message: HANDLE_ERROR_MESSAGES[validation.reason],
          alternatives: [],
        }));
        return;
      }

      setState((s) => ({
        ...s,
        status: "checking",
        message: "Checking availability…",
        alternatives: [],
      }));

      try {
        const res = await fetch("/api/handle/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: raw }),
        });
        if (!res.ok) throw new Error("Network error");
        const data = (await res.json()) as {
          available: boolean;
          reason?: string;
          alternatives?: string[];
        };

        if (data.available) {
          setState((s) => ({
            ...s,
            status: "ok",
            message: `Available! Tap Claim to reserve tadaify.com/${raw}`,
            alternatives: [],
          }));
        } else {
          const alts = data.alternatives ?? generateAlternatives(raw, locale);
          setState((s) => ({
            ...s,
            status: "err",
            message:
              data.reason === "reserved"
                ? "Someone just reserved this — try another."
                : "Taken — someone beat you to it.",
            alternatives: alts,
          }));
        }
      } catch {
        // On network error, fall back to client-only validation result
        setState((s) => ({
          ...s,
          status: "ok",
          message: `Looks good! Tap Claim to reserve tadaify.com/${raw}`,
          alternatives: [],
        }));
      }
    },
    [locale]
  );

  const onInput = useCallback(
    (value: string) => {
      const raw = value.toLowerCase();
      setState((s) => ({ ...s, handle: raw }));

      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (!raw) {
        setState((s) => ({
          ...s,
          status: "idle",
          message: IDLE_MSG,
          alternatives: [],
        }));
        return;
      }

      // Immediate format validation
      const validation = validateHandle(raw);
      if (!validation.valid) {
        setState((s) => ({
          ...s,
          status: "err",
          message: HANDLE_ERROR_MESSAGES[validation.reason],
          alternatives: [],
        }));
        return;
      }

      setState((s) => ({
        ...s,
        status: "idle",
        message: "Checking availability…",
      }));
      debounceRef.current = setTimeout(() => checkAvailability(raw), 300);
    },
    [checkAvailability]
  );

  const onSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      const raw = state.handle;
      if (!raw || state.status !== "ok") return;

      setState((s) => ({ ...s, isSubmitting: true, message: "Reserving…" }));

      try {
        const res = await fetch("/api/handle/reserve", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ handle: raw }),
        });
        if (res.ok || res.status === 201) {
          setState((s) => ({
            ...s,
            message: "Reserved! Taking you to signup…",
          }));
          setTimeout(() => {
            window.location.href = `/register?handle=${encodeURIComponent(raw)}`;
          }, 450);
        } else if (res.status === 409) {
          setState((s) => ({
            ...s,
            status: "err",
            isSubmitting: false,
            message: "Someone just claimed this — try another.",
            alternatives: generateAlternatives(raw, locale),
          }));
        } else {
          throw new Error("Server error");
        }
      } catch {
        setState((s) => ({
          ...s,
          isSubmitting: false,
          status: "err",
          message: "Something went wrong — try again.",
        }));
      }
    },
    [state.handle, state.status, locale]
  );

  return { state, onInput, onSubmit };
}

// ─── Wordmark component ────────────────────────────────────────────────────────

function Wordmark({
  className,
  onDark = false,
  style: styleProp,
}: {
  className?: string;
  onDark?: boolean;
  style?: React.CSSProperties;
}) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "var(--font-display)",
        fontWeight: 700,
        letterSpacing: "-0.01em",
        display: "inline-flex",
        alignItems: "baseline",
        whiteSpace: "nowrap",
        ...styleProp,
      }}
      aria-hidden="true"
    >
      <span style={{ color: onDark ? "#818CF8" : "#6366F1" }}>ta</span>
      {/* Per DEC-043 brand lockup: da! uses brand-warm */}
      <span
        style={{
          color: onDark ? "#FDE68A" : "#F59E0B",
        }}
      >
        da!
      </span>
      <span style={{ color: onDark ? "#F9FAFB" : "#111827" }}>ify</span>
    </span>
  );
}

// ─── Handle claim form component ──────────────────────────────────────────────

interface HandleClaimFormProps {
  /** Unique ID prefix to avoid duplicate DOM IDs when used twice */
  formId: "hero" | "final";
  state: ClaimState;
  onInput: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  /** "final" variant styles form for the gradient CTA band (on-dark) */
  variant?: "default" | "on-dark";
}

function HandleClaimForm({
  formId,
  state,
  onInput,
  onSubmit,
  variant = "default",
}: HandleClaimFormProps) {
  const onDark = variant === "on-dark";

  const statusIcon =
    state.status === "ok"
      ? "✓"
      : state.status === "err"
        ? "✕"
        : "●";

  const statusColor =
    state.status === "ok"
      ? onDark
        ? "#D1FAE5"
        : "var(--success, #10B981)"
      : state.status === "err"
        ? onDark
          ? "#FEE2E2"
          : "var(--danger, #EF4444)"
        : onDark
          ? "rgba(255,255,255,0.85)"
          : "var(--fg-muted, #6B7280)";

  return (
    <form
      id={`${formId}Claim`}
      onSubmit={onSubmit}
      autoComplete="off"
      aria-label="Claim your handle"
      className="landing-claim-form"
    >
      {/* Input row */}
      <div
        className={`landing-claim-row${onDark ? " on-dark" : ""}`}
      >
        <span className={`landing-claim-prefix${onDark ? " on-dark" : ""}`}>
          tadaify.com/
        </span>
        <input
          id={`${formId}Input`}
          type="text"
          value={state.handle}
          onChange={(e) => onInput(e.target.value)}
          placeholder="yourname"
          spellCheck={false}
          autoCapitalize="off"
          aria-label="Your handle"
          maxLength={30}
          className={`landing-claim-input${onDark ? " on-dark" : ""}`}
        />
        <button
          type="submit"
          disabled={state.status !== "ok" || state.isSubmitting}
          aria-label="Claim your handle"
          className={`landing-claim-btn${onDark ? " on-dark" : ""}`}
        >
          {formId === "hero" ? (
            <>Claim your handle <span className="landing-claim-arrow">&rarr;</span></>
          ) : (
            <>Claim it <span className="landing-claim-arrow">&rarr;</span></>
          )}
        </button>
      </div>

      {/* Status indicator */}
      <div
        id={`${formId}Status`}
        className="landing-claim-status"
        style={{ color: statusColor }}
      >
        <span style={{ fontWeight: 700 }}>{statusIcon}</span>{" "}
        {state.message}
      </div>

      {/* Live URL preview — TADA-BUG-001: real URL, NOT brand lockup */}
      {/* aria-live="polite" per issue #1 AC (accessibility requirement) */}
      <div
        aria-live="polite"
        className={`landing-wm-preview-wrap${onDark ? " on-dark" : ""}`}
      >
        <span className={`landing-wm-preview-label${onDark ? " on-dark" : ""}`}>
          Your public page
        </span>
        {/* TADA-BUG-001 fix + DEC-DOMAIN-01: URL preview shows tadaify.com/<handle> */}
        <span
          id={`${formId}Preview`}
          className={`landing-wm-preview${state.handle ? "" : " muted"}${onDark ? " on-dark" : ""}`}
        >
          <span className={`landing-preview-ta${onDark ? " on-dark" : ""}`}>tadaify</span>
          <span className={`landing-preview-slash${onDark ? " on-dark" : ""}`}>.</span>
          <span className={`landing-preview-ify${onDark ? " on-dark" : ""}`}>com</span>
          <span className={`landing-preview-slash${onDark ? " on-dark" : ""}`}>/</span>
          <span
            id={`${formId}PreviewHandle`}
            className={`landing-preview-handle${onDark ? " on-dark" : ""}`}
          >
            {state.handle || "yourname"}
          </span>
        </span>
      </div>

      {/* Alternatives row (shown when handle is taken) */}
      {state.alternatives.length > 0 && (
        <div
          style={{
            fontSize: "13px",
            color: onDark ? "rgba(255,255,255,0.85)" : "#6B7280",
          }}
        >
          Try:{" "}
          {state.alternatives.map((alt) => (
            <button
              key={alt}
              type="button"
              onClick={() => onInput(alt)}
              style={{
                fontFamily: "var(--font-mono, monospace)",
                color: onDark ? "#93C5FD" : "#6366F1",
                fontWeight: 600,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                padding: "0 4px",
                textDecoration: "underline",
              }}
            >
              {alt}
            </button>
          ))}
        </div>
      )}

      {/* Trust microcopy */}
      <p className="landing-trust-micro">
        <strong style={{ color: onDark ? "#fff" : "#111827", fontWeight: 600 }}>
          No credit card.
        </strong>
        <span className="landing-trust-sep" />
        <strong style={{ color: onDark ? "#fff" : "#111827", fontWeight: 600 }}>
          No trial.
        </strong>
        <span className="landing-trust-sep" />
        <span>Everything free. Upgrade when it helps you.</span>
      </p>
    </form>
  );
}

// ─── Main landing page component ───────────────────────────────────────────────

export default function LandingPage({ loaderData }: Route.ComponentProps) {
  const { locale } = loaderData;
  const heroForm = useHandleClaim(locale);
  const finalForm = useHandleClaim(locale);
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      {/* ── TOP NAV ── */}
      <nav className="landing-nav" aria-label="Primary">
        <div className="container landing-nav-inner">
          {/* Brand */}
          <a className="landing-nav-brand" href="/" aria-label="tadaify home">
            <div className="landing-logo-small">
              <MotionLogo size="nav" />
            </div>
            <Wordmark style={{ fontSize: "22px" }} />
            <span className="sr-only">tadaify</span>
          </a>

          {/* Desktop links */}
          <div className="landing-nav-links" role="navigation">
            <a href="/pricing">Pricing</a>
            <a href="/templates">Templates</a>
            <a href="/trust">Trust</a>
            <a href="/docs">Docs</a>
          </div>

          {/* CTA + mobile toggle */}
          <div className="landing-nav-cta">
            <a className="landing-btn landing-btn-ghost" href="/login">Login</a>
            <a className="landing-btn landing-btn-warm" href="#hero-claim">Claim your handle</a>
            <button
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              className="landing-nav-mobile-toggle"
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" width="22" height="22">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div className="landing-nav-drawer">
            {[
              ["Pricing", "/pricing"],
              ["Templates", "/templates"],
              ["Trust", "/trust"],
              ["Docs", "/docs"],
              ["Login", "/login"],
            ].map(([label, href]) => (
              <a
                key={href}
                href={href}
                onClick={() => setNavOpen(false)}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header className="landing-hero" id="hero-claim">
        {/* Background gradients */}
        <div className="landing-hero-bg" aria-hidden="true" />

        <div className="container landing-hero-inner">
          {/* Left col */}
          <div>
            <span className="landing-eyebrow">
              <span className="landing-eyebrow-dot" />
              0% platform fees &middot; every tier &middot; forever
            </span>

            <h1 className="landing-h1">
              Turn your bio link into your{" "}
              <em>best first impression</em>.
            </h1>

            <p className="landing-hero-sub">
              The only link-in-bio where{" "}
              <strong>every feature is free</strong>. Pay only if you
              want your own domain &mdash; starting at{" "}
              <strong>$1.99/mo</strong>. No seller fees. No upsell
              modals. No &ldquo;Powered by&rdquo; on your page, ever.
            </p>

            <HandleClaimForm
              formId="hero"
              state={heroForm.state}
              onInput={heroForm.onInput}
              onSubmit={heroForm.onSubmit}
            />
          </div>

          {/* Right col — Motion logo + preview card */}
          <div className="landing-hero-right">
            {/* Logo wrap */}
            <div className="landing-logo-hero-wrap" aria-hidden="true">
              <MotionLogo size="hero" />

              {/* Floating badges */}
              <div className="landing-hero-badges">
                <span className="landing-badge landing-badge-1">
                  <span className="landing-badge-emj">&#9889;</span>1-tap checkout
                </span>
                <span className="landing-badge landing-badge-2">
                  <span className="landing-badge-emj">&#127775;</span>0% fees
                </span>
                <span className="landing-badge landing-badge-3">
                  <span className="landing-badge-emj">&#127760;</span>domain $1.99
                </span>
              </div>
            </div>

            {/* Example creator preview card */}
            <div
              className="landing-preview-card"
              role="img"
              aria-label="Example creator page"
            >
              <div className="landing-preview-avatar" aria-hidden="true" />
              <div className="landing-preview-handle-row">
                <span className="landing-wm-small">
                  <Wordmark style={{ fontSize: "18px" }} />
                </span>
                <span className="landing-preview-handle-suffix">/alexandrasilva</span>
              </div>
              <div className="landing-preview-sub">Fitness coach &middot; Lisbon</div>
              <div className="landing-preview-link">
                <span className="landing-preview-ico">F</span>
                <span>12-week fitness plan</span>
                <span className="landing-preview-price">$29</span>
              </div>
              <div className="landing-preview-link">
                <span className="landing-preview-ico landing-preview-ico-warm">M</span>
                <span>Monthly mobility calls</span>
                <span className="landing-preview-price">$12/mo</span>
              </div>
              <div className="landing-preview-link">
                <span className="landing-preview-ico landing-preview-ico-purple">N</span>
                <span>Free newsletter</span>
                <span className="landing-preview-price">Join</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section className="landing-proof" aria-label="Social proof">
        <div className="container landing-proof-inner">
          <div className="landing-proof-avatars" aria-hidden="true">
            <span className="landing-proof-av" />
            <span className="landing-proof-av" />
            <span className="landing-proof-av" />
            <span className="landing-proof-av" />
            <span className="landing-proof-av" />
            <span className="landing-proof-av" />
          </div>
          <p className="landing-proof-text">
            Join thousands of creators building something that looks like them.{" "}
            <strong style={{ color: "#111827" }}>14,283</strong> new pages created this month.
          </p>
        </div>
      </section>

      {/* ── REAL CREATOR SHOWCASE ── */}
      <section className="landing-block landing-block-alt" aria-labelledby="showcase-heading">
        <div className="container">
          <div className="landing-section-head">
            <h2 id="showcase-heading">
              Real creators, <em>real pages.</em>
            </h2>
            <p>Click any to see the real thing &mdash; no mockups, no fake previews.</p>
          </div>

          <div className="landing-creators">
            {[
              { name: "Alexandra Silva", niche: "Fitness coach · 50k IG", handle: "alexandrasilva", cls: "c1" },
              { name: "Kuba Bar", niche: "Music producer · 80k Spotify", handle: "kubabar", cls: "c2" },
              { name: "Marta Wolska", niche: "Newsletter · 15k subs", handle: "martawolska", cls: "c3" },
              { name: "Neon DJ", niche: "Live streamer · 120k Twitch", handle: "neondj", cls: "c4" },
              { name: "Chipmunk Guy", niche: "TikTok niche · 200k", handle: "chipmunkguy", cls: "c5" },
            ].map(({ name, niche, handle, cls }) => (
              <a
                key={handle}
                className="landing-creator-card"
                href={`/${handle}`}
              >
                <div className={`landing-creator-av ${cls}`} aria-hidden="true" />
                <h3 className="landing-creator-name">{name}</h3>
                <div className="landing-creator-niche">{niche}</div>
                <div className="landing-creator-handle">tadaify.com/{handle}</div>
                <span className="landing-creator-go">See page &rarr;</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHAT'S ON FREE TABLE ── */}
      <section className="landing-block" aria-labelledby="free-table-heading">
        <div className="container">
          <div className="landing-section-head">
            <h2 id="free-table-heading">
              Everything you need on <em>Free.</em>
            </h2>
            <p>Pay only when you want a custom domain ($1.99/mo) or when you&rsquo;re ready to grow.</p>
          </div>

          <div className="landing-compare-wrap">
            <table className="landing-compare-table">
              <thead>
                <tr>
                  <th scope="col">Feature</th>
                  <th scope="col">On Free &mdash; included</th>
                  <th scope="col">tadaify Free &middot; $0</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="landing-td-feat">Custom themes</td>
                  <td className="landing-td-lt">All themes, all styles</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">Analytics (geo &middot; device &middot; referrer)</td>
                  <td className="landing-td-lt">365-day history included</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">Link scheduling</td>
                  <td className="landing-td-lt">Publish by date &amp; time</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">Email capture</td>
                  <td className="landing-td-lt">Collect &amp; export subscribers</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">QR code</td>
                  <td className="landing-td-lt">Download SVG or PNG</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">Custom animations</td>
                  <td className="landing-td-lt">30+ entrance effects</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> 30+ <span className="landing-free-pill">Free</span></td>
                </tr>
                <tr>
                  <td className="landing-td-feat">No platform watermark</td>
                  <td className="landing-td-lt">No &ldquo;Powered by&rdquo; &mdash; ever</td>
                  <td className="landing-td-us"><span className="landing-check">&check;</span> Always &mdash; we never had one</td>
                </tr>
                <tr>
                  <td className="landing-td-feat">Commerce (sell products)</td>
                  <td className="landing-td-lt">Upgrade to Creator for 0% fees</td>
                  <td className="landing-td-us"><strong>0% fee</strong> &middot; Creator $7.99/mo</td>
                </tr>
              </tbody>
            </table>
            <div className="landing-compare-foot">
              Only paying for <strong>your own domain?</strong> $1.99/mo. Need more audience tools? <strong>Creator $7.99/mo</strong>.
            </div>
          </div>
        </div>
      </section>

      {/* ── 3-FEATURE BAND ── */}
      <section className="landing-block landing-block-alt" aria-labelledby="features-heading">
        <div className="container">
          <div className="landing-section-head">
            <h2 id="features-heading">
              Three things we do <em className="warm">better.</em>
            </h2>
            <p>Not 47 features. Three that matter more than the rest.</p>
          </div>

          <div className="landing-feats">
            <div className="landing-feat-card">
              <div className="landing-feat-ico p" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 6h18M3 12h18M3 18h12" /><circle cx="18" cy="18" r="3" />
                </svg>
              </div>
              <h3>Inline checkout</h3>
              <p>Buyers stay on your page &mdash; no redirects to Stripe. 1-tap Apple&nbsp;Pay and Google&nbsp;Pay. Higher conversion, every time.</p>
            </div>
            <div className="landing-feat-card">
              <div className="landing-feat-ico w" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                  <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                </svg>
              </div>
              <h3>Custom domain at $1.99</h3>
              <p>The most affordable custom domain in the category. Your name, your address, zero per-domain markup.</p>
            </div>
            <div className="landing-feat-card">
              <div className="landing-feat-ico c" aria-hidden="true">
                <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                  <path d="M3 3v18h18" /><path d="M7 15l4-4 4 4 5-7" />
                </svg>
              </div>
              <h3>Analytics that mean something</h3>
              <p>Real-time. Geo down to city level. Bot-filtered. All free &mdash; 90 days on Free, 365 days on Pro.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #1 — Privacy-first (DEC-075) ── */}
      <section
        id="privacy"
        className="landing-block landing-block-alt"
        aria-labelledby="privacy-heading"
      >
        <div className="container">
          <div className="landing-section-head">
            <span className="landing-flagship-badge">Flagship #1 &middot; Privacy-first</span>
            <h2 id="privacy-heading">
              &#128274; No cookies. No tracking. <em>Ever.</em>
            </h2>
            <p>Your visitors don&rsquo;t see a cookie banner. ever. That means fewer distractions, better first impressions, and more conversions for you.</p>
          </div>

          {/* Badge row */}
          <div className="landing-badge-row">
            <span className="landing-feature-badge">&#128274; no cookies</span>
            <span className="landing-feature-badge">&#128065;&#8205;&#128488; no fingerprinting</span>
            <span className="landing-feature-badge">&#127466;&#127482; GDPR-clean by design</span>
            <span className="landing-feature-badge">&#129309; your visitors stay happy</span>
          </div>

          <div className="landing-flagship-content">
            <div className="landing-flagship-prose">
              <p style={{ fontSize: "17px", lineHeight: 1.6, margin: "0 0 18px" }}>
                <strong>Most platforms cookie-track your visitors</strong> &mdash; which means your
                audience has to dismiss a banner before seeing your page. We chose a different path.
              </p>
              <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
                We count unique visitors using a privacy-first daily method &mdash; no persistent ID, no
                browser storage. Visitors never see a consent banner on your tadaify page.
              </p>
              <p style={{ fontSize: "15px", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: "#111827" }}>The trade-off:</strong> if the same visitor
                returns tomorrow, we count them again. Slightly fuzzy number &mdash; but your audience&rsquo;s
                first impression stays clean.
              </p>

              {/* "How it works" expandable */}
              <details style={{ marginTop: "20px" }}>
                <summary
                  style={{
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: "14px",
                    color: "#6366F1",
                    listStyle: "none",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                  }}
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" />
                  </svg>
                  How it works &mdash; for the technically curious
                </summary>
                <div style={{ marginTop: "14px", padding: "16px", background: "#F3F4F6", borderRadius: "10px", fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 10px" }}>
                    Every day we generate a fresh random salt &mdash; it exists only in memory and is never
                    stored. When someone visits your page, we create a temporary fingerprint from their
                    IP address and browser, mix in the daily salt, and hash it. The result is a
                    day-scoped count: same visitor, same day = 1 count. Same visitor, next day = fresh
                    count.
                  </p>
                  <p style={{ margin: 0 }}>
                    No cookies. No localStorage. Nothing written to the browser. The daily salt means
                    even we can&rsquo;t link Tuesday&rsquo;s visitors to Monday&rsquo;s. Your audience stays private,
                    your analytics stay meaningful.{" "}
                    <a href="/pricing" style={{ color: "#6366F1", fontWeight: 600 }}>See plans &rarr;</a>
                  </p>
                </div>
              </details>
            </div>
          </div>

          {/* Competitor comparison — cookie banners */}
          <div className="landing-compare-section">
            <div className="landing-compare-wrap">
              <table className="landing-compare-table" style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Cookie banner required?</th>
                    <th scope="col">Tracking method</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="landing-td-feat">Linktree</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; Required</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>Persistent cookies + 3rd-party scripts</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Beacons</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; Required</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>Cookie-based session tracking</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Stan</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; Required</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>Tracking pixels + cookies</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Bento</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; Required</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>Cookie-based analytics</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat" style={{ color: "#6366F1", fontWeight: 700 }}>&#128251; tadaify</td>
                    <td className="landing-td-us"><span className="landing-check">&#10003;</span> <span style={{ color: "#10B981", fontWeight: 700 }}>Never</span></td>
                    <td style={{ padding: "14px 18px", color: "#6366F1", fontWeight: 600 }}>Cookieless daily salt &mdash; nothing stored in browser</td>
                  </tr>
                </tbody>
              </table>
              <div className="landing-compare-foot">
                Privacy is <strong>architectural</strong>, not a setting you can toggle. We built it this way from day one so we can&rsquo;t accidentally break it.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #2 — Creator API (DEC-080) ── */}
      <section
        id="api-access"
        className="landing-block"
        aria-labelledby="api-heading"
      >
        <div className="container">
          <div className="landing-section-head">
            <span className="landing-flagship-badge">Flagship #2 &middot; Creator API</span>
            <h2 id="api-heading">
              &#128299; First creator analytics API in <em>link-in-bio.</em>
            </h2>
            <p>Every other platform locks your data inside their dashboard. Tadaify gives you the keys.</p>
          </div>

          {/* Badge row */}
          <div className="landing-badge-row">
            <span className="landing-feature-badge">&#128299; first creator API</span>
            <span className="landing-feature-badge">&#128202; your data, your tools</span>
            <span className="landing-feature-badge">&#129470; build dashboards / Slack bots / iOS widgets</span>
            <span className="landing-feature-badge">&#127775; 100 req/h Pro &middot; 1000 req/h Business</span>
          </div>

          <div className="landing-flagship-content">
            {/* Code snippet tile */}
            <div className="landing-api-terminal">
              <div className="landing-api-terminal-bar">
                <span className="landing-terminal-dot red" />
                <span className="landing-terminal-dot yellow" />
                <span className="landing-terminal-dot green" />
                <span className="landing-terminal-label">terminal</span>
              </div>
              <div className="landing-api-terminal-body">
                <pre><code>{`# Get clicks for all blocks — last 7 days
curl -H `}<span style={{ color: "#FDE68A" }}>"Authorization: Bearer sk_tdf_..."</span>{` \\
  `}<span style={{ color: "#6EE7B7" }}>"https://api.tadaify.com/v1/insights/clicks?from=7d"</span>{`

# Response
{
  `}<span style={{ color: "#93C5FD" }}>"from"</span>{`: `}<span style={{ color: "#FDE68A" }}>"2026-04-19"</span>{`,
  `}<span style={{ color: "#93C5FD" }}>"to"</span>{`:   `}<span style={{ color: "#FDE68A" }}>"2026-04-26"</span>{`,
  `}<span style={{ color: "#93C5FD" }}>"blocks"</span>{`: [
    { `}<span style={{ color: "#93C5FD" }}>"id"</span>{`: `}<span style={{ color: "#FDE68A" }}>"stripe"</span>{`, `}<span style={{ color: "#93C5FD" }}>"clicks"</span>{`: `}<span style={{ color: "#6EE7B7" }}>1247</span>{`, `}<span style={{ color: "#93C5FD" }}>"top_source"</span>{`: `}<span style={{ color: "#FDE68A" }}>"tiktok"</span>{` },
    { `}<span style={{ color: "#93C5FD" }}>"id"</span>{`: `}<span style={{ color: "#FDE68A" }}>"newsletter"</span>{`, `}<span style={{ color: "#93C5FD" }}>"clicks"</span>{`: `}<span style={{ color: "#6EE7B7" }}>839</span>{`, `}<span style={{ color: "#93C5FD" }}>"top_source"</span>{`: `}<span style={{ color: "#FDE68A" }}>"instagram"</span>{` }
  ]
}`}</code></pre>
              </div>
            </div>

            {/* Use cases */}
            <div className="landing-api-usecases">
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: "0 0 18px" }}>
                Build anything on top of your data
              </h3>
              <ul className="landing-api-usecases-list">
                <li>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>&#128202;</span>
                  <div><strong>Custom dashboards</strong> &mdash; pipe your click and visitor data into Notion, Retool, or a plain spreadsheet. Own your reporting stack.</div>
                </li>
                <li>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>&#128172;</span>
                  <div><strong>Slack / Discord bots</strong> &mdash; &ldquo;alert me when any block hits 500 clicks today.&rdquo; Build the notification logic you actually want, not a fixed in-app alert.</div>
                </li>
                <li>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>&#128241;</span>
                  <div><strong>iOS widgets &amp; shortcuts</strong> &mdash; tap your phone&rsquo;s Lock Screen to see today&rsquo;s page visitors. Weekend project, not a feature request ticket.</div>
                </li>
                <li>
                  <span style={{ fontSize: "18px", flexShrink: 0 }}>&#129395;</span>
                  <div><strong>Daily DM yourself</strong> &mdash; send yourself a morning summary via your own bot. &ldquo;Your Stripe link got 183 clicks yesterday. Top source: TikTok.&rdquo;</div>
                </li>
              </ul>
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #E5E7EB" }}>
                <a href="/pricing" className="landing-btn landing-btn-primary">
                  Upgrade to Pro to get API access &rarr;
                </a>
              </div>
            </div>
          </div>

          {/* Competitor comparison — API access */}
          <div className="landing-compare-section">
            <div className="landing-compare-wrap">
              <table className="landing-compare-table" style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th scope="col">Platform</th>
                    <th scope="col">Public API access</th>
                    <th scope="col">On which tier?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="landing-td-feat">Linktree</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; None</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Beacons</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; None</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Stan</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; None</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Bento</td>
                    <td style={{ padding: "14px 18px", color: "#EF4444" }}>&#10007; None</td>
                    <td style={{ padding: "14px 18px", color: "#6B7280" }}>&mdash;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat" style={{ color: "#6366F1", fontWeight: 700 }}>&#128251; tadaify</td>
                    <td className="landing-td-us"><span className="landing-check">&#10003;</span> <span style={{ color: "#10B981", fontWeight: 700 }}>Yes</span></td>
                    <td style={{ padding: "14px 18px", color: "#6366F1", fontWeight: 600 }}>Pro (100 req/h) &middot; Business (1,000 req/h)</td>
                  </tr>
                </tbody>
              </table>
              <div className="landing-compare-foot">
                API docs at <strong>api.tadaify.com/docs</strong> &mdash; preview available before you upgrade.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #3 — Most generous Free (DEC-076 Option 9) ── */}
      <section
        id="generous-free"
        className="landing-block landing-block-alt"
        aria-labelledby="free-heading"
      >
        <div className="container">
          <div className="landing-section-head">
            <span className="landing-flagship-badge warm">Flagship #3 &middot; Most generous Free</span>
            <h2 id="free-heading">
              &#127873; The most generous Free tier in link-in-bio analytics. <em className="warm">Period.</em>
            </h2>
            <p>Competitors gate cross-tab analysis behind $24/mo Premium. We give it to Free.</p>
          </div>

          {/* Trust badge */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="landing-generous-trust-badge">
              &#127873; No data hidden behind paywall. Free creators get the full dataset.
            </span>
          </div>

          {/* Free tier comparison table */}
          <div className="landing-compare-section">
            <div className="landing-compare-wrap">
              <table className="landing-compare-table" style={{ fontSize: "14px" }}>
                <thead>
                  <tr>
                    <th scope="col">Platform Free tier</th>
                    <th scope="col">Analytics included</th>
                    <th scope="col">Cross-tab?</th>
                    <th scope="col">Geo + City?</th>
                    <th scope="col">Devices + Referrers?</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="landing-td-feat">Linktree Free</td>
                    <td style={{ padding: "14px 12px", color: "#6B7280" }}>Basic clicks only</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Beacons Free</td>
                    <td style={{ padding: "14px 12px", color: "#6B7280" }}>Today&rsquo;s real-time + flat list</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#6B7280" }}>Country only</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Bento Free</td>
                    <td style={{ padding: "14px 12px", color: "#6B7280" }}>Limited features</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                  </tr>
                  <tr>
                    <td className="landing-td-feat">Stan Free</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007; Paid only<sup>*</sup></td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                    <td style={{ padding: "14px 12px", color: "#EF4444" }}>&#10007;</td>
                  </tr>
                  <tr style={{ background: "rgba(245,158,11,0.05)" }}>
                    <td className="landing-td-feat" style={{ color: "#6366F1", fontWeight: 700 }}>&#128251; tadaify Free</td>
                    <td className="landing-td-us"><span className="landing-check">&#10003;</span> <strong>Full dataset</strong></td>
                    <td style={{ padding: "14px 12px", color: "#10B981", fontWeight: 700 }}>&#10003; All</td>
                    <td style={{ padding: "14px 12px", color: "#10B981", fontWeight: 700 }}>&#10003; City-level</td>
                    <td style={{ padding: "14px 12px", color: "#10B981", fontWeight: 700 }}>&#10003; Full detail</td>
                  </tr>
                </tbody>
              </table>
              <div className="landing-compare-foot">
                Tadaify Free: hourly refresh &middot; 7-day window. Upgrade to Creator for 5-min refresh + 90d window, or Pro for real-time + 1-year history.
                <br /><small style={{ color: "#6B7280", marginTop: "6px", display: "block" }}><sup>*</sup>Stan.store requires a paid plan ($29+/mo) for analytics access. Verified 2026-04-26.</small>
              </div>
            </div>
          </div>

          {/* What upgrades unlock */}
          <div className="landing-upgrade-ladder">
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: "0 0 6px" }}>What upgrades unlock</h3>
            <p style={{ color: "#6B7280", fontSize: "14px", margin: "0 0 20px" }}>Your data is complete on Free. Upgrades are about freshness and history &mdash; not access.</p>
            <div className="landing-upgrade-grid">
              <div className="landing-upgrade-tier">
                <div className="landing-upgrade-tier-label" style={{ color: "#6B7280" }}>Free</div>
                <div className="landing-upgrade-speed">Hourly refresh</div>
                <div className="landing-upgrade-window">7-day window</div>
              </div>
              <div className="landing-upgrade-tier primary-soft">
                <div className="landing-upgrade-tier-label" style={{ color: "#6366F1" }}>Creator $7.99/mo</div>
                <div className="landing-upgrade-speed">5-min refresh</div>
                <div className="landing-upgrade-window">90-day window</div>
              </div>
              <div className="landing-upgrade-tier primary">
                <div className="landing-upgrade-tier-label" style={{ color: "#6366F1" }}>Pro $19.99/mo</div>
                <div className="landing-upgrade-speed">Real-time (60s)</div>
                <div className="landing-upgrade-window">1-year window + API</div>
              </div>
              <div className="landing-upgrade-tier primary-strong">
                <div className="landing-upgrade-tier-label" style={{ color: "#6366F1" }}>Business $49.99/mo</div>
                <div className="landing-upgrade-speed">+ Replay sessions</div>
                <div className="landing-upgrade-window">All-time history + Parquet archive</div>
              </div>
            </div>
            <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
              <a href="/pricing" className="landing-btn landing-btn-primary">See full pricing &rarr;</a>
            </div>
          </div>
        </div>
      </section>

      {/* ── WHY CREATORS CHOOSE TADAIFY — wedges ── */}
      <section className="landing-block" aria-labelledby="why-heading">
        <div className="container">
          <div className="landing-section-head">
            <h2 id="why-heading">
              Why creators <em>choose tadaify</em>
            </h2>
            <p>Three things that take 30 seconds to see.</p>
          </div>

          <div className="landing-wedges">
            <div className="landing-wedge">
              <div className="landing-wedge-num" aria-hidden="true">01</div>
              <h3>Your URL, <em style={{ fontStyle: "italic", fontFamily: "var(--font-display)" }}>your brand</em></h3>
              <p>tadaify.com/yourname is your creator real estate. Clean. Memorable. Yours. Want your own domain? Add it for $1.99/mo.</p>
              <div className="landing-wedge-compare">
                <span className="bad">yourname.someplatform.com</span>
                <span className="arr">&rarr;</span>
                <span className="good">tadaify.com/yourname</span>
              </div>
            </div>

            <div className="landing-wedge">
              <div className="landing-wedge-num" aria-hidden="true">02</div>
              <h3>Every feature free</h3>
              <p>Custom themes, analytics, scheduling, email capture &mdash; all included from day one. Pay only when you want a custom domain ($1.99/mo).</p>
              <div className="landing-wedge-compare">
                <span className="bad">locked behind upgrade</span>
                <span className="arr">&rarr;</span>
                <span className="good">$0 forever</span>
              </div>
            </div>

            <div className="landing-wedge">
              <div className="landing-wedge-num" aria-hidden="true">03</div>
              <h3>Inline commerce</h3>
              <p>Sell directly on your page. Buyers stay with you, no redirects. <strong style={{ color: "#111827" }}>0% platform fees</strong> on paid tiers.</p>
              <div className="landing-wedge-compare">
                <span className="bad">platform takes a cut</span>
                <span className="arr">&rarr;</span>
                <span className="good">0% &mdash; forever</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPSELL PHILOSOPHY ── */}
      <section className="landing-block landing-block-alt" aria-label="Upsell philosophy">
        <div className="container">
          <div className="landing-philosophy">
            <h3>
              We don&rsquo;t show upgrade popups. <em>Ever.</em>
            </h3>
            <p>
              When Creator ($7.99) or Pro ($19.99) would help you, you&rsquo;ll see a small{" "}
              <span className="landing-tip-pill">&#128161; tip</span>
              {" "}&mdash; dismissible, non-blocking, never interrupts your flow. No black banners, no mid-edit modals, no dark patterns.
            </p>
            <a href="/trust">Read our subtle-upsell philosophy &rarr;</a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="landing-block" aria-labelledby="faq-heading">
        <div className="container">
          <div className="landing-section-head">
            <h2 id="faq-heading">
              Questions? <em>Answered.</em>
            </h2>
            <p>The six things creators ask before switching.</p>
          </div>

          <div className="landing-faq-list">
            {/* landingFaqItems imported from ~/lib/landing-faq (DEC-355=C: no guest-mode promises) */}
            {landingFaqItems.map(({ q, a }) => (
              <details key={q} className="landing-faq">
                <summary>
                  {q}
                  <span className="landing-faq-plus" aria-hidden="true">+</span>
                </summary>
                <div className="landing-faq-body">{a}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section className="landing-final-cta" aria-label="Claim your handle">
        <div className="landing-final-cta-bg" aria-hidden="true" />
        <div className="container landing-final-cta-inner">
          <h2>Ready to claim your handle?</h2>
          <p>Free forever. No credit card. No tricks.</p>

          <HandleClaimForm
            formId="final"
            state={finalForm.state}
            onInput={finalForm.onInput}
            onSubmit={finalForm.onSubmit}
            variant="on-dark"
          />

          <p className="landing-final-tiny">
            <strong>14,283</strong> creators joined this month.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="landing-footer">
        <div className="container">
          <div className="landing-foot-grid">
            {[
              {
                heading: "Product",
                links: [["Pricing", "/pricing"], ["Templates", "/templates"], ["Trust", "/trust"], ["Roadmap", "/roadmap"], ["Status", "/status"], ["Changelog", "/changelog"]],
              },
              {
                heading: "Creators",
                links: [["Creator Directory", "/creators"], ["Help Center", "/help"], ["Migrate your page", "/migrate"], ["FAQ", "/faq"]],
              },
              {
                heading: "Developers",
                links: [["API reference", "/docs/api"], ["Webhooks", "/docs/webhooks"], ["OAuth", "/docs/oauth"], ["API changelog", "/docs/api-changelog"]],
              },
              {
                heading: "Company",
                links: [["Blog", "/blog"], ["Manifesto", "/manifesto"], ["Contact", "/contact"], ["Privacy", "/privacy"], ["Terms", "/terms"]],
              },
            ].map(({ heading, links }) => (
              <div className="landing-foot-col" key={heading}>
                <h4>{heading}</h4>
                <ul>
                  {links.map(([label, href]) => (
                    <li key={label}><a href={href}>{label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Ask AI row */}
          <div className="landing-ask-ai">
            <span className="landing-ask-ai-label">Ask AI about tadaify:</span>
            <div className="landing-ai-links">
              {[
                ["ChatGPT", "https://chat.openai.com/?q=What%20is%20tadaify.com%3F"],
                ["Claude", "https://claude.ai/new?q=What%20is%20tadaify.com%3F"],
                ["Gemini", "https://gemini.google.com/app?q=What%20is%20tadaify.com%3F"],
                ["Perplexity", "https://www.perplexity.ai/?q=What%20is%20tadaify.com%3F"],
                ["Grok", "https://x.com/i/grok?text=What%20is%20tadaify.com%3F"],
              ].map(([label, href]) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer">{label}</a>
              ))}
            </div>
          </div>

          {/* Footer bottom */}
          <div className="landing-foot-bottom">
            <Wordmark onDark style={{ fontSize: "14px" }} />
            <span>&copy; 2026 tadaify. Made by creators, for creators.</span>
            <span>
              <a href="/privacy">Privacy</a>
              {" · "}
              <a href="/terms">Terms</a>
              {" · "}
              <a href="/cookies">Cookies</a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
