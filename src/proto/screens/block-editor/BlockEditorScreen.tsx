/**
 * Block editor centered modal — opens from the dashboard on a block. Faithful
 * port of mockups/tadaify-mvp/app-block-editor.html, overlaid on the reused
 * dashboard. A 960px centered modal over a frozen dashboard backdrop:
 * type-specific form (left) + live preview (right) on desktop, single column +
 * collapsible preview on mobile.
 *
 * Presentational + local React state only; all data from typed fixtures.
 * A/B testing, schedule visibility and analytics are reproduced inline. Premium
 * UIs stay fully visible and editable on every tier
 * (feedback_no_blur_premium_features); gating is signalled, not blurred.
 *
 * @implements fr-block-editor-modal
 */
import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import "./block-editor-proto.css";
import { DashboardScreen } from "../dashboard/DashboardScreen";
import {
  AB_DIFF_LABELS,
  AI_QUOTA_HINT,
  ICON_POPULAR,
  CONTENT_FIELD_KEYS,
  TIER_LABEL,
  TIER_PRICE,
  TIER_RANK,
  type FieldDef,
  type IconEntry,
  type Tier,
  aiOptionsFixture,
  blockTypesFixture,
  demoBlocksFixture,
  embedProvidersFixture,
  iconCategoriesFixture,
  iconLibraryFixture,
  newsletterProvidersFixture,
  socialIconStylesFixture,
  socialLegacyStylesFixture,
  socialPlatformsFixture,
} from "./blockEditorFixture";

/* ------------------------------------------------------------------ */
/* Static fixture lookups (built once)                                */
/* ------------------------------------------------------------------ */
const BLOCK_TYPES = blockTypesFixture();
const BLOCK_BY_ID = Object.fromEntries(BLOCK_TYPES.map((b) => [b.id, b]));
const ICONS = iconLibraryFixture();
const ICON_BY_ID = Object.fromEntries(ICONS.map((i) => [i.id, i]));
const ICON_CATEGORIES = iconCategoriesFixture();
const EMBED_PROVIDERS = embedProvidersFixture();
const NEWSLETTER_PROVIDERS = newsletterProvidersFixture();
const SOCIAL_PLATFORMS = socialPlatformsFixture();
const SOCIAL_BY_ID = Object.fromEntries(SOCIAL_PLATFORMS.map((p) => [p.id, p]));
const SOCIAL_STYLES = socialIconStylesFixture();
const SOCIAL_LEGACY = socialLegacyStylesFixture();
const AI_OPTIONS = aiOptionsFixture();
const DEMO_BLOCKS = demoBlocksFixture();

const TYPE_ORDER = ["Links", "Media", "Forms", "Shop", "Layout"] as const;

/* ------------------------------------------------------------------ */
/* Pure helpers                                                       */
/* ------------------------------------------------------------------ */
type Content = Record<string, unknown>;
type SocialEntry = { handle: string; iconStyle: string };

const deepClone = <T,>(v: T): T => JSON.parse(JSON.stringify(v));

function defaultsFor(typeId: string): Content {
  const spec = BLOCK_BY_ID[typeId];
  const out: Content = {};
  spec.form({}).forEach((f) => {
    if (f.value !== undefined) out[f.name] = f.value;
  });
  return out;
}

function normaliseHandles(raw: unknown): Record<string, SocialEntry> {
  const out: Record<string, SocialEntry> = {};
  if (!raw || typeof raw !== "object") return out;
  Object.entries(raw as Record<string, unknown>).forEach(([id, val]) => {
    if (typeof val === "string") out[id] = { handle: val, iconStyle: id };
    else if (val && typeof val === "object") {
      const o = val as Partial<SocialEntry>;
      out[id] = { handle: o.handle || "", iconStyle: o.iconStyle || id };
    }
  });
  return out;
}

type FaqItem = { kind: "qa" | "section"; id: string; q?: string; a?: string; title?: string };
function normaliseFaqItems(raw: unknown): FaqItem[] {
  if (Array.isArray(raw)) return raw as FaqItem[];
  return [
    { kind: "qa", id: "fi-1", q: "Where can I buy your music?", a: "Everywhere — Spotify, Apple Music, and Bandcamp. Links are in the buttons above." },
    { kind: "qa", id: "fi-2", q: "Do you do collabs?", a: "Yes! Drop me a line through the newsletter or DM on Instagram." },
  ];
}

/* Icon rendering ---------------------------------------------------- */
function IconSvg({ id, size = 22 }: { id: string; size?: number }) {
  const e = ICON_BY_ID[id];
  if (!e) return null;
  if (e.kind === "brand") {
    return (
      <span style={{ color: e.color, display: "inline-flex" }}>
        <svg viewBox="0 0 24 24" fill="currentColor" width={size} height={size} aria-hidden dangerouslySetInnerHTML={{ __html: e.body }} />
      </span>
    );
  }
  return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden dangerouslySetInnerHTML={{ __html: e.body }} />;
}

function IconForPreview({ value, fallback }: { value?: unknown; fallback?: string }) {
  const v = (value == null ? "" : String(value)).trim();
  if (v && ICON_BY_ID[v]) return <span className="pv-icon"><IconSvg id={v} size={18} /></span>;
  if (v && !/^[a-z][a-z0-9-]*$/.test(v) && v.length <= 4) return <span className="pv-icon" style={{ fontSize: 16 }}>{v}</span>;
  if (fallback && ICON_BY_ID[fallback]) return <span className="pv-icon"><IconSvg id={fallback} size={18} /></span>;
  return null;
}

/* Social variant rendering (brand path + per-style wrapper) --------- */
function socialVariant(variantId: string): { platform: string; styleId: string; name: string; color: string; body: string } | null {
  if (SOCIAL_BY_ID[variantId]) {
    const p = SOCIAL_BY_ID[variantId];
    const brand = ICON_BY_ID[p.id];
    return { platform: p.id, styleId: "brand", name: `${p.name} (brand color)`, color: p.color, body: brand?.body || "" };
  }
  let dash = variantId.indexOf("-");
  while (dash !== -1) {
    const plat = variantId.slice(0, dash);
    const style = variantId.slice(dash + 1);
    if (SOCIAL_BY_ID[plat]) {
      const p = SOCIAL_BY_ID[plat];
      const brand = ICON_BY_ID[p.id];
      const spec = SOCIAL_STYLES.find((s) => s.id === style) || (SOCIAL_LEGACY[p.id] || []).find((l) => l.id === style);
      if (spec) return { platform: p.id, styleId: style, name: `${p.name} (${spec.name.toLowerCase()})`, color: p.color, body: brand?.body || "" };
    }
    dash = variantId.indexOf("-", dash + 1);
  }
  return null;
}

function SocialGlyph({ variantId, size = 28 }: { variantId: string; size?: number }) {
  const v = socialVariant(variantId);
  if (!v) return null;
  const inner = Math.round(size * 0.6);
  const svg = (w: number, color = "currentColor") => (
    <svg viewBox="0 0 24 24" fill={color} width={w} height={w} aria-hidden dangerouslySetInnerHTML={{ __html: v.body }} />
  );
  const flex = { display: "inline-flex", alignItems: "center", justifyContent: "center", width: size, height: size } as const;
  switch (v.styleId) {
    case "brand": return <span style={{ ...flex, color: v.color }}>{svg(size)}</span>;
    case "mono": return <span style={{ ...flex, color: "currentColor" }}>{svg(size)}</span>;
    case "mono-frame": return <span style={{ ...flex, border: "1.5px solid currentColor", borderRadius: "50%", color: "currentColor" }}>{svg(Math.round(size * 0.62))}</span>;
    case "outline": return <span style={{ ...flex, border: `1.5px solid ${v.color}`, borderRadius: "50%", color: v.color }}>{svg(inner)}</span>;
    case "filled-circle": return <span style={{ ...flex, background: v.color, borderRadius: "50%", color: "#fff" }}>{svg(inner)}</span>;
    case "filled-square": return <span style={{ ...flex, background: v.color, borderRadius: Math.max(4, Math.round(size * 0.22)), color: "#fff" }}>{svg(inner)}</span>;
    default: return <span style={{ ...flex, color: v.color }}>{svg(size)}</span>;
  }
}

