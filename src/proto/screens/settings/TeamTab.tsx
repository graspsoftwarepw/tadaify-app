/**
 * Settings · Team tab (Business) — seats overview, a filterable + searchable
 * members table, pending invites, the roles/permissions matrix, an audit-log
 * preview with range/member/action filters, and the SAML SSO / Enterprise card.
 * Faithful port of mockups/tadaify-mvp/app-settings-team.html, composed on the
 * shared SettingsShell primitives.
 *
 * This is a premium tab: per the prototype's no-blur rule the whole surface is
 * shown fully and stays interactive, with an inline Business tier chip and a
 * demonstration strip; the gate is mocked. Team actions apply immediately, so
 * the tab never raises the shell save-bar — every editor opens a centred
 * SettingsModal that closes on Escape / backdrop / Cancel: invite members,
 * change role, remove member, resend invite, and revoke invite. All side
 * effects (send invites, change role, remove, export CSV) are mocked with an
 * alert — no dead links. Data comes from the typed teamFixture.
 *
 * @implements fr-settings
 */
import { useState } from "react";
import { SettingsSection, SettingsModal } from "./SettingsShell";
import { SettingsIcon as S } from "./SettingsShell";
import { teamFixture, type AuditEvent, type MatrixRow, type MemberRole, type TeamMember } from "./teamFixture";

type MemberFilter = "all" | "active" | "pending" | "removed";

type Modal =
  | null
  | "invite"
  | { kind: "role"; member: TeamMember }
  | { kind: "remove"; member: TeamMember }
  | { kind: "resend"; email: string }
  | { kind: "revoke"; email: string };

const mock = (msg: string) => () => alert(msg);

const ROLE_LABEL: Record<MemberRole, string> = { owner: "Owner", admin: "Admin", editor: "Editor", viewer: "Viewer" };

function RolePill({ role }: { role: MemberRole }) {
  return <span className={`role-pill role-${role}`}>{ROLE_LABEL[role]}</span>;
}

function matrixCell(v: boolean | "partial") {
  if (v === "partial") return <span className="mx-partial" title="Editors see only their own actions">partial</span>;
  return v ? <span className="mx-yes">✓</span> : <span className="mx-no">✗</span>;
}

