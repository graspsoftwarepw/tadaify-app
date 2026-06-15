/**
 * SettingsShell — the shared shell the whole creator Settings area is built on.
 * Wraps the active section in the dashboard appbar + sidebar chrome
 * (DashboardChrome), renders the page header, the left `.settings-nav` rail
 * (one item per settings section, with tier pills + dividers, the active one
 * highlighted), the active section as `children`, and an optional fixed
 * save-bar at the bottom.
 *
 * Ported from the common structure of the `mockups/tadaify-mvp/app-settings*.html`
 * pages (page-head, `.settings-nav`, `.settings-section` cards, `.save-bar`).
 * Settings is ONE route — the active section is chosen by local tab state in
 * SettingsScreen (more SPA-accurate than nine routes), so this shell takes
 * `activeTab` + `onTab` and the ordered `tabs` registry and renders the rail.
 *
 * Presentational and local-state only. The save-bar's status/handlers are owned
 * by the composing section (a tab opts in by passing `save`); interactions are
 * mocked by the sections and the primitives below.
 *
 * Exported primitives the tabs compose:
 *   - <SettingsSection>  a `.settings-section` card (title + optional lede/action)
 *   - <FieldRow>         label + body row (stacks on phone)
 *   - <TierChip>         inline uppercase plan marker (CREATOR / PRO / BUSINESS)
 *   - <SettingsModal>    centred modal (Escape + backdrop + Cancel close)
 *   - useEscapeKey       close-on-Escape hook
 *   - SettingsIcon (S)   stroke-icon wrapper matching the chrome
 *
 * @implements fr-settings
 */
import { useEffect, type ReactNode } from "react";
import "./settings-proto.css";
import { DashboardChrome, ChromeIcon as S } from "../dashboard/DashboardChrome";
import type { DashboardProfile } from "../dashboard/dashboardFixture";

/* ============================================================
   Tab registry types
   ============================================================ */

export type SettingsTier = "pro" | "business" | "new";

/** A settings section registered in the nav rail. */
export type SettingsTabDef = {
  /** Stable id used as the local `activeTab` value. */
  id: string;
  label: string;
  /** Inline SVG paths for the leading icon. */
  icon: ReactNode;
  /** Optional pill on the right of the row (Pro / Business / New). */
  pill?: SettingsTier;
  /** Render the row in the danger colour (the Danger zone tab). */
  danger?: boolean;
  /** Draw a divider ABOVE this row. */
  dividerBefore?: boolean;
};

/* ============================================================
   Save bar
   ============================================================ */

export type SaveState = "saved" | "dirty" | "saving";

const SAVE_COPY: Record<SaveState, string> = {
  saved: "All changes saved",
  dirty: "Unsaved changes",
  saving: "Saving…",
};

/** A tab opts into the shared sticky save-bar by passing this. */
export type SaveBar = {
  state: SaveState;
  onSave: () => void;
  onDiscard: () => void;
  /** Override the hint text (e.g. the Theme "Preview only…" copy). */
  hint?: ReactNode;
  /** Override the primary button label (defaults to "Save changes"). */
  saveLabel?: string;
};

/* ============================================================
   Shell
   ============================================================ */

export type SettingsShellProps = {
  profile: DashboardProfile;
  /** Header title (e.g. "Settings", "Theme"). */
  title: ReactNode;
  /** One-line description under the title. */
  description: ReactNode;
  /** Extra header content on the right (e.g. the Theme preview badge). */
  headerActions?: ReactNode;
  /** Ordered nav registry. */
  tabs: SettingsTabDef[];
  /** Active section id. */
  activeTab: string;
  /** Switch sections. */
  onTab: (id: string) => void;
  /** Optional sticky save-bar (a tab opts in). */
  save?: SaveBar;
  /** The active section's content. */
  children: ReactNode;
};

