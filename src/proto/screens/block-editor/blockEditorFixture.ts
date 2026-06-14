/**
 * Typed mock seam for the block editor modal. Mirrors the BLOCK_TYPES /
 * ICON_LIBRARY / EMBED_PROVIDERS / NEWSLETTER_PROVIDERS / SOCIAL_PLATFORMS
 * registries in mockups/tadaify-mvp/app-block-editor.html.
 *
 * Presentational data only — every value is a literal the screen renders.
 * Brand icon colours (e.g. Instagram #E4405F) are inherent data and kept
 * here verbatim; they are NOT theme tokens.
 *
 * @implements fr-block-editor-modal
 */

/* ------------------------------------------------------------------ */
/* TIER LADDER                                                        */
/* ------------------------------------------------------------------ */
export type Tier = "free" | "creator" | "pro" | "business";
export const TIER_RANK: Record<Tier, number> = { free: 0, creator: 1, pro: 2, business: 3 };
export const TIER_LABEL: Record<Tier, string> = {
  free: "Free",
  creator: "Creator",
  pro: "Pro",
  business: "Business",
};
export const TIER_PRICE: Record<Tier, string> = {
  free: "$0",
  creator: "$7.99/mo",
  pro: "$19.99/mo",
  business: "$49.99/mo",
};

/* ------------------------------------------------------------------ */
/* FIELD KINDS + BLOCK TYPE DEFINITIONS                               */
/* ------------------------------------------------------------------ */
export type FieldKind =
  | "text"
  | "url"
  | "link-target"
  | "icon-picker"
  | "check"
  | "thumb"
  | "upload"
  | "select"
  | "social-cards"
  | "theme-color-picker"
  | "faq-items"
  | "code"
  | "datetime"
  | "raw-embed-detect"
  | "raw-embed-providers"
  | "raw-newsletter-provider"
  | "raw-newsletter-schedule"
  | "raw-newsletter-ab";

export type FieldDef = {
  kind: FieldKind;
  name: string;
  label?: string;
  value?: unknown;
  help?: string;
  ai?: boolean;
  options?: [string, string][];
  defaultTab?: "external" | "internal";
  readonly?: boolean;
};

export type BlockAnalytics = { today: string; sevenDay: string; source: string; trending?: boolean };

export type BlockTypeDef = {
  id: string;
  label: string;
  icon: string;
  category: "Links" | "Media" | "Forms" | "Shop" | "Layout";
  /** Minimum tier for the whole block type (Custom HTML = Pro). */
  gatedAt?: Tier;
  analytics: BlockAnalytics;
  /** Field list factory — receives the current content state. */
  form: (s: Record<string, unknown>) => FieldDef[];
};

const v = (s: Record<string, unknown>, k: string, d: unknown) => (s[k] !== undefined ? s[k] : d);

