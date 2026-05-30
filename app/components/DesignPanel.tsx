/**
 * DesignPanel — Container for the Design panel (section.main-design).
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 2857-3458
 *
 * Renders the mockup's exact structure:
 *   section.main-design
 *     .page-head — h1 "Design" + sub copy + actions (Discard / Save)
 *     .design-wrap
 *       nav.design-subnav   — 8 tab buttons (visually hidden by CSS V2,
 *                             markup preserved for diff parity)
 *       .design-content
 *         DesignBreadcrumbStepper (.design-stepper)
 *         .design-panel.active for the current sub-tab
 *
 * Sub-tab default: background (per issue #173 spec + mockup line 3077).
 * Invalid ?subtab=foobar falls back to background + console warning.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-05..35, ECN-26b-01..13
 * Unit tests: U3
 */

import { useState, useCallback } from "react";
import { DesignBreadcrumbStepper, SUB_TABS } from "./DesignBreadcrumbStepper";
import type { SubTabId } from "./DesignBreadcrumbStepper";
import { DesignTheme } from "./app-design/DesignTheme";
import { DesignProfile } from "./app-design/DesignProfile";
import { DesignBackground } from "./app-design/DesignBackground";
import { DesignText } from "./app-design/DesignText";
import { DesignButtons } from "./app-design/DesignButtons";
import { DesignAnimations } from "./app-design/DesignAnimations";
import { DesignColors } from "./app-design/DesignColors";
import { DesignFooter } from "./app-design/DesignFooter";

export const DEFAULT_DESIGN_SUBTAB: SubTabId = "background";

/** Validate and normalize a subtab param string. */
export function normalizeSubTab(raw: string | null | undefined): SubTabId {
  if (!raw) return DEFAULT_DESIGN_SUBTAB;
  const found = SUB_TABS.find((t) => t.id === raw);
  if (!found) {
    console.warn(`[DesignPanel] invalid ?subtab="${raw}" — falling back to "background"`);
    return DEFAULT_DESIGN_SUBTAB;
  }
  return found.id;
}

/* SVG icons — match mockup design-subnav order/styles (lines 2870-2902) */
const SUBNAV_ICONS: Record<SubTabId, React.ReactNode> = {
  theme: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </svg>
  ),
  profile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </svg>
  ),
  background: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </svg>
  ),
  buttons: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="6" width="20" height="5" rx="2.5" />
      <rect x="2" y="14" width="20" height="5" rx="2.5" />
    </svg>
  ),
  animations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </svg>
  ),
  colors: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" />
    </svg>
  ),
  footer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </svg>
  ),
};

interface DesignPanelProps {
  activeSubTab: string;
  currentTier?: string;
  onSubTabChange: (subTab: SubTabId) => void;
}

export function DesignPanel({
  activeSubTab,
  currentTier = "free",
  onSubTabChange,
}: DesignPanelProps) {
  const validSubTab = normalizeSubTab(activeSubTab);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Show toast briefly — placeholder save feedback (visual-only slice)
  const handleSave = useCallback((message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2200);
  }, []);

  // Render each sub-panel; the active one gets `.design-panel.active`,
  // others get `.design-panel` (display:none via CSS line 891).
  const renderPanel = (id: SubTabId, body: React.ReactNode) => (
    <div
      key={id}
      className={`design-panel${validSubTab === id ? " active" : ""}`}
      data-panel={id}
    >
      {body}
    </div>
  );

  return (
    <section
      className="main-design"
      aria-labelledby="design-title"
      data-testid="design-panel"
    >
      {/* Page head — h1 + sub copy + actions */}
      <div className="page-head">
        <div>
          <h1 id="design-title">Design</h1>
          <div className="sub">
            Changes apply instantly in the preview. Your page saves automatically as you go.
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => handleSave("Discarded")}
          >
            Discard
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => handleSave("Saved")}
          >
            Save
          </button>
        </div>
      </div>

      <div className="design-wrap">
        {/* Legacy sub-nav — preserved for mockup-fidelity diff;
            visually hidden by CSS (line 875) since the sidebar accordion
            + breadcrumb stepper now own that navigation. */}
        <nav className="design-subnav" aria-label="Design sub-navigation">
          {SUB_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`sub-item${validSubTab === tab.id ? " active" : ""}`}
              data-subnav={tab.id}
              onClick={() => onSubTabChange(tab.id)}
            >
              {SUBNAV_ICONS[tab.id]}
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="design-content" data-testid="design-panel-content" style={{ minWidth: 0 }}>
          {/* Breadcrumb stepper */}
          <DesignBreadcrumbStepper
            activeSubTab={validSubTab}
            onSubTabChange={onSubTabChange}
          />

          {/* All 8 panels — only `.active` one is visible via CSS */}
          {renderPanel("theme", <DesignTheme onSave={handleSave} />)}
          {renderPanel("profile", <DesignProfile onSave={handleSave} />)}
          {renderPanel(
            "background",
            <DesignBackground currentTier={currentTier} onSave={handleSave} />,
          )}
          {renderPanel("text", <DesignText onSave={handleSave} />)}
          {renderPanel("buttons", <DesignButtons onSave={handleSave} />)}
          {renderPanel("animations", <DesignAnimations onSave={handleSave} />)}
          {renderPanel("colors", <DesignColors onSave={handleSave} />)}
          {renderPanel("footer", <DesignFooter onSave={handleSave} />)}
        </div>
      </div>

      {/* Toast notification (visual-only save feedback) */}
      {toastMessage && (
        <div
          data-testid="design-toast"
          role="status"
          aria-live="polite"
          style={{
            position: "fixed",
            bottom: 28,
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(17, 24, 39, 0.92)",
            color: "#fff",
            padding: "10px 22px",
            borderRadius: 8,
            fontSize: 13.5,
            fontWeight: 600,
            zIndex: 9999,
            pointerEvents: "none",
            boxShadow: "0 4px 20px rgba(0,0,0,0.25)",
          }}
        >
          {toastMessage}
        </div>
      )}
    </section>
  );
}
