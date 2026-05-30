/**
 * AppPageContact — Pages → Contact page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-contact.html (2175 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   0. Page settings — title, URL slug, publish toggle, common-alternative
 *      chips, theme color swatches, SEO expander (meta title, description,
 *      OG image), custom domain (Pro tier hint).
 *   1. Hero — headline + AI-suggest chips, sub-headline textarea, cover
 *      image drop-zone.
 *   2. Contact form — field builder list (Name, Email expanded + config,
 *      Subject, Inquiry type dropdown, Message, GDPR consent locked),
 *      Add field button; submit button label, after-submit select
 *      (inline / redirect / thank-you sub-page), spam protection toggle.
 *   3. Where messages go — email forwarding input + account-email chip,
 *      multi-recipient toggle (Business+), delivery channel cards
 *      (Slack, Discord [on], Notion, Make.com, Generic webhook),
 *      Pro tier hint, inbound endpoint copy.
 *   4. Office hours (Creator+) — display select, schedule grid (Mon–Fri on,
 *      Sat–Sun off), timezone select, response-time select.
 *   5. Other contact methods — business email + phone, messaging (WhatsApp,
 *      Telegram), social profiles (Instagram, X, LinkedIn, YouTube),
 *      physical address input, map embed toggle + preview.
 *   6. FAQ-quickref (Creator+) — 3 FAQ items + add question button.
 *   Add section row + Section picker modal (8 tile types).
 *   Field-type picker modal (12 tiles including tier-gated File/Hidden).
 *   Thank-you sub-page editor modal.
 *   Sticky save bar — auto-saved status, Preview, Discard, Save changes.
 *   Empty state — Use recommended layout / Add section.
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageContactProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AfterSubmitValue = "inline" | "redirect" | "thank-you";

interface FaqItem { id: string; q: string; a: string; }

// ─── Demo data ────────────────────────────────────────────────────────────────

const PAGE_SWATCHES = [
  { style: "var(--bg)",                                            label: "Inherit theme" },
  { style: "#FFFFFF",                                              label: "White" },
  { style: "#F8F4EE",                                              label: "Warm cream" },
  { style: "#1F2937",                                              label: "Slate" },
  { style: "#0B0F1E",                                              label: "Dark canvas" },
  { style: "linear-gradient(135deg,#FDE68A,#F59E0B)",              label: "Sunrise" },
  { style: "linear-gradient(135deg,#6366F1,#8B5CF6)",              label: "Indigo" },
  { style: "linear-gradient(135deg,#0F172A,#334155)",              label: "Nightfall" },
];

const TITLE_SLUG_CHIPS: Array<{ title: string; slug: string; label: string }> = [
  { title: "Contact",        slug: "contact",       label: "Contact · /contact" },
  { title: "Get in touch",   slug: "get-in-touch",  label: "Get in touch · /get-in-touch" },
  { title: "Work with me",   slug: "work-with-me",  label: "Work with me · /work-with-me" },
  { title: "Say hi",         slug: "say-hi",        label: "Say hi · /say-hi" },
];

const HEADLINE_CHIPS = [
  { text: "Let's work together.", value: "Let's work together." },
  { text: "Drop me a line.",      value: "Drop me a line." },
  { text: "Get in touch.",        value: "Get in touch." },
  { text: "Book a project.",      value: "Book a project." },
];

const SECTION_PICKER_TILES = [
  { id: "hero",         emoji: "🎯", name: "Hero",                sub: "Headline + subhead + cover image. Sets the tone.",           added: true },
  { id: "form",         emoji: "📝", name: "Contact form",        sub: "The actual form with configurable fields.",                   added: true },
  { id: "delivery",     emoji: "📡", name: "Where messages go",   sub: "Email forwarding + 3rd-party providers.",                    added: true },
  { id: "office-hours", emoji: "🕐", name: "Office hours",        sub: "Schedule grid + response-time line.", tier: "Creator+" },
  { id: "other",        emoji: "📞", name: "Other contact methods",sub: "Phone, WhatsApp, social, address, map.",                    added: false },
  { id: "faq",          emoji: "❓", name: "FAQ-quickref",        sub: "Common questions inline before form.", tier: "Creator+" },
  { id: "booking",      emoji: "📅", name: "Booking calendar",    sub: "Embed your Cal.com / Calendly schedule for direct bookings.", tier: "Pro" },
  { id: "testimonials", emoji: "⭐", name: "Testimonials",        sub: "Pull 2-3 quotes from happy clients to build trust.",         added: false },
];

const FIELD_TYPE_TILES = [
  { id: "short_text",  emoji: "Aa",  name: "Short text",              sub: "Single line — name, subject, company." },
  { id: "long_text",   emoji: "¶",   name: "Long text",               sub: "Multi-line textarea — message, description." },
  { id: "email",       emoji: "@",   name: "Email",                   sub: "Validated email field with browser keyboard." },
  { id: "phone",       emoji: "📞",  name: "Phone",                   sub: "Tel input with country-code prefix." },
  { id: "url",         emoji: "🔗",  name: "URL",                     sub: "Validated link — portfolio, social profile." },
  { id: "number",      emoji: "#",   name: "Number",                  sub: "Numeric — budget, headcount, age." },
  { id: "dropdown",    emoji: "▾",   name: "Dropdown",                sub: "Pick one from a list — inquiry type, package." },
  { id: "checkboxes",  emoji: "☑",   name: "Multiselect checkboxes",  sub: "Pick many — interests, services needed." },
  { id: "radio",       emoji: "◉",   name: "Radio choice",            sub: "Pick one — visible buttons (vs dropdown)." },
  { id: "file",        emoji: "📎",  name: "File upload",             sub: "PDF, image, or doc up to 10MB.", tier: "Pro" },
  { id: "date",        emoji: "📅",  name: "Date picker",             sub: "Calendar widget — preferred call date." },
  { id: "hidden",      emoji: "🙈",  name: "Hidden field",            sub: "UTM tracking, source, referrer — invisible to visitor.", tier: "Business" },
];

const INIT_FAQS: FaqItem[] = [
  { id: "fq1", q: "How fast do you reply?",                   a: "Within 24h on weekdays. Weekends are off — I don't check email Sat/Sun on purpose. If it's truly urgent, mention \"URGENT\" in the subject and I'll triage faster." },
  { id: "fq2", q: "What's your typical project rate?",        a: "Coaching packages start at £450 / month for 4 weekly sessions. One-off form-check sessions are £85. Custom programming is £600. Send me your goal in the form and I'll match you with the right option." },
  { id: "fq3", q: "Do you take on pro-bono / charity work?",  a: "Yes — one project per quarter. Reach out with a short pitch (mission, audience, ask) and I'll let you know if it's a fit for the next slot." },
];

const HOURS_DAYS = [
  { day: "Mon", active: true,  start: "09:00", end: "17:00" },
  { day: "Tue", active: true,  start: "09:00", end: "17:00" },
  { day: "Wed", active: true,  start: "09:00", end: "17:00" },
  { day: "Thu", active: true,  start: "09:00", end: "17:00" },
  { day: "Fri", active: true,  start: "09:00", end: "14:00" },
  { day: "Sat", active: false, start: "", end: "" },
  { day: "Sun", active: false, start: "", end: "" },
];

const DELIVERY_CHANNELS = [
  { id: "slack",   emoji: "💬", name: "Slack",            sub: "Post each message to a Slack channel via webhook.", isOn: false, placeholder: "https://hooks.slack.com/services/T00000000/B00000000/XXXX" },
  { id: "discord", emoji: "🎮", name: "Discord",          sub: "Post to a Discord channel via webhook.",            isOn: true,  value: "https://discord.com/api/webhooks/9876543210/abc123XYZ-defGHI" },
  { id: "notion",  emoji: "🗒", name: "Notion database", sub: "Append each message as a row in a Notion DB.",      isOn: false, placeholder: "Notion database URL or ID" },
  { id: "make",    emoji: "🔁", name: "Make.com",         sub: "Trigger a Make scenario via webhook.",              isOn: false, placeholder: "https://hook.eu1.make.com/xxxxxxxxxxxx" },
  { id: "webhook", emoji: "🔗", name: "Generic webhook",  sub: "POST a JSON payload to any URL you control.",       isOn: false, placeholder: "https://your-server.com/webhook/contact" },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-contact-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-contact-row-toggle">
      <div>
        <div className="app-page-contact-rt-name">{name}</div>
        <div className="app-page-contact-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-contact-tier-hint">
      <span className="app-page-contact-th-icon" aria-hidden="true">✨</span>
      <span>{children}</span>
    </div>
  );
}

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="15" cy="6"  r="1" />
      <circle cx="9"  cy="12" r="1" /><circle cx="15" cy="12" r="1" />
      <circle cx="9"  cy="18" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-contact-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-contact-swatch${sel === i ? " is-selected" : ""}`}
          style={{ background: s.style }}
          role="button"
          tabIndex={0}
          title={s.label}
          aria-label={s.label}
          onClick={() => setSel(i)}
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setSel(i); }}
        />
      ))}
    </div>
  );
}

function SectionCard({
  title,
  sub,
  onRemove,
  children,
}: {
  title: ReactNode;
  sub: string;
  onRemove?: () => void;
  children: ReactElement;
}): ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className={`app-page-contact-section${collapsed ? " is-collapsed" : ""}`}>
      <div className="app-page-contact-section-head">
        <span className="app-page-contact-sh-grip" aria-label="Drag to reorder"><GripSvg /></span>
        <h2>{title}</h2>
        <span className="app-page-contact-sub">{sub}</span>
        <span className="app-page-contact-head-spacer" />
        <div className="app-page-contact-sh-actions">
          <button
            className="app-page-contact-sh-collapse app-page-contact-iconbtn"
            type="button"
            aria-label="Collapse"
            onClick={() => setCollapsed((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
          {onRemove && (
            <button
              className="app-page-contact-iconbtn app-page-contact-iconbtn-danger"
              type="button"
              aria-label="Remove section"
              onClick={onRemove}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>
      </div>
      {!collapsed && <div className="app-page-contact-section-body">{children}</div>}
    </section>
  );
}

// ─── Delivery channel card ────────────────────────────────────────────────────

function DeliveryChannelCard({
  emoji, name, sub, isOn: initialOn, placeholder, value,
}: {
  emoji: string; name: string; sub: string;
  isOn: boolean; placeholder?: string; value?: string;
}): ReactElement {
  const [on, setOn] = useState(initialOn);
  return (
    <div
      className={`app-page-contact-dch-card${on ? " is-on" : ""}`}
      onClick={() => setOn((v) => !v)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setOn((v) => !v); }}
    >
      <div className="app-page-contact-dch-row">
        <div className="app-page-contact-dch-icon">{emoji}</div>
        <div className="app-page-contact-dch-name">{name}</div>
        <button
          className={`app-page-contact-toggle${on ? " is-on" : ""}`}
          type="button"
          aria-pressed={on}
          aria-label={`Toggle ${name}`}
          onClick={(e) => { e.stopPropagation(); setOn((v) => !v); }}
        />
      </div>
      <div className="app-page-contact-dch-sub">{sub}</div>
      {on && (
        <div className="app-page-contact-dch-config" onClick={(e) => e.stopPropagation()}>
          {/* TODO: wire to admin pages API */}
          <input type="url" placeholder={placeholder} defaultValue={value ?? ""} />
        </div>
      )}
    </div>
  );
}

