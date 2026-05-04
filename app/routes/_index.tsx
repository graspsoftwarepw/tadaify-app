/**
 * / — Landing page
 *
 * Story 1 / F-LANDING-001.
 * Implements all 11 sections per mockups/tadaify-mvp/landing.html (visual contract).
 * Framework: React Router 7 SSR on Cloudflare Workers (DEC-FRAMEWORK-01, DEC-DOMAIN-01).
 *
 * Pricing throughout: $7.99 (Creator) / $19.99 (Pro) / $49.99 (Business) / $1.99/mo (domain add-on) per DEC-279+DEC-287.
 * AI credits: Free 5 / Creator 20 / Pro 100 / Business ∞ per DEC-AI-QUOTA-LADDER-01 / DEC-286 (0030).
 *
 * TADA-BUG-001 + DEC-DOMAIN-01: wordmark preview shows tadaify.com/<handle> (real URL format).
 * The brand lockup (tada!ify with !, no separators per DEC-WORDMARK-01) appears ONLY in the wordmark element, never in
 * URL-context surfaces (heroPreview / finalPreview).
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

const IDLE_MSG = "3–30 characters: lowercase letters, numbers, underscores.";

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
      {/* Per DEC-043 (0007-everything-free-gating.md) brand lockup: da! uses brand-warm, not separator gray */}
      {/* tokens.css: --wm-da: #F59E0B (light), --brand-warm-soft: #FDE68A (on-dark) */}
      <span
        style={{
          color: onDark ? "#FDE68A" : "#F59E0B",
          margin: "0 0.06em",
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
      style={{ display: "flex", flexDirection: "column", gap: "14px", maxWidth: "560px" }}
    >
      {/* Input row */}
      <div
        style={{
          display: "flex",
          alignItems: "stretch",
          background: onDark ? "rgba(255,255,255,0.08)" : "#fff",
          border: onDark
            ? "2px solid rgba(255,255,255,0.4)"
            : "2px solid #E5E7EB",
          borderRadius: "14px",
          overflow: "hidden",
          boxShadow: "0 4px 14px rgba(17,24,39,0.08)",
          flexWrap: "wrap",
        }}
      >
        <span
          style={{
            display: "flex",
            alignItems: "center",
            padding: "0 12px 0 18px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "15px",
            color: onDark ? "rgba(255,255,255,0.85)" : "#6B7280",
            background: onDark ? "rgba(255,255,255,0.12)" : "#F3F4F6",
            borderRight: onDark
              ? "1px solid rgba(255,255,255,0.2)"
              : "1px solid #E5E7EB",
            whiteSpace: "nowrap",
          }}
        >
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
          style={{
            flex: 1,
            border: "none",
            outline: "none",
            padding: "16px 14px",
            fontFamily: "var(--font-mono, monospace)",
            fontSize: "16px",
            color: onDark ? "#fff" : "#111827",
            background: "transparent",
            minWidth: "80px",
          }}
        />
        <button
          type="submit"
          disabled={state.status !== "ok" || state.isSubmitting}
          aria-label="Claim your handle"
          style={{
            border: "none",
            background: onDark ? "#fff" : "#F59E0B",
            color: onDark ? "#6366F1" : "#1F1300",
            fontFamily: "var(--font-sans, sans-serif)",
            fontWeight: 600,
            fontSize: "15px",
            padding: "0 22px",
            whiteSpace: "nowrap",
            cursor: state.status !== "ok" || state.isSubmitting ? "not-allowed" : "pointer",
            opacity: state.status !== "ok" && state.status !== "idle" ? 0.7 : 1,
            transition: "background 0.15s ease",
            minHeight: "44px",
          }}
        >
          {formId === "hero" ? (
            <>Claim your handle →</>
          ) : (
            <>Claim it →</>
          )}
        </button>
      </div>

      {/* Status indicator */}
      <div
        id={`${formId}Status`}
        style={{
          fontSize: "13px",
          display: "flex",
          alignItems: "center",
          gap: "6px",
          minHeight: "20px",
          color: statusColor,
        }}
      >
        <span style={{ fontWeight: 700 }}>{statusIcon}</span>
        {state.message}
      </div>

      {/* Live wordmark preview — TADA-BUG-001: real URL, NOT brand lockup */}
      {/* aria-live="polite" per issue #1 AC (accessibility requirement) */}
      <div
        aria-live="polite"
        style={{
          background: onDark ? "rgba(255,255,255,0.08)" : "#fff",
          border: onDark
            ? "1px dashed rgba(255,255,255,0.35)"
            : "1px dashed #D1D5DB",
          borderRadius: "14px",
          padding: "22px 24px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "6px",
          minHeight: "96px",
        }}
      >
        <span
          style={{
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: onDark ? "rgba(255,255,255,0.75)" : "#6B7280",
          }}
        >
          Your public page
        </span>
        {/* TADA-BUG-001 fix + DEC-DOMAIN-01: URL preview shows tadaify.com/<handle>
            NO exclamation mark, NO dash — those are brand-only characters.
            Letters may be coloured for visual hierarchy (not semantic meaning). */}
        <span
          id={`${formId}Preview`}
          style={{
            fontFamily: "var(--font-display)",
            fontWeight: 700,
            fontSize: "30px",
            letterSpacing: "-0.01em",
            display: "inline-flex",
            alignItems: "baseline",
            opacity: state.handle ? 1 : 0.35,
            transition: "opacity 0.2s ease",
          }}
        >
          {/* "tadaify" in indigo */}
          <span style={{ color: onDark ? "#fff" : "#6366F1" }}>tadaify</span>
          {/* ".com" in muted */}
          <span style={{ color: onDark ? "rgba(255,255,255,0.6)" : "#6B7280", fontWeight: 500 }}>.</span>
          <span style={{ color: onDark ? "#fff" : "#111827" }}>com</span>
          {/* "/" separator */}
          <span style={{ color: onDark ? "rgba(255,255,255,0.6)" : "#6B7280", fontWeight: 500, margin: "0 0.05em" }}>/</span>
          {/* handle in mono — warm when filled */}
          <span
            id={`${formId}PreviewHandle`}
            style={{
              color: onDark ? "#FDE68A" : (state.handle ? "#F59E0B" : "#111827"),
              fontFamily: "var(--font-mono, monospace)",
              fontSize: "22px",
              fontWeight: 500,
              marginLeft: "2px",
              wordBreak: "break-all",
            }}
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
          {state.alternatives.map((alt, i) => (
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
      <p
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          fontSize: "13px",
          color: onDark ? "rgba(255,255,255,0.85)" : "#6B7280",
          marginTop: "4px",
          flexWrap: "wrap",
        }}
      >
        <strong style={{ color: onDark ? "#fff" : "#111827", fontWeight: 600 }}>
          No credit card.
        </strong>
        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "currentColor", opacity: 0.5 }} />
        <strong style={{ color: onDark ? "#fff" : "#111827", fontWeight: 600 }}>
          No trial.
        </strong>
        <span style={{ width: "3px", height: "3px", borderRadius: "50%", background: "currentColor", opacity: 0.5 }} />
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
      <nav
        aria-label="Primary"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(249,250,251,0.85)",
          WebkitBackdropFilter: "saturate(180%) blur(12px)",
          backdropFilter: "saturate(180%) blur(12px)",
          borderBottom: "1px solid rgba(229,231,235,0.6)",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            height: "68px",
            gap: "24px",
          }}
        >
          {/* Brand */}
          <a
            href="/"
            aria-label="tadaify home"
            style={{ display: "flex", alignItems: "center", gap: "12px", textDecoration: "none" }}
          >
            <div style={{ width: "44px", height: "44px", flexShrink: 0 }}>
              <MotionLogo size="nav" />
            </div>
            <Wordmark />
            <span className="sr-only">tadaify</span>
          </a>

          {/* Desktop links */}
          <div
            role="navigation"
            style={{
              display: "flex",
              gap: "6px",
            }}
            className="nav-links"
          >
            <a href="/pricing" style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Pricing</a>
            <a href="/templates" style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Templates</a>
            <a href="/trust" style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Trust</a>
            <a href="/docs" style={{ padding: "8px 14px", borderRadius: "8px", fontSize: "14px", color: "#6B7280", fontWeight: 500 }}>Docs</a>
          </div>

          {/* CTA + mobile toggle */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <a
              href="/login"
              style={{
                color: "#111827",
                background: "transparent",
                padding: "10px 14px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              Login
            </a>
            <a
              href="#hero-claim"
              style={{
                background: "#F59E0B",
                color: "#1F1300",
                padding: "10px 18px",
                borderRadius: "10px",
                fontSize: "15px",
                fontWeight: 600,
                textDecoration: "none",
                whiteSpace: "nowrap",
              }}
            >
              Claim your handle
            </a>
            <button
              onClick={() => setNavOpen((o) => !o)}
              aria-label={navOpen ? "Close menu" : "Open menu"}
              aria-expanded={navOpen}
              className="nav-mobile-toggle"
              style={{
                display: "none",
                width: "40px",
                height: "40px",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "8px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
              }}
            >
              <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" viewBox="0 0 24 24" width="22" height="22"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {navOpen && (
          <div
            style={{
              padding: "16px 24px 24px",
              borderTop: "1px solid #E5E7EB",
              background: "#fff",
            }}
          >
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
                style={{
                  display: "block",
                  padding: "12px 0",
                  fontSize: "16px",
                  borderBottom: "1px solid #E5E7EB",
                  textDecoration: "none",
                  color: "#111827",
                }}
              >
                {label}
              </a>
            ))}
          </div>
        )}
      </nav>

      {/* ── HERO ── */}
      <header
        className="hero"
        id="hero-claim"
        style={{
          padding: "56px 0 72px",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background gradients */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(ellipse 60% 40% at 85% 20%, rgba(245,158,11,0.14), transparent 60%), radial-gradient(ellipse 50% 45% at 10% 90%, rgba(139,92,246,0.12), transparent 60%)",
            pointerEvents: "none",
          }}
        />

        <div
          className="container"
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "48px",
            alignItems: "center",
          }}
        >
          {/* Left col */}
          <div>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 600,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#6366F1",
                background: "rgba(99,102,241,0.08)",
                padding: "6px 12px",
                borderRadius: "999px",
                marginBottom: "20px",
              }}
            >
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#F59E0B" }} />
              0% platform fees · every tier · forever
            </span>

            <h1
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(40px, 5.5vw, 64px)",
                lineHeight: 1.05,
                letterSpacing: "-0.015em",
                margin: "0 0 18px",
                color: "#111827",
              }}
            >
              Turn your bio link into your{" "}
              <em
                style={{
                  fontStyle: "italic",
                  background: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                best first impression
              </em>
              .
            </h1>

            <p
              style={{
                fontSize: "18px",
                lineHeight: 1.55,
                color: "#6B7280",
                margin: "0 0 28px",
                maxWidth: "560px",
              }}
            >
              The only link-in-bio where{" "}
              <strong style={{ color: "#111827" }}>every feature is free</strong>. Pay only if you
              want your own domain — starting at{" "}
              <strong style={{ color: "#111827" }}>$1.99/mo</strong>. No seller fees. No upsell
              modals. No "Powered by" on your page, ever.
            </p>

            <HandleClaimForm
              formId="hero"
              state={heroForm.state}
              onInput={heroForm.onInput}
              onSubmit={heroForm.onSubmit}
            />
          </div>

          {/* Right col — Motion logo + preview card */}
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "20px",
            }}
          >
            {/* Logo wrap: 280px mobile, 320px desktop (per mockup L381 + issue #1 AC) */}
            <div
              aria-hidden="true"
              style={{
                width: "280px",
                height: "280px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
              }}
              className="logo-hero-wrap"
            >
              <MotionLogo size="hero" />

              {/* Floating badges */}
              <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                <span
                  style={{
                    position: "absolute",
                    top: "4%",
                    left: "-8%",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#111827",
                    boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                    whiteSpace: "nowrap",
                    animation: "float 5s ease-in-out infinite",
                    animationDelay: "0s",
                  }}
                >
                  ⚡ 1-tap checkout
                </span>
                <span
                  style={{
                    position: "absolute",
                    top: "52%",
                    right: "-10%",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#111827",
                    boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                    whiteSpace: "nowrap",
                    animation: "float 5s ease-in-out infinite",
                    animationDelay: "1.3s",
                  }}
                >
                  🌟 0% fees
                </span>
                <span
                  style={{
                    position: "absolute",
                    bottom: "4%",
                    left: "2%",
                    background: "#fff",
                    border: "1px solid #E5E7EB",
                    borderRadius: "999px",
                    padding: "6px 12px",
                    fontSize: "12px",
                    fontWeight: 600,
                    color: "#111827",
                    boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                    whiteSpace: "nowrap",
                    animation: "float 5s ease-in-out infinite",
                    animationDelay: "2.6s",
                  }}
                >
                  🌐 domain $1.99
                </span>
              </div>
            </div>

            {/* Example creator preview card */}
            <div
              role="img"
              aria-label="Example creator page preview"
              style={{
                width: "100%",
                maxWidth: "320px",
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "20px",
                padding: "18px",
                boxShadow: "0 20px 45px rgba(99,102,241,0.18), 0 8px 20px rgba(17,24,39,0.08)",
                animation: "cardIn 1s ease-out both",
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  width: "56px",
                  height: "56px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #FDE68A 0%, #F59E0B 50%, #8B5CF6 100%)",
                  margin: "0 auto 10px",
                  boxShadow: "0 6px 14px rgba(245,158,11,0.25)",
                }}
              />
              <div style={{ textAlign: "center", fontWeight: 600, fontSize: "14px", marginBottom: "2px" }}>
                <Wordmark style={{ fontSize: "18px" }} />
                <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "13px", color: "#6B7280" }}>
                  /alexandrasilva
                </span>
              </div>
              <p style={{ textAlign: "center", fontSize: "12px", color: "#6B7280", marginBottom: "14px" }}>
                Fitness coach · Lisbon
              </p>
              {[
                { ico: "F", label: "12-week fitness plan", price: "$29", warm: false, purple: false },
                { ico: "M", label: "Monthly mobility calls", price: "$12/mo", warm: true, purple: false },
                { ico: "N", label: "Free newsletter", price: "Join", warm: false, purple: true },
              ].map(({ ico, label, price, warm, purple }) => (
                <div
                  key={label}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    padding: "10px 12px",
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "12px",
                    marginBottom: "8px",
                    fontSize: "13px",
                    fontWeight: 500,
                  }}
                >
                  <span
                    style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "7px",
                      background: warm ? "#F59E0B" : purple ? "#8B5CF6" : "#6366F1",
                      color: warm ? "#1F1300" : "#fff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "13px",
                      fontWeight: 700,
                      flexShrink: 0,
                    }}
                  >
                    {ico}
                  </span>
                  <span style={{ flex: 1 }}>{label}</span>
                  <span style={{ fontFamily: "var(--font-mono, monospace)", fontSize: "12px", color: "#6B7280" }}>{price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Keyframes injected as style tag for float + cardIn animations */}
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-8px); }
        }
        @keyframes cardIn {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        .container { max-width: 1200px; margin: 0 auto; padding: 0 24px; }
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
        @media (min-width: 1024px) {
          .hero .container { grid-template-columns: 1.1fr 1fr !important; gap: 56px !important; }
          .logo-hero-wrap { width: 320px !important; height: 320px !important; }
          .nav-links { display: flex !important; }
          .nav-mobile-toggle { display: none !important; }
        }
        @media (max-width: 1023px) {
          .nav-links { display: none !important; }
          .nav-mobile-toggle { display: inline-flex !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* ── SOCIAL PROOF STRIP ── */}
      <section
        aria-label="Social proof"
        style={{
          padding: "28px 0",
          borderTop: "1px solid #E5E7EB",
          borderBottom: "1px solid #E5E7EB",
          background: "#fff",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "14px",
            textAlign: "center",
          }}
        >
          <div aria-hidden="true" style={{ display: "flex", alignItems: "center" }}>
            {[
              "linear-gradient(135deg, #F59E0B, #D97706)",
              "linear-gradient(135deg, #6366F1, #4F46E5)",
              "linear-gradient(135deg, #8B5CF6, #6366F1)",
              "linear-gradient(135deg, #10B981, #059669)",
              "linear-gradient(135deg, #FDE68A, #F59E0B)",
              "linear-gradient(135deg, #818CF8, #6366F1)",
            ].map((bg, i) => (
              <span
                key={i}
                style={{
                  width: "32px",
                  height: "32px",
                  borderRadius: "50%",
                  border: "2px solid #fff",
                  background: bg,
                  marginLeft: i === 0 ? 0 : "-6px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
                }}
              />
            ))}
          </div>
          <p style={{ fontSize: "13px", color: "#6B7280" }}>
            Join thousands of creators building something that looks like them.{" "}
            <strong style={{ color: "#111827" }}>14,283</strong> new pages created this month.
          </p>
        </div>
      </section>

      {/* ── CREATOR SHOWCASE ── */}
      <section
        aria-labelledby="showcase-heading"
        style={{ padding: "80px 0", background: "#fff" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
            <h2
              id="showcase-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(36px, 3.5vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              Real creators,{" "}
              <em style={{ fontStyle: "italic", color: "#6366F1" }}>real pages.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>
              Click any to see the real thing — no mockups, no fake previews.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
              gap: "16px",
            }}
          >
            {[
              { name: "Alexandra Silva", niche: "Fitness coach · 50k IG", handle: "alexandrasilva", color: "radial-gradient(circle at 35% 30%, #FDE68A 0%, #F59E0B 45%, #92400E 100%)" },
              { name: "Kuba Bar", niche: "Music producer · 80k Spotify", handle: "kubabar", color: "radial-gradient(circle at 35% 30%, #818CF8 0%, #6366F1 50%, #1E1B4B 100%)" },
              { name: "Marta Wolska", niche: "Newsletter · 15k subs", handle: "martawolska", color: "radial-gradient(circle at 35% 30%, #FCA5A5 0%, #EC4899 45%, #831843 100%)" },
              { name: "Neon DJ", niche: "Live streamer · 120k Twitch", handle: "neondj", color: "radial-gradient(circle at 35% 30%, #6EE7B7 0%, #10B981 45%, #064E3B 100%)" },
              { name: "Chipmunk Guy", niche: "TikTok niche · 200k", handle: "chipmunkguy", color: "radial-gradient(circle at 35% 30%, #FBCFE8 0%, #F472B6 45%, #701A75 100%)" },
            ].map(({ name, niche, handle, color }) => (
              <a
                key={handle}
                href={`/${handle}`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "20px",
                  padding: "22px 16px",
                  textDecoration: "none",
                  color: "inherit",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "88px",
                    height: "88px",
                    borderRadius: "50%",
                    background: color,
                    marginBottom: "14px",
                    boxShadow: "0 8px 18px rgba(17,24,39,0.12)",
                  }}
                />
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "18px",
                    margin: "0 0 4px",
                  }}
                >
                  {name}
                </h3>
                <div
                  style={{
                    fontSize: "11px",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "#6B7280",
                    fontWeight: 600,
                    marginBottom: "10px",
                  }}
                >
                  {niche}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    color: "#6366F1",
                    marginBottom: "12px",
                    wordBreak: "break-all",
                  }}
                >
                  tadaify.com/{handle}
                </div>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "13px",
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  See page →
                </span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3-FEATURE BAND ── */}
      <section
        aria-labelledby="features-heading"
        style={{ padding: "80px 0", background: "#F9FAFB" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
            <h2
              id="features-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(36px, 3.5vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              Three things we do{" "}
              <em style={{ fontStyle: "italic", color: "#F59E0B" }}>better.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>
              Not 47 features. Three that matter more than the rest.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                gradient: "linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)",
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M3 6h18M3 12h18M3 18h12" /><circle cx="18" cy="18" r="3" />
                  </svg>
                ),
                title: "Inline checkout",
                body: "Buyers stay on your page — no redirects to Stripe. 1-tap Apple Pay and Google Pay. Higher conversion, every time.",
              },
              {
                gradient: "linear-gradient(135deg, #F59E0B, #D97706)",
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                    <circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" />
                  </svg>
                ),
                title: "Custom domain at $1.99",
                body: "The most affordable custom domain in the category. Your name, your address, zero per-domain markup.",
              },
              {
                gradient: "linear-gradient(135deg, #10B981, #059669)",
                icon: (
                  <svg fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24" width="24" height="24">
                    <path d="M3 3v18h18" /><path d="M7 15l4-4 4 4 5-7" />
                  </svg>
                ),
                title: "Analytics that mean something",
                body: "Real-time. Geo down to city level. Bot-filtered. All free — 90 days on Free, 365 days on Pro.",
              },
            ].map(({ gradient, icon, title, body }) => (
              <div
                key={title}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "20px",
                  padding: "28px",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    width: "48px",
                    height: "48px",
                    borderRadius: "12px",
                    background: gradient,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: "16px",
                    color: "#fff",
                  }}
                >
                  {icon}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "22px",
                    margin: "0 0 8px",
                    letterSpacing: "-0.005em",
                  }}
                >
                  {title}
                </h3>
                <p style={{ margin: 0, fontSize: "15px", color: "#6B7280", lineHeight: 1.6 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHY CREATORS CHOOSE TADAIFY — wedges ── */}
      <section
        aria-labelledby="why-heading"
        style={{ padding: "80px 0", background: "#fff" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
            <h2
              id="why-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(36px, 3.5vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              Why creators{" "}
              <em style={{ fontStyle: "italic", color: "#6366F1" }}>choose tadaify</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>Three things that take 30 seconds to see.</p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "20px",
            }}
          >
            {[
              {
                num: "01",
                title: "Your URL, your brand",
                body: "tadaify.com/yourname is your creator real estate. Clean. Memorable. Yours. Want your own domain? Add it for $1.99/mo.",
                bad: "yourname.someplatform.com",
                good: "tadaify.com/yourname",
              },
              {
                num: "02",
                title: "Every feature free",
                body: "Custom themes, analytics, scheduling, email capture — all included from day one. Pay only when you want a custom domain ($1.99/mo).",
                bad: "locked behind upgrade",
                good: "$0 forever",
              },
              {
                num: "03",
                title: "Inline commerce",
                body: "Sell directly on your page. Buyers stay with you, no redirects. 0% platform fees on paid tiers.",
                bad: "platform takes a cut",
                good: "0% — forever",
              },
            ].map(({ num, title, body, bad, good }) => (
              <div
                key={num}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "20px",
                  padding: "26px",
                }}
              >
                <div
                  aria-hidden="true"
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "48px",
                    lineHeight: 1,
                    color: "#6366F1",
                    opacity: 0.18,
                    marginBottom: "14px",
                  }}
                >
                  {num}
                </div>
                <h3
                  style={{
                    fontFamily: "var(--font-display)",
                    fontWeight: 700,
                    fontSize: "20px",
                    margin: "0 0 10px",
                  }}
                >
                  {title}
                </h3>
                <p style={{ margin: "0 0 14px", fontSize: "14px", color: "#6B7280", lineHeight: 1.6 }}>
                  {body}
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "12px",
                    padding: "10px 12px",
                    background: "#F9FAFB",
                    border: "1px solid #E5E7EB",
                    borderRadius: "10px",
                    flexWrap: "wrap",
                  }}
                >
                  <span style={{ color: "#6B7280", textDecoration: "line-through" }}>{bad}</span>
                  <span style={{ color: "#6B7280" }}>→</span>
                  <span style={{ color: "#6366F1", fontWeight: 600 }}>{good}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #1 — Privacy-first (DEC-075) ── */}
      <section
        id="privacy"
        aria-labelledby="privacy-heading"
        style={{ padding: "80px 0", background: "#F9FAFB" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#6366F1",
                background: "rgba(99,102,241,0.08)",
                padding: "6px 14px",
                borderRadius: "999px",
                marginBottom: "16px",
              }}
            >
              Flagship #1 · Privacy-first
            </span>
            <h2
              id="privacy-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px, 3vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              🔒 No cookies. No tracking.{" "}
              <em style={{ fontStyle: "italic", color: "#6366F1" }}>Ever.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>
              Your visitors don't see a cookie banner. Ever. That means fewer distractions,
              better first impressions, and more conversions for you.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "40px" }}>
            {["🔒 no cookies", "🫥 no fingerprinting", "🇪🇺 GDPR-clean by design", "🤝 your visitors stay happy"].map((badge) => (
              <span
                key={badge}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div
              style={{
                background: "#fff",
                border: "1px solid #E5E7EB",
                borderRadius: "20px",
                padding: "28px",
                boxShadow: "0 4px 14px rgba(17,24,39,0.08)",
                marginBottom: "24px",
              }}
            >
              <p style={{ fontSize: "17px", lineHeight: 1.6, margin: "0 0 18px" }}>
                <strong>Most platforms cookie-track your visitors</strong> — which means your
                audience has to dismiss a banner before seeing your page. We chose a different path.
              </p>
              <p style={{ fontSize: "15px", color: "#6B7280", margin: "0 0 18px", lineHeight: 1.6 }}>
                We count unique visitors using a privacy-first daily method — no persistent ID, no
                browser storage. Visitors never see a consent banner on your tadaify page.
              </p>
              <p style={{ fontSize: "15px", color: "#6B7280", margin: 0, lineHeight: 1.6 }}>
                <strong style={{ color: "#111827" }}>The trade-off:</strong> if the same visitor
                returns tomorrow, we count them again. Slightly fuzzy number — but your audience's
                first impression stays clean.
              </p>
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
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" /><path d="M12 8v4m0 4h.01" /></svg>
                  How it works — for the technically curious
                </summary>
                <div style={{ marginTop: "14px", padding: "16px", background: "#F3F4F6", borderRadius: "10px", fontSize: "14px", color: "#6B7280", lineHeight: 1.7 }}>
                  <p style={{ margin: "0 0 10px" }}>
                    Every day we generate a fresh random salt — it exists only in memory and is never
                    stored. When someone visits your page, we create a temporary fingerprint from their
                    IP address and browser, mix in the daily salt, and hash it. The result is a
                    day-scoped count: same visitor, same day = 1 count. Same visitor, next day = fresh
                    count.
                  </p>
                  <p style={{ margin: 0 }}>
                    No cookies. No localStorage. Nothing written to the browser. The daily salt means
                    even we can't link Tuesday's visitors to Monday's.
                  </p>
                </div>
              </details>
            </div>

            {/* Comparison table */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#F3F4F6" }}>
                    <th scope="col" style={{ padding: "14px 18px", textAlign: "left", fontWeight: 600, fontSize: "13px", borderBottom: "1px solid #E5E7EB" }}>Platform</th>
                    <th scope="col" style={{ padding: "14px 18px", textAlign: "left", fontWeight: 600, fontSize: "13px", borderBottom: "1px solid #E5E7EB" }}>Cookie banner required?</th>
                    <th scope="col" style={{ padding: "14px 18px", textAlign: "left", fontWeight: 600, fontSize: "13px", borderBottom: "1px solid #E5E7EB" }}>Tracking method</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Linktree", "✗ Required", "#EF4444", "Persistent cookies + 3rd-party scripts"],
                    ["Beacons", "✗ Required", "#EF4444", "Cookie-based session tracking"],
                    ["Stan", "✗ Required", "#EF4444", "Tracking pixels + cookies"],
                    ["Bento", "✗ Required", "#EF4444", "Cookie-based analytics"],
                  ].map(([platform, status, color, method]) => (
                    <tr key={platform as string} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "14px 18px", fontWeight: 500 }}>{platform}</td>
                      <td style={{ padding: "14px 18px", color: color as string }}>{status}</td>
                      <td style={{ padding: "14px 18px", color: "#6B7280" }}>{method}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ padding: "14px 18px", fontWeight: 700, color: "#6366F1" }}>🍃 tadaify</td>
                    <td style={{ padding: "14px 18px", color: "#10B981", fontWeight: 700 }}>✓ Never</td>
                    <td style={{ padding: "14px 18px", color: "#6366F1", fontWeight: 600 }}>Cookieless daily salt — nothing stored in browser</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ padding: "16px 20px", background: "linear-gradient(90deg, rgba(99,102,241,0.06), rgba(245,158,11,0.06))", borderTop: "1px solid #E5E7EB", fontSize: "14px" }}>
                Privacy is <strong style={{ color: "#6366F1" }}>architectural</strong>, not a setting you can toggle.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #2 — Creator API (DEC-080) ── */}
      <section
        id="api-access"
        aria-labelledby="api-heading"
        style={{ padding: "80px 0", background: "#fff" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#6366F1",
                background: "rgba(99,102,241,0.08)",
                padding: "6px 14px",
                borderRadius: "999px",
                marginBottom: "16px",
              }}
            >
              Flagship #2 · Creator API
            </span>
            <h2
              id="api-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px, 3vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              🔧 First creator analytics API in{" "}
              <em style={{ fontStyle: "italic", color: "#6366F1" }}>link-in-bio.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>
              Every other platform locks your data inside their dashboard. Tadaify gives you the keys.
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "12px", marginBottom: "40px" }}>
            {[
              "🔧 first creator API",
              "📊 your data, your tools",
              "🧰 build dashboards / Slack bots / iOS widgets",
              "🌟 100 req/h Pro · 1000 req/h Business",
            ].map((badge) => (
              <span
                key={badge}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "10px 18px",
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "999px",
                  fontSize: "14px",
                  fontWeight: 600,
                  boxShadow: "0 1px 2px rgba(17,24,39,0.06)",
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto", display: "grid", gap: "24px" }}>
            {/* Code snippet */}
            <div style={{ background: "#0B0F1E", borderRadius: "20px", overflow: "hidden", boxShadow: "0 20px 45px rgba(17,24,39,0.2)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "12px 18px", borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#EF4444" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F59E0B" }} />
                <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#10B981" }} />
                <span style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", marginLeft: "8px", fontFamily: "var(--font-mono, monospace)" }}>terminal</span>
              </div>
              <div style={{ padding: "24px", overflowX: "auto" }}>
                <pre style={{ margin: 0, fontFamily: "ui-monospace,SFMono-Regular,Menlo,Consolas,monospace", fontSize: "13px", lineHeight: 1.7, color: "#E5E7EB", whiteSpace: "pre" }}>
                  <code>
{`# Get clicks for all blocks — last 7 days
curl -H "Authorization: Bearer sk_tdf_..." \\
  "https://api.tadaify.com/v1/insights/clicks?from=7d"

# Response
{
  "from": "2026-04-22",
  "to":   "2026-04-29",
  "blocks": [
    { "id": "stripe", "clicks": 1247, "top_source": "tiktok" },
    { "id": "newsletter", "clicks": 839, "top_source": "instagram" }
  ]
}`}
                  </code>
                </pre>
              </div>
            </div>

            {/* Use cases */}
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px" }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: "0 0 18px" }}>
                Build anything on top of your data
              </h3>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "14px" }}>
                {[
                  ["📊", "Custom dashboards", "Pipe your click and visitor data into Notion, Retool, or a plain spreadsheet. Own your reporting stack."],
                  ["💬", "Slack / Discord bots", '"Alert me when any block hits 500 clicks today." Build the notification logic you actually want.'],
                  ["📱", "iOS widgets & shortcuts", "Tap your phone's Lock Screen to see today's page visitors. Weekend project, not a feature request ticket."],
                  ["🎉", "Daily DM yourself", '"Your Stripe link got 183 clicks yesterday. Top source: TikTok." Send yourself a morning summary.'],
                ].map(([emoji, title, desc]) => (
                  <li key={title as string} style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                    <span style={{ fontSize: "18px", flexShrink: 0 }}>{emoji}</span>
                    <div>
                      <strong>{title}</strong> — {desc}
                    </div>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #E5E7EB" }}>
                <a
                  href="/pricing"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    padding: "12px 22px",
                    background: "#6366F1",
                    color: "#fff",
                    borderRadius: "999px",
                    fontWeight: 600,
                    fontSize: "15px",
                    textDecoration: "none",
                  }}
                >
                  Upgrade to Pro to get API access →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FLAGSHIP #3 — Most generous Free (DEC-076 Option 9) ── */}
      <section
        id="generous-free"
        aria-labelledby="free-heading"
        style={{ padding: "80px 0", background: "#F9FAFB" }}
      >
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 40px" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "0.1em",
                textTransform: "uppercase",
                color: "#F59E0B",
                background: "rgba(245,158,11,0.10)",
                padding: "6px 14px",
                borderRadius: "999px",
                marginBottom: "16px",
              }}
            >
              Flagship #3 · Most generous Free
            </span>
            <h2
              id="free-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(32px, 3vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              🎁 The most generous Free tier in link-in-bio analytics.{" "}
              <em style={{ fontStyle: "italic", color: "#F59E0B" }}>Period.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>
              Competitors gate cross-tab analysis behind $24/mo Premium. We give it to Free.
            </p>
          </div>

          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: "10px", padding: "14px 24px", background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.3)", borderRadius: "14px", fontSize: "15px", fontWeight: 600, color: "#92400E" }}>
              🎁 No data hidden behind paywall. Free creators get the full dataset.
            </span>
          </div>

          <div style={{ maxWidth: "900px", margin: "0 auto 32px" }}>
            <div style={{ background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
                <thead>
                  <tr style={{ background: "#F3F4F6" }}>
                    {["Platform Free tier", "Analytics included", "Cross-tab?", "Geo + City?", "Devices + Referrers?"].map((h) => (
                      <th key={h} scope="col" style={{ padding: "14px 12px", textAlign: "left", fontWeight: 600, fontSize: "12px", borderBottom: "1px solid #E5E7EB" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Linktree Free", "Basic clicks only", "✗", "✗", "✗"],
                    ["Beacons Free", "Today's real-time + flat list", "✗", "Country only", "✗"],
                    ["Bento Free", "Limited features", "✗", "✗", "✗"],
                    ["Stan Free", "✗ Paid only", "✗", "✗", "✗"],
                  ].map(([platform, analytics, cross, geo, devices]) => (
                    <tr key={platform as string} style={{ borderBottom: "1px solid #E5E7EB" }}>
                      <td style={{ padding: "12px", fontWeight: 500 }}>{platform}</td>
                      <td style={{ padding: "12px", color: "#6B7280" }}>{analytics}</td>
                      <td style={{ padding: "12px", color: "#EF4444" }}>{cross}</td>
                      <td style={{ padding: "12px", color: "#6B7280" }}>{geo}</td>
                      <td style={{ padding: "12px", color: "#EF4444" }}>{devices}</td>
                    </tr>
                  ))}
                  <tr style={{ background: "rgba(245,158,11,0.05)" }}>
                    <td style={{ padding: "12px", fontWeight: 700, color: "#6366F1" }}>🍃 tadaify Free</td>
                    <td style={{ padding: "12px", color: "#10B981", fontWeight: 700 }}>✓ Full dataset</td>
                    <td style={{ padding: "12px", color: "#10B981", fontWeight: 700 }}>✓ All</td>
                    <td style={{ padding: "12px", color: "#10B981", fontWeight: 700 }}>✓ City-level</td>
                    <td style={{ padding: "12px", color: "#10B981", fontWeight: 700 }}>✓ Full detail</td>
                  </tr>
                </tbody>
              </table>
              <div style={{ padding: "16px 20px", background: "linear-gradient(90deg, rgba(99,102,241,0.06), rgba(245,158,11,0.06))", borderTop: "1px solid #E5E7EB", fontSize: "14px" }}>
                Tadaify Free: hourly refresh · 7-day window. Upgrade to Creator for 5-min refresh + 90d window.
              </div>
            </div>
          </div>

          {/* Upgrade ladder */}
          <div style={{ maxWidth: "900px", margin: "0 auto", background: "#fff", border: "1px solid #E5E7EB", borderRadius: "20px", padding: "28px" }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "22px", margin: "0 0 6px" }}>What upgrades unlock</h3>
            <p style={{ color: "#6B7280", fontSize: "14px", margin: "0 0 20px" }}>Your data is complete on Free. Upgrades are about freshness and history — not access.</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px" }}>
              {[
                { label: "Free", color: "#6B7280", bg: "#F3F4F6", border: "transparent", speed: "Hourly refresh", window: "7-day window" },
                { label: "Creator $7.99/mo", color: "#6366F1", bg: "rgba(99,102,241,0.06)", border: "rgba(99,102,241,0.15)", speed: "5-min refresh", window: "90-day window" },
                { label: "Pro $19.99/mo", color: "#6366F1", bg: "rgba(99,102,241,0.1)", border: "rgba(99,102,241,0.25)", speed: "Real-time (60s)", window: "1-year window + API" },
                { label: "Business $49.99/mo", color: "#6366F1", bg: "linear-gradient(135deg,rgba(99,102,241,0.08),rgba(139,92,246,0.08))", border: "rgba(99,102,241,0.3)", speed: "+ Replay sessions", window: "All-time history + Parquet" },
              ].map(({ label, color, bg, border, speed, window: win }) => (
                <div
                  key={label}
                  style={{
                    padding: "16px",
                    background: bg,
                    borderRadius: "10px",
                    textAlign: "center",
                    border: `1px solid ${border}`,
                  }}
                >
                  <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color, marginBottom: "8px" }}>{label}</div>
                  <div style={{ fontSize: "15px", fontWeight: 600 }}>{speed}</div>
                  <div style={{ fontSize: "13px", color: "#6B7280" }}>{win}</div>
                </div>
              ))}
            </div>
            <div style={{ marginTop: "22px", paddingTop: "18px", borderTop: "1px solid #E5E7EB", textAlign: "center" }}>
              <a
                href="/pricing"
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  padding: "12px 22px",
                  background: "#6366F1",
                  color: "#fff",
                  borderRadius: "999px",
                  fontWeight: 600,
                  fontSize: "15px",
                  textDecoration: "none",
                }}
              >
                See full pricing →
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPSELL PHILOSOPHY ── */}
      <section aria-label="Upsell philosophy" style={{ padding: "80px 0", background: "#fff" }}>
        <div className="container">
          <div
            style={{
              maxWidth: "720px",
              margin: "0 auto",
              textAlign: "center",
              padding: "36px 28px",
              background: "#fff",
              border: "1px solid #E5E7EB",
              borderRadius: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "26px",
                margin: "0 0 10px",
              }}
            >
              We don't show upgrade popups.{" "}
              <em style={{ fontStyle: "italic", color: "#F59E0B" }}>Ever.</em>
            </h3>
            <p style={{ margin: "0 0 16px", color: "#6B7280", fontSize: "15px" }}>
              When Creator ($7.99) or Pro ($19.99) would help you, you'll see a small{" "}
              <span
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px",
                  padding: "2px 8px",
                  background: "rgba(245,158,11,0.14)",
                  borderRadius: "999px",
                  fontWeight: 600,
                  color: "#92400E",
                  fontSize: "14px",
                }}
              >
                💡 tip
              </span>{" "}
              — dismissible, non-blocking, never interrupts your flow. No black banners, no mid-edit
              modals, no dark patterns.
            </p>
            <a
              href="/trust"
              style={{
                color: "#6366F1",
                fontWeight: 600,
                fontSize: "14px",
                borderBottom: "1px dashed #818CF8",
                textDecoration: "none",
              }}
            >
              Read our subtle-upsell philosophy →
            </a>
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section aria-labelledby="faq-heading" style={{ padding: "80px 0", background: "#F9FAFB" }}>
        <div className="container">
          <div style={{ textAlign: "center", maxWidth: "680px", margin: "0 auto 48px" }}>
            <h2
              id="faq-heading"
              style={{
                fontFamily: "var(--font-display)",
                fontWeight: 700,
                fontSize: "clamp(36px, 3.5vw, 46px)",
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
                margin: "0 0 14px",
              }}
            >
              Questions?{" "}
              <em style={{ fontStyle: "italic", color: "#6366F1" }}>Answered.</em>
            </h2>
            <p style={{ fontSize: "17px", color: "#6B7280" }}>The six things creators ask before switching.</p>
          </div>

          <div style={{ maxWidth: "780px", margin: "0 auto" }}>
            {/* landingFaqItems imported from ~/lib/landing-faq (DEC-355=C: no guest-mode promises) */}
            {landingFaqItems.map(({ q, a }) => (
              <details
                key={q}
                style={{
                  background: "#fff",
                  border: "1px solid #E5E7EB",
                  borderRadius: "10px",
                  padding: 0,
                  marginBottom: "12px",
                  overflow: "hidden",
                }}
              >
                <summary
                  style={{
                    listStyle: "none",
                    padding: "18px 22px",
                    fontWeight: 600,
                    fontSize: "16px",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                  }}
                >
                  {q}
                  <span
                    aria-hidden="true"
                    style={{
                      width: "22px",
                      height: "22px",
                      flexShrink: 0,
                      borderRadius: "50%",
                      background: "#F3F4F6",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                    }}
                  >
                    +
                  </span>
                </summary>
                <div style={{ padding: "0 22px 20px", color: "#6B7280", fontSize: "15px", lineHeight: 1.6 }}>
                  {a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA BAND ── */}
      <section
        aria-label="Claim your handle"
        style={{
          position: "relative",
          padding: "80px 0",
          background: "linear-gradient(120deg, #F59E0B 0%, #8B5CF6 60%, #6366F1 100%)",
          color: "#fff",
          overflow: "hidden",
        }}
      >
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: "radial-gradient(ellipse 70% 60% at 50% 120%, rgba(255,255,255,0.22), transparent 70%)",
            pointerEvents: "none",
          }}
        />
        <div
          className="container"
          style={{ position: "relative", textAlign: "center", maxWidth: "720px", margin: "0 auto" }}
        >
          <h2
            style={{
              fontFamily: "var(--font-display)",
              fontWeight: 700,
              fontSize: "clamp(36px, 4vw, 56px)",
              lineHeight: 1.05,
              margin: "0 0 14px",
              letterSpacing: "-0.015em",
            }}
          >
            Ready to claim your handle?
          </h2>
          <p style={{ fontSize: "17px", opacity: 0.92, margin: "0 0 28px" }}>
            Free forever. No credit card. No tricks.
          </p>

          <div style={{ display: "flex", justifyContent: "center" }}>
            <HandleClaimForm
              formId="final"
              state={finalForm.state}
              onInput={finalForm.onInput}
              onSubmit={finalForm.onSubmit}
              variant="on-dark"
            />
          </div>

          <p style={{ fontSize: "13px", opacity: 0.88, marginTop: "18px" }}>
            <strong>14,283</strong> creators joined this month.
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ background: "#0B0F1E", color: "#E5E7EB", padding: "64px 0 36px" }}>
        <div className="container">
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "32px",
              paddingBottom: "36px",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
            }}
          >
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
              <div key={heading}>
                <h4
                  style={{
                    fontSize: "12px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#9CA3AF",
                    margin: "0 0 14px",
                    fontWeight: 700,
                  }}
                >
                  {heading}
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                  {links.map(([label, href]) => (
                    <li key={label} style={{ marginBottom: "10px", fontSize: "14px" }}>
                      <a href={href} style={{ color: "#E5E7EB", textDecoration: "none" }}>
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Ask AI row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "14px",
              flexWrap: "wrap",
              padding: "22px 0",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              color: "#9CA3AF",
              fontSize: "13px",
            }}
          >
            <span style={{ fontWeight: 600, color: "#E5E7EB" }}>Ask AI about tadaify:</span>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {[
                ["ChatGPT", "https://chat.openai.com/?q=What%20is%20tadaify.com%3F"],
                ["Claude", "https://claude.ai/new?q=What%20is%20tadaify.com%3F"],
                ["Gemini", "https://gemini.google.com/app?q=What%20is%20tadaify.com%3F"],
                ["Perplexity", "https://www.perplexity.ai/?q=What%20is%20tadaify.com%3F"],
                ["Grok", "https://x.com/i/grok?text=What%20is%20tadaify.com%3F"],
              ].map(([label, href]) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    padding: "6px 12px",
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "999px",
                    fontSize: "12px",
                    fontWeight: 500,
                    color: "#E5E7EB",
                    textDecoration: "none",
                  }}
                >
                  {label}
                </a>
              ))}
            </div>
          </div>

          {/* Footer bottom */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              justifyContent: "space-between",
              gap: "12px",
              alignItems: "center",
              paddingTop: "22px",
              fontSize: "12px",
              color: "#6B7280",
            }}
          >
            <Wordmark onDark style={{ fontSize: "14px" }} />
            <span>© 2026 tadaify. Made by creators, for creators.</span>
            <span>
              <a href="/privacy" style={{ color: "#6B7280", textDecoration: "none" }}>Privacy</a>
              {" · "}
              <a href="/terms" style={{ color: "#6B7280", textDecoration: "none" }}>Terms</a>
              {" · "}
              <a href="/cookies" style={{ color: "#6B7280", textDecoration: "none" }}>Cookies</a>
            </span>
          </div>
        </div>
      </footer>
    </>
  );
}
