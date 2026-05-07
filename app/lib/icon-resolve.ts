/**
 * Icon resolver — converts a catalog identifier string to a JSX element.
 *
 * SSR-safe: no browser globals (no `window`, `document`).
 * Works in Cloudflare Workers SSR context (same code path as creator preview).
 *
 * Usage:
 *   renderIcon("lucide:link")
 *   renderIcon("simple-icons:spotify", { size: 24 })
 *   renderIcon(null)  // → null
 *   renderIcon("lucide:unknown-icon") // → fallback HelpCircle
 *
 * Story: tadaify-app#205 F-BLOCK-INFRA-ICON-PICKER-001
 * Covers: BR-ICON-PICKER-004, BR-ICON-PICKER-005, TR-tadaify-014 (resolver), AC items 4, 9, 11
 * Unit tests: app/lib/icon-resolve.test.ts (U2)
 */

import type { JSX } from "react";
import React from "react";

// ---------------------------------------------------------------------------
// Lucide icon imports (tree-shaken — only icons in the catalog are imported)
// ---------------------------------------------------------------------------

import {
  // Popular
  Link,
  Heart,
  Star,
  Bookmark,
  Share2,
  Mail,
  Calendar,
  Image,
  Video,
  File,
  Globe,
  ShoppingCart,
  Music,
  Rss,
  Podcast,
  MapPin,
  Phone,
  User,
  Gift,
  Coffee,
  // Music & Video
  Music2,
  Mic,
  Headphones,
  Radio,
  Tv,
  Clapperboard,
  PlayCircle,
  Disc3,
  // Shop
  ShoppingBag,
  Tag,
  CreditCard,
  PackageOpen,
  // Communication
  MessageCircle,
  Send,
  MailOpen,
  Bell,
  MonitorPlay,
  AtSign,
  MessageSquare,
  Users,
  // Content
  BookOpen,
  FileText,
  PenLine,
  LayoutDashboard,
  GraduationCap,
  Lightbulb,
  Camera,
  Palette,
  Code2,
  Trophy,
  BarChart2,
  Briefcase,
  Clock,
  Zap,
  Sparkles,
  // Generic
  ExternalLink,
  ArrowRight,
  Plus,
  Check,
  Search,
  Settings,
  HelpCircle,
  Info,
  Download,
  Upload,
  // Fallback
} from "lucide-react";

// ---------------------------------------------------------------------------
// Lucide icon registry — maps catalog ID suffix to component
// ---------------------------------------------------------------------------

/** Maps lucide:<name> → Lucide React component. */
const LUCIDE_REGISTRY: Record<string, React.ComponentType<{ size?: number; strokeWidth?: number; className?: string; color?: string }>> = {
  // Popular
  link: Link,
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  share2: Share2,
  mail: Mail,
  calendar: Calendar,
  image: Image,
  video: Video,
  file: File,
  globe: Globe,
  shoppingCart: ShoppingCart,
  music: Music,
  rss: Rss,
  podcast: Podcast,
  mapPin: MapPin,
  phone: Phone,
  user: User,
  gift: Gift,
  coffee: Coffee,
  // Music & Video
  music2: Music2,
  mic: Mic,
  headphones: Headphones,
  radio: Radio,
  tv: Tv,
  clapperboard: Clapperboard,
  playCircle: PlayCircle,
  disc3: Disc3,
  // Shop
  shoppingBag: ShoppingBag,
  tag: Tag,
  creditCard: CreditCard,
  packageOpen: PackageOpen,
  // Communication
  messageCircle: MessageCircle,
  send: Send,
  mailOpen: MailOpen,
  bell: Bell,
  monitorPlay: MonitorPlay,
  atSign: AtSign,
  messageSquare: MessageSquare,
  users: Users,
  // Content
  bookOpen: BookOpen,
  fileText: FileText,
  penLine: PenLine,
  layoutDashboard: LayoutDashboard,
  graduationCap: GraduationCap,
  lightbulb: Lightbulb,
  camera: Camera,
  palette: Palette,
  code2: Code2,
  trophy: Trophy,
  barChart2: BarChart2,
  briefcase: Briefcase,
  clock: Clock,
  zap: Zap,
  sparkles: Sparkles,
  // Generic
  externalLink: ExternalLink,
  arrowRight: ArrowRight,
  plus: Plus,
  check: Check,
  search: Search,
  settings: Settings,
  helpCircle: HelpCircle,
  info: Info,
  download: Download,
  upload: Upload,
};

// ---------------------------------------------------------------------------
// Simple Icons path data (inlined for SSR + tree-shaking)
// Only import the icons actually in ICON_CATALOG to keep bundle small.
// ---------------------------------------------------------------------------

// We use a lazy approach: import the named exports from simple-icons.
// Vite tree-shakes this to only what we reference.
import {
  siInstagram,
  siX,
  siTiktok,
  siYoutube,
  siFacebook,
  siReddit,
  siPinterest,
  siDiscord,
  siTwitch,
  siSnapchat,
  siThreads,
  siBluesky,
  siMastodon,
  siGithub,
  siLinktree,
  siMedium,
  siSubstack,
  siPatreon,
  siKofi,
  siBuymeacoffee,
  siSpotify,
  siApplemusic,
  siYoutubemusic,
  siSoundcloud,
  siBandcamp,
  siVimeo,
  siApplepodcasts,
  siShopify,
  siEtsy,
  siGumroad,
  siStripe,
  siPaypal,
  siWoocommerce,
  siWhatsapp,
  siTelegram,
} from "simple-icons";

