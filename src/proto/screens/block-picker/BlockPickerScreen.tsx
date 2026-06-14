/**
 * Block picker modal — opens from the dashboard "Add block". Ported from
 * mockups/tadaify-mvp/app-block-picker.html, overlaid on the reused dashboard.
 * Presentational + local UI state only; data from typed fixtures.
 *
 * Category filtering (the mockup's scrolling tab strip did not scale): a header
 * dropdown filters by category, and the "All" view groups blocks under category
 * section headers. AI suggestions are a header action, not a category.
 *
 * @implements fr-block-picker-modal
 */
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import "./block-picker-proto.css";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import {
  aiSetsFixture,
  blockTypesFixture,
  type BlockType,
} from "./blockPickerFixture";

const CURRENT_TIER_RANK = 1; // creator
const TIER_RANK: Record<string, number> = { "Pro+": 2 };
const REAL_CATS = ["Links", "Media", "Forms", "Shop", "Layout"] as const;

function isLocked(t: BlockType): boolean {
  return t.tier ? CURRENT_TIER_RANK < TIER_RANK[t.tier] : false;
}

function TypeRow({ t }: { t: BlockType }) {
  const locked = isLocked(t);
  return (
    <a
      role="listitem"
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`type-card is-${t.cat.toLowerCase()}${locked ? " is-locked" : ""}`}
    >
      <div className="ic" aria-hidden>{t.icon}</div>
      <div className="tc-body">
        <div className="tc-head">
          <span className="ttl">{t.label}</span>
          {t.popular && <span className="bd popular">Most clicked</span>}
          {t.isNew && <span className="bd new">New</span>}
          {t.tier && <span className="bd tier">{t.tier}</span>}
        </div>
        <div className="desc">{t.desc}</div>
      </div>
      <span className="add-cta">{locked ? "Upgrade →" : "Add →"}</span>
    </a>
  );
}

export function BlockPickerScreen() {
  const types = blockTypesFixture();
  const aiSets = aiSetsFixture();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [aiOpen, setAiOpen] = useState(false);
  const [ddOpen, setDdOpen] = useState(false);
  const navigate = useNavigate();

  // The picker opened from the dashboard — dismissing returns there.
  const close = () => navigate("/__proto/dashboard");

  // Escape closes the AI sub-modal first, otherwise the picker.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (aiOpen) setAiOpen(false);
      else close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [aiOpen]);

  const cats = ["All", ...REAL_CATS];
  const countFor = (c: string) => (c === "All" ? types.length : types.filter((t) => t.cat === c).length);

  const searchHit = (t: BlockType) => {
    const n = q.trim().toLowerCase();
    return !n || t.label.toLowerCase().includes(n) || t.desc.toLowerCase().includes(n);
  };

  // "All" → grouped sections; a specific category → just that category's rows.
  const groups = useMemo(() => {
    const wanted = cat === "All" ? REAL_CATS : [cat as (typeof REAL_CATS)[number]];
    return wanted
      .map((c) => ({ cat: c, items: types.filter((t) => t.cat === c && searchHit(t)) }))
      .filter((g) => g.items.length);
  }, [types, cat, q]);

  const empty = groups.length === 0;

  return (
    <>
      <DashboardScreen />

      <div className="proto-root proto-picker">
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="picker-h"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="modal" role="document">
            <header className="modal-head">
              <h2 id="picker-h">Add a block</h2>
              <div className="search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input className="search" type="text" placeholder="Find a block type…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
              </div>

              <div className="cat-dd">
                <button className="cat-dd-btn" type="button" onClick={() => setDdOpen((o) => !o)} aria-expanded={ddOpen} aria-label="Filter by category">
                  {cat === "All" ? "All categories" : cat}
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                {ddOpen && (
                  <div className="cat-dd-menu" role="menu">
                    {cats.map((c) => (
                      <button key={c} type="button" role="menuitem" className={c === cat ? "is-active" : ""} onClick={() => { setCat(c); setDdOpen(false); }}>
                        <span>{c === "All" ? "All categories" : c}</span>
                        <span className="ct">{countFor(c)}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button className="iconbtn" type="button" aria-label="AI suggestions" title="AI suggestions" onClick={() => setAiOpen(true)}>
                <span aria-hidden style={{ fontSize: 18 }}>✨</span>
              </button>
              <button className="iconbtn" aria-label="Close" type="button" onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <div className="modal-body">
              <div className="card-grid" role="list">
                {empty ? (
                  <div className="grid-empty"><div className="ic" aria-hidden>🔍</div>No block types match “{q}”.</div>
                ) : (
                  groups.map((g) => (
                    <div key={g.cat}>
                      <div className="tc-group-head">{g.cat}</div>
                      {g.items.map((t) => <TypeRow key={t.id} t={t} />)}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {aiOpen && (
          <div className="ai-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="ai-h">
            <div className="ai-modal" role="document">
              <header className="ai-modal-head">
                <span style={{ fontSize: 22 }} aria-hidden>✨</span>
                <h3 id="ai-h">AI block suggestions</h3>
                <button className="iconbtn" type="button" aria-label="Close" onClick={() => setAiOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </header>
              <div className="ai-modal-body">
                <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 14 }}>
                  Tap a set to add all of its blocks at once. Each can be edited individually after.
                  <span style={{ display: "block", color: "var(--fg-subtle)", fontSize: 11, marginTop: 4 }}>
                    Free 5 / Creator 20 / Pro 100 / Business unlimited.
                  </span>
                </p>
                {aiSets.map((set) => (
                  <button key={set.title} className="ai-set" type="button" onClick={() => setAiOpen(false)}>
                    <div className="ttl">{set.title}</div>
                    <div className="blocks-row">{set.chips.map((c) => <span key={c} className="b-chip">{c}</span>)}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
