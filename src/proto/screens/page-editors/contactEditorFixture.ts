/**
 * Typed mock seam for the Contact page editor. Mirrors the data shown in
 * mockups/tadaify-mvp/app-page-contact.html so the screen graduates by swapping
 * this factory for the real loader.
 *
 * @implements fr-page-editor-contact
 */
import type { Tier } from "./EditorShell";

export type ContactSectionType =
  | "hero"
  | "form"
  | "delivery"
  | "office-hours"
  | "other-methods"
  | "faq";

export type FormFieldType =
  | "short_text"
  | "long_text"
  | "email"
  | "phone"
  | "url"
  | "number"
  | "dropdown"
  | "checkboxes"
  | "radio"
  | "file"
  | "date"
  | "hidden"
  | "consent";

export type FormField = {
  id: string;
  type: FormFieldType;
  icon: string;
  name: string;
  typeName: string;
  required?: boolean;
  /** Locked at the bottom (GDPR consent). */
  locked?: boolean;
  /** Marks the auto-added consent row. */
  auto?: boolean;
};

export type DeliveryChannel = {
  id: string;
  icon: string;
  name: string;
  sub: string;
  on: boolean;
  placeholder: string;
  value?: string;
};

export type HoursRow = { day: string; on: boolean; from: string; to: string };

export type OtherMethod = { icon: string; type: string; value?: string; placeholder?: string };

export type ContactFaq = { id: string; q: string; a: string };

export type ContactSectionTile = {
  type: string;
  emoji: string;
  name: string;
  sub: string;
  tier?: Tier;
  already?: boolean;
};

export type FieldTypeTile = {
  type: FormFieldType;
  emoji: string;
  name: string;
  sub: string;
  tier?: Tier;
};

export type ContactFixture = {
  pageTitle: string;
  slug: string;
  live: boolean;
  backgrounds: { name: string; css: string }[];
  selectedBackground: number;
  titleSlugAlts: { title: string; slug: string }[];
  seo: { title: string; description: string };
  hero: { headline: string; sub: string; headlineIdeas: string[] };
  form: {
    fields: FormField[];
    submitLabel: string;
    afterSubmit: "inline" | "redirect" | "thank-you";
  };
  delivery: { forwardEmail: string; channels: DeliveryChannel[]; endpoint: string };
  hours: { rows: HoursRow[]; timezone: string; responseTime: string };
  other: { email: string; phone: string; whatsapp: string; telegram: string; instagram: string; twitter: string; linkedin: string; youtube: string; address: string; showMap: boolean };
  faq: ContactFaq[];
  sectionTypes: ContactSectionTile[];
  fieldTypes: FieldTypeTile[];
  thankYou: { headline: string; body: string };
};