/** Maps simple-icons:<slug> → simple-icons metadata object. */
const SIMPLE_ICONS_REGISTRY: Record<string, { path: string; hex: string; title: string }> = {
  instagram: siInstagram,
  x: siX,
  tiktok: siTiktok,
  youtube: siYoutube,
  facebook: siFacebook,
  reddit: siReddit,
  pinterest: siPinterest,
  discord: siDiscord,
  twitch: siTwitch,
  snapchat: siSnapchat,
  threads: siThreads,
  bluesky: siBluesky,
  mastodon: siMastodon,
  github: siGithub,
  linktree: siLinktree,
  medium: siMedium,
  substack: siSubstack,
  patreon: siPatreon,
  kofi: siKofi,
  buymeacoffee: siBuymeacoffee,
  spotify: siSpotify,
  applemusic: siApplemusic,
  youtubemusic: siYoutubemusic,
  soundcloud: siSoundcloud,
  bandcamp: siBandcamp,
  vimeo: siVimeo,
  applepodcasts: siApplepodcasts,
  shopify: siShopify,
  etsy: siEtsy,
  gumroad: siGumroad,
  stripe: siStripe,
  paypal: siPaypal,
  woocommerce: siWoocommerce,
  whatsapp: siWhatsapp,
  telegram: siTelegram,
};

// ---------------------------------------------------------------------------
// Props + render function
// ---------------------------------------------------------------------------

export interface RenderIconProps {
  /** Icon size in px. Default: 20. */
  size?: number;
  /** Tailwind / CSS class to add to the SVG element. */
  className?: string;
}

/**
 * Resolves an icon identifier string to a JSX element.
 *
 * - `lucide:<name>` → Lucide React component (monochrome, `stroke="currentColor"`)
 * - `simple-icons:<slug>` → Inline SVG with brand hex color
 * - `null` or unknown → returns `null` (null id) or HelpCircle fallback (unknown)
 *
 * SSR-safe: pure synchronous computation, no browser APIs.
 *
 * @param id - Icon identifier from ICON_CATALOG (or stored in block meta.icon)
 * @param props - Optional size + className overrides
 * @returns JSX element or null
 */
export function renderIcon(id: string | null | undefined, props?: RenderIconProps): JSX.Element | null {
  const size = props?.size ?? 20;
  const className = props?.className;

  if (!id) return null;

  const [source, ...nameParts] = id.split(":");
  const name = nameParts.join(":");  // handles slugs that contain colons (unlikely but safe)

  // ---- Lucide ----
  if (source === "lucide") {
    const Component = LUCIDE_REGISTRY[name];
    if (!Component) {
      if (typeof console !== "undefined") {
        console.warn(`[renderIcon] Unknown lucide icon: "${id}" — using fallback HelpCircle`);
      }
      return React.createElement(HelpCircle, { size, strokeWidth: 1.5, className, "aria-hidden": true } as React.ComponentProps<typeof HelpCircle>);
    }
    return React.createElement(Component, { size, strokeWidth: 1.5, className, "aria-hidden": true } as React.ComponentProps<typeof Component>);
  }

  // ---- Simple Icons ----
  if (source === "simple-icons") {
    const iconData = SIMPLE_ICONS_REGISTRY[name];
    if (!iconData) {
      if (typeof console !== "undefined") {
        console.warn(`[renderIcon] Unknown simple-icons icon: "${id}" — using fallback HelpCircle`);
      }
      return React.createElement(HelpCircle, { size, strokeWidth: 1.5, className, "aria-hidden": true } as React.ComponentProps<typeof HelpCircle>);
    }
    // Render inline SVG with brand color
    return React.createElement("svg", {
      width: size,
      height: size,
      viewBox: "0 0 24 24",
      fill: `#${iconData.hex}`,
      "aria-hidden": true,
      className,
      role: "img",
      "aria-label": iconData.title,
      xmlns: "http://www.w3.org/2000/svg",
    }, React.createElement("path", { d: iconData.path }));
  }

  // ---- Unknown source prefix ----
  if (typeof console !== "undefined") {
    console.warn(`[renderIcon] Unknown icon source prefix: "${id}" — using fallback HelpCircle`);
  }
  return React.createElement(HelpCircle, { size, strokeWidth: 1.5, className, "aria-hidden": true } as React.ComponentProps<typeof HelpCircle>);
}

// ---------------------------------------------------------------------------
// Exported constants (for tests + downstream consumers)
// ---------------------------------------------------------------------------

/** Identifier used for the fallback icon (unknown/removed catalog entries). */
export const FALLBACK_ICON_ID = "lucide:helpCircle" as const;

/** Default icon render size in px. */
export const DEFAULT_ICON_SIZE = 20;
