/**
 * IconPicker — Searchable icon picker dropdown with category tabs.
 *
 * Controlled component:
 *   <IconPicker value={iconId | null} onChange={(id) => ...} />
 *
 * Uses Radix Popover (same vendor family as Radix Dialog per TR-tadaify-008,
 * DEC-375=B). Popover stacks above modal dialogs (z-index 60).
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html — icon picker
 * section (rendered when icon field is clicked in Link block editor context).
 *
 * Responsive grid (3-viewport per TR-tadaify-008):
 *   - Desktop ≥1024px : 6 columns
 *   - Tablet 600–1023px: 5 columns (max-[1023px]:grid-cols-5)
 *   - Mobile <600px    : 4 columns (max-[599px]:grid-cols-4)
 *   NOTE: DO NOT use max-[860px] — banned per TR-tadaify-008.
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: BR-ICON-PICKER-001..006, AC items 5–10, ECN-ICON-PICKER-01..10
 * Unit tests: app/components/blocks/IconPicker.test.tsx (U3)
 */

import * as Popover from "@radix-ui/react-popover";
import { useMemo, useRef, useState } from "react";

import {
  ICON_CATALOG,
  ICON_CATEGORIES,
  type IconCategory,
  type IconEntry,
} from "~/lib/icons-catalog";
import {
  filterIcons,
  ICON_CATEGORY_ALL,
  type IconCategoryFilterValue,
} from "~/lib/icon-search";
import { renderIcon } from "~/lib/icon-resolve";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Search debounce delay in ms (AC item 7: filters within 50ms). */
const SEARCH_DEBOUNCE_MS = 50;

/** Popover panel dimensions. */
const PANEL_WIDTH = "360px";
const PANEL_MAX_HEIGHT = "400px";

/** Exported for unit tests. */
export const SEARCH_INPUT_LABEL = "Search icons…";
export const TRIGGER_PLACEHOLDER = "Pick icon";
export const EMPTY_SEARCH_HINT = "No icons match";
export const EMPTY_SEARCH_SUB = "Try a different search or request more icons via feedback.";

// ---------------------------------------------------------------------------
// Tab config
// ---------------------------------------------------------------------------

const CATEGORY_TABS: { value: IconCategoryFilterValue; label: string }[] = [
  { value: ICON_CATEGORY_ALL, label: "All" },
  { value: "popular", label: "Popular" },
  { value: "social", label: "Social" },
  { value: "music-video", label: "Music & Video" },
  { value: "shop", label: "Shop" },
  { value: "communication", label: "Communication" },
  { value: "content", label: "Content" },
  { value: "generic", label: "Generic" },
] as const;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface IconPickerProps {
  /**
   * Currently selected icon identifier, or null for no selection.
   * Format: "lucide:<name>" | "simple-icons:<slug>"
   */
  value: string | null;
  /**
   * Fired when the user clicks an icon tile.
   * Passes the selected icon identifier string.
   */
  onChange: (id: string) => void;
  /**
   * Optional: allow clearing the selection.
   * When true, a "×" button appears on the trigger and onChange(null) is fired.
   * Default: false
   */
  clearable?: boolean;
  /**
   * Disable the picker entirely (shows trigger as non-interactive).
   * Default: false
   */
  disabled?: boolean;
}

// ---------------------------------------------------------------------------
// IconTile sub-component
// ---------------------------------------------------------------------------

interface IconTileProps {
  entry: IconEntry;
  isSelected: boolean;
  onSelect: (id: string) => void;
  tileRef?: React.RefObject<HTMLButtonElement | null>;
}

function IconTile({ entry, isSelected, onSelect, tileRef }: IconTileProps) {
  return (
    <button
      ref={tileRef}
      type="button"
      role="option"
      aria-selected={isSelected}
      aria-label={entry.name}
      data-testid={`icon-tile-${entry.id}`}
      data-icon-id={entry.id}
      data-icon-source={entry.source}
      className={[
        "icon-tile",
        "flex flex-col items-center justify-center gap-[4px]",
        "w-full aspect-square rounded-[8px] p-[6px]",
        "border transition-colors duration-100 cursor-pointer outline-none",
        "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)] focus-visible:ring-offset-1",
        "text-[9px] leading-tight text-center",
        isSelected
          ? "border-[var(--brand-primary)] bg-[color-mix(in_srgb,var(--brand-primary)_10%,transparent)] text-[var(--brand-primary)]"
          : "border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--fg-muted)] hover:border-[var(--brand-primary)] hover:bg-indigo-50/40",
      ]
        .filter(Boolean)
        .join(" ")}
      onClick={() => onSelect(entry.id)}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect(entry.id);
        }
      }}
    >
      <span className="flex items-center justify-center w-[20px] h-[20px] flex-shrink-0">
        {renderIcon(entry.id, { size: 18 })}
      </span>
      <span className="w-full truncate">{entry.name}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// IconPicker component
