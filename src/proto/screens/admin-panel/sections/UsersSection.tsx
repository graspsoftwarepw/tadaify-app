/**
 * Platform-admin "Users" pane: searchable, filterable creator table with
 * bulk-select, per-row kebab action menus, and pagination. Faithful port of
 * the #pane-users section of mockups/tadaify-mvp/admin-panel.html.
 *
 * Cross-section jumps (audit log, moderation reports) route through
 * onNavigate; user-detail / takedown / hard-delete / comp-upgrade actions
 * route through the centrally-rendered admin modals via openModal. All
 * non-navigating mock actions surface a prototype alert or flip local state.
 *
 * @implements fr-admin-panel
 */
import { useState } from "react";

import type { SectionProps } from "../adminPanelTypes";
import type { UserRow, UserRowAction, UserTier } from "./usersSectionFixture";
import {
  userDomainFilterOptions,
  userRowsFixture,
  userSignupFilterOptions,
  userStatusFilterOptions,
  userStripeFilterOptions,
  userTierFilterOptions,
} from "./usersSectionFixture";

const TIER_CHIP: Record<UserTier, string> = {
  Free: "tier-free",
  Creator: "tier-creator",
  Pro: "tier-pro",
  Business: "tier-business",
};

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
const LoginIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
    <polyline points="10 17 15 12 10 7" />
    <line x1="15" y1="12" x2="3" y2="12" />
  </svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="11" width="18" height="11" rx="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const MailIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
    <polyline points="22,6 12,13 2,6" />
  </svg>
);
const RefundIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="1 4 1 10 7 10" />
    <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
  </svg>
);
const StarIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
  </svg>
);
const SuspendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" />
  </svg>
);
const UnsuspendIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const AuditIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10" />
    <polyline points="12 6 12 12 16 14" />
  </svg>
);
const ModerationIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
  </svg>
);
const TrashIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" />
  </svg>
);

