/**
 * Typed mock seam for the block picker modal. Mirrors the TYPES/CATEGORIES
 * registry in mockups/tadaify-mvp/app-block-picker.html.
 *
 * @implements fr-block-picker-modal
 */

export type BlockCategory = "Links" | "Media" | "Forms" | "Shop" | "Layout";

export type BlockType = {
  id: string;
  label: string;
  icon: string;
  cat: BlockCategory;
  desc: string;
  popular?: boolean;
  isNew?: boolean;
  /** Minimum tier; locks the card below it. */
  tier?: "Pro+";
};

export const blockTypesFixture = (): BlockType[] => [
  { id: "link", label: "Link button", icon: "🔗", cat: "Links", desc: "External URL — YouTube, blog, Spotify, anywhere.", popular: true },
  { id: "image", label: "Image", icon: "🖼", cat: "Media", desc: "Photo with alt text + optional click-through.", popular: true },
  { id: "embed", label: "Embed", icon: "📺", cat: "Media", desc: "Paste a YT, Vimeo, Spotify, TikTok URL — auto-detect." },
  { id: "heading", label: "Heading / text", icon: "📝", cat: "Layout", desc: "Section heading or paragraph with rich text." },
  { id: "divider", label: "Divider", icon: "➖", cat: "Layout", desc: "Solid line, dotted, or empty space — group blocks." },
  { id: "social", label: "Social icons row", icon: "🌐", cat: "Links", desc: "IG / TikTok / YouTube / X / LinkedIn icon strip.", popular: true },
  { id: "newsletter", label: "Newsletter signup", icon: "✉️", cat: "Forms", desc: "Email capture — Mailchimp, ConvertKit, Substack.", popular: true },
  { id: "product", label: "Product", icon: "🛍", cat: "Shop", desc: "Showcase a product from your external store — Shopify, Stripe, Etsy, Gumroad, anywhere." },
  { id: "video", label: "Video", icon: "🎬", cat: "Media", desc: "Direct mp4/webm upload with autoplay + loop." },
  { id: "accordion", label: "FAQ / accordion", icon: "❓", cat: "Layout", desc: "Collapsible Q&A — perfect for support pages." },
  { id: "custom-html", label: "Custom HTML", icon: "</>", cat: "Layout", desc: "Any HTML / CSS / JS. Power-user only.", tier: "Pro+" },
  { id: "countdown", label: "Countdown timer", icon: "⏳", cat: "Layout", desc: "Drives urgency for launches, drops, events.", isNew: true },
];

export type AiSet = { title: string; chips: string[] };

export const aiSetsFixture = (): AiSet[] => [
  { title: "🎵 Music creator starter", chips: ["📺 Latest YT drop", "🔗 Spotify", "🌐 Social row", "✉️ Newsletter"] },
  { title: "💪 Fitness coach launch", chips: ["📝 Heading", "🛍 Workout PDF", "🛍 1:1 coaching", "❓ FAQ", "✉️ Mailing list"] },
  { title: "👥 Agency / talent rep", chips: ["🖼 Logo image", "📝 Roster", "🔗 Booking link", "✉️ Press inquiries"] },
];
