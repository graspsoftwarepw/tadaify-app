/**
 * BlockPickerModal — gallery of block types with search, category tabs,
 * tier-gating, and AI Suggest tab.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-picker.html (751 LOC)
 * Full 1:1 rewrite matching mockup markup, CSS class names, and JS logic.
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
 *   - @radix-ui/react-dialog (TR-tadaify-008, DEC-375=B)
 *   - CSS classes from app/styles/app-dashboard.css scoped under
 *     .app-dashboard-root .block-picker-modal
 *   - Pure filterBlockTypes from app/lib/block-search.ts (no DOM required)
 *
 * Responsive grid (matches mockup):
 *   - Desktop ≥760px : 3 columns
 *   - Tablet 460–759px: 2 columns
 *   - Mobile <460px   : 1 column
 *
 * Tier gating:
 *   - Locked cards: is-locked class + opacity-0.85, NOT blurred
 *   - Per: feedback_no_blur_premium_features.md
 *   - Click locked card: does NOT fire onSelect; picker stays open
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
  type BlockTypeMeta,
  type TierLevel,
} from "~/lib/block-types";
import {
  CATEGORY_ALL,
  filterBlockTypes,
} from "~/lib/block-search";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

/** Delay (ms) before auto-focusing the search input on open. Matches mockup line 736. */
const SEARCH_AUTOFOCUS_DELAY_MS = 200;

/** Picker z-index: matches .modal-backdrop z-index: 50 in mockup. */
const PICKER_Z_INDEX = 50;

// ---------------------------------------------------------------------------
// Mockup category mapping
// ---------------------------------------------------------------------------

/**
 * Mockup display category labels (from mockup CATEGORIES array, line 601).
 * These drive the category tab nav — order is preserved 1:1.
 */
const MOCKUP_CATEGORIES = [
  "All",
  "Links",
  "Media",
  "Forms",
  "Shop",
  "Layout",
  "AI ✨",
] as const;

type MockupCategory = (typeof MOCKUP_CATEGORIES)[number];
const AI_TAB: MockupCategory = "AI ✨";

/**
 * Map mockup display category → registry BlockCategory keys used in BLOCK_TYPES.
 * Derived by cross-referencing mockup TYPES[].cat vs registry BlockCategory values.
 */
const CATEGORY_TO_REGISTRY: Record<
  Exclude<MockupCategory, "All" | "AI ✨">,
  string[]
> = {
  Links: ["social", "generic"],
  Media: ["music-video", "content"],
  Forms: ["communication"],
  Shop: ["shop"],
  Layout: ["content", "generic"],
};

/** Filter BLOCK_TYPES for a given mockup display category. */
function filterByMockupCategory(cat: MockupCategory): BlockTypeMeta[] {
  if (cat === "All") return BLOCK_TYPES;
  if (cat === AI_TAB) return [];
  const registryCats = CATEGORY_TO_REGISTRY[cat as Exclude<MockupCategory, "All" | "AI ✨">];
  return BLOCK_TYPES.filter((bt) => registryCats.includes(bt.category));
}

/** Count block types for a given mockup tab (shown in .ct badge). */
function mockupTabCount(cat: MockupCategory): number {
  if (cat === "All") return BLOCK_TYPES.length;
  if (cat === AI_TAB) return 0;
  return filterByMockupCategory(cat).length;
}

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
// BlockTypeCard — matches mockup .type-card markup (lines 216–271)
// ---------------------------------------------------------------------------

interface BlockTypeCardProps {
  blockType: BlockTypeMeta;
  locked: boolean;
  onPick: (id: string) => void;
}

