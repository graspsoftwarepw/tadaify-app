/**
 * BlockPickerModal — gallery of block types with search, category tabs,
 * tier-gating, and AI Suggest tab.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-picker.html
 * Lines 451–485 (modal shell), 624–680 (JS filter/render logic).
 *
 * Usage:
 * ```tsx
 * <BlockPickerModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   onSelect={(blockType) => handleBlockSelected(blockType)}
 *   currentTier="creator"
 * />
 * ```
 *
 * Tech:
 *   - @radix-ui/react-dialog (TR-tadaify-008, DEC-375=B) — same as BlockEditorModal
 *   - Tailwind v4 + design tokens from app.css
 *   - Pure filterBlockTypes from app/lib/block-search.ts (no DOM required)
 *
 * Responsive grid:
 *   - Desktop ≥1024px : 3 columns
 *   - Tablet 600–1023px: 2 columns
 *   - Mobile <600px   : 1 column
 *   Per: feedback_tadaify_three_viewport_support.md, TR-tadaify-008
 *   NOTE: DO NOT use max-[860px] — banned per TR-tadaify-008 Codex P1 finding.
 *
 * Tier gating:
 *   - Locked cards render with 🔒 badge + muted styling (fully visible, NOT blurred)
 *   - Per: feedback_no_blur_premium_features.md
 *   - Click on locked card: does NOT fire onSelect; picker stays open
 *   - Interactive tier-gate hint deferred to tadaify-app#209
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: BR-BLOCK-PICKER-001..005, AC 1–12
 * Unit tests: app/components/blocks/BlockPickerModal.test.tsx (U1)
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useRef, useState } from "react";

import {
  BLOCK_TYPES,
  isBlockTypeLocked,
  TIER_LEVELS,
  type BlockTypeMeta,
  type TierLevel,
} from "~/lib/block-types";
import {
  CATEGORY_ALL,
  filterBlockTypes,
  getPopularBlockTypes,
  type CategoryFilterValue,
} from "~/lib/block-search";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Delay (ms) before auto-focusing the search input on open. Matches mockup. */
const SEARCH_AUTOFOCUS_DELAY_MS = 200;

/** Picker modal max-width (narrower than BlockEditorModal at 960px). */
const PICKER_MAX_WIDTH = "720px";

/** Picker z-index: same "base" level as BlockEditorModal. */
const PICKER_Z_INDEX = 50;

// ---------------------------------------------------------------------------
// Tab definitions
// ---------------------------------------------------------------------------

/** Tab config for the category nav (mirrors CATEGORIES in mockup JS). */
const CATEGORY_TABS = [
  { value: CATEGORY_ALL, label: "All" },
  { value: "popular", label: "Popular" },
  { value: "social", label: "Social" },
  { value: "music-video", label: "Music & Video" },
  { value: "shop", label: "Shop" },
  { value: "communication", label: "Communication" },
  { value: "content", label: "Content" },
  { value: "ai-suggest", label: "AI Suggest" },
] as const;

