/**
 * EditorShell — the shared shell every creator page editor under
 * `/app/pages/*` is built on. Wraps the screen in the dashboard appbar +
 * sidebar chrome (`DashboardChrome`), renders a breadcrumb + page header, the
 * editor's section stack as `children`, and a sticky save-bar at the bottom.
 *
 * Ported from the common structure of the `mockups/tadaify-mvp/app-page-*.html`
 * editors (page-head, `.section` cards, `.save-bar`). Presentational and
 * local-state only — interactions (collapse, toggle, dirty-on-edit, save) are
 * mocked by the composing screen and the primitives below.
 *
 * Exported primitives the editors compose:
 *   - <Section>      collapsible card with head (title + sub + chevron) + body
 *   - <Field>        labelled field wrapper (label + optional hint + control)
 *   - <RowToggle>    name/sub + on/off toggle row
 *   - <Toggle>       bare on/off switch
 *   - <Swatch> group helpers live in the editors themselves
 *
 * @implements fr-page-editor-about
 * @implements fr-page-editor-links-archive
 */
import { useEffect, useState, type ReactNode } from "react";
import "./page-editors-proto.css";
import { DashboardChrome, ChromeIcon as S, type PageSubItem } from "../dashboard/DashboardChrome";
import type { DashboardProfile } from "../dashboard/dashboardFixture";

/* ============================================================
   Crumb + page header
   ============================================================ */

export type Crumb = { label: string; href?: string };

/* ============================================================
   Save bar
   ============================================================ */

export type SaveState = "saved" | "dirty" | "saving";

const SAVE_COPY: Record<SaveState, string> = {
  saved: "All changes saved · just now",
  dirty: "Unsaved changes",
  saving: "Saving…",
};

/* ============================================================
   Shell
   ============================================================ */

export type EditorShellProps = {
  profile: DashboardProfile;
  /** Page emoji shown before the title, e.g. "👤". */
  emoji?: string;
  /** Page title, e.g. "About". */
  title: string;
  /** One-line description under the title. */
  description: ReactNode;
  /** Public URL slug shown in the url-pill, e.g. "about". */
  slug: string;
  /** Whether the page is published (drives the url-pill live dot). */
  live?: boolean;
  /** Breadcrumb trail (defaults to Home / Pages / <title>). */
  crumbs?: Crumb[];
  /** Extra actions rendered in the page header (e.g. Preview link). */
  headerActions?: ReactNode;
  /** Optional extra content under the page header (e.g. title-idea chips). */
  headerExtra?: ReactNode;
  /** Sidebar page rows in addition to Home; the active one matches `pageId`. */
  pageSubItems?: PageSubItem[];
  /** Active page id for sidebar highlight (matches a `pageSubItems` entry). */
  pageId: string;
  /** Save-bar status. */
  saveState: SaveState;
  /** Save / publish button label (defaults to "Save changes"). */
  saveLabel?: string;
  onSave: () => void;
  onDiscard: () => void;
  /** The section stack. */
  children: ReactNode;
};

export function EditorShell({
  profile,
  emoji,
  title,
  description,
  slug,
  live = true,
  crumbs,
  headerActions,
  headerExtra,
  pageSubItems = [],
  pageId,
  saveState,
  saveLabel = "Save changes",
  onSave,
  onDiscard,
  children,
}: EditorShellProps) {
  const trail: Crumb[] =
    crumbs ?? [
      { label: "Home", href: "/__proto/dashboard" },
      { label: "Pages", href: "/__proto/dashboard" },
      { label: title },
    ];

  return (
    <DashboardChrome
      profile={profile}
      activeTab="page"
      pageSubItems={pageSubItems}
      activePage={pageId}
    >
      <div className="proto-page-editor">
        {/* Breadcrumb */}
        <nav className="pe-crumb" aria-label="Breadcrumb">
          {trail.map((c, i) => (
            <span key={`${c.label}-${i}`} style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
              {i > 0 && <span className="sep">/</span>}
              {c.href && i < trail.length - 1 ? (
                <a href={c.href}>{c.label}</a>
              ) : (
                <span className="here">{c.label}</span>
              )}
            </span>
          ))}
        </nav>

        {/* Page header */}
        <div className="pe-head">
          <div>
            <h1>
              {emoji && <span className="ph-emoji" aria-hidden>{emoji}</span>} {title}
            </h1>
            <p className="sub">{description}</p>
            {headerExtra}
          </div>
          <div className="actions">
            <span className="url-pill">
              {live && <span className="live-dot" aria-hidden />}
              tadaify.com/{profile.handle}/<b>{slug}</b>
            </span>
            {headerActions}
          </div>
        </div>

        {/* Section stack */}
        {children}
      </div>

      {/* Sticky save bar */}
      <div className="pe-save-bar" role="region" aria-label="Save changes">
        <span className="sb-status">
          <span className={`sb-dot${saveState !== "saved" ? " is-dirty" : ""}`} aria-hidden />
          {SAVE_COPY[saveState]}
        </span>
        <span className="sb-spacer" />
        <button className="btn btn-ghost btn-sm" type="button" onClick={onDiscard}>
          Discard
        </button>
        <button className="btn btn-primary btn-sm" type="button" onClick={onSave}>
          {saveLabel}
        </button>
      </div>
    </DashboardChrome>
  );
}

