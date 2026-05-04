/**
 * /onboarding — Shared wizard layout
 *
 * Story: F-ONBOARDING-001a — Wizard skeleton + state propagation + 5 routes
 * Visual contract: mockups/tadaify-mvp/onboarding-welcome.html (merged PR #135)
 *
 * Layout:
 *   - Top nav with wordmark
 *   - Progress bar (steps 1-5; hidden on /onboarding/complete)
 *   - <Outlet /> for step-specific content
 *   - Right-col preview pane PLACEHOLDER (wired in #134b)
 *
 * URL state propagation:
 *   Step 1 (welcome)  → no state
 *   Step 2 (social)   → ?handle=<str>
 *   Step 3 (profile)  → ?handle=&platforms=<csv>&socials=<json>
 *   Step 4 (template) → + name, bio, av
 *   Step 5 (tier)     → + tpl
 *   complete          → + tier=free
 *
 * DEC trail:
 *   DEC-311=A  tier always free in MVP; no billing step
 *   DEC-297=B  flow: welcome → social → profile → template → tier → complete
 *   DEC-298=A  scraping skipped; profile is manual-only
 *   DEC-332=D  complete page: "page coming soon" semantics
 */

import { Outlet, Link, useLocation, useSearchParams } from "react-router";
import { MotionLogo } from "~/components/landing/MotionLogo";
import { ThemeToggleButton } from "~/components/ThemeToggleButton";

// ─── Step configuration ────────────────────────────────────────────────────────

interface StepConfig {
  path: string;
  label: string;
  title: string;
  number: number;
}

const STEPS: StepConfig[] = [
  { path: "/onboarding/welcome",  label: "Welcome",  title: "Welcome to tada!ify",           number: 1 },
  { path: "/onboarding/social",   label: "Socials",  title: "Connect your socials",           number: 2 },
  { path: "/onboarding/profile",  label: "Profile",  title: "Make it yours",                  number: 3 },
  { path: "/onboarding/template", label: "Template", title: "Pick a template",                number: 4 },
  { path: "/onboarding/tier",     label: "Plan",     title: "You're all set — starting Free", number: 5 },
];

// ─── Layout component ──────────────────────────────────────────────────────────

export default function OnboardingLayout() {
  const location = useLocation();
  const [searchParams] = useSearchParams();

  const isComplete = location.pathname === "/onboarding/complete";
  const currentStep = STEPS.find((s) => location.pathname.startsWith(s.path));
  const stepNumber = currentStep?.number ?? 1;
  const progressPct = (stepNumber / STEPS.length) * 100;
  const stepTitle = currentStep?.title ?? "";

  return (
    <>
      {/* ── Top nav ──────────────────────────────────────────────────────── */}
      <nav
        aria-label="Onboarding navigation"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 40,
          background: "var(--bg-elevated)",
          borderBottom: "1px solid var(--border)",
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          gap: 14,
          minHeight: 54,
        }}
      >
        <Link
          to="/"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            textDecoration: "none",
            color: "inherit",
          }}
          aria-label="tadaify home"
        >
          <MotionLogo size="nav" />
          <span className="font-display font-semibold text-[20px] tracking-tight">
            <span style={{ color: "var(--wm-ta)" }}>ta</span>
            <span style={{ color: "var(--wm-da)" }}>da!</span>
            <span style={{ color: "var(--wm-ify)" }}>ify</span>
          </span>
        </Link>

        <span style={{ flex: 1 }} />

        {!isComplete && currentStep && (
          <span
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-muted)",
            }}
            aria-label={`Step ${stepNumber} of ${STEPS.length}`}
          >
            Step {stepNumber} / {STEPS.length}
          </span>
        )}

        <ThemeToggleButton />
      </nav>

      {/* ── Progress bar (hidden on complete page) ───────────────────────── */}
      {!isComplete && currentStep && (
        <div
          className="ob-progress"
          aria-label={`Step ${stepNumber} of ${STEPS.length}: ${currentStep.label}`}
          style={{ padding: "16px 24px 0", maxWidth: 720, margin: "0 auto" }}
        >
          <span
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 500,
              color: "var(--fg-muted)",
              marginBottom: 8,
            }}
          >
            Step {stepNumber} of {STEPS.length} · {currentStep.label}
          </span>
          <div
            role="progressbar"
            aria-valuenow={stepNumber}
            aria-valuemin={1}
            aria-valuemax={STEPS.length}
            style={{
              height: 4,
              background: "var(--bg-muted)",
              borderRadius: "var(--radius-full)",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${progressPct}%`,
                background: "var(--brand-primary)",
                borderRadius: "var(--radius-full)",
                transition: "width 0.3s ease",
              }}
            />
          </div>
        </div>
      )}

      {/* ── Two-column shell: content left + preview-pane placeholder right ─ */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isComplete ? "1fr" : "minmax(0, 1fr) auto",
          minHeight: "calc(100vh - 54px)",
          maxWidth: isComplete ? undefined : 1200,
          margin: "0 auto",
        }}
        className="ob-shell-responsive"
      >
        {/* Step content via Outlet */}
        <main
          style={{
            padding: "clamp(24px, 4vw, 48px) clamp(16px, 4vw, 48px)",
          }}
        >
          {/* Step title header — suppressed on welcome (owns its own h1) */}
          {!isComplete && stepTitle && currentStep?.path !== "/onboarding/welcome" && (
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(26px, 4vw, 38px)",
                lineHeight: 1.1,
                marginBottom: 24,
                marginTop: 8,
              }}
            >
              {stepTitle}
            </h1>
          )}

          <Outlet />
        </main>

        {/* Preview pane placeholder (wired in #134b) */}
        {!isComplete && (
          <aside
            className="ob-preview-hide-mobile"
            aria-label="Page preview"
            style={{
              width: 360,
              background: "var(--bg-muted)",
              borderLeft: "1px solid var(--border)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              padding: 24,
            }}
          >
            <div
              style={{
                textAlign: "center",
                color: "var(--fg-subtle)",
                fontSize: 13,
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }} aria-hidden>
                📄
              </div>
              <p style={{ fontWeight: 500, marginBottom: 4 }}>Preview</p>
              <p style={{ color: "var(--fg-muted)" }}>Your page will appear here.</p>
            </div>
          </aside>
        )}
      </div>

      {/* Responsive CSS */}
      <style>{`
        @media (max-width: 900px) {
          .ob-preview-hide-mobile { display: none !important; }
          .ob-shell-responsive { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </>
  );
}
