/**
 * DesignPanel — Container for the Design panel (section.main-design).
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 2857-3458
 *
 * Contains:
 *   - DesignBreadcrumbStepper at top
 *   - Active sub-tab content via switch on ?subtab (default: background)
 *   - Toast notification for placeholder "save" actions
 *
 * Sub-tab default: background (per issue #173 spec + mockup line 3077).
 * Invalid ?subtab=foobar falls back to background + console warning.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-05..35, ECN-26b-01..13
 * Unit tests: U3
 */

import { useState, useCallback, useEffect } from "react";
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
    const timer = setTimeout(() => setToastMessage(null), 2200);
    return () => clearTimeout(timer);
  }, []);

  const renderSubTab = () => {
    switch (validSubTab) {
      case "theme":
        return <DesignTheme onSave={handleSave} />;
      case "profile":
        return <DesignProfile onSave={handleSave} />;
      case "background":
        return (
          <DesignBackground
            currentTier={currentTier}
            onSave={handleSave}
          />
        );
      case "text":
        return <DesignText onSave={handleSave} />;
      case "buttons":
        return <DesignButtons onSave={handleSave} />;
      case "animations":
        return <DesignAnimations onSave={handleSave} />;
      case "colors":
        return <DesignColors onSave={handleSave} />;
      case "footer":
        return <DesignFooter onSave={handleSave} />;
      default:
        return <DesignBackground currentTier={currentTier} onSave={handleSave} />;
    }
  };

  return (
    <div
      data-testid="design-panel"
      className="main-design"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      {/* Breadcrumb stepper */}
      <DesignBreadcrumbStepper
        activeSubTab={validSubTab}
        onSubTabChange={onSubTabChange}
      />

      {/* Sub-tab content area */}
      <div
        data-testid="design-panel-content"
        style={{ flex: 1, overflowY: "auto" }}
      >
        {renderSubTab()}
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
    </div>
  );
}
