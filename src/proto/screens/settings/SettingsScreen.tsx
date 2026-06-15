/**
 * SettingsScreen — the single `/__proto/settings` route. Holds the local
 * `activeTab` state (clicking a `.settings-nav` rail item switches the rendered
 * section — more SPA-accurate than nine routes) and the active tab's optional
 * sticky save-bar, renders SettingsShell with the ordered tab registry, and
 * mounts the matching section component.
 *
 * Ported from mockups/tadaify-mvp/app-settings*.html. The hub landing is the
 * Account section (the default-active pane in app-settings.html). All eight
 * sections are ported — Account, Billing, Security, GDPR & data, Theme, API
 * keys (Pro+), Team (Business), and Danger zone — each on the shared shell.
 *
 * Presentational, local-state only. Data comes from each tab's typed fixture.
 *
 * @implements fr-settings
 */
import { useState, type ReactNode } from "react";
import { SettingsShell, type SaveBar, type SettingsTabDef } from "./SettingsShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import { AccountTab } from "./AccountTab";
import { ThemeTab } from "./ThemeTab";
import { BillingTab } from "./BillingTab";
import { SecurityTab } from "./SecurityTab";
import { GdprTab } from "./GdprTab";
import { ApiKeysTab } from "./ApiKeysTab";
import { TeamTab } from "./TeamTab";
import { DangerTab } from "./DangerTab";

/**
 * The ordered settings nav, matching the mockup rail
 * (app-settings-theme.html carries the canonical 8-entry version):
 * Account · Billing · Security · GDPR & data · Theme(New)
 * ──divider── API keys(Pro) · Team(Business) ──divider── Danger zone.
 */
const TABS: SettingsTabDef[] = [
  { id: "account", label: "Account", icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></> },
  { id: "billing", label: "Billing", icon: <><rect x="1" y="4" width="22" height="16" rx="2" ry="2" /><line x1="1" y1="10" x2="23" y2="10" /></> },
  { id: "security", label: "Security", icon: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /> },
  { id: "gdpr", label: "GDPR & data", icon: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /><polyline points="9 12 11 14 15 10" /></> },
  { id: "theme", label: "Theme", pill: "new", icon: <><circle cx="13.5" cy="6.5" r=".5" fill="currentColor" /><circle cx="17.5" cy="10.5" r=".5" fill="currentColor" /><circle cx="8.5" cy="7.5" r=".5" fill="currentColor" /><circle cx="6.5" cy="12.5" r=".5" fill="currentColor" /><path d="M12 2A10 10 0 0 0 2 12a10 10 0 0 0 10 10c1.4 0 2-.8 2-1.8 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.2 0-1 .8-1.8 1.8-1.8H17a5 5 0 0 0 5-5c0-4.9-4.5-9-10-9z" /></> },
  { id: "apikeys", label: "API keys", pill: "pro", dividerBefore: true, icon: <><polyline points="16 18 22 12 16 6" /><polyline points="8 6 2 12 8 18" /></> },
  { id: "team", label: "Team", pill: "business", icon: <><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></> },
  { id: "danger", label: "Danger zone", danger: true, dividerBefore: true, icon: <><polygon points="10.29 3.86 1.82 18 22.18 18 13.71 3.86 10.29 3.86" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" /></> },
];

/** Header copy per tab — the hub landing (Account) keeps the generic title. */
const HEADER: Record<string, { title: ReactNode; description: ReactNode; badge?: boolean }> = {
  account: { title: "Settings", description: "Manage your account, billing, security, and data." },
  theme: { title: "Theme", description: "Pick a starter, tweak the palette, and watch it apply live.", badge: true },
  billing: { title: "Billing", description: "Your plan, payment method, invoices, and custom-domain add-ons." },
  security: { title: "Security", description: "Password, two-factor authentication, active sessions, and connected accounts." },
  gdpr: { title: "GDPR & data", description: "Export your data, review cookies and policies, and manage data processing." },
  apikeys: { title: "API keys", description: "Generate keys, plug into Claude via MCP, build a Custom GPT, and watch your webhook deliveries." },
  team: { title: "Team", description: "Invite collaborators, manage roles and permissions, and review the audit log." },
  danger: { title: "Danger zone", description: "Cancel or pause your subscription, export your data, or permanently delete your account." },
};

export function SettingsScreen() {
  const profile = dashboardProfileFixture();
  const [activeTab, setActiveTab] = useState("account");
  const [save, setSave] = useState<SaveBar | null>(null);

  // Switching tabs always clears the previous tab's save-bar.
  const goTab = (id: string) => {
    setSave(null);
    setActiveTab(id);
  };

  const head = HEADER[activeTab] ?? {
    title: "Settings",
    description: "Manage your account, billing, security, and data.",
  };

  return (
    <SettingsShell
      profile={profile}
      title={head.title}
      description={head.description}
      headerActions={
        head.badge ? (
          <span className="preview-badge"><span className="pb-dot" /> Preview only · changes haven't published yet</span>
        ) : undefined
      }
      tabs={TABS}
      activeTab={activeTab}
      onTab={goTab}
      save={save ?? undefined}
    >
      {activeTab === "account" && <AccountTab onSaveBar={setSave} onTab={goTab} />}
      {activeTab === "theme" && <ThemeTab onSaveBar={setSave} />}
      {activeTab === "billing" && <BillingTab onSaveBar={setSave} />}
      {activeTab === "security" && <SecurityTab />}
      {activeTab === "gdpr" && <GdprTab />}
      {activeTab === "apikeys" && <ApiKeysTab />}
      {activeTab === "team" && <TeamTab />}
      {activeTab === "danger" && <DangerTab />}
    </SettingsShell>
  );
}
