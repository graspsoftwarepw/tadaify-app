/**
 * Block picker modal — opens from the dashboard "Add block". Faithful port of
 * mockups/tadaify-mvp/app-block-picker.html, overlaid on the reused dashboard.
 * Presentational + local UI state only; data from typed fixtures.
 *
 * @implements fr-block-picker-modal
 */
import { useMemo, useState } from "react";
import "./block-picker-proto.css";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import {
  aiSetsFixture,
  blockCategoriesFixture,
  blockTypesFixture,
  type BlockType,
} from "./blockPickerFixture";

const CURRENT_TIER_RANK = 1; // creator
const TIER_RANK: Record<string, number> = { "Pro+": 2 };

function isLocked(t: BlockType): boolean {
  return t.tier ? CURRENT_TIER_RANK < TIER_RANK[t.tier] : false;
}

function TypeCard({ t }: { t: BlockType }) {
  const locked = isLocked(t);
  return (
    <a
      role="listitem"
      href="#"
      onClick={(e) => e.preventDefault()}
      className={`type-card is-${t.cat.toLowerCase()}${locked ? " is-locked" : ""}`}
    >
      <div className="ic" aria-hidden>{t.icon}</div>
      <div className="ttl">{t.label}</div>
      <div className="desc">{t.desc}</div>
      <div className="badges">
        {t.popular && <span className="bd popular">Most clicked</span>}
        {t.isNew && <span className="bd new">New</span>}
        {t.tier && <span className="bd tier">{t.tier}</span>}
      </div>
      <span className="add-cta">{locked ? "Upgrade →" : "Add →"}</span>
    </a>
  );
}

export function BlockPickerScreen() {
  const types = blockTypesFixture();
  const categories = blockCategoriesFixture();
  const aiSets = aiSetsFixture();
  const [cat, setCat] = useState("All");
  const [q, setQ] = useState("");
  const [aiOpen, setAiOpen] = useState(false);

  const visible = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return types.filter((t) => {
      const inCat = cat === "All" || cat === "AI ✨" || t.cat === cat;
      const inQ = !needle || t.label.toLowerCase().includes(needle) || t.desc.toLowerCase().includes(needle);
      return inCat && inQ;
    });
  }, [types, cat, q]);

  function selectCat(c: string) {
    if (c === "AI ✨") setAiOpen(true);
    else setCat(c);
  }

  function countFor(c: string): string {
    if (c === "All") return String(types.length);
    if (c === "AI ✨") return "";
    return String(types.filter((t) => t.cat === c).length);
  }

  return (
    <>
      {/* Frozen dashboard backdrop */}
      <DashboardScreen />

      {/* Picker modal overlay (own token root so dark flips with the toggle) */}
      <div className="proto-root proto-picker">
        <div
          className="modal-backdrop is-open"
          role="dialog"
          aria-modal="true"
          aria-labelledby="picker-h"
        >
          <div className="modal" role="document">
            <header className="modal-head">
              <h2 id="picker-h">Add a block</h2>
              <div className="search-wrap">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  className="search"
                  type="text"
                  placeholder="Find a block type…"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  autoComplete="off"
                />
              </div>
              <button className="iconbtn" aria-label="Close" type="button">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </header>

            <nav className="modal-tabs" aria-label="Block categories" role="tablist">
              {categories.map((c) => {
                const active = c === cat;
                const ct = countFor(c);
                return (
                  <button
                    key={c}
                    role="tab"
                    aria-selected={active}
                    className={active ? "is-active" : ""}
                    type="button"
                    onClick={() => selectCat(c)}
                  >
                    {c}
                    {ct !== "" && <span className="ct">{ct}</span>}
                  </button>
                );
              })}
            </nav>

            <div className="modal-body">
              <div className="card-grid" role="list">
                {visible.length === 0 ? (
                  <div className="grid-empty">
                    <div className="ic" aria-hidden>🔍</div>
                    No block types match “{q}”.
                  </div>
                ) : (
                  visible.map((t) => <TypeCard key={t.id} t={t} />)
                )}
              </div>
            </div>

            <footer className="modal-foot">
              <span className="reorder">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                </svg>
                Drag to reorder blocks after adding.
              </span>
              <a className="templates" href="#" onClick={(e) => e.preventDefault()}>
                Browse our templates
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                  <polyline points="9 6 15 12 9 18" />
                </svg>
              </a>
            </footer>
          </div>
        </div>

        {/* AI suggest sub-modal */}
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
                    <div className="blocks-row">
                      {set.chips.map((c) => (
                        <span key={c} className="b-chip">{c}</span>
                      ))}
                    </div>
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
