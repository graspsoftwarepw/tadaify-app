/**
 * Typed mock seam for the Audit-log admin pane. Mirrors the filter options,
 * type segments, and insert-only log rows in
 * mockups/tadaify-mvp/admin-panel.html so the section graduates by swapping
 * these factories for real audit_log query results.
 * @implements fr-admin-panel
 */

/** Chip colour variant on an audit action — empty string = the neutral chip. */
export type AuditChip = "" | "info" | "warn" | "danger";

/** A type-segment tab; `data-kind` filters the table, `all` shows everything. */
export type AuditSegment = {
  kind: "all" | "user" | "settings" | "legal" | "moderation" | "impersonation";
  label: string;
  /** Optional trailing count rendered muted (e.g. the "· 1,247" on All). */
  count?: string;
};

/** One audit-log row. `detailLink` is the optional "view diff"-style anchor. */
export type AuditEntry = {
  kind: AuditSegment["kind"];
  when: string;
  actor: string;
  action: string;
  chip: AuditChip;
  target: string;
  detailLink?: string;
  detail: string;
  ip: string;
};

export const auditActorOptionsFixture = (): string[] => [
  "All actors",
  "founder@tadaify.com",
  "System",
];

export const auditTimeOptionsFixture = (): string[] => [
  "All time",
  "Today",
  "Last 7 days",
  "Last 30 days",
  "Custom…",
];

export const auditSegmentsFixture = (): AuditSegment[] => [
  { kind: "all", label: "All", count: "· 1,247" },
  { kind: "user", label: "User actions" },
  { kind: "settings", label: "Settings" },
  { kind: "legal", label: "Legal" },
  { kind: "moderation", label: "Moderation" },
  { kind: "impersonation", label: "Impersonations" },
];

export const auditEntriesFixture = (): AuditEntry[] => [
  {
    kind: "user",
    when: "14:32:08",
    actor: "founder@",
    action: "user.suspend",
    chip: "warn",
    target: "@dance_captain",
    detailLink: "view diff",
    detail: ' · "ToS §4.2 violation"',
    ip: "82.139.x.x",
  },
  {
    kind: "settings",
    when: "14:18:52",
    actor: "founder@",
    action: "waitlist.promote",
    chip: "info",
    target: "14 users",
    detail: "oldest 14 of 247 · email queued",
    ip: "82.139.x.x",
  },
  {
    kind: "user",
    when: "14:12:14",
    actor: "founder@",
    action: "user.tier_comp",
    chip: "",
    target: "@maya_creates",
    detail: 'Free → Pro · 1 month · reason: "PH winner"',
    ip: "82.139.x.x",
  },
  {
    kind: "moderation",
    when: "13:42:08",
    actor: "founder@",
    action: "page.takedown",
    chip: "danger",
    target: "tadaify.com/spam_drop_22",
    detail: "spam · 5 reports · auto-flag",
    ip: "82.139.x.x",
  },
  {
    kind: "impersonation",
    when: "12:08:51",
    actor: "founder@",
    action: "user.impersonate.start",
    chip: "warn",
    target: "@chris_h",
    detail: "support ticket #1284 — domain pending",
    ip: "82.139.x.x",
  },
  {
    kind: "impersonation",
    when: "12:14:32",
    actor: "founder@",
    action: "user.impersonate.end",
    chip: "",
    target: "@chris_h",
    detail: "duration: 5m 41s",
    ip: "82.139.x.x",
  },
  {
    kind: "settings",
    when: "11:58:14",
    actor: "founder@",
    action: "settings.cap.update",
    chip: "info",
    target: "app_settings.cap",
    detail: "900 → 1000",
    ip: "82.139.x.x",
  },
  {
    kind: "user",
    when: "11:32:19",
    actor: "founder@",
    action: "user.refund",
    chip: "danger",
    target: "@nina_food",
    detail: 'Stripe ch_3X9 · $5.00 · "duplicate charge"',
    ip: "82.139.x.x",
  },
  {
    kind: "legal",
    when: "10:14:08",
    actor: "founder@",
    action: "legal.draft.create",
    chip: "",
    target: "tos-v3.4-draft",
    detail: "3 sections modified · §7.4 added",
    ip: "82.139.x.x",
  },
  {
    kind: "settings",
    when: "Apr 25 22:18",
    actor: "founder@",
    action: "maintenance.toggle",
    chip: "warn",
    target: "app_settings.maintenance",
    detail: "OFF · session: 22m · DB vacuum",
    ip: "82.139.x.x",
  },
  {
    kind: "user",
    when: "Apr 25 18:42",
    actor: "founder@",
    action: "user.hard_delete",
    chip: "danger",
    target: "@former_user_x",
    detail: "type-to-confirm passed · cascade: 47 rows",
    ip: "82.139.x.x",
  },
  {
    kind: "user",
    when: "Apr 25 14:08",
    actor: "System",
    action: "user.signup",
    chip: "",
    target: "@dev_lab",
    detail: "cap available · auto-promoted",
    ip: "—",
  },
];
