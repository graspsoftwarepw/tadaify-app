/**
 * DesignBreadcrumbStepper — 3-cell window breadcrumb at top of Design panel.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html (Design panel breadcrumb)
 *
 * Contains:
 *   - 3-cell window: prev (faded) / current (highlighted) / next (faded)
 *   - Click current → dropdown opens with all 8 sub-tab options
 *   - Keyboard ←/→ navigate prev/next sub-tab
 *   - Mobile: collapses to chevrons `<` current `>`
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

/**
 * Returns true when the event target is an editable element (input, textarea,
 * select, or contentEditable). Used to prevent the global arrow-key listener
 * from hijacking caret movement inside form fields.
 *
 * Uses duck-typing on `tagName` / `isContentEditable` so it is testable in
 * node environments without a DOM shim.
 *
 * Exported for unit testing.
 */
export function isEditableTarget(t: EventTarget | null): boolean {
  if (t === null || typeof t !== "object") return false;
  // Duck-type: real HTMLElement always has `tagName` (string) and
  // `isContentEditable` (boolean).
  const el = t as Record<string, unknown>;
  const tag = typeof el["tagName"] === "string" ? el["tagName"] : "";
  if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") return true;
  if (el["isContentEditable"] === true) return true;
  return false;
}

interface DesignBreadcrumbStepperProps {
  activeSubTab: string;
  onSubTabChange: (subTab: SubTabId) => void;
}

export function DesignBreadcrumbStepper({
  activeSubTab,
  onSubTabChange,
}: DesignBreadcrumbStepperProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { prev, current, next } = deriveStepperWindow(activeSubTab);

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

  // Keyboard ←/→ navigation.
  // Guard: ignore the event when focus is on an editable target (input, textarea,
  // select, contentEditable) so arrow keys in form fields are not hijacked.
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (isEditableTarget(e.target)) return;
      if (e.metaKey || e.ctrlKey || e.altKey || e.shiftKey) return;
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
      data-testid="design-breadcrumb-stepper"
      aria-label="Design sub-tab navigation"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 0,
        padding: "10px 20px",
        borderBottom: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        fontSize: 13,
      }}
    >
      {/* Mobile chevron left */}
      <button
        type="button"
        className="stepper-chevron-left"
        onClick={() => prev && onSubTabChange(prev)}
        disabled={!prev}
        aria-label="Previous sub-tab"
        style={{
          background: "transparent",
          border: "none",
          cursor: prev ? "pointer" : "default",
          color: prev ? "var(--fg-muted)" : "var(--fg-subtle)",
          padding: "4px 8px",
          fontSize: 16,
          opacity: prev ? 1 : 0.3,
        }}
      >
        ‹
      </button>

      {/* 3-cell window */}
      <div
        style={{ display: "flex", alignItems: "center", gap: 2, flex: 1, justifyContent: "center" }}
      >
        {/* Prev cell */}
        {prev && (
          <>
            <button
              type="button"
              onClick={() => onSubTabChange(prev)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--fg-muted)",
                fontSize: 13,
                padding: "4px 10px",
                borderRadius: 6,
                opacity: 0.6,
              }}
              aria-label={`Go to ${SUB_TABS.find((t) => t.id === prev)?.label}`}
            >
              {SUB_TABS.find((t) => t.id === prev)?.label}
            </button>
            <span style={{ color: "var(--fg-subtle)", opacity: 0.4 }}>›</span>
          </>
        )}

        {/* Current cell with dropdown */}
        <div ref={dropdownRef} style={{ position: "relative" }}>
          <button
            type="button"
            data-testid="stepper-current"
            onClick={() => setDropdownOpen((v) => !v)}
            aria-haspopup="listbox"
            aria-expanded={dropdownOpen}
            style={{
              background: "var(--bg-muted)",
              border: "1px solid var(--border)",
              cursor: "pointer",
              color: "var(--fg)",
              fontSize: 13,
              fontWeight: 600,
              padding: "5px 12px",
              borderRadius: 6,
              display: "flex",
              alignItems: "center",
              gap: 5,
            }}
          >
            {currentLabel}
            <svg
              width="10"
              height="10"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              style={{ transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform .15s" }}
            >
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>

          {/* Dropdown */}
          {dropdownOpen && (
            <div
              role="listbox"
              aria-label="Sub-tab picker"
              style={{
                position: "absolute",
                top: "calc(100% + 6px)",
                left: "50%",
                transform: "translateX(-50%)",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                minWidth: 160,
                zIndex: 100,
                overflow: "hidden",
              }}
            >
              {SUB_TABS.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  role="option"
                  aria-selected={tab.id === current}
                  onClick={() => {
                    onSubTabChange(tab.id);
                    setDropdownOpen(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: "9px 14px",
                    border: "none",
                    background: tab.id === current ? "var(--bg-muted)" : "transparent",
                    color: tab.id === current ? "var(--brand-primary)" : "var(--fg)",
                    fontSize: 13,
                    fontWeight: tab.id === current ? 600 : 400,
                    cursor: "pointer",
                    textAlign: "left",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Next cell */}
        {next && (
          <>
            <span style={{ color: "var(--fg-subtle)", opacity: 0.4 }}>›</span>
            <button
              type="button"
              onClick={() => onSubTabChange(next)}
              style={{
                background: "transparent",
                border: "none",
                cursor: "pointer",
                color: "var(--fg-muted)",
                fontSize: 13,
                padding: "4px 10px",
                borderRadius: 6,
                opacity: 0.6,
              }}
              aria-label={`Go to ${SUB_TABS.find((t) => t.id === next)?.label}`}
            >
              {SUB_TABS.find((t) => t.id === next)?.label}
            </button>
          </>
        )}
      </div>

      {/* Mobile chevron right */}
      <button
        type="button"
        className="stepper-chevron-right"
        onClick={() => next && onSubTabChange(next)}
        disabled={!next}
        aria-label="Next sub-tab"
        style={{
          background: "transparent",
          border: "none",
          cursor: next ? "pointer" : "default",
          color: next ? "var(--fg-muted)" : "var(--fg-subtle)",
          padding: "4px 8px",
          fontSize: 16,
          opacity: next ? 1 : 0.3,
        }}
      >
        ›
      </button>
    </nav>
  );
}