export const contactEditorFixture = (): ContactFixture => ({
  pageTitle: "Contact",
  slug: "contact",
  live: true,
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
  titleSlugAlts: [
    { title: "Contact", slug: "contact" },
    { title: "Get in touch", slug: "get-in-touch" },
    { title: "Work with me", slug: "work-with-me" },
    { title: "Say hi", slug: "say-hi" },
  ],
  seo: {
    title: "Contact Alexandra Silva — projects, collabs, talks",
    description:
      "Get in touch about coaching, speaking gigs, partnerships or general questions. I read every message and reply within 24h on weekdays.",
  },
  hero: {
    headline: "Let's work together.",
    sub: "For project briefs, coaching calls, speaking invitations or just a friendly hello — I usually reply within 24h on weekdays.",
    headlineIdeas: ["Let's work together", "Drop me a line", "Get in touch", "Book a project"],
  },
  form: {
    fields: [
      { id: "f-name", type: "short_text", icon: "Aa", name: "Name", typeName: "short text", required: true },
      { id: "f-email", type: "email", icon: "@", name: "Email", typeName: "email", required: true },
      { id: "f-subject", type: "short_text", icon: "Aa", name: "Subject", typeName: "short text" },
      { id: "f-inquiry", type: "dropdown", icon: "▾", name: "Inquiry type", typeName: "dropdown · 4 options" },
      { id: "f-message", type: "long_text", icon: "¶", name: "Message", typeName: "long text · textarea", required: true },
      { id: "f-consent", type: "consent", icon: "☑", name: "GDPR consent checkbox", typeName: "auto-added when EU compliance is on", required: true, locked: true, auto: true },
    ],
    submitLabel: "Send message",
    afterSubmit: "inline",
  },
  delivery: {
    forwardEmail: "hello@alexandrasilva.com",
    channels: [
      { id: "slack", icon: "💬", name: "Slack", sub: "Post each message to a Slack channel via webhook.", on: false, placeholder: "https://hooks.slack.com/services/T0/B0/XXXX" },
      { id: "discord", icon: "🎮", name: "Discord", sub: "Post to a Discord channel via webhook.", on: true, placeholder: "Discord webhook URL", value: "https://discord.com/api/webhooks/9876543210/abc123XYZ-defGHI" },
      { id: "notion", icon: "🗒", name: "Notion database", sub: "Append each message as a row in a Notion DB.", on: false, placeholder: "Notion database URL or ID" },
      { id: "make", icon: "🔁", name: "Make.com", sub: "Trigger a Make scenario via webhook.", on: false, placeholder: "https://hook.eu1.make.com/xxxxxxxxxxxx" },
      { id: "webhook", icon: "🔗", name: "Generic webhook", sub: "POST a JSON payload to any URL you control.", on: false, placeholder: "https://your-server.com/webhook/contact" },
    ],
    endpoint: "https://tadaify.com/wh/v1/alexandra/contact",
  },
  hours: {
    rows: [
      { day: "Mon", on: true, from: "09:00", to: "17:00" },
      { day: "Tue", on: true, from: "09:00", to: "17:00" },
      { day: "Wed", on: true, from: "09:00", to: "17:00" },
      { day: "Thu", on: true, from: "09:00", to: "17:00" },
      { day: "Fri", on: true, from: "09:00", to: "14:00" },
      { day: "Sat", on: false, from: "", to: "" },
      { day: "Sun", on: false, from: "", to: "" },
    ],
    timezone: "Europe/London (auto-detected)",
    responseTime: "Within 24 hours",
  },
  other: {
    email: "hello@alexandrasilva.com",
    phone: "+44 20 7946 0192",
    whatsapp: "+44 7700 900123",
    telegram: "",
    instagram: "@alexandrasilva",
    twitter: "@alex_silva",
    linkedin: "alexandra-silva",
    youtube: "",
    address: "71 Shoreditch High Street, London E1 6JJ, United Kingdom",
    showMap: true,
  },
  faq: [
    { id: "fq1", q: "How fast do you reply?", a: "Within 24h on weekdays. Weekends are off — I don't check email Sat/Sun on purpose. If it's truly urgent, mention \"URGENT\" in the subject and I'll triage faster." },
    { id: "fq2", q: "What's your typical project rate?", a: "Coaching packages start at £450 / month for 4 weekly sessions. One-off form-check sessions are £85. Custom programming is £600. Send me your goal in the form and I'll match you with the right option." },
    { id: "fq3", q: "Do you take on pro-bono / charity work?", a: "Yes — one project per quarter. Reach out with a short pitch (mission, audience, ask) and I'll let you know if it's a fit for the next slot." },
  ],
  sectionTypes: [
    { type: "hero", emoji: "🎯", name: "Hero", sub: "Headline + subhead + cover image. Sets the tone.", already: true },
    { type: "form", emoji: "📝", name: "Contact form", sub: "The actual form with configurable fields.", already: true },
    { type: "delivery", emoji: "📡", name: "Where messages go", sub: "Email forwarding + 3rd-party providers.", already: true },
    { type: "office-hours", emoji: "🕐", name: "Office hours", sub: "Schedule grid + response-time line.", tier: "creator" },
    { type: "other-methods", emoji: "📞", name: "Other contact methods", sub: "Phone, WhatsApp, social, address, map.", already: true },
    { type: "faq", emoji: "❓", name: "FAQ-quickref", sub: "Common questions inline before form.", tier: "creator", already: true },
    { type: "booking", emoji: "📅", name: "Booking calendar", sub: "Embed your Cal.com / Calendly schedule for direct bookings.", tier: "pro" },
    { type: "testimonials", emoji: "⭐", name: "Testimonials", sub: "Pull 2-3 quotes from happy clients to build trust." },
  ],
  fieldTypes: [
    { type: "short_text", emoji: "Aa", name: "Short text", sub: "Single line — name, subject, company." },
    { type: "long_text", emoji: "¶", name: "Long text", sub: "Multi-line textarea — message, description." },
    { type: "email", emoji: "@", name: "Email", sub: "Validated email field with browser keyboard." },
    { type: "phone", emoji: "📞", name: "Phone", sub: "Tel input with country-code prefix." },
    { type: "url", emoji: "🔗", name: "URL", sub: "Validated link — portfolio, social profile." },
    { type: "number", emoji: "#", name: "Number", sub: "Numeric — budget, headcount, age." },
    { type: "dropdown", emoji: "▾", name: "Dropdown", sub: "Pick one from a list — inquiry type, package." },
    { type: "checkboxes", emoji: "☑", name: "Multiselect checkboxes", sub: "Pick many — interests, services needed." },
    { type: "radio", emoji: "◉", name: "Radio choice", sub: "Pick one — visible buttons (vs dropdown)." },
    { type: "file", emoji: "📎", name: "File upload", sub: "PDF, image, or doc up to 10MB.", tier: "pro" },
    { type: "date", emoji: "📅", name: "Date picker", sub: "Calendar widget — preferred call date." },
    { type: "hidden", emoji: "🙈", name: "Hidden field", sub: "UTM tracking, source, referrer — invisible to visitor.", tier: "business" },
  ],
  thankYou: {
    headline: "Got it — thanks for reaching out!",
    body: "I read every message myself, so it might take up to 24h on weekdays. In the meantime, feel free to browse the latest essays or follow along on Instagram.",
  },
});