// ─── Hours row ────────────────────────────────────────────────────────────────

function HoursRow({ day, active: initialActive, start, end }: {
  day: string; active: boolean; start: string; end: string;
}): ReactElement {
  const [active, setActive] = useState(initialActive);
  return (
    <div className={`app-page-contact-hours-row${!active ? " is-off" : ""}`}>
      <div className="app-page-contact-hr-day">
        <button
          className={`app-page-contact-toggle${active ? " is-on" : ""}`}
          type="button"
          aria-pressed={active}
          aria-label={`Toggle ${day}`}
          onClick={() => setActive((v) => !v)}
          style={{ transform: "scale(0.85)", transformOrigin: "left center" }}
        />
        {day}
      </div>
      <div className="app-page-contact-hr-times">
        {active ? (
          <>
            <input className="app-page-contact-hr-time" type="text" defaultValue={start} />
            <span className="app-page-contact-hr-sep">→</span>
            <input className="app-page-contact-hr-time" type="text" defaultValue={end} />
          </>
        ) : (
          <span className="app-page-contact-hr-closed">Closed</span>
        )}
      </div>
    </div>
  );
}

// ─── Section picker modal ─────────────────────────────────────────────────────

function SectionPickerModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-contact-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-sp-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-contact-modal">
        <div className="app-page-contact-modal-head">
          <h3 id="contact-sp-title">Add a section</h3>
          <span className="app-page-contact-head-spacer" />
          <button className="app-page-contact-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-contact-modal-body">
          <div className="app-page-contact-section-picker-grid">
            {SECTION_PICKER_TILES.map((t) => (
              <button key={t.id} className="app-page-contact-sp-card" type="button" onClick={onClose}>
                <span className="app-page-contact-sp-emoji">{t.emoji}</span>
                <span className="app-page-contact-sp-name">
                  {t.name}{t.tier && (
                    <>{" "}<span className="app-page-contact-tier-badge">{t.tier}</span></>
                  )}
                </span>
                <span className="app-page-contact-sp-sub">{t.sub}</span>
                {t.added && <span className="app-page-contact-sp-already">Already on page</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-contact-modal-foot">
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Pick a section to insert. You can drag to reorder once added.</span>
          <span style={{ flex: 1 }} />
          <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Field-type picker modal ──────────────────────────────────────────────────

function FieldTypePickerModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-contact-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-ftp-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-contact-modal">
        <div className="app-page-contact-modal-head">
          <h3 id="contact-ftp-title">Add a form field</h3>
          <span className="app-page-contact-head-spacer" />
          <button className="app-page-contact-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-contact-modal-body">
          <div className="app-page-contact-ftp-grid">
            {FIELD_TYPE_TILES.map((t) => (
              <button key={t.id} className="app-page-contact-ftp-card" type="button" onClick={onClose}>
                <span className="app-page-contact-ftp-emoji">{t.emoji}</span>
                <span className="app-page-contact-ftp-name">{t.name}</span>
                <span className="app-page-contact-ftp-sub">{t.sub}</span>
                {t.tier && (
                  <span className={`app-page-contact-tier-badge${t.tier === "Pro" ? " t-pro" : " t-business"}`}>
                    {t.tier === "Pro" ? "✨ Pro" : "🔒 Business"}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-contact-modal-foot">
          <span style={{ fontSize: 12, color: "var(--fg-muted)" }}>Tier-gated fields are addable now — we&apos;ll prompt at Save if your tier doesn&apos;t include them.</span>
          <span style={{ flex: 1 }} />
          <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Thank-you sub-page modal ─────────────────────────────────────────────────

function ThankYouModal({ handle, onClose }: { handle: string; onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-contact-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-ty-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-contact-modal app-page-contact-modal-md">
        <div className="app-page-contact-modal-head">
          <h3 id="contact-ty-title">🙏 Thank-you sub-page</h3>
          <span className="app-page-contact-head-spacer" />
          <button className="app-page-contact-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-contact-modal-body">
          <p style={{ fontSize: 13, color: "var(--fg-muted)", marginTop: 0 }}>
            Shown after a visitor submits the form. Lives at{" "}
            <code style={{ fontFamily: "var(--font-mono)", fontSize: 12 }}>tadaify.com/{handle}/contact/thanks</code>.
          </p>
          <div className="app-page-contact-field">
            <label className="app-page-contact-field-label" htmlFor="ty-headline">Headline</label>
            <div className="app-page-contact-field-prefix-wrap">
              <input id="ty-headline" type="text" defaultValue="Got it — thanks for reaching out!" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-contact-field-suffix-action" type="button">✨ Suggest</button>
            </div>
          </div>
          <div className="app-page-contact-field">
            <label className="app-page-contact-field-label" htmlFor="ty-body">Body</label>
            <textarea
              id="ty-body"
              className="app-page-contact-field-area"
              defaultValue="I read every message myself, so it might take up to 24h on weekdays. In the meantime, feel free to browse the latest essays or follow along on Instagram."
            />
          </div>
          <div className="app-page-contact-field">
            <label className="app-page-contact-field-label">
              Related links <span className="app-page-contact-field-hint">optional CTAs after the message</span>
            </label>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="app-page-contact-field-input" type="text" defaultValue="📚 Read the latest blog post" />
                <input className="app-page-contact-field-input" type="url" defaultValue="https://alexandrasilva.com/blog" style={{ flex: 0.7 }} />
              </div>
              <div style={{ display: "flex", gap: 6 }}>
                <input className="app-page-contact-field-input" type="text" defaultValue="📷 Follow on Instagram" />
                <input className="app-page-contact-field-input" type="url" defaultValue="https://instagram.com/alexandrasilva" style={{ flex: 0.7 }} />
              </div>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-contact-ff-add" type="button" style={{ marginTop: 4 }}>+ Add link</button>
            </div>
          </div>
        </div>
        <div className="app-page-contact-modal-foot">
          {/* TODO: wire to admin pages API */}
          <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button">Preview</button>
          <span style={{ flex: 1 }} />
          <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button" onClick={onClose}>Cancel</button>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-contact-btn app-page-contact-btn-primary app-page-contact-btn-sm" type="button" onClick={onClose}>Save thank-you page</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageContact({ handle }: AppPageContactProps): ReactElement {
  const [hasContent, setHasContent]           = useState(true);
  const [afterSubmit, setAfterSubmit]         = useState<AfterSubmitValue>("inline");
  const [sectionPickerOpen, setSectionPickerOpen] = useState(false);
  const [fieldTypePickerOpen, setFieldTypePickerOpen] = useState(false);
  const [thankYouOpen, setThankYouOpen]       = useState(false);
  const [showMap, setShowMap]                 = useState(true);
  const [faqs, setFaqs]                       = useState<FaqItem[]>(INIT_FAQS);

  const removeFaq = (id: string) => setFaqs((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="app-page-contact-root" aria-labelledby="app-page-contact-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-contact-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-contact-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-contact-crumb-sep">/</span>
        <span className="app-page-contact-crumb-here">Contact</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-contact-page-head">
        <div>
          <h1 id="app-page-contact-h1" className="app-page-contact-h1">
            <span className="app-page-contact-ph-emoji" aria-hidden="true">📮</span>
            Contact
          </h1>
          <p className="app-page-contact-sub">
            A serious channel for visitor inquiries, project requests and bookings — beyond a single mailto link.
          </p>
        </div>
        <div className="app-page-contact-actions">
          <span className="app-page-contact-url-pill">
            <span className="app-page-contact-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>contact</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasContent && (
        <div className="app-page-contact-empty-state">
          <div className="app-page-contact-es-emoji">📮</div>
          <h3>Your contact page is empty</h3>
          <p>Start with our recommended layout — Hero, Form, Where messages go and Other contact methods — or pick sections one at a time.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {/* TODO: wire to admin pages API */}
            <button className="app-page-contact-btn app-page-contact-btn-primary" type="button" onClick={() => setHasContent(true)}>
              ✨ Use recommended layout
            </button>
            <button className="app-page-contact-btn app-page-contact-btn-ghost" type="button" onClick={() => setSectionPickerOpen(true)}>
              + Add section
            </button>
          </div>
        </div>
      )}

      {/* ── Filled state ── */}
      {hasContent && (
        <>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 0 — Page settings
              ════════════════════════════════════════════════════════════════ */}
          <section className="app-page-contact-section" data-section-id="page-settings">
            <div className="app-page-contact-section-head">
              <span className="app-page-contact-sh-grip" style={{ opacity: 0.4 }} aria-label="Not draggable"><GripSvg /></span>
              <h2>Page settings</h2>
              <span className="app-page-contact-sub">Title, URL, theme &amp; SEO.</span>
              <span className="app-page-contact-head-spacer" />
              <span className="app-page-contact-chip app-page-contact-chip-live">Live</span>
            </div>
            <div className="app-page-contact-section-body">

              <div className="app-page-contact-field-row">
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-page-title">
                    Page title <span className="app-page-contact-field-hint">shown in the browser tab + on the page</span>
                  </label>
                  <input className="app-page-contact-field-input" id="contact-page-title" type="text" defaultValue="Contact" />
                </div>
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-page-slug">
                    URL slug <span className="app-page-contact-field-hint">letters, numbers, hyphens</span>
                  </label>
                  <div className="app-page-contact-field-prefix-wrap">
                    <span className="app-page-contact-field-prefix">tadaify.com/{handle}/</span>
                    <input id="contact-page-slug" type="text" defaultValue="contact" />
                  </div>
                </div>
              </div>

              <div className="app-page-contact-field-row">
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label">Publish</label>
                  <ToggleRow name="Page is live" sub="Visitors can find this page at the URL above." defaultOn />
                </div>
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label">
                    Common alternatives <span className="app-page-contact-field-hint">click to use as title + slug</span>
                  </label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {TITLE_SLUG_CHIPS.map((c) => (
                      <button key={c.slug} className="app-page-contact-chip" type="button" style={{ cursor: "pointer" }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Theme color <span className="app-page-contact-field-hint">override theme for this page only</span>
                </label>
                <SwatchRow />
              </div>

              <details className="app-page-contact-expander" style={{ marginTop: 14 }}>
                <summary>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
                  </svg>
                  SEO settings <span className="app-page-contact-ex-sub">— meta title, description, social card</span>
                  <svg className="app-page-contact-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <polyline points="6 15 12 9 18 15" />
                  </svg>
                </summary>
                <div className="app-page-contact-ex-body">
                  <div className="app-page-contact-field">
                    <label className="app-page-contact-field-label" htmlFor="contact-seo-title">
                      Meta title <span className="app-page-contact-field-hint">~60 chars · used by Google + share previews</span>
                    </label>
                    <div className="app-page-contact-field-prefix-wrap">
                      <input id="contact-seo-title" type="text" defaultValue="Contact Alexandra Silva — projects, collabs, talks" />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-contact-field-suffix-action" type="button">✨ Suggest</button>
                    </div>
                  </div>
                  <div className="app-page-contact-field">
                    <label className="app-page-contact-field-label" htmlFor="contact-seo-desc">
                      Meta description <span className="app-page-contact-field-hint">~155 chars</span>
                    </label>
                    <div className="app-page-contact-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                      <textarea
                        id="contact-seo-desc"
                        className="app-page-contact-field-area"
                        style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                        defaultValue="Get in touch about coaching, speaking gigs, partnerships or general questions. I read every message and reply within 24h on weekdays."
                      />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-contact-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                    </div>
                  </div>
                  <div className="app-page-contact-field">
                    <label className="app-page-contact-field-label">
                      OG image <span className="app-page-contact-field-hint">1200×630 — shown when shared on social</span>
                    </label>
                    <div className="app-page-contact-cover-drop" style={{ height: "auto", padding: 14 }}>
                      <span className="app-page-contact-cd-emoji">🖼</span>
                      <div className="app-page-contact-cd-title">Drop an image, or click to upload</div>
                      <div className="app-page-contact-cd-sub">
                        Or <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate one with AI</span>
                      </div>
                    </div>
                  </div>
                </div>
              </details>

              {/* Custom domain (Pro+) */}
              <div className="app-page-contact-field" style={{ marginTop: 14 }}>
                <label className="app-page-contact-field-label">
                  Custom domain <span className="app-page-contact-tier-badge t-pro">✨ Pro</span>
                </label>
                <div className="app-page-contact-field-prefix-wrap">
                  <input type="text" placeholder="e.g. contact.alexandrasilva.com" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-contact-field-suffix-action" type="button">Set up</button>
                </div>
                <TierHint>
                  Custom domains are a Pro feature. We&apos;ll prompt you to upgrade when you save.
                </TierHint>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1 — Hero
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard title="🎯 Hero" sub="Headline + subhead + optional cover image." onRemove={() => void 0}>
            <>
              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label" htmlFor="contact-hero-headline">
                  Headline <span className="app-page-contact-field-hint">large, friendly, first thing visitors see</span>
                </label>
                <div className="app-page-contact-field-prefix-wrap">
                  <input id="contact-hero-headline" type="text" defaultValue="Let's work together." />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-contact-field-suffix-action" type="button">✨ Suggest</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {HEADLINE_CHIPS.map((c) => (
                    <button key={c.value} className="app-page-contact-chip" type="button" style={{ cursor: "pointer" }}>{c.text}</button>
                  ))}
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label" htmlFor="contact-hero-sub">Sub-headline</label>
                <div className="app-page-contact-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="contact-hero-sub"
                    className="app-page-contact-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="For project briefs, coaching calls, speaking invitations or just a friendly hello — I usually reply within 24h on weekdays."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-contact-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Cover image / illustration <span className="app-page-contact-field-hint">optional — 800×600 recommended</span>
                </label>
                <div className="app-page-contact-cover-drop">
                  <span className="app-page-contact-cd-emoji">🖼</span>
                  <div className="app-page-contact-cd-title">Drop an image, or click to upload</div>
                  <div className="app-page-contact-cd-sub">JPG, PNG, WebP · max 5MB · or <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate with AI</span></div>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — Contact form
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard title="📝 Contact form" sub="Fields visitors fill in to reach you." onRemove={() => void 0}>
            <>
              {/* Form field builder list */}
              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Form fields <span className="app-page-contact-field-hint">drag to reorder · click a row to edit</span>
                </label>
                <div className="app-page-contact-ff-list">

                  {/* Field 1: Name */}
                  <div className="app-page-contact-ff-row">
                    <div className="app-page-contact-ff-grip" aria-label="Drag to reorder"><GripSvg /></div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">Aa</span>
                        <span className="app-page-contact-ff-name">Name</span>
                        <span className="app-page-contact-ff-type-name">· short text</span>
                        <span className="app-page-contact-chip app-page-contact-chip-required">Required</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span className="app-page-contact-ff-row-actions">
                          <span className="app-page-contact-ff-caret" aria-hidden="true">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                              <polyline points="6 9 12 15 18 9" />
                            </svg>
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 2: Email (expanded) */}
                  <div className="app-page-contact-ff-row is-expanded">
                    <div className="app-page-contact-ff-grip" aria-label="Drag to reorder"><GripSvg /></div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">@</span>
                        <span className="app-page-contact-ff-name">Email</span>
                        <span className="app-page-contact-ff-type-name">· email</span>
                        <span className="app-page-contact-chip app-page-contact-chip-required">Required</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span className="app-page-contact-ff-caret" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                      <div className="app-page-contact-ff-config">
                        <div className="app-page-contact-field-row">
                          <div className="app-page-contact-field">
                            <label className="app-page-contact-field-label">Label</label>
                            <input className="app-page-contact-field-input" type="text" defaultValue="Email" />
                          </div>
                          <div className="app-page-contact-field">
                            <label className="app-page-contact-field-label">Placeholder</label>
                            <input className="app-page-contact-field-input" type="text" defaultValue="you@example.com" />
                          </div>
                        </div>
                        <div className="app-page-contact-field-row">
                          <div className="app-page-contact-field">
                            <label className="app-page-contact-field-label">
                              Help text <span className="app-page-contact-field-hint">small caption shown below the field</span>
                            </label>
                            <input className="app-page-contact-field-input" type="text" defaultValue="We'll only use this to reply to you." />
                          </div>
                          <div className="app-page-contact-field">
                            <label className="app-page-contact-field-label">Required</label>
                            <ToggleRow
                              name="Visitor must fill this in"
                              sub="Email is the only way to reply — we recommend keeping this on."
                              defaultOn
                            />
                          </div>
                        </div>
                        <div className="app-page-contact-field" style={{ marginTop: 6 }}>
                          <label className="app-page-contact-field-label">
                            Conditional visibility{" "}
                            <span className="app-page-contact-tier-badge t-pro">✨ Pro</span>
                          </label>
                          <ToggleRow
                            name="Show this field only when…"
                            sub={'e.g. show "Project budget" only when "Inquiry type" = Booking. Lets you keep the form short.'}
                          />
                          <TierHint>
                            Conditional visibility is a Pro feature. We&apos;ll prompt you to upgrade when you save.
                          </TierHint>
                        </div>
                        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 8 }}>
                          {/* TODO: wire to admin pages API */}
                          <button className="app-page-contact-btn app-page-contact-btn-danger-ghost app-page-contact-btn-sm" type="button">Delete field</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Field 3: Subject */}
                  <div className="app-page-contact-ff-row">
                    <div className="app-page-contact-ff-grip" aria-label="Drag to reorder"><GripSvg /></div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">Aa</span>
                        <span className="app-page-contact-ff-name">Subject</span>
                        <span className="app-page-contact-ff-type-name">· short text</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span className="app-page-contact-ff-caret" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 4: Inquiry type (dropdown) */}
                  <div className="app-page-contact-ff-row">
                    <div className="app-page-contact-ff-grip" aria-label="Drag to reorder"><GripSvg /></div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">▾</span>
                        <span className="app-page-contact-ff-name">Inquiry type</span>
                        <span className="app-page-contact-ff-type-name">· dropdown · 4 options</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span className="app-page-contact-ff-caret" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 5: Message */}
                  <div className="app-page-contact-ff-row">
                    <div className="app-page-contact-ff-grip" aria-label="Drag to reorder"><GripSvg /></div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">¶</span>
                        <span className="app-page-contact-ff-name">Message</span>
                        <span className="app-page-contact-ff-type-name">· long text · textarea</span>
                        <span className="app-page-contact-chip app-page-contact-chip-required">Required</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span className="app-page-contact-ff-caret" aria-hidden="true">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Field 6: GDPR consent (locked) */}
                  <div className="app-page-contact-ff-row is-required-locked">
                    <div className="app-page-contact-ff-grip" style={{ opacity: 0.4, cursor: "not-allowed" }} aria-label="GDPR consent stays at the bottom">
                      <GripSvg />
                    </div>
                    <div className="app-page-contact-ff-main">
                      <div className="app-page-contact-ff-summary">
                        <span className="app-page-contact-ff-type-icon" aria-hidden="true">☑</span>
                        <span className="app-page-contact-ff-name">GDPR consent checkbox</span>
                        <span className="app-page-contact-ff-type-name">· auto-added when EU compliance is on</span>
                        <span className="app-page-contact-chip app-page-contact-chip-required">Required</span>
                        <span className="app-page-contact-ff-spacer" />
                        <span style={{ fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 999, background: "var(--success-bg)", color: "#065F46" }}>Auto</span>
                      </div>
                    </div>
                  </div>

                </div>
                {/* TODO: wire to admin pages API */}
                <button className="app-page-contact-ff-add" type="button" onClick={() => setFieldTypePickerOpen(true)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add field
                </button>
              </div>

              {/* Submit button + after-submit */}
              <div className="app-page-contact-field-row" style={{ marginTop: 18 }}>
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-submit-label">Submit button label</label>
                  <div className="app-page-contact-field-prefix-wrap">
                    <input id="contact-submit-label" type="text" defaultValue="Send message" />
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-contact-field-suffix-action" type="button">✨ Suggest</button>
                  </div>
                </div>
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-after-submit">After submit</label>
                  <select
                    className="app-page-contact-field-select"
                    id="contact-after-submit"
                    value={afterSubmit}
                    onChange={(e) => setAfterSubmit(e.target.value as AfterSubmitValue)}
                  >
                    <option value="inline">Show inline success message</option>
                    <option value="redirect">Redirect to a URL</option>
                    <option value="thank-you">Show a custom Thank-you sub-page</option>
                  </select>
                  {afterSubmit === "redirect" && (
                    <div style={{ marginTop: 6 }}>
                      <input className="app-page-contact-field-input" type="url" placeholder="https://yoursite.com/thanks" />
                    </div>
                  )}
                  {afterSubmit === "thank-you" && (
                    <div style={{ marginTop: 6 }}>
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button" onClick={() => setThankYouOpen(true)}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <polygon points="18.5 2.5 22 6 12 16 8 16 8 12 18.5 2.5" />
                        </svg>
                        Edit thank-you sub-page
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Spam protection */}
              <div className="app-page-contact-field" style={{ marginTop: 6 }}>
                <label className="app-page-contact-field-label">Spam protection</label>
                <ToggleRow
                  name="Invisible reCAPTCHA + honeypot"
                  sub={"Honeypot is always on. Invisible reCAPTCHA adds a Google check that runs in the background — visitors don't see it."}
                  defaultOn
                />
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3 — Where messages go
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard
            title="📡 Where messages go"
            sub="Email forwarding by default, plus optional third-party services. tadaify is a passthrough — we don't store messages."
            onRemove={() => void 0}
          >
            <>
              {/* Email forwarding */}
              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label" htmlFor="contact-forward-email">
                  Email forwarding <span className="app-page-contact-field-hint">we send each message here</span>
                </label>
                <div className="app-page-contact-field-row">
                  <div className="app-page-contact-field" style={{ marginBottom: 0 }}>
                    <input className="app-page-contact-field-input" id="contact-forward-email" type="email" defaultValue="hello@alexandrasilva.com" />
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                      <button className="app-page-contact-chip" type="button" style={{ cursor: "pointer" }}>
                        Use account email · alexandra@gmail.com
                      </button>
                    </div>
                  </div>
                  <div className="app-page-contact-field" style={{ marginBottom: 0 }}>
                    <label className="app-page-contact-field-label">
                      Send to multiple <span className="app-page-contact-tier-badge t-business">🔒 Business</span>
                    </label>
                    <ToggleRow
                      name="CC/BCC additional addresses"
                      sub="Useful for team inboxes — every message also goes to your assistant or partner."
                    />
                  </div>
                </div>
              </div>

              {/* Delivery channels (Pro+) */}
              <div className="app-page-contact-field" style={{ marginTop: 6 }}>
                <label className="app-page-contact-field-label">
                  Send to other tools{" "}
                  <span className="app-page-contact-tier-badge t-pro">✨ Pro</span>
                  <span className="app-page-contact-field-hint"> Optional — useful for team workflows. Same payload pattern as the Newsletter signup webhook.</span>
                </label>
                <div className="app-page-contact-delivery-channels">
                  {DELIVERY_CHANNELS.map((ch) => (
                    <DeliveryChannelCard
                      key={ch.id}
                      emoji={ch.emoji}
                      name={ch.name}
                      sub={ch.sub}
                      isOn={ch.isOn}
                      placeholder={ch.placeholder}
                      value={"value" in ch ? ch.value : undefined}
                    />
                  ))}
                </div>
                <TierHint>
                  Direct providers are a Pro feature. Toggles work in the editor; on Save we&apos;ll prompt you to upgrade if any provider is enabled.
                </TierHint>

                {/* Inbound endpoint */}
                <div style={{ marginTop: 12 }}>
                  <div style={{ fontSize: 12, color: "var(--fg-muted)", fontWeight: 600, marginBottom: 6 }}>
                    Your inbound endpoint{" "}
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>(for testing or external posting tools)</span>
                  </div>
                  <div className="app-page-contact-endpoint-row">
                    <code>https://tadaify.com/wh/v1/{handle}/contact</code>
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-contact-ep-copy" type="button">Copy</button>
                  </div>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4 — Office hours (Creator+)
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard
            title={<>🕐 Office hours <span className="app-page-contact-tier-badge t-creator">Creator+</span></>}
            sub="When you actually reply."
            onRemove={() => void 0}
          >
            <>
              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label" htmlFor="contact-hours-display">What to show on the page</label>
                <select className="app-page-contact-field-select" id="contact-hours-display" defaultValue="response">
                  <option value="schedule">Display schedule (full grid)</option>
                  <option value="response">{'"Replies usually within 24h"'}</option>
                  <option value="both">Both</option>
                </select>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Schedule grid <span className="app-page-contact-field-hint">toggle a day off to mark it as closed</span>
                </label>
                <div className="app-page-contact-hours-grid">
                  {HOURS_DAYS.map((d) => (
                    <HoursRow key={d.day} day={d.day} active={d.active} start={d.start} end={d.end} />
                  ))}
                </div>
              </div>

              <div className="app-page-contact-field-row">
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-hours-tz">Timezone</label>
                  <select className="app-page-contact-field-select" id="contact-hours-tz">
                    <option>Europe/London (auto-detected)</option>
                    <option>Europe/Berlin</option>
                    <option>Europe/Warsaw</option>
                    <option>America/New_York</option>
                    <option>America/Los_Angeles</option>
                    <option>Asia/Tokyo</option>
                  </select>
                </div>
                <div className="app-page-contact-field">
                  <label className="app-page-contact-field-label" htmlFor="contact-hours-response">Typical response time</label>
                  <select className="app-page-contact-field-select" id="contact-hours-response" defaultValue="24h">
                    <option value="1h">Within 1 hour</option>
                    <option value="4h">Within 4 hours</option>
                    <option value="24h">Within 24 hours</option>
                    <option value="2d">Within 2 business days</option>
                    <option value="1w">Within 1 week</option>
                  </select>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5 — Other contact methods
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard title="📞 Other contact methods" sub="Phone, social, address, map." onRemove={() => void 0}>
            <>
              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Public business email <span className="app-page-contact-field-hint">shown on the page · separate from forwarding above</span>
                </label>
                <div className="app-page-contact-other-methods">
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">✉️</div>
                    <input type="email" defaultValue="hello@alexandrasilva.com" />
                  </div>
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">📞</div>
                    <input type="tel" defaultValue="+44 20 7946 0192" placeholder="Phone (optional)" />
                  </div>
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">Messaging</label>
                <div className="app-page-contact-other-methods">
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">📱</div>
                    <input type="text" defaultValue="+44 7700 900123" placeholder="WhatsApp number (optional)" />
                  </div>
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">💬</div>
                    <input type="text" placeholder="Telegram handle (optional)" />
                  </div>
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Social profiles <span className="app-page-contact-field-hint">visitors can DM you here too · pulled from main page if blank</span>
                </label>
                <div className="app-page-contact-other-methods">
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">📷</div>
                    <input type="text" defaultValue="@alexandrasilva" placeholder="Instagram handle" />
                  </div>
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">🐦</div>
                    <input type="text" defaultValue="@alex_silva" placeholder="X / Twitter handle" />
                  </div>
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">💼</div>
                    <input type="text" defaultValue="alexandra-silva" placeholder="LinkedIn handle" />
                  </div>
                  <div className="app-page-contact-om-card">
                    <div className="app-page-contact-om-icon">▶️</div>
                    <input type="text" placeholder="YouTube channel" />
                  </div>
                </div>
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">
                  Physical address <span className="app-page-contact-field-hint">optional — for service businesses or studios</span>
                </label>
                <input className="app-page-contact-field-input" type="text" defaultValue="71 Shoreditch High Street, London E1 6JJ, United Kingdom" />
              </div>

              <div className="app-page-contact-field">
                <label className="app-page-contact-field-label">Show map embed</label>
                <div className="app-page-contact-row-toggle" style={{ marginBottom: 10 }}>
                  <div>
                    <div className="app-page-contact-rt-name">Embed a map under the address</div>
                    <div className="app-page-contact-rt-sub">Uses the Embedded block oEmbed pattern — Google Maps via iframe by default; OpenStreetMap as a fallback.</div>
                  </div>
                  <button
                    className={`app-page-contact-toggle${showMap ? " is-on" : ""}`}
                    type="button"
                    aria-pressed={showMap}
                    aria-label="Toggle map"
                    onClick={() => setShowMap((v) => !v)}
                  />
                </div>
                {showMap && (
                  <div className="app-page-contact-map-preview" aria-label="Map preview">
                    <span className="app-page-contact-mp-pin" aria-hidden="true">📍</span>
                  </div>
                )}
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 6 — FAQ-quickref (Creator+)
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard
            title={<>❓ FAQ-quickref <span className="app-page-contact-tier-badge t-creator">Creator+</span></>}
            sub="3-5 common questions inline · cuts down dumb inquiries."
            onRemove={() => void 0}
          >
            <>
              {faqs.map((f) => (
                <div key={f.id} className="app-page-contact-faq-item">
                  <div className="app-page-contact-faq-head">
                    <span className="app-page-contact-faq-grip" aria-hidden="true">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <circle cx="9"  cy="6"  r="1" /><circle cx="15" cy="6"  r="1" />
                        <circle cx="9"  cy="12" r="1" /><circle cx="15" cy="12" r="1" />
                        <circle cx="9"  cy="18" r="1" /><circle cx="15" cy="18" r="1" />
                      </svg>
                    </span>
                    <input className="app-page-contact-faq-q" type="text" defaultValue={f.q} />
                    <button
                      className="app-page-contact-iconbtn app-page-contact-iconbtn-danger"
                      type="button"
                      aria-label="Delete"
                      onClick={() => removeFaq(f.id)}
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <textarea className="app-page-contact-faq-a" defaultValue={f.a} />
                </div>
              ))}
              {/* TODO: wire to admin pages API */}
              <button className="app-page-contact-ff-add" type="button">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add question
              </button>
            </>
          </SectionCard>

          {/* ── Add section row ── */}
          <div className="app-page-contact-add-section-row">
            {/* TODO: wire to admin pages API */}
            <button className="app-page-contact-add-section-btn" type="button" onClick={() => setSectionPickerOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add section
            </button>
          </div>

        </>
      )}

      {/* ── Sticky save bar ── */}
      <div className="app-page-contact-save-bar" role="status" aria-live="polite">
        <span className="app-page-contact-save-status">
          <span className="app-page-contact-ss-dot" aria-hidden="true" />
          All changes saved · 12s ago
        </span>
        <span className="app-page-contact-foot-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button">Preview</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-contact-btn app-page-contact-btn-ghost app-page-contact-btn-sm" type="button">Discard</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-contact-btn app-page-contact-btn-primary app-page-contact-btn-sm" type="button">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} aria-hidden="true">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
            <polyline points="17 21 17 13 7 13 7 21" /><polyline points="7 3 7 8 15 8" />
          </svg>
          Save changes
        </button>
      </div>

      {/* ── Modals ── */}
      {sectionPickerOpen  && <SectionPickerModal onClose={() => setSectionPickerOpen(false)} />}
      {fieldTypePickerOpen && <FieldTypePickerModal onClose={() => setFieldTypePickerOpen(false)} />}
      {thankYouOpen       && <ThankYouModal handle={handle} onClose={() => setThankYouOpen(false)} />}

    </div>
  );
}
