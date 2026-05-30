/**
 * AiSuggestModal — floating sub-modal shown when a creator clicks ✨ Suggest
 * on any title / label / caption / short-text field in the block editor.
 *
 * Visual contract: mockups/tadaify-mvp/app-ai-suggest-modal.html (1824 LOC)
 * Full 1:1 implementation matching mockup markup, CSS class names, all 6 states
 * (loaded, loading, error, empty, out-of-quota Free, out-of-quota Creator),
 * and the cost-transparency strip.
 *
 * Design rules (from mockup header comment):
 *   - Centered modal — NEVER a right-side drawer (no-right-side-drawers)
 *   - DEC-114: simple UI, no Advanced toggle
 *   - DEC-176/177: cost strip visible for Free+Creator, hidden for Pro+Business
 *   - DEC-174-179: daily quotas — Free 5/day, Creator 50/day, Pro+Business unlimited
 *
 * Usage:
 * ```tsx
 * <AiSuggestModal
 *   open={open}
 *   onOpenChange={setOpen}
 *   currentTier="free"
 *   surface="Block title"
 *   inputText="My latest release"
 *   creditsUsed={2}
 *   onAccept={(text) => setFieldValue(text)}
 * />
 * ```
 *
 * Tech:
 *   - @radix-ui/react-dialog for focus-trap, Esc, portal
 *   - CSS classes appended to app/styles/app-dashboard.css scoped under
 *     .app-dashboard-root .ai-suggest-modal
 *   - @keyframes prefixed with `ai-suggest-` to avoid collisions
 *
 * Story: DEC-030 (AI credit quota ladder)
 */

import * as Dialog from "@radix-ui/react-dialog";
import { useEffect, useState, useRef } from "react";

// ---------------------------------------------------------------------------
// Tier constants — mirror mockup QUOTAS (lines 1467-1472)
// ---------------------------------------------------------------------------

export type TierLevel = "free" | "creator" | "pro" | "business";

interface QuotaSpec {
  limit: number;
  label: string;
  unlimited: boolean;
}

const QUOTAS: Record<TierLevel, QuotaSpec> = {
  free:     { limit: 5,    label: "5/day",     unlimited: false },
  creator:  { limit: 50,   label: "50/day",    unlimited: false },
  pro:      { limit: 500,  label: "Unlimited", unlimited: true  },
  business: { limit: 2000, label: "Unlimited", unlimited: true  },
};

const TIER_LABELS: Record<TierLevel, string> = {
  free:     "Free",
  creator:  "Creator",
  pro:      "Pro",
  business: "Business",
};

/** Monthly prices per mockup TIER_PRICES (line 1474) */
const TIER_PRICES: Record<TierLevel, number> = {
  free:     0,
  creator:  8,
  pro:      19,
  business: 49,
};

function nextTierUp(t: TierLevel): Exclude<TierLevel, "free"> {
  if (t === "free") return "creator";
  if (t === "creator") return "pro";
  return "pro";
}

// ---------------------------------------------------------------------------
// Suggestion type — mirrors mockup suggestion objects
// ---------------------------------------------------------------------------

interface Suggestion {
  copy: string;
  tag: string;
}

// ---------------------------------------------------------------------------
// Modal view state machine — mirrors mockup demoState
// ---------------------------------------------------------------------------

type ViewState = "loaded" | "loading" | "error" | "empty" | "out";

// ---------------------------------------------------------------------------
// Props contract (inferred from mockup; adjusted per task brief)
// ---------------------------------------------------------------------------

export interface AiSuggestModalProps {
  /** Whether the modal is open */
  open: boolean;
  /** Callback when open state changes */
  onOpenChange: (open: boolean) => void;
  /** Creator's current subscription tier */
  currentTier: TierLevel;
  /** Surface the suggestion is for, e.g. 'bio', 'block-label', 'page-name' */
  surface: string;
  /** Context text from the originating field */
  inputText?: string;
  /** How many AI suggestions the user has used today (drives cost strip) */
  creditsUsed?: number;
  /** Context summary shown in the ctx-strip (HTML string; supports <b> and <code>) */
  contextSummary?: string;
  /** Callback when user accepts a suggestion */
  onAccept: (text: string) => void;
}

