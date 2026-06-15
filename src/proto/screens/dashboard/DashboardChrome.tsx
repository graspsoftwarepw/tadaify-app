/**
 * Shared dashboard chrome — the top appbar + left sidebar that wrap every
 * authenticated creator screen (the dashboard "My page" view and all the
 * `/app/pages/*` editors). Ported from mockups/tadaify-mvp/app-dashboard.html
 * and reused here so the page-editor shell does not duplicate the navigation.
 *
 * Presentational only. It renders the global app dashboard CSS classes
 * (`.app-dashboard-root .appbar`, `.side`, `.layout`) which live in
 * app/styles/app-dashboard.css (loaded by root.tsx, scoped under
 * `.app-dashboard-root`). Callers pass the screen body as `children`, plus the
 * active top-level nav tab and an optional list of `pageSubItems` so the active
 * page editor highlights itself in the Pages group.
 *
 * @implements fr-globalui-view-layout
 */
import type { ReactNode } from "react";
import { toggleTheme } from "../../lib/theme";
import { SOCIAL_CLASS, SOCIAL_TIP, SocialGlyph } from "./icons";
import type { DashboardProfile } from "./dashboardFixture";

/** Stroke-style icon wrapper matching the mockup's inline SVGs. */
function S({ children, w = 24 }: { children: ReactNode; w?: number }) {
  return (
    <svg
      width={w}
      height={w}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {children}
    </svg>
  );
}

function Orb() {
  return (
    <span className="logo-mark" style={{ width: 28, height: 28 }} aria-hidden>
      <svg viewBox="0 0 32 32" width={28} height={28}>
        <defs>
          <radialGradient id="proto-orb-chrome" cx="35%" cy="30%">
            <stop offset="0%" stopColor="var(--brand-secondary)" />
            <stop offset="55%" stopColor="var(--brand-primary)" />
            <stop offset="100%" stopColor="var(--brand-primary-hover)" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#proto-orb-chrome)" />
        <circle cx="23" cy="9" r="4" fill="var(--brand-warm)" />
      </svg>
    </span>
  );
}

/** A page entry rendered under the Pages group in the sidebar. */
export type PageSubItem = {
  /** Stable key + identifies the active page. */
  id: string;
  label: string;
  /** Inline SVG paths for the leading icon. */
  icon: ReactNode;
  /** Optional `/__proto/...` href; omit for the static Home placeholder. */
  href?: string;
};

/** The default Home page row shown first in the Pages group. */
const HOME_SUBITEM: PageSubItem = {
  id: "home",
  label: "Home",
  href: "/__proto/dashboard",
  icon: (
    <>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </>
  ),
};

export type DashboardChromeProps = {
  profile: DashboardProfile;
  /** Drives `.layout[data-tab]` and the active top-level nav item. */
  activeTab?: "page" | "design" | "insights" | "affiliate";
  /**
   * Extra page rows injected under the Pages group (in addition to Home).
   * The entry whose `id` equals `activePage` is marked active.
   */
  pageSubItems?: PageSubItem[];
  /** Which page row is the current one (defaults to "home"). */
  activePage?: string;
  children: ReactNode;
};

/**
 * Renders the appbar + sidebar + `.layout` grid, placing `children` in the
 * `main.content` slot. The grid's third preview column (used by the dashboard)
 * is omitted here; editors that need a preview render it inside their own body.
 */
