/**
 * OnboardingShell — the shared wizard shell for the tadaify onboarding flow.
 *
 * Ported faithfully from the wizard chrome in
 * mockups/tadaify-mvp/onboarding-*.html: the progress bar ("Step N of 5" label
 * + track + gradient fill) and the sticky action bar (Back / Continue with an
 * optional hint + microcopy). The `complete` step reuses the page chrome but
 * hides the progress bar (`hideProgress`).
 *
 * Shared infrastructure: carries no per-screen traceability marker and is not
 * listed in any FR's related_files. The six step screens render their body
 * inside it.
 */
import type { ReactNode } from "react";
import { ThemeToggle } from "../../lib/ThemeToggle";
import { Wordmark } from "../../lib/Wordmark";
import "./onboarding-proto.css";

export type OnboardingShellProps = {
  /** Current step number, 1-5. Ignored when `hideProgress`. */
  step?: number;
  /** The full progress label, e.g. "Step 1 of 5 · Welcome". */
  stepLabel?: string;
  /** Progress fill width as a percentage, e.g. 20 for step 1/5. */
  fillPct?: number;
  /** Hide the progress bar entirely (the post-wizard complete page). */
  hideProgress?: boolean;
  /** Real `/__proto/*` Back target. Omit to hide the Back button. */
  backHref?: string;
  /** Real `/__proto/*` Continue target. Omit to hide the action bar's Continue. */
  continueHref?: string;
  /** Continue button label. Defaults to "Continue". */
  continueLabel?: string;
  /** Optional hint line above the buttons. */
  hint?: ReactNode;
  /** Optional microcopy line below the buttons. */
  microcopy?: ReactNode;
  /** The url shown in the mockup-only hub strip pill. */
  urlPill?: string;
  /** Render the action bar at all. Steps that supply their own CTA set false. */
  showActionBar?: boolean;
  children: ReactNode;
};

export function OnboardingShell({
  step,
  stepLabel,
  fillPct = 0,
  hideProgress = false,
  backHref,
  continueHref,
  continueLabel = "Continue",
  hint,
  microcopy,
  urlPill = "tadaify.com · onboarding",
  showActionBar = true,
  children,
}: OnboardingShellProps) {
  return (
    <div className="proto-onboarding">
      {/* Mockup-only hub strip (the mockups injected a shared nav here). */}
      <div className="ob-topstrip">
        <Wordmark size="sm" />
        <a className="ob-back-hub" href="/__proto">
          ← Prototype map
        </a>
        <span className="ob-url-pill">{urlPill}</span>
        <div className="ob-toolbar">
          <ThemeToggle />
        </div>
      </div>

      <main className="ob-shell">
        <div className="ob-inner">
          {!hideProgress && (
            <div
              className="ob-progress"
              role="group"
              aria-label={stepLabel ?? (step ? `Step ${step} of 5` : undefined)}
            >
              <span className="ob-progress-label">{stepLabel}</span>
              <div className="ob-progress-track">
                <div className="ob-progress-fill" style={{ width: `${fillPct}%` }} />
              </div>
            </div>
          )}

          {children}
        </div>
      </main>

      {showActionBar && (backHref || continueHref) && (
        <div className="ob-actionbar">
          <div className="ob-actionbar-inner">
            {hint && <p className="ob-hint">{hint}</p>}
            <div className="ob-buttons">
              {backHref && (
                <a className="ob-btn ob-btn-ghost" href={backHref}>
                  ← Back
                </a>
              )}
              {continueHref && (
                <a className="ob-btn ob-btn-warm ob-btn-lg" href={continueHref}>
                  {continueLabel}
                  <span aria-hidden="true">→</span>
                </a>
              )}
            </div>
            {microcopy && <p className="ob-microcopy">{microcopy}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