// ---------------------------------------------------------------------------
// Helpers — countdown + quota formatting; mirrors mockup utilities
// ---------------------------------------------------------------------------

function getResetMs(): number {
  const now = new Date();
  const midnight = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1,
    0, 0, 0, 0,
  );
  return midnight - now.getTime();
}

function formatCountdown(ms: number): string {
  if (ms <= 0) return "0s";
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m`;
  return `${s % 60}s`;
}

// ---------------------------------------------------------------------------
// SVG atoms — inline SVGs matching mockup exactly
// ---------------------------------------------------------------------------

function CloseIcon() {
  return (
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
  );
}

function InfoCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

function AlertCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <polyline points="1 20 1 14 7 14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  );
}

function ChatBubbleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// CostStrip — quota bar under the header (DEC-176/177)
// Mirrors mockup paintCostStripLive (lines 1512-1537)
// Hidden for Pro+Business unlimited tiers.
// ---------------------------------------------------------------------------

interface CostStripProps {
  tier: TierLevel;
  used: number;
}

function CostStrip({ tier, used }: CostStripProps) {
  const spec = QUOTAS[tier];
  if (spec.unlimited) return null;

  const remaining = Math.max(0, spec.limit - used);
  const pct = Math.min(100, Math.round((used / spec.limit) * 100));
  const resetCountdown = formatCountdown(getResetMs());

  let stripClass = "ctx-cost";
  if (remaining === 0) stripClass += " is-out";
  else if (remaining <= 2) stripClass += " is-low";

  const lineContent =
    remaining === 0 ? (
      <><b>You've used today's {spec.limit} AI suggestions</b></>
    ) : (
      <><b>{used} of {spec.limit}</b> suggestions today</>
    );

  const subContent =
    remaining === 0
      ? `Resets in ${resetCountdown} (midnight UTC)`
      : `Resets in ${resetCountdown} · midnight UTC`;

  return (
    <div className={stripClass} style={{ margin: "12px 22px 0" }}>
      <div className="meter">
        <div className="line">{lineContent}</div>
        <div className="bar">
          <i style={{ width: `${pct}%` }} />
        </div>
        <div className="sub">{subContent}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SkeletonCard — shimmer loading card; mirrors mockup sugg-skeleton (lines 507-533)
// ---------------------------------------------------------------------------

interface SkeletonCardProps {
  line1Width?: string;
  line2Width?: string;
}

function SkeletonCard({ line1Width = "75%", line2Width = "45%" }: SkeletonCardProps) {
  return (
    <div className="sugg-skeleton">
      <div className="sk-idx" />
      <div className="sk-copy">
        <div className="sk-block sk-line-1" style={{ width: line1Width }} />
        <div className="sk-block sk-line-2" style={{ width: line2Width }} />
      </div>
      <div className="sk-tag" />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SuggCard — individual suggestion card; mirrors mockup .sugg-card (lines 428-504)
// ---------------------------------------------------------------------------

interface SuggCardProps {
  index: number;
  copy: string;
  tag: string;
  selected: boolean;
  onSelect: () => void;
}

function SuggCard({ index, copy, tag, selected, onSelect }: SuggCardProps) {
  return (
    <li>
      <button
        className={`sugg-card${selected ? " is-selected" : ""}`}
        type="button"
        onClick={onSelect}
      >
        <span className="idx">{index}</span>
        <span className="copy">{copy}</span>
        <span className="style-tag">{tag}</span>
        <span className="check">✓</span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// ContextStrip — "Based on your …" line; mirrors mockup .ctx-strip (lines 336-362)
// ---------------------------------------------------------------------------

interface ContextStripProps {
  html: string;
}

function ContextStrip({ html }: ContextStripProps) {
  return (
    <div className="ctx-strip">
      <InfoCircleIcon className="ctx-icon" />
      <div
        className="ctx-text"
        dangerouslySetInnerHTML={{ __html: html }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// RefineField — optional context textarea; mirrors mockup .refine (lines 364-405)
// ---------------------------------------------------------------------------

interface RefineFieldProps {
  value: string;
  onChange: (v: string) => void;
}

function RefineField({ value, onChange }: RefineFieldProps) {
  return (
    <div className="refine">
      <label htmlFor="ai-suggest-refine-input">
        Add context for AI{" "}
        <span className="opt">— optional</span>
      </label>
      <textarea
        id="ai-suggest-refine-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="e.g. 'punchy and short', 'more professional', 'mention the release date'"
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// SelectedBanner — confirmation flourish after pick; mirrors mockup .selected-banner
// (lines 752-766)
// ---------------------------------------------------------------------------

interface SelectedBannerProps {
  copy: string;
}

function SelectedBanner({ copy }: SelectedBannerProps) {
  return (
    <div className="selected-banner">
      <span className="check">✓</span>
      <span>
        Selected: <b>{copy}</b>
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// LoadedBody — 5 suggestion cards; mirrors mockup demoState==='loaded'
// (lines 1723-1734)
// ---------------------------------------------------------------------------

interface LoadedBodyProps {
  contextHtml: string;
  refineValue: string;
  onRefineChange: (v: string) => void;
  suggestions: Suggestion[];
  selectedIdx: number;
  onSelect: (i: number) => void;
}

function LoadedBody({
  contextHtml,
  refineValue,
  onRefineChange,
  suggestions,
  selectedIdx,
  onSelect,
}: LoadedBodyProps) {
  return (
    <>
      <ContextStrip html={contextHtml} />
      <RefineField value={refineValue} onChange={onRefineChange} />
      {selectedIdx >= 0 && suggestions[selectedIdx] && (
        <SelectedBanner copy={suggestions[selectedIdx].copy} />
      )}
      <div className="suggestions-head">
        <span className="lbl">Pick one</span>
        <span className="count">{suggestions.length} suggestions</span>
      </div>
      <ul className="sugg-list">
        {suggestions.map((s, i) => (
          <SuggCard
            key={i}
            index={i + 1}
            copy={s.copy}
            tag={s.tag}
            selected={selectedIdx === i}
            onSelect={() => onSelect(i)}
          />
        ))}
      </ul>
    </>
  );
}

// ---------------------------------------------------------------------------
// LoadingBody — skeleton cards; mirrors mockup demoState==='loading'
// (lines 1735-1745)
// ---------------------------------------------------------------------------

interface LoadingBodyProps {
  contextHtml: string;
  refineValue: string;
  onRefineChange: (v: string) => void;
}

function LoadingBody({ contextHtml, refineValue, onRefineChange }: LoadingBodyProps) {
  const SKELETON_WIDTHS: Array<[string, string]> = [
    ["75%", "45%"],
    ["60%", "40%"],
    ["80%", "35%"],
    ["70%", "50%"],
    ["65%", "42%"],
  ];
  return (
    <>
      <ContextStrip html={contextHtml} />
      <RefineField value={refineValue} onChange={onRefineChange} />
      <div className="suggestions-head">
        <span className="lbl">Pick one</span>
        <span className="count">Generating…</span>
      </div>
      <div className="sugg-list">
        {SKELETON_WIDTHS.map(([w1, w2], i) => (
          <SkeletonCard key={i} line1Width={w1} line2Width={w2} />
        ))}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// ErrorBody — network/upstream failure; mirrors mockup demoState==='error'
// (lines 1746-1755)
// ---------------------------------------------------------------------------

interface ErrorBodyProps {
  contextHtml: string;
  onRetry: () => void;
}

function ErrorBody({ contextHtml, onRetry }: ErrorBodyProps) {
  return (
    <>
      <ContextStrip html={contextHtml} />
      <div className="err-box">
        <AlertCircleIcon className="err-icon" />
        <div className="err-msg">
          <b>Couldn't fetch suggestions.</b>
          <span className="err-sub">
            The AI model is taking longer than expected. Give it another go in a moment.
          </span>
          <div className="err-actions">
            <button type="button" onClick={onRetry}>
              Try again
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// EmptyBody — no input / no context yet; mirrors mockup demoState==='empty'
// (lines 1756-1765)
// ---------------------------------------------------------------------------

interface EmptyBodyProps {
  contextHtml: string;
  refineValue: string;
  onRefineChange: (v: string) => void;
  onGenerate: () => void;
}

function EmptyBody({ contextHtml, refineValue, onRefineChange, onGenerate }: EmptyBodyProps) {
  return (
    <>
      <ContextStrip html={contextHtml} />
      <RefineField value={refineValue} onChange={onRefineChange} />
      <div className="empty-box">
        <ChatBubbleIcon className="empty-icon" />
        <div className="empty-h">Tell us a bit about it first</div>
        <div className="empty-sub">
          Type something in the field, paste a URL into the block, or describe
          it in the box above. We'll generate five options based on whatever you
          give us.
        </div>
        <button className="btn-primary" type="button" onClick={onGenerate}>
          Generate from context
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// OutBody — quota exhausted hard-block; mirrors mockup demoState==='out'
// (lines 1766-1798)
// ---------------------------------------------------------------------------

interface OutBodyProps {
  contextHtml: string;
  tier: TierLevel;
}

function OutBody({ contextHtml, tier }: OutBodyProps) {
  const spec = QUOTAS[tier];
  const resetCountdown = formatCountdown(getResetMs());

  return (
    <>
      <ContextStrip html={contextHtml} />
      <div className="out-box" role="alert">
        <div className="out-icon" aria-hidden="true">⏳</div>
        <div className="out-h">Comes back at midnight UTC</div>
        <div className="out-countdown">
          in <b>{resetCountdown}</b>
        </div>
        <details open={tier === "free"}>
          <summary>Why we limit</summary>
          <p>
            AI suggestions cost us a fraction of a cent each ($0.000223 per call
            on Cloudflare Workers AI). We rate-limit to keep tadaify Free for
            everyone.
          </p>
        </details>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// DefaultFoot — Refresh + Cancel + Use this; mirrors mockup .ai-modal-foot
// (lines 652-698)
// ---------------------------------------------------------------------------

interface DefaultFootProps {
  isLoading: boolean;
  selectedIdx: number;
  onRefresh: () => void;
  onCancel: () => void;
  onUse: () => void;
}

function DefaultFoot({ isLoading, selectedIdx, onRefresh, onCancel, onUse }: DefaultFootProps) {
  return (
    <div className="ai-modal-foot">
      <div className="left">
        <button
          className={`btn-secondary${isLoading ? " is-loading" : ""}`}
          type="button"
          onClick={onRefresh}
          title="Costs 1 from your daily limit. Different suggestions next time."
        >
          <span className="btn-spinner" />
          <RefreshIcon />
          Refresh
          <span className="refresh-cost"> (uses 1 daily)</span>
        </button>
      </div>
      <div className="right">
        <button className="btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button
          className="btn-primary"
          type="button"
          disabled={selectedIdx < 0}
          onClick={onUse}
        >
          Use this
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// OutFoot — "Wait until midnight" + upgrade CTA; mirrors mockup out-of-quota foot
// (lines 1787-1797)
// ---------------------------------------------------------------------------

interface OutFootProps {
  tier: TierLevel;
  onWait: () => void;
}

function OutFoot({ tier, onWait }: OutFootProps) {
  const nextT = nextTierUp(tier);
  const nextLabel = TIER_LABELS[nextT];
  const nextPrice = TIER_PRICES[nextT];
  const nextSpec = QUOTAS[nextT];
  const nextQuotaCopy = nextSpec.unlimited ? "unlimited suggestions" : `${nextSpec.limit}/day`;

  const handleUpgrade = () => {
    // TODO: wire to billing / Stripe checkout
  };

  return (
    <div className="ai-modal-foot">
      <div className="left" />
      <div className="right">
        <button className="btn-ghost" type="button" onClick={onWait}>
          Wait until midnight
        </button>
        <button
          className="upgrade-btn"
          type="button"
          style={{ padding: "9px 14px" }}
          onClick={handleUpgrade}
        >
          Upgrade to {nextLabel} — ${nextPrice}/mo for {nextQuotaCopy}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ErrorFoot — no Refresh, just Cancel + disabled Use this
// (mirrors mockup error state footer: lines 1243-1246)
// ---------------------------------------------------------------------------

interface ErrorFootProps {
  onCancel: () => void;
}

function ErrorFoot({ onCancel }: ErrorFootProps) {
  return (
    <div className="ai-modal-foot">
      <div className="left" />
      <div className="right">
        <button className="btn-ghost" type="button" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn-primary" type="button" disabled>
          Use this
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AiSuggestModal (root)
// ---------------------------------------------------------------------------

// Stub suggestions list — rendered when view state is 'loaded'.
// TODO: replace with real AI service response.
const STUB_SUGGESTIONS: Suggestion[] = [
  { copy: "Spring Drops — out now",                  tag: "Direct"       },
  { copy: "Hit play. New album, fresh feels.",        tag: "Playful"      },
  { copy: "My new album is here — give it a spin",    tag: "Friendly"     },
  { copy: "Listen to Spring Drops on Spotify",        tag: "Professional" },
  { copy: "Wonder what's new? Spring Drops is live",  tag: "Curious"      },
];

export function AiSuggestModal({
  open,
  onOpenChange,
  currentTier,
  surface,
  inputText,
  creditsUsed = 0,
  contextSummary,
  onAccept,
}: AiSuggestModalProps) {
  const [viewState, setViewState] = useState<ViewState>("loading");
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedIdx, setSelectedIdx] = useState<number>(-1);
  const [refineValue, setRefineValue] = useState<string>("");
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const openRef = useRef(false);

  // Derive context HTML from props; mirrors mockup ctxHtml pattern
  const contextHtml = contextSummary
    ?? (inputText
      ? `Based on your <b>${surface}</b> — current text: <code>${inputText}</code>`
      : `New <b>${surface}</b> — no content set yet.`);

  // Derive whether quota is exhausted at open time
  const spec = QUOTAS[currentTier];
  const isOutOfQuota = !spec.unlimited && creditsUsed >= spec.limit;

  // Reset state on open, mirror mockup openAi() (lines 1573-1604)
  useEffect(() => {
    if (open && !openRef.current) {
      openRef.current = true;
      setSelectedIdx(-1);
      setRefineValue("");
      setIsRefreshing(false);

      if (isOutOfQuota) {
        setViewState("out");
        setSuggestions([]);
        return;
      }

      if (!inputText && !contextSummary) {
        setViewState("empty");
        setSuggestions([]);
        return;
      }

      // TODO: wire to AI service — fetch suggestions here
      setViewState("loading");
      setSuggestions([]);

      // Stub: simulate loading then resolve to suggestions
      const timer = setTimeout(() => {
        setSuggestions(STUB_SUGGESTIONS);
        setViewState("loaded");
      }, 800);
      return () => clearTimeout(timer);
    }
    if (!open) {
      openRef.current = false;
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Action handlers ──────────────────────────────────────────────────────

  const handleClose = () => onOpenChange(false);

  const handleSelect = (i: number) => {
    setSelectedIdx(i);
  };

  const handleUse = () => {
    if (selectedIdx < 0 || !suggestions[selectedIdx]) return;
    onAccept(suggestions[selectedIdx].copy);
    onOpenChange(false);
  };

  const handleRefresh = () => {
    // TODO: wire to AI service — explicit re-fetch bypassing cache (DEC-179)
    if (isOutOfQuota) return;
    setIsRefreshing(true);
    setSelectedIdx(-1);
    setViewState("loading");
    setSuggestions([]);

    const timer = setTimeout(() => {
      setSuggestions(STUB_SUGGESTIONS);
      setViewState("loaded");
      setIsRefreshing(false);
    }, 900);
    // cleanup not needed here; timer fires once
    void timer;
  };

  const handleRetry = () => {
    // TODO: wire to AI service — retry after error
    setViewState("loading");
    setSuggestions([]);

    setTimeout(() => {
      setSuggestions(STUB_SUGGESTIONS);
      setViewState("loaded");
    }, 900);
  };

  const handleGenerate = () => {
    // TODO: wire to AI service — generate from context only
    setViewState("loading");
    setSuggestions([]);

    setTimeout(() => {
      setSuggestions(STUB_SUGGESTIONS);
      setViewState("loaded");
    }, 900);
  };

  // ── Body + Foot selection ─────────────────────────────────────────────────

  const renderBody = () => {
    switch (viewState) {
      case "loaded":
        return (
          <LoadedBody
            contextHtml={contextHtml}
            refineValue={refineValue}
            onRefineChange={setRefineValue}
            suggestions={suggestions}
            selectedIdx={selectedIdx}
            onSelect={handleSelect}
          />
        );
      case "loading":
        return (
          <LoadingBody
            contextHtml={contextHtml}
            refineValue={refineValue}
            onRefineChange={setRefineValue}
          />
        );
      case "error":
        return (
          <ErrorBody
            contextHtml={contextHtml}
            onRetry={handleRetry}
          />
        );
      case "empty":
        return (
          <EmptyBody
            contextHtml={contextHtml}
            refineValue={refineValue}
            onRefineChange={setRefineValue}
            onGenerate={handleGenerate}
          />
        );
      case "out":
        return (
          <OutBody
            contextHtml={contextHtml}
            tier={currentTier}
          />
        );
    }
  };

  const renderFoot = () => {
    if (viewState === "out") {
      return <OutFoot tier={currentTier} onWait={handleClose} />;
    }
    if (viewState === "error") {
      return <ErrorFoot onCancel={handleClose} />;
    }
    return (
      <DefaultFoot
        isLoading={viewState === "loading" || isRefreshing}
        selectedIdx={viewState === "loaded" ? selectedIdx : -1}
        onRefresh={handleRefresh}
        onCancel={handleClose}
        onUse={handleUse}
      />
    );
  };

  // ── Render ───────────────────────────────────────────────────────────────

  return (
    <Dialog.Root
      open={open}
      onOpenChange={(nextOpen) => {
        if (!nextOpen) handleClose();
        else onOpenChange(true);
      }}
    >
      <Dialog.Portal>
        {/* Backdrop — matches mockup .ai-modal-backdrop (lines 274-301) */}
        <Dialog.Overlay
          className={`ai-modal-backdrop ai-suggest-modal${open ? " is-open" : ""}`}
          onClick={(e) => {
            if (e.target === e.currentTarget) handleClose();
          }}
        />

        {/* Modal panel — matches mockup .ai-modal (lines 285-301) */}
        <Dialog.Content
          className="ai-suggest-modal"
          aria-describedby={undefined}
          data-testid="ai-suggest-modal-box"
          onPointerDownOutside={(e) => e.preventDefault()}
          onInteractOutside={(e) => e.preventDefault()}
        >
          <div className="ai-modal" role="document">
            {/* Header — matches mockup .ai-modal-head (lines 303-326) */}
            <div className="ai-modal-head">
              <Dialog.Title asChild>
                <h3 id="ai-suggest-h">
                  <span className="sparkle">✨</span>
                  AI suggestions for{" "}
                  <span className="target-name">{surface}</span>
                </h3>
              </Dialog.Title>
              <button
                className="iconbtn"
                type="button"
                onClick={handleClose}
                aria-label="Close"
              >
                <CloseIcon />
              </button>
            </div>

            {/* Cost transparency strip — DEC-176/177 */}
            <CostStrip tier={currentTier} used={creditsUsed} />

            {/* Body — state-driven */}
            <div className="ai-modal-body">
              {renderBody()}
            </div>

            {/* Footer — state-driven */}
            {renderFoot()}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ---------------------------------------------------------------------------
// Named exports
// ---------------------------------------------------------------------------

export default AiSuggestModal;

/** ARIA label constant for the modal close button (testable). */
export const AI_SUGGEST_CLOSE_LABEL = "Close" as const;

/** Re-export tier quota config for callers. */
export { QUOTAS, TIER_LABELS };
