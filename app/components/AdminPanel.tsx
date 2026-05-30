/**
 * AdminPanel — Container for the Administration panel.
 *
 * Visual contract: mockups/tadaify-mvp/app-admin-{blog,store,schedule,portfolio,paid-articles}.html
 *
 * Renders:
 *   section.main-admin
 *     sub-tab navigation (Blog / Store / Schedule / Portfolio / Paid articles)
 *     routed sub-page component
 *
 * Sub-tab routing:
 *   "blog"          → <AdminBlog />
 *   "store"         → <AdminStore />
 *   "schedule"      → <AdminSchedule />
 *   "portfolio"     → <AdminPortfolio />
 *   "paid-articles" → <AdminPaidArticles />
 *   (default)       → "blog"
 */

import { AdminBlog } from "./app-admin/AdminBlog";
import { AdminStore } from "./app-admin/AdminStore";
import { AdminSchedule } from "./app-admin/AdminSchedule";
import { AdminPortfolio } from "./app-admin/AdminPortfolio";
import { AdminPaidArticles } from "./app-admin/AdminPaidArticles";

// ─── Valid admin sub-tabs ─────────────────────────────────────────────────────

export const ADMIN_SUB_TABS = [
  "blog",
  "store",
  "schedule",
  "portfolio",
  "paid-articles",
] as const;

export type AdminSubTabId = (typeof ADMIN_SUB_TABS)[number];

export function normalizeAdminSubTab(raw: string | null | undefined): AdminSubTabId {
  if (!raw) return "blog";
  const found = ADMIN_SUB_TABS.find((t) => t === raw);
  return found ?? "blog";
}

// ─── Sub-nav items ────────────────────────────────────────────────────────────

const SUB_NAV_ITEMS: Array<{ id: AdminSubTabId; label: string }> = [
  { id: "blog",          label: "Blog" },
  { id: "store",         label: "Store" },
  { id: "schedule",      label: "Schedule" },
  { id: "portfolio",     label: "Portfolio" },
  { id: "paid-articles", label: "Paid articles" },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface AdminPanelProps {
  activeSubTab: string;
  handle: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

export function AdminPanel({ activeSubTab, handle }: AdminPanelProps) {
  const validSubTab = normalizeAdminSubTab(activeSubTab);

  return (
    <section
      className="main-admin-shell"
      aria-label="Administration"
      data-testid="admin-panel"
    >
      {/* Sub-tab navigation */}
      <nav className="admin-sub-nav" aria-label="Administration sections">
        {SUB_NAV_ITEMS.map(({ id, label }) => (
          <a
            key={id}
            href={`/app?tab=admin&subtab=${id}`}
            className={`admin-sub-nav-item${validSubTab === id ? " active" : ""}`}
            aria-current={validSubTab === id ? "page" : undefined}
          >
            {label}
          </a>
        ))}
      </nav>

      {/* Routed sub-page */}
      {validSubTab === "blog"          && <AdminBlog handle={handle} />}
      {validSubTab === "store"         && <AdminStore handle={handle} />}
      {validSubTab === "schedule"      && <AdminSchedule handle={handle} />}
      {validSubTab === "portfolio"     && <AdminPortfolio handle={handle} />}
      {validSubTab === "paid-articles" && <AdminPaidArticles handle={handle} />}
    </section>
  );
}
