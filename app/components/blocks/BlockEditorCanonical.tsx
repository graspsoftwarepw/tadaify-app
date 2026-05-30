/**
 * BlockEditorCanonical — 1:1 implementation of the canonical block editor modal.
 *
 * Visual contract: mockups/tadaify-mvp/app-block-editor.html (5625 LOC)
 *
 * Sections implemented:
 *   ✓ Modal shell: header (type icon + name + type switcher + close)
 *   ✓ Centered backdrop, 2-column desktop / 1-column mobile body
 *   ✓ Sticky footer save bar
 *   ✓ Type switcher dropdown: 12 block types
 *   ✓ Content section with Variant A/B tabs (always visible, DEC-093)
 *   ✓ Variant B 🔒 Business badge for non-Business tiers
 *   ✓ Per-block-type form bodies (12 forms total)
 *   ✓ Schedule visibility section (Creator+, always visible)
 *   ✓ Block-level analytics tile (top-right of preview column)
 *   ✓ Visibility toggle (always visible)
 *   ✓ Action row (duplicate / delete)
 *   ✓ Save validation → TierGateModal when Variant B differs (Business) or Schedule set on Free (Creator)
 *   ✓ Backward-compat: LinkBlockEditor still works via CRUD API
 *
 * TierGate integration:
 *   - Schedule set on Free → TierGateModal with requiredTier="creator"
 *   - Variant B differs on non-Business → TierGateModal with requiredTier="business"
 *   - Custom HTML on non-Pro → TierGateModal with requiredTier="pro"
 *
 * All save / fetch-thumbnail / oEmbed / etc. actions stubbed:
 *   // TODO: wire to <X> API
 *
 * Story: tadaify-app#52 block-editor-mockup
 * Replaces: LinkBlockEditor.tsx (stub from #56 slice A)
 */

import { useCallback, useState, type ReactElement } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import type { TierLevel, TierGateFeature } from "~/components/TierGateModal";
import { TierGateModal } from "~/components/TierGateModal";
import { BlockEditorVariantTabs } from "~/components/blocks/BlockEditorVariantTabs";
import { BlockEditorScheduleSection } from "~/components/blocks/BlockEditorScheduleSection";
import { BlockEditorAnalyticsTile, type AnalyticsTileData } from "~/components/blocks/BlockEditorAnalyticsTile";
import { BlockEditorVisibilityToggle } from "~/components/blocks/BlockEditorVisibilityToggle";

// Form imports
import { LinkForm, LINK_FORM_DEFAULTS, type LinkFormValue } from "~/components/blocks/forms/LinkForm";
import { ImageForm, IMAGE_FORM_DEFAULTS, type ImageFormValue } from "~/components/blocks/forms/ImageForm";
import { EmbedForm, EMBED_FORM_DEFAULTS, type EmbedFormValue } from "~/components/blocks/forms/EmbedForm";
import { HeadingForm, HEADING_FORM_DEFAULTS, type HeadingFormValue } from "~/components/blocks/forms/HeadingForm";
import { DividerForm, DIVIDER_FORM_DEFAULTS, type DividerFormValue } from "~/components/blocks/forms/DividerForm";
import { SocialForm, SOCIAL_FORM_DEFAULTS, type SocialFormValue } from "~/components/blocks/forms/SocialForm";
import { NewsletterForm, NEWSLETTER_FORM_DEFAULTS, type NewsletterFormValue } from "~/components/blocks/forms/NewsletterForm";
import { ProductForm, PRODUCT_FORM_DEFAULTS, type ProductFormValue } from "~/components/blocks/forms/ProductForm";
import { VideoForm, VIDEO_FORM_DEFAULTS, type VideoFormValue } from "~/components/blocks/forms/VideoForm";
import { AccordionForm, ACCORDION_FORM_DEFAULTS, type AccordionFormValue } from "~/components/blocks/forms/AccordionForm";
import { CustomHtmlForm, CUSTOM_HTML_FORM_DEFAULTS, type CustomHtmlFormValue } from "~/components/blocks/forms/CustomHtmlForm";
import { CountdownForm, COUNTDOWN_FORM_DEFAULTS, type CountdownFormValue } from "~/components/blocks/forms/CountdownForm";

