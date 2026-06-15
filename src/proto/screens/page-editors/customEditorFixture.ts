/**
 * Typed mock seam for the Custom page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-custom.html so the screen graduates by swapping
 * this factory for the real loader. The Custom page is a creator-named page
 * built from the block library — its content is a stack of blocks.
 *
 * @implements fr-page-editor-custom
 */
export type CustomBlockTone = "indigo" | "warm" | "rose" | "emerald" | "slate";

export type CustomBlockFlag = { kind: "ab" | "sched"; text: string };

export type CustomBlock = {
  id: string;
  emoji: string;
  tone: CustomBlockTone;
  name: string;
  type: string;
  summary: string;
  flags?: CustomBlockFlag[];
};

export type CustomBlockType = { type: string; emoji: string; name: string; desc: string };

export type CustomTemplate = {
  id: string;
  emoji: string;
  name: string;
  sub: string;
  blocks: string[];
};

export type CustomFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  showInNav: boolean;
  noindex: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  seo: { title: string; description: string; autoOg: boolean };
  options: {
    customDomain: string;
    passwordOn: boolean;
    password: string;
    redirectSecs: number;
    redirectUrl: string;
  };
  blocks: CustomBlock[];
  blockTypes: CustomBlockType[];
  templates: CustomTemplate[];
  starterTiles: { id: string; emoji: string; name: string; sub: string }[];
};

