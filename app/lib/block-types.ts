/**
 * Block type registry — single source of truth for all block types.
 *
 * Used by: BlockPickerModal (picker gallery), BlockEditorModal (type-switch
 * dropdown). New block types are added by editing this file — no DB lookup.
 *
 * Story: tadaify-app#201 F-BLOCK-INFRA-PICKER-MODAL-001
 * Covers: BR-BLOCK-PICKER-001, BR-BLOCK-PICKER-005, TR (registry)
 * Unit tests: app/lib/block-types.test.ts (U2)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Canonical tier levels (ascending privilege order). */
export const TIER_LEVELS = ["free", "creator", "pro", "business"] as const;
export type TierLevel = (typeof TIER_LEVELS)[number];

/** Block category keys — matches the Category tab nav in BlockPickerModal. */
export const BLOCK_CATEGORIES = [
  "popular",
  "social",
  "music-video",
  "shop",
  "communication",
  "content",
  "generic",
] as const;
export type BlockCategory = (typeof BLOCK_CATEGORIES)[number];

/**
 * Metadata for a single block type entry.
 * All fields except `requiredTier` and `tags` are required.
 */
export interface BlockTypeMeta {
  /** Unique slug key — used in `onSelect(blockType)` callback. */
  id: string;
  /** Human-readable display name. */
  name: string;
  /** One-line description shown under the card title. */
  description: string;
  /** Emoji or short string icon rendered in the card icon chip. */
  icon: string;
  /** Primary category — determines which tab this card appears under. */
  category: BlockCategory;
  /** Default metadata shape merged into a new block on creation. */
  defaultMeta: Record<string, unknown>;
  /**
   * Minimum tier required to use this block type.
   * Undefined = all tiers including Free may use it.
   */
  requiredTier?: TierLevel;
  /**
   * Additional search tags (space-separated lowercase).
   * Searched alongside name + description.
   */
  tags?: string;
  /** Whether this block type is featured in "popular" tab / badges. */
  popular?: boolean;
  /** Whether to show a "New" badge on the card. */
  isNew?: boolean;
}

// ---------------------------------------------------------------------------
// Registry (12 entries, canonical order)
// Canonical list sourced from: mockups/tadaify-mvp/app-block-picker.html TYPES
// ---------------------------------------------------------------------------

export const BLOCK_TYPES: BlockTypeMeta[] = [
  {
    id: "link",
    name: "Link button",
    description: "External URL — YouTube, blog, Spotify, anywhere.",
    icon: "🔗",
    category: "generic",
    popular: true,
    tags: "url button cta href external",
    defaultMeta: { url: "", label: "" },
  },
  {
    id: "image",
    name: "Image",
    description: "Photo with alt text + optional click-through.",
    icon: "🖼",
    category: "content",
    popular: true,
    tags: "photo picture upload media",
    defaultMeta: { src: "", alt: "", href: "" },
  },
  {
    id: "embed",
    name: "Embed",
    description: "Paste a YT, Vimeo, Spotify, TikTok URL — auto-detect.",
    icon: "📺",
    category: "music-video",
    tags: "youtube vimeo spotify tiktok iframe video music",
    defaultMeta: { url: "", provider: "" },
  },
  {
    id: "heading",
    name: "Heading / text",
    description: "Section heading or paragraph with rich text.",
    icon: "📝",
    category: "content",
    popular: true,
    tags: "text paragraph h1 h2 title section divider",
    defaultMeta: { text: "", level: "h2" },
  },
  {
    id: "divider",
    name: "Divider",
    description: "Solid line, dotted, or empty space — group blocks.",
    icon: "➖",
    category: "generic",
    tags: "separator spacer line rule hr gap",
    defaultMeta: { style: "solid", spacing: "md" },
  },
  {
    id: "social",
    name: "Social icons row",
    description: "IG / TikTok / YouTube / X / LinkedIn icon strip.",
    icon: "🌐",
    category: "social",
    popular: true,
    tags: "instagram tiktok youtube twitter x linkedin facebook icons",
    defaultMeta: { links: [] },
  },
  {
    id: "newsletter",
    name: "Newsletter signup",
    description: "Email capture — Mailchimp, ConvertKit, Substack.",
    icon: "✉️",
    category: "communication",
    popular: true,
    tags: "email subscribe mailchimp convertkit substack beehiiv form capture",
    defaultMeta: { provider: "", formUrl: "", placeholder: "Your email" },
  },
  {
    id: "product",
    name: "Product",
    description:
      "Showcase a product from your external store — Shopify, Stripe, Etsy, Gumroad, anywhere.",
    icon: "🛍",
    category: "shop",
    tags: "shopify etsy gumroad stripe buy purchase ecommerce store",
    defaultMeta: { title: "", price: "", image: null, url: "", cta: "", ctaIcon: "lucide:shoppingCart", showPrice: true },
  },
  {
    id: "video",
    name: "Video",
    description: "Direct mp4/webm upload with autoplay + loop.",
    icon: "🎬",
    category: "music-video",
    tags: "mp4 webm upload autoplay loop player",
    defaultMeta: { src: "", autoplay: false, loop: false, muted: true },
  },
  {
    id: "accordion",
    name: "FAQ / accordion",
    description: "Collapsible Q&A — perfect for support pages.",
    icon: "❓",
    category: "content",
    tags: "faq questions answers collapse expand support help",
    defaultMeta: { items: [] },
  },
  {
    id: "custom-html",
    name: "Custom HTML",
    description: "Any HTML / CSS / JS. Power-user only.",
    icon: "</>",
    category: "generic",
    requiredTier: "pro",
    tags: "html css js code script custom embed advanced",
    defaultMeta: { html: "" },
  },
  {
    id: "countdown",
    name: "Countdown timer",
    description: "Drives urgency for launches, drops, events — live ticking.",
    icon: "⏳",
    category: "generic",
    isNew: true,
    tags: "timer countdown launch event drop urgency live clock",
    defaultMeta: {
      label: "Next live in",
      icon: "flame",
      targetAt: "",
      style: "boxed",
      linkLabel: "",
      linkUrl: "",
      autoHide: true,
      replacementCopy: "",
    },
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Rank a tier level as a numeric value for comparison. */
export const TIER_RANK: Record<TierLevel, number> = {
  free: 0,
  creator: 1,
  pro: 2,
  business: 3,
};

/**
 * Returns true if a block type is locked for the given tier.
 * A type is locked when `requiredTier` is set and the user's tier rank
 * is below the required rank.
 */
export function isBlockTypeLocked(
  blockType: BlockTypeMeta,
  currentTier: TierLevel,
): boolean {
  if (!blockType.requiredTier) return false;
  return TIER_RANK[currentTier] < TIER_RANK[blockType.requiredTier];
}

/** Find a block type by id. Returns undefined if not found. */
export function getBlockType(id: string): BlockTypeMeta | undefined {
  return BLOCK_TYPES.find((bt) => bt.id === id);
}