export const blockTypesFixture = (): BlockTypeDef[] => [
  {
    id: "link",
    label: "Link button",
    icon: "🔗",
    category: "Links",
    analytics: { today: "128", sevenDay: "1.2k", source: "tiktok", trending: true },
    form: (s) => [
      { kind: "text", name: "label", label: "Button label", value: v(s, "label", "Listen on Spotify"), ai: true, help: "Short and clickable. Use a verb where you can." },
      { kind: "link-target", name: "url", label: "URL", value: v(s, "url", "https://open.spotify.com/artist/0OdUWJ0sBjDrqHygGUXeCF") },
      { kind: "icon-picker", name: "icon", label: "Icon", value: v(s, "icon", "spotify"), help: "Pick a brand logo for social platforms or a generic glyph for any other link." },
      { kind: "check", name: "newtab", label: "Open in new tab", value: s.newtab !== false },
      { kind: "thumb", name: "thumb", label: "Custom thumbnail", value: s.thumb },
    ],
  },
  {
    id: "image",
    label: "Image",
    icon: "🖼",
    category: "Media",
    analytics: { today: "46", sevenDay: "380", source: "instagram" },
    form: (s) => [
      { kind: "upload", name: "src", label: "Image (jpg / png / webp · max 5MB)" },
      { kind: "text", name: "alt", label: "Alt text (accessibility)", value: v(s, "alt", 'Album cover for "Spring Drops"'), help: "Describe the image for screen readers and SEO. Not visible on the public page." },
      { kind: "text", name: "caption", label: "Caption (optional, shown under the image)", value: v(s, "caption", 'Album cover for "Spring Drops"'), ai: true, help: "Visible text shown on the public page, beneath the image." },
      { kind: "link-target", name: "href", label: "Click-through URL (optional)", value: v(s, "href", "") },
      { kind: "text", name: "ctaLabel", label: "CTA label (shown when click-through URL is set)", value: v(s, "ctaLabel", "Listen now"), ai: true, help: 'Small inline link rendered inside the card, e.g. "Listen now", "Buy", "Read".' },
      { kind: "select", name: "aspect", label: "Aspect ratio", options: [["1", "Square 1:1"], ["43", "Standard 4:3"], ["169", "Wide 16:9"], ["rounded", "Rounded card"]], value: v(s, "aspect", "rounded") },
    ],
  },
  {
    id: "embed",
    label: "Embed",
    icon: "📺",
    category: "Media",
    analytics: { today: "92", sevenDay: "760", source: "youtube" },
    form: (s) => [
      { kind: "url", name: "url", label: "Paste a URL", value: v(s, "url", "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"), help: "YouTube, Spotify, TikTok, and 9 more — see the full list at the bottom." },
      { kind: "raw-embed-detect", name: "detectChip" },
      { kind: "text", name: "caption", label: "Caption (optional)", value: v(s, "caption", ""), ai: true, help: "Shown under the embedded card on the public page." },
      { kind: "raw-embed-providers", name: "providerList" },
    ],
  },
  {
    id: "heading",
    label: "Heading / text",
    icon: "📝",
    category: "Layout",
    analytics: { today: "0", sevenDay: "0", source: "—", trending: false },
    form: (s) => [
      { kind: "select", name: "level", label: "Display", options: [["hero", "Hero (largest, display weight)"], ["h1", "Heading 1 (large, bold)"], ["h2", "Heading 2 (medium, bold)"], ["h3", "Heading 3 (small, semibold)"], ["p", "Paragraph (regular text)"]], value: v(s, "level", "h2"), help: "One choice that controls visual size + semantic level. Hero for landing-style page tops; H1–H3 for sections; Paragraph for body copy." },
      { kind: "text", name: "text", label: "Text", value: v(s, "text", "My latest releases"), ai: true },
      { kind: "select", name: "align", label: "Alignment", options: [["left", "Left"], ["center", "Center"], ["right", "Right"]], value: v(s, "align", "center") },
      { kind: "icon-picker", name: "icon", label: "Leading icon (optional)", value: v(s, "icon", ""), help: "Show a small icon next to the text — leave empty for plain text." },
    ],
  },
  {
    id: "divider",
    label: "Divider",
    icon: "➖",
    category: "Layout",
    analytics: { today: "0", sevenDay: "0", source: "—" },
    form: (s) => [
      { kind: "select", name: "style", label: "Style", options: [["line", "Solid line"], ["dotted", "Dotted line"], ["spacer", "Empty space"]], value: v(s, "style", "line") },
      { kind: "select", name: "size", label: "Size", options: [["sm", "Small"], ["md", "Medium"], ["lg", "Large"]], value: v(s, "size", "md") },
      { kind: "theme-color-picker", name: "color", label: "Color", value: v(s, "color", "theme"), help: '"Theme default" follows your chosen theme automatically. Pick a swatch or enter a custom hex to override.' },
    ],
  },
  {
    id: "social",
    label: "Social icons row",
    icon: "🌐",
    category: "Links",
    analytics: { today: "64", sevenDay: "510", source: "pinterest" },
    form: (s) => [
      { kind: "social-cards", name: "handles", label: "Your social platforms", value: s.handles, help: 'Click "+ Add social" to register a platform. Each card lets you pick a per-platform icon style. Drag to reorder.' },
      { kind: "select", name: "shape", label: "Wrapper shape on the public page", options: [["circle", "Circle"], ["square", "Rounded square"], ["none", "No wrapper — bare icons"]], value: v(s, "shape", "circle"), help: 'The chosen icon style still applies — wrapper sits behind it (or is removed for "bare icons").' },
    ],
  },
  {
    id: "newsletter",
    label: "Newsletter signup",
    icon: "✉️",
    category: "Forms",
    analytics: { today: "14", sevenDay: "92", source: "instagram", trending: false },
    form: (s) => [
      { kind: "select", name: "provider", label: "Email provider", options: [["kit", "Kit (ConvertKit)"], ["beehiiv", "Beehiiv"], ["mailerlite", "MailerLite"], ["mailchimp", "Mailchimp"], ["klaviyo", "Klaviyo"], ["google-sheets", "Google Sheets"], ["webhook", "Generic webhook"]], value: v(s, "provider", "kit"), help: "Where new subscribers land. All providers are free on every tadaify plan." },
      { kind: "raw-newsletter-provider", name: "providerPanel" },
      { kind: "text", name: "heading", label: "Form heading", value: v(s, "heading", "Join my list"), ai: true, help: "Big, friendly headline above the email input." },
      { kind: "text", name: "subhead", label: "Subheadline", value: v(s, "subhead", "No spam — one email a week."), ai: true, help: "One short sentence under the heading. Promise something specific." },
      { kind: "text", name: "cta", label: "Button label", value: v(s, "cta", "Subscribe"), ai: true },
      { kind: "icon-picker", name: "ctaIcon", label: "Button icon", value: v(s, "ctaIcon", "send"), help: "Shown to the left of the button label." },
      { kind: "text", name: "placeholder", label: "Input placeholder", value: v(s, "placeholder", "you@email.com") },
      { kind: "text", name: "success", label: "Success message", value: v(s, "success", "Thanks! Check your inbox to confirm."), ai: true, help: "Shown after a visitor signs up." },
      { kind: "raw-newsletter-schedule", name: "scheduleVisibility" },
      { kind: "raw-newsletter-ab", name: "abTest" },
    ],
  },
  {
    id: "product",
    label: "Product",
    icon: "🛍",
    category: "Shop",
    analytics: { today: "38", sevenDay: "210", source: "tiktok" },
    form: (s) => [
      { kind: "text", name: "title", label: "Product title", value: v(s, "title", "Spring drop merch"), ai: true },
      { kind: "text", name: "price", label: "Price (free text — include currency)", value: v(s, "price", "$24"), help: 'Type the price exactly as you want it shown, e.g. "$24", "€19.99", "PLN 79".' },
      { kind: "upload", name: "image", label: "Product image (jpg / png / webp · max 5MB)" },
      { kind: "link-target", name: "url", label: "External product URL (required)", value: v(s, "url", "https://shop.example.com/spring-drop"), defaultTab: "external", help: 'Where shoppers land when they click "Buy". Shopify / Stripe / Etsy / Gumroad / your own store — any URL. You can also link to one of your own pages.' },
      { kind: "text", name: "cta", label: "Buy button label", value: v(s, "cta", "Buy on Shopify"), ai: true, help: 'Tell shoppers where they\'re going, e.g. "Buy on Shopify", "Get yours", "Order now".' },
      { kind: "icon-picker", name: "ctaIcon", label: "Buy button icon", value: v(s, "ctaIcon", "shopping-cart"), help: "A cart, bag, or download glyph reads instantly. Defaults to shopping cart." },
      { kind: "check", name: "showPrice", label: "Show price on card", value: s.showPrice !== false },
    ],
  },
  {
    id: "video",
    label: "Video",
    icon: "🎬",
    category: "Media",
    analytics: { today: "78", sevenDay: "630", source: "youtube" },
    form: (s) => [
      { kind: "url", name: "url", label: "YouTube or Vimeo URL", value: v(s, "url", "https://youtu.be/dQw4w9WgXcQ"), help: "Paste a YouTube or Vimeo link. We embed via youtube-nocookie.com (no tracking cookies, minimal branding)." },
      { kind: "select", name: "provider", label: "Provider", options: [["youtube", "YouTube"], ["vimeo", "Vimeo"]], value: v(s, "provider", "youtube") },
      { kind: "text", name: "caption", label: "Caption", value: v(s, "caption", "Behind the scenes"), ai: true },
    ],
  },
  {
    id: "accordion",
    label: "FAQ / accordion",
    icon: "❓",
    category: "Layout",
    analytics: { today: "22", sevenDay: "180", source: "direct" },
    form: (s) => [
      { kind: "icon-picker", name: "sectionIcon", label: "Section icon (optional)", value: v(s, "sectionIcon", ""), help: "Shown next to the section title above the FAQ." },
      { kind: "faq-items", name: "items", label: "Questions & answers", value: s.items, help: 'Add as many Q&As as you need. Use "+ Add section" to group questions under a header (e.g. "Music", "Shop").' },
    ],
  },
  {
    id: "custom-html",
    label: "Custom HTML",
    icon: "</>",
    category: "Layout",
    gatedAt: "pro",
    analytics: { today: "5", sevenDay: "40", source: "direct" },
    form: (s) => [
      { kind: "code", name: "html", label: "HTML / CSS / JS", value: v(s, "html", '<div style="background:#fff;color:#111;padding:12px;border-radius:10px">\n  <b>Hi from custom HTML.</b>\n</div>') },
    ],
  },
  {
    id: "countdown",
    label: "Countdown timer",
    icon: "⏳",
    category: "Layout",
    analytics: { today: "54", sevenDay: "420", source: "instagram", trending: true },
    form: (s) => [
      { kind: "text", name: "label", label: "Event label", value: v(s, "label", "Next live in"), ai: true },
      { kind: "icon-picker", name: "icon", label: "Label icon", value: v(s, "icon", "flame"), help: "A flame, lightning, or live dot signals urgency. Leave empty for plain text." },
      { kind: "datetime", name: "targetAt", label: "Target date + time", value: v(s, "targetAt", "2026-05-15T19:00") },
      { kind: "select", name: "style", label: "Style", options: [["boxed", "Boxed cells"], ["inline", "Inline text"], ["compact", "Compact pills"], ["flip", "Flip clock"]], value: v(s, "style", "boxed") },
      { kind: "text", name: "linkLabel", label: "Link label (optional)", value: v(s, "linkLabel", ""), help: "Shown below the timer when a link URL is also present.", ai: true },
      { kind: "url", name: "linkUrl", label: "Link URL (optional)", value: v(s, "linkUrl", ""), help: "Must be a valid URL if you want the link to render." },
      { kind: "check", name: "autoHide", label: "Auto-hide after target", value: s.autoHide !== false, help: "When on, the block disappears after the countdown reaches zero." },
      { kind: "text", name: "replacementCopy", label: "Replacement copy (when auto-hide is off)", value: v(s, "replacementCopy", "Live now!"), help: "Shown instead of 0 0 0 0 after the target passes." },
      { kind: "check", name: "scheduleVisibilityEnabled", label: "Schedule visibility (Creator+)", value: !!s.scheduleVisibilityEnabled, help: "Show the countdown only during a creator-defined lead-up window." },
      { kind: "datetime", name: "scheduleStartsAt", label: "Schedule starts at", value: v(s, "scheduleStartsAt", "") },
      { kind: "datetime", name: "scheduleEndsAt", label: "Schedule ends at", value: v(s, "scheduleEndsAt", "") },
    ],
  },
];

/** Content-field keys (top-level keys that participate in A/B variants). */
export const CONTENT_FIELD_KEYS = [
  "label", "url", "icon", "newtab", "thumb",
  "src", "alt", "href", "aspect", "ctaLabel",
  "provider", "caption",
  "level", "text", "align",
  "style", "size", "color",
  "handles", "handlesOrder", "shape",
  "list", "cta", "ctaIcon", "placeholder", "heading", "subhead", "success",
  "scheduleVisibilityEnabled", "scheduleStartsAt", "scheduleEndsAt",
  "title", "price", "image", "showPrice",
  "sectionIcon", "items",
  "html",
  "targetAt", "linkLabel", "linkUrl", "autoHide", "replacementCopy",
];

/** Human labels for the A/B diff card. */
export const AB_DIFF_LABELS: Record<string, string> = {
  label: "Label", url: "URL", icon: "Icon", newtab: "New tab", thumb: "Thumbnail",
  src: "Source", alt: "Alt text", href: "Link", aspect: "Aspect", ctaLabel: "CTA label",
  provider: "Provider", caption: "Caption",
  level: "Heading level", text: "Text", align: "Alignment",
  style: "Style", size: "Size", color: "Color",
  handles: "Social handles", handlesOrder: "Platform order", shape: "Wrapper shape",
  list: "List", cta: "Button label", ctaIcon: "Button icon",
  placeholder: "Placeholder", heading: "Heading", subhead: "Subheadline", success: "Success message",
  title: "Product title", price: "Price", image: "Product image", showPrice: "Show price",
  sectionIcon: "Section icon", items: "Q&A list",
  html: "HTML / CSS / JS",
  targetAt: "Target date + time", linkLabel: "Link label", linkUrl: "Link URL",
  autoHide: "Auto-hide after target", replacementCopy: "Replacement copy",
  scheduleVisibilityEnabled: "Schedule visibility", scheduleStartsAt: "Schedule starts at", scheduleEndsAt: "Schedule ends at",
};

