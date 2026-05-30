/**
 * SettingsTeam — Team management sub-page for SettingsPanel.
 *
 * Visual contract: mockups/tadaify-mvp/app-settings-team.html (2352 LOC)
 * Every class, SVG, copy, and stub value copied verbatim from the mockup.
 * No real team API wiring — all handlers are stubs.
 *
 * Sections (in order):
 *   1. Demo banner (non-Business upsell — visible when tier < Business)
 *   2. Seats overview (progress bar, add-seats link)
 *   3. Members table (filter tabs + search + kebab actions)
 *   4. Pending invites
 *   5. Roles & permissions matrix (collapsible)
 *   6. Audit log preview (filterable, last 14 events)
 *   7. SAML SSO / Enterprise card
 *   8. Cross-link footer + help footer
 *
 * Modals (centered, NEVER drawers per feedback_no_right_side_drawers):
 *   - Invite member (email multi-recipient + role + per-page + welcome msg)
 *   - Change role confirm
 *   - Remove member confirm
 *   - Resend invite confirm
 *   - Revoke invite confirm
 *
 * All invite / remove / role-change / resend / revoke actions are stubs:
 *   // TODO: wire to team API
 *
 * DEC trail honoured:
 *   DEC-083          Business $49.99/mo · 10 team members included · cap account-level
 *   DEC-PRICELOCK-01 price-lock-for-life (amber chip on seats card)
 *   AP-031           no sticky upsell banners — only the upgrade card
 *
 * Story: F-APP-SETTINGS-TEAM-001 (#38)
 */

import { useState, useCallback } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type MemberRole = "owner" | "admin" | "editor" | "viewer";
type MemberStatus = "active" | "pending" | "removed";
type MemberFilter = "all" | "active" | "pending" | "removed";

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  status: MemberStatus;
  lastActive: string;
  isYou: boolean;
  bg: string;
  initial: string;
  expiresIn?: string;
}

interface PendingInvite {
  email: string;
  role: MemberRole;
  sent: string;
  expiresIn: string;
}

type AuditAction = "edit" | "publish" | "invite" | "role" | "remove" | "signin" | "billing";
type AuditActorKey = "all" | "alexandra" | "maya" | "alex" | "jordan" | "sam";
type AuditRangeKey = "7d" | "30d" | "90d" | "custom";

interface AuditEvent {
  when: string;
  actor: string;
  bg: string;
  initial: string;
  action: AuditAction;
  label: string;
  target: string;
  ip: string;
  actorKey: AuditActorKey;
}

type ModalId = "invite" | "role" | "remove" | "resend" | "revoke" | null;

// ─── Sample data (verbatim from mockup) ──────────────────────────────────────

const SAMPLE_MEMBERS_5: TeamMember[] = [
  { id: "m1", name: "Alexandra Silva",  email: "alexandra@silva.studio", role: "owner",  status: "active",  lastActive: "now",          isYou: true,  bg: "bg-1", initial: "A" },
  { id: "m2", name: "Maya Patel",       email: "maya@studio.com",        role: "admin",  status: "active",  lastActive: "14 min ago",   isYou: false, bg: "bg-2", initial: "M" },
  { id: "m3", name: "Alex Chen",        email: "alex@chen.dev",          role: "editor", status: "active",  lastActive: "2 hours ago",  isYou: false, bg: "bg-3", initial: "A" },
  { id: "m4", name: "Sam Müller",       email: "sam.m@designstudio.de",  role: "viewer", status: "active",  lastActive: "yesterday",    isYou: false, bg: "bg-4", initial: "S" },
  { id: "m5", name: "Jordan Rivera",    email: "jordan@example.com",     role: "editor", status: "pending", lastActive: "— invited 3d", isYou: false, bg: "bg-5", initial: "J", expiresIn: "4d" },
];

const SAMPLE_PENDING: PendingInvite[] = [
  { email: "jordan@example.com", role: "editor", sent: "3 days ago", expiresIn: "4 days" },
  { email: "taylor@brandco.io",  role: "viewer", sent: "1 hour ago", expiresIn: "7 days" },
];

