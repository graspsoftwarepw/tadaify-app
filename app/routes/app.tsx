/**
 * /app — Post-onboarding home dashboard (F-APP-DASHBOARD-001a + 001b)
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html (canonical primary)
 *
 * SSR-first (TR-tadaify-005): loader fetches account_settings + pages + blocks
 * via service-role REST for first paint. Client-side hydration enables interactivity.
 *
 * URL params:
 *   ?tab=page (default) | design | insights | shop | settings
 *   ?subtab=background (default for design) | theme | profile | text | buttons | animations | colors | footer
 *   ?nav=expanded  (auto-expand design accordion)
 *   ?device=mobile|tablet|desktop (default mobile)
 *   ?state=ready|empty (default derived from blocks.count > 0)
 *
 * Auth gate: loader redirects to /login?next=/app for unauthenticated users.
 *
 * Onboarding-interrupt: loader queries profiles.onboarding_completed_at.
 * NULL → render with "Finish setup" affordance + deep-link.
 * NOT NULL → render ready-state with welcome banner.
 *
 * DEC trail:
 *   DEC-332=D  page Publish-gated; welcome banner copy "Add your first block to publish"
 *   TR-tadaify-005  dashboard SSR-first contract
 *
 * Story: F-APP-DASHBOARD-001a (#171), F-APP-DASHBOARD-001b (#173)
 * Covers: BR-Slice-C, AC#1-AC#26, TR-tadaify-005, VE-26b-01..35
 */

import { redirect, useSearchParams } from "react-router";
import { useState, useCallback } from "react";
import type { Route } from "./+types/app";
import { AppAppbar } from "~/components/AppAppbar";
import { AppSidebar } from "~/components/AppSidebar";
import { HomepagePanel } from "~/components/HomepagePanel";
import type { Block } from "~/components/HomepagePanel";
import { LivePreviewPane } from "~/components/LivePreviewPane";
import type { DeviceSize } from "~/components/LivePreviewPane";
import { AppMobileTabs } from "~/components/AppMobileTabs";
import { DesignPanel, DEFAULT_DESIGN_SUBTAB, normalizeSubTab } from "~/components/DesignPanel";
import { AppSidebarDesignAccordion } from "~/components/AppSidebarDesignAccordion";
import type { SubTabId } from "~/components/DesignBreadcrumbStepper";
import { deriveOnboardingState } from "~/lib/onboarding-state";
import type { OnboardingState } from "~/lib/onboarding-state";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface DashboardProfile {
  handle: string;
  display_name: string | null;
  bio: string | null;
  tier: string;
  template_id: string | null;
  onboarding_completed_at: string | null;
  social_platforms?: string | null;
}

export interface DashboardPage {
  id: string;
  title: string;
  is_homepage: boolean;
  published_at: string | null;
  onboarding_resume_url: string | null;
}

export interface DashboardAccountSettings {
  theme_pref: "light" | "dark";
  welcome_dismissed: boolean;
}

export interface DashboardViewModel {
  profile: DashboardProfile;
  page: DashboardPage | null;
  blocks: Block[];
  accountSettings: DashboardAccountSettings;
  onboardingState: OnboardingState;
  activeTab: string;
  activeSubTab: string;
  activeDevice: DeviceSize;
  navExpanded: boolean;
}

// ─── Helpers — URL param parsing ────────────────────────────────────────────

const VALID_TABS = ["page", "design", "insights", "shop", "settings", "affiliate"] as const;
const VALID_DEVICES = ["mobile", "tablet", "desktop"] as const;

/**
 * Parses nav=expanded from URL params.
 */
export function parseNavExpanded(searchParams: URLSearchParams): boolean {
  return searchParams.get("nav") === "expanded";
}

/**
 * Parses tab from URL params — returns 'page' for invalid/missing values.
 * Covers: U1 — loader URL-param parsing
 */
export function parseTab(searchParams: URLSearchParams): string {
  const tab = searchParams.get("tab");
  if (!tab) return "page";
  const valid = (VALID_TABS as readonly string[]).includes(tab);
  if (!valid) {
    console.warn(`[app loader] invalid ?tab="${tab}" — falling back to "page"`);
    return "page";
  }
  return tab;
}

export function parseDevice(searchParams: URLSearchParams): DeviceSize {
  const device = searchParams.get("device");
  if (!device) return "mobile";
  return (VALID_DEVICES as readonly string[]).includes(device)
    ? (device as DeviceSize)
    : "mobile";
}

export function parseSubTab(searchParams: URLSearchParams): string {
  return searchParams.get("subtab") ?? "";
}

// ─── Loader ─────────────────────────────────────────────────────────────────