/* Embed detection -------------------------------------------------- */
type EmbedDetection = { kind: "empty" | "recognized" | "unsupported"; providerLabel?: string; icon?: string };
function detectEmbed(url: string): EmbedDetection {
  const u = (url || "").trim();
  if (!u) return { kind: "empty" };
  for (const p of EMBED_PROVIDERS) {
    if (p.detect.test(u)) return { kind: "recognized", providerLabel: p.label, icon: p.icon };
  }
  return /^https?:\/\//i.test(u) ? { kind: "unsupported" } : { kind: "empty" };
}

/* Countdown -------------------------------------------------------- */
function countdownParts(value: unknown): { d: string; h: string; m: string; s: string; expired: boolean } {
  const raw = (value == null ? "" : String(value)).trim();
  const parsed = raw ? new Date(raw) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return { d: "14", h: "00", m: "00", s: "00", expired: false };
  const diff = parsed.getTime() - Date.now();
  if (diff <= 0) return { d: "00", h: "00", m: "00", s: "00", expired: true };
  let t = Math.floor(diff / 1000);
  const d = Math.floor(t / 86400); t -= d * 86400;
  const h = Math.floor(t / 3600); t -= h * 3600;
  const m = Math.floor(t / 60); const s = t - m * 60;
  return { d: String(d), h: String(h).padStart(2, "0"), m: String(m).padStart(2, "0"), s: String(s).padStart(2, "0"), expired: false };
}

/* ------------------------------------------------------------------ */
/* Block preview renderer (mirrors BLOCK_TYPES[*].preview)            */
/* ------------------------------------------------------------------ */
function BlockPreview({ typeId, s, tick }: { typeId: string; s: Content; tick: number }) {
  void tick; // re-render countdown each second
  const str = (k: string, d = "") => String(s[k] ?? d);
  switch (typeId) {
    case "link":
      return <div className="preview-block"><IconForPreview value={s.icon} fallback="spotify" /> &nbsp; {str("label", "Listen on Spotify")}</div>;
    case "image": {
      const caption = str("caption") || str("alt") || 'Album cover for "Spring Drops"';
      const hasHref = !!String(s.href || "").trim();
      return (
        <div className="preview-image-card">
          <div className="img">🖼</div>
          <div className="content">
            <div className="cap">{caption}</div>
            {hasHref && <a className="cta" href="#" onClick={(e) => e.preventDefault()}>{str("ctaLabel", "Listen now")} →</a>}
          </div>
        </div>
      );
    }
    case "embed": {
      const det = detectEmbed(str("url"));
      if (det.kind !== "recognized") {
        return (
          <div className="preview-embed-empty">
            <div className="pee-icon">🔍</div>
            <div className="pee-msg">{det.kind === "unsupported" ? "Provider not supported — try a Link button instead." : "Paste a URL to see the embed preview."}</div>
          </div>
        );
      }
      return (
        <div className="preview-embed-frame">
          <div className="preview-embed">{det.icon} {det.providerLabel} embed</div>
          {str("caption") && <div className="pef-caption">{str("caption")}</div>}
        </div>
      );
    }
    case "heading": {
      const lvl = str("level", "h2");
      const sizeMap: Record<string, string> = { hero: "32px", h1: "24px", h2: "20px", h3: "16px", p: "13px" };
      const weightMap: Record<string, number> = { hero: 700, h1: 700, h2: 600, h3: 600, p: 400 };
      const align = (str("align", "center")) as React.CSSProperties["textAlign"];
      const lead = s.icon ? <><IconForPreview value={s.icon} /> </> : null;
      if (lvl === "p") return <div className="preview-block compact" style={{ textAlign: align }}>{lead}{str("text", "My latest releases")}</div>;
      return <div className="preview-heading" style={{ fontSize: sizeMap[lvl] || "20px", fontWeight: weightMap[lvl] || 600, textAlign: align }}>{lead}{str("text", "My latest releases")}</div>;
    }
    case "divider": {
      const style = str("style", "line");
      const sz = str("size", "md");
      const colorMap: Record<string, string> = { theme: "var(--border)", indigo: "#6366F1", warm: "#F59E0B", success: "#10B981", warning: "#F59E0B", danger: "#EF4444", "gray-100": "#F3F4F6", "gray-300": "#D1D5DB", "gray-500": "#6B7280", "gray-700": "#374151", "gray-900": "#111827" };
      const raw = str("color", "theme");
      const resolved = /^#[0-9A-Fa-f]{3,8}$/.test(raw) ? raw : colorMap[raw] || "var(--border)";
      const marginMap: Record<string, string> = { sm: "6px 0", md: "12px 0", lg: "20px 0" };
      const spacerMap: Record<string, number> = { sm: 12, md: 24, lg: 40 };
      const thicknessMap: Record<string, number> = { sm: 1, md: 2, lg: 3 };
      if (style === "spacer") return <div className="preview-divider spacer" style={{ height: spacerMap[sz] }} />;
      if (style === "dotted") return <div className="preview-divider dotted" style={{ margin: marginMap[sz], borderTopWidth: thicknessMap[sz], borderTopColor: resolved }} />;
      return <div className="preview-divider" style={{ margin: marginMap[sz], height: thicknessMap[sz], background: resolved }} />;
    }
    case "social": {
      const h = normaliseHandles(s.handles);
      const order = (Array.isArray(s.handlesOrder) ? (s.handlesOrder as string[]) : Object.keys(h)).filter((id) => h[id]);
      if (!order.length) return <div className="preview-social-empty">Add a social platform to see the preview</div>;
      const shape = str("shape", "circle");
      return <div className={`preview-social shape-${shape}`}>{order.map((id) => <span key={id} className="si"><SocialGlyph variantId={h[id].iconStyle || id} size={22} /></span>)}</div>;
    }
    case "newsletter":
      return (
        <div className="preview-form">
          <div className="pf-heading">{str("heading", "Join my list")}</div>
          <div className="pf-subhead">{str("subhead", "No spam — one email a week.")}</div>
          <div className="pf-row">
            <input placeholder={str("placeholder", "you@email.com")} readOnly />
            <button type="button"><IconForPreview value={s.ctaIcon} fallback="send" /> &nbsp;{str("cta", "Subscribe")}</button>
          </div>
        </div>
      );
    case "product":
      return (
        <div className="preview-product">
          <div className="pic" />
          <div className="info"><div className="t">{str("title", "Spring drop merch")}</div>{s.showPrice !== false && <div className="p">{str("price", "$24")}</div>}</div>
          <div className="buy"><IconForPreview value={s.ctaIcon} fallback="shopping-cart" /> {str("cta", "Buy on Shopify")}</div>
        </div>
      );
    case "video":
      return <div className="preview-embed">🎬 {str("provider", "youtube") === "vimeo" ? "Vimeo" : "YouTube"} embed</div>;
    case "accordion": {
      const items = normaliseFaqItems(s.items);
      const qas = items.filter((it) => it.kind === "qa");
      const head = s.sectionIcon ? <div className="faq-section-head"><IconForPreview value={s.sectionIcon} /> FAQ</div> : null;
      if (!qas.length) return <>{head}<div className="preview-faq" style={{ opacity: 0.7 }}>No questions yet — add one in the form above.</div></>;
      const first = qas[0];
      const rest = qas.length - 1;
      const sections = items.filter((it) => it.kind === "section").length;
      return (
        <>
          {head}
          <div className="preview-faq">
            <div className="q">▼ {first.q || "New question"}</div>
            <div className="a">{first.a || "New answer."}</div>
            {rest > 0 && <div className="more">+ {rest} more question{rest === 1 ? "" : "s"}{sections ? ` across ${sections} section${sections === 1 ? "" : "s"}` : ""}</div>}
          </div>
        </>
      );
    }
    case "custom-html": {
      const snippet = str("html", "<div ...>").replace(/\s+/g, " ").slice(0, 80) + "…";
      return <div className="preview-html">{snippet}</div>;
    }
    case "countdown": {
      const parts = countdownParts(s.targetAt);
      const style = str("style", "boxed");
      let note: React.ReactNode = null;
      if (s.scheduleVisibilityEnabled) {
        const starts = str("scheduleStartsAt") ? `from ${str("scheduleStartsAt")}` : "from 7 days before";
        const ends = str("scheduleEndsAt") ? ` to ${str("scheduleEndsAt")}` : "";
        note = <div className="cd-note">Visible {starts}{ends}</div>;
      } else if (s.autoHide === false) {
        note = <div className="cd-note">Auto-hide off · replacement copy: {str("replacementCopy", "Live now!")}</div>;
      }
      const timer = parts.expired && s.autoHide === false
        ? <div className="preview-countdown"><div className="cd-copy">{str("replacementCopy", "Live now!")}</div></div>
        : (
          <div className="preview-countdown">
            {([["d", parts.d], ["h", parts.h], ["m", parts.m], ["s", parts.s]] as const).map(([l, val]) => (
              <div key={l} className="cd-cell"><div className="v">{val}</div><div className="l">{l}</div></div>
            ))}
          </div>
        );
      return (
        <>
          <div className="cd-label">{s.icon ? <><IconForPreview value={s.icon} /> </> : null}{str("label", "Next live in")}</div>
          {timer}
          <div className="cd-note" style={{ marginTop: 0 }}>Style: {style}</div>
          {str("linkLabel") && str("linkUrl") && <a className="cd-link" href="#" onClick={(e) => e.preventDefault()}>{str("linkLabel")} →</a>}
          {note}
        </>
      );
    }
    default:
      return null;
  }
}