export function DashboardChrome({
  profile,
  activeTab = "page",
  pageSubItems = [],
  activePage = "home",
  children,
}: DashboardChromeProps) {
  const pages = [HOME_SUBITEM, ...pageSubItems];

  return (
    <div className="app-dashboard-root" data-state="ready">
      {/* ============ APP BAR ============ */}
      <header className="appbar">
        <a className="brand" href="/__proto">
          <Orb />
          <span className="wm">
            <span className="ta">ta</span>
            <span className="da">da!</span>
            <span className="ify">ify</span>
          </span>
        </a>
        <span className="env">Creator dashboard</span>
        <span className="spacer" />
        <a className="handle-pill" href="/__proto/creator-public">
          <span className="live-dot" />
          <span className="hide-sm">tadaify.com/</span>
          <b>{profile.handle}</b>
          <S w={12}>
            <path d="M7 17l10-10M17 7H9M17 7v8" />
          </S>
        </a>
        <button className="iconbtn" aria-label="Notifications" type="button">
          <S>
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
            <path d="M10 21a2 2 0 0 0 4 0" />
          </S>
        </button>
        <button
          className="iconbtn theme-toggle"
          aria-label="Toggle theme"
          type="button"
          onClick={() => toggleTheme()}
        >
          <svg className="theme-icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="4" />
            <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
          </svg>
          <svg className="theme-icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
          </svg>
        </button>
      </header>

      {/* ============ LAYOUT ============ */}
      <div className="layout" data-tab={activeTab}>
        {/* -------- SIDEBAR -------- */}
        <aside className="side" aria-label="Primary navigation">
          <div className="side-user">
            <div className="av">{profile.initials}</div>
            <div className="utxt">
              <div className="uname">{profile.displayName}</div>
              <div className="uhandle">@{profile.handle} · Free</div>
            </div>
            <S w={12}>
              <polyline points="8 9 12 5 16 9" />
              <polyline points="8 15 12 19 16 15" />
            </S>
          </div>

          {/* Pages */}
          <div className="nav-group">
            <button
              className="nav-item nav-pages-parent active"
              aria-expanded="true"
              aria-label="Pages"
              type="button"
            >
              <S><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></S>
              <span className="label">Pages</span>
              <span className="nav-count">{pages.length}</span>
              <S><polyline points="9 18 15 12 9 6" /></S>
            </button>
            <div className="nav-sub-list" data-expanded="true" role="group" aria-label="Pages list">
              {pages.map((p) => {
                const isActive = p.id === activePage;
                const cls = `nav-sub-item${isActive ? " active is-current" : ""}`;
                return p.href ? (
                  <a className={cls} href={p.href} key={p.id}>
                    <S>{p.icon}</S>
                    <span>{p.label}</span>
                  </a>
                ) : (
                  <button className={cls} type="button" key={p.id}>
                    <S>{p.icon}</S>
                    <span>{p.label}</span>
                  </button>
                );
              })}
              <button className="nav-sub-item nav-sub-add" type="button">
                <S><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                <span>Add page</span>
              </button>
            </div>
          </div>

          <div className="nav-divider" />

          {/* Configuration */}
          <div className="nav-group" style={{ paddingTop: 0 }}>
            <button className="nav-item nav-design-parent" aria-expanded="false" type="button">
              <S><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" /></S>
              <span className="label">Configuration</span>
              <S><polyline points="9 18 15 12 9 6" /></S>
            </button>
            <div className="nav-sub-list" data-expanded="false" role="group" aria-label="Design sub-sections">
              {[
                ["Theme", <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M9 9v12" /></>],
                ["Profile", <><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0 1 16 0" /></>],
                ["Background", <><rect x="3" y="3" width="18" height="18" rx="2" /><path d="M3 9h18M3 15h18M9 3v18M15 3v18" /></>],
                ["Text", <><polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" /></>],
                ["Buttons", <><rect x="2" y="6" width="20" height="5" rx="2.5" /><rect x="2" y="14" width="20" height="5" rx="2.5" /></>],
                ["Colors", <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" /></>],
                ["Footer", <><line x1="12" y1="2" x2="12" y2="22" /><line x1="2" y1="12" x2="22" y2="12" /></>],
                ["Domain", <><circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" /><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" /></>],
              ].map(([label, paths]) => (
                <button className="nav-sub-item" type="button" key={label as string}>
                  <S>{paths as ReactNode}</S>
                  <span>{label as string}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="nav-divider" />

          {/* Insights + Affiliate */}
          <div className="nav-group" style={{ paddingTop: 0 }}>
            <a href="/__proto/insights" className="nav-item">
              <S><path d="M3 3v18h18" /><path d="M7 14l4-4 4 4 5-7" /></S>
              <span className="label">Insights</span>
            </a>
            <a href="/__proto/affiliate" className="nav-item">
              <S><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></S>
              <span className="label">Affiliate</span>
            </a>
          </div>

          <div className="nav-divider" />

          {/* Administration */}
          <div className="nav-group" style={{ paddingTop: 0 }}>
            <button className="nav-item nav-design-parent" aria-expanded="true" type="button">
              <S><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></S>
              <span className="label">Administration</span>
              <S><polyline points="9 18 15 12 9 6" /></S>
            </button>
            <div className="nav-sub-list" data-expanded="true" role="group" aria-label="Administration sub-sections">
              <a href="/__proto/admin-blog" className="nav-sub-item">
                <S><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="9" y1="13" x2="15" y2="13" /><line x1="9" y1="17" x2="13" y2="17" /></S>
                <span>Blog</span>
              </a>
              <a href="/__proto/admin-store" className="nav-sub-item">
                <S><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" /></S>
                <span>Store</span>
                <span className="nav-pill nav-pill-soon" style={{ marginLeft: "auto" }}>v2</span>
              </a>
              <a href="/__proto/admin-schedule" className="nav-sub-item">
                <S><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></S>
                <span>Schedule</span>
              </a>
              <a href="/__proto/admin-portfolio" className="nav-sub-item">
                <S><circle cx="12" cy="12" r="10" /><circle cx="12" cy="12" r="4" /><line x1="4.93" y1="4.93" x2="9.17" y2="9.17" /><line x1="14.83" y1="14.83" x2="19.07" y2="19.07" /></S>
                <span>Portfolio</span>
              </a>
              <a href="/__proto/admin-paid-articles" className="nav-sub-item">
                <S><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></S>
                <span>Paid articles</span>
              </a>
            </div>
          </div>

          <div className="nav-divider" />

          {/* Settings / Help / Feedback */}
          <div className="nav-group" style={{ paddingTop: 0 }}>
            <a href="/__proto/settings" className="nav-item">
              <S><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></S>
              <span className="label">Settings</span>
            </a>
            <button className="nav-item" type="button">
              <S><circle cx="12" cy="12" r="9" /><path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3M12 17h.01" /></S>
              <span className="label">Help &amp; docs</span>
            </button>
            <a href="/__proto/feedback" className="nav-item">
              <S><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></S>
              <span className="label">Feedback</span>
            </a>
          </div>
        </aside>

        {/* -------- MAIN CONTENT -------- */}
        <main className="content">{children}</main>
      </div>
    </div>
  );
}

/** Re-export the icon wrapper so screens can match the chrome's icon style. */
export { S as ChromeIcon };
export { SOCIAL_CLASS, SOCIAL_TIP, SocialGlyph };
