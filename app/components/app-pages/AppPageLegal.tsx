/**
 * AppPageLegal — Pages → Legal page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-legal.html (2201 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title (with quick-pick title chips), URL slug, publish
 *      toggle, show-in-footer toggle, page background swatches, SEO expander
 *      (noindex toggle, meta title, description).
 *   2. Policies — draggable multi-policy list with 5 policy cards:
 *        Terms of Service (expanded) — meta grid (version, effective date,
 *          last updated + bump buttons), rich-text toolbar, body textarea,
 *          placeholder-warn banner, auto-TOC preview, pol-foot with version
 *          history link and anchor chip.
 *        Privacy Policy (expanded) — same structure + GDPR variant chip.
 *        Cookie Policy (collapsed), Refund Policy (collapsed),
 *        DMCA / Copyright Policy (collapsed + Creator tier hint).
 *      Section actions row — Browse templates, Add another policy.
 *      Empty state — 6 template tiles, Add custom policy.
 *   3. Cookie banner integration — info text + Configure cookie banner link.
 *   Compliance helper sidebar — checklist items (needed / met), Lawyer review
 *      row (stale), translations list (Pro+), cookie-banner link.
 *   Add policy modal — 7 type tiles (Terms, Privacy GDPR, Privacy US/CCPA,
 *      Cookie, Refund, DMCA, Custom).
 *   Templates modal — disclaimer banner + 6 template cards.
 *   Version history modal — 3 version rows (current + 2 past).
 *   Sticky save bar — auto-saved status, Discard, Save policies.
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 *
 * Note: all policy body text is MOCKUP PLACEHOLDER — clearly marked. Do not
 * ship vetted legal content in this component; production templates carry their
 * own disclaimer + jurisdiction selection.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageLegalProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

interface PolicyCard {
  id: string;
  icon: string;
  name: string;
  version: string;
  effectiveDate: string;
  updatedDate: string;
  extraChip?: ReactElement;
  collapsed: boolean;
  anchor: string;
  pastVersions: number;
  tierHint?: ReactElement;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const PAGE_SWATCHES = [
  { style: "var(--bg)",   label: "Inherit theme" },
  { style: "#FFFFFF",     label: "White" },
  { style: "#F8F4EE",     label: "Warm cream" },
  { style: "#F9FAFB",     label: "Cool grey" },
  { style: "#1F2937",     label: "Slate" },
  { style: "#0B0F1E",     label: "Dark canvas" },
];

const TITLE_CHIPS: Array<{ title: string; slug: string; label: string }> = [
  { title: "Legal",             slug: "legal",        label: "Legal" },
  { title: "Policies",          slug: "policies",     label: "Policies" },
  { title: "Terms & Privacy",   slug: "terms",        label: "Terms & Privacy" },
  { title: "Legal Center",      slug: "legal-center", label: "Legal Center" },
];

const INIT_POLICIES: PolicyCard[] = [
  {
    id: "terms",
    icon: "📜",
    name: "Terms of Service",
    version: "1.2",
    effectiveDate: "2026-04-01",
    updatedDate: "2026-03-28",
    collapsed: false,
    anchor: "#terms",
    pastVersions: 3,
  },
  {
    id: "privacy",
    icon: "🔒",
    name: "Privacy Policy",
    version: "2.0",
    effectiveDate: "2026-04-15",
    updatedDate: "2026-04-15",
    extraChip: <span className="app-page-legal-chip app-page-legal-chip-warning" style={{ fontSize: 10.5 }}>GDPR variant</span>,
    collapsed: false,
    anchor: "#privacy",
    pastVersions: 2,
  },
  {
    id: "cookie",
    icon: "🍪",
    name: "Cookie Policy",
    version: "1.0",
    effectiveDate: "2026-03-01",
    updatedDate: "2026-03-01",
    collapsed: true,
    anchor: "#cookie",
    pastVersions: 1,
  },
  {
    id: "refund",
    icon: "💸",
    name: "Refund Policy",
    version: "1.1",
    effectiveDate: "2026-04-01",
    updatedDate: "2026-04-01",
    collapsed: true,
    anchor: "#refund",
    pastVersions: 1,
  },
  {
    id: "dmca",
    icon: "©️",
    name: "DMCA / Copyright Policy",
    version: "1.0",
    effectiveDate: "2026-03-15",
    updatedDate: "2026-03-15",
    collapsed: true,
    anchor: "#dmca",
    pastVersions: 0,
    tierHint: (
      <div className="app-page-legal-tier-hint">
        <span className="app-page-legal-th-icon" aria-hidden="true">💡</span>
        DMCA Policy is part of <b>Creator</b>. Recommended if you host user-submitted content (comments, contact-form attachments, community submissions).
      </div>
    ),
  },
];

const TERMS_BODY = `## 1. Acceptance of terms

By accessing strongnotskinny.com (the "Site") and any products or services we offer, you agree to be bound by these Terms of Service.

## 2. Eligibility

You must be at least 18 years old, or the age of majority in your jurisdiction, to purchase services or products from us.

## 3. Subscriptions and payments

Coaching subscriptions auto-renew monthly. You may cancel at any time from your account dashboard; cancellation takes effect at the end of the current billing period.

## 4. Intellectual property

All training plans, video content, and written materials are owned by Alexandra Silva and may not be redistributed, resold, or reproduced without written permission.

## 5. Disclaimer of warranties

Our content is for informational and educational purposes only and is not medical advice. Consult a qualified healthcare provider before starting any new fitness program.

## 6. Limitation of liability

To the maximum extent permitted by law, our total liability for any claim arising from your use of the Site is limited to the amount you paid us in the 12 months preceding the claim.

## 7. Governing law

These Terms are governed by the laws of England and Wales. Any dispute will be resolved in the courts of London, United Kingdom.`;

const PRIVACY_BODY = `## 1. What we collect

We collect personal data you give us directly (name, email, billing address) and data automatically generated by your use of the Site (IP address, device type, pages visited, time on page).

## 2. Why we collect it (legal basis under GDPR Art. 6)

- **Performance of contract** — to deliver the products and coaching you've purchased.
- **Legitimate interest** — to keep the Site secure and improve our services.
- **Consent** — for marketing emails and non-essential cookies.

## 3. How long we keep it

Account data: as long as your account is active, plus 7 years for tax purposes after account closure (UK requirement).
Anonymised analytics: 26 months (Google Analytics default).

## 4. Your rights

Under GDPR you have the right to access, rectify, erase, restrict processing of, port, and object to processing of your personal data. Email hello@strongnotskinny.com to exercise any of these rights — we respond within 30 days.

## 5. International transfers

Some of our processors (Stripe, Google Workspace, Cloudflare) are based in the United States. Where data leaves the EU/UK, we rely on Standard Contractual Clauses (SCCs) approved by the European Commission.

## 6. Data Protection Officer

We are not legally required to appoint a DPO, but data protection inquiries are handled by Alexandra Silva personally — privacy@strongnotskinny.com.`;

const TERMS_TOC = [
  "Acceptance of terms",
  "Eligibility",
  "Subscriptions and payments",
  "Intellectual property",
  "Disclaimer of warranties",
  "Limitation of liability",
  "Governing law",
];

const TYPE_TILES = [
  { id: "terms-new",   emoji: "📜", name: "Terms of Service",  sub: "Generic — works for most creators" },
  { id: "privacy-gdpr",emoji: "🔒", name: "Privacy Policy",    sub: "GDPR (EU) variant" },
  { id: "privacy-us",  emoji: "🇺🇸", name: "Privacy Policy",    sub: "US-only / CCPA variant" },
  { id: "cookie-new",  emoji: "🍪", name: "Cookie Policy",     sub: "Cookies + opt-out" },
  { id: "refund-new",  emoji: "💸", name: "Refund Policy",     sub: "Digital / physical / service" },
  { id: "dmca-new",    emoji: "©️", name: "DMCA Counter-notice",sub: "For user-generated content" },
  { id: "custom",      emoji: "📝", name: "Custom policy",     sub: "Start from a blank editor." },
];

const TEMPLATE_CARDS = [
  { id: "t1", emoji: "🛒", name: "Creator starter pack", chips: ["Terms of Service", "Privacy Policy (GDPR)", "Cookie Policy", "Refund Policy"] },
  { id: "t2", emoji: "🎨", name: "Digital products",     chips: ["Terms of Service", "Refund Policy", "DMCA Policy"] },
  { id: "t3", emoji: "🇺🇸", name: "US-based creator",   chips: ["Terms of Service", "Privacy Policy (CCPA)", "Refund Policy"] },
  { id: "t4", emoji: "🌍", name: "EU / GDPR-focused",    chips: ["Terms of Service", "Privacy Policy (GDPR)", "Cookie Policy", "DMCA Policy"] },
  { id: "t5", emoji: "💼", name: "B2B / coaching",       chips: ["Terms of Service", "Service Agreement", "Privacy Policy", "Refund Policy"] },
  { id: "t6", emoji: "📱", name: "App / SaaS",           chips: ["Terms of Service", "Privacy Policy", "Acceptable Use Policy", "DMCA Policy"] },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-legal-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-legal-row-toggle">
      <div>
        <div className="app-page-legal-rt-name">{name}</div>
        <div className="app-page-legal-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-legal-tier-hint">
      <span className="app-page-legal-th-icon" aria-hidden="true">💡</span>
      <span>{children}</span>
    </div>
  );
}

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
      <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-legal-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-legal-swatch${sel === i ? " is-selected" : ""}`}
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

// ─── Rich-text toolbar ────────────────────────────────────────────────────────

function RtToolbar(): ReactElement {
  return (
    <div className="app-page-legal-rt-toolbar" role="toolbar" aria-label="Formatting">
      <button type="button" aria-label="Bold"><b>B</b></button>
      <button type="button" aria-label="Italic"><i>I</i></button>
      <span className="app-page-legal-rt-sep" />
      <button type="button" aria-label="Heading 2">H2</button>
      <button type="button" aria-label="Heading 3">H3</button>
      <span className="app-page-legal-rt-sep" />
      <button type="button" aria-label="Quote">{'"'}</button>
      <button type="button" aria-label="Link">
        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
          <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
          <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
        </svg>
      </button>
      <button type="button" aria-label="Bulleted list">•</button>
      <button type="button" aria-label="Numbered list">1.</button>
      <span className="app-page-legal-rt-sep" />
      {/* TODO: wire to admin pages API */}
      <button type="button" aria-label="Suggest section" className="app-page-legal-rt-suggest">✨ Suggest section</button>
    </div>
  );
}