const SAMPLE_AUDIT: AuditEvent[] = [
  { when: "2026-04-26 14:32", actor: "Maya Patel",      bg: "bg-2", initial: "M", action: "edit",    label: "✎ Edited block",    target: "Blog · \"5 spring rituals\" · headline + image", ip: "78.42.18.4",   actorKey: "maya" },
  { when: "2026-04-26 14:18", actor: "Alex Chen",       bg: "bg-3", initial: "A", action: "publish", label: "🚀 Published page", target: "Press kit · /alexandra/press",                  ip: "92.118.4.230", actorKey: "alex" },
  { when: "2026-04-26 13:45", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "role",    label: "🔁 Changed role",   target: "Sam Müller · Viewer → Editor",                  ip: "212.83.45.9",  actorKey: "alexandra" },
  { when: "2026-04-26 11:02", actor: "Maya Patel",      bg: "bg-2", initial: "M", action: "edit",    label: "✎ Edited block",    target: "Home · Hero text · 2 changes",                  ip: "78.42.18.4",   actorKey: "maya" },
  { when: "2026-04-25 19:50", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "invite",  label: "✉️ Sent invite",    target: "jordan@example.com · Editor",                   ip: "212.83.45.9",  actorKey: "alexandra" },
  { when: "2026-04-25 16:22", actor: "Sam Müller",      bg: "bg-4", initial: "S", action: "edit",    label: "✎ Edited block",    target: "Blog · \"Why I switched stacks\" · body",        ip: "94.231.10.18", actorKey: "sam" },
  { when: "2026-04-25 15:08", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "billing", label: "💳 Updated card",   target: "Stripe Customer Portal · card ending 4242",     ip: "212.83.45.9",  actorKey: "alexandra" },
  { when: "2026-04-25 12:14", actor: "Alex Chen",       bg: "bg-3", initial: "A", action: "edit",    label: "✎ Edited block",    target: "Newsletter · CTA copy + footer link",           ip: "92.118.4.230", actorKey: "alex" },
  { when: "2026-04-24 18:40", actor: "Maya Patel",      bg: "bg-2", initial: "M", action: "publish", label: "🚀 Published page", target: "Blog · \"5 spring rituals\"",                   ip: "78.42.18.4",   actorKey: "maya" },
  { when: "2026-04-24 16:11", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "invite",  label: "✉️ Sent invite",    target: "taylor@brandco.io · Viewer",                    ip: "212.83.45.9",  actorKey: "alexandra" },
  { when: "2026-04-24 14:00", actor: "Sam Müller",      bg: "bg-4", initial: "S", action: "signin",  label: "→ Signed in",        target: "Method: Google OAuth · Berlin, DE",             ip: "94.231.10.18", actorKey: "sam" },
  { when: "2026-04-23 09:38", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "remove",  label: "🗑️ Removed member", target: "former-contractor@old.studio",                  ip: "212.83.45.9",  actorKey: "alexandra" },
  { when: "2026-04-22 21:15", actor: "Maya Patel",      bg: "bg-2", initial: "M", action: "edit",    label: "✎ Edited block",    target: "About · timeline entry · added 2026",           ip: "78.42.18.4",   actorKey: "maya" },
  { when: "2026-04-22 11:42", actor: "Alexandra Silva", bg: "bg-1", initial: "A", action: "role",    label: "🔁 Changed role",   target: "Maya Patel · Editor → Admin",                   ip: "212.83.45.9",  actorKey: "alexandra" },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function rolePillClass(role: MemberRole): string {
  return `role-pill role-${role}`;
}

function rolePillLabel(role: MemberRole): string {
  return ({ owner: "Owner", admin: "Admin", editor: "Editor", viewer: "Viewer" } as const)[role];
}

function auditActionClass(action: AuditAction): string {
  return ({
    edit: "act-edit", publish: "act-publish", invite: "act-invite",
    role: "act-role", remove: "act-remove", signin: "act-signin", billing: "act-billing",
  } as const)[action];
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function RolePill({ role }: { role: MemberRole }) {
  return <span className={rolePillClass(role)}>{rolePillLabel(role)}</span>;
}

function RoleRadioList({
  name,
  selected,
  onSelect,
  includeOwner = false,
}: {
  name: string;
  selected: MemberRole;
  onSelect: (r: MemberRole) => void;
  includeOwner?: boolean;
}) {
  const options: { value: MemberRole; label: string; sub: string; disabled?: boolean }[] = [
    { value: "admin",  label: "Admin",  sub: "Everything except billing & deleting the account." },
    { value: "editor", label: "Editor", sub: "Edit pages, blocks, and publish — no settings." },
    { value: "viewer", label: "Viewer", sub: "Read-only access · perfect for reviewers." },
    ...(includeOwner ? [{
      value: "owner" as MemberRole,
      label: "Owner",
      sub: "Always the account holder · transfer separately.",
      disabled: true,
    }] : []),
  ];
  return (
    <div className="role-radio-list">
      {options.map((opt) => (
        <label
          key={opt.value}
          className={`role-radio${selected === opt.value ? " is-selected" : ""}${opt.disabled ? " disabled" : ""}`}
          title={opt.disabled ? "Owner role is reserved — only one Owner per account; transfer ownership lives on the Account tab." : undefined}
        >
          <input
            type="radio"
            name={name}
            value={opt.value}
            checked={selected === opt.value}
            disabled={opt.disabled}
            onChange={() => { if (!opt.disabled) onSelect(opt.value); }}
          />
          <div className="rr-body">
            <div className="rr-name">
              {opt.label}
              {opt.disabled && (
                <span className="team-chip" style={{ marginLeft: 4, fontSize: "9.5px" }}>reserved</span>
              )}
            </div>
            <div className="rr-sub">{opt.sub}</div>
          </div>
        </label>
      ))}
    </div>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SettingsTeam() {
  // ── Members & filter state ────────────────────────────────────────────────
  const [members]            = useState<TeamMember[]>(SAMPLE_MEMBERS_5);
  const [pending]            = useState<PendingInvite[]>(SAMPLE_PENDING);
  const [memberFilter, setMemberFilter] = useState<MemberFilter>("all");
  const [memberSearch, setMemberSearch] = useState("");

  // ── Permissions matrix ────────────────────────────────────────────────────
  const [matrixOpen, setMatrixOpen] = useState(false);

  // ── Audit log filters ─────────────────────────────────────────────────────
  const [auditRange,  setAuditRange]  = useState<AuditRangeKey>("7d");
  const [auditMember, setAuditMember] = useState<AuditActorKey>("all");
  const [auditAction, setAuditAction] = useState<AuditAction | "all">("all");
  const [auditSearch, setAuditSearch] = useState("");

  // ── Modal state ───────────────────────────────────────────────────────────
  const [openModal, setOpenModal]     = useState<ModalId>(null);

  // Invite modal
  const [inviteEmails,  setInviteEmails]  = useState("maya@studio.com, jordan@example.com");
  const [inviteRole,    setInviteRole]    = useState<MemberRole>("editor");
  const [inviteMessage, setInviteMessage] = useState("Hey! Welcoming you to my team — feel free to start with the Blog page first.");
  const [perPageOn,     setPerPageOn]     = useState(false);
  const [inviteSent,    setInviteSent]    = useState(false);
  const [sentEmails,    setSentEmails]    = useState<string[]>([]);

  // Role modal
  const [roleTarget, setRoleTarget] = useState<{ id: string; name: string; current: MemberRole } | null>(null);
  const [roleNew,    setRoleNew]    = useState<MemberRole>("editor");

  // Remove modal
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);

  // Resend modal
  const [resendEmail, setResendEmail] = useState("");

  // Revoke modal
  const [revokeEmail, setRevokeEmail] = useState("");

  // ── Seats derived ─────────────────────────────────────────────────────────
  const usedSeats      = members.length;         // 5 of 10
  const availableSeats = 10 - usedSeats;         // 5
  const fillPct        = (usedSeats / 10) * 100; // 50%
  const atCap          = usedSeats >= 10;

  // ── Member filtering ──────────────────────────────────────────────────────
  const filteredMembers = members.filter((m) => {
    if (memberFilter !== "all" && m.status !== memberFilter) return false;
    if (memberSearch) {
      const q = memberSearch.toLowerCase();
      if (!m.name.toLowerCase().includes(q) && !m.email.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const countByFilter = {
    all:     members.length,
    active:  members.filter((m) => m.status === "active").length,
    pending: members.filter((m) => m.status === "pending").length,
    removed: members.filter((m) => m.status === "removed").length,
  };

  // ── Audit log filtering ───────────────────────────────────────────────────
  const filteredAudit = SAMPLE_AUDIT.filter((e) => {
    if (auditMember !== "all" && e.actorKey !== auditMember) return false;
    if (auditAction !== "all" && e.action !== auditAction)   return false;
    if (auditSearch) {
      const q = auditSearch.toLowerCase();
      if (!e.target.toLowerCase().includes(q) && !e.actor.toLowerCase().includes(q)) return false;
    }
    void auditRange; // range filter is decorative in stub
    return true;
  });

  // ── Invite modal handlers ─────────────────────────────────────────────────
  const openInviteModal = useCallback(() => {
    if (atCap) return; // TODO: wire to team API
    setInviteSent(false);
    setSentEmails([]);
    setOpenModal("invite");
  }, [atCap]);

  const submitInvites = useCallback(() => {
    const emails = inviteEmails.split(/[,\s\n]+/).map((s) => s.trim()).filter(Boolean);
    if (!emails.length) return;
    // TODO: wire to team API
    // Real impl: POST /api/team/invite { emails, role: inviteRole, perPage, message: inviteMessage }
    setSentEmails(emails);
    setInviteSent(true);
  }, [inviteEmails, inviteRole]);

  const resetInviteForm = useCallback(() => {
    setInviteSent(false);
    setSentEmails([]);
  }, []);

  // ── Role modal handlers ───────────────────────────────────────────────────
  const openRoleModal = useCallback((member: TeamMember) => {
    setRoleTarget({ id: member.id, name: member.name, current: member.role });
    setRoleNew(member.role);
    setOpenModal("role");
  }, []);

  const confirmRoleChange = useCallback(() => {
    // TODO: wire to team API
    // Real impl: POST /api/team/members/<id>/role { role: roleNew }
    setOpenModal(null);
  }, []);

  // ── Remove modal handlers ─────────────────────────────────────────────────
  const openRemoveModal = useCallback((member: TeamMember) => {
    setRemoveTarget({ id: member.id, name: member.name });
    setOpenModal("remove");
  }, []);

  const confirmRemoveMember = useCallback(() => {
    // TODO: wire to team API
    // Real impl: DELETE /api/team/members/<id>
    setOpenModal(null);
  }, []);

  // ── Resend / revoke handlers ──────────────────────────────────────────────
  const openResendModal = useCallback((email: string) => {
    setResendEmail(email);
    setOpenModal("resend");
  }, []);

  const confirmResend = useCallback(() => {
    // TODO: wire to team API
    // Real impl: POST /api/team/invites/resend { email: resendEmail }
    setOpenModal(null);
  }, []);

  const openRevokeModal = useCallback((email: string) => {
    setRevokeEmail(email);
    setOpenModal("revoke");
  }, []);

  const confirmRevoke = useCallback(() => {
    // TODO: wire to team API
    // Real impl: DELETE /api/team/invites { email: revokeEmail }
    setOpenModal(null);
  }, []);

  // ── Kebab menu state ──────────────────────────────────────────────────────
  const [openKebab, setOpenKebab] = useState<string | null>(null);

  const toggleKebab = useCallback((id: string) => {
    setOpenKebab((prev) => (prev === id ? null : id));
  }, []);

  const closeKebab = useCallback(() => setOpenKebab(null), []);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      {/* ============================================================
           SETTINGS CONTENT: TEAM
           ============================================================ */}
      <div
        className="settings-content"
        id="pane-team"
        data-tab="team"
        onClick={closeKebab}
      >
        {/* =====================================================
             DEMO BANNER — visible only when current tier < Business.
             Per feedback_no_blur_premium_features the whole tab stays
             visible + interactive on every tier. Real save / invite
             actions route through TierGate.checkAndProceed.
             ===================================================== */}
        {/* NOTE: banner is hidden by default (Business tier assumed in component).
             TODO: wire demo-banner visibility to real tier from context */}

        {/* =====================================================
             SECTION 1 — Seats overview
             ===================================================== */}
        <div className="settings-section" id="seats-section">
          <div className="settings-section-title with-action">
            <span className="st-left">Seats &amp; usage</span>
            <span
              className="chip locked-life"
              title="DEC-083 · Business price locked at signup forever"
            >
              🔒 Locked at $49.99/mo for life
            </span>
          </div>

          <div className="team-seats-card">
            <div className="sc-text">
              <div className="sc-headline">
                <b>{usedSeats}</b> of 10 team members · <b>{availableSeats}</b> available
              </div>
              <div className="sc-sub">
                Business plan includes 10 members at no extra cost. You&apos;re using half — plenty of room.
              </div>

              <div className="team-seats-foot-links">
                <button
                  onClick={() => {/* TODO: wire to team API — contact support for cap raise */}}
                  className="team-foot-link-btn"
                >
                  Need more than 10? Contact support →
                </button>
                <span className="team-sfl-sep">·</span>
                <a href="/pricing#business">View Business plan benefits</a>
              </div>
            </div>

            <div className="sc-actions">
              <button
                className="btn btn-primary btn-sm mt-invite"
                id="invite-cta"
                onClick={openInviteModal}
                disabled={atCap}
                title={atCap ? "Cap reached — remove a member first or contact support@tadaify.com" : undefined}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Invite member
              </button>
              <button className="btn btn-ghost btn-sm">View audit log ↓</button>
            </div>

            <div className="team-seats-bar-wrap">
              <div
                className="team-seats-bar"
                role="progressbar"
                aria-valuenow={usedSeats}
                aria-valuemin={0}
                aria-valuemax={10}
                aria-label="Team members usage"
              >
                <div
                  className={`team-seats-bar-fill${fillPct >= 80 && fillPct < 100 ? " is-near-cap" : ""}${fillPct >= 100 ? " is-at-cap" : ""}`}
                  style={{ width: `${fillPct}%` }}
                />
              </div>
              <div className="team-seats-bar-meta">
                <span><b>{usedSeats}</b> used · <b>{availableSeats}</b> available</span>
                <span>Cap: 10 (Business plan)</span>
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================
             SECTION 2 — Members
             ===================================================== */}
        <div className="settings-section" id="members-section">
          <div className="settings-section-title with-action">
            <span className="st-left">Members</span>
            <button className="btn btn-primary btn-sm" onClick={openInviteModal}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Invite member
            </button>
          </div>

          <p className="section-help">
            Owner has full access and cannot be changed. Admins can manage everything except the owner;
            Editors can edit pages and blocks; Viewers are read-only.
          </p>

          {/* Toolbar: filter tabs + search */}
          <div className="members-toolbar">
            <span className="team-filter-tabs" role="tablist" aria-label="Filter members">
              {(["all", "active", "pending", "removed"] as MemberFilter[]).map((f) => (
                <button
                  key={f}
                  className={memberFilter === f ? "active" : ""}
                  onClick={() => setMemberFilter(f)}
                >
                  {f.charAt(0).toUpperCase() + f.slice(1)}{" "}
                  <span className="ft-count">{countByFilter[f]}</span>
                </button>
              ))}
            </span>

            <span className="team-search-input">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search by name or email…"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
              />
            </span>

            <span className="mt-spacer" style={{ flex: 1, minWidth: 0 }} />
          </div>

          {/* Members table (visible when state has members) */}
          {filteredMembers.length > 0 ? (
            <div style={{ overflowX: "auto" }}>
              <table className="team-members-table">
                <thead>
                  <tr>
                    <th>Member</th>
                    <th>Role</th>
                    <th>Last active</th>
                    <th>Status</th>
                    <th className="col-actions" />
                  </tr>
                </thead>
                <tbody>
                  {filteredMembers.map((m) => {
                    const avatarCls = `team-member-avatar ${m.bg}${m.status === "pending" ? " is-pending" : ""}`;
                    const initial = m.status === "pending" ? "?" : m.initial;
                    const lastActiveCls = `team-last-active${m.lastActive === "now" || m.lastActive === "just now" ? " is-now" : ""}`;

                    return (
                      <tr key={m.id}>
                        <td>
                          <div className="team-member-id">
                            <div className={avatarCls}>{initial}</div>
                            <div className="mi-meta">
                              {m.isYou ? (
                                <span className="mi-name is-you">
                                  {m.name} <span className="you-pill">You</span>
                                </span>
                              ) : (
                                <span className="mi-name">{m.name}</span>
                              )}
                              <div className="mi-email">{m.email}</div>
                            </div>
                          </div>
                        </td>
                        <td><RolePill role={m.role} /></td>
                        <td><span className={lastActiveCls}>{m.lastActive}</span></td>
                        <td>
                          <div className="team-status-cell">
                            {m.status === "pending" ? (
                              <span className="chip pending">⏳ Pending · expires in {m.expiresIn ?? "7d"}</span>
                            ) : m.status === "removed" ? (
                              <span className="chip">🗑️ Removed</span>
                            ) : (
                              <span className="chip success">● Active</span>
                            )}
                          </div>
                        </td>
                        <td className="col-actions">
                          {m.role === "owner" ? (
                            <button
                              className="iconbtn"
                              title="Owner role — managed on Account tab"
                              disabled
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                              </svg>
                            </button>
                          ) : (
                            <div
                              className="team-kebab-wrap"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <button
                                className="iconbtn"
                                onClick={() => toggleKebab(m.id)}
                                aria-label="Member actions"
                                aria-haspopup="menu"
                              >
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                  <circle cx="12" cy="12" r="1" /><circle cx="12" cy="5" r="1" /><circle cx="12" cy="19" r="1" />
                                </svg>
                              </button>
                              <div className={`team-kebab-menu${openKebab === m.id ? " open" : ""}`} role="menu">
                                {m.status === "pending" ? (
                                  <>
                                    <button onClick={() => { closeKebab(); openResendModal(m.email); }}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" />
                                      </svg>
                                      Resend invite
                                    </button>
                                    <button
                                      className="is-danger"
                                      onClick={() => { closeKebab(); openRevokeModal(m.email); }}
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
                                      </svg>
                                      Revoke invite
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <button onClick={() => { closeKebab(); openRoleModal(m); }}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" />
                                        <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
                                      </svg>
                                      Change role
                                    </button>
                                    <button onClick={() => { closeKebab(); /* TODO: wire to team API — per-page access */ }}>
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                        <polyline points="14 2 14 8 20 8" />
                                      </svg>
                                      Per-page access
                                    </button>
                                    <div className="km-divider" />
                                    <button
                                      className="is-danger"
                                      onClick={() => { closeKebab(); openRemoveModal(m); }}
                                    >
                                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                        <polyline points="3 6 5 6 21 6" />
                                        <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
                                      </svg>
                                      Remove from team
                                    </button>
                                  </>
                                )}
                              </div>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : members.length === 0 ? (
            /* Empty state (no team at all) */
            <div className="team-empty-state">
              <div className="es-emoji" aria-hidden="true">👥</div>
              <div className="es-title">No team members yet</div>
              <div className="es-sub">
                Bring in your team to share editing, publishing, and review work — fully audited and role-scoped.
                Business includes 10 members, no extra cost.
              </div>
              <button className="btn btn-primary es-cta" onClick={openInviteModal}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Invite your first collaborator
              </button>
              <details className="team-use-cases-details">
                <summary>Why work as a team?</summary>
                <div className="team-use-case-grid">
                  <div className="team-use-case"><b>Course creators.</b> Bring in your editor to fix typos and your VA to schedule publishes — without sharing your Owner password.</div>
                  <div className="team-use-case"><b>Agencies.</b> Each client gets a Viewer seat to review pages before launch; your team has Editor access; only Owner sees billing.</div>
                  <div className="team-use-case"><b>Podcast networks.</b> Producers (Editor) can create new episode pages; hosts (Viewer) can preview without breaking anything.</div>
                  <div className="team-use-case"><b>Solo + assistant.</b> Promote your VA to Admin so they can also send invites and manage the team — but never touch billing or delete the account.</div>
                </div>
              </details>
            </div>
          ) : (
            /* No results for this filter/search */
            <div style={{ textAlign: "center", color: "var(--fg-muted)", padding: 28 }}>
              No members match this filter / search.
            </div>
          )}
        </div>

        {/* =====================================================
             SECTION 3 — Pending invites
             ===================================================== */}
        <div className="settings-section" id="pending-section">
          <div className="settings-section-title with-action">
            <span className="st-left">
              Pending invites{" "}
              <span className="chip">{pending.length} sent</span>
            </span>
            <span className="section-help" style={{ margin: 0 }}>
              Invites auto-expire after 7 days · resend or revoke any time.
            </span>
          </div>

          {pending.length > 0 ? (
            <div className="team-pending-list">
              {pending.map((p) => (
                <div key={p.email} className="team-pending-row">
                  <div className="pr-ico" aria-hidden="true">📨</div>
                  <div className="pr-meta">
                    <div className="pr-email">
                      {p.email} · <RolePill role={p.role} />
                    </div>
                    <div className="pr-detail">
                      Sent {p.sent} · <span className="pr-expires">expires in {p.expiresIn}</span>
                    </div>
                  </div>
                  <div className="pr-actions">
                    <button
                      className="btn btn-ghost btn-xs"
                      onClick={() => openResendModal(p.email)}
                    >
                      Resend
                    </button>
                    <button
                      className="btn btn-danger-ghost btn-xs"
                      onClick={() => openRevokeModal(p.email)}
                    >
                      Revoke
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div
              className="team-pending-empty"
              style={{ padding: 18, borderStyle: "solid", background: "var(--bg-elevated)" }}
            >
              <div className="es-sub" style={{ margin: 0 }}>
                No pending invites — everyone you invited has joined.
              </div>
            </div>
          )}
        </div>

        {/* =====================================================
             SECTION 4 — Roles + permissions matrix
             ===================================================== */}
        <div className="settings-section" id="permissions-section">
          <div className="settings-section-title">
            <span className="st-left">Roles &amp; permissions</span>
          </div>

          <p className="section-help">
            What each role can do in your tadaify account. Owner is always you and cannot be changed.
            Promote to Admin only when you trust full account access (except deleting the account itself).
          </p>

          <button
            type="button"
            className={`team-matrix-toggle${matrixOpen ? " open" : ""}`}
            onClick={() => setMatrixOpen((v) => !v)}
            aria-expanded={matrixOpen}
            aria-controls="team-matrix-wrap"
          >
            <span className="mt-caret">›</span>{" "}
            {matrixOpen ? "Hide full permissions matrix" : "Show full permissions matrix"}
          </button>

          <div
            className={`team-matrix-wrap${matrixOpen ? " open" : ""}`}
            id="team-matrix-wrap"
            role="region"
            aria-label="Roles and permissions matrix"
          >
            <table className="team-matrix-table">
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Owner</th>
                  <th>Admin</th>
                  <th>Editor</th>
                  <th>Viewer</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { action: "View pages and blocks",               o: true,  a: true,  e: true,  v: true  },
                  { action: "Edit blocks",                          o: true,  a: true,  e: true,  v: false },
                  { action: "Create / delete pages",               o: true,  a: true,  e: true,  v: false },
                  { action: "Publish + unpublish",                  o: true,  a: true,  e: true,  v: false },
                  { action: "Manage custom domains",               o: true,  a: true,  e: false, v: false },
                  { action: "Manage account & security settings",  o: true,  a: true,  e: false, v: false },
                  { action: "Manage team (invite / remove / change role)", o: true, a: true, e: false, v: false },
                  { action: "Manage billing & payment method",     o: true,  a: false, e: false, v: false },
                  { action: "Delete account",                      o: true,  a: false, e: false, v: false },
                  { action: "View audit log",                      o: true,  a: true,  e: "partial", v: false },
                ].map((row) => (
                  <tr key={row.action}>
                    <td>{row.action}</td>
                    {([row.o, row.a, row.e, row.v] as (boolean | "partial")[]).map((val, i) => (
                      <td key={i}>
                        {val === true    ? <span className="yes">✓</span> :
                         val === "partial" ? <span className="partial" title="Editors see only their own actions">partial</span> :
                         <span className="no">✗</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* =====================================================
             SECTION 5 — Audit log preview
             ===================================================== */}
        <div className="settings-section" id="audit-section">
          <div className="settings-section-title with-action">
            <span className="st-left">
              Audit log{" "}
              <span className="chip">last {SAMPLE_AUDIT.length} events</span>
            </span>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {/* TODO: wire to team API — export audit CSV */}}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export CSV
            </button>
          </div>

          <p className="section-help">
            Every meaningful action by team members. Stored 90 days · longer retention available on Enterprise.
            Export filters to your selected range.
          </p>

          <div className="team-audit-toolbar">
            <span className="team-audit-filter-group">
              Range:
              <select
                value={auditRange}
                onChange={(e) => setAuditRange(e.target.value as AuditRangeKey)}
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="custom">Custom…</option>
              </select>
            </span>

            <span className="team-audit-filter-group">
              Member:
              <select
                value={auditMember}
                onChange={(e) => setAuditMember(e.target.value as AuditActorKey)}
              >
                <option value="all">All members</option>
                <option value="alexandra">Alexandra Silva (you)</option>
                <option value="maya">Maya Patel</option>
                <option value="alex">Alex Chen</option>
                <option value="jordan">Jordan Rivera</option>
                <option value="sam">Sam Müller</option>
              </select>
            </span>

            <span className="team-audit-filter-group">
              Action:
              <select
                value={auditAction}
                onChange={(e) => setAuditAction(e.target.value as AuditAction | "all")}
              >
                <option value="all">All actions</option>
                <option value="edit">Edits</option>
                <option value="publish">Publishes</option>
                <option value="invite">Invites</option>
                <option value="role">Role changes</option>
                <option value="remove">Removals</option>
                <option value="signin">Sign-ins</option>
                <option value="billing">Billing</option>
              </select>
            </span>

            <span className="team-audit-spacer" />

            <span className="team-search-input" style={{ maxWidth: 240 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="search"
                placeholder="Search target…"
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
              />
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <table className="team-audit-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Member</th>
                  <th>Action</th>
                  <th>Target</th>
                  <th>IP</th>
                </tr>
              </thead>
              <tbody>
                {filteredAudit.length > 0 ? (
                  filteredAudit.map((e, idx) => (
                    <tr key={idx}>
                      <td><span className="audit-when">{e.when}</span></td>
                      <td>
                        <div className="audit-actor">
                          <div className={`team-member-avatar ${e.bg}`} style={{ width: 24, height: 24, fontSize: 11 }}>
                            {e.initial}
                          </div>
                          <span>{e.actor}</span>
                        </div>
                      </td>
                      <td>
                        <span className={`audit-action ${auditActionClass(e.action)}`}>
                          {e.label}
                        </span>
                      </td>
                      <td>
                        <span className="audit-target" title={e.target}>
                          {e.target}
                        </span>
                      </td>
                      <td><span className="audit-ip">{e.ip}</span></td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ textAlign: "center", color: "var(--fg-muted)", padding: 24 }}>
                      No events match your filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="team-audit-footer">
            <span className="af-count">
              Showing <b>{filteredAudit.length}</b> of <b>214</b> events
            </span>
            <a
              href="/app/team/audit-log"
              className="btn btn-ghost btn-sm"
              onClick={(e) => { e.preventDefault(); /* TODO: wire to team API — full audit log page */ }}
            >
              Open full audit log →
            </a>
          </div>
        </div>

        {/* =====================================================
             SECTION 6 — SAML SSO / Enterprise
             ===================================================== */}
        <div className="settings-section" id="sso-section">
          <div className="settings-section-title">
            <span className="st-left">Single sign-on (SAML)</span>
          </div>

          <div className="team-sso-card">
            <div className="sso-ico" aria-hidden="true">🔐</div>
            <div className="sso-meta">
              <div className="sm-title">
                SAML SSO via Okta, Google Workspace, Azure AD, or any IdP{" "}
                <span className="chip business">Enterprise</span>
              </div>
              <div className="sm-sub">
                Available on the Enterprise plan. SCIM provisioning, custom domain login, JIT user creation,
                and audit log retention beyond 90 days. Get in touch — we set it up with you.
              </div>
            </div>
            <div className="sso-actions">
              <a
                href="mailto:enterprise@tadaify.com?subject=SAML%20SSO%20setup"
                className="btn btn-ghost btn-sm"
              >
                Talk to sales →
              </a>
            </div>
          </div>
        </div>

        {/* Cross-link footer */}
        <div className="cross-link-row" style={{ marginTop: 18 }}>
          <span className="cl-ico" aria-hidden="true">🛡️</span>
          <span>
            Looking for personal security (password / 2FA / sessions)? Those live on the{" "}
            <a href="/app?tab=settings&subtab=security" className="cl-link" style={{ color: "var(--brand-primary)" }}>
              Security tab →
            </a>{" "}
            Looking to delete the whole account? See{" "}
            <a href="/app?tab=settings&subtab=danger" className="cl-link" style={{ color: "var(--danger)" }}>
              Danger zone →
            </a>{" "}
            (only the Owner can do this).
          </span>
        </div>

        {/* Help footer */}
        <div className="help-footer">
          <p>
            Team is included on the <b>Business plan ($49.99/mo)</b> with up to 10 members at no extra cost —{" "}
            see <a href="/pricing#business">pricing</a> · need more?{" "}
            <a href="mailto:support@tadaify.com?subject=Raise%20team%20cap%20above%2010">support@tadaify.com</a>
            <br />
            DEC-083 · DEC-PRICELOCK-01 · Audit log retention 90 days (Enterprise: longer) · GDPR-compliant data processing.
          </p>
        </div>
      </div>

      {/* ============================================================
           MODAL — Invite member (centered, NEVER drawer)
           ============================================================ */}
      {openModal === "invite" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="invite-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal modal-md">
            {!inviteSent ? (
              /* Invite form */
              <div className="invite-form">
                <h3 id="invite-modal-title">
                  <span aria-hidden="true">✉️</span> Invite team members
                </h3>
                <p className="modal-sub">
                  Send up to 5 invites at once · invitees get a magic-link email and join when they click.
                  Cap counts pending invites against your 10-member limit.
                </p>

                <div className="field-row">
                  <label htmlFor="invite-emails">
                    Email addresses{" "}
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>— comma separated, max 5</span>
                  </label>
                  <textarea
                    id="invite-emails"
                    className="field-input"
                    rows={2}
                    placeholder="maya@studio.com, jordan@example.com"
                    value={inviteEmails}
                    onChange={(e) => setInviteEmails(e.target.value)}
                  />
                  <div className="field-help">
                    2 valid recipients · 3 more allowed in this batch.
                  </div>
                </div>

                <div className="field-row">
                  <label>Role for these invites</label>
                  <RoleRadioList
                    name="invite-role"
                    selected={inviteRole}
                    onSelect={setInviteRole}
                    includeOwner
                  />
                </div>

                {/* Per-page access: Business sub-feature */}
                <div className="team-pro-section">
                  <div className="pro-section-head">
                    <span className="pro-section-title">
                      Restrict to specific pages{" "}
                      <span className="chip business" style={{ fontSize: "9.5px" }}>Business</span>
                    </span>
                    <button
                      type="button"
                      className={`toggle${perPageOn ? " on" : ""}`}
                      onClick={() => setPerPageOn((v) => !v)}
                      aria-pressed={perPageOn}
                      aria-label="Restrict per page"
                    />
                  </div>
                  <p className="field-help" style={{ marginTop: 0, marginBottom: 10 }}>
                    By default new members can edit every page. Turn this on to scope them to a subset
                    — useful when contractors only need to touch one page (e.g. a shop manager who only edits Products).
                  </p>
                  {perPageOn && (
                    <div className="team-per-page-list">
                      {[
                        { name: "Home",       path: "/alexandra" },
                        { name: "Blog",       path: "/alexandra/blog" },
                        { name: "Press kit",  path: "/alexandra/press" },
                        { name: "Shop",       path: "/alexandra/shop" },
                        { name: "Newsletter", path: "/alexandra/subscribe" },
                        { name: "Booking",    path: "/alexandra/book" },
                      ].map((page) => (
                        <label key={page.path} className="team-per-page-row">
                          <input type="checkbox" defaultChecked={page.name === "Home"} />
                          <span className="pp-name">{page.name}</span>
                          <span className="pp-meta">{page.path}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                <div className="field-row">
                  <label htmlFor="invite-message">
                    Custom welcome message{" "}
                    <span style={{ color: "var(--fg-subtle)", fontWeight: 400 }}>— optional</span>
                  </label>
                  <textarea
                    id="invite-message"
                    className="field-input"
                    rows={3}
                    placeholder="Hey! Welcoming you to my team — feel free to start with the Blog page first."
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                  />
                  <div className="field-help">
                    Appears at the top of the invitation email · plain text · 240 char max.
                  </div>
                </div>

                <div className="modal-actions">
                  <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={submitInvites}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <line x1="22" y1="2" x2="11" y2="13" />
                      <polygon points="22 2 15 22 11 13 2 9 22 2" />
                    </svg>
                    Send invites
                  </button>
                </div>
              </div>
            ) : (
              /* Success state */
              <div className="team-invite-success">
                <div className="is-icon" aria-hidden="true">✓</div>
                <div className="is-title">
                  {sentEmails.length} invite{sentEmails.length === 1 ? "" : "s"} sent
                </div>
                <div className="is-sub">
                  They&apos;ll show up as Pending below until they click and join.
                </div>
                <ul className="is-list">
                  {sentEmails.map((email) => (
                    <li key={email}>
                      <span aria-hidden="true">📨</span>{" "}
                      <b>{email}</b> · {rolePillLabel(inviteRole)} · expires in 7 days
                    </li>
                  ))}
                </ul>
                <div className="modal-actions" style={{ justifyContent: "center" }}>
                  <button className="btn btn-ghost btn-sm" onClick={resetInviteForm}>
                    Invite more
                  </button>
                  <button className="btn btn-primary btn-sm" onClick={() => setOpenModal(null)}>
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Change role
           ============================================================ */}
      {openModal === "role" && roleTarget && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="role-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal">
            <h3 id="role-modal-title">
              <span aria-hidden="true">🔁</span> Change role for {roleTarget.name}
            </h3>
            <p className="modal-sub">
              Current role: <b>{rolePillLabel(roleTarget.current)}</b>.
              Pick a new role — change applies immediately and is logged in the audit log.
            </p>

            <RoleRadioList
              name="new-role"
              selected={roleNew}
              onSelect={setRoleNew}
            />

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={confirmRoleChange}>
                Update role
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Remove member
           ============================================================ */}
      {openModal === "remove" && removeTarget && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="remove-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal">
            <h3 id="remove-modal-title">
              <span aria-hidden="true">🗑️</span> Remove {removeTarget.name} from your team?
            </h3>
            <p className="modal-sub">
              They lose access immediately on their next page load. Pages and blocks they created stay — ownership
              transfers to <b>you</b>. This action is logged.
            </p>

            <div className="team-remove-warning">
              <b>This frees one seat</b> — you&apos;ll be able to invite a replacement right after.
            </div>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmRemoveMember}>
                Remove member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Resend invite
           ============================================================ */}
      {openModal === "resend" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="resend-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal">
            <h3 id="resend-modal-title">
              <span aria-hidden="true">📨</span> Resend invitation
            </h3>
            <p className="modal-sub">
              Send a fresh magic link to <b>{resendEmail}</b>. The old link is invalidated immediately and a new
              7-day window starts.
            </p>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Cancel
              </button>
              <button className="btn btn-primary btn-sm" onClick={confirmResend}>
                Resend invite
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================
           MODAL — Revoke invite
           ============================================================ */}
      {openModal === "revoke" && (
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal
          aria-labelledby="revoke-modal-title"
          onClick={(e) => { if (e.target === e.currentTarget) setOpenModal(null); }}
        >
          <div className="modal">
            <h3 id="revoke-modal-title">
              <span aria-hidden="true">⛔</span> Revoke pending invite?
            </h3>
            <p className="modal-sub">
              The link sent to <b>{revokeEmail}</b> stops working — they&apos;ll see an &quot;invitation expired&quot;
              page if they try. The seat is freed immediately.
            </p>

            <div className="modal-actions">
              <button className="btn btn-ghost btn-sm" onClick={() => setOpenModal(null)}>
                Cancel
              </button>
              <button className="btn btn-danger btn-sm" onClick={confirmRevoke}>
                Revoke invite
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
