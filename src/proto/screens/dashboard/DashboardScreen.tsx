/**
 * Creator dashboard — "My page" view. Faithful port of
 * mockups/tadaify-mvp/app-dashboard.html, reusing the app's own dashboard
 * styling (app/styles/app-dashboard.css, loaded globally by root.tsx and scoped
 * under `.app-dashboard-root`). Presentational only; data from typed fixtures.
 *
 * @implements FR-GLOBALUI-VIEW-LAYOUT
 */
import type { ReactNode } from "react";
import { toggleTheme } from "../../lib/theme";
import {
  dashboardBlocksFixture,
  dashboardProfileFixture,
} from "./dashboardFixture";
import { SOCIAL_CLASS, SOCIAL_TIP, SocialGlyph } from "./icons";

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
          <radialGradient id="proto-orb" cx="35%" cy="30%">
            <stop offset="0%" stopColor="#818CF8" />
            <stop offset="55%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#3730A3" />
          </radialGradient>
        </defs>
        <circle cx="16" cy="16" r="14" fill="url(#proto-orb)" />
        <circle cx="23" cy="9" r="4" fill="#F59E0B" />
      </svg>
    </span>
  );
}

export function DashboardScreen() {
  const profile = dashboardProfileFixture();
  const blocks = dashboardBlocksFixture();

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
      <div className="layout" data-tab="page">
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
            <button className="nav-item nav-pages-parent active" aria-expanded="true" aria-label="Pages" type="button">
              <S><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></S>
              <span className="label">Pages</span>
              <span className="nav-count">1</span>
              <S><polyline points="9 18 15 12 9 6" /></S>
            </button>
            <div className="nav-sub-list" data-expanded="true" role="group" aria-label="Pages list">
              <button className="nav-sub-item active" type="button">
                <S><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></S>
                <span>Home</span>
              </button>
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
        <main className="content">
          <section className="main-page" aria-labelledby="page-title">
            <div className="page-head">
              <div>
                <h1 id="page-title">My page</h1>
                <div className="sub">
                  <span>{profile.blockCount} blocks</span>
                  <span className="dot" />
                  <span className="only-ready">Live · updated 2 min ago</span>
                </div>
              </div>
              <div className="actions">
                <button className="btn btn-ghost btn-sm" type="button">
                  <S w={14}><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></S>
                  Copy link
                </button>
                <button className="btn btn-primary btn-sm" type="button">
                  <S w={14}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                  Add block
                </button>
              </div>
            </div>

            {/* Welcome banner */}
            <div className="welcome-banner only-ready">
              <span className="wb-ic">🎉</span>
              <div className="wb-body">
                <b>Your page is live.</b> Share{" "}
                <a href="/__proto/creator-public" style={{ color: "var(--brand-primary)", fontWeight: 500 }}>
                  tadaify.com/{profile.handle}
                </a>{" "}
                on your socials — you had {profile.visitsThisWeek} visits this week.
              </div>
              <button className="wb-close" aria-label="Dismiss" type="button">✕</button>
            </div>

            {/* Pinned message */}
            <div
              id="pinned-msg-row"
              style={{ marginTop: 16, marginBottom: 4, padding: "10px 14px", background: "rgba(99,102,241,0.06)", border: "1px solid rgba(99,102,241,0.15)", borderRadius: 10, display: "flex", alignItems: "center", gap: 10 }}
            >
              <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", flexShrink: 0 }}>
                <span className="toggle" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>Pinned message</span>
              </label>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
                <input
                  type="text"
                  maxLength={80}
                  placeholder="e.g. New course Friday — set a reminder? 📣"
                  style={{ flex: 1, fontFamily: "var(--font-sans)", fontSize: 13, padding: "6px 10px", border: "1px solid var(--border-strong)", borderRadius: 7, background: "var(--bg-elevated)", color: "var(--fg)", minWidth: 0 }}
                />
                <span style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}>80</span>
              </div>
              <span style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}>Dismissible by visitor</span>
            </div>

            {/* Profile card */}
            <div className="profile-card">
              <div className="pc-av-wrap">
                <div className="pc-av">{profile.initials}</div>
                <div className="pc-av-cam">
                  <S w={12}><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" /><circle cx="12" cy="13" r="4" /></S>
                </div>
              </div>
              <div className="pc-body">
                <div className="pc-head">
                  <div className="pc-name">{profile.displayName}</div>
                  {profile.verified && <span className="chip verified">✓ verified</span>}
                </div>
                <div className="pc-bio">{profile.bio}</div>
                <div className="pc-handle">tadaify.com/{profile.handle}</div>
                <div className="pc-socials">
                  {profile.socials.map((kind) => (
                    <button key={kind} className={`pc-social ${SOCIAL_CLASS[kind]}`} aria-label={`${SOCIAL_TIP[kind]} @${profile.handle}`} type="button">
                      <SocialGlyph kind={kind} />
                    </button>
                  ))}
                  <button className="pc-social-add" aria-label="Add another social" type="button">+</button>
                </div>
              </div>
              <button className="pc-edit" type="button">
                <S><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></S>
                <span>Edit</span>
              </button>
            </div>

            {/* Quick chips */}
            <div className="quick-chips only-ready">
              <button className="qchip" type="button">
                <S><line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" /><line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" /></S>
                Organise…
                <S w={12}><polyline points="6 9 12 15 18 9" /></S>
              </button>
              <button className="qchip" type="button">
                <S><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" /></S>
                Share page
              </button>
            </div>

            {/* Blocks */}
            <div className="only-ready">
              <div className="section-label">Blocks</div>
              <section className="blocks" aria-label="Page blocks">
                {blocks.map((b) => (
                  <div className="block" key={b.id} data-block={b.id}>
                    <span className="grip" title="Drag to reorder">⋮⋮</span>
                    <span className={`ic ${SOCIAL_CLASS[b.kind]}`}>
                      <SocialGlyph kind={b.kind} />
                    </span>
                    <div className="meta">
                      <div className="t">{b.title}</div>
                      <div className="u">{b.url}</div>
                    </div>
                    <div className="stat"><b>{b.clicks}</b>clicks · 7d</div>
                    <div className="tools">
                      <span className={`toggle ${b.live ? "on" : ""}`} />
                      <button className="iconbtn" aria-label="Edit block" type="button">
                        <S><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" /></S>
                      </button>
                      <button className="iconbtn" aria-label="More" type="button">
                        <svg viewBox="0 0 24 24" fill="currentColor" width={24} height={24} aria-hidden><circle cx="12" cy="5" r="1.5" /><circle cx="12" cy="12" r="1.5" /><circle cx="12" cy="19" r="1.5" /></svg>
                      </button>
                    </div>
                  </div>
                ))}
                <button className="add-block" type="button">
                  <S w={18}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                  Add a block
                </button>
              </section>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