// ---------------------------------------------------------------------------
// Block type catalog
// ---------------------------------------------------------------------------

export type BlockType =
  | "link"
  | "image"
  | "embed"
  | "heading"
  | "divider"
  | "social"
  | "newsletter"
  | "product"
  | "video"
  | "accordion"
  | "custom-html"
  | "countdown";

interface BlockTypeMeta {
  label: string;
  icon: string;
  category: string;
  analytics: AnalyticsTileData;
  /** Minimum tier required — save-time gate */
  gatedAt?: TierLevel;
}

const BLOCK_TYPE_META: Record<BlockType, BlockTypeMeta> = {
  link: {
    label: "Link button",
    icon: "🔗",
    category: "Links",
    analytics: { today: "128", sevenDay: "1.2k", topSource: "tiktok", trending: true },
  },
  image: {
    label: "Image",
    icon: "🖼",
    category: "Media",
    analytics: { today: "46", sevenDay: "380", topSource: "instagram" },
  },
  embed: {
    label: "Embed",
    icon: "📺",
    category: "Media",
    analytics: { today: "92", sevenDay: "760", topSource: "youtube" },
  },
  heading: {
    label: "Heading / text",
    icon: "📝",
    category: "Layout",
    analytics: { today: "0", sevenDay: "0", topSource: "—" },
  },
  divider: {
    label: "Divider",
    icon: "➖",
    category: "Layout",
    analytics: { today: "0", sevenDay: "0", topSource: "—" },
  },
  social: {
    label: "Social icons row",
    icon: "🌐",
    category: "Links",
    analytics: { today: "64", sevenDay: "510", topSource: "pinterest" },
  },
  newsletter: {
    label: "Newsletter signup",
    icon: "✉️",
    category: "Forms",
    analytics: { today: "14", sevenDay: "92", topSource: "instagram" },
  },
  product: {
    label: "Product",
    icon: "🛍",
    category: "Shop",
    analytics: { today: "38", sevenDay: "210", topSource: "tiktok" },
  },
  video: {
    label: "Video",
    icon: "🎬",
    category: "Media",
    analytics: { today: "78", sevenDay: "630", topSource: "youtube" },
  },
  accordion: {
    label: "FAQ / accordion",
    icon: "❓",
    category: "Layout",
    analytics: { today: "22", sevenDay: "180", topSource: "direct" },
  },
  "custom-html": {
    label: "Custom HTML",
    icon: "</>",
    category: "Layout",
    analytics: { today: "5", sevenDay: "40", topSource: "direct" },
    gatedAt: "pro",
  },
  countdown: {
    label: "Countdown timer",
    icon: "⏳",
    category: "Layout",
    analytics: { today: "54", sevenDay: "420", topSource: "instagram", trending: true },
  },
};

// ---------------------------------------------------------------------------
// Content state union (per block type)
// ---------------------------------------------------------------------------

type ContentState =
  | { type: "link"; data: LinkFormValue }
  | { type: "image"; data: ImageFormValue }
  | { type: "embed"; data: EmbedFormValue }
  | { type: "heading"; data: HeadingFormValue }
  | { type: "divider"; data: DividerFormValue }
  | { type: "social"; data: SocialFormValue }
  | { type: "newsletter"; data: NewsletterFormValue }
  | { type: "product"; data: ProductFormValue }
  | { type: "video"; data: VideoFormValue }
  | { type: "accordion"; data: AccordionFormValue }
  | { type: "custom-html"; data: CustomHtmlFormValue }
  | { type: "countdown"; data: CountdownFormValue };

