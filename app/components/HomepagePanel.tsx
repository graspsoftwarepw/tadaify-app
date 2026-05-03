/**
 * HomepagePanel — main content area for the /app dashboard, ?tab=page view.
 *
 * Visual contract: mockups/tadaify-mvp/app-dashboard.html lines ~2576-2856.
 *
 * Contains:
 *   - Page title row ("My page" heading + "Organise…" dropdown — visual only)
 *   - Pinned message primitive (toggle ON/OFF)
 *   - Profile card (avatar, name, bio, social handles row + edit-pencil visual)
 *   - Blocks list (drag-handle, icon, label, URL, toggle, menu — VISUAL only, actions #26b)
 *   - "Add block" CTA (placeholder modal trigger — visual only)
 *   - Empty-state quick-start cards (visible when blocks.count=0)
 *   - WelcomeBanner (managed by parent /app route, passed as prop)
 *
 * AP-001 enforced: no "Powered by tadaify" in rendered output.
 * AP-013 enforced: no phone field.
 *
 * Story: F-APP-DASHBOARD-001a (#171)
 * Covers: AC#7-#12, Visual checklist homepage panel items
 */

import { useState } from "react";
import { WelcomeBanner } from "~/components/WelcomeBanner";
import type { OnboardingState } from "~/lib/onboarding-state";

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
  onboardingState: OnboardingState;
  welcomeDismissed: boolean;
  onWelcomeDismiss: () => void;
}