// ---------------------------------------------------------------------------

export function IconPicker({ value, onChange, clearable = false, disabled = false }: IconPickerProps) {
  const [open, setOpen] = useState(false);
  const [rawQuery, setRawQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<IconCategoryFilterValue>(ICON_CATEGORY_ALL);
  const [focusedIndex, setFocusedIndex] = useState(0);

  const searchRef = useRef<HTMLInputElement>(null);
  const firstTileRef = useRef<HTMLButtonElement>(null);

  // Debounced query (50ms per AC item 7, ECN-ICON-PICKER-02)
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleQueryChange = (q: string) => {
    setRawQuery(q);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(q);
      setFocusedIndex(0);
    }, SEARCH_DEBOUNCE_MS);
  };

  // Filtered catalog (memoized — trivial at ~100 entries per TR perf note)
  const filtered = useMemo(
    () => filterIcons(ICON_CATALOG, debouncedQuery, selectedCategory),
    [debouncedQuery, selectedCategory],
  );

  // Auto-focus search when popover opens
  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (nextOpen) {
      setRawQuery("");
      setDebouncedQuery("");
      setFocusedIndex(0);
      // Radix Popover triggers focus to content on mount; redirect to search
      requestAnimationFrame(() => {
        searchRef.current?.focus();
      });
    }
  };

  const handleSelect = (id: string) => {
    onChange(id);
    setOpen(false);
  };

  // Keyboard nav in grid (arrow keys, Enter)
  const handleGridKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (filtered.length === 0) return;

    // Determine number of columns based on viewport approximation.
    // We use a best-effort approach: read from grid style.
    // Default: 6 cols for desktop
    const grid = e.currentTarget;
    const cols = Math.max(1, Math.round(grid.clientWidth / (grid.clientWidth / 6)));

    if (e.key === "ArrowRight") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      setFocusedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusedIndex((i) => Math.min(i + cols, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusedIndex((i) => {
        const next = i - cols;
        if (next < 0) {
          // Move focus back to search
          searchRef.current?.focus();
          return 0;
        }
        return next;
      });
    } else if (e.key === "Enter" && focusedIndex >= 0 && focusedIndex < filtered.length) {
      e.preventDefault();
      handleSelect(filtered[focusedIndex].id);
    }
  };

  // Find the currently selected entry for trigger display
  const selectedEntry = value
    ? ICON_CATALOG.find((e) => e.id === value) ?? null
    : null;

  return (
    <Popover.Root open={open} onOpenChange={handleOpenChange}>
      {/* ---- Trigger ---- */}
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label="Open icon picker"
          data-testid="icon-picker-trigger"
          disabled={disabled}
          className={[
            "icon-picker-trigger",
            "inline-flex items-center gap-[8px]",
            "px-[12px] py-[8px] rounded-[8px]",
            "border border-[var(--border)] bg-[var(--bg-elevated)]",
            "text-sm font-medium transition-colors duration-100",
            "outline-none focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]",
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-[var(--brand-primary)]",
            open ? "border-[var(--brand-primary)]" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {/* Selected icon preview or placeholder */}
          {selectedEntry ? (
            <>
              <span className="flex items-center justify-center w-[18px] h-[18px]" data-testid="icon-picker-selected-preview">
                {renderIcon(selectedEntry.id, { size: 18 })}
              </span>
              <span className="text-[var(--fg)] truncate max-w-[140px]" data-testid="icon-picker-selected-name">
                {selectedEntry.name}
              </span>
            </>
          ) : (
            <span className="text-[var(--fg-muted)]" data-testid="icon-picker-placeholder">
              {TRIGGER_PLACEHOLDER}
            </span>
          )}

          {/* Caret */}
          <svg
            className={[
              "ml-auto w-[14px] h-[14px] text-[var(--fg-muted)] flex-shrink-0 transition-transform duration-150",
              open ? "rotate-180" : "",
            ].join(" ")}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            aria-hidden="true"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>

          {/* Clear button (when clearable + value set) */}
          {clearable && value && (
            <button
              type="button"
              aria-label="Clear icon"
              data-testid="icon-picker-clear"
              className="ml-[2px] w-[16px] h-[16px] rounded-full flex items-center justify-center text-[var(--fg-muted)] hover:text-[var(--fg)] transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null as unknown as string); // Clear: pass null to parent
              }}
            >
              ×
            </button>
          )}
        </button>
      </Popover.Trigger>

      {/* ---- Popover panel ---- */}
      <Popover.Portal>
        <Popover.Content
          sideOffset={6}
          align="start"
          avoidCollisions
          data-testid="icon-picker-panel"
          className="icon-picker-panel z-[60] rounded-[12px] border border-[var(--border)] bg-[var(--bg-elevated)] shadow-xl outline-none"
          style={{ width: PANEL_WIDTH }}
          onOpenAutoFocus={(e) => {
            // Prevent Radix from auto-focusing the first button; we focus search instead
            e.preventDefault();
          }}
        >
          {/* ---- Search input ---- */}
          <div className="p-[10px] border-b border-[var(--border)]">
            <label className="sr-only" htmlFor="icon-picker-search">
              {SEARCH_INPUT_LABEL}
            </label>
            <div className="relative">
              <span className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--fg-muted)] pointer-events-none">
                {/* Search icon */}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" />
                </svg>
              </span>
              <input
                ref={searchRef}
                id="icon-picker-search"
                type="text"
                autoComplete="off"
                placeholder={SEARCH_INPUT_LABEL}
                value={rawQuery}
                onChange={(e) => handleQueryChange(e.target.value)}
                data-testid="icon-picker-search"
                className="w-full pl-[32px] pr-[10px] py-[7px] rounded-[6px] border border-[var(--border)] bg-[var(--bg)] text-sm text-[var(--fg)] placeholder:text-[var(--fg-muted)] outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]"
                onKeyDown={(e) => {
                  if (e.key === "ArrowDown") {
                    e.preventDefault();
                    // Move focus into the grid
                    firstTileRef.current?.focus();
                    setFocusedIndex(0);
                  }
                }}
              />
            </div>
          </div>

          {/* ---- Category tabs ---- */}
          <div
            role="tablist"
            aria-label="Icon categories"
            className="flex gap-[2px] p-[8px] pb-0 overflow-x-auto scrollbar-hide"
            data-testid="icon-picker-tabs"
          >
            {CATEGORY_TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                role="tab"
                aria-selected={selectedCategory === tab.value}
                data-testid={`icon-picker-tab-${tab.value}`}
                onClick={() => {
                  setSelectedCategory(tab.value);
                  setFocusedIndex(0);
                }}
                className={[
                  "px-[8px] py-[5px] rounded-[6px] text-[11px] font-medium whitespace-nowrap transition-colors duration-100 outline-none",
                  "focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]",
                  selectedCategory === tab.value
                    ? "bg-[var(--brand-primary)] text-white"
                    : "text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
                ].join(" ")}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* ---- Icon grid ---- */}
          <div
            role="listbox"
            aria-label="Icons"
            data-testid="icon-picker-grid"
            style={{ maxHeight: PANEL_MAX_HEIGHT, overflowY: "auto" }}
            className="p-[8px] @container"
            onKeyDown={handleGridKeyDown}
          >
            {filtered.length === 0 ? (
              // Empty state (ECN-ICON-PICKER-03)
              <div
                className="flex flex-col items-center justify-center py-[40px] gap-[6px] text-center"
                data-testid="icon-picker-empty"
              >
                <span className="text-[var(--fg-muted)] text-sm font-medium">{EMPTY_SEARCH_HINT}</span>
                <span className="text-[var(--fg-muted)] text-[11px] max-w-[240px]">{EMPTY_SEARCH_SUB}</span>
              </div>
            ) : (
              <div
                className={[
                  "grid gap-[4px]",
                  // 6 cols desktop ≥1024, 5 cols tablet 600-1023, 4 cols mobile <600
                  "grid-cols-6 max-[1023px]:grid-cols-5 max-[599px]:grid-cols-4",
                ].join(" ")}
              >
                {filtered.map((entry, idx) => (
                  <IconTile
                    key={entry.id}
                    entry={entry}
                    isSelected={entry.id === value}
                    onSelect={handleSelect}
                    tileRef={idx === focusedIndex ? firstTileRef : undefined}
                  />
                ))}
              </div>
            )}
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