function BlockTypeCard({ blockType, locked, onPick }: BlockTypeCardProps) {
  const handleClick = () => {
    if (locked) {
      // TODO: wire to picker selection callback
      return;
    }
    // TODO: wire to picker selection callback
    onPick(blockType.id);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleClick();
    }
  };

  /**
   * Derive mockup display category slug from registry category.
   * Used for .type-card.is-<cat> class (icon bg color) per mockup lines 241-244.
   */
  const displayCat = ((): string => {
    const map: Record<string, string> = {
      social: "links",
      generic: "links",
      "music-video": "media",
      content: "media",
      communication: "forms",
      shop: "shop",
    };
    return map[blockType.category] ?? "links";
  })();

  return (
    <a
      role="listitem"
      className={[
        "type-card",
        `is-${displayCat}`,
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
      {/* Icon chip — matches mockup .type-card .ic */}
      <div className="ic" aria-hidden="true">
        {blockType.icon}
      </div>

      {/* Name — matches mockup .ttl */}
      <div className="ttl">{blockType.name}</div>

      {/* Description — matches mockup .desc */}
      <div className="desc">{blockType.description}</div>

      {/* Badges row — matches mockup .badges / .bd */}
      {(blockType.popular || blockType.isNew || blockType.requiredTier) && (
        <div className="badges">
          {blockType.popular && (
            <span className="bd popular">Most clicked</span>
          )}
          {blockType.isNew && <span className="bd new">New</span>}
          {blockType.requiredTier && (
            <span className="bd tier" data-testid="locked-badge">
              {blockType.requiredTier.charAt(0).toUpperCase() +
                blockType.requiredTier.slice(1)}
              +
            </span>
          )}
        </div>
      )}

      {/* Add CTA — matches mockup .add-cta (opacity-0, shown on :hover) */}
      {!locked && <span className="add-cta">Add this block →</span>}
    </a>
  );
}

// ---------------------------------------------------------------------------
// AI Suggest empty state (matches mockup filterCards AI ✨ branch, lines 663-666)
// ---------------------------------------------------------------------------

function AiSuggestEmptyState() {
  return (
    <div
      className="grid-empty"
      style={{ gridColumn: "1 / -1" }}
      data-testid="ai-suggest-empty-state"
    >
      <div className="ic">✨</div>
      <b>AI Suggest is per field</b>
      <br />
      <span style={{ fontSize: "12px" }}>
        Pick any block from the other tabs, then tap the ✨ Suggest button next to
        a text field while editing to get copy suggestions.
      </span>
      <br />
      <br />
      <button
        className="btn btn-ghost btn-sm"
        type="button"
        style={{ marginTop: "6px" }}
        data-testid="ai-suggest-preview-btn"
        onClick={() => {
          // TODO: wire to picker selection callback
        }}
      >
        Preview the AI Suggest modal
      </button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// No-results empty state (matches mockup filterCards no-results, lines 668-671)
// ---------------------------------------------------------------------------

function NoResultsEmptyState() {
  return (
    <div className="grid-empty" data-testid="no-results-empty-state">
      <div className="ic">🔍</div>
      <b>No block types match.</b>
      <br />
      <span style={{ fontSize: "12px" }}>
        Try a different search or check the category tabs above.
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AI Suggest sub-modal (matches mockup #ai-backdrop / .ai-modal, lines 496-559)
// ---------------------------------------------------------------------------

interface AiSubModalProps {
  open: boolean;
  onClose: () => void;
}

function AiSubModal({ open, onClose }: AiSubModalProps) {
  const AI_SETS = [
    {
      name: "Music creator starter",
      title: "🎵 Music creator starter",
      chips: [
        "📺 Latest YT drop",
        "🔗 Spotify",
        "🌐 Social row",
        "✉️ Newsletter",
      ],
    },
    {
      name: "Fitness coach launch",
      title: "💪 Fitness coach launch",
      chips: [
        "📝 Heading",
        "🛍 Workout PDF",
        "🛍 1:1 coaching",
        "❓ FAQ",
        "✉️ Mailing list",
      ],
    },
    {
      name: "Agency / talent rep",
      title: "👥 Agency / talent rep",
      chips: [
        "🖼 Logo image",
        "📝 Roster",
        "🔗 Booking link",
        "✉️ Press inquiries",
      ],
    },
    {
      name: "Live event promo",
      title: "⏳ Live event promo",
      chips: [
        "⏳ Countdown",
        "🔗 Tickets",
        "🖼 Venue map",
        "📺 Stream embed",
      ],
    },
    {
      name: "Ecom + AOV booster",
      title: "🛍 Ecom shop AOV booster",
      chips: [
        "🛍 Featured product",
        "🛍 Bundle",
        "⏳ Sale countdown",
        "❓ Returns FAQ",
      ],
    },
  ];

  return (
    <div
      className={["ai-modal-backdrop", open ? "is-open" : ""].filter(Boolean).join(" ")}
      id="ai-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ai-h"
      style={{ zIndex: 80 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="ai-modal" role="document">
        <header className="ai-modal-head">
          <span style={{ fontSize: "22px" }} aria-hidden="true">
            ✨
          </span>
          <h3 id="ai-h">AI block suggestions</h3>
          <button
            className="iconbtn"
            type="button"
            onClick={onClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </header>

        <div className="ai-modal-body" id="ai-body">
          <p
            style={{
              fontSize: "12px",
              color: "var(--fg-muted)",
              marginBottom: "14px",
            }}
          >
            Tap a set to add all of its blocks at once. Each can be edited
            individually after.
            <span
              style={{
                display: "block",
                color: "var(--fg-subtle)",
                fontSize: "11px",
                marginTop: "4px",
              }}
            >
              Free 5 / Creator 20 / Pro 100 / Business unlimited per
              DEC-AI-QUOTA-LADDER-01.
            </span>
          </p>

          {AI_SETS.map((set) => (
            <button
              key={set.name}
              className="ai-set"
              type="button"
              onClick={() => {
                onClose();
                // TODO: wire to picker selection callback
              }}
            >
              <div className="ttl">{set.title}</div>
              <div className="blocks-row">
                {set.chips.map((chip) => (
                  <span key={chip} className="b-chip">
                    {chip}
                  </span>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// BlockPickerModal (root) — matches mockup modal structure (lines 451-491)
// ---------------------------------------------------------------------------

/**
 * Resolve the filtered card list for the current query + tab state.
 * Returns null to signal "AI Suggest tab active" (caller renders special state).
 */
function resolveCards(
  query: string,
  activeTab: MockupCategory,
): BlockTypeMeta[] | null {
  if (activeTab === AI_TAB) return null;

  const base = filterByMockupCategory(activeTab);

  // Apply text search — matches mockup filterCards logic (lines 652-659)
  const q = query.trim();
  if (!q) return base;
  return filterBlockTypes(base, q, CATEGORY_ALL);
}

export function BlockPickerModal({
  open,
  onOpenChange,
  onSelect,
  currentTier = "free",
}: BlockPickerModalProps) {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<MockupCategory>("All");
  const [aiOpen, setAiOpen] = useState(false);
  const searchRef = useRef<HTMLInputElement>(null);

  // Radix portals to document.body by default — OUTSIDE the `.app-dashboard-root`
  // wrapper that ALL of this modal's CSS is scoped under, so the fixed-position
  // overlay rules never matched and the picker rendered unstyled at the bottom
  // of the page (off-screen). Portal into the dashboard root so the scoped
  // styles apply. SSR-safe: resolved in an effect, client-only.
  const [portalContainer, setPortalContainer] = useState<HTMLElement | null>(null);
  useEffect(() => {
    if (typeof document === "undefined") return;
    setPortalContainer(document.querySelector<HTMLElement>(".app-dashboard-root"));
  }, [open]);

  // Auto-focus search input 200ms after open (matches mockup line 736)
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
      setActiveTab("All");
      setAiOpen(false);
    }
  }, [open]);

  const handlePick = (id: string) => {
    // TODO: wire to picker selection callback
    onSelect(id);
    onOpenChange(false);
  };

  const cards = resolveCards(query, activeTab);

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal container={portalContainer ?? undefined}>
        {/* Backdrop — matches mockup .modal-backdrop (fixed inset, flex center) */}
        <Dialog.Overlay
          className="modal-backdrop is-open block-picker-modal"
          style={{ zIndex: PICKER_Z_INDEX }}
        />

        {/*
          Modal panel — Dialog.Content wraps the entire .modal-backdrop flex layout
          so clicks outside .modal close the dialog via Radix's default onPointerDownOutside.
          The inner .modal div matches mockup .modal markup exactly.
        */}
        <Dialog.Content
          className="modal-backdrop-content block-picker-modal"
          style={{ zIndex: PICKER_Z_INDEX }}
          aria-describedby={undefined}
          data-testid="block-picker-modal-box"
        >
          {/* Inner .modal — matches mockup .modal class */}
          <div className="modal" role="document">
            {/* ── Modal head: title + search + close — matches mockup .modal-head */}
            <header className="modal-head">
              <Dialog.Title id="picker-h">Add a block</Dialog.Title>

              {/* Search input — matches mockup .search-wrap / input.search */}
              <div className="search-wrap">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search"
                  id="block-picker-search"
                  ref={searchRef}
                  type="text"
                  placeholder="Find a block type…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  autoComplete="off"
                  data-testid="block-picker-search"
                  aria-label={SEARCH_INPUT_LABEL}
                />
              </div>

              {/* Close button — matches mockup .iconbtn close */}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label={PICKER_CLOSE_BUTTON_LABEL}
                  title="Close (Esc)"
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
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Dialog.Close>
            </header>

            {/* ── Category tabs — matches mockup .modal-tabs / nav */}
            <nav
              className="modal-tabs"
              id="cat-tabs"
              aria-label="Block categories"
              role="tablist"
            >
              {MOCKUP_CATEGORIES.map((cat) => {
                const count = mockupTabCount(cat);
                const isActive = activeTab === cat;
                return (
                  <button
                    key={cat}
                    role="tab"
                    aria-selected={isActive}
                    type="button"
                    className={isActive ? "is-active" : ""}
                    onClick={() => setActiveTab(cat)}
                    data-testid={`tab-${cat}`}
                  >
                    {cat}
                    {cat !== AI_TAB && count > 0 && (
                      <span className="ct" aria-hidden="true">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* ── Modal body — matches mockup .modal-body */}
            <div className="modal-body">
              {/* Card grid — matches mockup .card-grid */}
              <div
                className="card-grid"
                id="card-grid"
                role="list"
                data-testid="block-picker-card-grid"
              >
                {/* AI Suggest special tab */}
                {activeTab === AI_TAB && <AiSuggestEmptyState />}

                {/* No-results state (non-AI tab, query matches nothing) */}
                {cards !== null && cards.length === 0 && <NoResultsEmptyState />}

                {/* Block type cards */}
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

            {/* ── Footer — matches mockup .modal-foot */}
            <footer className="modal-foot">
              <span className="reorder">
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
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Drag to reorder blocks after adding.
              </span>
              <button
                type="button"
                className="templates"
                onClick={() => {
                  // TODO: wire to picker selection callback
                }}
              >
                Browse our templates
                <svg
                  width="13"
                  height="13"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2.4}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </button>
            </footer>
          </div>
        </Dialog.Content>

        {/* AI Suggest sub-modal — rendered in same portal, z-index 80 */}
        <AiSubModal open={aiOpen} onClose={() => setAiOpen(false)} />
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