/* ================================================================== */
/* Main screen                                                        */
/* ================================================================== */
type AbState = { activeTab: "A" | "B"; previewView: "both" | "A" | "B"; variants: { A: Content; B: Content } };

export function BlockEditorScreen() {
  const navigate = useNavigate();
  const [tier, setTier] = useState<Tier>("creator");
  const [typeId, setTypeId] = useState("link");
  const [visible, setVisible] = useState(true);
  const [base, setBase] = useState<Content>(() => defaultsFor("link"));
  const [ab, setAb] = useState<AbState>(() => {
    const seed = defaultsFor("link");
    return { activeTab: "A", previewView: "both", variants: { A: deepClone(seed), B: deepClone(seed) } };
  });
  const [saveStatus, setSaveStatus] = useState("Last saved 12s ago");
  const [previewOpen, setPreviewOpen] = useState(false);
  const [tick, setTick] = useState(0);

  // sub-modals + popovers
  const [aiTarget, setAiTarget] = useState<{ field?: string; faqId?: string } | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [delInput, setDelInput] = useState("");
  const [openIconPicker, setOpenIconPicker] = useState<string | null>(null);
  const [addSocialOpen, setAddSocialOpen] = useState(false);
  const [stylePickerFor, setStylePickerFor] = useState<string | null>(null);
  const [nltAbTab, setNltAbTab] = useState<"A" | "B">("A");
  const dragId = useRef<string | null>(null);

  const spec = BLOCK_BY_ID[typeId];
  const isBusiness = TIER_RANK[tier] >= TIER_RANK.business;
  const bIsLocked = TIER_RANK[tier] < TIER_RANK.business;

  /* The editor opened from the dashboard — dismissing returns there. */
  const close = () => navigate("/__proto/dashboard");

  /* Content read/write through the active variant (A/B always on). */
  const activeContent = useMemo(() => {
    const variant = ab.variants[ab.activeTab];
    const view: Content = {};
    CONTENT_FIELD_KEYS.forEach((k) => { view[k] = variant[k] !== undefined ? variant[k] : base[k]; });
    return view;
  }, [ab, base]);

  function synthVariant(which: "A" | "B"): Content {
    const variant = ab.variants[which];
    const view: Content = {};
    CONTENT_FIELD_KEYS.forEach((k) => { view[k] = variant[k] !== undefined ? variant[k] : base[k]; });
    return view;
  }

  function writeContent(name: string, value: unknown) {
    setAb((prev) => {
      const next = deepClone(prev);
      next.variants[prev.activeTab][name] = value;
      return next;
    });
    bump();
  }

  const bump = () => setSaveStatus("Unsaved changes");

  /* Diff between A and B (used for chip / win-note / dual preview / diff card). */
  const diffs = useMemo(() => {
    const a = ab.variants.A; const b = ab.variants.B;
    const out: { key: string; a: unknown; b: unknown }[] = [];
    CONTENT_FIELD_KEYS.forEach((k) => {
      const av = a[k] !== undefined ? a[k] : base[k];
      const bv = b[k] !== undefined ? b[k] : base[k];
      if (av === undefined && bv === undefined) return;
      if (JSON.stringify(av) !== JSON.stringify(bv)) out.push({ key: k, a: av, b: bv });
    });
    return out;
  }, [ab, base]);
  const bDiffers = diffs.length > 0;
  const activeIsB = ab.activeTab === "B";

  /* Load a new block type — reseed both variants from fresh defaults. */
  function loadType(t: string) {
    const def = defaultsFor(t);
    setTypeId(t);
    setBase(def);
    setAb({ activeTab: "A", previewView: "both", variants: { A: deepClone(def), B: deepClone(def) } });
    setSaveStatus("Last saved 12s ago");
    setOpenIconPicker(null);
    setAddSocialOpen(false);
    setStylePickerFor(null);
  }

  /* Countdown live ticker. */
  useEffect(() => {
    if (typeId !== "countdown") return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [typeId]);

  /* Esc closes sub-modals first, then the editor. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (openIconPicker) { setOpenIconPicker(null); return; }
      if (aiTarget) { setAiTarget(null); return; }
      if (deleteOpen) { setDeleteOpen(false); return; }
      close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openIconPicker, aiTarget, deleteOpen]);

  /* Field handlers --------------------------------------------------- */
  const setField = (name: string, value: unknown) => writeContent(name, value);

  function applyAi(text: string) {
    if (aiTarget?.faqId) {
      const items = (activeContent.items as FaqItem[] | undefined ?? normaliseFaqItems(activeContent.items)).map((it) => it.id === aiTarget.faqId ? { ...it, a: text } : it);
      writeContent("items", items);
    } else if (aiTarget?.field) {
      writeContent(aiTarget.field, text);
    }
    setAiTarget(null);
  }

  function copyAtoB() { setAb((p) => ({ ...deepClone(p), variants: { A: deepClone(p.variants.A), B: deepClone(p.variants.A) } })); bump(); }
  function resetBtoA() {
    if (bDiffers && !window.confirm("Reset Variant B to match Variant A?\n\nYour current B edits will be lost.")) return;
    copyAtoB();
  }

  function saveBlock() {
    const blockers: string[] = [];
    // Schedule can be set either by the global Schedule-visibility section (into base)
    // or by a block's own schedule field (into the active variant); activeContent
    // merges variant over base, so checking it catches both paths.
    if ((String(activeContent.scheduleStartsAt || "") || String(activeContent.scheduleEndsAt || "")) && TIER_RANK[tier] < TIER_RANK.creator) blockers.push("Schedule visibility (Creator)");
    if (bDiffers && !isBusiness) blockers.push(`A/B testing (Business · ${diffs.length} field${diffs.length === 1 ? "" : "s"})`);
    if (blockers.length) {
      setSaveStatus(`Upgrade needed: ${blockers.join(", ")}`);
      return;
    }
    setSaveStatus("Saved just now");
    setTimeout(() => setSaveStatus("Last saved just now"), 1400);
  }

  function duplicateBlock() {
    setSaveStatus("Duplicated — preview shows new block");
    setTimeout(() => setSaveStatus("Last saved just now"), 1400);
  }

  const delSlug = `delete ${typeId}-${(String(activeContent.label || "block")).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24)}`;

  /* Schedule inputs live at top level (apply to both variants). */
  const [scheduleStart, setScheduleStart] = useState("");
  const [scheduleEnd, setScheduleEnd] = useState("");

  /* ---------------------------------------------------------------- */
  /* Render                                                           */
  /* ---------------------------------------------------------------- */
  return (
    <>
      <DashboardScreen />
      <div className="proto-root proto-block-editor">
        <div
          className="modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="be-title"
          onClick={(e) => { if (e.target === e.currentTarget) close(); }}
        >
          <div className="modal" role="document">
            {/* Header ------------------------------------------------ */}
            <header className="modal-head">
              <span className="type-ic" aria-hidden>{spec.icon}</span>
              <div className="type-meta">
                <div className="lbl">Editing block</div>
                <div className="ttl" id="be-title">{spec.label}</div>
              </div>
              <select className="type-switch" aria-label="Switch block type" value={typeId} onChange={(e) => loadType(e.target.value)}>
                {TYPE_ORDER.map((cat) => {
                  const items = BLOCK_TYPES.filter((b) => b.category === cat);
                  if (!items.length) return null;
                  return <optgroup key={cat} label={cat}>{items.map((b) => <option key={b.id} value={b.id}>{b.icon} {b.label}</option>)}</optgroup>;
                })}
              </select>
              <button className="iconbtn" aria-label="Close editor" title="Close (Esc)" type="button" onClick={close}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
              </button>
            </header>

            <div className="modal-body">
              {/* LEFT COLUMN ---------------------------------------- */}
              <div className="col-form">
                {/* Content section + A/B */}
                <section className="section">
                  <div className="section-head">
                    <h4>Content</h4>
                    <span className="ab-section-chip" data-state={bDiffers ? "active" : "available"} title={bDiffers ? `Variant B differs from A in ${diffs.length} field${diffs.length === 1 ? "" : "s"} — split goes live on save` : "Edit Variant B to start an A/B test — auto-detected at save"}>
                      <span className="dot" aria-hidden />
                      {bDiffers ? `A/B test active · ${diffs.length} field${diffs.length === 1 ? "" : "s"}` : "A/B test available"}
                    </span>
                    <div className="ab-tabs" role="tablist" aria-label="A/B variant tabs">
                      <button type="button" className={`ab-tab${ab.activeTab === "A" ? " is-active" : ""}`} role="tab" aria-selected={ab.activeTab === "A"} onClick={() => setAb((p) => ({ ...p, activeTab: "A" }))}>
                        <span className="ab-tab-pill ab-tab-pill-a">A</span><span className="ab-tab-label">Variant A</span>
                      </button>
                      <button type="button" className={`ab-tab${ab.activeTab === "B" ? " is-active" : ""}${bIsLocked ? " is-locked" : ""}`} role="tab" aria-selected={ab.activeTab === "B"} onClick={() => setAb((p) => ({ ...p, activeTab: "B" }))}>
                        <span className="ab-tab-pill ab-tab-pill-b">B</span><span className="ab-tab-label">Variant B</span>
                        <span className="ab-tab-lock" aria-hidden>🔒 Business</span>
                      </button>
                    </div>
                    <span className="head-spacer" />
                    <div className="toggle-row" style={{ gap: 6, flex: "0 0 auto" }}>
                      <span style={{ fontSize: 11, color: "var(--fg-muted)", fontWeight: 600 }}>Visible</span>
                      <button type="button" className={`switch${visible ? " on" : ""}`} role="switch" aria-checked={visible} aria-label="Block visible" onClick={() => { setVisible((x) => !x); bump(); }} />
                    </div>
                  </div>

                  <div className="ab-edu">
                    <strong>A/B test</strong> — On <strong>Business</strong>, edit Variant B to test two versions of this block. Traffic splits 50/50 and the winner promotes automatically.{" "}
                    {!isBusiness && <span>You can preview the experience now — we&apos;ll prompt to upgrade when you save.</span>}
                  </div>

                  {activeIsB && bIsLocked && (
                    <div className="ab-tier-callout" role="note">
                      <span className="ico" aria-hidden>🔒</span>
                      <div className="body">
                        <div className="ttl">Variant B is part of A/B testing — Business plan</div>
                        <div className="copy">Edit Variant B freely to preview how an A/B test looks. When you save, we&apos;ll prompt to upgrade to <strong>Business</strong> ($49.99/mo) to actually run the 50/50 split.</div>
                        <a className="cta" onClick={(e) => { e.preventDefault(); window.alert("Mockup — would open the upgrade flow for tier: business."); }}>Upgrade to Business →</a>
                      </div>
                    </div>
                  )}

                  {activeIsB && (
                    <div className="ab-helper">
                      <div className="ab-helper-text">Variant B is a copy of A. Edit any field below to make it differ.</div>
                      <div className="ab-helper-actions">
                        <button type="button" className="ab-helper-btn" onClick={copyAtoB}>
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                          Copy A → B
                        </button>
                        <button type="button" className="ab-helper-btn ab-helper-btn-link" onClick={resetBtoA}>Reset B to match A</button>
                      </div>
                    </div>
                  )}

                  <div className="section-body">
                    {spec.form(activeContent).map((f) => (
                      <FieldRenderer
                        key={f.name}
                        f={f}
                        content={activeContent}
                        setField={setField}
                        openAi={(field) => setAiTarget({ field })}
                        openFaqAi={(faqId) => setAiTarget({ faqId })}
                        iconPicker={{ open: openIconPicker, setOpen: setOpenIconPicker }}
                        social={{ addOpen: addSocialOpen, setAddOpen: setAddSocialOpen, styleFor: stylePickerFor, setStyleFor: setStylePickerFor, dragId }}
                        tier={tier}
                        nltAbTab={nltAbTab}
                        setNltAbTab={setNltAbTab}
                      />
                    ))}
                  </div>

                  {bDiffers && (
                    <div className="ab-win-note" role="note">
                      <span className="ico" aria-hidden>📊</span>
                      <span>When you save, traffic will split <strong>50/50</strong> across {diffs.length} differing field{diffs.length === 1 ? "" : "s"}. The winning variant auto-promotes after <strong>7 days or 1,000 clicks</strong>.</span>
                    </div>
                  )}
                </section>

                {/* Mobile preview toggle */}
                <button className={`preview-toggle${previewOpen ? " is-open" : ""}`} type="button" aria-expanded={previewOpen} onClick={() => setPreviewOpen((o) => !o)}>
                  <span>👁 {previewOpen ? "Hide preview" : "Show preview · what visitors see"}</span>
                  <svg className="chev" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                </button>

                {/* Schedule visibility (Creator+) */}
                <section className="section tier-gated" aria-labelledby="be-sched">
                  <div className="section-head">
                    <h4 id="be-sched">Schedule visibility</h4>
                    <TierBadge required="creator" tier={tier} />
                  </div>
                  <div className="section-body">
                    <div className="field-row">
                      <div className="field"><label htmlFor="be-sched-start">Show from</label><input id="be-sched-start" type="datetime-local" value={scheduleStart} onChange={(e) => { setScheduleStart(e.target.value); setBase((b) => ({ ...b, scheduleStartsAt: e.target.value })); bump(); }} /></div>
                      <div className="field"><label htmlFor="be-sched-end">Hide after</label><input id="be-sched-end" type="datetime-local" value={scheduleEnd} onChange={(e) => { setScheduleEnd(e.target.value); setBase((b) => ({ ...b, scheduleEndsAt: e.target.value })); bump(); }} /></div>
                    </div>
                    <div className="help">Leave both empty to keep the block always visible. Useful for limited-time launches.</div>
                    {TIER_RANK[tier] < TIER_RANK.creator && (
                      <div className="tier-hint">Schedule visibility unlocks on <strong>Creator</strong> ($7.99/mo). You can fill in the dates now — we&apos;ll prompt to upgrade when you save. <a onClick={(e) => e.preventDefault()} href="#">See plans →</a></div>
                    )}
                  </div>
                </section>

                {/* Action row */}
                <section className="section" aria-label="Block actions">
                  <div className="action-row">
                    <button type="button" onClick={duplicateBlock}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                      Duplicate
                    </button>
                    <button type="button" className="danger" onClick={() => { setDelInput(""); setDeleteOpen(true); }}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>
                      Delete
                    </button>
                  </div>
                </section>
              </div>

              {/* RIGHT COLUMN --------------------------------------- */}
              <div className={`col-preview${previewOpen ? " is-open" : ""}`}>
                <section className="section" aria-labelledby="be-preview">
                  <div className="section-head">
                    <h4 id="be-preview">Preview · what visitors see</h4>
                    {bDiffers && (
                      <div className="ab-preview-picker" role="tablist" aria-label="Preview which variant">
                        {(["both", "A", "B"] as const).map((pv) => (
                          <button key={pv} type="button" className={ab.previewView === pv ? "is-active" : ""} role="tab" aria-selected={ab.previewView === pv} onClick={() => setAb((p) => ({ ...p, previewView: pv }))}>{pv === "both" ? "Both" : `${pv} only`}</button>
                        ))}
                      </div>
                    )}
                  </div>

                  {!bDiffers ? (
                    <div className={`preview${!visible ? " is-hidden" : ""}`} aria-live="polite">
                      {!visible && <span className="preview-hidden-flag">Hidden</span>}
                      <BlockPreview typeId={typeId} s={synthVariant(ab.activeTab)} tick={tick} />
                    </div>
                  ) : (
                    <>
                      <div className="preview-pair" aria-live="polite">
                        {(["A", "B"] as const).filter((w) => ab.previewView === "both" || ab.previewView === w).map((w) => (
                          <div key={w} className="preview-pair-card">
                            <div className="preview-pair-head">
                              <span className={`ab-tab-pill ab-tab-pill-${w.toLowerCase()}`}>{w}</span>
                              <span className="preview-pair-title">Variant {w} · 50% of visitors{ab.previewView !== "both" ? " · solo view" : ""}</span>
                            </div>
                            <div className={`preview${!visible ? " is-hidden" : ""}`}>
                              {!visible && <span className="preview-hidden-flag">Hidden</span>}
                              <BlockPreview typeId={typeId} s={synthVariant(w)} tick={tick} />
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="ab-diff" aria-live="polite">
                        <div className="ab-diff-head">What&apos;s different between A and B</div>
                        <div className="ab-diff-body">
                          {diffs.length === 0 ? (
                            <div className="ab-diff-empty"><strong>No differences yet.</strong> Switch to <strong>Variant B</strong> and edit a field — the change will appear here.</div>
                          ) : diffs.map((d) => (
                            <div key={d.key} className="ab-diff-row">
                              <div className="ab-diff-field">{AB_DIFF_LABELS[d.key] || d.key}</div>
                              <DiffCell which="A" value={d.a} />
                              <DiffCell which="B" value={d.b} />
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </section>

                {/* Analytics drill-down */}
                <section className="section" aria-labelledby="be-analytics">
                  <div className="section-head">
                    <h4 id="be-analytics">This block&apos;s analytics</h4>
                    {spec.analytics.trending && <span className="trending-pill">↑ Trending</span>}
                  </div>
                  <div className="analytics-tile">
                    <div className="a-cell"><div className="v">{spec.analytics.today}</div><div className="l">today</div></div>
                    <div className="a-cell"><div className="v">{spec.analytics.sevenDay}</div><div className="l">last 7 days</div></div>
                    <div className="a-cell"><div className="v">{spec.analytics.source}</div><div className="l">top source</div></div>
                  </div>
                  <a className="analytics-deep" href="#" onClick={(e) => e.preventDefault()}>
                    View in Insights
                    <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round"><polyline points="9 6 15 12 9 18" /></svg>
                  </a>
                </section>
              </div>
            </div>

            {/* Footer ----------------------------------------------- */}
            <footer className="modal-foot">
              <div className="saved-hint"><b>{saveStatus}</b></div>
              <button className="btn-discard" type="button" onClick={() => loadType(typeId)}>Discard</button>
              <button className="btn-save" type="button" onClick={saveBlock}>Save</button>
            </footer>
          </div>
        </div>

        {/* AI suggest sub-modal */}
        {aiTarget && (
          <div className="submodal-backdrop" role="dialog" aria-modal="true" aria-labelledby="be-ai-h" onClick={(e) => { if (e.target === e.currentTarget) setAiTarget(null); }}>
            <div className="submodal" role="document">
              <div className="submodal-head">
                <span style={{ fontSize: 18 }} aria-hidden>✨</span>
                <h3 id="be-ai-h">AI copy suggestions</h3>
                <button className="iconbtn" type="button" aria-label="Close" onClick={() => setAiTarget(null)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="submodal-body">
                <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 14 }}>
                  Tap a suggestion to apply it to the field. <span style={{ color: "var(--fg-subtle)" }}>{AI_QUOTA_HINT}</span>
                </p>
                {AI_OPTIONS.map((o) => (
                  <button key={o.lbl} className="ai-option" type="button" onClick={() => applyAi(o.text)}>
                    <div className="lbl">{o.lbl}</div>
                    <div>{o.text}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Delete confirm sub-modal */}
        {deleteOpen && (
          <div className="submodal-backdrop" role="dialog" aria-modal="true" aria-labelledby="be-del-h" onClick={(e) => { if (e.target === e.currentTarget) setDeleteOpen(false); }}>
            <div className="submodal" role="document">
              <div className="submodal-head">
                <span style={{ fontSize: 18 }} aria-hidden>🗑</span>
                <h3 id="be-del-h">Delete this block?</h3>
                <button className="iconbtn" type="button" aria-label="Close" onClick={() => setDeleteOpen(false)}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
              <div className="submodal-body">
                <p style={{ fontSize: 13, color: "var(--fg-muted)", marginBottom: 12 }}>This block has <b>{spec.analytics.sevenDay}</b> recorded clicks. The historical data will stay in Insights, but the block will disappear from your page immediately.</p>
                <p style={{ fontSize: 12, color: "var(--fg-muted)", marginBottom: 14 }}>Type <b>{delSlug}</b> to confirm:</p>
                <input className="del-input" type="text" placeholder={delSlug} value={delInput} onChange={(e) => setDelInput(e.target.value)} />
                <div className="del-actions">
                  <button className="btn-discard" type="button" onClick={() => setDeleteOpen(false)}>Cancel</button>
                  <button className="btn-delete" type="button" disabled={delInput !== delSlug} onClick={() => { setDeleteOpen(false); setSaveStatus("Block deleted"); close(); }}>Delete block</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Demo tier toolbar */}
        <div className="demo-toolbar">
          <span className="dt-label">Tier preview</span>
          <div className="dt-btns">
            {(["free", "creator", "pro", "business"] as Tier[]).map((t) => (
              <button key={t} type="button" className={tier === t ? "is-active" : ""} onClick={() => setTier(t)}>{TIER_LABEL[t]}{tier === t ? " ✓" : ""}</button>
            ))}
          </div>
          <div className="dt-tip">Switching tier toggles the inline tier badges + hint copy. The premium UIs stay fully visible and editable on every tier — try clicking <strong>Save</strong> with Variant B edited while on Free to see the tier gate.</div>
        </div>
      </div>
    </>
  );
}

/* ================================================================== */
/* Tier badge                                                         */
/* ================================================================== */
function TierBadge({ required, tier }: { required: Tier; tier: Tier }) {
  const included = TIER_RANK[tier] >= TIER_RANK[required];
  return (
    <span className={`tier-badge ${included ? "included" : "locked"}`} title={included ? `Available on ${TIER_LABEL[required]}+ — included in your plan` : `Available on ${TIER_LABEL[required]} (${TIER_PRICE[required]}). We'll prompt to upgrade when you save.`}>
      {TIER_LABEL[required]}{included ? " ✓" : ""}
    </span>
  );
}

/* ================================================================== */
/* Diff cell                                                          */
/* ================================================================== */
function DiffCell({ which, value }: { which: "A" | "B"; value: unknown }) {
  let display: string;
  let isEmpty = false;
  if (value === undefined || value === null || value === "") { display = "(empty)"; isEmpty = true; }
  else if (typeof value === "boolean") display = value ? "on" : "off";
  else if (Array.isArray(value)) { display = value.length ? value.map((id) => String(id).slice(0, 2)).join(" → ") : "(empty)"; isEmpty = display === "(empty)"; }
  else if (typeof value === "object") {
    const parts = Object.entries(value as Record<string, unknown>).filter(([, v]) => { if (!v) return false; if (typeof v === "string") return v.trim(); return (v as SocialEntry).handle?.trim(); }).map(([k, v]) => { const handle = typeof v === "string" ? v : (v as SocialEntry).handle || ""; return `${k.slice(0, 2)}:${handle}`; });
    display = parts.join(" · ") || "(empty)"; isEmpty = display === "(empty)";
  } else { display = String(value); if (display.length > 64) display = display.slice(0, 61) + "…"; }
  return <div className={`ab-diff-cell${isEmpty ? " is-empty" : ""}`} data-pv={which}>{display}</div>;
}

/* ================================================================== */
/* Field renderer — every field kind                                  */
/* ================================================================== */
type FieldRendererProps = {
  f: FieldDef;
  content: Content;
  setField: (name: string, value: unknown) => void;
  openAi: (field: string) => void;
  openFaqAi: (faqId: string) => void;
  iconPicker: { open: string | null; setOpen: (id: string | null) => void };
  social: { addOpen: boolean; setAddOpen: (b: boolean) => void; styleFor: string | null; setStyleFor: (id: string | null) => void; dragId: React.MutableRefObject<string | null> };
  tier: Tier;
  nltAbTab: "A" | "B";
  setNltAbTab: (t: "A" | "B") => void;
};

function FieldRenderer(props: FieldRendererProps) {
  const { f, content, setField, openAi } = props;
  const id = `be-f-${f.name}`;
  const help = f.help ? <div className="help">{f.help}</div> : null;
  const aiBtn = f.ai ? <button className="ai-btn" type="button" onClick={() => openAi(f.name)}>✨ Suggest</button> : null;

  switch (f.kind) {
    case "text":
    case "url":
      return (
        <div className={`field${f.ai ? " with-ai" : ""}`}>
          <label htmlFor={id}>{f.label}</label>
          <input id={id} type={f.kind === "url" ? "url" : "text"} value={String(f.value ?? "")} onChange={(e) => setField(f.name, e.target.value)} />
          {aiBtn}{help}
        </div>
      );
    case "datetime":
      return <div className="field"><label htmlFor={id}>{f.label}</label><input id={id} type="datetime-local" value={String(f.value ?? "")} onChange={(e) => setField(f.name, e.target.value)} />{help}</div>;
    case "select":
      return (
        <div className="field"><label htmlFor={id}>{f.label}</label>
          <select id={id} value={String(f.value ?? "")} onChange={(e) => setField(f.name, e.target.value)}>{(f.options || []).map((o) => <option key={o[0]} value={o[0]}>{o[1]}</option>)}</select>
          {help}
        </div>
      );
    case "check":
      return (
        <div className="toggle-row" style={{ padding: "6px 0" }}>
          <div className="lbl"><div className="t">{f.label}</div>{f.help && <div className="s">{f.help}</div>}</div>
          <button type="button" className={`switch${f.value ? " on" : ""}`} role="switch" aria-checked={!!f.value} aria-label={f.label} onClick={() => setField(f.name, !f.value)} />
        </div>
      );
    case "link-target": {
      const raw = String(f.value || "");
      const isExt = /^(https?:\/\/|mailto:|tel:)/i.test(raw);
      const display = !raw ? "Choose a page or paste a URL…" : isExt ? raw : `tadaify.com/alexandra${raw}`;
      const tag = !raw ? "Empty" : isExt ? "External" : "Internal";
      return (
        <div className="field">
          <label htmlFor={id}>{f.label}</label>
          <button id={id} type="button" className="ipk-trigger" onClick={() => { const next = window.prompt(`${f.label} — paste a URL or /page path`, raw); if (next != null) setField(f.name, next); }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-subtle)", textTransform: "uppercase" }}>{tag}</span>
            <span className="ipk-name" style={raw ? undefined : { color: "var(--fg-subtle)" }}>{display}</span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--brand-primary)" }}>Edit</span>
          </button>
          {help}
        </div>
      );
    }
    case "thumb":
    case "upload":
      return <div className="field"><label>{f.label}</label><button type="button" className="upload-btn" onClick={() => window.alert("Mockup — file picker would open here.")}>⬆ Click to upload (mockup)</button>{help}</div>;
    case "code":
      return <div className="field"><label htmlFor={id}>{f.label}</label><textarea id={id} rows={6} style={{ fontFamily: "var(--font-mono)", fontSize: 12, lineHeight: 1.5 }} value={String(f.value ?? "")} onChange={(e) => setField(f.name, e.target.value)} />{help}</div>;
    case "icon-picker":
      return <IconPickerField {...props} />;
    case "theme-color-picker":
      return <ThemeColorField {...props} />;
    case "faq-items":
      return <FaqItemsField {...props} />;
    case "social-cards":
      return <SocialCardsField {...props} />;
    case "raw-embed-detect": {
      const det = detectEmbed(String(content.url || ""));
      const cls = det.kind === "recognized" ? "is-recognized" : det.kind === "unsupported" ? "is-unsupported" : "is-empty";
      return (
        <div className="field"><div className={`embed-chip ${cls}`}>
          {det.kind === "empty" && <><span className="ec-icon">🔍</span><span>Paste a URL from Spotify, YouTube, TikTok, or 9 more</span></>}
          {det.kind === "unsupported" && <><span className="ec-icon">❌</span><span>Provider not supported. <button type="button" className="ec-link" onClick={() => window.alert("Mockup — would switch to a Link button.")}>Try a Link button instead →</button></span></>}
          {det.kind === "recognized" && <><span className="ec-icon">{det.icon}</span><span><strong>{det.providerLabel}</strong> detected</span></>}
        </div></div>
      );
    }
    case "raw-embed-providers":
      return <div className="field embed-provider-reminder"><div className="epr-title">Supports embeds from</div><div className="epr-list">{EMBED_PROVIDERS.map((p) => p.label).join(" · ")}</div></div>;
    case "raw-newsletter-provider":
      return <NewsletterProviderPanel content={content} setField={setField} />;
    case "raw-newsletter-schedule":
      return (
        <div className="nlt-section">
          <div className="section-head" style={{ marginBottom: 4 }}><span className="nlt-section-title">Schedule visibility</span><TierBadge required="creator" tier={props.tier} /></div>
          <div className="nlt-section-sub">Show this signup form only during a set window — perfect for limited campaigns.</div>
          <div className="nlt-sched-row">
            <div className="field"><label>Show from</label><input type="datetime-local" value={String(content.scheduleStartsAt || "")} onChange={(e) => setField("scheduleStartsAt", e.target.value)} /></div>
            <div className="field"><label>Hide after</label><input type="datetime-local" value={String(content.scheduleEndsAt || "")} onChange={(e) => setField("scheduleEndsAt", e.target.value)} /></div>
          </div>
        </div>
      );
    case "raw-newsletter-ab": {
      const t = props.nltAbTab;
      return (
        <div className="nlt-section">
          <div className="section-head" style={{ marginBottom: 4 }}><span className="nlt-section-title">A/B test the heading + button</span><TierBadge required="business" tier={props.tier} /></div>
          <div className="nlt-section-sub">Test two headlines and button labels. Traffic splits 50/50; the winner is promoted automatically.</div>
          <div className="nlt-ab-tabs">
            <button type="button" className={`nlt-ab-tab${t === "A" ? " is-active" : ""}`} onClick={() => props.setNltAbTab("A")}>Variant A</button>
            <button type="button" className={`nlt-ab-tab${t === "B" ? " is-active" : ""}`} onClick={() => props.setNltAbTab("B")}>Variant B</button>
          </div>
          <div className="field"><label>Heading (Variant {t})</label><input type="text" value={String(content[`nltAbHeading${t}`] || "")} placeholder="Join my list" onChange={(e) => setField(`nltAbHeading${t}`, e.target.value)} /></div>
          <div className="field" style={{ marginTop: 8 }}><label>Button label (Variant {t})</label><input type="text" value={String(content[`nltAbCta${t}`] || "")} placeholder="Subscribe" onChange={(e) => setField(`nltAbCta${t}`, e.target.value)} /></div>
        </div>
      );
    }
    default:
      return null;
  }
}

/* Icon picker field ------------------------------------------------- */
function IconPickerField({ f, setField, iconPicker }: FieldRendererProps) {
  const pickerId = `ipk-${f.name}`;
  const isOpen = iconPicker.open === pickerId;
  const [cat, setCat] = useState("popular");
  const [q, setQ] = useState("");
  const current = String(f.value || "");
  const entry = ICON_BY_ID[current];
  const legacyEmoji = !entry && current.length > 0 && current.length <= 4 && !/^[a-z][a-z0-9-]*$/.test(current);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    if (!needle && cat === "popular") {
      // Popular is a curated id-list (mockup ICON_POPULAR), in that order.
      return ICON_POPULAR.map((id) => ICON_BY_ID[id]).filter(Boolean);
    }
    return ICONS.filter((i) => {
      if (needle) return i.name.toLowerCase().includes(needle) || i.tags.some((t) => t.includes(needle));
      return i.cat === cat;
    });
  }, [cat, q]);

  return (
    <div className="field">
      <label>{f.label}</label>
      <div className={`ipk${isOpen ? " is-open" : ""}`}>
        <button type="button" className="ipk-trigger" aria-expanded={isOpen} onClick={() => iconPicker.setOpen(isOpen ? null : pickerId)}>
          {entry ? <><span className="ipk-glyph"><IconSvg id={entry.id} size={20} /></span><span className="ipk-name">{entry.name}</span></>
            : legacyEmoji ? <><span className="ipk-glyph" style={{ fontSize: 18 }}>{current}</span><span className="ipk-name">Custom emoji</span></>
            : <><span className="ipk-glyph empty" aria-hidden>＋</span><span className="ipk-name placeholder">Choose an icon</span></>}
          <svg className="ipk-chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
        </button>
        {isOpen && (
          <div className="ipk-pop" role="listbox">
            <div className="ipk-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Search icons by name or tag…" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
            </div>
            <div className="ipk-tabs" role="tablist">
              {ICON_CATEGORIES.map((c) => <button key={c.id} type="button" role="tab" className={`ipk-tab${cat === c.id && !q ? " is-active" : ""}`} onClick={() => { setCat(c.id); setQ(""); }}>{c.label}</button>)}
            </div>
            <div className="ipk-meta"><b>{filtered.length}</b> icon{filtered.length === 1 ? "" : "s"}</div>
            <div className="ipk-grid">
              {filtered.length === 0 ? <div className="ipk-empty">No icons match <b>{q}</b>.</div>
                : filtered.map((i) => (
                  <button key={i.id} type="button" className={`ipk-tile${i.id === current ? " is-selected" : ""}`} title={i.name} onClick={() => { setField(f.name, i.id); iconPicker.setOpen(null); }}><IconSvg id={i.id} size={22} /></button>
                ))}
            </div>
          </div>
        )}
      </div>
      {f.help && <div className="help">{f.help}</div>}
    </div>
  );
}

/* Theme color picker field ----------------------------------------- */
function ThemeColorField({ f, setField }: FieldRendererProps) {
  const current = String(f.value || "theme");
  const swatches: { id: string; name: string; css: string }[] = [
    { id: "theme", name: "Theme default", css: "var(--border)" },
    { id: "indigo", name: "Brand indigo", css: "#6366F1" },
    { id: "warm", name: "Brand warm", css: "#F59E0B" },
    { id: "success", name: "Success", css: "#10B981" },
    { id: "warning", name: "Warning", css: "#F59E0B" },
    { id: "danger", name: "Danger", css: "#EF4444" },
    { id: "gray-100", name: "Gray 100", css: "#F3F4F6" },
    { id: "gray-300", name: "Gray 300", css: "#D1D5DB" },
    { id: "gray-500", name: "Gray 500", css: "#6B7280" },
    { id: "gray-700", name: "Gray 700", css: "#374151" },
    { id: "gray-900", name: "Gray 900", css: "#111827" },
  ];
  const isHex = /^#[0-9A-Fa-f]{3,8}$/.test(current);
  return (
    <div className="field"><label>{f.label}</label>
      <div className="tcp">
        <div className="tcp-row">{swatches.map((s) => <button key={s.id} type="button" className={`tcp-swatch${s.id === current ? " is-selected" : ""}`} title={s.name} aria-label={s.name} style={{ background: s.css }} onClick={() => setField(f.name, s.id)} />)}</div>
        <div className={`tcp-hex${isHex ? " is-selected" : ""}`}>
          <label className="tcp-hex-lbl">Custom hex</label>
          <input type="text" placeholder="#A1B2C3" value={isHex ? current : ""} onChange={(e) => setField(f.name, e.target.value)} />
          {isHex && <span className="tcp-hex-swatch" style={{ background: current }} />}
        </div>
      </div>
      {f.help && <div className="help">{f.help}</div>}
    </div>
  );
}

/* FAQ items field --------------------------------------------------- */
let faqSeq = 100;
function FaqItemsField({ f, setField, openFaqAi }: FieldRendererProps) {
  const items = normaliseFaqItems(f.value);
  const write = (next: FaqItem[]) => setField(f.name, next);
  const update = (idItem: string, field: keyof FaqItem, value: string) => write(items.map((it) => it.id === idItem ? { ...it, [field]: value } : it));
  const move = (idItem: string, dir: number) => { const i = items.findIndex((x) => x.id === idItem); const j = i + dir; if (j < 0 || j >= items.length) return; const copy = items.slice(); [copy[i], copy[j]] = [copy[j], copy[i]]; write(copy); };
  const remove = (idItem: string) => write(items.filter((x) => x.id !== idItem));
  return (
    <div className="field"><label>{f.label}</label>
      <div className="faq-list">
        {items.map((it) => it.kind === "section" ? (
          <div key={it.id} className="faq-row faq-section">
            <button type="button" className="faq-handle" aria-label="Drag handle">⋮⋮</button>
            <div className="faq-section-body"><label className="faq-section-lbl">Section</label><input type="text" value={it.title || ""} placeholder="Section header (e.g. Music, Shop, Contact)" onChange={(e) => update(it.id, "title", e.target.value)} /></div>
            <div className="faq-row-actions"><button type="button" className="faq-mv" onClick={() => move(it.id, -1)} aria-label="Move up">▲</button><button type="button" className="faq-mv" onClick={() => move(it.id, 1)} aria-label="Move down">▼</button><button type="button" className="faq-x" onClick={() => remove(it.id)} aria-label="Remove">✕</button></div>
          </div>
        ) : (
          <div key={it.id} className="faq-row faq-qa">
            <button type="button" className="faq-handle" aria-label="Drag handle">⋮⋮</button>
            <div className="faq-qa-body">
              <label className="faq-sub-lbl">Question</label>
              <input type="text" value={it.q || ""} placeholder="What's your question?" onChange={(e) => update(it.id, "q", e.target.value)} />
              <label className="faq-sub-lbl with-ai-row">Answer <button className="ai-btn ai-btn-inline" type="button" onClick={() => openFaqAi(it.id)}>✨ Suggest</button></label>
              <textarea rows={3} placeholder="Write a clear answer." value={it.a || ""} onChange={(e) => update(it.id, "a", e.target.value)} />
            </div>
            <div className="faq-row-actions"><button type="button" className="faq-mv" onClick={() => move(it.id, -1)} aria-label="Move up">▲</button><button type="button" className="faq-mv" onClick={() => move(it.id, 1)} aria-label="Move down">▼</button><button type="button" className="faq-x" onClick={() => remove(it.id)} aria-label="Remove">✕</button></div>
          </div>
        ))}
      </div>
      <div className="faq-add-row">
        <button type="button" className="faq-add-btn" onClick={() => write([...items, { kind: "qa", id: `fi-${++faqSeq}`, q: "", a: "" }])}>+ Add question</button>
        <button type="button" className="faq-add-btn faq-add-btn-secondary" onClick={() => write([...items, { kind: "section", id: `fi-${++faqSeq}`, title: "" }])}>+ Add section</button>
      </div>
      {f.help && <div className="help">{f.help}</div>}
    </div>
  );
}

/* Social cards field ------------------------------------------------ */
function SocialCardsField({ f, content, setField, social }: FieldRendererProps) {
  const [q, setQ] = useState("");
  const handles = normaliseHandles(content.handles);
  const order = (Array.isArray(content.handlesOrder) ? (content.handlesOrder as string[]) : Object.keys(handles)).filter((id) => handles[id]);

  const writeHandles = (next: Record<string, SocialEntry>, nextOrder: string[]) => { setField("handles", next); setField("handlesOrder", nextOrder); };
  const add = (platformId: string) => { const next = { ...handles, [platformId]: { handle: "", iconStyle: platformId } }; writeHandles(next, [...order, platformId]); social.setAddOpen(false); setQ(""); };
  const removePlatform = (platformId: string) => { const next = { ...handles }; delete next[platformId]; writeHandles(next, order.filter((x) => x !== platformId)); };
  const setHandle = (platformId: string, value: string) => writeHandles({ ...handles, [platformId]: { ...handles[platformId], handle: value } }, order);
  const setStyle = (platformId: string, style: string) => { writeHandles({ ...handles, [platformId]: { ...handles[platformId], iconStyle: style } }, order); social.setStyleFor(null); };

  const candidates = SOCIAL_PLATFORMS.filter((p) => !handles[p.id] && (!q || p.name.toLowerCase().includes(q.toLowerCase())));
  void content;

  const variantsFor = (platformId: string) => {
    const base = SOCIAL_STYLES.map((s) => ({ id: s.id === "brand" ? platformId : `${platformId}-${s.id}`, name: s.name }));
    const legacy = (SOCIAL_LEGACY[platformId] || []).map((l) => ({ id: `${platformId}-${l.id}`, name: l.name }));
    return base.concat(legacy);
  };

  return (
    <div className="field"><label>{f.label}</label>
      <div className="social-cards-toolbar">
        <button type="button" className="add-social-btn" aria-expanded={social.addOpen} onClick={() => social.setAddOpen(!social.addOpen)}>＋ Add social</button>
        <span className="social-cards-count">{order.length} platform{order.length === 1 ? "" : "s"} added</span>
        {social.addOpen && (
          <div className="add-social-pop">
            <div className="add-social-search">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
              <input type="text" placeholder="Search 25+ platforms…" value={q} onChange={(e) => setQ(e.target.value)} autoFocus />
            </div>
            <div className="add-social-list">
              {candidates.length === 0 ? <div className="add-social-empty">No platforms match — all added or no results.</div>
                : candidates.map((p) => <button key={p.id} type="button" className="add-social-row" onClick={() => add(p.id)}><span className="add-social-row-glyph"><SocialGlyph variantId={p.id} size={24} /></span><span className="add-social-row-name">{p.name}</span><span className="add-social-row-cta">Add</span></button>)}
            </div>
          </div>
        )}
      </div>

      {order.length === 0 ? (
        <div className="social-empty"><div className="social-empty-title">No platforms yet</div><div className="social-empty-copy">Click <strong>＋ Add social</strong> to register Instagram, TikTok, YouTube, and 20+ more. Each gets its own handle and icon style.</div></div>
      ) : (
        <div className="social-cards-list">
          {order.map((pid) => {
            const entry = handles[pid];
            const platform = SOCIAL_BY_ID[pid];
            if (!entry || !platform) return null;
            const styleOpen = social.styleFor === pid;
            return (
              <div
                key={pid}
                className="social-card"
                draggable
                onDragStart={() => { social.dragId.current = pid; }}
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => { e.preventDefault(); const from = social.dragId.current; if (!from || from === pid) return; const copy = order.slice(); copy.splice(copy.indexOf(from), 1); copy.splice(copy.indexOf(pid), 0, from); writeHandles(handles, copy); social.dragId.current = null; }}
              >
                <span className="social-card-drag" aria-hidden>⋮⋮</span>
                <div className="social-card-style-trigger" style={{ position: "relative" }}>
                  <button type="button" className="social-style-btn" aria-expanded={styleOpen} onClick={() => social.setStyleFor(styleOpen ? null : pid)}>
                    <SocialGlyph variantId={entry.iconStyle || pid} size={24} />
                    <svg className="ipk-chev" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9" /></svg>
                  </button>
                  {styleOpen && (
                    <div className="social-style-pop">
                      <div className="social-style-pop-head"><strong>{platform.name}</strong> icon style</div>
                      <div className="social-style-grid">
                        {variantsFor(pid).map((vrt) => (
                          <button key={vrt.id} type="button" className={`social-style-tile${(entry.iconStyle || pid) === vrt.id ? " is-selected" : ""}`} onClick={() => setStyle(pid, vrt.id)}>
                            <span className="social-style-tile-glyph"><SocialGlyph variantId={vrt.id} size={28} /></span>
                            <span className="social-style-tile-label">{vrt.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <div className="social-card-body">
                  <span className="social-card-name">{platform.name}</span>
                  <div className="social-card-handle"><span className="social-card-handle-prefix">@</span><input type="text" value={entry.handle.replace(/^@/, "")} placeholder="handle" onChange={(e) => setHandle(pid, e.target.value)} /></div>
                </div>
                <button type="button" className="social-card-remove" aria-label={`Remove ${platform.name}`} onClick={() => removePlatform(pid)}>
                  <svg viewBox="0 0 24 24" width={16} height={16} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                </button>
              </div>
            );
          })}
        </div>
      )}
      {f.help && <div className="help">{f.help}</div>}
    </div>
  );
}

/* Newsletter provider panel ---------------------------------------- */
function NewsletterProviderPanel({ content, setField }: { content: Content; setField: (n: string, v: unknown) => void }) {
  const prov = String(content.provider || "kit");
  if (prov === "google-sheets") {
    const signedIn = !!content.gsheetsSignedIn;
    return (
      <div className="nlt-panel">
        <div className="nlt-panel-title">Google Sheets</div>
        <div className="nlt-panel-sub">New subscribers append as rows to a sheet you own.</div>
        {signedIn
          ? <button type="button" className="nlt-gsheets-signin" onClick={() => setField("gsheetsSignedIn", false)}>✓ Connected as alexandra@gmail.com · Disconnect</button>
          : <button type="button" className="nlt-gsheets-signin" onClick={() => setField("gsheetsSignedIn", true)}>Sign in with Google</button>}
      </div>
    );
  }
  if (prov === "webhook") {
    return (
      <div className="nlt-panel">
        <div className="nlt-panel-title">Generic webhook</div>
        <div className="nlt-panel-sub">We POST each new subscriber as JSON to your endpoint.</div>
        <div className="field"><label>Your webhook URL</label><input type="url" value={String(content.webhookUrl || "")} placeholder="https://example.com/hooks/subscribe" onChange={(e) => setField("webhookUrl", e.target.value)} /></div>
        <div className="nlt-our-endpoint"><code>POST {"{ email, name?, source }"}</code><button type="button" className="nlt-copy-btn" onClick={() => window.alert("Mockup — payload copied.")}>Copy</button></div>
      </div>
    );
  }
  const p = NEWSLETTER_PROVIDERS[prov];
  if (!p) return null;
  return (
    <div className="nlt-panel">
      <div className="nlt-panel-title">{p.name}</div>
      <div className="nlt-panel-sub">{p.apiKeyHelp}</div>
      <div className="field"><label>API key</label><div className="nlt-key-row"><input type="text" value={String(content[`apiKey_${prov}`] || "")} placeholder="••••••••••••" onChange={(e) => setField(`apiKey_${prov}`, e.target.value)} /></div></div>
      <div className="field"><label>Audience / list</label>
        <select value={String(content[`listId_${prov}`] || "")} onChange={(e) => setField(`listId_${prov}`, e.target.value)}>
          <option value="">Choose a list…</option>
          {(p.lists || []).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>
      </div>
    </div>
  );
}