export function TeamTab() {
  const fx = teamFixture();
  const [modal, setModal] = useState<Modal>(null);
  const [filter, setFilter] = useState<MemberFilter>("all");
  const [search, setSearch] = useState("");
  const [matrixOpen, setMatrixOpen] = useState(false);
  const [auditMember, setAuditMember] = useState("all");
  const [auditAction, setAuditAction] = useState("all");
  const [auditSearch, setAuditSearch] = useState("");

  const close = () => setModal(null);

  const counts = {
    all: fx.members.length,
    active: fx.members.filter((m) => m.status === "active").length,
    pending: fx.members.filter((m) => m.status === "pending").length,
    removed: fx.members.filter((m) => m.status === "removed").length,
  };

  const shownMembers = fx.members
    .filter((m) => filter === "all" || m.status === filter)
    .filter((m) => {
      const q = search.trim().toLowerCase();
      return !q || m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q);
    });

  const shownAudit = fx.audit.filter((e: AuditEvent) => {
    if (auditMember !== "all" && e.actorKey !== auditMember) return false;
    if (auditAction !== "all" && e.action !== auditAction) return false;
    const q = auditSearch.trim().toLowerCase();
    if (q && !e.target.toLowerCase().includes(q) && !e.actor.toLowerCase().includes(q)) return false;
    return true;
  });

  const seatsPct = Math.round((fx.seatsUsed / fx.seatsCap) * 100);

  return (
    <>
      {/* Demo strip (premium: no blur, fully interactive) */}
      <div className="demo-mode-strip">
        <span className="dms-ico" aria-hidden>
          ⭐
        </span>
        <div>
          <b>Team is part of Business · $49.99/mo.</b> You're previewing with sample data — invites and role changes are mocked. Upgrade to
          Business for 10 included members, audit log, and SAML SSO.
        </div>
      </div>

      {/* Section 1 — Seats & usage */}
      <SettingsSection
        title="Seats & usage"
        action={<span className="chip locked-life">🔒 Locked at $49.99/mo for life</span>}
      >
        <div className="seats-card">
          <div className="sc-text">
            <div className="sc-headline">
              <b>{fx.seatsUsed}</b> of {fx.seatsCap} team members · <b>{fx.seatsCap - fx.seatsUsed}</b> available
            </div>
            <div className="sc-sub">Business plan includes {fx.seatsCap} members at no extra cost. You're using half — plenty of room.</div>
            <div className="seats-foot-links">
              <button type="button" onClick={mock("Mockup — would email support to raise the cap above 10")}>
                Need more than 10? Contact support →
              </button>
            </div>
          </div>
          <div className="sc-actions">
            <button className="btn btn-primary btn-sm" type="button" onClick={() => setModal("invite")}>
              + Invite member
            </button>
          </div>
          <div className="seats-bar-wrap">
            <div className="seats-bar" role="progressbar" aria-valuenow={fx.seatsUsed} aria-valuemin={0} aria-valuemax={fx.seatsCap}>
              <div className="seats-bar-fill" style={{ width: `${seatsPct}%` }} />
            </div>
            <div className="seats-bar-meta">
              <span>
                <b>{fx.seatsUsed}</b> used · <b>{fx.seatsCap - fx.seatsUsed}</b> available
              </span>
              <span>Cap: {fx.seatsCap} (Business plan)</span>
            </div>
          </div>
        </div>
      </SettingsSection>

      {/* Section 2 — Members */}
      <SettingsSection
        title={
          <>
            Members <span className="chip business sec-tier-pill">Business</span>
          </>
        }
        action={
          <button className="btn btn-primary btn-sm" type="button" onClick={() => setModal("invite")}>
            + Invite member
          </button>
        }
      >
        <p className="section-help">
          Owner has full access and cannot be changed. Admins can manage everything except the owner; Editors can edit pages and blocks;
          Viewers are read-only.
        </p>
        <div className="members-toolbar">
          <span className="filter-tabs" role="tablist" aria-label="Filter members">
            {(["all", "active", "pending", "removed"] as const).map((f) => (
              <button
                key={f}
                type="button"
                role="tab"
                aria-selected={filter === f}
                className={filter === f ? "active" : ""}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)} <span className="ft-count">{counts[f]}</span>
              </button>
            ))}
          </span>
          <span className="search-input">
            <S w={15}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </S>
            <input
              type="search"
              placeholder="Search by name or email…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </span>
        </div>
        <div className="table-scroll">
          <table className="members-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Last active</th>
                <th>Status</th>
                <th className="ta-right" />
              </tr>
            </thead>
            <tbody>
              {shownMembers.map((m) => (
                <tr key={m.id}>
                  <td>
                    <div className="member-cell">
                      <span className={`member-avatar ${m.bg}`} aria-hidden>
                        {m.initial}
                      </span>
                      <span className="mc-text">
                        <span className="mc-name">
                          {m.name}
                          {m.isYou && <span className="mc-you">you</span>}
                        </span>
                        <span className="mc-email">{m.email}</span>
                      </span>
                    </div>
                  </td>
                  <td>
                    <RolePill role={m.role} />
                  </td>
                  <td>
                    <span className={`last-active${m.lastActive === "now" ? " is-now" : ""}`}>{m.lastActive}</span>
                  </td>
                  <td>
                    {m.status === "pending" ? (
                      <span className="chip pending">⏳ Pending · expires in {m.expiresIn}</span>
                    ) : m.status === "removed" ? (
                      <span className="chip">🗑️ Removed</span>
                    ) : (
                      <span className="chip success">● Active</span>
                    )}
                  </td>
                  <td className="ta-right">
                    {m.role === "owner" ? (
                      <span className="member-owner-note">Owner</span>
                    ) : m.status === "pending" ? (
                      <span className="member-row-actions">
                        <button className="btn btn-ghost btn-xs" type="button" onClick={() => setModal({ kind: "resend", email: m.email })}>
                          Resend
                        </button>
                        <button
                          className="btn btn-danger-ghost btn-xs"
                          type="button"
                          onClick={() => setModal({ kind: "revoke", email: m.email })}
                        >
                          Revoke
                        </button>
                      </span>
                    ) : (
                      <span className="member-row-actions">
                        <button className="btn btn-ghost btn-xs" type="button" onClick={() => setModal({ kind: "role", member: m })}>
                          Change role
                        </button>
                        <button
                          className="btn btn-danger-ghost btn-xs"
                          type="button"
                          onClick={() => setModal({ kind: "remove", member: m })}
                        >
                          Remove
                        </button>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {shownMembers.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No members match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </SettingsSection>

      {/* Section 3 — Pending invites */}
      <SettingsSection
        title={
          <>
            Pending invites <span className="chip">{fx.pending.length} sent</span>
          </>
        }
        lede="Invites auto-expire after 7 days · resend or revoke any time."
      >
        <div className="pending-list">
          {fx.pending.map((p) => (
            <div key={p.email} className="pending-row">
              <div className="pr-ico" aria-hidden>
                📨
              </div>
              <div className="pr-meta">
                <div className="pr-email">
                  {p.email} · <RolePill role={p.role} />
                </div>
                <div className="pr-detail">
                  Sent {p.sent} · <span className="pr-expires">expires in {p.expiresIn}</span>
                </div>
              </div>
              <div className="pr-actions">
                <button className="btn btn-ghost btn-xs" type="button" onClick={() => setModal({ kind: "resend", email: p.email })}>
                  Resend
                </button>
                <button className="btn btn-danger-ghost btn-xs" type="button" onClick={() => setModal({ kind: "revoke", email: p.email })}>
                  Revoke
                </button>
              </div>
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Section 4 — Roles & permissions */}
      <SettingsSection title="Roles & permissions">
        <p className="section-help">
          What each role can do in your tadaify account. Owner is always you and cannot be changed. Promote to Admin only when you trust full
          account access (except deleting the account itself).
        </p>
        <button type="button" className="compare-toggle" aria-expanded={matrixOpen} onClick={() => setMatrixOpen((v) => !v)}>
          <span className={`ct-caret${matrixOpen ? " is-open" : ""}`}>›</span> Show full permissions matrix
        </button>
        {matrixOpen && (
          <div className="table-scroll">
            <table className="matrix-table">
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
                {fx.matrix.map((r: MatrixRow) => (
                  <tr key={r.action}>
                    <td>{r.action}</td>
                    <td>{matrixCell(r.owner)}</td>
                    <td>{matrixCell(r.admin)}</td>
                    <td>{matrixCell(r.editor)}</td>
                    <td>{matrixCell(r.viewer)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </SettingsSection>

      {/* Section 5 — Audit log */}
      <SettingsSection
        title={
          <>
            Audit log <span className="chip">last {fx.audit.length} events</span>
          </>
        }
        action={
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would export the audit log as CSV")}>
            Export CSV
          </button>
        }
      >
        <p className="section-help">
          Every meaningful action by team members. Stored 90 days · longer retention available on Enterprise. Export filters to your selected
          range.
        </p>
        <div className="audit-toolbar">
          <select className="field-select" defaultValue="7d" aria-label="Range">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <select className="field-select" value={auditMember} onChange={(e) => setAuditMember(e.target.value)} aria-label="Member">
            <option value="all">All members</option>
            <option value="alexandra">Alexandra Silva (you)</option>
            <option value="maya">Maya Patel</option>
            <option value="alex">Alex Chen</option>
            <option value="sam">Sam Müller</option>
          </select>
          <select className="field-select" value={auditAction} onChange={(e) => setAuditAction(e.target.value)} aria-label="Action">
            <option value="all">All actions</option>
            <option value="edit">Edits</option>
            <option value="publish">Publishes</option>
            <option value="invite">Invites</option>
            <option value="role">Role changes</option>
            <option value="remove">Removals</option>
            <option value="signin">Sign-ins</option>
            <option value="billing">Billing</option>
          </select>
          <span className="search-input">
            <S w={15}>
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </S>
            <input type="search" placeholder="Search target…" value={auditSearch} onChange={(e) => setAuditSearch(e.target.value)} />
          </span>
        </div>
        <div className="table-scroll">
          <table className="audit-table">
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
              {shownAudit.map((e) => (
                <tr key={e.id}>
                  <td className="mono">{e.when}</td>
                  <td>
                    <div className="member-cell">
                      <span className={`member-avatar sm ${e.bg}`} aria-hidden>
                        {e.initial}
                      </span>
                      {e.actor}
                    </div>
                  </td>
                  <td>
                    <span className={`audit-action act-${e.action}`}>{e.label}</span>
                  </td>
                  <td>{e.target}</td>
                  <td className="mono">{e.ip}</td>
                </tr>
              ))}
              {shownAudit.length === 0 && (
                <tr>
                  <td colSpan={5} className="table-empty">
                    No events match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="invoices-footer">
          <span className="it-count">
            Showing <b>{shownAudit.length}</b> of <b>{fx.auditTotal}</b> events
          </span>
          <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would open the full paginated audit log")}>
            Open full audit log →
          </button>
        </div>
      </SettingsSection>

      {/* Section 6 — SAML SSO */}
      <SettingsSection title="Single sign-on (SAML)">
        <div className="sso-card">
          <div className="sso-ico" aria-hidden>
            🔐
          </div>
          <div className="sso-meta">
            <div className="sm-title">
              SAML SSO via Okta, Google Workspace, Azure AD, or any IdP <span className="chip business">Enterprise</span>
            </div>
            <div className="sm-sub">
              Available on the Enterprise plan. SCIM provisioning, custom domain login, JIT user creation, and audit log retention beyond 90
              days. Get in touch — we set it up with you.
            </div>
          </div>
          <div className="sso-actions">
            <button className="btn btn-ghost btn-sm" type="button" onClick={mock("Mockup — would email enterprise@tadaify.com")}>
              Talk to sales →
            </button>
          </div>
        </div>
      </SettingsSection>

      {/* ── Modals ── */}
      {modal === "invite" && (
        <SettingsModal
          title="✉️ Invite team members"
          sub="Send up to 5 invites at once · invitees get a magic-link email and join when they click. Pending invites count against your 10-member limit."
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert("Mockup — would email magic-link invites and add them as Pending");
                close();
              }}
            >
              Send invites
            </button>
          }
        >
          <label className="modal-field-label">Email addresses — comma separated, max 5</label>
          <textarea className="field-input" rows={2} placeholder="maya@studio.com, jordan@example.com" />
          <label className="modal-field-label">Role for these invites</label>
          <div className="role-radio-list">
            {(
              [
                ["admin", "Admin", "Everything except billing & deleting the account."],
                ["editor", "Editor", "Edit pages, blocks, and publish — no settings."],
                ["viewer", "Viewer", "Read-only access · perfect for reviewers."],
              ] as const
            ).map(([value, name, sub], i) => (
              <label key={value} className="role-radio">
                <input type="radio" name="invite-role" value={value} defaultChecked={i === 1} />
                <span className="rr-body">
                  <span className="rr-name">{name}</span>
                  <span className="rr-sub">{sub}</span>
                </span>
              </label>
            ))}
          </div>
          <label className="modal-field-label">Custom welcome message — optional</label>
          <textarea className="field-input" rows={2} placeholder="Hey! Welcoming you to my team — start with the Blog page first." />
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "role" && (
        <SettingsModal
          title={`🔁 Change role for ${modal.member.name}`}
          sub={`Current role: ${ROLE_LABEL[modal.member.role]}. Change applies immediately and is logged in the audit log.`}
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would change ${modal.member.name}'s role`);
                close();
              }}
            >
              Update role
            </button>
          }
        >
          <div className="role-radio-list">
            {(
              [
                ["admin", "Admin", "Manage team, settings & everything except billing."],
                ["editor", "Editor", "Edit pages, blocks, and publish."],
                ["viewer", "Viewer", "Read-only."],
              ] as const
            ).map(([value, name, sub]) => (
              <label key={value} className="role-radio">
                <input type="radio" name="new-role" value={value} defaultChecked={value === modal.member.role} />
                <span className="rr-body">
                  <span className="rr-name">{name}</span>
                  <span className="rr-sub">{sub}</span>
                </span>
              </label>
            ))}
          </div>
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "remove" && (
        <SettingsModal
          title={`🗑️ Remove ${modal.member.name} from your team?`}
          sub="They lose access immediately on their next page load. Pages and blocks they created stay — ownership transfers to you. This action is logged."
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would remove ${modal.member.name} and free one seat`);
                close();
              }}
            >
              Remove member
            </button>
          }
        >
          <div className="modal-warning">
            <b>This frees one seat</b> — you'll be able to invite a replacement right after.
          </div>
        </SettingsModal>
      )}

      {modal && typeof modal === "object" && modal.kind === "resend" && (
        <SettingsModal
          title="📨 Resend invitation"
          sub={`Send a fresh magic link to ${modal.email}. The old link is invalidated immediately and a new 7-day window starts.`}
          onClose={close}
          confirm={
            <button
              className="btn btn-primary btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would resend the invite to ${modal.email}`);
                close();
              }}
            >
              Resend invite
            </button>
          }
        />
      )}

      {modal && typeof modal === "object" && modal.kind === "revoke" && (
        <SettingsModal
          title="⛔ Revoke pending invite?"
          sub={`The link sent to ${modal.email} stops working — they'll see an "invitation expired" page if they try. The seat is freed immediately.`}
          onClose={close}
          confirm={
            <button
              className="btn btn-danger btn-sm"
              type="button"
              onClick={() => {
                alert(`Mockup — would revoke the invite to ${modal.email}`);
                close();
              }}
            >
              Revoke invite
            </button>
          }
        />
      )}
    </>
  );
}
