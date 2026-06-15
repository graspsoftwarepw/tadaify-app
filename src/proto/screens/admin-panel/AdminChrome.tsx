/**
 * Platform-admin shell — the appbar + admin sidebar + main slot that wraps the
 * single admin SPA. Faithful port of the chrome in
 * mockups/tadaify-mvp/admin-panel.html (the `.appbar` / `.adm-side` /
 * `.adm-main` structure, the impersonation + read-only banners). This is the
 * platform-admin layer's own chrome (distinct from the creator DashboardChrome)
 * per the audiences matrix: only the Platform admin persona reaches it.
 *
 * Presentational only; renders the ported `.proto-admin-panel` CSS classes.
 * Section switching, role + impersonation state, and modals live in
 * AdminPanelScreen.
 *
 * @implements fr-admin-panel
 * @implements fr-globalui-view-layout
 */
import type { ReactNode } from "react";
import { toggleTheme } from "../../lib/theme";
import type { AdminSection } from "./adminPanelTypes";
import type { AdminNavItem, AdminProfile } from "./adminPanelFixture";

function S({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

/** Inline SVG path sets for each admin nav item, keyed by section id. */
const NAV_ICON: Record<AdminSection, ReactNode> = {
  overview: <><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></>,
  users: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></>,
  registration: <><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" /><line x1="23" y1="11" x2="17" y2="11" /></>,
  maintenance: <><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" /></>,
  moderation: <><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></>,
  legal: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="15" y2="17" /></>,
  health: <><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" /></>,
  audit: <><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></>,
};

export type AdminChromeProps = {
  profile: AdminProfile;
  nav: AdminNavItem[];
  activeSection: AdminSection;
  onNavigate: (section: AdminSection) => void;
  impersonating: string | null;
  onExitImpersonation: () => void;
  children: ReactNode;
};

export function AdminChrome({
  profile,
  nav,
  activeSection,
  onNavigate,
  impersonating,
  onExitImpersonation,
  children,
}: AdminChromeProps) {
  return (
    <div className="proto-admin-panel" data-role="super">
      {impersonating && (
        <div className="impersonation-banner" id="imp-banner">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="10" /><path d="M12 8v4M12 16h.01" /></svg>
          <span>
            Impersonating <b id="imp-user">@{impersonating}</b> — every action is logged.{" "}
            <button type="button" className="imp-exit" onClick={onExitImpersonation}>Exit impersonation</button>
          </span>
        </div>
      )}

      <header className="appbar" role="banner">
        <div className="brand">
          <a href="/__proto" style={{ display: "flex", alignItems: "center", gap: 9 }}>
            <span className="wm" style={{ fontSize: 20 }}>
              <span className="ta">ta</span><span className="da">da!</span><span className="ify">ify</span>
            </span>
          </a>
          <span className="brand-tag">Admin</span>
        </div>

        <div className="global-search" role="search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="search" placeholder="Search users, handles, emails, page IDs…" aria-label="Global admin search" />
          <kbd>⌘K</kbd>
        </div>

        <div className="spacer" />

        <span className="role-chip role-super" title="Your admin role">
          <span className="rc-dot" />
          <span>Super-admin</span>
        </span>
        <span className="admin-email">{profile.email}</span>

        <button className="iconbtn" type="button" onClick={() => toggleTheme()} aria-label="Toggle dark mode" title="Toggle dark mode">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><circle cx="12" cy="12" r="5" /><line x1="12" y1="1" x2="12" y2="3" /><line x1="12" y1="21" x2="12" y2="23" /><line x1="4.22" y1="4.22" x2="5.64" y2="5.64" /><line x1="18.36" y1="18.36" x2="19.78" y2="19.78" /><line x1="1" y1="12" x2="3" y2="12" /><line x1="21" y1="12" x2="23" y2="12" /><line x1="4.22" y1="19.78" x2="5.64" y2="18.36" /><line x1="18.36" y1="5.64" x2="19.78" y2="4.22" /></svg>
        </button>
      </header>

      <div className="layout">
        <aside className="adm-side" aria-label="Admin navigation">
          <div className="adm-user">
            <div className="av">{profile.initial}</div>
            <div className="utxt">
              <div className="uname">{profile.email}</div>
              <div className="urole">
                <span className="role-chip role-super" style={{ fontSize: 9.5, padding: "2px 7px" }}>
                  <span className="rc-dot" />
                  <span>Super-admin</span>
                </span>
              </div>
            </div>
          </div>

          <div className="adm-nav-section-label">Operations</div>
          {nav.map((item) => (
            <button
              key={item.id}
              type="button"
              className={`adm-nav-item${item.badge ? " has-badge" : ""}${activeSection === item.id ? " active" : ""}`}
              aria-current={activeSection === item.id ? "page" : undefined}
              onClick={() => onNavigate(item.id)}
            >
              <S>{NAV_ICON[item.id]}</S>
              <span className="label">{item.label}</span>
              {item.count != null && <span className={`nav-count${item.countTone ? " " + item.countTone : ""}`}>{item.count}</span>}
              {item.pill && <span className="status-pill-mini">{item.pill}</span>}
            </button>
          ))}

          <div className="adm-nav-divider" />

          <button type="button" className="adm-nav-item danger" onClick={() => window.alert("Sign out (prototype)")}>
            <S><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><polyline points="16 17 21 12 16 7" /><line x1="21" y1="12" x2="9" y2="12" /></S>
            <span className="label">Sign out</span>
          </button>
        </aside>

        <main className="adm-main">
          {children}
        </main>
      </div>
    </div>
  );
}
