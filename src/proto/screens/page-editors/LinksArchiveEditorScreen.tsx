/**
 * Links archive page editor — the creator-facing editor for the browse-all
 * links sub-page that derives its contents from link buttons across the
 * creator's other pages plus manual additions. Faithful port of
 * mockups/tadaify-mvp/app-page-links-archive.html, composed on the shared
 * EditorShell + Section primitives. Pairs with the public visitor view.
 *
 * Presentational, local-state only: toggle source pages (live count updates),
 * pick a grouping mode + theme swatch, edit a manual link inline, open the
 * excluded-link reason modal, restore an excluded link, flip empty ↔ filled,
 * and a dirty-on-edit save bar. Data comes from linksArchiveEditorFixture.
 * Premium fields stay visible + interactive; the gate is mocked at Save.
 *
 * @implements fr-page-editor-links-archive
 */
import { useMemo, useState } from "react";
import {
  EditorShell,
  EditorIcon as S,
  Field,
  FieldRow,
  RowToggle,
  Section,
  TierBadge,
  type SaveState,
} from "./EditorShell";
import { dashboardProfileFixture } from "../dashboard/dashboardFixture";
import {
  linksArchiveEditorFixture,
  type ExcludedLink,
} from "./linksArchiveEditorFixture";

const ARCHIVE_PAGE_SUBITEM = {
  id: "links-archive",
  label: "Links archive",
  href: "/__proto/page-links-archive",
  icon: (
    <>
      <path d="M21 8v13H3V8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </>
  ),
};

