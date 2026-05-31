/**
 * HomepagePanel — main content area for the /app dashboard, ?tab=page view.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2579-2854
 * (`section.main-page`). Pass 2 of the dashboard mockup-fidelity rework: every
 * element from the mockup is mirrored here with the mockup's exact class names,
 * DOM structure, and inline SVG icons. Styling comes from
 * `app/styles/app-dashboard.css` (scoped under `.app-dashboard-root`), so this
 * component MUST render inside an ancestor that carries that class — see
 * `app/routes/app.tsx`.
 *
 * Out of scope this pass:
 *   - AppAppbar / AppSidebar / LivePreviewPane / AppMobileTabs rewrites
 *   - Real wiring for: copy link telemetry, add-block modal, pinned-message
 *     persistence, profile-edit endpoint, organise dropdown actions,
 *     archive/collection persistence, block analytics, block edit/kebab menus.
 *     These render as visuals + local-state placeholders with TODO comments.
 *
 * AP-001 enforced: no "Powered by tadaify" in rendered output.
 * AP-013 enforced: no phone field.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: AC#7-#12, dashboard mockup-fidelity Pass 2
 */

import { useMemo, useState, type ReactElement } from "react";
import type { OnboardingState } from "~/lib/onboarding-state";
import { LinkBlockEditor } from "~/components/blocks/LinkBlockEditor";
import { BlockEditorCanonical } from "~/components/blocks/BlockEditorCanonical";

export interface Block {
  id: string;
  block_type: string;
  title: string;
  url: string | null;
  is_visible: boolean;
  position: number;
}

interface HomepagePanelProps {
  handle: string;
  displayName: string | null;
  bio: string | null;
  blocks: Block[];
  /**
   * Homepage page id — required for creating new blocks. When null, the
   * Add-link CTA is disabled (the user is still in the interrupted
   * onboarding state and has not provisioned a homepage yet).
   */
  pageId?: string | null;
  onboardingState: OnboardingState;
  welcomeDismissed: boolean;
  onWelcomeDismiss: () => void;
  /** Optional analytics — visits this week, shown in the welcome banner. */
  visitsThisWeek?: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Inline brand / utility SVGs — copied verbatim from the mockup so the visual
// fidelity stays 1:1. Keep these as small self-contained components rather
// than a sprite sheet so a future designer can diff them directly against
// `mockups/tadaify-mvp/app-dashboard.html`.
// ────────────────────────────────────────────────────────────────────────────

function IconCopy() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconPlus({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function IconCamera() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
      <circle cx="12" cy="13" r="4" />
    </svg>
  );
}

function IconPencil() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
    </svg>
  );
}

function IconKebab() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <circle cx="12" cy="5" r="1.5" />
      <circle cx="12" cy="12" r="1.5" />
      <circle cx="12" cy="19" r="1.5" />
    </svg>
  );
}

function IconInstagram() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.2c3.2 0 3.6 0 4.8.1 1.2.1 1.9.2 2.3.4.6.2 1 .5 1.5 1s.8.9 1 1.5c.2.4.3 1.1.4 2.3.1 1.3.1 1.6.1 4.8s0 3.6-.1 4.8c-.1 1.2-.2 1.9-.4 2.3-.2.6-.5 1-1 1.5s-.9.8-1.5 1c-.4.2-1.1.3-2.3.4-1.3.1-1.6.1-4.8.1s-3.6 0-4.8-.1c-1.2-.1-1.9-.2-2.3-.4-.6-.2-1-.5-1.5-1s-.8-.9-1-1.5c-.2-.4-.3-1.1-.4-2.3C2.2 15.6 2.2 15.3 2.2 12s0-3.6.1-4.8c.1-1.2.2-1.9.4-2.3.2-.6.5-1 1-1.5s.9-.8 1.5-1c.4-.2 1.1-.3 2.3-.4 1.2-.1 1.6-.1 4.8-.1zm0 3.1a6.7 6.7 0 1 0 0 13.4 6.7 6.7 0 0 0 0-13.4zm0 11a4.4 4.4 0 1 1 0-8.8 4.4 4.4 0 0 1 0 8.8zm7-11.4a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0z" />
    </svg>
  );
}

