/**
 * Platform-admin panel — the super-admin SPA. Faithful port of
 * mockups/tadaify-mvp/admin-panel.html: a single shell with eight in-place
 * sections (Overview, Users, Registration, Maintenance, Moderation, Legal,
 * Health, Audit log), plus the global admin modals and the impersonation /
 * read-only states.
 *
 * Platform-admin layer (audiences matrix): reachable only by the Platform admin
 * persona. Presentational, local-state only; data from typed section fixtures.
 *
 * @implements fr-admin-panel
 * @implements fr-globalui-view-layout
 */
import { useState, type ReactNode } from "react";
import "./admin-panel-proto.css";
import { AdminChrome } from "./AdminChrome";
import { adminNavFixture, adminProfileFixture } from "./adminPanelFixture";
import type { AdminCtx, AdminModalId, AdminSection, SectionProps } from "./adminPanelTypes";
import { OverviewSection } from "./sections/OverviewSection";
import { UsersSection } from "./sections/UsersSection";
import { RegistrationSection } from "./sections/RegistrationSection";
import { MaintenanceSection } from "./sections/MaintenanceSection";
import { ModerationSection } from "./sections/ModerationSection";
import { LegalSection } from "./sections/LegalSection";
import { HealthSection } from "./sections/HealthSection";
import { AuditSection } from "./sections/AuditSection";
import { AdminModals } from "./sections/AdminModals";

const SECTIONS: Record<AdminSection, (p: SectionProps) => ReactNode> = {
  overview: OverviewSection,
  users: UsersSection,
  registration: RegistrationSection,
  maintenance: MaintenanceSection,
  moderation: ModerationSection,
  legal: LegalSection,
  health: HealthSection,
  audit: AuditSection,
};

const ORDER: AdminSection[] = [
  "overview", "users", "registration", "maintenance", "moderation", "legal", "health", "audit",
];

export function AdminPanelScreen() {
  const profile = adminProfileFixture();
  const nav = adminNavFixture();

  const [section, setSection] = useState<AdminSection>("overview");
  const [impersonating, setImpersonating] = useState<string | null>(null);
  const [modal, setModal] = useState<{ id: AdminModalId; ctx: AdminCtx } | null>(null);

  const onNavigate = (s: AdminSection) => setSection(s);
  const openModal = (id: AdminModalId, ctx: AdminCtx = {}) => setModal({ id, ctx });
  const closeModal = () => setModal(null);

  return (
    <>
      <AdminChrome
        profile={profile}
        nav={nav}
        activeSection={section}
        onNavigate={onNavigate}
        impersonating={impersonating}
        onExitImpersonation={() => setImpersonating(null)}
      >
        {ORDER.map((id) => {
          const Section = SECTIONS[id];
          return (
            <section
              key={id}
              className={`pane${section === id ? " active" : ""}`}
              id={`pane-${id}`}
              hidden={section !== id}
            >
              <Section onNavigate={onNavigate} openModal={openModal} />
            </section>
          );
        })}
      </AdminChrome>

      <AdminModals
        openId={modal?.id ?? null}
        ctx={modal?.ctx ?? {}}
        onClose={closeModal}
        onNavigate={(s) => { closeModal(); onNavigate(s); }}
        onImpersonate={(handle) => { closeModal(); setImpersonating(handle); }}
      />
    </>
  );
}