/* ============================================================
   Section — collapsible card primitive
   ============================================================ */

export type SectionProps = {
  title: ReactNode;
  /** Optional sub-line under the head. */
  sub?: ReactNode;
  /** Optional content on the right of the head (chip / button). */
  headExtra?: ReactNode;
  /** Start collapsed. */
  defaultCollapsed?: boolean;
  children: ReactNode;
};

/** A collapsible `.section` card: head (title + sub + chevron) over a body. */
export function Section({ title, sub, headExtra, defaultCollapsed = false, children }: SectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);
  return (
    <section className={`pe-section${collapsed ? " is-collapsed" : ""}`}>
      <div className="pe-section-head">
        <div className="pe-section-titles">
          <h2>{title}</h2>
          {sub && <span className="sub">{sub}</span>}
        </div>
        {headExtra && <div className="pe-head-extra">{headExtra}</div>}
        <button
          className="pe-section-toggle"
          type="button"
          aria-expanded={!collapsed}
          aria-label={collapsed ? "Expand section" : "Collapse section"}
          onClick={() => setCollapsed((c) => !c)}
        >
          <S w={16}><polyline points="6 9 12 15 18 9" /></S>
        </button>
      </div>
      <div className="pe-section-body">{children}</div>
    </section>
  );
}

/* ============================================================
   Field — labelled control wrapper
   ============================================================ */

export type FieldProps = {
  label?: ReactNode;
  hint?: ReactNode;
  /** Render the field at full row width inside a `.pe-field-row`. */
  children: ReactNode;
};

export function Field({ label, hint, children }: FieldProps) {
  return (
    <div className="pe-field">
      {label && (
        <span className="pe-field-label">
          {label}
          {hint && <span className="pe-field-hint">{hint}</span>}
        </span>
      )}
      {children}
    </div>
  );
}

/** Two-up responsive grid of fields. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="pe-field-row">{children}</div>;
}

/* ============================================================
   Toggle + RowToggle
   ============================================================ */

export function Toggle({
  on,
  onChange,
  label,
}: {
  on: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      className={`pe-toggle${on ? " is-on" : ""}`}
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
    />
  );
}

export function RowToggle({
  name,
  sub,
  on,
  onChange,
}: {
  name: ReactNode;
  sub?: ReactNode;
  on: boolean;
  onChange: (next: boolean) => void;
}) {
  const labelText = typeof name === "string" ? name : "Toggle";
  return (
    <div className="pe-row-toggle">
      <div>
        <div className="rt-name">{name}</div>
        {sub && <div className="rt-sub">{sub}</div>}
      </div>
      <Toggle on={on} onChange={onChange} label={labelText} />
    </div>
  );
}

/* ============================================================
   Tier badge — inline plan marker (no-blur-premium pattern)
   ============================================================ */

export type Tier = "creator" | "pro" | "business";

const TIER_LABEL: Record<Tier, string> = {
  creator: "⭐ Creator",
  pro: "✨ Pro",
  business: "Business",
};

export function TierBadge({ tier }: { tier: Tier }) {
  return <span className={`pe-tier-badge tier-${tier}`}>{TIER_LABEL[tier]}</span>;
}

/** Inline upgrade hint shown beneath premium fields. */
export function TierHint({ pro = false, children }: { pro?: boolean; children: ReactNode }) {
  return (
    <div className={`pe-tier-hint${pro ? " is-pro" : ""}`}>
      <span className="th-icon" aria-hidden>{pro ? "✨" : "💡"}</span>
      {children}
    </div>
  );
}

/* Re-export the chrome icon so editors share one icon style. */
export { S as EditorIcon };

/* ============================================================
   useEscapeKey — close open modals on Escape
   ============================================================ */

export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onEscape(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
}