function IconTikTok() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M19.3 6.7a5 5 0 0 1-3.6-3.1 5 5 0 0 1-.1-1V2h-3.4v13.6a2.4 2.4 0 1 1-2.4-2.4c.2 0 .5 0 .7.1V9.8a6 6 0 1 0 5.2 5.9V8.3a8.3 8.3 0 0 0 4.8 1.5V6.4c-.4 0-.8 0-1.2-.1z" />
    </svg>
  );
}

function IconYouTube() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.6 3.6 12 3.6 12 3.6s-7.6 0-9.4.5A3 3 0 0 0 .5 6.2 31.5 31.5 0 0 0 0 12a31.5 31.5 0 0 0 .5 5.8 3 3 0 0 0 2.1 2.1c1.8.5 9.4.5 9.4.5s7.6 0 9.4-.5a3 3 0 0 0 2.1-2.1A31.5 31.5 0 0 0 24 12a31.5 31.5 0 0 0-.5-5.8zM9.6 15.6V8.4l6.3 3.6-6.3 3.6z" />
    </svg>
  );
}

function IconX() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M18.9 2H22l-7 8 8.3 12h-6.5l-5-7.3L5.8 22H2.7l7.5-8.6L2 2h6.6l4.6 6.6L18.9 2zm-1 18.1h1.8L7.3 3.8H5.4l12.5 16.3z" />
    </svg>
  );
}

function IconLink() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

function IconLineList() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  );
}

function IconChevronDown({ size = 12 }: { size?: number }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width={size} height={size} aria-hidden="true">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function IconFolder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
      <polyline points="21 8 21 21 3 21 3 8" />
      <rect x="1" y="3" width="22" height="5" />
      <line x1="10" y1="12" x2="14" y2="12" />
    </svg>
  );
}

function IconReorder() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
      <line x1="3" y1="9" x2="21" y2="9" />
      <line x1="3" y1="15" x2="21" y2="15" />
      <path d="M9 3L3 9M9 21l-6-6" />
    </svg>
  );
}

function IconExport() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" width="15" height="15" aria-hidden="true">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10M12 2a15 15 0 0 0-4 10 15 15 0 0 0 4 10" />
    </svg>
  );
}

function IconGrid() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
    </svg>
  );
}

function IconLinkSmall() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
      <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
    </svg>
  );
}

// ────────────────────────────────────────────────────────────────────────────
// Helpers
// ────────────────────────────────────────────────────────────────────────────

/** Map a block_type to its mockup brand class + inline icon. */
function getBlockBrand(blockType: string): { className: string; Icon: () => ReactElement } {
  const t = blockType.toLowerCase();
  if (t.includes("instagram") || t === "ig") return { className: "social-ig", Icon: IconInstagram };
  if (t.includes("tiktok") || t === "tt") return { className: "social-tt", Icon: IconTikTok };
  if (t.includes("youtube") || t === "yt") return { className: "social-yt", Icon: IconYouTube };
  if (t === "x" || t.includes("twitter")) return { className: "social-x", Icon: IconX };
  return { className: "social-link", Icon: IconLink };
}

