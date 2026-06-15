/**
 * Typed mock seam for the Settings · Team tab. Mirrors the data shown in
 * mockups/tadaify-mvp/app-settings-team.html (the seats overview, the members
 * table, pending invites, the roles/permissions matrix, and the audit-log
 * preview) so the tab graduates by swapping this factory for the real loader.
 *
 * @implements fr-settings
 */

export type MemberRole = "owner" | "admin" | "editor" | "viewer";
export type MemberStatus = "active" | "pending" | "removed";

export type TeamMember = {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  lastActive: string;
  isYou?: boolean;
  /** Avatar background swatch (bg-1 … bg-5). */
  bg: string;
  initial: string;
  /** Pending rows show an expiry hint. */
  expiresIn?: string;
};

export type PendingInvite = {
  email: string;
  role: MemberRole;
  sent: string;
  expiresIn: string;
};

export type MatrixRow = {
  action: string;
  /** Per-role cell: true = ✓, false = ✗, "partial" = limited. */
  owner: boolean | "partial";
  admin: boolean | "partial";
  editor: boolean | "partial";
  viewer: boolean | "partial";
};

export type AuditAction = "edit" | "publish" | "invite" | "role" | "remove" | "signin" | "billing";

export type AuditEvent = {
  id: string;
  when: string;
  actor: string;
  actorKey: string;
  bg: string;
  initial: string;
  action: AuditAction;
  label: string;
  /** Plain-text target (no HTML — rendered as text). */
  target: string;
  ip: string;
};

export type TeamFixture = {
  seatsUsed: number;
  seatsCap: number;
  members: TeamMember[];
  pending: PendingInvite[];
  matrix: MatrixRow[];
  audit: AuditEvent[];
  auditTotal: number;
};

export function teamFixture(): TeamFixture {
  const T = true;
  const F = false;
  return {
    seatsUsed: 5,
    seatsCap: 10,
    members: [
      { id: "m1", name: "Alexandra Silva", email: "alexandra@silva.studio", role: "owner", status: "active", lastActive: "now", isYou: true, bg: "bg-1", initial: "A" },
      { id: "m2", name: "Maya Patel", email: "maya@studio.com", role: "admin", status: "active", lastActive: "14 min ago", bg: "bg-2", initial: "M" },
      { id: "m3", name: "Alex Chen", email: "alex@chen.dev", role: "editor", status: "active", lastActive: "2 hours ago", bg: "bg-3", initial: "A" },
      { id: "m4", name: "Sam Müller", email: "sam.m@designstudio.de", role: "viewer", status: "active", lastActive: "yesterday", bg: "bg-4", initial: "S" },
      { id: "m5", name: "Jordan Rivera", email: "jordan@example.com", role: "editor", status: "pending", lastActive: "— invited 3d", bg: "bg-5", initial: "J", expiresIn: "4 days" },
    ],
    pending: [
      { email: "jordan@example.com", role: "editor", sent: "3 days ago", expiresIn: "4 days" },
      { email: "taylor@brandco.io", role: "viewer", sent: "1 hour ago", expiresIn: "7 days" },
    ],
    matrix: [
      { action: "View pages and blocks", owner: T, admin: T, editor: T, viewer: T },
      { action: "Edit blocks", owner: T, admin: T, editor: T, viewer: F },
      { action: "Create / delete pages", owner: T, admin: T, editor: T, viewer: F },
      { action: "Publish + unpublish", owner: T, admin: T, editor: T, viewer: F },
      { action: "Manage custom domains", owner: T, admin: T, editor: F, viewer: F },
      { action: "Manage account & security settings", owner: T, admin: T, editor: F, viewer: F },
      { action: "Manage team (invite / remove / change role)", owner: T, admin: T, editor: F, viewer: F },
      { action: "Manage billing & payment method", owner: T, admin: F, editor: F, viewer: F },
      { action: "Delete account", owner: T, admin: F, editor: F, viewer: F },
      { action: "View audit log", owner: T, admin: T, editor: "partial", viewer: F },
    ],
    audit: [
      { id: "a1", when: "2026-04-26 14:32", actor: "Maya Patel", actorKey: "maya", bg: "bg-2", initial: "M", action: "edit", label: "✎ Edited block", target: 'Blog · "5 spring rituals" · headline + image', ip: "78.42.18.4" },
      { id: "a2", when: "2026-04-26 14:18", actor: "Alex Chen", actorKey: "alex", bg: "bg-3", initial: "A", action: "publish", label: "🚀 Published page", target: "Press kit · /alexandra/press", ip: "92.118.4.230" },
      { id: "a3", when: "2026-04-26 13:45", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "role", label: "🔁 Changed role", target: "Sam Müller · Viewer → Editor", ip: "212.83.45.9" },
      { id: "a4", when: "2026-04-26 11:02", actor: "Maya Patel", actorKey: "maya", bg: "bg-2", initial: "M", action: "edit", label: "✎ Edited block", target: "Home · Hero text · 2 changes", ip: "78.42.18.4" },
      { id: "a5", when: "2026-04-25 19:50", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "invite", label: "✉️ Sent invite", target: "jordan@example.com · Editor", ip: "212.83.45.9" },
      { id: "a6", when: "2026-04-25 16:22", actor: "Sam Müller", actorKey: "sam", bg: "bg-4", initial: "S", action: "edit", label: "✎ Edited block", target: 'Blog · "Why I switched stacks" · body', ip: "94.231.10.18" },
      { id: "a7", when: "2026-04-25 15:08", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "billing", label: "💳 Updated card", target: "Stripe Customer Portal · card ending 4242", ip: "212.83.45.9" },
      { id: "a8", when: "2026-04-25 12:14", actor: "Alex Chen", actorKey: "alex", bg: "bg-3", initial: "A", action: "edit", label: "✎ Edited block", target: "Newsletter · CTA copy + footer link", ip: "92.118.4.230" },
      { id: "a9", when: "2026-04-24 18:40", actor: "Maya Patel", actorKey: "maya", bg: "bg-2", initial: "M", action: "publish", label: "🚀 Published page", target: 'Blog · "5 spring rituals"', ip: "78.42.18.4" },
      { id: "a10", when: "2026-04-24 16:11", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "invite", label: "✉️ Sent invite", target: "taylor@brandco.io · Viewer", ip: "212.83.45.9" },
      { id: "a11", when: "2026-04-24 14:00", actor: "Sam Müller", actorKey: "sam", bg: "bg-4", initial: "S", action: "signin", label: "→ Signed in", target: "Method: Google OAuth · Berlin, DE", ip: "94.231.10.18" },
      { id: "a12", when: "2026-04-23 09:38", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "remove", label: "🗑️ Removed member", target: "former-contractor@old.studio", ip: "212.83.45.9" },
      { id: "a13", when: "2026-04-22 21:15", actor: "Maya Patel", actorKey: "maya", bg: "bg-2", initial: "M", action: "edit", label: "✎ Edited block", target: "About · timeline entry · added 2026", ip: "78.42.18.4" },
      { id: "a14", when: "2026-04-22 11:42", actor: "Alexandra Silva", actorKey: "alexandra", bg: "bg-1", initial: "A", action: "role", label: "🔁 Changed role", target: "Maya Patel · Editor → Admin", ip: "212.83.45.9" },
    ],
    auditTotal: 214,
  };
}