function defaultContentState(type: BlockType): ContentState {
  switch (type) {
    case "link":         return { type, data: { ...LINK_FORM_DEFAULTS } };
    case "image":        return { type, data: { ...IMAGE_FORM_DEFAULTS } };
    case "embed":        return { type, data: { ...EMBED_FORM_DEFAULTS } };
    case "heading":      return { type, data: { ...HEADING_FORM_DEFAULTS } };
    case "divider":      return { type, data: { ...DIVIDER_FORM_DEFAULTS } };
    case "social":       return { type, data: { ...SOCIAL_FORM_DEFAULTS } };
    case "newsletter":   return { type, data: { ...NEWSLETTER_FORM_DEFAULTS } };
    case "product":      return { type, data: { ...PRODUCT_FORM_DEFAULTS } };
    case "video":        return { type, data: { ...VIDEO_FORM_DEFAULTS } };
    case "accordion":    return { type, data: { ...ACCORDION_FORM_DEFAULTS } };
    case "custom-html":  return { type, data: { ...CUSTOM_HTML_FORM_DEFAULTS } };
    case "countdown":    return { type, data: { ...COUNTDOWN_FORM_DEFAULTS } };
  }
}

// A/B state structure
interface AbState {
  activeTab: "A" | "B";
  variantA: ContentState;
  variantB: ContentState;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BlockEditorCanonicalProps {
  /** Whether the editor modal is open */
  open: boolean;
  /** Open/close callback */
  onOpenChange: (open: boolean) => void;
  /** Initial block type */
  initialType?: BlockType;
  /** Block ID — null for new blocks */
  blockId?: string | null;
  /** Page ID — needed for CREATE calls */
  pageId?: string | null;
  /** Current creator tier */
  tier?: TierLevel;
  /** Callback after successful save */
  onSaved?: (block: unknown) => void;
  /** Callback for duplicate action */
  onDuplicate?: (blockId: string | null) => void;
  /** Callback for delete action */
  onDelete?: (blockId: string | null) => void;
}

// ---------------------------------------------------------------------------
// Tier rank helper
// ---------------------------------------------------------------------------

const TIER_RANK: Record<TierLevel, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function BlockEditorCanonical({
  open,
  onOpenChange,
  initialType = "link",
  blockId = null,
  pageId: _pageId = null,
  tier = "creator",
  onSaved,
  onDuplicate,
  onDelete,
}: BlockEditorCanonicalProps): ReactElement {
  const [blockType, setBlockType] = useState<BlockType>(initialType);
  const [visible, setVisible] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedHint, setSavedHint] = useState<string | null>(null);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

  // A/B state
  const [ab, setAb] = useState<AbState>({
    activeTab: "A",
    variantA: defaultContentState(initialType),
    variantB: defaultContentState(initialType),
  });

  // Schedule section
  const [schedule, setSchedule] = useState({ scheduleStart: "", scheduleEnd: "" });

  // TierGate state
  const [tierGateOpen, setTierGateOpen] = useState(false);
  const [tierGateFeatures, setTierGateFeatures] = useState<TierGateFeature[]>([]);
  const [pendingSave, setPendingSave] = useState(false);

  // Current active content
  const activeContent = ab.activeTab === "A" ? ab.variantA : ab.variantB;

  function setActiveContent(next: ContentState) {
    if (ab.activeTab === "A") {
      setAb((prev) => ({ ...prev, variantA: next }));
    } else {
      setAb((prev) => ({ ...prev, variantB: next }));
    }
  }

  // Count diffs between A and B (shallow JSON comparison)
  function countAbDiffs(): number {
    const a = ab.variantA.data as unknown as Record<string, unknown>;
    const b = ab.variantB.data as unknown as Record<string, unknown>;
    let count = 0;
    for (const key of Object.keys(a)) {
      if (JSON.stringify(a[key]) !== JSON.stringify(b[key])) count++;
    }
    return count;
  }

  // Switch block type — resets content to defaults
  const handleTypeChange = useCallback((newType: string) => {
    const t = newType as BlockType;
    setBlockType(t);
    const defaultState = defaultContentState(t);
    setAb({
      activeTab: "A",
      variantA: defaultState,
      variantB: defaultContentState(t),
    });
  }, []);

  // Copy A → B
  function copyAtoB() {
    setAb((prev) => ({ ...prev, variantB: { ...prev.variantA } }));
  }

  // Reset B to match A
  function resetBtoA() {
    setAb((prev) => ({ ...prev, variantB: defaultContentState(blockType) }));
  }