export function HomepagePanel({
  handle,
  displayName,
  bio,
  blocks,
  onboardingState,
  welcomeDismissed,
  onWelcomeDismiss,
}: HomepagePanelProps) {
  const [pinnedEnabled, setPinnedEnabled] = useState(false);
  const [pinnedMsg, setPinnedMsg] = useState("");

  const hasBlocks = blocks.length > 0;
  const avatarInitial = (displayName || handle || "?").charAt(0).toUpperCase();

  return (
    <section
      data-testid="homepage-panel"
      aria-labelledby="page-title"
      style={{ padding: "24px 28px", maxWidth: 680, flex: 1 }}
    >
      {/* Page title row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          marginBottom: 20,
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            id="page-title"
            style={{ fontSize: 22, fontWeight: 700, color: "var(--fg)", margin: 0 }}
          >
            My page
          </h1>
          <div style={{ fontSize: 12.5, color: "var(--fg-muted)", marginTop: 3 }}>
            {hasBlocks ? (
              <>
                <span>{blocks.length} block{blocks.length !== 1 ? "s" : ""}</span>
                <span style={{ margin: "0 6px" }}>·</span>
                <span>Not yet published — add more blocks</span>
              </>
            ) : (
              <span>No blocks yet — add your first block to publish</span>
            )}
          </div>
        </div>

        {/* Organise… dropdown — visual only */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 12px",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            color: "var(--fg)",
          }}
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
            aria-hidden="true"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
          Organise…
        </button>
      </div>

      {/* Welcome banner */}
      <WelcomeBanner
        onboardingState={onboardingState}
        handle={handle}
        dismissed={welcomeDismissed}
        onDismiss={onWelcomeDismiss}
      />

      {/* Pinned message primitive (DEC-PINNED-MSG-01) */}
      <div
        style={{
          marginBottom: 16,
          padding: "10px 14px",
          background: "rgba(99, 102, 241, 0.04)",
          border: "1px solid rgba(99, 102, 241, 0.12)",
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
          {/* Toggle */}
          <button
            type="button"
            role="switch"
            aria-checked={pinnedEnabled}
            onClick={() => setPinnedEnabled((v) => !v)}
            style={{
              width: 32,
              height: 18,
              borderRadius: 9,
              background: pinnedEnabled ? "var(--brand-primary)" : "var(--border-strong)",
              border: "none",
              cursor: "pointer",
              position: "relative",
              transition: "background .15s",
              flexShrink: 0,
            }}
          >
            <span
              style={{
                position: "absolute",
                top: 2,
                left: pinnedEnabled ? 16 : 2,
                width: 14,
                height: 14,
                borderRadius: "50%",
                background: "#fff",
                transition: "left .15s",
                boxShadow: "0 1px 2px rgba(0,0,0,.2)",
              }}
            />
          </button>
          <span style={{ fontSize: 13, fontWeight: 600, color: "var(--fg)" }}>
            Pinned message
          </span>
        </label>

        {pinnedEnabled && (
          <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 6 }}>
            <input
              type="text"
              maxLength={80}
              placeholder="e.g. New course Friday — set a reminder? 📣"
              value={pinnedMsg}
              onChange={(e) => setPinnedMsg(e.target.value)}
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
            <span style={{ fontSize: 11, color: "var(--fg-subtle)", flexShrink: 0 }}>
              {80 - pinnedMsg.length}
            </span>
          </div>
        )}

        {!pinnedEnabled && (
          <span style={{ fontSize: 12, color: "var(--fg-subtle)" }}>
            Toggle to add a dismissible message above your profile
          </span>
        )}
      </div>

      {/* Profile card */}
      <div
        data-testid="profile-card"
        style={{
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
          padding: "16px",
          background: "var(--bg-elevated)",
          border: "1px solid var(--border)",
          borderRadius: 12,
          marginBottom: 20,
          flexWrap: "wrap",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: "50%",
            background: "var(--brand-primary)",
            color: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            flexShrink: 0,
          }}
          aria-hidden="true"
        >
          {avatarInitial}
        </div>

        {/* Profile body */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <span
              style={{ fontSize: 15, fontWeight: 700, color: "var(--fg)" }}
              data-testid="profile-display-name"
            >
              {displayName || `@${handle}`}
            </span>
            <span
              style={{
                fontSize: 11,
                background: "rgba(99,102,241,0.1)",
                color: "var(--brand-primary)",
                borderRadius: 8,
                padding: "2px 6px",
                fontWeight: 600,
              }}
            >
              ✓ verified
            </span>
          </div>
          {bio ? (
            <p
              style={{
                margin: "4px 0 6px",
                fontSize: 13.5,
                color: "var(--fg-muted)",
                lineHeight: 1.5,
              }}
              data-testid="profile-bio"
            >
              {bio}
            </p>
          ) : (
            <p
              style={{
                margin: "4px 0 6px",
                fontSize: 13,
                color: "var(--fg-subtle)",
                fontStyle: "italic",
              }}
            >
              No bio yet — edit your profile to add one
            </p>
          )}
          <div
            style={{ fontSize: 12.5, color: "var(--fg-muted)" }}
          >
            tadaify.com/{handle}
          </div>
          {/* Social handles row — visual placeholder */}
          <div
            style={{ display: "flex", gap: 6, marginTop: 8, flexWrap: "wrap" }}
            data-testid="profile-socials"
          />
        </div>

        {/* Edit button — visual only (action = #26b) */}
        <button
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 5,
            padding: "6px 12px",
            background: "var(--bg-muted)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 13,
            cursor: "pointer",
            color: "var(--fg-muted)",
            flexShrink: 0,
          }}
        >
          <svg
            width="13"
            height="13"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 20h9" />
            <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
          </svg>
          Edit
        </button>
      </div>

      {/* Blocks list (ready state) — visual only (actions = #26b) */}
      {hasBlocks && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-muted)",
              marginBottom: 8,
            }}
          >
            Blocks
          </div>
          <div
            data-testid="blocks-list"
            aria-label="Page blocks"
            style={{ display: "flex", flexDirection: "column", gap: 4 }}
          >
            {blocks.map((block) => (
              <div
                key={block.id}
                data-testid={`block-row-${block.id}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 12px",
                  background: "var(--bg-elevated)",
                  border: "1px solid var(--border)",
                  borderRadius: 10,
                }}
              >
                {/* Drag handle — visual only */}
                <span
                  style={{ color: "var(--fg-subtle)", cursor: "grab", flexShrink: 0 }}
                  aria-hidden="true"
                >
                  ⋮⋮
                </span>

                {/* Block icon placeholder */}
                <span
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: 6,
                    background: "var(--bg-muted)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: "var(--fg-muted)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                >
                  {block.block_type.slice(0, 2).toUpperCase()}
                </span>

                {/* Block meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13.5,
                      fontWeight: 500,
                      color: "var(--fg)",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {block.title || "Untitled block"}
                  </div>
                  {block.url && (
                    <div
                      style={{
                        fontSize: 12,
                        color: "var(--fg-muted)",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {block.url}
                    </div>
                  )}
                </div>

                {/* On/off toggle — visual only */}
                <div
                  style={{
                    width: 28,
                    height: 16,
                    borderRadius: 8,
                    background: block.is_visible ? "var(--brand-primary)" : "var(--border-strong)",
                    flexShrink: 0,
                  }}
                  aria-hidden="true"
                />

                {/* Edit + More buttons — visual only */}
                <button
                  type="button"
                  aria-label="Edit block"
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "var(--fg-muted)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.1 2.1 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                  </svg>
                </button>
                <button
                  type="button"
                  aria-label="More options"
                  style={{
                    width: 28,
                    height: 28,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    background: "transparent",
                    border: "1px solid transparent",
                    borderRadius: 6,
                    cursor: "pointer",
                    color: "var(--fg-muted)",
                  }}
                >
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="5" r="1.5" />
                    <circle cx="12" cy="12" r="1.5" />
                    <circle cx="12" cy="19" r="1.5" />
                  </svg>
                </button>
              </div>
            ))}
          </div>

          {/* Add block CTA */}
          <button
            type="button"
            data-testid="add-block-cta"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              width: "100%",
              padding: "12px",
              marginTop: 8,
              background: "transparent",
              border: "1.5px dashed var(--border-strong)",
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 500,
              cursor: "pointer",
              color: "var(--fg-muted)",
            }}
          >
            <svg
              width="15"
              height="15"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Add a block
          </button>
        </div>
      )}

      {/* Empty state quick-start cards (visible when blocks.count=0) */}
      {!hasBlocks && (
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "var(--fg-muted)",
              marginBottom: 12,
            }}
          >
            Get started
          </div>
          <div
            data-testid="empty-state-cards"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
              gap: 12,
            }}
          >
            {/* Add a link */}
            <button
              type="button"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 16px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--bg-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" />
                  <path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
                  Add a link
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4, lineHeight: 1.4 }}>
                  Your newsletter, portfolio, merch — anything with a URL.
                </div>
              </div>
            </button>

            {/* Connect a social */}
            <button
              type="button"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 16px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--bg-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="9" />
                  <path d="M2 12h20M12 2a15 15 0 0 1 4 10 15 15 0 0 1-4 10M12 2a15 15 0 0 0-4 10 15 15 0 0 0 4 10" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
                  Connect a social
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4, lineHeight: 1.4 }}>
                  Drop your @handle — we auto-style an Instagram, TikTok or YouTube card.
                </div>
              </div>
            </button>

            {/* Pick a template */}
            <button
              type="button"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 10,
                padding: "20px 16px",
                background: "var(--bg-elevated)",
                border: "1px solid var(--border)",
                borderRadius: 12,
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              <span
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "var(--bg-muted)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--brand-primary)",
                }}
                aria-hidden="true"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </span>
              <div>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: "var(--fg)" }}>
                  Pick a template
                </div>
                <div style={{ fontSize: 12, color: "var(--fg-muted)", marginTop: 4, lineHeight: 1.4 }}>
                  Creator, musician, coach, shop — pre-filled layouts you can tweak.
                </div>
              </div>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
