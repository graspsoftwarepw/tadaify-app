/**
 * @module APP-DASHBOARD
 * @covers BR-DASH-002
 * AppSidebar — left sidebar navigation for the /app dashboard.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2417-2577.
 *
 * Markup mirrors the mockup <aside class="side"> verbatim; styling is provided
 * by the scoped rules in app/styles/app-dashboard.css (`.side`, `.side-user`,
 * `.nav-group`, `.nav-item`, `.nav-sub-list`, `.nav-sub-item`, `.nav-divider`,
 * `.nav-design-parent`, `.nav-pages-parent`, etc.).
 *
 * Contains:
 *   - .side-user card (avatar initial, display name, handle · tier)
 *   - Pages accordion (Home active sub-item + "+ Add page" disabled per
 *     DEC-MULTIPAGE-01=B; tooltip "Multi-page coming Q+1")
 *   - Configuration accordion (slot — AppSidebarDesignAccordion)
 *   - Insights + Affiliate nav items
 *   - Administration accordion (Blog, Store v2, Schedule, Portfolio,
 *     Paid articles)
 *   - Settings + Help & docs + Feedback bottom nav items
 *   - 4 dividers per mockup
 *
 * Hidden on mobile (≤900px) via `.side { display:none }` in the dashboard CSS.
 *
 * Story: F-APP-DASHBOARD-001a (#171), Pass 4 of dashboard-mockup-fidelity.
 * DEC trail: DEC-MULTIPAGE-01=B (+Add page disabled, tooltip "Multi-page coming Q+1")
 * Covers: AC#3, Visual checklist sidebar items
 */

import { useState } from "react";

interface AppSidebarProps {
  handle: string;
  displayName: string | null;
  tier?: string;
  activeTab: string;
  onTabChange: (tab: string) => void;
  /** Design accordion slot — rendered between Pages and Insights groups. */
  designAccordion?: React.ReactNode;
  /** Active admin sub-tab (blog | store | schedule | portfolio | paid-articles) */
  activeSubTab?: string;
}

