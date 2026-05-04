/**
 * AppSidebarDesignAccordion — Design accordion in the sidebar.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html sidebar Design section
 *
 * Contains:
 *   - Design parent item: collapsed by default; click expands inline (chevron rotates)
 *   - Auto-expand on ?tab=design or ?nav=expanded
 *   - 8 sub-items in correct order (Theme/Profile/Background/Text/Buttons/Animations/Colors/Footer)
 *   - Active sub-item visually distinct (left-border accent)
 *
 * Replaces the placeholder "Configuration" accordion from #171.
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-01, VE-26b-02, VE-26b-03, VE-26b-04
 * Unit tests: U1
 */

import { useState, useEffect } from "react";
import type { SubTabId } from "./DesignBreadcrumbStepper";

export const DESIGN_SUB_TABS: { id: SubTabId; label: string }[] = [
  { id: "theme", label: "Theme" },
  { id: "profile", label: "Profile" },
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "buttons", label: "Buttons" },
  { id: "animations", label: "Animations" },
  { id: "colors", label: "Colors" },
  { id: "footer", label: "Footer" },
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
  // Auto-expand when ?tab=design or ?nav=expanded
  const shouldAutoExpand = activeTab === "design" || navExpanded;
  const [expanded, setExpanded] = useState(shouldAutoExpand);

  // Sync expansion when activeTab/navExpanded changes
  useEffect(() => {
    if (shouldAutoExpand) {
      setExpanded(true);
    }
  }, [shouldAutoExpand]);

  const handleParentClick = () => {
    if (!expanded) {
      // Expanding: switch to design tab with default sub-tab=background
      setExpanded(true);
      onTabChange("design");
      if (!activeSubTab) {
        onSubTabChange("background");
      }
    } else {
      setExpanded(false);
    }
  };

  return (
    <div style={{ padding: "0 8px" }}>
      {/* Design parent button */}
      <button
        type="button"
        data-testid="nav-design-parent"
        onClick={handleParentClick}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          width: "100%",
          padding: "8px 10px",
          background: activeTab === "design" ? "var(--bg-muted)" : "transparent",
          border: "none",
          borderRadius: 8,
          cursor: "pointer",
          color: activeTab === "design" ? "var(--fg)" : "var(--fg-muted)",
          fontSize: 13.5,
          fontWeight: activeTab === "design" ? 600 : 400,
        }}
        aria-expanded={expanded}
        aria-controls="nav-design-sub"
      >
        {/* Design icon (palette) */}
        <svg
          width="14"
          height="14"
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
        <span style={{ flex: 1, textAlign: "left" }}>Design</span>
        {/* Chevron rotates on expand */}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{
            transform: expanded ? "rotate(90deg)" : "none",
            transition: "transform .15s",
          }}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
      </button>

      {/* Sub-items — 8 design sub-tabs */}
      {expanded && (
        <div
          id="nav-design-sub"
          role="group"
          aria-label="Design sub-sections"
          style={{ paddingLeft: 8 }}
        >
          {DESIGN_SUB_TABS.map((subTab) => {
            const isActive = activeTab === "design" && activeSubTab === subTab.id;
            return (
              <button
                key={subTab.id}
                type="button"
                data-testid={`nav-design-sub-${subTab.id}`}
                data-active={isActive ? "true" : undefined}
                aria-current={isActive ? "page" : undefined}
                onClick={() => {
                  onTabChange("design");
                  onSubTabChange(subTab.id);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "6px 10px",
                  background: isActive ? "var(--bg-muted)" : "transparent",
                  border: "none",
                  borderLeft: isActive ? "2px solid var(--brand-primary)" : "2px solid transparent",
                  borderRadius: "0 6px 6px 0",
                  cursor: "pointer",
                  color: isActive ? "var(--brand-primary)" : "var(--fg-muted)",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 400,
                  transition: "background .12s, border-color .12s",
                }}
              >
                {subTab.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
