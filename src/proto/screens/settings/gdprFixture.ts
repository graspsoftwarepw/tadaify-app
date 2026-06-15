/**
 * Typed mock seam for the Settings · GDPR & data tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-gdpr.html (data-export history, the
 * essential-cookies notice, visitor cookie-banner style, personal-data
 * summary + breakdown, accepted policies, DPA & subprocessors) so the tab
 * graduates by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */

export type ExportStatus = "ready" | "expired";

export type DataExport = {
  id: string;
  requested: string;
  status: ExportStatus;
  size: string;
  expires: string;
};

export type DataStat = { num: string; label: string };

export type BreakdownRow = { category: string; count: string; storedIn: string };

export type AcceptedPolicy = {
  id: string;
  name: string;
  version: string;
  acceptedOn: string;
  newVersion?: boolean;
  changed?: boolean;
};

export type ExportCategory = { name: string; meta: string };

export type GdprFixture = {
  exportReadySize: string;
  exportReadyAge: string;
  exportReadyExpires: string;
  exports: DataExport[];
  stats: DataStat[];
  breakdown: BreakdownRow[];
  policies: AcceptedPolicy[];
  exportCategories: ExportCategory[];
  subprocessors: string[];
  dpaVersion: string;
};

export const gdprFixture = (): GdprFixture => ({
  exportReadySize: "18.4 MB",
  exportReadyAge: "4 minutes ago",
  exportReadyExpires: "6 days, 23 hours",
  exports: [
    { id: "e1", requested: "2026-04-26 · 09:14 UTC", status: "ready", size: "18.4 MB", expires: "in 6d 23h · 4/5 downloads left" },
    { id: "e2", requested: "2026-04-12 · 14:02 UTC", status: "expired", size: "17.9 MB", expires: "expired 7d ago" },
    { id: "e3", requested: "2026-03-18 · 10:47 UTC", status: "expired", size: "15.2 MB", expires: "expired 1mo ago" },
  ],
  stats: [
    { num: "8", label: "Pages" },
    { num: "142", label: "Blocks across all pages" },
    { num: "1,847", label: "Newsletter subscribers" },
    { num: "63", label: "Bookings (Schedule)" },
    { num: "42.7 MB", label: "Uploaded files" },
  ],
  breakdown: [
    { category: "Profile (name, bio, avatar URL, email)", count: "1 record", storedIn: "users" },
    { category: "Pages (Home, About, Blog, Schedule, …)", count: "8", storedIn: "pages" },
    { category: "Blocks (links, posts, FAQ items, etc.)", count: "142", storedIn: "blocks" },
    { category: "Newsletter subscribers + double opt-in audit", count: "1,847", storedIn: "subscribers, doi_log" },
    { category: "Newsletter sends & open/click events", count: "12,304", storedIn: "email_events" },
    { category: "Schedule bookings (incl. notes + answers)", count: "63", storedIn: "bookings" },
    { category: "Page-view events (last 12 months)", count: "38,902", storedIn: "pageviews" },
    { category: "Click events on blocks (last 12 months)", count: "9,418", storedIn: "click_events" },
    { category: "Uploaded files (avatar, covers, post images)", count: "217 files · 42.7 MB", storedIn: "S3" },
    { category: "Billing history (invoices, charges)", count: "14 invoices", storedIn: "Stripe (mirror)" },
    { category: "Login & settings audit log", count: "412 events", storedIn: "audit_log" },
  ],
  policies: [
    { id: "tos", name: "Terms of Service", version: "v3", acceptedOn: "2026-03-04 · 18:22 UTC", changed: true },
    { id: "privacy", name: "Privacy Policy", version: "v2", acceptedOn: "2026-02-12 · 09:01 UTC" },
    { id: "cookie", name: "Cookie Policy", version: "v2", acceptedOn: "2026-02-12 · 09:01 UTC" },
    { id: "subproc", name: "Subprocessor list", version: "v3", acceptedOn: "2026-01-30 · 14:55 UTC", newVersion: true, changed: true },
    { id: "aup", name: "Acceptable Use Policy", version: "v1", acceptedOn: "2025-11-08 · 11:30 UTC" },
  ],
  exportCategories: [
    { name: "Profile & identity", meta: "Name, bio, avatar, email, pronouns" },
    { name: "Pages & blocks", meta: "All 8 pages, 142 blocks, theme + style" },
    { name: "Subscribers", meta: "Newsletter signups, contact submissions, double opt-in audit" },
    { name: "Bookings", meta: "Schedule bookings, attendee answers, status" },
    { name: "Analytics", meta: "Page views + click counts · last 12 months · aggregated daily" },
    { name: "Billing history", meta: "14 invoices, past charges, refunds (mirrored from Stripe)" },
    { name: "Audit log", meta: "Login history, settings changes, consent decisions" },
    { name: "Uploaded files", meta: "217 files · 42.7 MB · avatar, covers, post images" },
  ],
  subprocessors: ["Stripe · payments & billing", "Resend · transactional + marketing email", "Cloudflare · CDN + DDoS", "AWS · storage + compute (eu-west-1)"],
  dpaVersion: "v3 · 12 pages",
});
