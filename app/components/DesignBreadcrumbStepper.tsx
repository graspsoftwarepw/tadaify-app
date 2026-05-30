/**
 * DesignBreadcrumbStepper — 3-cell window breadcrumb at top of Design panel.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines 2907-2924
 * Uses CSS classes `.design-stepper / .stepper-cell / .stepper-divider /
 * .stepper-dropdown` defined in app/styles/app-dashboard.css.
 *
 * Contains:
 *   - 3-cell window: prev (faded) / current (highlighted) / next (faded)
 *   - Click current → dropdown opens with all 8 sub-tab options
 *   - Keyboard ←/→ navigate prev/next sub-tab
 *   - Mobile: collapses to chevrons (CSS owned)
 *
 * Story: F-APP-DASHBOARD-001b (#173)
 * Covers: VE-26b-05, VE-26b-06, VE-26b-07, VE-26b-08
 * Unit tests: U2
 */

import { useState, useEffect, useRef } from "react";

export const SUB_TABS = [
  { id: "theme", label: "Theme" },
  { id: "profile", label: "Profile" },
  { id: "background", label: "Background" },
  { id: "text", label: "Text" },
  { id: "buttons", label: "Buttons" },
  { id: "animations", label: "Animations" },
  { id: "colors", label: "Colors" },
  { id: "footer", label: "Footer" },
] as const;

export type SubTabId = (typeof SUB_TABS)[number]["id"];

/** Derive prev/current/next from the ordered list. */
export function deriveStepperWindow(current: string): {
  prev: SubTabId | null;
  current: SubTabId;
  next: SubTabId | null;
} {
  const idx = SUB_TABS.findIndex((t) => t.id === current);
  const safeIdx = idx < 0 ? 2 : idx; // default to background (index 2) if not found
  return {
    prev: safeIdx > 0 ? SUB_TABS[safeIdx - 1].id : null,
    current: SUB_TABS[safeIdx].id,
    next: safeIdx < SUB_TABS.length - 1 ? SUB_TABS[safeIdx + 1].id : null,
  };
}

interface DesignBreadcrumbStepperProps {
  activeSubTab: string;
  onSubTabChange: (subTab: SubTabId) => void;
}

const ChevLeft = () => (
  <svg
    className="chev"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevRight = () => (
  <svg
    className="chev"
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
);

export function DesignBreadcrumbStepper({
  activeSubTab,
  onSubTabChange,
}: DesignBreadcrumbStepperProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { prev, current, next } = deriveStepperWindow(activeSubTab);
  const prevLabel = prev ? SUB_TABS.find((t) => t.id === prev)?.label : null;
  const nextLabel = next ? SUB_TABS.find((t) => t.id === next)?.label : null;
  const currentLabel = SUB_TABS.find((t) => t.id === current)?.label ?? "";

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  // Keyboard ←/→ navigation — scoped to avoid interference with form inputs
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable ||
        e.metaKey ||
        e.ctrlKey ||
        e.altKey
      ) {
        return;
      }
      if (e.key === "ArrowRight" && next) {
        e.preventDefault();
        onSubTabChange(next);
      } else if (e.key === "ArrowLeft" && prev) {
        e.preventDefault();
        onSubTabChange(prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [prev, next, onSubTabChange]);

  return (
    <nav
      className="design-stepper"
      data-testid="design-breadcrumb-stepper"
      aria-label="Design sub-section stepper"
      id="design-stepper"
    >
      {/* Prev arrow */}
      <button
        type="button"
        className="stepper-cell stepper-arrow"
        data-stepper="prev"
        aria-label="Previous sub-section"
        disabled={!prev}
        onClick={() => prev && onSubTabChange(prev)}
      >
        <ChevLeft />
        <span className="stepper-arrow-label">{prevLabel ?? "—"}</span>
      </button>

      <span className="stepper-divider" aria-hidden="true" />

      {/* Current cell (opens dropdown) */}
      <div
        ref={dropdownRef}
        style={{ display: "contents" }}
      >
        <button
          type="button"
          className="stepper-cell is-current"
          data-stepper="current"
          data-testid="stepper-current"
          aria-haspopup="listbox"
          aria-expanded={dropdownOpen}
          aria-controls="stepper-dropdown"
          onClick={() => setDropdownOpen((v) => !v)}
        >
          <span className="step-spark" aria-hidden="true" />
          <span data-stepper-current-label>{currentLabel}</span>
        </button>
      </div>

      <span className="stepper-divider" aria-hidden="true" />

      {/* Next arrow */}
      <button
        type="button"
        className="stepper-cell stepper-arrow"
        data-stepper="next"
        aria-label="Next sub-section"
        disabled={!next}
        onClick={() => next && onSubTabChange(next)}
      >
        <span className="stepper-arrow-label">{nextLabel ?? "—"}</span>
        <ChevRight />
      </button>

      {/* Dropdown — all 8 sub-tabs */}
      <div
        className="stepper-dropdown"
        id="stepper-dropdown"
        data-open={dropdownOpen ? "true" : "false"}
        role="listbox"
        aria-label="All Design sub-sections"
      >
        {SUB_TABS.map((tab) => {
          const isCurrent = tab.id === current;
          return (
            <button
              key={tab.id}
              type="button"
              role="option"
              aria-selected={isCurrent}
              className={`stepper-dropdown-item${isCurrent ? " is-current" : ""}`}
              onClick={() => {
                onSubTabChange(tab.id);
                setDropdownOpen(false);
              }}
            >
              <span className="radio-dot" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
