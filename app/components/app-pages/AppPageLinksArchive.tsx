/**
 * AppPageLinksArchive — Pages → Links archive page-level editor (creator-facing).
 *
 * Visual contract: mockups/tadaify-mvp/app-page-links-archive.html (1737 LOC)
 *
 * Sections implemented (1:1 with mockup):
 *   1. Page settings — title, URL slug, publish toggle, show-in-footer toggle,
 *      theme color swatches, SEO expander (meta title, description, OG image).
 *   2. Sources — per-source toggles (homepage, blog, about, custom, manual),
 *      live link count summary.
 *   3. Manual bonus links — draggable list, inline editor per row (title, icon,
 *      URL, A/B variant, schedule visibility), add / delete actions.
 *   4. How visitors browse — grouping mode visual selector (5 cards),
 *      visitor control toggles (search, tag filters, sort dropdown, click counts).
 *   5. Excluded from archive — excluded link rows with Edit reason / Restore,
 *      centered Reason modal (NEVER a drawer).
 *
 * Dead-code component: do NOT add to routes.ts. Will be wired when multi-page
 * (Q+1) ships.
 *
 * All save/publish/upload actions stubbed — TODO: wire to admin pages API.
 */

import { useState } from "react";
import type { ReactElement } from "react";

interface AppPageLinksArchiveProps {
  handle: string;
}

// ─── Types ────────────────────────────────────────────────────────────────────

type GroupMode = "source" | "manual" | "alpha" | "clicks" | "newest";

// ─── Demo data ────────────────────────────────────────────────────────────────

interface ManualLink {
  id: string;
  icon: string;
  iconTheme: string;
  title: string;
  url: string;
  badge?: string;
}

const INIT_MANUAL_LINKS: ManualLink[] = [
  { id: "m1", icon: "🎙️", iconTheme: "",          title: "Old podcast — 2019 Lex Fridman interview",    url: "https://podcasts.apple.com/podcast/lex-fridman/id1434243584?i=1000452831024", badge: "A/B test" },
  { id: "m2", icon: "📰", iconTheme: "t-rose",     title: "2017 New York Times feature about my studio", url: "https://www.nytimes.com/2017/04/12/arts/music/alexandra-silva-studio.html" },
  { id: "m3", icon: "🎬", iconTheme: "t-emerald",  title: "Documentary short — 2020",                    url: "https://vimeo.com/447832901" },
  { id: "m4", icon: "🎤", iconTheme: "t-warm",     title: "Live at SXSW 2018 — full set",               url: "https://www.youtube.com/watch?v=dQw4w9WgXcQ" },
  { id: "m5", icon: "🧵", iconTheme: "t-sky",      title: "Long Twitter thread on creative blocks",      url: "https://twitter.com/alexandra/status/1456732891024" },
];

interface ExcludedLink {
  id: string;
  title: string;
  url: string;
  reason: string;
}

const INIT_EXCLUDED: ExcludedLink[] = [
  { id: "x1", title: "Old support form (deprecated)",              url: "tadaify.com/alexandra/support-2019",  reason: "replaced by Contact page" },
  { id: "x2", title: "Internal team Notion (private)",             url: "notion.so/team-internal-9a82",        reason: "not for public archive" },
  { id: "x3", title: "Affiliate code that expired",                url: "store.example.com/?ref=alex-2024",    reason: "link no longer pays" },
  { id: "x4", title: '"Coming soon" placeholder from launch week', url: "tadaify.com/alexandra/coming-soon",    reason: "temporary" },
  { id: "x5", title: "Draft podcast episode I never released",     url: "soundcloud.com/alex/private-draft-44", reason: "still working on it" },
];

const SOURCE_COUNTS: Record<string, number> = {
  home: 87, blog: 42, about: 9, custom: 0, manual: 5,
};

