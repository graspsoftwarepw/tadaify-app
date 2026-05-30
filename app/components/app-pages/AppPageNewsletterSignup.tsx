/**
 * AppPageNewsletterSignup — Pages → Newsletter signup page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-newsletter-signup.html (2133 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   0. Page settings — title, URL slug, publish toggle, common-alternative
 *      chips, theme color swatches, SEO expander (meta title, description,
 *      OG image), custom domain (Pro), A/B test variants (Business).
 *   1. Hero — headline + AI-suggest chips, sub-headline, cover image drop-zone.
 *   2. Email provider — select (7 options: Kit, Beehiiv, MailerLite, Mailchimp,
 *      Klaviyo, Google Sheets, Generic webhook), per-provider panel
 *      (API key + test + list / audience / tab / DOI toggle / name capture /
 *      Google Sign-in / webhook URL + payload + endpoint), success message.
 *   3. Signup form — layout picker (one-line, two-line, centered card),
 *      email placeholder, button label, GDPR consent toggle + copy.
 *   4. Social proof — style select, count template, live-count toggle,
 *      public-count toggle, testimonial bullet list.
 *   5. What you'll get — section heading, emoji-bullet list.
 *   6. Past issues preview (Creator+) — display toggle + 3 post cards.
 *   7. FAQ — Q&A items + add question button.
 *   8. Footer CTA — closing headline, button label, social-fallback copy,
 *      show-socials toggle.
 *   Section picker modal — 11 section type tiles.
 *   Image picker modal — drop-zone + colour library swatches.
 *   Sticky save bar — auto-saved status, Discard, Save changes.
 *   Empty state — Use recommended layout / Add section.
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageNewsletterSignupProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ProviderKey = "kit" | "beehiiv" | "mailerlite" | "mailchimp" | "klaviyo" | "google-sheets" | "webhook";
type LayoutKey   = "oneline" | "twoline" | "card";

interface BulletItem { id: string; emoji: string; text: string; }
interface FaqItem    { id: string; q: string; a: string; }
interface PastIssue  { id: string; coverTheme: string; coverEmoji: string; title: string; excerpt: string; meta: string; }

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

const HEADLINE_CHIPS = [
  "Get my weekly notes",
  "Never miss a release",
  "Join 12k creators learning X",
  "Curated insights every Tuesday",
];

const TITLE_SLUG_CHIPS: Array<{ title: string; slug: string; label: string }> = [
  { title: "Subscribe",      slug: "subscribe",      label: "Subscribe · /subscribe" },
  { title: "Newsletter",     slug: "newsletter",     label: "Newsletter · /newsletter" },
  { title: "Stay in touch",  slug: "stay-in-touch",  label: "Stay in touch · /stay-in-touch" },
  { title: "Updates",        slug: "updates",        label: "Updates · /updates" },
];

const INIT_BULLETS: BulletItem[] = [
  { id: "b1", emoji: "📅", text: "One short essay every Tuesday — usually 4-7 minutes to read." },
  { id: "b2", emoji: "🏋️", text: "Weekly drills you can try in your next session — no fancy gear." },
  { id: "b3", emoji: "🛌", text: "Recovery + sleep tactics that actually work for non-athletes." },
  { id: "b4", emoji: "💌", text: "Behind-the-scenes from my own training — the failures included." },
];

const INIT_QUOTES: Array<{ id: string; text: string }> = [
  { id: "q1", text: '"Best fitness newsletter I read. Honest, no-fluff." — Mira, Berlin' },
  { id: "q2", text: '"Alex\'s Tuesday emails are the only ones I open every week." — Daniel, NYC' },
];

const INIT_FAQS: FaqItem[] = [
  { id: "f1", q: "How often will you email me?", a: "Once a week, every Tuesday morning. Sometimes a bonus drop alert when something time-sensitive lands. Never daily, never twice in one day." },
  { id: "f2", q: "Can I unsubscribe at any time?", a: "Yes — every email has a one-click unsubscribe link in the footer. No survey, no \"are you sure\" — instant." },
  { id: "f3", q: "Will you sell or share my email?", a: "Never. Your email lives in my Kit account and that's it. I don't sell, share, swap or rent lists. GDPR-compliant by default." },
];

const PAST_ISSUES: PastIssue[] = [
  { id: "p1", coverTheme: "t-warm", coverEmoji: "📈", title: "Why I stopped chasing PRs",        excerpt: "Hitting a wall at 165kg taught me more about programming than any deload week ever did.", meta: "Apr 22 · 6 min read" },
  { id: "p2", coverTheme: "",       coverEmoji: "💤", title: "Sleep is the cheat code",          excerpt: "Three small experiments that doubled my deep-sleep minutes — backed by my Whoop data.",   meta: "Apr 15 · 5 min read" },
  { id: "p3", coverTheme: "t-rose", coverEmoji: "🧠", title: "Mental reps > physical reps",      excerpt: "Visualisation is real, but only if you do it the way Olympic divers do — not the way Instagram does.", meta: "Apr 08 · 7 min read" },
];

const SECTION_PICKER_TILES = [
  { id: "hero",           emoji: "🎯", name: "Hero",              sub: "Big headline + sub-headline + optional image. The first thing visitors read.", added: true },
  { id: "provider",       emoji: "🔌", name: "Email provider",    sub: "Where new subscribers land — Kit, Beehiiv, Mailchimp + 4 more.", added: true },
  { id: "form",           emoji: "📝", name: "Signup form",       sub: "Email field + button. Three layout variants.", added: true },
  { id: "social-proof",   emoji: "⭐", name: "Social proof",      sub: "Subscriber count + testimonial quotes.", added: true },
  { id: "wyg",            emoji: "📬", name: "What you'll get",   sub: "Bullet list — frequency, topics, format.", added: true },
  { id: "past-issues",    emoji: "📰", name: "Past issues",       sub: "3 most recent posts pulled from your provider.", added: false },
  { id: "faq",            emoji: "❓", name: "FAQ",               sub: "3-5 Q&A pairs. Tackle objections before they kill the signup.", added: true },
  { id: "footer-cta",     emoji: "🚀", name: "Footer CTA",        sub: "Closing button + social fallback for hesitant visitors.", added: true },
  { id: "cover-image",    emoji: "🖼", name: "Full-width image",  sub: "A standalone image break between sections.", added: false },
  { id: "quote",          emoji: "💬", name: "Pull quote",        sub: "A single large quote from a subscriber or press mention.", added: false },
  { id: "video",          emoji: "🎬", name: "Video intro",       sub: "YouTube or Vimeo embed — for creators who want a personal hello.", added: false },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-newsletter-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-newsletter-row-toggle">
      <div>
        <div className="app-page-newsletter-rt-name">{name}</div>
        <div className="app-page-newsletter-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-newsletter-tier-hint">
      <span className="app-page-newsletter-th-icon" aria-hidden="true">💡</span>
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

function SwatchRow({ swatches }: { swatches: typeof PAGE_SWATCHES }): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-newsletter-swatch-row">
      {swatches.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-newsletter-swatch${sel === i ? " is-selected" : ""}`}
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
  icon,
  title,
  sub,
  chip,
  children,
  onRemove,
}: {
  icon: string;
  title: string;
  sub: string;
  chip?: ReactElement;
  children: ReactElement;
  onRemove?: () => void;
}): ReactElement {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <section className={`app-page-newsletter-section${collapsed ? " is-collapsed" : ""}`}>
      <div className="app-page-newsletter-section-head">
        <span className="app-page-newsletter-sh-grip" aria-label="Drag to reorder"><GripSvg /></span>
        <h2>{icon} {title}{chip ? <>{" "}{chip}</> : null}</h2>
        <span className="app-page-newsletter-sub">{sub}</span>
        <span className="app-page-newsletter-head-spacer" />
        <div className="app-page-newsletter-sh-actions">
          <button
            className="app-page-newsletter-sh-collapse app-page-newsletter-iconbtn"
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
              className="app-page-newsletter-iconbtn"
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
      {!collapsed && <div className="app-page-newsletter-section-body">{children}</div>}
    </section>
  );
}

// ─── Provider panels ──────────────────────────────────────────────────────────

function KitPanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect Kit</span>
        <span className="app-page-newsletter-nlt-panel-sub">Find your API key in Kit Settings → Account → API.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">API key</label>
        <div className="app-page-newsletter-nlt-key-row">
          <input type="password" autoComplete="off" spellCheck={false} placeholder="Paste your Kit API key" defaultValue="cnvrt_••••••••••••••••aB42" />
          {/* TODO: wire to admin pages API */}
          <button type="button" className="app-page-newsletter-nlt-key-show" aria-label="Show / hide key">👁</button>
        </div>
        <div className="app-page-newsletter-help">Stored encrypted in tadaify Vault — never shown after save.</div>
      </div>
      <div className="app-page-newsletter-field app-page-newsletter-nlt-test-field">
        {/* TODO: wire to admin pages API */}
        <button type="button" className="app-page-newsletter-nlt-test-btn">Test connection</button>
        <span className="app-page-newsletter-nlt-test-badge is-success">✓ Connected</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">List / audience</label>
        <select>
          <option>Pick a list…</option>
          <option>Main signup form</option>
          <option>New drops alerts</option>
          <option>VIP early access</option>
        </select>
        <div className="app-page-newsletter-help">Where new subscribers from this page will land.</div>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label" htmlFor="nlt-tag-kit">Source tag</label>
        <input id="nlt-tag-kit" type="text" defaultValue="tadaify-alexandra-subscribe-page" />
        <div className="app-page-newsletter-help">Identifies subscribers who came in through this subscribe page — handy for segmenting later.</div>
      </div>
    </div>
  );
}

function BeehiivPanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect Beehiiv</span>
        <span className="app-page-newsletter-nlt-panel-sub">Find your API key in Beehiiv Settings → Integrations → API.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">API key</label>
        <div className="app-page-newsletter-nlt-key-row">
          <input type="password" placeholder="Paste your Beehiiv API key" />
          <button type="button" className="app-page-newsletter-nlt-key-show">👁</button>
        </div>
        <div className="app-page-newsletter-help">Stored encrypted in tadaify Vault.</div>
      </div>
      <div className="app-page-newsletter-field app-page-newsletter-nlt-test-field">
        <button type="button" className="app-page-newsletter-nlt-test-btn">Test connection</button>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">Publication</label>
        <select>
          <option>Pick a publication…</option>
          <option>alexandra.beehiiv.com</option>
          <option>Alex Weekly</option>
        </select>
      </div>
      <div className="app-page-newsletter-nlt-toggle-row">
        <div className="app-page-newsletter-nlt-lbl">
          <div className="app-page-newsletter-nlt-t">Double opt-in (recommended)</div>
          <div className="app-page-newsletter-nlt-s">Sends a confirmation email before adding the subscriber. Improves deliverability and matches GDPR best practice.</div>
        </div>
        <Toggle defaultOn />
      </div>
    </div>
  );
}

function MailerLitePanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect MailerLite</span>
        <span className="app-page-newsletter-nlt-panel-sub">Find your API key in MailerLite Integrations → Developer API.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">API key</label>
        <div className="app-page-newsletter-nlt-key-row">
          <input type="password" placeholder="Paste your MailerLite API key" />
          <button type="button" className="app-page-newsletter-nlt-key-show">👁</button>
        </div>
      </div>
      <div className="app-page-newsletter-field app-page-newsletter-nlt-test-field">
        <button type="button" className="app-page-newsletter-nlt-test-btn">Test connection</button>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">Group</label>
        <select>
          <option>Pick a group…</option>
          <option>Main subscribers</option>
          <option>New release alerts</option>
        </select>
      </div>
    </div>
  );
}

function MailchimpPanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect Mailchimp</span>
        <span className="app-page-newsletter-nlt-panel-sub">Find your API key in Mailchimp Account → Extras → API keys.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">API key</label>
        <div className="app-page-newsletter-nlt-key-row">
          <input type="password" placeholder="Paste your Mailchimp API key (e.g. abc123-us17)" />
          <button type="button" className="app-page-newsletter-nlt-key-show">👁</button>
        </div>
      </div>
      <div className="app-page-newsletter-field app-page-newsletter-nlt-test-field">
        <button type="button" className="app-page-newsletter-nlt-test-btn">Test connection</button>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">Audience</label>
        <select>
          <option>Pick an audience…</option>
          <option>Main audience</option>
          <option>Drops &amp; releases</option>
        </select>
      </div>
    </div>
  );
}

function KlaviyoPanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect Klaviyo</span>
        <span className="app-page-newsletter-nlt-panel-sub">Find your private API key in Klaviyo Settings → API keys.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">API key</label>
        <div className="app-page-newsletter-nlt-key-row">
          <input type="password" placeholder="Paste your Klaviyo private API key" />
          <button type="button" className="app-page-newsletter-nlt-key-show">👁</button>
        </div>
      </div>
      <div className="app-page-newsletter-field app-page-newsletter-nlt-test-field">
        <button type="button" className="app-page-newsletter-nlt-test-btn">Test connection</button>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">List</label>
        <select>
          <option>Pick a list…</option>
          <option>Main list</option>
          <option>VIP segment</option>
        </select>
      </div>
      <div className="app-page-newsletter-nlt-toggle-row">
        <div className="app-page-newsletter-nlt-lbl">
          <div className="app-page-newsletter-nlt-t">Capture name field</div>
          <div className="app-page-newsletter-nlt-s">Show a {"\"Name\""} input next to the email field on the public page.</div>
        </div>
        <Toggle defaultOn />
      </div>
    </div>
  );
}

function GoogleSheetsPanel(): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Connect Google Sheets</span>
        <span className="app-page-newsletter-nlt-panel-sub">Subscribers append to a row in your sheet.</span>
      </div>
      <div className="app-page-newsletter-field">
        {/* TODO: wire to admin pages API */}
        <button type="button" className="app-page-newsletter-nlt-gsheets-signin">
          <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
            <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
            <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
            <path fill="#FBBC05" d="M11.69 28.18c-.44-1.32-.69-2.73-.69-4.18s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
            <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
          </svg>
          <span>Sign in with Google</span>
        </button>
        <div className="app-page-newsletter-help">We only request access to the sheet you choose. You can revoke access at any time in your Google account.</div>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">Sheet</label>
        <select disabled><option>Sign in first to load sheets</option></select>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label" htmlFor="nlt-tab">Append to tab</label>
        <input id="nlt-tab" type="text" defaultValue="Subscribers" />
        <div className="app-page-newsletter-help">{"If the tab doesn't exist yet, we'll create it on the first signup."}</div>
      </div>
    </div>
  );
}

function WebhookPanel({ handle }: { handle: string }): ReactElement {
  return (
    <div className="app-page-newsletter-nlt-panel">
      <div className="app-page-newsletter-nlt-panel-head">
        <span className="app-page-newsletter-nlt-panel-title">Generic webhook</span>
        <span className="app-page-newsletter-nlt-panel-sub">Send signups to any HTTPS endpoint you control.</span>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label" htmlFor="webhook-url">Webhook URL</label>
        <input id="webhook-url" type="url" placeholder="https://your-server.com/api/newsletter" />
        <div className="app-page-newsletter-help">We POST a JSON payload to this URL on every signup. Must be HTTPS. Should respond within 5 seconds.</div>
      </div>
      <div className="app-page-newsletter-field">
        <label className="app-page-newsletter-field-label">Or use our endpoint</label>
        <div className="app-page-newsletter-nlt-our-endpoint">
          <code>https://tadaify.com/wh/v1/{handle}</code>
          {/* TODO: wire to admin pages API */}
          <button type="button" className="app-page-newsletter-nlt-copy-btn">Copy</button>
        </div>
        <div className="app-page-newsletter-help">{"If you don't have a server yet, point at this URL — we'll forward signups to your inbox while you set things up."}</div>
      </div>
      <details className="app-page-newsletter-nlt-payload-details">
        <summary>Payload schema</summary>
        <pre className="app-page-newsletter-nlt-payload"><code>{`{
  "email": "fan@example.com",
  "name": "Fan name (if captured)",
  "source": "tadaify-${handle}-subscribe-page",
  "page_id": "page_a1b2c3",
  "submitted_at": "2026-04-26T18:14:22Z"
}`}</code></pre>
        <div className="app-page-newsletter-help">Fields are stable — we add new optional fields without breaking your integration.</div>
      </details>
    </div>
  );
}

