/**
 * AppPageFaq — Pages → FAQ / Help Center page editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-faq.html (2049 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title, URL slug, publish toggle, show-in-nav toggle,
 *      page background swatches, SEO expander (meta title, description).
 *   2. FAQ behaviour — search bar toggle, TOC toggle, default expand visual
 *      radio (First open / All collapsed / All expanded), "Was this helpful?"
 *      feedback (Creator+), cross-section tags (Pro+), search index pill.
 *   3. Sections & questions — composer toolbar (search, collapse/expand all),
 *      3 section cards (Account & access, Billing & refunds, Coaching calls
 *      collapsed), AI bulk-suggest strip, empty state with 4 starter templates.
 *   Modals: Add section (9 type tiles + 4 AI starter packs), Edit Q&A (full
 *      form), CSV import (Pro+, drop-zone).
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload/import actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement, ReactNode } from "react";

interface AppPageFaqProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type ExpandMode = "first" | "collapsed" | "expanded";

interface QaItem {
  id: string;
  question: string;
  helpfulPct: number;
  isLow: boolean;
  updatedLabel: string;
  tag: string;
}

interface FaqSection {
  id: string;
  icon: string;
  name: string;
  count: number;
  intro: string;
  items: QaItem[];
  collapsed: boolean;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const PAGE_SWATCHES = [
  { style: "var(--bg)",                                           label: "Inherit theme" },
  { style: "#FFFFFF",                                             label: "White" },
  { style: "#F8F4EE",                                             label: "Warm cream" },
  { style: "#1F2937",                                             label: "Slate" },
  { style: "#0B0F1E",                                             label: "Dark canvas" },
  { style: "linear-gradient(135deg,#FDE68A,#F59E0B)",             label: "Sunrise" },
  { style: "linear-gradient(135deg,#6366F1,#8B5CF6)",             label: "Indigo" },
  { style: "linear-gradient(135deg,#0F172A,#334155)",             label: "Nightfall" },
];

const INIT_SECTIONS: FaqSection[] = [
  {
    id: "account", icon: "🔑", name: "Account & access", count: 8,
    intro: "Everything about logging in, downloads, and getting back into your training plan.",
    collapsed: false,
    items: [
      { id: "q1", question: "How do I reset my password?",                              helpfulPct: 93, isLow: false, updatedLabel: "Updated 3d ago",   tag: "login" },
      { id: "q2", question: "Where can I download the training PDF after I bought it?", helpfulPct: 89, isLow: false, updatedLabel: "Updated 1w ago",   tag: "downloads" },
      { id: "q3", question: "Can I share my account with my workout partner?",           helpfulPct: 42, isLow: true,  updatedLabel: "Updated 2w ago",   tag: "policy" },
    ],
  },
  {
    id: "billing", icon: "💳", name: "Billing & refunds", count: 12,
    intro: "30-day money-back guarantee. Stripe handles all payments — your card details never touch my server.",
    collapsed: false,
    items: [
      { id: "q4", question: "What's your refund policy?",                             helpfulPct: 96, isLow: false, updatedLabel: "Updated yesterday", tag: "refund" },
      { id: "q5", question: "Why was I charged twice this month?",                    helpfulPct: 51, isLow: true,  updatedLabel: "Updated 3w ago",    tag: "billing" },
      { id: "q6", question: "Do you offer payment plans for the 12-week program?",   helpfulPct: 78, isLow: false, updatedLabel: "Updated 1mo ago",   tag: "payment" },
    ],
  },
  {
    id: "coaching", icon: "🎯", name: "1:1 coaching calls", count: 7,
    intro: "Booking, rescheduling, what to bring, and how recordings work.",
    collapsed: true,
    items: [
      { id: "q7", question: "How do I book my onboarding call?", helpfulPct: 0, isLow: false, updatedLabel: "Updated 5d ago", tag: "booking" },
    ],
  },
];

const SECTION_TYPES = [
  { id: "account",  icon: "🔑",  name: "Account & access",    sub: "Login, password reset, downloads." },
  { id: "billing",  icon: "💳",  name: "Billing & refunds",   sub: "Charges, refunds, invoices." },
  { id: "shipping", icon: "📦",  name: "Shipping & delivery", sub: "Times, tracking, regions." },
  { id: "returns",  icon: "↩️",  name: "Returns & exchanges", sub: "Process, conditions, timeline." },
  { id: "product",  icon: "🧰",  name: "Product details",     sub: "Sizing, materials, care." },
  { id: "technical",icon: "🛠",  name: "Technical help",      sub: "Bugs, supported devices, exports." },
  { id: "booking",  icon: "📅",  name: "Booking & scheduling",sub: "How to book, reschedule, cancel." },
  { id: "legal",    icon: "⚖️",  name: "Legal & policy",      sub: "Privacy, terms, copyright." },
  { id: "blank",    icon: "📄",  name: "Blank section",       sub: "Start from scratch with your own name." },
];

const STARTER_PACKS = [
  { slug: "ecommerce", emoji: "🛍", name: "E-commerce returns", items: ["Returns & exchanges", "Shipping & delivery", "Sizing & product", "Billing"] },
  { slug: "course",    emoji: "🎓", name: "Course buyer",        items: ["Access & downloads", "Refund policy", "Community access"] },
  { slug: "coaching",  emoji: "🎯", name: "Coaching client",     items: ["Booking & scheduling", "What's included", "Results timeline"] },
  { slug: "general",   emoji: "🏠", name: "General help",        items: ["Account & access", "Billing & refunds", "Technical help", "Contact"] },
];

const EMPTY_STATE_TEMPLATES = [
  { emoji: "🛍", name: "E-commerce returns", sub: "Returns / shipping / sizing" },
  { emoji: "🎓", name: "Course buyer",        sub: "Access / refund / community" },
  { emoji: "🎯", name: "Coaching client",     sub: "Booking / scope / results" },
  { emoji: "🏠", name: "General help",        sub: "Account / billing / support" },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-faq-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({ name, sub, defaultOn = false }: { name: ReactNode; sub: ReactNode; defaultOn?: boolean }): ReactElement {
  return (
    <div className="app-page-faq-row-toggle">
      <div>
        <div className="app-page-faq-rt-name">{name}</div>
        <div className="app-page-faq-rt-sub">{sub}</div>
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children }: { children: ReactNode }): ReactElement {
  return (
    <div className="app-page-faq-tier-hint">
      <span className="app-page-faq-th-icon" aria-hidden="true">💡</span>
      <span>{children}</span>
    </div>
  );
}

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-faq-swatch-row">
      {PAGE_SWATCHES.map((s, i) => (
        <div
          key={s.label}
          className={`app-page-faq-swatch${sel === i ? " is-selected" : ""}`}
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

function GripSvg(): ReactElement {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <circle cx="9"  cy="6"  r="1" /><circle cx="9"  cy="12" r="1" /><circle cx="9"  cy="18" r="1" />
      <circle cx="15" cy="6"  r="1" /><circle cx="15" cy="12" r="1" /><circle cx="15" cy="18" r="1" />
    </svg>
  );
}

// ─── QA Row ───────────────────────────────────────────────────────────────────

function QaRow({ item, onEdit }: { item: QaItem; onEdit: () => void }): ReactElement {
  const [popOpen, setPopOpen] = useState(false);
  const showHelpful = item.helpfulPct > 0;
  return (
    <div className="app-page-faq-qa-row">
      <span className="app-page-faq-qa-grip" aria-label="Drag question"><GripSvg /></span>
      <div className="app-page-faq-qa-meta">
        <p className="app-page-faq-qa-q">{item.question}</p>
        <div className="app-page-faq-qa-line">
          {showHelpful && (
            <span className={`app-page-faq-qa-helpful${item.isLow ? " is-low" : ""}`}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path d="M14 9V5a3 3 0 0 0-6 0v4" /><rect x="2" y="9" width="20" height="12" rx="2" />
              </svg>
              {item.helpfulPct}% helpful
            </span>
          )}
          {showHelpful && <span className="app-page-faq-qa-dot" />}
          <span>{item.updatedLabel}</span>
          <span className="app-page-faq-qa-dot" />
          <span className="app-page-faq-qa-tag">{item.tag}</span>
        </div>
      </div>
      <div className="app-page-faq-qa-actions">
        {/* TODO: wire to admin pages API */}
        <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-xs" type="button" onClick={onEdit}>Edit</button>
        <button className="app-page-faq-iconbtn" type="button" aria-label="Question options" onClick={() => setPopOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {popOpen && (
          <div className="app-page-faq-kebab-pop is-open">
            <button type="button" onClick={() => { setPopOpen(false); onEdit(); }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>
              Edit
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              Duplicate
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><line x1="12" y1="2" x2="12" y2="22"/></svg>
              Move to section…
            </button>
            <button type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
              Copy deep-link
            </button>
            <hr />
            <button className="danger" type="button" onClick={() => setPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
              Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Section Card ─────────────────────────────────────────────────────────────

function SectionCard({
  section,
  onAddQuestion,
  onEditQuestion,
}: {
  section: FaqSection;
  onAddQuestion: (sectionId: string) => void;
  onEditQuestion: () => void;
}): ReactElement {
  const [collapsed, setCollapsed] = useState(section.collapsed);
  const [secPopOpen, setSecPopOpen] = useState(false);
  return (
    <div className={`app-page-faq-sec-card${collapsed ? " is-collapsed" : ""}`} data-section-id={section.id}>
      <div className="app-page-faq-sec-head">
        <span className="app-page-faq-sec-grip" aria-label="Drag section"><GripSvg /></span>
        <span className="app-page-faq-sec-icon" aria-hidden="true">{section.icon}</span>
        <input className="app-page-faq-sec-name" type="text" defaultValue={section.name} aria-label="Section name" />
        <span className="app-page-faq-sec-count">{section.count} questions</span>
        <button
          className="app-page-faq-sec-collapse"
          type="button"
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          onClick={() => setCollapsed((v) => !v)}
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <button className="app-page-faq-iconbtn" type="button" aria-label="Section options" onClick={() => setSecPopOpen((v) => !v)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
            <circle cx="12" cy="5" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="12" cy="19" r="1" />
          </svg>
        </button>
        {secPopOpen && (
          <div className="app-page-faq-kebab-pop is-open">
            <button type="button" onClick={() => setSecPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg>
              Change icon
            </button>
            <button type="button" onClick={() => setSecPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15V5a2 2 0 0 1 2-2h10"/></svg>
              Duplicate section
            </button>
            <hr />
            <button className="danger" type="button" onClick={() => setSecPopOpen(false)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6"/></svg>
              Delete section
            </button>
          </div>
        )}
      </div>
      {!collapsed && (
        <div className="app-page-faq-sec-body">
          <textarea
            className="app-page-faq-sec-intro"
            placeholder="Optional intro paragraph (1–2 sentences shown above this section's questions)…"
            defaultValue={section.intro}
          />
          <div className="app-page-faq-qa-list">
            {section.items.map((item) => (
              <QaRow key={item.id} item={item} onEdit={onEditQuestion} />
            ))}
          </div>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-faq-qa-add" type="button" onClick={() => onAddQuestion(section.id)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add question to {'"'}{section.name}{'"'}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Add Section Modal ────────────────────────────────────────────────────────

function AddSectionModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-faq-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="as-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-faq-modal">
        <div className="app-page-faq-modal-head">
          <h3 id="as-title">Add a section</h3>
          <span className="app-page-faq-head-spacer" />
          <button className="app-page-faq-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-faq-modal-body">
          <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: "0 0 14px" }}>
            Pick a section type. You can rename, reorder, and delete sections any time.
          </p>
          <div className="app-page-faq-type-grid">
            {SECTION_TYPES.map((t) => (
              <button key={t.id} className="app-page-faq-type-tile" type="button" onClick={onClose}>
                <span className="app-page-faq-tt-icon" aria-hidden="true">{t.icon}</span>
                <span className="app-page-faq-tt-name">{t.name}</span>
                <span className="app-page-faq-tt-sub">{t.sub}</span>
              </button>
            ))}
          </div>
          <div className="app-page-faq-templates-divider"><span>✨ AI starter packs</span></div>
          <div className="app-page-faq-templates-grid">
            {STARTER_PACKS.map((p) => (
              <button key={p.slug} className="app-page-faq-templ-card" type="button" onClick={onClose}>
                <span className="app-page-faq-tc-emoji" aria-hidden="true">{p.emoji}</span>
                <span className="app-page-faq-tc-name">{p.name}</span>
                <ul className="app-page-faq-tc-list">
                  {p.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </button>
            ))}
          </div>
        </div>
        <div className="app-page-faq-modal-foot">
          <span className="app-page-faq-foot-meta">No section cap. Free tier OK.</span>
          <span className="app-page-faq-foot-spacer" />
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ─── Edit Q&A Modal ───────────────────────────────────────────────────────────

function QaModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-faq-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="qa-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-faq-modal">
        <div className="app-page-faq-modal-head">
          <h3 id="qa-title">New question</h3>
          <span className="app-page-faq-head-spacer" />
          <span className="app-page-faq-chip draft">Draft · auto-saving</span>
          <button className="app-page-faq-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-faq-modal-body">

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label" htmlFor="qa-section">Section</label>
            <select className="app-page-faq-field-select" id="qa-section" defaultValue="account">
              <option value="account">🔑 Account &amp; access</option>
              <option value="billing">💳 Billing &amp; refunds</option>
              <option value="coaching">🎯 1:1 coaching calls</option>
              <option value="__new">+ Add new section…</option>
            </select>
          </div>

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label" htmlFor="qa-q-input">
              Question{" "}
              <span className="app-page-faq-field-hint">phrase how a visitor would ask it</span>
            </label>
            <input className="app-page-faq-field-input" id="qa-q-input" type="text" defaultValue="Where can I download the training PDF after I bought it?" />
          </div>

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label" htmlFor="qa-answer">Answer</label>
            <div className="app-page-faq-rt-toolbar" role="toolbar" aria-label="Formatting">
              <button type="button" aria-label="Bold"><b>B</b></button>
              <button type="button" aria-label="Italic"><i>I</i></button>
              <span className="app-page-faq-rt-sep" />
              <button type="button" aria-label="Heading">H</button>
              <button type="button" aria-label="Quote">❝</button>
              <button type="button" aria-label="Code">{"{ }"}</button>
              <span className="app-page-faq-rt-sep" />
              <button type="button" aria-label="Link">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
              </button>
              <button type="button" aria-label="Image">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" />
                </svg>
              </button>
              <span className="app-page-faq-rt-sep" />
              <button type="button" aria-label="Bullet list">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                  <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                  <circle cx="4" cy="6" r="1" /><circle cx="4" cy="12" r="1" /><circle cx="4" cy="18" r="1" />
                </svg>
              </button>
              <button type="button" aria-label="Numbered list">1.</button>
              <span className="app-page-faq-rt-sep" style={{ marginLeft: "auto" }} />
              {/* TODO: wire to admin pages API */}
              <button type="button" aria-label="AI suggest answer">✨ Suggest</button>
            </div>
            <textarea
              id="qa-answer"
              className="app-page-faq-rt-area"
              defaultValue={
                "After checkout you'll get an email from no-reply@tadaify.com with your download link. The link is also pinned in your account at tadaify.com/alexandra/account.\n\nHeads up:\n- The link expires after 30 days, but you can re-generate it from your account.\n- The PDF is watermarked with your email — please don't share it publicly.\n\nIf the email never arrived, check spam first, then DM me — I'll resend within an hour."
              }
            />
          </div>

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label">
              Tags{" "}
              <span className="app-page-faq-field-hint">type and press Enter</span>
            </label>
            <div className="app-page-faq-tags-input">
              <span className="app-page-faq-tag-pill">
                downloads<button className="app-page-faq-tag-x-btn" type="button" aria-label="Remove tag downloads">×</button>
              </span>
              <span className="app-page-faq-tag-pill">
                post-purchase<button className="app-page-faq-tag-x-btn" type="button" aria-label="Remove tag post-purchase">×</button>
              </span>
              <input type="text" placeholder="Add a tag…" />
            </div>
            <TierHint>
              Tags become filterable chips on the public page. Cross-section filtering is part of <b>Pro</b> — we&apos;ll prompt at save if you&apos;re below.
            </TierHint>
          </div>

        </div>
        <div className="app-page-faq-modal-foot">
          {/* TODO: wire to admin pages API */}
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button className="app-page-faq-btn app-page-faq-btn-danger-ghost app-page-faq-btn-sm" type="button">Delete question</button>
          <span className="app-page-faq-foot-spacer" />
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button">Save as draft</button>
          <button className="app-page-faq-btn app-page-faq-btn-primary app-page-faq-btn-sm" type="button">Save &amp; publish →</button>
        </div>
      </div>
    </div>
  );
}

// ─── CSV Import Modal ─────────────────────────────────────────────────────────

function CsvModal({ onClose }: { onClose: () => void }): ReactElement {
  return (
    <div
      className="app-page-faq-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="csv-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-faq-modal app-page-faq-modal-sm">
        <div className="app-page-faq-modal-head">
          <h3 id="csv-title">Import questions from CSV</h3>
          <span className="app-page-faq-head-spacer" />
          <button className="app-page-faq-iconbtn" type="button" aria-label="Close (Esc)" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-faq-modal-body">
          <p style={{ fontSize: 13.5, color: "var(--fg-muted)", margin: "0 0 14px" }}>
            Bulk-import a Help Center CSV. Columns expected:{" "}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: 12, background: "var(--bg-muted)", padding: "1px 6px", borderRadius: 6 }}>
              section, question, answer, tags
            </span>
            . Sections are created automatically if they don&apos;t exist yet.
          </p>
          <div className="app-page-faq-csv-drop">
            <div className="app-page-faq-cd-icon" aria-hidden="true">📂</div>
            <div className="app-page-faq-cd-meta">
              <div className="app-page-faq-cd-title">Drop a .csv file here, or click to browse</div>
              <div className="app-page-faq-cd-sub">Up to 500 rows · UTF-8 encoded · max 2 MB</div>
            </div>
          </div>
          <div style={{ marginTop: 12 }}>
            <span style={{ color: "var(--brand-primary)", fontSize: 12.5, fontWeight: 600, cursor: "pointer" }}>
              ↓ Download sample.csv
            </span>
          </div>
          <TierHint>
            CSV import is part of <b>Pro</b>. We&apos;ll prompt to upgrade at the import step if you&apos;re below.
          </TierHint>
        </div>
        <div className="app-page-faq-modal-foot">
          <span className="app-page-faq-foot-meta">Existing questions in the same section won&apos;t be deduped.</span>
          <span className="app-page-faq-foot-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button" onClick={onClose}>Cancel</button>
          <button className="app-page-faq-btn app-page-faq-btn-primary app-page-faq-btn-sm" type="button">Import →</button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function AppPageFaq({ handle }: AppPageFaqProps): ReactElement {
  const [expandMode, setExpandMode] = useState<ExpandMode>("first");
  const [hasContent]                = useState(true);
  const [addSecOpen, setAddSecOpen] = useState(false);
  const [qaOpen, setQaOpen]         = useState(false);
  const [csvOpen, setCsvOpen]       = useState(false);
  const [editorSearch, setEditorSearch] = useState("");

  return (
    <div className="app-page-faq-root" aria-labelledby="app-page-faq-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-faq-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-faq-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-faq-crumb-sep">/</span>
        <span className="app-page-faq-crumb-here">FAQ / Help Center</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-faq-page-head">
        <div>
          <h1 id="app-page-faq-h1" className="app-page-faq-h1">
            <span className="app-page-faq-ph-emoji" aria-hidden="true">💬</span>
            FAQ / Help Center
          </h1>
          <p className="app-page-faq-sub">
            Answer the questions you keep getting. Organize Q&amp;A by section, and visitors can search across the whole page.
          </p>
          <div className="app-page-faq-title-chips" aria-label="Title quick-pick">
            <button className="app-page-faq-title-chip" type="button">FAQ</button>
            <button className="app-page-faq-title-chip" type="button">Help Center</button>
            <button className="app-page-faq-title-chip" type="button">Support</button>
            <button className="app-page-faq-title-chip" type="button">Common questions</button>
            <button className="app-page-faq-title-chip" type="button">
              <span className="app-page-faq-sparkle">✨</span> Suggest more
            </button>
          </div>
        </div>
        <div className="app-page-faq-actions">
          <span className="app-page-faq-url-pill">
            <span className="app-page-faq-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>faq</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
            </svg>
            Preview
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 1 — Page settings
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-faq-panel">
        <div className="app-page-faq-panel-head">
          <h2>Page settings</h2>
          <span className="app-page-faq-panel-sub">Title, URL, visibility and SEO for the FAQ page itself.</span>
        </div>
        <div className="app-page-faq-panel-body">

          <div className="app-page-faq-field-row">
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label" htmlFor="faq-page-title">
                Page title{" "}
                <span className="app-page-faq-field-hint">shown as &lt;h1&gt; on the public page</span>
              </label>
              <input className="app-page-faq-field-input" id="faq-page-title" type="text" defaultValue="FAQ" />
            </div>
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label" htmlFor="faq-page-slug">
                URL slug{" "}
                <span className="app-page-faq-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-faq-field-prefix-wrap">
                <span className="app-page-faq-field-prefix">tadaify.com/{handle}/</span>
                <input id="faq-page-slug" type="text" defaultValue="faq" />
              </div>
            </div>
          </div>

          <div className="app-page-faq-field-row">
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label">Publish</label>
              <ToggleRow name="Page is live" sub="Visitors can find this Help Center at the URL above." defaultOn />
            </div>
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label">Show in main page nav</label>
              <ToggleRow
                name="Link from your homepage"
                sub={<>Adds a "FAQ" link to the footer of <span style={{ fontFamily: "var(--font-mono)" }}>/{handle}</span>.</>}
                defaultOn
              />
            </div>
          </div>

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label">
              Page background{" "}
              <span className="app-page-faq-field-hint">override theme colour for this page only</span>
            </label>
            <SwatchRow />
          </div>

          <details className="app-page-faq-expander" style={{ marginTop: 14 }}>
            <summary>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <path d="M12 2a3 3 0 0 0-3 3v7" /><path d="M9 12V7a3 3 0 0 1 6 0v5" /><circle cx="12" cy="17" r="3" />
              </svg>
              SEO settings{" "}
              <span className="app-page-faq-ex-sub">— meta title, description, social card</span>
              <svg className="app-page-faq-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                <polyline points="6 15 12 9 18 15" />
              </svg>
            </summary>
            <div className="app-page-faq-ex-body">
              <div className="app-page-faq-field">
                <label className="app-page-faq-field-label" htmlFor="faq-seo-title">
                  Meta title{" "}
                  <span className="app-page-faq-field-hint">~60 chars · used by Google + share previews</span>
                </label>
                <div className="app-page-faq-field-prefix-wrap">
                  <input id="faq-seo-title" type="text" defaultValue="FAQ — Strong Not Skinny by Alexandra Silva" />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-faq-field-suffix-action" type="button">✨ Suggest</button>
                </div>
              </div>
              <div className="app-page-faq-field">
                <label className="app-page-faq-field-label" htmlFor="faq-seo-desc">
                  Meta description{" "}
                  <span className="app-page-faq-field-hint">~155 chars</span>
                </label>
                <div className="app-page-faq-field-prefix-wrap" style={{ alignItems: "flex-start" }}>
                  <textarea
                    id="faq-seo-desc"
                    className="app-page-faq-field-area"
                    style={{ border: 0, boxShadow: "none", padding: "10px 12px" }}
                    defaultValue="Answers to common questions about training plans, refunds, coaching calls, and how to access your downloads."
                  />
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-faq-field-suffix-action" type="button" style={{ marginTop: 6 }}>✨ Suggest</button>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — FAQ behaviour
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-faq-panel">
        <div className="app-page-faq-panel-head">
          <h2>FAQ behaviour</h2>
          <span className="app-page-faq-panel-sub">How visitors browse and search the page.</span>
        </div>
        <div className="app-page-faq-panel-body">

          <div className="app-page-faq-field-row">
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label">Search bar</label>
              <ToggleRow name="Visitors can search" sub="Sticky search filters across all questions live as they type." defaultOn />
            </div>
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label">Table of contents</label>
              <ToggleRow name="Show TOC sidebar" sub="Sticky on desktop · collapsible on mobile." defaultOn />
            </div>
          </div>

          <div className="app-page-faq-field-row">
            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label" htmlFor="cfg-expand">Default expand state</label>
              <div className="app-page-faq-visual-radio-row" role="radiogroup" aria-label="Default expand state">

                <label
                  className={`app-page-faq-visual-radio${expandMode === "first" ? " is-selected" : ""}`}
                  role="radio"
                  aria-checked={expandMode === "first"}
                  tabIndex={0}
                  onClick={() => setExpandMode("first")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandMode("first"); }}
                >
                  <div className="app-page-faq-vr-preview">
                    <div className="app-page-faq-vr-bar" />
                    <div className="app-page-faq-vr-bar muted" />
                    <div className="app-page-faq-vr-bar muted" />
                  </div>
                  <div className="app-page-faq-vr-name">First open</div>
                  <div className="app-page-faq-vr-sub">First section expanded, rest collapsed.</div>
                  <input type="radio" name="expand" value="first" checked={expandMode === "first"} onChange={() => setExpandMode("first")} hidden />
                </label>

                <label
                  className={`app-page-faq-visual-radio${expandMode === "collapsed" ? " is-selected" : ""}`}
                  role="radio"
                  aria-checked={expandMode === "collapsed"}
                  tabIndex={0}
                  onClick={() => setExpandMode("collapsed")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandMode("collapsed"); }}
                >
                  <div className="app-page-faq-vr-preview">
                    <div className="app-page-faq-vr-bar muted" />
                    <div className="app-page-faq-vr-bar muted" />
                    <div className="app-page-faq-vr-bar muted" />
                  </div>
                  <div className="app-page-faq-vr-name">All collapsed</div>
                  <div className="app-page-faq-vr-sub">Visitors click each Q to expand.</div>
                  <input type="radio" name="expand" value="collapsed" checked={expandMode === "collapsed"} onChange={() => setExpandMode("collapsed")} hidden />
                </label>

                <label
                  className={`app-page-faq-visual-radio${expandMode === "expanded" ? " is-selected" : ""}`}
                  role="radio"
                  aria-checked={expandMode === "expanded"}
                  tabIndex={0}
                  onClick={() => setExpandMode("expanded")}
                  onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") setExpandMode("expanded"); }}
                >
                  <div className="app-page-faq-vr-preview">
                    <div className="app-page-faq-vr-bar" />
                    <div className="app-page-faq-vr-bar" />
                    <div className="app-page-faq-vr-bar" />
                  </div>
                  <div className="app-page-faq-vr-name">All expanded</div>
                  <div className="app-page-faq-vr-sub">Best for short FAQs (&lt; 10 questions).</div>
                  <input type="radio" name="expand" value="expanded" checked={expandMode === "expanded"} onChange={() => setExpandMode("expanded")} hidden />
                </label>

              </div>
            </div>

            <div className="app-page-faq-field">
              <label className="app-page-faq-field-label">
                {'"'}Was this helpful?{'"'} feedback
              </label>
              <ToggleRow name="Show yes / no buttons under each answer" sub="Tracks click counts so you know which answers land." defaultOn />
              <TierHint>
                Helpful-feedback tracking is part of <b>Creator</b>. We&apos;ll prompt to upgrade at save if you&apos;re on Free.
              </TierHint>
            </div>
          </div>

          <div className="app-page-faq-field">
            <label className="app-page-faq-field-label">Cross-section tags</label>
            <ToggleRow
              name="Allow tagging questions across sections"
              sub={<>Add tags like <span style={{ fontFamily: "var(--font-mono)" }}>premium</span> or <span style={{ fontFamily: "var(--font-mono)" }}>new</span>; visitors filter by tag chip.</>}
              defaultOn
            />
            <TierHint>
              Cross-section tagging + the public tag-filter chip bar are part of <b>Pro</b>. We&apos;ll prompt to upgrade at save.
            </TierHint>
          </div>

          <div className="app-page-faq-index-pill" style={{ marginTop: 6 }}>
            <span className="app-page-faq-ix-dot" aria-hidden="true" />
            Search index → <b>47</b> questions across <b>6</b> sections · <b>18</b> distinct tags · indexed 2 min ago
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — Sections & questions
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-faq-panel">
        <div className="app-page-faq-panel-head">
          <h2>Sections &amp; questions</h2>
          <span className="app-page-faq-panel-sub">Group related questions into sections. Drag to reorder either level.</span>
          <span className="app-page-faq-head-spacer" />
          {/* TODO: wire to admin pages API */}
          <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button" onClick={() => setCsvOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            Import CSV
          </button>
          <button className="app-page-faq-btn app-page-faq-btn-primary app-page-faq-btn-sm" type="button" onClick={() => setAddSecOpen(true)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add section
          </button>
        </div>
        <div className="app-page-faq-panel-body-lg">

          {hasContent ? (
            <>
              {/* ── Composer toolbar ── */}
              <div className="app-page-faq-composer-toolbar">
                <div className="app-page-faq-search-wrap">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Search questions you've added…"
                    value={editorSearch}
                    onChange={(e) => setEditorSearch(e.target.value)}
                  />
                </div>
                <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <polyline points="4 14 10 14 10 20" /><polyline points="20 10 14 10 14 4" />
                    <line x1="14" y1="10" x2="21" y2="3" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  Collapse all
                </button>
                <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
                    <polyline points="15 3 21 3 21 9" /><polyline points="9 21 3 21 3 15" />
                    <line x1="21" y1="3" x2="14" y2="10" /><line x1="3" y1="21" x2="10" y2="14" />
                  </svg>
                  Expand all
                </button>
              </div>

              {/* ── Section cards ── */}
              <div className="app-page-faq-qa-composer">
                {INIT_SECTIONS.map((sec) => (
                  <SectionCard
                    key={sec.id}
                    section={sec}
                    onAddQuestion={() => setQaOpen(true)}
                    onEditQuestion={() => setQaOpen(true)}
                  />
                ))}
              </div>

              {/* ── AI bulk-suggest strip ── */}
              <div className="app-page-faq-sec-actions-row">
                <span style={{ fontSize: 12.5, color: "var(--fg-muted)" }}>Need ideas?</span>
                {/* TODO: wire to admin pages API */}
                <button className="app-page-faq-ai-cta" type="button">
                  ✨ AI suggest 5 common questions
                </button>
                <span className="app-page-faq-sec-actions-spacer" />
                <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button" onClick={() => setAddSecOpen(true)}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                  </svg>
                  Add section
                </button>
              </div>
            </>
          ) : (
            <div className="app-page-faq-empty-state">
              <div className="app-page-faq-es-emoji" aria-hidden="true">💬</div>
              <h3>Build your Help Center</h3>
              <p>Group your most-asked questions into sections so visitors can find answers fast — and message you less.</p>
              {/* TODO: wire to admin pages API */}
              <button className="app-page-faq-btn app-page-faq-btn-primary" type="button" onClick={() => setAddSecOpen(true)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" aria-hidden="true">
                  <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Create your first section
              </button>
              <span style={{ color: "var(--brand-primary)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                ✨ Or let AI bootstrap your FAQ →
              </span>
              <div className="app-page-faq-es-templates-row" aria-label="Starter templates">
                {EMPTY_STATE_TEMPLATES.map((t) => (
                  <button key={t.name} className="app-page-faq-es-templ-tile" type="button">
                    <span className="app-page-faq-tt-emoji">{t.emoji}</span>
                    <span className="app-page-faq-tt-name">{t.name}</span>
                    <span className="app-page-faq-tt-sub">{t.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="app-page-faq-save-bar" role="status" aria-live="polite">
        <span className="app-page-faq-sb-status">
          <span className="app-page-faq-sb-dot" aria-hidden="true" />
          Auto-saved 12 seconds ago
        </span>
        <span className="app-page-faq-sb-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-faq-btn app-page-faq-btn-ghost app-page-faq-btn-sm" type="button">Discard changes</button>
        <button className="app-page-faq-btn app-page-faq-btn-primary app-page-faq-btn-sm" type="button">Save changes</button>
      </div>

      {/* ── Modals (centered, NEVER drawers) ── */}
      {addSecOpen && <AddSectionModal onClose={() => setAddSecOpen(false)} />}
      {qaOpen     && <QaModal        onClose={() => setQaOpen(false)} />}
      {csvOpen    && <CsvModal       onClose={() => setCsvOpen(false)} />}

    </div>
  );
}
