/**
 * DesignFooter — Footer sub-tab content.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 3376-3458
 *
 * Contains:
 *   - Help copy "Your footer is yours. tadaify doesn't stick a 'Powered by' line..."
 *   - 3 footer-option radios: Empty footer / Custom text / Social handles
 *   - .footer-tadaify-note strong banner reaffirming AP-001
 *   - .support-badge-group opt-in support badge toggle (DEC-OPT-BADGE: default OFF)
 *
 * AP-001 enforced: NEVER add "Powered by tadaify" toggle.
 * Wordmark canonical 3-span (DEC-WORDMARK-01).
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-30, VE-26b-31, VE-26b-32, VE-26b-33, AP-001, DEC-OPT-BADGE
 */

import { useState } from "react";

type FooterOption = "empty" | "custom" | "social";

interface DesignFooterProps {
  onSave?: (toast: string) => void;
}

export function DesignFooter({ onSave }: DesignFooterProps) {
  const [footerOption, setFooterOption] = useState<FooterOption>("custom");
  const [customText, setCustomText] = useState(
    "© 2026 Alexandra Silva · hello@alexandra.co"
  );
  const [supportBadge, setSupportBadge] = useState(false); // DEC-OPT-BADGE: default OFF

  return (
    <section data-panel="footer" style={{ padding: "24px 28px", maxWidth: 680 }}>
      <h3
        style={{
          fontSize: 15,
          fontWeight: 700,
          color: "var(--fg)",
          marginBottom: 6,
        }}
      >
        Footer
      </h3>
      {/* Help copy — VE-26b-30 */}
      <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 22, lineHeight: 1.55 }}>
        Your footer is yours.{" "}
        <span style={{ fontWeight: 700 }}>tada</span>
        <span style={{ fontWeight: 900, color: "var(--brand-primary)" }}>!</span>
        <span style={{ fontWeight: 700 }}>ify</span> doesn't stick a 'Powered by' line on
        your page. On any tier, free included.
      </p>

      {/* 3 footer-option radios — VE-26b-31 */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 10,
          marginBottom: 24,
        }}
      >
        {/* Empty footer */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            border: `2px solid ${footerOption === "empty" ? "var(--brand-primary)" : "var(--border)"}`,
            borderRadius: 10,
            background: footerOption === "empty"
              ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
              : "var(--bg-elevated)",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="footer-option"
            value="empty"
            checked={footerOption === "empty"}
            onChange={() => {
              setFooterOption("empty");
              onSave?.("Saved");
            }}
            style={{ marginTop: 2 }}
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
              Empty footer
            </div>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 2 }}>
              No footer on your page
            </div>
          </div>
        </label>

        {/* Custom text */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            border: `2px solid ${footerOption === "custom" ? "var(--brand-primary)" : "var(--border)"}`,
            borderRadius: 10,
            background: footerOption === "custom"
              ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
              : "var(--bg-elevated)",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="footer-option"
            value="custom"
            checked={footerOption === "custom"}
            onChange={() => setFooterOption("custom")}
            style={{ marginTop: 2 }}
          />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)", marginBottom: 8 }}>
              Custom text
            </div>
            <textarea
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              rows={2}
              disabled={footerOption !== "custom"}
              style={{
                width: "100%",
                padding: "8px 10px",
                border: "1px solid var(--border)",
                borderRadius: 6,
                background: "var(--bg)",
                color: "var(--fg)",
                fontSize: 13,
                resize: "vertical",
                fontFamily: "inherit",
                opacity: footerOption !== "custom" ? 0.5 : 1,
                boxSizing: "border-box",
              }}
              aria-label="Custom footer text"
            />
          </div>
        </label>

        {/* Social handles */}
        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 12,
            padding: "14px 16px",
            border: `2px solid ${footerOption === "social" ? "var(--brand-primary)" : "var(--border)"}`,
            borderRadius: 10,
            background: footerOption === "social"
              ? "color-mix(in srgb, var(--brand-primary) 6%, var(--bg-elevated))"
              : "var(--bg-elevated)",
            cursor: "pointer",
          }}
        >
          <input
            type="radio"
            name="footer-option"
            value="social"
            checked={footerOption === "social"}
            onChange={() => {
              setFooterOption("social");
              onSave?.("Saved");
            }}
            style={{ marginTop: 2 }}
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
              Social handles
            </div>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 2 }}>
              Show icons linking to your social profiles
            </div>
          </div>
        </label>
      </div>

      {/* footer-tadaify-note banner — VE-26b-32, AP-001 */}
      <div
        className="footer-tadaify-note"
        style={{
          background: "color-mix(in srgb, var(--brand-primary) 8%, var(--bg-elevated))",
          border: "1px solid color-mix(in srgb, var(--brand-primary) 20%, transparent)",
          borderRadius: 10,
          padding: "14px 18px",
          fontSize: 13,
          color: "var(--fg)",
          lineHeight: 1.55,
          marginBottom: 20,
        }}
      >
        <strong>Your footer, your call.</strong>{" "}
        <span style={{ fontWeight: 700 }}>tada</span>
        <span style={{ fontWeight: 900, color: "var(--brand-primary)" }}>!</span>
        <span style={{ fontWeight: 700 }}>ify</span> never inserts a 'Powered by' line on your
        page. Your footer is entirely yours on every tier — Free included.
      </div>

      {/* support-badge-group opt-in — VE-26b-33, DEC-OPT-BADGE: default OFF */}
      <div
        className="support-badge-group"
        style={{
          border: "1px solid var(--border)",
          borderRadius: 10,
          padding: "14px 18px",
          background: "var(--bg-elevated)",
          marginBottom: 24,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={supportBadge}
            onChange={(e) => {
              setSupportBadge(e.target.checked);
              onSave?.("Saved");
            }}
            style={{ width: 16, height: 16 }}
            aria-label="Show support badge"
          />
          <div>
            <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
              Show a small support badge <em>(opt-in, default off)</em>
            </div>
            <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 2 }}>
              Adds a subtle "Made with tadaify" badge to your footer — if you'd like to support
              us. Completely optional. You can remove it any time.
            </div>
          </div>
        </label>
      </div>

      <button
        type="button"
        onClick={() => onSave?.("Saved")}
        style={{
          padding: "9px 22px",
          border: "none",
          borderRadius: 8,
          background: "var(--brand-primary)",
          color: "#fff",
          cursor: "pointer",
          fontSize: 13.5,
          fontWeight: 600,
        }}
      >
        Save footer
      </button>
    </section>
  );
}