export function SettingsShell({
  profile,
  title,
  description,
  headerActions,
  tabs,
  activeTab,
  onTab,
  save,
  children,
}: SettingsShellProps) {
  return (
    <DashboardChrome profile={profile} activeTab="page">
      <div className="proto-settings">
        {/* Page header */}
        <div className="set-head">
          <div>
            <h1>{title}</h1>
            <div className="sub">{description}</div>
          </div>
          {headerActions && <div className="set-head-actions">{headerActions}</div>}
        </div>

        {/* Rail + content */}
        <div className="set-layout">
          <nav className="settings-nav" aria-label="Settings sections">
            {tabs.map((t) => {
              const isActive = t.id === activeTab;
              return (
                <span key={t.id} style={{ display: "contents" }}>
                  {t.dividerBefore && <div className="settings-nav-divider" />}
                  <button
                    type="button"
                    className={`settings-nav-item${isActive ? " active" : ""}${t.danger ? " is-danger" : ""}`}
                    aria-current={isActive ? "page" : undefined}
                    onClick={() => onTab(t.id)}
                  >
                    <S w={16}>{t.icon}</S>
                    {t.label}
                    {t.pill === "pro" && <span className="sn-pill pro-pill">Pro</span>}
                    {t.pill === "business" && <span className="sn-pill biz-pill">Business</span>}
                    {t.pill === "new" && <span className="sn-pill new-pill">New</span>}
                  </button>
                </span>
              );
            })}
          </nav>

          <div className="set-content">{children}</div>
        </div>
      </div>

      {save && (
        <div className={`set-save-bar${save.state === "saved" ? " is-saved" : ""}`} role="region" aria-label="Save changes">
          <span className="save-hint">
            <span className="save-dot" aria-hidden />
            {save.hint ?? SAVE_COPY[save.state]}
          </span>
          <span className="save-spacer" />
          <div className="save-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={save.onDiscard}>
              Discard
            </button>
            <button className="btn btn-primary btn-sm" type="button" onClick={save.onSave}>
              {save.saveLabel ?? "Save changes"}
            </button>
          </div>
        </div>
      )}
    </DashboardChrome>
  );
}

/* ============================================================
   Section card primitive
   ============================================================ */

export type SettingsSectionProps = {
  title: ReactNode;
  /** Optional descriptive lede under the title. */
  lede?: ReactNode;
  /** Optional content on the right of the title row (a button / action). */
  action?: ReactNode;
  /** Apply the red danger-zone treatment. */
  danger?: boolean;
  children: ReactNode;
};

/** A `.settings-section` card. With an `action`, the head becomes a flex row. */
export function SettingsSection({ title, lede, action, danger = false, children }: SettingsSectionProps) {
  if (action) {
    return (
      <section className={`set-section${danger ? " danger-zone" : ""}`}>
        <div className="section-head-row">
          <div className="sh-text">
            <div className="set-section-title">{title}</div>
            {lede && <p className="set-section-lede">{lede}</p>}
          </div>
          <div className="sh-actions">{action}</div>
        </div>
        {children}
      </section>
    );
  }
  return (
    <section className={`set-section${danger ? " danger-zone" : ""}`}>
      <div className="set-section-title">{title}</div>
      {lede && <p className="set-section-lede">{lede}</p>}
      {children}
    </section>
  );
}

/* ============================================================
   Field row
   ============================================================ */

export type FieldRowProps = {
  label?: ReactNode;
  hint?: ReactNode;
  children: ReactNode;
};

/** A label/body row. The label column stacks above the body on phones. */
export function FieldRow({ label, hint, children }: FieldRowProps) {
  return (
    <div className="field-row">
      {(label || hint) && (
        <div className="field-label">
          {label}
          {hint && <span className="field-hint">{hint}</span>}
        </div>
      )}
      <div className="field-body">{children}</div>
    </div>
  );
}

/* ============================================================
   Tier chip — inline uppercase plan marker
   ============================================================ */

export type ChipTier = "creator" | "pro" | "business";

const CHIP_LABEL: Record<ChipTier, string> = {
  creator: "CREATOR",
  pro: "PRO",
  business: "BUSINESS",
};

export function TierChip({ tier }: { tier: ChipTier }) {
  return <span className={`chip-tier ${tier}`}>{CHIP_LABEL[tier]}</span>;
}

/* ============================================================
   useEscapeKey — close open modals on Escape
   ============================================================ */

export function useEscapeKey(onEscape: () => void) {
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onEscape();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  });
}

/* ============================================================
   Centred modal — backdrop + Escape + Cancel all close
   ============================================================ */

export type SettingsModalProps = {
  title: ReactNode;
  sub?: ReactNode;
  onClose: () => void;
  /** Footer actions (Cancel is rendered for you; pass the confirm button). */
  confirm?: ReactNode;
  /** Wider variant (e.g. the colour picker). */
  wide?: boolean;
  /** Hide the auto-rendered Cancel (rare). */
  hideCancel?: boolean;
  children?: ReactNode;
};

export function SettingsModal({ title, sub, onClose, confirm, wide = false, hideCancel = false, children }: SettingsModalProps) {
  useEscapeKey(onClose);
  return (
    <div
      className="set-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={`set-modal${wide ? " is-wide" : ""}`}>
        <div className="set-modal-head">
          <h3>{title}</h3>
          <button className="iconbtn" type="button" aria-label="Close" onClick={onClose}>
            <S w={18}>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </S>
          </button>
        </div>
        {sub && <p className="modal-sub">{sub}</p>}
        {children}
        {(confirm || !hideCancel) && (
          <div className="modal-actions">
            {!hideCancel && (
              <button className="btn btn-ghost btn-sm" type="button" onClick={onClose}>
                Cancel
              </button>
            )}
            {confirm}
          </div>
        )}
      </div>
    </div>
  );
}

/* Re-export the chrome icon so sections share one icon style. */
export { S as SettingsIcon };