const ARCHIVE_SWATCHES = [
  { style: "#6366F1", label: "Indigo" },
  { style: "#F59E0B", label: "Warm" },
  { style: "#34D399", label: "Emerald" },
  { style: "#FB7185", label: "Rose" },
  { style: "#38BDF8", label: "Sky" },
  { style: "#C026D3", label: "Magenta" },
  { style: "#475569", label: "Slate" },
  { style: "#0B0F1E", label: "Black" },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Toggle({ defaultOn = false }: { defaultOn?: boolean }): ReactElement {
  const [on, setOn] = useState(defaultOn);
  return (
    <button
      className={`app-page-links-archive-toggle${on ? " is-on" : ""}`}
      type="button"
      aria-pressed={on}
      aria-label="Toggle"
      onClick={() => setOn((v) => !v)}
    />
  );
}

function ToggleRow({
  name,
  sub,
  defaultOn = false,
  tierHint,
}: {
  name: ReactElement | string;
  sub: string;
  defaultOn?: boolean;
  tierHint?: ReactElement;
}): ReactElement {
  return (
    <div className="app-page-links-archive-row-toggle">
      <div className="app-page-links-archive-rt-left">
        <div className="app-page-links-archive-rt-name">{name}</div>
        <div className="app-page-links-archive-rt-sub">{sub}</div>
        {tierHint}
      </div>
      <Toggle defaultOn={defaultOn} />
    </div>
  );
}

function TierHint({ children, variant = "warm" }: { children: ReactElement | string; variant?: "warm" | "pro" }): ReactElement {
  return (
    <div className={`app-page-links-archive-tier-hint${variant === "pro" ? " t-pro" : ""}`}>
      <span className="app-page-links-archive-th-icon" aria-hidden="true">{variant === "pro" ? "✨" : "🔒"}</span>
      <span>{children}</span>
    </div>
  );
}

// ─── Swatch row ───────────────────────────────────────────────────────────────

function SwatchRow(): ReactElement {
  const [sel, setSel] = useState(0);
  return (
    <div className="app-page-links-archive-swatch-row">
      {ARCHIVE_SWATCHES.map((s, i) => (
        <button
          key={s.label}
          className={`app-page-links-archive-swatch${sel === i ? " is-selected" : ""}`}
          style={{ background: s.style }}
          type="button"
          title={s.label}
          aria-label={s.label}
          onClick={() => setSel(i)}
        />
      ))}
    </div>
  );
}

// ─── Source row ───────────────────────────────────────────────────────────────

function SourceRow({
  sourceKey,
  icon,
  iconClass,
  name,
  chip,
  sub,
  count,
  defaultOn,
  onToggle,
}: {
  sourceKey: string;
  icon: string;
  iconClass?: string;
  name: string;
  chip?: ReactElement;
  sub: ReactElement | string;
  count: number;
  defaultOn: boolean;
  onToggle: (key: string, on: boolean) => void;
}): ReactElement {
  const [on, setOn] = useState(defaultOn);
  const toggle = () => {
    const next = !on;
    setOn(next);
    onToggle(sourceKey, next);
  };
  return (
    <div className={`app-page-links-archive-source-row${on ? " is-on" : ""}`}>
      <button
        type="button"
        className={`app-page-links-archive-toggle${on ? " is-on" : ""}`}
        aria-pressed={on}
        aria-label={`Include ${name}`}
        onClick={toggle}
      />
      <div>
        <div className="app-page-links-archive-src-name">
          <span className={`app-page-links-archive-src-ico${iconClass ? " " + iconClass : ""}`}>{icon}</span>
          {name}
          {chip}
        </div>
        <div className="app-page-links-archive-src-sub">{sub}</div>
      </div>
      <span className="app-page-links-archive-src-count">{count} links</span>
    </div>
  );
}

// ─── Manual link row ──────────────────────────────────────────────────────────

function ManualLinkRow({
  link,
  onDelete,
}: {
  link: ManualLink;
  onDelete: (id: string) => void;
}): ReactElement {
  const [editing, setEditing] = useState(false);

  return (
    <div className={`app-page-links-archive-manual-row${editing ? " is-editing" : ""}`} data-id={link.id}>
      {!editing && (
        <>
          <div className="app-page-links-archive-ml-handle" aria-label="Drag to reorder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="8" y1="6" x2="16" y2="6" />
              <line x1="8" y1="12" x2="16" y2="12" />
              <line x1="8" y1="18" x2="16" y2="18" />
            </svg>
          </div>
          <div className={`app-page-links-archive-ml-icon${link.iconTheme ? " " + link.iconTheme : ""}`}>{link.icon}</div>
          <div className="app-page-links-archive-ml-meta-col">
            <div className="app-page-links-archive-ml-title-row">
              <span className="app-page-links-archive-ml-title">{link.title}</span>
              {link.badge && (
                <span className="app-page-links-archive-chip app-page-links-archive-chip-warm">{link.badge}</span>
              )}
            </div>
            <div className="app-page-links-archive-ml-url">{link.url}</div>
          </div>
          <div className="app-page-links-archive-ml-actions">
            <button
              className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-xs"
              type="button"
              onClick={() => setEditing(true)}
            >
              Edit
            </button>
            <button
              className="app-page-links-archive-iconbtn"
              type="button"
              aria-label="Delete"
              onClick={() => onDelete(link.id)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="3 6 5 6 21 6" />
                <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                <path d="M10 11v6" />
                <path d="M14 11v6" />
              </svg>
            </button>
          </div>
        </>
      )}
      {editing && (
        <div className="app-page-links-archive-ml-edit-pane">
          <div className="app-page-links-archive-field-row">
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label">Title</label>
              <input className="app-page-links-archive-field-input" type="text" defaultValue={link.title} />
            </div>
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label">Icon emoji or upload</label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input className="app-page-links-archive-field-input" type="text" defaultValue={link.icon} style={{ maxWidth: 80, textAlign: "center", fontSize: 18 }} />
                {/* TODO: wire to admin pages API */}
                <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">Upload</button>
                <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">✨ Pick</button>
              </div>
            </div>
          </div>
          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label">URL</label>
            <input className="app-page-links-archive-field-input" type="url" defaultValue={link.url} />
          </div>
          <div className="app-page-links-archive-field-row">
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label">
                A/B test variant{" "}
                <span className="app-page-links-archive-chip app-page-links-archive-chip-warm">Business</span>
              </label>
              <select className="app-page-links-archive-field-select" defaultValue="50-50">
                <option value="off">Off</option>
                <option value="50-50">50/50 — auto-pick winner after 7 days</option>
                <option value="manual">Manual split</option>
              </select>
              <TierHint variant="warm">
                A/B testing on link buttons is part of the Business plan. You can configure it now — gating happens at Save.
              </TierHint>
            </div>
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label">
                Schedule visibility{" "}
                <span className="app-page-links-archive-chip">Creator+</span>
              </label>
              <input className="app-page-links-archive-field-input" type="datetime-local" defaultValue="2026-05-01T09:00" />
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button
              className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm"
              type="button"
              onClick={() => setEditing(false)}
            >
              Cancel
            </button>
            {/* TODO: wire to admin pages API */}
            <button
              className="app-page-links-archive-btn app-page-links-archive-btn-primary app-page-links-archive-btn-sm"
              type="button"
              onClick={() => setEditing(false)}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Grouping mode card ───────────────────────────────────────────────────────

function GroupModeCard({
  mode,
  title,
  chip,
  sub,
  thumb,
  selected,
  onSelect,
}: {
  mode: GroupMode;
  title: string;
  chip?: ReactElement;
  sub: string;
  thumb: ReactElement;
  selected: boolean;
  onSelect: (m: GroupMode) => void;
}): ReactElement {
  return (
    <button
      type="button"
      className={`app-page-links-archive-group-card${selected ? " is-selected" : ""}`}
      onClick={() => onSelect(mode)}
    >
      <div className="app-page-links-archive-gc-thumb">{thumb}</div>
      <div className="app-page-links-archive-gc-title">
        {title} {chip}
      </div>
      <div className="app-page-links-archive-gc-sub">{sub}</div>
    </button>
  );
}

// ─── Reason modal ─────────────────────────────────────────────────────────────

function ReasonModal({
  link,
  onClose,
  onSave,
}: {
  link: ExcludedLink;
  onClose: () => void;
  onSave: (id: string, reason: string) => void;
}): ReactElement {
  const [reason, setReason] = useState(link.reason);
  return (
    <div
      className="app-page-links-archive-modal-backdrop is-open"
      role="dialog"
      aria-modal="true"
      aria-labelledby="la-reason-title"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="app-page-links-archive-modal">
        <div className="app-page-links-archive-modal-head">
          <h3 id="la-reason-title">Why exclude this link?</h3>
          <span className="app-page-links-archive-head-spacer" />
          <button className="app-page-links-archive-iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="app-page-links-archive-modal-body">
          <p style={{ color: "var(--fg-muted)", fontSize: "13.5px", margin: "0 0 14px" }}>
            A short note for your future self — never shown to visitors.
          </p>
          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label">Link</label>
            <div className="app-page-links-archive-field-prefix-wrap">
              <span className="app-page-links-archive-field-prefix">URL</span>
              <input type="text" value={link.url} disabled readOnly />
            </div>
          </div>
          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label" htmlFor="la-reason-text">Reason</label>
            <textarea
              id="la-reason-text"
              className="app-page-links-archive-field-area"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Replaced by Contact page · Affiliate code expired · Internal only"
            />
          </div>
        </div>
        <div className="app-page-links-archive-modal-foot">
          <span className="app-page-links-archive-foot-spacer" />
          <button
            className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm"
            type="button"
            onClick={onClose}
          >
            Cancel
          </button>
          {/* TODO: wire to admin pages API */}
          <button
            className="app-page-links-archive-btn app-page-links-archive-btn-primary app-page-links-archive-btn-sm"
            type="button"
            onClick={() => { onSave(link.id, reason); onClose(); }}
          >
            Save reason
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Excluded row ─────────────────────────────────────────────────────────────

function ExcludedRow({
  link,
  onEditReason,
  onRestore,
}: {
  link: ExcludedLink;
  onEditReason: (id: string) => void;
  onRestore: (id: string) => void;
}): ReactElement {
  return (
    <div className="app-page-links-archive-excluded-row" data-id={link.id}>
      <div className="app-page-links-archive-ex-ico">🚫</div>
      <div className="app-page-links-archive-ex-meta">
        <div className="app-page-links-archive-ex-title">{link.title}</div>
        <div className="app-page-links-archive-ex-line">
          <span className="app-page-links-archive-ex-url">{link.url}</span>
          <span>·</span>
          <span className="app-page-links-archive-ex-reason">Reason: {link.reason}</span>
        </div>
      </div>
      <div className="app-page-links-archive-ex-actions">
        <button
          className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-xs"
          type="button"
          onClick={() => onEditReason(link.id)}
        >
          Edit reason
        </button>
        <button
          className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-xs"
          type="button"
          onClick={() => onRestore(link.id)}
        >
          Restore
        </button>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

let manualSeq = 6;

export function AppPageLinksArchive({ handle }: AppPageLinksArchiveProps): ReactElement {
  const [manualLinks, setManualLinks] = useState<ManualLink[]>(INIT_MANUAL_LINKS);
  const [excludedLinks, setExcludedLinks] = useState<ExcludedLink[]>(INIT_EXCLUDED);
  const [reasonModalId, setReasonModalId] = useState<string | null>(null);
  const [groupMode, setGroupMode] = useState<GroupMode>("source");
  const [sourcesOn, setSourcesOn] = useState<Record<string, boolean>>({
    home: true, blog: true, about: true, custom: false, manual: true,
  });

  const liveCount = Object.entries(sourcesOn)
    .filter(([, on]) => on)
    .reduce((sum, [k]) => sum + (SOURCE_COUNTS[k] ?? 0), 0);
  const liveSrcs = Object.values(sourcesOn).filter(Boolean).length;

  const handleSourceToggle = (key: string, on: boolean) => {
    setSourcesOn((prev) => ({ ...prev, [key]: on }));
  };

  const addManualLink = () => {
    const id = `m${manualSeq++}`;
    setManualLinks((prev) => [
      ...prev,
      { id, icon: "🔗", iconTheme: "", title: "New manual link", url: "https://" },
    ]);
  };

  const deleteManualLink = (id: string) => {
    setManualLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const restoreExcluded = (id: string) => {
    setExcludedLinks((prev) => prev.filter((l) => l.id !== id));
  };

  const saveReason = (id: string, reason: string) => {
    setExcludedLinks((prev) =>
      prev.map((l) => (l.id === id ? { ...l, reason } : l))
    );
  };

  const reasonLink = excludedLinks.find((l) => l.id === reasonModalId);

  return (
    <div className="app-page-links-archive-root" aria-labelledby="app-page-links-archive-h1">

      {/* ── Breadcrumb ── */}
      <nav className="app-page-links-archive-crumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="app-page-links-archive-crumb-sep">/</span>
        <a href="/app?tab=page">Pages</a>
        <span className="app-page-links-archive-crumb-sep">/</span>
        <span className="app-page-links-archive-crumb-here">Links archive</span>
      </nav>

      {/* ── Page head ── */}
      <div className="app-page-links-archive-page-head">
        <div>
          <h1 id="app-page-links-archive-h1" className="app-page-links-archive-h1">
            <span className="app-page-links-archive-ph-emoji" aria-hidden="true">🗂️</span>
            Links archive
          </h1>
          <p className="app-page-links-archive-sub">
            A browse-all-links sub-page that pulls from your homepage, blog posts, and other pages — search, group, and filter for visitors who want the full catalogue.
          </p>
          <div className="app-page-links-archive-quick-titles">
            <span className="app-page-links-archive-qt-label">Title ideas</span>
            {["All links", "Browse all", "Links archive", "The full catalogue"].map((t) => (
              <button key={t} className="app-page-links-archive-qt-chip" type="button">{t}</button>
            ))}
            <button className="app-page-links-archive-qt-chip" type="button">
              <span className="app-page-links-archive-sparkle">✨</span> Suggest more
            </button>
          </div>
        </div>
        <div className="app-page-links-archive-actions">
          <span className="app-page-links-archive-url-pill">
            <span className="app-page-links-archive-live-dot" aria-hidden="true" />
            tadaify.com/{handle}/<b>links</b>
          </span>
          {/* TODO: wire to admin pages API */}
          <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">
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
      <section className="app-page-links-archive-section">
        <div className="app-page-links-archive-section-head">
          <h2>Page settings</h2>
          <span className="app-page-links-archive-section-sub">Title, URL, visibility, theme, and SEO for the archive page itself.</span>
        </div>
        <div className="app-page-links-archive-section-body">

          {/* Title + Slug */}
          <div className="app-page-links-archive-field-row">
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label" htmlFor="la-page-title">
                Page title{" "}
                <span className="app-page-links-archive-field-hint">shown as &lt;h1&gt; on the public archive</span>
              </label>
              <input id="la-page-title" className="app-page-links-archive-field-input" type="text" defaultValue="All links" />
            </div>
            <div className="app-page-links-archive-field">
              <label className="app-page-links-archive-field-label" htmlFor="la-page-slug">
                URL slug{" "}
                <span className="app-page-links-archive-field-hint">letters, numbers, hyphens</span>
              </label>
              <div className="app-page-links-archive-field-prefix-wrap">
                <span className="app-page-links-archive-field-prefix">tadaify.com/{handle}/</span>
                <input id="la-page-slug" type="text" defaultValue="links" />
              </div>
            </div>
          </div>

          {/* Publish + Show in footer */}
          <div className="app-page-links-archive-field-row">
            <div className="app-page-links-archive-field">
              <ToggleRow
                name="Publish to public"
                sub="Anyone with the link can browse the archive."
                defaultOn
              />
            </div>
            <div className="app-page-links-archive-field">
              <ToggleRow
                name="Show in homepage footer"
                sub={`Adds a "Browse all links →" link below your blocks.`}
                defaultOn
              />
            </div>
          </div>

          {/* Theme color */}
          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label">
              Theme color{" "}
              <span className="app-page-links-archive-field-hint">overrides the default page accent for this archive</span>
            </label>
            <SwatchRow />
          </div>

          {/* SEO expander */}
          <details className="app-page-links-archive-expander" style={{ marginTop: 14 }}>
            <summary>
              SEO &amp; sharing
              <span className="app-page-links-archive-ex-sub"> Meta title, description, OG image — for Google &amp; social previews</span>
              <svg className="app-page-links-archive-ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </summary>
            <div className="app-page-links-archive-ex-body">
              <div className="app-page-links-archive-field">
                <label className="app-page-links-archive-field-label" htmlFor="la-seo-title">
                  Meta title{" "}
                  <span className="app-page-links-archive-field-hint">≤ 60 chars</span>
                </label>
                <input id="la-seo-title" className="app-page-links-archive-field-input" type="text" defaultValue="All my links — Alexandra Silva" />
              </div>
              <div className="app-page-links-archive-field">
                <label className="app-page-links-archive-field-label" htmlFor="la-seo-desc">
                  Meta description{" "}
                  <span className="app-page-links-archive-field-hint">≤ 160 chars</span>
                </label>
                <textarea id="la-seo-desc" className="app-page-links-archive-field-area" defaultValue="Browse 143 links from Alexandra — playlists, podcasts, guest interviews, merch, behind-the-scenes content, and more." />
              </div>
              <div className="app-page-links-archive-field">
                <label className="app-page-links-archive-field-label">Open Graph image</label>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  <div style={{ width: 100, height: 56, borderRadius: 8, background: "linear-gradient(135deg,#6366F1,#8B5CF6)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 11, fontWeight: 600 }}>
                    1200×630
                  </div>
                  {/* TODO: wire to admin pages API */}
                  <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">Replace</button>
                  <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">✨ Generate</button>
                </div>
              </div>
            </div>
          </details>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 2 — Sources
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-links-archive-section">
        <div className="app-page-links-archive-section-head">
          <h2>Where do the links come from?</h2>
          <span className="app-page-links-archive-section-sub">Toggle pages whose link buttons should populate the archive. Counts update live.</span>
        </div>
        <div className="app-page-links-archive-section-body">

          <div className="app-page-links-archive-source-list">
            <SourceRow
              sourceKey="home"
              icon="🏠"
              name="Homepage main page"
              chip={<span className="app-page-links-archive-chip" style={{ marginLeft: 4 }}>default</span>}
              sub={<>All Link button blocks on your main <code>/{handle}</code> page.</>}
              count={SOURCE_COUNTS.home}
              defaultOn={true}
              onToggle={handleSourceToggle}
            />
            <SourceRow
              sourceKey="blog"
              icon="📝"
              iconClass="s-blog"
              name="Blog post bodies"
              sub={'Pulls every link button placed inside a blog post body — appears under "From blog" group.'}
              count={SOURCE_COUNTS.blog}
              defaultOn={true}
              onToggle={handleSourceToggle}
            />
            <SourceRow
              sourceKey="about"
              icon="👤"
              iconClass="s-about"
              name="About page sections"
              sub={<>Press, contact, story-timeline links from your <code>/{handle}/about</code> page.</>}
              count={SOURCE_COUNTS.about}
              defaultOn={true}
              onToggle={handleSourceToggle}
            />
            <SourceRow
              sourceKey="custom"
              icon="📄"
              iconClass="s-custom"
              name="All custom pages"
              sub={<>Future pages you create with the page-template framework. <span style={{ color: "var(--fg-subtle)" }}>(0 today)</span></>}
              count={SOURCE_COUNTS.custom}
              defaultOn={false}
              onToggle={handleSourceToggle}
            />
            <SourceRow
              sourceKey="manual"
              icon="➕"
              iconClass="s-manual"
              name="Manually-added bonus links"
              sub="Archive-only links that don't appear on any other page. Edit below."
              count={manualLinks.length}
              defaultOn={true}
              onToggle={handleSourceToggle}
            />
          </div>

          <div className="app-page-links-archive-live-count" role="status" aria-live="polite">
            <div className="app-page-links-archive-lc-ico" aria-hidden="true">∑</div>
            <div className="app-page-links-archive-lc-text">
              <div className="app-page-links-archive-lc-num">
                {liveCount} links from {liveSrcs} sources
              </div>
              <div className="app-page-links-archive-lc-sub">
                Counts refresh hourly.{" "}
                <span style={{ color: "var(--brand-primary)", fontWeight: 600, cursor: "pointer" }}>
                  Recount now →
                </span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 3 — Manual bonus links
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-links-archive-section">
        <div className="app-page-links-archive-section-head">
          <h2>Manual bonus links</h2>
          <span className="app-page-links-archive-section-sub">
            Links that exist <em>only</em> on the archive — useful for old work you don&apos;t want featured on the homepage.
          </span>
          <span className="app-page-links-archive-head-spacer" />
          {/* TODO: wire to admin pages API */}
          <button
            className="app-page-links-archive-btn app-page-links-archive-btn-primary app-page-links-archive-btn-sm"
            type="button"
            onClick={addManualLink}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add manual link
          </button>
        </div>
        <div className="app-page-links-archive-section-body">

          <div className="app-page-links-archive-manual-toolbar">
            <span className="app-page-links-archive-ml-meta">
              <b>{manualLinks.length}</b> manual links · drag to reorder · unlimited on every tier
            </span>
          </div>

          <div className="app-page-links-archive-manual-list">
            {manualLinks.map((link) => (
              <ManualLinkRow key={link.id} link={link} onDelete={deleteManualLink} />
            ))}
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 4 — How visitors browse
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-links-archive-section">
        <div className="app-page-links-archive-section-head">
          <h2>How visitors browse</h2>
          <span className="app-page-links-archive-section-sub">Choose how the archive groups + filters in the visitor&apos;s view.</span>
        </div>
        <div className="app-page-links-archive-section-body">

          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label">
              Grouping mode{" "}
              <span className="app-page-links-archive-field-hint">click to swap — preview updates live</span>
            </label>
            <div className="app-page-links-archive-group-modes">
              <GroupModeCard
                mode="source"
                title="By source page"
                chip={<span className="app-page-links-archive-chip">default</span>}
                sub={`"From homepage" / "From blog" / "Manual"`}
                thumb={
                  <>
                    <div className="app-page-links-archive-gh app-page-links-archive-gh-bold" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gh-small" style={{ marginTop: 6 }} />
                    <div className="app-page-links-archive-gl" />
                  </>
                }
                selected={groupMode === "source"}
                onSelect={setGroupMode}
              />
              <GroupModeCard
                mode="manual"
                title="Manual categories"
                chip={<span className="app-page-links-archive-chip" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>Creator+</span>}
                sub={`You define groups like "Music" / "Merch" / "Podcasts" then drag links into them.`}
                thumb={
                  <>
                    <div className="app-page-links-archive-gh app-page-links-archive-gh-bold" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gh-small" style={{ marginTop: 4, width: "25%" }} />
                    <div className="app-page-links-archive-gl" />
                  </>
                }
                selected={groupMode === "manual"}
                onSelect={setGroupMode}
              />
              <GroupModeCard
                mode="alpha"
                title="Alphabetical"
                sub="A → Z group headers. Easiest for huge libraries."
                thumb={
                  <>
                    <div className="app-page-links-archive-gh-small" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gh-small" style={{ marginTop: 4 }} />
                    <div className="app-page-links-archive-gl" />
                  </>
                }
                selected={groupMode === "alpha"}
                onSelect={setGroupMode}
              />
              <GroupModeCard
                mode="clicks"
                title="Most clicked"
                chip={<span className="app-page-links-archive-chip" style={{ background: "rgba(16,185,129,0.12)", color: "#047857" }}>Creator+</span>}
                sub="Pulls from the last 30 days of analytics. Hot links float up."
                thumb={
                  <>
                    <div className="app-page-links-archive-gh app-page-links-archive-gh-bold" style={{ width: "60%" }} />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" style={{ opacity: 0.5 }} />
                  </>
                }
                selected={groupMode === "clicks"}
                onSelect={setGroupMode}
              />
              <GroupModeCard
                mode="newest"
                title="Newest first"
                sub="Sorted by date the link was added. Great for content drops."
                thumb={
                  <>
                    <div className="app-page-links-archive-gh-small" style={{ fontWeight: "bold" }} />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" />
                    <div className="app-page-links-archive-gl" style={{ opacity: 0.7 }} />
                    <div className="app-page-links-archive-gl" style={{ opacity: 0.5 }} />
                  </>
                }
                selected={groupMode === "newest"}
                onSelect={setGroupMode}
              />
            </div>
          </div>

          <div style={{ height: 14 }} />

          <div className="app-page-links-archive-field">
            <label className="app-page-links-archive-field-label">
              Visitor controls{" "}
              <span className="app-page-links-archive-field-hint">what shows up at the top of the public archive</span>
            </label>
            <div className="app-page-links-archive-visitor-controls">
              <ToggleRow
                name="🔎 Search bar"
                sub="Client-side fuzzy search across all link titles. Always free."
                defaultOn
              />
              <ToggleRow
                name={
                  <>
                    🏷️ Tag filter chips{" "}
                    <span className="app-page-links-archive-chip" style={{ background: "rgba(16,185,129,0.12)", color: "#047857", marginLeft: 4 }}>Creator+</span>
                  </>
                }
                sub="Auto-tagged from link metadata + manual tags. Visitor clicks a chip → filtered list."
                defaultOn
                tierHint={
                  <TierHint variant="warm">
                    Tag filters are part of Creator. Configure them now — gating happens at Save.
                  </TierHint>
                }
              />
              <ToggleRow
                name={
                  <>
                    ↕️ Sort dropdown for visitors{" "}
                    <span className="app-page-links-archive-chip" style={{ background: "rgba(99,102,241,0.13)", color: "#4338CA", marginLeft: 4 }}>Pro+</span>
                  </>
                }
                sub="Lets visitors re-sort: A-Z / Most clicked / Newest. Default sort comes from grouping mode."
                tierHint={
                  <TierHint variant="pro">
                    Visitor-facing sort dropdown is part of Pro.
                  </TierHint>
                }
              />
              <ToggleRow
                name={
                  <>
                    📊 Show click counts on every link{" "}
                    <span className="app-page-links-archive-chip" style={{ background: "rgba(99,102,241,0.13)", color: "#4338CA", marginLeft: 4 }}>Pro+</span>
                  </>
                }
                sub={`Public counts like "1.2k clicks" build trust. Free shows just titles.`}
                tierHint={
                  <TierHint variant="pro">
                    Public click counts are part of Pro. Numbers stay private until then.
                  </TierHint>
                }
              />
            </div>
          </div>

        </div>
      </section>

      {/* ──────────────────────────────────────────────────────────────────
          SECTION 5 — Excluded from archive
          ────────────────────────────────────────────────────────────── */}
      <section className="app-page-links-archive-section">
        <div className="app-page-links-archive-section-head">
          <h2>Excluded from archive</h2>
          <span className="app-page-links-archive-section-sub">Hide specific links from the archive without deleting them from their source page.</span>
          <span className="app-page-links-archive-head-spacer" />
          <span className="app-page-links-archive-chip">
            <b>{excludedLinks.length}</b>&nbsp;excluded
          </span>
        </div>
        <div className="app-page-links-archive-section-body">
          <div className="app-page-links-archive-excluded-list">
            {excludedLinks.map((link) => (
              <ExcludedRow
                key={link.id}
                link={link}
                onEditReason={(id) => setReasonModalId(id)}
                onRestore={restoreExcluded}
              />
            ))}
          </div>
        </div>
      </section>

      {/* ── Save bar ── */}
      <div className="app-page-links-archive-save-bar" role="region" aria-label="Save changes">
        <div className="app-page-links-archive-sb-status">
          <span className="app-page-links-archive-sb-dot" aria-hidden="true" />
          All changes saved · last 12 sec ago
        </div>
        <span className="app-page-links-archive-sb-spacer" />
        {/* TODO: wire to admin pages API */}
        <button className="app-page-links-archive-btn app-page-links-archive-btn-ghost app-page-links-archive-btn-sm" type="button">Discard</button>
        {/* TODO: wire to admin pages API */}
        <button className="app-page-links-archive-btn app-page-links-archive-btn-primary app-page-links-archive-btn-sm" type="button">Save changes</button>
      </div>

      {/* ── Reason modal (centered, NEVER a drawer) ── */}
      {reasonLink && (
        <ReasonModal
          link={reasonLink}
          onClose={() => setReasonModalId(null)}
          onSave={saveReason}
        />
      )}

    </div>
  );
}