  // Save logic with TierGate validation
  const handleSave = useCallback(async () => {
    const features: TierGateFeature[] = [];
    const abDiffs = countAbDiffs();

    // Custom HTML on non-Pro
    if (blockType === "custom-html" && TIER_RANK[tier] < TIER_RANK.pro) {
      features.push({
        id: "custom-html",
        name: "Custom HTML",
        requires: "pro",
        contextLines: ["Custom HTML block — <b>Pro plan required</b>"],
        partialSave: null,
      });
    }

    // Schedule set on Free
    if ((schedule.scheduleStart || schedule.scheduleEnd) && TIER_RANK[tier] < TIER_RANK.creator) {
      features.push({
        id: "schedule",
        name: "Schedule visibility",
        requires: "creator",
        contextLines: ["Schedule visibility is set on this block"],
        partialSave: { label: "schedule visibility", desc: "saves the block without scheduled dates." },
      });
    }

    // Variant B differs on non-Business
    if (abDiffs > 0 && TIER_RANK[tier] < TIER_RANK.business) {
      features.push({
        id: "ab",
        name: "A/B testing",
        requires: "business",
        contextLines: [
          `A/B test on <b>${BLOCK_TYPE_META[blockType].label}</b> — ${abDiffs} variant${abDiffs === 1 ? "" : "s"} ready`,
        ],
        partialSave: { label: "A/B testing", desc: "keeps Variant A live." },
      });
    }

    if (features.length > 0) {
      setTierGateFeatures(features);
      setPendingSave(true);
      setTierGateOpen(true);
      return;
    }

    await doSave();
  }, [blockType, tier, schedule, ab]);

  async function doSave() {
    setSaving(true);
    try {
      // TODO: wire to POST/PATCH /api/blocks API
      await new Promise((r) => setTimeout(r, 400));
      setSavedHint("Saved just now");
      onSaved?.({
        type: blockType,
        variantA: ab.variantA.data,
        variantB: ab.variantB.data,
        visible,
        scheduleStart: schedule.scheduleStart,
        scheduleEnd: schedule.scheduleEnd,
      });
    } finally {
      setSaving(false);
    }
  }

  function handleSaveWithoutPremium() {
    setTierGateOpen(false);
    setPendingSave(false);
    void doSave();
  }

  function handleDiscard() {
    onOpenChange(false);
  }

  function handleUpgradeClick() {
    setTierGateFeatures([
      {
        id: "ab",
        name: "A/B testing",
        requires: "business",
        contextLines: ["Upgrade to Business to run A/B tests on every block"],
      },
    ]);
    setTierGateOpen(true);
  }

  const meta = BLOCK_TYPE_META[blockType];
  const abDiffCount = countAbDiffs();

  // Group block types by category for the select
  const typeOptions = Object.entries(BLOCK_TYPE_META).map(([value, m]) => ({
    value,
    label: `${m.icon}  ${m.label}`,
  }));

