/**
 * DesignFooter — Footer sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3376-3453
 *
 * Markup uses CSS classes from app/styles/app-dashboard.css:
 *   .field-group, .fg-label, .fg-help, .footer-option, .fo-radio, .fo-body,
 *   .fo-title, .fo-sub, .footer-tadaify-note, .support-badge-group,
 *   .support-row, .support-toggle, .support-row-body, .support-row-title,
 *   .opt-in-pill, .support-row-sub, .support-preview, .support-preview-frame,
 *   .support-preview-block, .support-preview-badge, .support-fineprint,
 *   .wm-mini.
 *
 * AP-001 enforced: NEVER add "Powered by tadaify" toggle.
 * Wordmark canonical 3-span (DEC-WORDMARK-01).
 * DEC-OPT-BADGE: default OFF.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-30..33, AP-001, DEC-OPT-BADGE
 */

import { useState } from "react";

type FooterChoice = "empty" | "custom" | "social";

interface DesignFooterProps {
  onSave?: (toast: string) => void;
}

const WordmarkMini = () => (
  <span className="wm-mini">
    <span className="ta">ta</span>
    <span className="da">da!</span>
    <span className="ify">ify</span>
  </span>
);

export function DesignFooter({ onSave }: DesignFooterProps) {
  const [choice, setChoice] = useState<FooterChoice>("custom");
  const [customText, setCustomText] = useState(
    "© 2026 Alexandra Silva · hello@alexandra.co",
  );
  const [supportBadge, setSupportBadge] = useState(false); // DEC-OPT-BADGE: default OFF

  return (
    <>
      <div className="field-group">
        <label className="fg-label">Footer content</label>
        <div className="fg-help">
          Your footer is yours. tadaify doesn't stick a "Powered by" line on your page — your
          creator brand stays yours, even on Free.
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
          {/* Empty footer */}
          <label className={`footer-option${choice === "empty" ? " selected" : ""}`}>
            <input
              type="radio"
              name="footer-option"
              value="empty"
              checked={choice === "empty"}
              onChange={() => {
                setChoice("empty");
                onSave?.("Saved");
              }}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              aria-label="Empty footer"
            />
            <span className="fo-radio" />
            <div className="fo-body">
              <div className="fo-title">Empty footer</div>
              <div className="fo-sub">Nothing below your last block — the cleanest look.</div>
            </div>
          </label>

          {/* Custom text */}
          <label className={`footer-option${choice === "custom" ? " selected" : ""}`}>
            <input
              type="radio"
              name="footer-option"
              value="custom"
              checked={choice === "custom"}
              onChange={() => {
                setChoice("custom");
                onSave?.("Saved");
              }}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              aria-label="Custom text"
            />
            <span className="fo-radio" />
            <div className="fo-body">
              <div className="fo-title">Custom text</div>
              <div className="fo-sub">
                A line in your own voice — copyright, tagline, contact hint, anything.
              </div>
              <textarea
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                rows={2}
                disabled={choice !== "custom"}
                aria-label="Custom footer text"
              />
            </div>
          </label>

          {/* Social handles */}
          <label className={`footer-option${choice === "social" ? " selected" : ""}`}>
            <input
              type="radio"
              name="footer-option"
              value="social"
              checked={choice === "social"}
              onChange={() => {
                setChoice("social");
                onSave?.("Saved");
              }}
              style={{ position: "absolute", opacity: 0, pointerEvents: "none" }}
              aria-label="Social handles"
            />
            <span className="fo-radio" />
            <div className="fo-body">
              <div className="fo-title">Social handles</div>
              <div className="fo-sub">
                Repeat your @ handles in the footer so people can find you across platforms.
              </div>
            </div>
          </label>
        </div>

        <div className="footer-tadaify-note">
          <strong>Your footer, your call.</strong> tadaify never inserts a "Powered by" line on
          your page. Your footer is entirely yours on every tier — Free included.
        </div>
      </div>

      {/* Opt-in support badge — DEC-OPT-BADGE: default OFF */}
      <div className="field-group support-badge-group">
        <label className="fg-label">Help tadaify grow (optional)</label>
        <div className="fg-help">
          We're a young, indie team. We <strong>never</strong> force our brand on your page —
          but if you'd like to help others discover us, you can add a small, understated{" "}
          <WordmarkMini /> mark below your footer.
        </div>

        <label className="support-row">
          <span className="support-toggle">
            <input
              type="checkbox"
              checked={supportBadge}
              onChange={(e) => {
                setSupportBadge(e.target.checked);
                onSave?.("Saved");
              }}
              aria-label="Show made with tadaify badge"
            />
            <span className="support-toggle-track">
              <span className="support-toggle-thumb" />
            </span>
          </span>
          <div className="support-row-body">
            <div className="support-row-title">
              Show <em>made with</em> <WordmarkMini /> badge
              <span className="opt-in-pill">Opt-in · Off by default</span>
            </div>
            <div className="support-row-sub">
              Adds a tiny line under your last block: <em>made with <WordmarkMini /></em>{" "}
              linking to <code>tadaify.com</code>. Your visitors who like your page can discover
              us — and you help an indie team grow. No discount, no incentive needed; just a
              thank-you option.
            </div>
          </div>
        </label>

        <div className="support-preview" aria-live="polite">
          <span className="support-preview-label">Preview</span>
          <div className="support-preview-frame">
            <div className="support-preview-block">your last block</div>
            {supportBadge && (
              <div className="support-preview-badge">
                made with <WordmarkMini />
              </div>
            )}
          </div>
        </div>

        <p className="support-fineprint">
          Free to remove anytime · Never affects your plan · We don't track who turns this on
        </p>
      </div>
    </>
  );
}