/* ------------------------------------------------------------------ */
/* DEMO BLOCKS (frozen dashboard backdrop)                            */
/* ------------------------------------------------------------------ */
export type DemoBlock = { type: string; label: string; sub: string; clicks: string };
export const demoBlocksFixture = (): DemoBlock[] => [
  { type: "link", label: "Listen on Spotify", sub: "open.spotify.com/artist/...", clicks: "128 today" },
  { type: "embed", label: "My latest YT drop", sub: "youtu.be/dQw4w9WgXcQ", clicks: "92 today" },
  { type: "newsletter", label: "Join my newsletter", sub: "Kit · Main signup form", clicks: "14 today" },
];

/* ------------------------------------------------------------------ */
/* AI COPY SUGGESTIONS                                                */
/* ------------------------------------------------------------------ */
export type AiOption = { lbl: string; text: string };
export const aiOptionsFixture = (): AiOption[] => [
  { lbl: "Punchy", text: "Get my latest drop on Spotify ↗" },
  { lbl: "Friendly", text: "New track is live — give it a listen 🎧" },
  { lbl: "Curious", text: "Wanna hear what I made this week?" },
];
export const AI_QUOTA_HINT = "Monthly AI credits depend on your plan — Free has a small allowance, paid plans more, top tier unlimited.";

/* ------------------------------------------------------------------ */
/* EMBED PROVIDERS (auto-detect whitelist — 12 providers)             */
/* ------------------------------------------------------------------ */
export type EmbedProvider = { id: string; label: string; icon: string; detect: RegExp };
export const embedProvidersFixture = (): EmbedProvider[] => [
  { id: "spotify", label: "Spotify", icon: "🎵", detect: /^https?:\/\/open\.spotify\.com\/(track|album|playlist|episode|show|artist)\/([A-Za-z0-9]+)/ },
  { id: "soundcloud", label: "SoundCloud", icon: "🔊", detect: /^https?:\/\/(?:www\.|m\.)?soundcloud\.com\/([\w-]+\/[\w-]+)/ },
  { id: "bandcamp", label: "Bandcamp", icon: "🎸", detect: /^https?:\/\/([\w-]+)\.bandcamp\.com\/(track|album)\/([\w-]+)/ },
  { id: "apple-podcasts", label: "Apple Podcasts", icon: "🎙", detect: /^https?:\/\/podcasts\.apple\.com\/(?:[a-z]{2}\/)?podcast\/[^/]+\/id(\d+)/ },
  { id: "apple-music", label: "Apple Music", icon: "🍎", detect: /^https?:\/\/music\.apple\.com\/(?:[a-z]{2}\/)?(album|playlist|song)\/[^/]+\/(\d+)/ },
  { id: "youtube", label: "YouTube", icon: "🎬", detect: /^https?:\/\/(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{6,})/ },
  { id: "vimeo", label: "Vimeo", icon: "🎥", detect: /^https?:\/\/(?:www\.|player\.)?vimeo\.com\/(?:video\/)?(\d+)/ },
  { id: "tiktok", label: "TikTok", icon: "🎵", detect: /^https?:\/\/(?:www\.|m\.)?tiktok\.com\/@[\w.-]+\/video\/(\d+)/ },
  { id: "twitter", label: "Twitter / X", icon: "𝕏", detect: /^https?:\/\/(?:www\.)?(?:twitter|x)\.com\/[\w]+\/status\/(\d+)/ },
  { id: "bluesky", label: "Bluesky", icon: "🦋", detect: /^https?:\/\/bsky\.app\/profile\/([\w.-]+)\/post\/([\w]+)/ },
  { id: "instagram", label: "Instagram", icon: "📷", detect: /^https?:\/\/(?:www\.)?instagram\.com\/(?:p|reel|tv)\/([\w-]+)/ },
  { id: "loom", label: "Loom", icon: "📹", detect: /^https?:\/\/(?:www\.)?loom\.com\/share\/([a-f0-9]+)/ },
];

/* ------------------------------------------------------------------ */
/* NEWSLETTER PROVIDERS (6 native + webhook)                          */
/* ------------------------------------------------------------------ */
export type NewsletterProvider = { id: string; name: string; apiKeyHelp?: string; lists?: [string, string][] };
export const newsletterProvidersFixture = (): Record<string, NewsletterProvider> => ({
  kit: { id: "kit", name: "Kit", apiKeyHelp: "Find your API key in Kit → Settings → Advanced.", lists: [["form_alex_main", "Main signup form"], ["form_alex_drops", "New drops alerts"], ["form_alex_vip", "VIP early access"]] },
  beehiiv: { id: "beehiiv", name: "Beehiiv", apiKeyHelp: "Find your API key in Beehiiv → Settings → API.", lists: [["pub_alex_main", "alexandra.beehiiv.com"], ["pub_alex_news", "Alex Weekly"], ["pub_alex_pro", "Pro tier publication"]] },
  mailerlite: { id: "mailerlite", name: "MailerLite", apiKeyHelp: "Find your API key in MailerLite → Integrations → API.", lists: [["grp_alex_main", "Main subscribers"], ["grp_alex_drops", "New release alerts"], ["grp_alex_vip", "VIP list"]] },
  mailchimp: { id: "mailchimp", name: "Mailchimp", apiKeyHelp: "Find your API key in Mailchimp → Account → Extras → API keys.", lists: [["list_alex_main", "Main audience"], ["list_alex_drops", "Drops & releases"], ["list_alex_vip", "VIP & superfans"]] },
  klaviyo: { id: "klaviyo", name: "Klaviyo", apiKeyHelp: "Find your API key in Klaviyo → Settings → API keys.", lists: [["lst_alex_main", "Main list"], ["lst_alex_drops", "New drops"], ["lst_alex_vip", "VIP segment"]] },
});

/* ------------------------------------------------------------------ */
/* SOCIAL PLATFORMS + ICON STYLES                                     */
/* ------------------------------------------------------------------ */
export type SocialPlatform = { id: string; name: string; color: string };
export type IconStyle = { id: string; name: string; hint: string };

export const socialIconStylesFixture = (): IconStyle[] => [
  { id: "brand", name: "Brand color", hint: "Original logo colour" },
  { id: "mono", name: "Monochrome", hint: "Inherits text color (currentColor)" },
  { id: "mono-frame", name: "Mono with frame", hint: "Monochrome with a circle outline" },
  { id: "outline", name: "Outline", hint: "Hollow brand-colour outline" },
  { id: "filled-circle", name: "Filled circle", hint: "White glyph on brand-coloured circle" },
  { id: "filled-square", name: "Filled squircle", hint: "White glyph on brand-coloured rounded square" },
];

export const socialLegacyStylesFixture = (): Record<string, IconStyle[]> => ({
  x: [{ id: "twitter-classic", name: "Classic blue bird", hint: "Pre-rebrand Twitter logo" }],
  instagram: [{ id: "classic-camera", name: "Classic camera", hint: "2010-era camera glyph" }],
  youtube: [{ id: "subscribe-red", name: "Subscribe button", hint: "YouTube subscribe red badge" }],
});

/* ------------------------------------------------------------------ */
/* ICON LIBRARY                                                       */
/*                                                                    */
/* Real impl maps to lucide-react (ISC) + simple-icons (CC0). Brand   */
/* icons fill with their official colour (inherent data); lucide      */
/* icons are monochrome (currentColor stroke). The mockup inlines     */
/* ~126 paths; this fixture ports all 29 social brand glyphs (needed  */
/* by both the icon picker's Social tab and the social-cards feature) */
/* plus a categorised set of lucide glyphs covering every category.   */
/* ------------------------------------------------------------------ */
export type IconCategory = { id: string; label: string };
export const iconCategoriesFixture = (): IconCategory[] => [
  { id: "popular", label: "Popular" },
  { id: "social", label: "Social" },
  { id: "music", label: "Music & Video" },
  { id: "shop", label: "Shop & Money" },
  { id: "communication", label: "Communication" },
  { id: "content", label: "Content" },
  { id: "generic", label: "Generic" },
];

/**
 * The "Popular" tab is a curated id-list (mockup's ICON_POPULAR), not a real
 * category — these glyphs keep their true `cat`, so the Popular view pulls them
 * by id.
 */
export const ICON_POPULAR = [
  "play", "spotify", "instagram", "tiktok", "youtube", "heart",
  "shopping-cart", "mail", "star", "sparkles", "music", "dollar-sign",
  "flame", "crown", "calendar", "gift", "x", "book-open", "map-pin", "rocket",
] as const;

export type IconEntry = {
  id: string;
  name: string;
  kind: "brand" | "lucide";
  cat: string;
  tags: string[];
  body: string;
  color?: string;
};