export function UsersSection({ onNavigate, openModal }: SectionProps) {
  const rows = userRowsFixture();
  const [search, setSearch] = useState("");
  const [tierFilter, setTierFilter] = useState(0);
  const [statusFilter, setStatusFilter] = useState(0);
  const [signupFilter, setSignupFilter] = useState(0);
  const [domainFilter, setDomainFilter] = useState(0);
  const [stripeFilter, setStripeFilter] = useState(0);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [allOn, setAllOn] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const clearFilters = () => {
    setSearch("");
    setTierFilter(0);
    setStatusFilter(0);
    setSignupFilter(0);
    setDomainFilter(0);
    setStripeFilter(0);
  };

  const toggleRow = (handle: string) =>
    setSelected((prev) => ({ ...prev, [handle]: !prev[handle] }));

  const toggleAll = () => {
    const next = !allOn;
    setAllOn(next);
    const map: Record<string, boolean> = {};
    if (next) for (const r of rows) map[r.handle] = true;
    setSelected(map);
  };

  const selectedCount = Object.values(selected).filter(Boolean).length;
  const toggleMenu = (handle: string) =>
    setOpenMenu((prev) => (prev === handle ? null : handle));
  const closeMenus = () => setOpenMenu(null);

  const query = search.toLowerCase().trim();
  const visibleRows = rows.filter((r) => {
    if (query === "") return true;
    const hay = `${r.name} ${r.handle} ${r.email} ${r.tier} ${r.status.label}`.toLowerCase();
    return hay.includes(query);
  });

  const sortArrow = (which: "asc" | "desc") =>
    sortDir === which ? "sorted-asc" : "sorted-desc";

  const renderAction = (row: UserRow, action: UserRowAction, idx: number) => {
    switch (action.kind) {
      case "divider":
        return <div key={idx} className="menu-divider" />;
      case "view":
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              openModal("user-detail", {
                handle: row.handle,
                email: row.email,
                tier: row.tier,
                name: row.name,
              });
              closeMenus();
            }}
          >
            <EyeIcon />
            {action.label}
          </button>
        );
      case "login":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert(`Login as @${row.handle}? Every action you take is logged. (prototype)`);
              closeMenus();
            }}
          >
            <LoginIcon />
            {action.label}
          </button>
        );
      case "password-reset":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert("Mockup — would send password-reset email (prototype)");
              closeMenus();
            }}
          >
            <LockIcon />
            {action.label}
          </button>
        );
      case "send-email":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert("Mockup — would open compose-email modal (prototype)");
              closeMenus();
            }}
          >
            <MailIcon />
            {action.label}
          </button>
        );
      case "refund":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert(`${action.alert} (prototype)`);
              closeMenus();
            }}
          >
            <RefundIcon />
            {action.label}
          </button>
        );
      case "comp-upgrade":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              openModal("comp-upgrade", { handle: row.handle });
              closeMenus();
            }}
          >
            <StarIcon />
            {action.label}
          </button>
        );
      case "suspend":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert(`${action.alert} (prototype)`);
              closeMenus();
            }}
          >
            <SuspendIcon />
            {action.label}
          </button>
        );
      case "unsuspend":
        return (
          <button
            key={idx}
            type="button"
            className="ro-hide-write"
            onClick={() => {
              window.alert("Mockup — would unsuspend (prototype)");
              closeMenus();
            }}
          >
            <UnsuspendIcon />
            {action.label}
          </button>
        );
      case "audit":
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              closeMenus();
              onNavigate("audit");
            }}
          >
            <AuditIcon />
            {action.label}
          </button>
        );
      case "moderation":
        return (
          <button
            key={idx}
            type="button"
            onClick={() => {
              closeMenus();
              onNavigate("moderation");
            }}
          >
            <ModerationIcon />
            {action.label}
          </button>
        );
      case "hard-delete":
        return (
          <button
            key={idx}
            type="button"
            className="danger ro-hide-write"
            onClick={() => {
              openModal("hard-delete", { handle: row.handle });
              closeMenus();
            }}
          >
            <TrashIcon />
            {action.label}
          </button>
        );
      default:
        return null;
    }
  };

  return (
    <div id="users-pane">
      <div className="page-head">
        <div>
          <h1>
            Users{" "}
            <span
              style={{
                fontFamily: "var(--font-sans)",
                fontSize: "14px",
                color: "var(--fg-muted)",
                fontWeight: 500,
              }}
            >
              847 total · 312 paying
            </span>
          </h1>
          <div className="sub">Search, filter, and manage every creator on tadaify.</div>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => window.alert("Mockup — would download users-2026-04-26.csv (prototype)")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm ro-disable"
            onClick={() => openModal("comp-upgrade")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Comp upgrade
          </button>
        </div>
      </div>

      <div className="filters">
        <div className="search-input">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            className="input"
            id="user-search"
            type="search"
            placeholder="Search by handle, email, or name…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input"
          value={tierFilter}
          onChange={(e) => setTierFilter(Number(e.target.value))}
        >
          {userTierFilterOptions().map((opt, i) => (
            <option key={opt} value={i}>
              {opt}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={statusFilter}
          onChange={(e) => setStatusFilter(Number(e.target.value))}
        >
          {userStatusFilterOptions().map((opt, i) => (
            <option key={opt} value={i}>
              {opt}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={signupFilter}
          onChange={(e) => setSignupFilter(Number(e.target.value))}
        >
          {userSignupFilterOptions().map((opt, i) => (
            <option key={opt} value={i}>
              {opt}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={domainFilter}
          onChange={(e) => setDomainFilter(Number(e.target.value))}
        >
          {userDomainFilterOptions().map((opt, i) => (
            <option key={opt} value={i}>
              {opt}
            </option>
          ))}
        </select>
        <select
          className="input"
          value={stripeFilter}
          onChange={(e) => setStripeFilter(Number(e.target.value))}
        >
          {userStripeFilterOptions().map((opt, i) => (
            <option key={opt} value={i}>
              {opt}
            </option>
          ))}
        </select>
        <button type="button" className="filter-clear" onClick={clearFilters}>
          Clear
        </button>
      </div>

      <div className={`bulk-bar${selectedCount > 0 ? " show" : ""}`} id="bulk-bar">
        <span>
          Selected: <b className="bb-count" id="bulk-count">{selectedCount}</b>
        </span>
        <div className="bb-actions">
          <button
            type="button"
            className="btn btn-ghost btn-xs ro-hide-write"
            onClick={() => window.alert("Mockup — would bulk send custom email (prototype)")}
          >
            Send email
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs ro-hide-write"
            onClick={() => window.alert("Mockup — would bulk suspend (prototype)")}
          >
            Suspend
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs ro-hide-write"
            onClick={() => window.alert("Mockup — would bulk unsuspend (prototype)")}
          >
            Unsuspend
          </button>
          <button
            type="button"
            className="btn btn-ghost btn-xs"
            onClick={() => window.alert("Mockup — would export selected to CSV (prototype)")}
          >
            Export selected
          </button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ width: "34px" }}>
                  <div
                    className={`checkbox${allOn ? " on" : ""}`}
                    onClick={toggleAll}
                  />
                </th>
                <th
                  className={`sortable ${sortArrow("desc")}`}
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  Creator <span className="sort-arrow">▼</span>
                </th>
                <th>Email</th>
                <th
                  className="sortable"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  Tier <span className="sort-arrow">▼</span>
                </th>
                <th
                  className="sortable"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  Signup <span className="sort-arrow">▼</span>
                </th>
                <th
                  className="sortable"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                >
                  Last active <span className="sort-arrow">▼</span>
                </th>
                <th>Status</th>
                <th
                  className="sortable"
                  onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  style={{ textAlign: "right" }}
                >
                  MRR <span className="sort-arrow">▼</span>
                </th>
                <th style={{ width: "48px" }} />
              </tr>
            </thead>
            <tbody id="users-tbody">
              {visibleRows.map((row) => (
                <tr
                  key={row.handle}
                  className={[
                    row.suspended ? "is-suspended" : "",
                    selected[row.handle] ? "is-selected" : "",
                  ]
                    .filter(Boolean)
                    .join(" ") || undefined}
                >
                  <td>
                    <div
                      className={`checkbox${selected[row.handle] ? " on" : ""}`}
                      onClick={() => toggleRow(row.handle)}
                    />
                  </td>
                  <td>
                    <div
                      className="row-mini"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        openModal("user-detail", {
                          handle: row.handle,
                          email: row.email,
                          tier: row.tier,
                          name: row.name,
                        })
                      }
                    >
                      <div className={row.avatarClass}>{row.avatarInitial}</div>
                      <div className="rm-text">
                        <div className="rm-name">{row.name}</div>
                        <div className="rm-handle">@{row.handle}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
                      {row.email}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${TIER_CHIP[row.tier]}`}>{row.tier}</span>
                  </td>
                  <td>{row.signup}</td>
                  <td>
                    <span
                      style={{
                        color:
                          row.lastActiveTone === "subtle"
                            ? "var(--fg-subtle)"
                            : "var(--fg-muted)",
                      }}
                    >
                      {row.lastActive}
                    </span>
                  </td>
                  <td>
                    <span className={`chip ${row.status.tone}`}>{row.status.label}</span>
                  </td>
                  <td
                    style={{
                      textAlign: "right",
                      fontFamily: "var(--font-mono)",
                      ...(row.mrr
                        ? { fontWeight: 600 }
                        : { color: "var(--fg-muted)" }),
                    }}
                  >
                    {row.mrr ?? "—"}
                  </td>
                  <td>
                    <div className="action-menu-wrap">
                      <button
                        type="button"
                        className="action-menu-btn"
                        aria-label="Actions"
                        onClick={() => toggleMenu(row.handle)}
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
                          <circle cx="12" cy="5" r="1.6" />
                          <circle cx="12" cy="12" r="1.6" />
                          <circle cx="12" cy="19" r="1.6" />
                        </svg>
                      </button>
                      <div className={`action-menu${openMenu === row.handle ? " open" : ""}`}>
                        {row.actions.map((action, i) => renderAction(row, action, i))}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            padding: "11px 14px",
            borderTop: "1px solid var(--border)",
            fontSize: "12.5px",
            color: "var(--fg-muted)",
            flexWrap: "wrap",
            gap: "8px",
          }}
        >
          <div>
            Showing <b style={{ color: "var(--fg)" }}>9</b> of{" "}
            <b style={{ color: "var(--fg)" }}>847</b> creators
          </div>
          <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
            <button type="button" className="btn btn-ghost btn-xs" disabled>
              ← Prev
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => window.alert("Mockup — page 1 (prototype)")}
            >
              1
            </button>
            <button
              type="button"
              className="btn btn-primary btn-xs"
              onClick={() => window.alert("Mockup — page 2 (prototype)")}
            >
              2
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => window.alert("Mockup — page 3 (prototype)")}
            >
              3
            </button>
            <span>…</span>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => window.alert("Mockup — page 95 (prototype)")}
            >
              95
            </button>
            <button
              type="button"
              className="btn btn-ghost btn-xs"
              onClick={() => window.alert("Mockup — next page (prototype)")}
            >
              Next →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