  return (
    <>
      <Dialog.Root open={open} onOpenChange={onOpenChange}>
        <Dialog.Portal>
          <Dialog.Overlay
            className="modal-backdrop is-open"
            style={{ zIndex: 50 }}
          />
          <Dialog.Content
            className="modal"
            style={{
              position: "fixed",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              zIndex: 50,
            }}
            data-testid="block-editor-canonical"
            aria-describedby={undefined}
          >
            {/* ── Header ────────────────────────────────────────────── */}
            <header className="modal-head">
              <span className="type-ic" aria-hidden="true">{meta.icon}</span>
              <div className="type-meta">
                <div className="lbl">Editing block</div>
                <Dialog.Title className="ttl">{meta.label}</Dialog.Title>
              </div>

              {/* Type switcher */}
              <select
                className="type-switch"
                aria-label="Switch block type"
                value={blockType}
                onChange={(e) => handleTypeChange(e.target.value)}
              >
                {typeOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>

              {/* Close button */}
              <Dialog.Close asChild>
                <button
                  type="button"
                  className="iconbtn"
                  aria-label="Close editor"
                  title="Close (Esc)"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </Dialog.Close>
            </header>

            {/* ── Body (2-column grid) ────────────────────────────── */}
            <div className="modal-body">

              {/* ── LEFT COLUMN — form ────────────────────────────── */}
              <div className="col-form">

                {/* Content section with A/B tabs */}
                <section className="section" id="form-section" aria-labelledby="form-section-h">
                  <div className="section-head">
                    <h4 id="form-section-h">Content</h4>
                    {/* A/B tabs + chip + edu + helper + win-note */}
                    <BlockEditorVariantTabs
                      activeVariant={ab.activeTab}
                      onVariantChange={(v) => setAb((prev) => ({ ...prev, activeTab: v }))}
                      abDiffCount={abDiffCount}
                      tier={tier}
                      onCopyAtoB={copyAtoB}
                      onResetBtoA={resetBtoA}
                      onUpgradeClick={handleUpgradeClick}
                    />
                    <div className="head-spacer" />
                    {/* Visibility toggle */}
                    <BlockEditorVisibilityToggle visible={visible} onChange={setVisible} />
                  </div>

                  {/* Per-type form body */}
                  <FormBody
                    content={activeContent}
                    onChange={setActiveContent}
                    blockType={blockType}
                  />
                </section>

                {/* Mobile preview toggle */}
                <button
                  className={`preview-toggle${mobilePreviewOpen ? " is-open" : ""}`}
                  id="preview-toggle-btn"
                  type="button"
                  onClick={() => setMobilePreviewOpen((o) => !o)}
                  aria-expanded={mobilePreviewOpen}
                  aria-controls="col-preview"
                >
                  <span>👁 Show preview · what visitors see</span>
                  <svg
                    className="chev"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>

                {/* Schedule visibility section */}
                <BlockEditorScheduleSection
                  value={schedule}
                  onChange={setSchedule}
                  tier={tier}
                  onUpgradeClick={handleUpgradeClick}
                />

                {/* Action row */}
                <section className="section" aria-label="Block actions">
                  <div className="action-row">
                    <button
                      type="button"
                      onClick={() => onDuplicate?.(blockId)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <rect x="9" y="9" width="13" height="13" rx="2" />
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                      </svg>
                      Duplicate
                    </button>
                    <button
                      type="button"
                      className="danger"
                      onClick={() => onDelete?.(blockId)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                      </svg>
                      Delete block
                    </button>
                  </div>
                </section>

              </div>{/* /col-form */}

              {/* ── RIGHT COLUMN — preview ─────────────────────────── */}
              <div
                className={`col-preview${mobilePreviewOpen ? " is-open" : ""}`}
                id="col-preview"
              >
                {/* Analytics tile */}
                <BlockEditorAnalyticsTile
                  data={meta.analytics}
                  blockId={blockId}
                />

                {/* Live preview */}
                <section className="section" aria-labelledby="preview-section-h">
                  <div className="section-head">
                    <h4 id="preview-section-h">Preview · what visitors see</h4>
                  </div>
                  <div
                    className={`preview${visible ? "" : " is-hidden"}`}
                    data-testid="block-preview"
                  >
                    <div className="preview-hidden-flag">Hidden</div>
                    <PreviewBody content={activeContent} blockType={blockType} />
                  </div>
                </section>

              </div>{/* /col-preview */}

            </div>{/* /modal-body */}

            {/* ── Footer ────────────────────────────────────────────── */}
            <footer className="modal-foot">
              <div className="saved-hint">
                {savedHint && <b>{savedHint}</b>}
              </div>
              <button
                type="button"
                className="btn-discard"
                onClick={handleDiscard}
              >
                Discard
              </button>
              <button
                type="button"
                className="btn-save"
                onClick={() => void handleSave()}
                disabled={saving}
                aria-busy={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </footer>

          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* TierGate modal — sub-modal (z-index 60) */}
      <TierGateModal
        open={tierGateOpen}
        onOpenChange={(o) => {
          setTierGateOpen(o);
          if (!o) setPendingSave(false);
        }}
        currentTier={tier}
        features={tierGateFeatures}
        onSaveWithoutPremium={handleSaveWithoutPremium}
        onUpgrade={(_targetTier, _cycle) => {
          // TODO: wire to Stripe checkout
          setTierGateOpen(false);
        }}
        onCancel={() => {
          setTierGateOpen(false);
          setPendingSave(false);
        }}
      />
    </>
  );
}

// ---------------------------------------------------------------------------
// FormBody — renders the correct form component for the active block type
// ---------------------------------------------------------------------------

interface FormBodyProps {
  content: ContentState;
  onChange: (next: ContentState) => void;
  blockType: BlockType;
}

function FormBody({ content, onChange, blockType }: FormBodyProps): ReactElement {
  switch (blockType) {
    case "link":
      return (
        <LinkForm
          value={(content as { type: "link"; data: LinkFormValue }).data}
          onChange={(data) => onChange({ type: "link", data })}
        />
      );
    case "image":
      return (
        <ImageForm
          value={(content as { type: "image"; data: ImageFormValue }).data}
          onChange={(data) => onChange({ type: "image", data })}
        />
      );
    case "embed":
      return (
        <EmbedForm
          value={(content as { type: "embed"; data: EmbedFormValue }).data}
          onChange={(data) => onChange({ type: "embed", data })}
        />
      );
    case "heading":
      return (
        <HeadingForm
          value={(content as { type: "heading"; data: HeadingFormValue }).data}
          onChange={(data) => onChange({ type: "heading", data })}
        />
      );
    case "divider":
      return (
        <DividerForm
          value={(content as { type: "divider"; data: DividerFormValue }).data}
          onChange={(data) => onChange({ type: "divider", data })}
        />
      );
    case "social":
      return (
        <SocialForm
          value={(content as { type: "social"; data: SocialFormValue }).data}
          onChange={(data) => onChange({ type: "social", data })}
        />
      );
    case "newsletter":
      return (
        <NewsletterForm
          value={(content as { type: "newsletter"; data: NewsletterFormValue }).data}
          onChange={(data) => onChange({ type: "newsletter", data })}
        />
      );
    case "product":
      return (
        <ProductForm
          value={(content as { type: "product"; data: ProductFormValue }).data}
          onChange={(data) => onChange({ type: "product", data })}
        />
      );
    case "video":
      return (
        <VideoForm
          value={(content as { type: "video"; data: VideoFormValue }).data}
          onChange={(data) => onChange({ type: "video", data })}
        />
      );
    case "accordion":
      return (
        <AccordionForm
          value={(content as { type: "accordion"; data: AccordionFormValue }).data}
          onChange={(data) => onChange({ type: "accordion", data })}
        />
      );
    case "custom-html":
      return (
        <CustomHtmlForm
          value={(content as { type: "custom-html"; data: CustomHtmlFormValue }).data}
          onChange={(data) => onChange({ type: "custom-html", data })}
        />
      );
    case "countdown":
      return (
        <CountdownForm
          value={(content as { type: "countdown"; data: CountdownFormValue }).data}
          onChange={(data) => onChange({ type: "countdown", data })}
        />
      );
    default:
      return <div className="section-body" />;
  }
}

// ---------------------------------------------------------------------------
// PreviewBody — renders the live preview for the active block type
// ---------------------------------------------------------------------------

interface PreviewBodyProps {
  content: ContentState;
  blockType: BlockType;
}

function PreviewBody({ content, blockType }: PreviewBodyProps): ReactElement {
  switch (blockType) {
    case "link": {
      const d = (content as { type: "link"; data: LinkFormValue }).data;
      return (
        <div className="preview-block">
          {d.label || "Your button label"}
        </div>
      );
    }
    case "image": {
      const d = (content as { type: "image"; data: ImageFormValue }).data;
      const caption = d.caption || d.alt || "Image caption";
      return (
        <div className="preview-image-card">
          <div className="img">🖼</div>
          <div className="content">
            <div className="cap">{caption}</div>
            {d.href && (
              <span className="cta">{d.ctaLabel || "Listen now"} →</span>
            )}
          </div>
        </div>
      );
    }
    case "embed": {
      const d = (content as { type: "embed"; data: EmbedFormValue }).data;
      return (
        <div className="preview-embed-empty">
          <div className="pee-icon">📺</div>
          <div className="pee-msg">{d.url ? "Embed preview" : "Paste a URL to see the embed preview."}</div>
        </div>
      );
    }
    case "heading": {
      const d = (content as { type: "heading"; data: HeadingFormValue }).data;
      const sizeMap: Record<string, string> = { hero: "32px", h1: "24px", h2: "20px", h3: "16px", p: "13px" };
      const weightMap: Record<string, number> = { hero: 700, h1: 700, h2: 600, h3: 600, p: 400 };
      return (
        <div
          className="preview-heading"
          style={{
            fontSize: sizeMap[d.level] || "20px",
            fontWeight: weightMap[d.level] || 600,
            textAlign: d.align as "left" | "center" | "right",
          }}
        >
          {d.text || "My latest releases"}
        </div>
      );
    }
    case "divider": {
      const d = (content as { type: "divider"; data: DividerFormValue }).data;
      if (d.style === "spacer") {
        return <div className="preview-divider spacer" />;
      }
      return (
        <div
          className={`preview-divider${d.style === "dotted" ? " dotted" : ""}`}
        />
      );
    }
    case "social": {
      const d = (content as { type: "social"; data: SocialFormValue }).data;
      if (d.handlesOrder.length === 0) {
        return <div className="preview-social-empty">Add a social platform to see the preview</div>;
      }
      return (
        <div className={`preview-social shape-${d.shape}`}>
          {d.handlesOrder.map((id) => (
            <span key={id} className="si" style={{ fontSize: "18px" }}>●</span>
          ))}
        </div>
      );
    }
    case "newsletter": {
      const d = (content as { type: "newsletter"; data: NewsletterFormValue }).data;
      return (
        <div className="preview-form">
          <div className="pf-heading">{d.heading || "Join my list"}</div>
          <div className="pf-subhead">{d.subhead || "No spam — one email a week."}</div>
          <div className="pf-row">
            <input placeholder={d.placeholder || "you@email.com"} readOnly />
            <button type="button">{d.cta || "Subscribe"}</button>
          </div>
        </div>
      );
    }
    case "product": {
      const d = (content as { type: "product"; data: ProductFormValue }).data;
      return (
        <div className="preview-product">
          <div className="pic" />
          <div className="info">
            <div className="t">{d.title || "Spring drop merch"}</div>
            {d.showPrice && <div className="p">{d.price || "$24"}</div>}
          </div>
          <div className="buy">{d.cta || "Buy on Shopify"}</div>
        </div>
      );
    }
    case "video": {
      return (
        <div className="preview-embed" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ aspectRatio: "16/9", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "32px" }}>
            🎬
          </div>
        </div>
      );
    }
    case "accordion": {
      const d = (content as { type: "accordion"; data: AccordionFormValue }).data;
      const firstQa = d.items.find((it) => it.kind === "qa");
      if (!firstQa || firstQa.kind !== "qa") {
        return <div className="preview-faq" style={{ opacity: 0.7 }}>No questions yet — add one above.</div>;
      }
      return (
        <div className="preview-faq">
          <div className="q">▼ {firstQa.q || "New question"}</div>
          <div className="a">{firstQa.a || "New answer."}</div>
          {d.items.filter((it) => it.kind === "qa").length > 1 && (
            <div className="more">+ {d.items.filter((it) => it.kind === "qa").length - 1} more question{d.items.filter((it) => it.kind === "qa").length - 1 !== 1 ? "s" : ""}</div>
          )}
        </div>
      );
    }
    case "custom-html": {
      const d = (content as { type: "custom-html"; data: CustomHtmlFormValue }).data;
      const snippet = d.html.replace(/\s+/g, " ").slice(0, 80) + "…";
      return <div className="preview-html">{snippet}</div>;
    }
    case "countdown": {
      const d = (content as { type: "countdown"; data: CountdownFormValue }).data;
      return (
        <div>
          <div style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" as const, opacity: 0.85, marginBottom: "6px" }}>
            {d.label || "Next live in"}
          </div>
          <div className="preview-countdown">
            <div className="cd-cell"><div className="v">14</div><div className="l">d</div></div>
            <div className="cd-cell"><div className="v">00</div><div className="l">h</div></div>
            <div className="cd-cell"><div className="v">00</div><div className="l">m</div></div>
            <div className="cd-cell"><div className="v">00</div><div className="l">s</div></div>
          </div>
        </div>
      );
    }
    default:
      return <div />;
  }
}
