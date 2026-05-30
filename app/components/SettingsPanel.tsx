/**
 * SettingsPanel — Container for the Settings panel (section.main-settings).
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-account.html (shell + nav)
 *
 * Renders the mockup's exact structure:
 *   section.main-settings
 *     .breadcrumb
 *     .page-head — h1 "Settings" + sub copy
 *     .settings-layout
 *       nav.settings-nav   — 9 nav items matching the cross-mockup nav
 *       .settings-content  — routed by activeSubTab
 *
 * Sub-tab routing:
 *   "account"  → <SettingsAccount handle={handle} email={email} />
 *   all others → <SubpagePlaceholder /> ("Coming in next PR")
 *
 * Story: F-APP-SETTINGS-ACCOUNT-001 (#33)
 */

import { SettingsAccount } from "./app-settings/SettingsAccount";
import { SettingsApiKeys } from "./app-settings/SettingsApiKeys";
import { SettingsBilling } from "./app-settings/SettingsBilling";
import { SettingsDanger } from "./app-settings/SettingsDanger";
import { SettingsGdpr } from "./app-settings/SettingsGdpr";
import { SettingsSecurity } from "./app-settings/SettingsSecurity";
import { SettingsTeam } from "./app-settings/SettingsTeam";
import { SettingsTheme } from "./app-settings/SettingsTheme";

// ─── Valid settings sub-tabs ─────────────────────────────────────────────────

export const SETTINGS_SUB_TABS = [
  "account",
  "billing",
  "security",
  "gdpr",
  "theme",
  "apikeys",
  "team",
  "danger",
] as const;

export type SettingsSubTabId = (typeof SETTINGS_SUB_TABS)[number];

export function normalizeSettingsSubTab(raw: string | null | undefined): SettingsSubTabId {
  if (!raw) return "account";
  const found = SETTINGS_SUB_TABS.find((t) => t === raw);
  if (!found) return "account";
  return found;
}

// ─── Props ───────────────────────────────────────────────────────────────────

interface SettingsPanelProps {
  activeSubTab: string;
  /** Creator handle. TODO: wire to settings API */
  handle: string;
  /** Primary email for the Account sub-page. TODO: wire to settings API */
  email?: string;
}

// ─── Sub-page placeholder for tabs not yet implemented ───────────────────────

function SubpagePlaceholder({ label }: { label: string }) {
  return (
    <div className="subpage-placeholder">
      <div className="sp-emoji" aria-hidden="true">🚧</div>
      <div className="sp-title">{label}</div>
      <div className="sp-sub">Coming in next PR</div>
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsPanel({ activeSubTab, handle, email = "" }: SettingsPanelProps) {
  const validSubTab = normalizeSettingsSubTab(activeSubTab);

  return (
    <section
      className="main-settings"
      aria-labelledby="settings-title"
      data-testid="settings-panel"
    >
      {/* Breadcrumb */}
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <a href="/app?tab=page">Home</a>
        <span className="sep">/</span>
        <span className="current">Settings</span>
      </nav>

      {/* Page head */}
      <div className="page-head">
        <div>
          <h1 id="settings-title">Settings</h1>
          <div className="sub">Identity, email, and how visitors find you.</div>
        </div>
      </div>

      {/* Settings layout: tab nav + content */}
      <div className="settings-layout">

        {/* Tab nav — verbatim from mockup app-settings-account.html nav */}
        <nav className="settings-nav" aria-label="Settings sections">
          {/* Account */}
          <a
            href="/app?tab=settings&subtab=account"
            className={`settings-nav-item${validSubTab === "account" ? " active" : ""}`}
            aria-current={validSubTab === "account" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            Account
          </a>

          {/* Billing */}
          <a
            href="/app?tab=settings&subtab=billing"
            className={`settings-nav-item${validSubTab === "billing" ? " active" : ""}`}
            aria-current={validSubTab === "billing" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
              <line x1="1" y1="10" x2="23" y2="10" />
            </svg>
            Billing
          </a>

          {/* Security */}
          <a
            href="/app?tab=settings&subtab=security"
            className={`settings-nav-item${validSubTab === "security" ? " active" : ""}`}
            aria-current={validSubTab === "security" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            Security
          </a>

          {/* GDPR & data */}
          <a
            href="/app?tab=settings&subtab=gdpr"
            className={`settings-nav-item${validSubTab === "gdpr" ? " active" : ""}`}
            aria-current={validSubTab === "gdpr" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <polyline points="9 12 11 14 15 10" />
            </svg>
            GDPR &amp; data
          </a>

          {/* Theme */}
          <a
            href="/app?tab=settings&subtab=theme"
            className={`settings-nav-item${validSubTab === "theme" ? " active" : ""}`}
            aria-current={validSubTab === "theme" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/>
              <circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/>
              <circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/>
              <circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/>
              <path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z"/>
            </svg>
            Theme
            <span className="sn-pill new-pill">New</span>
          </a>

          <div className="settings-nav-divider" />

          {/* API keys (Pro) */}
          <a
            href="/app?tab=settings&subtab=apikeys"
            className={`settings-nav-item${validSubTab === "apikeys" ? " active" : ""}`}
            aria-current={validSubTab === "apikeys" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="16 18 22 12 16 6" />
              <polyline points="8 6 2 12 8 18" />
            </svg>
            API keys
            <span className="sn-pill pro-pill">Pro</span>
          </a>

          {/* Team (Business) */}
          <a
            href="/app?tab=settings&subtab=team"
            className={`settings-nav-item${validSubTab === "team" ? " active" : ""}`}
            aria-current={validSubTab === "team" ? "page" : undefined}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Team
            <span className="sn-pill biz-pill">Business</span>
          </a>

          <div className="settings-nav-divider" />

          {/* Danger zone */}
          <a
            href="/app?tab=settings&subtab=danger"
            className={`settings-nav-item${validSubTab === "danger" ? " active" : ""}`}
            aria-current={validSubTab === "danger" ? "page" : undefined}
            style={{ color: "var(--danger)" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ color: "var(--danger)" }}
            >
              <polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
            Danger zone
          </a>
        </nav>

        {/* Content — routed by activeSubTab */}
        {validSubTab === "account" ? (
          <SettingsAccount handle={handle} email={email} />
        ) : validSubTab === "billing" ? (
          <SettingsBilling />
        ) : validSubTab === "security" ? (
          <SettingsSecurity />
        ) : validSubTab === "gdpr" ? (
          <SettingsGdpr />
        ) : validSubTab === "theme" ? (
          <SettingsTheme />
        ) : validSubTab === "apikeys" ? (
          <SettingsApiKeys />
        ) : validSubTab === "team" ? (
          <SettingsTeam />
        ) : validSubTab === "danger" ? (
          <SettingsDanger />
        ) : (
          <div className="settings-content"><SubpagePlaceholder label="Danger zone" /></div>
        )}
      </div>
    </section>
  );
}
