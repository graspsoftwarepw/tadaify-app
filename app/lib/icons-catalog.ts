/**
 * Icon catalog — curated registry of ~100 icons across 7 categories.
 *
 * Design philosophy mirrors block-types.ts: static array, no async loading,
 * SSR-safe (Cloudflare Workers can call renderIcon() without DOM).
 *
 * Icon identifier format:
 *   - Lucide (monochrome): "lucide:<camelCase-name>"  e.g. "lucide:link"
 *   - Simple Icons (brand): "simple-icons:<slug>"     e.g. "simple-icons:spotify"
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: BR-ICON-PICKER-001..006, TR-tadaify-014, AC item 3
 * Unit tests: app/lib/icons-catalog.test.ts (U1)
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Which npm library provides this icon. */
export type IconSource = "lucide" | "simple-icons";

/**
 * Category keys — mirrors BlockCategory from block-types.ts.
 * Identical set so the same category tabs drive both pickers.
 */
export const ICON_CATEGORIES = [
  "popular",
  "social",
  "music-video",
  "shop",
  "communication",
  "content",
  "generic",
] as const;
export type IconCategory = (typeof ICON_CATEGORIES)[number];

/**
 * Single entry in the curated icon catalog.
 */
export interface IconEntry {
  /**
   * Unique identifier stored in block metadata.
   * Format: "lucide:<camelCase>" | "simple-icons:<slug>"
   * e.g. "lucide:link" | "simple-icons:spotify"
   */
  id: string;
  /** Which library provides this icon. */
  source: IconSource;
  /**
   * Human-readable display name shown in the picker grid.
   * Title-cased, short (max ~20 chars).
   */
  name: string;
  /** Primary category — determines which tab this icon appears under. */
  category: IconCategory;
  /**
   * Search tags (lowercase, space-separated or array).
   * Searched alongside the name field.
   * Minimum 2 tags per entry.
   */
  tags: string[];
}

// ---------------------------------------------------------------------------
// Catalog (≥100 entries across 7 categories)
// Ordered: popular → social → music-video → shop → communication → content → generic
// ---------------------------------------------------------------------------

/**
 * Curated icon catalog.
 *
 * Category balance per AC item 3:
 *   Popular       ~20  (mixed sources)
 *   Social        ~20  (simple-icons brand)
 *   Music & Video ~15  (simple-icons brand)
 *   Shop          ~10  (simple-icons brand)
 *   Communication ~10  (mixed)
 *   Content       ~15  (lucide-react)
 *   Generic       ~10  (lucide-react)
 */
