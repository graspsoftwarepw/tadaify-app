/**
 * Onboarding complete — post-wizard success page (no progress bar). Faithful
 * port of mockups/tadaify-mvp/onboarding-complete.html: the live URL strip with
 * a Copy button, a prominent "Go to Dashboard" CTA, two next-step cards, a share
 * row, and a dismissible affiliate tip. Rendered inside OnboardingShell with
 * `hideProgress`.
 *
 * Dashboard CTA → /__proto/dashboard; preview/domain cards are real links;
 * Copy/Tweet/Instagram/affiliate-dismiss are local state + mock actions.
 *
 * @implements fr-onboarding
 */
import { useState } from "react";
import { OnboardingShell } from "./OnboardingShell";
import { completeFixture } from "./completeFixture";
import { readHandleParam } from "./handleParam";

export function CompleteScreen() {
  const { handle: fallbackHandle, heading, lede, nextSteps, affiliate } = completeFixture();
  const handle = readHandleParam(fallbackHandle);
  const [copied, setCopied] = useState(false);
  const [affClosed, setAffClosed] = useState(false);

  function copyUrl() {
    const url = `https://tadaify.com/${handle}`;
    if (navigator.clipboard) {
      void navigator.clipboard.writeText(url).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      });
    } else {
      window.alert(`Your URL: ${url} (prototype)`);
    }
  }

  return (
    <OnboardingShell hideProgress urlPill={`tadaify.com/${handle}`} showActionBar={false}>
      <div className="complete-host">
        <div className="hero-center">
          <span className="logo-wrap" aria-hidden="true">t</span>
          <h1 className="complete-h1">{heading}</h1>
          <p className="complete-lead">{lede}</p>

          <div className="big-url">
            <span>tadaify.com/{handle}</span>
            <button
              type="button"
              className={`copy-btn${copied ? " is-copied" : ""}`}
              onClick={copyUrl}
            >
              {copied ? "Copied ✓" : "Copy"}
            </button>
          </div>

          <div className="primary-cta-wrap">
            <a href="/__proto/dashboard" className="primary-cta">
              Go to Dashboard
              <span aria-hidden="true">→</span>
            </a>
          </div>
        </div>

        <div className="next-steps">
          {nextSteps.map((card) =>
            card.href ? (
              <a key={card.title} href={card.href} className={`step-card${card.warm ? " warm" : ""}`}>
                <div className="step-icon" aria-hidden="true">{card.icon}</div>
                <h4>{card.title}</h4>
                <p>{card.body}</p>
              </a>
            ) : (
              <button
                key={card.title}
                type="button"
                className={`step-card${card.warm ? " warm" : ""}`}
                onClick={() => window.alert(`${card.title} (prototype)`)}
              >
                <div className="step-icon" aria-hidden="true">{card.icon}</div>
                <h4>{card.title}</h4>
                <p>{card.body}</p>
              </button>
            ),
          )}
        </div>

        <div className="share-row">
          <button type="button" className="ob-btn ob-btn-secondary" onClick={copyUrl}>
            🔗 Copy URL
          </button>
          <button
            type="button"
            className="ob-btn ob-btn-secondary"
            onClick={() => window.alert("Opens a Tweet composer with your URL (prototype)")}
          >
            𝕏 Tweet
          </button>
          <button
            type="button"
            className="ob-btn ob-btn-secondary"
            onClick={() => window.alert("Opens the Instagram Story deep-link with your URL (prototype)")}
          >
            📸 Instagram Story
          </button>
        </div>

        {!affClosed && (
          <div className="affiliate-tip">
            <div>💡 <strong>{affiliate.text}</strong></div>
            <div style={{ display: "flex", gap: 8 }}>
              <a href="/__proto/affiliate" className="ob-btn ob-btn-primary">
                Set up affiliate →
              </a>
              <button
                type="button"
                className="close"
                aria-label="Dismiss"
                onClick={() => setAffClosed(true)}
              >
                ✕
              </button>
            </div>
          </div>
        )}
      </div>
    </OnboardingShell>
  );
}