// ─── Layout picker card ───────────────────────────────────────────────────────

function LayoutCard({ id, name, sub, selected, onSelect, children }: {
  id: LayoutKey; name: string; sub: string;
  selected: boolean; onSelect: () => void; children: ReactElement;
}): ReactElement {
  return (
    <div
      className={`app-page-newsletter-lp-card${selected ? " is-selected" : ""}`}
      role="button"
      tabIndex={0}
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onSelect(); }}
      aria-pressed={selected}
    >
      <div className="app-page-newsletter-lp-name">
        <span className={`app-page-newsletter-lp-check${selected ? " is-visible" : ""}`}>✓</span>
        {" "}{name}
      </div>
      {children}
      <div className="app-page-newsletter-lp-sub">{sub}</div>
    </div>
  );
}

// ─── Section picker modal ─────────────────────────────────────────────────────

function SectionPickerModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-newsletter-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nlt-sp-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-newsletter-modal">
        <div className="app-page-newsletter-modal-head">
          <h3 id="nlt-sp-title">Add a section</h3>
          <span className="app-page-newsletter-head-spacer" />
          <button className="app-page-newsletter-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-newsletter-modal-body">
          <p style={{ color: "var(--fg-muted)", fontSize: 13, marginTop: 0, marginBottom: 14 }}>
            Pick the kind of section you want to add. Sections you{"'"}ve already added show an {"\"added\""} badge — click again to add a second one.
          </p>
          <div className="app-page-newsletter-section-picker-grid">
            {SECTION_PICKER_TILES.map((t) => (
              <button
                key={t.id}
                className="app-page-newsletter-sp-card"
                type="button"
                onClick={onClose}
              >
                <span className="app-page-newsletter-sp-emoji">{t.emoji}</span>
                <span className="app-page-newsletter-sp-name">{t.name}</span>
                <span className="app-page-newsletter-sp-sub">{t.sub}</span>
                {t.added && <span className="app-page-newsletter-sp-already">Added</span>}
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-newsletter-modal-foot">
          <span style={{ color: "var(--fg-muted)", fontSize: 12 }}>Sections can be reordered, removed, or added more than once.</span>
          <span className="app-page-newsletter-foot-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-newsletter-btn app-page-newsletter-btn-ghost app-page-newsletter-btn-sm" type="button" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  );
}

// ─── Image picker modal ───────────────────────────────────────────────────────

function ImagePickerModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-newsletter-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="nlt-ip-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-newsletter-modal app-page-newsletter-modal-sm">
        <div className="app-page-newsletter-modal-head">
          <h3 id="nlt-ip-title">Add an image</h3>
          <span className="app-page-newsletter-head-spacer" />
          <button className="app-page-newsletter-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-newsletter-modal-body">
          <div className="app-page-newsletter-cover-drop" style={{ height: 160 }}>
            <span className="app-page-newsletter-cd-emoji">🖼</span>
            <div className="app-page-newsletter-cd-title">Drop an image here, or click to browse</div>
            <div className="app-page-newsletter-cd-sub">JPG, PNG, WebP · max 5MB</div>
          </div>
          <p style={{ margin: "18px 0 8px", fontWeight: 600, fontSize: 13 }}>Or pick from your library:</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8 }}>
            {[
              "linear-gradient(135deg,#FDE68A,#F59E0B)",
              "linear-gradient(135deg,#6366F1,#8B5CF6)",
              "linear-gradient(135deg,#FB7185,#BE185D)",
              "linear-gradient(135deg,#34D399,#047857)",
            ].map((bg) => (
              <div key={bg} style={{ aspectRatio: "1", borderRadius: 8, background: bg, cursor: "pointer" }} />
            ))}
          </div>
        </div>
        <div className="app-page-newsletter-modal-foot">
          {/* TODO: wire to admin pages API */}
          <button className="app-page-newsletter-btn app-page-newsletter-btn-warm app-page-newsletter-btn-sm" type="button">✨ Generate with AI</button>
          <span className="app-page-newsletter-foot-spacer" />
          <button className="app-page-newsletter-btn app-page-newsletter-btn-ghost app-page-newsletter-btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button className="app-page-newsletter-btn app-page-newsletter-btn-primary app-page-newsletter-btn-sm" type="button" onClick={onClose}>Use selected</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageNewsletterSignup({ handle }: AppPageNewsletterSignupProps): ReactElement {
  const [provider, setProvider]             = useState<ProviderKey>("kit");
  const [layout, setLayout]                 = useState<LayoutKey>("oneline");
  const [pickerOpen, setPickerOpen]         = useState(false);
  const [imagePickerOpen, setImagePickerOpen] = useState(false);
  const [hasContent, setHasContent]         = useState(true);

  const [bullets, setBullets] = useState<BulletItem[]>(INIT_BULLETS);
  const [quotes, setQuotes]   = useState(INIT_QUOTES);
  const [faqs, setFaqs]       = useState<FaqItem[]>(INIT_FAQS);

  const removeBullet = (id: string) => setBullets((prev) => prev.filter((b) => b.id !== id));
  const removeQuote  = (id: string) => setQuotes((prev) => prev.filter((q) => q.id !== id));
  const removeFaq    = (id: string) => setFaqs((prev) => prev.filter((f) => f.id !== id));

  return (
    <div className="app-page-newsletter-root" aria-labelledby="app-page-newsletter-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-newsletter-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-newsletter-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-newsletter-crumb-sep">/</span>
        <span className="app-page-newsletter-crumb-here">Newsletter signup</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-newsletter-page-head">
        <div>
          <h1 id="app-page-newsletter-h1" className="app-page-newsletter-h1">
            <span className="app-page-newsletter-ph-emoji" aria-hidden="true">✉️</span>
            Newsletter signup
          </h1>
          <p className="app-page-newsletter-sub">
            A dedicated landing page focused on one job: turning a visitor into a subscriber. Substack/Beehiiv-style — no other distractions.
          </p>
        </div>
        <div className="app-page-newsletter-actions">
          <span className="app-page-newsletter-url-pill">
            <span className="app-page-newsletter-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>subscribe</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-newsletter-btn app-page-newsletter-btn-ghost app-page-newsletter-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ── Empty state ── */}
      {!hasContent && (
        <div className="app-page-newsletter-empty-state">
          <div className="app-page-newsletter-es-emoji">✉️</div>
          <h3>Your subscribe page is empty</h3>
          <p>Start with our recommended layout — Hero, Provider, Signup form, What you{"'"}ll get and FAQ — or pick sections one at a time.</p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            {/* TODO: wire to admin pages API */}
            <button className="app-page-newsletter-btn app-page-newsletter-btn-primary" type="button" onClick={() => setHasContent(true)}>
              ✨ Use recommended layout
            </button>
            <button className="app-page-newsletter-btn app-page-newsletter-btn-ghost" type="button" onClick={() => setPickerOpen(true)}>
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
          <section className="app-page-newsletter-section" data-section-id="page-settings">
            <div className="app-page-newsletter-section-head" style={{ borderBottom: "1px solid var(--border)" }}>
              <span className="app-page-newsletter-sh-grip" style={{ opacity: 0.4 }} aria-label="Not draggable"><GripSvg /></span>
              <h2>Page settings</h2>
              <span className="app-page-newsletter-sub">Title, URL, theme &amp; SEO.</span>
              <span className="app-page-newsletter-head-spacer" />
              <span className="app-page-newsletter-chip app-page-newsletter-chip-live">Live</span>
            </div>
            <div className="app-page-newsletter-section-body">

              <div className="app-page-newsletter-field-row">
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-page-title">
                    Page title <span className="app-page-newsletter-field-hint">shown in the browser tab + on the page</span>
                  </label>
                  <input className="app-page-newsletter-field-input" id="nlt-page-title" type="text" defaultValue="Subscribe" />
                </div>
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-page-slug">
                    URL slug <span className="app-page-newsletter-field-hint">letters, numbers, hyphens</span>
                  </label>
                  <div className="app-page-newsletter-field-prefix-wrap">
                    <span className="app-page-newsletter-field-prefix">tadaify.com/{handle}/</span>
                    <input id="nlt-page-slug" type="text" defaultValue="subscribe" />
                  </div>
                </div>
              </div>

              <div className="app-page-newsletter-field-row">
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label">Publish</label>
                  <ToggleRow name="Page is live" sub="Visitors can find this page at the URL above." defaultOn />
                </div>
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label">
                    Common alternatives <span className="app-page-newsletter-field-hint">click to use as title + slug</span>
                  </label>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {TITLE_SLUG_CHIPS.map((c) => (
                      <button key={c.slug} className="app-page-newsletter-chip" type="button" style={{ cursor: "pointer" }}>
                        {c.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">
                  Theme color <span className="app-page-newsletter-field-hint">override theme for this page only</span>
                </label>
                <SwatchRow swatches={PAGE_SWATCHES} />
              </div>

              <details className="app-page-newsletter-expander" style={{ marginTop: 14 }}>
                <summary>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
                  </svg>
                  SEO settings <span className="app-page-newsletter-ex-sub">— meta title, description, social card</span>
                  <svg className="app-page-newsletter-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <polyline points="6 15 12 9 18 15" />
                  </svg>
                </summary>
                <div className="app-page-newsletter-ex-body">
                  <div className="app-page-newsletter-field">
                    <label className="app-page-newsletter-field-label" htmlFor="nlt-seo-title">
                      Meta title <span className="app-page-newsletter-field-hint">~60 chars · used by Google + share previews</span>
                    </label>
                    <div className="app-page-newsletter-field-prefix-wrap">
                      <input id="nlt-seo-title" type="text" defaultValue="Subscribe to Strong Not Skinny — by Alexandra Silva" />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-newsletter-field-suffix-action" type="button">✨ Suggest</button>
                    </div>
                  </div>
                  <div className="app-page-newsletter-field">
                    <label className="app-page-newsletter-field-label" htmlFor="nlt-seo-desc">
                      Meta description <span className="app-page-newsletter-field-hint">~155 chars</span>
                    </label>
                    <div className="app-page-newsletter-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                      <textarea
                        id="nlt-seo-desc"
                        className="app-page-newsletter-field-area"
                        style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                        defaultValue="Honest essays on training, recovery and building strength without burning out. New posts every Tuesday — straight to your inbox."
                      />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-newsletter-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                    </div>
                  </div>
                  <div className="app-page-newsletter-field">
                    <label className="app-page-newsletter-field-label">
                      OG image <span className="app-page-newsletter-field-hint">1200×630 — shown when shared on social</span>
                    </label>
                    {/* TODO: wire to admin pages API */}
                    <div className="app-page-newsletter-cover-drop" style={{ height: "auto", padding: 14 }} onClick={() => setImagePickerOpen(true)}>
                      <span className="app-page-newsletter-cd-emoji">🖼</span>
                      <div className="app-page-newsletter-cd-title">Drop an image, or click to upload</div>
                      <div className="app-page-newsletter-cd-sub">Or <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate one with AI</span></div>
                    </div>
                  </div>
                </div>
              </details>

              {/* Custom domain (Pro+) */}
              <div className="app-page-newsletter-field" style={{ marginTop: 14 }}>
                <label className="app-page-newsletter-field-label">
                  Custom domain <span className="app-page-newsletter-tier-badge app-page-newsletter-tier-pro">✨ Pro</span>
                </label>
                <div className="app-page-newsletter-field-prefix-wrap">
                  <input type="text" placeholder="e.g. subscribe.alexandrasilva.com" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-field-suffix-action" type="button">Set up</button>
                </div>
                <TierHint>
                  Custom domains are a Pro feature. We&apos;ll prompt you to upgrade when you save.
                </TierHint>
              </div>

              {/* A/B test variants (Business) */}
              <div className="app-page-newsletter-field" style={{ marginTop: 14 }}>
                <label className="app-page-newsletter-field-label">
                  A/B test variants <span className="app-page-newsletter-tier-badge app-page-newsletter-tier-business">🔒 Business</span>
                </label>
                <ToggleRow
                  name="Test two versions of this page"
                  sub="Show different headlines or button labels to your visitors and we'll pick the winner automatically."
                />
                <TierHint>
                  A/B testing is a Business feature. We&apos;ll prompt you to upgrade when you save.
                </TierHint>
              </div>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1 — Hero
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="🎯" title="Hero" sub="Headline + sub-headline + optional cover image." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-hero-headline">
                  Headline <span className="app-page-newsletter-field-hint">large, friendly, first thing visitors see</span>
                </label>
                <div className="app-page-newsletter-field-prefix-wrap">
                  <input id="nlt-hero-headline" type="text" defaultValue="Get my weekly notes on training without burning out." />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-field-suffix-action" type="button">✨ Suggest</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 6 }}>
                  {HEADLINE_CHIPS.map((c) => (
                    <button key={c} className="app-page-newsletter-chip" type="button" style={{ cursor: "pointer" }}>{c}</button>
                  ))}
                </div>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-hero-sub">Sub-headline</label>
                <div className="app-page-newsletter-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="nlt-hero-sub"
                    className="app-page-newsletter-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="One short, honest email every Tuesday. Drills, mindset shifts, recovery tactics — no spam, no fluff."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">
                  Cover image / logo <span className="app-page-newsletter-field-hint">optional — 800×600 recommended</span>
                </label>
                {/* TODO: wire to admin pages API */}
                <div className="app-page-newsletter-cover-drop" onClick={() => setImagePickerOpen(true)}>
                  <span className="app-page-newsletter-cd-emoji">🖼</span>
                  <div className="app-page-newsletter-cd-title">Drop an image, or click to upload</div>
                  <div className="app-page-newsletter-cd-sub">JPG, PNG, WebP · max 5MB · or <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>✨ generate with AI</span></div>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — Email provider
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="🔌" title="Email provider" sub="Where new subscribers land." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-provider-select">
                  Email provider <span className="app-page-newsletter-field-hint">all providers free on every tadaify plan (DEC-119)</span>
                </label>
                <select
                  className="app-page-newsletter-field-select"
                  id="nlt-provider-select"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value as ProviderKey)}
                >
                  <option value="kit">Kit (ConvertKit)</option>
                  <option value="beehiiv">Beehiiv</option>
                  <option value="mailerlite">MailerLite</option>
                  <option value="mailchimp">Mailchimp</option>
                  <option value="klaviyo">Klaviyo</option>
                  <option value="google-sheets">Google Sheets</option>
                  <option value="webhook">Generic webhook</option>
                </select>
              </div>

              {provider === "kit"           && <KitPanel />}
              {provider === "beehiiv"       && <BeehiivPanel />}
              {provider === "mailerlite"    && <MailerLitePanel />}
              {provider === "mailchimp"     && <MailchimpPanel />}
              {provider === "klaviyo"       && <KlaviyoPanel />}
              {provider === "google-sheets" && <GoogleSheetsPanel />}
              {provider === "webhook"       && <WebhookPanel handle={handle} />}

              <div className="app-page-newsletter-field" style={{ marginTop: 14 }}>
                <label className="app-page-newsletter-field-label" htmlFor="nlt-success-msg">
                  Success message <span className="app-page-newsletter-field-hint">shown after a visitor signs up</span>
                </label>
                <div className="app-page-newsletter-field-prefix-wrap">
                  <input id="nlt-success-msg" type="text" defaultValue="Thanks! Check your inbox to confirm your subscription." />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3 — Signup form
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="📝" title="Signup form" sub="Layout, copy &amp; consent." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">Form layout</label>
                <div className="app-page-newsletter-layout-picker">
                  <LayoutCard
                    id="oneline"
                    name="One-line"
                    sub="Email + Subscribe on the same row. Highest conversion for short forms."
                    selected={layout === "oneline"}
                    onSelect={() => setLayout("oneline")}
                  >
                    <div className="app-page-newsletter-lp-preview app-page-newsletter-lp-preview-oneline">
                      <div className="app-page-newsletter-lp-fake-input" />
                      <div className="app-page-newsletter-lp-fake-btn" />
                    </div>
                  </LayoutCard>
                  <LayoutCard
                    id="twoline"
                    name="Two-line"
                    sub="Email above, full-width Subscribe button below. Easier on mobile."
                    selected={layout === "twoline"}
                    onSelect={() => setLayout("twoline")}
                  >
                    <div className="app-page-newsletter-lp-preview">
                      <div className="app-page-newsletter-lp-fake-input" />
                      <div className="app-page-newsletter-lp-fake-btn" style={{ width: "100%" }} />
                    </div>
                  </LayoutCard>
                  <LayoutCard
                    id="card"
                    name="Centered card"
                    sub="Stacked card with optional icon. Most editorial."
                    selected={layout === "card"}
                    onSelect={() => setLayout("card")}
                  >
                    <div className="app-page-newsletter-lp-preview app-page-newsletter-lp-preview-card">
                      <div className="app-page-newsletter-lp-fake-icon" />
                      <div className="app-page-newsletter-lp-fake-input" />
                      <div className="app-page-newsletter-lp-fake-btn" />
                    </div>
                  </LayoutCard>
                </div>
              </div>

              <div className="app-page-newsletter-field-row">
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-form-placeholder">Email placeholder</label>
                  <input className="app-page-newsletter-field-input" id="nlt-form-placeholder" type="text" defaultValue="you@email.com" />
                </div>
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-form-cta">Button label</label>
                  <div className="app-page-newsletter-field-prefix-wrap">
                    <input id="nlt-form-cta" type="text" defaultValue="Subscribe" />
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-newsletter-field-suffix-action" type="button">✨ Suggest</button>
                  </div>
                </div>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">GDPR consent checkbox</label>
                <ToggleRow
                  name="Show consent checkbox"
                  sub="Required for EU visitors. Logs the explicit &quot;I agree&quot; timestamp on every signup."
                  defaultOn
                />
                <TierHint>
                  EU visitors must opt-in explicitly under GDPR Art. 7. We default this on so you stay compliant.
                </TierHint>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-consent-copy">
                  Consent copy <span className="app-page-newsletter-field-hint">shown next to the checkbox</span>
                </label>
                <textarea
                  id="nlt-consent-copy"
                  className="app-page-newsletter-field-area"
                  style={{ minHeight: 60 }}
                  defaultValue={'I agree to receive emails from Alexandra and accept the privacy policy.'}
                />
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 4 — Social proof
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="⭐" title="Social proof" sub="Build trust with subscriber count or quotes." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-proof-style">Style</label>
                <select className="app-page-newsletter-field-select" id="nlt-proof-style" defaultValue="count">
                  <option value="count">Subscriber count badge — {"\"Join 24,512 creators\""}</option>
                  <option value="quotes">Testimonial quotes — 1-3 cards</option>
                  <option value="both">Both — count above quotes</option>
                </select>
              </div>

              <div className="app-page-newsletter-field-row">
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-proof-template">
                    Template <span className="app-page-newsletter-field-hint">{"{count}"} = live count from your provider</span>
                  </label>
                  <input className="app-page-newsletter-field-input" id="nlt-proof-template" type="text" defaultValue="Join {count} creators learning to train smarter" />
                </div>
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label">Live count source</label>
                  <ToggleRow
                    name="Pull count from Kit"
                    sub={<>Auto-updates daily via API. Currently <b>24,512</b> subscribers.</>}
                    defaultOn
                  />
                </div>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">
                  Show count to visitors <span className="app-page-newsletter-tier-badge app-page-newsletter-tier-creator">⭐ Creator</span>
                </label>
                <ToggleRow
                  name="Public subscriber count"
                  sub="Free plan hides the count above 2,500 subscribers. Creator+ plans show your full count to visitors."
                  defaultOn
                />
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">
                  Testimonial quotes <span className="app-page-newsletter-field-hint">2-3 short quotes work best</span>
                </label>
                <div className="app-page-newsletter-bullet-list">
                  {quotes.map((q) => (
                    <div key={q.id} className="app-page-newsletter-bullet-item">
                      <span className="app-page-newsletter-bl-grip" aria-hidden="true">⋮⋮</span>
                      <input className="app-page-newsletter-bl-text" type="text" defaultValue={q.text} />
                      <button className="app-page-newsletter-bl-x" type="button" onClick={() => removeQuote(q.id)}>✕</button>
                    </div>
                  ))}
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-add-row-btn" type="button">+ Add quote</button>
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 5 — What you'll get
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="📬" title="What you'll get" sub="Set expectations on frequency, topics, format." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-wyg-heading">Section heading</label>
                <input className="app-page-newsletter-field-input" id="nlt-wyg-heading" type="text" defaultValue="Here's what lands in your inbox:" />
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">
                  Bullets <span className="app-page-newsletter-field-hint">drag to reorder · click emoji to change</span>
                </label>
                <div className="app-page-newsletter-bullet-list">
                  {bullets.map((b) => (
                    <div key={b.id} className="app-page-newsletter-bullet-item">
                      <span className="app-page-newsletter-bl-grip" aria-hidden="true">⋮⋮</span>
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-newsletter-bl-emoji" type="button" aria-label="Pick emoji">{b.emoji}</button>
                      <input className="app-page-newsletter-bl-text" type="text" defaultValue={b.text} />
                      <button className="app-page-newsletter-bl-x" type="button" onClick={() => removeBullet(b.id)}>✕</button>
                    </div>
                  ))}
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-newsletter-add-row-btn" type="button">+ Add bullet</button>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 10 }}>
                  <span style={{ fontSize: 11.5, color: "var(--fg-muted)", alignSelf: "center" }}>Templates:</span>
                  {["Weekly notes", "Monthly digest", "Drop alerts", "Behind-the-scenes"].map((t) => (
                    <button key={t} className="app-page-newsletter-chip" type="button" style={{ cursor: "pointer" }}>{t}</button>
                  ))}
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 6 — Past issues preview (Creator+)
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard
            icon="📰"
            title="Past issues preview"
            sub="Shows 3 most recent posts pulled from your provider."
            chip={<span className="app-page-newsletter-tier-badge app-page-newsletter-tier-creator">⭐ Creator</span>}
            onRemove={() => void 0}
          >
            <>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">Show past issues</label>
                <ToggleRow
                  name="Display 3 recent posts"
                  sub={<>Pulled from your <b>Kit</b> archive every hour. Visitors can read a preview before subscribing — boosts conversion ~18%.</>}
                  defaultOn
                />
                <TierHint>
                  Past issues preview is a Creator feature. We&apos;ll prompt you to upgrade when you save.
                </TierHint>
              </div>

              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">Recent posts (live preview)</label>
                <div className="app-page-newsletter-past-issues-grid">
                  {PAST_ISSUES.map((p) => (
                    <div key={p.id} className="app-page-newsletter-past-issue-card">
                      <div className={`app-page-newsletter-pic-cover${p.coverTheme ? " " + p.coverTheme : ""}`} aria-hidden="true">{p.coverEmoji}</div>
                      <div className="app-page-newsletter-pic-body">
                        <div className="app-page-newsletter-pic-title">{p.title}</div>
                        <div className="app-page-newsletter-pic-excerpt">{p.excerpt}</div>
                        <div className="app-page-newsletter-pic-meta">{p.meta}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 7 — FAQ
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="❓" title="FAQ" sub="Tackle common objections before they kill the signup." onRemove={() => void 0}>
            <>
              {faqs.map((f) => (
                <div key={f.id} className="app-page-newsletter-faq-item">
                  <div className="app-page-newsletter-faq-head">
                    <span className="app-page-newsletter-faq-grip" aria-hidden="true">⋮⋮</span>
                    <input className="app-page-newsletter-faq-q" type="text" defaultValue={f.q} />
                    <button className="app-page-newsletter-iconbtn" type="button" aria-label="Remove" onClick={() => removeFaq(f.id)}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                        <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                  <textarea className="app-page-newsletter-faq-a" defaultValue={f.a} />
                </div>
              ))}
              {/* TODO: wire to admin pages API */}
              <button className="app-page-newsletter-add-row-btn" type="button">+ Add question</button>
            </>
          </SectionCard>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 8 — Footer CTA
              ════════════════════════════════════════════════════════════════ */}
          <SectionCard icon="🚀" title="Footer CTA" sub="Last-chance subscribe + social fallback for hesitant visitors." onRemove={() => void 0}>
            <>
              <div className="app-page-newsletter-field-row">
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-cta-headline">Closing headline</label>
                  <input className="app-page-newsletter-field-input" id="nlt-cta-headline" type="text" defaultValue="Ready? It's one click + your email." />
                </div>
                <div className="app-page-newsletter-field">
                  <label className="app-page-newsletter-field-label" htmlFor="nlt-cta-button">Button label</label>
                  <input className="app-page-newsletter-field-input" id="nlt-cta-button" type="text" defaultValue="Subscribe now" />
                </div>
              </div>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label" htmlFor="nlt-cta-fallback">Social fallback copy</label>
                <input className="app-page-newsletter-field-input" id="nlt-cta-fallback" type="text" defaultValue="Or follow on Instagram, TikTok and YouTube — links in your bio." />
              </div>
              <div className="app-page-newsletter-field">
                <label className="app-page-newsletter-field-label">Show social-fallback links</label>
                <ToggleRow
                  name="Use my main page socials"
                  sub="Pulls Instagram / TikTok / YouTube from your Home page. Edit them once and they update everywhere."
                  defaultOn
                />
              </div>
            </>
          </SectionCard>

          {/* ── Add section row ── */}
          <div className="app-page-newsletter-add-section-row">
            {/* TODO: wire to admin pages API */}
            <button className="app-page-newsletter-add-section-btn" type="button" onClick={() => setPickerOpen(true)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Add section
            </button>
          </div>

        </>
      )}

      {/* ── Sticky save bar ── */}
      <div className="app-page-newsletter-save-bar" role="status" aria-live="polite">
        <span className="app-page-newsletter-save-status">
          <span className="app-page-newsletter-ss-dot" aria-hidden="true" />
          <span>All changes saved · 12 sec ago</span>
        </span>
        <span className="app-page-newsletter-foot-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-newsletter-btn app-page-newsletter-btn-ghost app-page-newsletter-btn-sm" type="button">Discard</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-newsletter-btn app-page-newsletter-btn-primary" type="button">Save changes</button>
      </div>

      {/* ── Section picker modal ── */}
      {pickerOpen && <SectionPickerModal onClose={() => setPickerOpen(false)} />}

      {/* ── Image picker modal ── */}
      {imagePickerOpen && <ImagePickerModal onClose={() => setImagePickerOpen(false)} />}

    </div>
  );
}
