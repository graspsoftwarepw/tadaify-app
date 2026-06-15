/**
 * Chrome-level fixture for the platform-admin shell: the signed-in admin
 * profile and the sidebar nav items (labels, counts, badge tones). Section
 * bodies carry their own per-section fixtures under ./sections/.
 *
 * Mock-only typed view-model — no live data.
 *
 * @implements fr-admin-panel
 */
import type { AdminSection } from "./adminPanelTypes";

export type AdminProfile = {
  email: string;
  initial: string;
};

export type AdminNavItem = {
  id: AdminSection;
  label: string;
  /** Numeric badge count (Users / Registration / Moderation). */
  count?: number;
  /** Tone class for the count chip. */
  countTone?: "warn" | "danger";
  /** Whether the item shows a notification badge dot. */
  badge?: boolean;
  /** A status pill instead of a count (Health). */
  pill?: string;
};

export function adminProfileFixture(): AdminProfile {
  return { email: "founder@tadaify.com", initial: "F" };
}

export function adminNavFixture(): AdminNavItem[] {
  return [
    { id: "overview", label: "Overview" },
    { id: "users", label: "Users", count: 847 },
    { id: "registration", label: "Registration", count: 247, countTone: "warn", badge: true },
    { id: "maintenance", label: "Maintenance" },
    { id: "moderation", label: "Moderation", count: 3, countTone: "danger", badge: true },
    { id: "legal", label: "Legal" },
    { id: "health", label: "Health", pill: "All green" },
    { id: "audit", label: "Audit log" },
  ];
}
