/**
 * Legal versioning admin pane — publish ToS / Privacy revisions, force
 * re-acceptance on material changes, review drafts, inspect diffs, and browse
 * version history. Faithful port of `<section id="pane-legal">` from
 * mockups/tadaify-mvp/admin-panel.html; renders the pane's inner markup only.
 *
 * @implements fr-admin-panel
 */
import { useRef } from "react";

import type { SectionProps } from "../adminPanelTypes";
import {
  legalDiffFixture,
  legalDocumentsFixture,
  legalDraftFixture,
  legalHistoryFixture,
} from "./legalSectionFixture";

export function LegalSection({ openModal }: SectionProps) {
  const documents = legalDocumentsFixture();
  const draft = legalDraftFixture();
  const diff = legalDiffFixture();
  const history = legalHistoryFixture();
  const diffRef = useRef<HTMLDivElement>(null);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Legal versioning</h1>
          <div className="sub">
            Publish ToS / Privacy policy revisions. Force re-acceptance when
            material changes apply. Per{" "}
            <a
              href="https://github.com/graspsoftwarepw/tadaify-app/issues/5"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--brand-primary)", textDecoration: "underline" }}
            >
              #5 F-LEGAL-002
            </a>{" "}
            and{" "}
            <a
              href="https://github.com/graspsoftwarepw/tadaify-app/issues/6"
              target="_blank"
              rel="noreferrer"
              style={{ color: "var(--brand-primary)", textDecoration: "underline" }}
            >
              #6 F-LEGAL-003
            </a>
            .
          </div>
        </div>
        <div className="head-actions">
          <button
            type="button"
            className="btn btn-primary btn-sm ro-hide-write"
            onClick={() => openModal("publish-legal")}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Publish new version
          </button>
        </div>
      </div>

      {/* Current versions */}
      <div className="two-col">
        {documents.map((doc) => (
          <div className="card" key={doc.slug}>
            <div className="card-h">
              <h2>{doc.title}</h2>
              <span className="chip success">{doc.status}</span>
            </div>
            <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
                <b>{doc.version}</b>
                <span style={{ fontFamily: "var(--font-mono)", color: "var(--fg-muted)", fontSize: "12px" }}>
                  {doc.slug}
                </span>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fg-muted)" }}>
                Effective <b>{doc.effective}</b> · {doc.daysLive} · published by {doc.publishedBy}
              </div>
              <div style={{ marginTop: "10px", padding: "10px", background: "var(--bg-muted)", borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                  <span>Acceptance</span>
                  <b style={{ color: "var(--success)" }}>{doc.acceptancePct}</b>
                </div>
                <div style={{ height: "6px", background: "var(--bg-sunken)", borderRadius: "99px", overflow: "hidden", margin: "6px 0 4px" }}>
                  <div style={{ width: doc.acceptancePct, height: "100%", background: "var(--success)" }} />
                </div>
                <div style={{ fontSize: "11px", color: "var(--fg-muted)" }}>{doc.acceptanceNote}</div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "12px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.alert("View live (prototype)")}
              >
                View live
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.alert("Download MD (prototype)")}
              >
                Download MD
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => window.alert("Acceptances (prototype)")}
              >
                Acceptances
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Drafts */}
      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>Drafts · 1 pending review</h2>
          <button
            type="button"
            className="btn btn-ghost btn-sm ro-hide-write"
            onClick={() => window.alert("New draft (prototype)")}
          >
            + New draft
          </button>
        </div>
        <div style={{ border: "1px solid var(--border)", borderRadius: "11px", padding: "14px 16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: "14px" }}>{draft.title}</div>
              <div style={{ fontSize: "12px", color: "var(--fg-muted)", marginTop: "3px" }}>
                <span style={{ fontFamily: "var(--font-mono)" }}>{draft.slug}</span> · {draft.lastEdited}
              </div>
              <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {draft.chips.map((chip) => (
                  <span className={chip.variant ? `chip ${chip.variant}` : "chip"} key={chip.label}>
                    {chip.label}
                  </span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => diffRef.current?.scrollIntoView({ behavior: "smooth" })}
              >
                View diff
              </button>
              <button
                type="button"
                className="btn btn-ghost btn-sm ro-hide-write"
                onClick={() => window.alert("Edit draft (prototype)")}
              >
                Edit draft
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm ro-hide-write"
                onClick={() => openModal("publish-legal")}
              >
                Publish
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Diff preview */}
      <div className="card" id="legal-diff" ref={diffRef} style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>Diff preview · {diff.fromVersion} → {diff.toVersion}</h2>
          <div style={{ fontSize: "11.5px", color: "var(--fg-muted)" }}>
            <span style={{ color: "var(--success)" }}>{diff.added}</span> ·{" "}
            <span style={{ color: "var(--danger)" }}>{diff.removed}</span>
          </div>
        </div>
        <div className="diff-grid">
          <div className="diff-side">
            <h5>{diff.fromVersion} — currently live</h5>
            {diff.before.map((line, i) => (
              <div className={line.kind ? `diff-line ${line.kind}` : "diff-line"} key={`before-${i}`}>
                {line.text}
              </div>
            ))}
          </div>
          <div className="diff-side">
            <h5>{diff.toVersion} — proposed</h5>
            {diff.after.map((line, i) => (
              <div className={line.kind ? `diff-line ${line.kind}` : "diff-line"} key={`after-${i}`}>
                {line.text}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Past versions */}
      <div className="card" style={{ marginTop: "16px" }}>
        <div className="card-h">
          <h2>Version history</h2>
        </div>
        <div className="tbl-wrap">
          <table className="tbl">
            <thead>
              <tr>
                <th>Version</th>
                <th>Kind</th>
                <th>Effective</th>
                <th>Days live</th>
                <th>Forced re-acceptance?</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {history.map((row) => (
                <tr key={`${row.version}-${row.kind}`}>
                  <td>{row.current ? <b>{row.version}</b> : row.version}</td>
                  <td>{row.kind}</td>
                  <td>{row.effective}</td>
                  <td>{row.daysLive}</td>
                  <td>{row.forcedReacceptance}</td>
                  <td>
                    <button
                      type="button"
                      className="btn btn-ghost btn-xs"
                      onClick={() => window.alert("View (prototype)")}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