/** Strip protocol + trailing slash so block rows show `example.com/path`. */
function shortenUrl(url: string | null): string {
  if (!url) return "";
  return url.replace(/^https?:\/\//, "").replace(/\/$/, "");
}

// ────────────────────────────────────────────────────────────────────────────
// Component
// ────────────────────────────────────────────────────────────────────────────

export function HomepagePanel({
  handle,
  displayName,
  bio,
  blocks,
  pageId = null,
  // onboardingState + welcomeDismissed/onDismiss kept on the contract so the
  // parent route doesn't need to change, even though Pass 2 renders the
  // mockup's inline welcome banner (only-ready) instead of WelcomeBanner.
  // The dismissed flag still suppresses the banner across reloads.
  onboardingState: _onboardingState,
  welcomeDismissed,
  onWelcomeDismiss,
  visitsThisWeek = 0,
}: HomepagePanelProps) {
  // ─── Local UI state ───────────────────────────────────────────────────
  // TODO: wire to account_settings.pinned_message
  const [pinnedEnabled, setPinnedEnabled] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState("");
  const [linkEditorOpen, setLinkEditorOpen] = useState(false);
  // Canonical block editor — opens for all 12 block types.
  // The "Add a link" CTA opens this with initialType="link".
  const [canonicalEditorOpen, setCanonicalEditorOpen] = useState(false);

  // Profile editor — toggled by the pencil button. Saves display_name + bio
  // via POST /api/profile (F-PROFILE-SAVE-001). Pronouns has no column yet.
  const [editingProfile, setEditingProfile] = useState(false);
  const [editDisplayName, setEditDisplayName] = useState(displayName ?? "");
  const [editPronouns, setEditPronouns] = useState("");
  const [editBio, setEditBio] = useState(bio ?? "");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Organise dropdown + its two destinations (collection inline + archive).
  const [organiseOpen, setOrganiseOpen] = useState(false);
  const [collectionOpen, setCollectionOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // ─── Derived ──────────────────────────────────────────────────────────
  const hasBlocks = blocks.length > 0;
  // Mockup treats "live" as "blocks exist" — there is no separate publish
  // signal in props here. The route's `isPublished` is independent (handles
  // the appbar chip), but for the sub-row state we follow the mockup contract.
  const published = hasBlocks;

  const avatarInitial = (displayName || handle || "?").charAt(0).toUpperCase();
  const profileUrl = `tadaify.com/${handle}`;
  const fullProfileUrl = `https://${profileUrl}`;

  const visibleBlocks = useMemo(
    () => [...blocks].sort((a, b) => a.position - b.position),
    [blocks],
  );

  // ─── Handlers ─────────────────────────────────────────────────────────
  const copyProfileLink = async () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(fullProfileUrl);
      }
    } catch {
      // Best-effort — clipboard API can be blocked by permissions / SSR.
    }
  };

  // TODO: wire to add-block modal (#56 / #200 follow-up).
  const openAddBlockModal = () => {
    // Placeholder — left as a no-op so callers from buttons compile/render.
  };

  const cancelProfileEdit = () => {
    setEditDisplayName(displayName ?? "");
    setEditPronouns("");
    setEditBio(bio ?? "");
    setProfileError(null);
    setEditingProfile(false);
  };

  // Persist display_name + bio to /api/profile, then reload so the SSR loader
  // re-renders the saved identity (matches the block-save reload pattern).
  // NOTE: pronouns is intentionally not sent — there is no `profiles` column
  // for it yet, so the field stays local-only until a migration adds storage.
  const saveProfileEdit = async () => {
    setSavingProfile(true);
    setProfileError(null);
    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          display_name: editDisplayName,
          bio: editBio,
        }),
      });
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setProfileError(data?.error ?? "Couldn't save — please try again.");
        return;
      }
      setEditingProfile(false);
      if (typeof window !== "undefined") window.location.reload();
    } catch {
      setProfileError("Couldn't save — please try again.");
    } finally {
      setSavingProfile(false);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────
  return (
    <section
      className="main-page"
      data-testid="homepage-panel"
      aria-labelledby="page-title"
    >
      {/* ── 1. Page head ─────────────────────────────────────────────── */}
      <div className="page-head">
        <div>
          <h1 id="page-title" data-testid="page-head-title">My page</h1>
          <div className="sub">
            <span id="blocks-summary" data-testid="page-head-blocks-summary">
              {blocks.length} block{blocks.length === 1 ? "" : "s"}
            </span>
            <span className="dot" />
            {hasBlocks ? (
              <span className="only-ready" data-testid="page-head-state-ready">
                Live · updated just now
              </span>
            ) : (
              <span className="only-empty" data-testid="page-head-state-empty">
                Not live yet — add a block to go live
              </span>
            )}
          </div>
        </div>
        <div className="actions">
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            data-testid="page-head-actions-copy-link"
            onClick={copyProfileLink}
          >
            <IconCopy />
            Copy link
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            data-testid="page-head-actions-add-block"
            onClick={openAddBlockModal}
          >
            <IconPlus />
            Add block
          </button>
        </div>
      </div>

      {/* ── 2. Welcome banner (only-ready) ───────────────────────────── */}
      {hasBlocks && published && !welcomeDismissed && (
        <div className="welcome-banner only-ready" data-testid="welcome-banner">
          <span className="wb-ic" data-testid="welcome-banner-celebration">🎉</span>
          <div className="wb-body">
            <b>Your page is live.</b> Share{" "}
            <a
              href={fullProfileUrl}
              style={{ color: "var(--brand-primary)", fontWeight: 500 }}
            >
              {profileUrl}
            </a>{" "}
            on your socials — you had {visitsThisWeek} visit
            {visitsThisWeek === 1 ? "" : "s"} this week.
          </div>
          <button
            type="button"
            className="wb-close"
            aria-label="Dismiss"
            onClick={onWelcomeDismiss}
          >
            ✕
          </button>
        </div>
      )}

      {/* ── 3. Pinned message row ────────────────────────────────────── */}
      {/* TODO: wire to account_settings.pinned_message */}
      <div
        id="pinned-msg-row"
        data-testid="pinned-msg-row"
        style={{
          marginTop: 16,
          marginBottom: 4,
          padding: "10px 14px",
          background: "rgba(99,102,241,0.06)",
          border: "1px solid rgba(99,102,241,0.15)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            cursor: "pointer",
            flexShrink: 0,
          }}
        >
          <span
            className={`toggle${pinnedEnabled ? " on" : ""}`}
            id="pinned-toggle"
            role="switch"
            aria-checked={pinnedEnabled}
            tabIndex={0}
            onClick={() => setPinnedEnabled((v) => !v)}
            onKeyDown={(e) => {
              if (e.key === " " || e.key === "Enter") {
                e.preventDefault();
                setPinnedEnabled((v) => !v);
              }
            }}
            data-testid="pinned-toggle"
            style={{ flexShrink: 0 }}
          />
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
            Pinned message
          </span>
        </label>
        <div
          id="pinned-input-wrap"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}
        >
          <input
            type="text"
            id="pinned-msg-input"
            maxLength={80}
            placeholder="e.g. New course Friday — set a reminder? 📣"
            value={pinnedMsg}
            onChange={(e) => setPinnedMsg(e.target.value)}
            data-testid="pinned-msg-input"
            style={{
              flex: 1,
              fontFamily: "var(--font-sans)",
              fontSize: 13,
              padding: "6px 10px",
              border: "1px solid var(--border-strong)",
              borderRadius: 7,
              background: "var(--bg-elevated)",
              color: "var(--fg)",
              minWidth: 0,
            }}
          />
          <span
            id="pinned-char"
            style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}
          >
            {80 - pinnedMsg.length}
          </span>
        </div>
        <span style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}>
          Dismissible by visitor
        </span>
      </div>

      {/* ── 4. Profile card ──────────────────────────────────────────── */}
      <div className="profile-card" id="profile-card" data-testid="profile-card">
        <div className="pc-av-wrap">
          <div className="pc-av" data-tip="Change avatar" aria-hidden="true">
            {avatarInitial}
          </div>
          <div className="pc-av-cam" aria-hidden="true">
            <IconCamera />
          </div>
        </div>
        <div className="pc-body">
          <div className="pc-head">
            <div className="pc-name" id="pc-name" data-testid="profile-card-name">
              {displayName || `@${handle}`}
            </div>
            <span className="chip verified" data-tip="Handle verified">
              ✓ verified
            </span>
          </div>
          <div className="pc-bio" id="pc-bio" data-testid="profile-card-bio">
            {bio || "No bio yet — edit your profile to add one."}
          </div>
          <div className="pc-handle">{profileUrl}</div>
          <div className="pc-socials">
            <button
              type="button"
              className="pc-social social-ig"
              data-tip={`Instagram @${handle}`}
              data-testid="profile-card-social-ig"
              onClick={openAddBlockModal}
              aria-label="Instagram"
            >
              <IconInstagram />
            </button>
            <button
              type="button"
              className="pc-social social-tt"
              data-tip={`TikTok @${handle}`}
              data-testid="profile-card-social-tt"
              onClick={openAddBlockModal}
              aria-label="TikTok"
            >
              <IconTikTok />
            </button>
            <button
              type="button"
              className="pc-social social-yt"
              data-tip={`YouTube @${handle}`}
              data-testid="profile-card-social-yt"
              onClick={openAddBlockModal}
              aria-label="YouTube"
            >
              <IconYouTube />
            </button>
            <button
              type="button"
              className="pc-social social-x"
              data-tip={`X @${handle}`}
              data-testid="profile-card-social-x"
              onClick={openAddBlockModal}
              aria-label="X"
            >
              <IconX />
            </button>
            <button
              type="button"
              className="pc-social-add"
              data-tip="Add another social"
              data-testid="profile-card-social-add"
              onClick={openAddBlockModal}
              aria-label="Add social"
            >
              +
            </button>
          </div>
        </div>
        <button
          type="button"
          className="pc-edit"
          data-testid="profile-card-edit"
          onClick={() => setEditingProfile((v) => !v)}
          aria-expanded={editingProfile}
        >
          <IconPencil />
          <span>Edit</span>
        </button>

        {/* Inline editor — flex-basis:100% lives in app-dashboard.css */}
        <div
          className="profile-editor"
          data-testid="profile-editor"
          style={{ display: editingProfile ? undefined : "none" }}
        >
          <div className="pe-row">
            <div className="field">
              <label htmlFor="pe-name">Display name</label>
              <input
                id="pe-name"
                type="text"
                value={editDisplayName}
                onChange={(e) => setEditDisplayName(e.target.value)}
              />
            </div>
            <div className="field">
              <label htmlFor="pe-pronouns">Pronouns (optional)</label>
              <input
                id="pe-pronouns"
                type="text"
                placeholder="she / her"
                value={editPronouns}
                onChange={(e) => setEditPronouns(e.target.value)}
              />
            </div>
          </div>
          <div className="field">
            <div className="row-sp">
              <label htmlFor="pe-bio">Bio</label>
              <span className="counter" id="pe-counter">
                {editBio.length} / 80
              </span>
            </div>
            <textarea
              id="pe-bio"
              maxLength={80}
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
            />
          </div>
          {profileError ? (
            <p className="pe-error" role="alert" data-testid="profile-editor-error">
              {profileError}
            </p>
          ) : null}
          <div className="pe-actions">
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={cancelProfileEdit}
              disabled={savingProfile}
              data-testid="profile-editor-cancel"
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={saveProfileEdit}
              disabled={savingProfile}
              data-testid="profile-editor-save"
            >
              {savingProfile ? "Saving…" : "Save changes"}
            </button>
          </div>
        </div>
      </div>

      {/* ── 5. Quick chips (only-ready) ──────────────────────────────── */}
      {hasBlocks && (
        <div className="quick-chips only-ready" data-testid="quick-chips">
          <div
            style={{ position: "relative", display: "inline-block" }}
            id="organise-wrap"
          >
            <button
              type="button"
              className="qchip"
              id="organise-btn"
              data-testid="organise-btn"
              aria-expanded={organiseOpen}
              onClick={() => setOrganiseOpen((v) => !v)}
            >
              <IconLineList />
              Organise…
              <IconChevronDown />
            </button>
            <div
              id="organise-menu"
              data-testid="organise-menu"
              style={{
                display: organiseOpen ? "block" : "none",
                position: "absolute",
                top: "calc(100% + 6px)",
                left: 0,
                zIndex: 80,
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 10,
                boxShadow: "0 8px 24px rgba(0,0,0,.12)",
                padding: 4,
                minWidth: 172,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  setOrganiseOpen(false);
                  setCollectionOpen((v) => !v);
                }}
                style={organiseMenuItemStyle}
              >
                <IconFolder />
                Group into collection
              </button>
              <button
                type="button"
                onClick={() => {
                  setOrganiseOpen(false);
                  setArchiveOpen((v) => !v);
                }}
                style={organiseMenuItemStyle}
              >
                <IconArchive />
                Archive{" "}
                <span style={{ color: "var(--fg-muted)", fontWeight: 400 }}>(2)</span>
              </button>
              <button
                type="button"
                onClick={() => setOrganiseOpen(false)}
                style={organiseMenuItemStyle}
              >
                <IconReorder />
                Reorder
              </button>
              <button
                type="button"
                onClick={() => setOrganiseOpen(false)}
                style={organiseMenuItemStyle}
              >
                <IconExport />
                Export blocks
              </button>
            </div>
          </div>
          <button
            type="button"
            className="qchip"
            data-testid="share-page-chip"
            onClick={openAddBlockModal}
          >
            <IconShare />
            Share page
          </button>
        </div>
      )}

      {/* ── 6. Collection inline + archive list ──────────────────────── */}
      {collectionOpen && (
        <div
          className="collection-inline"
          id="collection-inline"
          data-testid="collection-inline"
          style={{ display: "flex" }}
        >
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ color: "var(--brand-primary)" }}
            aria-hidden="true"
          >
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <input type="text" placeholder="Collection name (e.g. 'Latest drops')" />
          <button
            type="button"
            className="btn btn-ghost btn-sm"
            onClick={() => setCollectionOpen(false)}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn-primary btn-sm"
            onClick={() => setCollectionOpen(false)}
          >
            Create
          </button>
        </div>
      )}
      {archiveOpen && (
        <div
          className="archive-list"
          id="archive-list"
          data-testid="archive-list"
          style={{ display: "block" }}
        >
          <h4>Archived blocks (2)</h4>
          <div className="archive-row">
            <span className="ar-ic">FB</span>
            <div>
              <div style={{ color: "var(--fg)", fontWeight: 500 }}>
                Follow me on Facebook
              </div>
              <div style={{ fontSize: "11.5px" }}>Archived 3 weeks ago</div>
            </div>
            <span className="spacer" />
            <button type="button">Restore</button>
          </div>
          <div className="archive-row">
            <span className="ar-ic">SP</span>
            <div>
              <div style={{ color: "var(--fg)", fontWeight: 500 }}>
                My Spotify playlist
              </div>
              <div style={{ fontSize: "11.5px" }}>Archived 2 months ago</div>
            </div>
            <span className="spacer" />
            <button type="button">Restore</button>
          </div>
        </div>
      )}

      {/* ── 7. Ready-state blocks list ───────────────────────────────── */}
      {hasBlocks && (
        <div className="only-ready">
          <div className="section-label">Blocks</div>
          <section
            className="blocks"
            aria-label="Page blocks"
            id="blocks-list"
            data-testid="blocks-list"
          >
            {visibleBlocks.map((block) => {
              const { className: brandClass, Icon } = getBlockBrand(block.block_type);
              return (
                <div
                  key={block.id}
                  className="block"
                  data-block={block.block_type}
                  data-testid={`block-row-${block.id}`}
                >
                  <span className="grip" title="Drag to reorder" aria-hidden="true">
                    ⋮⋮
                  </span>
                  <span className={`ic ${brandClass}`} aria-hidden="true">
                    <Icon />
                  </span>
                  <div className="meta">
                    <div className="t">{block.title || "Untitled block"}</div>
                    <div className="u">{shortenUrl(block.url)}</div>
                  </div>
                  <div className="stat">
                    <b>0</b>clicks · 7d
                  </div>
                  <div className="tools">
                    <span
                      className={`toggle${block.is_visible ? " on" : ""}`}
                      data-tip={
                        block.is_visible ? "Live — click to hide" : "Hidden — click to show"
                      }
                      role="switch"
                      aria-checked={block.is_visible}
                      aria-label="Toggle block visibility"
                    />
                    <button type="button" className="iconbtn" data-tip="Edit block" aria-label="Edit block">
                      <IconPencil />
                    </button>
                    <button type="button" className="iconbtn" data-tip="More" aria-label="More options">
                      <IconKebab />
                    </button>
                  </div>
                </div>
              );
            })}
            <button
              type="button"
              className="add-block"
              data-testid="add-block-cta"
              onClick={() => pageId && setLinkEditorOpen(true)}
              disabled={!pageId}
              aria-label={pageId ? "Add a block" : "Add a block (finish onboarding first)"}
            >
              <IconPlus />
              Add a block
            </button>
          </section>
        </div>
      )}

      {/* ── 8. Empty-state cards (only-empty) ────────────────────────── */}
      {!hasBlocks && (
        <div className="only-empty">
          <div className="section-label">Get started</div>
          <div className="empty-cards" data-testid="empty-state-cards">
            <button
              type="button"
              className="empty-card"
              data-testid="empty-state-add-link"
              onClick={() => pageId && setLinkEditorOpen(true)}
              disabled={!pageId}
            >
              <span className="ec-ic">
                <IconLinkSmall />
              </span>
              <div className="ec-title">Add a link</div>
              <div className="ec-body">
                Your newsletter, portfolio, merch — anything with a URL.
              </div>
            </button>
            <button
              type="button"
              className="empty-card"
              data-testid="empty-state-connect-social"
              onClick={openAddBlockModal}
            >
              <span className="ec-ic">
                <IconGlobe />
              </span>
              <div className="ec-title">Connect a social</div>
              <div className="ec-body">
                Drop your @handle — we auto-style an Instagram, TikTok or YouTube card.
              </div>
            </button>
            <button
              type="button"
              className="empty-card"
              data-testid="empty-state-pick-template"
              onClick={openAddBlockModal}
            >
              <span className="ec-ic">
                <IconGrid />
              </span>
              <div className="ec-title">Pick a template</div>
              <div className="ec-body">
                Creator, musician, coach, shop — pre-filled layouts you can tweak.
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Link block editor (backward-compat shim) — still wired for POST /api/blocks.
          New code should open BlockEditorCanonical instead. */}
      {pageId ? (
        <LinkBlockEditor
          open={linkEditorOpen}
          onOpenChange={setLinkEditorOpen}
          pageId={pageId}
          onSaved={() => {
            // Slice A doesn't optimistically merge the new block into the
            // local list — the dashboard reloads from SSR on next nav. A
            // future slice (live-preview parity) will hot-swap without reload.
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      ) : null}

      {/* Canonical block editor — full 12-type editor per tadaify-app#52.
          Wired from "Add a link" CTA and other entry points via initialType="link".
          Save is currently stubbed (TODO: wire to POST/PATCH /api/blocks). */}
      {pageId ? (
        <BlockEditorCanonical
          open={canonicalEditorOpen}
          onOpenChange={setCanonicalEditorOpen}
          initialType="link"
          pageId={pageId}
          onSaved={() => {
            if (typeof window !== "undefined") {
              window.location.reload();
            }
          }}
        />
      ) : null}
    </section>
  );
}

// ─── Inline styles shared by the organise dropdown menu items ─────────────
const organiseMenuItemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: 10,
  width: "100%",
  padding: "9px 12px",
  border: 0,
  background: "transparent",
  color: "var(--fg)",
  fontSize: "13.5px",
  fontWeight: 500,
  borderRadius: 7,
  cursor: "pointer",
  textAlign: "left",
  fontFamily: "var(--font-sans)",
};