export async function loader({ request, context }: Route.LoaderArgs): Promise<DashboardViewModel> {
  const url = new URL(request.url);
  const activeTab = parseTab(url.searchParams);
  const activeDevice = parseDevice(url.searchParams);
  const activeSubTab = parseSubTab(url.searchParams);
  const navExpanded = parseNavExpanded(url.searchParams);

  const env = context?.cloudflare?.env as unknown as Record<string, string> | undefined;
  const supabaseUrl = env?.SUPABASE_URL;
  const serviceKey = env?.SUPABASE_SERVICE_ROLE_KEY;

  // ── Auth check ─────────────────────────────────────────────────────────
  // Extract JWT from Cookie or Authorization header.
  // RR7 Workers runtime: cookies come in via request.headers.get("Cookie").
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const authHeader = request.headers.get("Authorization") ?? "";

  // Try Authorization: Bearer <token>
  let accessToken: string | null = null;
  if (authHeader.startsWith("Bearer ")) {
    accessToken = authHeader.slice(7);
  }

  // Try Supabase session cookie (sb-<ref>-auth-token or supabase-auth-token)
  if (!accessToken) {
    const cookiePairs = cookieHeader.split(";").map((c: string) => c.trim());
    for (const pair of cookiePairs) {
      const eqIdx = pair.indexOf("=");
      if (eqIdx < 0) continue;
      const key = pair.slice(0, eqIdx).trim();
      const val = pair.slice(eqIdx + 1).trim();
      if (key.startsWith("sb-") && key.endsWith("-auth-token")) {
        try {
          const parsed = JSON.parse(decodeURIComponent(val));
          if (parsed?.access_token) {
            accessToken = parsed.access_token;
            break;
          }
        } catch {
          // Not JSON — skip
        }
      }
    }
  }

  // If no env or no service key configured → stub mode (dev without env vars)
  if (!supabaseUrl || !serviceKey) {
    console.warn("[app loader] Supabase env vars not configured — returning stub view-model");
    return buildStubViewModel(activeTab, activeDevice, activeSubTab, navExpanded);
  }

  // Verify JWT
  if (!accessToken) {
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!userRes.ok) {
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const user = (await userRes.json()) as { id: string; email: string };
  const userId = user.id;

  if (!userId) {
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  // ── Fetch data in parallel ──────────────────────────────────────────────
  const headers = {
    apikey: serviceKey,
    Authorization: `Bearer ${serviceKey}`,
    "Content-Type": "application/json",
    Prefer: "return=representation",
  };

  const [profileRes, settingsRes, pagesRes] = await Promise.all([
    fetch(`${supabaseUrl}/rest/v1/profiles?id=eq.${userId}&select=*`, { headers }),
    fetch(
      `${supabaseUrl}/rest/v1/account_settings?id=eq.${userId}&select=*`,
      { headers }
    ),
    fetch(
      `${supabaseUrl}/rest/v1/pages?user_id=eq.${userId}&is_homepage=eq.true&select=*&limit=1`,
      { headers }
    ),
  ]);

  const [profileRows, settingsRows, pageRows] = await Promise.all([
    profileRes.json() as Promise<DashboardProfile[]>,
    settingsRes.json() as Promise<DashboardAccountSettings[]>,
    pagesRes.json() as Promise<DashboardPage[]>,
  ]);

  const rawProfile = profileRows[0];
  if (!rawProfile) {
    // Profile not yet created (edge case: auth but no profiles row)
    throw redirect(`/login?next=${encodeURIComponent(url.pathname + url.search)}`);
  }

  const rawRow = rawProfile as unknown as Record<string, unknown>;
  const profile: DashboardProfile = {
    handle: rawProfile.handle ?? "",
    display_name: rawProfile.display_name ?? null,
    bio: (rawRow.bio as string | null) ?? null,
    tier: (rawRow.tier as string) ?? "free",
    template_id: (rawRow.template_id as string | null) ?? null,
    onboarding_completed_at: (rawRow.onboarding_completed_at as string | null) ?? null,
    social_platforms: (rawRow.social_platforms as string | null) ?? null,
  };

  const rawSettings = settingsRows[0];
  const accountSettings: DashboardAccountSettings = rawSettings
    ? {
        theme_pref: rawSettings.theme_pref ?? "light",
        welcome_dismissed: rawSettings.welcome_dismissed ?? false,
      }
    : { theme_pref: "light", welcome_dismissed: false };

  const page: DashboardPage | null = pageRows[0] ?? null;

  // Fetch blocks if we have a homepage
  let blocks: Block[] = [];
  if (page) {
    const blocksRes = await fetch(
      `${supabaseUrl}/rest/v1/blocks?page_id=eq.${page.id}&user_id=eq.${userId}&order=position.asc&select=*`,
      { headers }
    );
    const rawBlocks = (await blocksRes.json()) as Block[];
    blocks = Array.isArray(rawBlocks) ? rawBlocks : [];
  }

  // Derive onboarding state
  const onboardingResult = deriveOnboardingState(profile);
  const onboardingState = onboardingResult.state;

  return {
    profile,
    page,
    blocks,
    accountSettings,
    onboardingState,
    activeTab,
    activeDevice,
    activeSubTab,
    navExpanded,
  };
}

// ─── Stub view-model (dev without Supabase) ─────────────────────────────────

function buildStubViewModel(
  activeTab: string,
  activeDevice: DeviceSize,
  activeSubTab: string,
  navExpanded = false
): DashboardViewModel {
  return {
    profile: {
      handle: "demo",
      display_name: null,
      bio: null,
      tier: "free",
      template_id: null,
      onboarding_completed_at: null,
      social_platforms: null,
    },
    page: null,
    blocks: [],
    accountSettings: { theme_pref: "light", welcome_dismissed: false },
    onboardingState: "interrupted-welcome",
    activeTab,
    activeDevice,
    activeSubTab,
    navExpanded,
  };
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AppDashboard({ loaderData }: Route.ComponentProps) {
  const {
    profile,
    page,
    blocks,
    accountSettings,
    onboardingState,
    activeTab: initialTab,
    activeDevice: initialDevice,
    activeSubTab: initialSubTab,
    navExpanded: initialNavExpanded,
  } = loaderData;

  const [searchParams, setSearchParams] = useSearchParams();

  // Derive active tab/subtab from URL search params (SSR initial values as fallback)
  const activeTab = parseTab(searchParams) || initialTab;
  const activeSubTab = normalizeSubTab(
    searchParams.get("subtab") ?? initialSubTab
  );

  const [welcomeDismissed, setWelcomeDismissed] = useState(
    accountSettings.welcome_dismissed
  );

  const isPublished = page?.published_at != null;

  const handleWelcomeDismiss = useCallback(async () => {
    // Optimistic local update first so the banner disappears instantly.
    setWelcomeDismissed(true);
    // Persist via /api/account/dismiss-welcome so the next SSR loader sees
    // welcome_dismissed=true and does not re-render the banner after reload.
    // Best-effort; on transient failure the banner will reappear after reload
    // and the user can dismiss again.
    try {
      await fetch("/api/account/dismiss-welcome", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });
    } catch {
      // Ignore — local state already hides the banner this session.
    }
  }, []);

  const handleTabChange = useCallback((tab: string) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", tab);
      if (tab === "design") {
        // Default sub-tab when entering design
        if (!next.get("subtab") || prev.get("tab") !== "design") {
          next.set("subtab", DEFAULT_DESIGN_SUBTAB);
        }
      } else {
        // Remove design-specific subtab when leaving design
        next.delete("subtab");
      }
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  const handleSubTabChange = useCallback((subTab: SubTabId) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set("tab", "design");
      next.set("subtab", subTab);
      return next;
    }, { replace: true });
  }, [setSearchParams]);

  return (
    <div
      data-testid="app-dashboard"
      style={{ display: "flex", flexDirection: "column", height: "100vh", overflow: "hidden" }}
    >
      {/* Top appbar */}
      <AppAppbar
        handle={profile.handle}
        isPublished={isPublished}
      />

      {/* Main layout: sidebar + content + preview */}
      <div
        className="app-layout"
        style={{ display: "flex", flex: 1, overflow: "hidden" }}
      >
        {/* Left sidebar (hidden on mobile via CSS) */}
        <AppSidebar
          handle={profile.handle}
          displayName={profile.display_name}
          tier={profile.tier}
          activeTab={activeTab}
          onTabChange={handleTabChange}
          designAccordion={
            <AppSidebarDesignAccordion
              activeTab={activeTab}
              activeSubTab={activeSubTab}
              navExpanded={initialNavExpanded}
              onTabChange={handleTabChange}
              onSubTabChange={handleSubTabChange}
            />
          }
        />

        {/* Main content area */}
        <main
          data-testid="app-main"
          style={{ flex: 1, overflowY: "auto" }}
        >
          {activeTab === "page" && (
            <HomepagePanel
              handle={profile.handle}
              displayName={profile.display_name}
              bio={profile.bio}
              blocks={blocks}
              onboardingState={onboardingState}
              welcomeDismissed={welcomeDismissed}
              onWelcomeDismiss={handleWelcomeDismiss}
            />
          )}
          {activeTab === "design" && (
            <DesignPanel
              activeSubTab={activeSubTab}
              currentTier={profile.tier}
              onSubTabChange={handleSubTabChange}
            />
          )}
          {activeTab !== "page" && activeTab !== "design" && (
            /* Placeholder panel for other tabs */
            <div
              style={{
                padding: "24px 28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                height: "100%",
              }}
            >
              <div style={{ textAlign: "center", color: "var(--fg-muted)" }}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>🚧</div>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 6 }}>
                  {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} panel
                </div>
                <div style={{ fontSize: 13.5 }}>
                  Full content coming in #26c / #26d / #26e
                </div>
              </div>
            </div>
          )}
        </main>

        {/* Live preview pane (desktop/tablet — hidden on mobile via CSS) */}
        <LivePreviewPane
          handle={profile.handle}
          displayName={profile.display_name}
          bio={profile.bio}
          isPublished={isPublished}
          initialDevice={initialDevice}
        />
      </div>

      {/* Mobile bottom tab bar (visible only on mobile via CSS) */}
      <AppMobileTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
      />
    </div>
  );
}