export const ICON_CATALOG: IconEntry[] = [
  // -------------------------------------------------------------------------
  // Popular (~20)
  // -------------------------------------------------------------------------
  {
    id: "lucide:link",
    source: "lucide",
    name: "Link",
    category: "popular",
    tags: ["url", "href", "external", "chain"],
  },
  {
    id: "lucide:heart",
    source: "lucide",
    name: "Heart",
    category: "popular",
    tags: ["like", "love", "favorite", "favourite"],
  },
  {
    id: "lucide:star",
    source: "lucide",
    name: "Star",
    category: "popular",
    tags: ["favorite", "favourite", "rate", "rating"],
  },
  {
    id: "lucide:bookmark",
    source: "lucide",
    name: "Bookmark",
    category: "popular",
    tags: ["save", "read-later", "pin"],
  },
  {
    id: "lucide:share2",
    source: "lucide",
    name: "Share",
    category: "popular",
    tags: ["share", "share2", "send", "distribute"],
  },
  {
    id: "lucide:mail",
    source: "lucide",
    name: "Email",
    category: "popular",
    tags: ["mail", "email", "message", "envelope"],
  },
  {
    id: "lucide:calendar",
    source: "lucide",
    name: "Calendar",
    category: "popular",
    tags: ["date", "schedule", "booking", "event"],
  },
  {
    id: "lucide:image",
    source: "lucide",
    name: "Image",
    category: "popular",
    tags: ["photo", "picture", "gallery", "img"],
  },
  {
    id: "lucide:video",
    source: "lucide",
    name: "Video",
    category: "popular",
    tags: ["film", "movie", "media", "play"],
  },
  {
    id: "lucide:file",
    source: "lucide",
    name: "File",
    category: "popular",
    tags: ["document", "doc", "attachment", "page"],
  },
  {
    id: "lucide:globe",
    source: "lucide",
    name: "Website",
    category: "popular",
    tags: ["website", "world", "internet", "web", "globe"],
  },
  {
    id: "lucide:shoppingCart",
    source: "lucide",
    name: "Shop",
    category: "popular",
    tags: ["cart", "buy", "purchase", "store", "shop", "ecommerce"],
  },
  {
    id: "lucide:music",
    source: "lucide",
    name: "Music",
    category: "popular",
    tags: ["audio", "song", "track", "note"],
  },
  {
    id: "lucide:rss",
    source: "lucide",
    name: "RSS / Blog",
    category: "popular",
    tags: ["rss", "feed", "blog", "newsletter", "subscribe"],
  },
  {
    id: "lucide:podcast",
    source: "lucide",
    name: "Podcast",
    category: "popular",
    tags: ["podcast", "radio", "audio", "broadcast"],
  },
  {
    id: "lucide:mapPin",
    source: "lucide",
    name: "Location",
    category: "popular",
    tags: ["map", "pin", "location", "place", "address"],
  },
  {
    id: "lucide:phone",
    source: "lucide",
    name: "Phone",
    category: "popular",
    tags: ["call", "telephone", "contact"],
  },
  {
    id: "lucide:user",
    source: "lucide",
    name: "Profile",
    category: "popular",
    tags: ["user", "person", "account", "profile", "avatar"],
  },
  {
    id: "lucide:gift",
    source: "lucide",
    name: "Gift",
    category: "popular",
    tags: ["present", "gift", "support", "donation"],
  },
  {
    id: "lucide:coffee",
    source: "lucide",
    name: "Tip",
    category: "popular",
    tags: ["coffee", "tip", "support", "donate", "buy me a coffee"],
  },

  // -------------------------------------------------------------------------
  // Social (~20)
  // -------------------------------------------------------------------------
  {
    id: "simple-icons:instagram",
    source: "simple-icons",
    name: "Instagram",
    category: "social",
    tags: ["instagram", "photos", "reels", "stories"],
  },
  {
    id: "simple-icons:x",
    source: "simple-icons",
    name: "X / Twitter",
    category: "social",
    tags: ["x", "twitter", "tweets", "social"],
  },
  {
    id: "simple-icons:tiktok",
    source: "simple-icons",
    name: "TikTok",
    category: "social",
    tags: ["tiktok", "videos", "short-form"],
  },
  {
    id: "simple-icons:youtube",
    source: "simple-icons",
    name: "YouTube",
    category: "social",
    tags: ["youtube", "video", "channel", "subscribe"],
  },
  {
    id: "simple-icons:facebook",
    source: "simple-icons",
    name: "Facebook",
    category: "social",
    tags: ["facebook", "fb", "social"],
  },
  {
    id: "simple-icons:reddit",
    source: "simple-icons",
    name: "Reddit",
    category: "social",
    tags: ["reddit", "community", "subreddit"],
  },
  {
    id: "simple-icons:pinterest",
    source: "simple-icons",
    name: "Pinterest",
    category: "social",
    tags: ["pinterest", "pins", "boards", "ideas"],
  },
  {
    id: "simple-icons:discord",
    source: "simple-icons",
    name: "Discord",
    category: "social",
    tags: ["discord", "community", "server", "chat", "gaming"],
  },
  {
    id: "simple-icons:twitch",
    source: "simple-icons",
    name: "Twitch",
    category: "social",
    tags: ["twitch", "stream", "live", "gaming"],
  },
  {
    id: "simple-icons:snapchat",
    source: "simple-icons",
    name: "Snapchat",
    category: "social",
    tags: ["snapchat", "stories", "snaps"],
  },
  {
    id: "simple-icons:threads",
    source: "simple-icons",
    name: "Threads",
    category: "social",
    tags: ["threads", "meta", "social"],
  },
  {
    id: "simple-icons:bluesky",
    source: "simple-icons",
    name: "Bluesky",
    category: "social",
    tags: ["bluesky", "at protocol", "social"],
  },
  {
    id: "simple-icons:mastodon",
    source: "simple-icons",
    name: "Mastodon",
    category: "social",
    tags: ["mastodon", "fediverse", "social"],
  },
  {
    id: "simple-icons:github",
    source: "simple-icons",
    name: "GitHub",
    category: "social",
    tags: ["github", "code", "repos", "developers"],
  },
  {
    id: "simple-icons:linktree",
    source: "simple-icons",
    name: "Linktree",
    category: "social",
    tags: ["linktree", "links", "bio"],
  },
  {
    id: "simple-icons:medium",
    source: "simple-icons",
    name: "Medium",
    category: "social",
    tags: ["medium", "blog", "articles", "writing"],
  },
  {
    id: "simple-icons:substack",
    source: "simple-icons",
    name: "Substack",
    category: "social",
    tags: ["substack", "newsletter", "writing", "blog"],
  },
  {
    id: "simple-icons:patreon",
    source: "simple-icons",
    name: "Patreon",
    category: "social",
    tags: ["patreon", "membership", "support", "subscription"],
  },
  {
    id: "simple-icons:kofi",
    source: "simple-icons",
    name: "Ko-fi",
    category: "social",
    tags: ["kofi", "ko-fi", "donation", "support", "tip"],
  },
  {
    id: "simple-icons:buymeacoffee",
    source: "simple-icons",
    name: "Buy Me a Coffee",
    category: "social",
    tags: ["buymeacoffee", "buy me a coffee", "tip", "support", "donation"],
  },

  // -------------------------------------------------------------------------
  // Music & Video (~15)
  // -------------------------------------------------------------------------
  {
    id: "simple-icons:spotify",
    source: "simple-icons",
    name: "Spotify",
    category: "music-video",
    tags: ["spotify", "music", "podcast", "streaming"],
  },
  {
    id: "simple-icons:applemusic",
    source: "simple-icons",
    name: "Apple Music",
    category: "music-video",
    tags: ["apple music", "applemusic", "music", "streaming"],
  },
  {
    id: "simple-icons:youtubemusic",
    source: "simple-icons",
    name: "YouTube Music",
    category: "music-video",
    tags: ["youtube music", "youtubemusic", "music", "streaming"],
  },
  {
    id: "simple-icons:soundcloud",
    source: "simple-icons",
    name: "SoundCloud",
    category: "music-video",
    tags: ["soundcloud", "music", "tracks", "audio"],
  },
  {
    id: "simple-icons:bandcamp",
    source: "simple-icons",
    name: "Bandcamp",
    category: "music-video",
    tags: ["bandcamp", "music", "albums", "indie"],
  },
  {
    id: "simple-icons:vimeo",
    source: "simple-icons",
    name: "Vimeo",
    category: "music-video",
    tags: ["vimeo", "video", "films", "portfolio"],
  },
  {
    id: "simple-icons:applepodcasts",
    source: "simple-icons",
    name: "Apple Podcasts",
    category: "music-video",
    tags: ["apple podcasts", "applepodcasts", "podcast", "audio"],
  },
  {
    id: "lucide:music2",
    source: "lucide",
    name: "Track",
    category: "music-video",
    tags: ["track", "song", "music", "audio"],
  },
  {
    id: "lucide:mic",
    source: "lucide",
    name: "Microphone",
    category: "music-video",
    tags: ["mic", "microphone", "record", "podcast", "voice"],
  },
  {
    id: "lucide:headphones",
    source: "lucide",
    name: "Headphones",
    category: "music-video",
    tags: ["headphones", "listen", "audio", "music"],
  },
  {
    id: "lucide:radio",
    source: "lucide",
    name: "Radio",
    category: "music-video",
    tags: ["radio", "broadcast", "live", "stream"],
  },
  {
    id: "lucide:tv",
    source: "lucide",
    name: "TV / Channel",
    category: "music-video",
    tags: ["tv", "television", "channel", "broadcast"],
  },
  {
    id: "lucide:clapperboard",
    source: "lucide",
    name: "Film",
    category: "music-video",
    tags: ["film", "movie", "video", "clapper", "production"],
  },
  {
    id: "lucide:playCircle",
    source: "lucide",
    name: "Play",
    category: "music-video",
    tags: ["play", "video", "watch", "stream"],
  },
  {
    id: "lucide:disc3",
    source: "lucide",
    name: "Vinyl",
    category: "music-video",
    tags: ["vinyl", "disc3", "record", "music", "disc", "album"],
  },

  // -------------------------------------------------------------------------
  // Shop (~10)
  // -------------------------------------------------------------------------
  {
    id: "simple-icons:shopify",
    source: "simple-icons",
    name: "Shopify",
    category: "shop",
    tags: ["shopify", "store", "ecommerce", "shop"],
  },
  {
    id: "simple-icons:etsy",
    source: "simple-icons",
    name: "Etsy",
    category: "shop",
    tags: ["etsy", "handmade", "crafts", "shop"],
  },
  {
    id: "simple-icons:gumroad",
    source: "simple-icons",
    name: "Gumroad",
    category: "shop",
    tags: ["gumroad", "digital", "downloads", "products"],
  },
  {
    id: "simple-icons:stripe",
    source: "simple-icons",
    name: "Stripe",
    category: "shop",
    tags: ["stripe", "payments", "checkout"],
  },
  {
    id: "simple-icons:paypal",
    source: "simple-icons",
    name: "PayPal",
    category: "shop",
    tags: ["paypal", "payment", "money", "checkout"],
  },
  {
    id: "simple-icons:woocommerce",
    source: "simple-icons",
    name: "WooCommerce",
    category: "shop",
    tags: ["woocommerce", "wordpress", "store", "ecommerce"],
  },
  {
    id: "lucide:shoppingBag",
    source: "lucide",
    name: "Shopping Bag",
    category: "shop",
    tags: ["shop", "bag", "purchase", "buy"],
  },
  {
    id: "lucide:tag",
    source: "lucide",
    name: "Price Tag",
    category: "shop",
    tags: ["price", "tag", "label", "deal"],
  },
  {
    id: "lucide:creditCard",
    source: "lucide",
    name: "Payment",
    category: "shop",
    tags: ["credit card", "payment", "billing", "checkout"],
  },
  {
    id: "lucide:packageOpen",
    source: "lucide",
    name: "Product",
    category: "shop",
    tags: ["product", "package", "order", "delivery"],
  },

  // -------------------------------------------------------------------------
  // Communication (~10)
  // -------------------------------------------------------------------------
  {
    id: "lucide:messageCircle",
    source: "lucide",
    name: "Message",
    category: "communication",
    tags: ["message", "chat", "comment", "reply"],
  },
  {
    id: "lucide:send",
    source: "lucide",
    name: "Send",
    category: "communication",
    tags: ["send", "submit", "contact", "message"],
  },
  {
    id: "simple-icons:whatsapp",
    source: "simple-icons",
    name: "WhatsApp",
    category: "communication",
    tags: ["whatsapp", "message", "chat", "mobile"],
  },
  {
    id: "simple-icons:telegram",
    source: "simple-icons",
    name: "Telegram",
    category: "communication",
    tags: ["telegram", "channel", "message", "chat"],
  },
  {
    id: "lucide:mailOpen",
    source: "lucide",
    name: "Newsletter",
    category: "communication",
    tags: ["newsletter", "email", "subscribe", "mail"],
  },
  {
    id: "lucide:bell",
    source: "lucide",
    name: "Notify",
    category: "communication",
    tags: ["bell", "notify", "alert", "notification"],
  },
  {
    id: "lucide:monitorPlay",
    source: "lucide",
    name: "Video Call",
    category: "communication",
    tags: ["video call", "meeting", "zoom", "webinar", "monitor"],
  },
  {
    id: "lucide:atSign",
    source: "lucide",
    name: "Mention / @",
    category: "communication",
    tags: ["at", "mention", "email", "handle"],
  },
  {
    id: "lucide:messageSquare",
    source: "lucide",
    name: "Chat",
    category: "communication",
    tags: ["chat", "message", "support", "help"],
  },
  {
    id: "lucide:users",
    source: "lucide",
    name: "Community",
    category: "communication",
    tags: ["community", "group", "members", "team"],
  },

  // -------------------------------------------------------------------------
  // Content (~15)
  // -------------------------------------------------------------------------
  {
    id: "lucide:bookOpen",
    source: "lucide",
    name: "Read / Blog",
    category: "content",
    tags: ["book", "blog", "article", "read", "writing"],
  },
  {
    id: "lucide:fileText",
    source: "lucide",
    name: "Article",
    category: "content",
    tags: ["article", "text", "document", "writing"],
  },
  {
    id: "lucide:penLine",
    source: "lucide",
    name: "Writing",
    category: "content",
    tags: ["write", "pen", "author", "blog", "essay"],
  },
  {
    id: "lucide:layoutDashboard",
    source: "lucide",
    name: "Course",
    category: "content",
    tags: ["course", "curriculum", "lessons", "education"],
  },
  {
    id: "lucide:graduationCap",
    source: "lucide",
    name: "Education",
    category: "content",
    tags: ["education", "learn", "course", "school", "tutorial"],
  },
  {
    id: "lucide:lightbulb",
    source: "lucide",
    name: "Ideas",
    category: "content",
    tags: ["idea", "tip", "insight", "advice"],
  },
  {
    id: "lucide:camera",
    source: "lucide",
    name: "Photography",
    category: "content",
    tags: ["camera", "photo", "photography", "shoot"],
  },
  {
    id: "lucide:palette",
    source: "lucide",
    name: "Art / Design",
    category: "content",
    tags: ["palette", "art", "design", "creative"],
  },
  {
    id: "lucide:code2",
    source: "lucide",
    name: "Code",
    category: "content",
    tags: ["code", "developer", "programming", "github"],
  },
  {
    id: "lucide:trophy",
    source: "lucide",
    name: "Achievement",
    category: "content",
    tags: ["trophy", "award", "achievement", "win"],
  },
  {
    id: "lucide:barChart2",
    source: "lucide",
    name: "Analytics",
    category: "content",
    tags: ["analytics", "stats", "data", "chart"],
  },
  {
    id: "lucide:briefcase",
    source: "lucide",
    name: "Portfolio",
    category: "content",
    tags: ["portfolio", "work", "projects", "professional"],
  },
  {
    id: "lucide:clock",
    source: "lucide",
    name: "Schedule",
    category: "content",
    tags: ["schedule", "time", "hours", "availability"],
  },
  {
    id: "lucide:zap",
    source: "lucide",
    name: "Action",
    category: "content",
    tags: ["action", "fast", "cta", "energy", "boost"],
  },
  {
    id: "lucide:sparkles",
    source: "lucide",
    name: "Featured",
    category: "content",
    tags: ["featured", "sparkles", "highlight", "special", "ai"],
  },

  // -------------------------------------------------------------------------
  // Generic (~10)
  // -------------------------------------------------------------------------
  {
    id: "lucide:externalLink",
    source: "lucide",
    name: "External Link",
    category: "generic",
    tags: ["external", "link", "open", "url"],
  },
  {
    id: "lucide:arrowRight",
    source: "lucide",
    name: "Arrow Right",
    category: "generic",
    tags: ["arrow", "next", "forward", "go"],
  },
  {
    id: "lucide:plus",
    source: "lucide",
    name: "Add",
    category: "generic",
    tags: ["add", "plus", "new", "create"],
  },
  {
    id: "lucide:check",
    source: "lucide",
    name: "Check",
    category: "generic",
    tags: ["check", "done", "confirm", "verified"],
  },
  {
    id: "lucide:search",
    source: "lucide",
    name: "Search",
    category: "generic",
    tags: ["search", "find", "discover", "lookup"],
  },
  {
    id: "lucide:settings",
    source: "lucide",
    name: "Settings",
    category: "generic",
    tags: ["settings", "config", "preferences"],
  },
  {
    id: "lucide:helpCircle",
    source: "lucide",
    name: "Help / FAQ",
    category: "generic",
    tags: ["help", "faq", "question", "support"],
  },
  {
    id: "lucide:info",
    source: "lucide",
    name: "Info",
    category: "generic",
    tags: ["info", "information", "about"],
  },
  {
    id: "lucide:download",
    source: "lucide",
    name: "Download",
    category: "generic",
    tags: ["download", "save", "file", "get"],
  },
  {
    id: "lucide:upload",
    source: "lucide",
    name: "Upload",
    category: "generic",
    tags: ["upload", "share", "file", "submit"],
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Returns the total number of entries in the catalog.
 * Used in tests to assert ≥100.
 */
export const ICON_CATALOG_COUNT = ICON_CATALOG.length;