/** Sentinel for the AI Suggest special tab (not a real BlockCategory). */
const AI_SUGGEST_TAB = "ai-suggest" as const;
type TabValue = CategoryFilterValue | typeof AI_SUGGEST_TAB;

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BlockPickerModalProps {
  /** Whether the modal is open. */
  open: boolean;
  /** Callback when open state changes (false = close requested). */
  onOpenChange: (open: boolean) => void;
  /**
   * Fired when user clicks a non-locked block type card.
   * Picker closes automatically after this callback.
   */
  onSelect: (blockType: string) => void;
  /**
   * Creator's current subscription tier.
   * Determines which cards render as locked.
   * Defaults to "free" (most restrictive) if omitted.
   */
  currentTier?: TierLevel;
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

/** Count badge shown on tabs (hidden when 0 or on AI Suggest tab). */
function TabCount({ count }: { count: number }) {
  if (count === 0) return null;
  return (
    <span
      className="ml-[5px] px-[5px] py-px rounded-full bg-[var(--bg-muted)] text-[10px] font-semibold text-[var(--fg-muted)] tabular-nums leading-[1.6]"
      aria-hidden="true"
    >
      {count}
    </span>
  );
}

/** Locked-tier badge rendered on gated cards ("Pro+" label with lock icon). */
function LockedBadge({ label }: { label: string }) {
  return (
    <span
      className="inline-flex items-center gap-[3px] px-[6px] py-[2px] rounded-full text-[10px] font-semibold bg-amber-100 text-amber-700 border border-amber-200"
      data-testid="locked-badge"
    >
      🔒 {label}
    </span>
  );
}

/** "Most clicked" popular badge. */
function PopularBadge() {
  return (
    <span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[10px] font-semibold bg-indigo-100 text-indigo-700 border border-indigo-200">
      Most clicked
    </span>
  );
}

/** "New" badge. */
function NewBadge() {
  return (
    <span className="inline-flex items-center px-[6px] py-[2px] rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-700 border border-emerald-200">
      New
    </span>
  );
}

// ---------------------------------------------------------------------------
// BlockTypeCard
// ---------------------------------------------------------------------------

interface BlockTypeCardProps {
  blockType: BlockTypeMeta;
  locked: boolean;
  onPick: (id: string) => void;
}

function BlockTypeCard({ blockType, locked, onPick }: BlockTypeCardProps) {
  const handleClick = () => {
    if (!locked) {
      onPick(blockType.id);
    }
    // Locked: no-op; picker stays open per BR-BLOCK-PICKER-005
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleClick();
    }
  };

  return (
    <a
      role="listitem"
      className={[
        "type-card",
        "flex flex-col gap-[6px] p-[14px] rounded-[12px]",
        "border border-[var(--border)] bg-[var(--bg-elevated)]",
        "cursor-pointer outline-none",
        "transition-colors duration-100",
        locked
          ? "opacity-60 cursor-default"
          : "hover:border-[var(--brand-primary)] hover:bg-indigo-50/40 focus-visible:ring-2 focus-visible:ring-[var(--brand-primary)]",
        `is-${blockType.category}`,
        locked ? "is-locked" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      href="javascript:void(0)"
      aria-label={`${blockType.name}${locked ? " — requires upgrade" : ""}`}
      data-block-type={blockType.id}
      data-locked={locked ? "true" : undefined}
      tabIndex={0}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Icon */}
      <div
        className="w-[38px] h-[38px] rounded-[10px] bg-indigo-100/50 flex items-center justify-center text-[18px] flex-shrink-0 font-mono leading-none"
        aria-hidden="true"
      >
        {blockType.icon}
      </div>

      {/* Name */}
      <div className="font-semibold text-[13.5px] text-[var(--fg)] leading-tight">
        {blockType.name}
      </div>

      {/* Description */}
      <div className="text-[12px] text-[var(--fg-muted)] leading-[1.45] line-clamp-2">
        {blockType.description}
      </div>

      {/* Badges row */}
      {(blockType.popular || blockType.isNew || locked) && (
        <div className="flex flex-wrap gap-[4px] mt-[2px]">
          {blockType.popular && !locked && <PopularBadge />}
          {blockType.isNew && !locked && <NewBadge />}
          {locked && (
            <LockedBadge
              label={blockType.requiredTier
                ? `${blockType.requiredTier.charAt(0).toUpperCase()}${blockType.requiredTier.slice(1)}+`
                : "Pro+"}
            />
          )}
        </div>
      )}

      {/* Add CTA (non-locked only) */}
      {!locked && (
        <span className="mt-auto text-[11.5px] text-[var(--brand-primary)] font-semibold opacity-0 group-hover:opacity-100">
          Add this block →
        </span>
      )}
    </a>
  );
}

// ---------------------------------------------------------------------------
// AI Suggest empty state
// ---------------------------------------------------------------------------

function AiSuggestEmptyState() {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center"
      data-testid="ai-suggest-empty-state"
    >
      <div className="text-4xl leading-none" aria-hidden="true">
        ✨
      </div>
      <b className="text-[15px] font-semibold text-[var(--fg)]">AI Suggest is per field</b>
      <p className="text-[12.5px] text-[var(--fg-muted)] max-w-[320px] leading-[1.5]">
        Pick any block from the other tabs, then tap the ✨ Suggest button next to a text field
        while editing to get copy suggestions.
      </p>
      <button
        type="button"
        className="mt-1 px-[14px] py-[8px] rounded-[9px] border border-[var(--border-strong)] bg-transparent text-[12.5px] font-semibold text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] transition-colors"
        data-testid="ai-suggest-preview-btn"
        onClick={() => {
          /* Stub — wired later via tadaify-app#12 */
        }}
      >
        Preview the AI Suggest modal
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// No-results empty state
// ---------------------------------------------------------------------------

function NoResultsEmptyState() {
  return (
    <div
      className="col-span-full flex flex-col items-center justify-center gap-3 py-12 text-center"
      data-testid="no-results-empty-state"
    >
      <div className="text-4xl leading-none" aria-hidden="true">
        🔍
      </div>
      <b className="text-[15px] font-semibold text-[var(--fg)]">No block types match.</b>
      <p className="text-[12.5px] text-[var(--fg-muted)]">
        Try a different search or check the category tabs above.
      </p>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BlockPickerModal (root)
// ---------------------------------------------------------------------------

/**
 * Resolve the filtered card list for the current query + tab state.
 * Returns null to signal "AI Suggest tab active" (caller renders special state).
 */
function resolveCards(
  query: string,
  activeTab: TabValue,
): BlockTypeMeta[] | null {
  if (activeTab === AI_SUGGEST_TAB) return null;

  if (activeTab === "popular") {
    const popular = getPopularBlockTypes(BLOCK_TYPES);
    if (!query.trim()) return popular;
    // Apply text filter on popular subset
    return filterBlockTypes(popular, query, CATEGORY_ALL);
  }

  return filterBlockTypes(BLOCK_TYPES, query, activeTab as CategoryFilterValue);
}

/** Count how many block types belong to a given tab (for the badge). */
function tabCount(tabValue: TabValue): number {
  if (tabValue === CATEGORY_ALL) return BLOCK_TYPES.length;
  if (tabValue === AI_SUGGEST_TAB) return 0;
  if (tabValue === "popular") return BLOCK_TYPES.filter((bt) => bt.popular).length;
  return BLOCK_TYPES.filter((bt) => bt.category === tabValue).length;
}

export function BlockPickerModal({
  open,
  onOpenChange,
  onSelect,
  currentTier = "free",
}: BlockPickerModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<TabValue>(CATEGORY_ALL);
  const searchRef = useRef<HTMLInputElement>(null);

  // Auto-focus search input 200ms after open (matches mockup pattern line 736)
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      searchRef.current?.focus();
    }, SEARCH_AUTOFOCUS_DELAY_MS);
    return () => clearTimeout(timer);
  }, [open]);

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setQuery("");
      setActiveTab(CATEGORY_ALL);
    }
  }, [open]);

  const handlePick = (id: string) => {
    onSelect(id);
    onOpenChange(false);
  };

  const cards = resolveCards(query, activeTab);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay
          className="
            fixed inset-0
            bg-[rgba(11,15,30,0.55)] backdrop-blur-[3px]
            data-[state=open]:animate-fadeIn
            data-[state=closed]:animate-fadeOut
          "
          style={{ zIndex: PICKER_Z_INDEX }}
        />

        {/* Modal panel — Dialog.Content IS the modal box (not a full-screen wrapper).
            Same Radix pattern as BlockEditorModal (Finding 1 from PR tadaify-app#211). */}
        <Dialog.Content
          className="
            fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
            bg-[var(--bg-elevated)]
            border border-[var(--border)]
            rounded-[18px]
            shadow-[var(--shadow-xl)]
            flex flex-col
            overflow-hidden
            data-[state=open]:animate-modalIn
            data-[state=closed]:animate-modalOut
            max-[599px]:rounded-none max-[599px]:max-h-screen max-[599px]:h-screen max-[599px]:w-screen
            max-[599px]:left-0 max-[599px]:top-0 max-[599px]:translate-x-0 max-[599px]:translate-y-0
          "
          style={{
            zIndex: PICKER_Z_INDEX,
            width: `min(${PICKER_MAX_WIDTH}, calc(100vw - 32px))`,
            maxHeight: "calc(100vh - 32px)",
          }}
          aria-describedby={undefined}
          data-testid="block-picker-modal-box"
        >
          {/* ── Modal head: title + search + close ── */}
          <header className="flex items-center gap-3 px-[18px] py-[14px] border-b border-[var(--border)] flex-shrink-0 flex-wrap gap-y-2">
            <Dialog.Title className="font-display text-[19px] font-semibold text-[var(--fg)] tracking-[-0.01em] flex-1 min-w-[120px]">
              Add a block
            </Dialog.Title>

            {/* Search input */}
            <div className="flex items-center gap-2 flex-1 min-w-[180px] relative">
              <label htmlFor="block-picker-search" className="sr-only">
                Find a block type
              </label>
              <svg
                className="absolute left-[10px] text-[var(--fg-muted)] pointer-events-none flex-shrink-0"
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                id="block-picker-search"
                ref={searchRef}
                type="text"
                className="
                  w-full pl-[32px] pr-[10px] py-[7px]
                  rounded-[9px] border border-[var(--border)]
                  bg-[var(--bg)] text-[13px] text-[var(--fg)]
                  placeholder:text-[var(--fg-subtle)]
                  focus:outline-none focus:border-[var(--brand-primary)] focus:ring-1 focus:ring-[var(--brand-primary)]
                  transition-colors
                "
                placeholder="Find a block type…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                autoComplete="off"
                data-testid="block-picker-search"
              />
            </div>

            {/* Close button */}
            <Dialog.Close asChild>
              <button
                type="button"
                className="w-[34px] h-[34px] flex items-center justify-center rounded-[8px] text-[var(--fg-subtle)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)] transition-colors flex-shrink-0"
                aria-label="Close picker"
                title="Close (Esc)"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </Dialog.Close>
          </header>

          {/* ── Category tabs ── */}
          <nav
            className="flex items-center gap-[2px] px-[14px] pt-[10px] pb-[2px] border-b border-[var(--border)] overflow-x-auto scrollbar-none flex-shrink-0"
            aria-label="Block categories"
            role="tablist"
          >
            {CATEGORY_TABS.map((tab) => {
              const count = tabCount(tab.value);
              const isActive = activeTab === tab.value;
              return (
                <button
                  key={tab.value}
                  role="tab"
                  aria-selected={isActive}
                  type="button"
                  className={[
                    "flex items-center gap-[3px] whitespace-nowrap",
                    "px-[10px] py-[7px] rounded-[8px]",
                    "text-[12.5px] font-semibold border-0 cursor-pointer",
                    "transition-colors duration-100",
                    isActive
                      ? "bg-[var(--brand-primary)] text-white"
                      : "bg-transparent text-[var(--fg-muted)] hover:bg-[var(--bg-muted)] hover:text-[var(--fg)]",
                  ].join(" ")}
                  onClick={() => setActiveTab(tab.value)}
                  data-testid={`tab-${tab.value}`}
                >
                  {tab.label}
                  {tab.value !== AI_SUGGEST_TAB && <TabCount count={count} />}
                </button>
              );
            })}
          </nav>

          {/* ── Card grid ── */}
          <div className="flex-1 overflow-y-auto px-[14px] py-[16px]">
            <div
              className="
                grid gap-[10px]
                grid-cols-1
                min-[600px]:grid-cols-2
                min-[1024px]:grid-cols-3
              "
              role="list"
              id="block-picker-card-grid"
              data-testid="block-picker-card-grid"
            >
              {/* AI Suggest special tab */}
              {activeTab === AI_SUGGEST_TAB && <AiSuggestEmptyState />}

              {/* No-results state (non-AI tab with query + no matches) */}
              {cards !== null && cards.length === 0 && <NoResultsEmptyState />}

              {/* Cards */}
              {cards !== null &&
                cards.map((bt) => (
                  <BlockTypeCard
                    key={bt.id}
                    blockType={bt}
                    locked={isBlockTypeLocked(bt, currentTier)}
                    onPick={handlePick}
                  />
                ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <footer className="flex items-center justify-between gap-3 px-[18px] py-[10px] border-t border-[var(--border)] flex-shrink-0">
            <span className="flex items-center gap-[6px] text-[11.5px] text-[var(--fg-muted)]">
              <svg
                width="13"
                height="13"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Drag to reorder blocks after adding.
            </span>
            <button
              type="button"
              className="text-[11.5px] text-[var(--brand-primary)] font-semibold bg-transparent border-0 cursor-pointer hover:underline flex items-center gap-[3px]"
              onClick={() => {
                /* Stub — templates gallery */
              }}
            >
              Browse our templates
              <svg
                width="11"
                height="11"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.4"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="9 6 15 12 9 18" />
              </svg>
            </button>
          </footer>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Named exports
// ---------------------------------------------------------------------------

export default BlockPickerModal;

/** ARIA label for the search input (testable constant). */
export const SEARCH_INPUT_LABEL = "Find a block type" as const;

/** ARIA label for the close button. */
export const PICKER_CLOSE_BUTTON_LABEL = "Close picker" as const;
