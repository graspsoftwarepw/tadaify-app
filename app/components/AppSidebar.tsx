/**
 * AppSidebar — left sidebar navigation for the /app dashboard.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2417-2575.
 *
 * Contains:
 *   - Profile card (avatar initial, display name, handle + tier)
 *   - Pages group: Home active item + "+ Add page" disabled (DEC-MULTIPAGE-01=B)
 *   - Configuration accordion (Design sub-items + Domain sub-item)
 *   - Insights + Affiliate nav items
 *   - Administration accordion (Blog, Store v2, Schedule, Portfolio, Paid articles)
 *   - Settings + Help + Feedback nav items
 *   - 3 dividers per mockup
 *
 * Hidden on mobile (≤1024px) per responsive contract.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
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
}

export function AppSidebar({
  handle,
  displayName,
  tier = "free",
  activeTab,
  onTabChange,
}: AppSidebarProps) {
  const [designExpanded, setDesignExpanded] = useState(false);
  const [adminExpanded, setAdminExpanded] = useState(false);

  // Avatar initial from display name or handle
  const avatarInitial = (displayName || handle || "?").charAt(0).toUpperCase();

  // Tier label
  const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);

  return (
    <aside
      data-testid="app-sidebar"
      aria-label="Primary navigation"
      style={{
        width: 220,
        flexShrink: 0,
        borderRight: "1px solid var(--border)",
        background: "var(--bg-elevated)",
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        // Hidden on mobile (≤1024px) via CSS class
      }}
      className="app-sidebar"
    >
      {/* Profile card */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "14px 14px 12px",
          cursor: "pointer",
        }}
        role="button"
        tabIndex={0}
        aria-label="User profile menu"
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            background: "var(--brand-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 14,
            fontWeight: 600,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {avatarInitial}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div
            style={{
              fontSize: 13.5,
              fontWeight: 600,
              color: "var(--fg)",
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {displayName || `@${handle}`}
          </div>
          <div style={{ fontSize: 11.5, color: "var(--fg-muted)" }}>
            @{handle} · {tierLabel}
          </div>
        </div>
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ flexShrink: 0 }}
        >
          <polyline points="8 9 12 5 16 9" />
          <polyline points="8 15 12 19 16 15" />
        </svg>
      </div>

      {/* GROUP 1: Pages */}
      <div style={{ padding: "0 8px" }}>
        {/* Pages accordion header */}
        <button
          type="button"
          data-testid="nav-pages-parent"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "7px 8px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--fg-muted)",
            fontSize: 12.5,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
          aria-expanded
          aria-controls="nav-pages-sub"
        >
          <svg
            width="14"
            height="14"
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
          <span style={{ flex: 1, textAlign: "left" }}>Pages</span>
          <span
            style={{
              background: "var(--bg-muted)",
              borderRadius: 10,
              padding: "1px 6px",
              fontSize: 11,
              fontWeight: 600,
            }}
          >
            1
          </span>
        </button>

        {/* Pages sub-list */}
        <div id="nav-pages-sub" role="group" aria-label="Pages list" style={{ paddingLeft: 8 }}>
          {/* Homepage nav item — active when tab=page */}
          <button
            type="button"
            data-testid="nav-home-item"
            data-nav-sub="home"
            onClick={() => onTabChange("page")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "7px 10px",
              background: activeTab === "page" ? "var(--bg-muted)" : "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "pointer",
              color: activeTab === "page" ? "var(--fg)" : "var(--fg-muted)",
              fontSize: 13.5,
              fontWeight: activeTab === "page" ? 600 : 400,
            }}
            aria-current={activeTab === "page" ? "page" : undefined}
          >
            <svg
              width="14"
              height="14"
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

          {/* + Add page — disabled (DEC-MULTIPAGE-01=B) */}
          <button
            type="button"
            disabled
            title="Multi-page coming Q+1"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              width: "100%",
              padding: "7px 10px",
              background: "transparent",
              border: "none",
              borderRadius: 8,
              cursor: "not-allowed",
              color: "var(--fg-subtle)",
              fontSize: 13.5,
              opacity: 0.5,
            }}
          >
            <svg
              width="14"
              height="14"
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
      <div
        style={{ height: 1, background: "var(--border)", margin: "4px 0" }}
        aria-hidden="true"
      />

      {/* GROUP 2: Configuration (accordion) */}
      <div style={{ padding: "0 8px" }}>
        <button
          type="button"
          onClick={() => setDesignExpanded((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: activeTab === "design" ? "var(--fg)" : "var(--fg-muted)",
            fontSize: 13.5,
            fontWeight: activeTab === "design" ? 600 : 400,
          }}
          aria-expanded={designExpanded}
          aria-controls="nav-design-sub"
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
            <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
            <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
            <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
            <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" />
          </svg>
          <span style={{ flex: 1, textAlign: "left" }}>Configuration</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: designExpanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {designExpanded && (
          <div id="nav-design-sub" role="group" aria-label="Design sub-sections" style={{ paddingLeft: 8 }}>
            {["Theme", "Profile", "Background", "Text", "Buttons", "Animations", "Colors", "Footer"].map(
              (label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => onTabChange("design")}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    padding: "6px 10px",
                    background: "transparent",
                    border: "none",
                    borderRadius: 8,
                    cursor: "pointer",
                    color: "var(--fg-muted)",
                    fontSize: 13,
                  }}
                >
                  <span>{label}</span>
                </button>
              )
            )}
            {/* Domain sub-item */}
            <button
              type="button"
              onClick={() => onTabChange("design")}
              title="Custom domain — universal $1.99/mo add-on"
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                width: "100%",
                padding: "6px 10px",
                background: "transparent",
                border: "none",
                borderRadius: 8,
                cursor: "pointer",
                color: "var(--fg-muted)",
                fontSize: 13,
              }}
            >
              <span>Domain</span>
            </button>
          </div>
        )}
      </div>

      {/* DIVIDER 2 */}
      <div
        style={{ height: 1, background: "var(--border)", margin: "4px 0" }}
        aria-hidden="true"
      />

      {/* GROUP 3: Insights + Affiliate */}
      <div style={{ padding: "0 8px" }}>
        <button
          type="button"
          onClick={() => onTabChange("insights")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: activeTab === "insights" ? "var(--bg-muted)" : "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: activeTab === "insights" ? "var(--fg)" : "var(--fg-muted)",
            fontSize: 13.5,
          }}
        >
          <svg
            width="14"
            height="14"
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
          <span>Insights</span>
        </button>
        <button
          type="button"
          onClick={() => onTabChange("affiliate")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: activeTab === "affiliate" ? "var(--bg-muted)" : "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: activeTab === "affiliate" ? "var(--fg)" : "var(--fg-muted)",
            fontSize: 13.5,
          }}
        >
          <svg
            width="14"
            height="14"
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
          <span>Affiliate</span>
        </button>
      </div>

      {/* DIVIDER 3 */}
      <div
        style={{ height: 1, background: "var(--border)", margin: "4px 0" }}
        aria-hidden="true"
      />

      {/* GROUP 3b: Administration accordion */}
      <div style={{ padding: "0 8px" }}>
        <button
          type="button"
          onClick={() => setAdminExpanded((v) => !v)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--fg-muted)",
            fontSize: 13.5,
          }}
          aria-expanded={adminExpanded}
          aria-controls="nav-admin-sub"
        >
          <svg
            width="14"
            height="14"
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
          <span style={{ flex: 1, textAlign: "left" }}>Administration</span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
            style={{ transform: adminExpanded ? "rotate(90deg)" : "none", transition: "transform .15s" }}
          >
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {adminExpanded && (
          <div id="nav-admin-sub" role="group" aria-label="Administration sub-sections" style={{ paddingLeft: 8 }}>
            {[
              { label: "Blog", note: null },
              { label: "Store", note: "v2" },
              { label: "Schedule", note: null },
              { label: "Portfolio", note: null },
              { label: "Paid articles", note: null },
            ].map(({ label, note }) => (
              <button
                key={label}
                type="button"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  width: "100%",
                  padding: "6px 10px",
                  background: "transparent",
                  border: "none",
                  borderRadius: 8,
                  cursor: "pointer",
                  color: "var(--fg-muted)",
                  fontSize: 13,
                }}
              >
                <span style={{ flex: 1, textAlign: "left" }}>{label}</span>
                {note && (
                  <span
                    style={{
                      fontSize: 10,
                      background: "var(--bg-muted)",
                      color: "var(--fg-muted)",
                      borderRadius: 8,
                      padding: "1px 5px",
                      fontWeight: 600,
                    }}
                  >
                    {note}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DIVIDER 4 */}
      <div
        style={{ height: 1, background: "var(--border)", margin: "4px 0" }}
        aria-hidden="true"
      />

      {/* GROUP 4: Settings + Help + Feedback */}
      <div style={{ padding: "0 8px 12px" }}>
        <button
          type="button"
          onClick={() => onTabChange("settings")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: activeTab === "settings" ? "var(--bg-muted)" : "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: activeTab === "settings" ? "var(--fg)" : "var(--fg-muted)",
            fontSize: 13.5,
          }}
        >
          <svg
            width="14"
            height="14"
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
          <span>Settings</span>
        </button>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--fg-muted)",
            fontSize: 13.5,
          }}
        >
          <svg
            width="14"
            height="14"
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
          <span>Help &amp; docs</span>
        </button>
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            width: "100%",
            padding: "8px 10px",
            background: "transparent",
            border: "none",
            borderRadius: 8,
            cursor: "pointer",
            color: "var(--fg-muted)",
            fontSize: 13.5,
          }}
        >
          <svg
            width="14"
            height="14"
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
          <span>Feedback</span>
        </button>
      </div>
    </aside>
  );
}