/* Social brand icons (Simple Icons CC0 — official paths + colours). */
const BRAND_ICONS: IconEntry[] = [
  { id: "instagram", name: "Instagram", kind: "brand", cat: "social", tags: ["photo", "social", "feed", "reels", "stories"], color: "#E4405F", body: '<path d="M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"/>' },
  { id: "tiktok", name: "TikTok", kind: "brand", cat: "social", tags: ["video", "social", "dance", "viral"], color: "#000000", body: '<path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1.84-.1z"/>' },
  { id: "youtube", name: "YouTube", kind: "brand", cat: "social", tags: ["video", "social", "watch", "channel", "tube"], color: "#FF0000", body: '<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>' },
  { id: "x", name: "X (Twitter)", kind: "brand", cat: "social", tags: ["twitter", "social", "tweet", "post"], color: "#000000", body: '<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>' },
  { id: "spotify", name: "Spotify", kind: "brand", cat: "social", tags: ["music", "audio", "streaming", "playlist", "listen"], color: "#1DB954", body: '<path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12C24 5.4 18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z"/>' },
  { id: "applemusic", name: "Apple Music", kind: "brand", cat: "social", tags: ["music", "audio", "streaming", "apple"], color: "#FA243C", body: '<path d="M23.997 6.124c0-.738-.065-1.47-.24-2.19-.317-1.31-1.062-2.31-2.18-3.043C21.003.517 20.373.285 19.703.143 19.18.034 18.65 0 18.122 0H5.892c-.529 0-1.058.034-1.581.143-.67.142-1.301.374-1.875.748C1.32 1.624.575 2.624.257 3.934c-.174.72-.24 1.452-.24 2.19v11.752c0 .738.066 1.47.24 2.19.318 1.31 1.062 2.31 2.18 3.043.575.374 1.205.605 1.875.748.523.108 1.052.143 1.581.143h12.23c.529 0 1.058-.034 1.581-.143.67-.142 1.3-.374 1.875-.748 1.117-.732 1.862-1.732 2.18-3.043.174-.72.24-1.452.24-2.19V6.124zm-6.94 11.62c-.156.728-.66 1.247-1.376 1.46-.378.112-.762.137-1.149.108-.51-.038-.97-.198-1.357-.546-.48-.43-.692-.97-.626-1.616.052-.504.272-.917.673-1.224.412-.315.892-.47 1.39-.55l1.72-.293V8.34c0-.063-.013-.105-.083-.087-.39.105-.797.18-1.197.273-.4.092-.798.184-1.197.276-.47.108-.94.218-1.41.328-.392.092-.785.182-1.18.272-.39.09-.78.18-1.17.27-.39.09-.78.18-1.17.27-.39.09-.78.18-1.17.27v8.93c0 .51-.13.957-.4 1.345-.293.42-.696.7-1.198.81-.378.085-.762.108-1.149.077-.51-.038-.97-.197-1.357-.545-.48-.43-.692-.97-.626-1.617.052-.504.272-.917.673-1.224.412-.315.892-.47 1.39-.55l1.72-.293V6.27c0-.215.045-.42.142-.61.143-.282.36-.466.66-.55l8.95-2.062c.27-.062.51-.05.736.04.227.087.4.244.526.466.108.193.155.398.155.62z"/>' },
  { id: "soundcloud", name: "SoundCloud", kind: "brand", cat: "social", tags: ["music", "audio", "streaming", "upload"], color: "#FF5500", body: '<path d="M23.999 14.165c-.052 1.796-1.612 3.169-3.4 3.165h-8.18a.68.68 0 0 1-.675-.683V7.82a.747.747 0 0 1 .452-.724s.75-.513 2.333-.513a5.364 5.364 0 0 1 2.745.755 5.46 5.46 0 0 1 2.674 4.2c.279-.092.57-.14.864-.139 1.572 0 3.236 1.292 3.187 2.766zm-12.834 3.165h-.677a.69.69 0 0 1-.674-.682V7.749a.704.704 0 0 1 .674-.683h.677a.679.679 0 0 1 .674.683v8.899a.679.679 0 0 1-.674.682zm-2.378 0h-.652a.674.674 0 0 1-.665-.682V8.245a.674.674 0 0 1 .665-.682h.652a.681.681 0 0 1 .665.682v8.4a.681.681 0 0 1-.665.685zm-2.359 0h-.624a.659.659 0 0 1-.648-.682V9.224a.66.66 0 0 1 .647-.683h.625a.668.668 0 0 1 .647.683v7.421a.667.667 0 0 1-.647.685zm-2.337-.396a.55.55 0 0 1-.526-.55v-5.84a.567.567 0 0 1 .526-.566.566.566 0 0 1 .525.567v5.839a.55.55 0 0 1-.525.55zm-1.776-.755a.398.398 0 0 1-.398-.4v-3.484a.4.4 0 0 1 .398-.402.402.402 0 0 1 .398.402v3.484a.4.4 0 0 1-.398.4z"/>' },
  { id: "twitch", name: "Twitch", kind: "brand", cat: "social", tags: ["stream", "live", "game", "social"], color: "#9146FF", body: '<path d="M11.571 4.714h1.715v5.143H11.57zm4.715 0H18v5.143h-1.714zM6 0L1.714 4.286v15.428h5.143V24l4.286-4.286h3.428L22.286 12V0zm14.571 11.143l-3.428 3.428h-3.429l-3 3v-3H6.857V1.714h13.714Z"/>' },
  { id: "patreon", name: "Patreon", kind: "brand", cat: "social", tags: ["membership", "subscribe", "support", "crowdfund"], color: "#F96854", body: '<path d="M0 .48v23.04h4.22V.48zm15.385 0c-4.764 0-8.641 3.88-8.641 8.65 0 4.755 3.877 8.623 8.641 8.623C20.135 17.753 24 13.885 24 9.13 24 4.36 20.135.48 15.385.48z"/>' },
  { id: "substack", name: "Substack", kind: "brand", cat: "social", tags: ["newsletter", "blog", "email", "subscribe"], color: "#FF6719", body: '<path d="M22.539 8.242H1.46V5.406h21.08v2.836zM1.46 10.812V24L12 18.11 22.54 24V10.812zM22.54 0H1.46v2.836h21.08z"/>' },
  { id: "discord", name: "Discord", kind: "brand", cat: "social", tags: ["chat", "community", "voice", "social"], color: "#5865F2", body: '<path d="M20.317 4.37a19.79 19.79 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>' },
  { id: "telegram", name: "Telegram", kind: "brand", cat: "social", tags: ["chat", "message", "social"], color: "#26A5E4", body: '<path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>' },
  { id: "whatsapp", name: "WhatsApp", kind: "brand", cat: "social", tags: ["chat", "message", "call"], color: "#25D366", body: '<path d="M.057 24l1.687-6.163a11.867 11.867 0 0 1-1.587-5.946C.16 5.335 5.495 0 12.05 0a11.817 11.817 0 0 1 8.413 3.488 11.824 11.824 0 0 1 3.48 8.414c-.003 6.557-5.338 11.892-11.893 11.892a11.9 11.9 0 0 1-5.688-1.448L.057 24zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.71.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>' },
  { id: "facebook", name: "Facebook", kind: "brand", cat: "social", tags: ["social", "meta", "feed"], color: "#1877F2", body: '<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>' },
  { id: "linkedin", name: "LinkedIn", kind: "brand", cat: "social", tags: ["professional", "social", "career", "work"], color: "#0A66C2", body: '<path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.063 2.063 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>' },
  { id: "pinterest", name: "Pinterest", kind: "brand", cat: "social", tags: ["inspiration", "social", "board", "pin"], color: "#BD081C", body: '<path d="M12.017.001C5.396 0 .029 5.367.022 11.987c0 5.083 3.16 9.421 7.627 11.165-.105-.949-.2-2.405.042-3.441.218-.937 1.407-5.965 1.407-5.965s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.747-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146C9.57 23.812 10.763 24 12 24c6.624 0 11.99-5.367 11.99-11.987C24.007 5.367 18.641.001 12.017.001z"/>' },
  { id: "reddit", name: "Reddit", kind: "brand", cat: "social", tags: ["social", "community", "forum"], color: "#FF4500", body: '<path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12.5c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>' },
  { id: "snapchat", name: "Snapchat", kind: "brand", cat: "social", tags: ["social", "photo", "message"], color: "#FFFC00", body: '<path d="M12.166 0c-3.45.082-5.97 2.585-6.043 6.034-.013.7-.013 1.394 0 2.07a3.205 3.205 0 0 0-.95-.288 1.79 1.79 0 0 0-.55.063c-.6.187-1.063.71-1.063 1.387 0 .888.475 1.45 1.225 1.95.275.187.625.337.95.45.075.025.137.062.187.087-.037.15-.137.388-.225.563-.6 1.213-1.787 2.012-2.85 2.55-.45.225-.812.45-1.025.7-.275.337-.225.762.025 1.075.4.512 1.275.575 1.875.575.087 0 .175 0 .262.012.075.012.137.025.2.05.137.288.075.7.025 1.038-.05.4.012.762.387.95.45.225 1.137.137 1.75.137.337 0 .687-.012 1.025.05.337.063.612.225.937.413.6.337 1.337.762 2.575.762 1.225 0 2-.425 2.6-.75.337-.187.625-.35.962-.412.337-.063.687-.05 1.025-.05.612 0 1.3.087 1.75-.138.375-.187.437-.55.387-.95-.05-.337-.112-.75.025-1.037.062-.025.137-.05.213-.05.087 0 .175 0 .262-.013.6 0 1.475-.062 1.875-.575.25-.312.3-.737.025-1.075-.213-.25-.575-.475-1.025-.7-1.063-.537-2.25-1.337-2.85-2.55-.087-.187-.187-.412-.225-.562.05-.025.112-.05.187-.087.325-.113.675-.25.95-.45.75-.5 1.225-1.062 1.225-1.95 0-.7-.475-1.225-1.075-1.412a1.788 1.788 0 0 0-.55-.063c-.337.025-.65.125-.95.288.013-.687.013-1.375 0-2.075C18.137 2.585 15.616.082 12.166 0z"/>' },
  { id: "threads", name: "Threads", kind: "brand", cat: "social", tags: ["social", "meta", "text"], color: "#000000", body: '<path d="M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.78 3.631 2.695 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 0 1 3.02.142c-.126-.742-.375-1.332-.75-1.757-.513-.586-1.308-.883-2.359-.89h-.029c-.844 0-1.992.232-2.721 1.32L7.734 7.847c.98-1.454 2.568-2.256 4.478-2.256h.044c3.196.02 5.1 1.954 5.29 5.34.108.046.216.094.32.143 1.49.7 2.58 1.761 3.156 3.07.804 1.83.878 4.812-1.548 7.188-1.85 1.81-4.094 2.628-7.277 2.65Zm1.003-11.69c-.242 0-.487.007-.739.021-1.836.103-2.98.946-2.916 2.143.067 1.256 1.452 1.839 2.784 1.767 1.224-.065 2.818-.543 3.086-3.71a10.5 10.5 0 0 0-2.215-.221z"/>' },
  { id: "mastodon", name: "Mastodon", kind: "brand", cat: "social", tags: ["social", "federated", "open"], color: "#6364FF", body: '<path d="M23.268 5.313c-.35-2.578-2.617-4.61-5.304-5.004C17.51.242 15.792 0 11.813 0h-.03c-3.98 0-4.835.242-5.288.309C3.882.692 1.496 2.518.917 5.127.64 6.412.61 7.837.661 9.143c.074 1.874.088 3.745.26 5.611.118 1.24.325 2.47.62 3.68.55 2.237 2.777 4.098 4.96 4.857 2.336.792 4.849.923 7.256.38.265-.061.527-.132.786-.213.585-.184 1.27-.39 1.774-.753a.057.057 0 0 0 .023-.043v-1.809a.052.052 0 0 0-.02-.041.053.053 0 0 0-.046-.01 20.282 20.282 0 0 1-4.709.545c-2.73 0-3.463-1.284-3.674-1.818a5.593 5.593 0 0 1-.319-1.433.053.053 0 0 1 .066-.054c1.517.363 3.072.546 4.632.546.376 0 .75 0 1.125-.01 1.57-.044 3.224-.124 4.768-.422.038-.008.077-.015.11-.024 2.435-.464 4.753-1.92 4.989-5.604.008-.145.03-1.52.03-1.67.002-.512.167-3.63-.024-5.545zm-3.748 9.195h-2.561V8.29c0-1.309-.55-1.976-1.67-1.976-1.23 0-1.846.79-1.846 2.35v3.403h-2.546V8.663c0-1.56-.617-2.35-1.848-2.35-1.112 0-1.668.668-1.67 1.977v6.218H4.822V8.102c0-1.31.337-2.35 1.011-3.12.696-.77 1.608-1.164 2.74-1.164 1.311 0 2.302.5 2.962 1.498l.638 1.06.638-1.06c.66-.999 1.65-1.498 2.96-1.498 1.13 0 2.043.395 2.74 1.164.675.77 1.012 1.81 1.012 3.12z"/>' },
  { id: "bluesky", name: "Bluesky", kind: "brand", cat: "social", tags: ["social", "open", "federated"], color: "#0085FF", body: '<path d="M12 10.8c-1.087-2.114-4.046-6.053-6.798-7.995C2.566.944 1.561 1.266.902 1.565.139 1.908 0 3.08 0 3.768c0 .69.378 5.65.624 6.479.815 2.736 3.713 3.66 6.383 3.364.136-.02.275-.039.415-.056-.138.022-.276.04-.415.056-3.912.58-7.387 2.005-2.83 7.078 5.013 5.19 6.87-1.113 7.823-4.308.953 3.195 2.05 9.271 7.733 4.308 4.267-4.308 1.172-6.498-2.74-7.078a8.741 8.741 0 0 1-.415-.056c.14.017.279.036.415.056 2.67.297 5.568-.628 6.383-3.364.246-.828.624-5.79.624-6.478 0-.69-.139-1.861-.902-2.206-.659-.298-1.664-.62-4.3 1.24C16.046 4.748 13.087 8.687 12 10.8Z"/>' },
  { id: "github", name: "GitHub", kind: "brand", cat: "social", tags: ["code", "dev", "repo", "open-source"], color: "#181717", body: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/>' },
  { id: "gumroad", name: "Gumroad", kind: "brand", cat: "social", tags: ["shop", "sell", "digital", "creator"], color: "#FF90E8", body: '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.628 0 12-5.373 12-12 0-6.627-5.372-12-12-12zm.624 17.5c-3.066 0-5.624-2.247-5.624-5.812 0-3.49 2.32-6.188 5.875-6.188 3.066 0 5.243 1.945 5.494 4.69h-2.943c-.156-1.27-1.158-2.184-2.55-2.184-2.044 0-3.092 1.704-3.092 3.795 0 2.092 1.114 3.74 3.092 3.74 1.392 0 2.353-.873 2.55-2.247h-2.252V11.27h5.247v6.23h-1.835l-.247-1.464c-.745.917-1.957 1.464-3.715 1.464z"/>' },
  { id: "kofi", name: "Ko-fi", kind: "brand", cat: "social", tags: ["support", "tip", "coffee", "donate"], color: "#FF5E5B", body: '<path d="M11.351 2.715c-2.7 0-4.986.025-6.83.26C2.078 3.285 0 5.154 0 8.61c0 3.506.182 6.13 1.585 8.493 1.584 2.65 4.103 3.466 6.336 3.62.78.054 1.61.078 2.473.078 3.792 0 6.989-.495 8.832-2.286 1.246-1.193 1.61-2.7 1.715-4.467 2.7-.34 3.06-3.197 3.06-4.337 0-1.428-.8-3.962-3.532-3.962-.39 0-.755 0-1.197.025-.078-.39-.155-.78-.286-1.117-.65-1.741-2.494-2.236-3.95-2.31-1.298-.066-2.494-.039-3.65-.039zM10.961 6c.78 0 .78.83 0 .83s-.78-.83 0-.83zm-2.181.026c.78 0 .78.83 0 .83s-.78-.83 0-.83zm10.157.546c.207 0 1.428.078 1.428 1.272 0 .754-.546 1.04-.624 1.04-.026 0-.026 0-.026.025-.13.04-.26.066-.39.105-.156.05-.312.078-.494.105 0-.835.038-1.69.105-2.547zm-7.689 1.404c.755 0 1.404.62 1.404 1.4 0 .39-.156.752-.39 1.011l-3.196 3.376a.65.65 0 0 1-.49.207.65.65 0 0 1-.49-.207L4.96 10.37a1.39 1.39 0 0 1-.39-1.011c0-.78.6-1.4 1.405-1.4.39 0 .755.156 1.012.41l1.117 1.144 1.117-1.143c.282-.255.652-.41 1.013-.41z"/>' },
  { id: "buymeacoffee", name: "Buy Me a Coffee", kind: "brand", cat: "social", tags: ["support", "tip", "coffee", "donate"], color: "#FFDD00", body: '<path d="M20.216 6.415l-.132-.666c-.119-.598-.388-1.163-1.001-1.379-.197-.069-.42-.098-.57-.241-.152-.143-.196-.366-.231-.572-.065-.378-.125-.756-.192-1.133-.057-.325-.102-.69-.25-.987-.195-.4-.597-.634-.996-.788a5.723 5.723 0 0 0-.626-.194c-1-.263-2.05-.36-3.077-.416a25.834 25.834 0 0 0-3.7.062c-.915.083-1.88.184-2.75.5-.318.116-.646.256-.888.501-.297.302-.393.77-.177 1.146.154.267.415.456.692.58.36.162.737.284 1.123.366 1.075.238 2.189.331 3.287.37 1.218.05 2.437.01 3.65-.118.299-.033.598-.073.896-.119.352-.054.578-.513.474-.834-.124-.383-.457-.531-.834-.473-.466.074-.96.108-1.382.146-1.177.08-2.358.082-3.536.006a22.228 22.228 0 0 1-1.157-.107c-.086-.01-.18-.025-.258-.036-.243-.036-.484-.08-.724-.13-.111-.027-.111-.185 0-.212h.005c.277-.06.557-.108.838-.147h.002c.131-.009.263-.032.394-.048a25.076 25.076 0 0 1 3.426-.12c.674.019 1.347.067 2.017.144l.228.031c.267.04.533.088.798.145.392.085.895.113 1.07.542.055.137.08.288.111.431l.319 1.484a.237.237 0 0 1-.199.284h-.003c-.037.006-.075.01-.112.015a36.704 36.704 0 0 1-4.743.295 37.059 37.059 0 0 1-4.699-.304c-.14-.017-.293-.042-.417-.06-.326-.048-.649-.108-.973-.161-.393-.065-.768-.032-1.123.161-.29.16-.527.404-.675.701-.154.316-.199.66-.267 1-.069.34-.176.707-.135 1.056.087.753.613 1.365 1.37 1.502a39.69 39.69 0 0 0 11.343.376.483.483 0 0 1 .535.53l-.071.697-1.018 9.907c-.041.41-.047.832-.125 1.237-.122.637-.553 1.028-1.182 1.171-.577.131-1.165.2-1.756.205-.656.004-1.31-.025-1.966-.022-.699.004-1.556-.06-2.095-.58-.475-.458-.54-1.174-.605-1.793l-.731-7.013-.322-3.094c-.037-.351-.286-.695-.678-.678-.336.015-.718.3-.678.679l.228 2.185.949 9.112c.147 1.344 1.174 2.068 2.446 2.272.742.12 1.503.144 2.257.156.966.016 1.942.053 2.892-.122 1.408-.258 2.465-1.198 2.616-2.657.34-3.332.683-6.663 1.024-9.995l.215-2.087a.484.484 0 0 1 .39-.426c.402-.078.787-.212 1.074-.518.455-.488.546-1.124.385-1.766zm-1.478.772c-.145.137-.363.201-.578.233-2.416.359-4.866.54-7.308.46-1.748-.06-3.477-.254-5.207-.498-.17-.024-.353-.055-.47-.18-.22-.236-.111-.71-.054-.995.052-.26.152-.609.463-.646.484-.057 1.046.148 1.526.22.577.088 1.156.159 1.737.212 2.48.226 5.002.19 7.472-.14.45-.06.899-.13 1.345-.21.399-.072.84-.206 1.08.206.166.281.188.657.162.974a.544.544 0 0 1-.169.364zm-6.159 3.9c-.862.37-1.84.788-3.109.788a5.884 5.884 0 0 1-1.569-.217l.877 9.004c.065.78.717 1.38 1.5 1.38 0 0 1.243.065 1.658.065.447 0 1.786-.065 1.786-.065.783 0 1.434-.6 1.499-1.38l.94-9.95a3.996 3.996 0 0 0-1.322-.238c-.826 0-1.491.284-2.26.613z"/>' },
  { id: "paypal", name: "PayPal", kind: "brand", cat: "social", tags: ["payment", "money", "transfer", "checkout"], color: "#003087", body: '<path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944.901C5.026.382 5.474 0 5.998 0h7.46c2.57 0 4.578.543 5.69 1.81 1.01 1.15 1.304 2.42 1.012 4.287-.023.143-.047.288-.077.437-.983 5.05-4.349 6.797-8.647 6.797h-2.19c-.524 0-.968.382-1.05.9l-1.12 7.106zm14.146-14.42a3.35 3.35 0 0 0-.607-.541c-.013.076-.026.175-.041.254-.59 3.025-2.566 4.78-5.788 5.642a23.49 23.49 0 0 1-3.456.485l-1.65 5.09c-.06.18-.083.366-.046.55l1.205 7.624a.642.642 0 0 0 .633.74h4.305c.46 0 .85-.334.922-.788.06-.262.812-5.15.846-5.36a.929.929 0 0 1 .92-.78h.58c3.76 0 6.705-1.528 7.565-5.946.36-1.847.174-3.388-.78-4.476a3.65 3.65 0 0 0-.607-.494z"/>' },
  { id: "stripe", name: "Stripe", kind: "brand", cat: "social", tags: ["payment", "money", "checkout"], color: "#635BFF", body: '<path d="M13.479 9.883c-1.626-.604-2.512-1.067-2.512-1.803 0-.622.511-.977 1.423-.977 1.667 0 3.379.642 4.558 1.22l.666-4.111c-.935-.446-2.847-1.177-5.49-1.177-1.87 0-3.425.489-4.536 1.401-1.155.96-1.756 2.34-1.756 4.005 0 3.018 1.847 4.312 4.847 5.403 1.936.688 2.579 1.179 2.579 1.937 0 .754-.629 1.176-1.802 1.176-1.4 0-3.713-.687-5.226-1.575l-.667 4.155C5.74 19.482 7.751 20 9.872 20c2.137 0 3.794-.491 4.928-1.443 1.288-1.066 1.957-2.643 1.957-4.628 0-3.079-1.872-4.358-4.978-5.491l-.3-.555z"/>' },
  { id: "amazon", name: "Amazon", kind: "brand", cat: "social", tags: ["shop", "buy", "marketplace"], color: "#FF9900", body: '<path d="M.045 18.02c.072-.116.187-.124.348-.022 3.636 2.11 7.594 3.166 11.87 3.166 2.852 0 5.668-.533 8.447-1.595l.315-.14c.138-.06.234-.1.293-.13.226-.088.39-.046.525.13.12.174.09.336-.12.48-.256.19-.6.41-1.006.654-1.244.743-2.64 1.316-4.185 1.726a17.617 17.617 0 0 1-4.13.5c-2.64 0-5.13-.46-7.474-1.376-2.343-.916-4.464-2.226-6.36-3.93-.105-.085-.157-.176-.157-.27 0-.05.018-.1.045-.155zm6.795-8.43c0-1.234.305-2.27.92-3.114.612-.846 1.443-1.487 2.49-1.92.96-.395 2.135-.676 3.526-.846.473-.057 1.247-.13 2.325-.215v-.45c0-1.13-.124-1.882-.375-2.272-.376-.526-.97-.79-1.78-.79l-.225.012c-.586.05-1.092.232-1.518.554-.426.32-.69.77-.81 1.354-.075.376-.27.59-.57.645l-3.276-.412c-.15-.044-.27-.115-.36-.247-.09-.13-.135-.27-.135-.42 0-.045.022-.232.067-.554.23-1.265.945-2.205 2.144-2.82C10.343.234 11.795 0 13.2 0c2.836 0 4.748.42 5.738 1.275l.45.45c.404.42.682.84.832 1.275.15.435.225.916.225 1.444v6.9c0 .49.075.96.225 1.41.15.45.348.825.6 1.125l.404.495c.075.105.105.205.105.295 0 .105-.045.195-.135.27-1.605 1.49-2.55 2.295-2.85 2.475-.276.165-.61.18-1.02.045a14.34 14.34 0 0 1-.69-.78l-.69-.93a17.04 17.04 0 0 1-1.41 1.515c-.96.92-2.115 1.38-3.45 1.38-1.65 0-2.99-.51-4.05-1.515-1.05-1.005-1.575-2.43-1.575-4.275 0-1.275.345-2.376 1.035-3.3.69-.93 1.65-1.62 2.88-2.085.66-.255 1.62-.45 2.85-.6.435-.045 1.155-.12 2.16-.21v-.42c0-1.05-.105-1.755-.315-2.115-.36-.45-.93-.675-1.71-.675h-.18a3.6 3.6 0 0 0-1.395.435c-.42.27-.69.75-.81 1.43-.09.4-.27.63-.6.69l-3.114-.376c-.405-.06-.6-.27-.6-.6l.015-.21z"/>' },
  { id: "etsy", name: "Etsy", kind: "brand", cat: "social", tags: ["shop", "marketplace", "craft", "handmade"], color: "#F16521", body: '<path d="M9.16 5.359v5.443s1.92.014 2.928-.018c.79-.062 1.043-.14 1.198-1.435h.526v3.605h-.534c-.142-1.196-.342-1.388-1.165-1.45l-2.952-.018v4.473c0 .647.327.951 1.082.951h2.604c.804 0 1.595-.063 2.043-1.114l.61-1.405h.49c-.04.286-.34 2.974-.41 3.609H6.14v-.494c1.255-.241 1.508-.314 1.508-1.182V7.052c0-.876-.247-.94-1.508-1.18v-.495h12.07c.014.232.225 2.694.342 3.475h-.547c-.255-.992-.59-1.83-.917-2.235-.34-.385-.717-.704-2.043-.704H9.49c-.246 0-.33.083-.33.327v-.881z" transform="translate(0 0)"/>' },
  { id: "vimeo", name: "Vimeo", kind: "brand", cat: "social", tags: ["video", "watch", "film"], color: "#1AB7EA", body: '<path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>' },
  { id: "dribbble", name: "Dribbble", kind: "brand", cat: "social", tags: ["design", "social", "portfolio"], color: "#EA4C89", body: '<path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12c6.628 0 12-5.373 12-12 0-6.627-5.372-12-12-12zm9.885 11.441c-2.575-.422-4.943-.445-7.103-.073-.244-.563-.497-1.125-.767-1.68 2.31-1 4.165-2.358 5.548-4.082 1.35 1.594 2.197 3.619 2.322 5.835zm-3.842-7.282c-1.205 1.554-2.868 2.783-4.986 3.68-1.016-1.861-2.178-3.676-3.488-5.438.779-.197 1.591-.314 2.431-.314 2.275 0 4.368.779 6.043 2.072zM7.638 1.745c1.337 1.788 2.535 3.626 3.594 5.515-2.973.79-6.354 1.187-10.122 1.187-.314 0-.625-.005-.934-.013.738-2.93 2.715-5.354 5.34-6.683.708.042 1.405.122 2.122.245v-.251zM1.064 12.001c0-.169.005-.336.014-.502.379.013.748.022 1.114.022 4.072 0 7.776-.42 11.103-1.262.244.5.476.998.692 1.495-3.715 1.157-6.95 3.346-9.704 6.572-1.999-1.781-3.219-4.406-3.219-7.325zm3.989 8.1c2.643-3.094 5.693-5.182 9.146-6.273.962 2.504 1.7 5.085 2.211 7.747-1.295.534-2.703.832-4.181.832-2.815 0-5.395-1.156-7.176-3.058v.752zm14.044-.652c-.485-2.426-1.171-4.797-2.057-7.098 1.943-.297 4.058-.219 6.349.234-.484 2.84-2.061 5.301-4.292 6.864z"/>' },
  { id: "behance", name: "Behance", kind: "brand", cat: "social", tags: ["design", "social", "portfolio"], color: "#1769FF", body: '<path d="M6.938 4.503c.702 0 1.34.06 1.92.188.577.13 1.07.33 1.485.61.41.28.733.65.96 1.12.225.47.34 1.05.34 1.73 0 .74-.17 1.36-.507 1.86-.338.5-.837.9-1.502 1.22.906.26 1.576.72 2.022 1.37.448.66.665 1.45.665 2.36 0 .75-.13 1.39-.41 1.93-.28.55-.67 1-1.16 1.35-.48.348-1.05.6-1.67.767-.61.165-1.252.254-1.91.254H0V4.51zm-.355 5.836c.51 0 .94-.12 1.27-.359.32-.24.49-.628.49-1.169 0-.302-.052-.55-.16-.72-.108-.18-.252-.32-.43-.412a1.95 1.95 0 0 0-.62-.207c-.231-.044-.469-.06-.71-.06H3.394v2.93h3.19zm.193 6.13c.273 0 .533-.025.78-.083.247-.05.46-.13.65-.243.18-.11.34-.27.4-.464.12-.21.18-.46.18-.77 0-.62-.18-1.07-.52-1.34-.355-.27-.812-.4-1.387-.4H3.39v3.32h3.386zm10.54-.203c.47.453 1.155.68 2.054.68.643 0 1.196-.16 1.66-.484.466-.32.75-.66.852-1.02h2.69c-.43 1.34-1.087 2.296-1.973 2.872-.886.578-1.96.864-3.218.864-.872 0-1.66-.137-2.363-.413a4.92 4.92 0 0 1-1.797-1.184c-.49-.51-.873-1.122-1.135-1.834-.266-.71-.4-1.493-.4-2.34 0-.82.13-1.582.41-2.29.268-.706.66-1.32 1.16-1.84.5-.52 1.1-.93 1.792-1.23.7-.3 1.473-.45 2.323-.45.945 0 1.78.184 2.493.55.71.367 1.30.853 1.78 1.46.477.61.82 1.302 1.034 2.082.21.78.288 1.59.235 2.43h-7.49c0 .87.215 1.57.685 2.026zm3.63-5.5c-.376-.412-.95-.62-1.71-.62-.5 0-.91.085-1.232.255-.32.17-.58.376-.78.624-.2.246-.34.51-.42.78-.087.275-.137.515-.157.74h4.625c-.07-.726-.32-1.27-.7-1.68zm-3.875-6.7h5.815v1.41h-5.81V4.07z"/>' },
];

/* Lucide monochrome glyphs — categorised across the remaining tabs. */
const lucide = (id: string, name: string, cat: string, tags: string[], body: string): IconEntry => ({ id, name, kind: "lucide", cat, tags, body });
const LUCIDE_ICONS: IconEntry[] = [
  lucide("play", "Play", "music", ["video", "start", "listen", "watch"], '<polygon points="6 3 21 12 6 21 6 3"/>'),
  lucide("pause", "Pause", "music", ["stop", "video", "audio"], '<rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/>'),
  lucide("square", "Stop", "music", ["stop", "square", "video"], '<rect x="4" y="4" width="16" height="16" rx="2"/>'),
  lucide("skip-forward", "Skip forward", "music", ["next", "video", "audio", "track"], '<polygon points="5 4 15 12 5 20 5 4"/><line x1="19" y1="5" x2="19" y2="19"/>'),
  lucide("skip-back", "Skip back", "music", ["previous", "video", "audio", "track"], '<polygon points="19 20 9 12 19 4 19 20"/><line x1="5" y1="19" x2="5" y2="5"/>'),
  lucide("music", "Music note", "music", ["song", "audio", "melody", "note"], '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>'),
  lucide("music-2", "Music alt", "music", ["song", "audio", "melody"], '<circle cx="8" cy="18" r="4"/><path d="M12 18V2l7 4"/>'),
  lucide("headphones", "Headphones", "music", ["audio", "listen", "music"], '<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'),
  lucide("mic", "Microphone", "music", ["record", "podcast", "voice", "audio"], '<path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/>'),
  lucide("radio", "Radio", "music", ["broadcast", "podcast", "audio"], '<circle cx="12" cy="12" r="2"/><path d="M16.24 7.76a6 6 0 0 1 0 8.49m-8.48-.01a6 6 0 0 1 0-8.49m11.31-2.82a10 10 0 0 1 0 14.14m-14.14 0a10 10 0 0 1 0-14.14"/>'),
  lucide("podcast", "Podcast", "music", ["audio", "show", "broadcast"], '<circle cx="12" cy="12" r="2"/><path d="M16.85 18.58a9 9 0 1 0-9.7 0"/><path d="M8 14a5 5 0 1 1 8 0"/><circle cx="12" cy="12" r="1"/><path d="M13 17a1 1 0 1 0-2 0l.5 4.5a.5.5 0 0 0 1 0Z"/>'),
  lucide("film", "Film", "music", ["video", "movie", "cinema"], '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>'),
  lucide("video", "Video", "music", ["camera", "recording", "film"], '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>'),
  lucide("camera", "Camera", "music", ["photo", "picture", "image"], '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>'),
  lucide("image", "Image", "music", ["photo", "picture", "gallery"], '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>'),
  lucide("images", "Gallery", "music", ["photo", "album", "collection"], '<rect x="3" y="3" width="18" height="14" rx="2" ry="2"/><polyline points="3 17 9 11 13 15 21 7"/><line x1="3" y1="21" x2="21" y2="21"/>'),
  lucide("volume", "Volume", "music", ["sound", "audio", "speaker"], '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"/>'),
  lucide("volume-x", "Mute", "music", ["silent", "sound", "audio"], '<polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/>'),
  lucide("rewind", "Rewind", "music", ["back", "video", "audio"], '<polygon points="11 19 2 12 11 5 11 19"/><polygon points="22 19 13 12 22 5 22 19"/>'),
  lucide("fast-forward", "Fast forward", "music", ["next", "video", "audio"], '<polygon points="13 19 22 12 13 5 13 19"/><polygon points="2 19 11 12 2 5 2 19"/>'),
  lucide("shopping-cart", "Shopping cart", "shop", ["cart", "buy", "store", "ecommerce", "checkout"], '<circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>'),
  lucide("shopping-bag", "Shopping bag", "shop", ["bag", "buy", "store", "retail"], '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/>'),
  lucide("store", "Store", "shop", ["shop", "retail", "market"], '<path d="M3 9l3-7h12l3 7"/><path d="M3 9v11a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V9"/><path d="M3 9h18"/>'),
  lucide("package", "Package", "shop", ["box", "ship", "delivery", "product"], '<line x1="16.5" y1="9.4" x2="7.5" y2="4.21"/><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  lucide("credit-card", "Credit card", "shop", ["payment", "money", "card", "checkout"], '<rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>'),
  lucide("wallet", "Wallet", "shop", ["money", "payment", "cash"], '<path d="M21 12V7H5a2 2 0 0 1 0-4h14v4"/><path d="M3 5v14a2 2 0 0 0 2 2h16v-5"/><path d="M18 12a2 2 0 0 0 0 4h4v-4Z"/>'),
  lucide("dollar-sign", "Dollar", "shop", ["money", "price", "usd", "cash"], '<line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>'),
  lucide("euro", "Euro", "shop", ["money", "price", "currency", "eur"], '<path d="M4 10h12M4 14h9M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2"/>'),
  lucide("gift", "Gift", "shop", ["present", "box", "reward", "bonus"], '<polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><line x1="12" y1="22" x2="12" y2="7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/>'),
  lucide("tag", "Tag", "shop", ["label", "price", "sale", "category"], '<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>'),
  lucide("percent", "Percent", "shop", ["discount", "sale", "offer", "off"], '<line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/>'),
  lucide("receipt", "Receipt", "shop", ["invoice", "bill", "order"], '<path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z"/><path d="M16 8H8M16 12H8M13 16H8"/>'),
  lucide("banknote", "Banknote", "shop", ["money", "cash", "bill"], '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>'),
  lucide("box", "Box", "shop", ["package", "ship", "order"], '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>'),
  lucide("truck", "Truck", "shop", ["ship", "delivery", "transport"], '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>'),
  lucide("mail", "Email", "communication", ["email", "message", "contact", "inbox"], '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>'),
  lucide("send", "Send", "communication", ["submit", "email", "message"], '<line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>'),
  lucide("message-circle", "Chat bubble", "communication", ["chat", "message", "comment", "talk"], '<path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>'),
  lucide("message-square", "Message", "communication", ["chat", "message", "comment"], '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>'),
  lucide("phone", "Phone", "communication", ["call", "contact", "telephone"], '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  lucide("phone-call", "Phone call", "communication", ["call", "contact", "ringing"], '<path d="M15.05 5A5 5 0 0 1 19 8.95M15.05 1A9 9 0 0 1 23 8.94m-1 7.98v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>'),
  lucide("calendar", "Calendar", "communication", ["date", "schedule", "event", "time"], '<rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/>'),
  lucide("clock", "Clock", "communication", ["time", "schedule", "hour"], '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>'),
  lucide("bell", "Bell", "communication", ["notify", "alert", "reminder"], '<path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>'),
  lucide("at-sign", "At sign", "communication", ["email", "contact", "handle"], '<circle cx="12" cy="12" r="4"/><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-3.92 7.94"/>'),
  lucide("inbox", "Inbox", "communication", ["mail", "message", "email"], '<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>'),
  lucide("rss", "RSS", "communication", ["feed", "subscribe", "blog", "news"], '<path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/>'),
  lucide("share", "Share", "communication", ["social", "send", "forward"], '<circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>'),
  lucide("book", "Book", "content", ["read", "library", "novel", "reading"], '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>'),
  lucide("book-open", "Book open", "content", ["read", "library", "novel", "reading"], '<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>'),
  lucide("file-text", "Document", "content", ["file", "document", "text", "article"], '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/>'),
  lucide("edit", "Edit", "content", ["pencil", "write", "update"], '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>'),
  lucide("pencil", "Pencil", "content", ["write", "edit", "draw"], '<path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>'),
  lucide("bookmark", "Bookmark", "content", ["save", "favorite", "read-later"], '<path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>'),
  lucide("newspaper", "Newspaper", "content", ["news", "article", "blog", "press"], '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-2 2Zm0 0a2 2 0 0 1-2-2v-9c0-1.1.9-2 2-2h2"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>'),
  lucide("feather", "Feather", "content", ["write", "blog", "quill", "quill-pen"], '<path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="15"/>'),
  lucide("pen-tool", "Pen tool", "content", ["design", "draw", "vector"], '<path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/>'),
  lucide("link", "Link", "content", ["url", "chain", "href", "external"], '<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>'),
  lucide("external-link", "External link", "content", ["url", "open", "new-tab", "href"], '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/>'),
  lucide("download", "Download", "content", ["save", "file", "arrow-down"], '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>'),
  lucide("upload", "Upload", "content", ["file", "arrow-up", "share"], '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>'),
  lucide("paperclip", "Paperclip", "content", ["attach", "file", "clip"], '<path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"/>'),
  lucide("heart", "Heart", "generic", ["love", "like", "favorite"], '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'),
  lucide("star", "Star", "generic", ["favorite", "rate", "best", "featured"], '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>'),
  lucide("flame", "Fire", "generic", ["hot", "trending", "popular"], '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>'),
  lucide("sparkles", "Sparkles", "generic", ["ai", "magic", "shine", "star"], '<path d="M12 3l1.9 5.7L20 10l-5.7 1.9L12 18l-1.9-5.7L4 10l5.7-1.9L12 3zM5 3v4M3 5h4M19 17v4M17 19h4"/>'),
  lucide("zap", "Lightning", "generic", ["fast", "speed", "power", "bolt"], '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>'),
  lucide("sun", "Sun", "generic", ["light", "day", "weather"], '<circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>'),
  lucide("moon", "Moon", "generic", ["night", "dark", "sleep"], '<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>'),
  lucide("cloud", "Cloud", "generic", ["weather", "sky", "storage"], '<path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z"/>'),
  lucide("globe", "Globe", "generic", ["world", "web", "language", "international"], '<circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>'),
  lucide("map-pin", "Map pin", "generic", ["location", "place", "address", "marker"], '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>'),
  lucide("target", "Target", "generic", ["goal", "aim", "focus", "bullseye"], '<circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="2"/>'),
  lucide("trophy", "Trophy", "generic", ["award", "win", "prize", "achievement"], '<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/>'),
  lucide("smile", "Smile", "generic", ["happy", "emoji", "face", "positive"], '<circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/><line x1="9" y1="9" x2="9.01" y2="9"/><line x1="15" y1="9" x2="15.01" y2="9"/>'),
  lucide("thumbs-up", "Thumbs up", "generic", ["like", "approve", "good", "positive"], '<path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/>'),
  lucide("check-circle", "Check", "generic", ["done", "complete", "success", "ok"], '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>'),
  lucide("rocket", "Rocket", "generic", ["launch", "speed", "startup", "grow"], '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="M12 15l-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>'),
  lucide("crown", "Crown", "generic", ["premium", "vip", "royal", "best"], '<path d="M2 4l3 12h14l3-12-6 7-4-7-4 7-6-7zm3 16h14"/>'),
  lucide("award", "Award", "generic", ["medal", "prize", "badge", "win"], '<circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/>'),
  lucide("eye", "Eye", "generic", ["view", "watch", "visible", "look"], '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>'),
  lucide("lock", "Lock", "generic", ["secure", "private", "password"], '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>'),
  lucide("unlock", "Unlock", "generic", ["secure", "open", "password"], '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/>'),
  lucide("shield", "Shield", "generic", ["secure", "safe", "protect", "guard"], '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>'),
  lucide("check", "Checkmark", "generic", ["done", "tick", "ok", "yes"], '<polyline points="20 6 9 17 4 12"/>'),
  lucide("plus", "Plus", "generic", ["add", "new", "create", "+"], '<line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>'),
  lucide("arrow-right", "Arrow right", "generic", ["next", "forward", "direction"], '<line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>'),
  lucide("arrow-up-right", "Arrow up-right", "generic", ["external", "open", "direction"], '<line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/>'),
  lucide("home", "Home", "generic", ["house", "start", "main"], '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>'),
  lucide("user", "User", "generic", ["profile", "person", "account", "avatar"], '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>'),
  lucide("users", "Users", "generic", ["people", "team", "group", "community"], '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>'),
  lucide("settings", "Settings", "generic", ["gear", "config", "preferences"], '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>'),
  lucide("briefcase", "Briefcase", "generic", ["work", "job", "business", "case"], '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>'),
  lucide("compass", "Compass", "generic", ["direction", "navigation", "explore"], '<circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/>'),
];

export const iconLibraryFixture = (): IconEntry[] => [...BRAND_ICONS, ...LUCIDE_ICONS];

export const socialPlatformsFixture = (): SocialPlatform[] =>
  BRAND_ICONS.filter((i) => i.cat === "social" && !["paypal", "stripe", "amazon"].includes(i.id))
    .map((i) => ({ id: i.id, name: i.name, color: i.color || "#000000" }))
    .concat([
      { id: "applemusic", name: "Apple Music", color: "#FA243C" },
      { id: "paypal", name: "PayPal", color: "#003087" },
      { id: "etsy", name: "Etsy", color: "#F16521" },
    ])
    .filter((p, idx, arr) => arr.findIndex((x) => x.id === p.id) === idx);