export function AppSidebar({
  handle,
  displayName,
  tier = "free",
  activeTab,
  onTabChange,
  designAccordion,
  activeSubTab = "",
}: AppSidebarProps) {
  // Pages accordion is open by default in the mockup (data-expanded="true").
  const [pagesExpanded, setPagesExpanded] = useState(true);
  // Administration accordion is open by default in the mockup.
  const [adminExpanded, setAdminExpanded] = useState(true);

  // Avatar initial from display name or handle.
  const avatarInitial = (displayName || handle || "?").charAt(0).toUpperCase();

  // Tier label — capitalised. "free" → "Free", "creator" → "Creator", etc.
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  // `is-active` on the Home sub-item when on the page tab.
  const isHomeActive = activeTab === "page";

  return (
    <aside
      data-testid="app-sidebar"
      className="side"
      aria-label="Primary navigation"
    >
      {/* Profile card */}
      <div
        className="side-user"
        role="button"
        tabIndex={0}
        aria-label="User profile menu"
      >
        <div className="av" aria-hidden="true">
          {avatarInitial}
        </div>
        <div className="utxt">
          <div className="uname">{displayName || `@${handle}`}</div>
          <div className="uhandle">
            @{handle} · {tierLabel}
          </div>
        </div>
        <svg
          className="chevron"
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <polyline points="8 9 12 5 16 9" />
          <polyline points="8 15 12 19 16 15" />
        </svg>
      </div>

      {/* GROUP 1: Pages (accordion parent + Home + Add page disabled) */}
      <div className="nav-group">
        <button
          type="button"
          data-testid="nav-pages-parent"
          className={`nav-item nav-pages-parent${isHomeActive ? " active" : ""}`}
          data-nav="pages"
          data-tip="Pages"
          aria-expanded={pagesExpanded}
          aria-controls="nav-pages-sub"
          aria-label="Pages"
          onClick={() => setPagesExpanded((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          <span className="label">Pages</span>
          <span className="nav-count" id="nav-pages-count">
            1
          </span>
          <svg
            className="nav-caret"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div
          className="nav-sub-list"
          id="nav-pages-sub"
          data-expanded={pagesExpanded ? "true" : "false"}
          role="group"
          aria-label="Pages list"
        >
          <button
            type="button"
            data-testid="nav-home-item"
            className={`nav-sub-item${isHomeActive ? " active" : ""}`}
            data-nav-sub="home"
            data-nav="page"
            data-tip="Home — your main page"
            aria-current={isHomeActive ? "page" : undefined}
            onClick={() => onTabChange("page")}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>Home</span>
          </button>
          {/* "+ Add page" — disabled per DEC-MULTIPAGE-01=B. Tooltip via data-tip
              in the mockup; we keep title= for native browser hover + aria. */}
          <button
            type="button"
            className="nav-sub-item nav-sub-add"
            data-tip="Multi-page coming Q+1"
            title="Multi-page coming Q+1"
            aria-disabled="true"
            disabled
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>Add page</span>
          </button>
        </div>
      </div>

      {/* DIVIDER 1 */}
      <div className="nav-divider" aria-hidden="true" />

      {/* GROUP 2: Configuration (Design accordion slot) */}
      {designAccordion}

      {/* DIVIDER 2 */}
      <div className="nav-divider" aria-hidden="true" />

      {/* GROUP 3: Insights + Affiliate + Domain */}
      <div className="nav-group" style={{ paddingTop: 0 }}>
        <button
          type="button"
          className={`nav-item${activeTab === "insights" ? " active" : ""}`}
          data-nav="insights"
          data-tip="Insights"
          onClick={() => onTabChange("insights")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M3 3v18h18" />
            <path d="M7 14l4-4 4 4 5-7" />
          </svg>
          <span className="label">Insights</span>
        </button>
        <button
          type="button"
          className={`nav-item${activeTab === "affiliate" ? " active" : ""}`}
          data-nav="affiliate"
          data-tip="Affiliate program — earn 30% recurring"
          onClick={() => onTabChange("affiliate")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <line x1="12" y1="1" x2="12" y2="23" />
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
          </svg>
          <span className="label">Affiliate</span>
        </button>
        {/* Domain — 6th sidebar item per DEC-CUSTOM-DOMAIN-NAV-01=A */}
        <button
          type="button"
          className={`nav-item${activeTab === "domain" ? " active" : ""}`}
          data-nav="domain"
          data-tip="Custom domain"
          onClick={() => onTabChange("domain")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
          <span className="label">Domain</span>
          <span
            className="nav-pill nav-pill-soon"
            style={{ marginLeft: "auto" }}
          >
            soon
          </span>
        </button>
      </div>

      {/* DIVIDER 3 */}
      <div className="nav-divider" aria-hidden="true" />

      {/* GROUP 3b: Administration accordion (TADA-BUG-005). */}
      <div className="nav-group" style={{ paddingTop: 0 }}>
        <button
          type="button"
          className="nav-item nav-design-parent"
          data-nav="admin"
          data-tip="Administration"
          aria-expanded={adminExpanded}
          aria-controls="nav-admin-sub"
          onClick={() => setAdminExpanded((v) => !v)}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          <span className="label">Administration</span>
          <svg
            className="nav-caret"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>
        <div
          className="nav-sub-list"
          id="nav-admin-sub"
          data-expanded={adminExpanded ? "true" : "false"}
          role="group"
          aria-label="Administration sub-sections"
        >
          {/* Blog — navigates to /app?tab=admin&subtab=blog */}
          <a
            href="/app?tab=admin&subtab=blog"
            className={`nav-sub-item${activeTab === "admin" && activeSubTab === "blog" ? " active" : ""}`}
            data-nav-sub="admin-blog"
            data-tip="Blog publishing"
            aria-current={activeTab === "admin" && activeSubTab === "blog" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="9" y1="13" x2="15" y2="13" />
              <line x1="9" y1="17" x2="13" y2="17" />
            </svg>
            <span>Blog</span>
          </a>
          {/* Store — navigates to /app?tab=admin&subtab=store */}
          <a
            href="/app?tab=admin&subtab=store"
            className={`nav-sub-item${activeTab === "admin" && activeSubTab === "store" ? " active" : ""}`}
            data-nav-sub="admin-store"
            data-tip="Store — coming v2"
            aria-current={activeTab === "admin" && activeSubTab === "store" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <span>Store</span>
            <span
              className="nav-pill nav-pill-soon"
              style={{ marginLeft: "auto" }}
            >
              v2
            </span>
          </a>
          {/* Schedule — navigates to /app?tab=admin&subtab=schedule */}
          <a
            href="/app?tab=admin&subtab=schedule"
            className={`nav-sub-item${activeTab === "admin" && activeSubTab === "schedule" ? " active" : ""}`}
            data-nav-sub="admin-schedule"
            data-tip="Bookings"
            aria-current={activeTab === "admin" && activeSubTab === "schedule" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span>Schedule</span>
          </a>
          {/* Portfolio — navigates to /app?tab=admin&subtab=portfolio */}
          <a
            href="/app?tab=admin&subtab=portfolio"
            className={`nav-sub-item${activeTab === "admin" && activeSubTab === "portfolio" ? " active" : ""}`}
            data-nav-sub="admin-portfolio"
            data-tip="Projects"
            aria-current={activeTab === "admin" && activeSubTab === "portfolio" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="12" cy="12" r="10" />
              <circle cx="12" cy="12" r="4" />
              <line x1="4.93" y1="4.93" x2="9.17" y2="9.17" />
              <line x1="14.83" y1="14.83" x2="19.07" y2="19.07" />
            </svg>
            <span>Portfolio</span>
          </a>
          {/* Paid articles — navigates to /app?tab=admin&subtab=paid-articles */}
          <a
            href="/app?tab=admin&subtab=paid-articles"
            className={`nav-sub-item${activeTab === "admin" && activeSubTab === "paid-articles" ? " active" : ""}`}
            data-nav-sub="admin-paid-articles"
            data-tip="Paid articles"
            aria-current={activeTab === "admin" && activeSubTab === "paid-articles" ? "page" : undefined}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            <span>Paid articles</span>
          </a>
        </div>
      </div>

      {/* DIVIDER 4 */}
      <div className="nav-divider" aria-hidden="true" />

      {/* GROUP 4: Settings + Help & docs + Feedback (no section header). */}
      <div className="nav-group" style={{ paddingTop: 0 }}>
        <button
          type="button"
          className={`nav-item${activeTab === "settings" ? " active" : ""}`}
          data-nav="settings"
          data-tip="Settings"
          onClick={() => onTabChange("settings")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3h0a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8v0a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
          </svg>
          <span className="label">Settings</span>
        </button>
        <button type="button" className="nav-item" data-tip="Help & docs">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M9.1 9a3 3 0 1 1 5.8 1c0 2-3 3-3 3M12 17h.01" />
          </svg>
          <span className="label">Help &amp; docs</span>
        </button>
        <button
          type="button"
          className={`nav-item${activeTab === "feedback" ? " active" : ""}`}
          data-nav="feedback"
          data-tip="Send feedback to tadaify"
          onClick={() => onTabChange("feedback")}
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="label">Feedback</span>
        </button>
      </div>
    </aside>
  );
}