export const customEditorFixture = (): CustomFixture => ({
  pageTitle: "Press kit",
  slug: "press-kit",
  live: true,
  showInNav: true,
  noindex: false,
  backgrounds: [
    { name: "Inherit theme", css: "var(--bg)" },
    { name: "White", css: "#FFFFFF" },
    { name: "Warm cream", css: "#F8F4EE" },
    { name: "Slate", css: "#1F2937" },
    { name: "Dark canvas", css: "#0B0F1E" },
    { name: "Sunrise", css: "linear-gradient(135deg,#FDE68A,#F59E0B)" },
    { name: "Indigo", css: "linear-gradient(135deg,#6366F1,#8B5CF6)" },
    { name: "Nightfall", css: "linear-gradient(135deg,#0F172A,#334155)" },
  ],
  selectedBackground: 0,
  seo: {
    title: "Press kit — Alexandra Silva",
    description:
      "Logos, founder photos, key facts and approved bios — everything journalists, podcasters and partners need.",
    autoOg: true,
  },
  options: {
    customDomain: "",
    passwordOn: false,
    password: "atelier-2026",
    redirectSecs: 0,
    redirectUrl: "",
  },
  blocks: [
    { id: "b1", emoji: "📰", tone: "indigo", name: "Press & media kit", type: "Heading", summary: 'H1 · centered · 48px display font · subtitle: "Everything you need to write about Alexandra Silva."' },
    { id: "b2", emoji: "🖼", tone: "rose", name: "Founder portrait", type: "Image", summary: 'alexandra-portrait-2026.jpg · 1600×1200 · alt "Alexandra Silva, founder, in studio" · centered, max 600px wide' },
    { id: "b3", emoji: "📰", tone: "indigo", name: "Logos & download assets", type: "Heading", summary: 'H2 · "Click any logo to download. SVG and PNG both included."' },
    { id: "b4", emoji: "🔗", tone: "emerald", name: "Download logos (4 buttons)", type: "Link", summary: "Logo · Wordmark · Mono dark · Mono light — each links to assets.alexandra.com/press/...", flags: [{ kind: "ab", text: "⚡ A/B active · 312 / 287" }] },
    { id: "b5", emoji: "📰", tone: "indigo", name: "Quick facts about Alexandra", type: "Heading", summary: "H2 · centered · serif display" },
    { id: "b6", emoji: "📚", tone: "warm", name: "Key facts (5 Q&A)", type: "Accordion", summary: '"Founded?" "Where based?" "How many clients?" "Speaking topics?" "Approved bio?"', flags: [{ kind: "sched", text: "📅 Scheduled · May 1 – Aug 31" }] },
    { id: "b7", emoji: "✉️", tone: "slate", name: "Press list signup", type: "Newsletter", summary: '"Get press releases first." Provider: Kit · 1,247 subscribers · GDPR consent ON' },
    { id: "b8", emoji: "🔗", tone: "emerald", name: '"Reach me directly →"', type: "Link", summary: "Pill button · brand-warm · → tadaify.com/alexandra/contact" },
  ],
  blockTypes: [
    { type: "link", emoji: "🔗", name: "Link", desc: "Tappable button to any URL — store, video, profile." },
    { type: "social", emoji: "🌐", name: "Social", desc: "Icon row — 30+ platforms, 6 icon styles." },
    { type: "embedded", emoji: "📺", name: "Embedded", desc: "Spotify, YouTube, Apple Music, Maps, Calendly…" },
    { type: "video", emoji: "▶️", name: "Video", desc: "Native player — MP4, YouTube, Vimeo." },
    { type: "image", emoji: "🖼", name: "Image", desc: "Single image with optional caption + click target." },
    { type: "heading", emoji: "📰", name: "Heading", desc: "H1 / H2 / H3 with display font + alignment." },
    { type: "divider", emoji: "➖", name: "Divider", desc: "Visual separator — line, dots, gap." },
    { type: "newsletter", emoji: "✉️", name: "Newsletter", desc: "Email capture — Kit, Beehiiv, Mailchimp, Klaviyo, Sheets…" },
    { type: "countdown", emoji: "⏳", name: "Countdown", desc: "Timer to a launch, drop or live event." },
    { type: "product", emoji: "🛍", name: "Product", desc: "Link to your Shopify, Stripe, Etsy, Gumroad…" },
    { type: "accordion", emoji: "📚", name: "Accordion", desc: "Collapsible Q&A — perfect for FAQ + key facts." },
    { type: "html", emoji: "</>", name: "Custom HTML", desc: "Drop arbitrary HTML — for advanced creators." },
  ],
  templates: [
    { id: "press-kit", emoji: "📰", name: "Press kit", sub: "Logos, founder bio, key facts, press signup.", blocks: ["Heading", "Image", "Heading", "Link × 4", "Heading", "Accordion", "Newsletter", "Link"] },
    { id: "speaking", emoji: "🎤", name: "Speaking", sub: "Recent talk, topics list, event photos, contact.", blocks: ["Heading", "Embedded", "Heading", "Image × 4", "Accordion", "Link"] },
    { id: "resources", emoji: "📚", name: "Resources", sub: "Free downloads + email signup to keep visitors.", blocks: ["Heading", "Link × 6", "Divider", "Newsletter"] },
    { id: "faq", emoji: "❓", name: "FAQ-style", sub: "Frequently-asked accordion + contact CTA.", blocks: ["Heading", "Accordion × 8", "Link"] },
    { id: "coming-soon", emoji: "🌅", name: "Coming soon", sub: "Hero + countdown + email signup for launch.", blocks: ["Heading", "Image", "Countdown", "Newsletter"] },
    { id: "thank-you", emoji: "🎉", name: "Thank you", sub: "Confirmation page after purchase / signup with next-step CTAs.", blocks: ["Heading", "Image", "Heading", "Link × 3"] },
  ],
  starterTiles: [
    { id: "press-kit", emoji: "📰", name: "Press kit", sub: "Logos · bio · facts · contact" },
    { id: "speaking", emoji: "🎤", name: "Speaking", sub: "Talks · topics · contact" },
    { id: "resources", emoji: "📚", name: "Resources", sub: "Free downloads · signup" },
    { id: "faq", emoji: "❓", name: "FAQ-style", sub: "Q&A · contact CTA" },
    { id: "coming-soon", emoji: "🌅", name: "Coming soon", sub: "Hero · countdown · signup" },
    { id: "thank-you", emoji: "🎉", name: "Thank you", sub: "Confirmation · next-steps" },
  ],
});
