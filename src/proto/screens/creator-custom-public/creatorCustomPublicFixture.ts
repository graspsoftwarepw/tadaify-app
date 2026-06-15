/**
 * Typed mock seam for the public Custom page. Mirrors
 * mockups/tadaify-mvp/creator-custom-public.html so the screen graduates by
 * swapping these factories for the real published-page loader. Defines the
 * FR's rendered data contract: the page hero plus the creator-authored block
 * list (image / heading / link buttons / accordion / divider / newsletter).
 *
 * @implements fr-creator-custom-public
 */
import type { PublicCreator, PublicSocial } from "../public/PublicChrome";

export type CustomBlock =
  | { kind: "image"; caption: string }
  | { kind: "heading"; level: "h1" | "h2" | "h3"; text: string; sub?: string }
  | { kind: "link"; label: string; meta?: string; warm?: boolean }
  | { kind: "divider" }
  | { kind: "accordion"; items: { q: string; a: string; open?: boolean }[] }
  | {
      kind: "newsletter";
      heading: string;
      body: string;
      placeholder: string;
      button: string;
      trust: string;
    };

export type CustomContent = {
  creator: PublicCreator;
  /** Custom-page slug shown in the url pill and nav label. */
  slug: string;
  navLabel: string;
  hero: { title: string; sub: string };
  blocks: CustomBlock[];
  footerSocials: PublicSocial[];
  /** Pages offered on the empty-state placeholder. */
  otherPages: { label: string; href: string }[];
  /** Mockup-only unlock password for the password-gate state. */
  password: string;
};

export function customContentFixture(): CustomContent {
  return {
    creator: { name: "Alexandra Silva", initial: "A", handle: "alexandra" },
    slug: "press-kit",
    navLabel: "Press kit",
    hero: {
      title: "Press & media kit",
      sub: "Everything you need to write, podcast, or partner with Alexandra Silva. Logos, founder photo, key facts, approved bio — and a way to stay in the loop on press releases.",
    },
    blocks: [
      { kind: "image", caption: "Alexandra Silva · founder portrait" },
      {
        kind: "heading",
        level: "h2",
        text: "Logos & download assets",
        sub: "Click any logo to download. SVG and PNG both included.",
      },
      { kind: "link", label: "Logo (full mark)", meta: "SVG · PNG · 2 MB" },
      { kind: "link", label: "Wordmark only", meta: "SVG · PNG · 1 MB" },
      { kind: "link", label: "Monochrome — dark", meta: "SVG · PNG · 800 KB" },
      { kind: "link", label: "Monochrome — light", meta: "SVG · PNG · 800 KB" },
      { kind: "heading", level: "h2", text: "Quick facts about Alexandra" },
      {
        kind: "accordion",
        items: [
          {
            q: "When did Alexandra found Strong Not Skinny?",
            a: "In 2019, after eight years coaching one-on-one in Lisbon and Madrid. The first online program shipped in October 2019 with 47 founding members.",
            open: true,
          },
          {
            q: "Where is the studio based?",
            a: "Lisbon, Portugal — Estrela neighborhood. Most coaching happens online; in-person workshops run quarterly across Europe.",
          },
          {
            q: "How many active clients are in the program?",
            a: "Around 1,200 monthly active members. The 1:1 roster is capped at 18 — currently full with a waitlist.",
          },
          {
            q: "What topics does Alexandra speak on?",
            a: "Strength training for women over 35 · sustainable nutrition without macro tracking · building a coaching business that doesn't require burnout. Most-booked talk: \"The Recovery Stack — why under-training beats over-training.\"",
          },
          {
            q: "Is there an approved bio for press?",
            a: "Short (50 words): Alexandra Silva is a strength coach and writer based in Lisbon. She founded Strong Not Skinny in 2019 to teach women over 35 how to build muscle without burning out. Her work has appeared in Outside, Self, and Women's Health.",
          },
        ],
      },
      { kind: "divider" },
      {
        kind: "newsletter",
        heading: "Get press releases first",
        body: "Drop your email — we send a short note every time there's something worth covering.",
        placeholder: "you@example.com",
        button: "Subscribe",
        trust: "No spam · 1-click unsubscribe · GDPR-friendly",
      },
      { kind: "link", label: "Reach me directly →", warm: true },
    ],
    footerSocials: [
      { label: "Instagram", glyph: "📸" },
      { label: "TikTok", glyph: "🎬" },
      { label: "YouTube", glyph: "▶️" },
      { label: "X / Twitter", glyph: "𝕏" },
      { label: "Email", glyph: "✉️" },
    ],
    otherPages: [
      { label: "🏠 Home", href: "/__proto/creator-public" },
      { label: "📝 Blog", href: "/__proto/creator-blog-public" },
      { label: "🎨 Portfolio", href: "/__proto/creator-portfolio-public" },
      { label: "✉️ Contact", href: "/__proto/creator-contact-public" },
    ],
    password: "atelier-2026",
  };
}