// ─── Policy card component ────────────────────────────────────────────────────

function PolicyCardEl({
  pol,
  bodyText,
  tocEntries,
  onRemove,
  onVersionHistory,
}: {
  pol: PolicyCard;
  bodyText?: string;
  tocEntries?: string[];
  onRemove: (id: string) => void;
  onVersionHistory: (name: string) => void;
}): ReactElement {
  const [collapsed, setCollapsed] = useState(pol.collapsed);
  const [popOpen, setPopOpen]     = useState(false);

  return (
    <div className={`app-page-legal-pol-card${collapsed ? " is-collapsed" : ""}`} data-policy-id={pol.id}>
      <div className="app-page-legal-pol-head">
        <span className="app-page-legal-pol-grip" aria-label="Drag policy"><GripSvg /></span>
        <span className="app-page-legal-pol-icon" aria-hidden="true">{pol.icon}</span>
        <div className="app-page-legal-pol-meta">
          <input className="app-page-legal-pol-name" type="text" defaultValue={pol.name} aria-label="Policy name" />
          <div className="app-page-legal-pol-line">
            <span className="app-page-legal-chip app-page-legal-chip-version">v{pol.version}</span>
            <span>Effective {new Date(pol.effectiveDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
            {pol.extraChip && (
              <>
                <span className="app-page-legal-pol-dot" />
                {pol.extraChip}
              </>
            )}
          </div>
        </div>
        <div className="app-page-legal-pol-actions">
          <button
            className="app-page-legal-iconbtn"
            type="button"
            aria-label="Version history"
            onClick={() => onVersionHistory(pol.name)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
          </button>
          <button
            className="app-page-legal-iconbtn"
            type="button"
            aria-label="More options"
            onClick={() => setPopOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <circle cx="12" cy="6" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="18" r="1" />
            </svg>
          </button>
          {popOpen && (
            <div className="app-page-legal-kebab-pop is-open">
              {/* TODO: wire to admin pages API */}
              <button type="button" onClick={() => setPopOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                </svg>
                Copy public link
              </button>
              <button type="button" onClick={() => setPopOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                </svg>
                Duplicate
              </button>
              <button type="button" onClick={() => setPopOpen(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export as PDF
              </button>
              <hr />
              <button className="danger" type="button" onClick={() => { setPopOpen(false); onRemove(pol.id); }}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                </svg>
                Remove
              </button>
            </div>
          )}
          <button
            className="app-page-legal-pol-collapse"
            type="button"
            aria-label={collapsed ? "Expand policy" : "Collapse policy"}
            onClick={() => setCollapsed((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <polyline points="6 9 12 15 18 9" />
            </svg>
          </button>
        </div>
      </div>

      <div className="app-page-legal-pol-body">
        {collapsed ? (
          <p style={{ fontSize: 13, color: "var(--fg-muted)", margin: 0 }}>
            Body collapsed — click the chevron to expand and edit.
          </p>
        ) : (
          <>
            <div className="app-page-legal-meta-grid">
              <div className="app-page-legal-meta-cell">
                <div className="app-page-legal-mc-label">Version</div>
                <div className="app-page-legal-mc-row">
                  <input className="app-page-legal-mc-input" type="text" defaultValue={pol.version} />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-legal-mc-bump" type="button">+ patch</button>
                </div>
              </div>
              <div className="app-page-legal-meta-cell">
                <div className="app-page-legal-mc-label">Effective date</div>
                <div className="app-page-legal-mc-row">
                  <input className="app-page-legal-mc-input" type="date" defaultValue={pol.effectiveDate} />
                </div>
              </div>
              <div className="app-page-legal-meta-cell">
                <div className="app-page-legal-mc-label">Last updated</div>
                <div className="app-page-legal-mc-row">
                  <input className="app-page-legal-mc-input" type="date" defaultValue={pol.updatedDate} />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-legal-mc-bump" type="button">today</button>
                </div>
              </div>
            </div>

            <div>
              <label className="app-page-legal-field-label" style={{ marginBottom: 6 }}>Body</label>
              <RtToolbar />
              <textarea className="app-page-legal-rt-area" defaultValue={bodyText ?? ""} />
              <div className="app-page-legal-placeholder-warn">
                <span aria-hidden="true">⚠️</span>
                <div>
                  <strong>Mockup placeholder text — replace before publishing.</strong>{" "}
                  Have a lawyer review the final wording. tadaify provides starter templates as a convenience; we do not provide legal advice.
                </div>
              </div>
              {tocEntries && tocEntries.length > 0 && (
                <div className="app-page-legal-toc-preview" aria-hidden="true">
                  <div className="app-page-legal-toc-label">Auto-generated TOC entries (from H2 / H3 headings)</div>
                  <ul>
                    {tocEntries.map((entry, i) => (
                      <li key={entry}>
                        <span className="app-page-legal-toc-num">§ {i + 1}</span>
                        <span className="app-page-legal-toc-text">{entry}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </>
        )}

        {pol.tierHint && collapsed && pol.tierHint}
      </div>

      <div className="app-page-legal-pol-foot">
        {pol.pastVersions > 0 && (
          <button className="app-page-legal-ver-link" type="button" onClick={() => onVersionHistory(pol.name)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
            </svg>
            View {pol.pastVersions} past version{pol.pastVersions !== 1 ? "s" : ""}
          </button>
        )}
        <span className="app-page-legal-pol-foot-spacer" />
        <span className="app-page-legal-chip">
          Anchor: <span style={{ fontFamily: "var(--font-mono)", marginLeft: 4 }}>{pol.anchor}</span>
        </span>
      </div>
    </div>
  );
}

// ─── Add policy modal ─────────────────────────────────────────────────────────

function AddPolicyModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-legal-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-ap-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-legal-modal">
        <div className="app-page-legal-modal-head">
          <h3 id="legal-ap-title">Add a policy</h3>
          <span className="app-page-legal-head-spacer" />
          <button className="app-page-legal-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-legal-modal-body">
          <div className="app-page-legal-type-grid">
            {TYPE_TILES.map((t) => (
              <button key={t.id} className="app-page-legal-type-tile" type="button" onClick={onClose}>
                <span className="app-page-legal-tt-icon">{t.emoji}</span>
                <span className="app-page-legal-tt-name">{t.name}</span>
                <span className="app-page-legal-tt-sub">{t.sub}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-legal-modal-foot">
          <span className="app-page-legal-foot-meta">Tier-gated policies (DMCA, AUP) are addable now — we&apos;ll prompt at Save if your tier doesn&apos;t include them.</span>
          <span className="app-page-legal-foot-spacer" />
          <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Templates modal ──────────────────────────────────────────────────────────

function TemplatesModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-legal-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-templ-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-legal-modal">
        <div className="app-page-legal-modal-head">
          <h3 id="legal-templ-title">Policy templates</h3>
          <span className="app-page-legal-head-spacer" />
          <button className="app-page-legal-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-legal-modal-body">
          <div className="app-page-legal-templ-disclaimer">
            <span className="app-page-legal-td-icon" aria-hidden="true">⚠️</span>
            <div>
              <strong>These templates are starter text only.</strong> They are NOT legal advice. You must replace all placeholder text and have a qualified lawyer review before publishing. tadaify is not liable for the content of your legal pages.
            </div>
          </div>
          <div className="app-page-legal-templates-grid">
            {TEMPLATE_CARDS.map((t) => (
              <button key={t.id} className="app-page-legal-templ-card" type="button" onClick={onClose}>
                <span className="app-page-legal-tc-emoji">{t.emoji}</span>
                <span className="app-page-legal-tc-name">{t.name}</span>
                <ul className="app-page-legal-tc-list">
                  {t.chips.map((c) => <li key={c}>{c}</li>)}
                </ul>
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-legal-modal-foot">
          <span className="app-page-legal-foot-meta">Using a template overwrites the current policy list. A snapshot of the existing policies is saved to version history.</span>
          <span className="app-page-legal-foot-spacer" />
          <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Version history modal ────────────────────────────────────────────────────

function VersionHistoryModal({ policyName, onClose }: { policyName: string; onClose: () => void }): ReactElement {
  const versions = [
    { version: "1.2", effDate: "Apr 1, 2026",  changes: "Added clause 6 (Limitation of liability). Clarified subscription cancellation wording in clause 3.", isCurrent: true },
    { version: "1.1", effDate: "Jan 15, 2026", changes: "Updated jurisdiction clause to England and Wales following entity registration.",                         isCurrent: false },
    { version: "1.0", effDate: "Nov 1, 2025",  changes: "Initial version — launched alongside the site.",                                                          isCurrent: false },
  ];
  return (
    <div
      className="app-page-legal-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="legal-vh-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-legal-modal app-page-legal-modal-md">
        <div className="app-page-legal-modal-head">
          <h3 id="legal-vh-title">Version history — {policyName}</h3>
          <span className="app-page-legal-head-spacer" />
          <button className="app-page-legal-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-legal-modal-body">
          <div className="app-page-legal-version-list">
            {versions.map((v) => (
              <div key={v.version} className={`app-page-legal-version-row${v.isCurrent ? " is-current" : ""}`}>
                <span className="app-page-legal-vr-version">v{v.version}</span>
                <div className="app-page-legal-vr-meta">
                  <div className="app-page-legal-vr-eff">Effective {v.effDate}</div>
                  <div className="app-page-legal-vr-changes">{v.changes}</div>
                </div>
                <div className="app-page-legal-vr-actions">
                  {!v.isCurrent && (
                    <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-xs" type="button">
                      Restore
                    </button>
                  )}
                  <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-xs" type="button">
                    View
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="app-page-legal-modal-foot">
          <span className="app-page-legal-foot-meta">Versions are retained for 7 years per data-retention best practice.</span>
          <span className="app-page-legal-foot-spacer" />
          <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ─── Compliance helper sidebar ────────────────────────────────────────────────

function ComplianceHelper(): ReactElement {
  return (
    <aside className="app-page-legal-helper">
      <h3>Compliance check</h3>
      <p className="app-page-legal-h-sub">Based on your current policies and account settings.</p>

      <div className="app-page-legal-h-block">
        <div className="app-page-legal-h-block-title">
          <span aria-hidden="true">📋</span> Ad platform requirements
        </div>
        <ul className="app-page-legal-check-list">
          <li className="is-met">
            <span className="app-page-legal-cl-ico" aria-hidden="true">✓</span>
            <div>
              <div className="app-page-legal-cl-name">Terms of Service</div>
              <div className="app-page-legal-cl-sub">Required for Meta Ads, Google Ads</div>
            </div>
          </li>
          <li className="is-met">
            <span className="app-page-legal-cl-ico" aria-hidden="true">✓</span>
            <div>
              <div className="app-page-legal-cl-name">Privacy Policy</div>
              <div className="app-page-legal-cl-sub">Required for all ad platforms + GDPR</div>
            </div>
          </li>
          <li className="is-met">
            <span className="app-page-legal-cl-ico" aria-hidden="true">✓</span>
            <div>
              <div className="app-page-legal-cl-name">Cookie Policy</div>
              <div className="app-page-legal-cl-sub">Required for EU cookie law</div>
            </div>
          </li>
          <li className="is-met">
            <span className="app-page-legal-cl-ico" aria-hidden="true">✓</span>
            <div>
              <div className="app-page-legal-cl-name">Refund Policy</div>
              <div className="app-page-legal-cl-sub">Required when selling paid products</div>
            </div>
          </li>
          <li className="is-needed">
            <span className="app-page-legal-cl-ico" aria-hidden="true">!</span>
            <div>
              <div className="app-page-legal-cl-name">Accessibility statement</div>
              <div className="app-page-legal-cl-sub">Recommended for EU — add via + Add policy</div>
            </div>
          </li>
        </ul>
      </div>

      <div className="app-page-legal-h-block">
        <div className="app-page-legal-h-block-title">
          <span aria-hidden="true">👩‍⚖️</span> Lawyer review
        </div>
        <div className={`app-page-legal-review-row is-stale`}>
          <div className="app-page-legal-rr-meta">
            <div className="app-page-legal-rr-name">Last reviewed: Jan 2026</div>
            <div className="app-page-legal-rr-sub">Policies have changed since. Consider a fresh review.</div>
          </div>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-xs" type="button">
            Mark reviewed
          </button>
        </div>
      </div>

      <div className="app-page-legal-h-block">
        <div className="app-page-legal-h-block-title">
          <span aria-hidden="true">🌐</span> Translations
          <span className="app-page-legal-tier-badge app-page-legal-tier-pro" style={{ marginLeft: 6 }}>✨ Pro</span>
        </div>
        <ul className="app-page-legal-translation-list">
          <li>
            <span className="app-page-legal-tl-flag">🇬🇧</span>
            <span className="app-page-legal-tl-name">English</span>
            <span className="app-page-legal-tl-status is-done">Live</span>
          </li>
          <li>
            <span className="app-page-legal-tl-flag">🇩🇪</span>
            <span className="app-page-legal-tl-name">German</span>
            <span className="app-page-legal-tl-status is-todo">Add</span>
          </li>
          <li>
            <span className="app-page-legal-tl-flag">🇫🇷</span>
            <span className="app-page-legal-tl-name">French</span>
            <span className="app-page-legal-tl-status is-todo">Add</span>
          </li>
        </ul>
        <TierHint>
          Translations are part of the <b>Pro</b> plan. We&apos;ll prompt you to upgrade when you save if a translation is added.
        </TierHint>
      </div>

      <div className="app-page-legal-h-block">
        <div className="app-page-legal-h-block-title">
          <span aria-hidden="true">🍪</span> Cookie banner
        </div>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-legal-cookie-banner-link" type="button">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="13" r="1" /><circle cx="11" cy="15" r="1" />
          </svg>
          Configure cookie banner →
        </button>
      </div>
    </aside>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageLegal({ handle }: AppPageLegalProps): ReactElement {
  const [policies, setPolicies]         = useState<PolicyCard[]>(INIT_POLICIES);
  const [hasContent, setHasContent]     = useState(true);
  const [addPolicyOpen, setAddPolicyOpen]   = useState(false);
  const [templatesOpen, setTemplatesOpen]   = useState(false);
  const [versionHistoryPol, setVersionHistoryPol] = useState<string | null>(null);

  const removePolicy = (id: string) => setPolicies((prev) => prev.filter((p) => p.id !== id));

  return (
    <div className="app-page-legal-root" aria-labelledby="app-page-legal-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-legal-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-legal-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-legal-crumb-sep">/</span>
        <span className="app-page-legal-crumb-here">Legal</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-legal-page-head">
        <div>
          <h1 id="app-page-legal-h1" className="app-page-legal-h1">
            <span className="app-page-legal-ph-emoji" aria-hidden="true">⚖️</span>
            Legal
          </h1>
          <p className="app-page-legal-sub">
            All your legal documents in one place. Required for selling on Meta Ads / Google Ads, GDPR compliance, and refund disclosure for paid offers.
          </p>
          <div className="app-page-legal-title-chips" aria-label="Title quick-pick">
            {TITLE_CHIPS.map((c) => (
              <button key={c.slug} className="app-page-legal-title-chip" type="button">{c.label}</button>
            ))}
          </div>
        </div>
        <div className="app-page-legal-actions">
          <span className="app-page-legal-url-pill">
            <span className="app-page-legal-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>legal</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ── Two-column work grid ── */}
      <div className="app-page-legal-work-grid">

        {/* ── Main column ── */}
        <div>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 1 — Page settings
              ════════════════════════════════════════════════════════════════ */}
          <section className="app-page-legal-section">
            <div className="app-page-legal-section-head">
              <h2>Page settings</h2>
              <span className="app-page-legal-sub">Title, URL, visibility, search-engine indexing.</span>
            </div>
            <div className="app-page-legal-section-body">

              <div className="app-page-legal-field-row">
                <div className="app-page-legal-field">
                  <label className="app-page-legal-field-label" htmlFor="legal-page-title">
                    Page title <span className="app-page-legal-field-hint">shown as &lt;h1&gt; on the public page</span>
                  </label>
                  <input className="app-page-legal-field-input" id="legal-page-title" type="text" defaultValue="Legal" />
                </div>
                <div className="app-page-legal-field">
                  <label className="app-page-legal-field-label" htmlFor="legal-page-slug">
                    URL slug <span className="app-page-legal-field-hint">letters, numbers, hyphens</span>
                  </label>
                  <div className="app-page-legal-field-prefix-wrap">
                    <span className="app-page-legal-field-prefix">tadaify.com/{handle}/</span>
                    <input id="legal-page-slug" type="text" defaultValue="legal" />
                  </div>
                </div>
              </div>

              <div className="app-page-legal-field-row">
                <div className="app-page-legal-field">
                  <label className="app-page-legal-field-label">Publish</label>
                  <ToggleRow name="Page is live" sub="Visitors can find your Legal page at the URL above." defaultOn />
                </div>
                <div className="app-page-legal-field">
                  <label className="app-page-legal-field-label">Show in main page footer</label>
                  <ToggleRow
                    name="Footer link from your homepage"
                    sub={<>{"\"Legal\""} link added to the footer of <span style={{ fontFamily: "var(--font-mono)" }}>/{handle}</span>.</>}
                    defaultOn
                  />
                </div>
              </div>

              <div className="app-page-legal-field">
                <label className="app-page-legal-field-label">
                  Page background <span className="app-page-legal-field-hint">legal pages read best with high-contrast neutrals</span>
                </label>
                <SwatchRow />
              </div>

              <details className="app-page-legal-expander" open style={{ marginTop: 14 }}>
                <summary>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" />
                  </svg>
                  SEO &amp; search-engine settings{" "}
                  <span className="app-page-legal-ex-sub">— legal pages typically excluded from search results</span>
                  <svg className="app-page-legal-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <polyline points="6 15 12 9 18 15" />
                  </svg>
                </summary>
                <div className="app-page-legal-ex-body">
                  <div style={{ marginBottom: 12 }}>
                    <ToggleRow
                      name={<>Hide from search engines (<span style={{ fontFamily: "var(--font-mono)" }}>noindex,follow</span>)</>}
                      sub="Recommended for Legal pages — Google won't show them in results, but links to/from the page still work normally."
                      defaultOn
                    />
                  </div>
                  <div className="app-page-legal-field">
                    <label className="app-page-legal-field-label" htmlFor="legal-seo-title">
                      Meta title <span className="app-page-legal-field-hint">~60 chars · only used if a visitor shares the link</span>
                    </label>
                    <div className="app-page-legal-field-prefix-wrap">
                      <input id="legal-seo-title" type="text" defaultValue="Legal — Strong Not Skinny by Alexandra Silva" />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-legal-field-suffix-action" type="button">✨ Suggest</button>
                    </div>
                  </div>
                  <div className="app-page-legal-field">
                    <label className="app-page-legal-field-label" htmlFor="legal-seo-desc">
                      Meta description <span className="app-page-legal-field-hint">~155 chars</span>
                    </label>
                    <div className="app-page-legal-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                      <textarea
                        id="legal-seo-desc"
                        className="app-page-legal-field-area"
                        style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                        defaultValue="Terms of Service, Privacy Policy, Refund Policy, and Cookie Policy for Strong Not Skinny products and coaching."
                      />
                      {/* TODO: wire to admin pages API */}
                      <button className="app-page-legal-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                    </div>
                  </div>
                </div>
              </details>

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 2 — Policies
              ════════════════════════════════════════════════════════════════ */}
          <section className="app-page-legal-section">
            <div className="app-page-legal-section-head">
              <h2>Policies</h2>
              <span className="app-page-legal-sub">Drag to reorder. Each policy renders as its own section on the public page.</span>
              <span className="app-page-legal-head-spacer" />
              {/* TODO: wire to admin pages API */}
              <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={() => setTemplatesOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                </svg>
                Use template
              </button>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-legal-btn app-page-legal-btn-primary app-page-legal-btn-sm" type="button" onClick={() => setAddPolicyOpen(true)}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Add policy
              </button>
            </div>

            <div className="app-page-legal-section-body">

              {/* ── Filled state ── */}
              {hasContent && (
                <>
                  <div className="app-page-legal-pol-list">
                    {policies.map((pol) => (
                      <PolicyCardEl
                        key={pol.id}
                        pol={pol}
                        bodyText={pol.id === "terms" ? TERMS_BODY : pol.id === "privacy" ? PRIVACY_BODY : undefined}
                        tocEntries={pol.id === "terms" ? TERMS_TOC : undefined}
                        onRemove={removePolicy}
                        onVersionHistory={(name) => setVersionHistoryPol(name)}
                      />
                    ))}
                  </div>
                  <div className="app-page-legal-sec-actions-row">
                    <span className="app-page-legal-sec-actions-spacer" />
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={() => setTemplatesOpen(true)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                      Browse templates
                    </button>
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-legal-btn app-page-legal-btn-primary app-page-legal-btn-sm" type="button" onClick={() => setAddPolicyOpen(true)}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add another policy
                    </button>
                  </div>
                </>
              )}

              {/* ── Empty state ── */}
              {!hasContent && (
                <div className="app-page-legal-empty-state">
                  <span className="app-page-legal-es-emoji" aria-hidden="true">⚖️</span>
                  <h3>Start with a vetted template</h3>
                  <p>Six pre-written starter policies cover the most common creator needs. Replace the placeholders, have a lawyer review, then publish.</p>
                  <div className="app-page-legal-empty-templates-row">
                    {[
                      { emoji: "📜", name: "Terms of Service",    sub: "Generic — works for most creators" },
                      { emoji: "🔒", name: "Privacy Policy",      sub: "GDPR (EU) variant" },
                      { emoji: "🇺🇸", name: "Privacy Policy",     sub: "US-only / CCPA variant" },
                      { emoji: "🍪", name: "Cookie Policy",       sub: "Cookies + opt-out" },
                      { emoji: "💸", name: "Refund Policy",       sub: "Digital / physical / service" },
                      { emoji: "©️", name: "DMCA Counter-notice", sub: "For user-generated content" },
                    ].map((t) => (
                      <button key={t.name} className="app-page-legal-templ-tile" type="button" onClick={() => { setHasContent(true); setTemplatesOpen(true); }}>
                        <span className="app-page-legal-tt-emoji">{t.emoji}</span>
                        <span className="app-page-legal-tt-name">{t.name}</span>
                        <span className="app-page-legal-tt-sub">{t.sub}</span>
                      </button>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "center" }}>
                    {/* TODO: wire to admin pages API */}
                    <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button" onClick={() => { setHasContent(true); setAddPolicyOpen(true); }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add a custom policy from scratch
                    </button>
                  </div>
                </div>
              )}

            </div>
          </section>

          {/* ══════════════════════════════════════════════════════════════════
              SECTION 3 — Cookie banner integration
              ════════════════════════════════════════════════════════════════ */}
          <section className="app-page-legal-section">
            <div className="app-page-legal-section-head">
              <h2>Cookie banner integration</h2>
              <span className="app-page-legal-sub">
                The cookie banner that pops up for first-time visitors lives elsewhere — this is just the policy text it links to.
              </span>
            </div>
            <div className="app-page-legal-section-body">
              <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: "0 0 12px", lineHeight: 1.6 }}>
                Your Cookie Policy on this page is automatically linked from the cookie consent banner. Visitors click{" "}
                {'"Cookie Policy"'} in the banner → land on{" "}
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, padding: "1px 6px", background: "var(--bg-muted)", borderRadius: 5 }}>
                  tadaify.com/{handle}/legal#cookie
                </span>.
              </p>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-legal-cookie-banner-link" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" /><circle cx="9" cy="10" r="1" /><circle cx="15" cy="13" r="1" /><circle cx="11" cy="15" r="1" />
                </svg>
                Configure cookie banner →
              </button>
            </div>
          </section>

        </div>

        {/* ── Compliance helper sidebar ── */}
        <ComplianceHelper />

      </div>

      {/* ── Sticky save bar ── */}
      <div className="app-page-legal-savebar" role="status" aria-live="polite">
        <span className="app-page-legal-sb-status">
          <span className="app-page-legal-sb-dot" aria-hidden="true" />
          Auto-saved 2 min ago
        </span>
        <span className="app-page-legal-sb-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-legal-btn app-page-legal-btn-ghost app-page-legal-btn-sm" type="button">Discard</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-legal-btn app-page-legal-btn-primary app-page-legal-btn-sm" type="button">Save policies</button>
      </div>

      {/* ── Modals ── */}
      {addPolicyOpen    && <AddPolicyModal onClose={() => setAddPolicyOpen(false)} />}
      {templatesOpen    && <TemplatesModal onClose={() => setTemplatesOpen(false)} />}
      {versionHistoryPol !== null && (
        <VersionHistoryModal policyName={versionHistoryPol} onClose={() => setVersionHistoryPol(null)} />
      )}

    </div>
  );
}
