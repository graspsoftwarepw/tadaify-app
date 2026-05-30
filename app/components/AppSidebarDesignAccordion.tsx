/**
 * AppSidebarDesignAccordion — Configuration accordion in the sidebar.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html sidebar Configuration
 * section (`.nav-design-parent` + `.nav-sub-list` with 8 sub-items).
 *
 * The mockup renames the historical "Design" parent to "Configuration"
 * (TADA-BUG-005 IA restructure) while keeping the same 8 sub-tabs. Component
 * name and sub-tab IDs stay `design*` for stable test ids / route mapping;
 * only the visible label moves to "Configuration".
 *
 * Contains:
 *   - Parent item (`.nav-item.nav-design-parent`): collapsed by default;
 *     click expands inline (nav-caret rotates via aria-expanded).
 *   - Auto-expand on ?tab=design or ?nav=expanded.
 *   - 8 sub-items, mockup order: Theme / Profile / Background / Text / Buttons /
 *     Animations / Colors / Footer.
 *   - Active sub-item gets `.active` styling (see app-dashboard.css
 *     `.nav-sub-item.active`).
 *
 * Story: F-APP-DASHBOARD-001b (#173), Pass 4 of dashboard-mockup-fidelity.
 * Covers: VE-26b-01, VE-26b-02, VE-26b-03, VE-26b-04
 * Unit tests: U1
 */

import { useState, useEffect } from "react";
import type { SubTabId } from "./DesignBreadcrumbStepper";

interface SubTabDef {
  id: SubTabId;
  label: string;
  svg: React.ReactNode;
}

const SUB_TAB_SVG = {
  theme: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 9v12" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 21a8 8 0 0 1 16 0" />
    </>
  ),
  background: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>
  ),
  text: (
    <>
      <polyline points="4 7 4 4 20 4 20 7" />
      <line x1="9" y1="20" x2="15" y2="20" />
      <line x1="12" y1="4" x2="12" y2="20" />
    </>
  ),
  buttons: (
    <>
      <rect x="2" y="6" width="20" height="5" rx="2.5" />
      <rect x="2" y="14" width="20" height="5" rx="2.5" />
    </>
  ),
  animations: (
    <>
      <path d="M12 2v4" />
      <path d="M12 18v4" />
      <path d="M4.93 4.93l2.83 2.83" />
      <path d="M16.24 16.24l2.83 2.83" />
      <path d="M2 12h4" />
      <path d="M18 12h4" />
      <path d="M4.93 19.07l2.83-2.83" />
      <path d="M16.24 7.76l2.83-2.83" />
    </>
  ),
  colors: (
    <>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" />
    </>
  ),
  footer: (
    <>
      <line x1="12" y1="2" x2="12" y2="22" />
      <line x1="2" y1="12" x2="22" y2="12" />
    </>
  ),
} as const;

export const DESIGN_SUB_TABS: SubTabDef[] = [
  { id: "theme", label: "Theme", svg: SUB_TAB_SVG.theme },
  { id: "profile", label: "Profile", svg: SUB_TAB_SVG.profile },
  { id: "background", label: "Background", svg: SUB_TAB_SVG.background },
  { id: "text", label: "Text", svg: SUB_TAB_SVG.text },
  { id: "buttons", label: "Buttons", svg: SUB_TAB_SVG.buttons },
  { id: "animations", label: "Animations", svg: SUB_TAB_SVG.animations },
  { id: "colors", label: "Colors", svg: SUB_TAB_SVG.colors },
  { id: "footer", label: "Footer", svg: SUB_TAB_SVG.footer },
];

interface AppSidebarDesignAccordionProps {
  activeTab: string;
  activeSubTab: string;
  navExpanded?: boolean;
  onTabChange: (tab: string) => void;
  onSubTabChange: (subTab: SubTabId) => void;
}

export function AppSidebarDesignAccordion({
  activeTab,
  activeSubTab,
  navExpanded = false,
  onTabChange,
  onSubTabChange,
}: AppSidebarDesignAccordionProps) {
  // Auto-expand when ?tab=design or ?nav=expanded.
  const shouldAutoExpand = activeTab === "design" || navExpanded;
  const [expanded, setExpanded] = useState(shouldAutoExpand);

  // Sync expansion when activeTab/navExpanded changes.
  useEffect(() => {
    if (shouldAutoExpand) {
      setExpanded(true);
    }
  }, [shouldAutoExpand]);

  const handleParentClick = () => {
    if (!expanded) {
      // Expanding: switch to design tab with default sub-tab=background.
      setExpanded(true);
      onTabChange("design");
      if (!activeSubTab) {
        onSubTabChange("background");
      }
    } else {
      setExpanded(false);
    }
  };

  const isDesignTab = activeTab === "design";

  return (
    <div className="nav-group" style={{ paddingTop: 0 }}>
      {/* Configuration parent button */}
      <button
        type="button"
        data-testid="nav-design-parent"
        className={`nav-item nav-design-parent${isDesignTab ? " active" : ""}`}
        data-nav="design"
        data-tip="Configuration"
        aria-expanded={expanded}
        aria-controls="nav-design-sub"
        onClick={handleParentClick}
      >
        {/* Palette icon — matches mockup verbatim. */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
          <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
          <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
          <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
          <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" />
        </svg>
        <span className="label">Configuration</span>
        <svg
          className="nav-caret"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Sub-items — 8 design sub-tabs. `nav-sub-list` visibility driven by
          data-expanded; CSS in app-dashboard.css handles the hide/show. */}
      <div
        className="nav-sub-list"
        id="nav-design-sub"
        data-expanded={expanded ? "true" : "false"}
        role="group"
        aria-label="Design sub-sections"
      >
        {DESIGN_SUB_TABS.map((subTab) => {
          const isActive = isDesignTab && activeSubTab === subTab.id;
          return (
            <button
              key={subTab.id}
              type="button"
              data-testid={`nav-design-sub-${subTab.id}`}
              data-active={isActive ? "true" : undefined}
              data-nav-sub={subTab.id}
              aria-current={isActive ? "page" : undefined}
              className={`nav-sub-item${isActive ? " active" : ""}`}
              onClick={() => {
                onTabChange("design");
                onSubTabChange(subTab.id);
              }}
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                {subTab.svg}
              </svg>
              <span>{subTab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
