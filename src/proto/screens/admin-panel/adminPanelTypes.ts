/**
 * Shared contract types for the platform-admin panel prototype. The single
 * admin SPA (AdminPanelScreen) owns section + modal state and passes these
 * callbacks down to each section component.
 *
 * @implements fr-admin-panel
 */

/** The eight admin sections switched in-place in the admin shell. */
export type AdminSection =
  | "overview"
  | "users"
  | "registration"
  | "maintenance"
  | "moderation"
  | "legal"
  | "health"
  | "audit";

/** The global, centrally-rendered admin modals. */
export type AdminModalId =
  | "user-detail"
  | "takedown"
  | "hard-delete"
  | "comp-upgrade"
  | "publish-legal";

/** Loose context bag carried into a modal (handle, reason, …) — mock only. */
export type AdminCtx = Record<string, string>;

/** Props every section component receives from AdminPanelScreen. */
export type SectionProps = {
  /** Switch the active admin section (used by cross-section jump buttons). */
  onNavigate: (section: AdminSection) => void;
  /** Open one of the global admin modals with optional context. */
  openModal: (id: AdminModalId, ctx?: AdminCtx) => void;
};