export function LinksArchiveEditorScreen() {
  const profile = dashboardProfileFixture();
  const fx = linksArchiveEditorFixture();

  const [empty, setEmpty] = useState(false);
  const [saveState, setSaveState] = useState<SaveState>("saved");
  const [title, setTitle] = useState(fx.pageTitle);
  const [slug, setSlug] = useState(fx.slug);
  const [live, setLive] = useState(fx.live);
  const [showInFooter, setShowInFooter] = useState(fx.showInFooter);
  const [swatch, setSwatch] = useState(fx.selectedSwatch);
  const [sources, setSources] = useState(fx.sources);
  const [groupMode, setGroupMode] = useState(fx.selectedGroupMode);
  const [controls, setControls] = useState(fx.visitorControls);
  const [manual, setManual] = useState(fx.manualLinks);
  const [editingManual, setEditingManual] = useState<string | null>(null);
  const [excluded, setExcluded] = useState<ExcludedLink[]>(fx.excluded);
  const [reasonFor, setReasonFor] = useState<ExcludedLink | null>(null);

  const dirty = () => setSaveState("dirty");

  const { total, srcCount } = useMemo(() => {
    let t = 0;
    let c = 0;
    for (const s of sources) {
      if (s.on) {
        t += s.count;
        c += 1;
      }
    }
    return { total: t, srcCount: c };
  }, [sources]);

  const toggleSource = (id: string) => {
    setSources((prev) => prev.map((s) => (s.id === id ? { ...s, on: !s.on } : s)));
    dirty();
  };
  const toggleControl = (id: string) => {
    setControls((prev) => prev.map((c) => (c.id === id ? { ...c, on: !c.on } : c)));
    dirty();
  };
  const deleteManual = (id: string) => { setManual((prev) => prev.filter((m) => m.id !== id)); dirty(); };
  const restoreExcluded = (id: string) => { setExcluded((prev) => prev.filter((x) => x.id !== id)); dirty(); };
  const applyTitle = (v: string) => {
    setTitle(v);
    setSlug(v.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "links");
    dirty();
  };

  return (
    <EditorShell
      profile={profile}
      emoji="🗂️"
      title="Links archive"
      description="A browse-all-links sub-page that pulls from your homepage, blog posts, and other pages — search, group, and filter for visitors who want the full catalogue."
      slug={slug}
      live={live}
      pageId="links-archive"
      pageSubItems={[ARCHIVE_PAGE_SUBITEM]}
      crumbs={[
        { label: "Home", href: "/__proto/dashboard" },
        { label: "Pages", href: "/__proto/dashboard" },
        { label: "Links archive" },
      ]}
      saveState={saveState}
      onSave={() => setSaveState("saved")}
      onDiscard={() => setSaveState("saved")}
      headerActions={
        <a className="btn btn-ghost btn-sm" href="/__proto/creator-public" target="_blank" rel="noopener">
          <S w={13}><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></S>
          Preview
        </a>
      }
      headerExtra={
        <div className="pe-quick-titles">
          <span className="qt-eyebrow">Title ideas</span>
          {fx.titleIdeas.map((t) => (
            <button key={t} className="pe-qt-chip" type="button" onClick={() => applyTitle(t)}>{t}</button>
          ))}
          <button className="pe-qt-chip" type="button" onClick={() => applyTitle("The vault")}>
            <span className="sparkle">✨</span> Suggest more
          </button>
        </div>
      }
    >
      {empty ? (
        <Section title="Links archive">
          <div className="pe-empty">
            <div className="es-emoji" aria-hidden>🗂️</div>
            <h3>No links to archive yet</h3>
            <p>Your archive populates automatically once you add link buttons to your homepage, blog posts, or other pages. Drop your first link to get started.</p>
            <div className="es-actions">
              <a className="btn btn-primary btn-sm" href="/__proto/dashboard">
                <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add your first link button
              </a>
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(false)}>Demo: show filled state</button>
            </div>
          </div>
        </Section>
      ) : (
        <>
          {/* ── Section 1: Page settings ── */}
          <Section title="Page settings" sub="Title, URL, visibility, theme, and SEO for the archive page itself.">
            <FieldRow>
              <Field label="Page title" hint="shown as <h1> on the public archive">
                <input className="pe-input" type="text" value={title} onChange={(e) => applyTitle(e.target.value)} />
              </Field>
              <Field label="URL slug" hint="letters, numbers, hyphens">
                <div className="pe-prefix-wrap">
                  <span className="pe-prefix">tadaify.com/{profile.handle}/</span>
                  <input type="text" value={slug} onChange={(e) => { setSlug(e.target.value); dirty(); }} />
                </div>
              </Field>
            </FieldRow>

            <FieldRow>
              <Field>
                <RowToggle name="Publish to public" sub="Anyone with the link can browse the archive." on={live} onChange={(v) => { setLive(v); dirty(); }} />
              </Field>
              <Field>
                <RowToggle name="Show in homepage footer" sub='Adds a "Browse all links →" link below your blocks.' on={showInFooter} onChange={(v) => { setShowInFooter(v); dirty(); }} />
              </Field>
            </FieldRow>

            <Field label="Theme color" hint="overrides the default page accent for this archive">
              <div className="pe-swatch-row">
                {fx.swatches.map((sw, i) => (
                  <button key={sw.name} type="button" className={`pe-swatch${i === swatch ? " is-selected" : ""}`} style={{ background: sw.css }} title={sw.name} aria-label={sw.name} onClick={() => { setSwatch(i); dirty(); }} />
                ))}
              </div>
            </Field>

            <details className="pe-expander">
              <summary>
                <span>SEO &amp; sharing</span>
                <span className="ex-sub">Meta title, description, OG image — for Google &amp; social previews</span>
                <svg className="ex-caret" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden><polyline points="6 9 12 15 18 9" /></svg>
              </summary>
              <div className="ex-body">
                <Field label="Meta title" hint="≤ 60 chars">
                  <input className="pe-input" type="text" defaultValue={fx.seo.title} onChange={dirty} />
                </Field>
                <Field label="Meta description" hint="≤ 160 chars">
                  <textarea className="pe-area" defaultValue={fx.seo.description} onChange={dirty} />
                </Field>
              </div>
            </details>
          </Section>

          {/* ── Section 2: Sources ── */}
          <Section title="Where do the links come from?" sub="Toggle pages whose link buttons should populate the archive. Counts update live.">
            <div className="source-list">
              {sources.map((s) => (
                <div className={`source-row${s.on ? " is-on" : ""}`} key={s.id}>
                  <button type="button" className={`pe-toggle${s.on ? " is-on" : ""}`} role="switch" aria-checked={s.on} aria-label={`Include ${s.name}`} onClick={() => toggleSource(s.id)} />
                  <div>
                    <div className="src-name">
                      <span className={`src-ico ${s.tone}`}>{s.icon}</span>
                      {s.name}
                      {s.isDefault && <span className="chip" style={{ marginLeft: 4 }}>default</span>}
                    </div>
                    <div className="src-sub">{s.sub}</div>
                  </div>
                  <span className="src-count">{s.count} links</span>
                </div>
              ))}
            </div>
            <div className="live-count" role="status" aria-live="polite">
              <div className="lc-ico">∑</div>
              <div className="lc-text">
                <div className="lc-num">{total.toLocaleString()} links from {srcCount} sources</div>
                <div className="lc-sub">Counts refresh hourly. <a href="#" onClick={(e) => e.preventDefault()}>Recount now →</a></div>
              </div>
            </div>
          </Section>

          {/* ── Section 3: Manual bonus links ── */}
          <Section
            title="Manual bonus links"
            sub="Links that exist only on the archive — useful for old work you don't want featured on the homepage."
            headExtra={
              <button className="btn btn-primary btn-sm" type="button" onClick={() => { setManual((p) => [...p, { id: `m${Date.now()}`, icon: "🔗", tone: "", title: "New manual link", url: "https://" }]); dirty(); }}>
                <S w={13}><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></S>
                Add manual link
              </button>
            }
          >
            <div className="manual-toolbar">
              <span className="ml-meta"><b>{manual.length}</b> manual links · drag to reorder · unlimited on every tier</span>
            </div>
            <div className="manual-list">
              {manual.map((m) => (
                <div className={`manual-row${editingManual === m.id ? " is-editing" : ""}`} key={m.id}>
                  <div className="ml-handle" title="Drag to reorder">
                    <S><line x1="8" y1="6" x2="16" y2="6" /><line x1="8" y1="12" x2="16" y2="12" /><line x1="8" y1="18" x2="16" y2="18" /></S>
                  </div>
                  <div className={`ml-icon ${m.tone}`}>{m.icon}</div>
                  <div className="ml-meta-col">
                    <div className="ml-title-row">
                      <span className="ml-title">{m.title}</span>
                      {m.abTest && <span className="chip warm">A/B test</span>}
                    </div>
                    <div className="ml-url">{m.url}</div>
                  </div>
                  <div className="ml-actions">
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setEditingManual(m.id)}>Edit</button>
                    <button className="iconbtn" type="button" aria-label="Delete" onClick={() => deleteManual(m.id)}>
                      <S><polyline points="3 6 5 6 21 6" /><path d="M19 6l-2 14a2 2 0 0 1-2 2H9a2 2 0 0 1-2-2L5 6" /></S>
                    </button>
                  </div>
                  <div className="ml-edit-pane">
                    <FieldRow>
                      <Field label="Title">
                        <input className="pe-input" type="text" defaultValue={m.title} onChange={dirty} />
                      </Field>
                      <Field label="Icon emoji or upload">
                        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                          <input className="pe-input" type="text" defaultValue={m.icon} style={{ maxWidth: 80, textAlign: "center", fontSize: 18 }} />
                          <button className="btn btn-ghost btn-sm" type="button">Upload</button>
                          <button className="btn btn-ghost btn-sm" type="button">✨ Pick</button>
                        </div>
                      </Field>
                    </FieldRow>
                    <Field label="URL">
                      <input className="pe-input" type="url" defaultValue={m.url} onChange={dirty} />
                    </Field>
                    <FieldRow>
                      <Field label={<>A/B test variant <span className="chip warm">Business</span></>}>
                        <select className="pe-select" defaultValue="50/50 — auto-pick winner after 7 days">
                          <option>Off</option>
                          <option>50/50 — auto-pick winner after 7 days</option>
                          <option>Manual split</option>
                        </select>
                      </Field>
                      <Field label={<>Schedule visibility <span className="chip creator">Creator+</span></>}>
                        <input className="pe-input" type="datetime-local" defaultValue="2026-05-01T09:00" />
                      </Field>
                    </FieldRow>
                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                      <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEditingManual(null)}>Cancel</button>
                      <button className="btn btn-primary btn-sm" type="button" onClick={() => { setEditingManual(null); dirty(); }}>Save</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          {/* ── Section 4: How visitors browse ── */}
          <Section title="How visitors browse" sub="Choose how the archive groups + filters in the visitor's view.">
            <Field label="Grouping mode" hint="click to swap — preview updates live">
              <div className="group-modes">
                {fx.groupModes.map((g) => (
                  <button key={g.id} type="button" className={`group-card${groupMode === g.id ? " is-selected" : ""}`} onClick={() => { setGroupMode(g.id); dirty(); }}>
                    <div className="gc-thumb">
                      <div className="gh bold" /><div className="gl" /><div className="gl" />
                      <div className="gh-small" style={{ marginTop: 6 }} /><div className="gl" />
                    </div>
                    <div className="gc-title">
                      {g.title}
                      {g.isDefault && <span className="chip">default</span>}
                      {g.tier === "creator" && <span className="chip creator">Creator+</span>}
                      {g.tier === "pro" && <span className="chip pro">Pro+</span>}
                    </div>
                    <div className="gc-sub">{g.sub}</div>
                  </button>
                ))}
              </div>
            </Field>

            <div style={{ height: 14 }} />

            <Field label="Visitor controls" hint="what shows up at the top of the public archive">
              <div className="visitor-controls">
                {controls.map((c) => (
                  <RowToggle
                    key={c.id}
                    name={
                      <>
                        {c.name}
                        {c.tier === "creator" && <span className="chip creator">Creator+</span>}
                        {c.tier === "pro" && <span className="chip pro">Pro+</span>}
                      </>
                    }
                    sub={c.sub}
                    on={c.on}
                    onChange={() => toggleControl(c.id)}
                  />
                ))}
              </div>
            </Field>
          </Section>

          {/* ── Section 5: Excluded from archive ── */}
          <Section
            title="Excluded from archive"
            sub="Hide specific links from the archive without deleting them from their source page."
            headExtra={<span className="chip"><b>{excluded.length}</b>&nbsp;excluded</span>}
          >
            <div className="excluded-list">
              {excluded.map((x) => (
                <div className="excluded-row" key={x.id}>
                  <div className="ex-ico">🚫</div>
                  <div className="ex-meta">
                    <div className="ex-title">{x.title}</div>
                    <div className="ex-line">
                      <span className="ex-url">{x.url}</span>
                      <span>·</span>
                      <span className="ex-reason">Reason: {x.reason}</span>
                    </div>
                  </div>
                  <div className="ex-actions">
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => setReasonFor(x)}>Edit reason</button>
                    <button className="btn btn-ghost btn-xs" type="button" onClick={() => restoreExcluded(x.id)}>Restore</button>
                  </div>
                </div>
              ))}
            </div>
          </Section>

          <div style={{ marginTop: 4, textAlign: "center" }}>
            <button className="btn btn-ghost btn-sm" type="button" onClick={() => setEmpty(true)}>Demo: show empty state</button>
          </div>
        </>
      )}

      {/* ── Excluded-link reason modal ── */}
      {reasonFor && (
        <div className="pe-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="reason-title" onClick={(e) => { if (e.target === e.currentTarget) setReasonFor(null); }}>
          <div className="pe-modal is-narrow">
            <div className="pe-modal-head">
              <h3 id="reason-title">Why exclude this link?</h3>
              <span className="head-spacer" />
              <button className="iconbtn" type="button" aria-label="Close" onClick={() => setReasonFor(null)}>
                <S><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></S>
              </button>
            </div>
            <div className="pe-modal-body">
              <p className="intro">A short note for your future self — never shown to visitors. Helps you remember why this link is hidden if you come back in 6 months.</p>
              <Field label="Link">
                <div className="pe-prefix-wrap">
                  <span className="pe-prefix">URL</span>
                  <input type="text" value={reasonFor.url} disabled readOnly />
                </div>
              </Field>
              <Field label="Reason">
                <textarea className="pe-area" defaultValue={reasonFor.reason} />
              </Field>
            </div>
            <div className="pe-modal-foot">
              <span className="foot-spacer" />
              <button className="btn btn-ghost btn-sm" type="button" onClick={() => setReasonFor(null)}>Cancel</button>
              <button className="btn btn-primary btn-sm" type="button" onClick={() => { setReasonFor(null); dirty(); }}>Save reason</button>
            </div>
          </div>
        </div>
      )}
    </EditorShell>
  );
}
