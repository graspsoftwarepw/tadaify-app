/**
 * Typed mock seam for the Maintenance admin pane. Mirrors the duration presets
 * and history rows in mockups/tadaify-mvp/admin-panel.html so the section
 * graduates by swapping these factories for real app_settings.maintenance data.
 * @implements fr-admin-panel
 */

export type MaintenancePreset = {
  /** Minutes the preset adds to "now" — `null` for the custom focus button. */
  minutes: number | null;
  label: string;
};

export type MaintenanceHistoryRow = {
  when: string;
  duration: string;
  reason: string;
  startedBy: string;
  affectedUsers: string;
};

export const maintenancePresetsFixture = (): MaintenancePreset[] => [
  { minutes: 15, label: "15 min" },
  { minutes: 30, label: "30 min" },
  { minutes: 60, label: "1 hour" },
  { minutes: 120, label: "2 hours" },
  { minutes: null, label: "Custom…" },
];

export const maintenanceHistoryFixture = (): MaintenanceHistoryRow[] => [
  {
    when: "2026-04-12 03:14 UTC",
    duration: "22m",
    reason: "D1 emergency vacuum + index rebuild",
    startedBy: "founder@",
    affectedUsers: "~80 (3am UTC traffic)",
  },
  {
    when: "2026-03-28 21:00 UTC",
    duration: "1h 04m",
    reason: "Migration to Workers Analytics Engine v2",
    startedBy: "founder@",
    affectedUsers: "~340",
  },
  {
    when: "2026-02-15 19:00 UTC",
    duration: "30m",
    reason: "Stripe webhook secret rotation",
    startedBy: "founder@",
    affectedUsers: "~120",
  },
];
